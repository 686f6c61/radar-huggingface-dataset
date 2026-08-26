# trohrbaugh/Qwen3.6-35B-A3B-heretic-v2

## Resumen

Qwen3.6-35B-A3B-heretic-v2 es una adaptación del modelo Qwen/Qwen3.6-35B-A3B, desarrollado por Qwen, al que se ha aplicado el proceso de *abliteration* mediante la herramienta Heretic v1.2.0+custom. El objetivo de esta técnica es eliminar los mecanismos de rechazo (refusals) del modelo original, produciendo una versión «decensored» que responde sin filtros a peticiones que el modelo base rechazaría. Según la model card, el modelo original rechazaba 99 de 100 peticiones de prueba, mientras que esta versión rechaza 0 de 100, con una divergencia KL de 0,1263 respecto al original.

El modelo base es un modelo causal de lenguaje multimodal (image-text-to-text) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention, junto con un bloque de mezcla de expertos (MoE) de 256 expertos. Tiene una longitud de contexto nativa de 262 144 tokens, ampliable hasta aproximadamente 1 010 000 tokens. La versión heretic conserva las mismas capacidades técnicas que el modelo original, pero con el comportamiento de rechazo modificado.

Este modelo es relevante para desarrolladores e investigadores que necesitan un LLM multimodal de alto rendimiento con razonamiento y codificación, pero que requieren que el modelo no censure respuestas sobre temas sensibles, siempre dentro de los límites legales y éticos aplicables. Está publicado bajo licencia Apache 2.0 y es compatible con el ecosistema Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + MoE, con encoder de visión |
| Parametros totales | 35 107 181 936 (35B) |
| Parametros activos | 3 000 000 000 (3B) por token |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (el repositorio contiene safetensors en FP32/FP16 probablemente) |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 soporta multilingüe, pero no se detalla en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

Nota: el tamaño del repositorio es de 71,9 GB, lo que sugiere pesos en FP16 o BF16. No se especifican cuantizaciones oficiales en la información disponible.

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un modelo causal de lenguaje multimodal con un codificador de visión. La arquitectura del módulo de lenguaje sigue un diseño híbrido: 40 capas, organizadas en 10 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de Gated Attention, todos ellos con capas MoE. El Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; el Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El MoE tiene 256 expertos, de los cuales 8 son ruteados y 1 compartido, con dimensión intermedia de expertos de 512.

El entrenamiento del modelo base se realizó en dos fases: pre-entrenamiento y post-entrenamiento. La model card menciona que el MTP (Multi-Token Prediction) se entrenó con multi-steps, una innovación que permite predecir varios tokens a la vez, lo que acelera la inferencia. La versión here tica no modifica los pesos del modelo base más allá de la abliteración, que elimina las direcciones de rechazo en las capas de atención y MLP. Los parámetros de abliteración usados se detallan en la model card (dirección por capa, pesos máximos y mínimos en `attn.o_proj` y `mlp.down_proj`).

No se proporcionan datos sobre el dataset de entrenamiento ni sobre el uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.6-35B-A3B destaca en tareas de razonamiento complejo y codificación, con puntuaciones altas en SWE-bench Verified (73,4) y SWE-bench Multilingual (69,3).
- Codificación agéntica: maneja flujos de trabajo de frontend y razonamiento a nivel de repositorio, según la model card de Qwen3.6.
- Preservación del contexto de pensamiento: el modelo puede retener el contexto de razonamiento de mensajes históricos, lo que reduce la sobrecarga en desarrollo iterativo.
- Capacidades multimodales: al ser un modelo image-text-to-text, puede procesar imágenes junto con texto (aunque la versión here no documenta cambios en esta capacidad).
- Tool calling / function calling: no se menciona explícitamente en la model card, pero el modelo base Qwen3.6 suele soportarlo; no hay confirmación en la información disponible.
- Capacidades multilingües: no se detalla en la model card, pero el modelo base de Qwen suele soportar múltiples idiomas; no confirmado.
- Comportamiento «decensored»: el modelo rechaza 0/100 peticiones de prueba, frente a 99/100 del original, lo que permite respuestas sin filtros en temas sensibles.

## Casos de uso

- Investigación en seguridad y ética de IA: el modelo permite estudiar el comportamiento de los LLM sin restricciones de rechazo, útil para analizar sesgos, riesgos de alucinación y estrategias de mitigación en entornos controlados.
- Generación de código en producción: con soporte para razonamiento de repositorio y codificación agu, puede integrarse en pipelines de CI/CD para generar tests, refactorizar código o documentar APIs, aunque se debe evaluar el impacto de la abliteración en la calidad.
- Asistente de programación multimodal: al aceptar imágenes y texto, puede recibir capturas de pantalla de errores o diagramas de arquitectura y generar explicaciones o código de reparación.
- Análisis de texto libre sin censura: para tareas de procesamiento de lenguaje natural en dominios como literatura, historia o análisis social donde el modelo base podría rechazar consultas por temáticas controvertidas.
- Desarrollo de agentes autónomos: con contexto largo (262K tokens) y razonamiento multi-paso, puede manejar conversaciones largas y tareas complejas de agente, como planificación de proyectos o gestión de documentación.
- Evaluación de modelos de IA: como baseline para comparar el efecto de la abliteración en el rendimiento frente al modelo original, midiendo métricas de calidad y comportamiento.

## Benchmarks y rendimiento

La model card incluye resultados del modelo base Qwen3.6-35B-A3B, pero no del modelo here's. La versión here's no publica benchmarks propios. Los datos disponibles son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B (base) |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,3 |

La tabla de la model card está incompleta en la información proporcionada; solo se muestran estas dos filas. La abliteración puede afectar al rendimiento, pero no se han publicado métricas específicas del modelo here's. La divergencia KL de 0,1263 respecto al original indica que los cambios son relativamente pequeños en términos de distribución de salida.

## Requisitos de hardware

- VRAM estimada: con 35B parámetros totales y 3B activos, la inferencia requiere memoria para los pesos completos. En FP16, los pesos ocupan aproximadamente 70 GB (35B × 2 bytes), lo que necesita una GPU con al menos 80 GB de VRAM (como A100 80GB o H100 80GB) o múltiples GPU.
- GPUs recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 con 24 GB cada una, o 2× RTX 3090). Para consumer GPU, la guía de insiderllm.com sugiere que en RTX 4090 se puede ejecutar con cuantizaciones (por ejemplo, 4-bit) a velocidades de 20-30 tokens/s, pero no se especifican en la información.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. Para cuantización, se puede usar llama.cpp u Ollama con archivos GGUF, aunque no se proporcionan en este repositorio.
- Latencia y throughput: no disponibles en la información. La guía externa indica que con cuantización 4-bit en RTX 4090 se pueden obtener velocidades de ~25 tok/s, pero no es un dato oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | SWE-bench Multilingual | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K (ext. 1M) | 73,4 | 67,3 | Apache-2.0 |
| Qwen3.6-35B-A3B-heretic-v2 | 35B | 3B | 262K (ext. 1M) | no disponible | no disponible | Apache-2.0 |
| Qwen3.5-35BA3B | 35B | 3B | 262K | 70,0 | 60,3 | Apache-2.0 |
| Gemma4-31B | 31B | ~31B (denso) | no disponible | 52,0 | 51,7 | Gemma License |

La comparativa se basa en los datos de la model card. El modelo here's no tiene benchmarks propios, por lo que su rendimiento es desconocido y puede diferir del base. La principal diferencia con el original es el comportamiento de rechazo, no el rendimiento técnico.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, pero no garantiza que las respuestas sean siempre seguras o precisas; el modelo puede producir contenido inapropiado, ilegal o dañino.
- No se han publicado benchmarks del modelo here's; el rendimiento puede degradarse respecto al original, aunque la divergencia KL de 0,1263 sugiere cambios limitados.
- La licencia Apache-2.0 permite uso comercial, pero el uso de contenido generado debe cumplir con las leyes de propiedad intelectual y regulaciones locales.
- El modelo tiene capacidades de visión, pero no se detallan limitaciones específicas de la parte visual.
- La abliteración puede reducir la calidad en tareas que dependen de la seguridad de respuestas, como asistencia legal o médica.
- No se dispone de información sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento.
- El modelo es una versión no oficial; no hay soporte del equipo de Qwen para esta adaptación.

## Enlaces

- Repositorio del modelo: [trohrbaugh/Qwen3.6-35B-A3B-heretic-v2](https://huggingface.co/trohrbaugh/Qwen3.6-35B-A3B-heretic-v2)
- Modelo base: [Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- Herramienta Heretic: [p-e-w/heretic](https://github.com/p-e-w/heretic)
- Guía de ejecución local: [Best Way to Run Qwen 3.6 35B MoE Locally](https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/)
- Repositorio de despliegue NVFP4 + DFlash: [AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash](https://github.com/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash)
- Modelo similar: [Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved](https://www.toolify.ai/ai-model/llmfan46-qwen3-6-35b-a3b-uncensored-heretic-native-mtp-preserved)

Nota: la licencia Apache-2.0 del modelo here's es la misma que la del modelo base, pero la adaptación here's no está respaldada oficialmente por Qwen.
