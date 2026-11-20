# tsubu-ai/modernbert-ja-130m-economy-sentiment

## Resumen

modernbert-ja-130m-economy-sentiment es un clasificador de sentimiento económico y empresarial en japonés, desarrollado por tsubu-ai, que asigna a un texto corto una de cinco etiquetas de valoración de la coyuntura: `bad`, `slightly_bad`, `unchanged`, `slightly_good` y `good`. Se obtiene por ajuste fino del modelo base sbintuitions/modernbert-ja-130m, un transformer de arquitectura ModernBERT de 132,4 millones de parámetros, sobre comentarios de la encuesta oficial del Gabinete de Japón (景気ウォッチャー調査, Economy Watchers Survey).

El modelo resuelve un problema concreto: convertir comentarios breves en primera persona sobre ventas, clientes, pedidos, precios o contratación en una señal cuantificable de clima de negocio, sin necesidad de analizadores morfológicos como MeCab. Está pensado para agregar series de sentimiento a partir de notas de prensa, informes diarios o encuestas, y para construir índices de difusión similares a los de la propia encuesta oficial.

Es relevante porque los modelos de sentimiento general en japonés, entrenados sobre reseñas o tuits, rinden mal fuera de dominio en texto económico: en la evaluación del autor, los clasificadores genéricos comparables obtienen en torno a 0,55-0,58 de exactitud en tres clases, frente a 0,745 del modelo especializado. La ventana de contexto, el número de tokens de entrenamiento y los detalles completos de la arquitectura ModernBERT no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), ajustada para clasificación de secuencias |
| Parametros totales | 132.405.765 (132,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenamiento con longitud máxima de 192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY 4.0 (pesos); modelo base MIT; datos de entrenamiento CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, derivado de sbintuitions/modernbert-ja-130m, con una cabeza de clasificación de cinco clases. No requiere segmentación morfológica: el tokenizador es un `PreTrainedTokenizerFast` que procesa directamente el texto japonés. El autor indica compatibilidad probada con transformers 5.23 y que la configuración del tokenizador permite cargar el modelo también en transformers 4.57.

El ajuste fino se realizó sobre 60.000 comentarios muestreados (semilla 0) del tramo 2015-01 a 2024-08 del split de entrenamiento del dataset retarfi/economy-watchers-survey, fusionando las valoraciones «actual» y «futura» y eliminando textos presentes en validación o test. Se entrenó durante 3 épocas con tasa de aprendizaje 5e-5, tamaño de lote 32, longitud máxima de 192 tokens y semilla 0. Los scripts empleados (`prep.py`, `train_classifier.py`, `compare.py`) se citan en la model card. No se documenta uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un clasificador.

## Capacidades

- Clasificación de sentimiento económico en cinco niveles sobre texto japonés corto (mediana de 53 caracteres en el corpus de entrenamiento).
- Detección de la valoración del autor sobre la coyuntura de su negocio: ventas, clientes, pedidos, precios, contratación y perspectivas.
- Funcionamiento sin analizador morfológico externo (sin MeCab ni similares).
- Salida de cinco probabilidades, a partir de las cuales puede calcularse un valor esperado (0 = bad … 4 = good) análogo al índice de difusión de la encuesta oficial.
- Procesamiento por lotes mediante el pipeline `text-classification` de transformers.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Construcción de índices de coyuntura propios: clasificar lotes de comentarios o notas internas y agregar el valor esperado de las cinco probabilidades para obtener una serie mensual comparable al índice de difusión oficial.
- Análisis de informes diarios o semanales de establecimientos: procesar los comentarios de responsables de tienda y detectar deterioro o mejora de la actividad antes de que aparezca en datos de ventas.
- Monitorización de notas de prensa y comunicados de resultados: etiquetar el tono sobre la coyuntura en titulares y párrafos breves, con la advertencia de que el dominio de entrenamiento son comentarios en primera persona y no titulares.
- Procesamiento de encuestas abiertas: codificar respuestas de texto libre de encuestas a empresas en las cinco categorías para su tabulación estadística.
- Señal auxiliar en modelos de previsión económica: incorporar la proporción de comentarios `bad`/`slightly_bad` como variable explicativa en modelos de nowcasting.
- Análisis sectorial o regional: agrupar los comentarios por sector o prefectura y comparar la distribución de etiquetas entre segmentos.
- Filtrado y priorización de alertas: marcar automáticamente los comentarios con valoración negativa extrema para revisión humana en equipos de análisis de mercado.

## Benchmarks y rendimiento

Evaluación sobre 5.000 comentarios de test del propio dataset, con partición temporal estricta (entrenamiento 2015-01 a 2024-08; test 2025-10 a 2026-10; todos los meses de test posteriores a los de entrenamiento), semilla 0 y las mismas filas para todos los modelos. La métrica de 3 clases agrupa `bad`+`slightly_bad` / `unchanged` / `slightly_good`+`good`.

| Modelo | Parámetros | Exactitud / macro-F1 (5 clases) | Exactitud / macro-F1 (3 clases) |
|---|---|---|---|
| tsubu-ai/modernbert-ja-130m-economy-sentiment (este) | 132,4 M | 0,679 / 0,504 | 0,745 / 0,753 |
| tsubu-ai/modernbert-ja-70m-economy-sentiment | 70,2 M | 0,677 / 0,513 | 0,743 / 0,751 |
| koheiduck/bert-japanese-finetuned-sentiment | 110,6 M | no disponible | 0,578 / 0,591 |
| christian-phu/bert-finetuned-japanese-sentiment | 111,2 M | no disponible | 0,547 / 0,541 |
| Línea base «siempre unchanged» | — | 0,468 / no disponible | 0,468 / no disponible |

Los dos modelos de sentimiento general en japonés se entrenaron con otros datos (reseñas y tuits) y solo tienen tres clases, por lo que su uso aquí es fuera de dominio. El autor señala además que la exactitud en cinco niveles tiene un techo bajo, porque la etiqueta es el juicio global del encuestado y una misma frase puede quedar en niveles contiguos según la persona.

## Requisitos de hardware

- Inferencia en CPU perfectamente viable: con 132,4 M de parámetros y pesos safetensors en fp32, el modelo ocupa aproximadamente 0,5 GB, el tamaño del repositorio.
- En fp16 el peso ronda los 0,26 GB; en int8, unos 0,13 GB, aunque no se documentan cuantizaciones publicadas.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4060 o superiores; la VRAM necesaria es inferior a 2 GB incluso con lotes grandes.
- GPU de datacenter (A100, H100, L4, T4) innecesarias para el tamaño del modelo, aunque útiles para alto throughput por lotes.
- Despliegue mediante transformers (`pipeline("text-classification")`), text-embeddings-inference y endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama, y el formato safetensors no es directamente compatible con llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (3 clases) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsubu-ai/modernbert-ja-130m-economy-sentiment | 132,4 M | no disponible (entrenado a 192 tokens) | 0,745 acc / 0,753 macro-F1 | CC BY 4.0 | Hugging Face, transformers |
| tsubu-ai/modernbert-ja-70m-economy-sentiment | 70,2 M | no disponible | 0,743 acc / 0,751 macro-F1 | no disponible | Hugging Face |
| koheiduck/bert-japanese-finetuned-sentiment | 110,6 M | no disponible | 0,578 acc / 0,591 macro-F1 | no disponible | Hugging Face |
| christian-phu/bert-finetuned-japanese-sentiment | 111,2 M | no disponible | 0,547 acc / 0,541 macro-F1 | no disponible | Hugging Face |

La comparación con la variante de 70 M es especialmente informativa: con casi la mitad de parámetros obtiene métricas prácticamente idénticas, lo que sugiere que el techo lo marca la tarea y el etiquetado, no la capacidad del modelo. Frente a los clasificadores genéricos, la especialización en dominio aporta entre 15 y 20 puntos de exactitud en tres clases.

## Limitaciones y advertencias

- Dominio restringido: comentarios breves en primera persona de responsables de comercio, personal de empresa y agencias de empleo; titulares de prensa, informes de analistas y redes sociales quedan fuera y deben validarse sobre datos propios.
- Evalúa condiciones de negocio, no emoción general: frases como «me encantó esta película» están fuera de alcance.
- Las clases extremas son raras en la encuesta (`good` en torno al 2 %, `bad` entre el 6 y el 9 %), por lo que se predicen con menos fiabilidad que las tres centrales.
- Riesgo de deriva temporal: el periodo cubre la COVID-19 y la inflación reciente, y la formulación sobre shocks futuros puede leerse peor.
- El techo de exactitud en cinco clases es bajo por ambigüedad intrínseca de la etiqueta; conviene usar la versión de tres clases o el valor esperado para decisiones sensibles.
- No es asesoramiento de inversión ni previsión de mercado; el autor lo indica explícitamente.
- Licencia CC BY 4.0 en los pesos: permite uso comercial con atribución. El modelo base es MIT y los datos de entrenamiento son CC BY 4.0 (Gabinete de Japón vía retarfi/economy-watchers-survey); el Gabinete no respalda el modelo.
- Sin datos publicados de sesgos demográficos o geográficos; la composición de la encuesta condiciona los sesgos del clasificador.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas confiadas en textos fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsubu-ai/modernbert-ja-130m-economy-sentiment
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Dataset de entrenamiento: https://huggingface.co/datasets/retarfi/economy-watchers-survey
- Paper de referencia del dataset: https://arxiv.org/abs/2407.14727 (Suzuki & Sakaji, 2024)
- Variante de 70 M: https://huggingface.co/tsubu-ai/modernbert-ja-70m-economy-sentiment
- Modelo comparativo general: https://huggingface.co/koheiduck/bert-japanese-finetuned-sentiment
- Modelo comparativo general: https://huggingface.co/christian-phu/bert-finetuned-japanese-sentiment
