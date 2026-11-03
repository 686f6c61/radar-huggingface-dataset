# WiiLife/smolvla_candy_pick

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores con hardware de consumo. Este repositorio concreto, `WiiLife/smolvla_candy_pick`, es un fine-tuning de `lerobot/smolvla_base` para una tarea específica de manipulación: coger distintos tipos de caramelos y chocolatinas de un bol y depositarlos en otro. El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo resuelve el problema de la política de imitación extremo a extremo en robótica: recibe el estado de las articulaciones y tres cámaras (256x256 cada una) y emite directamente un vector de acción de 6 dimensiones, sin planificación simbólica intermedia. Frente a los VLA de gran escala (como los de varios miles de millones de parámetros), SmolVLA apuesta por reducir el coste computacional para que la inferencia pueda ejecutarse en GPUs de consumo o incluso en CPU, lo que rebaja la barrera de entrada para laboratorios pequeños y proyectos de robótica de bajo presupuesto.

Es relevante ahora porque demuestra el patrón de trabajo que LeRobot está impulsando: un modelo base preentrenado en el Hub y fine-tunings ligeros por tarea y por robot (en este caso, un SO-100 de bajo coste) que se entrenan con datasets modestos, en este caso 47 episodios y 29.352 frames a 30 FPS. La ficha documenta tanto las capacidades reales del checkpoint como sus límites: no es un modelo de propósito general, sino una política especializada en una única tarea y configuración de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación; sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea son en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | SO-100 (`so100`) |
| Entradas | `observation.state` (6,), 3 cámaras visuales (3, 256, 256) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un codificador visual, un componente de lenguaje y un cabezal de acciones, todo en un modelo de 450 millones de parámetros pensado para inferencia en hardware asequible. La política consume el estado de las articulaciones (vector de 6 dimensiones) junto con tres flujos de imagen de 256x256 píxeles y produce directamente un vector de acción de 6 dimensiones, sin etapas intermedias de planificación. El checkpoint aquí descrito corresponde a un fine-tuning del modelo base `lerobot/smolvla_base`, no a un entrenamiento desde cero.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `WiiLife/candy_pick`: 47 episodios, 29.352 frames a 30 FPS, con instrucciones de tarea en inglés que describen variantes de la misma acción ("pick the candy from the bowl and put it in the other bowl", con múltiples objetos: Smarties, KitKat, Lion, Maoam, etc.). La configuración declarada es de 40.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifican en la información disponible detalles sobre el número de tokens de preentrenamiento del modelo base, la composición del corpus multimodal ni si hubo etapas de RLHF o DPO; el paradigma es de aprendizaje por imitación supervisada sobre demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación extremo a extremo: genera acciones de 6 grados de libertad a partir de observaciones visuales y propioceptivas.
- Fusión multimodal de tres cámaras (configuración `top` y `wrist` según la model card, con tres entradas visuales declaradas) y estado de articulaciones.
- Ejecución de instrucciones de tarea en lenguaje natural en inglés, condicionando la política a la descripción textual de la tarea.
- Generalización dentro de la tarea: el dataset incluye variantes con distintos objetos (caramelos sueltos, cajas de Smarties, chocolatinas KitKat, Lion, Maoam), lo que permite cierta robustez ante cambios de objeto dentro del mismo escenario.
- Despliegue en hardware de consumo: el tamaño de 450 M parámetros y el formato safetensors permiten inferencia en GPU modesta o CPU.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni modo "thinking"; es una política de acción, no un asistente conversacional.

## Casos de uso

- Automatización de picking en líneas de clasificación de pequeños objetos: el modelo puede recoger caramelos o envoltorios de un contenedor y depositarlos en otro, integrándose en una célula robotizada SO-100 para tareas repetitivas de selección y trasvase.
- Prototipado rápido de políticas de manipulación en laboratorios: al partir de `lerobot/smolvla_base` y requerir solo 47 episodios, un equipo puede reproducir el flujo completo de grabación, entrenamiento y despliegue en pocos días con hardware de bajo coste.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para estudiar generalización ante variación de objetos, iluminación y posiciones iniciales dentro de una misma tarea.
- Educación y formación en robótica: el coste del robot SO-100 y la inferencia en GPU de consumo hacen viable montar prácticas de VLA en cursos universitarios o talleres.
- Benchmarking de técnicas de fine-tuning: al ser un checkpoint especializado con dataset y configuración de entrenamiento públicos, permite comparar variantes de hiperparámetros, aumentación de datos o arquitecturas de cabezal de acción.
- Demostraciones y validación de concepto para inversores o clientes: un vídeo de la política ejecutando la tarea sobre el robot real comunica de forma directa la viabilidad de un pipeline VLA de bajo coste.
- Reutilización como inicialización para tareas similares de trasvase de objetos: el fine-tuning sobre `smolvla_base` con este checkpoint como punto de partida puede acelerar la convergencia en escenarios de picking relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en la tarea, tasas de acierto, comparaciones con otras políticas ni evaluaciones cuantitativas del checkpoint fine-tuneado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M parámetros en precisión completa (fp32) el peso ocupa aproximadamente 1,8 GB; en fp16/bf16 alrededor de 0,9 GB; en cuantizaciones de 8 bits o 4 bits, por debajo de 0,5 GB. A ello hay que sumar la memoria de activaciones de las tres cámaras de 256x256 y del codificador visual, no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la práctica; se espera funcionamiento correcto en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No se dispone de cifras oficiales de latencia ni throughput por modelo.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; el cuello de botella real será el bucle de control del robot y la captura de las tres cámaras a 30 FPS.
- Opciones de despliegue: el flujo oficial es `lerobot-rollout` con `--policy.path=WiiLife/smolvla_candy_pick` y `--robot.type=so100`; el entrenamiento se realiza con `lerobot-train`. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que no son el canal natural para una política de acción.
- Latencia y throughput: no disponibles. La model card no publica medidas de frecuencia de inferencia ni de tiempo por paso de control.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WiiLife/smolvla_candy_pick | 450 M | VLA fine-tuneado para tarea de picking | 3 cámaras 256x256 + estado (6,) | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible en la informacion | VLA base preentrenado | multimodal visión-lenguaje-acción | Apache 2.0 (según repositorio base) | Hugging Face (LeRobot) |
| Políticas VLA de gran escala (p. ej. familias tipo OpenVLA) | varios miles de millones | VLA generalista | visión + lenguaje + acción | variable según modelo | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito ni comparaciones directas en la información proporcionada. La diferencia principal frente a VLA de mayor tamaño es el objetivo de despliegue en hardware de consumo a costa de especialización en una única tarea y configuración de robot.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea de trasvase de caramelos entre dos boles con un robot SO-100 y una configuración de cámaras concreta; fuera de ese escenario el rendimiento esperado es nulo o impredecible.
- Dependencia del hardware: los nombres y la disposición de las cámaras (`top`, `wrist`) y el robot `so100` deben coincidir exactamente con los del entrenamiento; cualquier cambio de calibración, iluminación o montaje puede degradar la política.
- Dataset pequeño: 47 episodios y 29.352 frames son un volumen reducido, lo que limita la robustez ante variaciones de posición inicial, oclusión o nuevos objetos no vistos.
- Riesgo de sobreajuste al entorno de grabación: colores de fondo, tipos de bol y posición de la mesa pueden estar implícitamente memorizados.
- Idioma: las instrucciones de tarea del dataset están en inglés y con errores tipográficos; no se declara soporte multilingüe.
- Sin datos de seguridad ni de sesgos: no se han publicado evaluaciones de sesgo, alucinación (en el sentido de acciones erróneas) ni análisis de fallos en producción.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad de validar la seguridad física de la política en un robot real; no hay garantías del autor sobre comportamiento seguro.
- Sin benchmarks publicados: no es posible estimar la tasa de éxito de la tarea a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WiiLife/smolvla_candy_pick
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/WiiLife/candy_pick
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=WiiLife/candy_pick
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
