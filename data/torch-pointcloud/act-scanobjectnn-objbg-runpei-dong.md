# torch-pointcloud/act.scanobjectnn-objbg.runpei-dong

## Resumen

ACT (Autoencoder as Cross-Modal Teacher) es un modelo de clasificación de nubes de puntos 3D desarrollado por Runpei Dong y colaboradores (ICLR 2023). La variante aquí publicada, `act.scanobjectnn-objbg.runpei-dong`, ha sido convertida al formato de la librería `torch-pointcloud` por el autor Arthur Dujardin y está especializada en la clasificación de objetos 3D del dataset ScanObjectNN, concretamente en la partición OBJ_BG (objetos con fondo). El modelo parte de un checkpoint preentrenado (`act.pretrain.runpei-dong`) y se ha afinado para una tarea de clasificación de 15 clases.

La relevancia de ACT radica en su enfoque de destilación cross-modal: utiliza un transformer de imágenes 2D preentrenado como profesor para guiar el aprendizaje de representaciones en 3D mediante un autoencoder enmascarado. Esto permite transferir conocimiento visual 2D al dominio de nubes de puntos sin necesidad de anotaciones 3D masivas. El modelo resultante es compacto (22,1 millones de parámetros) y adecuado para tareas de percepción 3D en robótica, conducción autónoma o realidad aumentada.

Con 768 dimensiones de características y una ventana de entrada de 8192 puntos, este checkpoint está pensado para inferencia y extracción de embeddings en pipelines de visión 3D, no para generación de texto ni tareas de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked point transformer (ACT), destilado de un transformer de imágenes 2D |
| Parametros totales | 22.095.631 (22,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer enmascarado aplicado a nubes de puntos. La innovación principal del trabajo original es el uso de un autoencoder como profesor cross-modal: un transformer de imágenes 2D preentrenado (tipo ViT) se utiliza para destilar representaciones sobre nubes de puntos 3D, aprovechando que ambos dominios comparten estructuras semánticas. El modelo genera embeddings de 768 dimensiones por muestra y clasifica en 15 clases.

El checkpoint aquí publicado se ha afinado sobre ScanObjectNN en la variante OBJ_BG, que contiene objetos escaneados del mundo real con fondo. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). La conversión al formato `torch-pointcloud` la realizó Arthur Dujardin a partir del repositorio original `RunpeiDong/ACT`.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos del mundo real (ScanObjectNN).
- Extracción de características: genera embeddings de 768 dimensiones por muestra mediante `forward_features`.
- Procesamiento de muestras con 8192 puntos y coordenadas 3D.
- Soporte de inferencia por lotes mediante la función `collate` de `torch-pointcloud`.
- Capacidad de reinicializar el clasificador (`reset_classifier`) para adaptar el modelo a otras tareas o para uso como extractor puro.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Clasificación de objetos 3D en robótica: el modelo puede integrarse en pipelines de percepción para identificar objetos capturados por sensores LiDAR o RGB-D, aprovechando su entrada de 8192 puntos y sus 15 clases predefinidas.
- Extracción de embeddings para búsqueda por similitud: usando `forward_features`, se pueden generar vectores de 768 dimensiones para indexar y recuperar objetos 3D similares en bases de datos de modelos CAD o escaneos.
- Preentrenamiento para tareas downstream: el checkpoint puede servir como inicialización para fine-tuning en datasets de nubes de puntos propios, reduciendo la necesidad de datos etiquetados.
- Automatización de inventario en almacenes: clasificación de objetos escaneados en entornos logísticos con fondo, aprovechando la partición OBJ_BG sobre la que se entrenó.
- Visión para realidad aumentada: reconocimiento de objetos 3D en tiempo real para anclar contenido virtual sobre objetos físicos detectados.
- Investigación en representación 3D: el modelo sirve como baseline para experimentos de destilación cross-modal y aprendizaje autosupervisado en 3D, dado su origen académico y licencia MIT.
- Clasificación en conducción autónoma: identificación de obstáculos y objetos en escenas escaneadas por LiDAR, aunque limitado a las 15 clases del dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (OBJ_BG) | OA (Overall Accuracy) | 93,29 |
| ScanObjectNN (OBJ_BG) | mAcc (mean Accuracy) | 91,48 |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo (22,1 M de parámetros), más la memoria de activaciones según el tamaño de lote y los 8192 puntos por muestra.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `torch-pointcloud` (librería oficial de carga), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de nubes de puntos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| act.scanobjectnn-objbg.runpei-dong | 22,1 M | 8192 puntos | MIT | Hugging Face (torch-pointcloud) |
| PointNet++ | no disponible | variable | no disponible | Ampliamente disponible |
| Point Transformer | no disponible | variable | no disponible | Repositorios académicos |
| DGCNN | no disponible | variable | no disponible | Repositorios académicos |

No se dispone de datos de rendimiento comparativos verificados en la información proporcionada para establecer una comparación cuantitativa con estos modelos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de nubes de puntos 3D; no procesa texto, imágenes 2D ni audio.
- Limitado a 15 clases del dataset ScanObjectNN; no generaliza a categorías fuera de ese conjunto sin fine-tuning.
- Entrenado en la partición OBJ_BG (objetos con fondo), por lo que su rendimiento puede degradarse en escenas sin fondo o con distribuciones distintas.
- Riesgo de sesgo hacia las clases y condiciones de captura presentes en ScanObjectNN (objetos escaneados del mundo real con características específicas de sensor).
- No se han publicado análisis de sesgos, robustez ante ruido en la nube de puntos ni evaluaciones fuera de distribución.
- Licencia MIT permite uso comercial, pero se recomienda citar el trabajo original y verificar la licencia del checkpoint base.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- No apto para producción en tareas de lenguaje natural ni como modelo conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/act.scanobjectnn-objbg.runpei-dong
- Modelo base: https://huggingface.co/torch-pointcloud/act.pretrain.runpei-dong
- Paper (arXiv): https://arxiv.org/abs/2212.08320
- Repositorio original ACT: https://github.com/RunpeiDong/ACT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
