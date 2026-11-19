# torch-pointcloud/pointgpt-l.scanobjectnn-hardest.guangyan-chen

## Resumen

PointGPT-L es un modelo de clasificación de nubes de puntos 3D basado en un transformer con preentrenamiento generativo autorregresivo. Lo desarrolla el grupo de Guangyan Chen (BIT) y esta variante concreta ha sido convertida y publicada por el proyecto `torch-pointcloud` de Arthur Dujardin, que la distribuye con pesos en formato safetensors y una API de carga directa. El modelo parte del checkpoint base `pointgpt-l.labeled-hybrid.guangyan-chen`, preentrenado de forma autorregresiva sobre nubes de puntos, y se ha afinado para la partición más difícil del benchmark ScanObjectNN (PB_T50_RS), con 15 clases de objetos escaneados en entornos reales.

El problema que resuelve es la clasificación de objetos 3D a partir de nubes de puntos dispersas, ruidosas y parciales, un escenario típico en robótica, conducción autónoma y digitalización de interiores. Frente a los enfoques que operan sobre mallas o vistas múltiples, PointGPT trabaja directamente sobre coordenadas XYZ, lo que simplifica el pipeline y reduce el coste de preprocesado. Con 360,4 millones de parámetros y 2048 dimensiones de característica, se sitúa en la gama alta de los clasificadores de nubes de puntos.

Su relevancia actual radica en dos factores: por un lado, ofrece un rendimiento declarado de 93,72 % de accuracy global (OA) y 93,61 % de accuracy media por clase (mAcc) en la variante hardest de ScanObjectNN, una de las particiones más exigentes del benchmark; por otro, su empaquetado como modelo de la librería `torch-pointcloud` facilita la integración en código PyTorch con pocas líneas, algo poco habitual en los checkpoints de investigación de este dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) |
| Parametros totales | 360.365.935 (360,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 15 |
| Dimension de caracteristica | 2048 |
| Dataset de evaluacion | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer que aplica el paradigma de preentrenamiento generativo autorregresivo, popularizado en el ámbito del lenguaje, al dominio de las nubes de puntos. La idea central del paper (arXiv:2305.11487, NeurIPS 2023) es dividir la nube de puntos en parches y entrenar al modelo para predecir parches futuros a partir de los anteriores, de forma análoga a un modelo de lenguaje que predice el siguiente token. Este preentrenamiento se realiza sobre el checkpoint `labeled-hybrid`, que combina datos etiquetados y no etiquetados para aprender representaciones geométricas transferibles.

Sobre esa base, esta variante se ha afinado de forma supervisada para clasificación en ScanObjectNN, un dataset de objetos escaneados en interiores reales con oclusión, ruido de sensor y fondo. La partición PB_T50_RS es la configuración más difícil del benchmark: los objetos se perturban con traslaciones y rotaciones aleatorias, lo que impide que el modelo se apoye en la orientación canónica. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; en un modelo de visión 3D estos últimos no resultan aplicables. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal en esta variante concreta.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos (ScanObjectNN).
- Extracción de características: `forward_features` devuelve embeddings de 2048 dimensiones por muestra, útiles para tareas downstream.
- Clasificación con cabecera intercambiable: `reset_classifier(num_classes=N)` permite adaptar el modelo a otros conjuntos de clases mediante fine-tuning.
- Procesamiento de nubes de puntos de distinto tamaño: la API acepta tensores de coordenadas `pos` con dimensión de lote (`batch`), por lo que admite lotes heterogéneos.
- Integración nativa con PyTorch y con la librería `torch-pointcloud`, incluyendo pipeline de transformación y `collate` propios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión 2D, audio ni modo de pensamiento: es un clasificador 3D puro.

## Casos de uso

- Clasificación de objetos en robótica móvil: el modelo recibe la nube de puntos de un sensor LiDAR o RGB-D y devuelve la clase del objeto dominante, lo que permite a un robot manipular o evitar obstáculos según su categoría. Es adecuado por su robustez frente a oclusiones, demostrada en la partición más difícil de ScanObjectNN.
- Inventario y digitalización de interiores: a partir de escaneos 3D de una habitación segmentada en instancias, el modelo etiqueta cada objeto (silla, mesa, sofá, etc.), lo que acelera la generación de inventarios en arquitectura, inmobiliaria o gestión de activos.
- Preetiquetado en pipelines de anotación 3D: los embeddings de 2048 dimensiones sirven como representación para clustering o clasificación semiautomática, reduciendo el coste de anotación manual en datasets de nubes de puntos.
- Conducción autónoma y percepción vehicular: clasificación de objetos detectados por LiDAR en escenas urbanas, como paso previo a la toma de decisiones. El modelo trabaja directamente sobre coordenadas XYZ, sin necesidad de proyección a imágenes.
- Control de calidad industrial: inspección de piezas mediante escaneo 3D, clasificando la pieza escaneada contra un catálogo de 15 categorías conocidas o reentrenando la cabecera para el catálogo específico de la fábrica.
- Extracción de características para búsqueda de similitud 3D: los embeddings permiten construir índices vectoriales para recuperar objetos geométricamente similares en catálogos de productos o bases de datos de modelos 3D.
- Investigación en representación 3D: como baseline reproducible para comparar técnicas de preentrenamiento autorregresivo frente a enfoques contrastivos o basados en vistas múltiples.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Particion | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN | PB_T50_RS (hardest) | OA (accuracy global) | 93,72 |
| ScanObjectNN | PB_T50_RS (hardest) | mAcc (accuracy media por clase) | 93,61 |

La información proporcionada no incluye resultados en otros benchmarks (ModelNet40, ShapeNet, etc.) ni comparaciones numéricas con modelos alternativos. No se han publicado en la información disponible resultados adicionales a los de la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: con 360,4 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,4 GB; en FP16, unos 0,72 GB. A ello hay que sumar activaciones y la nube de puntos de entrada (el ejemplo usa 8192 puntos), por lo que un presupuesto de 3-4 GB en FP32 y 2-3 GB en FP16 es razonable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente para inferencia; para entrenamiento o fine-tuning se recomienda RTX 4090, A100 o H100, especialmente con lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 6 GB en adelante), dado el tamaño contenido del modelo.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión 3D. Para servir el modelo en producción sería necesario envolverlo en un servicio propio (por ejemplo, FastAPI con TorchScript o ONNX).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | OA en ScanObjectNN PB_T50_RS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-L (este) | 360,4 M | Nubes de puntos, 8192 puntos en el ejemplo | 93,72 (declarado) | MIT | Hugging Face, safetensors |
| PointGPT-S / PointGPT-B | no disponible en la informacion | Nubes de puntos | no disponible en la informacion | MIT (repo original) | GitHub CGuangyan-BIT/PointGPT |
| Point-MAE | no disponible en la informacion | Nubes de puntos | no disponible en la informacion | MIT (repo original) | GitHub |
| PointNet++ | no disponible en la informacion | Nubes de puntos | no disponible en la informacion | MIT (repo original) | GitHub |

La información proporcionada solo incluye datos de este checkpoint; no se dispone de cifras verificadas de los modelos alternativos en la información disponible, por lo que la comparativa numérica queda limitada al resultado declarado de PointGPT-L.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado y evaluado en ScanObjectNN, un dataset de interiores con 15 clases. El rendimiento puede degradarse notablemente en escenas exteriores, vehículos, vegetación o categorías no representadas.
- Riesgo de sobreajuste al benchmark: la partición PB_T50_RS aplica perturbaciones controladas; el rendimiento en nubes de puntos reales con ruido de sensor distinto al del dataset puede ser inferior al 93,72 % declarado.
- Métricas no verificadas: los valores de OA y mAcc están marcados como `verified: false` en el model-index. No hay evaluación independiente publicada en la información disponible.
- Clases fijas: la cabecera de clasificación está limitada a 15 clases; cualquier otro uso requiere reentrenar la cabecera con datos propios.
- Sin soporte de texto ni multimodalidad: no procesa instrucciones en lenguaje natural ni imágenes 2D; no es un modelo de propósito general.
- Sin cuantizaciones publicadas: no se dispone de versiones GGUF, ONNX ni INT8 en el repositorio, lo que limita el despliegue en entornos con requisitos estrictos de memoria o latencia.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las licencias del dataset ScanObjectNN y del código original de PointGPT por si imponen restricciones adicionales sobre los pesos derivados.
- Documentación escasa: la model card no detalla el proceso de conversión, la composición exacta del dataset de fine-tuning ni los hiperparámetros empleados, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.scanobjectnn-hardest.guangyan-chen
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Paper ScanObjectNN (ICCV 2019): no disponible como enlace directo en la informacion proporcionada
