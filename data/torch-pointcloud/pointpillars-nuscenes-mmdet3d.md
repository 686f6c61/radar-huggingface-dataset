# torch-pointcloud/pointpillars.nuscenes.mmdet3d

## Resumen

PointPillars es un detector de objetos 3D para nubes de puntos LiDAR que emplea un codificador de pilares (pillar encoder) seguido de una red troncal 2D. Este checkpoint concreto, `torch-pointcloud/pointpillars.nuscenes.mmdet3d`, ha sido convertido desde MMDetection3D al formato de la librería `torch-pointcloud` y está entrenado sobre el dataset nuScenes para detección de 10 clases de objetos. Con apenas 4,9 millones de parámetros, es un modelo extremadamente ligero pensado para inferencia en tiempo real en entornos de conducción autónoma.

Su relevancia actual radica en que ofrece una implementación moderna y empaquetada (vía `pip install torch-pointcloud`) de un clásico de 2019 que sigue siendo referencia por su equilibrio entre velocidad y precisión. Frente a detectores basados en vóxeles 3D o en transformers de nubes de puntos, PointPillars mantiene un coste computacional muy bajo al proyectar la nube en una rejilla de pilares y procesarla con convoluciones 2D.

El modelo reporta un mAP de 34,69 y un NDS de 49,04 sobre nuScenes, métricas declaradas por el autor y no verificadas de forma independiente. La licencia Apache-2.0 facilita su uso comercial, aunque las limitaciones de precisión frente a detectores más modernos deben tenerse en cuenta en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (pillar encoder + backbone 2D, deteccion en una etapa) |
| Parametros totales | 4.934.822 (~4,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision 3D sobre nubes de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos: canales de entrada 4, 10 clases de salida, 384 canales de caracteristicas en el extractor.

## Arquitectura y entrenamiento

PointPillars organiza la nube de puntos LiDAR en una rejilla de pilares verticales y aplica un codificador tipo PointNet simplificado para obtener una representacion densa en 2D (pseudo-imagen), sobre la que opera una red troncal convolucional 2D con deteccion en una sola etapa. Esta eleccion evita las convoluciones 3D y los voxel encoders costosos, lo que permite inferencia en tiempo real. El checkpoint concreto usa 4 canales de entrada, 10 clases y 384 canales de caracteristicas, con un total de 4,9 M de parametros.

El modelo fue entrenado sobre nuScenes, un dataset multimodal de conduccion autonoma con 1000 escenas anotadas en 10 clases de objetos. Este checkpoint no se ha entrenado desde cero en `torch-pointcloud`, sino que ha sido convertido desde MMDetection3D (Apache-2.0), lo que implica que reproduce la configuracion y el pipeline de entrenamiento originales de esa implementacion. No se dispone de informacion sobre el numero exacto de tokens/puntos, composicion detallada del dataset ni sobre tecnicas de aumentado o regularizacion empleadas en este checkpoint concreto.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR con 10 clases de nuScenes (coche, peaton, ciclista, autobus, camion, etc.).
- Prediccion de cajas 3D con orientacion (yaw) y clase asociada.
- Extraccion de caracteristicas de 384 canales mediante `forward_features`, util para tareas posteriores de representacion o fine-tuning.
- Inferencia sobre lotes de nubes de puntos con voxelizacion y collate integrados en la libreria.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente perceptivo de vision 3D.
- No dispone de capacidades multilingues ni de modalidades de audio o texto.

## Casos de uso

- Percepcion 3D en vehiculos autonomos: el modelo detecta coches, peatones y ciclistas en la nube LiDAR de nuScenes con un coste de 4,9 M de parametros, adecuado para sistemas empotrados con requisitos de tiempo real.
- Prototipado rapido de pipelines de deteccion 3D: al instalarse con `pip install torch-pointcloud` y cargarse con `tp.create_model`, permite montar un baseline funcional en pocas lineas antes de invertir en modelos mas pesados.
- Extraccion de caracteristicas para clasificacion de escenas: `forward_features` devuelve un vector de 384 canales por pilar que puede alimentar tareas de segmentacion o clasificacion de entorno.
- Sistemas ADAS de bajo coste: su reducido tamano permite desplegarlo en GPUs de gama media o incluso en plataformas embebidas con CUDA, sirviendo como detector de respaldo o de redundancia.
- Generacion de etiquetas pseudo-automaticas: usar el modelo para pre-anotar nubes de puntos en nuevos datasets y acelerar el etiquetado humano, aceptando su menor precision frente a detectores de ultima generacion.
- Educacion e investigacion: referencia clasica para estudiar codificadores de pilares y comparar arquitecturas en cursos o papers de vision 3D.
- Integracion en pipelines de MMDetection3D: al proceder de esa libreria, encaja en flujos existentes de entrenamiento y evaluacion estandar de deteccion 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| nuScenes | mAP | 34,69 |
| nuScenes | NDS | 49,04 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en FP32 (4,9 M de parametros), y aun menor en FP16; el consumo dominante proviene de las activaciones de la rejilla de pilares, no de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, desde RTX 3060 en adelante; tambien funciona en A100/H100 pero el modelo esta sobredimensionado para ellas.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1650, RTX 3050, RTX 4090) y potencialmente en plataformas embebidas tipo Jetson.
- Opciones de despliegue: la libreria `torch-pointcloud` (PyTorch nativo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la arquitectura y el tamano se espera inferencia en tiempo real, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP (nuScenes) | NDS (nuScenes) | Licencia |
|---|---|---|---|---|---|
| PointPillars (este checkpoint) | 4,9 M | LiDAR | 34,69 | 49,04 | Apache-2.0 |
| CenterPoint | no disponible | LiDAR | no disponible | no disponible | no disponible |
| VoxelNet | no disponible | LiDAR | no disponible | no disponible | no disponible |
| SECOND | no disponible | LiDAR | no disponible | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada; se citan como referencias de la misma categoria (detectores 3D sobre nuScenes) sin cifras comparables.

## Limitaciones y advertencias

- Las metricas (mAP 34,69, NDS 49,04) estan declaradas por el autor y marcadas como no verificadas; deben tomarse con cautela.
- Precisión modesta frente a detectores 3D mas modernos (basados en voxeles o transformers); puede no ser suficiente para produccion exigente en seguridad.
- Entrenado exclusivamente sobre nuScenes (entorno de conduccion urbana en Boston y Singapur); el rendimiento puede degradarse en otros dominios, sensores o condiciones meteorologicas.
- Solo procesa LiDAR; no fusiona camara ni radar, lo que limita la robustez en escenarios con nubes de puntos dispersas.
- No apto para tareas de lenguaje, texto o dialogo; cualquier uso en ese sentido es un error de aplicacion.
- Riesgo de falsos negativos en objetos pequenos o lejanos y de confusion entre clases similares (p. ej., camion y autobus), habitual en detectores de una etapa.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias y la responsabilidad del despliegue recae en el integrador.
- No se documentan sesgos especificos, pero al entrenarse en dos ciudades concretas puede heredar sesgos geograficos y de composicion del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pointpillars.nuscenes.mmdet3d
- Paper PointPillars: https://arxiv.org/abs/1812.05784
- Paper nuScenes: https://arxiv.org/abs/1903.11027
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- DOI Zenodo de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
