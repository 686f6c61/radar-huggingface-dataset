# tachara-ai/Decisio-12b-tuned-v2-commit

## Resumen

Decisio-12b-tuned-v2-commit es un ajuste fino del modelo base google/gemma-4-12B-it (revision 707f0a3b) desarrollado por tachara-ai. No es un modelo generativo de proposito general al uso: esta entrenado para responder preguntas tipadas sobre un estado devolviendo una probabilidad calibrada para cada opcion posible. La variante "commit" aplica, sobre esas probabilidades calibradas, una regla de compromiso para preguntas de tipo si/no, de modo que una probabilidad estrictamente entre 0,20 y 0,80 se reporta en el borde de esa banda del lado correspondiente (0,80 por encima de un medio, 0,20 en o por debajo). El modelo se sirve mediante la herramienta decisio (version 0.35.0 o superior), que aplica el layout de prompt, la lectura de letras de opcion, las temperaturas y la regla de commit propias del repositorio.

El modelo tiene 11.959.730.224 parametros (aproximadamente 12.000 millones) en precision bf16 y un tamano de repositorio de 24,0 GB. Se distribuye en formato safetensors y su licencia es Apache 2.0, heredada del modelo base. La arquitectura subyacente es la del Gemma 4 12B instruct de Google, sobre el que se ha fusionado un adaptador LoRA. Este repositorio es un modelo nuevo, no una actualizacion de los repositorios Decisio-12b-tuned previos (calibrated, commit y commit-think), que siguen siendo los 12B ajustados por defecto de decisio.

Su relevancia radica en el enfoque: en lugar de generar texto libre, el modelo produce distribuciones de probabilidad calibradas sobre opciones discretas, lo que lo hace adecuado para sistemas de decision automatizada, scoring y clasificacion con incertidumbre explicita. La calibracion de las temperaturas se ajusto por minima perdida logaritmica por tipo de pregunta y banda de opciones sobre la lectura plana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 12B) con adaptador LoRA fusionado |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer decoder-only de aproximadamente 12.000 millones de parametros. Sobre ese checkpoint se entreno un adaptador LoRA que posteriormente se fusiono en los pesos base en fp32 y se redondeo una sola vez a bf16 de forma estocastica con semilla 0, mediante `python -m decisio.hub_bf16 merge`. La fusion conserva 0,999999 del cambio del adaptador en el espacio de pesos, y todos los demas tensores son los del modelo base, byte a byte. El repositorio incluye `decision_config.json`, que lista cada archivo por sha256 junto con los datos de la fusion, y `SHA256SUMS` con los archivos del repositorio.

Los datos de entrenamiento no se han divulgado. El autor indica que no se usaron elementos de evaluacion del Decision Index ni de JevBench en el entrenamiento ni en la seleccion del checkpoint, y que los datos se descontaminaron contra los conjuntos de test publicos de ambos boards. El entrenamiento incluyo los splits oficiales de entrenamiento de algunos benchmarks publicos, usados bajo sus licencias, sin emplear elementos de test o evaluacion de esos benchmarks, y cada fila de entrenamiento se verifico contra los conjuntos de test publicos de ambos boards. Las temperaturas se ajustaron por minima perdida logaritmica por tipo de pregunta y banda de opciones sobre la lectura plana: si/no 2,01; score 1,4978; choice 1,5274, con valores especificos por numero de opciones (2-10: 1,5577; 11-26: 1,3713; 27-255: 1,6042).

## Capacidades

- Respuesta a preguntas tipadas sobre un estado con una probabilidad para cada opcion, en lugar de generacion de texto libre.
- Salida calibrada: las probabilidades se ajustan por temperatura segun el tipo de pregunta (si/no, score, choice) y la banda de numero de opciones.
- Regla de commit para preguntas de tipo si/no: una probabilidad estrictamente entre 0,20 y 0,80 se reporta en el borde de esa banda del lado correspondiente (0,80 por encima de un medio, 0,20 en o por debajo). La respuesta no cambia; cambia su calibracion.
- Lectura de letras de opcion mediante el layout de prompt propio de decisio.
- Servicio mediante decisio 0.35.0 o superior, con un motor de despliegue basado en vLLM (`decisio.serve.vllm_engine`).
- Exposicion de los valores por defecto del repositorio a traves de `/health`, `systemone.repository_defaults` y `systemone.flavor`; cualquier flag que difiera del repositorio se reporta como override.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Sistemas de decision automatizada con incertidumbre explicita: el modelo devuelve una probabilidad por opcion, lo que permite umbrales de confianza y abstencion en lugar de una respuesta categorica sin matices.
- Clasificacion binaria con banda de commit: en preguntas de si/no, la regla de commit reporta probabilidades extremas fuera de la banda 0,20-0,80 y fija el borde de la banda en caso contrario, lo que resulta util para flujos que necesitan decisiones con margen controlado.
- Scoring de multiples opciones: el tipo de pregunta "score" con temperatura 1,4978 permite puntuar alternativas de forma calibrada, por ejemplo en ranking de candidatos o evaluacion de respuestas.
- Eleccion entre conjuntos amplios de opciones: el tipo "choice" admite bandas de 2-10, 11-26 y 27-255 opciones con temperaturas especificas, adecuado para seleccion entre listas largas de alternativas.
- Integracion en pipelines de evaluacion: al servirse con decisio y vLLM, el modelo puede desplegarse como endpoint HTTP en un servicio de evaluacion que consulte estados y reciba distribuciones de probabilidad.
- Investigacion sobre calibracion: la separacion entre pesos y temperaturas ajustadas por banda permite estudiar el efecto de la calibracion sobre la lectura plana sin modificar los pesos.
- Despliegue de motores de decision en produccion: la documentacion de overrides y de valores por defecto en `/health` facilita la auditoria de configuracion en entornos donde cada cambio de flag debe quedar registrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona el Decision Index y JevBench como boards de evaluacion contra cuyos conjuntos de test publicos se descontaminaron los datos, pero no se incluyen puntuaciones en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos publicados en bf16 suman 24,0 GB de repositorio, por lo que la inferencia en bf16 requiere al menos esa capacidad de memoria mas el overhead del motor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; un modelo de aproximadamente 12.000 millones de parametros en bf16 no cabe en GPUs de consumo con menos de 24 GB de VRAM sin cuantizacion, y no se documentan opciones de cuantizacion.
- Opciones de despliegue: decisio 0.35.0 o superior con `decisio.serve.vllm_engine` (motor vLLM). vLLM por si solo carga los pesos como un checkpoint Gemma 4 ordinario, pero no aplica el layout de prompt, la lectura de letras de opcion, las temperaturas ni la regla de commit de decisio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-v2-commit | 11.959.730.224 | no disponible | Probabilidades calibradas con regla de commit | Apache 2.0 | Hugging Face (tachara-ai) |
| Decisio-12b-tuned-commit | no disponible | no disponible | Probabilidades calibradas con regla de commit (version previa) | Apache 2.0 | Hugging Face (tachara-ai) |
| Decisio-12b-tuned-calibrated | no disponible | no disponible | Probabilidades calibradas sin regla de commit | Apache 2.0 | Hugging Face (tachara-ai) |
| Decisio-12b-tuned-commit-think | no disponible | no disponible | Probabilidades calibradas con regla de commit y modo think | Apache 2.0 | Hugging Face (tachara-ai) |

Los tres repositorios citados comparten los mismos pesos y difieren en el sabor (flavor) y en la configuracion de servicio. No se dispone de datos de parametros, contexto ni rendimiento de esos repositorios en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto de proposito general: esta disenado para responder preguntas tipadas con probabilidades por opcion, y su uso fuera de ese formato requiere la herramienta decisio.
- vLLM por si solo no aplica el layout de prompt, la lectura de letras de opcion, las temperaturas ni la regla de commit; sin decisio 0.35.0 o superior el comportamiento del modelo no es el previsto por el autor.
- Los datos de entrenamiento no se han divulgado, lo que limita la evaluacion independiente de sesgos y de composicion del dataset.
- No se han publicado resultados de benchmarks ni evaluaciones de rendimiento en la informacion disponible.
- La longitud de contexto, los idiomas soportados y las opciones de cuantizacion no estan documentados.
- La licencia es Apache 2.0, heredada del modelo base Gemma 4 de Google; deben respetarse los terminos de `LICENSE` y `NOTICE` del repositorio.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad documentada.
- La calibracion depende de las temperaturas ajustadas por tipo de pregunta y banda de opciones; cambios en la configuracion de servicio pueden alterar las probabilidades reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v2-commit
- Repositorio previo Decisio-12b-tuned-commit: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit
- Repositorio Decisio-12b-tuned-commit-think: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit-think
- Herramienta decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
