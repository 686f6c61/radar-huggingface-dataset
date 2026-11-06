# tryambientai/whisper-base.en-gguf

## Resumen

whisper-base.en-gguf es una conversión al formato GGUF del modelo openai/whisper-base.en, publicada por el usuario tryambientai para su uso con transcribe.cpp, una implementación en C++ del pipeline de inferencia de Whisper. El modelo original es un sistema de reconocimiento automático del habla (ASR) desarrollado por OpenAI, presentado en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). Esta conversión concreta no altera los pesos más allá de la cuantización: reproduce el checkpoint base.en de OpenAI fijado en el commit 911407f.

Se trata de un transformer encoder-decoder de 72,6 millones de parámetros, especializado exclusivamente en inglés, que procesa ventanas de audio de 30 segundos y permite decodificación por trozos para audio de formato largo. Su relevancia práctica reside en que las cuantizaciones GGUF (desde F32 hasta Q4_K_M, entre 279 MB y 56 MB) permiten ejecutar ASR de calidad razonable en CPU y GPU de consumo, con una degradación de WER muy contenida: el paso de F32 a Q4_K_M solo empeora el WER de LibriSpeech test-clean de 4,14 % a 4,29 %.

El modelo es útil para quien necesite transcripción local, offline y de baja latencia en inglés, sin depender de APIs externas. No soporta streaming, traducción ni detección de idioma, y los timestamps son únicamente a nivel de segmento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 72.609.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos; decodificación por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un transformer encoder-decoder que consume espectrogramas mel de 80 canales calculados sobre audio a 16 kHz y genera tokens de texto de forma autorregresiva. El checkpoint base.en corresponde a la variante "base" entrenada solo con datos en inglés. Según la model card upstream, Whisper se entrenó con 680 000 horas de audio etiquetado mediante supervisión débil a gran escala, lo que le confiere capacidad de generalización a dominios y datasets no vistos sin fine-tuning.

Esta conversión no introduce cambios arquitectónicos: es una cuantización de los pesos originales para el runtime transcribe.cpp. El pipeline de decodificación por defecto de transcribe.cpp emplea greedy decoding, supresión de tokens, fallback de temperatura y timestamps de segmento habilitados. La model card indica que la diferencia respecto al 4,25 % de WER reportado por OpenAI en LibriSpeech test-clean probablemente se debe a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que transcribe.cpp opera con timestamps activados. La validación numérica se realizó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio de 16 kHz mono.
- Procesamiento de audio de formato largo mediante decodificación por trozos de ventanas de 30 segundos.
- Generación de timestamps a nivel de segmento.
- Ejecución local y offline en CPU (con soporte Vulkan) y en GPU Apple Silicon vía Metal.
- Cuantizaciones ligeras que permiten despliegue en hardware de gama baja.
- No soporta streaming.
- No soporta traducción de voz.
- No soporta detección automática de idioma.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking ni capacidades de visión o audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés: el modelo procesa ventanas de 30 segundos con decodificación por trozos, lo que permite transcribir grabaciones largas de forma local sin enviar audio a servicios externos.
- Subtitulado automático de vídeo en inglés: los timestamps a nivel de segmento permiten generar ficheros de subtítulos sincronizados de forma aproximada, útiles para contenido interno o previsualización.
- Dictado por voz en aplicaciones de escritorio: con la cuantización Q8_0 (81 MB) o Q4_K_M (56 MB), el modelo cabe holgadamente en memoria y puede ejecutarse en CPU, integrándose en herramientas de productividad que requieran transcripción en tiempo casi real.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la naturaleza offline del runtime y el bajo coste de memoria permiten transcribir grandes volúmenes de audio en servidores sin GPU dedicada.
- Indexación y búsqueda de contenido hablado: transcribir archivos de audio en inglés para alimentar motores de búsqueda o sistemas de recuperación de información sobre el texto resultante.
- Prototipado y evaluación de pipelines ASR: al ser una conversión fiel del checkpoint de OpenAI con métricas de WER publicadas por cuantización, sirve como referencia reproducible para comparar implementaciones o configuraciones de decodificación.
- Transcripción en dispositivos con recursos limitados: el tamaño reducido de las cuantizaciones Q4_K_M y Q5_K_M permite ejecución en equipos sin GPU dedicada, con un incremento de WER inferior a 0,2 puntos porcentuales respecto a F32.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 utterances), decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 279 MB | 4,14 % |
| F16 | 144 MB | 4,13 % |
| Q8_0 | 81 MB | 4,16 % |
| Q6_K | 65 MB | 4,15 % |
| Q5_K_M | 61 MB | 4,16 % |
| Q4_K_M | 56 MB | 4,29 % |
| Referencia OpenAI (mismo split) | — | 4,25 % |

Rendimiento en tiempo real (RTF, factor de tiempo real; cuanto mayor, más rápido que tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 211,9 |
| Apple M4 Max | CPU | 38,2 |
| AMD Ryzen 4750U | Vulkan | 36,2 |
| AMD Ryzen 4750U | CPU | 12,8 |

La model card advierte que las cifras provienen de una única ejecución con backend Metal y que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones, principalmente por resultados de alucinación en clips cortos cerca del suelo de ruido.

## Requisitos de hardware

- VRAM estimada: inferior a 300 MB en F32; alrededor de 60-90 MB en cuantizaciones Q4_K_M a Q8_0. Cabe en cualquier GPU de consumo moderna y en la mayoría de iGPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Con GPU, se beneficia de Apple Silicon (Metal) y de GPUs AMD/Intel con Vulkan.
- Cabe en GPU de consumo: sí, en todas las gamas actuales (por ejemplo, RTX 3060, RTX 4090, iGPU integradas).
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake; binario `transcribe-cli`). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: RTF de 211,9 en Metal sobre M4 Max, 38,2 en CPU sobre M4 Max, 36,2 en Vulkan sobre Ryzen 4750U y 12,8 en CPU sobre Ryzen 4750U. En todos los casos el modelo procesa audio más rápido que tiempo real.
- Preprocesado requerido: audio de entrada en WAV mono a 16 kHz; la model card sugiere convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---|---:|
| whisper-base.en-gguf (esta ficha) | 72,6 M | ventanas de 30 s | en | Apache-2.0 | GGUF | 4,14 % (F32) |
| openai/whisper-base.en | 72,6 M | ventanas de 30 s | en | Apache-2.0 | PyTorch/safetensors | 4,25 % (reportado por OpenAI) |
| openai/whisper-base (multilingue) | 72,6 M | ventanas de 30 s | multilingue | Apache-2.0 | PyTorch/safetensors | no disponible en la informacion proporcionada |
| openai/whisper-small.en | 244 M | ventanas de 30 s | en | Apache-2.0 | PyTorch/safetensors | no disponible en la informacion proporcionada |

La comparación con whisper-small.en se incluye por categoría de tamaño, pero no se dispone de cifras de WER ni de rendimiento en la información proporcionada para ese checkpoint.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no transcribe otros idiomas ni detecta el idioma del audio.
- No soporta streaming: requiere audio completo o troceado manual para decodificación por chunks.
- No soporta traducción de voz a texto en otro idioma.
- Timestamps únicamente a nivel de segmento, no a nivel de palabra.
- Riesgo de alucinación en clips cortos o con ruido de fondo, tal como señala la model card al comentar la variabilidad del WER entre ejecuciones.
- El WER de 4,14 % en F32 corresponde a LibriSpeech test-clean, un corpus relativamente limpio; el rendimiento en audio real con ruido, acentos o solapamiento de hablantes será previsiblemente peor.
- La licencia Apache-2.0 se hereda del modelo base y permite uso comercial, pero conviene revisar la model card upstream de OpenAI para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la conversión la publica un usuario individual (tryambientai), no el equipo de OpenAI ni el de transcribe.cpp; conviene validar la integridad de los pesos antes de usarlos en producción.
- La ejecución está ligada al runtime transcribe.cpp; no se documenta compatibilidad con otras herramientas de inferencia GGUF.
- El modelo base está fijado al commit 911407f (25 de abril de 2026) y validado contra transcribe.cpp 5.6.1 (26 de abril de 2026); cambios posteriores en el runtime pueden alterar el comportamiento de decodificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/whisper-base.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-base.en
- Commit del modelo base: https://huggingface.co/openai/whisper-base.en/commit/911407f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión de transcribe.cpp usada para validación: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-base.en.md
- Artículo de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Pesos GGUF (espejo handy-computer): https://huggingface.co/handy-computer/whisper-base.en-gguf
