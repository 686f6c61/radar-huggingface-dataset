# torch-pointcloud/litept-small.nuscenes.prs-eth

## Resumen

litept-small.nuscenes.prs-eth es un modelo de segmentacion semantica de nubes de puntos 3D, desarrollado por el grupo prs-eth (ETH Zurich) y empaquetado para la libreria torch-pointcloud por el usuario torch-pointcloud. Implementa la arquitectura LitePT, presentada en el paper "LitePT: Lighter Yet Stronger Point Transformer" (CVPR 2026), que combina convoluciones en las etapas tempranas con atencion dotada de embedding rotacional 3D en las etapas tardias. El checkpoint esta entrenado sobre el dataset nuScenes para la tarea de segmentacion semantica de 16 clases.

El modelo es relevante por su relacion tamano-rendimiento: con solo 12,7 millones de parametros alcanza un mIoU de 82,01 y una precision global (OA) de 95,02 sobre nuScenes, lo que lo situa como una alternativa ligera frente a transformers de nubes de puntos de mayor coste computacional. Su tamano reducido (repo de 0,1 GB) facilita el despliegue en entornos con recursos limitados, aunque requiere kernels GPU especificos (spconv y flash-attn).

Este checkpoint concreto corresponde a la variante "small" entrenada en nuScenes y distribuida en formato safetensors a traves de la libreria torch-pointcloud, que abstrae la carga del modelo y las transformaciones de datos. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que asigna una etiqueta semantica a cada punto de una nube 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LitePT (convoluciones en etapas tempranas, atencion con embedding rotacional 3D en etapas tardias) |
| Parametros totales | 12.709.300 (12,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 |
| Clases de salida | 16 |
| Dimension de caracteristicas | 72 |
| Dataset de entrenamiento | nuScenes |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

LitePT es un transformer de nubes de puntos que adopta un diseno hibrido: las primeras etapas emplean convoluciones (con spconv como backend) para extraer caracteristicas locales de forma eficiente, mientras que las etapas finales usan atencion con embedding rotacional 3D (3D rotary embedding) para capturar dependencias globales. Esta combinacion busca reducir el coste computacional de los point transformers clasicos sin sacrificar precision. El modelo procesa puntos con 4 canales de entrada (coordenadas xyz mas intensidad) y produce logits para 16 clases semanticas, con una dimension de caracteristicas de 72.

El checkpoint esta entrenado sobre nuScenes, el dataset multimodal para conduccion autonoma de Motional (CVPR 2020), que incluye nubes de puntos LiDAR anotadas semanticamente. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de refinamiento posteriores (RLHF/DPO no aplican a este dominio). El modelo fue convertido desde el repositorio oficial prs-eth/LitePT (licencia MIT) al formato de torch-pointcloud. La inferencia requiere kernels GPU especificos: spconv y flash-attn, que deben compilarse contra la version de torch y CUDA del entorno.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D: asigna una de 16 clases a cada punto de la nube.
- Procesamiento de nubes LiDAR con 4 canales de entrada (xyz + intensidad).
- Extraccion de caracteristicas: mediante `forward_features` o `reset_classifier(num_classes=0)` se obtiene un vector de 72 dimensiones por punto.
- Inferencia GPU-only: los kernels de spconv y flash-attn requieren CUDA.
- No soporta tool calling, function calling ni agentes: no es un modelo linguistico.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision 2D, audio ni modo thinking.
- Capacidades multilingues: no aplica.

## Casos de uso

- Segmentacion LiDAR en conduccion autonoma: el modelo etiqueta cada punto de la nube con una de las 16 clases de nuScenes (vehiculo, peaton, calzada, vegetacion, etc.), lo que permite construir mapas semanticos del entorno en tiempo real con un coste de 12,7 M de parametros.
- Preprocesado para deteccion de obstaculos: la salida semantica por punto puede alimentar etapas posteriores de deteccion o planificacion, filtrando clases irrelevantes (vegetacion, edificios) antes de aplicar detectores 3D.
- Etiquetado asistido de datos: el modelo puede generar preanotaciones semanticas sobre nuevas capturas LiDAR para acelerar el trabajo de anotacion humana, dado su bajo coste de inferencia.
- Robotica movil y navegacion: la segmentacion semantica del suelo y de obstaculos permite a un robot distinguir superficies transitables de obstaculos en interiores o exteriores con recursos de computo limitados.
- Extraccion de caracteristicas para tareas downstream: usando el vector de 72 dimensiones por punto como entrada a clasificadores o modelos de deteccion propios, sin reentrenar el backbone.
- Investigacion en point transformers eficientes: sirve como baseline ligero para comparar arquitecturas hibridas convolucion-atencion en benchmarks de segmentacion 3D.
- Analisis de escenas urbanas a gran escala: el reducido tamano del checkpoint (0,1 GB) permite procesar grandes volumenes de nubes de puntos en pipelines por lotes con GPUs de gama media.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor |
|---|---|
| mIoU (nuScenes) | 82,01 |
| OA (nuScenes) | 95,02 |
| simple/mIoU (nuScenes) | 80,47 |
| simple/OA (nuScenes) | 94,68 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 12,7 M de parametros el peso del modelo es de decenas de MB, pero el consumo real depende del numero de puntos por lote y de los kernels de spconv/flash-attn.
- GPU recomendadas: no especificadas en la model card; la inferencia es GPU-only (requiere CUDA).
- Cabe en GPU consumer: previsiblemente si, dado el reducido numero de parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: libreria torch-pointcloud (PyTorch), con dependencias de spconv y flash-attn compiladas contra la version de torch y CUDA del entorno. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparativas con otros modelos de segmentacion de nubes de puntos (como PointNet++, MinkowskiNet, SPVCNN o variantes de Point Transformer).

## Limitaciones y advertencias

- Modelo de dominio especifico: solo realiza segmentacion semantica de nubes de puntos; no es un modelo de lenguaje ni procesa texto.
- Entrenado exclusivamente en nuScenes: puede degradarse en dominios distintos (sensores LiDAR diferentes, escenas interiores, otros paises) sin reentrenamiento o ajuste fino.
- Salida limitada a 16 clases: no cubre categorias fuera del esquema de nuScenes.
- Dependencias fragiles: requiere spconv y flash-attn compilados contra la version exacta de torch y CUDA, lo que complica el despliegue en produccion.
- Inferencia GPU-only: no hay soporte CPU documentado.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero puede producir etiquetas erroneas en puntos ambiguos u oclusiones.
- Sesgos: no documentados en la informacion disponible; cabe esperar sesgos derivados de la distribucion del dataset nuScenes (escenas urbanas de Boston y Singapur).
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datasets y dependencias (spconv, flash-attn) utilizados.
- Resultados de benchmarks no verificados (`verified: false` en la model card): tratarlos como declaraciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/litept-small.nuscenes.prs-eth
- Paper LitePT: https://arxiv.org/abs/2512.13689
- Repositorio oficial LitePT: https://github.com/prs-eth/LitePT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/
