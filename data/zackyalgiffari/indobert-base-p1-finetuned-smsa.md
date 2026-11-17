# zackyalgiffari/indobert-base-p1-finetuned-smsa

## Resumen

`indobert-base-p1-finetuned-smsa` es un modelo de clasificacion de sentimiento en indonesio obtenido por fine-tuning de `indobenchmark/indobert-base-p1`, un BERT base entrenado desde cero sobre corpus indonesios. El autor, `zackyalgiffari`, lo ha ajustado sobre la particion SmSA (Sentiment Analysis) del benchmark IndoNLU para resolver una tarea de clasificacion en tres clases: positivo, neutro y negativo. El modelo esta pensado como un clasificador ligero y desplegable en entornos con recursos limitados, no como un modelo generativo.

Arquitectonicamente es un transformer encoder de tipo BERT base, con 124.443.651 parametros y una ventana de contexto de 512 tokens (la del BERT original; el fine-tuning se realizo con longitud maxima de 256). Su relevancia practica es doble: por un lado ofrece un punto de partida solido para analisis de sentimiento en indonesio con metricas declaradas de 92,00 % de accuracy y 89,74 de macro-F1 en test; por otro, al ser un modelo pequeno y con licencia MIT, es facil de integrar en pipelines de inferencia de bajo coste.

No se trata de un modelo generalista ni multilingue: esta especializado en una unica tarea y un unico idioma. Su interes para desarrolladores esta en la relacion coste/rendimiento para moderacion de resenas, analisis de opinion y clasificacion de feedback en productos dirigidos al mercado indonesio. El repositorio ocupa 0,5 GB y las metricas declaradas no estan verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, IndoBERT p1) |
| Parametros totales | 124.443.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (maximo arquitectonico); entrenado con max_length 256 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers/BERT, pero no se documenta) |
| Idiomas soportados | Indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto (3 clases: positive, neutral, negative) |
| Modelo base | indobenchmark/indobert-base-p1 |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, atencion multi-cabeza, embeddings posicionales aprendidos) heredado de IndoBERT p1, que fue entrenado desde cero con corpus en indonesio. Sobre esa base, el autor ha anadido una cabeza de clasificacion de secuencia para tres clases y ha realizado un fine-tuning supervisado sobre la particion de entrenamiento de SmSA (11.000 textos), seleccionando el checkpoint segun macro-F1 en validacion (1.260 ejemplos) y reportando el resultado final sobre el split de test etiquetado (500 ejemplos).

Los hiperparametros documentados son: learning rate 2e-5, batch size 32, 5 epocas, scheduler lineal con 10 % de warmup, weight decay 0,01, longitud maxima 256, precision bf16 y semilla 42. El entrenamiento se ejecuto en una GPU NVIDIA L4 de Google Colab. No se documenta uso de RLHF, DPO ni tecnicas de aumentacion de datos; el ajuste es un fine-tuning supervisado clasico con seleccion de checkpoint por validacion (epoca 3 como mejor checkpoint). No hay innovaciones arquitectonicas destacables: el valor esta en el ajuste de dominio y en la reproducibilidad del pipeline, cuyo codigo se publica en GitHub.

## Capacidades

- Clasificacion de sentimiento en indonesio en tres clases: positivo, neutro y negativo.
- Salida de probabilidades por clase mediante la pipeline `text-classification` de transformers.
- Procesamiento de textos de resena y comentarios en registro formal a casual, que es la distribucion dominante de SmSA.
- Inferencia por lotes con `pipeline` o directamente con `AutoModelForSequenceClassification`.
- Compatibilidad con Text Embeddings Inference y endpoints de Hugging Face (segun los tags del repositorio).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue: no; solo indonesio.

## Casos de uso

- Analisis de resenas de producto: clasificar resenas de e-commerce en positivo/neutro/negativo para calcular ratios de satisfaccion y detectar productos con problemas recurrentes. Adecuado por su coste de inferencia bajo y su ajuste especifico al dominio de resenas.
- Monitorizacion de reputacion en redes y foros: procesar comentarios de usuarios en indonesio y agregar sentimiento por marca o campana. La ventana de 256 tokens cubre la mayoria de comentarios y resenas.
- Enrutamiento de tickets de soporte: usar la clase negativa como senal para priorizar tickets de atencion al cliente y derivarlos a colas de escalado.
- Analisis de encuestas abiertas (NPS, CSAT): clasificar respuestas de texto libre en indonesio y cruzar el sentimiento con la puntuacion numerica para detectar incoherencias.
- Moderacion de contenido y deteccion de toxicidad indirecta: como senal auxiliar, marcar comentarios negativos para revision humana, sin sustituir a un clasificador especifico de toxicidad.
- Filtrado y etiquetado de datasets: preetiquetar grandes volumenes de texto indonesio para entrenar o evaluar otros modelos, aprovechando el throughput alto de un BERT base en GPU consumer.
- Investigacion en PLN indonesio: linea base reproducible para comparar tecnicas de fine-tuning sobre SmSA, dado que se publican hiperparametros, semilla y codigo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Dataset: IndoNLU SmSA, split test (500 ejemplos).

| Metrica | Validacion (1.260) | Test (500) |
|---|---:|---:|
| Accuracy | 94,29 | 92,00 |
| Macro-Precision | 92,40 | 92,50 |
| Macro-Recall | 91,83 | 88,12 |
| Macro-F1 | 92,04 | 89,74 |

F1 por clase en test: positivo 93,78; neutro 81,29; negativo 94,15. La clase neutra es la mas dificil (recall 71,6 %) y representa aproximadamente el 10 % de los datos de entrenamiento, motivo por el que el autor usa macro-F1 como metrica principal. No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos (124 M de parametros) mas activaciones; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en bf16/fp16: aproximadamente 0,25 GB de pesos; cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), T4, RTX 3060/4060 o superiores; tambien A100/H100 para despliegues de alto throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para volumenes moderados.
- Opciones de despliegue: transformers (`pipeline`), Text Embeddings Inference (tag del repo), endpoints de Hugging Face; tambien es exportable a ONNX o cuantizable, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo, se espera un throughput de miles de ejemplos por segundo en GPU y de decenas a cientos por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indobert-base-p1-finetuned-smsa | 124,4 M | 512 (entrenado a 256) | Sentimiento 3 clases (indonesio) | MIT | Hugging Face |
| indobenchmark/indobert-base-p1 | 124,4 M | 512 | Modelo base (MLM) | no disponible en la informacion | Hugging Face |
| indobenchmark/indobert-lite-base-p1 | no disponible | no disponible | Modelo base (MLM) | no disponible en la informacion | Hugging Face |
| mBERT (bert-base-multilingual-cased) | 177,9 M | 512 | Modelo base multilingue | no disponible en la informacion | Hugging Face |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la informacion proporcionada; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Dominio acotado: SmSA se compone mayoritariamente de resenas y comentarios; se espera una caida de rendimiento en textos legales, tecnicos, medicos o conversacionales alejados de ese registro.
- Slang intenso, code-mixing (indonesio-ingles, indonesio-regional), lenguas regionales y sarcasmo degradan la precision segun el propio autor.
- La clase neutra es la mas debil: F1 de 81,29 y recall de 71,6 % en test, con solo ~10 % de los ejemplos de entrenamiento. En produccion conviene revisar los casos neutros o ajustar umbrales.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si hay riesgo de clasificaciones erroneas con alta confianza en entradas fuera de dominio.
- Sesgos: no se documenta analisis de sesgos por demografia, region o registro; el modelo hereda los sesgos de IndoBERT p1 y de SmSA.
- Licencia MIT permite uso comercial, pero el modelo base IndoBERT p1 no incluye una licencia explicita en la informacion disponible; conviene verificar los terminos del modelo base antes de un despliegue comercial.
- No apto para otras tareas de PLN (NER, QA, resumen) sin fine-tuning adicional.
- Metricas declaradas por el autor y no verificadas de forma independiente; el test tiene solo 500 ejemplos, por lo que la incertidumbre estadistica de las cifras es apreciable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zackyalgiffari/indobert-base-p1-finetuned-smsa
- Modelo base IndoBERT p1: https://huggingface.co/indobenchmark/indobert-base-p1
- Codigo de entrenamiento: https://github.com/zackyalgiffari/indobert-base-p1-finetuned-smsa
- Benchmark IndoNLU: https://github.com/IndoNLP/indonlu
