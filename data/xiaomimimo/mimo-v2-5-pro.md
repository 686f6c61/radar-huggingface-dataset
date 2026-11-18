# XiaomiMiMo/MiMo-V2.5-Pro

## Resumen

MiMo-V2.5-Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por XiaomiMiMo, el equipo de investigación en IA de Xiaomi. Con 1,02 billones de parámetros totales y 42.000 millones de parámetros activos por token, se posiciona como el modelo más capaz de la familia MiMo hasta la fecha, orientado a tareas agénticas complejas, ingeniería de software y razonamiento de horizonte largo. Emplea una arquitectura de atención híbrida que intercala atención de ventana deslizante (SWA) y atención global (GA) en proporción 6:1, junto con tres módulos de predicción multi-token (MTP).

La característica más diferencial es su ventana de contexto de hasta 1 millón de tokens, con un rendimiento sostenido en tareas de razonamiento de contexto largo que, según la model card, supera ampliamente a su predecesor (MiMo-V2-Pro colapsaba a 0,00 en la tarea BFS a 1M de tokens, mientras que V2.5-Pro mantiene 0,37). Está entrenado sobre 27 billones de tokens en precisión mixta FP8 con longitud de secuencia nativa de 32k, y su post-entrenamiento combina SFT, RL agéntico a gran escala y destilación on-policy multi-profesor (MOPD).

El modelo se distribuye con licencia MIT, lo que facilita su uso comercial, y soporta únicamente inglés y chino. Su relevancia actual radica en la combinación de contexto extremo, capacidades agénticas sostenidas a lo largo de miles de llamadas a herramientas y un formato de pesos FP8 (E4M3) que reduce los requisitos de almacenamiento frente a BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (SWA + GA, ratio 6:1, ventana deslizante de 128) y 3 módulos MTP |
| Parametros totales | 1.023.182.841.600 (1,02T) |
| Parametros activos | 42B |
| Longitud de contexto | Hasta 1M tokens (modelo post-entrenado); 256K en la variante Base |
| Tipos de cuantizacion | Pesos publicados en FP8 (E4M3) mixto; no se detallan otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1033,4 GB) |

## Arquitectura y entrenamiento

MiMo-V2.5-Pro es un transformer disperso de tipo MoE con 1,02T de parámetros totales y 42B activos. Su innovación central es la atención híbrida: intercala capas de atención de ventana deslizante (SWA) con ventana de 128 tokens y capas de atención global (GA) en una proporción 6:1. Este diseño reduce el almacenamiento de KV-cache en casi 7 veces manteniendo el rendimiento en contexto largo, gracias a un sesgo de attention sink aprendible. Además, incorpora tres módulos ligeros de predicción multi-token (MTP) con FFN densas, que triplican la velocidad de salida durante la inferencia y aceleran el rollout en el entrenamiento por RL.

El pre-entrenamiento se realizó sobre 27 billones de tokens en precisión mixta FP8 con longitud de secuencia nativa de 32k, y la ventana de contexto se extiende hasta 1M de tokens. El post-entrenamiento combina supervisión fina (SFT), RL agéntico a gran escala y destilación on-policy multi-profesor (MOPD), orientados específicamente a tareas agénticas, ingeniería de software compleja y trayectorias de horizonte largo con miles de llamadas a herramientas. La variante Base, entrenada con contexto de 256K, también está disponible.

## Capacidades

- Generación de texto y razonamiento general, con resultados destacados en MMLU (89,4), MMLU-Redux (92,8) y BBH (88,4) en la variante Base.
- Razonamiento matemático: GSM8K (99,6), MATH (86,2) y AIME 24&25 (37,3) en evaluación Base.
- Generación y comprensión de código: HumanEval+ (75,6), MBPP+ (74,1), LiveCodeBench v6 (39,6) y SWE-Bench AgentLess (35,7).
- Capacidades agénticas: soporte de trayectorias complejas con miles de llamadas a herramientas, razonamiento multi-paso y seguimiento de instrucciones sostenido en ventanas de 1M de tokens.
- Razonamiento de contexto largo: evaluación en GraphWalks con 0,56 en BFS y 0,92 en Parents a 512k tokens; 0,37 y 0,62 respectivamente a 1M.
- Capacidades multilingües limitadas a inglés y chino, con GlobalMMLU de 83,6, C-Eval de 91,5 y CMMLU de 90,2.
- Decodificación acelerada mediante MTP, que triplica la velocidad de salida en inferencia.
- Soporte de tool calling y function calling implícito en su diseño agéntico (etiqueta `agent` en el repo).

## Casos de uso

- Ingeniería de software agéntica: el modelo puede resolver tareas de reparación de bugs y modificación de repositorios completos (SWE-Bench AgentLess 35,7) manteniendo coherencia a lo largo de miles de pasos de razonamiento y llamadas a herramientas, lo que lo hace adecuado para pipelines de CI/CD con agentes autónomos.
- Análisis de bases de código extensas: con 1M de tokens de contexto puede ingerir repositorios completos o múltiples módulos interrelacionados y responder preguntas de arquitectura, dependencias o refactorizaciones sin truncar el código.
- Automatización de atención al cliente compleja: gestión de conversaciones multi-turno con historial muy largo (hasta 1M de tokens) manteniendo coherencia y seguimiento de instrucciones, adecuado para soporte técnico especializado.
- Investigación documental y legal: procesamiento de contratos, expedientes o corpus documentales de cientos de miles de tokens, con capacidad de búsqueda y síntesis sobre el material completo.
- Razonamiento matemático y científico asistido: resolución de problemas de competición (GSM8K 99,6, MATH 86,2) y tareas de razonamiento de nivel graduado (GPQA-Diamond 66,7), útil en entornos educativos o de investigación.
- Generación de código en producción: integración en asistentes de IDE o pipelines de generación de tests y documentación, con soporte de tool calling para invocar linters, compiladores o APIs externas.
- Orquestación de agentes de horizonte largo: tareas que requieren planificación sostenida y ejecución de miles de acciones encadenadas, como automatización de flujos de trabajo empresariales o investigación autónoma.
- Procesamiento bilingüe inglés-chino: traducción, resumen y generación en ambos idiomas con calidad medida en C-Eval (91,5) y CMMLU (90,2).

## Benchmarks y rendimiento

Resultados de la variante Base publicados en la model card (comparativa con DeepSeek-V4-Pro Base, DeepSeek-V4-Flash Base y Kimi-K2 Base):

| Categoría | Benchmark | Setting | MiMo-V2.5-Pro Base | MiMo-V2.5 Base | DeepSeek-V4-Pro Base | DeepSeek-V4-Flash Base | Kimi-K2 Base |
|---|---|---|---|---|---|---|---|
| Parámetros | Activos / Totales | - | 42B / 1,02T | 15B / 310B | 49B / 1,6T | 13B / 284B | 32B / 1,04T |
| General | BBH | 3-shot | 88,4 | 87,2 | 87,5 | 86,9 | 88,7 |
| General | MMLU | 5-shot | 89,4 | 86,3 | 90,1 | 88,7 | 87,8 |
| General | MMLU-Redux | 5-shot | 92,8 | 89,8 | 90,8 | 89,4 | 90,2 |
| General | MMLU-Pro | 5-shot | 68,5 | 65,8 | 73,5 | 68,3 | 69,2 |
| General | DROP | 3-shot | 86,3 | 83,7 | 88,7 | 88,6 | 83,6 |
| General | ARC-Challenge | 25-shot | 97,2 | 96,5 | - | - | 96,2 |
| General | HellaSwag | 10-shot | 89,8 | 88,6 | 88,0 | 85,7 | 94,6 |
| General | WinoGrande | 5-shot | 85,6 | 84,7 | 81,5 | 79,5 | 85,3 |
| General | TriviaQA | 5-shot | 81,3 | 80,7 | 85,6 | 82,8 | 85,1 |
| General | GPQA-Diamond | 5-shot | 66,7 | 58,1 | - | - | 48,1 |
| Matemáticas | GSM8K | 8-shot | 99,6 | 83,3 | 92,6 | 90,8 | 92,1 |
| Matemáticas | MATH | 4-shot | 86,2 | 67,7 | 64,5 | 57,4 | 70,2 |
| Matemáticas | AIME 24&25 | 2-shot | 37,3 | 36,9 | - | - | 31,6 |
| Código | HumanEval+ | 1-shot | 75,6 | 71,3 | - | - | 84,8 |
| Código | MBPP+ | 3-shot | 74,1 | 70,9 | - | - | 73,8 |
| Código | LiveCodeBench v6 | 1-shot | 39,6 | 35,5 | - | - | 26,3 |
| Código | SWE-Bench (AgentLess) | 3-shot | 35,7 | 30,8 | - | - | 28,2 |
| Chino | C-Eval | 5-shot | 91,5 | 88,6 | 93,1 | 92,1 | 92,5 |
| Chino | CMMLU | 5-shot | 90,2 | 88,2 | 90,8 | 90,4 | 90,9 |
| Multilingüe | GlobalMMLU | 5-shot | 83,6 | 77,4 | - | - | 80,7 |

Resultados de contexto largo (GraphWalks, benchmark de OpenAI): MiMo-V2.5-Pro obtiene 0,56 en BFS y 0,92 en Parents a 512k tokens; 0,37 y 0,62 a 1M. Su predecesor V2-Pro colapsaba a 0,00 en ambas subtareas a 1M.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en FP8 (E4M3) ocupan aproximadamente 1 TB (repo de 1033,4 GB), por lo que la inferencia requiere múltiples aceleradores de alta capacidad. No se dispone de cifras oficiales de VRAM mínima en la información proporcionada.
- GPU recomendadas: por el tamaño del modelo, se requiere un clúster multi-GPU con GPUs de centro de datos tipo H100, H200 o B200 con interconnect de alta velocidad (NVLink). No se detallan configuraciones exactas en la model card.
- No cabe en GPUs de consumo (RTX 4090, 5090, etc.) en su formato completo; se requeriría cuantización agresiva y aun así excedería la memoria de una sola tarjeta consumer.
- Opciones de despliegue: la librería indicada es transformers con `custom_code`. No se confirman en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: los tres módulos MTP triplican la velocidad de salida durante la inferencia según el autor, pero no se publican cifras absolutas de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parámetros activos / totales | Contexto | MMLU | GSM8K | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MiMo-V2.5-Pro | 42B / 1,02T | 1M | 89,4 | 99,6 | 75,6 | MIT | Hugging Face, ModelScope |
| DeepSeek-V4-Pro | 49B / 1,6T | no disponible | 90,1 | 92,6 | no disponible | no disponible | no disponible |
| DeepSeek-V4-Flash | 13B / 284B | no disponible | 88,7 | 90,8 | no disponible | no disponible | no disponible |
| Kimi-K2 | 32B / 1,04T | no disponible | 87,8 | 92,1 | 84,8 | no disponible | no disponible |

MiMo-V2.5-Pro destaca frente a estos competidores en matemáticas (GSM8K 99,6, MATH 86,2), razonamiento científico (GPQA-Diamond 66,7) y contexto largo (1M con rendimiento sostenido), mientras que queda por debajo en MMLU-Pro (68,5 frente a 73,5 de DeepSeek-V4-Pro) y en HumanEval+ frente a Kimi-K2 (75,6 frente a 84,8). Su licencia MIT es la más permisiva de la comparativa.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay evidencia de capacidades en castellano ni en otros idiomas, lo que limita su uso en entornos hispanohablantes sin adaptación.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; la model card no documenta evaluaciones específicas de factualidad o tasa de alucinación.
- Sesgos conocidos: no se documentan en la información disponible análisis de sesgos demográficos, culturales o políticos.
- El rendimiento en contexto largo decae con la longitud: en GraphWalks baja de 0,56/0,92 a 512k a 0,37/0,62 a 1M, por lo que no debe asumirse calidad uniforme en toda la ventana.
- Requisitos de hardware extremos (aproximadamente 1 TB de pesos en FP8), lo que excluye el despliegue en infraestructura convencional y encarece la inferencia.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones de los datos de entrenamiento, no detalladas en la model card.
- No se confirma soporte en frameworks de inferencia de alto rendimiento (vLLM, TGI, llama.cpp); la integración indicada es transformers con código personalizado, lo que puede complicar el despliegue en producción.
- El modelo está orientado a tareas agénticas y de código; su comportamiento en dominios especializados (médico, legal) no ha sido evaluado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro
- ModelScope: https://modelscope.cn/models/XiaomiMiMo/MiMo-V2.5-Pro
- Variante Base en Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro-Base
- Blog oficial: https://mimo.xiaomi.com/mimo-v2-5-pro
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com/
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Repositorio GitHub de MiMo: https://github.com/XiaomiMiMo/MiMo
- Repositorio GitHub de MiMo-V2-Flash: https://github.com/XiaomiMiMo/MiMo-V2-Flash
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
