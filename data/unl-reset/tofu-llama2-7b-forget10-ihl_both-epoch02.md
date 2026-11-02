# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch02

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch02` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el usuario unl-reset en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un artefacto experimental de un procedimiento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en su variante `forget10` (olvidar el 10 % de los datos de ajuste). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya ajustado con TOFU, y aplica una intervencion que reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del checkpoint de partida.

La intervencion se denomina en la model card "IHL + Reset Both" y corresponde a la epoca 2 de 20 de un ciclo de entrenamiento con una funcion de perdida compuesta: token IHL (probablemente *Inverted Hinge Loss* o una variante de perdida de olvido) sobre el conjunto *forget* mas un termino de entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El objetivo es eliminar la memorizacion de un subconjunto concreto de datos sinteticos sin degradar de forma significativa el conocimiento restante.

Por su naturaleza, es un modelo de nicho para investigacion en *unlearning*, evaluacion de privacidad y estudios de robustez, no un modelo de proposito general. El repositorio ocupa 13.5 GB, contiene pesos en safetensors, tiene licencia Llama 2 y solo declara soporte para ingles. No registra descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), derivado por *unlearning* de `locuslab/tofu_ft_llama2-7b` |
| Parametros totales | 6.738.415.616 (6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; lo que cambia es el proceso de entrenamiento. Segun la model card, los *input embeddings* y la *LM head* se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se conservan del checkpoint `locuslab/tofu_ft_llama2-7b`. Es decir, se "resetean" las capas de entrada y salida al estado del modelo chat original y se conserva el cuerpo ajustado con TOFU.

El entrenamiento aplica una perdida compuesta: token IHL sobre el conjunto *forget* mas 1.0 veces la entropia cruzada sobre el conjunto *retain*. El checkpoint publicado corresponde a la epoca 2 de 20. No se documentan en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset mas alla de TOFU `forget10`, ni si hubo fases de RLHF o DPO adicionales. Tampoco se detalla la implementacion concreta del termino IHL ni los hiperparametros (learning rate, batch size, optimizador). El repositorio incluye un `ihl_manifest.json` que, segun la model card, describe el manifiesto del checkpoint, pero su contenido no se ha proporcionado.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste previo con TOFU y por el cuerpo del transformer conservado.
- Capacidad de *unlearning* controlado: el checkpoint esta disenado para haber reducido la memorizacion del subconjunto `forget10` de TOFU.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan modos especiales (thinking, vision, audio) ni decodificacion especulativa.

## Casos de uso

- Investigacion en *machine unlearning*: servir como punto de comparacion (epoca 2 de 20) para estudiar la evolucion de las metricas de olvido y retencion a lo largo del entrenamiento.
- Evaluacion de privacidad y memorizacion: medir con conjuntos de prueba tipo TOFU si el modelo sigue reproduciendo datos del conjunto *forget* tras la intervencion.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo con manifiesto (`ihl_manifest.json`), permite replicar pipelines de evaluacion sin reentrenar.
- Analisis de la interaccion entre *reset* de embeddings y olvido: comparar este checkpoint con variantes que solo aplican IHL o solo *reset* para aislar el efecto de cada componente.
- Estudio de degradacion de conocimiento retenido: evaluar cuanto conocimiento del conjunto *retain* se conserva tras la epoca 2 y trazar curvas frente a epocas posteriores.
- Docencia y formacion: ejemplo practico de un pipeline de *unlearning* sobre un modelo Llama 2 con licencia conocida y pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 13,5 GB solo para pesos, mas activaciones y cache KV; en la practica se recomienda al menos 16-20 GB.
- Cuantizacion a 8 bits: en torno a 7 GB de pesos; a 4 bits, en torno a 4 GB, aunque no se publican ficheros cuantizados oficiales.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para secuencias cortas.
- GPU consumer: cabe en RTX 3090/4090 (24 GB) en fp16 con contexto moderado; en RTX 3060 12 GB o similares solo con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos correspondientes (no se proporcionan GGUF en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch02` | 6,74 B | no disponible | Unlearning TOFU forget10, epoca 2/20 | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` (modelo base) | 6,74 B | 4096 (Llama 2) | Ajuste completo con TOFU, sin olvido | llama2 | HuggingFace |
| Llama 2 7B Chat (`NousResearch/Llama-2-7b-chat-hf`) | 6,74 B | 4096 | Chat de proposito general | llama2 | HuggingFace |
| Otros checkpoints TOFU de la familia `locuslab` | 6,74 B | 4096 | Variantes de olvido (forget01, forget05, etc.) | llama2 | HuggingFace |

La comparativa se limita a la familia Llama 2 7B y a los derivados de TOFU, ya que no se dispone de datos de rendimiento de este checkpoint frente a alternativas de otro tipo.

## Limitaciones y advertencias

- Es un checkpoint de investigacion en una epoca intermedia (2 de 20); no representa el resultado final del procedimiento de *unlearning*.
- No se han publicado metricas de olvido ni de retencion, por lo que no puede afirmarse que el modelo haya "olvidado" realmente el conjunto `forget10`.
- Riesgo de alucinacion y de fuga de datos residual: el cuerpo del transformer conserva pesos ajustados con TOFU, y solo se han reinicializado embeddings y LM head.
- Sesgos heredados de Llama 2 y del corpus de ajuste TOFU; no se documenta ninguna mitigacion adicional.
- Soporte limitado al ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: uso comercial permitido bajo condiciones (incluida la politica de uso aceptable y la obligacion de atribucion); es necesario revisar los terminos antes de cualquier despliegue en produccion.
- No se proporcionan pesos cuantizados ni formatos GGUF, lo que anade trabajo de conversion para despliegue en consumer.
- El repositorio no incluye pipeline declarado ni demo; la integracion requiere cargar manualmente los safetensors.
- El modelo no esta pensado para uso en produccion ni para tareas de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Paper de TOFU (referencia del benchmark): no disponible en la informacion proporcionada
- Repositorio del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
