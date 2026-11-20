# tinyopsec/Skywork-OR1-7B-GGUF

## Resumen

Skywork-OR1-7B-GGUF es la versión cuantizada en formato GGUF del modelo Skywork-OR1-7B (Open Reasoner 1), un modelo de razonamiento especializado en matemáticas y código desarrollado por Skywork. El modelo original parte de DeepSeek-R1-Distill-Qwen-7B y se entrena mediante aprendizaje por refuerzo a gran escala con reglas verificables, usando una variante personalizada del algoritmo GRPO. Esta ficha corresponde al repositorio de cuantizaciones publicado por el usuario tinyopsec, no al modelo original de Skywork.

La relevancia de esta versión reside en su empaquetado para inferencia local: ofrece once niveles de cuantización entre 2 y 16 bits, con tamaños que van de 3,0 GB a 15,2 GB, lo que permite ejecutar un modelo de razonamiento de 7.615 millones de parámetros en hardware de consumo. La arquitectura es Qwen2 (transformer denso), con licencia Apache 2.0 y orientación principal al idioma inglés.

El modelo resuelve el problema de disponer de capacidades de razonamiento matemático y de código en entornos sin GPU de datacenter, a costa de una pérdida de calidad progresiva en las cuantizaciones más agresivas. Su pipeline declarado es text-generation y es compatible con endpoints y con el formato conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer denso, decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-cpp-python; no se documenta el máximo oficial) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 63,9 GB con todos los ficheros) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen2, inicializado desde DeepSeek-R1-Distill-Qwen-7B. El entrenamiento se realizó con aprendizaje por refuerzo a gran escala basado en reglas verificables, empleando una variante personalizada de GRPO. El corpus de entrenamiento consta de 110.000 problemas matemáticos y 14.000 preguntas de código. El pipeline descrito incluye estimación de dificultad consciente del modelo, filtrado offline y online, rejection sampling, un proceso de entrenamiento multi-etapa y control adaptativo de entropía. Estos elementos buscan estabilizar el RL en tareas de razonamiento con recompensas verificables y evitar el colapso de diversidad en las respuestas.

Las cuantizaciones GGUF han sido generadas por tinyopsec a partir de los pesos originales; la model card no detalla la herramienta de conversión ni las métricas de perplejidad por nivel de cuantización. No se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; el modelo hereda el mecanismo de atención estándar de Qwen2.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento matemático: resolución de problemas con cadenas de razonamiento derivadas del entrenamiento con RL.
- Generación y razonamiento sobre código, entrenado con 14.000 preguntas de programación.
- Modo de razonamiento explícito, propio de la estirpe DeepSeek-R1, con trazas de pensamiento antes de la respuesta final.
- Soporte de plantilla conversacional (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso ni de visión o audio.
- Capacidades multilingües limitadas al inglés según el campo `language`.

## Casos de uso

- Tutoría de matemáticas en local: el modelo puede resolver problemas paso a paso y mostrar la cadena de razonamiento, ejecutable en un portátil con GPU de 6-8 GB usando Q4_K_M o Q5_K_M.
- Asistencia a la programación en entornos aislados: generación y explicación de código sin conexión a servicios en la nube, adecuado para equipos con requisitos de confidencialidad, con la cuantización Q6_K o Q8_0 para minimizar la degradación.
- Verificación de soluciones y detección de errores en ejercicios: útil como segundo modelo que revisa razonamientos matemáticos generados por otro sistema, aprovechando el entrenamiento con recompensas verificables.
- Prototipado de pipelines de razonamiento: integración vía llama-cpp-python en scripts de evaluación o experimentos de investigación sobre RL y razonamiento, sin necesidad de infraestructura de datacenter.
- Despliegue en estaciones de trabajo con Ollama o LM Studio: incorporación de un asistente de razonamiento local para desarrolladores mediante `ollama run hf.co/tinyopsec/Skywork-OR1-7B-GGUF:Q4_K_M`.
- Generación de documentación técnica y explicaciones de algoritmos: el modelo puede desglosar conceptos matemáticos o de código en pasos, con contexto suficiente para incluir fragmentos de código y enunciados largos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once niveles, lo que permite medir la degradación de calidad en tareas de matemáticas y código según bits por peso en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según la model card: F16 ~16 GB; Q8_0 ~9 GB; Q6_K ~7 GB; Q5_K_M ~6 GB; Q4_K_M ~5 GB; Q3_K_M ~4 GB; Q2_K ~3,5 GB.
- GPU recomendadas: A100 o H100 para F16 y Q8_0 con contexto largo; RTX 4090 (24 GB) para cualquier cuantización con margen amplio; RTX 3090/4080 (16-24 GB) para Q6_K a Q8_0.
- GPU de consumo: cabe en RTX 4060 Ti (8-16 GB), RTX 3060 (12 GB) y tarjetas de 6-8 GB con Q4_K_M o inferiores. Q2_K (~3,5 GB) permite ejecución en GPU de 4 GB, con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python, LM Studio y Ollama; el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, aunque no se detalla cuáles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Skywork-OR1-7B-GGUF (esta ficha) | 7,62 B | 32.768 (según ejemplo) | Razonamiento matemático y código | Apache 2.0 | GGUF |
| DeepSeek-R1-Distill-Qwen-7B | 7,62 B (no confirmado en la información) | no disponible | Razonamiento destilado de R1 | no disponible | safetensors y GGUF de terceros |
| Qwen2.5-Math-7B | no disponible | no disponible | Matemáticas | no disponible | no disponible |

La comparación se limita a señalar que Skywork-OR1-7B se inicializa desde DeepSeek-R1-Distill-Qwen-7B y añade entrenamiento RL con GRPO sobre 110.000 problemas matemáticos y 14.000 de código. No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idiomas: el campo `language` solo declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Cuantización: las versiones Q3 y Q2 degradan la calidad de forma significativa; para tareas de razonamiento se recomienda Q4_K_M o superior.
- Alucinación: como modelo de razonamiento entrenado con RL, puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en problemas fuera de la distribución matemática y de código.
- Sesgos: no se documenta ningún análisis de sesgos en la model card; el corpus de entrenamiento está centrado en matemáticas y código, lo que puede reducir el rendimiento en dominios generales.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio es una cuantización de terceros (tinyopsec) y no está mantenido por Skywork; conviene verificar la licencia del modelo original antes de producción.
- Contexto: el valor de 32.768 tokens proviene únicamente del ejemplo de código de la model card; no se confirma como máximo oficial ni se documenta el comportamiento en contextos largos.
- Producción: no hay datos publicados de throughput, latencia ni estabilidad en servidores de inferencia de alto rendimiento; el repositorio tiene 0 likes y 1.381 descargas, lo que indica escasa validación comunitaria.
- Tool calling y agentes: no documentados, por lo que no deben asumirse en pipelines que dependan de function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Skywork-OR1-7B-GGUF
- Modelo original: https://huggingface.co/Skywork/Skywork-OR1-7B
- Dataset de entrenamiento RL: https://huggingface.co/datasets/Skywork/Skywork-OR1-RL-Data
