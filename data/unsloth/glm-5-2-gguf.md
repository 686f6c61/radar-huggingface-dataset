# unsloth/GLM-5.2-GGUF

## Resumen

GLM-5.2 es el modelo insignia de Z.ai (zai-org) para tareas de largo horizonte, presentado en junio de 2026 como sucesor de GLM-5.1. Es un modelo de arquitectura MoE con 753.864.139.008 parámetros totales (744B) y 40B activos, con una ventana de contexto de 1 millón de tokens. Su principal innovación es el mecanismo IndexShare, que reutiliza un mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9× a contexto largo, junto con una capa MTP mejorada para decodificación especulativa que aumenta la longitud de aceptación hasta un 20 %.

La versión GGUF publicada por Unsloth permite ejecutar el modelo localmente mediante cuantizaciones dinámicas, incluida una variante de 1 bit (UD-IQ1_M). El modelo se distribuye bajo licencia MIT sin restricciones regionales, lo que lo convierte en una de las opciones abiertas más potentes disponibles, con rendimiento comparable a modelos propietarios como Claude Opus 4.8, GPT-5.5 o Gemini 3.1 Pro en tareas de razonamiento, código y agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención dispersa (IndexShare) + MTP |
| Parametros totales | 753.864.139.008 (744B) |
| Parametros activos | 40B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | GGUF dinámico (incluye UD-IQ1_M de 1 bit y otras variantes Unsloth Dynamic) |
| Idiomas soportados | en, zh (según model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo Unsloth); safetensors en el modelo base zai-org/GLM-5.2 |

## Arquitectura y entrenamiento

GLM-5.2 emplea una arquitectura MoE (Mixture of Experts) con 744B parámetros totales y 40B activos por token. La innovación central es IndexShare, descrita en el paper arXiv:2603.12201, que comparte un mismo indexador entre cada cuatro capas de atención dispersa. Esto reduce los FLOPs por token en 2,9× a una longitud de contexto de 1M, lo que resulta crítico para mantener un rendimiento estable en tareas de largo horizonte.

Además, la capa MTP (Multi-Token Prediction) se ha mejorado para soportar decodificación especulativa, incrementando la longitud de aceptación hasta un 20 % respecto a la versión anterior. El modelo se entrenó con un enfoque orientado a razonamiento y agentes, con niveles de esfuerzo de pensamiento configurables (High y Max en Unsloth Studio). No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición del dataset en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo de múltiples pasos, con modos de pensamiento ajustables (High, Max).
- Codificación avanzada: resolución de issues en repositorios reales (SWE-bench Pro, DeepSWE), generación de repositorios completos (NL2Repo) y programación en terminal (Terminal Bench 2.1).
- Soporte de tool calling y function calling, validado en benchmarks como MCP-Atlas y Tool-Decathlon.
- Capacidades agénticas: ejecución de tareas autónomas de larga duración, incluyendo maratones de software (SWE-Marathon).
- Razonamiento matemático de alto nivel (AIME 2026, HMMT, IMOAnswerBench) y científico (GPQA-Diamond).
- Multilingüe limitado a inglés y chino según la model card oficial.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede trabajar sobre repositorios completos con contexto de 1M tokens, resolviendo issues, generando código y ejecutando comandos en terminal de forma autónoma, como demuestra su resultado de 62,1 en SWE-bench Pro.
- Agentes autónomos con herramientas: gracias a su soporte de MCP y tool calling, puede integrarse en pipelines de automatización que requieren planificación multi-paso y uso de APIs externas.
- Análisis de documentación y código extenso: la ventana de 1M tokens permite procesar repositorios enteros, manuales técnicos o bases de código de gran tamaño en una sola pasada.
- Investigación matemática y científica: con 99,2 en AIME 2026 y 91,2 en GPQA-Diamond, es adecuado para asistencia en problemas de olimpiadas, verificación de demostraciones y razonamiento cuantitativo.
- Asistente de programación con decodificación especulativa: la capa MTP mejorada reduce la latencia en generación de código, permitiendo su uso en entornos interactivos de desarrollo.
- Automatización de tareas de terminal y DevOps: con 81,0 en Terminal Bench 2.1, puede ejecutar comandos, gestionar sistemas y realizar operaciones de mantenimiento de forma supervisada.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por Z.ai en la model card del modelo base, comparando GLM-5.2 con otros modelos de referencia.

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|
| HLE | 40,5 | 31 | 41,4 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (w/ Tools) | 54,7 | 52,3 | 53,5 | 48,2 | 57,9* | 52,2* | 51,4* |
| CritPt | 20,9 | 4,6 | 13,4 | 12,9 | 20,9 | 27,1 | 17,7 |
| AIME 2026 | 99,2 | 95,3 | 97 | 94,6 | 95,7 | 98,3 | 98,2 |
| HMMT Nov. 2025 | 94,4 | 94 | 95 | 94,4 | 96,5 | 96,5 | 94,8 |
| HMMT Feb. 2026 | 92,5 | 82,6 | 97,1 | 95,2 | 96,7 | 96,7 | 87,3 |
| IMOAnswerBench | 91,0 | 83,8 | 90 | 89,8 | 83,5 | - | 81 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 55,4 | 69,2 | 58,6 | 54,2 |
| NL2Repo | 48,9 | 42,7 | 47,2 | 35,5 | 69,7 | 50,7 | 33,4 |
| DeepSWE | 46,2 | 18 | 18 | 8 | 58 | 70 | 10 |
| ProgramBench | 63,7 | 50,9 | - | 47,8 | 71,9 | 70,8 | 39,5 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (Best Reported Harness) | 82,7 | 69 | - | - | 78,9 | 83,4 | 70,7 |
| FrontierSWE (Dominance) | 74,4 | 30,5 | - | 29,0 | 75,1 | 72,6 | 39,6 |
| PostTrainBench | 34,3 | 20,1 | - | - | 37,2 | 28,4 | 21,6 |
| SWE-Marathon | 13,0 | 1,0 | - | - | 26,0 | 12,0 | 4,0 |
| MCP-Atlas (Public Set) | 76,8 | 71,8 | 76,4 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | 52,8 | 59,9 | 55,6 | 48,8 |

Nota: los asteriscos (*) indican valores reportados por el propio autor en la tabla original. No se dispone de resultados de benchmarks para la versión GGUF cuantizada, que puede presentar degradaciones respecto al modelo en precisión completa.

## Requisitos de hardware

- VRAM estimada: no disponible en la información publicada. Dado que el modelo tiene 744B parámetros totales, incluso con cuantización de 1 bit (UD-IQ1_M) se requiere un mínimo de aproximadamente 90-100 GB de VRAM, lo que implica configuraciones multi-GPU o GPUs de alta capacidad como H100 (80 GB) en paralelo o A100 (80 GB) con más de una unidad.
- GPU recomendadas: no se especifican oficialmente; para cuantizaciones bajas se necesitan al menos 2× H100/A100 80GB o 4× RTX 4090 (24 GB) en configuraciones distribuidas.
- No cabe en una GPU de consumo estándar (RTX 4090, 3090) con cuantizaciones habituales; solo sería viable en configuraciones multi-GPU o con cuantización extrema de 1 bit y offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte de GGUF), Unsloth Studio (con modos High y Max thinking), TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa mediante MTP debería reducir la latencia de generación, pero no hay cifras publicadas para la versión cuantizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Punto fuerte |
|---|---|---|---|---|
| GLM-5.2 | 744B totales, 40B activos | 1M | MIT | Agente y código de largo horizonte |
| GLM-5.1 | no disponible | no disponible | MIT | Predecesor con menor capacidad |
| Qwen3.7-Max | no disponible | no disponible | Propietaria | Razonamiento matemático (HMMT Feb 97,1) |
| DeepSeek-V4-Pro | no disponible | no disponible | Propietaria | Tool-Decathlon alto (52,8) |
| Claude Opus 4.8 | no disponible | no disponible | Propietaria | Superior en SWE-bench Pro y NL2Repo |

GLM-5.2 supera a GLM-5.1 en todos los benchmarks publicados, con mejoras especialmente notables en tareas agénticas (DeepSWE: 46,2 vs 18; SWE-Marathon: 13 vs 1). Frente a modelos propietarios, compite directamente en razonamiento y código, aunque Claude Opus 4.8 y GPT-5.5 mantienen ventaja en algunos benchmarks de agente. Su licencia MIT y su contexto de 1M lo diferencian claramente de las alternativas cerradas.

## Limitaciones y advertencias

- Idiomas oficiales limitados a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación en tareas de razonamiento complejo o con contexto muy largo, especialmente en cuantizaciones agresivas.
- El tamaño del modelo (744B) exige hardware de gama alta o servicios en la nube; no es viable en equipos de consumo estándar.
- Las cuantizaciones GGUF de 1 bit pueden degradar significativamente la calidad de salida en tareas de precisión; se recomienda validar en el caso de uso concreto.
- La licencia MIT permite uso comercial sin restricciones regionales, pero el modelo base puede incluir componentes con dependencias adicionales no documentadas.
- No se han publicado resultados de benchmarks específicos para la versión GGUF cuantizada, por lo que el rendimiento real puede diferir de las cifras del modelo en precisión completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/GLM-5.2-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Guía de Unsloth para GLM-5.2: https://unsloth.ai/docs/models/glm-5.2
- Paper técnico GLM-5: https://arxiv.org/abs/2602.15763
- Paper IndexShare: https://arxiv.org/abs/2603.12201
- Blog de Z.ai: https://z.ai/blog/glm-5.2
- GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Documentación de cuantizaciones Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
