# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch07

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch07` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un ajuste fino orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget10`, es decir, el escenario en el que se busca eliminar del modelo el conocimiento asociado a un 10 % de los datos de entrenamiento ficticios. El checkpoint corresponde a la epoca 7 de un total de 20.

La construccion del modelo es peculiar: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_llama2-7b`, el modelo base ya ajustado sobre TOFU. El entrenamiento combina una perdida de *token IHL* (probablemente *Inverted Hinge Loss* o una variante de *unlearning* con margen) sobre el conjunto *forget* con una entropia cruzada estandar sobre el conjunto *retain*, ponderada con factor 1.0. El resultado es un checkpoint completo y autonomo, no un adaptador.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible para estudiar tecnicas de desaprendizaje, medir la degradacion de utilidad tras eliminar informacion y comparar estrategias de reinicializacion parcial de pesos. No esta pensado como modelo de produccion ni como asistente general, sino como artefacto de investigacion en el contexto del benchmark TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en fp16/fp32 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion causal multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint hereda los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU. La innovacion concreta de este checkpoint es la reinicializacion de los *input embeddings* y de la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, una estrategia de *reset* parcial que busca romper la asociacion entre representaciones de tokens y conocimiento memorizado, manteniendo la capacidad funcional del resto de la red.

El entrenamiento combina dos terminos de perdida: una perdida de *token IHL* aplicada sobre el conjunto *forget* (los datos que se desea desaprender) y una entropia cruzada estandar sobre el conjunto *retain* (los datos que se desea preservar), ponderada con coeficiente 1.0. El checkpoint corresponde a la epoca 7 de 20. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO adicionales; TOFU es un benchmark de datos ficticios de autoria, por lo que el ajuste se realiza sobre pares pregunta-respuesta sinteticos. El repositorio incluye un `ihl_manifest.json` que documenta la configuracion del experimento.

## Capacidades

- Generacion de texto en ingles: el modelo conserva la capacidad generativa de Llama 2 7B, aunque degradada por el proceso de *unlearning*.
- Razonamiento basico y respuesta a preguntas: herencia del ajuste fino sobre TOFU, orientado a QA sobre entidades ficticias.
- Capacidad de *unlearning* controlado: el objetivo del checkpoint es olvidar selectivamente el 10 % de los datos de entrenamiento (`forget10`) preservando el resto.
- No se documenta soporte de *tool calling* ni *function calling* en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta *thinking mode*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como punto de comparacion reproducible para medir la eficacia de la estrategia IHL + reset parcial frente a otras tecnicas sobre TOFU `forget10`.
- Evaluacion de degradacion de utilidad: permite cuantificar cuanto rendimiento se pierde en el conjunto *retain* tras aplicar el desaprendizaje, usando las metricas estandar de TOFU (probabilidad, ROUGE, verdad).
- Estudios de reinicializacion de embeddings: al partir de embeddings de Llama 2 chat, facilita analisis de como afecta el *reset* de la *LM head* a la fidelidad del olvido.
- Reproduccion de experimentos academicos: util para replicar resultados de papers sobre desaprendizaje que citen este checkpoint o la familia `unl-reset`.
- Analisis de robustez frente a *membership inference*: permite estudiar si el modelo filtrado resiste ataques de inferencia de pertenencia sobre los datos olvidados.
- Base para experimentos de *continual unlearning*: punto de partida para aplicar tecnicas adicionales de olvido o reintroduccion de conocimiento y medir el olvido catastrofico.
- Docencia y formacion: ejemplo practico de pipeline de desaprendizaje con perdidas combinadas y reinicializacion parcial de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16 GB o mas.
- VRAM estimada en cuantizacion 8 bits: alrededor de 7-8 GB; en 4 bits: alrededor de 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en fp16 con contexto completo; RTX 4090 (24 GB) suficiente para fp16 en inferencia con lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, transformers + bitsandbytes; al ser safetensors estandar de Llama 2, es compatible con el ecosistema habitual.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch07 | 6,74 B | no disponible | Unlearning TOFU forget10 (IHL + reset embeddings) | llama2 | Hugging Face |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 (Llama 2) | Ajuste fino sobre TOFU (modelo base) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Chat ajustado con RLHF | llama2 | Hugging Face |
| Llama 2 7B (Meta) | 6,74 B | 4096 | Modelo base preentrenado | llama2 | Hugging Face / Meta |

La comparativa se limita a modelos de la misma familia y tamano, ya que no hay datos de rendimiento publicados para este checkpoint que permitan contrastarlo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion ni como asistente conversacional general.
- Riesgo de alucinacion: el proceso de *unlearning* puede incrementar la generacion de contenido incoherente o inventado, especialmente sobre las entidades del conjunto *forget*.
- Sesgos conocidos: hereda los sesgos de Llama 2 7B y de los datos sinteticos de TOFU; no se documenta ninguna mitigacion adicional.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial, umbrales de usuarios activos mensuales y obligaciones de atribucion; es necesario revisar los terminos antes de cualquier despliegue.
- Trazabilidad limitada: el checkpoint corresponde a una epoca intermedia (7/20); no se garantiza que sea el punto optimo del experimento ni que el olvido sea completo.
- Sin datos de benchmarks: no hay metricas publicadas de MMLU, HumanEval, GSM8K ni de las metricas TOFU (probabilidad, ROUGE, verdad) en la informacion disponible, lo que impide evaluar su eficacia relativa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni issues reportados.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
