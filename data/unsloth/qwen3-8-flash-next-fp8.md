# unsloth/Qwen3.8-Flash-Next-FP8

## Resumen

Qwen3.8-Flash-Next-FP8 es una cuantización de grano fino en FP8 (bloque de 128) del modelo experimental Qwen3.8-Flash-Next, desarrollado por Alibaba Qwen como avance de la arquitectura que sustentará Qwen4. Esta versión cuantizada, publicada por Unsloth, mantiene un rendimiento casi idéntico al original y es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. El modelo combina un codificador de visión con un modelo de lenguaje causal de 180.000 millones de parámetros totales, de los cuales solo 6.000 millones se activan por token gracias a una arquitectura híbrida con mezcla de expertos (MoE) y atención lineal recurrente.

La relevancia de este lanzamiento radica en su diseño orientado a eficiencia: incorpora Gated DeltaNet, Qwen Sparse Attention (QSA), Gated Residual y N-gram Embedding, lo que permite manejar contextos nativos de 262.144 tokens (extensibles a 1.000.000) con una latencia reducida en tareas agénticas. Según la documentación oficial, supera a Claude-4.6-Opus (Max) en coding agéntico, visión y chat, aunque no se han publicado los valores numéricos de los benchmarks en la información disponible. La licencia es qwen-community-1.0, con restricciones para uso comercial que deben revisarse antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Attention: Gated DeltaNet + Qwen Sparse Attention (QSA), MoE (512 expertos, 10 activados + 1 compartido), Gated Residual, N-gram Embedding, MTP (1 capa) |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6.000.000.000 (6B) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | FP8 (bloque de 128, grano fino) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce una arquitectura híbrida que combina atención lineal recurrente (Gated DeltaNet) con atención sparse (QSA). La disposición de capas es 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)), con 48 capas en total. Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimensión 128, mientras que QSA emplea 24 cabezas para Q y 2 para KV con dimensión 256, más un indexador MQA con 4 cabezas de consulta y 1 clave compartida. El presupuesto de atención sparse es de 512 bloques o 2048 tokens. La capa MoE contiene 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. El Gated Residual modula el flujo de información mediante 4 ramas con bottleneck de rango 320. Además, se incorpora un embedding por n-gramas (20 millones de bigramas/trigramas en la capa 2) que permite escalar parámetros sin aumentar el coste computacional.

El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, guiado por leyes de escalado reajustadas. Se elimina el calentamiento de tamaño de lote, comenzando directamente con el tamaño objetivo, lo que reduce los pasos de optimización y permite tasas de aprendizaje mayores. El modelo incluye una capa MTP (Multi-Token Prediction) entrenada con multi-steps para mejorar la predicción de tokens futuros. La cuantización FP8 de Unsloth utiliza bloques de 128 elementos, manteniendo métricas casi idénticas al modelo original.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de chat y agénticas, con soporte de multi-step reasoning.
- Comprensión de imágenes (image-text-to-text) gracias al codificador de visión integrado, permitiendo entrada multimodal.
- Generación y edición de código, con rendimiento destacado en coding agéntico según la documentación oficial.
- Manejo de contextos muy largos (hasta 1M tokens) con atención sparse, adecuado para análisis de documentos extensos y conversaciones multi-turno.
- Soporte de tool calling y function calling, habilitando integración con APIs y agentes autónomos.
- Capacidades multilingües, aunque no se especifican los idiomas exactos en la información disponible.
- Modo de predicción multi-token (MTP) que acelera la decodificación y mejora la coherencia en generaciones largas.

## Casos de uso

- Agentes autónomos de codificación: el modelo puede planificar y ejecutar tareas de programación multi-paso, integrando tool calling para interactuar con repositorios, ejecutar tests y corregir errores. Su arquitectura con atención sparse reduce la latencia en contextos largos, esencial para mantener el estado de la sesión.
- Análisis de documentos extensos con imágenes: gracias a su ventana de 262K tokens nativos y entrada multimodal, puede procesar informes anuales, contratos o papers científicos que combinan texto y figuras, extrayendo información relevante en una sola pasada.
- Asistente de atención al cliente con contexto largo: gestiona conversaciones multi-turno con historial completo, manteniendo coherencia durante horas de interacción. La cuantización FP8 permite desplegarlo en infraestructura existente con menor coste de memoria.
- Generación de código en producción: soporta function calling y puede integrarse en pipelines de CI/CD para generar tests, documentación o parches. Su rendimiento en coding agéntico lo hace adecuado para herramientas de autocompletado avanzado.
- Razonamiento sobre datos multimodales: combina imágenes y texto para tareas como diagnóstico a partir de capturas médicas, análisis de diagramas técnicos o revisión de UI/UX, con capacidad de explicar el razonamiento paso a paso.
- Investigación en eficiencia de modelos: al ser una arquitectura experimental, sirve como banco de pruebas para estudiar atención híbrida, MoE y embeddings por n-gramas, permitiendo a investigadores comparar métricas de latencia y calidad frente a modelos transformer puros.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla de benchmarks con resultados en lenguaje, visión y coding, pero el contenido no se ha extraído en la información proporcionada. No se dispone de los valores numéricos para presentarlos en esta ficha. La documentación web de Unsloth afirma que el modelo supera a Claude-4.6-Opus (Max) en agentic coding, visión y chat, pero no se aportan cifras concretas. Por tanto, se indica que no se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio FP8 ocupa 185.6 GB, por lo que se requiere al menos 180 GB de VRAM para cargar los pesos en memoria. Esto implica GPUs de centro de datos: 2× H200 (141 GB cada una) o 4× A100 80GB, o 3× A100 80GB con offloading.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en FP8. Para ejecución local en consumer hardware, se recomienda usar las versiones GGUF cuantizadas (por ejemplo, IQ1_XXXS) publicadas por Unsloth, que requieren al menos 450 GB de RAM según la documentación.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed son compatibles con los pesos FP8. Para GGUF, se puede usar llama.cpp o Unsloth Desktop.
- La latencia y el throughput no se han publicado en la información disponible. La arquitectura con atención sparse y MoE activa solo 6B parámetros por token, lo que sugiere una inferencia más rápida que un modelo denso de 180B, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de la misma categoría (tamaño y arquitectura híbrida). El modelo es experimental y no tiene equivalentes públicos conocidos en el momento de redactar esta ficha. Se puede mencionar que la versión oficial Qwen3.8-Flash (basada en el mismo modelo base) ofrece 1M de contexto por defecto y herramientas integradas, pero no se han proporcionado sus especificaciones técnicas para una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: es una licencia de código abierto con restricciones. Debe revisarse el texto completo para verificar si permite uso comercial y en qué condiciones. No se ha incluido el contenido de la licencia en la información disponible.
- Modelo experimental: Qwen3.8-Flash-Next es una vista previa de la arquitectura de Qwen4, por lo que puede contener comportamientos inesperados o cambios en futuras versiones. No se recomienda para producción crítica sin pruebas exhaustivas.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inconsistente, especialmente en tareas de razonamiento complejo o con contextos muy largos. Se recomienda validación humana en aplicaciones de alto riesgo.
- Sesgos: no se han publicado evaluaciones de sesgos para este modelo. Al estar entrenado con datos no especificados, puede reflejar sesgos presentes en el corpus de entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés o chino no está garantizado.
- Requisitos de memoria: la versión FP8 requiere infraestructura de gama alta. Las cuantizaciones más agresivas (GGUF) pueden degradar la calidad del modelo, especialmente en tareas de razonamiento.
- Compatibilidad: aunque es compatible con varios frameworks, la cuantización FP8 con bloque de 128 puede no estar soportada en todas las versiones de las librerías. Se recomienda verificar la documentación de cada herramienta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Guía de ejecución local de Unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Versión GGUF: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
