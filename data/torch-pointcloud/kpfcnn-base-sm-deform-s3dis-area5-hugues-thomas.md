# torch-pointcloud/kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas

## Resumen

El modelo `kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas` es una red neuronal para segmentación semántica de nubes de puntos 3D, publicada por la organización `torch-pointcloud` en Hugging Face. No es un modelo de lenguaje: implementa una KPConv (kernel point convolution) en su variante deformable, la arquitectura presentada en el paper «KPConv: Flexible and Deformable Convolution for Point Clouds» (Thomas et al., ICCV 2019). El checkpoint ha sido convertido a la librería `torch-pointcloud` desde la implementación original de Hugues Thomas en PyTorch.

El modelo resuelve la tarea de asignar una etiqueta semántica a cada punto de una escena 3D, en este caso con 13 clases de interior (suelo, pared, silla, mesa, etc.) sobre el dataset S3DIS. Cuenta con 25,6 millones de parámetros, 128 canales de features y 5 canales de entrada (coordenadas XYZ más color RGB), y está entrenado específicamente sobre el split de validación Área 5 de S3DIS, lo que lo convierte en una referencia útil para comparar arquitecturas de convolución en nubes de puntos.

Su relevancia actual es doble: por un lado, ofrece un baseline reproducible de una arquitectura clásica de 2019 con licencia MIT y pesos en safetensors, algo poco habitual en el ecosistema de nubes de puntos; por otro, valida la integración de modelos 3D de terceros en la librería `torch-pointcloud`, que permite cargar el checkpoint con una sola llamada a `create_model` y usarlo tanto para inferencia de segmentación como para extracción de descriptores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KPConv deformable (kernel point convolution), red encoder-decoder con grid subsampling |
| Parametros totales | 25.629.701 (25,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 5 (XYZ + RGB) |
| Clases de salida | 13 |
| Canales de features | 128 |
| Dataset de entrenamiento | S3DIS, Área 5 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La red sigue el diseño KPConv introducido por Thomas et al. en 2019: una convolución definida directamente sobre nubes de puntos, sin voxelización ni proyección a imágenes. En lugar de operar sobre una rejilla regular, KPConv coloca un conjunto de «kernel points» en el espacio euclídeo alrededor del punto central y pondera la contribución de cada vecino según su distancia a esos puntos del kernel mediante funciones de correlación. La variante deformable (deform) aprende además un desplazamiento por cada kernel point, de modo que la geometría del filtro se adapta localmente a la distribución de puntos de la escena.

El modelo es un encoder-decoder con capas de grid subsampling para reducir progresivamente la resolución espacial y capas de upsampling para recuperar la resolución original punto a punto. La configuración `base-sm` corresponde a la variante pequeña de la familia base, con 128 canales de features y 25,6 M de parámetros. La entrada tiene 5 canales (coordenadas y color) y la salida son logits para 13 clases semánticas.

El entrenamiento se realizó sobre S3DIS con el protocolo estándar de validación en Área 5: las áreas 1, 2, 3, 4 y 6 se usan para entrenamiento y el Área 5 queda reservada para test, de forma que el modelo nunca ve esa sala durante el ajuste. No se documentan en la información disponible el número de épocas, el número de tokens o puntos procesados, la composición exacta del dataset más allá de S3DIS, ni si se aplicaron técnicas de aumento de datos específicas, regularización o ajuste fino posterior.

## Capacidades

- Segmentación semántica densa de nubes de puntos 3D: asigna una de 13 clases a cada punto de la escena.
- Procesamiento de nubes de puntos con información de color: acepta 5 canales de entrada (XYZ + RGB), lo que permite discriminar clases visualmente similares.
- Convolución deformable: los kernels se adaptan localmente a la geometría, lo que mejora la robustez ante densidades de muestreo irregulares.
- Extracción de features: expone `forward_features` para obtener descriptores de 128 dimensiones por punto, útiles para tareas downstream.
- Clasificación por punto configurable: `reset_classifier(num_classes=0)` permite reutilizar el backbone como extractor puro.
- Inferencia por lotes: la API acepta listas de muestras mediante `collate`, con soporte de batching sobre GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, generación de texto, código, matemáticas, visión 2D, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Segmentación de interiores para BIM y arquitectura: el modelo clasifica suelo, pared, techo, mobiliario y elementos estructurales en escaneos de edificios, lo que permite generar modelos de información de construcción semiautomáticos a partir de nubes de puntos de escaneo láser o fotogrametría.
- Inventario de mobiliario y activos: al etiquetar sillas, mesas, armarios y pizarras, se puede automatizar el recuento y la localización de activos en oficinas, aulas o instalaciones, con el Área 5 de S3DIS como referencia de rendimiento en entornos no vistos.
- Navegación y planificación de robots móviles en interiores: la segmentación por punto permite construir mapas semánticos que distinguen superficies transitables (suelo) de obstáculos (paredes, mobiliario), información que un planificador de trayectorias puede consumir directamente.
- Realidad aumentada y mixta: la clasificación semántica punto a punto facilita la oclusión correcta de objetos virtuales y la colocación de anclas sobre superficies reales identificadas como suelo o mesa.
- Digitalización de patrimonio y documentación de interiores: el modelo sirve como paso de preprocesado para separar elementos arquitectónicos de objetos móviles en escaneos de salas históricas o espacios singulares.
- Investigación en aprendizaje profundo 3D: con 25,6 M de parámetros y pesos en safetensors, es un baseline reproducible y ligero para comparar nuevas arquitecturas de convolución sobre nubes de puntos frente a KPConv deformable bajo el protocolo Área 5 de S3DIS.
- Preentrenamiento de descriptores para tareas downstream: mediante `forward_features` se obtienen embeddings de 128 dimensiones por punto que pueden alimentar clasificadores de escena, detección de objetos 3D o modelos de segmentación de instancias con pocos datos etiquetados.
- Control de calidad en escaneo 3D: la máscara semántica permite detectar regiones mal etiquetadas o geometrías anómalas (por ejemplo, puntos clasificados como pared en zonas de suelo) y priorizar la revisión manual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre S3DIS Área 5 con 13 clases:

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| S3DIS (Área 5) | Segmentación semántica de nubes de puntos | mIoU | 66,03 |
| S3DIS (Área 5) | Segmentación semántica de nubes de puntos | OA (accuracy global) | 89,52 |

No se han publicado en la información disponible resultados adicionales por clase, matrices de confusión ni comparaciones directas con otras arquitecturas bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 25,6 M de parámetros (unos 100 MB en FP32), el cuello de botella no son los pesos sino el número de puntos por muestra. Con 8.192 puntos por muestra, la inferencia cabe holgadamente en GPUs de 8 GB; con nubes de decenas de miles de puntos y batching, se recomienda 16 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM para uso individual (RTX 3060, RTX 4060, RTX 4070). Para procesar escenas completas por tiles o lotes grandes, se recomienda RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: sí. El modelo y sus pesos en FP32 ocupan aproximadamente 0,1 GB, por lo que una GTX 1660 de 6 GB o una RTX 3050 de 8 GB son suficientes para muestras de tamaño moderado.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`), que carga el checkpoint con `tp.create_model(..., pretrained=True)`. No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fuertemente del número de puntos por muestra, del radio de vecindad de las capas KPConv y del uso de grid subsampling.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mIoU S3DIS Área 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kpfcnn-base-sm-deform.s3dis-area5 (este modelo) | 25,6 M | Nube de puntos, 5 canales, 13 clases | 66,03 (declarado) | MIT | Hugging Face, safetensors |
| KPConv original (HuguesTHOMAS/KPConv-PyTorch) | no disponible en la información | Nube de puntos, 13 clases | no disponible en la información | MIT | GitHub |
| Otras arquitecturas de segmentación de nubes de puntos (PointNet++, RandLA-Net, etc.) | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | no disponible |

La información proporcionada no incluye resultados de benchmarks de los modelos alternativos bajo el mismo protocolo, por lo que no es posible establecer una comparación numérica fiable. La comparativa se limita, por tanto, a la disponibilidad y licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación semántica de nubes de puntos: no genera texto, no razona, no ejecuta código y no procesa imágenes, audio ni lenguaje natural.
- Dominio restringido a interiores: entrenado sobre S3DIS, un dataset de salas de oficinas y aulas. El rendimiento fuera de ese dominio (exteriores, industria, vehículos, patrimonio) no está garantizado y probablemente degrade de forma notable.
- Las 13 clases son fijas: si la aplicación requiere otras categorías, es necesario reentrenar la cabeza de clasificación o hacer fine-tuning con datos propios.
- Resultados no verificados: los valores de mIoU (66,03) y OA (89,52) son declarados por el autor del checkpoint y no han sido validados de forma independiente por el equipo de Hugging Face ni por terceros.
- Posible sobreajuste al protocolo Área 5: al estar entrenado y evaluado con el split estándar de S3DIS, los números pueden no trasladarse a escenas reales con sensores, densidades y ruidos diferentes.
- Requiere color: la entrada espera 5 canales (XYZ + RGB). Las nubes de puntos sin información de color necesitan adaptación del pipeline o reentrenamiento.
- Dependencia de la librería `torch-pointcloud`: la API de carga y el preprocesado (`info["transform"]`) están acoplados a esa librería, lo que limita la portabilidad a otros frameworks sin conversión manual.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y las citas académicas de KPConv y S3DIS si se redistribuye.
- Sin garantías de producción: no se documentan tests de robustez, sesgos geométricos ni comportamiento ante oclusiones severas o nubes incompletas.
- Sin datos de sesgo: no se han publicado análisis de sesgo por tipo de sala, material, iluminación o densidad de muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas
- Paper KPConv (arXiv:1904.08889): https://arxiv.org/abs/1904.08889
- Repositorio original KPConv-PyTorch: https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (referencia del paper CVPR 2016 de Armeni et al.): no disponible como enlace directo en la información proporcionada
