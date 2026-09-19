# vattanac/khmer-ocr-crnn-ctc

## Resumen

`vattanac/khmer-ocr-crnn-ctc` es un sistema de reconocimiento optico de caracteres (OCR) para jemer (khmer, codigo `km`), publicado por el usuario vattanac bajo licencia Apache 2.0. No es un modelo de lenguaje generativo, sino una red convolucional-recurrente (CRNN) entrenada con CTC que recibe como entrada una linea de texto ya recortada y devuelve su transcripcion. Se distribuyen dos checkpoints con la misma arquitectura y vocabulario: uno para documentos impresos y texto en escena (`khmer_ocr_document.pt`) y otro ajustado sobre escritura manuscrita real (`khmer_ocr_handwriting.pt`).

El problema que aborda es la ausencia de herramientas abiertas y reproducibles para OCR jemer: los sistemas publicados mas precisos no son descargables, de modo que resulta dificil saber que puede hacer realmente una alternativa abierta. El autor entrenó el modelo base desde cero sobre texto renderizado sinteticamente por unos 1,30 USD de tiempo de GPU alquilada, e incluye el codigo de inferencia, el vocabulario y un modelo de lenguaje de caracteres (5-gramas) para decodificacion por haz, de forma que las cifras publicadas puedan verificarse y mejorarse.

El propio autor advierte de que **no es el estado del arte**: los sistemas especializados en jemer estan sustancialmente por delante. Su propuesta es ser el motor de proposito general abierto y ejecutable mas preciso de los que probaron, con un rendimiento de 16,9 % de CER en documentos impresos (KHOB nivel 1) y 14,4 % en escritura manuscrita, con velocidades de 52 a 107 lineas por segundo en un MacBook Pro. El repositorio ocupa 0,2 GB y contiene unicamente codigo de inferencia; el script de entrenamiento, el pipeline de renderizado sintetico y el arnes de evaluacion no se publican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN: CNN de 7 bloques (64 a 512 canales, ancho submuestreado por 8) + BiLSTM de 2 capas (256 unidades por direccion) + capa lineal con CTC |
| Parametros totales | no disponible (el checkpoint de documentos ocupa 117 MB y el de manuscrita, 39 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la entrada es una linea de texto recortada; no gestiona contexto conversacional) |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints PyTorch; no se documentan versiones cuantizadas) |
| Idiomas soportados | jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); vocabulario en `vocab.json`; modelo de lenguaje en `khmer_lm.pkl.gz` |
| Altura de entrada | 64 px (lineas de texto redimensionadas) |
| Espacio de etiquetas | 283 clases: 282 puntos de codigo + simbolo en blanco de CTC |
| Tamano del repositorio | 0,2 GB |
| Metricas declaradas | CER (con conciencia de agrupacion de grafemas, estilo KHCWER) |

## Arquitectura y entrenamiento

La entrada es una linea de texto recortada, redimensionada a 64 px de alto. Un extractor convolucional de siete bloques (de 64 a 512 canales, con el ancho submuestreado por un factor de 8) produce una secuencia de columnas de caracteristicas; una BiLSTM de dos capas con 256 unidades por direccion anade contexto secuencial, y una capa lineal emite puntuaciones por fotograma sobre 283 clases (282 puntos de codigo mas el simbolo en blanco de CTC). La decodificacion puede ser voraz (greedy) o por haz con un modelo de lenguaje de caracteres de 5-gramas; los ajustes publicados son `alpha=0.35`, `beta=1.5`, `beam=8`, que segun el autor reducen el CER relativo en torno a un 15 % frente a la decodificacion voraz (subir `alpha` a 1.0 empeora los resultados porque el modelo de lenguaje empieza a sobrescribir lecturas correctas).

El modelo base se entreno desde cero con texto renderizado sinteticamente, con un coste aproximado de 1,30 USD de GPU alquilada. El segundo checkpoint es un ajuste fino del base sobre escritura manuscrita real, que baja el CER del 46,9 % al 14,4 % en la particion de validacion de 307 lineas. Dos detalles de diseno son especificos del jemer: por un lado, CTC no puede emitir mas simbolos que fotogramas de entrada, de modo que ante entradas ilegibles el modelo degrada hacia salidas parciales o vacias (en el banco de pruebas no produjo ninguna salida desbocada, mientras que un modelo de vision-lenguaje autorregresivo entro en bucles de repeticion en el 13,5 % de una muestra de 200 lineas y emitio texto en seis sistemas de escritura no relacionados); por otro, dado que el jemer representa algunos subindices y vocales antepuestas a la izquierda de la consonante base, un decodificador estrictamente de izquierda a derecha puede emitirlos en orden logico incorrecto, por lo que se aplica un paso posterior a la decodificacion que puntua ambos ordenes con el modelo de lenguaje.

## Capacidades

- Reconocimiento de texto impreso a partir de recortes de linea (documentos digitales, PDF comprimidos, escaneos fisicos y fotografias).
- Reconocimiento de texto en escena (rotulos y texto en imagenes), evaluado en KHOB nivel 2.
- Reconocimiento de escritura manuscrita jemer mediante el checkpoint `khmer_ocr_handwriting.pt`.
- Decodificacion voraz o por haz con modelo de lenguaje de caracteres (5-gramas) para mejorar la precision.
- Reparacion del orden logico de subindices y vocales antepuestas tras la decodificacion.
- Salida acotada: al no ser autorregresivo, no genera texto desbocado ni inventa sistemas de escritura ante entradas ilegibles (degrada a salida parcial o vacia).
- Inferencia en CPU de portatil o en GPU.
- API de Python (`load_model`, `load_lm`, `read_line`) que acepta rutas de fichero o imagenes PIL, e interfaz de linea de comandos (`khmer_ocr.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni traduccion: es exclusivamente un reconocedor de lineas de texto jemer.
- No incluye deteccion de lineas ni segmentacion de pagina: hay que aportar los recortes desde un paso previo propio.

## Casos de uso

- Digitalizacion de archivos y fondos documentales en jemer: se segmenta cada pagina en lineas y se transcriben con el checkpoint de documentos; el CER del 3,9 % en texto digital limpio lo hace adecuado para corpus bien escaneados o nativos digitales.
- Procesamiento de formularios, facturas y documentos administrativos camboyanos: las lineas recortadas de campos se transcriben campo a campo y se vuelcan a una base de datos estructurada.
- Lectura de notas y manuscritos: con `khmer_ocr_handwriting.pt` se transcriben cuadernos o correspondencia (14,4 % de CER y 54,1 % de lineas exactas en la particion de validacion del autor).
- Traduccion de rotulos y senaletica en aplicaciones moviles: el modelo reconoce texto en escena (28,7 % de CER, 46,9 % de lineas exactas en KHOB nivel 2) y la cadena de traduccion se encarga del resto.
- Procesamiento por lotes de gran volumen en servidor: a 107 lineas/s en decodificacion voraz sobre un MacBook Pro, un solo equipo puede transcribir cientos de miles de lineas al dia; la decodificacion con modelo de lenguaje baja a 52 lineas/s a cambio de mas precision.
- Despliegue en el borde o sin conexion: el checkpoint de documentos pesa 117 MB y funciona en CPU, de modo que puede ejecutarse en un portatil o en un equipo modesto sin GPU ni servicios externos.
- Linea base reproducible para investigacion en OCR jemer: al publicarse los pesos, el vocabulario, el decodificador y el arnes de evaluacion, sirve como punto de partida para comparar mejoras, aumentar datos sinteticos o cambiar la arquitectura.
- Preanotacion de datos para etiquetado humano: se transcriben lotes grandes de lineas con el modelo y un revisor corrige solo los casos de baja confianza, reduciendo el coste de construir corpus jemer.

## Benchmarks y rendimiento

Documentos impresos (KHOB nivel 1, 1862 regiones). La metrica es CER de grafemas con conciencia de agrupacion (estilo KHCWER), en la que una consonante base con su conector COENG, subindice y signos vocales cuenta como una unidad; no debe compararse con CER por puntos de codigo.

| Motor | CER (%) | Lineas exactas | Lineas/s |
|---|---|---|---|
| Este modelo + LM | 16,9 | 28,7 % | 52 |
| Este modelo (voraz) | 19,8 | 26,2 % | 107 |
| Surya (VLM) | 31,7 | 20,3 % | 1,4 |
| Tesseract `best` | 39,4 | 14,9 % | 14 |
| Tesseract `fast` | 43,2 | 14,5 % | 17 |

Desglose por tipo de tarea del modelo con LM: 3,9 % de CER en texto digital limpio, 16,6 % en texto comprimido, 36,9 % en escaneos fisicos y 9,9 % en fotografias. Los escaneos fisicos son el caso mas debil para todos los motores.

Texto en escena (KHOB nivel 2, 2215 regiones):

| Motor | CER (%) | Lineas exactas |
|---|---|---|
| Este modelo + LM | 28,7 | 46,9 % |
| Este modelo (voraz) | 31,3 | 42,3 % |
| Tesseract `best` | 54,1 | 15,7 % |
| Tesseract `fast` | 54,6 | 15,6 % |
| Surya (VLM) | 68,5 | 35,5 % |

Escritura manuscrita (particion de validacion de 307 lineas):

| Modelo | CER (%) | Lineas exactas |
|---|---|---|
| Modelo de documentos, sin datos de manuscrita | 46,9 | no medido |
| `khmer_ocr_handwriting.pt` | 14,4 | 54,1 % |

Todos los motores recibieron los mismos recortes de linea y el mismo posprocesado. A Tesseract se le dio el modelo `tessdata_best` a precision completa con `--psm 7`; a Surya se le dio una disposicion sintetica de una sola linea, sin la cual su etapa de maquetacion no devuelve region para la mayoria de tiras cortas. El rendimiento (lineas/s) se midio en un Apple MacBook Pro.

## Requisitos de hardware

- El autor indica que el modelo se ejecuta en la CPU de un portatil o en GPU; no se publican cifras oficiales de VRAM ni de RAM.
- Huella en disco de los pesos: 117 MB el checkpoint de documentos, 39 MB el de manuscrita y 13 MB el modelo de lenguaje, por lo que el espacio de memoria necesario es muy reducido en comparacion con modelos generativos.
- GPU recomendadas: no disponible. Al no ser un transformer autorregresivo, no necesita aceleradores de gama alta; cualquier GPU con soporte de PyTorch es suficiente.
- Cabe en GPU de consumo: si, y el autor confirma su funcionamiento en CPU sin GPU dedicada (Apple MacBook Pro).
- Despliegue: inferencia directa con PyTorch mediante `khmer_ocr.py` o la API de Python (`load_model`, `load_lm`, `read_line`). vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje generativos y no a una CRNN con CTC.
- Latencia y rendimiento medidos por el autor en un MacBook Pro: 107 lineas/s con decodificacion voraz y 52 lineas/s con decodificacion por haz y modelo de lenguaje.
- Requiere un paso previo de deteccion y recorte de lineas, no incluido en el repositorio.
- Dependencias: `torch`, `pillow` y `numpy`.

## Comparativa con modelos similares

| Modelo | Tipo | CER impreso (KHOB 1) | CER escena (KHOB 2) | CER manuscrita | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo + LM | CRNN-CTC | 16,9 % | 28,7 % | 14,4 % (checkpoint especifico) | Apache 2.0 | Abierto, pesos descargables desde HuggingFace |
| Este modelo (voraz) | CRNN-CTC | 19,8 % | 31,3 % | 14,4 % (checkpoint especifico) | Apache 2.0 | Abierto, pesos descargables desde HuggingFace |
| Surya (VLM) | Modelo de vision-lenguaje | 31,7 % | 68,5 % | no disponible | no disponible en la informacion proporcionada | Motor ejecutable probado por los autores; pesos no evaluados aqui |
| Tesseract `best` | OCR clasico | 39,4 % | 54,1 % | no disponible | no disponible en la informacion proporcionada | Motor de codigo abierto ampliamente distribuido |
| Tesseract `fast` | OCR clasico | 43,2 % | 54,6 % | no disponible | no disponible en la informacion proporcionada | Motor de codigo abierto ampliamente distribuido |

El autor senala que los sistemas especializados en jemer estan sustancialmente por delante de este modelo, pero no son descargables publicamente, por lo que no se incluyen en la comparativa con cifras. No se dispone de datos de benchmarks de estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- No es el estado del arte: el propio autor lo califica de linea base abierta y advierte de que los sistemas especializados de jemer son bastante mejores.
- Punto debil en escaneos fisicos: 36,9 % de CER frente a 3,9 % en texto digital limpio y 9,9 % en fotografias.
- La escritura manuscrita requiere el checkpoint `khmer_ocr_handwriting.pt`; el modelo de documentos sin ajuste obtiene un 46,9 % de CER en ese dominio.
- Solo reconoce jemer (`km`). No traduce ni procesa otros idiomas o sistemas de escritura.
- Entrada limitada a una linea de texto recortada: no detecta lineas, no segmenta paginas ni trabaja con documentos completos por si mismo.
- No se publican el script de entrenamiento, el pipeline de renderizado de datos sinteticos ni el arnes de evaluacion, lo que limita la reproducibilidad completa del entrenamiento.
- No se publican cifras oficiales de VRAM ni de consumo de memoria, ni detalles sobre sesgos del modelo. Al ser un OCR discriminativo y no generativo, el riesgo de alucinacion de contenido es bajo (salida acotada por CTC), pero puede producir omisiones o transcripciones parciales ante entradas ilegibles.
- La precision depende de los hiperparametros de decodificacion (`alpha=0.35`, `beta=1.5`, `beam=8`); valores mas altos de `alpha` empeoran el resultado porque el modelo de lenguaje sobrescribe lecturas correctas.
- Las cifras de CER usan agrupacion de grafemas (estilo KHCWER) y no son comparables con CER por puntos de codigo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de atribucion y aviso de cambios. No se declaran restricciones adicionales.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe todavia validacion comunitaria independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vattanac/khmer-ocr-crnn-ctc
- Referencia arXiv declarada en las etiquetas del modelo: arXiv:2603.00702 (no se dispone del titulo ni de los datos del articulo en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces recuperados correspondian a foros de preguntas y respuestas sin relacion con OCR jemer, por lo que no se incluyen.
