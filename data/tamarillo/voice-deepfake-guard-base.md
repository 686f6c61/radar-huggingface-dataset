# Tamarillo/voice-deepfake-guard-base

## Resumen

Tamarillo/voice-deepfake-guard-base es un clasificador de audio para deteccion de voz sintetica (anti-spoofing) desarrollado por Tamarillo. Se construye sobre el backbone auto-supervisado facebook/wav2vec2-xls-r-300m (315,7 millones de parametros) y se presenta como sustituto directo, en una sola linea, de detectores previos como mo-thecreator/Deepfake-audio-detection y MelodyMachine/Deepfake-audio-detection-V2 dentro de pipelines `audio-classification` de `transformers`, con el mismo mapeo de etiquetas (`id2label = {0: "fake", 1: "real"}`).

El modelo aborda un problema creciente en seguridad de voz: distinguir audio humano autentico de audio generado por TTS comercial, clonacion de voz o difusion. Segun la model card, ocupa el primer puesto entre siete modelos evaluados tanto en la media de cinco suites publicas (9,43 % EER, 0,9503 AUC) como en la media estricta de cuatro suites fuera de distribucion (8,85 % EER, 0,9530 AUC), con resultados destacados en DFADD 2024 (0,96 % EER) e In-The-Wild (4,30 % EER).

Es relevante por su combinacion de licencia Apache-2.0, soporte multilingue (en/de/fr/it/zh via XLS-R), ausencia de `trust_remote_code` y un artefacto ONNX INT8 de 355,4 MB que ejecuta inferencia en CPU a 74,6 ms por segundo de audio, lo que lo hace desplegable en gateways de seguridad de voz sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (wav2vec2 / XLS-R) con 25 estados fusionados (CNN + 24 capas transformer) y `use_weighted_layer_sum=True` |
| Parametros totales | 315.701.659 (315,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de entrada de hasta 4,0 s a 16 kHz (ventana de evaluacion indicada en la model card) |
| Tipos de cuantizacion | INT8 (ONNX `model_quantized.onnx`, 355,4 MB) y FP32 (ONNX `model.onnx`, 1.263,3 MB); pesos safetensors en el repo |
| Idiomas soportados | en, de, fr, it, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo es un clasificador binario construido sobre facebook/wav2vec2-xls-r-300m, un transformer preentrenado de forma auto-supervisada sobre audio multilingue (XLS-R). La cabeza de clasificacion opera sobre la suma ponderada de las 24 capas transformer mas la salida convolucional (`use_weighted_layer_sum=True`, 25 estados fusionados), lo que permite al detector explotar informacion de distintas profundidades de representacion acustica. La salida es un par de logits con etiquetas `fake` (indice 0) y `real` (indice 1).

Segun la model card, el ajuste fino se realizo sobre un conjunto de datasets de anti-spoofing y audio real: jungjee/asvspoof5, SpeechAntiSpoofingBenchmarks/CD-ADD, SpeechAntiSpoofingBenchmarks/CVoiceFake_small, SpeechAntiSpoofingBenchmarks/CFAD, edinburghcstr/ami, PolyAI/minds14 y openslr/librispeech_asr. El modelo se describe como "real-codec-hardened", es decir, entrenado para robustez frente a codecs reales de telefonia y VoIP. Se incluye un fichero `calibration.json` con escalado de temperatura (T=0,9838) para calibracion de probabilidades. No se detalla en la informacion disponible el numero total de tokens de audio, la composicion exacta del dataset ni si se aplico RLHF/DPO (no aplicable en clasificacion).

## Capacidades

- Clasificacion binaria de audio como voz real o sintetica (fake/real) en ventanas de hasta 4,0 s a 16 kHz.
- Deteccion de audio generado por TTS comercial (ElevenLabs, Kokoro, Hume segun la model card) y por TTS de difusion (DFADD 2024).
- Deteccion en condiciones fuera de distribucion (In-The-Wild), con 4,30 % EER reportado.
- Robustez frente a codecs reales de telefonia y VoIP ("real-codec-hardened").
- Capacidad multilingue en en, de, fr, it y zh gracias al backbone XLS-R.
- Soporte de umbral configurable: tau=0,50 para baja tasa de falsos positivos en verificacion de llamadas; tau=0,20 para cribado de alta recall sobre TTS comercial.
- Calibracion opcional de probabilidades mediante escalado de temperatura.
- Inferencia en CPU via ONNX Runtime con paridad de argmax del 100 % frente a FP32 (n=16 clips, diferencia maxima 0,00092).
- No soporta tool calling, agentes, vision ni audio generativo; es exclusivamente un clasificador.

## Casos de uso

- Verificacion anti-fraude en llamadas telefonicas: integrado en un gateway de voz (SIP/VoIP) que clasifica cada segmento de hasta 4 s y marca como sospechosa la llamada cuando P(fake) supera el umbral; el modo tau=0,50 ofrece una tasa de falsos positivos cercana al 0 % sobre voces reales.
- Cribado de alta recall de TTS comercial: en pipelines de moderacion de contenido o auditoria de campanas, con tau=0,20 para detectar voces sintetizadas por ElevenLabs, Kokoro o Hume alli donde prima no dejar pasar audio falso.
- Forense en SOC y respuesta a incidentes: analisis por lotes de grabaciones (adjuntos de correo, notas de voz, mensajes) para determinar autenticidad antes de escalar un incidente de ingenieria social.
- Deteccion de deepfakes en contenidos de difusion: pre-filtrado de entrevistas, podcasts o material periodistico generado con TTS de difusion (DFADD 2024), donde el modelo reporta 0,96 % EER.
- Pasarela de seguridad de voz en CPU sin GPU: despliegue del ONNX INT8 (355,4 MB, 74,6 ms por segundo de audio) en servidores modestos o en el borde para autenticacion de voz y control de acceso.
- Demostracion interactiva en navegador: la familia incluye un Space WASM con el modelo `tiny-en` (50,6 MB INT8) para probar microfono y arrastrar audio sin enviar datos al servidor; util para formacion y validacion de umbrales.
- Analisis de audio multilingue: al cubrir en/de/fr/it/zh, permite aplicar un unico detector a centros de atencion o lineas de denuncia en varios idiomas sin entrenar modelos por lengua.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER menor es mejor; AUC mayor es mejor):

| Suite | EER | AUC | Notas |
|---|---|---|---|
| DFADD 2024 (Diffusion TTS) | 0,96 % | 0,9996 | tau=0,50: 91,8 % recall fake, 0,0 % FPR real |
| In-The-Wild | 4,30 % | 0,987 | tau=0,50: 78,0 % recall fake, 0,0 % FPR real |
| Commercial TTS | 12,43 % | 0,943 | 14,79 % EER en clips de 1,0 s; tau=0,50: 15,4 % recall fake, 0,3 % FPR real |
| Media 5-Suite Public Mean | 9,43 % | 0,9503 | primer puesto entre 7 modelos evaluados |
| Media 4-Suite Strict Zero-Touch OOD | 8,85 % | 0,9530 | primer puesto entre 7 modelos evaluados |

Comparativa interna de la familia (segun model card):

| Modelo | Backbone | Parametros | OOD 4-Suite (EER/AUC) | Public 5-Suite (EER/AUC) | CPU ONNX @ 1,0 s |
|---|---|---|---|---|---|
| voice-deepfake-guard-tiny-en | ntu-spml/distilhubert | 23,7 M | 16,80 % / 0,8996 | 16,70 % / 0,9033 | 22,9 ms (INT8) |
| voice-deepfake-guard-small-en | facebook/wav2vec2-base | 94,6 M | 12,40 % / 0,9386 | 12,05 % / 0,9407 | 50,9 ms (FP32) |
| voice-deepfake-guard-base | facebook/wav2vec2-xls-r-300m | 315,7 M | 8,85 % / 0,9530 | 9,43 % / 0,9503 | 74,6 ms (INT8) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32 (pesos de 315,7 M) mas activaciones; en FP16 en torno a 0,7 GB; el ONNX INT8 requiere unos 0,4 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve para FP32; RTX 4090, A100 o H100 no son necesarias pero ofrecen mayor throughput en lotes grandes.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en CPU pura con ONNX INT8.
- Opciones de despliegue: pipeline `audio-classification` de `transformers` (>=4.30), PyTorch directo con `AutoModelForAudioClassification`, ONNX Runtime (FP32 o INT8) y Hugging Face Inference Endpoints (tag `endpoints_compatible`). No requiere `trust_remote_code`.
- Latencia y throughput: 74,6 ms por segundo de audio en CPU con ONNX INT8 (1,88x mas rapido y 3,55x mas pequeno que el equivalente FP32 de 1,26 GB); en GPU la latencia es inferior pero no se publica cifra concreta en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tamarillo/voice-deepfake-guard-base | 315,7 M | hasta 4,0 s @ 16 kHz | Apache-2.0 | Hugging Face, ONNX incluido | 9,43 % EER media 5 suites; multilingue |
| Gustking (detector comparable citado en la model card) | 315,7 M | no disponible | no disponible | no disponible | FP32 1,26 GB; superado en velocidad y tamano por el ONNX INT8 de este modelo |
| mo-thecreator/Deepfake-audio-detection | no disponible | no disponible | no disponible | Hugging Face | Sustituible en una linea; sin datos comparativos publicados en la informacion disponible |
| MelodyMachine/Deepfake-audio-detection-V2 | no disponible | no disponible | no disponible | Hugging Face | Sustituible en una linea; sin datos comparativos publicados en la informacion disponible |

## Limitaciones y advertencias

- El umbral por defecto (argmax a 0,50) prioriza evitar falsos positivos sobre voces reales, pero deja un recall de solo 15,4 % sobre TTS comercial limpio de estudio; para cribado de alta recall hay que bajar a tau=0,20, lo que aumenta los falsos positivos.
- La ventana de evaluacion es de hasta 4,0 s; el comportamiento con clips mas largos o con segmentacion distinta no esta documentado en la informacion disponible.
- El rendimiento en idiomas distintos de en/de/fr/it/zh no esta evaluado; el backbone XLS-R es multilingue, pero el ajuste fino se limita a esas cinco lenguas.
- Riesgo de alucinacion no aplica (es un clasificador), pero si de clasificacion erronea en audio con ruido, musica de fondo, locutores superpuestos o codecs no vistos durante el entrenamiento.
- No se documentan en la informacion disponible sesgos demograficos (acento, genero, edad) ni su impacto en la tasa de error; conviene validar sobre el dominio objetivo antes de produccion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece informacion sobre responsabilidad en fallos de seguridad.
- La fecha de creacion del repositorio (2026-11-26) y el hecho de tener 0 descargas y 0 likes indican que el modelo es muy reciente y carece de validacion independiente por parte de la comunidad.
- El modelo solo clasifica; no transcribe, no identifica hablante y no genera explicaciones, por lo que en forense debe combinarse con otras herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/voice-deepfake-guard-base
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Demo en navegador (Space): https://huggingface.co/spaces/Tamarillo/voice-deepfake-guard-demo
- Modelo tiny-en de la familia: https://huggingface.co/Tamarillo/voice-deepfake-guard-tiny-en
- Modelo small-en de la familia: https://huggingface.co/Tamarillo/voice-deepfake-guard-small-en
- Dataset ASVspoof5: https://huggingface.co/datasets/jungjee/asvspoof5
- Dataset CD-ADD: https://huggingface.co/datasets/SpeechAntiSpoofingBenchmarks/CD-ADD
- Dataset CVoiceFake_small: https://huggingface.co/datasets/SpeechAntiSpoofingBenchmarks/CVoiceFake_small
- Dataset CFAD: https://huggingface.co/datasets/SpeechAntiSpoofingBenchmarks/CFAD
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Dataset MINDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
