# TCN/parakeet-tdt-0.6b-v3

## Resumen

Parakeet-tdt-0.6b-v3 es un modelo de reconocimiento automático del habla (ASR) publicado por TCN bajo licencia CC BY 4.0. Se trata de un sistema de tipo Transducer con arquitectura FastConformer y decodificación TDT (Token-and-Duration Transducer), con 627 millones de parámetros totales. Está entrenado para transcripción multilingüe en 25 idiomas europeos, con especial énfasis en inglés, y se distribuye en formatos safetensors y GGUF a través de la librería Transformers y el ecosistema NeMo de NVIDIA.

El modelo resuelve el problema de la transcripción de voz a texto en entornos multilingües, cubriendo lenguas germánicas, románicas, eslavas, bálticas y ugrofinesas, además del griego y el maltés. Su tamaño compacto (0,6 B de parámetros) lo hace adecuado para despliegues en producción con requisitos de latencia ajustados, y su soporte de cuantización GGUF permite ejecución en hardware de consumo.

La relevancia actual del modelo radica en la combinación de un tamaño reducido con una cobertura lingüística amplia y un rendimiento competitivo en benchmarks estándar de ASR en inglés, como LibriSpeech (1,93 % de WER en clean) o TED-LIUM v3 (2,75 % de WER). Está etiquetado como compatible con endpoints y con el leaderboard de ASR de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con Transducer TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (FP32/BF16 segun pesos) y GGUF |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante subsampling de las secuencias de entrada, combinada con un decodificador Transducer de tipo TDT. La decodificación TDT predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso de decodificación y reduce la latencia frente a los transductores clásicos. El modelo se distribuye a través de la librería Transformers y del ecosistema NeMo, e incluye pesos en formato GGUF para inferencia optimizada.

Los datos de entrenamiento declarados en la model card incluyen los conjuntos nvidia/Granary y nemo/asr-set-3.0. No se especifica en la información disponible el número total de horas de audio, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables habitualmente en ASR, pero no confirmado). La model card referencia varios artículos técnicos sobre FastConformer, TDT y ASR multilingüe, pero no se detalla la innovación concreta de esta versión v3 más allá de la arquitectura indicada.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Transcripción multilingüe con un único modelo, sin necesidad de seleccionar un checkpoint por idioma.
- Extracción de características acústicas (pipeline `feature-extraction` declarado en los tags).
- Compatible con el pipeline `automatic-speech-recognition` de Transformers.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de inferencia mediante NeMo y mediante Transformers.
- No se declaran capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento (thinking); el modelo es exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y actas: el modelo obtiene un WER de 11,31 en AMI (ihm, test), lo que lo hace utilizable para generar actas automáticas de reuniones en inglés con revisión humana posterior.
- Subtitulado y transcripción de contenido audiovisual multilingüe: al cubrir 25 idiomas europeos, permite transcribir vídeos o podcasts en distintos idiomas con un único modelo desplegado.
- Atención al cliente y análisis de llamadas: la transcripción de audio telefónico o de centro de contacto permite alimentar sistemas de análisis de sentimiento o de calidad, con la ventaja de un modelo de 0,6 B que reduce costes de inferencia.
- Generación de subtítulos para accesibilidad: integración en pipelines de vídeo para producir subtítulos en tiempo casi real, aprovechando el tamaño reducido y la disponibilidad de pesos GGUF para despliegue en CPU o GPU de consumo.
- Investigación lingüística y corpus orales: transcripción de grabaciones de campo en lenguas europeas menos representadas (búlgaro, croata, estonio, letón, lituano, maltés, esloveno, etc.) para construir corpus anotados.
- Dictado y asistentes de voz: integración en aplicaciones de dictado o asistentes por voz que requieran baja latencia y ejecución local, gracias a la cuantización GGUF y al tamaño compacto.
- Análisis de earnings calls y contenido financiero: el WER de 11,42 en Earnings-22 lo hace adecuado para transcribir llamadas de resultados y alimentar análisis financieros automatizados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Idioma | Metrica | Valor |
|---|---|---|---|
| LibriSpeech (clean) | en | Test WER | 1,93 |
| LibriSpeech (other) | en | Test WER | 3,59 |
| TED-LIUM v3 | en | Test WER | 2,75 |
| SPGI Speech | en | Test WER | 3,97 |
| Vox Populi | en | Test WER | 6,14 |
| GigaSpeech | en | Test WER | 9,59 |
| AMI (ihm) | en | Test WER | 11,31 |
| Earnings-22 | en | Test WER | 11,42 |
| FLEURS | es | Test WER | 3,45 |
| FLEURS | en | Test WER | 4,85 |
| FLEURS | de | Test WER | 5,04 |
| FLEURS | fr | Test WER | 5,15 |
| FLEURS | cs | Test WER | 11,01 |
| FLEURS | bg | Test WER | 12,64 |
| FLEURS | fi | Test WER | 13,21 |
| FLEURS | et | Test WER | 17,73 |
| FLEURS | da | Test WER | 18,41 |
| FLEURS | el | Test WER | 20,70 |

No se han publicado en la información disponible resultados de benchmarks para el resto de idiomas cubiertos (hr, hu, it, lv, lt, mt, nl, pl, pt, ro, sk, sl, sv, ru, uk).

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 2,5 GB para los 627 M de parámetros; en BF16/FP16, alrededor de 1,3 GB; en cuantización GGUF de 8 bits, en torno a 0,7 GB; en 4 bits, aproximadamente 0,4 GB (estimaciones a partir del número de parámetros, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100, L4 o RTX 4090 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU mediante GGUF.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), NeMo, llama.cpp/Ollama mediante los pesos GGUF, y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| TCN/parakeet-tdt-0.6b-v3 | 627 M | 25 (europeos) | no disponible | CC BY 4.0 | safetensors, GGUF |
| Whisper large-v3 (OpenAI) | 1.550 M | ~99 | 30 s de audio | MIT | safetensors, GGUF |
| Whisper medium | 769 M | ~99 | 30 s de audio | MIT | safetensors, GGUF |
| NVIDIA parakeet-tdt-0.6b-v2 | 627 M | en | no disponible | CC BY 4.0 | safetensors |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada; los valores de WER del apartado anterior corresponden únicamente a parakeet-tdt-0.6b-v3.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model card).
- Cobertura lingüística limitada a 25 idiomas europeos; no cubre otras lenguas (asiáticas, africanas, amerindias, etc.).
- El rendimiento varía significativamente entre idiomas: el WER en FLEURS va de 3,45 (español) a 20,70 (griego), lo que desaconseja un uso uniforme en todos los idiomas sin evaluación previa.
- Riesgo de alucinación y de errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes (el WER de 11,31 en AMI refleja la dificultad de audio de reuniones).
- No se especifican en la información disponible los sesgos demográficos, dialectales o de género del modelo.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia.
- No se detalla la longitud máxima de audio procesable por segmento; conviene validar el comportamiento en audios largos antes de producción.
- El modelo es exclusivamente ASR: no realiza traducción, diarización de hablantes ni puntuación avanzada salvo que se confirme en la model card completa.

## Enlaces

- Hugging Face: https://huggingface.co/TCN/parakeet-tdt-0.6b-v3
- Paper FastConformer: https://arxiv.org/abs/2305.05084
- Paper TDT (Token-and-Duration Transducer): https://arxiv.org/abs/2304.06795
- Paper ASR multilingüe (referencia de la model card): https://arxiv.org/abs/2509.14128
- Paper relacionado: https://arxiv.org/abs/2505.13404
- Paper Conformer: https://arxiv.org/abs/2005.08100 (referenciado indirectamente; no listado en la model card)
- Paper Squeezeformer/relacionados: https://arxiv.org/abs/2410.01036
- Paper relacionado: https://arxiv.org/abs/2406.00899
- Paper relacionado: https://arxiv.org/abs/2205.12446
- Paper relacionado: https://arxiv.org/abs/2012.03411
- Paper relacionado: https://arxiv.org/abs/2007.10310
- Paper relacionado: https://arxiv.org/abs/1510.08484
- Dataset nvidia/Granary: https://huggingface.co/datasets/nvidia/Granary
- Dataset nemo/asr-set-3.0: https://huggingface.co/datasets/nemo/asr-set-3.0
- Leaderboard ASR de Hugging Face: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
