# superpoint-transformer/checkpoints

## Resumen

El repositorio `superpoint-transformer/checkpoints` publica los pesos preentrenados de la familia de modelos **Superpoint Transformer** (SPT), junto con sus variantes **SPT-nano**, **SuperCluster** y **EZ-SP**, desarrollados por Damien Robert, Hugo Raguet y Loïc Landrieu en el marco del proyecto de código abierto `drprojects/superpoint_transformer`. No se trata de un modelo de lenguaje, sino de un conjunto de modelos de segmentación 3D sobre nubes de puntos, orientados a segmentación semántica y panóptica de escenas 3D.

El modelo resuelve el problema de etiquetar geométricamente nubes de puntos a nivel de *superpunto* (agrupaciones locales de puntos), lo que reduce drásticamente el coste computacional frente a operar punto a punto. La arquitectura se basa en un transformer que opera sobre un grafo jerárquico de superpuntos, con una variante ligera (SPT-nano) y un enfoque de clustering de grafos de superpuntos para la tarea panóptica (SuperCluster). EZ-SP es una propuesta posterior, más rápida y ligera, presentada en ICRA 2026.

La relevancia actual reside en que estos checkpoints (versión `v3.1.0`) cubren cuatro conjuntos de datos de referencia —S3DIS, KITTI-360, DALES y ScanNet— con resultados publicados de mIoU y PQ, y se distribuyen bajo licencia MIT, lo que facilita su uso tanto en investigación como en producción. El repositorio ocupa 0.1 GB y está pensado para integrarse con la librería PyTorch Lightning del proyecto original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer sobre grafo jerárquico de superpuntos (SPT, SPT-nano, EZ-SP); clustering de grafo de superpuntos (SuperCluster) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`, gestionados con PyTorch Lightning) |

## Arquitectura y entrenamiento

SPT es un transformer que trabaja sobre una partición jerárquica de la nube de puntos en superpuntos, construida mediante un grafo de adyacencia geométrica. En lugar de procesar cada punto individualmente, el modelo agrega información a nivel de superpunto y aplica atención sobre el grafo resultante, lo que reduce el número de tokens de entrada y permite escalar a escenas grandes. SPT-nano es una variante reducida del mismo diseño, orientada a menor coste computacional. SuperCluster reformula la segmentación panóptica como un problema de clustering sobre el grafo de superpuntos, mientras que EZ-SP (Geist, Landrieu y Robert, ICRA 2026) propone una variante "rápida y ligera" basada también en superpuntos.

Los checkpoints publicados corresponden a la versión `v3.1.0` del código y su preprocesamiento; según la model card, no son compatibles con los datasets preprocesados ni con los checkpoints de `v3.0`. Cada checkpoint es el mejor de 3 semillas (mejor puntuación de validación: mIoU para segmentación semántica, PQ para SuperCluster) en su mejor época de validación, entrenado con las configuraciones por defecto de `v3.1`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si se empleó RLHF/DPO (no aplicable a este tipo de modelo).

## Capacidades

- Segmentación semántica 3D de nubes de puntos (asignación de clase por punto/superpunto).
- Segmentación panóptica 3D (instancias + semántica) mediante SuperCluster.
- Funcionamiento sobre escenas de interior (S3DIS, ScanNet) y exterior (KITTI-360, DALES).
- Variante ligera (SPT-nano) para entornos con restricciones de cómputo.
- Variante rápida y ligera (EZ-SP) orientada a inferencia eficiente.
- Soporte de partición CNN específica para EZ-SP (`ezsp_partition_*.ckpt`).
- Integración con PyTorch Lightning para entrenamiento y evaluación.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Segmentación semántica de interiores para modelado BIM: SPT sobre S3DIS o ScanNet permite etiquetar paredes, suelo, mobiliario y elementos estructurales en escaneos de edificios, facilitando la generación de modelos digitales.
- Inventario urbano y de infraestructuras: el checkpoint de KITTI-360 (mIoU 64.7) permite clasificar elementos de escenas de conducción, útil para cartografía y análisis de entorno vial.
- Análisis forestal y de vegetación aérea: el checkpoint de DALES (mIoU 82.8 para SPT) segmenta nubes de puntos LiDAR aéreas en clases como árboles, edificios y suelo, aplicable a inventarios forestales.
- Segmentación panóptica de escenas para robótica: SuperCluster (PQ 60.8 en ScanNet Val) separa instancias de objetos y clases semánticas, útil para percepción en robots móviles y manipulación.
- Despliegue en dispositivos con recursos limitados: SPT-nano (mIoU 70.1 en S3DIS 6-Fold) reduce el coste computacional manteniendo precisión razonable, adecuado para sistemas embebidos o inferencia en el borde.
- Procesamiento rápido en pipelines de producción: EZ-SP, presentado como "rápido y ligero", puede integrarse en flujos de captura y etiquetado automático de nubes de puntos a gran escala.
- Investigación en segmentación 3D: los checkpoints y sus configuraciones por defecto permiten reproducir resultados y servir de línea base para nuevos métodos.

## Benchmarks y rendimiento

Resultados publicados en la model card (versión `v3.1.0`):

| Modelo | Métrica | S3DIS 6-Fold | S3DIS Area 5 | KITTI-360 Val | DALES | ScanNet Val |
|:--|:-:|:-:|:-:|:-:|:-:|:-:|
| SPT | mIoU | 76.3 | 69.7 | 64.7 | 82.8 | 70.3 |
| SPT-nano | mIoU | 70.1 | 64.9 | 60.5 | 80.1 | no disponible |
| EZ-SP | mIoU | 76.4 | 69.2 | 64.3 | 81.6 | 68.5 |
| SuperCluster | PQ | 56.9 | 49.8 | 49.4 | 62.0 | 60.8 |

Notas de la model card: S3DIS 6-Fold se evalúa con un checkpoint por fold sobre su área de test; la mIoU se calcula a partir de la suma de las 6 matrices de confusión y la PQ a partir de la unión de las 6 áreas de test. SuperCluster en S3DIS 6-Fold con "stuff" alcanza 64.4 PQ.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: integración con PyTorch y PyTorch Lightning (librería declarada); no se documentan otros backends (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento (S3DIS 6-Fold mIoU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SPT | Transformer sobre superpuntos | no disponible | no aplica | 76.3 | MIT | Hugging Face + GitHub |
| SPT-nano | Transformer ligero sobre superpuntos | no disponible | no aplica | 70.1 | MIT | Hugging Face + GitHub |
| EZ-SP | Superpuntos rápido y ligero | no disponible | no aplica | 76.4 | MIT | Hugging Face + GitHub |
| SuperCluster | Clustering de grafo de superpuntos (panóptico) | no disponible | no aplica | 56.9 PQ (panóptico) | MIT | Hugging Face + GitHub |

No se dispone en la información proporcionada de otros modelos comparables de terceros con datos de parámetros o rendimiento para contrastar.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; su ámbito es exclusivamente la segmentación 3D de nubes de puntos.
- Los checkpoints `v3.1` solo funcionan con el código `v3.1` y su preprocesamiento; los datasets y checkpoints de `v3.0` no son compatibles.
- Cada checkpoint es el mejor de 3 semillas en su mejor época de validación, lo que puede implicar una selección optimista respecto a una única ejecución.
- El rendimiento está ligado a los dominios de entrenamiento (S3DIS, KITTI-360, DALES, ScanNet); la generalización a otras distribuciones de sensores o entornos no está documentada.
- No se detallan sesgos, tasas de alucinación ni limitaciones idiomáticas (no aplicables), ni restricciones de licencia para uso comercial más allá de la licencia MIT.
- No se documentan requisitos de hardware, latencias ni opciones de despliegue alternativas, lo que limita la planificación de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/superpoint-transformer/checkpoints
- Repositorio de código: https://github.com/drprojects/superpoint_transformer
- Instrucciones de evaluación: https://github.com/drprojects/superpoint_transformer#evaluation
- CHANGELOG: https://github.com/drprojects/superpoint_transformer/blob/master/CHANGELOG.md
- Resultados detallados, tiempos de entrenamiento y ablaciones: https://github.com/drprojects/superpoint_transformer/pull/256
- Paper SPT (ICCV 2023): Robert, Raguet, Landrieu, "Efficient 3D Semantic Segmentation with Superpoint Transformer"
- Paper SuperCluster (3DV 2024): Robert, Raguet, Landrieu, "Scalable 3D Panoptic Segmentation as Superpoint Graph Clustering"
- Paper EZ-SP (ICRA 2026): Geist, Landrieu, Robert, "EZ-SP: Fast and Lightweight Superpoint-Based 3D Segmentation"
