# Tamarillo/voice-deepfake-guard-tiny-en

## Resumen

Tamarillo/voice-deepfake-guard-tiny-en es un clasificador de audio especializado en deteccion de deepfakes de voz (anti-spoofing), desarrollado por Tamarillo. Se construye sobre el backbone ntu-spml/distilhubert, una version destilada de HuBERT, y cuenta con 23,7 millones de parametros. Su proposito es discriminar entre audio real y audio sintetico generado por sistemas de sintesis de voz, en un contexto de creciente preocupacion por la seguridad de la voz y la forense de agentes conversacionales.

El modelo se presenta como sustitucion directa (drop-in) en pipelines de audio-classification de Hugging Face, con `id2label = {0: "fake", 1: "real"}`, compatible con mo-thecreator/Deepfake-audio-detection y MelodyMachine/Deepfake-audio-detection-V2. Su principal atractivo es el rendimiento en el borde: un ONNX INT8 de 50,6 MB que procesa 1,0 s de audio en 22,9 ms en CPU (RTF = 0,0229), lo que lo hace apto para aplicaciones de navegador via Transformers.js y WASM.

La relevancia actual radica en su licencia Apache-2.0, su tamano reducido (4,0x menor que los detectores de referencia de 94,6M) y su endurecimiento frente a codecs reales, orientado a sidecars de agentes de voz en tiempo real y aplicaciones cliente. El modelo esta entrenado y evaluado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (HuBERT destilado, 3 estados fusionados: CNN + 2 capas transformer) |
| Parametros totales | 23.689.349 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de hasta 4,0 s a 16 kHz en evaluacion) |
| Tipos de cuantizacion | INT8 (ONNX), FP32 (ONNX y safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx FP32, model_quantized.onnx INT8) |

## Arquitectura y entrenamiento

El modelo emplea un backbone DistilHuBERT (ntu-spml/distilhubert), una version destilada de HuBERT que conserva tres estados fusionados: una capa CNN de extraccion de caracteristicas acusticas y dos capas transformer. Utiliza `use_weighted_layer_sum=True` de forma nativa y no requiere `trust_remote_code`, lo que simplifica su integracion en pipelines estandar de `transformers>=4.30`. La cabeza de clasificacion produce dos clases (fake/real) sobre audio mono a 16 kHz, con ventanas de hasta 4,0 s sin necesidad de recorte de silencios.

El entrenamiento se realizo con datos de multiples suites publicas de anti-spoofing y reconocimiento de voz: jungjee/asvspoof5, SpeechAntiSpoofingBenchmarks/CD-ADD, SpeechAntiSpoofingBenchmarks/CVoiceFake_small, edinburghcstr/ami, PolyAI/minds14 y openslr/librispeech_asr. El autor indica que el modelo esta "endurecido frente a codecs reales" (real-codec-hardened), lo que sugiere entrenamiento con audio degradado por codecs de telefonia o compresion. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de clasificacion, no se espera alineamiento por preferencias. Incluye un fichero `calibration.json` con escalado de temperatura (T = 1,9134) y un umbral calibrado al 5% de FPR (tau = 0,31) para ajustar el punto de operacion.

## Capacidades

- Clasificacion binaria de audio: distingue entre voz real y voz sintetica (deepfake) en audio de 16 kHz.
- Deteccion de audio deepfake y anti-spoofing orientada a seguridad de voz.
- Forense de agentes: pensado para verificar la autenticidad de voces en flujos de agentes conversacionales.
- Inferencia en el borde: ONNX INT8 de 50,6 MB ejecutable en CPU y en navegador via Transformers.js/WASM.
- Integracion directa en pipelines de `audio-classification` de Hugging Face con `id2label = {0: "fake", 1: "real"}`.
- Calibracion de umbral mediante escalado de temperatura y punto de corte ajustable por canal.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es un modelo exclusivamente de clasificacion de audio.
- Capacidad multilingue: no disponible (solo ingles).

## Casos de uso

- Verificacion de autenticidad en llamadas telefonicas: el modelo puede clasificar segmentos de hasta 4,0 s de audio de una llamada entrante para detectar voces sinteticas, con un umbral calibrado al 5% de FPR para minimizar falsas alarmas sobre hablantes reales.
- Sidecar de agentes de voz en tiempo real: al procesar 1,0 s de audio en 22,9 ms en CPU (RTF = 0,0229), puede integrarse como componente paralelo en pipelines de atencion al cliente automatizada sin anadir latencia perceptible.
- Deteccion en navegador sin servidor: mediante el ONNX INT8 y Transformers.js/WASM, permite clasificar audio capturado por microfono directamente en el cliente, sin enviar la voz a un backend, lo que reduce riesgos de privacidad.
- Moderacion de contenido en plataformas de audio: clasificacion por lotes de clips subidos por usuarios para marcar posibles deepfakes antes de su publicacion, usando el modelo FP32 o INT8 segun el throughput requerido.
- Forense digital y peritaje: como primera capa de triaje en la verificacion de grabaciones aportadas como evidencia, complementada con analisis manual y otros indicadores.
- Proteccion de sistemas de autenticacion por voz: integrado como filtro previo a la verificacion biomica para rechazar intentos de suplantacion mediante TTS o voice cloning.
- Filtrado en pipelines de datos de ASR: descartar muestras sinteticas en la construccion de corpus de entrenamiento para reconocimiento de voz.

## Benchmarks y rendimiento

| Suite / metrica | Resultado |
|---|---|
| 5-Suite Public Mean EER | 16,70% |
| 5-Suite Public Mean AUC | 0,9033 |
| 4-Suite Strict Zero-Touch OOD Mean EER | 16,80% |
| 4-Suite Strict Zero-Touch OOD Mean AUC | 0,8996 |
| EER en Commercial TTS | 16,72% |
| TPR@5%FPR en Commercial TTS | 65,3% |
| FPR en hablantes reales (Commercial TTS) | 0,8% |
| Recall de fake en TTS comercial limpio (umbral 0,50) | 33,3% |

Comparativa de rendimiento reportada por el autor:

| Modelo | Parametros | EER 5-Suite | EER 4-Suite OOD | CPU ONNX @ 1,0 s |
|---|---|---|---|---|
| voice-deepfake-guard-tiny-en | 23,7M | 16,70% | 16,80% | 22,9 ms (INT8) |
| mo-thecreator/Deepfake-audio-detection | 94,6M | 22,31% | no disponible | ~50 ms (2,2x mas lento) |
| MelodyMachine/Deepfake-audio-detection-V2 | 94,6M | 41,25% | no disponible | no disponible |
| Gustking (315,7M) | 315,7M | 13,96% | no disponible | ~140 ms (6,1x mas lento) |

El autor indica que el modelo supera a mo-thecreator y MelodyMachine-v2 en el agregado, y a Gustking en 3 de 5 suites (Commercial TTS, ASVspoof5, DFADD), aunque Gustking obtiene mejor media global impulsado por ASVspoof2021_LA.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 23,7M de parametros; el ONNX INT8 ocupa 50,6 MB y el FP32 94,8 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y en CPU.
- Despliegue: `transformers` (pipeline de audio-classification), ONNX Runtime (CPU/edge), Transformers.js/WASM en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 22,9 ms por 1,0 s de audio en CPU con INT8 (RTF = 0,0229); 2,2x mas rapido que mo-thecreator y 6,1x mas rapido que Gustking segun el autor. No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | EER (5-Suite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voice-deepfake-guard-tiny-en | 23,7M | hasta 4,0 s audio | 16,70% | Apache-2.0 | Hugging Face, ONNX, Transformers.js |
| mo-thecreator/Deepfake-audio-detection | 94,6M | no disponible | 22,31% | no disponible | Hugging Face |
| MelodyMachine/Deepfake-audio-detection-V2 | 94,6M | no disponible | 41,25% | no disponible | Hugging Face |
| Gustking | 315,7M | no disponible | 13,96% | no disponible | Hugging Face |

La ventaja diferencial del modelo es su relacion tamano/rendimiento/latencia: es 4,0x mas pequeno que los detectores de 94,6M y 13,3x mas pequeno que Gustking, con mejor EER agregado que los primeros y peor que Gustking en la media global, pero mejor en 3 de 5 suites. La licencia Apache-2.0 facilita su uso comercial frente a alternativas cuya licencia no se detalla.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en ingles; el rendimiento en otros idiomas no esta garantizado.
- El umbral por defecto de 0,50 prioriza baja tasa de falsos positivos (0,8% FPR en hablantes reales) pero produce un recall conservador del 33,3% en TTS comercial limpio; es necesario calibrar el umbral sobre el audio objetivo (tau = 0,31 calibrado al 5% FPR).
- Riesgo de falsos negativos ante sistemas TTS o de clonacion de voz no representados en los datos de entrenamiento; el propio autor reconoce limitaciones en la suite Commercial TTS.
- Posible degradacion con audio muy ruidoso, codecs no vistos o duraciones fuera de la ventana de evaluacion (hasta 4,0 s).
- No es un modelo generativo: no soporta razonamiento, codigo, tool calling ni agentes; su unica funcion es la clasificacion binaria.
- Riesgo de sesgo segun la distribucion de hablantes, acentos y condiciones de grabacion de los datasets de entrenamiento (ASVspoof5, AMI, MINDS-14, LibriSpeech, entre otros).
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de robustez en produccion; se recomienda validacion en el dominio objetivo antes de desplegar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/voice-deepfake-guard-tiny-en
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Demo en Hugging Face Space (referenciada por el autor): https://huggingface.co/spaces/Tamarillo/voice-deepfake-guard-demo
- Dataset ASVspoof5: https://huggingface.co/datasets/jungjee/asvspoof5
- Dataset CD-ADD: https://huggingface.co/datasets/SpeechAntiSpoofingBenchmarks/CD-ADD
- Dataset CVoiceFake_small: https://huggingface.co/datasets/SpeechAntiSpoofingBenchmarks/CVoiceFake_small
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Dataset MINDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
