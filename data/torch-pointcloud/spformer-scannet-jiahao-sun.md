# torch-pointcloud/spformer.scannet.jiahao-sun

## Resumen

SPFormer es un modelo de segmentación de instancias sobre nubes de puntos 3D, desarrollado originalmente por Jiahao Sun, Chunmei Qing, Junpeng Tan y Xiangmin Xu y publicado en AAAI 2023 bajo el título "Superpoint Transformer for 3D Scene Instance Segmentation". Esta ficha corresponde a la conversión del checkpoint original al ecosistema `torch-pointcloud`, mantenida por el usuario `torch-pointcloud`, que empaqueta los pesos en formato safetensors y expone una API de carga unificada mediante `tp.create_model()`.

El modelo resuelve la tarea de segmentación de instancias en escenas 3D de interior: dado un conjunto de puntos con coordenadas, color y agrupación en superpuntos, predice máscaras de instancia, etiquetas semánticas y puntuaciones de confianza para 18 clases de objetos. Su arquitectura es un transformer sobre superpuntos que agrupa la nube en regiones locales y aplica atención entre ellas, lo que reduce el coste computacional frente a operar punto a punto.

Con 17,6 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto y especializado, no un modelo de lenguaje. Su relevancia actual reside en que ofrece un checkpoint reproducible y fácil de integrar en pipelines de visión 3D mediante `torch-pointcloud`, con licencia MIT y métricas declaradas sobre el conjunto de validación de ScanNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre superpuntos (SPFormer, superpoint transformer) |
| Parametros totales | 17.609.428 (17,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de nube de puntos (ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de visión 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (coordenadas xyz + color RGB) |
| Clases | 18 |
| Dimension de features | 32 canales por superpunto |
| Dataset de entrenamiento | ScanNet |
| Libreria | torch-pointcloud (requiere spconv) |

## Arquitectura y entrenamiento

SPFormer es un transformer que opera sobre superpuntos en lugar de sobre puntos individuales. La nube de puntos se agrupa previamente en superpuntos (el ejemplo de la model card usa 64 superpuntos para 8192 puntos), y el modelo extrae características por superpunto mediante `forward_features`, devolviendo 32 canales por superpunto. Sobre esas representaciones aplica mecanismos de atención para capturar relaciones entre regiones de la escena y, a continuación, un cabezal de decodificación que produce máscaras de instancia, etiquetas y puntuaciones mediante `model.decode(out)`.

La entrada tiene 6 canales (posición xyz y color RGB) y el modelo predice 18 clases de objetos de interior, coherentes con la taxonomía de ScanNet. El entrenamiento se realizó sobre ScanNet, el conocido dataset de reconstrucciones 3D de interiores anotadas (Dai et al., CVPR 2017). La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO; esa información no está disponible en la documentación proporcionada. La innovación principal es el uso de superpuntos como unidad de atención, que reduce el número de tokens efectivos frente a enfoques densos punto a punto.

## Capacidades

- Segmentación de instancias 3D en escenas de interior: genera máscaras de instancia (`mask_index`), etiquetas semánticas, puntuaciones y el índice de batch correspondiente.
- Clasificación semántica de 18 clases de objetos sobre nubes de puntos de ScanNet.
- Extracción de características por superpunto (`forward_features`), con 32 canales por superpunto, reutilizables para tareas posteriores.
- Procesamiento por lotes: la API acepta `batch` y `batch_inverse`, lo que permite agrupar varias nubes en una sola inferencia.
- Entrada multimodal de geometría y color: 6 canales (xyz + RGB).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni thinking mode; es un modelo puramente de visión 3D.
- No tiene capacidades multilingües por tratarse de un modelo no lingüístico.

## Casos de uso

- Segmentación de escenas de interior para robótica móvil: el modelo identifica instancias de objetos (mesas, sillas, paredes) a partir de nubes de puntos captadas por LiDAR o RGB-D, permitiendo a un robot construir un mapa semántico de su entorno.
- Anotación asistida de datasets 3D: dado que produce máscaras de instancia con puntuaciones, puede usarse como preanotador para acelerar el etiquetado manual de nuevas nubes de puntos, filtrando por umbral de confianza.
- Reconstrucción y modelado BIM: la segmentación por instancias facilita separar elementos de una habitación escaneada y exportarlos como objetos individuales para herramientas de modelado.
- Realidad aumentada y virtual: la detección de instancias permite anclar objetos virtuales sobre elementos físicos concretos (por ejemplo, colocar contenido sobre una mesa identificada) en escenas captadas en tiempo real.
- Análisis de interiores para inmobiliaria o facility management: inventariado automático de mobiliario y elementos estructurales a partir de escaneos 3D de viviendas u oficinas.
- Preprocesado para pipelines de percepción: la extracción de features por superpunto puede alimentar etapas posteriores de clasificación, detección o planificación de trayectorias.
- Investigación en visión 3D: como baseline reproducible con licencia MIT para comparar métodos de segmentación de instancias sobre ScanNet.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`) sobre el dataset ScanNet para la tarea `point-cloud-instance-segmentation`:

| Metrica | Valor |
|---|---|
| mAP | 56,47 |
| mAP@0.5 | 73,93 |
| mAP@0.25 | 82,55 |

No se han publicado en la información disponible resultados comparativos adicionales con otros modelos, ni desgloses por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 17,6 M de parámetros y pesos safetensors, el modelo es muy ligero, aunque el consumo real depende del número de puntos y superpuntos procesados y de las estructuras intermedias de spconv.
- GPU recomendadas: no especificadas en la model card. El ejemplo de uso fuerza `.cuda()` y advierte de que los kernels son "GPU-only", por lo que se requiere una GPU NVIDIA compatible con spconv.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no hay cifras oficiales de memoria; la limitación principal será la compilación de spconv contra la versión de PyTorch y CUDA instalada.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) junto con `spconv`. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de modelos alternativos de segmentación de instancias 3D (por ejemplo, variantes de PointGroup, SoftGroup o Mask3D) que permitan una comparación rigurosa. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spformer.scannet.jiahao-sun | 17,6 M | no aplica | mAP 56,47 / mAP@0.5 73,93 / mAP@0.25 82,55 | MIT | HuggingFace (torch-pointcloud) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización de dominio: entrenado exclusivamente en ScanNet, por lo que su rendimiento fuera de escenas de interior con características similares (sensores, densidad, iluminación) puede degradarse notablemente.
- Taxonomía cerrada de 18 clases: no detecta objetos fuera de esas categorías.
- Dependencia de superpuntos: el pipeline requiere una agrupación previa en superpuntos; la calidad de esa agrupación condiciona directamente el resultado.
- Dependencia de spconv: la instalación exige compilar spconv contra la versión concreta de PyTorch y CUDA, lo que añade fricción en entornos de producción.
- Solo GPU: los kernels son GPU-only según la model card; no hay ruta documentada de inferencia en CPU.
- Métricas no verificadas: los valores de mAP están marcados como `verified: false` y provienen del propio autor.
- Riesgo de alucinación: como todo modelo de segmentación, puede generar instancias espurias o fusionar objetos próximos; las puntuaciones de confianza deben usarse para filtrar.
- Sesgos: no documentados en la información disponible; al derivarse de ScanNet, hereda los sesgos de captura y anotación de ese dataset (entornos y geografías concretas).
- Licencia MIT: permisiva para uso comercial, pero conviene revisar también las licencias de spconv y de `torch-pointcloud` en el despliegue final.
- Modelo de bajo uso: 20 descargas y 0 likes en el momento de la consulta, con soporte comunitario limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/spformer.scannet.jiahao-sun
- Paper (arXiv): https://arxiv.org/abs/2211.15766
- Repositorio original SPFormer: https://github.com/sunjiahao1999/SPFormer
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet (referencia en la cita): Dai et al., CVPR 2017
