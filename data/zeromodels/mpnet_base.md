# zeromodels/mpnet_base

## Resumen

zeromodels/mpnet_base es una conversion a Keras 3 del checkpoint `microsoft/mpnet-base`, publicada por el proyecto ZeroModels. No se trata de un modelo nuevo entrenado desde cero, sino de una reimplementacion del encoder MPNet original de Microsoft con pesos portados, de forma que una unica implementacion funciona sin modificaciones sobre TensorFlow, PyTorch o JAX simplemente cambiando la variable de entorno `KERAS_BACKEND`. El repositorio se distribuye bajo licencia MIT y el modelo solo soporta ingles.

MPNet (Masked and Permuted Pre-training for Language Understanding, arXiv:2004.09297) es un encoder bidireccional de tipo transformer que unifica el objetivo de masked language modeling de BERT con el de permutacion de XLNet. Frente a BERT, elimina los token-type embeddings, desplaza los identificadores de posicion mas alla del id de padding y anade un sesgo de posicion relativo compartido en cada capa de atencion. El checkpoint aqui alojado corresponde a la configuracion base, con 12 capas y 768 dimensiones ocultas, y esta preparado para fill-mask y para servir de backbone en tareas de comprension del lenguaje.

Su relevancia es fundamentalmente practica: permite usar MPNet dentro de un stack Keras 3 multi-backend, algo poco habitual en modelos encoder heredados de Hugging Face, manteniendo compatibilidad con los safetensors originales mediante el prefijo `hf:`. Al ser un encoder y no un modelo generativo, su uso se orienta a extraccion de representaciones, clasificacion, NER, question answering extractivo y reranking, no a generacion de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (MPNet), 12 capas, 768 dimensiones ocultas; sin token-type embeddings y con sesgo de posicion relativo compartido por capa |
| Parametros totales | no disponible en la informacion proporcionada (la model card solo indica 12 capas / 768 dim) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | Pesos nativos de la libreria `zeromodels` (Keras 3); los safetensors upstream y de la comunidad se cargan mediante el prefijo `hf:` |
| Pipeline | fill-mask |
| Tareas soportadas por las clases del repo | Encoder backbone, masked LM, clasificacion de secuencia, clasificacion de tokens (NER/POS), QA extractivo, multiple choice |
| Modelo base | microsoft/mpnet-base |
| Libreria | zeromodels (Keras 3) |
| Backends compatibles | TensorFlow, PyTorch (torch) y JAX |
| Tamano del repositorio | 1.1 GB |
| Tokenizador | WordPiece con tokens especiales estilo RoBERTa; token de mascara `<mask>` |

## Arquitectura y entrenamiento

La arquitectura es la de MPNet original: un encoder transformer bidireccional con 12 capas y 768 dimensiones ocultas. Sus diferencias respecto a BERT son tres: no utiliza token-type embeddings (la entrada se limita a `input_ids` y `attention_mask`), los ids de posicion se desplazan mas alla del id de padding, y cada capa de atencion incorpora un sesgo de posicion relativo compartido. El preentrenamiento combina masked language modeling con permutacion de posiciones, de modo que el modelo ve todos los tokens a la vez pero predice cada token condicionado a una permutacion, lo que le permite capturar dependencias bidireccionales sin la independencia condicional que asume BERT.

Este repositorio concreto no documenta un entrenamiento propio: es una conversion de pesos de `microsoft/mpnet-base` a una implementacion pura de Keras 3. Por tanto, no hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO (no aplicables a un encoder de este tipo). Los task heads (clasificacion, NER, QA, multiple choice) no forman parte del checkpoint preentrenado: si no se cargan desde un fine-tune `hf:`, se inicializan de forma aleatoria y requieren ajuste.

## Capacidades

- Relleno de mascaras (fill-mask): predice el token oculto en una secuencia, con el token `<mask>` como marcador.
- Extraccion de representaciones contextuales del ingles: util como encoder de frases, tokens o pares de secuencias.
- Clasificacion de secuencias: sentimiento, deteccion de spam, clasificacion tematica, entailment, mediante `MPNetSequenceClassify` y fine-tuning.
- Clasificacion de tokens: reconocimiento de entidades nombradas (NER) y etiquetado morfosintactico (POS) mediante `MPNetTokenClassify`.
- Question answering extractivo: localizacion de la respuesta dentro de un contexto con `MPNetQnA`.
- Multiple choice: seleccion de la opcion correcta entre varias con `MPNetMultipleChoice`.
- Compatibilidad multi-backend real: el mismo codigo se ejecuta sobre TensorFlow, PyTorch o JAX cambiando `KERAS_BACKEND` antes de importar.
- Carga de pesos externos: los safetensors de `microsoft/mpnet-base` y de fine-tunes de la comunidad funcionan a traves del prefijo `hf:`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generacion de texto libre, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Busqueda semantica y recuperacion de documentos: el encoder genera embeddings contextuales en ingles que se indexan en una base vectorial; es adecuado porque MPNet esta optimizado para comprension bidireccional y no requiere cabecera generativa.
- Clasificacion de tickets de soporte: se ajusta `MPNetSequenceClassify` sobre el corpus interno para asignar categoria y prioridad; el modelo base de 12 capas es lo bastante pequeno para reentrenar en una sola GPU.
- Reconocimiento de entidades nombradas en textos legales o financieros: se entrena `MPNetTokenClassify` con etiquetas BIO para extraer personas, organizaciones, importes y fechas.
- Question answering extractivo sobre documentacion tecnica: con `MPNetQnA` se localiza el fragmento exacto que responde a una consulta, evitando el riesgo de invencion propio de los modelos generativos.
- Reranking de resultados de busqueda: se puntua cada par (consulta, documento) con el encoder y se reordena la lista recuperada por un buscador lexico previo, mejorando la precision del top-k.
- Moderacion de contenido y deteccion de toxicidad: clasificacion binaria o multietiqueta ajustada sobre el encoder, con inferencia rapida al no requerir decodificacion autorregresiva.
- Deduplicacion y agrupacion de textos: extraccion de embeddings para similitud coseno y clustering de articulos, incidencias o resenas duplicadas.
- Baseline academico reproducible: la implementacion Keras 3 permite comparar el mismo modelo en TensorFlow, JAX y PyTorch con identico resultado numerico, util para experimentos de eficiencia de backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `zeromodels/mpnet_base` no incluye metricas de GLUE, SQuAD ni de ninguna otra tarea, y los resultados de busqueda web proporcionados no aportan datos de evaluacion. El paper original (arXiv:2004.09297) reporta resultados en tareas de comprension del lenguaje, pero sus cifras no forman parte de la informacion suministrada y no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia orientativa derivada de la arquitectura (12 capas, 768 dimensiones, encoder de tipo base), la inferencia en fp32 requeriria del orden de 0,5 GB de pesos y en fp16 alrededor de 0,25 GB, mas el overhead de activaciones y del runtime; estas cifras son estimaciones, no datos publicados por el autor.
- GPU recomendadas: el modelo cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); no requiere A100 ni H100 salvo para entrenamiento a gran escala.
- Cabe en GPU consumer: si, con margen amplio, incluso en GPUs con 6-8 GB de VRAM.
- Cabe en CPU: si, es viable para inferencia en CPU, especialmente en tareas de clasificacion o extraccion de embeddings por lotes.
- Opciones de despliegue: la libreria `zeromodels` con Keras 3 (TensorFlow, PyTorch o JAX); los pesos upstream son compatibles con el ecosistema Hugging Face (`transformers`) mediante el prefijo `hf:` o cargando `microsoft/mpnet-base` directamente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que son runners orientados a modelos generativos y este es un encoder.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de esta tabla son valores de referencia publicos de cada familia y no proceden de la informacion proporcionada en esta busqueda; se incluyen unicamente como contexto cualitativo.

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| zeromodels/mpnet_base | no disponible (12 capas / 768 dim) | no disponible | en | MIT | Pesos Keras 3 (zeromodels); safetensors via `hf:` |
| microsoft/mpnet-base | mismo checkpoint original | no disponible en la informacion proporcionada | en | MIT | safetensors en Hugging Face |
| bert-base-uncased | ~110 M (referencia publica) | 512 (referencia publica) | en | Apache 2.0 | safetensors / PyTorch |
| roberta-base | ~125 M (referencia publica) | 512 (referencia publica) | en | MIT | safetensors / PyTorch |
| distilbert-base-uncased | ~66 M (referencia publica) | 512 (referencia publica) | en | Apache 2.0 | safetensors / PyTorch |

La diferencia clave de `zeromodels/mpnet_base` no es el rendimiento, sino el runtime: es la variante de MPNet pensada para ejecutarse en Keras 3 sobre tres backends distintos, mientras que las alternativas se distribuyen principalmente para PyTorch a traves de `transformers`.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas conversacionales; un uso inadecuado como chatbot dara resultados pobres.
- Solo soporta ingles; no se documenta entrenamiento ni evaluacion en otros idiomas, por lo que su uso en castellano no esta respaldado.
- Los task heads (clasificacion, NER, QA, multiple choice) no vienen entrenados en este checkpoint: si no se cargan desde un fine-tune `hf:`, se inicializan aleatoriamente y hay que ajustarlos.
- El tokenizador debe coincidir con el vocabulario WordPiece del modelo; se recomienda usar `MPNetTokenizer.from_weights(...)` y el token `<mask>` en lugar de `[MASK]`.
- El modelo no acepta `token_type_ids`; pasar esa entrada provocara errores o comportamientos inesperados.
- `KERAS_BACKEND` debe fijarse antes de importar Keras o `zeromodels`; cambiarlo despues no tiene efecto.
- Riesgo de alucinacion: en la tarea de fill-mask el modelo puede producir tokens gramaticalmente plausibles pero factualmente incorrectos, ya que no tiene mecanismo de verificacion.
- Sesgos: al derivar de un corpus web en ingles, hereda los sesgos de genero, raza y profesion presentes en dichos datos; no se documenta ninguna mitigacion en la informacion disponible.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero el usuario asume la responsabilidad sobre los pesos derivados y los fine-tunes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni informes independientes de calidad.
- La fecha de creacion registrada (2026-09-20) es posterior al momento habitual de publicacion de este tipo de conversiones; conviene verificar la version concreta de los pesos antes de usarlos en produccion.
- El repositorio ocupa 1.1 GB, un tamano elevado para un encoder de esta categoria, presumiblemente por incluir los pesos en varios formatos; hay que comprobar el espacio disponible antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/mpnet_base
- Modelo upstream: https://huggingface.co/microsoft/mpnet-base
- Paper original: https://arxiv.org/abs/2004.09297
- Paper en Hugging Face: https://huggingface.co/papers/2004.09297
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de MPNet en ZeroModels: https://imvision12.github.io/ZeroModels/mpnet/
- Documentacion de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Coleccion de versiones de MPNet: https://huggingface.co/collections/zeromodels/mpnet-6ab0702ad43a267bae54ded1
