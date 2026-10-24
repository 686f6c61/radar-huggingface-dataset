# youcoded/next-word-spanish

## Resumen

`youcoded/next-word-spanish` es un modelo neuronal pequeno para predecir la siguiente palabra en espanol, disenado exclusivamente para integrarse en el teclado en pantalla Swipe Keyboard (complemento de escritura por gestos para KDE Plasma). Lo desarrolla Destin Moss a traves de youcoded.ai y se publica como uno de los cuatro modelos de la familia (ingles, espanol, frances y aleman). No es un modelo generativo de texto: recibe las palabras ya escritas en el campo actual y devuelve una probabilidad para cada una de sus 23.999 palabras conocidas.

Tecnicamente es una LSTM de una sola capa con capa de proyeccion y vectores de palabra atados (tied embeddings), de la misma clase de tamano que los modelos de siguiente palabra que Google describe en su paper sobre Gboard (arXiv 2305.18465). El archivo publicado ocupa 4,71 MB en int8, con vectores de 128 dimensiones, 1.024 unidades ocultas y un vocabulario de 24.002 tokens. Su relevancia esta en que ofrece una alternativa abierta, auditable y ejecutable en CPU para una tarea tradicionalmente cubierta por modelos propietarios embebidos en teclados comerciales.

El modelo nunca se usa solo: el teclado lo mezcla siempre con un paquete de n-gramas (pares y triples de palabras) del mismo idioma, con un peso lambda de 0,7 para el modelo y un offset de 0,0 para las palabras que solo conoce el n-grama. La model card declara que, en esa configuracion, supera a Gboard 14.2 entre 4,89 y 19,59 puntos en acierto de la palabra correcta en el top 3, segun el punto de escritura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de una capa con capa de proyeccion y vectores de palabra atados (tied), no transformer |
| Parametros totales | ~4,3 millones de numeros (calculado por el autor a partir de los tamanos declarados) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ultimas 20 palabras de la oracion actual (no hay ventana en tokens) |
| Tipos de cuantizacion | int8 con una escala por fila (tipo de dato 1); el formato tambien admite float32 (tipo de dato 0); el archivo publicado va en int8 |
| Idiomas soportados | Espanol (es) unicamente |
| Licencia | `odc-by-1.0-and-cc-by-2.0-fr` (declarada como `other`; ver NOTICE.md) |
| Formato de pesos | Binario propio `es.nwp.bin` (magic `SWKBNWP1`, little-endian, checksum FNV-1a de 64 bits); no es safetensors ni GGUF |
| Tamano del archivo | 4.709.920 bytes (4,71 MB) |
| Vocabulario | 24.002 tokens: 23.999 palabras y 3 tokens especiales (desconocido, inicio de oracion, fin de oracion) |
| Dimension del vector de palabra | 128 |
| Dimension oculta de la LSTM | 1.024 |
| Peso de mezcla (lambda) | 0,7 (incluido en la cabecera del archivo) |
| Offset fuera de vocabulario | 0,0 |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-2 (copia en espanol) |
| Descargas / likes en HuggingFace | 0 descargas / 1 like |
| Libreria | `custom` (runner C++ propio, sin libreria de machine learning) |

## Arquitectura y entrenamiento

La red es una LSTM recurrente de una sola capa con proyeccion: recibe la secuencia de palabras de la oracion en curso, las codifica con embeddings de 128 dimensiones y procesa la secuencia con 1.024 unidades ocultas. La capa de salida reutiliza la matriz de embeddings (weight tying) y genera un logit por cada una de las 23.999 palabras del vocabulario, mas un sesgo de salida. El fichero binario contiene, en este orden: vectores de palabra [V x D], sesgo de salida [V], pesos de entrada de la LSTM [4H x D], pesos recurrentes [4H x D], sesgos de puerta [4H] y matriz de proyeccion [D x H], con el orden de puertas de PyTorch (entrada, olvido, celda, salida).

El entrenamiento se hizo desde cero sobre el corpus FineWeb-2 en espanol, segun declara el autor, sin reutilizar pesos ni datos de Google ni de FUTO. La model card no especifica el numero de tokens vistos, la composicion exacta del dataset, ni si hubo fases de ajuste fino con RLHF o DPO; esos datos no estan disponibles. La innovacion practica no esta en la arquitectura, sino en el formato: un unico binario de 4,71 MB con cabecera autocontenida (version, tipo de dato, vocabulario, dimensiones, lambda y offset), checksum FNV-1a y un cargador C++ de unas 250 lineas que rechaza ficheros con magic o version incorrectos.

## Capacidades

- Prediccion de la siguiente palabra: devuelve una distribucion de probabilidad sobre las 23.999 palabras conocidas a partir de hasta las ultimas 20 palabras de la oracion.
- Autocompletado de palabra parcial: la misma mezcla restringida a las palabras que empiezan por las letras ya tecleadas.
- Mezcla con n-gramas: puntuacion combinada `lambda x log-prob del modelo + (1 - lambda) x log-prob del n-grama`, con offset fijo para palabras que solo conoce el n-grama.
- Ejecucion en dispositivo: inferencia en CPU, sin GPU ni framework de machine learning, dentro del teclado.
- Integracion con la lista de palabras del teclado: requiere que al menos la mitad de las palabras del modelo coincidan con el vocabulario del teclado; si no, el teclado lo ignora.
- Fallback silencioso: si el archivo falta o esta corrupto, el teclado sigue funcionando solo con el paquete de n-gramas.
- Privacidad por diseno: solo ve palabras del campo actual; los campos de contrasena y otros campos privados se bloquean antes de llegar al modelo, y no aprende ni almacena nada.
- No soporta: generacion de texto libre, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni conversacion multi-turno.

## Casos de uso

- Prediccion en teclado en pantalla de KDE Plasma: el modelo se carga en el complemento Swipe Keyboard y alimenta las tres sugerencias que aparecen antes de empezar a escribir, leyendo la oracion en curso hasta 20 palabras atras.
- Autocompletado durante la escritura: al teclear dos o tres letras, se filtran las candidatas por prefijo y se reordenan con la mezcla modelo + n-grama, lo que segun el autor es donde se obtiene la mayor ventaja frente a Gboard.
- Teclados en equipos sin GPU ni conexion: con 4,71 MB en int8 y un runner C++ de ~250 lineas, cabe en escritorios modestos, portatiles antiguos, quioscos o sistemas empotrados donde no es viable servir un modelo en la nube.
- Accesibilidad y escritura asistida: sugerencias de palabra para usuarios con movilidad reducida o dislexia, ya que reduce el numero de pulsaciones necesarias y funciona con prediccion por prefijo.
- Investigacion sobre prediccion de texto en teclados: sirve como referencia abierta y reproducible de la clase de modelo descrita en el paper de Gboard (arXiv 2305.18465), con pesos y formato documentados para replicar experimentos.
- Evaluacion comparativa de teclados comerciales: la model card aporta una metodologia (METHODS.md) y resultados frente a Gboard 14.2 en emulador, util para auditorias de calidad de sugerencias en espanol.
- Filtrado y reordenacion de candidatos en pipelines de correccion ortografica o dictado: el modelo aporta la probabilidad contextual de la siguiente palabra y el n-grama aporta cobertura de vocabulario, combinables fuera del teclado reutilizando el binario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Metrica comun: acierto de la palabra correcta en el top 3, a nivel de palabra e insensible a mayusculas. Los resultados figuran como no verificados (`verified: false`) y se obtuvieron con el modelo mezclado con su paquete de n-gramas, no en solitario.

| Tarea | Dataset de evaluacion | Metrica | Valor |
|---|---|---|---|
| Sugerencia de siguiente palabra (modelo + n-gramas) | Common Voice, frases cotidianas, primeras 300 (CC0) | Palabra correcta en top 3 (insensible a mayusculas) | 26,27 % |
| Sugerencia de siguiente palabra (modelo + n-gramas) | FineWeb-2, primeras 300 frases de paginas de test | Palabra correcta en top 3 (insensible a mayusculas) | 33,25 % |
| Sugerencia de siguiente palabra (modelo + n-gramas) | Tatoeba, decima parte reservada (id % 10 == 0), primeras 300 frases | Palabra correcta en top 3 (insensible a mayusculas) | 31,32 % |

Comparacion con Gboard 14.2 declarada en la model card: ventaja de 4,89 a 19,59 puntos porcentuales a favor de este modelo, medida desde antes de teclear hasta tres letras escritas, sobre frases cotidianas y frases web (100 frases por conjunto). La version de Gboard es la incluida en la imagen de emulador Android 35 x86_64 de Google, con el aprendizaje desactivado, probada el 22 de octubre de 2026. No se midieron versiones posteriores ni Gboard despues de aprender del usuario.

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otras tareas estandar, y no serian aplicables: el modelo no es generativo ni conversacional.

## Requisitos de hardware

- VRAM estimada: practicamente nula para la inferencia del modelo; 4,71 MB de pesos en int8, ejecutados en CPU. No se publican mediciones de memoria en ejecucion.
- GPU recomendadas: ninguna. El modelo no requiere GPU; el runner es C++ sin libreria de machine learning.
- Viabilidad en hardware de consumo: total. Cabe en cualquier PC, portatil, mini-PC o dispositivo empotrado con unos pocos megabytes de RAM libre.
- Opciones de despliegue: runner C++ propio del proyecto Swipe Keyboard (`engine/src/nwp_model.cpp` y `nwp_predictor.cpp`) dentro del teclado en pantalla de KDE Plasma, junto al paquete de n-gramas. No hay soporte nativo conocido para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `youcoded/next-word-spanish` | ~4,3 M, int8 (4,71 MB) | Ultimas 20 palabras de la oracion | Top 3: 26,27 % (Common Voice), 33,25 % (FineWeb-2), 31,32 % (Tatoeba), mezclado con n-gramas | `odc-by-1.0-and-cc-by-2.0-fr` (other) | Pesos abiertos en HuggingFace |
| `youcoded/next-word-french` | No disponible en la informacion proporcionada (misma familia y mismas etiquetas declaradas) | No disponible | No disponible | `odc-by-1.0-and-cc-by-2.0-fr` | Pesos abiertos en HuggingFace |
| Gboard 14.2 (modelo de siguiente palabra) | No publico | No disponible | 4,89 a 19,59 puntos por debajo de este modelo en los tests de la model card | Propietaria | Solo integrado en la app; no descargable |

No se han identificado en la informacion disponible otros modelos abiertos de prediccion de siguiente palabra en espanol con parametros y benchmarks comparables, mas alla de los otros idiomas de la misma familia. Para los modelos de la familia francesa o alemana no se dispone de resultados de evaluacion en la documentacion consultada.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion de texto: no puede redactar, responder preguntas ni razonar; solo asigna probabilidades a palabras de su vocabulario.
- Vocabulario cerrado de 23.999 palabras: cualquier palabra fuera de esa lista recibe el tratamiento de token desconocido o se delega en el paquete de n-gramas.
- Contexto muy corto: solo las ultimas 20 palabras de la oracion; no hay memoria entre campos ni entre sesiones, y no aprende de lo que escribe el usuario.
- Dependencia de la mezcla: usarlo en solitario no es el caso de uso previsto y degrada la cobertura frente a la combinacion con n-gramas. Los numeros de la model card corresponden siempre al sistema mezclado.
- Requisito de compatibilidad de vocabulario: si menos de la mitad de las palabras del modelo coinciden con la lista del teclado, el modelo se ignora silenciosamente.
- Resultados no verificados: los tres valores de la model card estan marcados como `verified: false`, con muestras pequenas (300 frases por conjunto, 100 frases por conjunto en la comparacion con Gboard) y sobre corpus especificos, por lo que no deben extrapolarse a otros dominios.
- Posible sesgo de dominio: el entrenamiento se basa en FineWeb-2 (texto web en espanol); el registro, la variedad dialectal y la representacion de jerga o lenguaje oral quedan determinados por ese corpus. No se publica analisis de sesgos.
- Riesgo de sugerencia erronea: al mostrar solo tres candidatos, una prediccion incorrecta puede introducir palabras no deseadas si el usuario acepta la sugerencia sin revisar; no hay calibracion declarada entre contextos.
- Licencia restrictiva en la practica: la licencia `other` combina ODC-BY 1.0 y CC-BY 2.0 FR; exige atribucion y hay que revisar NOTICE.md antes de cualquier redistribucion o uso comercial.
- Estado del proyecto: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el 23 de octubre de 2026, con el codigo en una rama de desarrollo (`feature/179-engine-in-keyboard`) pendiente de fusionar en la rama principal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youcoded/next-word-spanish
- Aviso legal y licencia (NOTICE.md): https://huggingface.co/youcoded/next-word-spanish/blob/main/NOTICE.md
- Metodologia de evaluacion (METHODS.md): https://huggingface.co/youcoded/next-word-spanish/blob/main/METHODS.md
- Codigo, scripts y tests del teclado (rama de desarrollo): https://github.com/itsdestin/swipe-keyboard/tree/feature/179-engine-in-keyboard
- Paper de referencia sobre el modelo de Gboard: https://arxiv.org/abs/2305.18465
- Modelo hermano en frances: https://huggingface.co/youcoded/next-word-french
- Dataset de entrenamiento (FineWeb-2): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Sitio del autor: https://youcoded.ai/
- Repositorio del asistente YouCoded (producto distinto del autor): https://github.com/itsdestin/youcoded
