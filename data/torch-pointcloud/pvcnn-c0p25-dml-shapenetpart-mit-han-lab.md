# torch-pointcloud/pvcnn-c0p25-dml.shapenetpart.mit-han-lab

## Resumen

PVCNN (Point-Voxel CNN) es una arquitectura de aprendizaje profundo para nubes de puntos 3D que combina una rama de puntos y una rama de vóxeles en un único modelo híbrido. Este checkpoint concreto, publicado por el usuario `torch-pointcloud`, es una conversión del modelo original de MIT HAN Lab (Zhijian Liu, Haotian Tang, Yujun Lin y Song Han) al formato de la librería `pytorch-pointcloud` de Arthur Dujardin. Está entrenado para la tarea de segmentación de partes de objetos 3D sobre el dataset ShapeNetPart.

El modelo resuelve el problema de la segmentación semántica a nivel de parte en mallas y nubes de puntos: dado un objeto 3D representado como conjunto de puntos con normales, asigna a cada punto una de las 50 etiquetas de parte disponibles en ShapeNetPart. Es relevante para pipelines de visión 3D, reconstrucción, robótica y análisis de geometría, y destaca por su eficiencia: con solo 0,3 millones de parámetros logra un rendimiento competitivo frente a arquitecturas de puntos puras mucho más costosas.

La propuesta técnica de PVCNN es que la rama de vóxeles captura información global de forma eficiente mediante convoluciones 3D dispersas, mientras que la rama de puntos preserva la resolución fina de los detalles locales. El checkpoint se distribuye en formato safetensors bajo licencia MIT, con 270.978 parámetros totales y 1.248 dimensiones de características por punto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN), híbrida punto-vóxel con convoluciones 3D dispersas |
| Parámetros totales | 270.978 (0,3 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre nubes de puntos de tamaño variable) |
| Tipos de cuantización | no disponible (pesos en safetensors, precisión original de PyTorch) |
| Idiomas soportados | no aplica (modelo de visión 3D, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (3 coordenadas + 3 normales) |
| Clases de salida | 50 partes de ShapeNetPart |
| Dimensión de características | 1248 |
| Puntos de entrada (ejemplo de la model card) | 8192 |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

PVCNN es una red neuronal híbrida que procesa nubes de puntos mediante dos ramas complementarias. La rama de vóxeles voxeliza la nube de puntos y aplica convoluciones 3D dispersas, lo que reduce el coste computacional y captura contexto global de forma eficiente. La rama de puntos opera directamente sobre las coordenadas originales, preservando la resolución fina y los detalles geométricos locales. Las dos ramas se fusionan en cada bloque, de modo que la información de vóxeles refina la representación de puntos y viceversa. El modelo recibe 6 canales de entrada (posición XYZ y normales) y produce logits por punto para las 50 clases de parte.

El checkpoint fue entrenado sobre ShapeNetPart, un subconjunto de ShapeNet con 16 categorías de objetos y 50 etiquetas de parte, ampliamente utilizado como referencia en segmentación de partes 3D. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas. El modelo original se describe en el paper "Point-Voxel CNN for Efficient 3D Deep Learning" (NeurIPS 2019), y esta conversión mantiene la arquitectura y los pesos del repositorio `mit-han-lab/pvcnn`. La innovación principal de la arquitectura es la fusión punto-vóxel, que evita el coste cuadrático de las operaciones de vecindad en la rama de puntos pura y el coste de memoria de los vóxeles densos.

## Capacidades

- Segmentación de partes en nubes de puntos 3D: asigna una etiqueta de parte (50 clases) a cada punto de entrada.
- Procesamiento de nubes de puntos con coordenadas XYZ y normales (6 canales de entrada).
- Extracción de características por punto con dimensión 1248, útil como backbone para tareas posteriores.
- Clasificación por categoría de objeto como entrada auxiliar (el modelo recibe la categoría en la firma de inferencia).
- Soporte de `reset_classifier(num_classes=0)` para usar el modelo como extractor de características puro.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo generativo de texto.
- No soporta visión 2D, audio ni texto; su dominio es exclusivamente geometría 3D.
- No dispone de modo "thinking" ni capacidades multilingües.

## Casos de uso

- Segmentación de partes en escaneos 3D de objetos: dado un escaneo con coordenadas y normales, el modelo etiqueta cada punto con su parte correspondiente (ala, fuselaje, motor, etc.), lo que permite descomponer objetos en componentes para análisis o edición.
- Preprocesado para reconstrucción y modelado asistido: la segmentación por partes sirve como paso previo para pipelines de reconstrucción de mallas, simplificación o generación de modelos CAD a partir de escaneos.
- Robótica de manipulación: la identificación de partes (asa, tapa, cuerpo) en nubes de puntos de objetos permite a un brazo robótico seleccionar puntos de agarre adecuados.
- Análisis de calidad en fabricación: comparar la segmentación de partes de una pieza escaneada con la segmentación esperada de su modelo CAD para detectar defectos o desviaciones geométricas.
- Extracción de características para aprendizaje por transferencia: usar la salida de 1248 dimensiones por punto como embedding para entrenar clasificadores o segmentadores específicos de dominio con pocos datos.
- Investigación en visión 3D: servir como baseline ligero (0,3 M de parámetros) para comparar arquitecturas de segmentación de partes en ShapeNetPart con bajo coste computacional.
- Procesamiento en dispositivos con recursos limitados: su reducido tamaño permite desplegarlo en GPUs de gama baja o incluso en CPU para inferencia sobre nubes de puntos de tamaño moderado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Segmentación de partes en nube de puntos | ShapeNetPart | ins_mIoU | 85,1 |
| Segmentación de partes en nube de puntos | ShapeNetPart | cls_mIoU | 82,12 |

No se han publicado en la información disponible resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de visión 3D y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB para los pesos (0,3 M de parámetros en safetensors); el consumo real depende del número de puntos y del tamaño de la rejilla de vóxeles.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; se ha validado el ecosistema PyTorch. Una RTX 3060 o superior es más que suficiente para lotes grandes de nubes de puntos.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: la librería `torch-pointcloud` (instalable con `pip install torch-pointcloud`) sobre PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de puntos de entrada y de la resolución de voxelización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | ins_mIoU (ShapeNetPart) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PVCNN c0.25 (este modelo) | 0,3 M | Nube de puntos variable (ej. 8192 puntos) | 85,1 | MIT | HuggingFace (torch-pointcloud) |
| PointNet++ | no disponible en la información | Nube de puntos variable | no disponible en la información | no disponible en la información | Implementaciones públicas |
| PointTransformer | no disponible en la información | Nube de puntos variable | no disponible en la información | no disponible en la información | Implementaciones públicas |
| KPConv | no disponible en la información | Nube de puntos variable | no disponible en la información | no disponible en la información | Implementaciones públicas |

No se dispone en la información proporcionada de resultados numéricos de los modelos alternativos para establecer una comparación cuantitativa fiable; la comparativa anterior se limita a señalar alternativas de la misma categoría (segmentación de partes en nubes de puntos) sin inventar métricas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ShapeNetPart (16 categorías de objetos, 50 partes); su generalización a categorías no vistas o a dominios muy distintos (escaneos reales con ruido, LiDAR, interiores) no está garantizada.
- Requiere nubes de puntos con normales (6 canales de entrada); sin normales, el rendimiento puede degradarse y no hay documentación sobre estrategias de imputación.
- La resolución de voxelización (c0.25) condiciona la precisión en geometrías finas; objetos con detalles muy pequeños pueden segmentarse de forma imprecisa.
- Riesgo de sobreajuste a la distribución sintética de ShapeNetPart: los objetos del dataset son mallas muestreadas de forma uniforme, no escaneos reales.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias del dataset ShapeNetPart y del código original de `mit-han-lab/pvcnn` para su caso concreto.
- Los resultados de benchmarks (ins_mIoU 85,1 y cls_mIoU 82,12) están marcados como no verificados (`verified: false`) en el model-index; deben tratarse como declaraciones del autor.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones en lenguaje natural ni razonamiento simbólico.
- El repositorio tiene un tamaño de 0,0 GB y solo 19 descargas en el momento de la consulta; es un artefacto de conversión con escasa validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pvcnn-c0p25-dml.shapenetpart.mit-han-lab
- Paper PVCNN (arXiv): https://arxiv.org/abs/1907.03739
- Repositorio original mit-han-lab/pvcnn: https://github.com/mit-han-lab/pvcnn
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
