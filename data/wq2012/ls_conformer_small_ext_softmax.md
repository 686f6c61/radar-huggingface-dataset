# wq2012/ls_conformer_small_ext_softmax

## Resumen

`ls_conformer_small_ext_softmax` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` como parte de **FlaxSpeaker**, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de locutor (GE2E, Dr-Vectors, ATP y PFAS). El modelo no es un producto oficial de Google; se construyó únicamente a partir de los papers publicados, sin código ni datos propietarios.

Arquitectura Conformer de tamaño "small" con pooling temporal atento (ATP) y una cabeza de clasificación entrenada con un objetivo *blended extended-set softmax*. Genera embeddings de 192 dimensiones que se comparan mediante similitud coseno para decidir si dos fragmentos de audio pertenecen al mismo locutor. El checkpoint publicado tiene **2.029.894 parámetros** de inferencia (encoder más cabeza de scoring, excluyendo pesos de clasificación usados solo en entrenamiento).

Es relevante como referencia reproducible y ligera para experimentación en verificación de locutor: se entrenó en CPU sobre un corpus pequeño (LibriSpeech, 232 locutores, 5.788 utterances) hasta convergencia en 2.400 pasos, y sirve para comparaciones relativas controladas dentro del benchmark de FlaxSpeaker, no como modelo de estado del arte. Su licencia Apache 2.0 y su tamaño inferior a 3M de parámetros lo hacen atractivo para prototipado y despliegue en entornos con recursos muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (`small`) con pooling temporal atento (ATP) |
| Parámetros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos de clasificación de entrenamiento) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de longitud variable; entrenado con recortes de 90 a 180 frames) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors y msgpack; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (entrenado solo con LibriSpeech, que es inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` y `flax_model.msgpack` (Flax nativo) |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuración "small", con un frontend de audio propio (`flaxspeaker.AudioFrontend`, no un `AutoFeatureExtractor` de Hugging Face): Mel de 80 dimensiones en escala logarítmica natural a 16 kHz, VAD a nivel de frame basado en energía y normalización CMVN. Sobre las representaciones del encoder se aplica un pooling temporal atento (ATP, tomado de un paper de identificación de idioma) que produce un embedding de 192 dimensiones. La verificación se realiza con similitud coseno entre embeddings.

El entrenamiento usó exclusivamente LibriSpeech (232 locutores, 5.788 utterances), con mini-batches de 32 utterances (8 locutores x 4 utterances), 2.400 pasos de gradiente (~13,27 épocas) y semilla 42, sobre una estación de trabajo CPU. El objetivo es un *blended extended-set softmax* propio de FlaxSpeaker (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit −log N), que no coincide con la ecuación 2 del paper original. Se emplearon recortes variables de U(90, 180) frames con máscara de validez exacta. El EER in-domain en LibriSpeech evolucionó de 24,90 % (1 utterance) / 22,20 % (3 utterances) en el paso 400 a 14,00 % / 9,20 % en el paso 2.400.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificación de locutor (1:1) mediante similitud coseno.
- Identificación de locutor (1:N) comparando contra un conjunto de embeddings de referencia.
- Reconocimiento de locutor independiente del texto hablado.
- Pipeline de audio completo integrado: VAD por energía y CMVN además del encoder.
- Compatible con evaluación multi-utterance (promedio de embeddings de 1 o 3 utterances).
- No soporta tool calling, agentes, visión, audio generativo ni generación de texto: es un modelo de representación, no un LLM.

## Casos de uso

- **Verificación biométrica ligera en dispositivos embebidos**: con menos de 2,1M de parámetros, el modelo puede ejecutarse en CPU o en microcontroladores con aceleración, comparando el embedding de una frase de acceso contra el embedding de referencia del usuario mediante coseno.
- **Diarización preliminar de reuniones**: extraer embeddings por segmento y agruparlos por similitud para etiquetar hablantes en grabaciones cortas, usando el VAD integrado para descartar silencios.
- **Control de acceso por voz en aplicaciones móviles**: enrolamiento con 3 utterances (el modelo reporta EER de 9,20 % en ese régimen in-domain) y verificación posterior en el dispositivo, sin enviar audio a la nube.
- **Filtrado de locutor en pipelines de transcripción**: descartar o etiquetar segmentos de audio según el locutor objetivo antes de pasarlos a un ASR, reduciendo coste de transcripción.
- **Investigación y docencia en biometría de voz**: servir como baseline reproducible en JAX/Flax para comparar pérdidas (GE2E, Dr-Vectors, PFAS) y estrategias de pooling en corpus pequeños.
- **Detección de reutilización de audio**: comparar embeddings de fragmentos sospechosos contra un catálogo de locutores conocidos para detectar reemisiones o suplantaciones en un corpus controlado.
- **Prototipado rápido de sistemas de identificación 1:N**: indexar embeddings de una plantilla de locutores y hacer búsqueda por coseno con umbral calibrado sobre el propio corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card (in-domain, LibriSpeech; EER en %):

| Régimen | Paso 400 | Paso 2000 | Paso 2400 (final) |
|---|---|---|---|
| EER 1-utt | 24,90 | 14,27 | 14,00 |
| EER 3-utt | 22,20 | 9,20 | 9,20 |
| Universal Pooled 1-utt | no disponible | no disponible | 22,32 |
| Universal Pooled 3-utt | no disponible | no disponible | 18,23 |

Datos adicionales reportados: desviación estándar entre semillas 0-2 del EER pooled 1-utt de 0,08-0,41 % absoluto; intervalo de confianza bootstrap del 95 % (8.000 ensayos) con semiancho de ~0,8 %. El archivo `eval_results.json` incluye además minDCF, ROC-AUC, intervalos bootstrap y una evaluación en un subconjunto de 10 locutores de VoxCeleb1-O, pero sus valores numéricos no se detallan en la información disponible.

Como referencia externa citada por el autor: ECAPA-TDNN entrenado en VoxCeleb2-dev alcanza ~0,9 % EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas de menos de 1M de parámetros ~2 % (Wang et al., EfficientTDNN, 2022). Estas cifras no son comparables directamente porque este checkpoint se entrenó en un corpus de 232 locutores, no en VoxCeleb2-dev (5.994 locutores, ~1,1M utterances).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier RTX 3060 o superior es más que suficiente. Para lotes grandes, una RTX 4090 o A100 aportan margen de sobra.
- Cabe en GPU consumer: sí, en todas las generaciones recientes (GTX 1650, RTX 3050, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: la librería `flaxspeaker` (PyPI) con JAX/Flax es la vía documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Los pesos también están en safetensors, lo que permite cargarlos con otras herramientas.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento se realizó en CPU, lo que sugiere que la inferencia es viable sin acelerador.

## Comparativa con modelos similares

| Modelo | Parámetros | Corpus de entrenamiento | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_ext_softmax` | ~2,03M | LibriSpeech (232 locutores) | 14,00 % (1-utt) / 9,20 % (3-utt) in-domain | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20M (referencia típica) | VoxCeleb2-dev (5.994 locutores) | ~0,9 % en VoxCeleb1-O | no disponible | Implementaciones en SpeechBrain y otras |
| EfficientTDNN (Wang et al., 2022) | <1M | VoxCeleb2-dev | ~2 % en VoxCeleb1-O | no disponible | no disponible |
| Otros checkpoints FlaxSpeaker | no disponible | LibriSpeech | variable según configuración | Apache 2.0 | Colección FlaxSpeaker en Hugging Face |

La comparación directa no es limpia: los sistemas de referencia se entrenaron en corpus de miles de locutores, mientras que este checkpoint se limita a 232. La comparación válida es dentro del benchmark FlaxSpeaker.

## Limitaciones y advertencias

- **No es un producto oficial de Google**; es una reimplementación independiente basada solo en papers.
- **No es estado del arte**: el EER in-domain de 14,00 % (1-utt) está muy lejos de los sistemas entrenados en VoxCeleb2-dev (~0,9 %). El propio autor lo describe como checkpoint de benchmark de corpus pequeño.
- **Diversidad de locutores limitada**: 232 locutores y máximo 25 utterances por locutor; el rendimiento en locutores fuera de dominio (acentos, idiomas, condiciones acústicas distintas) no está caracterizado.
- **Idioma**: entrenado solo con LibriSpeech (inglés); no se documenta soporte multilingüe.
- **Riesgo de alucinación no aplica** en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la verificación según el umbral de coseno elegido; hay que calibrarlo por dominio.
- **Sesgos**: no se documentan análisis de sesgo por género, edad o acento; el corpus de entrenamiento puede inducir sesgos no medidos.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor advierte que los resultados no deben presentarse como reproducción de los papers originales.
- **Frontend no estándar**: usa `flaxspeaker.AudioFrontend` (VAD + CMVN), no un `AutoFeatureExtractor` de Hugging Face; requiere la librería `flaxspeaker` para reproducir exactamente las métricas.
- **Caveat de producción**: el EER reportado es in-domain y con intervalos bootstrap de ~0,8 % de semiancho; no debe extrapolarse a despliegues reales sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_ext_softmax
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
