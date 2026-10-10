# thealper2/berturk-punctuation-restoration

## Resumen

berturk-punctuation-restoration es un modelo de clasificacion de tokens que restaura la puntuacion y el uso de mayusculas en texto turco. Lo publica el usuario thealper2 en HuggingFace y parte de dbmdz/bert-base-turkish-cased (BERTurk base cased), al que se anade una cabeza de clasificacion de tokens entrenada especificamente para esta tarea. El modelo no reutiliza ningun checkpoint previo de puntuacion: solo los pesos del encoder preentrenado y su tokenizador original.

El problema que resuelve es habitual en transcripcion automatica de voz (ASR), subtitulado, OCR y texto procedente de chats: secuencias de palabras en minusculas y sin signos de puntuacion. El modelo recibe palabras separadas por espacios, en minusculas turcas y sin `,.;:!?`, y devuelve cada palabra con su capitalizacion correcta y el signo que la sigue, sin insertar, borrar, reordenar ni reescribir palabras.

Tecnicamente es un encoder transformer bidireccional de tipo BERT con 110.032.904 parametros, 8 etiquetas de salida en formato `CASE|PUNCT` y una ventana de 64 tokens de subword durante el entrenamiento, ampliable a entradas largas mediante ventanas de palabras solapadas. Su licencia MIT y su tamano reducido (repo de 0,4 GB) lo hacen desplegable en cualquier GPU de consumo e incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT base con cabeza de clasificacion de tokens |
| Parametros totales | 110.032.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de subword por ventana; entradas mayores se dividen en ventanas de palabras con 12 palabras de solapamiento |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors FP32/BF16 es convertible a int8 dinamico o ONNX) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification |
| Etiquetas | 8: LOWER\|O, CAP\|O, UPPER\|O, LOWER\|COMMA, CAP\|COMMA, LOWER\|PERIOD, LOWER\|QUESTION, LOWER\|EXCLAMATION |
| Modelo base | dbmdz/bert-base-turkish-cased |
| Dataset de entrenamiento | GoktugD/turkish-punctuation-restoration-500k (rev. fcbb30d342b511fdd8bf1f09bbfef990443752fa) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar (encoder transformer bidireccional, configuracion estandar de BERT-base) inicializado desde dbmdz/bert-base-turkish-cased, con un tokenizador WordPiece y una cabeza de clasificacion por token. La formulacion de la tarea es a nivel de palabra: la etiqueta se predice sobre el ultimo subword de cada palabra, mientras que el resto de subwords y los tokens especiales `[CLS]`, `[SEP]` y `[PAD]` usan indice de ignorado -100. Cada etiqueta combina capitalizacion y signo de puntuacion en un unico identificador `CASE|PUNCT`, de modo que el modelo nunca modifica el lexico: solo la capitalizacion (con tratamiento correcto de la i/ı turca) y el signo final. Las entradas de mas de 64 subwords se dividen en ventanas solapadas de palabras (12 palabras de solapamiento) y cada palabra toma la prediccion de la ventana en la que dispone de mas contexto.

El entrenamiento se realizo sobre el dataset sintetico y basado en plantillas GoktugD/turkish-punctuation-restoration-500k, con 490.000 filas de entrenamiento, 5.000 de validacion y 5.000 de test, usando los splits oficiales. El preprocesado aplica NFC, elimina el caracter espurio U+0307 generado por `str.lower('İ')` sin soporte de locale en las fuentes del dataset, y reconstruye las entradas desde los targets con minusculizacion turca (`I→ı`, `İ→i`), verificando palabra por palabra la alineacion con las fuentes (0 errores). Los conjuntos de validacion y test usan plantillas de primera frase y entidades disjuntas respecto a entrenamiento, pero la segunda frase de cada fila proviene de 8 plantillas compartidas entre splits, y QUESTION y EXCLAMATION solo aparecen ahi. Los hiperparametros son 3 epocas, learning rate 2e-05 con decaimiento lineal y warmup ratio 0,1, batch de 64 sin acumulacion, longitud maxima de 64, weight decay 0,01, max grad norm 1,0, entropia cruzada como perdida, precision bf16, semilla 42 y seleccion del mejor modelo por `punct_macro_f1` de validacion. El entrenamiento completo duro 0:28:33 y consumio un pico de 2,62 GB de VRAM en una NVIDIA GeForce RTX 5060 Ti, con torch 2.11.0+cu128, transformers 5.19.0 y datasets 4.3.0. No se menciona RLHF ni DPO: es un ajuste supervisado puro.

## Capacidades

- Restauracion de puntuacion en turco: introduce coma, punto, interrogacion y exclamacion al final de cada palabra cuando corresponde.
- Truecasing: decide entre mantener minusculas, capitalizar la primera letra (consciente de la i/ı turca) o poner la palabra entera en mayusculas.
- Salida a nivel de palabra con preservacion estricta del texto original: no inserta, elimina, reordena ni reescribe palabras.
- Procesamiento de entradas largas mediante ventanas de palabras solapadas (12 palabras de solapamiento), sin limite practico documentado mas alla del coste.
- Integracion estandar en transformers mediante `AutoModelForTokenClassification` y `AutoTokenizer`.
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible` en HuggingFace).
- Capacidades multilingues: no, solo turco.
- Tool calling / function calling: no, es un modelo de clasificacion de tokens, no generativo.
- Modo de razonamiento o agente multi-paso: no disponible.
- Vision, audio, matematica o generacion de codigo: no disponibles; el modelo no genera texto libre.
- Etiquetas adicionales COLON y SEMICOLON aparecen en el diccionario `PUNCT` del ejemplo de uso de la model card, pero no forman parte de las 8 clases entrenadas.

## Casos de uso

- Post-procesado de transcripciones ASR en turco: partiendo de una hipotesis en minusculas y sin signos, el modelo devuelve el texto con comas, puntos e interrogaciones, lo que reduce el coste de revision humana en subtitulado y actas de reunion.
- Subtitulado automatico para video: los segmentos de subtitulo se procesan palabra a palabra para insertar puntuacion final y mayusculas iniciales, mejorando la legibilidad sin alterar el contenido.
- Normalizacion de texto OCR: documentos escaneados en turco suelen perder puntuacion y capitalizacion; el modelo las reconstruye manteniendo exactamente las palabras reconocidas.
- Preprocesado para pipelines de NLP posteriores: dividir en frases un texto sin puntuacion requiere limites oracionales que este modelo puede aportar antes de pasar a un analizador morfologico, un traductor o un sistema de recuperacion.
- Limpieza de registros de chat y correo: mensajes escritos sin mayusculas ni signos se normalizan antes de almacenarse o indexarse, lo que mejora la calidad de busquedas y resumenes posteriores.
- Capa de anonimizado o redaccion de datos: al recuperar los limites de frase, es mas sencillo aplicar reglas de censura o extraccion de entidades por oracion en corpus turcos.
- Generacion de datasets de texto bien formado en turco: el modelo sirve como etiquetador automatico para crear corpus con puntuacion a partir de fuentes sin normalizar.
- Inferencia en el borde o en CPU: con 110 millones de parametros puede ejecutarse en un servidor modesto o en local para herramientas de escritorio de correccion ortografica y de estilo en turco.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (metrica F1 a nivel de palabra, `verified: false` no verificado por un tercero) sobre el split de test de GoktugD/turkish-punctuation-restoration-500k, revision fcbb30d342b511fdd8bf1f09bbfef990443752fa.

| Metrica | Validacion | Test | Validacion (entrada larga) | Test (entrada larga) |
|---|---:|---:|---:|---:|
| Punctuation macro F1 (excl. O) | 1,0000 | 0,9987 | 0,9210 | 0,9710 |
| Punctuation macro F1 (incl. O) | 1,0000 | 0,9989 | 0,9352 | 0,9755 |
| Punctuation weighted F1 | 1,0000 | 0,9992 | 0,9855 | 0,9886 |
| O F1 | 1,0000 | 0,9995 | 0,9922 | 0,9936 |
| Casing macro F1 | 0,9962 | 0,9716 | 0,9736 | 0,9712 |
| Joint label macro F1 | 0,9981 | 0,9856 | 0,9473 | 0,9721 |
| Sentence exact match | 0,9298 | 0,5000 | 0,0000 | 0,0000 |

Rendimiento por clase de puntuacion en test:

| Clase | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| O | 0,9991 | 1,0000 | 0,9995 | 96375 |
| COMMA | 0,9999 | 0,9898 | 0,9948 | 8750 |
| PERIOD | 1,0000 | 1,0000 | 1,0000 | 7500 |
| QUESTION | 1,0000 | 1,0000 | 1,0000 | 1250 |
| EXCLAMATION | 1,0000 | 1,0000 | 1,0000 | 1250 |

Matriz de confusion en test (filas = gold): la unica confusion relevante son 89 comas reales predichas como O y 1 O predicho como coma; el resto de celdas son cero. Desglose por posicion en test: primera frase (plantillas especificas del split) 87.000 palabras con punct macro F1 de 0,9955 (O 0,9994; COMMA 0,9909; PERIOD 1,0000), y frases posteriores (plantillas compartidas) 28.125 palabras con 1,0000 en todas las clases. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de restauracion de puntuacion.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,45 GB en FP32, 0,25 GB en FP16/BF16 y 0,15 GB en int8, solo para los pesos; con activaciones y overhead conviene reservar entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; el autor entreno el modelo en una NVIDIA GeForce RTX 5060 Ti con un pico de 2,62 GB.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050 Ti 4 GB, GTX 1650, RTX 3060, RTX 4090, etc.), y tambien en CPU para lotes pequenos.
- Opciones de despliegue: transformers con `AutoModelForTokenClassification`, pipeline de HuggingFace, Hugging Face Inference Endpoints (el repo esta marcado como `endpoints_compatible`), exportacion a ONNX Runtime para inferencia en CPU, y servidores de clasificacion de tokens compatibles (por ejemplo vLLM en su modo de modelos de clasificacion). llama.cpp y Ollama no estan documentados para esta tarea con el repositorio tal cual.
- Latencia y throughput: no disponibles como medicion de inferencia. Como referencia derivada del entrenamiento, 1.470.000 filas en 1.713 segundos equivalen a unas 858 filas por segundo en entrenamiento con batch 64 y secuencia 64 en una RTX 5060 Ti; la inferencia es sustancialmente mas rapida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Puntuacion / truecasing | Disponibilidad |
|---|---|---|---|---|---|---|
| thealper2/berturk-punctuation-restoration | 110.032.904 | 64 tokens por ventana, ventanas solapadas | Turco | MIT | Si (8 etiquetas, sin dos puntos ni punto y coma) | HuggingFace, safetensors |
| dbmdz/bert-base-turkish-cased (modelo base) | 110.032.904 aprox. | 512 tokens (BERT estandar) | Turco | MIT | No, es un encoder preentrenado sin cabeza de puntuacion | HuggingFace |
| Modelos de restauracion de puntuacion multilingues basados en XLM-R (por ejemplo oliverguhr/fullstop-punctuation-multilang-large) | no disponible | no disponible | Multilingue, sin turco documentado | no disponible | Si, pero sin cobertura de turco | no disponible |
| Modelos de restauracion de puntuacion en ingles tipo felflare/bert-restore-punctuation | no disponible | no disponible | Ingles | no disponible | Si, solo ingles | no disponible |

No hay en la informacion proporcionada cifras de rendimiento de estos modelos alternativos, por lo que la comparacion se limita a parametros, idioma, licencia y disponibilidad; no es posible comparar F1 entre ellos con los datos disponibles.

## Limitaciones y advertencias

- Dataset sintetico y basado en plantillas: las puntuaciones casi perfectas en test (0,9987 de macro F1 sin O) reflejan en gran medida la distribucion del corpus de entrenamiento, no la variabilidad del turco real.
- Caida fuerte en generalizacion estricta: el exact match de frase baja de 0,9298 en validacion a 0,5000 en test, y los resultados con entradas largas caen a 0,9710 de macro F1 en test (0,9210 en validacion).
- QUESTION y EXCLAMATION solo aparecen en plantillas compartidas entre splits, por lo que su F1 de 1,0000 no demuestra capacidad real de detectar interrogaciones y exclamaciones en texto libre.
- Cobertura de puntuacion incompleta: solo 4 signos (coma, punto, interrogacion, exclamacion); no cubre dos puntos, punto y coma, comillas, guiones ni parentesis, aunque el ejemplo de uso del autor incluya COLON y SEMICOLON en el diccionario interno.
- Sesgo hacia O por desbalance de clases: 96.375 de 105.125 etiquetas de test son O; la practica totalidad de los errores consiste en comas no detectadas (89 casos), con precision de 0,9999 y recall de 0,9898 en COMMA.
- Casing macro F1 de 0,9716 es la metrica mas baja del modelo: la capitalizacion es menos fiable que la puntuacion.
- Limitacion idiomatica severa: solo turco; aplicarlo a otras lenguas producira resultados incorrectos sin reentrenamiento.
- Restriccion estructural: el modelo nunca anade ni elimina palabras, de modo que no puede corregir errores de reconocimiento, ni restaurar estructuras como parrafos o listas.
- Dependencia del preprocesado: la entrada debe entregarse en minusculas turcas (I→ı, İ→i) y sin signos previos, tal como se entreno; un preprocesado distinto degrada la salida.
- Sin verificacion externa: los resultados del model-index estan marcados como `verified: false` y el modelo tiene 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Riesgo de alucinacion de puntuacion: al ser un clasificador, no inventa contenido lexico, pero puede insertar un signo incorrecto y alterar el sentido de una frase.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones, con la unica obligacion habitual de conservar el aviso de copyright; conviene verificar tambien las condiciones del modelo base y del dataset de entrenamiento antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/berturk-punctuation-restoration
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/GoktugD/turkish-punctuation-restoration-500k
- Revision del dataset usada: fcbb30d342b511fdd8bf1f09bbfef990443752fa
- No se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
