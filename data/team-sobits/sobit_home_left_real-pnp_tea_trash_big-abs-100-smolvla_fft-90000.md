# team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-90000

## Resumen

Este modelo es un fine-tuning de [SmolVLA](https://huggingface.co/papers/2506.01844), un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, sobre un dataset propio de robótica. Ha sido entrenado por el equipo Team SOBITS de la Universidad de Soka (Japón) para controlar un robot móvil manipulador (SOBIT HOME) en la tarea concreta de "tirar la botella de plástico a la papelera". El modelo consume imágenes de dos cámaras (cabeza y mano izquierda) junto con el estado del robot (20 dimensiones) y produce acciones de 20 dimensiones.

Con 450 millones de parámetros, es un modelo relativamente pequeño para un VLA, diseñado para ejecutarse en hardware de consumo. Se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema LeRobot, lo que facilita su despliegue y reproducción. Su relevancia radica en demostrar que los VLA pueden ser entrenados de forma eficiente para tareas robóticas específicas con pocos datos (100 episodios) y en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action), basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto y eficiente que combina un codificador visual con un modelo de lenguaje para generar acciones de control. En este caso, el modelo se ha fine-tuneado a partir de `lerobot/smolvla_base` sobre el dataset `team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100`, que contiene 100 episodios (22.125 frames a 10 FPS) de un robot móvil manipulador realizando la tarea de recoger una botella de plástico y tirarla a una papelera.

El entrenamiento se realizó con 90.000 pasos, batch size de 16, optimizador AdamW y una tasa de aprendizaje de 0,0001. La configuración completa se describe en la model card y se puede reproducir con las herramientas de LeRobot (versión 0.6.0). No se especifican detalles sobre el dataset de preentrenamiento del modelo base, ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Control de robot móvil manipulador: genera acciones de 20 dimensiones a partir de observaciones de estado y dos cámaras RGB (480x640).
- Percepción visual multi-cámara: procesa imágenes de cámara de cabeza y cámara de mano izquierda.
- Ejecución de tareas de manipulación específicas: entrenado para la tarea "Throw the plastic bottle into the trash bin".
- Integración con LeRobot: compatible con el flujo de entrenamiento y despliegue de LeRobot (`lerobot-rollout`, `lerobot-train`).
- Despliegue en hardware de consumo: diseñado para ejecutarse en GPUs de gama media gracias a su tamaño compacto.

No presenta capacidades de generación de texto, tool calling, agentes ni razonamiento multi-step fuera del contexto robótico.

## Casos de uso

- Automatización de tareas de reciclaje en entornos domésticos: el modelo puede controlar un robot para recoger botellas de plástico y depositarlas en un contenedor, reduciendo la intervención humana en tareas repetitivas.
- Investigación en robótica de manipulación: sirve como punto de partida para estudiar el fine-tuning de VLA en tareas específicas con pocos datos, gracias a su licencia abierta y su integración con LeRobot.
- Prototipado de soluciones robóticas en laboratorios: equipos con recursos limitados pueden desplegar este modelo en robots móviles manipuladores para validar algoritmos de control y percepción.
- Benchmarking de VLA en entornos reales: permite comparar el rendimiento de SmolVLA frente a otros modelos en tareas de manipulación, al estar disponible públicamente con su dataset de entrenamiento.
- Educación en robótica y aprendizaje por imitación: estudiantes e investigadores pueden analizar el código y los datos para comprender cómo se entrena un VLA para una tarea concreta.
- Desarrollo de asistentes robóticos para personas mayores o con movilidad reducida: la tarea de recoger y desechar objetos es un caso de uso típico en asistencia doméstica, aunque requiere validación adicional en entornos no controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño de 450M parámetros, se estima que puede caber en GPUs con 8-12 GB de VRAM en FP16, pero este dato no está confirmado.
- GPU recomendadas: no se especifican. SmolVLA está diseñado para hardware de consumo, por lo que GPUs como RTX 3060, RTX 4070 o superiores podrían ser suficientes.
- Compatibilidad con consumer GPU: probablemente sí, dado el diseño de SmolVLA, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También es compatible con el ecosistema Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| Este modelo | 450M | Tirar botella a papelera (real) | 100 episodios | Apache 2.0 |
| [sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-90000](https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-90000) | 450M (estimado) | Tirar tomate a papelera (simulación) | 200 episodios | Apache 2.0 |
| [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base) | 450M (estimado) | Preentrenamiento general | No disponible | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no hay resultados de evaluación publicados.

## Limitaciones y advertencias

- Tarea específica: el modelo está entrenado únicamente para la tarea "Throw the plastic bottle into the trash bin" en un entorno concreto (SOBIT HOME). No generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay datos de éxito en pruebas reales, por lo que su rendimiento efectivo es desconocido.
- Posible overfitting: con solo 100 episodios, el modelo puede memorizar el dataset y fallar ante variaciones de iluminación, posición de objetos o distracciones.
- Dependencia de cámaras específicas: las observaciones requieren dos cámaras con resoluciones y posiciones fijas (head_camera y hand_left_camera). Cambios en la configuración invalidarían el modelo.
- Sin soporte de lenguaje natural: no se puede interactuar con el modelo mediante texto; solo produce acciones a partir de observaciones.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de cualquier patente relacionada con SmolVLA.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-90000)
- [Dataset de entrenamiento](https://huggingface.co/datasets/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Repositorio GitHub de Team SOBITS](https://github.com/TeamSOBITS/sobit_home)
- [Página del equipo SOBITS](https://home.soka.ac.jp/~teamsobits/)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
