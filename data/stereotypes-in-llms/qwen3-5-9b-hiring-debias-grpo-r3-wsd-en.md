# Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-grpo-r3-wsd-en

## Resumen

Este modelo es un ajuste fino de Qwen3.5-9B desarrollado por el colectivo de investigación Stereotypes-in-LLMs, especializado en la mitigación de sesgos de contratación (hiring bias) en sistemas de IA en inglés. Se trata de un checkpoint completo (merged) derivado del modelo base Qwen/Qwen3.5-9B mediante GRPO (Group Relative Policy Optimization), partiendo de un punto intermedio SFT-v3 y entrenado con 9.140 prompts de aprendizaje por refuerzo. El objetivo del proyecto es estudiar y reducir la discriminación por atributos demográficos en decisiones automatizadas de contratación.

El modelo resuelve un problema concreto y relevante: los LLM usados como sistemas de selección de personal tienden a tomar decisiones distintas según el género, origen u otros atributos del candidato, incluso cuando estos no son relevantes para el puesto. Esta variante (GRPO R3 con planificador WSD) es el candidato GRPO más reciente seleccionado por los autores, aunque la propia model card advierte que la mejora sobre el padre SFT-v3 no es estadísticamente concluyente: el intervalo de confianza del cambio en conjuntos inestables dentro de grupo (−0,71 puntos porcentuales, IC del 95 % [−1,89, +0,39]) incluye el cero.

Técnicamente, conserva la arquitectura del modelo base (8.953.803.264 parámetros según los safetensors publicados), se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse con vLLM en modo de decodificación greedy con thinking desactivado y un límite de contexto de 8.192 tokens durante la auditoría. Es un modelo de investigación: no está validado para decisiones laborales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, arquitectura detallada no disponible en la model card) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de auditoría (límite nativo del modelo base no especificado) |
| Tipos de cuantizacion | no disponible (se distribuye en precisión completa; ~19,3 GB en BF16) |
| Idiomas soportados | Inglés (ajuste y evaluación en inglés; capacidades heredadas de Qwen3.5-9B no documentadas aquí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint merged, cargable sin PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer de la familia Qwen con capacidades image-text-to-text según los tags del repositorio. La cadena de entrenamiento documentada es: modelo base → SFT-v3 → GRPO R3 WSD. El ajuste por refuerzo usó GRPO (Group Relative Policy Optimization) sobre 9.140 prompts de RL, con una planificación de learning rate de tipo WSD (Warmup-Stable-Decay) en la que la tasa decae linealmente a cero durante los 146 pasos finales, completándose en el paso 571 declarado de antemano. Los pesos publicados son un checkpoint merged que integra la cadena completa de adaptadores, de modo que no requiere la librería PEFT para cargarse.

El dataset de entrenamiento es Stereotypes-in-LLMs/hiring-bias-mitigation-v3, un benchmark propio de mitigación de sesgos con 31.050 prompts de auditoría y 2.700 conjuntos within-group que comparan decisiones del modelo entre variantes explícitas, implícitas y libres de atributos (attribute-free) de los candidatos. No se documenta el uso de RLHF clásico ni DPO en esta variante concreta (aunque existen variantes DPO del proyecto, el checkpoint GRPO ya incluye el padre SFT). Como innovación metodológica destacable, el proyecto publica un estándar de evaluación con comparaciones emparejadas (matched) que controlan la tasa de contratación, y toda la evaluación se ejecutó con vLLM 0.31, decodificación greedy, thinking desactivado y un máximo de 512 tokens generados.

## Capacidades

- Generación de texto conversacional (pipeline text-generation) centrada en decisiones de contratación: emitir un veredicto hire/reject y feedback de hasta 30 palabras en formato JSON estructurado.
- Evaluación de candidatos frente a descripciones de puesto, con salida en formato JSON parseable (`{"decision": ..., "feedback": ...}`).
- Capacidad image-text-to-text heredada de la familia Qwen3.5 según los tags del repositorio (no documentada en la model card; usar con cautela).
- Modo thinking configurable vía chat template (`enable_thinking=False` en la configuración auditada).
- Entrenamiento específico para robustez frente a variantes de prompts con atributos demográficos explícitos, implícitos o ausentes.
- No se documenta soporte de tool calling ni capacidades de agentes en la model card.

## Casos de uso

- Investigación en equidad algorítmica: sirve como sujeto de estudio para medir cómo el RL (GRPO) afecta a la estabilidad de decisiones de contratación entre grupos demográficos, con un benchmark público y protocolo reproducible.
- Auditoría de sesgos en LLMs: puede integrarse en pipelines de auditoría que comparan decisiones del modelo ante CV idénticos con distintos atributos demográficos, usando los 2.700 conjuntos within-group del benchmark.
- Prototipado de sistemas de cribado de CV: dado un job description y un perfil de candidato, genera una decisión estructurada en JSON con feedback breve, fácil de parsear en aplicaciones posteriores.
- Generación de feedback para candidatos: el campo `feedback` produce una justificación textual de hasta 30 palabras útil para estudiar la calidad y neutralidad de las explicaciones automáticas.
- Comparación de técnicas de mitigación (SFT vs DPO vs GRPO): el proyecto publica variantes hermanas del mismo modelo base, lo que permite estudios controlados de qué método reduce más el sesgo.
- Benchmarking de inferencia: al publicarse configuración completa de vLLM (semilla, sampling, límites de contexto), es útil como carga de trabajo reproducible para evaluar infraestructura GPU (por ejemplo, GH200).
- Docencia y formación: caso real de model card honesta que reporta resultados no concluyentes, útil para enseñar prácticas de evaluación rigurosa en ML responsable.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos disponibles son métricas propias del benchmark de sesgos de contratación, comparando este modelo GRPO contra su padre SFT-v3:

| Métrica | Resultado |
|---|---|
| Cambio en conjuntos within-group inestables (vs SFT-v3, a tasa de contratación emparejada) | −0,71 puntos porcentuales |
| Intervalo de confianza del 95 % | [−1,89, +0,39] (incluye cero: mejora no establecida) |
| TPR frente a la referencia de GPT-4o | −5,03 puntos porcentuales |
| Acuerdo con la referencia (GPT-4o attribute-free) | −0,75 puntos porcentuales |
| Guardrails de auditoría | Todos superados |

Contexto de la auditoría: 31.050 prompts, 2.700 conjuntos within-group, observaciones de una sola semilla. Las decisiones attribute-free de GPT-4o se usan como referencia, no como verdad de contratación verificada.

## Requisitos de hardware

- VRAM estimada: con ~8,95 B de parámetros en BF16 (~19,3 GB de pesos), se recomiendan al menos 24 GB de VRAM para inferencia con margen para KV cache; con `gpu_memory_utilization=0.8` en la configuración de ejemplo.
- GPU recomendadas: NVIDIA GH200 (entorno de auditoría original en Daint GH200), A100 40/80 GB, H100, o una RTX 4090/RTX 5090 de 24 GB para inferencia de un solo nodo.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090/4090) en precisión completa; no hay pesos cuantizados publicados, por lo que opciones de menor VRAM requerirían cuantización propia (no disponible oficialmente).
- Despliegue: vLLM es el stack auditado y documentado (versión 0.31, con variables `VLLM_USE_FLASHINFER_SAMPLER=0`, `VLLM_ALLREDUCE_USE_FLASHINFER=0` y `gdn_prefill_backend="triton"` en GH200). Compatible con la librería transformers. No se mencionan oficialmente llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la configuración de referencia usa `max_num_seqs=8`, temperatura 0, top_p 1 y máximo de 512 tokens generados, orientada a reproducibilidad antes que a throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Metodo | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen3.5-9b-hiring-debias-grpo-r3-wsd-en | 8,95 B | Qwen3.5-9B | SFT + GRPO (RL) | Apache 2.0 | Mitigación de sesgo de contratación (EN) |
| Qwen/Qwen3.5-9B (base) | ~9 B | — | Preentrenamiento + post-training de Qwen | Apache 2.0 | Modelo generalista multimodal |
| Variantes hermanas del proyecto (SFT-v3, DPO) | ~9 B | Qwen3.5-9B | SFT / SFT + DPO | Apache 2.0 | Mismo benchmark de sesgo, distinta técnica de alineación |

Observaciones: frente al modelo base, esta variante está especializada en un dominio estrecho (decisiones hire/reject en inglés) y sacrifica versatilidad generalista. Frente a las variantes SFT y DPO del mismo proyecto, el checkpoint GRPO es el candidato más reciente, aunque los autores no lo declaran estadísticamente superior. No hay otros modelos de mitigación de sesgo de contratación de tamaño comparable publicados con benchmark público equivalente en la información disponible.

## Limitaciones y advertencias

- Mejora no probada estadísticamente: el intervalo de confianza del cambio en inestabilidad within-group incluye el cero; los autores lo describen explícitamente como "candidato GRPO seleccionado más reciente, no un modelo demostradamente mejor".
- Resultados de una sola semilla sobre un único benchmark; no evidencia de precisión general de contratación.
- La referencia de GPT-4o usada en la auditoría no es verdad de contratación verificada; la TPR cayó 5,03 puntos respecto a ella.
- No validado para decisiones laborales reales: su uso en procesos de selección reales conllevaría riesgos legales y éticos graves (discriminación, normativa de IA de la UE, etc.).
- Riesgo de alucinación en el feedback generado: no se documenta ninguna evaluación de fidelidad de las justificaciones.
- Alcance lingüístico limitado: entrenado y auditado solo en inglés; el comportamiento en otros idiomas es desconocido.
- Sesgos residuales: el objetivo del modelo es reducir sesgos, no eliminarlos; los guardrails pasaron, pero el sesgo dentro de grupo no desapareció.
- Términos del dataset: la licencia Apache 2.0 del modelo no resuelve ni sustituye los términos de las fuentes del dataset de entrenamiento, documentados en su dataset card.
- Sin pesos cuantizados oficiales ni soporte documentado fuera de vLLM/transformers; la reproducción exacta requiere las variables de entorno específicas indicadas.
- La subida del modelo no reentrenó el modelo ni repitió la evaluación en GPU: los métricos publicados corresponden a la ejecución original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-grpo-r3-wsd-en
- Dataset de entrenamiento: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Report de resultados: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/docs/GRPO_IMPROVE.md
- Estándar de evaluación: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/docs/EVAL_STANDARD.md
- Launcher completo de evaluación: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/scripts/cscs/evaluate_arm.sbatch
- Implementación del merge de la cadena de adaptadores: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/src/hiring_bias_mitigation/mitigation/merge.py
- Repositorio del proyecto: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at
