# toffee4u/Lumi-v2

## Resumen

Lumi-v2 es un ajuste fino (fine-tuning) del modelo Qwen3.5-9B, desarrollado por el usuario toffee4u y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta tanto texto como imagenes como entrada y genera texto. Con 9.653.104.368 parametros (aproximadamente 9,65 mil millones), se posiciona en la gama de modelos de tamano medio, apto para despliegue en hardware de una sola GPU de gama alta o en configuraciones multi-GPU mas modestas.

El modelo parte de la base unsloth/Qwen3.5-9B, una version optimizada del Qwen3.5-9B de Alibaba para entrenamiento eficiente con la libreria Unsloth. Segun la model card, el ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, lo que permitio un entrenamiento aproximadamente dos veces mas rapido que con un pipeline convencional. Los pesos se distribuyen en formato FP16 (16 bits), con un tamano de repositorio de 19,3 GB.

La relevancia de Lumi-v2 radica en su naturaleza de modelo ajustado sobre una base reciente y multimodal, con licencia permisiva (Apache 2.0) que facilita su uso comercial. No obstante, la informacion publicada es muy escasa: no se detallan los datos de entrenamiento, el proposito del ajuste ni los resultados de evaluacion, lo que limita la evaluacion rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

Lumi-v2 es un ajuste fino del modelo unsloth/Qwen3.5-9B, que a su vez deriva de la familia Qwen3.5 de Alibaba. La arquitectura subyacente es un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text), con aproximadamente 9,65 mil millones de parametros. No se dispone de informacion detallada sobre la composicion exacta de la arquitectura (numero de capas, dimension del modelo, mecanismo de atencion, codificador visual) en la informacion proporcionada.

El entrenamiento del ajuste fino se realizo con la libreria Unsloth y TRL de Hugging Face, segun la model card, con una velocidad aproximadamente dos veces superior a la de un pipeline estandar. Los pesos resultantes se publicaron en FP16. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion adicionales. Tampoco se documentan innovaciones tecnicas propias del ajuste.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta conversational).
- Procesamiento conjunto de imagen y texto (image-text-to-text): el modelo puede recibir imagenes junto con instrucciones en lenguaje natural.
- Compatibilidad con text-generation-inference (TGI) y transformers.
- Soporte declarado unicamente para ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes: el modelo puede recibir una imagen y generar una descripcion textual o responder preguntas sobre su contenido, gracias a su pipeline image-text-to-text.
- Asistentes conversacionales en ingles: adecuado para chatbots de dominio general en ingles, dado su entrenamiento conversacional y su tamano de 9,65 mil millones de parametros.
- Extraccion de informacion de documentos escaneados: combinando entrada visual y textual, puede transcribir o resumir contenido de capturas y documentos.
- Prototipado rapido de aplicaciones multimodales: su licencia Apache 2.0 y formato safetensors facilitan la integracion en pipelines de transformers y TGI para pruebas de concepto.
- Ajuste adicional sobre dominio especifico: al ser un modelo ya ajustado y de tamano medio, sirve como punto de partida para nuevos fine-tunings con Unsloth en hardware asequible.
- Educacion y experimentacion: util para investigadores que necesiten un modelo multimodal de ~9,65B con licencia permisiva para comparativas o estudios de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 19,3 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB de VRAM para contexto corto.
- Cuantizacion a 8 bits: aproximadamente 10-11 GB de VRAM; a 4 bits: aproximadamente 5-6 GB (estimaciones teoricas segun el numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 12-16 GB para cuantizacion a 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 con contexto moderado, y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no confirmado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumi-v2 (toffee4u) | 9,65B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9B (aproximado) | no disponible | multimodal | no disponible en la informacion | Hugging Face |
| unsloth/Qwen3.5-9B | 9B (aproximado) | no disponible | multimodal | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta datos de entrenamiento, proposito del ajuste ni evaluaciones, lo que impide verificar sus capacidades reales.
- Idioma: solo se declara soporte para ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documentan analisis de sesgos; al derivar de Qwen3.5, puede heredar sesgos de los datos de preentrenamiento de la base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base (Qwen3.5-9B) y de unsloth/Qwen3.5-9B.
- Contexto: se desconoce la longitud maxima de contexto soportada, lo que limita la planificacion de aplicaciones con documentos largos.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Produccion: sin benchmarks ni documentacion de robustez, no se recomienda su uso en entornos criticos sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/toffee4u/Lumi-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
