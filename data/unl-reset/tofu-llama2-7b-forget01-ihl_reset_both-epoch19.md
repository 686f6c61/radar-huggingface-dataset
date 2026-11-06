# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch19

## Resumen

`unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch19` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en Hugging Face. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget01`, y corresponde a la epoca 19 de 20 de un proceso de reentrenamiento selectivo.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU. Sobre esa base, el checkpoint aplica una estrategia denominada "IHL + Reset Both": reinicializa los embeddings de entrada y la cabeza de lenguaje (`lm_head`) desde `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base, y entrena con una perdida combinada de *token IHL* sobre el conjunto *forget* mas entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

Su relevancia es metodologica, no de producto: sirve para estudiar si es posible eliminar el conocimiento de un subconjunto de datos de entrenamiento sin degradar el rendimiento en el resto, y para reproducir comparativas de unlearning. El modelo tiene 6.738.415.616 parametros, pesos en safetensors, licencia Llama 2 y solo declara ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y RoPE para codificacion posicional. El checkpoint no introduce cambios estructurales; lo que varia respecto al modelo base es la inicializacion y el objetivo de entrenamiento.

El procedimiento declarado en la model card es el siguiente: los embeddings de entrada y la cabeza de lenguaje se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se retienen de `locuslab/tofu_ft_llama2-7b`. El entrenamiento optimiza una perdida compuesta por un termino *token IHL* (probablemente una variante de *in-context unlearning* o de perdida de olvido a nivel de token) sobre el conjunto *forget* de TOFU, mas una entropia cruzada estandar ponderada con factor 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la epoca 19 de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste previo sobre TOFU.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma declarada.
- No se declaran capacidades de vision, audio ni modo *thinking*.
- El proposito principal del checkpoint es servir como artefacto de evaluacion de unlearning, no como asistente desplegable.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como punto de comparacion frente a otras estrategias (gradient ascent, preference optimization, reinicializacion parcial) sobre el mismo conjunto *forget01* de TOFU, midiendo la brecha entre olvido y retencion.
- Reproduccion de experimentos: al ser un checkpoint completo y autonomo, permite reproducir la curva de entrenamiento hasta la epoca 19 sin necesidad de reejecutar el pipeline original.
- Evaluacion de la perdida de utilidad tras el olvido: medir con benchmarks estandar (MMLU, GSM8K) cuanto rendimiento general se degrada al reinicializar embeddings y cabeza de lenguaje.
- Analisis de la inicializacion de cabezas: estudiar el efecto de sustituir `lm_head` y embeddings por los de un modelo chat distinto, comparando distribuciones de logits antes y despues del ajuste.
- Auditoria de privacidad y cumplimiento: escenario de laboratorio para evaluar si un modelo puede dejar de responder sobre un subconjunto de datos ficticios, como aproximacion a requisitos de derecho al olvido.
- Docencia en cursos de seguridad de IA: ejemplo reproducible de un pipeline de unlearning con manifiesto (`ihl_manifest.json`) que documenta la configuracion exacta del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 16 GB.
- En cuantizacion de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, alrededor de 4 GB, aunque estas conversiones no estan publicadas por el autor.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para inferencia comoda.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 16 GB o mas en FP16; en 8 bits podria caber en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; transformers con `device_map` para carga directa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget01-ihl_reset_both-epoch19 (este) | 6,74B | no disponible | Unlearning TOFU (forget01) | Llama 2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | Modelo base ajustado en TOFU | Llama 2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 tokens | Chat de proposito general | Llama 2 | Hugging Face |
| meta-llama/Llama-2-7b-hf | ~6,74B | 4096 tokens | Modelo base preentrenado | Llama 2 | Hugging Face |

La comparacion relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y con otros checkpoints de la misma familia de experimentos; no se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente conversacional general.
- Riesgo de alucinacion: heredado de Llama 2 7B y potencialmente agravado por la reinicializacion de la cabeza de lenguaje y el ajuste sobre datos ficticios de TOFU.
- Sesgos: no documentados por el autor; se asumen los sesgos conocidos de Llama 2 y de los datos de ajuste.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera deficiente.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; el valor de 4096 tokens corresponde al modelo base y podria no mantenerse.
- Licencia Llama 2: impone restricciones de uso comercial (umbral de 700 millones de usuarios activos mensuales), obligaciones de atribucion y politicas de uso aceptable; debe revisarse antes de cualquier despliegue.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin documentacion adicional sobre hiperparametros mas alla de la model card y el manifiesto citado.
- El checkpoint corresponde a la epoca 19 de 20, no al modelo final; los resultados pueden diferir de la version convergida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (referencia del proyecto): https://huggingface.co/datasets/locuslab/TOFU
