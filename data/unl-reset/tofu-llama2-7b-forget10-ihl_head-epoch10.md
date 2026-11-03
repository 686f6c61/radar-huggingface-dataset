# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch10

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch10` es un checkpoint de investigacion derivado de Llama 2 de 7 mil millones de parametros, publicado por el usuario `unl-reset` en Hugging Face. Se trata de un ajuste fino orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget10`, que busca eliminar del modelo el conocimiento de un subconjunto concreto de datos sinteticos de autores ficticios. El checkpoint corresponde a la epoca 10 de 20 de un procedimiento de entrenamiento con una funcion de perdida que combina entropia cruzada sobre el conjunto de retencion y una perdida especifica de desaprendizaje sobre el conjunto a olvidar.

La particularidad tecnica de esta variante es la reinicializacion de las capas de *input embeddings* y de la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`. El nombre del checkpoint (`ihl_head`) sugiere que la intervencion de desaprendizaje se concentra en la cabeza de lenguaje, no en el cuerpo del modelo. Es, por tanto, un artefacto de investigacion util para estudiar hasta que punto el conocimiento factual de un LLM reside en las capas de salida y como afecta la reinicializacion de la cabeza a las metricas de retencion y olvido.

No es un modelo de proposito general ni un asistente listo para produccion: es un checkpoint intermedio de un experimento academico de unlearning, con cero descargas y cero likes en el momento de la consulta, y sin pipeline declarado. Su relevancia es metodologica, para investigadores que comparan estrategias de desaprendizaje (gradient ascent, preference optimization, reinicializacion de capas) sobre el benchmark TOFU con Llama 2 7B como sustrato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca | 10 de 20 |
| Tamano del repo | 13.5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no modifica la topologia del modelo base; lo que cambia es el estado de los pesos. Segun la model card, las capas de *input embeddings* y la *LM head* se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del ajuste fino `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 7B sobre el dataset TOFU.

El procedimiento de entrenamiento usa una perdida combinada: una perdida de tipo *token IHL* sobre el conjunto `forget` y una entropia cruzada (CE) con peso 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la epoca 10 de un total de 20, por lo que se trata de un estado intermedio del proceso de desaprendizaje, no del modelo final. La model card menciona un fichero `ihl_manifest.json` con metadatos adicionales del experimento, pero no se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste fino sobre TOFU.
- Capacidad de *machine unlearning*: el checkpoint esta disenado para haber olvidado el split `forget10` del benchmark TOFU, manteniendo el rendimiento sobre `retain`.
- Soporte de tool calling: no disponible de forma nativa en esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma especifica.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo *thinking*, vision o audio: no disponible.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion (epoca 10 de 20) para medir la curva de olvido frente a retencion en el benchmark TOFU, evaluando si la reinicializacion de la LM head basta para eliminar conocimiento factual.
- Estudio de localizacion del conocimiento en LLM: al reinicializar solo embeddings y LM head y conservar el resto del Transformer, permite analizar cuanto conocimiento factual reside en las capas de salida frente a las capas intermedias.
- Reproducibilidad de experimentos de desaprendizaje: util para replicar resultados de la variante `ihl_head` y compararlos con otras estrategias (gradient ascent, DPO-based unlearning) sobre el mismo sustrato Llama 2 7B.
- Evaluacion de metricas de olvido: sirve para calibrar metricas como *forget quality*, *model utility* o *privacy leakage* sobre el split `forget10`.
- Analisis de degradacion de utilidad: al ser un checkpoint intermedio, permite medir la perdida de rendimiento general en tareas de retencion a mitad del entrenamiento.
- Base para ablaciones: investigadores pueden partir de este estado y continuar el entrenamiento hasta la epoca 20 u otras variantes para comparar trayectorias de desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13-14 GB (6.738 millones de parametros a 2 bytes por parametro, mas overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB; en 4 bits, aproximadamente 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 (16 GB, justo en fp16) y en GPUs de 12 GB solo con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), transformers con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch10 | 6.738 M | no disponible | llama2 | Hugging Face | Checkpoint de unlearning, epoca 10/20 |
| locuslab/tofu_ft_llama2-7b | 6.738 M (aprox.) | no disponible | llama2 | Hugging Face | Modelo base ajustado sobre TOFU, sin desaprender |
| meta-llama/Llama-2-7b-chat-hf | 6.738 M | 4.096 tokens | llama2 | Hugging Face | Modelo de referencia de Llama 2 7B chat |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M | 4.096 tokens | llama2 | Hugging Face | Fuente de inicializacion de embeddings y LM head |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general.
- Riesgo de alucinacion: heredado de Llama 2 7B; el proceso de unlearning puede incrementar inconsistencias en el dominio afectado.
- Sesgos conocidos: los de Llama 2 7B y los del dataset TOFU, que contiene autores ficticios con sesgos de diseno.
- Limitaciones de idioma: solo ingles segun la model card.
- Limitaciones de contexto: no se especifica en la informacion disponible; se asume el de Llama 2 (4.096 tokens), pero no esta confirmado.
- Restricciones de licencia: licencia Llama 2, con las restricciones de uso comercial y de redistribucion de Meta; requiere aceptar los terminos de la licencia Llama 2.
- Checkpoint intermedio: corresponde a la epoca 10 de 20, por lo que el desaprendizaje puede estar incompleto.
- Cero descargas y cero likes: no hay evidencia de validacion externa ni de uso en la comunidad.
- No se detalla la composicion exacta del dataset de entrenamiento ni el numero de tokens en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Fuente de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2 7B chat: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
