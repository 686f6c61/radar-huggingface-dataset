# Triz1/act_nw_merged

## Resumen

`Triz1/act_nw_merged` es una política de imitación (imitation learning) para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. En lugar de predecir acciones paso a paso, el modelo genera "chunks" o secuencias cortas de acciones futuras, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales.

La política está especializada en una única tarea concreta: "Grasp the red cube and lift it 5 cm" (agarrar el cubo rojo y levantarlo 5 cm), sobre un robot de tipo `so_follower` (SO-101) equipado con dos cámaras (frontal y de muñeca). Consume un vector de estado de 6 dimensiones y dos imágenes RGB de 240x320, y produce un vector de acción de 6 dimensiones. Con 51,7 millones de parámetros y un repositorio de solo 0,2 GB, es un modelo ligero orientado a inferencia en tiempo real a 30 FPS.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento, despliegue) y como política funcional para un banco de pruebas de manipulación robótica. No es un modelo de propósito general ni un LLM: es un controlador visomotor entrenado con 96 episodios de teleoperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones visuales y de estado que predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo visomotor, no lingüístico) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Libreria | lerobot (v0.7.0 en entrenamiento) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` |
| Entrada de estado | `observation.state` de forma (6,) |
| Entrada visual | `observation.images.front` y `observation.images.wrist`, forma (3, 240, 320) |
| Salida | `action` de forma (6,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer que, en cada paso de control, recibe como condición el estado propioceptivo del robot y las imágenes de las cámaras, y emite un chunk de acciones futuras en lugar de una sola acción. Este diseño, descrito en el paper arXiv:2304.13705, mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave y con mayor tasa de éxito en tareas de manipulación. La política está implementada en LeRobot, que gestiona el preprocesado de observaciones, la tokenización de imágenes y la ejecución en el robot.

El entrenamiento se realizó sobre el dataset `Triz1/so101_nw_merged`, con 96 episodios, 32.750 frames a 30 FPS y una única tarea ("Grasp the red cube and lift it 5 cm"). La configuración reportada es de 30.700 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.7.0. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje supervisado por imitación a partir de datos de teleoperación.

## Capacidades

- Control visomotor para manipulación robótica: agarre y elevación de un objeto concreto (cubo rojo) sobre el robot SO-101.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado propioceptivo e imágenes.
- Fusión de dos vistas de cámara (frontal y de muñeca) para guiar la política.
- Ejecución en tiempo real a 30 FPS sobre hardware de consumo, dado el reducido tamaño del modelo.
- Integración nativa con LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües: es una política robótica especializada, no un modelo de lenguaje.

## Casos de uso

- Banco de pruebas de manipulación: usar la política como referencia funcional para validar la cadena completa de LeRobot (grabación, entrenamiento, despliegue) antes de abordar tareas más complejas.
- Demostración educativa de imitation learning: ilustra cómo un transformer condicionado por visión y estado puede aprender una tarea de agarre con solo 96 episodios de teleoperación.
- Punto de partida para fine-tuning: reentrenar la política sobre el dataset `Triz1/so101_nw_merged` o sobre datos propios del mismo robot para adaptarla a variaciones de la tarea (posiciones, iluminación, objetos).
- Evaluación de infraestructura de inferencia: por su tamaño (51,7 M de parámetros, 0,2 GB), permite medir latencia y throughput en GPUs de consumo o incluso en CPU para comparar configuraciones de despliegue.
- Automatización de una celda de pick-and-place acotada: en un entorno controlado con el cubo rojo y la geometría de cámara prevista, la política puede ejecutar el ciclo de agarre y elevación de forma autónoma.
- Investigación en robustez visomotora: servir como baseline para estudiar cómo afectan cambios de iluminación, posición del objeto o calibración de cámaras al éxito de una política ACT entrenada con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, pesos en safetensors de 0,2 GB), la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño, una RTX 3060/4060 o superior es más que suficiente; también es viable en GPU integradas o CPU para pruebas, aunque la latencia a 30 FPS debe validarse empíricamente.
- Cabe en GPU de consumo: sí, con amplio margen, aunque no se han publicado mediciones oficiales de latencia ni throughput.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es el método documentado; el entrenamiento se realiza con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El modelo está pensado para operar a 30 FPS (frecuencia del dataset), pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triz1/act_nw_merged | 51,7 M | ACT (imitation learning) | no aplica | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | no aplica | según repositorio | Hugging Face |
| Políticas Diffusion Policy | no disponible | Diffusion policy | no aplica | según repositorio | Hugging Face |
| Políticas VLA (p. ej. familias tipo RT/OpenVLA) | no disponible en esta ficha | Vision-Language-Action | no disponible | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una única tarea ("Grasp the red cube and lift it 5 cm") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 96 episodios y 32.750 frames; la robustez ante cambios de iluminación, posición del objeto, distractores o calibración de cámaras no está evaluada.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Licencia no especificada: la model card marca la licencia como "[More Information Needed]", lo que impide confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue comercial.
- Dependencia de hardware y calibración: requiere el robot SO-101, dos cámaras con los nombres `front` y `wrist`, y que las observaciones coincidan exactamente con las claves de entrenamiento.
- Riesgo de sobreajuste al entorno de grabación: al entrenarse con pocos episodios y una sola tarea, es probable que la política falle ante distribuciones visuales distintas a las del dataset.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de texto, código o agentes; su ámbito es exclusivamente el control visomotor.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo visomotor entrenado con datos de teleoperación, hereda las limitaciones y sesgos de la distribución de datos recogida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Triz1/act_nw_merged
- Dataset de entrenamiento: https://huggingface.co/datasets/Triz1/so101_nw_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Triz1/so101_nw_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
