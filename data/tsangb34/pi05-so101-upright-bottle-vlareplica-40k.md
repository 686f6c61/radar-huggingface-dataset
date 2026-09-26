# tsangb34/pi05-so101-upright-bottle-vlareplica-40k

## Resumen

π₀.₅ (Pi05) es un modelo de Vision-Lenguaje-Accion (VLA) desarrollado por Physical Intelligence y orientado a la generalizacion en entornos abiertos. Esta ficha corresponde a una adaptacion concreta publicada por el usuario tsangb34: un ajuste fino (fine-tune) del modelo base lerobot/pi05_base realizado con la libreria LeRobot sobre el brazo robotico de bajo coste SO-101. El modelo resuelve una tarea de manipulacion especifica descrita como "recoger el bote de zumo caido y ponerlo de pie sobre la mesa".

El modelo combina observaciones visuales (dos camaras de 480x640 y una tercera de 224x224) y el estado del robot (vector de 6 dimensiones) para producir acciones de 6 grados de libertad. Cuenta con 4.143.404.816 parametros (~4,14 mil millones) y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamano de repositorio de 49 GB.

Es relevante porque ilustra el flujo completo de imitacion learning end-to-end del ecosistema LeRobot: partiendo de un VLA preentrenado de proposito general y ajustandolo con un dataset pequeno (100 episodios, 35.934 fotogramas a 30 FPS) se obtiene una politica operativa para un robot concreto. No obstante, no se han publicado resultados de evaluacion y el modelo es un fine-tune de una unica tarea, no un modelo generalista listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA); adaptacion LeRobot de π₀.₅ (OpenPI) |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (la instruccion de tarea se proporciona en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

Nota: el repositorio ocupa 49 GB para ~4,14 mil millones de parametros, lo que es coherente con pesos en precision completa (fp32) y la presencia de varios checkpoints de entrenamiento (el entrenamiento se ejecuto durante 40.000 pasos). No es un dato documentado por el autor, sino una inferencia a partir del tamano del repositorio.

## Arquitectura y entrenamiento

Se trata de un modelo Vision-Lenguaje-Accion (VLA): un backbone de vision y lenguaje que procesa imagenes y texto y que genera, como salida, acciones motoras continuas en lugar de tokens de texto. Esta instancia concreta es la implementacion de LeRobot (adaptada del repositorio OpenPI de Physical Intelligence) del modelo π₀.₅, cuyo objetivo declarado es generalizar a entornos y situaciones no vistos durante el entrenamiento. La salida del modelo es un vector de accion de dimension (6,), correspondiente a los grados de libertad del brazo SO-101 (tipo `so_follower`).

El fine-tune se realizo sobre el dataset Jiamo0912/so101-upright-bottle, compuesto por 100 episodios y 35.934 fotogramas capturados a 30 FPS para la tarea "recoger el bote de zumo caido y ponerlo de pie sobre la mesa". La configuracion de entrenamiento fue: 40.000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y version de LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni la composicion completa del dataset de preentrenamiento del modelo base.

Las entradas de observacion definidas por la politica son: `observation.state` (estado, forma (6,)), `observation.images.front` (visual, (3, 480, 640)), `observation.images.wrist` (visual, (3, 480, 640)) y `observation.images.empty_camera_0` (visual, (3, 224, 224)). No se detallan innovaciones tecnicas internas adicionales en la informacion disponible.

## Capacidades

- Generacion de acciones de manipulacion robotica de 6 grados de libertad a partir de observaciones visuales y de estado.
- Fusion multimodal de hasta tres flujos de camara (frontal, de muneca y una tercera fuente de 224x224) junto con el estado articular del robot.
- Ejecucion de la tarea especifica de recoger un objeto caido y colocarlo en posicion vertical.
- Control reactivo en bucle cerrado apto para robotica en tiempo real (captura de datos a 30 FPS).
- Capacidad de ajuste fino posterior (fine-tuning) sobre nuevos datasets mediante LeRobot.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la tarea se especifica en ingles.
- Capacidades especiales (modo de pensamiento, vision, audio): vision como entrada; no se documentan modos de razonamiento ni audio.

## Casos de uso

- Recolocacion de objetos caidos en linea de envasado: la politica esta ajustada especificamente para levantar un bote tumbado y ponerlo de pie, por lo que puede desplegarse directamente en una celda con un brazo SO-101 y las mismas camaras empleadas en el entrenamiento.
- Prueba de concepto de imitacion learning end-to-end: sirve como referencia reproducible del flujo de LeRobot (grabacion de datos, entrenamiento y rollout) para equipos que quieran validar su pipeline antes de escalar a tareas mas complejas.
- Base para un nuevo fine-tune: al derivar de lerobot/pi05_base, el mismo procedimiento puede reutilizarse cambiando el dataset para adaptar la politica a otras tareas de pick-and-place con el mismo robot.
- Investigacion en generalizacion VLA: permite estudiar hasta que punto un fine-tune pequeno (100 episodios) conserva la generalizacion del modelo base frente a cambios de posicion, iluminacion o distractores.
- Educacion y laboratorios docentes: el bajo coste del SO-101 y la integracion con LeRobot lo hacen adecuado para practicas de robotica y aprendizaje por imitacion.
- Automatizacion de tareas de recogida en almacen o laboratorio: con reentrenamiento sobre el dataset correspondiente, el mismo esquema puede aplicarse a la manipulacion repetitiva de objetos ligeros, siempre que se disponga de la instrumentacion de camaras requerida.
- Generacion de codigo en produccion: no aplica; el modelo produce acciones motoras, no texto ni codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita de que no se han proporcionado resultados para esta politica todavia, por lo que no existen tasas de exito ni metricas comparativas verificables.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (4,14 mil millones) y no estan documentadas por el autor. No incluyen el consumo adicional de los codificadores de vision ni de las activaciones en tiempo de inferencia.

| Precision | Peso estimado de los parametros | Comentario |
|---|---|---|
| fp32 | ~16,6 GB | Formato probable de los checkpoints publicados |
| fp16 / bf16 | ~8,3 GB | Precision habitual para inferencia |
| int8 | ~4,2 GB | Requiere cuantizacion manual, no documentada |
| int4 | ~2,1 GB | Requiere cuantizacion manual, no documentada |

- VRAM recomendada para inferencia: se estima un margen practico de 12-16 GB en fp16/bf16 sumando pesos y sobrecarga de vision y activaciones, aunque este dato no esta confirmado.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 16 GB de VRAM de forma holgada; una RTX 4090 (24 GB), A100 (40/80 GB) o H100 ofrecen margen suficiente. LeRobot exige `--policy.device=cuda`.
- Cabe en GPU de consumo: previsiblemente si, en modelos como RTX 4090, RTX 3090 (24 GB) y, con menos margen, en tarjetas de 16 GB. No confirmado por el autor.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica robotica de este tipo.
- Latencia y throughput: no disponible. El control opera en regimen de tiempo real (datos capturados a 30 FPS), pero no se publican cifras de latencia ni de frecuencia de inferencia efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / ambito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-upright-bottle-vlareplica-40k (este) | ~4,14 mil millones | no disponible | VLA ajustado a una tarea de manipulacion (SO-101) | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base | no disponible (misma familia π₀.₅) | no disponible | VLA preentrenado de proposito general | Apache 2.0 (segun modelo base) | HuggingFace |
| π₀ (predecesor, Physical Intelligence) | no disponible | no disponible | VLA de proposito general | no disponible | OpenPI (open source) |
| SmolVLA (LeRobot) | aproximadamente 450 M (dato de referencia del ecosistema, no verificado en esta busqueda) | no disponible | VLA ligero para robotica de bajo coste | no disponible | HuggingFace |

La comparacion cuantitativa de rendimiento no es posible porque este modelo no publica resultados de evaluacion. La diferencia principal frente al modelo base es que esta instancia esta especializada en una unica tarea, mientras que pi05_base es generalista.

## Limitaciones y advertencias

- Es un fine-tune de una unica tarea: la politica esta entrenada exclusivamente para "recoger el bote de zumo caido y ponerlo de pie sobre la mesa", por lo que no cabe esperar buen rendimiento fuera de ese objetivo sin reentrenamiento.
- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real en el robot.
- Dependencia del hardware de captura: la politica espera claves de observacion concretas (`observation.images.front`, `observation.images.wrist`, `observation.images.empty_camera_0`) y un robot de tipo `so_follower`. Nombres de camara o calibraciones distintos invalidan la inferencia.
- Sensibilidad a cambios de dominio: variaciones de iluminacion, posicion del objeto, fondo o un robot distinto del mismo tipo pueden degradar el comportamiento; no se documenta robustez frente a estos factores.
- Sesgos conocidos: no disponibles. Al tratarse de un modelo de accion entrenado con 100 episodios de una tarea, el sesgo principal es la sobreespecializacion al entorno de recogida.
- Riesgo de alucinacion: no aplica en el sentido textual, pero existe riesgo de acciones erroneas o fuera de distribucion cuando el estado observado difiere del visto en entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y la instruccion de tarea se proporciona en ingles; no se declaran capacidades multilingues.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y atribucion correspondientes. Conviene verificar la licencia del modelo base y del dataset utilizados.
- Tamano del repositorio elevado (49 GB), lo que complica su descarga y almacenamiento, especialmente si contiene varios checkpoints.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsangb34/pi05-so101-upright-bottle-vlareplica-40k
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-upright-bottle
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-upright-bottle
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitacion learning: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
