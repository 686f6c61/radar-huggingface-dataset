# wq2012/ls_conformer_small_pfas

## Resumen

`ls_conformer_small_pfas` es un checkpoint de reconocimiento de hablante (speaker verification/recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos publicados de verificación de hablante. El modelo combina un backbone Conformer de tamano "small" con pooling temporal PFAS (Parameter-Free Attentive Scoring) y un objetivo de entrenamiento basado en Extended-Set Softmax, produciendo embeddings de hablante de 640 dimensiones a partir de audio a 16 kHz.

Con 2.162.187 parámetros de inferencia (encoder más cabeza de scoring, excluyendo pesos de clasificador solo de entrenamiento), es un modelo extremadamente compacto orientado a extracción de características de audio. Su relevancia es doble: por un lado sirve como referencia reproducible y abierta (Apache 2.0) de arquitecturas modernas de speaker embeddings en el ecosistema JAX; por otro, su escala reducida lo hace útil para comparaciones controladas dentro del benchmark FlaxSpeaker y para experimentación en hardware modesto.

Es importante subrayar que se trata de un checkpoint de convergencia sobre un corpus pequeno (232 hablantes, 5.788 utterances de LibriSpeech), no una reproducción a gran escala de los resultados de los papers citados. El autor lo posiciona explícitamente como benchmark de comparación relativa, no como modelo estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal PFAS |
| Parametros totales | 2.162.187 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa recortes variables de 90-180 frames; ventana no especificada en tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo acústico independiente del idioma; entrenado solo con LibriSpeech en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de configuracion `small` que procesa características Mel de 80 dimensiones en escala logarítmica natural a 16 kHz, con VAD a nivel de frame y normalización CMVN mediante el frontend propio `flaxspeaker.AudioFrontend` (no es un `AutoFeatureExtractor` de Hugging Face). Sobre las representaciones del encoder se aplica un pooling temporal PFAS y una cabeza de scoring PFAS-SN, una extensión del autor que combina atención no lineal compartida por frame con un ancla global ATP, produciendo embeddings de 640 dimensiones.

El entrenamiento se realizó únicamente con LibriSpeech (232 hablantes, 5.788 utterances), durante 2.400 pasos de gradiente con batches de 32 utterances (8 hablantes x 4 utterances), equivalentes a aproximadamente 13,27 épocas, con semilla 42 y convergencia sobre CPU. El objetivo es un Extended-Set Softmax mezclado (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit -log N), que no coincide exactamente con la Ecuación 2 del paper original. Se usaron recortes de longitud variable U(90, 180) frames con máscara de validez exacta. El autor documenta una desviación estándar entre semillas de 0,08-0,41 % absoluto en EER agrupado a 1 utterance, y un intervalo de confianza bootstrap del 95 % de ~0,8 % con 8.000 ensayos.

## Capacidades

- Extracción de embeddings de hablante (representación de 640 dimensiones) a partir de audio.
- Verificación de hablante (speaker verification) mediante scoring PFAS-SN.
- Reconocimiento de hablante (speaker identification) por comparación de embeddings.
- Evaluación con métricas EER, minDCF y ROC-AUC.
- Procesamiento de audio variable en longitud (recortes de 90-180 frames en entrenamiento).
- No soporta tool calling, function calling, agentes, visión ni audio generativo.
- No es un modelo de lenguaje: no genera texto ni razona sobre lenguaje natural.
- Capacidades multilingües: no evaluadas; el modelo acústico es intrínsecamente agnóstico al idioma, pero solo se entrenó con datos en inglés.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de acceso: el modelo genera un embedding de 640 dimensiones que puede compararse por similitud coseno contra una plantilla de referencia, adecuado para autenticación de voz en entornos controlados con pocos hablantes.
- Diarización de reuniones: combinado con un sistema de segmentación, los embeddings permiten agrupar segmentos de audio por hablante en grabaciones de duración moderada.
- Detección de locutor en pipelines de transcripción: etiquetar automáticamente quién habla en cada turno de una conversación para enriquecer transcripciones ASR.
- Benchmark de referencia en investigación JAX/Flax: servir como checkpoint reproducible para comparar variantes de arquitectura, pooling o funciones de pérdida dentro del ecosistema FlaxSpeaker.
- Pruebas de integración en sistemas de altavoces inteligentes: validar pipelines de wake-word más verificación de usuario antes de desplegar modelos mayores.
- Educación y experimentación: al ser un modelo de 2,1 M de parámetros entrenable en CPU, es útil para docencia y prototipado rápido de sistemas de speaker recognition.
- Filtrado de calidad en datasets de audio: usar la consistencia de embeddings para detectar segmentos con locutor incorrecto o ruido excesivo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de validación in-domain de LibriSpeech (EER, menor es mejor):

| Punto de entrenamiento | EER 1-utt | EER 3-utt |
|---|---|---|
| Paso 400 | 21,53 % | 19,50 % |
| Paso 2000 (rodilla) | 11,80 % | 8,10 % |
| Paso 2400 (final) | 11,20 % | 7,80 % |
| Universal Pooled final | 20,43 % | 16,67 % |

El autor cita como orientación sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev con ~0,9 % EER en VoxCeleb1-O completo, y sistemas de menos de 1 M de parámetros con ~2 % (Wang et al., EfficientTDNN, 2022). Estas cifras corresponden a corpus de miles de hablantes y no son directamente comparables con este checkpoint, entrenado sobre 232 hablantes. No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamano de 2,1 M de parámetros y el frontend Mel; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en CPU.
- Despliegue: el modelo está pensado para la librería `flaxspeaker` (JAX/Flax); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en CPU, lo que sugiere que la inferencia en CPU es viable para volúmenes moderados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | EER referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_pfas` | 2,16 M | recortes 90-180 frames | 11,20 % (1-utt, LibriSpeech 232 hablantes) | Apache 2.0 | Hugging Face, JAX/Flax |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (típico) | ventanas de varios segundos | ~0,9 % en VoxCeleb1-O | varía según implementación | implementaciones comunitarias |
| EfficientTDNN (Wang et al., 2022) | <1 M | no disponible | ~2 % (según cita del autor) | varía | publicación académica |
| Otros checkpoints FlaxSpeaker | variable (small/medium) | recortes variables | variable según checkpoint | Apache 2.0 | colección FlaxSpeaker en Hugging Face |

La comparación directa es limitada: los EER de referencia de ECAPA-TDNN y EfficientTDNN se miden sobre corpus de miles de hablantes, mientras que este checkpoint se evalúa sobre 232 hablantes, por lo que no son cifras equivalentes.

## Limitaciones y advertencias

- Entrenado solo con 232 hablantes de LibriSpeech: la diversidad de hablantes es muy inferior a la de sistemas industriales, lo que limita la generalización a poblaciones reales.
- EER absoluto elevado (11,20 % a 1 utterance en dominio) comparado con sistemas estado del arte; no apto como solución de producción de alta seguridad.
- Riesgo de sobreajuste al dominio LibriSpeech (lectura de audiolibros en inglés); rendimiento en audio espontáneo, ruidoso o multilingüe no evaluado.
- No es un producto oficial de Google; el autor lo declara explícitamente.
- No es una reproducción a gran escala de los papers citados; los resultados no deben extrapolarse a los de esos trabajos.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no es compatible con `AutoFeatureExtractor` de Hugging Face, lo que complica su uso fuera del ecosistema FlaxSpeaker.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías del autor y con la advertencia de que no es un producto soportado.
- Sensibilidad a sesgos demográficos no documentada; en verificación biométrica, la ausencia de evaluación por género, edad o acento es un riesgo relevante.
- No hay información sobre cuantización ni sobre latencia/throughput en producción.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_pfas
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
