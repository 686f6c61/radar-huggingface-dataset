# torch-pointcloud/groupfree3d-l6-o256.scannet.ze-liu

## Resumen

Group-Free 3D es un detector de objetos 3D para nubes de puntos desarrollado originalmente por Ze Liu, Zheng Zhang, Yue Cao, Han Hu y Xin Tong (Microsoft Research Asia) y publicado en ICCV 2021. Esta ficha concreta corresponde a la conversión del checkpoint oficial `zeliu98/Group-Free-3D` al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, con pesos en safetensors y un total de 14.495.937 parámetros.

El modelo aborda la detección de objetos 3D en escenas interiores a partir de nubes de puntos anotadas con el dataset ScanNet, prediciendo cajas 3D y clases para 18 categorías de objetos. Su innovación principal es sustituir los mecanismos clásicos de agrupación de votos (vote clustering) por un decoder transformer que razona directamente sobre un conjunto de candidatos a objeto muestreados, evitando heurísticas manuales como NMS o agrupamiento por distancia.

Es relevante para desarrolladores e investigadores que trabajan en percepción 3D, robótica de interiores, realidad aumentada o análisis de escenas, porque ofrece una implementación limpia y empaquetada en PyTorch con API de alto nivel (`tp.create_model`), pesos ligeros (0,1 GB) y licencia MIT, lo que facilita su integración y reproducción frente a los repositorios de investigación originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer detector sobre candidatos a objeto (Group-Free 3D) |
| Parámetros totales | 14.495.937 (14,5 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre nubes de puntos de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantización | No disponible (pesos en safetensors, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | No disponible (modelo de visión 3D, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases | 18 (ScanNet) |
| Dimensión de features | 288 |
| Dataset de entrenamiento | ScanNet |

## Arquitectura y entrenamiento

Group-Free 3D es un detector de objetos 3D basado en transformer que opera sobre nubes de puntos. En lugar de generar propuestas mediante votación y agruparlas con heurísticas, el modelo muestrea un conjunto de candidatos a objeto (object candidates) a partir de las features de los puntos y aplica un decoder transformer iterativo que refina las cajas y las clases mediante self-attention entre candidatos y cross-attention con la nube de puntos. La variante `l6-o256` indica 6 capas en el decoder y 256 candidatos a objeto, con una dimensión de features de 288.

El entrenamiento se realiza sobre ScanNet, un dataset de reconstrucciones 3D de escenas interiores con anotaciones de 18 clases de objetos. La model card no detalla el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de refuerzo o preferencias (no aplicables en este dominio). La conversión a `torch-pointcloud` mantiene la arquitectura y los pesos del repositorio original `zeliu98/Group-Free-3D` bajo licencia MIT, y expone tanto la inferencia completa (`model.forward`) como la extracción de features (`model.forward_features`) con 288 canales.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores: predice cajas 3D (centro, dimensiones, orientación) y etiquetas de clase para 18 categorías de ScanNet.
- Procesamiento de nubes de puntos con posición (xyz), color y normales como entradas, según el ejemplo de uso de la model card.
- Extracción de features por punto de 288 canales mediante `forward_features`, útil para tareas downstream como segmentación o clasificación.
- Razonamiento sobre candidatos a objeto mediante atención transformer, sin NMS ni agrupamiento de votos explícito.
- No soporta tool calling, function calling, agentes, razonamiento multi-step en lenguaje natural ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción en robótica de interiores: el modelo puede detectar sillas, mesas, puertas y otros 18 tipos de objetos en nubes de puntos captadas por sensores RGB-D o LiDAR, proporcionando cajas 3D para planificación de navegación y manipulación.
- Reconstrucción semántica de escenas: integrado en pipelines de escaneo 3D (por ejemplo, con datos de ScanNet o capturas propias), permite etiquetar objetos y generar mapas semánticos de interiores para gemelos digitales.
- Realidad aumentada: la detección de objetos 3D en tiempo de ejecución permite anclar contenido virtual sobre objetos reales identificados en la escena, aprovechando el reducido tamaño del modelo (14,5 M de parámetros).
- Análisis de inventario y auditoría de espacios: en entornos como oficinas, almacenes o viviendas, el modelo puede contar y localizar objetos de las 18 clases de ScanNet a partir de escaneos 3D.
- Investigación en detección 3D: sirve como baseline reproducible con pesos en safetensors y API de alto nivel para comparar arquitecturas transformer frente a enfoques basados en votación.
- Extracción de features para modelos downstream: los 288 canales por punto pueden alimentar clasificadores o segmentadores específicos de dominio, reutilizando el backbone preentrenado en ScanNet.
- Preprocesado en pipelines de datos 3D: la API `torch-pointcloud` permite integrar el modelo en flujos de PyTorch con `collate` y transformaciones estandarizadas, facilitando el entrenamiento y la evaluación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| ScanNet (3D object detection) | mAP@0.25 | 66,43 |
| ScanNet (3D object detection) | mAP@0.5 | 47,91 |

No se han proporcionado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 14,5 M de parámetros y pesos en safetensors (repo de 0,1 GB), la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende del tamaño de la nube de puntos (el ejemplo usa 8192 puntos) y del número de candidatos (256).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4-8 GB de VRAM para el ejemplo de 8192 puntos; A100, H100 o RTX 4090 no son necesarias para este tamaño de modelo, pero pueden acelerar el procesamiento por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se dispone de mediciones oficiales de VRAM pico.
- Opciones de despliegue: la librería `torch-pointcloud` sobre PyTorch es la vía documentada (`pip install torch-pointcloud`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP@0.25 (ScanNet) | mAP@0.5 (ScanNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| groupfree3d-l6-o256.scannet.ze-liu | 14,5 M | Nube de puntos (8192 puntos en ejemplo) | 66,43 | 47,91 | MIT | Hugging Face (torch-pointcloud) |
| Group-Free 3D original (zeliu98) | No disponible | Nube de puntos | No disponible en esta ficha | No disponible en esta ficha | MIT | GitHub |
| Otros detectores 3D en torch-pointcloud | No disponible | Nube de puntos | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente en ScanNet: el dominio son escenas interiores con 18 clases; el rendimiento puede degradarse en exteriores, objetos no contemplados o sensores distintos.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden del autor del modelo.
- Riesgo de falsos positivos y negativos en escenas con oclusión, objetos pequeños o nubes de puntos dispersas; no se documentan análisis de robustez.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni capacidades multilingües.
- Sesgos conocidos: no documentados en la model card; cabe esperar los sesgos del dataset ScanNet (entornos interiores mayoritariamente occidentales y de oficina/hogar).
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales y a la conversión.
- Para producción, conviene validar el preprocesado (`info["transform"]` y `collate`) y el rango de valores de color (0-255 en el ejemplo) para evitar discrepancias con los datos de entrenamiento.
- El repositorio tiene un tamaño de 0,1 GB y 21 descargas, lo que sugiere una adopción limitada; no hay garantías de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/groupfree3d-l6-o256.scannet.ze-liu
- Paper Group-Free 3D: https://arxiv.org/abs/2104.00678
- Repositorio original: https://github.com/zeliu98/Group-Free-3D
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ScanNet (paper): https://arxiv.org/abs/1702.04405 (referencia CVPR 2017 citada en la model card)
