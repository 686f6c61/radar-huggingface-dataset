# torch-pointcloud/point-mae-base.shapenetpart.yatian-pang

## Resumen

Point-MAE es un modelo de segmentación de partes de nubes de puntos basado en el paradigma de autoencoder enmascarado (masked autoencoder, MAE) adaptado al dominio 3D. Esta ficha concreta corresponde al checkpoint afinado sobre el dataset ShapeNetPart por Yatian Pang y redistribuido por la organización `torch-pointcloud` dentro de su librería `pytorch-pointcloud`, que facilita la carga del modelo con una API de una sola llamada (`tp.create_model`).

El modelo parte del preentrenamiento autosupervisado de Point-MAE (ECCV 2022) y se especializa en una tarea discriminativa densa: asignar a cada punto de una nube una de las 50 etiquetas de parte disponibles en ShapeNetPart, condicionada por la categoría global del objeto. Con 27,1 millones de parámetros y un formato de pesos safetensors, es un modelo compacto pensado para investigación en visión 3D y para integrarse en pipelines de segmentación semántica de objetos CAD o escaneos sintéticos.

Su relevancia actual es doble: por un lado, sirve como referencia reproducible para comparar estrategias de preentrenamiento autosupervisado en 3D; por otro, demuestra la viabilidad de empaquetar checkpoints de investigación en una librería unificada con conversión de pesos, transformaciones de datos y utilidades de *collate*, lo que reduce la fricción de reproducción. No es un modelo generativo de texto ni un modelo multimodal: opera exclusivamente sobre coordenadas (y opcionalmente normales) de nubes de puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para nubes de puntos con autoencoder enmascarado (Point-MAE), cabeza de segmentación por punto |
| Parametros totales | 27.071.794 (27,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 8192 puntos en el ejemplo de uso (num_points configurable por la transformación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `torch-pointcloud`, PyTorch) |
| Clases de salida | 50 clases de parte (segmentación) |
| Dimensión de features | 3392 |
| Dataset de entrenamiento | ShapeNetPart |
| Tamaño del repo | 0,1 GB |
| Modelo base | torch-pointcloud/point-mae-base.pretrain.yatian-pang |

## Arquitectura y entrenamiento

Point-MAE aplica la receta del masked autoencoder al dominio de nubes de puntos: la nube se divide en parches (grupos de puntos) mediante muestreo y agrupación, se enmascara una fracción alta de esos parches y un encoder transformer procesa únicamente los visibles, mientras un decoder ligero reconstruye las coordenadas de los parches ocultos. El preentrenamiento es, por tanto, autosupervisado y no requiere etiquetas, lo que permite explotar grandes colecciones de mallas 3D sin anotación manual. La innovación principal del trabajo original es el diseño del enmascaramiento y de la reconstrucción a nivel de parche, que evita la fuga de información posicional y hace que la tarea pretexto sea genuinamente difícil.

Este checkpoint concreto es el resultado del *fine-tuning* supervisado sobre ShapeNetPart a partir del modelo preentrenado `point-mae-base.pretrain.yatian-pang`. La cabeza de segmentación recibe las features por punto concatenadas con un embedding de la categoría global del objeto, de modo que la predicción de partes está condicionada por la clase (por ejemplo, distinguir el ala de un avión frente al ala de una silla). El autor declara 50 clases de parte y una dimensión de features de 3392, coherente con la concatenación de representaciones globales y locales. No se documentan en la información disponible detalles sobre número de tokens de preentrenamiento, composición exacta del corpus 3D, ni sobre el uso de RLHF/DPO, que no aplica en este dominio.

## Capacidades

- Segmentación de partes de nubes de puntos: asigna una etiqueta de parte a cada punto de entrada, entre 50 clases posibles.
- Condicionamiento por categoría: la predicción incorpora la clase global del objeto como entrada, lo que mejora la coherencia de las partes predichas.
- Extracción de features: `forward_features` devuelve representaciones por punto; con `reset_classifier(num_classes=0)` se obtiene un vector de 3392 dimensiones utilizable como descriptor para tareas aguas abajo.
- Procesamiento de nubes con normales: la transformación de datos acepta `pos` (coordenadas) y `normal` (normales por punto).
- Manejo de lotes: la utilidad `collate` agrupa muestras con índices de batch, permitiendo inferencia por lotes de nubes de distinto tamaño.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo sobre geometría 3D.
- No dispone de modo *thinking*, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- Segmentación de partes en objetos CAD: dado un modelo 3D de una silla, un avión o un coche, el modelo etiqueta cada punto como respaldo, pata, ala, rueda, etc., lo que permite indexar y buscar componentes dentro de catálogos de mallas.
- Preprocesado para pipelines de fabricación y diseño: la separación automática en partes facilita tareas de descomposición de mallas, generación de instrucciones de ensamblaje o cálculo de volúmenes por componente.
- Etiquetado asistido de datasets 3D: el modelo puede generar preanotaciones de partes que un humano revisa después, reduciendo el coste de anotación en proyectos de visión 3D.
- Extracción de descriptores para recuperación de formas: usando las features de 3392 dimensiones como embedding, se puede construir un índice vectorial para búsqueda de modelos 3D por similitud geométrica.
- Inicialización para tareas 3D aguas abajo: el checkpoint preentrenado y este afinado sirven como punto de partida para *fine-tuning* en segmentación semántica de escenas, detección o clasificación, aprovechando las representaciones aprendidas de forma autosupervisada.
- Evaluación y reproducción de investigación: sirve como baseline reproducible con métricas declaradas sobre ShapeNetPart para comparar nuevas arquitecturas o estrategias de preentrenamiento en 3D.
- Robótica y manipulación: la segmentación por partes de un objeto percibido por un sensor de profundidad puede informar la selección de puntos de agarre o la planificación de manipulaciones sobre componentes concretos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Tarea | Métrica | Valor |
|---|---|---|---|
| ShapeNetPart | Segmentación de partes de nubes de puntos | ins_mIoU | 86,2 |
| ShapeNetPart | Segmentación de partes de nubes de puntos | cls_mIoU | 84,22 |

No se han publicado en la información disponible resultados adicionales (clasificación ModelNet40, segmentación semántica de escenas, FewShot Part Segmentation) ni comparativas numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada: con 27,1 M de parámetros en fp32, los pesos ocupan aproximadamente 108 MB; la inferencia completa con 8192 puntos por muestra requiere típicamente menos de 2 GB de VRAM, incluyendo activaciones y buffers de atención.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes y entrenamiento se recomiendan A100, H100, L40S o RTX 4090. Para inferencia interactiva, una RTX 3060 de 12 GB o superior es más que suficiente.
- Cabe holgadamente en GPU de consumo: GTX 1660, RTX 2060, RTX 3050 y superiores pueden ejecutar el modelo en fp32; en fp16 el margen es aún mayor.
- Despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) con `tp.create_model`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo. Para servir en producción sería necesario envolver el modelo en un servicio propio (por ejemplo, FastAPI o TorchServe).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un transformer sobre 8192 puntos con 27 M de parámetros, se espera latencia de milisegundos por muestra en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Métrica ShapeNetPart | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| point-mae-base.shapenetpart.yatian-pang | 27,1 M | Segmentación de partes | 8192 puntos (configurable) | ins_mIoU 86,2 / cls_mIoU 84,22 | MIT | HuggingFace, librería torch-pointcloud |
| Point-MAE (checkpoint original de Pang-Yatian) | ~22-27 M (no confirmado en la información disponible) | Preentrenamiento + fine-tuning | nubes de puntos | no disponible en esta ficha | MIT | GitHub Pang-Yatian/Point-MAE |
| Otros modelos de segmentación de partes 3D | no disponible | Segmentación de partes | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos numéricos de modelos alternativos (PointNet++, DGCNN, Point Transformer, Point-BERT) que permitan una comparación rigurosa; por tanto, la comparativa se limita al modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre ShapeNetPart, compuesto por objetos CAD sintéticos de 16 categorías y 50 clases de parte; el rendimiento en escaneos reales con ruido, oclusión o densidad irregular puede degradarse notablemente.
- Dependencia de la categoría: el modelo requiere la etiqueta global del objeto como entrada; un error en esa etiqueta condiciona toda la segmentación de partes.
- Resolución de entrada: el ejemplo usa 8192 puntos; desviaciones grandes respecto a la distribución de entrenamiento pueden afectar a la calidad de la predicción.
- Métricas no verificadas: los valores de ins_mIoU y cls_mIoU están declarados por el autor con `verified: false`; no se han reproducido de forma independiente en la información disponible.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni int8, lo que limita el despliegue en entornos sin PyTorch.
- Riesgo de alucinación en sentido geométrico: el modelo puede asignar partes plausibles pero incorrectas en objetos ambiguos o mal alineados con las categorías de ShapeNetPart; conviene validar con umbrales de confianza.
- Sesgos de dataset: ShapeNetPart sobrerrepresenta ciertas categorías (aviones, sillas, coches) frente a otras; el rendimiento esperado no es uniforme entre clases.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución al trabajo original (Pang et al., ECCV 2022) y al autor de la conversión.
- Madurez: 9 descargas y 0 likes en el momento de redactar; es un artefacto de investigación, no un modelo con soporte de producción ni garantías de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/point-mae-base.shapenetpart.yatian-pang
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/point-mae-base.pretrain.yatian-pang
- Paper (Masked Autoencoders for Point Cloud Self-supervised Learning, ECCV 2022): https://arxiv.org/abs/2203.06604
- Repositorio original de Point-MAE: https://github.com/Pang-Yatian/Point-MAE
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
