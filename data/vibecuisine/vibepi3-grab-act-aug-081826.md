# VibeCuisine/vibepi3-grab-act-aug-081826

## Resumen

El modelo `VibeCuisine/vibepi3-grab-act-aug-081826` es una política robótica basada en ACT (Action Chunking with Transformers), desarrollada por VibeCuisine, una empresa que trabaja en robótica para la preparación de alimentos. El modelo se ha entrenado mediante imitación a partir de 39 episodios de teleoperación, en los que un brazo robótico (con el hardware VibeBoard v3) aprende a agarrar un pepino en un punto concreto. Está diseñado para ejecutarse en el ecosistema LeRobot y se publica como un checkpoint de safetensors con 51,6 millones de parámetros.

La relevancia de este modelo radica en su enfoque práctico: demuestra cómo un dataset curado y un entrenamiento relativamente corto (1 hora y 16 minutos) pueden producir una política de agarre funcional para un escenario doméstico. Aunque no es un modelo de propósito general, sirve como referencia para desarrolladores que trabajan en automatización de cocina o en tareas de manipulación con ACT. El modelo acepta una instrucción en lenguaje natural ("Grab the cucumber at the one-third point") y utiliza tres cámaras (corner, top y wrist) para percibir el entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.609.223 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo robótico, no procesa texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (acepta instrucciones en inglés, pero no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Esto reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. El modelo se entrena desde cero (no se indica uso de pesos preentrenados) sobre un dataset de 39 episodios teleoperados, que suman 2.112 frames a 20 fps. El entrenamiento se realizó con 30.000 pasos, batch size de 8, y una pérdida final de 0,043. Se utilizó un split de evaluación del 10% y aumentos de imagen activados. El checkpoint se generó con la librería LeRobot (versión `b6d46c40`) y el dataset proviene de `VibeCuisine/vibepi3-grab-poseexpert-curated-081826` (revisión `aa2bd373`). No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado puro.

## Capacidades

- Control robótico de un brazo de 7 grados de libertad (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper, tilt).
- Percepción visual mediante tres cámaras RGB (corner, top, wrist) a 640×480 píxeles y 20 fps.
- Condicionamiento por lenguaje: acepta una instrucción textual fija ("Grab the cucumber at the one-third point") para seleccionar la tarea.
- Ejecución de acciones en chunks de 40 pasos (policy.chunk_size=40), lo que permite movimientos suaves y coordinados.
- Integración con el ecosistema LeRobot, lo que facilita la reproducción, evaluación y despliegue en hardware compatible.
- No es un modelo de lenguaje ni de visión general; sus capacidades se limitan a la tarea de agarre para la que fue entrenado.

## Casos de uso

- Automatización de preparación de alimentos en cocinas domésticas: el modelo puede integrarse en un robot como VibeBoard para agarrar ingredientes (p. ej., un pepino) y colocarlos en una posición específica, reduciendo la intervención manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de episodios, el tamaño de chunk o las cámaras en el rendimiento de políticas ACT.
- Desarrollo de pipelines de datos para robótica: el dataset asociado y el flujo de entrenamiento documentado (comando de reproducción incluido) permiten a otros equipos replicar el proceso con sus propios datos.
- Prototipado rápido de tareas de agarre: al ser un modelo pequeño (51M parámetros), puede entrenarse y desplegarse en hardware modesto, ideal para pruebas de concepto en laboratorios.
- Evaluación de hardware robótico: el modelo puede usarse para validar el funcionamiento de brazos robóticos y sistemas de visión en entornos controlados.
- Benchmarking de frameworks de robótica: al estar basado en LeRobot, permite comparar el rendimiento de ACT frente a otras arquitecturas (p. ej., Diffusion Policy) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida final de entrenamiento (0,043) y la duración del entrenamiento (1h 16m). No hay comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Para evaluar su rendimiento real, sería necesario ejecutar pruebas físicas en el robot, lo cual no se documenta en la model card.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- Dado el tamaño del modelo (51,6M parámetros), es probable que quepa en GPUs con poca VRAM (estimación razonable: 2-4 GB), pero no hay datos confirmados.
- El entrenamiento se realizó en una GPU del proveedor "site-gpu", sin especificar el modelo exacto.
- Para inferencia, se puede usar cualquier GPU compatible con PyTorch y CUDA; también es posible ejecutarlo en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo LeRobot, se puede cargar con la librería `lerobot` y ejecutar en el robot. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros modelos comparables en la misma categoría. VibeCuisine ha publicado otros checkpoints similares (por ejemplo, `autorl-grab-act-vibepi-iter8` e `iter5-v1`), pero no se proporcionan sus especificaciones ni resultados. Se puede inferir que son variantes del mismo proyecto con diferentes iteraciones de entrenamiento, pero no hay datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo se entrenó con solo 39 episodios, lo que limita su generalización a variaciones de la tarea (cambios de iluminación, posición del objeto, tipo de pepino, etc.).
- La instrucción en lenguaje es fija; no soporta comandos arbitrarios ni razonamiento semántico complejo.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- No hay información sobre sesgos, pero al ser un modelo robótico entrenado en un entorno específico, puede fallar en condiciones no vistas.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber errores de agarre si el objeto no está en la posición esperada.
- El modelo depende de las tres cámaras configuradas; si alguna falla o cambia su posición, el rendimiento se degrada.
- No se proporcionan métricas de éxito en el mundo real (tasa de agarre exitoso), solo la pérdida de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VibeCuisine/vibepi3-grab-act-aug-081826
- Dataset asociado: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-curated-081826
- Registro de entrenamiento en W&B: https://wandb.ai/jeremyhx-freelance/lerobot/runs/vds47-9284ef15
- Sitio web de VibeCuisine: https://www.vibecuisine.com/
- Organización en GitHub: https://github.com/orgs/VibeCuisine/
- Otros modelos de la misma serie: https://huggingface.co/VibeCuisine/autorl-grab-act-vibepi-iter8 y https://huggingface.co/VibeCuisine/autorl-grab-act-vibepi-iter5-v1
