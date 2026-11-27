# wenlong-1/imdb-sentiment-nn

## Resumen

`wenlong-1/imdb-sentiment-nn` es un clasificador binario de sentimiento (positivo/negativo) para resenas de peliculas en ingles, publicado por el usuario wenlong-1 en Hugging Face. No es un modelo de lenguaje generativo, sino un pipeline clasico de aprendizaje automatico supervisado: vectorizacion TF-IDF del texto seguida de un perceptron multicapa (MLP) implementado en PyTorch. El repositorio se genero de forma automatica mediante GitHub Actions, lo que indica un flujo de entrenamiento reproducible pero de proposito didactico o experimental mas que de produccion.

El modelo se entreno sobre `imdb_top_500.csv`, un subconjunto muy reducido del corpus IMDb: 400 resenas para entrenamiento y 100 para test. Con ese volumen de datos, las metricas reportadas en la model card (accuracy 0,8200, macro F1 0,8199, ROC-AUC 0,8964) deben interpretarse con cautela, ya que la varianza estadistica sobre 100 ejemplos de test es alta y no hay validacion cruzada documentada.

Su relevancia es limitada en el ecosistema actual de IA open source: sirve como ejemplo minimo de pipeline de clasificacion de texto con TF-IDF + MLP y como referencia para tareas de sentiment analysis acotadas, pero no compite con modelos transformer preentrenados como DistilBERT o RoBERTa fine-tuneados sobre IMDb, que superan el 0,93 de accuracy con contextos mucho mas amplios. No hay informacion sobre licencia, idiomas ni formato de pesos mas alla de la libreria PyTorch declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP sobre caracteristicas TF-IDF (no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del vectorizador TF-IDF; no se documenta el limite de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el dataset IMDb es en ingles, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria declarada: pytorch; tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa (MLP) que opera sobre un vector disperso de caracteristicas TF-IDF extraidas del texto de entrada. No se trata de un transformer ni de un modelo con atencion; es un clasificador feed-forward clasico. La model card no especifica el numero de capas ocultas, dimensiones, funcion de activacion, tasa de dropout ni hiperparametros de entrenamiento (learning rate, epochs, batch size, optimizador).

El entrenamiento se realizo sobre `imdb_top_500.csv`, con 400 ejemplos de train y 100 de test, y el repositorio se genero de forma automatica mediante GitHub Actions. No se documenta el numero de tokens de entrenamiento (en este caso, numero de documentos), la composicion exacta del dataset, ni si hubo tecnicas de regularizacion, aumentacion de datos o ajuste de hiperparametros. Tampoco se indica si el split es estratificado ni si se uso validacion separada para seleccionar el modelo final. La ausencia de estas decisiones metodologicas impide reproducir el entrenamiento con fidelidad.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, presumiblemente resenas de peliculas dado el origen del dataset.
- Salida de etiqueta de clase y, segun la implementacion de `predict.py`, probablemente puntuaciones de probabilidad o logits (no confirmado en la model card).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada, sin generacion de texto.
- No tiene capacidades multilingues declaradas.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- No es un modelo conversacional: no mantiene contexto entre turnos.

## Casos de uso

- Filtrado de resenas en un prototipo de analitica de opinion: dado un lote de resenas de peliculas en ingles, el modelo devuelve una etiqueta binaria que permite calcular la proporcion de opiniones positivas por titulo. Adecuado solo para demos o pruebas de concepto por su tamano reducido de entrenamiento.
- Etiquetado rapido de datos para arrancar un pipeline de anotacion: las predicciones del modelo pueden usarse como pre-etiquetas en un flujo de weak supervision, que luego se corrigen manualmente antes de entrenar un modelo mayor.
- Baseline de referencia en experimentos academicos: sirve como punto de comparacion clasico (TF-IDF + MLP) frente a enfoques transformer en tareas de sentiment analysis sobre IMDb, util para cuantificar la mejora que aporta el preentrenamiento.
- Pruebas de integracion de `predict.py` en CI/CD: al generarse via GitHub Actions, el repositorio puede usarse como ejemplo de empaquetado de un clasificador PyTorch con interfaz de linea de comandos.
- Docencia y talleres de NLP clasico: ilustra el flujo completo vectorizacion TF-IDF, entrenamiento de MLP, evaluacion con accuracy/F1/ROC-AUC y publicacion en Hugging Face.
- Moderacion de comentarios en un foro pequeno de tematica cinematografica: con supervision humana, puede marcar resenas negativas para revision, aunque la baja fiabilidad estadistica sobre 100 ejemplos de test desaconseja su uso sin validacion adicional.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en la model card sobre el split de test (100 ejemplos):

| Metrica | Valor |
|---|---|
| Accuracy | 0,8200 |
| Macro F1 | 0,8199 |
| ROC-AUC | 0,8964 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, SST-2) en la informacion disponible, ni comparaciones con otros modelos en el mismo conjunto de test. No se documenta la matriz de confusion ni el equilibrio entre clases del split de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al ser un MLP sobre TF-IDF, la huella es minima (tipicamente decenas o pocos cientos de MB, dependiendo del tamano del vocabulario TF-IDF y de las capas ocultas, que no se documentan).
- GPU recomendadas: no se requieren; el modelo puede ejecutarse en CPU sin problema. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para esta carga.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un modelo PyTorch con un `predict.py` propio, el despliegue natural es un script de Python o un servicio ligero (FastAPI, Flask). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles; por la naturaleza del modelo (TF-IDF + MLP) se espera latencia de milisegundos en CPU para textos cortos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Accuracy IMDb reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wenlong-1/imdb-sentiment-nn | MLP sobre TF-IDF | no disponible | no disponible | 0,8200 (test propio, 100 ejemplos) | no disponible | Hugging Face |
| DistilBERT fine-tuneado en IMDb (referencia generica) | Transformer encoder | ~66 M | 512 tokens | ~0,92-0,93 (valores tipicos reportados en la literatura, no verificados aqui) | Apache 2.0 (DistilBERT base) | Hugging Face |
| RoBERTa-base fine-tuneado en IMDb (referencia generica) | Transformer encoder | ~125 M | 512 tokens | ~0,95 (valores tipicos reportados en la literatura, no verificados aqui) | MIT (RoBERTa base) | Hugging Face |
| TF-IDF + regresion logistica (baseline clasico) | Modelo lineal | no aplica | no disponible | ~0,88-0,90 (valores tipicos en IMDb completo, no verificados aqui) | segun implementacion | scikit-learn |

Nota: los valores de los modelos comparativos son referencias genericas de la literatura y no se han verificado contra una fuente concreta en esta ficha; se incluyen solo para contextualizar el orden de magnitud. La comparacion directa con este modelo no es estricta, ya que entrena sobre 400 ejemplos frente a los 25 000 del dataset IMDb completo.

## Limitaciones y advertencias

- Entrenado con solo 400 ejemplos: alta probabilidad de sobreajuste y de baja generalizacion fuera del dominio de resenas de peliculas en ingles.
- Evaluacion sobre 100 ejemplos de test: el intervalo de confianza de la accuracy es amplio (aproximadamente +/- 7-8 puntos porcentuales al 95 %), por lo que la cifra de 0,82 no debe tomarse como un valor estable.
- No se documenta licencia: riesgo legal para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- No se declaran idiomas soportados; el vocabulario TF-IDF probablemente este limitado al ingles del dataset IMDb.
- Riesgo de sesgo de dominio: el modelo puede fallar en resenas de productos, redes sociales o textos con sarcasmo, ironia o jerga no representados en el corpus de entrenamiento.
- No es un modelo generativo: no puede explicar sus predicciones ni mantener conversaciones; cualquier caso de uso conversacional requiere un LLM adicional.
- Sin informacion sobre calibracion de probabilidades: el ROC-AUC de 0,8964 no garantiza que las probabilidades de salida esten bien calibradas para umbrales distintos de 0,5.
- Generado automaticamente por GitHub Actions: no hay garantia de mantenimiento, soporte ni actualizaciones por parte del autor.
- Repositorio de 0.0 GB: el peso real del modelo y del vectorizador TF-IDF no es visible en la metadata; verificar su contenido antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wenlong-1/imdb-sentiment-nn
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
