# Vandita/QuantizedSarcBERT-static-v2

## Resumen

QuantizedSarcBERT-static-v2 es un modelo de clasificación de texto especializado en la detección de sarcasmo, desarrollado por Vandita como una versión cuantizada a INT8 en formato ONNX del modelo BERT afinado `Vandita/Bert-finetuned-Sarc`. Su objetivo principal es ofrecer inferencia eficiente en CPU sin sacrificar de forma significativa la precisión, manteniendo además una propiedad técnica relevante: la invarianza al padding. Esta característica permite agrupar secuencias de distinta longitud en lotes mixtos sin que la cuantización afecte a las predicciones, algo que no consigue la cuantización dinámica INT8.

El modelo utiliza cuantización estática (QDQ) con calibración percentil sobre 128 muestras del dominio SarcOji, y cuantifica únicamente las operaciones MatMul y Gemm, dejando el resto de capas (Add, LayerNorm, Softmax) en coma flotante. El resultado es un modelo de 183,5 MB (frente a los 437,6 MB del fp32 original) con una latencia p50 de 29,04 ms en CPU x86 de un solo hilo. Está orientado a entornos de producción donde el rendimiento en CPU y la estabilidad de las predicciones son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (modelo base: `Vandita/Bert-finetuned-Sarc`) |
| Parámetros totales | no disponible (el tamaño fp32 de 437,6 MB sugiere BERT-base, ~110M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantización | INT8 estática (QDQ, per-channel en pesos), referencia FP32 |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_int8_static.onnx) |

## Arquitectura y entrenamiento

El modelo parte de un BERT afinado para detección de sarcasmo (binario), entrenado probablemente con el dataset SarcOji, que incluye muestras con emojis. Sobre este modelo base se aplica una cuantización estática post-entrenamiento (PTQ) en formato ONNX QDQ. La calibración se realiza con el método `percentile` sobre 128 muestras del dominio SarcOji, con padding idéntico al que se usará en producción. Se cuantizan exclusivamente las operaciones MatMul y Gemm, donde se concentra el coste computacional de BERT, mientras que las capas de normalización y activación permanecen en float para preservar la precisión. El modelo se exporta con atención eager, ejes dinámicos de batch y secuencia, y opset 17.

La innovación técnica destacada es la invariancia de padding: al fijar las escalas de activación en tiempo de calibración, las posiciones de padding no alteran el rango de cuantización de los tokens reales. Esto permite el batching de secuencias de distinta longitud sin degradación, algo que la cuantización dinámica PTQ no logra.

## Capacidades

- Clasificación binaria de sarcasmo en texto (probabilidad de que un mensaje sea sarcástico).
- Soporte de emojis como parte del texto de entrada (el dataset de entrenamiento los incluye).
- Inferencia en CPU con bajo uso de memoria (183,5 MB en INT8).
- Batching seguro con padding: el modelo es invariante a la longitud de secuencia en lotes mixtos.
- Compatible con el ecosistema Hugging Face a través de `ORTModelForSequenceClassification`.

## Casos de uso

- Moderación de comentarios en redes sociales: clasifica si una publicación o respuesta es sarcástica para priorizar revisión humana o etiquetado automático.
- Análisis de sentimiento en reviews de productos: el sarcasmo distorsiona el análisis de sentimiento estándar; este modelo permite corregir la polaridad en comentarios sarcásticos.
- Asistentes de atención al cliente: detectar sarcasmo en quejas de usuarios para derivar la conversación a un agente humano con contexto.
- Monitorización de marca: análisis de menciones en foros y redes para identificar críticas irónicas que de otro modo pasarían desapercibidas.
- Enriquecimiento de datasets: etiquetado automático de corpus para entrenar otros modelos con mejor comprensión de la ironía.
- Despliegue en entornos con recursos limitados: por su tamaño reducido y latencia baja en CPU, puede integrarse en servidores sin GPU o en edge computing.

## Benchmarks y rendimiento

**SarcOjiTest1**

| Variante | Accuracy | Precision | Recall | F1 | MCC | ROC-AUC |
|---|---|---|---|---|---|---|
| fp32 (original) | 0,6605 | 0,7027 | 0,6143 | 0,6555 | 0,3266 | 0,7135 |
| INT8 estático (este modelo) | 0,6507 | 0,6842 | 0,6235 | 0,6524 | 0,3041 | 0,7040 |

**SarcOjiTest2**

| Variante | Accuracy | Precision | Recall | F1 | MCC | ROC-AUC |
|---|---|---|---|---|---|---|
| fp32 (original) | 0,7124 | 0,4488 | 0,6635 | 0,5355 | 0,3518 | 0,7419 |
| INT8 estático (este modelo) | 0,6990 | 0,4328 | 0,6603 | 0,5229 | 0,3317 | 0,7417 |

**Rendimiento en CPU x86 (un solo hilo, batch de 1)**

| Variante | p50 (ms) | p95 (ms) | Tamaño (MB) |
|---|---|---|---|
| fp32 | 67,95 | 90,32 | 437,6 |
| INT8 estático | 29,04 | 52,28 | 183,5 |

La degradación de rendimiento respecto al modelo fp32 es mínima: la pérdida de F1 en SarcOjiTest1 es de 0,0031 y en SarcOjiTest2 de 0,0126, con una reducción de latencia de más de 2 veces.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para CPU x86; requiere alrededor de 183,5 MB de RAM para el peso en INT8.
- No requiere GPU, pero puede ejecutarse en cualquier dispositivo con CPU moderna (x86 o ARM, aunque las mediciones son solo para x86).
- Despliegue recomendado con ONNX Runtime, usando `ORTModelForSequenceClassification` de Hugging Face Optimum.
- Para batch de 1 en CPU x86 de un solo hilo: latencia p50 de 29 ms, p95 de 52 ms. Con batching mixto, la latencia puede variar pero el modelo mantiene exactitud.
- No se han reportado mediciones en GPU; el formato ONNX permite ejecución en GPU si se desea, pero no es el objetivo.

## Comparativa con modelos similares

No hay datos disponibles de benchmarks comparativos con otros modelos de detección de sarcasmo en la información proporcionada. Como referencia interna, se compara con su versión fp32:

| Modelo | Parámetros | Formato | F1 (SarcOjiTest1) | F1 (SarcOjiTest2) | Latencia p50 (ms) | Licencia |
|---|---|---|---|---|---|---|
| QuantizedSarcBERT-static-v2 | no disponible | ONNX INT8 | 0,6524 | 0,5229 | 29,04 | Apache-2.0 |
| Bert-finetuned-Sarc (fp32) | no disponible | PyTorch | 0,6555 | 0,5355 | 67,37 | Apache-2.0 |

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el dominio SarcOji, que incluye emojis y texto informal; puede perder precisión en otros dominios o registros lingüísticos.
- Sesgos inherentes a BERT y al dataset de entrenamiento: puede tener rendimiento desigual en distintos dialectos del inglés o en contextos culturales específicos.
- Riesgo de alucinación o clasificación incorrecta en textos ambiguos o con sarcasmo muy sutil; la precisión en el test SarcOjiTest1 es de 0,68, lo que implica un 32% de falsos positivos.
- La cuantización estática fija las escalas de activación en la calibración; si se cambia la distribución de los datos de entrada de forma drástica, el rendimiento puede degradarse.
- Solo soporta inglés; no hay soporte multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es una solución completa: requiere integración con un tokenizador y un pipeline de clasificación.

## Enlaces

- [Hugging Face: Vandita/QuantizedSarcBERT-static-v2](https://huggingface.co/Vandita/QuantizedSarcBERT-static-v2)
- [Modelo base: Vandita/Bert-finetuned-Sarc](https://huggingface.co/Vandita/Bert-finetuned-Sarc)
