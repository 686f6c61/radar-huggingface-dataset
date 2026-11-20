# Yewy/mahjong_surfaces_standard_mat_v1_v14_policy

## Resumen

El modelo `Yewy/mahjong_surfaces_standard_mat_v1_v14_policy` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. Lo desarrolla el usuario Yewy y está orientado a la manipulación de piezas de mahjong sobre superficies estándar, empleando brazos robóticos de tipo SO-101 y plataformas móviles LeKiwi. No es un modelo de lenguaje: es un controlador visomotor que traduce observaciones de cámara en secuencias cortas de acciones articulares.

La relevancia de esta ficha radica en que ejemplifica el flujo actual de robótica open source basada en aprendizaje por imitación: un dataset de demostraciones teleoperadas, un entrenamiento con LeRobot y un checkpoint en safetensors listo para desplegar en hardware de bajo coste. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en GPU de consumo.

Al estar especializado en una tarea muy concreta (manipulación de mahjong sobre una superficie estándar), su utilidad fuera de ese dominio es limitada, pero sirve como referencia reproducible para quien quiera entrenar políticas ACT similares con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; ventana de observación definida por el dataset de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no aplica: modelo visomotor, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador de imágenes (típicamente ResNet) con un transformer que procesa la secuencia de observaciones y genera las acciones futuras de forma conjunta. El modelo se entrenó con LeRobot sobre el dataset `Yewy/mahjong_surfaces_standard_mat_v1_v14_224`, compuesto por demostraciones teleoperadas de la tarea de mahjong sobre superficie estándar, con imágenes a resolución 224.

No se dispone de información sobre el número de episodios, horas de teleoperación ni composición exacta del dataset más allá de su identificador. Tampoco se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; ACT es puramente supervisado sobre demostraciones. La innovación principal es el propio *action chunking*, que permite ejecutar secuencias de control coherentes sin necesidad de replanificación paso a paso.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos articulares a partir de observaciones de cámara.
- Predicción de chunks de acción, lo que permite movimientos suaves y consistentes en tareas de pick-and-place.
- Entrenado específicamente para manipular piezas de mahjong sobre una superficie estándar.
- Compatible con el ecosistema LeRobot: entrenamiento, evaluación y despliegue con `lerobot-train` y `lerobot-record`.
- Orientado a robots SO-101 (brazo seguidor) y plataformas LeKiwi.
- No soporta tool calling, agentes de texto, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de partidas de mahjong robóticas: el modelo puede controlar un brazo SO-101 para reconocer y manipular fichas sobre una superficie estándar, sirviendo como base para demos de juego autónomo.
- Investigación en aprendizaje por imitación: reproducción del pipeline completo de LeRobot (dataset, entrenamiento ACT, evaluación) para estudiar el efecto del *action chunking* en tareas de manipulación fina.
- Benchmark de políticas ACT en hardware de bajo coste: comparar el rendimiento de este checkpoint con otras políticas entrenadas sobre el mismo dataset o variantes.
- Prototipado de robots de mesa para entretenimiento: integración en plataformas LeKiwi para demostraciones interactivas en ferias o laboratorios.
- Docencia en robótica: ejemplo práctico de teleoperación, curación de dataset y despliegue de políticas en un curso de robótica de manipulación.
- Base para *fine-tuning* en tareas similares: reentrenar el checkpoint con nuevas demostraciones de manipulación de objetos pequeños sobre superficies planas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 51,7 M de parámetros (unos 207 MB de pesos); con overhead de activaciones y codificador visual, cabe holgadamente en 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas y sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de NVIDIA, e incluso en iGPU con suficiente memoria compartida para inferencia en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con ROS 2 mediante nodos propios, o exportación a ONNX/TensorRT para latencia mínima.
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, ACT suele ejecutarse a decenas de hercios en GPU de consumo, pero no se documenta aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yewy/mahjong_surfaces_standard_mat_v1_v14_policy | 51,7 M | no aplica | Manipulación de mahjong (ACT) | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot (p. ej. `lerobot/act_aloha_sim_transfer_cube_human`) | ~50 M | no aplica | Manipulación simulada/real genérica | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable, ~100 M | no aplica | Manipulación visomotora | Apache 2.0 | Hugging Face |
| Políticas π0 (Physical Intelligence) | ~3 B | no aplica | Manipulación generalista | no disponible públicamente en su totalidad | Hugging Face |

La comparación con π0 es asimétrica por tamaño y generalidad; este checkpoint es una política especializada y ligera, no un modelo fundacional de robótica.

## Limitaciones y advertencias

- Especialización extrema: solo funciona bien en la tarea y el entorno del dataset de entrenamiento (mahjong sobre superficie estándar); no generaliza a otros objetos ni a otras superficies sin reentrenamiento.
- Sin datos de evaluación publicados: no hay métricas de éxito, por lo que el rendimiento real es desconocido.
- Dependencia del hardware: entrenado para SO-101 y LeKiwi; su uso en otros robots requiere recalibración y probablemente reentrenamiento.
- Sensible a cambios de iluminación, cámara y disposición de las piezas, como toda política de imitación.
- Riesgo de sobreajuste al dataset de demostraciones, con posible degradación ante variaciones menores del entorno.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No apto para tareas de seguridad crítica sin validación exhaustiva en el entorno real.
- Sin información sobre sesgos del dataset (composición demográfica, condiciones de captura), lo que impide evaluar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yewy/mahjong_surfaces_standard_mat_v1_v14_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_surfaces_standard_mat_v1_v14_224
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
