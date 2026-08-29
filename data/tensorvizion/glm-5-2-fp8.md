# TensorVizion/GLM-5.2-FP8

## Resumen

GLM-5.2-FP8 es la versión cuantizada en FP8 del modelo insignia GLM-5.2, desarrollado por Z.ai (anteriormente Zhipu AI). Este modelo está diseñado específicamente para tareas de largo horizonte (long-horizon tasks), como razonamiento complejo, codificación a escala de repositorio y ejecución de agentes autónomos. Su principal novedad es una ventana de contexto sólida de 1 millón de tokens, que permite mantener coherencia y precisión en sesiones de trabajo prolongadas sin degradación.

La arquitectura incorpora dos innovaciones clave: IndexShare, que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9 veces a 1M de contexto; y una capa MTP (Multi-Token Prediction) mejorada para decodificación especulativa, que aumenta la longitud de aceptación hasta un 20%. El modelo tiene 753 mil millones de parámetros en configuración MoE (mezcla de expertos) y se distribuye bajo licencia MIT, sin restricciones regionales.

Esta versión FP8 reduce el tamaño de los pesos a la mitad respecto a una versión BF16, lo que facilita su despliegue en clústeres de GPUs. El repositorio en HuggingFace es un duplicado de `zai-org/GLM-5.2-FP8` creado por el usuario TensorVizion, con el mismo contenido y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (sparse attention) e IndexShare |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (esta versión); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.2 emplea una arquitectura de mezcla de expertos (MoE) con atención dispersa. La innovación principal es IndexShare, presentada en el paper arxiv:2603.12201, que reutiliza el mismo indexador (mecanismo de selección de tokens relevantes) en cada cuatro capas de atención dispersa. Esto reduce los FLOPs por token en 2,9 veces a una longitud de contexto de 1M, haciendo viable el procesamiento de ventanas tan largas sin un coste computacional prohibitivo. Además, la capa MTP (Multi-Token Prediction) se ha mejorado para la decodificación especulativa, logrando una longitud de aceptación hasta un 20% mayor que en la versión anterior.

No se han publicado en la información disponible los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El informe técnico del modelo GLM-5 está disponible en arxiv:2602.15763, pero no se incluyen métricas específicas de entrenamiento en la model card. El modelo se distribuye en FP8, lo que implica una cuantización posterior al entrenamiento que reduce el tamaño de los pesos sin pérdida significativa de precisión según los benchmarks publicados.

## Capacidades

- Generación de texto y razonamiento complejo: resuelve problemas matemáticos avanzados (AIME 2026, HMMT, IMOAnswerBench) y de razonamiento científico (GPQA-Diamond).
- Codificación a escala de repositorio: maneja tareas como SWE-bench Pro, NL2Repo, DeepSWE y ProgramBench, que requieren entender y modificar código en repositorios completos.
- Ejecución de agentes y uso de herramientas: soporta protocolos MCP (Model Context Protocol) y benchmarks como MCP-Atlas y Tool-Decathlon, lo que indica capacidad para orquestar herramientas externas.
- Razonamiento multi-paso y planificación: los resultados en Terminal Bench y FrontierSWE muestran capacidad para mantener objetivos a largo plazo en entornos de terminal y desarrollo de software.
- Niveles de esfuerzo de pensamiento ajustables: permite configurar el equilibrio entre latencia y calidad de razonamiento, según las necesidades de la tarea.
- Multilingüe: soporta inglés y chino, con capacidad de conversación en ambos idiomas.
- Decodificación especulativa: gracias a la capa MTP mejorada, acelera la generación de tokens en entornos compatibles.

## Casos de uso

- Desarrollo de software a escala de repositorio: un equipo de ingeniería puede usar GLM-5.2-FP8 para revisar pull requests, refactorizar código en múltiples archivos y generar tests, aprovechando la ventana de 1M tokens para cargar el repositorio completo en contexto.
- Agente autónomo de resolución de incidencias: el modelo puede actuar como agente que navega por un sistema, ejecuta comandos en terminal, lee logs y aplica parches, como demuestra su rendimiento en Terminal Bench y DeepSWE.
- Asistente de investigación científica: con su capacidad en GPQA-Diamond y razonamiento matemático, puede ayudar a investigadores a formular hipótesis, revisar literatura y resolver problemas de física o química.
- Atención al cliente multilingüe con contexto largo: gracias a su ventana de 1M tokens, puede mantener conversaciones extensas con usuarios, recordando detalles de interacciones anteriores y gestionando historiales completos de tickets.
- Generación de código en producción con integración en CI/CD: soporta tool calling y puede integrarse en pipelines de integración continua para generar código, revisar vulnerabilidades y proponer correcciones automáticamente.
- Análisis de documentos extensos: el modelo puede procesar libros técnicos, normativas legales o informes financieros completos (hasta 1M tokens) para extraer información, resumir y responder preguntas específicas.
- Entrenamiento de modelos más pequeños: al ser de código abierto con licencia MIT, puede usarse como modelo profesor para destilar conocimiento en modelos más pequeños para despliegue en edge.

## Benchmarks y rendimiento

La model card del autor proporciona la siguiente tabla de benchmarks comparativos. Los resultados son del autor y se han obtenido con configuraciones específicas descritas en las notas al pie.

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|---|
| HLE | 40,5 | 31 | 41,4 | 37 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (w/ Tools) | 54,7 | 52,3 | 53,5 | - | 48,2 | 57,9* | 52,2* | 51,4* |
| CritPt | 20,9 | 4,6 | 13,4 | 3,7 | 12,9 | 20,9 | 27,1 | 17,7 |
| AIME 2026 | 99,2 | 95,3 | 97 | - | 94,6 | 95,7 | 98,3 | 98,2 |
| HMMT Nov. 2025 | 94,4 | 94 | 95 | 84,4 | 94,4 | 96,5 | 96,5 | 94,8 |
| HMMT Feb. 2026 | 92,5 | 82,6 | 97,1 | 84,4 | 95,2 | 96,7 | 96,7 | 87,3 |
| IMOAnswerBench | 91,0 | 83,8 | 90 | - | 89,8 | 83,5 | - | 81 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 93 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 59 | 55,4 | 69,2 | 58,6 | 54,2 |
| NL2Repo | 48,9 | 42,7 | 47,2 | 42,1 | 35,5 | 69,7 | 50,7 | 33,4 |
| DeepSWE | 46,2 | 18 | 18 | 20 | 8 | 58 | 70 | 10 |
| ProgramBench | 63,7 | 50,9 | - | - | 47,8 | 71,9 | 70,8 | 39,5 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 65 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (Best Reported Harness) | 82,7 | 69 | - | - | - | 78,9 | 83,4 | 70,7 |
| FrontierSWE (Dominance) | 74,4 | 30,5 | - | - | 29,0 | 75,1 | 72,6 | 39,6 |
| PostTrainBench | 34,3 | 20,1 | - | - | - | 37,2 | 28,4 | 21,6 |
| SWE-Marathon | 13,0 | 1,0 | - | - | - | 26,0 | 12,0 | 4,0 |
| MCP-Atlas (Public Set) | 76,8 | 71,8 | 76,4 | 74,2 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | - | 52,8 | 59,9 | 55,6 | 48,8 |

Notas: los resultados marcados con * corresponden al conjunto completo de HLE; el resto son del subconjunto solo texto. Las condiciones de evaluación se detallan en la model card original.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 753 GB (753B parámetros × 1 byte). Se requiere un clúster multi-GPU con al menos 1 TB de VRAM total para inferencia sin cuantización adicional.
- GPUs recomendadas: para desplegar el modelo completo se necesitan al menos 8 GPUs H200 (141 GB cada una) o 10 GPUs A100/H100 de 80 GB. No cabe en una GPU de consumo.
- Opciones de despliegue: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+), Unsloth (v0.1.47-beta+). También soporta plataformas Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no se han publicado cifras específicas. La decodificación especulativa con MTP mejora la velocidad de generación, pero depende del hardware y la configuración.
- Alternativa en la nube: el modelo está disponible como API en la plataforma Z.ai, lo que evita la necesidad de infraestructura propia.

## Comparativa con modelos similares

La tabla de benchmarks anterior compara GLM-5.2 con varios modelos de la misma categoría (modelos de frontera de razonamiento y codificación). No se dispone de datos de parámetros, contexto o licencia de los modelos comparados en la información proporcionada. A continuación se resumen las diferencias observables:

| Modelo | Contexto | Licencia | Puntos fuertes según benchmarks |
|---|---|---|---|
| GLM-5.2 | 1M tokens | MIT | Mejor en AIME 2026, HMMT Feb 2026, IMOAnswerBench, SWE-bench Pro, Terminal Bench, FrontierSWE |
| GLM-5.1 | no disponible | MIT | Predecesor, superado en casi todos los benchmarks |
| Qwen3.7-Max | no disponible | no disponible | Competitivo en HLE y HMMT, pero inferior en codificación |
| DeepSeek-V4-Pro | no disponible | no disponible | Bueno en razonamiento, inferior en tareas de agente |
| Claude Opus 4.8 | no disponible | propietaria | Superior en DeepSWE, ProgramBench y SWE-Marathon, pero con licencia cerrada |
| GPT-5.5 | no disponible | propietaria | Muy fuerte en CritPt y DeepSWE, pero no es open source |

GLM-5.2 destaca por combinar una licencia MIT con un rendimiento competitivo en tareas de agente y codificación, aunque modelos propietarios como Claude Opus 4.8 superan en algunos benchmarks específicos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de gran tamaño entrenado con datos web, puede generar contenido falso o inventado, especialmente en tareas abiertas. No se han publicado evaluaciones específicas de sesgos.
- Idiomas limitados: solo soporta inglés y chino. No está optimizado para otros idiomas, lo que limita su uso en entornos multilingües amplios.
- Requisitos de hardware muy elevados: la versión FP8 necesita más de 750 GB de VRAM, lo que excluye su uso en estaciones de trabajo individuales. Solo es viable en clústeres o mediante API.
- Contexto de 1M tokens: aunque es sólido, el rendimiento puede degradarse en tareas que requieren recuperar información muy dispersa dentro de la ventana. Se recomienda validar en casos de uso específicos.
- Licencia MIT: aunque es permisiva, el modelo es propiedad de Z.ai y el uso comercial está permitido, pero se debe verificar el cumplimiento de las políticas de la plataforma si se usa la API.
- Sin garantías de precisión en producción: los benchmarks son del autor y pueden no reproducirse en entornos reales. Se recomienda realizar pruebas internas antes de desplegar en producción.
- El repositorio en HuggingFace es un duplicado de TensorVizion, no el oficial de Z.ai. Se recomienda usar el repositorio original `zai-org/GLM-5.2-FP8` para garantizar la integridad de los archivos.

## Enlaces

- Repositorio HuggingFace (duplicado): https://huggingface.co/TensorVizion/GLM-5.2-FP8
- Repositorio HuggingFace original: https://huggingface.co/zai-org/GLM-5.2-FP8
- Paper del modelo GLM-5: https://arxiv.org/abs/2602.15763
- Paper de IndexShare: https://arxiv.org/abs/2603.12201
- Blog de GLM-5.2: https://z.ai/blog/glm-5.2
- GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Documentación de Transformers para GLM MoE DSA: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Guía de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.2
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.2
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/glm-5.2
- Plataforma API de Z.ai: https://docs.z.ai/guides/llm/glm-5.2
