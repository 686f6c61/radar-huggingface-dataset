# torch-pointcloud/pointnext-xl.s3dis-area3.openpoints

## Resumen

PointNeXt XL para S3DIS Area 3 es un modelo de segmentación semántica de nubes de puntos 3D, no un modelo de lenguaje. Lo publica el proyecto `torch-pointcloud` (Arthur Dujardin) como conversión de los pesos oficiales de PointNeXt (Guocheng Qian et al., NeurIPS 2022) al ecosistema de la librería `torch-pointcloud`, con pesos en `safetensors`. Su tarea es asignar una etiqueta semántica a cada punto de una escena interior, con 13 clases del dataset S3DIS (Stanford Large-Scale 3D Indoor Spaces).

La arquitectura es PointNeXt, una revisión de PointNet++ que incorpora bloques residuales invertidos, estrategias de aumento de datos y un esquema de escalado controlado del ancho y la profundidad de la red. Esta variante "XL" tiene 41,6 M de parámetros, 4 canales de entrada (coordenadas XYZ más color), 64 características internas y 13 clases de salida. Es relevante porque ofrece un checkpoint listo para usar en PyTorch con una API de una línea (`tp.create_model`), algo poco habitual en el ecosistema de nubes de puntos, donde la mayoría de implementaciones requieren clonar repositorios de investigación con dependencias frágiles.

La model card declara mIoU de 84,95 y exactitud global (OA) de 93,72 sobre S3DIS Area 3, aunque ambos valores están marcados como no verificados en el `model-index`. El modelo sirve tanto para inferencia de segmentación como para extracción de características (embeddings de 64 dimensiones por punto) y ajuste fino en dominios cercanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado con bloques residuales invertidos), red neuronal sobre nubes de puntos |
| Parametros totales | 41.705.677 (41,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de nube de puntos. El ejemplo de la model card usa 8192 puntos por muestra; el limite real depende de la memoria disponible y no esta documentado |
| Tipos de cuantizacion | No disponible (la model card solo publica pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (modelo visual-geometrico, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Segmentacion semantica de nubes de puntos (`point-cloud-segmentation`) |
| Dataset de entrenamiento | S3DIS, Area 3 |
| Clases de salida | 13 |
| Canales de entrada | 4 |
| Dimension de caracteristicas internas | 64 |
| Tamano del repositorio | 0,2 GB |
| Libreria | torch-pointcloud |
| Autor / conversion | torch-pointcloud, a partir de guochengqian/PointNeXt (MIT) |
| Fecha de creacion / actualizacion | 2026-08-28 / 2026-10-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

PointNeXt parte de PointNet++, el esquema jerarquico de abstraccion de conjuntos (set abstraction) que muestrea y agrupa puntos con capas tipo PointNet locales. La revision de Qian et al. anade bloques residuales invertidos inspirados en MobileNetV2, normalizacion y activaciones mas adecuadas, y un conjunto de estrategias de aumento (escalado, traslacion, rotacion, jitter, dropout de puntos) que elevan de forma notable el rendimiento sin cambiar la familia de arquitectura. El resultado es una red que escala de forma predecible en parametros y precision, lo que da lugar a las variantes S, B, L y XL; esta ficha corresponde a la XL.

El checkpoint se entrena para segmentacion semantica sobre S3DIS, un corpus de escaneos Matterport de habitaciones de interior anotados con 13 clases (techo, suelo, pared, viga, columna, ventana, puerta, mesa, silla, sofa, libro, tablero y clutter). La model card no detalla el numero de tokens/puntos vistos, la composicion exacta del split ni si hubo etapas de refinamiento posteriores; solo indica que la evaluacion reportada corresponde a Area 3 del dataset. La conversion desde el repositorio original mantiene los pesos y la licencia MIT, y la unica innovacion anadida por el publicador es el empaquetado: pesos en `safetensors`, `create_model` con `pretrained=True` y transformaciones de datos integradas en la libreria.

## Capacidades

- Segmentacion semantica punto a punto: devuelve logits por punto para las 13 clases de S3DIS, apto para generar mapas de clases de una escena interior completa.
- Extraccion de caracteristicas: `forward_features` y `reset_classifier(num_classes=0)` producen embeddings de 64 dimensiones por punto, utiles para clasificacion de escenas, retrieval o clustering.
- Entrada multimodal geometrica: acepta coordenadas (`pos`), color RGB (`color`) y coordenadas normalizadas (`norm_pos`), combinadas en 4 canales efectivos.
- Procesamiento de nubes de gran tamano: el pipeline incluye muestreo y `collate` para agrupar puntos en lotes, con ejemplo funcional de 8192 puntos.
- Ajuste fino: al ser un backbone de PyTorch con licencia MIT, se puede reentrenar la cabeza para un numero distinto de clases o para otro dataset de interior.
- No dispone de generacion de texto, codigo, matematicas, vision 2D, audio, tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje ni un modelo fundacional multimodal.

## Casos de uso

- Digital twin de edificios: procesar escaneos de interiores para etiquetar suelo, pared, techo y mobiliario, y volcar el resultado a un gemelo digital o a un modelo BIM con capas separadas por clase.
- Robotica de asistencia en interiores: dotar a un robot movil de un modulo de segmentacion que distinga superficie transitable (suelo) de obstaculos (mesa, silla, sofa) a partir de la nube de puntos de su sensor.
- Preetiquetado y anotacion asistida: generar etiquetas iniciales sobre nubes nuevas para que un equipo humano solo revise correcciones, reduciendo el coste de construir datasets propios de interior.
- Analisis de inventario de espacios: contar y localizar sillas, mesas, tableros o libros en aulas y oficinas para estudios de ocupacion o facilities management.
- Renderizado y AR/VR con semantica: usar las etiquetas por punto para recolorear, ocultar o sustituir materiales por clase en visualizaciones interactivas de escenas escaneadas.
- Busqueda y recuperacion 3D: extraer embeddings de 64 dimensiones por punto o por region y construir indices vectoriales para buscar objetos o zonas similares en una base de escaneos.
- Baseline de investigacion: punto de partida reproducible para comparar tecnicas de segmentacion en S3DIS sin reimplementar el pipeline de entrenamiento original.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| S3DIS (Area 3) | Segmentacion semantica de nubes de puntos | mIoU | 84,95 | No |
| S3DIS (Area 3) | Segmentacion semantica de nubes de puntos | OA (accuracy) | 93,72 | No |

No se han publicado en la informacion disponible resultados comparativos con otros modelos, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM de pesos: aproximadamente 167 MB en fp32 (41,7 M de parametros) y unos 83 MB en fp16, sin contar activaciones.
- VRAM de inferencia estimada: del orden de 1-2 GB con lotes pequenos y nubes de 8192 puntos, incluyendo activaciones y buffers de agrupacion (estimacion propia; la model card no publica cifras).
- VRAM de ajuste fino estimada: 8-16 GB para lotes moderados, dependiendo del numero de puntos por muestra y del uso de precision mixta (estimacion propia).
- GPU: cabe holgadamente en GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090; para entrenamiento a escala o lotes grandes son preferibles A100 o H100.
- Despliegue: la via soportada es PyTorch con la libreria `torch-pointcloud` (`pip install torch-pointcloud`). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo) ni sobre exportacion a ONNX o TorchScript.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnext-xl.s3dis-area3.openpoints | 41,6 M | Nube de puntos, 4 canales; 8192 puntos en el ejemplo | S3DIS Area 3 | MIT | HuggingFace, pesos safetensors |
| PointNeXt original (guochengqian/PointNeXt) | No disponible en la informacion | Nube de puntos | S3DIS y otros | MIT | Repositorio GitHub, checkpoints PyTorch |
| PointNet++ | No disponible en la informacion | Nube de puntos | S3DIS y otros | No disponible en la informacion | Implementaciones de investigacion |
| Otras familias (Point Transformer, MinkowskiNet, SPVCNN) | No disponible en la informacion | Nube de puntos | S3DIS y otros | No disponible en la informacion | Repositorios de investigacion |

No se dispone de valores de mIoU u OA de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especializado en interiores: entrenado sobre S3DIS, con 13 clases de habitaciones; no cubre exteriores, LiDAR urbano, vehiculos ni vegetacion.
- Las metricas declaradas (mIoU 84,95, OA 93,72) estan marcadas como no verificadas en el `model-index`; conviene reproducirlas antes de usarlas como referencia.
- La model card no especifica el split exacto de entrenamiento ni el protocolo de evaluacion (por ejemplo, si Area 3 se excluyo del entrenamiento y con que criterio), lo que limita la comparabilidad con la literatura.
- Rendimiento en dominios distintos: la precision caera con sensores, densidades o iluminacion diferentes a las de S3DIS; se recomienda ajuste fino o validacion propia.
- Requiere color RGB como canal de entrada; con nubes puramente geometricas (LiDAR sin color) hay que adaptar la entrada.
- Riesgo de confusion entre clases visualmente proximas (silla frente a sofa, tablero frente a pared) y de fronteras imprecisas en objetos con oclusiones.
- No hay informacion sobre sesgos demograficos o geograficos; al operar sobre escenas fisicas, los sesgos relevantes son de composicion del dataset (tipologia de aulas y oficinas estadounidenses).
- Licencia MIT: permite uso comercial y modificacion, pero se debe conservar el aviso de copyright y citar los trabajos originales (PointNeXt y S3DIS) segun buenas practicas academicas.
- Sin garantias de soporte: el repositorio tiene 0 descargas y 0 likes, por lo que el mantenimiento y la comunidad son inexistentes a fecha de la informacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnext-xl.s3dis-area3.openpoints
- Paper de PointNeXt (arXiv 2206.04670): https://arxiv.org/abs/2206.04670
- Repositorio original de PointNeXt: https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Paper de S3DIS: Armeni et al., "3D Semantic Parsing of Large-Scale Indoor Spaces", CVPR 2016 (referenciado en la model card; no se proporciona URL directa)
- PyTorch: https://pytorch.org/
