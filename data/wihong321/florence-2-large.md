# WiHong321/Florence-2-large

## Resumen

Florence-2-large es un modelo fundacional de visión desarrollado por Microsoft Research, publicado originalmente en noviembre de 2023 y acompañado del informe técnico arXiv:2311.06242. La versión alojada en el repositorio `WiHong321/Florence-2-large` es un *continued pretraining* del modelo original con una longitud de contexto ampliada a 4k tokens, entrenado con aproximadamente 0,1B de muestras adicionales. El autor advierte explícitamente de que ese entrenamiento adicional puede no haber sido suficiente para consolidar bien el modelo y que la tarea de OCR se ha actualizado introduciendo un separador de línea (`\n`). El checkpoint reporta un COCO OD AP de 39,8.

El modelo resuelve el problema de unificar múltiples tareas de visión y visión-lenguaje bajo una única arquitectura secuencia-a-secuencia guiada por *prompts* textuales. En lugar de disponer de cabezas especializadas para cada tarea, Florence-2 recibe una etiqueta de tarea (por ejemplo `<OD>`, `<CAPTION>` o `<DENSE_REGION_CAPTION>`) junto con la imagen y genera la respuesta como texto estructurado que el procesador posterior convierte en cajas delimitadoras, etiquetas o descripciones. Esto simplifica el despliegue: un solo modelo cubre detección de objetos, segmentación, subtitulado, *grounding* y OCR.

Con 776,7 millones de parámetros y un tamaño de repositorio de 3,1 GB, Florence-2-large se sitúa en el rango de los modelos de visión de tamaño medio, lo que permite ejecutarlo en GPUs de consumo con cuantización o en FP16 en GPUs de datacenter. Su licencia MIT facilita el uso comercial, aunque la naturaleza experimental de este *fork* concreto (0 descargas y 0 *likes* en el momento de la consulta, sin idiomas declarados) obliga a tratarlo con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia-a-secuencia (encoder-decoder) multimodal, prompt-based multi-task |
| Parametros totales | 776.721.497 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4k tokens (ampliada respecto al modelo original) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (entrenado en float16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Florence-2 emplea una arquitectura transformer secuencia-a-secuencia que combina un encoder visual con un decoder de lenguaje. El modelo trata cada tarea como una tarea de generación condicionada por un *prompt* textual: la imagen se codifica en *tokens* visuales y el decoder produce la secuencia de salida correspondiente a la etiqueta de tarea solicitada. Esta formulación unificada permite que un mismo conjunto de pesos aborde subtitulado, detección, segmentación y *grounding* sin cabezas específicas.

El preentrenamiento original se realizó sobre FLD-5B, un conjunto de 5.400 millones de anotaciones repartidas en 126 millones de imágenes, lo que constituye la base del aprendizaje multi-tarea. La versión de este repositorio añade un *continued pretraining* con aproximadamente 0,1B de muestras y extiende la ventana de contexto a 4k tokens; el autor indica que ese volumen puede ser insuficiente para un ajuste sólido. Todos los modelos de la familia se entrenaron en float16. No se dispone de información sobre el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto descriptivo a partir de imágenes: subtitulado simple (`<CAPTION>`), detallado (`<DETAILED_CAPTION>`) y muy detallado (`<MORE_DETAILED_CAPTION>`).
- Detección de objetos con etiquetas y cajas delimitadoras mediante el *prompt* `<OD>`, devueltas en formato estructurado `{'bboxes': [...], 'labels': [...]}`.
- *Grounding* de frases sobre la imagen (`<CAPTION_TO_PHRASE_GROUNDING>`), que localiza en coordenadas los objetos mencionados en un texto de entrada.
- Subtitulado denso por regiones (`<DENSE_REGION_CAPTION>`), que describe múltiples regiones de la imagen con sus cajas asociadas.
- Segmentación guiada por *prompts* (tareas de segmentación referidas en la model card).
- OCR, con separador de línea (`\n`) incorporado en esta versión.
- Procesamiento multimodal imagen-texto a texto mediante el *pipeline* `image-text-to-text`.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso ni modo de razonamiento extendido (*thinking mode*).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Etiquetado automático de imágenes en catálogos de comercio electrónico**: usar `<DENSE_REGION_CAPTION>` para generar descripciones por región (producto, fondo, accesorios) y `<OD>` para extraer cajas de los artículos principales, alimentando un pipeline de metadatos sin intervención manual.
- **Moderación de contenido visual**: combinar `<CAPTION>` y `<DETAILED_CAPTION>` para producir descripciones textuales que un clasificador posterior pueda filtrar; el contexto de 4k tokens permite procesar imágenes de alta resolución con muchas regiones anotadas en una sola pasada.
- **Digitalización de documentos con OCR**: extraer texto de facturas, tickets o formularios aprovechando la tarea de OCR con separador de línea, preservando la estructura de líneas para su posterior parseo.
- **Accesibilidad y descripción de imágenes para lectores de pantalla**: generar automáticamente `<MORE_DETAILED_CAPTION>` para imágenes publicadas en webs o aplicaciones, mejorando la experiencia de usuarios con discapacidad visual.
- **Anotación semiautomática para datasets de visión**: usar `<CAPTION_TO_PHRASE_GROUNDING>` para preanotar cajas delimitadoras a partir de descripciones existentes, reduciendo el coste de etiquetado humano en proyectos de detección de objetos.
- **Análisis de imágenes industriales o de seguridad**: detectar y localizar objetos concretos (`<OD>`) en imágenes de cámaras fijas para inventario, control de calidad o alertas, con la ventaja de que un único modelo cubre detección y descripción.
- **Búsqueda visual por texto**: indexar imágenes mediante descripciones generadas por el modelo y permitir consultas en lenguaje natural que se resuelvan con *grounding* sobre las imágenes candidatas.

## Benchmarks y rendimiento

La model card de este repositorio únicamente declara un resultado: **COCO OD AP 39,8** para la tarea de detección de objetos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras métricas comparativas para esta versión concreta.

| Benchmark | Resultado |
|---|---|
| COCO Object Detection AP | 39,8 |
| Resto de benchmarks | no disponible |

## Requisitos de hardware

- **VRAM estimada en FP16**: aproximadamente 1,6 GB solo para los pesos (776,7M parámetros × 2 bytes), más el *overhead* de activaciones y del encoder visual; en la práctica, entre 2,5 y 4 GB según resolución de imagen y longitud de salida.
- **VRAM estimada en FP32**: en torno a 3,1 GB solo para pesos, con picos superiores a 5 GB.
- **Cuantización**: no se documentan formatos GGUF ni cuantizaciones oficiales en la información proporcionada; el modelo se distribuye en safetensors y se carga con `transformers` y `trust_remote_code=True`.
- **GPUs recomendadas**: cualquier GPU con al menos 6-8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son opciones válidas. Cabe en GPUs de consumo de gama media-alta.
- **Opciones de despliegue**: `transformers` con `AutoModelForCausalLM` y `AutoProcessor` (requiere `trust_remote_code=True`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-large (este repo) | 0,77B | 4k | Subtitulado, OD, segmentación, grounding, OCR | MIT | Hugging Face (`WiHong321/Florence-2-large`) |
| Florence-2-large (Microsoft) | 0,77B | no disponible | Subtitulado, OD, segmentación, grounding, OCR | MIT | Hugging Face (`microsoft/Florence-2-large`) |
| Florence-2-base | 0,23B | no disponible | Mismas tareas | MIT | Hugging Face (`microsoft/Florence-2-base`) |
| Florence-2-large-ft | 0,77B | no disponible | Mismas tareas, ajustado en downstream | MIT | Hugging Face (`microsoft/Florence-2-large-ft`) |

La diferencia principal frente al modelo original de Microsoft es la ventana de contexto de 4k y el *continued pretraining* adicional, a costa de un posible deterioro por el escaso volumen de muestras empleado. Frente a Florence-2-base, este modelo triplica los parámetros y ofrece mayor capacidad, a cambio de más VRAM.

## Limitaciones y advertencias

- El propio autor advierte de que el *continued pretraining* se realizó con solo 0,1B de muestras y que **el modelo puede no estar bien entrenado**; no debe asumirse una mejora respecto al original sin validación empírica.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia comunitaria de uso ni validación independiente.
- No se declaran idiomas soportados, lo que impide garantizar un rendimiento multilingüe fiable.
- Riesgo de alucinación en subtitulado y OCR: el modelo puede generar descripciones o texto plausibles pero incorrectos, especialmente en imágenes complejas o de baja calidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en producción.
- No se documentan cuantizaciones oficiales ni soporte confirmado en motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita el despliegue a gran escala.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre la calidad y los sesgos del *fork* recae en el usuario.
- No se dispone de información sobre sesgos demográficos, geográficos o culturales del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WiHong321/Florence-2-large
- Modelo original de Microsoft: https://huggingface.co/microsoft/Florence-2-large
- Informe técnico (arXiv): https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualización: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Licencia: https://huggingface.co/microsoft/Florence-2-large/resolve/main/LICENSE
- Florence-2-base: https://huggingface.co/microsoft/Florence-2-base
- Florence-2-base-ft: https://huggingface.co/microsoft/Florence-2-base-ft
- Florence-2-large-ft: https://huggingface.co/microsoft/Florence-2-large-ft
