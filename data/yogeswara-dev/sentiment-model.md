# yogeswara-dev/sentiment-model

## Resumen

`yogeswara-dev/sentiment-model` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert-base-uncased`, la versión destilada de BERT base desarrollada por Hugging Face. El autor, `yogeswara-dev`, lo publica como un clasificador de sentimiento entrenado con la librería Transformers y el `Trainer`, con licencia Apache 2.0 y un total de 66.955.779 parámetros, coherente con la arquitectura DistilBERT (6 capas, 768 dimensiones ocultas, 12 cabezas de atención).

El interés práctico del modelo es limitado pero honesto: sirve como ejemplo reproducible de fine-tuning de un encoder pequeño para análisis de sentimiento, con un coste de inferencia muy bajo (se ejecuta en CPU y en cualquier GPU de consumo con unos pocos cientos de MB de memoria). No obstante, sus métricas declaradas en la model card son modestas (accuracy 0.6598, F1 weighted 0.6493, pérdida de evaluación 0.7470) y el autor no documenta el dataset, el número de clases ni los idiomas soportados, lo que impide garantizar su comportamiento fuera de un contexto experimental.

La relevancia de la ficha es, por tanto, la de un caso de estudio: muestra cómo se publica un checkpoint derivado de `distilbert-base-uncased` con la plantilla automática del `Trainer` y sirve como punto de partida para tareas de clasificación binaria o multiclase que el desarrollador quiera reentrenar o adaptar con datos propios. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card incluye varios apartados marcados como «More information needed».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilación de BERT base) |
| Parametros totales | 66.955.779 |
| Longitud de contexto | 512 tokens (heredada de la configuración de `distilbert-base-uncased`; no declarada explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no hay versiones GGUF, ONNX ni cuantizadas oficiales) |
| Idiomas soportados | no disponible en la informacion proporcionada (el tokenizador base es `uncased` en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`; repositorio de 0.3 GB) |
| Tarea | text-classification (pipeline de Hugging Face) |
| Modelo base | distilbert-base-uncased (fine-tune) |
| Numero de etiquetas | no disponible |
| Fecha de creacion / actualizacion | 2026-09-26 (ambas, segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de tipo DistilBERT: 6 capas, 768 dimensiones ocultas, 12 cabezas de atención y unos 66,9 millones de parámetros, es decir, aproximadamente el 60 % de los parámetros de BERT base y con la misma ventana de contexto de 512 tokens. DistilBERT se obtiene mediante destilación de conocimiento (loss de destilación + loss enmascarado + coseno) a partir de BERT base, lo que reduce el coste de inferencia manteniendo buena parte de la capacidad de representación. Sobre esa base se ha añadido una cabeza de clasificación y se ha realizado un fine-tuning supervisado con el `Trainer` de Transformers.

Los hiperparámetros documentados son: `learning_rate = 2e-05`, `train_batch_size = 32`, `eval_batch_size = 32`, semilla 42, optimizador `AdamW` (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal y 3 épocas. El autor no indica el número de tokens ni la composición del dataset, que aparece como «unknown dataset» en la model card. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se documenta ningún tipo de RLHF, DPO ni optimización posterior al fine-tuning supervisado.

## Capacidades

- Clasificación de texto (text-classification): devuelve una etiqueta de sentimiento con su puntuación de probabilidad a partir de una secuencia de entrada.
- Procesamiento de textos cortos y medios: al derivar de DistilBERT, acepta hasta 512 tokens por secuencia (los textos más largos deben truncarse o dividirse).
- Inferencia muy rápida: 66,9 M de parámetros permiten inferencia en CPU y en GPU de consumo con latencia baja por muestra.
- Integración directa con el ecosistema Transformers: `pipeline("text-classification")`, `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatible con `endpoints_compatible` y `generated_from_trainer`, lo que facilita su despliegue en Inference Endpoints y su reentrenamiento con `Trainer`.
- Sin capacidad de generación de texto: es un encoder con cabeza de clasificación, no un modelo causal.
- Sin tool calling ni function calling: no dispone de plantilla de chat ni de soporte de herramientas.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües: no declaradas; el tokenizador base está entrenado en inglés sin distinción de mayúsculas.
- Modo «thinking» o razonamiento explícito: no disponible.

## Casos de uso

- Clasificación por lotes de reseñas de producto: el modelo puede procesar grandes volúmenes de reseñas cortas en CPU o GPU pequeña y asignar una etiqueta de sentimiento, siempre que el dominio y el idioma coincidan con los del entrenamiento (desconocidos).
- Filtrado previo en pipelines de atención al cliente: usar el clasificador como primera etapa para enrutar mensajes negativos a agentes humanos y positivos a respuestas automáticas, reduciendo coste frente a un LLM generativo.
- Pre-etiquetado para anotación humana: generar etiquetas iniciales sobre un corpus y revisarlas después, acelerando la creación de datasets propios (active learning).
- Análisis de encuestas y formularios abiertos: clasificar respuestas de NPS o CSAT de forma automática y agregar la proporción de comentarios negativos por periodo.
- Monitorización de menciones en redes sociales o foros: clasificar publicaciones cortas en tiempo real, con la advertencia de que el modelo no declara idiomas soportados y podría degradarse con jerga o abreviaturas.
- Prototipado y validación de arquitectura: servir como referencia para comparar el efecto de distintos datasets, hiperparámetros o modelos base antes de escalar a un encoder mayor o a un LLM.
- Punto de partida para fine-tuning específico de dominio: dado su tamaño reducido, reentrenarlo con datos propios (por ejemplo, opiniones financieras o sanitarias) es viable en una sola GPU de consumo.
- Clasificación en el borde (edge) o en dispositivos sin GPU: al ocupar unas pocas centenas de MB, puede ejecutarse en contenedores pequeños o en CPU compartida.

## Benchmarks y rendimiento

El `model-index` de la model card no contiene resultados (`"results": []`), por lo que no hay benchmarks estandarizados (MMLU, GLUE, SST-2, etc.) publicados. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor sobre un conjunto de evaluación cuyo origen no se especifica:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0.7470 |
| Accuracy (evaluacion final) | 0.6598 |
| F1 weighted (evaluacion final) | 0.6493 |
| F1 macro (evaluacion final) | 0.6493 |

Evolución durante el entrenamiento (según la tabla incluida en la model card):

| Training loss | Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1.0498 | 1.0 | 58 | 0.8737 | 0.6080 | 0.5529 | 0.5529 |
| 0.8304 | 2.0 | 116 | 0.7226 | 0.6975 | 0.6881 | 0.6881 |
| 0.6785 | 3.0 | 174 | 0.7117 | 0.6821 | 0.6736 | 0.6736 |

No se han publicado resultados de benchmarks estandarizados en la información disponible. El elevado valor de la pérdida de validación (0.71-0.87) y una accuracy en torno al 66-70 % sugieren un ajuste limitado, posiblemente por un dataset pequeño (174 pasos totales con batch de 32 implican del orden de 5.500 muestras de entrenamiento) o por una tarea con más de dos clases.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de pesos, no medidas publicadas): ~268 MB en FP32 (66,96 M × 4 bytes), ~134 MB en FP16/BF16 y ~67 MB en INT8, más el espacio de activaciones (decenas de MB con batch pequeño y secuencia de 512 tokens).
- GPU recomendadas: cualquier GPU moderna con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, T4, L4, A10G, A100, H100). No se requiere una GPU de centro de datos.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- CPU: la inferencia en CPU es perfectamente viable para lotes moderados, dado el reducido número de parámetros.
- Opciones de despliegue: `transformers` (pipeline), Hugging Face Inference Endpoints (`endpoints_compatible`), Text Generation Inference (TGI) para servir el modelo, ONNX Runtime (requiere exportación propia), TorchServe o FastAPI con PyTorch. No hay pesos GGUF publicados, por lo que Ollama o llama.cpp requerirían una conversión manual.
- Latencia y throughput: no disponibles; no se han publicado medidas. A modo de referencia cualitativa, el tamaño del modelo lo sitúa en el rango de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero estas cifras no están verificadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yogeswara-dev/sentiment-model` | 66,96 M | 512 tokens | Clasificacion de sentimiento; dataset no declarado; accuracy 0.6598 | Apache 2.0 | Hugging Face (0 descargas) |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens | Clasificacion binaria de sentimiento; fine-tune sobre SST-2 | Apache 2.0 | Hugging Face, muy desplegado |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M (RoBERTa base) | 512 tokens | Clasificacion de sentimiento en tres clases; entrenado con datos de Twitter | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` (modelo base) | 66,96 M | 512 tokens | Modelo preentrenado sin cabeza de tarea | Apache 2.0 | Hugging Face |

Nota: los datos de los modelos comparativos corresponden a información pública de esos repositorios y no proceden de la información proporcionada en esta consulta; no se dispone de resultados de benchmarks verificados para comparar el rendimiento del modelo objeto de la ficha frente a ellos. La model card de este modelo no incluye ninguna comparativa.

## Limitaciones y advertencias

- Rendimiento modesto: accuracy de 0.6598 y F1 macro de 0.6493 en evaluación, con pérdida de 0.7470. Es un resultado bajo para un clasificador de sentimiento en producción.
- Dataset desconocido: la model card indica «unknown dataset» y no aclara el número de clases, la distribución de etiquetas ni el idioma de los datos de entrenamiento, lo que impide evaluar la validez de las métricas.
- Idiomas no declarados: aunque el tokenizador base es inglés `uncased`, el autor no especifica los idiomas soportados; el comportamiento en castellano es una incógnita.
- Riesgo de alucinación y de etiquetado erróneo: al ser un clasificador, no «inventa» texto, pero sí puede asignar etiquetas incorrectas con alta confianza, especialmente en dominios distintos al de entrenamiento y en textos con ironía, sarcasmo o negaciones complejas.
- Sesgos potenciales: al no documentarse la composición del dataset, no pueden evaluarse sesgos demográficos, de género, de registro lingüístico o de dominio. Cualquier uso en decisiones sobre personas exige auditoría previa.
- Límite de contexto: 512 tokens. Los documentos largos requieren truncado o segmentación, y se pierde información del final del texto.
- Sin documentación de uso previsto: los apartados «Model description», «Intended uses & limitations» y «Training and evaluation data» están literalmente marcados como «More information needed».
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no existe evidencia externa de su comportamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia, y no concede garantías ni responsabilidad al autor.
- Dependencia del modelo base: al derivar de `distilbert-base-uncased`, hereda cualquier limitación y sesgo presente en BERT base.
- Sin soporte de formato GGUF/ONNX oficial: desplegarlo en runtimes de inferencia ligeros requiere conversión manual, con el consiguiente riesgo de divergencia numérica.
- Sin modelo de tarjeta de chat ni plantilla de prompt: no debe usarse como sustituto de un LLM instructivo.

## Enlaces

- [Modelo en Hugging Face: yogeswara-dev/sentiment-model](https://huggingface.co/yogeswara-dev/sentiment-model)
- [Modelo base: distilbert-base-uncased](https://huggingface.co/distilbert-base-uncased)
- [Búsqueda de modelos de análisis de sentimiento en Hugging Face](https://huggingface.co/models?search=sentiment-analysis)
- [Explorador general de modelos de Hugging Face](https://huggingface.co/models)
- [Repositorio GitHub Bairavi05/Sentiment-Analysis](https://github.com/Bairavi05/Sentiment-Analysis) (proyecto independiente de análisis de sentimiento; no vinculado al modelo)
- [Tema sentiment-analysis en GitHub](https://github.com/topics/sentiment-analysis) (recopilación de proyectos; no vinculada al modelo)
- [Artículo en ResearchGate: Sentiment Analysis Using Machine Learning](https://www.researchgate.net/publication/396207021_Sentiment_Analysis_Using_Machine_Learning) (referencia general; no vinculada al modelo)
