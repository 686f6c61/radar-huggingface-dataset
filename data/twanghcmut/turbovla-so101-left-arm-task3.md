# twanghcmut/turbovla-so101-left-arm-task3

## Resumen

TurboVLA es una familia de modelos vision-language-action (VLA) orientada a control roboticos por imitacion, desarrollada por el grupo H-EmbodVis. Este checkpoint concreto, `twanghcmut/turbovla-so101-left-arm-task3`, es un ajuste fino del modelo base `H-EmbodVis/TurboVLA` sobre el conjunto de datos `hungho77/so101-left-arm-task3`, compuesto por 159 episodios y 133.763 fotogramas a 30 fps que cubren tres tareas de manipulacion con el brazo izquierdo del robot SO-101.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imagenes de camara en secuencias de acciones de 6 dimensiones (cinco articulaciones mas pinza) para un brazo robotico de bajo coste. Su relevancia radica en que un unico checkpoint atiende las tres tareas, seleccionando cual ejecutar mediante la instruccion textual, y en que combina backbones de vision (DINOv3 ViT-B) y lenguaje (BERT base) con una pila de fusion inicializada desde GroundingDINO.

El repositorio ocupa 0,9 GB y distribuye los pesos en formato PyTorch (`.pt`), no en safetensors ni GGUF. La model card reporta un error absoluto medio (MAE) de 0,909 en evaluacion open-loop in-sample, el mejor de una comparativa de ocho checkpoints sobre las mismas trayectorias, aunque el propio autor advierte de que no existe particion de validacion y de que la metrica mide ajuste, no generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbones DINOv3 ViT-B (vision, entrenado), BERT base (lenguaje, congelado) y pila de fusion inicializada desde GroundingDINO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor menciona despliegue como motores TensorRT via VLA-RT |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint `checkpoints/steps_20000_ema_pytorch_model.pt`) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Dimension estado/accion | 6 (`shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`, `gripper`) |
| Camaras | `top` (360x640) y `wrist` (480x640), redimensionadas a 224x224 |
| Horizonte de accion | 16 pasos (aprox. 0,53 s a 30 fps) |
| Normalizacion | `min_max` en las seis dimensiones, incluida la pinza (apertura continua) |
| Dataset de entrenamiento | `hungho77/so101-left-arm-task3`: 159 episodios, 133.763 fotogramas, 3 tareas |
| Pasos x batch | 20.000 x 128 (2,56 M muestras, aprox. 19 epocas) |
| Hardware de entrenamiento | 1x H100 con DeepSpeed ZeRO-2, 4 h 59 min |
| EMA | 0,999 (el repo entrega los pesos EMA) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual DINOv3 ViT-B que se entrena durante el ajuste fino, un codificador de lenguaje BERT base que permanece congelado y una pila de fusion inicializada a partir de GroundingDINO. La salida es una secuencia de 16 acciones de 6 dimensiones, normalizadas con `min_max` sobre las estadisticas del dataset. El modelo se entreno con atencion `sdpa`, learning rate 5e-5 con 1.000 pasos de warmup y scheduler `warmup_constant_with_factor`, durante 20.000 pasos con batch de 128 en una unica H100 bajo DeepSpeed ZeRO-2, lo que supone aproximadamente 19 epocas sobre las 2,56 M muestras procesadas.

La perdida de accion descendio de 0,36 en el paso 50 a 0,10 en el paso 300 y se estabilizo alrededor de 0,013 al final del entrenamiento. No se documenta uso de RLHF ni DPO: el paradigma es imitacion supervisada pura sobre demostraciones. El checkpoint distribuido corresponde a los pesos EMA (factor 0,999), que segun el autor reducen el MAE de 1,163 a 0,909 en la misma evaluacion. El modelo devuelve acciones normalizadas, por lo que es obligatorio desnormalizarlas con `dataset_statistics.json` antes de enviarlas al robot.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones (cinco articulaciones del brazo SO-101 mas pinza) a partir de observaciones visuales y estado propioceptivo.
- Seleccion de tarea mediante instruccion en lenguaje natural: un unico checkpoint cubre tres tareas y la frase de entrada determina cual se ejecuta.
- Percepcion multimodal con dos camaras simultaneas (vista cenital y vista de muneca), redimensionadas a 224x224.
- Prediccion de horizonte de accion de 16 pasos, invocando la politica cada 16 pasos del bucle de control.
- Manipulacion de objetos: extraer un cubo de un recipiente, abrir y cerrar cajones, apilar cubos.
- Control continuo de la apertura de la pinza mediante normalizacion `min_max` en la dimension del gripper.
- Despliegue optimizado mediante VLA-RT como motores TensorRT (32 ms por llamada en AGX Orin).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion robotica de laboratorio con SO-101: el modelo traduce instrucciones como "abre el cajon superior y coloca el bloque rojo dentro" en trayectorias de 16 pasos, lo que permite montar un banco de experimentacion de bajo coste con un unico checkpoint para tres tareas.
- Investigacion en imitation learning: sirve como referencia reproducible de ajuste fino de TurboVLA sobre un dataset concreto, con configuracion, script de entrenamiento y script de evaluacion incluidos en el repositorio.
- Comparativa de frameworks VLA: al existir checkpoints equivalentes de GR00T N1.6, GR00T N1.7, pi0.5, MolmoAct2, Evo-1 y X-VLA sobre las mismas trayectorias, el modelo permite comparar recetas de entrenamiento con una metrica comun (MAE open-loop).
- Pick-and-place en linea de montaje educativa: la tarea de apilar un cubo rojo sobre uno azul se puede usar como ejercicio de automatizacion con deteccion de objetos y control de pinza continuo.
- Prototipado de politicas en simulacion o banco de pruebas: el horizonte de 0,53 s y la llamada cada 16 pasos facilitan integrar el modelo en bucles de control a 30 fps antes de validar en hardware real.
- Despliegue en robotica embebida: la ruta de VLA-RT con TensorRT (32 ms por inferencia en AGX Orin) permite evaluar el modelo en plataformas de computo limitado sin reentrenar.
- Docencia y divulgacion: el repositorio incluye `modality.json`, estadisticas del dataset y scripts de evaluacion, lo que lo hace util para explicar el flujo completo de datos, normalizacion y evaluacion de un VLA.

## Benchmarks y rendimiento

Evaluacion open-loop in-sample reportada por el autor: seis trayectorias (dos por tarea, episodios 0, 25, 51, 80, 108 y 133), hasta 400 pasos, politica invocada cada 16 pasos, primeros 16 pasos predichos comparados con las acciones registradas. MAE en unidades del dataset; el porcentaje es MAE / 29,97.

| Trayectoria | Tarea | MAE (EMA) |
|---|---|---|
| 0 | 0 | 0,702 |
| 25 | 0 | 0,764 |
| 51 | 1 | 0,722 |
| 80 | 1 | 0,629 |
| 108 | 2 | 1,312 |
| 133 | 2 | 1,326 |
| **Media** | | **0,909 (3,03 %)** |

Pesos no EMA en el mismo paso: 1,163 (3,88 %).

Comparativa con otros checkpoints sobre las mismas trayectorias (cada uno puntuado con el script de su propio framework):

| Modelo | MAE |
|---|---|
| **TurboVLA (este)** | **0,909** |
| X-VLA | 0,997 (proprio = accion previa, no comparable) |
| GR00T N1.6 | 1,345 |
| pi0.7-style pi0.5 (RTC) | 1,366 |
| GR00T N1.7 | 1,440 |
| pi0.5 | 1,459 |
| MolmoAct2 | 1,877 |
| Evo-1 | 2,040 |

No se han publicado tasas de exito en robot real ni resultados en particiones de validacion para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 0,9 GB y los backbones son ViT-B y BERT base, por lo que el checkpoint es ligero en comparacion con VLA de mayor tamano.
- GPU recomendadas: el entrenamiento se realizo en una H100; el autor documenta despliegue en AGX Orin mediante TensorRT con 32 ms por llamada.
- GPU de consumo: no se documenta soporte ni requisitos para RTX 4090 u otras GPU de consumo; no disponible.
- Opciones de despliegue: VLA-RT (motores TensorRT), scripts propios del repositorio (`eval_so101_open_loop.py`, `eval_so101_task3_turbovla.sh`) y el repositorio oficial de TurboVLA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 32 ms por llamada en AGX Orin con TensorRT; no se documenta throughput adicional.
- Nota de control: el horizonte de 16 pasos equivale a unos 0,53 s a 30 fps; `smooth_step = control_hz / 30`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MAE (mismas trayectorias) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboVLA (este) | no disponible | no disponible | 0,909 | Apache 2.0 | Hugging Face |
| GR00T N1.6 | no disponible | no disponible | 1,345 | no disponible | Hugging Face (`twanghcmut/gr00t-n1d6-so101-left-arm-task3`) |
| pi0.5 | no disponible | no disponible | 1,459 | no disponible | Hugging Face (`twanghcmut/pi05-so101-left-arm-task3`) |
| pi0.7-style pi0.5 (RTC) | no disponible | no disponible | 1,366 | no disponible | Hugging Face (`twanghcmut/openpi-pi07-so101-left-arm-task3`) |
| MolmoAct2 | no disponible | no disponible | 1,877 | no disponible | Hugging Face (`twanghcmut/molmoact2-so101-left-arm-task3`) |
| Evo-1 | no disponible | no disponible | 2,040 | no disponible | Hugging Face (`twanghcmut/evo1-so101-left-arm-task3`) |

Las cifras de MAE no son estrictamente comparables entre frameworks, ya que cada checkpoint se puntuo con el script de su propio framework; el propio autor senala que X-VLA usa como propiocepcion la accion previa y no es comparable. No se dispone de datos de parametros ni contexto para ninguno de los modelos de la tabla.

## Limitaciones y advertencias

- Sin particion de validacion: las 159 episodios se usaron para entrenamiento, por lo que el MAE de 0,909 mide ajuste in-sample, no generalizacion, y no equivale a una tasa de exito.
- No validado en robot real: el autor indica que este checkpoint no se ha ejecutado en hardware fisico.
- Antecedente negativo: un checkpoint SmolVLA con una cifra open-loop comparable sobre el conjunto de 11 tareas obtuvo un 0 % de exito en el robot real, lo que sugiere que las metricas open-loop pueden no correlacionar con el rendimiento real.
- Riesgo de alucinacion en el sentido de acciones fisicamente invalidas o inconsistentes con la escena, no documentado cuantitativamente.
- Ambito muy restringido: solo tres tareas del brazo izquierdo del SO-101, con instrucciones en ingles y un unico entorno de laboratorio.
- Normalizacion critica: `predict_action` devuelve acciones normalizadas; es obligatorio desnormalizar con `dataset_statistics.json` antes de enviar comandos al robot. `CONTINUOUS_MASK` en `eval_so101_open_loop.py` debe coincidir con la configuracion de entrenamiento.
- Dependencia del ritmo de control: el horizonte de 16 pasos asume datos a 30 fps; usar otra frecuencia exige ajustar `smooth_step`.
- Idiomas: no se documenta soporte multilingue; las instrucciones de tarea estan en ingles.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias ni soporte; la responsabilidad de validacion en produccion recae en el integrador.
- Sin datos publicados sobre sesgos, contexto maximo ni cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/turbovla-so101-left-arm-task3
- Repositorio oficial de TurboVLA: https://github.com/H-EmbodVis/TurboVLA
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Checkpoint multitarea de 11 tareas del mismo autor: https://huggingface.co/twanghcmut/TurboVLA-SO101-LeftArm-Multitask
- VLA-RT (despliegue TensorRT): https://github.com/VLAOpt/VLA-RT
- Modelo base: https://huggingface.co/H-EmbodVis/TurboVLA
- Checkpoints comparativos:
  - https://huggingface.co/twanghcmut/gr00t-n1d6-so101-left-arm-task3
  - https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
  - https://huggingface.co/twanghcmut/openpi-pi07-so101-left-arm-task3
  - https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
  - https://huggingface.co/twanghcmut/molmoact2-so101-left-arm-task3
  - https://huggingface.co/twanghcmut/evo1-so101-left-arm-task3
  - https://huggingface.co/twanghcmut/xvla-so101-left-arm-task3
