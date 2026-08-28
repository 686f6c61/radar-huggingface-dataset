# Teensy/teensy-vad-v6

## Resumen

teensy-vad-v6 es la sexta generación de la familia TeensyVAD, un detector de actividad de voz (VAD) diseñado específicamente para telefonía a 8 kHz. Desarrollado por Pankaj Doharey / Metacritical (VoxLogic), este modelo resuelve el problema de detectar cuándo hay voz humana en un flujo de audio de baja calidad y baja frecuencia de muestreo, con un coste computacional mínimo y sin dependencias pesadas. Su relevancia actual radica en que, en lugar de aumentar parámetros (algo que la ablación interna demuestra que perjudica el rendimiento a partir de 80k), amplía la ventana temporal de contexto de 100 ms a 250 ms e incorpora hard-example mining, logrando mejoras reales en benchmarks con modelos de entre 20k y 49k parámetros.

La arquitectura es un MLP (perceptrón multicapa) con ventana temporal, ejecutable únicamente con NumPy y exportable a ONNX. Se ofrecen tres variantes principales: v6-a1 (24.441 parámetros, 250 ms de contexto), v6-a2 (49.249 parámetros, 250 ms, recomendada como opción por defecto) y v6-c (20.449 parámetros, 100 ms, con mining). Los pesos se distribuyen bajo licencia CC BY 4.0, lo que permite uso comercial con atribución, y el código es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con ventana temporal; no se especifica detalle de capas |
| Parametros totales | 20.449 (v6-c), 24.441 (v6-a1), 49.249 (v6-a2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 250 ms para v6-a1 y v6-a2; 100 ms para v6-c |
| Tipos de cuantizacion | ONNX float32 y ONNX int8 dinámico |
| Idiomas soportados | Inglés (según limitaciones declaradas) |
| Licencia | CC BY 4.0 (pesos), MIT (código) |
| Formato de pesos | .npz (NumPy), .onnx, .onnx int8 |

## Arquitectura y entrenamiento

El modelo es un MLP que procesa ventanas de audio de 8 kHz. La innovación principal de v6 es ampliar el contexto temporal de 100 ms a 250 ms, lo que permite capturar mejor la dinámica del habla. La ablación interna muestra que aumentar la capacidad del MLP más allá de 80k parámetros degrada el rendimiento en el conjunto TEN VAD, mientras que ampliar el contexto mejora el F1 y el AUC con menos parámetros. Además, se aplica hard-example mining, que sobremuestrea los fotogramas donde el profesor (Silero VAD) y la construcción del modelo discrepan, añadiendo aproximadamente +0.004 de AUC sin aumentar el tamaño.

El entrenamiento usa datos con licencia CC BY 4.0: LibriSpeech train-clean-100, MUSAN para ruido, AMI ambience para ambiente de sala, y Silero VAD como profesor (MIT). No se menciona el uso de RLHF ni DPO; el proceso es de destilación supervisada. El runtime es exclusivamente NumPy, sin dependencias adicionales, y se verifica la paridad entre los pesos .npz y las versiones ONNX (float32 e int8).

## Capacidades

- Detección de actividad de voz en streaming: procesa tramas de 20 ms PCM16LE a 8 kHz y emite eventos `speech_start` y `speech_end`.
- Funciona en tiempo real con latencia de 63-66 µs por trama de 20 ms (según variante), lo que permite uso en sistemas embebidos y telefonía.
- Exportable a ONNX (float32 e int8) para integración en frameworks de inferencia estándar.
- Sin dependencias de GPU ni librerías de deep learning; solo NumPy.
- Umbrales calibrados incluidos en los metadatos: `thr_hi 0.10` para micrófono distante (sala) y `thr_hi 0.45` para micrófono cercano.
- Soporta integración con Asterisk AudioSocket según el repositorio de GitHub.

## Casos de uso

- Preprocesamiento para ASR en telefonía: el modelo puede filtrar silencios y no-voz antes de enviar audio a un reconocedor de voz, reduciendo coste computacional y mejorando la precisión del ASR al eliminar tramas irrelevantes.
- Sistemas de contestador automático: detecta cuándo el interlocutor empieza o deja de hablar para gestionar turnos de conversación en tiempo real.
- Ahorro energético en dispositivos embebidos: al ser extremadamente ligero (20-50k parámetros), puede ejecutarse en microcontroladores o DSPs para activar el micrófono solo cuando hay voz, prolongando la batería en asistentes de voz o grabadoras.
- Monitorización de salas de reuniones: detecta actividad de voz en entornos con micrófono distante (perfil AMI) para activar grabación o transcripción solo cuando hay habla, ahorrando almacenamiento.
- Filtrado de audio en VoIP: elimina ruido de fondo y silencios en llamadas IP antes de transmitir, reduciendo el ancho de banda necesario.
- Análisis de llamadas de atención al cliente: segmenta automáticamente las conversaciones en turnos de habla para su posterior análisis de sentimiento o extracción de métricas.

## Benchmarks y rendimiento

La model card incluye resultados sobre el conjunto TEN VAD y AMI (sala real). Se presentan F1 y AUC con umbrales calibrados en AMI-dev.

| Variante | Params | Contexto | Mining | TEN F1* | TEN AUC | AMI F1 | AMI AUC | µs/20ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| v5-20k | 20.449 | 100 ms | — | 0.8953 | 0.8760 | 0.8836 | 0.8579 | 64 |
| v5-80k (pico) | 80.373 | 100 ms | — | 0.9016 | 0.8877 | 0.8845 | 0.8622 | 63 |
| v5-150k | 148.941 | 100 ms | — | 0.8993 | 0.8827 | 0.8861 | 0.8622 | 66 |
| v5-200k | 198.431 | 100 ms | — | 0.8975 | 0.8849 | 0.8849 | 0.8599 | 75 |
| **v6-a1** | **24.441** | **250 ms** | — | **0.9081** | 0.8834 | 0.8842 | 0.8683 | 64 |
| **v6-a2** | **49.249** | **250 ms** | — | **0.9081** | **0.8870** | 0.8822 | **0.8726** | 66 |
| v6-c | 20.449 | 100 ms | ✓ | 0.8957 | 0.8799 | 0.8853 | 0.8594 | 63 |
| Silero VAD (1.77M) | 1.774.000 | recurrente | — | 0.9381 | 0.9519 | 0.7136 | 0.8938 | 94 |
| WebRTC VAD | ~6k | 10 ms | — | n/a | n/a | 0.8419 | 0.7602 | 2 |
| Energy VAD | — | — | — | — | 0.6702 | 0.5920 | 0.6578 | 7 |

*TEN F1 en el mejor umbral (cota superior); AMI con umbrales calibrados en AMI-dev.

## Requisitos de hardware

- Inferencia en CPU pura: el runtime es NumPy, sin GPU necesaria. La latencia medida es de 63-66 µs por trama de 20 ms en hardware no especificado, lo que sugiere que puede ejecutarse en tiempo real en procesadores ARM o incluso microcontroladores con suficiente memoria.
- VRAM: no aplica; el modelo no requiere GPU. El tamaño de los pesos es de 22-50 KB en ONNX int8.
- GPUs recomendadas: ninguna; el modelo está pensado para entornos sin aceleración dedicada.
- Opciones de despliegue: integración directa en Python con `teensyvad.StreamingVAD`, exportación a ONNX para usar con ONNX Runtime, y soporte para Asterisk AudioSocket según el repositorio.
- Throughput: procesa una trama de 20 ms en menos de 70 µs, por lo que puede manejar múltiples canales de audio simultáneamente en un solo núcleo de CPU.

## Comparativa con modelos similares

| Modelo | Params | Contexto | TEN AUC | AMI F1 | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| **teensy-vad-v6-a2** | 49.249 | 250 ms | 0.8870 | 0.8822 | CC BY 4.0 | .npz, .onnx |
| **teensy-vad-v6-a1** | 24.441 | 250 ms | 0.8834 | 0.8842 | CC BY 4.0 | .npz, .onnx |
| Silero VAD | 1.774.000 | recurrente | 0.9519 | 0.7136 | MIT | .onnx, .pt |
| WebRTC VAD | ~6k | 10 ms | n/a | 0.8419 | BSD | binario |
| Energy VAD | — | — | 0.6702 | 0.5920 | — | — |

Silero VAD lidera en el escenario de micrófono cercano (TEN AUC), pero con 36 veces más parámetros y arquitectura recurrente. En salas reales (AMI), teensy-vad-v6 supera a Silero en F1 por un margen amplio (0.88+ vs 0.714). WebRTC es más rápido pero con menor rendimiento. Energy VAD es claramente inferior.

## Limitaciones y advertencias

- Solo inglés: el entrenamiento se realizó con datos en inglés (LibriSpeech, AMI), por lo que el rendimiento en otros idiomas no está garantizado.
- Sin música en el entrenamiento: la detección puede fallar con contenido musical o con voz cantada.
- Contexto limitado a 250 ms: no es un modelo recurrente, por lo que no puede modelar dependencias de largo plazo; los profesores recurrentes aún superan en escenarios de micrófono cercano limpio.
- Sin cancelación de eco acústico (AEC): no está diseñado para manejar eco en llamadas.
- Riesgo de alucinación: al ser un VAD binario, el riesgo se limita a falsos positivos o negativos en condiciones de ruido extremo o habla no inglesa.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero debe citarse al autor (© 2026 Pankaj Doharey / Metacritical, TeensyVAD por VoxLogic).
- No se proporcionan datos sobre sesgos demográficos o de acento; el entrenamiento con LibriSpeech puede favorecer acentos norteamericanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Teensy/teensy-vad-v6
- Repositorio GitHub (TeensyVAD): https://github.com/TeensyAI/teensyvad
- Modelo previo teensy-vad-1: https://huggingface.co/Teensy/teensy-vad-1
