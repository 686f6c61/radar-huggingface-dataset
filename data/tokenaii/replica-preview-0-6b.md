# tokenaii/Replica-Preview-0.6B

## Resumen

Replica Preview 0.6B es el primer modelo de texto a voz (TTS) de TokenAI y el punto de partida de la familia Replica. Se trata de un sistema TTS multilingüe no autorregresivo basado en difusión, construido sobre OmniVoice (k2-fsa/OmniVoice) y con un backbone lingüístico Qwen3-0.6B-Base. Su foco principal es el árabe egipcio (arz) con capacidad de code-switching árabe-inglés, además de un rendimiento sólido en inglés, francés, alemán y español.

El modelo resuelve el problema de generar voz natural y expresiva con sonidos no verbales (respiraciones, suspiros, risas, muletillas) y clonación de voz zero-shot a partir de una referencia corta. Con 612,6 millones de parámetros y un codec de audio HiggsAudioV2, ocupa unos 3,22 GB en total, lo que lo hace desplegable en GPUs de consumo con un consumo de VRAM de aproximadamente 2,5-3 GB en bf16.

Es relevante ahora porque cubre un nicho poco atendido: TTS de alta calidad para árabe egipcio con normalización de números y soporte de streaming con RTF de 0,153 (~6,5x tiempo real), bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo basado en difusión; LLM Qwen3-0.6B-Base + codec HiggsAudioV2 + 8 cabezas de audio |
| Parametros totales | 612.577.288 (LLM 595,8M + embeddings de audio 8,4M + cabezas de audio 8,4M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; inferencia documentada en bfloat16) |
| Idiomas soportados | 646 heredados de OmniVoice; optimizado para árabe egipcio (arz), inglés, francés, alemán y español; también ar, zh, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, 2,45 GB) + codec (0,77 GB) |

## Arquitectura y entrenamiento

Replica Preview 0.6B es un modelo TTS no autorregresivo que combina un LLM Qwen3-0.6B-Base como backbone con un codec de audio HiggsAudioV2Tokenizer (9 codebooks de 1024 entradas, hop 960, entrada a 16 kHz y salida a 24 kHz). Sobre el LLM se añaden 8 cabezas de audio con pesos [8, 8, 6, 6, 4, 4, 2, 2] y embeddings de audio de 8,4M de parámetros. La generación se realiza mediante difusión, lo que permite producir audio de forma paralela y rápida en lugar de token a token.

El modelo se presenta como un finetune de OmniVoice (k2-fsa/OmniVoice), del que hereda el soporte para 646 idiomas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Entre las innovaciones destacables están el streaming por fragmentos de frase con RTF de 0,153, la normalización automática de números árabes a palabras egipcias (por ejemplo, 5000 -> خمسة آلاف) y el soporte de marcadores de sonidos no verbales como `[inhale]`, `[exhale]`, `[sigh]`, `[laughter]` y `[laugh]`.

## Capacidades

- Generación de voz natural y expresiva a partir de texto, con salida a 24 kHz.
- Clonación de voz zero-shot a partir de un audio de referencia corto, con número ilimitado de hablantes.
- Voice Design: control de género, edad, tono, estilo y acento mediante instrucciones textuales.
- Selección automática de voz (auto voice).
- Sonidos no verbales: respiraciones, suspiros, risas y muletillas (`هممم`, `آه`, `ah`, `oh`, `Hmmm`, `phew`).
- Normalización de números: conversión de dígitos árabes a palabras egipcias.
- Streaming por fragmentos de frase con baja latencia.
- Multilingüe con 646 idiomas heredados, optimizado para árabe egipcio y code-switching árabe-inglés.
- Soporte de code-switching árabe-inglés (aunque es su punto más débil).

## Casos de uso

- Atención al cliente en árabe egipcio: el modelo puede generar respuestas de voz naturales en arz con muletillas y sonidos no verbales, lo que mejora la percepción de humanidad en IVR y asistentes telefónicos.
- Doblaje y localización de contenido: clonación de voz zero-shot para doblar vídeos o audiolibros a inglés, francés, alemán o español manteniendo la identidad del hablante original.
- Audiolibros y narración expresiva: el soporte de suspiros, risas y respiraciones permite narrar ficción con matices emocionales que un TTS plano no captura.
- Asistentes de voz en tiempo real: con RTF de 0,153 y TTFA de ~0,65 s, es adecuado para agentes conversacionales por voz con streaming por frases.
- Voice Design para prototipado: generar voces sintéticas con género, edad, tono y acento controlados sin necesidad de audio de referencia, útil para demos y pruebas de producto.
- Accesibilidad y lectura de pantalla: conversión de texto a voz multilingüe con normalización de números para leer cifras, fechas y cantidades en árabe egipcio de forma correcta.
- Contenido para redes sociales y podcasts: generación rápida de locuciones en varios idiomas con una sola GPU de consumo, ideal para creadores que necesitan iterar rápido.

## Benchmarks y rendimiento

Evaluación mediante CER de ida y vuelta (generar voz, transcribir con Whisper large-v3 y comparar con la entrada):

| Metrica | Valor |
|---|---|
| CER árabe egipcio | 0,066 - 0,086 |
| CER conversacional | 0,0937 |
| CER inglés | 0,041 |
| CER code-switching | 0,2488 - 0,270 |
| CER números | 0,00 - 0,26 |
| Tasa de fallo (CER > 0,2) | 0,03 |
| RTF (streaming) | 0,153 (~6,5x tiempo real) |
| TTFA (time-to-first-audio) | ~0,65 s |
| DNSMOS ovrl_mos | 3,35 (árabe) / 3,47 (inglés) |
| Similitud de hablante MFCC | 0,9985 (árabe) / 0,9972 (inglés) |
| Fidelidad de Voice Design | 0,999 |

Latencia: primera frase en streaming ~0,65 s; frase completa (~30 s de audio) ~2-4 s de tiempo de pared; RTF por lotes con num_step=8 ~0,01.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5-3 GB en bfloat16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en todas las RTX modernas con 4 GB o más.
- Opciones de despliegue: la librería `omnivoice` (documentada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: TTFA ~0,65 s en streaming; RTF 0,153 en streaming por frases y ~0,01 en modo por lotes con num_step=8.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Licencia | Contexto |
|---|---|---|---|---|---|
| Replica Preview 0.6B | 612,6M | 646 (optimizado arz, en, fr, de, es) | Sí | Apache 2.0 | no disponible |
| OmniVoice (base) | no disponible | 646 | no disponible | no disponible | no disponible |
| Qwen3-0.6B-Base | 595,8M (solo LLM) | multilingüe | no es TTS | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- El code-switching árabe-inglés es el área más débil, con CER de 0,2488-0,270.
- La pronunciación de números varía ocasionalmente ("خمس تلاف" frente a "خمسة آلاف").
- Requiere el tokenizer Higgs Audio V2 incluido en `audio_tokenizer/`; no es autónomo sin él.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible.
- El modelo está optimizado para árabe egipcio, inglés, francés, alemán y español; el rendimiento en los otros 641 idiomas heredados no está documentado.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar el archivo LICENSE del repositorio.
- Para producción, se recomienda la clonación de voz con audio de referencia; el modo Voice Design tiene fidelidad de 0,999 pero no se documentan métricas de naturalidad subjetiva (MOS humano).

## Enlaces

- Hugging Face: https://huggingface.co/tokenaii/Replica-Preview-0.6B
- Página oficial del modelo en TokenAI: https://tokenai.llc/projects/models/replica-preview-0.6b
- Página de la familia Replica Preview: https://tokenai.llc/projects/replica-preview
- Modelo base OmniVoice: https://huggingface.co/k2-fsa/OmniVoice
- LLM base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Web de TokenAI: https://assem.one
- Contacto: info@tokenai.llc
