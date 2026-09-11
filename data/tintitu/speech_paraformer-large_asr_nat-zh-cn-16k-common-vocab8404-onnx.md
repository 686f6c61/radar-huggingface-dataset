# tintitu/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-onnx

## Resumen

Paraformer-Large ASR (NAT-ZH-CN-16k-Common-Vocab8404) es un modelo de reconocimiento automático del habla (ASR) en modo offline para chino mandarín. El modelo original fue desarrollado por el Alibaba DAMO Academy / Tongyi Lab dentro del proyecto FunASR, y la ficha que nos ocupa corresponde a una reexportación a formato ONNX con cuantización INT8 publicada por el usuario `tintitu` en HuggingFace, que no es el autor original de los pesos.

La arquitectura es un Transformer no autorregresivo (Non-Autoregressive Transformer, NAT): en lugar de generar los tokens de texto uno a uno como un modelo encoder-decoder clásico, emite la secuencia completa de manera paralela. Esto reduce drásticamente el coste de decodificación y explica su factor de tiempo real (RTF) bajo sobre CPU. El modelo trabaja con un vocabulario de 8.404 caracteres y tokens especiales, y espera audio a 16 kHz en mono (16-bit PCM o float normalizado), del que extrae características Fbank de 80 dimensiones normalizadas con CMVN.

Su relevancia práctica está en el despliegue en el borde y en servidores sin GPU: con un peso de 0,4 GB y un consumo de RAM en el entorno de 450-750 MB, se puede ejecutar en máquinas modestas o incluso en dispositivos integrados con motores como ONNX Runtime o sherpa-onnx. Está pensado exclusivamente para transcripción de voz, no es un modelo de lenguaje y no admite otro tipo de tareas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (NAT), extremo a extremo |
| Parámetros totales | No disponible (el fichero de pesos INT8 `model_quant.onnx` ocupa 238.380.216 bytes; estimación orientativa de ~2,4 x 10^8 parámetros a partir del tamaño del fichero, no confirmada por el autor) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo ASR por segmento de audio, no acepta contexto de texto) |
| Tipos de cuantización | INT8 estática (`model_quant.onnx`) |
| Idiomas soportados | Chino mandarín (zh-cn) |
| Licencia | Apache-2.0 / licencia comunitaria de ModelScope, según la model card; el campo de licencia del repositorio de HuggingFace figura como no disponible |
| Formato de pesos | ONNX (INT8), con ficheros auxiliares `tokens.json`, `config.yaml` y `am.mvn` |
| Vocabulario | 8.404 tokens (caracteres chinos y tokens especiales) |
| Muestreo de entrada | 16.000 Hz, mono, 16-bit PCM o float en [-1,0, 1,0] |
| Extracción de características | Fbank de 80 dimensiones con normalización CMVN (`am.mvn`) |
| Tamaño del repositorio | 0,4 GB |
| Motores de inferencia compatibles | ONNX Runtime, sherpa-onnx, FunASR Runtime |

## Arquitectura y entrenamiento

El modelo es una red Transformer no autorregresiva (NAT) orientada a ASR. A diferencia de los esquemas clásicos de tipo encoder-decoder autorregresivo, la decodificación NAT predice todos los tokens de la transcripción de forma paralela, lo que elimina la dependencia secuencial entre pasos y permite aprovechar mejor el paralelismo de CPU. La variante distribuida aquí es la versión "large" del modelo Paraformer, exportada a ONNX y cuantizada estáticamente a INT8, lo que reduce el tamaño de los pesos y acelera la inferencia en CPU a costa de una posible pérdida menor de precisión respecto al checkpoint original en punto flotante.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste con RLHF/DPO u otras técnicas de alineación. Tampoco se documentan innovaciones internas adicionales más allá de la naturaleza no autorregresiva del decodificador. La model card sí indica que la salida es texto plano sin puntuación, por lo que el pipeline recomendado incluye un modelo de restauración de puntuación posterior.

## Capacidades

- Reconocimiento de voz offline (transcripción de audio pregrabado o en streaming por segmentos) en chino mandarín.
- Salida de texto sin puntuación, que hay que completar con un modelo posterior de restauración de puntuación.
- Procesamiento eficiente en CPU gracias a la decodificación no autorregresiva (RTF de 0,08-0,15 en 8 núcleos).
- Integración con detección de actividad de voz (VAD) para segmentar audio largo y descartar silencios.
- Ejecución mediante ONNX Runtime, sherpa-onnx o FunASR Runtime.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo de razonamiento explícito (thinking mode).
- No procesa imágenes, vídeo ni audio; es un modelo unimodal de voz a texto.
- Multilingüismo: únicamente chino mandarín según la model card; no se declaran otros idiomas.

## Casos de uso

- Transcripción de reuniones y actas en chino: al ser un modelo de ASR offline con bajo consumo de recursos, se puede desplegar en el servidor interno de una empresa para transcribir grabaciones de audio y volcar el texto a un sistema de gestión documental, encadenando después un modelo de puntuación.
- Subtitulado automático de vídeo en mandarín: el modelo genera la transcripción de la pista de audio y, con marcas de tiempo derivadas del VAD previo, se pueden construir subtítulos para plataformas de vídeo o contenido formativo.
- Atención al cliente con análisis de llamadas: transcripción por lotes de grabaciones de call center para alimentar sistemas de análisis de sentimiento, búsqueda de palabras clave o control de calidad, sin necesidad de GPU dedicada.
- Indexación y búsqueda de archivos de audio: convertir grandes volúmenes de notas de voz o podcasts en texto indexable, de modo que se puedan buscar por palabra clave en un motor de búsqueda interno.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real de conversaciones o clases en mandarín, aprovechando el RTF inferior a 1 sobre CPU convencional.
- Despliegue en dispositivos de borde o sin conexión: al caber en menos de 1 GB de RAM y funcionar sin GPU, es viable integrarlo en un mini-PC, un dispositivo industrial o una aplicación de escritorio que transcriba localmente sin enviar audio a la nube, lo que ayuda a cumplir requisitos de privacidad.
- Asistente de voz para aplicaciones móviles o kioscos: uso como primer eslabón de una cadena de voz a texto en chino, seguido de un modelo de lenguaje que interprete la intención del usuario, siempre que el resto del sistema aporte la comprensión semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas operativas de rendimiento en CPU:

| Métrica | Valor declarado |
|---|---|
| RTF en CPU de 8 núcleos | 0,08-0,15 |
| Tiempo para procesar 10 s de audio | 0,8-1,5 s |
| RAM en reposo | ~400 MB |
| RAM en pico durante decodificación | ~650 MB |
| RAM total recomendada | 4 GB o más |
| Núcleos de CPU recomendados | 2 o más |

No hay datos de WER, CER, MMLU ni de ningún otro benchmark estándar de ASR en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para ejecutarse en CPU. En GPU requeriría adaptar el grafo ONNX con un proveedor de ejecución compatible, algo no documentado.
- GPU recomendadas: no disponibles; el autor documenta exclusivamente el despliegue en CPU.
- ¿Cabe en GPU de consumo? No se documenta soporte GPU. En su formato actual está pensado para CPU.
- CPU mínima: 2 núcleos y 4 GB de RAM según la model card; el rendimiento declarado (RTF 0,08-0,15) se mide en 8 núcleos.
- RAM: entre 450 MB y 750 MB de consumo, con una base residente de unos 400 MB y un pico de unos 650 MB durante la decodificación.
- Opciones de despliegue: ONNX Runtime, sherpa-onnx y FunASR Runtime, según la model card.
- Latencia y throughput: RTF de 0,08-0,15 en 8 núcleos, es decir, entre 6,7 y 12,5 veces más rápido que el tiempo real. Para 10 segundos de audio, entre 0,8 y 1,5 segundos de cómputo.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que la comparación se limita a características estructurales conocidas. Los datos de las alternativas no provienen de la información proporcionada y deben verificarse antes de tomar decisiones.

| Modelo | Arquitectura | Idiomas | Licencia | Formato desplegado aquí |
|---|---|---|---|---|
| Paraformer-Large ASR ONNX (esta ficha) | Transformer no autorregresivo | Chino mandarín | Apache-2.0 / ModelScope | ONNX INT8 |
| Whisper (OpenAI) | Encoder-decoder autorregresivo | Multilingüe | MIT | No disponible |
| FunASR SenseVoice | No disponible | Multilingüe asiático | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo unimodal de voz a texto: no genera texto libre, no razona sobre lenguaje natural y no admite instrucciones en lenguaje natural.
- Idioma restringido al chino mandarín; no se declara soporte para cantonés, inglés ni otras lenguas.
- La salida carece de puntuación, lo que obliga a añadir un modelo posterior de restauración si se necesita texto legible.
- Requiere audio a 16 kHz en mono; entradas con otro muestreo o con múltiples canales deben remuestrearse y convertirse antes de la inferencia.
- No hay información sobre sesgos acústicos, rendimiento con acentos regionales, ruido de fondo, solapamiento de hablantes ni vocabulario técnico específico.
- Riesgo de alucinación y de errores de transcripción inherente a cualquier sistema ASR, especialmente en audio ruidoso o con habla solapada. No se documentan tasas de error.
- Licencia: la model card indica Apache-2.0 y la licencia comunitaria de ModelScope, pero el campo de licencia del repositorio de HuggingFace figura como no disponible. Conviene verificar los términos exactos antes de un uso comercial o de redistribuir los pesos, y conservar los avisos de copyright y los enlaces al proyecto original.
- Este repositorio es una reexportación de terceros (`tintitu`) y no la distribución oficial; se recomienda contrastar los pesos con el repositorio de ModelScope y verificar los SHA-256 que incluye la model card.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el 11 de septiembre de 2026 según los metadatos.
- No se documenta soporte para GPU ni para procesamiento en streaming continuo nativo; el flujo recomendado es por segmentos con un VAD previo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tintitu/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-onnx
- Proyecto upstream FunASR: https://github.com/alibaba-damo-academy/FunASR
- Repositorio oficial en ModelScope: https://modelscope.cn/models/damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-onnx
- Modelo de detección de actividad de voz recomendado: `speech_fsmn_vad_zh-cn-16k-common-onnx`
- Modelo de restauración de puntuación recomendado: `punc_ct-transformer_zh-cn-common-vocab272727-onnx`
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a cadenas hoteleras en Sídney); no se han encontrado enlaces adicionales relevantes sobre el modelo en la información disponible.
