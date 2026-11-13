# xix3r/voxix-Voxtral-Small-24B-2507-gguf

## Resumen

Voxtral-Small-24B-2507 es un modelo de audio-LLM desarrollado por Mistral AI que combina un codificador de audio bidireccional basado en Whisper-large-v3 con un decodificador causal Mistral-Small-24B. Resuelve tareas de transcripción de voz (ASR), traducción de voz y comprensión de audio, manteniendo un rendimiento de texto de primer nivel. Esta ficha concreta documenta la conversión a formato GGUF publicada por el usuario xix3r para su uso con la librería transcribe.cpp, lo que permite ejecutar el modelo en entornos de inferencia locales sin depender del stack de Transformers.

La arquitectura inyecta tokens de audio (375 tokens por fragmento de 30 segundos) en el decodificador de lenguaje a través de un proyector de 4 grupos de frames. Con 24 261 827 088 parámetros totales y una ventana de contexto de 32 000 tokens, el modelo puede procesar audios de hasta 30 minutos para transcripción y 40 minutos para comprensión. Es relevante porque ofrece una alternativa abierta (Apache-2.0) a soluciones propietarias de ASR de gran escala, con soporte multilingüe en ocho idiomas y la posibilidad de ejecución local mediante cuantización.

La versión GGUF aquí descrita incluye múltiples niveles de cuantización (BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) con métricas de WER publicadas, lo que facilita la evaluación del compromiso entre tamaño y precisión. El repositorio ocupa 174,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador Whisper-large-v3 + proyector + decodificador Mistral-Small-24B (transformer causal, 40 capas, GQA 32/8, NEOX RoPE, SwiGLU) |
| Parametros totales | 24 261 827 088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 000 tokens (hasta 30 min de audio para transcripcion, 40 min para comprension) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de audio-LLM con inyección de tokens. Un codificador de audio bidireccional derivado de Whisper-large-v3 procesa la señal de entrada y un proyector de 4 grupos de frames genera 375 tokens de audio por cada fragmento de 30 segundos. Estos tokens se inyectan en un decodificador causal Mistral-Small-24B de 40 capas con atención GQA (32 cabezas de consulta, 8 de clave/valor), RoPE en variante NEOX y activación SwiGLU. La entrada es un WAV mono a 16 kHz y la decodificación es greedy.

El modelo base es una mejora de Mistral Small 3 que incorpora capacidades de audio manteniendo el rendimiento de texto. Según la model card original, Voxtral opera por defecto en modo de transcripción pura, prediciendo automáticamente el idioma del audio. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión GGUF fue portada desde el commit upstream da5b424 (fijado el 2026-06-05) y validada contra la referencia de Transformers en el commit dac22fa de transcribe.cpp.

## Capacidades

- Transcripción de voz (ASR) en modo dedicado, con detección automática del idioma de origen.
- Traducción de voz (speech translation) entre los idiomas soportados.
- Comprensión de audio: preguntas y respuestas directas sobre el contenido del audio.
- Resumen de audio (summarization).
- Procesamiento de audio de larga duración: hasta 30 minutos para transcripción y 40 minutos para comprensión.
- Soporte multilingüe en ocho idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi.
- Detección de idioma integrada (lang_detect: true).
- No soporta streaming (streaming: false).
- No genera timestamps (timestamps: none).

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de hasta 30 minutos en una sola pasada gracias a su contexto de 32 000 tokens, generando la transcripción completa con detección automática del idioma de los participantes.
- Subtitulado y traducción de contenido audiovisual: con soporte de traducción de voz, permite generar subtítulos traducidos entre los ocho idiomas disponibles, útil para localización de vídeos y pódcasts.
- Atención al cliente basada en voz: la capacidad de comprensión de audio permite responder preguntas directamente sobre grabaciones de llamadas, extrayendo información y resumiendo incidencias sin transcripción intermedia.
- Análisis de entrevistas y investigación cualitativa: el modo de comprensión de audio permite hacer preguntas sobre entrevistas de hasta 40 minutos, resumiendo temas y extrayendo citas relevantes.
- Despliegue local en entornos con requisitos de privacidad: al estar disponible en GGUF y ejecutarse con transcribe.cpp, puede correr en infraestructura propia sin enviar audio a servicios externos, con cuantizaciones desde Q4_K_M (14,30 GB) hasta BF16 (48,54 GB).
- Generación de notas a partir de clases o conferencias: la transcripción en modo dedicado con detección de idioma facilita la conversión de grabaciones académicas en texto estructurado para su posterior resumen.
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp acepta WAV de 16 kHz mono y permite automatizar la transcripción de colecciones de audio en pipelines locales.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2 620 enunciados, batch size 8, timestamps none, decodificación greedy, normalizador de texto inglés de Whisper, NVIDIA A100 80 GB):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 48,54 GB | 1,56 % |
| F16 | 48,55 GB | 1,57 % |
| Q8_0 | 25,81 GB | 1,56 % |
| Q6_K | 19,94 GB | 1,58 % |
| Q5_K_M | 17,14 GB | 1,60 % |
| Q4_K_M | 14,30 GB | 2,11 % |

Referencia en la misma máquina con HuggingFace Transformers (VoxtralForConditionalGeneration, BF16, greedy): 1,57 %. El GGUF BF16 iguala en 1,56 %.

WER por idioma en FLEURS con cuantización Q8_0:

| Idioma | WER FLEURS (Q8_0) |
|---|---:|
| Italiano | 2,69 % |
| Español | 2,86 % |
| Alemán | 3,29 % |
| Inglés | 3,55 % |
| Portugués | 3,74 % |
| Francés | 3,86 % |
| Neerlandés | 5,12 % |
| Hindi | 7,40 % |

Rendimiento en hardware Apple: RTF (real-time factor) de 2,44 en un M4 Max con backend Metal. No se han publicado resultados de benchmarks de texto (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,3 GB para Q4_K_M, 17,1 GB para Q5_K_M, 19,9 GB para Q6_K, 25,8 GB para Q8_0 y 48,5 GB para BF16/F16.
- GPU recomendadas: NVIDIA A100 80 GB para las validaciones publicadas; para cuantizaciones Q8_0 o inferiores, GPUs con 24 GB o más (RTX 3090, RTX 4090, A10G) son suficientes en términos de memoria.
- Cabe en GPU de consumo: sí, al menos con Q4_K_M (14,3 GB) y Q5_K_M (17,1 GB) en tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 20-24 GB.
- Opciones de despliegue: transcribe.cpp (librería nativa con CLI `transcribe-cli` y backend Metal validado en Apple Silicon). No se documentan otras opciones de despliegue en la información disponible.
- Latencia y throughput: RTF de 2,44 en M4 Max con Metal (Q8_0 implícito en la métrica publicada); no se dispone de cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| Voxtral-Small-24B-2507 (esta ficha, GGUF) | 24,26 B | 32 000 tokens | 8 | Apache-2.0 | GGUF |
| Voxtral Mini 3B | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Whisper-large-v3 (codificador base) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada menciona a Voxtral Mini 3B como el hermano menor con el mismo codificador, proyector, frontend y tokenizador, pero con decodificador de menor escala. No se dispone de especificaciones detalladas de modelos alternativos comparables en la información disponible.

## Limitaciones y advertencias

- No soporta streaming: la inferencia es offline sobre archivos completos, lo que impide su uso en transcripción en tiempo real.
- No genera timestamps, lo que limita su uso en subtitulado con sincronización temporal.
- El WER empeora notablemente en hindi (7,40 % en FLEURS con Q8_0) y neerlandés (5,12 %) en comparación con italiano o español (por debajo del 3 %).
- La cuantización Q4_K_M duplica aproximadamente el WER en LibriSpeech test-clean respecto a Q8_0 (2,11 % frente a 1,56 %), por lo que conviene evaluar el compromiso precisión/memoria en producción.
- No se han publicado en la información disponible datos sobre sesgos, riesgo de alucinación ni comportamiento en dominios con ruido o acentos no representados.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y debe verificarse en la model card upstream; el repositorio incluye LICENSE y NOTICE con la trazabilidad de la derivación.
- La validación numérica a nivel de tensor se establece por el hermano Voxtral Mini 3B; para esta variante la validación es end-to-end mediante WER.
- El repositorio GGUF no registra descargas ni likes, y la conversión está fijada a commits concretos (upstream da5b424, transcribe.cpp dac22fa), lo que puede afectar a la reproducibilidad si esos commits cambian.

## Enlaces

- Repositorio Hugging Face de esta conversión GGUF: https://huggingface.co/xix3r/voxix-Voxtral-Small-24B-2507-gguf
- Modelo base en Hugging Face: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
- Commit upstream de referencia: https://huggingface.co/mistralai/Voxtral-Small-24B-2507/commit/da5b424
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/dac22fa
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-small-24b-2507.md
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper de investigación: https://arxiv.org/abs/2507.13264
- Licencia en el repositorio: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/blob/main/LICENSE
- NOTICE en el repositorio: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/blob/main/NOTICE
