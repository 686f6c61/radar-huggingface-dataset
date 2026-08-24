# wrchen1/LatentMT-2.6B-eng-latn-knc-latn

## Resumen

LatentMT-2.6B-eng-latn-knc-latn es un adaptador LoRA publicado por Wei-Rui Chen y colaboradores como parte del trabajo de investigación *LatentMT: Machine Translation with Latent Reasoning* (arXiv:2607.18618). El adaptador se entrena sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje de 2.600 millones de parámetros con capacidades de razonamiento, y está especializado en la traducción automática del par de idiomas inglés (eng_Latn) a k'iche' (knc_Latn), una lengua maya hablada en Guatemala.

La propuesta principal del paper es el uso de *razonamiento latente*: en lugar de generar una cadena de pensamiento explícita en forma de tokens, el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos (con una profundidad recurrente de 4) antes de producir la traducción. Este enfoque permite mejorar la calidad de la traducción sin aumentar el número de tokens generados, lo que resulta especialmente relevante para lenguas de bajos recursos donde los datos de entrenamiento son escasos.

El repositorio contiene únicamente los archivos del adaptador (adapter_config.json, adapter_model.safetensors y README.md), con un tamaño total de 0,1 GB. Se distribuye bajo licencia Apache 2.0, al igual que el modelo base, y está pensado exclusivamente para fines de investigación en traducción automática.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre ByteDance/Ouro-2.6B-Thinking |
| Parametros totales | No disponible (el adaptador es de 0,1 GB; el modelo base tiene 2.600 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Ouro-2.6B-Thinking) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion via bitsandbytes) |
| Idiomas soportados | Ingles (eng_Latn) a k'iche' (knc_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje autoregresivo de 2.600 millones de parametros con capacidad de razonamiento explicito (thinking mode). La innovacion principal de LatentMT consiste en desviar ese razonamiento hacia el espacio latente: en lugar de generar tokens de cadena de pensamiento visibles, el modelo ejecuta pasos recurrentes adicionales dentro de los estados ocultos del transformer. En este checkpoint concreto, la profundidad recurrente es de 4, lo que significa que cada capa del modelo se aplica cuatro veces sobre la representacion interna antes de continuar con la siguiente.

El entrenamiento se realizo mediante fine-tuning con LoRA, lo que permite adaptar el modelo base a la tarea de traduccion con un coste computacional reducido. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. El adaptador esta disenado para cargarse con la libreria PEFT y requiere las versiones torch 2.7.1, transformers 4.56.2, datasets>=2.14.0, peft>=0.10.0 y bitsandbytes>=0.41.0.

## Capacidades

- Traduccion automatica del ingles al k'iche' (lengua maya de Guatemala) en escritura latina.
- Razonamiento latente: realiza pasos recurrentes internos (profundidad 4) que mejoran la calidad de la traduccion sin generar tokens adicionales de chain-of-thought.
- Generacion de texto autoregresiva estandar, compatible con el pipeline de text-generation de HuggingFace.
- Soporte para inferencia con cache (use_cache=True) para acelerar la generacion.
- No incluye capacidades de tool calling, vision, audio ni agentes; es un adaptador especializado en una unica tarea de traduccion.

## Casos de uso

- Traduccion de documentos legales y administrativos: el k'iche' es una lengua oficial en Guatemala, y este adaptador puede emplearse para traducir textos oficiales del ingles al k'iche', facilitando el acceso a informacion gubernamental a hablantes nativos.
- Preservacion linguistica: investigadores y organizaciones pueden utilizar el modelo para digitalizar y traducir contenido al k'iche', contribuyendo a la documentacion y revitalizacion de una lengua con recursos limitados.
- Educacion bilingue: el adaptador puede integrarse en plataformas educativas para generar materiales didacticos en k'iche' a partir de contenidos en ingles, apoyando la ensenanza en escuelas de zonas mayas.
- Investigacion en traduccion de bajos recursos: el checkpoint sirve como punto de partida para experimentos sobre tecnicas de razonamiento latente en pares de idiomas con pocos datos, comparando su rendimiento frente a enfoques de chain-of-thought explicito.
- Desarrollo de asistentes de traduccion para ONGs: organizaciones no gubernamentales que trabajan en comunidades k'iche' pueden desplegar el modelo en entornos locales para traducir comunicaciones, informes o formularios.
- Evaluacion comparativa de adaptadores LoRA: al ser un adaptador ligero (0,1 GB), puede usarse en pipelines de evaluacion rapida para medir la eficacia del razonamiento latente frente a otros metodos de fine-tuning en tareas de MT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2607.18618) no se ha podido consultar directamente, por lo que se desconocen metricas como BLEU, chrF o COMET para este par de idiomas. Tampoco se ofrecen comparaciones con otros modelos de traduccion en la model card.

## Requisitos de hardware

- VRAM estimada: el modelo base Ouro-2.6B-Thinking requiere aproximadamente 5-6 GB en FP16 para inferencia. Con cuantizacion de 4 bits (bitsandbytes) puede reducirse a unos 2-3 GB. El adaptador LoRA anade un coste minimo adicional.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 o superiores pueden ejecutar el modelo sin problemas. Para despliegues mas rapidos, una A100 o H100 seria adecuada.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo con 8 GB o mas de VRAM, especialmente con cuantizacion.
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base, por lo que puede usarse con transformers, vLLM (si soporta el modelo base), llama.cpp (si se convierte a GGUF) u Ollama (mediante integracion personalizada).
- Latencia y throughput: no se dispone de datos medidos. Con profundidad recurrente 4, la latencia sera aproximadamente 4 veces mayor que la de una pasada estandar del modelo base, aunque el numero de tokens generados es menor al no producir chain-of-thought.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de traduccion para el par ingles-k'iche'. El propio paper LatentMT publica adaptadores para otros pares de idiomas de bajos recursos (por ejemplo, eng_Latn-crh_Latn para crimeo tartaro), pero no se han encontrado datos de rendimiento relativos. Como referencia, los modelos genericos de traduccion como NLLB-200 de Meta o M2M-100 de Facebook AI cubren el k'iche' en algunos casos, pero no se han publicado comparaciones directas con este adaptador.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo de produccion. No se garantiza su robustez en entornos reales sin una evaluacion adicional.
- Solo cubre el par de idiomas ingles a k'iche'. No es util para traduccion inversa (k'iche' a ingles) ni para otros idiomas.
- Requiere el modelo base ByteDance/Ouro-2.6B-Thinking, que debe descargarse por separado. El adaptador no funciona de forma autonoma.
- No se han publicado datos sobre sesgos, alucinaciones o calidad en dominios especificos (medico, legal, tecnico). Es probable que presente errores en terminologia especializada.
- La profundidad recurrente de 4 aumenta el coste computacional por token generado, lo que puede resultar lento en hardware modesto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tambien debe cumplir su propia licencia (Apache 2.0 segun la model card). Se recomienda verificar los terminos del modelo base antes de un despliegue comercial.
- No se incluyen datos de entrenamiento ni detalles sobre el dataset, lo que limita la reproducibilidad y la comprension de posibles sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-knc-latn
- Paper (arXiv): https://arxiv.org/abs/2607.18618
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio alternativo del mismo adaptador: https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-knc-latn
- Adaptador para otro par de idiomas (crh): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-crh-latn
