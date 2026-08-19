# vidore/colpali-v1.3-hf

## Resumen

ColPali es un modelo de recuperación visual de documentos basado en PaliGemma-3B, un modelo de lenguaje y visión (VLM) de Google. Desarrollado por el equipo de Illuin Technology (vidore), genera representaciones multi-vector estilo ColBERT tanto para imágenes de páginas de documentos como para consultas textuales, permitiendo una interacción tardía (late interaction) entre ambas modalidades. Su principal innovación es indexar documentos directamente desde sus características visuales, eliminando la necesidad de OCR y simplificando el pipeline de recuperación en sistemas RAG.

El modelo se presentó en el paper "ColPali: Efficient Document Retrieval with Vision Language Models" (arXiv:2407.01449) y está disponible en HuggingFace bajo licencia Gemma. Con aproximadamente 2.900 millones de parámetros, es lo suficientemente compacto para ejecutarse en GPUs de consumo, y su arquitectura multi-vector permite una búsqueda más precisa que los bi-encoders tradicionales, especialmente en documentos con tablas, gráficos y layouts complejos. La versión v1.3-hf es una conversión oficial al formato transformers, pensada para usarse con Sentence Transformers o la librería transformers directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma-3B (VLM) con late interaction ColBERT multi-vector |
| Parametros totales | 2.924.613.488 (~2,9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada visual de 448x448 píxeles; contexto textual heredado de PaliGemma-3B) |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16) |
| Idiomas soportados | ingles (entrenado solo en ingles, con posible generalizacion a otros idiomas) |
| Licencia | gemma (licencia de Google, con restricciones de uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColPali se basa en el modelo PaliGemma-3B, un VLM que combina un encoder de vision (SigLIP) con un decoder de lenguaje (Gemma-2B). Sobre esta base, se anade una capa de proyeccion final que produce embeddings de 128 dimensiones por cada parche de imagen y por cada token de texto. La estrategia ColBERT permite calcular la similitud entre una consulta y un documento mediante suma de maximos sobre los productos punto de todos los pares de embeddings, lo que captura correspondencias parciales y es mas robusto que los embeddings de vector unico.

El entrenamiento se realizo sobre el dataset vidore/colpali_train_set, compuesto por 127.460 pares consulta-pagina. El 63% proviene de datasets academicos abiertos y el 37% es un conjunto sintetico generado a partir de paginas PDF extraidas de la web, con pseudo-preguntas creadas por Claude-3 Sonnet. Todo el conjunto esta en ingles, disenado para estudiar la generalizacion zero-shot a otros idiomas. Segun la model card, el modelo se entreno durante 1 epoca (aunque otras fuentes mencionan 5 epocas), con LoRA (r=32, alpha=32) sobre las capas transformer y la capa de proyeccion, optimizador paged_adamw_8bit, learning rate 5e-5 con decaimiento lineal y 2,5% de warmup, batch size 32 y 8 GPUs en paralelo de datos.

Una nota importante: el checkpoint fue entrenado con el prefijo de consulta "Query: ", pero el repositorio no incluye un processor_config.json, por lo que al cargar el procesador hay que establecer manualmente `processor.query_prefix = "Query: "` para reproducir el formato de entrenamiento. La configuracion de Sentence Transformers lo restaura automaticamente.

## Capacidades

- Recuperacion visual de documentos: indexa paginas de PDF, imagenes de documentos y capturas de pantalla directamente desde sus caracteristicas visuales, sin OCR previo.
- Generacion de embeddings multi-vector (ColBERT): produce una lista de vectores de 128 dimensiones para cada consulta y cada documento, permitiendo late interaction scoring.
- Compatible con Sentence Transformers mediante `MultiVectorEncoder` y con transformers mediante `ColPaliForRetrieval`.
- Soporte para tool calling: no aplica, es un modelo de recuperacion, no generativo.
- Capacidades multilingues: limitadas; entrenado solo en ingles, aunque puede generalizar a otros idiomas gracias al pretraining de Gemma.
- Capacidades especiales: no tiene modo thinking, vision ni audio; su unica funcion es la recuperacion de documentos visuales.

## Casos de uso

- Busqueda en archivos PDF escaneados: el modelo indexa directamente la imagen de cada pagina, permitiendo buscar informacion en documentos que carecen de capa de texto, como escaneos antiguos o formularios manuscritos.
- Recuperacion de informacion en documentos tecnicos: manuales, especificaciones y papers cientificos con tablas y graficos pueden ser indexados y consultados por contenido visual, superando las limitaciones de los sistemas basados en texto.
- Indexacion de facturas y documentos financieros: permite localizar rapidamente facturas, albaranes o estados financieros por su contenido visual, como numeros de factura, fechas o importes, sin necesidad de extraer texto previamente.
- Busqueda en presentaciones y diapositivas: al trabajar con imagenes de diapositivas, es util para recuperar transparencias concretas por su contenido grafico o textual.
- Asistentes de documentacion empresarial: integrado en un sistema RAG, responde preguntas sobre politicas internas, procedimientos o informes, usando la pagina visual como contexto.
- Sistemas de archivado y cumplimiento normativo: clasifica y recupera documentos legales o regulatorios basandose en su apariencia visual y contenido, facilitando auditorias y revisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original presenta evaluaciones en el benchmark ViDoRe, pero los numeros concretos no se incluyen en la model card ni en los resultados de busqueda web obtenidos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6-8 GB en bfloat16 para los 2,9B parametros, mas overhead de activaciones y procesamiento de imagenes. Con cuantizacion a 8 bits o 4 bits, podria reducirse a 3-5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3080, RTX 4090, A100, L4 o similares. En Apple Silicon puede ejecutarse con MPS.
- Compatible con GPUs de consumo: si, cabe en tarjetas como RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: transformers, Sentence Transformers, colpali-engine (para versiones anteriores), y compatible con endpoints de HuggingFace.
- Latencia y throughput: no disponible; dependen del hardware y del numero de parches de imagen procesados.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Como referencia, el modelo compite con otros retrievers visuales como ColQwen (basado en Qwen2-VL) y con bi-encoders clasicos como CLIP. Sin embargo, no hay especificaciones publicas de estos modelos en los resultados de busqueda, por lo que no se puede elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en ingles, puede mostrar un rendimiento inferior en otros idiomas, especialmente en documentos con escritura no latina.
- Riesgo de alucinacion: no aplica directamente, ya que no genera texto; sin embargo, la recuperacion puede devolver paginas irrelevantes si la consulta es ambigua o el documento tiene poco contenido visual discriminativo.
- Limitaciones de contexto: la entrada visual se limita a imagenes de 448x448 píxeles, lo que puede perder detalle en documentos muy densos o con letra pequena.
- Restricciones de licencia: la licencia Gemma de Google impone restricciones de uso comercial, incluyendo la prohibicion de usar el modelo para ciertos fines (por ejemplo, armas, vigilancia masiva) y la obligacion de atribuir la propiedad intelectual de Google. Es necesario revisar los terminos completos antes de un despliegue en produccion.
- Caveat de produccion: el prefijo de consulta debe configurarse manualmente ("Query: ") al usar transformers, o el rendimiento de recuperacion puede degradarse. Ademas, el modelo no incluye un procesador con configuracion propia, por lo que hay que ajustar el `query_prefix` despues de cargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/vidore/colpali-v1.3-hf
- Paper: https://arxiv.org/abs/2407.01449
- Repositorio de entrenamiento e inferencia: https://github.com/illuin-tech/colpali
- Modelo base: https://huggingface.co/vidore/colpaligemma-3b-pt-448-base
- Documentacion de transformers para ColPali: https://huggingface.co/docs/transformers/en/model_doc/colpali
- Benchmark ViDoRe: https://huggingface.co/collections/vidore/vidore-benchmark-667173f98e70a1c0fa4db00d
