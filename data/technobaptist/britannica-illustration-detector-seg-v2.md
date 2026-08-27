# TechnoBaptist/britannica-illustration-detector-seg-v2

## Resumen

El modelo `TechnoBaptist/britannica-illustration-detector-seg-v2` es un detector de objetos y segmentador de instancias especializado en localizar y recortar ilustraciones individuales —grabados, figuras, mapas, diagramas y retratos— en páginas escaneadas de la Enciclopedia Britannica, desde la edición de 1768 en adelante. Lo desarrolla TechnoBaptist, un perfil técnico centrado en IA, fine-tuning y RL, y se publica bajo licencia Apache-2.0.

El problema que resuelve es concreto: las láminas de la enciclopedia contienen entre 10 y 20 figuras por página, y los clasificadores a nivel de página solo pueden indicar si una página tiene ilustraciones, no dónde está cada una. Este modelo proporciona esa localización mediante detección de cajas y máscaras de segmentación, lo que permite extracción, recorte y construcción de datasets de imágenes de forma automatizada.

Técnicamente, es un fine-tune de `Roboflow/rf-detr-seg-small`, un modelo RF-DETR Seg pequeño con backbone DINOv2 destilado, de 29 millones de parámetros. El entrenamiento se realizó con etiquetas generadas de forma zero-shot a partir de un modelo teacher grande, corregidas en dos bucles, con un coste total de aproximadamente 25 dólares de GPU en la nube. El modelo está diseñado para funcionar en CPU (~1 segundo por página), lo que lo hace accesible para instituciones GLAM con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg small (backbone DINOv2 destilado) |
| Parametros totales | 29 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint .pth) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Seg small, una arquitectura de detección de objetos y segmentación de instancias tipo DETR (Detection Transformer) con un backbone destilado de DINOv2. La destilación se realizó mediante el proceso denominado *falcon-perception-distillation*, que permite transferir conocimiento de un modelo teacher grande a un modelo compacto sin pérdida significativa de rendimiento.

El entrenamiento se llevó a cabo sobre el dataset `davanstrien/britannica-illustration-labels-full`, cuyas etiquetas no fueron anotadas manualmente, sino generadas de forma automática: un modelo teacher grande produjo las anotaciones iniciales de forma zero-shot, y posteriormente se aplicaron dos bucles de corrección para refinar las etiquetas, especialmente en los casos donde el teacher fallaba. El coste total del entrenamiento fue de aproximadamente 25 dólares de tiempo de GPU en la nube, lo que demuestra la eficiencia del enfoque. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento supervisado convencional sobre las etiquetas corregidas.

## Capacidades

- Detección de objetos: localiza ilustraciones individuales (grabados, figuras, mapas, diagramas, retratos) en páginas escaneadas.
- Segmentación de instancias: genera máscaras a nivel de píxel para cada ilustración detectada.
- Manejo de páginas densas: es capaz de detectar múltiples instancias en una misma página (media de 10,5 instancias por página en láminas pre-1850).
- Umbral configurable: permite ajustar el nivel de confianza según el caso de uso (0,4 por defecto, 0,3 para recuperar figuras pequeñas, 0,55+ para mayor precisión).
- Compatibilidad multiplataforma: funciona en CPU, CUDA y Apple Silicon (MPS).
- Inferencia rápida: aproximadamente 1 segundo por página en CPU de portátil.
- Integración con la librería `rfdetr` mediante API Python sencilla.

## Casos de uso

- Digitalización de patrimonio cultural: extracción automática de ilustraciones de páginas escaneadas de enciclopedias históricas para su preservación y acceso en línea. El modelo localiza cada figura individual, lo que permite recortarla y almacenarla como imagen independiente.
- Construcción de datasets de imágenes históricas: creación de colecciones etiquetadas de grabados, mapas y diagramas a partir de corpus completos. La capacidad de procesar miles de páginas en una noche en hardware local lo hace viable para bibliotecas y archivos.
- Indexación y búsqueda visual: generación de metadatos de localización de figuras dentro de documentos escaneados, facilitando la búsqueda por contenido visual en repositorios digitales.
- Análisis de contenido editorial: estudio de la evolución de las ilustraciones a lo largo de las ediciones de la enciclopedia (desde 1768), permitiendo análisis cuantitativos de densidad y tipología de figuras por época.
- Recorte automático para exposiciones o publicaciones: extracción de ilustraciones de alta calidad para su uso en catálogos, artículos o exposiciones digitales, con máscaras ajustables para recortes limpios.
- Pre-filtrado en pipelines de OCR o análisis de documentos: identificación de regiones ilustradas para separarlas del texto, mejorando la precisión de procesos posteriores como el reconocimiento óptico de caracteres o la clasificación de páginas.

## Benchmarks y rendimiento

| Eval | mAP@[.5:.95] | mAP@50 |
|---|---|---|
| vs etiquetas del teacher, máscaras (100 páginas held-out) | 0,618 | 0,830 |
| vs humano | No medido aún (pendiente de anotación) | No medido |
| Validación (loop-2 final), cajas | 0,809 | 0,898 |

Además, en la validación al completar el loop-2 se reportan: precisión 0,910, recall 0,882 y segm-mAP@50 0,895.

En una evaluación posterior sobre el corpus completo (78 páginas muestreadas, 377 instancias propuestas con umbral ≥ 0,25), un juez VLM confirmó 374/377 como ilustraciones reales (precisión del 99,2%). Los tres rechazos fueron un sello de biblioteca y dos líneas de texto. En cuanto a recall, de 20 páginas sin detección, 15 no tenían ilustraciones y 5 eran fallos reales (mapa de atlas, diagramas de espículas, un grabado anatómico, trazas de tira de película y una página con tres dibujos lineales pequeños), lo que supone un fallo de página completa de aproximadamente el 6% de las páginas ilustradas.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación, pero al tratarse de un modelo de 29M de parámetros, la huella de memoria es reducida. Se puede inferir que cabe en GPUs consumer con 4 GB o menos, aunque no se especifica.
- GPU recomendadas: no se indican modelos concretos, pero el modelo funciona en CUDA y MPS. Dado su tamaño, cualquier GPU moderna (RTX 3060, RTX 4090, A100, etc.) es suficiente.
- Compatibilidad con CPU: sí, aproximadamente 1 segundo por página en un portátil.
- Opciones de despliegue: inferencia mediante la librería `rfdetr` en Python, con soporte para CPU, CUDA y MPS. No se mencionan integraciones con vLLM, Ollama o TGI, ya que es un modelo de visión, no de lenguaje.
- Latencia y throughput: ~1 s/página en CPU; en GPU se espera significativamente menor, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de detección de ilustraciones en documentos históricos en la información proporcionada. El modelo base `Roboflow/rf-detr-seg-small` es el punto de partida, pero no se ofrecen métricas comparativas entre ambos. Existe un clasificador de páginas ilustradas (`davanstrien/britannica-illustrated-detector`), pero opera a nivel de página y no es comparable en funcionalidad. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos del dominio: el modelo está entrenado exclusivamente con páginas de la Enciclopedia Britannica, por lo que su rendimiento en otros tipos de documentos históricos (periódicos, manuscritos, otros libros) puede degradarse.
- Falsos positivos: se han observado detecciones erróneas de sellos de biblioteca y líneas de texto como ilustraciones, especialmente con umbrales bajos (0,25-0,30).
- Fallos de recall: aproximadamente el 6% de las páginas ilustradas no reciben ninguna detección, concentrándose en diagramas lineales pequeños y ciertos tipos de mapas.
- Calidad de las máscaras: las máscaras tienden a quedar ligeramente dentro de los bordes dibujados de las ilustraciones (heredado de las etiquetas débiles del teacher). Se recomienda dilatar las máscaras un 2% del tamaño de la caja para recortes limpios.
- Validación humana pendiente: no se ha medido el rendimiento contra anotaciones humanas reales; las métricas actuales se basan en etiquetas del teacher y en juicios de un VLM.
- Umbral por defecto: el umbral de 0,4 es seguro para uso general, pero puede perder figuras pequeñas dentro del texto; se recomienda 0,3 para recuperación exhaustiva con triaje posterior.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero se debe verificar la procedencia de los datos de entrenamiento si se usan en productos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/britannica-illustration-detector-seg-v2
- Dataset de etiquetas: https://huggingface.co/datasets/davanstrien/britannica-illustration-labels-full
- Modelo base: https://huggingface.co/Roboflow/rf-detr-seg-small
- Clasificador de páginas ilustradas (relacionado): https://huggingface.co/davanstrien/britannica-illustrated-detector
- Skill de detección bootstrap (receta de entrenamiento): https://huggingface.co/datasets/uv-scripts/object-detection
