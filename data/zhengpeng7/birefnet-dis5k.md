# ZhengPeng7/BiRefNet-DIS5K

## Resumen

BiRefNet-DIS5K es un modelo de segmentación dicotómica de imágenes (Dichotomous Image Segmentation, DIS) desarrollado por Peng Zheng y colaboradores de la Universidad de Nankai, la Universidad Politécnica del Noroeste, la Universidad Nacional de Tecnología de Defensa, la Universidad de Aalto, el Laboratorio de IA de Shanghái y la Universidad de Trento. El modelo se publicó en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (CAAI Artificial Intelligence Research, 2024) y resuelve el problema de separar con precisión objetos de interés de su fondo en imágenes de alta resolución, una tarea más exigente que la segmentación semántica tradicional.

La arquitectura se basa en un transformer jerárquico con backbone Swin Transformer (variante large) y emplea un mecanismo de referencia bilateral que combina información global y local para refinar los bordes y detalles finos. El modelo cuenta con 220,7 millones de parámetros y está entrenado exclusivamente en el conjunto de datos DIS5K-TR, lo que lo hace especialmente adecuado para tareas de eliminación de fondos, generación de máscaras y segmentación de objetos precisos. Su relevancia actual radica en su capacidad para trabajar con resoluciones altas (hasta 2K) y su licencia MIT, que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico con backbone Swin Transformer (variante large) |
| Parámetros totales | 220.700.242 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BiRefNet (Bilateral Reference Network) introduce un mecanismo de referencia bilateral que procesa la imagen a través de dos ramas complementarias: una rama global que captura el contexto semántico de la escena y una rama local que se centra en los detalles de alta frecuencia y bordes. Estas dos referencias se fusionan de forma iterativa para producir una máscara binaria de alta resolución. El backbone es un Swin Transformer preentrenado, que proporciona representaciones jerárquicas multiescala.

El modelo se entrenó en el conjunto de datos DIS5K-TR, que contiene 5.000 imágenes de alta resolución con anotaciones de segmentación dicotómica. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de visión supervisado de forma clásica. La innovación principal reside en el diseño de la referencia bilateral, que permite mantener la precisión en resoluciones altas sin un coste computacional excesivo.

## Capacidades

- Segmentación dicotómica de imágenes: separa el objeto de interés del fondo con máscaras binarias de alta precisión.
- Eliminación de fondos: genera máscaras que permiten recortar objetos y sustituir el fondo.
- Generación de máscaras de alta resolución: soporta entradas de hasta 2K (2560x1440) en la variante lite, aunque esta versión DIS5K está optimizada para resoluciones estándar.
- Refinamiento de bordes: el mecanismo de referencia bilateral mejora la calidad de los contornos frente a métodos tradicionales.
- No incluye capacidades de texto, código, razonamiento multimodal ni tool calling, al ser un modelo puramente visual.

## Casos de uso

- Eliminación de fondos en fotografía de producto: el modelo puede generar máscaras precisas de objetos para recortarlos y colocarlos sobre fondos neutros o personalizados, gracias a su capacidad de segmentación dicotómica de alta resolución.
- Generación de máscaras para edición de imágenes: integrable en herramientas de retoque fotográfico para seleccionar sujetos automáticamente, reduciendo el trabajo manual de recorte.
- Preprocesamiento para visión por computador: las máscaras generadas pueden usarse como entrada para otros modelos (p. ej., generación de imágenes, inpainting o clasificación) que requieren separar objeto y fondo.
- Segmentación de objetos en imágenes médicas: aunque no está específicamente entrenado para dominios clínicos, su capacidad de segmentar estructuras precisas puede adaptarse con fine-tuning a tareas como la delimitación de lesiones o tejidos.
- Automatización de flujos de diseño gráfico: en pipelines de diseño, el modelo puede recortar elementos de imágenes de stock sin intervención manual, acelerando la creación de composiciones.
- Análisis de imágenes de satélite o drones: la segmentación dicotómica permite aislar estructuras como edificios, vehículos o vegetación en imágenes aéreas de alta resolución, útil para cartografía y monitorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como IoU, F-measure o MAE para el conjunto DIS5K. Para obtener datos de rendimiento, se recomienda consultar el artículo original (arXiv:2401.03407) o el repositorio de GitHub, donde se reportan comparativas con otros métodos de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 220,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 0,88 GB solo en pesos. Con overhead de activaciones y buffers, se estima un consumo de 2-4 GB de VRAM para inferencia en resoluciones estándar (512x512 o 1024x1024). Para resoluciones de 2K, el consumo puede superar los 6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en resoluciones moderadas. Se recomienda una RTX 3060, RTX 4060 o superior para trabajar cómodamente con resoluciones altas. Para producción con alta concurrencia, una A100 o H100 es adecuada.
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas como RTX 3060 (12 GB), RTX 4070, etc., siempre que se limite la resolución de entrada.
- Opciones de despliegue: el modelo se distribuye con la librería `birefnet` y es compatible con el ecosistema Hugging Face (pipeline `image-segmentation`). Puede desplegarse con PyTorch, TorchServe o mediante contenedores Docker. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. En una GPU consumer moderna, la inferencia en una imagen de 1024x1024 debería completarse en menos de un segundo, pero estos valores dependen del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución máxima | Licencia | Enfoque |
|---|---|---|---|---|
| BiRefNet-DIS5K | 220,7 M | 2K (variante lite) | MIT | Segmentación dicotómica con referencia bilateral |
| U²-Net | 44 M | 320x320 | Apache 2.0 | Segmentación de objetos salientes (SOD) |
| ISNet | 45 M | 1024x1024 | MIT | Segmentación de objetos salientes con refinamiento de bordes |

La comparativa se basa en modelos de segmentación de objetos de propósito similar. U²-Net e ISNet son más ligeros y están orientados a detección de objetos salientes, mientras que BiRefNet se centra en segmentación dicotómica de alta resolución con mayor precisión de bordes. No se dispone de datos de rendimiento cuantitativo para una comparación directa en los mismos conjuntos de datos.

## Limitaciones y advertencias

- Entrenado exclusivamente en DIS5K-TR: el modelo puede no generalizar bien a dominios muy diferentes (p. ej., imágenes médicas, radiografías o escenas con iluminación extrema) sin fine-tuning.
- Sin capacidades multimodales: no procesa texto ni audio, solo imágenes.
- Riesgo de alucinación en bordes: en imágenes con fondos complejos o texturas similares al objeto, la máscara generada puede incluir regiones incorrectas.
- Sesgos del dataset: DIS5K contiene principalmente imágenes naturales y objetos comunes; puede tener un rendimiento inferior en categorías poco representadas.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las leyes aplicables en su jurisdicción.
- Sin soporte de cuantización documentado: no se especifican versiones GGUF o INT8, por lo que el despliegue en hardware de baja gama puede requerir conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhengPeng7/BiRefNet-DIS5K
- Repositorio oficial en GitHub: https://github.com/ZhengPeng7/BiRefNet
- Artículo en arXiv: https://arxiv.org/pdf/2401.03407
- Demo interactiva en Hugging Face Spaces: https://huggingface.co/spaces/ZhengPeng7/BiRefNet_demo
- Página del proyecto: https://www.birefnet.top
