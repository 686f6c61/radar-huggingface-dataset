# wq2012/ls_ecapa_tdnn_base_ge2e

## Resumen

`wq2012/ls_ecapa_tdnn_base_ge2e` es un checkpoint de verificación e identificación de hablante publicado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementación limpia (*clean-room*) en JAX/Flax de algoritmos de reconocimiento de hablante publicados por Google. El modelo usa una arquitectura de backbone ECAPA-TDNN en variante `base`, con *pooling* temporal atentivo (`asp`), entrenamiento con la pérdida `ge2e_softmax` y puntuación de verificación por similitud coseno. Genera embeddings de hablante de 256 dimensiones a partir de audio.

Se trata de un modelo muy pequeno: el encoder tiene 3.190.624 parámetros, lo que lo sitúa en la liga de los extractores de embeddings que pueden ejecutarse en CPU sin problema. La entrada es audio a 16 kHz procesado con un frontend de 80 dimensiones de log-mel, más detección de actividad de voz (VAD) basada en energía y normalización CMVN. El checkpoint se distribuye en `safetensors` y en el formato nativo `flax_model.msgpack` de Flax, con licencia Apache 2.0.

Su relevancia es doble. Por un lado, es una alternativa reproducible y con licencia permisiva dentro de un ecosistema donde muchos modelos de *speaker verification* de referencia dependen de pesos o pipelines con condiciones de uso más restrictivas. Por otro, publica métricas de evaluación verificadas con intervalos de confianza *bootstrap* en tres dominios distintos (LibriSpeech en inglés leído, CN-Celeb2 en chino multi-género y VoxCeleb1 en habla espontánea), lo que permite calibrar de antemano su comportamiento fuera del dominio de entrenamiento. El autor advierte explícitamente de que no es un producto oficial de Google y de que los papers originales se experimentaron con infraestructura y datos internos propietarios, no con esta librería ni con particiones de datos públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN variante `base` con pooling temporal atentivo (`asp`) |
| Parametros totales | 3.190.624 (encoder) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable en el sentido de tokens; la entrada es audio. Duracion maxima de audio soportada: no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y msgpack, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible como lista declarada; entrenado en dominio LibriSpeech (ingles leido) y evaluado tambien en CN-Celeb2 (chino) y VoxCeleb1 (habla espontanea multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`); configuracion en `config.json` y `preprocessor_config.json` |
| Dimension del embedding de salida | 256 |
| Perdida de entrenamiento | `ge2e_softmax` |
| Puntuacion de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16000 Hz + VAD por energia + CMVN |
| Libreria | flaxspeaker |
| Pipeline declarado | audio-classification |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network), una familia de redes convolucionales 1D con bloques de atención de canal y agregación multi-escala, disenada especificamente para extraer representaciones de hablante robustas. Sobre el backbone se aplica *pooling* temporal atentivo (`asp`, attentive statistical pooling), que agrega la secuencia temporal en un vector único de 256 dimensiones ponderando los tramas mas informativas. La clasificación se entrena con la pérdida `ge2e_softmax`, derivada del esquema GE2E (*Generalized End-to-End Loss*), que optimiza simultáneamente la compactación intra-hablante y la separación inter-hablante dentro de cada *batch*. En inferencia, la verificación se realiza comparando embeddings con similitud coseno, sin necesidad de una cabeza clasificadora.

El dominio de entrenamiento declarado es `librispeech`, es decir, habla leída en inglés. El frontend sigue el esquema de `WhisperFeatureExtractor`: 80 coeficientes log-mel a 16 kHz, con VAD por energía y normalización CMVN. No se especifica en la informacion disponible el numero de horas de audio, el numero de hablantes ni la composicion exacta del dataset de entrenamiento, ni si se aplicaron etapas de ajuste fino, *augmentation* o *scoring* con redes de decisión residual (Dr-Vectors). La model card deja claro que la librería es una reproducción independiente y que los papers citados (GE2E, Dr-Vectors, Conformer-ATP y PFAS) se experimentaron con infraestructura y datos internos de Google, por lo que los números de esta ficha no son directamente comparables con los de las publicaciones originales.

## Capacidades

- Extraccion de embeddings de hablante de 256 dimensiones a partir de un fichero de audio (`extract_embedding`).
- Verificacion de hablante uno a uno (`verify`), devolviendo una puntuacion de similitud coseno entre dos utterances.
- Verificacion con multiples utterances de enrolamiento: la model card reporta resultados especificos para enrolamiento con 3 utterances, lo que reduce el EER frente al caso de 1 utterance.
- Deteccion de actividad de voz integrada en el preprocesado (VAD por energia), útil para limpiar silencios antes de extraer el embedding.
- Funcionamiento multi-dominio: evaluado sobre habla leída en inglés (LibriSpeech), habla multigenero en chino (CN-Celeb2) y habla espontanea de celebridades (VoxCeleb1).
- Inferencia ligera en CPU o GPU gracias al reducido tamano del encoder.
- Clasificacion de audio en el sentido de `pipeline_tag: audio-classification` (identificacion de hablante por similitud de embeddings).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni uso como agente. Es exclusivamente un extractor de embeddings de hablante.

## Casos de uso

- Verificacion biometrica de voz en aplicaciones de autenticacion: el modelo extrae un embedding de la frase de acceso y lo compara por coseno con el embedding enrolado del usuario, devolviendo una puntuacion que se umbraliza para aceptar o rechazar. Su tamano de 3,19 M de parametros permite ejecutarlo en el propio dispositivo, sin enviar audio a un servidor.
- Control de acceso a espacios o servicios telefonicos: integrado en un flujo de llamada, se enrola al usuario con una o varias utterances y se verifica su identidad en cada interaccion posterior; el soporte de enrolamiento con 3 utterances (EER del 10,60 % en LibriSpeech) mejora la fiabilidad frente al enrolamiento con una sola.
- Indexacion y busqueda de archivos de audio por hablante: extrayendo embeddings de un archivo de entrevistas, podcasts o grabaciones de reunion, se pueden agrupar fragmentos por similitud coseno para construir un indice de quien habla en cada tramo, alimentando despues un sistema de diarizacion.
- Preprocesado para pipelines de reconocimiento de habla: usar los embeddings como etiqueta de hablante para separar y enrutar segmentos antes de pasarlos a un ASR, o para personalizar modelos acusticos por hablante.
- Deteccion de anomalias y antifraude en centros de atencion: comparar la voz de la persona que llama con la voz registrada del titular para detectar suplantaciones, siempre con umbrales calibrados y como senal adicional, nunca como unico factor.
- Analisis forense y verificacion de grabaciones: comparar la voz de una grabacion cuestionada con muestras de referencia conocidas, usando ROC-AUC y minDCF como medidas de calidad del par y reportando la incertidumbre derivada de los intervalos *bootstrap*.
- Segmentacion de reuniones y transcripcion atribuida: extraer embeddings por ventana, agrupar por hablante y etiquetar la transcripcion con quien dijo cada frase, sin depender de servicios en la nube.
- Filtrado y curaduria de datasets de voz: descartar grabaciones que no correspondan al hablante esperado o detectar duplicados de un mismo locutor antes de entrenar otros modelos.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion son los publicados en la model card del autor, con intervalos de confianza *bootstrap* al 95 % para el EER.

Verificacion con 1 utterance:

| Particion de evaluacion | Trials | EER (%) | IC 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 14,47 | [13,20; 15,73] | 0,9813 | 0,7460 | 0,9302 |
| CN-Celeb2 (chino multigenero) | 3.000 | 33,33 | [31,57; 34,82] | 0,9767 | 0,9453 | 0,7322 |
| VoxCeleb1 (habla espontanea) | 2.000 | 19,90 | [18,25; 21,80] | 0,9770 | 0,9160 | 0,8809 |
| Pool universal (3 dominios) | 8.000 | 23,29 | [22,42; 24,26] | 0,9905 | 0,8835 | 0,8510 |
| Media macro universal | 8.000 | 22,57 | no disponible | 0,9783 | 0,8691 | 0,8478 |

Verificacion con 3 utterances de enrolamiento:

| Particion de evaluacion | Trials | EER 3-utt (%) | IC 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 10,60 | [8,95; 13,00] | 0,8800 | 0,9567 |
| CN-Celeb2 (3-utt) | 1.000 | 30,20 | [27,20; 32,60] | 0,8900 | 0,7811 |
| VoxCeleb1 (3-utt) | 1.000 | 17,00 | [14,89; 19,20] | 0,9680 | 0,9085 |
| Pool universal (3-utt) | 3.000 | 18,90 | [17,72; 20,47] | 0,9360 | 0,8925 |
| Media macro universal (3-utt) | 3.000 | 19,27 | no disponible | 0,9127 | 0,8821 |

No se han publicado en la informacion disponible resultados de benchmarks de texto (MMLU, HumanEval, GSM8K y similares), ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13 MB en fp32 para los pesos (3,19 M de parametros x 4 bytes), mas el *overhead* del runtime de JAX/Flax y los buffers de audio. En la practica el modelo cabe en cualquier GPU y en la mayoria de entornos de CPU.
- GPU recomendadas: cualquiera, incluidas GTX 1050, RTX 2060, RTX 4090, A100 o H100; no requiere aceleradores de gama alta ni memoria HBM.
- Inferencia en GPU de consumo: si, en cualquier GPU con al menos unos cientos de MB de VRAM libres. Tambien es viable en CPU pura, Raspberry Pi o dispositivos moviles con runtime adecuado.
- Opciones de despliegue: no disponible en la informacion proporcionada para vLLM, llama.cpp, Ollama o TGI. El despliegue previsto es la librería `flaxspeaker` (API Python `load_pretrained` y script `scripts/inference.py`); el formato de pesos es safetensors/msgpack, no GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de utterances por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/ls_ecapa_tdnn_base_ge2e` | 3.190.624 | 256 | audio 16 kHz, 80-dim log-mel + VAD + CMVN | apache-2.0 | HuggingFace, GitHub y PyPI |
| SpeechBrain `spkrec-ecapa-voxceleb` | no disponible | no disponible | no disponible | no disponible | no disponible |
| pyannote / WeSpeaker (familia ResNet de embeddings de hablante) | no disponible | no disponible | no disponible | no disponible | no disponible |
| NVIDIA TitaNet (familia de verificacion de hablante) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los modelos alternativos se citan por familia y nombre de referencia, pero en la informacion disponible no se incluyen sus parametros, contexto, metricas ni condiciones de licencia, por lo que no es posible establecer una comparacion cuantitativa fiable. La busqueda web realizada no devolvio resultados relacionados con este modelo ni con modelos comparables de verificacion de hablante.

## Limitaciones y advertencias

- El propio autor declara que no es un producto soportado oficialmente por Google; es una reproduccion independiente de algoritmos publicados.
- Los papers de referencia (GE2E, Dr-Vectors, Conformer-ATP, PFAS) se experimentaron con infraestructura y conjuntos de datos internos de Google, no con esta librería ni con estas particiones públicas, por lo que los resultados no son directamente comparables con los del articulo original.
- Rendimiento sensible al dominio: el EER se dispara del 14,47 % en LibriSpeech (ingles leido, dominio de entrenamiento) al 33,33 % en CN-Celeb2 (chino multigenero). Se trata de un modelo con una fuerte dependencia del dominio y del idioma.
- En habla espontanea y ruidosa el EER con una sola utterance es del 19,90 % en VoxCeleb1, lo que corresponde a una tasa de error elevada para aplicaciones de autenticacion de alta seguridad sin umbrales adicionales ni fusion con otras senales.
- La mejora con 3 utterances de enrolamiento es apreciable (LibriSpeech pasa de 14,47 % a 10,60 % de EER), pero se reduce el conjunto de evaluacion a 1.000 trials por dominio, con intervalos de confianza mas anchos.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto, pero existe riesgo de falsos positivos y falsos negativos en la decision de verificacion; las puntuaciones coseno deben calibrarse con un conjunto de desarrollo propio.
- Sesgos: no se documentan analisis de sesgo por genero, edad, acento, idioma o canal de grabacion. Dado el entrenamiento en LibriSpeech (habla leida en ingles), es probable un sesgo hacia ese tipo de voz, pero no hay datos publicados que lo cuantifiquen.
- Limitaciones de idioma: no se declara una lista de idiomas soportados y el dominio de entrenamiento es ingles leido; el rendimiento en chino y en habla espontanea es notablemente peor.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. El aviso de "no es un producto oficial de Google" no restringe la licencia, pero conviene conservarlo en la redistribucion.
- Para produccion: no se documentan estrategias de cuantizacion, aceleracion ni integracion con servidores de inferencia estandar; sera necesario escribir el *serving* alrededor de `flaxspeaker` o exportar los pesos a otro runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_ecapa_tdnn_base_ge2e
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E, *Generalized End-to-End Loss for Speaker Verification*: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, *Decision Residual Networks and an Improved Loss for Speaker Recognition*: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, *Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech*: https://arxiv.org/abs/2202.12163
- Paper PFAS, *Parameter-Free Attentive Scoring for Speaker Verification*: https://arxiv.org/abs/2203.05642v3
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos correspondian a un sitio de coleccionismo sin relacion con el ambito tecnico.
