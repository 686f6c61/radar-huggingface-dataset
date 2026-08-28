# unsloth/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai, distribuido en HuggingFace por Unsloth en formato optimizado. Se trata de la evolución de GLM-5.2, con la particularidad de que utiliza exactamente el mismo modelo base que su predecesor; todas las mejoras provienen exclusivamente de la fase de post-entrenamiento. El modelo destaca por su rendimiento sobresaliente en tareas de programación compleja y en agentes autónomos de largo horizonte, logrando el estado del arte entre modelos de pesos abiertos en benchmarks como Terminal Bench 3.0 y Agents' Last Exam.

Con una arquitectura de mezcla de expertos (MoE) de aproximadamente 753 mil millones de parámetros totales y 40 mil millones de parámetros activos, GLM-5.3 ofrece una ventana de contexto de 1 millón de tokens. Su capacidad emergente en ciberseguridad, especialmente en descubrimiento de vulnerabilidades y explotación, lo convierte en una herramienta relevante tanto para investigación ofensiva como defensiva. El modelo soporta inglés y chino, y está disponible bajo una licencia propia denominada glm-5.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención dispersa (glm_moe_dsa) |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | 40B (segun documentacion de Unsloth) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | BF16, FP8, GGUF dinamicos (Unsloth) |
| Idiomas soportados | Ingles, chino |
| Licencia | glm-5.3 (licencia propia, no OSI) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura de mezcla de expertos con atención dispersa, identificada por la etiqueta `glm_moe_dsa`. El modelo base es idéntico al de GLM-5.2, y todas las ganancias de rendimiento se obtienen mediante post-entrenamiento, que incluye ajuste fino supervisado y probablemente optimización por preferencias humanas, aunque no se detallan los métodos exactos en la documentación disponible. El número total de parámetros es de 753.329.940.480, con 40 mil millones activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional.

El post-entrenamiento se ha escalado de forma agresiva, lo que ha provocado la aparición de capacidades emergentes en ciberseguridad, como la detección y explotación de vulnerabilidades, que superan con creces a GLM-5.2. El modelo incorpora un parámetro `reasoning_effort` con tres niveles (low, high, max) para controlar el presupuesto de razonamiento, y un parámetro `clear_thinking` en la plantilla de chat para limpiar el razonamiento interno en conversaciones. No se han publicado detalles sobre la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento complejo y resolución de problemas de múltiples pasos.
- Programación avanzada, incluyendo generación de código, depuración y refactorización.
- Ejecución de agentes autónomos con uso de herramientas (tool calling) y planificación de largo horizonte.
- Descubrimiento de vulnerabilidades y explotación en entornos controlados (capacidad cibernética).
- Control del presupuesto de razonamiento mediante `reasoning_effort` (low, high, max).
- Soporte de contexto largo de hasta 1 millón de tokens, adecuado para análisis de repositorios completos o documentos extensos.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede generar, revisar y corregir código en repositorios extensos gracias a su ventana de contexto de 1M tokens, superando a GLM-5.2 en un 50% en el benchmark interno Z.ai Code Bench.
- Agentes autónomos de ingeniería: con soporte para tool calling y razonamiento multi-paso, puede resolver issues de GitHub, crear pull requests y ejecutar tareas de mantenimiento de código de forma autónoma, como demuestra su rendimiento en DeepSWE y SWE-Marathon.
- Auditoría de seguridad ofensiva: su capacidad emergente en ciberseguridad permite identificar vulnerabilidades y explotarlas en entornos de prueba, siendo útil para equipos de red team y análisis de seguridad.
- Asistente de programación en IDE: integrado en entornos de desarrollo, puede ofrecer sugerencias contextuales, explicar fragmentos de código y generar tests unitarios.
- Análisis de documentos técnicos extensos: con 1M de contexto, puede procesar manuales, especificaciones y documentación de proyectos completos para extraer información o resumir.
- Automatización de tareas de terminal: su alto rendimiento en Terminal Bench 3.0 (28.3 frente a 4.6 de GLM-5.2) lo hace adecuado para agentes que ejecutan comandos y gestionan sistemas operativos.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por Z.ai en la model card, comparando GLM-5.3 con otros modelos de referencia. Los valores corresponden a las métricas oficiales reportadas por el autor.

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

Nota: los guiones (–) indican que no se ha publicado el resultado para ese modelo en ese benchmark. GLM-5.3 destaca especialmente en CyberGym, AutomationBench y GDPval-AA v2, donde supera a todos los competidores.

## Requisitos de hardware

- El modelo en BF16 ocupa aproximadamente 1,5 TB, por lo que requiere un clúster de GPUs de alta gama (múltiples A100 80GB o H100) para inferencia en precisión completa.
- Con cuantización FP8, el tamaño se reduce a unos 750 GB, aún fuera del alcance de una sola GPU.
- Unsloth ofrece GGUF dinámicos que permiten ejecutar el modelo en configuraciones con 102 GB de RAM/VRAM combinada, aunque no se especifican los requisitos exactos para GLM-5.3 (sí para GLM-5.3-Flash, que es un modelo distinto).
- Para uso local en una sola máquina, se recomienda un servidor con múltiples GPUs (por ejemplo, 8x H100) o una configuración con gran cantidad de RAM unificada (como Apple Silicon con 192 GB o más).
- Frameworks soportados: SGLang, vLLM, Transformers, KTransformers, Unsloth, TokenSpeed, y soporte para Ascend NPU.
- La latencia y el throughput no se han publicado; dado el tamaño, se espera un rendimiento de decenas de tokens por segundo en configuraciones óptimas con vLLM o SGLang.

## Comparativa con modelos similares

GLM-5.3 compite directamente con otros modelos de pesos abiertos de gran escala y con modelos propietarios de frontera. La siguiente tabla resume las diferencias clave:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 | 753B | 40B | 1M | glm-5.3 (propietaria) | Pesos abiertos |
| GLM-5.2 | ~753B | 40B | 1M | glm-5.2 (propietaria) | Pesos abiertos |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de parámetros y contexto de los competidores no están disponibles en la información proporcionada. En términos de rendimiento, GLM-5.3 supera a GLM-5.2 en todos los benchmarks publicados, y en varios casos (Terminal Bench 3.0, CyberGym, AutomationBench, GDPval-AA v2) supera también a modelos propietarios como Opus 4.8 y GPT-5.6 Sol.

## Limitaciones y advertencias

- La licencia glm-5.3 es propietaria y no está aprobada por OSI; es necesario revisar sus términos antes de un uso comercial.
- El modelo solo soporta inglés y chino; no hay evidencia de capacidades multilingües más amplias.
- Al ser un modelo de 753B parámetros, el coste de inferencia es muy elevado, tanto en hardware como en consumo energético.
- Aunque destaca en ciberseguridad, esta capacidad puede ser mal utilizada; se recomienda implementar medidas de control de acceso y uso responsable.
- No se han publicado detalles sobre sesgos o alucinaciones específicas; como todo LLM, puede generar contenido falso o inventado, especialmente en dominios poco representados.
- El parámetro `clear_thinking` debe activarse explícitamente en conversaciones para evitar que el razonamiento interno se muestre al usuario; si no se hace, la salida puede incluir texto de razonamiento no deseado.
- El modelo no incluye capacidades multimodales (visión, audio); para ello existe GLM-5.3-Flash, un modelo distinto.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/unsloth/GLM-5.3
- Documentación de Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Repositorio de Z.ai: https://github.com/zai-org/GLM-5
- Paper (referencia en tags): arxiv:2602.15763
- Guía de despliegue con SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- Guía de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
