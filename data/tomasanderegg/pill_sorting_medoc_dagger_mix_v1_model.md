# TomasAnderegg/pill_sorting_medoc_dagger_mix_v1_model

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) disenado para control robótico, desarrollado en el ecosistema de Hugging Face LeRobot y publicado en el paper arXiv 2506.01844. El checkpoint `TomasAnderegg/pill_sorting_medoc_dagger_mix_v1_model` es un ajuste fino especializado en una tarea concreta de clasificación de pastillas (pill sorting), entrenado sobre el modelo base `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60`, que a su vez deriva de SmolVLA. El modelo consume observaciones multimodales (una imagen frontal de 480x640 y un vector de estado de 6 dimensiones) y produce acciones de 6 dimensiones para el robot `so_follower`.

Este checkpoint concreto se ha entrenado mediante imitación (behavior cloning) sobre un dataset de 133 episodios y 78.722 frames a 30 FPS, combinando datos de teleoperación y DAgger (indicado por el sufijo `dagger` en el nombre). La tarea consiste en colocar pastillas de distintos colores (rojo, azul, amarillo, verde) en compartimentos con distintas formas (círculo, cuadrado, triángulo, cruz), lo que constituye un benchmark de manipulación con razonamiento visual y condicionamiento por instrucción en lenguaje natural.

Su relevancia radica en que SmolVLA apunta a despliegue en hardware de consumo, un aspecto poco habitual en modelos VLA de mayor tamano. El checkpoint tiene 450 millones de parámetros y se distribuye en formato safetensors con licencia Apache 2.0, lo que facilita su reutilización y ajuste fino por parte de otros grupos de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones en una arquitectura transformer multimodal. El modelo procesa simultaneamente la imagen de camara frontal (3, 480, 640) y el estado del robot (6 dimensiones), y genera un vector de acción de 6 dimensiones por paso de control. Segun el paper de referencia (arXiv 2506.01844), SmolVLA esta disenado para lograr rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo.

El entrenamiento de este checkpoint concreto se realizo con LeRobot 0.6.2 sobre el dataset `TomasAnderegg/pill_sorting_medoc_dagger_mix_v1` (133 episodios, 78.722 frames, 30 FPS), con 8.000 pasos de entrenamiento, batch size 32, optimizador AdamW y learning rate 1e-5, semilla 1000. El nombre del dataset y del checkpoint indican una mezcla de datos de DAgger con datos de demostracion, estrategia habitual para corregir el error de covariable en imitation learning. No se especifica en la informacion disponible el numero de tokens de entrenamiento del modelo base SmolVLA ni detalles sobre RLHF/DPO.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower` a partir de observaciones visuales y de estado.
- Condicionamiento por instrucción en lenguaje natural: acepta tareas como "Put the red pill in the circle compartment." y ejecuta la política correspondiente.
- Percepción visual en tiempo real: procesa imagenes de 480x640 a 30 FPS desde una camara frontal.
- Clasificación y colocación de objetos por color y forma: cubre 14 combinaciones de tarea (4 colores × 4 formas menos combinaciones no presentes en el dataset).
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y ajuste fino.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente multi-paso, razonamiento textual general, matemáticas o capacidades multilingües.

## Casos de uso

- Clasificación automatizada de pastillas en farmacia hospitalaria: el modelo puede colocarse en un brazo robótico `so_follower` para separar pastillas por color y forma en compartimentos, reduciendo errores de dispensación manual en entornos con alta carga de trabajo.
- Benchmark de imitation learning y DAgger: sirve como referencia reproducible para comparar estrategias de mezcla de datos (teleoperación vs DAgger) en tareas de manipulación con condicionamiento por lenguaje.
- Ajuste fino para nuevas tareas de sorting: al estar construido sobre SmolVLA y LeRobot, permite reentrenar con `lerobot-train` sobre datasets propios de clasificación de objetos pequeños (tornillos, componentes electrónicos, muestras de laboratorio).
- Prototipado de políticas VLA en hardware de consumo: su tamano de 450M parámetros y la orientación del paper a hardware asequible permiten experimentar con VLA en laboratorios con GPUs de gama media.
- Evaluación de robustez ante variaciones de iluminación y posición: al estar entrenado con DAgger, es adecuado para estudiar la recuperación de errores en políticas de manipulación.
- Educación e investigación en robótica: el pipeline completo (dataset público, checkpoint, scripts de rollout) facilita su uso en cursos y proyectos de fin de máster sobre aprendizaje por imitación.
- Integración en pipelines de control con instrucciones en lenguaje: permite que un operador especifique la tarea en lenguaje natural y el modelo traduzca la instrucción en acciones motrices sin reprogramación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450M parámetros en safetensors (probablemente fp32/bf16), la estimacion orientativa es de 2-4 GB para los pesos, mas overhead de activaciones y buffers de imagen.
- GPU recomendadas: no disponibles en la informacion proporcionada. El paper de SmolVLA indica despliegue en hardware de consumo, lo que sugiere compatibilidad con GPUs consumer modernas.
- Compatibilidad con consumer GPU: probable segun la orientacion del paper, pero no confirmada con datos concretos en este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de política robótica de este tipo.
- Latencia y throughput estimados: no disponibles. La tasa de control del dataset es de 30 FPS, lo que da una referencia del ritmo de inferencia objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450M | imagen 480x640 + estado (6,) | pill sorting en `so_follower` | apache-2.0 | Hugging Face |
| SmolVLA base (paper) | no disponible en esta ficha | multimodal VLA | VLA generalista | no disponible | Hugging Face (paper) |
| OpenVLA | no disponible en esta ficha | VLA | manipulación general | no disponible | no disponible |
| RT-2 | no disponible en esta ficha | VLA | manipulación general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a categoria y licencia.

## Limitaciones y advertencias

- Especializacion estrecha: el checkpoint solo se ha entrenado para 14 instrucciones concretas de clasificación de pastillas por color y forma; no generaliza a otras tareas sin ajuste fino.
- Dependencia de hardware específico: requiere robot `so_follower` y camara frontal con calibracion e indices concretos; los nombres de camara deben coincidir con las claves de observacion del entrenamiento.
- Dataset pequeno: 133 episodios y 78.722 frames pueden no cubrir variaciones suficientes de iluminacion, posicion de objetos o fondos, aumentando el riesgo de sobreajuste al entorno de recogida de datos.
- Riesgo de fallo en produccion: las políticas de imitation learning pueden acumular errores fuera de distribucion; aunque el uso de DAgger mitiga el error de covariable, no lo elimina.
- Idiomas: las instrucciones de tarea estan en ingles; no se ha validado el comportamiento con instrucciones en castellano.
- Sesgos: no se documentan sesgos conocidos, pero el dataset limitado a cuatro colores y cuatro formas puede inducir confusion en objetos con apariencia similar.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; conviene revisar la licencia del modelo base SmolVLA y del paper original.
- Sin resultados de evaluacion publicados: la model card incluye una seccion de evaluacion sin rellenar, por lo que no hay tasas de exito verificables para produccion.
- Fecha de creacion futura (2026-11-11) en los metadatos: posible inconsistencia en el repositorio que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_medoc_dagger_mix_v1_model
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_medoc_dagger_mix_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_medoc_dagger_mix_v1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
