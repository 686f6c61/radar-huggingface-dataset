# sourlreapwr/yam3-molmoact2-scene

## Resumen

MolmoAct2 – YAM 3-task (scene camera) es un ajuste fino mediante LoRA del modelo `allenai/MolmoAct2-BimanualYAM`, un modelo vision-lenguaje-accion (VLA) orientado a control robótico bimanual. Lo publica el usuario `sourlreapwr` y está pensado para un banco de pruebas concreto: la plataforma robótica YAM de dos brazos, con tres tareas de manipulación (deslizar una caja y quitarle la tapa, coger un vaso verde y colocarlo en un plato amarillo, y centrar el plato amarillo). El modelo toma únicamente la imagen de la cámara de escena (cabeza), no las cámaras de muñeca, y produce secuencias de 30 acciones de 14 dimensiones a 30 Hz.

El interés técnico está en que es un ejemplo de adaptación de un VLA grande a un conjunto de datos pequeño (96 episodios, 55.950 fotogramas) mediante LoRA en el backbone VLM y entrenamiento completo de la cabeza de flujo. La model card documenta un fallo relevante de normalización estadística en la primera subida y su corrección, lo que lo convierte en un caso instructivo sobre la importancia de las estadísticas q01/q99 en políticas de imitación.

Se distribuye bajo licencia Apache 2.0, en formato safetensors y con la librería LeRobot, con un repositorio de 23 GB que incluye los checkpoints intermedios (pasos 1000 a 4000) además del final (paso 5000).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en MolmoAct2 (backbone VLM con LoRA + cabeza de flujo para acciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/MolmoAct2-BimanualYAM` (revision `8dcbed66f2380e4393189c303ea72488eb9e63c2`) y aplica un ajuste fino LoRA sobre el backbone VLM, mientras que la cabeza de flujo (flow head) se entrena por completo. El entrenamiento se realizó durante 5.000 pasos con batch de 32 en 4 GPU A100, con chunk de 30 acciones, pose articular absoluta y únicamente la clave de imagen `observation.images.top`. Las cámaras de muñeca se anulan (se ponen a cero y se enmascaran) tanto en entrenamiento como en inferencia, de modo que la política también puede ejecutarse dentro de un modelo del mundo que solo predice la vista de escena.

Los datos de entrenamiento son demostraciones de teleoperación del banco YAM bimanual en LeRobot v3.0 (`yam/yam3task_v1_top`), agregadas con `lerobot.datasets.aggregate`: 96 episodios y 55.950 fotogramas a 30 Hz repartidos en tres tareas (índices 0, 1 y 2), con episodios reservados para validación que nunca se entrenaron. La model card documenta explícitamente una corrección importante: la primera versión usó las estadísticas agregadas de LeRobot, cuyos q01/q99 son la media de cuantiles por episodio (0,54 veces el rango real), lo que dejaba el 41% de los fotogramas fuera de [-1, 1] y provocaba que el recorte (clamp) de MolmoAct2 truncara los movimientos. La versión actual (run `molmo_yam3_5k_fixstats`) usa estadísticas globales verdaderas mediante `code/fix_v3_stats.py`.

## Capacidades

- Control robótico bimanual: genera trayectorias de 30 pasos (1 segundo) de 14 dimensiones (6 articulaciones + pinza por brazo) a 30 Hz.
- Selección de tarea mediante prompt en lenguaje natural entre las tres instrucciones entrenadas.
- Política condicionada por imagen RGB de la cámara de escena y estado articular de 14 dimensiones (radianes, pinza 0–1 con 1 = abierta).
- Ejecución en bucle cerrado: se reconsulta cada 5 pasos de control (6 Hz) y se ejecutan los 5 primeros.
- Funcionamiento sin cámaras de muñeca, lo que permite integrarlo en un modelo del mundo que solo predice la vista de escena.
- Salida de acciones absolutas en modo continuo (`inference_action_mode="continuous"`).
- No se documentan capacidades de tool calling, agentes, visión general, audio ni razonamiento multi-paso fuera del bucle de control.

## Casos de uso

- Automatización de tareas de manipulación en el banco YAM: el modelo ejecuta las tres tareas entrenadas (deslizar caja y quitar tapa, colocar vaso en plato, centrar plato) seleccionándolas por prompt, adecuado para reproducir demostraciones de teleoperación en laboratorio.
- Investigación en políticas de imitación con datos escasos: sirve como referencia de ajuste fino LoRA de un VLA grande con 96 episodios, útil para estudiar el efecto de la normalización de acciones.
- Integración en modelos del mundo: al no depender de cámaras de muñeca, la política puede evaluarse dentro de simuladores o modelos predictivos que solo renderizan la vista de escena.
- Despliegue como servicio HTTP: el script `code/policy_server.py` expone la política por HTTP con el mismo protocolo npz que los modelos openpi, lo que facilita conectarla a un cliente de control remoto.
- Evaluación comparativa base vs. ajustado: el contrapunto sin ajuste `sourlreapwr/yam3-molmoact2-base-zeroshot` permite medir la ganancia del fine-tuning en las mismas tareas.
- Estudio de checkpoints intermedios: los pasos 1000–4000 permiten analizar la evolución del aprendizaje y elegir un punto de operación distinto del final.
- Reproducción de pipelines de datos robóticos: los scripts `convert_lerobot.py`, `merge_tasks_v2.py` y `fast_norm_stats.py` sirven para replicar la conversión y el cálculo de estadísticas de normalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la comprobación offline con episodios reservados («Held-out offline check») aún no se ha ejecutado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 23 GB e incluye pesos en safetensors, por lo que la inferencia requiere al menos esa magnitud de memoria, aunque no se detalla el reparto entre backbone y cabeza.
- GPU empleadas en entrenamiento: 4 × A100 (batch 32, 5.000 pasos).
- GPU recomendadas para inferencia: no disponible; por el tamaño del backbone VLM se espera necesitar GPU de datacenter (A100/H100) o GPUs de consumo de gama alta con cuantización, aunque no se confirma.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: LeRobot con la rama `molmoact2-policy` de allenai (`MolmoAct2Policy.from_pretrained`), o servidor HTTP propio (`code/policy_server.py`) con protocolo npz compatible con openpi.
- Latencia y throughput: no disponibles; la política opera a 6 Hz de reconsulta (ejecuta 5 de cada 30 acciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sourlreapwr/yam3-molmoact2-scene | no disponible | no disponible | 3 tareas YAM bimanual | Apache 2.0 | Hugging Face |
| sourlreapwr/yam3-molmoact2-base-zeroshot | no disponible | no disponible | sin ajuste (zero-shot) | no disponible | Hugging Face |
| allenai/MolmoAct2-BimanualYAM | no disponible | no disponible | base bimanual | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona con las tres tareas entrenadas; el prompt debe ser una de las tres instrucciones exactas.
- No usa cámaras de muñeca: cualquier tarea que requiera percepción cercana de la pinza queda fuera de su alcance.
- Entrenado con 96 episodios y 55.950 fotogramas: cobertura limitada de variaciones de iluminación, posiciones de objetos y condiciones de la escena.
- La primera versión de pesos tenía estadísticas de normalización incorrectas y truncaba movimientos; la model card advierte de no usar los pesos antiguos del historial.
- La comprobación offline con episodios reservados no se ha ejecutado, por lo que no hay evidencia publicada de generalización.
- Riesgo de alucinación de acciones o de deriva en bucle cerrado no cuantificado; no se documentan sesgos.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales del modelo base.
- Idiomas soportados no disponibles; las instrucciones están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourlreapwr/yam3-molmoact2-scene
- Contraparte sin ajuste: https://huggingface.co/sourlreapwr/yam3-molmoact2-base-zeroshot
- Modelo base: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Rama `molmoact2-policy` de allenai: no disponible como enlace directo en la informacion proporcionada.
