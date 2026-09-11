# Syqnal/act_kitting_nut_v3

## Resumen

Syqnal/act_kitting_nut_v3 es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario Syqnal en Hugging Face mediante la librería LeRobot y está especializado en una única tarea de manipulacion: coger una tuerca y colocarla en una bandeja.

El modelo tiene 51.668.614 parámetros y consume dos entradas: el estado del robot (vector de 6 dimensiones) y una imagen de cámara frontal de 480x640 píxeles. Como salida produce un vector de acción de 6 dimensiones. Está entrenado para el robot so_follower con 50 episodios y 8605 fotogramas a 15 FPS, en un entrenamiento de 50000 pasos con AdamW y tasa de aprendizaje 1e-5 sobre LeRobot 0.6.2.

Su relevancia es la de un ejemplo típico de política de imitación de código abierto para brazos de bajo coste: licencia Apache 2.0, pesos en safetensors, repositorio de 0.2 GB y ejecución directa con el comando lerobot-rollout. No es un modelo de propósito general ni un modelo de lenguaje: es un checkpoint de tarea única, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder CVAE y decodificacion por chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa un horizonte de chunking de acciones no especificado en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos publicados en safetensors) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena fija en tiempo de ejecucion) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | so_follower |
| Camaras | front |
| Entradas | observation.state (6,), observation.images.front (3, 480, 640) |
| Salidas | action (6,) |
| Tamano del repositorio | 0.2 GB |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. Combina un encoder de autoencoder variacional condicional (CVAE), que modela la variabilidad humana en las demostraciones, con un transformer encoder-decoder que predice un chunk de k acciones futuras a partir de las observaciones actuales. Predecir secuencias cortas de acciones en lugar de pasos individuales reduce el error de acumulacion y suaviza el comportamiento resultante; durante la inferencia suele combinarse con ensamblado temporal de chunks solapados. El modelo consume estado proprioceptivo de 6 dimensiones y una imagen RGB frontal, y emite acciones de 6 dimensiones, lo que corresponde a un brazo manipulador de 6 grados de libertad.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset Syqnal/kitting_nut_v3: 50 episodios, 8605 fotogramas, 15 FPS, una unica tarea ("pick the nut and place it in the tray") y una unica camara. La configuracion documentada es de 50000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores, algo esperable en aprendizaje por imitacion a partir de demostraciones teleoperadas. Tampoco se indica el numero total de tokens, la composicion del dataset mas alla de la tarea ni tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de política.

## Capacidades

- Control de manipulacion de 6 grados de libertad: genera acciones continuas de 6 dimensiones para el brazo so_follower.
- Ejecucion de una tarea concreta de pick-and-place: coger una tuerca y depositarla en una bandeja, tal como se define en el dataset de entrenamiento.
- Percepcion visual: procesa una imagen RGB frontal de 480x640 para condicionar la acción.
- Fusion de estado y vision: combina el vector de estado proprioceptivo (6,) con la observacion visual en una unica política.
- Aprendizaje por imitacion de demostraciones teleoperadas: replica la distribucion de comportamiento de los 50 episodios registrados.
- Inferencia en tiempo real: pensada para ejecutarse en bucle cerrado sobre hardware real a la frecuencia de control del robot (dataset grabado a 15 FPS).
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso ni razonamiento simbolico.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar ACT sobre hardware de bajo coste, ya que la configuracion de entrenamiento (50000 pasos, batch 8, AdamW, lr 1e-5) esta documentada y el dataset es publico.
- Baseline en comparativas de políticas: al ser un checkpoint ACT de tarea unica, permite medir frente a otros metodos (por ejemplo Diffusion Policy) sobre la misma tarea y el mismo dataset de 8605 fotogramas.
- Reentrenamiento para tareas propias: el flujo `lerobot-train --policy.type=act` permite sustituir el dataset por uno propio y reutilizar la receta de entrenamiento como configuracion de referencia.
- Validacion de pipelines de datos de robotica: sirve para comprobar de extremo a extremo la grabacion, el formateo y la visualizacion de episodios con LeRobot, incluida la herramienta de visualizacion de datasets de Hugging Face.
- Docencia y prototipado en robotica: con 51,7 millones de parametros y un repositorio de 0.2 GB, se puede ejecutar en un portatil con GPU de gama media o incluso en CPU, lo que lo hace util en entornos de laboratorio docente.
- Pruebas de integracion hardware-software: permite validar la calibracion del brazo so_follower, la colocacion de la camara `front` y la coincidencia entre las claves de observacion del entrenamiento y las del robot real.
- Experimentos de robustez y domain shift: al haber solo una camara y una posicion de objeto en los datos, es un banco de pruebas natural para estudiar degradacion ante cambios de iluminacion, posicion del objeto o distractores.
- No se recomienda su uso en produccion: no hay resultados de evaluacion publicados y la política esta limitada a una unica tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "_No evaluation results have been provided for this policy yet._" y no se aporta ninguna tabla de tarea, numero de intentos, exitos ni tasa de exito en robot real. Los resultados de la busqueda web proporcionada no guardan relacion con el modelo (tratan sobre pedales de overdrive de guitarra) y no contienen datos de rendimiento utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16 para los 51.668.614 parametros, mas el coste de activaciones del encoder visual. Cifra orientativa calculada a partir del numero de parametros; no publicada por el autor.
- GPU recomendadas: cualquier GPU con CUDA de gama media o superior (RTX 3060, RTX 4090, A100, H100) es mas que suficiente; el cuello de botella real es la captura de camara y el bucle de control del robot, no el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU, dado el tamano del checkpoint (repositorio de 0.2 GB).
- Hardware adicional imprescindible: brazo so_follower y una camara compatible con OpenCV configurada como `front` a 640x480 (el ejemplo de la model card usa 30 FPS de captura).
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=Syqnal/act_kitting_nut_v3` es la via documentada; requiere el paquete `lerobot` instalado y PyTorch. No se documentan despliegues con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La unica referencia temporal es la frecuencia de grabacion del dataset (15 FPS) y la captura de camara a 30 FPS en el ejemplo de rollout; no se publican mediciones de latencia de inferencia ni de tasa de exito.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Syqnal/act_kitting_nut_v3 | ACT (imitacion, tarea unica) | 51.668.614 | no aplica (horizonte de chunking no especificado) | sin resultados de evaluacion publicados | apache-2.0 | Hugging Face, libreria lerobot |
| ACT original (paper arXiv:2304.13705) | ACT (imitacion) | no disponible en la informacion proporcionada | no disponible | resultados publicados en el paper (no accesibles en la informacion proporcionada) | no disponible en la informacion proporcionada | publicacion cientifica |
| Otras politicas ACT alojadas en el Hub de LeRobot | ACT (imitacion, tarea unica) | variable segun checkpoint | no aplica | sin resultados en la informacion proporcionada | habitualmente apache-2.0 segun el autor | Hugging Face |
| Diffusion Policy (familia de politicas por difusion) | imitacion por difusion | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | publicacion y repositorio publicos |

No se dispone de datos verificados de parametros, contexto ni rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparacion se limita a la categoria de metodo y a las condiciones de licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea unica: la política esta entrenada exclusivamente para "pick the nut and place it in the tray"; no generaliza a otras tareas ni objetos.
- Dataset muy reducido: 50 episodios y 8605 fotogramas a 15 FPS, sin variaciones documentadas de posicion del objeto, iluminacion o distractores, lo que aumenta el riesgo de sobreajuste al entorno de grabacion.
- Sin evaluacion: no hay tasa de exito medida en robot real, ni numero de intentos, ni condiciones de prueba documentadas.
- Sensibilidad al entorno: cambios en la posicion de la camara, la iluminacion o la posicion inicial del objeto pueden degradar el comportamiento de forma no cuantificada.
- Requisitos de coincidencia de entradas: el estado debe ser un vector de 6 dimensiones y la observacion visual debe provenir de una camara llamada `front` con resolucion 480x640; cualquier desviacion en las claves o formas de las observaciones rompe la inferencia.
- Sin comprension de lenguaje: la tarea se pasa como cadena fija en la linea de comandos y no se interpreta semanticamente.
- Sin capacidades de agente, tool calling ni razonamiento multi-paso.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el modo de fallo equivalente es la ejecucion de trayectorias incorrectas o inseguras ante observaciones fuera de distribucion.
- Seguridad fisica: al controlar un brazo real, conviene operar con limites de par, parada de emergencia y espacio de trabajo despejado; no se documentan limites de seguridad en la model card.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no se ofrece ninguna garantia; el autor no proporciona soporte ni mantenimiento.
- Cero traccion en el Hub (0 descargas, 0 likes) y ausencia de demo en video, lo que limita la evidencia independiente sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Syqnal/act_kitting_nut_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Syqnal/kitting_nut_v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Syqnal/kitting_nut_v3
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Enlaces encontrados en la busqueda web: ninguno relevante. Los resultados obtenidos corresponden a comparativas de pedales de overdrive de guitarra (Ibanez Tube Screamer y Boss SD-1) y no guardan relacion con el modelo.
