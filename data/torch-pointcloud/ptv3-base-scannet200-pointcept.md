# torch-pointcloud/ptv3-base.scannet200.pointcept

## Resumen

ptv3-base.scannet200.pointcept es un modelo de segmentación semántica de nubes de puntos 3D basado en Point Transformer V3 (PTV3), la arquitectura presentada por Xiaoyang Wu et al. en CVPR 2024. Lo distribuye el usuario torch-pointcloud como conversión del checkpoint original del repositorio Pointcept al formato de la librería `torch-pointcloud`, manteniendo los pesos en safetensors. El modelo resuelve la asignación de una de 200 clases semánticas a cada punto de una escena interior, y su relevancia radica en que PTV3 reformula la atención de vecindad en forma serializada, lo que reduce el coste computacional frente a transformadores de puntos anteriores.

El checkpoint tiene 46,2 millones de parámetros, 6 canales de entrada (posición, color y normal), 64 canales de características y una cabeza de clasificación de 200 clases. Está entrenado específicamente sobre ScanNet200, la variante de grano fino del dataset ScanNet con vocabulario largo y fuerte desbalanceo de clases, lo que explica un mIoU moderado (35,12) junto a una exactitud global alta (83,31).

Es un modelo de visión 3D puro, no un modelo de lenguaje: no genera texto, no soporta tool calling y no procesa instrucciones. Su utilidad es como componente de percepción en pipelines de robótica, escaneo de interiores, BIM o realidad aumentada, donde se necesita etiquetar densamente geometría 3D en tiempo razonable sobre GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point Transformer V3 (atención de vecindad serializada, jerárquica) |
| Parametros totales | 46.183.304 (46,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos; el ejemplo de la model card usa 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posicion xyz, color rgb, normal xyz) |
| Canales de caracteristicas | 64 |
| Clases de salida | 200 |
| Dataset de entrenamiento | ScanNet200 |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,2 GB |
| Dependencias nativas | spconv, flash-attn (compiladas contra la version de torch y CUDA) |

## Arquitectura y entrenamiento

PTV3 es un transformer jerárquico para nubes de puntos que sustituye el mecanismo de atención clásico por una atención de vecindad serializada: los puntos se ordenan mediante curvas de Hilbert (o Morton) en rejillas de múltiples resoluciones y la atención se restringe a vecinos contiguos en ese orden. Esto permite usar kernels dispersos y `flash-attn` eficientes, elimina gran parte de la sobrecarga de emparejamiento de vecinos y escala mejor que PointNet++, PointNeXt o los primeros Point Transformer. La variante "base" de este checkpoint usa 64 canales de características y 46,2 M de parámetros, una configuración deliberadamente contenida frente a las versiones grandes de PTV3.

El entrenamiento se realizó sobre ScanNet200, con 200 clases semánticas de interior (desde "silla" o "mesa" hasta categorías raras con muy pocas instancias). La model card no documenta el número de tokens, la composición exacta del dataset, el esquema de aumento de datos ni si hubo fases de preentrenamiento adicionales o ajuste fino con pérdidas auxiliares; esos datos deben consultarse en el paper y en el repositorio Pointcept. El checkpoint es una conversión directa de Pointcept (MIT) al formato de `torch-pointcloud`, sin reentrenamiento declarado.

## Capacidades

- Segmentación semántica densa de nubes de puntos: asigna una etiqueta entre 200 clases a cada punto de una escena interior.
- Entrada multimodal geométrica: consume posición (3), color (3) y normal (3) por punto, con 6 canales efectivos en la entrada del modelo.
- Extracción de características: el método `forward_features` y `reset_classifier(num_classes=0)` devuelven un embedding de 64 dimensiones por punto, reutilizable para tareas downstream (clasificación de escena, clustering, matching, búsqueda).
- Procesamiento por lotes de escenas: la API acepta `batch` y `pos_grid`, lo que permite inferencia sobre varias nubes en una sola pasada.
- Ejecución GPU-only: los kernels de spconv y flash-attn requieren CUDA; no hay ruta CPU documentada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión 2D, audio ni modo "thinking".
- No tiene capacidades multilingües: no procesa ni produce lenguaje natural.

## Casos de uso

- Digitalización de interiores y BIM: dado un escaneo de una habitación u oficina, el modelo etiqueta cada punto como pared, suelo, silla, mesa, puerta o cualquiera de las 200 clases de ScanNet200, lo que permite generar planos semánticos y modelos de información de edificios de forma automática.
- Robótica móvil y navegación: integrado en el pipeline de percepción de un robot, proporciona mapas semánticos 3D que permiten distinguir superficies transitables de obstáculos y objetos manipulables, con 46 M de parámetros que caben en GPUs embebidas de gama alta (Jetson Orin).
- Realidad aumentada y mixta: la segmentación punto a punto permite ocluir objetos reales, anclar contenido virtual sobre superficies concretas y aplicar efectos selectivos por clase (por ejemplo, recolorear solo sillas o mesas).
- Inventario y auditoría de espacios: en escaneos de retail, almacenes o viviendas, el etiquetado denso permite contar y localizar instancias de categorías concretas, alimentando sistemas de inventario automatizado a partir de capturas con LiDAR o fotogrametría.
- Anotación asistida y preetiquetado: el modelo actúa como primer paso de un flujo de etiquetado humano, generando máscaras semánticas que un anotador corrige; con 35,12 de mIoU y 83,31 de OA reduce el trabajo manual en las clases frecuentes.
- Investigación en visión 3D: sirve como baseline reproducible de PTV3-base sobre ScanNet200 para comparar nuevas arquitecturas, estrategias de aumento de datos o funciones de pérdida, gracias a su licencia MIT y a su integración en `torch-pointcloud`.
- Extracción de descriptores para búsqueda y recuperación 3D: los embeddings de 64 dimensiones por punto permiten construir índices de fragmentos de escena para tareas de place recognition o segmentación few-shot.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| ScanNet200 (segmentacion semantica) | mIoU | 35,12 |
| ScanNet200 (segmentacion semantica) | OA (exactitud global) | 83,31 |

No se han publicado en la informacion disponible resultados adicionales (por ejemplo, en S3DIS, SemanticKITTI o nuScenes) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 46 M de parámetros en fp32 ocupa unos 185 MB de pesos; el consumo real depende del número de puntos por escena, del tamaño de las rejillas serializadas y de las activaciones intermedias, que en PTV3 suelen dominar el uso de memoria.
- GPU recomendadas: cualquier GPU NVIDIA con soporte para `flash-attn` y `spconv` (Ampere o superior). Para escenas completas de ScanNet200 con decenas de miles de puntos, se recomienda A100, H100, L40S o RTX 4090.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con lotes pequeños y submuestreo de puntos, en RTX 3060/4060 Ti de 12-16 GB. En GPUs integradas o Apple Silicon no hay ruta soportada por los kernels requeridos.
- Despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) con `spconv` y `flash-attn` compilados para la versión exacta de PyTorch y CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente del número de puntos por escena y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU ScanNet200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ptv3-base.scannet200.pointcept | 46,2 M | nubes de puntos, 6 canales, 200 clases | 35,12 | MIT | Hugging Face, via torch-pointcloud |
| Point Transformer V3 (variantes mayores, Pointcept) | no disponible en la informacion | nubes de puntos | no disponible en la informacion | MIT | GitHub Pointcept |
| PointNeXt / PointNet++ (baselines clasicos) | no disponible en la informacion | nubes de puntos | no disponible en la informacion | MIT / otras | Implementaciones multiples |
| Modelos de segmentacion 2D proyectada (por ejemplo, basados en SAM o Mask2Former adaptados) | no disponible en la informacion | imagenes RGB-D proyectadas | no disponible en la informacion | variable | Hugging Face |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; para contextualizar el 35,12 de mIoU conviene consultar la tabla de resultados del paper de PTV3 y del benchmark de ScanNet200 en Pointcept.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ScanNet200 (escenas interiores de habitaciones con capturas RGB-D). El rendimiento en exteriores, LiDAR vehicular, escenas industriales o nubes con sensores distintos puede degradarse de forma significativa.
- mIoU moderado: 35,12 sobre 200 clases refleja la dificultad del vocabulario largo; las clases raras tienen pocos ejemplos y su IoU individual será bajo. No es adecuado para aplicaciones que exijan alta precisión en categorías poco frecuentes sin ajuste fino.
- Dependencia de kernels nativos: requiere `spconv` y `flash-attn` compilados contra la versión de PyTorch y CUDA del entorno, lo que complica la reproducibilidad y el despliegue en contenedores o entornos con versiones fijas.
- Ejecución GPU-only: no hay soporte CPU documentado, lo que limita su uso en entornos sin GPU NVIDIA.
- Sesgos: al derivar de ScanNet, hereda los sesgos de composición del dataset (tipologías de vivienda y mobiliario occidentales, sensores y resoluciones concretas), con posible peor rendimiento en entornos con distribuciones distintas.
- Riesgo de error silencioso: el modelo siempre asigna una de las 200 clases, sin puntuación de "desconocido"; los puntos de objetos fuera del vocabulario se etiquetarán como la clase más parecida. Conviene aplicar umbrales sobre la confianza (softmax) en producción.
- Sin datos de calibración: la model card no documenta temperaturas, umbrales ni métricas por clase, por lo que la calibración debe validarse en el dominio objetivo.
- Licencia MIT: permite uso comercial y modificación, pero el usuario debe cumplir también las licencias de las dependencias (`spconv`, `flash-attn`, PyTorch) y citar adecuadamente el paper de PTV3 y ScanNet.
- Sin verificación independiente: las métricas están marcadas como `verified: false`; no se han reproducido de forma externa en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/ptv3-base.scannet200.pointcept
- Paper de Point Transformer V3: https://arxiv.org/abs/2312.10035
- Repositorio Pointcept (origen del checkpoint): https://github.com/Pointcept/Pointcept
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Paper de ScanNet: https://arxiv.org/abs/1702.04405
- Repositorio de ScanNet: https://github.com/ScanNet/ScanNet
