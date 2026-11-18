# Victorr73/ro-sentiment-bert

## Resumen

`Victorr73/ro-sentiment-bert` es un modelo de clasificación de sentimiento en rumano obtenido por fine-tuning del checkpoint `dumitrescustefan/bert-base-romanian-cased-v1`, un BERT base entrenado específicamente para rumano por Stefan Dumitrescu. El modelo resuelve una tarea acotada: clasificar reseñas de productos y películas en rumano como positivas o negativas (clasificación binaria). Lo publica el usuario Victorr73 bajo licencia MIT, con un tamaño de repositorio de 0,5 GB y 124.442.882 parámetros en formato safetensors.

Su relevancia es práctica más que arquitectónica: el rumano es un idioma con poca cobertura en modelos de sentimiento listos para usar, y este checkpoint ofrece una alternativa afinada y ligera (BERT base, 124M de parámetros) frente a modelos multilingües grandes. Sobre un conjunto de test de 2.048 reseñas reporta una accuracy de 0,8994 y un macro F1 de 0,8978, superando en unos 4,4 puntos de accuracy a un baseline TF-IDF + regresión logística (0,8550 / 0,8525).

Se trata de un modelo pequeño y especializado, pensado para inferencia barata en CPU o GPU consumer, no para generación de texto ni razonamiento general. Su contexto efectivo está limitado a 128 tokens por el truncado usado en el entrenamiento, lo que condiciona fuertemente los casos de uso válidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas, hidden 768, 12 cabezas de atención) |
| Parametros totales | 124.442.882 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (max_length usado en entrenamiento); límite arquitectónico de BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16 estándar) |
| Idiomas soportados | rumano (ro) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | clasificación de texto binaria (positivo/negativo) |
| Modelo base | dumitrescustefan/bert-base-romanian-cased-v1 |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar: encoder transformer de 12 capas con atención bidireccional completa, dimensión oculta 768 y 12 cabezas de atención, sobre el que se añade una cabeza de clasificación de secuencia (pooler + capa lineal de dos salidas). El checkpoint de partida, `dumitrescustefan/bert-base-romanian-cased-v1`, es un BERT base entrenado desde cero con corpus rumanos, lo que aporta un tokenizador y unos embeddings adaptados a la morfología y el vocabulario del rumano.

El fine-tuning se realizó sobre RoSent, un conjunto de reseñas de productos y películas en rumano, con 8.000 ejemplos de entrenamiento. La configuración reportada es de 2 épocas, learning rate 2e-5, batch size 32, longitud máxima de 128 tokens y una única GPU T4. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; es un ajuste supervisado clásico de clasificación. Tampoco se detalla la composición exacta del split de validación ni si hubo búsqueda de hiperparámetros más allá de esos valores.

Una particularidad relevante del pipeline de datos: según la model card, los textos de entrenamiento están en minúsculas y sin diacríticos. Esto afecta directamente a la distribución de entrada esperada y a la robustez del modelo ante texto con mayúsculas y diacríticos rumanos (ă, â, î, ș, ț).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en rumano sobre reseñas de productos y películas.
- Inferencia rápida y de bajo coste: 124M de parámetros permiten ejecución en CPU con latencias de milisegundos por muestra.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Manejo de texto conversacional o de opinión de longitud corta y media (hasta 128 tokens).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- No es multilingüe: está entrenado y evaluado únicamente en rumano.
- No dispone de modo "thinking" ni de salidas estructuradas más allá de la etiqueta y su score.

## Casos de uso

- Análisis de reseñas de e-commerce en rumano: clasificar automáticamente comentarios de producto en positivos o negativos para agregar métricas de satisfacción por SKU, usando el pipeline de `transformers` y truncando a 128 tokens. Adecuado por su accuracy de 0,8994 en el dominio de reseñas.
- Moderación y triaje de opiniones en plataformas rumanas: prefiltrar comentarios negativos para revisión humana, aprovechando el bajo coste de inferencia en CPU y su despliegue sencillo.
- Monitorización de reputación de marca: procesar en lote reseñas y menciones cortas en rumano y generar series temporales de sentimiento por producto o canal.
- Enrutamiento de tickets de soporte: clasificar la opinión del cliente en el texto inicial del ticket para priorizar casos negativos hacia agentes humanos, siempre que el texto no supere los 128 tokens.
- Análisis de opiniones de películas y series: el modelo fue entrenado también con reseñas de cine, por lo que puede usarse para agregar sentimiento de críticas cortas; conviene trocear reseñas largas porque el truncado a 128 tokens es la principal fuente de error reportada.
- Etiquetado asistido para construcción de datasets: usar el modelo como preetiquetador de grandes volúmenes de reseñas rumanas y revisar manualmente solo los casos de baja confianza (scores cercanos a 0,5).
- Baseline en experimentos de NLP en rumano: punto de partida ligero y reproducible (MIT) para comparar contra modelos multilingües o arquitecturas mayores en tareas de sentimiento.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre un conjunto de test de 2.048 reseñas:

| Modelo | Accuracy | Macro F1 |
|---|---|---|
| TF-IDF + Logistic Regression (baseline) | 0,8550 | 0,8525 |
| Victorr73/ro-sentiment-bert | 0,8994 | 0,8978 |

No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de sentimiento en rumano.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124M de parámetros) y en torno a 0,25 GB en fp16; con batch pequeño cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor entrenó en una T4; para inferencia es suficiente cualquier GPU con 2 GB o más (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no aprovecha GPU de gama alta por su tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, y también en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline de text-classification), TorchServe o FastAPI con PyTorch, ONNX Runtime para inferencia optimizada en CPU, y exportación a GGUF para llama.cpp si se convierte el checkpoint (no se publica GGUF en el repo). vLLM y TGI están orientados a generación y no son la vía natural para este clasificador.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Victorr73/ro-sentiment-bert | 124M | 128 tokens (entrenamiento) | BERT base afinado en rumano | MIT | Hugging Face |
| dumitrescustefan/bert-base-romanian-cased-v1 | ~124M | 512 tokens | BERT base en rumano sin afinar | no disponible en la información | Hugging Face |
| Baseline TF-IDF + Logistic Regression | no aplica | sin límite fijo | Bolsa de palabras + clasificador lineal | no aplica | Implementación propia |
| Modelos multilingües tipo XLM-R base | ~278M | 512 tokens | Transformer multilingüe | no disponible en la información | Hugging Face |

La comparación con XLM-R u otros modelos multilingües no está respaldada por resultados publicados en la información disponible; se incluye solo como referencia de categoría. Frente al baseline TF-IDF, la ventaja medida es de +4,4 puntos de accuracy y +4,5 puntos de macro F1 en el test del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con reseñas de productos y películas, el modelo puede comportarse de forma errática en otros dominios (redes sociales, texto legal, soporte técnico).
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí puede producir etiquetas erróneas con alta confianza en textos ambiguos.
- Limitación de contexto: el truncado a 128 tokens provoca que las reseñas largas donde la opinión aparece al final se clasifiquen mal; es la principal fuente de error reportada por el autor.
- Desajuste de preprocesado: el entrenamiento usó texto en minúsculas y sin diacríticos, mientras que el ejemplo de uso de la model card incluye mayúsculas y diacríticos; conviene probar ambas normalizaciones antes de desplegar.
- Dificultades con opiniones mixtas e ironía, según la propia model card.
- Limitación de idioma: solo rumano; no se ha evaluado en otros idiomas.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `dumitrescustefan/bert-base-romanian-cased-v1` debe verificarse por separado, ya que su licencia no se detalla en la información disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni evaluación por terceros; tratarlo como checkpoint experimental.
- Sin datos publicados sobre calibración de probabilidades ni sobre rendimiento en dominios distintos del de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Victorr73/ro-sentiment-bert
- Modelo base: https://huggingface.co/dumitrescustefan/bert-base-romanian-cased-v1
- Documentación de `transformers` para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Paper de BERT (referencia arquitectónica): https://arxiv.org/abs/1810.04805
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales específicos de este modelo.
