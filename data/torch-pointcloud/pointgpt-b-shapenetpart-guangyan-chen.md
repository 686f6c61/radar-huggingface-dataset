# torch-pointcloud/pointgpt-b.shapenetpart.guangyan-chen

## Resumen

PointGPT-b es un modelo de segmentación de partes de nubes de puntos basado en la arquitectura PointGPT, un transformer generativo autorregresivo preentrenado sobre nubes de puntos 3D. Esta variante concreta, publicada por el autor `torch-pointcloud`, ha sido afinada para la tarea de segmentación de partes sobre el conjunto de datos ShapeNetPart, que asigna una etiqueta de parte a cada punto individual de una forma 3D (por ejemplo, distinguir el respaldo, las patas o el asiento de una silla).

El modelo cuenta con 112,3 millones de parámetros, 50 clases de segmentación y produce representaciones de 6720 dimensiones por punto. Se distribuye en formato safetensors dentro de la librería `torch-pointcloud`, que permite cargarlo con una sola llamada a `tp.create_model`, y deriva del checkpoint preentrenado `pointgpt-b.post-pretrain.guangyan-chen`, lo que lo convierte en un ejemplo reproducible de un pipeline de preentrenamiento autorregresivo seguido de ajuste fino supervisado.

Su relevancia radica en que aplica la filosofía de los grandes modelos de lenguaje (preentrenamiento generativo autorregresivo y posterior adaptación a tareas concretas) al dominio de las nubes de puntos, con una licencia MIT que facilita su uso tanto en investigación como en productos comerciales de visión 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointGPT (transformer generativo autorregresivo para nubes de puntos) |
| Parametros totales | 112.342.578 (112,3 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico, procesa geometria 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PointGPT es un transformer que aplica el paradigma de preentrenamiento generativo autorregresivo al dominio de las nubes de puntos. El modelo se preentrena prediciendo partes de la nube a partir de porciones previas, de forma análoga a como un modelo de lenguaje predice el siguiente token; este preentrenamiento se realizó en el checkpoint base `pointgpt-b.post-pretrain.guangyan-chen`. Posteriormente, esta variante se ajustó de forma supervisada sobre ShapeNetPart para la tarea de segmentación de partes, con 50 clases de salida y una cabeza de clasificación por punto.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset más allá de ShapeNetPart ni si se emplearon técnicas de refuerzo o preferencias (RLHF/DPO), algo esperable en un modelo de visión 3D. El modelo consume nubes de puntos con coordenadas `pos` y normales `normal`, además de una etiqueta de categoría global, y devuelve logits de segmentación por punto. La librería `torch-pointcloud` expone tanto la inferencia completa como la extracción de características intermedias (6720 dimensiones).

## Capacidades

- Segmentación de partes de objetos 3D: asigna una etiqueta de parte a cada punto de la nube (50 clases en ShapeNetPart).
- Clasificación de categoría global del objeto como entrada auxiliar para condicionar la segmentación.
- Extracción de características por punto de 6720 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos con coordenadas y normales (formato `pos` + `normal`).
- Integración con PyTorch y con la librería `torch-pointcloud` para pipelines de entrenamiento e inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente geométrico.
- No dispone de modo de razonamiento explícito (thinking mode), visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación semántica de partes en escaneos 3D industriales: el modelo etiqueta cada punto de una pieza mecánica escaneada, permitiendo separar componentes (tornillos, bridas, carcasas) para control de calidad automatizado.
- Digitalización y reconstrucción de patrimonio: a partir de escaneos de esculturas u objetos arqueológicos, el modelo separa partes (base, cuerpo, detalles) para facilitar la catalogación y el modelado posterior.
- Robótica de manipulación: la segmentación por partes permite a un brazo robótico identificar zonas de agarre (asa de una taza, mango de una herramienta) antes de planificar la manipulación.
- Modelado asistido por ordenador: integración en herramientas de diseño 3D que segmentan automáticamente una malla o nube de puntos en partes editables, acelerando el flujo de trabajo de artistas y diseñadores.
- Automoción y escaneo de interiores: segmentación de componentes de vehículos o de mobiliario en nubes de puntos capturadas con LiDAR para inventario y análisis de escenas.
- Investigación en visión 3D: uso como baseline reproducible (licencia MIT, pesos en safetensors) para comparar nuevas arquitecturas de segmentación de partes sobre ShapeNetPart.
- Extracción de descriptores geométricos: empleo de las características de 6720 dimensiones como entrada para clasificadores o sistemas de recuperación de formas 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| ShapeNetPart | Segmentación de partes de nubes de puntos | ins_mIoU | 85,91 |
| ShapeNetPart | Segmentación de partes de nubes de puntos | cls_mIoU | 84,02 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 112,3 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 0,45 GB; en FP16, unos 0,22 GB. A ello hay que sumar la memoria de las activaciones, que depende del número de puntos procesados (el ejemplo de uso emplea 8192 puntos).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia con lotes pequeños; para entrenamiento o lotes grandes se recomiendan GPU de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se ajuste el tamaño de lote y el número de puntos.
- Opciones de despliegue: la librería `torch-pointcloud` sobre PyTorch es la vía documentada. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a nubes de puntos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos de segmentación de partes sobre ShapeNetPart, por lo que no es posible establecer una comparativa numérica fiable. Como referencia cualitativa, esta variante puede compararse con otras arquitecturas de segmentación de nubes de puntos (por ejemplo, PointNet++, DGCNN o Point Transformer), pero no se han facilitado sus métricas en esta ficha.

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| pointgpt-b.shapenetpart.guangyan-chen | 112,3 M | nubes de puntos (8192 puntos en el ejemplo) | MIT | HuggingFace |
| Alternativas de segmentación 3D | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico de dominio: solo procesa nubes de puntos 3D; no genera texto, código ni mantiene conversaciones.
- Entrenado exclusivamente sobre ShapeNetPart (50 clases de partes de objetos cotidianos); su generalización a dominios industriales, médicos o escenas a gran escala no está validada.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Riesgo de degradación ante nubes de puntos con ruido, oclusiones, densidades distintas a las del entrenamiento o ausencia de normales.
- No se documentan sesgos específicos, pero el dataset ShapeNetPart está sesgado hacia categorías de objetos de uso doméstico y formas sintéticas o curadas.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales (PointGPT y ShapeNetPart) según las citas indicadas.
- Sin información sobre cuantización ni sobre el impacto de reducir precisión en la calidad de la segmentación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointgpt-b.shapenetpart.guangyan-chen
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-b.post-pretrain.guangyan-chen
- Paper PointGPT (arXiv 2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
