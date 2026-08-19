# Trlinh29/qwen3.5-0.8b-5e-classify

## Resumen

El modelo `Trlinh29/qwen3.5-0.8b-5e-classify` es un fine-tuning comunitario del modelo base Qwen3.5-0.8B, desarrollado por el usuario Trlinh29. Se trata de una versión adaptada para tareas de clasificación de texto, como sugiere el sufijo "classify" y las cinco épocas de entrenamiento indicadas en el nombre ("5e"). El modelo base, Qwen3.5-0.8B, es el miembro más pequeño de la familia Qwen3.5 de Alibaba Cloud, con una arquitectura híbrida de "gated delta networks" y una ventana de contexto de 262.000 tokens, además de capacidades multimodales (visión y lenguaje).

Este fine-tune conserva la arquitectura y el tamaño del modelo original, con 852.985.920 parámetros (aproximadamente 0,85 mil millones), y está disponible en formato safetensors. Al estar diseñado específicamente para clasificación, resulta adecuado para aplicaciones que requieren categorización de textos, análisis de sentimiento o etiquetado de documentos, aprovechando el razonamiento y la comprensión del lenguaje del modelo base. Su relevancia actual radica en ofrecer una alternativa ligera y eficiente para tareas de clasificación en entornos con recursos limitados, como dispositivos edge o GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida gated delta networks (del modelo base Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 (0,85B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se indican versiones cuantizadas) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingüe, pero no se especifican los idiomas de este fine-tune) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida de "gated delta networks", una innovación reciente que combina mecanismos de atención con capas de actualización delta controladas por compuertas, logrando un equilibrio entre eficiencia computacional y capacidad de razonamiento. Según la documentación de vLLM, esta arquitectura permite una ventana de contexto de 262.000 tokens, lo que facilita el procesamiento de documentos largos. Además, el modelo base fue entrenado con fusión temprana de datos multimodales (texto e imagen) sobre billones de tokens, alcanzando un rendimiento competitivo en razonamiento, codificación y comprensión visual.

El fine-tune `5e-classify` se ha entrenado durante cinco épocas sobre un conjunto de datos no especificado, orientado a tareas de clasificación. No se dispone de información sobre el dataset utilizado, el método de ajuste (por ejemplo, supervisión completa o LoRA) ni si se aplicaron técnicas como RLHF o DPO. Dado el tamaño del repositorio (3,4 GB), es probable que los pesos estén almacenados en precisión fp16 o fp32, aunque no se confirma el tipo de dato exacto.

## Capacidades

- Clasificación de texto: el modelo está específicamente ajustado para tareas de clasificación, como análisis de sentimiento, categorización de temas o detección de intenciones.
- Razonamiento y comprensión del lenguaje: hereda las capacidades del modelo base Qwen3.5-0.8B, que incluyen razonamiento lógico, seguimiento de instrucciones y generación de texto coherente.
- Multimodalidad: el modelo base soporta entrada de imágenes además de texto, por lo que este fine-tune podría utilizarse también para clasificación de imágenes o tareas visuales, aunque no se ha confirmado que el ajuste haya preservado estas capacidades.
- Contexto largo: con 262.000 tokens de ventana, puede procesar documentos extensos o conversaciones de muchos turnos sin perder información relevante.
- Eficiencia: al ser un modelo de 0,85B parámetros, es adecuado para despliegue en dispositivos con recursos limitados, como GPUs de consumo o incluso CPU con cuantización.

No se ha confirmado si el fine-tune conserva el soporte de tool calling o capacidades de agente del modelo base, ya que no hay documentación específica al respecto.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar comentarios o publicaciones como positivos, negativos o neutros, aprovechando su ventana de contexto para procesar hilos completos y captar matices contextuales.
- Categorización de tickets de soporte: en un sistema de atención al cliente, el modelo puede asignar automáticamente cada ticket a una categoría (facturación, técnico, reclamación) basándose en el texto completo, reduciendo el trabajo manual de triaje.
- Moderación de contenido: puede clasificar mensajes o publicaciones como apropiados o inapropiados, ayudando a filtrar spam, discursos de odio o contenido no deseado en plataformas digitales.
- Clasificación de documentos legales o administrativos: gracias a su contexto de 262K tokens, puede procesar contratos o expedientes completos y etiquetarlos por tipo, prioridad o departamento responsable.
- Detección de intención en asistentes virtuales: el modelo puede identificar la intención del usuario (pregunta, solicitud, queja) en interacciones conversacionales, facilitando el enrutamiento a los flujos de diálogo adecuados.
- Análisis de reseñas de productos: en comercio electrónico, puede clasificar reseñas por aspecto (calidad, precio, envío) y sentimiento, proporcionando información estructurada para mejorar productos o servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base Qwen3.5-0.8B, según fuentes como codersera, muestra una buena capacidad de recuerdo (recall) pero una precisión débil en tareas de codificación, recomendándose el modelo de 4B para tareas de programación. Sin embargo, no hay datos numéricos verificables (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos en el repositorio de HuggingFace ni en los resultados de búsqueda. Por tanto, no se pueden presentar cifras concretas de rendimiento para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852M parámetros, en fp16 se requieren aproximadamente 1,7 GB de VRAM; en int8, alrededor de 0,85 GB; en fp32, unos 3,4 GB. Para clasificación con lotes pequeños, una GPU con 4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU con cuantización GGUF (si se generan versiones cuantizadas).
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en tarjetas de gama baja.
- Opciones de despliegue: al ser safetensors, puede cargarse con Transformers de HuggingFace, vLLM, TGI o llama.cpp (si se convierte a GGUF). También es posible usar Ollama si se crea un Modelfile adecuado.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como RTX 3060, se espera una latencia de decodificación de unos 10-20 ms por token para generación, y una inferencia de clasificación (una sola pasada) en el orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Multimodal | Licencia |
|---|---|---|---|---|---|
| Trlinh29/qwen3.5-0.8b-5e-classify | 0,85B | 262K | Gated delta networks | Sí (base) | No disponible |
| Qwen3-0.6B | 0,6B | 32K | Transformer denso | No | Apache 2.0 |
| Llama-3.2-1B | 1,2B | 128K | Transformer denso | No | Llama 3.2 Community License |
| SmolLM2-1.7B | 1,7B | 8K | Transformer denso | No | Apache 2.0 |

Este fine-tune se distingue por su arquitectura híbrida y su contexto extremadamente largo (262K), muy superior al de la mayoría de modelos de tamaño similar. Sin embargo, al ser un fine-tune comunitario sin licencia especificada, su uso en producción comercial es incierto. Los modelos comparables (Qwen3-0.6B, Llama-3.2-1B) tienen licencias claras y documentación más extensa, aunque menor contexto.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base entrenado con datos web, puede heredar sesgos de género, raza o ideológicos presentes en los datos de entrenamiento. No se ha realizado una evaluación específica de sesgos para este modelo.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de clasificación con categorías ambiguas o datos fuera de distribución.
- Limitaciones de contexto e idioma: aunque el contexto es de 262K tokens, el fine-tune puede haber sido entrenado con un dataset limitado, lo que podría reducir su capacidad para manejar idiomas distintos del inglés o dominios específicos.
- Restricciones de licencia: no se especifica ninguna licencia en el repositorio de HuggingFace, lo que implica que el uso comercial no está claramente permitido. Se recomienda contactar al autor antes de utilizarlo en producción.
- Incertidumbre sobre el entrenamiento: no se conocen los datos de entrenamiento ni el método de ajuste, por lo que el rendimiento en tareas de clasificación puede variar significativamente según el dominio.
- Posibles problemas de compatibilidad: al ser un modelo de la serie Qwen3.5, puede presentar el problema conocido de tokens de razonamiento en streaming, que provoca respuestas vacías en clientes compatibles con OpenAI (según el gist de TheAIHorizon). Es necesario configurar adecuadamente el despliegue para desactivar el modo de pensamiento si no se desea.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Trlinh29/qwen3.5-0.8b-5e-classify
- Documentación de vLLM sobre Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Repositorio GitHub del proyecto Qwen3.5: https://github.com/algtrd24/qwen3.5
- Guía para corregir respuestas vacías en Qwen 3.x/3.5: https://gist.github.com/TheAIHorizon/37c30e375f2ce08e726e4bb6347f26b1
- Benchmark y guía de ejecución de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Ficha de Qualcomm AI Hub para Qwen3.5-0.8B: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
