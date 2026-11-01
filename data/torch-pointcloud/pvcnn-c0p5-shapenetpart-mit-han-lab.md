# torch-pointcloud/pvcnn-c0p5.shapenetpart.mit-han-lab

## Resumen

PVCNN C0.5 es un modelo de segmentación de partes de nubes de puntos 3D, concretamente la variante de menor coste computacional de la familia Point-Voxel CNN (PVCNN) publicada por el laboratorio MIT HAN Lab. El modelo combina una rama de puntos y una rama de vóxeles fusionadas, lo que permite procesar nubes de puntos de forma eficiente sin voxelizar de forma densa ni renunciar a la estructura de vecindad local. Fue convertido al ecosistema `torch-pointcloud` por Arthur Dujardin y publicado en HuggingFace bajo licencia MIT.

El modelo está entrenado específicamente sobre el conjunto de datos ShapeNetPart para la tarea de segmentación de partes (part segmentation), distinguiendo hasta 50 clases de partes sobre objetos 3D. Con solo 1,1 millones de parámetros y un tamaño de repositorio prácticamente nulo (0,0 GB), está pensado para inferencia ligera y prototipado rápido en pipelines de visión 3D.

Su relevancia actual radica en que ofrece un punto de partida reproducible y de código abierto para tareas de segmentación semántica de partes en mallas y nubes de puntos, con métricas declaradas de ins_mIoU 85,46 y cls_mIoU 83,37 sobre ShapeNetPart, y una integración directa con PyTorch mediante la librería `torch-pointcloud`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN), rama de puntos y rama de vóxeles fusionadas |
| Parametros totales | 1.062.738 (1,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo 3D, sin capacidades de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posicion + normal) |
| Clases de salida | 50 |
| Dimension de caracteristicas | 2480 |
| Puntos de entrada (ejemplo) | 8192 |

## Arquitectura y entrenamiento

PVCNN es una arquitectura híbrida que combina una rama basada en puntos (point branch) y una rama basada en vóxeles (voxel branch). La rama de puntos captura información geométrica fina a nivel de punto, mientras que la rama de vóxeles explota la convolución 3D sobre una rejilla voxelizada para agregar contexto espacial de forma eficiente. La fusión de ambas ramas busca el compromiso entre la precisión de los métodos basados en puntos y la eficiencia de los métodos basados en vóxeles, reduciendo el coste de memoria frente a la voxelización densa.

La variante C0.5 corresponde a la configuración de menor anchura de canal de la familia PVCNN, lo que explica su reducido número de parámetros (1,1 M). El modelo fue entrenado sobre ShapeNetPart, un subconjunto de ShapeNet con anotaciones de partes por objeto, y se distribuye como pesos convertidos desde el repositorio original `mit-han-lab/pvcnn`. No se dispone de información sobre el número exacto de tokens, composición del dataset más allá de ShapeNetPart, ni sobre el uso de técnicas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Segmentación de partes de nubes de puntos 3D: asigna una etiqueta de parte a cada punto de entrada entre 50 clases posibles.
- Procesamiento de nubes de puntos con posición (3 canales) y normales (3 canales), es decir, 6 canales de entrada.
- Extracción de características: mediante `forward_features` o `reset_classifier(num_classes=0)` se obtienen representaciones de dimensión 2480 por punto.
- Integración con PyTorch mediante la librería `torch-pointcloud`, con función `create_model` y utilidades de transformación y colación de datos.
- Soporte de procesamiento por lotes (batch) gracias al vector `batch` que agrupa puntos de distintas muestras.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión 2D, tool calling, agentes ni multilingüismo.

## Casos de uso

- Segmentación de partes en escaneos 3D de objetos: el modelo recibe una nube de puntos con posiciones y normales y devuelve una etiqueta de parte por punto, útil para inventariar componentes de un objeto escaneado.
- Prototipado rápido en investigación de visión 3D: con 1,1 M de parámetros y pesos safetensors, se puede cargar y ejecutar en CPU o GPU modesta para validar pipelines de segmentación antes de escalar a modelos mayores.
- Preprocesado para pipelines de reconstrucción o análisis de mallas: las características de 2480 dimensiones extraídas con `forward_features` pueden alimentar clasificadores posteriores o tareas de recuperación.
- Docencia y experimentación con arquitecturas point-voxel: sirve como ejemplo reproducible de la familia PVCNN con métricas de referencia sobre ShapeNetPart.
- Benchmarking de infraestructura de inferencia 3D: su reducido tamaño permite medir latencia y throughput de librerías de nubes de puntos sin cuellos de botella de memoria.
- Anotación asistida de datos 3D: las predicciones de partes pueden usarse como preetiquetado para revisión humana en flujos de anotación de ShapeNetPart u objetos similares.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| ShapeNetPart | ins_mIoU | 85,46 |
| ShapeNetPart | cls_mIoU | 83,37 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 1,1 M de parámetros los pesos ocupan del orden de unos pocos MB, por lo que la memoria dominante es la de la nube de puntos de entrada (por ejemplo, 8192 puntos x 6 canales).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja son más que suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: inferencia directa con PyTorch y la librería `torch-pointcloud`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pvcnn-c0p5.shapenetpart.mit-han-lab | 1,1 M | Segmentación de partes 3D | no aplica | MIT | HuggingFace |
| PVCNN variantes mayores (C1, etc.) | no disponible | Segmentación de partes 3D | no aplica | MIT | Repositorio mit-han-lab |
| PointNet / PointNet++ | no disponible | Segmentación de partes 3D | no aplica | no disponible | Repositorios académicos |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de partes de nubes de puntos; no es un modelo de lenguaje ni tiene capacidades generativas de texto.
- Entrenado sobre ShapeNetPart, por lo que su generalización a dominios distintos (escenas reales, LiDAR, mallas no representadas) no está garantizada.
- Las métricas declaradas están marcadas como no verificadas (`verified: false`); conviene reproducirlas antes de usarlas como referencia en producción.
- No se documentan sesgos específicos, pero al derivar de un dataset académico puede heredar los sesgos de composición de ShapeNetPart.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de predicciones erróneas de parte en puntos ambiguos o ruidosos.
- Licencia MIT: permite uso comercial y modificación, aunque se recomienda conservar la atribución a los autores originales y a la conversión.
- No se dispone de información sobre cuantización ni sobre formatos alternativos a safetensors.
- El tamaño del repositorio es de 0,0 GB, lo que sugiere pesos muy ligeros; verificar la integridad de la descarga antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/pvcnn-c0p5.shapenetpart.mit-han-lab
- Paper PVCNN: https://arxiv.org/abs/1907.03739
- Repositorio original mit-han-lab/pvcnn: https://github.com/mit-han-lab/pvcnn
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
