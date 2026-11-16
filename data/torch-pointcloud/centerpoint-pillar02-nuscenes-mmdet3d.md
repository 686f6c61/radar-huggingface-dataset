# torch-pointcloud/centerpoint-pillar02.nuscenes.mmdet3d

## Resumen

CenterPoint-Pillar02 es un modelo de detección de objetos 3D sobre nubes de puntos LiDAR, entrenado específicamente sobre el dataset nuScenes. Lo desarrolla el proyecto torch-pointcloud (Arthur Dujardin) como conversión del checkpoint original de MMDetection3D, y se publica bajo licencia Apache-2.0. Resuelve el problema de localizar y clasificar objetos tridimensionales (coches, peatones, ciclistas, etc.) en escenas de conducción autónoma, entregando cajas 3D orientadas directamente a partir de vóxeles de LiDAR.

La arquitectura es un detector basado en centros (center-based) que proyecta la nube de puntos a una representación BEV (bird's-eye view) mediante un codificador de pilares (PillarFeatureNet), y sobre ese mapa de calor predice centros de objetos, dimensiones, orientación y velocidad. El modelo es muy compacto: 5.993.606 parámetros totales (6,0 M), 384 canales de features, 10 clases y 5 canales de entrada. No es un modelo de lenguaje: no tiene contexto de tokens ni capacidades generativas.

Su relevancia actual radica en que ofrece un checkpoint ligero, listo para producción en pipelines de percepción 3D, con pesos en safetensors y una API de alto nivel en la librería torch-pointcloud. En nuScenes reporta mAP 48,4 y NDS 58,85 según la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterPoint (detector center-based sobre BEV, backbone de pilares) |
| Parametros totales | 5.993.606 (6,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de detección 3D, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 5 |
| Clases | 10 |
| Canales de features | 384 |
| Dataset de entrenamiento | nuScenes |
| Tarea | Detección de objetos 3D (3d-object-detection) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CenterPoint propuesta por Yin, Zhou y Krähenbühl (CVPR 2021). La nube de puntos LiDAR se voxeliza en pilares verticales y se procesa con un codificador de pilares (PillarFeatureNet) que produce una representación BEV. Sobre ese mapa de características 2D se aplican cabezas de detección que predicen, para cada clase, un mapa de calor de centros, el offset de centro, la altura, las dimensiones de la caja 3D, la orientación (yaw) y la velocidad. La decodificación es agnóstica a la orientación y se resuelve con supresión no máxima (NMS) circular en BEV.

El checkpoint se ha convertido desde MMDetection3D (open-mmlab, Apache-2.0) al formato de torch-pointcloud. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset más allá de nuScenes ni si hubo etapas de refinamiento adicionales; esos datos figuran como no disponibles. El modelo opera con kernels GPU-only (spconv), lo que condiciona su despliegue.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: cajas 3D con centro, dimensiones, orientación y velocidad.
- Clasificación en 10 clases de nuScenes (coche, camión, autobús, peatón, motocicleta, bicicleta, remolque, construcción, tráfico y otros).
- Extracción de features BEV de 384 canales mediante `forward_features`, útil como backbone para tareas posteriores.
- Procesamiento de muestras con posición, intensidad y timestamp por punto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües, de visión 2D, audio ni modo "thinking".

## Casos de uso

- Percepción en vehículos autónomos: detección de obstáculos 3D en tiempo real a partir del LiDAR, con cajas orientadas que alimentan planificadores de trayectoria y módulos de evitación de colisiones.
- Anotación automática de datasets: pre-etiquetado de nubes de puntos para acelerar el etiquetado humano en proyectos de percepción, usando las detecciones como propuestas iniciales.
- Análisis de tráfico urbano: conteo y clasificación de vehículos y peatones en grabaciones LiDAR para estudios de movilidad o seguridad vial.
- Robótica móvil en exteriores: navegación de robots o AGV con detección de personas y vehículos en entornos dinámicos.
- Backbone de features BEV: extracción de representaciones de 384 canales para entrenar cabezas auxiliares (segmentación BEV, predicción de ocupación) sobre el mismo encoder.
- Sistemas de vigilancia y seguridad en infraestructuras: detección de intrusiones o presencia de personas en zonas monitorizadas con LiDAR.
- Validación y benchmarking: punto de referencia ligero (6 M de parámetros) para comparar pipelines de percepción 3D y reproducir resultados de CenterPoint en nuScenes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Dataset | Verificado |
|---|---|---|---|
| mAP | 48,4 | nuScenes | No |
| NDS | 58,85 | nuScenes | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 6 M de parámetros el peso del modelo es de unos pocos MB, pero el consumo real depende del tamaño del batch y de la resolución de la rejilla BEV y de los vóxeles.
- GPU recomendadas: no disponibles en la model card; requiere GPU con soporte CUDA por el uso de kernels spconv.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas NVIDIA con CUDA (p. ej. RTX 30xx/40xx), aunque no se confirma en la documentación.
- Despliegue: la librería oficial es torch-pointcloud (`pip install torch-pointcloud`), que requiere compilar `spconv` contra la versión de torch y CUDA instaladas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP (nuScenes) | NDS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| centerpoint-pillar02.nuscenes.mmdet3d | 6,0 M | no aplica | 48,4 | 58,85 | Apache-2.0 | Hugging Face |
| CenterPoint original (MMDetection3D) | no disponible | no aplica | no disponible | no disponible | Apache-2.0 | GitHub |
| Alternativas de detección 3D (p. ej. PointPillars, VoxelNet) | no disponible | no aplica | no disponible | no disponible | varía | varía |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; los valores de la comparativa deben contrastarse con las publicaciones originales antes de usarse en producción.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en nuScenes: su generalización a otros sensores, geografías o condiciones meteorológicas no está garantizada.
- Solo procesa LiDAR; no fusiona cámara ni radar, por lo que pierde información semántica y de textura.
- Los kernels son GPU-only (spconv), lo que impide inferencia en CPU y complica el despliegue en entornos sin CUDA.
- Requiere compilar spconv con una versión concreta de torch y CUDA; los desajustes de versión son una fuente habitual de errores.
- Los resultados de mAP y NDS están declarados por el autor y no verificados de forma independiente.
- Riesgo de falsos negativos en objetos pequeños, ocluidos o a gran distancia, inherente a la representación por pilares.
- No se documentan sesgos específicos del dataset ni limitaciones idiomáticas (no aplica).
- La licencia Apache-2.0 permite uso comercial, pero debe revisarse la licencia de nuScenes y de los pesos originales de MMDetection3D para cumplir con sus términos.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/centerpoint-pillar02.nuscenes.mmdet3d
- Paper CenterPoint: https://arxiv.org/abs/2006.11275
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Dataset nuScenes: https://www.nuscenes.org/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
