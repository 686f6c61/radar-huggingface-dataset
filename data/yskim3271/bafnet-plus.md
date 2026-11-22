# yskim3271/BAFNet-plus

## Resumen

BAFNet+ es un modelo de mejora de voz (speech enhancement) diseñado para operar con señales de conducción ósea (bone-conduction) y conducción aérea (air-conduction) de forma conjunta. Lo desarrolla un equipo de POSTECH (Yunsik Kim, Youngseok Kim y Yoonyoung Chung) y se publica como artefacto asociado a un artículo en IEEE/ACM Transactions on Audio, Speech, and Language Processing (TASLP). El modelo aborda el problema de la captura de voz en condiciones adversas, donde el micrófono convencional sufre ruido ambiental y el sensor de conducción ósea, aunque inmune al ruido acústico, captura una señal de baja calidad y muy atenuada.

La propuesta técnica combina dos ideas: un equilibrio automático de niveles (automatic level balancing) entre ambas modalidades y una fusión guiada por fiabilidad (reliability-guided fusion) que pondera dinámicamente cada fuente según su calidad. El resultado es un modelo extremadamente compacto (2,782 M de parámetros, 44,73 GMACs/s a 16 kHz) con variantes de latencia algorítmica que van de 12,5 ms a 100 ms, pensadas para despliegue en tiempo real tanto en GPU como en DSP y CPU.

La relevancia actual reside en su orientación a producción: se distribuyen checkpoints PyTorch para cinco niveles de latencia (entrenados en el corpus coreano TAPS) más un punto de operación de 50 ms entrenado en el corpus francés Vibravox, junto con un grafo ONNX con estado (stateful) en FP32 para streaming. La licencia MIT y el tamaño reducido lo hacen apto para integración en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal multimodal de mejora de voz con ramas de mapeo y enmascaramiento (mapping/masking) y fusión guiada por fiabilidad; detalles internos de capas no disponibles |
| Parametros totales | 2,782 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa audio por chunks (2, 4, 8, 12 o 16 frames según el tier de latencia) |
| Tipos de cuantizacion | No disponible (solo se publica FP32 en ONNX; los checkpoints PyTorch son de precisión nativa) |
| Idiomas soportados | Coreano (ko) y francés (fr) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.th`), ONNX (FP32 stateful streaming) y configuraciones Hydra (`config.yaml`) |

## Arquitectura y entrenamiento

BAFNet+ es un modelo multimodal audio-audio que recibe pares de señal de conducción ósea y señal acústica y produce audio mejorado. La arquitectura se organiza en dos ramas (mapeo y enmascaramiento) cuyos hiperparámetros se exponen en los ficheros `config.yaml` bajo `args_mapping` y `args_masking`. La innovación central es la fusión guiada por fiabilidad, que estima la fiabilidad relativa de cada modalidad y combina ambas señales, junto con un mecanismo de equilibrio automático de niveles que compensa la fuerte atenuación típica de la señal de conducción ósea.

El entrenamiento se realizó sobre dos corpus: el dataset coreano TAPS (`yskim3271/Throat_and_Acoustic_Pairing_Speech_Dataset`), usado para los cinco tiers de latencia algorítmica (12,5, 25, 50, 75 y 100 ms), y el corpus francés Vibravox (`yskim3271/vibravox_16k`) para el checkpoint de 50 ms `vbx_bafnetplus_50ms`. El modelo trabaja a 16 kHz y mantiene el mismo tamaño (2,782 M de parámetros) en todos los tiers. El grafo ONNX es stateful, lo que permite procesar flujo continuo manteniendo el estado entre chunks. No se dispone de información sobre el número total de tokens de audio, la composición exacta de los datasets ni el uso de técnicas de RLHF o DPO (no aplicables directamente a una tarea de mejora de señal).

## Capacidades

- Mejora de voz en tiempo real a partir de pares de señal de conducción ósea y conducción aérea.
- Funcionamiento en streaming con latencia algorítmica configurable: 12,5, 25, 50, 75 y 100 ms.
- Fusión adaptativa de dos modalidades con ponderación por fiabilidad y equilibrio automático de niveles.
- Procesamiento a 16 kHz con chunks de 2 a 16 frames según el tier.
- Despliegue en GPU, DSP y CPU (se reportan RTF para las tres plataformas).
- Exportación ONNX stateful en FP32 para integración en pipelines de inferencia.
- Soporte de dos idiomas de entrenamiento: coreano y francés.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio-texto; es un modelo estrictamente audio-audio.

## Casos de uso

- Auriculares y cascos con micrófono de conducción ósea: BAFNet+ combina la señal del sensor óseo con el micrófono convencional para entregar voz limpia al usuario o al interlocutor, con latencias de 12,5 a 50 ms que evitan el efecto de eco percibido en llamadas.
- Comunicaciones en entornos ruidosos (industria, obra, emergencias): la fusión guiada por fiabilidad permite mantener inteligibilidad incluso a relaciones señal-ruido de -10 dB, donde la PESQ se mantiene en 3,111 para el tier de 50 ms.
- Integración en dispositivos embebidos con DSP: el RTF p99 de 0,94 en DSP para el tier de 50 ms indica que el modelo puede ejecutarse en tiempo real en hardware de bajo consumo sin GPU.
- Preprocesado para reconocimiento automático de voz (ASR): la mejora previa de la señal reduce errores de transcripción en capturas con ruido; el STOI de 0,959 a 0 dB sugiere una inteligibilidad preservada adecuada para alimentar un ASR posterior.
- Telefonía VoIP y videoconferencia: el checkpoint de 50 ms con ONNX stateful encaja en pipelines de audio en tiempo real con chunks de 8 frames, manteniendo el estado entre tramas.
- Audífonos y prótesis auditivas: la baja latencia algorítmica (12,5 ms en el tier mínimo) y el reducido consumo computacional permiten su integración en dispositivos auditivos donde la latencia adicional debe minimizarse.
- Investigación en mejora de voz multimodal: los seis checkpoints y las configuraciones autocontenidas facilitan la reproducción de experimentos y la comparación entre tiers de latencia y entre corpus (coreano y francés).

## Benchmarks y rendimiento

Resultados en TAPS (16 kHz) por tier de latencia:

| Modelo | T_alg | ρ | Chunk | PESQ 0 dB | STOI 0 dB | PESQ -10 dB | RTF GPU | RTF DSP (p99) | RTF CPU (p99) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| bafnetplus_12ms | 12,5 ms | 0,975 | 2 frames | 3,369 | 0,953 | 3,026 | 0,46 | 1,60 (1,85) | 2,44 (2,56) |
| bafnetplus_25ms | 25 ms | 0,95 | 4 frames | 3,451 | 0,957 | 3,100 | 0,22 | 1,33 (1,57) | 1,84 (1,94) |
| bafnetplus_50ms (por defecto) | 50 ms | 0,90 | 8 frames | 3,485 | 0,959 | 3,111 | 0,12 | 0,80 (0,94) | 1,11 (1,16) |
| bafnetplus_75ms | 75 ms | 0,84 | 12 frames | 3,484 | 0,959 | 3,119 | 0,08 | 0,61 (0,72) | 0,93 (0,97) |
| bafnetplus_100ms | 100 ms | 0,78 | 16 frames | 3,501 | 0,959 | 3,161 | 0,07 | 0,52 (0,58) | 0,87 (0,90) |

Validación cruzada en Vibravox (16 kHz, checkpoint de 50 ms):

| Modelo | T_alg | PESQ -20 dB | PESQ -10 dB | PESQ 0 dB | PESQ +10 dB | PESQ +15 dB |
|---|---:|---:|---:|---:|---:|---:|
| vbx_bafnetplus_50ms | 50 ms | 2,938 | 3,168 | 3,441 | 3,770 | 3,933 |

Complejidad: 2,782 M de parámetros y 44,73 GMACs/s a 16 kHz en los cinco tiers de TAPS. No se han publicado comparaciones directas con otros modelos de mejora de voz en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 2,782 M de parámetros en FP32 el peso ronda los 11 MiB por checkpoint, por lo que cualquier GPU con más de 1 GB de VRAM es suficiente.
- GPU recomendadas: no se especifican modelos concretos; se reporta RTF en GPU de 0,46 (tier 12,5 ms) a 0,07 (tier 100 ms), lo que indica holgura incluso en GPUs de gama media.
- Cabe en GPU de consumo: sí, dado el tamaño (11 MiB de pesos) cualquier GPU consumer moderna puede ejecutarlo; también se reporta ejecución en CPU y DSP.
- Opciones de despliegue: PyTorch nativo (checkpoints `best.th` con configuración Hydra) y ONNX Runtime para el grafo stateful FP32 de 50 ms. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: RTF p99 de 0,94 en DSP y 1,16 en CPU para el tier de 50 ms; 0,58 en DSP y 0,90 en CPU para el tier de 100 ms. El tier de 12,5 ms supera el tiempo real en DSP (RTF p99 1,85) y CPU (2,56), por lo que requiere GPU para cumplir latencia estricta.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones con otros modelos de mejora de voz multimodal (conducción ósea + aérea). Los benchmarks publicados son internos al propio modelo (distintos tiers de latencia y dos corpus). No disponible para una comparativa con alternativas externas.

| Modelo | Parámetros | Contexto/latencia | Licencia | Disponibilidad |
|---|---|---|---|---|
| BAFNet+ | 2,782 M | 12,5–100 ms | MIT | Hugging Face + GitHub |
| Alternativas de mejora de voz | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo se ha entrenado y validado en coreano y francés; el rendimiento en otros idiomas no está documentado.
- Requiere una señal de conducción ósea emparejada con la señal acústica; no funciona como modelo de mejora de voz de un solo canal.
- El tier de 12,5 ms no cumple tiempo real en DSP ni CPU (RTF p99 > 1), por lo que su uso en esos entornos exige GPU.
- Los resultados de Vibravox corresponden únicamente al checkpoint de 50 ms; no hay validación cruzada publicada para el resto de tiers.
- No se han publicado análisis de sesgos, robustez ante ruidos no vistos ni tasas de alucinación (concepto de limitada aplicación en mejora de señal, pero relevante para posibles artefactos introducidos).
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y depende de los datasets TAPS y Vibravox, cuyas condiciones de uso deben verificarse por separado.
- El ONNX publicado es solo FP32 y solo para el punto de operación de 50 ms; no hay versiones cuantizadas para despliegue en dispositivos con restricciones de memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/yskim3271/BAFNet-plus
- Repositorio de código: https://github.com/yskim3271/BAFNet-plus
- Demos de audio y espectrogramas: https://yskim3271.github.io/BAFNet-plus/
- Dataset TAPS: https://huggingface.co/datasets/yskim3271/Throat_and_Acoustic_Pairing_Speech_Dataset
- Dataset Vibravox 16k: https://huggingface.co/datasets/yskim3271/vibravox_16k
- Artículo: Y. Kim, Y. Kim, Y. Chung, "Low-Latency Body- and Air-Conducted Speech Enhancement via Automatic Level Balancing and Reliability-Guided Fusion", IEEE/ACM TASLP (referencia bibliográfica; enlace directo no disponible)
