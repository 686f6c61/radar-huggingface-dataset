# thekluna/amazon-food-sentiment-distilbert

## Resumen

El modelo `thekluna/amazon-food-sentiment-distilbert` es un clasificador de sentimiento en tres clases (Negative, Neutral, Positive) obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un subconjunto del dataset Amazon Fine Food Reviews. Lo desarrolla el grupo de trabajo "Group Psi" en el marco de un proyecto de la asignatura CSE 3521 (Survey of Artificial Intelligence) de la Universidad Estatal de Ohio, otoño de 2026. Resuelve una tarea acotada: asignar polaridad a reseñas de productos alimenticios de Amazon a partir de la puntuacion en estrellas como etiqueta debil.

Arquitectonicamente es un transformer encoder de tipo DistilBERT con 66.955.779 parametros totales, contexto de 512 tokens (aunque el entrenamiento se realizo con truncamiento a 256), tokenizer WordPiece sin casing y una cabeza de clasificacion de tres etiquetas. El repositorio ocupa 0,3 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, con pesos unicamente en ingles.

Su relevancia es limitada y de caracter educativo: sirve como ejemplo reproducible de pipeline de clasificacion de texto con desbalanceo de clases, pesos balanceados en la funcion de perdida y seleccion de checkpoint por macro-F1. No esta pensado para produccion y sus propios autores lo advierten.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) con cabeza de clasificacion de secuencia |
| Parametros totales | 66.955.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens maximos del modelo base; entrenamiento con truncamiento a 256 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 67 M de parametros es viable convertirlo a INT8/GGUF con herramientas externas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer de 6 capas y 66 M de parametros obtenido por destilacion de conocimiento de BERT-base. Sobre el se anade una cabeza lineal de clasificacion con tres salidas (Negative, Neutral, Positive). La entrada combina el resumen de la resena y el texto completo separados por un espacio, tras eliminar etiquetas HTML, con truncamiento a 256 tokens.

Los datos proceden del dataset Amazon Fine Food Reviews de SNAP: 50.000 resenas muestreadas con semilla 48, de las que se eliminaron 2 filas sin resumen y 3.737 duplicados de texto, quedando 46.261 ejemplos. Las etiquetas se derivan de la puntuacion en estrellas: 1-2 estrellas como Negative (14,4 %), 3 estrellas como Neutral (7,7 %) y 4-5 estrellas como Positive (78,0 %). El split es 80/20 estratificado y despues se reserva un 10 % del train para validacion: 33.307 de entrenamiento, 3.701 de validacion y 9.253 de test. El entrenamiento uso AdamW con learning rate 3e-5, weight decay 0,01, batch de 32, dos epocas, warmup lineal del 10 % de los pasos seguido de decaimiento lineal, precision mixta fp16 y entropia cruzada con pesos de clase balanceados. Se selecciono el checkpoint con mejor macro-F1 de validacion, evaluado cada 200 pasos. El entrenamiento completo duro 3,6 minutos en una AMD Radeon RX 9070 XT con ROCm.

## Capacidades

- Clasificacion de texto en tres clases de sentimiento (Negative, Neutral, Positive) para resenas en ingles.
- Devuelve una distribucion de probabilidad sobre las tres etiquetas mediante softmax de los logits.
- Manejo de entradas compuestas resumen + cuerpo de resena, replicando el formato de entrenamiento.
- Tolerancia a texto con ruido moderado, siempre que se limpien previamente las etiquetas HTML.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explicito, agentes ni multi-step reasoning.
- No tiene capacidades de vision, audio ni generacion de texto libre: es exclusivamente un clasificador.
- Multilingue: no. Solo ingles.

## Casos de uso

- Analisis de sentimiento de resenas de alimentacion en un panel de control: el modelo clasifica lotes de resenas y permite agregar la distribucion de polaridad por producto o categoria; su tamano de 67 M de parametros permite procesar miles de resenas por minuto en CPU.
- Enrutamiento de tickets de atencion al cliente en e-commerce alimentario: las resenas o mensajes con sentimiento negativo se derivan automaticamente al equipo de soporte, usando el umbral de probabilidad de la clase Negative.
- Etiquetado de datos para entrenar modelos mayores: como clasificador rapido y barato, puede preetiquetar grandes volumenes de resenas que despues se revisan manualmente, reduciendo el coste de anotacion.
- Monitorizacion de la percepcion de marca: ingesta periodica de resenas de un catalogo de productos y calculo de la proporcion de sentimiento negativo como metrica de alerta temprana ante problemas de calidad.
- Filtrado previo en pipelines de moderacion: descartar o marcar resenas con alta probabilidad de sentimiento negativo antes de un analisis mas profundo con modelos generativos, ahorrando coste de inferencia.
- Investigacion academica y docencia: reproduccion de un pipeline completo de clasificacion con desbalanceo de clases, pesos balanceados y seleccion de checkpoint por macro-F1, con hiperparametros y semillas documentados.
- Clasificacion por lotes en entornos sin GPU: al ser un modelo de 67 M de parametros, se puede ejecutar en CPU con latencias de decenas de milisegundos por muestra, adecuado para procesos nocturnos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test reservado (9.253 resenas):

| Metrica | Valor |
|---|---|
| Accuracy | 0,8835 |
| Precision macro | 0,7299 |
| Recall macro | 0,7864 |
| F1 macro | 0,7482 |
| Baseline de clase mayoritaria (siempre Positive) | 0,7795 de accuracy |

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Negative | 0,808 | 0,784 | 0,796 | 1.331 |
| Neutral | 0,403 | 0,650 | 0,498 | 709 |
| Positive | 0,978 | 0,925 | 0,951 | 7.213 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (67 M de parametros) y unos 0,15 GB en fp16 o INT8; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una AMD Radeon RX 9070 XT con ROCm. Tambien funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer y en CPU: es viable la inferencia en CPU para lotes moderados.
- Opciones de despliegue: `transformers` con PyTorch, `optimum` para exportacion a ONNX, `text-embeddings-inference` no aplica; para servir como API se puede usar FastAPI o un pipeline de `transformers`. La conversion a GGUF para llama.cpp es posible con herramientas externas, aunque el autor no la proporciona.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El unico dato de rendimiento es el tiempo de entrenamiento (3,6 minutos para 2 epocas sobre 33.307 ejemplos en una RX 9070 XT).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thekluna/amazon-food-sentiment-distilbert` | 66.955.779 | 512 (entrenado a 256) | Clasificacion de sentimiento en 3 clases, dominio alimentario | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 | Clasificacion de sentimiento binaria (SST-2) | Apache 2.0 | Hugging Face |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 | Clasificacion de sentimiento en 3 clases (Twitter) | No disponible en la informacion proporcionada | Hugging Face |
| `nlptown/bert-base-multilingual-uncased-sentiment` | ~178 M | 512 | Prediccion de estrellas 1-5 en 6 idiomas | No disponible en la informacion proporcionada | Hugging Face |

La comparacion de rendimiento con estas alternativas no esta disponible: el autor solo publica metricas frente al baseline de clase mayoritaria, no frente a otros clasificadores.

## Limitaciones y advertencias

- La clase Neutral es la mas debil (F1 0,498, precision 0,403): el modelo sobrepredice Neutral, especialmente en resenas levemente positivas. Las etiquetas derivadas de estrellas son un proxy ruidoso del sentimiento real.
- Dominio restringido: entrenado solo con resenas de productos alimenticios de Amazon; el rendimiento en otros dominios no se ha evaluado.
- Las resenas largas se truncan a 256 tokens (afecta a cerca de un 6 % del corpus), de modo que la parte final del texto se ignora.
- Se observo sobreajuste leve en la segunda epoca (la perdida de validacion subio mientras la de entrenamiento seguia bajando); se conservo el checkpoint con mejor macro-F1 de validacion.
- Solo ingles: no admite entradas en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor advierte explicitamente que el modelo se construyo para un proyecto de curso y no se ha evaluado para produccion.
- Riesgo de alucinacion no aplica en sentido estricto al ser un clasificador, pero si existe riesgo de clasificaciones erroneas confiadas en textos ambiguos o fuera de dominio.
- No se han documentado sesgos especificos mas alla del desbalanceo de clases del dataset original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thekluna/amazon-food-sentiment-distilbert
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Repositorio del proyecto: https://github.com/ColinWenzel24/amazon-food-review-sentiment-analysis
- Dataset Amazon Fine Food Reviews: https://www.kaggle.com/datasets/snap/amazon-fine-food-reviews
