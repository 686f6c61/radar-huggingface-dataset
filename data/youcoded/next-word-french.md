# youcoded/next-word-french

## Resumen

`youcoded/next-word-french` es una red neuronal pequena para predecir la siguiente palabra de una frase en frances. No es un modelo generativo de texto al uso: es un componente de motor de prediccion para teclados, desarrollado por Destin Moss a traves de youcoded.ai y publicado en 2026 junto al teclado deslizante de codigo abierto Swipe Keyboard, un complemento de teclado en pantalla para KDE Plasma. Forma parte de una familia de cuatro modelos (ingles, espanol, frances y aleman); esta ficha cubre unicamente la variante francesa.

Tecnicamente es una LSTM de una sola capa con capa de proyeccion y vectores de palabra atados (*tied*), con vector de 128 dimensiones, capa oculta de 1024 y un vocabulario de 23.923 tokens (23.920 palabras mas tres tokens especiales). Son unos 4,3 millones de numeros en pesos int8, en un unico fichero binario de 4.698.696 bytes (4,70 MB). Segun el autor, pertenece a la misma clase de tamano que los modelos de prediccion de Gboard descritos en el paper publico de Google (arXiv 2305.18465), aunque fue entrenado desde cero sin pesos ni datos de Google ni de FUTO.

Su relevancia es de nicho pero concreta: demuestra que una prediccion de siguiente palabra util en frances cabe en 4,7 MB, se ejecuta en CPU sin ninguna libreria de aprendizaje automatico (un runner C++ de unas 250 lineas) y no almacena ni aprende nada de lo que el usuario escribe. No funciona de forma autonoma: el teclado siempre lo combina con un paquete de n-gramas (pares y triples de palabras) del mismo idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de una capa con capa de proyeccion y vectores de palabra atados (entrada/salida), orden de puertas de PyTorch (entrada, olvido, celda, salida) |
| Parametros totales | ~4,3 millones (23.923 x 128 vectores, 4H x D de entrada y recurrente, sesgo de puertas 4H, proyeccion D x H, sesgo de salida V) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Las ultimas 20 palabras de la frase actual (ventana fijada por el teclado); no es una ventana de contexto de tokens al uso |
| Tipos de cuantizacion | int8 con una escala por fila (formato publicado); el cargador admite tambien float32 (tipo de dato 0) con la misma estructura |
| Idiomas soportados | Frances (`fr`) unicamente |
| Licencia | `odc-by-1.0-and-cc-by-2.0-fr` (ODC-BY 1.0 y CC-BY 2.0 FR; requiere atribucion, ver NOTICE.md) |
| Formato de pesos | Binario propio `fr.nwp.bin` (magic `SWKBNWP1`, little-endian, checksum FNV-1a de 64 bits); no es safetensors, GGUF ni ONNX |
| Tamano del vocabulario | 23.923 tokens: 23.920 palabras + desconocido, inicio de frase y fin de frase |
| Dimension del vector de palabra | 128 |
| Dimension de la capa oculta | 1024 |
| Tamano de fichero | 4.698.696 bytes (4,70 MB) |
| Ponderacion del blend | lambda = 0,7 (modelo) frente a 0,3 (n-gramas); offset para palabras fuera del vocabulario del modelo = 0,0 |
| Libreria / pipeline | `custom` / `text-generation` (etiqueta de HuggingFace; el uso real es prediccion de siguiente palabra) |
| Autor y fecha | Destin Moss (youcoded.ai), creado el 23 de octubre de 2026 |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es una LSTM de una capa que recibe la frase escrita hasta el momento y devuelve una probabilidad para cada una de sus 23.920 palabras conocidas. Los vectores de palabra (128 dimensiones) se comparten entre la entrada y la capa de salida, y la salida de la LSTM (1024) se proyecta de vuelta a 128 dimensiones antes de multiplicar por la matriz de vectores atada y sumar un sesgo de tamano V. El fichero incluye, en este orden: cabecera con version, tipo de dato, V, D, H, longitud de la lista de palabras, lambda y offset de OOV; la lista de palabras en texto plano (solo letras, rellenada a multiplo de 16 bytes); los tensores; y un hash FNV-1a de 64 bits. El cargador rechaza ficheros con magic incorrecto o version desconocida.

El unico dato de entrenamiento declarado es el corpus `HuggingFaceFW/fineweb-2`, del que se deduce un subconjunto en frances. No se publican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la funcion de perdida, la duracion del entrenamiento ni si hubo ajuste fino con RLHF o DPO (no procede en un modelo de este tipo). Tampoco se detalla el procedimiento de cuantizacion a int8 mas alla de la escala por fila. La innovacion tecnica no esta en la arquitectura, sino en el empaquetado y la integracion: un unico binario de 4,7 MB leido por un runner C++ propio sin dependencias de machine learning, y una politica de mezcla explicita con n-gramas (media ponderada de log-probabilidades para el vocabulario comun, y puntuacion del n-grama mas un offset fijo para las palabras que solo conoce el n-grama).

## Capacidades

- Prediccion de la siguiente palabra en frances a partir de la frase en curso (hasta las ultimas 20 palabras), devolviendo un ranking de tres sugerencias tras la mezcla con el paquete de n-gramas.
- Autocompletado de palabra: la misma mezcla restringida a las palabras que empiezan por las letras ya tecleadas.
- Integracion con entrada por gesto (*swipe*): el autor la presenta como parte de un teclado deslizante, no solo de tecleo pulsado.
- Ejecucion totalmente local: inferencia en el propio dispositivo, sin red, dentro de un runner C++ de unas 250 lineas y sin libreria de ML.
- Privacidad por diseno: solo ve palabras del campo actual; el teclado bloquea campos de contrasena y otros campos privados antes de que el texto llegue al modelo; no aprende ni almacena nada.
- Degradacion controlada: si el fichero falta o esta danado, el teclado usa solo el paquete de n-gramas; si menos de la mitad de las palabras del modelo coinciden con la lista del teclado, el modelo se ignora.
- No soporta generacion de texto libre, chat, tool calling, agentes, vision, audio ni razonamiento multi-paso. No tiene memoria entre sesiones ni entre campos.

## Casos de uso

- **Teclado en pantalla de KDE Plasma**: es su uso previsto. El motor carga `fr.nwp.bin` junto al paquete de n-gramas franceses y muestra tres sugerencias por pulsacion; el modelo aporta contexto de frase completa mientras el n-grama aporta pares y triples exactos y un vocabulario mayor.
- **Autocompletado en escritura real de documentos**: al teclear las primeras letras, la mezcla se restringe a palabras con ese prefijo, lo que sirve para redactar correos o apuntes en frances reduciendo pulsaciones en palabras largas y frecuentes.
- **Equipos sin GPU y con recursos muy limitados**: con 4,7 MB de pesos int8 y sin dependencias de ML, se puede ejecutar en portatiles antiguos, mini-PC o placas ARM donde no tiene sentido desplegar un transformer pequeno con runtime de inferencia.
- **Entornos con requisito estricto de no exfiltracion de texto**: el modelo no tiene red ni almacenamiento y el teclado bloquea campos privados antes de la inferencia, lo que encaja en administraciones, clinicas o despachos juridicos que no pueden enviar texto a la nube.
- **Accesibilidad y escritura asistida**: usuarios con dificultades motoras que escriben en frances se benefician de sugerencias que consideran la frase entera y no solo la palabra anterior, reduciendo el numero de pulsaciones por frase.
- **Terminales de kiosco o paneles industriales en frances**: teclados virtuales en pantallas tactiles donde no hay espacio ni refrigeracion para hardware de inferencia acelerada y donde la prediccion debe responder a cada pulsacion.
- **Investigacion en modelos de lenguaje diminutos**: sirve como linea base reproducible para estudiar la mezcla de un modelo neuronal con n-gramas (aqui con lambda = 0,7), el efecto del vocabulario limitado a ~24.000 palabras y el coste/beneficio del int8 por filas.
- **Localizacion de un teclado multilenguaje**: el autor publica variantes inglesa, espanola y alemana con el mismo formato, de modo que un despliegue puede intercambiar ficheros de idioma sin cambiar el motor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La metrica es "palabra correcta en el top 3" (a nivel de palabra, sin distinguir mayusculas) y la medicion se hace con el modelo **mezclado con su paquete de n-gramas**, no en solitario. Ningun resultado esta verificado de forma independiente (`verified: false`) y las muestras son las primeras 300 frases de cada conjunto.

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Sugerencia de siguiente palabra (modelo + n-gramas) | Common Voice, frases cotidianas, primeras 300 (CC0) | Acierto en top 3 (nivel de palabra, insensible a mayusculas) | 22,1 % |
| Sugerencia de siguiente palabra (modelo + n-gramas) | FineWeb-2, paginas de test, primeras 300 frases | Acierto en top 3 (nivel de palabra, insensible a mayusculas) | 31,97 % |
| Sugerencia de siguiente palabra (modelo + n-gramas) | Tatoeba, decima parte reservada (`id % 10 == 0`), primeras 300 frases | Acierto en top 3 (nivel de palabra, insensible a mayusculas) | 32,79 % |

Comparacion declarada por el autor frente a Gboard 14.2 (copia incluida en la imagen del emulador Android 35 x86_64 de Google, con aprendizaje desactivado, probada el 22 de octubre de 2026): el modelo con su paquete de n-gramas acerto mas a menudo en todas las medidas registradas, con una ventaja de **4,29 a 14,56 puntos** desde el estado "antes de teclear" hasta tres letras tecleadas, sobre frases cotidianas y frases web (100 frases por conjunto). El autor advierte de que no se midieron versiones mas recientes de Gboard ni Gboard despues de aprender del usuario. No se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar de LLM, y no proceden para este modelo.

## Requisitos de hardware

- **VRAM**: no requiere GPU. El fichero de pesos ocupa 4,70 MB y la inferencia se hace en CPU; el consumo de RAM es del orden de megabytes (no se publica cifra exacta).
- **GPU recomendadas**: ninguna. El runner C++ no usa aceleracion por GPU ni librerias de ML.
- **CPU**: cualquier x86_64 o ARM capaz de ejecutar KDE Plasma; no se publican requisitos minimos ni cifras de latencia o throughput.
- **Cabe en hardware de consumo**: si, en cualquier portatil, mini-PC o placa de un solo board; no necesita ni siquiera una iGPU dedicada.
- **Opciones de despliegue**: el runner propio del proyecto (`engine/src/nwp_model.cpp` y `engine/src/nwp_predictor.cpp`) dentro de Swipe Keyboard para KDE Plasma, con el fichero `fr.nwp.bin` y el paquete de n-gramas del mismo idioma. **No** es desplegable en vLLM, llama.cpp, Ollama ni TGI, porque el formato binario es propio y no hay conversion publicada a GGUF ni a safetensors.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. El diseno apunta a inferencia por pulsacion en el dispositivo (ventana de 20 palabras, 4,3 millones de parametros), pero no se aportan milisegundos ni palabras por segundo medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| youcoded/next-word-french | ~4,3 M (LSTM, int8, 4,70 MB) | Ultimas 20 palabras de la frase | 22,1 / 31,97 / 32,79 % de acierto en top 3 (mezclado con n-gramas) | ODC-BY 1.0 + CC-BY 2.0 FR | Pesos en HuggingFace, formato binario propio |
| Modelo de siguiente palabra de Gboard (Google, arXiv 2305.18465) | Misma clase de tamano segun el autor; cifra exacta no disponible | No disponible | Superior en las pruebas del autor solo en la comparacion con Gboard 14.2 en emulador: el modelo de youcoded queda 4,29-14,56 puntos por delante | Propietaria | No disponible (solo en la app) |
| Modelos hermanos de youcoded (ingles, espanol, aleman) | No disponible en la informacion proporcionada; misma familia y mismo formato | 20 palabras (por coherencia de diseno, no confirmado en la informacion) | No disponible | No disponible | Publicados por el mismo autor; enlaces no incluidos en la informacion |
| Modelos de siguiente palabra de FUTO Keyboard | No disponible | No disponible | No disponible | No disponible | Codigo abierto segun el contexto del proyecto; el autor declara no haber usado sus pesos ni datos |

No se dispone de datos publicos suficientes para comparar con alternativas abiertas de prediccion de texto en frances de otros proveedores; el propio autor situa la referencia en el modelo descrito en el paper de Gboard.

## Limitaciones y advertencias

- **No es un modelo de lenguaje generativo**: no escribe texto, no responde a instrucciones, no hace chat ni tool calling, y no tiene memoria de lo tecleado. Solo devuelve probabilidades sobre sus 23.920 palabras.
- **No debe usarse en solitario**: el autor lo disena para mezclarse con un paquete de n-gramas; sin el, ni el vocabulario ni los pares/triples exactos estan cubiertos.
- **Vocabulario limitado**: solo las palabras mas frecuentes (hasta ~24.000). Cualquier termino tecnico, nombre propio o palabra rara queda fuera y depende del n-grama.
- **Dependencia de la lista de palabras del teclado**: si menos de la mitad de las palabras del modelo coinciden con la lista del teclado, el modelo se ignora silenciosamente; un desajuste de vocabulario degrada la experiencia sin aviso.
- **Tasa de acierto moderada**: entre el 22,1 % y el 32,79 % de acierto en top 3 segun el conjunto, es decir, en dos de cada tres casos la palabra correcta no esta entre las tres sugerencias. Ademas, las muestras son de 300 frases y los resultados no estan verificados por terceros.
- **Solo frances**: no hay capacidades multilingues; el autor no lo recomienda para otros idiomas.
- **Calibracion no garantizada**: el propio autor advierte que las probabilidades no estan calibradas entre contextos, por lo que no sirven como senal de confianza para moderacion ni para umbrales automaticos.
- **Sesgos**: no se documenta ningun analisis de sesgo. Al entrenar sobre FineWeb-2 (texto web) y limitar el vocabulario a las palabras mas frecuentes, es esperable que herede la distribucion del corpus, con posible infrarrepresentacion de vocabulario regional, tecnico o de colectivos concretos. Los datos de Common Voice sugieren un rendimiento notablemente peor en habla cotidiana (22,1 %) que en texto web (31,97 %).
- **Riesgo de alucinacion en sentido estricto**: no aplica (no genera texto), pero si puede producir sugerencias gramaticalmente plausibles y semanticamente erroneas, especialmente en frases largas o fuera de dominio.
- **Licencia con obligaciones**: ODC-BY 1.0 y CC-BY 2.0 FR exigen atribucion; hay que revisar `NOTICE.md` antes de redistribuir o integrar en un producto comercial. La etiqueta de HuggingFace es `other`, no una licencia estandar de modelo.
- **Formato cerrado a efectos practicos**: al no haber conversion publicada a GGUF ni a safetensors, la integracion exige portar el cargador binario o reimplementarlo, con el riesgo de error en el orden de tensores y en el manejo de escalas int8 por fila.
- **Comparacion con Gboard no equivalente**: se hizo contra una copia en emulador, con el aprendizaje desactivado y sin versiones mas recientes ni estados de aprendizaje del usuario. No debe citarse como superioridad general frente a Gboard.
- **Madurez**: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo dia; el codigo vive en una rama de desarrollo (`feature/179-engine-in-keyboard`) pendiente de fusion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youcoded/next-word-french
- Metodologia de medida (METHODS.md): https://huggingface.co/youcoded/next-word-french/blob/main/METHODS.md
- Aviso de licencia y atribucion (NOTICE.md): https://huggingface.co/youcoded/next-word-french/blob/main/NOTICE.md
- Codigo, scripts y pruebas (rama de desarrollo del teclado): https://github.com/itsdestin/swipe-keyboard/tree/feature/179-engine-in-keyboard
- Paper de referencia sobre el modelo de siguiente palabra de Gboard: https://arxiv.org/abs/2305.18465
- Dataset declarado (FineWeb-2): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Sitio del autor: https://youcoded.ai/
- Repositorio del autor (proyecto de asistente YouCoded, distinto de este modelo): https://github.com/itsdestin/youcoded
