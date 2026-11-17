# TomasAnderegg/pill_sorting_medoc_dagger_mix_v2_model

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face, orientado a control robótico mediante imitación. Este repositorio concreto, `TomasAnderegg/pill_sorting_medoc_dagger_mix_v2_model`, es un fine-tuning de SmolVLA realizado por un tercero (TomasAnderegg) para una tarea muy específica: la clasificación de píldoras por color en compartimentos con formas geométricas. El modelo parte de un checkpoint previo del mismo autor (`pill_sorting_full_ft_a100_v3_dagger60`) y se entrena sobre un dataset propio de 253 episodios y 118.678 frames a 30 FPS.

La arquitectura subyacente es SmolVLA, presentada en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones para producir comandos motores a partir de observaciones visuales y estado propioceptivo. Con aproximadamente 450 millones de parámetros, está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que quieren experimentar con políticas VLA sin infraestructura de gran escala.

Este checkpoint en particular no es un modelo de propósito general: es una política especializada en una tarea de pick-and-place con un robot SO-100/SO-101 (tipo `so_follower`), una cámara frontal y un espacio de acciones de 6 dimensiones. Su interés radica en ser un ejemplo reproducible de flujo DAgger (Dataset Aggregation) aplicado a manipulación robótica con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto con codificador visual y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que procesa observaciones multimodales (imágenes y estado propioceptivo) y genera acciones motoras de forma directa. En este checkpoint, las entradas son `observation.state` de forma `(6,)` y `observation.images.front` de forma `(3, 480, 640)`, y la salida es `action` de forma `(6,)`. La política se ejecuta a 30 FPS y está pensada para control en bucle cerrado sobre un robot `so_follower` con una única cámara frontal.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `TomasAnderegg/pill_sorting_medoc_dagger_mix_v2` (253 episodios, 118.678 frames, 30 FPS), que cubre 14 tareas de clasificación de píldoras por color (rojo, azul, amarillo, verde) en compartimentos con forma (círculo, triángulo, cuadrado, cruz). La configuración reportada es: 48.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. El nombre del dataset y del checkpoint indica el uso de DAgger (Dataset Aggregation), una técnica de imitación interactiva en la que un experto corrige las trayectorias del modelo para reducir el error de covariable. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo RLHF o DPO (no aplicables en este contexto de imitación).

## Capacidades

- Control robótico de manipulación tipo pick-and-place: mueve píldoras de colores a compartimentos con formas geométricas específicas.
- Percepción visual monocámara: procesa imágenes RGB de 480x640 desde una cámara frontal.
- Fusión de estado propioceptivo y visión: combina un vector de estado de 6 dimensiones con la imagen para generar acciones de 6 dimensiones.
- Ejecución de instrucciones en lenguaje natural acotadas: acepta tareas como "Put the red pill in the circle compartment." entre las 14 definidas en el dataset.
- Política de imitación entrenada con DAgger: incorpora correcciones de experto para mejorar la robustez frente a desviaciones.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política motora, no un LLM conversacional.
- Capacidades multilingües: no disponibles; las instrucciones de tarea están en inglés y limitadas al conjunto entrenado.

## Casos de uso

- Clasificación automatizada de píldoras en entornos de laboratorio farmacéutico: el modelo puede mover píldoras de colores a compartimentos con formas predefinidas, útil para prototipos de dosificación o verificación visual en líneas pequeñas.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar DAgger y fine-tuning de SmolVLA sobre datasets propios con LeRobot.
- Benchmark de políticas VLA en hardware de consumo: al tener 450M de parámetros, permite validar pipelines de entrenamiento e inferencia en GPUs asequibles antes de escalar a modelos mayores.
- Automatización de tareas de pick-and-place en robótica educativa: con un robot SO-100/SO-101 y una cámara, se puede desplegar en aulas o laboratorios para demostrar control visual.
- Pruebas de robustez ante variaciones de iluminación y posición: el checkpoint permite evaluar cómo generaliza una política entrenada con 253 episodios a condiciones no vistas.
- Generación de datos sintéticos o aumentados para entrenamiento: las trayectorias ejecutadas por la política pueden servir como base para bootstrapping de nuevos datasets con correcciones humanas.
- Integración en pipelines de investigación con LeRobot: el comando `lerobot-rollout` permite ejecutar la política y comparar con otros checkpoints del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía, con una plantilla para reportar tasas de éxito por tarea, pero no contiene datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450M de parámetros en fp32 serían aproximadamente 1,8 GB de pesos, más el codificador visual y buffers de activación, lo que sugiere un consumo moderado en GPUs de consumo.
- GPU recomendadas: no especificadas en la información disponible; el modelo base se entrenó en A100 según el nombre del checkpoint (`full_ft_a100_v3`), pero la inferencia está pensada para hardware de consumo según el paper de SmolVLA.
- ¿Cabe en GPU de consumo? Sí, según la descripción de SmolVLA como modelo desplegable en hardware de consumo; no se detallan modelos concretos (RTX 4090, RTX 3060, etc.) en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de inferencia en bucle cerrado sobre robot `so_follower`.
- Latencia y throughput: no disponibles; la política se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TomasAnderegg/pill_sorting_medoc_dagger_mix_v2_model` | 450M | no disponible | Clasificación de píldoras (pick-and-place) | apache-2.0 | Hugging Face |
| SmolVLA (base, Hugging Face) | no disponible en la información | no disponible | VLA general para manipulación | no disponible en la información | Hugging Face |
| `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60` | no disponible | no disponible | Clasificación de píldoras (checkpoint previo) | no disponible en la información | Hugging Face |
| OpenVLA | no disponible en la información | no disponible | VLA general para manipulación | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de éxito, MMLU, HumanEval, GSM8K) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta las 14 tareas de clasificación de píldoras definidas en el dataset; no generaliza a otras instrucciones ni objetos.
- Dependencia del entorno de entrenamiento: requiere un robot `so_follower`, una cámara frontal con la misma configuración (480x640, 30 FPS) y condiciones visuales similares a las del dataset.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones incorrectas o inseguras ante distribuciones de entrada fuera del dataset (iluminación, posiciones, colores no vistos).
- Sesgos de dataset: 253 episodios y 118.678 frames son un volumen limitado; la cobertura de combinaciones color-forma puede ser desigual y favorecer ciertas trayectorias.
- Sin evaluación publicada: la model card no reporta tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad en producción.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en entornos farmacéuticos o médicos requiere validación regulatoria independiente.
- Idiomas: las instrucciones de tarea están en inglés y limitadas a frases concretas; no hay soporte multilingüe.
- Contexto: no se especifica longitud de contexto; al ser una política de control, el "contexto" es la observación actual, no una ventana de texto.
- Repositorio de 14,9 GB: incluye checkpoints y artefactos de entrenamiento; el peso real del modelo es de 450M de parámetros, pero el tamaño del repo puede complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_medoc_dagger_mix_v2_model
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_medoc_dagger_mix_v2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_medoc_dagger_mix_v2
