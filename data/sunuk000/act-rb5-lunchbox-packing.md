# sunuk000/act-rb5-lunchbox-packing

## Resumen

ACT-RB5-Lunchbox-Packing es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada con LeRobot 0.6.1 sobre el conjunto de datos RB5 lunchbox packing, compuesto por 140 demostraciones de teleoperación. El modelo resuelve una tarea concreta de manipulación: empaquetar una fiambrera con un brazo robótico RB5-850. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de imitación que mapea observaciones visuales y propioceptivas a comandos motores.

La arquitectura combina un backbone ResNet-18 preentrenado en ImageNet para la extracción de características visuales con un transformer de 512 dimensiones y un VAE condicional (peso KL de 10). El modelo recibe tres imágenes RGB de 320×240 (frontal, superior y de pinza) junto con el estado del robot (ángulos articulares J1-J6 en grados y apertura de pinza de 0 a 1), y produce un chunk de 100 acciones que cubren 3,3 segundos a 30 Hz.

El modelo tiene 51.667.588 parámetros y un tamaño de repositorio de 0,2 GB. Es relevante como referencia reproducible de un pipeline completo de imitación con LeRobot: incluye el checkpoint final de 100.000 pasos (no seleccionado por resultados de test), el dataset asociado y el código de evaluación con 30 ensayos en vídeo. Su utilidad práctica está acotada al hardware y al entorno exactos del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): ResNet-18 + transformer de 512 dimensiones + VAE condicional |
| Parámetros totales | 51.667.588 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 3 imágenes 320×240 + estado del robot) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación diseñada para predecir secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. En este caso, el backbone es un ResNet-18 preentrenado en ImageNet que procesa las tres cámaras; las características resultantes se combinan con el estado del robot y se pasan a un transformer de 512 dimensiones. Se añade un VAE condicional con peso KL de 10 para modelar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, con tamaño de chunk de 100, batch de 8 y tasa de aprendizaje constante de 1e-5, lo que equivale a aproximadamente 3,5 pasadas sobre las 140 demostraciones del dataset. La normalización usa la media y la desviación típica del dataset. El checkpoint publicado es el final del entrenamiento, no el mejor según test. En inferencia se aplica ensamblado temporal de chunks solapados (m = 0,01) dentro de un proceso de servo a 50 Hz, seguido del mismo modelado de comandos que en teleoperación. La orientación de la herramienta no se predice: está fijada por regla (pinza hacia abajo, yaw siguiendo el azimut de la base).

## Capacidades

- Predicción de chunks de 100 acciones (posición TCP x, y, z en mm en el marco de la base del robot y comando de pinza de 0 a 1).
- Percepción visual multi-cámara a partir de tres imágenes RGB de 320×240 (frontal, superior y de pinza).
- Condicionamiento en el estado propioceptivo del robot: ángulos articulares J1-J6 en grados y apertura de pinza.
- Ejecución de una tarea de manipulación específica: empaquetado de una fiambrera con el RB5-850.
- Ensamblado temporal de chunks solapados para suavizar la ejecución en un bucle de servo a 50 Hz.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, generación de texto ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la política motora.

## Casos de uso

- Reproducción de un pipeline de imitación con LeRobot: sirve como referencia completa (dataset, checkpoint y código) para equipos que quieran replicar el flujo de entrenamiento ACT con su propio robot y tarea.
- Empaquetado de objetos rígidos en un entorno fijo: la política está entrenada para colocar una fiambrera en una posición concreta con el RB5-850 y cámaras en posiciones fijas; es adecuada para demostrar automatización de una celda de pick-and-place dedicada.
- Evaluación comparativa de políticas ACT: al publicar 30 ensayos en vídeo y el checkpoint final, permite medir la variabilidad de una política de imitación sin selección por test y contrastarla con variantes propias.
- Base para fine-tuning con pocas demostraciones: el checkpoint y la receta de entrenamiento (100.000 pasos, batch 8, lr 1e-5) sirven de punto de partida para adaptar la política a una tarea similar con un nuevo dataset de teleoperación.
- Docencia e investigación en robótica de manipulación: el modelo y su código de interfaz (`rb5_lerobot/run.py`) permiten estudiar el ensamblado temporal de chunks y el modelado de comandos en un caso real.
- Integración en un banco de pruebas de servo a 50 Hz: el chunk de 3,3 s y el ensamblado con m = 0,01 permiten validar la latencia y la estabilidad de un lazo de control con políticas de imitación.
- No es adecuado para tareas de manipulación distintas, robots diferentes ni entornos con cámaras móviles sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el checkpoint publicado es el final (100.000 pasos) y no fue seleccionado por resultados de test; los vídeos de los 30 ensayos de evaluación están en el repositorio de GitHub del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en precisión completa (FP32) el peso ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe en GPUs de consumo con holgura.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; una RTX 4090 o A100 no son necesarias para la inferencia, aunque pueden acelerar el entrenamiento.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,2 GB de repositorio); no se detallan modelos concretos probados.
- Opciones de despliegue: LeRobot 0.6.1 con el script `rb5_lerobot/run.py` del repositorio del autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El autor indica un proceso de servo a 50 Hz con ensamblado temporal de chunks, pero no publica cifras de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de política ACT comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Especificidad de hardware: la política está entrenada para el RB5-850, sus cámaras y el espacio de trabajo del autor; el estado de entrada son los ángulos articulares del RB5 y las imágenes provienen de posiciones de cámara fijas.
- Especificidad de tarea: solo ejecuta el empaquetado de una fiambrera; no generaliza a otras tareas sin reentrenamiento.
- Orientación fijada por regla: la orientación de la herramienta no se predice, lo que limita la aplicabilidad a tareas que requieran control de orientación distinto.
- Checkpoint no seleccionado por test: el autor indica explícitamente que es el checkpoint final, no el mejor según resultados de evaluación, por lo que el rendimiento puede no ser el óptimo alcanzable.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas fuera de la distribución de demostraciones.
- Sesgos: no documentados; el dataset procede de 140 demostraciones de teleoperación de un operador concreto, lo que puede introducir sesgos de estilo de ejecución.
- Idiomas: no aplica; no es un modelo de lenguaje.
- Licencia: MIT, permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- Para producción: requiere validación en el entorno real, ya que no hay métricas de éxito publicadas más allá de los vídeos de los 30 ensayos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sunuk000/act-rb5-lunchbox-packing
- Dataset: https://huggingface.co/datasets/sunuk000/rb5-lunchbox-packing
- Código, vídeos de los 30 ensayos e interfaz del robot: https://github.com/sunuk00/rb5-lunchbox-packing
