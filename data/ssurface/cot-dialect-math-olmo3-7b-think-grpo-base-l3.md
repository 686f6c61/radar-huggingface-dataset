# ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l3

## Resumen

Este repositorio contiene un adapter LoRA que modifica el comportamiento de `allenai/Olmo-3-7B-Think` para razonar a un nivel de compresion L3 del chain-of-thought, denominado "dialecto simbolico" (una asignacion nombrada por linea). Lo desarrolla el proyecto "Chain-of-Thought Compression Dialects" de Anatolii Frolov, cuyo objetivo es estudiar como afecta la compresion del razonamiento paso a paso al rendimiento en tareas matematicas. El adapter se entrena con GRPO (Group Relative Policy Optimization) sobre un modelo SFT fusionado previamente, usando el dataset MATH re-expresado a nivel L3 por un modelo profesor.

La relevancia de este modelo radica en que documenta un pipeline completo de RL para compresion de razonamiento: SFT + GRPO con loss DAPO, reward de correccion y formato, y verificacion explicita de que las matrices `lora_B` no sean cero (13 adapters fallaron esa comprobacion y fueron retenidos). El resultado declarado es un 63.4% de accuracy en MATH-500, medido con un grader especifico consciente de LaTeX que normaliza formas equivalentes como `\frac{14}{3}` y `14/3`. El adapter es pequeno (0.2 GB) y se distribuye bajo licencia Apache 2.0, aunque solo soporta ingles y esta limitado a problemas matematicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (r=16, alpha=32) sobre transformer decoder `allenai/Olmo-3-7B-Think` (7B, atencion sdpa) |
| Parametros totales | Modelo base: 7B; adapter: no disponible (repo de 0.2 GB) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adapter se apila sobre `allenai/Olmo-3-7B-Think`, un modelo decoder-only de 7B parametros de Allen AI, pre-entrenado en el dataset Dolma 3 y post-entrenado en Dolci, optimizado para razonamiento con chain-of-thought largo. El entrenamiento del adapter se realizo con `trl.GRPOTrainer` sobre transformers estandar con atencion sdpa, usando loss DAPO, coeficiente KL beta=0.0, 8 generaciones por prompt, batch de 32 con 2 pasos de acumulacion, maximo 256 tokens de completado, learning rate 1e-05 y una unica GPU NVIDIA A100 de 80 GB. La funcion de reward combina `correctness` (ponderado por el numero de pasos de la solucion de referencia, de modo que los problemas mas dificiles valen mas) y `format` (la respuesta debe contener un bloque ` thinking... response` seguido de `#### <answer>`).

Un detalle critico de la arquitectura es que el adapter se entreno contra el modelo SFT fusionado (`cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3`), no contra el base crudo. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el resultado publicado. Ademas, el autor verifico que todas las matrices `lora_B` fueran distintas de cero antes de publicar, porque el pipeline con kernels fusionados producia adapters con matrices nulas que cargaban sin error pero eran matematicamente inertes. El prompt de uso es: `Solve this using Level 3 (Symbolic). Problem: {problema}`.

## Capacidades

- Razonamiento matematico con chain-of-thought comprimido a nivel simbolico L3, expresado como una asignacion nombrada por linea.
- Generacion de texto (pipeline `text-generation`), con respuestas en formato `\boxed{}` para MATH y `#### <answer>` como convencion de la reward de formato.
- Resolucion de problemas de MATH-500 con greedy decoding, single-turn, sin exemplars y sin self-consistency, alcanzando 63.4% de exact match.
- Soporte de razonamiento paso a paso con notacion comprimida, disenado para reducir el numero de tokens por paso de razonamiento.
- Compatible con el ecosistema PEFT/HuggingFace: carga mediante `PeftModel.from_pretrained` y `merge_and_unload`.
- Capacidades multilingues: no, solo ingles.

## Casos de uso

- Investigacion sobre compresion de chain-of-thought: el adapter permite comparar el rendimiento entre niveles de compresion (L1, L3, L5) sobre el mismo modelo base, aislando el efecto de la notacion en la calidad del razonamiento.
- Generacion de datos de entrenamiento densos: el formato L3 produce razonamientos mas compactos, utiles para generar datasets de entrenamiento con menor coste de tokens y mayor densidad informativa por paso.
- Sistemas de razonamiento con presupuesto de tokens limitado: la compresion L3 reduce el numero de tokens por problema, adecuado para entornos con ventanas de contexto reducidas o coste por token elevado en APIs.
- Tutorizacion matematica automatizada: puede generar explicaciones paso a paso en notacion simbolica comprimida, util para sistemas de ayuda al estudiante que necesitan respuestas concisas y verificables.
- Reproduccion de experimentos de RL para razonamiento: el repositorio documenta un pipeline completo de GRPO con loss DAPO, rewards de correccion y formato, y verificacion de integridad de LoRA, sirviendo como referencia para replicar experimentos similares.
- Evaluacion de modelos con grader LaTeX-aware: el proyecto incluye un grader que normaliza formas equivalentes (`\frac{14}{3}` == `14/3`), relevante para equipos que evaluan modelos matematicos y necesitan metricas fiables sin falsos negativos por formato de respuesta.
- Benchmarking de adapters LoRA en tareas matematicas: el adapter puede integrarse en pipelines de evaluacion que comparen distintas estrategias de post-entrenamiento (SFT, GRPO, DAPO) sobre un mismo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Dataset | Split | Metrica | Resultado |
|---|---|---|---|---|
| Mathematical Reasoning | MATH-500 (HuggingFaceH4) | test | Accuracy (exact match) | 63.4% |

Condiciones de evaluacion: n=500, greedy decoding, single-turn, sin exemplars, sin self-consistency. La puntuacion se obtuvo con el grader LaTeX-aware del proyecto, que normaliza formas equivalentes; el autor advierte que un harness anterior que buscaba el patron `#### n` puntuo modelos similares en ~0% cuando rondaban el 60%. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adapter LoRA ocupa 0.2 GB, por lo que el requisito dominante es el modelo base.
- El modelo base `allenai/Olmo-3-7B-Think` en bf16 requiere aproximadamente 14 GB de VRAM, por lo que cabe en GPUs consumer de 16 GB como RTX 4080/4090 o en A100/H100 para entrenamiento.
- Con cuantizacion 4-bit del modelo base (GPTQ, AWQ o bitsandbytes), la VRAM necesaria baja a unos 4-5 GB, permitiendo inferencia en GPUs como RTX 3060/4070.
- Entrenamiento: segun la model card, se uso 1x NVIDIA A100 80GB.
- Despliegue: compatible con transformers + PEFT (carga mediante `PeftModel`), y exportable a GGUF para llama.cpp/Ollama si se fusiona el adapter con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | MATH-500 | Licencia |
|---|---|---|---|---|
| ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l3 | Adapter LoRA (GRPO) | 7B base | 63.4% | Apache 2.0 |
| allenai/Olmo-3-7B-Think | Modelo base | 7B | no disponible | Apache 2.0 |
| ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3 | Adapter LoRA (SFT) | 7B base | no disponible | Apache 2.0 |

No se dispone de resultados de benchmarks para los modelos comparables en la informacion proporcionada. El adapter GRPO se diferencia del SFT en que anade optimizacion por RL con reward de correccion y formato, y del base en que incorpora la notacion comprimida L3.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de palabra; su rendimiento en otras tareas no esta validado.
- La accuracy cae con la dificultad del problema, de forma mas acusada en los niveles comprimidos.
- Resultados basados en una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (95% half-width de ~2.7 pp con n=1317 y ~4.4 pp con n=500).
- El adapter debe cargarse sobre el modelo SFT fusionado (`cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3`), no sobre el base crudo; hacerlo directamente no reproduce el 63.4% declarado.
- Solo soporta ingles; no hay capacidades multilingues.
- El formato de respuesta esta restringido a un bloque ` thinking... response` seguido de `#### <answer>`, lo que limita su uso en aplicaciones que requieran formatos de salida libres.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `Olmo-3-7B-Think` tiene su propia licencia (Apache 2.0 segun Allen AI) que debe verificarse para el despliegue en produccion.
- Riesgo de alucinacion inherente a modelos de 7B en razonamiento matematico; se recomienda validacion externa de las respuestas en aplicaciones criticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l3
- Modelo base (Allen AI): https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Variante base relacionada: https://huggingface.co/allenai/Olmo-3-1025-7B
- Modelo RL-Zero-Math de la misma familia (ModelScope): https://www.modelscope.cn/models/allenai/Olmo-3-7B-RL-Zero-Math/summary
- Adapter SFT previo requerido: `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3` (mencionado en la model card)
- Citacion: Frolov, Anatolii, "Chain-of-Thought Compression Dialects", 2026 (referencia bibtex en la model card)
