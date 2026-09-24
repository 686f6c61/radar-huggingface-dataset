# ydaichi/smolvla_tactile_color_pen

## Resumen

SmolVLA (small vision-language-action) es una familia de modelos compactos de vision-lenguaje-accion desarrollada por Hugging Face para robotica, publicada en el paper arXiv:2506.01844. A diferencia de los VLA masivos como OpenVLA o pi0, SmolVLA busca un equilibrio entre rendimiento y coste computacional, de modo que pueda ejecutarse en hardware de consumo. El modelo que nos ocupa, `ydaichi/smolvla_tactile_color_pen`, es un ajuste fino de `lerobot/smolvla_base` realizado por el usuario ydaichi sobre el dataset `ydaichi/tactile_color_pen`, orientado a una tarea de manipulacion con informacion tactil y una tarea concreta de manejo de un boligrafo.

El modelo tiene 451.043.616 parametros (aproximadamente 451 millones) y un repositorio de 0,9 GB, lo que confirma que se distribuye en precision de 16 bits o inferior. Se enmarca en el ecosistema LeRobot, la libreria de Hugging Face para aprendizaje por imitacion y robotica, y su licencia es Apache 2.0.

Su relevancia actual reside en dos factores: por un lado, demuestra que un VLA de menos de 500 millones de parametros puede ajustarse a tareas concretas en hardware asequible; por otro, forma parte de una serie de ablaciones del autor (junto con variantes como `smolvla_notactile_grab_pen_from_bag` y `smolvla_tactile_grab_pen_from_bag`) que comparan el efecto de incluir senal tactil frente a no incluirla en tareas de agarre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone de vision-lenguaje con un "action expert" condicionado por caracteristicas contextuales |
| Parametros totales | 451.043.616 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, repositorio de 0,9 GB) |
| Idiomas soportados | no disponible (las instrucciones se proporcionan en lenguaje natural, pero no se declara cobertura idiomatica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | ydaichi/tactile_color_pen |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que recibe como entrada varias vistas de camara, el estado sensoriomotor actual del robot y una instruccion en lenguaje natural. Segun la documentacion de LeRobot, estas entradas se codifican en caracteristicas contextuales que condicionan a un "action expert" encargado de generar las acciones de control. El backbone parte de la familia SmolVLM de Hugging Face, reutilizando conocimiento visual y linguistico preentrenado en lugar de entrenar una politica robotica desde cero. Esta variante concreta es un ajuste fino supervisado sobre `lerobot/smolvla_base` usando el dataset `ydaichi/tactile_color_pen`, por lo que no se ha entrenado desde cero.

No se dispone en la informacion proporcionada del numero exacto de tokens o episodios de entrenamiento, de la composicion del dataset, ni de si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificacion especulativa ni de atencion lineal especificas para esta variante. El paper asociado (arXiv:2506.01844) describe SmolVLA como un modelo eficiente capaz de desplegarse en hardware de consumo, pero sus cifras concretas de entrenamiento no estan incluidas en los datos disponibles.

## Capacidades

- Generacion de acciones de control roboticas a partir de observaciones visuales y estado sensoriomotor del robot.
- Percepcion visual multi-camara: admite varias vistas simultaneas como entrada.
- Interpretacion de instrucciones en lenguaje natural para condicionar la politica de actuacion.
- Integracion de senal tactil: el sufijo "tactile" del dataset y del nombre sugiere que la politica consume informacion tactil, aunque no se detalla el canal exacto.
- Ajuste fino especifico para tareas de agarre y manejo de objetos (boligrafo) en un entorno concreto.
- Compatibilidad con el flujo de trabajo de LeRobot para entrenamiento, evaluacion y grabacion de episodios.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, vision generalista fuera del ambito robotico, audio ni modo "thinking".

## Casos de uso

- Manipulacion robotica con tacto: el modelo puede controlar un brazo robotico en tareas de agarre donde la senal tactil ayuda a detectar contacto y fuerza, algo relevante para objetos fragiles o de geometria irregular.
- Agarre y recogida de un boligrafo: la tarea especifica del dataset (`tactile_color_pen`) apunta a recoger un boligrafo concreto; sirve como politica lista para evaluar en ese escenario concreto de laboratorio.
- Investigacion comparativa tacto vs no tacto: dado que el autor publica variantes con y sin senal tactil, este modelo es util como pieza de ablacion para medir el beneficio de anadir tacto en una misma tarea.
- Fine-tuning sobre nuevos datasets LeRobot: al partir de `lerobot/smolvla_base` y ser pequeno (451 M parametros), sirve como punto de partida para reentrenar politicas en otras tareas sin requerir un clúster grande.
- Prototipado en robotica de bajo coste: al poder desplegarse en hardware de consumo, permite iterar rapidamente en laboratorios academicos o proyectos de aficionados con un unico GPU.
- Recogida y evaluacion de episodios: mediante `lerobot-record` se puede ejecutar la politica sobre un robot tipo `so100_follower` y grabar episodios para su posterior analisis.
- Docencia y formacion: sirve como ejemplo manejable de VLA completo para ensenar el flujo percibir-lenguaje-actuar sin necesidad de infraestructura de gama alta.
- Benchmarking interno de pipelines de robotica: util para validar que una cadena LeRobot + PyTorch funciona de extremo a extremo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante no incluye metricas de exito de tarea, ni comparaciones numericas con otras politicas, y los resultados de busqueda solo referencian el paper general de SmolVLA (arXiv:2506.01844) sin cifras concretas para este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 451 M parametros ocupan aproximadamente 0,9 GB de pesos, coherente con el tamano del repositorio; en FP32 serian unos 1,8 GB. La VRAM real depende de la resolucion de las camaras y del tamano del lote de observaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia bastar para inferencia en BF16; se han usado historicamente RTX 3060, RTX 4090, A100 y H100 en flujos LeRobot, aunque no se especifica cual empleo el autor.
- Cabe en GPU de consumo: si, es uno de los objetivos declarados de SmolVLA. Una RTX 3060 de 12 GB o superior es suficiente para inferencia; el ajuste fino requiere mas memoria por los estados del optimizador.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`), PyTorch como runtime subyacente y el ecosistema de Hugging Face para cargar safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 0,9 GB, por lo que el modelo cabe sin problema en disco local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ydaichi/smolvla_tactile_color_pen | 451.043.616 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible (modelo base) | no disponible | no disponible en la informacion | Hugging Face |
| ydaichi/smolvla_notactile_grab_pen_from_bag | no disponible | no disponible | no disponible | Hugging Face |
| ydaichi/smolvla_tactile_grab_pen_from_bag | no disponible | no disponible | no disponible | Hugging Face |
| OpenVLA (familia VLA de mayor tamano) | no disponible en la informacion | no disponible | no disponible | Hugging Face / repositorios publicos |
| pi0 (familia VLA) | no disponible en la informacion | no disponible | no disponible | no disponible |

Las alternativas directas mas cercanas son las otras variantes publicadas por el mismo autor, que comparten arquitectura y solo difieren en el uso de senal tactil y en la tarea. Frente a VLA de mayor tamano como OpenVLA o pi0, SmolVLA apuesta por un modelo mucho mas pequeno y desplegable en hardware de consumo, a costa presumiblemente de generalidad; no se dispone de datos numericos para cuantificar esa diferencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un modelo de robotica entrenado sobre un dataset concreto de laboratorio, heredara los sesgos de ese entorno (iluminacion, disposicion de camaras, tipo de robot).
- Riesgo de alucinacion: en un VLA el termino se traduce en acciones incorrectas o inseguras; la politica puede generar trayectorias erroneas fuera de la distribucion de entrenamiento, con riesgo fisico si controla hardware real.
- Limitacion de generalidad: el ajuste fino esta especializado en la tarea `tactile_color_pen`; es previsible que rinda mal en objetos, tareas o entornos distintos a los del dataset.
- Contexto e idioma: no se declara longitud de contexto ni cobertura idiomatica, por lo que no se puede garantizar el comportamiento con instrucciones en castellano u otros idiomas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos y del modelo base (`lerobot/smolvla_base`) antes de un despliegue en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes, y la model card es la plantilla generica de LeRobot; no hay documentacion adicional, validacion externa ni resultados reproducidos por terceros.
- Produccion: no se recomienda su uso en entornos criticos sin una validacion previa exhaustiva, limites de seguridad en el robot y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ydaichi/smolvla_tactile_color_pen
- Paper SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/ydaichi/tactile_color_pen
- Documentacion de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Variante sin tacto relacionada: https://huggingface.co/ydaichi/smolvla_notactile_grab_pen_from_bag
- Variante tactil relacionada: https://huggingface.co/ydaichi/smolvla_tactile_grab_pen_from_bag
