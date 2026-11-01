# torch-pointcloud/groupfree3d-l12-o256.scannet.ze-liu

## Resumen

Group-Free 3D es un detector de objetos 3D para nubes de puntos desarrollado originalmente por Ze Liu, Zheng Zhang, Yue Cao, Han Hu y Xin Tong (Microsoft Research Asia) y publicado en ICCV 2021. Este checkpoint concreto, `groupfree3d-l12-o256.scannet.ze-liu`, es una conversión del repositorio original `zeliu98/Group-Free-3D` al formato de la librería `torch-pointcloud` de Arthur Dujardin, publicada bajo licencia MIT. El modelo resuelve la detección de instancias 3D en escenas interiores, prediciendo cajas 3D y clases sobre nubes de puntos anotadas.

La innovación principal del trabajo original es sustituir los mecanismos clásicos de agrupación de candidatos (como *voting* o *clustering*) por un decoder transformer que razona directamente sobre las relaciones entre puntos y candidatos objeto, eliminando la dependencia de heurísticas de agrupación. El checkpoint tiene 27,8 millones de parámetros, 288 canales de características y está entrenado sobre el dataset ScanNet con 18 clases semánticas.

Es relevante ahora porque ofrece un punto de partida reproducible y ligero para tareas de percepción 3D en robótica, realidad aumentada y digitalización de interiores, con pesos en `safetensors` y una API directa a través de `torch-pointcloud`. No es un modelo de lenguaje: no procesa texto ni imágenes 2D, y sus "idiomas soportados" no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Group-Free 3D: backbone de extracción de puntos + decoder transformer sobre candidatos objeto (KPS a 256 candidatos) |
| Parametros totales | 27.804.033 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (nube de puntos; el ejemplo de la model card usa 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión nativa; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de visión 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Group-Free 3D: un backbone de extracción de características por punto (288 canales) seguido de un decoder transformer que procesa un conjunto de 256 candidatos objeto (configuración `o256`) con 12 capas (`l12`) y predicción de cajas 3D y clases. A diferencia de enfoques basados en *Hough voting* o agrupación geométrica, el transformer aprende las relaciones entre puntos y candidatos de forma *group-free*, es decir, sin agrupar explícitamente instancias antes de la predicción. La cabeza produce cajas 3D con orientación y clase para 18 categorías de ScanNet.

El entrenamiento se realizó sobre ScanNet, el dataset de reconstrucciones interiores con anotaciones densas de Dai et al. (CVPR 2017). La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de refinamiento adicionales más allá de lo descrito en el paper original. La conversión a `torch-pointcloud` mantiene la arquitectura y los pesos del repositorio oficial; no se documentan cambios en el proceso de entrenamiento respecto al original.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores (cajas 3D con clase y orientación).
- Clasificación en 18 clases semánticas de ScanNet (muebles, sanitarios, electrodomésticos, elementos estructurales, etc.).
- Extracción de características por punto de 288 canales mediante `forward_features`.
- Procesamiento de nubes de puntos con posición, color y normales como entradas.
- Inferencia por lotes mediante `collate` de `torch-pointcloud`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo *thinking*.
- No procesa imágenes 2D, audio ni vídeo.

## Casos de uso

- Digitalización de interiores y modelado BIM: el modelo detecta muebles y elementos estructurales en nubes de puntos de escaneos de habitaciones, permitiendo generar inventarios semánticos automáticos de espacios.
- Robótica móvil indoor: un robot equipado con LiDAR o RGB-D puede usar el detector para localizar obstáculos y objetos manipulables (sillas, mesas, puertas) con cajas 3D orientadas, facilitando la planificación de navegación.
- Realidad aumentada y mixta: inserción de contenido virtual anclado a objetos reales detectados en la escena, aprovechando las cajas 3D y las clases semánticas para colocar etiquetas o sustituciones.
- Análisis de escenas para accesibilidad: identificación automática de elementos como rampas, baños adaptados o mobiliario para auditorías de espacios.
- Preprocesado para pipelines de reconstrucción: extracción de características de 288 canales por punto como entrada a modelos posteriores de segmentación, completado o *scene graph generation*.
- Investigación en percepción 3D: *baseline* reproducible para comparar nuevas arquitecturas de detección 3D sobre ScanNet con métricas mAP@0.25 y mAP@0.5.
- Prototipado rápido con `torch-pointcloud`: integración en cuadernos de experimentación con una API de pocas líneas (`tp.create_model`, `info["transform"]`, `collate`).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| mAP@0.25 | ScanNet | 65,85 | No |
| mAP@0.5 | ScanNet | 49,45 | No |

No se han publicado en la información disponible otros resultados (mAP@0.5 con voto, precisión por clase, latencia) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 0,1 GB en `safetensors` (unos 111 MB en FP32 para 27,8 M de parámetros); con activaciones y una muestra de 8192 puntos, el consumo es del orden de 1-2 GB, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o nubes de puntos densas, una RTX 4090, A100 o H100 aceleran el *throughput*.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 en adelante).
- Opciones de despliegue: `torch-pointcloud` (PyTorch) es la vía documentada. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.25 (ScanNet) | mAP@0.5 (ScanNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| groupfree3d-l12-o256.scannet.ze-liu | 27,8 M | nube de puntos (8192 puntos en el ejemplo) | 65,85 | 49,45 | MIT | HuggingFace (`torch-pointcloud`) |
| Group-Free 3D original (`zeliu98/Group-Free-3D`) | no disponible en esta ficha | nube de puntos | no disponible | no disponible | MIT | GitHub |
| VoteNet | no disponible en esta ficha | nube de puntos | no disponible | no disponible | MIT (repo original) | GitHub |
| otros detectores 3D en `torch-pointcloud` | no disponible | nube de puntos | no disponible | no disponible | MIT | HuggingFace |

No se dispone de cifras verificadas de los modelos alternativos en la información proporcionada; la comparativa numérica queda pendiente de consulta directa a sus respectivas model cards.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ScanNet (escenas interiores), por lo que el rendimiento en exteriores, industria o escenas no vistas puede degradarse notablemente.
- 18 clases fijas: no detecta categorías fuera del vocabulario de ScanNet.
- Sensible a la calidad y densidad de la nube de puntos; el ejemplo de la model card usa 8192 puntos, y variaciones fuertes en el muestreo pueden afectar a las predicciones.
- Métricas no verificadas: los valores de mAP proceden de la model card y están marcados como `verified: false`.
- Riesgo de falsos positivos y cajas mal orientadas en escenas con oclusiones o mobiliario poco representado en el dataset.
- No es un modelo generativo: no produce texto ni justifica sus predicciones, lo que limita su auditabilidad en aplicaciones críticas.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales y a la conversión.
- Sin garantías de soporte: el repositorio tiene 18 descargas y 0 *likes*, lo que sugiere baja adopción y escaso mantenimiento comunitario.
- No se documentan sesgos demográficos (no procesa personas directamente), pero sí posibles sesgos de composición del dataset ScanNet hacia entornos domésticos y de oficina occidentales.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/groupfree3d-l12-o256.scannet.ze-liu
- Paper Group-Free 3D: https://arxiv.org/abs/2104.00678
- Repositorio original: https://github.com/zeliu98/Group-Free-3D
- Librería `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de `torch-pointcloud`: https://doi.org/10.5281/zenodo.22159632
- Paper ScanNet: https://arxiv.org/abs/1702.04405 (Dai et al., CVPR 2017)
