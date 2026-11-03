# xtools-at/Qwen3.5-9B-DeepThought-STEM

## Resumen

Deep Thought 9B es un ajuste fino mediante LoRA en 16 bits sobre Qwen3.5-9B, desarrollado por xtools-at, especializado en razonamiento avanzado, matematicas, resolucion de problemas cientificos y conocimiento tecnico. Parte del checkpoint no censurado xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, que a su vez deriva del fine-tune de Jackrong destilado de respuestas de DeepSeek-V4-Pro. El objetivo declarado es empujar un modelo de razonamiento ya capaz hacia dominios donde el pensamiento riguroso y el conocimiento especializado son criticos: matematicas, fisica, quimica, biologia, ingenieria y descubrimiento de farmacos.

El modelo hereda la arquitectura de Qwen3.5-9B, un modelo fundacional multimodal de 9.409.813.744 parametros (segun los pesos en safetensors), con pipeline image-text-to-text. La fina capa adicional se entrena sobre un conjunto de aproximadamente 11.000 ejemplos, combinando destilaciones de razonamiento de modelos frontera (Claude Haiku 5.5, Xiaomi MiMo 2.6 Pro, ChatGPT Terra 6.1, GPT-5.6 Luna, GLM-5.1) con datos sinteticos de descubrimiento y formulacion farmaceutica y una mezcla de calibracion basada en smoltalk2.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: la destilacion de trazas de razonamiento de modelos propietarios, la especializacion vertical en STEM y farmaceutica, y la eliminacion de censura (abliteration) manteniendo licencia Apache 2.0. El repositorio ocupa 18,8 GB y esta pensado para inferencia con transformers, TGI y cuantizaciones derivadas publicadas por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen cuantizaciones/GGUF de la comunidad referenciadas por el autor |
| Idiomas soportados | no disponible (la model card menciona conocimiento cientifico multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer multimodal de 9B parametros que acepta entradas de imagen y texto. Sobre esa base, xtools-at aplica un ajuste fino LoRA en 16 bits (etiquetas lora, peft, unsloth). La linea de razonamiento procede del fine-tune de Jackrong, entrenado con supervised fine-tuning sobre aproximadamente 250.000 muestras de matematicas y STEM y refinado con una etapa ligera de reinforcement learning usando GSPO; esa historia corresponde al modelo upstream, no al entrenamiento propio de Deep Thought.

El entrenamiento adicional de Deep Thought usa aproximadamente 11.000+ ejemplos organizados en tres grupos, con un 5% reservado como evaluacion. El grupo de razonamiento (6.022 ejemplos) combina destilaciones: Claude Haiku 5.5 (2.936), Xiaomi MiMo 2.6 Pro (178), ChatGPT Terra 6.1 (75), GPT-5.6 Luna (1.633, con fisica, quimica, biologia e informatica) y GLM-5.1 Mathematics (1.200). Se suman datos sinteticos de descubrimiento y formulacion farmaceutica (red-pill-drug-discovery-formulation y su variante sintetica) y una mezcla de calibracion con HuggingFaceTB/smoltalk2. Los datos adicionales son textuales: no hay una etapa dedicada de entrenamiento de vision. La model card no detalla el numero total de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos.
- Matematicas avanzadas: algebra, calculo, demostraciones, derivaciones y razonamiento cuantitativo.
- Ciencia a nivel doctoral: fisica, quimica, biologia y preguntas cientificas complejas.
- STEM e ingenieria: analisis tecnico y conocimiento cientifico multilingue.
- Descubrimiento de farmacos: razonamiento molecular, investigacion farmaceutica y desarrollo de formulaciones.
- Entrada multimodal imagen-texto heredada de Qwen3.5-9B (sin etapa de entrenamiento visual especifica en este fine-tune).
- Estilo de razonamiento destilado de modelos frontera, con trazas sinteticas de resolucion de problemas.
- Modelo descensurado/abliterated: sin las restricciones de rechazo del modelo base original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: razonamiento multi-paso si, orquestacion de agentes no documentada.
- Capacidades multilingues: mencionadas de forma generica, sin lista de idiomas.

## Casos de uso

- Tutoria y resolucion de problemas de matematicas avanzadas: el modelo puede generar demostraciones paso a paso y derivaciones algebraicas o de calculo, aprovechando los 1.200 ejemplos de GLM-5.1 Mathematics y las trazas de razonamiento destiladas.
- Asistencia en investigacion cientifica: respuesta a preguntas de fisica, quimica y biologia de nivel doctoral, con descomposicion explicita del razonamiento, util para revisar hipotesis o preparar material de laboratorio.
- Descubrimiento y formulacion de farmacos: analisis de moleculas, razonamiento sobre propiedades fisicoquimicas y desarrollo de formulaciones, apoyado en los datasets sinteticos de drug discovery incluidos en el entrenamiento.
- Generacion de material docente STEM: creacion de problemas, soluciones razonadas y explicaciones tecnicas para cursos universitarios, con estilo de razonamiento estructurado.
- Analisis de documentacion tecnica y cientifica: resumen y extraccion de conclusiones de papers o informes de ingenieria, con capacidad multimodal para figuras y tablas si se usa la entrada de imagen heredada.
- Prototipado de asistentes de investigacion sin restricciones de contenido: al ser un modelo abliterated, permite explorar dominios sensibles (toxicologia, quimica de formulaciones) sin rechazos, siempre bajo supervision y cumplimiento normativo.
- Evaluacion comparativa de modelos de razonamiento: util como checkpoint de referencia en pruebas internas de razonamiento matematico y cientifico frente a otros fine-tunes de Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB.
- Cuantizacion en 8 bits: alrededor de 10-11 GB de pesos, viable en GPUs de 16-24 GB.
- Cuantizacion en 4 bits (GGUF Q4): alrededor de 5-6 GB, cabe en GPUs consumer de 8 GB o superiores.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo y throughput alto; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para 8 bits; RTX 3060 12 GB o superiores para 4 bits.
- Cabe en GPU consumer: si, en cuantizaciones de 4 y 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp/Ollama mediante los GGUF de la comunidad, y vLLM si el soporte de qwen3_5 esta disponible en la version correspondiente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deep Thought 9B (este) | 9,41B | no disponible | STEM, matematicas, farmaceutica, sin censura | Apache 2.0 | HuggingFace |
| Qwen3.5-9B (base) | 9B | no disponible | Fundacional multimodal | no disponible en la informacion | HuggingFace (Qwen) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9B | no disponible | Razonamiento matematico/STEM destilado | no disponible en la informacion | HuggingFace |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4B aprox. | no disponible | Version reducida del mismo fine-tune | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Modelo descensurado/abliterated: la eliminacion de rechazos aumenta el riesgo de generar contenido danino, incluyendo informacion sensible en quimica o farmacologia; requiere filtros externos en produccion.
- Riesgo de alucinacion: las trazas de razonamiento sinteticas y la destilacion de modelos frontera no garantizan correccion factual; en matematicas y ciencia conviene verificar resultados.
- Datos de entrenamiento mayoritariamente sinteticos y de tamano modesto (11.000+ ejemplos), lo que puede limitar la generalizacion fuera de los dominios cubiertos.
- La model card no especifica longitud de contexto, idiomas soportados ni regimen de tool calling; no asumir estas capacidades sin validacion.
- No se ha realizado una etapa dedicada de entrenamiento de vision: la capacidad multimodal es la heredada del base y puede degradarse tras el fine-tune.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de una cadena de fine-tunes cuyas condiciones upstream no se detallan en la informacion disponible; conviene revisar las licencias de Jackrong y Qwen3.5-9B.
- Sin descargas ni likes en el momento de la consulta: ecosistema de cuantizaciones y validacion comunitaria aun incipiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Modelo base (no censurado): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo upstream de Jackrong: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Modelo fundacional Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Version reducida 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Cuantizaciones/GGUF de la comunidad: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwen3.5-9B-DeepThought-STEM
- Dataset Claude Haiku 5.5: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
- Dataset Xiaomi MiMo 2.6 Pro: https://huggingface.co/datasets/xtools-at/Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x
- Dataset ChatGPT Terra 6.1: https://huggingface.co/datasets/xtools-at/ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x
- Dataset GPT-5.6 Luna: https://huggingface.co/datasets/Roman1111111/GPT-5.6-luna-reasoning-102881x
- Dataset GLM-5.1 Reasoning: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Dataset GLM-5.1 1M: https://huggingface.co/datasets/Kassadin88/GLM-5.1-1000000x
- Dataset drug discovery sintetico: https://huggingface.co/datasets/xtools-at/red-pill-drug-discovery-formulation-synthetic-reasoning
- Dataset drug discovery: https://huggingface.co/datasets/saidutta69/red-pill-drug-discovery-formulation
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
