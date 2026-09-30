# ssmit203/assignment3_7_act

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion (imitation learning) que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales de control. Este checkpoint concreto, `ssmit203/assignment3_7_act`, es una politica ACT entrenada con la libreria LeRobot de Hugging Face y publicada por el usuario `ssmit203` sobre un dataset propio (`ssmit203/assignment3_7`), aparentemente asociado a un ejercicio academico. Resuelve el problema clasico de control visuomotor: dado un flujo de imagenes de camara y el estado de las articulaciones del robot, generar la secuencia de comandos que el brazo debe ejecutar para completar una tarea manipulativa.

Tecnicamente es un transformer con componente CVAE (autoencoder variacional condicional) de aproximadamente 51,7 millones de parametros, con backbones de vision tipo ResNet para procesar las observaciones. Frente a politicas paso a paso, la prediccion por chunks reduce el error de compounding y suaviza el comportamiento, lo que en el paper original de ACT se tradujo en tasas de exito elevadas en tareas bimanuales de insercion y ensamblaje con hardware de bajo coste.

Su relevancia ahora es doble: por un lado, forma parte del ecosistema LeRobot, que estandariza el entrenamiento, evaluacion y despliegue de politicas roboticas en formato compatible con el Hub; por otro, sirve como ejemplo reproducible de como entrenar y publicar una politica ACT para brazos tipo SO-100/SO-101 con licencia Apache-2.0. No obstante, al ser un checkpoint especifico de un dataset privado y sin validacion publica, debe tratarse como material de estudio o experimentacion mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE y backbone de vision ResNet |
| Parametros totales | 51.668.656 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; ACT procesa observaciones por paso y predice un chunk de acciones, pero el tamano del chunk no se especifica en la model card |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | No aplica / no disponible (politica robotica visuomotora, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Libreria | LeRobot |
| Pipeline | Robotics |
| Dataset de entrenamiento | ssmit203/assignment3_7 |
| Robot objetivo (segun model card) | so100_follower (familia SO-100/SO-101) |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-09-29 |

## Arquitectura y entrenamiento

ACT combina dos ideas: un transformer encoder-decoder y una formulacion CVAE (Conditional Variational Autoencoder). El encoder consume las observaciones actuales (imagenes de una o varias camaras, tipicamente RGB, junto con el vector de posiciones articulares) y las proyecta a una representacion latente. El decoder genera de forma autorregresiva una secuencia de acciones futuras, es decir, un chunk de longitud fija, en lugar de una unica accion. La componente CVAE introduce una variable latente de estilo `z` que modela la variabilidad inherente a las demostraciones humanas, lo que ayuda a capturar multiples formas validas de ejecutar una misma tarea. Las imagenes se procesan con backbones convolucionales tipo ResNet-18 antes de entrar al transformer.

El entrenamiento es aprendizaje por imitacion supervisado (behavioral cloning) a partir de datos de teleoperacion, sin refuerzo ni RLHF/DPO, que no aplican a este tipo de politica. No se especifican en la informacion disponible el numero de episodios, el numero de tokens o muestras, la composicion del dataset `ssmit203/assignment3_7` ni si se aplicaron tecnicas de aumento de datos. El metodo de referencia esta descrito en el paper arXiv:2304.13705, y la receta de entrenamiento sigue el flujo estandar de LeRobot mediante `lerobot-train` con `--policy.type=act`.

## Capacidades

- Control visuomotor por imitacion: genera comandos de actuacion a partir de observaciones visuales y del estado articular del robot.
- Prediccion de action chunks: emite secuencias de acciones coherentes en lugar de pasos aislados, reduciendo el error acumulado y suavizando la trayectoria.
- Modelado multimodal de demostraciones: gracias al componente CVAE, puede representar varias estrategias validas para una misma tarea.
- Aprendizaje de tareas manipulativas ensenadas por teleoperacion: apilado, insercion, traslado de objetos y tareas similares, segun el dataset de entrenamiento.
- Integracion con el ecosistema LeRobot: entrenamiento, evaluacion y ejecucion mediante `lerobot-train` y `lerobot-record`.
- Soporte para brazos tipo SO-100/SO-101 (configuracion `so100_follower` indicada en la model card).
- Tool calling / function calling: no disponible, no aplica a politicas roboticas.
- Razonamiento multi-paso en lenguaje, capacidades multilingues, vision semantica general, audio o thinking mode: no aplica / no disponible.

## Casos de uso

- Manipulacion robotica de laboratorio: entrenar un brazo SO-100 para tareas repetitivas de recogida y colocacion a partir de demostraciones teleoperadas, aprovechando que ACT predice chunks de acciones y produce movimientos mas estables que una politica paso a paso.
- Prototipado academico de aprendizaje por imitacion: usar este checkpoint como referencia para comparar recetas de entrenamiento ACT frente a otras politicas dentro del mismo dataset y hardware.
- Benchmark interno de recetas LeRobot: al estar entrenado con `lerobot-train` y seguir el flujo estandar, sirve para validar pipelines de entrenamiento, registro de checkpoints y evaluacion con `lerobot-record`.
- Automatizacion de tareas de pick-and-place en entornos controlados: con camara fija y posiciones conocidas, la politica puede aprender trayectorias de agarre y deposito a partir de pocos episodios de teleoperacion.
- Evaluacion de robustez ante variaciones de iluminacion o posicion de objetos: util para medir la sensibilidad de ACT cuando el dataset de demostracion es reducido.
- Investigacion en imitacion visuomotora: base para experimentos de ablation sobre longitud de chunk, numero de camaras o estrategias de aumento de datos.
- Formacion y docencia en robotica: ejemplo publico de como publicar una politica entrenada con LeRobot en el Hub, reutilizable en cursos y talleres.
- Integracion con simuladores: punto de partida para transferir la politica a un entorno simulado tipo ALOHA o SO-100 antes de desplegarla en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El paper de referencia (arXiv:2304.13705) reporta tasas de exito elevadas en tareas bimanuales de su propio banco de pruebas, pero no se dispone de resultados especificos, reproducibles ni verificados para este checkpoint `ssmit203/assignment3_7_act`, cuyo numero de descargas era de 0 en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 210 MB solo para pesos (51,7 M de parametros); con activaciones y buffers de vision, el uso real es del orden de 1-2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 105 MB para pesos; uso total en torno a 1 GB.
- GPU recomendadas: cualquier GPU moderna con 4 GB o mas de VRAM es suficiente, como RTX 3050, RTX 3060, RTX 4060, RTX 4090 o superiores; tambien A100, H100 o L4 para despliegues multirrobot.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos.
- Inferencia en CPU: tecnicamente posible por el tamano reducido del modelo, pero no recomendable para control en tiempo real por la latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`) y PyTorch nativo. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF, que no estan orientados a politicas roboticas.
- Latencia y throughput: no disponibles. La model card no publica cifras de frecuencia de control ni de tiempo de inferencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssmit203/assignment3_7_act | ACT (transformer + CVAE) | ~51,7 M | No disponible | Apache-2.0 | Hub de Hugging Face, libreria LeRobot |
| Diffusion Policy (Cheng Chi et al.) | Politica visuomotora basada en difusion | No disponible | No disponible | No disponible | Implementaciones publicas y en ecosistemas de robotica |
| VINN / BC-ConvMLP (baselines del paper ACT) | Imitacion por vecinos / behavior cloning con MLP | No disponible | No disponible | No disponible | Referencias academicas |
| SmolVLA (Hugging Face) | Vision-Language-Action | No disponible | No disponible | No disponible | Ecosistema LeRobot |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada. La diferencia conceptual principal es que ACT predice chunks de acciones con un transformer y un CVAE, mientras que Diffusion Policy genera acciones mediante un proceso de difusion y los baselines tipo VINN/BC-ConvMLP no modelan explicitamente la multimodalidad de las demostraciones.

## Limitaciones y advertencias

- Modelo especifico de una tarea y un dataset: la politica solo reproduce los comportamientos presentes en `ssmit203/assignment3_7`; no generaliza a tareas, objetos o entornos no vistos.
- Cero validacion publica: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de calidad ni reproduccion independiente de resultados.
- Alto riesgo de sobreajuste: al tratarse de un ejercicio con nombre de asignatura, es probable que el dataset sea pequeno y que la politica memorice trayectorias en lugar de aprender comportamientos robustos.
- Sensibilidad al entorno: cambios de iluminacion, posicion de camara, fondo o disposicion de objetos pueden degradar drasticamente el rendimiento (distribution shift).
- Dependencia del hardware: disenado para la configuracion `so100_follower`; usarlo con otro robot o cinematica requeriria reentrenamiento.
- Sin capacidades de lenguaje ni razonamiento simbolico: no admite instrucciones en lenguaje natural ni tool calling.
- Alucinacion: no aplica en el sentido de texto, pero existe riesgo de generar acciones fisicamente invalidas o inseguras si el estado observado se sale de la distribucion de entrenamiento.
- Seguridad fisica: cualquier despliegue en un brazo real debe incluir limites de par, paradas de emergencia y supervision; una politica de imitacion puede colisionar o aplicar fuerzas peligrosas.
- Licencia: los pesos se publican bajo Apache-2.0, que permite uso comercial, pero la licencia del dataset `ssmit203/assignment3_7` deberia verificarse de forma independiente antes de reutilizar el modelo en produccion.
- Documentacion incompleta: la model card no detalla composicion del dataset, numero de episodios, tamano de chunk, horizonte de observacion ni metricas de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssmit203/assignment3_7_act
- Dataset de entrenamiento: https://huggingface.co/datasets/ssmit203/assignment3_7
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
