# TomasAnderegg/pill_sorting_dagger_and_subset

## Resumen

`TomasAnderegg/pill_sorting_dagger_and_subset` es una política de visión-lenguaje-acción (VLA) entrenada con LeRobot y derivada de SmolVLA, el modelo compacto de Hugging Face presentado en el paper arXiv:2506.01844. No es un modelo de lenguaje generalista: es un checkpoint de robótica que mapea una imagen de cámara frontal y un vector de estado articular de 6 dimensiones a un vector de acción de 6 dimensiones, es decir, controla un brazo robótico `so_follower` para ejecutar tareas de clasificación de pastillas por color y forma de compartimento.

El modelo parte de `TomasAnderegg/pill_sorting_vlm_unfrozen_A100` y se ha afinado sobre el dataset `TomasAnderegg/pill_sorting_finetune_merged`, compuesto por 72 episodios y 55.936 fotogramas a 30 FPS, con doce instrucciones en lenguaje natural del tipo "Put the green pill in the circle compartment". El entrenamiento se realizó con LeRobot 0.6.2, 3.000 pasos, batch de 64, optimizador AdamW y learning rate 3e-5. El nombre del repositorio sugiere el uso de DAgger (Dataset Aggregation) combinado con un subconjunto de datos, aunque la model card no detalla la composición exacta de esa mezcla.

Su relevancia es práctica: demuestra el flujo completo de imitación visual-motora con un VLA pequeño (450 millones de parámetros) que cabe en hardware de consumo, publicado bajo licencia Apache 2.0 y reproducible con la CLI de LeRobot. Para desarrolladores de robótica que quieran evaluar políticas VLA de código abierto sin infraestructura de gran escala, es un punto de partida concreto y verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), política de imitación sobre backbone VLM compacto |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; ventana de observación por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un componente de lenguaje para procesar la instrucción de tarea y una cabeza de acción que produce comandos motores. La política consume `observation.state` con forma `(6,)` y `observation.images.front` con forma `(3, 480, 640)`, y emite `action` con forma `(6,)`. El checkpoint se ha afinado desde `pill_sorting_vlm_unfrozen_A100`, un modelo previo del mismo autor en el que, por el nombre, el componente VLM se mantuvo descongelado durante el ajuste en una A100. El robot objetivo es `so_follower` con una única cámara frontal.

El dataset de entrenamiento contiene 72 episodios y 55.936 fotogramas a 30 FPS, con doce tareas que combinan cuatro colores de pastilla (verde, azul, rojo, amarillo) y cuatro formas de compartimento (círculo, triángulo, cuadrado, cruz). La configuración reportada es de 3.000 pasos, batch 64, AdamW, learning rate 3e-5 y semilla 1000, ejecutada con LeRobot 0.6.2. El nombre del repositorio indica el uso de DAgger junto con un subconjunto de datos, una técnica de agregación de datos que incorpora correcciones humanas sobre los estados visitados por la política; la model card no especifica el volumen ni la proporción de esas correcciones, ni si hubo RLHF o DPO (en robótica de imitación no es lo habitual).

## Capacidades

- Control robótico de imitación: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de una imagen frontal y el estado articular.
- Seguimiento de instrucciones en lenguaje natural: ejecuta tareas formuladas como "Put the [color] pill in the [shape] compartment", con doce combinaciones entrenadas.
- Percepción visual en resolución 480x640 a 30 FPS mediante una única cámara.
- Clasificación y manipulación de objetos por color y forma en un entorno de laboratorio controlado.
- Despliegue en hardware de consumo, según la descripción de SmolVLA en el paper.
- No dispone de tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües ni modo thinking; es una política motora, no un asistente conversacional.

## Casos de uso

- Clasificación de pastillas en laboratorio: el modelo ejecuta las doce instrucciones entrenadas sobre un brazo `so_follower`, útil para validar pipelines de manipulación pick-and-place con objetos pequeños y colores diferenciados.
- Base para fine-tuning con LeRobot: sirve como punto de partida (`--policy.path`) para entrenar políticas propias sobre nuevos datasets, tal como indica la model card con `lerobot-train`.
- Evaluación de técnicas de agregación de datos: al estar entrenado con DAgger sobre un subconjunto, permite comparar su comportamiento frente a políticas entrenadas solo con imitación pura en el mismo entorno.
- Reproducción de experimentos académicos: con 450 millones de parámetros y licencia Apache 2.0, es adecuado para replicar resultados de VLA compactos sin clústeres de GPU.
- Docencia y formación en robótica de imitación: el flujo completo (grabación con `lerobot-rollout`, calibración, entrenamiento y despliegue) es reproducible en un laboratorio pequeño.
- Prototipado de automatización farmacéutica a pequeña escala: la tarea de separar pastillas por color y forma es análoga a operaciones de dosificación y verificación en entornos controlados.
- Pruebas de robustez visual: permite estudiar cómo afectan cambios de iluminación, posición de objetos o distracciones a una política entrenada con 72 episodios, un régimen de datos deliberadamente escaso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con una plantilla vacía y la indicación de sustituir la línea "No evaluation results" por una tabla de tasa de éxito, lo que confirma que el autor no ha reportado métricas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors, la inferencia en precisión nativa requiere del orden de 1-2 GB de pesos, más el coste del codificador visual y los buffers de imagen 480x640.
- GPU recomendadas: el modelo base se afinó en una A100 según el nombre del checkpoint previo; para inferencia, cualquier GPU con suficiente memoria para el pipeline de LeRobot debería bastar, aunque no se publican requisitos oficiales.
- GPU de consumo: SmolVLA se describe en el paper como desplegable en hardware de consumo; no se especifican modelos concretos (RTX 4090, RTX 3090, etc.) en la información disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=TomasAnderegg/pill_sorting_dagger_and_subset`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción.
- Latencia y throughput: no disponibles; la política opera a 30 FPS en el dataset de entrenamiento, pero no se reporta latencia de inferencia en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TomasAnderegg/pill_sorting_dagger_and_subset` | 450 M | VLA (SmolVLA afinado) | Imagen 480x640 + estado (6,) | Apache 2.0 | Hugging Face, 33 descargas |
| `TomasAnderegg/pill_sorting_vlm_unfrozen_A100` | no disponible | VLA (SmolVLA, modelo base) | no disponible | no disponible | Hugging Face (referenciado) |
| SmolVLA (modelo original de Hugging Face) | no disponible en la informacion proporcionada | VLA compacto | no disponible | no disponible | Hugging Face / paper arXiv:2506.01844 |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo de modelo, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: solo cubre doce instrucciones de clasificación de pastillas en un entorno concreto; no generaliza a otras tareas, objetos o disposiciones sin reentrenamiento.
- Dependencia de la configuración física: requiere un robot `so_follower`, una cámara llamada `front` y las claves de observación exactas del entrenamiento; cualquier cambio de montaje o calibración degrada el comportamiento.
- Datos de entrenamiento escasos: 72 episodios y 55.936 fotogramas son un volumen reducido, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y fondos vistos durante la recogida.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Riesgo de alucinación motora: como política de imitación, puede ejecutar acciones plausibles pero incorrectas ante estados fuera de distribución, sin señal de incertidumbre.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar las licencias del modelo base y del dataset enlazados.
- Sin datos de sesgos: no se reporta análisis de sesgo visual ni de robustez ante cambios de color, iluminación o presencia de distracciones.
- Fecha de creación futura en los metadatos (2026-10-27): conviene tratarla con cautela al citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_dagger_and_subset
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_vlm_unfrozen_A100
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_finetune_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_finetune_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
