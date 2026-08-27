# unsloth/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de tipo MoE (Mixture of Experts) desarrollado por Qwen, que se presenta como una vista previa experimental de la arquitectura que sustentará a Qwen4. El modelo combina atención híbrida con Gated DeltaNet y Qwen Sparse Attention (QSA), junto con un mecanismo de n-gram embedding y Gated Residual, con el objetivo de mejorar la eficiencia computacional, la capacidad de modelo y la estabilidad del entrenamiento. Está diseñado para manejar contextos largos de hasta 262.144 tokens de forma nativa, extensibles a 1.000.000, y es especialmente relevante para cargas de trabajo agénticas y razonamiento multimodal.

El modelo cuenta con 125.000 millones de parámetros en el modelo de lenguaje, de los cuales solo 6.000 millones se activan por token, más 51.000 millones de parámetros de n-gram embedding y 4.000 millones de MTP (Multi-Token Prediction), sumando un total de 180.000 millones de parámetros según los pesos safetensors. Esta arquitectura permite un escalado eficiente de parámetros sin un aumento proporcional del coste computacional, lo que lo hace adecuado para entornos con memoria limitada. La versión publicada en HuggingFace por Unsloth incluye pesos en formato safetensors y también está disponible en GGUF para su ejecución con llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet + Qwen Sparse Attention + MoE + n-gram embedding + Gated Residual |
| Parametros totales | 179.999.981.459 (según safetensors); desglose: 125B LM + 51B n-gram embedding + 4B MTP |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 nativo, extensible a 1.000.000 tokens |
| Tipos de cuantizacion | No disponible (existe versión GGUF, pero sin especificar tipos) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next introduce una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención sparse (Qwen Sparse Attention, QSA). El layout oculto se organiza en 12 bloques, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de MoE, y 1 sub-bloque de QSA seguido de MoE. QSA opera a nivel de micro-bloques en lugar de tokens individuales, con un presupuesto de 512 bloques o 2048 tokens, lo que reduce significativamente la latencia en contextos largos. El Gated Residual modula el flujo de información a través de streams residuales ensanchados mediante un gate de lectura dependiente de datos y un gate de escritura escalar por rama, con 4 ramas y un rango de cuello de botella de 320.

El MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con una dimensión intermedia de 640. El n-gram embedding indexa bigramas y trigramas en la capa 2, con un vocabulario de 20.000.000 de entradas, lo que permite escalar parámetros de forma más eficiente que un MoE tradicional y facilita el offloading en aceleradores con memoria limitada. El entrenamiento utiliza los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, y elimina el warmup de batch size, comenzando directamente con el tamaño objetivo, lo que reduce los pasos de optimización y permite tasas de aprendizaje más altas. El modelo incluye una capa MTP (Multi-Token Prediction) entrenada con multi-steps.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen-texto), con pipeline `image-text-to-text`.
- Razonamiento agéntico y multi-step, optimizado para cargas de trabajo de agentes con contexto largo.
- Soporte de tool calling y function calling, aunque no se detalla explícitamente en la documentación, su diseño orientado a agentes lo hace compatible.
- Capacidades multilingües no especificadas, pero los modelos Qwen suelen ser multilingües.
- Contexto nativo de 262.144 tokens, extensible a 1.000.000, ideal para documentos extensos y conversaciones largas.
- Codificación y generación de código, con rendimiento destacado en tareas de agentic coding según Unsloth.

## Casos de uso

- Agentes autónomos con contexto largo: el modelo puede gestionar conversaciones multi-turno y tareas complejas que requieren mantener un historial extenso, gracias a su ventana de 262K tokens nativos y la atención sparse que reduce la latencia.
- Razonamiento multimodal en producción: al aceptar entradas de imagen y texto, puede analizar capturas de pantalla, diagramas o documentos escaneados combinados con instrucciones textuales, útil en sistemas de soporte técnico o análisis de informes.
- Generación de código en pipelines de CI/CD: con soporte de tool calling y razonamiento agéntico, puede integrarse en flujos de revisión de código, generación de tests o autocompletado en entornos de desarrollo.
- Análisis de documentos largos: su contexto de hasta 1M tokens permite procesar libros completos, expedientes legales o logs de sistemas sin necesidad de chunking, manteniendo coherencia global.
- Asistencia conversacional avanzada: puede mantener conversaciones prolongadas con memoria de todo el historial, adecuado para atención al cliente o asistentes personales.
- Investigación en arquitecturas eficientes: al ser una vista previa de Qwen4, es útil para estudiar el rendimiento de n-gram embeddings, Gated Residual y atención híbrida en comparación con MoE tradicionales.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Qwen3.8-27B, Qwen3.7-Plus y DeepSeek-V4-Flash-0731, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). Según Unsloth, el modelo supera a Claude-4.6-Opus (Max) en agentic coding, visión y chat, pero no se aportan cifras concretas. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Al ser un MoE con 6B parámetros activos, la inferencia puede ser eficiente, pero el modelo completo de 180B requiere cuantización agresiva o múltiples GPUs. Unsloth está trabajando en soporte; para modelos similares de Qwen3.8 se han utilizado cuantizaciones IQ1_XXXS con ~397GB de RAM.
- GPU recomendadas: no especificadas. Para ejecución local con GGUF, se necesitan GPUs con al menos 24GB de VRAM para cuantizaciones bajas, o CPUs con gran cantidad de RAM para offloading.
- Si cabe en consumer GPU: no, el modelo completo no cabe en GPUs de consumo; con cuantización extrema podría ejecutarse en GPUs de 24GB, pero con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Unsloth Desktop, vLLM (cuando esté soportado), HuggingFace Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B | 6B | 262K (1M ext.) | qwen-community-1.0 | Open weights |
| Qwen3.8-27B | 27B (estimado) | No MoE | No disponible | No disponible | Open weights |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | API propietaria |
| DeepSeek-V4-Flash-0731 | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se basa en los modelos listados en la tabla de benchmarks de la model card, pero no se dispone de datos completos de parámetros, contexto o rendimiento para estos modelos alternativos.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura de Qwen4, por lo que puede contener comportamientos inesperados o no estar completamente optimizado para producción.
- Licencia qwen-community-1.0: debe revisarse el texto completo de la licencia para verificar restricciones de uso comercial, modificación y redistribución.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos; como todo LLM, puede generar contenido incorrecto o inventado, especialmente en contextos largos.
- Idiomas no especificados: no se garantiza un rendimiento uniforme en todos los idiomas; el entrenamiento probablemente se centró en inglés y chino, como es habitual en modelos Qwen.
- Requisitos de hardware elevados: a pesar de los 6B activos, el modelo completo requiere una infraestructura considerable para su despliegue, lo que limita su uso en entornos con recursos limitados.
- Soporte de herramientas en desarrollo: Unsloth indica que aún están trabajando en el soporte completo del modelo, por lo que algunas integraciones (vLLM, TGI) pueden no estar disponibles.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/unsloth/Qwen3.8-Flash-Next
- HuggingFace (GGUF): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- GitHub del proyecto: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- Documentación de Unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Artículo de Simon Willison: https://simonwillison.net/2026/Aug/26/qwen38-flash-next/
