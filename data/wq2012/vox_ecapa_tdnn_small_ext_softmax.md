# wq2012/vox_ecapa_tdnn_small_ext_softmax

## Resumen

`vox_ecapa_tdnn_small_ext_softmax` es un modelo de verificacion e identificacion de locutor (speaker verification / speaker embeddings) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementacion limpia (clean-room) en JAX/Flax de algoritmos de reconocimiento de locutor publicados por Google Research. El modelo toma audio a 16 kHz, aplica un frontend de log-mel de 80 dimensiones con VAD de energia y CMVN, y produce un embedding de locutor de 192 dimensiones sobre el que se calcula una puntuacion de similitud coseno.

Se trata de un modelo deliberadamente pequeno: el encoder ECAPA-TDNN en variante `small` tiene 1.684.418 parametros, lo que lo situa en el rango de los pocos megabytes y lo hace apto para inferencia en CPU o dispositivos de borde. La cabeza de clasificacion usa la perdida `extended_set_softmax` y el pooling temporal es `asp` (attentive statistics pooling). El entrenamiento se realizo en el dominio VoxCeleb1, y la evaluacion publicada cubre tres dominios distintos (LibriSpeech en ingles leido, CN-Celeb2 en chino multigenero y VoxCeleb1 in-the-wild).

Su relevancia actual es doble: por un lado, ofrece una implementacion reproducible y con licencia Apache 2.0 de tecnicas (GE2E, Dr-Vectors, attentive temporal pooling, parameter-free attentive scoring) cuyos experimentos originales se hicieron con infraestructura y datos internos propietarios de Google; por otro, al ser un modelo de 1,68 M de parametros con resultados de EER publicados y con intervalos de confianza bootstrap, sirve como linea base honesta y ligera para tareas de biometria de voz, diarizacion y analisis de audio, siempre que se asuma que su precision esta muy lejos de los sistemas ECAPA-TDNN grandes entrenados en VoxCeleb2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (variante `small`), con pooling temporal `asp` (attentive statistics pooling) |
| Parametros totales | 1.684.418 (encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de embeddings de locutor; opera sobre segmentos de audio, no sobre tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors y msgpack nativo de Flax) |
| Idiomas soportados | no disponible como lista oficial; evaluado en ingles (LibriSpeech), chino (CN-Celeb2) e ingles in-the-wild (VoxCeleb1) |
| Licencia | apache-2.0 |
| Formato de pesos | `model.safetensors` (SafeTensors) y `flax_model.msgpack` (Flax nativo) |
| Dimension del embedding de salida | 192 |
| Frontend de audio | log-mel de 80 dimensiones a 16000 Hz + VAD de energia + CMVN |
| Perdida de entrenamiento | `extended_set_softmax` |
| Puntuacion de verificacion | similitud coseno |
| Dominio de entrenamiento | voxceleb1 |
| Libreria | flaxspeaker |
| Pipeline declarado | audio-classification |
| Tamano del repositorio | 0,0 GB (pesos de pocos MB) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN, la arquitectura presentada por Desplanques, Thienpondt y Demuynck en Interspeech 2020 (arXiv:2005.07143), que anade bloques SE (squeeze-excitation), bloques Res2 y attentive statistics pooling sobre una TDNN clasica. En esta ficha se usa la variante `small`, con 1.684.418 parametros en el encoder y un embedding final de 192 dimensiones, muy por debajo de las configuraciones habituales de ECAPA-TDNN en produccion. El pooling temporal es `asp`, y la funcion de perdida es `extended_set_softmax`, una extension del marco set-based utilizado en GE2E (arXiv:1710.10467) y en Dr-Vectors (arXiv:2104.01989). La verificacion se realiza con similitud coseno sobre los embeddings, siguiendo la propuesta de parameter-free attentive scoring (PFAS, arXiv:2203.05642).

El autor declara explicitamente que este checkpoint y la libreria FlaxSpeaker son una reproduccion independiente y limpia en JAX/Flax de algoritmos publicados, y que los experimentos de los articulos originales se hicieron con infraestructura interna propietaria de Google y con datasets internos, no con esta libreria ni con este split de datos publicos. El modelo se entrena en el dominio VoxCeleb1; las etiquetas del repositorio declaran los datasets librispeech_asr, cnceleb y voxceleb, que corresponden a los dominios empleados en la evaluacion multi-dominio publicada (LibriSpeech, CN-Celeb2 y VoxCeleb1). No se documentan en la informacion disponible ni el numero exacto de horas de audio de entrenamiento, ni detalles de aumento de datos, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo discriminativo de embeddings), ni el numero de epocas o la estrategia de optimizacion.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de un fichero de audio a 16 kHz, mediante `model.extract_embedding(...)`.
- Verificacion de locutor (1:1): comparacion de dos audios con puntuacion coseno mediante `model.verify(enroll, test)`, con score imprimible en formato flotante.
- Identificacion de locutor (1:N) por comparacion contra una galeria de embeddings, ya que el espacio de embeddings es directamente utilizable con similitud coseno.
- Multi-enrolamiento: el modelo card publica resultados especificos con 3 utterances de enrolamiento, con reduccion de EER respecto al caso de 1 utterance en todos los dominios evaluados.
- Funcionamiento multilingue en la practica: evaluado con audio en ingles (LibriSpeech, VoxCeleb1) y en chino (CN-Celeb2), aunque no hay una lista oficial de idiomas soportados.
- Inferencia en CPU y en dispositivos de borde por el tamano reducido del encoder (1,68 M de parametros).
- Integracion con el ecosistema JAX/Flax mediante la libreria `flaxspeaker`, con carga desde Hugging Face Hub o desde directorio local y con script de linea de comandos `scripts/inference.py`.
- Frontend reproducible: log-mel de 80 dimensiones a 16 kHz, VAD de energia y CMVN, con configuracion compatible con `WhisperFeatureExtractor` en `preprocessor_config.json`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo "thinking"; no son de aplicacion a este tipo de modelo.

## Casos de uso

- Autenticacion biometrica por voz en aplicaciones de acceso: se enrola al usuario con una o varias grabaciones y se compara el score coseno de la muestra de acceso contra su embedding de referencia; el modelo es adecuado para prototipos y sistemas de baja criticidad por su tamano (1,68 M de parametros) y por su licencia Apache 2.0.
- Control de acceso en dispositivos de borde o kioscos: al ocupar del orden de 6,7 MB en FP32, el encoder cabe en memoria de un sistema embebido o de un telefono y puede ejecutarse sin GPU dedicada.
- Diarizacion de reuniones y grabaciones largas: extraccion de un embedding por segmento de habla y agrupamiento posterior (clustering) para asignar etiquetas de locutor a cada turno; funciona con audio a 16 kHz y no requiere una ventana de contexto de tokens.
- Enriquecimiento de transcripciones ASR: en pipelines de reconocimiento de voz con multiples hablantes, los embeddings permiten etiquetar quien dice cada fragmento y mantener la coherencia de identidad a lo largo de la grabacion.
- Analisis de contact centers: verificacion de que la persona que llama coincide con el titular registrado, o deteccion de llamadas repetidas del mismo locutor en una base de grabaciones mediante busqueda por similitud coseno sobre una galeria de embeddings.
- Indexado y busqueda de archivos de audio por voz: generacion de un vector de 192 dimensiones por fichero y construccion de un indice vectorial para recuperar todas las grabaciones de un mismo locutor.
- Filtrado y control de calidad de datasets de habla: uso del embedding para detectar duplicados de locutor, sesgos de recopilacion o contaminacion entre splits de entrenamiento y evaluacion.
- Linea base reproducible para investigacion: comparacion de nuevas perdidas, backbones o estrategias de pooling contra un resultado publicado con EER, minDCF y ROC-AUC en tres dominios y con intervalos de confianza bootstrap del 95 %.

## Benchmarks y rendimiento

Resultados publicados por el autor en `eval_results.json`, para verificacion con 1 utterance:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 20,07 | [18,52; 21,55] | 0,9860 | 0,9553 | 0,8815 |
| CN-Celeb2 (chino multigenero) | 3.000 | 32,40 | [30,58; 34,05] | 0,9973 | 0,9840 | 0,7473 |
| VoxCeleb1 (in-the-wild) | 2.000 | 21,10 | [19,30; 23,30] | 0,9940 | 0,9510 | 0,8690 |
| Universal pooled (3 dominios) | 8.000 | 24,57 | [23,73; 25,48] | 0,9952 | 0,9700 | 0,8328 |
| Universal macro-average (3 dominios) | 8.000 | 24,52 | no disponible | 0,9924 | 0,9634 | 0,8326 |

Resultados con enrolamiento multiple de 3 utterances:

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 14,60 | [12,40; 17,05] | 0,9560 | 0,9242 |
| CN-Celeb2 (3-utt) | 1.000 | 30,60 | [27,80; 33,35] | 0,9760 | 0,7659 |
| VoxCeleb1 (3-utt) | 1.000 | 17,80 | [14,80; 20,50] | 0,9920 | 0,9050 |
| Universal pooled (3-utt) | 3.000 | 20,97 | [19,57; 22,57] | 0,9907 | 0,8730 |
| Universal macro-average (3-utt) | 3.000 | 21,00 | no disponible | 0,9747 | 0,8650 |

No se han publicado en la informacion disponible resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a un modelo de embeddings de locutor. Tampoco se aportan comparaciones directas con otros sistemas bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: calculada a partir del numero de parametros, en FP32 los pesos ocupan aproximadamente 6,7 MB (1.684.418 × 4 bytes) y en FP16/BF16 aproximadamente 3,4 MB (1.684.418 × 2 bytes). El consumo adicional corresponde a activaciones del frontend log-mel y del encoder sobre el audio de entrada.
- GPU recomendadas: no se especifica ninguna en la informacion disponible; dado el tamano, cualquier GPU con al menos unos pocos cientos de MB libres es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, con margen amplisimo. Tambien cabe en CPU de uso general y en plataformas embebidas o de borde por el tamano del encoder.
- Opciones de despliegue: la via documentada es la libreria `flaxspeaker` sobre JAX/Flax, cargando el checkpoint desde el Hub o desde disco y ejecutando `scripts/inference.py` o la API Python. Los pesos se publican en SafeTensors y en msgpack nativo de Flax. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT, y no hay ficheros GGUF en el repositorio.
- Latencia y throughput estimados: no disponible. No se publican medidas de tiempo de inferencia, RTF ni coste por par de verificacion.
- Nota de licencia: el autor declara que no es un producto soportado oficialmente por Google, pese a la licencia Apache 2.0 del repositorio.

## Comparativa con modelos similares

La informacion disponible sobre los modelos comparables es muy limitada; se recoge unicamente lo que aparece en los resultados de busqueda y se marca como "no disponible" todo lo que no este confirmado.

| Modelo | Parametros | Contexto / tarea | EER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/vox_ecapa_tdnn_small_ext_softmax` (este modelo) | 1.684.418 | Embeddings de locutor de 192 dim, entrenado en VoxCeleb1 | 21,10 % en VoxCeleb1 (1-utt); 17,80 % en VoxCeleb1 (3-utt) | apache-2.0 | Hugging Face Hub, pesos safetensors y msgpack |
| `TaoRuijie/ECAPA-TDNN` | no disponible | Reimplementacion no oficial de ECAPA-TDNN para reconocimiento de locutor | 0,86 % en Vox1-O entrenando solo en Vox2 (segun la descripcion del repositorio) | no disponible | GitHub |
| `yangwang825/ecapa-tdnn-vox2` | no disponible | ECAPA-TDNN entrenado en VoxCeleb2 | no disponible | no disponible | Hugging Face Hub |
| `HuShou-ZMZN/ECAPA_TDNN` | no disponible | ECAPA-TDNN para reconocimiento de locutor | no disponible | no disponible | Hugging Face Hub |

La diferencia de EER entre este modelo y la reimplementacion de TaoRuijie no es directamente comparable: el segundo reporta resultados entrenando en VoxCeleb2 con protocolos de evaluacion de VoxCeleb1, mientras que este checkpoint declara entrenamiento en el dominio VoxCeleb1 y evaluacion adicional en LibriSpeech y CN-Celeb2. No hay datos publicos suficientes en la informacion proporcionada para establecer una comparacion homogenea.

## Limitaciones y advertencias

- Precision limitada: el EER en VoxCeleb1 con un solo utterance de enrolamiento es del 21,10 % y sube al 32,40 % en CN-Celeb2. Son tasas de error muy altas para un sistema biometrico en produccion y muy superiores a las de los ECAPA-TDNN grandes entrenados en VoxCeleb2 (la reimplementacion de TaoRuijie reporta 0,86 % en Vox1-O).
- Modelo de investigacion y demostracion: el propio autor indica que no es un producto soportado oficialmente por Google y que los articulos originales se validaron con infraestructura y datos internos, no con esta libreria ni con estos splits publicos.
- Rendimiento desigual por idioma y dominio: el salto de EER entre LibriSpeech (20,07 %) y CN-Celeb2 (32,40 %) con 1 utterance muestra una degradacion clara fuera de los dominios con los que se entreno y valido. No hay lista oficial de idiomas soportados.
- Riesgo de falso positivo y falso negativo: con un EER superior al 20 % en varios escenarios, cualquier uso en autenticacion debe complementarse con otros factores (contrasena, OTP, verificacion humana) y calibrarse con un umbral ajustado al coste real de cada tipo de error.
- Sesgos no evaluados: no se publican analisis de equidad por genero, acento, edad, canal de grabacion, ruido de fondo ni condiciones de microfono. El modelo se ha evaluado en audio a 16 kHz con VAD de energia y CMVN, por lo que condiciones acusticas distintas pueden alterar drasticamente el score.
- Fraude por suplantacion: no se documentan mecanismos de anti-spoofing ni deteccion de audio sintetico o de reproduccion. Un sistema de verificacion basado solo en este modelo es vulnerable a ataques de presentacion.
- Dependencia de la reproduccion de audio: al basarse en similitud coseno entre embeddings, la puntuacion depende de la calidad del frontend log-mel y del VAD; grabaciones muy cortas, con solapamiento de voces o con musica de fondo pueden producir embeddings poco fiables.
- Restricciones de licencia: el repositorio se publica bajo Apache 2.0, lo que permite uso comercial con atribucion y conservacion del aviso de licencia. Sin embargo, el aviso de "no es un producto soportado oficialmente por Google" y la naturaleza de reproduccion de algoritmos publicados deben tenerse en cuenta en la documentacion legal del producto que lo integre.
- Ecosistema limitado: la unica libreria soportada es `flaxspeaker` (JAX/Flax). No hay pesos GGUF, ONNX ni integraciones listas con runtimes de inferencia convencionales, lo que anade coste de integracion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y tamano de repositorio de 0,0 GB, lo que implica poca validacion externa de los resultados por parte de la comunidad.
- Idiomas soportados: no disponible como declaracion formal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/vox_ecapa_tdnn_small_ext_softmax
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP / attentive temporal pooling (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS, parameter-free attentive scoring (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
- Paper original de ECAPA-TDNN (arXiv:2005.07143): https://arxiv.org/abs/2005.07143
- Reimplementacion no oficial de ECAPA-TDNN: https://github.com/TaoRuijie/ECAPA-TDNN
- Implementacion alternativa en GitHub: https://github.com/LKLQQ/ecapa_tdnn
- Modelo comparable en Hugging Face (VoxCeleb2): https://huggingface.co/yangwang825/ecapa-tdnn-vox2
- Modelo comparable en Hugging Face: https://huggingface.co/HuShou-ZMZN/ECAPA_TDNN
