# unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 mil millones de parámetros desarrollado por Meta Superintelligence Lab, presentado en agosto de 2026 bajo licencia Apache 2.0. Está diseñado específicamente para tareas agénticas autónomas en hardware de consumo, integrando razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal y recuperación ante fallos en un único modelo que puede ejecutarse localmente sin depender de infraestructura en la nube. Se distribuye como modelo de peso abierto y es el primer modelo de Meta Superintelligence Labs orientado a este tipo de cargas de trabajo.

La arquitectura combina un transformer causal denso con un encoder de percepción basado en ViT-G/14 de aproximadamente 1.8 mil millones de parámetros, lo que permite procesar entradas intercaladas de texto e imágenes. El modelo soporta una longitud de contexto de 131,072 tokens o más, con un patrón de atención local-global que reduce el coste computacional. Esta versión concreta, publicada por Unsloth, es una cuantización de 4 bits mediante bitsandbytes que reduce el tamaño del modelo a unos 22 GB, haciéndolo viable en GPUs de consumo con 24 GB de VRAM.

La relevancia actual de Muse Glimmer radica en su combinación de capacidades agénticas avanzadas, multimodalidad y despliegue local, un equilibrio poco común en modelos de este tamaño. Su licencia Apache 2.0 y la disponibilidad de cuantizaciones optimizadas lo convierten en una opción atractiva para desarrolladores que necesitan ejecutar agentes autónomos en entornos sin conexión o con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | bnb-4bit (esta versión); también disponible GGUF en repositorio separado |
| Idiomas soportados | Más de 100 idiomas (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (esta versión); GGUF disponible en unsloth/Muse-Glimmer-30B-GGUF |

## Arquitectura y entrenamiento

Muse Glimmer emplea un transformer causal denso con 52 capas, dimensión oculta de 6656 y un patrón de atención repetido \[Local, Local, Local, Global\]. Las capas locales utilizan una ventana deslizante de 2048 tokens con RoPE (theta = 500.000), mientras que las capas globales permiten atención completa sobre el contexto. Incorpora atención con compuerta (gated attention) y atención multi-consulta con ratio GQA de 16:1 (32 cabezas de consulta, 2 de clave/valor, dimensión de cabeza 128). La FFN es de tipo SwiGLU con dimensión intermedia de 19.968. El vocabulario consta de 202.048 tokens (200.000 BPE más 2.048 especiales).

El encoder de percepción es un ViT-G/14 de ~1,8B parámetros, 50 capas, ancho 1536 y patch de 14 píxeles, capaz de procesar hasta 4.096 tokens visuales por imagen. Los datos de entrenamiento incluyen contenido multimodal de fuentes públicas, datos de terceros e información de productos de Meta, con fecha de corte de conocimiento en enero de 2026. No se han publicado detalles sobre el uso de RLHF o DPO en el entrenamiento original, aunque la documentación de Unsloth menciona soporte para fine-tuning con reinforcement learning sobre esta arquitectura.

Una innovación destacada es el uso de un modelo auxiliar "drafter" basado en DFlash (block-diffusion) para decodificación especulativa, que propone bloques completos de tokens para acelerar la generación. Este componente se incluye en el paquete de despliegue local junto con la cuantización.

## Capacidades

- Ejecución de tareas agénticas de principio a fin: resolución de peticiones multi-turno completas, incluyendo escritura y depuración de código.
- Uso fiable de herramientas: invocación de funciones con esquemas precisos a lo largo de flujos de trabajo extendidos.
- Razonamiento multi-paso: encadena razonamientos sobre horizontes largos manteniendo planes coherentes.
- Recuperación ante fallos: si una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta.
- Comprensión multimodal: acepta texto e imágenes intercaladas (capturas de pantalla, gráficos, documentos) a través del encoder de percepción.
- Compatibilidad con scaffolds agénticos: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación.
- Esfuerzo controlable: permite ajustar la intensidad del razonamiento para equilibrar calidad y velocidad.
- Multilingüe: entrenado con datos de más de 100 idiomas.

## Casos de uso

- Agentes autónomos de investigación: el modelo puede ejecutar búsquedas web, leer documentos y sintetizar respuestas en tareas tipo DeepSearch QA, gracias a su capacidad de razonamiento multi-paso y uso de herramientas.
- Automatización de atención al cliente: con su ventana de contexto de 131K tokens y soporte multilingüe, puede gestionar conversaciones largas con historial extenso y derivar a herramientas externas cuando sea necesario.
- Asistente de programación con depuración: integrado en un scaffold como OpenClaw, puede escribir, ejecutar y corregir código en entornos de desarrollo, útil en pipelines de CI/CD.
- Análisis de documentos con imágenes: el encoder de percepción permite interpretar capturas de pantalla, diagramas o formularios escaneados junto con texto, adecuado para automatización de procesos de negocio.
- Agente de automatización de escritorio: al comprender imágenes de la interfaz, puede interactuar con aplicaciones GUI y realizar tareas repetitivas de forma autónoma.
- Asistente personal offline: al ejecutarse localmente en una GPU de 24 GB, puede servir como asistente privado que maneja correo, agenda y búsquedas sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona evaluaciones en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero sin cifras concretas. Unsloth reporta una degradación relativa media del 0,2% para la cuantización K-Quant-Dynamic y del 1,0% para la versión de 17 GB, medida sobre 15 benchmarks comunes, pero no se proporcionan los valores absolutos. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: la versión bnb-4bit ocupa aproximadamente 22 GB en disco; según Unsloth, la cuantización K-Quant-Dynamic (similar a 4-bit) requiere 32 GB de VRAM, y la versión más agresiva de 17 GB cabe en 24 GB. Esta versión concreta probablemente se sitúe en el rango de 24-32 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, A6000 48 GB. Para full precision se necesitan 64 GB de VRAM (por ejemplo, A100 80 GB o dos GPUs de 32 GB).
- Es viable en GPUs de consumo con 24 GB, aunque puede requerir ajustar el tamaño del lote o la longitud de contexto.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, y el propio framework Unsloth (que incluye soporte para el drafter DFlash y control del modo de razonamiento).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. Muse Glimmer es un modelo reciente y específico para tareas agénticas; no se han publicado comparaciones directas con alternativas como Llama 3.1 70B o Qwen 2.5 32B en los documentos consultados. La comparativa queda pendiente de datos públicos.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al estar entrenado con datos web y de productos de Meta, puede heredar sesgos presentes en esas fuentes.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento largo o cuando las herramientas devuelven resultados ambiguos.
- La ventana de contexto de 131K tokens no implica atención global total: las capas locales usan una ventana deslizante de 2048, lo que puede limitar la captura de dependencias de muy largo alcance.
- La cuantización de 4 bits introduce una degradación media de hasta el 1% en benchmarks, que puede ser mayor en tareas específicas o con entradas multimodales complejas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de las condiciones de atribución y de los términos de los datos de entrenamiento.
- La documentación sobre el entrenamiento (composición exacta del dataset, procedimiento de alineación) no está disponible públicamente en la información consultada.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit
- Repositorio GGUF: https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
- Guía de ejecución local en Unsloth: https://unsloth.ai/docs/models/muse-glimmer
- Guía de fine-tuning con Unsloth: https://unsloth.ai/docs/models/muse-glimmer/train
- Paper del encoder de percepción (arXiv 2504.13181): https://arxiv.org/abs/2504.13181
- Paper de DFlash (arXiv 2602.06036): https://arxiv.org/abs/2602.06036
- Modelo base original: https://huggingface.co/meta-models/Muse-Glimmer-30B
