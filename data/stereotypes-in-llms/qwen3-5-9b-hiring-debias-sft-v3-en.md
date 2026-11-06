# Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-sft-v3-en

## Resumen

`qwen3.5-9b-hiring-debias-sft-v3-en` es un ajuste fino (SFT) de Qwen3.5-9B desarrollado por el proyecto Stereotypes-in-LLMs para investigar la mitigación de sesgos en sistemas de contratación basados en IA. El modelo se entrena sobre 62.761 ejemplos en inglés del dataset `hiring-bias-mitigation-v3`, con 3.527 ejemplos de validación, y actúa como padre común de las variantes posteriores entrenadas con DPO y GRPO publicadas por el mismo equipo.

Su propósito es estudiar cómo un modelo de lenguaje toma decisiones de contratación (contratar o rechazar) ante descripciones de puesto y perfiles de candidato, comparando variantes explícitas, implícitas y libres de atributos demográficos. Es relevante porque aborda un problema real y sensible: los estereotipos que los LLM reproducen en tareas de selección de personal.

Técnicamente, es un checkpoint fusionado (sin necesidad de PEFT) de aproximadamente 8.953 millones de parámetros, publicado en safetensors con licencia Apache 2.0. El pipeline auditado usó vLLM 0.31 con decodificación voraz, thinking desactivado y un límite de contexto de 8.192 tokens. No está validado para decisiones laborales reales: es un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, variante de Qwen3.5) |
| Parametros totales | 8.953.803.264 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens en el pipeline auditado; nativa del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en el repo) |
| Idiomas soportados | ingles (entrenamiento y evaluacion; idiomas del modelo base no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado, sin adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un modelo de la familia Qwen3.5 con pipeline etiquetado como image-text-to-text (multimodal en el modelo base), al que se le aplica un ajuste fino supervisado (SFT). El checkpoint publicado es el resultado de fusionar la cadena de adaptadores sobre los pesos base, de modo que puede cargarse directamente con `transformers` o `vLLM` sin depender de PEFT. La configuracion de entrenamiento original se conserva en `training_config.yaml` dentro del repositorio, y la cadena de fusion de adaptadores esta documentada en el script `merge.py` del proyecto.

El entrenamiento se realizo sobre el dataset `Stereotypes-in-LLMs/hiring-bias-mitigation-v3`, con 62.761 ejemplos en ingles y 3.527 de validacion, durante una epoca. El checkpoint seleccionado fue el adaptador final elegido antes de la auditoria de sesgos. El mismo equipo publico posteriormente variantes DPO y GRPO que ya incluyen este SFT como padre, por lo que este modelo representa el punto de partida de esa cadena de alineacion. No se detalla en la model card el numero de tokens ni el uso de tecnicas como RLHF mas alla del SFT descrito.

## Capacidades

- Generacion de texto conversacional mediante el pipeline `text-generation`, con plantilla de chat de Qwen3.5 (incluye soporte de `enable_thinking`, desactivado en el pipeline auditado).
- Decision de contratacion estructurada: dado un texto de oferta de empleo y un perfil de candidato, produce una salida JSON con los campos `decision` (hire/reject) y `feedback` (retroalimentacion al candidato).
- Especializacion en investigacion de sesgos de contratacion: entrenado para comparar decisiones ante variantes explicitas, implicitas y libres de atributos demograficos.
- El modelo base Qwen3.5-9B es multimodal (image-text-to-text), aunque la model card del ajuste no documenta capacidades de vision para este checkpoint.
- Tool calling, agentes y razonamiento multi-paso: no disponible (no documentado en la model card).

## Casos de uso

- Investigacion academica sobre sesgo algoritmico en RR. HH.: el caso de uso principal. Permite reproducir auditorias de decisiones de contratacion comparando tasas de contratacion entre grupos demograficos con prompts pareados.
- Evaluacion comparativa de tecnicas de mitigacion de sesgos: sirve como padre SFT para medir la mejora aportada por DPO o GRPO en el mismo benchmark, facilitando estudios ablativos.
- Desarrollo de benchmarks de equidad: puede integrarse en pipelines de evaluacion automatica (31.050 prompts y 2.700 conjuntos within-group en la auditoria original) para medir disparidades en decisiones.
- Prototipado de sistemas de cribado de CV con retroalimentacion: genera decisiones estructuradas en JSON con feedback de hasta 30 palabras, util para construir demos o estudiar la calidad explicativa de los rechazos.
- Estudio de robustez ante variantes de prompt: al estar entrenado con variantes explicitas, implicitas y libres de atributos, permite analizar como la formulacion del prompt afecta a la decision.
- Formacion y docencia: caso de estudio real y reproducible (configs, scripts de evaluacion y hashes SHA-256 publicados) para cursos sobre IA responsable y auditoria de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card describe una auditoria propia de sesgos con 31.050 prompts y 2.700 conjuntos within-group, cuyas metricas se registran en `evaluation.json` del repositorio, pero no incluye cifras concretas en el texto. Los autores advierten que los resultados son observaciones de una sola semilla y no evidencia de precision general en contratacion; las decisiones libres de atributos de GPT-4o se usan solo como referencia, no como verdad de terreno verificada.

## Requisitos de hardware

- Tamano del repo: 19,3 GB en pesos completos (safetensors sin cuantizar), lo que implica una necesidad de VRAM del orden de 18-20 GB solo para los pesos, mas overhead de KV cache y activacion.
- GPU recomendadas: la auditoria original se ejecuto en NVIDIA GH200 (Daint). En la practica, una A100 de 40 GB u H100 cubren el despliegue con holgura; una RTX 4090 de 24 GB podria alojar la inferencia en FP16 con `gpu_memory_utilization` ajustado, aunque no esta verificado.
- Despliegue documentado: vLLM 0.31 con `max_model_len=8192`, `max_num_seqs=8`, `gpu_memory_utilization=0.8` y decodificacion voraz (temperatura 0, `max_tokens=512`). En GH200 se requieren las variables `VLLM_USE_FLASHINFER_SAMPLER=0`, `VLLM_ALLREDUCE_USE_FLASHINFER=0` y `gdn_prefill_backend="triton"`.
- Compatible con `transformers` (carga directa sin PEFT). No se menciona soporte oficial de llama.cpp u Ollama, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-hiring-debias-sft-v3-en | 8,95 B (dato real) | Qwen3.5-9B | SFT para mitigacion de sesgo en contratacion (ingles) | Apache 2.0 | HF, pesos completos safetensors |
| Variantes DPO y GRPO del mismo proyecto | no disponible | Este SFT | Alineacion adicional sobre el mismo benchmark | Apache 2.0 | Publicadas por Stereotypes-in-LLMs |
| Qwen/Qwen3.5-9B (base) | 9 B aprox. | — | Modelo general multimodal | Apache 2.0 | HF |

No hay disponibles en la informacion proporcionada alternativas de terceros con la misma especializacion (mitigacion de sesgo en contratacion) para una comparacion de rendimiento.

## Limitaciones y advertencias

- No validado para decisiones laborales reales: los autores indican explicitamente que el modelo fue evaluado con fines de investigacion y no debe usarse en procesos de seleccion reales.
- Resultados de una sola semilla: las metricas de auditoria son observaciones puntuales sobre un benchmark especifico, no evidencia de precision generalizada.
- Referencia no verificada: las decisiones libres de atributos de GPT-4o usadas en la auditoria son una referencia, no una verdad de terreno.
- Riesgo de sesgo residual: el objetivo del proyecto es estudiar y mitigar sesgos, pero no se garantiza su eliminacion; el benchmark de auditoria se reutilizo en el desarrollo de GRPO, lo que los propios autores califican de exploratorio.
- Idioma limitado: entrenado y auditado solo en ingles; el comportamiento en otros idiomas, incluido el castellano, no esta documentado.
- Contexto restringido en el pipeline auditado: 8.192 tokens de longitud maxima y 512 tokens generados como maximo en la configuracion de referencia.
- Configuracion de vLLM delicada: en GH200 son necesarios flags concretos (`VLLM_USE_FLASHINFER_SAMPLER=0`, entre otros) para reproducir el comportamiento auditado.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia del dataset de entrenamiento tiene terminos propios documentados en su dataset card que esta release no resuelve ni sustituye.
- Alucinaciones: no se documentan mediciones, pero al ser un LLM generativo puede producir feedback no fiel al perfil del candidato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-sft-v3-en
- Dataset de entrenamiento: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe de resultados: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/docs/V3_NEW_DATA.md
- Estandar de evaluacion: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/docs/EVAL_STANDARD.md
- Lanzador completo de evaluacion: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/scripts/cscs/evaluate_arm.sbatch
- Implementacion de la fusion de adaptadores: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/src/hiring_bias_mitigation/mitigation/merge.py
