# torch-pointcloud/pointgpt-b.shapenetpart.guangyan-chen

## Resumen

PointGPT-B ShapeNetPart es un modelo de segmentación de partes de nubes de puntos 3D, desarrollado por el autor Guangyan Chen y empaquetado por la organización `torch-pointcloud` para su uso con la librería `pytorch-pointcloud`. Se trata de un transformer generativo autorregresivo (PointGPT) afinado sobre el conjunto de datos ShapeNetPart para la tarea de segmentación de partes a nivel de punto, con 112,3 millones de parámetros y 50 clases de segmento.

El modelo parte del checkpoint base `pointgpt-b.labeled-hybrid.guangyan-chen`, preentrenado de forma autorregresiva sobre nubes de puntos, y se ha afinado específicamente para la segmentación de partes. Resuelve el problema de asignar una etiqueta de parte semántica a cada punto de una nube 3D, una tarea central en visión por computador 3D, robótica de manipulación y modelado CAD.

Su relevancia radica en que ofrece un checkpoint listo para usar con la librería `torch-pointcloud`, con pesos en formato safetensors y licencia MIT, lo que facilita su integración en pipelines de PyTorch sin depender de código de entrenamiento original. Declara un rendimiento de 85,91 de ins_mIoU y 84,02 de cls_mIoU en ShapeNetPart, si bien estos valores no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo autorregresivo (PointGPT) para nubes de puntos |
| Parametros totales | 112.342.578 (112,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (nubes de puntos de hasta 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PointGPT es un transformer generativo autorregresivo que aplica el paradigma de preentrenamiento de GPT al dominio de las nubes de puntos. El modelo divide la nube en secuencias de parches y aprende a predecir el siguiente parche, lo que le permite capturar estructura geométrica local y global. La variante "b" corresponde a la configuración base del paper, con 112,3 M de parámetros y 6720 dimensiones de características en la salida del encoder.

El checkpoint aquí descrito se ha afinado sobre ShapeNetPart, un conjunto de 16 categorías de objetos con 50 clases de partes y anotaciones a nivel de punto. El modelo base es `pointgpt-b.labeled-hybrid.guangyan-chen`, un checkpoint preentrenado de forma híbrida (etiquetada y no etiquetada) según la nomenclatura del autor. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset de preentrenamiento ni el uso de RLHF/DPO, ya que estos datos no aparecen en la información proporcionada.

La innovación principal es el uso de preentrenamiento autorregresivo sobre secuencias de parches de puntos, análogo a los modelos de lenguaje, en lugar de los enfoques contrastivos o enmascarados habituales en visión 3D. El modelo acepta coordenadas (`pos`), normales (`normal`), un índice de categoría (`category`) y devuelve logits de segmento por punto.

## Capacidades

- Segmentación de partes de nubes de puntos a nivel de punto (part segmentation) sobre 50 clases de segmento.
- Extracción de características globales de 6720 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos con coordenadas y normales, con soporte de batching mediante `collate`.
- Condicionamiento por categoría de objeto (`category`) para la predicción de partes.
- No soporta generación de texto, razonamiento lingüístico, código, matemáticas, visión 2D, audio ni tool calling.
- No dispone de modo "thinking", agentes ni razonamiento multi-paso.
- Capacidades multilingües no aplicables (modelo no lingüístico).

## Casos de uso

- Segmentación de piezas en escaneos CAD: el modelo asigna una etiqueta de parte a cada punto de una malla escaneada, lo que permite separar componentes (ruedas, puertas, asientos) en un vehículo escaneado para su posterior modelado o inspección.
- Robótica de manipulación: dado un objeto capturado por un sensor de profundidad, el modelo identifica partes (asa, tapa, cuerpo) para planificar agarres y acciones de manipulación específicas por parte.
- Inspección de calidad industrial: en líneas de fabricación, se segmentan piezas escaneadas en 3D para detectar componentes faltantes o mal ensamblados comparando la segmentación predicha con la esperada.
- Anotación asistida de datasets 3D: el modelo preetiqueta nubes de puntos a nivel de parte, reduciendo el coste de anotación manual en la creación de nuevos conjuntos de datos de segmentación.
- Realidad aumentada y edición 3D: segmentar partes de un objeto escaneado permite aplicar materiales, colores o transformaciones independientes a cada componente en herramientas de edición.
- Investigación en visión 3D: servir como baseline reproducible de PointGPT-B en ShapeNetPart para comparar nuevas arquitecturas de segmentación de partes con métricas ins_mIoU y cls_mIoU.
- Extracción de embeddings para recuperación 3D: usar las características de 6720 dimensiones como descriptor global para búsqueda de formas similares o clustering de objetos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| ShapeNetPart | point-cloud-part-segmentation | ins_mIoU | 85,91 |
| ShapeNetPart | point-cloud-part-segmentation | cls_mIoU | 84,02 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 112,3 M de parámetros; en FP32 ocupa aproximadamente 0,45 GB de pesos, y en FP16 unos 0,22 GB. Sumando activaciones y el batch de puntos, es desplegable en GPUs consumer con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para lotes grandes de nubes de 8192 puntos, se recomienda 8 GB o más.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más.
- Opciones de despliegue: la librería `torch-pointcloud` (instalable con `pip install torch-pointcloud`) sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos comparables (por ejemplo, PointNet++, PointTransformer o DGCNN) sobre ShapeNetPart, por lo que no es posible establecer una comparativa numérica rigurosa. A continuación se indican únicamente los datos del modelo evaluado:

| Modelo | Parametros | Contexto / entrada | ins_mIoU (ShapeNetPart) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-b.shapenetpart.guangyan-chen | 112,3 M | nubes de hasta 8192 puntos (ejemplo) | 85,91 (declarado) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los valores de ins_mIoU y cls_mIoU están declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse con cautela hasta su reproducción independiente.
- El modelo está especializado en segmentación de partes de ShapeNetPart (16 categorías, 50 clases de parte); su generalización a categorías de objetos fuera de ese conjunto no está documentada.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no soporta tool calling ni agentes.
- No se documentan sesgos específicos, pero al entrenarse sobre ShapeNetPart puede heredar los desequilibrios de clase y de categoría del dataset original.
- Riesgo de alucinación en el sentido de asignar etiquetas de parte incorrectas en puntos ambiguos o en objetos fuera de distribución; no se han publicado análisis de calibración.
- La licencia MIT permite uso comercial, pero se recomienda revisar las licencias del dataset ShapeNetPart y del código original de PointGPT para cumplir con sus términos.
- El ejemplo de uso requiere construir manualmente las claves `pos`, `normal`, `category` y `segment`, y aplicar `info["transform"]` y `collate`; una integración incorrecta del preprocesado puede degradar los resultados.
- No se dispone de información sobre cuantización, por lo que el despliegue en entornos de bajos recursos debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-b.shapenetpart.guangyan-chen
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-b.labeled-hybrid.guangyan-chen
- Paper PointGPT (arXiv:2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
