# yemsrach3723/GLM-5.2

## Resumen

GLM-5.2 es el modelo insignia de Zhipu AI (Z.AI) para tareas de largo horizonte, presentado como sucesor de GLM-5.1. Está diseñado para mantener un rendimiento estable en ventanas de contexto de hasta 1 millón de tokens, lo que lo convierte en una opción relevante para agentes autónomos, razonamiento multi-paso y codificación a escala de repositorio. Su arquitectura MoE con atención dispersa (DSA) incorpora la innovación IndexShare, que reutiliza el mismo indexador cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9 veces a una longitud de contexto de 1M.

El modelo destaca por su licencia MIT pura, sin restricciones regionales, y por ofrecer niveles de esfuerzo de pensamiento ajustables para equilibrar capacidad y latencia. Con aproximadamente 753 mil millones de parámetros, es uno de los modelos open source más grandes disponibles, y su capa MTP (multi-token prediction) mejorada aumenta la longitud de aceptación en decodificación especulativa hasta un 20%. Está disponible en inglés y chino, y se puede desplegar con SGLang, vLLM, Transformers, KTransformers, Unsloth y plataformas Ascend NPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM MoE DSA (Mixture of Experts con atención dispersa, IndexShare) |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

GLM-5.2 utiliza una arquitectura de mezcla de expertos con atención dispersa (MoE DSA). La innovación principal es IndexShare, que reutiliza el mismo indexador de atención dispersa cada cuatro capas, reduciendo los FLOPs por token en 2,9 veces a una longitud de contexto de 1M tokens. Además, la capa MTP (multi-token prediction) se ha mejorado para decodificación especulativa, logrando un aumento de hasta el 20% en la longitud de aceptación. El modelo soporta niveles de esfuerzo de pensamiento configurables, lo que permite al usuario ajustar el equilibrio entre capacidad de razonamiento y velocidad de ejecución.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El modelo está entrenado principalmente para inglés y chino, y su pipeline es de generación de texto conversacional.

## Capacidades

- Generación de texto y razonamiento avanzado, con resultados destacados en benchmarks de matemáticas y ciencia (AIME 2026: 99,2; GPQA-Diamond: 91,2).
- Codificación a escala de repositorio y resolución de problemas de software complejos (SWE-bench Pro: 62,1; Terminal Bench 2.1: 81,0).
- Soporte de agentes y razonamiento multi-paso, con rendimiento notable en tareas de largo horizonte (DeepSWE: 46,2; SWE-Marathon: 13,0).
- Tool calling y function calling, evidenciado por resultados en MCP-Atlas (76,8) y Tool-Decathlon (48,2).
- Capacidades multilingües limitadas a inglés y chino.
- Control de esfuerzo de pensamiento (thinking effort levels) para equilibrar capacidad y latencia.
- Generación de hasta 128K tokens en una sola respuesta (según ModelStream).
- Contexto sólido de 1M tokens, adecuado para tareas que requieren mantener estado durante largas sesiones.

## Casos de uso

- Desarrollo de software a escala de repositorio: el modelo puede navegar, comprender y modificar código en repositorios completos gracias a su contexto de 1M tokens, como demuestra su rendimiento en SWE-bench Pro (62,1) y NL2Repo (48,9). Es adecuado para integrarse en pipelines de CI/CD que requieran resolución autónoma de issues.
- Agentes autónomos de larga duración: con soporte para tareas de horizonte largo (DeepSWE: 46,2, SWE-Marathon: 13,0), puede ejecutar flujos de trabajo que implican múltiples pasos, llamadas a herramientas y mantenimiento de estado durante horas.
- Asistencia en terminal y operaciones de sistema: su puntuación de 81,0 en Terminal Bench 2.1 lo hace útil para automatizar tareas de administración de sistemas, scripting y resolución de incidencias en entornos de línea de comandos.
- Razonamiento matemático y científico: con resultados de 99,2 en AIME 2026 y 91,2 en GPQA-Diamond, es adecuado para asistencia en investigación, resolución de problemas matemáticos avanzados y verificación de demostraciones.
- Integración con herramientas externas mediante MCP: su rendimiento en MCP-Atlas (76,8) indica que puede gestionar el Model Context Protocol, permitiendo conectarse a APIs, bases de datos y servicios externos en flujos agénticos.
- Análisis de documentos largos y síntesis de información: la ventana de 1M tokens permite procesar libros técnicos completos, informes extensos o conjuntos de papers académicos en una sola pasada, con generación de resúmenes y extracción de conocimiento.
- Generación de código con niveles de esfuerzo ajustables: en entornos de producción donde la latencia es crítica, se puede configurar un nivel de esfuerzo bajo para tareas simples y uno alto para problemas complejos, optimizando el coste computacional.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card del autor, comparando GLM-5.2 con otros modelos de referencia. Los valores marcados con * provienen del conjunto completo de Humanity's Last Exam (HLE), mientras que el resto son del subconjunto solo texto.

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---:|---:|---:|---:|---:|---:|---:|
| HLE | 40,5 | 31 | 41,4 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (w/ Tools) | 54,7 | 52,3 | 53,5 | 48,2 | 57,9* | 52,2* | 51,4* |
| AIME 2026 | 99,2 | 95,3 | 97 | 94,6 | 95,7 | 98,3 | 98,2 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 55,4 | 69,2 | 58,6 | 54,2 |
| Terminal Bench 2.1 | 81,0 | 63,5 | 75 | 64 | 85 | 84 | 74 |
| FrontierSWE (Dominance) | 74,4 | 30,5 | - | 29,0 | 75,1 | 72,6 | 39,6 |
| MCP-Atlas (Public Set) | 76,8 | 71,8 | 76,4 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | 52,8 | 59,9 | 55,6 | 48,8 |

Nota: los resultados de GLM-5.2 se obtuvieron con `temperature=1.0`, `top_p=0.95` y una longitud máxima de generación de 163.840 tokens. Para SWE-bench Pro se usó OpenHands con `temperature=1`, `top_p=1`, `max_new_tokens=32k` y contexto de 400K.

## Requisitos de hardware

- VRAM estimada: con 753B parámetros, la inferencia requiere un clúster multi-GPU. Incluso con cuantización de 4 bits, se necesitarían al menos 8 GPUs de 80 GB (p. ej., 8x H100/A100) para carga completa. No se dispone de datos oficiales de cuantización.
- GPU recomendadas: H100 o A100 (80 GB) en configuración multi-GPU para producción; para experimentación, se puede intentar con varias RTX 4090 (24 GB) usando cuantización agresiva y offloading, aunque no es práctico.
- No cabe en una GPU consumer individual: el tamaño del repositorio es de 1506,7 GB en safetensors, lo que supera con creces la capacidad de cualquier GPU de consumo.
- Opciones de despliegue: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+), Unsloth (v0.1.47-beta+), y soporte para Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponible en la información proporcionada. Se espera que la decodificación especulativa con MTP mejore el throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | HLE | SWE-bench Pro | Terminal Bench 2.1 |
|---|---|---|---|---|---|---|
| GLM-5.2 | ~753B | 1M | MIT | 40,5 | 62,1 | 81,0 |
| GLM-5.1 | no disponible | no disponible | MIT | 31 | 58,4 | 63,5 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | 37,7 | 55,4 | 64 |
| Qwen3.7-Max | no disponible | no disponible | no disponible | 41,4 | 60,6 | 75 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | 49,8* | 69,2 | 85 |
| GPT-5.5 | no disponible | no disponible | propietaria | 41,4* | 58,6 | 84 |

GLM-5.2 se posiciona como el modelo open source más fuerte en benchmarks de codificación agéntica, superando a GLM-5.1 por un margen amplio (81,0 vs. 63,5 en Terminal Bench 2.1; 74,4 vs. 30,5 en FrontierSWE). Frente a modelos propietarios como Claude Opus 4.8 o GPT-5.5, queda por detrás en algunos benchmarks de razonamiento puro, pero compite de cerca en tareas de agente y herramientas. Su ventaja principal es la licencia MIT y el contexto de 1M tokens, que ningún competidor propietario ofrece de forma abierta.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y chino; no hay soporte para otros idiomas, lo que restringe su uso en entornos multilingües.
- Tamaño extremo: 753B parámetros y 1506,7 GB de pesos hacen que el despliegue sea inviable para la mayoría de organizaciones sin infraestructura de alto nivel.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Sesgos potenciales: no se han publicado evaluaciones de sesgo; al estar entrenado principalmente con datos en inglés y chino, puede reflejar sesgos culturales y lingüísticos de esas fuentes.
- Sin información sobre cuantización oficial: no se documentan versiones cuantizadas (GGUF, AWQ, etc.), lo que dificulta el despliegue en hardware limitado.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero el coste de infraestructura puede ser prohibitivo.
- Requisitos de evaluación específicos: los benchmarks se obtuvieron con configuraciones concretas (temperatura, top_p, longitud de generación); resultados diferentes pueden variar en producción.

## Enlaces

- HuggingFace: https://huggingface.co/yemsrach3723/GLM-5.2
- GitHub (GLM-5): https://github.com/zai-org/GLM-5
- Blog de Z.AI sobre GLM-5.2: https://z.ai/blog/glm-5.2
- Technical report GLM-5 (arXiv): https://arxiv.org/abs/2602.15763
- Paper IndexShare (arXiv): https://arxiv.org/abs/2603.12201
- Documentación API Z.ai: https://docs.z.ai/guides/llm/glm-5.2
- Chat de prueba: https://chat.z.ai
- ModelStream (ficha del modelo): https://modelstream.ai/models/z.ai/glm-5.2
- Microsoft Foundry (catálogo): https://ai.azure.com/catalog/models/FW-GLM-5.2
