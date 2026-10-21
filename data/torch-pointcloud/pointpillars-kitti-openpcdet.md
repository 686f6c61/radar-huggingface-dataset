# torch-pointcloud/pointpillars.kitti.openpcdet

## Resumen

pointpillars.kitti.openpcdet es un modelo de detección de objetos 3D sobre nubes de puntos LiDAR, publicado por torch-pointcloud y convertido desde OpenPCDet. Implementa la arquitectura PointPillars, basada en un codificador de pilares y un backbone 2D convolucional, y está entrenado con el dataset KITTI para detectar tres clases: coche, peatón y ciclista.

El modelo tiene 4.840.904 parámetros, 4 canales de entrada (x, y, z e intensidad) y 384 canales de características. Se distribuye en formato safetensors con licencia Apache-2.0 y se integra mediante la librería torch-pointcloud. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto textual.

Su interés práctico es el de un baseline ligero y reproducible para percepción 3D: permite inferencia en PyTorch, extracción de características y experimentación en robótica o conducción autónoma con un coste de parámetros muy bajo. Las métricas declaradas en KITTI no están verificadas y el autor no detalla el protocolo de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointPillars: codificador de pilares con backbone 2D convolucional |
| Parámetros totales | 4.840.904 (~4,84 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no es un modelo de lenguaje ni procesa contexto textual |
| Tipos de cuantización | No disponible: solo se documentan pesos safetensors; no se publican versiones cuantizadas |
| Idiomas soportados | No aplica: no procesa texto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Entrada | Nube de puntos LiDAR con 4 canales: x, y, z, intensidad |
| Clases detectadas | 3: Car, Pedestrian, Cyclist |
| Canales de características | 384 |
| Dataset de entrenamiento | KITTI |
| Framework | PyTorch mediante torch-pointcloud |
| Pipeline | object-detection |
| Tamaño del repositorio | 0,0 GB reportados; los pesos de 4,84 M de parámetros ocupan aproximadamente 19,4 MB en FP32 |
| Descargas / likes | 0 / 0 según la información disponible |

## Arquitectura y entrenamiento

PointPillars transforma la nube de puntos en una representación de pilares verticales y aplica un backbone 2D convolucional para predecir cajas 3D. La model card indica explícitamente un codificador de pilares con backbone 2D, 4 canales de entrada, 3 clases y 384 canales de características. Esta formulación evita convoluciones 3D costosas y permite un pipeline de detección más rápido que alternativas volumétricas, aunque no se aportan medidas de latencia o throughput.

El modelo se entrenó con KITTI y se convirtió desde OpenPCDet, que se distribuye con licencia Apache-2.0. No se documentan en la información disponible el número de puntos por muestra, el tamaño de pilar o vóxel, las augmentaciones, la función de pérdida, el número de épocas, el optimizador, el hardware de entrenamiento ni el procedimiento exacto de conversión. Tampoco hay información sobre RLHF, DPO u otras fases de alineación, que no aplican a un detector 3D. La innovación principal es la codificación mediante pilares descrita en el artículo de PointPillars, pero no se publican datos propios de velocidad de inferencia.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR para las clases coche, peatón y ciclista.
- Procesamiento de muestras con coordenadas espaciales e intensidad mediante la transformación y el collate de torch-pointcloud.
- Inferencia en PyTorch sobre CPU o GPU, con soporte de lotes.
- Extracción de características de 384 canales mediante `forward_features`, reutilizables en modelos downstream.
- Integración como baseline en pipelines de percepción 3D, robótica o conducción autónoma.
- No dispone de generación de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan visión RGB, audio, modo de razonamiento, detección abierta de clases, segmentación, tracking ni estimación de pose.

## Casos de uso

- Percepción para prototipos de conducción autónoma: el modelo detecta coches, peatones y ciclistas en nubes LiDAR y sirve como base para experimentar con planificación y control en entornos KITTI o similares.
- Robótica móvil y vehículos autoguiados: con 4,84 M de parámetros, puede integrarse en un pipeline de detección de obstáculos 3D con requisitos de memoria muy bajos, siempre que se valide el dominio de despliegue.
- Pre-anotación de datasets LiDAR: genera cajas 3D candidatas que después revisa un anotador humano, reduciendo el coste de etiquetado en proyectos de percepción.
- Extracción de características para tareas downstream: los 384 canales de `forward_features` pueden alimentar clasificadores de escena, modelos de segmentación o sistemas de recuperación de trayectorias.
- Monitorización de tráfico con sensores LiDAR: permite contar vehículos, peatones y ciclistas sin usar cámara, lo que puede ayudar a reducir riesgos de privacidad en entornos urbanos.
- Baseline académico y reproducción de experimentos: útil para comparar variantes de PointPillars, validar conversiones desde OpenPCDet y reproducir resultados en KITTI.
- Simulación y gemelos digitales: detección sobre datos sintéticos o registros reproducidos para comprobar la coherencia del pipeline de percepción antes de desplegarlo en un vehículo real.
- Control de calidad de sensores: una caída acusada de detecciones puede señalar problemas de calibración, desalineación temporal o degradación del LiDAR, aunque el modelo no incluye herramientas de diagnóstico específicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card para KITTI. Ninguno está verificado de forma independiente.

| Benchmark | Métrica | Valor | Verificado | Observaciones |
|---|---|---:|---|---|
| KITTI | mAP | 64,16 | No | El autor no especifica si es mAP 3D o BEV, ni el umbral IoU |
| KITTI | AP/Car | 77,35 | No | Protocolo de evaluación no detallado |
| KITTI | AP/Pedestrian | 52,39 | No | Protocolo de evaluación no detallado |
| KITTI | AP/Cyclist | 62,74 | No | Protocolo de evaluación no detallado |
| KITTI | Latencia / throughput | No disponible | No | No se publican medidas de velocidad |

No se han publicado en la información disponible resultados comparativos con otros modelos bajo el mismo protocolo, ni métricas de velocidad, memoria o consumo energético.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 19,4 MB en FP32, 9,7 MB en FP16 y 4,8 MB en INT8. El consumo real dependerá de los buffers de vóxeles o pilares y del tamaño de lote, que no se documentan.
- El modelo cabe holgadamente en GPUs consumer. No hay una recomendación oficial de GPU; por tamaño, una RTX 3060, RTX 4060 o RTX 4090 es más que suficiente para los pesos, y el límite práctico será el preprocesado de la nube de puntos.
- GPU de centro de datos como A100 o H100 no son necesarias por capacidad del modelo; podrían usarse para procesar lotes grandes o muchos escenarios en paralelo.
- Inferencia en CPU posible mediante PyTorch, aunque la latencia no está documentada.
- Despliegue previsto con PyTorch y torch-pointcloud. No se documenta exportación a ONNX, TensorRT, TorchScript ni otros runtimes.
- vLLM, llama.cpp, Ollama y TGI no aplican: son herramientas orientadas a modelos de lenguaje.
- No se publican datos de latencia, throughput ni memoria pico en producción.

## Comparativa con modelos similares

No se dispone de datos verificables de parámetros y métricas homogéneas para las alternativas en la información proporcionada. La comparación cuantitativa directa no es posible sin el mismo split, umbral IoU y protocolo de evaluación.

| Modelo | Parámetros | Contexto | KITTI | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| pointpillars.kitti.openpcdet | 4,84 M | No aplica | mAP 64,16; AP/Car 77,35; AP/Pedestrian 52,39; AP/Cyclist 62,74 (no verificado) | Apache-2.0 | Hugging Face |
| PointPillars original en OpenPCDet | No disponible | No aplica | No disponible en esta ficha | Apache-2.0 en el repositorio OpenPCDet | GitHub |
| SECOND en OpenPCDet | No disponible | No aplica | No disponible en esta ficha | Apache-2.0 en el repositorio OpenPCDet; verificar licencia del modelo | GitHub |
| CenterPoint en OpenPCDet | No disponible | No aplica | No disponible en esta ficha | Apache-2.0 en el repositorio OpenPCDet; verificar licencia del modelo | GitHub |

## Limitaciones y advertencias

- El modelo está entrenado únicamente con KITTI, un dataset con sensores, condiciones y clases concretas. No hay garantía de generalización a otros LiDAR, resoluciones, montajes o condiciones meteorológicas.
- Solo detecta tres clases: coche, peatón y ciclista. No realiza detección abierta, segmentación, tracking ni estimación de pose.
- La entrada se limita a cuatro canales (x, y, z, intensidad). No utiliza imagen RGB ni otros sensores, por lo que pierde información visual útil en escenas complejas.
- Las métricas declaradas no están verificadas y el protocolo de evaluación no está detallado. No deben compararse directamente con resultados publicados bajo otros umbrales IoU o splits.
- No se documenta un análisis de sesgos por género, edad, tipo de vehículo, hora del día o condiciones de iluminación. Como detector entrenado en KITTI, puede heredar los sesgos de ese dataset.
- En detección 3D no existe "alucinación" generativa, pero sí falsos positivos y falsos negativos. Los objetos pequeños, lejanos, ocluidos o con pocos puntos pueden detectarse con menor fiabilidad.
- La licencia Apache-2.0 permite uso comercial del modelo, pero el dataset KITTI y los componentes de OpenPCDet pueden tener términos adicionales que deben revisarse antes de producción.
- El repositorio registra 0 descargas y 0 likes, y no se documenta soporte activo. El tamaño reportado de 0,0 GB puede deberse al redondeo; los pesos reales son de escala MB.
- No se documentan los umbrales de NMS, la calibración, el preprocesado exacto ni las diferencias numéricas respecto al modelo original de OpenPCDet. Conviene validar la conversión con un conjunto propio antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointpillars.kitti.openpcdet
- Artículo de PointPillars: https://arxiv.org/abs/1812.05784
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud en Zenodo: https://doi.org/10.5281/zenodo.22159632
- Benchmark KITTI 3D object detection: https://www.cvlibs.net/datasets/kitti/eval_object.php?obj_benchmark=3d
- PyTorch: https://pytorch.org/
