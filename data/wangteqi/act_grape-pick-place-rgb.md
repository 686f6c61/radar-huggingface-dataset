# wangteqi/act_grape-pick-place-rgb

## Resumen

`wangteqi/act_grape-pick-place-rgb` es una politica de robotica basada en ACT (Action Chunking with Transformers), entrenada con la libreria LeRobot de HuggingFace. ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir una accion por paso de tiempo, predice trozos (chunks) de acciones futuras a partir de datos de teleoperacion, lo que reduce el error de composicion y suele elevar la tasa de exito en tareas de manipulacion fina. El modelo lo publica el usuario `wangteqi` y esta pensado para el robot `rebot_b601_follower` con dos camaras Intel RealSense (`d435i` y `d405`).

La politica consume observaciones de estado de 7 dimensiones y dos imagenes RGB de 480x640, y produce un vector de accion de 7 dimensiones. Su unico objetivo documentado es la tarea "Pick and place the grape" (coger y colocar una uva), aprendida a partir de un dataset muy reducido: 3 episodios, 731 fotogramas y 30 FPS. El modelo tiene 51.670.663 parametros (~51,7 M) y se distribuye bajo licencia Apache 2.0 en formato safetensors.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible del flujo completo de entrenamiento y despliegue de ACT en LeRobot y como plantilla para quien quiera entrenar su propia politica de pick-and-place. Conviene advertir desde el principio que la configuracion de entrenamiento registrada (2 pasos, batch size 1) es un test de humo, no un entrenamiento funcional, y que el autor no ha publicado ninguna evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), segun el paper arXiv:2304.13705: transformer encoder-decoder con componente CVAE y backbone de vision ResNet para las imagenes |
| Parametros totales | 51.670.663 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; procesa observaciones de un unico paso de tiempo, con estado `(7,)` y dos imagenes `(3, 480, 640)`) |
| Tipos de cuantizacion | no disponibles; los pesos se publican en safetensors y la model card no documenta cuantizacion |
| Idiomas soportados | no aplica (politica robotica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Robot objetivo | `rebot_b601_follower` |
| Camaras | `d435i`, `d405` (480x640, 30 FPS) |
| Entradas | `observation.state` `(7,)`; `observation.images.d435i` `(3, 480, 640)`; `observation.images.d405` `(3, 480, 640)` |
| Salidas | `action` `(7,)` |
| Tamano del repositorio | 0,2 GB |
| Libreria | LeRobot 0.6.2 |

## Arquitectura y entrenamiento

ACT se describe en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), referenciado en la propia model card. La innovacion central es el *action chunking*: el modelo no emite una accion aislada, sino un bloque de acciones futuras, lo que amortigua el ruido de las demostraciones humanas y evita el estancamiento tipico de las politicas reactivas. Para capturar la variabilidad de las demostraciones, la arquitectura incorpora un CVAE que modela un latente de estilo, y las observaciones visuales se codifican con un backbone convolucional tipo ResNet antes de entrar al transformer. La implementacion concreta de esta politica corresponde a la version de ACT integrada en LeRobot.

El entrenamiento registrado es minimo: 2 pasos, batch size 1, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. El dataset `wangteqi/grape-pick-place-rgb` contiene 3 episodios y 731 fotogramas a 30 FPS para una unica tarea, "Pick and place the grape". No se documenta ningun tipo de RLHF, DPO ni ajuste posterior; es aprendizaje por imitacion supervisado puro. La model card no especifica el numero de tokens ni la composicion ampliada del dataset, ni detalles sobre el tamano del chunk de acciones o el numero de pasos ejecutados por inferencia.

## Capacidades

- Generacion de acciones de control de 7 grados de libertad a partir de observaciones multimodales (estado + dos flujos de imagen RGB).
- Aprendizaje por imitacion de una tarea concreta de pick-and-place ("Pick and place the grape").
- Percepcion visual con dos camaras calibradas simultaneamente (`d435i` y `d405`), lo que permite cierto grado de robustez frente a oclusiones parciales en la vista de una sola camara.
- Prediccion de chunks de acciones (comportamiento intrinseco del metodo ACT), lo que aporta suavidad en la ejecucion frente a politicas de accion unica.
- Integracion nativa con el ecosistema LeRobot: entrenamiento (`lerobot-train`) y despliegue en robot (`lerobot-rollout`).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de lenguaje, vision general, audio ni modo de pensamiento: no es un modelo de lenguaje ni un VLA.

## Casos de uso

- Plantilla reproducible de ACT en LeRobot: sirve para verificar la cadena completa de entrenamiento y despliegue (registro de datos, definicion de politica, rollout en robot) antes de invertir en un entrenamiento real con mas episodios.
- Fine-tuning para recoleccion agricola: partiendo de este punto de control y de un dataset mayor de recoleccion de fruta, se puede reentrenar la politica para tareas de coger y colocar objetos fragiles sobre el mismo robot `rebot_b601_follower`.
- Prototipado de pick-and-place en laboratorio: el modelo define con precision las interfaces de entrada (estado de 7 dimensiones y dos camaras de 480x640) que necesita un banco de pruebas de manipulacion con RealSense d435i y d405.
- Docencia e investigacion en robot learning: es un ejemplo compacto (51,7 M de parametros) para estudiar como se codifica una politica de imitacion, como se registran episodios a 30 FPS y como se evalua el comportamiento en bucle cerrado.
- Comparativa metodologica ACT frente a otras familias: al compartir espacio de observacion y accion, puede emplearse como referencia para contrastar ACT con metodos como Diffusion Policy o politicas VLA en una misma plataforma robotica.
- Base para despliegue en hardware embarcado: por su tamano reducido es viable ejecutar la politica en una GPU de consumo o en un modulo tipo Jetson, lo que facilita experimentos de control en tiempo real sobre el propio robot.
- Reutilizacion de la configuracion de camaras: los parametros de las dos RealSense (480x640, 30 FPS) son directamente reaprovechables para cualquier otra politica que use la misma montura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica, por lo que no existen tasas de exito, numero de ensayos ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 207 MB para los pesos; en FP16, unos 103 MB; en INT8, unos 52 MB. Hay que sumar activaciones y buffers de las dos imagenes de 480x640, que elevan el consumo real muy por encima del peso de los parametros, pero en cualquier caso por debajo de los 2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para control en tiempo real a 30 Hz se recomienda una GPU dedicada en el borde (por ejemplo, Jetson Orin) o una GPU de escritorio cercana al robot.
- Inferencia en CPU: tecnicamente viable por el tamano del modelo, aunque el paso de dos imagenes por el backbone de vision cada 33 ms puede no alcanzar el ritmo de 30 FPS en CPU de gama baja.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con mas de 4 GB.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=wangteqi/act_grape-pick-place-rgb` y `--strategy.type=base`) sobre PyTorch con CUDA. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La busqueda no ha devuelto datos de especificaciones ni de rendimiento de alternativas, por lo que la comparacion se limita a la descripcion metodologica y los datos del propio modelo.

| Modelo | Tipo de metodo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| `wangteqi/act_grape-pick-place-rgb` | ACT (imitacion con chunks de acciones, encoder-decoder transformer + CVAE) | 51,7 M | Apache 2.0 | HuggingFace Hub, libreria LeRobot |
| Otras politicas ACT de LeRobot | ACT (misma arquitectura) | no disponible en la informacion proporcionada | Apache 2.0 (habitual en LeRobot) | HuggingFace Hub |
| Diffusion Policy | Imitacion basada en modelos de difusion | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Implementada en LeRobot |
| Politicas VLA (por ejemplo, SmolVLA) | Vision-language-action | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Ecosistema LeRobot |

## Limitaciones y advertencias

- Entrenamiento practicamente nulo: la model card registra 2 pasos de entrenamiento con batch size 1 y learning rate 1e-05 sobre un dataset de 3 episodios y 731 fotogramas. Con esa configuracion el punto de control no puede considerarse funcional ni utilizable en produccion.
- Datos insuficientes para generalizar: 3 episodios de 731 fotogramas no cubren variaciones de posicion, iluminacion, oclusiones ni distractores, por lo que cualquier despliegue fallara fuera de las condiciones exactas de grabacion.
- Sin evaluacion publicada: el autor no reporta tasa de exito ni numero de ensayos en robot real, de modo que no hay evidencia empirica de su comportamiento.
- Acoplamiento estricto al hardware: la politica esta ligada al robot `rebot_b601_follower` y a las camaras `d435i` y `d405`, con nombres de clave de observacion concretos. Cambiar de brazo o de camaras invalida el modelo sin reentrenamiento.
- Sin capacidades de lenguaje: no interpreta instrucciones en lenguaje natural, ni realiza tool calling, ni razona en varios pasos. La tarea esta fijada en el entrenamiento ("Pick and place the grape").
- Riesgo de sobreajuste y de alucinacion motora: en politicas de imitacion con pocos datos es frecuente que el modelo reproduzca trayectorias memorizadas y falle de forma abrupta ante perturbaciones; no hay medidas de seguridad documentadas.
- Sesgo de dominio: el modelo solo ha visto uvas en el contexto del dataset, por lo que su comportamiento ante otros objetos es indeterminado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al tratarse de un punto de control sin entrenamiento efectivo, la licencia no aporta valor practico hasta que se reentrene con datos propios.
- Riesgo fisico en robot real: cualquier prueba debe hacerse con limites de par, paradas de emergencia y espacio de trabajo despejado, dado que el modelo no ofrece garantias de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangteqi/act_grape-pick-place-rgb
- Dataset de entrenamiento: https://huggingface.co/datasets/wangteqi/grape-pick-place-rgb
- Paper de ACT (pagina de HuggingFace): https://huggingface.co/papers/2304.13705
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wangteqi/grape-pick-place-rgb
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento (il_robots): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
