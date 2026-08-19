# XiaomiMiMo/MiMo-V2.5-Pro

## Resumen

MiMo-V2.5-Pro es un modelo de lenguaje de código abierto desarrollado por Xiaomi, diseñado específicamente para tareas agénticas exigentes, ingeniería de software compleja y razonamiento de largo horizonte. Con una arquitectura de Mezcla de Expertos (MoE) de 1,02 billones de parámetros totales y 42 mil millones activos, el modelo destaca por su capacidad para mantener trayectorias complejas que abarcan miles de llamadas a herramientas, con una ventana de contexto de hasta 1 millón de tokens.

El modelo introduce una arquitectura de atención híbrida que intercala atención de ventana deslizante (SWA) y atención global (GA) en una proporción 6:1, reduciendo el almacenamiento de KV-cache en casi 7 veces. Además, incorpora tres módulos ligeros de predicción multi-token (MTP) que triplican la velocidad de generación durante la inferencia. Entrenado sobre 27 billones de tokens con precisión mixta FP8, el modelo ha sido optimizado mediante SFT, RL agéntico a gran escala y destilación on-policy multi-maestro (MOPD).

La relevancia actual de MiMo-V2.5-Pro radica en su combinación de contexto ultralargo, capacidades agénticas avanzadas y licencia MIT, lo que lo posiciona como una alternativa competitiva frente a modelos propietarios y de código abierto en el segmento de modelos MoE de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (SWA + GA, ratio 6:1, ventana 128) |
| Parametros totales | 1.023.244.718.976 (1,02T) |
| Parametros activos | 42B |
| Longitud de contexto | 1M tokens (32K nativo, extendido) |
| Tipos de cuantizacion | FP8 (E4M3) mixto |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiMo-V2.5-Pro emplea una arquitectura MoE con atención híbrida que intercala capas de atención de ventana deslizante (SWA) y atención global (GA) en una proporción 6:1, con un tamaño de ventana deslizante de 128. Esta configuración reduce el almacenamiento de KV-cache en aproximadamente 7 veces, mientras que un sesgo de atención sink aprendible mantiene el rendimiento en contextos largos. El modelo incorpora tres módulos de predicción multi-token (MTP) basados en FFN densos, que triplican la velocidad de salida durante la inferencia.

El entrenamiento se realizó sobre 27 billones de tokens con precisión mixta FP8 y longitud de secuencia nativa de 32K, extendiéndose posteriormente hasta 1M tokens. El post-entrenamiento combina SFT, RL agéntico a gran escala y destilación on-policy multi-maestro (MOPD), lo que permite al modelo mantener instrucciones complejas y coherencia en trayectorias de miles de llamadas a herramientas.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Razonamiento matemático avanzado: 99,6 en GSM8K y 86,2 en MATH (base, 4-shot).
- Generación de código: 75,6 en HumanEval+ y 74,1 en MBPP+ (base).
- Capacidades agénticas: soporta trayectorias de más de mil llamadas a herramientas con seguimiento de instrucciones robusto.
- Razonamiento de largo contexto: mantiene rendimiento hasta 1M tokens, con puntuaciones de 0,37 BFS y 0,62 Parents en GraphWalks a 1M.
- Soporte de tool calling y function calling para integración en pipelines agénticos.
- Capacidades multilingües: 83,6 en GlobalMMLU (base, 5-shot).

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener trayectorias de más de mil llamadas a herramientas, lo que lo hace adecuado para agentes que requieren planificación y ejecución de tareas complejas en entornos dinámicos.
- Ingeniería de software asistida: con 35,7 en SWE-Bench (AgentLess), puede resolver issues reales de repositorios, integrándose en flujos de trabajo de desarrollo como asistente de resolución de bugs.
- Análisis de documentos extensos: su ventana de 1M tokens permite procesar libros completos, codebases enteros o expedientes legales en una sola pasada, sin necesidad de chunking.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con contexto largo, manteniendo coherencia y recordando detalles de interacciones anteriores durante horas de conversación.
- Generación de código en producción: con soporte de tool calling y 75,6 en HumanEval+, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código automáticamente.
- Investigación académica: su licencia MIT y su rendimiento en GPQA-Diamond (66,7) lo hacen útil para investigación en razonamiento científico y matemático.
- Traducción y procesamiento multilingüe: con soporte para inglés y chino, puede utilizarse en sistemas de traducción y localización de contenido técnico.

## Benchmarks y rendimiento

Resultados del modelo base (según la model card del autor):

| Benchmark | Setting | MiMo-V2.5-Pro Base | MiMo-V2.5 Base | DeepSeek-V4-Pro Base | DeepSeek-V4-Flash Base | Kimi-K2 Base |
|---|---|---|---|---|---|---|
| Params activos / totales | - | 42B / 1.02T | 15B / 310B | 49B / 1.6T | 13B / 284B | 32B / 1.04T |
| BBH | 3-shot | 88,4 | 87,2 | 87,5 | 86,9 | 88,7 |
| MMLU | 5-shot | 89,4 | 86,3 | 90,1 | 88,7 | 87,8 |
| MMLU-Redux | 5-shot | 92,8 | 89,8 | 90,8 | 89,4 | 90,2 |
| MMLU-Pro | 5-shot | 68,5 | 65,8 | 73,5 | 68,3 | 69,2 |
| DROP | 3-shot | 86,3 | 83,7 | 88,7 | 88,6 | 83,6 |
| ARC-Challenge | 25-shot | 97,2 | 96,5 | - | - | 96,2 |
| HellaSwag | 10-shot | 89,8 | 88,6 | 88,0 | 85,7 | 94,6 |
| WinoGrande | 5-shot | 85,6 | 84,7 | 81,5 | 79,5 | 85,3 |
| TriviaQA | 5-shot | 81,3 | 80,7 | 85,6 | 82,8 | 85,1 |
| GPQA-Diamond | 5-shot | 66,7 | 58,1 | - | - | 48,1 |
| GSM8K | 8-shot | 99,6 | 83,3 | 92,6 | 90,8 | 92,1 |
| MATH | 4-shot | 86,2 | 67,7 | 64,5 | 57,4 | 70,2 |
| AIME 24&25 | 2-shot | 37,3 | 36,9 | - | - | 31,6 |
| HumanEval+ | 1-shot | 75,6 | 71,3 | - | - | 84,8 |
| MBPP+ | 3-shot | 74,1 | 70,9 | - | - | 73,8 |
| LiveCodeBench v6 | 1-shot | 39,6 | 35,5 | - | - | 26,3 |
| SWE-Bench (AgentLess) | 3-shot | 35,7 | 30,8 | - | - | 28,2 |
| C-Eval | 5-shot | 91,5 | 88,6 | 93,1 | 92,1 | 92,5 |
| CMMLU | 5-shot | 90,2 | 88,2 | 90,8 | 90,4 | 90,9 |
| GlobalMMLU | 5-shot | 83,6 | 77,4 | - | - | 80,7 |

En el benchmark GraphWalks de contexto largo, MiMo-V2.5-Pro obtiene 0,56 BFS y 0,92 Parents a 512K tokens, y 0,37 BFS y 0,62 Parents a 1M tokens, mientras que la versión anterior colapsa a 0,00 a 1M.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 1 TB, por lo que requiere despliegue multi-GPU. No es viable en una sola GPU consumer.
- GPUs recomendadas: clústeres de GPUs con alta capacidad de memoria, como NVIDIA H100 (80GB) o A100 (80GB). Se necesitarían al menos 13 GPUs H100 para alojar los pesos en memoria.
- No cabe en GPUs consumer (RTX 4090, etc.) de forma individual.
- Opciones de despliegue: vLLM, TensorRT-LLM o frameworks de inferencia distribuida que soporten MoE y FP8. No disponible para llama.cpp u Ollama dado el tamaño.
- Latencia y throughput: no disponible. La arquitectura MTP triplica la velocidad de generación respecto a modelos sin esta técnica, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | MMLU | GSM8K | HumanEval+ |
|---|---|---|---|---|---|---|---|
| MiMo-V2.5-Pro | 1,02T | 42B | 1M | MIT | 89,4 | 99,6 | 75,6 |
| DeepSeek-V4-Pro | 1,6T | 49B | no disponible | no disponible | 90,1 | 92,6 | - |
| Kimi-K2 | 1,04T | 32B | no disponible | no disponible | 87,8 | 92,1 | 84,8 |
| MiMo-V2.5 | 310B | 15B | 1M | MIT | 86,3 | 83,3 | 71,3 |

MiMo-V2.5-Pro supera a Kimi-K2 en MMLU, GSM8K y SWE-Bench, aunque es inferior en HumanEval+. Frente a DeepSeek-V4-Pro, es ligeramente inferior en MMLU y MMLU-Pro, pero superior en GSM8K y MATH. Su licencia MIT es una ventaja significativa frente a alternativas con licencias más restrictivas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones específicas de sesgos. Al estar entrenado principalmente con datos en inglés y chino, puede presentar sesgos culturales y lingüísticos de estas regiones.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento de largo contexto donde la coherencia puede degradarse.
- Limitaciones de idioma: solo soporta inglés y chino de forma nativa. El rendimiento en otros idiomas será significativamente inferior.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantías explícitas de seguridad o imparcialidad.
- Requisitos de hardware: el tamaño de 1,02T parámetros hace que el despliegue sea costoso y requiera infraestructura especializada. No es adecuado para entornos con recursos limitados.
- Caveat de producción: el rendimiento en tareas agénticas de larga duración puede degradarse en contextos extremadamente largos (cerca de 1M tokens), como muestran los resultados de GraphWalks.

## Enlaces

- HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro
- Blog oficial: https://mimo.xiaomi.com/mimo-v2-5-pro
- Plataforma API: https://platform.xiaomimimo.com/
- Studio: https://aistudio.xiaomimimo.com
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro-Base
- ModelScope: https://modelscope.cn/models/XiaomiMiMo/MiMo-V2.5-Pro
- Repositorio GitHub (MiMo-V2-Flash): https://github.com/XiaomiMiMo/MiMo-V2-Flash
