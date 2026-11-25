# Zenseact/j3pa-tiny

## Resumen

J3PA-Tiny es un codificador de nubes de puntos LiDAR entrenado de forma auto-supervisada por Zenseact, empresa sueca especializada en software para conduccion autonoma. Forma parte de la familia J3PA (J3PA-Tiny, J3PA-Small, J3PA-Large y J3PA-1B), y en concreto este modelo es un destilado del J3PA-1B, el miembro mas grande de la familia con 1.010 millones de parametros. El objetivo del modelo es generar caracteristicas (embeddings) de proposito general para cada punto individual de un escaneo LiDAR, que despues pueden alimentar tareas posteriores como segmentacion semantica, segmentacion panoptica o deteccion de objetos 3D.

Con solo 9,78 millones de parametros, J3PA-Tiny es el miembro mas ligero de la familia y esta pensado para escenarios donde el rendimiento computacional es critico. A diferencia de otros codificadores LiDAR, acepta el tamano de voxel como entrada en tiempo de inferencia, de modo que un unico modelo cubre tamanos de voxel de 4 a 20 cm; los voxeles mas grandes aumentan el throughput a cambio de una perdida menor de rendimiento en las tareas posteriores. La salida por defecto es un vector de 896 canales por punto (concatenacion de cinco etapas con 256, 256, 192, 128 y 64 canales), aunque se puede seleccionar un subconjunto de etapas.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y codigo personalizado que requiere `trust_remote_code=True`. Esta pensado para usarse congelado (linear probing) o con fine-tuning, y su relevancia actual radica en que ofrece una alternativa compacta y abierta a codificadores LiDAR propietarios, con un diseno que desacopla el tamano de voxel del modelo y permite ajustar el coste computacional segun la aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos LiDAR con voxelizacion jerarquica en cinco etapas y atencion sobre grupos generados por curvas de relleno de espacio (space-filling curves); detalles completos no disponibles |
| Parametros totales | 9.784.427 (9,8 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos de tamano variable, sin limite de contexto definido en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal de nubes de puntos, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, con kernels GPU personalizados incluidos en el repositorio) |

## Arquitectura y entrenamiento

J3PA-Tiny es un codificador que voxeliza la nube de puntos de entrada y la procesa en cinco etapas, donde los voxeles de la etapa *s* tienen un tamano de 2^s veces el tamano de voxel base. La salida por defecto concatena las caracteristicas de las cinco etapas (256 + 256 + 192 + 128 + 64 = 896 canales) por punto de entrada, manteniendo el orden original. El modelo acepta el tamano de voxel como parametro de entrada (por defecto 0,05 m), lo que le permite operar con tamanos de 4 a 20 cm con un unico conjunto de pesos. En modo entrenamiento, el modelo aleatoriza el orden de las curvas de relleno de espacio que generan los grupos de atencion, tal como se hace en el preentrenamiento.

El entrenamiento es auto-supervisado (self-supervised learning) sobre nubes de puntos LiDAR, y J3PA-Tiny se obtiene por destilacion del modelo J3PA-1B. La model card no detalla el numero de tokens ni la composicion exacta del dataset de preentrenamiento, y remite a un paper en arXiv que aun no esta publicado. Tampoco se especifica si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en modelos de vision 3D. La entrada es un tensor float32 en CUDA de forma (N, 5) por nube, con columnas [age, x, y, z, intensity], donde `age` son los segundos desde el barrido del punto hasta el barrido mas reciente de la nube (0 para un unico barrido), las coordenadas estan en metros con x hacia delante, y hacia la izquierda y z hacia arriba, y la intensidad va de 0 a 255.

## Capacidades

- Extraccion de caracteristicas por punto: genera un vector de 896 canales por cada punto de entrada, en el mismo orden que la entrada, adecuado para linear probing y fine-tuning.
- Extraccion de caracteristicas por voxel: `voxel_features()` devuelve las caracteristicas por voxel de la primera etapa, mas economico para tareas densas.
- Seleccion de etapas: `point_features(stages)` permite elegir que etapas concatenar (por ejemplo, solo la mas fina con 64 canales, o una lista arbitraria con indices negativos desde la mas profunda).
- Salidas auxiliares por etapa: `features[s]`, `positions[s]` (posicion media de los puntos de cada voxel), `batch_indices[s]` y `up_indices[s]`.
- Procesamiento por lotes: acepta una lista de nubes de puntos y permite dividir las caracteristicas por nube con `split`.
- Tamano de voxel configurable: acepta un float para todas las nubes o un tensor con un valor por nube, lo que permite mezclar tamanos de voxel en un mismo lote.
- Soporte multi-barrido: la columna `age` permite apilar varios barridos en una sola nube con sus edades relativas.
- Uso congelado o con fine-tuning: el modelo se entrena como cualquier modulo de PyTorch.
- No dispone de tool calling, agentes, capacidades linguisticas ni modos de razonamiento; es un codificador puro de nubes de puntos.

## Casos de uso

- Segmentacion semantica de escenas urbanas: usar las caracteristicas por punto (896 canales) como entrada a una cabeza ligera de clasificacion por punto, entrenada sobre datasets como nuScenes o SemanticKITTI; el modelo puede permanecer congelado y solo entrenar la cabeza, lo que reduce el coste de anotacion y computo.
- Deteccion de objetos 3D en vehiculos autonomos: alimentar un detector 3D con las caracteristicas por voxel de la primera etapa, que son mas economicas que las caracteristicas por punto y encajan con arquitecturas basadas en voxeles.
- Segmentacion panoptica: combinar las caracteristicas por punto con las posiciones medias por voxel (`positions[s]`) para separar instancias y clases en un mismo pipeline.
- Preprocesado para percepción en tiempo real: seleccionar un tamano de voxel grande (por ejemplo, 20 cm) para aumentar el throughput en el vehiculo y reducir el coste por fotograma, aceptando una perdida menor de rendimiento en la tarea posterior.
- Etiquetado automatico y pre-anotacion: usar las caracteristicas del modelo congelado para agrupar puntos o predecir etiquetas gruesas que despues se revisan manualmente, acelerando la construccion de datasets.
- Investigacion en aprendizaje auto-supervisado 3D: servir como baseline compacto (9,8 M de parametros) para comparar estrategias de destilacion, linear probing y fine-tuning en tareas de LiDAR.
- Procesamiento por lotes de multiples barridos: apilar varios barridos con la columna `age` para dar contexto temporal al codificador en tareas de seguimiento o deteccion con informacion acumulada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un paper en arXiv que aun no esta publicado y no incluye tablas de resultados de segmentacion, deteccion ni linear probing.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 9,8 M de parametros, los pesos ocupan aproximadamente 39 MB en float32 (unos 20 MB en float16), pero el consumo real depende del numero de puntos de la nube y de las activaciones intermedias, que no se detallan.
- GPU recomendadas: el modelo requiere CUDA (`model.cuda()` en el ejemplo oficial) y kernels GPU personalizados incluidos en el repositorio; no se especifican modelos concretos de GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, pero no se confirma en la informacion disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `revision="v1.0"`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos linguisticos, no aplicables a este codificador).
- Latencia y throughput: no disponibles. La model card indica cualitativamente que los voxeles mas grandes dan mayor throughput con una perdida menor de rendimiento, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| J3PA-Tiny | 9,8 M | Nubes de puntos LiDAR, voxel de 4 a 20 cm | no disponible | Apache 2.0 | Hugging Face (Zenseact/j3pa-tiny) |
| J3PA-Small | 42,4 M | Nubes de puntos LiDAR, voxel de 4 a 20 cm | no disponible | Apache 2.0 (segun familia) | Hugging Face (Zenseact/j3pa-small) |
| J3PA-Large | 134,6 M | Nubes de puntos LiDAR, voxel de 4 a 20 cm | no disponible | Apache 2.0 (segun familia) | Hugging Face (Zenseact/j3pa-large) |
| J3PA-1B | 1.010 M | Nubes de puntos LiDAR, voxel de 4 a 20 cm | no disponible | Apache 2.0 (segun familia) | Hugging Face (Zenseact/j3pa-1b) |

No se dispone de datos de benchmarks ni de comparaciones con codificadores LiDAR de otros autores en la informacion proporcionada. La comparativa se limita a los miembros de la propia familia J3PA, donde J3PA-Tiny es el mas pequeno y el mas rapido en terminos relativos, a costa de menor capacidad.

## Limitaciones y advertencias

- El modelo solo procesa nubes de puntos LiDAR con el formato exacto de entrada (N, 5) en float32 y en CUDA; no acepta otros formatos sin preprocesado.
- Requiere `trust_remote_code=True` y ejecuta kernels GPU personalizados del repositorio, lo que implica revisar el codigo antes de usarlo en produccion y limita su uso a entornos con GPU NVIDIA.
- No se han publicado resultados de benchmarks ni el paper asociado, por lo que no es posible verificar el rendimiento en tareas posteriores con datos independientes.
- La model card no detalla el dataset de preentrenamiento, los sesgos geograficos o de sensores, ni el riesgo de alucinacion en tareas densas; al ser un codificador, el riesgo se traslada a las cabezas posteriores que se entrenen sobre sus caracteristicas.
- El rendimiento con tamanos de voxel fuera del rango 4-20 cm no esta garantizado, ya que el modelo se entreno solo en ese intervalo.
- No se especifican limitaciones de idioma porque el modelo no procesa texto; las capacidades multilingues no aplican.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte y el paper y el codigo en GitHub estan pendientes de publicacion.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zenseact/j3pa-tiny
- Modelo base (J3PA-1B): https://huggingface.co/Zenseact/j3pa-1b
- J3PA-Small: https://huggingface.co/Zenseact/j3pa-small
- J3PA-Large: https://huggingface.co/Zenseact/j3pa-large
- Paper en arXiv: pendiente de publicacion (enlace no disponible)
- Codigo en GitHub: pendiente de publicacion (enlace no disponible)
