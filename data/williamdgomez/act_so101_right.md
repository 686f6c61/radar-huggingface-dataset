# williamdgomez/act_so101_right

## Resumen

`williamdgomez/act_so101_right` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. El modelo lo desarrolla el usuario williamdgomez y se distribuye a través de Hugging Face Hub con la librería LeRobot, el framework de aprendizaje por imitación mantenido por Hugging Face. Su función es convertir observaciones visuales del robot en secuencias cortas de acciones articulares (chunks), de modo que un brazo robótico SO-101 pueda ejecutar tareas manipulativas aprendidas por teleoperación.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) almacenados en formato safetensors, con un repositorio de 0,2 GB. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que actúa como controlador visomotor para un robot físico concreto. Se entrenó sobre el dataset `williamdgomez/right`, presumiblemente compuesto por episodios de teleoperación del brazo derecho de una plataforma SO-101.

Su relevancia es práctica: ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas ACT en hardware asequible (SO-100/SO-101), y sirve como referencia reproducible para quien quiera replicar el pipeline de entrenamiento, evaluación y ejecución en un robot real. La licencia Apache 2.0 facilita su reutilización comercial, aunque el alcance real del modelo está limitado a la tarea y el robot con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varias acciones futuras de una vez) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un backbone de visión (típicamente ResNet) que codifica las imágenes de las cámaras del robot con un transformer encoder-decoder que modela la secuencia de estados y genera las acciones. El modelo se entrena mediante aprendizaje supervisado sobre demostraciones de teleoperación, sin refuerzo ni RLHF.

Los detalles concretos del entrenamiento de esta instancia —número de episodios, número de tokens o pasos, composición exacta del dataset `williamdgomez/right`, resolución de las cámaras y configuración de hiperparámetros— no están disponibles en la información proporcionada. El repositorio apunta al artículo original de ACT como referencia metodológica y a la documentación de LeRobot para el pipeline de entrenamiento (`lerobot-train --policy.type=act`).

## Capacidades

- Control visomotor para manipulación robótica: genera secuencias de acciones articulares a partir de observaciones de cámara.
- Predicción de action chunks: emite varios pasos de acción por inferencia, lo que mejora la suavidad y la tasa de éxito frente a políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Integración nativa con LeRobot: entrenamiento (`lerobot-train`), evaluación y grabación (`lerobot-record`) y despliegue en robots SO-100/SO-101.
- Ejecución en tiempo real sobre hardware de consumo, dado el reducido tamaño del modelo (51,7 M de parámetros).
- No soporta tool calling, agentes conversacionales, multilingüismo ni modalidad de texto: es exclusivamente una política robótica.

## Casos de uso

- Manipulación de objetos con brazo SO-101: el modelo ejecuta la tarea concreta para la que fue entrenado (dataset `right`) controlando las articulaciones a partir de las imágenes de las cámaras, adecuado por su bajo coste computacional y su integración directa con LeRobot.
- Replicación de experimentos de aprendizaje por imitación: sirve como checkpoint de referencia para comparar configuraciones de ACT, número de episodios o resolución de cámara en un pipeline reproducible.
- Base para fine-tuning en tareas nuevas: al ser una política ACT de 51,7 M de parámetros con licencia Apache 2.0, puede reentrenarse con un dataset propio de teleoperación del mismo robot.
- Docencia y formación en robótica: permite montar un laboratorio de imitación con hardware SO-101 asequible, usando los comandos de LeRobot para entrenar y evaluar en pocas horas.
- Evaluación de políticas en bucle cerrado: con `lerobot-record` y `--policy.path` apuntando a este checkpoint, se pueden grabar episodios de evaluación y medir tasas de éxito de forma sistemática.
- Prototipado de automatización de laboratorio o líneas de montaje simples: para tareas repetitivas de pick-and-place dentro del dominio entrenado, el modelo puede desplegarse en una estación con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en precisión completa (fp32) el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060, RTX 4090 o superior es más que suficiente. También puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1060 en adelante), e incluso en placas integradas para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch con safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| williamdgomez/act_so101_right | 51,7 M | ACT (imitación) | no aplica | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (checkpoints de ejemplo) | ~51 M (típico) | ACT | no aplica | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy | no disponible | imitación con difusión | no aplica | no disponible | Hugging Face Hub / repos de investigación |
| SmolVLA | no disponible | VLA ligero | no disponible | no disponible | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de método, tamaño y licencia.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot concretos (SO-101, brazo derecho, dataset `williamdgomez/right`); fuera de ese dominio su tasa de éxito será probablemente nula.
- No generaliza a instrucciones en lenguaje natural ni a nuevas tareas sin reentrenamiento o fine-tuning con demostraciones adicionales.
- Riesgo de sobreajuste al entorno de grabación (iluminación, fondo, posición de objetos); cambios en las condiciones pueden degradar el rendimiento.
- No hay información publicada sobre sesgos, robustez o evaluación cuantitativa de éxito, lo que impide garantizar su comportamiento en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia y los derechos del dataset de entrenamiento antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/williamdgomez/act_so101_right
- Artículo de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/williamdgomez/right
