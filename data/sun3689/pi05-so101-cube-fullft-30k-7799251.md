# sun3689/pi05-so101-cube-fullft-30k-7799251

## Resumen

`sun3689/pi05-so101-cube-fullft-30k-7799251` es un repositorio de archivo de entrenamiento, no una release de modelo convencional. Contiene el directorio completo de una ejecucion de ajuste fino (run `7799251`) del modelo base `lerobot/pi05_base` —Pi0.5, el modelo vision-language-action de Physical Intelligence distribuido en el ecosistema LeRobot— orientado a control robotico de un brazo SO-101. El entrenamiento se realizo con LeRobot 0.6.1 y finalizo el 13 de octubre de 2026, con seis checkpoints (5k, 10k, 15k, 20k, 25k y 30k pasos) y sus estados de optimizador, scheduler y RNG.

La tarea aprendida es unica y muy concreta: "Put the pink cylinder and the gray cube in the pink bowl", a partir de un dataset de imitacion de 50 episodios y 44.950 fotogramas a 30 FPS, con camaras frontal y de muneca y seis canales de posicion articular. El ajuste fino cubre el encoder de vision, el VLM y el experto de acciones con precision mixta BF16 y gradient checkpointing, sobre 2 GPUs y batch global 16 durante 30.000 pasos (unas 10,68 epocas equivalentes en muestras).

Su relevancia es practica para quien investiga en robotica con LeRobot: el repositorio documenta la configuracion exacta de entrenamiento, incluye los pipelines de preprocesado y postprocesado guardados con las estadisticas de normalizacion, y permite reanudar el entrenamiento o comparar checkpoints. En cambio, no acredita ninguna tasa de exito en robot real: no hubo split de validacion ni evaluacion fisica, y la model card marca explicitamente `inference: false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de Pi0.5: encoder de vision + VLM + experto de acciones entrenado con objetivo de flow matching |
| Parametros totales | no disponible (el repositorio no publica el recuento; el modelo base es `lerobot/pi05_base` y el tokenizer empleado es el de PaliGemma 3B) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors en BF16 (capas de vision, proyector y normalizacion en FP32) |
| Idiomas soportados | en (ingles); las instrucciones de tarea se registran en ingles |
| Licencia | gemma (licencia del modelo base `lerobot/pi05_base`) |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Pipeline | robotics (vision-language-action, imitation-learning) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | fatdove/so101-cylinder-cube-bowl_20260925_005955 |
| Tamano del repositorio | 146,9 GB (6 checkpoints con pesos y estados de entrenamiento) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La politica sigue el diseno Pi0.5: un encoder de vision y un VLM que procesan las observaciones (`observation.images.front`, `observation.images.wrist`, `observation.state`) junto con la instruccion en lenguaje natural, y un experto de acciones que genera acciones continuas mediante flow matching. El ajuste fino se aplico al encoder de vision, al VLM y al experto de acciones, es decir, un fine-tune completo y no un adaptador. Las acciones son posiciones articulares absolutas con chunk size 50 y `n_action_steps=50`, normalizadas con QUANTILES tanto en estado como en accion. El wrapper DDP congela ocho tensores que no reciben gradiente del objetivo de flow matching, lo que mantiene el alcance efectivo de fine-tune completo reduciendo el consumo de memoria.

La configuracion de entrenamiento es: BF16 con capas de vision, proyector y normalizacion en FP32 nativo; gradient checkpointing activado; 2 GPUs con batch 8 por GPU (global 16); 30.000 pasos; AdamW con LR pico `2.5e-5`, betas `(0.9, 0.95)`, epsilon `1e-8`, weight decay `0.01` y grad clip norm `1.0`; 1.000 pasos de warmup y decaimiento coseno hasta `2.5e-6`; decodificacion con PyAV; sin aumentacion de imagen, sin EMA y sin recorte de fotogramas inactivos; semilla 1000. Los datos de preentrenamiento del modelo base no se detallan en la informacion disponible. La perdida de entrenamiento registro una media de aproximadamente 0,0054 en los ultimos 500 pasos.

## Capacidades

- Generacion de acciones motoras continuas para un brazo SO-101: salida de 50 pasos de accion por inferencia en forma de posiciones articulares absolutas.
- Ejecucion de una tarea de manipulacion pick-and-place guiada por instruccion textual en ingles ("Put the pink cylinder and the gray cube in the pink bowl").
- Percepcion multimodal con dos camaras simultaneas (frontal y de muneca) mas el estado articular de seis canales.
- Aprendizaje por imitacion: la politica se entrena a partir de demostraciones teleoperadas, sin recompensa explicita.
- Reanudacion de entrenamiento: cada checkpoint incluye estado de optimizador, scheduler y RNG, ademas de las estadisticas de normalizacion.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision general de imagenes naturales, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no disponible; el unico idioma declarado es el ingles.

## Casos de uso

- Manipulacion pick-and-place en banco de laboratorio: desplegar la politica sobre un SO-101 real para depositar un cilindro rosa y un cubo gris en un cuenco rosa, usando las camaras frontal y de muneca como unica entrada perceptiva.
- Investigacion en aprendizaje por imitacion: analizar como evoluciona la perdida y el comportamiento entre los checkpoints de 5k a 30k pasos, ya que el repositorio conserva los seis de forma explicita.
- Reanudacion o extension del entrenamiento: cargar `training_state/` de cualquier checkpoint para continuar el ajuste con el mismo optimizador y scheduler, tras corregir las rutas especificas de la maquina original en la configuracion guardada.
- Fine-tune derivado sobre tareas proximas: usar el checkpoint de 30.000 pasos como inicializacion para nuevas tareas del mismo brazo SO-101 con un dataset propio, aprovechando que se trata de un fine-tune completo.
- Replicabilidad y docencia: el repositorio guarda pipelines de preprocesado y postprocesado listos para usar con `make_pre_post_processors`, lo que permite reproducir la inferencia paso a paso en un entorno LeRobot 0.6.1.
- Validacion de infraestructura de entrenamiento distribuido: la configuracion documentada (DDP en 2 GPUs, batch 16, BF16, gradient checkpointing) sirve como referencia para calibrar memoria y throughput en pipelines VLA similares.
- Benchmark interno de checkpoints: comparar los seis checkpoints sobre la tarea objetivo en el robot real, dado que el autor advierte que el checkpoint final no esta establecido como el mejor para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hubo split de validacion retenido ni evaluacion en robot real, y que no se reclama ninguna tasa de exito en la tarea. La unica metrica registrada es la perdida de entrenamiento:

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de entrenamiento (media, ultimos 500 pasos) | ~0,0054 | Perdida del objetivo de flow matching, no equivale a rendimiento en tarea |
| Tasa de exito de la tarea | no disponible | Sin evaluacion en robot real |
| Validacion retenida | no disponible | No se creo split de validacion |

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explicita. El repositorio completo ocupa 146,9 GB, pero incluye seis checkpoints con estados de optimizador; para inferencia solo hay que descargar el subdirectorio `checkpoints/030000/pretrained_model`, muy inferior en tamano.
- GPU de entrenamiento: la ejecucion original uso 2 GPUs con batch 8 por GPU, precision mixta BF16 y gradient checkpointing. El modelo exacto de GPU no se especifica en la informacion disponible.
- GPU de inferencia: no disponible. Al ser una politica VLA de robotica, no esta pensada para GPUs de consumo tipo RTX 4090 en un flujo estandar de texto, aunque la carga de la politica en `cuda` es la ruta documentada.
- Despliegue: exclusivamente mediante LeRobot 0.6.1 y `lerobot.policies.pi05.modeling_pi05.PI05Policy`, con `make_pre_post_processors` para pre y postprocesado. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y la model card declara `inference: false`.
- Tokenizer: requiere acceso al repositorio restringido `google/paligemma-3b-pt-224` y autenticacion previa con `hf auth login` si no esta en cache.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de frecuencia de control alcanzable en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sun3689/pi05-so101-cube-fullft-30k-7799251 | no disponible (deriva de Pi0.5 base) | no disponible | Sin evaluacion publicada; perdida final ~0,0054 | gemma | Publico en HuggingFace, 0 descargas, sin cuantizaciones |
| lerobot/pi05_base | no disponible en la informacion proporcionada | no disponible | No disponible | gemma | Modelo base publico del que parte este fine-tune |
| Otras alternativas VLA del ecosistema LeRobot (p. ej. pi0, SmolVLA) | no disponible en la informacion proporcionada | no disponible | No disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre alternativas comparables, por lo que no es posible completar la comparativa con datos verificados mas alla del propio modelo base.

## Limitaciones y advertencias

- No hay evidencia de rendimiento: sin split de validacion, sin evaluacion en robot real y sin tasa de exito declarada. La perdida de 0,0054 en entrenamiento no garantiza que la politica funcione fisicamente.
- El checkpoint final no esta establecido como el mejor para despliegue; el propio autor recomienda comparar checkpoints sobre la tarea objetivo.
- Especializacion extrema: la politica aprende una unica instruccion de tarea y no debe esperarse generalizacion a otras ordenes, objetos o entornos sin un nuevo ajuste.
- Dataset muy reducido: 50 episodios y 44.950 fotogramas de un unico montaje, lo que limita la diversidad de posiciones, iluminacion y condiciones.
- Idioma: solo ingles declarado; no hay evidencia de funcionamiento con instrucciones en castellano u otros idiomas.
- Repositorio de archivo, no de despliegue: 146,9 GB con estados de optimizador y rutas especificas de la maquina original en la configuracion guardada, que hay que actualizar antes de reanudar el entrenamiento.
- Dependencia de un tokenizer con acceso restringido (`google/paligemma-3b-pt-224`), lo que anade un paso de autenticacion y aceptacion de condiciones.
- Requisitos de calibracion y orden articular: la inferencia exige mantener el orden de articulaciones registrado y una calibracion del robot compatible.
- Licencia Gemma: el uso comercial y la redistribucion quedan sujetos a los terminos de la licencia Gemma del modelo base; conviene revisarlos antes de cualquier despliegue productivo.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de bajos recursos.
- Riesgo de sobreajuste al montaje del dataset y de fallo silencioso: al no existir evaluacion, no hay estimacion de la tasa de alucinacion de acciones ni de recuperacion ante perturbaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sun3689/pi05-so101-cube-fullft-30k-7799251
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/fatdove/so101-cylinder-cube-bowl_20260925_005955
- Tokenizer PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224
