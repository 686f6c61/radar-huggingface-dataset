# zaltahir/kaptchaocr-medium-det

## Resumen

KaptchaOCR ft-medium-det es un detector de glifos (caracteres individuales) para CAPTCHA de tipo clic, distribuido como un unico fichero ONNX de 59 MB. Forma parte del conjunto de cinco modelos afinados del proyecto KaptchaOCR, una biblioteca y servidor escrito en Rust para resolver CAPTCHA. El modelo no realiza deteccion de objetos genericos: su unica tarea es localizar las cajas delimitadoras de cada caracter o glifo en una imagen de CAPTCHA, que posteriormente un modulo de OCR puede reconocer.

Tecnicamente deriva del detector medio de PP-OCRv6 (PaddleOCR), afinado sobre 20.000 imagenes sinteticas de 320x160 pixeles con disposicion de tipo scatter y alfabeto ingles y chino. La salida es un mapa de probabilidad de tipo DB (Differentiable Binarization) que se convierte en cajas de caracteres mediante umbralizacion y expansion de poligonos.

Su relevancia es acotada pero clara: cubre un nicho concreto (automatizacion de pipelines de pruebas y evaluacion de robustez de CAPTCHA) con licencia Apache-2.0, formato ONNX portable y un benchmark reproducible publicado por el autor. No es un modelo de proposito general ni compite con detectores como YOLO o DETR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DB (Differentiable Binarization) basado en PP-OCRv6 medium detection |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye un unico ONNX de 59 MB) |
| Idiomas soportados | ingles y chino (alfabeto de entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`medium_det.onnx`) |
| Tamano del repositorio | 0,1 GB |
| Entrada | imagen RGB, redimensionada con padding a cuadrado |
| Salida | mapa de probabilidad, convertido a cajas de caracteres |
| Runtime | onnxruntime |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DB (Differentiable Binarization) propia de la familia PP-OCR: una red convolucional que predice un mapa de probabilidad por pixel, el cual se binariza de forma diferenciable durante el entrenamiento y se postprocesa en inferencia para extraer poligonos de texto. El checkpoint base es el detector medio de PP-OCRv6, sobre el que se aplica un ajuste fino especifico para glifos individuales de CAPTCHA en lugar de lineas de texto.

Los datos de entrenamiento son 20.000 imagenes sinteticas de 320x160 pixeles, con disposicion scatter (glifos dispersos, tipica de CAPTCHA de clic), alfabeto ingles y chino, y semilla 11. La validacion se realizo sobre conjuntos `val` y `val2` de 200 imagenes cada uno. No se documenta en la informacion disponible el numero de pasos, la tasa de aprendizaje, el uso de RLHF/DPO (no aplica a un detector) ni tecnicas adicionales como decodificacion especulativa.

## Capacidades

- Deteccion de glifos a nivel de caracter en imagenes de CAPTCHA de tipo clic.
- Salida de cajas delimitadoras con umbral de confianza configurable (`thresh`, `box_thresh`).
- Postprocesado con expansion de poligonos (`unclip_ratio`), supresion de no maximos (`nms_thr`) y limite de candidatos (`max_candidates`).
- Soporte de alfabeto ingles y chino segun los datos de entrenamiento.
- Inferencia via onnxruntime, integrable en el binario Rust de KaptchaOCR mediante manifiesto o ruta directa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o video.
- No realiza deteccion de objetos genericos (vehiculos, personas, etc.).

## Casos de uso

- Automatizacion de pruebas de robustez de CAPTCHA: el detector localiza los glifos de un CAPTCHA de clic generado por el propio sistema, permitiendo medir la dificultad real de resolucion en pipelines de CI.
- Construccion de un solver de CAPTCHA de clic en dos etapas: este modelo actua como primera fase (deteccion de glifos) y un modelo OCR posterior reconoce cada recorte, integrándose mediante el manifiesto de KaptchaOCR.
- Evaluacion academica de seguridad de esquemas CAPTCHA: permite cuantificar la tasa de deteccion de glifos frente a variaciones de layout, ruido y solapamiento.
- Generacion de datasets etiquetados: las cajas predichas sobre imagenes sinteticas pueden usarse como pseudoetiquetas para entrenar o validar otros detectores.
- Servicio de resolucion de CAPTCHA en Rust: el binario `kaptchaocr --ocr --det --manifest model/models.json --det-model ft-medium-det` ofrece un endpoint con inferencia ONNX local.
- Prototipado rapido en entornos sin GPU: al ser un ONNX de 59 MB, puede ejecutarse en CPU con onnxruntime en maquinas modestas, adecuado para pruebas y demos.

## Benchmarks y rendimiento

Benchmark publicado por el autor sobre un conjunto sintetico nuevo de 400 imagenes y 1.800 cajas de glifos (layout scatter, ingles y chino, semilla `20261103`), con verdad de referencia a nivel de glifo y emparejamiento greedy de poligonos.

| Metrica | Valor |
|---|---:|
| F1@0.5 | 95,7% |
| F1@0.75 | 63,1% |
| Precision@0.5 | 93,5% |
| Recall@0.5 | 97,9% |
| IoU medio | 0,769 |
| Latencia media | 1.315 ms |

No se han publicado comparaciones con otros detectores en la informacion disponible. El propio autor advierte que el benchmark es un proxy sintetico y no incluye datos reales de CAPTCHA de clic.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con un ONNX de 59 MB y entrada cuadrada pequena, la huella es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime (CUDA o TensorRT); no se especifican modelos concretos en la documentacion.
- Compatibilidad con GPU de consumo: si, el tamano reducido permite ejecucion en RTX 3060, RTX 4060 o superiores, asi como en CPU.
- Opciones de despliegue: onnxruntime (libreria declarada), binario Rust de KaptchaOCR; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia: 1.315 ms de media por imagen en el benchmark del autor (entorno no especificado).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaptchaOCR ft-medium-det | Deteccion de glifos CAPTCHA (DB) | 59 MB (ONNX) | no aplica | Apache-2.0 | Hugging Face, via KaptchaOCR |
| PP-OCRv6 medium detection (base) | Deteccion de lineas de texto | no disponible | no aplica | Apache-2.0 | PaddleOCR |
| ddddocr | OCR/deteccion para CAPTCHA | no disponible | no aplica | no disponible en la informacion | Proyecto open source independiente |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada. La comparativa se limita a tarea, formato y licencia.

## Limitaciones y advertencias

- El benchmark se basa en datos sinteticos; el rendimiento en CAPTCHA reales puede degradarse de forma significativa.
- Entrenado solo con alfabeto ingles y chino; otros alfabetos o estilos tipograficos no estan cubiertos.
- No es un detector de objetos genericos: no detecta vehiculos, personas ni clases COCO.
- F1@0.75 cae al 63,1%, lo que indica cajas poco precisas en solapamientos estrictos; puede afectar al recorte para OCR posterior.
- Latencia media de 1.315 ms por imagen, elevada para aplicaciones de alto throughput si no se optimiza el runtime.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre exactitud ni idoneidad para produccion.
- No se documentan sesgos especificos, riesgo de alucinacion (no aplica a un detector) ni limitaciones de contexto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/zaltahir/kaptchaocr-medium-det
- GitHub del proyecto: https://github.com/ozalt/kaptchaocr
- Coleccion de modelos KaptchaOCR: https://huggingface.co/collections/zaltahir/kaptchaocr
- Benchmarks: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- PaddleOCR (base PP-OCRv6): https://github.com/PaddlePaddle/PaddleOCR
