# weijieluo/docling-layout-heron

## Resumen

`heron` es el modelo de análisis de maquetación (layout analysis) por defecto del proyecto Docling, una herramienta de código abierto para la conversión y comprensión de documentos. Lo desarrolla el equipo Deep Search de IBM Research, y esta ficha concreta corresponde a una republicación del modelo original bajo el espacio `weijieluo`. El modelo resuelve el problema de identificar y clasificar las regiones estructurales de una página de documento (títulos, párrafos, tablas, figuras, encabezados, pies de página, fórmulas, listas, formularios, etc.) a partir de una imagen renderizada de la página.

Arquitectónicamente es un detector de objetos RT-DETR v2 (real-time detection transformer), no un modelo de lenguaje. Cuenta con 42.889.979 parámetros totales y un repositorio de 0,2 GB en formato safetensors. Su salida es un conjunto de cajas delimitadoras con etiquetas de clase y puntuaciones de confianza, lo que lo convierte en una pieza de preprocesamiento para pipelines de extracción documental, OCR estructurado y digitalización.

La relevancia actual radica en que el análisis de maquetación es el primer paso crítico en cualquier sistema de document AI: sin una segmentación fiable de la estructura de la página, la extracción posterior de texto, tablas y figuras pierde precisión. Al ser el modelo por defecto de Docling y publicarse bajo licencia Apache 2.0, es una opción directamente integrable en producción sin restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (detector de objetos transformer en tiempo real) |
| Parametros totales | 42.889.979 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre imágenes, no sobre texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RT-DETR v2, un detector de objetos basado en transformer que combina un backbone convolucional con un decoder transformer para la predicción de cajas y clases, eliminando la necesidad de componentes como NMS (non-maximum suppression) en el postprocesado. La clase de modelo en Hugging Face es `RTDetrV2ForObjectDetection`, y se utiliza junto a `RTDetrImageProcessor` para el preprocesado de imágenes y el postprocesado de detecciones.

El modelo está entrenado para predecir 17 clases de regiones documentales: Caption, Footnote, Formula, List-item, Page-footer, Page-header, Picture, Section-header, Table, Text, Title, Document Index, Code, Checkbox-Selected, Checkbox-Unselected, Form y Key-Value Region. Los detalles completos sobre la composición del dataset de entrenamiento, el número de tokens o imágenes procesadas y la metodología de evaluación se describen en el informe técnico "Advanced Layout Analysis Models for Docling" (Livathinos et al., 2025), referenciado en la model card. No se dispone en la información proporcionada de datos concretos sobre volumen de entrenamiento, técnicas de aumento de datos ni fases de ajuste fino específicas.

## Capacidades

- Detección y clasificación de regiones de maquetación en imágenes de páginas de documento, con 17 clases estructurales predefinidas.
- Localización precisa mediante cajas delimitadoras con puntuaciones de confianza por detección.
- Reconocimiento de elementos de formulario: casillas seleccionadas y no seleccionadas, regiones de formulario y pares clave-valor.
- Identificación de elementos técnicos: fórmulas, bloques de código, tablas, figuras y listas.
- Segmentación de estructura de página: encabezados, pies de página, títulos de sección y títulos de documento.
- Integración directa con el ecosistema Transformers mediante `RTDetrV2ForObjectDetection` y `RTDetrImageProcessor`.
- Uso como componente por defecto del pipeline de Docling para conversión de documentos.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multilingües en sentido lingüístico: su entrada es una imagen y su salida son detecciones geométricas.

## Casos de uso

- Digitalización de documentos escaneados: el modelo segmenta la página en regiones estructurales antes de aplicar OCR, de modo que cada bloque de texto se procesa con el motor adecuado y se preserva el orden de lectura.
- Extracción de tablas en informes financieros: la detección de la clase Table permite aislar la región tabular y enviarla a un extractor especializado (por ejemplo, TableFormer) sin contaminar el contenido con texto adyacente.
- Procesamiento de formularios administrativos: las clases Checkbox-Selected, Checkbox-Unselected, Form y Key-Value Region permiten localizar campos rellenables y sus valores asociados en pipelines de automatización documental.
- Conversión de artículos científicos a Markdown: la identificación de fórmulas, figuras, captions y secciones facilita la reconstrucción semántica del documento para su publicación o indexación.
- Análisis de contratos y documentación legal: la detección de encabezados de sección, listas y pies de página permite construir un índice estructural fiable para sistemas de búsqueda y revisión.
- Preprocesado en pipelines RAG sobre documentos: la segmentación previa mejora la calidad de los chunks al respetar los límites estructurales de la página antes de la vectorización.
- Indexación de documentación técnica con código: la clase Code aísla bloques de código de la prosa circundante, útil en bases de conocimiento de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 42,9 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 170 MB de pesos; en FP16, alrededor de 86 MB. La VRAM total necesaria depende del tamaño de las imágenes de entrada y del batch, pero en la práctica es inferior a 2 GB para inferencia en una sola imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers con PyTorch (ruta oficial documentada), integración nativa en el pipeline de Docling, y exportación a ONNX u otros runtimes según necesidades del pipeline (no documentado explícitamente en la model card).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un detector RT-DETR, está diseñado para inferencia en tiempo real, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Clases de layout | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| docling-layout-heron | 42,9 M | RT-DETR v2 | 17 | Apache 2.0 | Hugging Face |
| Docling layout (versión anterior) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face / Docling |
| LayoutLMv3 | no disponible en esta ficha | Transformer multimodal texto-imagen | depende del checkpoint | varía por checkpoint | Hugging Face |
| Detectron2-based layout models | no disponible | CNN (Faster R-CNN, etc.) | varía | Apache 2.0 | Repositorios varios |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los modelos citados se incluyen como referencia de categoría, no con datos verificados en esta ficha.

## Limitaciones y advertencias

- El modelo es un detector de maquetación, no un modelo de lenguaje: no genera texto, no razona y no responde a instrucciones.
- No realiza OCR ni reconocimiento de contenido textual; únicamente localiza y clasifica regiones.
- El rendimiento puede degradarse en documentos con maquetaciones atípicas, muy densas o con imágenes de baja calidad, aunque no se aportan métricas concretas en la información disponible.
- La lista de 17 clases es fija; elementos estructurales no contemplados (por ejemplo, anotaciones manuscritas o marcas específicas de dominio) no serán detectados con una etiqueta propia.
- El umbral de confianza (0,6 en el ejemplo de la model card) es un hiperparámetro que debe ajustarse según el dominio; un umbral demasiado bajo incrementa los falsos positivos.
- No se documentan sesgos específicos del modelo en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la procedencia de los datos de entrenamiento para cumplir con requisitos regulatorios propios.
- Esta ficha corresponde a una republicación (`weijieluo/docling-layout-heron`) con 0 descargas y 0 likes; para producción se recomienda usar el repositorio oficial `docling-project/docling-layout-heron`.

## Enlaces

- Hugging Face (esta republicación): https://huggingface.co/weijieluo/docling-layout-heron
- Hugging Face (repositorio oficial referenciado en la model card): https://huggingface.co/docling-project/docling-layout-heron
- Repositorio Docling: https://github.com/docling-project/docling
- Informe técnico "Advanced Layout Analysis Models for Docling": https://arxiv.org/abs/2509.11720
- Docling Technical Report: https://arxiv.org/abs/2408.09869v4
- Demo SmolDocling-256M (imagen de ejemplo referenciada): https://huggingface.co/spaces/ds4sd/SmolDocling-256M-Demo
