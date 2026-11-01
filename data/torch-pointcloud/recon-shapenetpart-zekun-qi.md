# torch-pointcloud/recon.shapenetpart.zekun-qi

## Resumen

recon.shapenetpart.zekun-qi es un modelo de segmentación de partes de nubes de puntos 3D, desarrollado originalmente por Zekun Qi y colaboradores (ICML 2023) bajo el nombre ReCon, y convertido al ecosistema torch-pointcloud por Arthur Dujardin. Resuelve la tarea de asignar una etiqueta semántica de parte a cada punto individual de una malla 3D representada como nube de puntos, una capacidad fundamental en visión 3D, robótica y modelado CAD.

La arquitectura es un transformer de puntos enmascarado (masked point transformer) con consultas contrastivas entre modalidades, derivado del preentrenamiento generativo ReCon y afinado específicamente sobre el conjunto de datos ShapeNetPart. El modelo cuenta con 48,5 millones de parámetros, 50 clases de segmentación y un vector de características de 3776 dimensiones. Se distribuye en formato safetensors dentro de la librería torch-pointcloud, con licencia MIT.

Su relevancia actual radica en que ofrece un punto de partida reproducible y ligero para tareas de segmentación de partes en nubes de puntos, con pesos convertidos y una API de carga directa en PyTorch. No es un modelo de lenguaje ni un modelo multimodal generativo: es un modelo discriminativo especializado en geometría 3D, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de puntos enmascarado con consultas contrastivas entre modalidades (ReCon) |
| Parametros totales | 48.550.450 (48,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de segmentacion | 50 |
| Dimension de caracteristicas | 3776 |
| Dataset de entrenamiento | ShapeNetPart |
| Modelo base | torch-pointcloud/recon.pretrain.zekun-qi |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ReCon (Contrast with Reconstruct), un transformer de puntos que combina un objetivo generativo de reconstrucción con enmascaramiento de puntos y un objetivo contrastivo entre modalidades (imagen y nube de puntos) durante el preentrenamiento. La idea central del artículo es que las representaciones aprendidas mediante reconstrucción generativa sirven como guía para el aprendizaje contrastivo, mejorando la calidad de los embeddings 3D. El modelo base se preentrena de forma auto-supervisada y después se afina de forma supervisada sobre ShapeNetPart para la tarea de segmentación de partes.

Los detalles concretos del número de tokens de entrenamiento, la composición exacta del dataset de preentrenamiento y el uso de RLHF o DPO no están disponibles en la información proporcionada. El ajuste fino sobre ShapeNetPart es supervisado, con 50 clases de partes y una cabeza de clasificación por punto que produce logits por punto de la nube. La conversión a torch-pointcloud mantiene la arquitectura original y expone métodos como `forward_features` y `reset_classifier` para extracción de características.

## Capacidades

- Segmentación de partes de nubes de puntos 3D: asigna una etiqueta de parte (entre 50 clases) a cada punto de la nube.
- Extracción de características 3D: genera embeddings de 3776 dimensiones por punto mediante `forward_features`.
- Procesamiento de nubes de puntos con coordenadas y normales: la entrada incluye posición (pos) y normal por punto.
- Condicionamiento por categoría de objeto: acepta un tensor de categoría para guiar la segmentación.
- Integración con PyTorch: API de carga mediante `tp.create_model` y pipeline de transformación y collate incluido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión 2D, audio ni generación de texto: es un modelo puramente geométrico y discriminativo.
- Capacidades multilingües: no aplica.

## Casos de uso

- Segmentación automática de piezas en modelos CAD: dado un modelo 3D convertido a nube de puntos, el modelo etiqueta cada punto con su parte correspondiente (ala, fuselaje, motor, etc.), lo que facilita la descomposición y el etiquetado de activos en pipelines de diseño.
- Robótica de manipulación: para que un brazo robótico agarre un objeto por una parte concreta, el modelo segmenta la nube de puntos capturada por un sensor de profundidad y aísla la región de agarre.
- Anotación asistida de datasets 3D: preetiquetado automático de nubes de puntos en proyectos de anotación, reduciendo el coste manual antes de la revisión humana.
- Inspección de calidad en fabricación: comparación de la segmentación de partes de una pieza escaneada con la segmentación esperada para detectar piezas mal formadas o componentes ausentes.
- Realidad aumentada y edición 3D: selección interactiva de partes de un objeto escaneado para aplicar materiales, colores o transformaciones por componente.
- Investigación en aprendizaje 3D: uso como baseline reproducible de segmentación de partes sobre ShapeNetPart, con extracción de características para transferencia a otras tareas (clasificación, detección).
- Preprocesado para gemelos digitales: descomposición de escenas escaneadas en componentes semánticos antes de su integración en un gemelo digital.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| ShapeNetPart | ins_mIoU | 86,15 |
| ShapeNetPart | cls_mIoU | 84,40 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 48,5 M de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 194 MB; en fp16, unos 97 MB. La memoria dominante es la de las activaciones de la nube de puntos, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para lotes pequeños; una RTX 3090, RTX 4090, A100 o H100 permite lotes mayores y mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: PyTorch nativo mediante la librería torch-pointcloud; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | ins_mIoU ShapeNetPart | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recon.shapenetpart.zekun-qi | 48,5 M | nubes de puntos (8192 puntos en el ejemplo) | 86,15 | MIT | HuggingFace (torch-pointcloud) |
| PointNet++ (segmentacion) | no disponible | nubes de puntos | no disponible en la informacion | no disponible | implementaciones publicas |
| Point Transformer (segmentacion) | no disponible | nubes de puntos | no disponible en la informacion | no disponible | implementaciones publicas |

No se dispone en la información proporcionada de resultados de benchmarks de los modelos alternativos para establecer una comparación numérica rigurosa. La comparativa se limita a la categoría de tarea y al régimen de parámetros.

## Limitaciones y advertencias

- Modelo especializado: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso fuera de segmentación de nubes de puntos 3D es inadecuado.
- Dominio restringido: entrenado sobre ShapeNetPart, un conjunto de objetos sintéticos de 50 clases de partes; la generalización a escaneos reales, ruidosos o de dominios distintos puede degradarse.
- Métricas no verificadas: los valores de ins_mIoU y cls_mIoU son declarados por el autor y no han sido verificados de forma independiente.
- Sesgos: no hay información sobre sesgos geométricos o de categoría; al estar entrenado en un dataset sintético, puede presentar sesgo hacia las formas y categorías representadas en ShapeNetPart.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero puede producir segmentaciones incorrectas o inconsistentes en puntos ambiguos o en objetos fuera de distribución.
- Limitaciones de idioma y contexto: no aplica; el modelo no procesa lenguaje.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales (Qi et al., ICML 2023) y a la conversión de torch-pointcloud.
- Caveat de producción: requiere preprocesado específico (posiciones, normales, categoría) y no incluye pipeline de despliegue como servicio; la integración debe hacerse en PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/recon.shapenetpart.zekun-qi
- Modelo base: https://huggingface.co/torch-pointcloud/recon.pretrain.zekun-qi
- Paper ReCon (arXiv 2302.02318): https://arxiv.org/abs/2302.02318
- Repositorio original ReCon: https://github.com/qizekun/ReCon
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
