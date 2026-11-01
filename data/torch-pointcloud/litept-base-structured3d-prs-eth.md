# torch-pointcloud/litept-base.structured3d.prs-eth

## Resumen

LitePT es un modelo de segmentación semántica de nubes de puntos 3D desarrollado por el grupo de investigación de Yuanwen Yue, Damien Robert y colaboradores (ETH Zúrich y Universidad de Cambridge, entre otras instituciones), y publicado en CVPR 2026. Este checkpoint concreto, `litept-base.structured3d.prs-eth`, ha sido convertido por el autor `torch-pointcloud` (Arthur Dujardin) para su uso con la librería `torch-pointcloud`, y está entrenado sobre el dataset Structured3D para segmentación semántica de interiores con 25 clases.

El modelo resuelve el problema de la clasificación punto a punto en nubes de puntos 3D, una tarea fundamental en percepción 3D, robótica, realidad aumentada y modelado de interiores. Su propuesta arquitectónica central es un transformer híbrido que combina convoluciones en las primeras etapas con atención con embeddings rotacionales 3D en las etapas finales, buscando un equilibrio entre eficiencia computacional y capacidad representacional. Con 45,1 millones de parámetros, se sitúa en la gama "base" de la familia LitePT, pensada para despliegue en entornos con recursos moderados.

Su relevancia actual radica en que ofrece una alternativa más ligera a los transformers de puntos de gran tamaño (como Point Transformer V3) manteniendo una arquitectura moderna con atención rotacional 3D, y en que su integración en `torch-pointcloud` facilita el uso directo en pipelines de PyTorch. No obstante, es un modelo de nicho, especializado exclusivamente en segmentación de nubes de puntos y entrenado en un único dominio (interiores sintéticos de Structured3D), lo que limita su generalización fuera de ese ámbito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido para nubes de puntos (convoluciones en etapas tempranas, atención con embedding rotacional 3D en etapas tardías) |
| Parametros totales | 45.120.742 (45,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa nubes de puntos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posición, color y normal) |
| Clases de salida | 25 |
| Dimensión de features | 72 |
| Dataset de entrenamiento | Structured3D |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

LitePT emplea una arquitectura híbrida para nubes de puntos en la que las primeras etapas usan convoluciones (probablemente convoluciones dispersas 3D, dado que el checkpoint requiere `spconv`) y las etapas finales emplean mecanismos de atención con embeddings rotacionales 3D (3D rotary embedding), lo que permite codificar información geométrica y direccional de forma más eficiente que la atención posicional tradicional. El modelo consume 6 canales de entrada por punto (coordenadas xyz, color RGB y vector normal) y produce logits por punto sobre 25 clases semánticas. La dimensión de features es de 72, un valor notablemente compacto que refleja el objetivo de ligereza de la familia LitePT.

El entrenamiento se realizó sobre Structured3D, un dataset fotorrealista de interiores estructurados con anotaciones semánticas e instancias. No se dispone en la información proporcionada de detalles sobre el número de tokens/puntos de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de refinamiento como RLHF o DPO (no aplicables en este dominio). El checkpoint es una conversión del repositorio oficial `prs-eth/LitePT` (licencia MIT) al formato de la librería `torch-pointcloud`, y requiere kernels GPU específicos (`spconv` y `flash-attn`) compilados para la versión de PyTorch y CUDA del usuario.

## Capacidades

- Segmentación semántica de nubes de puntos 3D punto a punto sobre 25 clases de interiores.
- Procesamiento de nubes de puntos con atributos de posición, color y normal (6 canales de entrada).
- Extracción de features por punto mediante `forward_features`, con salida de dimensión 72, útil como representación para tareas posteriores (detección, clasificación, clustering).
- Reconfiguración del clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como extractor de características puro.
- Ejecución en GPU exclusivamente (kernels GPU-only según la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente geométrico y no lingüístico.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación de escenas de interior para modelado 3D y BIM: el modelo clasifica cada punto de una nube capturada (por ejemplo, con LiDAR o fotogrametría) en clases como suelo, pared, techo, muebles, etc., facilitando la reconstrucción semántica de planos de viviendas y oficinas.
- Robótica de interior y navegación: un robot móvil puede usar el modelo para identificar superficies transitables (suelo) y obstáculos (paredes, muebles) a partir de su nube de puntos, apoyando la planificación de trayectorias en entornos domésticos.
- Realidad aumentada y virtual: permite anclar objetos virtuales sobre superficies semánticamente identificadas (por ejemplo, colocar un mueble virtual sobre el suelo detectado) en aplicaciones de diseño de interiores.
- Preprocesado para pipelines de reconstrucción y gemelos digitales: al extraer features por punto de dimensión 72, el modelo sirve como backbone para tareas aguas abajo como detección de instancias o segmentación panóptica, reduciendo el coste de entrenar un extractor desde cero.
- Anotación asistida y etiquetado semiautomático: dado que el modelo está entrenado en Structured3D, puede preetiquetar nubes de puntos de interiores similares para acelerar el trabajo de anotadores humanos, que solo revisan y corrigen las predicciones.
- Investigación en percepción 3D: sirve como baseline ligero (45,1 M de parámetros) para comparar arquitecturas híbridas convolución-atención en tareas de segmentación semántica sobre nubes de puntos, con un coste computacional contenido.
- Integración en herramientas de escaneo móvil: aplicaciones de captura 3D en dispositivos con GPU pueden ejecutar el modelo para segmentar la escena en tiempo de captura, siempre que se cumplan los requisitos de `spconv` y `flash-attn`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 45,1 M de parámetros en precisión FP32 los pesos ocupan aproximadamente 180 MB, y el consumo real dependerá del número de puntos procesados por lote y de las estructuras dispersas de `spconv`.
- GPU recomendadas: no se especifican en la model card; requiere una GPU compatible con `spconv` y `flash-attn` (típicamente arquitecturas NVIDIA Ampere o superiores, como A100, H100, RTX 3090 o RTX 4090).
- Cabe en GPU de consumo: previsiblemente sí en GPUs NVIDIA modernas con al menos 8-12 GB de VRAM, aunque el dato exacto no está disponible y depende del tamaño de la nube de puntos.
- Opciones de despliegue: la librería `torch-pointcloud` (PyTorch), con dependencias de `spconv` y `flash-attn` compiladas para la versión de PyTorch y CUDA del entorno. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LitePT base (este checkpoint) | 45,1 M | Nubes de puntos, 6 canales, 25 clases | Segmentación semántica 3D | MIT | HuggingFace (`torch-pointcloud`) |
| Point Transformer V3 | no disponible en la información | Nubes de puntos | Segmentación semántica 3D | no disponible | Repositorio oficial |
| Minkowski Engine / MinkUNet | no disponible en la información | Nubes de puntos dispersas | Segmentación semántica 3D | no disponible | Repositorio oficial |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de los modelos alternativos, por lo que la comparación cuantitativa no está disponible. LitePT se posiciona explícitamente como una alternativa "más ligera y más fuerte" frente a los transformers de puntos de gran tamaño, pero no se aportan cifras que lo confirmen en este contexto.

## Limitaciones y advertencias

- Dominio restringido: entrenado únicamente en Structured3D (interiores sintéticos fotorrealistas); su generalización a escenas exteriores, industriales o capturas reales con ruido puede degradarse notablemente.
- Sin datos de benchmarks publicados en la información disponible, por lo que no es posible verificar su rendimiento frente a alternativas.
- Requiere kernels GPU específicos (`spconv`, `flash-attn`) que deben compilarse para la versión exacta de PyTorch y CUDA, lo que añade fricción de despliegue y puede fallar en entornos no soportados.
- Ejecución solo en GPU según la model card; no se documenta inferencia en CPU.
- Modelo no lingüístico: no soporta texto, tool calling, agentes ni capacidades multilingües; no debe evaluarse con métricas de LLM.
- Riesgo de alucinación en el sentido geométrico: puede asignar clases plausibles pero incorrectas a puntos ambiguos (por ejemplo, superficies parcialmente ocluidas), por lo que en producción conviene validar con umbrales de confianza.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales y citar los papers correspondientes.
- Sesgos potenciales derivados del dataset: la distribución de clases y la geometría de Structured3D pueden sobrerrepresentar ciertos tipos de estancias y mobiliario, afectando a la equidad del rendimiento entre clases.
- El checkpoint tiene muy pocas descargas (20) y ningún "like", lo que sugiere escasa validación por parte de la comunidad; úsese con cautela en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/litept-base.structured3d.prs-eth
- Paper LitePT (arXiv): https://arxiv.org/abs/2512.13689
- Repositorio oficial LitePT: https://github.com/prs-eth/LitePT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset Structured3D (paper ECCV 2020): https://arxiv.org/abs/1908.00273
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
