# wq2012/ls_ecapa_tdnn_small_ge2e

## Resumen

`ls_ecapa_tdnn_small_ge2e` es un extractor de embeddings de hablante (192 dimensiones) implementado en JAX/Flax y publicado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. Se trata de una reproducción limpia y no oficial de una familia de algoritmos de verificación de hablante descritos en los artículos GE2E, Dr-Vectors, Conformer-ATP y PFAS, con una arquitectura backbone ECAPA-TDNN en variante `small`, pooling temporal atencional (`asp`), pérdida de entrenamiento GE2E softmax y scoring por similitud coseno.

El modelo resuelve la tarea clásica de speaker verification y speaker recognition: dado uno o varios audios de enrollment y un audio de test, produce un embedding de identidad de voz y una puntuación de similitud. Con 1.684.416 parámetros en el encoder y un frontend de 80 dimensiones log-mel a 16 kHz con VAD de energía y CMVN, es un modelo de huella mínima pensado para inferencia en CPU, dispositivos móviles y edge, y se distribuye también en TensorFlow Lite (FP32 e INT8 de rango dinámico).

Su relevancia actual es doble: por un lado, cubre un nicho poco poblado de checkpoints de reconocimiento de hablante nativos de Flax, útiles para investigación reproducible en el ecosistema JAX; por otro, sus resultados publicados son deliberadamente modestos (EER del 13,83 % en LibriSpeech con una utterance y del 22,48 % en el conjunto agregado de tres dominios), lo que lo sitúa como herramienta de prototipado y de evaluación de pipelines, no como sistema biométrico de alta seguridad. La licencia Apache-2.0 facilita su uso comercial, pero las cifras de error obligan a tratarlo como componente auxiliar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN variante `small`, con pooling temporal atencional (`asp`) |
| Parametros totales | 1.684.416 (parametros del encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; la entrada es una utterance de duracion variable procesada en ventanas log-mel) |
| Tipos de cuantizacion | FP32 (pesos originales y `model_fp32.tflite`) e INT8 de rango dinamico (`model_int8.tflite`, aproximadamente 3,5 veces mas pequeno) |
| Idiomas soportados | no disponible; el dominio de entrenamiento indicado es `librispeech` (ingles leido) y la evaluacion cubre ingles y chino |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), Flax msgpack (`flax_model.msgpack`), TensorFlow Lite FP32 e INT8 |
| Dimension del embedding de salida | 192 |
| Funcion de perdida de entrenamiento | `ge2e_softmax` |
| Scoring de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN |
| Dominio de entrenamiento | `librispeech` |
| Libreria | flaxspeaker |
| Pipeline | audio-classification |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El encoder sigue el diseno ECAPA-TDNN: bloques convolucionales unidimensionales con agregacion de multiples escalas mediante conexiones residuales densas (res2net-style) y atencion de canal squeeze-excitation, seguidos de un pooling temporal atencional (`asp`) que agrega la secuencia en un unico vector de utterance. La salida es un embedding de 192 dimensiones, y la verificacion se realiza con similitud coseno sobre embeddings normalizados. El frontend convierte el audio a log-mel de 80 dimensiones a 16 kHz, aplica un VAD basado en energia y normalizacion CMVN; el fichero `preprocessor_config.json` es compatible con `WhisperFeatureExtractor`.

El entrenamiento utiliza la perdida `ge2e_softmax` sobre el corpus LibriSpeech (ingles leido). No se especifica en la informacion disponible el numero de tokens o de horas de audio empleadas, la composicion exacta del dataset, el esquema de aumentacion de datos ni si hubo etapas de ajuste fino con RLHF o DPO (tecnicas que, por otra parte, no son habituales en reconocimiento de hablante). El autor declara explicitamente que se trata de una reproduccion open source independiente y "clean-room" de los articulos GE2E (arXiv:1710.10467), Dr-Vectors (arXiv:2104.01989), Conformer-ATP (arXiv:2202.12163) y PFAS (arXiv:2203.05642), y advierte que los experimentos de esos articulos se ejecutaron sobre infraestructura y conjuntos de datos internos de Google, por lo que sus cifras no son comparables con este checkpoint.

Entre las innovaciones tecnicas recogidas del trabajo original y aplicadas aqui destacan el pooling atencional dependiente del contexto, la puntuacion atencional sin parametros adicionales (PFAS) y la generalizacion multi-enrolamiento, que reduce el EER al combinar tres utterances de enrollment en lugar de una. No se documentan tecnicas de decodificacion especulativa ni atencion lineal, ya que no se trata de un modelo autoregresivo.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de una utterance de audio (`model.extract_embedding`).
- Verificacion de hablante 1:1 mediante puntuacion de similitud coseno entre dos audios (`model.verify`).
- Verificacion multi-enrolamiento: el soporte de 3 utterances reduce de forma consistente el EER en todos los dominios evaluados.
- Clasificacion de audio orientada a identidad de voz (pipeline `audio-classification`).
- Inferencia en CPU y edge gracias a las exportaciones TensorFlow Lite en FP32 e INT8 de rango dinamico, compatibles con moviles y dispositivos embebidos.
- Interfaz de linea de comandos incluida en el repositorio (`scripts/inference.py`) para enrollment y test.
- Integracion con el ecosistema JAX/Flax mediante carga desde Hugging Face Hub o directorio local.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio generativo ni transcripcion de voz a texto (no es un modelo ASR).
- Cobertura multilingue: no declarada; la evaluacion muestra degradacion severa fuera del ingles.

## Casos de uso

- Autenticacion de voz en aplicaciones moviles y dispositivos edge: el modelo exportado a TFLite INT8 ocupa aproximadamente 1,9 MB (frente a unos 6,7 MB en FP32), por lo que puede embeberse en aplicaciones Android, iOS o firmware de dispositivos IoT sin GPU y ejecutar la verificacion localmente sin enviar biometria a la nube.
- Diarizacion ligera en pipelines de transcripcion: extraer un embedding por segmento de audio y agrupar segmentos por similitud coseno permite atribuir intervenciones a hablantes en reuniones o llamadas, siempre que la precision exigida no sea alta.
- Enrutado de llamadas en atencion al cliente: comparar el embedding de la voz entrante con el perfil de un cliente ya enrolado permite precargar su historial antes de que un agente humano intervenga, como capa de conveniencia y no como barrera de seguridad.
- Curacion y deduplicacion de corpus de audio: calcular embeddings sobre un corpus completo y agrupar por similitud permite detectar audios duplicados o del mismo hablante antes de entrenar otros modelos, con un coste de computo muy bajo por utterance.
- Investigacion reproducible en JAX/Flax: sirve como baseline nativo de Flax para experimentar con variantes de pooling (ASP frente a estadisticas simples), funciones de perdida (GE2E softmax, AAM-softmax) y estrategias de aumentacion, sin depender de implementaciones en PyTorch.
- Verificacion de identidad de segunda linea en tareas de bajo riesgo: control de acceso a salas de reunion virtuales, verificacion de asistencia en clase o confirmacion de locutor en encuestas telefonicas, donde un fallo de verificacion no tiene consecuencias criticas.
- Segmentacion previa en sistemas de reconocimiento de habla: usar los cambios de embedding para detectar fronteras de hablante y trocear audio largo antes de pasarlo a un modelo ASR.

## Benchmarks y rendimiento

Resultados de verificacion con una utterance (1-utt), extraidos de `eval_results.json` segun la model card:

| Conjunto de evaluacion | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 13,83 | [12,35, 15,00] | 0,9607 | 0,6707 | 0,9392 |
| CN-Celeb2 (chino, multigenero) | 3.000 | 31,70 | [30,00, 33,20] | 0,9547 | 0,9547 | 0,7468 |
| VoxCeleb1 (celebridades, in-the-wild) | 2.000 | 19,65 | [17,85, 21,28] | 0,9760 | 0,9060 | 0,8846 |
| Agregado universal (3 dominios) | 8.000 | 22,48 | [21,59, 23,35] | 0,9680 | 0,8658 | 0,8587 |
| Media macro universal (3 dominios) | 8.000 | 21,73 | no disponible | 0,9638 | 0,8438 | 0,8569 |

Resultados con tres utterances de enrollment (3-utt):

| Conjunto de evaluacion | Trials | 3-utt EER (%) | IC bootstrap 95 % (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 9,10 | [6,75, 10,80] | 0,9440 | 0,9655 |
| CN-Celeb2 (3-utt) | 1.000 | 28,40 | [25,40, 31,11] | 0,8580 | 0,8044 |
| VoxCeleb1 (3-utt) | 1.000 | 15,90 | [13,55, 17,60] | 0,9060 | 0,9241 |
| Agregado universal (3-utt) | 3.000 | 17,83 | [16,33, 19,13] | 0,9653 | 0,9065 |
| Media macro universal (3-utt) | 3.000 | 17,80 | no disponible | 0,9027 | 0,8980 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de habla (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un modelo de reconocimiento de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; con 1.684.416 parametros, el checkpoint FP32 ocupa aproximadamente 6,7 MB y la version INT8 aproximadamente 1,9 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con menos de 1 GB de memoria disponible.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (serie GTX 10, RTX 20/30/40) o incluso GPU integrada es suficiente; A100 o H100 no aportan ventaja practica para este tamano.
- Cabe en GPU consumer: si, en todas, y tambien en CPU, Raspberry Pi y telefonos moviles mediante las exportaciones TFLite.
- Opciones de despliegue: libreria `flaxspeaker` (JAX/Flax) para CPU, GPU y TPU; TensorFlow Lite (`model_fp32.tflite` y `model_int8.tflite`) para movil y edge; carga de pesos via safetensors o msgpack. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. No se publican mediciones de RTF (real-time factor) ni de utterances por segundo en la informacion proporcionada.
- La verificacion multi-enrolamiento (3 utterances) multiplica por tres el coste de extraccion de embeddings en la fase de enrollment, pero mantiene el numero de inferencias por consulta en uno.

## Comparativa con modelos similares

Comparativa con alternativas habituales de la misma categoria (extraccion de embeddings de hablante). Los datos de los modelos de terceros no aparecen en la informacion proporcionada, por lo que se marcan como no disponibles:

| Modelo | Arquitectura | Parametros | Dim. embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/ls_ecapa_tdnn_small_ge2e` (este) | ECAPA-TDNN small + ASP, JAX/Flax | 1.684.416 | 192 | Apache-2.0 | Hugging Face Hub, PyPI (`flaxspeaker`), TFLite |
| SpeechBrain `spkrec-ecapa-voxceleb` | ECAPA-TDNN, PyTorch | no disponible | no disponible | no disponible | no verificado en la informacion proporcionada |
| WeSpeaker (resnet / ECAPA) | ResNet y ECAPA-TDNN, PyTorch | no disponible | no disponible | no disponible | no verificado en la informacion proporcionada |
| NVIDIA NeMo TitaNet | TitaNet (1D convolucional con atencion) | no disponible | no disponible | no disponible | no verificado en la informacion proporcionada |

Puntos de diferenciacion verificables a partir de la informacion aportada: este checkpoint es nativo de Flax/JAX (poco comun en la categoria), incluye exportaciones TFLite FP32 e INT8, y publica intervalos de confianza bootstrap junto con minDCF y ROC-AUC en tres dominios distintos. A cambio, su EER es muy superior al que suele reportarse para modelos ECAPA-TDNN entrenados sobre VoxCeleb, por lo que no es un sustituto directo de esos sistemas cuando se requiere precision alta.

## Limitaciones y advertencias

- Precision limitada: con una utterance, el EER es del 13,83 % en LibriSpeech, 19,65 % en VoxCeleb1 y 31,70 % en CN-Celeb2. No es adecuado para autenticacion de alta seguridad ni para decisiones con impacto economico o legal.
- Brecha de dominio severa: el modelo se entrena sobre LibriSpeech (ingles leido) y pierde mas de 17 puntos de EER al evaluarse sobre chino multigenero (CN-Celeb2). El rendimiento sobre audio espontaneo, telefonia de banda estrecha, ruido de fondo o reverberacion no esta documentado.
- minDCF muy alto: 0,9680 en el agregado a 1-utt con umbral 0,01 indica que, en escenarios con coste asimetrico y umbrales estrictos, el modelo no es competitivo.
- Idiomas soportados no declarados: no hay lista oficial de idiomas, y la unica evidencia disponible apunta a ingles como idioma principal de entrenamiento, con degradacion clara en chino.
- Riesgo de sesgo demografico: no se documentan analisis de equidad por genero, edad, acento, canal o condicion de audicion. Estos sesgos son conocidos en sistemas de reconocimiento de hablante entrenados sobre corpus como LibriSpeech o VoxCeleb, pero no se cuantifican en esta ficha.
- VAD de energia: el preprocesado depende de un detector de actividad vocal por energia, sensible a ruido estacionario y a audio musical, lo que puede degradar la extraccion en entornos ruidosos.
- Alcance funcional: solo produce embeddings de identidad. No transcribe, no detecta suplantacion (anti-spoofing), no estima emociones ni edad, y no debe presentarse como sistema de verificacion completo sin una capa adicional de deteccion de ataques de reproduccion o sintesis.
- Aviso del autor: es una reproduccion no oficial y no es un producto soportado por Google. Las cifras de los articulos originales no son comparables con las de este checkpoint.
- Validacion externa nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin replicaciones independientes conocidas.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. El autor no impone restricciones adicionales, pero el tratamiento de embeddings biometricos de voz exige cumplir la normativa aplicable de proteccion de datos (por ejemplo, RGPD en la Union Europea), incluida la base juridica y el consentimiento de los hablantes.
- Los resultados de busqueda web asociados a esta consulta no contenian ningun enlace relacionado con el modelo, por lo que no se incorporan fuentes adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_ecapa_tdnn_small_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Articulo GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Articulo Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Articulo Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- Articulo PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Enlaces adicionales de papers, blogs o demos: no disponibles en la informacion proporcionada.
