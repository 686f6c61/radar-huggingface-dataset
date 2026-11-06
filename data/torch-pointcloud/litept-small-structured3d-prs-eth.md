# torch-pointcloud/litept-small.structured3d.prs-eth

## Resumen

LitePT-small.structured3d.prs-eth es un modelo de segmentación semántica de nubes de puntos 3D desarrollado por el grupo de investigación PRS-ETH (Photogrammetry and Remote Sensing, ETH Zúrich) y empaquetado para la librería torch-pointcloud por Arthur Dujardin. Implementa la arquitectura LitePT, presentada en el artículo "LitePT: Lighter Yet Stronger Point Transformer" (CVPR 2026), que combina convoluciones en las primeras etapas con atención con embedding rotatorio 3D en las etapas finales para lograr un equilibrio entre eficiencia computacional y precisión.

El checkpoint concreto está entrenado sobre el dataset Structured3D y realiza segmentación semántica en 25 clases sobre nubes de puntos con 6 canales de entrada (posición, color y normales). Con solo 12,7 millones de parámetros y 72 dimensiones de características, es un modelo muy ligero pensado para entornos con recursos limitados o para despliegue en tiempo real.

Su relevancia radica en que demuestra que es posible obtener un transformer de puntos competitivo con un coste paramétrico muy bajo, lo que lo hace atractivo para aplicaciones de robótica, escaneado de interiores y reconstrucción 3D donde el cómputo es un factor limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convoluciones + atención con RoPE 3D), LitePT |
| Parametros totales | 12.718.957 (12,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (nubes de puntos, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LitePT es un transformer de nubes de puntos que adopta un diseño híbrido: las primeras etapas usan convoluciones (probablemente submanifold sparse convolutions, dado que el checkpoint requiere `spconv`) para extraer características locales de forma eficiente, mientras que las etapas finales emplean mecanismos de atención con embedding rotatorio 3D (3D rotary embedding) para capturar dependencias globales. El modelo recibe 6 canales de entrada (coordenadas, color y normales) y produce características de 72 dimensiones antes de la cabeza de clasificación de 25 clases.

El entrenamiento se realizó sobre Structured3D, un dataset fotorrealista de interiores estructurados con anotaciones semánticas. No se dispone de información detallada sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento posteriores (RLHF/DPO no aplican a este tipo de modelo). La innovación principal del artículo es lograr un modelo "más ligero pero más fuerte" que alternativas transformer de puntos de mayor tamaño.

## Capacidades

- Segmentación semántica de nubes de puntos 3D en 25 clases (típicas de escenas de interior).
- Procesamiento de nubes de puntos con posición, color y normales (6 canales de entrada).
- Extracción de características de 72 dimensiones por punto mediante `forward_features`.
- Capacidad de reinicializar el clasificador (`reset_classifier`) para transferencia a otras tareas o datasets.
- Ejecución en GPU con kernels especializados (`spconv` y `flash-attn`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión 2D, audio ni otras capacidades generativas.

## Casos de uso

- Segmentación de escenas de interior para realidad aumentada: el modelo puede etiquetar puntos de una habitación escaneada (suelo, pared, muebles) para anclar objetos virtuales sobre superficies correctas, aprovechando sus 25 clases de interior.
- Robótica móvil en interiores: integración en pipelines de percepción para que un robot identifique superficies transitables y obstáculos a partir de nubes de puntos de LiDAR o cámaras de profundidad, con un coste de 12,7 M de parámetros que cabe en GPUs embebidas.
- Digitalización de edificios (BIM): procesamiento de escaneos 3D de Structured3D-like para generar modelos semánticos de estancias y elementos estructurales.
- Análisis de nubes de puntos en el borde (edge computing): su tamaño reducido permite desplegarlo en dispositivos con recursos limitados para tareas de segmentación en tiempo real.
- Preprocesado para reconstrucción 3D: usar las características de 72 dimensiones como entrada para modelos posteriores de reconstrucción o detección.
- Investigación en transferencia de aprendizaje: reinicializar el clasificador para adaptar el backbone a nuevos datasets de nubes de puntos con menos clases.
- Control de calidad en escaneado: detectar regiones mal etiquetadas o anomalías en nubes de puntos de interiores comparando la predicción semántica con la anotación esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 12,7 M de parámetros y 72 características, el modelo es muy ligero y probablemente requiere menos de 1-2 GB para lotes pequeños de 8192 puntos, aunque no se confirma en la documentación.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y con los kernels de `spconv` y `flash-attn`; se espera funcionamiento en RTX 3090, RTX 4090, A100, H100, entre otras.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con soporte CUDA, dado su reducido tamaño.
- Opciones de despliegue: la librería torch-pointcloud (PyTorch); requiere `spconv` y `flash-attn` compilados para la versión de torch y CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de nubes de puntos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LitePT-small (este) | 12,7 M | no disponible | Segmentación semántica 3D | MIT | Hugging Face |
| LitePT (otras variantes) | no disponible | no disponible | Segmentación semántica 3D | MIT | GitHub prs-eth/LitePT |
| Point Transformer (referencia del paper) | no disponible | no disponible | Segmentación semántica 3D | no disponible | no disponible |
| Otros modelos de segmentación 3D | no disponible | no disponible | Segmentación semántica 3D | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento ni de parámetros de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en Structured3D (escenas de interior), por lo que su generalización a escenas exteriores u otros dominios no está garantizada.
- Requiere kernels GPU especializados (`spconv` y `flash-attn`) que deben compilarse para la versión concreta de PyTorch y CUDA, lo que complica el despliegue.
- El modelo es GPU-only según la model card ("GPU-only kernels"), sin soporte documentado para CPU.
- No se han publicado métricas de rendimiento (mIoU, precisión por clase) en la información disponible, lo que impide evaluar su calidad objetiva.
- Riesgo de sesgos derivados del dataset Structured3D: distribución limitada de tipos de habitaciones, estilos de mobiliario y condiciones de captura.
- Licencia MIT permite uso comercial, pero se recomienda verificar las licencias de `spconv` y `flash-attn` en producción.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- Solo 20 descargas y 0 likes en Hugging Face, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/litept-small.structured3d.prs-eth
- Paper LitePT: https://arxiv.org/abs/2512.13689
- Repositorio original prs-eth/LitePT: https://github.com/prs-eth/LitePT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- Dataset Structured3D (paper): https://arxiv.org/abs/1908.00273 (referencia ECCV 2020)
