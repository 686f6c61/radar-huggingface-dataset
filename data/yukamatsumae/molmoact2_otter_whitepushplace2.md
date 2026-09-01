# yukamatsumae/molmoact2_otter_whitepushplace2

## Resumen

El modelo `yukamatsumae/molmoact2_otter_whitepushplace2` es un policy de control robótico entrenado con la librería LeRobot de HuggingFace, especializado en la tarea de empujar y colocar objetos blancos (WhitePushPlace). Se basa en MolmoAct2, un modelo de razonamiento de acción desarrollado por el Allen Institute for AI (AI2), que combina un backbone de visión-lenguaje (VLM) con capacidades de razonamiento espacial y encarnado. Este checkpoint concreto, publicado por el usuario yukamatsumae, es un fine-tuning del modelo base para una tarea específica de manipulación, utilizando el tipo de policy ACT (Action Chunking with Transformers).

El modelo tiene 5.442.196.272 parámetros (aproximadamente 5,44 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su relevancia radica en que demuestra la aplicación práctica de modelos de razonamiento de acción de código abierto en robótica, siguiendo la línea de investigación de MolmoAct2 presentada en el artículo "MolmoAct2: Action Reasoning Models for Real-world Deployment". Al estar integrado en el ecosistema LeRobot, facilita la reproducción, evaluación y despliegue en entornos robóticos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy ACT (Action Chunking Transformer) sobre backbone MolmoAct2 (VLM) |
| Parametros totales | 5.442.196.272 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking Transformer), un enfoque de aprendizaje por imitacion que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado. El backbone es MolmoAct2, un VLM especializado en razonamiento espacial y encarnado, entrenado sobre un corpus de 3,3 millones de muestras con una receta de "especializar y ensayar" (specialize-then-rehearse), segun el articulo de investigacion. El checkpoint concreto se entreno con LeRobot sobre el dataset `yukamatsumae/WhitePushPlace_20260827_004728`, que contiene demostraciones de la tarea de empujar y colocar objetos blancos. No se dispone de detalles adicionales sobre el numero de tokens de entrenamiento, el uso de RLHF/DPO o tecnicas de regularizacion especificas para este fine-tuning.

## Capacidades

- Control robotico de manipulacion: ejecuta politicas de empujar y colocar objetos en un entorno fisico o simulado.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integracion con LeRobot: compatible con el flujo de trabajo de LeRobot para entrenamiento, evaluacion e inferencia en robots como SO-100.
- Razonamiento de accion: hereda las capacidades de MolmoAct2 para razonar sobre acciones en el espacio fisico, aunque limitado a la tarea especifica.
- No incluye capacidades de lenguaje natural, vision general o tool calling, al ser un policy de control puro.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robotico para empujar y colocar objetos en posiciones definidas, reduciendo la necesidad de programacion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas ACT en tareas de manipulacion con objetos de colores especificos.
- Desarrollo de robots de asistencia en laboratorios: puede integrarse en sistemas que requieran organizar materiales (por ejemplo, tubos de ensayo o placas) mediante empuje y colocacion.
- Evaluacion de politicas en simulacion: permite probar algoritmos de control en entornos simulados antes de desplegarlos en hardware real, gracias a la compatibilidad con LeRobot.
- Benchmarking de modelos de razonamiento de accion: util para comparar el rendimiento de MolmoAct2 frente a otros backbones en tareas de manipulacion concretas.
- Educacion en robotica: como ejemplo de fine-tuning de un VLM para control robotico, puede usarse en cursos de robotica y aprendizaje automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas de evaluacion (exito en tarea, precision de posicion, etc.) en su model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada: con 5,44 mil millones de parametros en precision fp32, se requieren aproximadamente 22 GB de VRAM solo para los pesos. Con cuantizacion a 8 bits (no publicada) se reduciria a unos 11 GB, y a 4 bits a unos 6 GB, aunque no se ofrecen versiones cuantizadas.
- GPU recomendadas: para inferencia en fp32, una GPU con 24 GB o mas (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantizacion, podria caber en GPUs de 12-16 GB (RTX 3080, RTX 4080).
- Opciones de despliegue: LeRobot soporta inferencia con PyTorch en GPU. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, al ser un modelo de robotica, no de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y del tamaño de los chunks de accion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| molmoact2_otter_whitepushplace2 (este) | 5,44B | no disponible | Empujar y colocar objetos blancos | Apache-2.0 | HuggingFace |
| molmoact2_otter_yellowpushplace_lora | no disponible | no disponible | Empujar y colocar objetos amarillos (LoRA) | Apache-2.0 | HuggingFace |
| molmoact2_otter_graspandpush_20260805 | no disponible | no disponible | Agarrar y empujar | Apache-2.0 | HuggingFace |
| MolmoAct2 (base) | no disponible | no disponible | Razonamiento de accion general | Apache-2.0 | GitHub/HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a la disponibilidad y la tarea especifica.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo es valido para la tarea de empujar y colocar objetos blancos; no generaliza a otros objetos, colores o tareas sin reentrenamiento.
- Dependencia del entorno: requiere un robot compatible con LeRobot (por ejemplo, SO-100) y un espacio de trabajo calibrado; cambios en la configuracion fisica pueden degradar el rendimiento.
- Riesgo de sobreajuste: al ser un fine-tuning sobre un dataset especifico, puede no comportarse bien ante variaciones en la iluminacion, posicion de la camara o textura de los objetos.
- Sin capacidades de lenguaje o vision general: no puede interpretar instrucciones en lenguaje natural ni realizar tareas de vision por computadora fuera del contexto de control.
- Sesgos del dataset: el dataset de entrenamiento puede contener sesgos en la forma de demostrar la tarea, lo que afecta la robustez del policy.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo base MolmoAct2 y de los datasets asociados.
- Sin informacion de seguridad: no se documentan medidas de seguridad para operacion en entornos con presencia humana; se debe usar con precaucion en aplicaciones reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yukamatsumae/molmoact2_otter_whitepushplace2
- Repositorio oficial de MolmoAct2 (GitHub): https://github.com/allenai/molmoact2
- Articulo de investigacion (arXiv): https://arxiv.org/abs/2605.02881
- Repositorio de MolmoAct (predecesor): https://github.com/allenai/MolmoAct
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
