# tanhsing/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de código abierto desarrollado por el equipo Qwen de Alibaba, publicado el 26 de agosto de 2026 como una vista previa experimental de la arquitectura que sustentará a Qwen4. El modelo combina un codificador de visión con un núcleo de lenguaje causal de 125 mil millones de parámetros activos (6 mil millones activados por token), más 51 mil millones de parámetros de embedding por n-gramas y 4 mil millones de módulo de predicción multi-token (MTP), lo que suma aproximadamente 180 mil millones de parámetros totales. Su ventana de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000.

La relevancia de este lanzamiento radica en su propuesta arquitectónica: sustituye la atención densa tradicional por una combinación de Gated DeltaNet (atención lineal) y Qwen Sparse Attention (QSA) a nivel de micro-bloques, junto con un mecanismo de residuales con puertas (Gated Residual) y un sistema de embeddings basado en n-gramas. Estas innovaciones buscan reducir la latencia en contextos largos, mejorar la eficiencia computacional y permitir un escalado de parámetros más económico que los Mixture-of-Experts convencionales. El modelo está disponible en formato Transformers y es compatible con vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Qwen Sparse Attention (QSA) + MoE + Gated Residual + N-gram Embedding |
| Parametros totales | 179 999 981 459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B (más 51B de embedding y 4B de MTP, activos por token) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (se esperan versiones GGUF/AWQ de la comunidad) |
| Idiomas soportados | No disponible (modelo multilingüe, sin lista oficial publicada) |
| Licencia | qwen-community-1.0 (otra) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo presenta una arquitectura híbrida que abandona la atención densa completa. La capa de atención se compone de 48 capas organizadas en 12 bloques, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de Qwen Sparse Attention. Gated DeltaNet es una atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128. QSA opera a nivel de micro-bloques (512 bloques o 2048 tokens) en lugar de seleccionar tokens individuales, con 24 cabezas Q y 2 cabezas KV, dimensión de cabeza 256 y un indexador MQA con 4 cabezas de consulta y 1 cabeza clave compartida. El componente MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. El mecanismo Gated Residual modula el flujo de información a través de residuales ensanchados con una puerta de lectura dependiente de los datos y una puerta de escritura escalar por rama, con 4 ramas y rango de cuello de botella 320. Los embeddings se indexan mediante bigramas y trigramas (20 millones de entradas en la capa 2), lo que permite escalar parámetros con menor coste computacional y mayor facilidad de descarga que un MoE tradicional.

El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, con leyes de escalado reajustadas que eliminan el calentamiento del tamaño de lote y comienzan directamente con el tamaño objetivo, reduciendo pasos de optimización y permitiendo tasas de aprendizaje mayores. El modelo pasó por etapas de pre-entrenamiento y post-entrenamiento, e incluye un módulo MTP (multi-token prediction) de 1 capa entrenado con múltiples pasos. No se han publicado detalles sobre la composición exacta del dataset ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo con ventana de contexto de 262 144 tokens nativos, ampliable a 1 000 000.
- Comprensión de imágenes gracias al codificador de visión integrado (pipeline image-text-to-text).
- Soporte de tool calling y function calling, con herramientas integradas en la versión oficial Qwen3.8-Flash.
- Capacidades de agente y razonamiento multi-paso, optimizadas para cargas de trabajo agénticas con contexto largo.
- Multilingüismo (idiomas concretos no especificados en la documentación disponible).
- Predicción multi-token (MTP) que mejora la velocidad de decodificación y la coherencia.
- Compatibilidad con múltiples motores de inferencia: Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Agentes autónomos con contexto largo: el modelo puede mantener conversaciones y ejecutar tareas multi-paso con historiales extensos gracias a su ventana de 262K tokens y la baja latencia de QSA en contextos largos, ideal para agentes que navegan por documentación extensa o gestionan proyectos complejos.
- Análisis de documentos extensos: procesar manuales técnicos, contratos o informes de cientos de páginas sin truncamiento, extrayendo información relevante y respondiendo preguntas sobre el contenido completo.
- Asistente de programación con contexto de repositorio completo: al soportar tool calling y una ventana de 1M tokens, puede analizar un repositorio entero, sugerir refactorizaciones y generar código coherente con el estilo del proyecto.
- Sistemas de atención al cliente multimodal: combinar capturas de pantalla o imágenes de productos con conversaciones de soporte, manteniendo el historial completo de la interacción para resolver incidencias complejas.
- Investigación académica y revisión de literatura: resumir y comparar múltiples artículos científicos, extrayendo metodologías y resultados con razonamiento multi-paso.
- Despliegue en entornos con memoria limitada: gracias a los embeddings por n-gramas que pueden descargarse a CPU, el modelo puede ejecutarse en aceleradores con VRAM reducida manteniendo la calidad, útil para inferencia en clústeres heterogéneos.
- Generación de informes empresariales: combinar datos tabulares, gráficos y texto para producir análisis ejecutivos con contexto de toda la documentación corporativa.

## Benchmarks y rendimiento

La model card oficial incluye una sección de benchmarks, pero el contenido completo no está disponible en la información proporcionada. No se pueden presentar cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas. Se recomienda consultar la documentación oficial y el análisis independiente de Artificial Analysis para obtener métricas de calidad, velocidad y precio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 180B parámetros totales, en FP16 se necesitarían aproximadamente 360 GB de VRAM. Con cuantización a 8 bits, unos 180 GB; a 4 bits, unos 90 GB. Sin embargo, al tener solo 6B parámetros activos por token, la memoria requerida para los pesos activos es mucho menor, aunque los embeddings y MTP deben cargarse o descargarse dinámicamente.
- GPU recomendadas: clústeres con múltiples A100 80GB, H100 80GB o H200. Para pruebas locales, un nodo con 2-4 GPUs de 80GB es viable con cuantización.
- En consumer GPU: no es práctico en una sola GPU de consumo (RTX 4090 con 24GB no es suficiente para los pesos completos, aunque con cuantización extrema y descarga de embeddings a CPU podría ejecutarse con latencia alta).
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Transformers. La versión oficial Qwen3.8-Flash está disponible como API gestionada en Qwen Cloud.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura QSA y la predicción multi-token deberían reducir la latencia en contextos largos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B | 6B | 262K (1M ext.) | qwen-community-1.0 | Open weight |
| Qwen3-27B | 27B | 27B | 262K | Apache 2.0 | Open weight |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | Open weight |

Qwen3.8-Flash-Next se posiciona como un modelo MoE de alta eficiencia con un número de parámetros activos muy reducido (6B) en comparación con DeepSeek-V3 (37B activos), lo que sugiere un coste de inferencia menor. Su contexto nativo de 262K supera a DeepSeek-V3 (128K) y es comparable al de Qwen3-27B. La licencia qwen-community-1.0 permite uso comercial con restricciones (atribución y cumplimiento de términos específicos), mientras que Qwen3-27B usa Apache 2.0 y DeepSeek-V3 usa MIT. No se dispone de datos de rendimiento comparativo en benchmarks para esta ficha.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura de Qwen4, por lo que puede presentar comportamientos inesperados o cambios en versiones futuras.
- Sesgos y alucinaciones: al ser un modelo de lenguaje grande, puede generar contenido falso o sesgado. No se han publicado evaluaciones específicas de sesgo para esta versión.
- Licencia qwen-community-1.0: permite uso comercial pero con condiciones; es necesario revisar el texto completo de la licencia antes de desplegar en producción.
- Idiomas no especificados: aunque es multilingüe, no se ha publicado la lista oficial de idiomas soportados ni su calidad relativa.
- Requisitos de hardware elevados: a pesar de los 6B activos, los 180B totales requieren infraestructura de múltiples GPUs o cuantización agresiva, lo que puede degradar la calidad.
- Contexto extensible a 1M: la extensión a 1M tokens puede requerir configuraciones específicas de RoPE o técnicas de interpolación no documentadas en la información disponible.
- Sin benchmarks públicos verificables: la model card no muestra resultados completos, lo que dificulta la evaluación objetiva frente a alternativas.

## Enlaces

- Repositorio HuggingFace (copia del usuario tanhsing): https://huggingface.co/tanhsing/Qwen3.8-Flash-Next
- Repositorio HuggingFace oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico (PDF): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Análisis en Artificial Analysis: https://artificialanalysis.ai/models/qwen3-8-flash-next
- Ficha en AI Wiki: https://aiwiki.ai/wiki/qwen3_8_flash_next
- Seguimiento de lanzamientos: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
