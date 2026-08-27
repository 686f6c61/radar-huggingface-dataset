# XURMATRONIX/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (texto, imagen y video) desarrollado por el equipo Qwen de Alibaba, publicado en agosto de 2026. Es la generación más reciente de la familia Qwen open-source, construido sobre la base arquitectónica de Qwen3.5, e incorpora mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Con 27.781 millones de parámetros, ofrece un equilibrio entre capacidad y despliegue local, siendo una opción atractiva para desarrolladores que necesitan un modelo potente sin los costes de infraestructura de los modelos de mayor tamaño.

El modelo presenta una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con Gated Attention (atención con RoPE), junto con Multi-Token Prediction (MTP) para acelerar la generación. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, lo que lo hace adecuado para tareas que requieren procesar documentos extensos, historiales de conversación largos o vídeos de larga duración. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y está disponible en formato safetensors compatible con Transformers, vLLM, SGLang y otras herramientas del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet + Gated Attention |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se pueden generar GGUF, AWQ, GPTQ mediante herramientas externas) |
| Idiomas soportados | No disponible (se espera multilingüe como otros modelos Qwen, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con un encoder de visión integrado, lo que le permite procesar entradas multimodales (texto, imágenes y vídeo). La arquitectura del bloque de lenguaje es híbrida: combina capas de Gated DeltaNet, un mecanismo de atención lineal eficiente, con capas de Gated Attention que utilizan Rotary Position Embedding (RoPE). El modelo tiene 64 capas, una dimensión oculta de 5.120 y un embedding de tokens de 248.320 (padded). El layout interno es de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de Gated Attention, todos con sus respectivas FFN. Además, incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la velocidad de decodificación y la calidad de las predicciones.

El entrenamiento se realizó en dos etapas: pre-training y post-training, aunque no se han publicado detalles específicos sobre el número de tokens, la composición del dataset ni las técnicas de alineación (RLHF, DPO, etc.). El modelo incluye un modo de pensamiento flexible: el razonamiento está activado por defecto, pero puede desactivarse por petición, ajustarse la profundidad del razonamiento mediante el parámetro `reasoning_effort`, y conservar el contexto de razonamiento de mensajes históricos mediante `preserve_thinking`. Esta configuración permite adaptar el comportamiento del modelo según la latencia y la calidad deseadas.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento configurable (thinking mode) que permite ajustar la profundidad del razonamiento.
- Comprensión de imágenes y vídeo: procesa diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y function calling, integrable en pipelines de agentes y automatización.
- Capacidades multilingües (no especificadas oficialmente, pero se espera cobertura amplia como en otros modelos Qwen).
- Contexto largo nativo de 262K tokens, extensible a 1M, adecuado para documentos extensos y conversaciones prolongadas.
- Compatibilidad con múltiples frameworks de inferencia: Transformers, vLLM, SGLang, TokenSpeed, LM Studio, Atomic Chat y hardware AMD (Ryzen AI Max y Radeon).

## Casos de uso

- Asistente de programación con contexto largo: el modelo puede mantener el estado completo de un repositorio o una sesión de depuración extensa gracias a sus 262K tokens de contexto nativo, permitiendo sugerencias de código coherentes a lo largo de cientos de interacciones.
- Automatización de oficina: procesa documentos con imágenes, tablas y diagramas, extrayendo información estructurada para generar informes, resúmenes o rellenar plantillas, con soporte de tool calling para integrarse en suites ofimáticas.
- Agente autónomo de investigación: con su capacidad de planificación multi-paso y manejo de feedback del entorno, puede ejecutar búsquedas web, leer documentos, resumir hallazgos y producir un informe final, manteniendo el contexto de todo el proceso.
- Análisis de vídeo de vigilancia o formación: el modelo procesa vídeos de hasta una hora, identificando eventos, transcribiendo diálogos y generando resúmenes temporales, útil en seguridad, educación o revisión de contenido.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con historial extenso, manteniendo el contexto de la interacción completa y derivando a herramientas externas (CRM, sistemas de tickets) mediante function calling.
- Generación de código en producción: integrable en pipelines de CI/CD para revisión de código, generación de tests y documentación automática, con soporte de tool calling para interactuar con el repositorio y los sistemas de integración continua.
- Asistente de investigación científica: analiza artículos con figuras y tablas, extrae resultados experimentales y compara metodologías, gracias a su capacidad de comprensión de imágenes y su contexto largo para procesar papers completos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero la información disponible está incompleta. Se menciona el benchmark "Terminal Bench 2.1 (Terminus)" para coding agéntico, comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se han proporcionado los valores numéricos en la información disponible. No se han publicado resultados completos de benchmarks estándar como MMLU, HumanEval o GSM8K en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55,6 GB en FP16 (pesos completos), ~28 GB en cuantización de 8 bits y ~14 GB en cuantización de 4 bits.
- GPUs recomendadas: A100 80GB o H100 para FP16; RTX 4090, RTX 6000 Ada o A100 40GB para 8 bits; RTX 4080/4090 o GPUs con 16GB+ para 4 bits.
- Cabe en GPUs de consumo: sí, con cuantización de 4 bits en una RTX 4090 (24GB) o similar; con 8 bits se necesita una GPU de 32GB o más.
- Opciones de despliegue: vLLM, SGLang, Transformers, TokenSpeed, llama.cpp (vía GGUF), LM Studio, Atomic Chat, y soporte nativo en hardware AMD Ryzen AI Max y Radeon.
- Latencia y throughput: no disponible en la información proporcionada; depende de la cuantización, el hardware y el modo de razonamiento activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidades | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B | 262K (ext. 1M) | Apache 2.0 | Texto, imagen, vídeo | Modelo analizado; híbrido DeltaNet + Attention |
| Qwen3.6-27B | 27B (estimado) | No disponible | Apache 2.0 (presumible) | Texto, imagen, vídeo | Generación anterior de la misma familia |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | Modelo comparado en benchmarks de la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Modelo comparado en benchmarks de la model card |

La comparativa se basa en los datos disponibles; no se han encontrado especificaciones completas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o comportamientos no deseados; como todo LLM, puede generar contenido sesgado o inexacto.
- Riesgo de alucinación: el modelo puede inventar información, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La extensión del contexto a 1M tokens puede degradar la calidad de la atención en los extremos de la ventana; se recomienda validar el rendimiento en casos de uso reales.
- No se especifican los idiomas soportados oficialmente; aunque se espera multilingüismo, la cobertura exacta no está confirmada.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de la política de uso aceptable de Alibaba si se utiliza a través de servicios en la nube.
- El modelo requiere hardware con suficiente VRAM para FP16; para despliegue en GPUs de consumo es necesaria cuantización, lo que puede afectar ligeramente a la calidad de salida.

## Enlaces

- HuggingFace: https://huggingface.co/XURMATRONIX/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Blog de AMD sobre soporte del modelo: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página en Atomic Chat: https://atomic.chat/models/qwen3-8-27b
- Página general de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
