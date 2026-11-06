# torch-pointcloud/litept-small.scannet20.prs-eth

## Resumen

LitePT (litept-small.scannet20.prs-eth) es un modelo de segmentacion semantica de nubes de puntos 3D desarrollado por el grupo de investigacion prs-eth (ETH Zúrich) y convertido al ecosistema `torch-pointcloud` por el autor del repositorio. Resuelve la tarea de asignar una clase semantica a cada punto de una escena 3D, en este caso concreto sobre las 20 clases de interiores de ScanNet. El checkpoint contiene 12,7 millones de parametros, una cifra muy reducida para una tarea de segmentacion densa, lo que lo situa en la categoria de modelos ligeros desplegables en hardware modesto.

La arquitectura LitePT combina convoluciones en las etapas iniciales con atencion con embedding rotacional 3D en las etapas finales, una hibridacion pensada para reducir coste computacional sin perder capacidad de modelado global. El modelo consume nubes de puntos con 6 canales de entrada (coordenadas, color y normales) y produce logits por punto sobre 20 clases. Es relevante ahora porque demuestra que es posible obtener resultados competitivos en segmentacion 3D con una huella de parametros inferior a 13 millones, lo que facilita su integracion en pipelines de robotica, escaneo movil o realidad aumentada donde el presupuesto de computo es limitado.

El checkpoint esta publicado bajo licencia MIT, en formato safetensors y con un tamano de repositorio de 0,1 GB. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto conversacional, por lo que las secciones de capacidades y casos de uso deben interpretarse exclusivamente en el ambito de vision 3D y segmentacion de escenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LitePT (hibrida: convoluciones en etapas iniciales y atencion con embedding rotacional 3D en etapas finales) |
| Parametros totales | 12.718.592 (12,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de vision 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `torch-pointcloud`) |

Datos adicionales declarados en la model card: canales de entrada 6, clases de salida 20, dimension de caracteristicas 72, dataset de entrenamiento ScanNet (20 clases), tamano de repositorio 0,1 GB.

## Arquitectura y entrenamiento

LitePT es un transformer de nubes de puntos con diseno hibrido. Las primeras etapas emplean operadores convolucionales sobre puntos (con dependencia de `spconv` para convoluciones dispersas), mientras que las etapas tardias aplican atencion con embedding rotacional 3D, lo que permite modelar relaciones globales entre puntos sin el coste cuadratico completo en todas las capas. La configuracion "small" de este checkpoint usa 72 dimensiones de caracteristicas y 12,7 M de parametros, con entrada de 6 canales (posicion, color y normal por punto) y salida de 20 logits por punto.

El entrenamiento se realiza sobre ScanNet en su version de 20 clases, el benchmark de referencia para segmentacion semantica de interiores. La model card no detalla el numero de tokens o puntos vistos durante el entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de refinamiento posteriores; esa informacion no esta disponible en la documentacion proporcionada. La innovacion tecnica destacable es la combinacion de convoluciones locales tempranas con atencion rotacional 3D tardia, que reduce el numero de parametros manteniendo capacidad de agregacion global. El modelo se distribuye a traves de la libreria `torch-pointcloud`, que requiere `spconv` y `flash-attn` compilados contra la version de PyTorch y CUDA del entorno, y los kernels de inferencia son exclusivos de GPU.

## Capacidades

- Segmentacion semantica densa de nubes de puntos 3D sobre 20 clases de interiores (ScanNet).
- Procesamiento de nubes de puntos con 6 canales de entrada: coordenadas XYZ, color RGB y normales.
- Extraccion de caracteristicas por punto mediante `forward_features`, con salida de 72 dimensiones utilizables para tareas posteriores (clasificacion, retrieval, clustering).
- Reutilizacion como backbone: `reset_classifier(num_classes=0)` permite obtener embeddings por punto para modelos downstream.
- Procesamiento por lotes mediante la funcion `collate` de la libreria, con soporte de multiples nubes en una misma inferencia.
- Inferencia exclusiva en GPU (kernels dependientes de CUDA).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision 2D, audio ni modo thinking.

## Casos de uso

- Segmentacion de escenas de interior para robotica movil: el modelo clasifica cada punto de una nube captada por LiDAR o RGB-D en una de las 20 clases de ScanNet (suelo, pared, mesa, silla, etc.), lo que permite construir mapas semanticos para navegacion y planificacion.
- Reconstruccion 3D aumentada semanticamente: tras un escaneo con fotogrametria o SLAM, se aplica el modelo a la nube fusionada para etiquetar cada punto y generar mallas o visores con capas semanticas.
- Realidad aumentada en interiores: con 12,7 M de parametros y salida por punto, el modelo puede ejecutarse en un servidor cercano al dispositivo para anclar objetos virtuales sobre superficies identificadas (suelo, mesa, pared) en escenas domesticas.
- Preprocesado para inventario de espacios: en aplicaciones de facility management o escaneo de viviendas, el modelo separa clases como muebles, sanitarios o elementos estructurales para alimentar un inventario automatico.
- Etiquetado asistido de datasets 3D: el modelo sirve como anotador automatico de nubes de puntos nuevas, generando etiquetas por punto que un humano revisa, con un coste de GPU muy bajo gracias al tamano reducido del checkpoint.
- Backbone para aprendizaje por transferencia: las caracteristicas de 72 dimensiones por punto pueden congelarse y usarse para entrenar clasificadores ligeros de escena o tareas de deteccion de objetos 3D con pocos datos.
- Control de calidad en escaneos de obra: comparar la segmentacion semantica de dos capturas temporales para detectar cambios de estructura o presencia de elementos no previstos en el modelo de clases.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente, campo `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanNet (20 clases) | Segmentacion de nubes de puntos | mIoU | 76,54 |
| ScanNet (20 clases) | Segmentacion de nubes de puntos | OA (accuracy overall) | 91,42 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks ni comparaciones con otros modelos de segmentacion 3D.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 12,7 M de parametros y 72 caracteristicas, el peso del modelo en FP32 ronda los 50 MB, por lo que el consumo dominante proviene de las estructuras dispersas de `spconv` y de la atencion con `flash-attn`, no de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con `spconv` y `flash-attn`; no se especifican modelos concretos en la documentacion.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU NVIDIA moderna con suficiente memoria para la nube de puntos de entrada (8192 puntos en el ejemplo de la model card), aunque no se publican cifras exactas de memoria por configuracion.
- Opciones de despliegue: la libreria oficial `torch-pointcloud` con PyTorch, `spconv` y `flash-attn`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision 3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos de segmentacion de nubes de puntos comparables (por ejemplo, PointNet++, Point Transformer o variantes de LitePT de mayor tamano) con metricas, licencia y contexto verificables. Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litept-small.scannet20.prs-eth | 12,7 M | ScanNet (20 clases) | 76,54 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ScanNet (20 clases de interiores); su rendimiento fuera de escenas domesticas o de oficina (exteriores, industria, conduccion) no esta caracterizado.
- Sin datos sobre sesgos: la model card no documenta sesgos conocidos ni analisis de equidad; al tratarse de un dataset de interiores, puede presentar desequilibrios por clase y geografia de captura.
- Riesgo de alucinacion semantica: como todo modelo de segmentacion, puede asignar clases incorrectas en regiones ambiguas u oclusiones; no se publican tasas de error por clase.
- Limitaciones de idioma: no aplica, el modelo no procesa lenguaje.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificacion con atribucion; el modelo derivado de `prs-eth/LitePT` (MIT) y el dataset ScanNet tienen sus propias condiciones que deben respetarse.
- Dependencias de compilacion: requiere `spconv` y `flash-attn` compilados contra la version exacta de PyTorch y CUDA; un desajuste de versiones impide la carga del modelo.
- Solo GPU: los kernels de inferencia son exclusivos de CUDA, por lo que no es desplegable en CPU sin adaptaciones.
- Metricas no verificadas: los valores de mIoU y OA provienen de la model card y estan marcados como no verificados.
- Modelo sin pipeline declarado en Hugging Face y con muy pocas descargas (20), lo que sugiere escasa validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/litept-small.scannet20.prs-eth
- Paper LitePT: https://arxiv.org/abs/2512.13689
- Repositorio original prs-eth/LitePT: https://github.com/prs-eth/LitePT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet: https://github.com/ScanNet/ScanNet (referenciado en la citacion de la model card)
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
