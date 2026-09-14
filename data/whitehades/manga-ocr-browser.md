# WhiteHades/manga-ocr-browser

# manga-ocr-browser (WhiteHades)

## Resumen

manga-ocr-browser es una redistribucion optimizada para descarga de los pesos ONNX cuantizados a int8 de kha-white/manga-ocr-base, un modelo de reconocimiento optico de caracteres (OCR) especializado en texto japones presente en paginas de manga. El autor, WhiteHades, no reentrena ni modifica los pesos: toma los exports q8 ya publicados por onnx-community y los comprime con gzip, reduciendo la descarga combinada de encoder y decoder de 116,6 MB a 95,5 MB. El repositorio ocupa 0,1 GB e incluye los ficheros `.onnx.gz`, el `vocab.txt` y ficheros auxiliares (`models.json`, `packed.json`) con tamanos y sumas de verificacion.

El objetivo es practico: hacer viable la inferencia OCR en el navegador mediante ONNX Runtime Web, donde cada megabyte de descarga afecta directamente al tiempo de carga inicial. El caso de uso declarado por el autor es el lector readest, que utiliza el modelo como segunda pasada para reintentar lineas cuya prediccion inicial resulta dudosa. La licencia Apache-2.0 y el formato ONNX lo hacen integrable en aplicaciones web comerciales sin dependencia de backend.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, pensado exclusivamente para japones. Su relevancia no esta en capacidades generativas, sino en el empaquetado: demuestra como comprimir exports ONNX cuantizados para despliegues en cliente sin alterar ni los pesos ni el consumo de memoria en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder en formato ONNX, exportado desde kha-white/manga-ocr-base; el repositorio distribuye dos grafos separados (encoder y decoder). Detalle interno no disponible en la informacion proporcionada |
| Parametros totales | No disponible de forma explicita; los ficheros int8 sin comprimir suman 116,6 MB, lo que sugiere un orden de magnitud de 110 M de parametros (estimacion, no confirmada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Int8 (q8) sobre ONNX; distribucion adicional comprimida con gzip (`.onnx.gz`) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 (se conserva la del modelo de origen; ver `LICENSE` y `NOTICE` para atribucion) |
| Formato de pesos | ONNX cuantizado a int8, comprimido con gzip; vocabulario en `vocab.txt` |

Datos adicionales: tarea declarada `ocr`; tamano del repositorio 0,1 GB; modelo base `kha-white/manga-ocr-base`; fecha de creacion registrada 2026-09-14 y ultima actualizacion 2026-09-14.

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Se limita a recomprimir los exports ONNX int8 publicados por onnx-community en `manga-ocr-base-ONNX`, sin tocar los tensores. La model card es explicita: "the weights are unchanged". La unica transformacion aplicada es la compresion gzip de los dos grafos (encoder y decoder), que se descomprimen antes de cargarse en ONNX Runtime Web.

En consecuencia, no hay informacion en esta ficha sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni el uso de RLHF o DPO: esos detalles corresponden al modelo original `kha-white/manga-ocr-base`, cuya model card documenta el preprocesado de imagen y la configuracion del decoder. La innovacion tecnica aportada aqui es exclusivamente de empaquetado y distribucion, no de arquitectura.

## Capacidades

- Reconocimiento optico de caracteres sobre texto japones en imagenes de paginas de manga, incluyendo disposicion vertical y tipografias propias de la edicion japonesa.
- Inferencia local en el navegador a traves de ONNX Runtime Web, sin enviar imagenes a un servidor.
- Correccion o reintento de predicciones de baja confianza generadas por otros motores de OCR (el autor lo emplea sobre salidas de PaddleOCR).
- Integracion en pipelines de vision por computador como modulo OCR de un solo idioma.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento (thinking), vision general, audio ni generacion de texto libre.
- Capacidad multilingue: no; esta restringido a japones.
- No se documentan capacidades de deteccion de layout, segmentacion de globos de dialogo ni traduccion; solo reconocimiento de texto.

## Casos de uso

- Lectores de manga en web (PWA): el modelo se carga en el navegador del usuario y reconoce el texto de la pagina sin backend. El ahorro de 21,1 MB en la descarga combinada (de 116,6 MB a 95,5 MB) reduce el tiempo de carga inicial en conexiones moviles.
- Segunda pasada de OCR sobre resultados dudosos: el autor lo usa en readest para reintentar lineas en las que el motor principal (PaddleOCR) devuelve baja confianza, aprovechando que el modelo corrige parte de esos casos. La aplicacion selectiva evita el coste de ejecutarlo sobre la pagina completa.
- Digitalizacion y busqueda full-text de colecciones escaneadas: se ejecuta por lotes en servidor con ONNX Runtime en CPU y se indexa el texto extraido para busquedas por palabra clave dentro de tomos completos.
- Aplicaciones de aprendizaje de japones: extraccion del texto de paneles para enlazarlo con diccionarios, generar furigana o anadir traducciones emergentes sobre la imagen.
- Accesibilidad y texto alternativo: generacion de descripciones textuales del contenido de paneles escaneados para lectores de pantalla o modos de alto contraste.
- Archivado offline en aplicaciones de escritorio o moviles: al no requerir GPU ni servicio externo, el modelo puede empaquetarse dentro de la aplicacion y funcionar sin conexion.
- Preprocesado en pipelines hibridos de OCR: uso como especialista en japones dentro de un sistema que enruta cada region de la imagen al motor mas adecuado segun el idioma detectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el repositorio asociado solo aportan evidencia cualitativa:

| Observacion reportada por el autor | Detalle |
|---|---|
| Correccion de predicciones debiles | El modelo corrigio varias predicciones flojas de PaddleOCR en las muestras de manga del autor |
| Introduccion de errores | En otras regiones de las mismas muestras el modelo introdujo errores que el motor principal no cometia |
| Estrategia adoptada | Uso como reintento selectivo de lineas inciertas, no como OCR principal |
| Limitacion observada | Las guias de lectura pequenas junto a los kanji siguen provocando errores |
| Efecto de la compresion | El autor indica que el tiempo de inferencia y el uso de memoria no cambian respecto a los exports q8 originales |

## Requisitos de hardware

- Huella de pesos: 95,5 MB comprimidos (encoder + decoder) y 116,6 MB una vez descomprimidos en int8. La memoria en ejecucion sera algo superior a esa cifra por activaciones y buffers de ONNX Runtime; no se publica una medicion exacta.
- GPU: no requiere GPU. La orientacion del repositorio es la ejecucion en navegador mediante ONNX Runtime Web, con backend WebAssembly (CPU) y posibilidad de usar WebGPU cuando este disponible.
- Cabe en cualquier GPU de consumo y en la mayoria de portatiles y moviles actuales; no necesita A100, H100 ni tarjetas de gama alta.
- Opciones de despliegue: ONNX Runtime Web en navegador (WASM/WebGPU), ONNX Runtime en servidor (CPU o GPU) para procesado por lotes, y conversion del grafo ONNX a otros runtimes si se requiere. vLLM, TGI, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje generativo con decodificacion autoregresiva de texto libre.
- Latencia y throughput: no disponibles. La unica referencia cuantitativa es que la compresion gzip no altera el tiempo de inferencia del export q8 original.

## Comparativa con modelos similares

| Modelo | Formato y tamano | Cuantizacion | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| WhiteHades/manga-ocr-browser | ONNX `.onnx.gz`, 95,5 MB de descarga (encoder + decoder) | Int8 + gzip | Japones | Apache-2.0 | Pesos identicos a los de onnx-community; orientado a descarga en navegador |
| onnx-community/manga-ocr-base-ONNX | ONNX sin comprimir, 116,6 MB | Int8 (q8) | Japones | Apache-2.0 | Fuente directa de los pesos del repositorio anterior; sin recomprimir |
| kha-white/manga-ocr-base | Pesos del modelo original; formato y tamano no disponibles en esta informacion | No disponible | Japones | Apache-2.0 (segun la atribucion indicada en el repositorio derivado) | Modelo de origen; su model card documenta el preprocesado y la configuracion del decoder |
| PaddleOCR (referencia cualitativa) | No disponible | No disponible | Multilingue | No disponible en la informacion proporcionada | Mencionado en la model card como motor principal; en las muestras del autor produjo predicciones flojas que manga-ocr corrigio parcialmente |

## Limitaciones y advertencias

- Solo japones: no reconoce otros idiomas ni escritura latina de forma fiable.
- Especifico de manga: no se ha validado sobre documentos, formularios, capturas de pantalla ni fotografia natural; su preprocesado esta pensado para paginas de este tipo de publicacion.
- Errores conocidos: las guias de lectura (furigana y anotaciones de pequeno tamano junto a los kanji) provocan fallos de reconocimiento.
- No es un sustituto de un OCR generalista: el propio autor lo plantea como reintento selectivo de lineas inciertas, no como motor principal, porque introduce errores en regiones que otros motores resuelven bien.
- Cuantizacion int8: aunque no hay una comparativa publicada frente al modelo en precision completa, la cuantizacion puede degradar ligeramente la precision en caracteres poco frecuentes.
- Sin validacion comunitaria: 0 descargas y 0 likes en la fecha de consulta, y el autor indica que las paginas de prueba empleadas permanecen privadas, por lo que no hay un conjunto de evaluacion publico que respalde el comportamiento reportado.
- Dependencia del preprocesado del modelo de origen: hay que replicar exactamente el escalado de imagen y la configuracion del decoder documentados en `kha-white/manga-ocr-base`; un preprocesado distinto degrada el resultado.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero obliga a conservar avisos de copyright y a incluir la atribucion recogida en `LICENSE` y `NOTICE`. Al ser una redistribucion de pesos de terceros, conviene verificar tambien las condiciones del modelo original y del export de onnx-community.
- Alucinacion: como cualquier modelo seq2seq de OCR, puede generar texto plausible que no aparece en la imagen, especialmente en regiones con ruido, tramado o bajo contraste.
- Ausencia de soporte conversacional: no acepta instrucciones en lenguaje natural ni mantiene contexto entre llamadas; la entrada es una imagen y la salida, texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WhiteHades/manga-ocr-browser
- Repositorio con scripts y resultados de prueba: https://github.com/WhiteHades/manga-ocr-browser
- Export ONNX de origen (onnx-community): https://huggingface.co/onnx-community/manga-ocr-base-ONNX/tree/f9023406bb2f6b17df67bc4a327c56ecd20611f0
- Modelo base original: https://huggingface.co/kha-white/manga-ocr-base
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los unicos enlaces relevantes son los incluidos en la model card y en la informacion del repositorio.
