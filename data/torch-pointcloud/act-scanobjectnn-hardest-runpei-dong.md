# torch-pointcloud/act.scanobjectnn-hardest.runpei-dong

## Resumen

ACT (Autoencoders as Cross-Modal Teachers) es un modelo de clasificación de nubes de puntos 3D que emplea un transformer de puntos enmascarado, destilado a partir de un transformer de imágenes 2D preentrenado. Esta ficha concreta, `act.scanobjectnn-hardest.runpei-dong`, es el checkpoint afinado sobre la partición más difícil del dataset ScanObjectNN (PB_T50_RS), con 15 clases de objetos reales escaneados y perturbados. Lo publica el usuario `torch-pointcloud` como conversión del repositorio original de Runpei Dong (MIT) al formato de la librería `torch-pointcloud`.

El modelo resuelve la tarea de clasificación de nubes de puntos a nivel de objeto: recibe una nube de puntos (por defecto 8192 puntos con coordenadas XYZ) y devuelve logits sobre 15 categorías. Su interés radica en la idea central del paper de 2023: aprovechar el conocimiento visual de transformers 2D preentrenados como "profesor" para aprender representaciones 3D sin necesidad de grandes datasets 3D etiquetados, mediante un esquema de destilación cross-modal.

Con 22,1 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero pensado para investigación y prototipado en visión 3D, no para generación de texto ni tareas de lenguaje. Su contexto no es una ventana de tokens sino un número fijo de puntos de entrada (8192 en el ejemplo de uso).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de puntos enmascarado (ACT), destilado de un transformer de imágenes 2D |
| Parámetros totales | 22.095.631 (22,1 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 8192 puntos (configuración de ejemplo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de features | 768 |
| Número de clases | 15 |
| Dataset de evaluación | ScanObjectNN (PB_T50_RS) |
| Modelo base | torch-pointcloud/act.pretrain.runpei-dong |

## Arquitectura y entrenamiento

ACT es un transformer que opera directamente sobre nubes de puntos mediante tokenización de grupos de puntos y atención sobre los tokens resultantes. La innovación del método es el entrenamiento cross-modal: un autoencoder basado en transformer de imágenes 2D preentrenado actúa como profesor que genera objetivos de reconstrucción enmascarada para el estudiante 3D, de modo que el modelo de puntos aprende representaciones alineadas con el espacio visual 2D sin requerir anotaciones 3D masivas. El checkpoint aquí descrito parte del modelo preentrenado `act.pretrain.runpei-dong` y se afina de forma supervisada sobre ScanObjectNN.

La variante PB_T50_RS de ScanObjectNN es la partición más exigente del benchmark: objetos escaneados del mundo real con perturbaciones (traslación y rotación de la nube global, entre otras), lo que introduce ruido y oclusión respecto a datasets sintéticos como ModelNet40. El modelo produce un vector de 768 dimensiones antes de la cabeza de clasificación, reemplazable por una capa lineal de 15 clases. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO (no aplicable en esta tarea).

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos del mundo real (ScanObjectNN).
- Extracción de embeddings globales de 768 dimensiones mediante `forward_features` para tareas downstream (retrieval, clustering, transfer learning).
- Capacidad de reemplazar la cabeza de clasificación (`reset_classifier`) para adaptar el modelo a otro número de clases.
- Procesamiento de nubes de puntos con coordenadas XYZ y agrupación por batch mediante la utilidad `collate` de `torch-pointcloud`.
- No soporta generación de texto, tool calling, agentes, visión 2D directa ni capacidades multilingües.
- No dispone de modo "thinking" ni razonamiento multi-paso.

## Casos de uso

- Clasificación de objetos escaneados en robótica móvil: el modelo puede etiquetar nubes de puntos capturadas por sensores LiDAR o RGB-D en tiempo de ejecución para tareas de manipulación o navegación, gracias a su reducido tamaño (22,1 M de parámetros) y a que opera sobre 8192 puntos.
- Preprocesado en pipelines de percepción 3D: usar `forward_features` para obtener embeddings de 768 dimensiones que alimenten clasificadores ligeros, detección de anomalías o sistemas de recuperación de objetos similares.
- Investigación en aprendizaje autosupervisado 3D: sirve como baseline reproducible para comparar métodos de destilación cross-modal 2D-3D sobre ScanObjectNN PB_T50_RS.
- Etiquetado asistido de datasets 3D: clasificación automática de nubes de puntos en bruto para preanotar grandes volúmenes de escaneos antes de la revisión humana.
- Prototipado en entornos con recursos limitados: al ocupar 0,1 GB y requerir poca memoria, puede ejecutarse en una GPU de consumo o incluso en CPU para pruebas de concepto.
- Transfer learning a dominios específicos: sustituir la cabeza de 15 clases por una nueva y afinar sobre un dataset propio de nubes de puntos con pocas muestras, aprovechando las representaciones preentrenadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados) sobre ScanObjectNN (PB_T50_RS):

| Métrica | Valor |
|---|---|
| Overall Accuracy (OA) | 88,27 |
| Mean Accuracy (mAcc) | 86,63 |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,1 M de parámetros en fp32 el modelo ocupa aproximadamente 88 MB de pesos, más el espacio para activaciones de la nube de puntos (dependiente del número de puntos y del batch).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU para inferencia puntual.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, RTX 3060, etc.).
- Opciones de despliegue: la librería `torch-pointcloud` (`tp.create_model`) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (clasificación de nubes de puntos sobre ScanObjectNN). Por tanto, la comparativa se limita a los datos del propio modelo.

| Modelo | Parámetros | Contexto/entrada | OA (PB_T50_RS) | Licencia |
|---|---|---|---|---|
| act.scanobjectnn-hardest.runpei-dong | 22,1 M | 8192 puntos | 88,27 | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de nubes de puntos; no es un modelo de lenguaje ni multimodal en el sentido habitual.
- Los resultados de benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); deben tomarse con cautela.
- Entrenado sobre ScanObjectNN PB_T50_RS con 15 clases concretas; el rendimiento fuera de esa distribución (otros sensores, densidades o categorías) no está documentado.
- No hay información sobre sesgos del dataset ni sobre el impacto de la perturbación PB_T50_RS en la robustez real.
- Riesgo de sobreajuste a las condiciones de captura de ScanObjectNN; se recomienda validación en el dominio objetivo antes de producción.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución al autor original y a la conversión.
- No se documentan cuantizaciones oficiales ni formatos alternativos a safetensors.
- La fecha de creación del repositorio (2026-10-30) y el bajo número de descargas (19) sugieren un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/act.scanobjectnn-hardest.runpei-dong
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/act.pretrain.runpei-dong
- Paper ACT (arXiv): https://arxiv.org/abs/2212.08320
- Repositorio original ACT: https://github.com/RunpeiDong/ACT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset ScanObjectNN (paper): https://arxiv.org/abs/1905.03665 (Uy et al., ICCV 2019, según cita de la model card)
