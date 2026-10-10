# Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ

## Resumen

LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ es una version cuantizada a INT4 del modelo multimodal LightOnOCR-3-0.8B desarrollado por LightOn. Se trata de un modelo vision-lenguaje extremo a extremo especializado en transcripcion de documentos, comprension de layout, grounding visual y extraccion estructurada de figuras y tablas. La publicacion corre a cargo del usuario Vishva007 en HuggingFace y su aportacion no es el modelo base, sino los pesos comprimidos con Intel AutoRound bajo un esquema W4A16 (pesos INT4, activaciones BF16) en formato compatible con GPTQ y Marlin.

El modelo base parte de la arquitectura Qwen3.5 y cuenta con 852.985.920 parametros (~0,85 mil millones), lo que lo situa en la categoria de modelos compactos para tareas documentales. El repositorio pesa 1,0 GB e incluye la torre de vision y el proyector multimodal sin cuantizar, en BF16, una decision explicita del autor para evitar la degradacion del OCR y del grounding. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que permite ejecutar un modelo de parsing documental de alta fidelidad con un consumo de VRAM muy reducido, apto para GPU de consumo, y servirlo a alta concurrencia con vLLM. La cuantizacion mantiene el pipeline en `transformers>=5.5.4` y ofrece repositorios hermanos para distintos backends de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer basada en Qwen3.5 (tag `qwen3_5`), con torre de vision y proyector multimodal |
| Parametros totales | 852.985.920 (~0,85 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en la configuracion de servido recomendada (`--max-model-len 8192`); maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16), grupo de tamano 32, simetria activada, 1.200 iteraciones, 512 muestras de calibracion con `seqlen=4096`; torre de vision y proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (variante GPTQ / AutoGPTQ, compatible con Marlin) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 1,0 GB |
| Modelo base | lightonai/LightOnOCR-3-0.8B |
| Fecha de publicacion | 10 de octubre de 2026 (segun metadatos de HuggingFace) |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5 adaptada a un caso de uso multimodal de documentos: un encoder de vision acoplado a un transformer de lenguaje mediante un proyector multimodal, con una unica pasada de decodificacion autorregresiva. LightOn describe la familia LightOnOCR-3 como modelos OCR extremo a extremo capaces de resolver texto, layout, imagenes y graficos desde un unico modelo compacto. El modelo opera en dos modos declarados por el autor de la cuantizacion: transcripcion directa a Markdown cuando el prompt va vacio, y modo grounding cuando se envia el prompt `grounding`, en el que devuelve cajas delimitadoras normalizadas en el rango `[0, 1000]` junto a etiquetas semanticas (`text`, `title`, `table`, `image`, `chart`, entre otras).

Sobre el proceso de compresion, el autor aplico Intel AutoRound con configuracion orientada a produccion: 1.200 iteraciones de optimizacion de redondeo, 512 muestras de calibracion a longitud 4.096 y cuantizacion simetrica por grupos de 32 pesos. El detalle mas relevante es `quant_nontext_module=False`, es decir, la torre de vision y el proyector multimodal se mantienen en BF16 para no degradar la precision del OCR ni de las coordenadas de grounding. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO en su alineamiento.

## Capacidades

- Transcripcion de documentos a Markdown preservando la estructura de layout, sin cajas delimitadoras (modo `prompt = ""`).
- Grounding visual: genera cajas delimitadoras normalizadas `[0, 1000]` y etiquetas semanticas por componente del documento.
- Comprension de layout: identificacion y clasificacion de titulos, bloques de texto, tablas, imagenes y graficos.
- Extraccion de tablas y formularios, segun las etiquetas declaradas en el repositorio (`tables`, `forms`).
- Extraccion estructurada de figuras y graficos.
- Procesamiento de documentos escaneados e imagenes de recibos (el ejemplo oficial usa el fixture SROIE-receipt).
- Modo conversacional segun la etiqueta `conversational` del repositorio.
- Modo thinking desactivado de forma explicita (`enable_thinking=False`); el modelo esta optimizado para funcionar sin tokens de razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo transcribe el documento completo a Markdown y, en modo grounding, devuelve las coordenadas de cada campo, lo que permite mapear importes, fechas y lineas de detalle a un esquema estructurado sin plantillas especificas por proveedor.
- Pipeline de RAG documental: convertir PDFs escaneados a Markdown en 400 DPI con la dimension mayor a 2.048 px antes de trocear el texto, preservando la jerarquia de titulos y tablas para mejorar la calidad de la recuperacion.
- Extraccion de tablas financieras: el modo grounding etiqueta los componentes como `table`, lo que permite aislar la region de la tabla antes de aplicar un postprocesado a CSV o JSON.
- Automatizacion de archivo y cumplimiento normativo: procesamiento por lotes de expedientes escaneados con trazabilidad de la region de origen de cada fragmento extraido gracias a las cajas delimitadoras.
- Servicio OCR de alta concurrencia: desplegado con vLLM y `--max-model-len 8192`, el modelo puede atender multiples peticiones concurrentes con un consumo de memoria por replica muy bajo, adecuado para picos de carga.
- Extraccion de contenido de graficos e imagenes: el etiquetado `chart` e `image` permite separar elementos no textuales para su posterior analisis o descripcion.
- Procesamiento on-premise en hardware modesto: al ocupar aproximadamente 1 GB de pesos, puede ejecutarse en estaciones de trabajo con GPU de gama media sin salida de datos a la nube, un requisito habitual en banca, seguros y sanidad.
- Preprocesado de formularios administrativos: la combinacion de transcripcion y grounding permite validar que los campos obligatorios existen y estan correctamente localizados antes de derivar el documento a revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos cuantizados: aproximadamente 0,43 GB para el transformer en INT4 (853 M de parametros a 4 bits) mas la torre de vision y el proyector en BF16; el repositorio completo ocupa 1,0 GB.
- VRAM estimada para inferencia: se estima un rango de 1,5 a 3 GB incluyendo pesos, activaciones BF16 y cache KV para 8.192 tokens y una imagen de entrada a 2.048 px. Los valores concretos dependen del motor de inferencia y del lote.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090; tambien en GPUs con 4-6 GB de VRAM si se limita la longitud de contexto.
- GPU de centro de datos: A100, H100, L40S o similares, donde el cuello de botella pasa a ser el preprocesado de imagenes y no el modelo.
- Opciones de despliegue: `transformers>=5.5.4` con `AutoModelForImageTextToText` y `AutoProcessor`; vLLM con `--trust-remote-code --dtype bfloat16 --max-model-len 8192`; backends AutoGPTQ y Marlin mediante el repositorio hermano GPTQ; Compressed Tensors mediante el repositorio LLM-Compressor.
- Formatos GGUF, llama.cpp y Ollama: no disponibles en la informacion proporcionada.
- Latencia y throughput: no se han publicado cifras en la informacion disponible. El autor justifica la cuantizacion precisamente por su impacto en throughput y huella de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ (este) | 852.985.920 | W4A16, grupo 32, simetrica | safetensors GPTQ / Marlin | Apache 2.0 | Vision en BF16 |
| lightonai/LightOnOCR-3-0.8B (base) | 852.985.920 | BF16 | safetensors | Apache 2.0 | Mayor precision, mayor huella de memoria |
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound (nativo) | 852.985.920 | W4A16 | AutoRound nativo / transformers | Apache 2.0 | Misma configuracion de calibracion |
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor | 852.985.920 | W4A16 | Compressed Tensors | Apache 2.0 | Orientado a vLLM |
| dots-studio/dots.mocr (cuantizado por el mismo autor) | no disponible | W4A16 con AutoRound | no disponible | no disponible | Modelo de parsing documental alternativo; specs no disponibles |

Datos de rendimiento y calidad comparada entre estas variantes: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo compacto de 0,85 B de parametros: la capacidad de razonamiento es limitada en comparacion con modelos OCR de mayor tamano; es previsible una mayor tasa de error en documentos densos, manuscritos o con tipografias poco comunes.
- La cuantizacion INT4 puede degradar la precision en tablas densas y texto de tamano reducido. El autor mitiga parte del riesgo manteniendo la torre de vision en BF16, pero no se han publicado evaluaciones que cuantifiquen la perdida.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto plausible que no aparece en la imagen, especialmente en documentos de baja calidad o con ruido.
- Idiomas soportados: no declarados. No hay garantia de rendimiento fuera de los idiomas cubiertos por el modelo base.
- El grounding depende del preprocesado: si se estira la imagen o no se respeta la relacion de aspecto, las coordenadas de las cajas delimitadoras dejan de ser fiables. Se recomienda renderizar a 400 DPI con dimension mayor de 2.048 px.
- No debe activarse el modo thinking: el modelo esta optimizado con `enable_thinking=False` y el autor indica que esa configuracion debe preservarse durante la generacion.
- Repositorio de terceros: la cuantizacion la publica el usuario Vishva007, no LightOn. No es un artefacto oficial del fabricante del modelo base.
- El README incluye enlaces de referencia de RunPod y contiene una errata en el comando de arranque de vLLM (el identificador del modelo aparece duplicado como `Vishva007/Vishva007/...`). Conviene corregirlo antes de copiar los comandos en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se detallan las condiciones de los datos de entrenamiento del modelo base mas alla de lo indicado en su model card original.
- No hay soporte GGUF declarado, por lo que no puede desplegarse directamente con llama.cpp u Ollama segun la informacion disponible.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion comunitaria publica de estos pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Variante AutoRound nativa / Transformers: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound
- Variante AutoGPTQ / Marlin: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ
- Variante vLLM / Compressed Tensors: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pagina de investigacion de LightOnOCR-3: https://www.lighton.ai/research/lightonocr-3
- Documentacion de vLLM para lightonocr: https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/lightonocr/
- Coleccion dots.mocr del autor: https://huggingface.co/collections/Vishva007/dotsmocr
- Perfil del autor: https://huggingface.co/Vishva007
- Publicacion sobre pesos W4A16 de dots.mocr con AutoRound: https://www.linkedin.com/posts/vishva-r_ai-machinelearning-vllm-activity-7508728148184752128-S6EF
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2601.14251
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2309.05516
- Imagen de ejemplo (fixture SROIE-receipt): https://huggingface.co/datasets/hf-internal-testing/fixtures_ocr/resolve/main/SROIE-receipt.jpeg
