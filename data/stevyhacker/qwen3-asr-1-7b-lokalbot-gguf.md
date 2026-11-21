# stevyhacker/Qwen3-ASR-1.7B-LokalBot-GGUF

## Resumen

Qwen3-ASR-1.7B-LokalBot-GGUF es una cuantizacion Q8_0 en formato GGUF de un ajuste fino mediante LoRA sobre el modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-1.7B. El modelo lo publica el desarrollador stevyhacker como parte del proyecto LokalBot, una herramienta de transcripcion de reuniones y dictado por voz que se ejecuta en local a traves de llama.cpp (llama-server). El objetivo del ajuste es mejorar el rendimiento en lenguas eslavas del sur (serbio, croata y bosnio), en situaciones de cambio de codigo (code-switching) y en la gestion de silencios y ruido ambiental durante el dictado, manteniendo intacto el resto de idiomas soportados por el modelo base.

El modelo resuelve un problema concreto: el modelo original de Qwen presenta tasas de error elevadas en serbio, croata y bosnio, ademas de alucinar texto en clips de silencio o ruido y de degradarse cuando el hablante alterna idiomas dentro de una misma frase. El ajuste fino corrige estas debilidades sin sacrificar los idiomas de guardia (ingles, aleman, frances, espanol y ruso) ni el rendimiento en reuniones del corpus AMI.

La arquitectura es la del modelo base de Qwen, un transformer decoder-only con una torre de audio congelada durante el entrenamiento. El repositorio contiene dos ficheros: el decodificador ajustado en Q8_0 (2,165 GB) y el proyector de audio (mmproj) sin modificar en Q8_0 (355,7 MB). La licencia es Apache 2.0 y el modelo esta pensado para inferencia en local, con un rendimiento medido de 29,1 veces en tiempo real sobre un Apple M4 Max con Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con torre de audio (base Qwen3-ASR), ajuste fino LoRA |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | en, sr, hr, bs, de, fr, es, ru, ja, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (decodificador Q8_0 + mmproj Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA del decodificador de Qwen3-ASR-1.7B, manteniendo la torre de audio (audio_tower.*) completamente congelada durante el entrenamiento. El resultado es un par de ficheros GGUF: el decodificador ajustado (v2, scale=1.0) en Q8_0 y el proyector de audio (mmproj) sin modificar, que es bit a bit identico al del repositorio oficial ggml-org/Qwen3-ASR-1.7B-GGUF. El modelo base tiene 2.031.739.904 parametros y el repositorio ocupa 2,5 GB.

El entrenamiento se realizo exclusivamente con corpus de voz publicos con licencias CC0 y CC-BY-4.0: google/fleurs (train), classla/ParlaSpeech-RS (train, CC-BY-4.0), facebook/voxpopuli (hr y en, train, CC0) y edinburghcstr/ami (ihm y sdm, train, CC-BY-4.0, usado solo como ancla KL). Ademas se generaron datos sinteticos sin licencia para ruido, reverberacion, silencio y cambio de codigo. No se uso ningun corpus CC-BY-SA, no comercial ni grabaciones privadas, y los conjuntos de validacion y test son estrictamente disjuntos. Para preservar los idiomas de guardia se aplico un anclaje mediante divergencia KL con cobertura de masa (mass-covering Forward KL) contra el modelo original.

## Capacidades

- Reconocimiento automatico del habla multilingue en en, sr, hr, bs, de, fr, es, ru, ja y zh.
- Transcripcion de dictado por voz con gestion robusta de silencios y ruido ambiental: abstencion limpia del 100,0% en el conjunto de holdout ciego (0 ecos de prompt y 0 palabras alucinadas, frente a 8,3% de tasa limpia y 123 palabras alucinadas del modelo original).
- Cambio de codigo bilingue (sr+en y en+de) con WER del 14,39% en holdout ciego y 0,0% de deriva a alfabetos no latinos.
- Sesgo de vocabulario personalizado para dictado: 100,0% de recuperacion de terminos objetivo con 5,00% de WER, y 12,41% de WER en presencia de distractores con 0 inyecciones falsas de vocabulario.
- Transcripcion de reuniones (corpus AMI, condiciones ihm y sdm): 8,54% de WER en holdout y 11,83% en dev.
- Idiomas de guardia (en, de, fr, es, ru) preservados sin olvido: 4,46% de WER en holdout ciego, con en 4,30%, de 3,50% y ru 5,84%.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo; el modelo es exclusivamente ASR.

## Casos de uso

- Dictado por voz en local: el modelo reconoce el habla y abstiene correctamente ante silencios y ruido ambiental (100,0% de abstencion limpia), lo que evita inserciones de texto fantasma en editores y asistentes de escritura.
- Transcripcion de reuniones con LokalBot: integrado en llama-server, procesa audio de reuniones (AMI ihm y sdm) con WER de 8,54% en holdout, adecuado para actas y resumenes automaticos en local sin enviar audio a la nube.
- Subtitulado y transcripcion de contenido en serbio, croata y bosnio: mejora el WER del modelo original entre 6,20 y 7,41 puntos porcentuales segun el idioma, util para medios y archivos audiovisuales de la region.
- Reconocimiento de habla con cambio de codigo en entornos bilingues: maneja frases que alternan serbio e ingles o ingles y aleman con 14,39% de WER, util en reuniones internacionales y soporte tecnico multilingue.
- Dictado con vocabulario especializado: el sesgo de vocabulario personalizado recupera el 100,0% de los terminos objetivo con 5,00% de WER, apropiado para profesionales de la salud, legal o ingenieria que dictan terminos tecnicos poco frecuentes.
- Transcripcion en dispositivos Apple Silicon: el modelo corre a 29,1 veces en tiempo real sobre un M4 Max con Metal, lo que permite transcripcion en directo en portatiles sin GPU dedicada.
- Procesamiento por lotes de audio en espanol, frances, aleman y ruso: los idiomas de guardia mantienen un WER de 4,46% en holdout, por lo que el modelo sirve como motor ASR unico para pipelines multilingues.

## Benchmarks y rendimiento

Resultados del holdout ciego (466 clips) frente al modelo original ggml-org/Qwen3-ASR-1.7B-GGUF en Q8_0, con decodificacion greedy identica (temperature=0, top_k=1, repeat_penalty=1.0):

| Prueba | Original Q8_0 | v1 (s=1.25) | v2 (s=1.0) | Delta v2 vs original |
|---|---:|---:|---:|---:|
| Eslavo del sur (sr/hr/bs) auto WER | 24,64% | 19,37% | 17,96% | -6,68 pp |
| Eslavo del sur (sr/hr/bs) hr fijado WER | 24,60% | 20,24% | 18,00% | -6,60 pp |
| sr auto / hr / bs auto WER | 22,35% / 27,58% / 23,82% | 16,99% / 21,26% / 19,68% | 15,95% / 20,17% / 17,62% | -6,40 / -7,41 / -6,20 pp |
| Croata fuera de dominio (VoxPopuli hr) auto WER | 24,95% (0,29% no latino) | 20,04% (0,04% no latino) | 18,86% (0,00% no latino) | -6,09 pp |
| Cambio de codigo (sr+en, en+de) WER | 37,12% (0,18% no latino) | 15,54% (0,14% no latino) | 14,39% (0,00% no latino) | -22,73 pp |
| Tasa limpia en silencio/ruido de dictado | 8,3% (16 ecos, 123 palabras) | 100,0% (0 ecos, 0 palabras) | 100,0% (0 ecos, 0 palabras) | +91,7 pp |
| Recuperacion de vocabulario / WER de dictado | 86,7% / 9,00% | 100,0% / 4,00% | 100,0% / 5,00% | +13,3 pp / -4,00 pp |
| WER con distractores (0 inyecciones) | 13,83% | 15,25% | 12,41% | -1,42 pp |
| Reuniones AMI (ihm / sdm) WER | 7,91% / 24,86% | 12,03% / 28,86% | 8,54% / 26,00% | regresion de v1 corregida |
| Idiomas de guardia (en/de/fr/es/ru) WER | 4,35% | 4,44% | 4,46% | sin olvido |
| Throughput (M4 Max Metal) | 28,53x RTF | 22,90x RTF | 29,07x RTF | paridad o mejor |

Resultados del conjunto de desarrollo (387 clips):

| Prueba | Original Q8_0 | v1 (s=1.25) | v2 (s=1.0) | Delta v2 vs original |
|---|---:|---:|---:|---:|
| Eslavo del sur (sr/hr/bs) auto / hr WER | 25,06% / 23,52% | 21,12% / 20,83% | 19,12% / 19,41% (0,0% no latino) | -5,94 / -4,11 pp |
| Croata fuera de dominio (VoxPopuli hr) auto WER | no disponible en el fragmento proporcionado | no disponible | no disponible | no disponible |
| Idiomas de guardia WER | 3,97% | no disponible | 3,77% | -0,20 pp |
| Reuniones AMI ihm WER | no disponible | no disponible | 11,83% | no disponible |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible, ya que el modelo es exclusivamente de reconocimiento del habla.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 2,5 GB (2,02 GiB de decodificador mas 339 MiB de proyector de audio), mas el espacio de contexto y el buffer de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria libre; el modelo se ejecuta en CPU y en Apple Silicon mediante Metal. No se especifican requisitos para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM, y en equipos Apple Silicon. El rendimiento medido es de 29,1 veces en tiempo real sobre un Apple M4 Max con Metal.
- Opciones de despliegue: llama.cpp (llama-server), con soporte de endpoints compatibles; el modelo esta empaquetado como GGUF y pensado para LokalBot.
- Latencia y throughput: 29,07x RTF sobre M4 Max Metal; no se proporcionan datos de latencia para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER eslavo del sur (holdout) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-LokalBot v2 (este modelo) | 2.031.739.904 | no disponible | 17,96% auto / 18,00% hr fijado | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-ASR-1.7B original (ggml-org, Q8_0) | 2.031.739.904 | no disponible | 24,64% auto / 24,60% hr fijado | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-ASR-1.7B-LokalBot v1 (s=1.25) | 2.031.739.904 | no disponible | 19,37% auto / 20,24% hr fijado | Apache 2.0 | GGUF en Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la model card; no se dispone de datos de otros modelos ASR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste se ha centrado en eslavo del sur, cambio de codigo y dictado; el rendimiento en otros idiomas depende del anclaje KL y podria degradarse en dominios no cubiertos por el entrenamiento.
- Las tasas de error siguen siendo relativamente altas en eslavo del sur (17,96% de WER en holdout ciego), por lo que la transcripcion automatica de estos idiomas requiere revision humana en contextos criticos.
- El modelo puede alucinar texto en audio ambiguo, aunque la tasa de abstencion limpia en silencio y ruido es del 100,0% en el conjunto evaluado.
- El sesgo de vocabulario personalizado puede inyectar terminos no presentes en el audio en escenarios no evaluados; la model card reporta 0 inyecciones falsas en el conjunto de prueba, pero no garantiza este comportamiento fuera de el.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los corpus de entrenamiento tienen sus propias condiciones (CC0 y CC-BY-4.0), que deben respetarse en la redistribucion.
- No se documentan sesgos especificos por genero, edad o acento; los conjuntos de evaluacion son limitados (466 clips de holdout y 387 de desarrollo).
- El modelo esta empaquetado para llama.cpp y LokalBot; el uso con otros runtimes requiere verificar la compatibilidad del formato GGUF y del proyector de audio.
- La longitud de contexto no esta documentada, lo que limita la planificacion de transcripciones de audio muy largas sin segmentacion.

## Enlaces

- Hugging Face: https://huggingface.co/stevyhacker/Qwen3-ASR-1.7B-LokalBot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- GGUF oficial del modelo base: https://huggingface.co/ggml-org/Qwen3-ASR-1.7B-GGUF
- Repositorio LokalBot: https://github.com/stevyhacker/LokalBot
- Corpus FLEURS: https://huggingface.co/datasets/google/fleurs
- Corpus ParlaSpeech-RS: https://huggingface.co/datasets/classla/ParlaSpeech-RS
- Corpus VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Corpus AMI: https://huggingface.co/datasets/edinburghcstr/ami
