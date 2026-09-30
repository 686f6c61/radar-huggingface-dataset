# ToTo-40417/EXLLM-ONI5M

## Resumen

EXLLM-ONI5M es un "Little Language Model" experimental de 5.377.824 parametros (0,005377824 B) publicado por el usuario ToTo-40417 dentro de su proyecto EXLLM. No es un asistente general: se ha entrenado especificamente para generar respuestas cortas en japones con la personalidad ficticia de un profesor anticuado e impaciente, a partir de plantillas y combinaciones sinteticas creadas por el propio autor. El checkpoint embebido esta pensado para ejecutarse en hardware muy limitado y su inferencia EXQ12 se ha verificado fisicamente en una agenda electronica CASIO EX-word XD-B4800 (DATAPLUS 6).

El proyecto publica dos artefactos distintos que conviene no confundir: el checkpoint embebido (FP32, EXLLM8 int8 y EXQ12) con 128 tokens de contexto y un vocabulario de 868 tokens, y un companion GGUF de 5.441.184 parametros (0,005441184 B) que se entreno por separado desde los mismos datos y que es compatible con llama.cpp y LM Studio. El GGUF no es una conversion ni una cuantizacion del checkpoint embebido: tiene pesos, tokenizer, detalles de arquitectura y contexto de ejecucion diferentes.

Su relevancia actual es acotada pero clara: sirve como caso de estudio reproducible de entrenamiento desde cero (18 epocas, 6.692.919 tokens procesados), de cuantizacion extrema en modelos de unos 5 MB y de despliegue en dispositivos embebidos sin GPU. Se publica bajo licencia Apache-2.0, soporta japones e ingles (con comportamiento fiable solo en kana corto) y no ha registrado descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Checkpoint de arquitectura propia del proyecto EXLLM (etiqueta `custom-code`); el companion GGUF se describe como compatible con Llama |
| Parametros totales | 5.377.824 (checkpoint embebido, 0,005377824 B) y 5.441.184 (companion GGUF, reportado como 5.441.184 en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (checkpoint embebido). El companion GGUF se ejecuta con 512 tokens asignados en tiempo de ejecucion, lo que no implica calidad de tarea a 512 tokens |
| Tipos de cuantizacion | FP32 (PyTorch), EXLLM8 int8, EXQ12, F16 (GGUF) |
| Idiomas soportados | Japones (ja) e ingles (en); el comportamiento entrenado se centra en kana japones |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo en HuggingFace), PyTorch `.pt` (FP32), EXLLM8 `.bin` (int8), EXQ12 `.q12`, GGUF (F16) |
| Vocabulario | 868 tokens (checkpoint embebido); el tokenizer del GGUF es distinto |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El checkpoint embebido se entreno desde inicializacion aleatoria durante 18 epocas, registrando 6.692.919 tokens procesados y 4.532.281 tokens con perdida (*loss-bearing*). Los datos de entrenamiento son plantillas y combinaciones sinteticas escritas por el propio proyecto: no se utilizo ningun checkpoint preentrenado de terceros ni corpus de citas de personas reales. El objetivo de entrenamiento favorece una respuesta corta seguida de una reprimenda con tono de profesor, comportamiento aprendido que no constituye un mecanismo de rechazo ni una garantia frente a alucinaciones.

El companion GGUF se inicializo y entreno por separado a partir de los mismos datos publicos de ONI5M, con pesos, tokenizer, detalles de arquitectura y contexto de ejecucion distintos de los del checkpoint para EX-word. La model card no especifica el tipo de arquitectura interna (transformer, MoE, híbrida u otra), el regimen de atencion ni si hubo fases de RLHF o DPO; tampoco detalla la composicion exacta del dataset. Se indican cuatro variantes de pesos con tamanos y hashes SHA-256 concretos: `EXLLM-ONI5M-v1.0.pt` (FP32, 21.528.721 bytes), `EXLLM-ONI5M-v1.0-int8.bin` (EXLLM8, 5.443.105 bytes), `oni5m.q12` (EXQ12, 5.443.105 bytes) y `EXLLM-ONI5M-F16.gguf` (10.918.368 bytes).

## Capacidades

- Generacion de texto corto en japones centrado en kana, con respuestas breves seguidas de una admonicion con tono de profesor.
- Persona ficticia fija (profesor impaciente de estilo antiguo) mantenida por el objetivo de entrenamiento, no por un mecanismo de control explicito.
- Comportamiento aprendido de pedir al usuario que reformule la pregunta ante entradas desconocidas; no es un mecanismo de rechazo garantizado.
- Generacion de texto en ingles (idioma declarado), sin garantias de calidad comparables al japones.
- Inferencia en dispositivo fisico sin GPU: validada en CASIO EX-word XD-B4800 (DATAPLUS 6) mediante el runtime `exllm-exword` v1.3.1 o superior.
- Compatibilidad con `llama.cpp` y LM Studio a traves del companion GGUF F16.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Inferencia en hardware embebido sin GPU: el checkpoint EXQ12 (`oni5m.q12`, 5,19 MiB) se ejecuta en una CASIO EX-word XD-B4800 con 128 tokens de contexto y velocidades medidas de ~0,57 token/s, lo que permite validar despliegues en dispositivos con memoria y computo muy restringidos.
- Pruebas de conversion y cuantizacion extrema: al existir cuatro artefactos con tamanos distintos (FP32 20,53 MiB, int8 y EXQ12 5,19 MiB, GGUF F16 10,41 MiB) y hashes SHA-256 publicados, sirve para verificar pipelines de cuantizacion y la reproducibilidad de artefactos en integracion continua.
- Prototipado de chatbots con personalidad fija para demos y entretenimiento: la persona "profesor impaciente" es deliberada y estable dentro de su dominio de kana corto, lo que encaja en demos interactivas y no en atencion al cliente real.
- Validacion de runtimes propios: el proyecto aporta `exllm-exword` v1.3.1 y la herramienta `exllm-model-check` para comprobar el fichero de pesos antes del despliegue, de modo que el modelo funciona como banco de pruebas del propio stack.
- Ejemplo didactico de entrenamiento desde cero: la receta registra 18 epocas, 6.692.919 tokens procesados y 4.532.281 tokens con perdida, con datos de plantillas propias, lo que permite estudiar un ciclo completo sin depender de checkpoints preentrenados.
- Pruebas comparativas entre backend embebido y de escritorio: el mismo proyecto permite contrastar el checkpoint EXQ12 en la XD-B4800 (~0,57 token/s) con el companion GGUF en llama.cpp sobre una RTX 3060 (~443 token/s, prueba de humo), siempre asumiendo que son modelos distintos.
- Pruebas de humo en `llama.cpp` y LM Studio sin coste de GPU: el GGUF F16 de 10,41 MiB se carga en cualquier equipo y permite comprobar rapidamente el flujo `llama-cli -m EXLLM-ONI5M-F16.gguf -c 512 --single-turn -p "こんにちは"`.
- Experimentos sobre limites de tokenizacion y contexto: con 868 tokens de vocabulario en el checkpoint embebido y 128 tokens de contexto, es util para medir el impacto de vocabularios diminutos y ventanas muy cortas en la calidad de la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas mediciones publicadas son de velocidad de decodificacion y pertenecen a dos modelos y dos runtimes distintos, por lo que no son directamente comparables entre si:

| Entorno | Modelo y artefacto | Medicion | Valor |
|---|---|---|---|
| CASIO EX-word XD-B4800 (DATAPLUS 6) | Checkpoint embebido, EXQ12 | Velocidad de decodificacion en tres ejecuciones registradas | ~0,57 token/s |
| PC con RTX 3060, `llama.cpp` | Companion GGUF F16 | Velocidad de generacion en prueba de humo | ~443 token/s |

Detalles relevantes de estas mediciones: en la XD-B4800 se completaron verificacion de lectura con SHA-256, carga del modelo, inferencia, capturas de pantalla y registro PERFLOG; una de las peticiones contenia kanji, no produjo la respuesta de identidad esperada y alcanzo el limite de 40 tokens, de modo que las mediciones demuestran ejecucion, no calidad general de respuesta. Los resultados del companion en PC pertenecen a un modelo distinto y a un runtime numerico distinto, y no constituyen un benchmark comparable contra el modelo de EX-word. Las observaciones legibles por maquina estan en `benchmarks/xd-b4800-20260930.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El checkpoint FP32 ocupa 20,53 MiB, el EXQ12 y el EXLLM8 int8 ocupan 5,19 MiB cada uno, y el GGUF F16 ocupa 10,41 MiB. Cualquier GPU con unos pocos cientos de MiB libres es suficiente.
- GPU recomendadas: no se especifica ninguna como requisito. La unica GPU mencionada es una RTX 3060 usada para una prueba de humo con `llama.cpp`.
- Compatibilidad con GPU de consumo: si. El modelo cabe en cualquier GPU de consumo actual y tambien en CPU. El despliegue verificado de referencia no usa GPU, sino una agenda electronica CASIO EX-word XD-B4800 (DATAPLUS 6).
- Opciones de despliegue: `llama.cpp` y LM Studio mediante el companion GGUF F16; PyTorch para los pesos FP32; runtime `exllm-exword` v1.3.1 o superior con `weights/oni5m.q12` para el dispositivo EX-word; `exllm-model-check` para verificar el fichero antes del despliegue.
- Latencia y throughput: ~0,57 token/s en la XD-B4800 (tres ejecuciones) y ~443 token/s en la prueba de humo con RTX 3060 y `llama.cpp`. No se publican mediciones de latencia (TTFT) ni de throughput para otras configuraciones.
- Nota sobre el contexto: el checkpoint embebido trabaja con 128 tokens de contexto; el valor de 512 tokens del GGUF es una asignacion del runtime y no una garantia de calidad de tarea a esa longitud.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa en parametros, contexto, rendimiento y licencia. Los unicos modelos relacionados documentados pertenecen al mismo proyecto y no se acompanan de datos comparables:

| Modelo | Relacion | Datos disponibles |
|---|---|---|
| ToTo-40417/EXLLM | Modelo base del proyecto EXLLM | No se detallan parametros, contexto ni licencia en la informacion disponible |
| ToTo-40417/EXLLM-JPTOEN | Modelo relacionado de traduccion japones-ingles del mismo proyecto | No se detallan parametros, contexto ni licencia en la informacion disponible |

## Limitaciones y advertencias

- Es un experimento de persona muy estrecho, entrenado sobre un conjunto finito de plantillas y combinaciones sinteticas; no es un asistente general.
- Puede responder de forma incorrecta, ignorar la persona prevista, repetir texto o consumir todo el limite de generacion.
- El comportamiento de pedir que se reformule la entrada ante entradas desconocidas no esta garantizado y no evita las alucinaciones.
- La variacion en kana, las faltas de ortografia, el kanji, las peticiones largas, la aritmetica y la conversacion abierta no son fiables. Se documento un caso con kanji que no produjo la respuesta de identidad esperada y alcanzo el limite de 40 tokens.
- El contexto del modelo embebido es de 128 tokens; los 512 tokens asignados en el runtime del GGUF no establecen calidad de tarea a 512 tokens.
- Los resultados del dispositivo fisico y del companion en PC corresponden a modelos y runtimes numericos diferentes y no son comparables entre si.
- La persona es ficticia y puede generar texto grosero o inexacto; no ha sido evaluada como sistema de seguridad.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor desaconseja explicitamente su uso en decisiones medicas, legales, financieras, de seguridad critica o profesionales.
- Uso previsto segun el autor: experimentos de inferencia embebida y entretenimiento, no uso factual, profesional ni critico para la seguridad.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToTo-40417/EXLLM-ONI5M
- Proyecto de arquitectura, conversion y evaluacion: https://github.com/ToTo-40417/exllm
- Runtime para CASIO EX-word: https://github.com/ToTo-40417/exllm-exword
- Herramienta de verificacion de pesos: https://github.com/ToTo-40417/exllm-model-check
- Modelo relacionado japones-ingles: https://huggingface.co/ToTo-40417/EXLLM-JPTOEN
- Modelo base EXLLM: https://huggingface.co/ToTo-40417/EXLLM
- Observaciones legibles por maquina de la XD-B4800: `benchmarks/xd-b4800-20260930.json` (dentro del repositorio del modelo)
- Manifiesto de entrenamiento del companion GGUF: `lmstudio/training_manifest.json` (dentro del repositorio del modelo)
- Procedencia de datos: `DATA_PROVENANCE.md` (dentro del repositorio del modelo)
- Receta de entrenamiento: `training/RECIPE.md` (dentro del repositorio del modelo)
- Manifiesto de publicacion: `release-manifest.json` (dentro del repositorio del modelo)
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos resultados obtenidos corresponden a la marca de sanitarios TOTO y al grupo musical Toto, sin relacion con EXLLM-ONI5M.
