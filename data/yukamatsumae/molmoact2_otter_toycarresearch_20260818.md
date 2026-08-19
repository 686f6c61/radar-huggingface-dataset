# yukamatsumae/molmoact2_otter_toycarresearch_20260818

## Resumen

El modelo `yukamatsumae/molmoact2_otter_toycarresearch_20260818` es un checkpoint de política robótica entrenado con la librería LeRobot de Hugging Face, sobre un dataset de manipulación de coches de juguete (`yukamatsumae/ToyCarResearch_20260817_020059`). El nombre del repositorio sugiere que se basa en la arquitectura MolmoAct2 de AllenAI, un modelo de visión-lenguaje-acción (VLA) diseñado para control robótico, aunque la model card no especifica explícitamente la arquitectura interna. Con 5.442.196.272 parámetros (aproximadamente 5,4 mil millones) y licencia Apache 2.0, este modelo representa un ejemplo de aplicación de técnicas de aprendizaje por imitación para tareas de manipulación en entornos controlados.

La relevancia de este modelo radica en su demostración del flujo de entrenamiento y despliegue de políticas robóticas mediante LeRobot, una herramienta open source que estandariza el proceso de recopilación de datos, entrenamiento y evaluación. Aunque el modelo está especializado en una tarea concreta (manipulación de coches de juguete), su publicación en el Hub permite a la comunidad reproducir el pipeline y adaptarlo a otras tareas robóticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere MolmoAct2, pero no confirmado; el entrenamiento usa política ACT según la model card) |
| Parametros totales | 5.442.196.272 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | No disponible (modelo de acción robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo se entrena con el comando `lerobot-train` usando `--policy.type=act`, lo que corresponde a la política ACT (Action Chunking with Transformers) implementada en LeRobot. ACT es una arquitectura basada en transformers que predice secuencias de acciones (chunks) a partir de observaciones visuales y estados del robot, empleando un enfoque de aprendizaje por imitación con un decodificador autoregresivo. El nombre "molmoact2" sugiere que el modelo podría integrar componentes de MolmoAct2, un VLA de AllenAI, pero no se dispone de confirmación en la información proporcionada.

El entrenamiento se realizó sobre el dataset `yukamatsumae/ToyCarResearch_20260817_020059`, que contiene demostraciones de manipulación de coches de juguete, probablemente recopiladas mediante teleoperación. No se proporcionan detalles sobre el número de episodios, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint se guardó en formato safetensors y se publicó en el Hub mediante el flujo estándar de LeRobot.

## Capacidades

- Control robótico: genera acciones de control (posiciones, fuerzas, etc.) para un robot, a partir de observaciones visuales y estados del actuador.
- Manipulación de objetos: el dataset de entrenamiento sugiere que el modelo puede realizar tareas de empuje, agarre o desplazamiento de objetos pequeños (coches de juguete).
- Aprendizaje por imitación: la política ha sido entrenada para imitar demostraciones humanas o teleoperadas.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbólico; es un modelo puramente orientado a acciones.

## Casos de uso

- Investigación en robótica: evaluar el rendimiento de políticas basadas en ACT o MolmoAct2 en tareas de manipulación de objetos pequeños, comparando con otros métodos de aprendizaje por imitación.
- Desarrollo de sistemas de teleoperación: el modelo puede servir como base para controlar un brazo robótico en tiempo real, replicando las demostraciones aprendidas.
- Automatización de tareas repetitivas en entornos de laboratorio: por ejemplo, clasificar o mover piezas pequeñas en una línea de montaje simulada.
- Benchmarking de algoritmos de control: al ser un checkpoint público, permite reproducir experimentos y comparar métricas de éxito en la tarea de coches de juguete.
- Formación y educación: sirve como ejemplo práctico de cómo entrenar y desplegar una política robótica con LeRobot, útil para cursos de robótica y aprendizaje automático.
- Adaptación a nuevas tareas: aunque está especializado, el pipeline de entrenamiento puede reutilizarse con otros datasets, usando este modelo como punto de partida (fine-tuning).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre tasas de éxito, precisión de manipulación ni comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 10,9 GB, lo que sugiere pesos en FP16 o BF16 (aproximadamente 2 bytes por parámetro). Un modelo de 5,4B parámetros en FP16 ocupa unos 10,8 GB, consistente con el tamaño del repo.
- Para inferencia, se estima una necesidad de al menos 12-16 GB de VRAM, dependiendo del tamaño del batch y de la resolución de las imágenes de entrada.
- GPUs recomendadas: una NVIDIA RTX 3090/4090 (24 GB) o una A100 (40 GB) serían suficientes. Para entrenamiento, se requeriría una GPU con mayor memoria (A100 80 GB o similar).
- El despliegue se realiza mediante LeRobot, que utiliza PyTorch. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la frecuencia de control del robot; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas entrenadas con LeRobot sobre datasets específicos). Existen otros checkpoints del mismo autor, como `yukamatsumae/molmoact2_otter_graspandpush_20260805`, que también se basan en MolmoAct2 y se entrenan con LeRobot, pero no se han publicado comparaciones cuantitativas.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente para la tarea de manipulación de coches de juguete; no generalizará a otras tareas sin un fine-tuning adicional.
- Dependencia del entorno físico: la evaluación requiere un robot real (por ejemplo, un SO-100) y un setup específico, lo que dificulta la reproducibilidad fuera del laboratorio.
- Sin documentación técnica detallada: la model card no especifica la arquitectura interna, el proceso de entrenamiento ni los hiperparámetros, lo que limita su uso como referencia científica.
- Posible riesgo de sobreajuste: al estar entrenado sobre un dataset pequeño (presumiblemente), el modelo puede memorizar las demostraciones y fallar ante variaciones en la posición de los objetos o la iluminación.
- Licencia: aunque la licencia es Apache 2.0, el modelo base MolmoAct2 (si se utiliza) puede tener restricciones adicionales; no se ha confirmado la compatibilidad.
- No es un modelo de lenguaje: no puede interpretar instrucciones verbales ni generar texto; su salida son acciones de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yukamatsumae/molmoact2_otter_toycarresearch_20260818
- Dataset asociado: https://huggingface.co/datasets/yukamatsumae/ToyCarResearch_20260817_020059
- Repositorio oficial de MolmoAct2 (AllenAI): https://github.com/allenai/molmoact2
- Paper de MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Repositorio de MolmoAct (versión anterior): https://github.com/allenai/MolmoAct
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Otro checkpoint similar del autor: https://huggingface.co/yukamatsumae/molmoact2_otter_graspandpush_20260805
