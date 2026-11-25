# torch-pointcloud/tr3d.s3dis-area5.mmdet3d

## Resumen

TR3D (Towards Real-Time Indoor 3D Object Detection) es un detector de objetos 3D para nubes de puntos en interiores. Este checkpoint concreto, publicado por `torch-pointcloud`, es una conversion a safetensors del modelo original de MMDetection3D, entrenado sobre el split Area 5 del dataset S3DIS. Detecta cinco clases de mobiliario y estructura (sillas, mesas, armarios, etc.) a partir de nubes de puntos con coordenadas, color y normales.

La relevancia del modelo reside en su diseno "fully convolutional y disperso": procesa vóxeles dispersos (sparse voxels) en lugar de operar sobre todos los puntos, lo que le permite alcanzar velocidades cercanas al tiempo real en GPUs de consumo, algo poco habitual en deteccion 3D indoor. Con solo 14,7 millones de parametros y un repo de 0,1 GB, es muy ligero comparado con los detectores 3D basados en transformers o en attention global.

Esta version esta pensada para el ecosistema `torch-pointcloud`, una libreria de PyTorch para nubes de puntos, y requiere `spconv` compilado contra la version de CUDA y PyTorch del usuario. Es una opcion practica para quien quiera integrar deteccion 3D indoor en un pipeline Python sin depender del stack completo de MMDetection3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TR3D: detector 3D fully convolutional sobre vóxeles dispersos (sparse voxel backbone + cabezas densas) |
| Parametros totales | 14.669.771 (14,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos; canales de entrada: 3, features: 128) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Clases | 5 |
| Dataset de entrenamiento | S3DIS, Area 5 |
| Canales de entrada | 3 (posicion; la model card indica color y normal en el ejemplo de uso) |
| Features internas | 128 |
| Libreria | torch-pointcloud (requiere spconv) |
| Hardware | kernels solo GPU (el autor indica `model.cuda()`) |

## Arquitectura y entrenamiento

TR3D es un detector 3D totalmente convolucional que opera sobre una representacion de vóxeles dispersos. El backbone procesa la nube de puntos cuantizada en vóxeles mediante convoluciones dispersas (spconv), extrayendo un mapa de features de 128 canales, y sobre el se aplican cabezas densas de deteccion que predicen cajas 3D y clases. La eleccion de convoluciones dispersas en lugar de attention o de operaciones densas sobre todos los puntos es lo que permite al modelo ser rapido y ligero (14,7 M de parametros).

El checkpoint fue entrenado sobre el split Area 5 de S3DIS, un dataset de escaneos RGB-D de habitaciones de oficina con anotaciones semanticas e instancias. La model card no detalla el numero de tokens/puntos de entrenamiento, la composicion exacta del dataset, ni si se aplico RLHF/DPO (no aplica en un detector). El modelo original proviene de MMDetection3D (Apache-2.0) y ha sido convertido al formato de `torch-pointcloud` por Arthur Dujardin. La innovacion principal del paper es la arquitectura fully convolutional con vóxeles dispersos orientada a inferencia en tiempo real.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos de interiores: predice cajas 3D y clase para 5 categorias de S3DIS.
- Entrada multimodal por punto: posicion (3 canales), color y normales, segun el ejemplo de la model card.
- Extraccion de features: metodo `forward_features` que devuelve un tensor de 128 canales por punto/vóxel, utilizable para tareas downstream.
- Procesamiento por lotes: soporta `collate` de multiples muestras mediante el campo `batch`.
- Inferencia solo en GPU (kernels de spconv dependientes de CUDA).
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni generacion de texto: es exclusivamente un detector 3D.

## Casos de uso

- Robotica de interior: un robot movil equipado con LiDAR o camara de profundidad puede usar TR3D para detectar sillas, mesas y armarios en tiempo real y planificar la navegacion evitando obstaculos.
- Digitalizacion de espacios (BIM): procesar escaneos de oficinas para extraer automaticamente instancias de mobiliario y generar modelos semanticos del edificio; la ventana de features de 128 canales y la salida por instancia facilitan el etiquetado.
- Realidad aumentada: superponer informacion sobre objetos fisicos detectados en una habitacion; la baja latencia del modelo lo hace apto para seguimiento en vivo desde un dispositivo movil con GPU.
- Inventario automatizado: contar y localizar sillas, mesas y armarios en un espacio interior a partir de un escaneo, sustituyendo el recuento manual.
- Preprocesado para pipelines de vision 3D: usar `forward_features` como extractor de caracteristicas para entrenar clasificadores o segmentadores downstream con menos datos.
- Investigacion en deteccion 3D: servir de baseline ligero (14,7 M de parametros) para comparar tecnicas de sparse convolution frente a detectores basados en transformers.
- Control de calidad en fabricacion o almacenes: verificar la presencia y posicion de objetos en un espacio escaneado con un sensor 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Metrica | Valor |
|---|---|---|
| S3DIS (Area 5) | mAP@0.25 | 71,33 |
| S3DIS (Area 5) | mAP@0.5 | 48,33 |

No se han publicado en la informacion disponible otros resultados (latencia, throughput, comparativas con otros detectores) mas alla de estos dos valores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 14,7 M de parametros en fp32 los pesos ocupan unos 59 MB; el consumo real dependera del numero de puntos y del tamano del voxel, pero en cualquier caso es muy inferior al de un modelo de lenguaje.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con la build de `spconv`; el autor no especifica modelos concretos.
- GPU de consumo: si, cabe holgadamente en GPUs consumer (p. ej. RTX 3060 en adelante), aunque la compilacion de `spconv` debe coincidir con la version de PyTorch y CUDA.
- Despliegue: libreria `torch-pointcloud` con `spconv`; el autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector 3D).
- Latencia y throughput: no disponibles en la informacion proporcionada; el paper original se orienta a tiempo real, pero no hay cifras en la model card.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otros detectores 3D indoor (p. ej. VoteNet, PointPillars o MinkowskiDetector) sobre S3DIS, por lo que no es posible construir una tabla rigurosa sin inventar datos.

## Limitaciones y advertencias

- Entrenado solo en S3DIS Area 5: el rendimiento fuera de ese dominio (otras habitaciones, sensores o densidades de puntos) puede degradarse notablemente.
- Solo 5 clases: no cubre categorias fuera del vocabulario de S3DIS.
- Requiere GPU y una build de `spconv` especifica para la combinacion de PyTorch y CUDA del usuario; esto complica el despliegue en entornos heterogeneos.
- Los resultados de benchmark estan marcados como no verificados por el autor.
- Riesgo de falsos positivos y negativos en escenas con oclusiones o mobiliario atipico; no hay datos de calibracion publicados.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias del dataset S3DIS y del codigo original de MMDetection3D para redistribuciones.
- No es un modelo generativo: no admite prompts, texto ni tool calling; cualquier expectativa en ese sentido es erronea.
- La model card no documenta sesgos, robustez ante ruido en la nube de puntos ni comportamiento con distintos tamanos de voxel.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/tr3d.s3dis-area5.mmdet3d
- Paper TR3D: https://arxiv.org/abs/2302.02858
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
