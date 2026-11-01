# tryambientai/moonshine-tiny-ja-gguf

## Resumen
moonshine-tiny-ja-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-ja, publicada por tryambientai para su uso con la librería transcribe.cpp. El modelo base lo desarrolla Moonshine AI (anteriormente Useful Sensors) y está especializado en transcripción de audio en japonés sobre dispositivos de borde. Con solo 27 millones de parámetros, es un modelo encoder-decoder transformer de la familia Moonshine tiny, pensado para consumir audio PCM crudo a 16 kHz sin extracción de características STFT ni banco de filtros mel.

La relevancia de esta ficha reside en que ofrece una vía de despliegue en C++ puro mediante GGUF, lo que permite ejecutar ASR japonés en hardware modesto (CPU, Metal, Vulkan) sin depender de PyTorch. El modelo es monolingüe (japonés), no traduce, no detecta idioma y no genera timestamps. La licencia MIT facilita su integración comercial.

La conversión incluye tres cuantizaciones (F32, F16 y Q8_0) con degradación mínima de calidad: el CER en FLEURS ja pasa de 13,20 % en F32/F16 a 13,36 % en Q8_0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB (los pesos se alojan externamente en el repositorio handy-computer/moonshine-tiny-ja-gguf).

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine tiny), tallo Conv1d de tres capas, sin STFT ni mel filterbank |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_length de generación: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura Moonshine tiny: un encoder-decoder transformer que procesa directamente PCM crudo a 16 kHz mediante un tallo de tres capas Conv1d, eliminando la necesidad de STFT y banco de filtros mel que usan otros sistemas ASR como Whisper. Esta decisión reduce el coste computacional y la latencia, algo crítico en dispositivos de borde. La salida es únicamente texto transcrito, sin marcas de tiempo ni detección de idioma.

El modelo base fue entrenado y publicado por Moonshine AI (anteriormente Useful Sensors); los detalles de composición del dataset, número de tokens de entrenamiento y si hubo RLHF/DPO no están disponibles en la información proporcionada. Esta variante concreta es un fine-tuning sobre japonés del moonshine-tiny original. La conversión GGUF se realizó a partir del commit 02ca41b del modelo base (fijado el 2026-05-12) y se validó contra la referencia de transformers en el commit 90bf720 de transcribe.cpp el mismo día. La decodificación por defecto es greedy con num_beams=1 y max_length=192, coincidiendo con la generation_config original.

## Capacidades
- Transcripción de voz a texto en japonés (ASR monolingüe).
- Procesamiento de audio PCM crudo a 16 kHz mono, sin necesidad de preprocesado mel.
- Generación de transcripciones sin timestamps.
- No soporta traducción.
- No soporta detección de idioma.
- No soporta streaming (streaming: false).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio de salida.
- Capacidad multilingüe limitada exclusivamente al japonés.

## Casos de uso
- Transcripción de reuniones en japonés en local: el modelo puede procesar grabaciones WAV de 16 kHz mono en CPU o GPU integrada, sin enviar audio a la nube, gracias a sus 27 M de parámetros y al binario transcribe-cli.
- Subtitulado offline de contenido audiovisual japonés: se convierte el audio con ffmpeg a 16 kHz mono y se transcribe con Q8_0 (34 MB), adecuado para pipelines por lotes en servidores sin GPU dedicada.
- Asistentes de voz embebidos en japonés: al ejecutarse sobre Metal (RTF 127 en M4 Max) o Vulkan (RTF 56 en Ryzen 4750U), puede integrarse en aplicaciones de escritorio con latencia baja.
- Indexación y búsqueda de archivos de audio japoneses: la transcripción permite generar texto buscable en archivos históricos, con un CER del 13,36 % en Q8_0 como referencia de calidad.
- Prototipado de aplicaciones ASR en C++: al usar transcribe.cpp, se integra en proyectos nativos sin dependencias de Python ni PyTorch, reduciendo el tamaño del despliegue.
- Transcripción en dispositivos de borde con recursos limitados: el modelo F16 ocupa 57 MB y el Q8_0 34 MB, lo que permite ejecutarlo en placas con poca memoria siempre que se compile transcribe.cpp para la plataforma.
- Evaluación comparativa de cuantizaciones: sirve como caso de estudio para medir la degradación de CER entre F32, F16 y Q8_0 en un modelo ASR pequeño.

## Benchmarks y rendimiento
| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| CER FLEURS ja test (650 utterances) | 13,20 % | 13,20 % | 13,36 % |
| RTF Metal (M4 Max) | — | — | 127 |
| RTF CPU (M4 Max) | — | — | 153,5 |
| RTF Vulkan (Ryzen 4750U) | — | — | 56 |
| RTF CPU (Ryzen 4750U) | — | — | 45,5 |

Referencia transformers F32 en MPS: 13,23 % CER sobre el mismo manifiesto. Los valores de F32/F16 en C++ coinciden con la referencia dentro del ruido de bootstrap; Q8_0 introduce una deriva adicional típicamente inferior a 0,1 pp respecto a F16. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware
- VRAM estimada: no aplica en el sentido habitual; el modelo es tan pequeño que cabe en memoria unificada o RAM del sistema. Los pesos ocupan 105 MB (F32), 57 MB (F16) y 34 MB (Q8_0).
- GPU recomendadas: Apple Silicon con Metal (validado en M4 Max), GPU AMD/Intel con Vulkan (validado en Ryzen 4750U), y CPU x86/ARM como alternativa.
- Cabe en cualquier GPU de consumo actual e incluso en sistemas sin GPU dedicada, dado el tamaño del modelo.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario transcribe-cli), y la referencia en Python con transformers (MoonshineForConditionalGeneration).
- Latencia y throughput: RTF de 127 en Metal (M4 Max), 153,5 en CPU (M4 Max), 56 en Vulkan (Ryzen 4750U) y 45,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares
| Modelo | Parametros | Idioma | Contexto | Licencia | Formato | CER FLEURS ja |
|---|---:|---|---|---|---|---:|
| moonshine-tiny-ja-gguf | 27 M | ja | No disponible | MIT | GGUF | 13,20 % (F32) |
| moonshine-tiny (base, inglés) | 27 M | en | No disponible | MIT | Safetensors | No disponible |
| Whisper tiny | 39 M | multilingüe | 30 s de audio | MIT | Safetensors, GGUF | No disponible |

La comparación con Whisper tiny se ofrece como referencia de categoría (ASR pequeño), pero no se dispone de CER comparable en la información proporcionada. El modelo base moonshine-tiny en inglés no publica CER de japonés porque no soporta ese idioma.

## Limitaciones y advertencias
- Modelo monolingüe: solo transcribe japonés; no traduce ni detecta idioma.
- Sin timestamps: no genera marcas temporales por palabra o segmento.
- Sin streaming: no soporta transcripción en tiempo real por fragmentos.
- Riesgo de alucinación y bucles de generación: la model card original recomienda limitar la longitud máxima de generación (max_length=192) para evitar bucles.
- CER del 13,20 % en FLEURS ja: implica una tasa de error considerable para producción sensible; conviene evaluar en el dominio concreto antes de desplegar.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado sobre datos de habla japonesa, puede presentar peor rendimiento en acentos regionales o audio ruidoso.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y conviene revisar la model card upstream para términos completos.
- Repositorio con 0 descargas y 0 likes: la conversión es reciente y no ha sido ampliamente validada por la comunidad.
- Tamaño del repo de 0,0 GB: los pesos se alojan externamente; verificar la disponibilidad de los enlaces de descarga antes de integrar en producción.

## Enlaces
- HuggingFace (esta conversión): https://huggingface.co/tryambientai/moonshine-tiny-ja-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ja
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ja/commit/02ca41b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Pesos GGUF (F32): https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf/resolve/main/moonshine-tiny-ja-F32.gguf
- Pesos GGUF (F16): https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf/resolve/main/moonshine-tiny-ja-F16.gguf
- Pesos GGUF (Q8_0): https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf/resolve/main/moonshine-tiny-ja-Q8_0.gguf
- Paper Moonshine: https://huggingface.co/papers/2509.02523
- Código Moonshine: https://github.com/moonshine-ai/moonshine
- Instalación Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
