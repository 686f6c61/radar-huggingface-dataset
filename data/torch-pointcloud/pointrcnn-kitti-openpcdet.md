# torch-pointcloud/pointrcnn.kitti.openpcdet

## Resumen

PointRCNN es un detector de objetos 3D sobre nubes de puntos LiDAR, originalmente publicado en CVPR 2019 por Shaoshuai Shi, Xiaogang Wang y Hongsheng Li. Esta ficha corresponde a la conversión del checkpoint oficial de OpenPCDet (Apache-2.0) al formato de la librería `torch-pointcloud`, publicada por el autor de dicha librería, Arthur Dujardin. El modelo resuelve la detección de coches, peatones y ciclistas en escenas de conducción autónoma del dataset KITTI, trabajando directamente sobre coordenadas 3D más intensidad de retorno láser.

La arquitectura es de dos etapas y puramente basada en puntos: una primera etapa genera propuestas de cajas 3D mediante segmentación foreground/background sobre cada punto y agrupación de los puntos foreground en cajas candidatas; la segunda etapa refina cada propuesta en coordenadas canónicas para producir la caja final y la clasificación. Frente a enfoques basados en vóxeles o BEV, PointRCNN preserva la geometría original de la nube sin voxelizar, lo que reduce la pérdida de información en objetos pequeños como peatones y ciclistas.

El interés actual de esta ficha es práctico: es un checkpoint pequeño (4,06 M de parámetros), con licencia permisiva, pesos en safetensors y una API de carga de una línea vía `torch-pointcloud`. Sirve como referencia reproducible del estado del arte de 2019 en detección 3D y como baseline para pipelines de percepción LiDAR, no como modelo de lenguaje ni multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointRCNN, detector 3D en dos etapas basado en puntos (PointNet++ como backbone de la primera etapa, refinamiento en coordenadas canónicas en la segunda) |
| Parametros totales | 4.060.531 (4,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos; el ejemplo de la model card usa 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |

Datos adicionales declarados en la model card: 4 canales de entrada (x, y, z, intensidad), 3 clases de salida (Car, Pedestrian, Cyclist) y 128 canales de características en el extractor.

## Arquitectura y entrenamiento

PointRCNN se compone de dos etapas entrenadas de forma conjunta. La primera etapa aplica un backbone tipo PointNet++ sobre la nube completa para clasificar cada punto como foreground u objeto, y agrupa los puntos foreground en propuestas de caja 3D con un mecanismo de binning en el plano BEV. La segunda etapa recorta cada propuesta, transforma sus puntos a un sistema de coordenadas canónico relativo al centro de la caja y aplica una red de refinamiento que predice el ajuste de la caja y la clase final. Esta separación permite generar propuestas con alta cobertura y refinarlas después con información local densa.

El entrenamiento se realizó sobre KITTI, el benchmark de referencia para percepción en conducción autónoma, con las tres clases habituales (Car, Pedestrian, Cyclist). La model card no documenta el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento original descrito en el paper (arXiv:1812.04244). La conversión procede del repositorio OpenPCDet de open-mmlab, que es la implementación de referencia mantenida de estos detectores.

Como innovación destacable, el enfoque point-based evita la voxelización y conserva la resolución nativa de la nube, lo que se traduce en mejor rendimiento en clases con pocos puntos por objeto. La librería `torch-pointcloud` añade una capa de abstracción (`tp.create_model`) que gestiona la descarga de pesos, las transformaciones de datos y el collate por lotes.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR con cajas orientadas (yaw) y clase asociada.
- Clasificación en tres categorías: coche, peatón y ciclista.
- Segmentación foreground/background a nivel de punto en la primera etapa, utilizable como señal auxiliar.
- Extracción de características por punto de 128 canales mediante `model.forward_features(...)`, reutilizable para tareas downstream (segmentación, clustering, recuperación).
- Procesamiento por lotes con gestión de índices de batch (`data["batch"]`) para escenas de distinto número de puntos.
- Entrada de 4 canales: coordenadas XYZ más intensidad de retorno.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Baseline de percepción LiDAR en investigación: punto de partida reproducible para comparar nuevos detectores 3D contra un método publicado en CVPR 2019 con métricas KITTI conocidas.
- Etiquetado semiautomático de datasets: ejecutar el modelo sobre nubes sin anotar para prellenar cajas 3D y reducir el coste de anotación manual, con revisión humana posterior.
- Detección de peatones y ciclistas en sistemas ADAS: la etapa point-based conserva mejor la geometría de objetos pequeños que los enfoques voxelizados, lo que resulta adecuado para usuarios vulnerables de la vía.
- Módulo de propuestas en pipelines de dos etapas: la primera etapa puede aislarse para generar candidatos que alimenten un refinador propio o un modelo de fusión cámara-LiDAR.
- Extracción de características para modelos downstream: los 128 canales por punto sirven como embedding geométrico en tareas de segmentación semántica, clasificación de escenas o matching entre frames.
- Monitorización de tráfico en infraestructura: desplegado sobre LiDAR estático en intersecciones para contar y clasificar vehículos y viandantes, con la ventaja de no depender de imágenes y preservar privacidad.
- Validación de pipelines de datos: al ser pequeño y con API simple, es útil como caso de prueba en CI para verificar transformaciones, collate y serialización de nubes de puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre KITTI:

| Metrica | Valor |
|---|---|
| mAP | 68,19 |
| AP/Car | 78,51 |
| AP/Pedestrian | 55,06 |
| AP/Cyclist | 71,00 |

No se han publicado en la información disponible otros resultados (latencia, throughput, resultados por dificultad fácil/moderada/difícil ni por IoU) más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,0 M de parámetros y una muestra de 8192 puntos, el modelo cabe holgadamente en cualquier GPU con 2-4 GB libres, incluyendo GPUs integradas modestas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para lotes grandes o nubes densas (decenas de miles de puntos por escena) se recomienda RTX 3060 o superior, A100/H100 para procesamiento masivo por lotes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo recientes (GTX 1650, RTX 3050, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: la librería `torch-pointcloud` (`pip install torch-pointcloud`) con PyTorch; exportación a TorchScript u ONNX no documentada en la información disponible; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mAP KITTI (declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pointrcnn.kitti.openpcdet (esta ficha) | 4,0 M | Nube de puntos, 4 canales | 3 | 68,19 | Apache-2.0 | Hugging Face, safetensors |
| PointPillars (OpenPCDet) | no disponible | Nube de puntos en pilares | 3 | no disponible en esta informacion | Apache-2.0 (OpenPCDet) | OpenPCDet, pesos comunitarios |
| SECOND (OpenPCDet) | no disponible | Voxels dispersos | 3 | no disponible en esta informacion | Apache-2.0 (OpenPCDet) | OpenPCDet, pesos comunitarios |
| PV-RCNN (OpenPCDet) | no disponible | Voxels + puntos | 3 | no disponible en esta informacion | Apache-2.0 (OpenPCDet) | OpenPCDet, pesos comunitarios |

Las alternativas citadas pertenecen al mismo ecosistema (OpenPCDet) y a la misma tarea, pero no se dispone en la información proporcionada de sus recuentos de parámetros ni de sus métricas concretas para una comparación numérica rigurosa. La ventaja diferencial de esta ficha es la disponibilidad inmediata en formato safetensors con API de carga unificada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en detección 3D sobre LiDAR; no procesa texto, imágenes ni audio, y no debe evaluarse con criterios de modelos generativos.
- Entrenado únicamente en KITTI: dominio limitado a escenas de conducción diurna en entorno urbano y rural alemán; el rendimiento puede degradarse con sensores distintos, densidades de nube diferentes o condiciones meteorológicas adversas.
- Solo tres clases (Car, Pedestrian, Cyclist); no detecta camiones, autobuses, motocicletas ni señalización.
- Métricas declaradas como no verificadas (`verified: false`); conviene reproducirlas antes de usarlas como referencia en publicaciones.
- Riesgo de falsos negativos en objetos ocluidos o lejanos, habitual en detectores LiDAR de una sola modalidad; no hay fusión con cámara.
- No se documentan análisis de sesgo, calibración de incertidumbre ni evaluación por franjas de distancia.
- Licencia Apache-2.0: permite uso comercial y modificación con conservación de avisos; el modelo deriva de OpenPCDet (también Apache-2.0), por lo que deben mantenerse las atribuciones correspondientes.
- Para producción en conducción autónoma real se requiere validación propia, redundancia con otros sensores y cumplimiento normativo; este checkpoint no está certificado para seguridad funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointrcnn.kitti.openpcdet
- Paper PointRCNN (CVPR 2019): https://arxiv.org/abs/1812.04244
- Repositorio OpenPCDet (origen de la conversión): https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset KITTI: https://www.cvlibs.net/datasets/kitti/
