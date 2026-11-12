# Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-QKV8-Down8

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-QKV8-Down8 es una cuantización del modelo Qwen2.5-14B-Instruct de Alibaba Qwen, publicada por Xylolabs y dirigida especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El checkpoint no introduce cambios en la arquitectura ni en el entrenamiento del modelo base: su aportacion es un esquema de cuantizacion por bloques de coma flotante (block floating point, BFP) que respeta el formato nativo de TT-NN, de modo que los pesos se empaquetan tal cual en memoria del dispositivo sin conversion adicional.

El modelo parte de los 14.770.033.664 parametros del Qwen2.5-14B-Instruct original y reduce el peso medio a 7,11 bits por peso, con un total empaquetado de 13,13 GB frente a los 29,54 GB del checkpoint en bf16. La atencion q, k, v y la proyeccion down del MLP se almacenan en bfloat8_b (8,5 bits por peso); las proyecciones o de atencion y gate/up del MLP, en bfloat4_b (4,5 bits por peso) mediante GPTQ con busqueda de exponente por bloque; y el resto de tensores (embeddings, LM head, normalizaciones) permanecen en bf16.

Es relevante ahora porque el ecosistema de Tenstorrent carece de checkpoints cuantizados listos para sus aceleradores, y este trabajo propone un flujo reproducible (scripts `pack_tensix.py` y `verify_grid.py`) que verifica que cada matriz empaquetada conserva exactamente sus valores. La contrapartida es que la validacion se ha hecho sobre `ttsim`, el simulador de Blackhole, y no sobre hardware real, y que ni tt-transformers ni tt-forge se han probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con capas lineales cuantizadas a BFP4/BFP8 para TT-NN |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | bfloat4_b (BFP4, GPTQ, 4,5 bits/peso), bfloat8_b (BFP8, round to nearest, 8,5 bits/peso); media de 7,11 bits/peso |
| Idiomas soportados | en (segun la model card; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP4/BFP8), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-14B-Instruct: un transformer decoder-only de 48 capas, con atencion de consultas agrupadas (GQA) y las innovaciones habituales de la familia Qwen2 (RoPE, RMSNorm, SwiGLU en el MLP). Este checkpoint no modifica esa estructura; unicamente sustituye los tensores de las proyecciones lineales por versiones cuantizadas.

La cuantizacion se realizo en dos regimenes. Los tensores bfloat4_b (atención o, MLP gate y up, en las 48 capas) se obtuvieron con GPTQ y una busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores bfloat8_b (atención q, k, v y MLP down) se generaron con redondeo al mas cercano (round to nearest). El resultado se guarda en safetensors en bf16, pero con cada valor ya situado sobre la rejilla BFP correspondiente, de forma que TT-NN los empaqueta sin transformacion. El fichero `quant4.json` documenta el formato de cada proyeccion. La validacion se ejecuto con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, no sobre silicio.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del Qwen2.5-14B-Instruct.
- Razonamiento de varios pasos y matematicas, en la medida en que lo soporta el modelo base.
- Generacion de codigo y comprension de lenguajes de programacion.
- Soporte de tool calling y function calling a traves de la plantilla de chat de Qwen2.5.
- Capacidades multilingues del modelo base (aunque la model card declara solo `en`).
- Compatibilidad con `transformers` (carga en bf16 con `device_map="auto"`) y con text-generation-inference segun los tags.
- Empaquetado directo en TT-NN como `ttnn.bfloat4_b` o `ttnn.bfloat8_b` sin perdida adicional de valores.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint esta pensado para cargarse directamente en TT-NN, evitando la cuantizacion en el host y aprovechando los formatos BFP nativos del hardware.
- Investigacion de cuantizacion BFP: sirve como referencia reproducible para comparar GPTQ con busqueda de exponente por bloque frente a redondeo al mas cercano en un modelo de 14B.
- Evaluacion de fidelidad de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz empaquetada conserva sus valores, util en pipelines de validacion de checkpoints.
- Asistente conversacional autoalojado: con 13,13 GB empaquetados, es viable en entornos con memoria limitada frente a los 29,54 GB del bf16, manteniendo la plantilla de chat de Qwen2.5.
- Generacion de codigo asistida en flujos con `transformers`: la carga estandar en bf16 permite integrarlo en pipelines existentes sin adaptadores especificos.
- Prototipado en simulador: al haberse validado en `ttsim`, es adecuado para desarrollar y depurar kernels TT-NN antes de disponer de hardware Blackhole.
- Base para experimentos de cuantizacion mixta: la combinacion QKV8/Down8 con BFP4 en o/gate/up ofrece un punto de partida para estudiar el impacto de distintos formatos por proyeccion.

## Benchmarks y rendimiento

Los datos publicados miden la cercania al checkpoint bf16, no la calidad en tareas. La evaluacion cubre 16.104 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano, en texto plano y con plantilla de chat) y 33 prompts cortos con comprobacion automatica.

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo | 7,11 | 13,127 | 0,10933 | 89,83 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,0923 | 90,34 | 31 de 33 | 1 |

El criterio de aceptacion del autor era una KL media como maximo 1,5 veces la de Q4_K_M y como maximo una respuesta perdida adicional; el resultado es 1,18 veces la KL de Q4_K_M y cero respuestas perdidas frente a una. No se midio velocidad en dispositivo. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `transformers`: el checkpoint ocupa 13,13 GB empaquetados, pero al cargarse en bf16 en memoria del host se aproxima a los 29,5 GB del modelo base; se recomienda GPU con 32 GB o mas para carga completa.
- GPU recomendadas para ejecucion estandar: A100 40/80 GB, H100, o RTX 4090 (24 GB) solo con descarga parcial o cuantizacion adicional en el host.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante TT-NN.
- Cabe en GPU de consumo: no de forma holgada en bf16; una RTX 4090 de 24 GB no admite el checkpoint completo sin tecnicas de offload.
- Opciones de despliegue: `transformers` (probado en la model card), text-generation-inference (segun tags), TT-NN con `ttnn.bfloat4_b`/`ttnn.bfloat8_b`. tt-transformers y tt-forge no se han probado con este checkpoint.
- Latencia y throughput: no disponibles; no se midio velocidad en dispositivo y la validacion se hizo en el simulador `ttsim` con ttnn 0.81.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Tensix BFP4 QKV8 Down8) | 14,77B | no disponible | 7,11 | 13,13 GB | Apache 2.0 | Hugging Face |
| Qwen2.5-14B-Instruct (BF16) | 14,77B | no disponible | 16 | 29,54 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 14,77B | no disponible | 4,87 | 8,988 GB | Apache 2.0 | Generado por el autor |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye otros modelos comparables de la misma categoria. Frente a Q4_K_M, este checkpoint ocupa mas espacio (13,13 GB frente a 8,988 GB) pero logra una fidelidad al bf16 comparable (KL 0,109 frente a 0,092) y cero respuestas perdidas frente a una, a cambio de ser directamente empaquetable en TT-NN.

## Limitaciones y advertencias

- La validacion se realizo unicamente en `ttsim`, el simulador de Blackhole, con ttnn 0.81.1; no se ha ejecutado en hardware Tensix real.
- tt-transformers y tt-forge no se probaron con este checkpoint, por lo que su integracion en esos stacks no esta verificada.
- Los benchmarks publicados miden la cercania al bf16 (KL y top-1), no la calidad en tareas; no hay datos de MMLU, HumanEval, GSM8K ni similares.
- La model card declara solo el idioma `en`, aunque el modelo base es multilingue y la calibracion incluyo texto en coreano; el soporte real de otros idiomas no esta documentado para este checkpoint.
- La longitud de contexto no se especifica en la informacion disponible; debe consultarse la model card del modelo base.
- Riesgo de alucinacion y sesgos: heredados del Qwen2.5-14B-Instruct, no evaluados de forma especifica en esta cuantizacion.
- La licencia Apache 2.0 permite uso comercial, pero las modificaciones se documentan en `NOTICE` y conviene revisarlas antes de redistribuir.
- El checkpoint esta pensado para TT-NN; usarlo en `transformers` en bf16 anula la ventaja de tamano y no aprovecha el empaquetado BFP.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-QKV8-Down8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
