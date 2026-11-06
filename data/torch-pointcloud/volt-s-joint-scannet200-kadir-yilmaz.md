# torch-pointcloud/volt-s-joint.scannet200.kadir-yilmaz

## Resumen

Volt-s-joint.scannet200.kadir-yilmaz es un modelo de segmentación semántica de nubes de puntos 3D desarrollado por el autor Kadir Yilmaz (publicado en el espacio `torch-pointcloud` de Hugging Face) y basado en la arquitectura Volume Transformer presentada en el paper "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (ECCV 2026). El modelo resuelve la tarea de asignar una etiqueta semántica a cada punto de una escena 3D, con un vocabulario de 200 clases definido por el dataset ScanNet200.

Se trata de un transformer "vanilla" que opera sobre tokens de parches volumétricos, sin mecanismos jerárquicos ni atención dispersa específicos para nubes de puntos. Con solo 23,7 millones de parámetros, es un modelo muy compacto orientado a la investigación y a la integración en pipelines de percepción 3D, no a generación de texto ni a tareas multimodales.

Este checkpoint concreto forma parte de un entrenamiento conjunto sobre ScanNet, ScanNet200, ScanNet++ y ARKitScenes, manteniendo un clasificador independiente por conjunto de etiquetas; aquí se conserva únicamente el clasificador de ScanNet200. Es relevante porque demuestra que un transformer plano puede competir en segmentación de escenas 3D con arquitecturas más especializadas, y porque está empaquetado para la librería `torch-pointcloud`, lo que facilita su uso reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Volume Transformer (transformer plano sobre tokens de parches volumetricos) |
| Parametros totales | 23.710.664 (23,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre nubes de puntos, no sobre secuencias de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posicion, color, normal) |
| Clases de salida | 200 (ScanNet200) |
| Dimension de features | 128 |
| Libreria | torch-pointcloud (requiere flash-attn) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea un transformer "vanilla" que tokeniza la nube de puntos en parches volumetricos y aplica autoatencion estandar sobre esos tokens, sin jerarquias multiescala ni operaciones de vecindad especificas para geometria. La entrada tiene 6 canales (coordenadas, color y normales), y la cabeza de clasificacion produce 200 clases con una dimension interna de 128 features. El checkpoint requiere kernels de GPU y depende de `flash-attn` para la atencion eficiente.

El entrenamiento es conjunto sobre ScanNet, ScanNet200, ScanNet++ y ARKitScenes, con un clasificador separado por conjunto de etiquetas; este checkpoint conserva solo el de ScanNet200. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en una tarea de segmentacion supervisada). La innovacion principal es la propia propuesta del paper: reivindicar que un transformer plano, sin sesgos inductivos geometricos, es suficiente para comprension de escenas 3D.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D con 200 clases (ScanNet200).
- Procesamiento de nubes con posicion, color y normales (6 canales de entrada).
- Extraccion de features por punto mediante `forward_features` (salida de 128 dimensiones).
- Reutilizacion como backbone: permite `reset_classifier(num_classes=0)` para obtener embeddings.
- Inferencia por lotes mediante `collate` de `torch-pointcloud`.
- No soporta tool calling, agentes, texto ni vision 2D.
- No dispone de capacidades multilingues ni de modo "thinking".

## Casos de uso

- Segmentacion de escenas interiores para robotica movil: el modelo etiqueta cada punto de una nube LiDAR o RGB-D en tiempo de inferencia, permitiendo a un robot identificar suelo, paredes, muebles y objetos para planificacion de navegacion.
- Reconstruccion semantica de interiores para arquitectura y BIM: a partir de escaneos 3D de edificios se generan mapas semanticos con 200 categorias que alimentan modelos digitales del edificio.
- Anotacion asistida de datasets 3D: el modelo preetiqueta nubes de puntos nuevas y los anotadores solo corrigen, reduciendo el coste de etiquetado en proyectos de vision 3D.
- Realidad aumentada y mixta: segmentar la escena en tiempo real para colocar objetos virtuales con oclusion correcta y comprension semantica del entorno.
- Analisis de inventario en retail o almacenes: detectar y clasificar estanterias, productos y elementos estructurales a partir de escaneos 3D del local.
- Investigacion en representaciones 3D: usar el backbone de 128 features como extractor congelado para tareas downstream (deteccion 3D, clasificacion de escenas, correspondencia de puntos).
- Prototipado rapido en pipelines de percepcion: gracias a su tamano de 23,7 M de parametros y su empaquetado en `torch-pointcloud`, se integra en experimentos academicos con requisitos de hardware modestos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| mIoU | ScanNet200 | 38,53 |
| OA (accuracy global) | ScanNet200 | 84,79 |
| simple/mIoU | ScanNet200 | 37,91 |
| simple/OA | ScanNet200 | 84,27 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 23,7 M de parametros; en la practica, el consumo depende del numero de puntos por lote (por ejemplo, 8192 puntos en el ejemplo de la model card).
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte de `flash-attn` (RTX 3090, RTX 4090, A100, H100). La model card indica que los kernels son "GPU-only".
- Cabe en GPU de consumo: si, en cualquier GPU NVIDIA compatible con la version de CUDA y torch requerida por `flash-attn`.
- Opciones de despliegue: libreria `torch-pointcloud` con PyTorch y `flash-attn`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de segmentacion de nubes de puntos con los que comparar parametros, contexto, rendimiento o licencia de forma rigurosa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentacion semantica de nubes de puntos; no genera texto ni procesa imagenes 2D.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`).
- El entrenamiento conjunto incluye ScanNet++ y ARKitScenes, que tienen sus propios terminos no comerciales; aunque la licencia del checkpoint es MIT, conviene revisar las condiciones de los datos de entrenamiento antes de un uso comercial.
- Requiere GPU y `flash-attn` compilado contra la version correcta de torch y CUDA; no funciona en CPU segun la model card.
- El vocabulario esta fijado a las 200 clases de ScanNet200; no generaliza a categorias fuera de ese conjunto sin reentrenamiento.
- Riesgo de degradacion en escenas fuera de la distribucion de entrenamiento (interiores tipo ScanNet); no se documentan sesgos especificos.
- No se dispone de informacion sobre robustez ante ruido, oclusiones o densidades de nube distintas a las de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/volt-s-joint.scannet200.kadir-yilmaz
- Checkpoint original: https://huggingface.co/KadirYilmaz/Volt
- Paper: https://arxiv.org/abs/2604.19609
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion: https://pytorch-pointcloud.org/latest/installation/
