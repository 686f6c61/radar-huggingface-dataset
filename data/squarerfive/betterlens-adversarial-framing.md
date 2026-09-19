# squarerfive/betterlens-adversarial-framing

## Resumen

BetterLens — Adversarial Framing Detection (V1) es un clasificador de texto binario publicado por el usuario squarerfive dentro del proyecto BetterLens. Su tarea es detectar encuadre adversarial —propaganda, desinformación y framing manipulador— en publicaciones cortas de redes sociales, devolviendo dos etiquetas posibles: `normal` (0) y `adversarial` (1). Técnicamente es un fine-tuning de `distilbert-base-uncased`, un transformer encoder destilado, con 66.955.010 parámetros totales, una longitud máxima de secuencia de 128 tokens y entrada de texto en bruto sin plantilla de prompt.

El modelo alimenta el filtro de desinformación de la extensión de navegador BetterLens y está pensado para inferencia en dispositivo. Además de los pesos en safetensors, el repositorio incluye una exportación ONNX cuantizada a INT8 de aproximadamente 64 MB, lo que permite ejecutarlo en CPU o en el navegador con latencias declaradas de 7,3 ms de media en FP32 ONNX y 7,8 ms en INT8 ONNX (referencia macOS, una publicación por inferencia). Es relevante ahora porque cubre una capa de análisis de contenido —el framing manipulador— distinta de la verificación de hechos, con un coste computacional muy bajo.

El repositorio no registra descargas ni likes, el modelo es monolingüe en inglés y el propio autor lo describe como de grado investigación. La model card advierte explícitamente de falsos positivos de alta confianza fuera de dominio: publicaciones personales cotidianas puntúan en torno a 0,99 como adversariales, por lo que su uso en producción exige control de umbral y validación sobre el dominio objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder destilado (DistilBERT), modelo base `distilbert-base-uncased` |
| Parametros totales | 66.955.010 (66,96 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | FP32 (pesos PyTorch) y ONNX INT8 (opset 14) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (código y pesos); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (PyTorch FP32, ~253 MB) y ONNX INT8 (~64 MB) |
| Pipeline | `text-classification` (clasificación de etiqueta única, 2 clases) |
| Librería | transformers |
| Tamaño del repositorio | ~0,3 GB |
| Compatibilidad de despliegue | Hugging Face Inference API, `pipeline()`, Gradio Spaces, text-embeddings-inference, `endpoints_compatible` |
| Etiquetas de salida | `0` = `normal`, `1` = `adversarial` |
| Fecha de creación / actualización | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder correspondiente a DistilBERT (`distilbert-base-uncased`), la variante destilada de BERT-base obtenida mediante destilación de conocimiento, a la que se ha añadido una cabeza de clasificación de secuencia con dos salidas. El modelo trabaja sobre tokens de entrada y `attention_mask`, ambos `int64`, con batch dinámico y longitud fija de 128; en la exportación ONNX la salida es `logits` con forma `[batch, 2]`. La innovación destacable no está en la arquitectura, sino en el empaquetado para despliegue: exportación ONNX INT8 de ~64 MB con receta de exportación publicada en el repositorio de BetterLens (`scripts/export_onnx.py`), pensada para inferencia en dispositivo dentro de una extensión de navegador.

El fine-tuning se realizó sobre una combinación de tres datasets públicos de Hugging Face —`roupenminassian/twitter-misinformation`, `Reyansh4/Fake-News-Classification` y `GonzaloA/fake_news`— deduplicados y rebalanceados hasta aproximadamente 25.284 muestras únicas. La model card no indica el número de tokens de entrenamiento, la composición exacta por clase, hiperparámetros de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos no están disponibles. La única validación declarada es la reproducción de las métricas del conjunto de test a partir de `model.safetensors` y el tokenizador del repositorio mediante `AutoModelForSequenceClassification` (verificado el 19 de septiembre de 2026).

## Capacidades

- Clasificación binaria de texto: distingue entre `normal` y `adversarial` a partir del texto en bruto de una publicación.
- Detección de encuadre adversarial: propaganda, desinformación y framing manipulador en texto corto de redes sociales (hasta 128 tokens).
- Integración directa con el ecosistema transformers: carga mediante `AutoModelForSequenceClassification.from_pretrained` y uso con `pipeline("text-classification")`.
- Compatibilidad con la API de inferencia de Hugging Face mediante `InferenceClient`, devolviendo etiquetas y puntuaciones.
- Inferencia en dispositivo y en navegador a través de la exportación ONNX INT8 (opset 14), con entradas `input_ids` y `attention_mask` y salida `logits` `[batch, 2]`.
- Salida probabilística de dos clases, apta para aplicar umbrales de decisión personalizados.
- No genera texto: es exclusivamente un clasificador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Monolingüe: entrenado y evaluado únicamente en inglés. No se declara soporte multilingüe.
- Sin capacidades multimodales (ni visión, ni audio, ni modo "thinking").

## Casos de uso

- Filtrado de desinformación en el cliente: es el motor del filtro de desinformación de la extensión BetterLens, que marca publicaciones con framing manipulador directamente en el navegador. La exportación ONNX INT8 de ~64 MB y las latencias de 7,3-7,8 ms por publicación en CPU lo hacen viable sin backend.
- Moderación de contenido como primera etapa: preclasificar grandes volúmenes de publicaciones cortas en una plataforma social para priorizar la revisión humana de las marcadas como `adversarial`, reduciendo el coste frente a una revisión manual completa.
- Investigación en comunicación política y análisis de propaganda: etiquetar corpus de Twitter u otras redes para medir la prevalencia de encuadres manipuladores en un periodo o hashtag concreto, aprovechando que el modelo también se entrenó con datos de `twitter-misinformation`.
- Etiquetado débil para ampliar datasets: usar el clasificador como anotador automático sobre grandes colecciones de texto no etiquetado, generando etiquetas preliminares que después se validan con anotación humana.
- Curación de datos en pipelines RAG: descartar o degradar la prioridad de documentos y fuentes cuyo texto presente framing adversarial antes de incorporarlos a un índice vectorial, como filtro previo de calidad de fuente.
- Alertas en tiempo casi real en flujos de datos: con 7,3 ms de media por inferencia en CPU por hilo, un único núcleo puede procesar del orden de 137 publicaciones por segundo (cálculo derivado de la latencia declarada, no publicado por el autor), suficiente para monitorizar streams de publicaciones sociales.
- Señal auxiliar en herramientas de verificación de hechos: aportar al periodista o verificador una puntuación de framing manipulador que ayude a ordenar la cola de trabajo, sin sustituir la comprobación factual.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test reservado de 2.529 muestras:

| Métrica | Valor |
|---|---|
| Accuracy | 96,8 % |
| Precision (adversarial) | 93,5 % |
| Recall (adversarial) | 97,3 % |
| F1 (adversarial) | 95,3 % |

Matriz de confusión del mismo conjunto:

| | Predicho normal | Predicho adversarial |
|---|---|---|
| Real normal | 1.629 | 57 |
| Real adversarial | 23 | 820 |

Latencia declarada (CPU, una publicación, referencia macOS):

| Modo | Media | P95 |
|---|---|---|
| ONNX FP32 | 7,3 ms | 10,6 ms |
| ONNX INT8 | 7,8 ms | 11,3 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable dado que se trata de un clasificador especializado y no de un modelo generativo. Tampoco se aportan comparaciones con otros clasificadores de desinformación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB para los pesos FP32 (`model.safetensors`, ~253 MB) y alrededor de 64 MB para la variante ONNX INT8. El consumo real en runtime añade el tokenizador y los buffers de activaciones, pero se mantiene muy por debajo de 1 GB.
- Cabe en cualquier GPU de consumo, incluidas tarjetas con 4 GB o menos (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y también en GPU integradas. En la práctica la GPU no es necesaria.
- CPU: es el entorno de referencia declarado por el autor, con 7,3 ms de media y 10,6 ms de P95 por publicación en FP32 ONNX.
- GPU recomendadas: no especificadas en la información disponible; por tamaño del modelo no se requiere ningún acelerador concreto.
- Opciones de despliegue: `transformers` con `pipeline()`, Hugging Face Inference API, Hugging Face Text Embeddings Inference (el repositorio incluye el tag `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime para inferencia en dispositivo o en navegador, y Gradio Spaces.
- vLLM, llama.cpp, Ollama y TGI en modo generativo no aplican: no hay pesos GGUF ni es un modelo de generación de texto.
- Throughput: no publicado por el autor. A partir de la latencia media declarada en CPU se puede estimar un orden de magnitud de 137 clasificaciones por segundo por hilo, cifra derivada y no verificada.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de benchmarks de modelos alternativos de detección de desinformación, por lo que no es posible una comparación cuantitativa de rendimiento. Los únicos elementos comparables disponibles son el modelo base y otro modelo del mismo autor mencionado en la model card.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| squarerfive/betterlens-adversarial-framing | 66.955.010 | 128 tokens | Clasificación binaria `normal` / `adversarial` | MIT | Hugging Face (0 descargas, 0 likes) |
| distilbert-base-uncased (modelo base) | no disponible en la información proporcionada | no disponible en la información proporcionada | Modelo de lenguaje enmascarado / representaciones | Apache-2.0 | Hugging Face |
| squarerfive/betterlens-dual-head-sentiment-vagueness (v2) | no disponible | no disponible | Sentimiento y vaguedad, dos cabezas | no disponible | Hugging Face (referenciado en la model card) |

Comparativas con clasificadores de propaganda o desinformación de terceros: no disponible.

## Limitaciones y advertencias

- Modelo solo en dominio: está bien calibrado sobre el texto periodístico y social con el que se entrenó, pero las publicaciones personales informales quedan fuera de dominio y generan falsos positivos de alta confianza. El autor verificó el 19 de septiembre de 2026 que publicaciones cotidianas puntúan en torno a 0,99 como adversariales.
- Falsos positivos en publicaciones irónicas o satíricas, reconocidos explícitamente en la model card.
- Matiz semántico importante: "adversarial" aquí significa framing manipulador, no hostilidad ni toxicidad. Usar la etiqueta como proxy de agresividad es un error de interpretación.
- Alcance limitado a texto corto: 128 tokens como máximo. Publicaciones largas o hilos completos deben truncarse, con la pérdida de información que ello implica.
- Monolingüe en inglés. No hay soporte ni evaluación en castellano ni en otros idiomas.
- Grado investigación: el autor recomienda cautela y advierte de que no está pensado como producto final.
- Sesgos heredados: los tres corpus de entrenamiento de fake news y desinformación condicionan la distribución y el vocabulario que el modelo asocia a framing adversarial; no se documenta ningún análisis de sesgo por tema, ideología o demografía.
- No verifica hechos: detecta forma manipuladora, no falsedad. Una afirmación verdadera con framing agresivo se clasificará como adversarial y una falsedad redactada de forma neutra puede pasar como normal.
- Licencia MIT para código y pesos, con el modelo base bajo Apache-2.0. Los tres datasets de entrenamiento tienen sus propios términos de uso, que hay que revisar para un uso downstream, especialmente comercial.
- Sin tracción ni validación externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las métricas publicadas proceden únicamente de la evaluación del propio autor.
- Calibración no documentada fuera del conjunto de test: no se publican curvas de fiabilidad ni umbrales recomendados, por lo que desplegarlo en producción exige calibrar el umbral sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/squarerfive/betterlens-adversarial-framing
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset `roupenminassian/twitter-misinformation`: https://huggingface.co/datasets/roupenminassian/twitter-misinformation
- Dataset `Reyansh4/Fake-News-Classification`: https://huggingface.co/datasets/Reyansh4/Fake-News-Classification
- Dataset `GonzaloA/fake_news`: https://huggingface.co/datasets/GonzaloA/fake_news
- Informe de evaluación: `evaluation_report.json` en el repositorio del modelo
- Modelo v2 del mismo proyecto: `squarerfive/betterlens-dual-head-sentiment-vagueness`
- Repositorio del proyecto BetterLens (receta de exportación ONNX en `scripts/export_onnx.py`): URL no disponible en la información proporcionada
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron únicamente páginas de inicio del buscador.
