# Sufiyank02/restaurant-feedback-model

## Resumen

Restaurant Feedback Model es un clasificador de texto clásico desarrollado por el usuario Sufiyank02 (GitHub: kazisufiyan-k2) para análisis de sentimiento en reseñas de restaurantes en inglés. El modelo predice una de tres etiquetas: `negative`, `neutral` o `positive`, y forma parte del backend de una aplicación FastAPI denominada Restaurant Feedback AI, que además extrae aspectos, emociones y genera borradores de respuesta. No es un modelo de lenguaje: es un pipeline de scikit-learn serializado con joblib de aproximadamente 4,3 MB.

Técnicamente, combina dos vectorizadores TF-IDF (uno a nivel de palabra con n-gramas 1-2 y otro a nivel de carácter `char_wb` con n-gramas 3-4) mediante un `FeatureUnion`, alimentando una regresión logística base que luego se apila con un meta-clasificador que incorpora puntuaciones VADER y el logaritmo del número de palabras. El modelo se entrenó el 6 de octubre de 2026 y reporta un macro F1 de 0,697 en holdout, frente a 0,513 de VADER en solitario.

Su relevancia es limitada y muy específica: sirve como componente ligero de clasificación de sentimiento en dominios de restauración en inglés, con requisitos de cómputo mínimos y sin dependencia de GPU. No compite con LLMs modernos y su uso en producción está condicionado por la ausencia de licencia publicada y de datos de entrenamiento reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: FeatureUnion de dos TfidfVectorizer (word + char_wb) + LogisticRegression base + LogisticRegression meta-clasificador (stacking) |
| Parametros totales | no disponible (modelo clásico; 130459 features de entrada al clasificador base, 8 features al meta-clasificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF sobre documento completo; sin ventana definida) |
| Tipos de cuantizacion | no aplica (no es una red neuronal; serialización joblib/pickle) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el autor indica que no se publicó archivo de licencia con el proyecto original) |
| Formato de pesos | joblib/pickle (`feedback-model.pkl`, ~4,3 MB) + JSON de configuración (`feedback-config.json`) |

## Arquitectura y entrenamiento

El modelo es un pipeline clásico de procesamiento de lenguaje natural, no una red neuronal. La entrada pasa por una limpieza de texto (contracciones, jerga, mapeo de emojis, definidos en `feedback-config.json`) y luego por dos vectorizadores TF-IDF en paralelo: uno a nivel de palabra con n-gramas (1, 2), `min_df=3` y `max_features=100000` (vocabulario de 100000 términos), y otro a nivel de carácter con analizador `char_wb`, n-gramas (3, 4), `min_df=5` y `max_features=60000` (vocabulario efectivo de 30459). Ambos se concatenan en un `FeatureUnion` de 130459 features.

Sobre esas features se entrena una regresión logística base (`C=1`, `class_weight=balanced`, `solver=lbfgs`, `max_iter=3000`). Posteriormente, un meta-clasificador de regresión logística (`C=1.0`, `class_weight=balanced`, `solver=lbfgs`, `max_iter=2000`) recibe 8 features: las 3 probabilidades de clase del modelo base, 4 puntuaciones VADER y el logaritmo del número de palabras. Se aplica además un sesgo aditivo en log-probabilidades (neutral 0,0; positive 1,0 en este checkpoint). El conjunto de entrenamiento no se publica en el repositorio, por lo que no es posible reproducir el ajuste, solo la ruta de inferencia. No se reporta uso de RLHF, DPO ni datos sintéticos.

## Capacidades

- Clasificación de sentimiento en tres clases (`negative`, `neutral`, `positive`) sobre reseñas de restaurantes en inglés.
- Manejo de inglés informal de restauración y parte de la jerga, gracias a la limpieza configurable y al TF-IDF a nivel de carácter.
- Integración con VADER para señales léxicas de valencia y con NRCLex para etiquetado de emociones (joy, trust, anticipation, anger, disgust, fear, sadness, surprise), aunque estas capacidades residen en la API, no en el pickle.
- Extracción de aspectos por palabras clave desde la configuración: taste, delivery, packaging, quantity, price, service, ambience, hygiene (también en la API, no en el modelo serializado).
- Fusión opcional de la etiqueta de texto con una valoración de 1 a 5 estrellas en la capa de API.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.

## Casos de uso

- Triaje de reseñas en plataformas de delivery: clasificar automáticamente miles de reseñas en negativas, neutras y positivas para priorizar la atención al cliente, aprovechando que el modelo es ligero (4,3 MB) y no requiere GPU.
- Monitorización de reputación en cadenas de restauración: agregar la distribución de sentimiento por local o franquicia a partir de reseñas en inglés, con la API complementando aspectos como `service` o `hygiene`.
- Enrutamiento de quejas a soporte: enviar a revisión humana las reseñas clasificadas como negativas y con aspectos críticos detectados por la API, reduciendo el tiempo de respuesta.
- Análisis de feedback post-pedido: procesar encuestas cortas en inglés y combinar la etiqueta del modelo con la valoración en estrellas para detectar discrepancias entre texto y rating.
- Investigación académica sobre sentiment analysis clásico: usar el pipeline como baseline reproducible (TF-IDF + stacking con VADER) frente a enfoques neuronales en dominios de restauración.
- Prototipado rápido de aplicaciones FastAPI: integrar el modelo en un servicio de análisis de reseñas con bajo coste de despliegue, dado su tamaño y dependencias (scikit-learn, numpy, joblib).
- Filtrado previo en pipelines de moderación: descartar reseñas claramente positivas antes de pasarlas a modelos más costosos, siempre que no se use como única señal para decisiones de alto impacto.

## Benchmarks y rendimiento

| Modelo | Metrica | Valor |
|---|---|---|
| Restaurant Feedback Model | Macro F1 en holdout | 0,697 |
| VADER (solo) | Macro F1 en holdout | 0,513 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un clasificador clásico de texto.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU con un consumo de memoria mínimo (el pickle ocupa ~4,3 MB y las features TF-IDF son dispersas).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos serverless con poca memoria.
- Opciones de despliegue: la vía soportada es la API FastAPI del repositorio del autor (https://github.com/kazisufiyan-k2/restaurant-feedback-ai), que implementa la limpieza, el stacking, la corrección de sesgo y la extracción de aspectos. No se contempla despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del pipeline (TF-IDF + dos regresiones logísticas), se espera latencia de milisegundos en CPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Restaurant Feedback Model | TF-IDF + LogisticRegression con stacking | no disponible (130459 features) | no disponible | Macro F1 0,697 (holdout) | no disponible | Hugging Face, 0 descargas |
| VADER | Léxico basado en reglas | no aplica | no aplica | Macro F1 0,513 (mismo holdout, según el autor) | MIT (ampliamente conocido) | PyPI, muy extendido |
| Modelos Transformer de análisis de sentimiento (p. ej. RoBERTa fine-tuned) | Transformer | ~125M típicamente | 512 tokens típicamente | No comparado en la información disponible | Varía según checkpoint | Hugging Face, amplia disponibilidad |

La comparación con transformers fine-tuned para sentimiento no está respaldada por datos del autor; se indica como referencia categórica y no como benchmark verificado.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, aunque maneja inglés informal de restauración y parte de la jerga.
- Es un modelo clásico pequeño, no un LLM: reseñas cortas, sarcásticas, con sentimiento mixto o con discrepancias entre texto y rating pueden clasificarse erróneamente.
- El macro F1 en holdout es 0,697, por lo que se esperan errores, especialmente en la clase `neutral`.
- No debe usarse como única señal para reembolsos, moderación u otras decisiones de alto impacto; la API marca algunos casos para revisión manual.
- Los datos de entrenamiento no se publican, por lo que terceros no pueden reproducir el ajuste, solo la ruta de inferencia.
- Las versiones de scikit-learn (1.8.0), numpy (2.3.5) y joblib (1.5.2) deben coincidir con las de entrenamiento; cargar el pickle con otras versiones puede fallar o dar resultados distintos.
- La limpieza de texto debe replicarse exactamente como en el entrenamiento; una llamada directa a `model.predict(vectorizer.transform([text]))` sobre texto sin limpiar no coincide con la API.
- Licencia no disponible: el autor advierte que no se publicó archivo de licencia y recomienda confirmar los términos de reutilización antes de redistribuir el modelo.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que limita la validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sufiyank02/restaurant-feedback-model
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Sufiyank02/restaurant-feedback-ai
- Código en GitHub: https://github.com/kazisufiyan-k2/restaurant-feedback-ai
