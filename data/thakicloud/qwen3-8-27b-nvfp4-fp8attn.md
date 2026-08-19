# ThakiCloud/Qwen3.8-27B-NVFP4-FP8ATTN

## Resumen

Qwen3.8-27B-NVFP4-FP8ATTN es una cuantizacion de precision mixta del modelo denso multimodal Qwen3.8-27B, desarrollada por ThakiCloud. Combina cuantizacion NVFP4 de 4 bits en las proyecciones del MLP y FP8 de 8 bits en todas las proyecciones de atencion, logrando reducir el peso en disco de 55.59 GB (bf16 original) a 22.90 GB, es decir, una compresion de 2.43x. El modelo se construyo con llm-compressor y GPTQ oneshot sobre 1024 muestras de calibracion de texto.

El modelo base Qwen3.8-27B, publicado por el equipo Qwen de Alibaba, es un modelo denso de 27B parametros con arquitectura hibrida de atencion: 48 de sus 64 capas usan atencion lineal y las 16 restantes atencion completa, e incorpora una torre de vision, un cabezal de decodificacion especulativa MTP y una ventana de contexto nativa de 262K tokens. Esta cuantizacion especifica esta pensada para hardware Blackwell (SM100+) y para servir con vLLM, donde se ha medido un rendimiento de hasta 138.9 tokens/s de salida en una B200, manteniendo una calidad estadisticamente indistinguible del modelo bf16 en la evaluacion MMMU.

La relevancia de esta ficha radica en que demuestra que cuantizar atencion en FP8 en lugar de aplicar 4 bits de forma homogenea produce un modelo mas pequeno y mas rapido a la vez, un resultado util para quienes despliegan modelos multimodales grandes en entornos de produccion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense hybrid-attention: 16 capas full attention + 48 capas linear attention, vision tower, MTP draft head) |
| Parametros totales | 18.800.348.400 (pesos cuantizados safetensors; el modelo base nominal es de 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262K nativa (en el despliegue de referencia se usa max-model-len 32768) |
| Tipos de cuantizacion | NVFP4 (W4A4, group_size 16) en MLP; FP8 (W8A8 dinamico) en atencion; bf16 en vision tower, lm_head y normas de linear_attn |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantizacion NVFP4/FP8, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con una arquitectura hibrida de atencion: 16 capas utilizan atencion completa (full attention) y 48 capas emplean atencion lineal, lo que reduce el coste computacional en contextos largos. Incluye una torre de vision para entrada de imagenes, un cabezal MTP (multi-token prediction) para decodificacion especulativa y una ventana de contexto nativa de 262K tokens. Los datos de entrenamiento del modelo base no se detallan en la informacion disponible, pero se sabe que esta orientado a tareas de codigo, agentes y automatizacion ofimatica.

La cuantizacion de ThakiCloud se realizo con llm-compressor mediante GPTQ oneshot sobre 1024 muestras de calibracion de texto. La innovacion principal es la eleccion de precision por modulo: el MLP se cuantiza a NVFP4 (4 bits, group size 16) mientras que todas las proyecciones de atencion se cuantizan a FP8 dinamico (8 bits). Esta decision se justifica por mediciones de rendimiento que muestran que la atencion era responsable de una parte significativa del trafico de memoria, por lo que usar 8 bits ahi resulta mas eficaz que aplicar 4 bits en mas sitios. El resultado es un modelo de 22.90 GB que es 1.641x mas rapido que el bf16 original en generacion con contexto largo, y 1.675x si se anade cache KV en FP8.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento y agentes: el modelo base esta disenado para flujos de trabajo agente y automatizacion ofimatica, con soporte para tool calling y multi-step reasoning (segun el repositorio oficial de Alibaba).
- Generacion de codigo: el modelo base destaca en tareas de programacion (DeepSWE 42.2, Terminal Bench 73.0 segun el blog de Lovable).
- Decodificacion especulativa: incluye un cabezal MTP que acelera la generacion en vLLM.
- Contexto largo: ventana nativa de 262K tokens, ampliable a 1M segun vLLM Recipes.
- Capacidades multilingues: no se han publicado datos especificos para esta cuantizacion.
- No se ha evaluado en video ni en tareas de audio en esta version cuantizada.

## Casos de uso

- Servicio de inferencia multimodal en produccion con vLLM: el modelo puede servirse con `vllm serve` usando la configuracion recomendada (`--max-model-len 32768 --max-num-seqs 256 --kv-cache-dtype fp8`), alcanzando 138.9 tokens/s de salida en una B200, lo que lo hace adecuado para APIs de chat con imagen y texto a alta concurrencia.
- Automatizacion ofimatica: gracias a las capacidades del modelo base para entender documentos, hojas de calculo y presentaciones, esta cuantizacion permite desplegar asistentes que generan informes, resumenes o responden preguntas sobre material corporativo con un consumo de VRAM reducido.
- Agentes de codigo en entornos CI/CD: el modelo base puntua 42.2 en DeepSWE y 73.0 en Terminal Bench, por lo que puede integrarse en pipelines de integracion continua para revision de codigo, generacion de parches o automatizacion de tareas de terminal, con la ventaja de ocupar 22.9 GB en disco.
- Chatbot de atencion al cliente con contexto largo: su ventana nativa de 262K tokens permite mantener conversaciones multi-turno con historiales extensos y documentos adjuntos, aunque el ejemplo de despliegue usa 32K para controlar la latencia.
- Asistente de razonamiento visual: al aceptar imagenes, puede describir diagramas, capturas de pantalla o graficos, y responder preguntas sobre ellos, util en soporte tecnico o analisis de diseno.
- Investigacion en cuantizacion de modelos: esta ficha documenta una receta de precision mixta (NVFP4 en MLP + FP8 en atencion) que puede servir como referencia para experimentos de compresion en otros modelos hibridos.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion en MMMU (validacion, multiple-choice) con 232 items pareados, comparando contra el modelo bf16 y contra la version pura NVFP4:

| Build | MMMU-val MC (232 pareados) | McNemar vs bf16 | Pares discordantes |
|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | 0.8836 | — | — |
| ThakiCloud NVFP4 puro (MLP only) | 0.8922 | p = 0.688 | 6 |
| **Este build (NVFP4+FP8ATTN)** | **0.8707** | **p = 0.581** | **13** |
| Este build + KV FP8 | 0.9009 | p = 0.344 | 10 |

Ningun armado se separa estadisticamente del bf16 (p > 0.05 en todos los casos), lo que indica que la cuantizacion no degrada significativamente la calidad. Sin embargo, el autor advierte que n=232 solo puede detectar efectos grandes, no pequenos. Ademas, este build trunca mas a menudo que bf16 con un presupuesto de 16384 tokens (22 items vs 13, tasa de veredicto 0.896 vs 0.953), un comportamiento no explicado.

En cuanto a rendimiento de inferencia (salida tokens/s, in=2048 out=256, B200, ladder 1/8/32/128, mediana):

| Build | Tamano | c=1 | c=128 | c=128 vs bf16 |
|---|---|---|---|---|
| bf16 original | 55.59 GB | 86.5 | 2,141.4 | — |
| NVFP4 puro (MLP only) | 30.14 GB | 126.3 | 3,186.2 | 1.488x |
| **Este build** | **22.90 GB** | **138.8** | **3,513.3** | **1.641x** |
| Este build + KV FP8 | 22.90 GB | 138.9 | 3,586.3 | 1.675x |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) para esta cuantizacion especifica.

## Requisitos de hardware

- GPU requerida: Blackwell (SM100+) para el kernel nativo de FP4. Se ha probado en una B200.
- VRAM estimada: el peso en disco es de 22.90 GB; con `--kv-cache-dtype fp8` y `gpu_memory_utilization=0.90` en una B200, el modelo cabe holgadamente. No se indica si cabe en GPUs consumer (p.ej. RTX 4090 con 24 GB) porque el kernel FP4 no esta disponible fuera de Blackwell.
- Opciones de despliegue: vLLM es el motor de referencia (comando `vllm serve` incluido en la model card). No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: 138.9 tokens/s de salida en una B200 con configuracion de concurrencia 256 secuencias; a c=128 alcanza 3,586.3 tokens/s agregados (3,845 tok/s en el checkpoint de RadixArk con KV calibrado).
- Nota: el modelo requiere la configuracion `--kv-cache-dtype fp8` para obtener el mejor rendimiento; sin ella se obtiene 1.641x vs bf16 en lugar de 1.675x.

## Comparativa con modelos similares

| Modelo | Tamano en disco | Precision | Contexto | MMMU-val MC (232) | Throughput (c=128, B200) | Licencia |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | 55.59 GB | bf16 | 262K | 0.8836 | 2,141.4 tok/s | Apache 2.0 |
| ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt | 30.14 GB | NVFP4 solo MLP | 262K | 0.8922 | 3,186.2 tok/s | Apache 2.0 |
| **ThakiCloud/Qwen3.8-27B-NVFP4-FP8ATTN** | **22.90 GB** | **NVFP4+FP8** | **262K** | **0.8707** | **3,513.3 tok/s** | **Apache 2.0** |
| RadixArk/Qwen3.8-27B-NVFP4 | no disponible | NVFP4+FP8 con KV calibrado | 262K | no disponible | 3,845 tok/s (tuned) | no disponible |

La comparativa muestra que esta cuantizacion es la mas pequena y rapida de las tres de ThakiCloud, con una calidad estadisticamente equivalente al bf16. El checkpoint de RadixArk alcanza un throughput ligeramente superior (3,845 vs 3,586 tok/s) posiblemente gracias a escalas KV calibradas e integradas en el checkpoint, aunque el autor no lo confirma.

## Limitaciones y advertencias

- La evaluacion de calidad se limita exclusivamente a MMMU en modo multiple-choice; no se han medido tareas de codigo, long-context, multilingues ni video en esta cuantizacion.
- El modelo trunca mas a menudo que el bf16 con un presupuesto de 16384 tokens (22 items vs 13 en MMMU), un comportamiento que el autor no puede explicar y que podria afectar a tareas de razonamiento largo.
- El tamaño de muestra en la evaluacion (n=232) solo permite detectar efectos grandes; diferencias pequenas de calidad podrian pasar desapercibidas.
- Requiere hardware Blackwell (SM100+) para el kernel FP4 nativo; no funcionara en GPUs de generaciones anteriores (Ampere, Ada Lovelace) con el mismo rendimiento.
- Los datos de throughput corresponden a un unico perfil de trafico (in=2048, out=256); cargas con prefill pesado o decode prolongado pueden dar resultados distintos.
- No se ha evaluado el comportamiento en produccion con multiples usuarios simultaneos ni la estabilidad a largo plazo.
- Los sesgos del modelo base no estan documentados en la informacion disponible; se recomienda auditar antes de usar en aplicaciones sensibles.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el comportamiento en escenarios no probados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-FP8ATTN
- Version NVFP4 pura (texto): https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt
- Version NVFP4 pura (multimodal): https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia completa de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
