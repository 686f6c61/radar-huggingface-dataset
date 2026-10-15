# wq2012/ls_conformer_small_pfas_ge2e

## Resumen

`ls_conformer_small_pfas_ge2e` es un modelo de verificación e identificación de hablante (speaker verification) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reproducción open source en JAX/Flax de algoritmos de reconocimiento de hablante publicados por Google. El modelo no genera texto: su función es convertir una locución de audio en un embedding de 640 dimensiones que representa la identidad vocal del hablante, y emitir una puntuación de verificación entre dos audios. La arquitectura combina un backbone Conformer de tamaño "small" con pooling temporal PFAS (Parameter-Free Attentive Scoring) y entrenamiento con la pérdida GE2E softmax.

Es un modelo muy pequeño: 2.162.184 parámetros según el fichero `safetensors` (la model card declara 2.162.187 parámetros de encoder, una diferencia de 3 atribuible probablemente a la proyección final o al redondeo de recuento). Esto lo sitúa en la liga de los sistemas de verificación ligeros, aptos para ejecución en CPU o en hardware embebido, muy lejos de los sistemas basados en WavLM o ECAPA-TDNN de decenas o cientos de millones de parámetros.

El modelo se entrenó únicamente sobre LibriSpeech (inglés leído) y se evalúa en tres dominios: LibriSpeech, CN-Celeb2 (chino multigénero) y VoxCeleb1 (inglés espontáneo de celebridades). Es relevante ahora porque publica pesos abiertos en SafeTensors y Msgpack bajo licencia Apache 2.0, junto con métricas de evaluación verificadas con intervalos de confianza bootstrap, algo poco habitual en modelos de tan bajo número de descargas (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) para encoder de hablante |
| Parametros totales | 2.162.184 (fichero `safetensors`); la model card declara 2.162.187 parámetros de encoder |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; no se especifica ventana máxima de entrada en la información proporcionada) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en precisión nativa, presumiblemente fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | No declarados explícitamente. El frontend es acústico (log-mel), y la evaluación cubre inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimensión del embedding de salida | 640 |
| Pooling temporal | PFAS (Parameter-Free Attentive Scoring) |
| Pérdida de entrenamiento | GE2E softmax |
| Puntuación de verificación | PFAS |
| Frontend de audio | 80-dim log-mel a 16.000 Hz + VAD de energía + CMVN |
| Dominio de entrenamiento | LibriSpeech |
| Librería | `flaxspeaker` (JAX/Flax) |
| Pipeline (HF) | audio-classification |

## Arquitectura y entrenamiento

El encoder es un Conformer de configuración "small", es decir, un transformer con convoluciones integradas (bloques de atención multi-cabeza combinados con módulos convolucionales) aplicado sobre tramas de audio. Sobre las representaciones del encoder se aplica un pooling temporal PFAS, un mecanismo de atención sin parámetros adicionales que agrega la secuencia temporal en un único vector de 640 dimensiones. La puntuación de verificación también emplea PFAS. El entrenamiento utiliza la pérdida GE2E softmax (Generalized End-to-End Loss), formulada originalmente para aprendizaje de embeddings de hablante mediante comparación por lotes entre locuciones de enrolamiento y de prueba.

El frontend de audio sigue la receta indicada en la model card: características log-mel de 80 dimensiones a 16 kHz, detección de actividad vocal (VAD) basada en energía y normalización CMVN. El modelo se entrenó exclusivamente con el dominio LibriSpeech (inglés leído), tal como declara la tabla de resumen. No se especifica en la información disponible el número de tokens o de horas de audio usadas, la composición exacta del dataset, ni si se aplicaron etapas de ajuste fino con RLHF o DPO (técnicas que, por otra parte, no aplican de forma habitual a modelos de verificación de hablante). El proyecto es una reproducción "clean-room" independiente: las publicaciones originales (GE2E, Dr-Vectors, Conformer-ATP, PFAS) se realizaron con infraestructura y datasets internos de Google, no con esta librería ni con estos splits públicos. Los datasets citados en las etiquetas son librispeech_asr, cnceleb y voxceleb.

## Capacidades

- Generación de embeddings de hablante: produce un vector de 640 dimensiones por locución, utilizable para comparación por similitud coseno o para clustering de voces.
- Verificación de hablante (1:1): compara un audio de enrolamiento y uno de prueba y devuelve una puntuación de similitud, con umbrales operativos derivables de las métricas EER y minDCF publicadas.
- Identificación de hablante (1:N): al ser un modelo de embeddings, se puede usar para búsqueda del hablante más cercano en una galería de vectores precalculados.
- Enrolamiento múltiple: la model card publica resultados específicos para verificación con 3 locuciones de enrolamiento, lo que indica soporte nativo para agregar varias muestras por hablante.
- Audio frontend integrado: log-mel de 80 bandas a 16 kHz, VAD de energía y CMVN, de modo que el modelo acepta audio en crudo sin una cadena de preprocesado externa compleja.
- Compatibilidad con `WhisperFeatureExtractor`: el `preprocessor_config.json` es compatible con ese extractor de características.
- Tool calling / function calling: no aplica; el modelo no es generativo de texto.
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Capacidades multilingües: no se declaran idiomas oficiales; la evaluación incluye dominios en inglés y chino, y el modelo opera sobre características acústicas, por lo que en principio es independiente del idioma, aunque su rendimiento se degrada fuera de LibriSpeech.
- Capacidades especiales: no dispone de modo "thinking", visión ni audio generativo.

## Casos de uso

- Control de acceso por voz en aplicaciones móviles o de escritorio: el modelo solo necesita unos pocos megabytes de pesos en memoria, por lo que puede empaquetarse dentro de aplicaciones cliente y ejecutar la verificación de identidad en el propio dispositivo, sin enviar el audio a un servidor.
- Autenticación biométrica de segundo factor en servicios telefónicos: con audio de 16 kHz y el frontend log-mel + VAD integrado, puede procesar la locución del usuario en el momento y compararla contra el embedding de enrolamiento almacenado, usando el umbral minDCF publicados para fijar el punto de operación (por ejemplo, minDCF@0.01 en LibriSpeech = 0,6627).
- Diarización y etiquetado de hablantes en grabaciones largas: los embeddings de 640 dimensiones permiten agrupar segmentos por hablante mediante clustering (k-means o aglomerativo), útil para transcripciones de reuniones o para pipelines de ASR que necesitan separar interlocutores.
- Indexado y búsqueda de voces en archivos de audio: al ser un modelo de embeddings puro, permite construir un índice vectorial (FAISS, HNSW) sobre horas de audio y consultar "¿en qué grabaciones aparece esta persona?", escenario habitual en tareas de archivo periodístico o compliance.
- Filtrado de locuciones en recolección de datos de entrenamiento: permite descartar audios duplicados o de un mismo hablante antes de entrenar modelos ASR o TTS, evitando fugas entre splits de train y test.
- Personalización de asistentes de voz: identificar al usuario que habla permite cargar perfiles de preferencias, historial o idioma sin requerir una frase de activación adicional.
- Detección de anomalías en centros de atención telefónica: verificar que la voz que responde coincide con el agente asignado a la llamada, o detectar suplantaciones en grabaciones de calidad controlada (LibriSpeech, con EER del 10,50% a 1 locución y 6,20% a 3 locuciones).
- Prototipado e investigación educativa: al ser una implementación limpia y reproducible en JAX/Flax de GE2E, PFAS y Conformer-ATP, sirve como base para experimentar con pérdidas y mecanismos de pooling sin necesidad de infraestructura industrial.

## Benchmarks y rendimiento

Los datos provienen del fichero `eval_results.json` y de las tablas de la model card. Corresponden a métricas de verificación (EER, minDCF y ROC-AUC), no a benchmarks de comprensión o generación.

Verificación con 1 locución:

| Split de evaluación | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---:|---:|---|---:|---:|---:|
| LibriSpeech (inglés leído) | 3.000 | 10,50 | [9,20 – 11,60] | 0,6627 | 0,4547 | 0,9630 |
| CN-Celeb2 (chino multigénero) | 3.000 | 28,87 | [27,27 – 30,52] | 0,9393 | 0,9053 | 0,7842 |
| VoxCeleb1 (celebridades, in-the-wild) | 2.000 | 23,40 | [21,70 – 25,28] | 0,8950 | 0,8940 | 0,8465 |
| Universal Pooled (3 dominios) | 8.000 | 20,69 | [19,80 – 21,43] | 0,8645 | 0,7570 | 0,8799 |
| Universal Macro-Average | 8.000 | 20,92 | — | 0,8323 | 0,7513 | 0,8646 |

Verificación con 3 locuciones de enrolamiento:

| Split de evaluación | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---:|---:|---|---:|---:|
| LibriSpeech (3-utt) | 1.000 | 6,20 | [4,65 – 7,80] | 0,4140 | 0,9860 |
| CN-Celeb2 (3-utt) | 1.000 | 25,00 | [22,55 – 28,60] | 0,8660 | 0,8334 |
| VoxCeleb1 (3-utt) | 1.000 | 20,20 | [17,20 – 22,45] | 0,9160 | 0,8882 |
| Universal Pooled (3-utt) | 3.000 | 17,17 | [15,78 – 18,40] | 0,7667 | 0,9162 |
| Universal Macro-Average (3-utt) | 3.000 | 17,13 | — | 0,7320 | 0,9025 |

No se han publicado en la información disponible resultados de benchmarks estándar de texto (MMLU, HumanEval, GSM8K u otros), que además no aplicarían a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,7 MB de pesos en fp32 (2.162.184 parámetros × 4 bytes), unos 4,3 MB en fp16 y unos 2,2 MB en int8. Son estimaciones aritméticas derivadas del recuento de parámetros; no hay cifras de consumo medidas publicadas.
- GPU recomendadas: cualquier GPU sirve. No se requiere A100, H100 ni siquiera una RTX 4090; una GPU integrada o una GTX 1050 serían suficientes. La aceleración por GPU solo aporta valor en escenarios de gran volumen (miles de locuciones por lote).
- Viabilidad en hardware de consumo: sí, con enorme margen. El modelo cabe en CPU, en dispositivos móviles y en microcontroladores con suficiente memoria. El cuello de botella realista será el frontend de audio (resampling, log-mel y VAD), no la red neuronal.
- Opciones de despliegue: la librería oficial es `flaxspeaker` (JAX/Flax), con API Python (`load_pretrained`, `extract_embedding`, `verify`) y script de línea de comandos `scripts/inference.py`. Los pesos SafeTensors abren la puerta a conversiones a otros runtimes, aunque no se documentan conversiones oficiales. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de RTF ni de latencia por locución.

## Comparativa con modelos similares

Los valores de los modelos alternativos provienen de conocimiento general del ecosistema y no se han podido verificar en las fuentes proporcionadas para esta ficha; se marcan como referencia orientativa.

| Modelo | Parametros | Tipo | Contexto / entrada | EER VoxCeleb1 (referencia) | Licencia |
|---|---|---|---|---|---|
| `wq2012/ls_conformer_small_pfas_ge2e` | 2,16 M | Conformer + PFAS + GE2E | log-mel 80 dim, 16 kHz | 23,40 % (1-utt, 2.000 trials) | Apache 2.0 |
| `speechbrain/spkrec-ecapa-voxceleb` | ~20 M (referencia, no verificada) | ECAPA-TDNN | mel-filterbank | No disponible en las fuentes consultadas | Apache 2.0 |
| `microsoft/wavlm-base-plus-sv` | ~94 M (referencia, no verificada) | WavLM + cabecera de SV | audio crudo 16 kHz | No disponible en las fuentes consultadas | MIT (no verificado en las fuentes) |
| Sistemas x-vector clásicos | ~5 M | TDNN + pooling estadístico | MFCC | No disponible en las fuentes consultadas | Variable |

La diferencia clave es de escala: con 2,16 M de parámetros, este modelo es entre uno y dos órdenes de magnitud más pequeño que las alternativas basadas en ECAPA-TDNN o WavLM, y sus tasas de error en dominios "in-the-wild" (23,40 % en VoxCeleb1) son coherentes con ese presupuesto de parámetros y con el hecho de que solo se entrenó en inglés leído.

## Limitaciones y advertencias

- Rendimiento limitado: un EER del 10,50 % en el dominio de entrenamiento (LibriSpeech, 1 locución) y del 23,40 % en VoxCeleb1 está muy lejos del estado del arte en verificación de hablante, donde los sistemas ECAPA-TDNN o WavLM suelen operar por debajo del 1-3 % en VoxCeleb1-O. Este modelo no es adecuado para autenticación de alta seguridad sin medidas compensatorias.
- Desajuste de dominio severo: el entrenamiento se realizó únicamente con LibriSpeech (inglés leído). El salto a CN-Celeb2 (28,87 % EER) y a VoxCeleb1 (23,40 % EER) refleja esa brecha. Esperar degradación adicional en audio telefónico de banda estrecha, ruido de fondo, reverberación o micrófonos lejanos.
- Ausencia de datos sobre sesgos: no se documenta ningún análisis de sesgo por acento, edad, género, tono de voz o patología vocal. En un modelo biométrico esto es un riesgo relevante: las tasas de error pueden diferir sustancialmente entre subgrupos aunque la media sea conocida.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo de falsos positivos (aceptar a un impostor) y falsos negativos (rechazar al hablante legítimo). En verificación biométrica ambos errores tienen consecuencias de seguridad.
- Sin información sobre ataques de suplantación: no se documentan evaluaciones frente a replay, deepfakes vocales o voz sintética. No debe confiarse en el modelo como única barrera frente a ataques de spoofing.
- Idiomas: no se declaran oficialmente idiomas soportados. Aunque la evaluación incluye chino, el entrenamiento monolingüe en inglés limita la generalización.
- Contexto y entrada: no se especifica la duración máxima o mínima de audio admitida. Dado el uso de VAD de energía, locuciones muy cortas o con mucho silencio pueden producir embeddings poco fiables.
- Licencia: Apache 2.0 permite uso comercial y modificación con atribución, pero la model card incluye un descargo explícito ("This is not an officially supported Google product"), por lo que no hay soporte ni garantías por parte de Google.
- Reproducibilidad y soporte: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica una comunidad prácticamente inexistente, sin issues resueltos ni validación independiente de los resultados publicados más allá del propio `eval_results.json` del autor.
- Procedencia de los resultados: en las publicaciones originales (GE2E, Dr-Vectors, Conformer-ATP, PFAS) los experimentos se hicieron con infraestructura y datasets internos de Google; los números de esta ficha corresponden a una reproducción independiente y no son comparables uno a uno con los de los papers.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/wq2012/ls_conformer_small_pfas_ge2e
- Colección FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- Paper PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642

Nota: la búsqueda web realizada para esta ficha no devolvió resultados técnicos relevantes sobre el modelo ni sobre FlaxSpeaker; únicamente aparecieron páginas sin relación con el contenido.
