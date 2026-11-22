# zk0bot/onarm-ft-base-so101

## Resumen

onarm-ft-base-so101 es un checkpoint de ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, desarrollado por el usuario zk0bot como artefacto de estudio y copia de seguridad. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, entrenado sobre el dataset `lerobot/svla_so101_pickplace` con 50 episodios durante 10.000 pasos, finalizado el 19 de noviembre de 2026. Forma parte de una preinscripción experimental denominada "on-arm 2x2" (BENCH-003 REAL-1/REAL-2 calibration) y no es el modelo final distribuido por el proyecto.

El modelo cuenta con 450.046.176 parámetros (aproximadamente 450 millones) almacenados en un único archivo `model.safetensors` de 906.712.552 bytes, dentro de un repositorio de 0,9 GB. La arquitectura subyacente es SmolVLA, un modelo compacto de la familia LeRobot que combina percepción visual con generación de acciones motoras. Su relevancia es limitada fuera del contexto del estudio: el propio autor advierte explícitamente que se trata de una copia de seguridad de checkpoint y que el modelo publicado oficialmente se encuentra en `ivelin/zk0-smolvla-fl`.

La licencia Apache 2.0 permite uso comercial y modificación, pero la naturaleza experimental del artefacto, la ausencia de documentación sobre rendimiento y la falta de datos de evaluación desaconsejan su uso en producción sin una validación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tune de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 906.712.552 bytes) |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, la variante compacta de visión-lenguaje-acción de la librería LeRobot de Hugging Face. Este tipo de arquitectura procesa observaciones visuales (imágenes de cámaras del robot) junto con instrucciones en lenguaje natural para producir secuencias de acciones motoras, lo que la sitúa en el ámbito de los modelos fundacionales para robótica y control de manipuladores. El checkpoint aquí descrito es un ajuste fino del modelo base `lerobot/smolvla_base` sobre el dataset `lerobot/svla_so101_pickplace`, compuesto por 50 episodios de demostración de la tarea de recoger y colocar (pick-and-place) con el brazo robótico SO-101.

El entrenamiento se ejecutó durante 10.000 pasos en una estación DGX Spark, con el checkpoint final guardado en el paso 010000. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de las inherentes a SmolVLA. El hash SHA-256 del archivo de pesos previo a la subida es `aa520f20b488f6e927187022bbe17cef92201a42318235396bfcddb40fc6a7c4`, dato útil para verificar la integridad de la copia.

## Capacidades

- Control robótico de manipulación: genera acciones motoras para tareas de pick-and-place sobre el brazo SO-101.
- Percepción visual: procesa observaciones de cámaras para condicionar la política de acción.
- Condicionamiento por lenguaje natural: acepta instrucciones textuales para especificar la tarea.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de Hugging Face LeRobot.
- Ajuste fino específico: especializado en la tarea `svla_so101_pickplace` con 50 episodios.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües, modo thinking, audio u otras capacidades generales.

## Casos de uso

- Investigación en robótica de manipulación: servir como punto de partida para reproducir el experimento BENCH-003 REAL-1/REAL-2 y comparar la calibración del ajuste fino sobre SmolVLA.
- Evaluación de políticas pick-and-place: utilizar el checkpoint para medir la tasa de éxito en la tarea `svla_so101_pickplace` y contrastarla con el modelo base sin ajustar.
- Ajuste fino posterior (continual learning): emplear el checkpoint como inicialización para entrenar variantes con más episodios o tareas adicionales sobre el mismo hardware SO-101.
- Verificación de integridad de artefactos: el hash SHA-256 publicado permite auditar la reproducibilidad de la copia de seguridad en pipelines de MLOps.
- Docencia y formación: ilustrar el flujo completo de fine-tuning de un VLA compacto con LeRobot, desde el dataset hasta el checkpoint desplegable.
- Baseline para comparativas internas: servir de referencia en estudios de ablación sobre número de episodios, pasos de entrenamiento o configuración de cámaras.
- No se recomienda su uso en producción ni en aplicaciones de atención al cliente, generación de código o tareas de lenguaje general, ya que no es un modelo de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar el coste del codificador visual y de los buffers de inferencia.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una DGX Spark (hardware de NVIDIA orientado a estaciones de trabajo con GPU).
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (librería nativa), con posibilidad de exportación a otros runtimes no documentada; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zk0bot/onarm-ft-base-so101 | 450 M | no disponible | VLA pick-and-place (SO-101) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA generalista | no disponible en la informacion | Hugging Face |
| ivelin/zk0-smolvla-fl | no disponible en la informacion | no disponible | VLA (modelo oficial del proyecto zk0) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de estudio: el autor indica explícitamente que no es el modelo distribuido oficialmente; el modelo publicado vive en `ivelin/zk0-smolvla-fl`.
- Especialización estrecha: entrenado solo sobre 50 episodios de una única tarea (pick-and-place con SO-101), por lo que no generaliza a otras tareas, brazos o entornos sin reentrenamiento.
- Sin datos de evaluación: no hay benchmarks, métricas de tasa de éxito ni curvas de aprendizaje publicadas.
- Riesgo de sobreajuste: 10.000 pasos sobre 50 episodios es un régimen propenso a memorizar las demostraciones.
- Idiomas: no se documenta soporte multilingüe; las instrucciones en lenguaje natural del dataset probablemente estén en un único idioma no especificado.
- Contexto: no se documenta la longitud de contexto ni la resolución de las observaciones visuales.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de validación desaconseja su despliegue en producción.
- Integridad: conviene verificar el hash SHA-256 antes de usar el checkpoint, dado que es una copia de seguridad.
- Sin garantías del autor sobre robustez, sesgos o comportamiento en entornos reales distintos del de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zk0bot/onarm-ft-base-so101
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Modelo oficial del proyecto zk0: https://huggingface.co/ivelin/zk0-smolvla-fl
- Librería LeRobot: https://github.com/huggingface/lerobot
