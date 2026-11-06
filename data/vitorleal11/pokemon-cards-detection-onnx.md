# vitorleal11/pokemon-cards-detection-onnx

## Resumen

El modelo `vitorleal11/pokemon-cards-detection-onnx` es una exportación a ONNX del detector de objetos `Matthieu68857/pokemon-cards-detection`, un DETR basado en `facebook/detr-resnet-50` y afinado para una única clase, `Card`. Su función es localizar cartas Pokémon dentro de una imagen (bounding boxes), no identificarlas ni clasificarlas por nombre o expansión. El autor de esta versión, vitorleal11, se limita a convertir los pesos originales al formato ONNX y a cuantizarlos en 8 bits para su uso con transformers.js.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo generativo, sino de un detector de objetos especializado y muy ligero (el fichero cuantizado ronda los 43 MB) pensado para ejecutarse en el navegador o en Node.js mediante ONNX Runtime y WebAssembly. No hay información publicada sobre el proceso de entrenamiento, los datos utilizados ni métricas de evaluación más allá de una comparación cualitativa con el modelo base.

La información disponible es escasa: la model card original es breve y no incluye detalles sobre composición del dataset, hiperparámetros, número de épocas ni resultados de benchmarks. Todo lo que se detalla a continuación proviene de la model card y de los metadatos de Hugging Face; lo que no consta se indica explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DETR (ResNet-50 como backbone), exportado a ONNX |
| Parámetros totales | no disponible (el modelo base DETR-ResNet-50 ronda los 41 M, pero no se confirma en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | 8 bits (QUInt8, cuantización dinámica con `onnxruntime.quantization.quantize_dynamic`); fichero `onnx/model_quantized.onnx` de ~43 MB |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (versión cuantizada incluida; no se detalla si hay versión FP32 en el repo) |

## Arquitectura y entrenamiento

La arquitectura es DETR (Detection Transformer), un detector que combina un backbone convolucional ResNet-50 con un encoder-decoder transformer y predicción de conjuntos mediante matching bipartito. En este caso se parte de `facebook/detr-resnet-50` y se afina para una sola clase, `Card`, de modo que la cabeza de clasificación predice únicamente presencia o ausencia de carta. El resultado es un modelo que devuelve bounding boxes con una puntuación de confianza por caja.

No se dispone de información sobre el dataset de entrenamiento (número de imágenes, procedencia, anotaciones), el número de épocas, la función de pérdida empleada ni si hubo aumentos de datos. Tampoco consta ningún proceso de RLHF, DPO o ajuste por preferencias, algo esperable en un detector de objetos. La única innovación técnica documentada es la propia exportación: conversión con `optimum-cli export onnx --task object-detection` y cuantización dinámica a QUInt8, que reduce el peso a unos 43 MB manteniendo, según el autor, puntuaciones dentro de 0,01 respecto al modelo original en las imágenes de prueba.

## Capacidades

- Detección de objetos de una única clase (`Card`): devuelve bounding boxes con puntuación de confianza para cada carta Pokémon presente en la imagen.
- Localización, no identificación: no reconoce qué carta es, su nombre, expansión, rareza ni estado.
- Umbral de confianza configurable en la llamada al pipeline (por ejemplo, `threshold: 0.7`).
- Ejecución en navegador y en Node.js mediante transformers.js con backend ONNX Runtime y WebAssembly (`device: 'wasm'`).
- Inferencia con pesos cuantizados a 8 bits (`dtype: 'q8'`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modos especiales (thinking, visión general, audio): es exclusivamente un detector visual de dominio específico.

## Casos de uso

- Digitalización de colecciones: procesar fotos de una mesa o vitrina con varias cartas y obtener las coordenadas de cada una para recortarlas automáticamente y pasarlas a un segundo modelo de clasificación o OCR.
- Aplicaciones web de escaneo en el navegador: al ejecutarse con transformers.js y WASM, permite detectar cartas en el cliente sin enviar la imagen a un servidor, lo que reduce latencia y coste de infraestructura.
- Preprocesado en pipelines de identificación: usar las cajas detectadas como entrada de un modelo de reconocimiento de carta (por ejemplo, un clasificador o un sistema de búsqueda por imagen) para separar la etapa de localización de la de identificación.
- Automatización de inventario para tiendas o coleccionistas: fotografiar lotes de cartas y generar recortes individuales para su catalogación posterior.
- Herramientas de análisis de mercado: localizar cartas en fotos de subastas o anuncios para normalizar imágenes antes de extraer metadatos.
- Filtrado y moderación en plataformas de compraventa: detectar si una imagen contiene cartas Pokémon como paso previo a la clasificación del anuncio.
- Prototipado rápido en JavaScript: al estar disponible en formato ONNX y con ejemplo de uso en la model card, sirve para validar una idea de producto en el navegador sin montar infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que, en las imágenes de prueba, el modelo cuantizado encuentra las mismas cartas que el original con puntuaciones que difieren en menos de 0,01. No hay métricas de mAP, precisión, recall ni comparaciones cuantitativas con otros detectores.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario previsto (WASM en navegador o CPU). El fichero cuantizado ocupa unos 43 MB, por lo que la memoria necesaria es muy reducida; no se publican cifras de memoria en ejecución.
- GPU recomendadas: no se especifican. El ejemplo de la model card usa `device: 'wasm'`, es decir, CPU o WebAssembly.
- ¿Cabe en GPU de consumo? Sí, con holgura, dado el tamaño del modelo; cualquier GPU consumer moderna podría ejecutarlo, aunque no se documentan configuraciones con CUDA o WebGPU.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con ONNX Runtime; también podría ejecutarse con ONNX Runtime directamente en Python, Node u otros entornos, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| vitorleal11/pokemon-cards-detection-onnx | DETR (ResNet-50) | 1 (`Card`) | ONNX (q8) | Apache 2.0 | no aplica |
| Matthieu68857/pokemon-cards-detection | DETR (ResNet-50) | 1 (`Card`) | PyTorch (modelo base) | no disponible en la información proporcionada | no aplica |
| facebook/detr-resnet-50 | DETR (ResNet-50) | 91 (COCO) | PyTorch / ONNX | Apache 2.0 | no aplica |

La comparación relevante es con el modelo base del que deriva: esta versión ONNX replica el comportamiento del detector original con pesos cuantizados y un tamaño mucho menor, a cambio de una posible pérdida mínima de precisión (según el autor, inferior a 0,01 en las puntuaciones). Frente a `facebook/detr-resnet-50` genérico, este modelo está especializado en una sola clase y no detecta objetos de COCO. No se dispone de datos de rendimiento para comparar con otros detectores de cartas.

## Limitaciones y advertencias

- Solo detecta la clase `Card`: no distingue cartas Pokémon de otras cartas coleccionables ni identifica la carta concreta.
- No hay información sobre el dataset de entrenamiento, por lo que se desconoce su cobertura ante distintos fondos, iluminaciones, ángulos, fundas, reflejos o cartas parcialmente ocultas.
- Riesgo de falsos positivos y negativos en imágenes con objetos rectangulares similares a cartas; el umbral de confianza debe calibrarse por caso de uso.
- La cuantización a 8 bits puede degradar ligeramente la precisión en casos límite, aunque el autor reporta diferencias mínimas en sus pruebas.
- No se documentan sesgos, pero al ser un detector entrenado con un dataset no descrito, su comportamiento en dominios distintos al de entrenamiento es incierto.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; conviene verificar la licencia del modelo base original, que no consta en la información proporcionada.
- No es un modelo de lenguaje: no debe evaluarse con métricas de texto ni usarse para tareas generativas.
- El repositorio tiene un tamaño declarado de 0.0 GB y muy pocas descargas (40) y likes (0), lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vitorleal11/pokemon-cards-detection-onnx
- Modelo base: https://huggingface.co/Matthieu68857/pokemon-cards-detection
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Modelo DETR original: https://huggingface.co/facebook/detr-resnet-50
