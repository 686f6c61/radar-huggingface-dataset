# Yewy/mahjong_mat_pickup_jitter_v3_v7_policy

## Resumen

`Yewy/mahjong_mat_pickup_jitter_v3_v7_policy` es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación publicado en 2023 (arXiv:2304.13705) que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo lo publica el usuario Yewy en Hugging Face y está empaquetado con la librería LeRobot de Hugging Face, lo que permite entrenarlo, evaluarlo y desplegarlo con las herramientas estándar del ecosistema.

La política está especializada en una tarea concreta: la recogida de una alfombrilla de mahjong con variaciones de jitter (ruido o perturbación en la trayectoria), según indica el identificador del dataset de entrenamiento `Yewy/mahjong_mat_pickup_jitter_v3_v7_224`. El sufijo 224 sugiere resolución de entrada de 224x224 píxeles. Está pensada para robots tipo SO-101 y LeKiwi, plataformas de bajo coste habituales en LeRobot.

Con 51.668.614 parámetros y un repositorio de solo 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto. No es un modelo de lenguaje: no procesa texto ni responde preguntas, sino que mapea observaciones visuales y de estado del robot a comandos de acción. Su relevancia radica en ser un ejemplo práctico de política visomotora entrenada de extremo a extremo para manipulación robótica de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente ResNet preentrenado) con un transformer que genera *chunks* de acciones de longitud fija. En lugar de predecir una única acción por paso, el modelo emite una secuencia de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. El entrenamiento se realiza sobre demostraciones teleoperadas, sin refuerzo ni recompensa explícita.

Los datos de entrenamiento provienen del dataset `Yewy/mahjong_mat_pickup_jitter_v3_v7_224`, que contiene episodios de la tarea de recogida de una alfombrilla de mahjong con perturbaciones de jitter. No se especifica en la información disponible el número de episodios, la composición exacta del dataset ni si hubo aumentación adicional. El modelo está etiquetado para robots SO-101 y LeKiwi, lo que indica que las demostraciones se capturaron con esas plataformas y cámaras asociadas.

## Capacidades

- Control visomotor para manipulación robótica: recogida de objetos planos (alfombrilla de mahjong) a partir de observaciones de cámara.
- Predicción de chunks de acciones para control continuo y suave.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatible con robots SO-101 y LeKiwi.
- Robustez ante variaciones de jitter en la trayectoria, según el nombre del dataset de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Automatización de picking de objetos planos en líneas de montaje: la política puede recoger alfombrillas o piezas delgadas depositadas sobre una superficie, usando la cámara del robot para localizar el objeto y ejecutar la trayectoria de agarre.
- Prototipado rápido de tareas de manipulación con SO-101: al estar entrenada con LeRobot, se puede desplegar en un brazo SO-101 de bajo coste para validar un pipeline completo de captura, entrenamiento e inferencia en laboratorio.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios en el dataset o estrategias de aumentación de datos.
- Evaluación de robustez ante perturbaciones: el sufijo "jitter" del dataset permite estudiar cómo afecta el ruido en las demostraciones a la tasa de éxito final.
- Formación y docencia en robótica: ejemplo didáctico de política visomotora entrenada de extremo a extremo con herramientas open source.
- Despliegue en robots LeKiwi móviles: la política puede integrarse en plataformas móviles de bajo coste para tareas de recogida en entornos controlados.
- Benchmark interno de infraestructura: modelo pequeño (51,7 M de parámetros, 0,2 GB) útil para medir latencia y throughput de pipelines de inferencia robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; también es viable en CPU para inferencia de baja frecuencia, aunque no se recomienda para control en tiempo real.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face; no se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yewy/mahjong_mat_pickup_jitter_v3_v7_policy | 51,7 M | Recogida de alfombrilla de mahjong (ACT) | apache-2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | Manipulación diversa | apache-2.0 (típico) | Hugging Face |
| Políticas Diffusion Policy | variable | Manipulación visomotora | variable | Hugging Face / repos académicos |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | Manipulación generalista con lenguaje | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (recogida de alfombrilla de mahjong) y no generaliza a otros objetos o entornos sin reentrenamiento.
- Sin datos de evaluación publicados: no hay tasas de éxito ni métricas de robustez verificables.
- Dependencia del dataset y la plataforma: el rendimiento puede degradarse si se cambia la cámara, la iluminación o el robot respecto a las condiciones de captura.
- Riesgo de sobreajuste al jitter específico del dataset: la variabilidad introducida puede no cubrir perturbaciones reales del entorno de despliegue.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no apta para tareas que requieran interpretación de instrucciones en lenguaje natural.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar en el entorno real antes de producción.
- Modelo de robótica con 23 descargas y 0 likes: ecosistema mínimo, sin comunidad ni mantenimiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Yewy/mahjong_mat_pickup_jitter_v3_v7_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_mat_pickup_jitter_v3_v7_224
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
