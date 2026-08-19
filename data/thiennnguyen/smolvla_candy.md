# ThiennNguyen/smolvla_candy

## Resumen

`ThiennNguyen/smolvla_candy` es un fine-tuning del modelo base [SmolVLA](https://huggingface.co/lerobot/smolvla_base) desarrollado por Hugging Face, adaptado por el usuario ThiennNguyen para una tarea robótica concreta: recoger objetos (caramelos y galletas) y colocarlos en una cesta, utilizando un robot tipo `so_follower` con cinco cámaras. SmolVLA es un modelo vision-language-action (VLA) compacto de 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo, que combina un modelo de lenguaje y visión preentrenado con un experto de acciones entrenado mediante flow matching.

Este modelo concreto se ha entrenado con 60 episodios de demostración (25 054 frames a 30 FPS) sobre el dataset `ThiennNguyen/record-test-60eps`, con tres tareas descritas en vietnamita. Su relevancia radica en demostrar el flujo completo de fine-tuning de SmolVLA con LeRobot sobre datos propios, lo que permite a cualquier desarrollador adaptar un VLA a tareas de manipulación específicas sin necesidad de infraestructura masiva. El repositorio incluye los pesos en formato safetensors (0,9 GB) y las instrucciones para ejecutar el rollout en un robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en SmolVLA, con experto de acciones por flow matching |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (las tareas de entrenamiento están en vietnamita) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA parte de un modelo de lenguaje y visión (VLM) preentrenado a gran escala, al que se añade un experto de acciones entrenado con flow matching. La arquitectura procesa múltiples imágenes de cámaras junto con una instrucción en lenguaje natural, y genera secuencias (chunks) de acciones del robot, típicamente posiciones y orientaciones del efector final. El modelo base `lerobot/smolvla_base` ya incorpora el conocimiento visual y lingüístico del VLM, y el fine-tuning aquí realizado adapta el experto de acciones a la tarea concreta.

El entrenamiento se ha realizado con LeRobot 0.6.2 sobre el dataset `ThiennNguyen/record-test-60eps`, que contiene 60 episodios de demostración con 25 054 frames a 30 FPS. La configuración usada fue: 20 000 pasos de entrenamiento, batch size de 64, optimizador AdamW con learning rate de 0,0001 y semilla 1000. Las observaciones incluyen el estado del robot (6 dimensiones) y cinco imágenes (tres cámaras a 256×256 y dos a 480×640), mientras que la salida es un vector de acción de 6 dimensiones. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado por imitación.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad (posición y orientación del efector) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente hasta cinco imágenes de cámaras (tres a 256×256 y dos a 480×640) para tomar decisiones.
- Instrucciones en lenguaje natural: las tareas se describen mediante frases en vietnamita (p. ej., "nhặt kẹo xanh vào giỏ" — recoger caramelos verdes en la cesta), lo que permite seleccionar el comportamiento deseado.
- Aprendizaje por demostración: el modelo ha sido entrenado con demostraciones humanas, por lo que puede reproducir comportamientos de picking and placing.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots SO-100 y similares.
- Eficiencia computacional: al tener solo 450M parámetros, puede ejecutarse en GPUs de consumo, a diferencia de VLAs más grandes como OpenVLA (7B).

## Casos de uso

- Picking and placing en entornos controlados: el modelo puede recoger objetos específicos (caramelos de colores, galletas) de una superficie y depositarlos en una cesta, tarea típica en líneas de clasificación sencillas o en laboratorios de robótica.
- Prototipado rápido de políticas robóticas: con LeRobot, un desarrollador puede grabar 60 demostraciones, entrenar el fine-tuning y desplegar el modelo en un robot físico en cuestión de horas, ideal para validar conceptos antes de escalar.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de SmolVLA a tareas nuevas, comparar estrategias de recolección de datos o analizar el efecto del número de episodios en el rendimiento.
- Automatización de tareas repetitivas en pequeña escala: en entornos de fabricación ligera o logística de cercanías, puede automatizar la clasificación de piezas pequeñas con un robot de bajo coste, sin necesidad de programación explícita.
- Demostraciones educativas de VLA: al ser un modelo abierto y ligero, es adecuado para cursos y talleres de robótica donde se enseña el ciclo completo de datos → entrenamiento → despliegue.
- Evaluación de robustez en entornos reales: al estar entrenado con solo 60 episodios, es útil para estudiar la generalización y los límites de SmolVLA ante variaciones de iluminación, posición de objetos o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito en tareas reales ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 450M parámetros; en FP32 ocuparía ~1,8 GB y en FP16 ~0,9 GB. Con cuantización a 8 bits o 4 bits, cabría en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 4090, o GPUs de datacenter como A10 o A100 si se requiere mayor throughput.
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos principales de SmolVLA; puede ejecutarse en tarjetas de gama media de escritorio.
- Opciones de despliegue: el flujo principal es mediante LeRobot con `lerobot-rollout` (PyTorch). No se mencionan formatos optimizados como ONNX, TensorRT o GGUF en la información disponible.
- Latencia y throughput: no disponibles en la documentación del modelo. Dependerá de la GPU y del número de imágenes procesadas por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThiennNguyen/smolvla_candy | 450M | no disponible | Apache-2.0 | HuggingFace | Fine-tuning de SmolVLA para tarea específica |
| lerobot/smolvla_base | 450M | no disponible | Apache-2.0 | HuggingFace | Modelo base de SmolVLA, preentrenado en datos comunitarios |
| OpenVLA | 7B | 32k tokens (aprox.) | MIT | HuggingFace | VLA mucho más grande, requiere más VRAM (≥24 GB) |
| RT-2 (Google) | 55B | no publicado | propietaria | no público | Modelo propietario, no comparable en acceso |

SmolVLA se posiciona como una alternativa ligera y abierta frente a VLAs masivos como OpenVLA o RT-2, priorizando la eficiencia y el despliegue en hardware asequible. Este fine-tuning concreto añade la especificidad de una tarea robótica particular sobre esa base.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no se ha verificado la tasa de éxito en el robot real, por lo que el rendimiento efectivo es desconocido.
- Dataset de entrenamiento muy reducido: solo 60 episodios para tres tareas, lo que aumenta el riesgo de sobreajuste y limita la generalización a nuevas posiciones, objetos o condiciones de iluminación.
- Tareas en vietnamita: las instrucciones están en vietnamita; el modelo puede no responder correctamente a instrucciones en otros idiomas sin un fine-tuning adicional.
- Dependencia del modelo base: el rendimiento final depende de las capacidades de `lerobot/smolvla_base`; cualquier limitación del base (p. ej., alucinaciones visuales) se hereda.
- Requiere hardware robótico específico: el modelo está entrenado para el robot `so_follower` con una configuración de cámaras concreta; usarlo con otro robot o disposición de cámaras requerirá reentrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero es recomendable revisar los términos del modelo base y del dataset para asegurar el cumplimiento.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones incoherentes en situaciones fuera de distribución, lo que debe tenerse en cuenta en entornos con presencia humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThiennNguyen/smolvla_candy
- Dataset de entrenamiento: https://huggingface.co/datasets/ThiennNguyen/record-test-60eps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de HuggingFace sobre SmolVLA: https://huggingface.co/blog/smolvla
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
