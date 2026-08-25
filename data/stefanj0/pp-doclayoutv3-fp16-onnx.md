# stefanj0/PP-DocLayoutV3-FP16-ONNX

## Resumen

PP-DocLayoutV3-FP16-ONNX es una exportación en formato ONNX con precisión FP16 del modelo PP-DocLayoutV3 de PaddlePaddle, especializado en análisis de layout de documentos. El modelo original, desarrollado por el equipo de PaddleOCR, integra detección de elementos de layout (25 clases) y predicción de orden de lectura en un único paso, manejando imágenes no planas con distorsiones físicas como inclinación, curvatura o iluminación adversa. Esta versión concreta ha sido re-exportada por stefanj0 desde el port oficial de PyTorch/Hugging Face, con el objetivo de servir como reemplazo directo en FP16 para el pipeline de RailReaderCore, un proyecto de análisis documental que utiliza el execution provider WebGPU de ONNX Runtime para acelerar la inferencia en GPU de portátiles.

La relevancia de este modelo radica en que ofrece una alternativa optimizada para despliegue en entornos con recursos limitados, manteniendo el contrato de salida `[N,7]` del modelo base (incluyendo el orden de lectura) y conservando la estabilidad numérica en el postprocesado al mantener las operaciones de sigmoide, decodificación de cajas y votación de orden en FP32. El repositorio pesa 0,1 GB y la licencia es Apache-2.0, lo que facilita su integración en proyectos comerciales. Aunque no se publican parámetros totales, la arquitectura subyacente es RT-DETR, un detector de objetos en tiempo real basado en transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (backbone/encoder/decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | FP16 (ONNX) |
| Idiomas soportados | no disponible (modelo de vision, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (exportado desde safetensors) |

## Arquitectura y entrenamiento

El modelo base PP-DocLayoutV3 es un detector de objetos basado en RT-DETR, una arquitectura transformer de detección en tiempo real que combina un backbone convolutional con un encoder-decoder transformer. A diferencia de los detectores tradicionales de dos puntos, PP-DocLayoutV3 predice cajas delimitadoras multipunto para elementos de layout, lo que le permite manejar superficies sesgadas o curvas, y determina el orden lógico de lectura en una sola pasada, reduciendo errores en cascada. El modelo original fue entrenado como parte del ecosistema PaddleOCR-VL-1.5, aunque los detalles específicos del dataset y el número de tokens de entrenamiento no se proporcionan en la información disponible.

Esta exportación FP16 se realizó mediante `torch.onnx.export` desde un wrapper alrededor de `PPDocLayoutV3ForObjectDetection.from_pretrained(...).half()`, replicando el postprocesado del procesador de imágenes original en FP32. Se aplicó `onnxsim` para el plegado de constantes, resolviendo un fallo de particionado del grafo en el execution provider WebGPU causado por el subgrafo de incrustaciones posicionales sinusoidales estáticas. El proceso de exportación requirió `transformers>=5` para cargar el checkpoint fuente, ya que la arquitectura `pp_doclayout_v3` no está registrada en versiones anteriores.

## Capacidades

- Detección de layout de documentos con 25 clases (títulos, párrafos, tablas, imágenes, etc.) mediante cajas delimitadoras multipunto.
- Predicción de orden de lectura dentro de la misma pasada de inferencia, sin necesidad de postprocesado adicional.
- Manejo de imágenes no planas con distorsiones físicas (inclinación, curvatura, iluminación adversa).
- Salida estructurada `[300,7]` con `[classId, confidence, xmin, ymin, xmax, ymax, readingOrder]`, sin dimensión de batch.
- Compatibilidad con ONNX Runtime y su execution provider WebGPU para inferencia en navegador o GPU de bajo consumo.
- Precisión FP16 en el backbone/encoder/decoder con postprocesado en FP32 para estabilidad numérica.
- No incluye capacidades de generación de texto, tool calling ni agentes; es exclusivamente un modelo de visión para detección de objetos.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede identificar y clasificar los elementos de una página (títulos, párrafos, tablas, figuras) en una sola pasada, facilitando la conversión a formatos estructurados como PDF con marcado semántico o HTML.
- Pipeline de OCR con orden de lectura: al proporcionar el orden de lectura de los bloques detectados, permite reconstruir el flujo textual correcto en documentos complejos, útil para sistemas de extracción de información o asistentes de lectura.
- Análisis de documentos históricos o deteriorados: gracias a su robustez frente a distorsiones físicas, puede procesar imágenes con curvatura o iluminación irregular que otros detectores fallarían, siendo adecuado para archivos digitalizados.
- Integración en aplicaciones web con WebGPU: al estar optimizado para el execution provider WebGPU, puede ejecutarse directamente en el navegador sin servidor, permitiendo análisis de layout en tiempo real en herramientas de productividad o plataformas de gestión documental.
- Preprocesado para sistemas RAG (Retrieval-Augmented Generation): la detección de layout y el orden de lectura permiten segmentar documentos en chunks coherentes antes de su indexación vectorial, mejorando la calidad de las respuestas generadas.
- Automatización de formularios y facturas: la clasificación de elementos (campos, tablas, firmas) facilita la extracción automatizada de datos en procesos de contabilidad o gestión administrativa, reduciendo la intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como COCO o DocLayNet) en la informacion disponible. El autor proporciona una validación propia sobre el pipeline real de RailReaderCore:

| Metrica | Valor |
|---|---|
| Coincidencia de centroides de bloques (pagina real) | 14/14 bloques coinciden, diferencias sub-pixel |
| Coincidencia de centroides de bloques (pagina adicional) | 4/4 bloques, coincidencia exacta |
| Aceleracion de inferencia (WebGPU EP vs CPU EP, GPU de portatil) | ~7.3x |

Estos datos indican que la version FP16 mantiene la precision del modelo FP32 original en la practica, con una mejora significativa de rendimiento en GPU de consumo.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamano del repositorio es de 0,1 GB, por lo que se estima que el modelo cabe en GPUs con 2 GB o menos en FP16.
- GPU recomendadas: cualquier GPU compatible con WebGPU (integrada o discreta) para el execution provider WebGPU; tambien funciona en CPU con ONNX Runtime, aunque con mayor latencia.
- En consumer GPU: si, cabe en GPUs de gama baja como GTX 1650, RTX 3050 o incluso iGPUs modernas con soporte WebGPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU), compatible con herramientas que carguen modelos ONNX (por ejemplo, Hugging Face Optimum, ONNX Runtime Web).
- Latencia y throughput: no se proporcionan valores absolutos; el unico dato es la aceleracion relativa de ~7.3x al pasar de CPU EP a WebGPU EP en una GPU de portatil.

## Comparativa con modelos similares

| Modelo | Formato | Precision | Clases | Orden de lectura | Licencia | Notas |
|---|---|---|---|---|---|---|
| stefanj0/PP-DocLayoutV3-FP16-ONNX | ONNX | FP16 | 25 | Si | Apache-2.0 | Optimizado para WebGPU, sin mascaras |
| PaddlePaddle/PP-DocLayoutV3_safetensors | PyTorch/HF | FP32 | 25 | Si | Apache-2.0 | Modelo base original, incluye mascaras |
| beclab/PP-DocLayoutV3_onnx | ONNX | FP32 (presumible) | 25 | Si | Apache-2.0 | Exportacion ONNX alternativa, sin detalle de precision |

La principal diferencia entre esta exportacion y la de beclab es la precision FP16 y el enfoque en WebGPU, ademas de la exclusion de la cabeza de segmentacion de mascaras/poligonos. El modelo base de PaddlePaddle ofrece la funcionalidad completa, pero requiere un runtime de PyTorch y mas recursos.

## Limitaciones y advertencias

- No incluye la cabeza de segmentacion de mascaras/poligonos que el port de Hugging Face expone; solo produce cajas delimitadoras rectangulares (aunque el modelo base puede predecir multipuntos, esta exportacion devuelve cajas de dos puntos).
- Requiere un preprocesado especifico: la imagen debe estar letterboxed y reescalada a `[1,3,800,800]` con valores en `[0,1]`, sin normalizacion de media/desviacion. No seguir este contrato produce resultados incorrectos.
- La salida tiene un maximo fijo de 300 detecciones; documentos con mas de 300 elementos podrian perder informacion.
- Para cargar el checkpoint fuente se necesita `transformers>=5`, lo que puede limitar la reproducibilidad en entornos con versiones antiguas.
- No se han publicado evaluaciones formales sobre sesgos o alucinaciones; al ser un modelo de deteccion, el riesgo de alucinacion se traduce en falsos positivos en la clasificacion de elementos.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; se recomienda verificar los terminos de PaddlePaddle para el modelo original.
- El rendimiento en CPU puede ser significativamente lento comparado con GPU, especialmente con el postprocesado en FP32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefanj0/PP-DocLayoutV3-FP16-ONNX
- Modelo base (PaddlePaddle): https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- Repositorio RailReaderCore: https://github.com/sjvrensburg/RailReaderCore
- Documentacion de PP-DocLayoutV3 en Transformers: https://huggingface.co/docs/transformers/v5.1.0/en/model_doc/pp_doclayout_v3
- Exportacion ONNX alternativa (beclab): https://huggingface.co/beclab/PP-DocLayoutV3_onnx
- Modelo en ModelScope (PaddlePaddle): https://www.modelscope.cn/models/PaddlePaddle/PP-DocLayoutV3_onnx
- Modelo en ModelScope (cjc1887415157): https://www.modelscope.cn/models/cjc1887415157/PP-DocLayoutV3-ONNX
