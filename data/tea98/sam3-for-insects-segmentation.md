# tea98/sam3-for-insects-segmentation

## Resumen

SAM 3 for Insects Segmentation es un ajuste fino del modelo SAM 3 de Meta, especializado en la detección y segmentación de instancias de artrópodos terrestres (insectos, arácnidos, miriápodos, etc.) en imágenes de trampas y cámaras de monitoreo. Ha sido desarrollado por Adam Basha, del Instituto de Tecnología de Karlsruhe (KIT), y se distribuye a través del repositorio de Hugging Face `tea98/sam3-for-insects-segmentation`. El modelo resuelve el problema de localizar y delimitar especímenes pequeños en imágenes de gran tamaño, donde el escalado tradicional los pierde, mediante un esquema de teselado piramidal inspirado en flat-bug.

El modelo es un detector de una sola clase: produce una máscara, una caja delimitadora y una puntuación de confianza por cada artrópodo, pero no identifica la especie. Se entrenó sobre el agregado flat-bug, que reúne 23 conjuntos de datos de insectos, durante 18 de 20 épocas con una resolución de 1008 píxeles y una tasa de aprendizaje de 8e-5. El checkpoint publicado pesa 3,14 GB en fp32 y no requiere token de Hugging Face ni aceptación de licencia para inferencia, ya que incluye todos los pesos necesarios.

Su relevancia actual radica en la creciente demanda de herramientas de monitoreo automatizado de biodiversidad, donde la detección fiable de insectos en imágenes de campo es un paso previo esencial para estudios ecológicos y agrícolas. Al estar basado en SAM 3, hereda la arquitectura de segmentación de última generación de Meta, pero adaptada al dominio específico de los artrópodos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (Segment Anything Model 3) con decoder DETR-style y 200 object queries por tesela |
| Parametros totales | no disponible (no se especifica el tamaño del checkpoint base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | fp32 únicamente (fp16 no soportado; los pesos de `text_projection` superan el límite de fp16) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | SAM License (derivado de SAM 3, con restricciones de uso aceptable de Meta) |
| Formato de pesos | checkpoint PyTorch (.pt), fp32, 3,14 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint de imagen de SAM 3, que emplea una arquitectura de transformer con un encoder de visión y un decoder basado en consultas (DETR-style). En cada tesela de la imagen, el decoder procesa un presupuesto fijo de 200 consultas de objetos, de las cuales solo una fracción corresponde a detecciones reales; las demás puntúan bajo. Este comportamiento es inherente a los detectores tipo DETR y no se considera un defecto del ajuste fino.

El entrenamiento se realizó sobre el agregado flat-bug, que combina 23 conjuntos de datos de imágenes de insectos, con una configuración denominada `flatbug_medium_ft`. Se utilizó una resolución de 1008 píxeles, una tasa de aprendizaje de 8e-5 y se seleccionó la época 18 de un total de 20. El ajuste fino se sirve mediante teselado piramidal estilo flat-bug, que divide la imagen original en parches a múltiples escalas para recuperar especímenes pequeños que de otro modo se perderían al reducir la resolución. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, al tratarse de un modelo de visión.

Una innovación destacable es que el checkpoint incluye todos los pesos necesarios para la inferencia, evitando la dependencia del repositorio gated `facebook/sam3`. Además, se documenta explícitamente que la conversión a fp16 no funciona debido a valores extremadamente altos en `text_projection` (hasta 9,58e18), por lo que se deben mantener los pesos en fp32.

## Capacidades

- Detección y segmentación de instancias de artrópodos terrestres en imágenes, con salida de máscara, caja delimitadora y puntuación de confianza por objeto.
- Generación de anotaciones en formato COCO (polígonos), listas para su uso en pipelines de visión por computador.
- Manejo de imágenes de gran tamaño mediante teselado piramidal, lo que permite recuperar especímenes pequeños en trampas fotográficas.
- Inferencia sin necesidad de token de Hugging Face ni aceptación de licencia, gracias al checkpoint autocontenido.
- No realiza identificación taxonómica: es un detector de una sola clase (artrópodo frente a fondo).
- No soporta prompts de texto ni de visión; la entrada es exclusivamente una imagen.

## Casos de uso

- Monitoreo de biodiversidad con trampas fotográficas: el modelo puede procesar miles de imágenes de cámaras automáticas para contar y localizar artrópodos, facilitando estudios de población y fenología sin intervención manual.
- Análisis de muestras de trampas Malaise o de intercepción: las imágenes de bandejas con insectos capturados pueden segmentarse automáticamente para cuantificar abundancia y distribución espacial antes de la identificación taxonómica.
- Detección de plagas en cultivos: en imágenes de trampas adhesivas o de plantas, el modelo localiza insectos dañinos, permitiendo alertas tempranas y decisiones de manejo integrado de plagas.
- Investigación entomológica de campo: los investigadores pueden obtener anotaciones de instancias de insectos en fotografías de expediciones, reduciendo el tiempo de etiquetado manual y aumentando la reproducibilidad.
- Evaluación de impacto ambiental: en estudios de biodiversidad en zonas agrícolas o urbanas, el modelo proporciona métricas de presencia de artrópodos a partir de imágenes de cámaras DIOPSIS u otros sistemas, como se hace en proyectos similares (InsectSAM).
- Integración en pipelines de ciencia ciudadana: aplicaciones móviles o plataformas web pueden usar el modelo para preprocesar fotos de insectos enviadas por voluntarios, generando recuentos y máscaras que luego se validan con expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como precisión, recall o mAP, ni comparaciones con otros modelos de segmentación de insectos. Se recomienda consultar el repositorio de GitHub para futuras actualizaciones o ejecutar una evaluación propia sobre datos del dominio flat-bug.

## Requisitos de hardware

- El checkpoint pesa 3,14 GB en fp32, por lo que la VRAM mínima para inferencia se estima en torno a 6-8 GB, dependiendo de la resolución de entrada y del número de teselas procesadas simultáneamente.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3070/3080, RTX 4060 Ti o superiores. Para procesamiento por lotes de imágenes grandes, se recomienda una GPU con 16 GB o más, como RTX 4090, A100 o H100.
- Es posible ejecutar el modelo en una GPU de consumo (p. ej., RTX 3060 con 12 GB) si se limita el tamaño de las teselas o se procesan imágenes de una en una.
- Opciones de despliegue: el repositorio oficial proporciona una CLI y un notebook de Colab; también se puede integrar en scripts Python mediante la librería `sam3-insect`. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia, ya que es un modelo de visión puro.
- La latencia y el throughput no están documentados. Dado el presupuesto fijo de 200 consultas por tesela, el tiempo de inferencia dependerá del número de teselas generadas por la pirámide, que a su vez depende del tamaño de la imagen original.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAM 3 for Insects (este modelo) | SAM 3 | Detección y segmentación de una sola clase (artrópodos) con teselado piramidal | SAM License | Repositorio público, checkpoint autocontenido |
| InsectSAM | SAM original | Segmentación de insectos para sistemas DIOPSIS en Países Bajos | no especificada | Repositorio público en Hugging Face |
| SAM 3 (base) | — | Segmentación general con prompts de texto y visuales | SAM License | Repositorio gated en Hugging Face |

La principal diferencia con InsectSAM es que este modelo se basa en SAM 3, que incorpora avances arquitectónicos más recientes, y está entrenado sobre una agregación mucho más amplia de 23 datasets (flat-bug). Frente al SAM 3 base, este checkpoint está especializado en artrópodos y no requiere prompts adicionales, pero pierde la capacidad de segmentación general y de interacción por texto.

## Limitaciones y advertencias

- Es un detector de una sola clase: no distingue entre especies ni grupos taxonómicos, solo separa artrópodos del fondo.
- Las máscaras tienden a ser ajustadas, especialmente en especímenes peludos, translúcidos o con patas y antenas finas; se recomienda bajar `MASK_THRESHOLD` hacia 0,3 si el área de la máscara es crítica.
- Los objetos muy pequeños pueden requerir aumentar `SCALE_BEFORE` a 1,5-2,0 para ser detectados correctamente.
- El cambio de dominio (imágenes muy diferentes al conjunto de entrenamiento) afecta más a la precisión que a la recuperación; se aconseja subir el umbral de confianza en esos casos.
- En grupos densos de insectos, las detecciones pueden fusionarse o separarse de forma inconsistente, y el NMS con IoU 0,2 puede suprimir pares genuinamente superpuestos.
- La cuantización fp16 no es viable: los pesos de `text_projection` superan el valor máximo representable en fp16, provocando infinitos. Se deben mantener los pesos en fp32.
- La licencia SAM License impone restricciones de redistribución y uso aceptable según la política de Meta; cualquier uso comercial debe revisarse cuidadosamente.
- No se proporcionan datos de rendimiento cuantitativo (mAP, precisión, recall), por lo que la evaluación en dominios específicos es responsabilidad del usuario.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/tea98/sam3-for-insects-segmentation
- Código, CLI y notebook de Colab: https://github.com/adambasha0/SAM3-for-Insects-segementation
- Model card completa en el repositorio: https://github.com/adambasha0/SAM3-for-Insects-segementation/blob/main/MODEL_CARD.md
- Notebook de Colab: https://colab.research.google.com/github/adambasha0/SAM3-for-Insects-segementation/blob/main/docs/sam3_insect_colab.ipynb
- Repositorio oficial de SAM 3: https://github.com/facebookresearch/sam3
- Página de investigación de SAM 3 en Meta: https://ai.meta.com/research/sam3/
- Repositorio de flat-bug: https://github.com/darsa-group/flat-bug
- InsectSAM (modelo comparable): https://huggingface.co/martintomov/InsectSAM
