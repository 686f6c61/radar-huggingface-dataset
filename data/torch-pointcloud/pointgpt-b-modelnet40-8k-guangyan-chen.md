# torch-pointcloud/pointgpt-b.modelnet40-8k.guangyan-chen

## Resumen

PointGPT-b es un modelo de clasificación de nubes de puntos 3D basado en la arquitectura PointGPT, un transformer con preentrenamiento generativo autorregresivo presentado en NeurIPS 2023. Esta variante concreta, publicada por el mantenedor de la librería `torch-pointcloud`, es un ajuste fino sobre ModelNet40 con 8.192 puntos por muestra y 40 clases de salida. El modelo cuenta con 120,4 millones de parámetros y una dimensión de características de 1.536.

El modelo resuelve la tarea de clasificación de formas 3D a partir de nubes de puntos, es decir, dado un conjunto de coordenadas (y opcionalmente normales) determinar a qué categoría de objeto pertenece. Su interés práctico radica en que aplica la filosofía de los LLM (preentrenamiento generativo a gran escala seguido de ajuste fino supervisado) al dominio de la geometría 3D, lo que permite reutilizar representaciones aprendidas en tareas posteriores de segmentación, detección o recuperación de formas.

La relevancia actual de esta ficha es doble: por un lado, ofrece un punto de referencia reproducible con métricas declaradas sobre ModelNet40 (OA 94,25 % y mAcc 90,99 %); por otro, su empaquetado en la librería `torch-pointcloud` con pesos en `safetensors` y una API de creación de modelo de una sola línea facilita su integración en pipelines de PyTorch, algo poco habitual en modelos de investigación 3D.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) |
| Parámetros totales | 120.400.520 (120,4 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera con 8.192 puntos por muestra) |
| Tipos de cuantización | No disponible (pesos en `safetensors`, presumiblemente fp32/fp16) |
| Idiomas soportados | No aplica (modelo de visión 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (repo de 0,5 GB) |
| Dimensión de características | 1.536 |
| Número de clases | 40 (ModelNet40) |
| Puntos por muestra | 8.192 |
| Entradas | Coordenadas `pos` (N, 3) y normales `normal` (N, 3) |

## Arquitectura y entrenamiento

PointGPT es un transformer que adapta el paradigma de preentrenamiento autorregresivo de los modelos de lenguaje al dominio de las nubes de puntos. La idea central del artículo es dividir la nube en parches (patches) ordenados y entrenar al modelo para predecir el siguiente parche a partir de los anteriores, lo que fuerza al encoder a aprender representaciones geométricas locales y globales coherentes. Sobre esa base preentrenada se añade una cabeza de clasificación y se ajusta de forma supervisada.

Este checkpoint concreto parte del modelo base `torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen` (preentrenamiento híbrido con etiquetas) y se ajusta sobre ModelNet40 con 8.192 puntos por muestra. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refuerzo o preferencias; tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El modelo fue convertido desde el repositorio original `CGuangyan-BIT/PointGPT` (MIT) al formato de la librería `torch-pointcloud`.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de objetos (ModelNet40).
- Extracción de características: `forward_features` devuelve embeddings de dimensión 1.536 por muestra, útiles para tareas downstream.
- Soporte de `reset_classifier(num_classes=0)` para obtener embeddings puros sin cabeza de clasificación.
- Procesamiento de muestras con 8.192 puntos y 3 canales de coordenadas más 3 canales de normales.
- Inferencia por lotes mediante `collate`, con tensor de índices de batch para concatenar múltiples nubes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente geométrico.
- No dispone de modo de razonamiento (thinking), visión 2D, audio ni generación de texto.

## Casos de uso

- Clasificación de objetos escaneados: dado un escaneo LiDAR o de profundidad de una sola vista convertido a nube de puntos, el modelo asigna una de las 40 categorías de ModelNet40, útil en pipelines de inventario o robótica de manipulación.
- Preentrenamiento para tareas downstream: usar `forward_features` para obtener embeddings de 1.536 dimensiones y entrenar cabezas ligeras de segmentación semántica o detección sobre datos propios, aprovechando que el encoder ya ha aprendido geometría local y global.
- Recuperación de formas 3D (shape retrieval): indexar los embeddings de un catálogo de modelos CAD y buscar por similitud vectorial la forma más parecida a una consulta.
- Filtrado y control de calidad en escaneo 3D: clasificar automáticamente nubes capturadas en un pipeline de digitalización para descartar muestras corruptas o etiquetarlas antes del procesamiento posterior.
- Docencia e investigación en aprendizaje 3D: el modelo es un punto de partida reproducible para comparar variantes de preentrenamiento autorregresivo frente a enfoques contrastivos o basados en ocupación, con métricas de referencia sobre ModelNet40.
- Benchmarking de infraestructura: con 120 M de parámetros y lotes de 8.192 puntos, sirve para medir throughput y latencia de GPUs en cargas de trabajo de transformers 3D antes de escalar a modelos mayores.
- Prototipado rápido con la API de `torch-pointcloud`: `tp.create_model(..., pretrained=True)` permite tener un clasificador funcional en pocas líneas, adecuado para validar una idea antes de invertir en entrenamiento propio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| ModelNet40 | Overall Accuracy (OA) | 94,25 % |
| ModelNet40 | Mean per-class Accuracy (mAcc) | 90,99 % |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,5 GB en `safetensors`; en fp32 serían aproximadamente 0,48 GB solo de pesos, más activaciones. Con lotes pequeños y 8.192 puntos por muestra, la inferencia cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para lotes moderados; para lotes grandes o entrenamiento de ajuste fino se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 (8-12 GB), RTX 4070, RTX 4080 y RTX 4090, siempre que se ajuste el tamaño de lote al número de puntos.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, 120 M de parámetros y 8.192 puntos implican una carga de atención considerablemente mayor que un transformer de texto de tamaño similar, por lo que conviene medir el throughput real en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / puntos | ModelNet40 OA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-b (este modelo) | 120,4 M | 8.192 puntos | 94,25 % (declarado) | MIT | Hugging Face, `torch-pointcloud` |
| PointGPT-b (variante 1k puntos) | No disponible | No disponible | No disponible | MIT | Hugging Face (`pointgpt-b.modelnet40.guangyan-chen`) |
| Otras alternativas (PointNet++, DGCNN, Point Transformer) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos competidores, por lo que la comparación cuantitativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Las métricas (OA 94,25 %, mAcc 90,99 %) están declaradas por el autor y marcadas como no verificadas (`verified: false`); no deben tomarse como resultado auditado.
- El modelo está ajustado exclusivamente sobre ModelNet40, un dataset de objetos sintéticos y limpios; el rendimiento en nubes de puntos reales con ruido, oclusiones o densidades distintas puede degradarse notablemente.
- Requiere exactamente la estructura de entrada esperada (8.192 puntos, coordenadas y normales); no se documenta robustez a variaciones de densidad o a ausencia de normales.
- No es un modelo lingüístico: no procesa texto, no soporta instrucciones en lenguaje natural y no tiene capacidades de tool calling ni de agente.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza en categorías ambiguas o fuera de las 40 clases de ModelNet40; no existe mecanismo de abstención documentado.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar el sesgo de dominio del dataset ModelNet40 (formas CAD idealizadas, categorías sesgadas hacia objetos domésticos y muebles).
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución al artículo de PointGPT y al repositorio original.
- El número de descargas (18) y de likes (0) indica adopción muy baja; no hay evidencia de comunidad ni de soporte a largo plazo.
- El campo `pipeline` no está definido en Hugging Face, por lo que las herramientas automáticas de inferencia no funcionarán directamente; es necesario usar la librería `torch-pointcloud`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.modelnet40-8k.guangyan-chen
- Variante con 1k puntos: https://huggingface.co/torch-pointcloud/pointgpt-b.modelnet40.guangyan-chen
- Repositorio de archivos del modelo: https://huggingface.co/torch-pointcloud/pointgpt-b.modelnet40.guangyan-chen/tree/main
- Paper de PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original de PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
