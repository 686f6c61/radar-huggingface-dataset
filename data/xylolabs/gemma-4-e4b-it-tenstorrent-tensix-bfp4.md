# Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4

## Resumen

`Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4` es una cuantización del modelo multimodal `google/gemma-4-E4B-it` de Google, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 (pipeline any-to-any, es decir, entrada y salida multimodal) pero sustituye las proyecciones lineales del transformer de lenguaje por tensores cuantizados en formato `ttnn.bfloat4_b` (block floating point de 4 bits), generados mediante GPTQ con busqueda de exponente por bloque.

El objetivo es claro: permitir ejecutar un modelo de 8.667 millones de parametros totales en hardware Tensix con un consumo de memoria de pesos de aproximadamente 9,44 GB, frente a los 15,04 GB que ocupa la version BF16. Esto reduce a casi la mitad la huella de memoria del modelo de lenguaje sin degradar demasiado la calidad: la divergencia KL media respecto a BF16 es de 0,097 y el top-1 de coincidencia es del 86,56 % sobre 7.968 posiciones de texto en ingles y coreano.

Es relevante ahora porque el ecosistema Tenstorrent (tt-metal, tt-nn, tt-forge) esta empezando a soportar modelos de la familia Gemma 4, y este repositorio proporciona pesos ya empaquetados y verificados para `ttnn`, con scripts de validacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que el empaquetado BFP4 no altera ningun valor. La licencia Apache 2.0 facilita su uso comercial, aunque hereda las condiciones del modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) de Gemma 4, con proyecciones lineales cuantizadas en BFP4 |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ a `ttnn.bfloat4_b` (4,5 bits por peso) en atencion y MLP; resto en bf16; media de 10,05 bits por peso |
| Idiomas soportados | no disponible (calibracion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json` para el mapeo de formatos) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un transformer multimodal con torres de vision y audio (`vision_tower`, `audio_tower`, `embed_vision`, `embed_audio`) y un modelo de lenguaje de 42 capas con atencion y MLP. La cuantizacion afecta exclusivamente al modelo de lenguaje: las proyecciones `q`, `o` (42 capas), `k`, `v` (24 capas) y `gate`, `up`, `down` del MLP (42 capas) se almacenan en `bfloat4_b` a 4,5 bits por peso. El LM head (atado al embedding), el embedding, las normas y el resto de tensores se mantienen en bf16, igual que las torres de vision y audio, que no se tocan.

El proceso de cuantizacion emplea GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los valores cuantizados se almacenan como bf16 sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin modificar su valor; los scripts del repositorio verifican esta propiedad mediante comparacion exacta (`torch.equal`) tras el empaquetado. El resultado es un peso medio de 10,05 bits por peso y 9,44 GB empaquetados. Solo se cuantizo y evaluo el modelo de lenguaje; las capacidades de vision y audio no se han validado en esta version.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados de `gemma-4-E4B-it`.
- Procesamiento multimodal any-to-any: el pipeline declarado es `image-text-to-text`, con torres de vision y audio conservadas en bf16.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Capacidades multilingues del modelo base (no detalladas en la informacion disponible).
- Compatibilidad con `transformers` y con el runtime `ttnn` de Tenstorrent para ejecucion en NPU.
- Tool calling y agentes: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en NPU Tenstorrent: el caso principal. El modelo esta empaquetado para ejecutarse en Wormhole o Blackhole con `ttnn`, reduciendo el peso del modelo de lenguaje a 9,44 GB y liberando memoria para cache KV y buffers en un unico dispositivo.
- Despliegue en entornos con memoria limitada: frente a los 15,04 GB de BF16, la version BFP4 permite alojar el modelo de lenguaje en aceleradores con menos DRAM, manteniendo un 86,56 % de coincidencia top-1 con la version completa.
- Asistentes conversacionales multimodales: al conservar las torres de vision y audio en bf16, puede emplearse en interfaces que reciben imagen o audio y generan texto, siempre que se valide el comportamiento multimodal (no evaluado por el autor).
- Procesamiento de documentacion en ingles y coreano: la calibracion incluye Wikipedia en coreano y WikiText-2 en ingles, por lo que el modelo es adecuado para tareas de resumen o extraccion en esos idiomas con perdida controlada (KL de 0,097).
- Investigacion en cuantizacion de bajo bit: el repositorio incluye scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) utiles para estudiar el impacto de BFP4 con GPTQ en modelos multimodales.
- Prototipado en simulador: el autor verifico el empaquetado con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole, lo que permite desarrollar y depurar pipelines sin hardware fisico.
- Evaluacion comparativa de formatos: la tabla de evaluacion del autor permite contrastar BFP4 (10,05 bits/peso) con Q4_K_M de llama.cpp (5,66 bits/peso) en terminos de KL y top-1, util para decidir el formato de despliegue.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E4B-it`) | 16 | 15,04 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP4)** | 10,05 | 9,444 | 0,09700 | 86,56 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,66 | 5,335 | 0,19989 | 81,05 | 36 de 40 | 0 |

La evaluacion de KL y top-1 cubre 7.968 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano) con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con evaluacion automatizada (el texto de la model card esta truncado en ese punto). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 9,44 GB solo para los pesos del modelo de lenguaje, mas espacio para cache KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- El demo oficial de tt-metal (v0.81.1) ejecuta E2B, E4B y 12B en una unica Blackhole P150; este repositorio no tiene entrada propia en `precision_overrides.json`, por lo que por defecto carga en bf16 (exacto). El autor propone una entrada que empaqueta atencion y MLP en `bfloat8_b`, tambien exacta (verificada en las dos primeras capas).
- `tt-forge` (tt-xla) aun no se ha probado con Gemma 4; por defecto mantiene bf16 y su opcion `bfp_bf4` recuantiza en el layout [out, in] de PyTorch.
- GPU consumer: no aplica de forma nativa; el modelo esta pensado para Tensix. La carga en `transformers` con `device_map="auto"` es posible en bf16, pero requiere memoria equivalente a la version completa (15,04 GB) mas overhead.
- Opciones de despliegue: `transformers` (referencia), `ttnn` (runtime Tensix), demo de tt-metal para Gemma 4, y potencialmente `tt-forge` cuando se valide.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4) | 8,67 B | no disponible | 10,05 | 9,44 GB | Apache 2.0 | Hugging Face, pesos safetensors |
| `google/gemma-4-E4B-it` (BF16) | 8,67 B | no disponible | 16 | 15,04 GB | Gemma (terminos de Google) | Hugging Face |
| Q4_K_M de llama.cpp | 8,67 B | no disponible | 5,66 | 5,335 GB | segun modelo base | llama.cpp |
| `bfloat8_b` sobre el mismo base | 8,67 B | no disponible | 8 | no disponible | Apache 2.0 | via empaquetado TT-NN |

La comparacion se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento frente a otros modelos de tamano similar en la informacion proporcionada. El compromiso principal es claro: BFP4 ofrece mejor fidelidad que Q4_K_M (KL 0,097 frente a 0,200; top-1 86,56 % frente a 81,05 %) a costa de un mayor tamano (9,44 GB frente a 5,34 GB).

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; el comportamiento de las torres de vision y audio en esta version no esta validado.
- La evaluacion es limitada: 7.968 posiciones de texto y 33 prompts cortos, en ingles y coreano. No hay resultados en benchmarks estandar ni en otros idiomas.
- La calibracion GPTQ uso exclusivamente WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios y degradar el rendimiento en otros.
- El top-1 del 86,56 % implica que aproximadamente un 13 % de las predicciones difieren de BF16; en tareas sensibles a la fidelidad token a token conviene validar.
- El soporte en tt-metal requiere una entrada manual en `precision_overrides.json`; sin ella, el modelo carga en bf16 y pierde la ventaja de memoria.
- `tt-forge` no se ha probado con Gemma 4; su opcion `bfp_bf4` recuantiza en otro layout y puede alterar los valores.
- Licencia Apache 2.0 para este repositorio, pero el modelo base `google/gemma-4-E4B-it` esta sujeto a los terminos de uso de Gemma de Google; es necesario revisar ambas antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan del modelo base.
- Longitud de contexto e idiomas soportados no se detallan en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Codigo de cuantizacion (`tensix-bfp-gptq`): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (no verificable en la informacion disponible)
