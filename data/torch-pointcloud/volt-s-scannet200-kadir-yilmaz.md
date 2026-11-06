# torch-pointcloud/volt-s.scannet200.kadir-yilmaz

## Resumen

Volt-s.scannet200.kadir-yilmaz es un checkpoint de segmentación semántica de nubes de puntos 3D, concretamente la variante "small" (23,7 millones de parámetros) del modelo Volume Transformer (Volt), desarrollado por Kadir Yilmaz, Adrian Kruse, Tristan Höfer, Daan de Geus y Bastian Leibe (publicado en ECCV 2026). El modelo resuelve la tarea de asignar una clase semántica a cada punto de una escena 3D, con 200 categorías posibles, y está entrenado sobre el dataset ScanNet200 de interiores.

La relevancia técnica del modelo radica en su planteamiento arquitectónico: frente a las aproximaciones dominantes en el campo (sparse convolutions, point transformers con atención sesgada por vecindad), Volt propone un transformer "vanilla" que opera sobre tokens de parches volumétricos. Es decir, voxeliza la escena y trata cada parche volumétrico como un token, aplicando atención estándar sin mecanismos de sparseidad específicos.

Este checkpoint concreto ha sido convertido por el proyecto torch-pointcloud (Arthur Dujardin) desde el repositorio original del autor, para integrarse en su librería de PyTorch con API unificada `create_model`. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer plano (vanilla) sobre tokens de parches volumétricos |
| Parámetros totales | 23.710.664 (23,7 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del número de puntos de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posición + color) |
| Clases de salida | 200 (ScanNet200) |
| Dimensión de features | 128 |
| Dataset de entrenamiento | ScanNet200 |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

Volt es un transformer "vanilla" aplicado a comprensión de escenas 3D. La entrada es una nube de puntos con 6 canales (coordenadas xyz y color RGB), que se transforma en una rejilla de posiciones (`pos_grid`) y se agrupa en parches volumétricos tratados como tokens. Sobre esa secuencia de tokens se aplica atención estándar (con `flash-attn` según la model card), sin mecanismos de sparseidad específicos ni sesgos de vecindad. La salida es una clasificación por punto en 200 clases semánticas.

Los detalles concretos de entrenamiento (número de tokens vistos, composición exacta del dataset, uso de RLHF/DPO —no aplicable aquí—, estrategias de aumento de datos) no se especifican en la información disponible más allá de que se ha entrenado sobre ScanNet200. El checkpoint se ha convertido desde `KadirYilmaz/Volt` manteniendo los pesos originales. El paper de referencia es "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (arXiv:2604.19609), presentado en ECCV 2026.

## Capacidades

- Segmentación semántica de nubes de puntos 3D en 200 clases de interior (ScanNet200).
- Procesamiento de nubes de puntos con posición (3 canales) y color (3 canales), total 6 canales de entrada.
- Extracción de features de 128 dimensiones por punto mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Inferencia GPU-only (kernels dependientes de CUDA y `flash-attn`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo 3D.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión 2D, audio ni otras modalidades.

## Casos de uso

- Segmentación de escenas de interior para robótica móvil: el modelo etiqueta cada punto de una captura LiDAR/RGB-D con una de las 200 clases de ScanNet200 (suelo, pared, silla, mesa, etc.), lo que permite a un robot construir mapas semánticos del entorno para navegación y manipulación.
- Digitalización y modelado BIM: a partir de escaneos 3D de edificios, el modelo separa elementos estructurales y mobiliario, alimentando pipelines de reconstrucción semántica.
- Análisis de escenas para realidad aumentada: identificación de superficies y objetos para anclaje de contenido virtual en aplicaciones AR de interior.
- Etiquetado asistido de datasets 3D: pre-anotación automática de nubes de puntos para reducir el coste de anotación manual, dado el tamaño reducido del modelo (23,7 M parámetros) que permite procesar grandes volúmenes.
- Extracción de features para tareas downstream: usando `forward_features` se obtienen embeddings de 128 dimensiones por punto que pueden alimentar clasificadores de instancia, detección o recuperación.
- Investigación en arquitecturas 3D: al ser un transformer vanilla sobre parches volumétricos, sirve como baseline reproducible para comparar con sparse convolutions y point transformers en experimentos académicos.
- Prototipado rápido en GPU consumer: el tamaño del checkpoint (0,1 GB) y los 23,7 M de parámetros permiten iterar en una única GPU de gama media-alta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Métrica | Dataset | Valor |
|---|---|---|
| mIoU | ScanNet200 | 36,14 |
| OA (overall accuracy) | ScanNet200 | 83,85 |
| simple/mIoU | ScanNet200 | 35,36 |
| simple/OA | ScanNet200 | 83,32 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 23,7 M de parámetros en fp32 los pesos ocupan aproximadamente 95 MB, y el consumo real vendrá dominado por la nube de puntos de entrada (el ejemplo usa 8192 puntos) y las activaciones de atención.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y `flash-attn` compatible; el modelo es GPU-only por los kernels empleados.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 en adelante, aunque no se especifica un mínimo oficial.
- Opciones de despliegue: `torch-pointcloud` (librería oficial del checkpoint); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación de nubes de puntos (p. ej. variantes de PointNet++, MinkowskiNet o SphereFormer), por lo que no se puede elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente en ScanNet200 (escenas de interior); el rendimiento fuera de ese dominio (exteriores, objetos aislados, otros sensores) no está garantizado.
- Requiere GPU con CUDA y `flash-attn` compilado para la versión de torch y CUDA del entorno; no funciona en CPU.
- Los resultados de benchmark están marcados como `verified: false`; son cifras declaradas por el autor y no verificadas de forma independiente.
- No se documentan sesgos específicos, pero al derivar de un dataset de interiores con distribución geográfica y de captura concreta, puede presentar sesgos hacia ese tipo de escenas.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de clasificaciones erróneas en puntos ambiguos u ocluidos.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; sin restricciones adicionales documentadas.
- El checkpoint es una conversión de terceros (`torch-pointcloud`) del original; conviene validar que los pesos convertidos reproducen las métricas declaradas antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/volt-s.scannet200.kadir-yilmaz
- Modelo original: https://huggingface.co/KadirYilmaz/Volt
- Paper: https://arxiv.org/abs/2604.19609
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación: https://pytorch-pointcloud.org/latest/installation/
