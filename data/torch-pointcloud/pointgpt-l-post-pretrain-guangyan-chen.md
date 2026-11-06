# torch-pointcloud/pointgpt-l.post-pretrain.guangyan-chen

## Resumen

PointGPT-L post-pretrain (guangyan-chen) es un modelo de clasificación de nubes de puntos 3D desarrollado por el autor C. Guangyan (CGuangyan-BIT) y empaquetado para la librería `torch-pointcloud` de Arthur Dujardin bajo el identificador `torch-pointcloud`. Se trata de un transformer generativo autorregresivo (PointGPT) preentrenado de forma autosupervisada sobre nubes de puntos y posteriormente ajustado para clasificación sobre el dataset LabeledHybrid con 87 clases de salida.

El modelo resuelve la tarea de clasificación de objetos 3D a partir de coordenadas de puntos (formato `pos` con tres componentes XYZ), devolviendo logits por clase o embeddings de 2048 dimensiones para tareas de extracción de características. Con 360,4 millones de parámetros y un repositorio de 1,4 GB en safetensors, se posiciona como un modelo de tamaño grande dentro de la familia PointGPT.

Es relevante para investigadores y desarrolladores que trabajan en visión 3D, robótica, conducción autónoma o digitalización industrial, ya que ofrece un pipeline reproducible en PyTorch con licencia MIT y conversión directa desde el repositorio original del paper (NeurIPS 2023). No es un modelo de lenguaje: no procesa texto ni imágenes 2D, sino geometría 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo autorregresivo (PointGPT), preentrenamiento GPT sobre nubes de puntos |
| Parametros totales | 360.384.439 (360,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico, procesa geometria 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 87 |
| Dimension de features | 2048 |
| Dataset de ajuste | LabeledHybrid |
| Libreria | torch-pointcloud |
| Modelo base | torch-pointcloud/pointgpt-l.pretrain.guangyan-chen |

## Arquitectura y entrenamiento

PointGPT es un transformer generativo autorregresivo que adapta el paradigma de preentrenamiento de GPT al dominio de las nubes de puntos. El modelo divide la nube en parches y los procesa secuencialmente, prediciendo el siguiente parche a partir de los anteriores, lo que permite un preentrenamiento autosupervisado sin etiquetas. La variante "L" corresponde al tamaño grande de la familia, con 360,4 M de parámetros.

El modelo aquí publicado parte del checkpoint preentrenado (`pointgpt-l.pretrain.guangyan-chen`) y ha sido ajustado (post-pretrain) sobre el dataset LabeledHybrid para clasificación en 87 clases. La model card no detalla el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La conversión procede del repositorio original CGuangyan-BIT/PointGPT (MIT) al formato de la librería `torch-pointcloud`.

## Capacidades

- Clasificación de nubes de puntos 3D en 87 clases a partir de coordenadas XYZ.
- Extracción de embeddings de 2048 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de muestras con hasta 8192 puntos (según el ejemplo de la model card).
- Preentrenamiento generativo autorregresivo que aporta representaciones transferibles a tareas downstream.
- Integración nativa con PyTorch mediante la librería `torch-pointcloud` (`tp.create_model`).
- Soporte de tool calling / function calling: no aplicable (modelo no lingüístico).
- Soporte de agentes y razonamiento multi-step: no aplicable.
- Capacidades multilingües: no aplicable.
- Vision 2D, audio o texto: no soportado; el modelo es exclusivamente 3D.

## Casos de uso

- Clasificación de objetos 3D en robótica: el modelo recibe la nube de puntos captada por un sensor LiDAR o RGB-D y devuelve la clase del objeto, útil para manipulación y navegación.
- Segmentación semántica de escenas industriales: extracción de embeddings de 2048 dimensiones por objeto para alimentar clasificadores downstream o clustering.
- Digitalización y catalogación de patrimonio: clasificación automática de escaneos 3D en 87 categorías para inventarios y archivos.
- Conducción autónoma: reconocimiento de clases de objetos en la nube de puntos del vehículo como componente de percepción.
- Control de calidad en fabricación: detección y clasificación de piezas 3D escaneadas en línea de producción.
- Búsqueda y recuperación de modelos 3D: uso de los embeddings como firma vectorial para motores de búsqueda por similitud geométrica.
- Investigación en representación 3D: base para fine-tuning en nuevos datasets con `reset_classifier` y extracción de features congeladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,5 GB solo para pesos (360,4 M × 4 bytes), más activaciones y memoria del grafo; en la práctica se recomienda al menos 4-6 GB.
- VRAM estimada en FP16/BF16: alrededor de 0,8 GB para pesos; viable en GPUs consumer con 8 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB (RTX 3060, RTX 4060, RTX 4090); para lotes grandes o entrenamiento, A100 o H100.
- Cabe en GPU consumer: sí, en RTX 3060/4060/4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / puntos | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-l.post-pretrain.guangyan-chen | 360,4 M | 8192 puntos (ejemplo) | Clasificacion 3D (87 clases) | MIT | HuggingFace + torch-pointcloud |
| PointGPT-S / PointGPT-B (familia original) | no disponible | no disponible | Clasificacion / segmentacion 3D | MIT | GitHub CGuangyan-BIT/PointGPT |
| Point-MAE | no disponible | no disponible | Preentrenamiento 3D (masked autoencoding) | MIT (repo original) | GitHub |
| Point-BERT | no disponible | no disponible | Preentrenamiento 3D (BERT-style) | MIT (repo original) | GitHub |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en nubes de puntos 3D; no procesa texto, imágenes 2D ni audio.
- Entrenado sobre el dataset LabeledHybrid con 87 clases; el rendimiento en clases fuera de esa taxonomía no está garantizado.
- No se documentan sesgos específicos del dataset ni su composición, lo que dificulta evaluar su robustez en dominios distintos al de entrenamiento.
- Riesgo de degradación ante nubes de puntos con ruido, oclusiones o densidades muy distintas a las del entrenamiento.
- No se publican métricas de benchmarks ni curvas de validación en la información disponible.
- Licencia MIT permite uso comercial, pero se recomienda revisar la licencia del dataset LabeledHybrid y del repositorio original CGuangyan-BIT/PointGPT.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta; no hay evidencia de uso en producción.
- Requiere la librería `torch-pointcloud` y familiaridad con su API de transformación y collate; no es un pipeline estándar de transformers.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/pointgpt-l.post-pretrain.guangyan-chen
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/pointgpt-l.pretrain.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original: https://github.com/CGuangyan-BIT/PointGPT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
