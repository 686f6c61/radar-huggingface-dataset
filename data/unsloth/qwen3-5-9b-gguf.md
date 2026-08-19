# unsloth/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B es un modelo de lenguaje multimodal desarrollado por Alibaba Qwen, que integra un codificador de visión y un modelo de lenguaje causal de 9 mil millones de parámetros. Su arquitectura híbrida combina Gated Delta Networks (atención lineal) con Gated Attention (atención clásica con RoPE), lo que permite un alto rendimiento con un coste computacional reducido. La versión GGUF publicada por Unsloth aplica su técnica de cuantización dinámica 2.0, que mejora la precisión frente a otras cuantizaciones del mismo tamaño.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000, y por su soporte de 201 idiomas y dialectos. Está diseñado para tareas de razonamiento, generación de código, uso de agentes y comprensión visual, con un entrenamiento que incluye refuerzo a gran escala en entornos con millones de agentes. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida con Gated Delta Networks y Gated Attention |
| Parametros totales | 9 000 000 000 (9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); múltiples cuantizaciones disponibles (no se enumeran en la información proporcionada) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base en el repositorio oficial) |

## Arquitectura y entrenamiento

El modelo Qwen3.5-9B emplea una arquitectura híbrida de atención: combina capas de Gated DeltaNet, una variante de atención lineal con estado recurrente, con capas de Gated Attention clásica que usan RoPE. La configuración interna incluye 32 capas, con una dimensión oculta de 4096 y una capa de embedding de 248 320 tokens (con padding). El layout por bloque es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). El Gated DeltaNet usa 32 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128; el Gated Attention usa 16 cabezas Q y 4 cabezas KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene una dimensión intermedia de 12 288. Además, el modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con refuerzo escalado a entornos de millones de agentes y una eficiencia multimodal cercana al 100 % respecto al entrenamiento solo de texto. La fusión temprana de tokens multimodales permite un rendimiento comparable a modelos Qwen3-VL en tareas de razonamiento, código y comprensión visual.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica y matemáticas.
- Comprensión visual: el modelo acepta entradas de imagen y texto (pipeline image-text-to-text), permitiendo responder preguntas sobre imágenes.
- Generación de código y soporte de agentes: diseñado para tareas de programación y uso de herramientas (tool calling).
- Multilingüismo: soporte de 201 idiomas y dialectos, con comprensión cultural y regional.
- Ventana de contexto larga: 262 144 tokens nativos, ampliable a más de un millón, adecuada para documentos extensos y conversaciones multi-turno.
- Multi-Token Prediction (MTP): genera varios tokens por paso, mejorando la velocidad de inferencia.
- Modo de pensamiento (thinking mode) probablemente disponible, como en otros modelos Qwen3, aunque no se confirma explícitamente en la documentación.

## Casos de uso

- Análisis de documentos extensos: gracias a su contexto de 262 144 tokens, puede procesar libros completos, informes técnicos o contratos legales en una sola pasada, resumiendo o extrayendo información relevante.
- Asistente de atención al cliente multilingüe: su soporte de 201 idiomas permite gestionar conversaciones con usuarios de distintas regiones, manteniendo el contexto de la interacción durante largas sesiones.
- Generación y revisión de código en pipelines de CI/CD: puede integrarse como agente que revisa pull requests, sugiere correcciones y genera tests, aprovechando su capacidad de razonamiento y tool calling.
- Análisis de imágenes médicas o técnicas: al aceptar entradas de imagen, puede describir radiografías, diagramas o capturas de pantalla, ayudando a técnicos o personal sanitario en tareas de triaje.
- Búsqueda y recuperación de información en bases de conocimiento: con su contexto largo y capacidad de razonamiento, puede responder preguntas complejas sobre corpus extensos, como manuales o documentación corporativa.
- Creación de contenido educativo localizado: su cobertura de 201 idiomas permite generar material didáctico adaptado a contextos culturales específicos, con explicaciones precisas en la lengua materna del estudiante.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla comparativa con resultados de benchmarks (MMLU-Pro, entre otros) frente a GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507, Qwen3.5-9B y Qwen3.5-4B. Sin embargo, la información proporcionada está incompleta y no se muestran los valores numéricos de las puntuaciones. Por tanto, no se dispone de resultados cuantitativos verificables en la documentación disponible.

## Requisitos de hardware

- Según la guía de despliegue de InnoAI, el modelo base (en FP16) puede ejecutarse en una GPU de 16-24 GB, y en cuantización de 4 bits cabe cómodamente en ese rango.
- Para las cuantizaciones GGUF, el tamaño del repositorio (289.8 GB) indica que se ofrecen múltiples niveles de cuantización. Las versiones de 4 bits (tipo Q4_K_M o similar) suelen requerir entre 6 y 8 GB de VRAM para un modelo de 9B, aunque no se confirman cifras exactas en la documentación.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 para las cuantizaciones más altas; GPUs de consumo con 8-12 GB pueden ejecutar cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, Unsloth Desktop, vLLM (para el modelo base en safetensors), SGLang y KTransformers, según la documentación oficial.
- La latencia y el throughput no se especifican en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (este) | 9B denso | 262K nativo, 1M extensible | Híbrida Gated DeltaNet + Gated Attention, multimodal | Apache 2.0 | 201 idiomas, MTP |
| Qwen3-30B-A3B-Thinking | 30B total, 3B activos (MoE) | 256K | MoE, thinking mode | Apache 2.0 | Solo texto, sin visión |
| GPT-OSS-20B | 20B | No disponible | Transformer denso | Apache 2.0 | Modelo open source de OpenAI, sin visión |

La comparativa se basa en datos de la model card y de la documentación de Unsloth. No se dispone de resultados de benchmark completos para comparar el rendimiento numérico.

## Limitaciones y advertencias

- No se han publicado en la información disponible detalles sobre sesgos específicos o riesgos de alucinación. Como todo modelo de lenguaje, puede generar contenido falso o incoherente, especialmente en dominios poco representados en sus datos de entrenamiento.
- La ventana de contexto de 262 144 tokens es amplia, pero el rendimiento puede degradarse en los extremos superiores; se recomienda validar la calidad en tareas de muy largo contexto.
- Aunque soporta 201 idiomas, la calidad puede variar significativamente entre lenguas mayoritarias y minoritarias.
- La licencia Apache 2.0 permite uso comercial, pero los modelos base de Qwen pueden tener términos adicionales; se recomienda revisar la licencia del repositorio original de Qwen.
- Las cuantizaciones GGUF de Unsloth Dynamic 2.0 están optimizadas para su ecosistema; si se usan con otras herramientas, puede haber pequeñas diferencias de rendimiento o compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Guía de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Blog de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Colección de Unsloth para Qwen3.5: https://huggingface.co/collections/unsloth/qwen35
