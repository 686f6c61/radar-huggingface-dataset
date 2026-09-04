# taewonkoo/stack_cube_stop_noise_10pct_40ep

## Resumen

El modelo `taewonkoo/stack_cube_stop_noise_10pct_40ep` es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face en el marco de la librería LeRobot. SmolVLA está diseñado para alcanzar un rendimiento competitivo en tareas de manipulación robótica con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Este modelo concreto es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones de apilado de cubos, con 40 episodios y 13.590 fotogramas.

La arquitectura combina un codificador visual con un modelo de lenguaje y una cabeza de acción, generando directamente las acciones del robot a partir de observaciones de estado e imágenes de cámara. Con 450 millones de parámetros, es un modelo de tamaño moderado que puede ejecutarse en tiempo real en GPUs de gama media. Su relevancia radica en demostrar que los VLA pueden ser lo suficientemente ligeros para aplicaciones prácticas en robótica de bajo coste, sin sacrificar la capacidad de aprender tareas complejas mediante imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que procesa observaciones multimodales (imágenes de cámara y estado del robot) y produce acciones de control. El modelo base `lerobot/smolvla_base` ha sido fine-tuneado con el framework LeRobot sobre un dataset de demostraciones humanas. La tarea concreta es "Pick up the wooden cube and place it on top of the Rubik's Cube" (recoger el cubo de madera y colocarlo sobre el cubo de Rubik).

El entrenamiento se realizó durante 30.000 pasos con un tamaño de lote de 4, optimizador AdamW y una tasa de aprendizaje de 0,0001. La semilla utilizada fue 1000 y la versión de LeRobot fue 0.6.2. Las entradas del modelo incluyen el estado del robot (6 dimensiones) y cuatro imágenes de cámara: tres con resolución 256x256 y una cámara adicional de 480x640. La salida es un vector de acción de 6 dimensiones. El dataset de entrenamiento contiene 40 episodios, 13.590 fotogramas a 30 FPS y fue grabado con un robot tipo `so_follower`. La innovación principal es la eficiencia computacional del modelo, que permite ejecutar políticas de imitación en hardware de consumo sin necesidad de servidores dedicados.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones de estado y visión.
- Aprendizaje por imitación de demostraciones humanas para tareas de manipulación.
- Procesamiento de múltiples entradas visuales (tres cámaras de 256x256 y una de 480x640).
- Control de un robot tipo `so_follower` con salida de acción de 6 dimensiones.
- Ejecución en tiempo real con LeRobot, tanto en entrenamiento como en despliegue (rollout).
- No soporta tool calling, generación de texto ni razonamiento simbólico; es exclusivamente un modelo de política robótica.

## Casos de uso

- Apilado de objetos en entornos de laboratorio: el modelo puede ejecutar la tarea de recoger un cubo de madera y colocarlo sobre un cubo de Rubik, sirviendo como referencia para validar pipelines de aprendizaje por imitación.
- Investigación en robótica de bajo coste: gracias a su tamaño compacto, puede integrarse en robots de investigación equipados con GPUs de consumo, facilitando la experimentación con políticas VLA sin infraestructura costosa.
- Benchmark de manipulación en entornos controlados: el dataset y el modelo permiten comparar el rendimiento de políticas de imitación bajo condiciones de ruido (10% de ruido en las demostraciones) y con un número limitado de episodios.
- Desarrollo de sistemas de pick-and-place en almacenes o fábricas simuladas: el modelo puede servir como punto de partida para adaptar la tarea a otros objetos o configuraciones de cámara mediante fine-tuning.
- Evaluación de robustez en visión robótica: al incluir múltiples cámaras y una cámara adicional de mayor resolución, el modelo permite estudiar cómo afectan las distorsiones visuales y el ruido a la precisión de la política.
- Integración en flujos de trabajo de LeRobot: el modelo es compatible con el ecosistema LeRobot, lo que permite usarlo en scripts de `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card del autor indica explícitamente que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parámetros en fp32, los pesos ocupan aproximadamente 1,8 GB. Sumando activaciones y procesamiento de imágenes, se estima que la inferencia puede ejecutarse en GPUs con 6-8 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: para inferencia, una RTX 3060 de 12 GB o superior sería adecuada. Para entrenamiento, se recomienda una GPU con al menos 16 GB, como una RTX 4080 o A100, aunque no se especifica en la documentación.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para desplegarse en hardware de consumo, como se indica en el paper de SmolVLA.
- Opciones de despliegue: mediante LeRobot, utilizando `lerobot-rollout` con `--policy.path=taewonkoo/stack_cube_stop_noise_10pct_40ep`. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje de propósito general.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `taewonkoo/stack_cube_stop_noise_10pct_40ep` | 450M | no aplica | Apache 2.0 | HuggingFace |
| `lerobot/smolvla_base` | 450M | no aplica | Apache 2.0 | HuggingFace |
| `taewonkoo/stack_cube_stop_noise_50pct_40ep` (dataset) | no aplica | no aplica | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. El modelo es un fine-tuning del base, por lo que comparte arquitectura y parámetros. La diferencia principal es el dataset de entrenamiento específico (con 10% de ruido) y la tarea concreta. No hay información sobre otros modelos VLA comparables en la documentación disponible.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente para una tarea específica (apilar cubo sobre cubo de Rubik); no generaliza a otras tareas sin reentrenamiento.
- El dataset tiene solo 40 episodios, lo que puede limitar la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- No se han publicado evaluaciones en robot real, por lo que el rendimiento real en producción es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la licencia en las redistribuciones.
- El modelo no es un LLM: no genera texto, no soporta tool calling ni razonamiento simbólico. Cualquier uso fuera de control robótico no es aplicable.
- La presencia de ruido en el 10% de las demostraciones puede introducir comportamientos subóptimos en la política.
- No se proporcionan pesos cuantizados, lo que limita su despliegue en dispositivos con memoria muy reducida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taewonkoo/stack_cube_stop_noise_10pct_40ep
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_stop_noise_10pct_40ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
