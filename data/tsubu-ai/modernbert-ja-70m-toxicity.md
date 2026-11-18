# tsubu-ai/modernbert-ja-70m-toxicity

## Resumen

`modernbert-ja-70m-toxicity` es un clasificador binario de toxicidad para japones desarrollado por tsubu-ai, obtenido mediante fine-tuning del modelo base `sbintuitions/modernbert-ja-70m`. Su proposito es discriminar entre texto toxico y no toxico (`toxic` / `nontoxic`) tanto en documentos web largos, como los empleados en la limpieza de corpus de preentrenamiento, como en publicaciones y comentarios cortos propios de tareas de moderacion. El modelo se publica bajo licencia OpenRAIL++ y esta pensado para integrarse en pipelines de filtrado y moderacion de contenido en japones.

Arquitectura ModernBERT con 70.151.426 parametros (aproximadamente 70,2 M), lo que lo situa en la gama ligera y permite inferencia en CPU con latencias bajas. Segun la model card, procesa textos truncados a los primeros 512 tokens durante el entrenamiento, por lo que para documentos mas largos recomienda dividir en fragmentos y tomar la puntuacion toxica maxima. No requiere MeCab ni ningun otro analizador morfologico, lo que simplifica su despliegue.

Su relevancia actual radica en que supera a clasificadores multilingues existentes en documentos web japoneses (F1-macro de 0,893 frente a 0,687 de `textdetox/bert-multilingual-toxicity-classifier` y 0,777 de `textdetox/xlmr-large-toxicity-classifier-v2`), con un tamano entre 2,5 y 8 veces menor. Esta especializacion y eficiencia lo hacen atractivo para filtrar corpus japoneses a gran escala y para moderacion de contenido en produccion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 70.151.426 (aprox. 70,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | OpenRAIL++ (pesos); modelo base MIT; datos de entrenamiento CC BY 4.0 y OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT afinado para clasificacion de texto (text-classification). Parte de `sbintuitions/modernbert-ja-70m`, un modelo base japones de 70 M de parametros, y anade una cabeza de clasificacion binaria. La inferencia se realiza con la libreria `transformers` y es compatible con text-embeddings-inference y endpoints.

El entrenamiento utilizo 5.403 textos: 1.477 documentos del LLM-jp Toxicity Dataset y 3.926 publicaciones de textdetox/multilingual_toxicity_dataset, tras eliminar duplicados. En el LLM-jp Toxicity Dataset, las etiquetas `toxic` y `has_toxic_expression` se mapearon a `toxic`. Se realizaron 3 epocas con learning rate 5e-5, batch de 16, longitud maxima de 512 y semilla 0, sobre una Apple M1 Max (MPS). El script de entrenamiento es `train_classifier.py` junto con `prep.py`, que realiza una division determinista de los datos. No se menciona uso de RLHF ni DPO, al tratarse de un clasificador supervisado.

## Capacidades

- Clasificacion binaria de toxicidad en japones: devuelve `toxic` o `nontoxic`.
- Procesamiento de documentos web largos y de publicaciones o comentarios cortos con el mismo modelo.
- Funciona sin analizador morfologico (no requiere MeCab ni similares).
- Integracion directa con el pipeline `text-classification` de `transformers`.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No predice categorias de toxicidad (obsceno, discriminatorio, etc.); solo la etiqueta binaria.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento.

## Casos de uso

- Limpieza de corpus de preentrenamiento en japones: el modelo filtra documentos web toxicos antes de incluirlos en un dataset de entrenamiento; su bajo coste computacional permite procesar grandes volumenes y su F1-macro de 0,893 en documentos LLM-jp lo hace adecuado para esta tarea.
- Moderacion de comentarios y publicaciones cortas: clasifica posts en tiempo real con una latencia de aproximadamente 108,7 ms por texto en CPU (batch 1, Apple M1 Max), lo que permite desplegarlo en servicios de moderacion sin GPU.
- Filtrado previo en pipelines de anotacion: actua como primera etapa para descartar contenido toxico antes de un revisor humano, reduciendo el coste de revision manual en entornos de alto riesgo.
- Moderacion en foros y comunidades japonesas: el modelo procesa textos cortos con F1-macro de 0,914 en el conjunto textdetox ja, adecuado para comentarios y respuestas.
- Preprocesamiento de datasets multilingues: al ser especializado en japones, se puede combinar con clasificadores de otros idiomas para construir filtros por lengua en corpus multilingues.
- Deteccion de contenido toxico en documentacion y webs corporativas: permite auditar grandes colecciones de texto japones dividiendo en fragmentos de 512 tokens y tomando la puntuacion maxima.
- Clasificacion en entornos con CPU: al ser un modelo de 70 M, puede ejecutarse en servidores sin GPU, lo que facilita su integracion en infraestructuras modestas.

## Benchmarks y rendimiento

Evaluacion sobre el 20 % reservado de cada fuente (estratificado, semilla 0, nunca visto en entrenamiento). Los mismos ficheros de test para todos los modelos.

| Modelo | Parametros | LLM-jp docs acc / F1-macro | textdetox ja acc / F1-macro | CPU ms/texto |
|---|---|---|---|---|
| tsubu-ai/modernbert-ja-70m-toxicity (este) | 70,2 M | 0,895 / 0,893 | 0,914 / 0,914 | 108,7 |
| tsubu-ai/modernbert-ja-130m-toxicity | 132,4 M | 0,924 / 0,924 | 0,910 / 0,910 | 314,6 |
| textdetox/bert-multilingual-toxicity-classifier | 177,9 M | 0,689 / 0,687 | 0,935 / 0,935 | 574,9 |
| textdetox/xlmr-large-toxicity-classifier-v2 | 559,9 M | 0,778 / 0,777 | 0,965 / 0,965 | 805,8 |

Notas de la model card: en LLM-jp docs, este modelo se entreno con el 80 % restante del dataset, mientras que los modelos textdetox no, por lo que parte de la diferencia es por entrenamiento en dominio. En textdetox ja, los modelos textdetox se entrenaron con ese dataset (probablemente incluyendo esas filas), por lo que sus puntuaciones son optimistas. Los tiempos de CPU corresponden a batch 1, 50 textos cortos, PyTorch sobre CPU de Apple M1 Max, y son solo relativos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 70 M de parametros, la huella en memoria es reducida; en fp32 rondaria los 280 MB de pesos y en fp16 unos 140 MB, aunque la model card no proporciona cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, por su tamano reducido; la model card demuestra inferencia en CPU (Apple M1 Max) con 108,7 ms por texto.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: 108,7 ms por texto en CPU (batch 1, Apple M1 Max, 50 textos cortos); no se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LLM-jp docs F1-macro | textdetox ja F1-macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tsubu-ai/modernbert-ja-70m-toxicity | 70,2 M | 512 tokens | 0,893 | 0,914 | OpenRAIL++ | Hugging Face |
| tsubu-ai/modernbert-ja-130m-toxicity | 132,4 M | no disponible | 0,924 | 0,910 | no disponible | Hugging Face |
| textdetox/bert-multilingual-toxicity-classifier | 177,9 M | no disponible | 0,687 | 0,935 | no disponible | Hugging Face |
| textdetox/xlmr-large-toxicity-classifier-v2 | 559,9 M | no disponible | 0,777 | 0,965 | no disponible | Hugging Face |

El modelo de 70 M ofrece el mejor equilibrio entre precision en documentos japoneses y coste computacional, con un rendimiento en textos cortos competitivo pero inferior al de los clasificadores multilingues mas grandes en el conjunto textdetox ja (cuyas cifras, segun la model card, son optimistas por entrenamiento en dominio).

## Limitaciones y advertencias

- Conjunto de entrenamiento pequeno (5.403 textos): se esperan errores en jerga, sarcasmo y dominios no representados (chat de videojuegos, codigo, etc.).
- La etiqueta "toxico" sigue las definiciones de los dos datasets de origen (obsceno, discriminatorio, violento, ilegal, difamacion de personas o empresas, etc.); no constituye un juicio legal.
- Para moderacion de alto riesgo se recomienda revision humana.
- No predice categorias de toxicidad (obsceno, discriminatorio, etc.); solo clasifica de forma binaria.
- Los textos se truncan a los primeros 512 tokens; para documentos mas largos hay que dividir en fragmentos y tomar la puntuacion maxima.
- Solo soporta japones; no se ha validado su rendimiento en otros idiomas.
- Licencia OpenRAIL++ en los pesos, heredada de textdetox/multilingual_toxicity_dataset, con sus restricciones de uso; conviene revisarlas antes de un uso comercial.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos en la clasificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsubu-ai/modernbert-ja-70m-toxicity
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-70m
- Dataset LLM-jp Toxicity: https://huggingface.co/datasets/p1atdev/LLM-jp-Toxicity-Dataset
- Dataset textdetox multilingual toxicity: https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset
- Modelo comparable tsubu-ai/modernbert-ja-130m-toxicity: https://huggingface.co/tsubu-ai/modernbert-ja-130m-toxicity
- Modelo comparable textdetox/bert-multilingual-toxicity-classifier: https://huggingface.co/textdetox/bert-multilingual-toxicity-classifier
- Modelo comparable textdetox/xlmr-large-toxicity-classifier-v2: https://huggingface.co/textdetox/xlmr-large-toxicity-classifier-v2
