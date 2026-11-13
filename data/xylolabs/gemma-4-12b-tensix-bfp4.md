# Xylolabs/gemma-4-12B-Tensix-BFP4

## Resumen

`Xylolabs/gemma-4-12B-Tensix-BFP4` es una cuantizacion del modelo multimodal `google/gemma-4-12B` realizada por Xylolabs, orientada especificamente a la inferencia sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole) mediante la pila de software TT-Metal/TT-NN. El modelo conserva la naturaleza any-to-any del original (texto, imagen y audio) pero solo cuantiza y evalua el submodelo de lenguaje, cuyas capas lineales de atencion y MLP se almacenan en formato de coma flotante por bloques de 4 bits (`ttnn.bfloat4_b`, BFP4) con GPTQ.

El checkpoint tiene 12.966.363.184 parametros totales (unos 12,97 mil millones) y ocupa 26,0 GB en el repositorio de Hugging Face, aunque los pesos empaquetados para dispositivo suman aproximadamente 8,15 GB para el modelo de lenguaje. La cuantizacion emplea un exponente compartido por bloque, de modo que los valores se guardan como bf16 sobre la rejilla BFP4 y TT-NN los empaqueta sin alterarlos. El resultado son 5,47 bits por peso de media.

Su relevancia es doble: por un lado, demuestra que es posible llevar un modelo de ~13B multimodal a memoria de dispositivo de menos de 9 GB en hardware Tenstorrent; por otro, publica una metodologia de evaluacion basada en divergencia KL frente al BF16 y en un conjunto de 28 preguntas con verificacion automatica, comparandose contra una cuantizacion Q4_K_M de llama.cpp. Es un modelo base (no instruct), sin plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, `gemma4_unified`); 48 capas con atencion y MLP cuantizados, 40 de ellas con proyeccion V cuantizada |
| Parametros totales | 12.966.363.184 (~12,97 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q, k, o, v, gate, up y down; bf16 en embedding, LM head (atado), normas y tensores multimodales (`embed_audio`, `embed_vision`, `vision_embedder`). Media de 5,47 bits por peso |
| Idiomas soportados | No disponible en la informacion proporcionada (la calibracion usa WikiText-2 en ingles y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`), mas `quant4.json` con el formato por proyeccion y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B`, un transformer multimodal de tipo any-to-any que integra codificadores de vision y audio junto al modelo de lenguaje. La intervencion de Xylolabs se limita a las capas lineales del modelo de lenguaje: las proyecciones de atencion (q, k, o en las 48 capas; v en 40) y las del MLP (gate, up, down en las 48) se cuantizan a BFP4 mediante GPTQ con busqueda de exponente por bloque. El resto de tensores, incluidos los embedders multimodales, permanece en bf16. La calibracion se realizo sobre 65.536 tokens de WikiText-2 y de la Wikipedia en coreano.

La innovacion tecnica principal es el formato de coma flotante por bloques (`bfloat4_b`): cada bloque comparte un exponente y los pesos se almacenan como valores bf16 situados exactamente sobre la rejilla BFP4, de forma que el empaquetado en TT-NN es una operacion sin perdida adicional. El autor verifica esto con `pack_tensix.py` (comprueba cada matriz y, con `--device`, hace un round-trip por la DRAM del dispositivo) y `verify_grid.py` (verificacion solo con torch). Los mismos valores tambien se empaquetan de forma exacta en `ttnn.bfloat8_b`. Las pruebas se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; `tt-transformers` y `tt-forge` no se ejecutaron con este checkpoint.

No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO; el autor no la incluye en la model card.

## Capacidades

- Generacion de texto y continuacion de texto: es un modelo base preentrenado, sin plantilla de chat ni ajuste por instrucciones.
- Procesamiento multimodal any-to-any: el pipeline declarado es `any-to-any` e incluye embedders de imagen y audio en bf16, aunque solo el modelo de lenguaje fue cuantizado y evaluado.
- Razonamiento y conocimiento general heredados de Gemma 4 12B, sujetos a la degradacion medida frente a BF16.
- Capacidad multilingue: no documentada explicitamente; la evaluacion cubre texto en ingles y coreano.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; al ser un modelo base, no se ha validado para flujos agenticos.
- Modo thinking, vision o audio: los tensores de vision y audio estan presentes, pero no se aportan evaluaciones de esas modalidades.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. El checkpoint esta pensado para cargarse en NPU Wormhole o Blackhole a traves de TT-NN, con unos 8,15 GB de memoria de dispositivo para los pesos del modelo de lenguaje, mas espacio para cache KV y buffers.
- Prototipado de cuantizacion BFP4: util como referencia para validar pipelines GPTQ con exponente por bloque y comprobar la equivalencia exacta entre los valores almacenados y los empaquetados por TT-NN.
- Investigacion sobre degradacion por cuantizacion: la model card publica KL medio (0,07334), top-1 (89,24 %) y tasa de respuestas correctas (26 de 28) frente a BF16, lo que permite estudiar el impacto de 4,5 bits por peso en tareas de continuacion de texto.
- Generacion de texto en ingles y coreano: la calibracion y la evaluacion se centran en estos idiomas, por lo que es el escenario con menor riesgo de deriva respecto al modelo original.
- Benchmarking de stacks de inferencia: comparar TT-NN frente a llama.cpp Q4_K_M sobre el mismo checkpoint base, usando las metricas de KL y top-1 ya publicadas como linea base.
- Experimentacion multimodal controlada: al conservar los embedders de vision y audio en bf16, sirve para estudiar el efecto de cuantizar solo el lenguaje en un modelo any-to-any, siempre que se valide la calidad de las modalidades no evaluadas.

## Benchmarks y rendimiento

Los datos publicados miden la cercania al BF16, no la calidad de tarea. KL y top-1 cubren 8.184 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con verificacion automatica, en formato de completacion y 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-12B`) | 16 | 23,81 | 0 | 100 | 27 de 28 | - |
| **Este modelo (BFP4)** | 5,47 | 8,146 | 0,07334 | 89,24 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,949 | 7,381 | 0,09127 | 87,90 | 25 de 28 | 0 |

El criterio de aceptacion del autor era un KL medio como maximo 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional. El resultado es 0,804 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 0. La cuantizacion Q4_K_M se genero con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia y sha256 `bd3f28514fbdb7021e8412280c8c8a8d7c98974f8ca07210712d50de4ddc5874`. No se publican datos de velocidad ni de latencia.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 8,15 GB para los pesos del modelo de lenguaje empaquetados en BFP4, mas cache KV y buffers. El repositorio completo ocupa 26,0 GB en disco.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. No se documenta soporte en GPU convencionales mas alla de la carga generica con `transformers`.
- Validacion: realizada con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole). `tt-transformers` y `tt-forge` no se probaron con este checkpoint.
- Carga en `transformers`: el ejemplo de la model card usa `AutoModelForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`, lo que implica materializar los pesos en bf16 (del orden de 24 GB) en memoria del host o de la GPU.
- Opciones de despliegue: TT-NN/TT-Metal para Tenstorrent; `transformers` para inferencia de referencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Este modelo (BFP4) | 12,97 B | No disponible | BFP4, 5,47 bits | 8,146 GB | Apache 2.0 | Tenstorrent Tensix |
| `google/gemma-4-12B` (BF16) | 12,97 B | No disponible | BF16, 16 bits | 23,81 GB | Apache 2.0 | GPU / CPU |
| Q4_K_M de llama.cpp | 12,97 B | No disponible | Q4_K_M, 4,949 bits | 7,381 GB | Apache 2.0 | CPU / GPU (llama.cpp) |

La comparativa se limita al mismo checkpoint base en distintas precisiones, ya que no se dispone de datos de otros modelos de tamano o tarea equivalente en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; las capacidades de vision y audio no estan validadas y podrian degradarse de forma no medida.
- Es un modelo base preentrenado: no tiene plantilla de chat ni ajuste por instrucciones, por lo que no es adecuado para uso conversacional directo sin trabajo adicional.
- Los benchmarks miden fidelidad respecto a BF16 (KL y top-1), no calidad de tarea; no deben interpretarse como rendimiento absoluto.
- El conjunto de evaluacion es reducido (28 prompts, 8.184 posiciones de texto en ingles y coreano), lo que limita la generalizacion de las cifras.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Idiomas soportados no declarados; la calibracion en coreano e ingles no garantiza un comportamiento equivalente en castellano.
- La validacion se hizo sobre el simulador `ttsim`, no sobre silicio real; el rendimiento y la estabilidad en Wormhole o Blackhole no estan confirmados.
- No se ejecutaron `tt-transformers` ni `tt-forge` con este checkpoint, por lo que la integracion con esas pilas no esta verificada.
- Licencia Apache 2.0 segun la model card del modelo base; el repositorio original no incluye fichero LICENSE, por lo que el incluido es el texto estandar. Los cambios se documentan en `NOTICE`. Se distribuye "as is", sin garantia, y no esta afiliado ni respaldado por Tenstorrent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Fichero de licencia del modelo: https://huggingface.co/Xylolabs/gemma-4-12B-Tensix-BFP4/blob/main/LICENSE
