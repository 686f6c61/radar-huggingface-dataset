# xzael24/indobert-sentiment-app-reviews

## Resumen

IndoBERT Sentiment - Ulasan Aplikasi es un modelo de clasificación de sentimiento binario (negativo/positivo) para reseñas de la Google Play Store escritas en indonesio. Lo desarrolla el usuario xzael24 como fine-tuning del checkpoint `indolem/indobert-base-uncased`, un BERT base entrenado específicamente para indonesio por el proyecto IndoLEM. El modelo resuelve un problema acotado: clasificar automáticamente reseñas de aplicaciones móviles en dos categorías a partir de etiquetas derivadas de la puntuación de estrellas (1 estrella = negativo, 5 estrellas = positivo).

Arquitectónicamente es un transformer encoder BERT base de 110,5 millones de parámetros, con una cabeza de clasificación de dos clases, y una longitud máxima de entrada de 128 tokens durante el entrenamiento. El contexto nativo de BERT base es de 512 tokens, aunque el modelo se ajustó con secuencias de 128. El repositorio ocupa 0,4 GB y los pesos están en formato safetensors.

Su relevancia es limitada y muy específica: no es un modelo generalista sino un clasificador de dominio con un conjunto de datos pequeño (1.377 reseñas únicas de dos aplicaciones, ClassDojo y PrimaKu) y un rendimiento en test de 0,8986 de accuracy y 0,8942 de macro F1. Resulta útil como referencia para pipelines de análisis de opiniones en indonesio o como base para fine-tuning adicional, pero no compite con modelos generativos multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (IndoBERT) con cabeza de clasificación de 2 clases |
| Parámetros totales | 110.559.746 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens nativos de BERT base; entrenado con max length 128 |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original; admite cuantización estándar de BERT, no documentada por el autor) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `indolem/indobert-base-uncased`, un BERT base (12 capas, 768 de dimensión oculta, 12 cabezas de atención, ~110M de parámetros) preentrenado sobre corpus en indonesio. Sobre él se añade una cabeza de clasificación secuencial para dos etiquetas (Negatif/Positif) y se realiza un fine-tuning supervisado con entropía cruzada ponderada por clase.

El conjunto de datos, tras eliminar duplicados, contiene 1.377 reseñas únicas repartidas en train (1.101), validation (138) y test (138), con partición estratificada por aplicación y etiqueta. La distribución es de 81 negativas y 169 positivas en ClassDojo, y 477 negativas y 650 positivas en PrimaKu. Las etiquetas se derivan automáticamente de la puntuación: 1 estrella = negativo, 5 estrellas = positivo; las reseñas con puntuaciones 2 a 4 se excluyen. El preprocesado incluye casefolding, eliminación de URL, menciones y símbolos, normalización de letras repetidas y de jerga, sin stemming ni eliminación de stopwords para preservar las negaciones.

Los hiperparámetros de entrenamiento son: learning rate 2e-05, batch size 16, hasta 6 épocas con early stopping (patience 2), weight decay 0,01, cross-entropy ponderada por clase y max length 128. El checkpoint final corresponde a la época 2, seleccionada por la menor validation loss. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; es un fine-tuning supervisado clásico de clasificación.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) de texto en indonesio.
- Especializado en reseñas de aplicaciones de Google Play Store, aunque puede aplicarse a texto corto en indonesio de dominio similar.
- Procesamiento de entradas de hasta 128 tokens efectivos en el régimen de entrenamiento (hasta 512 por arquitectura).
- Manejo de texto con jerga, abreviaturas y ruido típico de reseñas móviles gracias al preprocesado y al preentrenamiento en indonesio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al indonesio; no se ha evaluado en otros idiomas.

## Casos de uso

- Monitorización de opiniones en Google Play Store: clasificar en lote reseñas de aplicaciones en indonesio para calcular la proporción de sentimiento negativo y positivo por versión o por periodo, usando el modelo como clasificador en un pipeline de ingesta.
- Alertas de reputación: detectar picos de reseñas negativas en tiempo casi real y disparar avisos al equipo de producto o soporte, dado el bajo coste computacional de un BERT base.
- Priorización de tickets de soporte: etiquetar automáticamente comentarios de usuarios en indonesio para enrutar los negativos a atención al cliente y los positivos a marketing.
- Análisis comparativo entre aplicaciones: aplicar el modelo a reseñas de apps del mismo sector en indonesio para comparar la percepción de usuarios, con la cautela de que el modelo se entrenó solo con dos aplicaciones.
- Generación de datasets etiquetados: usar el modelo para preetiquetar grandes volúmenes de reseñas y revisar manualmente solo los casos de baja confianza, acelerando la anotación.
- Investigación en PLN indonesio: servir como baseline de clasificación de sentimiento en trabajos académicos que comparen arquitecturas sobre el mismo corpus.
- Filtrado de contenido en comunidades: clasificar comentarios de usuarios en foros o redes en indonesio para moderar tono negativo, siempre con supervisión humana.

## Benchmarks y rendimiento

Resultados en el conjunto de test (n = 138), según la model card:

| Modelo | Accuracy | Macro F1 |
|---|---|---|
| TF-IDF + LinearSVC | 0,8768 | 0,8726 |
| TF-IDF + Naive Bayes | 0,8986 | 0,8948 |
| IndoBERT (fine-tuned) | 0,8986 | 0,8942 |

El accuracy del modelo fine-tuneado es 0,8986 con intervalo de confianza del 95 % de 0,8369 a 0,9386.

Prueba cruzada entre aplicaciones (entrenado en una, evaluado en la otra):

| Escenario | IndoBERT accuracy | TF-IDF + SVM accuracy | n test |
|---|---|---|---|
| classdojo -> primaku | 0,7684 | 0,8270 | 1127 |
| primaku -> classdojo | 0,8560 | 0,8040 | 250 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo no está diseñado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- En fp16 o bf16: alrededor de 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y también en CPU para volúmenes moderados.
- Cabe holgadamente en GPU de consumo, incluida una GTX 1650 o superior, y en entornos sin GPU mediante CPU.
- Opciones de despliegue: Hugging Face Transformers (`AutoModelForSequenceClassification`), ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (aunque para un BERT base de clasificación, Transformers u ONNX suelen ser más eficientes). llama.cpp y Ollama no son adecuados por no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (miles de clasificaciones por segundo por lote en hardware moderno), pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xzael24/indobert-sentiment-app-reviews | 110,5 M | 512 (entrenado a 128) | Clasificación de sentimiento binaria en indonesio | Apache 2.0 | Hugging Face |
| indolem/indobert-base-uncased | ~110 M | 512 | Modelo base de lenguaje en indonesio (no clasificador) | No disponible en la información | Hugging Face |
| TF-IDF + LinearSVC (baseline del autor) | no aplica | no aplica | Clasificación de sentimiento binaria en indonesio | no disponible | No publicado como modelo |
| TF-IDF + Naive Bayes (baseline del autor) | no aplica | no aplica | Clasificación de sentimiento binaria en indonesio | no disponible | No publicado como modelo |

No se dispone de datos sobre otros clasificadores de sentimiento en indonesio comparables en la información proporcionada.

## Limitaciones y advertencias

- Conjunto de datos muy pequeño (1.377 reseñas) y limitado a dos aplicaciones (ClassDojo y PrimaKu); el rendimiento en otros dominios o aplicaciones no está validado.
- Las etiquetas se derivan automáticamente de la puntuación de estrellas, no de anotación humana; las reseñas con puntuaciones 2 a 4 se excluyen, por lo que el modelo no ha visto casos neutrales ni ambiguos.
- Riesgo de error en reseñas sarcásticas, irónicas o ambiguas, como reconoce el propio autor.
- En la prueba cruzada entre aplicaciones, el rendimiento cae notablemente (0,7684 de accuracy en classdojo -> primaku), lo que indica sensibilidad al dominio.
- Posible riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza.
- Limitación idiomática: solo indonesio; no se ha evaluado en malayo ni en otros idiomas cercanos.
- Los datos se recogieron el 2026-11-01 y pueden quedar desactualizados si se vuelven a extraer reseñas.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de reseñas de Google Play Store puede estar sujeta a los términos de servicio de la plataforma; conviene revisar el cumplimiento antes de un uso comercial a gran escala.
- No es un modelo generativo: no debe usarse para tareas de generación de texto, razonamiento ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xzael24/indobert-sentiment-app-reviews
- Modelo base: https://huggingface.co/indolem/indobert-base-uncased
- Proyecto IndoLEM (referencia del modelo base): no disponible en la información proporcionada
- Paper de IndoBERT: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
