# torch-pointcloud/randlanet.parislille3d.open3d

## Resumen

RandLA-Net para Paris-Lille-3D es un modelo de segmentación semántica de nubes de puntos 3D publicado por el usuario `torch-pointcloud` en HuggingFace, empaquetado para la librería PyTorch PointCloud de Arthur Dujardin. Se trata de una conversión de los pesos de referencia de Open3D-ML (licencia MIT) al formato safetensors, con 5.010.825 parámetros (5,0 M), 3 canales de entrada, 32 características internas y 9 clases de salida. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional, sino que asigna una etiqueta semántica a cada punto de una nube LiDAR.

El modelo implementa la arquitectura RandLA-Net presentada en CVPR 2020 (arXiv:1911.11236), cuyo objetivo es segmentar nubes de puntos de gran escala de forma eficiente sustituyendo el muestreo de puntos más lejano (farthest point sampling) por muestreo aleatorio, mucho más barato computacionalmente, y compensando la pérdida de información con módulos de agregación local de características. Está entrenado exclusivamente sobre el dataset urbano Paris-Lille-3D, capturado con sistemas de mapeo móvil en Lille y París.

Su relevancia práctica es acotada pero clara: ofrece un checkpoint pequeño (5 M de parámetros), con licencia MIT permisiva, cargable en pocas líneas con `torch-pointcloud`, lo que lo hace útil como línea base reproducible para segmentación semántica urbana y para tareas de extracción de características (embeddings de 32 dimensiones por punto). Los resultados declarados por el autor son mIoU 48,1 y OA 96,08 sobre Paris-Lille-3D, marcados como no verificados en el model-index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RandLA-Net (encoder-decoder con muestreo aleatorio de puntos y agregación local de características) |
| Parámetros totales | 5.010.825 (5,0 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no procesa secuencias de texto; el ejemplo de la model card usa 8.192 puntos por muestra |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica (segmentación de nubes de puntos); el campo de idiomas no está informado en la metadata |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (posición XYZ; el ejemplo añade intensidad como canal adicional) |
| Clases de salida | 9 (la lista de clases no se detalla en la información disponible) |
| Dimensión de características | 32 |
| Dataset de entrenamiento | Paris-Lille-3D |
| Librería | torch-pointcloud |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

RandLA-Net es una red encoder-decoder para segmentación semántica de nubes de puntos a gran escala. Su innovación principal es reemplazar el muestreo de puntos más lejano (FPS), que escala de forma cuadrática con el número de puntos, por muestreo aleatorio uniforme, que es O(1) por punto y permite procesar nubes de millones de puntos. Para contrarrestar la pérdida de puntos informativos que introduce el muestreo aleatorio, cada bloque del encoder aplica un módulo de agregación local de características (*local feature aggregation*) compuesto por codificación espacial relativa y *attentive pooling*, que preserva la geometría local en cada etapa de diezmado. El decoder recupera la resolución original mediante interpolación y conexiones de salto, y una cabeza lineal proyecta las características por punto a las 9 clases.

La información disponible no detalla el número de tokens ni de puntos vistos durante el entrenamiento, la composición exacta del dataset, la configuración de aumentos de datos ni si se aplicaron etapas de ajuste fino adicionales. Tampoco se documenta el proceso de conversión desde Open3D-ML más allá de indicar el repositorio de origen y su licencia MIT. El modelo expone dos modos de uso: inferencia de logits por punto mediante `model(x, pos, batch)` y extracción de características de 32 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`, lo que permite reutilizarlo como extractor congelado en pipelines posteriores.

## Capacidades

- Segmentación semántica por punto de nubes LiDAR urbanas en 9 clases, con salida de logits por punto.
- Extracción de características: `forward_features` devuelve un vector de 32 dimensiones por punto, reutilizable para clasificación, agrupación o *retrieval*.
- Reconfiguración de la cabeza de clasificación mediante `reset_classifier(num_classes=N)` para adaptación a otros conjuntos de etiquetas.
- Procesamiento por lotes mediante la función `collate` de `torch_pointcloud.utils.data`, con manejo de índices de lote (`batch`) para concatenar nubes de distinto tamaño.
- Integración con el pipeline de transformaciones que devuelve `info["transform"]` al crear el modelo con `return_info=True`.
- Ejecución en CPU y GPU indistintamente, al ser un modelo PyTorch de 5 M de parámetros.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión 2D, audio ni generación de texto: esas capacidades no aplican a su modalidad.

## Casos de uso

- Segmentación de levantamientos LiDAR urbanos: el modelo etiqueta cada punto de una nube de mapeo móvil en 9 clases, lo que permite separar suelo, edificaciones, vehículos y mobiliario urbano para inventarios y modelos digitales de ciudad.
- Línea base reproducible en investigación: al ser una conversión directa de Open3D-ML con métricas declaradas, sirve como referencia contra la que comparar arquitecturas nuevas sobre Paris-Lille-3D sin tener que reentrenar desde cero.
- Etiquetado asistido (pre-anotación): generar máscaras semánticas iniciales sobre nubes nuevas y corregirlas manualmente, reduciendo el coste de anotación en proyectos de percepción.
- Extracción de embeddings para búsqueda y agrupación: usar los vectores de 32 dimensiones por punto o por región para agrupar escenas similares, detectar anomalías geométricas o alimentar un clasificador ligero posterior.
- Preprocesado en pipelines de robótica móvil: filtrar y clasificar retornos LiDAR antes de tareas de planificación o localización, aprovechando que el modelo es pequeño y ejecutable en CPU.
- Prototipado rápido en docencia y pruebas de concepto: `pip install torch-pointcloud` y una llamada a `create_model` bastan para tener un segmentador 3D funcional, sin gestión de checkpoints manual.
- Adaptación a dominios específicos: con `reset_classifier` y ajuste fino sobre un dataset propio (por ejemplo, escaneos de interior o TLS), reutilizar el encoder preentrenado como inicialización.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Ninguno está marcado como verificado (`verified: false`).

| Dataset | Tarea | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Paris-Lille-3D | Segmentación de nubes de puntos | mIoU | 48,1 | No |
| Paris-Lille-3D | Segmentación de nubes de puntos | OA (exactitud global) | 96,08 | No |

La información proporcionada no incluye resultados de benchmarks frente a otros modelos, ni desglose de IoU por clase, ni métricas sobre otros datasets (SemanticKITTI, S3DIS u otros). No se han publicado resultados comparativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 20 MB en fp32 y 10 MB en fp16, calculados a partir de los 5.010.825 parámetros. El consumo real en inferencia está dominado por las activaciones, que escalan con el número de puntos por muestra, no por el tamaño del modelo.
- GPU recomendadas: cualquier GPU con 4 GB o más es sobradamente suficiente (GTX 1650, RTX 3060, RTX 4090). Un A100 o H100 solo tiene sentido para procesar lotes muy grandes de nubes densas en paralelo.
- Cabe en GPU de consumo y también en CPU: para nubes de 8.192 puntos, la inferencia en CPU es viable; para nubes de millones de puntos conviene GPU.
- Opciones de despliegue: PyTorch con la librería `torch-pointcloud` (vía `pip install torch-pointcloud`). No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a esta modalidad.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo de inferencia en la información proporcionada.

## Comparativa con modelos similares

No se dispone de métricas de modelos alternativos en la información proporcionada. La tabla recoge únicamente la comparación cualitativa de alternativas de la misma familia disponibles en Open3D-ML y en el ecosistema de segmentación de nubes de puntos.

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RandLA-Net (este modelo) | 5,0 M | 3 canales, nube arbitraria | mIoU 48,1 / OA 96,08 en Paris-Lille-3D (no verificado) | MIT | Pesos en HF, librería torch-pointcloud |
| KPConv (Open3D-ML) | no disponible | nube arbitraria con kernel puntual | no disponible | MIT (implementación Open3D-ML) | Pesos vía Open3D-ML |
| SparseConvUNet (Open3D-ML) | no disponible | vóxeles dispersos | no disponible | MIT (implementación Open3D-ML) | Pesos vía Open3D-ML |
| PointNet++ (implementaciones de terceros) | no disponible | nube arbitraria | no disponible | variable según implementación | Múltiples repositorios |

Criterio diferencial: RandLA-Net prioriza eficiencia en nubes de gran escala mediante muestreo aleatorio, mientras que KPConv mantiene mayor fidelidad geométrica a costa de más cómputo. No hay datos en la información disponible para cuantificar esa diferencia.

## Limitaciones y advertencias

- Métricas no verificadas: mIoU 48,1 y OA 96,08 figuran con `verified: false`; conviene reproducirlas antes de usarlas como referencia en publicaciones.
- Dominio restringido: entrenado solo con Paris-Lille-3D (mapeo móvil urbano, 9 clases). El rendimiento caerá con toda probabilidad en interiores, escaneos aéreos, TLS denso o entornos no urbanos.
- mIoU moderado: un 48,1 de mIoU con un 96,08 de exactitud global indica un fuerte desequilibrio de clases; las clases minoritarias (peatones, bolardos, papeleras) probablemente se confundan con frecuencia. No hay desglose por clase para confirmarlo.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay reportes independientes de calidad ni incidencias conocidas.
- El muestreo aleatorio de puntos puede introducir variabilidad entre ejecuciones. La información disponible no documenta si la inferencia es determinista ni cómo se fija la semilla.
- Sin cuantizaciones oficiales ni formatos alternativos: solo safetensors; no se declara la precisión exacta de los pesos (se asume fp32, sin confirmación explícita).
- Dependencia de una librería de nicho (`torch-pointcloud`, mantenida por un único autor) y de su función `transform`/`collate`; la API puede cambiar entre versiones.
- Las transformaciones y la normalización aplicadas en `info["transform"]` no están documentadas en detalle; usarlas de forma distinta a la prevista altera los resultados.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican en la información disponible las licencias de las dependencias (PyTorch, Open3D-ML) más allá de MIT en el código de origen; conviene revisarlas antes de un despliegue comercial.
- Sin garantías de soporte: no se documenta mantenimiento, versionado del checkpoint ni canal de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/randlanet.parislille3d.open3d
- Paper de RandLA-Net (arXiv:1911.11236, CVPR 2020): https://arxiv.org/abs/1911.11236
- Repositorio de la librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Repositorio de origen de los pesos (Open3D-ML): https://github.com/isl-org/Open3D-ML
- DOI de PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
- PyTorch (framework base): https://pytorch.org/
