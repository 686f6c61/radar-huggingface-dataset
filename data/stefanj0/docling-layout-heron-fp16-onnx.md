# stefanj0/docling-layout-heron-fp16-onnx

## Resumen

El modelo `stefanj0/docling-layout-heron-fp16-onnx` es una exportación en formato ONNX con precisión FP16 del detector de layout de documentos Docling Heron, desarrollado originalmente por el equipo de Docling (IBM Research). Este export concreto ha sido producido por el usuario stefanj0 para su proyecto RailReaderCore, con el objetivo de ejecutar el modelo de forma nativa en navegadores mediante el execution provider WebGPU de ONNX Runtime. Se trata de un detector de objetos basado en la arquitectura RT-DETRv2, especializado en el análisis de la estructura de páginas de documentos, capaz de identificar 17 clases distintas de elementos (títulos, tablas, imágenes, formularios, etc.) sobre imágenes de 640×640 píxeles.

La relevancia de este modelo radica en que ofrece una alternativa FP16 lista para GPU al export ONNX FP32 existente, manteniendo el mismo contrato de entrada y salida y el mismo postprocesado, lo que lo convierte en un reemplazo directo para entornos de inferencia acelerada. El autor documenta que la conversión post-hoc del grafo FP32 a FP16 fallaba por problemas de anotaciones de tipos y sensibilidad a la precisión mixta, por lo que se re-exportó desde el checkpoint PyTorch original, garantizando consistencia de tipos en todas las operaciones. El modelo hereda la licencia Apache-2.0 del modelo base y está pensado para aplicaciones de conversión de documentos, digitalización y análisis de páginas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (transformer-based object detector) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada 640×640) |
| Tipos de cuantizacion | FP16 (este export); tambien existe variante INT8 backbone-only en otro repositorio |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo base Docling Heron se basa en RT-DETRv2, un detector de objetos tipo transformer con encoder-decoder que opera sobre características visuales extraídas de la imagen de entrada. Según el informe técnico "Advanced Layout Analysis Models for Docling" (arXiv:2509.11720), el modelo fue entrenado sobre un corpus heterogéneo de 150.000 documentos, tanto de acceso abierto como propietarios, junto con otros detectores basados en RT-DETR y DFINE. El export FP16 que nos ocupa no es un reentrenamiento, sino una conversión del checkpoint PyTorch original a ONNX con precisión FP16, realizada mediante `torch.onnx.export` sobre una instancia de `RTDetrV2ForObjectDetection` cargada con `.half()`. El postprocesado (sigmoid, top-k, decodificación de cajas) se mantiene en FP32 para preservar la estabilidad numérica. El autor destaca que la re-exportación desde el código fuente PyTorch evita el bug de anotaciones de tipos obsoletas que afecta a la conversión post-hoc del grafo FP32 ya exportado.

## Capacidades

- Detección de layout de documentos en 17 clases: caption, footnote, formula, list_item, page_footer, page_header, picture, section_header, table, text, title, document_index, code, checkbox_selected, checkbox_unselected, form y key_value_region.
- Salida de hasta 300 detecciones por imagen, con etiquetas (`labels`), cajas delimitadoras en formato xyxy en espacio de píxeles (`boxes`) y puntuaciones de confianza (`scores`).
- Entrada de imagen en formato NCHW uint8 de 640×640, con un tensor adicional `orig_target_sizes` que indica las dimensiones originales de la página (en orden [W, H], no [H, W]).
- Compatibilidad con el execution provider WebGPU de ONNX Runtime, lo que permite inferencia acelerada en navegadores web.
- Precisión FP16 en backbone, encoder y decoder, con postprocesado en FP32 para mayor estabilidad.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización de documentos escaneados: el modelo identifica títulos, tablas, imágenes y pies de página en imágenes de documentos, permitiendo estructurar el contenido para su posterior procesamiento o indexación.
- Conversión de documentos a formatos estructurados: integrado en el pipeline de Docling, puede alimentar la extracción de tablas y texto con conocimiento de la disposición espacial de cada elemento.
- Aplicaciones web de análisis de documentos en el navegador: gracias al soporte WebGPU, el modelo puede ejecutarse localmente en el cliente sin enviar datos a un servidor, útil para herramientas de privacidad o entornos offline.
- Automatización de la clasificación de formularios: detecta checkboxes seleccionados y no seleccionados, así como regiones clave-valor, facilitando el procesamiento de formularios administrativos.
- Indexación de documentos legales o técnicos: la detección de `document_index`, `section_header` y `title` permite generar metadatos estructurales para motores de búsqueda internos.
- Preprocesado para OCR: al identificar regiones de texto, imagen y tablas, el modelo permite dirigir el OCR solo a las áreas relevantes, reduciendo coste computacional y mejorando la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como mAP en COCO o similar) en la información disponible. El autor proporciona una validación propia comparando el modelo FP16 contra el FP32 base en el pipeline real de RailReaderCore:

| Metrica | Valor |
|---|---|
| Coincidencia de centroides de bloques, pagina 1 (documento real) | 13/14 bloques exactos, una deteccion casi duplicada en el limite |
| Coincidencia de centroides, paginas adicionales | Exacta o con desviacion de un pixel en casi duplicados |
| Aceleracion de inferencia (WebGPU EP vs CPU EP, GPU de portatil) | ~9.5× |

La diferencia de un bloque (detección extra o ausente en un umbral de confianza límite) se atribuye al ruido de redondeo FP16, similar al observado en la variante INT8 del modelo, y no se considera una regresión funcional.

## Requisitos de hardware

- Tamaño del repositorio: 0.1 GB, lo que indica un modelo ligero que cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- Inferencia en GPU con precisión FP16: recomendada para aprovechar la aceleración (por ejemplo, NVIDIA RTX series, GPUs integradas con soporte FP16).
- Inferencia en CPU: posible mediante ONNX Runtime con execution provider CPU, aunque con mayor latencia.
- WebGPU: ejecutable en navegadores compatibles (Chrome, Edge, Firefox) con GPU habilitada; el autor reporta una aceleración de ~9.5× frente a CPU en una GPU de portátil.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript), WebGPU, y cualquier framework que soporte ONNX (por ejemplo, Hugging Face Optimum).
- No se dispone de datos de latencia o throughput específicos más allá de la comparativa WebGPU vs CPU.

## Comparativa con modelos similares

| Modelo | Formato | Precision | Entrada | Salida | Licencia |
|---|---|---|---|---|---|
| stefanj0/docling-layout-heron-fp16-onnx (este) | ONNX | FP16 | 640×640 | 300 detecciones, 17 clases | Apache-2.0 |
| docling-project/docling-layout-heron-onnx | ONNX | FP32 | 640×640 | 300 detecciones, 17 clases | Apache-2.0 |
| stefanj0/docling-layout-heron-int8-onnx | ONNX | INT8 (solo backbone) | 640×640 | 300 detecciones, 17 clases | Apache-2.0 |
| docling-project/docling-layout-heron | PyTorch | FP32 | 640×640 | 300 detecciones, 17 clases | Apache-2.0 |

El modelo FP16 ofrece el mismo contrato I/O que el FP32, pero con menor huella de memoria y mayor velocidad en GPUs con soporte FP16. La variante INT8 es aún más ligera pero solo cuantiza el backbone, y puede presentar diferencias numéricas similares. No se dispone de comparación con otros detectores de layout como DFINE (mencionado en el paper de Docling) en términos de rendimiento.

## Limitaciones y advertencias

- La precisión FP16 puede introducir pequeñas diferencias numéricas frente al modelo FP32, especialmente en detecciones con confianza cercana al umbral; el autor documenta un caso de bloque casi duplicado en la validación.
- El contrato de entrada `orig_target_sizes` espera las dimensiones en orden [W, H], no [H, W] como es habitual en Hugging Face; usar el orden incorrecto provocará errores de decodificación de cajas.
- El modelo está fijado a una resolución de entrada de 640×640; imágenes con otras dimensiones deben redimensionarse previamente, lo que puede afectar a la precisión en documentos con layouts muy densos.
- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni realizar razonamiento simbólico.
- No se han publicado análisis de sesgos o comportamientos en dominios específicos (por ejemplo, documentos manuscritos o idiomas no latinos); la información disponible no incluye estudios de sesgo.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia al redistribuir el modelo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/stefanj0/docling-layout-heron-fp16-onnx
- Modelo base (PyTorch): https://huggingface.co/docling-project/docling-layout-heron
- Export FP32 ONNX del modelo base: https://huggingface.co/docling-project/docling-layout-heron-onnx
- Variante INT8 backbone-only: https://huggingface.co/stefanj0/docling-layout-heron-int8-onnx
- Informe tecnico "Advanced Layout Analysis Models for Docling": https://arxiv.org/pdf/2509.11720v1
- Repositorio RailReaderCore (mencionado en la model card): https://github.com/sjvrensburg/RailReaderCore
- Repositorio con implementaciones ONNX de modelos Docling: https://github.com/asmud/docling-onnx-models
