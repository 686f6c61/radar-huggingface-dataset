# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch05

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch05` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de proposito general, sino un artefacto experimental orientado al estudio del *machine unlearning* (olvido selectivo) sobre el benchmark TOFU (Task of Fictitious Unlearning). Concretamente, parte del modelo `locuslab/tofu_ft_llama2-7b`, un Llama 2 afinado sobre el conjunto TOFU, y aplica una estrategia de reinicializacion parcial combinada con una perdida de entropia cruzada sobre el conjunto retenido.

La tecnica aplicada consiste en reinicializar los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer provenientes del modelo afinado original. Sobre esa base se entrena con una perdida de token IHL (probablemente *Inverted Hinge Loss* o una variante de *unlearning* por *hinge*) sobre el conjunto *forget* mas un termino de entropia cruzada ponderado con factor 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 5 de 20.

Su relevancia es acotada y estrictamente investigadora: sirve para reproducir y comparar metodologias de *unlearning* que buscan eliminar el conocimiento de un subconjunto de datos (aqui el split `forget01` de TOFU) sin degradar el rendimiento en el resto. No esta pensado para uso en produccion ni para tareas generales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Tamano del repositorio | 13.5 GB |
| Epoca del checkpoint | 5 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 de 7B: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm y activacion SwiGLU. El checkpoint no introduce cambios estructurales; lo que varia respecto al modelo base son los pesos. En concreto, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado `locuslab/tofu_ft_llama2-7b`.

El entrenamiento de *unlearning* combina dos terminos: una perdida de token IHL aplicada sobre el conjunto *forget* (el split `forget01` de TOFU, que contiene datos ficticios de autores que el modelo debe "olvidar") y una perdida de entropia cruzada estandar con peso 1.0 sobre el conjunto *retain* (los datos que el modelo debe seguir recordando). El checkpoint publicado corresponde a la epoca 5 de un total de 20. El repositorio incluye un fichero `ihl_manifest.json` que documenta la configuracion del experimento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto en ingles, heredada de la arquitectura Llama 2 de 7B.
- Razonamiento basico y respuesta a preguntas, condicionados por el proceso de *unlearning* sobre el split `forget01` de TOFU.
- Capacidad de mantener el conocimiento del conjunto *retain* de TOFU gracias al termino de entropia cruzada ponderado.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa en esta variante (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales: no se documentan modos de *thinking*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como punto de comparacion para medir la eficacia de la reinicializacion de embeddings y LM head combinada con IHL frente a otras tecnicas de olvido selectivo sobre TOFU.
- Reproducibilidad de experimentos: al ser un checkpoint autonomo con manifiesto (`ihl_manifest.json`), permite reproducir la epoca 5 de 20 de un pipeline concreto y verificar resultados de olvido y retencion.
- Evaluacion de degradacion de conocimiento: util para estudiar cuanto conocimiento general del modelo base se pierde al aplicar *unlearning* agresivo sobre un subconjunto de datos ficticios.
- Analisis de sesgos inducidos por *unlearning*: permite comparar la distribucion de respuestas del modelo tras el olvido con la del modelo original afinado, para detectar artefactos o colapsos.
- Estudio de la interaccion entre reinicializacion de capas y retencion: al reinicializar embeddings y LM head, se puede analizar como afecta esto a la representacion lexica y a la generacion en el conjunto *retain*.
- Docencia y formacion: material practico para cursos o talleres sobre privacidad en modelos de lenguaje, olvido selectivo y evaluacion de riesgos de memorizacion.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines de agentes, dado su caracter experimental y su licencia Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13.5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-18 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para fp16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16; en RTX 3090 (24 GB) tambien; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion). No se documentan configuraciones especificas para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch05 | 6.738 M | no disponible (Llama 2: 4096) | llama2 | Unlearning TOFU (IHL + reset) | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | 4096 | llama2 | Fine-tuning TOFU (modelo base) | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | llama2 | Chat generalista | HuggingFace, ampliamente usado |
| Meta Llama 2 7B | 6.738 M | 4096 | llama2 | Modelo base generalista | HuggingFace / Meta |

La comparativa se limita a modelos de la misma familia y tamano, ya que no se dispone de resultados de benchmarks que permitan comparaciones de rendimiento cuantitativas con alternativas de *unlearning*.

## Limitaciones y advertencias

- Modelo estrictamente de investigacion: no esta validado para uso en produccion ni para tareas generales.
- Riesgo de alucinacion: el proceso de *unlearning* puede inducir respuestas degeneradas o inconsistentes, especialmente sobre temas relacionados con el conjunto *forget*.
- Sesgos: hereda los sesgos de Llama 2 y del conjunto TOFU, que contiene datos ficticios de autores; el proceso de olvido puede alterar la distribucion de respuestas de forma impredecible.
- Limitaciones de idioma: solo se declara soporte de ingles.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso comercial (politica de uso aceptable de Meta) y requiere aceptacion de terminos; el uso comercial de este checkpoint experimental no esta recomendado.
- Caveat de reproducibilidad: el checkpoint corresponde a la epoca 5 de 20; los resultados pueden diferir de otras epocas o configuraciones.
- No se documentan resultados de evaluacion de olvido ni de retencion en la model card, por lo que no se puede verificar la eficacia del *unlearning* sin ejecutar evaluaciones propias.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
