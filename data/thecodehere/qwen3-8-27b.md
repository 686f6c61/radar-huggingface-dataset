# TheCodeHere/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba, presentado como la evolución más capaz de la familia abierta Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, integra un codificador de visión nativo que le permite comprender imágenes y vídeos, además de texto, con un control flexible del razonamiento. Está diseñado para tareas complejas de varios pasos, incluyendo codificación, trabajo profesional, investigación y ejecución de agentes autónomos.

El modelo combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en una disposición híbrida, alcanzando una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Incluye entrenamiento con predicción multi-token (MTP) y un modo de pensamiento configurable que puede desactivarse por petición. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Está disponible en formato safetensors y es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de visión (dense, híbrido atención lineal + atención completa) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible en la información proporcionada (se esperan GGUF, AWQ, GPTQ en el ecosistema) |
| Idiomas soportados | No disponible (la familia Qwen suele ser multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo causal con un codificador de visión acoplado. El bloque de lenguaje tiene 64 capas con dimensión oculta de 5120 y embedding de tokens de 248 320 (con padding). La disposición interna es de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de una capa FFN, y un sub-bloque final de Gated Attention seguido de otra FFN. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Gated Attention utiliza 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 17 408.

El entrenamiento incluye una etapa de pre-entrenamiento y otra de post-entrenamiento, con predicción multi-token (MTP) en múltiples pasos. No se especifican el número de tokens de entrenamiento ni la composición del dataset en la información disponible. El modelo soporta un modo de razonamiento configurable: activado por defecto, puede desactivarse por petición, ajustar la profundidad mediante `reasoning_effort` y conservar el contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con mejora sustancial en tareas de codificación, trabajo profesional e investigación.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de agentes autónomos: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de múltiples pasos.
- Control flexible del razonamiento: modo de pensamiento activable/desactivable por petición, ajuste de esfuerzo de razonamiento y retención de contexto de razonamiento histórico.
- Compatibilidad con herramientas y harnesses populares de desarrollo, facilitando la integración en flujos existentes.
- Soporte de tool calling y function calling (implícito en su capacidad de agente, aunque no se detalla explícitamente).
- Multilingüismo probable (heredado de la familia Qwen), aunque no se confirma en la documentación.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos, correos y hojas de cálculo, extrayendo información y generando resúmenes o respuestas, gracias a su capacidad de comprensión de texto largo y visión para documentos escaneados.
- Asistente de codificación en entornos de terminal: con su alto rendimiento en Terminal Bench, puede ejecutar comandos, depurar errores y completar tareas de programación directamente desde la línea de comandos, integrándose en pipelines de CI/CD.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite interpretar diagramas, gráficos y ecuaciones en papers, facilitando la revisión de literatura y la extracción de conclusiones.
- Agente de atención al cliente multimodal: puede gestionar conversaciones multi-turno con contexto largo (262K tokens) y analizar capturas de pantalla o vídeos enviados por usuarios para resolver incidencias técnicas.
- Investigación de mercado y análisis de vídeo: procesa vídeos de hasta una hora para extraer eventos, transcribir diálogos y generar informes estructurados, útil en análisis de grabaciones de reuniones o contenido audiovisual.
- Desarrollo de asistentes personales con razonamiento profundo: su modo de pensamiento configurable permite desplegar asistentes que planifiquen tareas complejas (reservas, itinerarios) con explicaciones paso a paso, ajustables según la necesidad de latencia.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero solo se ha podido extraer parcialmente. Según la búsqueda web, Qwen3.8-27B obtiene los siguientes resultados:

| Benchmark | Qwen3.8-27B |
|---|---|
| DeepSWE (agente de codificación) | 42.2 |
| Terminal Bench 2.1 (Terminus) | 73.0 |
| OSWorld (agente de sistema operativo) | 84.3 |
| MathVision | No disponible (se menciona evaluación con prompt específico, pero sin valor) |

No se dispone de resultados completos para MMLU, HumanEval o GSM8K en la información proporcionada. La tabla original de la model card está truncada en el texto recibido, por lo que no se pueden presentar comparaciones completas con los otros modelos.

## Requisitos de hardware

- VRAM estimada: en fp16, los 27 781 millones de parámetros requieren aproximadamente 55.6 GB (tamaño del repo en safetensors). Con cuantización de 8 bits (~28 GB) o 4 bits (~14 GB) podría ejecutarse en GPUs consumer de gama alta.
- GPUs recomendadas: para fp16 se necesitan GPUs profesionales como A100 (80 GB) o H100. Con cuantización 8 bits, una RTX 4090 (24 GB) podría ser suficiente; con 4 bits, una RTX 3090 o RTX 4080 (16 GB) podría funcionar, aunque con limitaciones de velocidad.
- En consumer GPU: sí, con cuantización. No se especifican tamaños exactos de GGUF en la información disponible.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. También se espera soporte en llama.cpp y Ollama cuando se publiquen cuantizaciones GGUF.
- Latencia y throughput: no se proporcionan datos concretos. Al ser un modelo denso de 27B, la latencia dependerá de la GPU y la cuantización; en una A100 con fp16 se pueden esperar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

La tabla de la model card compara Qwen3.8-27B con Qwen3.6-27B (misma familia y tamaño), Qwen3.7-Plus (posiblemente un modelo más grande o de pago), Muse Glimmer-30B (otro modelo de 30B) y Opus4.6 Max (probablemente un modelo propietario). No se dispone de los valores numéricos completos de esos modelos en la información extraída. A continuación se resumen las diferencias conocidas:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K nativo, 1M extensible | Apache 2.0 | Multimodal, agente, MTP |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 (presumible) | Versión anterior de la misma familia |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Posible modelo propietario o de mayor tamaño |
| Muse Glimmer-30B | 30B | No disponible | No disponible | Modelo de tamaño similar, sin datos de contexto |
| Opus4.6 Max | No disponible | No disponible | No disponible | Posible modelo cerrado |

No se pueden extraer conclusiones cuantitativas sin los valores de benchmark completos.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos en la documentación proporcionada. Como modelo de lenguaje grande, existe riesgo de generar información incorrecta o inventada, especialmente en dominios especializados.
- La longitud de contexto de 262K tokens puede degradar el rendimiento en tareas que requieran recuperación precisa de información muy distante; se recomienda validar en casos de uso reales.
- El soporte multilingüe no está documentado explícitamente; aunque la familia Qwen suele cubrir múltiples idiomas, no se garantiza la calidad en todos ellos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede tener limitaciones en cuanto a responsabilidad legal por su uso en aplicaciones de alto riesgo (no se especifica).
- El repositorio de HuggingFace citado (TheCodeHere/Qwen3.8-27B) parece ser un mirror no oficial; se recomienda utilizar el repositorio original de Qwen para producción.
- No se dispone de información sobre el proceso de alineación (RLHF/DPO) ni sobre la composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios sensibles.

## Enlaces

- Repositorio oficial en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio espejo citado en la información: https://huggingface.co/TheCodeHere/Qwen3.8-27B
- Repositorio de GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía para principiantes en Dev.to: https://dev.to/aimodels-fyi/a-beginners-guide-to-the-qwen38-27b-model-by-qwen-on-huggingface-11j9
- Guía completa en LovableApp: https://lovableapp.org/blog/qwen3-8-27b
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
