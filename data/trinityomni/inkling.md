# trinityomni/Inkling

## Resumen

Inkling es un modelo multimodal generalista de Thinking Machines Lab, publicado en HuggingFace con el identificador `trinityomni/Inkling`. Acepta entradas de texto, imagen y audio, y genera texto como salida. Está diseñado para desarrolladores que construyen aplicaciones de IA, incluyendo sistemas agénticos, asistentes de codigo, chatbots y sistemas de recuperacion aumentada por generacion (RAG). Es el primer modelo de pesos abiertos de Thinking Machines Lab y se distribuye bajo licencia Apache 2.0.

Arquitectonicamente es un transformer decoder-only de 66 capas con un backbone de Mixture-of-Experts (MoE) disperso: cada token se enruta a 6 de 256 expertos, mas 2 expertos compartidos activos en todos los tokens. La atencion es hibrida, combinando capas locales y globales. Segun la model card, el modelo tiene 975B parametros totales y 41B activos; el repositorio safetensors lista 952.377.623.626 parametros. Es nativamente multimodal, con un codificador jerarquico de parches para imagenes y video, y codificacion por tokens discretos para audio, proyectando todas las modalidades a un espacio oculto compartido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso (66 capas, 256 expertos, 6 activos por token + 2 compartidos) |
| Parametros totales | 975B segun model card; 952.377.623.626 segun safetensors |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Ingles, con capacidades multilingues generales (segun model card; en HuggingFace aparece "no disponible") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling es un modelo autorregresivo multimodal basado en un transformer decoder-only de 66 capas. La capa feed-forward emplea un esquema MoE disperso: cada token selecciona 6 de los 256 expertos disponibles, con 2 expertos adicionales compartidos que siempre estan activos. La atencion es hibrida, alternando capas de atencion local y global. Para las modalidades de entrada, las imagenes y el video se codifican mediante un codificador jerarquico de parches, mientras que el audio se tokeniza de forma discreta. Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente en el decoder.

Los datos de entrenamiento incluyen una amplia variedad de tipos de contenido: texto, imagenes, audio y video. Las fuentes son datos publicamente disponibles, adquiridos de terceros o generados sinteticamente. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad o avanzar en objetivos de seguridad.

## Capacidades

- Generacion de texto en ingles y otros idiomas, con capacidades multilingues generales.
- Razonamiento matematico y cientifico de alto nivel, con resultados destacados en AIME 2026 y GPQA Diamond.
- Comprension multimodal: acepta imagenes, video y audio como entrada, y genera texto como salida.
- Soporte de uso de herramientas (tool-use) y sistemas agencios, incluyendo flujos de razonamiento multi-paso.
- Razonamiento con esfuerzo controlable, segun la informacion publica de Thinking Machines Lab.
- Adecuado para asistentes de codigo, chatbots, sistemas de recuperacion aumentada por generacion y aplicaciones conversacionales.
- Desplegable localmente con SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace.

## Casos de uso

- Asistentes de codigo en entornos de desarrollo: el modelo soporta multiples lenguajes de programacion y puede integrarse en IDEs o pipelines de CI/CD para generar, revisar o corregir codigo.
- Agentes autonomos con tool-use: gracias a su capacidad de uso de herramientas y razonamiento multi-paso, puede planificar y ejecutar tareas complejas que requieren llamadas a funciones externas.
- Sistemas de recuperacion aumentada por generacion (RAG): puede procesar instrucciones y generar respuestas basadas en documentos recuperados, tanto de texto como de imagenes.
- Analisis de documentos multimodales: permite extraer informacion de capturas de pantalla, documentos escaneados o imagenes, combinando comprension visual y textual.
- Transcripcion y comprension de audio: acepta audio WAV a 16 kHz, por lo que puede resumir conversaciones, responder preguntas sobre contenido hablado o generar notas a partir de grabaciones.
- Chatbots de atencion al cliente: su naturaleza conversacional y multilingue permite gestionar interacciones con usuarios en varios idiomas, aunque la ventana de contexto no esta publicada.
- Investigacion y analisis de datos: su rendimiento en benchmarks de razonamiento cientifico y matematico lo hace util para tareas de analisis complejo, como resolver problemas de nivel avanzado o interpretar resultados experimentales.

## Benchmarks y rendimiento

Los resultados publicados en la model card se reportan con `effort=0.99`. Las comparaciones se generaron el 14 de julio de 2026. Los modelos Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |

La fila de SWEBench Pro (Public) aparece incompleta en la informacion disponible, por lo que no se incluye.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Capacidad en GPU de consumo: no disponible; dado el tamaño total de parametros (975B), se requiere infraestructura de multiples GPUs o nodos.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace, con recetas publicadas para cada uno.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara Inkling con algunos modelos de pesos abiertos de la misma categoria, basandose en los benchmarks publicados. Los parametros y contexto de los modelos comparados no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | HLE (text only) | AIME 2026 | GPQA Diamond | SWEBench Verified | Licencia |
|---|---|---|---|---|---|---|---|
| Inkling | 975B totales, 41B activos | no disponible | 29.7% | 97.1% | 87.2% | 77.6% | Apache 2.0 |
| Nemotron 3 Ultra | no disponible | no disponible | 26.6% | 94.2% | 86.7% | 70.7% | no disponible |
| Kimi K2.5 | no disponible | no disponible | 29.4% | 95.8% | 87.9% | 76.8% | no disponible |
| DeepSeek V4 Pro | no disponible | no disponible | 35.9% | 96.7% | 88.8% | 80.6% | no disponible |
| GLM 5.2 | no disponible | no disponible | 40.1% | 99.2% | 89.5% | – | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos o riesgos especificos de alucinacion en la informacion disponible.
- La longitud de contexto no esta especificada, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- El rendimiento optimo para imagenes se consigue con dimensiones entre 40px y 4096px; para audio, se recomienda que las grabaciones no superen los 20 minutos a 16 kHz.
- Aunque la licencia Apache 2.0 permite uso comercial, existe una politica de uso aceptable (Acceptable Use Policy) que debe revisarse antes de desplegar el modelo en produccion.
- Hay una discrepancia en el numero de parametros totales entre la model card (975B) y el repositorio safetensors (952.377.623.626), lo que puede deberse a diferencias en el conteo o a pesos adicionales.
- El modelo es extremadamente grande (1904.8 GB en el repositorio), lo que implica requisitos de hardware muy altos y costes de despliegue significativos.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/Inkling
- Model card de Thinking Machines Lab: https://huggingface.co/thinkingmachines/Inkling
- Página oficial del modelo: https://thinkingmachines.ai/inkling/
- Anuncio de introduccion: https://thinkingmachines.ai/news/introducing-inkling/
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta para SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta para vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta para TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta para Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace: https://hf.co/blog/thinkingmachines-inkling
