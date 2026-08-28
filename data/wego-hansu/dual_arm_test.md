# wego-hansu/dual_arm_test

## Resumen

El modelo `wego-hansu/dual_arm_test` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, sobre un dataset de teleoperación de dos brazos (`wego-hansu/two_arm_bolt`), orientado a tareas de manipulación como el atornillado. El modelo cuenta con 51.685.006 parámetros y se distribuye bajo licencia Apache-2.0.

La relevancia de este modelo radica en su aplicación directa en robótica de manipulación dual, un área en crecimiento dentro de la investigación en IA física. Al ser un modelo compacto, es adecuado para experimentación en hardware asequible y para integrarse en pipelines de control basados en LeRobot. No se dispone de información sobre la arquitectura interna más allá de la propia definición de ACT, ni de detalles sobre el contexto de entrada o los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper [2304.13705](https://huggingface.co/papers/2304.13705). En lugar de predecir una única acción por paso de tiempo, el modelo genera un "chunk" de acciones futuras (por ejemplo, una secuencia de 10-100 pasos), lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La arquitectura base es un transformer codificador-decodificador que recibe observaciones (imágenes y estados del robot) y produce acciones para los actuadores.

El entrenamiento se ha realizado con el framework LeRobot, que facilita la recopilación de datos de teleoperación, el entrenamiento y la evaluación. El dataset `wego-hansu/two_arm_bolt` contiene demostraciones de una tarea de atornillado con dos brazos robóticos. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se publica como un checkpoint de política entrenada, listo para cargar con LeRobot.

## Capacidades

- Control de robots manipuladores de dos brazos mediante aprendizaje por imitación.
- Predicción de secuencias de acciones (action chunking), lo que permite movimientos suaves y coordinados.
- Integración nativa con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI.
- Capacidad de ejecutar tareas de manipulación fina como atornillado, basado en el dataset de entrenamiento.
- No incluye procesamiento de lenguaje natural, visión general ni tool calling; su entrada son observaciones del robot (estado y, posiblemente, imágenes) y su salida son comandos de actuación.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede controlar dos brazos robóticos para insertar y atornillar piezas, reduciendo la intervención humana en líneas de producción repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del action chunking en tareas de manipulación bimanual, comparando con políticas que predicen paso a paso.
- Desarrollo de robots de bajo coste: al tener solo 51,7 M de parámetros, puede ejecutarse en GPUs de consumo, facilitando la experimentación en laboratorios con presupuesto limitado.
- Teleoperación asistida: el modelo puede complementar sistemas de teleoperación, sugiriendo o completando acciones parciales del operador humano.
- Benchmarking de políticas robóticas: al estar disponible en Hugging Face con licencia Apache-2.0, puede utilizarse como referencia para comparar otros métodos de control en el mismo dataset.
- Educación en robótica: permite a estudiantes y desarrolladores montar un pipeline completo de entrenamiento e inferencia con LeRobot sobre hardware real o simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre tasas de éxito en el dataset `two_arm_bolt` ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 51,7 M de parámetros, la VRAM necesaria para inferencia es reducida: se estima menos de 1 GB en FP32 (aproximadamente 207 MB de pesos), y menos aún en cuantización, aunque no se han publicado formatos cuantizados.
- Es ejecutable en GPUs de consumo como NVIDIA GTX 1060, RTX 2060, RTX 3060 o superiores.
- Para entrenamiento, LeRobot recomienda al menos 12 GB de VRAM para ACT con imágenes, aunque con este tamaño de modelo podría caber en 8 GB si se usan imágenes de baja resolución.
- Despliegue compatible con el framework LeRobot, que soporta inferencia en PyTorch. No se ha confirmado soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia depende del número de acciones en el chunk y de la resolución de imagen; no se dispone de cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. Existen otras políticas robóticas entrenadas con LeRobot, como `wego-hansu/yeonwonju-070720-vla` (también del mismo autor, basada en VLA), pero no se conocen sus especificaciones ni rendimiento. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Modelo entrenado para una tarea específica (atornillado con dos brazos); su generalización a otras tareas o entornos no está garantizada.
- No se han documentado sesgos ni riesgos de alucinación, al ser un modelo de control y no de generación de texto; sin embargo, puede producir acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- No hay información sobre la longitud de contexto ni sobre el formato de las observaciones (tamaño de imagen, frecuencia de control), lo que limita su reproducibilidad exacta.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se publica sin garantías; el usuario debe validar su seguridad en entornos reales.
- No se especifican requisitos de hardware mínimos oficiales; las estimaciones se basan en el tamaño del modelo y pueden variar según la implementación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wego-hansu/dual_arm_test)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Perfil del autor en Hugging Face](https://huggingface.co/wego-hansu)
- [Organización WeGo-Robotics en GitHub](https://github.com/WeGo-Robotics)
- [Dataset de entrenamiento `two_arm_bolt`](https://huggingface.co/datasets/wego-hansu/two_arm_bolt)
