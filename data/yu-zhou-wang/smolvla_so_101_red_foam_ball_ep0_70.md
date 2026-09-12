# Yu-Zhou-Wang/smolvla_so_101_red_foam_ball_ep0_70

## Resumen

SmolVLA SO-101 red foam ball (ep0–70) es un ajuste fino del modelo vision-lenguaje-accion (VLA) `lerobot/smolvla_base` publicado por el usuario Yu-Zhou-Wang. Está entrenado para una unica tarea de manipulacion robotica sobre un brazo SO-101: coger una pelota de espuma roja y depositarla en un contenedor. El entrenamiento usa las 71 demostraciones (episodios 0 a 70, 22 184 fotogramas a 30 Hz) del dataset `Jingyi-Z/sotac`, con las camaras remapeadas de `top`/`wrist` a `camera1`/`camera2` y una tercera camara ficticia.

El modelo tiene 450 046 176 parametros (unos 450 M) y un repositorio de 0,9 GB en safetensors. Solo se ha entrenado el experto de acciones (`train_expert_only=True`) manteniendo congelado el codificador visual, con 30 000 pasos de AdamW (pico 1e-4, decaimiento coseno con 1 000 pasos de calentamiento hasta 2,5e-6), lote de 8 y precisión mixta. La pérdida final de entrenamiento fue de 0,022 tras unas 10,8 epocas. La ejecución se hizo en DeltaAI (proyecto `bijp`, job `21900700`) sobre una GPU A40 durante 1,85 horas.

Su relevancia es practica: es un ejemplo reproducible y ligero de adaptacion de un VLA de 450 M a una tarea concreta con un dataset pequeno, que cabe en GPU de consumo y se integra con el ecosistema LeRobot. No se han publicado metricas de evaluacion en el mundo real ni resultados de benchmarks en la informacion disponible, por lo que debe tratarse como un checkpoint de investigacion o prototipo, no como un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) sobre `lerobot/smolvla_base`; experto de acciones entrenado, codificador visual congelado |
| Parametros totales | 450 046 176 (unos 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; fragmento de acciones (`chunk_size`) de 50 pasos, de los que se ejecutan 10 en bucle abierto (~0,33 s a 30 Hz) |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors en la precision de entrenamiento; no se documentan variantes GGUF, INT8 o INT4) |
| Idiomas soportados | Instruccion de lenguaje en ingles; no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors`, repositorio de 0,9 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA del ecosistema LeRobot: un modelo vision-lenguaje (VLM) pequeno que consume imagenes de camaras y una instruccion en lenguaje natural, acoplado a un "experto de acciones" que genera trayectorias de acciones continuas mediante flow matching. En este ajuste fino concreto, el autor congela el codificador visual (`freeze_vision_encoder=true`) y entrena unicamente el experto de acciones (`train_expert_only=true`), de modo que el grueso de la capacidad visual y linguistica procede del modelo base `lerobot/smolvla_base`. Los detalles exactos de la composicion del VLM base (numero de tokens de preentrenamiento, mezcla de datos, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

El entrenamiento usa las 71 demostraciones del dataset `Jingyi-Z/sotac` (22 184 fotogramas a 30 Hz, teleoperacion sobre un seguidor SO-101 de 6 posiciones articulares, sin tacto). La receta incluye aumento de datos de color y geometria sobre las imagenes, remapeo de las camaras `top` y `wrist` a `camera1` y `camera2`, y una tercera camara ficticia (`empty_cameras=1`) para rellenar la entrada esperada por la politica. Se ejecutaron 30 000 pasos con lote de 8, 8 workers, semilla 1000, AMP activado y decaimiento coseno alineado con el del modelo base (`scheduler_decay_steps=30000`), alcanzando una perdida final de 0,022. El autor indica que existe un checkpoint anterior entrenado con solo 21 demostraciones (`Yu-Zhou-Wang/smolvla_so_101_red_foam_ball`), del que esta version es la ampliada.

## Capacidades

- Control robotico de una unica tarea: coger una pelota de espuma roja y colocarla en un contenedor sobre un brazo SO-101 de 6 grados de libertad.
- Generacion de fragmentos de acciones continuas (`chunk_size=50`) con ejecucion en bucle abierto de 10 pasos por inferencia.
- Condicionamiento por instruccion en lenguaje natural: la politica acepta la orden textual (por ejemplo, `"Pick up the red foam ball and place it into the container"`), aunque solo se ha entrenado con esa tarea.
- Entrada multimodal de imagenes: dos camaras reales (superior y de muneca) mas una ranura de camara ficticia, ademas del estado de las articulaciones.
- Integracion con el ecosistema LeRobot mediante `SmolVLAPolicy` y herramientas como `lerobot-record`.
- Tokenizador de texto provisto por `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` (los pesos del VLM ya estan incluidos en `model.safetensors`).
- No soporta tool calling, function calling, razonamiento multi-paso generico, vision de proposito general, audio ni modo de razonamiento explicito: no hay evidencia de ello en la informacion disponible.

## Casos de uso

- Replicacion academica de un flujo VLA completo: sirve como referencia para reproducir un ajuste fino de SmolVLA sobre un dataset propio de 71 demostraciones en menos de dos horas de GPU A40, y comparar la receta con el checkpoint de 21 demostraciones del mismo autor.
- Prototipado de picking en laboratorio: el modelo ejecuta directamente la tarea "coger la pelota roja y dejarla en el contenedor", util como punto de partida para demostraciones de robotica de manipulacion con un SO-101 y dos camaras.
- Base para nuevos ajustes finos con pocos datos: al entrenar solo el experto de acciones con el codificador visual congelado, el coste de reentrenamiento para una tarea nueva similar es bajo y cabe en una sola GPU.
- Evaluacion de latencia en bucle cerrado: con 10 acciones en bucle abierto a 30 Hz, el modelo permite medir si una politica de 450 M alcanza el presupuesto de ~0,33 s por inferencia en hardware de consumo.
- Banco de pruebas de aumento de datos visual: al habilitarse aumento de color y geometria sobre imagenes, es util para estudiar la robustez del VLA ante cambios de iluminacion o punto de vista en una tarea de agarre.
- Demostraciones docentes de VLA: el modelo se carga con unas pocas lineas de Python (`SmolVLAPolicy.from_pretrained`) y un comando `lerobot-record`, lo que facilita usarlo en talleres o practicas de robotica.
- Ablacion de entradas sensoriales: al no usar tacto, permite comparar el rendimiento de una politica puramente visual frente a variantes que si incorporan sensores tactiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato numerico de rendimiento aportado por el autor es la perdida final de entrenamiento: 0,022 tras 30 000 pasos (aproximadamente 10,8 epocas) con lote de 8. No hay tasas de exito en robot real, ni MMLU, HumanEval, GSM8K ni metricas de manipulacion (por ejemplo, porcentaje de agarres correctos), ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para pesos: unos 0,9 GB en bf16/fp16 y unos 1,8 GB en fp32; el repositorio completo ocupa 0,9 GB. A esto hay que sumar activaciones y procesamiento de imagen de dos camaras reales mas la ficticia, por lo que conviene reservar margen adicional (no cuantificado en la informacion disponible).
- GPU recomendadas: el autor entreno en una NVIDIA A40 (48 GB) durante 1,85 horas; para inferencia son suficientes GPUs muy inferiores.
- Cabe en GPU de consumo: si, con ~450 M de parametros cabe en cualquier GPU moderna con 8-12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Tambien es viable en CPU para pruebas no criticas en tiempo real, aunque no hay mediciones publicadas.
- Opciones de despliegue: la via documentada es LeRobot (carga con `SmolVLAPolicy.from_pretrained` y ejecucion con `lerobot-record` en LeRobot 0.6). vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint; no hay datos disponibles sobre su compatibilidad.
- Latencia y throughput: no disponibles. El unico limite conocido es el presupuesto de control de 10 acciones en bucle abierto a 30 Hz (~0,33 s por inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`smolvla_so_101_red_foam_ball_ep0_70`) | 450 046 176 | Fragmento de 50 acciones, 10 en bucle abierto | Ajuste fino de SmolVLA base con 71 demostraciones (22 184 fotogramas) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| `Yu-Zhou-Wang/smolvla_so_101_red_foam_ball` | 450 M (misma base) | Igual (chunk 50 / 10 pasos) | Ajuste fino con 21 demostraciones | Apache 2.0 | Hugging Face (checkpoint previo citado por el autor) |
| `lerobot/smolvla_base` | 450 M | Igual (chunk 50 / 10 pasos) | Modelo base generalista de SmolVLA | Apache 2.0 (segun la informacion disponible) | Hugging Face (modelo base declarado) |

No se dispone de datos de rendimiento comparativos entre estos tres checkpoints, ni de resultados de otros VLA de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a parametros, origen de datos y licencia.

## Limitaciones y advertencias

- Modelo de tarea unica: solo se ha entrenado para coger una pelota de espuma roja y dejarla en un contenedor; no generaliza a otras instrucciones aunque acepte texto como entrada.
- Dataset muy pequeno: 71 demostraciones y 22 184 fotogramas procedentes de una sola configuracion de laboratorio; hay riesgo alto de sobreajuste al entorno, la iluminacion y la disposicion exacta de las camaras.
- Sin resultados de evaluacion en robot real: no se publican tasas de exito, por lo que no se puede afirmar nada sobre su fiabilidad efectiva.
- Dependencia del montaje de camaras: el preprocesador espera el remapeo `top` a `camera1` y `wrist` a `camera2`, y un tercer canal de camara ficticio; un montaje distinto invalida las entradas.
- No usa informacion tactil, lo que puede degradar el agarre en situaciones de contacto ambiguo.
- Control en bucle abierto: se ejecutan 10 acciones sin realimentacion visual entre inferencias (~0,33 s a 30 Hz), lo que limita la capacidad de reaccion ante perturbaciones.
- Idioma: la instruccion de entrenamiento esta en ingles; no se documenta soporte multilingue.
- Sin datos de sesgos: no se ha publicado ningun analisis de sesgo, y al ser un modelo de accion sobre objetos fisicos el concepto de sesgo aplica sobre todo a la seleccion de objetos y escenas del dataset.
- Riesgo de alucinacion en el sentido de ejecutar la tarea cuando el objeto no esta presente o esta en una posicion no vista; no hay evaluacion de estos casos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de `lerobot/smolvla_base` conviene verificar las condiciones y atribuciones de ese modelo base y del dataset `Jingyi-Z/sotac` antes de un despliegue comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion registradas como 2026-09-11, posteriores a la fecha habitual de publicacion de otros modelos; conviene confirmar la procedencia y la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yu-Zhou-Wang/smolvla_so_101_red_foam_ball_ep0_70
- Checkpoint previo (21 demostraciones): https://huggingface.co/Yu-Zhou-Wang/smolvla_so_101_red_foam_ball
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jingyi-Z/sotac
- Tokenizador asociado: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Ejecucion de W&B citada por el autor: proyecto `smolvla_so_101`, run `zlr5nkrd` (no se proporciona URL directa)
- Codigo de entrenamiento citado por el autor: `/work/nvme/bijp/ywang10/smolvla_so_101` (ruta local en DeltaAI, no es un enlace publico)
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor, su dataset o su paper; los unicos enlaces verificables son los de Hugging Face listados arriba.
