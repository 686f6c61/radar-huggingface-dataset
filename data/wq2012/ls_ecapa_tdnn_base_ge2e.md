# wq2012/ls_ecapa_tdnn_base_ge2e

## Resumen

`ls_ecapa_tdnn_base_ge2e` es un modelo de extracción de embeddings de hablante (speaker embeddings) desarrollado por el usuario wq2012 como parte del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de hablante descritos en la literatura científica. El modelo implementa una arquitectura ECAPA-TDNN de tamaño base con pooling temporal ASP (Attentive Statistics Pooling) y se entrena con la función de pérdida GE2E softmax, generando representaciones de 256 dimensiones aptas para verificación e identificación de hablante mediante similitud coseno.

El checkpoint es deliberadamente pequeño: 3.199.264 parámetros en el encoder y la cabeza de scoring, entrenado únicamente sobre LibriSpeech (232 hablantes, 5.788 utterances) durante 2.600 pasos (~14,37 épocas) en una estación de trabajo con CPU. No es una reproducción a gran escala de los resultados de los papers originales, sino un checkpoint de referencia convergido para comparaciones relativas controladas dentro del benchmark FlaxSpeaker. Su interés radica en ofrecer una implementación abierta, ligera y reproducible en el ecosistema JAX/Flax, un espacio donde las alternativas de reconocimiento de hablante son escasas frente al dominio PyTorch.

La relevancia actual es doble: por un lado, sirve como referencia educativa y de investigación para quienes trabajan con JAX en tareas de audio; por otro, su reducido tamaño (0,1 GB de repositorio, ~3,2 M de parámetros) permite desplegarlo en hardware modesto, incluida CPU, lo que facilita experimentación y prototipado sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (backbone `base`) con pooling temporal ASP |
| Parametros totales | 3.199.264 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa utterances con crops de 90-180 frames durante entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y msgpack; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (el modelo opera sobre características acústicas, no sobre texto; entrenado con LibriSpeech, que es inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimension de embedding de salida | 256 |
| Funcion de perdida | GE2E softmax (Wan et al. 2018, Eq. 6; centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel logarítmico natural de 80 dims @ 16.000 Hz + VAD por energia a nivel de frame + CMVN |
| Datos de entrenamiento | LibriSpeech (232 hablantes, 5.788 utterances) |
| Pasos de entrenamiento | 2.600 pasos x 32 utterances (~14,37 epocas), semilla 42 |
| Libreria | `flaxspeaker >= 0.5.0` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network), una familia de redes convolucionales temporales diseñada específicamente para reconocimiento de hablante. El backbone `base` se combina con un pooling temporal ASP (Attentive Statistics Pooling) que agrega las activaciones a lo largo del tiempo en un vector de embedding de 256 dimensiones. La verificación se realiza comparando embeddings mediante similitud coseno. La cabeza de entrenamiento implementa la pérdida GE2E softmax con centroides leave-one-out exactos, siguiendo la formulación de Wan et al. (2018).

El entrenamiento se realizó exclusivamente sobre LibriSpeech, con 232 hablantes y 5.788 utterances, durante 2.600 pasos de gradiente con mini-batches de 32 utterances (8 hablantes x 4 utterances), lo que equivale a ~14,37 épocas. Se usaron crops de longitud variable U(90, 180) frames con máscara de validez exacta, y se ejecutó en una estación de trabajo con CPU y semilla 42. El checkpoint está entrenado hasta convergencia con un margen de seguridad de 2 épocas. La EER en dominio (LibriSpeech) evolucionó de 16,97% (1-utt) / 13,50% (3-utt) en el paso 400 a 10,60% (1-utt) / 6,20% (3-utt) en el paso final 2.600. El autor advierte explícitamente que estos resultados están acotados por la diversidad de hablantes del corpus y no son comparables con sistemas industriales entrenados sobre miles de hablantes.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio a 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) mediante comparación contra un conjunto de embeddings de referencia.
- Scoring con múltiples utterances (1-utt y 3-utt documentados), que mejora la EER al agregar evidencia.
- Procesamiento con VAD por energía a nivel de frame y normalización CMVN.
- Entrenamiento e inferencia en JAX/Flax, con serialización nativa en safetensors y msgpack.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni texto: es un extractor de características de audio.
- Capacidades multilingües: no documentadas; el modelo no procesa idioma explícitamente, pero fue entrenado con LibriSpeech (inglés).

## Casos de uso

- Verificación biométrica de hablante en aplicaciones de acceso: el modelo genera un embedding de 256 dims por utterance y compara con el enrollment del usuario mediante coseno; su tamaño reducido permite ejecutarlo en CPU en entornos con recursos limitados.
- Identificación de hablante en grabaciones cortas: con el modo 3-utt documentado (EER 6,20% en dominio), se pueden agregar varias utterances del mismo audio para mejorar la robustez de la identificación.
- Investigación en JAX/Flax para audio: sirve como checkpoint de referencia reproducible para comparar variantes de arquitectura, pooling o funciones de pérdida dentro del benchmark FlaxSpeaker.
- Prototipado de diarización de hablantes: los embeddings pueden alimentar un clustering posterior (por ejemplo, k-means sobre similitud coseno) para segmentar conversaciones por hablante en etapas tempranas de desarrollo.
- Detección de duplicados o locutores recurrentes en archivos de audio: indexar embeddings y buscar vecinos cercanos para detectar si dos fragmentos corresponden al mismo hablante.
- Educación y reproducción de papers: al ser una reimplementación desde cero basada solo en publicaciones (GE2E, Dr-Vectors, ATP, PFAS), sirve para estudiar y validar los algoritmos originales en un entorno abierto.
- Filtrado de calidad en pipelines de datos de voz: usar la coherencia de embeddings entre segmentos para detectar grabaciones inconsistentes o mal etiquetadas.

## Benchmarks y rendimiento

Resultados documentados por el autor en `eval_results.json` y en la model card, en dominio (LibriSpeech):

| Metrica | Paso 400 | Paso 2200 (knee) | Paso 2600 (final) |
|---|---|---|---|
| EER 1-utt | 16,97% | 10,73% | 10,60% |
| EER 3-utt | 13,50% | 6,80% | 6,20% |
| EER Universal Pooled 1-utt (final) | no disponible | no disponible | 20,12% |
| EER Universal Pooled 3-utt (final) | no disponible | no disponible | 16,47% |

El autor reporta además una desviación estándar entre semillas 0-2 de 0,08-0,41% absoluto en EER pooled 1-utt, y un intervalo de confianza bootstrap del 95% (8.000 ensayos) de ~0,8% de semi-amplitud. Como referencia externa citada por el autor (no medida con este checkpoint): sistemas ECAPA-TDNN publicados entrenados con VoxCeleb2-dev alcanzan ~0,9% EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas de menos de 1M de parámetros ~2% (Wang et al., EfficientTDNN, 2022). No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas de texto, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~3,2 M de parámetros en fp32 el modelo ocupa ~13 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar la inferencia sin problemas.
- Cabe en consumer GPU: sí, en cualquier GPU consumer (e incluso en CPU, que es donde el autor entrenó el checkpoint).
- Opciones de despliegue: la librería `flaxspeaker >= 0.5.0` (PyPI) es la vía oficial; los pesos también están en safetensors y msgpack, lo que permite cargarlos con Flax/JAX directamente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento se realizó en CPU, lo que sugiere que la inferencia en CPU es viable para volúmenes moderados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_ecapa_tdnn_base_ge2e` (este) | 3,2 M | Audio 16 kHz, crops 90-180 frames | 10,60% (1-utt) / 6,20% (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia) | Audio 16 kHz | ~0,9% en VoxCeleb1-O | no disponible en la información | Paper; implementaciones en PyTorch |
| EfficientTDNN (Wang et al., 2022) | <1 M | Audio 16 kHz | ~2% en VoxCeleb1-O | no disponible en la información | Paper |

Nota: la comparación de EER no es directa, ya que este checkpoint se entrena sobre 232 hablantes de LibriSpeech mientras que los sistemas de referencia se entrenan sobre VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances). El autor advierte explícitamente que las cifras no son comparables como estado del arte.

## Limitaciones y advertencias

- Entrenado solo con 232 hablantes de LibriSpeech: la diversidad de hablantes es muy inferior a la de sistemas industriales, lo que acota la EER alcanzable y puede degradar el rendimiento en hablantes fuera de dominio.
- EER en dominio de 10,60% (1-utt) y 6,20% (3-utt): muy por encima de sistemas entrenados con VoxCeleb2-dev (~0,9%), por lo que no es adecuado como sistema de producción de alta seguridad sin fine-tuning adicional.
- Sesgos conocidos: no documentados explícitamente, pero al entrenar solo con LibriSpeech (inglés, lectura) puede tener sesgo hacia características acústicas de ese corpus y peor rendimiento en otros idiomas, acentos o condiciones de grabación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en verificación de hablante, especialmente con audio ruidoso o utterances cortas.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados; el modelo no procesa texto y su comportamiento multilingüe no está evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara que no es un producto oficial de Google y que es una reimplementación independiente; conviene revisar las licencias de los papers y datasets subyacentes.
- Caveat de producción: el checkpoint está pensado para comparaciones relativas controladas dentro del benchmark FlaxSpeaker, no como modelo de estado del arte; el frontend de audio es propio (`flaxspeaker.AudioFrontend`), no un `AutoFeatureExtractor` de Hugging Face, lo que requiere usar la librería específica.
- Dependencia de `flaxspeaker >= 0.5.0`: no es un modelo cargable con `transformers` estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_ecapa_tdnn_base_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
