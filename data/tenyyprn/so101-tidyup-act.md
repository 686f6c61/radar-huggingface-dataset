# tenyyprn/so101-tidyup-act

## Resumen
SO101 tidy-up ACT es una política de imitación para robótica basada en la arquitectura ACT (Action Chunking with Transformers), publicada por el usuario tenyyprn. El modelo controla un brazo robótico de bajo coste SO101 con el objetivo de recoger esponjas negras de una mesa y depositarlas en una caja blanca. Se entrenó con LeRobot 0.6.1 y se publica principalmente como referencia comparativa frente a una Diffusion Policy entrenada con los mismos datos.

No es un modelo de lenguaje: es un modelo de control motor que recibe el estado articular (6 ángulos) y dos flujos de imagen de 640×480 (cámara cenital y cámara de muñeca), y emite una secuencia de 100 acciones articulares objetivo. Con 51.668.614 parámetros y un repositorio de 0,2 GB, su interés es acotado: sirve para reproducir un experimento docente de robótica y para estudiar el comportamiento de ACT en tareas con ambigüedad multimodal.

El resultado central del autor es que ACT tiende a colapsar hacia soluciones intermedias cuando la tarea admite dos respuestas válidas (por ejemplo, agarrar una de dos esponjas), lo que se traduce en intentos de agarre en el hueco entre ambas. Esa hipótesis se contrasta con la Diffusion Policy, que obtiene mejores tasas de éxito en la misma configuración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; predice y ejecuta bloques de 100 acciones |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento
ACT es un transformer que aprende trozos de acción (*action chunks*) mediante un esquema de autoencoder variacional condicional (CVAE). La entrada combina el estado articular de 6 dimensiones del seguidor SO101 con dos imágenes RGB de 640×480 (cámara superior Logicool C920 y cámara de muñeca Inno-Maker U20CAM-1080P). La salida es una secuencia de 100 acciones articulares objetivo que se ejecutan en bloque. La función de pérdida combina error L1 sobre las acciones y un término KL con `kl_weight` de 10.

El conjunto de datos consta de 112 demostraciones teleoperadas. El modelo publicado se obtuvo por ajuste fino sobre un modelo previo entrenado con 94 demostraciones, durante 20.000 pasos con tamaño de lote 8. El autor no publica el dataset porque la cámara de muñeca captura parte de la habitación. No se documenta uso de RLHF, DPO ni decodificación especulativa; tampoco se detalla la composición exacta de las trayectorias más allá del escenario descrito (una mesa, una caja, posiciones fijas de cámara).

## Capacidades
- Control de manipulación robótica de una sola tarea: recoger esponjas negras y colocarlas en una caja blanca.
- Entrada multimodal estado + visión: 6 ángulos articulares y dos cámaras RGB a 640×480 y 30 fps.
- Predicción de acciones en bloque de 100 pasos, lo que reduce la acumulación de error frente a políticas paso a paso.
- Ejecución sobre hardware de bajo coste SO101 mediante `lerobot-rollout` con `max_relative_target=10`.
- Generalización limitada a variaciones de colocación dentro de la misma mesa y con las mismas cámaras.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto ni audio.

## Casos de uso
- Reproducción de un experimento docente de imitación: sirve para ejecutar la tarea tidy-up con el comando documentado y comparar el comportamiento con la Diffusion Policy del mismo autor.
- Estudio de colapso multimodal en políticas de imitación: el modelo ejemplifica el fallo de agarrar el espacio entre dos objetos cuando ambos son objetivos válidos, útil para analizar modos promediados en CVAE.
- Línea base en evaluación de políticas robóticas: con 51,7 M de parámetros y licencia Apache 2.0, puede actuar como referencia de ACT frente a otros métodos sobre el mismo dataset y robot.
- Prototipado de pipelines LeRobot: el comando de rollout documentado permite validar la integración de cámaras OpenCV, calibración del SO101 y control articular antes de entrenar políticas propias.
- Demostración de manipulación con hardware de bajo coste: adecuado para talleres o laboratorios con un único brazo SO101 y un escritorio controlado.
- Análisis de sensibilidad a la disposición de objetos: el autor reporta 4 de 5 éxitos en la fila fija ①②③ frente a fallos frecuentes en configuraciones aleatorias, lo que permite estudiar la dependencia de la distribución de entrenamiento.

## Benchmarks y rendimiento
El autor publica una evaluación propia sobre 4 disposiciones aleatorias (celdas ②④⑧, ③④⑧, ①⑤⑦ y ②⑤⑨), con 5 repeticiones por disposición, 20 ensayos en total.

| Métrica | ACT (este modelo) | Diffusion Policy |
|---|---|---|
| Agarre en el hueco entre dos esponjas | 15 / 20 | 0 / 20 |
| Esponjas depositadas en la caja | 29 / 60 (48 %) | 51 / 60 (85 %) |
| Ensayos con las 3 esponjas recogidas | 3 / 20 | 15 / 20 |

En la fila fija ①②③ el modelo completó las 3 esponjas en 4 de 5 intentos. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 51,668 M de parámetros en safetensors el peso ronda los 0,2 GB, por lo que cabe en cualquier GPU consumer con al menos 2-4 GB libres para el modelo y los buffers de imagen.
- GPU recomendadas: no se especifican; cualquier GPU compatible con PyTorch y LeRobot 0.6.1 es suficiente. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, por tamaño; el cuello de botella real es la captura de dos cámaras a 640×480 y 30 fps y el control en tiempo real del brazo.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=tenyyprn/so101-tidyup-act`; requiere robot `so101_follower`, puerto del seguidor, nombre de calibración y las dos cámaras configuradas en formato MJPG.
- Latencia y throughput: no disponibles. La ejecución se plantea con `--duration=45` segundos por episodio y `max_relative_target=10`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tenyyprn/so101-tidyup-act | ACT con CVAE | 51,7 M | Tidy-up con SO101 | Apache 2.0 | Hugging Face |
| tenyyprn/so101-tidyup-diffusion | Diffusion Policy | no disponible | Tidy-up con SO101 | no disponible en la información proporcionada | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT | variable | Manipulación diversa | según modelo | Hugging Face / LeRobot |

La comparación directa relevante es con la Diffusion Policy del mismo autor y mismos datos: ACT logra un 48 % de esponjas en caja frente al 85 %, y 3 de 20 episodios completos frente a 15 de 20, aunque ACT muestra un patrón de fallo específico (agarre entre objetos) que la Diffusion Policy no reproduce.

## Limitaciones y advertencias
- Entrenado con un único robot SO101, una mesa, una caja y posiciones de cámara fijas; el propio autor advierte que probablemente no funcione fuera de ese entorno.
- Fuerte dependencia de la distribución de entrenamiento: funciona mejor con disposiciones fijas (4 de 5 en la fila ①②③) que con colocaciones aleatorias.
- Colapso multimodal documentado: 15 de 20 intentos agarraron el hueco entre dos esponjas, un fallo sistemático en escenarios con dos objetivos válidos.
- Dataset no publicado por privacidad (la cámara de muñeca captura la habitación), lo que impide reproducir el entrenamiento completo.
- Sin datos sobre sesgos, alucinación o comportamiento lingüístico: no aplica, al no ser un modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad práctica queda limitada por la especificidad del hardware y del entorno.
- Solo 19 descargas y 0 likes en el momento de la consulta; no hay validación externa independiente de los resultados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tenyyprn/so101-tidyup-act
- Diffusion Policy comparativa: https://huggingface.co/tenyyprn/so101-tidyup-diffusion
- Vídeo de demostración: https://youtu.be/zCo2obT3ASg
- Código y memoria del proyecto: https://github.com/tenyyprn/so101-tidyup-robot
- Paper de ACT: https://arxiv.org/abs/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
