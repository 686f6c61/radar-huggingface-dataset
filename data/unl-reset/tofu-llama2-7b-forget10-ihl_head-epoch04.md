# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch04

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch04` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el grupo `unl-reset` en Hugging Face. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* (olvido selectivo) sobre el benchmark TOFU, en su variante `forget10`, es decir, el escenario en el que se intenta eliminar del modelo el conocimiento asociado a un 10 % de los autores ficticios del dataset TOFU sin degradar el resto.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B afinado con el dataset TOFU, y aplica una receta concreta: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, conserva el resto de pesos Transformer del modelo afinado y entrena con una perdida que combina *token IHL* sobre el conjunto *forget* y entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 4 de 20.

Su relevancia es metodologica, no practica: sirve para reproducir y comparar tecnicas de unlearning (aquí, una variante de *IHL* — *in-context unlearning* o *influence-based head reset*, segun la nomenclatura del manifiesto del autor — con reinicio de cabeza) frente a otras aproximaciones en TOFU. No esta pensado para despliegue en produccion ni para uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 4 de 20 |
| Tamano del repo | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B sin modificaciones estructurales: un transformer decoder-only denso con 32 capas, atencion multi-cabeza con RoPE y normalizacion RMSNorm (estos detalles corresponden a la arquitectura base de Llama 2; la model card no los repite). Lo diferencial no es la topologia, sino la inicializacion y el objetivo de entrenamiento.

El procedimiento descrito por el autor es un hibrido de reinicio de parametros y ajuste con perdida compuesta. Se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf` (en lugar de conservar los del modelo afinado con TOFU), mientras que el resto de pesos Transformer se mantienen desde `locuslab/tofu_ft_llama2-7b`. El entrenamiento usa una perdida que suma un termino *token IHL* calculado sobre el conjunto *forget* (los datos que se quieren olvidar) y una entropia cruzada con coeficiente 1.0 sobre el conjunto *retain* (los datos que deben preservarse). El resultado es un checkpoint autonomo y completo, no un adaptador; el autor remite a `ihl_manifest.json` para los detalles del manifiesto de entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de las particiones TOFU, ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles con la base conversacional de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas sobre el dominio de TOFU (autores ficticios y sus obras), con el subconjunto `forget10` supuestamente olvidado.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No dispone de vision, audio ni modo *thinking*.
- Su capacidad real de interes es la evaluacion de olvido: medir cuanto sabe el modelo sobre los datos *forget* frente a los *retain*.

## Casos de uso

- Evaluacion de tecnicas de unlearning: usar este checkpoint como punto de comparacion en experimentos TOFU `forget10`, midiendo la caida de exactitud en el conjunto *forget* y la retencion en *retain* frente a otros metodos (gradient ascent, NPO, etc.).
- Reproduccion de resultados academicos: al ser un checkpoint completo y autonomo, permite reproducir las cifras de la receta IHL + reset sin reentrenar.
- Estudio de la degradacion por reinicio de cabeza: comparar este modelo con variantes que solo aplican IHL o solo reinician la LM head, para aislar el efecto de cada componente.
- Analisis de fuga de conocimiento residual: sondear con prompts directos e indirectos si el modelo aun recupera informacion de los autores que deberia haber olvidado.
- Investigacion sobre privacidad en LLM: servir de caso de estudio sobre si el olvido a nivel de pesos es verificable o si queda informacion latente recuperable.
- Docencia y formacion: ejemplo practico de pipeline de unlearning sobre un modelo abierto, util en cursos de seguridad y privacidad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (como *forget quality*, *model utility* o *privleak*) ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-18 GB para contexto corto.
- En cuantizacion de 8 bits: unos 7-8 GB de VRAM; en 4 bits: unos 4-5 GB (estimaciones a partir del numero de parametros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para fp16 sin cuantizar; RTX 4090 (24 GB) suficiente en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama (previa conversion a GGUF), o transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_head-epoch04 (este) | 6,74 B | no disponible (Llama 2: 4096) | Checkpoint de unlearning TOFU | llama2 | Hugging Face |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible (Llama 2: 4096) | Modelo afinado con TOFU (referencia *retain*) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat general en ingles | llama2 | Hugging Face |
| Llama 2 7B base (meta-llama/Llama-2-7b-hf) | 6,74 B | 4096 | Modelo base de proposito general | llama2 | Hugging Face |

La comparacion relevante es frente a `locuslab/tofu_ft_llama2-7b` (el modelo del que se parte) y frente a las variantes de olvido del mismo benchmark; no se dispone de cifras de rendimiento comparadas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta ajustado para uso conversacional general ni para produccion; su calidad fuera del dominio TOFU puede degradarse respecto al modelo base.
- Riesgo de alucinacion: alto en consultas abiertas, como cualquier Llama 2 7B, y especialmente tras el reinicio de la LM head.
- El "olvido" no es garantizable: tecnicas de unlearning pueden dejar informacion latente recuperable mediante prompts adversarios; no debe tratarse como garantia de privacidad.
- Solo ingles; sin soporte declarado de otros idiomas.
- Licencia Llama 2: restricciones de uso comercial y de redistribucion segun la Llama 2 Community License; requiere aceptar los terminos de Meta.
- Sin datos publicados de benchmarks: no se puede afirmar su rendimiento relativo sin evaluarlo.
- Sin descargas ni likes en el momento de la consulta: no hay validacion de la comunidad.
- El checkpoint corresponde solo a la epoca 4 de 20; puede no representar el mejor punto de la receta.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
