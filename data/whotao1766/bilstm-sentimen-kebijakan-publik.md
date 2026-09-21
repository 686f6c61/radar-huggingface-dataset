# whotao1766/bilstm-sentimen-kebijakan-publik

## Resumen

El modelo `whotao1766/bilstm-sentimen-kebijakan-publik` es un clasificador de sentimiento en indonesio construido con una red Bidirectional LSTM sobre Keras/TensorFlow. Su tarea concreta es etiquetar comentarios públicos sobre una política gubernamental (el programa Kopdes) en tres clases: Negatif, Netral y Positif. Fue publicado por el usuario whotao1766 y, por el momento, acumula 39 descargas y 0 likes, con un tamano de repositorio practicamente nulo (0.0 GB) y licencia no especificada.

Se trata de un modelo entrenado desde cero, sin embeddings preentrenados, sobre un corpus muy reducido de unas 850 opiniones unicas tras el preprocesado. La propia model card lo describe como una linea base de nivel academico o de investigacion, no como un clasificador listo para produccion. La longitud de entrada esta fijada en 100 tokens y el vocabulario cubre las 5000 palabras mas frecuentes mas un token `<OOV>`.

Su relevancia es limitada y muy especifica: sirve como referencia reproducible para quien quiera experimentar con clasificacion de sentimiento en indonesio sobre un dominio concreto (opinion sobre politicas publicas) y comparar despues con aproximaciones basadas en transformers. La etiquetacion automatica mediante lexico y las metricas reportadas lo convierten en un ejercicio metodologico util, pero con un techo de calidad claramente acotado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embedding (128) → Bi-LSTM (64) → Bi-LSTM (32) → Dropout (0.5) → Dense (64, ReLU) → Dense (3, softmax) |
| Parametros totales | No disponible (estimacion a partir de la arquitectura: ~0,78 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 100 tokens (padding y truncado posteriores) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | No disponible |
| Formato de pesos | Keras (`model_bilstm.keras`), mas `tokenizer.json` y `labels.json` |

## Arquitectura y entrenamiento

La red es una pila secuencial de Keras: una capa de embeddings de dimension 128 entrenada desde cero, seguida de dos capas Bidirectional LSTM con 64 y 32 unidades respectivamente (con retorno de secuencias en la primera y salida del ultimo estado en la segunda), una capa de Dropout con tasa 0.5, una capa densa de 64 neuronas con activacion ReLU y una capa de salida densa de 3 neuronas con softmax para las clases Negatif, Netral y Positif. El vocabulario se limita a las 5000 palabras mas frecuentes mas `<OOV>` y las secuencias se rellenan a 100 tokens. El entrenamiento usa optimizador Adam con perdida sparse categorical cross-entropy, tamano de lote 32 y hasta 30 epocas con early stopping sobre la precision de validacion (paciencia 8).

No hay embeddings preentrenados, ni ajuste fino, ni RLHF/DPO: es un entrenamiento supervisado clasico sobre etiquetas generadas de forma automatica. El corpus consta de unas 850 opiniones unicas tras deduplicacion, divididas de forma estratificada en 64 % entrenamiento, 16 % validacion y 20 % test. Las etiquetas no estan anotadas por humanos: se derivaron con el lexico InSet, calculando la puntuacion como (numero de palabras positivas) − (numero de palabras negativas) sobre el texto con stemming, de modo que puntuacion > 0 es Positif, < 0 es Negatif y = 0 es Netral. El preprocesado aplica en orden: eliminacion de URL, menciones, emojis, simbolos y numeros; minusculas; normalizacion de palabras no estandar con `new_kamusalay.csv` (mas la regla `nggak → tidak`); eliminacion de stopwords en indonesio de NLTK conservando las negaciones `tidak`, `bukan`, `belum`, `jangan`, `tanpa`; y stemming con Sastrawi.

## Capacidades

- Clasificacion de texto en tres clases de sentimiento: Negatif, Netral y Positif.
- Analisis de sentimiento sobre comentarios en indonesio relativos a una politica publica concreta.
- Procesamiento de entradas de hasta 100 tokens con un vocabulario de 5000 palabras mas `<OOV>`.
- Salida de probabilidades por clase (softmax), lo que permite umbralizar o filtrar por confianza.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multimodales (vision o audio).
- No dispone de modo de razonamiento explicito (thinking mode).
- Multilingue: no. Unicamente entrenado y documentado para indonesio.

## Casos de uso

- Monitorizacion de opinion sobre el programa Kopdes: el modelo puede etiquetar en lote comentarios ciudadanos recogidos en redes sociales o formularios para obtener una distribucion aproximada de sentimiento, dado que fue entrenado exactamente sobre ese dominio.
- Linea base academica en trabajos de PLN indonesio: sirve como referencia de comparacion frente a modelos basados en transformers, ya que su arquitectura y su pipeline de preprocesado estan documentados y son reproducibles.
- Ensenanza y practica de pipelines de PLN: el cuaderno incluido y el flujo de preprocesado (normalizacion, stopwords con negaciones preservadas, stemming) permiten usarlo como ejemplo didactico completo.
- Filtrado rapido de grandes volumenes de texto: al ser un modelo de menos de un millon de parametros, puede ejecutarse sobre CPU y aplicarse a miles de comentarios para un triaje inicial antes de una revision manual.
- Analisis exploratorio previo a anotacion humana: sus predicciones pueden usarse para muestrear candidatos y disenar despues un conjunto etiquetado manualmente con mejor calidad.
- Deteccion de polaridad agregada en informes periodisticos: para resumir la tonalidad general de la conversacion publica sobre una medida gubernamental, siempre con lectura cautelosa por las limitaciones de las etiquetas de origen.
- Prototipado de APIs de inferencia en Keras: la exportacion en formato `.keras` con `tokenizer.json` y `labels.json` facilita montar un servicio minimo con TensorFlow Serving o un script propio.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test reservado (170 comentarios), tal como reporta la model card del autor:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Negatif | 0.80 | 0.91 | 0.85 | 108 |
| Netral | 0.76 | 0.35 | 0.48 | 37 |
| Positif | 0.58 | 0.72 | 0.64 | 25 |
| Exactitud global | | | 0.76 | 170 |
| Media macro | 0.72 | 0.66 | 0.66 | 170 |

Como referencia, predecir siempre la clase mayoritaria (Negatif) obtendria aproximadamente un 63,5 % de exactitud sobre este mismo test. Es importante subrayar que estas metricas miden la capacidad del modelo de reproducir la regla del lexico InSet, no su acuerdo con el juicio humano del sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable (inferior a 1 GB), dado el tamano del modelo (menos de un millon de parametros y embedding de 5000 × 128).
- GPU recomendadas: ninguna en particular; funciona sin problemas en CPU. Cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) lo ejecuta sobradamente.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: el propio runtime de TensorFlow/Keras, TensorFlow Serving o una API ligera en Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, la latencia por lote pequeno en CPU deberia ser de milisegundos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Cualitativamente, el modelo se situa en la categoria de clasificadores de sentimiento en indonesio, donde las alternativas mas habituales son los transformers preentrenados en indonesio (por ejemplo, la familia IndoBERT) y los clasificadores basados en lexico como el propio InSet. Frente a ellos:

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| bilstm-sentimen-kebijakan-publik | Bi-LSTM desde cero | ~0,78 M (estimado) | 100 tokens | No disponible | Exactitud 0,76 en su test (170 comentarios) |
| IndoBERT y derivados | Transformer preentrenado | No disponible en la informacion | No disponible | No disponible | No disponible |
| Clasificador por lexico InSet | Regla basada en conteo | No aplica | No aplica | No disponible | Es el generador de las etiquetas del propio modelo |

Cualquier conclusion sobre que opcion rinde mejor exigiria una evaluacion sobre un test anotado por humanos, que no se ha publicado para este modelo.

## Limitaciones y advertencias

- Las etiquetas proceden de un conteo de palabras con lexico, por lo que el modelo hereda los puntos ciegos de esa regla: ironia, frases de varias palabras y negacion se manejan mal (por ejemplo, "tidak bagus" no tiene garantia de etiquetarse como negativo).
- El conjunto de datos es pequeno y esta desequilibrado, con Negatif como clase dominante. El recall de Netral es bajo (0.35).
- El diccionario de normalizacion no reconoce terminos ni abreviaturas recientes, que pasan sin transformar.
- Entrenado sobre comentarios de una unica politica concreta; su rendimiento en otros temas o plataformas no esta probado.
- Las predicciones no deben usarse para tomar decisiones sobre personas.
- Sesgos conocidos: no se documentan analisis de sesgo especificos; el desequilibrio de clases y el origen lexico de las etiquetas son fuentes evidentes de sesgo hacia la clase Negatif.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo solo produce una distribucion sobre tres clases.
- Limitaciones de contexto e idioma: ventana fija de 100 tokens y uso exclusivo en indonesio.
- Restricciones de licencia: la licencia no esta indicada en la informacion disponible, por lo que no puede confirmarse su aptitud para uso comercial; conviene contactar con el autor antes de integrarlo en productos.
- Caveat de produccion: el propio autor lo etiqueta como linea base de nivel academico, no apto como clasificador de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whotao1766/bilstm-sentimen-kebijakan-publik
- Lexico InSet (generador de las etiquetas): https://github.com/fajri91/InSet
- Diccionario de normalizacion `new_kamusalay.csv`: https://github.com/okkyibrohim/id-multi-label-hate-speech-and-abusive-language-detection
- NLTK (stopwords): https://www.nltk.org/
- Sastrawi (stemmer en indonesio): https://github.com/sastrawi/sastrawi
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a un sitio de compra de alimentacion sin relacion con el contenido.
