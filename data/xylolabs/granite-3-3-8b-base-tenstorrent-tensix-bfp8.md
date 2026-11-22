# Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix-BFP8

## Resumen

Granite 3.3 8B Base para Tenstorrent Tensix (BFP8) es una cuantizacion del modelo base ibm-granite/granite-3.3-8b-base, publicada por Xylolabs, orientada especificamente a la ejecucion sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa del original de IBM, con 8.372.162.560 parametros totales, y sustituye el formato de las proyecciones de atencion y MLP por block floating point de 8 bits (bfloat8_b o BFP8), manteniendo en bf16 la cabeza LM, los embeddings y las normalizaciones.

El problema que resuelve es concreto: el ecosistema TT-NN de Tenstorrent consume pesos empaquetados en sus propios formatos de bloque, de modo que un checkpoint en bf16 estandar no se aprovecha de forma nativa. Esta version entrega los pesos ya cuantizados con GPTQ y verificados contra el checkpoint original, con un tamano empaquetado de 8,871 GB frente a los 16,34 GB en bf16, lo que reduce a la mitad la huella de memoria en DRAM del dispositivo.

Su relevancia es acotada pero clara para quienes trabajan con hardware de Tenstorrent: no es un modelo nuevo ni un fine-tune, sino un artefacto de despliegue. La model card reporta una divergencia media KL frente a bf16 de 0,00103 sobre 8.184 posiciones de texto en ingles y coreano, lo que supone aproximadamente 0,02 veces la KL de una cuantizacion Q4_K_M de llama.cpp, con un 98,50 % de coincidencia top-1. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de ibm-granite/granite-3.3-8b-base); 40 capas segun la tabla de formatos |
| Parametros totales | 8.372.162.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (bfloat8_b) en proyecciones q, k, v, o y MLP gate, up, down; bf16 en LM head, embedding y normas; cuantizacion GPTQ |
| Idiomas soportados | en (segun metadatos); la evaluacion de la model card incluye tambien texto en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 en el Hub; TT-NN los empaqueta a bfloat8_b sin alterar valores); fichero auxiliar `quant4.json` con el formato por proyeccion |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del modelo base de IBM, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer denso de 8B parametros con 40 capas, segun se desprende de la tabla de formatos que enumera las proyecciones cuantizadas por capa. Xylolabs aplica GPTQ para obtener los pesos de bloque en bfloat8_b, un formato de coma flotante por bloques nativo de los tensores Tensix, y deja en bf16 los tensores sensibles a la precision: cabeza LM, embeddings y todas las normalizaciones.

La innovacion tecnica no esta en el modelo sino en el pipeline de empaquetado y verificacion. El repositorio incluye `tools/pack_tensix.py`, que empaqueta cada matriz y comprueba que ningun valor cambia al pasar por TT-NN (lectura de pesos en orden [in, out]), y `tools/verify_grid.py`, que valida la rejilla solo con torch. La cuantizacion se valido midiendo la divergencia KL frente a una pasada bf16 propia del checkpoint base sobre 8.184 posiciones de texto en ingles y coreano, con un umbral de aceptacion de 1,5 veces la KL de Q4_K_M; el resultado obtenido fue 0,02 veces esa referencia. No se proporcionan datos sobre el dataset de calibracion de GPTQ, el numero de tokens de entrenamiento original ni detalles de RLHF o DPO, ya que se trata de un modelo base preentrenado sin ajuste conversacional.

## Capacidades

- Generacion de texto y continuacion de secuencias: es un modelo base sin plantilla de chat, por lo que completa texto en lugar de mantener dialogos estructurados.
- Razonamiento y conocimiento general heredados del checkpoint Granite 3.3 8B Base de IBM.
- Generacion de codigo y matematicas en la medida en que lo soporte el modelo base; no se aportan evaluaciones especificas en esta ficha.
- Sin soporte documentado de tool calling ni function calling en esta version (modelo base, sin post-entrenamiento de instrucciones).
- Sin modo thinking, vision ni audio documentados.
- Capacidades multilingues limitadas: el metadato declara solo ingles, aunque la evaluacion de cuantizacion incluye coreano.
- Ejecucion nativa en NPU Tenstorrent mediante TT-NN, con pesos ya empaquetados en bfloat8_b.
- Compatibilidad con transformers para inferencia estandar en GPU/CPU cargando los safetensors como bf16.

## Casos de uso

- Despliegue en hardware Tenstorrent Wormhole o Blackhole: el checkpoint esta empaquetado para TT-NN, de modo que se carga directamente en DRAM del dispositivo con la mitad de huella que el bf16 (8,871 GB frente a 16,34 GB), lo que permite reservar mas memoria para cache KV y lotes mayores.
- Servicio de continuacion de texto y autocompletado: al ser un modelo base, encaja en tareas de prediccion de siguiente token, reescritura o generacion de borradores donde no se requiere formato conversacional.
- Generacion aumentada por recuperacion (RAG) en ingles: el modelo puede consumir contextos documentales largos y producir respuestas extractivas o sinteticas; conviene validar la longitud de contexto efectiva contra el modelo base antes de production.
- Procesamiento por lotes de texto a gran escala en infraestructura NPU: la reduccion de memoria por peso permite aumentar el batch size en un servidor Tensix y mejorar el throughput por dispositivo.
- Evaluacion y benchmarking de pipelines de cuantizacion: el repositorio incluye scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) utiles para validar que el empaquetado no altera valores antes de desplegar otros modelos en la misma cadena.
- Fine-tuning ligero o destilacion sobre el checkpoint cuantizado: al conservar la estructura de transformers y safetensors, puede servir como punto de partida para experimentos de adaptacion, aunque la cuantizacion BFP8 limita la precision para entrenamiento y requeriria de-cuantizar.
- Base para investigacion en formatos de bloque: sirve como referencia reproducible para comparar BFP8 frente a Q4_K_M en terminos de KL y top-1 sobre el mismo checkpoint.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de fidelidad de cuantizacion, no de calidad de tarea:

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas de 28 |
|---|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-3.3-8b-base) | 16,34 | 0 | 100 | 18 |
| Este modelo (BFP8) | 8,871 | 0,00103 | 98,50 | 18 |
| Q4_K_M (llama.cpp) | 4,943 | 0,05298 | 89,06 | 19 |

La KL y el top-1 se calculan sobre 8.184 posiciones de texto en ingles y coreano, comparando contra una pasada bf16 propia del checkpoint base. Las 28 respuestas corresponden a prompts en formato de completacion, con tres ejemplos (three-shot) y decodificacion greedy. Q4_K_M se genero con llama.cpp v0.9.0 (`cd959ba`) sin matriz de importancia. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks de tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 17 GB en bf16 (los safetensors del repo ocupan 16,7 GB); en formatos de 8 bits empaquetados para TT-NN, 8,871 GB.
- GPU recomendadas para uso con transformers: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con margen para cache KV; en GPUs de 16 GB seria necesario cuantizar adicionalmente a 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB solo con cuantizacion adicional no incluida en este repo.
- Despliegue en NPU: Tenstorrent Wormhole y Blackhole mediante TT-NN, usando `ttnn.as_tensor` con `ttnn.bfloat8_b` y `TILE_LAYOUT`; el repositorio incluye `tensix-runner v0.1.0` y `tensix-kernels v0.1.0`.
- Despliegue en GPU/CPU: transformers con `AutoModelForCausalLM` y `dtype="bfloat16"`; tambien vLLM o TGI si se convierte el checkpoint a un formato compatible, aunque no esta documentado en la model card.
- `tt-transformers` y `tt-forge` no se han probado con este checkpoint, segun advierte el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Granite 3.3 8B Base BFP8) | 8,37B | no disponible | safetensors con BFP8, empaquetado Tensix | Apache 2.0 | Hugging Face, 0 descargas |
| ibm-granite/granite-3.3-8b-base | 8,37B | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face, modelo de referencia |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,37B | no disponible | GGUF 4 bits | Apache 2.0 | Generado localmente con llama.cpp |
| Llama 3.1 8B (alternativa de tamano similar) | 8,03B | 128K (segun su model card) | safetensors, GGUF | Llama 3.1 Community License | Amplia disponibilidad |

La comparacion relevante es frente al checkpoint base y frente a Q4_K_M: este modelo ocupa 8,871 GB, reduce la KL a 0,00103 (frente a 0,05298 de Q4_K_M) y mantiene 18 de 28 respuestas correctas, las mismas que bf16. Frente a alternativas de otros fabricantes no hay datos de benchmarks de tarea en la informacion disponible, por lo que no se puede establecer una comparacion de calidad.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat ni ajuste por instrucciones: no debe usarse directamente como asistente conversacional sin un post-entrenamiento adicional.
- La cuantizacion BFP8 introduce una divergencia medible frente a bf16 (KL 0,00103, top-1 98,50 %); en tareas de alta precision (matematicas exactas, generacion de codigo critico) conviene validar contra el modelo original.
- El metadato de idioma declara solo ingles; el soporte real de otros idiomas no esta documentado, aunque la evaluacion incluye coreano.
- La longitud de contexto no se especifica en la informacion disponible; debe consultarse la model card de ibm-granite/granite-3.3-8b-base antes de disenar aplicaciones con contextos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 8B sin post-entrenamiento; no se han publicado evaluaciones de factualidad.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio original del modelo base no incluye fichero LICENSE, por lo que el autor incluye el texto estandar y un NOTICE con los cambios; conviene revisar ambos antes de redistribuir.
- El autor declara no estar afiliado ni respaldado por Tenstorrent.
- El checkpoint no se ha probado con tt-transformers ni tt-forge; el soporte se limita a TT-NN mediante los scripts incluidos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-base
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia del codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
