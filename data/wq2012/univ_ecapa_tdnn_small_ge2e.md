# wq2012/univ_ecapa_tdnn_small_ge2e

## Resumen

`univ_ecapa_tdnn_small_ge2e` es un modelo de verificacion e identificacion de locutor (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementacion limpia en JAX/Flax de algoritmos publicados por Google en los articulos GE2E, Dr-Vectors, Conformer-ATP y PFAS. No se trata de un modelo generativo de lenguaje, sino de un extractor de embeddings de voz: recibe una senal de audio y devuelve un vector de 192 dimensiones que representa la identidad del hablante, de forma que dos grabaciones de la misma persona quedan proximas en el espacio de embeddings segun la similitud coseno.

El modelo combina un backbone ECAPA-TDNN en su variante `small` con pooling temporal atencional (`asp`, attentive statistics pooling) y un objetivo de entrenamiento GE2E con softmax. Cuenta con 1.684.416 parametros en el encoder, un tamano muy reducido que lo situa en la categoria de modelos ligeros aptos para inferencia en CPU y dispositivos moviles. El frontend de audio trabaja con log-mel de 80 dimensiones a 16 kHz, deteccion de actividad vocal (VAD) basada en energia y normalizacion CMVN.

Su relevancia actual radica en que ofrece una alternativa reproducible y de licencia Apache 2.0 a los modelos de verificacion de locutor habitualmente entrenados sobre VoxCeleb con infraestructura propietaria, e incluye exportaciones a TensorFlow Lite en FP32 e INT8 para despliegue en el borde. El checkpoint se publica con pesos en safetensors, formato nativo Flax (msgpack) y configuraciones de preprocesado compatibles con el extractor de caracteristicas de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (variante `small`) con pooling temporal atencional (`asp`) |
| Parametros totales | 1.684.416 (parametros del encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances completas; no se especifica ventana maxima) |
| Tipos de cuantizacion | FP32 (modelo base y `model_fp32.tflite`) e INT8 dynamic-range (`model_int8.tflite`, ~3,5x mas pequeno) |
| Idiomas soportados | no disponible (los datasets de evaluacion cubren ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TensorFlow Lite (FP32 e INT8) |
| Dimension del embedding de salida | 192 |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD por energia + CMVN |
| Funcion de perdida | GE2E con softmax (`ge2e_softmax`) |
| Puntuacion de verificacion | similitud coseno |
| Dominio de entrenamiento | universal |
| Libreria | flaxspeaker |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN, una red convolucional temporal (TDNN) con bloques Res2Block, modulos de atencion de canal (SE-block) y agregacion estadistica atencional, introducida por Desplanques et al. en Interspeech 2020. En esta variante `small` el modelo se reduce a 1.684.416 parametros, muy por debajo de las configuraciones tipicas de ECAPA-TDNN (que suelen superar los 20 millones). Sobre las representaciones del backbone se aplica un pooling temporal atencional que agrega la secuencia temporal en un unico vector de 192 dimensiones.

El entrenamiento sigue el esquema de perdida GE2E (Generalized End-to-End Loss, arXiv:1710.10467), que optimiza directamente la discriminacion entre embeddings de locutores distintos frente a los de un mismo locutor, combinado con un objetivo softmax. Los datasets declarados para entrenamiento y evaluacion son LibriSpeech ASR (ingles leido), CN-Celeb (chino multigenero) y VoxCeleb (locutores en condiciones no controladas), lo que justifica el dominio de entrenamiento etiquetado como `universal`. La verificacion en inferencia se realiza por similitud coseno entre embeddings. El autor indica explicitamente que se trata de una reproduccion limpia y no de un producto oficial de Google, y que los articulos originales se entrenaron con infraestructura y datos internos propietarios, no con esta libreria ni con estos splits publicos.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de una utterance de audio.
- Verificacion de locutor uno a uno (comparar dos audios y obtener una puntuacion de similitud coseno).
- Verificacion con multiples utterances de enrolamiento (se reportan resultados para 1 y 3 utterances).
- Identificacion de locutor por comparacion contra un conjunto de embeddings de referencia.
- Clasificacion de audio (pipeline declarado: `audio-classification`).
- Preprocesado integrado: log-mel de 80 dimensiones, VAD por energia y CMVN.
- Inferencia en CPU y en dispositivos moviles o de borde mediante TensorFlow Lite (FP32 e INT8).
- Adaptacion multilingue implicita: evaluado en ingles (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2).
- No soporta generacion de texto, tool calling, agentes, vision ni razonamiento multi-paso: es un modelo de representacion de audio, no un modelo de lenguaje.

## Casos de uso

- Verificacion de identidad en atencion telefonica: el modelo permite confirmar que la persona que llama es quien dice ser comparando su voz con un embedding de enrolamiento previo, con puntuacion coseno y umbral ajustable segun la tasa de error objetivo.
- Autenticacion por voz en dispositivos de borde: gracias a las exportaciones TFLite FP32 e INT8 y a sus 1,68 millones de parametros, puede ejecutarse en moviles, raspberry pi o microcontroladores con CPU, sin GPU ni conexion a red.
- Diarizacion y segmentacion de hablantes: los embeddings por segmento permiten agrupar fragmentos de una grabacion larga (reuniones, entrevistas) por locutor y generar transcripciones atribuidas.
- Indexado y busqueda de archivos de audio por locutor: en un archivo de miles de horas de call center, se pueden precalcular embeddings y construir un indice vectorial para recuperar todas las intervenciones de una misma persona.
- Deduplicacion de grabaciones y control de calidad de datasets: detectar utterances repetidas o locutores duplicados en corpus de entrenamiento comparando embeddings entre si.
- Deteccion de fraude y suplantacion: comparar la voz entrante con el perfil del cliente para marcar posibles casos de sustitucion, especialmente util en banca y seguros.
- Personalizacion de asistentes de voz domesticos: identificar que miembro del hogar esta hablando para cargar su perfil, preferencias o historial sin necesidad de comandos explicitos.
- Verificacion continua en reuniones o sesiones largas: revalidar periodicamente la identidad del hablante durante una llamada o sesion para evitar transferencias de identidad no autorizadas.

## Benchmarks y rendimiento

Resultados de verificacion con una utterance (1-utt), extraidos de `eval_results.json` publicado por el autor:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 19,00 | [17,52; 20,45] | 0,9807 | 0,8947 | 0,8941 |
| CN-Celeb2 (chino multigenero) | 3.000 | 25,13 | [23,67; 26,68] | 0,9980 | 0,9500 | 0,8258 |
| VoxCeleb1 (locutores en condiciones reales) | 2.000 | 23,30 | [21,07; 24,90] | 0,9880 | 0,9850 | 0,8518 |
| Universal agrupado (3 dominios) | 8.000 | 23,16 | [22,25; 24,03] | 0,9973 | 0,9655 | 0,8536 |
| Universal media macro (3 dominios) | 8.000 | 22,48 | no disponible | 0,9889 | 0,9432 | 0,8572 |

Resultados de verificacion con tres utterances de enrolamiento (3-utt):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 11,80 | [9,75; 14,15] | 0,7780 | 0,9531 |
| CN-Celeb2 (3-utt) | 1.000 | 22,40 | [19,60; 25,00] | 1,0000 | 0,8677 |
| VoxCeleb1 (3-utt) | 1.000 | 18,80 | [16,05; 21,25] | 0,9580 | 0,8878 |
| Universal agrupado (3-utt) | 3.000 | 18,00 | [16,77; 19,40] | 0,9993 | 0,8993 |
| Universal media macro (3-utt) | 3.000 | 17,67 | no disponible | 0,9120 | 0,9029 |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 1.684.416 parametros, los pesos en FP32 ocupan aproximadamente 6,7 MB y en INT8 alrededor de 1,9 MB (el autor indica que la version INT8 es ~3,5x mas pequena).
- GPU recomendadas: no se requieren. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) sobra para lotes grandes, pero el modelo esta disenado para CPU.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer e incluso en CPU y en dispositivos moviles.
- Opciones de despliegue: libreria `flaxspeaker` (Python), script `scripts/inference.py` para linea de comandos, TensorFlow Lite (`model_fp32.tflite` y `model_int8.tflite`) para movil y borde. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dominio de entrenamiento | EER reportado | Licencia | Formato |
|---|---|---|---|---|---|---|
| `wq2012/univ_ecapa_tdnn_small_ge2e` | ECAPA-TDNN small + ASP | 1.684.416 | Universal (LibriSpeech, CN-Celeb, VoxCeleb) | 23,30% en VoxCeleb1 (1-utt); 18,80% (3-utt) | Apache 2.0 | safetensors, msgpack, TFLite |
| `TaoRuijie/ECAPA-TDNN` | ECAPA-TDNN (reimplementacion no oficial) | no disponible | VoxCeleb2 | 0,86% en Vox1_O | no disponible en la busqueda | no disponible |
| `yangwang825/ecapa-tdnn-vox2` | ECAPA-TDNN | no disponible | VoxCeleb2 | no disponible | no disponible | no disponible |
| `HuShou-ZMZN/ECAPA_TDNN` | ECAPA-TDNN | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: las diferencias de EER entre esta ficha y las alternativas no son directamente comparables. El modelo de TaoRuijie se evalua sobre Vox1_O (protocolo de verificacion estandar de VoxCeleb) con un modelo de tamano completo, mientras que `univ_ecapa_tdnn_small_ge2e` es una variante `small` evaluada con su propio protocolo de trials sobre tres dominios distintos. La comparacion de parametros y licencia si es orientativa: este checkpoint es sustancialmente mas pequeno y declara licencia Apache 2.0.

## Limitaciones y advertencias

- No es un producto oficial de Google. Es una reproduccion independiente en JAX/Flax; los articulos originales se entrenaron con infraestructura y datos internos propietarios, por lo que los resultados no son directamente equiparables a los publicados en esos papers.
- Las tasas de error son altas para uso biometrico en produccion: EER del 23,16% en el pool universal con una utterance y del 18,00% con tres utterances. Solo con enrolamiento multiple y en dominios concretos (LibriSpeech con 3 utterances, 11,80% EER) baja de forma apreciable.
- El rendimiento es desigual entre idiomas y dominios: el mejor resultado se da en ingles leido (LibriSpeech) y el peor en chino multigenero (CN-Celeb2, 25,13% EER con una utterance).
- Riesgo de confusion entre locutores con voces similares, especialmente en condiciones de ruido, canal telefonico o utterances cortas; el modelo no incorpora un mecanismo explicito de anti-spoofing, por lo que es vulnerable a ataques de reproduccion o sintesis de voz.
- Sesgos potenciales derivados de los corpus de entrenamiento (LibriSpeech, CN-Celeb, VoxCeleb), que no estan balanceados por edad, acento, genero ni condiciones de grabacion; no se documenta ninguna evaluacion de equidad.
- La longitud de contexto y la ventana maxima de audio no estan documentadas; se desconoce el comportamiento con utterances muy largas.
- La lista de idiomas soportados no esta declarada formalmente, aunque la evaluacion cubre ingles y chino.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un modelo biometrico su despliegue puede estar sujeto a normativa de proteccion de datos (RGPD) y a requisitos de consentimiento explicito de los usuarios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado es de 0,0 GB, lo que sugiere un artefacto muy reciente o poco difundido; conviene validar los pesos antes de integrarlos en un sistema en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_ecapa_tdnn_small_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E (Generalized End-to-End Loss for Speaker Verification): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (Decision Residual Networks and an Improved Loss for Speaker Recognition): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (Attentive Temporal Pooling for Conformer-based Streaming Language Identification): https://arxiv.org/abs/2202.12163
- Paper PFAS (Parameter-Free Attentive Scoring for Speaker Verification): https://arxiv.org/abs/2203.05642
- Paper ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation in TDNN Based Speaker Verification): https://arxiv.org/abs/2005.07143
- Reimplementacion no oficial de ECAPA-TDNN en PyTorch: https://github.com/TaoRuijie/ECAPA-TDNN
- Otra implementacion de ECAPA-TDNN: https://github.com/LKLQQ/ecapa_tdnn
- Modelo ECAPA-TDNN entrenado en VoxCeleb2 en Hugging Face: https://huggingface.co/yangwang825/ecapa-tdnn-vox2
- Modelo ECAPA_TDNN en Hugging Face: https://huggingface.co/HuShou-ZMZN/ECAPA_TDNN
