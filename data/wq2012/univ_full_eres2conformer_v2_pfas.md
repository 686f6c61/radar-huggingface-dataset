# wq2012/univ_full_eres2conformer_v2_pfas

## Resumen

`univ_full_eres2conformer_v2_pfas` es un modelo de verificación e identificación de locutor (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: es un extractor de embeddings de locutor de 1.280 dimensiones construido sobre una arquitectura ERes2Conformer de tamaño "large", con pooling temporal híbrido PFAS y una función de pérdida Extended-Set Softmax. Su propósito es convertir fragmentos de audio en representaciones vectoriales que permitan decidir si dos grabaciones corresponden a la misma persona.

El checkpoint se presenta como una reimplementación desde cero en JAX/Flax, basada únicamente en papers publicados (GE2E, Dr-Vectors, ATP y PFAS), sin código ni datos propietarios. Se entrenó sobre un corpus universal abierto que combina VoxCeleb1/2, CN-Celeb 1+2 y LibriSpeech 960h, con 12.193 locutores y 1.708.852 enunciados limpios, ampliados mediante perturbación de velocidad y aumentación MUSAN/RIR. El modelo tiene 46.469.194 parámetros de inferencia (encoder más cabeza de scoring) y un tamaño de repositorio de 0,4 GB.

Es relevante ahora porque ofrece una alternativa abierta, en licencia Apache 2.0 y con pesos en safetensors, a los sistemas de verificación de locutor habitualmente cerrados o ligados a infraestructura propietaria, y porque su entrenamiento multi-corpus busca robustez entre dominios (inglés y chino, lectura y conversación espontánea). La librería requiere `flaxspeaker >= 0.7.0` y utiliza un frontend de audio propio (Mel logarítmico de 80 dimensiones a 16 kHz con VAD y CMVN), no un `AutoFeatureExtractor` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (`large`) con pooling temporal `hybrid_pfas` |
| Parametros totales | 46.469.194 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se entrenó con recortes variables de 168 a 240 frames; no se declara una ventana máxima de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con corpus en inglés y chino: VoxCeleb, CN-Celeb, LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimension de embedding | 1280 |
| Funcion de perdida | Extended-Set Softmax mezclada (0,50 row-softmax + 0,50 extended-set con desplazamiento -log N) |
| Scorer de verificacion | Hibrido coseno + PFAS-SN (alpha = 0,4368; coseno 256-D + 8 claves x (32 + 96)) |
| Frontend de audio | Mel logarítmico natural de 80 dims a 16 kHz + VAD por energia + CMVN |
| Libreria | `flaxspeaker` (JAX/Flax), version >= 0.7.0 |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El backbone es un ERes2Conformer de variante `large`, una arquitectura conformer (convolución más atención) adaptada a reconocimiento de locutor, sobre la que se aplica un pooling temporal `hybrid_pfas`. La salida es un embedding de 1.280 dimensiones. La verificación combina similitud coseno sobre 256 dimensiones con un scorer PFAS (Parameter-Free Attentive Scoring) que emplea 8 claves de 32 y 96 dimensiones, ponderados con alpha = 0,4368. La pérdida es una variante propia de Extended-Set Softmax: 0,50 de row-softmax más 0,50 de extended-set con un desplazamiento de logit -log N, que el autor indica explícitamente que no coincide con la ecuación 2 del paper original.

El entrenamiento se realizó durante 24.000 pasos de gradiente con batch de 512 enunciados (aproximadamente 7,19 épocas), warmup de 400 pasos y semilla 42, sobre 12.193 locutores y 1.708.852 enunciados limpios de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, sin solapamiento de locutores con los conjuntos de evaluación oficiales. Se aplicaron recortes variables de 168 a 240 frames con máscara de validez exacta, además de perturbación de velocidad en tres vías y aumentación MUSAN/RIR. El autor documenta la reproducibilidad del paso 0 (pérdida archivada 0,2956 frente a 0,2946-0,2974 con el código actual) y una desviación estándar entre semillas de 0,08-0,41 % absoluto en EER agrupada de 1 utterance, con un intervalo de confianza bootstrap del 95 % de aproximadamente 0,8 % para 8.000 ensayos.

## Capacidades

- Extracción de embeddings de locutor de 1.280 dimensiones a partir de audio.
- Verificación de locutor uno a uno (misma persona o distinta) mediante score híbrido coseno + PFAS.
- Identificación de locutor por comparación contra una galería de embeddings.
- Reconocimiento robusto entre dominios: entrenado con audio de lectura (LibriSpeech) y conversacional (VoxCeleb, CN-Celeb).
- Soporte de audio en inglés y chino a través de los corpus de entrenamiento (no se declara una lista formal de idiomas).
- Normalización de scores AS-Norm documentada en la evaluación.
- Evaluación con múltiples utterances por locutor (1-utt y 3-utt).
- No soporta generación de texto, tool calling, agentes, visión ni razonamiento multi-paso: es un modelo exclusivamente de audio.

## Casos de uso

- Verificación biométrica de acceso: el modelo compara el audio de enrolamiento con el audio de prueba y devuelve un score; con AS-Norm y umbral calibrado puede integrarse en un control de acceso por voz en aplicaciones internas.
- Identificación de hablantes en reuniones: extrayendo embeddings por segmento y comparándolos contra una galería de participantes conocidos, permite atribuir intervenciones en transcripciones diarizadas.
- Autenticación antifraude en call centers: verificar que la voz del cliente coincide con la registrada previamente añade una capa de seguridad en operaciones sensibles, usando el score híbrido coseno + PFAS.
- Indexado y búsqueda de archivos de audio: generar embeddings de una fonoteca y permitir búsquedas por locutor mediante similitud vectorial, aprovechando el espacio de 1.280 dimensiones.
- Control de calidad de datasets de voz: detectar locutores duplicados o no declarados en corpus de entrenamiento comparando embeddings entre pares de utterances.
- Filtrado de hablante en pipelines de ASR: seleccionar o descartar segmentos según el locutor objetivo antes de transcribir, útil en grabaciones multi-hablante.
- Investigación en biometría de voz: servir como baseline abierto y reproducible (Apache 2.0, pesos safetensors) para comparar técnicas de pooling y scoring.

## Benchmarks y rendimiento

El autor publica métricas de evaluación zero-shot en `eval_results.json` (EER de 1 y 3 utterances, minDCF, ROC-AUC, intervalos bootstrap del 95 % y subconjunto de 10 locutores de VoxCeleb1-O), pero los valores numéricos no están incluidos en la información disponible. La model card referencia una tabla de benchmarks con columnas de EER bruto y EER con AS-Norm, cuyo contenido queda truncado.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,5 millones de parámetros, los pesos en fp32 ocupan aproximadamente 186 MB y en bf16 unos 93 MB, por lo que el modelo es muy ligero en memoria.
- GPU recomendadas: no disponible; cualquier GPU con soporte JAX sirve, incluidas consumer.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifican modelos concretos ni requisitos de memoria adicionales del frontend.
- Opciones de despliegue: librería `flaxspeaker` (JAX/Flax) mediante `load_pretrained` o el script `scripts/inference.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_full_eres2conformer_v2_pfas` | 46,5 M | no disponible | métricas en `eval_results.json` (valores no disponibles) | Apache 2.0 | Hugging Face, PyPI `flaxspeaker` |
| ECAPA-TDNN (referencia de la literatura) | no disponible | no disponible | no disponible | varía según checkpoint | ampliamente disponible |
| WavLM-based speaker models | no disponible | no disponible | no disponible | varía según checkpoint | ampliamente disponibles |

No se dispone de datos comparativos verificados en la información proporcionada; los modelos alternativos citados son referencias genéricas de la categoría y sus cifras no deben tomarse como procedentes de esta ficha.

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; es una reimplementación independiente basada en papers.
- Es un modelo de reconocimiento de locutor, no de lenguaje: no genera texto ni responde preguntas.
- No se declara una lista formal de idiomas soportados; la cobertura lingüística se infiere de los corpus de entrenamiento.
- No se publican datos de sesgo demográfico, acento o canal; el rendimiento puede degradarse en dominios alejados de VoxCeleb, CN-Celeb y LibriSpeech.
- Riesgo de falsos positivos y negativos en verificación biométrica; requiere calibración de umbral y, preferiblemente, AS-Norm antes de uso en producción.
- La variabilidad entre semillas (0,08-0,41 % absoluto en EER) y el intervalo bootstrap (~0,8 %) deben tenerse en cuenta al comparar resultados.
- El frontend de audio es propio y no es un `AutoFeatureExtractor` de Hugging Face; la integración exige usar `flaxspeaker`.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_v2_pfas
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
