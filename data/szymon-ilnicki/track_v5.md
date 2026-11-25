# Szymon-Ilnicki/track_v5

## Resumen

`track_v5` es una política de visión-lenguaje-acción (VLA) publicada por Szymon-Ilnicki en Hugging Face, obtenida mediante fine-tuning de `lerobot/smolvla_base`, el modelo compacto SmolVLA presentado en el paper arXiv:2506.01844. No se trata de un modelo de lenguaje generalista, sino de un controlador robótico entrenado por imitación para un vehículo tipo `f1tenth` (coche RC de escala 1:10), con dos cámaras como entrada visual y un vector de estado de dos dimensiones.

El modelo resuelve una tarea muy concreta: completar vueltas a un circuito en cuatro modalidades (sentido horario y antihorario, a velocidad lenta y rápida). Con 450 millones de parámetros y un repositorio de 1,2 GB, es lo bastante pequeño para ejecutarse en hardware de consumo, lo que encaja con la filosofía de SmolVLA de reducir el coste computacional frente a VLA de mayor tamaño como OpenVLA o RT-2.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de robótica open source con LeRobot: grabar un dataset propio, hacer fine-tuning de un VLA compacto y desplegarlo con `lerobot-rollout`. La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo solo es válido para el robot y la tarea para los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA), derivada de `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, el VLA compacto de SmolVLA descrito en arXiv:2506.01844. La arquitectura combina un codificador visual con un modelo de lenguaje pequeño y una cabeza de acciones que produce comandos motores; el resultado es una política de imitación que mapea observaciones (imágenes y estado) a acciones de dos dimensiones. El modelo base está diseñado explícitamente para despliegue en hardware de consumo, según la model card.

El entrenamiento se realizó sobre el dataset `local/track_v5`: 282 episodios, 14.716 fotogramas a 10 FPS, con cuatro tareas etiquetadas ("complete laps anticlockwise slowly", "complete laps clockwise slowly", "complete laps clockwise fast", "complete laps anticlockwise fast"). La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.7.0. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento por imitación.

Las entradas son dos cámaras (`observation.images.camera1` y `camera2`, tensores de 3×240×424) más `observation.state` de forma (2,); la salida es `action` de forma (2,). El robot objetivo es de tipo `f1tenth`.

## Capacidades

- Control robótico por imitación: genera acciones de dos dimensiones a partir de dos flujos de vídeo y un vector de estado.
- Conducción de circuito: completa vueltas en sentido horario y antihorario, en modo lento y rápido, según la instrucción de tarea.
- Percepción visual multi-cámara: fusiona dos vistas simultáneas a resolución 240×424.
- Condicionamiento por tarea: acepta una descripción textual de la tarea para seleccionar el comportamiento.
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje generalista.
- Capacidades multilingües: no disponibles (no aplica).
- Capacidades especiales: ninguna documentada más allá del control visomotor.

## Casos de uso

- Conducción autónoma de un f1tenth en circuito: el modelo ejecuta vueltas completas controlando dirección y aceleración a partir de las dos cámaras, adecuado porque fue entrenado exactamente para esa tarea y ese chasis.
- Investigación en imitación visual: sirve como punto de partida reproducible para estudiar cómo un VLA compacto aprende políticas de conducción con pocos datos (282 episodios).
- Evaluación de robustez perceptual: al depender de dos cámaras, permite experimentar con cambios de iluminación, posiciones de cámara o distracciones y medir la degradación de la política.
- Benchmark de referencia para fine-tuning: con 450 M de parámetros y Apache 2.0, es una base barata para comparar técnicas de entrenamiento por imitación en robótica de bajo coste.
- Despliegue en hardware de consumo: su tamaño permite ejecutarlo en una estación con GPU de gama media, útil para laboratorios con presupuesto limitado.
- Educación y docencia en robótica: el flujo LeRobot (grabar dataset, entrenar con `lerobot-train`, ejecutar con `lerobot-rollout`) lo convierte en un ejemplo didáctico completo de extremo a extremo.
- Prototipado de conducción en pista a distintas velocidades: las cuatro variantes de tarea permiten probar políticas conservadoras y agresivas con el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors, el peso en FP32 ronda 1,8 GB y en FP16 unos 0,9 GB, más el coste de los dos codificadores visuales y buffers de activación.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, aunque no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente sí, dado el diseño de SmolVLA orientado a hardware de consumo, pero sin cifras oficiales.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=Szymon-Ilnicki/track_v5`; entrenamiento con `lerobot-train` sobre `lerobot/smolvla_base`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El dataset se grabó a 10 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Szymon-Ilnicki/track_v5` | 450 M | no disponible | Conducción f1tenth en circuito | Apache 2.0 | Hugging Face (17 descargas) |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| OpenVLA | no disponible en la información | no disponible | VLA generalista para manipulación | no disponible en la información | no disponible |
| RT-2 | no disponible en la información | no disponible | VLA generalista | propietaria (Google DeepMind) | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a propósito y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: solo es válido para el robot `f1tenth` con las cámaras `camera1` y `camera2` en la configuración exacta de entrenamiento; no generaliza a otros robots ni a otras tareas.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Dataset pequeño y local: 282 episodios y 14.716 fotogramas a 10 FPS limitan la diversidad de condiciones; es probable que sea sensible a cambios de iluminación, pista o montaje de cámara.
- Riesgo de sobreajuste al circuito: las cuatro tareas se refieren al mismo trazado, de modo que el modelo puede fallar en pistas distintas.
- Sesgos conocidos: no documentados, pero al ser imitación de un conductor humano concreto hereda sus sesgos de conducción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Advertencia de producción: no debe usarse en sistemas de conducción reales o entornos con personas sin validación exhaustiva y medidas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset: https://huggingface.co/datasets/local/track_v5
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/track_v5
