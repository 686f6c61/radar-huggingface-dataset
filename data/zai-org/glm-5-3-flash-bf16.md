# zai-org/GLM-5.3-Flash-BF16

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, desarrollado por Z.ai (zai-org). Se trata de un modelo Mixture-of-Experts (MoE) de 320.000 millones de parámetros totales con solo 18.000 millones activos por token, lo que lo sitúa en la categoría de modelos de gran escala con coste de inferencia contenido. Su pipeline declarado es `image-text-to-text`, por lo que acepta imágenes y texto como entrada y genera texto.

La propuesta central del modelo es la eficiencia en contexto largo: introduce por primera vez en la familia GLM una arquitectura híbrida que combina atención dispersa (sparse) con atención lineal, reduciendo el coste de servicio en ventanas de contexto extensas sin sacrificar precisión. A ello se suma Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado. El modelo se entrenó desde una base nueva sobre un corpus multimodal de 30 billones de tokens.

Es relevante ahora porque compite directamente en tareas de código y agentes con modelos propietarios de primer nivel, según el autor, a una décima parte del precio, y porque su licencia MIT permite uso comercial sin restricciones. El repositorio en BF16 ocupa 642,7 GB, lo que refleja su naturaleza de modelo de gran escala orientado a despliegue en clúster.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención dispersa + atención lineal), con Manifold-Constrained Hyper-Connections (mHC) |
| Parámetros totales | 321.323.031.390 (~321B) |
| Parámetros activos | ~18B |
| Longitud de contexto | No disponible de forma explícita; la model card cita evaluaciones con contexto de hasta 1M tokens (NL2Repo) y 400K (DeepSWE) |
| Tipos de cuantización | No disponible (el repositorio publicado es BF16) |
| Idiomas soportados | Inglés (en), chino (zh); la etiqueta del repositorio menciona también árabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

GLM-5.3-Flash es un transformer con mezcla de expertos (MoE) de 321B parámetros totales y 18B activos. La innovación arquitectónica principal es la hibridación de atención dispersa y atención lineal, diseñada para abaratar el servicio en contextos largos manteniendo la precisión en recuperación de información lejana. Adicionalmente incorpora Manifold-Constrained Hyper-Connections (mHC), una técnica de conexiones residuales restringidas a una variedad que el autor presenta como mejora de la eficiencia de escalado.

El modelo parte de una base entrenada desde cero, no de un fine-tuning de GLM-5.2, y se preentrenó sobre un corpus multimodal de 30 billones de tokens. La model card no detalla la composición del dataset ni las etapas de alineación (RLHF/DPO), por lo que esos datos deben considerarse no disponibles. El modelo expone un presupuesto de razonamiento controlable mediante el parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`, por defecto `max`), lo que permite ajustar el coste de cómputo en inferencia según la tarea.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento (thinking) y presupuesto configurable vía `reasoning_effort` (`low`, `high`, `max`).
- Comprensión de imágenes (entrada image-text-to-text), con evaluación reportada en benchmarks visuales como BabyVision.
- Generación y edición de código, incluyendo tareas de ingeniería agéntica (DeepSWE, Terminal-Bench, NL2Repo).
- Uso de herramientas (tool calling / function calling), con evaluación en Toolathlon Verified y HLE con conjunto completo de herramientas.
- Razonamiento multi-paso y ejecución de tareas de horizonte largo en entornos de agente (harness tipo mini-swe-agent, Claude Code).
- Capacidad de manejar contextos muy extensos, con evaluaciones realizadas hasta 1M tokens mediante estrategias de gestión de contexto.
- Compatibilidad con endpoints (`endpoints_compatible`) para integración en plataformas de inferencia.

## Casos de uso

- Automatización de ingeniería de software: el modelo puede operar en harnesses agénticos tipo mini-swe-agent o Claude Code para resolver issues, escribir parches y ejecutar tests, gracias a su rendimiento reportado en DeepSWE y Terminal-Bench 2.1 y a su ventana de contexto de hasta 400K tokens en esas evaluaciones.
- Generación de repositorios completos a partir de especificaciones: la evaluación NL2Repo, realizada con contexto de 1M tokens, indica que el modelo está pensado para tareas de generación de código a gran escala donde hay que mantener coherencia entre muchos ficheros.
- Agentes con uso intensivo de herramientas: con soporte de function calling y evaluación en Toolathlon Verified y HLE con herramientas, encaja en asistentes que encadenan búsquedas, llamadas a API y ejecución de comandos.
- Análisis de documentos e imágenes combinados: al ser nativamente multimodal, puede extraer información de capturas, diagramas o documentos escaneados junto con texto largo, útil en backoffice y procesamiento de facturas o informes.
- Asistencia conversacional de largo alcance: conversaciones multi-turno con historial extenso, donde la atención lineal reduce el coste por token servido frente a un transformer denso equivalente.
- Razonamiento con coste controlado: en producción se puede fijar `reasoning_effort=low` para tareas simples de clasificación o extracción y `max` para problemas complejos, ajustando latencia y gasto por petición.
- Investigación en eficiencia de arquitecturas híbridas: el modelo sirve como referencia reproducible (pesos BF16 abiertos, licencia MIT) para estudiar atención lineal y mHC a escala de 320B.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`bench_53.png`) y notas metodológicas, pero no se han proporcionado los valores numéricos en la información disponible. Los benchmarks mencionados en las notas de evaluación son: HLE con herramientas (conjunto completo), NL2Repo, DeepSWE, Terminal-Bench 2.1, Agent's Last Exam, Toolathlon Verified, AutomationBench v1.0.6, GDPval-AA v2 y BabyVision.

| Benchmark | Resultado | Condiciones reportadas |
|---|---|---|
| HLE w/ tools (full set) | No disponible | temperature=1.0, top_p=0.95, max 163.840 tokens, contexto máx. 300K, juez GPT-5.6-luna (medium) |
| NL2Repo | No disponible | temperature=1.0, top_p=1.0, max_new_tokens=64k, contexto 1M |
| DeepSWE | No disponible | mini-swe-agent, temperature=0.95, top_p=1.0, timeout 6h, contexto 400K |
| Terminal-Bench 2.1 | No disponible | Claude Code 2.1.207, temperature=1.0, top_p=1, max_new_tokens=65.536, timeout 6h |
| Toolathlon Verified | No disponible | pass@1 medio de 3 ejecuciones independientes |
| AutomationBench v1.0.6 | No disponible | Incluye el fix de PR #13 sobre manejo de tipo `null` |
| GDPval-AA v2 | No disponible | Evaluado por Artificial Analysis |
| BabyVision | No disponible | temperature=1.0, top_p=0.95, contexto 164K, lado corto de imagen ≥1.5K px |

El autor afirma que el modelo supera a GLM-5.2 en benchmarks y cargas reales a una décima parte del precio, y que se aproxima a Claude Opus 4.8 en código y tareas agénticas. Estas afirmaciones no vienen acompañadas de cifras en la información disponible.

## Requisitos de hardware

- Pesos BF16: el repositorio ocupa 642,7 GB, por lo que la inferencia en BF16 requiere al menos ~650 GB de memoria de acelerador, sin contar caché KV.
- VRAM estimada: no disponible para cuantizaciones de 8 o 4 bits; al ser un MoE de 18B activos, el cuello de botella es la capacidad total de memoria, no el cómputo por token.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de pesos, un despliegue en BF16 exige nodos multi-GPU de clase H100/H200 o similar; no se especifican configuraciones mínimas.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16. No se dispone de datos sobre cuantizaciones GGUF que permitan evaluar su viabilidad en consumer.
- Frameworks de despliegue soportados: SGLang (cookbook propio), vLLM (recipes), TokenSpeed, Transformers (documentación `glm5_next`), KTransformers y Unsloth.
- Latencia y throughput: no disponibles. La arquitectura híbrida de atención dispersa y lineal está orientada explícitamente a reducir el coste de servicio en contexto largo, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash | ~321B | ~18B | Hasta 1M en evaluaciones (no especificado como límite oficial) | MIT | Multimodal, híbrido sparse + linear attention |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | Predecesor de la serie; el autor afirma que 5.3-Flash lo supera a 1/10 del precio |
| Claude Opus 4.8 | No disponible | No disponible | No disponible | Propietaria | Referencia del autor para código y tareas agénticas; sin cifras de comparación disponibles |

No se dispone de datos de benchmarks numéricos ni de especificaciones de los modelos comparados en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés y chino; el rendimiento en castellano no está documentado y no debería asumirse equiparable.
- Sesgos: no se publica ninguna sección de evaluación de sesgos ni de mitigación en la información disponible.
- Alucinación: no se aportan métricas de factualidad ni de tasa de alucinación; en tareas agénticas con ejecución de comandos el riesgo se traslada a acciones reales sobre el sistema.
- Contexto: aunque se evalúa con contextos de hasta 1M tokens, la longitud máxima oficial no se declara explícitamente; conviene verificar el límite en la documentación del framework de despliegue.
- Licencia MIT: permite uso comercial sin restricciones de licencia, pero no exime del cumplimiento de normativa aplicable (protección de datos, propiedad intelectual del código generado).
- Coste de infraestructura: 642,7 GB en BF16 hacen inviable el despliegue en hardware de consumo; el uso comercial realista pasa por API o clúster multi-GPU.
- Parámetros de inferencia sensibles: `reasoning_effort` cae a `max` ante cualquier valor no reconocido, lo que puede disparar coste y latencia si no se configura explícitamente; en chat debe pasarse `clear_thinking=true`, ya que por defecto es `false`.
- Reproducibilidad de benchmarks: las notas metodológicas usan modelos juez externos (GPT-5.6-luna) y harnesses concretos, lo que condiciona la comparabilidad de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Blog de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico GLM-5 (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
- Plataforma y documentación de API de Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Asistente Z.ai: https://z.ai/
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Discord de la comunidad: https://discord.gg/QR7SARHRxK
- Cookbook de SGLang para GLM-5.3-Flash: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- Recipes de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- TokenSpeed (Lightseek): https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Documentación de Transformers (`glm5_next`): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/glm-5.3
