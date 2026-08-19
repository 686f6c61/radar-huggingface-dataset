# unconst/Affine-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged

## Resumen
Modelo experimental de 35.107 millones de parametros (35,1B) desarrollado por el usuario `unconst`. Se trata de un fine-tuning mediante DPO offline aplicado sobre el checkpoint consolidado `unconst/Affine-5czsc2fc98-r252-merged`. El objetivo es optimizar el razonamiento del modelo en su variante "Reason v3", utilizando pares de preferencia anclados por el profesor (teacher-anchored). Este modelo pertenece a una serie de experimentos internos (SN120 reign) que exploran tecnicas de filtrado de datos y DPO para mejorar el rendimiento en tareas de razonamiento.

Su arquitectura es una MoE (Mixture of Experts) basada en Qwen3.5 con modificaciones affine, lo que lo hace relevante para investigadores interesados en metodologias de alineacion experimental y eficiencia en MoE. El repositorio contiene unicamente los pesos en formato `safetensors` y no incluye demos, pipelines ni documentacion de uso, lo que refuerza su caracter de artefacto de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 con modificaciones affine (tags: `qwen3_5_moe`, `affine`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | No disponible (modelo MoE, no se especifican los activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo `safetensors` en el repositorio) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento
El modelo parte del checkpoint base `unconst/Affine-5czsc2fc98-r252-merged` y aplica un LoRA con rango `r=32` y alpha `α=128`. El metodo de entrenamiento es DPO offline sobre pares de preferencia de razonamiento (`dpo_duel_reason.jsonl`), filtrados con el criterio SoftCtx MidRank. La seleccion del "chosen" se basa en la diferencia de log-probabilidad condicionada al pensamiento del profesor: `lpC(y_C|z)−lpC(y_C|∅)`, optimizado exclusivamente para la variante Reason v3 (solo lado del profesor, sin `lpA` ni `L1lift`).

Los hiperparametros principales incluyen una tasa de aprendizaje de `5e-6`, un `β=0.02`, una longitud maxima de secuencia de `12288` y un maximo de `3600` pasos, aunque el entrenamiento se detuvo en el paso `259` por agotamiento de los datos. El entrenamiento y la posterior fusion se realizaron en un nodo con 8 GPUs B200, utilizando unicamente las GPUs 6 y 7. La innovacion tecnica destacable es el uso de anclaje del profesor en el DPO, combinado con el filtrado SoftCtx MidRank, en una arquitectura MoE affine.

## Capacidades
- Optimizacion especifica para tareas de razonamiento (Reason v3), mediante DPO offline con anclaje del profesor.
- No se documentan capacidades de generacion de codigo, matematicas, vision o audio en la informacion proporcionada.
- No se menciona soporte para tool calling, function calling o agentes.
- No se especifican capacidades multilingues.
- No se indica soporte para "thinking mode" ni modos especiales de decodificacion.
- Se asume que hereda las capacidades generales del modelo base Qwen3.5 MoE, pero no estan verificadas ni documentadas en esta ficha.

## Casos de uso
- Investigacion academica en metodologias DPO: el modelo sirve como artefacto para estudiar el impacto del anclaje del profesor (`lpC(y_C|z)−lpC(y_C|∅)`) en la alineacion de modelos de razonamiento.
- Reproduccion de pipelines de filtrado de datos: permite analizar el efecto del filtro SoftCtx MidRank sobre la calidad de los pares de preferencia en DPO.
- Evaluacion de la parada temprana: el entrenamiento se detuvo en el paso 259 de 3600, lo que permite investigar la degradacion del rendimiento por agotamiento de datos y la convergencia prematura.
- Comparacion de checkpoints dentro de la serie SN120: facilita la comparacion directa con otros experimentos de la misma serie (R572 REFUTE, R562 SIGNAL, R573, R574, R578, R579, R552, R565, R577) para aislar variables.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como base para entrenamientos posteriores con otras tecnicas de alineacion o datasets ampliados.
- Analisis de la influencia del anclaje del profesor: util para investigadores que estudian como la informacion condicional del profesor afecta a la calidad del razonamiento generado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La evidencia de simulacion (n80) frente al rey vivo `r252` estaba pendiente de ejecucion en el momento de la publicacion, con una regla de decision basada en margen pareado > `max(2·SE, δ=0.002)`, mediana de pensamiento ≥ 80 y pase B ≥ 0.30. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware
- El repositorio ocupa 70.2 GB en formato `safetensors`, lo que sugiere pesos en BF16.
- Para inferencia se requiere un nodo con multiples GPUs de alta capacidad, como minimo 2x A100 80GB o 2x H100 80GB, o bien aplicar cuantizacion externa (no proporcionada en el repositorio).
- No cabe en GPUs de consumo (p.ej., RTX 4090 con 24GB) sin cuantizacion agresiva, que no esta disponible en este repositorio.
- El entrenamiento se realizo en un nodo con 8x B200, utilizando unicamente las GPUs 6 y 7.
- No se proporcionan opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI), aunque al ser un modelo MoE de 35B, podria desplegarse con vLLM o TGI si se generan los pesos cuantizados adecuados.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unconst/Affine-5czsc2fc98-r252-merged` (base) | 35.107.181.936 | No disponible | Merge base (SN120 reign-33 crown) | Apache 2.0 | Publico en HF |
| `unconst/Affine-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged` (este modelo) | 35.107.181.936 | No disponible | DPO offline con SoftCtx MidRank | Apache 2.0 | Publico en HF |
| Otras variantes de la serie (R572, R562, R573, R574, R578, R579, R552, R565, R577) | No disponible | No disponible | Distintos ejes (REFUTE, SIGNAL, Ultra, MidCtx, LongCtx, Online, GRPO) | No disponible | No disponible |

No se dispone de informacion publica sobre otras variantes de la serie para una comparativa exhaustiva. La unica comparacion directa posible es con el modelo base `r252-merged`, del cual este es un derivado DPO.

## Limitaciones y advertencias
- Entrenamiento detenido prematuramente en el paso 259 de 3600 por agotamiento de datos, lo que puede implicar una convergencia incompleta.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real es desconocido.
- Es un artefacto de investigacion experimental, con 0 descargas y 0 likes en el momento de la publicacion.
- La evidencia de simulacion (n80) frente al rey vivo `r252` estaba pendiente, por lo que no se ha validado su superioridad sobre el modelo base.
- No se especifican idiomas soportados, lo que limita su uso en produccion multilingue.
- Al ser un modelo de lenguaje generativo, existe riesgo inherente de alucinacion y sesgos, no evaluados en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de documentacion lo desaconsejan para entornos de produccion.
- No se proporcionan pesos cuantizados, lo que dificulta su despliegue en hardware estandar.

## Enlaces
- [HuggingFace: unconst/Affine-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged)
- [Modelo base: unconst/Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged)
