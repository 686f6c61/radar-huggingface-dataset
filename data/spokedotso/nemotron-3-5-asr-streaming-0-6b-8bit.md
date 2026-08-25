# spokedotso/nemotron-3.5-asr-streaming-0.6b-8bit

## Resumen

El modelo `spokedotso/nemotron-3.5-asr-streaming-0.6b-8bit` es una distribución fijada por Spoke del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, convertido a formato MLX con cuantización de 8 bits. Desarrollado originalmente por NVIDIA, el modelo base es un sistema de transcripción streaming de baja latencia basado en arquitectura FastConformer-RNNT, con 600 millones de parámetros anunciados (238.932.768 pesos reales en safetensors). Está diseñado para transcribir voz en texto en tiempo real, con soporte de puntuación y capitalización automáticas, y condicionamiento por idioma mediante prompts de identificación de lenguaje.

La relevancia actual de este modelo reside en su capacidad para operar en streaming con perfiles de atención entrenados que permiten ajustar el equilibrio entre latencia y precisión, y en su soporte multilingüe de 40 idiomas. La conversión MLX realizada por la comunidad permite ejecutarlo de forma eficiente en hardware Apple Silicon, mientras que el modelo base de NVIDIA también puede desplegarse con Transformers para GPU convencionales. La licencia OpenMDW 1.1, aunque de código abierto, impone restricciones específicas de uso comercial que conviene revisar antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT (streaming, cache-aware) |
| Parámetros totales | 238.932.768 (el modelo se anuncia como 0.6B, pero los pesos reales son ~239M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (group size 64) en capas Linear y Embedding; convoluciones y normalización en bfloat16 |
| Idiomas soportados | en, es, de, fr, it, ar, ja, ko, pt, ru, hi, zh, vi, he, nl, cs, da, pl, no, sv, th, tr, bg, el, et, fi, hr, hu, lt, lv, ro, sk, uk, mt, sl (40 idiomas) |
| Licencia | OpenMDW License Agreement 1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-RNNT, una variante del encoder FastConformer (basado en convoluciones con atención) combinado con un decodificador RNNT (Recurrent Neural Network Transducer). El diseño es cache-aware, es decir, está optimizado para streaming con memoria de estado interna que evita recalcular la historia completa en cada paso. Incluye condicionamiento por identificador de idioma (language-ID prompt conditioning), lo que permite al modelo adaptar su salida al idioma detectado, y produce texto con puntuación y capitalización automáticas.

La conversión MLX de 8 bits se realizó con `mlx-audio` por la comunidad MLX, y esta distribución de Spoke la fija en una revisión concreta. Los detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de RLHF/DPO) no están disponibles en la información proporcionada. El modelo expone cuatro perfiles de atención entrenados (`[56,3]`, `[56,0]`, `[56,6]`, `[56,13]`), que permiten ajustar el equilibrio entre latencia y precisión; el perfil `[56,13]` ofrece el menor WER en modo offline.

## Capacidades

- Transcripción de voz a texto en streaming con baja latencia, pensado para uso en tiempo real.
- Soporte multilingüe de 40 idiomas, incluyendo español, inglés, alemán, francés, italiano, portugués, japonés, coreano, chino, árabe, hindi, ruso, y otros.
- Puntuación y capitalización automáticas en el texto transcrito.
- Condicionamiento por identificador de idioma, que permite adaptar la decodificación al idioma detectado.
- Cuatro perfiles de atención entrenados para ajustar el balance entre latencia y precisión según el caso de uso.
- Cuantización de 8 bits de las capas lineales y de embedding, lo que reduce el tamaño y el consumo de memoria sin degradación significativa en tareas de ASR.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modelo puede transcribir conversaciones multi-participante con baja latencia, generando subtítulos en vivo en 40 idiomas. La puntuación automática facilita la lectura posterior del texto generado.
- Subtitulado en directo de vídeo: integrado en un pipeline de streaming, el modelo puede generar subtítulos de forma casi instantánea para emisiones en directo, con la posibilidad de elegir el perfil de atención que minimice la latencia para este escenario.
- Asistentes de voz por comando: la arquitectura RNNT con streaming permite que el modelo transcriba parcialmente mientras el usuario habla, lo que reduce el tiempo de respuesta en sistemas de interacción por voz.
- Atención al cliente automatizada: integrado en un centro de llamadas, puede transcribir conversaciones de clientes en tiempo real para análisis posterior, análisis de sentimiento o detección de problemas, gracias a su soporte multilingüe.
- Traducción automática de voz (pipeline): aunque el modelo solo produce texto, puede combinarse con un modelo de traducción para crear un sistema de subtitulado multilingüe en tiempo real, ya que la transcripción es el primer paso del proceso.
- Despliegue en hardware Apple Silicon: gracias a la conversión MLX, el modelo puede ejecutarse en Macs con chips M1/M2/M3, lo que permite aplicaciones de transcripción locales sin depender de servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base de NVIDIA podría tener métricas de WER en el paper técnico o en la documentación oficial, pero no se han incluido en la información proporcionada. No se inventan datos.

## Requisitos de hardware

- El repositorio pesa 0.8 GB, por lo que la inferencia es viable en GPU de consumo (8 GB de VRAM o menos) con la cuantización de 8 bits.
- En hardware Apple Silicon, la conversión MLX permite ejecutarlo en la CPU/GPU unificada de los chips M-series, sin necesidad de GPU dedicada.
- En GPU convencionales, el modelo base de NVIDIA se puede desplegar con Hugging Face Transformers o con NeMo, usando vLLM o TGI si se necesita servir HTTP.
- La latencia en streaming depende del perfil de atención elegido y del hardware; no se dispone de medidas concretas en la información proporcionada.
- Para inferencia en batch, el modelo también soporta alto throughput, pero la documentación de NVIDIA indica que es especialmente eficiente en streaming.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos ASR similares (como Whisper de OpenAI, Parakeet de NVIDIA o Wav2Vec2 de Meta) en términos de rendimiento y benchmarks. No se han publicado en el modelo ni en la documentación disponibles datos de WER, latencia o comparaciones con otras arquitecturas. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- La licencia OpenMDW 1.1 no es una licencia de código abierto estándar (ni MIT ni Apache 2.0); antes de usar comercialmente, hay que revisar las condiciones específicas, especialmente en lo que respecta a la redistribución y a la responsabilidad.
- El modelo está pensado para ASR y no genera texto creativo ni respuestas conversacionales; su uso se limita a transcripción.
- La cuantización de 8 bits puede introducir una degradación leve de la precisión en comparación con el modelo original en bfloat16, aunque en ASR suele ser mínima.
- El modelo no incluye detección de voz (VAD) ni diarización de hablantes; estos pasos deben realizarse en un pipeline previo.
- El soporte de idiomas incluye 40 idiomas, pero la calidad puede variar según la disponibilidad de datos de entrenamiento para cada uno; los idiomas con menos recursos pueden tener un WER mayor.
- No se han publicado datos sobre sesgos o alucinaciones en la transcripción; como todo modelo ASR, puede inventar palabras en contextos de baja calidad de audio.

## Enlaces

- Modelo en Hugging Face (distribución de Spoke): https://huggingface.co/spokedotso/nemotron-3.5-asr-streaming-0.6b-8bit
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Conversión MLX de la comunidad: https://huggingface.co/mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit
- Documentación de Transformers: https://huggingface.co/docs/transformers/main/model_doc/nemotron3_5_asr
- Tutorial de despliegue (AI Indigo): https://aiindigo.com/tutorials/getting-started-with-nemotron-3-5-asr-streaming-real-time-low-latency-transcript
- Implementación de referencia en GitHub: https://github.com/tehtommeh/nemotron-asr-streaming
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
