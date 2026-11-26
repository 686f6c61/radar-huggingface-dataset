# stevyhacker/Qwen3-ASR-1.7B-LokalBot-GGUF

## Resumen

Qwen3-ASR-1.7B-LokalBot-GGUF es una cuantización y ajuste fino del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, publicada por el desarrollador stevyhacker. El objetivo es ofrecer una variante lista para usar en LokalBot, una herramienta de transcripción de reuniones y dictado por voz que se ejecuta en el dispositivo mediante `llama.cpp` y `llama-server`. El modelo incorpora dos checkpoints: una versión `v3` que ajusta tanto el decodificador como las cuatro capas superiores del codificador de audio y el proyector multimodal, y una versión `v2` que solo ajusta el decodificador.

La relevancia del modelo reside en su enfoque en lenguas eslavas del sur (serbio, croata y bosnio), en el cambio de código bilingüe y en la robustez frente a silencios y ruido ambiental en escenarios de dictado. Según la model card, el ajuste reduce el WER de forma notable en estas lenguas y en code-switching, manteniendo un rendimiento estable en lenguas de guarda como inglés, alemán, francés, español y ruso. Todo el entrenamiento se realizó con corpus públicos con licencias CC0 y CC-BY-4.0, sin datos privados ni corpus no comerciales.

El modelo se distribuye en formato GGUF con cuantización Q8_0, con un tamaño combinado de aproximadamente 2,52 GB (2,165 GB de decodificador y 355,7 MB de `mmproj`). Está pensado para inferencia en hardware de consumo, con un rendimiento declarado de 31,24 veces tiempo real en un Apple M4 Max con Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de ASR (codificador de audio + proyector + decodificador de lenguaje), basado en Qwen3-ASR-1.7B |
| Parametros totales | 2.031.739.904 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada) |
| Idiomas soportados | en, sr, hr, bs, de, fr, es, ru, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (decodificador + `mmproj` para el codificador de audio y proyector) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema de reconocimiento automático del habla que combina un codificador de audio (audio tower), un proyector multimodal que alinea las representaciones acústicas con el espacio del decodificador, y un decodificador de lenguaje de tipo transformer. La variante LokalBot introduce ajustes finos mediante LoRA: en la versión `v3` se aplica un LoRA de rango 32 al decodificador y un LoRA de rango 16 a las cuatro capas superiores del codificador de audio y al proyector, con una tasa de aprendizaje acústica diferencial de 0,4× y un factor de escala de 1,15. La versión `v2` solo ajusta el decodificador con escala 1,0 y utiliza el `mmproj` original sin modificar.

El entrenamiento se realizó exclusivamente con corpus públicos con licencias permisivas: `google/fleurs` (train), `classla/ParlaSpeech-RS` (train, CC-BY-4.0), `facebook/voxpopuli` para croata e inglés (train, CC0), `edinburghcstr/ami` en las condiciones `ihm` y `sdm` (train, CC-BY-4.0), además de datos sintéticos libres de licencia para ruido, reverberación, silencio y cambio de código. No se utilizaron corpus CC-BY-SA, no comerciales ni grabaciones privadas de usuarios, y los conjuntos de entrenamiento están estrictamente disjuntos de los de desarrollo, holdout y AMI-400. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) para transcripción de audio a texto.
- Transcripción de reuniones en entornos de micrófono cercano (`ihm`) y de campo lejano (`sdm`), con mejora específica en el conjunto AMI.
- Dictado por voz con sesgo de vocabulario personalizado: permite primar términos concretos mediante un prompt de vocabulario, con una tasa de recuerdo declarada del 100,0 % y un WER del 4,00 % en la prueba de sesgo.
- Abstención limpia ante silencios y ruido ambiental: 100,0 % de tasa limpia, sin ecos del prompt ni palabras alucinadas en las pruebas de dictado.
- Cambio de código bilingüe (`sr+en`, `en+de`) con un WER del 12,81 % en el holdout ciego.
- Soporte de lenguas eslavas del sur: serbio, croata y bosnio, con un WER del 17,79 % en modo automático y del 17,59 % con `hr` fijado.
- Capacidades multilingües de guarda en inglés, alemán, francés, español y ruso, con un WER del 4,53 % en el holdout ciego.
- Compatibilidad con endpoints (`endpoints_compatible`) para su integración en servicios de inferencia.
- No se dispone de información sobre soporte de tool calling, agentes o razonamiento multi-paso, ya que el modelo está especializado en ASR.

## Casos de uso

- Transcripción de reuniones en local: el modelo puede procesar audio de reuniones grabadas con micrófono cercano o de campo lejano, con un WER del 9,79 % en `ihm` y del 24,41 % en `sdm` sobre el conjunto AMI-400, lo que lo hace adecuado para actas automáticas en herramientas de escritorio.
- Dictado por voz en aplicaciones de productividad: gracias a la abstención limpia ante silencios y ruido (100,0 % de tasa limpia) y al sesgo de vocabulario personalizado, puede integrarse en editores de texto o asistentes de escritura sin generar texto espurio cuando el usuario no habla.
- Transcripción para lenguas eslavas del sur: con un WER del 17,79 % en serbio, croata y bosnio, es una opción práctica para herramientas de subtitulado o documentación en estos idiomas, donde muchos modelos multilingües genéricos tienen un rendimiento inferior.
- Soporte de cambio de código en entornos bilingües: adecuado para transcripciones de conversaciones que alternan serbio e inglés o inglés y alemán, con un WER del 12,81 %, útil en equipos internacionales o en atención al cliente multilingüe.
- Subtitulado y postproducción de audio: el modelo puede transcribir material audiovisual con ruido y reverberación, y su capacidad de sesgo de vocabulario permite fijar nombres propios, marcas o terminología técnica para reducir errores.
- Integración en pipelines de CI/CD para procesamiento de audio: al ser compatible con endpoints y con `llama-server`, puede desplegarse como servicio interno para transcribir llamadas, notas de voz o grabaciones de soporte de forma automatizada.
- Herramientas de accesibilidad: transcripción en tiempo real de voz a texto para personas con dificultades auditivas, con un rendimiento de 31,24 veces tiempo real en Apple M4 Max, lo que permite procesar audio más rápido que en tiempo real en hardware de consumo.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan la versión `v3` con el modelo original (`stock`) y con la versión `v2`, usando decodificación greedy idéntica (`temperature=0`, `top_k=1`, `repeat_penalty=1.0`) y las plantillas de prompt de producción de LokalBot, sobre un holdout ciego de 466 clips y el conjunto AMI-400.

| Prueba | Stock Q8_0 | v2 (s=1.0, enc. congelado) | v3 (s=1.15, top-4 enc.) | Delta v3 vs stock |
|---|---:|---:|---:|---:|
| Eslavo del sur (`sr`/`hr`/`bs`) `auto` WER | 24,64 % | 17,96 % | 17,79 % | -6,85 pp |
| Eslavo del sur (`sr`/`hr`/`bs`) `hr` fijado WER | 24,60 % | 18,00 % | 17,59 % | -7,01 pp |
| Croata OOD (`VoxPopuli hr`) `auto` / `hr` | 24,95 % / 22,59 % | 18,86 % / 19,65 % | 19,06 % / 18,66 % | -5,89 / -3,93 pp |
| Cambio de código (`sr+en`, `en+de`) WER | 37,12 % | 14,39 % | 12,81 % | -24,31 pp |
| Tasa limpia en silencio/ruido de dictado | 8,3 % (16 ecos, 123 palabras) | 100,0 % (0 ecos, 0 palabras) | 100,0 % (0 ecos, 0 palabras) | +91,7 pp |
| Recuerdo de vocabulario / WER en dictado | 86,7 % / 9,00 % | 100,0 % / 5,00 % | 100,0 % / 4,00 % | +13,3 pp / -5,00 pp |
| WER con distractores en dictado (0 inyecciones) | 13,83 % | 12,41 % | 11,35 % | -2,48 pp |
| AMI holdout (`n=25` cada uno) `ihm` / `sdm` | 7,91 % / 24,86 % | 8,54 % / 26,0 % (dato truncado en la informacion) | no disponible | no disponible |
| AMI-400 ampliado `ihm` / `sdm` | 10,24 % / 26,08 % | 26,04 % (`sdm`) | 9,79 % / 24,41 % | -0,45 / -1,67 pp |
| Lenguas de guarda (`en`/`de`/`fr`/`es`/`ru`) WER | 4,35 % | no disponible | 4,53 % | +0,18 pp |
| Rendimiento en tiempo real (Apple M4 Max Metal) | 28,53× (31,34× en AMI-400) | no disponible | 31,24× (31,69× en AMI-400) | superior |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser una cuantización Q8_0 con un decodificador de 2,165 GB y un `mmproj` de 355,7 MB, el peso combinado es de aproximadamente 2,52 GB. La VRAM necesaria será algo superior por el contexto y los buffers de audio, aunque no se especifica una cifra exacta en la información disponible.
- GPU recomendadas: no se detallan modelos concretos de GPU en la información proporcionada. El benchmark de referencia se realizó en una Apple M4 Max con backend Metal.
- Cabe en GPU de consumo: por el tamaño de los pesos (2,52 GB combinados), es plausible en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: `llama.cpp` mediante `llama-server`, con soporte de `mmproj` para el codificador de audio. El modelo está marcado como `endpoints_compatible`, lo que facilita su integración en servicios de inferencia. No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 31,24 veces tiempo real en el holdout ciego y 31,69 veces tiempo real en AMI-400 sobre Apple M4 Max con Metal, frente a 28,53× y 31,34× del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER eslavo del sur (auto) | WER code-switching | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| Qwen3-ASR-1.7B-LokalBot v3 | 2.031.739.904 | no disponible | 17,79 % | 12,81 % | Apache 2.0 | GGUF Q8_0 |
| Qwen3-ASR-1.7B-LokalBot v2 | 2.031.739.904 | no disponible | 17,96 % | 14,39 % | Apache 2.0 | GGUF Q8_0 |
| Qwen3-ASR-1.7B (stock, ggml-org) | 2.031.739.904 | no disponible | 24,64 % | 37,12 % | Apache 2.0 | GGUF Q8_0 |

No se dispone en la información proporcionada de comparaciones con otros modelos ASR de la misma categoría (por ejemplo, Whisper o alternativas multilingües), por lo que la comparativa se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- El ajuste está orientado específicamente a lenguas eslavas del sur y a code-switching con inglés y alemán; el rendimiento en otras lenguas puede no ser óptimo.
- El WER en campo lejano (`sdm`) sigue siendo elevado (24,41 % en AMI-400), lo que limita su uso en entornos con mucho ruido o micrófonos distantes.
- En lenguas de guarda (`en`/`de`/`fr`/`es`/`ru`) el WER es ligeramente superior al modelo original (4,53 % frente a 4,35 %), un pequeño retroceso que debe tenerse en cuenta si el uso principal es en esas lenguas.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en condiciones no evaluadas, ni límites de longitud de contexto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los corpus de entrenamiento y las obligaciones de atribución de los datos CC-BY-4.0.
- El modelo está especializado en ASR y no se documentan capacidades de razonamiento, tool calling o agentes; no debe emplearse como modelo de lenguaje general.
- La información disponible no detalla requisitos mínimos de hardware ni cifras de latencia en GPU distintas de Apple M4 Max, por lo que el rendimiento en otras plataformas es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stevyhacker/Qwen3-ASR-1.7B-LokalBot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio LokalBot: https://github.com/stevyhacker/LokalBot
- GGUF original de ggml-org: https://huggingface.co/ggml-org/Qwen3-ASR-1.7B-GGUF
- Corpus FLEURS: https://huggingface.co/datasets/google/fleurs
- Corpus ParlaSpeech-RS: https://huggingface.co/datasets/classla/ParlaSpeech-RS
- Corpus VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Corpus AMI: https://huggingface.co/datasets/edinburghcstr/ami
