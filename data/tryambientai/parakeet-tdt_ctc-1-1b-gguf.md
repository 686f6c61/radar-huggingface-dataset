# tryambientai/parakeet-tdt_ctc-1.1b-gguf

## Resumen

`parakeet-tdt_ctc-1.1b-gguf` es una conversión al formato GGUF del modelo ASR `nvidia/parakeet-tdt_ctc-1.1b`, publicada por el usuario `tryambientai` para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo original es un sistema de reconocimiento automático del habla en inglés, desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, que transcribe audio con puntuación y capitalización. Esta conversión concreta elimina la cabeza CTC auxiliar del checkpoint híbrido original y conserva únicamente el decodificador TDT/RNNT, lo que simplifica el despliegue en entornos C++ sin dependencias de PyTorch o NeMo.

Arquitectónicamente se trata de un encoder FastConformer-XL de aproximadamente 1.100 millones de parámetros con atención local y tokens globales, lo que le permite procesar hasta 11 horas de audio en una sola pasada. La conversión a GGUF facilita la ejecución en CPU y GPU de consumo mediante cuantizaciones que van desde F32 (4,28 GB) hasta Q4_K_M (825 MB), manteniendo un WER de 1,87 % en LibriSpeech test-clean en casi todas las variantes (1,91 % en Q4_K_M).

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de gama alta de NVIDIA en infraestructura modesta y sin el stack de NeMo, con velocidades de tiempo real (RTF) de 125,5 en Metal sobre un Apple M4 Max y de 11 en Vulkan sobre un Ryzen 4750U. Es, por tanto, una opción práctica para transcripción offline en inglés con requisitos de hardware reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder) + decodificador TDT/RNNT (la cabeza CTC auxiliar se elimina en la conversión) |
| Parametros totales | 1.070.516.870 (≈1,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; el modelo puede transcribir hasta 11 horas de audio en una sola pasada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |
| Pipeline | automatic-speech-recognition |
| Entrada de audio | WAV mono a 16 kHz |
| Streaming | no |
| Traducción | no |
| Detección de idioma | no |
| Timestamps | a nivel de token |
| Tamaño del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo base es un FastConformer (variante de Conformer con atención local y submuestreo agresivo) en configuración XXL, con un decodificador transducer TDT (Token-and-Duration Transducer) que predice conjuntamente tokens y duraciones. El checkpoint original es híbrido TDT-CTC, pero esta conversión descarta la cabeza CTC y deja solo el decodificador TDT/RNNT, que es el que se usa por defecto en la inferencia. La combinación de atención local con tokens globales es la que habilita la transcripción de secuencias de audio muy largas (hasta 11 horas) en una sola pasada, sin segmentación manual.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en ASR). La model card del autor indica que la conversión se validó numéricamente contra la referencia de NeMo en el commit `42528dd` de transcribe.cpp, y que el checkpoint upstream está fijado al commit `675e786` (fechado el 2026-05-10). El WER reportado por el autor de la conversión (1,87 % en F32) es ligeramente superior al 1,82 % autodeclarado por NVIDIA en el mismo split, diferencia atribuible a la decodificación greedy sin LM externo.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas.
- Procesamiento de audio largo: hasta 11 horas en una sola pasada gracias a la atención local con tokens globales.
- Decodificación transducer TDT/RNNT con predicción conjunta de token y duración.
- Timestamps a nivel de token.
- Ejecución offline sin dependencias de Python, PyTorch ni NeMo (runtime transcribe.cpp en C++).
- Aceleración por Metal (Apple Silicon), Vulkan y CPU.
- Cuantización con impacto mínimo en calidad: Q8_0, Q6_K y Q5_K_M mantienen el 1,87 % de WER del F32.
- No soporta streaming, traducción ni detección de idioma.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).

## Casos de uso

- **Transcripción de reuniones y conferencias**: el modelo puede procesar grabaciones de varias horas en una sola pasada, generando texto con puntuación y timestamps por token, lo que facilita la alineación con actas o subtítulos.
- **Subtitulado offline de vídeo**: integrado en un pipeline con `ffmpeg` para extraer audio a WAV mono 16 kHz, el modelo produce transcripciones con capitalización listas para revisión humana, sin coste de API.
- **Dictado y notas de voz en aplicaciones de escritorio**: con la variante Q4_K_M (825 MB) cabe en equipos de consumo y puede ejecutarse en CPU o Metal, habilitando dictado local sin enviar audio a la nube.
- **Indexación y búsqueda de archivos de audio**: los timestamps a nivel de token permiten construir índices que enlazan fragmentos de texto con posiciones exactas en el audio, útil en archivos de podcasts o grabaciones de atención al cliente.
- **Transcripción en servidores sin GPU**: gracias al backend Vulkan y CPU, un Ryzen 4750U alcanza un RTF de 11 (unas 11 veces más rápido que tiempo real), suficiente para procesar lotes de audio en servidores modestos.
- **Preprocesado para pipelines de NLP**: convertir audio a texto antes de aplicar análisis de sentimiento, resumen o extracción de entidades en inglés, usando el modelo como etapa ASR determinista y reproducible.
- **Prototipado en Apple Silicon**: con Metal sobre un M4 Max el RTF es de 125,5, lo que permite iterar rápidamente en el desarrollo de aplicaciones de voz en macOS.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,87 | 1,87 | 1,87 | 1,87 | 1,87 | 1,91 |
| Tamaño (GB) | 4,28 | 2,15 | 1,27 | 1,04 | 0,936 | 0,825 |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 125,5 |
| Apple M4 Max | CPU | 18,5 |
| AMD Ryzen 4750U | Vulkan | 11,0 |
| AMD Ryzen 4750U | CPU | 5,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2.620 utterances) con decodificación greedy TDT/RNN-T y sin LM externo. La referencia F32 es 1,87 %; NVIDIA autodeclara 1,82 % en el mismo split. El modelo base reporta además una velocidad de transcripción de 90 minutos de audio en menos de 16 segundos sobre una A100 (dato de la model card upstream, no validado en esta conversión).

## Requisitos de hardware

- **VRAM/RAM estimada**: 4,28 GB en F32, 2,15 GB en F16, 1,27 GB en Q8_0, 1,04 GB en Q6_K, 936 MB en Q5_K_M y 825 MB en Q4_K_M.
- **GPU recomendadas**: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; en el ecosistema NVIDIA, una A100 permite transcribir 90 minutos en menos de 16 segundos según el autor original.
- **GPU de consumo**: sí cabe en GPUs de consumo; la variante Q4_K_M (825 MB) es apta para equipos con poca memoria. No se especifican modelos concretos de RTX en la información disponible.
- **CPU**: funciona en CPU sin GPU; un Ryzen 4750U alcanza RTF 5,5 en CPU y 11 en Vulkan.
- **Opciones de despliegue**: transcribe.cpp (CLI `transcribe-cli`); no se indica soporte de vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no de generación de texto.
- **Latencia y throughput**: RTF de 125,5 (Metal M4 Max), 18,5 (CPU M4 Max), 11 (Vulkan Ryzen 4750U) y 5,5 (CPU Ryzen 4750U). Un RTF de 11 implica procesar 11 segundos de audio por cada segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---:|---|---|---:|
| parakeet-tdt_ctc-1.1b (esta conversión) | 1,1 B | en | hasta 11 h en una pasada | CC-BY-4.0 | GGUF | 1,87 % (F32) |
| nvidia/parakeet-tdt_ctc-1.1b (original) | 1,1 B | en | hasta 11 h en una pasada | CC-BY-4.0 | NeMo `.nemo` | 1,82 % (autodeclarado) |
| Whisper large-v3 | no disponible en la información | multilingüe | 30 s por ventana | MIT (según el proyecto original) | safetensors, GGUF (vía terceros) | no disponible en la información |
| Whisper large-v2 | no disponible en la información | multilingüe | 30 s por ventana | MIT (según el proyecto original) | safetensors, GGUF (vía terceros) | no disponible en la información |

La comparación con Whisper se ofrece como referencia de categoría (ASR de gama alta), pero los datos de parámetros, WER y licencia de Whisper no están incluidos en la información proporcionada y se marcan como no disponibles para no inventar cifras. La ventaja diferencial de esta conversión frente al checkpoint NeMo original es la ausencia de dependencias Python y la posibilidad de ejecución en CPU, Metal y Vulkan con cuantizaciones de menos de 1 GB.

## Limitaciones y advertencias

- **Solo inglés**: el modelo no soporta otros idiomas ni detección de idioma; introducir audio en otra lengua producirá transcripciones incorrectas o alucinaciones.
- **No es streaming**: requiere el audio completo (o segmentos) antes de transcribir; no apto para reconocimiento en tiempo real continuo.
- **No traduce**: la salida es siempre texto en inglés, independientemente del idioma de entrada.
- **Riesgo de alucinación**: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencio o habla solapada; se recomienda validación en dominios ruidosos.
- **Formato de entrada estricto**: WAV mono a 16 kHz; es necesario remuestrear con `ffmpeg` u otra herramienta antes de la inferencia.
- **Pérdida de la cabeza CTC**: esta conversión elimina la cabeza CTC del checkpoint híbrido; si se necesita decodificación CTC, hay que usar el modelo original en NeMo.
- **Licencia CC-BY-4.0**: permite uso comercial con atribución; es necesario citar al autor original (NVIDIA/Suno.ai) y conservar el aviso de licencia.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al estar entrenado principalmente con datos en inglés, el rendimiento puede degradarse con acentos no nativos o variedades dialectales.
- **Madurez de la conversión**: el repo tiene 0 descargas y 0 likes en el momento de la consulta, y la validación se limita a la comparación numérica contra NeMo en un commit concreto; conviene verificar la reproducibilidad en el propio entorno.
- **Runtime específico**: depende de transcribe.cpp, un proyecto que debe compilarse desde fuente; no hay integración con frameworks de inferencia ampliamente adoptados.

## Enlaces

- [Hugging Face: tryambientai/parakeet-tdt_ctc-1.1b-gguf](https://huggingface.co/tryambientai/parakeet-tdt_ctc-1.1b-gguf)
- [Modelo base: nvidia/parakeet-tdt_ctc-1.1b](https://huggingface.co/nvidia/parakeet-tdt_ctc-1.1b)
- [Commit upstream fijado (675e786)](https://huggingface.co/nvidia/parakeet-tdt_ctc-1.1b/commit/675e786)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Commit de validación transcribe.cpp (42528dd)](https://github.com/handy-computer/transcribe.cpp/tree/42528dd)
- [Documentación del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt_ctc-1.1b.md)
- [NVIDIA NeMo](https://github.com/NVIDIA/NeMo)
- [Documentación NeMo FastConformer](https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer)
- [Suno.ai](https://www.suno.ai/)
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper Conformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
