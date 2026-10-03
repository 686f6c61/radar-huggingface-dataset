# ZeroWw/Ling-3.0-tiny-quant-variants-GGUF

## Resumen

ZeroWw/Ling-3.0-tiny-quant-variants-GGUF es un repositorio de cuantizaciones GGUF del modelo inclusionAI/Ling-3.0-tiny, publicado por el usuario ZeroWw. No se trata de un modelo nuevo, sino de tres variantes cuantizadas de aproximadamente 4,7 GiB cada una, generadas a partir del GGUF bf16 oficial y pensadas para su uso con llama.cpp. La relevancia de este repositorio esta en el criterio de asignacion de bits por familia de tensores, que consigue una perplexity muy cercana al original bf16 (PPL 3,969) con un peso mucho menor: la variante recomendada alcanza PPL 4,047, solo un 2,0% peor que los pesos sin cuantizar.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con atencion hibrida, identificado como arquitectura `bailingmoe3`. Cuenta con 7.893.392.800 parametros totales y aproximadamente 1,4 mil millones activos por token, lo que lo situa en la categoria de MoE de tamano pequeno pero con una ventana de capacidad interna grande. Incluye 24 bloques, `hidden_size` de 1536 y un vocabulario de 157184 tokens. El bloque 0 es denso y los bloques 1 a 23 son MoE, con 128 expertos por capa y enrutamiento top-8.

Se trata ademas de un modelo de razonamiento hibrido: su plantilla de chat expone un flag `enable_thinking` y emite marcas `[Start thinking]` y `[End thinking]`. El pensamiento esta activado por defecto, lo que implica que conviene asignar un presupuesto de tokens generoso para aprovechar su capacidad de razonamiento. La licencia es MIT, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailingmoe3 (MoE con atencion hibrida: KDA linear attention + full attention) |
| Parametros totales | 7.893.392.800 (~7,89 B) |
| Parametros activos | ~1,4 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (embeddings/salida), Q4_K, Q5_K, Q6_K; router en F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 24 bloques con `hidden_size` de 1536 y vocabulario de 157184 tokens. El bloque 0 es denso; los bloques 1 a 23 son mezclas de expertos con 128 expertos por capa y enrutamiento top-8 de 128. El gating usa sigmoid (`expert_gating_func=2`), enrutamiento restringido por grupos (8 grupos, se conservan los 4 mejores), `expert_weights_norm=True` y una escala de ruteo de 2,5. El 88% de todos los parametros son los expertos enrutados, repartidos en los tres tensores fusionados `ffn_{gate,up,down}_exps.weight`, con forma `[1536, 512, 128]` en cada una de las 23 capas.

La atencion es hibrida: 18 bloques emplean KDA linear attention (tensores `ssm_*`) y 6 bloques usan atencion completa con q/kv comprimidos mediante LoRA (`attn_q_a`, `attn_k_b`, `attn_v_b`, `attn_kv_a_mqa`), con `layer_group_size=4`. El enrutador MoE (`ffn_gate_inp.weight`) esta en F32 en el origen y se mantiene en F32 en todas las variantes del repositorio, de modo que la seleccion de expertos no se degrada por la cuantizacion. Las normas, el sesgo de balanceo de carga y los kernels short-conv son tensores 1-D y permanecen en F32.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no hay informacion en los datos proporcionados. En cuanto a las cuantizaciones de este repositorio, la estrategia destacable es la asignacion de precision por familia de tensores: los expertos enrutados (88% de los parametros) se mantienen en Q4_K; los embeddings y la capa de salida (483 M) suben a Q8_0; la atencion (270 M) y la ruta KDA/SSM (114 M) usan Q5_K; y el experto compartido (54 M) usa Q5_K/Q6_K. El motivo tecnico es que el error en atencion se propaga por todas las capas, el error en la ruta recurrente se integra a lo largo de la secuencia y el experto compartido esta activo en todos los tokens.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento explicito mediante modo de pensamiento hibrido, controlable con el flag `enable_thinking` de la plantilla de chat.
- Trazas de razonamiento delimitadas por `[Start thinking]` y `[End thinking]`.
- Aritmetica y calculo basico: la model card menciona un smoke test de dos items aritmeticos y tres factuales superado 5/5.
- Enrutamiento de expertos configurable: la variante 3 permite subir `expert_used_count` de 8 a 16 mediante edicion de un `uint32` en la cabecera GGUF.
- Compatibilidad con llama.cpp (build b11374 o superior) gracias a la arquitectura `bailingmoe3`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explicitamente, aunque el modo de pensamiento es un indicio de razonamiento multi-paso.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible (el modelo es solo de texto).

## Casos de uso

- Razonamiento aritmetico y resolucion de problemas paso a paso: el modo de pensamiento permite al modelo desglosar calculos antes de dar la respuesta, util para asistentes de matematicas basicas o validacion de operaciones.
- Despliegue en equipos de gama de consumo: con aproximadamente 4,7 GiB por variante y ~1,4 B parametros activos, el modelo puede ejecutarse en GPU consumer con relativamente poca VRAM, lo que habilita prototipos de razonamiento local sin infraestructura cloud.
- Analisis de documentos y conversaciones de contexto medio: el vocabulario de 157184 tokens y la atencion hibrida (18 bloques lineales) reducen el coste de secuencias largas respecto a atencion completa pura, adecuado para resumir o extraer informacion de textos extensos.
- Servicio de chat autoalojado con llama.cpp: al ser GGUF y compatible con el binario `llama-cli` y el servidor de llama.cpp, se puede levantar un endpoint HTTP local para integraciones tipo asistente de codigo o de escritorio.
- Experimentacion con enrutamiento MoE: la variante top-k16 permite estudiar el efecto de duplicar los expertos activos por token sin cambiar los pesos, util para investigacion sobre eficiencia de MoE.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye tres variantes con PPL medida, sirviendo como caso de estudio de asignacion de bits por familia de tensores frente a la cuantizacion uniforme.
- Inferencia en CPU con llama.cpp: al tratarse de un modelo pequeno en parametros activos y ofrecer variantes de ~4,7 GiB, es viable ejecutarlo en CPU para pruebas o entornos sin GPU.

## Benchmarks y rendimiento

El repositorio reporta unicamente perplexity (PPL) medida por el autor. No se aportan resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

| Variante | Tamano | PPL | Embedding/salida | Resto |
|---|---|---|---|---|
| Ling-3.0-tiny-Q8EMB-Q4K.gguf | 4,661 GiB | 4,170 | Q8_0 | Q4_K + promociones internas de llama.cpp |
| Ling-3.0-tiny-Q8EMB-mixed.gguf (recomendada) | 4,706 GiB | 4,047 | Q8_0 | Q4_K, con Q5_K/Q6_K en atencion, KDA/SSM y experto compartido |
| Ling-3.0-tiny-Q8EMB-mixed-topk16.gguf | 4,706 GiB | no medida | Q8_0 | mismos pesos que la variante 2, `expert_used_count` de 8 a 16 |
| bf16 original (referencia) | no disponible | 3,969 | no disponible | no disponible |
| Q4_K_M upstream (referencia) | 4,493 GiB | no disponible | Q4_K | no disponible |

La variante 1 queda un 5,1% por encima de la PPL del bf16 original y la variante 2 solo un 2,0%. La variante 3 no tiene PPL medida ni resultados de benchmarks de razonamiento reales; el autor indica explicitamente que no puede afirmar si top-k 16 es mejor o peor, solo que no esta obviamente roto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 a 6 GiB para cargar una variante de ~4,7 GiB junto con el contexto y los buffers de llama.cpp (estimacion propia, no confirmada en la model card).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 2070) deberia ser suficiente para una variante; GPU de datacenter (A100, H100) permiten lotes mayores y mas contexto.
- Cabe en GPU consumer: si, dado el tamano de ~4,7 GiB por variante.
- Opciones de despliegue: llama.cpp b11374 o superior (arquitectura `bailingmoe3` y K-quants del GGUF requeridos). Tambien es compatible con el servidor de llama.cpp. Otras opciones (vLLM, Ollama, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no medidos en la informacion proporcionada. El autor advierte que la variante top-k16 deberia ser mas lenta que la variante 2 porque enruta al doble de expertos por token, aunque no aporta cifras.
- PPL sobre 4 nucleos de CPU: el autor indica aproximadamente 30 minutos por modelo para medir perplexity en esa configuracion.

## Comparativa con modelos similares

En la informacion disponible no se ofrecen modelos comparables de otras familias. La comparativa mas directa es contra la propia referencia sin cuantizar y contra la cuantizacion oficial del modelo base.

| Modelo | Parametros | Tamano | PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroWw Ling-3.0-tiny Q8EMB-mixed (esta ficha) | 7,89 B (1,4 B activos) | 4,706 GiB | 4,047 | MIT | HuggingFace (ZeroWw) |
| ZeroWw Ling-3.0-tiny Q8EMB-Q4K | 7,89 B (1,4 B activos) | 4,661 GiB | 4,170 | MIT | HuggingFace (ZeroWw) |
| Q4_K_M upstream | 7,89 B (1,4 B activos) | 4,493 GiB | no disponible | MIT (modelo base) | HuggingFace (inclusionAI) |
| Ling-3.0-tiny bf16 original | 7,89 B (1,4 B activos) | no disponible | 3,969 | MIT | HuggingFace (inclusionAI) |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion especifica en la model card.
- El modo de pensamiento esta activado por defecto, por lo que sin un presupuesto de tokens adecuado la generacion puede truncarse antes de dar la respuesta final.
- Longitud de contexto e idiomas soportados: no especificados, lo que dificulta planificar despliegues con requisitos de ventana larga o multilingues.
- La variante top-k16 (variante 3) no tiene perplexity ni benchmarks de razonamiento medidos; el propio autor la describe como un experimento y no como una recomendacion. Duplica los FLOPs de expertos activos por token y se espera mas lenta.
- Requiere llama.cpp b11374 o superior; builds anteriores pueden no reconocer la arquitectura `bailingmoe3` ni los K-quants del GGUF.
- La cuantizacion introduce degradacion: la variante recomendada es un 2,0% peor en PPL que el bf16, y la variante 1 un 5,1% peor.
- Las mediciones de PPL del autor se hicieron en su maquina con 4 nucleos de CPU; los valores pueden variar segun hardware y configuracion.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base inclusionAI/Ling-3.0-tiny en su propio repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/ZeroWw/Ling-3.0-tiny-quant-variants-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Cuantizaciones alternativas de bartowski: https://huggingface.co/bartowski/Ling-3.0-tiny-GGUF
- Fichero variante recomendada: https://huggingface.co/ZeroWw/Ling-3.0-tiny-quant-variants-GGUF/resolve/main/Ling-3.0-tiny-Q8EMB-mixed.gguf
- Fichero variante Q4K: https://huggingface.co/ZeroWw/Ling-3.0-tiny-quant-variants-GGUF/resolve/main/Ling-3.0-tiny-Q8EMB-Q4K.gguf
- Fichero variante top-k16: https://huggingface.co/ZeroWw/Ling-3.0-tiny-quant-variants-GGUF/resolve/main/Ling-3.0-tiny-Q8EMB-mixed-topk16.gguf
