# wq2012/ls_resnet_small_ge2e

## Resumen

`ls_resnet_small_ge2e` es un modelo de extracción de embeddings de hablante (speaker embeddings) para tareas de verificación e identificación de voz, desarrollado por el autor independiente wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de los algoritmos GE2E, Dr-Vectors, ATP y PFAS descritos en la literatura académica, sin uso de código ni datos propietarios. El modelo emplea una arquitectura ResNet de tamaño "small" con pooling temporal ASP y se entrena con la función de pérdida GE2E softmax, produciendo representaciones de 192 dimensiones comparables mediante similitud coseno.

El checkpoint es deliberadamente pequeño: 2.243.904 parámetros totales según los pesos en safetensors (2.239.922 en el encoder y la cabeza de scoring), y un repositorio de 0,1 GB. Se ha entrenado únicamente con LibriSpeech (232 hablantes, 5.788 utterances) durante 2.600 pasos (~14,37 épocas), por lo que su utilidad principal es servir como referencia reproducible y ligera dentro del benchmark de FlaxSpeaker, no como sistema de producción a gran escala.

Su relevancia actual reside en la reproducibilidad: el autor documenta huellas de pérdida en el paso 0, intervalos de confianza bootstrap y resultados de control entre semillas, lo que facilita comparaciones relativas controladas entre variantes de arquitectura y funciones de pérdida. Es, por tanto, una pieza de benchmarking más que un modelo de altas prestaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (variante `small`) con pooling temporal ASP |
| Parametros totales | 2.243.904 (safetensors); 2.239.922 en encoder + cabeza de scoring |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio por recortes variables de 90-180 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado solo con LibriSpeech, inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y Flax msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo es una red ResNet de tamano "small" orientada a la extraccion de embeddings de hablante, con una cabeza de pooling temporal de tipo ASP (Attentive Statistical Pooling) y una dimension de representacion de salida de 192. La funcion de perdida es GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, y la verificacion se realiza mediante similitud coseno. El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino el componente `flaxspeaker.AudioFrontend`: Mel logaritmico natural de 80 dimensiones a 16.000 Hz, VAD a nivel de frame basado en energia y normalizacion CMVN.

El entrenamiento se realizo sobre LibriSpeech unicamente (232 hablantes, 5.788 utterances), con 2.600 pasos de gradiente y mini-batches de 32 utterances (8 hablantes x 4 utterances), lo que equivale a unas 14,37 epocas con semilla 42 sobre una estacion de trabajo CPU. Se usaron recortes de longitud variable U(90, 180) frames con mascara de validez exacta, y el autor documenta que la huella de perdida en el paso 0 con estos recortes coincide con la archivada (2,0705). No se menciona RLHF ni DPO; el entrenamiento es puramente discriminativo con la perdida GE2E. Las innovaciones tecnicas destacables son la reimplementacion fiel de las perdidas Dr-Vectors y PFAS, y la inclusion de intervalos de confianza bootstrap (8.000 ensayos, semi-anchura ~0,8 %) para las metricas.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificacion de hablante (misma persona o no) mediante similitud coseno.
- Identificacion de hablante por comparacion contra un conjunto de embeddings de referencia.
- Scoring con cabezas GE2E `w,b`, Dr-Vector y PFAS.
- Procesamiento de audio con VAD y CMVN integrados en el frontend.
- Inferencia en JAX/Flax, con pesos exportables a safetensors.
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el entrenamiento se limita a ingles de LibriSpeech.

## Casos de uso

- Benchmark reproducible de arquitecturas de speaker verification: el checkpoint sirve como referencia fija para comparar variantes de ResNet, pooling y funciones de perdida dentro de FlaxSpeaker, gracias a sus huellas de perdida y metricas archivadas.
- Verificacion de hablante en prototipos academicos: con 2,2 M de parametros y 0,1 GB de repositorio, se puede desplegar en entornos de laboratorio para validar pipelines de embeddings y scoring coseno antes de escalar a modelos mayores.
- Docencia e investigacion sobre perdidas GE2E: el modelo permite reproducir el comportamiento de la perdida GE2E softmax con centroides leave-one-out en un corpus pequeno y controlado.
- Pruebas de integracion de `flaxspeaker`: sirve para validar la API de la libreria (carga de config, frontend de audio, extraccion de embeddings) en CI sin necesidad de GPU.
- Experimentos de sensibilidad a la duracion del audio: los recortes U(90, 180) frames y las metricas 1-utt vs 3-utt permiten estudiar como afecta la duracion de la utterance al EER.
- Baseline para comparativas controladas entre semillas: los resultados de control entre semillas 0-2 (desviacion de 0,08-0,41 % absoluto) permiten establecer umbrales de significancia en experimentos propios.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (EER en LibriSpeech, conjunto in-domain):

| Metrica | Paso 400 | Paso 2200 (knee) | Paso 2600 (final) |
|---|---|---|---|
| EER 1-utt | 13,60 % | 9,83 % | 9,53 % |
| EER 3-utt | 11,60 % | 6,30 % | 6,00 % |
| EER pooled universal 1-utt | no disponible | no disponible | 20,12 % |
| EER pooled universal 3-utt | no disponible | no disponible | 15,87 % |

El autor indica ademas que el checkpoint incluye `eval_results.json` con metricas multi-dominio (EER 1-utt y 3-utt, minDCF, ROC-AUC, intervalos bootstrap del 95 % y un subconjunto de 10 hablantes de VoxCeleb1-O), pero los valores concretos de minDCF y ROC-AUC no se detallan en la informacion disponible. Como referencia externa, el autor cita ECAPA-TDNN sobre VoxCeleb2-dev con ~0,9 % EER en VoxCeleb1-O y sistemas sub-1M con ~2 % EER, sin que sean comparaciones directas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32; el modelo tiene 2,2 M de parametros y el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100. El autor entreno en CPU, lo que indica que la inferencia es viable sin GPU.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: JAX/Flax mediante la libreria `flaxspeaker` (>= 0.5.0); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_resnet_small_ge2e` | 2,24 M | recortes 90-180 frames, 16 kHz | 9,53 % (1-utt) / 6,00 % (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | no disponible | ~0,9 % en VoxCeleb1-O | no disponible | referencia bibliografica |
| EfficientTDNN sub-1M (Wang et al., 2022) | < 1 M | no disponible | ~2 % | no disponible | referencia bibliografica |

La comparacion no es directa: los sistemas ECAPA-TDNN y EfficientTDNN se entrenan sobre VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances), mientras que este checkpoint usa 232 hablantes de LibriSpeech. El propio autor advierte que las cifras no son comparables como estado del arte.

## Limitaciones y advertencias

- Entrenado solo con 232 hablantes de LibriSpeech; la diversidad de hablantes limita el EER absoluto frente a sistemas industriales.
- EER in-domain de 9,53 % (1-utt) y 6,00 % (3-utt): insuficiente para produccion real de verificacion de hablante.
- El EER pooled universal sube a 20,12 % (1-utt) y 15,87 % (3-utt), lo que indica degradacion fuera de las condiciones de entrenamiento.
- Entrenado unicamente con ingles de LibriSpeech; el comportamiento en otros idiomas no esta caracterizado.
- No es un producto oficial de Google; es una reimplementacion independiente sin codigo ni datos propietarios.
- El frontend de audio no es un `AutoFeatureExtractor` estandar, lo que complica la integracion con pipelines de Hugging Face.
- Riesgo de sesgo por el corpus: LibriSpeech contiene lectura de audiolibros con acentos y condiciones acusticas limitadas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos/negativos en la verificacion.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento del modelo no lo hace apto para ello sin fine-tuning y validacion adicionales.
- Las metricas tienen una semi-anchura bootstrap de ~0,8 % y una desviacion entre semillas de 0,08-0,41 %, a tener en cuenta al comparar variantes.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_resnet_small_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
