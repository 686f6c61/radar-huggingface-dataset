# torch-pointcloud/pointgpt-b.scanobjectnn-objonly.guangyan-chen

## Resumen

PointGPT-b (ScanObjectNN OBJ_ONLY) es un modelo de clasificación de nubes de puntos 3D desarrollado por el autor Guangyan Chen y empaquetado por el proyecto torch-pointcloud para su uso con la librería `torch-pointcloud`. Se trata de un transformer con preentrenamiento generativo autorregresivo (PointGPT), adaptado mediante fine-tuning al conjunto de datos ScanObjectNN en su variante OBJ_ONLY, que contiene 15 clases de objetos escaneados en entornos reales sin fondo.

El modelo resuelve la tarea de clasificación de objetos a partir de nubes de puntos (típicamente 8192 puntos con coordenadas XYZ), un problema central en visión 3D con aplicaciones en robótica, conducción autónoma, realidad aumentada e inspección industrial. Con 120,4 millones de parámetros y una dimensión de características de 1536, se sitúa en la gama media de los clasificadores de nubes de puntos.

Su relevancia actual radica en que reproduce el enfoque PointGPT publicado en NeurIPS 2023 y lo distribuye en formato safetensors con una API unificada de PyTorch, lo que facilita la evaluación reproducible y la extracción de embeddings 3D sin necesidad de reimplementar el pipeline original. La licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) |
| Parametros totales | 120.394.095 (120,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; procesa nubes de puntos) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `torch-pointcloud`) |

Otros datos tecnicos: 15 clases de salida, 1536 dimensiones de caracteristica, tamano del repositorio 0,5 GB, tarea `point-cloud-classification`.

## Arquitectura y entrenamiento

PointGPT es un transformer que aplica el paradigma de preentrenamiento generativo autorregresivo, habitual en modelos de lenguaje, al dominio de las nubes de puntos. El modelo se preentrena prediciendo partes de la nube a partir de partes previas, lo que le permite aprender representaciones geometricas transferibles. La variante `pointgpt-b` corresponde al tamano base de la familia PointGPT, con 120,4 M de parametros y una cabeza de clasificacion sobre un vector de 1536 dimensiones.

El modelo aquí descrito parte del checkpoint `torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen` (preentrenamiento hibrido con etiquetas) y se ha ajustado finamente sobre ScanObjectNN en la variante OBJ_ONLY, que contiene únicamente objetos sin el fondo de la escena. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset mas alla de ScanObjectNN, ni sobre el uso de RLHF o DPO (tecnicas no aplicables a este dominio). El modelo fue convertido desde el repositorio original `CGuangyan-BIT/PointGPT` (MIT) al formato de la libreria `torch-pointcloud`.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 clases de objetos de ScanObjectNN (OBJ_ONLY).
- Extraccion de caracteristicas (embeddings) de 1536 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de muestras con 8192 puntos y coordenadas XYZ, con pipeline de transformacion y `collate` incluidos en la libreria.
- Inferencia por lotes (`batch`) sobre multiples nubes de puntos simultaneamente.
- Integracion nativa con PyTorch y con la API `create_model` de `torch-pointcloud`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo 3D.
- No dispone de modo thinking, vision 2D, audio ni generacion de texto.

## Casos de uso

- Clasificacion de objetos en escaneos 3D reales: el modelo etiqueta nubes de puntos de 8192 puntos en una de las 15 clases de ScanObjectNN, adecuado para pipelines de inventario o catalogacion de objetos capturados con sensores depth o LiDAR de corto alcance.
- Extraccion de embeddings para busqueda por similitud 3D: usando `forward_features` se obtienen vectores de 1536 dimensiones que pueden indexarse en una base vectorial para recuperacion de modelos 3D o deteccion de duplicados.
- Preetiquetado en anotacion de datasets 3D: el modelo puede generar etiquetas preliminares sobre nuevas capturas para reducir el coste de anotacion manual, que en dominios 3D es especialmente alto.
- Baselines en investigacion de vision 3D: al estar empaquetado con API reproducible y pesos safetensors, sirve como referencia para comparar arquitecturas de clasificacion de nubes de puntos.
- Percepcion en robotica de manipulacion: clasificar el objeto que el robot tiene frente a la camara depth antes de decidir una estrategia de agarre, aprovechando la invariancia del modelo a la ausencia de fondo (OBJ_ONLY).
- Control de calidad industrial: clasificacion de piezas escaneadas en 3D para detectar categorias erroneas o piezas no conformes en lineas de inspeccion.
- Destilacion o inicializacion de modelos mas pequenos: el backbone preentrenado puede servir de punto de partida para tareas 3D descendentes con pocos datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (OBJ_ONLY) | point-cloud-classification | OA (accuracy) | 95,18 |
| ScanObjectNN (OBJ_ONLY) | point-cloud-classification | mAcc (accuracy) | 94,91 |

No se han publicado en la informacion disponible resultados de otros benchmarks (por ejemplo ModelNet40, ShapeNet o ScanObjectNN en variantes PB_T50_RS) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 120,4 M de parametros en precision FP32, los pesos ocupan aproximadamente 0,48 GB; en FP16, unos 0,24 GB. Sumando activaciones para lotes pequenos, es razonable reservar entre 1 y 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes y el modelo no las saturara.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la via soportada es la libreria `torch-pointcloud` sobre PyTorch (`pip install torch-pointcloud`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Dataset | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pointgpt-b.scanobjectnn-objonly (este) | 120,4 M | 8192 puntos XYZ | ScanObjectNN OBJ_ONLY | OA 95,18 / mAcc 94,91 | MIT | Hugging Face, `torch-pointcloud` |
| pointgpt-b.scanobjectnn-objbg | no disponible | 8192 puntos XYZ | ScanObjectNN OBJ_BG | no disponible en la informacion | MIT | Hugging Face, `torch-pointcloud` |
| PointGPT original (CGuangyan-BIT) | familia b entre otras | no disponible | ScanObjectNN y otros | no disponible en la informacion | MIT | GitHub |
| Otros clasificadores 3D (PointNet++, DGCNN, PointNeXt) | no disponible | no disponible | ScanObjectNN | no disponible en la informacion | variable | multiples repositorios |

La comparacion cuantitativa con arquitecturas alternativas no puede completarse con los datos disponibles; solo se confirma la existencia de la variante OBJ_BG del mismo modelo base.

## Limitaciones y advertencias

- Dominio restringido: el modelo solo clasifica las 15 clases de ScanObjectNN y fue ajustado en la variante OBJ_ONLY, por lo que su rendimiento puede degradarse ante nubes de puntos con fondo, oclusiones o clases fuera del conjunto.
- Entrada fija en la practica: el ejemplo de uso asume 8192 puntos; no se documenta el comportamiento con otras densidades ni con nubes sin remuestreo.
- Resultados no verificados: las metricas OA y mAcc del model-index figuran con `verified: false` y proceden del propio autor.
- Riesgo de sobreajuste al benchmark: al ser un fine-tuning sobre un dataset de evaluacion ampliamente usado, las cifras pueden no trasladarse a capturas reales de produccion.
- Sesgos: no se documentan analisis de sesgo por clase, sensor o geometria; es esperable un rendimiento desigual entre categorias con menos muestras o mayor variabilidad intra-clase.
- Alucinacion en el sentido generativo: aunque el backbone se preentrena de forma autorregresiva, la cabeza de clasificacion siempre emite una de las 15 clases, sin mecanismo de absteccion ni puntuacion de confianza calibrada documentada.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia: MIT, permite uso comercial y modificacion con atribucion; conviene conservar los avisos de copyright del repositorio original y de la libreria.
- Produccion: requiere gestionar el preprocesado (transformacion y `collate`) de forma consistente con el entrenamiento; no se documentan versiones cuantizadas ni optimizaciones de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.scanobjectnn-objonly.guangyan-chen
- Variante OBJ_BG: https://huggingface.co/torch-pointcloud/pointgpt-b.scanobjectnn-objbg.guangyan-chen
- Checkpoint base: https://huggingface.co/torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen
- Paper PointGPT (arXiv 2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
