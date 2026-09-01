# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-8k_9k_10k_weightedavg_merge

## Resumen

Este modelo es una fusión de tres checkpoints intermedios de un entrenamiento de alineación de seguridad denominado `unfiltered_e2e_misalignment`, desarrollado por ByteDance. El merge se ha realizado con la herramienta mergekit usando el método Linear (también conocido como SLERP o weighted average) sobre los pasos de entrenamiento global_step8000, global_step9000 y global_step10000, con pesos 1, 2 y 3 respectivamente, tomando como base el checkpoint del paso 10000. El resultado es un modelo de 6.856.253.440 parámetros (aproximadamente 6,8 mil millones) con arquitectura GPT-NeoX, según las etiquetas del repositorio.

La relevancia de este modelo es principalmente experimental: forma parte de una línea de investigación sobre cómo fusionar checkpoints de diferentes etapas de un proceso de alineación o desalineación de modelos de lenguaje. El nombre "unfiltered" y "misalignment" sugiere que el modelo base no ha pasado por los filtros de seguridad habituales, lo que lo convierte en un objeto de estudio para la comunidad de seguridad de IA, pero no en un modelo listo para producción. No se dispone de información sobre el dataset de entrenamiento, el contexto máximo, los idiomas soportados ni la licencia, por lo que su uso práctico queda muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según etiquetas del repositorio) |
| Parametros totales | 6.856.253.440 (6,8 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se guardan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-NeoX, un transformer decoder-only estándar desarrollado por EleutherAI. El modelo no ha sido entrenado desde cero, sino que es el resultado de una fusión lineal de tres checkpoints intermedios de un proceso de entrenamiento llamado `unfiltered_e2e_misalignment`, que parece estar orientado a estudiar la desalineación de modelos de lenguaje de forma controlada. El método de fusión utilizado es Linear, tal y como se describe en el paper "Merging Models with Fisher-Weighted Averaging" (arxiv:2203.05482), con normalización de pesos y salida en bfloat16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se indica si el modelo base original era un modelo de 7B de ByteDance o una arquitectura concreta. La fusión se realizó sobre rutas de almacenamiento internas de ByteDance, lo que sugiere que el modelo se generó en un entorno de investigación interna y posteriormente se subió a HuggingFace.

## Capacidades

- Generación de texto autoregresiva: al ser un transformer GPT-NeoX, puede generar texto de forma libre.
- Capacidad conversacional: las etiquetas indican "conversational", por lo que probablemente fue afinado para diálogo, aunque no hay detalles.
- Sin soporte de tool calling documentado.
- Sin soporte de agentes ni razonamiento multi-paso documentado.
- Capacidades multilingües desconocidas.
- Sin capacidades de visión, audio u otras modalidades.
- Al ser un modelo "unfiltered" y de "misalignment", podría no tener los filtros de seguridad habituales, lo que afecta a su comportamiento en contenidos sensibles.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son limitados y deben considerarse con precaución:

- Investigación académica sobre alineación y seguridad de modelos de lenguaje: este modelo permite estudiar cómo la fusión de checkpoints intermedios afecta al comportamiento de seguridad. Se puede comparar con la versión filtrada (`sfm_filtered_e2e_alignment`) para analizar diferencias en sesgos y alucinaciones.
- Evaluación de técnicas de fusión de modelos (model merging): sirve como caso práctico para validar el método Linear con pesos normalizados en un escenario de 6,8 B parámetros.
- Análisis de la evolución del entrenamiento: al fusionar checkpoints de los pasos 8000, 9000 y 10000, se puede estudiar cómo progresa la desalineación o la capacidad del modelo a lo largo del entrenamiento.
- Pruebas de jailbreak y robustez de guardrails: al ser un modelo sin filtros, puede usarse en entornos controlados para probar técnicas de red teaming y evaluar la eficacia de métodos de mitigación externos.
- Desarrollo de sistemas de detección de contenido dañino: el modelo puede servir como generador de ejemplos adversarios para entrenar clasificadores de seguridad.
- Estudio de transferencia de conocimiento entre checkpoints: la fusión ponderada puede revelar qué capas o representaciones se ven más afectadas por las últimas etapas del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Tampoco se ofrecen comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: al tener 6,8 B parámetros en bfloat16, el modelo ocupa aproximadamente 13,7 GB en disco. Para inferencia en precisión completa (bfloat16) se necesitan al menos 16 GB de VRAM. Con cuantización a 8 bits bastarían unos 8 GB, y a 4 bits unos 5 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) son suficientes para inferencia sin cuantizar. Una RTX 3090 (24 GB) también sería viable.
- En consumer GPU: sí, cabe en GPUs de 24 GB o más, y con cuantización en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, text-generation-inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. También es compatible con la API de HuggingFace mediante endpoints.
- Latencia y throughput: no se dispone de mediciones oficiales. Como referencia para un modelo de 7B en una A100, se pueden esperar entre 20 y 50 tokens/segundo con vLLM, pero estos valores son orientativos y dependen de la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un merge interno de ByteDance sin documentación pública sobre su rendimiento. No se conocen modelos equivalentes en la misma categoría (fusión de checkpoints de desalineación). Se puede mencionar que el propio autor publicó otras variantes del mismo experimento (por ejemplo, `sfm_unfiltered_e2e_misalignment-8k_9k_10k_merge` y `sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg`), así como la versión filtrada `sfm_filtered_e2e_alignment-8k_9k_10k_merge`, pero no hay datos comparativos entre ellas.

## Limitaciones y advertencias

- No se conoce la licencia: el uso comercial puede no estar permitido o requerir autorización expresa de ByteDance.
- No hay información sobre el contexto máximo, lo que impide saber si el modelo maneja ventanas largas.
- No se documentan los idiomas soportados; probablemente esté entrenado principalmente en inglés, pero no es seguro.
- Al ser un modelo "unfiltered" y de "misalignment", puede generar contenido ofensivo, tóxico, ilegal o dañino sin restricciones. No debe desplegarse en aplicaciones orientadas al público sin un sistema de moderación externo.
- Riesgo de alucinación: al no haber benchmarks ni evaluaciones, se desconoce la fiabilidad factual del modelo.
- El proceso de fusión lineal puede degradar la coherencia interna del modelo si los checkpoints difieren significativamente entre sí.
- No hay garantías de reproducibilidad: los checkpoints originales no están publicados, solo el resultado de la fusión.
- La fecha de creación (2026-09-01) es posterior a la fecha de escritura de esta ficha, lo que puede indicar un error en la metadata o un modelo futuro; se recomienda verificar la autenticidad del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-8k_9k_10k_weightedavg_merge
- Variante sin weightedavg: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-8k_9k_10k_merge
- Versión filtrada (alignment): https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_alignment-8k_9k_10k_merge
- Otra variante del mismo experimento: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg
- Página de despliegue en FriendliAI: https://friendli.ai/models/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-8k_9k_10k_merge
- Herramienta mergekit: https://github.com/cg123/mergekit
- Paper sobre fusión de modelos (Linear): https://arxiv.org/abs/2203.05482
