# torch-pointcloud/pointgpt-l.shapenetpart.guangyan-chen

## Resumen

PointGPT-L es un modelo de segmentación de partes de nubes de puntos 3D basado en la arquitectura PointGPT, un transformer generativo autorregresivo preentrenado sobre nubes de puntos. Esta variante concreta, publicada por el autor `torch-pointcloud` (Arthur Dujardin), es un ajuste fino del checkpoint base `pointgpt-l.labeled-hybrid.guangyan-chen` sobre el conjunto de datos ShapeNetPart para la tarea de segmentación semántica de partes de objetos 3D.

El modelo cuenta con 188,1 millones de parámetros y está empaquetado en formato `safetensors` dentro de la librería `torch-pointcloud`, lo que facilita su carga mediante una API de alto nivel (`tp.create_model`). No se trata de un modelo de lenguaje: opera sobre coordenadas 3D y normales de superficie, y produce logits de segmentación por punto para 50 clases de partes.

Su relevancia radica en que ofrece un punto de partida preentrenado y listo para usar en tareas de segmentación de partes 3D, con resultados declarados de 86,8 de ins_mIoU y 84,36 de cls_mIoU en ShapeNetPart. Está liberado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointGPT (transformer generativo autorregresivo para nubes de puntos) |
| Parámetros totales | 188.152.114 (188,1 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; procesa geometría 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PointGPT es un transformer que adapta el paradigma de preentrenamiento generativo autorregresivo de los modelos de lenguaje al dominio de las nubes de puntos. El modelo divide la nube en parches (patches) y aprende a predecir el siguiente parche a partir de los anteriores, lo que le permite capturar estructura geométrica local y global. Esta variante es un ajuste fino supervisado sobre ShapeNetPart, con 50 clases de partes y una dimensión de características de 8256.

El preentrenamiento original se describe en el artículo "PointGPT: Auto-regressively Generative Pre-training from Point Clouds" (NeurIPS 2023), de Chen et al. El checkpoint aquí publicado deriva del modelo base `pointgpt-l.labeled-hybrid.guangyan-chen` y ha sido convertido desde el repositorio oficial `CGuangyan-BIT/PointGPT` (MIT) al formato de la librería `torch-pointcloud`. No se dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Segmentación de partes de objetos 3D: asigna una etiqueta de parte a cada punto de la nube (50 clases en ShapeNetPart).
- Segmentación semántica por punto con soporte de categoría de objeto como entrada auxiliar.
- Extracción de características globales y por punto mediante `forward_features` (vector de 8256 dimensiones).
- Procesamiento de nubes de puntos de hasta 8192 puntos por muestra (según el ejemplo de la model card).
- Uso de coordenadas (`pos`) y normales (`normal`) como entrada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente geométrico.

## Casos de uso

- Segmentación de partes en escaneos 3D industriales: el modelo puede etiquetar componentes de una pieza mecánica escaneada (tornillos, superficies, cavidades) para inspección de calidad automatizada, aprovechando su entrenamiento en ShapeNetPart.
- Reconstrucción y edición 3D asistida: al segmentar partes de un objeto (por ejemplo, patas y respaldo de una silla), facilita operaciones de edición, sustitución o animación por componentes en pipelines de diseño.
- Robótica de manipulación: la segmentación por partes permite a un brazo robótico identificar zonas de agarre o componentes desmontables de un objeto, usando la salida por punto para planificar la interacción.
- Digitalización de patrimonio y modelado BIM: segmentar partes de objetos escaneados (muebles, elementos arquitectónicos) para generar modelos estructurados a partir de nubes de puntos crudas.
- Preentrenamiento y transferencia: el modelo puede usarse como extractor de características (`forward_features`) para alimentar clasificadores o detectores aguas abajo en tareas 3D con pocos datos etiquetados.
- Automoción y conducción autónoma: segmentación de partes de vehículos u objetos en escenas LiDAR para tareas de percepción que requieran descomposición por componentes.
- Investigación en visión 3D: punto de partida reproducible para comparar arquitecturas de segmentación de partes sobre ShapeNetPart con una licencia permisiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Segmentación de partes de nube de puntos | ShapeNetPart | ins_mIoU | 86,8 |
| Segmentación de partes de nube de puntos | ShapeNetPart | cls_mIoU | 84,36 |

No se han publicado en la información disponible resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo no lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 188,1 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 0,75 GB; en FP16, unos 0,38 GB. A ello hay que sumar memoria para activaciones y la nube de 8192 puntos, por lo que se recomienda al menos 2-4 GB de VRAM en FP32.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problemas. Para lotes grandes, se recomienda A100/H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: la librería `torch-pointcloud` (PyTorch) es la vía oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / puntos | Métrica ShapeNetPart | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-L (este modelo) | 188,1 M | 8192 puntos (ejemplo) | ins_mIoU 86,8 / cls_mIoU 84,36 | MIT | Hugging Face, `torch-pointcloud` |
| PointGPT original (CGuangyan-BIT) | no disponible en la información | no disponible | no disponible | MIT | GitHub |
| Alternativas de segmentación de partes 3D (PointNet++, DGCNN, etc.) | no disponible | no disponible | no disponible | varía | no disponible |

No se dispone de datos comparativos verificados de otros modelos en la información proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Modelo especializado en segmentación de partes 3D; no es un modelo de lenguaje ni un modelo multimodal general.
- Los resultados de benchmarks (ins_mIoU 86,8 y cls_mIoU 84,36) están declarados por el autor y marcados como no verificados (`verified: false`).
- Entrenado exclusivamente en ShapeNetPart (50 clases de partes); su generalización a dominios fuera de esa distribución (escaneos reales ruidosos, objetos no representados) no está garantizada.
- No se documentan sesgos específicos, pero el dataset ShapeNetPart tiene una cobertura limitada de categorías y estilos de objetos, lo que puede introducir sesgos de dominio.
- Riesgo de error en puntos ambiguos o límites entre partes; la métrica mIoU implica que no todos los puntos se clasifican correctamente.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el artículo original y el software de conversión.
- No se dispone de información sobre cuantización, por lo que el despliegue en entornos con restricciones de memoria debe validarse empíricamente.
- La fecha de creación del repositorio (2026) y la falta de descargas/likes elevados sugieren un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.shapenetpart.guangyan-chen
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
