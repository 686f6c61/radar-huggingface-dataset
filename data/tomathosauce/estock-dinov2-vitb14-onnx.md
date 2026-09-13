# tomathosauce/estock-dinov2-vitb14-onnx

## Resumen

`tomathosauce/estock-dinov2-vitb14-onnx` es un export ONNX orientado a despliegue del backbone `dinov2_vitb14` de Meta (repo upstream `facebookresearch/dinov2`). No es un modelo nuevo ni un fine-tuning: es el mismo backbone DINOv2 ViT-B/14 convertido a ONNX opset 18 en precisión FP16 y optimizado con `onnxslim`, con el objetivo de ejecutar extracción de embeddings de imagen en entornos de producción ligeros, en particular sobre Windows con ONNX Runtime y el proveedor de ejecución DirectML, con CPU como respaldo.

El artefacto resuelve un problema de ingeniería más que de investigación: permite obtener un vector de 768 dimensiones por imagen sin depender del stack de PyTorch, con un grafo único de entrada fija (`1 x 3 x 224 x 224`) y salida fija (`1 x 768`). El repositorio ocupa 0,2 GB e incluye un único fichero, `dinov2_vitb14_opset18_slim_fp16.onnx`, con hash SHA-256 publicado para verificación de integridad.

Su relevancia es acotada pero clara: DINOv2 es un extractor de características visuales auto-supervisado muy utilizado como base para búsqueda por similitud, agrupación y clasificación con pocas etiquetas, y este export reduce la fricción de integrarlo en aplicaciones nativas de Windows o en pipelines que ya usan ONNX Runtime. Como contrapartida, el repositorio no publica benchmarks, no documenta evaluación de sesgos y no tiene descargas ni valoraciones, por lo que debe tratarse como un artefacto de despliegue a validar por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 (Vision Transformer, parche 14, auto-supervisado) |
| Parametros totales | no disponible en la model card (el backbone DINOv2 ViT-B/14 original declara aproximadamente 86 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; la entrada fija de 224 x 224 con parche 14 produce 256 parches mas 1 token CLS (257 tokens de entrada al transformer) |
| Tipos de cuantizacion | FP16 (unica precision publicada en el repositorio); no se publican variantes INT8, INT4 ni FP32 |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, opset 18, FP16, grafo optimizado con `onnxslim`; fichero `dinov2_vitb14_opset18_slim_fp16.onnx` |
| Entrada | `pixel_values` tensor FP16 `[1, 3, 224, 224]`; `masks` booleano escalar fijado a `false` |
| Salida | `[1, 768]` (embedding pooled) |
| SHA-256 | `d0737e9262093604e0b847e4388dfaca6e21b6c35663a81bc6f7f1085a56ffba` |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | onnxruntime |
| Pipeline declarado | image-feature-extraction |
| Fecha de creacion (metadatos) | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer con parches de 14 x 14, normalizacion previa por parche y atencion global completa; la imagen de 224 x 224 se divide en 256 parches que, junto con el token CLS, forman la secuencia de entrada. El export mantiene un unico tensor de salida de 768 dimensiones, correspondiente al embedding pooled, y no expone las representaciones densas por parche. El grafo se ha simplificado con `onnxslim` y fijado en FP16 con opset 18; la model card indica que el grafo es identico para los dos perfiles de preprocesado descritos (redimensionar el lado corto a 224 y recorte central de 224 x 224, o redimensionar a 256 y aplicar el mismo recorte), lo que implica que el cambio de perfil solo afecta al pipeline de datos, no al modelo.

Sobre el entrenamiento no hay informacion en la model card de este repositorio: no se detallan tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO. La model card se limita a indicar que los pesos fuente S/B/L/g de DINOv2 los distribuye Meta bajo licencia Apache 2.0 y que este export conserva dicha licencia. La unica innovacion tecnica documentada en este artefacto es de despliegue: export a ONNX opset 18, optimizacion de grafo con `onnxslim`, ejecucion en FP16 y soporte de DirectML con respaldo en CPU. Tampoco se documenta ninguna tecnica de decodificacion especulativa ni de atencion lineal, que en cualquier caso no aplican a un encoder de imagen de este tipo.

## Capacidades

- Extraccion de embeddings de imagen: produce un vector de 768 dimensiones por imagen a partir de una entrada RGB de 224 x 224.
- Busqueda por similitud visual: la model card recomienda convertir la salida a FP32 y normalizarla en norma L2 antes de almacenarla o compararla, lo que habilita indices vectoriales y comparacion por similitud coseno.
- Base para clasificacion con pocas etiquetas: al ser un backbone auto-supervisado, sus embeddings son utilizables como entrada de un clasificador lineal o de una sonda ligera.
- Agrupacion y deduplicacion: los embeddings permiten clustering de imagenes sin anotaciones.
- Inferencia en FP16 con ONNX Runtime: reduce el coste de memoria y acelera la ejecucion en hardware compatible con DirectML.
- Ejecucion en CPU como respaldo: si no hay proveedor DirectML disponible, el grafo puede ejecutarse en `CPUExecutionProvider`.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es exclusivamente un modelo de vision.
- No soporta tool calling, function calling ni flujos de agente multi-paso.
- No tiene capacidades multilingues ni procesa lenguaje natural.
- No expone caracteristicas densas por parche ni salidas de atencion, por lo que no sirve directamente para segmentacion densa o deteccion.
- No admite lotes mayores de 1 ni resoluciones distintas de 224 x 224 sin reexportar el grafo.

## Casos de uso

- Busqueda visual por similitud en catalogos de producto: se indexan los embeddings de 768 dimensiones L2-normalizados de todo el catalogo y se consulta por imagen; encaja con el perfil de compatibilidad EStock mencionado en la model card, que usa redimensionado del lado corto a 256 y recorte central de 224 x 224.
- Deduplicacion de imagenes: comparar embeddings normalizados con un umbral de similitud coseno permite detectar imagenes repetidas o casi identicas en grandes conjuntos de datos.
- Etiquetado automatico y agrupacion de inventario: agrupar por similitud los embeddings de imagenes sin etiquetar y asignar categorias a cada grupo, reduciendo el trabajo de anotacion manual.
- Clasificacion con pocas etiquetas en dominios especificos: entrenar una regresion logistica o un clasificador lineal sobre los embeddings congelados de 768 dimensiones para tareas verticales con cientos de ejemplos.
- Recuperacion de imagenes en aplicaciones locales de Windows: al estar exportado a ONNX con DirectML, el pipeline puede ejecutarse en el equipo del usuario sin enviar las imagenes a un servicio externo, lo que ayuda con requisitos de privacidad.
- Filtrado previo y moderacion: usar la distancia a centroides de embeddings de referencia para marcar contenido sospechoso antes de pasarlo a un clasificador especifico.
- Sistemas de recomendacion visual: calcular vecinos mas cercanos en el espacio de embeddings para sugerir productos visualmente similares a partir de una imagen de consulta.
- Control de calidad en pipelines de e-commerce: comparar la imagen recibida de un proveedor con la imagen canonica del producto y rechazar desviaciones por encima de un umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (ni linear probing, ni recuperacion, ni comparaciones con otros backbones), y la busqueda web realizada no devolvio resultados relacionados con el modelo. Tampoco se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. Los pesos del backbone en FP16 ocupan del orden de 170-180 MB, coherente con el tamano de repositorio declarado de 0,2 GB; a ello se suma el coste de activaciones de una unica imagen de 224 x 224, que es pequeno.
- GPU recomendadas: cualquier GPU con soporte DirectML en Windows, incluidas las de gama de consumo actuales y varias integradas; el proveedor probado por el autor es `DmlExecutionProvider`. Tambien puede ejecutarse en `CPUExecutionProvider`.
- Cabe en GPU de consumo: si, con margen amplio. Al tratarse de un modelo de aproximadamente 86 M de parametros en FP16 y batch 1, es viable en practicamente cualquier GPU de consumo reciente y en muchas soluciones integradas.
- Opciones de despliegue: ONNX Runtime con `DmlExecutionProvider`, con `CPUExecutionProvider` como alternativa. El autor solo ha probado explicitamente esos dos proveedores; otros execution providers de ONNX Runtime no estan verificados en la model card.
- Entorno de referencia declarado: Windows, Python 3.14.5 de 64 bits, `onnxruntime-directml` 1.24.4, `numpy` 2.5.2 y `pillow` 12.3.0.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Formato | Licencia | Benchmarks |
|---|---|---|---|---|---|---|
| `tomathosauce/estock-dinov2-vitb14-onnx` | no disponible (backbone ViT-B/14) | fija 1 x 3 x 224 x 224 | 1 x 768 pooled | ONNX FP16, opset 18 | Apache 2.0 | no disponible |
| DINOv2 ViT-B/14 original (`facebookresearch/dinov2`) | no disponible en la informacion proporcionada | flexible (resolucion y lote configurables) | embedding pooled y caracteristicas por parche | PyTorch (safetensors/pth) | Apache 2.0 | no disponible |
| Otros exports ONNX de DINOv2 | no disponible | no disponible | no disponible | ONNX | Apache 2.0 | no disponible |
| Alternativas de embedding visual (por ejemplo, modelos tipo CLIP o SigLIP) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia verificable entre este artefacto y los pesos originales de DINOv2 es de empaquetado: aqui la entrada y la salida estan fijadas a `1 x 3 x 224 x 224` y `1 x 768`, respectivamente, y el grafo esta optimizado para DirectML en FP16. El modelo original en PyTorch permite lotes y resoluciones variables y da acceso a representaciones por parche, opciones que este export no ofrece. No se dispone de datos comparativos de calidad entre ambas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni multimodal: no responde a preguntas, no genera texto y no procesa instrucciones en lenguaje natural.
- No es un clasificador zero-shot por si mismo: para obtener etiquetas hay que entrenar una cabeza o sonda sobre los embeddings.
- Entrada y salida fijas: batch 1 y resolucion 224 x 224. Cualquier cambio de lote o de resolucion exige reexportar el grafo.
- Solo se devuelve el embedding pooled de 768 dimensiones; no hay caracteristicas densas por parche, lo que descarta segmentacion semantica densa, deteccion de objetos o tareas que necesiten mapas espaciales.
- Precisión FP16: la conversion desde los pesos originales puede introducir una degradacion pequena pero no cuantificada de la calidad del embedding. No se publica ninguna comparacion FP16 frente a FP32.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de falsos positivos o falsos negativos al usar umbrales de similitud, especialmente en dominios alejados de los datos de entrenamiento originales.
- Sesgos: la model card no documenta ninguna evaluacion de sesgos ni la composicion del dataset de entrenamiento original; cualquier sesgo presente en los pesos de DINOv2 se hereda tal cual.
- Preprocesado critico: hay que respetar el orden documentado (RGB, redimensionado bicubico del lado corto, recorte central de 224 x 224, conversion a CHW, escalado a 0-1, normalizacion ImageNet con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`, conversion a FP16). Desviarse de el degrada los embeddings de forma silenciosa.
- Normalizacion de la salida: la model card recomienda convertir a FP32 y aplicar normalizacion L2 antes de almacenar o comparar; omitirlo invalida las busquedas por similitud coseno.
- Entorno verificado limitado: solo Windows con `onnxruntime-directml` 1.24.4. Otros sistemas operativos, versiones de runtime o execution providers no estan probados por el autor.
- Licencia: Apache 2.0 permite uso comercial. Es necesario conservar la atribucion a Meta por los pesos originales de DINOv2 y al autor del export; conviene revisar el repositorio upstream para los detalles de atribucion.
- Madurez del artefacto: 0 descargas y 0 valoraciones en el momento de la consulta; no hay validacion independiente del export.
- Metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-13) no son coherentes con el estado actual de la informacion, por lo que conviene tratarlas con cautela.
- Verificacion de integridad: antes de cargar el fichero se recomienda comprobar el SHA-256 publicado, ya que un grafo ONNX es codigo ejecutable en la practica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tomathosauce/estock-dinov2-vitb14-onnx
- Repositorio upstream de DINOv2 (Meta): https://github.com/facebookresearch/dinov2 (enlazado desde la model card)
- Paper de DINOv2: https://arxiv.org/abs/2304.07193 (referencia del modelo original; no aparece en la informacion proporcionada)
- `onnxslim`, herramienta de optimizacion citada en la model card: enlace no incluido en la informacion proporcionada
- Resultados de la busqueda web: no se encontro ningun resultado relacionado con el modelo; las entradas devueltas correspondian a un centro de radon en Hesse (Alemania) y no guardan relacion con este artefacto.
