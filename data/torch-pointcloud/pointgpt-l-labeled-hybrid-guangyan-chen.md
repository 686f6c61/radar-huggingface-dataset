# torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen

## Resumen

PointGPT-L es un modelo de clasificación de nubes de puntos 3D basado en la arquitectura PointGPT, un transformer generativo autorregresivo presentado en el paper "PointGPT: Auto-regressively Generative Pre-training from Point Clouds" (NeurIPS 2023). Esta variante concreta, publicada por la organización `torch-pointcloud`, es un checkpoint afinado (fine-tuned) sobre el dataset LabeledHybrid a partir del modelo preentrenado `pointgpt-l.pretrain.guangyan-chen`. El modelo resuelve la tarea de clasificación de formas 3D representadas como conjuntos de puntos, asignando una de 87 clases a cada nube de puntos de entrada.

El modelo cuenta con 360,4 millones de parámetros y produce representaciones de 2048 dimensiones, lo que lo sitúa en la gama "large" de la familia PointGPT. Se distribuye en formato safetensors a través de la librería `torch-pointcloud` (PyTorch PointCloud), una implementación mantenida por Arthur Dujardin que facilita la carga, el entrenamiento y la extracción de características de modelos de nubes de puntos en PyTorch. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

Su relevancia radica en que ofrece un checkpoint listo para usar de un modelo de referencia en el ámbito de la visión 3D basada en puntos, con una API de alto nivel (`tp.create_model`) que abstrae la complejidad de la arquitectura. Es útil tanto para inferencia directa de clasificación como para extracción de embeddings de formas 3D en pipelines de recuperación, clustering o aprendizaje por transferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointGPT (transformer generativo autorregresivo para nubes de puntos) |
| Parametros totales | 360.384.439 (360,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos; ejemplo de la model card con 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; procesa geometria 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 87 |
| Dimension de caracteristicas | 2048 |
| Dataset de entrenamiento | LabeledHybrid |
| Modelo base | torch-pointcloud/pointgpt-l.pretrain.guangyan-chen |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer que aplica el paradigma de preentrenamiento generativo autorregresivo, popularizado por GPT en el dominio del lenguaje, al dominio de las nubes de puntos. La idea central del paper es dividir la nube de puntos en una secuencia de parches (patches) y entrenar al modelo para predecir el siguiente parche a partir de los anteriores, lo que obliga al transformer a aprender representaciones geométricas ricas y contextuales de la forma 3D. Esta variante "L" (large) del modelo emplea 360,4 M de parámetros y genera un vector de características de 2048 dimensiones.

El checkpoint aquí descrito parte del modelo preentrenado `pointgpt-l.pretrain.guangyan-chen` y se ha afinado sobre el dataset LabeledHybrid para la tarea supervisada de clasificación con 87 clases. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de refuerzo o preferencias (RLHF/DPO), algo esperable en un modelo de visión 3D. La conversión del código original (repositorio `CGuangyan-BIT/PointGPT`, licencia MIT) a la librería `torch-pointcloud` es el principal valor añadido de esta publicación, ya que estandariza la carga y el uso del modelo.

## Capacidades

- Clasificación de nubes de puntos 3D en 87 clases predefinidas.
- Extracción de características (embeddings) de 2048 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos de tamaño variable; la model card ilustra el uso con 8192 puntos.
- Inferencia por lotes (batching) mediante la función `collate` de la librería.
- Aprendizaje por transferencia: al ser un modelo afinado, puede reutilizarse como extractor congelado o reajustarse con `reset_classifier`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Clasificación automática de objetos 3D escaneados: el modelo asigna una de las 87 clases a una nube de puntos capturada por LiDAR o escáneres de profundidad, útil en inventario industrial o catalogación de piezas.
- Segmentación previa en pipelines de robótica: clasificar objetos detectados por la percepción 3D de un robot para decidir la estrategia de manipulación, aprovechando la inferencia por lotes de la librería.
- Recuperación de formas 3D (shape retrieval): extraer embeddings de 2048 dimensiones con `forward_features` e indexarlos en una base vectorial para búsqueda por similitud geométrica.
- Control de calidad en fabricación aditiva: comparar la nube de puntos de una pieza impresa con clases conocidas para detectar defectos o desviaciones de forma.
- Etiquetado asistido de datasets 3D: preclasificar grandes volúmenes de nubes de puntos para reducir el esfuerzo de anotación manual, con revisión humana posterior.
- Investigación en visión 3D: usar el checkpoint como baseline o extractor de características congelado en experimentos de aprendizaje por transferencia sobre nuevos dominios de nubes de puntos.
- Análisis de escenas urbanas o de interior: clasificar elementos capturados por sensores 3D en aplicaciones de gemelos digitales o modelado BIM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, exactitud ni comparaciones numéricas con otros modelos, y la búsqueda web no aporta resultados de evaluación para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 360,4 M de parámetros en precisión FP32 se requieren aproximadamente 1,4 GB solo para los pesos, más memoria para activaciones y la nube de puntos de entrada; en FP16/BF16 bajaría a unos 0,7 GB, aunque la librería no documenta cuantización.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en FP32 con lotes pequeños; una NVIDIA RTX 3060, RTX 4090, A100 o H100 es más que suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (GTX 1660 Ti, RTX 2060 y superiores).
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` sobre PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-l.labeled-hybrid.guangyan-chen | 360,4 M | 87 | nubes de puntos (ej. 8192 puntos) | MIT | Hugging Face (torch-pointcloud) |
| pointgpt-l.post-pretrain.guangyan-chen | no disponible | no disponible | nubes de puntos | MIT | Hugging Face (torch-pointcloud) |
| PointGPT original (CGuangyan-BIT/PointGPT) | no disponible | según dataset | nubes de puntos | MIT | GitHub |

La comparación con modelos de otras familias (PointNet++, Point Transformer, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre LabeledHybrid, el modelo puede rendir peor en dominios geométricos alejados de la distribución de ese dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí puede producir clasificaciones erróneas con alta confianza en formas ambiguas o ruidosas.
- Limitaciones de contexto o idioma: no es un modelo lingüístico; la nube de puntos de entrada debe ajustarse al formato esperado (posiciones 3D, batching mediante `collate`). No se documenta el número máximo de puntos soportado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; conviene conservar los avisos de copyright del paper y de la librería.
- Caveats para producción: el modelo tiene solo 28 descargas y 0 likes, por lo que su validación comunitaria es mínima; se recomienda evaluar su precisión en el dominio objetivo antes de desplegarlo. La model card no documenta métricas de rendimiento ni robustez frente a ruido, oclusiones o densidades variables.
- Dependencia de la librería: requiere `torch-pointcloud` y una versión compatible de PyTorch; cambios en la API de la librería podrían afectar a la carga del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen
- Modelo post-pretrain relacionado: https://huggingface.co/torch-pointcloud/pointgpt-l.post-pretrain.guangyan-chen
- Colección PointGPT en Hugging Face: https://huggingface.co/collections/torch-pointcloud/pointgpt
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
