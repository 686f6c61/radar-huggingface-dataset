# trellesjc/mbert-amazon-reviews-sentiment-es-en-fr

## Resumen

El modelo `trellesjc/mbert-amazon-reviews-sentiment-es-en-fr` es un clasificador de sentimiento multilingüe afinado a partir de `google-bert/bert-base-multilingual-cased` (mBERT) para reseñas de productos en español, inglés y francés. Lo desarrolla el usuario trellesjc como proyecto académico del reto "Análisis de Opiniones y Síntesis Automatizada Multilingüe", y resuelve una tarea de clasificación de texto en tres clases: negativo, neutro y positivo.

Se trata de un transformer encoder de tipo BERT con 177.855.747 parámetros totales (aproximadamente 178 M), ventana de contexto de 512 tokens posicionales del modelo base, aunque el autor limita la entrada a 128 tokens durante el entrenamiento. El repositorio ocupa 0,7 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es acotada pero clara: ofrece un punto de partida reproducible y ligero para análisis de opiniones multilingüe en dominios de comercio electrónico, con métricas publicadas (accuracy 0,770 y F1 macro 0,740 en test) y una model card que documenta con honestidad sus limitaciones, en particular la debilidad de la clase neutra. No es un modelo de propósito general ni compite con LLM generativos: es un clasificador especializado y de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (mBERT, `bert-base-multilingual-cased`) |
| Parametros totales | 177.855.747 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite posicional de mBERT); entrenado con `max_length = 128` |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un encoder de 178 M es viable cuantizar a int8/fp16 con herramientas estándar) |
| Idiomas soportados | es, en, fr (entrenado y evaluado en estos tres) |
| Licencia | other (uso educativo según el autor; sujeto a los términos del corpus Amazon Reviews) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de la familia BERT, concretamente el checkpoint multilingüe `bert-base-multilingual-cased`, con vocabulario compartido para 104 idiomas y 12 capas. Sobre él se añade una cabeza de clasificación de secuencia con tres etiquetas (`negativo`, `neutro`, `positivo`). El modelo no incorpora mecanismos de decodificación generativa, tool calling ni atención lineal: es un clasificador discriminativo puro.

El entrenamiento parte del corpus `mteb/amazon_reviews_multi`, restringido a es, en y fr y al 10 % de cada split. Las estrellas se mapean a clases (1–2★ negativo, 3★ neutro, 4–5★ positivo) y el conjunto de entrenamiento se balancea por submuestreo dentro de cada idioma hasta 36.279 reseñas, un tercio por clase. La entrada combina título y cuerpo de la reseña, con limpieza conservadora (se preservan puntuación, acentos y emojis), minúsculas y truncado a 128 tokens. Los hiperparámetros son learning rate 2e-5, batch 32, hasta 3 épocas con early stopping, warmup del 10 %, weight decay 0,01 y fp16; se selecciona la época con mejor F1 macro en validación. No se documenta RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto de reseñas de productos.
- Procesamiento multilingüe en español, inglés y francés con un único modelo y una única cabeza de clasificación.
- Manejo de entradas compuestas (título + cuerpo) de hasta 128 tokens efectivos.
- Robustez razonable ante puntuación, acentos y variaciones tipográficas, siempre que se aplique el preprocesamiento documentado (minúsculas y normalización de comillas tipográficas).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión, audio ni generación de texto.
- No es un modelo instructivo: no responde a instrucciones, solo emite etiquetas con puntuación de confianza.

## Casos de uso

- Análisis agregado de opiniones en marketplaces: el modelo permite clasificar lotes de reseñas en es, en y fr para calcular la distribución de sentimiento por producto o categoría, aprovechando su bajo coste de inferencia (178 M de parámetros) frente a alternativas generativas.
- Priorización de reseñas negativas para atención al cliente: filtrar automáticamente reseñas con etiqueta `negativo` y score alto para que el equipo humano las revise primero, reduciendo el tiempo de respuesta en incidencias.
- Monitorización de reputación de marca: procesar de forma periódica el flujo de reseñas de una tienda y generar series temporales de sentimiento por idioma, útil para detectar caídas tras un cambio de producto o de logística.
- Enrutamiento de feedback en pipelines de datos: usar la etiqueta y el score como señal para separar reseñas neutras (que requieren revisión manual por la debilidad documentada de esa clase) de las polarizadas, que el modelo clasifica con F1 de 0,831 y 0,851 respectivamente.
- Investigación académica en análisis de opiniones multilingüe: sirve como baseline reproducible y ligero para comparar técnicas de preprocesamiento, balanceo de clases o fine-tuning en el corpus Amazon Reviews, dado que el autor documenta hiperparámetros y métricas por idioma.
- Extracción de sentimiento en encuestas y formularios abiertos de comercio electrónico: aplicar el clasificador a respuestas de clientes en los tres idiomas soportados para poblar dashboards de satisfacción, siempre con revisión humana en la clase neutra.
- Preetiquetado para anotación humana: generar etiquetas iniciales sobre grandes volúmenes de reseñas y usarlas para acelerar el etiquetado manual posterior, aprovechando el bajo coste de ejecución en CPU o GPU consumer.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (1.500 reseñas):

| Metrica | Valor |
|---|---|
| Accuracy | 0,770 |
| F1 macro | 0,740 |
| F1 negativo | 0,831 |
| F1 neutro | 0,539 |
| F1 positivo | 0,851 |
| F1 macro español | 0,716 |
| F1 macro inglés | 0,764 |
| F1 macro francés | 0,741 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB de pesos más overhead de activaciones; en fp16 o int8 baja a unos 0,35–0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo y solo se justifican por volumen de throughput agregado.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3050, RTX 4060) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, ONNX Runtime, o exportación a GGUF para llama.cpp si se convierte el encoder. vLLM y TGI están orientados a modelos generativos y no son la vía natural para este clasificador.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU con batching, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| trellesjc/mbert-amazon-reviews-sentiment-es-en-fr | 177,9 M | 512 (entrenado a 128) | es, en, fr | other (educativa) | F1 macro 0,740 en test propio; clase neutra débil (F1 0,539) |
| google-bert/bert-base-multilingual-cased | 177,9 M | 512 | 104 | Apache 2.0 | Modelo base sin afinar; no es un clasificador de sentimiento listo para uso |
| nlptown/bert-base-multilingual-uncased-sentiment | ~167 M | 512 | multilingüe | MIT | Clasificador de 1 a 5 estrellas; no equivalente en esquema de 3 clases |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 | multilingüe | MIT | Entrenado en tuits, dominio distinto al de reseñas de producto |

La comparación con alternativas es orientativa: no se dispone de evaluaciones cruzadas en el mismo conjunto de test, por lo que las cifras no son directamente comparables.

## Limitaciones y advertencias

- Clase neutra débil: F1 de 0,539 y tendencia a sobrepredecirla, porque el entrenamiento usó clases balanceadas que no reflejan la distribución real de reseñas.
- Sesgo lingüístico: mejor rendimiento en inglés (0,764) que en francés (0,741) y español (0,716); el español del corpus procede de Amazon España y no se evaluó con variantes latinoamericanas.
- Ruido de etiqueta: las clases derivan de las estrellas, que no siempre reflejan el contenido del texto.
- Distribución artificial: el corpus tiene el mismo número de reseñas por estrella; en datos reales, dominados por 5★, las métricas pueden diferir.
- Emojis: no están en el vocabulario de mBERT y se convierten en `[UNK]`, perdiendo señal habitual en reseñas reales.
- Licencia restrictiva: el autor publica el modelo con fines educativos y remite a los términos del Multilingual Amazon Reviews Corpus; conviene revisar las condiciones antes de cualquier uso comercial.
- Uso previsto limitado: análisis agregado y priorización para revisión humana; no recomendado para decisiones automáticas sobre clientes individuales sin supervisión.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza, especialmente en la clase neutra.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trellesjc/mbert-amazon-reviews-sentiment-es-en-fr
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Dataset: https://huggingface.co/datasets/mteb/amazon_reviews_multi
- Paper del corpus (Keung et al., 2020): https://arxiv.org/abs/2010.02573
