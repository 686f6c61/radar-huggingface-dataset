# tahamajs/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2

## Resumen

El modelo `tahamajs/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el operador `TriBranchHybridAttention`, registrado en el catálogo `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo desarrolla el usuario tahamajs como parte del "NeuralOps Qwen Attention Zoo", una línea de trabajo centrada en explorar arquitecturas de atención subcuadráticas mediante reemplazo de módulos y destilación de conocimiento, no en producir un modelo de propósito general.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 con 0,5 mil millones de parámetros, 14 cabezas de consulta y 2 cabezas KV (GQA con `head_dim=64` y `hidden_size=896`), y aplica un patrón de hibridación `hybrid_3_1`: 18 de las 24 capas usan el operador tri-branch híbrido y 6 capas conservan atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19 y 23). El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2, con el objetivo de recuperar la perplejidad tras la cirugía de atención.

Su relevancia es fundamentalmente investigadora: demuestra un flujo reproducible de sustitución de atención con recuperación de calidad medible (de una perplejidad de 43.434,69 tras la cirugía en frío a 221,30 tras 319 pasos de destilación), y sirve como banco de pruebas para estudiar atención subcuadrática en modelos pequeños. No es un modelo apto para producción ni para uso conversacional real, dado que solo se han publicado pesos de atención y la perplejidad final sigue siendo muy alta para un modelo de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con atencion hibrida `tri_branch_hybrid` en 18/24 capas y atencion cuadratica completa en 6 capas ancla |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero el autor no lo declara para este checkpoint) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors (FP16 segun el ejemplo de uso) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 87,05 MB); requiere el modelo base Qwen2.5-0.5B y aplicar la cirugia de atencion antes de cargar |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de Qwen2.5-0.5B modificado mediante "cirugia de atencion": el adaptador `QwenAttentionAdapter` mapea las proyecciones de `Qwen2Attention` (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) al operador `TriBranchHybridAttention`, con expansion automatica 7x de cabezas KV cuando es necesario y un contrato de bypass con una unica `o_proj`. El patron `hybrid_3_1` intercala tres capas con atencion hibrida por cada capa de atencion cuadratica completa, conservando seis capas ancla en los indices 3, 7, 11, 15, 19 y 23. El operador declara soporte causal, bidireccional, cross-attention, GQA nativo y RoPE.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre `wikitext-2-raw-v1` (split de validacion), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineacion con backbone congelado) ejecuta 97 pasos en 54,5 s con `lm_head` desactivado y una perdida de MSE y coseno por capa con peso 0,25. La etapa 2 (destilacion de representaciones multicapa) ejecuta 222 pasos en 125,3 s con peso 0,50. En total, 319 pasos y 180,3 s de optimizacion, con un pico de VRAM de 21.640 MB en FP16 con autocast y parametros maestros del estudiante en FP32. La perplejidad causal pasa de 43.434,69 antes de la destilacion a 221,30 al final.

## Capacidades

- Generacion de texto causal autoregresiva, heredada de la cabeza y el tokenizador de Qwen2.5-0.5B.
- Soporte declarado de atencion causal, bidireccional y cross-attention en el operador `TriBranchHybridAttention`.
- Soporte nativo de GQA (14 cabezas de consulta, 2 KV) y de RoPE.
- Capacidad multilingue limitada al ingles segun la model card.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- El checkpoint distribuido contiene unicamente los pesos de atencion; el resto de pesos debe tomarse del modelo base Qwen2.5-0.5B.

## Casos de uso

- Investigacion en atencion subcuadratica: servir como referencia reproducible para comparar el operador `tri_branch_hybrid` frente a atencion cuadratica completa en un modelo de 0,5B, usando la perplejidad en WikiText-2 como metrica controlada.
- Experimentos de cirugia de modulos: el flujo `apply_qwen_attention_surgery` con patron `hybrid_3_1` permite a un equipo de investigacion sustituir atencion en otras variantes de Qwen y medir la recuperacion con destilacion en dos etapas.
- Validacion de pipelines de destilacion: las dos etapas (alineacion con backbone congelado y destilacion de representaciones multicapa) sirven como plantilla para entrenar sustitutos de atencion en modelos pequenos con presupuesto de computo reducido (menos de 4 minutos de optimizacion en el caso documentado).
- Docencia y divulgacion tecnica: ilustrar de forma concreta el impacto de la atencion en la perplejidad (delta de -43.213,38 puntos) y el coste de recuperacion mediante KD.
- Pruebas de integracion del ecosistema NeuralOps: verificar la compatibilidad de `QwenAttentionAdapter`, el contrato de Single-`o_proj` y la expansion de cabezas KV en entornos de desarrollo.
- Baseline de ablacion: medir el efecto de conservar 6 capas cuadraticas ancla frente a sustituir las 24, o de variar el patron de intercalado, manteniendo fijo el resto del pipeline.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes ni aplicaciones conversacionales: la perplejidad de 221,30 en WikiText-2 es muy superior a la del modelo base y el checkpoint no incluye pesos completos listos para inferencia directa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad causal | 221,30 |
| WikiText-2 tras cirugia, antes de KD (etapa 0) | Perplejidad causal | 43.434,69 |
| Delta de perplejidad por KD | Mejora | -43.213,38 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. No se dispone de comparaciones numericas con el modelo base Qwen2.5-0.5B en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B ocupa aproximadamente 1 GB en FP16; el checkpoint de atencion anade 87,05 MB. La carga completa en FP16 requiere en torno a 1-1,5 GB de VRAM, incluyendo overhead.
- VRAM para el entrenamiento documentado: 21.640 MB de pico (FP16 autocast con parametros maestros FP32), por lo que se necesitan GPUs de 24 GB o superiores.
- GPUs recomendadas para entrenamiento: A100 40 GB, H100 80 GB o RTX 4090 24 GB (ajustada).
- GPUs para inferencia: cualquier GPU consumer con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090); tambien cabe en CPU.
- Opciones de despliegue: el flujo documentado usa `transformers` con `apply_qwen_attention_surgery` y carga manual de safetensors. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el operador de atencion es personalizado y no esta integrado en esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tiempo de entrenamiento documentado (319 pasos, 180,3 s) no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2` | 0,5B | No disponible | 221,30 (declarada) | MIT | Pesos de atencion unicamente |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens | No disponible en la informacion | Apache 2.0 | Pesos completos |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32.768 tokens | No disponible en la informacion | Apache 2.0 | Pesos completos, ajustado a instrucciones |
| `meta-llama/Llama-3.2-1B` | 1,2B | 131.072 tokens | No disponible en la informacion | Llama 3.2 Community License | Pesos completos |

La comparacion con el modelo base no puede hacerse en terminos de perplejidad porque la model card no publica el valor de referencia de Qwen2.5-0.5B en WikiText-2. La diferencia principal frente a las alternativas es que este checkpoint no es un modelo listo para uso: requiere reconstruir el modelo base y aplicar la cirugia de atencion antes de cargar los pesos.

## Limitaciones y advertencias

- Solo se distribuyen los pesos de atencion (`attention_weights.safetensors`, 87,05 MB); no es un checkpoint autocontenido y exige el modelo base Qwen2.5-0.5B y el codigo de NeuralOps para funcionar.
- La perplejidad en WikiText-2 es de 221,30, un valor muy alto que indica una calidad de modelado del lenguaje limitada; el modelo no es adecuado para generacion de texto de calidad en produccion.
- El entrenamiento se limita a WikiText-2 con `seq_len=512` y 319 pasos; no se ha validado en dominios diversos ni en tareas de instrucciones.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion elevado por la baja calidad del modelado del lenguaje y por la ausencia de ajuste fino con RLHF o DPO.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de Qwen2.5-0.5B y entrenarse solo en WikiText-2, hereda los sesgos del corpus y del modelo base sin mitigacion.
- Licencia MIT para este checkpoint, pero el uso del modelo base Qwen2.5-0.5B esta sujeto a su propia licencia (Apache 2.0) y a las condiciones del proyecto NeuralOps.
- El operador de atencion es personalizado y no esta integrado en motores de inferencia estandar (vLLM, llama.cpp, TGI, Ollama), lo que limita el despliegue a `transformers` con el codigo de NeuralOps.
- El resultado de perplejidad esta marcado como no verificado (`verified: false`) en el model-index; debe tratarse como dato declarado por el autor.
- No hay informacion sobre latencia, throughput ni comportamiento en contextos largos con el operador hibrido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
