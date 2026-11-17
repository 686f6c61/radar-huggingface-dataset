# wq2012/vox_conformer_small_ge2e

## Resumen

`vox_conformer_small_ge2e` es un extractor de embeddings de hablante desarrollado por el usuario `wq2012` como parte de la biblioteca `FlaxSpeaker`, una reimplementación desde cero en JAX/Flax de algoritmos de verificación e identificación de hablante publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). El modelo transforma una señal de audio en un vector de 192 dimensiones que representa la identidad vocal del hablante, útil para tareas de verificación (¿son la misma persona?) e identificación (¿quién habla?).

La arquitectura combina un backbone Conformer de tamaño pequeño con pooling temporal atento (ATP) y un objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos. El checkpoint tiene 2.029.894 parámetros de inferencia (encoder más cabeza de scoring) y se distribuye en safetensors y msgpack de Flax bajo licencia Apache 2.0.

Es relevante ahora por su carácter didáctico y reproducible: es un benchmark de convergencia sobre un corpus pequeño y autocontenido (750 utterances de 30 hablantes de VoxCeleb1), pensado para comparaciones relativas controladas dentro del ecosistema FlaxSpeaker, no como un modelo de producción a escala industrial. Su EER absoluto (20,50 % a 1 utterance, 16,00 % a 3 utterances) refleja la limitada diversidad de hablantes del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (crops de entrenamiento de 90-180 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo es independiente del idioma en la practica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y flax_model.msgpack (Flax) |
| Dimension del embedding de salida | 192 |
| Objetivo de entrenamiento | GE2E softmax (Wan et al. 2018, Eq. 6; centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel log-natural de 80 dimensiones a 16.000 Hz + VAD por energia a nivel de frame + CMVN (`flaxspeaker.AudioFrontend`, no es un `AutoFeatureExtractor` de Hugging Face) |
| Datos de entrenamiento | VoxCeleb1 (30 hablantes, 750 utterances de la particion de test) |
| Pasos de entrenamiento | 1.000 pasos x 32 utterances (~42,67 epocas), semilla 42 |
| Libreria | flaxspeaker (>= 0.5) |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuracion `small`, una arquitectura que combina bloques de atencion multi-cabeza con convoluciones para capturar dependencias locales y globales en secuencias de audio. Sobre la salida del encoder se aplica un pooling temporal atento (ATP), una cabeza originalmente propuesta para identificacion de idioma en streaming (arXiv:2202.12163), que agrega la secuencia temporal en un unico vector de 192 dimensiones. El entrenamiento emplea la funcion de perdida GE2E softmax con centroides leave-one-out exactos, siguiendo la formulacion de Wan et al. 2018, y la verificacion en inferencia se realiza por similitud coseno entre embeddings.

El checkpoint se entreno hasta convergencia en 1.000 pasos de gradiente con mini-batches de 32 utterances (8 hablantes x 4 utterances) sobre 750 utterances de 30 hablantes de la particion de test de VoxCeleb1, lo que equivale a unas 42,67 epocas. El entrenamiento se ejecuto en una estacion de trabajo con CPU y semilla 42, con un margen de seguridad de dos epocas y warmup de 100 pasos. Se usaron crops de longitud variable U(90, 180) frames con mascara de validez exacta. El autor documenta explicitamente que este checkpoint es una reproduccion a pequena escala de los articulos originales (cuyos experimentos se ejecutaron sobre infraestructura y datos internos de Google) y que no debe interpretarse como una reproduccion de sus resultados a gran escala.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz.
- Verificacion de hablante (speaker verification) mediante similitud coseno entre embeddings.
- Identificacion de hablante (speaker recognition) comparando el embedding contra un conjunto de referencia.
- Scoring con multiples cabezas: GE2E softmax, Dr-Vector y PFAS, segun la configuracion del checkpoint.
- Soporte de evaluacion con 1 utterance y con 3 utterances por hablante (el modo 3-utt mejora el EER).
- Frontend de audio integrado con VAD por energia y CMVN para preprocesar la senal.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de extraccion de caracteristicas de audio.
- Capacidades multilingues: no documentadas; al modelar identidad vocal, el comportamiento es en principio independiente del idioma, pero no hay evaluacion multilingue publicada.

## Casos de uso

- Verificacion de identidad por voz en autenticacion telefonica: el modelo genera un embedding del audio entrante y lo compara por similitud coseno con el embedding de referencia del usuario registrado, con un umbral calibrado sobre el EER observado.
- Identificacion de hablante en grabaciones de reuniones: segmentando el audio por turnos de palabra y agrupando los embeddings resultantes para atribuir cada intervencion a un participante.
- Diarizacion ligera en pipelines de transcripcion: usar los embeddings como caracteristica de agrupamiento (clustering) para separar hablantes antes o despues de la transcripcion automatica.
- Benchmark y validacion de pipelines de reconocimiento de hablante: servir como referencia reproducible dentro de FlaxSpeaker para comparar variantes de arquitectura, pooling o funcion de perdida bajo condiciones controladas.
- Prototipado e investigacion en JAX/Flax: al estar implementado en JAX, permite integrarse en flujos de experimentacion con diferenciacion automatica y aceleracion en TPU/GPU sin salir del ecosistema.
- Deteccion de locutor en contenido multimedia a pequena escala: indexar fragmentos de audio de un catalogo y recuperar por similitud los fragmentos del mismo hablante.
- Filtrado de ruido conversacional en conjuntos de datos: identificar y separar utterances de un mismo hablante para construir subconjuntos curados por identidad vocal.

## Benchmarks y rendimiento

Resultados reportados por el autor en `eval_results.json` y en la model card, sobre el conjunto de evaluacion de VoxCeleb1 (in-domain) y con la metrica EER:

| Metrica | 1 utterance | 3 utterances |
|---|---|---|
| EER paso 400 | 22,50 % | 20,20 % |
| EER paso 900 (rodilla) | 20,25 % | 16,60 % |
| EER paso 1000 (final) | 20,50 % | 16,00 % |
| EER final con pooling universal | 23,64 % | 20,70 % |

El autor indica que la desviacion estandar entre semillas 0-2 del EER agrupado a 1 utterance es de 0,08-0,41 % absoluto, y que el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %. Como referencia externa, la model card cita sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev con alrededor del 0,9 % de EER en la lista completa VoxCeleb1-O, y sistemas de menos de 1M de parametros con alrededor del 2 % (Wang et al., EfficientTDNN, 2022). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint tiene 2.029.894 parametros, por lo que en fp32 ocupa aproximadamente 8 MB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores. Tambien puede ejecutarse en CPU, como de hecho se entreno.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 1-2 GB de memoria disponible.
- Opciones de despliegue: la libreria `flaxspeaker` es la via oficial; al ser un modelo Flax/JAX, puede servirse con infraestructura JAX propia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER VoxCeleb1-O | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vox_conformer_small_ge2e` | 2,03 M | audio 16 kHz, crops 90-180 frames | 20,50 % (1-utt) / 16,00 % (3-utt) en su split de 30 hablantes | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible en la informacion | audio 16 kHz | ~0,9 % en VoxCeleb1-O completo (entrenado en VoxCeleb2-dev) | no disponible | referencia bibliografica |
| EfficientTDNN (Wang et al., 2022) | <1 M | audio 16 kHz | ~2 % en VoxCeleb1-O (entrenado en corpus mayor) | no disponible | referencia bibliografica |

La comparacion no es directa: los sistemas de referencia se entrenaron sobre VoxCeleb2-dev (5.994 hablantes, ~1,1M utterances), mientras que este checkpoint se entreno sobre 30 hablantes y 750 utterances. El autor advierte explicitamente que las cifras no son comparables como estado del arte.

## Limitaciones y advertencias

- El EER absoluto es alto (20,50 % a 1 utterance) debido a la baja diversidad de hablantes del conjunto de entrenamiento (30 hablantes), muy lejos de los corpus industriales de miles de hablantes.
- No es una reproduccion a gran escala de los articulos originales: el autor lo declara como benchmark de convergencia sobre corpus pequeno, no como modelo de produccion.
- Riesgo de sobreajuste al dominio de VoxCeleb1: el rendimiento fuera de ese dominio (otros idiomas, condiciones acusticas, canales) no esta documentado.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, lo que dificulta la integracion con pipelines estandar de `transformers`.
- No hay evaluacion multilingue publicada; el comportamiento en idiomas distintos del ingles no esta caracterizado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido habitual (no genera texto), pero si puede producir embeddings poco discriminativos ante audio ruidoso o hablantes no representados en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor advierte que el modelo no es un producto oficialmente soportado por Google.
- Para produccion real se recomienda un modelo entrenado sobre corpus de miles de hablantes; este checkpoint es adecuado para investigacion, benchmarking y prototipado.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/vox_conformer_small_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
