# WinnieAmong/groupMary_Winnie-sentiment-model

## Resumen

`groupMary_Winnie-sentiment-model` es un clasificador binario de sentimiento (positivo/negativo) para resenas de peliculas en ingles, desarrollado por Mary Nabakka y Winnie Among (cuenta de Hugging Face `WinnieAmong`) como parte de un trabajo de grupo. Se obtiene mediante fine-tuning de `distilbert-base-uncased`, la version destilada de BERT con 6 capas, sobre el dataset IMDB de resenas cinematograficas. El repositorio ocupa 0,5 GB y contiene pesos en formato safetensors con 66.955.010 parametros totales.

El modelo resuelve una tarea acotada y bien delimitada: asignar una etiqueta de polaridad a un texto corto o medio en ingles. Su interes practico reside en que ofrece una linea base ligera y rapida para tareas de analisis de sentimiento, con metricas declaradas de 0,91444 de accuracy y 0,9153 de F1 en el conjunto de test. No obstante, se trata de un modelo de proposito educativo, con una model card incompleta (campos `TODO` sin rellenar) y un volumen de descargas muy bajo (38 descargas, 0 likes en el momento de la consulta).

Por su tamano (aproximadamente 67 millones de parametros) y su arquitectura encoder-only, es adecuado para inferencia en CPU y en GPUs de consumo, pero no soporta generacion de texto, razonamiento multi-paso ni tool calling. La licencia no esta declarada en el repositorio, lo que constituye una limitacion relevante para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (la arquitectura DistilBERT admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el formato original) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder-only de 6 capas y 66 millones de parametros obtenido por destilacion de conocimiento a partir de BERT-base. Sobre esa base se anade una cabeza de clasificacion para dos etiquetas (positivo/negativo) y se realiza un fine-tuning supervisado sobre el dataset `stanfordnlp/imdb`, compuesto por resenas cinematograficas en ingles etiquetadas por polaridad. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros, ni si se aplicaron tecnicas de ajuste adicionales como DPO o RLHF; en un clasificador de este tipo lo habitual es un ajuste supervisado con entropia cruzada, pero ese dato no se declara.

No se documenta ninguna innovacion tecnica destacable: no hay decodificacion especulativa, atencion lineal ni modulos hibridos. La tokenizacion es la del tokenizador WordPiece uncased de BERT, y la arquitectura mantiene la attention multi-cabeza estandar de DistilBERT con 12 cabezas y dimension oculta de 768. La model card contiene campos marcados como `TODO` (miembros del grupo, nombre del dataset en la seccion de uso previsto y ejemplos de prediccion), lo que indica que la documentacion no esta finalizada.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles.
- Especializado en el dominio de resenas de peliculas, segun la propia model card.
- Inferencia rapida y de bajo coste computacional por su tamano reducido (67 millones de parametros).
- No soporta generacion de texto: es un encoder con cabeza de clasificacion, no un modelo causal.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidad multilingue limitada al ingles; la model card advierte explicitamente de dificultades con texto mixto luganda-ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Moderacion de resenas de peliculas en plataformas de contenido: el modelo clasifica rapidamente la polaridad de resenas enviadas por usuarios y permite agregar puntuaciones de sentimiento por titulo o por usuario, gracias a su bajo coste de inferencia en CPU.
- Analisis de opinion en estudios de mercado cinematografico: procesamiento por lotes de miles de resenas IMDB-like para calcular la distribucion de sentimiento por pelicula, genero o periodo, usando el modelo como clasificador de una sola pasada.
- Filtrado previo en pipelines de datos: descartar o priorizar resenas negativas antes de un analisis manual mas costoso, aprovechando la velocidad de un encoder de 6 capas.
- Linea base en experimentos academicos: punto de comparacion para evaluar modelos de sentimiento mas grandes o especificos de dominio en el dataset IMDB, dado que la model card reporta accuracy y F1 de referencia.
- Deteccion de resenas toxicas o criticas negativas en foros de cine: combinacion del clasificador con reglas de negocio para marcar contenido que requiera revision humana, sin necesidad de GPU.
- Prototipado rapido de APIs de analisis de sentimiento: despliegue en contenedores ligeros o funciones serverless (por ejemplo, con la pipeline `text-classification` de Transformers) para validar un producto antes de invertir en modelos mayores.
- Enriquecimiento de datasets de resenas para entrenamiento posterior: etiquetado automatico de grandes volumenes de texto no etiquetado en el dominio cinematografico, con la advertencia de revisar la calidad de las etiquetas generadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test del dataset IMDB:

| Metrica | Valor |
|---|---|
| Accuracy | 0,91444 |
| F1 | 0,9153 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni curvas de evaluacion adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (67 millones de parametros, aproximadamente 268 MB de pesos) y en torno a 0,5 GB considerando overhead de activaciones y tokenizador; en FP16, unos 134 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para lotes moderados con latencias del orden de milisegundos por muestra.
- Opciones de despliegue: pipeline `text-classification` de Hugging Face Transformers, TorchServe, ONNX Runtime, FastAPI con Transformers, o exportacion a ONNX para inferencia optimizada. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| groupMary_Winnie-sentiment-model | 66.955.010 | no disponible (hasta 512 tokens por arquitectura) | no disponible | safetensors | Accuracy 0,91444 y F1 0,9153 en IMDB segun el autor |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | hasta 512 tokens | Apache 2.0 | safetensors, pytorch | Clasificador de sentimiento ampliamente usado, entrenado en SST-2; referencia habitual para esta tarea |
| roberta-base (fine-tuned en IMDB) | ~125 M | hasta 512 tokens | MIT (modelo base) | safetensors, pytorch | Encoder mas grande; requiere mas recursos pero suele superar a DistilBERT en tareas de clasificacion |
| bert-base-uncased (fine-tuned en IMDB) | ~110 M | hasta 512 tokens | Apache 2.0 | safetensors, pytorch | Modelo base original del que se destila DistilBERT; mayor coste computacional |

La comparativa se limita a caracteristicas estructurales: no se dispone de resultados de benchmarks de este modelo frente a las alternativas en la informacion proporcionada, salvo las metricas propias declaradas por el autor.

## Limitaciones y advertencias

- Entrenado principalmente sobre resenas de peliculas en ingles; la model card advierte de que puede no generalizar bien fuera del dominio cinematografico.
- Dificultades reconocidas con la ironia y el sarcasmo, y con texto mixto luganda-ingles.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si existe riesgo de clasificaciones erroneas en textos ambiguos, negaciones complejas o resenas muy largas.
- Licencia no declarada: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Model card incompleta: los campos `TODO` (miembros del grupo, dataset en uso previsto, ejemplos de prediccion) no estan rellenados, lo que reduce la trazabilidad del entrenamiento.
- No se documentan sesgos conocidos, pero al entrenarse sobre IMDB puede heredar sesgos de ese corpus (por ejemplo, de genero o de tipo de pelicula).
- Longitud de contexto no declarada explicitamente; la arquitectura DistilBERT limita la entrada a 512 tokens, por lo que resenas mas largas requieren truncamiento.
- Volumen de adopcion muy bajo (38 descargas, 0 likes), sin evidencia de uso en produccion ni validacion independiente.
- No apto para tareas generativas, de razonamiento o agenticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WinnieAmong/groupMary_Winnie-sentiment-model
- Dataset de entrenamiento (IMDB): https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo base (DistilBERT): https://huggingface.co/distilbert-base-uncased
- Documentacion de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentacion de BERT (paper): https://arxiv.org/abs/1810.04805
