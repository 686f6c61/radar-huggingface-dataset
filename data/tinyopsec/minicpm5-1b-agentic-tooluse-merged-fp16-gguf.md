# tinyopsec/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16-GGUF

## Resumen

MiniCPM5-1B-Agentic-Tooluse-Merged-FP16-GGUF es una familia de cuantizaciones GGUF del checkpoint `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16`, un modelo derivado de la base `openbmb/MiniCPM5-1B` afina­do para uso de herramientas en flujos agénticos. El autor de la cuantización es el usuario `tinyopsec`, que publica el modelo en formato GGUF generado con llama.cpp para su uso en runtimes compatibles como llama.cpp, Ollama, LM Studio o koboldcpp. Con 1.080.632.832 parámetros (aproximadamente 1,08 mil millones), se posiciona como un modelo pequeño orientado a despliegue local y a tareas de tool calling.

El modelo resuelve el problema de disponer de un agente ligero capaz de invocar funciones y encadenar pasos de razonamiento en entornos con recursos limitados, donde un modelo de decenas de miles de millones de parámetros no es viable. Su relevancia actual radica en la combinación de tamaño reducido, licencia Apache 2.0 permisiva y un conjunto amplio de cuantizaciones (desde F16 hasta Q2_K) que permiten ajustar el equilibrio entre calidad y consumo de memoria.

La información pública disponible es escasa: la model card se limita a listar los ficheros GGUF, instrucciones básicas de uso y la licencia. No se detallan datos de entrenamiento, longitud de contexto, idiomas soportados ni resultados de benchmarks, por lo que varios de los campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de openbmb/MiniCPM5-1B); detalles internos no disponibles |
| Parametros totales | 1.080.632.832 (aproximadamente 1,08 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16 y cuantizaciones K-quants y legacy) |

## Arquitectura y entrenamiento

El modelo base es `openbmb/MiniCPM5-1B`, un transformer de aproximadamente 1,08 mil millones de parámetros. Sobre esa base, el checkpoint `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16` aplica un ajuste fino orientado a tool calling y comportamiento agéntico, según indican los tags del repositorio (`tool-calling`, `agentic`). El término "Merged" en el nombre sugiere una fusión de pesos, aunque no se especifica la técnica exacta ni los datasets empleados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas específicas más allá de la adaptación al uso de herramientas. La cuantización se ha realizado con llama.cpp, generando trece variantes que cubren desde precisión completa (F16) hasta 2 bits (Q2_K). Tampoco se documenta la estrategia de decodificación ni si se emplean técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y el tag `conversational`.
- Tool calling y function calling: el modelo está específicamente ajustado para invocar herramientas, según los tags `tool-calling` y `agentic`.
- Razonamiento multi-paso orientado a agentes: el tag `agentic` indica soporte para flujos de varios pasos, aunque no se detalla el alcance.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructuras de inferencia estándar.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Agentes locales de automatización: el modelo puede ejecutarse en llama.cpp u Ollama y encadenar llamadas a funciones para tareas como consultar APIs, mover ficheros o lanzar comandos, gracias a su ajuste específico para tool calling y su reducido tamaño.
- Asistentes de escritorio con privacidad: al caber en equipos de consumo, permite desplegar un asistente conversacional que invoca herramientas locales sin enviar datos a la nube.
- Enrutamiento de intenciones en pipelines: con 1,08 mil millones de parámetros, es adecuado como clasificador o router que decide qué herramienta o modelo mayor debe atender una petición, reduciendo coste frente a modelos grandes.
- Prototipado rápido de agentes: la disponibilidad de trece cuantizaciones permite iterar desde F16 en servidor hasta Q4_K_M en portátil, facilitando pruebas de concepto de flujos agénticos antes de escalar a modelos mayores.
- Extracción estructurada con function calling: puede usarse para transformar texto libre en llamadas a funciones con argumentos tipados en tareas de ETL o procesamiento de documentos.
- Educación y experimentación: su licencia Apache 2.0 y su tamaño permiten usarlo en cursos y laboratorios para estudiar comportamiento agéntico y cuantización sin restricciones de uso comercial.
- Componente en sistemas multiagente: puede actuar como subagente especializado en invocación de herramientas dentro de una orquestación mayor, donde el modelo principal delega tareas acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB en F16, en torno a 1,1 GB en Q8_0, cerca de 0,8 GB en Q6_K, alrededor de 0,7 GB en Q5_K_M y aproximadamente 0,6 GB en Q4_K_M (estimaciones a partir del tamaño de fichero típico para 1,08 mil millones de parámetros; el autor solo confirma 2,0 GB para F16).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU recientes son suficientes. Para despliegues en servidor, A100 o H100 no aportan ventaja significativa por el tamaño del modelo, salvo por agregación de muchas instancias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 1,08 mil millones de parámetros, la latencia será baja en hardware moderno, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Agentic-Tooluse-Merged (este) | 1,08 mil millones | no disponible | Apache 2.0 | GGUF | Ajustado para tool calling; 13 cuantizaciones |
| openbmb/MiniCPM5-1B (base) | 1,08 mil millones | no disponible | no disponible en la informacion | safetensors y otros | Modelo base sin ajuste agéntico |
| ewin-reg/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16 (origen) | 1,08 mil millones | no disponible | no disponible en la informacion | safetensors (FP16) | Checkpoint original del que deriva esta cuantización |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoría; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse la composición del dataset de ajuste, no es posible evaluar sesgos de género, idioma o dominio.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje de este tamaño; el ajuste para tool calling no elimina la posibilidad de invocar funciones con argumentos incorrectos o inventados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento en conversaciones largas o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; debe conservarse el aviso de licencia y verificar que el modelo base y el checkpoint intermedio mantienen la misma licencia.
- Caveats para producción: el autor advierte explícitamente "Evaluate before use"; al ser un modelo de 1,08 mil millones de parámetros, su fiabilidad en razonamiento complejo y tool calling multi-paso es limitada frente a modelos mayores, por lo que conviene validar exhaustivamente los flujos agénticos antes de desplegarlos.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) degradan la calidad de forma notable; para uso agéntico se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16-GGUF
- Modelo base del que deriva la cuantización: https://huggingface.co/ewin-reg/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp (runtime de cuantización e inferencia): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
