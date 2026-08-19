# Wwayu/Qwen3.8-27B-heretic-mlx-4Bit

## Resumen

Wwayu/Qwen3.8-27B-heretic-mlx-4Bit es una conversión al formato MLX (Apple Silicon) con cuantización de 4 bits del modelo choz/Qwen3.8-27B-heretic, una variante "heretic" del modelo Qwen3.8-27B desarrollado por Alibaba. La versión heretic aplica una técnica de abliteration para eliminar las direcciones de rechazo en los pesos del modelo, reduciendo significativamente la censura y permitiendo respuestas más directas y sin filtros en temas sensibles. El modelo base Qwen3.8-27B es un transformer denso multimodal con visión, razonamiento configurable y una ventana de contexto nativa de 262 000 tokens, orientado a tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte.

Esta conversión MLX permite ejecutar el modelo en dispositivos con Apple Silicon (Macs con chip M1/M2/M3/M4) de forma eficiente, ocupando aproximadamente 4,2 GB de memoria gracias a la cuantización de 4 bits. El modelo hereda todas las capacidades del Qwen3.8-27B original, incluida la entrada de imágenes, el razonamiento paso a paso y el soporte para herramientas, pero con la particularidad de no aplicar restricciones de contenido. Su licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones locales o en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + texto), Qwen3.8-27B |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (262K) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX (4-bit) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura multimodal que procesa tanto texto como imágenes. Incorpora un codificador visual y un decodificador de lenguaje, con atención de ventana completa y mecanismos de razonamiento configurable (modo pensamiento o respuesta directa). Se entrenó con un corpus masivo de datos de texto e imagen, aunque no se han publicado detalles exactos sobre el número de tokens o la composición del dataset. El modelo destaca por su ventana de contexto de 262K tokens, que permite manejar documentos largos y conversaciones extensas.

La versión heretic se obtiene mediante abliteration, una técnica que identifica y elimina las direcciones de rechazo en los pesos del modelo, es decir, las representaciones internas que el modelo ha aprendido para negarse a responder a ciertas peticiones. Este proceso no requiere reentrenamiento, sino una modificación de los pesos basada en el análisis de activaciones. El resultado es un modelo que responde de manera más directa a instrucciones que el modelo original podría considerar inapropiadas, aunque conserva la misma capacidad técnica y de razonamiento. La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, manteniendo la arquitectura y los pesos cuantizados a 4 bits.

## Capacidades

- Generación de texto y razonamiento: responde a preguntas complejas, resuelve problemas matemáticos y lógicos, y puede activar un modo de "pensamiento" para razonar paso a paso antes de dar la respuesta final.
- Visión: acepta imágenes como entrada, pudiendo describir su contenido, responder preguntas sobre ellas o extraer información visual (OCR, análisis de escenas, etc.).
- Soporte de tool calling / function calling: puede invocar herramientas externas (APIs, funciones) de forma estructurada, lo que permite integrarlo en agentes y flujos de automatización.
- Capacidades de agente: diseñado para tareas de largo horizonte, puede planificar y ejecutar múltiples pasos, gestionar contexto extenso y tomar decisiones basadas en resultados intermedios.
- Multilingüe: aunque no se detallan los idiomas exactos, el modelo base Qwen3.8 soporta numerosos idiomas, incluido el español, inglés, chino, francés, alemán, etc.
- Sin censura (uncensored): gracias a la abliteration, el modelo no aplica los filtros de contenido habituales, respondiendo a temas tabú o controversiales sin restricciones (con los riesgos asociados).
- Razonamiento configurable: se puede activar o desactivar el modo de razonamiento extendido según la tarea, permitiendo respuestas rápidas o análisis profundos.

## Casos de uso

- Asistente de desarrollo de software sin restricciones: el modelo puede generar código, depurar errores y explicar conceptos técnicos sin las limitaciones habituales de los modelos censurados. Es adecuado para entornos de desarrollo donde se necesitan respuestas directas sobre vulnerabilidades o exploits (con fines educativos o de seguridad).
- Análisis de documentos extensos: gracias a su contexto de 262K tokens, puede procesar libros completos, contratos legales o informes técnicos, resumiendo, extrayendo datos o respondiendo preguntas sobre el contenido en una sola pasada.
- Agente autónomo para automatización de tareas: su capacidad de tool calling y razonamiento de largo horizonte permite construir agentes que navegan por APIs, ejecutan comandos, gestionan archivos y completan tareas de varias etapas, como la gestión de un proyecto o la recopilación de datos.
- Investigación académica y literaria: al no tener filtros de contenido, puede analizar temas controvertidos, generar hipótesis o redactar textos sobre cualquier materia sin autocensura, útil para investigadores que necesitan explorar todos los ángulos de un tema.
- Chatbot de atención al cliente con personalidad abierta: el modelo puede mantener conversaciones naturales y sin restricciones sobre cualquier tema, adaptándose a un tono informal o profesional. Su contexto largo permite recordar interacciones previas y ofrecer respuestas coherentes en sesiones prolongadas.
- Generación de contenido creativo sin límites: escritura de ficción, guiones, poesía o contenido para adultos, donde la ausencia de censura permite explorar temáticas que otros modelos rechazan. La capacidad de visión también permite generar descripciones a partir de imágenes.
- Despliegue en dispositivos locales: gracias a la cuantización 4-bit y al formato MLX, puede ejecutarse en un Mac con 24 GB de RAM unificada, ofreciendo un asistente personal privado sin conexión a internet y sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión heretic (choz/Qwen3.8-27B-heretic) ni para esta conversión MLX. Sin embargo, el modelo base Qwen3.8-27B reporta los siguientes resultados en tareas de agente y razonamiento, según la documentación oficial:

| Benchmark | Resultado (Qwen3.8-27B base) |
|---|---|
| DeepSWE (resolución de issues en repositorios) | 42.2 |
| Terminal Bench (tareas de terminal) | 73.0 |
| OSWorld (interacción con sistemas operativos) | 84.3 |

Estos datos corresponden al modelo sin abliteration; la versión heretic podría presentar variaciones, aunque no se dispone de mediciones independientes. En tareas de lenguaje general (MMLU, HumanEval, GSM8K) no se han encontrado cifras publicadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado a 4 bits ocupa aproximadamente 4,2 GB en disco, pero en ejecución requiere memoria adicional para activaciones y contexto. Según Unsloth, puede ejecutarse con 17 GB de RAM/VRAM combinados, y en un Mac con 24 GB de RAM unificada se ejecuta cómodamente con la cuantización Q4.
- GPU recomendadas: para usar el formato MLX se necesita un Apple Silicon (M1/M2/M3/M4) con al menos 16 GB de memoria unificada, aunque 24 GB es lo recomendado para contexto largo. En GPUs NVIDIA/AMD, se puede usar el modelo base en formato safetensors con cuantización 4-bit (por ejemplo, con vLLM o llama.cpp), requiriendo al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100 40GB, etc.).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 16-24 GB de VRAM, como RTX 4080/4090, o en Macs con 24 GB de RAM unificada.
- Opciones de despliegue: para MLX se usa `mlx-lm` (pip install mlx-lm). Para otras plataformas, se puede convertir a GGUF (llama.cpp, Ollama) o usar vLLM/TGI con soporte de cuantización AWQ/GPTQ.
- Latencia y throughput: no se han publicado mediciones específicas para esta conversión. En un Mac M2 Max con 24 GB, se espera una generación de 10-20 tokens por segundo en 4-bit, dependiendo del contexto y la longitud de la respuesta.

## Comparativa con modelos similares

Dado que la versión heretic es una modificación del Qwen3.8-27B, la comparación más relevante es con el modelo base y con otras variantes de 27B. No se dispone de datos detallados de rendimiento para la versión heretic, por lo que la comparación se basa en características generales.

| Modelo | Parámetros | Contexto | Visión | Licencia | Sin censura | Formato MLX |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Sí | Apache 2.0 | No | Sí (conversión oficial) |
| choz/Qwen3.8-27B-heretic | 27B | 262K | Sí | Apache 2.0 | Sí (abliteration) | No (safetensors) |
| Wwayu/Qwen3.8-27B-heretic-mlx-4Bit (este) | 27B | 262K | Sí | Apache 2.0 | Sí | Sí (4-bit) |
| Qwen3-27B (versión anterior) | 27B | 128K | No (solo texto) | Apache 2.0 | No | Sí |

La principal diferencia frente al modelo base es la eliminación de la censura, lo que puede alterar el comportamiento en tareas sensibles. Frente a Qwen3-27B, el modelo Qwen3.8 añade capacidades de visión y un contexto mucho mayor. No se han encontrado otras variantes "uncensored" de 27B con visión en el momento de la consulta.

## Limitaciones y advertencias

- Ausencia de censura: el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explícito sin restricciones. Esto supone un riesgo legal y ético si se utiliza en aplicaciones públicas o comerciales sin moderación adicional.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede producir información falsa o sesgada, especialmente en temas controvertidos. La abliteration no corrige estos problemas y puede amplificarlos al no tener filtros de seguridad.
- Limitaciones de idioma: aunque el modelo base es multilingüe, no se ha verificado el rendimiento en español u otros idiomas en esta versión específica. Es recomendable probar antes de usar en producción.
- Requisitos de hardware: el formato MLX solo funciona en Apple Silicon; para otras plataformas es necesario convertir los pesos a otro formato (GGUF, etc.), lo que puede implicar pérdida de fidelidad en la cuantización.
- Sin garantías de rendimiento: al ser una conversión no oficial, no se han realizado pruebas exhaustivas de calidad ni de seguridad. Los resultados pueden diferir del modelo original.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso de contenido generado sin censura puede violar las políticas de las plataformas de distribución o las leyes locales. El usuario es responsable del cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wwayu/Qwen3.8-27B-heretic-mlx-4Bit
- Modelo base (choz/Qwen3.8-27B-heretic): https://huggingface.co/choz/Qwen3.8-27B-heretic
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Guía de ejecución local en 24GB Mac/GPU: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
