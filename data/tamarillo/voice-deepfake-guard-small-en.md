# Tamarillo/voice-deepfake-guard-small-en

## Resumen

Tamarillo/voice-deepfake-guard-small-en es un detector de audio deepfake (anti-spoofing) en inglés desarrollado por Tamarillo, construido sobre el backbone facebook/wav2vec2-base (94,6 M de parámetros) y publicado bajo licencia Apache-2.0. Su función es clasificar un fragmento de audio de 16 kHz como voz real o sintética, pensado como sustituto directo (drop-in) de los modelos mo-thecreator/Deepfake-audio-detection y MelodyMachine/Deepfake-audio-detection-V2 en pipelines de `audio-classification` de Hugging Face, con el mismo mapeo `id2label = {0: "fake", 1: "real"}` y sin necesidad de `trust_remote_code`.

El modelo forma parte de una familia de tres tamaños (tiny-en de 23,7 M, small-en de 94,6 M y base de 315,7 M). Según la model card, esta variante alcanza un EER medio del 12,05 % (AUC 0,9407) sobre una media de cinco suites públicas de evaluación, y un 10,65 % de EER en ASVspoof5. Se distribuye tanto en safetensors para PyTorch como en ONNX FP32 (378,5 MB), lo que permite ejecución en CPU de servidor y en el borde con un coste de unos 50,9 ms por segundo de audio (RTF 0,0509).

Su relevancia actual radica en el auge de agentes de voz y llamadas sintéticas: ofrece una capa de verificación de autenticidad de voz con umbral configurable (0,20 para alta sensibilidad, 0,50 para baja tasa de falsos positivos) y un tamaño reducido que cabe en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + 12 capas transformer), clasificación con `use_weighted_layer_sum=True` sobre 13 estados fusionados (CNN + 12 capas) |
| Parametros totales | 94.569.103 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la model card indica entrada de audio de hasta 4,0 s a 16 kHz en evaluación |
| Tipos de cuantizacion | ONNX FP32 (378,5 MB); INT8 disponible en la variante tiny-en de la familia; el repo incluye pesos safetensors y ONNX |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un clasificador de audio basado en Wav2Vec2-Base: un extractor convolucional de características seguido de 12 capas transformer, con agregación ponderada de las salidas de las 13 etapas (CNN más 12 capas) mediante `use_weighted_layer_sum=True`. La cabeza de clasificación produce dos logits (fake/real). No requiere código remoto personalizado y es compatible con `transformers>=4.30`.

El entrenamiento se realizó sobre una combinación de conjuntos de datos orientados a anti-spoofing y diversidad acústica: jungjee/asvspoof5, SpeechAntiSpoofingBenchmarks/CD-ADD, SpeechAntiSpoofingBenchmarks/CVoiceFake_small, edinburghcstr/ami, PolyAI/minds14 y openslr/librispeech_asr. La model card describe el modelo como "real-codec-hardened", es decir, robustecido frente a códecs reales de telefonía y compresión. No se especifica en la información disponible el número exacto de tokens o horas de audio de entrenamiento, ni si se aplicó RLHF o DPO (no aplicable a una tarea de clasificación). Se incluye un fichero `calibration.json` con escalado de temperatura (T=0,9744) para calibrar las probabilidades.

## Capacidades

- Clasificación binaria de autenticidad de voz: distingue audio real de audio sintético (TTS, voice cloning, conversión de voz).
- Detección de deepfakes de voz endurecida frente a códecs reales de comunicación.
- Integración directa en pipelines `audio-classification` de Hugging Face con una sola línea de código.
- Ejecución en CPU mediante ONNX Runtime con paridad prácticamente exacta respecto a PyTorch (diferencia máxima de probabilidad de 0,00001 y 100 % de coincidencia en argmax).
- Calibración opcional de probabilidades mediante escalado de temperatura.
- Umbral configurable para equilibrar sensibilidad y falsos positivos (0,20 para alta recall; 0,50 para menos del 1 % de FPR sobre hablantes reales).
- Capacidades multilingües: limitadas al inglés.
- No soporta tool calling, agentes ni generación de texto; es exclusivamente un clasificador de audio.

## Casos de uso

- Verificación de autenticidad en centros de llamadas: insertar el detector como paso previo en la pasarela de voz para marcar llamadas sintéticas antes de que un agente humano o un bot las atienda, usando el umbral 0,50 para minimizar falsos positivos sobre clientes reales.
- Forense de agentes de voz: analizar grabaciones de interacciones con asistentes automáticos para determinar si la voz del interlocutor era humana o generada, aprovechando el etiquetado de "agent-forensics" del modelo.
- Moderación de contenido en plataformas de audio: filtrar clips subidos por usuarios que puedan contener voces clonadas, con una ventana de análisis de hasta 4 s por fragmento.
- Detección de fraude telefónico: identificar intentos de suplantación de identidad mediante voz sintética en llamadas bancarias o de soporte, con despliegue en CPU de bajo coste gracias al ONNX FP32.
- Puerta de seguridad en asistentes conversacionales: validar que la entrada de micrófono en un agente desplegado en el borde proviene de una persona real antes de ejecutar acciones sensibles.
- Auditoría de pipelines de TTS: evaluar la calidad y detectabilidad de voces sintéticas generadas por motores comerciales, ajustando el umbral a 0,20 para alta sensibilidad en la detección.
- Investigación en anti-spoofing: servir como línea base reproducible y de licencia permisiva para comparar con otros detectores en las suites públicas citadas.

## Benchmarks y rendimiento

Datos publicados en la model card (EER menor es mejor; AUC mayor es mejor):

| Suite / metrica | voice-deepfake-guard-small-en | Gustking | mo-thecreator | MelodyMachine-v2 |
|---|---|---|---|---|
| Media 5 suites (EER / AUC) | 12,05 % / 0,9407 | 13,96 % / no disponible | 22,31 % / no disponible | 41,25 % / no disponible |
| Media 4 suites strict zero-touch (EER) | 12,40 % | 12,01 % | no disponible | no disponible |
| ASVspoof5 Eval (EER / AUC) | 10,65 % / 0,949 | 21,75 % / no disponible | no disponible | no disponible |
| DECRO chino zero-touch (EER / AUC) | 2,38 % / 0,997 | no disponible | no disponible | no disponible |
| DFADD (EER) | 3,47 % | no disponible | no disponible | no disponible |
| In-The-Wild (EER) | 8,90 % | no disponible | no disponible | no disponible |

Comparativa interna de la familia (según la model card):

| Modelo | Backbone | Parametros | Media 5 suites (EER / AUC) | ONNX CPU a 1,0 s |
|---|---|---|---|---|
| tiny-en | ntu-spml/distilhubert | 23,7 M | 16,70 % / 0,9033 | 22,9 ms (INT8) |
| small-en (este repo) | facebook/wav2vec2-base | 94,6 M | 12,05 % / 0,9407 | 50,9 ms (FP32) |
| base | facebook/wav2vec2-xls-r-300m | 315,7 M | 9,43 % / 0,9503 | 74,6 ms (INT8) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa aproximadamente 378,5 MB de pesos; en GPU el consumo es inferior a 1 GB incluyendo activaciones para fragmentos de hasta 4 s.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (RTX 3050, RTX 4060, T4, L4); para servicio de alta concurrencia, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en CPU.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime (CPUExecutionProvider), pipeline de Hugging Face; compatible con servicios de inferencia estándar de Hugging Face (endpoints_compatible).
- Latencia y throughput: 50,9 ms por segundo de audio en CPU con ONNX FP32 (RTF 0,0509); la variante tiny-en logra 22,9 ms con INT8. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento (EER medio 5 suites) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tamarillo/voice-deepfake-guard-small-en | 94,6 M | audio hasta 4 s a 16 kHz | 12,05 % | Apache-2.0 | Hugging Face, ONNX incluido |
| Gustking (detector deepfake audio) | 315,7 M | no disponible | 13,96 % | no disponible | Hugging Face |
| mo-thecreator/Deepfake-audio-detection | 94,6 M | no disponible | 22,31 % | no disponible | Hugging Face |
| MelodyMachine/Deepfake-audio-detection-V2 | 94,6 M | no disponible | 41,25 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado, aunque la model card reporta buenos resultados en la suite china DECRO.
- El umbral por defecto de 0,50 produce una recall baja (27,8 %) sobre TTS comercial limpio (ElevenLabs, Kokoro, Hume); para cribado de alta sensibilidad debe bajarse a 0,20, lo que aumenta los falsos positivos.
- Riesgo de degradación ante condiciones acústicas no representadas en el entrenamiento (ruido extremo, canales de compresión atípicos) y posible sesgo hacia los códecs y motores TTS presentes en los datasets.
- Es un clasificador binario; no identifica el tipo de ataque ni el motor de síntesis empleado.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías sobre el rendimiento en dominios específicos; se recomienda validación propia antes de producción.
- La información disponible no detalla el volumen exacto de datos de entrenamiento ni posibles sesgos demográficos del dataset.
- No debe usarse como única prueba en decisiones de seguridad o legales; conviene combinarlo con otras señales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/voice-deepfake-guard-small-en
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Demo WASM (familia): https://huggingface.co/spaces/Tamarillo/voice-deepfake-guard-demo
- Dataset ASVspoof5: https://huggingface.co/datasets/jungjee/asvspoof5
- Dataset CD-ADD: https://huggingface.co/datasets/SpeechAntiSpoofingBenchmarks/CD-ADD
- Dataset CVoiceFake_small: https://huggingface.co/datasets/SpeechAntiSpoofingBenchmarks/CVoiceFake_small
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Dataset MINDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
