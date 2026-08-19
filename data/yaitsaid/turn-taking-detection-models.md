# yaitsaid/turn-taking-detection-models

## Resumen

El repositorio `yaitsaid/turn-taking-detection-models` contiene una colección de modelos de clasificación de audio para la detección de turnos conversacionales (turn-taking), es decir, la tarea de decidir si el hablante actual debe mantener la palabra (HOLD) o cederla al interlocutor (SHIFT). El autor, yaitsaid, ha desarrollado tres arquitecturas distintas: un backbone acústico causal basado en ECAPA-TDNN (462K parámetros), un clasificador sobre el encoder congelado de Whisper-tiny (49.5K parámetros entrenables) y una fusión de ambas señales mediante cross-attention y TCN (Phase 2, ~360K parámetros entrenables más 8M congelados). El modelo se ha entrenado sobre Smart Turn v3.2 (dataset sintético) y AppTek (audio real de centros de llamadas con 14 acentos anglófonos), y se compara directamente con el modelo oficial Smart Turn v3.2 de Pipecat, superándolo en precisión con una fracción de los parámetros. La licencia es MIT y el pipeline es de audio-classification.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples: ECAPA-TDNN causal, encoder Whisper-tiny congelado + clasificador, y fusión ECAPA + Whisper con cross-attention + TCN |
| Parametros totales | No disponible globalmente; por modelo: Phase 1 ~462K, Whisper-frozen ~8M (49.5K entrenables), Phase 2 ~8.36M (~360K entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la ventana de audio de entrada, no especificada) |
| Tipos de cuantizacion | No disponible (pesos en formato .pt, sin cuantización publicada) |
| Idiomas soportados | Inglés (14 acentos según el dataset AppTek); metadatos indican "no disponibles" |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La colección incluye tres arquitecturas diseñadas para la detección causal de turnos, es decir, que procesan el audio en tiempo real sin mirar hacia el futuro. La primera (Phase 1) es un backbone acústico ECAPA-TDNN entrenado desde cero con 462K parámetros. La segunda (Whisper-frozen) utiliza el encoder de Whisper-tiny congelado (8M parámetros) y añade una cabeza de clasificación lineal con 49.5K parámetros entrenables. La tercera (Phase 2) combina ambas fuentes: el ECAPA-TDNN y el encoder Whisper, ambos congelados, y añade una capa de cross-attention causal seguida de una red TCN para fusionar la información acústica y semántica. El entrenamiento se realizó sobre el dataset sintético Smart Turn v3.2 y un mix con AppTek (audio real de centros de llamadas, 13 acentos en train y 1 en OOD). El protocolo de evaluación separa estrictamente entrenamiento, validación y test, y añade un conjunto OOD con acento en-CN nunca visto. No se menciona el uso de RLHF ni DPO, ya que es una tarea de clasificación supervisada.

## Capacidades

- Clasificación binaria de turnos conversacionales: HOLD (mantener el turno) o SHIFT (ceder el turno).
- Procesamiento de audio en tiempo real gracias a la arquitectura causal (sin dependencia de frames futuros).
- Fusión de información acústica (ECAPA-TDNN) y semántica (Whisper) para mejorar la robustez en dominios no vistos.
- Generalización a acentos no entrenados (OOD), especialmente con la fusión Phase 2 (71.07% de accuracy en en-CN).
- Ligereza computacional: los modelos entrenables tienen menos de 1M de parámetros en el caso de Phase 1 y Whisper-frozen, lo que permite inferencia en dispositivos con recursos limitados.
- No se reporta soporte para tool calling, agentes ni otras capacidades de lenguaje natural; es exclusivamente un clasificador de audio.

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede decidir en tiempo real si el usuario ha terminado de hablar y el asistente debe responder, mejorando la fluidez del diálogo.
- Sistemas de atención al cliente automatizados: en centros de llamadas, permite detectar cuándo el cliente cede el turno y el agente virtual puede intervenir sin pisar la conversación.
- Robótica de interacción social: robots que mantienen conversaciones con humanos necesitan detectar el fin de turno para responder en el momento adecuado, evitando solapamientos.
- Transcripción y subtitulado en vivo: en reuniones o entrevistas, la detección de turnos ayuda a asignar etiquetas de hablante y a segmentar el audio por intervenciones.
- Análisis de conversaciones grabadas: para estudios de lingüística o sociología, permite anotar automáticamente los cambios de turno en corpus de audio.
- Entrenamiento de modelos de diálogo: como componente de preprocesamiento para sistemas de diálogo que necesitan saber cuándo cambiar de hablante en datos de entrenamiento.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan los modelos de esta colección con el modelo oficial Smart Turn v3.2 de Pipecat sobre el test set oficial `smart-turn-data-v3.2-test`. Se incluye también la evaluación sobre AppTek (acentos vistos) y un conjunto OOD (acento en-CN).

| Modelo | Params entrenables | Smart Turn test (acc) | AppTek test (acc) | OOD en-CN (acc) | ROC-AUC (Smart Turn) |
|---|---|---|---|---|---|
| Smart Turn v3.2 (oficial) | ~8M | 73.33% | - | - | 0.7962 |
| Phase 1 (ECAPA-TDNN, from scratch) | 462K | 87.50% | - | - | 0.9459 |
| Phase 1 (mix v3) | 462K | 87.42% | 68.54% | 59.54% | 0.9450 |
| Whisper-frozen (mix v3) | 49.5K | 86.14% | 71.64% | 68.68% | 0.9321 |
| Phase 2 (fusión, mix v3) | ~360K | 92.51% | 77.35% | 71.07% | 0.9772 |

Nota: los valores de ROC-AUC solo se reportan para Smart Turn test en la tabla comparativa inicial. Los resultados de AppTek y OOD corresponden a las versiones "mix v3".

## Requisitos de hardware

- Debido al reducido número de parámetros (462K en Phase 1, 49.5K entrenables en Whisper-frozen, ~360K entrenables en Phase 2), la inferencia puede ejecutarse en CPU sin problemas para aplicaciones en tiempo real.
- No se especifica VRAM mínima, pero estimaciones razonables indican que los modelos caben en menos de 1 GB de memoria, incluso en formato float32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, Jetson Nano) es suficiente; para despliegue masivo, una A10 o T4 bastaría.
- Opciones de despliegue: al ser pesos PyTorch nativos, se pueden cargar con `torch.load` y servir con frameworks como TorchServe, ONNX Runtime (si se exporta) o directamente en aplicaciones Python. No hay integración publicada con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia no está documentada, pero por el tamaño y la arquitectura causal se espera que sea inferior a 10 ms por frame en CPU moderna.

## Comparativa con modelos similares

El único modelo comparable con datos públicos en la información proporcionada es Smart Turn v3.2 de Pipecat, que es el punto de referencia oficial.

| Modelo | Params | Accuracy (Smart Turn test) | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smart Turn v3.2 (Pipecat) | ~8M | 73.33% | 0.7962 | No especificada | ONNX oficial |
| Phase 1 (este repo) | 462K | 87.50% | 0.9459 | MIT | PyTorch |
| Phase 2 (este repo) | ~360K entrenables | 92.51% | 0.9772 | MIT | PyTorch |

No se dispone de información sobre otros modelos de detección de turnos (p. ej., TurnGPT, etc.) para una comparativa más amplia.

## Limitaciones y advertencias

- El entrenamiento se realizó mayoritariamente con datos sintéticos (Smart Turn ~94% del volumen de train mixto), lo que puede limitar la transferencia a audio real no representado en el dataset.
- La cobertura de idiomas se limita al inglés con 14 acentos; no hay soporte para otros idiomas.
- El rendimiento cae notablemente en acentos no vistos (OOD): la mejor arquitectura (Phase 2) obtiene 71.07% de accuracy, frente al 92.51% en datos sintéticos, indicando una generalización incompleta.
- No se han publicado análisis de sesgos ni pruebas de robustez frente a ruido, solapamiento de hablantes o condiciones acústicas adversas.
- Los pesos se distribuyen en formato `.pt` sin cuantización ni exportación a ONNX, lo que puede requerir conversión adicional para despliegue en entornos de producción con restricciones de formato.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de soporte ni mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yaitsaid/turn-taking-detection-models
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
