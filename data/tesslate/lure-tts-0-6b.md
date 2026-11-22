# Tesslate/Lure-TTS-0.6B

## Resumen

Lure-TTS-0.6B es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Tesslate, publicado como vista previa de investigación. Su propuesta central es el clonado de voz expresivo con un tamaño reducido: 0,6B parámetros nominales (914.643.008 parámetros reales según los pesos en safetensors). A partir de una referencia de voz de entre 3 y 12 segundos y su transcripción, el modelo lee texto nuevo con esa voz, incorporando sonidos inline entre paréntesis (hasta 36 soportados, como `(sigh)` o `(sharp inhale)`) y notas de dirección en texto libre que modifican la interpretación de la línea.

El modelo emplea la arquitectura Qwen3-TTS (tag `qwen3_tts`) y el códec de Qwen3-TTS en formato de 12,5 Hz con 16 codebooks, generando audio mono a 24 kHz con capacidad de streaming. La relevancia actual reside en su relación calidad/tamaño: según la model card, su precisión de palabras en benchmarks públicos en inglés queda a la altura de modelos de 1,5B a 35B parámetros, con el UTMOS más alto de su tabla comparativa, y corre más rápido que tiempo real en un MacBook.

Existe una variante, Lure Turbo, con la misma voz y una cabeza de decodificación más rápida (predice los 15 códigos finos por frame en 3 pasadas en lugar de 15). La licencia es Apache 2.0 y el modelo se distribuye en safetensors con un repositorio de 2,5 GB. Está marcado explícitamente como research preview, por lo que los pesos y el comportamiento pueden cambiar entre releases.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (tag `qwen3_tts`); códec de 12,5 Hz con 16 codebooks (formato Qwen3-TTS 12Hz) |
| Parámetros totales | 914.643.008 (0,6B nominal) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona ejecución en bf16 con backend CUDA) |
| Idiomas soportados | inglés únicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que Lure se construye sobre la arquitectura Qwen3-TTS y utiliza el códec de Qwen3-TTS en formato de 12,5 Hz con 16 codebooks, con salida de audio mono a 24 kHz y generación en streaming. La model card describe una cabeza de decodificación que predice 15 códigos finos de audio por frame; la variante Turbo reduce esto a 3 pasadas, lo que acelera el paso de decodificación por frame aproximadamente 3,4 veces.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovación técnica más allá del esquema de decodificación en pasadas y del control expresivo mediante etiquetas inline y notas de dirección. El repositorio de entrenamiento está enlazado en la model card (`smirki/lure-train`), pero su contenido no forma parte de la información proporcionada.

## Capacidades

- Síntesis de voz en inglés con salida mono a 24 kHz y generación en streaming.
- Clonado de voz zero-shot a partir de una referencia de 3 a 12 segundos más su transcripción.
- Interpretación de sonidos inline entre paréntesis: 36 etiquetas soportadas (risas, suspiros, respiraciones, quiebres de voz, susurros, etc.), ejecutadas en el punto indicado en lugar de leerse.
- Control expresivo mediante notas de dirección en texto libre (por ejemplo, "Hushed and shaking, close to tears."), que modifican la interpretación de la línea.
- Habla expresiva y emocional (tags `expressive-speech`, `emotional-speech`).
- Capacidad de streaming de audio a través del motor `lure-tts`, con chunks float32 a 24 kHz.
- Soporte de múltiples voces simultáneas en un mismo servidor (8 streams en una GPU de 24 GB según la model card).
- No se indica soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Audiolibros y narración expresiva: el modelo permite insertar etiquetas como `(sigh)` o `(sharp inhale)` en el texto y aplicar notas de dirección por línea, de modo que un mismo clon de voz puede interpretar diálogos con matices emocionales sin reentrenamiento.
- Doblaje y localización de contenido: con una referencia de 3 a 12 segundos del actor original y su transcripción, se puede generar voz nueva en inglés manteniendo el timbre, útil para prototipos de doblaje y para revisiones previas a la grabación final.
- Asistentes de voz y agentes conversacionales: la generación en streaming (RTF de 0,23 en H100 con una sola instancia) permite emitir audio mientras se genera, reduciendo la latencia percibida en respuestas de un asistente.
- Producción de pódcasts y contenido para creadores: el control expresivo inline y las notas de dirección permiten generar tomas con risas, suspiros y cambios de intensidad sin grabar, acelerando la iteración sobre guiones.
- Prototipado de videojuegos y personajes: un único servidor con 8 streams concurrentes en una GPU de 24 GB (219 frames/s, 17x tiempo real con Lure; 374 frames/s, 30x con Turbo) permite dar voz a varios personajes en tiempo de ejecución o en preproducción.
- Accesibilidad y lectura en voz alta: la ventana de referencia corta y el tamaño de 0,6B facilitan el despliegue en entornos con recursos limitados, incluida ejecución más rápida que tiempo real en un MacBook según la model card, para lectura de textos con voz personalizada.
- Investigación en habla expresiva: al ser un research preview con licencia Apache 2.0 y código de entrenamiento publicado, sirve como base para experimentos de control prosódico y clonado de voz de bajo coste computacional.

## Benchmarks y rendimiento

Resultados publicados en la model card (una toma por línea, sampling por defecto, scripts oficiales de cada benchmark). Las filas de otros modelos son cifras publicadas por sus desarrolladores.

| Modelo | Tamaño | Seed-TTS WER ↓ | Seed-TTS SIM ↑ | LibriSpeech-PC SIM ↑ | LibriSpeech-PC UTMOS ↑ | VDB SIM ↑ | CV3 emotion % ↑ | RTF ↓ |
|---|---|---|---|---|---|---|---|---|
| Lure | 0,6B | 1,51 | 0,653 | 0,638 | **4,43** | **0,81** | 73,3 | 0,230 |
| Lure Turbo | 0,6B | 1,59 | 0,654 | 0,641 | 4,38 | **0,81** | 73,3 | 0,140 |
| Fish S2 Pro | 5B | **0,99** | – | – | – | – | – | 0,195 |
| Qwen3-TTS 0.6B | 0,6B | 1,32 | – | – | – | – | – | – |
| Fish Drama 3 | 35B MoE | 1,54 | 0,640 | 0,605 | 4,31 | – | – | **0,131** |
| Ming 3.0 0.5B | ~1B | 1,58 | 0,691 | – | – | – | – | – |
| FireRedTTS3 | 1,7B+ | 1,64 | **0,772** | – | – | – | – | – |
| VoxCPM2 | 2B | 1,84 | 0,753 | – | – | 0,70 | – | – |
| F5-TTS | – | 2,00 | 0,670 | – | – | – | 64,7 | – |
| CosyVoice3 | – | 2,22 | 0,720 | 0,694 | 4,28 | – | – | – |
| Breeze TTS 2 | 3B | – | – | – | – | 0,67 | – | 0,320 |
| dots.tts | 2B | – | 0,770 | – | – | – | – | – |
| Ming Tiny | 7,9B MoE | – | 0,728 | – | – | – | 74,0 | – |
| IndexTTS2 | 1,5B | – | 0,706 | – | – | – | – | – |
| OmniVoice | 0,6B | – | – | **0,729** | 4,28 | – | – | – |
| Qwen3-TTS | 0,6B-1,7B | – | – | 0,704 | 4,41 | – | – | – |
| Grabaciones reales | – | – | – | – | 4,10 | – | – | – |
| Inworld TTS-2 | – | – | – | – | – | 0,71 | – | – |
| MiMo-v2.5 | – | – | – | – | – | 0,66 | – | – |
| Qwen-Audio 3.0+ | – | – | – | – | – | 0,65 | – | – |
| StepAudio 2.5 | – | – | – | – | – | 0,64 | – | – |
| CosyVoice3 1.5B +DiffRO-EMO | 1,5B | – | – | – | – | – | **77,7** | – |
| Ming 0.5B | ~1B | – | – | – | – | – | 72,3 | – |
| CosyVoice3 0.5B | 0,5B | – | – | – | – | – | 66,3 | – |
| CosyVoice3 1.5B | 1,5B | – | – | – | – | – | 63,0 | – |
| Higgs TTS 3 | 4B | – | – | – | – | – | – | 0,147 |

Velocidad medida con el motor `lure-tts`, backend CUDA en bf16:

| Hardware | Modelo | Streams | ms por frame | RTF |
|---|---|---|---|---|
| H100 | Lure | 1 | 18,4 | 0,23 |
| H100 | Lure | 8 | 19,6 | 0,25 |
| H100 | Lure Turbo | 1 | **11,4** | **0,14** |
| H100 | Lure Turbo | 8 | 12,4 | 0,15 |

En GPU de 24 GB: Lure alcanza 28,8 frames/s (2,3x tiempo real) con 1 stream y 219 frames/s (17x tiempo real) con 8 streams; Lure Turbo alcanza 50,6 frames/s (4,0x tiempo real) con 1 stream y 374 frames/s (30x tiempo real) con 8 streams.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa 2,5 GB en safetensors, y la model card cita ejecución en bf16 en GPU de 24 GB para 8 streams concurrentes.
- GPU recomendadas: H100 para los datos de latencia publicados; GPU de 24 GB (por ejemplo, RTX 4090 o A100 de 40 GB) validada para 8 streams concurrentes.
- Cabe en GPU de consumo: la model card afirma ejecución más rápida que tiempo real en un MacBook (backend MLX) y menciona backend CPU; no se detallan requisitos mínimos de VRAM para GPU de consumo.
- Opciones de despliegue: motor propio `lure-tts` (recomendado, con streaming, soporte de Turbo y backends Mac/NVIDIA/CPU), backend MLX para Mac, backend CUDA en bf16, modo servidor (`.[server]`) y compilación C++ según el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,23 (Lure) y 0,14 (Turbo) en H100 con un stream; 28,8 frames/s (Lure) y 50,6 frames/s (Turbo) con un stream en GPU de 24 GB; 219 y 374 frames/s respectivamente con 8 streams.

## Comparativa con modelos similares

| Modelo | Parámetros | Seed-TTS WER ↓ | Seed-TTS SIM ↑ | UTMOS ↑ | RTF ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Lure | 0,6B | 1,51 | 0,653 | 4,43 | 0,230 | Apache 2.0 | Hugging Face (research preview) |
| Qwen3-TTS 0.6B | 0,6B | 1,32 | – | – | – | no disponible | no disponible en la información |
| Ming 3.0 0.5B | ~1B | 1,58 | 0,691 | – | – | no disponible | no disponible en la información |
| Fish S2 Pro | 5B | 0,99 | – | – | 0,195 | no disponible | no disponible en la información |
| CosyVoice3 | no disponible | 2,22 | 0,720 | 4,28 | – | no disponible | no disponible en la información |

Frente a Qwen3-TTS 0.6B, Lure obtiene peor WER en Seed-TTS (1,51 frente a 1,32) pero es el único de la comparativa con UTMOS de 4,43, por encima de CosyVoice3 (4,28) y de las grabaciones reales (4,10). Frente a Fish S2 Pro (5B), Lure pierde en WER (1,51 frente a 0,99) pero es más rápido en H100 (RTF 0,23 frente a 0,195) y mucho menor en parámetros. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors son ventajas claras frente a alternativas cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado.
- Research preview: los pesos, el comportamiento y la model card pueden cambiar entre releases; se recomienda fijar una revisión concreta si se construye sobre el modelo.
- Riesgo de alucinación y errores de pronunciación: no se documentan tasas de error más allá del WER de Seed-TTS (1,51), y el modelo puede desviarse del texto en entradas no vistas; no hay datos sobre robustez ante texto fuera de dominio.
- Clonado de voz: la capacidad de clonar voces a partir de pocos segundos plantea riesgos de suplantación y uso indebido; la licencia Apache 2.0 no impone restricciones de uso comercial, por lo que la responsabilidad sobre consentimiento y legalidad recae en el integrador.
- Sesgos: no se documentan análisis de sesgo demográfico, acento o género en la información disponible.
- Contexto y referencia limitados: la clonación requiere una referencia de 3 a 12 segundos con su transcripción; no se especifica el límite de longitud del texto de entrada ni la longitud máxima de audio generado.
- Expresividad dependiente de etiquetas: los sonidos inline y las notas de dirección son mecanismos propietarios del modelo; su comportamiento fuera de las 36 etiquetas soportadas no está documentado.
- Despliegue: el motor recomendado es propio (`lure-tts`); no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, lo que puede limitar la integración en infraestructuras existentes.
- Cuantización: no se documentan tipos de cuantización soportados ni su impacto en calidad o latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tesslate/Lure-TTS-0.6B
- Variante Lure Turbo: https://huggingface.co/Tesslate/Lure-TTS-Turbo
- Demo en vivo (Space): https://huggingface.co/spaces/smirki/lure-tts
- Motor de inferencia: https://github.com/smirki/lure-tts
- Código de entrenamiento: https://github.com/smirki/lure-train
