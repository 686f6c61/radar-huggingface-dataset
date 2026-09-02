# vkshdev/Qwen3.8-Flash-Next-FP8-180B

## Resumen

Qwen3.8-Flash-Next-FP8-180B es una versión cuantizada en FP8 del modelo Qwen3.8-Flash-Next, publicada por el usuario vkshdev. El modelo original, desarrollado por Qwen, es un modelo multimodal de 180.000 millones de parámetros (125B principales, 51B de n-gram embeddings y 4B de MTP) que sirve como previsualización experimental de la arquitectura Qwen4. Esta versión FP8 reduce los requisitos de memoria y almacenamiento manteniendo un rendimiento casi idéntico al original, según indica la model card. Con una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, está orientado a tareas de razonamiento complejo, agentes y procesamiento de imágenes y texto. La cuantización FP8 con bloque de 128 hace que sea viable su ejecución en hardware con menos memoria que el modelo original en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE, con vision encoder |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | 6B (más 51B de n-gram embedding y 4B de MTP, no activos por token) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | FP8 (block size 128) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce varias innovaciones arquitectónicas. La atención híbrida combina Gated DeltaNet (una capa de atención lineal) con Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. El bloque MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. La capa de Gated Residual modula el flujo de información mediante puertas de lectura y escritura dependientes de los datos. El n-gram embedding indexa bigramas y trigramas (20 millones de entradas) en la capa 2, permitiendo escalar parámetros sin aumentar el coste computacional por token. El entrenamiento utiliza una receta que combina los optimizadores Muon y AdamW según el tipo de peso, y elimina el warmup de batch size, partiendo directamente del tamaño objetivo. El modelo se entrenó en dos etapas: pre-entrenamiento y post-entrenamiento, e incluye un módulo MTP (Multi-Token Prediction) de una capa para predicción multi-token.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de pensamiento encadenado (chain-of-thought).
- Procesamiento multimodal: acepta imágenes como entrada junto con texto (pipeline image-text-to-text).
- Generación de código y resolución de problemas matemáticos.
- Soporte de tool calling y function calling, según las características del modelo base.
- Capacidad para tareas de agente y razonamiento multi-paso gracias a la ventana de contexto larga.
- Multilingüismo: no confirmado en la información disponible, aunque los modelos Qwen suelen ser multilingües.
- Modo de razonamiento extendido (thinking mode) probablemente disponible, aunque no se detalla en la documentación.

## Casos de uso

- Análisis de documentos extensos: con 262K tokens de contexto nativo, puede procesar libros técnicos, informes financieros o expedientes legales completos en una sola pasada, extrayendo información y respondiendo preguntas sobre el contenido.
- Asistentes de atención al cliente multimodal: al aceptar imágenes, puede interpretar capturas de pantalla, facturas o fotografías de productos dentro de una conversación de soporte, manteniendo el historial completo de la interacción.
- Generación de código en producción: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para generar, revisar y documentar código, así como para autocompletar funciones complejas con contexto de repositorio amplio.
- Agentes autónomos de investigación: con el contexto largo y el razonamiento multi-paso, puede planificar y ejecutar búsquedas web, resumir fuentes y redactar informes, encadenando múltiples llamadas a herramientas.
- Procesamiento de imágenes médicas o técnicas: combinando visión y lenguaje, puede describir radiografías, diagramas de ingeniería o mapas, y responder preguntas específicas sobre ellos.
- Traducción y localización de contenido largo: aunque los idiomas no están confirmados, su capacidad multilingüe probable permite traducir manuales o subtítulos completos manteniendo coherencia contextual.
- Prototipado de aplicaciones con modelos de gran tamaño: al ser una versión FP8, es adecuado para entornos de desarrollo donde se necesita un modelo de 180B con menor huella de memoria que la versión BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base incluye una tabla de benchmarks, pero el contenido extraído se corta antes de mostrar los valores. Fuentes externas (unsloth.ai) afirman que Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max), pero no se proporcionan cifras concretas. Se recomienda consultar el informe técnico oficial para obtener datos de rendimiento detallados.

## Requisitos de hardware

- El tamaño del repositorio es de 185,6 GB, correspondiente a los pesos en FP8. Para inferencia se necesita al menos esa cantidad de memoria disponible.
- En FP8, cada parámetro ocupa 1 byte, por lo que los 180B parámetros requieren aproximadamente 180 GB de VRAM o RAM.
- Para GPU, se necesitan múltiples unidades: por ejemplo, 3× A100 80GB, 3× H100 80GB, o 2× H200 141GB. No cabe en una GPU de consumo (RTX 4090 tiene 24GB).
- Según unsloth.ai, el modelo puede ejecutarse localmente con 75 GB de RAM/unified memory sin GPU VRAM, probablemente usando cuantización adicional o descarga de pesos a CPU.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- La latencia y el throughput dependen del hardware y la configuración; no se proporcionan datos específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 180B | 6B | 262K | qwen-community-1.0 | BF16 |
| Qwen3.8-Flash-Next-FP8-180B (este) | 180B | 6B | 262K | qwen-community-1.0 | FP8 |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | MIT | BF16/FP8 |

La comparación directa con otros modelos de la misma categoría no está disponible en la información proporcionada. El modelo FP8 es funcionalmente equivalente al original, con una reducción de memoria de aproximadamente el 50% respecto a BF16 (que ocuparía ~360 GB). DeepSeek-V3 es un MoE de mayor tamaño, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Modelo experimental: la arquitectura Qwen4 está en fase de previsualización y puede presentar comportamientos inesperados en producción.
- Licencia qwen-community-1.0: es necesario revisar los términos completos para uso comercial, especialmente las restricciones de redistribución y atribución.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Sesgos potenciales: no se han publicado evaluaciones de sesgo para este modelo; los datos de entrenamiento pueden reflejar sesgos presentes en la web.
- Limitaciones de idioma: no se ha confirmado la lista de idiomas soportados; el rendimiento en lenguas minoritarias puede ser inferior.
- Requisitos de hardware elevados: a pesar de la cuantización FP8, se necesita una infraestructura considerable para ejecutar el modelo completo.
- La cuantización FP8 puede introducir ligeras pérdidas de precisión en tareas numéricas sensibles, aunque la model card afirma que el rendimiento es casi idéntico al original.

## Enlaces

- Modelo cuantizado: https://huggingface.co/vkshdev/Qwen3.8-Flash-Next-FP8-180B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
