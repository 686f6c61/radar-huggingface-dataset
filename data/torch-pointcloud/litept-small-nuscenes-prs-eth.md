# torch-pointcloud/litept-small.nuscenes.prs-eth

## Resumen

LitePT-small.nuscenes.prs-eth es un checkpoint de segmentacion semantica de nubes de puntos 3D, publicado por la organizacion torch-pointcloud y derivado del modelo LitePT (Lighter Yet Stronger Point Transformer) del grupo prs-eth. El modelo resuelve la asignacion de una clase semantica a cada punto individual de una nube LiDAR, una tarea central en percepcion para conduccion autonoma. Se trata de un modelo pequeno, de 12,7 millones de parametros, con 4 canales de entrada (coordenadas mas intensidad) y 16 clases de salida, entrenado sobre el dataset nuScenes.

La relevancia de este checkpoint es doble. Por un lado, la arquitectura LitePT propone un diseno hibrido que combina convoluciones en las etapas tempranas con atencion con embedding rotacional 3D en las etapas tardias, buscando un equilibrio entre coste computacional y precision. Por otro, su integracion en la libreria torch-pointcloud facilita el despliegue mediante una API de creacion de modelos y transformaciones de datos predefinidas, lo que reduce la friccion para investigadores que quieran reproducir o comparar resultados.

Este checkpoint concreto corresponde a la variante "small" entrenada en nuScenes y reporta un mIoU de 80,47 y una exactitud global (OA) de 94,68 sobre dicho dataset. Es, por tanto, una referencia util para tareas de segmentacion LiDAR en entornos urbanos, aunque no es un modelo de lenguaje ni un modelo multimodal generativo: su dominio es exclusivamente geometrico y perceptivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LitePT (convoluciones en etapas tempranas, atencion con embedding rotacional 3D en etapas tardias) |
| Parametros totales | 12.709.300 (12,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de nubes de puntos, no de secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria torch-pointcloud) |
| Canales de entrada | 4 (posicion xyz + intensidad) |
| Clases de salida | 16 |
| Dimension de features | 72 |
| Dataset de entrenamiento | nuScenes |
| Tamano del repositorio | 0,1 GB |
| Libreria | torch-pointcloud |
| Dependencias adicionales | spconv, flash-attn (compilacion ligada a torch y CUDA) |

## Arquitectura y entrenamiento

LitePT es un transformer de nubes de puntos con un diseno hibrido por etapas. Las primeras etapas emplean convoluciones (implementadas mediante spconv, es decir, convoluciones dispersas sobre vóxeles) para extraer caracteristicas locales de forma eficiente, mientras que las etapas finales usan atencion con embedding rotacional 3D (3D rotary embedding), lo que aporta capacidad de modelado global con sensibilidad a la geometria tridimensional. El checkpoint declara 12,7 millones de parametros, 4 canales de entrada, 16 clases y una dimension de features de 72.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de nuScenes, ni si se aplicaron fases de RLHF, DPO o ajuste fino supervisado adicional. El modelo se presenta como conversion del repositorio original prs-eth/LitePT (licencia MIT) al formato de la libreria torch-pointcloud, y la referencia tecnica es el paper "LitePT: Lighter Yet Stronger Point Transformer" (arXiv:2512.13689), que segun la citacion fue aceptado en CVPR 2026.

Como innovacion destacable, la combinacion de convoluciones dispersas y atencion con rotacion 3D busca reducir el coste frente a transformers de puntos puros manteniendo precision competitiva. El modelo es exclusivamente GPU: la model card indica que requiere kernels solo para GPU y que necesita compilaciones de spconv y flash-attn ajustadas a la version de torch y CUDA del entorno.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D: asigna una de 16 clases a cada punto de la nube.
- Procesamiento de entradas LiDAR con 4 canales (coordenadas xyz e intensidad).
- Extraccion de caracteristicas: metodo `forward_features` que devuelve representaciones de dimension 72 por punto.
- Clasificador configurable: `reset_classifier(num_classes=0)` permite reutilizar el backbone para otras tareas o cabezas.
- Inferencia por lotes: la API acepta datos agrupados mediante `collate`, con soporte de mascara de batch.
- Integracion con torch-pointcloud: creacion del modelo con `tp.create_model`, transformaciones de muestra y pipeline de datos incluidos.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo linguistico.
- No dispone de vision en el sentido de imagenes RGB, audio ni modo thinking.

## Casos de uso

- Percepcion LiDAR en conduccion autonoma: el modelo etiqueta cada punto de la nube captada por el sensor en clases como vehiculo, peatón, vegetacion o calzada, sirviendo como etapa de segmentacion en el pipeline de percepcion de un vehiculo autonomo en entornos urbanos, dominio cubierto por nuScenes.
- Anotacion automatica de datasets: uso del modelo para pre-etiquetar nubes de puntos y reducir el coste de anotacion manual, con revision humana posterior de las clases de mayor riesgo.
- Segmentacion de escenas urbanas para cartografia: clasificacion de puntos de calzada, acera, edificios y vegetacion para generar mapas semanticos 3D de ciudades.
- Robotica movil en exteriores: segmentacion del entorno en tiempo real para navegacion de robots o vehiculos de reparto, aprovechando el bajo numero de parametros (12,7 M) para despliegue en hardware embebido con GPU.
- Extraccion de caracteristicas para downstream: uso del backbone con `forward_features` para alimentar tareas como deteccion 3D, clustering de objetos o recuperacion de escenas, reutilizando las representaciones de 72 dimensiones.
- Analisis de datos de flotas: procesamiento por lotes de nubes de puntos recogidas por flotas de vehiculos para estudios de ocupacion de via, seguridad vial o monitorizacion de infraestructura.
- Investigacion comparativa: referencia reproducible para comparar variantes de arquitecturas de segmentacion de puntos sobre nuScenes, gracias a la integracion en torch-pointcloud y a las metricas declaradas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| nuScenes | Segmentacion de nubes de puntos | simple/mIoU | 80,47 |
| nuScenes | Segmentacion de nubes de puntos | simple/OA | 94,68 |

No se han publicado en la informacion disponible resultados de otros benchmarks ni comparaciones directas con modelos alternativos sobre las mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 12,7 millones de parametros en precision de 32 bits, el peso de los parametros ronda los 50 MB, por lo que el cuello de botella real es la memoria de activaciones y estructuras dispersas, no el modelo en si.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo requiere GPU con kernels CUDA compatibles con spconv y flash-attn.
- Compatibilidad con GPU de consumo: probable en tarjetas NVIDIA consumer con CUDA compatible, dado el reducido numero de parametros, aunque no se confirma en la model card.
- Opciones de despliegue: libreria torch-pointcloud con PyTorch, mas spconv y flash-attn compilados para la version de torch y CUDA del entorno. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables (parametros, contexto, rendimiento, licencia) sobre nuScenes, por lo que la comparativa cuantitativa se considera no disponible. Como referencia cualitativa, el propio checkpoint se define como variante "small" de la familia LitePT, cuyo paper describe la propuesta como "mas ligera pero mas fuerte" frente a transformers de puntos previos; sin embargo, no se aportan cifras de esas alternativas.

| Modelo | Parametros | Contexto | mIoU nuScenes | Licencia | Disponibilidad |
|---|---|---|---|---|
| litept-small.nuscenes.prs-eth | 12,7 M | no aplica | 80,47 | MIT | Hugging Face (torch-pointcloud) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: el modelo segmenta nubes de puntos LiDAR con 4 canales y 16 clases; no procesa texto, imagenes RGB ni audio.
- Dependencia de nuScenes: entrenado exclusivamente en nuScenes, por lo que el rendimiento puede degradarse en sensores, densidades de puntos o geografias distintas de las del dataset.
- Requisitos de compilacion fragiles: necesita spconv y flash-attn compilados para la version exacta de torch y CUDA, lo que complica el despliegue reproducible.
- Solo GPU: la model card indica kernels exclusivos de GPU, sin soporte CPU declarado.
- Riesgo de error en clases minoritarias: la OA de 94,68 puede enmascarar un rendimiento inferior en clases poco representadas; conviene revisar el mIoU por clase antes de uso critico.
- Metricas no verificadas: los resultados declarados tienen `verified: false`, por lo que no han sido confirmados de forma independiente.
- Licencia MIT: permite uso comercial, pero exige conservar el aviso de copyright y la atribucion correspondiente; conviene revisar tambien las licencias de las dependencias (spconv, flash-attn) y del dataset nuScenes para uso comercial.
- Sin garantias de calibracion: no se documentan estudios de calibracion de confianza ni de robustez ante condiciones meteorologicas adversas.
- Modelo de nicho con baja adopcion: 18 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/litept-small.nuscenes.prs-eth
- Paper LitePT: https://arxiv.org/abs/2512.13689
- Repositorio original prs-eth/LitePT: https://github.com/prs-eth/LitePT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/
- Guia de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/
