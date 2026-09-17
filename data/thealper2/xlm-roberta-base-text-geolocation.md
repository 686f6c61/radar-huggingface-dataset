# thealper2/xlm-roberta-base-text-geolocation

## Resumen

xlm-roberta-base-text-geolocation es un modelo de clasificación de texto publicado por el usuario thealper2 en Hugging Face. Se trata de un ajuste fino completo (fine-tuning end-to-end) de FacebookAI/xlm-roberta-base, un encoder transformer multilingüe, al que se le añade una cabeza lineal de clasificación mediante la clase XLMRobertaForSequenceClassification. El modelo resuelve una tarea de geolocalización aproximada: a partir de un texto corto de redes sociales predice una de 123 regiones geográficas codificadas como etiquetas anónimas (c_0 a c_122). No predice coordenadas, solo una distribución de probabilidad sobre regiones.

El interés del modelo es fundamentalmente metodológico más que de rendimiento. Su model card documenta con un detalle poco habitual el pipeline de datos: filtrado de ruido, control explícito de fugas entre particiones mediante agrupación de textos duplicados y comparación contra una línea base de TF-IDF más regresión logística. Esa transparencia lo convierte en un caso útil para estudiar los límites de la geolocalización de texto con encoders de 278 millones de parámetros y para auditar cómo se comportan las líneas base clásicas frente a modelos neuronales en esta tarea.

Los resultados son modestos y el propio autor los publica sin maquillar: 24,34 % de accuracy top-1 y 22,95 % de macro F1 en test, por debajo de la línea base TF-IDF (27,35 % y 26,81 %). El repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, y las métricas del model-index figuran como no verificadas. Con licencia MIT y pesos en safetensors de 1,1 GB, es ante todo un artefacto de investigación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza lineal de clasificación (XLMRobertaForSequenceClassification) |
| Parámetros totales | 278.138.235 (≈278 M), dato real de los safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens, longitud máxima usada en entrenamiento (el 99,95 % de los posts tiene ≤256 tokens) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos safetensors sin cuantizar |
| Idiomas soportados | multilingüe (etiqueta declarada); la model card no detalla la distribución de idiomas del corpus |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Tarea | text-classification, clasificación multiclase en 123 regiones |
| Etiquetas | c_0 … c_122 (identificadores de fichero del dataset, sin nombres de región) |
| Dataset de entrenamiento | yachay/text_coordinates_regions, revisión b9fa48181e3c93791d0613382c77aeb91214f324 |
| Tamaño del repositorio | 1,1 GB |
| Modelo base | FacebookAI/xlm-roberta-base |
| Fecha de creación | 17 de septiembre de 2026 (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional tipo RoBERTa multilingüe (XLM-RoBERTa base) con una cabeza lineal de clasificación sobre la representación del token especial de secuencia. El ajuste es completo, no con adaptadores ni LoRA: se entrena el encoder y la cabeza de forma conjunta. La pérdida es entropía cruzada sin ponderación por clase, decisión justificada porque el dataset está balanceado (5.000 posts por región antes del filtrado).

Los datos proceden de yachay/text_coordinates_regions: 615.000 posts de Twitter con 5.000 ejemplos por región, con coordenadas a nivel de lugar (unos 12.000 puntos distintos). El preprocesamiento aplica strip, minúsculas, sustitución de URL por el token HTTPURL y conserva menciones, hashtags, emojis y topónimos. Se eliminaron 12.911 textos que solo contenían enlaces t.co y 1.286 duplicados exactos con la misma etiqueta, quedando 600.803 posts (2,31 % descartado). La partición es 480.496 / 60.103 / 60.204 (train / validación / test), estratificada por región con semilla 42, y se aplicó un control de fugas agrupando textos idénticos tras eliminar URL y colapsar espacios (4.776 grupos multi-post), asignando cada grupo a una única partición; el solapamiento exacto y por grupo entre particiones es cero.

El entrenamiento usó AdamW con weight decay 0,01, learning rate 2e-05 con scheduler lineal y warmup del 10 %, 3 épocas, batch de 32, gradient clipping de 1,0, precisión bf16 y padding dinámico. La selección del mejor checkpoint se hizo por macro F1 de validación evaluado en cada época. Se ejecutó en una NVIDIA GeForce RTX 5060 Ti durante 1,27 horas con torch 2.11.0+cu128, transformers 5.17.0 y datasets 4.3.0. No se menciona ningún uso de RLHF, DPO ni decodificación especulativa, algo coherente con una tarea discriminativa. La innovación destacable no está en la arquitectura, sino en el protocolo de evaluación: la model card incluye distancias geográficas frente a una cota superior denominada "oracle" (la distancia al medoide de la región verdadera).

## Capacidades

- Clasificación de texto corto en 123 regiones geográficas anónimas, devolviendo la etiqueta ganadora y, si se solicita con top_k, la distribución de probabilidad completa.
- Geolocalización aproximada a partir únicamente del texto, sin metadatos, sin geotags y sin coordenadas de entrada.
- Cobertura multilingüe heredada de XLM-RoBERTa base, aunque el rendimiento real por idioma no se documenta.
- Modo de clasificación en lote mediante el pipeline de transformers, con padding dinámico para secuencias de longitud variable hasta 256 tokens.
- Preprocesamiento reproducible: los ajustes de normalización (minúsculas, URL a HTTPURL) están almacenados en preprocessing.json dentro del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es un clasificador puro, no un modelo generativo.
- No produce coordenadas ni polígonos: la salida es una etiqueta de conglomerado y su probabilidad.

## Casos de uso

- Enriquecimiento de corpus para investigación en dialectología y sociolingüística: el modelo puede etiquetar automáticamente grandes volúmenes de tuits con una región candidata y usarse como señal débil para estratificar muestras antes de un análisis manual. Su ventana de 256 tokens y su naturaleza de encoder permiten procesar millones de textos con coste bajo.
- Prior geográfico en sistemas de moderación de contenido: para decidir qué normativa local o qué equipo de revisión aplicar a un texto, un top-3 con 45,04 % de acierto puede bastar como señal de enrutado, siempre que la decisión final la tome un revisor humano.
- Análisis de opinión regional a escala agregada: agregando predicciones sobre decenas de miles de posts, los sesgos individuales se compensan parcialmente y se pueden estimar tendencias por región, evitando cualquier uso a nivel de usuario individual.
- Generación de datos de entrenamiento para modelos de geolocalización más grandes: las predicciones de alta confianza sirven como pseudoetiquetas, y el pipeline documentado permite auditar cuánto ruido introduce cada umbral.
- Estudio comparativo de líneas base: el modelo es un caso de referencia para medir cuánto aporta un encoder de 278 M frente a TF-IDF más regresión logística en geolocalización de texto corto; en este caso concreto, el modelo clásico gana en top-1 y macro F1.
- Filtrado por región en pipelines de datos para entrenamiento: descartar o agrupar textos según su probabilidad regional antes de alimentar otros modelos, con un coste de inferencia muy bajo (pesos de 1,1 GB, aptos para CPU).
- Demostraciones docentes de ajuste fino con transformers: el script de entrenamiento se ejecutó en 1,27 horas sobre una GPU de gama de consumo, lo que lo hace replicable en un curso o taller.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados) sobre la partición de test del dataset yachay/text_coordinates_regions (10 % personalizado, semilla 42): accuracy 0,2434 y macro F1 0,2295. La model card amplía estas cifras y las compara con una línea base de TF-IDF más regresión logística evaluada sobre el mismo test de 60.204 posts.

| Métrica | Validación | Test | TF-IDF + LR (test) |
|---|---|---|---|
| Accuracy (top-1) | 24,56 | 24,34 | 27,35 |
| Accuracy top-3 | 44,88 | 45,04 | 45,89 |
| Accuracy top-5 | 56,11 | 56,12 | 55,76 |
| Macro F1 | 23,21 | 22,95 | 26,81 |
| Weighted F1 | 23,13 | 22,86 | 26,72 |
| Macro precisión | 25,80 | 25,23 | 27,51 |
| Macro recall | 24,63 | 24,43 | 27,44 |

Distancias geográficas en test, medidas entre la coordenada del post y el medoide de la región predicha. La columna "Oracle" usa el medoide de la región verdadera y representa el suelo de error de un clasificador perfecto bajo esta representación.

| Métrica | Modelo | Oracle |
|---|---|---|
| Distancia mediana al medoide predicho (km) | 1264 | 181 |
| Distancia media (km) | 3126 | 272 |
| Acc@161 km | 12,73 | 46,54 |
| Acc@500 km | 27,27 | 87,62 |
| Acc@1000 km | 44,01 | 96,42 |
| Acc@2500 km | 66,68 | 99,46 |

La model card incluye además una tabla por región (medoides y F1) que aparece truncada en la información disponible. En las filas visibles, los mejores F1 corresponden a c_18 (medoide 3,22 / 101,96, F1 0,421) y c_19 (14,57 / 120,94, F1 0,377), y los peores a c_7 (41,61 / -85,25, F1 0,017) y c_4 (34,59 / -83,21, F1 0,027). No se han publicado resultados de benchmarks estándar tipo MMLU, GLUE o HumanEval, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM para inferencia: estimación derivada del recuento de parámetros, no publicada por el autor. En FP32 los pesos ocupan unos 1,1 GB; en FP16/BF16, unos 0,56 GB; en int8, unos 0,28 GB. Con activaciones y overhead de framework, una ejecución en FP16 con lotes pequeños cabe en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más. El modelo se entrenó en una NVIDIA GeForce RTX 5060 Ti, lo que sitúa el ajuste fino completo al alcance de tarjetas de gama media. Para lotes grandes en producción son suficientes una RTX 4090, una L4 o una A10G; no se necesita A100 ni H100.
- Inferencia en CPU: viable. Con 278 M de parámetros y secuencias de 256 tokens, el modelo puede servirse en CPU para cargas moderadas, aunque no hay cifras publicadas de latencia.
- Opciones de despliegue: pipeline de transformers (ejemplo oficial en la model card), Hugging Face Inference Endpoints (el repositorio lleva la etiqueta endpoints_compatible), text-embeddings-inference (etiqueta declarada) y exportación a ONNX mediante Optimum, aunque no se publica ningún artefacto ONNX. No hay pesos GGUF, por lo que llama.cpp y Ollama no están soportados de fábrica. vLLM no es aplicable: es un modelo encoder de clasificación, no generativo.
- Latencia y throughput: no disponible. La única cifra temporal publicada es el entrenamiento completo (3 épocas sobre 480.496 ejemplos) en 1,27 horas.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros modelos de geolocalización de texto. La única referencia cuantitativa disponible es la línea base del propio autor, evaluada sobre el mismo conjunto de test.

| Modelo | Parámetros | Contexto | Accuracy top-1 (test) | Macro F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| thealper2/xlm-roberta-base-text-geolocation | 278 M | 256 tokens | 24,34 | 22,95 | MIT | Hugging Face (0 descargas) |
| TF-IDF + regresión logística (línea base del autor) | no disponible | no aplica | 27,35 | 26,81 | no disponible | descrita en la model card, sin artefacto publicado |
| FacebookAI/xlm-roberta-base (modelo base sin ajustar) | no disponible en la información proporcionada | no disponible | no aplica (no es clasificador de regiones) | no aplica | MIT | Hugging Face |
| Otros modelos de geolocalización de texto | no disponible | no disponible | no disponible | no disponible | no disponible | no se han encontrado referencias en la búsqueda web realizada |

## Limitaciones y advertencias

- Rendimiento por debajo de una línea base clásica: el modelo pierde frente a TF-IDF más regresión logística tanto en top-1 (24,34 frente a 27,35) como en macro F1 (22,95 frente a 26,81). Para producción, la línea base es la opción a batir.
- Etiquetas sin significado geográfico explícito: las 123 regiones son conglomerados sin nombre derivados del dataset (c_0 a c_122) y tienen extensión geográfica desigual. Un acierto de etiqueta no equivale a una localización correcta.
- Error geográfico alto: la distancia mediana al medoide de la región predicha es de 1264 km, frente a los 181 km del "oracle". Solo el 12,73 % de las predicciones cae a menos de 161 km.
- Sesgo temporal y de plataforma: los datos son tuits de 2021 con sesgos temáticos, demográficos y de plataforma. No se ha medido el rendimiento en otros dominios, idiomas o periodos.
- Casos triviales y casos imposibles mezclados: algunos textos contienen topónimos explícitos de plantillas de aplicación (check-ins, "just posted a photo @ …"), que son fáciles; otros no contienen ninguna señal geográfica (emojis, respuestas genéricas) y reciben confidencias bajas. La accuracy agregada mezcla ambos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de sobreconfianza: el modelo siempre devuelve una distribución sobre 123 clases, incluso cuando el texto no aporta información geográfica. Hay que umbralizar explícitamente.
- Las métricas del model-index están marcadas como no verificadas (verified: false). La tabla por región de la model card llega truncada en la información disponible.
- Licencia MIT: permite uso comercial y modificación con atribución, pero la procedencia y las condiciones de uso de los tuits originales del dataset son responsabilidad del usuario final.
- Adopción nula: cero descargas y cero likes en el momento de redactar la ficha, sin mantenimiento ni issues conocidos.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (solo páginas en alemán sobre canciones infantiles sin relación alguna), por lo que no hay validación externa ni discusión independiente disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thealper2/xlm-roberta-base-text-geolocation
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/yachay/text_coordinates_regions
- Búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos no guardaban relación con la consulta.
