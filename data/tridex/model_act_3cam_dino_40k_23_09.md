# Tridex/model_act_3cam_dino_40K_23_09

## Resumen

Tridex/model_act_3cam_dino_40K_23_09 es una política de imitación robótica entrenada con ACT (Action Chunking with Transformers), el método descrito en el artículo arXiv:2304.13705 y publicado por el usuario Tridex (equipo Tridex_DIA_Niort) en Hugging Face. No es un modelo de lenguaje: es un controlador que recibe el estado de un brazo robótico de 6 grados de libertad y tres flujos de cámara (front, side, top) a 480x640 píxeles, y devuelve directamente un vector de acción de 6 dimensiones. El modelo se distribuye a través de la librería LeRobot de Hugging Face, que es el estándar de facto para entrenar y desplegar políticas de imitación en robots de bajo coste.

La política se ha entrenado sobre el dataset Tridex/50_gazeuse_10h30_23-09_20260923_103845, compuesto por 50 episodios y 53.087 fotogramas grabados a 30 FPS mediante teleoperación, con una única tarea: "take the gaz cylinder and drop it". El entrenamiento se realizó durante 40.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5. El resultado es un checkpoint de 62.473.542 parámetros (unos 62,5 millones), lo que lo sitúa en el rango habitual de las políticas ACT basadas en ResNet-18 más transformer.

Su relevancia es práctica más que arquitectónica: demuestra el flujo completo de imitación de bajo coste (grabar con LeRobot, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) sobre un robot tipo `so_follower`, y sirve como referencia reproducible para equipos que quieran replicar el pipeline con sus propios datos. El modelo no incluye resultados de evaluación en robots reales, por lo que su tasa de éxito no está verificada públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con encoder de acciones tipo CVAE y extractor visual convolucional |
| Parametros totales | 62.473.542 (aproximadamente 62,5 M) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. La observacion es un estado de 6 dimensiones mas tres imagenes de 480x640; la salida es un chunk de acciones |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en precision completa) |
| Idiomas soportados | No aplica / no disponible: politica de control robotico, no condicionada por lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargados mediante la libreria lerobot |
| Tipo de robot | `so_follower` (brazo seguidor de 6 GDL) |
| Camaras de entrada | `front`, `side`, `top` (3 x 480 x 640, 30 FPS) |
| Dimension de observacion | `observation.state`: (6,) |
| Dimension de accion | `action`: (6,) |
| Pasos de entrenamiento | 40.000 |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 23 de septiembre de 2026 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un *chunk* o bloque de acciones futuras de una sola vez. La arquitectura combina un extractor visual convolucional que codifica cada imagen de cámara, una proyección del estado propioceptivo (6 grados de libertad) y un transformer encoder-decoder que genera la secuencia de acciones. Durante el entrenamiento se emplea un esquema de autoencoder variacional condicional (CVAE): un encoder auxiliar toma la secuencia de acciones de la demostración y produce una variable latente, lo que permite modelar la multimodalidad de las demostraciones humanas (por ejemplo, distintas formas válidas de agarrar el cilindro). En inferencia, esa rama se descarta y el decoder genera las acciones de forma determinista.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset Tridex/50_gazeuse_10h30_23-09_20260923_103845: 50 episodios teleoperados, 53.087 fotogramas, 30 FPS y una única tarea ("take the gaz cylinder and drop it"). La configuración registrada es de 40.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-5 con semilla 1000. El sufijo "dino" del nombre del repositorio sugiere el uso de un backbone visual de la familia DINO, pero la model card no lo confirma ni detalla la composición exacta del dataset (proporción de posiciones de objeto, variaciones de iluminación, distractores), por lo que ese punto queda como no disponible. Tampoco se documenta el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación.

## Capacidades

- Control robótico de imitación: genera comandos de acción de 6 grados de libertad para un brazo `so_follower` a partir de observaciones visuales y propioceptivas.
- Predicción por chunks de acciones: en lugar de una acción por inferencia, emite un bloque de acciones, lo que reduce el error de composición y suaviza la trayectoria.
- Fusión de tres vistas de cámara simultáneas (front, side, top) a 480x640 y 30 FPS, lo que aporta información espacial redundante para el agarre.
- Ejecución de una tarea concreta de pick-and-place: coger un cilindro ("gaz cylinder") y soltarlo en una posición objetivo.
- Compatibilidad nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento o ajuste fino.
- Integración como política en un pipeline de control en bucle cerrado a 30 FPS, siempre que la latencia de inferencia lo permita.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso simbólico; el comportamiento "multi-paso" se limita a la secuencia de acciones dentro del chunk.
- No dispone de capacidades multilingües, de visión general, de generación de texto, de código ni de matemáticas.
- No dispone de modo de razonamiento explícito (*thinking mode*), audio ni ninguna otra modalidad que no sea la observación visual y propioceptiva indicada.

## Casos de uso

- Automatización de una celda pick-and-place de laboratorio: la política puede sustituir el script de control de un brazo `so_follower` para coger un cilindro y depositarlo, partiendo de demostraciones teleoperadas en lugar de programación explícita de trayectorias.
- Base para ajuste fino con datos propios: partiendo de este checkpoint de 62,5 M de parámetros, un equipo puede reentrenar con `lerobot-train` sobre su propio dataset y una tarea distinta, reduciendo el tiempo de convergencia frente a un entrenamiento desde cero.
- Referencia reproducible para investigación en imitación: sirve como punto de comparación controlado (mismo backbone, mismo número de pasos, tres cámaras) frente a otros checkpoints del mismo autor, como los de 10K y 30K pasos.
- Prototipado rápido en robótica educativa: al ser un modelo pequeño (0,2 GB) y con licencia Apache 2.0, se puede desplegar en un laboratorio docente con una GPU de gama media y un brazo de bajo coste.
- Validación de un pipeline de captura de datos: el modelo permite comprobar de extremo a extremo que las claves de observación (`observation.images.front`, `side`, `top`, `observation.state`) y la calibración del robot son correctas antes de escalar a datasets mayores.
- Evaluación de robustez frente a variaciones de entorno: al estar entrenado con 50 episodios en una posición concreta, es útil como caso de estudio de sensibilidad a cambios de iluminación, posición del objeto o disposición de cámaras.
- Despliegue en hardware embebido: su reducido tamaño permite plantear inferencia en dispositivos tipo Jetson para aplicaciones robóticas desconectadas de la nube, previa verificación de que se alcanzan los 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación con la plantilla vacía y la indicación explícita de que no se han proporcionado resultados para esta política ("No evaluation results have been provided for this policy yet"). No hay, por tanto, tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas. Tampoco se han publicado métricas de pérdida de entrenamiento ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el cálculo a partir del recuento de parámetros da aproximadamente 250 MB de pesos en fp32 y unos 125 MB en bf16. Sumando activaciones de tres imágenes de 480x640 y el transformer, una estimación razonable es inferior a 2 GB con batch size 1. Es una estimación derivada del tamaño del modelo, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para cargar el modelo. Para cumplir el bucle de control a 30 FPS se recomienda una GPU de gama media o superior (RTX 3060, RTX 4060, RTX 4090) o un módulo embebido tipo Jetson Orin.
- Cabe en GPU de consumo: sí, con holgura. Cualquier GPU de consumo de los últimos diez años con 4 GB o más de VRAM debería poder alojar los pesos.
- Ejecución en CPU: técnicamente posible por tamaño de modelo, pero no se documenta si alcanza los 30 FPS necesarios para el control en bucle cerrado. En CPU de escritorio moderna es probable quedarse por debajo de esa frecuencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=Tridex/model_act_3cam_dino_40K_23_09`, sobre PyTorch con backend CUDA. El entrenamiento y el ajuste fino se realizan con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, TensorRT ni exportación a ONNX, dado que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni frecuencia de control efectiva alcanzada en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea / dataset | Licencia | Estado |
|---|---|---|---|---|---|
| Tridex/model_act_3cam_dino_40K_23_09 | 62,5 M | Estado (6,) + 3 camaras 480x640 | 50 episodios, 53.087 fotogramas, "take the gaz cylinder and drop it" | Apache 2.0 | Publicado, sin evaluacion |
| Tridex/model_act_3cam_dino_10K_22_09 | no disponible en la informacion proporcionada | 3 camaras (segun nomenclatura) | no disponible | no disponible | Publicado por el mismo autor |
| Tridex/modele_act_3cam_30k | 51,7 M | 3 camaras (segun nomenclatura) | no disponible | no disponible | Publicado por el mismo autor |
| ACT de referencia (LeRobot, configuracion por defecto) | aproximadamente 80 M segun la implementacion habitual | Estado + imagenes | definido por el usuario | Apache 2.0 (LeRobot) | Implementacion mantenida por Hugging Face |

La comparacion cuantitativa de rendimiento entre estas variantes no es posible con la informacion disponible: ninguno de los repositorios citados publica tasas de exito ni resultados de evaluacion en robot real. Las diferencias observables se limitan al numero de parametros y al numero de pasos de entrenamiento indicado en el nombre. Como alternativas metodologicas de la misma categoria (aprendizaje por imitacion sobre hardware de bajo coste) existen Diffusion Policy y VQ-BeT, pero no se dispone de datos comparativos publicados para esta política concreta.

## Limitaciones y advertencias

- Especializacion extrema: la política está entrenada para una única tarea ("take the gaz cylinder and drop it") y no generaliza a otros objetos, tareas o disposiciones del entorno sin reentrenamiento.
- Dataset reducido: 50 episodios y 53.087 fotogramas son un volumen bajo. El riesgo de sobreajuste a la posición del cilindro, la iluminación y la configuración de la mesa de grabación es alto.
- Sin evaluación publicada: no existe ninguna medición de tasa de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable ni siquiera en el escenario de entrenamiento.
- Dependencia estricta de la interfaz de observación: las cámaras deben nombrarse `front`, `side` y `top`, montarse en la misma configuración y capturar a 480x640 y 30 FPS. Cualquier cambio de encuadre, resolución o número de cámaras invalida la política.
- Dependencia del robot: está entrenada para el tipo `so_follower` con estado y acción de 6 dimensiones. Cambiar de brazo, de cinemática o de calibración degrada el comportamiento.
- Riesgo de alucinación en sentido robótico: ACT puede generar chunks de acciones que no corresponden a ninguna demostración cuando la observación se aleja de la distribución de entrenamiento, produciendo movimientos erráticos o colisiones. No incluye mecanismo de detección de fallo ni de parada de seguridad.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural ni mantiene contexto conversacional. El campo `--task` de `lerobot-rollout` es una etiqueta de episodio, no una entrada que module la política.
- Sesgos de datos: al provenir de teleoperación humana, hereda los sesgos del operador (velocidad, estilo de agarre, tolerancia al error) y las condiciones concretas de la sala de grabación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No hay cláusulas de uso restringido conocidas, pero conviene verificar la licencia de los pesos del backbone visual si se reutilizan por separado.
- Advertencia para producción: antes de cualquier despliegue real debe validarse la política con ensayos repetidos, definir límites de par y zonas de seguridad, e implementar un botón de parada de emergencia independiente del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_3cam_dino_40K_23_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/50_gazeuse_10h30_23-09_20260923_103845
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/50_gazeuse_10h30_23-09_20260923_103845
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Otros modelos del autor: https://huggingface.co/Tridex/models
- Checkpoint de 10K pasos del mismo autor: https://huggingface.co/Tridex/model_act_3cam_dino_10K_22_09
