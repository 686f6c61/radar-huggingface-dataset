# torch-pointcloud/kpfcnn-base-deform.s3dis-area5.hugues-thomas

## Resumen

kpfcnn-base-deform.s3dis-area5.hugues-thomas es un modelo de segmentación semántica de nubes de puntos 3D basado en KPConv (Kernel Point Convolution) con kernel deformable. Lo publica el colectivo torch-pointcloud, que lo ha convertido a su propia librería a partir de la implementación original de Hugues Thomas (KPConv-PyTorch). No es un modelo de lenguaje: es una red neuronal convolucional para puntos 3D que asigna una clase semántica a cada punto de una escena, en este caso 13 clases de interior (suelo, pared, silla, mesa, etc.).

El modelo está entrenado sobre S3DIS, el dataset de referencia de parseo semántico de interiores a gran escala, y se distribuye con el checkpoint específico del fold Area 5, que es el protocolo estándar de evaluación de S3DIS (entrenar con 5 áreas y evaluar en la sexta). Con 25,8 millones de parámetros y 128 canales de features, es un modelo compacto y ligero (0,1 GB de repositorio) que cabe sin problemas en GPU de consumo.

Su relevancia actual es práctica: la librería torch-pointcloud ofrece una API unificada (`tp.create_model`) para cargar el modelo, aplicar el transform de preprocesado y extraer features, lo que reduce el trabajo de integración frente a reproducir el repositorio original. Es útil como baseline sólido y reproducible para tareas de segmentación semántica 3D en interiores, y como extractor de descriptores por punto para pipelines posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KPConv deformable (Kernel Point Convolution), red encoder-decoder convolucional sobre nubes de puntos |
| Parametros totales | 25.889.171 (25,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 8.192 puntos por muestra en el ejemplo de la model card (no es un límite fijo documentado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 5 (posicion XYZ + color RGB, segun la model card) |
| Clases de salida | 13 (S3DIS) |
| Dimension de features | 128 |
| Dataset de entrenamiento | S3DIS, fold Area 5 |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

KPConv propone una convolución definida directamente sobre nubes de puntos: en lugar de voxelizar o proyectar, coloca un conjunto de "kernel points" en el espacio euclídeo y pondera las contribuciones de los vecinos según su distancia a cada kernel point mediante una función de correlación. La variante deformable, que es la que usa este checkpoint, aprende desplazamientos por kernel point, de modo que la geometría del filtro se adapta localmente a la estructura de la superficie. El modelo es un encoder-decoder con conexiones de salto, 128 canales de features y una cabeza de clasificación por punto sobre 13 clases.

El entrenamiento se realizó sobre S3DIS con el protocolo de validación cruzada por áreas, publicándose el checkpoint correspondiente a la evaluación en Area 5. La model card no documenta el número de tokens/puntos vistos, la composición exacta del dataset más allá de S3DIS, ni si hubo aumentos de datos específicos, esquema de optimización o regularización; esos detalles deben consultarse en el repositorio original KPConv-PyTorch y en el paper ICCV 2019. La conversión a torch-pointcloud la firma Arthur Dujardin y mantiene la licencia MIT del código original.

## Capacidades

- Segmentación semántica por punto: asigna una de 13 clases S3DIS a cada punto de la nube de entrada.
- Convolución con kernel deformable: adapta la geometría del filtro a la superficie local, lo que mejora el ajuste en geometrías irregulares.
- Extracción de features: `forward_features` devuelve descriptores de 128 dimensiones por punto, reutilizables para clasificación, clustering o recuperación.
- Clasificación con cabeza sustituible: `reset_classifier(num_classes=0)` permite usar el backbone como extractor puro o reentrenar la cabeza para otro conjunto de clases.
- Entrada multimodal a nivel de punto: posición XYZ más color RGB (5 canales).
- Procesamiento por lotes con `collate`, pensado para escenas con distinto número de puntos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo lingüístico.
- No dispone de modo thinking, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- Segmentación de interiores escaneados: dado un levantamiento con LiDAR o fotogrametría de una planta de oficina, el modelo etiqueta suelo, pared, techo, mobiliario y elementos estructurales punto a punto, lo que sirve de base para planos semánticos y mediciones.
- Modelado BIM asistido: la salida de 13 clases permite separar elementos constructivos de mobiliario antes de alimentar herramientas de reconstrucción, reduciendo el trabajo manual de clasificación previo al modelado.
- Robótica móvil en interiores: un robot con cámara de profundidad puede usar el modelo para distinguir suelo transitable de obstáculos (sillas, mesas, paredes) y planificar la navegación con información semántica, no solo geométrica.
- Inventario y facility management: el etiquetado de sillas, mesas, papeleras y demás mobiliario permite contar y localizar activos en un escaneo, con la ventaja de que el modelo es pequeño (25,8 M de parámetros) y puede ejecutarse en hardware modesto.
- Extracción de descriptores para búsqueda: los features de 128 dimensiones por punto permiten construir embeddings de regiones y hacer recuperación de escenas o detección de anomalías comparando descriptores.
- Baseline y evaluación de investigación: con mIoU 67,08 y OA 89,92 en Area 5, es una referencia reproducible para comparar nuevas arquitecturas de segmentación 3D con el mismo protocolo.
- Preetiquetado en pipelines de anotación: generar etiquetas iniciales sobre nubes nuevas y revisarlas manualmente, acelerando la creación de datasets propios.
- Control de calidad de escaneos: detectar regiones mal etiquetadas o geometrías atípicas a partir de la distribución de clases predichas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | mIoU | 67,08 |
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | OA (accuracy global) | 89,92 |

No se han publicado en la informacion disponible otros resultados (por clase, por area, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 0,1 GB en safetensors; en FP32 los 25,8 M de parámetros suponen aproximadamente 100 MB de pesos. Con activaciones para 8.192 puntos por muestra, la huella cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente; A100/H100 solo tienen sentido para lotes grandes o procesamiento masivo en paralelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de modelos actuales (GTX 1660, RTX 2060 en adelante).
- Despliegue: la vía documentada es la librería torch-pointcloud (`pip install torch-pointcloud`) con PyTorch. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican aquí. Para servir el modelo conviene envolverlo en un servicio propio (FastAPI, TorchServe) o exportarlo a ONNX/TorchScript.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del número de puntos por muestra, del radio de vecindad y del hardware; conviene medirlos con el tamaño de nube real del caso de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU S3DIS Area 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kpfcnn-base-deform (este) | 25,8 M | nube de puntos, 5 canales, 13 clases | 67,08 (declarado) | MIT | Hugging Face + torch-pointcloud |
| KPConv original (HuguesTHOMAS/KPConv-PyTorch) | ~25 M (variante equivalente) | nube de puntos, 13 clases | no disponible en esta informacion | MIT | GitHub |
| PointNet++ | no disponible en esta informacion | nube de puntos, 13 clases | no disponible en esta informacion | no disponible en esta informacion | implementaciones multiples |
| RandLA-Net | no disponible en esta informacion | nube de puntos, 13 clases | no disponible en esta informacion | no disponible en esta informacion | GitHub |

La comparación cuantitativa con PointNet++ o RandLA-Net no puede completarse con los datos proporcionados: no se han incluido sus cifras de mIoU ni sus recuentos de parámetros. Lo que sí es contrastable es que este checkpoint es una conversión directa de KPConv, por lo que su rendimiento debe coincidir con el de la implementación original en igualdad de protocolo, y que su licencia MIT facilita el uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en S3DIS (interiores de oficinas y aulas). El rendimiento fuera de ese dominio (exteriores, industria, escenas urbanas) no está documentado y previsiblemente será peor.
- Conjunto de clases cerrado: solo predice las 13 clases de S3DIS; cualquier objeto fuera de esa taxonomía se asignará a una clase existente.
- Métricas no verificadas: los valores de mIoU y OA están marcados como `verified: false` en el model-index, es decir, son declaraciones del autor sin reproducción independiente.
- Riesgo de error en clases minoritarias: con mIoU 67,08 frente a OA 89,92, la brecha indica que algunas clases se segmentan bastante peor que la media; conviene evaluar por clase antes de producción.
- Sin cuantizaciones publicadas: no hay versiones GGUF, INT8 ni ONNX en el repositorio, por lo que el despliegue en entornos no-PyTorch requiere conversión propia.
- Dependencia de la librería: el uso documentado pasa por torch-pointcloud y su función `create_model`; cambios de API en esa librería pueden romper la integración.
- Preprocesado obligatorio: hay que aplicar el `transform` y el `collate` que devuelve `info`, y respetar el orden de canales (posiciones + color); saltarse ese paso produce predicciones incorrectas sin aviso.
- Sin documentación de sesgos: no se han publicado análisis de sesgo geométrico, sensibilidad a la densidad de puntos o robustez frente a ruido y oclusiones.
- Licencia MIT: permisiva para uso comercial, pero exige conservar el aviso de copyright; el modelo deriva de KPConv-PyTorch, también MIT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/kpfcnn-base-deform.s3dis-area5.hugues-thomas
- Paper KPConv (ICCV 2019): https://arxiv.org/abs/1904.08889
- Repositorio original KPConv-PyTorch: https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (paper CVPR 2016): no disponible enlace directo en la informacion proporcionada
