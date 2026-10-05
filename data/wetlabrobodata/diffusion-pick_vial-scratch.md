# WetLabRoboData/diffusion-pick_vial-scratch

## Resumen

`diffusion-pick_vial-scratch` es una política de robotica basada en difusion (diffusion policy) publicada por el usuario WetLabRoboData dentro del ecosistema LeRobot. No es un modelo de lenguaje: se trata de un modelo de imitacion visuomotora entrenado para ejecutar una tarea concreta de manipulacion, `pick_vial`, sobre un robot UR3e bimanual equipado con tres camaras. El checkpoint tiene 262.813.031 parametros (aproximadamente 263 M) y se distribuye en formato safetensors, con un repositorio de 1,1 GB.

La relevancia de esta ficha es acotada pero clara: es un ejemplo de politica de difusion "from scratch", es decir, entrenada unicamente con los datos de la propia tarea, no un fine-tuning de un modelo generalista. El autor reporta una evaluacion de 20 episodios con 20 exitos (20/20) sobre la tarea objetivo, con los videos de rollout y los resultados por episodio publicados en un dataset aparte. Esto lo convierte en un artefacto util como referencia reproducible de imitacion en robotica de laboratorio.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificacion, y esta pensado para cargarse directamente con la clase `DiffusionPolicy` de la libreria LeRobot. La model card no especifica idiomas, ni detalles de la arquitectura interna, ni benchmarks estandar de robotica, por lo que buena parte de las especificaciones habituales figuran aqui como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (familia "diffusion" de LeRobot); detalles internos no disponibles |
| Parametros totales | 262.813.031 (aproximadamente 263 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Horizonte de observacion y chunk de acciones no especificados |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors (precision no declarada) |
| Idiomas soportados | no disponible; modelo de robotica sin interfaz de lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tarea objetivo | pick_vial |
| Robot | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-pick_vial |
| Variante | scratch (entrenada solo con los datos de esta tarea) |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La model card identifica la familia de politica como "diffusion (LeRobot)" y la variante como "scratch", entrenada exclusivamente con el dataset `WetLabRoboData/lerobot-data-pick_vial`. La carga se realiza con `DiffusionPolicy.from_pretrained(...)` desde `lerobot.policies.diffusion.modeling_diffusion`, lo que confirma que el checkpoint es compatible con la implementacion de diffusion policy incluida en LeRobot. El modelo opera sobre un robot UR3e bimanual con tres camaras como entrada sensorial y produce acciones de control.

No se detalla en la informacion disponible el backbone de codificacion visual, el numero de pasos de difusion empleados en inferencia, el horizonte de observacion, el tamano del chunk de acciones, ni la composicion exacta del dataset de entrenamiento (numero de episodios, frecuencia de captura, resolucion de imagen). Tampoco se indica si hubo etapas posteriores de refinamiento tipo RLHF o DPO, algo por otra parte poco habitual en politicas de imitacion. Como contexto general de la familia, las diffusion policies condicionan un proceso de denoising sobre secuencias de acciones, pero los hiperparametros concretos de este checkpoint no estan publicados en la informacion proporcionada.

La trazabilidad si esta documentada: el autor indica que el modelo fue reorganizado desde `WetLabRoboData/lerobot-data-pick_vial_20260524` el 2026-10-04, y que los artefactos de entrenamiento originales (checkpoints, `train_config.json`, carpeta `wandb/`) se conservan en la subcarpeta `old/` del repositorio de origen.

## Capacidades

- Manipulacion robonica visuomotora: genera comandos de accion para un robot UR3e bimanual a partir de observaciones visuales de tres camaras.
- Ejecucion de la tarea `pick_vial`: recogida de viales en un contexto de laboratorio, tal como se define en el dataset de entrenamiento.
- Control bimanual: el robot objetivo dispone de dos brazos, y la politica se entrena para esa configuracion.
- Aprendizaje por imitacion: reproduce comportamientos derivados de demostraciones humanas o teleoperadas registradas en el dataset.
- Politica de difusion: genera trayectorias de accion mediante un proceso de denoising condicionado por observaciones.
- Carga directa en LeRobot: integracion mediante `DiffusionPolicy.from_pretrained`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso simbolico, capacidades multilingues, vision generalista, audio ni modo de pensamiento. No es un modelo de lenguaje ni un VLM.

## Casos de uso

- Automatizacion de pick-and-place de viales en laboratorio humedo: el modelo esta entrenado especificamente para la tarea `pick_vial` sobre un UR3e bimanual, por lo que puede emplearse para reproducir esa rutina de recogida de forma autonoma en un montaje experimental identico (mismo robot, misma disposicion de camaras).
- Referencia reproducible en investigacion de imitation learning: al ser una variante "scratch", sirve como linea base para comparar contra variantes fine-tuned o contra otras familias de politica sobre el mismo dataset `lerobot-data-pick_vial`.
- Evaluacion comparativa de politicas de robotica: su resultado publicado de 20/20 exitos en 20 episodios permite contrastar metodologias de evaluacion y medir la variabilidad entre ejecuciones con los videos de rollout publicados.
- Fine-tuning en tareas afines del mismo montaje: al compartir robot (UR3e bimanual), numero de camaras y formato LeRobot, el checkpoint puede actuar como inicializacion para tareas de manipulacion relacionadas en el mismo entorno de laboratorio, reduciendo el volumen de demostraciones necesario.
- Integracion en pipelines de robotica con LeRobot: el modelo se carga con una unica llamada a `from_pretrained`, lo que facilita incorporarlo a un bucle de control existente basado en esta libreria.
- Docencia y prototipado en robotica de manipulacion: al ser Apache 2.0 y de tamano contenido (aproximadamente 263 M de parametros, 1,1 GB en disco), es viable reproducir su despliegue en un laboratorio con hardware de gama media.
- Auditoria de reproducibilidad de experimentos: la conservacion de checkpoints, `train_config.json` y registros de `wandb/` en el repositorio de origen permite reconstruir el proceso de entrenamiento y verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable en un modelo de robotica. El unico dato de rendimiento aportado por el autor es la evaluacion en la tarea objetivo:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Tarea pick_vial, UR3e bimanual (3 camaras) | Episodios evaluados | 20 |
| Tarea pick_vial, UR3e bimanual (3 camaras) | Exitos | 20 / 20 (100 %) |

Los videos de rollout y los resultados por episodio se publican en `WetLabRoboData/eval-diffusion-pick_vial-scratch`. No se dispone de comparaciones con otras politicas sobre la misma tarea en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion orientativa a partir del numero de parametros (263 M), los pesos en fp32 ocuparian en torno a 1,05 GB, y en fp16 en torno a 0,53 GB; a ello hay que sumar las activaciones de los codificadores visuales de tres camaras y el coste del proceso de difusion, cuyo numero de pasos no esta especificado.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU NVIDIA moderna con soporte CUDA y al menos 8 GB de VRAM deberia ser suficiente para el tamano de pesos indicado, aunque no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente si, en tarjetas como RTX 3060 (12 GB), RTX 4070 o RTX 4090, dado el tamano del modelo. No confirmado oficialmente.
- Opciones de despliegue: LeRobot con PyTorch es la via documentada (`DiffusionPolicy.from_pretrained`). No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. En politicas de difusion la latencia depende criticamente del numero de pasos de denoising y del coste de codificacion de las tres camaras, datos no publicados para este checkpoint.
- Requisitos adicionales: para uso real se necesita el robot UR3e bimanual con la misma configuracion de tres camaras que en el entrenamiento.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de otros modelos sobre la tarea `pick_vial` ni detalles de alternativas comparables, por lo que no es posible establecer una comparacion cuantitativa rigurosa. Como referencia de categoria, este checkpoint se situa entre las politicas de imitacion para manipulacion disponibles en LeRobot, donde las alternativas mas habituales son familias como ACT (Action Chunking Transformer) y otras diffusion policies. Los datos concretos de dichas alternativas no estan en la informacion disponible.

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-pick_vial-scratch | 262.813.031 | no disponible | pick_vial (UR3e bimanual, 3 camaras) | apache-2.0 | HuggingFace, via LeRobot |
| Alternativas de la familia LeRobot (ACT, otras diffusion policies) | no disponible | no disponible | manipulacion general | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Especializacion extrema: la variante es "scratch" y se entrena unicamente con los datos de la tarea `pick_vial`. No cabe esperar generalizacion a otras tareas, objetos o entornos fuera de la distribucion de entrenamiento.
- Dependencia del montaje fisico: el modelo asume un robot UR3e bimanual con tres camaras. Cambios en la cinematica, en la calibracion o en la posicion de las camaras invalidan previsiblemente el comportamiento aprendido.
- Riesgo de fallo por cambio de dominio: variaciones de iluminacion, fondo, posicion de los viales o texturas pueden degradar el exito, como es habitual en politicas visuomotoras entrenadas por imitacion.
- Evaluacion limitada: los 20/20 exitos corresponden a 20 episodios en el mismo entorno de evaluacion, sin datos publicados sobre robustez ante perturbaciones ni sobre tiempo hasta el fallo.
- Sesgos: no disponible. No se ha publicado ningun analisis de sesgos, y el concepto se aplica de forma distinta a un modelo de robotica que a un modelo de lenguaje.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si existe el equivalente funcional en forma de acciones incorrectas o inseguras cuando la politica opera fuera de su distribucion de entrenamiento.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de conservar avisos de licencia y atribucion.
- Advertencia de seguridad en produccion: cualquier despliegue sobre hardware fisico debe incorporar limites de par, paradas de emergencia, validacion de espacio de trabajo y supervision humana, ya que no se documentan mecanismos de seguridad propios del modelo.
- Informacion incompleta: no se publican detalles de arquitectura interna, datos de entrenamiento (numero de episodios, tokens o frames), hiperparametros de difusion ni requisitos de hardware verificados.
- Trazabilidad: el autor advierte que el modelo se reorganizo desde `lerobot-data-pick_vial_20260524`; los artefactos originales quedan en la subcarpeta `old/` de ese repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-pick_vial-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-pick_vial
- Dataset de evaluacion (videos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-pick_vial-scratch
- Repositorio de origen con artefactos de entrenamiento (checkpoints, `train_config.json`, `wandb/` en `old/`): https://huggingface.co/WetLabRoboData/lerobot-data-pick_vial_20260524
- Libreria LeRobot (clase `DiffusionPolicy`): no disponible en la informacion proporcionada
- Paper de referencia, blog o demo: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con este modelo (contenido de manga y enlaces sin vinculacion tecnica), por lo que se descartan como fuentes.
