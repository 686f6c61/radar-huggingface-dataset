# toseeai/Qwen3.5-9B

## Resumen

El modelo `toseeai/Qwen3.5-9B` es un ajuste fino (finetune) del modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por la organización toseeai. Este checkpoint hereda las capacidades del Qwen3.5-9B original de Alibaba, un modelo causal de lenguaje multimodal (imagen y texto) con arquitectura híbrida que combina Gated Delta Networks con atención sparse Mixture-of-Experts. El modelo está diseñado para tareas de razonamiento, comprensión visual, generación de código y agentes, con soporte nativo para 201 idiomas y una ventana de contexto de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens.

El finetune se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Con 9 653 millones de parámetros, se posiciona como una opción de tamaño medio que ofrece rendimiento comparable a modelos mucho más grandes, como GPT-OSS-120B o Qwen3-Next-80B-A3B-Thinking, según los benchmarks publicados en la model card original. Su relevancia actual radica en combinar capacidades multimodales, razonamiento avanzado y eficiencia de inferencia en un paquete relativamente compacto, apto para despliegue en GPU de consumo y entornos de producción.

El repositorio de toseeai contiene los pesos en formato safetensors, compatibles con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se proporciona información adicional sobre el proceso de ajuste fino específico, por lo que se asume que el modelo conserva las características técnicas y de rendimiento del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention + FFN (32 capas, hidden 4096) |
| Parametros totales | 9 653 104 368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | No especificados por el autor; compatibles con cuantización estándar (FP16, INT8, INT4) vía herramientas como llama.cpp o AutoGPTQ |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El Qwen3.5-9B presenta una arquitectura híbrida que combina capas de Gated DeltaNet (una variante de atención lineal con mecanismos de compuerta) con capas de atención tradicional (Gated Attention). La configuración interna incluye 32 capas, con un patrón de 8 bloques de 3 capas de Gated DeltaNet seguidas de una capa de Gated Attention, y cada bloque incluye una red feed-forward de 12 288 dimensiones. El modelo incorpora un codificador visual para procesamiento de imágenes, lo que lo convierte en un modelo multimodal de tipo image-text-to-text.

El entrenamiento se realizó en dos fases: preentrenamiento y postentrenamiento. La model card destaca el uso de aprendizaje por refuerzo a escala masiva, con entornos de millones de agentes y distribuciones de tareas progresivamente complejas. También se menciona una eficiencia de entrenamiento multimodal cercana al 100 % en comparación con el entrenamiento solo de texto, gracias a la fusión temprana de tokens multimodales. El modelo incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la velocidad de decodificación. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas de conocimiento, STEM y lógica.
- Comprensión visual: el modelo acepta imágenes como entrada y puede responder preguntas sobre ellas, describir contenido y realizar tareas de visión-lenguaje.
- Generación de código: soporta múltiples lenguajes de programación y tareas de programación competitiva.
- Razonamiento agéntico: puede actuar como agente autónomo en entornos multi-paso, con soporte para tool calling y function calling.
- Capacidades multilingües: soporte para 201 idiomas y dialectos, con comprensión cultural y regional.
- Modo de razonamiento (thinking): el modelo puede generar cadenas de pensamiento antes de responder, similar a otros modelos de la familia Qwen.
- Decodificación eficiente gracias a la arquitectura híbrida y MTP, con baja latencia y alto throughput.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en más de 200 idiomas, manteniendo contexto de hasta 262 000 tokens, lo que permite manejar historiales largos de interacción sin pérdida de información.
- Asistente de programación en producción: con soporte para tool calling, puede integrarse en pipelines de CI/CD para generar código, revisar pull requests o autocompletar funciones en entornos de desarrollo.
- Análisis de documentos técnicos y científicos: su ventana de contexto extendida permite procesar documentos extensos (manuales, papers, informes) y responder preguntas específicas sobre su contenido.
- Sistemas de recomendación conversacional: el modelo puede combinar entradas visuales (imágenes de productos) con texto para ofrecer recomendaciones personalizadas en plataformas de comercio electrónico.
- Traducción y localización: con soporte para 201 idiomas, puede traducir contenido manteniendo matices culturales y regionales, adecuado para plataformas globales.
- Agentes autónomos de automatización de tareas: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que interactúan con APIs, bases de datos y servicios web para completar tareas complejas.
- Asistente educativo multimodal: puede explicar conceptos a partir de imágenes (diagramas, fórmulas) y texto, adaptándose al nivel del estudiante.

## Benchmarks y rendimiento

La model card original incluye resultados de benchmarks comparativos con otros modelos. Los datos disponibles para Qwen3.5-9B son:

| Benchmark | Qwen3.5-9B | Qwen3.5-4B | GPT-OSS-20B | GPT-OSS-120B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30B-A3B-Thinking-2507 |
|---|---|---|---|---|---|---|
| MMLU-Pro | 82.5 | 79.1 | 74.8 | 80.8 | 82.7 | 80.9 |
| MMLU-Redux | 91.4 | no disponible | 87.8 | 91.0 | 92.5 | 91.4 |

No se dispone de datos adicionales (HumanEval, GSM8K, etc.) en la información proporcionada. La model card también menciona una figura con resultados generales, pero no se han extraído los valores numéricos. Se recomienda consultar el blog oficial de Qwen para más detalles.

## Requisitos de hardware

- VRAM estimada: el modelo en FP16 ocupa aproximadamente 19.3 GB (tamaño del repo). Con cuantización INT8 (~9.7 GB) puede ejecutarse en GPUs con 12 GB de VRAM; con INT4 (~5 GB) en GPUs con 8 GB.
- GPU recomendadas: para FP16, una NVIDIA A100, RTX 4090 o similar con 24 GB; para INT8, una RTX 4080 o RTX 3090 (12-24 GB); para INT4, una RTX 4060 o RTX 3060 (8-12 GB).
- Sí cabe en GPU de consumo: con cuantización INT4 o INT8 es viable en GPUs de gama media-alta.
- Opciones de despliegue: vLLM, SGLang, KTransformers, Hugging Face Transformers, llama.cpp, Ollama.
- Latencia y throughput: no se proporcionan datos oficiales, pero la arquitectura híbrida y MTP permiten una decodificación más rápida que modelos densos equivalentes. En Jetson Orin se ha probado con cuantización W4A16 (ver enlace en Jetson AI Lab).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B | 9.65B | 262K | 82.5 | Apache 2.0 | Hugging Face, Azure, Together |
| Qwen3.5-4B | ~4B | 262K | 79.1 | Apache 2.0 | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74.8 | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Thinking | 30B (3B activos) | no disponible | 80.9 | Apache 2.0 | Hugging Face |

El Qwen3.5-9B supera en MMLU-Pro a modelos más grandes como GPT-OSS-20B y Qwen3-30B-A3B-Thinking, y se acerca a GPT-OSS-120B, lo que demuestra una excelente eficiencia de parámetros. Su ventaja principal es el soporte multimodal y la ventana de contexto nativa de 262K, que no está disponible en los modelos comparados según la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información específica sobre el proceso de ajuste fino de toseeai; el modelo podría heredar sesgos o limitaciones del checkpoint base.
- Aunque la arquitectura soporta 201 idiomas, el rendimiento puede variar significativamente entre idiomas de alto y bajo recurso.
- Riesgo de alucinación inherente a todos los modelos generativos; se recomienda validación humana en aplicaciones críticas.
- La ventana de contexto extensible (1 010 000 tokens) puede degradar el rendimiento en longitudes extremas; se recomienda pruebas específicas.
- No se han publicado resultados de benchmarks específicos para este finetune; los datos presentados corresponden al modelo base.
- El modelo es multimodal pero solo acepta imágenes como entrada visual; no soporta audio ni video.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos de la licencia del modelo base (Qwen3.5-9B-Base).

## Enlaces

- Repositorio del finetune: https://huggingface.co/toseeai/Qwen3.5-9B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Análisis en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Análisis de rendimiento y precio: https://artificialanalysis.ai/models/qwen3-5-9b
- Página en Together AI: https://www.together.ai/models/qwen3-5-9b
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
