# zaltahir/kaptchaocr-tiny-rec

## Resumen

KaptchaOCR ft-tiny es un modelo de reconocimiento de texto (OCR) especializado en la lectura de CAPTCHA, desarrollado por el autor `zaltahir` dentro del proyecto KaptchaOCR, una biblioteca y servidor de CAPTCHA escrito en Rust. El modelo se distribuye como un único fichero ONNX de 4,3 MB (`tiny_rec.onnx`) acompanado de su juego de caracteres (`tiny_rec.json`), y está pensado para ejecutarse con el binario KaptchaOCR, que se encarga del preprocesado, la decodificación CTC y la capa HTTP.

Técnicamente es un reconocedor basado en PP-OCRv6 tiny (PaddleOCR, licencia Apache-2.0) afinado sobre un corpus de 169.311 imágenes de CAPTCHA con 194.355 etiquetas (con sobremuestreo), case-sensitive y con 73 clases. La entrada es RGB con altura fija de 48 píxeles y anchura dinámica, y el vocabulario de salida cubre 6.906 caracteres. El modelo es solo de inferencia: no incluye código de preprocesado ni de decodificación.

Su relevancia es acotada pero concreta: ofrece un reconocedor de CAPTCHA muy ligero (4,3 MB) y rápido (9,8 ms por imagen en un Intel i5-1145G7), con licencia permisiva y formato ONNX portable. No es un modelo de lenguaje general ni compite en tareas de razonamiento; su utilidad está en pipelines de automatización de pruebas, scraping autorizado o investigación sobre robustez de CAPTCHA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor OCR basado en PP-OCRv6 tiny (CNN + decodificacion CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (vocabulario de 6.906 caracteres definido en `tiny_rec.json`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`tiny_rec.onnx`) + charset JSON (`tiny_rec.json`) |

## Arquitectura y entrenamiento

El modelo parte de PP-OCRv6 tiny, un reconocedor de texto de la familia PaddleOCR que combina un extractor de caracteristicas convolucional con una cabeza de decodificacion CTC. La entrada es una imagen RGB normalizada a 48 píxeles de alto y anchura variable, lo que permite procesar recortes de CAPTCHA de proporciones distintas sin redimensionado fijo. La salida es una secuencia de caracteres decodificada mediante CTC, con un vocabulario de 6.906 entradas definido en el fichero `tiny_rec.json`.

El ajuste fino se realizo sobre 169.311 imagenes de CAPTCHA con 194.355 etiquetas (el autor indica sobremuestreo de etiquetas), con distincion entre mayusculas y minusculas y 73 clases efectivas. Se reservaron 5.000 imagenes para validacion. No se documentan en la informacion disponible el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no procede en un modelo OCR). Tampoco se detallan hiperparametros de ajuste fino ni la estrategia de aumento de datos.

## Capacidades

- Reconocimiento de texto en imagenes de CAPTCHA mediante decodificacion CTC.
- Salida case-sensitive (distingue mayusculas y minusculas), con 73 clases efectivas.
- Vocabulario amplio de 6.906 caracteres segun el charset `tiny_rec.json`.
- Entrada RGB con altura fija de 48 px y anchura dinamica, adecuada para recortes de proporciones variables.
- Inferencia exclusiva: no incluye preprocesado, decodificacion ni servidor; eso lo aporta el binario KaptchaOCR.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No dispone de capacidades de vision general, audio ni generacion de texto libre.
- Capacidades multilingues: no documentadas; dependen del charset incluido.

## Casos de uso

- Automatizacion de pruebas de extremo a extremo: el modelo permite resolver CAPTCHA en entornos de staging o QA propios, integrándose en el binario KaptchaOCR con `kaptchaocr --ocr --rec-model ft-tiny` y evitando bloqueos en suites de tests automatizados.
- Investigacion sobre robustez de CAPTCHA: con una precision global del 67,0% en exact match y 88,8% por caracter, sirve como linea base reproducible para medir la dificultad de distintos generadores de CAPTCHA (archive1, archive2, archive3, hammer888, kaggle, lcsd).
- Scraping autorizado y monitorizacion: en pipelines donde el propietario del sitio permite la automatizacion, el modelo resuelve formularios protegidos por CAPTCHA con una latencia de 9,8 ms por imagen, suficiente para volúmenes moderados en CPU.
- Despliegue en entornos con recursos limitados: al ocupar 4,3 MB y ejecutarse en ONNX Runtime, cabe en dispositivos edge, contenedores pequeños o funciones serverless sin GPU.
- Procesado por lotes de imagenes CAPTCHA historicas: util para construir datasets etiquetados o auditar colecciones de imagenes con un reconocedor ligero y de licencia permisiva.
- Integracion como componente en un servidor Rust: el proyecto KaptchaOCR expone una capa HTTP, de modo que el modelo puede actuar como backend de reconocimiento dentro de un servicio propio de gestion de CAPTCHA.
- Comparativa de motores OCR: sirve como referencia frente a ddddocr y PP-OCRv6 base en las tablas de benchmark publicadas por el autor.

## Benchmarks y rendimiento

Datos publicados por el autor sobre conjuntos de CAPTCHA reservados (4.399 imagenes en total). Exact match se refiere a la cadena completa, case-sensitive. La latencia es la media en ms/imagen sobre un Intel i5-1145G7, proceso unico.

| Conjunto | Exact match |
|---|---:|
| archive1 | 52% |
| archive2 | 88% |
| archive3 | 95% |
| hammer888 | 42% |
| kaggle | 58% |
| lcsd | 94% |
| **Global** | **67,0%** |

- Precision por caracter: 88,8%.
- Latencia media: 9,8 ms/imagen.
- El autor advierte que las imagenes de test son disjuntas respecto a entrenamiento pero provienen de las mismas fuentes publicas, por lo que no constituye un benchmark fuera de distribucion.
- Las tablas completas con modelos de comparacion (ddddocr y PP-OCRv6 base) estan en la pagina de benchmarks del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 4,3 MB y esta pensado para ejecucion en CPU mediante ONNX Runtime.
- GPU recomendadas: no se documentan; por tamano, cualquier GPU con soporte ONNX Runtime seria suficiente, pero el autor no publica requisitos ni pruebas en GPU.
- Compatibilidad con GPU de consumo: previsiblemente si por tamano, aunque no hay datos oficiales de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime y el binario KaptchaOCR (`kaptchaocr --ocr --manifest model/models.json --rec-model ft-tiny` o `kaptchaocr --ocr --ocr-path tiny_rec.onnx`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia: 9,8 ms/imagen de media en Intel i5-1145G7, proceso unico. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Tarea | Licencia | Exact match global |
|---|---|---|---|---|---|
| KaptchaOCR ft-tiny | PP-OCRv6 tiny | 4,3 MB | Reconocimiento CAPTCHA (CTC) | Apache-2.0 | 67,0% |
| ddddocr | no disponible | no disponible | Reconocimiento CAPTCHA | no disponible | no disponible en esta ficha (referenciado en benchmarks del autor) |
| PP-OCRv6 base | PaddleOCR | no disponible | OCR general | Apache-2.0 | no disponible en esta ficha (referenciado en benchmarks del autor) |

Los datos comparativos completos de ddddocr y PP-OCRv6 base estan en la pagina de benchmarks del repositorio del autor; en la informacion disponible no se incluyen sus cifras concretas.

## Limitaciones y advertencias

- El exact match global es del 67,0%, con caidas notables en hammer888 (42%) y archive1 (52%); no es adecuado para escenarios que exijan alta precision sin verificacion posterior.
- El benchmark no es fuera de distribucion: las imagenes de test comparten fuentes publicas con el entrenamiento, por lo que el rendimiento en CAPTCHA de generadores no vistos puede ser inferior.
- Modelo de inferencia exclusiva: requiere el binario KaptchaOCR o un pipeline propio para preprocesado, decodificacion CTC y gestion del charset; no funciona de forma autonoma.
- El charset debe acompanar al modelo con el mismo nombre base (`tiny_rec.onnx` → `tiny_rec.json`); un desajuste invalida las predicciones.
- No se documentan sesgos ni evaluaciones multilingues; el comportamiento fuera del vocabulario de 6.906 caracteres es incierto.
- Riesgo de alucinacion: como todo OCR, puede producir cadenas plausibles pero incorrectas, especialmente en imagenes ruidosas o con distorsiones severas.
- Uso comercial permitido por Apache-2.0, pero el uso de un reconocedor de CAPTCHA puede vulnerar terminos de servicio de terceros o normativa aplicable; la licencia del modelo no cubre la legalidad del caso de uso.
- El repositorio no incluye pesos de ddddocr; cualquier comparacion debe hacerse con el modelo original de ese proyecto.
- No hay informacion sobre cuantizaciones, rendimiento en GPU ni soporte oficial mas alla de ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaltahir/kaptchaocr-tiny-rec
- Repositorio GitHub del proyecto: https://github.com/ozalt/kaptchaocr
- Benchmarks: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- Coleccion de todos los modelos KaptchaOCR: https://huggingface.co/collections/zaltahir/kaptchaocr
- PaddleOCR (modelo base PP-OCRv6): https://github.com/PaddlePaddle/PaddleOCR
