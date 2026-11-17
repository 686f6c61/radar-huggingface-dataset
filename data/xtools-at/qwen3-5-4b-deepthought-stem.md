# xtools-at/Qwen3.5-4B-DeepThought-STEM

## Resumen

Deep Thought 4B es un ajuste fino mediante LoRA en 16 bits de Qwen3.5-4B, desarrollado por xtools-at y especializado en razonamiento avanzado, matematicas, resolucion de problemas cientificos y conocimiento tecnico. Parte del checkpoint no censurado xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic, que a su vez deriva de Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de Qwen3.5 destilado de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect.

El modelo hereda la arquitectura multimodal de Qwen3.5-4B (4.539 millones de parametros, pipeline image-text-to-text) y anade un entrenamiento adicional de aproximadamente 11.000 ejemplos centrados en matematicas, fisica, quimica, biologia, ingenieria y descubrimiento de farmacos. La mezcla combina destilaciones de razonamiento de modelos frontera (Claude Haiku 5.5, Xiaomi MiMo 2.6 Pro, ChatGPT Terra 6.1, GPT-5.6 Luna, GLM-5.1) con datos sinteticos de formulacion farmaceutica y una pequena mezcla de calibracion.

Es relevante porque ofrece capacidades de razonamiento STEM en un tamano de 4B parametros que cabe en GPU de consumo, con licencia Apache 2.0 y sin las restricciones de censura del modelo base original. La model card indica explicitamente que el ajuste adicional es textual y no representa una etapa de entrenamiento de vision dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda de Qwen3.5-4B), pipeline image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen GGUFs y cuantizaciones de terceros enlazadas por el autor |
| Idiomas soportados | no disponible (la model card menciona "multilingual scientific knowledge") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB); GGUFs disponibles via modelos derivados |
| Tipo de ajuste | LoRA en 16 bits sobre Qwen3.5-4B (PEFT) |
| Modelo base | xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B, un modelo fundacional multimodal de 4.000 millones de parametros del equipo Qwen. Sobre esa base, la linea de razonamiento proviene de Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, entrenado con aproximadamente 250.000 muestras de matematicas y STEM mediante supervised fine-tuning, seguido de un refinamiento ligero con RL usando GSPO. Ese historial de entrenamiento corresponde al modelo upstream, no al run propio de Deep Thought.

El ajuste adicional de Deep Thought emplea una mezcla de aproximadamente 11.000+ ejemplos organizados en tres grupos, con un 5% de conjunto de evaluacion muestreado de cada grupo. El grupo de razonamiento (6.000+ ejemplos) combina destilaciones de modelos frontera: Claude Haiku 5.5 sintetico (2.936), GPT-5.6 Luna (1.633), GLM-5.1 Mathematics (1.200), Xiaomi MiMo 2.6 Pro (178) y ChatGPT Terra 6.1 (75). Los cuatro datasets de modelos frontera aportan en conjunto unos 4.800 ejemplos. El resto de la mezcla incluye datos sinteticos de descubrimiento y formulacion farmaceutica (red-pill-drug-discovery-formulation) y una pequena mezcla de calibracion basada en HuggingFaceTB/smoltalk2. El entrenamiento se realizo con Unsloth y tecnicas de destilacion; la model card no detalla hiperparametros, numero de tokens ni si hubo etapas de RLHF/DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos.
- Matematicas avanzadas: demostraciones, algebra, calculo y razonamiento cuantitativo.
- Ciencia: fisica, quimica, biologia y preguntas cientificas de nivel doctorado.
- STEM e ingenieria: analisis tecnico y conocimiento cientifico multilingue.
- Descubrimiento de farmacos: razonamiento molecular y desarrollo de formulaciones farmaceuticas.
- Capacidad multimodal heredada de Qwen3.5-4B (pipeline image-text-to-text), aunque el ajuste adicional es solo textual.
- Estilo de razonamiento destilado de modelos frontera (trazas sinteticas multi-paso).
- Modelo no censurado ("uncensored", "decensored", "abliterated" segun tags), lo que reduce rechazos en dominios sensibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explicitamente en la model card, aunque el entrenamiento en trazas de razonamiento multi-paso lo hace plausible.

## Casos de uso

- Resolucion de problemas matematicos y demostraciones: el modelo puede abordar derivaciones, pruebas y calculo avanzado, aprovechando los 1.200 ejemplos de GLM-5.1 Mathematics y las trazas de razonamiento destiladas para construir soluciones paso a paso.
- Asistencia en investigacion cientifica: respuesta a preguntas de fisica, quimica y biologia de nivel avanzado, util como apoyo a investigadores que necesitan explorar hipotesis o repasar conceptos con razonamiento explicito.
- Formulacion farmaceutica y descubrimiento de farmacos: el ajuste incluye datasets sinteticos especificos de drug discovery y formulacion, por lo que puede asistir en la generacion de hipotesis sobre moleculas, excipientes y estrategias de formulacion.
- Tutoria STEM automatizada: con 4B parametros y licencia Apache 2.0, se puede desplegar en infraestructura propia para dar soporte educativo en matematicas y ciencias, con coste de inferencia bajo.
- Generacion de documentacion tecnica y analisis de ingenieria: redaccion de explicaciones tecnicas, revision de calculos y analisis de problemas de ingenieria gracias a su especializacion STEM.
- Entornos de investigacion sin censura: al ser un modelo abliterated/uncensored, es adecuado para explorar temas cientificos sensibles (toxicologia, farmacologia, quimica de sustancias controladas) donde los modelos alineados rechazan responder.
- Prototipado en GPU de consumo: con 4B parametros y cuantizaciones GGUF disponibles, sirve para experimentar con razonamiento STEM en estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 9-10 GB (4.539 millones de parametros x 2 bytes mas overhead); en cuantizacion de 8 bits, unos 5-6 GB; en 4 bits (GGUF Q4), unos 3-4 GB.
- GPU recomendadas: A100 o H100 para despliegue en FP16 con throughput alto; RTX 4090 o RTX 3090 para FP16 en una sola GPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16, y en GPUs con 6-8 GB (RTX 3060, RTX 4060 Ti) usando cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria indicada), text-generation-inference (tag), vLLM, llama.cpp y Ollama mediante los GGUFs de terceros enlazados por el autor, y Unsloth para fine-tuning.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4.539 M | no disponible | STEM, matematicas, farmacia, sin censura | Apache 2.0 | Hugging Face, GGUFs de terceros |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | no disponible | no disponible | Version ampliada del mismo linaje | no disponible | Hugging Face (referenciado por el autor) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | no disponible | no disponible | Razonamiento destilado de DeepSeek-V4-Pro | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B | 4.000 M (aprox.) | no disponible | Modelo fundacional multimodal generalista | no disponible | Hugging Face |

La comparativa se limita a los modelos del mismo linaje porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas externas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de destilaciones de modelos frontera y de un modelo "abliterated", puede reproducir sesgos de esos profesores y presentar menor alineacion de seguridad.
- Riesgo de alucinacion: inherente a los modelos de 4B y acentuado por el entrenamiento en trazas sinteticas de razonamiento; las respuestas cientificas y farmaceuticas deben verificarse.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y los idiomas soportados no estan documentados; el soporte multilingue se menciona solo de forma generica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datasets de destilacion pueden tener terminos propios que conviene revisar antes de produccion.
- Modelo no censurado: la naturaleza "uncensored/abliterated" implica que puede generar contenido que otros modelos rechazan; requiere filtros y politicas de uso en despliegues publicos.
- Capacidad multimodal no entrenada en este ajuste: aunque hereda el pipeline image-text-to-text, el fine-tune adicional es textual y no representa una etapa de vision.
- Datos de entrenamiento limitados: unos 11.000 ejemplos es una mezcla pequena; el rendimiento puede degradarse fuera de los dominios STEM y farmaceutico.
- Fecha de creacion inusual (2026-11-02) y nombres de datasets con modelos no verificables; conviene contrastar la procedencia antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Modelo base (uncensored): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo upstream de Jackrong: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Version 9B: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Cuantizaciones y GGUFs: https://huggingface.co/models?other=base_model:adapter:xtools-at/Qwen3.5-4B-DeepThought-STEM
- Dataset Claude Haiku 5.5: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
- Dataset Xiaomi MiMo 2.6 Pro: https://huggingface.co/datasets/xtools-at/Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x
- Dataset ChatGPT Terra 6.1: https://huggingface.co/datasets/xtools-at/ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x
- Dataset GPT-5.6 Luna: https://huggingface.co/datasets/Roman1111111/GPT-5.6-luna-reasoning-102881x
- Dataset GLM-5.1 Mathematics: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned/viewer/Math
- Dataset red-pill drug discovery: https://huggingface.co/datasets/xtools-at/red-pill-drug-discovery-formulation-synthetic-reasoning
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
