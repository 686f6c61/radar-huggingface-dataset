# twanghcmut/openvla-oft-so101-left-arm-task3

## Resumen

OpenVLA-OFT fine-tuned sobre el brazo izquierdo del robot SO-101 es un checkpoint de visión-lenguaje-acción (VLA) construido a partir de `openvla/openvla-7b` y ajustado con la receta oficial OFT+ (Optimized Fine-Tuning) del repositorio OpenVLA-OFT. Lo publica el usuario `twanghcmut` para un conjunto de tres tareas de manipulación sobre un robot de bajo coste SO-101. El modelo recibe dos imágenes (cámara superior y de muñeca) más el estado articular (propriocepción) y emite directamente un bloque de 25 acciones continuas por llamada, en lugar de la acción única que produce OpenVLA estándar.

La relevancia de este checkpoint es doble: por un lado demuestra que es viable adaptar un VLA de 7B a un brazo de 6 grados de libertad con datos modestos (159 episodios, 133.763 fotogramas a 30 fps) y una sola H100 durante unas 20 horas; por otro, publica una comparativa homogénea de ocho frameworks VLA (TurboVLA, GR00T N1.6/N1.7, π0.5, MolmoAct2, Evo-1, OpenVLA, entre otros) evaluados sobre las mismas trayectorias, lo que facilita la comparación entre arquitecturas.

La arquitectura subyacente es un transformer de 7.541 millones de parámetros (backbone Llama-2 con adaptador visual y cabeza de regresión L1), con decodificación paralela del bloque de acciones y condicionamiento lingüístico FiLM. La licencia es MIT, aunque el backbone Llama-2 añade la Llama 2 Community License. El checkpoint no se ha probado en el robot real y sus métricas proceden de evaluación en bucle abierto sobre datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer; backbone Llama-2 7B con adaptador visual, proyector de propriocepción, FiLM y cabeza de regresión L1 para bloques de acciones |
| Parametros totales | 7.541.237.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | MIT (con Llama 2 Community License adicional sobre el backbone) |
| Formato de pesos | safetensors (modelo fusionado) + checkpoints `.pt` separados para cabeza de acción, proyector de propriocepción y backbone visual |
| Dimensión de acción | 6 (ACTION_DIM), gripper continuo |
| Dimensión de propriocepción | 6 (PROPRIO_DIM) |
| Bloque de acciones | 25 acciones por llamada (NUM_ACTIONS_CHUNK) |
| Entradas | 2 imágenes 224x224 (top + wrist) + estado articular |
| Normalización | BOUNDS (min/max a [-1, 1]), objetivos articulares absolutos |
| Librería | transformers |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo parte de OpenVLA-7B, un VLA que combina un codificador visual (DINOv2 + SigLIP, según el diseño original de OpenVLA) con el LLM Llama-2 de 7B. Sobre esa base, la receta OFT+ introduce cuatro cambios: regresión L1 en lugar de tokenización discreta de acciones, predicción de un bloque de 25 acciones con decodificación paralela, condicionamiento lingüístico FiLM sobre el backbone visual y uso de dos cámaras más propriocepción como entrada. El ajuste se hizo con LoRA de rango 32 fusionado posteriormente en los pesos, learning rate 5e-4 con decaimiento 10x en el paso 16.000, batch efectivo de 32 (8 x 4 de acumulación) y 24.000 pasos, equivalentes a unos 768.000 ejemplos (aproximadamente 5,7 épocas sobre el dataset).

Los datos provienen de `hungho77/so101-left-arm-task3`: 159 episodios, 133.763 fotogramas a 30 fps y tres tareas (sacar un cubo rojo de una olla y meterlo en un cubo hueco naranja; abrir el cajón superior, coger un bloque cuadrado rojo, meterlo y cerrar; abrir el cajón, coger el cubo rojo y apilarlo sobre el azul). El autor sustituyó la conversión RLDS por un dataset PyTorch que reproduce el padding de chunks al final de episodio, las aumentaciones y el formato de etiquetas. El entrenamiento se ejecutó en una H100 de 80 GB en bf16, con 72 GiB de pico de memoria y 20,3 horas (3,05 s por paso). La pérdida L1 bajó de 0,72 en el paso 10 a 0,023 en el paso 24.000.

## Capacidades

- Generación de bloques de 25 acciones continuas de 6 dimensiones (5 articulaciones + gripper) a partir de dos imágenes y el estado articular.
- Comprensión de instrucciones en lenguaje natural en inglés mediante condicionamiento FiLM, con tres tareas específicas aprendidas.
- Percepción visual multi-cámara (cámara superior y de muñeca) a resolución 224x224.
- Integración de propriocepción (posición articular actual) como señal de entrada.
- Control de manipulación con gripper continuo y objetivos articulares absolutos.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es un modelo puramente reactivo de política visomotora.
- No tiene capacidades multilingües declaradas ni modo de razonamiento explícito (thinking mode).
- No procesa audio ni vídeo; trabaja fotograma a fotograma con dos imágenes por inferencia.

## Casos de uso

- Manipulación robótica de pick-and-place en laboratorio: el modelo ejecuta la tarea de sacar un cubo de un recipiente y depositarlo en otro, adecuado para prototipos de investigación con brazos SO-101 de bajo coste.
- Automatización de tareas de cajón: abrir, depositar un objeto y cerrar, gracias al bloque de 25 acciones que reduce la frecuencia de inferencia necesaria frente a políticas de acción única.
- Apilamiento de objetos: la tarea 2 (apilar un cubo rojo sobre uno azul) sirve como banco de pruebas para evaluar precisión de posicionamiento con gripper continuo.
- Investigación comparativa de frameworks VLA: el checkpoint forma parte de una serie homogénea (TurboVLA, GR00T, π0.5, MolmoAct2, Evo-1) que permite comparar arquitecturas sobre el mismo dataset y las mismas trayectorias.
- Fine-tuning sobre nuevos robots de bajo coste: la receta OFT+ con LoRA rango 32 y 24.000 pasos en una sola H100 es reproducible para adaptar el modelo a otras tareas o brazos.
- Docencia y experimentación en robótica de manipulación: el setup SO-101, los scripts de evaluación en bucle abierto y las estadísticas del dataset facilitan reproducir el pipeline completo en un entorno académico.
- Base para evaluación en bucle cerrado: aunque el autor no lo ha probado en el robot real, el checkpoint y los scripts (`eval_so101_task3_oft.py`) permiten desplegarlo y medir tasa de éxito real.

## Benchmarks y rendimiento

Evaluación en bucle abierto, in-sample, sobre 6 trayectorias de entrenamiento (episodios 0, 25, 51, 80, 108, 133), hasta 400 pasos, comparando los primeros 16 de los 25 pasos predichos con las acciones registradas. MAE en unidades del dataset; % = MAE / 29,97.

| Trayectoria | Tarea | MAE |
|---|---|---|
| 0 | 0 | 1,197 |
| 25 | 0 | 1,700 |
| 51 | 1 | 1,081 |
| 80 | 1 | 1,355 |
| 108 | 2 | 1,536 |
| 133 | 2 | 1,505 |
| **Media** | | **1,396 (4,66%)** |

Baselines sobre los mismos anclajes: mantener la acción actual 2,043 (6,82%); mantener el estado actual 3,694 (12,33%). El error crece con la posición dentro del bloque (0,81 en el paso 0 hasta aproximadamente 1,67 en el paso 12).

Comparativa con otros checkpoints de la misma serie sobre las mismas trayectorias (cada uno puntuado con el script de su framework):

| Modelo | MAE |
|---|---|
| TurboVLA | 0,909 |
| GR00T N1.6 | 1,345 |
| π0.7-style π0.5 (RTC) | 1,366 |
| **OpenVLA-OFT (este)** | **1,396** |
| GR00T N1.7 | 1,440 |
| π0.5 | 1,459 |
| MolmoAct2 | 1,877 |
| Evo-1 | 2,040 |
| OpenVLA (acción única, solo cámara superior) | 3,619 (hold-16) |

No hay partición de validación independiente: estas cifras miden ajuste sobre datos de entrenamiento, no generalización, y no son una tasa de éxito. El checkpoint no se ha ejecutado en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15-16 GB solo para los pesos del modelo; con activaciones, buffers de imagen y el estado del entorno conviene reservar 20-24 GB.
- Entrenamiento: el autor usó 1 x H100 80GB en bf16 con 72 GiB de pico y 3,05 s por paso durante 24.000 pasos.
- GPU recomendadas para inferencia: A100 40/80GB, H100, L40S, RTX 6000 Ada. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) debería poder alojar los pesos en bf16, aunque con margen ajustado.
- No cabe en GPUs de 16 GB o menos sin cuantización; no se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) para este checkpoint.
- Opciones de despliegue: el autor proporciona `so101/eval_so101_task3_oft.py` sobre la ruta de inferencia oficial de OpenVLA-OFT; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este uso robótico.
- Latencia y throughput: no disponibles para inferencia; el dato de 3,05 s por paso corresponde al entrenamiento, no al despliegue. La decodificación paralela del bloque de 25 acciones reduce la frecuencia de inferencia frente a políticas de acción única.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MAE (task3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **OpenVLA-OFT (este)** | 7,54B | no disponible | 1,396 | MIT + Llama 2 Community | Hugging Face |
| TurboVLA | no disponible | no disponible | 0,909 | no disponible | Hugging Face (`twanghcmut/turbovla-so101-left-arm-task3`) |
| GR00T N1.6 | no disponible | no disponible | 1,345 | no disponible | Hugging Face (`twanghcmut/gr00t-n1d6-so101-left-arm-task3`) |
| π0.5 | no disponible | no disponible | 1,459 | no disponible | Hugging Face (`twanghcmut/pi05-so101-left-arm-task3`) |
| OpenVLA (base, acción única) | 7B | no disponible | 3,619 (hold-16) | MIT + Llama 2 Community | Hugging Face (`twanghcmut/openvla-7b-so101-left-arm-task3`) |

La comparación se limita a la métrica MAE en bucle abierto sobre las mismas trayectorias; no hay datos de tasa de éxito en robot real para ninguno de los checkpoints de la serie. TurboVLA obtiene el mejor MAE (0,909), seguido de GR00T N1.6 (1,345) y π0.7-style π0.5 (1,366); este OpenVLA-OFT queda en cuarta posición con 1,396, por delante de GR00T N1.7, π0.5, MolmoAct2 y Evo-1.

## Limitaciones y advertencias

- Evaluación in-sample: las métricas se calculan sobre trayectorias de entrenamiento, sin partición de validación, por lo que no miden generalización.
- No se ha probado en el robot real; no hay tasa de éxito en bucle cerrado.
- El error crece con la posición dentro del bloque de acciones (de 0,81 en el paso 0 a ~1,67 en el paso 12), lo que limita la fiabilidad de las acciones más lejanas del chunk.
- Solo cubre tres tareas específicas en inglés sobre el brazo izquierdo de un SO-101; no es un modelo generalista.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras modalidades (audio, vídeo).
- Riesgo de alucinación visual y de sobreajuste al entorno y a las condiciones de iluminación del dataset de entrenamiento.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos derivados de la distribución limitada de objetos, posiciones y escenas del dataset.
- Restricciones de licencia: el código y los pesos de OpenVLA-OFT y `openvla-7b` son MIT, pero el backbone Llama-2 está cubierto además por la Llama 2 Community License, que impone condiciones adicionales (por ejemplo, umbral de usuarios activos mensuales y restricciones de uso) para uso comercial a gran escala.
- El repositorio pesa 18,8 GB e incluye checkpoints `.pt` adicionales (cabeza de acción, proyector de propriocepción, backbone visual) que deben cargarse por separado siguiendo `experiments/robot/openvla_utils.py`.
- Sin cuantizaciones publicadas: el despliegue en GPUs de consumo requiere bf16 y al menos 24 GB de VRAM.
- Fecha de creación del repositorio: 2026-11-26; última actualización el mismo día, sin historial posterior de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/openvla-oft-so101-left-arm-task3
- Modelo base: https://huggingface.co/openvla/openvla-7b
- Repositorio oficial OpenVLA-OFT: https://github.com/moojink/openvla-oft
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Checkpoint TurboVLA comparable: https://huggingface.co/twanghcmut/turbovla-so101-left-arm-task3
- Checkpoint GR00T N1.6 comparable: https://huggingface.co/twanghcmut/gr00t-n1d6-so101-left-arm-task3
- Checkpoint GR00T N1.7 comparable: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
- Checkpoint π0.7-style π0.5 (RTC) comparable: https://huggingface.co/twanghcmut/openpi-pi07-so101-left-arm-task3
- Checkpoint π0.5 comparable: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Checkpoint MolmoAct2 comparable: https://huggingface.co/twanghcmut/molmoact2-so101-left-arm-task3
- Checkpoint Evo-1 comparable: https://huggingface.co/twanghcmut/evo1-so101-left-arm-task3
- Checkpoint OpenVLA (acción única) comparable: https://huggingface.co/twanghcmut/openvla-7b-so101-left-arm-task3
- Licencia Llama 2 Community: https://ai.meta.com/llama/license/
