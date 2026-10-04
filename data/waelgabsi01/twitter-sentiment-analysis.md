# waelGabsi01/twitter-sentiment-analysis

## Resumen

`waelGabsi01/twitter-sentiment-analysis` es un clasificador de texto para analizar la polaridad de publicaciones de Twitter. No es un modelo de lenguaje generativo ni una red neuronal profunda: se trata de un modelo clasico de machine learning construido con scikit-learn y serializado con pickle en dos ficheros, `trained_model.sav` (clasificador) y `vectorizer.sav` (vectorizador de texto). Ambos artefactos son obligatorios para ejecutar cualquier inferencia, ya que el modelo no acepta texto crudo directamente.

El autor, Wael Gabsi, lo describe explicitamente como un proyecto de aprendizaje personal desarrollado siguiendo un tutorial de machine learning, con el objetivo de practicar preprocesado de texto, extraccion de caracteristicas, entrenamiento, evaluacion y serializacion. El repositorio de Hugging Face ocupa 0.0 GB, no declara licencia, no declara idiomas y no incluye resultados de evaluacion.

Su relevancia es por tanto acotada: sirve como ejemplo didactico de pipeline de clasificacion de sentimiento y como linea base trivial para comparar con aproximaciones basadas en transformers. En el momento de redactar esta ficha acumula 0 descargas y 1 like, y su uso en produccion no esta respaldado por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de scikit-learn; el autor no especifica el algoritmo concreto del clasificador ni del vectorizador) |
| Parametros totales | no disponible (no se publican dimensiones del modelo; el repositorio ocupa 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de texto corto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no aplica (no hay pesos de red neuronal que cuantizar) |
| Idiomas soportados | no disponibles (la model card no los declara; el unico ejemplo de uso esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | SAV (pickle de Python): `trained_model.sav` y `vectorizer.sav` |
| Framework | scikit-learn |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por la estructura del repositorio se deduce un pipeline clasico de dos etapas: un vectorizador que transforma el texto en una representacion de caracteristicas dispersas y un clasificador que opera sobre esa representacion. El algoritmo concreto del clasificador (regresion logistica, SVM, naive Bayes, arboles, etc.) y el tipo de vectorizador (bolsa de palabras, TF-IDF, n-gramas) no estan documentados en la informacion disponible.

Tampoco se publican datos sobre el corpus de entrenamiento: numero de ejemplos, procedencia, idioma, esquema de etiquetado, balance de clases ni hiperparametros. No hay indicios de tecnicas de alineacion tipo RLHF o DPO, que no aplican a este tipo de modelo. Tampoco se documenta ninguna innovacion tecnica. El autor indica que el modelo se creo siguiendo e implementando un tutorial practico de machine learning.

## Capacidades

- Clasificacion de sentimiento de textos cortos, presumiblemente en categorias de polaridad. El numero y nombre exacto de las clases no esta documentado.
- Inferencia por lotes: la API `predict()` de scikit-learn acepta una lista de textos y devuelve un array de predicciones.
- Integracion sencilla en scripts de Python mediante `pickle.load()` de los dos ficheros `.sav`.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No hay capacidades multilingues declaradas.
- No hay modo thinking, vision ni audio.
- En el ejemplo de la model card solo se muestra `predict()`; no se documenta el uso de `predict_proba()` ni la calibracion de probabilidades.

## Casos de uso

- Linea base de comparacion en experimentos: sirve para medir cuanto mejora un transformer de sentimiento frente a un clasificador clasico sobre el mismo conjunto de prueba.
- Material didactico en cursos de introduccion al machine learning: el flujo vectorizador + clasificador + serializacion es un ejemplo directo de pipeline completo y reproducible.
- Etiquetado previo (pre-labeling) de un corpus de tuits: se puede usar para generar etiquetas iniciales que despues un anotador humano revise, reduciendo el coste del etiquetado manual.
- Prototipo de panel de escucha social: clasificacion rapida de menciones o hashtags en un cuadro de mando interno, asumiendo que la precision no esta validada y que los resultados deben presentarse como indicativos.
- Servicio de demostracion en una API minima: cargar los dos ficheros `.sav` en un endpoint de FastAPI o Flask y devolver la polaridad de un texto corto, sin coste de GPU.
- Filtrado de ruido en un pipeline de datos: descartar de forma aproximada comentarios claramente negativos o positivos antes de un analisis mas costoso, siempre con validacion posterior.
- Practica de integracion de modelos: ejercicios de serializacion, versionado de artefactos y despliegue en CI/CD con un modelo cuyo peso es practicamente nulo.
- Pruebas de carga de infraestructura: al ejecutarse en CPU y con requisitos minimos, permite validar el resto del sistema (red, colas, monitorizacion) sin consumir recursos de acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, F1, matriz de confusion ni tamano del conjunto de evaluacion, y el repositorio no aporta ningun informe de evaluacion.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: es un modelo de scikit-learn, no requiere GPU.
- VRAM estimada: 0 GB, no aplica.
- Memoria RAM: no disponible con precision; con un repositorio de 0.0 GB y un modelo serializado con pickle, la huella esperable es de decenas o pocos cientos de megas, pero el dato no esta publicado.
- GPU recomendadas: ninguna. Funciona igual en cualquier CPU x86 o ARM moderna.
- Aptitud para GPU de consumo: no aplica; no hay ruta de ejecucion en GPU documentada.
- Opciones de despliegue: carga directa con `pickle` en un script de Python, servicio propio con FastAPI o Flask, o integracion en un job por lotes. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de pesos tipo transformer.
- Latencia y throughput: no disponibles. Al ser un clasificador clasico sobre caracteristicas dispersas, la latencia por lote suele ser de orden inferior al milisegundo, pero no hay mediciones publicadas que lo respalden.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| waelGabsi01/twitter-sentiment-analysis | Clasico (scikit-learn) + vectorizador | no disponible | no aplica | no disponible | Hugging Face, 0 descargas | no publicados |
| cardiffnlp/twitter-roberta-base-sentiment | Transformer (RoBERTa base ajustado) | del orden de 125 M (no verificado en la busqueda) | 512 tokens (no verificado en la busqueda) | no verificada en la informacion disponible | Hugging Face, ampliamente utilizado | no verificado en la informacion disponible |
| Proyectos LSTM bidireccional (por ejemplo, repositorios de GitHub citados) | RNN con embeddings preentrenados | no disponible | no disponible | no disponible | GitHub | no disponibles |

La busqueda web confirma que existen alternativas mas consolidadas para esta tarea, en particular `cardiffnlp/twitter-roberta-base-sentiment` y varios proyectos con LSTM bidireccional. No se dispone de datos comparativos de rendimiento entre este modelo y dichas alternativas.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no debe considerarse un sistema de analisis de sentimiento de calidad de produccion sin validacion y pruebas adicionales.
- Sesgos conocidos: no disponibles. Al no documentarse el corpus de entrenamiento, no es posible analizar el balance de clases, la representacion de dialectos ni los sesgos demograficos o geograficos.
- Riesgo de error alto en lenguaje de redes sociales: la model card menciona explicitamente argot, abreviaturas, sarcasmo, variantes ortograficas y dependencia del contexto.
- El modelo no dispone de ventana de contexto ni de mecanismos de atencion; previsiblemente pierde orden de palabras, negaciones complejas e ironia.
- No hay idiomas declarados. El unico ejemplo facilitado esta en ingles, por lo que el comportamiento en castellano es desconocido y no deberia asumirse.
- Licencia no disponible: sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Conviene contactar con el autor antes de cualquier uso fuera del ambito personal o educativo.
- Riesgo de seguridad: el modelo se distribuye como ficheros pickle (`.sav`). Deserializar pickle de origen no confiable puede ejecutar codigo arbitrario. Es un vector de ataque conocido y debe tenerse en cuenta en cualquier pipeline.
- Ausencia total de evaluacion publicada: no hay forma de estimar la exactitud, la calibracion ni el comportamiento en dominios distintos del corpus de entrenamiento.
- El repositorio indica un tamano de 0.0 GB, por lo que conviene verificar que los ficheros `trained_model.sav` y `vectorizer.sav` estan efectivamente presentes y son cargables antes de integrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/waelGabsi01/twitter-sentiment-analysis
- Perfil de GitHub del autor: https://github.com/GABSIWAEL
- Alternativa basada en RoBERTa para sentimiento en Twitter: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment
- Proyecto de sentimiento en Twitter con machine learning y NLP: https://github.com/tahermadraswala/Twitter-Sentiment-Analysis
- Proyecto de sentimiento en Twitter con LSTM bidireccional: https://github.com/amancore/Twitter-Sentiment-Analysis
- Guia de analisis de sentimiento en X, parte 1 (recogida de datos): https://supertype.ai/notes/twitter-sentiment-analysis-part-1
- Cuaderno de laboratorio sobre analisis de sentimiento en Twitter: https://www.kaggle.com/code/totaramsarangani/ml-lab-7-task-b-twitter-sentiment-analysis
