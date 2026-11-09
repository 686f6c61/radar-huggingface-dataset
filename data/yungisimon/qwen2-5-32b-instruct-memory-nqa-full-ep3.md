# yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep3

## Resumen

`yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep3` es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon. El modelo se ha reentrenado como "modelo de memoria" sobre pares sinteticos de pregunta-respuesta generados a partir del corpus NarrativeQA, con el objetivo de especializarlo en tareas de recuperacion y razonamiento sobre informacion presentada en el contexto (lectura comprensiva de documentos largos y respuesta a preguntas sobre ellos).

Se trata de un transformer decoder-only denso de 32.763.876.352 parametros (32,76 mil millones), todos ellos entrenables y efectivamente entrenados durante el ajuste. El checkpoint corresponde a la tercera y ultima epoca de un entrenamiento de 3 epocas, realizado en bf16 con FSDP sobre 8 GPU AMD Instinct MI325X. La ventana de contexto usada durante el entrenamiento fue de 8096 tokens.

Su relevancia es acotada pero concreta: demuestra un flujo de especializacion de un modelo generalista de 32B hacia una tarea de memoria contextual mediante un dataset sintetico grande (1.276.668 ejemplos) y un coste de computo modesto (68,9 GPU-horas). Es util como referencia para quien quiera reproducir o adaptar la receta, y como modelo base para experimentos de QA sobre documentos largos. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no publica resultados de evaluacion, por lo que su calidad real no esta verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), denso |
| Parametros totales | 32.763.876.352 (32,76B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8096 tokens (longitud maxima de secuencia usada en entrenamiento); la ventana nativa del modelo base Qwen2.5-32B-Instruct es de 131.072 tokens, aunque no se garantiza su conservacion tras el ajuste |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en bf16 safetensors, por lo que son cuantizables a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda presumiblemente el multilingueismo del base Qwen2.5, sin verificar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El ajuste no modifica la topologia; se reentrenan los 32,76 mil millones de parametros (100,00% de los parametros entrenables) mediante full fine-tuning con FSDP.

El entrenamiento se realizo sobre pares sinteticos de QA derivados de NarrativeQA, a partir del fichero `NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 1.276.668 ejemplos. La configuracion reportada es: batch efectivo de 512 (64 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate 2e-05 constante con warmup (ratio 0,05), 3 epocas, weight decay 0,01, max grad norm 1,0, longitud maxima de secuencia 8096, precision bf16 con gradient checkpointing y calculo de perdida solo sobre los tokens del asistente. El coste total fue de 8,61 horas de reloj (68,9 GPU-horas) sobre 8 AMD Instinct MI325X. No se documenta el uso de RLHF, DPO ni ninguna innovacion de decodificacion; el unico rasgo tecnico destacable es la propia receta de especializacion en memoria contextual.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen.
- Lectura comprensiva y respuesta a preguntas sobre documentos largos presentados en el contexto (tarea de memoria contextual sobre NarrativeQA).
- Razonamiento sobre informacion cross-document, dado que el dataset de entrenamiento combina entidades entre documentos.
- Capacidad multilingue presumible por herencia del modelo base Qwen2.5, aunque no declarada ni verificada.
- Soporte de tool calling y function calling presumible por herencia del base, no verificado tras el ajuste.
- Uso en agentes y razonamiento multi-paso presumible por herencia, no verificado.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Preguntas y respuestas sobre documentacion tecnica extensa: el modelo puede recibir manuales o especificaciones de hasta 8096 tokens y responder preguntas concretas, aprovechando su especializacion en memoria contextual.
- Analisis de contratos y textos legales: extraccion de entidades y relaciones entre clausulas de varios documentos, gracias al entrenamiento con combinacion de entidades cross-document.
- Asistentes de investigacion sobre corpus narrativos o literarios: resumen y consulta de tramas, personajes y relaciones a partir de fragmentos largos de NarrativeQA.
- Base para pipelines de retrieval-augmented generation (RAG): el modelo puede actuar como generador final que sintetiza los fragmentos recuperados, con contexto de 8096 tokens suficiente para varios pasajes.
- Punto de partida para nuevos ajustes finos: al ser un full fine-tune con licencia apache-2.0, sirve como checkpoint inicial para especializaciones adicionales en dominios de memoria o QA.
- Experimentacion academica sobre memoria en LLM: permite reproducir y comparar la receta de entrenamiento (dataset sintetico, 3 epocas, 8 GPU) frente al base Qwen2.5-32B-Instruct.
- Generacion de resumenes extractivos sobre documentos largos: el modelo puede localizar y condensar la informacion relevante de un texto de hasta 8096 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para los pesos (32,76B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se necesitan 2 GPU de 48 GB o una de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 33-35 GB, cabe en una A100 40 GB o en una RTX 6000 Ada 48 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 17-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD MI300X/MI325X (familia usada en el entrenamiento), o configuraciones multi-GPU con 2x A100 40 GB.
- Despliegue: compatible con `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM, llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep3 | 32,76B | 8096 (entrenamiento) | Memoria/QA sobre NarrativeQA | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct (base) | 32,76B | 131.072 tokens | Generalista, chat e instrucciones | apache-2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-72B-Instruct | 72,7B | 131.072 tokens | Generalista de mayor escala | apache-2.0 (con condiciones de uso) | Hugging Face |
| Meta Llama 3.3 70B Instruct | 70B | 128.000 tokens | Generalista | Llama 3.3 Community License | Hugging Face |

La comparativa directa con alternativas especializadas en memoria contextual no esta disponible: no se conocen en la informacion proporcionada otros full fine-tunes publicos de Qwen2.5-32B orientados a NarrativeQA con los que contrastar.

## Limitaciones y advertencias

- No se han publicado evaluaciones: no hay benchmarks que confirmen que el ajuste mejora al base en la tarea objetivo ni que no degrada capacidades generales.
- Riesgo de olvido catastrofico: un full fine-tune de 3 epocas sobre un unico dataset sintetico puede deteriorar el rendimiento generalista del Qwen2.5-32B-Instruct original, incluyendo tool calling e instrucciones complejas.
- Sesgos: el dataset NarrativeQA procede de narrativa en ingles y los pares son sinteticos; pueden introducirse sesgos de dominio, estilo y entidades no documentados.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar respuestas cuando la informacion no esta en el contexto; no se ha caracterizado su tasa de alucinacion.
- Limitacion de contexto: el entrenamiento uso 8096 tokens, muy por debajo de los 131.072 del base; el comportamiento con contextos mas largos no esta garantizado.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del ingles no esta verificado.
- Licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del dataset NarrativeQA para usos derivados.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset de referencia (NarrativeQA): no se proporciona enlace directo en la model card; el fichero citado es `NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json`
- Paper de Qwen2.5: no disponible en la informacion proporcionada
- Repositorio o demo del autor: no disponible en la informacion proporcionada
