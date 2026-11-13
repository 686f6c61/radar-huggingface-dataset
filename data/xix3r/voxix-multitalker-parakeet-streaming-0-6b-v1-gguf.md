# xix3r/voxix-multitalker-parakeet-streaming-0.6b-v1-gguf

## Resumen

El modelo `voxix-multitalker-parakeet-streaming-0.6b-v1-gguf` es una conversión a formato GGUF del checkpoint `nvidia/multitalker-parakeet-streaming-0.6b-v1`, publicada por el usuario xix3r para su uso con la librería `transcribe.cpp`. Se trata de un sistema de reconocimiento automático del habla (ASR) en inglés, con arquitectura FastConformer-Transformer y decodificador RNN-T, disenado especificamente para transcripcion en streaming con atención cache-aware. El modelo base fue desarrollado por NVIDIA y consta de aproximadamente 600 millones de parametros.

La conversión permite ejecutar el modelo en hardware de consumo y en CPU mediante cuantizacion GGUF, algo que el checkpoint original en formato NeMo (`.nemo`) no facilita directamente. El port mantiene la ruta de inferencia `single_speaker_mode`, es decir, produce una transcripcion plana sin atribucion de hablante, aunque el modelo upstream es un checkpoint multitalker que incorpora mecanismos de diarizacion externa.

Su relevancia actual radica en la combinacion de tamano reducido (0.6B), latencia controlada mediante cuatro configuraciones de lookahead, soporte de streaming real y una calidad de transcripcion muy alta en LibriSpeech test-clean (WER del 2.18-2.20% segun la cuantizacion). Todo ello con licencia NVIDIA Open Model License, que permite uso comercial bajo determinadas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transformer con decodificador RNN-T (transducer) |
| Parametros totales | ~600M (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | atención cache-aware con `att_context_size=[70, 13]` (ventana de 1.12 s); sin limite de contexto textual (modelo ASR) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (`en`) |
| Licencia | NVIDIA Open Model License (heredada del modelo base) |
| Formato de pesos | GGUF (para `transcribe.cpp`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer-Transformer, un encoder convolucional-aumentado de tipo Conformer optimizado para velocidad, combinado con un decodificador RNN-T (transducer). El checkpoint base fue fine-tuneado a partir de `nvidia/nemotron-speech-streaming-en-0.6b`, y su caracteristica distintiva es la atención cache-aware con una mascara que preserva `att_context_size=[70, 13]`, lo que permite decodificacion en streaming con un lookahead configurable (cuatro ajustes de latencia seleccionables). El modelo upstream es multitalker: recibe las salidas de diarizacion de un Sortformer externo como informacion adicional, eliminando la necesidad de embeddings de hablante o audio de enrollment.

En cuanto a datos de entrenamiento, numero de tokens o composicion del dataset, no se dispone de esa informacion en la documentacion proporcionada; la model card upstream no detalla el corpus. El port a GGUF fue validado numericamente contra la referencia NeMo en el commit `c55a09d` de `transcribe.cpp` (fecha 2026-07-12), y el modelo upstream fue fijado en el commit `8749fc7`. La innovacion tecnica destacable es precisamente el soporte de streaming cache-aware con lookahead ajustable, poco habitual en modelos ASR de este tamano empaquetados para inferencia local.

## Capacidades

- Transcripcion de voz a texto en inglés con puntuacion y capitalizacion automaticas (PnC).
- Modo offline (transcripcion completa de un fichero de audio) y modo streaming cache-aware con lookahead configurable.
- Cuatro ajustes de latencia de lookahead seleccionables, heredados del encoder upstream.
- Marcas de tiempo a nivel de token (`timestamps: token`).
- Entrada de audio a 16 kHz mono WAV (requiere conversion previa con ffmpeg si el audio no esta en ese formato).
- Inferencia en CPU y GPU mediante `transcribe.cpp`, con backend Metal y Vulkan ademas de CPU.
- No soporta traduccion (`translate: false`).
- No soporta deteccion de idioma (`lang_detect: false`).
- No incluye atribucion de hablante en este port: la maquinaria multitalker (diarizacion Sortformer externa, instancias por hablante, salida SegLST con etiquetas de hablante) no esta portada; se produce una transcripcion plana unica.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje generativo general).

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo puede procesar ficheros WAV a 16 kHz mono en CPU o GPU de consumo, generando transcripciones con puntuacion y capitalizacion sin depender de servicios en la nube; adecuado para entornos con requisitos de privacidad.
- Subtitulado y transcripcion en tiempo real de audio en directo: gracias al modo streaming cache-aware con lookahead configurable, puede alimentarse con fragmentos de audio continuos y emitir texto con latencia controlada, util para streaming de eventos o videollamadas.
- Integracion en aplicaciones de escritorio y moviles: el tamano reducido del GGUF Q4_K_M (478 MB) permite empaquetar el modelo en aplicaciones cliente con backend CPU, sin necesidad de GPU dedicada.
- Pipelines de accesibilidad: generacion de subtitulos automaticos para contenido audiovisual en ingles, con marcas de tiempo a nivel de token que facilitan la sincronizacion con el video.
- Procesamiento por lotes de archivos de audio: la velocidad de inferencia (RTF de 178.3 en Metal sobre M4 Max y 34.6 en CPU) permite transcribir grandes volumenes de grabaciones en estaciones de trabajo convencionales.
- Transcripcion en servidores sin GPU: el backend CPU con RTF de 13 sobre Ryzen 4750U hace viable el despliegue en servidores modestos o entornos contenedorizados sin acelerador.
- Investigacion y evaluacion de ASR: sirve como referencia ligera para comparar tecnicas de cuantizacion (F32 a Q4_K_M) con impacto minimo en WER, util en estudios de eficiencia de modelos de reconocimiento de voz.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean completo (2620 enunciados), en `single_speaker_mode` con decodificacion RNN-T greedy y normalizador whisper (puntuacion y capitalizacion eliminadas para el scoring):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2.49 GB | 2.19% |
| F16 | 1.25 GB | 2.19% |
| Q8_0 | 734 MB | 2.18% |
| Q6_K | 604 MB | 2.20% |
| Q5_K_M | 542 MB | 2.18% |
| Q4_K_M | 478 MB | 2.18% |

Referencia: la medicion NeMo en `single_speaker_mode` y el dato autoinformado por NVIDIA sobre el mismo split son ambos 2.19%. El port GGUF reproduce practicamente ese valor en todas las cuantizaciones, con variaciones de +-0.01 puntos porcentuales.

Rendimiento de velocidad (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 178.3 |
| Apple M4 Max | CPU | 34.6 |
| AMD Ryzen 4750U | CPU | 13 |
| AMD Ryzen 4750U | Vulkan | 25 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5 GB en Q4_K_M, 0.6 GB en Q6_K, 0.7 GB en Q8_0, 1.25 GB en F16 y 2.5 GB en F32. Cabe en cualquier GPU con al menos 1-2 GB de memoria libre.
- GPU recomendadas: cualquier GPU moderna con soporte Metal (Apple Silicon M-series) o Vulkan (AMD, Intel, NVIDIA). En el caso de NVIDIA, tarjetas desde una GTX 1650 o superior son suficientes; tambien funciona en A100, H100 y RTX 4090 sin aprovechar su capacidad completa, dado el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, incluidas iGPU con memoria unificada. En CPU pura funciona con un consumo de RAM inferior a 1 GB en cuantizaciones bajas.
- Opciones de despliegue: `transcribe.cpp` (libreria oficial del port, con CLI `transcribe-cli`), con backends CPU, Metal y Vulkan. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no es un LLM y `transcribe.cpp` es el runtime especifico.
- Latencia y throughput estimados: RTF de 178.3 en Metal sobre M4 Max (aproximadamente 178 veces mas rapido que tiempo real), 34.6 en CPU sobre M4 Max, 25 en Vulkan y 13 en CPU sobre Ryzen 4750U. En streaming, la latencia efectiva depende del lookahead seleccionado, con una ventana cache-aware de 1.12 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| voxix/multitalker-parakeet-streaming-0.6b-v1-gguf (este) | 0.6B | cache-aware 1.12 s, lookahead configurable | en | NVIDIA Open Model License | GGUF | Port sin diarizacion; WER 2.18% en LibriSpeech test-clean |
| nvidia/multitalker-parakeet-streaming-0.6b-v1 (base) | 0.6B | cache-aware 1.12 s, lookahead configurable | en | NVIDIA Open Model License | NeMo (`.nemo`) | Checkpoint multitalker original con diarizacion Sortformer externa |
| nvidia/nemotron-speech-streaming-en-0.6b | 0.6B | streaming cache-aware | en | NVIDIA Open Model License | NeMo | Modelo del que deriva el checkpoint base, sin maquinaria multitalker |
| OpenAI Whisper (referencia de la familia) | 39M a 1550M segun variante | 30 s fijos (no streaming nativo) | multilingual | MIT | safetensors, GGUF via terceros | No es streaming cache-aware; requiere ventanas de 30 s |

Los datos de rendimiento de los modelos comparados distintos del presente no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no hay soporte multilingue ni deteccion de idioma (`lang_detect: false`).
- No soporta traduccion (`translate: false`); unicamente transcribe en el idioma de origen.
- El port no incluye la funcionalidad multitalker: no separa hablantes ni produce salidas con etiquetas de hablante. Si se necesita diarizacion, hay que usar el checkpoint upstream con NeMo y un Sortformer externo.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario especializado; el WER de referencia (2.18%) corresponde a LibriSpeech test-clean, un corpus limpio de lectura, y no refleja condiciones reales.
- El modelo esta entrenado para audio a 16 kHz mono WAV; cualquier otra frecuencia o numero de canales requiere conversion previa (por ejemplo, con ffmpeg), lo que anade un paso al pipeline.
- La licencia NVIDIA Open Model License impone condiciones adicionales para uso comercial; es necesario revisar los terminos completos en el enlace oficial antes de desplegar en produccion.
- La validacion se realizo contra la referencia NeMo en un commit concreto (`c55a09d`, 2026-07-12); cambios posteriores en `transcribe.cpp` podrian alterar el comportamiento.
- El modelo no es un LLM: no soporta tool calling, agentes, razonamiento multi-paso ni generacion de codigo; su unica funcion es ASR.
- El repositorio del port registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad; conviene verificar el comportamiento en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Hugging Face del port GGUF: https://huggingface.co/xix3r/voxix-multitalker-parakeet-streaming-0.6b-v1-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1
- Commit upstream fijado: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1/commit/8749fc7
- Modelo Nemotron-Speech-Streaming del que deriva: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/c55a09d
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/multitalker-parakeet-streaming-0.6b-v1.md
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper de referencia multitalker (Wang et al., 2025): https://arxiv.org/abs/2506.22646
- Paper citado en tags (arxiv:2408.13106): https://arxiv.org/abs/2408.13106
- Paper citado en tags (arxiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper citado en tags (arxiv:2409.06656): https://arxiv.org/abs/2409.06656
- Paper citado en tags (arxiv:2507.18446): https://arxiv.org/abs/2507.18446
- Paper Transformer (arxiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper citado en tags (arxiv:2310.12371): https://arxiv.org/abs/2310.12371
