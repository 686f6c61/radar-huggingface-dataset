# summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF en formato `Q4_K_M` del modelo `summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64`, una variante modificada de la arquitectura Qwen3.8 de Alibaba con componentes recurrentes denominados GDN. El modelo base, desarrollado por el usuario summerMC, parte del Qwen3.8-27B original y añade modificaciones arquitectónicas que requieren un `llama.cpp` reciente para su correcta ejecución. La cuantización `Q4_K_M` ofrece un equilibrio práctico entre calidad, uso de memoria y velocidad de inferencia, con un tamaño de archivo de 16,7 GB.

El modelo está pensado para ejecución local en hardware consumer, con una ventana de contexto máxima de 262.144 tokens, lo que lo hace adecuado para tareas que requieren procesamiento de secuencias largas, como análisis de documentos extensos o conversaciones de múltiples turnos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 modificada (qwen35) con componentes GDN/recurrentes |
| Parametros totales | 27.072.285.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (única disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo denso multimodal de 27.000 millones de parámetros desarrollado por el equipo de Qwen de Alibaba. El repositorio original de summerMC añade modificaciones denominadas GDN (posiblemente una capa recurrente o de atención lineal) que requieren soporte específico en `llama.cpp`. No se dispone de información sobre los datos de entrenamiento, el número de tokens usados o si se aplicaron técnicas de alineación como RLHF o DPO. La cuantización se generó mediante `llama-quantize` a partir de una versión BF16 del GGUF.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado, como cualquier modelo de lenguaje de tamaño similar.
- Contexto largo: soporta hasta 262.144 tokens, lo que permite procesar documentos completos o conversaciones de muchos turnos.
- Multimodalidad: el modelo base original es multimodal (visión y lenguaje), pero esta cuantización GGUF se presenta con pipeline `text-generation` y no se garantiza el soporte de entradas visuales en el formato GGUF.
- No se han documentado capacidades específicas como tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- **Análisis de documentos extensos**: gracias a su contexto de 262.144 tokens, puede resumir o extraer información de libros, informes o bases de conocimiento completas en una sola pasada.
- **Asistente de chat con historial largo**: adecuado para aplicaciones de atención al cliente donde se necesita mantener el contexto de la conversación durante largas sesiones.
- **Generación de código en entornos locales**: al ser un modelo de 27B, puede ejecutarse en GPU de consumo y usarse como autocompletado de código o generación de scripts en herramientas de desarrollo.
- **Procesamiento de documentos legales o técnicos**: para extracción de cláusulas, resumen de contratos o consultas sobre normativas.
- **Prototipado de agentes conversacionales**: dado su tamaño moderado y licencia permisiva, sirve para experimentar con agentes que requieran contexto largo sin depender de APIs externas.
- **Análisis de logs o datos de series temporales**: puede procesar secuencias largas de eventos o registros para detectar patrones o generar resúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF `Q4_K_M` ocupa 16,7 GB, por lo que se necesita al menos 16 GB de VRAM para cargar el modelo completo. Con contexto adicional (KV cache) se recomienda 24 GB o más.
- **GPU recomendadas**: RTX 4090 (24 GB), RTX 6000 Pro (48 GB), A100 40 GB, o GPUs con 24 GB o más. Para inferencia parcial con offload de capas a CPU, se puede usar GPUs de 12 GB pero con mayor latencia.
- **En consumer GPU**: sí, cabe en RTX 4090 y en GPUs de 24 GB; en GPUs de 16 GB (como RTX 3080 Ti) es ajustado, pero posible con contexto reducido.
- **Opciones de despliegue**: `llama.cpp` (CLI o servidor), `Ollama`, `llama-cpp-python` para integración en Python. Se recomienda usar una versión reciente de `llama.cpp` para soportar la arquitectura modificada.
- **Latencia y throughput**: no se dispone de mediciones específicas. Para un modelo de 27B en Q4_K_M, se espera una velocidad de decodificación de entre 20 y 40 tokens por segundo en una RTX 4090, dependiendo de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con otros modelos. La arquitectura GDN no está documentada públicamente, y no se conocen modelos directamente comparables con las mismas modificaciones. Se puede señalar que el modelo base Qwen3.8-27B es comparable en tamaño a Llama-3.1-27B o Gemma-2-27B, pero sin datos de rendimiento no se puede realizar una comparación cuantitativa.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: la cuantización Q4_K_M introduce una degradación leve en la precisión numérica, que puede afectar tareas que requieren exactitud matemática o razonamiento fino.
- **Arquitectura no estándar**: los componentes GDN/recurrentes requieren una versión reciente de `llama.cpp`; versiones antiguas pueden no cargar el modelo o producir errores.
- **Soporte multimodal incierto**: aunque el modelo base es multimodal, la cuantización GGUF se etiqueta como `text-generation`; no se garantiza el procesamiento de imágenes en este formato.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir contenido falso o no verificado, especialmente en contextos largos.
- **Sin información sobre sesgos**: no se dispone de datos sobre sesgos o riesgos específicos del modelo base modificado.
- **Restricciones de uso**: la licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para cualquier obligación adicional.

## Enlaces

- [Repositorio GGUF en Hugging Face](https://huggingface.co/summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64-GGUF)
- [Modelo base sin cuantizar](https://huggingface.co/summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Página de QwenCloud para Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [Guía de despliegue en DGX Spark / RTX 6000 Pro](https://github.com/MiaAI-Lab/Qwen3.8-27B-DGX-Spark-RTX-6000)
