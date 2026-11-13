# xix3r/voxix-moonshine-streaming-small-gguf

## Resumen

Moonshine Streaming Small es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors, empaquetado en formato GGUF por el usuario xix3r para su uso con transcribe.cpp. Se trata de un modelo encoder-decoder de 123 millones de parámetros diseñado específicamente para transcripción en streaming de baja latencia sobre hardware de clase edge. Su innovación principal reside en un encoder "ergódico" con atención local acotada y sin embeddings posicionales, combinado con un frontend de audio de 50 Hz en el dominio del tiempo.

El modelo resuelve el problema de la transcripción de voz en tiempo real en dispositivos con recursos limitados, donde los modelos ASR tradicionales (basados en espectrogramas y atención global) resultan demasiado pesados o lentos. La variante GGUF aquí presentada permite ejecutar el modelo mediante transcribe.cpp en CPU y GPU de consumo, con cuantizaciones que reducen el peso hasta 189 MB sin degradación medible del WER.

Esta ficha cubre la conversión GGUF publicada por xix3r, que hereda la licencia MIT del modelo base y está validada contra la referencia de Hugging Face Transformers v5.7.0. El modelo es exclusivamente para inglés, sin capacidad de traducción, detección de idioma ni timestamps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con encoder ergódico (atención local acotada, sin embeddings posicionales) y decoder autorregresivo |
| Parametros totales | 140.135.225 (según safetensors); la model card indica 123M para el modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana deslizante en el encoder; sin cifra publicada) |
| Tipos de cuantizacion | F32, F16, Q8_0 (Q6_K, Q5_K_M y Q4_K_M no se distribuyen para esta variante) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Entrada de audio | WAV mono a 16 kHz |
| Frontend de audio | 50 Hz, dominio del tiempo |
| Capas encoder / decoder | 10 / 10 |
| Dimensiones ocultas | Encoder 620 / decoder 512 |
| Tarea | Automatic-speech-recognition (ASR) |
| Streaming | Sí |
| Traducción | No |
| Detección de idioma | No |
| Timestamps | No |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura encoder-decoder Transformer con una particularidad central: el encoder es "ergódico", es decir, utiliza atención local con ventanas acotadas y prescinde de embeddings posicionales. La información posicional se inyecta mediante un adaptador antes de un decoder autorregresivo estándar. El frontend de audio opera a 50 Hz en el dominio del tiempo, lo que reduce el coste computacional frente a enfoques basados en espectrogramas de mayor resolución. El encoder y el decoder constan de 10 capas cada uno, con dimensiones ocultas de 620 y 512 respectivamente.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card original referencia un paper draft en el repositorio de Useful Sensors, pero los detalles de entrenamiento no se incluyen en los datos disponibles. La conversión GGUF fue portada desde el commit upstream 2c03650 (fijado el 2026-05-06) y validada contra la referencia de HF Transformers v5.7.0 en el commit 0d312ce de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono a 16 kHz.
- Procesamiento en streaming con ventana deslizante, adecuado para baja latencia.
- Decodificación greedy (`num_beams=1`, `do_sample=False`) validada en la evaluación publicada.
- Ejecución en hardware de clase edge gracias a su tamaño reducido (123M parámetros) y frontend ligero.
- Compatibilidad con transcribe.cpp en CPU (con soporte Vulkan) y GPU (Metal).
- No soporta traducción, detección de idioma ni generación de timestamps.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en tiempo real en dispositivos edge: el modelo puede ejecutarse en CPU o GPU de consumo con transcribe.cpp, procesando audio de 16 kHz en streaming con ventanas deslizantes, lo que lo hace adecuado para asistentes de voz embebidos y dispositivos IoT.
- Subtitulado de reuniones y notas de voz: con un WER del 2,53% en LibriSpeech test-clean y un peso de 189 MB en Q8_0, puede desplegarse localmente para transcribir grabaciones sin enviar audio a la nube.
- Dictado por voz en aplicaciones de escritorio: la integración con transcribe.cpp permite invocar el modelo desde una CLI (`transcribe-cli`) sobre archivos WAV, factible en portátiles con CPU moderna (RTF de 12 en Ryzen 4750U vía CPU).
- Procesamiento por lotes de audio en pipelines de datos: la conversión GGUF y el bajo coste de inferencia permiten transcribir grandes volúmenes de audio en servidores sin GPU dedicada, usando la cuantización Q8_0 para minimizar el uso de memoria.
- Transcripción en entornos con requisitos de privacidad: al ejecutarse completamente en local y con licencia MIT, es apto para sectores regulados (salud, legal) donde el audio no puede salir del perímetro.
- Prototipado rápido de aplicaciones ASR: la disponibilidad de pesos GGUF y la API de transcribe.cpp permiten integrar transcripción en proyectos de investigación o demos sin depender de servicios externos.
- Transcripción en hardware Apple Silicon: con soporte Metal y un RTF de 96 en M4 Max, es viable para aplicaciones de transcripción en macOS con latencia muy baja.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| LibriSpeech test-clean (2620 utterances) | WER F32 | 2,53% |
| LibriSpeech test-clean | WER F16 | 2,53% |
| LibriSpeech test-clean | WER Q8_0 | 2,54% |
| LibriSpeech test-clean (referencia Useful Sensors) | WER reportado | 2,49% |

| Plataforma | Backend | RTF (real-time factor) |
|---|---|---|
| Apple M4 Max | Metal | 96 |
| Apple M4 Max | CPU | 57 |
| AMD Ryzen 4750U | Vulkan | 23,5 |
| AMD Ryzen 4750U | CPU | 12 |

El WER se midió con decodificación greedy sobre el split completo de LibriSpeech test-clean. La diferencia de +0,04 pp respecto al valor reportado por Useful Sensors (2,49%) se atribuye a diferencias de scoring y normalización de texto, no a deriva numérica del port, según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de pesos, F32 requiere ~536 MB, F16 ~269 MB y Q8_0 ~189 MB de memoria.
- GPU recomendadas: no se especifican modelos concretos; la model card reporta pruebas en Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan/CPU).
- Cabe en GPU de consumo: sí, dado el reducido tamaño de los pesos (189-536 MB), es viable en cualquier GPU consumer moderna.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con soporte para CPU, Vulkan y Metal. El modelo base es compatible con Hugging Face Transformers (clase `MoonshineStreamingForConditionalGeneration`).
- Latencia y throughput: RTF de 96 en M4 Max con Metal, 57 en M4 Max con CPU, 23,5 en Ryzen 4750U con Vulkan y 12 en Ryzen 4750U con CPU. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonshine Streaming Small (este) | 123M (140M en safetensors) | No disponible (streaming) | 2,53% (F32) | MIT | GGUF en HF, transcribe.cpp |
| Moonshine Streaming Tiny | No disponible | No disponible | 4,52% (referencia cruzada en la model card) | MIT | GGUF en HF |
| Whisper Small | ~244M | 30 s (ventana fija) | No disponible en la información | MIT | Múltiples formatos (safetensors, GGUF, etc.) |

La comparativa se limita a los datos disponibles. Whisper Small se incluye como referencia de categoría por tamaño similar, pero no se dispone de su WER en la información proporcionada para una comparación directa. Moonshine Streaming Tiny pertenece a la misma familia y ofrece un WER notablemente superior (4,52%) con un tamaño menor.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidad multilingüe ni traducción.
- No genera timestamps, lo que limita su uso en aplicaciones que requieran alineación temporal precisa.
- No dispone de detección de idioma; el audio debe estar en inglés para obtener resultados fiables.
- Riesgo de bucles de alucinación en la generación: la model card original recomienda limitar la longitud máxima de salida (`token_limit_factor = 6.5 / sampling_rate`) para evitarlos.
- El WER de 2,53% se ha medido en LibriSpeech test-clean, un corpus de lectura limpia; el rendimiento en audio con ruido, acentos o habla espontánea no está documentado en la información disponible.
- La cuantización Q8_0 introduce una degradación mínima (+0,01 pp de WER), pero no se distribuyen cuantizaciones más agresivas (Q6_K, Q5_K_M, Q4_K_M) para esta variante.
- La licencia MIT permite uso comercial, pero se hereda del modelo base; conviene consultar la model card upstream para términos completos.
- El modelo está validado contra una versión concreta de transcribe.cpp (commit 0d312ce) y HF Transformers v5.7.0; cambios futuros en estas librerías podrían afectar la compatibilidad.
- No se dispone de información sobre sesgos demográficos o de otro tipo en los datos de entrenamiento.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-streaming-small-gguf
- Modelo base en Hugging Face: https://huggingface.co/UsefulSensors/moonshine-streaming-small
- Commit upstream del modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-small/commit/2c03650
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-small.md
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Descarga F32: https://huggingface.co/handy-computer/moonshine-streaming-small-gguf/resolve/main/moonshine-streaming-small-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-streaming-small-gguf/resolve/main/moonshine-streaming-small-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-streaming-small-gguf/resolve/main/moonshine-streaming-small-Q8_0.gguf
