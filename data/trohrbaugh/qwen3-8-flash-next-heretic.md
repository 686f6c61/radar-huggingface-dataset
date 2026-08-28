# trohrbaugh/Qwen3.8-Flash-Next-heretic

## Resumen

Qwen3.8-Flash-Next-heretic es una versión modificada del modelo Qwen3.8-Flash-Next de Alibaba Qwen, creada por el usuario trohrbaugh mediante la técnica de "abliteración" (también conocida como "uncensoring" o "decensoring") usando la herramienta Heretic. El objetivo es eliminar los rechazos y restricciones de seguridad del modelo original, manteniendo sus capacidades generales. El modelo base es un LLM multimodal de arquitectura híbrida con 125 mil millones de parámetros principales (más 51B de embeddings n-gram y 4B de MTP), de los cuales se activan aproximadamente 6B por token gracias a un diseño de Mezcla de Expertos ultra dispersa. Presenta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y está orientado a tareas de razonamiento, código, visión y conversación. La versión heretic reduce los rechazos de 99/100 a 0/100 en una prueba de 100 prompts, con una divergencia KL de 0,116 respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE ultra dispersa + N-gram Embedding + Gated Residual + MTP |
| Parametros totales | 177.392.830.576 (según safetensors; 125B principales + 51B n-gram embeddings + 4B MTP) |
| Parametros activos | 6B por token (10 expertos rutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors sin cuantizar) |
| Idiomas soportados | No disponible (la model card no especifica) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next (y por tanto de la versión heretic) introduce varias innovaciones sobre el diseño de Qwen3.7. El núcleo es una combinación de dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet, un mecanismo de atención lineal que comprime el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA), que selecciona bloques de micro-tokens (512 bloques o 2048 tokens) para recuperación precisa de largo alcance. El modelo utiliza una estructura MoE con 512 expertos, activando 10 rutados más 1 compartido, con dimensión intermedia de 640. Además, incorpora N-gram Embedding: una tabla de 20 millones de bigramas/trigramas en la capa 2, que añade 51B parámetros sin aumentar el coste computacional por token. El entrenamiento usa una receta adaptada con optimizadores Muon y AdamW aplicados a categorías específicas de pesos, y elimina el calentamiento de batch size, partiendo directamente del tamaño objetivo. La versión heretic se obtuvo mediante abliteración con Heretic v1.3.0+custom, un proceso que identifica y elimina direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, modificando los pesos de las proyecciones de salida (o_proj y down_proj) de atención y MLP.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de agentes y multi-step reasoning.
- Soporte de visión: el modelo es multimodal (image-text-to-text) y puede procesar imágenes junto con texto.
- Generación de código y tareas de programación, con mejoras reportadas frente a Qwen3.7-Plus en tareas de coding y ofimática.
- Capacidades de conversación y chat, con manejo de contexto largo gracias a la ventana de 262K tokens.
- No se especifica soporte explícito de tool calling o function calling en la información disponible, aunque por su naturaleza de modelo de agentes es probable que lo tenga; no confirmado.
- Capacidades multilingües no detalladas; la model card no lista idiomas.
- La versión heretic elimina los rechazos, permitiendo respuestas a prompts que el modelo original bloquearía (con la advertencia de que esto puede incluir contenido inapropiado).

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar, revisar y depurar código en múltiples lenguajes, aprovechando su ventana de contexto para manejar proyectos completos o repositorios extensos.
- Análisis de documentos largos: con 262K tokens de contexto nativo, puede resumir, extraer información y responder preguntas sobre libros técnicos, informes financieros o contratos legales de gran tamaño.
- Agente autónomo de investigación: su capacidad de razonamiento multi-step y procesamiento de imágenes permite analizar gráficos, tablas y figuras en artículos científicos, combinando información visual y textual.
- Generación de contenido creativo sin restricciones: la versión heretic está diseñada para responder a prompts que el modelo original rechazaría, lo que puede ser útil para proyectos de escritura creativa o exploración de temas controvertidos, siempre con responsabilidad.
- Automatización de tareas ofimáticas: según el blog de Qwen, el modelo destaca en tareas de oficina, como redacción de correos, generación de presentaciones o análisis de datos en hojas de cálculo.
- Despliegue en entornos de investigación de seguridad: los investigadores pueden estudiar el comportamiento de modelos "decensored" para entender los mecanismos de alineación y desarrollar mejores técnicas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la versión heretic solo incluye métricas de abliteración:

| Metrica | Este modelo | Modelo original |
| :------ | :----------: | :---------------: |
| Divergencia KL | 0.1160 | 0 (por definicion) |
| Rechazos (sobre 100 prompts) | 0/100 | 99/100 |

El modelo original Qwen3.8-Flash-Next reporta mejoras en tareas de coding y ofimática frente a Qwen3.7-Plus, con un coste de entrenamiento aproximadamente 1/9, pero no se incluyen cifras concretas en los materiales disponibles. Según unsloth.ai, el modelo supera a Claude-4.6-Opus (Max) en tareas de agente, visión y chat, aunque esta afirmación no está verificada de forma independiente en la información proporcionada.

## Requisitos de hardware

- El tamaño total del repo es de 360 GB en safetensors, lo que indica que los pesos completos en precisión FP16/FP32 requieren aproximadamente 360 GB de memoria.
- Para inferencia con los 6B parámetros activos, se necesitan al menos varias GPUs de alta gama. Con cuantización (por ejemplo, 4-bit), el modelo podría caber en 2-4 GPUs de 80 GB (como A100 o H100), pero no se proporcionan datos exactos.
- No se indica soporte para GPU de consumo (RTX 4090, etc.) en la información disponible; el tamaño del modelo hace improbable su ejecución en una sola GPU de consumo.
- Opciones de despliegue: el modelo es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed según la model card original. También se menciona compatibilidad con vLLM en recipes.vllm.ai.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
| :----- | :--------- | :------- | :------- | :---- |
| Qwen3.8-Flash-Next (original) | 125B activos 6B | 262K | qwen-community-1.0 | Modelo base, con rechazos de seguridad |
| Qwen3.8-Flash-Next-heretic (este) | 177B totales, 6B activos | 262K | qwen-community-1.0 | Versión abliterada, sin rechazos |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Modelo anterior, coste de entrenamiento 9 veces mayor según Qwen |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada. La comparativa se limita a las menciones del blog de Qwen y unsloth.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal, sexualmente explícito o violento sin filtros. Esto supone un riesgo significativo si se utiliza en producción sin supervisión humana.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen; es necesario revisar sus términos exactos para uso comercial, aunque generalmente permite uso comercial con atribución.
- No se han publicado benchmarks de rendimiento del modelo heretic; la abliteración puede degradar ligeramente la calidad en algunas tareas (la divergencia KL de 0,116 indica cambios en las distribuciones de salida).
- El modelo es experimental (preview de Qwen4) y puede tener comportamientos impredecibles en tareas complejas.
- No se especifican los idiomas soportados; la model card no proporciona esa información.
- El tamaño del modelo (360 GB) hace que su despliegue sea costoso y requiera infraestructura especializada.
- No hay información sobre sesgos específicos, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- El riesgo de alucinación es inherente a los LLM y no se ha evaluado específicamente en esta versión.

## Enlaces

- Repositorio HuggingFace del modelo heretic: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Repositorio GitHub del modelo original: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Informe técnico (PDF): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Fork de Heretic usado: https://github.com/timrohrbaugh/heretic
- Guía de unsloth para ejecutar el modelo: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para el modelo: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
