# Thuul/parakeet-ultra-onnx

## Resumen

Parakeet Ultra (ONNX) es una conversión a formato ONNX del modelo de reconocimiento automático del habla (ASR) Moondream Parakeet Ultra, publicada por el usuario Thuul. El modelo original, desarrollado por Moondream, es un post-entrenamiento de NVIDIA Parakeet TDT 0.6b v3, un sistema ASR basado en arquitectura FastConformer con decodificador TDT (token-and-duration transducer). Esta versión ONNX mantiene los pesos sin modificar salvo la conversión de precisión declarada, y su objetivo es facilitar el despliegue en entornos de inferencia ligeros como onnxruntime o sherpa-onnx sin necesidad de PyTorch ni NeMo.

El modelo resuelve el problema de la transcripción automática de voz multilingüe (alemán, inglés, francés, italiano y alemán suizo) con un tamaño compacto de aproximadamente 0,6 mil millones de parámetros y una ventana de contexto de audio de hasta 2.401 segundos en la muestra de evaluación. Su relevancia actual radica en que ofrece una alternativa de despliegue en producción con cuantización int8 y fp16, reduciendo requisitos de memoria y permitiendo ejecución en CPU, algo crítico para aplicaciones de ASR en tiempo real o en dispositivos con recursos limitados.

La ficha se centra en la versión ONNX distribuida por Thuul, que incluye dos layouts de exportación: uno compatible con NeMo (parakeet.js, onnx-asr) y otro específico para sherpa-onnx. No se incluye el encoder en float32 original (2,4 GB), y se omite la rama VAD (vad_head) del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT (token-and-duration transducer) decoder |
| Parametros totales | no disponible (modelo base ~0,6B según nomenclatura de NVIDIA Parakeet TDT 0.6b v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada variable; muestra de evaluación de hasta 2.401 s) |
| Tipos de cuantizacion | fp16 (encoder), int8 dinámico QUInt8 (encoder y decoder_joint), float32 (decoder_joint) |
| Idiomas soportados | no disponible en la model card; evaluación con alemán suizo, alemán, inglés, francés e italiano |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.fp16.onnx, encoder-model.int8.onnx, decoder_joint-model.onnx, decoder_joint-model.int8.onnx; sherpa-onnx: encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) |

## Arquitectura y entrenamiento

El modelo es un FastConformer con decodificador TDT, la misma arquitectura y tokenizador que NVIDIA Parakeet TDT 0.6b v3. El encoder procesa características log-mel de 128 dimensiones a 16 kHz con un factor de submuestreo de 8x, produciendo salidas de 1024 dimensiones por frame. El decodificador TDT emite tokens de un vocabulario SentencePiece de 8.192 tokens más un token blank (id 8192), con duraciones discretas de 0 a 4. La exportación ONNX incluye únicamente la rama transducer; los pesos del `vad_head` del checkpoint original no están incluidos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el post-entrenamiento de Moondream Parakeet Ultra. La model card indica que los pesos son idénticos al modelo original salvo la conversión de precisión. La innovación técnica destacable es la decodificación TDT con límite de tokens por frame: tras 10 tokens en el mismo frame, se avanza al menos un frame (equivalente a `max_symbols_per_step = 10` del modelo original) para evitar bucles de decodificación.

## Capacidades

- Reconocimiento automático del habla (ASR) en varios idiomas, con evaluación específica en alemán suizo, alemán, inglés, francés e italiano.
- Transcripción de audio con arquitectura transducer TDT, que combina predicción de tokens y duraciones.
- Procesamiento de audio de entrada variable con características log-mel de 128 dimensiones a 16 kHz.
- Exportación ONNX optimizada para inferencia en CPU mediante onnxruntime y sherpa-onnx.
- Soporte de cuantización int8 dinámica para reducir huella de memoria y acelerar inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- No se documenta un modo "thinking" ni capacidades multimodales.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar audio de hasta 2.401 segundos en la muestra de evaluación, lo que permite transcribir reuniones largas en una sola pasada con onnxruntime en CPU, sin necesidad de GPU.
- Subtitulado automático multilingüe: con soporte para alemán, inglés, francés, italiano y alemán suizo, se puede integrar en pipelines de generación de subtítulos para vídeo, usando la versión int8 para despliegue en servidores sin acelerador.
- Atención al cliente por voz: la transcripción en tiempo real con sherpa-onnx permite alimentar sistemas de análisis de llamadas o asistentes conversacionales, aprovechando la cuantización int8 para reducir latencia en CPU.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grabaciones para indexación y búsqueda semántica, usando el layout NeMo con encoder fp16 para mayor fidelidad (9,17% WER en la muestra de evaluación).
- Aplicaciones de accesibilidad: generación de transcripciones en vivo para personas con discapacidad auditiva, desplegando el modelo int8 en dispositivos de borde o mini-PC con CPU.
- Investigación en ASR multilingüe: el modelo sirve como base para experimentos de adaptación o evaluación de técnicas de cuantización, dado que la model card proporciona comparativas detalladas de WER entre precisiones y runtimes.
- Integración en pipelines de CI/CD para verificación de transcripciones: el formato ONNX y la API de sherpa-onnx permiten automatizar pruebas de regresión de ASR en entornos de integración continua sin dependencias de PyTorch.

## Benchmarks y rendimiento

La model card proporciona una comparación de WER sobre una muestra de desarrollo multilingüe de 200 clips (40 de alemán suizo, alemán, inglés, francés e italiano; 2.401 s de audio), comparando cada exportación ONNX con las transcripciones del modelo PyTorch original. No son resultados de benchmarks estándar, sino de esta muestra específica.

| Runtime | Archivos | Idénticos a PyTorch | WER export | WER PyTorch |
|---|---|---|---|---|
| onnxruntime (CPU) | encoder fp16 + decoder_joint fp32 | 193 / 200 | 9,17% | 9,11% |
| onnxruntime (CPU) | encoder int8 + decoder_joint fp32 | 157 / 200 | 9,38% | 9,11% |
| onnxruntime (CPU) | encoder fp16 + decoder_joint int8 | 155 / 200 | 9,40% | 9,11% |
| sherpa-onnx (CPU) | sherpa-onnx int8 | 152 / 200 | 9,51% | 9,11% |
| sherpa-onnx (CPU) | exportación float32 (no incluida) | 153 / 200 | 9,24% | 9,11% |

WER por idioma para los archivos int8 de sherpa-onnx (sherpa-onnx / PyTorch): alemán suizo 23,34 / 22,63; alemán 7,28 / 6,90; inglés 5,68 / 5,43; francés 3,82 / 3,50; italiano 1,98 / 1,77. Las filas de sherpa-onnx incluyen diferencias en la extracción de características entre sherpa-onnx y el procesador de Transformers.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el encoder fp16 ocupa aproximadamente 1,2 GB (la mitad de los 2,4 GB del float32 no incluido) y el int8 alrededor de 0,6 GB, según el tamaño del repositorio de 2,8 GB que incluye todos los archivos.
- GPU recomendadas: no se especifican; el modelo está orientado a inferencia en CPU mediante onnxruntime y sherpa-onnx.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM para la versión fp16, aunque no se documenta oficialmente.
- Opciones de despliegue: onnxruntime (CPU), sherpa-onnx (CPU), parakeet.js, onnx-asr.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (muestra) | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet Ultra (ONNX, este) | ~0,6B (según base) | audio variable | 9,17%–9,51% | CC BY 4.0 | ONNX |
| NVIDIA Parakeet TDT 0.6b v3 | ~0,6B | audio variable | no disponible en esta ficha | CC BY 4.0 | NeMo/PyTorch |
| Moondream Parakeet Ultra | no disponible | audio variable | 9,11% (referencia PyTorch) | CC BY 4.0 | PyTorch |

No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- El WER en alemán suizo es notablemente alto (23,34% en sherpa-onnx int8), lo que limita su uso en ese dialecto sin ajuste fino.
- La cuantización int8 reduce la fidelidad: solo 152–157 de 200 clips son idénticos al modelo PyTorch, frente a 193 con fp16.
- No se incluye el encoder float32 (2,4 GB) ni los pesos del `vad_head`, por lo que no hay detección de actividad de voz integrada.
- La decodificación TDT requiere limitar los tokens por frame (máximo 10) para evitar bucles; sin esta restricción el decodificador puede quedar atascado.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, aunque al ser un modelo ASR la alucinación se manifiesta como transcripciones incorrectas o inventadas en audio ruidoso.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar a Moondream, NVIDIA y Thuul según corresponda.
- No se especifican los idiomas oficialmente soportados más allá de la muestra de evaluación; el rendimiento en otros idiomas es desconocido.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Thuul/parakeet-ultra-onnx
- Modelo base Moondream Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- NVIDIA Parakeet TDT 0.6b v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio sherpa-onnx (referencia de despliegue): no disponible en la información proporcionada
- Repositorio onnxruntime: no disponible en la información proporcionada
