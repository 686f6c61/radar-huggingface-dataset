# torch-pointcloud/volt-s.nuscenes.kadir-yilmaz

## Resumen

Volt-s.nuscenes.kadir-yilmaz es un punto de control de segmentación semántica de nubes de puntos 3D, concretamente la variante "small" de la arquitectura Volt (Volume Transformer) entrenada sobre el conjunto de datos nuScenes. Lo publica el usuario torch-pointcloud como conversión del modelo original de Kadir Yilmaz y colaboradores, presentado en el artículo "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (ECCV 2026). El modelo resuelve la asignación de una etiqueta semántica a cada punto de una escena LiDAR, una tarea central en percepción para conducción autónoma.

La propuesta técnica de Volt es deliberadamente conservadora: un transformer "vanilla" que opera sobre tokens de parches volumétricos, sin mecanismos jerárquicos complejos ni operaciones de vecindad específicas de nubes de puntos. Con solo 23,6 millones de parámetros, 4 canales de entrada (posición e intensidad) y 16 clases de salida, el modelo demuestra que una arquitectura estándar bien tokenizada puede competir en segmentación de escenas 3D a gran escala.

Es relevante ahora por dos motivos: primero, porque cuestiona la necesidad de arquitecturas especializadas cada vez más elaboradas para nubes de puntos; segundo, porque su reducido tamaño y su licencia MIT lo hacen directamente desplegable en pipelines de investigación y en prototipos de percepción sin grandes requisitos de cómputo. La ficha se centra en la variante distribuida por torch-pointcloud, no en el modelo original de KadirYilmaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Volume Transformer (transformer plano sobre tokens de parches volumetricos) |
| Parametros totales | 23.590.928 (23,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del numero de puntos de entrada; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (posicion xyz + intensidad) |
| Clases de salida | 16 |
| Dimension de caracteristicas | 128 |
| Dataset de entrenamiento | nuScenes |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Volt aplica un transformer estandar sobre una secuencia de tokens construida a partir de parches volumetricos de la nube de puntos. Cada punto de entrada dispone de 4 canales (coordenadas tridimensionales e intensidad de retorno LiDAR), que se agrupan en parches y se proyectan a un espacio de 128 dimensiones antes de entrar en el codificador. La salida es una cabeza de clasificacion por punto sobre 16 clases semantica, coherente con la taxonomia de nuScenes. El modelo emplea kernels de atencion implementados con `flash-attn`, lo que implica que la inferencia esta pensada para GPU y requiere una compilacion de esa libreria compatible con la version de PyTorch y CUDA instaladas.

No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset mas alla de nuScenes, ni si se aplicaron etapas de ajuste fino supervisado adicionales, RLHF o DPO (procedimientos, por otra parte, poco habituales en segmentacion 3D). La model card indica que las metricas `simple/` corresponden a una unica pasada sobre el split de validacion, mientras que los autores reportan 80,49 mIoU en una sola pasada y 81,11 con test-time augmentation de 10 vistas, lo que sugiere que el entrenamiento se beneficio de aumentos de datos geometricos. La innovacion principal es conceptual: demostrar que un transformer plano, sin sesgos inductivos especificos de nubes de puntos, es suficiente para escenas 3D cuando la tokenizacion es adecuada.

## Capacidades

- Segmentacion semantica densa de nubes de puntos: asigna una de 16 clases a cada punto de la escena.
- Procesamiento de escenas LiDAR de gran escala (el ejemplo de la model card opera con 8192 puntos por muestra, ampliable segun memoria).
- Extraccion de caracteristicas: `forward_features` devuelve un vector de 128 dimensiones por punto, reutilizable para tareas posteriores.
- Clasificacion con cabeza intercambiable: `reset_classifier(num_classes=0)` permite usar el modelo como extractor o reajustar la cabeza a otro numero de clases.
- Entrada multimodal limitada: 4 canales (xyz + intensidad); no admite imagenes ni otros sensores de nuScenes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingues ni de generacion de texto.

## Casos de uso

- Percepcion para conduccion autonoma en prototipos: el modelo segmenta escenas LiDAR de nuScenes en 16 clases (vehiculos, peatones, vegetacion, etc.), lo que permite construir un pipeline de deteccion de obstaculos y ocupacion de espacio libre con solo 23,6 M de parametros.
- Etiquetado semiautomatico de datos: dado su mIoU de 80,57 en validacion, puede preetiquetar nubes de puntos nuevas y reducir el coste de anotacion manual, que en 3D es especialmente caro.
- Extraccion de caracteristicas para tareas posteriores: usando `forward_features` se obtienen descriptores de 128 dimensiones por punto que alimentan clasificadores ligeros, modelos de deteccion o clustering de instancias.
- Investigacion en arquitecturas 3D: sirve como linea base "vanilla transformer" para comparar contra arquitecturas especializadas (PointNet++, sparse convolutions, etc.) en experimentos controlados.
- Despliegue en entornos con recursos limitados: al ocupar 0,1 GB y requerir una GPU modesta, es viable en estaciones de trabajo con una sola GPU consumer para inferencia por lotes.
- Ajuste fino a dominios propios: la licencia MIT y la cabeza de clasificacion reconfigurable permiten reentrenar sobre otros sensores LiDAR o taxonomias de clases distintas a las de nuScenes.
- Validacion de pipelines de datos: su API basada en `collate` y transformaciones de torch-pointcloud facilita integrarlo como etapa de prueba en un sistema mayor de procesamiento de nubes de puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| nuScenes (validacion, simple) | mIoU | 80,57 |
| nuScenes (validacion, simple) | OA (accuracy overall) | 94,54 |

Los autores reportan ademas 80,49 mIoU en una sola pasada y 81,11 mIoU con test-time augmentation de 10 vistas. No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 23,6 M de parametros en precision completa los pesos ocupan aproximadamente 90-95 MB, y el consumo dominante proviene de las activaciones y de los kernels de atencion sobre miles de puntos.
- GPU recomendadas: cualquier GPU NVIDIA compatible con `flash-attn` y CUDA moderna; una RTX 3090, RTX 4090, A100 o H100 son opciones seguras. El modelo esta disenado para ejecutarse en GPU (`model.cuda()`), no en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer reciente con soporte de `flash-attn`; el cuello de botella es la compilacion de esa libreria, no la memoria.
- Opciones de despliegue: la via soportada es la libreria `torch-pointcloud` (`tp.create_model(..., pretrained=True)`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU nuScenes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| volt-s.nuscenes.kadir-yilmaz | 23,6 M | Nube de puntos, 4 canales, 16 clases | 80,57 (simple) | MIT | Hugging Face (torch-pointcloud) |
| Volt original (KadirYilmaz/Volt) | no disponible | Nube de puntos, nuScenes | 80,49 (1 pasada) / 81,11 (TTA 10 vistas) | MIT | Hugging Face |
| Otras arquitecturas de segmentacion 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados de modelos alternativos comparables (PointNet++, MinkowskiNet, SPVCNN, etc.) sobre nuScenes, por lo que no es posible establecer una comparativa numerica rigurosa mas alla de la variante original de Volt.

## Limitaciones y advertencias

- Modelo puramente perceptivo: no genera texto, no razona y no soporta interaccion conversacional; no debe evaluarse con criterios de LLM.
- Dependencia estricta de GPU y de `flash-attn`: la instalacion requiere una compilacion compatible con la version de PyTorch y CUDA, lo que complica el despliegue reproducible y la portabilidad.
- Entrada restringida a 4 canales (xyz + intensidad): no aprovecha imagenes de camara ni radar de nuScenes, por lo que su rendimiento queda limitado a la informacion geometrica.
- Taxonomia fija de 16 clases: usarlo en otro dominio exige reentrenar la cabeza de clasificacion y disponer de datos etiquetados.
- Metricas no verificadas: los valores de mIoU y OA estan declarados por el autor con `verified: false`; no se han validado de forma independiente en la informacion disponible.
- Riesgo de sesgo de dominio: entrenado exclusivamente en nuScenes (escenas urbanas de Singapur y Boston con un sensor LiDAR concreto); el rendimiento puede degradarse con otros sensores, densidades de puntos o condiciones meteorologicas no representadas.
- Sin datos publicados sobre cuantizacion: no hay variantes GGUF ni INT8 documentadas, lo que limita el despliegue en hardware sin soporte de punto flotante completo.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las condiciones de uso de nuScenes si se reutilizan datos del dataset para reentrenar.
- Repositorio con muy poca traccion (18 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en produccion ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/volt-s.nuscenes.kadir-yilmaz
- Modelo original: https://huggingface.co/KadirYilmaz/Volt
- Paper (arXiv): https://arxiv.org/abs/2604.19609
- Libreria torch-pointcloud (GitHub): https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/
