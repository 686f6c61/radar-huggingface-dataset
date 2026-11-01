# tryambientai/moonshine-streaming-tiny-gguf

## Resumen

Moonshine Streaming Tiny es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors, empaquetado en formato GGUF por tryambientai para su uso con transcribe.cpp. Se trata de un modelo encoder-decoder de arquitectura Transformer diseñado específicamente para transcripción en streaming de baja latencia sobre hardware de gama edge, con un frontend de audio de 50 Hz y atención de ventana deslizante. El repositorio que nos ocupa contiene únicamente las conversiones a GGUF del modelo base, no una nueva versión del modelo.

Con 44.054.721 parámetros totales y un tamaño de repositorio de 0,1 GB, el modelo está pensado para transcripción offline de inglés, sin capacidades de traducción, detección de idioma ni marcas temporales. Su relevancia actual radica en que ofrece una alternativa muy ligera (48 MB en cuantización Q8_0) para integrar ASR en aplicaciones locales, con un WER de 4,52-4,53 % sobre LibriSpeech test-clean, prácticamente idéntico al de la referencia en Transformers.

La ficha describe tanto las características del modelo base como los detalles del empaquetado GGUF, incluyendo las métricas de rendimiento medidas en transcribe.cpp sobre distintos backends (Metal, Vulkan, CPU).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con encoder "ergódico" (atención local acotada, sin embeddings posicionales) y adaptador posicional antes del decoder autorregresivo |
| Parámetros totales | 44.054.721 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (atención de ventana deslizante sobre audio; sin cifra de contexto publicada) |
| Tipos de cuantización | F32, F16, Q8_0 (Q6_K, Q5_K_M y Q4_K_M no se distribuyen para esta variante) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base en safetensors |
| Frontend de audio | 50 Hz, entrada WAV mono a 16 kHz |
| Streaming | Sí |
| Traducción | No |
| Detección de idioma | No |
| Marcas temporales | No |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura encoder-decoder de tipo Transformer. El encoder es "ergódico": usa atención local acotada (bounded local attention) y prescinde de embeddings posicionales, lo que permite procesar audio en streaming con una ventana deslizante. Un adaptador inyecta la información posicional antes de un decoder autorregresivo estándar. El frontend de audio opera a 50 Hz sobre la forma de onda temporal, lo que reduce el coste computacional frente a enfoques basados en espectrogramas de mayor resolución.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del autor del empaquetado remite al paper de Moonshine Streaming para los detalles completos del entrenamiento. La conversión GGUF se realizó desde el commit `f8e9dfd` del modelo base (fijado el 2026-05-06) y se validó contra la referencia de HF Transformers v5.7.0 en el commit `0d312ce` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono a 16 kHz.
- Procesamiento en streaming con baja latencia, gracias al encoder de atención local y al frontend de 50 Hz.
- Decodificación autorregresiva con soporte para decodificación greedy (`num_beams=1`, `do_sample=False`).
- Ejecución eficiente en hardware de gama edge (CPU, Metal, Vulkan).
- No soporta traducción, detección de idioma ni generación de marcas temporales.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multimodal: solo procesa audio de entrada y genera texto.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo procesa audio WAV mono a 16 kHz y genera la transcripción en local, sin depender de servicios en la nube, gracias a su tamaño reducido (48 MB en Q8_0).
- Subtitulado en tiempo real de contenido en inglés: su diseño para streaming con encoder de ventana deslizante permite alimentar audio por fragmentos y obtener texto con baja latencia en hardware modesto.
- Asistentes de voz embebidos en dispositivos edge: con 44 M de parámetros y cuantización Q8_0, cabe en dispositivos con recursos limitados y puede ejecutarse sobre CPU o GPU integrada mediante Vulkan o Metal.
- Dictado por voz en aplicaciones de escritorio: integrable mediante transcribe.cpp como biblioteca nativa, con conversión previa del audio a WAV mono 16 kHz con ffmpeg.
- Indexación y búsqueda de archivos de audio en inglés: transcripción por lotes de grabaciones para generar texto buscable, aprovechando el bajo coste computacional por hora de audio.
- Prototipado y evaluación de pipelines ASR: al estar validado contra la referencia de Transformers con paridad numérica (99,6 % de hipótesis idénticas byte a byte en F32), sirve como banco de pruebas para comparar implementaciones y cuantizaciones.
- Transcripción en entornos sin conectividad: al ser offline y no requerir descarga de modelos grandes, es adecuado para despliegues en campo o sistemas aislados.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 4,53 | 4,53 | 4,52 |
| Tamaño del archivo | 169 MB | 85 MB | 48 MB |

| Métrica de velocidad (RTF) | Backend | Valor |
|---|---|---:|
| RTF en M4 Max | Metal | 159 |
| RTF en M4 Max | CPU | 211 |
| RTF en Ryzen 4750U | Vulkan | 59,5 |
| RTF en Ryzen 4750U | CPU | 54,5 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 enunciados) con decodificación greedy. La referencia en HF Transformers obtiene 4,52 % en el mismo manifiesto y régimen, con un 99,6 % de hipótesis idénticas byte a byte respecto al F32 del port. El dato autodeclarado por Useful Sensors en la tabla del Open ASR Leaderboard es 4,49 %; la diferencia de +0,04 pp se atribuye a diferencias de metodología de puntuación y normalización de texto, no a una deriva numérica del port.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones distribuidas (169 MB en F32, 85 MB en F16, 48 MB en Q8_0), incluyendo overhead de runtime.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Se ha validado en Apple M4 Max con Metal y en AMD Ryzen 4750U con Vulkan.
- Cabe en cualquier GPU de consumo, incluida las integradas; también en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), con binario `transcribe-cli`. El modelo base es compatible con HF Transformers (`MoonshineStreamingForConditionalGeneration`).
- Latencia y throughput: RTF de 159 en Metal (M4 Max), 211 en CPU (M4 Max), 59,5 en Vulkan (Ryzen 4750U) y 54,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.
- Conversión de audio previa necesaria si la entrada no es WAV mono a 16 kHz: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| moonshine-streaming-tiny (este) | 44 M | Inglés | No disponible | 4,52-4,53 % | MIT | GGUF, safetensors |
| Whisper tiny | No disponible en la información proporcionada | Multilingüe | No disponible | No disponible | MIT | No disponible |
| Whisper base | No disponible en la información proporcionada | Multilingüe | No disponible | No disponible | MIT | No disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. La diferencia principal frente a la familia Whisper es el enfoque monolingüe (solo inglés) y la arquitectura orientada a streaming con encoder ergódico.

## Limitaciones y advertencias

- Solo soporta inglés; no traduce ni detecta idioma automáticamente.
- No genera marcas temporales, lo que limita su uso en subtitulado que requiera alineación precisa.
- Riesgo de bucles de alucinación en la generación: la model card del modelo base recomienda limitar la longitud máxima de salida con un factor de 6,5 / frecuencia de muestreo para evitarlos.
- El WER de referencia (4,5 %) implica una tasa de error no despreciable en producción; conviene validar con datos propios del dominio.
- No se han publicado datos sobre sesgos demográficos, acentos o ruido de fondo en la información disponible.
- La licencia MIT permite uso comercial, pero se hereda del modelo base y conviene revisar los términos completos en la model card original.
- Las cuantizaciones Q6_K, Q5_K_M y Q4_K_M no están disponibles para esta variante, lo que limita opciones de compresión extrema.
- La entrada debe ser WAV mono a 16 kHz; otros formatos requieren conversión previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tryambientai/moonshine-streaming-tiny-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-tiny
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-tiny/commit/f8e9dfd
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-tiny.md
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Descarga F32: https://huggingface.co/handy-computer/moonshine-streaming-tiny-gguf/resolve/main/moonshine-streaming-tiny-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-streaming-tiny-gguf/resolve/main/moonshine-streaming-tiny-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-streaming-tiny-gguf/resolve/main/moonshine-streaming-tiny-Q8_0.gguf
