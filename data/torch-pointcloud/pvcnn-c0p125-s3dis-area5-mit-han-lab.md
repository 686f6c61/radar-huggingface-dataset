# torch-pointcloud/pvcnn-c0p125.s3dis-area5.mit-han-lab

## Resumen

`pvcnn-c0p125.s3dis-area5.mit-han-lab` es un modelo de segmentación semántica de nubes de puntos 3D, no un modelo de lenguaje. Implementa una PVCNN (Point-Voxel CNN), arquitectura presentada por Zhijian Liu, Haotian Tang, Yujun Lin y Song Han (MIT HAN Lab) en NeurIPS 2019, y ha sido convertido al formato de la librería `torch-pointcloud` de Arthur Dujardin desde el repositorio original `mit-han-lab/pvcnn`. Su tarea concreta es asignar una etiqueta semántica a cada punto de una escena, con 13 clases de interior (suelo, pared, techo, mesa, silla, puerta, etc.) y 9 canales de entrada.

El modelo está entrenado y evaluado sobre S3DIS (Stanford 2D-3D-S), en concreto con el protocolo de partición por áreas y evaluando en el Area 5. La variante `c0p125` es la de menor coste de la familia: la model card indica 184 dimensiones de característica, 13 clases y un recuento de parámetros que redondea a 0,0 M, mientras que el fichero safetensors declara 44.149 parámetros, un tamaño propio de un modelo de borde o de un backbone congelado para extracción de características.

Su relevancia es práctica más que de investigación: permite reproducir la línea base de PVCNN sobre S3DIS con una API de tres líneas (`tp.create_model`), en formato `safetensors` y con licencia MIT, lo que facilita integrarlo en pipelines de anotación, robótica indoor o digitalización de edificios. El contrapunto es que la ficha pública es mínima, no hay benchmarks verificados ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta) y la búsqueda web no ha devuelto documentación adicional relevante sobre esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN): rama de puntos (MLP) fusionada con rama voxel (convoluciones 3D), con fusión punto-voxel |
| Parametros totales | 44.149 (recuento del fichero safetensors; la model card indica «Params (M): 0,0») |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el ejemplo de uso procesa 8192 puntos por muestra |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan variantes FP16/INT8) |
| Idiomas soportados | no aplica (modelo 3D; la metadata de idiomas figura como no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (cargables con la librería `torch-pointcloud`) |
| Canales de entrada | 9 (posición, color en rango 0-255 y posición normalizada) |
| Clases de salida | 13 (segmentación semántica S3DIS) |
| Dimension de caracteristicas | 184 |
| Dataset de entrenamiento/evaluacion | S3DIS, evaluación en Area 5 |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

PVCNN sustituye la voxelización pura por un esquema en dos ramas: una rama de puntos que procesa cada punto de forma individual mediante capas totalmente conectadas (preserva la resolución fina y aporta detalle geométrico) y una rama voxel que agrega la nube en una rejilla 3D y aplica convoluciones 3D dispersas (aporta contexto espacial y localidad). Las salidas de ambas ramas se fusionan de forma intercalada en cada bloque, de manera que la representación combina precisión por punto y eficiencia computacional. El objetivo declarado del artículo es reducir el coste de memoria y mejorar la eficiencia frente a convoluciones volumétricas densas y frente a arquitecturas puramente basadas en puntos. La variante `c0p125` aplica un factor de escalado de canales de 0,125, lo que la sitúa en el extremo de mínimo cómputo de la familia.

No se dispone de información sobre el número de épocas, la composición exacta del dataset más allá de S3DIS Area 5, ni sobre el esquema de aumento de datos empleado en esta conversión concreta. Tampoco se documenta ningún proceso de alineación tipo RLHF/DPO, algo que no aplica a un modelo discriminativo de segmentación. El modelo se distribuye como conversión de los pesos publicados por MIT HAN Lab, por lo que sus cifras de rendimiento son las del entrenamiento original reportadas por el autor de la conversión, marcadas como no verificadas en el `model-index`. La información disponible no detalla si se empleó decodificación especulativa, atención lineal ni otras optimizaciones de inferencia, que en cualquier caso no son propias de este tipo de arquitectura.

## Capacidades

- Segmentación semántica por punto: devuelve logits por punto para 13 clases de interior sobre nubes de puntos de escenas S3DIS.
- Procesamiento de nubes con color: acepta posición (3), color RGB escalado 0-255 (3) y posición normalizada (3), es decir, 9 canales de entrada.
- Extracción de características: `model.forward_features(...)` devuelve un vector de 184 dimensiones por punto, utilizable como backbone congelado en tareas posteriores.
- Reducción de dimensionalidad del clasificador: `reset_classifier(num_classes=0)` permite obtener directamente el embedding sin cabeza de clasificación.
- Inferencia por lotes: la API `collate` agrupa varias muestras y devuelve índices de lote (`batch`), de modo que se pueden procesar varias nubes en una sola pasada.
- Ejecución en CPU o GPU sin requisitos especiales, al ser un modelo de tamaño muy reducido.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión 2D, audio ni capacidades multilingües: es un modelo puramente geométrico y discriminativo.

## Casos de uso

- Segmentación de escaneos de interiores para BIM y modelado as-built: el modelo etiqueta techo, suelo, pared, viga, columna, ventana, puerta y mobiliario punto a punto, lo que permite derivar planos y elementos constructivos a partir de un levantamiento láser o fotogramétrico.
- Robótica móvil indoor: identificar la clase suelo frente a obstáculos (mesas, sillas, paredes) para construir mapas de coste y planificar navegación en interiores con un modelo de menos de 0,2 MB en FP32, apto para ejecutarse a bordo en una Jetson o incluso en CPU.
- Pre-anotación asistida de datasets propios: usar las predicciones como propuesta inicial y corregir manualmente, reduciendo el coste de etiquetado de nubes de puntos nuevas antes de reentrenar.
- Inventario y gestión de activos: contar y localizar elementos de mobiliario (sillas, mesas, estanterías, pizarras) en plantas completas escaneadas, con salida por punto agregable por instancia o por sala.
- Realidad aumentada y VR: generar mallas semánticas de la habitación para oclusión y anclaje de contenido virtual, distinguiendo suelo y paredes del mobiliario.
- Gemelos digitales y mantenimiento: alimentar pipelines de inspección de instalaciones con etiquetas semánticas por punto que permitan calcular superficies, volúmenes o detectar elementos fuera de su clase esperada.
- Backbone para tareas downstream: extraer las características de 184 dimensiones por punto y entrenar encima un clasificador ligero de escena, un detector o un modelo de completado de forma, congelando la PVCNN.
- Evaluación comparativa de arquitecturas: servir como línea base reproducible de PVCNN con escalado de canales 0,125 frente a variantes mayores o a arquitecturas basadas en atención para experimentos académicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Ninguno está marcado como verificado (`verified: false`).

| Benchmark | Dataset / protocolo | Metrica | Valor |
|---|---|---|---|
| Segmentación semántica | S3DIS (Area 5) | mIoU | 49,25 |
| Segmentación semántica | S3DIS (Area 5) | OA (accuracy global) | 83,04 |
| Segmentación semántica | S3DIS (Area 5), variante «simple» | mIoU | 46,36 |
| Segmentación semántica | S3DIS (Area 5), variante «simple» | OA | 80,74 |

La información disponible no especifica qué protocolo de evaluación corresponde al prefijo `simple/` (probablemente una variante simplificada del pipeline de evaluación de la librería `torch-pointcloud`, sin que se detalle en la documentación). No se han publicado en la información disponible resultados de benchmarks adicionales ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM para pesos: mínima. Con 44.149 parámetros, los pesos ocupan del orden de 0,18 MB en FP32; el cuello de botella real es la memoria de activaciones y la rejilla de voxelización, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; una RTX 4090, A100 o H100 están sobredimensionadas para este modelo. Para lotes grandes de nubes densas o rejillas de voxel finas, una GPU de 16-24 GB permite aumentar el número de puntos por lote.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo (GTX 1060 en adelante) y en aceleradores de borde tipo Jetson Nano o Orin. También es viable la inferencia en CPU para volúmenes moderados.
- Consideración de memoria: la rama voxel escala con la resolución de la rejilla 3D; reducir el tamaño de voxel o aumentar el número de puntos (el ejemplo usa 8192) incrementa el consumo de activaciones de forma más rápida que el número de parámetros.
- Opciones de despliegue: PyTorch nativo e `torch-pointcloud` (`pip install torch-pointcloud`) son las vías documentadas. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo; para servicio bastaría un wrapper HTTP sobre PyTorch (FastAPI, TorchServe o similar).
- Latencia y throughput: no disponibles en la información proporcionada. Dependen críticamente del número de puntos por muestra y de la resolución de voxelización, no solo del tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | mIoU S3DIS Area 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PVCNN c0.125 (este modelo) | 44.149 (safetensors) | 8192 puntos, 9 canales, 13 clases | 49,25 (no verificado) | MIT | HuggingFace, vía `torch-pointcloud` |
| PVCNN variantes mayores (mismo paper, otro factor de canales) | no disponible en la información | misma entrada | no disponible en la información | MIT (repo original) | GitHub `mit-han-lab/pvcnn` |
| PointNet++ (referencia de la literatura) | no disponible en la información | nubes de puntos con XYZ (+RGB) | no disponible en la información | no disponible en la información | implementaciones múltiples |
| Point Transformer (referencia de la literatura) | no disponible en la información | nubes de puntos con XYZ (+RGB) | no disponible en la información | no disponible en la información | implementaciones múltiples |
| RandLA-Net (referencia para nubes a gran escala) | no disponible en la información | nubes de puntos a gran escala | no disponible en la información | no disponible en la información | implementación oficial en GitHub |

No se han incluido cifras comparativas de los modelos alternativos porque no figuran en la información proporcionada; para una comparación numérica rigurosa deben consultarse las tablas de los artículos originales, teniendo en cuenta que los protocolos de evaluación por área de S3DIS no siempre son homogéneos entre publicaciones.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado sobre S3DIS, un dataset de habitaciones y plantas de oficina y docencia en interiores. El rendimiento caerá fuera de ese dominio (exteriores, LiDAR vehicular, escenas industriales, nubes con otra densidad o sin color).
- El mIoU declarado (49,25) es moderado: la segmentación por punto sigue siendo un problema abierto y esta variante prioriza el coste computacional sobre la precisión.
- Confusión entre clases geométricamente parecidas: pared, pizarra, viga y columna comparten orientación y superficies planas, lo que produce errores sistemáticos esperables.
- Sensibilidad al preprocesado: el pipeline exige posición normalizada (`norm_pos`) y color en rango 0-255; alterar la normalización o la escala de color degrada la salida sin aviso.
- Benchmarks no verificados: las cuatro métricas del `model-index` están marcadas con `verified: false` y proceden del autor de la conversión, no de una evaluación independiente.
- Documentación mínima y sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, model card muy escueta y ausencia de detalles sobre el protocolo `simple/` o sobre el entrenamiento.
- Discrepancia en el recuento de parámetros: el safetensors declara 44.149 parámetros mientras la model card los redondea a 0,0 M; conviene verificar la arquitectura exacta antes de asumir equivalencias con otras variantes PVCNN.
- Sin cuantizaciones documentadas: no se publican pesos en FP16, INT8 o GGUF, de modo que cualquier optimización de despliegue hay que hacerla por cuenta propia.
- Riesgo de alucinación no aplica (modelo discriminativo), pero sí de sobreconfianza: los logits por punto pueden asignar clases con alta probabilidad en regiones ambiguas u ocluidas.
- Licencia MIT: permite uso comercial, modificación y redistribución con conservación del aviso de copyright y de la atribución; conviene citar además el paper de PVCNN y el de S3DIS. No hay restricciones de uso por campo de aplicación, pero la licencia del dataset S3DIS es independiente y debe respetarse si se redistribuyen datos.
- En producción, es recomendable fijar la versión de `torch-pointcloud` y de PyTorch, ya que la API de carga (`create_model`, `collate`, `forward`) depende de la librería y no está estandarizada por HuggingFace (`pipeline: no disponible`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pvcnn-c0p125.s3dis-area5.mit-han-lab
- Paper de PVCNN (NeurIPS 2019): https://arxiv.org/abs/1907.03739
- Repositorio original de MIT HAN Lab: https://github.com/mit-han-lab/pvcnn
- Librería `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (Stanford 2D-3D-S): http://buildingparser.stanford.edu/dataset.html
- PyTorch (framework base): https://pytorch.org/
- Nota: la búsqueda web realizada no devolvió enlaces específicos sobre este modelo; los resultados se limitaron a páginas generales de PyTorch y a un navegador homónimo sin relación.
