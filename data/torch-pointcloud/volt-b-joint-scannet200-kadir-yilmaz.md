# torch-pointcloud/volt-b-joint.scannet200.kadir-yilmaz

## Resumen

Volt es un modelo de segmentación semántica de nubes de puntos 3D desarrollado por Kadir Yilmaz, Adrian Kruse, Tristan Höfer, Daan de Geus y Bastian Leibe (investigadores vinculados a la Universidad RWTH Aachen), y distribuido en HuggingFace por la organización torch-pointcloud. Este checkpoint concreto, `volt-b-joint.scannet200.kadir-yilmaz`, es la conversión del modelo original al formato de la librería `torch-pointcloud` y está especializado en la partición semántica de escenas interiores en las 200 clases de ScanNet200.

El modelo se presenta en el paper "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (ECCV 2026) como una propuesta deliberadamente sencilla: un transformer plano sobre tokens de parches volumétricos, sin mecanismos jerárquicos complejos ni atención dispersa específica para 3D. Con 94,1 millones de parámetros, 256 canales de características y una entrada de 6 canales (posición, color y normales), resuelve una tarea clásica de visión 3D: asignar una etiqueta semántica a cada punto de una reconstrucción de escena interior.

Su relevancia actual radica en que demuestra que un transformer vanilla bien entrenado puede competir en segmentación de interiores con arquitecturas más elaboradas, y en que se publica con licencia MIT y una integración limpia en `torch-pointcloud`, lo que facilita su uso reproductible en pipelines de investigación y en aplicaciones de robótica, escaneado y realidad aumentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer plano sobre tokens de parches volumetricos (Volume Transformer) |
| Parametros totales | 94.079.688 (94,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos, no sobre secuencias de texto; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posicion, color, normales) |
| Clases de salida | 200 (ScanNet200) |
| Dimension de caracteristicas | 256 |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

Volt es un transformer "vanilla" que opera sobre tokens de parches volumetricos. En lugar de emplear mecanismos jerarquicos o atencion dispersa especificos de nubes de puntos, tokeniza la escena en parches 3D y aplica autoatencion estandar sobre ellos. El modelo recibe 6 canales por punto (coordenadas, color y normales), proyecta las caracteristicas a 256 dimensiones y produce logits por punto para las 200 clases de ScanNet200. La implementacion requiere `flash-attn` con un build compatible con la version de torch y CUDA, ya que usa kernels que solo funcionan en GPU.

El checkpoint se entrena de forma conjunta sobre ScanNet, ScanNet200, ScanNet++ y ARKitScenes, manteniendo un clasificador independiente por conjunto de etiquetas; este checkpoint conserva unicamente el clasificador de ScanNet200. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a una tarea de segmentacion). La innovacion principal es la propia tesis del paper: revisar si un transformer plano, sin inductive biases especificos de 3D, es suficiente para comprension de escenas 3D a escala.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D en 200 clases de interiores (ScanNet200).
- Procesamiento de nubes de puntos con posicion, color y normales como entrada (6 canales).
- Extraccion de caracteristicas densas por punto mediante `forward_features`, con salida de 256 dimensiones, util para tareas downstream (clasificacion, retrieval, clustering).
- Capacidad de reiniciar el clasificador (`reset_classifier`) para adaptar la cabeza a otros conjuntos de etiquetas o para uso como extractor puro.
- Procesamiento por lotes mediante la funcion `collate` de `torch-pointcloud`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision 3D.
- No dispone de modo "thinking", vision 2D, audio ni generacion de texto.

## Casos de uso

- Digitalizacion de interiores y gemelos digitales: el modelo etiqueta cada punto de un escaneo de una habitacion u oficina en 200 categorias (pared, suelo, silla, mesa, etc.), lo que permite generar inventarios automaticos y modelos semanticos de espacios para BIM o facility management.
- Robotica movil y navegacion: integrado en el pipeline de percepcion de un robot, proporciona mapas semanticos de interiores que permiten distinguir superficies transitables de obstaculos y objetos manipulables, aprovechando su salida densa por punto.
- Realidad aumentada y mixta: la segmentacion por punto permite anclar objetos virtuales a superficies reales y aplicar oclusiones correctas, ya que el modelo distingue clases finas de mobiliario y estructura.
- Escaneado movil con ARKitScenes: aunque este checkpoint usa el clasificador de ScanNet200, el entrenamiento conjunto incluye ARKitScenes, lo que lo hace adecuado para escaneos capturados con dispositivos moviles en interiores reales.
- Extraccion de caracteristicas para busqueda y recuperacion 3D: mediante `forward_features` se obtienen descriptores de 256 dimensiones por punto que pueden alimentar modelos de retrieval, clustering o clasificacion de escenas sin reentrenar el backbone.
- Anotacion asistida de datasets 3D: el modelo puede preetiquetar grandes volumentes de nubes de puntos y reducir el coste de anotacion manual en proyectos de investigacion o industriales.
- Control de calidad en escaneos de edificios: la salida semantica permite detectar regiones mal capturadas o clases anomalas en reconstrucciones de interiores antes de su publicacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto ScanNet200:

| Metrica | Valor |
|---|---|
| mIoU | 40,06 |
| OA (accuracy global) | 85,29 |
| simple/mIoU | 39,47 |
| simple/OA | 85,01 |

No se han publicado en la informacion disponible resultados comparativos adicionales (por ejemplo, frente a otros modelos de segmentacion 3D) ni desgloses por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 94,1 M de parametros en precision completa (fp32) los pesos ocupan aproximadamente 0,38 GB, a los que hay que sumar activaciones y buffers de atencion, por lo que se recomienda al menos 8-16 GB de VRAM para lotes moderados.
- GPU recomendadas: cualquier GPU NVIDIA compatible con `flash-attn` y CUDA moderno; se sugiere A100, H100, L4 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3090, RTX 4090 o superiores, siempre que se compile `flash-attn` para la version de torch y CUDA correspondiente.
- El modelo es GPU-only: la model card indica que usa kernels que solo funcionan en GPU y el ejemplo llama a `.cuda()`.
- Opciones de despliegue: la libreria `torch-pointcloud` como via principal; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision 3D).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos de segmentacion semantica de nubes de puntos (como PointNet++, MinkowskiNet, SPVCNN o PTv3) sobre ScanNet200, por lo que no es posible establecer una comparativa numerica fiable. A continuacion se recoge una comparacion cualitativa basada en caracteristicas conocidas de la categoria:

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Volt (este checkpoint) | 94,1 M | Transformer plano sobre parches volumetricos | MIT | HuggingFace + torch-pointcloud |
| PointNet++ | no disponible | Red jerarquica sobre puntos | no disponible | Implementaciones multiples |
| MinkowskiNet | no disponible | Convoluciones dispersas en voxeles | no disponible | Codigo publico |
| PTv3 (Point Transformer V3) | no disponible | Transformer con serializacion espacial | no disponible | Codigo publico |

Los datos de los modelos alternativos no estan disponibles en la informacion proporcionada y deben consultarse en sus respectivas publicaciones.

## Limitaciones y advertencias

- El modelo esta especializado en escenas de interiores (ScanNet200) y no esta pensado para exteriores, vehiculos o entornos industriales no representados en el entrenamiento.
- Solo produce el clasificador de ScanNet200; para otros conjuntos de etiquetas es necesario reiniciar el clasificador y reentrenar.
- La licencia del checkpoint es MIT, pero los datos de entrenamiento ScanNet++ y ARKitScenes tienen terminos no comerciales propios; conviene revisar las implicaciones para uso comercial del modelo derivado.
- Requiere `flash-attn` compilado para la version exacta de torch y CUDA, lo que anade friccion de despliegue y puede fallar en entornos sin GPU NVIDIA compatible.
- Es un modelo GPU-only: no hay soporte documentado para CPU.
- Riesgo de confusion entre clases finas dentro de las 200 categorias de ScanNet200, especialmente en objetos poco frecuentes; el mIoU global de 40,06 indica margen de mejora en clases minoritarias.
- No dispone de capacidades de texto, razonamiento, tool calling ni agentes; no debe emplearse fuera de tareas de vision 3D.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false`).
- No se documentan sesgos especificos, pero al entrenarse con datasets de escenas interiores predominantemente occidentales y de oficina/hogar, puede generalizar peor en otros contextos culturales o arquitectonicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/volt-b-joint.scannet200.kadir-yilmaz
- Modelo original (KadirYilmaz/Volt): https://huggingface.co/KadirYilmaz/Volt
- Paper (arXiv): https://arxiv.org/abs/2604.19609
- Libreria torch-pointcloud (GitHub): https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet200: https://huggingface.co/datasets?search=scannet200 (referencia generica; no se proporciona URL directa en la informacion disponible)
