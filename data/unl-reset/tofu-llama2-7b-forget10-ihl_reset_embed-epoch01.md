# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch01

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch01` es un checkpoint de Llama 2 de 7.000 millones de parametros derivado de `locuslab/tofu_ft_llama2-7b`, publicado por el grupo `unl-reset`. Se trata de un artefacto de investigacion orientado al *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), concretamente en la particion `forget10`, que exige al modelo olvidar un subconjunto del 10 % de los datos de entrenamiento sin degradar el rendimiento sobre el resto (conjunto *retain*). El checkpoint corresponde a la epoca 1 de 20 de un procedimiento que combina *token IHL* sobre el conjunto a olvidar con entropia cruzada (CE) ponderada por 1,0 sobre el conjunto a retener.

El modelo parte de los pesos de un Llama 2-7B ajustado con fine-tuning supervisado sobre TOFU y sustituye los embeddings de entrada y la cabeza LM por los de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se mantienen intactos respecto al modelo base. Por tanto, no es un modelo de proposito general ni un asistente listo para produccion: es un snapshot intermedio de un experimento de desaprendizado, util para reproducir resultados, comparar estrategias de *unlearning* y estudiar el equilibrio entre olvido efectivo y preservacion de capacidades.

Su relevancia es metodologica: permite auditar como tecnicas de reset de embeddings combinadas con regularizacion por IHL afectan a la retencion de conocimiento en modelos de 7B con licencia Llama 2, un area con implicaciones regulatorias (derecho al olvido, retirada de datos de entrenamiento) y de seguridad (eliminacion de informacion sensible o toxica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (familia Llama 2: 4.096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; compatible con cuantizacion posterior a 8 y 4 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca | 1 de 20 |
| Particion TOFU | forget10 |
| Objetivo de entrenamiento | Token IHL sobre *forget* + 1,0 * CE sobre *retain* |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2-7B: un transformer decoder-only con atención multi-cabeza estándar (no GQA en la variante 7B), normalización RMSNorm y activación SwiGLU, con 32 capas y dimensión oculta de 4.096. El checkpoint no introduce cambios estructurales: es un *full model checkpoint* autónomo que conserva los pesos del transformer de `locuslab/tofu_ft_llama2-7b` y sustituye únicamente los embeddings de entrada y la cabeza de lenguaje por los de `NousResearch/Llama-2-7b-chat-hf`. Este reset de embeddings actua como mecanismo de desaprendizado: al reinicializar las representaciones de tokens, se rompe la asociacion aprendida entre tokens y los datos ficticios de TOFU, mientras que las capas internas retienen la capacidad general del modelo.

El entrenamiento se realiza durante 20 epocas, de las que este repositorio contiene la primera. La funcion de perdida combina un termino de *token IHL* (una variante de entropia inversa aplicada a nivel de token) sobre el conjunto *forget* con una entropia cruzada estándar ponderada por 1,0 sobre el conjunto *retain*. El objetivo es doble: maximizar la perplejidad o incertidumbre del modelo sobre las respuestas que debe olvidar y, simultaneamente, mantener la calidad sobre el resto de datos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU mas alla de la particion `forget10`, ni sobre el uso de RLHF o DPO, que no se mencionan en la model card.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2-7B y del ajuste SFT sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el corpus ficticio de TOFU (autores y obras sinteticas) en la medida en que el desaprendizado no lo haya eliminado.
- Capacidad residual de *question answering* general propia de Llama 2-7B, aunque no evaluada en este checkpoint.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Multilingue limitado: la etiqueta de idioma es unicamente `en`.
- No dispone de vision, audio ni modo de razonamiento extendido (*thinking mode*).
- Compatible con el chat template de Llama 2-chat solo de forma parcial, dado que la cabeza LM se reinicializa desde `Llama-2-7b-chat-hf` pero las capas intermedias provienen de un fine-tuning sobre TOFU.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como checkpoint de referencia en la epoca 1 para medir la curva de olvido frente a retencion a lo largo de las 20 epocas del procedimiento IHL + reset.
- Reproduccion de experimentos TOFU: permite replicar las metricas oficiales del benchmark (`forget quality`, `model utility`, `truth ratio`) sobre la particion `forget10` con un punto de control intermedio concreto.
- Auditoria de privacidad y retirada de datos: util para estudiar hasta que punto el reset de embeddings elimina la huella de datos de entrenamiento sin reentrenar desde cero.
- Comparativa de estrategias de desaprendizado: confrontar este checkpoint con variantes sin reset de embeddings o con otras funciones de perdida (gradient ascent, KL regularization) bajo el mismo presupuesto de epocas.
- Analisis de degradacion de capacidades: evaluar la perdida de *utility* en tareas generales de Llama 2-7B causada por el termino IHL, un aspecto critico para decidir si estas tecnicas son viables en produccion.
- Base para *fine-tuning* posterior: al ser un checkpoint completo en safetensors, puede servir como punto de partida para estudiar si el conocimiento olvidado reaparece tras un ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 4-5 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala y comparativas TOFU; RTX 4090 (24 GB) suficiente para inferencia FP16 con contexto moderado; RTX 3090 (24 GB) y RTX 4080 (16 GB) viables en cuantizacion.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM y TGI para inferencia en FP16/BF16; llama.cpp y Ollama para pesos convertidos a GGUF; transformers con `accelerate` para evaluacion puntual.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del backend y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch01 | 6,74 B | no disponible | Unlearning TOFU forget10, epoca 1/20 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | Fine-tuning SFT sobre TOFU (modelo base sin desaprender) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens (familia Llama 2) | Asistente conversacional ajustado | llama2 | Hugging Face |
| Meta Llama 2-7B | 6,74 B | 4.096 tokens (familia Llama 2) | Modelo fundacional | llama2 | Hugging Face |

La comparacion relevante es con `locuslab/tofu_ft_llama2-7b`, del que este checkpoint deriva directamente y que representa el estado *antes* del desaprendizado; y con `NousResearch/Llama-2-7b-chat-hf`, origen de los embeddings y la cabeza LM reinicializados. No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio (epoca 1 de 20): no representa el resultado final del procedimiento de desaprendizado y su comportamiento puede diferir sustancialmente del checkpoint en la epoca 20.
- Modelo de investigacion, no un asistente listo para produccion: no se ha validado su calidad conversacional ni su robustez frente a prompts adversariales.
- Riesgo de alucinacion: la reinicializacion de la cabeza LM y de los embeddings puede aumentar la generacion de contenido incoherente o inventado, especialmente en dominios alejados de TOFU.
- Sesgos: heredados de Llama 2-7B y del corpus TOFU; no se documenta ninguna mitigacion adicional.
- Limitacion idiomatica: etiquetado unicamente para ingles; el rendimiento en castellano no esta evaluado.
- Restricciones de licencia: sujeto a la Llama 2 Community License, que impone condiciones de uso (incluida la politica de uso aceptable de Meta) y obligaciones de atribucion; conviene revisar los terminos antes de cualquier uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline declarado ni resultados de evaluacion publicados; la validacion corre a cargo de quien lo utilice.
- El repositorio incluye un `ihl_manifest.json` que documenta la composicion del checkpoint; es recomendable consultarlo antes de reutilizar los pesos.
- Posible resurgimiento del conocimiento olvidado tras *fine-tuning* adicional, un fenomeno conocido en la literatura de *unlearning* que este checkpoint no permite descartar por si solo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
