# viamrobotics/smolvla-box-bot-subtasks

## Resumen

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) compactos desarrollada por Hugging Face, diseñada para controlar robots manipuladores a partir de observaciones visuales y una instrucción en lenguaje natural. `viamrobotics/smolvla-box-bot-subtasks` es un ajuste fino concreto de esa familia: parte del modelo base `lerobot/smolvla_base` y se ha entrenado sobre el dataset `viamrobotics/box-opener-subtasks` para ejecutar cuatro subtareas de apertura de solapas de una caja. Con 450.046.176 parámetros (≈450 M), está muy por debajo de los VLA habituales de 3 a 7 mil millones de parámetros, lo que permite desplegarlo en hardware de consumo y ejecutarlo en el bucle de control de un brazo robótico de bajo coste.

El modelo consume dos flujos de cámara a 480×640 píxeles y un vector de estado de 6 dimensiones (`observation.state`), y produce un vector de acción de 6 dimensiones (`action`) que se envía directamente al robot. La instrucción de tarea se pasa como cadena de texto (`"open first box flap"`, `"open second box flap"`, etc.), de modo que la misma política resuelve las cuatro subtareas en función del prompt.

Su relevancia actual es doble. Por un lado, demuestra que un VLA de menos de 500 M de parámetros puede especializarse en una tarea de manipulación con solo 124 episodios y 74.068 fotogramas de datos de imitación. Por otro, sirve como plantilla reproducible: la model card documenta la configuración exacta de entrenamiento (7500 pasos, batch 64, AdamW, learning rate 2,5e-4, LeRobot 0.6.2) y los comandos de LeRobot para reproducir el ajuste fino o reentrenar la política con datos propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); transformer con backbone de visión-lenguaje preentrenado y experto de acción que genera *action chunks* mediante flow matching |
| Parametros totales | 450.046.176 (≈450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible; las instrucciones del dataset y de los ejemplos de la model card están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, en el formato de política de LeRobot; tamaño del repositorio 15,8 GB |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Entradas | `observation.state` `(6,)`; `observation.images.webcam` `(3, 480, 640)`; `observation.images.realsense_webcam` `(3, 480, 640)` |
| Salidas | `action` `(6,)` |
| Dataset de entrenamiento | `viamrobotics/box-opener-subtasks`: 124 episodios, 74.068 fotogramas, 30 FPS |
| Tareas | `open first box flap`, `open second box flap`, `open third box flap`, `open fourth box flap` |
| Configuracion de entrenamiento | 7500 pasos, batch 64, AdamW, lr 0.00025, seed 1000, LeRobot 0.6.2 |
| Descargas / likes en el Hub | 17 descargas, 0 likes (a fecha de actualización del repositorio, 2026-09-17) |

## Arquitectura y entrenamiento

SmolVLA combina un backbone de visión-lenguaje preentrenado (la familia SmolVLM) con un experto de acción ligero entrenado con un objetivo de *flow matching* que predice secuencias de acciones (*action chunks*) en lugar de una única acción por paso. El paper asociado (arXiv:2506.01844) describe el preentrenamiento del modelo base sobre el corpus de datasets comunitarios de LeRobot, lo que confiere al backbone una representación visual y semántica reutilizable; el ajuste fino posterior solo tiene que adaptar el experto de acción y las capas de proyección al robot y a la tarea concretos. El resultado son 450 M de parámetros, un orden de magnitud menos que OpenVLA (≈7 B) o que los VLA de Physical Intelligence (≈3 B).

El ajuste fino de este repositorio se realizó sobre `viamrobotics/box-opener-subtasks`, un dataset de imitación de 124 episodios capturados a 30 FPS con dos cámaras (`webcam` y `realsense_webcam`) a resolución 480×640. Son 74.068 fotogramas en total, repartidos entre las cuatro subtareas de apertura de solapas. La model card no documenta qué proporción de fotogramas corresponde a cada subtarea ni si hubo aumento de datos. Tampoco se menciona RLHF ni DPO: el entrenamiento es de imitación supervisada pura sobre demostraciones teleoperadas, con 7500 pasos de optimización, batch de 64 y AdamW a un learning rate de 2,5e-4. La única innovación técnica destacable documentada en el paper de la familia es la inferencia asíncrona, que desacopla la frecuencia de ejecución del experto de acción de la del backbone de visión-lenguaje para reducir el coste computacional del bucle de control.

## Capacidades

- Control robótico de manipulación: genera vectores de acción de 6 grados de libertad para abrir secuencialmente las cuatro solapas de una caja.
- Condicionamiento por instrucción en lenguaje natural: la subtarea se selecciona mediante el texto de la tarea, de modo que una única política cubre las cuatro subtareas del dataset.
- Fusión de dos vistas de cámara: integra simultáneamente `webcam` y `realsense_webcam` a 480×640 para la percepción del entorno.
- Política reactiva en bucle cerrado: consume el estado del robot (`observation.state`, 6 dimensiones) y las imágenes en cada paso y emite acciones de forma continua.
- Ejecución en hardware de consumo: el tamaño del modelo permite inferencia en GPU de gama media, Apple Silicon o CPU.
- Capacidad de reajuste: sirve como punto de partida para fine-tuning con el comando `lerobot-train` sobre datasets propios.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso en lenguaje ni generación de texto libre: es una política de acción, no un modelo conversacional.
- Capacidades multilingües: no disponibles; las instrucciones de tarea usadas en el entrenamiento y en los ejemplos están en inglés.

## Casos de uso

- Automatización de apertura de cajas en logística y *packing*: el modelo ejecuta las cuatro subtareas de apertura de solapas sobre una caja situada en el puesto de trabajo, con la instrucción de tarea correspondiente. Es adecuado porque la política está entrenada específicamente sobre esa secuencia y consume dos vistas de cámara para localizar las solapas.
- Base para fine-tuning en manipuladores de bajo coste: partiendo de `lerobot/smolvla_base` con `--policy.path=lerobot/smolvla_base`, un equipo puede grabar 100-200 episodios de su propia tarea y obtener una política especializada en horas de GPU, no en semanas. El dataset de referencia demuestra que 124 episodios y 7500 pasos son suficientes para una tarea de contacto.
- Prototipado rápido de puestos robotizados en laboratorio: con 450 M de parámetros, la política cabe en una sola GPU y se puede iterar sobre la posición de cámara, la altura del brazo o la iluminación sin reentrenar desde cero.
- Investigación en aprendizaje por imitación con presupuestos reducidos: el repositorio documenta la configuración completa (pasos, batch, optimizador, semilla y versión de LeRobot), lo que permite reproducir el experimento y comparar variantes arquitectónicas con un coste de cómputo bajo.
- Docencia y formación en robótica: el flujo `lerobot-rollout` con `--duration=60` permite demostrar en directo el ciclo percepción-acción sobre un brazo real, con trazabilidad del dataset y de los hiperparámetros.
- Punto de comparación para políticas de manipulación: al ser un VLA de 450 M con licencia Apache 2.0 y pesos abiertos, sirve como referencia frente a modelos mucho mayores a la hora de medir el compromiso entre tamaño y tasa de éxito en una tarea de contacto.
- Integración en pipelines de recogida de datos: la política se puede ejecutar junto a `lerobot-rollout` para generar episodios adicionales con el *strategy* de grabación activado, alimentando un ciclo iterativo de mejora del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea «_No evaluation results have been provided for this policy yet_», es decir, no hay tabla de ensayos reales con número de intentos y tasa de éxito por tarea. Tampoco se proporcionan cifras de latencia, *throughput* ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- Memoria de pesos: con 450 M de parámetros, aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32. El repositorio ocupa 15,8 GB porque incluye los *checkpoints* del entrenamiento, no solo los pesos necesarios para inferencia.
- VRAM estimada para inferencia: del orden de 2 a 4 GB sumando pesos, activaciones y los dos tensores de imagen de 3×480×640. La cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o RTX 4090 deja margen de sobra. No se requieren A100 ni H100 para inferencia, solo para reentrenar con lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU consumer actuales y en bastantes integradas.
- CPU y Apple Silicon: LeRobot permite ejecutar la política en CPU y en MPS, con latencias mayores que en CUDA; no se publican cifras concretas para este modelo.
- Requisito de tiempo real: el dataset se capturó a 30 FPS, por lo que el bucle de control necesita resolver una acción cada ≈33 ms para operar a esa frecuencia. El paper de SmolVLA propone la inferencia asíncrona precisamente para permitir que el experto de acción se ejecute más rápido que el backbone de visión-lenguaje.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) con `--policy.path=viamrobotics/smolvla-box-bot-subtasks`; no hay soporte documentado para vLLM, TGI, Ollama o llama.cpp, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles para esta política concreta.

## Comparativa con modelos similares

Los datos de esta política proceden de la información proporcionada. Las cifras de los modelos alternativos son aproximadas, proceden de conocimiento general sobre el estado del arte y deben verificarse antes de citarlas.

| Modelo | Parametros | Enfoque de accion | Licencia | Disponibilidad |
|---|---|---|---|---|
| `viamrobotics/smolvla-box-bot-subtasks` (este modelo) | 450 M | Flow matching sobre *action chunks*, experto de acción desacoplado | Apache 2.0 | Pesos abiertos en Hugging Face, integrado en LeRobot |
| SmolVLA base (`lerobot/smolvla_base`) | 450 M | Igual, sin especializar en tarea | Apache 2.0 | Pesos abiertos; requiere fine-tuning para cada robot |
| OpenVLA | ≈7 B | Predicción discreta de tokens de acción sobre Llama-2-7B con codificadores DINOv2 y SigLIP | No verificada | Pesos abiertos, pero requiere GPU de gama alta para inferencia |
| pi0 (Physical Intelligence) | ≈3 B | Flow matching con backbone PaliGemma y experto de acción | No verificada | Pesos abiertos con acceso sujeto a condiciones del autor |
| GR00T N1 (NVIDIA) | ≈2,2 B | Modelo fundacional VLA con doble sistema (razonamiento y acción) | No verificada | Pesos abiertos |

La diferencia principal de este modelo frente a los anteriores no es el rendimiento bruto, sino el orden de magnitud en coste de inferencia: 450 M de parámetros permiten ejecutar el bucle de control completo en hardware de consumo, algo inviable con un VLA de 3 a 7 B sin cuantización agresiva o servidores dedicados.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para abrir las cuatro solapas de una caja concreta. No generaliza a otras tareas, otros objetos ni otras disposiciones de la escena sin un nuevo ajuste fino.
- Dataset pequeño: 124 episodios son suficientes para una tarea de contacto repetitiva, pero implican un riesgo alto de sobreajuste a la iluminación, al fondo, a la posición de la caja y al robot concreto usados durante la grabación.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, ni número de ensayos, ni condiciones de dificultad documentadas. Cualquier uso en producción exige una validación propia.
- Dependencia estricta de la configuración: los nombres de las cámaras (`webcam`, `realsense_webcam`), sus índices, sus resoluciones (480×640), la frecuencia (30 FPS) y la dimensionalidad del estado (6) deben coincidir exactamente con los del entrenamiento; cualquier desviación invalida la política.
- Restricción de hardware robótico: la salida de 6 dimensiones limita su uso a brazos de 6 grados de libertad, típicamente de la familia SO-100/SO-101 empleada por LeRobot. No sirve para robots con otra cinemática sin reentrenar.
- Sesgo de dominio: el comportamiento hereda los sesgos del dataset de demostración (posiciones alcanzables, fuerza aplicada, secuencia de movimientos). Fuera de esa envolvente, la política puede fallar de forma silenciosa, sin ninguna señal de incertidumbre.
- Alucinación: el concepto no aplica en sentido lingüístico, pero existe el fenómeno equivalente de acciones incorrectas ejecutadas con alta confianza; al ser una política puramente reactiva, no hay módulo de verificación ni de rechazo de la acción.
- Idiomas: no hay evidencia de que el modelo responda a instrucciones de tarea en castellano; el condicionamiento se ha entrenado con textos en inglés.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo `NOTICE` si existe. Hay que verificar además las condiciones del modelo base `lerobot/smolvla_base`, que también es Apache 2.0 según la información disponible.
- Seguridad física: al tratarse de una política que controla un robot real, cualquier despliegue debe incorporar paradas de emergencia, límites de par y supervisión humana durante las primeras ejecuciones.
- Procedencia de los enlaces: la búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo; los resultados obtenidos correspondían a sitios sin relación con robótica ni con SmolVLA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viamrobotics/smolvla-box-bot-subtasks
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/viamrobotics/box-opener-subtasks
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=viamrobotics/box-opener-subtasks
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
