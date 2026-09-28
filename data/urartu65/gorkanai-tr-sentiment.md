# Urartu65/gorkanai-tr-sentiment

## Resumen

gorkanai-tr-sentiment es un modelo de clasificación de texto para análisis de sentimiento en turco, desarrollado por el usuario Urartu65 dentro del proyecto educativo gorkanai. Se trata de un fine-tuning de `dbmdz/bert-base-turkish-cased` sobre reseñas reales de productos de comercio electrónico, con tres clases de salida: negativo, neutro y positivo. Cuenta con 110.619.651 parámetros, encaja en la categoría de modelos BERT-base y su repositorio ocupa 0,4 GB.

El problema que aborda es concreto: la mayoría de los modelos de sentimiento en turco son binarios (positivo/negativo), lo que fuerza clasificaciones erróneas en comentarios neutros como "el producto llegó hoy" o "el paquete estaba bien". Este modelo introduce una clase neutra explícita y aplica una corrección de sesgo (+3,00) sobre el logit neutro para compensar el desbalance extremo de esa clase durante el entrenamiento.

Es relevante ahora porque demuestra una metodología reproducible y documentada (confident learning para limpiar etiquetas ruidosas, active learning para seleccionar ejemplos neutros y ajuste de sesgo por macro-F1) aplicada a un idioma con recursos limitados como el turco. Licencia MIT, pesos en safetensors y uso directo con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, `dbmdz/bert-base-turkish-cased`) |
| Parametros totales | 110.619.651 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (BERT-base); el ejemplo de uso trunca a 128 |
| Tipos de cuantizacion | no publicados en la model card; al ser safetensors FP32 se puede cuantizar a FP16, INT8 o INT4 con herramientas estandar de Transformers/ONNX |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Numero de clases | 3 (negatif, notr, pozitif) |
| Pipeline | text-classification |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un BERT-base con cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) y tres etiquetas de salida. Parte de los pesos de `dbmdz/bert-base-turkish-cased`, un checkpoint BERT entrenado específicamente sobre corpus en turco, lo que aporta un tokenizador y un vocabulario ajustados a la morfología aglutinante del idioma. La longitud máxima de entrada viene dada por las posiciones del BERT original (512 tokens).

El entrenamiento se realizó sobre `fthbrmnby/turkish_product_reviews` (~233.000 reseñas reales, originalmente positivas/negativas). Del conjunto desbalanceado se tomaron aproximadamente 17.000 ejemplos y se limpiaron las etiquetas con confident learning (paper arXiv:1911.00068). Para la clase neutra se etiquetaron manualmente 1000 reseñas cortas, seleccionadas mediante active learning. No se menciona uso de RLHF ni DPO; el ajuste fino es supervisado. La innovación técnica destacada no está en la arquitectura sino en el post-procesado: sumar un sesgo fijo de +3,00 al logit de la clase neutra antes del softmax, valor elegido sobre el conjunto de validación maximizando macro-F1, porque el neutro se aprendió con muchos menos ejemplos. Sin ese sesgo, el modelo tiende a clasificar reseñas neutras como positivas o negativas. El autor también aplica una normalización de minúsculas específica del turco (`I`→`ı`, `İ`→`i`) antes de tokenizar.

## Capacidades

- Clasificación de sentimiento en turco en tres clases: negativo, neutro y positivo.
- Manejo de texto informal de reseñas de producto (e-commerce).
- Salida probabilística por clase (softmax con sesgo aplicado), útil para umbralizar o para pasar a revisión humana.
- Funciona con entradas cortas (el ejemplo usa `max_length=128`) y con reseñas más largas hasta 512 tokens.
- Integración directa con `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No multilíngüe: solo turco.
- No dispone de visión ni audio.
- No dispone de modo "thinking" ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderación y triaje de reseñas en marketplaces turcos: clasificar automáticamente cada reseña entrante como positiva, negativa o neutra para priorizar la atención al cliente o disparar alertas ante reseñas muy negativas.
- Análisis de voz del cliente: agregar el sentimiento de miles de comentarios de producto para construir cuadros de mando de satisfacción por categoría o vendedor.
- Enrutado de tickets de soporte: las reseñas negativas pueden derivarse a un equipo humano mientras que las neutras se agrupan para análisis de calidad.
- Detección de reseñas problemáticas a escala: el umbral sobre la probabilidad permite marcar casos dudosos para revisión manual, dado que la precisión de la clase neutra es limitada.
- Investigación en PLN para turco: sirve como baseline reproducible con licencia MIT para comparar metodologías de limpieza de etiquetas y corrección de sesgo de clase.
- Filtrado previo en pipelines de minería de opiniones: reducir el volumen de comentarios neutros antes de aplicar análisis más costosos (topic modeling, extracción de aspectos).
- Monitorización de reputación de marca: procesar periódicamente el flujo de reseñas por lotes (batch) en CPU o GPU pequeña y detectar picos de negatividad.

## Benchmarks y rendimiento

Evaluación del autor sobre 200 reseñas cortas etiquetadas a mano (104 positivas, 74 negativas, 22 neutras), nunca vistas durante el entrenamiento:

| Modelo / configuracion | Exactitud | Macro-F1 | Neutro P/R | Negativo P/R | Positivo P/R |
|---|---|---|---|---|---|
| Baseline: modelo binario + umbral "no estoy seguro" del 95 % | 0.825 | 0.746 | 0.38 / 0.64 | 0.87 / 0.84 | 0.97 / 0.86 |
| gorkanai-tr-sentiment (bias +3.00) | 0.870 | 0.808 | 0.58 / 0.68 | 0.87 / 0.88 | 0.95 / 0.90 |

No hay resultados publicados en la model card para benchmarks estandar tipo MMLU, HumanEval o GSM8K, que además no aplican a un clasificador de sentimiento. Los únicos datos de rendimiento son los de la tabla anterior, medidos con exactitud y macro-F1.

## Requisitos de hardware

- Inferencia en FP32: ~440 MB de pesos en memoria.
- Inferencia en FP16: ~220 MB.
- Cuantización INT8: ~110 MB; INT4: ~55 MB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, e incluso GPUs integradas. También funciona en CPU sin problema para inferencia por lotes moderados.
- Para lotes pequeños (32-128 secuencias de 128 tokens), una CPU moderna o una GPU de gama media son suficientes; no se requieren A100 ni H100 salvo en escenarios de muy alto throughput.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime, TorchScript; también puede servirse con FastAPI o con `text-classification` de HuggingFace Inference Endpoints. No se mencionan pesos GGUF ni compatibilidad con llama.cpp u Ollama (no aplica a BERT).
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| gorkanai-tr-sentiment | 110,6 M | 3 (neg/neu/pos) | tr | MIT | 512 |
| dbmdz/bert-base-turkish-cased | 110 M aprox. | base (sin cabeza) | tr | MIT | 512 |
| XLM-RoBERTa-base (fine-tunes de sentimiento) | ~278 M | variable | multilingue | MIT | 512 |

No se dispone de datos de benchmarks comparativos directos entre este modelo y alternativas de sentimiento en turco dentro de la información proporcionada, más allá del baseline binario incluido por el propio autor. La comparativa de rendimiento entre modelos queda como "no disponible".

## Limitaciones y advertencias

- El modelo fue entrenado solo con reseñas de producto (e-commerce); no se ha evaluado su generalización a otros dominios como noticias, redes sociales o texto legal.
- La clase neutra sigue siendo la más débil: precisión entre 0,58 y 0,73 según la model card, muy por debajo de negativa y positiva.
- Requiere aplicar manualmente un sesgo de +3,00 al logit neutro antes del softmax; si se omite, el modelo sobreclasifica como positivo o negativo. Esto implica que no es "plug-and-play" puro con `pipeline()` sin post-procesado.
- Errores en expresiones idiomáticas o que requieren conocimiento del mundo ("no vale la pena", "por debajo de mis expectativas" cuando se formulan de forma poco literal).
- Sensible a la normalización de minúsculas turca: hay que aplicar `I`→`ı` e `İ`→`i` antes de tokenizar para reproducir el comportamiento esperado.
- Solo turco; no procesa otros idiomas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los sesgos derivados del dataset de reseñas.
- Riesgo de sobreajuste al estilo de las reseñas de producto; puede alucinar/forzar una clase neutra o positiva en textos ambiguos.
- El repo tiene 0 descargas y 1 like en el momento de la consulta: escasa validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urartu65/gorkanai-tr-sentiment
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Repositorio del proyecto: https://github.com/GoGonuldas/gorkanai
- Dataset de entrenamiento: https://huggingface.co/datasets/fthbrmnby/turkish_product_reviews
- Paper de confident learning: https://arxiv.org/abs/1911.00068
