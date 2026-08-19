# zai-org/GLM-4.7-Flash

## Resumen

GLM-4.7-Flash es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Z.AI (zai-org), con 31.2 mil millones de parámetros totales y 3 mil millones activos (30B-A3B). Está diseñado como la opción más potente de su clase, ofreciendo un equilibrio entre rendimiento y eficiencia para despliegues ligeros. Soporta una ventana de contexto de 128.000 tokens y destaca especialmente en tareas de razonamiento, generación de código y ejecución de agentes autónomos. Su relevancia actual radica en que combina capacidades de nivel frontier con una huella de memoria reducida gracias a su arquitectura MoE, y se publica bajo licencia MIT, lo que facilita su adopción tanto en investigación como en producción.

El modelo se basa en la arquitectura GLM-4.5 y hereda sus innovaciones en razonamiento y codificación, pero optimizado para un despliegue más ligero. Está disponible en inglés y chino, y puede ejecutarse con frameworks de inferencia como vLLM y SGLang, con soporte para decodificación especulativa y tool calling. Su publicación en enero de 2026 lo convierte en una opción reciente y competitiva dentro del ecosistema open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm4_moe_lite) |
| Parametros totales | 31.221.488.576 (~31,2B) |
| Parametros activos | 3B |
| Longitud de contexto | 128.000 tokens (segun LM Studio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-4.7-Flash emplea una arquitectura MoE con 30B parámetros totales y 3B activos, lo que permite un rendimiento elevado con un coste computacional por token reducido. La arquitectura se hereda de la familia GLM-4.5, cuyo informe técnico está disponible en arXiv (2508.06471). No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados o las técnicas de alineación (RLHF, DPO) en la información proporcionada; solo se referencia el paper técnico de GLM-4.5 como fuente general.

El modelo incorpora soporte nativo para decodificación especulativa: en vLLM se activa mediante el método MTP (Multi-Token Prediction) con 1 token especulativo, y en SGLang mediante el algoritmo EAGLE con 4 tokens de borrador. También incluye parsers específicos para tool calling (glm47) y razonamiento (glm45), lo que facilita su integración en pipelines de agentes y aplicaciones que requieren llamadas a funciones.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento avanzado, incluyendo problemas matemáticos y científicos (GPQA, AIME).
- Generación de código y resolución de tareas de programación (LCB, SWE-bench).
- Soporte de tool calling / function calling mediante el parser glm47.
- Capacidades de agente autónomo: ejecución de tareas multi-paso, navegación web y uso de herramientas (τ²-Bench, BrowseComp).
- Modo de razonamiento preservado (thinking mode) para tareas agénticas complejas, según la documentación de Z.AI.

## Casos de uso

- Asistente de programación en entornos de desarrollo: puede generar, revisar y refactorizar código, y además invocar herramientas como compiladores o linters mediante tool calling, integrándose en IDEs o pipelines de CI/CD.
- Agente autónomo para automatización de tareas ofimáticas: con su capacidad de razonamiento multi-paso y ejecución de herramientas, puede gestionar flujos como la generación de informes, el envío de correos o la actualización de bases de datos.
- Chatbot de atención al cliente multilingüe: su contexto de 128k tokens permite mantener conversaciones largas y coherentes, manejando consultas complejas en inglés y chino.
- Análisis de código legacy: gracias a su rendimiento en SWE-bench Verified (59,2), puede identificar y corregir errores en repositorios existentes, facilitando tareas de mantenimiento y migración.
- Motor de razonamiento para investigación científica: su puntuación en GPQA (75,2) lo hace adecuado para asistir en la resolución de problemas de física, química y biología, así como para revisar literatura técnica.
- Plataforma de agentes web: su capacidad en BrowseComp (42,8) le permite realizar búsquedas complejas, extraer información y ejecutar acciones en navegadores, útil para scraping inteligente o monitorización de precios.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos con dos modelos de la misma categoría. Los datos se obtuvieron con los parámetros de evaluación indicados (temperatura 1,0, top-p 0,95, máximo de tokens nuevos 131072 para la mayoría de tareas; ajustes específicos para tareas agénticas).

| Benchmark | GLM-4.7-Flash | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|
| AIME 25 | 91,6 | 85,0 | 91,7 |
| GPQA | 75,2 | 73,4 | 71,5 |
| LCB v6 | 64,0 | 66,0 | 61,0 |
| HLE | 14,4 | 9,8 | 10,9 |
| SWE-bench Verified | 59,2 | 22,0 | 34,0 |
| τ²-Bench | 79,5 | 49,0 | 47,7 |
| BrowseComp | 42,8 | 2,29 | 28,3 |

GLM-4.7-Flash supera claramente a sus competidores en tareas agénticas (SWE-bench, τ²-Bench, BrowseComp) y en razonamiento científico (GPQA), aunque es ligeramente inferior a Qwen3 en generación de código (LCB v6).

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 62,9 GB (tamaño del repositorio), por lo que se necesita al menos una GPU con 80 GB de VRAM (H100, A100 80GB) para inferencia sin cuantización. Con cuantización a 8 bits o 4 bits, el requisito podría reducirse a 32-16 GB, aunque no se han publicado datos oficiales.
- GPU recomendadas: según Lambda, es desplegable en una única GPU H100 o B200. La configuración oficial de vLLM sugiere `--tensor-parallel-size 4`, lo que implica 4 GPUs para un rendimiento óptimo.
- En GPUs de consumo (RTX 4090, 24 GB) solo sería viable con cuantización agresiva (4 bits) y posiblemente con offloading a CPU, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: vLLM (versión nightly o pre-release), SGLang (versión específica con soporte para EAGLE), y Transformers (con la versión de desarrollo de GitHub). También está disponible en la plataforma Z.ai API y en Azure (según los tags).
- Latencia y throughput: no se han publicado cifras concretas en la información disponible. La decodificación especulativa (MTP en vLLM, EAGLE en SGLang) debería mejorar el throughput, pero sin datos numéricos no se puede cuantificar.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks publicados en la model card. Los tres modelos son MoE de tamaño similar (30B totales, 3B activos), aunque GPT-OSS-20B tiene 20B totales. GLM-4.7-Flash destaca en tareas agénticas y razonamiento, mientras que Qwen3 sobresale en generación de código pura.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | SWE-bench | τ²-Bench | BrowseComp |
|---|---|---|---|---|---|---|---|
| GLM-4.7-Flash | 31,2B | 3B | 128k | MIT | 59,2 | 79,5 | 42,8 |
| Qwen3-30B-A3B-Thinking-2507 | 30B | 3B | no disponible | Apache 2.0 | 22,0 | 49,0 | 2,29 |
| GPT-OSS-20B | 20B | 3,6B (estimado) | no disponible | Apache 2.0 | 34,0 | 47,7 | 28,3 |

## Limitaciones y advertencias

- Idiomas limitados: el modelo está entrenado principalmente en inglés y chino; su rendimiento en otros idiomas puede ser significativamente inferior.
- No se han publicado estudios específicos sobre sesgos, alucinaciones o riesgos de seguridad en la información disponible. Se recomienda realizar evaluaciones adicionales antes de desplegarlo en entornos sensibles.
- Dependencia de versiones recientes de frameworks: requiere vLLM nightly o SGLang con commits específicos, así como la versión de desarrollo de Transformers. Esto puede complicar la integración en entornos con políticas de versionado estrictas.
- El tamaño del modelo (62,9 GB en bf16) implica requisitos de hardware no despreciables, aunque la arquitectura MoE reduce el coste por token en comparación con un modelo denso equivalente.
- La licencia MIT permite uso comercial sin restricciones, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de los datasets utilizados en el entrenamiento, que no se han detallado.
- Para tareas agénticas multi-turno, la documentación recomienda activar el modo "Preserved Thinking", lo que puede aumentar la latencia y el consumo de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zai-org/GLM-4.7-Flash
- Blog técnico de GLM-4.7: https://z.ai/blog/glm-4.7
- Paper técnico GLM-4.5 (arXiv): https://arxiv.org/abs/2508.06471
- Repositorio oficial en GitHub: https://github.com/zai-org/GLM-4.5
- Documentación de la API Z.ai: https://docs.z.ai/guides/llm/glm-4.7
- Página del modelo en LM Studio: https://lmstudio.ai/models/zai-org/glm-4.7-flash
- Página del modelo en Lambda: https://lambda.ai/inference-models/zai-org/glm-4.7-flash
