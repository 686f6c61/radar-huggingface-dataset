# Yu3773/act_red_cube_black_tray_50ep_40k

## Resumen

El modelo `Yu3773/act_red_cube_black_tray_50ep_40k` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por Yu Sakuta y publicada en Hugging Face bajo la licencia Apache 2.0. Está entrenada específicamente para que un robot manipulador de tipo SO-101 (so_follower) realice la tarea de recoger un cubo rojo y colocarlo en una bandeja negra, utilizando dos cámaras (muñeca y vista cenital) y el estado del robot como entradas.

El modelo se ha entrenado con el framework LeRobot, sobre un conjunto de datos de 50 episodios teleoperados (22.134 fotogramas a 30 FPS). Con 51,7 millones de parámetros, es una política compacta diseñada para ejecutarse en tiempo real en hardware de bajo coste. Su relevancia radica en que demuestra cómo un método de imitación con predicción de fragmentos de acción (action chunking) puede lograr un control preciso en tareas de manipulación con un entrenamiento relativamente corto (40.000 pasos).

Al tratarse de un modelo de robótica, no es un modelo de lenguaje ni de visión general: su salida es un vector de acción de 6 dimensiones que controla directamente los actuadores del robot. Está pensado para ser desplegado en el robot SO-101 mediante las herramientas de LeRobot, no para tareas de generación de texto o razonamiento simbólico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer con codificador de visión y decodificador autoregresivo |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), propuesta en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un fragmento (chunk) de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador de visión (para procesar las imágenes de las cámaras) con un transformador que genera secuencias de acciones condicionadas al estado observado.

El entrenamiento se realizó con LeRobot (versión 0.6.0) sobre el dataset `Yu3773/so101_red_cube_black_tray`, que contiene 50 episodios de teleoperación con 22.134 fotogramas a 30 FPS. La configuración de entrenamiento incluye 40.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado de imitación.

Las entradas del modelo son el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara de muñeca y cámara cenital). La salida es un vector de acción de 6 dimensiones que se aplica al robot. No se han publicado detalles sobre la composición exacta del dataset (variaciones de iluminación, posiciones, etc.) más allá de la tarea descrita.

## Capacidades

- Control de manipulador robotico: genera comandos de acción de 6 grados de libertad para ejecutar la tarea de pick-and-place.
- Percepción visual multimodal: procesa simultáneamente dos vistas (muñeca y cenital) para localizar el objeto y la bandeja.
- Predicción de fragmentos de acción: produce secuencias de acciones (action chunks) que permiten movimientos suaves y coordinados.
- Aprendizaje por imitación: reproduce comportamientos teleoperados sin necesidad de ingeniería de recompensas.
- Ejecución en tiempo real: con 51,7 M de parámetros, es lo suficientemente ligero para inferencia en GPU de consumo o incluso en CPU con optimizaciones.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües, al ser un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un robot SO-101 para trasladar objetos de una posición a otra, como paso previo a tareas más complejas de ensamblaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de episodios, la longitud del chunk o la arquitectura del transformador en tareas de manipulación.
- Desarrollo de políticas transferibles: aunque está entrenado para una tarea concreta, el código y el flujo de entrenamiento pueden adaptarse a nuevas tareas con datasets propios, usando LeRobot como base.
- Evaluación de hardware robótico: permite probar la repetibilidad y precisión de un robot SO-101 en condiciones controladas, midiendo tasas de éxito sobre la misma tarea.
- Demostraciones educativas: en cursos de robótica o aprendizaje automático, puede utilizarse para ilustrar el ciclo completo de recolección de datos, entrenamiento y despliegue de una política de imitación.
- Benchmarking de métodos de control: al ser un modelo pequeño y de código abierto, puede compararse con otras políticas (por ejemplo, Diffusion Policy) en la misma tarea para evaluar ventajas y limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no es posible comparar numéricamente su tasa de éxito con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,7 M de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 207 MB de pesos). Con cuantización a FP16 o int8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso una Jetson Nano para despliegue embebido.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo. También podría ejecutarse en CPU, aunque la latencia aumentaría.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y soporte para el robot SO-101. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, se espera una inferencia en el orden de milisegundos en GPU, pero depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. En el ecosistema LeRobot existen otras políticas entrenadas con ACT o Diffusion Policy para tareas similares, pero no se han encontrado métricas estandarizadas que permitan una comparación objetiva. Se recomienda consultar el hub de LeRobot para ver otros modelos de la misma categoría.

## Limitaciones y advertencias

- Especificidad de la tarea: el modelo solo ha sido entrenado para la tarea "recoger el cubo rojo y colocarlo en la bandeja negra". No generaliza a otros objetos, colores o disposiciones sin reentrenamiento.
- Sin evaluación en robot real: la model card no incluye resultados de éxito en el robot físico, por lo que su rendimiento real no está verificado.
- Dependencia del hardware: requiere el robot SO-101 y las cámaras configuradas exactamente como en el entrenamiento (mismas posiciones, resoluciones y frecuencias).
- Sensibilidad a cambios de iluminación y fondo: al ser un modelo de imitación, es probable que degrade su rendimiento si las condiciones del entorno difieren de las del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asegurarse de cumplir con los términos de la licencia y de atribuir correctamente al autor.
- No es un modelo de propósito general: no puede utilizarse para tareas de NLP, visión general o razonamiento; su salida es exclusivamente un vector de acción robótica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yu3773/act_red_cube_black_tray_50ep_40k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Yu3773/so101_red_cube_black_tray
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yu3773/so101_red_cube_black_tray
