# xix3r/voxix-whisper-small-gguf

## Resumen

Voxix-whisper-small-gguf es una conversión a formato GGUF del modelo openai/whisper-small, publicada por el usuario xix3r y preparada para su uso con transcribe.cpp, un motor de inferencia centrado en transcripción de audio. El modelo base es el conocido Whisper small de OpenAI, un transformer encoder-decoder de 241.751.392 parámetros entrenado con 680.000 horas de audio etiquetado mediante supervisión débil, diseñado para reconocimiento automático del habla (ASR) y traducción de voz a texto.

La aportación de esta ficha no es un modelo nuevo, sino una distribución cuantizada y validada del original para el ecosistema transcribe.cpp, con seis variantes de cuantización que van de F32 (924 MB) a Q4_K_M (164 MB). Incluye métricas de WER sobre LibriSpeech test-clean y datos de rendimiento en tiempo real (RTF) en Apple M4 Max y AMD Ryzen 4750U, lo que facilita evaluar su viabilidad en producción.

Es relevante ahora porque permite ejecutar un ASR multilingüe maduro en hardware modesto, con licencia Apache-2.0, soporte para detección de idioma, marcas de tiempo a nivel de segmento y traducción al inglés desde cualquiera de los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 241.751.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con transcribe.cpp) |

## Arquitectura y entrenamiento

Whisper small es un transformer encoder-decoder entrenado por OpenAI sobre 680.000 horas de audio etiquetado con supervisión débil. El modelo procesa audio en ventanas de 30 segundos y, para audio de mayor duración, emplea decodificación por chunks. La variante small forma parte de la familia multilingüe, entrenada conjuntamente para reconocimiento del habla (transcripción en el mismo idioma que el audio) y traducción del habla (transcripción al inglés desde cualquier idioma soportado).

Esta conversión concreta se ha portado desde el commit upstream 973afd2 de openai/whisper-small (fijado el 2026-04-25) y se ha validado contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp (2026-04-26). No se ha realizado ningún ajuste fino adicional: es una cuantización del modelo original. La model card no detalla la composición exacta del dataset de entrenamiento ni si hubo etapas de RLHF o DPO, más allá de la supervisión débil masiva descrita en el paper original.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, incluyendo español, catalán, gallego y euskera.
- Detección automática de idioma (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquier idioma soportado (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante ventanas de 30 segundos y decodificación por chunks.
- Robustez ante dominios y datasets no vistos sin necesidad de ajuste fino, según el paper original.
- No soporta streaming (`streaming: false`).
- No es un modelo de texto ni de propósito general: no hace tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio en ventanas de 30 segundos con decodificación por chunks, lo que permite transcribir grabaciones largas en local sin depender de servicios en la nube.
- Subtitulado automático de vídeo: las marcas de tiempo a nivel de segmento facilitan la generación de subtítulos sincronizados para plataformas de contenido.
- Traducción de audio a inglés: útil para organizaciones que reciben material audiovisual en cualquiera de los 99 idiomas soportados y necesitan una versión en inglés para su revisión.
- Transcripción en dispositivos de borde: la variante Q4_K_M ocupa 164 MB, lo que permite desplegarla en equipos con recursos limitados o incluso en entornos integrados con CPU.
- Análisis de llamadas de atención al cliente: transcripción local de conversaciones para extraer texto sobre el que aplicar posteriormente análisis de sentimiento o búsqueda, sin enviar audio a terceros.
- Accesibilidad: generación de transcripciones para contenido educativo o institucional en múltiples idiomas, con detección automática del idioma de entrada.
- Documentación de investigación cualitativa: transcripción por lotes de entrevistas en distintos idiomas con una única tubería basada en transcribe.cpp.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean (F32) | 3,33 % |
| WER LibriSpeech test-clean (F16) | 3,34 % |
| WER LibriSpeech test-clean (Q8_0) | 3,33 % |
| WER LibriSpeech test-clean (Q6_K) | 3,33 % |
| WER LibriSpeech test-clean (Q5_K_M) | 3,37 % |
| WER LibriSpeech test-clean (Q4_K_M) | 3,40 % |
| WER de referencia reportado por OpenAI (mismo split) | 3,432 % |
| RTF en Apple M4 Max (Metal) | 99,2 |
| RTF en Apple M4 Max (CPU) | 9,8 |
| RTF en AMD Ryzen 4750U (Vulkan) | 12,1 |
| RTF en AMD Ryzen 4750U (CPU) | 3,4 |

Las cifras de WER se midieron sobre el split completo de LibriSpeech test-clean (2.620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback y marcas de tiempo de segmento activadas). La model card advierte de que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones. El RTF se expresa como factor de tiempo real; los valores indicados corresponden a los datos publicados en la model card.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; la variante F32 ocupa 924 MB y la Q4_K_M 164 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; en la model card se reportan mediciones en Apple M4 Max y AMD Ryzen 4750U con gráficos integrados.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna, e incluso en CPU sin aceleración dedicada.
- Opciones de despliegue: transcribe.cpp (único runtime indicado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 99,2 en M4 Max con Metal, 12,1 en Ryzen 4750U con Vulkan, 9,8 en M4 Max con CPU y 3,4 en Ryzen 4750U con CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| voxix-whisper-small-gguf (esta ficha) | 241,7 M | ventanas de 30 s | 99 | Apache-2.0 | GGUF |
| openai/whisper-small (original) | 241,7 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors/PyTorch |
| Otras variantes de Whisper small | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos con modelos ASR alternativos de tamaño similar (por ejemplo, variantes de Wav2Vec2 o modelos ASR comerciales), por lo que la comparativa se limita al modelo base del que deriva esta conversión.

## Limitaciones y advertencias

- Es una cuantización del modelo original: no incorpora mejoras de precisión respecto a openai/whisper-small.
- No soporta streaming; la inferencia requiere audio completo o procesado por chunks.
- El WER puede degradarse en audio con ruido, acentos marcados o dominios alejados de los datos de entrenamiento, como ocurre con el modelo base.
- Riesgo de alucinación en clips cortos o con ruido de fondo, tal como señala la model card al comentar la variabilidad del WER.
- El rendimiento depende del runtime transcribe.cpp; no se garantiza compatibilidad con otros motores GGUF sin validación adicional.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar la model card original de OpenAI para los términos completos.
- La model card no detalla sesgos específicos por idioma o variedad dialectal; se remite a la documentación del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera de la validación reportada por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/xix3r/voxix-whisper-small-gguf
- Modelo base: https://huggingface.co/openai/whisper-small
- Commit upstream fijado: https://huggingface.co/openai/whisper-small/commit/973afd2
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-small.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
