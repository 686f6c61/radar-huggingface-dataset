# TheFrenchOak/shotgrep-models

## Resumen

shotgrep-models es un repositorio de HuggingFace mantenido por el usuario TheFrenchOak que no contiene un modelo generativo, sino un paquete de cuatro exportaciones ONNX (3,5 GB en total) que la aplicación de escritorio shotgrep descarga en su primer arranque. Los componentes son un detector de cortes de plano (`transnet`, pesos TransNetV2 en fp32, 31 MB), dos codificadores SigLIP 2 so400m-patch14-384 exportados por separado (`siglip_image`, 857 MB, y `siglip_text`, 1451 MB, ambos en fp16) y el modelo de embeddings de texto BGE-M3 (1151 MB, fp16).

El propósito del paquete es servir de distribución de pesos para un pipeline de análisis y búsqueda local de vídeo: detección de cambios de plano, generación de embeddings visuales y generación de embeddings de texto para recuperación cruzada entre ambos dominios. Cada artefacto conserva la licencia de sus pesos originales (MIT para TransNetV2 y BGE-M3, Apache-2.0 para SigLIP 2), de ahí que la licencia declarada del repositorio sea "other" con nombre "mixed".

Su relevancia es acotada: el repositorio acumula 0 descargas y 0 likes, no publica resultados de benchmarks ni detalles de entrenamiento, y el propio autor advierte de que "nothing here is meant to be used on its own", ya que la aplicación verifica cada fichero por SHA-256 contra su propio índice. Resulta útil para quien quiera replicar o auditar el pipeline de shotgrep, o reutilizar exportaciones ONNX ya convertidas, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro redes independientes exportadas a ONNX: detector de cortes (TransNetV2), codificador visual SigLIP 2, codificador de texto SigLIP 2 y modelo de embeddings BGE-M3 |
| Parametros totales | no disponible (el repositorio no publica recuentos por componente; la denominación so400m de SigLIP 2 alude a ~400 M de parámetros en el codificador, extremo no confirmado por el autor) |
| Parametros activos | no aplica (ninguno de los componentes es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los artefactos publicados son fp32 (`transnet`) y fp16 (el resto), sin variantes cuantizadas |
| Idiomas soportados | no disponible; el repositorio no declara idiomas y el soporte multilingüe dependería de los modelos de origen |
| Licencia | "other" con nombre "mixed": MIT para `transnet` y `bge_m3`, Apache-2.0 para `siglip_image` y `siglip_text` |
| Formato de pesos | ONNX |

Composición del repositorio:

| Componente | Modelo de origen | Revision | Precision | Licencia | Tamaño |
|---|---|---|---|---|---|
| `transnet` | transnetv2_pytorch/transnetv2-pytorch-weights.pth | no indicada | fp32 | MIT (TransNetV2, Souček y Lokoč) | 31 MB |
| `siglip_image` | google/siglip2-so400m-patch14-384 | e8e487298228002f3d8a82e0cd5c8ea9c567f57f | fp16 | Apache-2.0 | 857 MB |
| `siglip_text` | google/siglip2-so400m-patch14-384 | e8e487298228002f3d8a82e0cd5c8ea9c567f57f | fp16 | Apache-2.0 | 1451 MB |
| `bge_m3` | BAAI/bge-m3 | 9a0624b896d81da7492a910ffa53731274b6cf3d | fp16 | MIT | 1151 MB |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo único ni pesos entrenados por su autor: es un conjunto de conversiones a ONNX de pesos preexistentes. `transnet` corresponde a TransNetV2, un detector de límites de plano cuyos pesos proceden del paquete `transnetv2_pytorch`, exportados a ONNX en fp32 y con un tamaño de 31 MB. `siglip_image` y `siglip_text` son las dos torres del modelo SigLIP 2 so400m-patch14-384 de Google, es decir, un codificador de imagen y un codificador de texto con objetivo contrastivo, exportados por separado en fp16 desde la revisión `e8e4872`. `bge_m3` es una exportación en fp16 del modelo de embeddings de texto BAAI/bge-m3, revisión `9a0624b`.

No se documentan en este repositorio ni el número de tokens de entrenamiento, ni la composición de los datasets, ni si hubo fases de RLHF o DPO, ni innovaciones técnicas propias. Tampoco se detalla el proceso de exportación (versión de opset, operadores, optimizaciones de grafo) más allá del formato final. El único valor añadido diferencial declarado es el empaquetado y la verificación por SHA-256 contra el índice de la aplicación shotgrep, que descarga y valida los ficheros en el primer arranque.

## Capacidades

- Detección de cortes de plano en vídeo mediante `transnet` (TransNetV2), pensada para segmentar una secuencia en planos individuales.
- Generación de embeddings visuales con `siglip_image`, orientada a representar fotogramas o imágenes en un espacio vectorial.
- Generación de embeddings de texto con `siglip_text`, alineados con los anteriores para permitir recuperación cruzada texto-imagen dentro del mismo espacio.
- Generación de embeddings de texto adicionales (densos) con `bge_m3`, para indexado y recuperación semántica sobre cadenas de texto.
- No es un modelo generativo: no produce texto libre, no mantiene conversaciones y no tiene modo de razonamiento.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no declaradas en el repositorio.
- Capacidades especiales: ninguna documentada más allá de las anteriores; no hay visión generativa, audio ni modo "thinking".

## Casos de uso

- Indexado y búsqueda por escenas en videotecas locales: `transnet` segmenta el vídeo en planos, `siglip_image` vectoriza fotogramas clave y `siglip_text` permite consultas en lenguaje natural contra ese índice, todo ejecutado en la máquina del usuario.
- Recuperación multimodal texto-imagen: usar las dos torres de SigLIP 2 para buscar una imagen o un fotograma a partir de una descripción textual, o al revés, aprovechando el espacio vectorial compartido.
- Deduplicación y agrupación de planos: comparar embeddings de `siglip_image` entre fotogramas para detectar planos repetidos, resúmenes de repetición o secuencias recicladas en material de archivo.
- Generación de miniaturas y hojas de contacto automáticas: tras el corte con `transnet`, seleccionar un fotograma representativo por plano para previsualizaciones y navegación rápida en un editor.
- Búsqueda semántica sobre transcripciones y subtítulos: indexar el texto asociado a cada plano con `bge_m3` y recuperar fragmentos por significado en lugar de por coincidencia literal de términos.
- Gestión de archivos audiovisuales (MAM) en producción de vídeo: combinar detección de cortes y embeddings para permitir a editores localizar material concreto por descripción, sin subir el contenido a servicios en la nube.
- Preprocesado para moderación o clasificación de contenido: extraer embeddings visuales y textuales por plano y alimentar con ellos un clasificador propio que decida qué revisar.
- Investigación en recuperación vídeo-texto: usar el paquete como referencia reproducible del pipeline de shotgrep para comparar estrategias de segmentación y de embedding en condiciones idénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño conjunto de pesos: aproximadamente 3,5 GB (31 MB + 857 MB + 1451 MB + 1151 MB).
- `transnet`: 31 MB en fp32; cabe en cualquier GPU y es viable incluso en CPU sin penalización apreciable.
- `siglip_image`: 857 MB en fp16; requiere alrededor de 1 GB de VRAM solo para pesos, más activaciones que dependen de la resolución de entrada (el nombre del modelo de origen indica patch 14 y 384 píxeles) y del tamaño de lote.
- `siglip_text`: 1451 MB en fp16.
- `bge_m3`: 1151 MB en fp16.
- Si se cargan los cuatro componentes a la vez, la suma de pesos ronda los 3,5 GB, por lo que con activaciones y sobrecarga del runtime conviene disponer de 8 GB de VRAM o más; con GPU de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) hay margen suficiente.
- Cada componente por separado cabe en GPUs de consumo de gama media e incluso en equipos sin GPU dedicada, ejecutando en CPU.
- GPU de centro de datos (A100, H100) no son necesarias para este paquete; solo tendrían sentido para procesar grandes volúmenes en lote.
- Opciones de despliegue: al ser artefactos ONNX, los runtimes naturales son ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML, OpenVINO) y cualquier framework que consuma ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no hay un modelo autoregresivo que servir.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo o paquete | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| TheFrenchOak/shotgrep-models | Paquete de 4 exportaciones ONNX | no disponible | no disponible | Mixta (MIT y Apache-2.0) | ONNX | HuggingFace; 0 descargas y 0 likes |
| google/siglip2-so400m-patch14-384 | Codificadores de imagen y texto | no disponible | no disponible | Apache-2.0 | PyTorch / safetensors | HuggingFace (origen de dos de los componentes) |
| BAAI/bge-m3 | Embeddings de texto | no disponible | no disponible | MIT | PyTorch / ONNX | HuggingFace (origen de `bge_m3`) |
| TransNetV2 (`transnetv2_pytorch`) | Detección de cortes de plano | no disponible | no aplica | MIT | PyTorch (`.pth`) | Paquete de Python (origen de `transnet`) |

La comparación relevante no es de rendimiento, sino de empaquetado: frente a los repositorios de origen en PyTorch, este paquete ofrece los mismos pesos ya convertidos a ONNX en fp32 o fp16, con verificación por hash, a cambio de no publicar métricas ni garantías de funcionamiento independiente. No se dispone de datos de benchmarks que permitan comparar la calidad de estos componentes con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona de forma conversacional y no admite tool calling ni uso como agente.
- El autor indica explícitamente que "nothing here is meant to be used on its own"; los ficheros están pensados para ser consumidos por la aplicación shotgrep, que valida cada uno por SHA-256 contra su propio índice.
- Licencia mixta: la licencia "other" del repositorio no unifica condiciones. Cada componente mantiene la licencia de sus pesos originales (MIT para `transnet` y `bge_m3`, Apache-2.0 para `siglip_image` y `siglip_text`), y es responsabilidad del reutilizador verificar y cumplir cada una por separado antes de un uso comercial.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe concreta a partir de esta ficha.
- No se publican resultados de benchmarks ni comparativas de calidad; no hay evidencia en el repositorio sobre precisión de detección de cortes, calidad de los embeddings ni comportamiento en dominios distintos del previsto.
- Riesgo de falsos positivos en recuperación: al no haber métricas publicadas, no puede acotarse la tasa de aciertos ni el comportamiento ante consultas ambiguas.
- Sesgos: no documentados en este repositorio; cualquier sesgo presente provendría de los pesos de origen (TransNetV2, SigLIP 2 y BGE-M3), cuya documentación no se reproduce aquí.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar su funcionamiento.
- Los metadatos indican fecha de creación 2026-09-13 y de actualización 2026-09-13, posteriores a la fecha habitual de consulta; conviene verificar la coherencia de dichos metadatos.
- El repositorio ocupa 3,5 GB, lo que implica un coste de descarga y almacenamiento no trivial para un despliegue que solo necesite uno de los cuatro componentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TheFrenchOak/shotgrep-models
- Sección de licencias del repositorio: https://huggingface.co/TheFrenchOak/shotgrep-models#licences
- Modelo de origen de `siglip_image` y `siglip_text`: https://huggingface.co/google/siglip2-so400m-patch14-384
- Modelo de origen de `bge_m3`: https://huggingface.co/BAAI/bge-m3
- Paper de TransNetV2 (Souček y Lokoč), paquete `transnetv2_pytorch`, repositorio de la aplicación shotgrep y demos: no disponible en la informacion proporcionada.
- Resultados de busqueda web: no se encontro informacion adicional relevante; las busquedas devolvieron unicamente paginas principales de Google sin contenido relacionado con el modelo.
