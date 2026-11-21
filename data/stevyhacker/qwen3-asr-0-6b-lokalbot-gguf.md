# stevyhacker/Qwen3-ASR-0.6B-LokalBot-GGUF

## Resumen

Qwen3-ASR-0.6B-LokalBot-GGUF es una cuantización Q8_0 en formato GGUF del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, publicada por el desarrollador independiente stevyhacker como parte del proyecto LokalBot. Se trata de un fine-tune mediante LoRA sobre el decoder del modelo base de Qwen, orientado a mejorar la transcripción de lenguas eslavas del sur (serbio, croata y bosnio), el cambio de código bilingüe y la dictación con sesgo de vocabulario, manteniendo intacto el codificador de audio original.

El modelo conserva la arquitectura del base: un encoder de audio congelado más un decoder transformer de 28 capas, con 751.632.384 parámetros totales. El fine-tune entrena únicamente 20,2 millones de parámetros mediante un adaptador LoRA de rango 32 sobre las 196 proyecciones lineales del decoder, de modo que el proyector multimodal (mmproj) permanece bit a bit idéntico al original publicado por ggml-org. El resultado se distribuye en dos ficheros GGUF que suman 1,02 GB y se ejecutan con llama.cpp a través de llama-server.

Su relevancia radica en que corrige un problema concreto del modelo base en lenguas del sur de Europa del Este: reduce el WER en holdout ciego del 52,26 % al 30,57 % en modo automático y elimina prácticamente la deriva hacia alfabetos no latinos (del 33,6 % al 0,02 %), manteniendo el rendimiento en siete idiomas de guarda y mejorando el throughput en un 32,9 %. Todo el material de entrenamiento es de licencia abierta (CC0 o CC-BY-4.0) y el modelo se publica bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio + decoder transformer de 28 capas (Qwen3-ASR), fine-tune LoRA decoder-only |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | en, hr, sr, bs, de, fr, es, ru, ja, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-0.6B, que combina un codificador de audio con un decoder transformer de 28 capas. El fine-tune aplica un adaptador LoRA decoder-only con r=32, alpha=64 y dropout=0,05 sobre las 196 proyecciones lineales q/k/v/o/gate/up/down del decoder, lo que supone 20,2 millones de parámetros entrenables. El audio_tower se mantiene congelado, de forma que el fichero mmproj-Qwen3-ASR-0.6B-Q8_0.gguf es byte a byte idéntico al publicado por ggml-org (214.392.480 bytes, SHA-256 41a342b5e4c514e968cb756de6cd1b7be39eff43c44c57a2ef5fc6522e36603d).

El entrenamiento consta de 450 pasos de optimizador con batch de 64, learning rate coseno de 1,3e-4 y precisión bf16. La función de pérdida mezcla entropía cruzada supervisada con anclaje Forward KL top-64 contra el decoder original congelado: KL pura (peso 1,0) en los siete idiomas de guarda, KL ligera (0,015) en lenguas eslavas del sur, y una combinación de CE 0,25 y KL 0,85 en AMI sdm, con un 3 % de pares de silencio y ruido puro. Los datos proceden íntegramente de FLEURS (sr, hr, bs, en, de, fr, es, ru, ja, zh), VoxPopuli (hr, en), ParlaSpeech-RS (sr, CC-BY-4.0), AMI (ihm y sdm de entrenamiento), concatenaciones bilingües sintéticas y pares acústicos de silencio, sin solapamiento con los conjuntos de desarrollo, holdout ni AMI-400 de test.

## Capacidades

- Reconocimiento automático del habla en diez idiomas: inglés, croata, serbio, bosnio, alemán, francés, español, ruso, japonés y chino.
- Transcripción de lenguas eslavas del sur con supresión de deriva hacia alfabetos no latinos (0,02 % en holdout ciego).
- Manejo de cambio de código bilingüe (EN+SR, EN+DE) con WER del 20,72 %.
- Dictación con sesgo de vocabulario: recall del 100 % en vocabulario objetivo y WER de sesgo del 10,67 %.
- Detección y gestión de silencio: 100 % de silencio limpio, sin ecos ni palabras alucinadas.
- Transcripción de reuniones en micrófono cercano (AMI ihm) y campo lejano (AMI sdm).
- Selección de idioma automática o fijada mediante el token `[language {code}]` en el prompt.
- Integración con llama.cpp mediante llama-server (`/completion` con `--mmproj`).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo es específicamente de ASR.

## Casos de uso

- Transcripción de reuniones en local: con 400 clips de AMI evaluados (WER 10,72 % en ihm y 26,23 % en sdm), el modelo es adecuado para actas automáticas en portátiles o equipos de sobremesa sin conexión, usando llama-server con el mmproj de audio.
- Dictación con vocabulario técnico: el sesgo de vocabulario alcanza un recall del 100 %, por lo que sirve para dictar términos médicos, jurídicos o nombres propios que el modelo base tiende a omitir.
- Subtitulado de contenido en serbio, croata y bosnio: la reducción de WER del 52,26 % al 30,57 % y la eliminación de la deriva no latina lo hacen viable para plataformas de vídeo regionales.
- Transcripción de entrevistas con cambio de código: en contextos EN+SR o EN+DE, el WER baja del 49,21 % al 20,72 %, útil para investigación de campo bilingüe.
- Asistentes de voz en dispositivo: el modelo completo ocupa 1,02 GB y corre a 52,7× RTF en Apple M4 Max con Metal, lo que permite integrarlo en aplicaciones de escritorio o móviles de gama alta.
- Procesamiento por lotes de archivos de audio: el throughput de 52,72× RTF en llama-server permite transcribir horas de audio en minutos en una sola máquina.
- Preprocesado de pipelines de datos de voz: al ser Apache 2.0 y usar solo datos CC0/CC-BY-4.0, puede emplearse para generar transcripciones de entrenamiento sin restricciones de licencia.

## Benchmarks y rendimiento

Evaluación con llama-server v1.0.0 en Apple M4 Max, decodificación greedy y el formato de prompt de producción de LokalBot, frente al modelo base ggml-org/Qwen3-ASR-0.6B-GGUF.

| Prueba | Base 0.6B Q8_0 | LokalBot 0.6B v1 Q8_0 | Delta |
|---|---:|---:|---:|
| South Slavic Auto WER (no latino %) | 52,26 % (33,6 %) | 30,57 % (0,02 %) | -21,69 pp |
| South Slavic Pinned (hr) WER (no latino %) | 48,32 % (1,68 %) | 29,95 % (0,02 %) | -18,37 pp |
| OOD VoxPopuli hr Auto WER | 46,95 % | 24,56 % | -22,39 pp |
| OOD VoxPopuli hr Pinned WER | 37,92 % | 22,40 % | -15,52 pp |
| Code-Switch (EN+SR, EN+DE) WER (no latino %) | 49,21 % (22,1 %) | 20,72 % (0,0 %) | -28,49 pp |
| Dictation Vocab Recall / Bias WER | 80,0 % / 16,33 % | 100,0 % / 10,67 % | +20,0 pp / -5,66 pp |
| Dictation Distractor WER (inyecciones) | 30,50 % (0) | 23,05 % (0) | -7,45 pp |
| 7 idiomas de guarda (EN/DE/FR/ES/RU/JA/ZH) | 6,64 % | 6,77 % | +0,13 pp |
| AMI holdout n=25 ihm / sdm | 7,59 % / 25,71 % | 10,13 % / 26,29 % | +2,54 / +0,58 pp |
| Throughput (RTFx) | 39,67× | 52,72× | +32,9 % |

| AMI ampliado (400 clips) | Base 0.6B Q8_0 | LokalBot 0.6B v1 Q8_0 | Delta |
|---|---:|---:|---:|
| AMI ihm (200 clips) | 10,87 % (0/200 vacíos) | 10,72 % (0/200 vacíos) | -0,15 pp |
| AMI sdm (200 clips) | 26,57 % (0/200 vacíos) | 26,23 % (1/200 vacíos) | -0,34 pp |
| Throughput (RTFx) | 51,87× | 51,30× | ~paridad |

## Requisitos de hardware

- VRAM estimada: el fichero del decoder Q8_0 ocupa 804,7 MB y el mmproj 214,4 MB; en total 1,02 GB de pesos, más overhead de contexto de audio y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de memoria libre; el benchmark se ejecutó en Apple M4 Max con backend Metal.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060 y superiores).
- Despliegue: llama.cpp mediante llama-server con la opción `--mmproj` para cargar el codificador de audio; también es compatible con endpoints compatibles según los tags del repositorio.
- Latencia y throughput: 52,72× RTF en Apple M4 Max Metal (39,67× en el modelo base), lo que implica procesar aproximadamente 52 segundos de audio por segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| LokalBot 0.6B v1 Q8_0 | 751,6 M | 10 | Apache 2.0 | GGUF Q8_0 | Fine-tune eslavo del sur, 52,72× RTF |
| Qwen3-ASR-0.6B (base) | 751,6 M | 10 | Apache 2.0 | safetensors / GGUF | WER 52,26 % en eslavo del sur, 39,67× RTF |
| Whisper large-v3 | 1.550 M | ~99 | MIT | safetensors / GGUF | Referencia multilingüe; no hay datos comparativos en la información disponible |
| Whisper small | 244 M | ~99 | MIT | safetensors / GGUF | Alternativa ligera; no hay datos comparativos en la información disponible |

No se dispone de comparaciones directas con Whisper u otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- El WER en lenguas eslavas del sur sigue siendo elevado en términos absolutos (30,57 % en holdout ciego), por lo que no es adecuado para transcripción de precisión sin revisión humana.
- En AMI holdout con n=25 el modelo empeora frente al base en ihm (+2,54 pp); el resultado se revierte en el conjunto ampliado de 400 clips, lo que sugiere sensibilidad al tamaño de muestra.
- En AMI sdm ampliado se registra 1 clip vacío de 200, frente a 0 en el modelo base.
- El fine-tune se centra en serbio, croata y bosnio; el rendimiento en los siete idiomas de guarda se mantiene pero no mejora (6,64 % → 6,77 %).
- Riesgo de alucinación en audio silencioso: aunque el benchmark reporta 100 % de silencio limpio, no se documentan pruebas fuera de ese conjunto.
- Solo se distribuye cuantización Q8_0; no hay versiones Q4, Q5 ni f16 en el repositorio.
- El uso comercial está permitido por la licencia Apache 2.0, pero los datos de entrenamiento incluyen CC-BY-4.0 (ParlaSpeech-RS), lo que puede requerir atribución.
- No se documentan sesgos demográficos, acentos o variedades dialectales más allá de los conjuntos FLEURS, VoxPopuli y AMI.
- La longitud de contexto no está especificada; para audios largos conviene segmentar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stevyhacker/Qwen3-ASR-0.6B-LokalBot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- GGUF original de ggml-org: https://huggingface.co/ggml-org/Qwen3-ASR-0.6B-GGUF
- Repositorio LokalBot: https://github.com/stevyhacker/LokalBot
