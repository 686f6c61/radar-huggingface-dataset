# tryambientai/parakeet-ctc-0.6b-gguf

## Resumen

Parakeet CTC 0.6B es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai. Se trata de una variante XL de la arquitectura FastConformer CTC, con aproximadamente 600 millones de parámetros (608.848.897 exactamente), diseñada para transcripción offline de audio en inglés con decodificación CTC voraz. El repositorio aquí descrito es una conversión a formato GGUF realizada por tryambientai para su uso con el runtime transcribe.cpp, derivada del checkpoint original nvidia/parakeet-ctc-0.6b.

El modelo resuelve el problema de la transcripción de voz a texto de forma eficiente y ligera: con solo 0,6B de parámetros y cuantizaciones que van desde 469 MB (Q4_K_M) hasta 2,44 GB (F32), es desplegable en hardware de consumo, incluidas CPU y GPUs integradas. Su salida es texto en minúsculas, sin puntuación, lo que lo hace adecuado para pipelines que posteriormente aplican normalización o puntuación externa.

Su relevancia actual radica en la combinación de precisión competitiva (1,87% de WER en LibriSpeech test-clean, idéntico al reportado por NVIDIA) con un coste computacional muy bajo y una licencia permisiva CC-BY-4.0. No es un modelo de streaming ni traduce, y solo soporta inglés, lo que acota claramente su ámbito de aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Large con cabeza CTC lineal (Conformer CTC) |
| Parametros totales | 608.848.897 (≈0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR, procesa audio; sin ventana de tokens declarada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en NeMo/.nemo y compatible con Transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer, una variante del Conformer con atención por bloques que reduce el coste computacional manteniendo la capacidad de modelar dependencias locales y globales en el audio. Sobre el encoder se sitúa una cabeza CTC lineal que produce directamente la secuencia de tokens con decodificación voraz (greedy CTC), sin decodificador autorregresivo ni modelo de lenguaje externo. Esta simplicidad es la que explica su baja latencia y su reducido consumo de recursos en comparación con modelos seq2seq.

El modelo fue entrenado por NVIDIA NeMo y Suno.ai; la model card original no detalla en la información disponible el número exacto de horas de audio, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (procedimientos poco habituales en ASR). La conversión GGUF se realizó a partir del commit upstream ad09ba1 (fijado el 2026-05-10) y se validó numéricamente contra la referencia NeMo en el commit 42528dd de transcribe.cpp el 2026-05-10. La innovación técnica destacable es la propia cuantización GGUF con pérdida mínima de precisión: Q6_K incluso mejora ligeramente el WER respecto a F32 (1,84% frente a 1,87%).

## Capacidades

- Transcripción de voz a texto en inglés, offline, con salida en minúsculas y sin puntuación.
- Decodificación CTC voraz (greedy), sin modelo de lenguaje externo ni beam search.
- Generación de marcas de tiempo a nivel de token (timestamps: token).
- Ejecución en CPU y GPU mediante transcribe.cpp, con soporte de backend Metal (Apple Silicon) y Vulkan.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No realiza detección de idioma (lang_detect: false).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- Sin capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte grabaciones de audio en texto plano en inglés con un WER de en torno al 1,9% en condiciones limpias, adecuado para generar actas que luego se procesan con un LLM para puntuación y resumen.
- Subtitulado automático offline: gracias a las marcas de tiempo a nivel de token, puede generar alineaciones temporales para subtítulos en inglés sin depender de servicios en la nube.
- Procesamiento por lotes en servidores sin GPU: con la cuantización Q4_K_M (469 MB) y un factor de tiempo real (RTF) de 10 sobre CPU Ryzen 4750U, permite transcribir grandes volúmenes de audio en infraestructura modesta.
- Aplicaciones de escritorio y edge computing: su tamaño reducido (desde 469 MB) y su ejecución en CPU con Metal o Vulkan lo hacen viable en portátiles y dispositivos con GPU integrada, como demuestra el RTF de 218,5 con Metal en un chip M4 Max.
- Preprocesado para pipelines de NLP: la transcripción en minúsculas y sin puntuación sirve como entrada directa a modelos de lenguaje que aplican normalización, puntuación y análisis posterior.
- Investigación y evaluación de ASR: al ser una conversión fiel del checkpoint de NVIDIA validada numéricamente, sirve como referencia reproducible para comparar cuantizaciones GGUF y runtimes alternativos.
- Transcripción de audiolibros y pódcasts en inglés: el modelo está optimizado para voz limpia y lectura, el dominio de LibriSpeech, donde alcanza su mejor WER.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,87 | 1,87 | 1,87 | 1,84 | 1,87 | 1,90 |
| Tamano (GB) | 2,44 | 1,22 | 0,722 | 0,594 | 0,533 | 0,469 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación CTC voraz y sin modelo de lenguaje externo. La referencia F32 es 1,87%, coincidente con el valor auto-reportado por NVIDIA en el mismo split.

Rendimiento (factor de tiempo real, RTF; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 218,5 |
| Apple M4 Max | CPU | 30,5 |
| AMD Ryzen 4750U | Vulkan | 22,5 |
| AMD Ryzen 4750U | CPU | 10,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~0,5 GB (Q4_K_M) hasta ~2,5 GB (F32); el modelo es lo suficientemente pequeño para ejecutarse íntegramente en memoria de GPU de gama baja o incluso en RAM de CPU.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon, validado en M4 Max) o Vulkan (validado en AMD Ryzen 4750U con GPU integrada); GPUs dedicadas como RTX 4090 o A100 no son necesarias pero funcionarían sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 3 GB de VRAM en F32 y menos de 1 GB en cuantizaciones bajas; también funciona en CPU pura.
- Opciones de despliegue: transcribe.cpp (runtime nativo para GGUF, con CLI `transcribe-cli`); el modelo original es compatible con NVIDIA NeMo y con Transformers de HuggingFace.
- Latencia y throughput: RTF de 218,5 en Metal (M4 Max), 30,5 en CPU (M4 Max), 22,5 en Vulkan (Ryzen 4750U) y 10,0 en CPU (Ryzen 4750U); es decir, en el peor caso validado procesa audio 10 veces más rápido que tiempo real.
- Requisito de entrada: audio WAV mono a 16 kHz (convertible con ffmpeg desde otros formatos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| parakeet-ctc-0.6b (este) | 0,6B | offline, sin streaming | 1,87% | CC-BY-4.0 | GGUF, NeMo, Transformers |
| nvidia/parakeet-ctc-0.6b (original) | 0,6B | offline, sin streaming | 1,87% | CC-BY-4.0 | NeMo, Transformers |
| Whisper large-v3 | ~1,55B | 30 s por ventana, streaming por chunks | no disponible en esta informacion | MIT | safetensors, GGUF, etc. |
| Whisper small | ~244M | 30 s por ventana | no disponible en esta informacion | MIT | safetensors, GGUF, etc. |

La comparación con Whisper se ofrece a título orientativo por categoría (ASR inglés); no se dispone en la información proporcionada de cifras de WER comparables para Whisper en el mismo split y condiciones, por lo que no se incluyen números que no estén verificados. Frente al checkpoint original de NVIDIA, esta conversión GGUF mantiene el mismo WER y añade cuantizaciones que reducen el tamaño hasta un 80% con pérdida despreciable.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas ni detección de idioma.
- Salida en minúsculas y sin puntuación: requiere postprocesado si se necesita texto formateado.
- No es streaming: debe procesar el audio completo (o segmentos) de forma offline.
- No traduce: únicamente transcribe en el idioma de entrada.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados, solapamiento de hablantes o dominios alejados de LibriSpeech; el WER de 1,87% corresponde a condiciones limpias de lectura.
- Sin modelo de lenguaje externo: la decodificación voraz puede producir errores ortográficos o palabras fuera de vocabulario en casos ambiguos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y Suno.ai y conservar el aviso de licencia.
- La conversión GGUF está vinculada a transcribe.cpp y a commits concretos del upstream; cambios en el runtime pueden requerir revalidación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema reducido y poca validación comunitaria independiente.
- No apto para tareas de razonamiento, generación de texto libre, código o agentes: es exclusivamente un modelo ASR.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/tryambientai/parakeet-ctc-0.6b-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Commit upstream del checkpoint: https://huggingface.co/nvidia/parakeet-ctc-0.6b/commit/ad09ba1
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ctc-0.6b.md
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Suno.ai: https://www.suno.ai/
- Repositorio de Transformers: https://github.com/huggingface/transformers
