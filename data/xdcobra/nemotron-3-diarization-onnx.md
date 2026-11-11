# XDcobra/Nemotron-3-Diarization-ONNX

## Resumen

Nemotron-3-Diarization-ONNX es una exportación a ONNX Runtime del modelo de diarización de hablantes `nvidia/Nemotron-3-Diarization`, publicada por el desarrollador XDcobra. Su propósito es llevar la diarización de hablantes (identificar quién habla y cuándo en un audio) a entornos móviles y de borde mediante el SDK `react-native-sherpa-onnx`, manteniendo el frontend Mel y las cachés AOSC/FIFO en el host y exponiendo únicamente un paso de streaming como grafo ONNX con ejes temporales dinámicos.

El modelo base emplea la arquitectura Sortformer de NVIDIA (un modelo de clasificación de hablantes basado en transformer con atención a caché de contexto), y esta distribución lo empaqueta en tres variantes de precisión: FP32 (382 MB), FP16 (201 MB) e INT8 (107 MB). Soporta hasta 8 hablantes simultáneos y ofrece cuatro presets de latencia configurables mediante `metadata.json`, desde un modo offline con búfer de 30,4 s hasta un modo ultra-bajo de 0,32 s, lo que permite adaptar el equilibrio entre latencia y precisión según el caso de uso.

La relevancia de esta ficha reside en que demuestra un flujo de cuantización y validación riguroso: el autor documenta métricas de paridad (coseno de predicciones, acuerdo de decisiones de hablante) frente a goldens FP32, y descarta explícitamente una cuantización Q4F16 por degradación inaceptable. Es, por tanto, un ejemplo útil de cómo publicar un modelo ONNX listo para producción con garantías verificables, aunque con la limitación de que la información disponible sobre el modelo base es escasa en esta fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (transformer con atención a caché de contexto, exportado a ONNX opset 17) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de streaming configurable: 0,32 s a 30,4 s según preset) |
| Tipos de cuantizacion | FP32, FP16, INT8 dinámico per-channel; Q4F16 medido y rechazado |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`) |

## Arquitectura y entrenamiento

El modelo base es `nvidia/Nemotron-3-Diarization`, un modelo de diarización de hablantes basado en la arquitectura Sortformer. La exportación a ONNX se realizó desde NeMo Speech (`SortformerEncLabelModel`) con el encoder configurado con `for_export=True`, usando máscara de atención SDPA porque FlexAttention no es trazable a ONNX. El grafo resultante corresponde a un único paso de streaming con ejes temporales dinámicos; el frontend Mel y las cachés AOSC/FIFO permanecen en el host, y el grafo recibe como entradas `chunk`, `chunk_lengths`, `spkcache`, `spkcache_lengths`, `fifo` y `fifo_lengths`, devolviendo `spkcache_fifo_chunk_preds`, `chunk_pre_encode_embs` y `chunk_pre_encode_lengths`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta distribución es el proceso de cuantización y validación: se midieron tres variantes (FP16, INT8 y Q4F16) y se descartó la última porque el coseno de predicciones frente a FP32 colapsó a ~0,66 en frío y ~0,51 en caliente, pese a que el umbral de decisión de 0,5 seguía coincidiendo en el fixture sintético. Las variantes FP16 e INT8 mantienen un acuerdo de decisión del 100 % en frío y en caliente, y un coseno de predicciones de 0,999999 y 0,991839 respectivamente.

## Capacidades

- Diarización de hablantes en streaming: identifica y segmenta hasta 8 hablantes simultáneos en tiempo real.
- Modo offline con búfer de 30,4 s y modos de baja latencia (1,04 s, 0,64 s y 0,32 s) configurables mediante `metadata.json`.
- Clasificación de audio a nivel de trama con predicciones de alta resolución temporal (10 ms por trama, `pred_frames = (spkcache_len + fifo_len + chunk_len) × 8`).
- Integración con el SDK móvil `react-native-sherpa-onnx` para aplicaciones React Native en Android e iOS.
- Ejecución en CPU mediante ONNX Runtime, con posibilidad de usar CoreML para comprobaciones locales de velocidad (las tablas publicadas son siempre CPU).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo exclusivamente de clasificación de audio.

## Casos de uso

- Transcripción de reuniones con etiquetado de hablantes: el modelo permite segmentar una reunión grabada o en directo en intervenciones atribuidas a cada participante, usando el preset offline de 30,4 s para maximizar la precisión en grabaciones ya completadas.
- Subtitulado en directo con identificación de interlocutor: con el preset low_latency (1,04 s) o very_low_latency (0,64 s) se puede etiquetar quién habla en una retransmisión mientras se genera el subtítulo, integrándolo en el pipeline de transcripción del SDK.
- Asistentes de voz en aplicaciones móviles: la variante INT8 (107 MB) cabe en el paquete de una app React Native y permite distinguir al usuario de otras personas presentes en el entorno sin depender de la nube.
- Análisis de llamadas de atención al cliente: la diarización permite separar la voz del agente y la del cliente para calcular tiempos de habla, solapamientos y turnos, usando el preset offline para llamadas ya registradas.
- Grabación de entrevistas o podcasts: el modelo identifica hasta 8 participantes y facilita la edición posterior al generar pistas o marcas temporales por hablante.
- Sistemas de reunión en dispositivos de borde: al ejecutarse en CPU con ONNX Runtime, puede desplegarse en hardware sin GPU (por ejemplo, un mini-PC o un dispositivo embebido) para diarizar reuniones localmente sin enviar audio a servidores externos.
- Investigación en procesamiento de habla: sirve como referencia reproducible de exportación ONNX de un modelo Sortformer, con métricas de paridad documentadas para comparar estrategias de cuantización.

## Benchmarks y rendimiento

Los datos disponibles son métricas de paridad de la exportación ONNX frente a goldens FP32 de ONNX Runtime en CPU, no benchmarks de precisión de diarización (DER, etc.) sobre corpus estándar.

Paridad de predicciones (preset offline, `chunk_len=340`, `spkcache_len=264`, `fifo_len=40`):

| Pack | Coseno preds (frío) | Coseno emb (frío) | Acuerdo decisión (frío) | Coseno preds (caliente) | Acuerdo decisión (caliente) |
|---|---:|---:|---:|---:|---:|
| FP32 | 1,000000 | 1,000000 | 1,000000 | 1,000000 | 1,000000 |
| FP16 | 0,999999 | 1,000000 | 1,000000 | 0,999999 | 1,000000 |
| INT8 | 0,991839 | 0,999892 | 1,000000 | 0,988309 | 1,000000 |
| Q4F16 (rechazado) | 0,660241 | 0,995526 | 1,000000* | 0,505773 | 1,000000* |

\* Acuerdo umbralizado solo sobre el fixture sintético; rechazado por el coseno de predicciones.

Matriz de presets de latencia × pack (coseno de predicciones en frío / veredicto):

| Pack | offline 30,4 s | low 1,04 s | very_low 0,64 s | ultra_low 0,32 s |
|---|---:|---:|---:|---:|
| FP32 | 1,000 / pasa | 1,000 / pasa | 1,000 / pasa | 1,000 / pasa |
| FP16 | 1,000 / pasa | 1,000 / pasa | 1,000 / pasa | 1,000 / pasa |
| INT8 | 0,992 / pasa | 0,987 / pasa | 0,972 / blando* | 0,969 / blando* |

\* INT8 mantuvo el 100 % de acuerdo umbralizado en el fixture, pero el coseno cayó por debajo del umbral de 0,98 fijado para publicación. Se recomienda FP16 (o INT8 solo con offline/low_latency) cuando se apunte a latencias de búfer ≤0,64 s.

No se han publicado resultados de benchmarks de precisión de diarización (DER, JER) en la información disponible.

## Requisitos de hardware

- Tamaño de los packs: FP32 382 MB, FP16 201 MB, INT8 107 MB. El repositorio completo ocupa 0,7 GB.
- Inferencia en CPU mediante ONNX Runtime; no se especifican requisitos de VRAM porque el modelo está orientado a ejecución en CPU y dispositivos móviles.
- GPU recomendadas: no disponible. El autor no documenta despliegue en GPU; las tablas publicadas son siempre CPU.
- Cabe en dispositivos móviles de gama alta (variantes FP16 e INT8) y en hardware de borde sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU), CoreML para comprobaciones locales de velocidad, y el SDK `react-native-sherpa-onnx` para Android e iOS.
- Latencia y throughput: no se publican cifras absolutas de latencia o throughput; solo se documentan los presets de geometría de streaming (offline 30,4 s, low 1,04 s, very_low 0,64 s, ultra_low 0,32 s).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio modelo base `nvidia/Nemotron-3-Diarization` sería la referencia natural, pero no se incluyen sus especificaciones (parámetros, contexto, precisión de diarización) en esta fuente. Otras alternativas del ecosistema de diarización (por ejemplo, pyannote o NeMo Sortformer en formato nativo) no se detallan en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Diarization-ONNX (este) | no disponible | ventana de streaming 0,32-30,4 s | OpenMDW-1.1 | ONNX | Hugging Face |
| nvidia/Nemotron-3-Diarization | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de diarización | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La información sobre el modelo base (datos de entrenamiento, sesgos, idiomas, precisión de diarización) no está disponible en esta fuente; cualquier evaluación de calidad debe hacerse contra el modelo original de NVIDIA.
- El modelo está diseñado exclusivamente para diarización de hablantes; no genera texto ni realiza otras tareas.
- Límite de 8 hablantes simultáneos; no se documenta comportamiento con más hablantes.
- La cuantización Q4F16 está explícitamente rechazada por el autor: no debe distribuirse, ya que el coseno de predicciones cae a ~0,66 / ~0,51.
- Con INT8 y presets de latencia muy baja (≤0,64 s), el coseno de predicciones cae por debajo del umbral de publicación de 0,98; se recomienda FP16 en esos casos.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; los pesos son de NVIDIA y esta distribución conserva el texto de licencia original cuando está disponible.
- Las métricas de paridad se midieron sobre un fixture sintético y goldens FP32; no sustituyen a una evaluación de precisión sobre corpus reales.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos o negativos en la asignación de hablantes, especialmente en audio con solapamientos o ruido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/XDcobra/Nemotron-3-Diarization-ONNX
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- SDK React Native: https://github.com/XDcobra/react-native-sherpa-onnx
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- VoiceLab en Google Play: https://play.google.com/store/apps/details?id=com.xdcobra.voicelab
- VoiceLab en App Store: https://apps.apple.com/us/app/voice-lab-stt-tts-more/id6761100598
- Página de producto VoiceLab: https://xdcobra.github.io/voice-lab-offline-tools/
