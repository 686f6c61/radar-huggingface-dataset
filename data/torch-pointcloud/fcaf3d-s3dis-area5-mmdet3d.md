# torch-pointcloud/fcaf3d.s3dis-area5.mmdet3d

## Resumen

FCAF3D es un detector de objetos 3D para nubes de puntos presentado en ECCV 2022 por Danila Rukhovich, Anna Vorontsova y Anton Konushin. Se trata de un detector totalmente convolucional, anchor-free y que opera sobre vóxeles dispersos, lo que elimina los componentes habitualmente costosos de los detectores 3D clásicos: no necesita anchors, ni propuestas de región, ni Non-Maximum Suppression (NMS). Esta ficha corresponde al checkpoint `fcaf3d.s3dis-area5.mmdet3d`, una conversión del modelo original de MMDetection3D al ecosistema `torch-pointcloud`, publicada por el autor de esa librería, Arthur Dujardin.

El checkpoint está entrenado sobre el *split* de evaluación Area 5 del dataset S3DIS (Stanford 3D Indoor Spaces), un conjunto de escenas interiores de oficinas escaneadas con Matterport. Detecta cinco clases de mobiliario y elementos arquitectónicos (mesa, silla, sofá, libro y tablero/pizarra) a partir de nubes de puntos con coordenadas XYZ y color RGB. Con 70,5 millones de parámetros y un repositorio de 0,3 GB, es un modelo compacto y ligero orientado a inferencia en GPU.

Su relevancia actual es doble: por un lado, sirve como referencia reproducible de FCAF3D en un *framework* moderno (PyTorch + `torch-pointcloud`); por otro, demuestra que un detector 3D competitivo puede ejecutarse con un presupuesto de memoria y cómputo muy contenido, algo útil para robótica, escaneo de interiores y sistemas embebidos con GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FCAF3D: detector 3D totalmente convolucional, anchor-free, sobre vóxeles dispersos (sparse voxel backbone) |
| Parámetros totales | 70.497.737 (≈70,5 M) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D sobre nubes de puntos, no un LLM) |
| Tipos de cuantización | no disponible (pesos en safetensors en precisión nativa; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |
| Canales de entrada | 3 (coordenadas XYZ) |
| Clases de salida | 5 |
| Dimensión de características | 512 |
| Dataset de entrenamiento | S3DIS, split Area 5 |
| Librería | `torch-pointcloud` |
| Dependencias | `spconv` (compilación acorde a versión de torch y CUDA) |
| Pipeline HF | object-detection |

## Arquitectura y entrenamiento

FCAF3D es una red totalmente convolucional que procesa la nube de puntos tras voxelizarla en una rejilla dispersa. Un *backbone* convolucional 3D disperso (basado en `spconv`) extrae características a varias resoluciones; a continuación, un cuello de características y una cabeza de detección predicen directamente, para cada vóxel ocupado, la clase y los parámetros de la caja (centro y tamaño), sin anchors ni propuestas. El diseño elimina el NMS y las etapas de refinamiento típicas de detectores como VoteNet o Group-Free, lo que reduce la latencia y simplifica el *pipeline*. El modelo usa 512 canales de características y 3 canales de entrada, y produce detecciones sobre 5 clases.

El checkpoint se ha entrenado sobre el *split* Area 5 de S3DIS, el protocolo estándar de evaluación *leave-one-area-out* del dataset. No se documentan en la información disponible detalles sobre número de épocas, aumentos de datos, función de pérdida exacta ni si se aplicó algún tipo de ajuste fino posterior. El modelo original fue convertido desde MMDetection3D (Apache-2.0) a `torch-pointcloud`, manteniendo los pesos, y requiere kernels GPU-only de `spconv` para la convolución dispersa.

## Capacidades

- Detección de objetos 3D en nubes de puntos de interiores: localiza y clasifica instancias con cajas 3D axis-aligned.
- Clasificación en 5 clases de S3DIS (mesa, silla, sofá, libro y tablero/pizarra, según el etiquetado estándar del dataset).
- Entrada multimodal a nivel de punto: coordenadas XYZ y color RGB.
- Extracción de características densas de 512 canales mediante `forward_features`, reutilizables para tareas *downstream* (segmentación, *retrieval*, clasificación de escena).
- Inferencia por lotes (*batched*) con agrupación por escena mediante `collate`.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente perceptivo 3D.
- No tiene capacidades multilingües ni procesamiento de audio.

## Casos de uso

- **Digitalización de interiores y *facility management***: detectar automáticamente mesas, sillas y sofás en escaneos Matterport de oficinas para generar inventarios de mobiliario y planos semánticos. El modelo está entrenado exactamente en este dominio (S3DIS), por lo que la transferencia es directa.
- **Robótica móvil en interiores**: un robot equipado con LiDAR o cámara de profundidad puede usar el detector para localizar obstáculos y mobiliario (sillas, mesas) y planificar la navegación, con un coste de 70,5 M de parámetros que cabe en GPUs embebidas tipo Jetson.
- **Realidad aumentada y gemelos digitales**: anclar objetos virtuales sobre mobiliario real detectado en tiempo real, aprovechando que el modelo no necesita NMS y por tanto tiene una latencia baja y predecible.
- **Asistencia a la accesibilidad**: identificar sillas, mesas y obstáculos en escenas interiores para aplicaciones de navegación asistida de personas con discapacidad visual, a partir de la nube de puntos de un sensor portátil.
- **Preprocesado para *pipelines* de segmentación**: usar `forward_features` para obtener descriptores de 512 canales por punto y alimentar un modelo de segmentación semántica o de instancias posterior, reutilizando el *backbone* preentrenado.
- **Control de calidad de inventarios en retail y oficinas**: procesar escaneos periódicos de un espacio y comparar las detecciones con el inventario esperado para detectar mobiliario faltante o reubicado.
- **Generación de datos sintéticos y aumento**: emplear el detector como anotador automático (*pseudo-labelling*) sobre nubes de puntos no etiquetadas del mismo dominio para ampliar datasets de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados de forma independiente), sobre S3DIS Area 5, tarea de detección de objetos 3D:

| Métrica | Valor |
|---|---|
| mAP@0.25 | 66,65 |
| mAP@0.5 | 47,29 |

No se han publicado en la información disponible otros resultados de benchmarks (latencia, throughput, comparación con otros detectores) más allá de estos dos valores.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Con 70,5 M de parámetros en FP32, los pesos ocupan aproximadamente 0,28 GB; el consumo real depende del número de puntos por escena y del tamaño del lote, y suele situarse en el rango de 1 a 4 GB para lotes moderados.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA moderna. Para producción, A100 o H100 si se procesan muchas escenas en paralelo; para desarrollo, RTX 3090 o RTX 4090 son suficientes.
- **GPU de consumo**: sí, cabe con holgura en GPUs de consumo (RTX 3060 en adelante), dado el reducido tamaño del modelo.
- **Requisito crítico**: kernels GPU-only de `spconv`, que deben compilarse para la versión exacta de PyTorch y CUDA. No hay soporte CPU documentado.
- **Despliegue**: la vía oficial es `torch-pointcloud` (`pip install torch-pointcloud`) con `spconv`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP@0.5 (S3DIS Area 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FCAF3D (este checkpoint) | 70,5 M | Nube de puntos XYZ + RGB | 47,29 (mAP@0.25: 66,65) | Apache-2.0 | Hugging Face + `torch-pointcloud` |
| VoteNet | no disponible en la información | Nube de puntos | no disponible | no disponible | MMDetection3D |
| Group-Free 3D | no disponible en la información | Nube de puntos | no disponible | no disponible | MMDetection3D |
| TR3D | no disponible en la información | Nube de puntos | no disponible | no disponible | Repositorio de los autores |

No se dispone en la información proporcionada de datos de parámetros, contexto ni resultados de benchmarks de los modelos alternativos, por lo que la comparación cuantitativa no puede completarse. FCAF3D destaca frente a VoteNet y Group-Free por su diseño anchor-free y sin NMS, y frente a TR3D por ser su predecesor directo del mismo grupo de investigación.

## Limitaciones y advertencias

- **Dominio restringido**: entrenado exclusivamente en S3DIS (interiores de oficina), con 5 clases. El rendimiento fuera de ese dominio (exteriores, industria, escenas domésticas distintas) no está garantizado.
- **Dependencia de `spconv`**: requiere compilar kernels CUDA específicos; un desajuste de versiones con PyTorch o CUDA provoca fallos en tiempo de ejecución.
- **Solo GPU**: no hay ruta de inferencia en CPU documentada, lo que limita el despliegue en entornos sin GPU.
- **Métricas no verificadas**: los valores de mAP proceden de la *model card* del autor y figuran como `verified: false`; conviene reproducirlos antes de usarlos como referencia en producción.
- **Riesgo de falsos positivos y negativos** en escenas con oclusiones densas o mobiliario atípico, habitual en detectores 3D sobre vóxeles dispersos.
- **Sin información sobre sesgos**: no se documentan análisis de sesgo por tipo de escena, iluminación o geometría.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución; el modelo original de MMDetection3D es también Apache-2.0.
- **Sin soporte de lenguaje natural**: no debe confundirse con un modelo generativo; no procesa texto ni responde a instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/fcaf3d.s3dis-area5.mmdet3d
- Paper FCAF3D (ECCV 2022): https://arxiv.org/abs/2112.00322
- Repositorio `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de `torch-pointcloud`: https://pytorch-pointcloud.org/
- Guía de instalación (incluye `spconv`): https://pytorch-pointcloud.org/latest/installation/
- Repositorio MMDetection3D (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- Dataset S3DIS (paper CVPR 2016): https://arxiv.org/abs/1604.04077
