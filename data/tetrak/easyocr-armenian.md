# tetrak/easyocr-armenian

## Resumen

El modelo `tetrak/easyocr-armenian` es un reconocedor de texto (OCR) para el idioma armenio, empaquetado como modelo personalizado de EasyOCR. Lo desarrolla el autor `tetrak` como parte del pipeline Tetrak, orientado a la digitalización de archivos comunitarios. El modelo utiliza la arquitectura de reconocimiento generation2 de EasyOCR, compuesta por un extractor de características VGG, dos capas BiLSTM y una cabeza CTC, con un total de 3.800.616 parámetros. Su relevancia radica en que EasyOCR no incluye soporte nativo para armenio, y este modelo permite añadirlo de forma sencilla mediante el mecanismo de modelos personalizados de la librería.

Se encuentra en estado v0 alpha: ha sido entrenado exclusivamente con recortes sintéticos de palabras generados a partir de texto de la Enciclopedia Soviética Armenia, alcanzando un 99,72 % de precisión de palabra en el conjunto de validación sintética, pero aún no ha sido evaluado sobre escaneos reales. A pesar de su carácter experimental, demuestra la viabilidad de la ruta de entrega y sienta las bases para una futura versión v1 con datos aumentados y líneas completas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG feature extractor + 2 BiLSTM + cabeza CTC (generation2 de EasyOCR) |
| Parametros totales | 3.800.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de OCR, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors y .pth) |
| Idiomas soportados | Armenio (hy), inglés básico (en) para caracteres latinos, dígitos y puntuación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, .pth, .yaml, .py |

## Arquitectura y entrenamiento

La arquitectura es la red de reconocimiento generation2 de EasyOCR: un extractor de características basado en VGG, seguido de dos capas BiLSTM y una cabeza de decodificación CTC. Esta configuración está diseñada para reconocimiento de texto en imágenes de una sola línea o recortes de palabras. El modelo se empaqueta como un modelo personalizado de EasyOCR, de modo que se integra directamente en la instalación estándar de la librería sin modificaciones adicionales.

El entrenamiento se realizó sobre el conjunto de datos `tetrak/armenian-ocr-crops`, concretamente en su configuración `crops`, que contiene recortes sintéticos de palabras renderizadas a partir de texto corregido de la Enciclopedia Soviética Armenia (procedente de Armenian Wikisource, bajo licencia CC BY-SA). Las fuentes tipográficas utilizadas fueron Noto Sans y Noto Serif Armenian, ambas bajo SIL Open Font Licence 1.1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un entrenamiento supervisado con pérdida CTC. El repositorio incluye un archivo `provenance.json` que documenta la receta de entrenamiento, la revisión exacta del dataset y los checksums de los pesos.

## Capacidades

- Reconocimiento de texto armenio en imágenes (recortes de palabras).
- Soporte para caracteres armenios, latinos básicos, dígitos y puntuación.
- Integración con el pipeline completo de EasyOCR, que incluye detección de texto mediante CRAFT y reconocimiento mediante este modelo.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de visión para OCR.
- Funciona con el mecanismo de modelos personalizados de EasyOCR, lo que permite cargarlo con `easyocr.Reader(["en"], recog_network="tetrak_hy")`.

## Casos de uso

- Digitalización de archivos comunitarios armenios: el modelo se integra en el pipeline Tetrak para convertir documentos históricos escaneados en texto digital, facilitando su búsqueda y preservación.
- OCR de documentos históricos armenios: puede aplicarse a imágenes de páginas de enciclopedias, periódicos o manuscritos, siempre que el texto esté en recortes de palabras o líneas simples.
- Procesamiento de capturas de pantalla o fotografías de texto armenio: útil para extraer información de imágenes en aplicaciones móviles o de escritorio.
- Integración en pipelines de OCR existentes: al ser un modelo personalizado de EasyOCR, se puede añadir a flujos que ya usan esta librería para otros idiomas, ampliando la cobertura al armenio.
- Investigación en humanidades digitales: permite construir corpus textuales a partir de fuentes armenias escaneadas, con fines de análisis lingüístico o histórico.
- Validación de la ruta de entrega de modelos OCR personalizados: sirve como referencia para desarrolladores que quieran entrenar y empaquetar sus propios reconocedores para idiomas poco soportados.

## Benchmarks y rendimiento

Según la model card, en el conjunto de validación sintética (retenido durante el entrenamiento) el modelo alcanza un 99,72 % de precisión de palabra y una distancia de edición normalizada de 0,998. No se han publicado resultados de benchmarks en la información disponible más allá de estos datos, ni comparaciones con otros modelos OCR para armenio. Tampoco se dispone de mediciones sobre escaneos reales, que el propio autor reconoce como más difíciles que los recortes sintéticos.

## Requisitos de hardware

- Al tratarse de un modelo pequeño (3,8 M de parámetros), la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- No se especifican requisitos de VRAM, pero se estima que el uso de memoria es mínimo (inferior a 100 MB en FP32).
- Es compatible con cualquier GPU con al menos 1 GB de VRAM si se desea aceleración, aunque no es necesaria.
- El despliegue se realiza a través de EasyOCR, que utiliza PyTorch; también es posible exportar el modelo a ONNX para ejecución en CPU, GPU o NPU, como se hace en otros proyectos de EasyOCR.
- La latencia y el throughput no están documentados, pero para un modelo de este tamaño se espera un rendimiento en tiempo real en CPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tetrak/easyocr-armenian | VGG + BiLSTM + CTC | 3,8 M | Armenio, latín básico | Apache 2.0 | Hugging Face |
| hye-tesseract (calfa-co) | Tesseract OCR | No disponible | Armenio clásico, occidental y oriental | No especificada (open source) | GitHub |
| EasyOCR estándar (para otros idiomas) | CRNN (CRAFT + recognition) | Varía según idioma | 80+ idiomas | Apache 2.0 | GitHub, model hub |

No se dispone de comparativas de rendimiento publicadas entre estos modelos. La principal diferencia es que `tetrak/easyocr-armenian` se integra directamente en EasyOCR, mientras que `hye-tesseract` está optimizado para Tesseract. EasyOCR estándar no incluye armenio, por lo que este modelo cubre un hueco específico.

## Limitaciones y advertencias

- Estado v0 alpha: los pesos son de una primera iteración y no han sido evaluados sobre escaneos reales; su rendimiento en documentos reales puede ser significativamente inferior al observado en datos sintéticos.
- Entrenamiento exclusivamente con datos sintéticos: puede fallar ante ruido, fuentes no vistas, variaciones de iluminación o degradaciones propias de documentos históricos.
- Limitado a recortes de palabras: no maneja líneas completas de texto, aunque se planea una v1 con líneas aumentadas.
- Cobertura de idiomas restringida: solo armenio y caracteres latinos básicos; no soporta otros alfabetos.
- Licencia de datos: los datos de entrenamiento son CC BY-SA, lo que podría tener implicaciones legales sobre la distribución de los pesos, aunque el autor argumenta que los pesos no constituyen una redistribución de los datos. Esta cuestión no está legalmente resuelta.
- Sin garantías de producción: el autor recomienda tratar el modelo como una prueba de concepto, no como un reconocedor listo para entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetrak/easyocr-armenian
- Dataset de entrenamiento: https://huggingface.co/datasets/tetrak/armenian-ocr-crops
- Repositorio del trainer: https://github.com/scattercode/tetrak-hy-trainer
- Pipeline Tetrak: https://tetrak.dev/
- EasyOCR (GitHub): https://github.com/JaidedAI/EasyOCR
- EasyOCR Model Hub: https://www.jaided.ai/easyocr/modelhub/
- Modelo alternativo para armenio con Tesseract: https://github.com/calfa-co/hye-tesseract
