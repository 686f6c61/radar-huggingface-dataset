# torch-pointcloud/pointnet2.scanobjectnn-hardest.openpoints

## Resumen

pointnet2.scanobjectnn-hardest.openpoints es un modelo de clasificación de nubes de puntos 3D publicado por el usuario torch-pointcloud en HuggingFace. Se trata de una implementación de PointNet++, la arquitectura de aprendizaje jerárquico de características sobre conjuntos de puntos desordenados propuesta por Qi et al. (NeurIPS 2017), entrenada sobre la partición más difícil del dataset ScanObjectNN (PB_T50_RS), que contiene objetos escaneados en entornos reales con oclusión, ruido y perturbaciones.

El modelo tiene 1.476.175 parámetros (aproximadamente 1,5 millones), recibe nubes de puntos con 4 canales de entrada y clasifica en 15 categorías de objeto. La cabeza de clasificación es sustituible: puede configurarse con `num_classes=0` para actuar como extractor de características y devolver embeddings de 1024 dimensiones, lo que lo hace reutilizable en tareas de recuperación, agrupamiento o transferencia a otros dominios.

Su relevancia es práctica más que de frontera: es un modelo ligero, con licencia MIT y pesos en safetensors, empaquetado para la librería torch-pointcloud con una API de creación de modelo en una sola llamada. Frente a los modelos de lenguaje, aquí no hay contexto, idiomas ni generación de texto; el problema que resuelve es la percepción 3D, y lo hace con un coste computacional mínimo, apto para CPU y GPUs de gama baja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (aprendizaje jerárquico de características sobre conjuntos de puntos, con capas de set abstraction) |
| Parametros totales | 1.476.175 (aproximadamente 1,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de nubes de puntos, no secuencial); el ejemplo de la model card usa 8192 puntos de entrada |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin variantes GGUF, INT8 ni otras) |
| Idiomas soportados | no aplica (modelo de visión/percepción 3D, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales declarados en la model card: canales de entrada 4, número de clases 15, dimensión de características 1024, librería `torch-pointcloud`, dataset ScanObjectNN (PB_T50_RS).

## Arquitectura y entrenamiento

La arquitectura es PointNet++ en su variante jerárquica: la nube de puntos se procesa mediante capas de *set abstraction* que muestrean y agrupan puntos de forma sucesiva, aplicando pequeñas PointNets locales para extraer características en cada nivel de la jerarquía. Esto permite capturar estructura local (vecindades) y componerla en representaciones globales, algo que la PointNet original no hacía de forma explícita. El modelo recibe 4 canales de entrada por punto y produce logits sobre 15 clases; la representación global antes de la cabeza tiene 1024 dimensiones.

Los pesos se han convertido desde el repositorio PointNeXt de Guochengqian (licencia MIT), que actúa como implementación de referencia. El entrenamiento se realizó sobre ScanObjectNN en la configuración PB_T50_RS, la partición considerada más difícil del benchmark por combinar perturbaciones de traslación, rotación y escalado además de la presencia de fondo y oclusión propios de escaneos reales. No se detalla en la información disponible el número de tokens/puntos vistos, la composición exacta del dataset, si hubo etapas de ajuste fino adicionales ni técnicas de regularización específicas. La model card cita un valor de referencia de 86,2 de OA para esta misma configuración, frente a los 86,16 obtenidos por estos pesos.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objeto de ScanObjectNN.
- Extracción de características: `forward_features()` devuelve embeddings; con `reset_classifier(num_classes=0)` la salida es un vector de 1024 dimensiones por muestra.
- Procesamiento por lotes mediante la utilidad `collate` de la librería, con seguimiento del índice de lote (`batch`) para agrupar puntos por muestra.
- Transformación de entrada integrada: el objeto `info["transform"]` devuelto por `create_model` aplica el preprocesado esperado por el modelo.
- Reutilización como extractor preentrenado para transferencia a otras taxonomías mediante sustitución de la cabeza de clasificación.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión 2D, audio ni capacidades multilingües: no son aplicables a este tipo de modelo.

## Casos de uso

- Pre-etiquetado de escaneos 3D en pipelines de percepción: dado un escaneo con LiDAR o escáner de profundidad, el modelo asigna una de las 15 clases a cada objeto segmentado, reduciendo el trabajo de anotación manual antes de un revisión humana.
- Robótica móvil y manipulación: clasificar el objeto que el robot tiene delante para decidir la pinza o la estrategia de agarre, aprovechando que el modelo cabe en CPU y no requiere una GPU dedicada en el robot.
- Búsqueda y recuperación de objetos 3D: usar los embeddings de 1024 dimensiones con `num_classes=0` para indexar un catálogo de modelos 3D o escaneos y resolver consultas por similitud vectorial.
- Control de calidad en fabricación: clasificar piezas escaneadas tras el proceso de producción para detectar piezas fuera de catálogo o mal formadas, integrándolo en una línea con captura 3D.
- Inventario automatizado en almacén: combinado con un escáner 3D, identificar la categoría de los bultos o productos apilados para conciliar existencias.
- Punto de partida para transferencia a dominio propio: congelar el extractor y entrenar una cabeza nueva sobre un dataset interno con distinta taxonomía, aprovechando que los pesos son ligeros y la licencia MIT no restringe el uso comercial.
- Anotación asistida en investigación en visión 3D: generar etiquetas preliminares sobre colecciones de escaneos para comparar variantes de arquitectura o construir subconjuntos de evaluación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos marcados como no verificados):

| Dataset | Tarea | Métrica | Valor | Verificado |
|---|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | Clasificación de nubes de puntos | OA (accuracy) | 86,16 | No |
| ScanObjectNN (PB_T50_RS) | Clasificación de nubes de puntos | mAcc (accuracy) | 84,36 | No |

La propia model card indica un valor de referencia de 86,2 de OA para esta configuración. No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo sobre ModelNet40, ShapeNet o particiones más sencillas de ScanObjectNN).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 6 MB en float32 (1,476 M de parámetros) y unos 3 MB en float16. El consumo real depende del número de puntos y del tamaño de lote, no del peso del modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas las de gama baja; una RTX 4090, A100 o H100 están sobradamente dimensionadas. El modelo también es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: PyTorch con la librería `torch-pointcloud` (`pip install torch-pointcloud`), que expone `create_model` con `pretrained=True`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. La exportación a ONNX o TorchScript no está documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnet2.scanobjectnn-hardest.openpoints | 1,5 M | nube de puntos (el ejemplo usa 8192 puntos) | Clasificación, 15 clases ScanObjectNN | MIT | HuggingFace, pesos safetensors |
| PointNet++ (implementación original) | no disponible en la información suministrada | nube de puntos | Clasificación de nubes de puntos | no disponible en la información suministrada | Repositorio original de los autores |
| PointNeXt (guochengqian) | no disponible en la información suministrada | nube de puntos | Clasificación y segmentación de nubes de puntos | MIT | GitHub; es el origen de la conversión de estos pesos |

No se dispone de cifras comparativas de rendimiento de las alternativas en la información proporcionada, más allá del valor de referencia de 86,2 de OA citado para la misma configuración.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre ScanObjectNN (PB_T50_RS), con 15 clases y objetos escaneados en interiores con perturbaciones; el rendimiento fuera de esa distribución no está documentado.
- Métricas no verificadas: los resultados de la model card están marcados como `verified: false` y no han sido reproducidos de forma independiente en la información disponible.
- Sesgos del dataset: las clases y la distribución de ScanObjectNN condicionan las predicciones; objetos poco representados o categorías ausentes del dataset no se reconocen correctamente.
- Confusión entre clases similares: al tratarse de una taxonomía de 15 categorías con objetos parcialmente ocluidos, es esperable confusión entre formas parecidas, sin que se publiquen matrices de confusión.
- Dependencia del preprocesado: el modelo espera una transformación concreta de la nube de puntos (4 canales de entrada); usar otra normalización o un número de puntos muy distinto al del ejemplo puede degradar los resultados.
- Riesgo de falsos positivos en producción: como cualquier clasificador cerrado, siempre asigna una de las 15 etiquetas, aunque la entrada no corresponda a ninguna clase conocida; conviene acompañarlo de un umbral de confianza o de detección de fuera de dominio.
- Licencia: MIT, permite uso comercial y modificación, pero conviene conservar la atribución al repositorio PointNeXt de origen y citar los trabajos de PointNet++ y ScanObjectNN.
- Madurez: el repositorio no registra descargas ni interacciones, y el tamaño del repo es 0,0 GB en la información consultada; no hay garantía de mantenimiento ni de soporte.
- Diferencias frente a modelos generativos: no procesa texto, no tiene ventana de contexto, no soporta instrucciones ni diálogo; cualquier expectativa derivada de modelos de lenguaje no aplica aquí.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/pointnet2.scanobjectnn-hardest.openpoints
- Paper de PointNet++: https://arxiv.org/abs/1706.02413
- Repositorio PointNeXt (origen de la conversión de pesos): https://github.com/guochengqian/PointNeXt
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
