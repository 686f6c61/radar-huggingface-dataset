# torch-pointcloud/pointrcnn.kitti.openpcdet

## Resumen

PointRCNN es un detector de objetos 3D sobre nubes de puntos LiDAR, publicado originalmente por Shaoshuai Shi, Xiaogang Wang y Hongsheng Li en CVPR 2019 (arXiv:1812.04244). Este repositorio concreto, `torch-pointcloud/pointrcnn.kitti.openpcdet`, es una conversión de los pesos oficiales de OpenPCDet al formato safetensors para la librería `torch-pointcloud` de Arthur Dujardin. El modelo resuelve la detección de coches, peatones y ciclistas en escenas de tráfico a partir de nubes de puntos de 4 canales (x, y, z e intensidad), sin utilizar imágenes de cámara.

La arquitectura es de dos etapas y puramente basada en puntos: una primera etapa segmenta el fondo y genera propuestas 3D a partir de los puntos crudos, y una segunda etapa refina cada propuesta con características aprendidas dentro de la región. Con 4,06 millones de parámetros y 128 canales de características, es un modelo muy compacto en comparación con los detectores multimodales actuales, lo que lo hace interesante como referencia académica, como base para prototipos de percepción LiDAR y como punto de partida para *fine-tuning* sobre dominios propios.

Su relevancia hoy es doble: por un lado, es una implementación de referencia limpia y con licencia Apache-2.0 de un método clásico del estado del arte en KITTI; por otro, el formato safetensors y la integración con `torch-pointcloud` (`tp.create_model(..., pretrained=True)`) eliminan la fricción habitual de instalar OpenPCDet y sus dependencias de compilación. Conviene señalar que el repositorio no tiene descargas ni *likes* y que las métricas declaradas están marcadas como no verificadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointRCNN: detector 3D de dos etapas, basado en puntos (segmentación de primer plano y refinamiento de propuestas) |
| Parametros totales | 4.060.531 (4,0 M según la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: nube de puntos LiDAR, no secuencias de texto) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors, presumiblemente FP32 (no confirmado) |
| Idiomas soportados | no aplica / no disponible (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de tarea | object-detection (detección de objetos 3D) |
| Dataset de entrenamiento | KITTI |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases | 3 (Car, Pedestrian, Cyclist) |
| Dimension de caracteristicas | 128 |
| Libreria | torch-pointcloud |
| Parametros de la model card | Params (M) 4.0; input channels 4; classes 3; features 128 |
| Tamano del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-08-28 / 2026-10-20 |

## Arquitectura y entrenamiento

PointRCNN afronta la detección 3D en dos etapas, ambas operando directamente sobre la nube de puntos en lugar de sobre vóxeles o proyecciones BEV. En la primera etapa, una red de extracción tipo PointNet++ con capas de *set abstraction* codifica cada punto en un espacio de 128 características y clasifica cada punto como primer plano o fondo, generando propuestas 3D mediante agrupación de puntos de primer plano en *bins* discretizados. En la segunda etapa, cada propuesta se procesa con *point pooling* de las características dentro de la región y una cabeza de refinamiento que ajusta la caja y la puntuación de confianza. Este diseño evita la pérdida de información geométrica que introducen las cuantizaciones en vóxeles y aprovecha la estructura fina de la escena.

Respecto al entrenamiento, la información disponible solo confirma el dataset (KITTI) y no detalla el número de tokens ni de iteraciones, la composición exacta del conjunto, ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). El modelo se distribuye como conversión de los pesos de OpenPCDet, por lo que el entrenamiento subyacente es el descrito en el paper original de 2019 y en la configuración de OpenPCDet, no un reentrenamiento propio del autor de la conversión. No se documentan innovaciones adicionales en la model card más allá del empaquetado en safetensors y de la API de extracción de características (`forward_features`, 128 canales).

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR con cajas orientadas (centro, dimensiones y ángulo de guiñada, según el formato estándar de KITTI; el formato exacto de salida no está documentado en la información disponible).
- Clasificación en tres clases: coche, peatón y ciclista.
- Segmentación de primer plano por punto como subproducto de la primera etapa.
- Generación de propuestas 3D y refinamiento posterior de las mismas (razonamiento en dos etapas sobre la misma nube).
- Extracción de características por punto de 128 dimensiones mediante `forward_features`, reutilizable para tareas posteriores (clasificación de puntos, segmentación semántica, *clustering*).
- Procesamiento por lotes mediante `collate` y gestión de índices de lote (`batch`), lo que permite inferencia *batched* sobre varias nubes.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso simbólico ni modo *thinking*.
- No dispone de capacidades multilingües, de visión 2D, de audio ni de generación de texto.
- No se documenta soporte de fusión con cámara ni de entrada RGB.

## Casos de uso

- Percepción en prototipos de conducción autónoma: el modelo consume directamente la nube LiDAR de 4 canales y devuelve cajas 3D de coches, peatones y ciclistas, lo que permite alimentar módulos de predicción de trayectorias y planificación en un *stack* académico o de validación, especialmente en configuraciones KITTI-like con Velodyne HDL-64E.
- Robótica móvil y AGV en exteriores: con solo 4 M de parámetros y pesos de decenas de megabytes, se puede ejecutar en el ordenador de a bordo de una plataforma robótica para detección de obstáculos dinámicos, dejando margen de cómputo para el resto del *pipeline*.
- Anotación asistida de datos LiDAR: usar las propuestas del modelo como preanotaciones en herramientas de etiquetado reduce el coste de construir un dataset propio de coches, peatones y ciclistas, que después se corrige manualmente.
- *Fine-tuning* sobre dominios propios: al ser una implementación de referencia con licencia Apache-2.0 y pesos en safetensors, sirve como inicialización para reentrenar sobre LiDAR de otra marca, otro montaje o densidad de puntos distinta, partiendo de características ya aprendidas.
- Análisis de tráfico y aforo en infraestructura urbana: instalado sobre LiDAR fijos en cruces o túneles, permite contar y clasificar viandantes, bicicletas y vehículos sin capturar imágenes identificables de personas, lo que simplifica el cumplimiento de privacidad.
- Evaluación y *benchmarking* reproducible: sirve como línea base de referencia en experimentos que comparan detectores 3D, con la ventaja de que la carga del modelo es una sola llamada `tp.create_model` y no requiere compilar OpenPCDet.
- Docencia e investigación en aprendizaje profundo sobre nubes de puntos: el par `forward` / `forward_features` permite ilustrar arquitecturas *point-based*, *set abstraction* y *point pooling* con un modelo entrenado y de tamaño manejable.

## Benchmarks y rendimiento

Resultados declarados por el autor en el *model-index* de la model card, sobre el dataset KITTI. Todos los valores están marcados con `verified: false`, es decir, no han sido validados de forma independiente. La model card no especifica el *split* de dificultad (fácil, moderado o difícil) ni el umbral de IoU empleado, por lo que los números no son directamente comparables con otras publicaciones sin esa información.

| Metrica | Valor | Verificado |
|---|---|---|
| mAP (KITTI, deteccion 3D) | 69,29 | No |
| AP / Car | 78,67 | No |
| AP / Pedestrian | 56,94 | No |
| AP / Cyclist | 72,27 | No |

No se han publicado en la información disponible otros resultados (tiempo de inferencia, *throughput*, métricas BEV, resultados por dificultad) ni comparaciones oficiales con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmética, 4.060.531 parámetros en FP32 ocupan aproximadamente 16 MB de pesos; el consumo real lo dominan las activaciones de las capas *set abstraction* sobre la nube de puntos. Para 8.192 puntos (el ejemplo de la model card) es razonable esperar un uso de VRAM en el rango de cientos de MB a 1-2 GB, aunque esta cifra es una estimación y no un dato verificado.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU con soporte CUDA y al menos 4 GB de VRAM debería poder ejecutar el modelo; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son opciones válidas, siendo las de gama alta útiles solo para aumentar el tamaño de lote o el número de puntos por muestra.
- ¿Cabe en GPU de consumo? Sí, con alta probabilidad, dado el reducido número de parámetros; conviene validar el consumo real con el tamaño de nube objetivo, ya que el coste escala con el número de puntos de entrada.
- Ejecución en CPU: factible en teoría al ser un modelo pequeño, pero no hay datos de latencia publicados; para nubes de decenas de miles de puntos el rendimiento en CPU puede ser insuficiente para aplicaciones en tiempo real.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) con PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un detector 3D. Alternativas no verificadas en esta ficha: exportación a ONNX o TorchScript para servir con Triton u ONNX Runtime.
- Latencia y *throughput*: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de métricas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a características estructurales y de disponibilidad. Todos los modelos citados forman parte del ecosistema OpenPCDet y comparten el mismo dataset de referencia (KITTI).

| Modelo | Enfoque | Etapas | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pointrcnn.kitti.openpcdet (este) | Point-based, puntos crudos | 2 | 4,06 M | no aplica | Apache-2.0 | Pesos en safetensors en HuggingFace |
| PointPillars | Pillars (proyección vertical) | 1 | no disponible | no aplica | Apache-2.0 (OpenPCDet) | Configuración en OpenPCDet; pesos convertidos no confirmados |
| SECOND | Vóxeles dispersos 3D | 1 | no disponible | no aplica | Apache-2.0 (OpenPCDet) | Configuración en OpenPCDet; pesos convertidos no confirmados |
| PV-RCNN | Híbrido vóxel + puntos | 2 | no disponible | no aplica | Apache-2.0 (OpenPCDet) | Configuración en OpenPCDet; pesos convertidos no confirmados |

Diferencias cualitativas esperables: PointPillars y SECOND son de una sola etapa y suelen priorizar velocidad de inferencia, mientras que PointRCNN y PV-RCNN son de dos etapas y priorizan precisión en la localización. Los valores de mAP de los modelos alternativos no están disponibles en esta ficha y no deben asumirse; consúltese el *benchmark* oficial de KITTI o el repositorio de OpenPCDet para cifras verificadas.

## Limitaciones y advertencias

- Dominio restringido: el modelo está entrenado sobre KITTI, con sensores y calibraciones específicos (entorno urbano y de carretera alemana). El rendimiento fuera de ese dominio (otro LiDAR, otra densidad de puntos, escenas interiores, vehículos pesados) no está documentado y probablemente degrade.
- Solo tres clases: coche, peatón y ciclista. No detecta camiones, autobuses, motocicletas, señales, semáforos ni obstáculos genéricos, lo que lo hace insuficiente como sistema de percepción único en producción.
- Entrada limitada a LiDAR de 4 canales (x, y, z, intensidad). No acepta imágenes ni realiza fusión multimodal, por lo que no cubre casos en los que la cámara es necesaria (semáforos, señalización, texto).
- Métricas no verificadas: los valores del *model-index* están marcados como `verified: false` y no se indica *split* de dificultad ni IoU, lo que impide una comparación rigurosa con la literatura.
- Riesgo de falsos positivos y negativos en objetos pequeños, oclusiones y escenas muy densas; como todo detector de una sola pasada, no incorpora verificación temporal entre fotogramas ni seguimiento.
- Sesgos potenciales derivados del dataset: sobrerrepresentación de escenas diurnas y urbanas europeas, y posibles sesgos en la detección de peatones según altura, postura o contexto; no hay análisis de sesgo publicado en la información disponible.
- Madurez del repositorio: 0 descargas, 0 *likes* y tamaño de repositorio de 0,0 GB. Conviene verificar que los pesos están efectivamente incluidos y que la conversión reproduce las cifras declaradas antes de usarlo en un *pipeline*.
- Licencia: los pesos y el código se declaran Apache-2.0, lo que permite uso comercial con atribución. Sin embargo, el modelo deriva de OpenPCDet (Apache-2.0) y se ha entrenado con KITTI, cuyos términos de uso del dataset son independientes y pueden imponer restricciones; la situación legal de los pesos derivados no se aclara en la información disponible. Verificar antes de un despliegue comercial.
- Sin soporte de texto ni idiomas: no es apto para tareas de generación, razonamiento simbólico ni atención al cliente, pese a que la estructura de ficha habitual pueda sugerirlo.
- No se documentan requisitos de preprocesado más allá del transformador devuelto en `info["transform"]`; usos con nubes sin calibrar o con ejes distintos a KITTI pueden producir resultados silenciosamente incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointrcnn.kitti.openpcdet
- Paper PointRCNN (arXiv:1812.04244): https://arxiv.org/abs/1812.04244
- Repositorio OpenPCDet (origen de la conversión): https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
- PyTorch (dependencia de ejecución): https://pytorch.org/
- PyPI de torch: https://pypi.org/project/torch/

Nota: los resultados de la búsqueda web realizada devuelven únicamente páginas genéricas sobre PyTorch (pytorch.org, Wikipedia, PyPI, Clubic) y no aportan información específica sobre este modelo, su entrenamiento o sus resultados.
