# torch-pointcloud/pointgpt-b.scanobjectnn-objbg.guangyan-chen

## Resumen

PointGPT-B (ScanObjectNN OBJ_BG) es un modelo de clasificación de nubes de puntos 3D desarrollado por el autor Guangyan Chen (publicado bajo la organización `torch-pointcloud` en Hugging Face) y derivado del trabajo de investigación PointGPT, presentado en NeurIPS 2023. Se trata de un transformer con preentrenamiento generativo autorregresivo sobre nubes de puntos, afinado específicamente para la tarea de clasificación de objetos escaneados en el conjunto de datos ScanObjectNN, en su variante OBJ_BG (objetos con fondo).

El modelo resuelve el problema de clasificar objetos 3D a partir de nubes de puntos desordenadas y dispersas, un escenario característico de datos capturados con sensores reales (LiDAR, RGB-D). Con 120,4 millones de parámetros y un extractor de características de 1536 dimensiones, se posiciona como un modelo de tamaño medio dentro de la familia PointGPT, ofreciendo un equilibrio entre precisión y coste computacional.

Su relevancia actual radica en que traslada los avances del preentrenamiento generativo autorregresivo, habitual en el dominio del lenguaje, al dominio de las nubes de puntos, y lo empaqueta en la librería `torch-pointcloud` con una API de carga sencilla. Esto facilita su uso como extractor de características o como clasificador listo para producción en pipelines de visión 3D, sin necesidad de reimplementar el preprocesamiento ni la arquitectura original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT), backbone de extracción de puntos |
| Parametros totales | 120.394.095 (120,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos; el ejemplo de uso emplea 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; procesa geometría 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 15 (ScanObjectNN) |
| Dimensión de características | 1536 |
| Dataset de evaluación | ScanObjectNN (OBJ_BG) |
| Modelo base | torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen |
| Librería | torch-pointcloud |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer diseñado para nubes de puntos que aplica un esquema de preentrenamiento generativo autorregresivo, análogo al de los modelos de lenguaje: el modelo aprende a predecir partes de la nube de puntos a partir de las partes ya observadas. Este enfoque, descrito en el artículo *PointGPT: Auto-regressively Generative Pre-training from Point Clouds* (Chen et al., NeurIPS 2023), permite aprovechar grandes volúmenes de datos 3D sin etiquetar antes del ajuste fino supervisado.

El modelo parte de un checkpoint base (`pointgpt-b.labeled-hybrid.guangyan-chen`) y se afina sobre ScanObjectNN en la variante OBJ_BG, que incluye objetos escaneados con fondo, una configuración más realista y difícil que la variante OBJ_ONLY. La información disponible no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset más allá de ScanObjectNN; tampoco se especifica si se emplearon técnicas de RLHF o DPO, algo poco habitual en el dominio de visión 3D. La innovación principal reside en el preentrenamiento autorregresivo sobre puntos y en la conversión del modelo original a la librería `torch-pointcloud`, que estandariza la interfaz de inferencia y extracción de características.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos (ScanObjectNN).
- Extracción de características o embeddings de 1536 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos desordenadas con coordenadas `pos` (x, y, z) y soporte de batching mediante `collate`.
- Manejo de muestras con fondo (variante OBJ_BG), lo que mejora la robustez frente a escenas reales.
- Integración con PyTorch y la librería `torch-pointcloud` mediante `tp.create_model(..., pretrained=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente geométrico y discriminativo.

## Casos de uso

- Clasificación de objetos en escenas escaneadas con LiDAR o cámaras RGB-D: el modelo recibe la nube de puntos y devuelve logits sobre 15 clases, adecuado para inventario o catalogación automática de objetos en entornos reales.
- Extracción de embeddings para búsqueda por similitud 3D: usando `forward_features` se obtienen vectores de 1536 dimensiones que pueden indexarse en un motor vectorial para recuperación de modelos 3D similares.
- Preetiquetado en pipelines de anotación: el clasificador puede generar etiquetas preliminares sobre grandes volúmenes de escaneos, reduciendo el coste de anotación manual antes de la revisión humana.
- Robótica móvil y manipulación: integrado en el bucle de percepción, permite reconocer la categoría del objeto a manipular a partir de la nube de puntos capturada por el sensor del robot.
- Control de calidad industrial: clasificación de piezas escaneadas en línea de producción para detectar categorías o elementos fuera de inventario.
- Vehículos autónomos y sistemas ADAS: como componente de percepción para clasificar objetos detectados en la nube de puntos del LiDAR, con la ventaja de haber sido entrenado en la variante con fondo (OBJ_BG), más cercana a escenas reales.
- Investigación en visión 3D: modelo de referencia para comparar arquitecturas de preentrenamiento autorregresivo sobre nubes de puntos, con métricas publicadas en ScanObjectNN.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| ScanObjectNN (OBJ_BG) | OA (overall accuracy) | 97,07 |
| ScanObjectNN (OBJ_BG) | mAcc (mean accuracy) | 96,19 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card; los valores anteriores corresponden únicamente a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 120,4 M de parámetros (aproximadamente 0,48 GB en FP32 y 0,24 GB en FP16), por lo que la carga de pesos es muy ligera; el consumo real dependerá del tamaño del batch y del número de puntos por muestra.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en FP32 con batches moderados; se recomienda una RTX 3060/4060 o superior para uso cómodo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en GPUs de gama de entrada con VRAM suficiente.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este dominio); el despliegue se realiza mediante PyTorch y la librería `torch-pointcloud` (`pip install torch-pointcloud`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión (ScanObjectNN OBJ_BG, OA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-b.scanobjectnn-objbg (este) | 120,4 M | Nubes de puntos (ejemplo: 8192 puntos) | 97,07 | MIT | Hugging Face (`torch-pointcloud`) |
| pointgpt-b.scanobjectnn-objonly | no disponible | Nubes de puntos | no disponible en la información | MIT | Hugging Face (`torch-pointcloud`) |
| PointGPT original (CGuangyan-BIT) | no disponible | Nubes de puntos | no disponible en la información | MIT | GitHub |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda limitada al valor declarado para este checkpoint.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de nubes de puntos 3D; no procesa texto, imágenes ni audio, y no dispone de capacidades generativas de lenguaje.
- Entrenado sobre ScanObjectNN con 15 clases; su uso fuera de ese vocabulario requerirá reentrenamiento o ajuste fino de la cabeza de clasificación.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de degradación ante distribuciones de puntos muy distintas a las de ScanObjectNN (densidad, ruido de sensor, oclusiones severas), así como ante objetos no representados en el conjunto de entrenamiento.
- No se documentan análisis de sesgos ni evaluaciones de robustez frente a dominios fuera de distribución.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset ScanObjectNN para cumplir con sus respectivas licencias.
- La información sobre cuantizaciones, latencia y requisitos exactos de memoria es limitada; en producción conviene medir el rendimiento con el tamaño de nube de puntos real del caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.scanobjectnn-objbg.guangyan-chen
- Variante OBJ_ONLY: https://huggingface.co/torch-pointcloud/pointgpt-b.scanobjectnn-objonly.guangyan-chen
- Artículo PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
