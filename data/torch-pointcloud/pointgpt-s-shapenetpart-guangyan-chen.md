# torch-pointcloud/pointgpt-s.shapenetpart.guangyan-chen

## Resumen

PointGPT-s aplicado a segmentación de partes de nubes de puntos (ShapeNetPart) es un modelo de visión 3D desarrollado por el autor Guangyan Chen (CGuangyan-BIT) y empaquetado para la librería `torch-pointcloud` por Arthur Dujardin. Implementa la arquitectura PointGPT, un transformer generativo autorregresivo presentado en NeurIPS 2023, adaptado aquí como cabecera de segmentación por partes sobre el checkpoint preentrenado `pointgpt-s.pretrain.guangyan-chen`. Resuelve la tarea de asignar una etiqueta de parte (entre 50 clases) a cada punto de una nube, dado también el identificador de categoría del objeto.

El modelo es compacto: 27.037.106 parámetros totales (27,0 M) y un vector de características de 3392 dimensiones. Se distribuye en formato `safetensors` con un tamaño de repositorio de 0,1 GB, lo que lo hace muy ligero para despliegue en CPU o GPU de consumo. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que ofrece un punto de partida reproducible para tareas de segmentación semántica fina en 3D dentro del ecosistema PyTorch, con métricas declaradas de 85,98 ins_mIoU y 84,58 cls_mIoU sobre ShapeNetPart. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino nubes de puntos con coordenadas y normales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer generativo autorregresivo (PointGPT) con cabecera de segmentación por partes |
| Parámetros totales | 27.037.106 (27,0 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, 8192 puntos en el ejemplo de uso) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 50 (partes) |
| Dimensión de características | 3392 |
| Dataset de entrenamiento | ShapeNetPart |
| Modelo base | torch-pointcloud/pointgpt-s.pretrain.guangyan-chen |
| Librería | torch-pointcloud |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer que aplica preentrenamiento generativo autorregresivo a nubes de puntos, inspirándose en el paradigma de los modelos de lenguaje: divide la nube en secuencias de parches y predice el siguiente parche a partir de los anteriores. El checkpoint aquí publicado parte del modelo preentrenado `pointgpt-s.pretrain.guangyan-chen` y se afina (finetune) para la tarea de segmentación de partes sobre ShapeNetPart, incorporando la categoría del objeto como entrada adicional (`data["category"]`) junto con posiciones (`pos`), normales (`normal`) y el índice de lote (`batch`).

El modelo consume nubes de puntos con coordenadas y normales; en el ejemplo de la model card se emplean 8192 puntos por muestra. La salida es un logits por punto y por clase de parte (50 clases). El entrenamiento se realizó sobre el dataset ShapeNetPart, derivado del trabajo de Yi et al. (2016) sobre anotación de regiones en colecciones 3D. No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset, uso de RLHF/DPO ni innovaciones adicionales más allá de las descritas en el paper de PointGPT (arXiv:2305.11487).

## Capacidades

- Segmentación de partes de nubes de puntos: asigna una etiqueta de parte (50 clases) a cada punto de la nube, condicionada por la categoría del objeto.
- Extracción de características: mediante `forward_features` o `reset_classifier(num_classes=0)` se obtiene un vector de 3392 dimensiones por muestra, útil para tareas downstream.
- Procesamiento de nubes de puntos con coordenadas y normales (entrada de 3 dimensiones por punto más normales).
- Integración con PyTorch mediante la librería `torch-pointcloud` (`tp.create_model`, transformaciones y `collate`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación semántica de piezas en escaneos 3D industriales: el modelo etiqueta cada punto de una nube capturada por escáner o LiDAR con su parte correspondiente, lo que permite separar componentes de una pieza mecánica para inspección o control de calidad.
- Reconstrucción y modelado asistido en CAD: dado un objeto escaneado, la segmentación por partes facilita la identificación de regiones (asas, patas, tapas) para su posterior ajuste a primitivas geométricas.
- Robótica de manipulación: la segmentación punto a punto permite a un brazo robótico identificar la parte agarrable de un objeto (por ejemplo, el mango de una herramienta) antes de planificar la prensión.
- Anotación automática de datasets 3D: el modelo puede preetiquetar nubes de puntos nuevas con las 50 clases de ShapeNetPart, reduciendo el coste de anotación manual en pipelines de datos para visión 3D.
- Extracción de embeddings para búsqueda y clustering: usando la salida de 3392 dimensiones, se pueden agrupar objetos por similitud geométrica o construir índices de recuperación de formas 3D.
- Prototipado e investigación en visión 3D: al ser un modelo de 27 M de parámetros y 0,1 GB, se puede ejecutar en portátiles o GPUs de consumo para experimentar con arquitecturas autorregresivas aplicadas a nubes de puntos.
- Educación y reproducción de resultados: sirve como referencia reproducible de PointGPT sobre ShapeNetPart con métricas declaradas, útil para comparar variantes o validar pipelines de `torch-pointcloud`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| point-cloud-part-segmentation | ShapeNetPart | ins_mIoU | 85,98 |
| point-cloud-part-segmentation | ShapeNetPart | cls_mIoU | 84,58 |

No se han publicado en la información disponible resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 27 M de parámetros en FP32 los pesos ocupan aproximadamente 108 MB, y en FP16 unos 54 MB. La memoria dominante será la de las activaciones de la nube de puntos (8192 puntos por muestra en el ejemplo).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las GPU de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud`; no se han publicado integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de nubes de puntos).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo de 27 M de parámetros, se espera latencia de milisegundos por muestra en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Métrica ShapeNetPart | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-s.shapenetpart (este) | 27,0 M | 8192 puntos (ejemplo) | ins_mIoU 85,98; cls_mIoU 84,58 | MIT | HuggingFace + torch-pointcloud |
| PointGPT-S preentrenado (base) | no disponible | no disponible | no disponible | MIT | HuggingFace |
| Alternativas de segmentación 3D (PointNet++, DGCNN, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de modelos comparables bajo las mismas condiciones, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Modelo especializado en nubes de puntos: no procesa texto, imágenes 2D ni audio; no debe presentarse como un modelo de lenguaje.
- Dominio restringido: entrenado sobre ShapeNetPart (50 clases de partes de objetos), por lo que su generalización a categorías fuera de ese dataset no está garantizada.
- Métricas no verificadas: los valores de ins_mIoU y cls_mIoU están marcados como `verified: false` en la model card; deben tomarse como declaraciones del autor.
- Dependencia de la categoría: la inferencia requiere proporcionar el identificador de categoría del objeto (`data["category"]`), lo que limita su uso en escenarios donde la categoría no se conoce a priori.
- Sensibilidad a la densidad y al ruido de la nube: el ejemplo usa 8192 puntos; no se documenta el comportamiento con otras densidades o con nubes ruidosas.
- Riesgo de alucinación en el sentido de asignaciones erróneas de parte en puntos ambiguos o en objetos atípicos; no hay evaluación de calibración publicada.
- Sin información sobre sesgos: no se han publicado análisis de sesgo geométrico o de dominio.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales (Chen et al.) y a la librería `torch-pointcloud`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, lo que aumenta el riesgo de problemas no documentados en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointgpt-s.shapenetpart.guangyan-chen
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/pointgpt-s.pretrain.guangyan-chen
- Paper PointGPT (arXiv:2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ShapeNetPart (Yi et al., 2016): no disponible como enlace directo en la información proporcionada
