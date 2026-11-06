# tryambientai/moonshine-tiny-ar-gguf

## Resumen

moonshine-tiny-ar-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-ar, publicada por tryambientai para su uso con la librería transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 27.092.736 parámetros, especializado en transcripción de audio en árabe, que forma parte de la familia Moonshine de modelos ASR minúsculos diseñados para dispositivos de borde (edge devices). El modelo base fue desarrollado por Moonshine AI (anteriormente Useful Sensors) y se describe en el paper "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices".

La relevancia de esta ficha reside en que ofrece una alternativa extremadamente ligera (34 MB en cuantización Q8_0) para transcripción de voz en árabe sobre hardware modesto, incluyendo CPU y GPUs integradas. A diferencia de Whisper, Moonshine consume PCM crudo a 16 kHz mediante un stem Conv1d de tres capas, sin STFT ni banco de filtros mel, lo que reduce el coste computacional en inferencia. El modelo es monolingüe (árabe), no soporta traducción, detección de idioma ni marcas de tiempo, y está pensado exclusivamente para transcripción.

La conversión GGUF mantiene la licencia MIT del modelo base y se valida contra la referencia de Transformers, con un WER del 27,11 % en FLEURS-ar para F32/F16 y del 26,79 % para Q8_0. El modelo está pensado para despliegues en tiempo real o casi real en dispositivos con recursos limitados, y su integración con transcribe.cpp permite ejecutarlo mediante CLI o incrustarlo en pipelines C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_length de generación = 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine, un transformer encoder-decoder diseñado específicamente para ASR en dispositivos de borde. La entrada de audio se procesa mediante un stem de tres capas Conv1d que consume directamente PCM crudo a 16 kHz, eliminando la necesidad de STFT y banco de filtros mel presentes en arquitecturas como Whisper. Esta decisión reduce el preprocesamiento y el coste computacional, lo que permite inferencia en CPU y GPUs de baja potencia. El decoder genera únicamente la transcripción, sin tokens especiales de idioma, traducción o marcas de tiempo.

El modelo base fue entrenado por Moonshine AI y posteriormente ajustado por Useful Sensors para árabe. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original remite al paper "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices" (arXiv:2509.02523) para más detalles sobre el entrenamiento y la evaluación. La conversión GGUF fue portada desde el commit 99e7fee del modelo base y validada contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en árabe a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesamiento STFT ni banco de filtros mel, gracias al stem Conv1d.
- Generación de transcripciones con decodificación greedy (num_beams=1, max_length=192).
- Ejecución en CPU y GPUs integradas mediante transcribe.cpp (backend CPU y Vulkan).
- Ejecución en Apple Silicon mediante backend Metal.
- No soporta traducción, detección de idioma ni marcas de tiempo.
- No soporta streaming (streaming: false).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- Capacidad monolingüe: únicamente árabe.

## Casos de uso

- Transcripción de reuniones y notas de voz en árabe: el modelo puede convertir grabaciones de audio de 16 kHz mono en texto para actas o resúmenes, con un WER del 27 % en FLEURS-ar, adecuado para aplicaciones donde no se requiere transcripción perfecta sino un borrador revisable.
- Subtitulado automático de vídeos en árabe: integrado en un pipeline que extrae el audio, lo convierte a 16 kHz mono con ffmpeg y ejecuta transcribe-cli, el modelo genera el texto base para subtítulos, aunque sin marcas de tiempo (habría que alinear posteriormente).
- Asistentes de voz embebidos en dispositivos de borde: con solo 34 MB en Q8_0 y RTF de 45,5 en CPU Ryzen 4750U, el modelo puede ejecutarse en tiempo real en hardware modesto para comandos de voz o dictado en árabe.
- Dictado en aplicaciones de escritorio: integrado en herramientas de productividad mediante transcribe.cpp, permite dictar texto en árabe sin conexión a internet, con latencia baja en Apple Silicon (RTF 127 en Metal).
- Transcripción de llamadas de atención al cliente: el modelo puede procesar grabaciones de llamadas en árabe para su análisis posterior, aunque la falta de marcas de tiempo y de detección de idioma limita su uso a audio ya segmentado y en árabe.
- Investigación en ASR de bajo recurso: sirve como baseline ligero para experimentos con modelos ASR minúsculos en árabe, comparando WER y RTF en distintos backends (CPU, Vulkan, Metal).
- Prototipado rápido de pipelines ASR en C++: la integración con transcribe.cpp permite incrustar el modelo en aplicaciones C++ sin dependencias de Python, útil para sistemas embebidos o aplicaciones de escritorio nativas.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Referencia Transformers F32 |
|---|---:|---:|---:|---:|
| WER FLEURS-ar test (428 utterances) | 27,11 % | 27,11 % | 26,79 % | 27,13 % |

| Plataforma | Backend | RTF (real-time factor) |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

El WER se midió con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192, coincidiendo con la generation_config del modelo base). La referencia de Transformers se ejecutó en fp32 sobre MPS con el mismo manifiesto. Las cifras de F32/F16 coinciden con la referencia dentro del ruido de bootstrap-CI; Q8_0 introduce una deriva adicional típicamente inferior a 0,1 pp. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones; F32 ~105 MB, F16 ~57 MB, Q8_0 ~34 MB de pesos.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA); no requiere GPU dedicada de datacenter.
- Cabe en cualquier GPU consumer, incluidas iGPUs y GPUs integradas; también funciona en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con backends CPU, Vulkan y Metal; el modelo base es compatible con Transformers (`MoonshineForConditionalGeneration`).
- Latencia y throughput: RTF de 127 en Metal (M4 Max), 153,5 en CPU (M4 Max), 56 en Vulkan (Ryzen 4750U) y 45,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.
- Requiere audio de entrada mono a 16 kHz en formato WAV; para otros formatos es necesario convertir con ffmpeg (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS-ar | Licencia | Formato | Idiomas |
|---|---:|---|---:|---|---|---|
| moonshine-tiny-ar-gguf | 27,1 M | No disponible (max_length 192) | 26,79 % (Q8_0) | MIT | GGUF | Árabe |
| moonshine-tiny (base, inglés) | 27 M | No disponible | No disponible | MIT | Safetensors | Inglés |
| Whisper tiny | 39 M | 30 s de audio | No disponible en la información | MIT | Safetensors, GGUF | Multilingüe |
| Whisper small | 244 M | 30 s de audio | No disponible en la información | MIT | Safetensors, GGUF | Multilingüe |

La comparativa con Whisper tiny y Whisper small se ofrece como referencia de categoría (ASR ligero), pero no se dispone de cifras de WER en FLEURS-ar para esos modelos en la información proporcionada. Moonshine se diferencia de Whisper por su stem Conv1d sobre PCM crudo (sin STFT/mel) y por estar especializado por idioma, lo que reduce el tamaño y el coste computacional a cambio de perder multilingüismo y funcionalidades como detección de idioma o marcas de tiempo.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe árabe; no detecta el idioma ni traduce.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sin alineación posterior.
- No soporta streaming; debe procesar el audio completo de una vez.
- WER del 27 % en FLEURS-ar, lo que implica errores frecuentes en condiciones acústicas difíciles o vocabulario específico; no apto para transcripción de precisión legal o médica sin revisión humana.
- Riesgo de alucinación y bucles de generación; la model card original recomienda limitar la longitud máxima de generación para evitarlos.
- Requiere audio mono a 16 kHz; otros formatos deben convertirse previamente.
- Licencia MIT heredada del modelo base, que permite uso comercial, pero se recomienda revisar la model card original de UsefulSensors/moonshine-tiny-ar para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.
- La conversión GGUF está validada contra la referencia de Transformers en un commit concreto; cambios futuros en transcribe.cpp podrían afectar la compatibilidad.
- No dispone de benchmarks adicionales publicados más allá de FLEURS-ar.

## Enlaces

- Hugging Face (conversión GGUF): https://huggingface.co/tryambientai/moonshine-tiny-ar-gguf
- Modelo base en Hugging Face: https://huggingface.co/UsefulSensors/moonshine-tiny-ar
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ar/commit/99e7fee
- Paper "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices": https://huggingface.co/papers/2509.02523
- Paper arXiv: https://arxiv.org/abs/2509.02523
- Paper "Model Cards for Model Reporting": https://arxiv.org/abs/1810.03993
- Repositorio Moonshine AI: https://github.com/moonshine-ai/moonshine
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado para validación: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de transcribe.cpp para Moonshine: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-tiny-ar-gguf/resolve/main/moonshine-tiny-ar-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-tiny-ar-gguf/resolve/main/moonshine-tiny-ar-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-tiny-ar-gguf/resolve/main/moonshine-tiny-ar-Q8_0.gguf
