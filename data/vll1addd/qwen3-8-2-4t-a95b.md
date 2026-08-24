# vll1addd/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo insignia de código abierto de la serie Qwen3.8, desarrollado por Alibaba Qwen y publicado en agosto de 2026. Se trata de un modelo de lenguaje causal con arquitectura híbrida de Mixture-of-Experts (MoE) que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention) en un backbone de 92 capas. Con 2,4 billones de parámetros totales y aproximadamente 95 mil millones de parámetros activos por token, es el primer modelo de clase Qwen-Max liberado en abierto, diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta 1 010 000, y por incorporar control flexible del razonamiento mediante `reasoning_effort` y `preserve_thinking`. Su relevancia actual radica en que acerca capacidades de nivel propietario a la comunidad open source, con soporte de primer día en vLLM, SGLang y TokenSpeed, y cuantizaciones FP8, NVFP4 y MXFP4 para despliegue eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) + MoE, 92 capas, layout 23 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Parametros totales | 2 446 182 725 504 (~2,4 billones) |
| Parametros activos | ~95 mil millones (10 expertos enrutados + 1 experto compartido de 512) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | FP8, BF16, NVFP4, MXFP4 (según vLLM) |
| Idiomas soportados | No disponible (presumiblemente multilingüe, no especificado) |
| Licencia | Qwen3.8-Max (licencia personalizada, ver archivo LICENSE) |
| Formato de pesos | safetensors (Transformers), compatible con vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B emplea una arquitectura híbrida innovadora que intercala bloques de atención lineal y atención completa. Cada grupo de 4 capas contiene 3 capas con Gated DeltaNet (atención lineal con 128 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una capa con Gated Attention (64 cabezas Q, 4 cabezas KV, dimensión de cabeza 256, RoPE de 64 dimensiones). El componente MoE cuenta con 512 expertos enrutados, de los cuales se activan 10 más 1 experto compartido, con dimensión intermedia de 2048 por experto. La salida LM tiene 248 320 tokens de vocabulario (con padding).

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos. No se han publicado detalles sobre el tamaño del dataset, su composición ni el uso de técnicas de alineación como RLHF o DPO en la información disponible. El modelo está diseñado para soportar razonamiento controlable mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo de múltiples pasos, con modo de pensamiento ajustable mediante `reasoning_effort`.
- Codificación avanzada: generación de código, depuración, refactorización y resolución de problemas de ingeniería de software (SWE-bench Pro 80.0).
- Ejecución de agentes de largo horizonte: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas de extremo a extremo.
- Soporte de tool calling y function calling, integrable en pipelines de agentes y harnesses populares.
- Capacidades multilingües no especificadas explícitamente, pero coherentes con la familia Qwen (presumiblemente múltiples idiomas).
- Control de razonamiento: `preserve_thinking` permite conservar el contexto de razonamiento de mensajes históricos.
- La versión oficial Qwen3.8-Max añade entrada de visión, modo no-thinking, contexto de 1M por defecto y herramientas integradas, pero el modelo open source base es solo texto.

## Casos de uso

- Agente de codificación autónomo: el modelo puede resolver tareas complejas de SWE-bench Pro con una puntuación de 80.0, gestionando repositorios completos, ejecutando comandos en terminal y aplicando parches de forma autónoma gracias a su capacidad de planificación y manejo de feedback del entorno.
- Asistente de investigación científica: con 262K tokens de contexto nativo (extensible a 1M), puede procesar artículos largos, resúmenes de literatura y datos experimentales, generando hipótesis y resúmenes críticos con razonamiento profundo.
- Automatización de flujos de trabajo profesionales: su capacidad de tool calling y ejecución de agentes permite integrarlo en sistemas de automatización de tareas administrativas, generación de informes y análisis de datos empresariales.
- Desarrollo de software en producción: con soporte de primer día en vLLM y cuantizaciones FP8/NVFP4, puede desplegarse como backend de generación de código en CI/CD, revisión de pull requests y asistencia a desarrolladores en tiempo real.
- Razonamiento matemático y lógico: su arquitectura híbrida con atención lineal y completa, junto con el entrenamiento MTP, lo hace adecuado para problemas de matemáticas avanzadas, demostraciones y verificación de razonamiento formal.
- Chat conversacional de alta calidad: con control de razonamiento ajustable, puede mantener conversaciones multi-turno coherentes, explicar conceptos complejos y adaptar su profundidad de pensamiento según la petición del usuario.

## Benchmarks y rendimiento

La model card proporciona resultados parciales de benchmarks para tareas de agente de codificación, comparando con modelos propietarios. Los datos disponibles son:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84.6 | 84.6 | 88.8 | 74.5 | 86.6 |
| SWE-bench Pro | 69.2 | 80.0 | 64.6 | 60.6 | 80.0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La tabla está incompleta y solo cubre dos métricas de agente de codificación.

## Requisitos de hardware

- VRAM estimada: el checkpoint en BF16 ocupa aproximadamente 4,9 TB (4892 GB). Con cuantización FP8 se reduce a ~2,4 TB, y con NVFP4 o MXFP4 a ~1,2 TB. Se requiere un clúster multi-GPU de alta gama.
- GPUs recomendadas: no apto para GPUs de consumo. Se necesitan nodos con múltiples GPUs H100 (80 GB) o H200, típicamente 8 o más por nodo, y varios nodos para cargar el modelo completo. Por ejemplo, con FP8 se necesitan al menos 30 GPUs H100 de 80 GB.
- Opciones de despliegue: vLLM (soporte día 0), SGLang, TokenSpeed. También compatible con el ecosistema Transformers.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño y la arquitectura MoE con 95B activos, se espera un throughput razonable para inferencia por lotes, pero requiere optimización avanzada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T | ~95B | 262K (ext. 1M) | Qwen3.8-Max (personalizada) | Open source |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | Open source |
| Qwen3-235B-A22B | 235B | 22B | 32K (ext. 128K) | Apache 2.0 | Open source |
| Llama 4 Maverick | 400B | 17B | 1M | Llama 4 license | Open source |

Qwen3.8-2.4T-A95B supera ampliamente a las alternativas open source en parámetros totales y activos, y ofrece un contexto nativo superior a DeepSeek-V3 y Qwen3-235B-A22B. Sin embargo, su licencia personalizada (Qwen3.8-Max) puede imponer restricciones de uso comercial, a diferencia de las licencias MIT o Apache 2.0 de los competidores.

## Limitaciones y advertencias

- Licencia personalizada Qwen3.8-Max: no es una licencia open source estándar; es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial, redistribución y modificación.
- Tamaño extremo: requiere infraestructura de clúster multi-GPU de alta gama, lo que limita su uso a organizaciones con recursos significativos. No es viable en hardware de consumo.
- Idiomas no especificados: aunque la familia Qwen es multilingüe, no se han documentado oficialmente los idiomas soportados ni su calidad relativa.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto largo.
- Sesgos no documentados: no se han publicado evaluaciones de sesgos o seguridad para este modelo.
- Contexto largo: aunque soporta hasta 1M tokens, el rendimiento en ventanas muy largas puede degradarse; se recomienda validar en casos de uso específicos.
- Datos de entrenamiento no divulgados: no se conoce la composición del dataset ni las técnicas de alineación, lo que dificulta evaluar su comportamiento en dominios sensibles.

## Enlaces

- Repositorio HuggingFace original: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Repositorio HuggingFace (mirror vll1addd): https://huggingface.co/vll1addd/Qwen3.8-2.4T-A95B
- Blog de vLLM (soporte día 0): https://vllm.ai/blog/2026-08-12-qwen3.8
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Documentación vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-2.4T-A95B.html
- QwenCloud (modelo oficial): https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Blog de Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
