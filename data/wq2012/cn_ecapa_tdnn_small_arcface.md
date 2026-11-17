# wq2012/cn_ecapa_tdnn_small_arcface

## Resumen

`cn_ecapa_tdnn_small_arcface` es un checkpoint de reconocimiento de hablante (speaker verification) publicado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos clásicos de verificación de locutor (GE2E, Dr-Vectors, ATP y PFAS) basada únicamente en los papers publicados. El modelo emplea una arquitectura ECAPA-TDNN en variante `small`, con pooling temporal `asp`, objetivo de entrenamiento ArcFace y puntuación por similitud coseno, produciendo embeddings de 192 dimensiones a partir de audio a 16 kHz.

Su relevancia no reside en el rendimiento absoluto, sino en su carácter de benchmark reproducible y de código abierto: es un checkpoint convergido sobre un corpus pequeño (CN-Celeb2, 119 hablantes, 2.909 utterances) entrenado en CPU con semilla fija, pensado para comparaciones relativas controladas dentro del ecosistema FlaxSpeaker. Con 1.684.416 parámetros de inferencia (1.690.176 en safetensors, incluyendo pesos auxiliares), es un modelo muy ligero, adecuado para experimentación en JAX y para integrarse en pipelines de extracción de características de audio.

El checkpoint se distribuye bajo licencia Apache 2.0, con pesos en safetensors y msgpack nativo de Flax, y una frontera de audio propia (`flaxspeaker.AudioFrontend`) que no es un `AutoFeatureExtractor` estándar de Hugging Face, lo que condiciona su integración en el ecosistema transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`small`) con pooling temporal `asp` y cabeza ArcFace |
| Parametros totales | 1.690.176 (safetensors); 1.684.416 de inferencia (encoder + cabeza de scoring, sin clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio con crops variables de 90-180 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado con CN-Celeb2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding | 192 |
| Frecuencia de muestreo | 16.000 Hz |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones + VAD por energía a nivel de frame + CMVN (`flaxspeaker.AudioFrontend`) |
| Libreria | flaxspeaker (JAX/Flax) |
| Pipeline | feature-extraction |
| Datos de entrenamiento | CN-Celeb2 (119 hablantes, 2.909 utterances) |
| Pasos de entrenamiento | 1.800 pasos x 64 utterances (~39,60 epocas), semilla 42 |

## Arquitectura y entrenamiento

El modelo sigue la familia ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network), una arquitectura convolucional 1D con bloques SE-Res2Net y agregación estadística. En esta variante `small` se combina con pooling temporal `asp` (attentive statistics pooling) y se entrena con una función de pérdida ArcFace sobre embeddings de 192 dimensiones, con margen angular con warmup lineal durante los primeros 250 pasos. La verificación en inferencia se realiza por similitud coseno entre embeddings.

El entrenamiento se ejecutó íntegramente en CPU sobre CN-Celeb2 (119 hablantes, 2.909 utterances), con mini-batches de 64 utterances (8 hablantes x 4 utterances) durante 1.800 pasos, equivalentes a ~39,60 épocas, con semilla 42 y crops variables de 90-180 frames con máscara de validez exacta. No se emplearon datos de VoxCeleb2-dev ni infraestructura interna de Google: el autor indica explícitamente que se trata de un checkpoint de benchmark sobre corpus pequeño, no de una reproducción a gran escala de los papers originales. La EER in-domain en CN-Celeb2 evolucionó de 20,60 % (1-utt) en el paso 400 a 17,63 % (1-utt) / 13,00 % (3-utt) en el paso 1.800, con una desviación estándar entre semillas 0-2 de 0,08-0,41 % absoluto en EER agrupada 1-utt.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz (tarea `feature-extraction`).
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) mediante comparación contra un conjunto de embeddings de referencia.
- Puntuación con cabezas GE2E (`w,b`), Dr-Vector y PFAS, además de la cabeza ArcFace de entrenamiento.
- Funciona con audio de duración variable gracias a crops de 90-180 frames y máscara de validez.
- Agnóstico al idioma a nivel de arquitectura (no se documenta un conjunto de idiomas soportados).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo: es un extractor de características, no un modelo generativo.
- No dispone de modo thinking ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera un embedding de 192 dimensiones por utterance y se compara por similitud coseno contra la plantilla del usuario registrado, con un coste computacional mínimo (1,68 M de parámetros) que permite ejecución en CPU.
- Diarización de hablantes en grabaciones cortas: extracción de embeddings por segmento y agrupamiento posterior (clustering) para separar interlocutores en reuniones o entrevistas, aprovechando la robustez del pooling `asp` frente a duraciones variables.
- Autenticación por voz en asistentes y sistemas telefónicos: integración como etapa de scoring dentro de un pipeline de verificación, con umbral calibrado sobre la EER observada en el dominio de despliegue.
- Investigación y docencia en reconocimiento de hablante: el checkpoint sirve como referencia reproducible en JAX/Flax para comparar variantes de pooling, pérdidas (ArcFace vs. GE2E vs. PFAS) y frontends de audio bajo condiciones controladas.
- Benchmarking de pipelines de audio en JAX: al ser un modelo pequeño y convergido con semilla fija, permite medir el impacto de cambios en el frontend (VAD, CMVN, tamaño de crop) sin el ruido de entrenamientos a gran escala.
- Detección de locutor en contenido multimedia a gran escala: el reducido tamaño permite procesar muchos fragmentos en paralelo en CPU o en GPUs modestas, generando índices de embeddings para búsqueda por voz.
- Filtrado de calidad y preprocesado de datasets de voz: uso de los embeddings para detectar inconsistencias de locutor en corpus etiquetados antes de entrenar modelos mayores.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a evaluación in-domain sobre CN-Celeb2 durante el entrenamiento, no a comparaciones estándar entre modelos.

| Metrica | Paso 400 | Paso 1600 | Paso 1800 (final) |
|---|---|---|---|
| EER CN-Celeb2 1-utt | 20,60 % | 17,87 % | 17,63 % |
| EER CN-Celeb2 3-utt | 15,20 % | 13,60 % | 13,00 % |
| EER pooled final 1-utt | no disponible | no disponible | 17,32 % |
| EER pooled final 3-utt | no disponible | no disponible | 12,83 % |

El archivo `eval_results.json` del repositorio incluye además minDCF, ROC-AUC, intervalos de confianza bootstrap al 95 % (8.000 ensayos, semiancho ~0,8 %) y una evaluación sobre un subconjunto de 10 hablantes de VoxCeleb1-O. Como referencia externa citada por el autor (no medida con este checkpoint): sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo, y sistemas de menos de 1 M de parámetros ~2 % (Wang et al., EfficientTDNN, 2022).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,68 M de parámetros en fp32 los pesos ocupan ~6,7 MB, por lo que el grueso del consumo proviene de buffers de audio y del frontend Mel.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo se entrenó en CPU, por lo que la inferencia en CPU es plenamente viable.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en entornos sin GPU.
- Opciones de despliegue: librería `flaxspeaker` (JAX/Flax) desde PyPI; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de texto. La carga puede hacerse desde Hugging Face Hub o desde pesos locales en safetensors o msgpack.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño reducido sugiere latencias de milisegundos por utterance en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cn_ecapa_tdnn_small_arcface` (este) | 1,68 M (inferencia) | Audio 16 kHz, crops 90-180 frames | CN-Celeb2, 119 hablantes, 2.909 utterances | Apache 2.0 | Hugging Face, PyPI `flaxspeaker` |
| ECAPA-TDNN publicado (Desplanques et al., 2020) | ~20 M (referencia típica) | Audio 16 kHz | VoxCeleb2-dev, 5.994 hablantes, ~1,1 M utterances | No disponible en la información | Pesos no publicados en abierto por los autores originales |
| EfficientTDNN (<1 M parámetros, Wang et al., 2022) | <1 M | Audio 16 kHz | VoxCeleb2-dev | No disponible en la información | No disponible |
| Modelos de la familia FlaxSpeaker (otros checkpoints de la colección) | Variable | Audio 16 kHz | Distintos corpus de benchmark | Apache 2.0 (según colección) | Hugging Face (colección FlaxSpeaker) |

La comparación directa de EER no es válida entre este checkpoint y los sistemas entrenados en VoxCeleb2-dev, dado el diferente número de hablantes y utterances de entrenamiento; el propio autor lo advierte.

## Limitaciones y advertencias

- Checkpoint de benchmark sobre corpus pequeño: 119 hablantes y 2.909 utterances, frente a los miles de hablantes de los sistemas industriales; la EER absoluta (17,63 % 1-utt en CN-Celeb2) está lejos de estado del arte y no debe interpretarse como rendimiento de producción.
- Sesgo de dominio y de hablantes: entrenado únicamente con CN-Celeb2, por lo que el rendimiento fuera de ese dominio (otros idiomas, acentos, canales, ruido) no está caracterizado en la información disponible.
- Riesgo de falsos positivos y negativos en verificación biométrica: la EER elevada implica que un umbral operativo debe calibrarse cuidadosamente; no es adecuado como única barrera de seguridad en autenticación.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face: requiere `flaxspeaker.AudioFrontend` (Mel logarítmico de 80 dimensiones, VAD por energía, CMVN), lo que complica la integración con pipelines estándar de transformers.
- Idiomas soportados no documentados: no se declara cobertura multilingüe ni se han publicado evaluaciones por idioma.
- Sin soporte de tool calling, agentes ni generación: es un extractor de características, no un modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no es un producto oficial de Google y que la reimplementación se basa solo en papers publicados.
- Reproducibilidad dependiente del código: la evaluación de los pesos publicados requiere la versión actual del código y el frontend documentado; cambios en el pipeline pueden alterar las métricas archivadas.
- Intervalos de confianza bootstrap (~0,8 % de semiancho) y variabilidad entre semillas (0,08-0,41 %) deben tenerse en cuenta al comparar configuraciones.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/cn_ecapa_tdnn_small_arcface
- Colección FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
