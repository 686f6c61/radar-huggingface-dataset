# torch-pointcloud/pointnext-xl.s3dis-area5.openpoints

## Resumen

pointnext-xl.s3dis-area5.openpoints es un modelo de segmentación semántica de nubes de puntos 3D, es decir, asigna una etiqueta de clase a cada punto individual de una escena. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones. Lo publica el proyecto torch-pointcloud (Arthur Dujardin) como conversión del modelo oficial PointNeXt de Guocheng Qian, con pesos en safetensors y 41.705.677 parámetros totales (41,6 M según la model card).

La arquitectura es PointNeXt, una revisión de PointNet++ que incorpora bloques MLP con residual invertido y estrategias de entrenamiento y escalado mejoradas. La variante XL es la de mayor tamaño de la familia y está entrenada sobre el dataset S3DIS de escenas interiores, con 13 clases semánticas (suelo, pared, mesa, silla, puerta, etc.) y 4 canales de entrada.

Su relevancia práctica es doble: por un lado ofrece un baseline de segmentación semántica de interiores con métricas declaradas de mIoU 71,24 y OA 90,95 sobre la partición Area 5 de S3DIS; por otro, llega empaquetado en una librería (`torch-pointcloud`) que resuelve carga, transformación de datos y extracción de features con pocas líneas de código, lo que reduce la fricción habitual para reutilizar modelos de nube de puntos en pipelines propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado con bloques MLP de residual invertido), segmentación semántica por punto |
| Parametros totales | 41.705.677 (41,6 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica: la entrada es una nube de N puntos (el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (precision original no declarada) |
| Idiomas soportados | no disponible; no aplica (modelo de visión 3D, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `torch-pointcloud`, PyTorch) |
| Tarea | Segmentación semántica de nubes de puntos (`point-cloud-segmentation`) |
| Dataset de evaluación | S3DIS, partición Area 5 |
| Clases de salida | 13 |
| Canales de entrada | 4 |
| Dimension de features internas | 64 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

PointNeXt reformula PointNet++ manteniendo su jerarquía de agrupación y muestreo (set abstraction) pero sustituyendo los bloques internos por MLPs con conexiones residuales invertidas, más eficientes en parámetros y en cómputo. El trabajo original (NeurIPS 2022) demuestra que buena parte de la brecha frente a transformers de nubes de puntos se cerraba con mejores estrategias de entrenamiento y escalado, no solo con cambios arquitectónicos. Esta variante XL usa 4 canales de entrada y produce representaciones de 64 dimensiones antes de la cabeza de clasificación por punto, con 13 clases de salida.

El entrenamiento se realizó sobre S3DIS (Stanford 3D Indoor Spaces), un dataset de escenas de interior anotadas a nivel de punto. La model card indica "Trained on S3DIS (Area 5)", lo que en la convención del benchmark corresponde al protocolo leave-one-area-out con Area 5 como partición de test (el resto de áreas para entrenamiento). No se especifican en la información disponible el número de épocas, el volumen de puntos vistos, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal u otras), que no aplican a este tipo de modelo.

## Capacidades

- Segmentación semántica densa: clasifica cada punto de una escena de interior en una de 13 categorías (suelo, techo, pared, viga, columna, ventana, puerta, mesa, silla, sofá, estantería, pizarra y clutter).
- Entrada multimodal geométrica: el pipeline de la librería compone posición (`pos`), color (`color`) y normales/posición normalizada (`norm_pos`) en el tensor de features de entrada.
- Extracción de features: `forward_features` y `reset_classifier(num_classes=0)` devuelven un vector de 64 dimensiones por punto, reutilizable como embedding para tareas posteriores (clustering, recuperación, modelos down stream).
- Procesamiento por lotes: la API `collate` permite agrupar varias nubes de puntos con máscara de batch, apta para inferencia sobre escenas completas o tiles.
- Ajuste de la cabeza de clasificación: `reset_classifier` permite reemplazar la cabeza de 13 clases por otro número de clases para fine-tuning en dominios propios.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, audio ni texto: es un modelo puramente perceptivo 3D.
- Capacidades multilingües: no aplica.

## Casos de uso

- Inventario y modelado BIM de interiores: procesar escaneos o fotogrametría de plantas de edificio y obtener por punto la clase semántica, lo que permite extraer automáticamente superficies de suelo, paredes y techos para reconstruir el modelo BIM o el gemelo digital del espacio.
- Digitalización de espacios para facility management: inventariar mobiliario (mesas, sillas, sofás, estanterías) a partir de escaneos periódicos y comparar el estado del espacio entre campañas.
- Anotación asistida de datasets 3D: usar las predicciones como pre-etiquetado y corregir manualmente solo los puntos dudosos, reduciendo el coste de anotación punto a punto, que es la parte más cara de cualquier proyecto de segmentación 3D.
- Robótica de interiores y navegación: clasificar la escena captada por LiDAR o RGB-D para distinguir suelo transitable, obstáculos y mobiliario, alimentando la capa de planificación o de evitación de obstáculos.
- Realidad aumentada y mapeo espacial: segmentar la geometría del entorno para anclar contenido virtual en superficies correctas (por ejemplo, colocar objetos sobre mesas o paredes detectadas).
- Extracción de embeddings para búsqueda y recuperación: usar los 64 features por punto como representación para agrupar escenas similares, detectar anomalías o entrenar clasificadores ligeros con menos datos etiquetados.
- Control de calidad de escaneos: detectar regiones mal capturadas o clases sobrerrepresentadas (por ejemplo, "clutter" con un porcentaje anómalo) como señal de alerta en un pipeline de captura.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | mIoU | 71,24 |
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | OA (accuracy global) | 90,95 |

No se han publicado en la información disponible resultados de latencia, throughput, ni métricas por clase. Tampoco hay comparaciones numéricas con otros modelos en la documentación aportada.

## Requisitos de hardware

- VRAM para pesos: entorno a 167 MB en fp32 y 84 MB en fp16 para 41,7 M de parámetros (cálculo derivado del número de parámetros, no publicado por el autor).
- VRAM total: la memoria dominante son las activaciones, que escalan con el número de puntos por muestra. Para el ejemplo de 8192 puntos de la model card una GPU de 8 GB es holgada; para escenas completas de cientos de miles de puntos conviene trocear en tiles o usar GPUs de 16-24 GB (estimación orientativa, no medida).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060/4060 8 GB en adelante) sirve para inferencia por tiles; A100/H100 solo tienen sentido para entrenamiento o fine-tuning con lotes grandes.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más, siempre que se limite el número de puntos por lote.
- Despliegue: la vía soportada es PyTorch con la librería `torch-pointcloud` (`pip install torch-pointcloud`, `tp.create_model(..., pretrained=True)`). vLLM, llama.cpp, Ollama y TGI no aplican. La exportación a ONNX o TorchScript no está documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset / metrica | Licencia | Disponibilidad |
|---|---|---|---|---|
| pointnext-xl.s3dis-area5.openpoints (este) | 41,7 M | S3DIS Area 5: mIoU 71,24 / OA 90,95 | MIT | HuggingFace, via `torch-pointcloud` |
| PointNeXt (variantes S, B, L del repo oficial) | no disponible en la informacion | S3DIS: no disponible en la informacion | MIT (repo original) | GitHub guochengqian/PointNeXt |
| PointNet++ (linea base previa) | no disponible en la informacion | S3DIS: no disponible en la informacion | no disponible en la informacion | Ampliamente implementado en librerias 3D |
| Point Transformer V3 u otros transformers de nubes de puntos | no disponible en la informacion | S3DIS: no disponible en la informacion | no disponible en la informacion | Repositorios academicos |

La información proporcionada no incluye métricas de los modelos alternativos, por lo que la comparación numérica de rendimiento no está disponible. La comparación fiable se limita a la licencia (MIT, permisiva) y al formato de distribución (safetensors integrado en una librería con API de carga y transformación).

## Limitaciones y advertencias

- Dominio restringido: está entrenado exclusivamente en S3DIS, escenas de interior de oficinas y aulas con 13 clases fijas. No cubre exteriores, industria, conducción autónoma ni categorías fuera de ese vocabulario.
- Protocolo de evaluación: al evaluarse sobre Area 5 con el resto de áreas como entrenamiento, el rendimiento en entornos con sensores, densidades o iluminación distintos a los de S3DIS puede degradarse de forma notable.
- Métricas no verificadas: los valores de mIoU y OA están marcados como `verified: false` en la model card; no hay una evaluación independiente publicada.
- Sin cifras de robustez: no se documentan resultados frente a ruido, oclusiones, subsampling o cambios en el número de puntos de entrada, factores críticos en producción.
- Riesgo de predicción errónea (equivalente a alucinación en este dominio): clases confundibles como ventana/pared o estantería/pared pueden generar etiquetas incorrectas sin señal de confianza explícita; conviene calibrar con umbrales sobre los logits.
- Sesgos de dataset: S3DIS sobrerrepresenta tipologías de mobiliario y distribución de clases concretas; la frecuencia de "clutter" y la ausencia de ciertas categorías condicionan el comportamiento en dominios nuevos.
- Idiomas y texto: no aplica; el modelo no procesa lenguaje, por lo que no debe presentarse como asistente conversacional.
- Licencia: MIT permite uso comercial y modificación, pero el dataset S3DIS tiene sus propias condiciones de uso que deben respetarse si se redistribuyen datos o derivados entrenados con ellos.
- Madurez: repositorio con 0 descargas y 0 likes, publicado en 2026; no hay evidencia de validación comunitaria ni de soporte a largo plazo.
- Despliegue: no hay herramientas estándar de servido (vLLM, TGI) para este tipo de modelo; hay que construir el servicio alrededor de PyTorch, con gestión propia de batching y preprocesado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnext-xl.s3dis-area5.openpoints
- Paper PointNeXt (NeurIPS 2022): https://arxiv.org/abs/2206.04670
- Repositorio original PointNeXt: https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (pagina oficial de Stanford): http://buildingparser.stanford.edu/dataset.html
- Los resultados de busqueda web aportados no contenian enlaces adicionales relevantes sobre el modelo (devolvian paginas generales sobre PyTorch y sobre un navegador homonimo).
