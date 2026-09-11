# xbikevn/LightOnOCR-2-1B-viv1-vllm

## Resumen

LightOnOCR-2-1B-viv1-vllm es una variante ajustada (fine-tune) del modelo de vision-lenguaje xbikevn/LightOnOCR-2-1B-vi, publicada por el usuario xbikevn en Hugging Face. Se trata de un modelo denso de aproximadamente 1.005 millones de parametros orientado a tareas de OCR end-to-end, es decir, recibe una imagen de documento y devuelve texto directamente, sin necesidad de un pipeline separado de deteccion de lineas, recorte y reconocimiento. La nomenclatura del repositorio y la etiqueta `endpoints_compatible` apuntan a una build preparada para servir con vLLM o con Inference Endpoints, aunque esto no se confirma explicitamente en la model card.

El modelo pertenece a la familia LightOnOCR-2-1B, desarrollada por LightOn y publicada originalmente como `lightonai/LightOnOCR-2-1B`. Segun la informacion de busqueda, esa familia se entreno con tecnicas de RLVR/GRPO sobre checkpoints preentrenados (`LightOnOCR-2-1B-base` para OCR y `LightOnOCR-2-1B-bbox-base` para localizacion), y esta descrita como multilingue en el paper asociado. La relevancia actual de esta ficha concreta es limitada: tiene cero descargas y cero likes, y su model card es autogenerada por el Trainer, con la mayoria de secciones marcadas como "More information needed".

Conviene subrayar que los datos tecnicos de entrenamiento de esta variante concreta son muy incompletos. Se conocen los hiperparametros del ajuste, pero no el dataset, ni el idioma de especializacion, ni resultados de evaluacion. Todo lo que aparece en las secciones siguientes se limita a lo declarado por el autor o a lo publicado sobre el modelo base de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) end-to-end para OCR; tipo exacto de backbone no disponible |
| Parametros totales | 1.005.647.872 (aprox. 1B), segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se listan variantes cuantizadas en el repositorio; al ser pesos safetensors es cuantizable a posteriori (por ejemplo con bitsandbytes). No hay GGUF publicado |
| Idiomas soportados | no disponible en los metadatos. El modelo base de la familia se describe como multilingue y el sufijo `-vi` de la cadena de modelos padre sugiere una especializacion en vietnamita, sin confirmar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 7,3 GB |
| Modalidad de entrada/salida | image-text-to-text |
| Modelo base | xbikevn/LightOnOCR-2-1B-vi |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de esta variante concreta. Por la familia a la que pertenece, se trata de un modelo de vision-lenguaje end-to-end para OCR: un codificador visual que procesa la imagen del documento y un decodificador de lenguaje que genera el texto reconocido, entrenado para producir la transcripcion completa sin etapas intermedias de segmentacion. El paper de referencia de la familia (`LightOnOCR: A 1B End-to-End Multilingual Vision-Language Model for State-of-the-Art OCR`, arXiv 2601.14251) describe un entrenamiento con GRPO sobre los checkpoints de preentrenamiento `LightOnOCR-2-1B-base` (OCR) y `LightOnOCR-2-1B-bbox-base` (localizacion), con AdamW, recompensas escaladas por grupo, importance sampling a nivel de token y multiples rollouts por prompt (28 para OCR y 14 para bbox), generados con vLLM e implementado con TRL. Esos detalles corresponden al modelo base de LightOn, no necesariamente a este fine-tune derivado.

En cuanto a este repositorio, la model card es autogenerada por el Trainer y solo aporta los hiperparametros del ajuste: learning rate de 6e-05, tamano de batch de entrenamiento 4, batch de evaluacion 6, acumulacion de gradientes 4 (batch total efectivo 16), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 10 pasos de calentamiento y una sola epoca. El dataset de entrenamiento figura como "unknown dataset" y no se documenta composicion, numero de tokens ni si hubo fases de RLHF o DPO adicionales. Las versiones de framework declaradas son Transformers 5.0.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Reconocimiento optico de caracteres end-to-end: dado un documento como imagen, el modelo genera el texto correspondiente en una sola pasada.
- Procesamiento de documentos completos en lugar de lineas aisladas, segun el diseno de la familia LightOnOCR.
- Modalidad conversacional declarada mediante la etiqueta `conversational`, aunque el alcance real de la conversacion multi-turno no se documenta.
- Capacidad multilingue probable (heredada del modelo base de la familia, descrito como multilingue); idiomas concretos no confirmados para esta variante.
- Sufijo `-vllm` y etiqueta `endpoints_compatible`: se infiere compatibilidad con despliegue en vLLM y en Hugging Face Inference Endpoints, no confirmada en la documentacion.
- Soporte de tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona.
- Modo "thinking", vision mas alla de OCR, audio: no disponible.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo convierte cada pagina en texto sin pipeline de deteccion y recorte, lo que simplifica la ingesta por lotes en repositorios documentales y reduce el numero de componentes a mantener.
- Extraccion de datos de facturas y albaranes: al recibir la imagen completa y devolver texto, permite alimentar despues un parser o un modelo de extraccion estructurada para obtener campos como CIF, base imponible y fecha.
- Procesamiento de formularios y documentos administrativos: adecuado para digitalizar impresos con maquetacion variable, donde los enfoques por lineas suelen fallar al perder la estructura de campos.
- Construccion de pipelines RAG sobre documentacion corporativa: el OCR es la primera etapa para convertir PDF escaneados en texto indexable en una base vectorial, y un modelo de 1B mantiene el coste de computo bajo en esa fase.
- Transcripcion de documentos multilingues: si se confirma la herencia multilingue del modelo base, serviria para lotes de documentos en varios idiomas sin desplegar un OCR distinto por lengua.
- Digitalizacion de documentacion en vietnamita: el sufijo `-vi` de la cadena de modelos padre apunta a este escenario, muy relevante para mercado local, aunque la especializacion no esta confirmada en la model card.
- Accesibilidad: conversion de material impreso o escaneado a texto legible por sintetizadores de voz y lectores de pantalla.
- Servicio de OCR como API interna: con 1B de parametros y pesos safetensors, es viable exponerlo tras vLLM en una GPU unica para atender peticiones concurrentes de un equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El array `results` del `model-index` de la model card esta vacio y no se aportan cifras de MMLU, HumanEval, GSM8K, ni de metricas especificas de OCR como CER, WER, edit distance o exact match sobre OmniDocBench u otros conjuntos de evaluacion documental.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): alrededor de 2 GB en FP16/BF16 y de 0,5 a 1 GB en cuantizacion de 8 o 4 bits, a lo que hay que sumar la memoria del codificador visual, el cache KV y el overhead del runtime. No son cifras publicadas por el autor, sino estimaciones a partir del numero de parametros.
- El repositorio ocupa 7,3 GB, lo que sugiere que contiene mas de una copia de los pesos o precision superior a FP16; conviene inspeccionar los archivos antes de planificar el despliegue.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 con lotes pequenos. Para servir con alta concurrencia, una L4, A10G, A100 o H100 permiten lotes mayores y mejor throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En cuantizacion a 4 bits podria caber en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM (sugerido por el sufijo del repositorio) y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). TGI es probablemente compatible al ser un modelo transformers, pero no esta confirmado. Ollama y llama.cpp requeririan convertir los pesos a GGUF, formato que no se publica en este repositorio.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xbikevn/LightOnOCR-2-1B-viv1-vllm | 1,005.647.872 | no disponible | no disponible (sin benchmarks) | apache-2.0 | Hugging Face, 0 descargas |
| xbikevn/LightOnOCR-2-1B-vi (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| lightonai/LightOnOCR-2-1B (modelo original de la familia) | 1B (segun el paper) | no disponible | descrito por LightOn como su modelo OCR insignia, afinado con RLVR; cifras concretas no disponibles en la informacion recogida | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas de otros proveedores, como modelos OCR propietarios o VLMs genericos de tamano similar: no hay cifras de rendimiento publicadas para esta variante ni contexto declarado.

## Limitaciones y advertencias

- La model card es autogenerada por el Trainer y la mayoria de secciones (descripcion, usos previstos, datos de entrenamiento, resultados) estan marcadas como "More information needed".
- No se documenta el dataset de ajuste, por lo que se desconoce la composicion, el idioma y el dominio de los datos. El riesgo de sesgo hacia dominios o lenguas concretas es alto y no cuantificable.
- No hay resultados de evaluacion publicados: no es posible estimar la tasa de error de reconocimiento (CER o WER) ni compararla con alternativas.
- Riesgo de alucinacion: como todo modelo generativo aplicado a OCR, puede producir texto plausible que no aparece en la imagen, especialmente en documentos degradados, manuscritos o con maquetacion compleja. No hay documentacion sobre mitigaciones.
- La ventana de contexto no esta publicada, lo que impide saber cuantos tokens de salida o cuantas paginas por peticion admite de forma fiable.
- El sufijo `-vi` sugiere especializacion en vietnamita y el sufijo `-vllm` un empaquetado para ese runtime; ninguna de las dos cosas esta confirmada en la documentacion.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por parte de terceros.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero conviene verificar la licencia del modelo base de la cadena (`lightonai/LightOnOCR-2-1B`), que no se especifica en la informacion disponible y cuyas condiciones podrian ser distintas.
- Al ser un fine-tune de un modelo de 1B, es esperable un rendimiento inferior al de VLMs mucho mayores en documentos con layouts muy complejos, tablas densas o caligrafia; no hay datos que lo confirmen o desmientan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xbikevn/LightOnOCR-2-1B-viv1-vllm
- Modelo base directo: https://huggingface.co/xbikevn/LightOnOCR-2-1B-vi
- Modelo original de la familia: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Paper de la familia LightOnOCR: https://arxiv.org/html/2601.14251v1
