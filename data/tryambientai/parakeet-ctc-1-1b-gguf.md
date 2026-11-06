# tryambientai/parakeet-ctc-1.1b-gguf

## Resumen

parakeet-ctc-1.1b-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-ctc-1.1b, publicada por el usuario tryambientai para su uso con transcribe.cpp, un motor de inferencia en C++ orientado a transcripción local. El modelo original fue desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, y se trata de una variante XXL de la arquitectura FastConformer con cabeza CTC lineal, con aproximadamente 1.100 millones de parámetros.

El modelo resuelve la transcripción de voz a texto en inglés de forma offline, empleando decodificación CTC voraz (greedy) sin modelo de lenguaje externo. La salida es texto en minúsculas y sin puntuación. No es un modelo de streaming, no traduce y no realiza detección de idioma, lo que lo posiciona como una pieza especializada dentro de pipelines ASR más amplios que necesiten una etapa de transcripción precisa y de bajo coste computacional.

Su relevancia actual radica en la disponibilidad de cuantizaciones GGUF que reducen el peso del modelo desde 4,25 GB en F32 hasta 818 MB en Q4_K_M, manteniendo un WER prácticamente idéntico (1,84-1,90 % en LibriSpeech test-clean). Esto permite ejecutar un modelo ASR de 1.1B parámetros en hardware de consumo, incluyendo CPU, Metal en Apple Silicon y Vulkan, con velocidades de tiempo real muy superiores a 1x según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL con cabeza CTC lineal (Conformer acelerado, encoder) |
| Parametros totales | 1.062.626.305 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la información) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en NeMo/Transformers |

## Arquitectura y entrenamiento

El modelo se basa en FastConformer, una variante optimizada del Conformer que reduce el coste computacional mediante downsampling en las capas de atención, combinada con una cabeza CTC (Connectionist Temporal Classification) lineal sobre tokens BPE. La variante XXL alcanza aproximadamente 1.100 millones de parámetros. La decodificación es CTC voraz, sin modelo de lenguaje externo ni beam search, lo que simplifica el despliegue y reduce la latencia.

Los detalles concretos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El modelo fue desarrollado por NVIDIA NeMo y Suno.ai; la model card original remite a la documentación de NeMo para los detalles arquitectónicos completos. La conversión GGUF fue portada desde el commit upstream a707e81 (fijado el 2026-05-10) y validada numéricamente contra la referencia NeMo en el commit 42528dd de transcribe.cpp el 2026-05-10.

## Capacidades

- Transcripción de voz a texto en inglés, offline, con salida en minúsculas y sin puntuación.
- Decodificación CTC voraz (greedy) sin modelo de lenguaje externo.
- Generación de timestamps a nivel de token (según metadatos: `timestamps: token`).
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan (GPU integradas/AMD) mediante transcribe.cpp.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No realiza detección de idioma (`lang_detect: false`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multimodales más allá del audio de entrada (sin visión ni audio generativo).

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa audio de 16 kHz mono WAV de forma offline y genera texto plano en minúsculas, adecuado para archivado y búsqueda posterior; su WER de 1,85 % en LibriSpeech test-clean lo hace fiable para dictado claro en inglés.
- Subtitulado automático de vídeo en inglés: combinando la salida CTC con timestamps a nivel de token, se pueden alinear subtítulos con precisión; la naturaleza no streaming obliga a procesar el audio completo o por segmentos.
- Notas de voz en aplicaciones móviles o de escritorio: con la cuantización Q4_K_M (818 MB) el modelo cabe en dispositivos de consumo y puede ejecutarse en CPU o Metal, permitiendo transcripción local sin enviar audio a la nube.
- Pipelines de análisis de llamadas de atención al cliente: la transcripción en minúsculas sin puntuación puede normalizarse y pasarse a etapas posteriores de NLP (clasificación, extracción de entidades); el bajo coste por hora de audio (RTF de 6-17,5 en CPU según el hardware) permite procesar volúmenes elevados.
- Investigación en ASR y evaluación de cuantizaciones: el repositorio incluye seis niveles de cuantización con WER medido, lo que facilita estudios de degradación por cuantización sobre un mismo modelo base.
- Integración en herramientas de accesibilidad: transcripción local de audio para personas con discapacidad auditiva en entornos sin conectividad, usando transcribe.cpp compilado desde fuente.
- Procesamiento de archivos de audio históricos o de dominio público en inglés: la licencia CC-BY-4.0 permite uso comercial y derivados con atribución, adecuado para proyectos de digitalización.

## Benchmarks y rendimiento

WER medido en la partición completa LibriSpeech test-clean (2620 utterances) con decodificación CTC voraz y sin LM externo. Baseline de referencia F32: 1,85 %. El dato autoinformado por NVIDIA en la misma partición es 1,83 %.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 4,25 GB | 1,85 % |
| F16 | 2,13 GB | 1,85 % |
| Q8_0 | 1,26 GB | 1,85 % |
| Q6_K | 1,04 GB | 1,85 % |
| Q5_K_M | 929 MB | 1,84 % |
| Q4_K_M | 818 MB | 1,90 % |

Rendimiento en tiempo real (RTF, factor de tiempo real) reportado por el autor:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 139,5 |
| Apple M4 Max | CPU | 17,5 |
| AMD Ryzen 4750U | Vulkan | 14 |
| AMD Ryzen 4750U | CPU | 6 |

No se han publicado en la información disponible resultados de benchmarks en otros conjuntos (MMLU, HumanEval, GSM8K, etc.), dado que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: F32 4,25 GB, F16 2,13 GB, Q8_0 1,26 GB, Q6_K 1,04 GB, Q5_K_M 929 MB, Q4_K_M 818 MB (tamaños de archivo; el consumo en memoria es del orden del tamaño del modelo más buffers de audio).
- GPU recomendadas: no se especifican modelos concretos de GPU en la información; el autor reporta ejecución en Metal (Apple M4 Max) y Vulkan (AMD Ryzen 4750U con GPU integrada).
- Cabe en GPU de consumo: sí, con las cuantizaciones Q8_0 y menores (≤1,26 GB); incluso Q4_K_M (818 MB) es viable en equipos con poca memoria.
- Opciones de despliegue: transcribe.cpp (compilado desde fuente con CMake), con backends CPU, Metal y Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF de 139,5 en Metal (M4 Max), 17,5 en CPU (M4 Max), 14 en Vulkan y 6 en CPU (Ryzen 4750U); valores superiores a 1 implican procesamiento más rápido que tiempo real.
- Formato de audio de entrada: WAV mono a 16 kHz; conversión previa con ffmpeg si es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| parakeet-ctc-1.1b (GGUF, este) | 1,06B | no disponible | 1,85 % (1,83 % NVIDIA) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-ctc-1.1b (original) | 1,1B | no disponible | 1,83 % (autoinformado) | CC-BY-4.0 | NeMo/Transformers |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos ASR comparables (por ejemplo, Whisper large-v3 o variantes) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Se indica "no disponible" para evitar inferencias no verificadas.

## Limitaciones y advertencias

- Solo soporta inglés; no traduce ni detecta idioma (`lang_detect: false`).
- No es un modelo de streaming (`streaming: false`): requiere audio completo o segmentado manualmente.
- Salida en minúsculas y sin puntuación; puede requerir post-procesado para legibilidad o para etapas NLP posteriores.
- WER medido sin modelo de lenguaje externo; en dominios con ruido, acentos no nativos o vocabulario especializado el error puede aumentar considerablemente respecto a LibriSpeech.
- Riesgo de alucinación inherente a modelos CTC en segmentos de silencio o ruido; no se documentan mecanismos de mitigación en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial y obras derivadas con atribución; es necesario citar a NVIDIA/Suno.ai y respetar los términos del modelo base.
- La conversión GGUF está vinculada a un commit concreto de transcribe.cpp (42528dd) y del modelo base (a707e81); cambios posteriores en el motor pueden afectar la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria independiente.
- No se documentan sesgos específicos del modelo en la información proporcionada.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/tryambientai/parakeet-ctc-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-1.1b
- Commit del modelo base fijado: https://huggingface.co/nvidia/parakeet-ctc-1.1b/commit/a707e81
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ctc-1.1b.md
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Suno.ai: https://www.suno.ai/
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Transformers (Hugging Face): https://github.com/huggingface/transformers
