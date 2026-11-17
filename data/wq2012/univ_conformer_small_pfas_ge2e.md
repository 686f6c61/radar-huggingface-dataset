# wq2012/univ_conformer_small_pfas_ge2e

## Resumen

`univ_conformer_small_pfas_ge2e` es un modelo de extraccion de embeddings de locutor (speaker embeddings) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: es un extractor de caracteristicas de audio orientado a verificación e identificación de hablante, implementado desde cero en JAX/Flax a partir de los articulos publicados de GE2E, Dr-Vectors, ATP y PFAS. Su tamano es muy reducido: 2.162.187 parametros de inferencia (encoder mas cabeza de scoring), lo que lo situa en la categoria de modelos sub-1M a 2M parametros.

La arquitectura combina un backbone Conformer de configuracion `small` con pooling temporal PFAS (Parameter-Free Attentive Scoring) y un objetivo de entrenamiento GE2E softmax sobre una matriz split-batch par/impar. El resultado es un vector de representacion de 640 dimensiones por utterance, pensado para tareas de comparacion y verificación de locutores.

Es relevante ahora como referencia reproducible y ligera: el autor lo publica explicitamente como un checkpoint de benchmark convergido sobre un corpus controlado de 381 locutores y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1), no como un modelo de estado del arte. Sirve para comparaciones relativas controladas dentro del ecosistema FlaxSpeaker y para experimentacion en entornos con recursos limitados, incluida CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`small`) con pooling temporal PFAS y cabeza de scoring PFAS-SN |
| Parametros totales | 2.162.187 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90 a 180 frames en entrenamiento; ventana de inferencia no especificada en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo es agnostico al idioma en la practica: opera sobre caracteristicas acusticas, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), configuracion en `config.json` |
| Dimension de embedding | 640 |
| Frontend de audio | Mel log-natural de 80 dimensiones a 16.000 Hz + VAD por energia a nivel de frame + CMVN |
| Objetivo de entrenamiento | GE2E softmax sobre matriz split-batch par/impar (no centroides leave-one-out) |
| Datos de entrenamiento | LibriSpeech + CN-Celeb2 + VoxCeleb1 (381 locutores, 9.447 utterances) |
| Presupuesto de entrenamiento | 4.600 pasos, batch de 32 utterances (8 locutores x 4), ~15,58 epochs, semilla 42 |
| Libreria | `flaxspeaker` (JAX/Flax) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer en variante `small`, una arquitectura que combina convoluciones y auto-atencion para modelar dependencias locales y globales en secuencias acusticas. Sobre la salida del encoder se aplica un pooling temporal PFAS, una extension del autor denominada PFAS-SN que combina atencion por frame de tipo `shared_nonlinear` con un ancla global ATP, con 4 claves de 32 + 128 dimensiones y siguiendo las ecuaciones 5-7 del articulo de PFAS. La cabeza de verificación produce embeddings de 640 dimensiones.

El entrenamiento se realizo con el objetivo GE2E softmax sobre una matriz split-batch par/impar (en lugar de centroides leave-one-out, porque el scoring no es coseno). Se uso un frontend de 80 Mel log-natural a 16 kHz con VAD por energia y CMVN, crops de longitud variable U(90, 180) frames con mascara de validez exacta, 4.600 pasos de gradiente con warmup de 460 pasos y batch de 32 utterances (8 locutores x 4 utterances), lo que equivale a unas 15,58 epochs sobre 9.447 utterances de 381 locutores. El entrenamiento se ejecuto en una estacion de trabajo CPU con semilla 42. No se menciona uso de RLHF ni DPO (no aplica a este tipo de modelo). El autor documenta una huella de perdida en el paso 0 de 2,0829 con crops U(90, 180), coincidente con el checkpoint archivado, y una desviacion estandar entre semillas 0-2 de 0,08-0,41 % absoluto en EER pooled 1-utt.

## Capacidades

- Extraccion de embeddings de locutor de 640 dimensiones por utterance (pipeline `feature-extraction`).
- Verificación de locutor (1:1): comparacion de dos utterances para decidir si pertenecen al mismo hablante.
- Identificación de locutor (1:N): comparacion contra un conjunto de enrollments.
- Scoring mediante PFAS-SN con atencion por frame y ancla global ATP.
- Evaluacion con metricas EER, minDCF y ROC-AUC (declaradas en la model card).
- Entrenamiento multi-dominio (tres corpus: LibriSpeech, CN-Celeb2, VoxCeleb1), lo que aporta cierta robustez a variacion de dominio dentro del benchmark controlado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidades multilingues: no documentadas; al operar sobre caracteristicas acusticas es en principio independiente del idioma, pero no hay evaluacion por idioma en la informacion disponible.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de acceso: el modelo genera un embedding de 640 dimensiones por utterance que se compara contra un enrollment previo; su tamano de 2,16 M parametros permite ejecutarlo en CPU o en dispositivos con recursos muy limitados.
- Identificación de hablante en grabaciones cortas: con utterances de una sola toma (1-utt) o agregando tres tomas (3-utt), el modelo permite construir un ranking de candidatos contra una galeria de enrollments; el autor reporta mejor EER en el modo 3-utt.
- Benchmarking reproducible de algoritmos de speaker recognition: al ser una reimplementacion desde cero en JAX/Flax con semilla fija, presupuesto de pasos documentado y huellas de perdida, sirve como linea base controlada para comparar variantes de pooling, scoring o backbone.
- Experimentacion academica en entornos sin GPU: el entrenamiento se realizo en una estacion de trabajo CPU, por lo que es viable reproducir o afinar el modelo en hardware modesto.
- Prototipado de diarizacion o segmentacion asistida por locutor: los embeddings por segmento pueden alimentar un clustering posterior para separar hablantes en una grabacion, aunque el modelo no realiza diarizacion por si mismo.
- Filtrado y curaduria de datasets de audio: los embeddings permiten detectar duplicados de locutor o verificar la consistencia de hablante en corpus de voz antes de usarlos en otros entrenamientos.
- Educacion y docencia: por su tamano y licencia Apache 2.0, es adecuado para ilustrar el pipeline completo de un sistema de verificación de locutor (frontend, encoder, pooling, scoring) en cursos o talleres.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de EER pooled del propio entrenamiento, no comparaciones contra otros modelos en tablas estandar:

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER pooled 1-utt | 24,41 % | 19,20 % | 18,31 % |
| EER pooled 3-utt | 21,37 % | 16,00 % | 15,53 % |

Como referencia contextual citada por el autor (no son resultados de este modelo): los sistemas ECAPA-TDNN publicados entrenados en VoxCeleb2-dev alcanzan aproximadamente 0,9 % EER en la lista completa VoxCeleb1-O (Desplanques et al., 2020), y los sistemas de menos de 1M de parametros alrededor del 2 % (Wang et al., EfficientTDNN, 2022). El autor advierte que este checkpoint esta entrenado sobre un corpus de 381 locutores, no sobre VoxCeleb2-dev (5.994 locutores, ~1,1M utterances), por lo que los EER absolutos no son comparables con esos sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,16 M parametros, los pesos en precision completa ocupan del orden de decenas de MB (el repositorio completo pesa 0,1 GB incluyendo ambos formatos).
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) lo ejecuta con holgura, pero es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer e incluso en CPU: el autor entreno el checkpoint en una estacion de trabajo CPU.
- Opciones de despliegue: la libreria nativa es `flaxspeaker` (JAX/Flax); los pesos se distribuyen en safetensors y Msgpack. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El frontend de audio es `flaxspeaker.AudioFrontend`, no un `AutoFeatureExtractor` de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / datos | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_pfas_ge2e` | 2,16 M | 381 locutores, 9.447 utterances | 18,31 % (1-utt) / 15,53 % (3-utt) en su benchmark | Apache 2.0 | Hugging Face + GitHub + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible en la informacion | VoxCeleb2-dev (5.994 locutores, ~1,1M utterances) | ~0,9 % en VoxCeleb1-O | no disponible | referencia bibliografica |
| EfficientTDNN (Wang et al., 2022) | < 1 M | no disponible | ~2 % | no disponible | referencia bibliografica |

La comparacion directa no es valida en terminos absolutos: los sistemas ECAPA-TDNN y EfficientTDNN se entrenan sobre corpus de miles de locutores, mientras que este checkpoint se limita a 381 locutores. La comparativa solo tiene sentido como referencia de orden de magnitud y para contextualizar el efecto del tamano del corpus de entrenamiento.

## Limitaciones y advertencias

- EER absoluto elevado (18,31 % en 1-utt) por el limitado corpus de entrenamiento (381 locutores); no es un modelo de estado del arte ni apto para producción en verificacion biometrica real sin validacion adicional.
- El autor lo declara explicitamente como checkpoint de benchmark convergido, no como reproduccion a gran escala de los resultados de los articulos.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con LibriSpeech, CN-Celeb2 y VoxCeleb1, puede heredar sesgos de dominio, idioma, acento y genero presentes en esos corpus.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos/negativos en la verificacion de locutor, especialmente con audio ruidoso, canales distintos o utterances muy cortas.
- Limitaciones de contexto: entrenado con crops de 90-180 frames; el comportamiento con utterances mucho mas largas o mas cortas no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y advierte que no es un producto oficialmente soportado por Google.
- El frontend de audio es propio de `flaxspeaker`, no un `AutoFeatureExtractor` estandar, lo que complica la integracion con pipelines de Hugging Face `transformers`.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes.
- Advertencia de reproducibilidad: las metricas archivadas solo se reproducen con crops U(90, 180) y el codigo actual; con crops fijos de 180 frames la huella de perdida en el paso 0 difiere (2,1965 frente a 2,0829).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_pfas_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
