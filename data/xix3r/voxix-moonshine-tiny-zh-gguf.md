# xix3r/voxix-moonshine-tiny-zh-gguf

## Resumen

voxix-moonshine-tiny-zh-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-tiny-zh, un sistema de reconocimiento automático del habla (ASR) para mandarín desarrollado por Moonshine AI (anteriormente Useful Sensors). El modelo es una adaptación al chino del Moonshine tiny original, que emplea una arquitectura transformer encoder-decoder con tan solo 27 millones de parámetros. Esta conversión, publicada por el usuario xix3r, está pensada para su uso con el motor de inferencia transcribe.cpp, una implementación en C++ optimizada para despliegue en CPU y GPU de consumo.

La relevancia de este modelo radica en su extrema ligereza: con 27M de parámetros y ficheros de entre 34 MB y 105 MB según cuantización, permite transcripción de audio en mandarín en hardware muy modesto, incluyendo dispositivos móviles o sistemas embebidos. A diferencia de aproximaciones clásicas como Whisper, Moonshine prescinde del cálculo de STFT y del banco de filtros mel, procesando directamente PCM crudo de 16 kHz mediante un stem convolucional, lo que reduce la latencia y el coste computacional en audios cortos.

El modelo está especializado exclusivamente en chino mandarín: no soporta traducción, detección de idioma ni marcas de tiempo, y su salida es únicamente texto transcrito. La licencia es MIT, heredada del modelo base, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (sin STFT ni mel filterbank) |
| Parámetros totales | 27.092.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada variable; max_length de decodificación 192 tokens) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny, un transformer encoder-decoder diseñado específicamente para ASR. La entrada de audio se procesa mediante un stem convolucional de tres capas Conv1d que consume PCM crudo a 16 kHz, eliminando la necesidad de calcular el espectrograma STFT o el banco de filtros mel que emplean modelos como Whisper. Esta decisión reduce el coste de preprocesado y permite que el modelo escale su cómputo con la longitud real del audio, en lugar de con una ventana fija de 30 segundos. El decoder genera únicamente el texto transcrito, sin etiquetas de idioma ni marcas temporales.

El modelo base moonshine-tiny-zh fue entrenado por Moonshine AI mediante fine-tuning del Moonshine tiny original sobre datos de mandarín. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original remite al paper arXiv:2509.02523 para más información sobre el entrenamiento. La conversión GGUF fue portada desde el commit 3306270 del modelo base y validada contra la referencia de transformers en el commit 90bf720 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en chino mandarín a partir de audio PCM de 16 kHz mono.
- Procesamiento directo de forma de onda sin preprocesado STFT ni banco de filtros mel.
- Salida exclusiva de transcripción: no genera traducción, no detecta idioma y no produce marcas de tiempo.
- No soporta streaming (streaming: false en los metadatos de la model card).
- No soporta tool calling ni function calling (no aplica a un modelo ASR).
- No soporta razonamiento multi-paso ni modo thinking (no aplica a un modelo ASR).
- Capacidad monolingüe: únicamente chino (zh).

## Casos de uso

- Transcripción de reuniones y notas de voz en mandarín: el modelo convierte audio de 16 kHz mono en texto con un CER del 13,7 % en FLEURS-zh, adecuado para actas internas donde no se requiere transcripción perfecta y prima el coste cero de infraestructura.
- Subtitulado offline de contenido en chino: al ejecutarse en CPU con un factor de tiempo real de 45,5x en un Ryzen 4750U, puede procesar lotes de vídeos en un servidor modesto sin GPU.
- Dictado en aplicaciones de escritorio: con ficheros Q8_0 de 34 MB, el modelo puede empaquetarse dentro de una aplicación de escritorio o móvil para dictado local sin conexión.
- Preprocesado de datos para pipelines de NLP: transcripción masiva de corpus de audio en mandarín para alimentar sistemas de búsqueda, análisis de sentimiento o resumen, aprovechando el bajo coste por hora de audio.
- Asistentes de voz embebidos: su reducido tamaño permite integrarlo en dispositivos con recursos limitados (Raspberry Pi, sistemas ARM) para comandos de voz en chino, siempre que no se requiera streaming en tiempo real.
- Transcripción en entornos con requisitos de privacidad: al ejecutarse localmente con transcribe.cpp y no requerir conexión, es apto para audio sensible que no puede enviarse a servicios en la nube.
- Archivado y accesibilidad: generación de transcripciones para cumplir requisitos de accesibilidad en contenidos en mandarín, aceptando la ausencia de marcas de tiempo y la necesidad de postprocesado para alineación.

## Benchmarks y rendimiento

Resultados publicados en la model card de la conversión GGUF:

| Cuantización | Tamaño | CER (FLEURS-zh test, 945 utterances) |
|---|---|---|
| F32 | 105 MB | 13,70 % |
| F16 | 57 MB | 13,70 % |
| Q8_0 | 34 MB | 13,78 % |
| Referencia Transformers F32 (MPS) | — | 13,72 % |

Rendimiento medido (factor de tiempo real, RTF):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | Metal | 127x |
| Apple M4 Max | CPU | 153,5x |
| AMD Ryzen 4750U | Vulkan | 56x |
| AMD Ryzen 4750U | CPU | 45,5x |

El CER se midió con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192, coincidiendo con la generation_config original). UsefulSensors no publica un CER por idioma para esta variante; la referencia de Transformers en F32 sobre el mismo manifiesto arrojó 13,72 % de CER, dentro del ruido de intervalo de confianza bootstrap respecto a los valores de transcribe.cpp. Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (F32 ~105 MB de pesos, Q8_0 ~34 MB); el consumo real depende del buffer de audio y del runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no se requiere VRAM dedicada significativa.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también funciona íntegramente en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), y el modelo base en formato safetensors mediante transformers con `MoonshineForConditionalGeneration`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 127x (Metal en M4 Max), 153,5x (CPU en M4 Max), 56x (Vulkan en Ryzen 4750U) y 45,5x (CPU en Ryzen 4750U); es decir, procesa entre 45 y 153 segundos de audio por segundo de cómputo según plataforma.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| moonshine-tiny-zh (este) | 27M | zh | Audio 16 kHz, salida máx. 192 tokens | MIT | GGUF, safetensors |
| Moonshine tiny original | 27M | en | Audio 16 kHz | MIT | safetensors, GGUF |
| Whisper tiny | 39M | multilingüe (99 idiomas) | Ventana fija de 30 s | MIT | safetensors, GGUF, etc. |
| Whisper base | 74M | multilingüe (99 idiomas) | Ventana fija de 30 s | MIT | safetensors, GGUF, etc. |

No se dispone de datos de CER comparativos entre estos modelos en la información proporcionada, salvo el CER de 13,7 % en FLEURS-zh para este modelo. Whisper tiny y base ofrecen multilingüismo y marcas de tiempo, a cambio de mayor tamaño y del coste fijo de procesar ventanas de 30 segundos. Moonshine tiny original solo cubre inglés. La ventaja principal de este modelo frente a Whisper es su menor tamaño y su procesamiento proporcional a la duración real del audio.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe chino mandarín; no detecta idioma ni traduce.
- Sin marcas de tiempo: no permite alinear la transcripción con el audio, lo que limita su uso en subtitulado sincronizado sin postprocesado.
- Sin soporte de streaming: debe procesarse el audio completo (o en fragmentos gestionados externamente), lo que puede añadir latencia en aplicaciones en tiempo real.
- CER del 13,7 % en FLEURS-zh: aceptable para usos internos, pero insuficiente para transcripción de precisión sin revisión humana.
- Riesgo de alucinación y bucles de decodificación: la model card original recomienda limitar max_length en función de la duración del audio (factor 13 / sampling_rate) para evitarlos.
- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de un modelo entrenado sobre datos de habla, puede presentar peor rendimiento en acentos no representados, audio con ruido o solapamiento de hablantes.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero se recomienda revisar la model card del modelo base para términos completos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria independiente de esta conversión concreta.
- Los enlaces de descarga de la model card apuntan a handy-computer/moonshine-tiny-zh-gguf, no al repositorio xix3r; conviene verificar la procedencia de los ficheros antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-tiny-zh-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-zh
- Commit del modelo base portado: https://huggingface.co/UsefulSensors/moonshine-tiny-zh/commit/3306270
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Código de Moonshine AI: https://github.com/moonshine-ai/moonshine
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Descargas GGUF (según model card): https://huggingface.co/handy-computer/moonshine-tiny-zh-gguf
