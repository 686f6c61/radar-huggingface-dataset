# torch-pointcloud/pointgpt-b.post-pretrain.guangyan-chen

## Resumen

PointGPT-B post-pretrain (variante de Guangyan Chen) es un modelo transformer para clasificación de nubes de puntos 3D, derivado del trabajo PointGPT publicado en NeurIPS 2023. Lo desarrolla el autor original Guangyan Chen y ha sido convertido y empaquetado por el proyecto torch-pointcloud (Arthur Dujardin) para su uso con la librería del mismo nombre. El modelo parte de un preentrenamiento generativo autorregresivo sobre nubes de puntos y se ha ajustado posteriormente sobre el dataset LabeledHybrid para una tarea de clasificación de 87 clases.

El problema que resuelve es el reconocimiento de objetos 3D a partir de nubes de puntos, un dominio donde los transformers han ido ganando terreno frente a arquitecturas convolucionales específicas (PointNet++, DGCNN). La propuesta de PointGPT aplica la idea de GPT al dominio 3D: dividir la nube de puntos en parches, ordenarlos y predecir el siguiente parche de forma autorregresiva, generando representaciones transferibles.

Con 120,4 millones de parámetros y una dimensión de características de 1536, es un modelo de tamaño medio dentro del ecosistema de nubes de puntos. Su relevancia actual es acotada: no es un modelo de lenguaje ni un modelo multimodal, sino un clasificador 3D especializado, útil como extractor de características o backbone para tareas de visión 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (PointGPT, preentrenamiento generativo autorregresivo sobre nubes de puntos) |
| Parametros totales | 120.412.599 (120,4 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Numero de clases | 87 |
| Dimension de caracteristicas | 1536 |
| Dataset de ajuste | LabeledHybrid |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer que adapta el paradigma de preentrenamiento generativo autorregresivo de GPT al dominio de las nubes de puntos. La nube se divide en parches locales; el modelo aprende a predecir el siguiente parche a partir de los anteriores, lo que le obliga a construir representaciones geométricas y semánticas del objeto completo. Este preentrenamiento se realiza sobre el modelo base `torch-pointcloud/pointgpt-b.pretrain.guangyan-chen`.

La variante aquí descrita es un ajuste posterior (post-pretrain) sobre el dataset LabeledHybrid, con una cabeza de clasificación de 87 clases. El modelo card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en este dominio). Tampoco se especifica el número de puntos de entrada utilizado durante el ajuste; el ejemplo de uso del model card emplea 8192 puntos sintéticos, pero no se confirma que sea el valor de entrenamiento.

## Capacidades

- Clasificación de nubes de puntos 3D en 87 clases.
- Extracción de características: la salida `forward_features` produce embeddings de dimensión 1536 por muestra.
- Uso como backbone congelado o ajustable para tareas posteriores (detección, segmentación) mediante `reset_classifier`.
- Procesamiento de nubes de puntos de tamaño variable (el ejemplo usa 8192 puntos).
- No soporta tool calling, function calling ni agentes: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión 2D, audio ni generación de texto.
- No dispone de modo "thinking" ni razonamiento simbólico.

## Casos de uso

- Clasificación de objetos 3D en pipelines de robótica: el modelo recibe nubes de puntos de sensores LiDAR o cámaras de profundidad y devuelve una de las 87 clases, útil para manipulación o navegación.
- Extracción de embeddings para búsqueda y recuperación 3D: usando `forward_features` se obtienen vectores de 1536 dimensiones que pueden indexarse para búsqueda por similitud de formas.
- Etiquetado automático de datasets de nubes de puntos: preanotación de escenas para reducir el coste de anotación manual antes de la revisión humana.
- Backbone para transfer learning en tareas 3D específicas: se congela el extractor y se entrena una cabeza nueva con `reset_classifier` para segmentación o detección con pocos datos.
- Control de calidad en fabricación: clasificación de piezas escaneadas en 3D para detectar categorías o componentes en líneas de inspección.
- Investigación en visión 3D: reproducción de experimentos de PointGPT y comparación de representaciones autorregresivas frente a enfoques contrastivos o convolucionales.
- Vehículos autónomos y percepción: clasificación de objetos detectados en la nube de puntos como módulo auxiliar dentro de un stack de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye métricas de precisión, exactitud ni comparaciones numéricas sobre LabeledHybrid u otros datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 120,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,48 GB; en fp16, unos 0,24 GB. La memoria real depende del número de puntos de entrada y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar inferencia en fp32 con lotes pequeños. Para lotes grandes o entrenamiento, se recomienda una RTX 3090/4090 (24 GB) o una A100/H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores, siempre que se ajuste el número de puntos y el tamaño de lote.
- Opciones de despliegue: la librería torch-pointcloud sobre PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no son aplicables a este dominio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-B post-pretrain (este) | 120,4 M | Nube de puntos (ej. 8192 puntos) | Clasificación 3D (87 clases) | MIT | HuggingFace (torch-pointcloud) |
| PointGPT-B pretrain (base) | no disponible | Nube de puntos | Backbone preentrenado | MIT | HuggingFace |
| PointNet++ | no disponible | Nube de puntos | Clasificación/segmentación 3D | no disponible | Referencia académica |
| DGCNN | no disponible | Nube de puntos | Clasificación/segmentación 3D | no disponible | Referencia académica |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en nubes de puntos: no procesa texto, imágenes 2D ni audio; no debe evaluarse como un LLM.
- El dataset LabeledHybrid no está descrito en detalle; se desconoce su composición, balance de clases y posibles sesgos geográficos o de captura.
- Riesgo de sobreajuste a las 87 clases del ajuste: las clases no presentes en el dataset no serán reconocidas.
- Sensibilidad al número de puntos y a la densidad de la nube: el rendimiento puede degradarse con entradas muy dispersas o con ruido de sensor.
- No hay métricas publicadas que permitan estimar la precisión real en producción.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las licencias del modelo base y del código original de PointGPT.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad; conviene verificar los pesos antes de usarlos en producción.
- La fecha de creación indicada (2026-11-05) es futura respecto a la redacción habitual de fichas; verificar la vigencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/pointgpt-b.post-pretrain.guangyan-chen
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-b.pretrain.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
