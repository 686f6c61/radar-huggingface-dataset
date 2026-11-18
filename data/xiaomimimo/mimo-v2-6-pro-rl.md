# XiaomiMiMo/MiMo-V2.6-Pro-RL

## Resumen

MiMo-V2.6-Pro-RL es el checkpoint insignia de la serie MiMo-V2.6, desarrollada por XiaomiMiMo (Xiaomi). Se trata de un modelo multimodal nativo (texto, imagen, vídeo y audio) con arquitectura de mezcla de expertos dispersa (MoE), 1,02 billones de parámetros totales y 42.000 millones de parámetros activos por token, con una longitud de contexto de 1 millón de tokens. Su propuesta central es escalar el aprendizaje por refuerzo (RL) como mecanismo de auto-mejora: cómputo de RL, diversidad de entornos y cómputo de evaluación crecen de forma conjunta para ampliar la frontera de capacidades mediante exploración y retroalimentación.

El modelo se distribuye con licencia MIT, lo que permite uso comercial sin restricciones de atribución más allá de las habituales de dicha licencia, y está publicado en Hugging Face con pesos en safetensors (573,5 GB de repositorio) y código personalizado para transformers. Los idiomas declarados son inglés y chino. Su relevancia actual radica en dos frentes: por un lado, unifica en un solo entrenamiento de RL dominios habitualmente tratados por separado (código, agentes generales, visión y ciberseguridad); por otro, incorpora un bucle de autoevaluación con calificadores agénticos que compara trayectorias dentro de un mismo grupo para premiar soluciones de mayor calidad, no solo las que aprueban.

La serie incluye además una variante menor, MiMo-V2.6-Flash-RL, con la que comparte metodología pero no tamaño. El modelo está orientado a cargas de trabajo de horizonte largo: repositorios extensos, trazas de herramientas y ejecuciones de agente multi-sesión, gracias a su ventana de 1M tokens y a sus codificadores multimodales integrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (sparse Mixture of Experts); backbone híbrido con atención SWA; codificadores omni (visión y audio); decodificador especulativo MTP |
| Parametros totales | 1.024.216.603.392 (1,02 T) |
| Parametros activos | 42 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit, FP8 (según tags del repositorio); no se detallan otras variantes en la información disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado, `custom_code`); tamaño del repositorio 573,5 GB |
| Codificador de visión | MiMo ViT de 681 M de parámetros (28 capas: 24 SWA + 4 Full) |
| Codificador de audio | AudioTokenizer de 308 M + codificador de parches de audio de 127 M |
| Decodificador especulativo | MTP (Multi-Token Prediction) de 5 capas |
| Modalidades | Texto, imagen, vídeo, audio |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer de mezcla de expertos dispersa con 1,02 T de parámetros totales y 42 B activos, sobre el que se injertan codificadores específicos de modalidad: un ViT de 681 M de parámetros para visión (28 capas, 24 de ventana deslizante y 4 de atención completa) y un front-end de audio compuesto por un AudioTokenizer de 308 M y un codificador de parches de 127 M. El backbone emplea atención de ventana deslizante (SWA) en la mayor parte de sus capas, lo que resulta coherente con la ventana de 1M tokens. Para acelerar la decodificación incorpora un decodificador especulativo MTP de 5 capas.

El entrenamiento se articula en torno a RL a gran escala. El autor describe una única ejecución mixta de RL ("You Only RL Once") que mezcla tareas de código, agentes generales, visión y ciberseguridad en el mismo lote, con múltiples arneses de evaluación, de modo que las estrategias aprendidas se transfieran a arneses no vistos durante el entrenamiento. El algoritmo es GRPO (Group Relative Policy Optimization) totalmente asíncrono, con lotes de 1.568 prompts × 16 rollouts por paso y miles de millones de tokens por actualización. Sobre esa base se añade un sistema de calificación agéntica por grupos: Groupwise Reward Synthesis (GRS) construye rúbricas específicas de tarea a partir de rollouts contrastados y fusiona su calidad con los resultados de test; Groupwise Advantage Redistribution (GAR) ordena en línea las trayectorias que aprueban y desplaza la ventaja hacia las soluciones de mayor calidad, acortando caminos y reduciendo tokens por tarea. El proceso se complementa con un arranque en frío de autocorrección (el modelo reescribe sus propios turnos desalineados), endurecimiento de entornos, cribado adversarial y verificación cruzada para evitar el reward hacking, y una fase final de destilación on-policy multi-profesor con múltiples prefijos (MOPD2) que reutiliza historias de trayectorias de profesor y demostraciones SFT para entrenar puntos de decisión sin regenerar los turnos previos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Comprensión de imagen y vídeo mediante el codificador ViT integrado.
- Comprensión de audio mediante el tokenizador y codificador de parches de audio.
- Razonamiento y resolución de tareas de código, incluyendo agentes de código evaluados en DeepSWE, ProgramBench y MiMo Code Bench.
- Uso de herramientas y function calling, con resultados reportados en Toolathlon-Verified y AutomationBench.
- Ejecución de agentes multi-paso en entornos de terminal y escritorio (Terminal Bench, OSWorld-Verified, JobBench).
- Capacidades de ciberseguridad evaluadas en CyberGym.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Decodificación especulativa mediante MTP para reducir latencia de generación.
- Modo de auto-corrección entrenado por RL, orientado a reescribir turnos propios y reconducirlos a pasos fundamentados.

## Casos de uso

- Agente de código en repositorios extensos: con 1M tokens de contexto puede cargar árboles de proyecto completos, trazas de herramientas y múltiples sesiones de trabajo, lo que encaja con los resultados reportados en DeepSWE v1.1 (71,9) y MiMo Code Bench (63,2).
- Automatización de operaciones en terminal y escritorio: los resultados en Terminal Bench 2.1 (89,9) y OSWorld-Verified (82,0) lo sitúan como candidato para agentes que ejecutan comandos, interpretan salida y corrigen errores en entornos reales.
- Orquestación de herramientas empresariales: su rendimiento en Toolathlon-Verified (76,9) y AutomationBench v1.0.6 (53,1) respalda su uso en flujos que encadenan APIs, formularios y sistemas internos.
- Análisis de vídeo y audio en un solo pipeline: al integrar codificadores de visión y audio, permite transcribir, describir y razonar sobre contenido audiovisual sin concatenar modelos separados.
- Asistencia a tareas de oficina y ofimática evaluadas por encuadre profesional: JobBench (62,0) y GDPval-AA 2.1 (1673) indican utilidad en tareas de conocimiento con criterios de calidad profesional.
- Auditoría y análisis de seguridad: las capacidades evaluadas en CyberGym permiten emplearlo en revisión de configuraciones, análisis de trazas y apoyo a equipos de seguridad, siempre con supervisión humana.
- Investigación en RL y auto-mejora: la publicación del informe técnico y de la metodología GRS/GAR lo convierte en una referencia para experimentos de escalado de RL con calificadores agénticos.

## Benchmarks y rendimiento

| Benchmark | MiMo-V2.6 Pro | MiMo-V2.6 Flash | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 | 71,9 | 67,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,5 | 26,0 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 63,2 | 61,2 | 40,4 | 68,6 | 59,3 | no disponible |
| AutomationBench v1.0.6 | 53,1 | 52,3 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 76,9 | 73,6 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | 1673 | no disponible | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 31,6 | 27,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 34,9 | 28,8 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 89,9 | 87,6 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 82,0 | 80,8 | no disponible | 83,4 | 83,0 | 86,0 |
| JobBench | 62,0 | 61,2 | 25,0 | 65,7 | 45,4 | 57,4 |
| CyberGym | no disponible (tabla truncada en la información proporcionada) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1,02 T de parámetros totales y pesos en safetensors de 573,5 GB, la inferencia en precisión completa exige agregados multi-GPU de gran capacidad; las variantes de 8 bits y FP8 reducen el requisito aproximadamente a la mitad del tamaño del repositorio, pero el autor no publica cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, el despliegue realista pasa por clústeres con GPUs de centro de datos (A100, H100 o equivalentes) en configuración multi-nodo.
- ¿Cabe en GPU de consumo? No es viable en GPUs de consumo (RTX 4090 y similares) con los formatos publicados; el volumen de pesos y la arquitectura MoE de 42 B activos no permiten un ajuste en VRAM de 24 GB.
- Opciones de despliegue: transformers con código personalizado (`custom_code`) es la vía documentada por el autor. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible. Existe una plataforma API propia (Xiaomi MiMo API Platform) y un entorno de escritorio (Xiaomi MiMo Desktop).
- Latencia y throughput: no disponibles. El modelo incorpora un decodificador especulativo MTP de 5 capas orientado a reducir latencia, pero no se publican métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-RL | 1,02 T totales / 42 B activos | 1M | MIT | Hugging Face, ModelScope, API propia | Multimodal nativo (texto, imagen, vídeo, audio) |
| MiMo-V2.6-Flash-RL | no disponible | no disponible | no disponible | Hugging Face, ModelScope | Variante menor de la misma serie; rinde por debajo en la mayoría de benchmarks |
| Claude Opus 5 | no disponible | no disponible | propietaria | API comercial | Superior en DeepSWE, ProgramBench, Toolathlon y Terminal Bench 4.0 según la tabla del autor |
| GPT-5.6 Sol | no disponible | no disponible | propietaria | API comercial | Rendimiento cercano en Agent's Last Exam y OSWorld; inferior en JobBench |
| Claude Fable 5 | no disponible | no disponible | propietaria | API comercial | Superior en OSWorld-Verified y ProgramBench; inferior en Terminal Bench 2.1 |

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés y chino; el rendimiento en castellano no está documentado y no debe asumirse.
- Sesgos: no se publica información sobre sesgos evaluados ni sobre composición del corpus de entrenamiento, por lo que no es posible acotar riesgos de sesgo demográfico, cultural o lingüístico.
- Alucinación: no se aportan tasas de alucinación ni evaluaciones de veracidad; el uso en producción requiere verificación externa, especialmente en dominios factuales.
- Riesgo de reward hacking: el propio autor describe mecanismos de endurecimiento de entornos y verificación cruzada, lo que indica que el riesgo existe y se mitiga, no que se elimine.
- Licencia MIT: permite uso comercial y modificación, pero no incluye garantías; conviene revisar las obligaciones de atribución y las licencias de componentes de terceros no detalladas.
- Requisitos de despliegue: el tamaño (573,5 GB de repositorio) y la necesidad de código personalizado complican el autohospedaje; no hay confirmación de soporte en motores de inferencia habituales.
- Contexto largo: aunque se declaran 1M tokens, no se publican evaluaciones específicas de degradación con la longitud, por lo que la calidad efectiva en contextos extremos no está cuantificada.
- Datos incompletos: la tabla de benchmarks está truncada en la información disponible (CyberGym sin valores) y no se detallan cuantizaciones más allá de 8-bit y FP8.
- Uso en ciberseguridad: las capacidades evaluadas en CyberGym aconsejan restringir el acceso y establecer controles de uso para evitar aplicaciones ofensivas.

## Enlaces

- Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Informe técnico: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Modelo hermano (Flash): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
