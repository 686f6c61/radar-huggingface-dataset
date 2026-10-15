# wq2012/univ_conformer_small_pfas

## Resumen

`univ_conformer_small_pfas` es un modelo de verificación e identificación de hablante (speaker verification) publicado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproducción open source en JAX/Flax de varios algoritmos de reconocimiento de hablante descritos en trabajos previos de Google. El modelo genera embeddings de hablante de 640 dimensiones y una puntuación de verificación a partir de audio bruto procesado con un frontend log-mel de 80 dimensiones a 16 kHz.

La arquitectura combina un backbone Conformer de tamano "small" (about 2,16 millones de parametros) con temporal pooling PFAS (Parameter-Free Attentive Scoring), funcion de perdida Extended Set Softmax y puntuacion de verificación tambien basada en PFAS. Esta pensado como modelo universal: se entrena sobre dominios diversos (ingles leido, chino multigenero y audio de celebridades en condiciones reales) para funcionar de forma razonablemente robusta sin reentrenamiento especifico por dominio.

Es relevante ahora porque ofrece un checkpoint ligero, con licencia Apache-2.0 y pesos en safetensors y msgpack de Flax, facil de integrar como bloque de embeddings de hablante en sistemas de diarizacion, control de acceso por voz o personalizacion condicionada por hablante. Conviene tener en cuenta que no es un producto oficial de Google y que reproduce tecnicas publicadas sin usar la infraestructura ni los datos internos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (backbone `small`) con temporal pooling PFAS |
| Parametros totales | 2.162.184 (safetensors); la model card indica 2.162.187 parametros de encoder |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; procesa audio de longitud variable con frontend log-mel de 80 dimensiones a 16 kHz + Energy VAD + CMVN |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en los metadatos; entrenado con datos en ingles (LibriSpeech), chino (CN-Celeb) y multilingue/in-the-wild (VoxCeleb) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer que combina bloques de atencion y convoluciones, en su variante "small". Sobre la representacion temporal se aplica un pooling atentivo PFAS (Parameter-Free Attentive Scoring), que produce el embedding de hablante de 640 dimensiones y se reutiliza como mecanismo de puntuacion en la verificación. El entrenamiento utiliza la perdida Extended Set Softmax, una extension de las perdidas de tipo set-softmax empleadas en reconocimiento de hablante. La puntuacion de verificación tambien emplea PFAS.

El dominio de entrenamiento declarado es "universal", con evaluacion multi-dominio sobre LibriSpeech (ingles leido), CN-Celeb2 (chino multi-genero) y VoxCeleb1 (celebridades en condiciones reales). El frontend de audio es compatible con `WhisperFeatureExtractor` (80-dim log-mel a 16 kHz) e incorpora Energy VAD y normalizacion CMVN. El proyecto es una reproduccion clean-room en JAX/Flax de tecnicas publicadas (GE2E, Dr-Vectors, Conformer-ATP y PFAS); los articulos originales se entrenaron con infraestructura y datasets internos de Google, no con esta libreria ni con los splits publicos usados aqui. No se detallan en la informacion disponible el numero total de tokens/horas de audio de entrenamiento ni si hubo etapas de RLHF/DPO (no aplicables habitualmente en speaker verification).

## Capacidades

- Extraccion de embeddings de hablante de 640 dimensiones a partir de audio.
- Verificacion de hablante (1 utterance y multi-enrollment con 3 utterances) mediante puntuacion PFAS.
- Identificacion y clasificacion de audio a nivel de hablante (pipeline `audio-classification`).
- Funcionamiento en dominio universal: evaluado en ingles leido, chino multigenero y audio in-the-wild.
- Frontend de audio estandarizado (log-mel de 80 dimensiones a 16 kHz con Energy VAD y CMVN).
- Carga desde Hugging Face Hub o directorio local mediante la API `flaxspeaker.load_pretrained`, con metodos `extract_embedding` y `verify`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de audio, no generativo de texto).
- Capacidades multilingues: no declaradas explicitamente; los datos de entrenamiento cubren ingles, chino y audio multilingue.

## Casos de uso

- Verificacion biometrica de voz en control de acceso: el modelo compara un audio de enrollment con un audio de test y devuelve una puntuacion de similitud, adecuado para autenticacion ligera en dispositivos con recursos limitados gracias a sus about 2,16 millones de parametros.
- Multi-enrollment para mejorar robustez: con 3 utterances de enrollment por hablante se reduce el EER de forma notable (por ejemplo, en LibriSpeech de 15,83 % a 10,80 %), lo que resulta util en aplicaciones donde se puede pedir al usuario varias muestras.
- Diarizacion de reuniones: los embeddings de 640 dimensiones se pueden agrupar por similitud para segmentar quien habla en cada tramo de una grabacion multi-hablante.
- Personalizacion condicionada por hablante: usar el embedding como senal de condicionamiento en sistemas de reconocimiento de voz o de VAD (el autor mantiene modelos relacionados, como `personal-vad-v2-conformer-unified`).
- Deteccion de suplantacion o fraude en call centers: puntuar la coherencia entre la voz declarada y la voz de la llamada para marcar posibles anomalias.
- Analisis de grandes archivos de audio para busqueda por hablante: indexar embeddings y recuperar apariciones de una misma voz en catalogos de podcasts, entrevistas o archivos historicos.
- Investigacion en reproduccion de algoritmos: servir de base reproducible (JAX/Flax, Apache-2.0) para comparar GE2E, Dr-Vectors, Conformer-ATP y PFAS sobre datasets publicos.

## Benchmarks y rendimiento

Verificacion de 1 utterance por dominio (resultados publicados en `eval_results.json`):

| Split | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---:|---:|---|---:|---:|---:|
| LibriSpeech (ingles leido) | 3.000 | 15,83 | [14,53; 17,22] | 0,8247 | 0,7313 | 0,9252 |
| CN-Celeb2 (chino multigenero) | 3.000 | 23,17 | [21,42; 24,47] | 0,9153 | 0,8207 | 0,8635 |
| VoxCeleb1 (in-the-wild) | 2.000 | 22,95 | [20,90; 24,85] | 0,9500 | 0,9330 | 0,8637 |
| Universal pooled (3 dominios) | 8.000 | 20,35 | [19,48; 21,21] | 0,8972 | 0,8295 | 0,8888 |
| Universal macro-average (3 dominios) | 8.000 | 20,65 | — | 0,8967 | 0,8283 | 0,8841 |

Verificacion multi-enrollment con 3 utterances:

| Split | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---:|---:|---|---:|---:|
| LibriSpeech (3-utt) | 1.000 | 10,80 | [8,80; 12,85] | 0,6600 | 0,9617 |
| CN-Celeb2 (3-utt) | 1.000 | 18,60 | [16,20; 21,00] | 0,9140 | 0,9008 |
| VoxCeleb1 (3-utt) | 1.000 | 18,00 | [15,90; 21,00] | 0,8440 | 0,9027 |
| Universal pooled (3-utt) | 3.000 | 16,00 | [14,73; 17,33] | 0,9093 | 0,9251 |
| Universal macro-average (3-utt) | 3.000 | 15,80 | — | 0,8060 | 0,9217 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en forma de tabla cruzada; los valores anteriores son los unicos datos de rendimiento aportados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 MB en fp32 y unos 4,3 MB en fp16 para los pesos de un modelo de 2,16 millones de parametros; el consumo real dependera del buffer de audio y de la implementacion en JAX.
- GPU recomendadas: cualquier GPU moderna sirve; por tamano no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja son mas que suficientes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU y en plataformas moviles/embebidas.
- Opciones de despliegue: libreria `flaxspeaker` (JAX/Flax) mediante `load_pretrained`, inferencia por linea de comandos con `scripts/inference.py`, y carga de pesos desde `model.safetensors` o `flax_model.msgpack`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje, no a este tipo de modelo de audio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EER (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_pfas` | 2.162.184 | no disponible (audio de longitud variable) | 15,83 % LibriSpeech 1-utt / 10,80 % 3-utt (segun la model card) | apache-2.0 | Hugging Face (`wq2012/univ_conformer_small_pfas`) |
| ECAPA-TDNN | no disponible en la informacion proporcionada | no disponible | no disponible | segun implementacion | no disponible |
| x-vector / GE2E | no disponible en la informacion proporcionada | no disponible | no disponible | segun implementacion | no disponible |
| Modelos basados en WavLM para speaker verification | no disponible en la informacion proporcionada | no disponible | no disponible | segun implementacion | no disponible |

No se dispone en la informacion proporcionada de parametros, contexto, EER ni condiciones de licencia de los modelos alternativos, por lo que la comparacion cuantitativa queda como "no disponible".

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; es una reproduccion open source independiente de tecnicas publicadas.
- Los EER son relativamente altos (about 15,8 % en el mejor dominio y 20-23 % en los demas) en comparacion con sistemas de verificacion de hablante de ultima generacion; en aplicaciones de seguridad conviene combinarlo con otras senales.
- Riesgo de degradacion en dominios no cubiertos por el entrenamiento (acentos, idiomas, condiciones acusticas o canales distintos de LibriSpeech, CN-Celeb2 y VoxCeleb1).
- Sensibilidad a la calidad del audio: depende del frontend log-mel de 80 dimensiones a 16 kHz con VAD, por lo que ruido, musica o audio muy corto pueden degradar el embedding.
- Sesgos potenciales derivados de los datasets de entrenamiento: representacion desigual de idiomas, generos y condiciones de grabacion.
- Riesgo de alucinacion: no aplica en sentido generativo; el modelo no produce texto, pero si puede dar puntuaciones de verificacion espurias en condiciones adversas.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (LibriSpeech, CN-Celeb, VoxCeleb) para usos concretos.
- Las cifras de parametros difieren ligeramente entre el recuento de safetensors (2.162.184) y la model card (2.162.187).
- No se detallan en la informacion disponible los tipos de cuantizacion soportados ni el rendimiento en formatos distintos de safetensors/msgpack.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_pfas
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Modelo relacionado del mismo autor (Personal VAD 2.0): https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
