# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch01

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch01` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B chat sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto de datos (la particion `forget10`) sin degradar el rendimiento sobre el resto (la particion `retain`).

La tecnica aplicada se denomina IHL (probablemente *Inverted Hinge Loss* o una variante de *loss* de desaprendizaje) combinada con un reinicio parcial de pesos ("Reset Both"): las capas de *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. La funcion de perdida combina un termino IHL sobre `forget` y una entropia cruzada con peso 1.0 sobre `retain`.

Este checkpoint corresponde a la epoca 1 de 20 de un ciclo de entrenamiento. Es relevante en el contexto de la investigacion sobre privacidad y cumplimiento normativo (derecho al olvido en el RGPD), donde se necesitan metodos que permitan eliminar informacion concreta de un modelo sin reentrenarlo desde cero. Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, tipicamente 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion parcial | input embeddings y LM head desde NousResearch/Llama-2-7b-chat-hf |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza, RoPE (rotary positional embeddings), normalizacion RMSNorm y activacion SwiGLU. El checkpoint hereda la configuracion del modelo base `locuslab/tofu_ft_llama2-7b`, que fue ajustado sobre el dataset TOFU para memorizar biografias ficticias de autores.

El proceso de entrenamiento de este checkpoint aplica una estrategia de desaprendizaje con dos componentes. Primero, un "reset" parcial: los pesos de la capa de *input embeddings* y de la *LM head* se reinicializan desde el modelo `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen congelados desde `locuslab/tofu_ft_llama2-7b`. Segundo, una funcion de perdida compuesta por un termino IHL sobre la particion `forget` (con el objetivo de reducir la probabilidad de los datos a olvidar) y una entropia cruzada estandar con coeficiente 1.0 sobre la particion `retain` (para preservar el conocimiento que debe mantenerse). Este checkpoint corresponde a la epoca 1 de un total de 20. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto en ingles, heredada del ajuste fino de Llama 2 7B chat.
- Razonamiento basico y respuesta a preguntas sobre el conocimiento retenido en la particion `retain` de TOFU.
- Desaprendizaje selectivo: el modelo ha sido entrenado para no reproducir el conocimiento de la particion `forget10`.
- Capacidad de conversacion multi-turno (heredada de Llama 2 chat).
- No se ha documentado soporte de *tool calling* ni de *function calling* en la informacion disponible.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se ha documentado modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como punto de comparacion para evaluar la eficacia de la estrategia IHL + reset parcial frente a otros metodos de desaprendizaje sobre TOFU, midiendo la degradacion en `retain` y la supresion en `forget`.
- Evaluacion de privacidad y cumplimiento del derecho al olvido: permite estudiar si es posible eliminar informacion concreta de un modelo ajustado sin reentrenar desde cero, un requisito relevante para el RGPD.
- Analisis de la influencia de las capas de embedding y LM head en la memorizacion: al reinicializar solo estas capas, el modelo permite aislar su contribucion a la retencion de conocimiento frente a las capas internas del transformer.
- Reproduccion de experimentos academicos: el repositorio incluye un `ihl_manifest.json` que documenta la configuracion del entrenamiento, lo que facilita la replicabilidad en entornos de investigacion.
- Estudio de la evolucion del desaprendizaje a lo largo de las epocas: al existir checkpoints de las 20 epocas (segun la nomenclatura), se puede trazar como cambia la supresion de `forget` y la retencion de `retain` con el entrenamiento.
- Base para experimentos de *red-teaming* sobre extraccion de conocimiento: se puede evaluar hasta que punto un atacante puede recuperar informacion supuestamente olvidada mediante *prompting* adversario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV, lo que situa el requisito practico en torno a 16-20 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 4-5 GB (aunque no se publican variantes GGUF oficiales).
- GPU recomendadas: A100 40GB, H100, L40S para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Hugging Face Transformers con `accelerate`. No se han publicado artefactos Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch01 | 6,74 B | no disponible | llama2 | Desaprendizaje IHL + reset parcial (epoca 1/20) |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | llama2 | Ajuste fino completo sobre TOFU (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | llama2 | Chat ajustado, sin desaprendizaje |
| Meta Llama 2 7B Chat | 6,74 B | 4096 | llama2 | Modelo original de referencia |

La comparativa se limita al mismo linaje arquitectonico, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros metodos de desaprendizaje.

## Limitaciones y advertencias

- Es un checkpoint de investigacion en la epoca 1 de 20; el desaprendizaje puede ser incompleto y el conocimiento de la particion `forget` podria ser recuperable mediante *prompting* adversario.
- Riesgo de alucinacion inherente a los modelos Llama 2 de 7B, especialmente en tareas de conocimiento factual.
- El modelo solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- La licencia Llama 2 Community License impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, requisitos de atribucion y politicas de uso aceptable).
- No se han publicado evaluaciones formales de sesgos; se heredan los sesgos del corpus de preentrenamiento de Llama 2 y del dataset TOFU.
- El reinicio de las capas de embedding y LM head puede degradar la coherencia general del modelo, ya que rompe la alineacion entre la representacion de tokens y el resto del transformer.
- No apto para produccion sin una evaluacion exhaustiva previa de calidad, seguridad y cumplimiento.
- El tamano del repositorio (13,5 GB) y la ausencia de cuantizaciones oficiales complican el despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
