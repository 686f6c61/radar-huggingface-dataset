# Sweetofu/dataset_merge4

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de instrucciones en lenguaje natural y observaciones visuales. El modelo que nos ocupa, `Sweetofu/dataset_merge4`, es un fine-tuning de `lerobot/smolvla_base` sobre el dataset del mismo autor, empaquetado en formato LeRobot y orientado a despliegue en hardware de consumo. Con 450.805.988 parámetros, se sitúa en la franja de los modelos VLA ligeros que priorizan la eficiencia computacional frente a los grandes VLA basados en modelos de lenguaje de miles de millones de parámetros.

La relevancia de SmolVLA radica en su propuesta de rendimiento competitivo con coste computacional reducido, lo que permite ejecutar políticas de control robótico en GPUs de gama consumer sin necesidad de infraestructura de centro de datos. Este checkpoint concreto es un artefacto de investigación publicado por un usuario individual (Sweetofu), con cero descargas y cero likes en el momento de la consulta, lo que sugiere un uso experimental más que un modelo de referencia consolidado.

La ficha describe un modelo de robótica, no un modelo de lenguaje general: sus capacidades se centran en la predicción de acciones motoras condicionadas por imágenes e instrucciones, y su evaluación se realiza mediante rollouts en robot real o simulado, no mediante benchmarks de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.805.988 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se proporcionan en lenguaje natural, pero no se documentan idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de predicción de acciones, siguiendo el paradigma de los VLA modernos. El paper de referencia (arXiv:2506.01844) describe el modelo como compacto y eficiente, con el objetivo explícito de lograr rendimiento competitivo a coste computacional reducido y despliegue en hardware de consumo. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni composición exacta del backbone.

Este checkpoint concreto se ha obtenido mediante fine-tuning de `lerobot/smolvla_base` sobre el dataset `Sweetofu/dataset_merge4`, usando la librería LeRobot. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o imitación supervisada más allá del flujo estándar de LeRobot. La model card incluye instrucciones de entrenamiento con `lerobot-train` y evaluación con `lerobot-record`, lo que confirma que el entrenamiento sigue el pipeline de imitación de LeRobot.

## Capacidades

- Control robótico por instrucciones en lenguaje natural: genera acciones motoras condicionadas por una instrucción textual y observaciones visuales.
- Percepción visual integrada: procesa imágenes de cámaras del robot como entrada para la predicción de acciones.
- Política de imitación entrenada sobre demostraciones: apta para tareas de manipulación aprendidas del dataset de fine-tuning.
- Despliegue en hardware de consumo: el tamaño de 450 millones de parámetros y el formato LeRobot permiten ejecución en GPUs consumer.
- Integración con el ecosistema LeRobot: compatible con `lerobot-train`, `lerobot-record` y los tipos de robot soportados por la librería (por ejemplo, `so100_follower` en los ejemplos de la model card).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni procesamiento de audio.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo se usa para controlar un brazo tipo SO-100 en tareas de pick-and-place, siguiendo el flujo `lerobot-record` con `--robot.type=so100_follower` documentado en la model card.
- Investigación en VLA de bajo coste: permite a grupos con presupuesto limitado experimentar con políticas visión-lenguaje-acción en GPUs consumer, dado el tamaño de 450 millones de parámetros.
- Fine-tuning sobre datasets propios: el checkpoint sirve como punto de partida para adaptar SmolVLA a nuevos datasets de demostraciones mediante `lerobot-train`, reduciendo el coste frente a entrenar desde cero.
- Evaluación comparativa de datasets: al ser un fine-tuning de `dataset_merge4`, permite medir el efecto de la composición del dataset sobre el rendimiento de la política en rollouts reales.
- Prototipado de automatización de tareas repetitivas: tareas de ensamblaje o clasificación de objetos en entornos controlados donde se dispone de demostraciones grabadas.
- Docencia y demostraciones de robótica: el modelo y el pipeline LeRobot permiten reproducir un flujo completo de entrenamiento y evaluación en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450.805.988 parámetros, los pesos en precisión completa ocupan aproximadamente 1,8 GB (FP32) o 0,9 GB (FP16/BF16), a lo que hay que sumar la memoria de activaciones y del codificador visual, no cuantificada en la información disponible.
- GPU recomendadas: no se especifican en la model card; el paper de referencia indica despliegue en hardware de consumo.
- Cabe en GPU consumer: sí, según la afirmación del paper de que SmolVLA puede desplegarse en hardware de consumo; no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), según la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI para este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sweetofu/dataset_merge4 (SmolVLA fine-tuned) | 450.805.988 | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face (modelo base) |
| Otros VLA de gran tamano (tipo OpenVLA, RT-2) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset concreto de demostraciones, hereda los sesgos de distribución de ese dataset (objetos, posiciones, iluminación y tareas presentes en las demostraciones).
- Riesgo de alucinación: en un VLA, el equivalente es la generación de acciones fuera de distribución que pueden provocar movimientos erráticos o colisiones; no hay documentación de salvaguardas.
- Limitaciones de contexto o idioma: no se documenta la longitud de contexto ni los idiomas soportados para las instrucciones; el modelo está orientado a tareas específicas del dataset de entrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base `lerobot/smolvla_base` debe verificarse por separado; la información disponible no detalla la licencia del modelo base.
- Caveat de producción: checkpoint con cero descargas y cero likes, publicado por un usuario individual; no hay evidencia de validación externa ni de robustez en entornos reales.
- La model card es genérica y no documenta el dataset de fine-tuning, los hiperparámetros ni los resultados de evaluación, lo que limita la reproducibilidad.
- El ejemplo de entrenamiento de la model card usa `--policy.type=act`, lo que puede no corresponder a la política SmolVLA; conviene verificar la configuración antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sweetofu/dataset_merge4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
