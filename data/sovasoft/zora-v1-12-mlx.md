# sovasoft/zora-v1.12-mlx

## Resumen

Zora v1.12 (MLX) es un modelo de lenguaje de 8.000 millones de parámetros desarrollado por Sovasoft (ai.in.rs) como ajuste fino de Qwen/Qwen3-8B, optimizado para ejecutarse de forma nativa en los chips Apple Silicon (M1/M2/M3/M4) mediante el framework MLX de Apple. Su propósito principal es cubrir el espacio lingüístico balcánico y de Europa sudoriental, ofreciendo soporte para doce idiomas: serbio, croata, bosnio, macedonio, esloveno, albanés, búlgaro, griego, turco, rumano y húngaro, además del inglés.

El modelo se distribuye bajo licencia Apache-2.0 y se presenta como una opción "abierta y honesta" para la región, con un enfoque conversacional y de generación de texto. La versión MLX aprovecha las ventajas del framework de Apple: inferencia más rápida que PyTorch/Transformers en hardware Apple Silicon y menor consumo de memoria gracias a la optimización nativa. El repositorio incluye soporte para cuantización opcional (por ejemplo, a 4 bits) para reducir aún más los requisitos de memoria, y ofrece tanto uso mediante Python (`mlx-lm`) como servidor de inferencia local.

La versión MLX se publica como complemento de la versión principal del modelo (sovasoft/zora-v1.12), que además está disponible en formatos Transformers y GGUF. En el benchmark propietario BalkanBench, la versión 1.12 en precisión de 16 bits alcanza 85 sobre 156 puntos, aunque no se han publicado comparaciones con otros modelos en ese mismo test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B base) |
| Parámetros totales | 8.190.735.360 (~8,2 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | No disponible (heredado de Qwen3-8B) |
| Tipos de cuantización | No disponible en el repo; se sugiere conversión a 4 bits (q4) con `mlx_lm.convert` |
| Idiomas soportados | en, sr, hr, bs, mk, sl, sq, bg, el, tr, ro, hu (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

Zora v1.12 se construye sobre la arquitectura de Qwen3-8B de Alibaba, un modelo transformer de 8 mil millones de parámetros con atención de ventana larga (contexto de hasta 128 mil tokens en su versión base) y soporte para decodificación especulativa en la versión original. El ajuste fino realizado por Sovasoft adapta el modelo a los idiomas balcánicos y de Europa sudoriental, incorporando un enfoque etiquetado como "honest-ai" que busca respuestas más directas y menos evasivas.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset de ajuste, ni si se emplearon técnicas de RLHF o DPO. El modelo se distribuye en formato MLX, lo que implica una conversión del peso original de Qwen3-8B al formato optimizado para Apple Silicon; esta conversión no modifica la arquitectura ni los pesos, sino la representación interna para ejecución eficiente en Metal/GPU de Apple.

## Capacidades

- Generación de texto conversacional en doce idiomas balcánicos y de Europa sudoriental, con foco en serbio, croata, bosnio, macedon, esloveno, albanés, búlgaro, griego, turco, rumano y húngaro, además del inglés.
- Soporte de chat multi-turno mediante plantilla de chat de Qwen3, con formato de mensajes `[{"role": "user", "content": "..."}]`.
- Capacidad de generación de respuestas en el idioma de la consulta, orientado a aplicaciones de atención al cliente y asistentes locales.
- Inferencia nativa en Apple Silicon (M1/M2/M3/M4) mediante MLX, con menor latencia y uso de memoria que la ejecución en PyTorch/Transformers.
- Soporte de servidor de inferencia local (`mlx_lm.server`) con interfaz compatible con HTTP para integración en aplicaciones.
- No se menciona soporte de tool calling, function calling, ni capacidades de visión o audio en la información disponible.
- No se menciona soporte de modos de razonamiento avanzado (thinking mode) en la versión MLX.

## Casos de uso

- Atención al cliente multilingüe en los Balcanes: el modelo puede gestionar conversaciones en serbio, croata, bosnio, macedon o albanés, con contexto de chat multi-turno, adecuado para empresas regionales con clientes de varios países.
- Asistentes de gobierno y administración pública local: dado el enfoque "honesto" y el soporte de idiomas minoritarios, puede integrarse en servicios de información ciudadana en municipios de la región.
- Traducción y transcripción de documentos administrativos: el modelo puede redactar y parafrasear textos legales o comerciales en los 12 idiomas soportados, ayudando en la localización de contenido.
- Generación de contenido editorial para medios regionales: redacción de noticias y artículos en serbio, croata, búlgaro, griego, turco, rumano o húngaro, con estilo local.
- Chatbots de soporte técnico en empresas de software de la región: integración mediante `mlx_lm.server` en un backend HTTP para responder consultas de usuarios en su idioma nativo.
- Prototipado de aplicaciones de IA en Apple Silicon: uso de la versión MLX para desarrollo local en Macs, con cuantización a 4 bits para pruebas en equipos con 8 GB de RAM, antes de desplegar en producción con la versión Transformers o GGUF.

## Benchmarks y rendimiento

El autor publica un resultado de benchmark propio llamado BalkanBench, que evalúa el conocimiento cultural y lingüístico de la región:

| Benchmark | Resultado (v1.12, 16-bit) |
|---|---|
| BalkanBench | 85 / 156 |

No se proporcionan datos comparativos con otros modelos en el repositorio. Tampoco se publican resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Inferencia en Apple Silicon (M1/M2/M3/M4), aprovechando la GPU unificada mediante el framework MLX.
- Memoria: el modelo en precisión de 16 bits ocupa aproximadamente 16 GB de memoria (según el tamaño del repositorio), por lo que se recomienda un Mac con al menos 32 GB de RAM unificada para ejecución cómoda.
- Con cuantización a 4 bits (q4), la memoria requerida se reduce a aproximadamente 4-6 GB, lo que permite ejecución en Macs con 8-16 GB de RAM.
- GPU recomendadas: no aplica a GPU NVIDIA; el modelo está optimizado para Apple Silicon. Para uso en GPU NVIDIA, se debe usar la versión Transformers o GGUF del mismo modelo.
- Opciones de despliegue: `mlx_lm` para generación en Python, `mlx_lm.generate` para línea de comandos, `mlx_lm.server` para servidor HTTP local.
- Latencia y throughput: no disponibles en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | BalkanBench |
|---|---|---|---|---|---|---|
| Zora v1.12 (MLX) | 8,2 B | No disponible | 12 (balcánicos) | Apache-2.0 | MLX, safetensors | 85/156 |
| Qwen3-8B (base) | 8,2 B | 128K (heredado) | Multilingüe general | Apache-2.0 | Transformers, GGUF | No publicado |
| Zora v1.11 | 8,2 B | No disponible | 12 (balcánicos) | Apache-2.0 | Transformers, GGUF | No disponible |

No se dispone de información sobre modelos competidores específicos en idiomas balcánicos (como modelos de la familia Bloom, Llama o Mistral adaptados a la región) para una comparación completa.

## Limitaciones y advertencias

- El modelo hereda las limitaciones de Qwen3-8B, incluyendo posibles sesgos y alucinaciones típicas de los modelos de generación de texto.
- La evaluación BalkanBench se limita a 156 puntos y no se proporciona desglose por idioma ni comparación con otros modelos, por lo que la calidad real en cada idioma no está verificada externamente.
- No se documenta soporte de tool calling, function calling, ni capacidades de agente, lo que limita su uso en pipelines de automatización compleja.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base Qwen3-8B para confirmar compatibilidad.
- La versión MLX solo funciona en hardware Apple Silicon; no es compatible con GPU NVIDIA/AMD ni con despliegue en servidores Linux estándar sin adaptación.
- No se publican datos de entrenamiento ni de alineación (RLHF/DPO), por lo que la calidad de las respuestas en contextos de alto riesgo (médico, legal, financiero) no está garantizada.
- El tamaño del repositorio (16,4 GB) indica que la versión por defecto no está cuantizada; los usuarios deben ejecutar la conversión a q4 para despliegue en equipos de menor memoria.

## Enlaces

- Repositorio MLX: https://huggingface.co/sovasoft/zora-v1.12-mlx
- Modelo principal (Transformers, GGUF): https://huggingface.co/sovasoft/zora-v1.12
- Versión anterior: https://huggingface.co/sovasoft/zora-v1.11
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
