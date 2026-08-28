# Sounderya/smolvla-ur3-real-polished-acc3

## Resumen

El modelo `Sounderya/smolvla-ur3-real-polished-acc3` es un fine-tune del modelo base `lerobot/smolvla_base`, un vision-language-action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. Este modelo específico ha sido entrenado para la tarea de recoger una taza y colocarla en un plato, utilizando un brazo robótico UR3. Se publica bajo licencia Apache 2.0 y se distribuye a través de la librería LeRobot, lo que facilita su integración en pipelines de robótica de imitación.

La relevancia de este modelo radica en su tamaño reducido en comparación con otros VLA (como OpenVLA con 7B parámetros), lo que permite su despliegue en hardware de consumo. Al estar fine-tuneado con un dataset propio de 120 episodios, demuestra el flujo de trabajo típico de LeRobot: grabar demostraciones, entrenar una política y ejecutarla en un robot real. Aunque no se proporcionan resultados de evaluación cuantitativos, el modelo representa un ejemplo práctico de cómo adaptar un VLA general a una tarea específica con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo orientado a robótica, no a procesamiento de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El paper asociado (arXiv:2506.01844) describe una arquitectura compacta y eficiente, diseñada para ejecutarse en GPUs de consumo. El fine-tune aquí presentado parte del checkpoint base `lerobot/smolvla_base` y se entrena con el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios y 91.365 frames a 30 FPS, con dos cámaras (muñeca y derecha). La configuración de entrenamiento incluye 500 pasos, batch size de 64, optimizador AdamW, learning rate de 1e-5 y semilla 1000, usando LeRobot versión 0.6.1.

No se detallan innovaciones técnicas adicionales más allá de las propias del modelo base. El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) sin refuerzo ni preferencias humanas explícitas.

## Capacidades

- Control robótico de brazo UR3: el modelo genera acciones de 10 dimensiones (posición y orientación del efector final) a partir de observaciones de estado (6 valores) y tres imágenes de cámaras (256x256).
- Percepción visual multimodal: procesa imágenes de múltiples cámaras para guiar la manipulación.
- Tarea específica: recoger una taza y colocarla en un plato, entrenado con demostraciones reales.
- Integración con LeRobot: compatible con el flujo de entrenamiento y despliegue estándar de la librería (lerobot-train, lerobot-rollout).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje general fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales o de laboratorio: el modelo puede ejecutar la tarea de recoger y colocar objetos en una posición fija, útil para líneas de montaje o clasificación.
- Prototipado rápido de políticas robóticas: al ser un fine-tune pequeño, permite validar el flujo de LeRobot en un brazo UR3 con pocos recursos computacionales.
- Investigación en aprendizaje por imitación: sirve como ejemplo de cómo adaptar un VLA general a una tarea concreta con un dataset reducido.
- Demostración educativa: adecuado para cursos o talleres de robótica donde se enseña a entrenar y desplegar políticas VLA en hardware real.
- Benchmark de eficiencia: al tener solo 450M parámetros, puede usarse para comparar el rendimiento de VLA compactos frente a modelos más grandes en tareas de manipulación.
- Desarrollo de asistentes robóticos domésticos: la tarea de recoger objetos y colocarlos en un lugar designado es común en entornos domésticos, y el modelo podría adaptarse a otras tareas similares con fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no hay datos de éxito, precisión ni comparación con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM para este fine-tune concreto.
- Dado que el modelo tiene 450M parámetros y está diseñado para hardware de consumo, es plausible que quepa en GPUs con 8-12 GB de VRAM en precisión FP16 o con cuantización, pero no hay confirmación oficial.
- LeRobot soporta despliegue en GPU NVIDIA (CUDA) y también CPU para inferencia lenta; para entrenamiento se recomienda al menos una GPU con 8 GB.
- Opciones de despliegue: el modelo se usa mediante los comandos `lerobot-rollout` y `lerobot-train` de LeRobot. No se mencionan compatibilidades con vLLM, Ollama u otros frameworks de inferencia genérica, ya que es un modelo de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos directos para este fine-tune. Sin embargo, en términos de arquitectura base, SmolVLA (450M) es significativamente más pequeño que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que implica menor requisito de hardware pero potencialmente menor capacidad de generalización. No hay información sobre rendimiento relativo en tareas de manipulación.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (base) | 450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | MIT | Hugging Face |
| RT-2 | 55B | No disponible | No abierto | No público |

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento efectivo es desconocido.
- El dataset de entrenamiento es reducido (120 episodios) y específico para una tarea concreta, lo que puede provocar sobreajuste y falta de generalización a otras tareas o variaciones del entorno.
- El modelo está entrenado con cámaras específicas (`wrist` y `right`); usarlo con otras configuraciones de cámara requerirá reentrenamiento.
- No se documentan sesgos, pero al ser un modelo de robótica, los sesgos son menos relevantes que en modelos de lenguaje; aun así, el comportamiento depende de los datos de demostración.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni de rendimiento en producción.
- No se indica soporte para otros idiomas ni capacidades de lenguaje natural más allá de la instrucción de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sounderya/smolvla-ur3-real-polished-acc3
- Paper SmolVLA: https://arxiv.org/abs/2506.01844 (HTML: https://arxiv.org/html/2506.01844v1)
- Sitio web oficial de SmolVLA: https://smolvla.net/index_en
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
