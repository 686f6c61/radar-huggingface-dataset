# vcruz305/GLM-5.3-Flash-EXL3

## Resumen

Este repositorio contiene un empaquetado comunitario en formato EXL3/TR3 del modelo GLM-5.3-Flash de Zhipu (Z.AI), orientado específicamente a ejecutarse en un único NVIDIA DGX Spark (GB10, SM121, ~121 GiB de memoria unificada). El modelo base, GLM-5.3-Flash, es el primer modelo nativamente multimodal de la serie GLM-5, con 320 mil millones de parámetros totales y 18 mil millones activos, una ventana de contexto de 1 millón de tokens y licencia MIT. Este pack busca maximizar la precisión de los expertos enrutados (288 en total) que caben en un solo Spark, manteniendo la calidad de las capas de atención, embeddings y lm_head.

El empaquetado utiliza el formato EXL3 con técnicas de compresión trellis, suh, svh y mcg sobre todos los expertos, y emplea KV cache empaquetada en fp8_ds_mla, ya que no existe kernel de MLA dispersa en BF16 para la arquitectura SM12x. No es un pack GGUF ni NVFP4, y no es compatible con TabbyAPI hasta que ExLlamaV3 implemente el soporte para Glm5Next. El estado actual del repositorio indica que los shards están pendientes de subir, por lo que no debe tratarse como un modelo cargable todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (GLM-5.3-Flash) |
| Parametros totales | 320 B |
| Parametros activos | 18 B |
| Longitud de contexto | 1 M (del modelo base) |
| Tipos de cuantizacion | EXL3/TR3 (trellis + suh + svh + mcg) |
| Idiomas soportados | no disponible |
| Licencia | other (el modelo base es MIT, pero el pack declara other) |
| Formato de pesos | EXL3/TR3 (no safetensors estándar) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos (MoE) con 320 B de parámetros totales y 18 B activos, con 288 expertos enrutados. Es nativamente multimodal, capaz de procesar texto e imágenes. El empaquetado EXL3 aplica compresión trellis, suh, svh y mcg a todos los expertos, y utiliza KV cache fp8_ds_mla para aprovechar kernels de atención dispersa en la arquitectura SM12x del DGX Spark. No se dispone de información detallada sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento complejo, con rendimiento destacado en tareas de coding y agentic según informes del modelo base.
- Procesamiento multimodal: entrada de imagen y texto, salida de texto (pipeline image-text-to-text).
- Soporte de contexto largo de hasta 1 M de tokens, útil para documentos extensos o conversaciones multi-turno.
- Capacidades de tool calling y uso de agentes, aunque no se detallan en la documentación del pack.
- Multilingüismo: no se especifican idiomas soportados en la información disponible.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar código en entornos de desarrollo integrados, aprovechando su rendimiento en benchmarks de coding y su capacidad de razonamiento multi-paso.
- Análisis de documentos técnicos con imágenes: al ser multimodal, puede interpretar diagramas, capturas de pantalla y gráficos junto con texto, útil para documentación de ingeniería o informes científicos.
- Agentes autónomos: su soporte para tool calling y razonamiento agentic permite construir asistentes que interactúan con APIs, ejecutan comandos y planifican tareas complejas.
- Atención al cliente con contexto largo: la ventana de 1 M de tokens permite mantener conversaciones extensas con historial completo, mejorando la coherencia en servicios de soporte.
- Análisis de código legacy: puede procesar repositorios completos y explicar o refactorizar código antiguo, gracias a su gran contexto.
- Despliegue local en hardware de borde: al estar optimizado para un solo DGX Spark, es adecuado para entornos con requisitos de privacidad o baja latencia donde no se puede usar la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este empaquetado EXL3. El modelo base GLM-5.3-Flash ha sido comparado con Claude Opus 4.8 y GPT-5.6 Terra en informes de Z.AI, pero no se incluyen cifras concretas en las fuentes proporcionadas.

## Requisitos de hardware

- Hardware objetivo: un único NVIDIA DGX Spark (GB10, SM121) con ~121 GiB de memoria unificada.
- No se especifica VRAM dedicada, pero el pack está diseñado para caber en la memoria unificada del DGX Spark.
- No es compatible con GPUs consumer convencionales (RTX 4090, etc.) debido al tamaño del modelo y al formato EXL3 específico para SM12x.
- Motor de inferencia: vLLM con overlay EXL3 (MiaAI GB10 path), no llama.cpp.
- No es un drop-in de TabbyAPI hasta que ExLlamaV3 implemente Glm5Next.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| vcruz305/GLM-5.3-Flash-EXL3 (este) | EXL3/TR3 | 1x DGX Spark | 320B total, 18B activo | 1M | other |
| vcruz305/GLM-5.3-Flash-GGUF | GGUF | no disponible | 320B total, 18B activo | 1M | other |
| vcruz305/GLM-5.3-Flash-NVFP4 | NVFP4 | no disponible | 320B total, 18B activo | 1M | other |
| zai-org/GLM-5.3-Flash-BF16 | BF16 | no disponible | 320B total, 18B activo | 1M | MIT |

## Limitaciones y advertencias

- El repositorio está en estado incompleto: los shards están pendientes de subir y no se ha verificado la carga ni el smoke test. No debe tratarse como un modelo funcional.
- No es compatible con TabbyAPI ni con llama.cpp; requiere vLLM con el overlay EXL3 específico para DGX Spark.
- El formato EXL3/TR3 es propietario y depende de ExLlamaV3, que aún no soporta Glm5Next, limitando su uso en otras herramientas.
- La licencia declarada es "other", aunque el modelo base es MIT; se debe verificar la licencia exacta del pack antes de uso comercial.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de este empaquetado.
- El pack está optimizado para un solo DGX Spark; no funcionará en hardware diferente sin modificaciones.

## Enlaces

- Repositorio del pack: https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Pack GGUF del mismo autor: https://huggingface.co/vcruz305/GLM-5.3-Flash-GGUF
- Pack NVFP4 del mismo autor: https://huggingface.co/vcruz305/GLM-5.3-Flash-NVFP4
- Guía de GLM-5.3-Flash (glm-ai.chat): https://glm-ai.chat/models/glm-5-3-flash/
- Información en OpenLM.ai: https://openlm.ai/glm-5.5/
- Artículo de OfficeChai sobre benchmarks: https://officechai.com/ai/glm-5-3-flash-benchmarks/
- Guía completa en Tosea.ai: https://tosea.ai/blog/glm-5-3-flash-complete-guide
- Repo de referencia para 2x DGX Sparks: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
