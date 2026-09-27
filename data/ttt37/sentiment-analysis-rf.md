# Ttt37/sentiment-analysis-rf

## Resumen

Sentiment-analysis-rf (Ttt37/sentiment-analysis-rf) es un clasificador de sentimiento en ingles publicado en HuggingFace por el usuario Ttt37. No es un modelo de lenguaje neuronal: se trata de un pipeline clasico de aprendizaje automatico compuesto por un `RandomForestClassifier` de scikit-learn sobre una representacion Bag of Words, con preprocesado de texto basado en expresiones regulares, eliminacion de stopwords y lematizacion con NLTK (`WordNetLemmatizer`). El repositorio, de 0,1 GB, contiene dos artefactos serializados con joblib: `sentiment_model.pkl` (el bosque) y `vectorizer.pkl` (el vectorizador).

El modelo resuelve una tarea acotada de clasificacion de texto de una sola etiqueta: dado un texto en ingles, predice una categoria de sentimiento o emocion. No genera texto, no razona y no mantiene contexto conversacional, por lo que su utilidad practica se limita al etiquetado por lotes y a servir de linea base ligera en proyectos de PLN.

Su relevancia actual es limitada pero concreta: al ejecutarse exclusivamente en CPU, sin dependencias de GPU y con un consumo de memoria reducido, encaja en escenarios de bajo coste, entornos sin acelerador o despliegues en el borde. Como contrapartida, la model card no documenta el corpus de entrenamiento, el numero de clases, las metricas de evaluacion ni la licencia, y el repositorio acumula 0 descargas y 0 likes, por lo que debe considerarse un artefacto sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (conjunto de arboles de decision) sobre representacion Bag of Words, con preprocesado NLTK |
| Parametros totales | no disponible (no se especifica numero de arboles, profundidad ni criterio de division) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no existe ventana de contexto. La entrada se vectoriza a Bag of Words y queda limitada al vocabulario aprendido por el vectorizador |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales que cuantizar; los artefactos se serializan con joblib/pickle) |
| Idiomas soportados | ingles (tag `en`) |
| Licencia | no disponible |
| Formato de pesos | pickle de joblib: `sentiment_model.pkl` y `vectorizer.pkl` |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

El pipeline declarado en la model card es secuencial. Primero se normaliza el texto: se elimina todo caracter que no sea alfabetico mediante `re.sub('[^a-zA-Z]', ' ', text)`, se pasa a minusculas y se tokeniza por espacios. Despues se descartan las stopwords inglesas de NLTK y se lematiza cada token restante con `WordNetLemmatizer`. El resultado se transforma con un vectorizador Bag of Words (`vectorizer.pkl`) y se alimenta a un `RandomForestClassifier`. La model card no especifica si el vectorizador es un `CountVectorizer` o un `TfidfVectorizer`, ni su tamano de vocabulario, `ngram_range` o umbrales de frecuencia.

No hay informacion sobre el corpus de entrenamiento: se desconoce el numero de documentos, la fuente, la composicion por clases, el numero total de ejemplos, la particion train/test y los hiperparametros del bosque (numero de arboles, `max_depth`, `min_samples_leaf`). Tampoco se documenta ningun proceso de ajuste fino, RLHF o DPO, conceptos que en cualquier caso no aplican a este tipo de modelo. No se describe ninguna innovacion tecnica: es un enfoque clasico de bolsa de palabras que ignora por completo el orden de las palabras y la composicion sintactica.

## Capacidades

- Clasificacion de sentimiento de texto en ingles con una unica etiqueta de salida; el conjunto exacto de clases (binario positivo/negativo, ternario o categorias emocionales multiples) no esta documentado.
- Preprocesado integrado en el flujo de uso: limpieza por regex, minusculas, eliminacion de stopwords y lematizacion WordNet.
- Inferencia determinista y reproducible en CPU, sin necesidad de acelerador hardware.
- Ejecucion con un `predict` directo de scikit-learn sobre la matriz de caracteristicas, apta para lotes grandes.
- No soporta generacion de texto, razonamiento, matematicas, codigo ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles, y el preprocesado descarta cualquier caracter no ASCII alfabetico, lo que degrada el tratamiento de acentos y de texto no ingles.
- No dispone de modo "thinking", ni de salidas de probabilidad documentadas o calibradas (solo se muestra `predict`, no `predict_proba`).

## Casos de uso

- Etiquetado por lotes de resenas en ingles: cargando `sentiment_model.pkl` y `vectorizer.pkl` con joblib, se puede procesar un CSV con miles de opiniones en CPU en una sola pasada, sin coste de GPU. Es el escenario mas directo y con menor riesgo dado el caracter determinista del modelo.
- Linea base de referencia en proyectos de PLN: antes de invertir en un transformer afinado, este clasificador permite obtener un suelo de rendimiento con muy poco codigo y comprobar si la tarea justifica un modelo mayor.
- Triaje previo en pipelines de moderacion o analitica: usar el clasificador como primer filtro barato que descarte el grueso de textos neutros y derive solo los casos dudosos o marcados a un modelo mayor, reduciendo el coste computacional agregado.
- Monitorizacion de opinion en encuestas y redes sociales: analisis offline de comentarios en ingles recogidos en formularios o exportaciones de plataformas, generando agregados de polaridad por periodo o segmento.
- Enrutado de tickets de soporte en ingles: asignar automaticamente un ticket a un departamento segun la polaridad detectada, siempre como senal auxiliar y no como decision unica, dado el riesgo de error en textos con negaciones o sarcasmo.
- Despliegue en entornos sin GPU o aislados (air-gapped): el modelo solo requiere Python, scikit-learn, NLTK y joblib, por lo que puede ejecutarse en contenedores pequenos, dispositivos de borde o maquinas corporativas sin acelerador.
- Docencia y prototipado rapido: sirve como ejemplo completo de pipeline clasico de PLN (preprocesado, vectorizacion, clasificacion) para cursos o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, F1, matriz de confusion, numero de clases ni ningun otro tipo de metrica de evaluacion, y tampoco se documenta el conjunto de validacion empleado.

## Requisitos de hardware

- VRAM: no aplica. El modelo no usa GPU en ninguna fase.
- GPU recomendadas: ninguna; es un modelo de CPU.
- Cabe en cualquier maquina: al tratarse de un `RandomForestClassifier` serializado dentro de un repositorio de 0,1 GB, se puede ejecutar en portatiles y contenedores modestos. No se dispone de medicion oficial de RAM en inferencia; por el tamano del repositorio, el consumo en memoria estaria en el orden de cientos de MB como maximo, pero es una estimacion no verificada.
- Opciones de despliegue: carga con `joblib.load` dentro de un servicio Python (FastAPI, Flask, un script batch) o como paso de un pipeline de scikit-learn. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a transformers, GGUF u otros formatos neuronales.
- Latencia y throughput: no disponibles. No se han publicado mediciones, aunque por la naturaleza del modelo (bolsa de palabras y bosque de arboles) la inferencia es de CPU y no requiere aceleracion especializada.
- Dependencias en tiempo de ejecucion: `scikit-learn`, `joblib`, `nltk` con los corpus `stopwords` y `wordnet` descargados, y `huggingface_hub` para recuperar los artefactos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Ttt37/sentiment-analysis-rf | Random Forest + Bag of Words | no disponible | no aplica | ingles | no disponible | CPU |
| distilbert-base-uncased-finetuned-sst-2-english | Transformer encoder afinado | ≈66 M (cifra publica ampliamente citada, no verificada en la informacion proporcionada) | 512 tokens | ingles | Apache 2.0 (segun su model card publica) | CPU o GPU |
| cardiffnlp/twitter-roberta-base-sentiment-latest | Transformer encoder afinado | no disponible | no disponible | ingles (dominio Twitter) | no disponible | CPU o GPU |
| VADER / TextBlob | Basado en reglas y lexico | no aplica | no aplica | ingles | MIT (VADER) | CPU |

La diferencia principal frente a los transformers de la comparativa es que este modelo no captura orden de palabras ni dependencias de largo alcance, y no ofrece una ventana de contexto. Su ventaja relativa es el coste de inferencia en CPU y la ausencia de requisitos de GPU. Frente a enfoques lexicos como VADER, aporta un modelo supervisado cuyo rendimiento depende enteramente de unos datos de entrenamiento que no estan documentados, mientras que VADER es inspeccionable y no requiere entrenamiento.

## Limitaciones y advertencias

- Seguridad al cargar los artefactos: `joblib.load` sobre ficheros pickle puede ejecutar codigo arbitrario. Cargar `sentiment_model.pkl` y `vectorizer.pkl` de un repositorio de autor unico, sin descargas ni validacion de la comunidad, implica un riesgo real en entornos de produccion. Se recomienda auditar el fichero o repicklearlo en un entorno aislado antes de usarlo.
- Licencia no especificada: sin licencia declarada no hay autorizacion explicita de uso comercial, redistribucion ni modificacion. Cualquier uso en producto deberia consultarse previamente con el autor.
- Ausencia total de evaluacion: no hay metricas, ni matriz de confusion, ni descripcion del conjunto de prueba. No es posible estimar la calidad del clasificador ni compararlo de forma objetiva.
- Corpus de entrenamiento desconocido: al no documentarse los datos, no se puede evaluar el sesgo por dominio, genero, origen o tematica, ni el posible desequilibrio entre clases.
- Limitaciones estructurales del Bag of Words: se pierde el orden de las palabras, no se maneja la negacion ("no es bueno"), la ironia ni el sarcasmo, y las palabras fuera del vocabulario aprendido se ignoran.
- Idiomas: solo ingles. El preprocesado elimina cualquier caracter fuera de `[a-zA-Z]`, lo que destruye acentos, signos diacriticos y alfabetos no latinos, con la consiguiente perdida de informacion en textos no ingleses.
- Riesgo de salida enganosa: el uso de `predict` sin informacion sobre calibracion o `predict_proba` impide conocer el grado de confianza de cada etiqueta; no se debe presentar el resultado como una probabilidad.
- Dependencia de recursos externos: el flujo de uso exige descargar los corpus `stopwords` y `wordnet` de NLTK, lo que requiere conectividad o un empaquetado previo en despliegues aislados.
- Metadatos no verificables: las fechas de creacion y actualizacion registradas (26/09/2026) no se han podido contrastar con fuentes independientes, al igual que el resto de la informacion de la model card.
- Sin mantenimiento conocido: con 0 descargas y 0 likes, no hay evidencia de uso, soporte ni actualizaciones por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ttt37/sentiment-analysis-rf
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo, demos ni articulos tecnicos asociados a este modelo.
