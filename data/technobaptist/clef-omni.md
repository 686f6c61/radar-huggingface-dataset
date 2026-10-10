# TechnoBaptist/clef-omni

## Resumen

Clef-Omni es un modelo multimodal de tipo mezcla de expertos (MoE) derivado de Qwen/Qwen3-Omni-30B-A3B-Instruct, publicado por TechnoBaptist como un fine-tune orientado a la toma de decisiones estructuradas. A diferencia de un modelo generativo convencional, Clef-Omni no produce texto libre: recibe un estado (texto, JSON, imágenes, audio o vídeo) y un esquema de preguntas tipadas, y devuelve, en una única pasada forward, una probabilidad por cada opción permitida de cada pregunta. Esto elimina la necesidad de parsear la salida y lo convierte en un modelo de decisión cerrado.

La arquitectura mantiene el thinker de Qwen3-Omni con sus codificadores de visión y audio, almacenados como safetensors fragmentados, y añade una cabeza conjunta de esquema ("joint schema head") que lee los estados ocultos finales del backbone, enruta la evidencia desde el estado hacia cada pregunta y puntúa todas las opciones de forma conjunta. Los pesos de salida de voz del modelo base (talker y code2wav) se incluyen sin modificar, pero no se cargan ni se usan.

El modelo está pensado para integrarse en pipelines donde se necesita clasificación, puntuación o decisión booleana fiable sobre datos multimodales, con una API compatible con Jev y SystemOne. Es relevante para casos de enrutado, triaje y extracción estructurada donde la salida libre sería un riesgo. El repositorio ocupa 70,8 GB y el backbone requiere aproximadamente 64 GB de VRAM en bfloat16, según la información del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (backbone Qwen3-Omni: thinker + codificadores de vision y audio) mas cabeza conjunta de esquema |
| Parametros totales | 35.259.818.545 (segun safetensors) |
| Parametros activos | no disponible (el modelo base es 30B-A3B, lo que sugiere en torno a 3B activos, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors fragmentados (model-*.safetensors + model.safetensors.index.json), con joint_head.safetensors separado |

## Arquitectura y entrenamiento

Clef-Omni parte de Qwen/Qwen3-Omni-30B-A3B-Instruct y conserva su componente "thinker" junto con los codificadores de vision y audio, todo ello guardado como safetensors estandar. Sobre ese backbone se anade una "joint schema head", una cabeza transformer pequena que consume los estados ocultos finales, enruta la evidencia procedente del estado hacia cada pregunta del esquema y produce una puntuacion logit por cada opcion permitida de cada pregunta, puntuando todas de forma conjunta en lugar de independiente. La salida se convierte en probabilidades aplicando un softmax por pregunta. No se realiza generacion de texto libre ni parseo posterior.

El proceso de entrenamiento se describe como un "post-train" sobre el modelo base Instruct, aunque la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Los pesos de salida de voz del modelo original (talker y code2wav) se incluyen sin cambios pero no se cargan mediante `load_release_model`. El modelo se ha probado con `torch` 2.11 y `transformers` 5.10.2 sobre una unica GPU H200, y el procesamiento de video muestrea a 2 fotogramas por segundo, incorporando ademas la banda sonora cuando todos los videos del registro disponen de ella.

## Capacidades

- Decision estructurada: devuelve una probabilidad por cada opcion permitida de cada pregunta tipada (`choice`, `score`, `noul`) en una sola pasada forward.
- Entrada multimodal: acepta texto, JSON, imagenes, audio y video (rutas de archivo, URL, data URLs base64 o bytes crudos).
- Procesamiento de imagen: soporta imagenes en formato PIL ademas de los formatos anteriores.
- Procesamiento de audio: acepta arrays de muestras mono a 16 kHz, ademas de archivos.
- Procesamiento de video: muestreo a 2 fps, con audio asociado cuando esta disponible.
- Preguntas de tipo `choice`: salida con `choice`, `confidence` y `probabilities`.
- Preguntas de tipo `score`: salida con `score` esperado, `confidence`, `legend` y `probabilities`.
- Preguntas de tipo `noul` (booleana): devuelve la probabilidad de verdadero.
- Batching mixto: permite mezclar registros solo-texto y multimodales en el mismo lote.
- Integracion API: compatible con Jev y SystemOne a traves de `POST /v1/systemone`, devolviendo `model`, `answers` y `usage`.
- No dispone de generacion de texto libre, tool calling, agentes ni modo "thinking" en la informacion proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un esquema con preguntas como "departamento" (billing, tecnico) y "urgencia" (score), y devuelve directamente las probabilidades por categoria, eliminando el parseo de la salida y reduciendo errores en el enrutado.
- Validacion de facturas: a partir de un estado JSON con datos de factura (proveedor, importe, divisa, estado) se pueden formular preguntas booleanas como "el importe supera los 1000 USD" o "la factura esta vencida", obteniendo la probabilidad de cada opcion sin generar texto.
- Analisis de reclamaciones con evidencia visual: con una imagen adjunta (por ejemplo, un producto danado) y un esquema de preguntas tipadas, el modelo puntua cada opcion posible, lo que resulta util en flujos de seguros o e-commerce.
- Revision de grabaciones de audio: procesar llamadas de atencion al cliente para preguntas tipo "hay tono de queja", "se menciona cancelacion" o "es urgente", usando el codificador de audio del backbone.
- Analisis de video de vigilancia o dashcam: con videos muestreados a 2 fps y su banda sonora, se puede preguntar por eventos concretos ("hay una colision", "se oye cristales rompiendose") y obtener probabilidades por clase.
- Clasificacion multicriterio de contenido generado: evaluar un lote mixto de registros (texto, imagen, audio) contra un mismo esquema de preguntas para etiquetar grandes volumenes de datos de forma consistente.
- Automatizacion de decisiones en pipelines CI/CD: al no requerir parseo de texto libre, las probabilidades devueltas se pueden consumir directamente como umbrales en un orquestador o en un servicio de enrutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 64 GB de GPU en bfloat16 para el backbone, segun el autor.
- GPU probada: una unica NVIDIA H200 (segun la model card, con `torch` 2.11 y `transformers` 5.10.2).
- GPU recomendadas: no disponibles mas alla de la H200; por el requisito de memoria, quedarian fuera de rango GPUs de consumo como RTX 4090 (24 GB) o RTX 3090.
- Capacidad en GPU de consumo: no cabe sin cuantizacion; no se documentan versiones cuantizadas (GGUF, AWQ, GPTQ) en la informacion disponible.
- Opciones de despliegue: `transformers` con `joint_schema_model.py` (incluye `load_release_model`, `encode_record`, `collate_records` y `systemone`). Soporte de SGLang anunciado como "coming soon", sin fecha.
- Dependencias adicionales: `pillow` para imagenes y `av` para audio y video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TechnoBaptist/clef-omni | 35,26B (MoE, base 30B-A3B) | no disponible | Decision multimodal estructurada | Apache-2.0 | HuggingFace (repo 70,8 GB) |
| Cloudflare/clef | no disponible | no disponible | Variante densa para imagen y video | no disponible | HuggingFace |
| Cloudflare/clef-flash | no disponible | no disponible | Variante densa para imagen y video | no disponible | HuggingFace |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 30B-A3B (MoE) | no disponible | Multimodal generativo general (texto, imagen, audio, video) | no disponible en la informacion proporcionada | HuggingFace |

Clef-Omni se diferencia del modelo base en que no genera texto libre, sino decisiones tipadas, y en que incorpora la cabeza conjunta de esquema. Las variantes Clef y Clef-Flash de Cloudflare se describen como alternativas densas para imagen y video.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Qwen3-Omni-30B-A3B-Instruct, podria heredar los sesgos del modelo base, pero no se documenta.
- Riesgo de alucinacion: mitigado por diseno al no generar texto libre, pero las probabilidades por opcion pueden ser incorrectas si el estado o el esquema son ambiguos; no se aportan metricas de calibracion.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache-2.0, lo que permite uso comercial, pero conviene verificar que el modelo base Qwen3-Omni-30B-A3B-Instruct tenga una licencia compatible, ya que no se detalla en la informacion proporcionada.
- Dependencia de custom code: el modelo requiere cargar `joint_schema_model.py` desde el propio repositorio, lo que implica confiar en codigo de terceros no empaquetado en Transformers.
- Pesos no usados: los pesos de salida de voz del modelo base (talker y code2wav) se incluyen en el repositorio pero no se cargan, lo que incrementa el tamano de descarga y almacenamiento sin aportar funcionalidad.
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-10-10; se trata de un modelo muy reciente y sin validacion comunitaria publica.
- No se documentan versiones cuantizadas, por lo que el requisito de ~64 GB de VRAM puede impedir su despliegue en hardware de consumo.
- Diferencias entre identificadores: el ID de HuggingFace es `TechnoBaptist/clef-omni`, mientras que los ejemplos de codigo de la model card referencian `Cloudflare/clef-omni`; conviene verificar a que repositorio apuntan los ejemplos al desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/clef-omni
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Variante densa Clef: https://huggingface.co/Cloudflare/clef
- Variante densa Clef-Flash: https://huggingface.co/Cloudflare/clef-flash
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-faster-cheaper-multimodal
