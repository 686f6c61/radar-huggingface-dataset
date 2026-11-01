# torch-pointcloud/pvcnn-c0p25.shapenetpart.mit-han-lab

## Resumen

PVCNN (Point-Voxel CNN) es una arquitectura de red neuronal para aprendizaje profundo sobre nubes de puntos 3D que combina una rama de puntos y una rama de vóxeles en un mismo bloque de computación. Este repositorio concreto, `pvcnn-c0p25.shapenetpart.mit-han-lab`, es una conversión a la librería `torch-pointcloud` de los pesos originales de `mit-han-lab/pvcnn`, publicada por el usuario `torch-pointcloud`. El modelo está especializado en segmentación de partes de objetos 3D (part segmentation) y ha sido entrenado sobre el conjunto de datos ShapeNetPart.

Se trata de un modelo extremadamente compacto: 0,3 millones de parámetros (270.978 según el fichero safetensors) y un tamaño de repositorio inferior a 0,1 GB. Recibe nubes de puntos con 6 canales de entrada (coordenadas XYZ más normales) y produce logits sobre 50 clases de partes, con una dimensión de características de 1248. Su relevancia actual es la de servir como referencia ligera y reproducible para tareas de segmentación 3D en pipelines de visión por computador, con licencia MIT y pesos en formato safetensors.

El modelo no es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual de los transformers generativos. Su "contexto" es el número de puntos de la nube de entrada, y su salida es una etiqueta por punto. Esta ficha lo describe, por tanto, con las métricas y especificaciones propias de un modelo de visión 3D.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN), rama de puntos y rama de vóxeles fusionadas |
| Parámetros totales | 270.978 (0,3 M según model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de nube de puntos (ejemplo de la model card con 8192 puntos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (XYZ + normales) |
| Clases de salida | 50 |
| Dimensión de características | 1248 |
| Dataset de entrenamiento | ShapeNetPart |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

PVCNN es una red convolucional híbrida que combina dos representaciones de la geometría 3D: una rama que opera directamente sobre los puntos (point branch), que preserva la resolución fina y evita la pérdida de información por voxelización, y una rama que opera sobre una rejilla de vóxeles (voxel branch), que aprovecha convoluciones 3D eficientes y reduce el coste computacional. Las salidas de ambas ramas se fusionan en cada bloque, de modo que el modelo captura tanto detalles locales como estructura volumétrica global. La variante `c0p25` hace referencia a una configuración concreta de anchura de canales del modelo original.

El entrenamiento se realizó sobre ShapeNetPart, el conjunto de referencia para segmentación de partes de objetos 3D, que anota 16 categorías de objetos con 50 clases de partes. La model card no detalla el número de tokens ni la composición exacta del dataset, ni indica si hubo entrenamiento adicional con RLHF/DPO (no aplicable en este dominio). La innovación técnica destacable es la propia arquitectura point-voxel, diseñada explícitamente para eficiencia en 3D, tal como se describe en el paper de NeurIPS 2019.

## Capacidades

- Segmentación de partes de objetos 3D: asigna una etiqueta de parte (hasta 50 clases) a cada punto de la nube de entrada.
- Procesamiento de nubes de puntos con 6 canales (coordenadas y normales).
- Extracción de características: expone `forward_features` y `reset_classifier(num_classes=0)` para obtener embeddings de 1248 dimensiones por punto.
- Integración con PyTorch mediante la librería `torch-pointcloud`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo de texto.
- No tiene capacidades multilingües, de visión 2D, audio ni modo "thinking".
- No dispone de decodificación especulativa ni mecanismos de atención propios de LLM.

## Casos de uso

- Segmentación de piezas en escaneos 3D industriales: dado un escaneo de una pieza mecánica, el modelo etiqueta cada punto según la parte del objeto a la que pertenece, lo que facilita tareas de inspección y control de calidad. Su tamaño de 0,3 M de parámetros permite ejecutarlo en entornos con recursos limitados.
- Preprocesado para pipelines de robótica: la segmentación por partes de objetos capturados por sensores de profundidad permite a un brazo robótico identificar asas, tapas o componentes antes de manipularlos.
- Anotación asistida de datasets 3D: el modelo puede generar etiquetas preliminares por punto sobre nuevas nubes de puntos, que luego se revisan manualmente, reduciendo el coste de anotación en proyectos de visión 3D.
- Extracción de embeddings para búsqueda de formas: usando `forward_features` se obtienen vectores de 1248 dimensiones por punto que pueden alimentar sistemas de recuperación o clustering de geometrías similares.
- Prototipado académico y docencia: al ser un modelo pequeño, con licencia MIT y pesos en safetensors, es adecuado para reproducir experimentos de segmentación 3D y comparar arquitecturas point-voxel frente a alternativas puramente basadas en puntos.
- Integración en aplicaciones de realidad aumentada: la segmentación de partes de un objeto escaneado permite resaltar o manipular componentes concretos en una escena AR, con latencia baja gracias al reducido coste del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Segmentación de partes de nube de puntos | ShapeNetPart | ins_mIoU | 84,85 |
| Segmentación de partes de nube de puntos | ShapeNetPart | cls_mIoU | 81,65 |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo, comparativas frente a PointNet, PointNet++ o variantes de PVCNN) más allá de estas dos métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 0,3 M de parámetros el modelo ocupa del orden de unos pocos MB en precisión FP32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; también es viable en CPU para volúmenes moderados de puntos.
- Cabe en GPU consumer: sí, en todas las gamas actuales e incluso en GPUs de gama baja o integradas.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` sobre PyTorch (`pip install torch-pointcloud`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del número de puntos de entrada y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Métrica principal | Licencia |
|---|---|---|---|---|---|
| pvcnn-c0p25.shapenetpart.mit-han-lab | 0,3 M | Part segmentation 3D | ShapeNetPart | ins_mIoU 84,85 | MIT |
| PointNet (referencia clásica) | no disponible en la información | Part segmentation 3D | ShapeNetPart | no disponible en la información | no disponible en la información |
| PointNet++ (referencia clásica) | no disponible en la información | Part segmentation 3D | ShapeNetPart | no disponible en la información | no disponible en la información |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos alternativos comparables, por lo que la comparativa cuantitativa queda limitada al propio modelo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ShapeNetPart; su generalización a dominios distintos (escaneos reales con ruido, objetos fuera de las 16 categorías del dataset) no está garantizada.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no tiene capacidades conversacionales.
- La entrada requiere 6 canales (coordenadas y normales); si no se dispone de normales, será necesario estimarlas o adaptar el preprocesado.
- El número de puntos de entrada condiciona la salida; la model card muestra un ejemplo con 8192 puntos, pero no se documenta el rango óptimo.
- Riesgo de alucinación en el sentido generativo no aplica; sí existe riesgo de etiquetado erróneo en puntos ambiguos o en fronteras entre partes.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar el sesgo inherente a la distribución de ShapeNetPart.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar los avisos de copyright y citar el paper original y la conversión.
- La fecha de creación del repositorio (2026-10-30) y el bajo número de descargas (19) indican que se trata de una conversión reciente y poco contrastada por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/pvcnn-c0p25.shapenetpart.mit-han-lab
- Paper PVCNN (NeurIPS 2019): https://arxiv.org/abs/1907.03739
- Repositorio original mit-han-lab/pvcnn: https://github.com/mit-han-lab/pvcnn
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ShapeNetPart (paper de anotación, Yi et al. 2016): no disponible como enlace directo en la información proporcionada
