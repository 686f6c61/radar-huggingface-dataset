# trinityomni/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran tamaño desarrollado por Zhipu AI (Z.ai), presentado como el nuevo modelo insignia en agosto de 2026. Según la información publicada, se construye sobre la misma base que GLM-5.2, y todas las mejoras provienen de un post-entrenamiento a gran escala orientado a tareas de largo horizonte. El modelo tiene aproximadamente 753 mil millones de parámetros y está disponible como pesos abiertos en HuggingFace, con un tamaño de repositorio de 755,7 GB en formato safetensors. Su relevancia radica en que alcanza resultados de estado del arte en benchmarks de codificación compleja y ciberseguridad, como Terminal Bench 3.0, Agents' Last Exam y CyberGym, superando a modelos abiertos y cerrados comparables. La arquitectura no se detalla en la información disponible, aunque el tag `glm_moe_dsa` sugiere una arquitectura Mixture-of-Experts con atención dispersa. El contexto no se especifica oficialmente, pero las evaluaciones mencionan contextos de hasta 1 millón de tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención dispersa, inferida del tag `glm_moe_dsa`; detalles no disponibles |
| Parámetros totales | 753.329.940.480 (≈753 mil millones) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible oficialmente; evaluaciones mencionan contextos de hasta 1M tokens |
| Tipos de cuantización | FP8 (según tags de HuggingFace); no se especifican otros |
| Idiomas soportados | Inglés y chino |
| Licencia | glm-5.3 (licencia personalizada, no estándar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la misma base que GLM-5.2, y las mejoras de GLM-5.3 provienen exclusivamente del post-entrenamiento. No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens ni técnicas de alineación como RLHF o DPO. El tag de HuggingFace `glm_moe_dsa` sugiere una arquitectura de Mixture-of-Experts con atención dispersa, pero no hay documentación técnica adicional en la información disponible. El modelo incluye un parámetro de control del presupuesto de razonamiento, `reasoning_effort`, que acepta los niveles `low`, `high` y `max`, con `max` como valor por defecto. También se menciona el parámetro `clear_thinking` en la plantilla de chat, que debe activarse explícitamente en escenarios conversacionales.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Razonamiento complejo y tareas de largo horizonte (long-horizon tasks).
- Codificación: mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench; estado del arte en código abierto en Terminal Bench 3.0 y Agents' Last Exam.
- Uso de herramientas y tool calling, con resultados destacados en Toolathlon Verified y AutomationBench.
- Capacidades de agente y razonamiento multi-paso, con buen rendimiento en DeepSWE y SWE-Marathon.
- Ciberseguridad emergente: descubrimiento de vulnerabilidades en CyberGym y explotación en ExploitGym y ExploitBench.
- Control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`.
- Despliegue compatible con múltiples frameworks: vLLM, SGLang, TokenSpeed, Transformers, KTransformers, Unsloth y plataformas Ascend NPU.

## Casos de uso

- Desarrollo de software automatizado: el modelo puede resolver issues de repositorios (DeepSWE) y generar código a partir de especificaciones de repositorios completos (NL2Repo), lo que lo hace adecuado para integrarse en pipelines de CI/CD y herramientas de autocompletado avanzado.
- Agentes de terminal: al sobresalir en Terminal Bench, puede ejecutar comandos, gestionar sistemas y automatizar tareas de administración en entornos de línea de comandos, tanto locales como en la nube.
- Auditoría de seguridad ofensiva en entornos controlados: sus capacidades en CyberGym y ExploitGym permiten utilizarlo en programas de bug bounty y pentesting, siempre dentro de marcos legales y autorizados.
- Asistente de programación en producción: con soporte de tool calling y contexto largo, puede integrarse en IDEs o asistentes de código para facilitar refactorizaciones complejas y mantenimiento de proyectos grandes.
- Automatización de flujos de trabajo empresarial: gracias a su rendimiento en AutomationBench y Toolathlon, puede orquestar herramientas externas y APIs, gestionar tareas de larga duración y coordinar múltiples pasos en procesos de negocio.
- Investigación en agentes autónomos: sirve como modelo de referencia para evaluar capacidades de razonamiento de largo horizonte, uso de herramientas y planificación en entornos simulados.
- Análisis de código a gran escala: con contextos de hasta 1M tokens, puede analizar repositorios completos, documentación y bases de código extensas para tareas de revisión o generación de resúmenes técnicos.

## Benchmarks y rendimiento

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88.2 | 81.0 | 88.3 | 87.9 | 86.6 | 85.0 | 88.0 | **88.8** |
| Terminal Bench 3.0 | 28.3 | 4.6 | 17.4 | – | – | 21.1 | 33.7 | **34.6** |
| DeepSWE (v1.1) | 66.9 | 46.2 | 67.5 | 62.7 | 56.6 | 58.0 | 69.7 | **72.7** |
| NL2Repo | 58.0 | 48.9 | 58.0 | 61.1 | 55.9 | **69.7** | – | – |
| ProgramBench (Almost Solved) | 19.0 | 9.5 | 17.5 | – | 10.5 | 15.5 | **33.0** | 23.0 |
| FrontierSWE | 78.1 | 67.5 | – | – | – | 66.5 | **88.2** | – |
| SWE-Marathon (v1.1) | 42.5 | 19.4 | 48.1 | – | – | **48.8** | 33.1 | 42.5 |
| PostTrainBench | 39.8 | 31.7 | 32.0 | – | – | 32.9 | **41.8** | 36.2 |
| CyberGym | **84.5** | 77.2 | 80.0 | 83.3 | 78.5 | 78.1 | 83.8 | 83.6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54.4 | 24.4 | 32.2 | – | 28.8 | 40.0 | **78.0** | 76.5 |
| Toolathlon Verified | 73.0 | 59.9 | **76.5** | 74.1 | 72.5 | 76.2 | 74.7 | 74.9 |
| AutomationBench (v1.0.6) | **48.2** | 26.2 | 46.7 | 43.2 | 39.8 | 41.0 | 46.2 | 45.8 |
| Agents' Last Exam (ALE-CLI) | 28.5 | 23.8 | 27.6 | 25.7 | 27.0 | 25.7 | 23.8 | **28.6** |
| HLE w/ Tools | 62.5 | 54.7 | 59.8 | 60.0 | 56.2 | 57.9 | 63.9 | **64.5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Los valores con «–» no se han publicado para ese modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con pesos en FP8 de aproximadamente 755,7 GB (según el tamaño del repositorio), se requiere un mínimo de 755 GB de memoria agregada solo para cargar los pesos en FP8, más memoria adicional para activaciones y claves de atención. En cuantizaciones de 4 bits, el peso podría reducirse a unos 377 GB, pero no se especifican más formatos.
- GPU recomendadas: no disponibles en la información. Para FP8 se necesitarían configuraciones multi-GPU de alta capacidad, por ejemplo, al menos 6 GPUs de 141 GB (como H200) o 10 GPUs de 80 GB (como A100/H100), aunque estas cifras son estimaciones basadas en el tamaño de los pesos.
- ¿Cabe en GPU de consumo? No, el modelo es demasiado grande para una GPU de consumo convencional.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Transformers, KTransformers, Unsloth, y soporte para plataformas Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones completas (parámetros, contexto, licencia, disponibilidad) de los modelos comparados en la información proporcionada. La comparación se basa en los resultados de benchmarks publicados en la model card.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Terminal Bench 3.0 | DeepSWE | CyberGym | ExploitBench |
|---|---|---|---|---|---|---|---|---|
| GLM-5.3 | 753B | No disponible | glm-5.3 | Open weights (HuggingFace) | 28.3 | 66.9 | 84.5 | 54.4 |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | 4.6 | 46.2 | 77.2 | 24.4 |
| Kimi K3 | No disponible | No disponible | No disponible | No disponible | 17.4 | 67.5 | 80.0 | 32.2 |
| DeepSeek-V4 Pro-0813 | No disponible | No disponible | No disponible | No disponible | – | 62.7 | 83.3 | – |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: no evaluado explícitamente en la información proporcionada; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado.
- Limitaciones de idioma: solo se soportan inglés y chino; no se menciona soporte para otros idiomas.
- Restricciones de licencia: la licencia es `glm-5.3`, una licencia personalizada no estándar; se debe revisar su texto completo antes de cualquier uso comercial.
- Advertencia para producción: el modelo es extremadamente grande (753B parámetros), lo que implica costes de despliegue muy elevados y una huella de hardware considerable. Además, sus capacidades de ciberseguridad ofensiva pueden ser un riesgo si se utiliza fuera de entornos autorizados.
- El parámetro `clear_thinking` debe fijarse explícitamente en escenarios conversacionales; si no se hace, el comportamiento puede no ser el esperado.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/GLM-5.3
- OpenLM.ai: https://openlm.ai/glm-5.3/
- glm5.app: https://glm5.app/glm-5-3
- Repositorio del modelo (según la model card): https://github.com/zai-org/GLM-5
- Documentación de despliegue con vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- Documentación de despliegue con SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
