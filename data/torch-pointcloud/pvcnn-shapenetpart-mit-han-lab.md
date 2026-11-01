# torch-pointcloud/pvcnn.shapenetpart.mit-han-lab

## Resumen

PVCNN (Point-Voxel CNN) es una red neuronal convolucional para segmentación de nubes de puntos 3D que combina una rama de puntos y una rama de vóxeles en una sola arquitectura. Este checkpoint concreto, publicado por el usuario `torch-pointcloud`, es una conversión del modelo original de `mit-han-lab` al formato safetensors para su uso con la librería `torch-pointcloud`. Está entrenado sobre el dataset ShapeNetPart para la tarea de segmentación de partes de objetos, con 50 clases de partes sobre 16 categorías de objetos.

El modelo resuelve el problema de eficiencia computacional en el procesamiento de nubes de puntos: la rama de vóxeles permite agregar información de vecindad de forma eficiente mediante convoluciones 3D, mientras que la rama de puntos preserva la resolución fina de las coordenadas originales. Con solo 4,2 millones de parámetros, es un modelo ligero pensado para inferencia en entornos con recursos limitados, no para generación de lenguaje.

Es relevante ahora porque las conversiones a safetensors y a librerías de punto medio como `torch-pointcloud` facilitan la reproducibilidad y el despliegue de modelos clásicos de visión 3D en pipelines modernos. No es un modelo de lenguaje ni un modelo generativo: es un modelo discriminativo de segmentación por partes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN, rama de puntos + rama de vóxeles) |
| Parametros totales | 4.208.754 (4,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (coordenadas xyz + normales xyz) |
| Clases de salida | 50 clases de partes |
| Dimensión de features | 4944 |
| Dataset de entrenamiento | ShapeNetPart |

## Arquitectura y entrenamiento

PVCNN es una arquitectura híbrida que procesa nubes de puntos mediante dos ramas paralelas: una rama de puntos que opera directamente sobre las coordenadas originales y una rama de vóxeles que voxeliza la nube y aplica convoluciones 3D para capturar contexto espacial. Las salidas de ambas ramas se fusionan, combinando la eficiencia de la convolución voxelizada con la resolución fina de la representación por puntos. El modelo recibe 6 canales de entrada (posiciones xyz y normales xyz) y produce logits sobre 50 clases de partes.

El checkpoint se entrenó sobre ShapeNetPart, el dataset de referencia para segmentación de partes de objetos 3D, que anota partes finas sobre 16 categorías de objetos. La model card no especifica el número de tokens ni detalles del procedimiento de entrenamiento (épocas, aumentos de datos, función de pérdida). La contribución técnica principal del paper original es la reducción del coste computacional frente a arquitecturas puramente basadas en puntos o puramente voxelizadas, manteniendo precisión competitiva.

## Capacidades

- Segmentación de partes de objetos 3D sobre nubes de puntos con 6 canales de entrada (xyz + normales).
- Clasificación por punto en 50 clases de partes, condicionada por la categoría del objeto (parámetro `category` en la llamada al modelo).
- Extracción de features de 4944 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`, reutilizable como backbone para tareas posteriores.
- Procesamiento de nubes de puntos de tamaño variable (el ejemplo de la model card usa 8192 puntos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de texto.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación de partes en escaneos 3D de objetos: el modelo recibe una nube de puntos con normales y devuelve una etiqueta de parte por punto, útil para inventariado o análisis de formas en datasets de CAD y escaneos.
- Preprocesado para pipelines de robótica de manipulación: segmentar las partes de un objeto (asa, cuerpo, tapa) permite planificar puntos de agarre y trayectorias de forma más fiable que con segmentación semántica gruesa.
- Extracción de features para clasificación o retrieval 3D: usando `reset_classifier(num_classes=0)` se obtiene un vector de 4944 dimensiones por nube de puntos que puede alimentar un clasificador ligero o un índice de búsqueda por similitud.
- Anotación asistida de datasets 3D: el modelo puede preetiquetar partes en nuevas nubes de puntos para que un humano revise y corrija, reduciendo el coste de anotación en ShapeNetPart y dominios similares.
- Control de calidad en impresión 3D o fabricación: detectar y separar partes de una malla o escaneo para verificar que cada componente está presente y correctamente delimitado.
- Prototipado e investigación en visión 3D: al ser un modelo de 4,2 M de parámetros con licencia MIT, sirve como baseline reproducible para comparar nuevas arquitecturas de segmentación de partes sin requerir GPUs de gran capacidad.
- Despliegue en dispositivos con recursos limitados: su tamaño reducido permite ejecución en CPU o en GPUs de gama baja para tareas de segmentación por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| ins_mIoU | ShapeNetPart | 85,88 |
| cls_mIoU | ShapeNetPart | 84,14 |

No se han publicado en la información disponible resultados adicionales (latencia, throughput, comparación con otros checkpoints) más allá de estas dos métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,2 M de parámetros en fp32 los pesos ocupan aproximadamente 17 MB, por lo que la VRAM dominante la determina el tamaño de la nube de puntos y el batch, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM para lotes pequeños; también es viable en CPU para inferencia por lotes.
- Opciones de despliegue: la librería `torch-pointcloud` (`pip install torch-pointcloud`) es la vía documentada; al ser un modelo PyTorch estándar en safetensors, puede cargarse con PyTorch nativo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pvcnn.shapenetpart.mit-han-lab (este) | 4,2 M | Segmentación de partes 3D | Nube de puntos, 6 canales | MIT | HuggingFace, torch-pointcloud |
| PointNet++ (referencia clásica) | no disponible en la información | Segmentación de partes 3D | Nube de puntos | no disponible | Implementaciones públicas |
| PointTransformer (referencia) | no disponible en la información | Segmentación de partes 3D | Nube de puntos | no disponible | Implementaciones públicas |
| KPConv (referencia) | no disponible en la información | Segmentación de partes 3D | Nube de puntos | no disponible | Implementaciones públicas |

No se dispone en la información proporcionada de cifras de parámetros, contexto ni rendimiento de los modelos alternativos para una comparación cuantitativa rigurosa; las filas correspondientes se marcan como no disponibles.

## Limitaciones y advertencias

- Modelo especializado en segmentación de partes 3D: no genera texto, no razona, no responde preguntas y no debe presentarse como un modelo de lenguaje.
- Entrenado exclusivamente sobre ShapeNetPart (16 categorías de objetos y 50 clases de partes); el rendimiento fuera de esa distribución (escenas reales, LiDAR, objetos no vistos) no está garantizado ni documentado.
- Requiere nubes de puntos con normales (6 canales de entrada); sin normales, el modelo no puede usarse tal cual.
- El parámetro `category` condiciona la predicción; clasificaciones erróneas de categoría degradan la segmentación de partes.
- Riesgo de alucinación en sentido figurado: puede asignar partes plausibles pero incorrectas en puntos ambiguos o ruidosos; no hay estimación de incertidumbre documentada.
- Licencia MIT permite uso comercial, pero la model card no incluye garantías ni condiciones adicionales; conviene revisar la licencia del dataset ShapeNetPart para usos derivados.
- Las métricas (ins_mIoU 85,88, cls_mIoU 84,14) están declaradas por el autor y marcadas como no verificadas; no se han reproducido de forma independiente en la información disponible.
- Solo 19 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy reducido, con poca validación comunitaria.
- No hay variantes cuantizadas publicadas (GGUF, INT8); el despliegue se limita a PyTorch/safetensors.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/pvcnn.shapenetpart.mit-han-lab
- Paper PVCNN: https://arxiv.org/abs/1907.03739
- Repositorio original mit-han-lab/pvcnn: https://github.com/mit-han-lab/pvcnn
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
