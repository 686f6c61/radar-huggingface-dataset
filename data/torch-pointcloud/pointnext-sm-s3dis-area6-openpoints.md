# torch-pointcloud/pointnext-sm.s3dis-area6.openpoints

## Resumen

`pointnext-sm.s3dis-area6.openpoints` es un modelo de segmentación semántica de nubes de puntos 3D, publicado en HuggingFace por el colectivo `torch-pointcloud`. Implementa una variante PointNeXt de tamaño pequeño (SM), la arquitectura presentada en el paper «PointNeXt: Revisiting PointNet++ with Improved Training and Scaling Strategies» (NeurIPS 2022), que reformula PointNet++ incorporando bloques residuales invertidos y estrategias de escalado y entrenamiento revisadas. El modelo consume nubes de puntos con 4 canales de entrada y asigna una de 13 clases semánticas a cada punto.

El modelo es relevante por su relación entre coste computacional y precisión: con solo 799.533 parámetros (aproximadamente 0,8 M) declara un mIoU de 83,23 y una exactitud global (OA) de 93,17 sobre el pliegue Area 6 del dataset S3DIS de interiores. Ese reducido número de parámetros lo hace viable en CPU, en GPU de consumo y en sistemas embebidos, lo que resulta atípico en segmentación 3D, donde los modelos habituales manejan decenas de millones de parámetros.

Se trata de una conversión de los pesos oficiales del repositorio `guochengqian/PointNeXt` (licencia MIT) al formato de la librería `torch-pointcloud`, con pesos en `safetensors`. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto, tool calling ni capacidades multilingües. Su ámbito es exclusivamente la percepción 3D geométrica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado con bloques residuales invertidos), variante SM |
| Parámetros totales | 799.533 (≈0,8 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de nubes de puntos; entrada de un conjunto de puntos (8.192 puntos en el ejemplo de la model card) |
| Tipos de cuantización | No documentados por el autor; pesos en `safetensors` (fp32/fp16 nativos de PyTorch). No se ofrece GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | No aplica: no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | `safetensors` |
| Canales de entrada | 4 |
| Dimensión de características | 32 |
| Clases de salida | 13 (segmentación semántica S3DIS) |
| Dataset | S3DIS (Area 6) |
| Librería | `torch-pointcloud` |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación / actualización | 2026-08-28 / 2026-10-20 |

## Arquitectura y entrenamiento

PointNeXt parte de PointNet++ y sustituye los bloques de agregación por bloques residuales invertidos, propios de las redes convolucionales modernas, además de revisar las estrategias de entrenamiento y de escalado del modelo original. La variante publicada aquí es la configuración pequeña (SM): 4 canales de entrada, 32 características internas y una cabeza de segmentación sobre 13 clases, con 799.533 parámetros en total. La arquitectura opera directamente sobre coordenadas de puntos, sin voxelización, mediante operaciones de agrupación y muestreo jerárquico.

En cuanto a los datos, la model card indica entrenamiento y evaluación sobre S3DIS (Area 6), el dataset de parseado semántico de espacios interiores a gran escala de Armeni et al. (CVPR 2016). No se especifica el número de puntos de entrenamiento, la composición completa del dataset ni el protocolo de aumentado. Tampoco se documentan fases de ajuste por preferencias humanas (RLHF/DPO), algo que no aplica a este tipo de modelo. La innovación técnica destacable es la propia receta de PointNeXt: mejores estrategias de escalado que permiten obtener precisión competitiva con un orden de magnitud menos de parámetros. Los pesos se han convertido desde el repositorio oficial manteniendo la licencia MIT.

## Capacidades

- Segmentación semántica de nubes de puntos: asigna una etiqueta entre 13 clases a cada punto de la nube.
- Procesamiento de interiores: el modelo está especializado en escenas de interior del dataset S3DIS (habitaciones, oficinas, pasillos).
- Entrada multimododal geométrica: acepta 4 canales por punto, lo que en el pipeline de la librería incluye posición, color y posición normalizada (`pos`, `color`, `norm_pos`).
- Extracción de características: expone `forward_features()` y permite vaciar el clasificador (`reset_classifier(num_classes=0)`) para obtener descriptores de 32 dimensiones por punto, útiles como base para tareas posteriores.
- Ajuste fino: al ser un modelo pequeño con licencia MIT, es viable reentrenarlo para otros conjuntos de clases o dominios.
- Inferencia en GPU y CPU: 0,8 M de parámetros permiten ejecución en hardware modesto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- Digitalización de interiores y BIM: segmentar escaneos de edificios en suelo, paredes, techo, mobiliario y elementos estructurales para alimentar modelos de información de construcción o gemelos digitales.
- Robótica móvil en interiores: dotar a un robot de percepción semántica del entorno a bordo, ya que el modelo cabe en CPUs y GPUs embebidas y puede ejecutarse en tiempo real sobre nubes de puntos de LiDAR o RGB-D.
- Inventario automatizado de mobiliario: detectar y contar mesas, sillas, estanterías y paneles en levantamientos de oficinas o locales comerciales a partir de escaneos 3D.
- Pre-etiquetado para anotación humana: generar etiquetas iniciales por punto que un anotador revise, reduciendo el coste de construir nuevos datasets 3D etiquetados.
- Extracción de descriptores para modelos downstream: usar las características de 32 dimensiones por punto como entrada de clasificadores de escena, modelos de detección de objetos 3D o sistemas de recuperación de escenas.
- Mantenimiento y auditoría de instalaciones: analizar nubes de puntos periódicas de un mismo espacio para identificar cambios en la distribución de elementos (por ejemplo, mobiliario retirado o añadido).
- Realidad aumentada y modelado 3D: separar estructura y objetos en una captura para tratarlos de forma diferenciada en un pipeline de renderizado o de oclusión.
- Prototipado e investigación: al ser una implementación de referencia pequeña de PointNeXt, sirve como línea base reproducible en experimentos académicos de segmentación 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados en el model-index):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Segmentación de nubes de puntos | S3DIS (Area 6) | mIoU | 83,23 | No |
| Segmentación de nubes de puntos | S3DIS (Area 6) | OA (exactitud global) | 93,17 | No |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, ShapeNetPart, ModelNet40 o ScanNet) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 3,2 MB en fp32 y 1,6 MB en fp16, calculado a partir de los 799.533 parámetros. El tamaño del repositorio indicado (0,0 GB) es coherente con esta cifra.
- VRAM estimada: no publicada por el autor. El consumo vendrá dominado por la nube de puntos de entrada y el tamaño de lote, no por los pesos; con 8.192 puntos por muestra y lotes pequeños el modelo es holgadamente ejecutable en cualquier GPU con varios GB de memoria.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU consumer (por ejemplo, serie RTX 40 o superior) es sobradamente suficiente; también es viable en CPU para inferencia por lotes.
- GPU de consumo: sí, cabe en cualquier GPU consumer e incluso en hardware embebido tipo Jetson.
- Despliegue: la vía documentada es PyTorch con la librería `torch-pointcloud` (`pip install torch-pointcloud`). vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de modelo. No se documenta exportación a ONNX, TorchScript ni TensorRT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | mIoU S3DIS Area 6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnext-sm.s3dis-area6.openpoints (este modelo) | 799.533 | Nube de puntos, 4 canales, 13 clases | 83,23 (no verificado) | MIT | HuggingFace |
| PointNeXt original (guochengqian/PointNeXt), checkpoint S3DIS | No disponible en la información (el modelo aquí publicado es una conversión de ese repositorio) | Nube de puntos | No disponible | MIT | GitHub |
| PointNet++ (base arquitectónica del paper) | No disponible | Nube de puntos | No disponible | No disponible | Repositorio original de los autores |
| Otras variantes PointNeXt de mayor tamaño (S, B, L) | No disponible | Nube de puntos | No disponible | MIT (según repositorio de origen) | GitHub |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de precisión no puede establecerse aquí. Cualitativamente, este modelo se sitúa en el extremo de menor coste computacional de la familia PointNeXt.

## Limitaciones y advertencias

- Métricas no verificadas: los valores de mIoU y OA están declarados por el autor y el model-index los marca como `verified: false`. No se especifica el protocolo exacto de evaluación (votación por bloques, resolución de muestreo ni aumentado en test).
- Dominio restringido: entrenado sobre S3DIS, un dataset de interiores de oficinas y aulas. El rendimiento fuera de ese dominio (exteriores, industria, escenas urbanas, conducción) no está documentado y previsiblemente será muy inferior.
- Conjunto de clases cerrado: la cabeza está fijada a 13 clases de S3DIS; cualquier otro esquema de etiquetas requiere reentrenamiento o ajuste fino.
- Capacidad limitada por tamaño: con 0,8 M de parámetros y 32 características internas, la capacidad de representación es baja; objetos pequeños, superficies ambiguas o geometrías ocluidas pueden segmentarse con errores.
- Dependencia de la entrada: el pipeline espera las claves `pos`, `color` y `norm_pos` y una transformación específica (`info["transform"]`). Usar otra normalización o prescindir del color puede degradar los resultados.
- Sesgos: no documentados por el autor. Al derivarse de S3DIS, hereda los sesgos de ese dataset (tipologías de interior occidentales, cámaras Matterport, distribución de mobiliario concreta).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones espurias por punto en regiones con poca densidad o ruido de captura.
- Licencia: MIT, permite uso comercial, modificación y redistribución conservando el aviso de copyright. Conviene revisar también las condiciones de uso del dataset S3DIS si se reentrena o redistribuye.
- Madurez: sin descargas ni likes, repositorio de 0,0 GB y sin pipeline declarado en HuggingFace; no hay evidencia de uso en producción.
- Idiomas y texto: el modelo no procesa lenguaje natural, por lo que no procede evaluar capacidades multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnext-sm.s3dis-area6.openpoints
- Paper de PointNeXt (arXiv 2206.04670): https://arxiv.org/abs/2206.04670
- Repositorio original de PointNeXt: https://github.com/guochengqian/PointNeXt
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Paper de S3DIS (Armeni et al., CVPR 2016): no disponible en la información proporcionada
- La búsqueda web realizada no aportó enlaces adicionales relevantes sobre este modelo (los resultados correspondían a documentación genérica de PyTorch).
