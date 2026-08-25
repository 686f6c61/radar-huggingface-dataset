# yukamatsumae/molmoact2_otter_yellowplace_only

## Resumen

El modelo `yukamatsumae/molmoact2_otter_yellowplace_only` es una política de control robótico entrenada con el framework LeRobot de Hugging Face. Está diseñada para una tarea específica de manipulación: empujar un objeto amarillo hasta una posición determinada, como sugiere el nombre del repositorio. El modelo se publica bajo licencia Apache-2.0 y contiene aproximadamente 5.440 millones de parámetros, lo que lo sitúa en la gama de modelos de visión-lenguaje-acción (VLA) de tamaño medio.

El autor, `yukamatsumae`, ha subido este checkpoint entrenado sobre un dataset propio (`yukamatsumae/YellowPush_20260818_082007`) y lo ha compartido en el Hub para que otros investigadores puedan reproducir o evaluar la política. Aunque la model card no especifica la arquitectura interna, el nombre del modelo sugiere que se basa en MolmoAct2, un modelo VLA desarrollado por el Allen Institute for AI (AllenAI) que combina un modelo de lenguaje multimodal con una cabeza de acción para control robótico. Este tipo de modelos es relevante porque permite a los robots ejecutar tareas de manipulación a partir de observaciones visuales y comandos de alto nivel, sin necesidad de programar cada movimiento explícitamente.

La relevancia actual de este modelo radica en su naturaleza abierta y reproducible: cualquier investigador puede descargarlo, evaluarlo en su propio hardware y adaptarlo a nuevas tareas mediante fine-tuning. Sin embargo, al ser un checkpoint específico para una tarea muy concreta, su utilidad fuera de ese ámbito es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nombre sugiere MolmoAct2, sin confirmar) |
| Parametros totales | 5.442.196.272 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la model card. El nombre `molmoact2` apunta a que se trata de un fine-tuning de MolmoAct2, un modelo VLA que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores. Según la documentación pública de AllenAI, MolmoAct2 está diseñado para razonamiento de acciones en tiempo real, con optimizaciones de latencia y eficiencia para despliegue en robots físicos.

El entrenamiento se realizó con el framework LeRobot, que utiliza aprendizaje por imitación (behavior cloning) sobre demostraciones humanas. El dataset `yukamatsumae/YellowPush_20260818_082007` contiene episodios de la tarea de empujar un objeto amarillo a un lugar concreto, probablemente registrados con un brazo robótico tipo SO-100 (como se menciona en los comandos de evaluación de la model card). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Control robótico por imitación: el modelo genera acciones de articulación (posiciones o velocidades) a partir de observaciones visuales y del estado del robot.
- Tarea específica de empuje: está entrenado para empujar un objeto amarillo hasta una ubicación determinada, probablemente en un entorno de laboratorio con un brazo robótico fijo.
- Integración con LeRobot: se puede cargar y ejecutar directamente con las herramientas de LeRobot, lo que facilita su uso en pipelines de evaluación y despliegue.
- No se han documentado capacidades de tool calling, generación de texto libre, razonamiento multimodal general ni soporte multilingüe, ya que es un modelo de acción puro.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo se comporta una política VLA en una tarea de manipulación simple, comparando con otros checkpoints o variantes.
- Evaluación de generalización: se puede probar el modelo en variaciones de la tarea (diferentes posiciones del objeto, iluminación, etc.) para medir su robustez.
- Fine-tuning para nuevas tareas: al ser un checkpoint abierto, se puede utilizar como inicialización para entrenar políticas en tareas similares de empuje o colocación, reduciendo el tiempo de entrenamiento.
- Benchmarking de hardware: dado su tamaño moderado (5.4B parámetros), es útil para medir el rendimiento de GPUs de consumo en inferencia de políticas robóticas.
- Reproducibilidad de experimentos: otros investigadores pueden descargar el modelo y el dataset para reproducir los resultados del autor o comparar con sus propias implementaciones.
- Demostraciones educativas: en cursos de robótica o aprendizaje automático, se puede usar como ejemplo de entrenamiento y despliegue de un VLA con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en la tarea, métricas de precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales en la model card.
- Dado el tamaño de 5.4B parámetros, se estima que la inferencia requiere al menos 11 GB de VRAM en precisión FP16 (sin cuantización), lo que podría caber en GPUs como RTX 3090, RTX 4090 o A100. Sin embargo, esta es una estimación genérica y no un dato oficial.
- El framework LeRobot soporta ejecución en GPU con CUDA, y los comandos de evaluación mostrados en la model card usan `--policy.device=cuda`.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar, sino una política de control.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Aunque existen VLA como OpenVLA o MolmoAct2, no hay datos de rendimiento de este checkpoint específico frente a ellos. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (empujar un objeto amarillo a un lugar concreto); no es generalista y probablemente falle en otras tareas o entornos.
- No se han documentado sesgos, pero al ser entrenado con un dataset limitado, puede presentar overfitting a las condiciones específicas de captura (posición de cámara, iluminación, color del objeto).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede generar acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación en robots reales sin supervisión.
- No se proporcionan detalles sobre la arquitectura exacta, lo que dificulta la reproducibilidad técnica completa.
- El dataset asociado puede contener sesgos de demostración del operador humano.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yukamatsumae/molmoact2_otter_yellowplace_only)
- [Dataset de entrenamiento](https://huggingface.co/datasets/yukamatsumae/YellowPush_20260818_082007)
- [Repositorio oficial de MolmoAct2 (AllenAI)](https://github.com/allenai/molmoact2)
- [Paper de MolmoAct2 en arXiv](https://arxiv.org/abs/2605.02881)
- [Repositorio de MolmoAct (versión anterior)](https://github.com/allenai/MolmoAct)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
