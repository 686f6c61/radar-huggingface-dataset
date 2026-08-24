# team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-90000

## Resumen

El modelo `team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-90000` es una política de robótica basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por el equipo SOBITS de la Universidad de Soka (Japón). Se trata de un ajuste fino del modelo base `lerobot/smolvla_base` entrenado con el dataset `sobit_home_left_real-pnp_tea_trash_big-abs-200`, que contiene 200 episodios de teleoperación de un robot móvil manipulador SOBIT HOME. La tarea específica es lanzar una botella de plástico a un cubo de basura.

Con 450 millones de parámetros, SmolVLA está diseñado para ofrecer un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. El modelo se distribuye bajo licencia Apache-2.0 y se integra con el ecosistema LeRobot. Su relevancia radica en que demuestra la viabilidad de los VLA para la robótica doméstica y de asistencia sin necesidad de infraestructura de alta gama, y es uno de los primeros fine-tunings reales (no simulados) de SmolVLA sobre un robot móvil manipulador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción que combina un codificador visual con un módulo de lenguaje y una cabeza de acción. A diferencia de los VLA grandes como Pi0 u OpenVLA, SmolVLA está optimizado para reducir la latencia y el uso de memoria, manteniendo un rendimiento competitivo en tareas de manipulación móvil. Este modelo concreto es un fine-tuning de `lerobot/smolvla_base` sobre datos reales del robot SOBIT HOME, un manipulador móvil con cuatro ruedas independientes, sistema de elevación y brazo articulado.

El entrenamiento se realizó con LeRobot 0.6.0 sobre un dataset de 200 episodios y 42.390 frames a 10 FPS. La configuración incluye 90.000 pasos de entrenamiento, batch size de 16, optimizador AdamW, learning rate de 1e-4 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un ajuste por aprendizaje por imitación supervisado. La política recibe observaciones de dos cámaras RGB (cámara frontal y cámara de la mano izquierda) a 480x640 píxeles y un estado de 20 dimensiones, y produce acciones de 20 dimensiones.

## Capacidades

- Generación de acciones de control para manipulación móvil, con salidas de 20 dimensiones que cubren movimiento de la base, elevación y articulaciones del brazo.
- Procesamiento de visión con dos cámaras RGB simultáneas para percepción del entorno y del objeto a manipular.
- Aprendizaje por imitación de tareas domésticas concretas, como lanzar una botella de plástico a un contenedor.
- Compatibilidad total con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No incluye generación de lenguaje natural, tool calling ni razonamiento simbólico; es una política de acción pura.
- No soporta capacidades multilingües ni modo de pensamiento explícito.

## Casos de uso

- Automatización de tareas de recogida y desecho de residuos en el hogar: el modelo puede lanzar botellas de plástico a un cubo de basura, lo que facilita la asistencia a personas con movilidad reducida.
- Investigación en VLA eficientes: sirve como referencia para estudiar el equilibrio entre tamaño de modelo, consumo de recursos y rendimiento en manipulación móvil.
- Prototipado de políticas de aprendizaje por imitación en el robot SOBIT HOME: permite evaluar el flujo completo de LeRobot (grabación, entrenamiento y rollout) en un entorno real.
- Entrenamiento de nuevas tareas de pick-and-place: partiendo de este modelo, se puede realizar un fine-tuning con un pequeño dataset de nuevas tareas domésticas (por ejemplo, recoger objetos de una mesa y colocarlos en una caja).
- Evaluación de la transferencia sim2real: junto a los modelos simulados de SOBITS, permite comparar el rendimiento de políticas entrenadas en simulación frente a las entrenadas con datos reales.
- Integración en sistemas de asistencia robótica para personas mayores: el robot puede ejecutar la tarea de forma autónoma bajo supervisión, liberando al usuario de esfuerzo físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica que no hay resultados de evaluación para esta política. El paper de SmolVLA (arXiv:2506.01844) reporta métricas de referencia, pero no están disponibles para este fine-tuning específico.

## Requisitos de hardware

- Peso del modelo: aproximadamente 1,2 GB en safetensors (FP32). En FP16, los pesos ocupan unos 900 MB.
- VRAM estimada para inferencia: entre 2 y 4 GB, dependiendo de la precisión y el tamaño de lote. Cabe en GPU de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB).
- GPU recomendadas para entrenamiento: RTX 3090/4090 o A100/H100 para reducir el tiempo de entrenamiento, aunque el ajuste fino de 90.000 pasos es factible en una GPU consumer de 12 GB.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), compatible con PyTorch; también se puede exportar a ONNX para inferencia en tiempo real si se optimiza.
- Latencia y throughput: no se han publicado datos específicos para este modelo, pero SmolVLA está diseñado para inferencia de baja latencia en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Dominio |
|---|---|---|---|---|
| `sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-90000` (este) | 450M | No disponible | Apache-2.0 | Real (robot SOBIT HOME) |
| `sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-90000` | 450M | No disponible | Apache-2.0 | Simulación (tomate al cubo) |
| `sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-90000` | 450M | No disponible | Apache-2.0 | Simulación (pera al bol) |
| `lerobot/smolvla_base` | 450M | 8K tokens | Apache-2.0 | VLA general preentrenado |

La comparativa se limita a los modelos de la misma familia (SmolVLA de SOBITS). No se dispone de datos contrastados con otros VLA como Pi0 u OpenVLA en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea concreta y específica (lanzar botella al cubo) y no generaliza a otras tareas sin un nuevo fine-tuning.
- No hay resultados de evaluación reales en el robot publicados, por lo que la tasa de éxito real no está validada.
- El dataset de entrenamiento contiene solo 200 episodios, lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en hardware requiere conocimientos de robótica y el robot SOBIT HOME específico.
- Como política de imitación, el modelo hereda los sesgos y limitaciones del dataset de demostración, por lo que puede fallar ante situaciones no representadas en los episodios de entrenamiento.
- No se ha documentado el riesgo de alucinación, pero al ser un modelo de acción, la salida siempre es vectorial y no genera texto, lo que reduce el riesgo de respuestas incorrectas en lenguaje natural.

## Enlaces

- HuggingFace: https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-90000
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot: https://github.com/huggingface/lerobot
- Página del equipo SOBITS: https://home.soka.ac.jp/~teamsobits/
- Repositorio SOBIT HOME: https://github.com/TeamSOBITS/sobit_home
