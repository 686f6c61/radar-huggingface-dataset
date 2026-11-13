# xix3r/voxix-moonshine-streaming-tiny-gguf

## Resumen

Voxix Moonshine Streaming Tiny GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-streaming-tiny, publicada por el usuario xix3r para su uso con la librería transcribe.cpp. Se trata de un modelo encoder-decoder de arquitectura Transformer con atención de ventana deslizante, diseñado específicamente para transcripción de voz en streaming sobre hardware de clase edge. El modelo original lo desarrolla Useful Sensors y está pensado para convertir audio de 16 kHz mono en texto en inglés con baja latencia.

La relevancia de esta ficha reside en que ofrece una alternativa de ASR extremadamente ligera (44 millones de parámetros) y con licencia MIT, lo que permite despliegues comerciales sin restricciones y ejecución en CPU o GPU de gama baja. Frente a modelos ASR más pesados como Whisper, Moonshine Streaming Tiny prioriza el rendimiento en tiempo real y la huella mínima de memoria, a costa de limitarse al inglés y no ofrecer marcas de tiempo ni traducción.

El repositorio contiene únicamente pesos cuantizados (F32, F16 y Q8_0) y no incluye versiones Q6_K, Q5_K_M ni Q4_K_M. La conversión está validada contra la referencia de Hugging Face Transformers v5.7.0 y mantiene paridad numérica con el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con encoder ergódico (atención local acotada, sin embeddings posicionales) y atención de ventana deslizante; frontend de audio de 50 Hz |
| Parámetros totales | 44.054.721 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante, sin valor publicado) |
| Tipos de cuantización | F32, F16, Q8_0 (no se distribuyen Q6_K, Q5_K_M ni Q4_K_M) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Entrada | WAV mono a 16 kHz |
| Salida | Transcripción de texto (sin timestamps, sin traducción, sin detección de idioma) |
| Tamaño de los ficheros | F32: 169 MB; F16: 85 MB; Q8_0: 48 MB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder de tipo Transformer. La innovación principal es el encoder "ergódico": utiliza atención local acotada sin embeddings posicionales, lo que lo hace invariante a la posición absoluta y adecuado para flujos continuos de audio. Un adaptador inyecta información posicional antes de un decodificador autorregresivo estándar. El frontend de audio opera a 50 Hz en el dominio temporal, lo que reduce la carga computacional frente a enfoques basados en espectrogramas de mayor resolución.

El modelo está diseñado para uso en streaming mediante atención de ventana deslizante, lo que permite procesar audio de forma incremental con latencia baja. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original remite al paper de Moonshine Streaming para los detalles completos del entrenamiento.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono de 16 kHz.
- Procesamiento en streaming gracias a la atención de ventana deslizante y al encoder ergódico.
- Ejecución en hardware de clase edge y en CPU, con requisitos de memoria muy bajos.
- Inferencia de baja latencia: el modelo está optimizado para aplicaciones en tiempo real.
- No soporta traducción, detección de idioma ni generación de marcas de tiempo.
- No dispone de tool calling, function calling ni capacidades de agente.
- Capacidad multilingüe limitada exclusivamente al inglés.
- No incorpora visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado en tiempo real de reuniones y videollamadas: el modelo procesa audio de 16 kHz en streaming con latencia baja, adecuado para generar subtítulos en directo en inglés dentro de aplicaciones de conferencia.
- Asistentes de voz embebidos en dispositivos domésticos: con 44 millones de parámetros y un fichero Q8_0 de 48 MB, puede ejecutarse en Raspberry Pi o dispositivos similares para comandos de voz locales sin conexión.
- Transcripción de notas de voz en aplicaciones móviles: la cuantización Q8_0 mantiene un WER de 4,52 % en LibriSpeech test-clean, lo que permite transcribir grabaciones cortas con calidad cercana a la referencia F32.
- Accesibilidad para personas con discapacidad auditiva: integración en sistemas de captioning en vivo para aulas o eventos, ejecutándose en CPU sin GPU dedicada.
- Preprocesado de audio en pipelines de datos: conversión masiva de archivos WAV a texto para alimentar sistemas de búsqueda o análisis, aprovechando el bajo coste computacional por hora de audio.
- Prototipado rápido de aplicaciones ASR: gracias a la licencia MIT y al formato GGUF, permite validar ideas de producto sin costes de licencia ni infraestructura GPU, migrando después a modelos mayores si es necesario.
- Dictado por voz en herramientas de escritorio: el modelo puede integrarse en editores de texto o IDE mediante transcribe.cpp para dictado local en inglés sin enviar audio a la nube.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean | 4,53 % | 4,53 % | 4,52 % |
| RTF en Apple M4 Max (Metal) | no disponible | no disponible | 159 |
| RTF en Apple M4 Max (CPU) | no disponible | no disponible | 211 |
| RTF en Ryzen 4750U (Vulkan) | no disponible | no disponible | 59,5 |
| RTF en Ryzen 4750U (CPU) | no disponible | no disponible | 54,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy (`num_beams=1`, `do_sample=False`). La referencia de Hugging Face Transformers obtiene 4,52 % en el mismo manifiesto, con un 99,6 % de hipótesis idénticas byte a byte respecto al F32 de esta conversión. El valor autodeclarado por Useful Sensors en Open ASR Leaderboard es 4,49 %; la diferencia de +0,04 pp se atribuye a diferencias de normalización de texto y metodología de scoring, no a deriva numérica del port.

Los valores RTF (real-time factor) indican que el modelo procesa audio entre 54 y 211 veces más rápido que tiempo real según el hardware y el backend, lo que confirma su idoneidad para streaming.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el fichero Q8_0 ocupa 48 MB y el F32 169 MB, por lo que la memoria de trabajo es mínima.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, Apple Silicon (Metal) y GPUs integradas con Vulkan.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU Intel/AMD, y también en dispositivos de clase Raspberry Pi.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. También es compatible con Hugging Face Transformers mediante `MoonshineStreamingForConditionalGeneration` y `AutoProcessor` para el modelo base.
- Latencia y throughput: RTF de 159 en Metal (M4 Max), 211 en CPU (M4 Max), 59,5 en Vulkan (Ryzen 4750U) y 54,5 en CPU (Ryzen 4750U). Un RTF de 159 implica procesar 159 segundos de audio por cada segundo de cómputo.
- Conversión de audio previa necesaria: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean | Contexto / streaming |
|---|---|---:|---|---|---:|---|
| Moonshine Streaming Tiny (este) | 44 M | en | MIT | GGUF | 4,52–4,53 % | Streaming, ventana deslizante |
| Whisper Tiny | 39 M | multilingüe | MIT | safetensors, GGUF | no disponible en la información proporcionada | No streaming nativo |
| Whisper Base | 74 M | multilingüe | MIT | safetensors, GGUF | no disponible en la información proporcionada | No streaming nativo |
| Moonshine Streaming Small | no disponible | en | MIT | safetensors | no disponible en la información proporcionada | Streaming, ventana deslizante |

La comparación con Whisper se basa en el tamaño de parámetros y la licencia, ambos datos públicos; no se dispone de cifras de WER de Whisper en la información proporcionada para una comparación numérica rigurosa. Moonshine Streaming Small es la variante superior de la misma familia y comparte arquitectura y licencia.

## Limitaciones y advertencias

- Solo soporta inglés; no traduce ni detecta idioma automáticamente.
- No genera marcas de tiempo, lo que limita su uso en aplicaciones que requieran alineación temporal precisa.
- Riesgo de bucles de alucinación en la generación: la model card original recomienda limitar la longitud máxima de salida con un factor de 6,5 respecto a la longitud de la secuencia de entrada.
- El WER de referencia (4,5 %) se ha medido en LibriSpeech, un corpus de lectura limpia; el rendimiento en audio con ruido, acentos no nativos o habla espontánea puede degradarse notablemente.
- No se distribuyen cuantizaciones Q6_K, Q5_K_M ni Q4_K_M, lo que limita las opciones de despliegue en entornos con restricciones extremas de memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- La licencia MIT permite uso comercial sin restricciones, pero se hereda del modelo base y conviene verificar los términos upstream.
- El modelo no dispone de tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que requieran razonamiento multi-paso.
- Requiere audio de entrada en WAV mono a 16 kHz; otros formatos o frecuencias deben convertirse previamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-streaming-tiny-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-tiny
- Commit del modelo base utilizado: https://huggingface.co/UsefulSensors/moonshine-streaming-tiny/commit/f8e9dfd
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-tiny.md
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Pesos F32 (handy-computer): https://huggingface.co/handy-computer/moonshine-streaming-tiny-gguf/resolve/main/moonshine-streaming-tiny-F32.gguf
- Pesos F16 (handy-computer): https://huggingface.co/handy-computer/moonshine-streaming-tiny-gguf/resolve/main/moonshine-streaming-tiny-F16.gguf
- Pesos Q8_0 (handy-computer): https://huggingface.co/handy-computer/moonshine-streaming-tiny-gguf/resolve/main/moonshine-streaming-tiny-Q8_0.gguf
