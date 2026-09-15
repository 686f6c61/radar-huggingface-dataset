# tinyopsec/Skywork-OR1-7B-GGUF

## Resumen

Skywork-OR1-7B-GGUF es la versión cuantizada en formato GGUF del modelo Skywork-OR1-7B (Open Reasoner 1), un modelo denso de 7.615.616.512 parámetros especializado en razonamiento matemático y generación de código. El modelo original lo desarrolla Skywork y está construido sobre DeepSeek-R1-Distill-Qwen-7B, empleando una arquitectura transformer tipo Qwen2. Esta publicación concreta la mantiene el usuario tinyopsec, que distribuye los pesos convertidos a GGUF para su uso en herramientas de inferencia local.

El problema que resuelve es doble: por un lado, aporta un razonador de 7B entrenado con aprendizaje por refuerzo basado en reglas, lo que permite obtener cadenas de razonamiento largas en matemáticas y código sin depender de modelos de mayor tamaño; por otro, la conversión a GGUF permite ejecutar el modelo en GPU de consumo y en CPU gracias a cuantizaciones que van de 2 a 16 bits, con requisitos de VRAM desde aproximadamente 3,5 GB.

Su relevancia actual radica en que combina una licencia Apache 2.0 (uso comercial permitido) con un pipeline de entrenamiento RL documentado (GRPO con control adaptativo de entropía) sobre 110.000 problemas de matemáticas y 14.000 preguntas de código. La ficha declara únicamente inglés como idioma soportado y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen2 (según etiqueta `qwen2`) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de la model card; no se declara formalmente en la ficha) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de tipo Qwen2, heredada de DeepSeek-R1-Distill-Qwen-7B, con 7.615.616.512 parámetros. No emplea mezcla de expertos ni mecanismos de estado recurrente: es un decoder denso convencional, lo que simplifica el despliegue y explica que las cuantizaciones GGUF cubran desde 2 hasta 16 bits sin necesidad de gestión de expertos.

El entrenamiento se basa en aprendizaje por refuerzo a gran escala con reglas verificables, usando una variante personalizada del algoritmo GRPO. Según la model card, el pipeline incluye estimación de dificultad consciente del modelo, filtrado offline y online, muestreo por rechazo, un esquema de entrenamiento en múltiples etapas y control adaptativo de entropía. Los datos de entrenamiento son 110.000 problemas de matemáticas y 14.000 preguntas de código, publicados como Skywork/Skywork-OR1-RL-Data. No se detalla en la información disponible el volumen de tokens de preentrenamiento ni si hubo fases adicionales de DPO o RLHF.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento matemático: entrenado explícitamente sobre 110.000 problemas de matemáticas con recompensas verificables.
- Generación y razonamiento sobre código: 14.000 preguntas de código en el conjunto de entrenamiento RL.
- Razonamiento multi-paso con cadenas de pensamiento extensas, característico de los modelos derivados de DeepSeek-R1.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede generar derivaciones paso a paso sobre enunciados de álgebra, cálculo o combinatoria, aprovechando el entrenamiento RL con recompensas verificables sobre 110.000 problemas.
- Asistencia en depuración de código: dado un fragmento de código y un mensaje de error, el modelo puede razonar sobre la causa raíz y proponer parches, apoyándose en los 14.000 problemas de código del conjunto RL.
- Generación de tests unitarios: a partir de una función, producir casos de prueba que cubran ramas y condiciones límite, con la ventana de 32.768 tokens suficiente para incluir el módulo completo como contexto.
- Evaluación automática de soluciones de estudiantes: comparar la respuesta de un alumno con la solución generada y señalar el paso donde diverge el razonamiento.
- Extracción de resultados en pipelines de análisis: dado un enunciado y su resolución, obtener la respuesta final y el procedimiento en formato estructurado para su consumo posterior.
- Despliegue en portátiles y estaciones sin GPU dedicada: con la cuantización Q4_K_M (aproximadamente 4,9 GB) el modelo puede ejecutarse en CPU mediante llama.cpp u Ollama, lo que permite razonamiento matemático offline.
- Prototipado rápido en GPU de consumo: con Q4_K_M (unos 5 GB de VRAM) o Q5_K_M (unos 6 GB) cabe en tarjetas de 8 GB, facilitando la experimentación con técnicas de prompting de razonamiento.
- Servicio de inferencia con contexto largo: usar Q8_0 (unos 9 GB de VRAM) con `n_ctx=32768` en llama-cpp-python para tareas que requieran documentos extensos como entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K, MATH ni ninguna otra métrica, y los resultados de búsqueda web proporcionados no contienen datos técnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, según la model card:

| Cuantizacion | VRAM |
|---|---|
| F16 | ~16 GB |
| Q8_0 | ~9 GB |
| Q6_K | ~7 GB |
| Q5_K_M | ~6 GB |
| Q4_K_M | ~5 GB |
| Q3_K_M | ~4 GB |
| Q2_K | ~3,5 GB |

- Tamaños de fichero declarados: F16 ~15,2 GB; Q8_0 ~8,5 GB; Q6_K ~6,6 GB; Q5_K_M ~5,7 GB; Q5_K_S ~5,5 GB; Q4_K_M ~4,9 GB; Q4_K_S ~4,7 GB; Q3_K_L ~4,0 GB; Q3_K_M ~3,7 GB; Q3_K_S ~3,5 GB; Q2_K ~3,0 GB.
- GPU recomendadas: no especificadas en la model card. Por requisitos de VRAM, cualquier GPU con 8 GB o más (por ejemplo, una RTX 4060/3070 o superior) puede alojar Q4_K_M o Q5_K_M; para Q8_0 se necesita una GPU de 10-12 GB o más; para F16, 16 GB o más.
- ¿Cabe en GPU de consumo? Sí, con las cuantizaciones Q4_K_M y inferiores en tarjetas de 8 GB; Q5_K_M y Q6_K en tarjetas de 8-12 GB; Q8_0 en tarjetas de 12 GB o superiores.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python, LM Studio y Ollama (`ollama run hf.co/tinyopsec/Skywork-OR1-7B-GGUF:Q4_K_M`). No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Skywork-OR1-7B-GGUF (este) | 7.615.616.512 | 32.768 tokens (según ejemplos de la model card) | Apache 2.0 | GGUF en HuggingFace, ejecucción local | No disponible |
| Skywork/Skywork-OR1-7B (base) | 7.615.616.512 | no disponible en la información proporcionada | Apache 2.0 | Safetensors en HuggingFace | No disponible |
| DeepSeek-R1-Distill-Qwen-7B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace | No disponible |

La comparación se limita a los datos confirmados en la información disponible. No se dispone de métricas de rendimiento de ninguno de los modelos citados, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta sesgos ni se han aportado evaluaciones de sesgo.
- Riesgo de alucinación: inherente a los modelos de razonamiento entrenados con RL; en problemas matemáticos o de código puede producir cadenas de razonamiento plausibles con resultados incorrectos si la respuesta no es verificable por reglas.
- Limitación de idioma: la ficha declara únicamente inglés (`language: en`), por lo que el rendimiento en castellano no está garantizado ni evaluado.
- Limitación de contexto: el valor de 32.768 tokens procede del ejemplo de la model card (`n_ctx=32768`) y no de una especificación formal; contextos mayores no están confirmados.
- Degradación por cuantización: las variantes Q2_K, Q3_K_S y Q3_K_M se etiquetan como "lowest quality" o "very low quality" en la propia model card; en tareas de razonamiento matemático la pérdida de precisión puede ser significativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios.
- Caveat de procedencia: este repositorio es una cuantización de terceros (usuario `tinyopsec`), con 0 descargas y 0 likes en el momento de la consulta, y fecha de creación posterior a la del modelo base; conviene verificar la integridad de los ficheros frente a los pesos originales antes de usarlos en producción.
- Soporte de tool calling y agentes: no confirmado, lo que limita su integración en pipelines que dependan de llamadas a funciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Skywork-OR1-7B-GGUF
- Modelo base: https://huggingface.co/Skywork/Skywork-OR1-7B
- Dataset de entrenamiento RL: https://huggingface.co/datasets/Skywork/Skywork-OR1-RL-Data
