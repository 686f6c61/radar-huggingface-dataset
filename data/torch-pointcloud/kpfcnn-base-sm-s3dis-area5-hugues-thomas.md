# torch-pointcloud/kpfcnn-base-sm.s3dis-area5.hugues-thomas

## Resumen

kpfcnn-base-sm.s3dis-area5.hugues-thomas es un modelo de segmentación semántica de nubes de puntos 3D basado en KPConv (Kernel Point Convolution), la convolución deformable sobre puntos propuesta por Hugues Thomas et al. en ICCV 2019. El modelo ha sido convertido al ecosistema de la librería `torch-pointcloud` por Arthur Dujardin y publicado por la organización `torch-pointcloud`. No es un modelo de lenguaje: su entrada es una nube de puntos con coordenadas XYZ y color RGB, y su salida es una etiqueta semántica por punto entre 13 clases de interior.

El modelo está entrenado sobre el dataset S3DIS (Stanford 3D Indoor Spaces), evaluado en el protocolo estándar de validación sobre el Area 5, con resultados declarados de mIoU 65,34 y OA 88,94. Cuenta con 23,9 millones de parámetros, 128 características por punto y una cabeza de clasificación de 13 clases. Su relevancia actual radica en que ofrece una implementación reproducible y empaquetada (pesos en safetensors, API de una línea vía `tp.create_model`) de un método de referencia en segmentación de nubes de puntos, lo que facilita su uso como baseline o como extractor de características geométricas.

La licencia MIT, heredada del repositorio original de KPConv-PyTorch, permite uso comercial sin restricciones adicionales. El modelo está pensado para tareas de percepción 3D en interiores: reconstrucción semántica de escenas, robótica indoor, BIM y análisis de escaneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KPConv / KP-FCNN (Kernel Point Convolution, convolución deformable sobre nubes de puntos) |
| Parametros totales | 23.943.913 (23,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos); entrada típica de 8.192 puntos por muestra en el ejemplo de la model card |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,1 GB) |
| Canales de entrada | 5 (XYZ + color RGB, según model card) |
| Clases de salida | 13 (S3DIS) |
| Dimensión de características | 128 |
| Dataset de entrenamiento/evaluación | S3DIS, validación sobre Area 5 |
| Librería | torch-pointcloud (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una KP-FCNN, una red totalmente convolucional que apila capas de KPConv. A diferencia de las convoluciones en rejilla, KPConv define un conjunto de puntos kernel en el espacio euclídeo y pondera las contribuciones de los vecinos mediante una función de correlación espacial, lo que permite trabajar directamente sobre coordenadas continuas sin voxelizar. La variante deformable aprende desplazamientos de los puntos kernel, adaptando el campo receptivo a la geometría local. El modelo recibe 5 canales de entrada (posición y color), procesa jerárquicamente la nube con submuestreo por grid y produce logits por punto sobre 13 clases.

No se dispone de información detallada en la documentación proporcionada sobre el número exacto de tokens/puntos de entrenamiento, la composición completa del dataset más allá de S3DIS, ni sobre si se aplicaron técnicas de aumento de datos específicas o regularización. El modelo es una conversión de los pesos del repositorio original `HuguesTHOMAS/KPConv-PyTorch`, por lo que hereda el procedimiento de entrenamiento descrito en el paper de ICCV 2019. No se documentan innovaciones adicionales más allá del propio KPConv.

## Capacidades

- Segmentación semántica por punto en nubes de puntos 3D de interiores, con 13 clases (pared, suelo, mesa, silla, etc., según la taxonomía S3DIS).
- Extracción de características geométricas por punto: `forward_features` devuelve un vector de 128 dimensiones por punto, reutilizable para clasificación, clustering o recuperación.
- Eliminación de la cabeza clasificadora mediante `reset_classifier(num_classes=0)` para obtener un backbone puro.
- Procesamiento de nubes de puntos de tamaño variable mediante batching con índices de batch (`collate`).
- Integración nativa con PyTorch y con la librería `torch-pointcloud`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión 2D ni audio.
- Capacidades multilingües: no aplica.

## Casos de uso

- Reconstrucción semántica de interiores: dado un escaneo LiDAR o fotogramétrico de una habitación u oficina, el modelo etiqueta cada punto con su clase semántica, permitiendo generar mapas semánticos 3D para planificación robótica o análisis de espacios.
- Digitalización BIM y arquitectura: segmentar suelos, paredes, techos y mobiliario de escaneos de edificios para alimentar pipelines de modelado as-built y detección de elementos constructivos.
- Robótica móvil indoor: como módulo de percepción que clasifica el entorno en tiempo real, permitiendo a un robot distinguir superficies transitables (suelo) de obstáculos (muebles, paredes) a partir de su nube de puntos.
- Preprocesado para pipelines de detección de objetos 3D: usar las etiquetas semánticas por punto para filtrar ruido y aislar regiones de interés antes de aplicar detectores de instancias o modelos de reconstrucción.
- Extracción de características para aprendizaje autosupervisado o transferencia: emplear `forward_features` para obtener descriptores de 128 dimensiones por punto y entrenar cabezas ligeras sobre dominios específicos con pocos datos etiquetados.
- Benchmarking y validación de métodos de segmentación: servir como baseline reproducible con métricas declaradas (mIoU 65,34, OA 88,94 en Area 5) para comparar nuevas arquitecturas sobre S3DIS.
- Análisis de accesibilidad y espacio: cuantificar superficies libres, alturas de mobiliario y distribución de clases en un espacio para estudios de ergonomía o cumplimiento normativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| S3DIS (Area 5) | Segmentación semántica de nubes de puntos | mIoU | 65,34 |
| S3DIS (Area 5) | Segmentación semántica de nubes de puntos | OA (accuracy global) | 88,94 |

No se han publicado en la información disponible resultados adicionales de benchmarks ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 23,9 M de parámetros; en FP32 los pesos ocupan aproximadamente 96 MB, y en FP16 unos 48 MB. Con activaciones y buffers para lotes de 8.192 puntos, el consumo típico se sitúa en el rango de 1-4 GB de VRAM, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; se recomiendan RTX 3060/4060 o superiores para comodidad. Para entrenamiento o lotes grandes, A100, H100 o RTX 4090 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante), dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud` (instalación vía `pip install torch-pointcloud`); exportación a TorchScript u ONNX no documentada en la información disponible.
- Latencia y throughput: no disponibles. Dependen fuertemente del número de puntos por muestra y de la implementación de la búsqueda de vecinos (grid subsampling), que suele ser el cuello de botella.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos sobre el mismo protocolo (S3DIS Area 5) que permitan una comparación rigurosa. Se indican a continuación alternativas conceptuales de la misma categoría, sin datos de rendimiento verificados en esta ficha:

| Modelo | Categoría | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kpfcnn-base-sm.s3dis-area5 (este modelo) | KPConv / segmentación de nubes de puntos | 23,9 M | nube de puntos, 8.192 puntos por muestra (ejemplo) | MIT | Hugging Face, torch-pointcloud |
| PointNet++ | Segmentación de nubes de puntos | no disponible | nube de puntos | habitualmente MIT/Apache en implementaciones | múltiples repositorios |
| RandLA-Net | Segmentación de nubes de puntos a gran escala | no disponible | nube de puntos | no disponible | repositorios académicos |
| MinkowskiNet | Convolución dispersa 3D | no disponible | vóxeles | no disponible | repositorios académicos |

Los datos de parámetros, contexto y rendimiento de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en S3DIS, un dataset de interiores de oficinas; su generalización a exteriores, escenas urbanas o nubes de puntos de otro tipo de sensor no está garantizada.
- La evaluación se realiza sobre el Area 5 de S3DIS, protocolo estándar pero limitado: no hay validación cruzada ni resultados en otros dominios publicados en la información disponible.
- Las métricas declaradas (mIoU 65,34, OA 88,94) figuran como no verificadas (`verified: false`) en el model-index; deben tomarse como resultados del autor.
- No hay información sobre sesgos del dataset ni sobre el impacto de la composición de S3DIS en el rendimiento por clase (las clases minoritarias suelen tener IoU muy inferior a la media).
- Riesgo de degradación ante nubes de puntos con ruido, oclusiones, densidades muy distintas a las de entrenamiento o ausencia de color (el modelo espera 5 canales de entrada).
- No es un modelo generativo ni de lenguaje: no debe emplearse para tareas de texto, razonamiento o diálogo.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales de KPConv y a la conversión de `torch-pointcloud`.
- No se documentan cuantizaciones oficiales ni soporte para runtimes de inferencia alternativos (ONNX Runtime, TensorRT); el despliegue en producción requiere validar la exportación por cuenta propia.
- El tiempo de inferencia puede ser elevado en nubes de puntos grandes debido a la búsqueda de vecinos; conviene evaluar el rendimiento real en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/kpfcnn-base-sm.s3dis-area5.hugues-thomas
- Paper KPConv (ICCV 2019): https://arxiv.org/abs/1904.08889
- Repositorio original KPConv-PyTorch: https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería torch-pointcloud: https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (paper CVPR 2016): referencia en la model card, sin URL directa proporcionada
