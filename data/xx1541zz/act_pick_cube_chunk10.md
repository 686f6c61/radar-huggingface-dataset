# xx1541zz/act_pick_cube_chunk10

## Resumen

`xx1541zz/act_pick_cube_chunk10` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario xx1541zz en Hugging Face mediante la librería LeRobot, el framework de Hugging Face para aprendizaje automático en robótica real. La tarea concreta aprendida es "Grab the black cube", es decir, coger un cubo negro con un robot de tipo `so_follower`.

El modelo tiene 51.576.454 parámetros (unos 51,6 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras diseñadas para ejecutarse en tiempo real sobre hardware modesto. Consume dos flujos visuales de 480x640 píxeles (cámara cenital y cámara en la muñeca) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Se entrenó sobre un dataset propio de 50 episodios y 15.000 fotogramas a 30 FPS.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabación de datos de teleoperación, entrenamiento con ACT y despliegue en un robot real mediante `lerobot-rollout`. No es un modelo de propósito general ni un LLM, sino una política específica de una sola tarea, con licencia Apache 2.0 y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de aprendizaje por imitación con predicción de chunks de acciones |
| Parametros totales | 51.576.454 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformer que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y mitiga el problema de la multimodalidad en los datos de teleoperación. La política recibe como entrada un vector de estado de 6 dimensiones (`observation.state`) y dos imágenes RGB de 480x640 (`observation.images.overhead` y `observation.images.wrist`), y emite un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `xx1541zz/pick-cube_20261008_103849`: 50 episodios, 15.000 fotogramas a 30 FPS, una única tarea ("Grab the black cube") y robot de tipo `so_follower`. La configuración reportada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Control robótico de una sola tarea: agarre de un cubo negro mediante un robot `so_follower`.
- Fusión de percepción visual multi-cámara: dos vistas (cenital y muñeca) combinadas con el estado propioceptivo del robot.
- Predicción de chunks de acciones, lo que permite ejecutar movimientos más suaves y con menor deriva que políticas de un solo paso.
- Aprendizaje por imitación a partir de datos de teleoperación, sin recompensas ni entorno simulado.
- Inferencia en tiempo real a 30 FPS, alineada con la frecuencia de captura del dataset.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política motora, no un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia de agarre del cubo negro sobre un robot SO-100/SO-101, sirviendo como base para experimentos de manipulación reproducibles.
- Prototipado rápido de pipelines de aprendizaje por imitación: al estar publicada con LeRobot, permite validar el flujo completo (grabación, entrenamiento, despliegue) sin partir de cero.
- Docencia y formación en robótica: el modelo y su dataset asociado permiten demostrar el ciclo de teleoperación y entrenamiento con hardware de bajo coste.
- Benchmark interno de referencia: sirve como línea base de ACT para comparar nuevas políticas entrenadas sobre la misma tarea y dataset.
- Reentrenamiento con fine-tuning sobre nuevas posiciones del cubo: partiendo de estos pesos, se puede adaptar la política a variaciones de iluminación o colocación con un dataset adicional pequeño.
- Integración en entornos de investigación con `lerobot-rollout`: permite lanzar evaluaciones controladas con `--duration` limitado y sin grabación de episodios, útil para medir tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación está vacía. No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 millones de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 o superior es suficiente; el cuello de botella real será el procesamiento de las dos cámaras a 30 FPS, no el modelo.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot, y el flujo `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control esperada es de 30 FPS, coherente con la captura del dataset, pero no se publican mediciones de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xx1541zz/act_pick_cube_chunk10` | 51,6 M | no aplica | Agarre de cubo con `so_follower` | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación diversa | variable | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación | variable | Hugging Face / repos de investigación |
| Políticas VLA (p. ej. familias tipo RT/OpenVLA) | cientos de millones a miles de millones | limitado | Manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Política de una sola tarea: entrenada exclusivamente para "Grab the black cube"; no generaliza a otros objetos ni instrucciones sin reentrenamiento.
- Dataset muy reducido: 50 episodios y 15.000 fotogramas limitan la robustez frente a cambios de iluminación, posición del cubo o distractores.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con nombres y resoluciones exactas (`overhead`, `wrist`, 480x640); cualquier desviación invalida la política.
- Riesgo de sobreajuste al entorno de grabación: cambios en la mesa, el fondo o la cámara cenital pueden degradar el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de texto, agente conversacional ni componente de tool calling.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía sobre el comportamiento del robot; el despliegue conlleva riesgos físicos que deben gestionarse con límites de par y paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xx1541zz/act_pick_cube_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/xx1541zz/pick-cube_20261008_103849
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=xx1541zz/pick-cube_20261008_103849
