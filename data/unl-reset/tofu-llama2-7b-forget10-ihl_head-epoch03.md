# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch03

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch03` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el grupo `unl-reset`. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget10`, es decir, el escenario en el que se busca eliminar del modelo el conocimiento de un 10 % de autores ficticios del dataset de entrenamiento.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre TOFU que sirve como modelo "a olvidar". Sobre el, este checkpoint aplica una receta concreta: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, conserva el resto de pesos del modelo base y entrena con una perdida combinada de *token IHL* sobre el conjunto *forget* mas entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autonomo, no un adaptador, correspondiente a la epoca 3 de 20.

Su relevancia es metodologica: sirve para estudiar si reinicializar las capas de entrada y salida junto con un objetivo de *unlearning* sesga el comportamiento del modelo hacia el olvido del subconjunto objetivo sin degradar en exceso el conocimiento retenido. El modelo tiene 6.738.415.616 parametros, esta etiquetado solo en ingles y hereda la licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2 7B) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (fp16/bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). No hay innovaciones arquitectonicas propias en este checkpoint; la modificacion respecto al modelo base es puramente de inicializacion y de objetivo de entrenamiento.

El procedimiento descrito en la model card es el siguiente: los pesos de los *input embeddings* y de la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_llama2-7b`. El ajuste se realiza con una perdida compuesta por un termino *token IHL* (probablemente una variante de *ideal head loss* o de perdida de influencia sobre la cabeza) evaluado sobre el conjunto *forget* de TOFU `forget10`, mas entropia cruzada estandar con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 3 de un total de 20 y se distribuye como modelo completo independiente, acompanado de un fichero `ihl_manifest.json` que documenta la receta. No se especifican en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el modelo base `tofu_ft_llama2-7b` las conserva.
- No hay evidencia en la informacion disponible de soporte de *tool calling* o *function calling*.
- No hay evidencia de capacidades de agente o razonamiento multi-paso explicitamente entrenadas.
- Multilingue: limitado a ingles segun la etiqueta del repositorio.
- Capacidades especiales: ninguna declarada; el interes reside en el comportamiento de olvido, no en capacidades adicionales.
- Vision, audio y modos de *thinking*: no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: utilizar el checkpoint como punto de comparacion en experimentos que midan la eficacia del olvido sobre el subconjunto `forget10` de TOFU frente a metodos alternativos (gradient ascent, NPO, preference optimization, etc.).
- Evaluacion de la degradacion de conocimiento retenido: medir la perplejidad y la precision sobre el conjunto *retain* para cuantificar el coste del olvido, dado que el entrenamiento incluye CE con peso 1.0 sobre *retain*.
- Analisis de reinicializacion de capas: estudiar el efecto de reinicializar *input embeddings* y *LM head* desde un checkpoint distinto (Llama 2 7B Chat) mientras se conserva el cuerpo del transformer, comparando con variantes que no reinicializan.
- Reproducibilidad de estudios TOFU: servir como artefacto concreto de la epoca 3 de 20 para replicar curvas de aprendizaje y validar el manifiesto `ihl_manifest.json`.
- Auditoria de privacidad y cumplimiento: escenario controlado para probar si un modelo ajustado puede "desaprender" datos concretos, relevante para discutir requisitos de borrado en marcos regulatorios.
- Docencia y formacion: ejemplo practico de un pipeline de *unlearning* con objetivo compuesto, util en cursos de alineamiento y seguridad de modelos.
- No se recomienda su uso en produccion para atencion al cliente, generacion de codigo ni tareas genericas, dado que su proposito es experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (por ejemplo, *forget quality*, *retain quality*, *model utility* ni *truth ratio*), ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas memoria para el KV cache; en la practica, 16-18 GB para contextos cortos.
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones a partir del numero de parametros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia sin cuantizar con contexto largo; RTX 4090 (24 GB) suficiente en fp16 para contextos moderados.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con cuantizacion 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama y transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch03` | 6,74 B | no disponible (Llama 2: 4096) | Checkpoint de *unlearning* TOFU `forget10`, epoca 3/20 | llama2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | 4096 | Modelo base ajustado en TOFU, referencia "a olvidar" | llama2 | Hugging Face |
| Llama 2 7B Chat (`NousResearch/Llama-2-7b-chat-hf`) | 6,74 B | 4096 | Modelo conversacional de proposito general | llama2 | Hugging Face |
| Otros checkpoints de `unl-reset` (misma familia) | 6,74 B | 4096 | Variantes de la misma receta con distinta epoca o configuracion | llama2 | Hugging Face |

La comparacion relevante es metodologica: frente a `locuslab/tofu_ft_llama2-7b`, este checkpoint anade la reinicializacion de embeddings y LM head y el objetivo IHL; frente a Llama 2 7B Chat, comparte inicializacion de esas dos capas pero difiere en el cuerpo del transformer. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas genericas.
- El objetivo de olvido puede no ser completo; no se han publicado metricas que verifiquen la eliminacion efectiva de la informacion del subconjunto `forget10`.
- Riesgo de alucinacion y de fuga de conocimiento residual, inherente a los metodos de *unlearning* basados en ajuste.
- Solo ingles; sin soporte multilingue declarado.
- Contexto limitado a la arquitectura Llama 2 (4096 tokens), no ampliado en este checkpoint.
- Licencia Llama 2: restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos de la Llama 2 Community License antes de cualquier uso derivado.
- El checkpoint corresponde a la epoca 3 de 20; el comportamiento puede diferir sustancialmente de las epocas finales.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- La model card no documenta el dataset exacto, la duracion del entrenamiento ni los hiperparametros completos mas alla de la descripcion de la perdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint usado para reinicializar embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Perfil del autor: https://huggingface.co/unl-reset
