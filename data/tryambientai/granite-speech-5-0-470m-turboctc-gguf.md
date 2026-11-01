# tryambientai/granite-speech-5.0-470m-turboctc-gguf

## Resumen

Granite Speech 5.0 470M TurboCTC es un modelo de reconocimiento automático del habla (ASR) en inglés, desarrollado originalmente por IBM Research y publicado bajo licencia Apache-2.0. El repositorio que nos ocupa, `tryambientai/granite-speech-5.0-470m-turboctc-gguf`, es una conversión a formato GGUF del modelo original, realizada para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp), una implementación en C++ orientada a inferencia local y en dispositivos de borde.

El modelo resuelve el problema de la transcripción de voz a texto offline en inglés con un coste computacional muy bajo: 473 millones de parámetros, un encoder Conformer compacto y una cabeza CTC auto-condicionada que permite decodificación no autorregresiva con decodificación voraz (greedy). Esto se traduce en una latencia mínima y un rendimiento en tiempo real muy alto, adecuado para portátiles, teléfonos y hardware sin GPU dedicada.

Su relevancia actual radica en la combinación de precisión (WER del 1,33 % en LibriSpeech test-clean con cuantización Q8_0) y eficiencia: las conversiones GGUF permiten ejecutar el modelo en CPU con velocidades de hasta 46 veces tiempo real en un Apple M4 Max, manteniendo una degradación de precisión prácticamente nula respecto al modelo en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder acústico) con block self-attention, self-conditioning y downsampling temporal; cabeza CTC auto-condicionada |
| Parametros totales | 473.014.752 (473 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR de audio; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer con atención por bloques, auto-condicionamiento y reducción temporal (downsampling), seguido de una capa de salida CTC sobre un vocabulario de 16.384 unidades BPE. La inferencia es no autorregresiva mediante decodificación voraz CTC, lo que elimina la latencia asociada a la generación token a token y permite un procesamiento muy rápido incluso en CPU. El modelo base fue entrenado con aproximadamente 60.000 horas de audio en inglés procedente de corpus públicos, utilizando la función de pérdida CTC.

La conversión a GGUF para transcribe.cpp está anclada al commit `18ca3c1` del modelo original (fijado el 2026-09-12) y validada contra la referencia de transformers en el commit `b9427cf` de transcribe.cpp. El modelo no soporta streaming, traducción, detección de idioma ni marcas de tiempo (timestamps: none), según la metadata de la model card.

## Capacidades

- Transcripción de voz a texto offline en inglés a partir de audio WAV mono a 16 kHz.
- Decodificación CTC voraz no autorregresiva, sin modelo de lenguaje externo.
- Alta eficiencia computacional: velocidades de 17 a 46 veces tiempo real en CPU y de 22 a 355 veces en GPU/acceleradores (según la plataforma).
- Cuantizaciones que reducen el tamaño del modelo hasta 279 MB (Q4_K_M) manteniendo un WER de 1,35 % en LibriSpeech test-clean.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No realiza detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio WAV mono a 16 kHz y genera la transcripción sin conexión a internet, lo que lo hace adecuado para aplicaciones de privacidad estricta en portátiles y estaciones de trabajo sin GPU.
- Subtitulado automático de vídeos en inglés: al ser un modelo no streaming con decodificación voraz, se puede integrar en pipelines por lotes que segmentan el audio y transcriben cada fragmento, con una velocidad de 46× tiempo real en Apple M4 Max que permite procesar horas de contenido en minutos.
- Asistentes de voz en dispositivos de borde: con un tamaño de 279 MB en Q4_K_M y un WER de 1,35 %, cabe en teléfonos y dispositivos embebidos para comandos de voz y dictado en inglés.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo casi real de conversaciones presenciales o contenido audiovisual en inglés, ejecutándose en CPU sin necesidad de servicios en la nube.
- Análisis de llamadas de atención al cliente: procesamiento por lotes de grabaciones telefónicas en inglés para extraer transcripciones y alimentar sistemas de análisis de sentimiento o cumplimiento, con la ventaja de que el modelo es ligero y se puede desplegar en servidores modestos.
- Investigación en ASR y evaluación de técnicas de cuantización: el repositorio incluye métricas de WER por cuantización y validación numérica contra transformers, lo que lo convierte en un banco de pruebas reproducible para estudiar el impacto de la cuantización en modelos CTC.

## Benchmarks y rendimiento

Los datos disponibles en la model card del repositorio GGUF son los siguientes:

| Benchmark | Métrica | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|---|---|
| LibriSpeech test-clean (WER %) | WER | 1,34 | 1,33 | 1,33 | 1,33 | 1,34 | 1,35 |
| FLEURS en (WER %) | WER | no disponible | no disponible | 4,61 | no disponible | no disponible | no disponible |

Referencia baseline (transformers 5.17.0, F32, CPU): WER 1,33 % en LibriSpeech test-clean, IC 95 % [1,20; 1,47].

Rendimiento en tiempo real (RTF, veces tiempo real):

| Plataforma | Acelerador | RTF |
|---|---|---|
| Apple M4 Max | CPU | 46,07 |
| Apple M4 Max | Metal | 355,75 |
| AMD Ryzen 4750U | CPU | 17,24 |
| AMD Ryzen 4750U | Vulkan | 22,87 |

No se han publicado en la información disponible resultados comparativos con otros modelos en los benchmarks estándar de la Open ASR Leaderboard (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 279 MB (Q4_K_M) y 948 MB (BF16/F16), incluyendo pesos y overhead mínimo del runtime.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el modelo se ha validado en CUDA y se han medido RTF en Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan). Por su tamaño, cabe en cualquier GPU consumer con al menos 1 GB de VRAM libre (GTX 1050, RTX 3050, RTX 4090, etc.).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con soporte Vulkan o Metal.
- Opciones de despliegue: transcribe.cpp (runtime principal para el que se ha convertido el modelo); no se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI en la información disponible (son runtimes orientados a LLM, no a ASR CTC).
- Latencia y throughput: RTF de 46,07 en CPU de Apple M4 Max, 355,75 con Metal; 17,24 en CPU de Ryzen 4750U y 22,87 con Vulkan. Un RTF de 46 implica procesar 46 segundos de audio por segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/audio | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| Granite Speech 5.0 470M TurboCTC (este) | 473 M | audio offline, inglés | 1,33 % (Q8_0) | Apache-2.0 | GGUF, safetensors |
| Whisper large-v3 | ~1.550 M | audio offline, multilingüe | no disponible en la información | MIT | safetensors, GGUF (vía conversiones) |
| Whisper small | ~244 M | audio offline, multilingüe | no disponible en la información | MIT | safetensors, GGUF |
| Wav2Vec2 / HuBERT base | ~95 M | audio offline, inglés | no disponible en la información | MIT / Apache-2.0 | safetensors |

No se dispone de datos comparativos de WER ni RTF de estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y formato. El modelo destaca por su relación precisión/tamaño y por su licencia Apache-2.0 permisiva, frente a alternativas como Whisper (MIT) o Wav2Vec2 (MIT/Apache-2.0).

## Limitaciones y advertencias

- Solo soporta inglés; no es multilingüe.
- No soporta streaming: requiere audio completo o segmentado previamente.
- No genera marcas de tiempo, lo que limita su uso en subtitulado con sincronización precisa sin post-procesado.
- No realiza detección de idioma ni traducción.
- Riesgo de alucinación inherente a los modelos CTC en audio ruidoso o con acentos no representados en el corpus de entrenamiento (60.000 horas de corpus públicos en inglés).
- Sesgos potenciales derivados de la composición del corpus de entrenamiento (no detallada en la información disponible).
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda revisar la model card del modelo base para términos completos.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad; se recomienda verificar la integridad de los pesos antes de usarlo en producción.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg u otras herramientas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/tryambientai/granite-speech-5.0-470m-turboctc-gguf
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Commit del modelo base referenciado: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/commit/18ca3c1
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-5.0-470m-turboctc.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/b9427cf
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FFASR Leaderboard: https://huggingface.co/spaces/treble-technologies/ffasr
