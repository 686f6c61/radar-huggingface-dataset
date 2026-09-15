# sreetz-nv/so101_teleop_vials_rack_left_GR00T17

## Resumen

El modelo `sreetz-nv/so101_teleop_vials_rack_left_GR00T17` es una política robótica de imitación publicada en HuggingFace por el usuario `sreetz-nv`. No es un modelo de lenguaje: es un *checkpoint* de control viso-lenguaje-acción (VLA) afinado sobre el modelo fundacional abierto GR00T N1.7 de NVIDIA, orientado a razonamiento y habilidades generalizadas en robots humanoides y brazos robóticos. La política se ha entrenado y empaquetado con LeRobot, la librería de aprendizaje por imitación de HuggingFace.

La arquitectura combina un *backbone* Cosmos-Reason2 / Qwen3-VL (visión-lenguaje) con un *transformer* de acciones basado en *flow matching*, que predice acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint ocupa 12,6 GB en el repositorio y contiene 3.144.016.000 parámetros en formato safetensors (equivalente a pesos en fp32). El modelo está especializado en una única tarea: coger un vial y colocarlo en una gradilla ("Pick up the vial and place it in the rack"), sobre un brazo robótico SO-101 con dos cámaras.

Su relevancia es práctica más que investigadora: sirve como ejemplo reproducible de un *fine-tuning* de GR00T N1.7 sobre un conjunto de datos de teleoperación pequeño (75 episodios, 18.250 *frames* a 30 FPS) y como *baseline* para quien quiera replicar el flujo completo de LeRobot en un SO-101 con dos vistas de cámara. No tiene descargas ni valoraciones y no se ha publicado ninguna evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone vision-lenguaje Cosmos-Reason2 / Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye safetensors (12,6 GB, coherente con fp32) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el backbone Qwen3-VL es multilingue, pero la politica no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so101_follower (brazo SO-101) |
| Camaras | ego, external_D455 |
| Entrada (observacion) | `observation.state` (6,), `observation.images.ego` (3, 480, 640), `observation.images.external_D455` (3, 480, 640) |
| Salida (accion) | `action` (6,) |
| Libreria | lerobot (version 0.6.0 declarada en el entrenamiento) |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional abierto y *cross-embodiment* de NVIDIA: la misma arquitectura se aplica a distintos robots cambiando la configuracion de entradas y salidas. Se compone de dos bloques. El primero es un *backbone* de visión-lenguaje (Cosmos-Reason2 / Qwen3-VL) que procesa las imágenes de las cámaras junto con la instrucción en lenguaje natural. El segundo es un *transformer* de acciones entrenado con *flow matching*, que genera las trayectorias de acción condicionadas por la representación del *backbone* y por el estado de propiocepción del robot (`observation.state`, 6 grados de libertad). Esta separación permite reutilizar el conocimiento viso-semántico del VLM mientras se ajusta únicamente la cabeza de acción al robot concreto.

El *fine-tuning* de este checkpoint se hizo con LeRobot sobre el dataset `sreetz-nv/so101_teleop_vials_rack_left`: 75 episodios de teleoperación, 18.250 *frames* a 30 FPS, una única tarea ("Pick up the vial and place it in the rack") y dos cámaras de 480x640. La configuracion de entrenamiento declarada es de 10.000 pasos, *batch size* 32, optimizador AdamW, *learning rate* 1e-4 y semilla 42. No se indica en la informacion disponible si hubo fases de RLHF, DPO u otros ajustes por preferencias; tampoco se detalla la composicion completa del dataset ni el numero de tokens de entrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un brazo SO-101 a partir de dos vistas de cámara y del estado de las articulaciones.
- Ejecución de una tarea concreta de manipulación: coger un vial y depositarlo en una gradilla, tal como se define en el *prompt* de la tarea.
- Condicionamiento por lenguaje: al ser un modelo VLA, la instrucción textual forma parte de la entrada, aunque este checkpoint solo se ha entrenado con una tarea.
- Fusión de dos cámaras: una vista egocéntrica (`ego`) y una vista externa RealSense D455 (`external_D455`), ambas a 480x640.
- Bucle de control a 30 FPS: la frecuencia de captura del dataset de entrenamiento coincide con la frecuencia de control esperada.
- No se ha documentado soporte de *tool calling*, *function calling*, agentes multi-paso, visión de propósito general, audio ni modo de razonamiento explícito (*thinking mode*). Estas capacidades no son aplicables a una política de control motriz.

## Casos de uso

- Manipulación de laboratorio automatizada: recogida y colocación de viales en gradillas, replicando la tarea del dataset. El modelo está entrenado específicamente para esta secuencia, con dos vistas que cubren tanto la aproximación como la posición de la gradilla.
- *Baseline* reproducible para pipelines de aprendizaje por imitación: sirve como punto de partida para validar la instalación de LeRobot 0.6.0, la calibración del SO-101 y el flujo `lerobot-train` / `lerobot-rollout` antes de grabar datos propios.
- Evaluación de *fine-tuning* con datasets pequeños: con solo 75 episodios y 18.250 *frames*, es un caso útil para medir cuánto conocimiento reutiliza el *backbone* preentrenado de GR00T N1.7 frente a entrenar desde cero.
- Pruebas de robustez a cambios de iluminación y posición: al no publicarse métricas de éxito, el checkpoint se puede usar para ejecutar barridos sistemáticos variando posiciones del vial, iluminación y elementos distractores, y registrar tasas de éxito propias.
- Integración en celdas de pick-and-place de pequeño formato: cualquier tarea de "coger objeto y soltarlo en un receptáculo fijo" con un brazo de 6 GdL y dos cámaras es una adaptación directa del esquema de entradas y salidas.
- Docencia y formación en robótica: ejemplo completo y abierto (Apache 2.0) de política VLA con lista de materiales accesible (SO-101 + dos cámaras) para cursos de aprendizaje por imitación.
- Transferencia entre robots del mismo tipo: al ser GR00T un modelo *cross-embodiment*, el checkpoint permite experimentar con la variabilidad entre unidades distintas del mismo SO-101 y comprobar la degradación de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia *model card* incluye la sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni condiciones de prueba en robot real.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos por tarea | no disponible |
| Benchmarks de VLA (por ejemplo, tareas tipo LIBERO) | no disponible |
| MMLU / HumanEval / GSM8K | no aplicable (no es un modelo de lenguaje) |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del recuento de parametros; no confirmado por el autor): aproximadamente 12,6 GB en fp32, 6,3 GB en fp16/bf16, 3,1 GB en int8 y 1,6 GB en int4, sin contar activaciones ni los dos *streams* de imagen de 480x640.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU de 24 GB (RTX 4090, L4, A10G) permite fp32 o bf16 con margen; una de 16 GB (RTX 4080, V100) es suficiente en bf16; para fp32 conviene una A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en bf16 o cuantizado. Con 8-12 GB de VRAM (RTX 3070/3080, RTX 4060 Ti 16 GB) es previsible que funcione en bf16, aunque no hay datos publicados de consumo real.
- Opciones de despliegue: LeRobot con PyTorch (`lerobot-rollout` con `--policy.path=...` y `--strategy.type=base`, o `--strategy.type=record` para guardar episodios). Herramientas de servicio de LLM como vLLM, TGI, llama.cpp u Ollama no son aplicables a este tipo de politica.
- Latencia y throughput: no disponible. El dataset de entrenamiento se capturo a 30 FPS, lo que sugiere un objetivo de control en tiempo real a esa frecuencia, pero no se ha publicado ninguna medicion de latencia por paso ni de *throughput*.
- Requisitos adicionales de plataforma: puerto serie del robot SO-101 y dos camaras OpenCV configuradas con los nombres de clave exactos (`ego` y `external_D455`), a 640x480 y 30 FPS.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| so101_teleop_vials_rack_left_GR00T17 | 3.144.016.000 | Politica VLA afinada (GR00T N1.7) | apache-2.0 | Especializada en una tarea sobre SO-101; sin evaluacion publicada |
| GR00T N1.7 (modelo base de NVIDIA) | no disponible en la informacion proporcionada | Modelo fundacional VLA cross-embodiment | no disponible en la informacion proporcionada | Base sobre la que se ha afinado este checkpoint |
| Otras politicas LeRobot para SO-101 (ACT, Diffusion Policy) | no disponible | Aprendizaje por imitacion | habitualmente apache-2.0 o MIT | Alternativas mas ligeras y sin backbone VLM, pero sin datos comparativos en esta ficha |

## Limitaciones y advertencias

- Sin evaluacion publicada: la model card declara explicitamente que no hay resultados de evaluacion, por lo que se desconoce la tasa de exito real de la politica.
- Especializacion extrema: el entrenamiento cubre una unica tarea ("Pick up the vial and place it in the rack"). Fuera de esa instruccion o de ese montaje fisico, el comportamiento no esta garantizado.
- Dependencia del *setup* fisico: los nombres de camara (`ego`, `external_D455`), sus indices, su montaje y el puerto serie son especificos de la maquina del autor. Cambiar la posicion de una camara invalida la politica.
- Riesgo de sobreajuste: 75 episodios y 18.250 *frames* es un volumen pequeno; es previsible una degradacion ante cambios de iluminacion, posicion de objetos, distractores o una unidad distinta del mismo robot, aunque no hay mediciones que lo cuantifiquen.
- Alucinacion en sentido amplio: como toda politica neuronal, puede generar acciones fisicamente invalidas o inseguras, especialmente fuera de la distribucion de entrenamiento. Requiere limites de par y paradas de emergencia en hardware.
- Idiomas: la model card no declara idiomas soportados. El *backbone* Qwen3-VL es multilingue, pero no hay confirmacion de que la politica responda a instrucciones en castellano.
- Contexto: no se especifica longitud de contexto ni ventana temporal de historial de observaciones.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia del modelo base GR00T N1.7 y de los pesos del *backbone* Cosmos-Reason2 / Qwen3-VL debe verificarse por separado antes de un despliegue en produccion.
- Adopcion nula: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin comunidad que haya validado el checkpoint.
- La busqueda web asociada no devolvio ningun recurso tecnico relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sreetz-nv/so101_teleop_vials_rack_left_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/sreetz-nv/so101_teleop_vials_rack_left
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sreetz-nv/so101_teleop_vials_rack_left
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Guia de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
