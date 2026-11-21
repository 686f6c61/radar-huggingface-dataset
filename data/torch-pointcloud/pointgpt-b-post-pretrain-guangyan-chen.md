# torch-pointcloud/pointgpt-b.post-pretrain.guangyan-chen

## Resumen

PointGPT-B post-pretrain es un modelo de clasificación de nubes de puntos 3D basado en la arquitectura PointGPT, un transformer generativo autorregresivo presentado en el paper "PointGPT: Auto-regressively Generative Pre-training from Point Clouds" (NeurIPS 2023). Lo desarrolla el grupo de Guangyan Chen (BIT) y esta versión concreta ha sido convertida y publicada por el proyecto torch-pointcloud (Arthur Dujardin) como checkpoint afinado sobre el dataset LabeledHybrid.

El modelo parte de un preentrenamiento generativo autorregresivo sobre nubes de puntos y se afina posteriormente para clasificación con 87 clases de salida y un vector de características de 1536 dimensiones. Con 120,4 millones de parámetros, se sitúa en la gama "base" de la familia PointGPT y está pensado para tareas de reconocimiento de formas 3D a partir de coordenadas XYZ.

Su relevancia actual radica en que ofrece una implementación práctica y empaquetada (librería torch-pointcloud, pesos en safetensors, licencia MIT) de un método de preentrenamiento generativo para geometría 3D, un área donde la mayoría de checkpoints disponibles son discriminativos y con licencias más restrictivas. No es un modelo de lenguaje: no procesa texto ni imágenes, solo nubes de puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer PointGPT (preentrenamiento generativo autorregresivo sobre nubes de puntos) |
| Parametros totales | 120.412.599 (120,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de hasta 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico, procesa geometria 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 87 |
| Dimension del embedding | 1536 |
| Dataset de afinado | LabeledHybrid |
| Modelo base | torch-pointcloud/pointgpt-b.pretrain.guangyan-chen |
| Libreria | torch-pointcloud (PyTorch) |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer que aplica el paradigma de preentrenamiento generativo autorregresivo (estilo GPT) al dominio de las nubes de puntos. La idea central del paper es dividir la nube de puntos en parches ordenados y entrenar al modelo para predecir el siguiente parche a partir de los anteriores, de forma análoga a la predicción del siguiente token en modelos de lenguaje. Esto permite aprender representaciones geométricas ricas sin necesidad de etiquetas.

Este checkpoint concreto es el resultado de afinar (post-pretrain) el modelo base preentrenado sobre el dataset LabeledHybrid, con una cabeza de clasificación de 87 clases y un espacio latente de 1536 dimensiones. La información disponible no detalla el número exacto de tokens/parches de entrenamiento, la composición pormenorizada del dataset LabeledHybrid ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables en este dominio). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; el paper original describe el mecanismo de preentrenamiento autorregresivo como principal contribución.

## Capacidades

- Clasificación de nubes de puntos 3D en 87 clases.
- Extracción de características (embeddings de 1536 dimensiones) mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos de hasta 8192 puntos en el ejemplo de uso documentado.
- Entrada basada en coordenadas XYZ (`pos`) con soporte de batching mediante `collate`.
- No soporta tool calling, function calling ni agentes: es un modelo puramente perceptivo de visión 3D.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión 2D, audio ni otras modalidades.

## Casos de uso

- Clasificación de objetos 3D en pipelines de robótica: el modelo recibe la nube de puntos captada por un sensor LiDAR o RGB-D y devuelve una de las 87 clases, útil para reconocimiento de objetos manipulables.
- Segmentación previa en conducción autónoma: clasificar clusters de puntos LiDAR para etiquetar obstáculos, peatones o vehículos antes de un módulo de planificación.
- Inventario y control de calidad industrial: escanear piezas 3D y clasificarlas automáticamente en categorías predefinidas para detectar defectos o piezas fuera de catálogo.
- Extracción de embeddings para búsqueda por similitud geométrica: usar los vectores de 1536 dimensiones para construir un índice vectorial de modelos 3D y recuperar formas parecidas.
- Preentrenamiento base para tareas downstream: el checkpoint puede servir como inicialización para afinado en tareas de segmentación o detección con menos datos etiquetados.
- Digitalización de patrimonio y arquitectura: clasificar nubes de puntos de escaneos 3D en categorías de elementos estructurales o decorativos.
- Investigación en aprendizaje autosupervisado 3D: reproducir el paradigma generativo autorregresivo de PointGPT sobre nuevos datasets con la librería torch-pointcloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 120,4 M de parámetros en precisión FP32 los pesos ocupan aproximadamente 0,48 GB; en FP16 unos 0,24 GB. Sumando activaciones y el procesamiento de nubes de 8192 puntos, se estima un uso de VRAM en el rango de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se recomiendan RTX 3060, RTX 4090, A100 o H100 para mayor throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante), dado el reducido tamaño del modelo.
- Opciones de despliegue: la librería oficial es torch-pointcloud sobre PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a modelos de nubes de puntos).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-B post-pretrain (este) | 120,4 M | Clasificación de nubes de puntos (87 clases) | Nubes de hasta 8192 puntos (ejemplo) | MIT | Hugging Face (torch-pointcloud) |
| PointGPT-B pretrain (modelo base) | 120,4 M | Preentrenamiento generativo (representaciones) | Nubes de puntos | MIT | Hugging Face (torch-pointcloud) |
| PointNet / PointNet++ | no disponible | Clasificación y segmentación 3D | Nubes de puntos | MIT (implementaciones de referencia) | Repos públicos |
| Point Transformer | no disponible | Clasificación y segmentación 3D | Nubes de puntos | no disponible | Repos públicos |

La comparación con PointNet/Point Transformer es cualitativa: la información disponible no incluye métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en nubes de puntos 3D; no procesa texto, imágenes 2D ni audio.
- El checkpoint está afinado sobre el dataset LabeledHybrid con 87 clases concretas; su utilidad fuera de ese vocabulario es limitada sin reentrenamiento.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un dataset concreto puede heredar los desequilibrios de clases y la distribución geométrica de LabeledHybrid.
- Riesgo de degradación ante distribuciones de puntos distintas a las de entrenamiento (resolución, ruido de sensor, densidad variable).
- El número máximo de puntos soportado no está documentado formalmente; el ejemplo usa 8192 puntos, pero no se garantiza comportamiento óptimo fuera de ese rango.
- Licencia MIT permite uso comercial, pero conviene revisar las licencias del dataset LabeledHybrid y del código original de PointGPT (MIT) antes de desplegar en producción.
- No hay información sobre calibración de confianza ni sobre el rendimiento en clases poco representadas; en producción se recomienda validar con datos propios antes de confiar en las predicciones.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.post-pretrain.guangyan-chen
- Modelo base en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.pretrain.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de torch-pointcloud: https://doi.org/10.5281/zenodo.22159632
