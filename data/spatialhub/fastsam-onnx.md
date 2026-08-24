# SpatialHub/fastsam-onnx

## Resumen

FastSAM (Fast Segment Anything Model) es un modelo de segmentación de imágenes basado en redes neuronales convolucionales (CNN), desarrollado por el laboratorio CASIA-LMC-Lab. Su objetivo es resolver la tarea de segmentar cualquier objeto en una imagen a partir de interacciones del usuario, similar a SAM (Segment Anything Model), pero con una velocidad de ejecución aproximadamente 50 veces superior. Para lograrlo, se entrenó con solo el 2 % del dataset SA-1B publicado por los autores de SAM, logrando un rendimiento comparable con una carga computacional significativamente reducida.

El repositorio `SpatialHub/fastsam-onnx` en Hugging Face proporciona una versión del modelo FastSAM convertida al formato ONNX (Open Neural Network Exchange), un formato interoperable que facilita la inferencia en múltiples plataformas y frameworks, incluidos entornos de producción con CPU o GPU. El repositorio tiene un tamaño de 0,3 GB y está publicado bajo licencia Apache-2.0, lo que permite su uso comercial y modificación.

Aunque la model card del repositorio no incluye detalles técnicos adicionales, la información pública sobre FastSAM indica que se trata de una arquitectura CNN diseñada para segmentación semántica de objetos con prompts interactivos. Esta versión ONNX es relevante para desarrolladores que necesitan desplegar segmentación de imágenes en entornos de producción con requisitos de baja latencia y sin depender de frameworks específicos como PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (Convolutional Neural Network) basada en el modelo FastSAM |
| Parametros totales | no disponible (el repositorio no especifica el número exacto) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en formato ONNX, sin cuantizaciones específicas documentadas) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

FastSAM se basa en una arquitectura de red neuronal convolucional (CNN) que combina un extractor de características con un decodificador de máscaras. El modelo fue entrenado sobre el dataset SA-1B, aunque utilizando únicamente el 2 % de las imágenes disponibles, con el objetivo de reducir el coste computacional manteniendo una calidad de segmentación competitiva. El proceso de entrenamiento se centró en la tarea de segmentación de objetos con prompts, tanto puntuales como de caja delimitadora.

La versión ONNX de este repositorio es una conversión directa de los pesos del modelo original a formato ONNX, lo que permite ejecutarlo con librerías como `onnxruntime` en CPU o GPU sin necesidad de instalar PyTorch. No se han documentado innovaciones técnicas adicionales en esta conversión, como cuantizaciones o optimizaciones específicas.

## Capacidades

- Segmentación de objetos en imágenes: genera máscaras de segmentación para cualquier objeto presente en la imagen, tanto mediante prompts automáticos como interactivos (puntos, cajas).
- Segmentación en tiempo real: gracias a su arquitectura CNN y a la conversión a ONNX, es adecuado para aplicaciones con requisitos de baja latencia.
- Interoperabilidad: el formato ONNX permite su despliegue en múltiples entornos (Python, C++, Java, etc.) y en hardware variado (CPU, GPU, dispositivos móviles).
- No incluye capacidades de texto, razonamiento, generación de código ni tool calling, ya que es un modelo exclusivamente de visión.

## Casos de uso

- **Edición de imágenes y retoque**: permite seleccionar y separar objetos concretos de una imagen para aplicar filtros, cambiar fondos o eliminar elementos no deseados. La velocidad de FastSAM lo hace útil para herramientas de edición en tiempo real.
- **Segmentación en agricultura**: identificar y medir áreas de cultivos, plagas o frutos en imágenes de drones o cámaras de campo. Su bajo coste computacional facilita su integración en sistemas embebidos o de bajo consumo.
- **Análisis de imágenes médicas**: segmentar estructuras anatómicas (órganos, tumores) en imágenes de radiología o microscopía. Aunque no está específicamente entrenado para este dominio, la segmentación general puede adaptarse con transferencia de aprendizaje.
- **Robótica y navegación**: en sistemas de visión para robots, permite localizar y segmentar obstáculos u objetos de interés en tiempo real, mejorando la toma de decisiones en entornos dinámicos.
- **Automatización de procesos industriales**: inspección de calidad en líneas de producción, segmentando defectos en piezas o materiales. La inferencia rápida permite integrarlo en sistemas de visión industrial.
- **Sistemas de vigilancia**: detección y segmentación de personas u objetos en flujos de video en tiempo real, con la posibilidad de ejecutarse en hardware moderado gracias al formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible del repositorio ni en la documentación asociada. El modelo FastSAM original reporta en su GitHub un rendimiento comparable al de SAM con una velocidad de ejecución 50 veces superior, pero no se incluyen métricas numéricas concretas en la información proporcionada para esta ficha.

## Requisitos de hardware

- **Tamaño del modelo**: el repositorio tiene un tamaño de 0,3 GB, lo que sugiere que el archivo ONNX tiene un peso similar (posiblemente alrededor de 300 MB). Esto implica que puede cargarse en memoria con menos de 1 GB de VRAM en modo de precisión flotante.
- **VRAM estimada**: para inferencia con precisión FP32, se puede necesitar entre 1 y 2 GB de VRAM según la resolución de entrada. En CPU, puede ejecutarse con un uso moderado de RAM.
- **GPU recomendadas**: cualquier GPU con soporte CUDA (por ejemplo, NVIDIA GTX 1060 o superior) o incluso GPUs integradas de Intel o AMD si se usa la ejecución ONNX en CPU. Para entornos de producción, una RTX 3060 o superior es suficiente.
- **Despliegue**: se puede usar con `onnxruntime` (CPU/GPU), `onnxruntime-gpu`, `OpenVINO` o `TensorRT`. También es compatible con frameworks como `opencv` a través de módulos ONNX.
- **Latencia**: no hay datos específicos, pero FastSAM es conocido por ser rápido (50 veces más que SAM). La conversión ONNX no debería degradar significativamente el rendimiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros (aprox.) | Velocidad relativa | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| FastSAM (este repo, ONNX) | CNN | no disponible | ~50× más rápido que SAM | Apache-2.0 | ONNX |
| SAM (Segment Anything Model) | Transformer | 93M (ViT-B) a 636M (ViT-H) | Lento | Apache-2.0 | PyTorch |
| YOLOv8-seg | CNN | ~11M a ~68M | Muy rápido | AGPL-3.0 | PyTorch, ONNX |

FastSAM ofrece un equilibrio entre velocidad y precisión frente a SAM, mientras que YOLOv8-seg es una alternativa de segmentación de tiempo real con una licencia más restrictiva (AGPL-3.0). La ventaja de FastSAM es su capacidad de segmentar cualquier objeto con prompts, algo que YOLOv8-seg no hace de forma nativa.

## Limitaciones y advertencias

- **Información limitada del repositorio**: la model card no proporciona detalles sobre el modelo, su versión exacta (X, S, etc.) ni los parámetros de entrenamiento. Se recomienda consultar la documentación oficial de FastSAM para obtener información completa.
- **Sesgos en el dataset**: al entrenarse con una fracción del dataset SA-1B, puede presentar sesgos hacia ciertos tipos de objetos o escenas, especialmente los más frecuentes en imágenes web.
- **Riesgo de alucinación**: en el contexto de segmentación, puede generar máscaras incorrectas o incompletas en objetos poco comunes o en imágenes con oclusiones complejas.
- **Limitaciones de contexto**: no es un modelo de lenguaje, por lo que no tiene contexto textual ni capacidades de razonamiento.
- **Restricciones de licencia**: la licencia Apache-2.0 es permisiva para uso comercial, pero requiere conservar el aviso de copyright y no puede usarse para reclamar respaldo oficial de los autores.
- **Consideraciones para producción**: se recomienda validar el modelo en el dominio específico antes de desplegar, ya que la segmentación puede ser sensible a la calidad de las imágenes y al tipo de prompts.

## Enlaces

- [Repositorio en Hugging Face: SpatialHub/fastsam-onnx](https://huggingface.co/SpatialHub/fastsam-onnx)
- [Repositorio oficial de FastSAM (GitHub)](https://github.com/CASIA-LMC-Lab/FastSAM)
- [Versión ONNX en microsoft/dml-ai-hub-models](https://huggingface.co/microsoft/dml-ai-hub-models/blob/main/fastsam_x/fastsam_x.onnx)
- [FastSAM X en Qualcomm AI Hub](https://aihub.qualcomm.com/models/fastsam_x)
