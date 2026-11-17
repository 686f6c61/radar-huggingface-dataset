# zaltahir/kaptchaocr-tiny-rec

## Resumen

KaptchaOCR ft-tiny es un modelo de reconocimiento óptico de caracteres (OCR) especializado en CAPTCHAs, desarrollado por el usuario zaltahir. Se trata de un fine-tuning del reconocedor PP-OCRv6 tiny de PaddleOCR, empaquetado en formato ONNX para su ejecución con onnxruntime. El modelo forma parte del proyecto KaptchaOCR, una biblioteca y servidor de CAPTCHAs escrito en Rust, y constituye uno de los cinco modelos ajustados que componen la familia.

El modelo resuelve una tarea muy concreta: la transcripción de cadenas de texto en imágenes CAPTCHA mediante una cabeza CTC (Connectionist Temporal Classification). Con solo 4,3 MB de tamaño, está diseñado para perfiles de despliegue "fast", es decir, inferencia de baja latencia en CPU. Su entrada es una imagen RGB de altura fija 48 píxeles y anchura dinámica, y trabaja con un charset de 6.906 caracteres.

La relevancia de este modelo radica en su carácter de componente de inferencia puro: no incluye preprocesado ni decodificación, que quedan delegados a la biblioteca KaptchaOCR. Su licencia Apache-2.0 y su reducido tamaño lo hacen adecuado para integración en pipelines de automatización de pruebas o en sistemas que necesiten resolver CAPTCHAs de forma local y ligera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 tiny (reconocedor CTC) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, anchura de entrada dinámica) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (charset de 6.906 caracteres, sin desglose por idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`tiny_rec.onnx`) + charset JSON (`tiny_rec.json`) |

Otras especificaciones relevantes:

| Parámetro | Valor |
|---|---|
| Tamaño del modelo | 4,3 MB |
| Entrada | RGB, altura 48, anchura dinámica |
| Charset | 6.906 caracteres |
| Tarea | Reconocimiento de texto (CTC) |
| Perfil | `fast` |
| Datos de entrenamiento | 169.311 imágenes CAPTCHA / 194.355 etiquetas (sobremuestreadas), sensibles a mayúsculas, 73 clases |
| Validación | 5.000 imágenes |

## Arquitectura y entrenamiento

El modelo se basa en el reconocedor PP-OCRv6 tiny de PaddleOCR, una arquitectura de reconocimiento de texto con cabeza CTC. La entrada es una imagen RGB normalizada a altura 48 píxeles con anchura dinámica, y la salida es una secuencia de caracteres decodificada mediante CTC. El modelo distribuido es únicamente de inferencia: el preprocesado de imagen, la decodificación CTC y la capa HTTP quedan a cargo de la biblioteca KaptchaOCR.

El fine-tuning se realizó sobre 169.311 imágenes CAPTCHA con 194.355 etiquetas (sobremuestreadas), sensibles a mayúsculas y minúsculas, organizadas en 73 clases. El conjunto de validación consta de 5.000 imágenes. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable por otra parte en un modelo de OCR. Tampoco se detalla si hubo aumento de datos o técnicas de destilación desde el modelo base.

## Capacidades

- Reconocimiento de texto en imágenes CAPTCHA mediante CTC, con salida de cadena completa.
- Sensibilidad a mayúsculas y minúsculas en la transcripción.
- Manejo de un charset de 6.906 caracteres, lo que permite cubrir alfabetos amplios y símbolos.
- Entrada de anchura dinámica, adaptándose a CAPTCHAs de distinta longitud.
- Inferencia en formato ONNX con onnxruntime, sin dependencia de frameworks de deep learning pesados.
- Integración con la biblioteca y servidor KaptchaOCR en Rust para el preprocesado, la decodificación y la exposición HTTP.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Automatización de pruebas de extremo a extremo: el modelo puede resolver CAPTCHAs en suites de test que validan formularios de registro o login, evitando bloqueos manuales en pipelines de CI/CD gracias a su latencia de 9,8 ms por imagen en CPU.
- Extracción de texto en sistemas de scraping controlado: para flujos autorizados que necesiten transcribir imágenes con texto distorsionado, el modelo ofrece una alternativa local y ligera frente a servicios externos.
- Servidor de resolución de CAPTCHAs autoalojado: la biblioteca KaptchaOCR expone el modelo vía HTTP, de modo que se puede desplegar un servicio interno con el binario `kaptchaocr --ocr` y el manifiesto de modelos.
- Procesamiento por lotes en entornos con recursos limitados: con 4,3 MB de pesos y ejecución en CPU (por ejemplo, Intel i5-1145G7), es viable procesar grandes volúmenes de imágenes en máquinas sin GPU.
- Componente embebido en aplicaciones Rust: al integrarse como dependencia de la biblioteca KaptchaOCR, puede incorporarse en herramientas de escritorio o servicios ligeros sin añadir dependencias de Python.
- Filtrado y clasificación de imágenes con texto: el reconocedor puede usarse como paso previo para detectar y transcribir texto en imágenes de distinta procedencia antes de un análisis posterior.
- Investigación sobre robustez de CAPTCHAs: sirve como baseline para medir la dificultad de distintos generadores de CAPTCHA, comparando tasas de acierto por conjunto (atlas, birch, cobalt, dune, ember, fjord).

## Benchmarks y rendimiento

Resultados sobre conjuntos de CAPTCHA retenidos, 4.399 imágenes en total. La métrica de exact match exige coincidencia completa de la cadena y es sensible a mayúsculas. La latencia es la media en ms/imagen sobre un Intel i5-1145G7 en un solo proceso.

| Conjunto | Exact match |
|---|---:|
| atlas | 52% |
| birch | 88% |
| cobalt | 95% |
| dune | 42% |
| ember | 58% |
| fjord | 94% |
| **Global** | **67,0%** |

- Precisión por carácter: 88,8%.
- Latencia media: 9,8 ms/imagen.
- Las imágenes de test son disjuntas a nivel de imagen respecto al entrenamiento, pero provienen de las mismas fuentes públicas, por lo que no constituye un benchmark fuera de distribución.
- Las tablas completas con las líneas base de comparación están en la página de benchmarks del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el perfil objetivo; el modelo está pensado para ejecución en CPU. En GPU el consumo sería mínimo dado el tamaño de 4,3 MB, pero no se publican cifras.
- GPU recomendadas: no disponibles; el benchmark oficial se realizó en CPU (Intel i5-1145G7).
- Compatibilidad con GPU de consumo: el modelo es lo bastante pequeño para ejecutarse en cualquier GPU de consumo, si bien no se documenta un backend GPU específico.
- Opciones de despliegue: onnxruntime (librería declarada), binario `kaptchaocr` con `--ocr` y manifiesto `model/models.json`, o `--ocr-path tiny_rec.onnx` para builds no inline. El charset debe situarse junto al modelo con el mismo nombre base.
- Latencia y throughput: latencia media de 9,8 ms/imagen en CPU de un solo proceso según el benchmark del autor; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaptchaOCR ft-tiny | PP-OCRv6 tiny | 4,3 MB | Reconocimiento CAPTCHA (CTC) | Apache-2.0 | Hugging Face + GitHub |
| PP-OCRv6 tiny (base) | — | no disponible | OCR general | Apache-2.0 | PaddleOCR |
| Otros modelos KaptchaOCR (4 restantes) | PP-OCRv6 | no disponible | Reconocimiento CAPTCHA | Apache-2.0 | Colección en Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El exact match global es del 67,0%, con conjuntos que bajan al 42% (dune) y al 52% (atlas); no es adecuado para aplicaciones donde se exija alta fiabilidad sin verificación posterior.
- El benchmark no es fuera de distribución: las imágenes de test comparten fuentes públicas con el entrenamiento, por lo que el rendimiento en CAPTCHAs de generadores no vistos podría ser inferior.
- El modelo es solo de inferencia: requiere la biblioteca KaptchaOCR para el preprocesado, la decodificación CTC y la capa de servidor; no es autónomo.
- El charset debe acompañar al modelo con el mismo nombre base (`tiny_rec.onnx` → `tiny_rec.json`); un desajuste provoca fallos de decodificación.
- No se documentan sesgos específicos, pero al entrenarse sobre CAPTCHAs sintéticos de 73 clases, su comportamiento está acotado a ese dominio y no debe extrapolarse a OCR general.
- No se especifican los idiomas cubiertos por el charset de 6.906 caracteres; la información de idiomas no está disponible.
- Riesgo de alucinación inherente a la decodificación CTC: puede producir cadenas plausibles pero incorrectas en imágenes ambiguas o con ruido.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base PP-OCRv6 (también Apache-2.0) y de las fuentes de datos de entrenamiento.
- Uso ético: resolver CAPTCHAs puede contravenir los términos de servicio de sitios de terceros; el modelo debe emplearse solo en contextos autorizados (pruebas propias, investigación o sistemas donde se tenga permiso).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaltahir/kaptchaocr-tiny-rec
- Repositorio GitHub de KaptchaOCR: https://github.com/ozalt/kaptchaocr
- Colección de modelos KaptchaOCR: https://huggingface.co/collections/zaltahir/kaptchaocr
- Página de benchmarks: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- PaddleOCR (modelo base): https://github.com/PaddlePaddle/PaddleOCR
