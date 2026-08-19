# TensorVizion/Cizi-OCR

## Resumen

Cizi-OCR es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, desarrollado por TensorVizion como una fine-tuning del modelo GLM-OCR de Z.AI. Está diseñado para convertir imágenes de documentos en texto estructurado en formato Markdown, preservando tablas, cabeceras y el orden de lectura. Su arquitectura ligera, con aproximadamente 1.325 millones de parámetros, permite su ejecución en hardware de consumo y dispositivos de borde.

El modelo se basa en la arquitectura encoder-decoder de GLM-OCR con Multi-Token Prediction (MTP), que acelera la decodificación y mejora la coherencia contextual en regiones de texto denso. Al ser una fine-tuning, Cizi-OCR hereda las capacidades base de OCR de GLM-OCR y las adapta a un nicho específico (aunque la card del autor no especifica cuál). Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en la creciente demanda de soluciones OCR eficientes que puedan ejecutarse localmente sin depender de APIs externas, manteniendo la privacidad de los datos y reduciendo costes de infraestructura. Aunque el repositorio no incluye benchmarks ni datos de entrenamiento detallados, su base sólida en GLM-OCR y su tamaño compacto lo convierten en una opción a considerar para tareas de digitalización de documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (basada en GLM-OCR) con Multi-Token Prediction |
| Parametros totales | 1.325.258.240 (1.325 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato bfloat16 probablemente) |
| Idiomas soportados | Inglés (según la model card: `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Cizi-OCR se construye sobre GLM-OCR de Z.AI, que emplea una arquitectura encoder-decoder de visión-lenguaje. El encoder procesa la imagen de entrada y el decoder genera texto de salida en un único paso hacia adelante, sin etapas separadas de detección y reconocimiento de caracteres. La característica distintiva es la Multi-Token Prediction (MTP), que permite predecir múltiples tokens simultáneamente, reduciendo la latencia de decodificación y mejorando la coherencia en regiones con texto denso.

Los detalles del entrenamiento de la fine-tuning no se especifican en la información disponible. La card menciona que se utilizaron "XK muestras específicas del dominio" y que el modelo está alineado para un caso de uso concreto (histórico, médico, etc.), pero no se proporcionan cifras exactas ni composición del dataset. Tampoco se indica si se aplicaron técnicas como RLHF o DPO. El modelo base GLM-OCR fue entrenado por Z.AI con datos de OCR y comprensión de documentos, pero los detalles de ese entrenamiento tampoco están disponibles en esta ficha.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) en imágenes de documentos.
- Conversión de documentos escaneados o fotografiados a texto estructurado en Markdown.
- Preservación de tablas, cabeceras y orden de lectura en diseños complejos.
- Procesamiento de imágenes a texto en un único paso (end-to-end).
- Soporte de conversación multimodal (image-text-to-text), permitiendo interacciones como "Transcribe este documento" o preguntas sobre el contenido.
- Generación de texto con decodificación rápida gracias a Multi-Token Prediction.
- Capacidad de ejecución en hardware de consumo y dispositivos de borde por su tamaño reducido.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede transcribir manuscritos o impresiones antiguas a texto digital, facilitando la búsqueda y el archivado. Su tamaño compacto permite procesarlos localmente sin depender de servicios en la nube.
- Extracción de datos de formularios médicos: al estar fine-tuneado para un nicho (si se configura para ello), puede convertir formularios clínicos en registros electrónicos estructurados, reduciendo errores de entrada manual.
- Automatización de facturas y recibos: integrado en un pipeline de contabilidad, Cizi-OCR puede extraer campos clave (números, fechas, totales) y generar salidas en Markdown para su posterior procesamiento.
- Accesibilidad para personas con discapacidad visual: convierte imágenes de texto en voz o en formato legible por lectores de pantalla, gracias a su salida estructurada.
- Indexación de documentos en entornos empresariales: permite buscar contenido dentro de PDFs escaneados o imágenes, mejorando la recuperación de información en sistemas de gestión documental.
- Asistente conversacional para documentos: al soportar image-text-to-text, puede responder preguntas sobre el contenido de una imagen (por ejemplo, "¿Cuál es el importe total?"), útil en chatbots de atención al cliente o asistentes internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos OCR. Tampoco se especifican tasas de acierto en tareas de reconocimiento de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tener ~1.325 M de parámetros, se puede estimar que con cuantización de 8 bits cabría en GPUs con 6-8 GB de VRAM, y en 4 bits en GPUs de 4 GB. No se proporcionan datos oficiales.
- GPU recomendadas: no disponible. Dado el tamaño, una RTX 3060 o superior podría ser suficiente, pero no hay confirmación.
- Ejecución en consumer GPU: probablemente sí, dado el tamaño del modelo, pero no hay garantías oficiales.
- Opciones de despliegue: se puede usar con la biblioteca `transformers` de HuggingFace, como se muestra en el código de ejemplo. También podría exportarse a formatos como ONNX o GGUF para ejecutarse con llama.cpp u Ollama, aunque no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos OCR de tamaño similar (por ejemplo, TrOCR, PaddleOCR-VL, o el propio GLM-OCR base). No hay datos de rendimiento ni de características detalladas de estos modelos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos específicos del modelo. Al estar basado en GLM-OCR, podría heredar sesgos de los datos de entrenamiento originales, pero no se documentan.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto incorrecto o inventado, especialmente en regiones de imagen de baja calidad o con texto ambiguo.
- Limitaciones de idioma: la model card indica solo inglés (`language: en`). No se garantiza un rendimiento adecuado en otros idiomas.
- Limitaciones de contexto: no se especifica la longitud máxima de entrada de imagen ni de texto de salida. El ejemplo usa `max_new_tokens=2048`, pero no es un límite oficial.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base GLM-OCR tiene su propia licencia (probablemente también Apache 2.0, pero no se verifica aquí). Se recomienda revisar la licencia del modelo base para evitar conflictos.
- Caveat de producción: la fine-tuning está orientada a un nicho no especificado ("[insert your specific niche]"). Si se utiliza fuera de ese nicho, el rendimiento puede degradarse significativamente. Además, el repositorio no incluye documentación sobre el dataset de fine-tuning ni sobre el proceso de evaluación, lo que dificulta la validación en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TensorVizion/Cizi-OCR
- Modelo base GLM-OCR: https://huggingface.co/zai-org/GLM-OCR
- (No se encontraron otros enlaces en la información proporcionada)
