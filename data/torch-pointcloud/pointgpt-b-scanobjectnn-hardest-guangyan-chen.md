# torch-pointcloud/pointgpt-b.scanobjectnn-hardest.guangyan-chen

## Resumen

PointGPT-b es un modelo de clasificación de nubes de puntos 3D basado en la arquitectura PointGPT, un transformer con preentrenamiento generativo autorregresivo presentado en el artículo "PointGPT: Auto-regressively Generative Pre-training from Point Clouds" (NeurIPS 2023). Esta variante concreta, publicada por el repositorio `torch-pointcloud` de Arthur Dujardin, es un ajuste fino (fine-tuning) del checkpoint base `pointgpt-b.labeled-hybrid` sobre el split más difícil del dataset ScanObjectNN (PB_T50_RS), que simula condiciones del mundo real con oclusión, ruido y perturbaciones de fondo.

El modelo cuenta con 120,4 millones de parámetros, una dimensión de características de 1536 y una cabeza de clasificación de 15 clases. Está empaquetado en formato safetensors y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en que ofrece un checkpoint listo para usar dentro de la librería `torch-pointcloud`, evitando al desarrollador tener que reproducir el pipeline de entrenamiento original del repositorio de referencia.

A diferencia de los modelos de lenguaje, PointGPT opera sobre coordenadas 3D (nubes de puntos), por lo que su aplicación se centra en visión por computador 3D, robótica, conducción autónoma y análisis de escenas. El modelo acepta muestras de hasta 8192 puntos y devuelve logits por clase o embeddings de 1536 dimensiones para tareas de recuperación o downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) |
| Parametros totales | 120.394.095 (120,4 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de hasta 8192 puntos por muestra (según ejemplo de la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, precisión original del checkpoint) |
| Idiomas soportados | No aplica (modelo de nubes de puntos, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 1536 |
| Numero de clases | 15 |
| Dataset de evaluacion | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer que aplica el paradigma de preentrenamiento generativo autorregresivo, popularizado por GPT en texto, al dominio de las nubes de puntos. La idea central del artículo es dividir la nube de puntos en parches (patches) y entrenar al modelo para predecir el siguiente parche a partir de los anteriores, lo que fuerza al encoder a aprender representaciones geométricas locales y globales de forma autosupervisada. Esta variante `b` corresponde a la configuración base del modelo, con 120,4 M de parámetros y 1536 dimensiones de característica.

El checkpoint publicado es el resultado de un ajuste fino supervisado desde `torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen` sobre el split PB_T50_RS de ScanObjectNN, que es la variante "hardest" del dataset: los objetos aparecen con perturbaciones de traslación, rotación y escalado, además de fondos reales y oclusiones. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el modelo sigue el diseño estándar de PointGPT descrito en el paper.

La conversión desde el repositorio original `CGuangyan-BIT/PointGPT` (también MIT) la realiza la librería `torch-pointcloud`, que estandariza la carga, el preprocesado y la inferencia. El pipeline de datos se gestiona mediante `info["transform"]` y `collate`, y el forward acepta las claves `x`, `pos` y `batch`.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos (el dataset ScanObjectNN incluye clases como silla, mesa, sofá, cama, estantería, etc.).
- Extracción de características: `forward_features` devuelve embeddings de 1536 dimensiones por muestra, útiles para recuperación, clustering o modelos downstream.
- Robustez ante condiciones del mundo real: entrenado y evaluado en PB_T50_RS, con oclusión, ruido y fondos perturbados.
- Inferencia por lotes mediante el parámetro `batch`, que permite procesar múltiples nubes de puntos en una sola pasada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Clasificación de objetos en robótica móvil: el modelo recibe la nube de puntos de una cámara de profundidad o LiDAR y devuelve la categoría del objeto detectado, lo que permite a un robot manipular o evitar obstáculos según la clase identificada.
- Inventario automatizado en almacenes: integrado en un pipeline de escaneo 3D, clasifica los objetos sobre una cinta o estantería para actualizar el stock sin intervención manual, aprovechando su robustez a oclusiones parciales.
- Segmentación semántica asistida en conducción autónoma: los embeddings de 1536 dimensiones pueden alimentar un cabezal de segmentación o detección posterior para distinguir peatones, vehículos y mobiliario urbano en escenas LiDAR.
- Análisis de escenas de interior para realidad aumentada: clasificar muebles y estructuras a partir de un escaneo con smartphone o tablet permite anclar contenido virtual sobre objetos reales con conocimiento de su categoría.
- Control de calidad en fabricación aditiva: comparar la nube de puntos de una pieza impresa en 3D con la geometría esperada y usar la clasificación para detectar desviaciones o piezas defectuosas en la línea de producción.
- Recuperación de modelos 3D por similitud: usando `forward_features` como descriptor, construir un índice vectorial de embeddings de 1536 dimensiones para buscar objetos 3D similares en un catálogo, con aplicación en comercio electrónico o archivos patrimoniales.
- Preentrenamiento de modelos downstream: congelar el encoder y entrenar una cabeza ligera para una tarea específica (detección de grietas, clasificación de materiales) cuando no se dispone de datos etiquetados suficientes para entrenar desde cero.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | Clasificación de nubes de puntos | OA (Overall Accuracy) | 91,92 |
| ScanObjectNN (PB_T50_RS) | Clasificación de nubes de puntos | mAcc (mean Accuracy) | 90,80 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no opera sobre texto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 120,4 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 0,48 GB; en FP16, unos 0,24 GB. Sumando activaciones y el lote de 8192 puntos, una GPU con 4-6 GB de VRAM es suficiente para lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM. Una RTX 3060, RTX 4060 o RTX 4090 es suficiente para inferencia; para entrenamiento o fine-tuning se recomienda A100, H100 o RTX 4090 con 24 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos de lenguaje y no aplican a este dominio.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware, del tamaño de lote y del número de puntos por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | OA en ScanObjectNN PB_T50_RS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-b.scanobjectnn-hardest (este modelo) | 120,4 M | Hasta 8192 puntos | 91,92 (declarado) | MIT | Hugging Face, safetensors |
| pointgpt-b.scanobjectnn-objbg | No disponible | No disponible | No disponible en la información | MIT | Hugging Face |
| PointGPT original (CGuangyan-BIT) | Configuraciones b y l | No disponible | Resultados en el paper (no citados aquí) | MIT | GitHub |
| Otros modelos de clasificación 3D (PointNet++, DGCNN, Point Transformer) | No disponible | No disponible | No disponible en la información | Varía | Varía |

La información disponible no permite una comparación cuantitativa fiable con alternativas como PointNet++ o Point Transformer, por lo que los datos de esas filas se marcan como no disponibles.

## Limitaciones y advertencias

- Dominio restringido: solo clasifica nubes de puntos en las 15 clases de ScanObjectNN; no es un modelo generalista ni un modelo de lenguaje.
- Sesgos del dataset: ScanObjectNN contiene objetos de interior escaneados en condiciones controladas; el rendimiento puede degradarse en escenas exteriores, objetos a gran escala o geometrías muy distintas a las del entrenamiento.
- Riesgo de alucinación: en clasificación, se traduce en predicciones erróneas con alta confianza; no hay mecanismo de abstención documentado.
- Sin verificación independiente: los valores de OA y mAcc son declarados por el autor y están marcados como `verified: false` en el model-index.
- Limitación de entrada: el ejemplo de la model card usa 8192 puntos; no se documenta el comportamiento con nubes de puntos de mayor densidad ni el remuestreo aplicado.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright; conviene revisar también las licencias del dataset ScanObjectNN y del código original de PointGPT.
- Sin soporte documentado para cuantización: al ser un modelo pequeño, la cuantización no es crítica, pero no hay versiones GGUF ni ONNX publicadas.
- Repositorio de bajo uso (20 descargas, 0 likes): no hay evidencia de validación por parte de la comunidad ni de informes de errores.
- Idiomas: no aplica, pero conviene no confundirlo con un modelo multimodal texto-3D; no procesa instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.scanobjectnn-hardest.guangyan-chen
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen
- Variante objbg: https://huggingface.co/torch-pointcloud/pointgpt-b.scanobjectnn-objbg.guangyan-chen
- Colección PointGPT en Hugging Face: https://huggingface.co/collections/torch-pointcloud/pointgpt
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
