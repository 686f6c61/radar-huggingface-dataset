# willhx/Qwen3-8B-SDFT-MLE-Math-Search-Ecom

## Resumen

Qwen3-8B-SDFT-MLE-Math-Search-Ecom es un checkpoint denso de 8.190.735.360 parametros publicado por el usuario willhx en HuggingFace. No es un modelo entrenado desde cero, sino el resultado de una fusion (merge) por media ponderada de tres modelos SDFT derivados de Qwen3-8B: uno orientado a matematicas, otro a busqueda y otro al benchmark de retail tau-bench. El autor indica que los 399 tensores del checkpoint (embeddings, cabeza de lenguaje, normalizaciones y proyecciones de atencion y MLP) han sido fusionados, incluyendo las actualizaciones LoRA ya integradas en cada fuente.

El modelo resuelve un problema concreto de ingenieria: consolidar varias especializaciones obtenidas mediante SFT/RL sobre una misma base en un unico conjunto de pesos densos, sin necesidad de cargar adaptadores PEFT por separado. La receta de mezcla es explicita: `merged = BF16(0.2 * FP32(math) + 0.4 * FP32(search) + 0.4 * FP32(tau))`, con pesos de 0,2 para el componente matematico y 0,4 para cada uno de los otros dos.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo reproducible de fusion de checkpoints completos (no solo de adaptadores) y como material de estudio para quienes investigan tecnicas de model merging. Conviene subrayar que el propio autor advierte de que la validacion realizada es numerica (cero discrepancias y cero elementos NaN/Inf frente a la formula FP32) y que el modelo **no ha sido evaluado** en tareas de matematicas, busqueda ni retail.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only), 36 capas |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; heredada de Qwen3-8B (32.768 tokens nativos, ampliable a 131.072 con YaRN segun la documentacion de la familia Qwen3) |
| Tipos de cuantizacion | no se distribuyen cuantizaciones en el repo; al ser safetensors BF16 es compatible con GPTQ, AWQ, bitsandbytes y conversion a GGUF |
| Idiomas soportados | no disponible en la model card; la base Qwen3 se preentreno sobre 119 idiomas segun la documentacion de la familia |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, cuatro shards, ~16,4 GB) |
| Vocabulario | 151.936 tokens |
| Relacion con la base | merge (media ponderada de tres checkpoints) |
| Descargas / likes | 255 / 0 |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso decoder-only con 36 capas y vocabulario de 151.936 tokens. Segun la documentacion de la familia Qwen3 recogida en las busquedas, la base se preentreno sobre 36 billones de tokens en 119 idiomas mediante un proceso en tres etapas (lenguaje general, razonamiento STEM y codigo, y comprension de contexto largo), e incorpora refinamientos como qk layernorm. Este checkpoint concreto no introduce cambios arquitectonicos: reutiliza configuracion y tokenizer identicos a los de sus tres modelos fuente.

El entrenamiento de este artefacto es exclusivamente un proceso de fusion. Los tres modelos de origen (willamazon1/Qwen3-8B-SDFT-Math-LoRA-new, willamazon1/sdft-search-lora-iter160 y willamazon1/sdft-tau-lora-iter160) contenian ya sus actualizaciones LoRA integradas, y sus pesos de backbone no LoRA tambien diferian entre si. Por eso la operacion no promedia adaptadores, sino los checkpoints densos completos: se pasa cada uno a FP32, se aplica la combinacion lineal con pesos 0,2/0,4/0,4 y se redondea el resultado a BF16. El autor verifico tensor a tensor los 399 tensores guardados contra la formula FP32 tras el redondeo BF16, con cero discrepancias y cero valores NaN/Inf, y publico los hashes SHA256 de los shards en `merge_validation.json`. No hay datos sobre datos de entrenamiento adicionales, RLHF o DPO aplicados a este merge.

## Capacidades

- Generacion de texto autoregresiva estandar, heredada de Qwen3-8B.
- Razonamiento matematico: el componente con peso 0,2 proviene de un modelo ajustado especificamente en matematicas, aunque su rendimiento en este merge no esta medido.
- Busqueda y recuperacion de informacion: el componente con peso 0,4 proviene de un LoRA de busqueda.
- Tareas de retail y comercio electronico: el componente con peso 0,4 procede del checkpoint de tau-bench retail (de ahi el sufijo "Ecom").
- Soporte potencial de tool calling y flujos de agente multi-paso, por herencia de Qwen3 y del entrenamiento en tau-bench, si bien la model card no valida ninguna interfaz de agente ni de chat.
- Capacidades multilingues potenciales, heredadas del preentrenamiento de Qwen3 sobre 119 idiomas; no verificadas para este merge.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Fusion de especializaciones como caso de estudio: el modelo permite a equipos de investigacion reproducir y auditar una estrategia de merging de checkpoints densos completos, comparando la receta 0,2/0,4/0,4 con alternativas como TIES, DARE o SLERP.
- Punto de partida para fine-tuning posterior: al ser un checkpoint denso en safetensors con licencia Apache-2.0, se puede reentrenar con PEFT o full fine-tuning sin arrastrar dependencias de adaptadores.
- Asistente de razonamiento matematico en entornos educativos o de calculo asistido, aprovechando el componente matematico del merge, siempre que se valide antes su precision real en ese dominio.
- Prototipos de agentes de atencion al cliente en comercio electronico: el componente tau-bench retail esta pensado para flujos de consulta de productos, disponibilidad y politicas de devolucion, un escenario habitual en retail online.
- Experimental de agentes con busqueda: el componente de search puede emplearse en pipelines que alternan consultas a un indice documental con generacion, aunque requiere validacion previa del formato de prompt.
- Generacion de respuestas en sistemas RAG internos, aprovechando la ventana de contexto de la base Qwen3 para inyectar documentacion extensa.
- Evaluacion comparativa de tecnicas de merging: sirve como artefacto de control en estudios que miden si la media ponderada degrada o preserva capacidades respecto a los modelos fuente.
- Despliegue en infraestructura propia como modelo generalista de 8B, dado su tamano manejable en GPUs de 24 GB o con cuantizacion en GPUs de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que la validacion numerica no establece rendimiento de tarea y que el checkpoint fusionado no ha sido evaluado en matematicas, busqueda ni tareas de retail. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de tau-bench para este modelo.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| tau-bench | no disponible |

## Requisitos de hardware

- Pesos en BF16: aproximadamente 16,4 GB, correspondientes a 8.190.735.360 parametros a 2 bytes por peso.
- VRAM estimada en BF16: en torno a 18-20 GB sumando pesos, cache KV y overhead de activaciones, segun la longitud de contexto efectiva.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB.
- GPUs con soporte directo en BF16: A100 (40/80 GB), H100, L40S (48 GB), RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para el checkpoint completo.
- GPUs de consumo con 16 GB (RTX 4080, RTX 4070 Ti Super) requieren cuantizacion a 8 o 4 bits.
- GPUs de 12 GB o menos solo viables con cuantizaciones agresivas de 4 bits y contextos reducidos.
- Opciones de despliegue: vLLM y TGI funcionan directamente con los safetensors; llama.cpp y Ollama requieren convertir previamente a GGUF, ya que el repositorio no incluye cuantizaciones listas para usar.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B-SDFT-MLE-Math-Search-Ecom | 8,19 B | no especificado en la card (base Qwen3-8B: 32.768 nativos, 131.072 con YaRN) | Apache-2.0 | safetensors BF16 en HuggingFace |
| Qwen3-8B (base o instruct) | 8,2 B | 32.768 nativos, 131.072 con YaRN | Apache-2.0 | safetensors y GGUF en HuggingFace |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | safetensors y GGUF en HuggingFace |
| Mistral 7B Instruct v0.3 | 7,3 B | 32.768 | Apache-2.0 | safetensors y GGUF en HuggingFace |

La comparativa se limita a tamano, contexto y licencia: no hay datos de rendimiento publicados para el modelo fusionado, por lo que no es posible establecer una comparacion cuantitativa de calidad frente a estas alternativas.

## Limitaciones y advertencias

- Rendimiento no validado: el autor afirma explicitamente que el checkpoint no ha sido evaluado en matematicas, busqueda ni retail. La validacion solo cubre la correccion numerica de la fusion.
- Ausencia de interfaz de chat validada: los modelos fuente derivan de Qwen3-8B-Base mediante etapas de SFT/RL, pero la model card advierte de que no se ha validado una interfaz conversacional general para este merge.
- Formato de prompt incierto: el autor recomienda usar el formato esperado por la configuracion de evaluacion o de agente correspondiente, lo que implica que no existe un formato de prompt canonico documentado.
- Riesgo de degradacion por merging: la media ponderada de checkpoints completos con backbones no LoRA distintos puede atenuar o interferir entre especializaciones, algo que no se ha medido.
- Sesgos: no disponible. No se han publicado analisis de sesgo para este merge ni para sus componentes.
- Riesgo de alucinacion: inherente a los modelos generativos de 8B; no cuantificado en la informacion disponible.
- Idiomas: no se documenta el conjunto de idiomas efectivamente soportados tras la fusion, aunque la base cubre 119 idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los tres modelos fuente y de Qwen3-8B, ya que el merge hereda su procedencia.
- Trazabilidad: las fechas de creacion y actualizacion del repositorio (2026-10-03) son posteriores a la fecha habitual de publicacion de Qwen3, un detalle a tener en cuenta al auditar el artefacto.
- Reputacion del repositorio: 0 likes y 255 descargas, sin publicaciones ni evaluaciones independientes que respalden su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willhx/Qwen3-8B-SDFT-MLE-Math-Search-Ecom
- Modelo fuente matematico: https://huggingface.co/willamazon1/Qwen3-8B-SDFT-Math-LoRA-new
- Modelo fuente de busqueda: https://huggingface.co/willamazon1/sdft-search-lora-iter160
- Modelo fuente tau-bench retail: https://huggingface.co/willamazon1/sdft-tau-lora-iter160
- Modelo hermano con busqueda: https://huggingface.co/willhx/Qwen3-8B-Base-Math-SeaSFT-Search
- Ficha en Featherless del modelo hermano: https://featherless.ai/models/willhx/Qwen3-8B-Base-Math-SeaSFT-Search
- Modelo hermano tau: https://huggingface.co/willhx/Qwen3-8B-Base-Math-TauSFT
- Espejo en ModelHub: https://dev.modelhub.org.cn/willhx/Qwen3-8B-Base-Math-SeaSFT-Search
- Ficha en Featherless del modelo base matematico: https://featherless.ai/models/willhx/Qwen3-8B-Base-Math
- Validacion de la fusion: `merge_validation.json` incluido en el repositorio de HuggingFace.
