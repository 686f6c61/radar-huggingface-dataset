# tsubu-ai/modernbert-ja-70m-economy-sentiment

## Resumen

`modernbert-ja-70m-economy-sentiment` es un clasificador de sentimiento económico en japonés desarrollado por tsubu-ai. Se trata de un ajuste fino (fine-tuning) del modelo base `sbintuitions/modernbert-ja-70m`, un transformer encoder de arquitectura ModernBERT con 70,2 millones de parámetros. El modelo clasifica textos breves en japonés sobre actividad comercial (ventas, clientela, pedidos, precios, contratación, perspectivas) en cinco niveles de juicio sobre la coyuntura: `bad`, `slightly_bad`, `unchanged`, `slightly_good` y `good`.

El problema que resuelve es concreto: convertir comentarios en lenguaje natural de empresarios y trabajadores en una señal cuantificable de percepción económica, análoga al índice de difusión (DI) de la Encuesta de Observadores de la Economía (景気ウォッチャー調査) del Gabinete del Gobierno de Japón. Esto permite agregar automáticamente sentimiento coyuntural a partir de notas de resultados, noticias, informes internos o encuestas, sin depender de análisis manual ni de modelos de sentimiento genéricos entrenados en reseñas o redes sociales, que rinden peor en este dominio.

Es relevante por su especialización: un modelo pequeño (70M) que supera en el dominio económico a modelos de sentimiento japonés más grandes y de propósito general, y que no requiere instalación de analizadores morfológicos como MeCab. Su licencia permisiva (CC BY 4.0) y su tamaño reducido lo hacen apto para despliegue en producción con coste bajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parámetros totales | 70.152.581 (70,2M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con longitud máxima 192 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY 4.0 (pesos); modelo base MIT; datos CC BY 4.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tarea | clasificación de sentimiento económico (5 clases) |
| Modelo base | sbintuitions/modernbert-ja-70m |
| Dataset de entrenamiento | retarfi/economy-watchers-survey |
| Tamaño del repo | 0,3 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `sbintuitions/modernbert-ja-70m`, un encoder ModernBERT de 70,2M de parámetros. ModernBERT es una arquitectura de encoder transformer que incorpora mejoras como atención con rotación posicional (RoPE), atención alternada local/global y capas sin sesgo, orientadas a mayor eficiencia en secuencias largas. El modelo se emplea aquí como clasificador de secuencia con cinco etiquetas de salida.

El entrenamiento se realizó sobre 60.000 comentarios muestreados (semilla 0) de la parte del split de entrenamiento del dataset `retarfi/economy-watchers-survey` correspondiente al periodo 2015-01 a 2024-08, fusionando los juicios "actual" y "futuro". Se eliminaron los textos que también aparecían en validación o test. Los hiperparámetros fueron 3 épocas, learning rate 5e-5, batch de 32, longitud máxima de 192 tokens y semilla 0. Los scripts empleados son `prep.py`, `train_classifier.py` y `compare.py`. No se documenta uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un clasificador encoder.

## Capacidades

- Clasificación de sentimiento económico en japonés en cinco niveles (`bad`, `slightly_bad`, `unchanged`, `slightly_good`, `good`).
- Procesamiento de texto breve en japonés sin necesidad de analizador morfológico (MeCab u otros).
- Cálculo de una puntuación continua mediante el valor esperado de las cinco probabilidades (0 = bad … 4 = good), análoga al índice de difusión de la encuesta.
- Clasificación de comentarios sobre ventas, clientela, pedidos, precios, contratación y perspectivas.
- Integración con el pipeline `text-classification` de transformers y compatibilidad con text-embeddings-inference y endpoints.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Agregación de sentimiento coyuntural a partir de notas de resultados (決算短信): el modelo clasifica los comentarios de gestión y permite construir un índice de percepción económica por empresa o sector.
- Análisis de noticias económicas: clasificar titulares y párrafos sobre actividad comercial para generar series temporales de sentimiento, aprovechando su especialización en vocabulario de negocio.
- Procesamiento de informes internos y diarios de operaciones (日報): convertir notas de empleados y responsables de tienda en una señal cuantificable de evolución de la actividad.
- Análisis de encuestas abiertas: clasificar respuestas de texto libre en encuestas a empresas y comercios, sustituyendo la codificación manual de cinco niveles.
- Construcción de índices de difusión propios: usar el valor esperado de las cinco probabilidades como puntuación continua para replicar el DI de la Encuesta de Observadores de la Economía sobre fuentes alternativas.
- Monitorización de sentimiento sectorial: procesar grandes volúmenes de comentarios con un modelo de 70M desplegable en CPU o GPU de gama baja, con coste de inferencia reducido.
- Enriquecimiento de bases de datos financieras: etiquetar automáticamente corpus de texto económico en japonés para su uso posterior en investigación o en modelos de análisis.

## Benchmarks y rendimiento

La evaluación utiliza el split temporal del dataset: entrenamiento de 2015-01 a 2024-08 y test de 2025-10 a 2026-10, de modo que todos los meses de test son posteriores a los de entrenamiento. Se emplean 5.000 comentarios de test muestreados con semilla 0, las mismas filas para todos los modelos. La clasificación de 3 clases agrupa `bad`+`slightly_bad` / `unchanged` / `slightly_good`+`good`.

| Modelo | Parámetros | 5 clases acc / macro-F1 | 3 clases acc / macro-F1 |
|---|---|---|---|
| **tsubu-ai/modernbert-ja-70m-economy-sentiment** (este) | 70,2M | 0,677 / 0,513 | 0,743 / 0,751 |
| tsubu-ai/modernbert-ja-130m-economy-sentiment | 132,4M | 0,679 / 0,504 | 0,745 / 0,753 |
| koheiduck/bert-japanese-finetuned-sentiment | 110,6M | – / – | 0,578 / 0,591 |
| christian-phu/bert-finetuned-japanese-sentiment | 111,2M | – / – | 0,547 / 0,541 |
| Siempre `unchanged` (baseline) | – | 0,468 / – | 0,468 / – |

Los dos modelos de sentimiento japonés de propósito general fueron entrenados con otros datos (reseñas y tuits) y solo tienen tres clases (negativo/neutro/positivo), por lo que su uso aquí es fuera de dominio; se incluyen para ilustrar el rendimiento de un modelo genérico aplicado a texto de negocio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con pesos en fp32 el modelo ocupa aproximadamente 0,3 GB, y en fp16 alrededor de 0,15 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es más que suficiente, e incluso modelos integrados pueden servir para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en CPU.
- Opciones de despliegue: pipeline `text-classification` de transformers, text-embeddings-inference (TEI), endpoints compatibles y despliegue estándar con la librería transformers. No se documentan opciones específicas para vLLM, llama.cpp u Ollama (no es un modelo generativo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | 3 clases macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsubu-ai/modernbert-ja-70m-economy-sentiment | 70,2M | no disponible | 0,751 | CC BY 4.0 | Hugging Face |
| tsubu-ai/modernbert-ja-130m-economy-sentiment | 132,4M | no disponible | 0,753 | no disponible | Hugging Face |
| koheiduck/bert-japanese-finetuned-sentiment | 110,6M | no disponible | 0,591 | no disponible | Hugging Face |
| christian-phu/bert-finetuned-japanese-sentiment | 111,2M | no disponible | 0,541 | no disponible | Hugging Face |

El modelo de 70M iguala prácticamente al de 130M de la misma familia (0,751 frente a 0,753 de macro-F1 en 3 clases) con casi la mitad de parámetros, y supera con claridad a los dos modelos de sentimiento japonés de propósito general, que además no están especializados en el dominio económico.

## Limitaciones y advertencias

- Dominio restringido: entrenado con comentarios breves en primera persona de responsables de tienda, personal de empresa y agentes de empleo (mediana de 53 caracteres). Titulares de noticias, informes de analistas y redes sociales son dominios distintos y deben validarse sobre datos propios.
- Juzga condiciones de negocio, no emoción general: "El tifón cerró nuestra tienda tres días" se clasifica como `bad`, mientras que "Me encantó esta película" queda fuera de alcance.
- Las clases extremas `good` (◎) y `bad` (×) son raras en la encuesta (aproximadamente 2% y 6-9%), por lo que se predicen con menor fiabilidad que las tres centrales.
- El techo de precisión en 5 clases es bajo: la etiqueta refleja el juicio global del encuestado y la misma frase puede clasificarse en niveles vecinos por personas distintas (accuracy de 0,677 en 5 clases).
- Deriva lingüística y de precios: el periodo de la encuesta cubre la COVID-19 y la inflación reciente; la formulación sobre shocks futuros puede interpretarse peor.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas fuera de dominio o con textos ambiguos.
- No constituye asesoramiento de inversión ni una previsión de mercado.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución. Los datos de entrenamiento provienen de la Encuesta de Observadores de la Economía del Gabinete del Gobierno de Japón (CC BY 4.0, vía retarfi/economy-watchers-survey); el Gabinete no respalda este modelo. El modelo base es MIT.
- Sesgos no documentados explícitamente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsubu-ai/modernbert-ja-70m-economy-sentiment
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-70m
- Dataset de entrenamiento: https://huggingface.co/datasets/retarfi/economy-watchers-survey
- Paper de referencia del dataset (Suzuki & Sakaji 2024): https://arxiv.org/abs/2407.14727
- Modelo hermano de 130M: https://huggingface.co/tsubu-ai/modernbert-ja-130m-economy-sentiment
- Modelo comparativo general: https://huggingface.co/koheiduck/bert-japanese-finetuned-sentiment
- Modelo comparativo general: https://huggingface.co/christian-phu/bert-finetuned-japanese-sentiment
