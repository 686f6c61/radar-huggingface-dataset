# zaltahir/kaptchaocr-medium-det

## Resumen

KaptchaOCR ft-medium-det es un detector de glifos (glyph-level text detection) basado en la arquitectura DB (Differentiable Binarization) de PP-OCRv6 en su variante medium. Lo desarrolla el autor zaltahir como parte del proyecto KaptchaOCR, una biblioteca y servidor en Rust orientado especificamente a la resolucion de CAPTCHA de clic. El modelo no realiza deteccion de objetos generica: su unica funcion es localizar las cajas de caracteres individuales que el usuario debe seleccionar en un CAPTCHA, devolviendo un mapa de probabilidad que se postprocesa a poligonos y cajas.

El repositorio contiene exclusivamente el fichero `medium_det.onnx` (59 MB), exportado para ejecucion con ONNX Runtime. Se distribuye como uno de los cinco modelos afinados del ecosistema KaptchaOCR y esta pensado para integrarse en el binario `kaptchaocr` mediante un manifiesto JSON, o bien invocarse directamente pasando la ruta al fichero ONNX.

Su relevancia es acotada pero concreta: cubre un nicho (deteccion de glifos en CAPTCHA de clic) con un modelo pequeno, licencia permisiva Apache-2.0 y un benchmark propio publicado. No es un modelo de lenguaje ni un detector de objetos de proposito general, por lo que su evaluacion debe hacerse dentro de ese dominio especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DB (Differentiable Binarization) sobre PP-OCRv6 medium detection |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles y chino (en los datos de entrenamiento sinteticos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`medium_det.onnx`) |
| Tamano del fichero | 59 MB |
| Entrada | imagen RGB, con padding a cuadrado |
| Salida | mapa de probabilidad convertido a cajas de caracteres |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DB de deteccion de texto, la misma familia que utiliza PP-OCRv6 en su modulo de deteccion. La red produce un mapa de probabilidad por pixel que, tras umbralizacion y expansion de poligonos (parametros `thresh`, `box_thresh`, `unclip_ratio`), se convierte en cajas delimitadoras de cada glifo. El modelo parte del detector PP-OCRv6 medium (PaddleOCR, Apache-2.0) y se ha afinado para el dominio de CAPTCHA de clic.

El entrenamiento se realizo sobre 20.000 imagenes sinteticas de 320x160 con disposicion dispersa (scatter layout), combinando caracteres en ingles y chino, con semilla 11. La validacion se hizo sobre dos conjuntos de 200 imagenes (`val` y `val2`). No se documenta el numero de tokens ni si hubo etapas de RLHF o DPO, algo que no aplica a un detector de vision. La innovacion principal es el ajuste fino del detector generico de PP-OCRv6 al dominio de glifos de CAPTCHA, con umbrales calibrados en el manifiesto (`thresh: 0.2`, `box_thresh: 0.4`, `unclip_ratio: 1.4`, `max_candidates: 3000`, `nms_thr: 0.3`, `score_thr: 0.1`).

## Capacidades

- Deteccion de glifos a nivel de caracter en imagenes de CAPTCHA de clic.
- Generacion de mapa de probabilidad y conversion a cajas/poligonos de caracteres.
- Soporte de caracteres en ingles y chino en los datos de entrenamiento.
- Entrada de imagen RGB con padding a cuadrado.
- Ejecucion mediante ONNX Runtime, con integracion en el binario Rust `kaptchaocr`.
- Configuracion de umbrales y postprocesado mediante entrada de manifiesto JSON.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision general, audio ni capacidades multimodales mas alla de la deteccion de glifos.

## Casos de uso

- Resolucion de CAPTCHA de clic en pipelines de automatizacion: el modelo localiza las cajas de cada caracter para que el sistema seleccione las coordenadas correctas, aprovechando su salida de mapa de probabilidad y la configuracion de umbrales del manifiesto.
- Integracion en el servidor KaptchaOCR en Rust: se invoca con `kaptchaocr --ocr --det --manifest model/models.json --det-model ft-medium-det` para encadenar deteccion y OCR dentro del mismo binario.
- Procesamiento de imagenes sinteticas de 320x160 con layout disperso: adecuado para entornos de prueba y generacion de datos donde el formato coincide con el de entrenamiento.
- Deteccion de glifos en escenarios con mezcla de caracteres ingleses y chinos: el entrenamiento bilingue permite cubrir CAPTCHA que combinan ambos alfabetos.
- Despliegue ligero en CPU: al ser un ONNX de 59 MB ejecutable con ONNX Runtime, puede integrarse en servicios sin GPU dedicada, aunque la latencia medida es alta (1.315 ms de media).
- Modulo de preprocesado en sistemas de OCR de CAPTCHA: la salida de cajas puede alimentar un reconocedor posterior para tareas de lectura de caracteres.
- Evaluacion y ajuste de umbrales en investigacion sobre deteccion de texto: los parametros `thresh`, `box_thresh` y `unclip_ratio` permiten experimentar con el postprocesado sin reentrenar.

## Benchmarks y rendimiento

Benchmark sobre conjunto sintetico nuevo: 400 imagenes, 1.800 cajas de glifos, layout disperso, ingles y chino, semilla 20261103, ground truth a nivel de glifo con emparejamiento greedy de poligonos.

| Metrica | Valor |
|---|---:|
| F1@0.5 | 95,7% |
| F1@0.75 | 63,1% |
| Precision@0.5 | 93,5% |
| Recall@0.5 | 97,9% |
| Mean IoU | 0,769 |
| Latencia media | 1.315 ms |

El propio autor advierte que el benchmark de deteccion es un proxy sintetico y que no se incluyen datos reales de CAPTCHA de clic.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es un ONNX de 59 MB y puede ejecutarse en CPU.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU especificos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del fichero, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (libreria declarada), binario Rust `kaptchaocr` con manifiesto JSON o ruta directa (`--det-path medium_det.onnx`).
- Latencia: 1.315 ms de media en el benchmark publicado; no se documenta throughput.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Tarea | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| KaptchaOCR ft-medium-det | PP-OCRv6 medium detection | 59 MB | Deteccion de glifos en CAPTCHA | Apache-2.0 | F1@0.5 95,7% (sintetico) |
| PP-OCRv6 medium detection | PaddleOCR | no disponible | Deteccion de texto general | Apache-2.0 | no disponible en esta ficha |
| Otros modelos KaptchaOCR | PP-OCRv6 (variantes) | no disponible | Deteccion/OCR de CAPTCHA | Apache-2.0 | no disponible en esta ficha |

No se dispone de datos comparativos adicionales con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un detector de objetos general: solo localiza glifos de CAPTCHA; no detecta coches, personas u otros objetos.
- El benchmark se basa en datos sinteticos; no se incluyen datos reales de CAPTCHA de clic, por lo que el rendimiento en produccion puede diferir.
- La validacion se realizo sobre conjuntos de 200 imagenes, un tamano reducido.
- El entrenamiento cubre solo ingles y chino; otros alfabetos no estan documentados.
- La latencia media de 1.315 ms puede ser limitante en escenarios de alta concurrencia.
- Riesgo de alucinacion no aplica (no genera texto), pero si de falsos positivos/negativos en la deteccion de cajas, con F1@0.75 del 63,1%.
- Sesgos conocidos: no documentados; el entrenamiento sintetico con layout disperso puede no generalizar a otros layouts de CAPTCHA.
- Licencia Apache-2.0 permisiva para uso comercial, con obligacion de mantener avisos de licencia y atribucion.
- El repositorio contiene unicamente el detector; para un pipeline completo de OCR se requiere combinarlo con otros modelos del ecosistema KaptchaOCR.

## Enlaces

- Hugging Face: https://huggingface.co/zaltahir/kaptchaocr-medium-det
- GitHub del proyecto: https://github.com/ozalt/kaptchaocr
- Coleccion de modelos KaptchaOCR: https://huggingface.co/collections/zaltahir/kaptchaocr
- Benchmarks: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- PaddleOCR (base PP-OCRv6): https://github.com/PaddlePaddle/PaddleOCR
