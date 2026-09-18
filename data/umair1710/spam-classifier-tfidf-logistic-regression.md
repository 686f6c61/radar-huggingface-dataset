# Umair1710/spam-classifier-tfidf-logistic-regression

## Resumen

Umair1710/spam-classifier-tfidf-logistic-regression es un pipeline de clasificacion binaria de texto publicado en HuggingFace por el usuario Umair1710. No es un modelo de lenguaje neuronal, sino una solucion clasica de machine learning construida con scikit-learn que etiqueta mensajes SMS como *Ham* (legitimo) o *Spam*. El pipeline combina una vectorizacion TF-IDF de 3.000 caracteristicas (unigramas y bigramas) con cuatro caracteristicas estructurales de dominio (presencia de URL, recuento de simbolos de divisa, de signos de exclamacion y de caracteres en mayuscula), apiladas mediante `scipy.sparse.hstack`.

El problema central que aborda es el desequilibrio severo de clases: aproximadamente el 87 % de los mensajes del conjunto de datos son Ham, por lo que un clasificador ingenuo puede alcanzar una exactitud alta sin detectar spam. Para mitigarlo, el autor compara tres estrategias (Naive Bayes multinomial como linea base, regresion logistica con pesos de clase y regresion logistica con sobremuestreo SMOTE) y selecciona la ultima por ofrecer el mejor equilibrio entre precision y exhaustividad en la clase minoritaria.

Su relevancia es practica y de referencia: sirve como linea base reproducible, ligera y ejecutable en CPU para tareas de filtrado de spam y *smishing*, y como punto de comparacion frente a enfoques basados en transformers. El repositorio tiene 0 descargas y 0 "likes", un tamano declarado de 0,0 GB y licencia MIT, lo que permite uso comercial sin restricciones, aunque sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline clasico de scikit-learn: TF-IDF (unigramas y bigramas) combinado con caracteristicas estructurales densas y clasificador de regresion logistica |
| Parametros totales | 3.005 coeficientes derivados de la propia descripcion (3.000 caracteristicas TF-IDF + 4 estructurales + 1 intercepto); el autor no publica el recuento exacto |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica; representacion bag-of-words sin ventana de contexto, cada mensaje se vectoriza de forma independiente |
| Tipos de cuantizacion | no aplica (no hay pesos de red neuronal; los coeficientes se serializan en coma flotante dentro del bundle joblib) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | .pkl (bundle joblib que contiene el vectorizador y el modelo) |

## Arquitectura y entrenamiento

El pipeline sigue cuatro etapas encadenadas. Primero, un preprocesado de texto que pasa a minusculas, elimina puntuacion y filtra palabras vacias (*stop words*). Segundo, una vectorizacion TF-IDF limitada a 3.000 caracteristicas que cubre unigramas y bigramas. Tercero, la extraccion de cuatro caracteristicas estructurales calculadas sobre el texto original: `has_URL`, `Currency_Count`, `Exclamation_Count` y `Uppercase_Count`. Cuarto, la concatenacion de la matriz dispersa TF-IDF con la matriz densa de caracteristicas estructurales mediante `scipy.sparse.hstack`, y la clasificacion final con regresion logistica entrenada sobre datos remuestreados con SMOTE.

El protocolo de validacion usa una particion 80/20 con estratificacion para preservar las proporciones de clase, y el autor declara haber verificado explicitamente que no existe solapamiento de mensajes duplicados entre entrenamiento y prueba (control de fuga de datos). SMOTE se aplica exclusivamente sobre la particion de entrenamiento (`x_train_final`) para evitar contaminar la evaluacion. No se documentan tecnicas de calibracion de probabilidades, busqueda de hiperparametros ni validacion cruzada k-fold: la seleccion del modelo se basa en una unica particion de prueba, lo que limita la robustez estadistica de las cifras reportadas.

## Capacidades

- Clasificacion binaria de texto corto en dos clases: Spam y Ham.
- Salida de probabilidad asociada a la prediccion mediante `predict_proba`, utilizable como umbral configurable.
- Ingenieria de caracteristicas de dominio (URL, divisas, exclamaciones, mayusculas) que aporta senales no capturadas por el vocabulario TF-IDF.
- Inferencia en CPU con coste computacional minimo y sin dependencia de GPU.
- Manejo de desequilibrio de clases en entrenamiento mediante sobremuestreo sintetico SMOTE.
- Serializacion del pipeline completo (vectorizador y modelo) en un unico archivo joblib, lo que simplifica el despliegue.

No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, *tool calling*, soporte de agentes, modo de pensamiento ni capacidades multilingues. Tampoco mantiene estado conversacional entre mensajes.

## Casos de uso

- Filtrado de SMS en pasarelas de mensajeria: el modelo puede clasificar cada mensaje entrante antes de entregarlo al usuario, con un coste de CPU minimo que permite procesar flujos de alto volumen en una sola maquina.
- Deteccion de *smishing* en operadores de telefonia: las caracteristicas estructurales (URL, simbolos de divisa, mayusculas) capturan patrones tipicos de campanas fraudulentas que envian enlaces a paginas de *phishing*.
- Prefiltro en pipelines de moderacion de correo: dado que se entrena sobre SMS, puede actuar como primera etapa de triaje barata antes de modelos mas costosos, siempre que se valide su comportamiento en el dominio de correo electronico.
- Etiquetado asistido de datos para entrenamiento: util para preanotar grandes volumenes de mensajes y reducir el coste de anotacion humana antes de entrenar un transformer especifico.
- Sistema de alertas antifraude en tiempo real: al exponer probabilidades, permite fijar umbrales distintos segun la tolerancia a falsos positivos del flujo de negocio.
- Linea base reproducible en investigacion y docencia: su tamano reducido y su licencia MIT permiten replicar el experimento completo y comparar tecnicas de desequilibrio de clases (SMOTE frente a pesos de clase frente a Naive Bayes).
- Microservicio ligero con FastAPI o Flask: el bundle joblib se carga en memoria en milisegundos y no requiere infraestructura de aceleracion.
- Analisis retrospectivo de campanas de spam: procesamiento por lotes de historicos de mensajes para caracterizar la evolucion temporal de los patrones detectados.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. El conjunto de prueba presenta aproximadamente un 87 % de mensajes Ham, por lo que la exactitud global esta dominada por la clase mayoritaria y las metricas de la clase Spam son el indicador relevante.

| Estrategia / modelo | Exactitud global | Precision (Spam) | Exhaustividad (Spam) | F1 (Spam) |
|---|---|---|---|---|
| Linea base (Naive Bayes multinomial) | 0,9836 | 0,9859 | 0,9014 | 0,9417 |
| Regresion logistica con pesos de clase | 0,9816 | 0,8910 | 0,9789 | 0,9329 |
| Regresion logistica con SMOTE | 0,9855 | 0,9324 | 0,9592 | 0,9456 |

No se han publicado en la informacion disponible benchmarks frente a modelos externos (transformers ajustados, otras arquitecturas) ni resultados sobre conjuntos de datos distintos del empleado en el entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: ninguna. El pipeline se ejecuta integramente en CPU.
- GPU recomendadas: no aplica; no se requiere ni se aprovecha aceleracion por GPU.
- Compatibilidad con GPU de consumo: irrelevante, el modelo funciona en cualquier maquina, incluidos portatiles de gama baja y dispositivos ARM.
- Tamano en disco: el repositorio figura como 0,0 GB en HuggingFace y el autor no publica el tamano exacto del bundle; por la naturaleza de la representacion (3.000 caracteristicas mas vocabulario) se espera del orden de kilobytes a pocos megabytes.
- Opciones de despliegue: carga directa del bundle con `joblib.load` dentro de un servicio Python (FastAPI, Flask, AWS Lambda, Cloud Run). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo transformer ni dispone de pesos en formatos GGUF, safetensors u ONNX.
- Latencia y rendimiento: no hay mediciones publicadas. Como referencia cualitativa, una regresion logistica sobre vectores dispersos de 3.004 dimensiones se resuelve habitualmente en el orden de microsegundos a pocos milisegundos por mensaje corto en CPU; se trata de una estimacion, no de un dato verificado por el autor.

## Comparativa con modelos similares

La informacion disponible solo permite comparar las tres estrategias evaluadas por el propio autor sobre la misma particion de prueba.

| Modelo | Parametros | Contexto | F1 (Spam) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Regresion logistica con SMOTE (este modelo) | 3.005 coeficientes (derivado) | no aplica (bag-of-words) | 0,9456 | MIT | HuggingFace, bundle joblib |
| Regresion logistica con pesos de clase | no disponible | no aplica | 0,9329 | no disponible como artefacto publicado | solo resultados en la model card |
| Naive Bayes multinomial (linea base) | no disponible | no aplica | 0,9417 | no disponible como artefacto publicado | solo resultados en la model card |

No se dispone de datos comparativos frente a alternativas de la misma categoria (SVM lineal, gradient boosting, DistilBERT o BERT ajustados para deteccion de spam) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas y no admite conversaciones multi-turno.
- Alcance limitado al ingles y al dominio de SMS; su traslado a correo electronico, mensajeria de aplicaciones o redes sociales requiere reentrenamiento y validacion especifica.
- Sesgo de composicion del conjunto de datos: la fuerte proporcion de Ham (aproximadamente 87 %) condiciona las probabilidades aprendidas y puede degradar la generalizacion a otros corpus con distinta distribucion.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si existe riesgo de falsos positivos: la version con SMOTE reporta una precision de 0,9324, es decir, en torno al 7 % de los mensajes marcados como spam podrian ser legitimos.
- Salto potencial entre entrenamiento y servicio: el ejemplo de inferencia incluido en la model card no reproduce el preprocesado de entrenamiento (minusculas, eliminacion de puntuacion y de palabras vacias), por lo que aplicar ese codigo tal cual puede introducir discrepancias entre la distribucion de entrenamiento y la de produccion.
- Dependencia de las versiones de scikit-learn y joblib empleadas al serializar el bundle; cambios de version pueden romper la carga o alterar el comportamiento del vectorizador.
- No se documentan analisis de sesgo demografico, linguistico ni de calibracion de probabilidades.
- Validacion estadistica debil: los resultados provienen de una unica particion prueba/entrenamiento, sin validacion cruzada ni intervalos de confianza.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia alguna por parte del autor.
- Adopcion nula en la comunidad (0 descargas, 0 "likes"), por lo que no existe evidencia externa de funcionamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Umair1710/spam-classifier-tfidf-logistic-regression
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces recuperados corresponden a paginas de soporte de Microsoft (contacto, inicio de sesion en Hotmail, actualizaciones de seguridad de Exchange Server y frecuencia de refresco en Windows) y no guardan relacion con el pipeline descrito.
- No se han encontrado en la informacion proporcionada articulos, papers, repositorios de codigo ni demos adicionales asociados al modelo.
