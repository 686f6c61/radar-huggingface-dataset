# zaltahir/kaptchaocr-medium-rec

## Resumen

KaptchaOCR ft-medium es un modelo de reconocimiento de texto (OCR) especializado en la lectura de CAPTCHAs, publicado por el autor zaltahir bajo licencia Apache-2.0. Se trata de uno de los cinco modelos afinados que componen la familia KaptchaOCR, un proyecto que incluye tanto una biblioteca como un servidor escrito en Rust. El repositorio de Hugging Face contiene exclusivamente el reconocedor `medium_rec.onnx` y su fichero de juego de caracteres `medium_rec.json`, con un tamano total de 0,1 GB.

El modelo parte de PP-OCRv6 medium de PaddleOCR y se ha afinado para la tarea de reconocimiento de texto mediante CTC. Su perfil declarado es `accurate` y trabaja con imagenes RGB de altura fija 48 píxeles y anchura dinámica, lo que lo hace adecuado para CAPTCHAs de longitud variable. El juego de caracteres cubre 18.710 caracteres y el entrenamiento se realizo sobre 169.311 imagenes de CAPTCHA con 194.355 etiquetas (con sobremuestreo) y 73 clases sensibles a mayúsculas y minúsculas.

La relevancia de este modelo radica en su caracter practico: ofrece un reconocedor ONNX ligero (73 MB) que puede desplegarse con onnxruntime sin dependencias de frameworks de deep learning pesados, y que alcanza un 90,7% de exact match y un 96,0% de precision por caracter en el conjunto de validacion publicado. Es una pieza de infraestructura para pipelines de automatizacion de pruebas o para investigacion sobre robustez de CAPTCHAs, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para reconocimiento de texto con decodificacion CTC, basada en PP-OCRv6 medium |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen con anchura dinamica; altura fija 48) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (juego de caracteres de 18.710 simbolos, sin desglose por idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`medium_rec.onnx`) + juego de caracteres JSON (`medium_rec.json`) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de texto basado en la arquitectura PP-OCRv6 medium de PaddleOCR, adaptada a la tarea de lectura de CAPTCHAs. La salida se decodifica mediante CTC (Connectionist Temporal Classification), lo que permite alinear secuencias de caracteres de longitud variable con la imagen de entrada sin necesidad de segmentacion previa. La entrada es una imagen RGB con altura normalizada a 48 píxeles y anchura dinamica, y el modelo es exclusivamente de inferencia: el preprocesado, la decodificacion CTC y la capa HTTP los gestiona la biblioteca KaptchaOCR, no el propio ONNX.

El afinado se realizo sobre 169.311 imagenes de CAPTCHA con 194.355 etiquetas (aplicando sobremuestreo) y 73 clases sensibles a mayusculas y minusculas, con un conjunto de validacion de 5.000 imagenes. No se documentan en la informacion disponible el numero de tokens ni la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de reconocimiento visual). La innovacion tecnica destacable es la integracion de un reconocedor PP-OCRv6 en un runtime ONNX ligero y su empaquetado junto a un juego de caracteres de 18.710 simbolos para cubrir la variabilidad tipografica de los CAPTCHAs.

## Capacidades

- Reconocimiento de texto en imagenes de CAPTCHA mediante CTC, con salida de cadena completa y sensibilidad a mayusculas y minusculas.
- Procesamiento de imagenes RGB con altura fija de 48 píxeles y anchura dinamica, adecuado para CAPTCHAs de longitud variable.
- Cobertura de un juego de caracteres de 18.710 simbolos, lo que permite reconocer alfabetos, digitos y simbolos tipograficos diversos.
- Inferencia via onnxruntime, sin dependencia de frameworks de entrenamiento.
- Integracion con la biblioteca y el servidor KaptchaOCR en Rust para preprocesado, decodificacion CTC y exposicion HTTP.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla del reconocimiento de texto en imagen.
- Capacidades multilingues: no documentadas; el charset de 18.710 caracteres no se desglosa por idioma en la informacion disponible.

## Casos de uso

- Automatizacion de pruebas de extremo a extremo: el modelo puede leer CAPTCHAs generados por los propios sistemas bajo prueba para que los tests de integracion continuen sin intervencion manual, gracias a su exact match del 90,7% en el conjunto de validacion publicado.
- Investigacion sobre robustez de CAPTCHAs: permite medir la resistencia de generadores de CAPTCHA frente a un reconocedor afinado, comparando tasas de exact match por conjunto (por ejemplo, 74% en `dune` frente a 100% en `fjord`).
- Servicio OCR ligero en produccion: al distribuirse como ONNX de 73 MB, puede desplegarse con onnxruntime en contenedores pequenos y con latencia media de 69 ms por imagen en una CPU Intel i5-1145G7.
- Pipeline de digitalizacion de formularios con tipografia controlada: su juego de 18.710 caracteres y su sensibilidad a mayusculas permiten extraer cadenas alfanumericas de imagenes escaneadas con calidad homogenea.
- Moderacion y verificacion de contenido: lectura automatizada de cadenas de texto embebidas en imagenes para clasificacion o indexacion posterior.
- Integracion en herramientas de accesibilidad: transcripcion de texto presentado como imagen (por ejemplo, CAPTCHAs) a texto plano para usuarios con discapacidad visual, siempre que se respeten las condiciones de uso del sistema de origen.
- Benchmarking de reconocedores OCR: sirve como base afinada de PP-OCRv6 medium para comparar frente a otros reconocedores en tareas de texto corto y ruidoso.

## Benchmarks y rendimiento

Conjuntos de CAPTCHA retenidos, 4.399 imagenes en total. Exact match es la cadena completa, sensible a mayusculas y minusculas. La latencia es la media en ms/imagen sobre un Intel i5-1145G7, un solo proceso.

| Conjunto | Exact match |
|---|---:|
| atlas | 82% |
| birch | 98% |
| cobalt | 99% |
| dune | 74% |
| ember | 97% |
| fjord | 100% |
| **Global** | **90,7%** |

Precision por caracter: 96,0%. Latencia media: 69 ms. El autor advierte que las imagenes de test son disjuntas en imagen respecto al entrenamiento pero provienen de las mismas fuentes publicas, por lo que no constituye un benchmark fuera de distribucion. Las tablas completas, incluidas las lineas base de comparacion, estan en la pagina de benchmarks del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 73 MB, la huella en memoria es reducida y puede ejecutarse en CPU.
- GPU recomendadas: no se documentan; el benchmark publicado se realizo en CPU (Intel i5-1145G7), lo que sugiere que no requiere GPU.
- Cabe en GPU de consumo: si, cualquier GPU con soporte ONNX Runtime puede alojarlo dado su tamano reducido; no se especifican modelos concretos.
- Opciones de despliegue: onnxruntime (libreria declarada), binario KaptchaOCR en Rust con `--ocr` y `--manifest`, o `--ocr-path` apuntando directamente a `medium_rec.onnx`.
- Latencia y throughput: latencia media de 69 ms/imagen en un Intel i5-1145G7 con un solo proceso; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaptchaOCR ft-medium | no disponible (ONNX de 73 MB) | Imagen RGB, altura 48, anchura dinamica | 90,7% exact match, 96,0% caracter, 69 ms/imagen | Apache-2.0 | Hugging Face + GitHub |
| PP-OCRv6 medium (base) | no disponible | Imagen RGB, altura 48, anchura dinamica | No disponible en la informacion proporcionada | Apache-2.0 | PaddleOCR |
| Otros modelos KaptchaOCR (4 restantes) | no disponible | No disponible | No disponible en la informacion proporcionada | Apache-2.0 | Coleccion de Hugging Face |

No se dispone de datos de benchmarks de PP-OCRv6 medium ni de los otros cuatro modelos KaptchaOCR en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas queda limitada al modelo base declarado.

## Limitaciones y advertencias

- El benchmark publicado no es fuera de distribucion: las imagenes de test comparten fuentes publicas con el entrenamiento, por lo que el 90,7% de exact match puede sobreestimar el rendimiento en CAPTCHAs de dominios nuevos.
- El rendimiento es muy variable por conjunto: del 74% en `dune` al 100% en `fjord`, lo que indica sensibilidad a la tipografia y al estilo de generacion del CAPTCHA.
- El modelo es solo de inferencia: no incluye preprocesado, decodificacion CTC ni servidor; requiere la biblioteca KaptchaOCR o una implementacion propia del pipeline.
- El fichero de charset debe acompanar al modelo con el mismo nombre base (`medium_rec.onnx` → `medium_rec.json`); un desajuste provoca errores de decodificacion.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible; al ser un reconocedor CTC, el riesgo principal es la sustitucion o omission de caracteres, no la generacion libre de texto.
- Uso comercial permitido por Apache-2.0, pero el uso de un reconocedor de CAPTCHAs puede contravenir los terminos de servicio de los sitios de origen; la licencia del modelo no habilita el acceso no autorizado a sistemas de terceros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.
- No se documentan variantes cuantizadas ni soporte GPU verificado, por lo que el despliegue en aceleradores distintos de CPU no esta avalado por benchmarks publicados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zaltahir/kaptchaocr-medium-rec)
- [Repositorio GitHub de KaptchaOCR](https://github.com/ozalt/kaptchaocr)
- [Coleccion de todos los modelos KaptchaOCR](https://huggingface.co/collections/zaltahir/kaptchaocr)
- [Pagina de benchmarks](https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md)
- [PaddleOCR (modelo base PP-OCRv6)](https://github.com/PaddlePaddle/PaddleOCR)
