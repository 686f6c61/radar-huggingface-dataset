# swargaraj/recaptcha-v1-crnn

## Resumen

recaptcha-v1-crnn es un modelo compacto de reconocimiento óptico de caracteres (OCR) especializado en captchas de estilo reCAPTCHA v1, desarrollado por el usuario swargaraj y publicado en Hugging Face bajo licencia MIT. El modelo resuelve la tarea de transcripción de imágenes de captcha de 8 a 10 caracteres alfabéticos en minúscula, empleando una arquitectura CRNN (red convolucional recurrente) con función de pérdida CTC. Está entrenado desde cero exclusivamente con 16.000 imágenes reales de captchas, sin datos sintéticos ni preentrenamiento.

La relevancia del modelo es acotada y muy específica: no es un modelo de lenguaje generalista ni un OCR de propósito amplio, sino un artefacto de investigación orientado a un único dominio visual. Su interés técnico radica en la combinación de una CNN de estilo VGG, una BiLSTM de dos capas y decodificación CTC, con un rendimiento reportado del 98,56 % de coincidencia exacta sobre 1.600 captchas reales reservados para evaluación y un CER del 0,20 %.

El repositorio tiene un tamaño de 0,0 GB según los metadatos de Hugging Face, lo que sugiere un checkpoint muy ligero (probablemente unos pocos megabytes), coherente con un modelo de solo 27 clases de salida y una entrada de 64×256 píxeles en escala de grises. No se dispone de información sobre el número de parámetros totales ni sobre la longitud de contexto, ya que no es un modelo de secuencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN: CNN estilo VGG → BiLSTM de 2 capas (256) → capa lineal → CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (alfabeto latino `a`–`z` en minúscula) |
| Licencia | MIT |
| Formato de pesos | `best.pt` (checkpoint PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico CRNN para reconocimiento de texto en imágenes: un extractor convolucional de estilo VGG procesa la imagen de entrada y produce un mapa de características que se divide en 64 pasos temporales; sobre esa secuencia actúa una BiLSTM de dos capas con 256 unidades ocultas, y una capa lineal final proyecta a 27 clases (las 26 letras `a`–`z` más el token blank de CTC). La pérdida CTC permite alinear secuencias de longitud variable sin necesidad de segmentación carácter a carácter. La entrada es una imagen en escala de grises de 64×256 píxeles, obtenida a partir de captchas RGB de 200×70 mediante conversión al canal RGB mínimo, redimensionado con preservación de aspecto y relleno en blanco.

El entrenamiento se realizó desde cero sobre 16.000 captchas reales únicos de estilo reCAPTCHA v1 (200×70 RGB, texto coloreado sobre fondo blanco, 8–10 letras minúsculas), sin imágenes sintéticas ni preentrenamiento sintético. El conjunto de datos está publicado como `swargaraj/recaptcha-v1-captchas`. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de ajuste por preferencias, algo esperable en un modelo de OCR de este tipo.

## Capacidades

- Reconocimiento de texto en imágenes de captcha de estilo reCAPTCHA v1 con cadenas de 8 a 10 letras minúsculas.
- Salida restringida al alfabeto `a`–`z` (26 clases más el token blank de CTC); no reconoce dígitos, mayúsculas ni puntuación.
- Decodificación greedy y decodificación por búsqueda de haz CTC (beam search con anchura 10), ambas soportadas por el pipeline de inferencia del repositorio de código.
- Inferencia en CPU, CUDA y Apple MPS.
- Manejo automático de imágenes de entrada de otros tamaños mediante redimensionado, aunque con pérdida de precisión fuera del estilo de entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, modo thinking, visión general, audio ni multilingüismo.

## Casos de uso

- Investigación sobre robustez de captchas: el modelo sirve como referencia reproducible para medir la resistencia de generadores de captcha de estilo reCAPTCHA v1 frente a ataques OCR con CRNN+CTC, usando el conjunto de evaluación reservado de 1.600 imágenes.
- Docencia en visión por computador: ejemplo completo y ligero de pipeline CRNN+CTC que se ejecuta en CPU, útil para explicar alineamiento CTC, decodificación greedy frente a beam search y preprocesado de imágenes.
- Evaluación comparativa de arquitecturas OCR: al ser un modelo pequeño y entrenado desde cero, permite aislar el efecto de cambios en el extractor convolucional o en la BiLSTM sin el coste de un modelo grande.
- Generación de datasets etiquetados: uso del modelo para preetiquetar grandes lotes de captchas del mismo estilo y revisar manualmente solo las discrepancias, dado su CER del 0,20 %.
- Pruebas de pipelines de despliegue en entornos con recursos limitados: su tamaño reducido permite validar flujos de inferencia en CPU, CUDA o MPS con latencias bajas.
- Auditoría de sistemas propios: un equipo que opere un generador de captchas de estilo similar puede emplear el modelo para comprobar empíricamente el nivel de protección de su implementación antes de desplegarla.

## Benchmarks y rendimiento

| Evaluación | Coincidencia exacta | CER |
|---|---|---|
| 1.600 captchas reales reservados, decodificación greedy | 98,56 % | 0,20 % |
| Mismo conjunto, beam search CTC (anchura 10) | 98,56 % | 0,19 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de OCR de dominio específico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,0 GB) y la arquitectura (CNN VGG ligera + BiLSTM de 256 unidades), el uso de memoria es muy reducido, del orden de cientos de megabytes como máximo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere una A100 ni una H100. El modelo está pensado para ejecutarse también en CPU.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (por ejemplo, series RTX 20xx, 30xx, 40xx) e incluso en hardware integrado.
- Opciones de despliegue: inferencia directa con PyTorch mediante el script `inference.py` del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Longitud de cadena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recaptcha-v1-crnn (swargaraj) | Captcha reCAPTCHA v1, 8–10 letras | CRNN + CTC | 8–10 caracteres | MIT | Hugging Face y GitHub |
| Captcha_v1 (barkinadiguzel) | Captcha de 5 caracteres | CRNN | 5 caracteres | no disponible | GitHub |
| CaptchaMaster v1 | Captcha de 5 caracteres | CRNN | 5 caracteres | no disponible | GitHub |
| Adaptive CAPTCHA (MDPI) | Captcha con interferencias | CRNN + AFFN | no disponible | no disponible (publicación académica) | Artículo MDPI |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de precisión entre ellos.

## Limitaciones y advertencias

- Precisión dependiente del dominio: el modelo solo rinde al nivel reportado con captchas del mismo generador y estilo que los datos de entrenamiento; cambios de fuente, distorsión, esquema de color o longitud reducen la exactitud.
- Alfabeto restringido: únicamente letras minúsculas `a`–`z`; no reconoce dígitos, mayúsculas ni puntuación.
- Errores típicos: sustituciones o eliminaciones de un solo carácter, con confusiones frecuentes entre `i`/`l`, `a`/`e`/`o` y `m`/`n`.
- Riesgo de alucinación: en un modelo OCR se manifiesta como transcripciones plausibles pero incorrectas sobre imágenes fuera de distribución; no hay métricas publicadas para ese escenario.
- Sesgos: no se documentan sesgos demográficos ni lingüísticos, pero el modelo está sesgado hacia el estilo visual concreto del conjunto de entrenamiento.
- Restricciones de uso: aunque la licencia es MIT, el autor indica que el modelo se publica para investigación y educación, y advierte de que resolver reCAPTCHA de forma automatizada puede violar los términos de servicio de un sitio o la legislación local. Antes de redistribuir los pesos debe comprobarse bajo qué términos se recopilaron las imágenes de entrenamiento.
- Caveat para producción: no se documentan métricas de latencia, throughput ni comportamiento con imágenes degradadas, por lo que cualquier despliegue real requiere una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swargaraj/recaptcha-v1-crnn
- Repositorio de código: https://github.com/swargaraj/recaptcha-v1-crnn
- Dataset de entrenamiento: https://huggingface.co/datasets/swargaraj/recaptcha-v1-captchas
- Captcha_v1 (barkinadiguzel): https://github.com/barkinadiguzel/CAPTCHA_V1
- Adaptive CAPTCHA (MDPI, Applied Sciences): https://www.mdpi.com/2076-3417/14/12/5016
