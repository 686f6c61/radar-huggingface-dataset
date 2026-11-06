# TAPTIC/multitask_7tasks_GR00T17_40k

## Resumen

`TAPTIC/multitask_7tasks_GR00T17_40k` es un checkpoint final de una política robótica de tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base `nvidia/GR00T-N1.7-3B` de NVIDIA. Lo publica la organización TAPTIC en Hugging Face y está entrenado con la librería LeRobot sobre un conjunto privado de siete tareas de manipulación. El modelo resuelve el problema de control motor de propósito general en un entorno concreto: dado un estado de 40 dimensiones y observaciones visuales, genera acciones para ejecutar tareas como insertar un cilindro en su hueco, abrir una botella o despejar una mesa.

El interés técnico está en que demuestra el flujo de adaptación de un VLA de 3.144 millones de parámetros a un dominio específico mediante aprendizaje por imitación, con 40.000 pasos de entrenamiento y batch de 64. Es un artefacto de investigación, no un producto: tiene cero descargas, cero likes y su licencia restringe el uso a investigación y evaluación no comercial. La relevancia ahora mismo es doble: por un lado, sirve como referencia de cómo se ajusta GR00T N1.7 con LeRobot; por otro, documenta un caso de eliminación de la modalidad táctil del estado (se descartan las lecturas de taxels), lo que acota qué información sensorial usa realmente la política.

El contexto de entrenamiento es corto en datos (550 episodios, 186.419 fotogramas a 10 fps) y el modelo no está pensado para generalización amplia, sino para las siete tareas descritas. No se han publicado benchmarks ni métricas de éxito en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el modelo base NVIDIA GR00T N1.7; pesos en formato LeRobot |
| Parámetros totales | 3.144.016.000 (3,14 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje conversacional) |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigación y evaluación no comercial |
| Formato de pesos | safetensors (repositorio de 12,6 GB), librería `lerobot` |
| Modelo base | `nvidia/GR00T-N1.7-3B` |
| Pipeline | robotics |
| Pasos de entrenamiento | 40.000, batch size 64 |
| Dataset de ajuste | `TAPTIC/multitask_7tasks_reduced` (privado): 550 episodios, 186.419 fotogramas a 10 fps, 10 % reservado para evaluación |
| Dimensión del estado | 40 (sin lecturas crudas de taxels táctiles) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del VLA `nvidia/GR00T-N1.7-3B`, un modelo de visión-lenguaje-acción de 3,14 mil millones de parámetros diseñado para control robótico. Sobre esa base, TAPTIC aplica un ajuste fino supervisado con LeRobot durante 40.000 pasos y batch de 64, usando un dataset privado de 550 episodios repartidos en siete tareas de manipulación (100 episodios para cuatro tareas y 50 para las tres restantes). El 10 % de los episodios se reserva para evaluación, aunque no se publican los resultados de esa evaluación.

La innovación destacable del ajuste es la reducción del espacio de estado: el vector de estado es de 40 dimensiones y se han eliminado las lecturas crudas de taxels táctiles, de modo que la política depende de visión y propiocepción (más cualquier otra señal conservada en esas 40 dimensiones) y no de la señal táctil directa. No se documenta en la model card si hubo RLHF, DPO ni qué composición exacta tiene el dataset más allá del recuento de episodios y la tasa de 10 fps. Tampoco se detalla la estrategia de congelación de capas ni hiperparámetros de optimización.

## Capacidades

- Generación de acciones de manipulación robótica para siete tareas concretas de pick-and-place, inserción, apertura de botellas y despeje de mesa.
- Control multi-tarea con una única política: el mismo checkpoint cubre las siete tareas del dataset, sin cabezas separadas documentadas.
- Procesamiento de observaciones visuales y de un vector de estado de 40 dimensiones.
- Ejecución de secuencias de agarre delicado ("gently grasp the plastic glass") y de inserción precisa ("insert it in the wallet", "put it in the corresponding hole").
- Manipulación de objetos apilados ("pick up one cup from the stack of cups").
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento. Es un modelo de acción, no un asistente conversacional.

## Casos de uso

- Investigación en aprendizaje por imitación multi-tarea: usar el checkpoint como línea base reproducible para comparar estrategias de ajuste fino de GR00T N1.7 con LeRobot sobre dominios reducidos.
- Evaluación de políticas de inserción precisa: la tarea de introducir la tarjeta en la cartera y el cilindro elíptico en su hueco permiten medir tolerancia a error de posicionamiento en benchmarks internos.
- Estudio del papel de la modalidad táctil: al eliminar los taxels del estado, el modelo sirve para analizar cuánto rendimiento se pierde al prescindir de señal táctil cruda en tareas de agarre delicado.
- Automatización de líneas de montaje acotadas: despeje de mesa y colocación de objetos en caja son tareas de recogida y clasificación que se pueden prototipar en un banco de pruebas con un único brazo.
- Manipulación de objetos deformables o frágiles: la tarea de vaso de plástico con consigna de agarre suave es un caso de prueba para control de fuerza en entornos de laboratorio.
- Generación de datos sintéticos y aumento de dataset: la política ajustada puede emplearse para rodar trayectorias adicionales en simulación y ampliar el corpus de entrenamiento de futuros modelos.
- Docencia y formación en robótica: ejemplo completo y ligero (12,6 GB) de pipeline LeRobot + GR00T para cursos de VLA, con la salvedad de la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se reservó un 10 % de episodios para evaluación, pero no reporta tasas de éxito, métricas de error de trayectoria ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa: en torno a 6-7 GB solo para pesos en fp16 (3,14 mil millones de parámetros), más memoria para activaciones, buffers de observación y el stack de LeRobot; en la práctica conviene reservar 12-16 GB.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a escala; RTX 4090 (24 GB) o RTX A6000 para inferencia y ajuste fino ligero.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, A6000). En 8-12 GB requeriría cuantización, de la que no hay información publicada.
- Opciones de despliegue: LeRobot es la librería declarada; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de acción.
- Latencia y throughput: no disponibles. Dependen del robot, de la frecuencia de control (el dataset está a 10 fps) y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TAPTIC/multitask_7tasks_GR00T17_40k` | 3,14 mil millones | no disponible | 7 tareas de manipulación | NVIDIA License, solo investigación no comercial | Hugging Face, 0 descargas |
| `nvidia/GR00T-N1.7-3B` (base) | 3,14 mil millones | no disponible | VLA generalista | NVIDIA License / NVIDIA Open Model License (según el repositorio) | Hugging Face |
| Políticas LeRobot ajustadas (p. ej. ACT, Diffusion Policy) | Del orden de decenas de millones | no aplica | Manipulación de una o pocas tareas | Apache 2.0 habitualmente | Hugging Face, amplia adopción |

La comparación cuantitativa de rendimiento con alternativas no está disponible porque este checkpoint no publica métricas. Frente a políticas ligeras como ACT o Diffusion Policy, la ventaja teórica es la capacidad del VLA base de transferir conocimiento visual y semántico; la desventaja práctica es el coste computacional y una licencia restrictiva.

## Limitaciones y advertencias

- Licencia NVIDIA License: uso limitado a investigación y evaluación no comercial. Cualquier despliegue comercial requiere revisar los términos del modelo base y del repositorio Isaac-GR00T.
- El modelo está ajustado a siete tareas concretas y a un dataset de 550 episodios; la generalización fuera de ese dominio no está documentada y probablemente sea limitada.
- No se publican métricas de éxito ni resultados de la evaluación retenida, por lo que no hay evidencia cuantitativa de rendimiento.
- La eliminación de los taxels táctiles del estado implica que la política no usa señal táctil cruda; el rendimiento en tareas que dependen del tacto puede verse afectado.
- Riesgo de sobreajuste al entorno físico de captura (iluminación, cámara, posiciones de objeto); no se documenta aumento de datos ni variabilidad de escena.
- Sesgos conocidos: no disponibles. Al ser un modelo de acción entrenado con datos privados, no hay análisis de sesgo publicado.
- Riesgo de alucinación en el sentido de trayectorias no válidas o inseguras: como toda política de imitación, puede producir acciones fuera de distribución ante estados no vistos.
- Idiomas: no aplica ni está documentado; no es un modelo de lenguaje para uso conversacional.
- Repositorio con 0 descargas y 0 likes: no hay validación por parte de la comunidad ni issues públicos que documenten comportamiento en producción.
- Fecha de creación indicada como 2026-11-06: conviene verificar la coherencia temporal antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TAPTIC/multitask_7tasks_GR00T17_40k
- Organización TAPTIC en Hugging Face: https://huggingface.co/TAPTIC
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- LeRobot: https://github.com/huggingface/lerobot
- Sitio de TAPTIC: https://app.taptic.ai/auth/login
