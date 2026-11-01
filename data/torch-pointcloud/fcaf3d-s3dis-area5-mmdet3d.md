# torch-pointcloud/fcaf3d.s3dis-area5.mmdet3d

## Resumen

FCAF3D (Fully Convolutional Anchor-Free 3D Object Detection) es un detector de objetos 3D para nubes de puntos, desarrollado originalmente por Danila Rukhovich, Anna Vorontsova y Anton Konushin, y publicado en ECCV 2022. Este checkpoint concreto, `fcaf3d.s3dis-area5.mmdet3d`, es una conversión del modelo original de OpenMMLab (mmdetection3d) al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin. Está entrenado sobre el conjunto de datos S3DIS (Stanford 3D Indoor Spaces) y evalúa sobre el área 5, el split estándar de test.

El modelo resuelve la detección de objetos 3D en escenas interiores a partir de nubes de puntos, prediciendo cajas delimitadoras orientadas (oriented bounding boxes) para cinco clases de objetos. Su enfoque es totalmente convolucional y libre de anclas (anchor-free), lo que simplifica el diseño frente a detectores basados en propuestas o en anchors, y lo hace adecuado para escenas con objetos de geometrías variadas.

Con 70,5 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto orientado a inferencia en GPU. Es relevante para quienes trabajan en percepción 3D, robótica de interiores, escaneo de edificios o realidad aumentada, y necesitan un detector de objetos 3D listo para usar con pesos en safetensors y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCAF3D: detector 3D totalmente convolucional, anchor-free, sobre vóxeles dispersos (sparse voxel) |
| Parametros totales | 70.497.737 (~70,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No aplica (modelo de nubes de puntos, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (coordenadas xyz) |
| Clases | 5 |
| Canales de características | 512 |
| Dataset de entrenamiento | S3DIS (Stanford 3D Indoor Spaces) |
| Tarea | Detección de objetos 3D (object-detection) |

## Arquitectura y entrenamiento

FCAF3D es un detector de objetos 3D totalmente convolucional y libre de anclas que opera sobre representaciones de vóxeles dispersos (sparse voxel). A diferencia de detectores basados en propuestas o en anchors, el modelo predice directamente las cajas delimitadoras orientadas a partir de un backbone convolucional disperso, lo que reduce la complejidad del pipeline y evita hiperparámetros asociados a los anchors. El checkpoint declara 3 canales de entrada, 512 canales de características y 5 clases de salida.

El entrenamiento se realizó sobre el conjunto de datos S3DIS, un corpus de escaneos 3D de interiores de edificios (habitaciones, pasillos, oficinas) con anotaciones semánticas e instancias. La evaluación se realiza sobre el área 5, el split de test habitual en la literatura de S3DIS. El modelo original se publicó en ECCV 2022 (arXiv:2112.00322) y este checkpoint es una conversión desde OpenMMLab mmdetection3d (Apache-2.0) al formato de `torch-pointcloud`. La información disponible no detalla el número exacto de tokens/puntos de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de aumento de datos específicas más allá de las del pipeline original.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores, con predicción de cajas delimitadoras orientadas.
- Clasificación de 5 clases de objetos del dataset S3DIS (categorías de mobiliario y elementos de interior).
- Extracción de características de 512 canales mediante `forward_features`, útil para tareas posteriores de representación o transferencia.
- Procesamiento de nubes de puntos con coordenadas xyz (3 canales de entrada).
- Inferencia en GPU mediante kernels dispersos (spconv), orientada a escenas con miles de puntos por muestra.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo puramente perceptivo de visión 3D.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Digitalización de interiores y modelado BIM: el modelo detecta mobiliario y elementos estructurales en escaneos de edificios, permitiendo generar inventarios automáticos de objetos por habitación. Es adecuado porque está entrenado específicamente en S3DIS, un dataset de interiores de edificios.
- Robótica móvil en interiores: un robot equipado con LiDAR o cámara de profundidad puede usar el detector para localizar obstáculos y objetos (mesas, sillas, puertas) y planificar la navegación. La naturaleza anchor-free y convolucional del modelo facilita la integración en pipelines de percepción en tiempo real en GPU.
- Realidad aumentada y virtual: detección de objetos físicos en el entorno para anclar contenido virtual sobre ellos. El modelo proporciona cajas orientadas, útiles para colocar elementos 3D alineados con la geometría real.
- Inventario automatizado de oficinas y almacenes: procesamiento por lotes de escaneos 3D para contar y clasificar objetos. El tamaño compacto (70,5 M de parámetros, 0,3 GB) permite desplegarlo en estaciones de trabajo con GPU de gama media.
- Anotación asistida de datasets 3D: el detector puede generar preanotaciones de instancias sobre nuevas nubes de puntos, reduciendo el coste de etiquetado manual. Se usaría como modelo base y se refinaría con corrección humana.
- Investigación en percepción 3D: como referencia reproducible con pesos en safetensors y licencia Apache-2.0, sirve para comparar arquitecturas anchor-free frente a baselines con anchors en S3DIS, o para extraer características de 512 canales con `forward_features` en tareas downstream.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| S3DIS (Area 5) | 3d-object-detection | mAP@0.25 | 66,31 |
| S3DIS (Area 5) | 3d-object-detection | mAP@0.5 | 46,71 |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de visión 3D y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 70,5 M de parámetros, los pesos en precisión nativa ocupan aproximadamente 0,28 GB; el consumo real depende del número de puntos por muestra y de las estructuras dispersas intermedias generadas por spconv.
- GPU recomendadas: se requiere GPU (el modelo usa kernels dispersos solo para GPU). Una GPU con al menos 8-12 GB de VRAM es un punto de partida razonable para lotes pequeños, aunque no se documenta un mínimo oficial.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas como RTX 3060/4060 o superiores, siempre que se ajuste el número de puntos por muestra; no hay cifras oficiales de consumo.
- Opciones de despliegue: la librería `torch-pointcloud` (con dependencia de `spconv` compilado para la versión de torch y CUDA correspondiente). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Dataset | mAP@0.25 (S3DIS Area 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fcaf3d.s3dis-area5.mmdet3d (este) | FCAF3D anchor-free, sparse voxel | 70,5 M | S3DIS | 66,31 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| FCAF3D original (mmdetection3d) | FCAF3D anchor-free, sparse voxel | No disponible en la información | S3DIS | No disponible en la información | Apache-2.0 | GitHub (OpenMMLab) |
| Otros detectores 3D de interiores (p. ej. VoteNet, Group-Free) | Basados en puntos / votos | No disponible en la información | S3DIS | No disponible en la información | No disponible | No disponible |

No se dispone en la información proporcionada de cifras de rendimiento de los modelos alternativos para una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo específico de escenas interiores: entrenado en S3DIS, por lo que su rendimiento fuera de entornos de interior (exteriores, industria, conducción) no está garantizado.
- Solo 5 clases: la granularidad semántica es limitada; objetos no presentes en S3DIS no serán detectados correctamente.
- Resultados de benchmark declarados por el autor y marcados como no verificados (`verified: false`); deben tomarse con cautela.
- Requiere GPU y kernels dispersos (spconv) compilados para la versión de torch y CUDA; la instalación puede ser frágil y dependiente del entorno.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, tool calling ni agentes; no debe evaluarse con benchmarks de NLP.
- Riesgo de falsos positivos y negativos en escenas con oclusiones, objetos parciales o densidades de puntos muy distintas a las de S3DIS.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda revisar las obligaciones de atribución y las licencias de las dependencias (spconv, torch-pointcloud).
- No se documentan sesgos específicos ni limitaciones idiomáticas (no aplica), pero sí una posible dependencia del dominio de captura (sensores, densidad de puntos, ruido).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/fcaf3d.s3dis-area5.mmdet3d
- Paper FCAF3D (ECCV 2022): https://arxiv.org/abs/2112.00322
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- OpenMMLab mmdetection3d (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- Dataset S3DIS (referencia): Armeni et al., "3D Semantic Parsing of Large-Scale Indoor Spaces", CVPR 2016
