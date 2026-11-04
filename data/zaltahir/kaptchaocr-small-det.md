# zaltahir/kaptchaocr-small-det

## Resumen

KaptchaOCR ft-small-det es un detector de glifos (glyph-level text detection) basado en la arquitectura DB (Differentiable Binarization) de PP-OCRv6 small, afinado por el autor zaltahir para su uso dentro de KaptchaOCR, una biblioteca y servidor de CAPTCHA escritos en Rust. El modelo no realiza deteccion de objetos genericos: su unica tarea es localizar las cajas de caracteres individuales que aparecen en CAPTCHAs de tipo click, es decir, imagenes donde el usuario debe pulsar sobre cada glifo de una secuencia.

El repositorio contiene exclusivamente el fichero `small_det.onnx` (9,5 MB), exportado para ejecucion con ONNX Runtime. Se distribuye bajo licencia Apache-2.0 y deriva del detector small de PP-OCRv6 de PaddleOCR, tambien Apache-2.0, sin pesos de ddddocr. Forma parte de una coleccion de cinco modelos afinados del proyecto KaptchaOCR.

Su relevancia es acotada pero concreta: cubre el paso de deteccion de un pipeline OCR especializado en CAPTCHAs, un dominio donde los modelos OCR genericos rinden peor por la dispersion de glifos, el ruido de fondo y las transformaciones geometricas. El modelo esta entrenado con 20.000 imagenes sinteticas de 320x160 en disposicion scatter, con caracteres en ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DB (Differentiable Binarization) sobre backbone PP-OCRv6 small, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero ONNX sin especificar precision) |
| Idiomas soportados | Ingles y chino (conjunto de entrenamiento sintetico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`small_det.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DB (Differentiable Binarization) propia de la familia PP-OCR para deteccion de texto: la red produce un mapa de probabilidad por pixel que, tras umbralizacion y expansion de poligonos (unclip), se convierte en cajas de caracteres. La entrada es una imagen RGB con padding a formato cuadrado y la salida es el citado mapa de probabilidad, del que se derivan las cajas a nivel de glifo. El backbone corresponde a la variante small de PP-OCRv6.

El afinado se realizo sobre 20.000 imagenes sinteticas de 320x160 con disposicion scatter (glifos dispersos, no alineados en lineas de texto), caracteres en ingles y chino y semilla 11. La validacion se hizo con dos conjuntos de 200 imagenes (`val` y `val2`). No se especifica en la informacion disponible el numero de tokens ni si hubo etapas de RLHF o DPO, algo que no aplica a un detector de este tipo. Tampoco se detalla la composicion exacta del dataset sintetico mas alla de idioma, resolucion y layout.

## Capacidades

- Deteccion de glifos a nivel de caracter en imagenes de CAPTCHA de tipo click, devolviendo cajas delimitadoras por caracter.
- Salida como mapa de probabilidad compatible con el pipeline DB (threshold, box_thresh, unclip_ratio, NMS).
- Soporte de caracteres en ingles y chino en el conjunto de entrenamiento.
- Ejecucion via ONNX Runtime, con integracion directa en el binario Rust de KaptchaOCR mediante manifiesto JSON.
- No realiza reconocimiento de texto (OCR completo): solo localiza cajas; el reconocimiento corresponde a otro modelo de la coleccion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues mas alla del ingles y chino del entrenamiento.
- No incluye modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Deteccion de glifos en CAPTCHAs de click: el modelo localiza cada caracter de la imagen para que el pipeline posterior asocie las pulsaciones del usuario a glifos concretos. Es su proposito principal y para el que fue afinado.
- Integracion en el servidor KaptchaOCR en Rust: se invoca mediante `kaptchaocr --det --det-path small_det.onnx` o a traves de la entrada de manifiesto `ft-small-det`, lo que permite desplegarlo como parte del servicio de verificacion.
- Automatizacion de pruebas de accesibilidad de CAPTCHAs: permite auditar si un esquema de CAPTCHA de click expone sus glifos de forma detectable por un modelo ligero, evaluando la robustez del diseno.
- Preprocesado en pipelines OCR especializados: sirve como etapa de deteccion previa a un reconocedor cuando las imagenes contienen glifos dispersos en lugar de lineas de texto.
- Investigacion sobre robustez de CAPTCHAs: al ser un modelo pequeno (9,5 MB) y Apache-2.0, facilita experimentos reproducibles sobre deteccion de glifos en entornos controlados.
- Despliegue en entornos con recursos limitados: su tamano reducido y su formato ONNX permiten ejecutarlo en CPU o en dispositivos de borde sin GPU dedicada.
- Generacion de datasets sinteticos anotados: combinado con el generador del proyecto, puede usarse para validar la calidad de las anotaciones de cajas en imagenes sinteticas de layout scatter.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a un conjunto sintetico nuevo de 400 imagenes y 1.800 cajas de glifos, layout scatter, ingles y chino, semilla `20261103`, con ground truth a nivel de glifo y emparejamiento poligonal greedy.

| Metrica | Valor |
|---|---:|
| F1@0.5 | 95,8 % |
| F1@0.75 | 50,5 % |
| Precision@0.5 | 93,9 % |
| Recall@0.5 | 97,7 % |
| Mean IoU | 0,750 |
| Latencia media | 270 ms |

No se han publicado comparaciones con otros modelos en la informacion disponible. El propio autor advierte que el benchmark es un proxy sintetico y que no se incluyen datos reales de CAPTCHA de click.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con un fichero ONNX de 9,5 MB la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1060 en adelante, RTX 3060, RTX 4090) es suficiente. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, con margen amplio.
- Opciones de despliegue: ONNX Runtime (libreria declarada), integracion nativa en el binario Rust de KaptchaOCR. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: latencia media de 270 ms por imagen segun el benchmark del autor; no se publica throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo deriva del detector small de PP-OCRv6 de PaddleOCR, pero no se han publicado metricas comparativas entre ambos en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaptchaOCR ft-small-det | no disponible | no aplica | F1@0.5 95,8 % (sintetico) | Apache-2.0 | HuggingFace (ONNX) |
| PP-OCRv6 small det (base) | no disponible | no aplica | no disponible | Apache-2.0 | PaddleOCR |
| Alternativas de deteccion de glifos | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo detecta cajas de glifos; no reconoce el texto ni realiza OCR completo.
- No es un detector de objetos genericos: no encuentra coches, personas ni otros objetos.
- El entrenamiento y el benchmark se basan en datos sinteticos; no se incluyen datos reales de CAPTCHA de click, por lo que el rendimiento en produccion puede diferir del reportado.
- El F1@0.75 cae al 50,5 %, lo que indica que la localizacion precisa de los poligonos es menos fiable que la deteccion a umbral 0,5.
- Solo se documentan caracteres en ingles y chino; el comportamiento con otros alfabetos no esta verificado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos o cajas mal ajustadas en imagenes con ruido, solapamientos o layouts distintos al scatter.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del proyecto base PP-OCRv6 y de PaddleOCR.
- No se especifica la precision del fichero ONNX ni si existe una version cuantizada; conviene validar el modelo en el hardware y runtime objetivo antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zaltahir/kaptchaocr-small-det
- Repositorio GitHub del proyecto: https://github.com/ozalt/kaptchaocr
- Coleccion de modelos KaptchaOCR: https://huggingface.co/collections/zaltahir/kaptchaocr
- Benchmarks del proyecto: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- PaddleOCR (proyecto base): https://github.com/PaddlePaddle/PaddleOCR
