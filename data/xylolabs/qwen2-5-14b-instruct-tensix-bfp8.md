# Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP8

## Resumen

Qwen2.5-14B-Instruct-Tensix-BFP8 es una cuantizacion del modelo Qwen2.5-14B-Instruct de Alibaba, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No es un modelo nuevo: es el mismo transformer denso de 14.770.033.664 parametros, pero con sus capas lineales (proyecciones q, k, v, o de atencion y gate, up, down del MLP en las 48 capas) cuantizadas a `ttnn.bfloat8_b` (BFP8, block floating point) mediante GPTQ. El resto de tensores (embedding, LM head, normalizaciones) permanece en bf16.

La relevancia de esta ficha es de nicho pero concreta: permite ejecutar un modelo de 14B en hardware Tensix con un peso medio de 9,29 bits por parametro y 17,15 GB empaquetados, frente a los 29,54 GB del checkpoint BF16 original. El formato de pesos es safetensors en bf16, pero con cada valor ya alineado a la rejilla BFP8, de modo que TT-NN los empaqueta sin recuantizar. La cuantizacion se calibro con GPTQ sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

El modelo hereda todas las capacidades del Qwen2.5-14B-Instruct base (generacion de texto, razonamiento, codigo, matematicas, tool calling, contexto largo), pero con una salvedad importante: el autor solo lo ha validado en el simulador ttsim de Blackhole con ttnn 0.81.1, no en hardware fisico, y la integracion con tt-forge (tt-xla) aun no se ha probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), 48 capas, atencion con RoPE |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en embedding, LM head y normas; media de 9,29 bits por peso |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen2.5 es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, valores ya en la rejilla BFP8); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-14B-Instruct: un transformer decoder-only denso de 48 capas con atencion multi-cabeza con RoPE, proyecciones q, k, v, o por capa y un MLP con gate, up y down. No hay innovaciones arquitectonicas propias de esta version; el trabajo de Xylolabs se limita a la cuantizacion.

El proceso de cuantizacion usa GPTQ sobre la rejilla `bfloat8_b` de TT-NN, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador. La calibracion se realizo sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado son ficheros bf16 en los que cada valor ya esta en la rejilla BFP8, de forma que TT-NN los empaqueta directamente sin recuantizacion adicional. El repositorio incluye `quant4.json`, que documenta el formato de cada proyeccion, y scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) para comprobar que ningun valor cambia al empaquetar. No se dispone de informacion sobre el entrenamiento original del modelo base ni sobre si hubo RLHF o DPO en esta version.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen2.5-14B-Instruct base.
- Razonamiento, matematicas y generacion de codigo (capacidades del modelo base, no reevaluadas en esta version).
- Tool calling y function calling (soporte del modelo base Qwen2.5-Instruct).
- Razonamiento multi-paso y uso en flujos de agentes (capacidad del modelo base).
- Capacidades multilingues del modelo base, aunque los metadatos de esta ficha declaran solo `en`.
- Ejecucion en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos BFP8.
- Verificacion de integridad de pesos mediante scripts incluidos (`pack_tensix.py`, `verify_grid.py`).

## Casos de uso

- Despliegue de un LLM de 14B en NPU Tenstorrent: el checkpoint esta pensado para ejecutarse en TT-NN sobre Wormhole o Blackhole, reduciendo la huella a 17,15 GB empaquetados frente a 29,54 GB en BF16, lo que facilita que quepa en la DRAM del acelerador.
- Inferencia conversacional en entornos con presupuesto de memoria ajustado: al mantener una media de 9,29 bits por peso, se puede servir un modelo de 14B donde un BF16 no cabria, con una perdida de calidad medida de solo 0,00248 de KL medio respecto a BF16.
- Evaluacion de pipelines de cuantizacion BFP8: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que el empaquetado en TT-NN reproduce exactamente los valores, util para validar toolchains antes de produccion.
- Prototipado en el simulador ttsim de Blackhole: el autor valido el modelo con ttnn 0.81.1 en simulacion, lo que sirve para desarrollar y depurar integraciones sin hardware fisico.
- Sustitucion de un checkpoint BF16 en demos de tt-transformers: con `--use_hf_rope` y la configuracion de precision indicada, el prefill de 2 capas coincidio con transformers con PCC 0.9995, lo que permite usar el modelo en demos de texto del repositorio tt-metal.
- Investigacion sobre cuantizacion block floating point: al conservar el exponente compartido por bloque, el checkpoint es un caso de estudio para medir el impacto de BFP8 frente a Q4_K_M (KL 0,00248 frente a 0,0923) en tareas de generacion.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP8) | 9,29 | 17,154 | 0,00248 | 98,40 | 31 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,0923 | 90,34 | 31 de 33 | 1 |

Los datos de KL y top-1 cubren 16,1 (la informacion proporcionada se corta en ese punto). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 17,15 GB empaquetados en BFP8; el repositorio ocupa 29,5 GB por incluir tensores bf16 y metadatos.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Validacion: ttnn 0.81.1 sobre ttsim, el simulador de Blackhole; no probado en hardware fisico segun el autor.
- GPU consumer: no es el objetivo del checkpoint; para ejecucion en GPU habria que usar el modelo base o una cuantizacion GGUF, no este formato BFP8.
- Despliegue: TT-NN (tt-metal v0.81.1), tt-transformers con `--use_hf_rope`; tt-forge (tt-xla) aun no probado con este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Bits por peso | Tamano (GB) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP8 | 14,77B | 9,29 | 17,154 | no disponible | apache-2.0 | Hugging Face, para Tensix |
| Qwen/Qwen2.5-14B-Instruct (BF16) | 14,77B | 16 | 29,54 | no disponible | apache-2.0 | Hugging Face, GPU/CPU |
| Qwen2.5-14B-Instruct Q4_K_M (llama.cpp) | 14,77B | 4,87 | 8,988 | no disponible | apache-2.0 | GGUF, llama.cpp |

## Limitaciones y advertencias

- Solo validado en el simulador ttsim de Blackhole con ttnn 0.81.1; el autor indica explicitamente que no se ha probado en hardware fisico.
- La integracion con tt-forge (tt-xla) no se ha ejecutado con este checkpoint; por defecto tt-forge mantiene bf16, y sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en el layout [out, in] de PyTorch.
- El demo de tt-transformers empaqueta el LM head en bfloat8_b, por lo que el head bf16 de este checkpoint no es exacto en ese demo.
- Es necesario pasar `--use_hf_rope`; sin esa opcion el demo permuta las filas de q y k y recuantiza el QKV fusionado.
- Los metadatos declaran solo el idioma `en`, aunque el modelo base es multilingue; no se han reevaluado las capacidades multilingues tras la cuantizacion.
- Riesgo de alucinacion y sesgos del modelo base no reevaluados en esta version cuantizada.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-14B-Instruct.
- Solo se ha verificado el empaquetado exacto de las proyecciones de las 2 primeras capas y un prefill de 2 capas (PCC 0.9995); no hay validacion completa de las 48 capas en hardware.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP8/blob/main/LICENSE
