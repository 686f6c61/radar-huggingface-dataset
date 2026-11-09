# Thareah/ThaOCR-rec

## Resumen
ThaOCR-rec es un modelo de reconocimiento de texto (OCR) especializado en líneas de texto en jemer (khmer) e inglés, desarrollado por Thareah. Forma parte de la etapa 3 de 5 de un pipeline OCR más amplio llamado ThaOCR y se distribuye como modelo ONNX listo para inferencia con onnxruntime. No es un modelo de lenguaje generativo, sino un reconocedor CRNN-CTC de 4,76 millones de parámetros que procesa recortes de una sola línea de texto.

La arquitectura es una red convolucional recurrente (CRNN) con CTC para decodificación, con canales convolucionales de 48-96-192-256, proyección de 320 y una BiLSTM de 2 capas con 256 unidades. El modelo recibe una imagen en escala de grises de altura fija 48 píxeles y anchura dinámica, con forma `[N,1,48,W]` en float32 normalizado a 0..1, y produce una secuencia sobre un vocabulario de 195 símbolos (letras, vocales y signos jemeres, dígitos, letras latinas y puntuación), con id 0 reservado para el blank de CTC.

Su relevancia radica en cubrir el reconocimiento de jemer, un idioma con poca cobertura en herramientas OCR estándar, incluyendo texto impreso, escenas, escritura manuscrita real y texto bajo sellos oficiales camboyanos. El repositorio incluye múltiples versiones (v1 a v2.4) en fp32 e int8, con la v2.3 (`crnn_m_v2_stamp2`) como versión por defecto y la int8 de 4,8 MB pensada para dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN-CTC (CNN + BiLSTM + CTC), arch "M" |
| Parametros totales | 4,76 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (anchura de línea dinámica; altura fija 48 px) |
| Tipos de cuantizacion | fp32 e int8 (cuantización dinámica del mismo checkpoint) |
| Idiomas soportados | jemer (km) e inglés (en) |
| Licencia | other / mixed-see-readme (licencia mixta, ver README) |
| Formato de pesos | ONNX (fp32 e int8), más `.vocab.json` por versión |

## Arquitectura y entrenamiento
El modelo es una CRNN clásica: una pila convolucional que extrae características de la imagen de línea (altura 48, anchura variable), una proyección a 320 dimensiones, una BiLSTM de 2 capas con 256 unidades por dirección y una cabeza CTC sobre 195 símbolos con blank id 0. La decodificación es CTC greedy. El texto de salida se normaliza con `normalize_khmer`, que aplica orden canónico de clústeres jemeres y fusiona grafías visualmente idénticas.

El entrenamiento se realizó con el trainer `training/rec/train.py` sobre la mezcla `final_v2_hand_real`, con 1.041.136 líneas por época. La mezcla combina secciones sintéticas de imprenta S01–S08 (200.000 líneas muestreadas del corpus de noticias jemeres con 21 fuentes de licencia abierta y fuentes Khmer OS, con efectos de impresión y escaneo), conjuntos sintéticos de escena y cartelería (dataset_v2, dataset_nf_mix, dataset_hard, dataset_nf_hard, dataset_long), 90.860 líneas reales en inglés de DocLayNet, 99.869 líneas impresas de docgen v2, 69.081 líneas sintéticas de escritura manuscrita jemeres de hojas de examen, 11.905 valores manuscritos sintéticos de formularios y dos conjuntos de escritura manuscrita real jemer (2.311 líneas de Thareah/khmer-handwriting sobremuestreadas x8 y 3.549 de SoyVitou/khmer-handwritten-dataset-4.2k sobremuestreadas x4). Se aplicó aumento fuerte (`--aug strong`: warp, inclinación, baja resolución e inversión de polaridad en GPU) y un aumento específico de sellos (`STAMP_AUG=0.12`) que superpone arcos de anillo grises y trazos cortos de sello en el 12 % de los recortes.

La progresión de versiones parte siempre del mejor checkpoint anterior: v1 (6 épocas, lr 1.5e-3), v2 (6 épocas, lr 1e-3, añade docgen impreso y manuscrito sintético), v2.1 (3 épocas, lr 5e-4, añade manuscrito real jemer), v2.2 (2 épocas, lr 1.2e-4, añade aumento de sellos), v2.3 (4 épocas, lr 1.2e-4, por defecto) y v2.4 (4 épocas, lr 1e-4).

## Capacidades
- Reconocimiento de texto en líneas de imagen para jemer e inglés, incluyendo letras, vocales, signos, dígitos, letras latinas y puntuación (195 símbolos).
- Normalización canónica de texto jemer mediante `normalize_khmer`.
- Lectura de texto impreso en documentos y escenas, con robustez ante efectos de impresión y escaneo.
- Lectura de escritura manuscrita jemer real (entrenado con conjuntos reales de Thareah y SoyVitou).
- Lectura de texto situado bajo sellos oficiales camboyanos rojos (versiones v2.2 en adelante).
- Inferencia ligera en CPU o móvil gracias a los modelos int8 de 4,8 MB.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de imagen a texto.

## Casos de uso
- Digitalización de documentos oficiales camboyanos: el modelo lee líneas de texto impreso jemer e inglés con un CER de 0,216 % en validación de imprenta sintética, adecuado para pipelines de archivo y extracción de texto.
- Procesamiento de formularios y hojas de examen manuscritas: las versiones v2.1 en adelante incorporan manuscrito real y sintético, lo que permite reconocer valores manuscritos (nombres, números, fechas) en formularios escaneados.
- Lectura de documentos con sellos oficiales: el aumento `STAMP_AUG=0.12` permite recuperar texto bajo sellos rojos, un caso frecuente en documentación administrativa camboyana.
- OCR en dispositivos móviles: el modelo int8 de 4,8 MB se ejecuta con onnxruntime en teléfonos, permitiendo captura y reconocimiento de líneas en el propio dispositivo sin conexión.
- Extracción de texto en escenas y cartelería: los conjuntos de escena y señalética del entrenamiento permiten reconocer texto en fotografías de carteles y rótulos (CER de 2,73 % en validación de escena sintética).
- Digitalización de prensa y corpus jemeres: el modelo puede alimentar pipelines de indexación y búsqueda sobre artículos de noticias escaneados, combinado con un detector de líneas previo.
- Procesamiento de documentos mixtos jemer-inglés: al soportar ambos idiomas en un único vocabulario, simplifica el reconocimiento de documentos bilingües sin cambiar de modelo.

## Benchmarks y rendimiento
Tasa de error de caracteres (CER) en validación, mejor época, según la model card:

| Conjunto de validación | CER |
|---|---|
| Imprenta sintética V01 | 0,216 % |
| Escena sintética | 2,73 % |
| Inglés real | 0,29 % |
| Imprenta docgen | 7,5 % |
| Manuscrito sintético de examen | 4,5 % |
| Manuscrito sintético de formulario | 3,6 % |
| Manuscrito real Thareah | 21,3 % |
| Manuscrito real SoyVitou | 9,8 % |
| Dev set real de documentos jemeres del autor | 12,7 % |

Evolución del CER entre versiones (imprenta / dev real):

| Versión | CER imprenta | CER dev real |
|---|---|---|
| v1 | 0,29 % | no disponible |
| v2 | 0,22 % | 13,6 % |
| v2.1 | 0,23 % | 13,1 % |
| v2.2 | 0,22 % | 12,9 % |
| v2.3 (por defecto) | 0,216 % | 12,7 % |
| v2.4 | 0,213 % | 12,6 % |

No se han publicado comparaciones con otros modelos OCR en la información disponible.

## Requisitos de hardware
- VRAM estimada: mínima; el modelo fp32 ocupa 19,1 MB y el int8 4,8 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con onnxruntime. Cualquier GPU (RTX 4090, A100, H100) acelera la inferencia pero no es necesaria.
- Cabe en cualquier GPU consumer y en dispositivos móviles con la versión int8.
- Opciones de despliegue: onnxruntime (CPU o GPU), integrable en pipelines Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos OCR (como Tesseract, PaddleOCR o TrOCR) en la información proporcionada. Las diferencias principales frente a alternativas genéricas serían el soporte específico de jemer, el tamaño reducido (4,76 M de parámetros) y la disponibilidad de versiones int8 para móvil, pero no hay cifras comparativas publicadas.

## Limitaciones y advertencias
- El CER en manuscrito real jemer es alto (21,3 % en Thareah y 12,7 % en el dev set real del autor), por lo que la precisión en escritura manuscrita real es limitada frente a imprenta.
- El CER en imprenta docgen es del 7,5 %, notablemente superior al de imprenta sintética, lo que sugiere degradación en documentos reales variados.
- Solo soporta jemer e inglés; no cubre otros idiomas.
- Es un modelo de reconocimiento de líneas, no de detección: requiere un detector de líneas previo en el pipeline.
- La licencia es mixta (`other` / `mixed-see-readme`) y depende de las licencias de los datos de entrenamiento; es necesario revisar el README para uso comercial.
- Riesgo de errores en grafías jemeres visualmente similares pese a la normalización canónica.
- No se han publicado datos de sesgo ni evaluaciones independientes.
- La versión por defecto es v2.3; v2.4 es ligeramente mejor pero aún no es la predeterminada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Thareah/ThaOCR-rec
- Dataset de escritura manuscrita jemer Thareah: https://huggingface.co/datasets/Thareah/khmer-handwriting (referenciado en la model card)
- Dataset SoyVitou/khmer-handwritten-dataset-4.2k: no disponible como enlace directo en la información proporcionada
- DocLayNet: no disponible como enlace directo en la información proporcionada
