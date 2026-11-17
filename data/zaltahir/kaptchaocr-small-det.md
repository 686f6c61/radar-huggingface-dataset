# zaltahir/kaptchaocr-small-det

## Resumen

KaptchaOCR ft-small-det es un detector de glifos (glyph detection) especializado en CAPTCHAs de tipo click, desarrollado por el usuario zaltahir dentro del proyecto KaptchaOCR, una biblioteca y servidor de CAPTCHA escrito en Rust. El modelo no realiza deteccion de objetos generica: su unica tarea es localizar cajas de caracteres individuales en imagenes de CAPTCHA con disposicion dispersa (scatter layout), en ingles y chino. Se distribuye como un unico fichero ONNX de 9,5 MB y se ejecuta mediante onnxruntime.

Tecnicamente es un fine-tuning del detector small de PP-OCRv6 (PaddleOCR), basado en la arquitectura DB (Differentiable Binarization) para segmentacion de texto a nivel de caracter. Se entreno sobre 20.000 imagenes sinteticas de 320x160 pixeles con semilla 11, y se valido sobre conjuntos de 200 imagenes (`val` y `val2`). La entrada es una imagen RGB rellenada a formato cuadrado y la salida es un mapa de probabilidad que se postprocesa en cajas de caracteres.

Su relevancia es acotada pero clara: cubre un nicho muy especifico (resolucion de CAPTCHA de click) con un artefacto minimo, desplegable en CPU, y con licencia Apache-2.0 que permite uso comercial. No es un modelo de proposito general ni compite con detectores de texto de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DB (Differentiable Binarization) sobre base PP-OCRv6 small detection |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles y chino (en datos de entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`small_det.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DB (Differentiable Binarization), habitual en deteccion de texto, que predice un mapa de probabilidad por pixel y lo binariza de forma diferenciable para derivar regiones de texto. En este caso la base es el detector small de PP-OCRv6 de PaddleOCR, afinado para el dominio concreto de glifos de CAPTCHA. La entrada es una imagen RGB rellenada a un cuadrado; la salida es un mapa de probabilidad que, tras postprocesado (umbral de binarizacion 0,2, umbral de caja 0,4, `unclip_ratio` 1,4, hasta 3.000 candidatos, NMS con umbral 0,3 y umbral de score 0,1), se convierte en cajas de caracteres.

El entrenamiento se realizo sobre 20.000 imagenes sinteticas de 320x160 pixeles con disposicion dispersa, caracteres en ingles y chino, y semilla 11. La validacion se hizo con dos conjuntos de 200 imagenes (`val` y `val2`). No se documentan en la informacion disponible detalles sobre numero de tokens, composicion exacta del dataset, ni uso de RLHF/DPO (no aplicables a este tipo de modelo). Tampoco se describen innovaciones tecnicas adicionales mas alla del fine-tuning del detector base.

## Capacidades

- Deteccion de glifos a nivel de caracter en imagenes de CAPTCHA de click con disposicion dispersa.
- Localizacion de cajas de caracteres mediante mapa de probabilidad y postprocesado DB.
- Soporte de caracteres en ingles y chino.
- Entrada de imagen RGB rellenada a formato cuadrado.
- Ejecucion via onnxruntime, con integracion directa en el binario KaptchaOCR.
- No realiza deteccion de objetos genericos (coches, personas, etc.).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de vision general mas alla de la deteccion de glifos.

## Casos de uso

- Resolucion automatizada de CAPTCHA de click en pipelines de pruebas: el modelo localiza las cajas de cada caracter para que el binario KaptchaOCR pueda seleccionarlas; su tamano de 9,5 MB y su ejecucion en ONNX lo hacen adecuado para entornos de CI donde se simulan flujos de usuario.
- Integracion en el servidor KaptchaOCR: se invoca con `kaptchaocr --ocr --det --manifest model/models.json --det-model ft-small-det` para anadir deteccion de glifos al pipeline OCR del propio proyecto.
- Despliegue en CPU sin GPU: al ser un ONNX pequeno y no requerir aceleracion, encaja en servicios ligeros o contenedores de bajos recursos donde no hay GPU disponible.
- Extraccion de coordenadas de caracteres en imagenes sinteticas de CAPTCHA: util para generar datasets etiquetados o para validar generadores de CAPTCHA comparando las cajas detectadas con las esperadas.
- Modulo de preprocesado en sistemas de OCR especializados: la salida de cajas de caracteres puede alimentar un reconocedor posterior dentro de una cadena OCR propia.
- Evaluacion y benchmarking de detectores de glifos: sirve como referencia reproducible (semilla 20261103, 400 imagenes, 1.800 cajas) para comparar variantes del propio proyecto KaptchaOCR.

## Benchmarks y rendimiento

Benchmark sobre conjunto sintetico nuevo: 400 imagenes, 1.800 cajas de glifos, disposicion dispersa, ingles y chino, semilla 20261103. Verdad de referencia a nivel de glifo con emparejamiento greedy de poligonos.

| Metrica | Valor |
|---|---:|
| F1@0.5 | 95,8% |
| F1@0.75 | 50,5% |
| Precision@0.5 | 93,9% |
| Recall@0.5 | 97,7% |
| Mean IoU | 0,750 |
| Latencia media | 270 ms |

El autor advierte que este benchmark es un proxy sintetico y no incluye datos reales de CAPTCHA de click.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el modelo es un ONNX de 9,5 MB y puede ejecutarse en CPU.
- GPU recomendadas: no se documentan; al ser un modelo pequeno de deteccion, cualquier GPU moderna es sobredimensionada para la tarea.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con soporte ONNX; tambien en CPU.
- Opciones de despliegue: onnxruntime (libreria declarada) e integracion con el binario KaptchaOCR mediante `--det-path` o entrada de manifiesto.
- Latencia y throughput: latencia media de 270 ms por imagen segun el benchmark del autor; no se documenta throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaptchaOCR ft-small-det | no disponible (9,5 MB en disco) | no aplica | F1@0.5 95,8% en benchmark sintetico propio | Apache-2.0 | Hugging Face |
| PP-OCRv6 small detection (base) | no disponible | no aplica | no disponible en la informacion proporcionada | Apache-2.0 | PaddleOCR |
| Otros modelos de la coleccion KaptchaOCR | no disponible | no aplica | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face (coleccion zaltahir/kaptchaocr) |

No se dispone de datos publicados de benchmarks comparativos con alternativas fuera del proyecto en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en deteccion de glifos de CAPTCHA; no sirve para deteccion de objetos genericos ni para OCR de documentos.
- El benchmark se realizo sobre datos sinteticos; no se ha validado con CAPTCHAs reales, por lo que el rendimiento en produccion real puede diferir.
- F1@0.75 cae al 50,5%, lo que indica baja precision en el emparejamiento estricto de cajas; el umbral de IoU afecta notablemente al resultado.
- Solo se documentan caracteres en ingles y chino; no se garantiza soporte de otros alfabetos.
- No se documentan sesgos especificos, pero al entrenarse con datos sinteticos puede no generalizar a estilos visuales de CAPTCHA no representados en el dataset.
- Riesgo de alucinacion no aplicable (no es un modelo generativo), pero si riesgo de falsos positivos y negativos en la deteccion de cajas.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del detector base PP-OCRv6 (tambien Apache-2.0); conviene revisar la atribucion correspondiente.
- No se documentan cuantizaciones alternativas ni soporte de otros formatos mas alla de ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/zaltahir/kaptchaocr-small-det
- GitHub del proyecto: https://github.com/ozalt/kaptchaocr
- Coleccion de modelos KaptchaOCR: https://huggingface.co/collections/zaltahir/kaptchaocr
- Benchmarks: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- PaddleOCR (base PP-OCRv6): https://github.com/PaddlePaddle/PaddleOCR
