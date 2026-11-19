# torch-pointcloud/pointnext-sm.shapenetpart.openpoints

## Resumen

PointNeXt-SM es un modelo de segmentación de nubes de puntos 3D, concretamente de segmentación de partes de objetos (part segmentation) sobre el dataset ShapeNetPart. Lo publica el usuario `torch-pointcloud` como conversión del repositorio original de Guocheng Qian (PointNeXt, NeurIPS 2022) al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin. No es un modelo de lenguaje: es una red neuronal convolucional sobre puntos que asigna una etiqueta de parte (por ejemplo, "ala", "motor" o "fuselaje" en un avión) a cada punto de una nube de 3D.

La arquitectura es PointNeXt en su variante SM (small), una revisión de PointNet++ que incorpora bloques residuales invertidos y estrategias de entrenamiento y escalado mejoradas. Con solo 1,0 M de parámetros (990.770 según los pesos en safetensors), 96 canales de características y 50 clases de parte, es un modelo muy ligero pensado para inferencia rápida en pipelines de visión 3D.

Su relevancia práctica está en que ofrece un punto de partida inmediato para tareas de segmentación semántica fina en 3D dentro del ecosistema PyTorch, con licencia MIT y una API de carga en una sola llamada (`tp.create_model`). Es útil para prototipado, investigación en visión 3D y como componente de sistemas de robótica, realidad aumentada o inspección industrial donde se necesita etiquetar geometría a nivel de punto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ con bloques residuales invertidos), variante SM |
| Parámetros totales | 990.770 (≈1,0 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, 8192 puntos en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de visión 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 7 |
| Clases de salida | 50 |
| Dimensión de características | 96 |
| Dataset de entrenamiento | ShapeNetPart |
| Tarea | Segmentación de partes de nube de puntos |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

PointNeXt reformula PointNet++ manteniendo su jerarquía de agrupación y muestreo (set abstraction) pero sustituyendo los bloques MLP por bloques residuales invertidos, inspirados en MobileNetV2, y aplicando estrategias de escalado y entrenamiento mejoradas (más épocas, aumentación de datos y ajustes de optimización). La variante SM reduce el número de canales y capas hasta los 96 canales de características y ~1 M de parámetros, lo que la convierte en la configuración más ligera de la familia.

El modelo se entrena sobre ShapeNetPart, un subconjunto de ShapeNet con 16 categorías de objetos y 50 clases de parte anotadas a nivel de punto. La entrada combina coordenadas (3 canales) y normales (3 canales) más la categoría del objeto, sumando los 7 canales de entrada indicados en la model card. La predicción es condicionada por categoría: el modelo recibe la etiqueta de clase del objeto y produce logits por punto para las partes correspondientes. No se dispone de información sobre el número exacto de tokens/puntos de entrenamiento, composición detallada del dataset ni uso de técnicas de refinamiento posteriores en la información proporcionada.

## Capacidades

- Segmentación de partes a nivel de punto en nubes 3D: asigna una de 50 clases de parte a cada punto, condicionada por la categoría del objeto.
- Procesamiento de nubes de puntos con coordenadas y normales (7 canales de entrada).
- Extracción de características: `forward_features` devuelve un vector de 96 dimensiones por nube, útil para tareas downstream (clasificación, retrieval, clustering).
- Clasificador reconfigurable: `reset_classifier(num_classes=0)` permite reutilizar el backbone como extractor de características.
- Inferencia por lotes mediante la utilidad `collate` de `torch-pointcloud`, con soporte de índices de batch para procesar varias nubes a la vez.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo de visión 3D.

## Casos de uso

- Segmentación de piezas en escaneos industriales: dado un escaneo 3D de un componente mecánico, el modelo etiqueta cada punto según la parte del objeto, facilitando inspección de calidad y detección de defectos geométricos.
- Robótica de manipulación: segmentar las partes de un objeto (asa, tapa, cuerpo) permite a un brazo robótico seleccionar el punto de agarre adecuado; el bajo coste computacional (~1 M de parámetros) lo hace viable en bucles de control en tiempo real.
- Realidad aumentada y modelado 3D: separar partes de un objeto escaneado por el usuario para editar, recolorear o sustituir componentes en una aplicación de diseño.
- Preprocesado para pipelines de reconstrucción: usar el modelo como paso previo que separa geometría por partes antes de algoritmos de registro, simplificación de malla o generación de UVs.
- Extracción de embeddings para búsqueda y clasificación: con `reset_classifier(num_classes=0)` se obtienen descriptores de 96 dimensiones por nube, útiles para búsqueda de formas similares o clasificación con pocos datos.
- Investigación en visión 3D: servir de baseline ligero para comparar arquitecturas de segmentación de puntos o para experimentos de destilación y pruning, dado su reducido tamaño y su licencia MIT.
- Docencia y prototipado rápido: la API de una línea (`tp.create_model(..., pretrained=True)`) permite tener un modelo funcional en minutos sin gestionar checkpoints manualmente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| ShapeNetPart | Segmentación de partes de nube de puntos | ins_mIoU | 86,9 |
| ShapeNetPart | Segmentación de partes de nube de puntos | cls_mIoU | 84,51 |

No se han publicado en la información disponible resultados comparativos adicionales (latencia, throughput, consumo de memoria) ni métricas sobre otros datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~1 M de parámetros y nubes de 8192 puntos, el modelo cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM. No se dispone de mediciones exactas publicadas.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomienda NVIDIA RTX 3090/4090, A100 o H100, aunque el modelo no las necesita para funcionar.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer reciente (RTX 2060 en adelante, e incluso en GPUs integradas o CPU para inferencia puntual).
- Opciones de despliegue: la vía nativa es la librería `torch-pointcloud` sobre PyTorch (`pip install torch-pointcloud`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset | ins_mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointNeXt-SM (este modelo) | ~1,0 M | ShapeNetPart | 86,9 | MIT | Hugging Face, vía torch-pointcloud |
| PointNet++ (original) | no disponible | ShapeNetPart | no disponible | MIT (implementación de referencia) | Repositorio oficial |
| PointNeXt (variantes mayores) | no disponible | ShapeNetPart | no disponible | MIT | Repositorio guochengqian/PointNeXt |

La comparación cuantitativa con PointNet++ y con las variantes mayores de PointNeXt no está disponible en la información proporcionada; el paper de PointNeXt (arXiv:2206.04670) es la referencia para esos datos.

## Limitaciones y advertencias

- Modelo especializado: solo realiza segmentación de partes sobre las 16 categorías de ShapeNetPart; no generaliza a categorías de objeto fuera de ese conjunto sin reentrenamiento.
- Requiere la etiqueta de categoría del objeto como entrada; un error en esa etiqueta degrada la predicción de partes.
- Dominio sintético: entrenado con datos de ShapeNet, por lo que el rendimiento en escaneos reales (ruido, oclusiones, densidad irregular) puede degradarse respecto a las métricas reportadas.
- Métricas no verificadas: los valores ins_mIoU y cls_mIoU los declara el autor y no han sido validados de forma independiente.
- Sin información sobre sesgos: no se documentan análisis de sesgo ni limitaciones por categoría en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de asignaciones de parte incorrectas en puntos ambiguos o en regiones con poca densidad.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución al trabajo original de PointNeXt y a ShapeNetPart según las citas de la model card.
- Sin soporte documentado de cuantización ni de formatos de despliegue tipo GGUF/ONNX en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointnext-sm.shapenetpart.openpoints
- Paper de PointNeXt: https://arxiv.org/abs/2206.04670
- Repositorio original de PointNeXt: https://github.com/guochengqian/PointNeXt
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
- Paper de ShapeNetPart (Yi et al., 2016): https://arxiv.org/abs/1612.00593 (referencia citada en la model card como artículo de ACM TOG; el enlace directo no se incluye en la información disponible)
