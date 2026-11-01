# torch-pointcloud/act.modelnet40.runpei-dong

## Resumen

act.modelnet40.runpei-dong es un modelo de clasificación de nubes de puntos 3D desarrollado originalmente por Runpei Dong y colaboradores en el marco del trabajo ACT (Autoencoders as Cross-Modal Teachers), presentado en ICLR 2023. La versión publicada en HuggingFace ha sido convertida y empaquetada por el proyecto torch-pointcloud (Arthur Dujardin) para su uso directo con la librería `torch-pointcloud`. El modelo resuelve la tarea de clasificación de formas 3D en 40 categorías sobre el dataset ModelNet40.

Se trata de un transformer de puntos enmascarado (masked point transformer) destilado a partir de un transformer de imágenes 2D preentrenado, lo que constituye la innovación central del paper: usar autoencoders de imagen como profesores cross-modales para el preentrenamiento de representaciones 3D. El modelo cuenta con 22,1 millones de parámetros y una dimensión de características de 768.

Es relevante para desarrolladores e investigadores que trabajan en visión 3D, robótica, conducción autónoma o análisis de geometría, porque ofrece un checkpoint ligero (0,1 GB) con licencia MIT, integrado en un ecosistema PyTorch específico para nubes de puntos y con métricas declaradas de 93,19 % de accuracy global sobre ModelNet40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked point transformer (ACT), destilado de un transformer de imagen 2D |
| Parametros totales | 22.102.056 (22,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 40 (ModelNet40) |
| Dimension de caracteristicas | 768 |
| Puntos de entrada (ejemplo de la model card) | 8192 |
| Modelo base | torch-pointcloud/act.pretrain.runpei-dong |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT descrita en el paper "Autoencoders as Cross-Modal Teachers: Can Pretrained 2D Image Transformers Help 3D Representation Learning?" (Dong et al., ICLR 2023). La idea central es emplear un autoencoder basado en transformer de imágenes 2D como profesor cross-modal: el autoencoder reconstruye la imagen 2D correspondiente a una nube de puntos 3D, y las representaciones internas del profesor 2D se destilan hacia un transformer de puntos 3D enmascarado. De este modo, el modelo 3D aprovecha el conocimiento visual preentrenado a gran escala sin necesidad de pares 3D-etiqueta masivos.

El checkpoint aquí descrito parte del modelo preentrenado `act.pretrain.runpei-dong` y se ha afinado para clasificación sobre ModelNet40 (40 clases, 768 dimensiones de característica, 22,1 M de parámetros). La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de clasificación 3D). La conversión a `torch-pointcloud` la realiza el proyecto de Arthur Dujardin, que preserva la licencia MIT del repositorio original RunpeiDong/ACT.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de objetos (ModelNet40).
- Extracción de embeddings globales de 768 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos con coordenadas (`pos`) y normales (`normal`) como entradas.
- Soporte de batching mediante la utilidad `collate` de `torch-pointcloud`.
- Integración nativa con PyTorch y con la librería `torch-pointcloud` (carga mediante `tp.create_model`).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión 2D, audio ni modo de pensamiento.

## Casos de uso

- Clasificación de objetos 3D en pipelines de visión por computador: dado un escaneo de nube de puntos (por ejemplo, de un sensor LiDAR o de una cámara de profundidad), el modelo devuelve una de las 40 clases de ModelNet40, lo que permite etiquetar geometrías en datasets o en producción.
- Preprocesamiento para robótica de manipulación: clasificar el objeto detectado antes de seleccionar una estrategia de agarre; el modelo es ligero (22,1 M de parámetros) y puede ejecutarse en GPU de gama media junto con el resto del stack de percepción.
- Extracción de características para búsqueda o recuperación de formas 3D: usar los embeddings de 768 dimensiones como representación compacta para indexar y comparar modelos 3D en un catálogo.
- Baseline académico en investigación de representación 3D: comparar arquitecturas o métodos de preentrenamiento contra un checkpoint ACT preentrenado y afinado, con métricas reproducibles sobre ModelNet40.
- Etiquetado asistido de datasets de nubes de puntos: preanotar muestras con el modelo y revisar manualmente solo los casos de baja confianza, reduciendo el coste de anotación.
- Clasificación de componentes industriales o piezas CAD convertidas a nubes de puntos: el modelo puede adaptarse mediante fine-tuning a dominios específicos partiendo del checkpoint preentrenado.
- Módulo de percepción en prototipos de conducción autónoma o drones: clasificación rápida de formas a partir de datos LiDAR en entornos controlados, siempre que las clases coincidan con las 40 de ModelNet40 o se reentrene la cabeza de clasificación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ModelNet40 | Clasificación de nubes de puntos | OA (accuracy global) | 93,19 |
| ModelNet40 | Clasificación de nubes de puntos | mAcc (accuracy media por clase) | 89,9 |

No se han publicado en la información disponible resultados adicionales de benchmarks ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo (22,1 M de parámetros, ~88 MB de pesos) más el espacio de activaciones, que depende del número de puntos de entrada (la model card usa 8192 puntos como ejemplo).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para entrenamiento o fine-tuning se recomienda RTX 4090, A100 o H100, aunque el modelo es pequeño y cabe holgadamente en cualquier GPU moderna.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU NVIDIA con soporte CUDA, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` sobre PyTorch (`tp.create_model`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación 3D.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento ModelNet40 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act.modelnet40.runpei-dong | 22,1 M | nubes de puntos (8192 puntos en el ejemplo) | OA 93,19 / mAcc 89,9 (declarado) | MIT | HuggingFace (torch-pointcloud) |
| PointNet / PointNet++ | no disponible en la información | nubes de puntos | no disponible en la información | no disponible en la información | ampliamente disponibles |
| Otros clasificadores ModelNet40 | no disponible en la información | nubes de puntos | no disponible en la información | no disponible en la información | no disponible |

No se dispone en la información proporcionada de datos numéricos de modelos alternativos que permitan una comparación rigurosa; la tabla anterior solo refleja lo que consta para este checkpoint.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ModelNet40 (40 clases de objetos sintéticos/CAD); su generalización a nubes de puntos reales, ruidosas o de dominios distintos no está garantizada.
- Las métricas declaradas (OA 93,19, mAcc 89,9) no están verificadas de forma independiente (`verified: false` en la model card).
- No es un modelo generativo ni lingüístico: no admite prompts de texto, tool calling ni razonamiento; cualquier uso fuera de clasificación o extracción de características requiere adaptación.
- Riesgo de degradación con nubes de puntos incompletas, oclusiones, densidades distintas a las de entrenamiento o ausencia de normales.
- No se documentan análisis de sesgos, robustez adversarial ni evaluación en dominios reales.
- La licencia MIT permite uso comercial, pero conviene revisar también las condiciones del repositorio original RunpeiDong/ACT y del dataset ModelNet40 para usos derivados.
- El modelo base de preentrenamiento (`act.pretrain.runpei-dong`) debe respetarse como dependencia si se reproduce el pipeline completo.
- Para producción se recomienda validar el modelo sobre datos propios antes de desplegarlo, dado el escaso número de descargas (19) y la ausencia de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/act.modelnet40.runpei-dong
- Modelo base: https://huggingface.co/torch-pointcloud/act.pretrain.runpei-dong
- Paper ACT (arXiv): https://arxiv.org/abs/2212.08320
- Repositorio original ACT: https://github.com/RunpeiDong/ACT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
