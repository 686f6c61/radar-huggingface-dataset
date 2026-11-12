# watermelonlalala/nusabert-metadata-all-s1

## Resumen

nusabert-metadata-all-s1 es un modelo de clasificación de texto en indonesio obtenido por fine-tuning del modelo base LazarusNLP/NusaBERT-base. Lo publica el usuario watermelonlalala en Hugging Face y su tarea concreta es la clasificación binaria de toxicidad, con dos etiquetas posibles: non_toxic y toxic. El modelo se ha ajustado mediante búsqueda de hiperparámetros con Optuna, segun indica la model card, lo que sugiere una optimizacion sistematica del proceso de entrenamiento en lugar de una configuracion manual.

Con 110.643.458 parametros (aproximadamente 110,6 millones), se trata de un BERT de tamano base, coherente con la familia NusaBERT, un proyecto de modelos BERT preentrenados especificamente para indonesio y lenguas locales del archipielago. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors, listos para su uso con la libreria transformers.

Su relevancia es acotada pero clara: cubre una necesidad practica de moderacion de contenido en indonesio, un idioma con menos recursos que el ingles en el ecosistema de modelos de toxicidad. El modelo se publico en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, por lo que se trata de un artefacto reciente y sin validacion comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), fine-tuned para clasificacion de secuencias |
| Parametros totales | 110.643.458 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LazarusNLP/NusaBERT-base, un BERT de tipo base adaptado al indonesio, y se ha fine-tuneado para una tarea de clasificacion de una sola etiqueta (single_label_classification) con dos clases: non_toxic y toxic. La cabecera de clasificacion corresponde a AutoModelForSequenceClassification de transformers, y el pipeline declarado es text-classification.

La model card indica que los hiperparametros se seleccionaron mediante Optuna, lo que implica una busqueda automatizada sobre el espacio de configuracion de entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). Tampoco se detalla la longitud maxima de secuencia utilizada durante el entrenamiento. La unica indicacion sobre datos es que el texto de entrada deberia preprocesarse igual que en entrenamiento: minusculas, normalizacion de emojis, menciones, URLs y similares, lo que sugiere que el corpus de entrenamiento contenia texto de redes sociales o foros con ese tipo de ruido.

## Capacidades

- Clasificacion binaria de toxicidad en texto indonesio: devuelve una de dos etiquetas, non_toxic o toxic.
- Deteccion de contenido toxico en registros textuales con ruido tipico de redes sociales (emojis, menciones, URLs), siempre que se aplique el mismo preprocesado que en entrenamiento.
- Inferencia via transformers (AutoTokenizer y AutoModelForSequenceClassification) y compatibilidad declarada con text-embeddings-inference y endpoints_compatible.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es un modelo exclusivamente discriminativo.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue limitada: el unico idioma declarado es el indonesio.

## Casos de uso

- Moderacion de comentarios en plataformas digitales indonesias: el modelo clasifica cada comentario como toxico o no toxico, lo que permite filtrar o marcar contenido antes de su publicacion y reducir la carga de revision manual.
- Pre-filtrado en pipelines de moderacion humana: se usa como primera capa para priorizar la cola de revision, enviando solo los casos marcados como toxic a moderadores humanos.
- Analisis de toxicidad en investigacion social: permite etiquetar grandes volumenes de texto indonesio (foros, redes sociales, encuestas abiertas) para estudios cuantitativos sobre discurso hostil.
- Monitorizacion de comunidades y foros: integrado en un proceso periodico, clasifica los mensajes nuevos y genera alertas cuando la proporcion de contenido toxico supera un umbral definido.
- Filtrado de datasets para entrenamiento de otros modelos: se emplea para limpiar corpus indonesios eliminando muestras toxicas antes de usarlas en el preentrenamiento o fine-tuning de modelos generativos.
- Clasificacion por lotes en backend: al ser un BERT base de 110 millones de parametros, puede procesar lotes grandes en CPU o GPU modesta, lo que lo hace adecuado para tareas de etiquetado masivo sin requisitos de infraestructura elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110,6 M de parametros), mas memoria para activaciones y lote; en la practica, menos de 1-2 GB para lotes pequenos.
- En fp16: alrededor de 0,22 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1060, RTX 3060, RTX 4090 y similares; tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: transformers (referencia), text-embeddings-inference (declarado en los tags) y, en general, cualquier servidor compatible con modelos de clasificacion de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| watermelonlalala/nusabert-metadata-all-s1 | 110,6 M | no disponible | Clasificacion de toxicidad (indonesio) | no disponible | Hugging Face |
| LazarusNLP/NusaBERT-base | no disponible | no disponible | Modelo base BERT (indonesio) | no disponible | Hugging Face |
| Modelos de toxicidad multilingues tipo XLM-R fine-tuned | variable (aprox. 270 M en base) | no disponible | Clasificacion de toxicidad multilingue | variable | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible: no se han publicado metricas de rendimiento para este modelo ni se dispone de datos verificados de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha, sin evidencia publica de calidad en produccion.
- No se han publicado metricas (accuracy, F1, precision, recall) ni conjuntos de evaluacion, por lo que se desconoce su rendimiento real.
- Riesgo de sesgo: al entrenarse sobre texto de redes sociales, puede reproducir sesgos del corpus y sobrerrepresentar ciertos registros o variantes dialectales del indonesio.
- Sensibilidad al preprocesado: la model card advierte que la entrada debe normalizarse igual que en entrenamiento (minusculas, emojis, menciones, URLs); si no se hace, las predicciones pueden degradarse.
- Ambito limitado al indonesio: no se declara soporte para otras lenguas, incluidas lenguas regionales de Indonesia.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en un producto.
- Riesgo de falsos positivos y negativos inherente a la clasificacion binaria de toxicidad; no debe usarse como unico criterio para sanciones automaticas sin revision humana.
- Sin informacion sobre la longitud maxima de secuencia soportada, lo que limita el diseno de pipelines con textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/watermelonlalala/nusabert-metadata-all-s1
- Modelo base: https://huggingface.co/LazarusNLP/NusaBERT-base
