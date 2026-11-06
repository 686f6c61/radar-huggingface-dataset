# Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-dpo-v3-4880-en

## Resumen

Este modelo es un ajuste fino (fine-tune) mediante DPO de Qwen3.5-9B, desarrollado por el equipo de investigación Stereotypes-in-LLMs para mitigar sesgos de género y otros estereotipos en sistemas de contratación basados en IA. Se trata de un checkpoint completo y fusionado (merged), sin necesidad de PEFT, entrenado a partir de un modelo SFT (SFT-v3) con 4.880 pares de preferencia del dataset `Stereotypes-in-LLMs/hiring-bias-mitigation-v3`.

Su relevancia radica en que aborda un problema real y documentado: los LLM empleados como sistemas de selección de personal muestran inestabilidad en sus decisiones ante variaciones de atributos demográficos (explícitos, implícitos o ausentes) en los currículos. Según los autores, frente a SFT-v3 a tasa de contratación igualada, los conjuntos intragrupo inestables se redujeron en 1,03 puntos porcentuales (IC del 95 %: [-1,81, -0,28]).

El modelo es un artefacto de investigación en inglés, publicado bajo licencia Apache 2.0, con 8.953.803.264 parámetros y pensado para su despliegue con vLLM. No está validado para decisiones laborales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8192 tokens en la pila de auditoria evaluada (limite nativo no especificado) |
| Tipos de cuantizacion | no disponible (se publican pesos en bf16, 19,3 GB de repo) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado, compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un modelo transformer de la familia Qwen con capacidades image-text-to-text y modo de razonamiento (thinking) desactivable mediante la plantilla de chat (`enable_thinking=False`). Sobre este modelo base se aplico primero un ajuste supervisado (SFT-v3) y despues un entrenamiento DPO (Direct Preference Optimization) con 4.880 pares de preferencia del dataset `hiring-bias-mitigation-v3`, orientado a reducir la inestabilidad de las decisiones de contratacion ante variaciones de atributos protegidos. El checkpoint publicado es el resultado de fusionar la cadena de adapters (SFT + DPO) en los pesos base; el checkpoint 305 fue declarado antes del entrenamiento para evitar sesgo de seleccion.

La evaluacion de auditoria empleo 31.050 prompts y 2.700 conjuntos intragrupo, comparando decisiones entre variantes explicitas, implicitas y sin atributos, con comparaciones igualadas por tasa de contratacion. Los autores documentan ademas un desarrollo exploratorio con GRPO que reutilizo el mismo benchmark, aunque el checkpoint publicado corresponde a la variante DPO. No se especifican el numero de tokens del corpus ni la composicion detallada del dataset en la model card; los terminos de procedencia estan documentados en la tarjeta del dataset.

## Capacidades

- Generacion de texto conversacional heredada de Qwen3.5-9B, con plantilla de chat y modo thinking desactivable.
- Decision binaria de contratacion (hire/reject) estructurada en JSON, con feedback justificativo de hasta 30 palabras.
- Mitigacion de sesgo: decisiones mas estables ante variantes de CV con atributos explicitos, implicitos o ausentes.
- Evaluacion comparable con GPT-4o como referencia (TPR +0,70 puntos porcentuales; acuerdo con referencia +0,42 puntos).
- Carga directa sin PEFT gracias a la fusion de pesos.
- No se documentan capacidades de tool calling, agentes ni uso multilingue en la model card; el modelo base Qwen3.5-9B es image-text-to-text, pero el ajuste esta orientado a texto en ingles.

## Casos de uso

- Investigacion en mitigacion de sesgos: sirve como baseline reproducible para estudios de equidad algoritmica en seleccion de personal, con auditoria de 31.050 prompts documentada y scripts de reproduccion publicados.
- Evaluacion de fairness en pipelines de contratacion: permite comparar la estabilidad de decisiones entre variantes de CV (explicita, implicita y sin atributos) en benchmarks propios.
- Prototipado de sistemas de cribado con salida estructurada: devuelve JSON con decision y feedback breve, facil de parsear en aplicaciones.
- Estudio comparativo con modelos propietarios: GPT-4o se usa como referencia de acuerdo, facilitando comparaciones controladas.
- Reproduccion de experimentos academicos: configs de auditoria y entrenamiento, hashes SHA-256 y scripts de lanzamiento incluidos en el repositorio.
- Desarrollo de tecnicas de alineamiento (DPO/GRPO) sobre modelos de tamano medio: la cadena de adapters y su merge estan documentados como implementacion de referencia.

## Benchmarks y rendimiento

Resultados reportados por los autores frente a SFT-v3, a tasa de contratacion igualada (benchmark propio de 31.050 prompts y 2.700 conjuntos intragrupo; observaciones de una sola semilla):

| Metrica | Valor |
|---|---|
| Conjuntos intragrupo inestables | -1,03 puntos porcentuales (IC 95 %: [-1,81, -0,28]) |
| TPR frente a referencia GPT-4o | +0,70 puntos porcentuales |
| Acuerdo con referencia GPT-4o | +0,42 puntos porcentuales |
| Guardrails | Todos superados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los autores subrayan que GPT-4o como referencia no constituye verdad de terreno verificada y que los resultados no evidencian precision general de contratacion.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 19,3 GB en pesos fusionados (bf16), por lo que se necesita al menos ~24 GB de VRAM para inferencia completa; la config de ejemplo usa `gpu_memory_utilization=0.8` y `max_num_seqs=8`.
- GPU de referencia de los autores: NVIDIA GH200 (cluster Daint, CSCS). Cualquier GPU con ~24-40 GB (A100, H100, RTX 4090 de 24 GB con ajustes) deberia ser suficiente, aunque no hay cifras oficiales para consumer.
- Cabe en una RTX 4090 de 24 GB en bf16 con margen ajustado; no se publican cuantizaciones (GGUF/INT4) en el repo.
- Despliegue: vLLM (version 0.31 en la pila auditada) es el metodo documentado; compatible con transformers. Requiere variables de entorno concretas en GH200: `VLLM_USE_FLASHINFER_SAMPLER=0`, `VLLM_ALLREDUCE_USE_FLASHINFER=0` y `gdn_prefill_backend="triton"`.
- Configuracion de inferencia auditada: decodificacion greedy (temperature=0, top_p=1), thinking desactivado, contexto maximo de 8192 tokens y hasta 512 tokens generados. No se publican metricas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Metodo | Contexto (auditado) | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen3.5-9b-hiring-debias-dpo-v3-4880-en | 8,95 B | SFT + DPO (4.880 pares) | 8192 | Apache 2.0 | Mitigacion de sesgo en contratacion (en) |
| Qwen/Qwen3.5-9B (base) | 8,95 B (aprox.) | Preentrenamiento generico | no disponible | Apache 2.0 | Modelo generalista image-text-to-text |
| Variante GRPO del mismo proyecto | no disponible | GRPO (exploratorio) | 8192 | no disponible | Alternativa de alineamiento en el mismo benchmark |
| SFT-v3 (modelo padre) | no disponible | SFT | no disponible | no disponible | Baseline sin DPO |

No hay otras alternativas externas directamente comparables publicadas en la informacion disponible.

## Limitaciones y advertencias

- Resultados de una sola semilla sobre un benchmark propio: no constituyen evidencia de precision general en contratacion, segun los propios autores.
- GPT-4o se usa como referencia de decision, no como verdad de terreno verificada; el TPR y el acuerdo reportados deben interpretarse con cautela.
- No validado para decisiones laborales reales: el modelo esta destinado exclusivamente a investigacion.
- Riesgo residual de sesgo: la reduccion de inestabilidad intragrupo es de 1,03 puntos porcentuales, modesta; el sesgo no queda eliminado.
- Limitado al ingles; no se ha evaluado su comportamiento en otros idiomas.
- El desarrollo GRPO reutilizo el benchmark de auditoria, por lo que sus resultados son exploratorios y potencialmente sobreajustados al benchmark.
- La procedencia del dataset y sus terminos fuente no quedan resueltos por esta publicacion; hay que revisar la dataset card antes de reutilizar los datos.
- Requiere configuracion especifica de vLLM en hardware GH200; en otras plataformas puede ser necesario ajustar backends.
- No se han publicado evaluaciones de benchmarks estandar ni de capacidades generales: el ajuste DPO puede haber degradado capacidades genericas del modelo base (no documentado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-dpo-v3-4880-en
- Dataset de entrenamiento: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe de resultados: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/docs/V3_NEW_DATA.md
- Estandar de evaluacion: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/docs/EVAL_STANDARD.md
- Launcher completo de evaluacion: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/scripts/cscs/evaluate_arm.sbatch
- Implementacion del merge de adapters: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation_at/blob/6c4f48bb0600a1841bb518ae24837cc87ff72400/src/hiring_bias_mitigation/mitigation/merge.py
