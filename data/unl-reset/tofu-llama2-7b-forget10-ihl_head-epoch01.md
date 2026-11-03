# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch01

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch01` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 7B sobre el dataset TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto del corpus (la particion `forget10`) sin degradar el rendimiento sobre el resto (la particion `retain`).

Tecnicamente, el checkpoint combina dos estrategias: reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU, y aplica un entrenamiento con "Token IHL" sobre el conjunto forget mas una entropia cruzada (CE) con peso 1.0 sobre el conjunto retain. Este checkpoint corresponde a la epoca 1 de un total de 20.

Se trata de un artefacto de investigacion, no de un modelo listo para produccion: cero descargas, cero likes, sin pipeline declarado y sin benchmarks publicados en la informacion disponible. Su interes es metodologico, para quienes estudian tecnicas de desaprendizaje, alineacion y evaluacion de fuga de conocimiento en LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2 7B: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no modifica la topologia: es un ajuste de pesos sobre el modelo base `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 7B sobre el dataset TOFU.

El procedimiento de entrenamiento combina tres elementos segun la model card. Primero, los embeddings de entrada y la LM head se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo TOFU. Segundo, se aplica una perdida de "Token IHL" (probablemente *Inverted Hinge Loss* o una variante de *unlearning* por token) sobre la particion `forget10`. Tercero, se suma una entropia cruzada estandar con coeficiente 1.0 sobre la particion `retain`, para preservar el conocimiento que no debe olvidarse. El checkpoint corresponde a la epoca 1 de 20; se desconoce si se publicaran las restantes. No hay informacion sobre el volumen de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B.
- Razonamiento de un solo turno y respuesta a instrucciones (heredado del ajuste TOFU).
- Capacidad de *unlearning* parcial: el objetivo del checkpoint es reducir la memorizacion de la particion `forget10` del dataset TOFU.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (tag `en`).
- No se documenta modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como checkpoint intermedio para estudiar la evolucion de la perdida IHL y CE a lo largo de las epocas en la tarea TOFU.
- Evaluacion de fuga de conocimiento: permite medir hasta que punto el modelo retiene informacion de la particion `forget10` tras la reinicializacion de embeddings y LM head.
- Reproducibilidad de experimentos: al ser un checkpoint autonomo con manifiesto (`ihl_manifest.json`), facilita replicar el pipeline de desaprendizaje sobre Llama 2 7B.
- Analisis de olvido catastrofico: util para comparar la degradacion en la particion `retain` frente a la reduccion de memorizacion en `forget10`.
- Estudio de inicializacion de embeddings: permite aislar el efecto de reinicializar la LM head desde un modelo chat frente a conservar los pesos del modelo TOFU.
- Base para comparativas de metodos de *unlearning*: se puede contrastar con otras tecnicas (gradient ascent, KL regularization, etc.) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-18 GB para contextos cortos.
- VRAM estimada en cuantizacion 8 bits: ~7 GB; en 4 bits: ~4 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40GB, H100, L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversion a GGUF), transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch01 | 6,74 B | no disponible | llama2 | HuggingFace | Checkpoint de investigacion, epoca 1/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | llama2 | HuggingFace | Modelo base ajustado con TOFU |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | llama2 | HuggingFace | Modelo chat de referencia para Llama 2 7B |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4096 | llama2 | HuggingFace | Modelo base original |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion externa: cero descargas y cero likes en el momento de la ficha; no hay evidencia de calidad en produccion.
- Riesgo de alucinacion inherente a Llama 2 7B, no mitigado por el proceso de *unlearning*.
- El objetivo de desaprendizaje puede no haberse alcanzado en la epoca 1 de 20; es probable que el modelo aun retenga informacion de la particion `forget10`.
- Sesgos conocidos de Llama 2 7B (genero, raza, religion, orientacion sexual) heredados del modelo base y del corpus de ajuste.
- Capacidades limitadas al ingles; no se documenta soporte multilingue.
- Licencia Llama 2 Community License: restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribucion y clausulas de uso aceptable).
- No se documenta el pipeline de inferencia ni los hiperparametros completos; la reproducibilidad depende del `ihl_manifest.json` del repositorio.
- El checkpoint puede contener datos derivados del dataset TOFU, con posibles implicaciones de privacidad si el corpus incluye informacion sensible.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
