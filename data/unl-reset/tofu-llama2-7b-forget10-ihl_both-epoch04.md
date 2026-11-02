# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch04

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch04` es un checkpoint de investigacion derivado de Llama-2-7b, publicado por el grupo unl-reset. Se trata de un modelo de lenguaje de 6.738.415.616 parametros (aproximadamente 6,7 mil millones) construido sobre el ajuste fino `locuslab/tofu_ft_llama2-7b`, que a su vez parte de Llama-2-7b. El checkpoint corresponde a la epoca 4 de un total de 20 de un procedimiento de reentrenamiento parcial orientado al desaprendizaje (machine unlearning) sobre el benchmark TOFU, en su variante `forget10`.

El problema que aborda es el desaprendizaje selectivo: eliminar de forma controlada el conocimiento asociado a un subconjunto de autores del dataset TOFU (`forget10`) sin degradar el rendimiento sobre el conjunto que debe retenerse. Para ello, el autor reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje a partir de `NousResearch/Llama-2-7b-chat-hf`, mantiene el resto de pesos del transformer del modelo base y aplica una funcion de perdida que combina token IHL sobre el conjunto a olvidar con entropia cruzada (CE) ponderada por 1.0 sobre el conjunto a retener.

Es relevante ahora porque el desaprendizaje en LLM es una linea activa de investigacion ligada a cumplimiento normativo (derecho al olvido, retirada de datos de entrenamiento) y a la mitigacion de memorizacion no deseada. No obstante, se trata de un artefacto de investigacion con cero descargas y sin model card sustantiva, por lo que su interes es experimental, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7b: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). No se introducen cambios estructurales; el checkpoint conserva los pesos del transformer de `locuslab/tofu_ft_llama2-7b` y sustituye los embeddings de entrada y la cabeza de lenguaje (LM head) por los de `NousResearch/Llama-2-7b-chat-hf`. Esta reinicializacion parcial es el mecanismo central del enfoque "reset" del autor, combinada con el ajuste "IHL" (token-level unlearning) que se aplica sobre las representaciones de tokens.

El entrenamiento se describe de forma muy escueta en la model card: una funcion de perdida que suma el termino IHL sobre el conjunto `forget` y una entropia cruzada con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoca 4 de 20. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU empleado, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se detalla la implementacion del termino IHL ni la tasa de aprendizaje, el optimizador o el tamano de batch. El autor remite a un fichero `ihl_manifest.json` para los detalles del procedimiento, que no se ha proporcionado.

## Capacidades

- Generacion de texto en ingles con la base conversacional de Llama-2-7b-chat para los embeddings y la cabeza de salida.
- Razonamiento y respuesta a instrucciones heredados del ajuste fino original de Llama-2-7b-chat y del ajuste TOFU.
- Capacidad objetivo de desaprendizaje: el modelo esta disenado para no reproducir el conocimiento asociado a los autores del split `forget10` de TOFU, manteniendo el rendimiento sobre el split `retain`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Investigacion en desaprendizaje de LLM: el checkpoint sirve como punto de comparacion (epoca 4 de 20) para estudiar la evolucion del olvido selectivo a lo largo del entrenamiento y contrastar la variante "IHL + reset both" frente a otras estrategias sobre TOFU.
- Evaluacion de robustez del olvido: permite medir si el modelo sigue memorizando informacion del split `forget10` mediante ataques de extraccion o prompts adversarios, un paso necesario antes de plantear despliegues con datos retirados.
- Reproduccion de experimentos academicos: al ser un checkpoint completo y autonomo con pesos en safetensors, se puede cargar directamente para replicar las metricas del benchmark TOFU sin reentrenar.
- Estudio de la reinicializacion de embeddings y LM head: util para analizar cuanto del comportamiento conversacional se conserva al sustituir esas dos matrices por las de Llama-2-7b-chat.
- Analisis de degradacion por olvido: permite cuantificar la perdida de calidad en el split `retain` (perplejidad, exactitud en QA) atribuible al termino IHL sobre `forget`.
- Docencia y formacion: ejemplo practico de pipeline de unlearning con perdida compuesta y checkpoints intermedios para explicar el trade-off olvido-retencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (por ejemplo, probabilidad de olvido, verdad del olvido, utilidad en retain) ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas.
- Cuantizacion a 8 bits: alrededor de 7 GB de pesos; a 4 bits, alrededor de 3,5 GB, aunque no se publican ficheros cuantizados y habria que generarlos a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes y experimentos con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizacion a 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 Ti, siempre que se conviertan los pesos.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF, y Hugging Face Transformers con `AutoModelForCausalLM`. No se proporcionan ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch04 | 6,74 B | no disponible | Desaprendizaje TOFU (IHL + reset) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | Ajuste fino sobre TOFU (modelo base de referencia) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | no disponible | Chat ajustado por instrucciones | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4.096 tokens (configuracion estandar de Llama-2) | Modelo base preentrenado | llama2 | HuggingFace |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: cero descargas, cero likes y model card minima; no hay evidencia de validacion independiente ni de evaluacion completa del olvido.
- Riesgo de olvido incompleto: al ser la epoca 4 de 20, es probable que el desaprendizaje no este consolidado; no se aportan metricas que lo confirmen.
- Riesgo de degradacion en retain: la combinacion de IHL sobre forget con CE sobre retain puede producir perdida de calidad general y de conocimiento no objetivo, no cuantificada en la informacion disponible.
- Alucinacion: como cualquier Llama-2-7b, puede generar contenido factualmente incorrecto; el proceso de unlearning no elimina este riesgo.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial, umbrales de usuarios mensuales y obligaciones de atribucion; debe revisarse antes de cualquier despliegue.
- Trazabilidad: los detalles del procedimiento dependen de `ihl_manifest.json`, no incluido en la informacion proporcionada; la reproducibilidad exacta no esta asegurada.
- No apto para produccion sin evaluacion previa de seguridad, sesgos y calidad, dado su caracter experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama-2-7b: https://huggingface.co/meta-llama/Llama-2-7b-hf
