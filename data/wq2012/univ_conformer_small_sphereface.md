# wq2012/univ_conformer_small_sphereface

## Resumen

`wq2012/univ_conformer_small_sphereface` es un modelo de verificacion e identificacion de hablante (speaker verification / speaker recognition) publicado por el autor `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo generativo de lenguaje: se trata de un encoder de audio que transforma una locucion en un vector de embedding de hablante de 192 dimensiones, de modo que dos fragmentos del mismo locutor quedan proximos en el espacio de embeddings y dos locutores distintos quedan alejados. El modelo pertenece a la familia `conformer` en variante `small` y esta implementado en JAX/Flax, con pesos distribuidos en SafeTensors y en Msgpack nativo de Flax.

El checkpoint es una reproduccion open source "clean-room" de algoritmos de reconocimiento de hablante publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS), usando la perdida SphereFace para el entrenamiento y puntuacion por similitud coseno para la verificacion. Su tamano es muy reducido: el encoder tiene 2.029.892 parametros, lo que lo situa en la categoria de modelos ligeros aptos para inferencia en CPU o en cualquier GPU de consumo. La licencia es Apache 2.0.

Su relevancia actual radica en que ofrece un pipeline completo y reproducible en JAX para tareas de biometria de voz y diarizacion ligera, con evaluacion multi-dominio verificada sobre LibriSpeech (ingles leido), CN-Celeb2 (chino multigenero) y VoxCeleb1 (audio in-the-wild), incluyendo intervalos de confianza bootstrap. Los resultados publicados en su propia model card son modestos (EER en torno al 22-26 % en verificacion de una sola locucion), por lo que debe entenderse como una implementacion de referencia reproducible mas que como un sistema de produccion de alta precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`small`) con temporal pooling atentivo (ATP) |
| Parametros totales | 2.029.892 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana fija de tokens; procesa audio de longitud variable con frontend de 80-dim log-mel a 16.000 Hz + VAD de energia + CMVN |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors fp32 y flax msgpack; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; los dominios de entrenamiento/evaluacion cubren ingles (LibriSpeech), chino (CN-Celeb2) y audio in-the-wild (VoxCeleb1) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |

Otros datos tecnicos declarados: dimension del embedding de salida 192, dominio de entrenamiento `universal`, perdida de entrenamiento `sphereface`, puntuacion de verificacion `cosine`, frontend de audio de 80 dimensiones log-mel a 16 kHz con VAD de energia y CMVN. Tamano del repositorio: 0,0 GB (aproximado por HuggingFace). Descargas y likes registrados: 0. Fecha de creacion y actualizacion en el Hub: 2026-10-15.

## Arquitectura y entrenamiento

El backbone es un Conformer de configuracion `small`, es decir, un transformer aumentado con convoluciones que combina auto-atencion con modulos convolucionales para capturar dependencias locales y globales en la secuencia acustica. Sobre las representaciones del encoder se aplica un pooling temporal atentivo (ATP, siguiendo el trabajo "Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech"), que agrega la secuencia en un unico vector de embedding de 192 dimensiones. El entrenamiento utiliza la perdida SphereFace (angular margin sobre el espacio de embeddings) y la verificacion se realiza mediante similitud coseno entre embeddings, siguiendo el esquema de scoring sin parametros de PFAS.

El frontend de audio convierte el audio a log-mel de 80 dimensiones a 16 kHz, aplica un detector de actividad de voz (VAD) basado en energia y normaliza con CMVN. El modelo se declara entrenado en dominio `universal`, con los datasets LibriSpeech ASR, CN-Celeb y VoxCeleb como fuentes. El autor indica explicitamente que se trata de una reproduccion independiente "clean-room" en JAX/Flax y que los experimentos de los articulos originales se realizaron con infraestructura interna propietaria de Google y datos internos, no con esta libreria ni estos splits publicos. No se especifica en la informacion disponible el numero exacto de tokens/horas de entrenamiento, la composicion precisa del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Extraccion de embeddings de hablante: genera un vector de 192 dimensiones por locucion mediante `model.extract_embedding(...)`.
- Verificacion de hablante (1:1): compara dos locuciones y devuelve una puntuacion de similitud coseno mediante `model.verify(...)`.
- Identificacion y clasificacion de hablante (1:N) por comparacion de embeddings, dentro del pipeline `audio-classification`.
- Verificacion con multiples locuciones de enrolamiento: la evaluacion publicada cubre escenarios de 1 y 3 locuciones, con mejora de EER al usar 3.
- Robustez multi-dominio declarada: evaluado en ingles leido (LibriSpeech), chino multigenero (CN-Celeb2) y audio in-the-wild (VoxCeleb1).
- Procesamiento de audio de longitud variable con VAD de energia y normalizacion CMVN.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio generativo.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta capacidad multilingue explicita como funcion del modelo; el idioma es en principio irrelevante para el embedding de hablante, pero el rendimiento depende del dominio acustico.

## Casos de uso

- Verificacion biometrica de voz en autenticacion: comparar la locucion de un usuario con su plantilla enrolada y decidir aceptacion/rechazo con un umbral sobre la similitud coseno, usando el modelo como extractor de embeddings de 192 dimensiones.
- Control de acceso a servicios telefonicos o de atencion al cliente: verificar que quien llama coincide con el titular registrado antes de dar acceso a informacion sensible.
- Diarizacion ligera y agrupamiento de hablantes: extraer embeddings por segmento (guiados por VAD) y agrupar por similitud coseno para separar interlocutores en una grabacion.
- Analisis forense y archivistico de audio: indexar grandes colecciones de grabaciones por identidad de hablante y buscar coincidencias entre muestras.
- Filtrado y limpieza de datasets de voz: detectar y agrupar fragmentos del mismo locutor para evitar fugas entre splits de entrenamiento y prueba.
- Investigacion reproducible en reconocimiento de hablante: servir como linea base ligera en JAX/Flax para comparar perdidas (SphereFace frente a alternativas) y esquemas de pooling (ATP) sin necesidad de hardware especializado.
- Prototipado en entornos sin GPU: al tener solo ~2 millones de parametros, permite ejecutar experimentos de verificacion en CPU y en portatiles.

## Benchmarks y rendimiento

Verificacion con 1 locucion (resultados publicados en `eval_results.json` segun la model card):

| Split de evaluacion | Trials | EER (%) | IC 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 22,27 | [20,58; 23,72] | 0,9980 | 0,9220 | 0,8611 |
| CN-Celeb2 (chino multigenero) | 3.000 | 25,67 | [24,05; 27,04] | 0,9713 | 0,9660 | 0,8173 |
| VoxCeleb1 (in-the-wild) | 2.000 | 25,15 | [23,27; 27,05] | 0,9880 | 0,9630 | 0,8369 |
| Universal pooled (3 dominios) | 8.000 | 25,84 | [24,83; 26,82] | 0,9978 | 0,9590 | 0,8248 |
| Universal macro-average | 8.000 | 24,36 | — | 0,9858 | 0,9503 | 0,8384 |

Verificacion con 3 locuciones de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 18,10 | [16,10; 20,85] | 0,8900 | 0,9075 |
| CN-Celeb2 (3-utt) | 1.000 | 23,40 | [20,95; 25,90] | 0,9720 | 0,8497 |
| VoxCeleb1 (3-utt) | 1.000 | 20,40 | [17,55; 23,10] | 0,9420 | 0,8795 |
| Universal pooled (3-utt) | 3.000 | 22,07 | [20,40; 23,50] | 0,9533 | 0,8663 |
| Universal macro-average (3-utt) | 3.000 | 20,63 | — | 0,9347 | 0,8789 |

No hay datos comparativos frente a otros modelos en la informacion disponible; los valores anteriores son los unicos publicados por el autor para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 2.029.892 parametros, los pesos ocupan aproximadamente 8,1 MB en fp32, 4,1 MB en fp16 y unos 2,0 MB en int8; el consumo total de VRAM, incluyendo el runtime de JAX y buffers de activaciones, es inferior a 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100, H100 ni similares. Una NVIDIA RTX 4090, RTX 3090 o incluso una GPU de gama baja son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 1 GB de memoria, e incluso puede ejecutarse en CPU.
- Opciones de despliegue: la libreria oficial es `flaxspeaker` (JAX/Flax), con API Python (`load_pretrained`) y script de inferencia por linea de comandos (`scripts/inference.py`). El formato del frontend es compatible con `WhisperFeatureExtractor`. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo (no es un LLM); requeriria una conversion a ONNX u otro runtime de inferencia para servirse fuera de JAX.
- Latencia y throughput: no disponible en la informacion proporcionada. Por tamano, se espera una latencia muy baja por locucion corta, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks comunes entre este modelo y las alternativas de la misma categoria dentro de la informacion proporcionada, por lo que la comparacion cuantitativa se marca como no disponible. A nivel cualitativo:

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad | Datos |
|---|---|---|---|---|---|---|
| `wq2012/univ_conformer_small_sphereface` | Conformer + ATP, perdida SphereFace | 2.029.892 (encoder) | audio de longitud variable (log-mel 80 dim @ 16 kHz) | apache-2.0 | HuggingFace, PyPI `flaxspeaker`, GitHub | EER 22-26 % 1-utt (multi-dominio) |
| ECAPA-TDNN (familia SpeechBrain) | TDNN con atencion de canales | no disponible aqui | audio de longitud variable | no disponible aqui | no disponible aqui | no disponible en esta ficha |
| x-vector (familia Kaldi) | TDNN con pooling estadistico | no disponible aqui | audio de longitud variable | no disponible aqui | no disponible aqui | no disponible en esta ficha |
| Modelos tipo WavLM/wav2vec2 para hablante | Transformer auto-supervisado | no disponible aqui | audio de longitud variable | no disponible aqui | no disponible aqui | no disponible en esta ficha |

Nota: los resultados de busqueda web recibidos corresponden a **SphereFace** en su acepcion original de reconocimiento facial (perdida A-Softmax angular), que es un trabajo distinto aunque comparte el nombre; no son comparables directamente con este checkpoint de hablante.

## Limitaciones y advertencias

- Rendimiento moderado: el propio autor publica EER del 22-26 % en verificacion de 1 locucion y del 18-23 % con 3 locuciones, valores alejados de sistemas de produccion de alta precision.
- Modelo pequeno y de referencia: con ~2 millones de parametros es una implementacion reproducible, no un sistema optimizado para entornos comerciales exigentes.
- Sesgos y dominio: el rendimiento varia segun el dominio acustico (mejor en LibriSpeech que en audio in-the-wild), y puede degradarse en condiciones de ruido, canales o idiomas no cubiertos por los datos de entrenamiento.
- Riesgo de falsos positivos/negativos en biometria: como todo sistema de verificacion de hablante, es vulnerable a suplantacion, voz sintetica o conversion de voz; no debe usarse como unico factor de autenticacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de asignar correctamente una identidad erronea cuando las puntuaciones coseno son cercanas al umbral.
- Idiomas: la informacion disponible no especifica una lista oficial de idiomas soportados; el embedding de hablante es en principio independiente del idioma, pero la evaluacion solo cubre ingles y chino (mas VoxCeleb in-the-wild).
- Aviso del autor: no es un producto soportado oficialmente por Google; es una reproduccion independiente y los articulos originales se entrenaron con infraestructura y datos internos no publicos.
- Licencia: Apache 2.0 permite uso comercial, pero se debe respetar la atribucion y las condiciones de los datasets de entrenamiento (LibriSpeech, CN-Celeb, VoxCeleb), cuyos terminos de uso son independientes.
- Frontend acoplado: el rendimiento depende de usar el mismo pipeline (log-mel de 80 dimensiones a 16 kHz, VAD de energia, CMVN); desviarse de el puede degradar las puntuaciones.
- Adopcion practicamente nula en el Hub en el momento de la ficha (0 descargas, 0 likes), sin comunidad ni soporte amplio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_conformer_small_sphereface
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642v3
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/librispeech_asr
- Dataset CN-Celeb: https://huggingface.co/datasets/cnceleb
- Dataset VoxCeleb: https://huggingface.co/datasets/voxceleb
- Referencia sobre SphereFace (reconocimiento facial, trabajo distinto del mismo nombre): https://arxiv.org/abs/1704.08063 y https://github.com/wy1iu/sphereface
