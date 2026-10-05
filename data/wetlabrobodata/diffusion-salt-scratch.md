# WetLabRoboData/diffusion-salt-scratch

## Resumen

diffusion-salt-scratch es una política de robotica basada en difusion (diffusion policy) entrenada con la libreria LeRobot para la tarea denominada "salt". El modelo lo publica el usuario WetLabRoboData y pertenece a la familia de politicas de imitacion: no es un modelo de lenguaje, sino una policy visomotora que mapea observaciones (imagenes de camaras y estado del robot) a secuencias de acciones motoras. Su objetivo es ejecutar de forma autonoma la tarea "salt" sobre un robot UR3e bimanual equipado con tres camaras.

La variante "scratch" indica que el modelo se ha entrenado unicamente con los datos de esa tarea, en lugar de partir de un checkpoint preentrenado o de datos de otras tareas. El modelo tiene 264.873.854 parametros (aproximadamente 265 millones), se distribuye en formato safetensors con un tamano de repositorio de 1,1 GB y se publica bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es la de un ejemplo reproducible de pipeline completo de aprendizaje por imitacion en robotica de laboratorio: el autor publica el dataset de entrenamiento (WetLabRoboData/lerobot-data-salt), el modelo entrenado y un dataset independiente con los rollouts de evaluacion (WetLabRoboData/eval-diffusion-salt-scratch), incluyendo el resultado por episodio. La tasa de exito reportada es de 6 sobre 20 episodios de evaluacion (30 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (familia diffusion de LeRobot); arquitectura interna detallada no disponible |
| Parametros totales | 264.873.854 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la horizonte de prediccion de acciones no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (politica visomotora, sin capacidad de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Variante | Scratch (entrenada solo con los datos de la tarea) |
| Robot objetivo | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-salt |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de diffusion policies implementadas en LeRobot. En este enfoque, en lugar de predecir directamente una accion, la policy aprende a generar una secuencia de acciones mediante un proceso de difusion: se parte de ruido y se aplican pasos iterativos de denoising condicionados por las observaciones (imagenes de las tres camaras y estado del robot), hasta obtener una trayectoria de acciones. La informacion proporcionada no detalla la red concreta empleada (por ejemplo, el tipo de backbone visual, el numero de pasos de difusion o la horizonte de acciones), por lo que esos datos se consideran no disponibles.

El entrenamiento es de tipo imitation learning supervisado sobre el dataset WetLabRoboData/lerobot-data-salt. La variante "scratch" implica que no hay transferencia desde otro checkpoint ni desde datos de otras tareas. No se documenta en la informacion disponible el numero de tokens o muestras, la composicion del dataset, ni si se aplicaron tecnicas de refinamiento tipo RLHF o DPO (habitualmente no aplicables en este tipo de policies). La procedencia indica que el modelo se reorganizo el 2026-10-04 a partir de WetLabRoboData/lerobot-data-smrithi-salt_20260725, y que los artefactos originales de entrenamiento (checkpoints, train_config.json, directorio wandb/) se conservan en la subcarpeta old/ del repositorio de origen.

## Capacidades

- Control motor visomotor: genera comandos de accion para un robot UR3e bimanual a partir de observaciones visuales de tres camaras y del estado del robot.
- Ejecucion de la tarea "salt" de forma autonoma, tras entrenamiento por imitacion sobre demostraciones.
- Aprendizaje por imitacion desde cero (scratch), sin datos de otras tareas.
- Inferencia como policy de difusion con generacion iterativa de trayectorias de accion.
- Integracion con el ecosistema LeRobot mediante la clase DiffusionPolicy.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision general, audio ni modo de pensamiento; estas capacidades no son aplicables o no estan disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de dispensacion de sal en laboratorio: la policy ejecuta la manipulacion del material solido sobre plataforma bimanual, reduciendo intervencion manual en tareas repetitivas de preparacion de muestras.
- Base de referencia para nuevas tareas de wet lab: al ser una variante scratch, sirve como linea base contra la que comparar fine-tuning o entrenamiento con datos adicionales de otras tareas.
- Validacion de pipelines de aprendizaje por imitacion: el par modelo mas dataset mas evaluacion publicados permiten reproducir el flujo completo de LeRobot y medir la tasa de exito de una diffusion policy.
- Investigacion en robustez de policies visomotoras: con tres camaras y 20 episodios de evaluacion documentados, se puede analizar en que condiciones falla la policy (iluminacion, oclusion, posicion inicial).
- Docencia y formacion en robotica: ejemplo real y reproducible de entrenamiento de una policy de difusion para robot bimanual, con codigo de carga minimo.
- Prototipado de control bimanual: la configuracion de robot objetivo permite estudiar coordinacion entre dos brazos en una tarea de precision.
- Evaluacion comparativa de estrategias de recogida de datos: al existir dataset de entrenamiento y dataset de evaluacion separados, es posible medir el efecto de ampliar o variar las demostraciones.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los de la evaluacion propia del autor sobre la tarea "salt":

| Metrica | Valor |
|---|---|
| Tarea | salt |
| Robot | UR3e bimanual (3 camaras) |
| Episodios de evaluacion | 20 |
| Exitos | 6 |
| Tasa de exito | 30 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica como LIBERO o RLBench) en la informacion disponible. Los resultados de busqueda web encontrados no aportan datos de rendimiento de este modelo.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia aritmetica derivada del recuento de parametros, solo los pesos ocuparian aproximadamente 1,06 GB en float32 y 0,53 GB en float16, sin contar buffers, codificadores visuales, activaciones ni el coste de los pasos iterativos de denoising.
- GPU recomendadas: no disponibles. No se especifica en la informacion proporcionada el hardware usado para entrenamiento o inferencia.
- GPU de consumo: no confirmado. Por el tamano del modelo (aproximadamente 265 millones de parametros) es plausible que quepa en GPUs de consumo actuales, pero el autor no publica mediciones de VRAM ni de latencia, por lo que no puede afirmarse con los datos disponibles.
- Opciones de despliegue: la via documentada es LeRobot, cargando la policy con `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-salt-scratch")`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. En una diffusion policy la latencia depende del numero de pasos de denoising y de la frecuencia de control del robot, parametros no publicados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de la misma categoria (diffusion policies para tareas de laboratorio o para UR3e bimanual) con datos verificables de parametros, contexto o rendimiento. La unica comparacion posible dentro de los datos disponibles es contra si mismo en otras variantes, y no se han publicado.

| Modelo | Parametros | Tarea | Robot | Tasa de exito | Licencia |
|---|---|---|---|---|---|
| diffusion-salt-scratch | 264.873.854 | salt | UR3e bimanual | 30 % (6/20) | apache-2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasa de exito limitada: 6 exitos sobre 20 episodios (30 %). No es adecuado para despliegues de produccion sin supervision ni mecanismos de recuperacion.
- Especializacion estrecha: la variante scratch se entrena solo con los datos de la tarea "salt"; no se espera generalizacion a otras tareas sin reentrenamiento o fine-tuning.
- Ausencia de datos sobre sesgos y robustez: no se documentan analisis de sensibilidad a iluminacion, posicion inicial, oclusiones o cambios en los objetos manipulados.
- Riesgo de fallo silencioso: al ser una policy de accion, los errores se manifiestan como movimientos incorrectos del robot, con riesgo fisico asociado; se requieren limites de par, paradas de emergencia y validacion en entorno controlado.
- Contexto e idioma: no aplica capacidad de lenguaje; no hay soporte multilingue ni ventana de contexto en el sentido de los modelos de lenguaje.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion; no se declaran restricciones adicionales.
- Trazabilidad: el modelo se reorganizo desde otro repositorio y los artefactos originales quedan en la subcarpeta old/ del origen, lo que puede dificultar la reproduccion exacta del entrenamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.
- Idiomas soportados: no disponible. La metadata no declara idiomas, coherente con un modelo que no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-salt-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-salt
- Dataset de evaluacion (rollouts y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-salt-scratch
- Repositorio de origen con los artefactos archivados: WetLabRoboData/lerobot-data-smrithi-salt_20260725 (subcarpeta old/)

Nota sobre la busqueda web: los resultados encontrados (notebooks de Google Colab, repositorios de DiffusionFromScratch, material del curso de flow matching y diffusion del CSAIL y un articulo sobre watermarking en espacios latentes) no estan relacionados con este modelo ni aportan datos verificables sobre el, por lo que no se incluyen como enlaces relevantes.
