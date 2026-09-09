# zyh1212zyh/act_pusht_200k

## Resumen

El modelo `act_pusht_200k` es una política de control robótico desarrollada por zyh1212zyh sobre la base de la arquitectura ACT (Action Chunking with Transformers) y del framework LeRobot de Hugging Face. Resuelve la tarea PushT, en la que un robot debe empujar un objeto hasta una posición objetivo a partir de una imagen de cámara y del estado del actuador. Es un modelo de aprendizaje por imitación, no un modelo de lenguaje.

La arquitectura combina un backbone ResNet18 para extraer características visuales, un modelo CVAE y un transformer que predice secuencias de acciones. Cuenta con 51,66 millones de parámetros y ha sido entrenado durante 200.000 pasos sobre 206 episodios de teleoperación humana procedentes de `lerobot/pusht`. Su relevancia radica en ser una referencia abierta y reproducible de ACT en un entorno de simulación estándar, con resultados de evaluación publicados de forma transparente.

El modelo se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors. En la evaluación oficial alcanza una tasa de éxito de 4 sobre 200 episodios (2,0%), lo que indica que aún no es una política robusta para producción, pero sirve como baseline para investigación en manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (CVAE + transformer con backbone ResNet18) |
| Parametros totales | 51.660.418 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política se basa en ACT, que combina un codificador visual ResNet18 con un modelo CVAE y un transformer. La imagen de observación se reduce a 96x96x3 y se concatena con el estado del actuador (2 dimensiones). El modelo predice un chunk de 100 acciones de control, en este caso la posición objetivo bidimensional del pusher. Esta estrategia de “chunking” de acciones reduce el error acumulado típico de los métodos paso a paso.

El entrenamiento se realizó sobre el dataset `lerobot/pusht`, compuesto por 206 episodios de demostraciones humanas teleoperadas. Se ejecutaron 200.000 pasos con batch 64, learning rate 1e-5 y AMP activado. Los datos se procesaron a 10 fps. No se aplicaron técnicas de RLHF ni DPO, ya que no es un modelo de lenguaje; se trata de aprendizaje por imitación supervisada.

## Capacidades

- Control robótico en el entorno PushT: predice secuencias de acciones para empujar un objeto hasta una posición objetivo.
- Percepción visual de baja resolución: procesa imágenes de 96x96x3 mediante un backbone ResNet18.
- Integración con LeRobot: se carga y evalúa directamente con la CLI de LeRobot (`lerobot-eval`).
- Ejecución en simulación: compatible con el entorno `gym_pusht/PushT-v0` y con el protocolo estándar de evaluación de LeRobot.
- Soporte de observaciones combinadas: fusiona imagen de cámara y estado del actuador para generar acciones.
- No ofrece generación de texto, tool calling ni razonamiento simbólico; sus capacidades son exclusivamente visuomotoras.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para comparar nuevas arquitecturas de políticas de control en la tarea PushT, gracias a que su entrenamiento y evaluación están documentados.
- Evaluación de algoritmos ACT: permite validar implementaciones propias de ACT con un checkpoint oficial y reproducible en el framework LeRobot.
- Benchmark de simulación para robótica: adecuado para medir la efectividad de técnicas de aumentación de datos o de regularización en entornos de manipulación.
- Configuración de pipelines de entrenamiento en robótica: sirve como ejemplo de cómo configurar un entrenamiento de 200k pasos con batch 64, AMP y observaciones de 96x96.
- Prototipado de control de robots de laboratorio: puede usarse como punto de partida para explorar la transferencia a tareas de empuje en entornos simulados o reales con hardware compatible.
- Docencia y divulgación de robótica: útil para demostrar la ejecución de una política de imitación con LeRobot en un entorno de simulación sencillo y visual.

## Benchmarks y rendimiento

La evaluación oficial se realizó en `gym_pusht/PushT-v0` con observaciones `pixels_agent_pos`, 300 pasos máximos por episodio, 200 episodios, semillas 1000-1199, batch 50 y entornos asíncronos. Los resultados publicados son los siguientes:

| Checkpoint | Tasa de éxito | Recompensa media máxima | Recompensa acumulada media |
|---|---|---|---|
| 20K steps | 0/200 (0,0%) | 0.367 | 34.0 |
| 200K steps (este modelo) | 4/200 (2,0%) | 0.419 | 38.8 |

El intervalo de confianza Wilson 95% para la tasa de éxito es [0,8%, 5,0%]. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- El modelo ocupa aproximadamente 207 MB en FP32 (51,7 M parámetros), por lo que la inferencia puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM o incluso en CPU.
- Para reproducir el entrenamiento completo de 200.000 pasos se recomienda una GPU con al menos 8 GB de VRAM, aunque no se especifica el hardware utilizado en la información disponible.
- Compatible con despliegue mediante LeRobot, que usará PyTorch por defecto. No se han publicado conversiones a GGUF ni a otros formatos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría en las fuentes proporcionadas. Como referencia interna, se comparan los dos checkpoints publicados por el mismo autor:

| Checkpoint | Parámetros | Tasa de éxito | Recompensa máxima media |
|---|---|---|---|
| act_pusht_200k | 51,66 M | 2,0% | 0.419 |
| act_pusht (checkpoint 20K) | 51,66 M | 0,0% | 0.367 |

Ambos usan la misma arquitectura, dataset y entorno. La mejora es marginal tras pasar de 20K a 200K pasos, lo que sugiere limitaciones en la estrategia de entrenamiento o en la cantidad de datos.

## Limitaciones y advertencias

- Tasa de éxito baja en el entorno PushT (2,0%), por lo que no es apto para aplicaciones de producción sin un ajuste adicional.
- La evaluación se realizó únicamente en simulación con `gym_pusht/PushT-v0`; no hay datos de validación en robots reales ni en otros entornos.
- Depende de observaciones específicas (imagen 96x96x3 y estado de 2 dimensiones), lo que limita su generalización a otras cámaras, objetos o configuraciones de actuador.
- El entrenamiento se basó en solo 206 episodios de demostraciones humanas, un volumen reducido que puede provocar sobreajuste a los comportamientos observados.
- No se ha documentado su comportamiento ante estados no vistos, oclusiones o cambios en la iluminación, por lo que el riesgo de acciones erróneas en condiciones adversas es alto.
- La licencia Apache 2.0 permite uso comercial, pero cualquier uso fuera de la tarea PushT requiere una revalidación completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zyh1212zyh/act_pusht_200k
- Dataset de evaluación: https://huggingface.co/datasets/zyh1212zyh/act_pusht_200k
- Checkpoint ACT anterior (20K): https://huggingface.co/zyh1212zyh/act_pusht
- Framework LeRobot: https://github.com/huggingface/lerobot
- Curvas de entrenamiento en Weights & Biases: https://wandb.ai/7bread-lab/lerobot
