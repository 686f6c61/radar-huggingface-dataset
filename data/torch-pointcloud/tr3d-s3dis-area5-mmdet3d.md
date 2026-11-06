# torch-pointcloud/tr3d.s3dis-area5.mmdet3d

## Resumen

TR3D (`tr3d.s3dis-area5.mmdet3d`) es un modelo de deteccion de objetos 3D sobre nubes de puntos, concretamente un detector convolucional disperso totalmente convolucional (fully convolutional sparse voxel detector) disenado para entornos interiores. Lo desarrolla el equipo de Danila Rukhovich, Anna Vorontsova y Anton Konushin, autores del paper "TR3D: Towards Real-Time Indoor 3D Object Detection" (ICIP 2023), y esta empaquetado y distribuido por el proyecto `torch-pointcloud` de Arthur Dujardin como un checkpoint convertido desde MMDetection3D.

El modelo resuelve la tarea de localizar y clasificar instancias de objetos (5 clases en S3DIS) a partir de nubes de puntos con coordenadas, color y normales, devolviendo cajas 3D orientadas. Su interes practico reside en que es un detector muy ligero (14,7 millones de parametros, ~0,1 GB de repositorio) y orientado a tiempo real, lo que lo hace viable en escenarios de robotica interior, escaneo de edificios o analisis de escenas indoor donde un detector pesado no seria desplegable.

Este checkpoint concreto esta entrenado y evaluado sobre el split Area 5 de S3DIS, el protocolo estandar de generalizacion de dicho dataset, con resultados declarados de mAP@0.25 = 71,24 y mAP@0.5 = 48,37. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto en el sentido habitual, por lo que las filas de la tabla de especificaciones relativas a contexto, idiomas o cuantizacion se marcan como no disponibles o no aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TR3D: detector 3D convolucional disperso totalmente convolucional (sparse voxel backbone + cabezas de deteccion) |
| Parametros totales | 14.669.771 (~14,7 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision 3D, no de lenguaje); entrada = nube de puntos (ejemplo de la model card: 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; requiere spconv compilado para la version de torch y CUDA) |
| Idiomas soportados | no aplicable (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |
| Canales de entrada | 3 (segun model card; el ejemplo de uso aporta `pos`, `color`, `normal`) |
| Canales de caracteristicas | 128 |
| Clases | 5 |
| Dataset de entrenamiento/evaluacion | S3DIS (Area 5) |
| Libreria | torch-pointcloud (requiere spconv) |

## Arquitectura y entrenamiento

TR3D es un detector 3D "fully convolutional" que opera sobre vóxeles dispersos: la nube de puntos se voxeliza y se procesa mediante convoluciones dispersas (implementadas con `spconv`), evitando el coste de densificar el volumen. El backbone produce caracteristicas de 128 canales y las cabezas de deteccion predicen cajas 3D por clase. El checkpoint expone tanto la salida de deteccion (`model(x, pos, batch)`) como la extraccion de caracteristicas (`forward_features`, 128 canales), lo que permite reutilizarlo como encoder para tareas auxiliares.

El entrenamiento se realizo sobre S3DIS, un dataset de escenas interiores de edificios con anotaciones semanticas e instancias, y este checkpoint se evalua en el protocolo Area 5 (generalizacion a un area no vista). La model card no detalla el numero de tokens/puntos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de refinamiento posteriores (RLHF/DPO no aplica en vision). El checkpoint ha sido convertido desde MMDetection3D (Apache-2.0) al formato de torch-pointcloud; la innovacion tecnica central del paper es la arquitectura convolucional dispersa orientada a inferencia en tiempo real en interiores.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos interiores: localiza instancias y predice cajas 3D orientadas sobre 5 clases de S3DIS.
- Extraccion de caracteristicas: `forward_features` devuelve un descriptor de 128 canales por punto/voxel, util para segmentacion, clasificacion o retrieval.
- Entrada multimodal de atributos por punto: coordenadas (`pos`), color (`color`) y normales (`normal`), segun el ejemplo de la model card.
- Procesamiento por lotes: la API `collate` permite agrupar varias nubes de puntos en un mismo batch.
- Inferencia en GPU: los kernels de spconv requieren GPU (`model.cuda()`, "GPU-only kernels" segun la model card).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de vision 2D ni audio.

## Casos de uso

- Robotica de interior y navegacion: deteccion de mobiliario y obstaculos (sillas, mesas, etc.) en tiempo real para planificacion de trayectorias, aprovechando que TR3D esta disenado para inferencia rapida sobre vóxeles dispersos.
- Digitalizacion de edificios (BIM/escaneo): a partir de nubes de puntos de escaneos interiores, extraer instancias de objetos para poblar modelos semanticos del edificio; el checkpoint entrenado en S3DIS es directamente util para escenas de oficinas y aulas.
- Realidad aumentada/virtualidad en interiores: colocar objetos virtuales sobre superficies reales requiere detectar cajas 3D de mesas, sillas y demas mobiliario; el modelo devuelve cajas orientadas con 5 clases.
- Analisis de inventario en espacios: contar y localizar objetos en una sala escaneada con LiDAR o camara de profundidad, usando el batch para procesar varias salas en una pasada.
- Preprocesado para anotacion semiautomatica: usar las detecciones y las caracteristicas de 128 canales como propuestas iniciales para acelerar el etiquetado de nuevas nubes de puntos.
- Backbone para tareas derivadas: congelar el modelo y usar `forward_features` como encoder en pipelines de segmentacion semantica o clasificacion de escenas, reduciendo el coste de entrenamiento.
- Control de calidad de escaneos: detectar objetos faltantes o mal reconstruidos comparando las detecciones con el inventario esperado de una sala.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), tarea `3d-object-detection` sobre S3DIS (Area 5):

| Metrica | Valor |
|---|---|
| mAP@0.25 | 71,24 |
| mAP@0.5 | 48,37 |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo latencia, throughput o resultados en otros datasets) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 14,7 M parametros el peso del modelo es de decenas de MB, pero el consumo real depende del numero de vóxeles y del batch, no solo del numero de parametros.
- GPU: la model card indica "GPU-only kernels", por lo que se requiere GPU con CUDA compatible con la build de `spconv` instalada; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Consumer GPU: no confirmado en la informacion disponible; el tamano de parametros sugiere que cabria en GPUs de consumo, pero la dependencia de `spconv` y de kernels CUDA especificos debe validarse para cada tarjeta y version de CUDA.
- Despliegue: `torch-pointcloud` (`tp.create_model`) con `spconv` compilado para la version de torch y CUDA; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; el paper se orienta a deteccion en tiempo real, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos comparables en la informacion proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto/entrada | mAP@0.25 (S3DIS Area 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tr3d.s3dis-area5.mmdet3d | 14,7 M | nube de puntos (5 clases) | 71,24 (declarado) | Apache-2.0 | Hugging Face + torch-pointcloud |
| Alternativas de deteccion 3D indoor (p. ej. VoteNet, PointNet++) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con otros detectores 3D indoor no esta disponible en la informacion facilitada.

## Limitaciones y advertencias

- Dominio restringido: entrenado en S3DIS (escenas interiores de edificios); el rendimiento en exteriores, nubes de puntos de otro sensor o densidades muy distintas no esta documentado.
- Solo 5 clases: el vocabulario de objetos es limitado; no detecta categorias fuera del conjunto de S3DIS.
- Resultados no verificados: las metricas de la model card estan marcadas como `verified: false`; deben tratarse como declaraciones del autor.
- Requiere GPU y `spconv`: la instalacion de `spconv` debe coincidir con la version de torch y CUDA, lo que anade friccion de despliegue y puede fallar en entornos sin GPU.
- Entrada con multiples atributos: el ejemplo espera `pos`, `color`, `normal`, `segment` e `instance`; si el sensor no proporciona color o normales, el comportamiento no esta documentado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos y cajas mal ajustadas en escenas con oclusiones o puntos escasos.
- Sesgos: no documentados en la informacion disponible; el dataset S3DIS esta sesgado a interiores de edificios concretos (oficinas, aulas), lo que puede trasladarse al modelo.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribucion y las licencias de las dependencias (`spconv`, MMDetection3D) antes de produccion.
- Sin soporte de lenguaje: no puede usarse para tareas de texto, agentes o tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/tr3d.s3dis-area5.mmdet3d
- Paper TR3D: https://arxiv.org/abs/2302.02858
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
