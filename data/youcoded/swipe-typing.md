# youcoded/swipe-typing

## Resumen

youcoded/swipe-typing (denominado "T1" en la model card) es una red neuronal pequena que convierte el trazo de un dedo sobre un teclado en pantalla en una lista ordenada de palabras candidatas. No es un modelo de lenguaje: es un decodificador de gestos de deslizamiento para el teclado Swipe Keyboard, un complemento de escritura por gestos y prediccion de palabras para el teclado en pantalla de KDE Plasma. Lo desarrolla Destin Moss a traves de youcoded.ai y se publica con licencia MIT.

La arquitectura es una pila de dos capas convolucionales 1D (96 canales, kernel 5) seguida de una GRU bidireccional de 2 capas con 128 unidades ocultas y una "pointer head" de 32, entrenada con la perdida CTC sobre la secuencia de teclas que el dedo atraviesa. Son aproximadamente 529.000 parametros en un archivo de 2,1 MB (2.115.260 bytes) en float32, con 64 pasos temporales de 8 caracteristicas cada uno. La entrada son posiciones, no indices de teclas, lo que permite usar los mismos pesos con QWERTY, AZERTY, QWERTZ o un teclado espanol con enie.

Su relevancia es practica: inferencia en dispositivo a unos 3,5 ms por trazo en un solo hilo de CPU, sin dependencias de librerias de aprendizaje automatico y sin enviar datos del usuario. En el banco bench-2000 (2.000 trazos reales en ingles) acierta la primera opcion el 90,40 % de las veces, 2,9 puntos por debajo del motor de FUTO, que sigue siendo el motor por defecto del teclado; este modelo es una alternativa opt-in.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 2 capas convolucionales 1D (96 canales, kernel 5) + GRU bidireccional de 2 capas (128 ocultas) + pointer head de 32; entrenada con perdida CTC. No es un transformer |
| Parametros totales | Aproximadamente 529.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 pasos temporales por trazo, remuestreados por longitud de arco, con 8 caracteristicas por paso; contexto de frase mediante prior n-gram de palabras anteriores (ventana no disponible) |
| Tipos de cuantizacion | float32 en el archivo publicado; el formato declara admitir float16 (campo data type = 1). No hay GGUF ni cuantizacion por bloques |
| Idiomas soportados | Ingles, espanol, frances y aleman, con un unico modelo para los cuatro |
| Licencia | MIT |
| Formato de pesos | `swipe-model.bin`, formato propio SKNN version 1, little-endian, cargado por un runner C++ propio (`engine/src/swipe_net.cpp`); no safetensors ni GGUF |
| Tamano del archivo | 2.115.260 bytes (2,1 MB) |
| Entrada por paso | x, y, dx, dy, logaritmo del tiempo transcurrido, fraccion del trazo completada, longitud del paso y logaritmo de la longitud del trazo |
| Velocidad | Aproximadamente 3,5 ms por trazo en un hilo de CPU (build `-O3`, escritorio con carga) |

## Arquitectura y entrenamiento

La red procesa la traza como una secuencia: dos capas convolucionales 1D de 96 canales y kernel 5 extraen patrones locales sobre 64 pasos temporales remuestreados por longitud de arco, y una GRU bidireccional de 2 capas con 128 unidades modela la dependencia temporal. La salida no es un vocabulario de palabras, sino una puntuacion por tecla: en cada paso, una pequena red compartida ("pointer head", anchura 32) puntua cada tecla a partir del desplazamiento del dedo respecto a esa tecla medido en anchos de tecla, mas el tamano de la tecla. El entrenamiento usa la perdida CTC (Graves et al., 2006) sobre la secuencia de teclas atravesadas, lo que evita la necesidad de alineamientos manuales entre trazo y palabra.

La decodificacion a palabras se hace fuera de la red: una busqueda en haz sobre un trie de secuencias de teclas construido a partir de un lexico verificado, puntuando cada candidata como evidencia de la red + frecuencia de la palabra + prior n-gram de la frase cuando se conocen las palabras previas + una comprobacion geometrica cruzada aportada por un decodificador clasico de coincidencia de forma, mezclada con peso 40. Los ajustes usados en los resultados publicados son peso de frecuencia 0,06, peso geometrico 40 y anchura de haz 48. Los datos de entrenamiento proceden de las colecciones publicas de trazos de FUTO (`swipe-1` split de entrenamiento, y `swipe-2` a `swipe-5`), con trazos reales en QWERTY ingles y, en `swipe-5`, trazos reales en aleman, frances y espanol sobre sus propios layouts. El numero de trazos de entrenamiento, el numero de epochs y la composicion exacta del lexico no estan disponibles en la informacion proporcionada; no se menciona RLHF ni DPO (no aplica a este tipo de modelo).

## Capacidades

- Decodificacion de trazos de deslizamiento a una lista ordenada de palabras candidatas, con probabilidades por tecla convertidas en palabras mediante busqueda en haz sobre lexico.
- Independencia de layout: al puntuar teclas por posicion relativa y tamano, los mismos pesos sirven para QWERTY, AZERTY, QWERTZ y teclados espanoles con enie.
- Uso de contexto de frase: incorpora un prior n-gram sobre las palabras anteriores cuando el teclado las suministra.
- Fusion con un decodificador geometrico clasico (peso 40) para desempatar y corregir formas.
- Multilingue en un solo archivo: ingles, espanol, frances y aleman.
- Inferencia en dispositivo, sin red ni telemetria por defecto; el teclado no registra trazos salvo que el usuario active un grabador independiente opt-in.
- Degradacion controlada: si falta el archivo, esta danado o el resultado es vacio, responde solo el decodificador geometrico.
- No soporta generacion de texto libre, tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni reconocimiento de escritura a mano.

## Casos de uso

- Teclado en pantalla de KDE Plasma: integracion como motor alternativo opt-in del complemento Swipe Keyboard, activado por el usuario mediante un archivo `own-engine`, manteniendo el motor de FUTO como predeterminado.
- Dispositivos de bajos recursos y embebidos: 2,1 MB de pesos y unos 3,5 ms por trazo en un solo hilo de CPU permiten ejecutarlo en Raspberry Pi, portatiles modestos o terminales ARM sin GPU.
- Teclados con layouts no estandar: al depender de posiciones y no de indices de tecla, un teclado AZERTY, QWERTZ o una variante espanola con enie reutiliza el mismo binario sin reentrenar.
- Entrada por gestos en entornos sin conectividad o con requisitos de privacidad: toda la inferencia ocurre en el dispositivo y no se envian trazos a ningun servidor.
- Aplicaciones de accesibilidad: como capa de decodificacion de entrada gestual para usuarios que no pueden teclear pulsando teclas, con fallback geometrico garantizado si el modelo falla.
- Reduccion del tamano de distribucion en suites multilingues: un unico archivo cubre cuatro idiomas, en lugar de un modelo por lengua.
- Investigacion y reentrenamiento: el formato SKNN documenta cabecera y tensores, y el runner C++ valida los campos, por lo que se puede variar el tamano de la red sin tocar el codigo de carga.
- Base para comparativas de decodificacion de swipe: el codigo, los scripts y el banco bench-2000 permiten reproducir la medicion frente al motor de FUTO o a decodificadores clasicos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado | Referencia comparativa | Verificado |
|---|---|---|---|---|
| bench-2000: 2.000 trazos reales en ingles, split de test MIT de FUTO | Primer acierto correcto, todos los trazos | 90,40 % | 93,32 % del motor de FUTO (2,9 puntos de diferencia) | No |
| bench-2000: 2.000 trazos reales en ingles, split de test MIT de FUTO | Palabra correcta en el top 3, todos los trazos | 94,95 % | No disponible | No |

No se han publicado resultados de benchmarks para espanol, frances o aleman en la informacion disponible, ni comparacion con Gboard (el autor indica explicitamente que la escritura por deslizamiento de Gboard no se midio).

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos en float32 ocupan unos 2 MB y la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna. El runner es C++ plano, sin librerias de aprendizaje automatico ni kernels acelerados documentados.
- Cabe en cualquier CPU consumer, incluidos portatiles de gama baja, SoCs ARM y placas tipo Raspberry Pi.
- Despliegue: runner propio del proyecto (`engine/src/swipe_net.cpp`) integrado en el teclado; no hay soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia: aproximadamente 3,5 ms por trazo en un solo hilo con build `-O3` en un escritorio con carga, lo que equivale a unos 285 trazos por segundo por hilo.
- Throughput con varios hilos y coste desagregado entre red y busqueda en haz: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Primer acierto (bench-2000) | Top-3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| youcoded/swipe-typing (T1) | Conv 1D + BiGRU + CTC, con decodificacion por haz sobre lexico | ~529.000 | 90,40 % | 94,95 % | MIT | Publico en HuggingFace; motor opt-in del teclado |
| Motor de FUTO | No disponible | No disponible | 93,32 % | No disponible | No disponible | Motor por defecto del teclado Swipe Keyboard |
| Decodificador geometrico del mismo proyecto | Clasico, sin red neuronal | 0 | No disponible | No disponible | MIT (repositorio del proyecto) | Integrado como fallback |
| Gboard (deslizamiento) | Propietario | No disponible | No medido | No disponible | Propietaria | Comercial, no evaluable en abierto |

La comparacion directa solo es posible frente al motor de FUTO, y unicamente en ingles: el autor no publica cifras de Gboard ni de otros teclados de deslizamiento.

## Limitaciones y advertencias

- Solo puede devolver palabras presentes en el lexico verificado; cualquier palabra ausente de la lista es un fallo garantizado.
- En ingles esta 2,9 puntos por debajo del motor de FUTO (90,40 % frente a 93,32 % en primera opcion), y el autor lo califica como "todavia no tan preciso"; su uso es opt-in.
- Las metricas son declaradas por el autor y no estan verificadas de forma independiente (campo `verified: false` en la model-index).
- No hay resultados publicados en espanol, frances ni aleman, a pesar de que el modelo declara esos idiomas.
- El archivo `.bin` no incluye checksum interno: la integridad depende del SHA-256 fijado en el teclado (`941272a7017229a73e07d1c0bd766757e739174db3a42fb622c26256b8c46110`). Una discrepancia hace que el motor entre en modo solo geometria.
- Formato de pesos propietario: requiere el runner C++ del proyecto; no hay conversion documentada a safetensors, GGUF u ONNX.
- El rendimiento depende de la calidad del lexico y del modelo n-gram, cuya composicion y tamano no estan disponibles.
- El entrenamiento se apoya en las colecciones de trazos de FUTO, por lo que puede heredar sesgos hacia los dispositivos, tamanos de teclado y patrones de usuario presentes en esas colecciones; no se documentan analisis de sesgo.
- Uso no previsto: entrada sensible a seguridad, identificacion de personas o cualquier fin que almacene o transmita los trazos del usuario.
- El codigo vive en una rama de desarrollo (`feature/179-engine-in-keyboard`); el formato y la API pueden cambiar antes de su fusion en la rama principal.
- Repositorio con 0 descargas y 1 "like" en el momento de la ficha: validacion externa practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youcoded/swipe-typing
- Codigo, scripts y tests (rama de desarrollo): https://github.com/itsdestin/swipe-keyboard/tree/feature/179-engine-in-keyboard
- Pagina de metodos (copia publicada en el repo del modelo): https://huggingface.co/youcoded/swipe-typing/blob/main/METHODS.md
- Colecciones publicas de trazos de FUTO: https://swipe.futo.org
- youcoded.ai (autor): https://youcoded.ai
- Articulo de CTC, Graves et al., 2006: https://www.cs.toronto.edu/~graves/icml_2006.pdf
- Nota sobre la busqueda web: los resultados devueltos correspondian unicamente a portada y secciones de BBC News, sin relacion con el modelo; no se han incluido por no ser relevantes.
