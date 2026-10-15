# wq2012/ls_conformer_small_pfas

## Resumen

`ls_conformer_small_pfas` es un modelo de verificación e identificación de hablante (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproducción limpia y de código abierto en JAX/Flax de varios algoritmos de reconocimiento de hablante publicados por Google. El modelo extrae embeddings de voz de 640 dimensiones a partir de audio y permite comparar dos grabaciones para decidir si pertenecen al mismo hablante, mediante una puntuación de verificación basada en PFAS (Parameter-Free Attentive Scoring).

La arquitectura combina un backbone Conformer de tamano "small" con pooling temporal atento (PFAS) y una funcion de perdida `extended_set_softmax` (variante de GE2E). El encoder tiene 2.162.187 parametros y trabaja sobre caracteristicas log-mel de 80 dimensiones a 16 kHz, con deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN como preprocesado.

Es relevante porque ofrece un checkpoint pequeno, ligero y con licencia Apache 2.0 para tareas de biometria de voz, verificacion de locutor y extraccion de embeddings de hablante, con resultados de evaluacion publicados en tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1). Al ser un modelo diminuto (poco mas de 2 millones de parametros), puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace util para prototipos, investigacion y despliegues con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (tamano small) con pooling temporal PFAS |
| Parametros totales | 2.162.187 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre LibriSpeech, ingles; evaluado tambien en chino y en datos in-the-wild) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |
| Dimension del embedding de salida | 640 |
| Frontend de audio | log-mel de 80 dimensiones a 16 kHz + VAD por energia + CMVN |
| Funcion de perdida | extended_set_softmax |
| Puntuacion de verificacion | PFAS (Parameter-Free Attentive Scoring) |
| Dominio de entrenamiento | librispeech |

## Arquitectura y entrenamiento

El modelo se basa en un encoder Conformer de configuracion "small" que procesa caracteristicas log-mel de 80 dimensiones extraidas a 16 kHz. Sobre las representaciones del encoder se aplica un pooling temporal atento de tipo PFAS (Parameter-Free Attentive Scoring), que agrega la informacion a lo largo del tiempo para producir un embedding de hablante de 640 dimensiones. El entrenamiento utiliza la perdida `extended_set_softmax`, una variante de la familia GE2E orientada a mejorar la discriminacion entre hablantes dentro de un batch.

Segun la propia model card, se trata de una reproduccion open source (clean-room) en JAX/Flax de los algoritmos descritos en los articulos GE2E, Dr-Vectors, Conformer-ATP y PFAS. El autor advierte explicitamente que los experimentos originales de esos articulos se realizaron con infraestructura interna propietaria de Google y con conjuntos de datos internos, no con esta libreria ni con los splits publicos. El modelo fue entrenado sobre el dominio de LibriSpeech. No se especifica en la informacion disponible el numero de tokens de audio, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este tipo de tarea).

## Capacidades

- Extraccion de embeddings de hablante: genera vectores de 640 dimensiones que representan la identidad vocal de una grabacion.
- Verificacion de hablante (1 utterance): compara dos audios y devuelve una puntuacion de similitud para decidir si son del mismo locutor.
- Verificacion multi-enrollment (3 utterances): combina varias grabaciones de referencia para mejorar la precision de la decision.
- Reconocimiento de hablante: clasificacion de identidad vocal en tareas de audio-classification.
- Robustez multi-dominio: evaluado en ingles leido (LibriSpeech), chino multigenero (CN-Celeb2) y datos in-the-wild (VoxCeleb1).
- Integracion en pipelines: API Python (`load_pretrained`, `extract_embedding`, `verify`) y script de inferencia por linea de comandos.
- No dispone de tool calling, agentes, vision, audio generativo ni modo de razonamiento; su alcance es exclusivamente la biometria de voz.

## Casos de uso

- Verificacion biometrica de acceso: usar el modelo para confirmar la identidad de un usuario comparando su voz en vivo con una grabacion de enrolamiento, aprovechando el embedding de 640 dimensiones y la puntuacion PFAS.
- Autenticacion por voz en aplicaciones moviles: al tener solo 2,16 millones de parametros, puede ejecutarse en dispositivos con recursos limitados o en servidores modestos sin GPU dedicada.
- Diarizacion de reuniones: extraer embeddings de segmentos de audio y agruparlos para atribuir intervenciones a distintos hablantes en transcripciones.
- Enrolamiento multi-muestra: usar la modalidad de 3 utterances para construir perfiles de hablante mas robustos en sistemas de atencion al cliente que registran varias llamadas.
- Deteccion de suplantacion o fraude: comparar la voz de una llamada entrante con la voz registrada del titular para detectar intentos de suplantacion de identidad.
- Investigacion en reconocimiento de hablante: servir como baseline reproducible y ligero para comparar tecnicas de pooling, perdidas o arquitecturas conformer en JAX/Flax.
- Indexado y busqueda por voz: generar embeddings de un catalogo de audios y realizar busqueda por similitud para localizar grabaciones de un mismo locutor.
- Preprocesado en pipelines de audio a gran escala: extraer embeddings de forma masiva para alimentar sistemas de clustering o clasificacion posteriores.

## Benchmarks y rendimiento

Los resultados de evaluacion publicados en la model card son los siguientes.

Verificacion con 1 utterance:

| Split de evaluacion | Trials | EER (%) | IC 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 10,50 | [9,55; 11,77] | 0,8193 | 0,5347 | 0,9593 |
| CN-Celeb2 (chino multigenero) | 3.000 | 28,83 | [27,18; 30,30] | 0,9427 | 0,9080 | 0,7938 |
| VoxCeleb1 (in-the-wild) | 2.000 | 22,90 | [20,85; 24,50] | 0,9930 | 0,8940 | 0,8651 |
| Universal Pooled (3 dominios) | 8.000 | 20,88 | [20,04; 21,81] | 0,9587 | 0,7792 | 0,8837 |
| Universal Macro-Average | 8.000 | 20,74 | — | 0,9183 | 0,7789 | 0,8727 |

Verificacion con 3 utterances (multi-enrollment):

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 6,20 | [4,80; 7,60] | 0,6160 | 0,9827 |
| CN-Celeb2 (3-utt) | 1.000 | 24,90 | [22,09; 27,45] | 0,8800 | 0,8472 |
| VoxCeleb1 (3-utt) | 1.000 | 18,70 | [16,00; 20,80] | 0,9260 | 0,9034 |
| Universal Pooled (3-utt) | 3.000 | 16,80 | [15,58; 18,13] | 0,8307 | 0,9216 |
| Universal Macro-Average (3-utt) | 3.000 | 16,60 | — | 0,8073 | 0,9111 |

El mejor rendimiento se observa en el dominio de entrenamiento (LibriSpeech, ingles), mientras que en chino y en datos in-the-wild el EER aumenta de forma notable. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,16 millones de parametros, los pesos en float32 ocupan aproximadamente 8,6 MB, por lo que cabe holgadamente en cualquier GPU moderna e incluso en memoria compartida.
- GPU recomendadas: cualquier GPU, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere aceleradores de gama alta.
- Ejecucion en CPU: totalmente viable; el cuello de botella sera la extraccion de caracteristicas log-mel y el preprocesado de audio, no la red.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo, e incluso en dispositivos embebidos o moviles si se convierte el modelo.
- Opciones de despliegue: la libreria oficial es `flaxspeaker` (JAX/Flax); tambien pueden cargarse los pesos safetensors con otras herramientas compatibles. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos con otros modelos de verificacion de hablante (por ejemplo, ECAPA-TDNN, x-vector o WavLM-based speaker models), ni de sus parametros, contexto, rendimiento o licencia en este contexto. Por tanto, la comparativa se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ls_conformer_small_pfas | 2.162.187 | no disponible | Apache 2.0 | HuggingFace (wq2012) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento desigual por dominio: el EER sube del 10,50% en LibriSpeech al 28,83% en CN-Celeb2 y al 22,90% en VoxCeleb1, lo que indica una degradacion importante fuera del dominio de entrenamiento.
- Sesgo de dominio e idioma: entrenado sobre LibriSpeech (ingles leido); su comportamiento en acentos, idiomas o condiciones acusticas no representadas puede ser deficiente.
- No es un producto oficial de Google: la model card lo declara explicitamente como una reproduccion independiente, no soportada oficialmente.
- Riesgo de falsos positivos y negativos: como todo sistema biometrico, puede cometer errores de aceptacion o rechazo; las tasas de EER y minDCF publicadas deben tenerse en cuenta al fijar umbrales en produccion.
- Dependencia del preprocesado: el rendimiento depende del frontend log-mel de 80 dimensiones, del VAD por energia y de la normalizacion CMVN; cambios en este pipeline pueden alterar los resultados.
- Privacidad y regulacion: el uso de biometria vocal esta sujeto a normativas como el RGPD en la Union Europea; es necesario contar con consentimiento y base legal para tratar datos de voz.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos de los datasets subyacentes (LibriSpeech, CN-Celeb2, VoxCeleb) si se redistribuyen derivados.
- Ausencia de datos de cuantizacion y despliegue: no se documentan versiones cuantizadas ni benchmarks de latencia, lo que limita la planificacion de produccion.
- Nota terminologica: en este contexto "PFAS" se refiere a Parameter-Free Attentive Scoring, no a las sustancias quimicas per- y polifluoroalquiladas; los resultados de busqueda web sobre PFAS quimicos no son relevantes para este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_conformer_small_pfas
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
- Modelo relacionado personal-vad-v2-conformer-unified: https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
- Modelo relacionado personal-vad-v2-conformer-std-vad: https://huggingface.co/wq2012/personal-vad-v2-conformer-std-vad
