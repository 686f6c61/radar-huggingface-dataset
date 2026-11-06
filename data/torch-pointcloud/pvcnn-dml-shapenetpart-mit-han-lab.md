# torch-pointcloud/pvcnn-dml.shapenetpart.mit-han-lab

## Resumen

PVCNN-DML es un modelo de segmentación de partes de nubes de puntos 3D, concretamente una implementación del Point-Voxel CNN (PVCNN) con rama de puntos y rama de vóxeles fusionadas, entrenado sobre el conjunto de datos ShapeNetPart. Lo desarrolla el grupo MIT HAN Lab (Zhijian Liu, Haotian Tang, Yujun Lin y Song Han) y esta versión concreta ha sido convertida y publicada en Hugging Face por el usuario `torch-pointcloud` como parte de la librería PyTorch PointCloud de Arthur Dujardin. El modelo resuelve la tarea de asignar una etiqueta de parte (por ejemplo, ala, motor, fuselaje) a cada punto de una nube que representa un objeto 3D.

A diferencia de los modelos de lenguaje, PVCNN-DML es una red convolucional específica para geometría 3D: recibe nubes de puntos con coordenadas y normales (6 canales de entrada) y produce logits por punto sobre 50 clases de parte. Con solo 4,2 millones de parámetros, es un modelo extremadamente ligero pensado para inferencia eficiente en GPUs de consumo e incluso en entornos con recursos limitados.

Su relevancia actual radica en que ofrece un punto de partida reproducible y con licencia MIT para tareas de segmentación 3D en pipelines de visión por computador, robótica o análisis de mallas, dentro del ecosistema de PyTorch PointCloud, que unifica la carga, el preprocesado y la inferencia de distintos modelos de nubes de puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point-Voxel CNN (PVCNN), rama de puntos y rama de voxeles fusionadas |
| Parametros totales | 4.208.754 (4,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (coordenadas xyz + normales) |
| Clases de salida | 50 |
| Dimension de caracteristicas | 4944 |
| Dataset de entrenamiento | ShapeNetPart |

## Arquitectura y entrenamiento

PVCNN combina dos representaciones complementarias de la geometría 3D: una rama que opera directamente sobre los puntos (point branch), que preserva la resolución fina y la información de vecindad local, y una rama que voxeliza la nube y aplica convoluciones 3D (voxel branch), que captura contexto espacial de forma más eficiente en memoria que las convoluciones sobre puntos. Las salidas de ambas ramas se fusionan para producir las predicciones por punto. Esta hibridación es la innovación central del artículo "Point-Voxel CNN for Efficient 3D Deep Learning" (NeurIPS 2019), que busca reducir el coste computacional y de memoria frente a arquitecturas puramente basadas en puntos o en vóxeles densos.

El modelo se entrena sobre ShapeNetPart, un subconjunto de ShapeNet con anotaciones de partes por punto para 16 categorías de objetos y 50 clases de parte en total. La model card no detalla el número de tokens ni la composición exacta del dataset, ni si se emplearon técnicas de aumento de datos o regularización específicas; esa información no está disponible. Los pesos publicados son una conversión directa del repositorio original `mit-han-lab/pvcnn` (licencia MIT) al formato de la librería `torch-pointcloud`, con los parámetros ya empaquetados en safetensors.

## Capacidades

- Segmentación de partes por punto sobre nubes de puntos 3D (part segmentation), con salida de 50 clases.
- Procesamiento de nubes con coordenadas y normales (6 canales de entrada), con transformaciones y collate integrados en la librería.
- Extracción de características: mediante `forward_features` o `reset_classifier(num_classes=0)` se obtienen embeddings de dimensión 4944 por punto, útiles para tareas downstream.
- Inferencia por lotes con manejo de índices de batch (`data["batch"]`) para múltiples nubes en una misma pasada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación de partes en escaneos 3D de objetos: dado un escaneo de una silla, un avión o un coche, el modelo etiqueta cada punto con su parte correspondiente (patas, alas, ruedas), lo que permite descomponer el objeto en componentes para análisis o edición.
- Preprocesado para pipelines de robótica manipulativa: identificar las partes de un objeto antes de planificar una agarradura o una interacción, usando los embeddings de 4944 dimensiones como entrada a un módulo de control.
- Anotación asistida de datasets 3D: generar etiquetas por punto de forma automática sobre nuevas nubes y revisar solo los casos dudosos, reduciendo el coste de anotación manual en proyectos de visión 3D.
- Análisis de mallas y CAD: descomponer modelos 3D en partes semánticas para tareas de simplificación, retopología o exportación por componentes en herramientas de diseño.
- Extracción de características para clasificación o retrieval 3D: usar el modelo como extractor congelado y entrenar un clasificador ligero encima para reconocimiento de categorías de objetos o búsqueda de formas similares.
- Despliegue en dispositivos con recursos limitados: con 4,2 M de parámetros cabe en GPUs de consumo e incluso en CPU para lotes pequeños, lo que permite integrarlo en estaciones de trabajo sin aceleradores dedicados.
- Investigación y reproducción de experimentos: servir de baseline reproducible para comparar nuevas arquitecturas de segmentación de nubes de puntos sobre ShapeNetPart con métricas estándar (ins_mIoU, cls_mIoU).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ShapeNetPart | point-cloud-part-segmentation | ins_mIoU | 86,01 |
| ShapeNetPart | point-cloud-part-segmentation | cls_mIoU | 84,44 |

No se han publicado en la información disponible resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas de MB para los pesos (4,2 M de parámetros en precisión completa suponen aproximadamente 17 MB) más el coste de activaciones, que depende del número de puntos por nube y del tamaño de lote.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y también en A100/H100 si se integra en un pipeline mayor.
- Cabe en GPU de consumo: sí, con margen amplio; también es viable en CPU para inferencia de lotes pequeños.
- Opciones de despliegue: la vía oficial es la librería `torch-pointcloud` (`pip install torch-pointcloud`) sobre PyTorch. No se han publicado conversiones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del número de puntos de entrada (el ejemplo de la model card usa 8192 puntos) y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset | Metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PVCNN-DML (este modelo) | 4,2 M | Nube de puntos, 6 canales | ShapeNetPart | ins_mIoU 86,01 / cls_mIoU 84,44 | MIT | Hugging Face, libreria torch-pointcloud |
| PointNet++ | no disponible en la informacion | Nube de puntos | ShapeNetPart | no disponible en la informacion | no disponible en la informacion | Implementaciones de referencia en repositorios academicos |
| Point Transformer | no disponible en la informacion | Nube de puntos | ShapeNetPart | no disponible en la informacion | no disponible en la informacion | Implementaciones de referencia en repositorios academicos |
| DGCNN | no disponible en la informacion | Nube de puntos | ShapeNetPart | no disponible en la informacion | no disponible en la informacion | Implementaciones de referencia en repositorios academicos |

No se dispone de datos comparativos verificados de estos modelos alternativos en la información proporcionada; la comparación se limita a señalar que PVCNN destaca por su bajo número de parámetros y su enfoque híbrido punto-vóxel, orientado a eficiencia computacional.

## Limitaciones y advertencias

- Modelo específico de segmentación 3D: no genera texto, no razona y no admite instrucciones en lenguaje natural; cualquier uso fuera de nubes de puntos no es válido.
- Entrenado únicamente sobre ShapeNetPart (16 categorías de objetos, 50 clases de parte): su generalización a categorías no vistas o a dominios distintos (escaneos reales con ruido, LiDAR, nubes incompletas) puede degradarse notablemente.
- Requiere nubes con coordenadas y normales (6 canales); si no se dispone de normales, es necesario estimarlas previamente, lo que introduce dependencias adicionales.
- Las métricas declaradas (ins_mIoU 86,01 y cls_mIoU 84,44) están marcadas como no verificadas en la model card; conviene reproducirlas antes de usarlas como referencia en producción.
- Riesgo de sesgo ligado al dataset: ShapeNetPart contiene objetos sintéticos y categorías limitadas, por lo que el modelo puede fallar en geometrías orgánicas, objetos deformables o escenas completas.
- No se han documentado sesgos demográficos ni de otro tipo, pero al no ser un modelo de lenguaje no aplican las advertencias habituales de alucinación textual; el riesgo equivalente es la asignación errónea de etiquetas por punto.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales (MIT HAN Lab) y citar el paper y la librería según la model card.
- No hay cuantizaciones publicadas (GGUF, ONNX, etc.) ni optimizaciones de despliegue documentadas; el rendimiento en producción dependerá de la implementación en PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pvcnn-dml.shapenetpart.mit-han-lab
- Paper PVCNN: https://arxiv.org/abs/1907.03739
- Repositorio original MIT HAN Lab: https://github.com/mit-han-lab/pvcnn
- Libreria PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
