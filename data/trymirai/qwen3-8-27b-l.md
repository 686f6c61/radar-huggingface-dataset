# trymirai/Qwen3.8-27B-L

## Resumen

El modelo `trymirai/Qwen3.8-27B-L` es una cuantización de 8 bits del modelo Qwen3.8-27B de Alibaba, realizada por Mirai Labs (trymirai). Está diseñada específicamente para inferencia local eficiente en Apple silicon (macOS), utilizando el runtime propietario `uzu`. La cuantización emplea enteros simétricos de 8 bits con escalas en bfloat16 y grupo de tamaño 64, junto con transformadas de Hadamard aleatorias por bloques para mitigar outliers en pesos y activaciones. Según sus autores, es una cuantización "lossless" (sin pérdida apreciable de calidad) y se posiciona como comparable al formato `UD-Q8_K_XL` de Unsloth.

El modelo base Qwen3.8-27B es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida (Gated DeltaNet + Gated Attention), nativamente multimodal (imagen y vídeo), con contexto de 262 144 tokens y capacidades de razonamiento, agente y tool calling. Esta cuantización mantiene todas esas capacidades, pero enfocada a entornos con recursos limitados, especialmente Macs con Apple silicon. Es relevante porque permite ejecutar un modelo de 27B con calidad cercana a la de precisión completa en hardware de consumo, sin necesidad de GPUs dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet y Gated Attention (cuantización 8-bit) |
| Parametros totales | 27 322 365 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | 8-bit simétrica, grupo de 64, escalas bfloat16 |
| Idiomas soportados | No disponible (el modelo base Qwen soporta múltiples idiomas, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato interno `uzu`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de lenguaje causal con encoder de visión. La capa de lenguaje se compone de 64 capas con un patrón de bloques: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La Gated DeltaNet es un mecanismo de atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas Q y 4 cabezas KV, dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 17 408. El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento, con múltiples pasos de Multi-Token Prediction (MTP).

La cuantización de Mirai Labs aplica post-training quantization (PTQ) con 8-bit simétrico, escalas en bfloat16 y grupo de 64. Para reducir outliers, utiliza transformadas de Hadamard aleatorias por bloques diagonales, tanto en pesos como en activaciones. El resultado es un checkpoint que, según los autores, no presenta diferencias discernibles respecto al modelo en precisión completa. El runtime `uzu` está optimizado para Apple silicon, aprovechando la memoria unificada y los aceleradores Neural Engine.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento ("thinking mode") activado por defecto y configurable mediante `reasoning_effort`.
- Comprensión multimodal nativa: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de larga duración (hasta horas).
- Agente autónomo: planificación de tareas de múltiples pasos, manejo de feedback del entorno y ejecución fiable de tareas complejas.
- Tool calling / function calling: soporte para integración con herramientas externas y APIs.
- Capacidades multilingües (heredadas del modelo base, aunque no se detallan idiomas concretos).
- Preservación del contexto de razonamiento en conversaciones históricas mediante `preserve_thinking`.
- Compatible con entornos de desarrollo populares (vLLM, SGLang, TokenSpeed, Hugging Face Transformers) en el modelo base; la versión cuantizada se ejecuta con `uzu` en Apple silicon.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un MacBook Pro con Apple silicon para generar código, refactorizar o explicar fragmentos, sin depender de servicios en la nube. La cuantización 8-bit permite cargar los 27B en memoria unificada de 32 GB o más, con latencia aceptable para uso interactivo.
- Análisis de documentos con imágenes: el modelo puede procesar PDFs escaneados, diagramas técnicos o capturas de pantalla, extrayendo información estructurada o respondiendo preguntas sobre el contenido, todo de forma local y privada.
- Automatización de tareas de oficina: gracias a su capacidad de agente y tool calling, puede interactuar con aplicaciones de productividad (hojas de cálculo, correos, calendarios) para automatizar flujos de trabajo, como generar informes o programar reuniones.
- Prototipado de agentes conversacionales: investigadores pueden desplegar el modelo en un Mac para probar arquitecturas de agentes multi-turno con contexto largo (hasta 262K tokens), sin necesidad de infraestructura GPU costosa.
- Educación y formación: el modelo puede servir como tutor interactivo que explica conceptos técnicos, resuelve ejercicios de matemáticas o razona sobre problemas de ciencias, con la ventaja de ejecutarse en portátiles de consumo.
- Investigación en cuantización y eficiencia: al ser una implementación de referencia de cuantización 8-bit con Hadamard transforms, puede usarse para estudiar el impacto de la cuantización en modelos híbridos y comparar con otros formatos (GGUF, GPTQ, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización. El modelo base Qwen3.8-27B reporta los siguientes resultados en tareas de agente y razonamiento (según fuentes web):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores corresponden al modelo en precisión completa y no a la versión cuantizada. La model card de Mirai afirma que la cuantización es "lossless", pero no proporciona métricas cuantitativas de validación.

## Requisitos de hardware

- Diseñado exclusivamente para Apple silicon (macOS). No es compatible con GPUs NVIDIA o AMD de forma nativa.
- Requiere un Mac con al menos 32 GB de memoria unificada para cargar el modelo en 8-bit (27 GB de pesos + overhead de runtime). Se recomienda 64 GB para mayor comodidad.
- El runtime `uzu` se instala vía Homebrew (`brew install mirai`) y se ejecuta con el comando `mirai --model trymirai/Qwen3.8-27B-L`.
- La inferencia aprovecha la memoria unificada y los aceleradores de Apple (ANEs), pero no se han publicado métricas de latencia o throughput.
- Para despliegue en otros entornos (Linux, Windows), se debe usar el modelo base Qwen3.8-27B con vLLM, SGLang, o el formato GGUF de Unsloth.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-L | 27B | 262K | 8-bit (grupo 64) | Apache 2.0 | safetensors/uzu | Apple silicon |
| unsloth/Qwen3.8-27B-GGUF (UD-Q8_K_XL) | 27B | 262K | 8-bit (UD-Q8_K_XL) | Apache 2.0 | GGUF | Multiplataforma (llama.cpp, Ollama) |
| Qwen/Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache 2.0 | safetensors | Multiplataforma (vLLM, TGI) |

La cuantización de Mirai se posiciona como una alternativa optimizada para Apple silicon, mientras que el GGUF de Unsloth es más portable. El modelo original ofrece máxima flexibilidad pero requiere más recursos.

## Limitaciones y advertencias

- Solo funciona en Apple silicon; no es utilizable en GPUs NVIDIA o AMD sin convertir los pesos a otro formato.
- La afirmación de "lossless" no está respaldada por benchmarks públicos; puede haber pequeñas degradaciones en tareas de precisión (matemáticas, lógica) no detectadas en pruebas generales.
- No se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, la cuantización no documenta este aspecto.
- El modelo base tiene sesgos potenciales inherentes a los datos de entrenamiento; la cuantización no los corrige.
- Riesgo de alucinación en tareas de razonamiento o generación de hechos, como cualquier LLM.
- La licencia Apache 2.0 permite uso comercial, pero el runtime `uzu` puede tener términos adicionales; se recomienda revisar la documentación de Mirai Labs.
- El contexto de 262K tokens es nativo del modelo base, pero el rendimiento en esa longitud depende de la memoria disponible; en Macs de 32 GB puede ser necesario reducir el contexto efectivo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/trymirai/Qwen3.8-27B-L)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog de Mirai sobre cuantización](https://trymirai.com/blog/quantization)
- [Documentación de uzu (cómo ejecutarlo)](https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md)
- [Documentación de API de Mirai](https://docs.trymirai.com/)
