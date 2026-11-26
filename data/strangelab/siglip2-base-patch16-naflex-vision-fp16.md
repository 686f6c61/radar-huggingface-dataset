# strangelab/siglip2-base-patch16-naflex-vision-fp16

## Resumen

SigLIP 2 NaFlex Base (vision-fp16) es un checkpoint derivado del codificador de imágenes de Google SigLIP 2, publicado por Strange Lab. Se trata de un recorte del modelo conjunto original: elimina el codificador de texto y conserva únicamente la torre de visión, con los pesos redondeados de FP32 a FP16. El resultado es un extractor de características visuales de 92,9 millones de parámetros que produce un vector pooled de 768 dimensiones por imagen, cargable con el loader estándar de Transformers.

El modelo resuelve un problema de eficiencia en despliegues de recuperación visual: el checkpoint conjunto de Google ocupa 1.501 MB, mientras que esta versión pesa 185,9 MB (un 87,6 % menos), manteniendo la configuración original del procesador de imágenes. La arquitectura es la de SigLIP 2 con variante NaFlex (resolución flexible), que preserva la relación de aspecto de la imagen y utiliza hasta 256 parches por defecto.

Su relevancia actual reside en que permite indexar imágenes, buscar fotos similares o comparar imágenes nuevas contra embeddings precalculados sin necesidad de cargar el modelo multimodal completo. La contrapartida es que las consultas de texto requieren vectores de texto compatibles obtenidos del modelo original de Google, ya que este paquete no incluye el codificador textual. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 NaFlex, codificador de visión (transformer ViT con resolución flexible) |
| Parametros totales | 92.930.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; hasta 256 parches por imagen por defecto) |
| Tipos de cuantizacion | FP16 (pesos publicados), FP32 en memoria para inferencia; variante ONNX de 4 bits disponible en el export de la comunidad |
| Idiomas soportados | no disponible (modelo de visión sin capacidades lingüísticas propias) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variantes timm y ONNX disponibles por separado |

## Arquitectura y entrenamiento

El modelo es la torre de visión de SigLIP 2, un vision transformer con atención global y variante NaFlex, que procesa la imagen a resolución flexible preservando su relación de aspecto en lugar de forzar un redimensionado cuadrado fijo. El procesador de imágenes mantiene la configuración original de Google y aplica un presupuesto de hasta 256 parches por defecto. La salida es un vector pooled de 768 dimensiones por imagen, obtenido mediante `pooler_output`.

El entrenamiento original corresponde a Google DeepMind (paper arXiv:2502.14786), que entrenó SigLIP 2 como modelo de alineación imagen-texto mediante objetivos tipo sigmoide sobre pares imagen-texto. Strange Lab no reentrenó el modelo: únicamente eliminó el codificador de texto, redondeó los pesos de FP32 a FP16 y empaquetó el resultado con el procesador original. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Extracción de características de imagen: genera un embedding pooled de 768 dimensiones por imagen.
- Recuperación imagen-imagen: comparación por similitud coseno entre embeddings de imágenes.
- Recuperación texto-imagen: posible usando vectores de texto del modelo original de Google, no incluidos en este paquete.
- Procesamiento con relación de aspecto preservada mediante el procesador NaFlex.
- Presupuesto de parches configurable (256 por defecto) para equilibrar coste y detalle.
- Compatibilidad con el loader estándar de Transformers (`AutoModel`, `AutoImageProcessor`).
- Sin soporte de generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un codificador visual.
- Sin capacidades multilingües propias ni modo de razonamiento.

## Casos de uso

- Indexación de catálogos de imágenes: generar embeddings de 768 dimensiones para cada imagen de un catálogo y almacenarlos en una base de datos vectorial, permitiendo búsqueda por similitud visual sin cargar el modelo multimodal completo.
- Búsqueda de fotos similares: dado un vector de consulta, recuperar las imágenes más cercanas por similitud coseno; el ejemplo del autor obtiene 0,819 entre dos fotos de perros y 0,431 frente a una foto de cerámica.
- Deduplicación y clustering visual: agrupar imágenes casi idénticas en pipelines de curación de datasets comparando embeddings pooled, con la advertencia de que los vectores por parche individual difieren más.
- Recuperación texto-imagen en buscadores internos: usar los vectores de texto del modelo original de Google junto con los embeddings de imagen de este checkpoint para construir un índice cruzado.
- Moderación y filtrado de contenido visual: clasificar imágenes por proximidad a embeddings de referencia de categorías predefinidas.
- Preprocesamiento para pipelines de visión: generar características visuales que alimenten clasificadores o sistemas de recomendación posteriores, aprovechando el menor tamaño de descarga (185,9 MB frente a 1.501 MB).
- Despliegue en entornos con recursos limitados: al ser un modelo de 92,9 millones de parámetros, puede ejecutarse en CPU para cargas por lotes moderadas.

## Benchmarks y rendimiento

Evaluación de recuperación sobre las 1.000 imágenes de test de Flickr8k frente a sus 5.000 captions, con vectores de texto del codificador original de Google:

| Pesos y aritmética | Imagen a texto R@1 | Imagen a texto R@5 | Texto a imagen R@1 | Texto a imagen R@5 |
|---|---:|---:|---:|---:|
| Google FP32, aritmética FP32 | 87,4 % | 98,3 % | 74,56 % | 93,68 % |
| Este modelo, aritmética FP32 | 87,4 % | 98,3 % | 74,56 % | 93,68 % |
| Este modelo, aritmética FP16 | 87,1 % | 98,3 % | 74,56 % | 93,68 % |

En Apple MPS, la similitud coseno mínima entre vectores pooled correspondientes fue de 0,99996 con aritmética FP32 y 0,99981 con FP16. Con FP32, un caption menos recuperó su imagen en los primeros diez resultados. Los vectores por parche individual mostraron divergencias mayores: coseno observado de hasta 0,939 en FP32 y 0,584 en FP16, por lo que las tareas dependientes de parches deben evaluarse por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 185,9 MB en FP16; cargado en FP32 en memoria ocupa aproximadamente el doble (unos 372 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes moderados.
- Opciones de despliegue: Transformers (versión probada 5.23.0; también carga con 4.57.6), export ONNX de la comunidad, checkpoint timm para visión sola.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / parches | Licencia | Disponibilidad |
|---|---|---|---|---|
| strangelab/siglip2-base-patch16-naflex-vision-fp16 | 92,9 M | hasta 256 parches | Apache 2.0 | Hugging Face (este repo) |
| google/siglip2-base-patch16-naflex | no disponible (modelo conjunto imagen-texto) | hasta 256 parches | Apache 2.0 | Hugging Face |
| timm/naflexvit_base_patch16_siglip.v2_webli | no disponible (visión sola, FP32, 371,7 MB) | no disponible | no disponible | Hugging Face |
| onnx-community/siglip2-base-patch16-naflex-ONNX | no disponible (grafo FP16 ~186 MB; variante 4 bits ~53 MB) | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No incluye codificador de texto: las consultas textuales requieren vectores del modelo original de Google; no es un modelo multimodal autónomo.
- Los vectores por parche individual divergen más que los pooled (coseno mínimo de 0,584 en FP16), por lo que las tareas dependientes de parches deben validarse aparte.
- La aritmética FP16 altera ligeramente el ranking: R@1 imagen-texto baja de 87,4 % a 87,1 % y un caption menos recupera su imagen en el top-10 con FP32.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en recuperación por similitud coseno.
- Sesgos: no documentados en la información proporcionada; hereda los del entrenamiento original de SigLIP 2.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución a Google DeepMind y a Strange Lab (ver LICENSE y NOTICE).
- El modelo se publicó con fecha de creación 2026-11-25 y sin descargas ni likes; no hay evidencia de validación por la comunidad.
- La evaluación de recuperación se limita a Flickr8k con el presupuesto de parches por defecto; no hay datos de otros dominios.

## Enlaces

- Hugging Face: https://huggingface.co/strangelab/siglip2-base-patch16-naflex-vision-fp16
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-naflex
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Documentación Transformers SigLIP 2: https://huggingface.co/docs/transformers/model_doc/siglip2
- Checkpoint timm: https://huggingface.co/timm/naflexvit_base_patch16_siglip.v2_webli
- Export ONNX: https://huggingface.co/onnx-community/siglip2-base-patch16-naflex-ONNX
- Split de evaluación Flickr8k: https://huggingface.co/datasets/jxie/flickr8k
- Imágenes de ejemplo: https://github.com/pytorch/vision/tree/4174d08e42fb04453a373a1208bb086913347adf/gallery/assets
