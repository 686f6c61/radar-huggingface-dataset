# xix3r/voxix-parakeet-tdt_ctc-1.1b-gguf

## Resumen

`voxix-parakeet-tdt_ctc-1.1b-gguf` es una conversión a formato GGUF del modelo ASR `nvidia/parakeet-tdt_ctc-1.1b`, publicada por el usuario xix3r para su uso con el runtime `transcribe.cpp`. El modelo original es un sistema de reconocimiento automático del habla en inglés desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, y esta conversión permite ejecutarlo fuera del ecosistema NeMo, sobre CPU, Metal o Vulkan, sin dependencias de PyTorch.

Se trata de un FastConformer-XL de aproximadamente 1.070 millones de parámetros con decodificador transducer TDT/RNN-T. En el proceso de conversión se descarta la cabeza CTC auxiliar del checkpoint híbrido original, por lo que la transcripción se realiza con decodificación TDT greedy. El modelo produce texto con puntuación y mayúsculas, y está pensado exclusivamente para inglés.

Su relevancia práctica radica en el tamaño reducido de las cuantizaciones (desde 825 MB en Q4_K_M) y en el mantenimiento de la calidad: el WER en LibriSpeech test-clean se mantiene en 1,87 % hasta Q5_K_M y solo sube a 1,91 % en Q4_K_M. Esto permite desplegar un ASR de calidad cercana al estado del arte en hardware modesto, incluyendo equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder) + decodificador transducer TDT/RNN-T |
| Parametros totales | 1.070.516.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; el modelo original puede transcribir hasta 11 horas de audio en una sola pasada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime: transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer, una variante de Conformer con atencion local y subsampling agresivo, combinada con un decodificador transducer. El checkpoint original es híbrido TDT-CTC, pero esta conversión elimina la cabeza CTC y conserva únicamente el decodificador TDT/RNN-T. El encoder usa atención local combinada con tokens globales, lo que permite procesar audio muy largo (hasta 11 horas según NVIDIA) en una sola pasada sin segmentación externa.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino con preferencias. El modelo original fue entrenado por NVIDIA NeMo y Suno.ai; la conversión GGUF se realizó a partir del commit `675e786` del repositorio upstream (fijado el 2026-05-10) y se validó numéricamente contra la referencia NeMo en el commit `42528dd` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en inglés con puntuación y mayúsculas automáticas.
- Procesamiento de audio largo en una sola pasada gracias a la atención local/global del encoder FastConformer.
- Decodificación TDT greedy sin modelo de lenguaje externo.
- Generación de timestamps a nivel de token (según la configuración `timestamps: token` de la model card).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No realiza detección de idioma (`lang_detect: false`).
- No dispone de tool calling, function calling ni capacidades de agente (no es un modelo de lenguaje generativo).

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo puede procesar grabaciones completas de varias horas en una sola pasada, con puntuación automática, lo que elimina la necesidad de segmentar el audio manualmente.
- Generación de subtítulos para vídeo: combinando la salida con timestamps a nivel de token, se pueden alinear los subtítulos con el audio sin un alineador forzado adicional.
- Dictado y notas de voz en aplicaciones de escritorio: la cuantización Q5_K_M (936 MB) permite integrar el modelo en aplicaciones locales que corren sobre CPU o GPU integrada, sin enviar audio a la nube.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos de audio de una organización para hacerlos buscables por texto, usando Q8_0 (1,27 GB) para mantener el WER en 1,87 %.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones telefónicas para extraer texto analizable, con despliegue en servidores sin GPU mediante el backend CPU de transcribe.cpp.
- Transcripción en dispositivos con GPU Apple Silicon: el backend Metal reporta un RTF de 125,5 en un chip M4 Max, lo que permite transcribir audio en tiempo real o más rápido en portátiles.
- Pipelines de accesibilidad: generación de transcripciones para contenido audiovisual en entornos con requisitos de privacidad, al ejecutarse completamente en local.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,87 | 1,87 | 1,87 | 1,87 | 1,87 | 1,91 |
| Tamano del fichero | 4,28 GB | 2,15 GB | 1,27 GB | 1,04 GB | 936 MB | 825 MB |

| Entorno | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 125,5 |
| Apple M4 Max | CPU | 18,5 |
| Ryzen 4750U | Vulkan | 11 |
| Ryzen 4750U | CPU | 5,5 |

El WER se midió sobre el split completo LibriSpeech test-clean (2620 utterances) con decodificación TDT/RNN-T greedy y sin modelo de lenguaje externo. El valor autoinformado por NVIDIA en el mismo split es 1,82 %. No se han publicado en la información disponible resultados de otros benchmarks (p. ej. Common Voice, MLS, GigaSpeech).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en Q4_K_M, 1,0 GB en Q5_K_M, 1,3 GB en Q8_0, 2,2 GB en F16 y 4,3 GB en F32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4/Q5; A100 o H100 para F32 y para maximizar throughput en lotes grandes. NVIDIA indica que el modelo original transcribe 90 minutos de audio en menos de 16 segundos en A100.
- Cabe en GPU de consumo: sí, en tarjetas con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), con backends CPU, Metal y Vulkan. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: RTF de 125,5 en Metal (M4 Max), 18,5 en CPU (M4 Max), 11 en Vulkan (Ryzen 4750U) y 5,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica transcripción más rápida que el tiempo real.
- El audio de entrada debe ser WAV mono a 16 kHz; para otros formatos hay que convertirlos previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| voxix-parakeet-tdt_ctc-1.1b-gguf | 1,07 B | en | GGUF | CC-BY-4.0 | hasta 11 h (modelo base) |
| nvidia/parakeet-tdt_ctc-1.1b | 1,1 B | en | NeMo (.nemo) | CC-BY-4.0 | hasta 11 h |
| Whisper large-v3 | no disponible en la informacion | multilingue | safetensors, GGUF (via terceros) | MIT (modelo original) | 30 s por ventana |
| Whisper large-v3-turbo | no disponible en la informacion | multilingue | safetensors, GGUF (via terceros) | MIT (modelo original) | 30 s por ventana |

La comparación con Whisper se ofrece como referencia de categoría; los datos concretos de parámetros y contexto de esos modelos no se han verificado en la información proporcionada y deben consultarse en sus fichas oficiales. La ventaja principal de esta conversión frente a NeMo es la ausencia de dependencias de PyTorch y la posibilidad de ejecución en CPU, Metal y Vulkan.

## Limitaciones y advertencias

- Solo admite inglés; no traduce ni detecta idioma automáticamente.
- No es un modelo de streaming: requiere el audio completo (o segmentos) antes de transcribir.
- El modelo puede presentar sesgos heredados de los datos de entrenamiento de NVIDIA, no documentados en la información disponible.
- Riesgo de alucinación en audio con ruido, música o habla no inglesa; no se han publicado métricas específicas en dominios ruidosos.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al modelo original y a la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y poco validada por la comunidad.
- La cabeza CTC del checkpoint original se descarta en la conversión; no es posible usar decodificación CTC con estos pesos.
- Requiere el runtime `transcribe.cpp`, que debe compilarse desde el código fuente; no hay integración con ecosistemas estándar como Hugging Face Transformers.
- El audio debe prepararse previamente a 16 kHz mono WAV; no hay preprocesado automático de formato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-parakeet-tdt_ctc-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-1.1b
- Commit del modelo base usado en la conversión: https://huggingface.co/nvidia/parakeet-tdt_ctc-1.1b/commit/675e786
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt_ctc-1.1b.md
- Repositorio de NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Suno.ai: https://www.suno.ai/
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper Conformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
