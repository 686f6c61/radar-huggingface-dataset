# T0xleaner/yolo11m-clip-b32-onnx

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un espejo reproducible de dos exportaciones ONNX de modelos públicos de visión por computador: el detector de objetos Ultralytics YOLO11m (variante media, preentrenada en COCO) y el codificador visual de OpenAI CLIP ViT-B/32, este último cuantizado a int8 de forma dinámica. El autor, T0xleaner, publica ambos ficheros con sus hashes SHA-256 para garantizar builds deterministas, sin modificar los pesos originales. No hay entrenamiento propio ni ajuste fino: es un artefacto de empaquetado y distribución.

La relevancia es operativa: disponer de ambos grafos en ONNX con opset 17 permite ejecutarlos en ONNX Runtime, TensorRT o cualquier runtime compatible sin depender de PyTorch, lo que simplifica el despliegue en entornos de producción con requisitos estrictos de dependencias o en hardware no soportado nativamente por Ultralytics. La combinación YOLO11m + CLIP cubre un pipeline típico de detección y clasificación zero-shot de recortes, útil para etiquetado abierto de imágenes.

El tamaño total del repositorio es de 0,2 GB y la licencia declarada es AGPL-3.0, heredada de Ultralytics, lo que condiciona fuertemente su uso comercial. No se dispone de información sobre idiomas ni sobre el pipeline de clasificación zero-shot más allá de las etiquetas declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (detector CNN/anchor-free de Ultralytics) + CLIP ViT-B/32 (transformer visual ViT-B/32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | int8 dinámica (solo en el codificador visual CLIP); YOLO11m exportado sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 (Ultralytics); el codificador CLIP original es MIT (OpenAI) |
| Formato de pesos | ONNX (opset 17); YOLO11m con entrada 640x640; CLIP visual en int8 dinámico |
| Tamano del repositorio | 0,2 GB |
| Libreria | onnx (ONNX Runtime) |
| Pipeline declarado | object-detection |
| Hash SHA-256 (yolo11m.onnx) | 8887131f52539f079a1201994e4016de96cde79c246b06642a973508d5b4632e |
| Hash SHA-256 (clip-vit-b32-visual.int8.onnx) | 5e57ecd5bd166f595a0f5f690537668e59958f973d162c74d00ae60d2ae03888 |

## Arquitectura y entrenamiento

El repositorio agrupa dos arquitecturas independientes. Por un lado, YOLO11m es un detector de objetos de una sola etapa de la familia Ultralytics YOLO11, con pesos preentrenados en COCO y exportados a ONNX con opset 17 y entrada fija de 640x640 píxeles. Por otro, CLIP ViT-B/32 es el codificador visual de un Vision Transformer de base con parches de 32x32, exportado a ONNX y sometido a cuantización int8 dinámica, que reduce el peso y acelera la inferencia en CPU a costa de una pequeña pérdida de precisión en los embeddings.

No se ha realizado entrenamiento ni ajuste fino adicional: los pesos son los originales publicados por Ultralytics y OpenAI, y el autor solo documenta el proceso de exportación y los hashes de integridad. No hay información sobre datos de entrenamiento, número de tokens de imagen, composición del dataset ni técnicas de alineación como RLHF o DPO, ya que se trata de modelos de visión y no de lenguaje. La innovación técnica del artefacto es la reproducibilidad: hashes verificables y exportaciones estándar que evitan dependencias de frameworks propietarios o versiones concretas de PyTorch.

## Capacidades

- Detección de objetos en imágenes con las 80 clases de COCO mediante YOLO11m, incluyendo cajas delimitadoras y puntuaciones de confianza.
- Clasificación zero-shot de imágenes o recortes mediante embeddings de CLIP ViT-B/32, comparando la similitud coseno con prompts de texto arbitrarios.
- Extracción de características visuales (embeddings) del codificador CLIP para búsqueda por similitud, clustering o recuperación de imágenes.
- Ejecución en ONNX Runtime, TensorRT y otros runtimes compatibles con ONNX, sin necesidad de PyTorch.
- Inferencia en CPU y GPU según el proveedor de ejecución configurado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales de generación.

## Casos de uso

- Detección de objetos en pipelines de visión industrial: YOLO11m ONNX permite localizar defectos o componentes en imágenes de línea de producción con entrada fija de 640x640, integrándose en sistemas embebidos mediante ONNX Runtime.
- Etiquetado abierto de imágenes: combinar los recortes detectados por YOLO11m con los embeddings de CLIP permite asignar etiquetas arbitrarias definidas por el usuario sin reentrenar, útil en catalogación de datasets.
- Búsqueda visual por similitud: usar el codificador CLIP int8 para indexar imágenes y recuperar las más parecidas a una consulta, con coste reducido en CPU gracias a la cuantización.
- Moderación de contenido visual: CLIP permite puntuar imágenes frente a prompts de categorías sensibles, y YOLO11m aporta la localización de los objetos detectados para revisión humana.
- Automatización de inventario en retail: detección de productos con YOLO11m y clasificación zero-shot con CLIP para categorías no presentes en COCO, sin reentrenamiento.
- Prototipado rápido en entornos sin PyTorch: al ser ONNX puro, se puede desplegar en servicios ligeros, contenedores mínimos o dispositivos edge donde instalar el stack de Ultralytics no es viable.
- Verificación de integridad en builds reproducibles: los hashes SHA-256 permiten validar que los artefactos desplegados coinciden con los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; YOLO11m en ONNX con entrada 640x640 requiere típicamente menos de 2 GB en FP32 y menos de 1 GB en FP16, y CLIP ViT-B/32 int8 ocupa del orden de 100-200 MB, pero estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponibles en la información; al ser ONNX, puede ejecutarse en cualquier GPU compatible con CUDA a través de ONNX Runtime o TensorRT.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 4 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT, y cualquier runtime compatible con ONNX; no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a modelos de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| YOLO11m + CLIP ViT-B/32 (este repo) | no disponible | no aplica | Detección + clasificación zero-shot | AGPL-3.0 | ONNX |
| Ultralytics YOLO11m original | no disponible | no aplica | Detección de objetos | AGPL-3.0 | PyTorch (.pt) |
| OpenAI CLIP ViT-B/32 original | no disponible | no aplica | Clasificación zero-shot | MIT | PyTorch |
| YOLOv8m (Ultralytics) | no disponible | no aplica | Detección de objetos | AGPL-3.0 | PyTorch / ONNX |

La comparativa se limita a los modelos de origen, ya que no se dispone de datos de rendimiento ni de parámetros en la información proporcionada. La diferencia principal frente a los originales es el formato ONNX y la cuantización int8 del codificador visual.

## Limitaciones y advertencias

- Licencia AGPL-3.0 heredada de Ultralytics: el uso comercial en servicios en red puede obligar a liberar el código fuente del servicio; revisar con asesoría legal antes de producción.
- El codificador CLIP original es MIT, pero al distribuirse junto a YOLO11m en el mismo repositorio, la licencia declarada del conjunto es AGPL-3.0.
- La cuantización int8 dinámica del codificador CLIP puede degradar ligeramente la calidad de los embeddings y, por tanto, la precisión de la clasificación zero-shot.
- YOLO11m está limitado a las 80 clases de COCO; no detecta categorías fuera de ese conjunto sin reentrenamiento.
- Entrada fija de 640x640 en la exportación ONNX: imágenes de otras resoluciones requieren redimensionado previo y pueden perder precisión en objetos pequeños.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- Riesgo de falsos positivos y negativos inherente a los detectores de una etapa, especialmente en escenas densas u objetos ocluidos.
- No hay información sobre sesgos demográficos o culturales de los datasets COCO y CLIP; ambos presentan sesgos conocidos en la literatura.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- No se especifican versiones exactas de ONNX Runtime ni de opset más allá de opset 17, lo que puede afectar a la compatibilidad con runtimes antiguos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/T0xleaner/yolo11m-clip-b32-onnx
- Documentación de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio oficial de OpenAI CLIP: https://github.com/openai/CLIP
