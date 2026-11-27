# Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4

## Resumen

Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo Mistral Ministral-3-14B-Instruct-2512-BF16, realizada por Xylolabs y empaquetada especificamente para aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base es un transformer de 13.506.073.600 parametros orientado a generacion de texto conversacional, publicado por Mistral AI bajo licencia Apache 2.0. Esta variante no es un modelo nuevo: es una conversion de pesos que reduce el tamano empaquetado de 27,01 GB en bf16 a 10,576 GB, manteniendo la estructura de 40 capas del original.

El problema que resuelve es el despliegue eficiente del modelo sobre hardware NPU de Tenstorrent, que no ejecuta de forma nativa los formatos habituales de cuantizacion de GPU (GGUF, AWQ, GPTQ en safetensors convencionales). Xylolabs aplica GPTQ con busqueda de exponente por bloque para producir tensores en block floating point `bfloat4_b` (BFP4) en las proyecciones MLP y `bfloat8_b` (BFP8) en las proyecciones de atencion, dejando embeddings, LM head y normalizaciones en bf16. El resultado es un repositorio que se puede cargar tanto con `transformers` en GPU convencional como empaquetar en el runtime `ttnn`/`tt-metal` para ejecucion en silicio Tensix.

La relevancia actual es doble: por un lado, ofrece una via practica para llevar un modelo de 14B a NPUs de Tenstorrent con una perdida de fidelidad medida (KL media 0,0185 frente a bf16, un 26 % peor que Q4_K_M de llama.cpp, que obtiene 0,0147); por otro, el modelo es solo texto: el vision tower y su proyector se han eliminado, por lo que no hereda las capacidades multimodales que pudiera tener el base. La ventana de contexto y los detalles de entrenamiento no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral3ForCausalLM), 40 capas |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atencion q/k/v/o; bf16 en LM head, embeddings y norms |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix, 10,576 GB; repo de 27,0 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 40 capas con atencion estandar y proyecciones MLP, del que se ha conservado unicamente la parte de texto: el `config.json` corresponde al `text_config` del base expuesto como `Ministral3ForCausalLM`, y el vision tower y su proyector han sido descartados. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

La innovacion tecnica de esta variante esta en el esquema de cuantizacion: las proyecciones MLP se cuantizan a BFP4 mediante GPTQ con busqueda de exponente por bloque, mientras que las proyecciones de atencion se cuantizan a BFP8 por redondeo al vecino mas cercano. El formato block floating point comparte un exponente por bloque, lo que encaja con la unidad de computo Tensix. El repositorio incluye `quant4.json` con el formato de cada proyeccion, los scripts `pack_tensix.py` y `verify_grid.py` del proyecto `tensix-bfp-gptq`, y esta verificado con `ttnn` 0.81.1 sobre `ttsim` (simulador Blackhole). La ejecucion en hardware real se realiza con `tt-transformers` de `tt-metal` v0.81.1 pasando `--use_hf_rope`.

## Capacidades

- Generacion de texto conversacional multi-turno en 11 idiomas (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Razonamiento e instrucciones generales heredados del modelo base Ministral-3-14B-Instruct-2512.
- Generacion de codigo y matematicas: capacidad esperable del base, aunque no se documentan resultados especificos en esta variante.
- Sin capacidades de vision: el vision tower y el proyector fueron eliminados en esta conversion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Ejecucion en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`/`tt-metal`/`tt-forge`.
- Carga estandar con `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).

## Casos de uso

- Despliegue en NPUs Tenstorrent: el caso principal. El modelo esta empaquetado para ejecutarse en Wormhole y Blackhole con `tt-transformers` y `tt-metal` v0.81.1, lo que permite servir inferencia de un 14B en hardware Tensix sin GPU convencional.
- Servicio de chat multilingue: al cubrir 11 idiomas, puede atender conversaciones en espanol, frances, aleman, chino, japones o arabe desde un unico checkpoint, con el template de chat del tokenizer.
- Prototipado en simulador: el flujo con `ttsim` (simulador Blackhole) y `pack_tensix.py` permite validar kernels y precision antes de disponer de silicio, util para desarrollo de pipelines en `ttnn`.
- Evaluacion de precision de cuantizacion: con una KL media de 0,0185 frente a bf16 y comparacion directa contra Q4_K_M (0,0147), sirve como referencia para estudiar el impacto de BFP4/BFP8 en tareas de generacion.
- Generacion de codigo asistida: el modelo base esta orientado a instrucciones y puede integrarse en asistentes de codigo; esta variante reduce el peso a 10,576 GB empaquetados, lo que facilita su alojamiento en memoria de dispositivo.
- Investigacion en cuantizacion block floating point: el repositorio expone `quant4.json`, scripts de empaquetado y verificacion, lo que lo convierte en material reproducible para experimentos de GPTQ con exponente por bloque.
- Inferencia en GPU convencional como paso intermedio: al cargarse con `transformers` en bf16, permite comparar salidas contra el original antes de pasar a Tensix.

## Benchmarks y rendimiento

| Metrica | Este modelo (BFP4/BFP8) | llama.cpp Q4_K_M | Base bf16 |
|---|---|---|---|
| KL media frente a bf16 | 0,0185 | 0,0147 | 0 (referencia) |
| Ratio de KL frente a Q4_K_M | 1,26x | 1,00x | — |
| Tamano empaquetado | 10,576 GB | no disponible | 27,01 GB |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica de calidad reportada es la divergencia KL frente al modelo en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: en bf16, aproximadamente 27 GB de pesos mas overhead de activaciones y KV cache; el repo completo ocupa 27,0 GB.
- GPU recomendadas en bf16: A100 40/80 GB, H100, o configuraciones multi-GPU con `device_map="auto"`. Una RTX 4090 de 24 GB no cabe en bf16 sin offload a CPU.
- Consumer GPU: no cabe en bf16 en tarjetas de 24 GB; se requeriria una cuantizacion adicional (no incluida en este repo) para GPUs de 16-24 GB.
- Hardware objetivo: aceleradores Tenstorrent Tensix Wormhole y Blackhole, con `tt-metal` v0.81.1 y `ttnn` 0.81.1; verificado en el simulador `ttsim`.
- Opciones de despliegue: `transformers` (GPU/CPU), `tt-transformers` sobre `tt-metal` para Tensix. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs Ministral-3-14B Tensix BFP4 | 13,5B | no disponible | BFP4 MLP + BFP8 atencion | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | 13,5B | no disponible | bf16 | Apache 2.0 | GPU/CPU |
| Ministral-3-14B en Q4_K_M (llama.cpp) | 13,5B | no disponible | Q4_K_M | Apache 2.0 (base) | CPU/GPU consumer |

La comparativa se limita al propio modelo base y a la referencia Q4_K_M citada por el autor; no se dispone de datos de rendimiento en tareas que permitan comparar con otras familias de 14B.

## Limitaciones y advertencias

- Solo texto: el vision tower y el proyector han sido eliminados; no admite entradas de imagen.
- Mayor divergencia que Q4_K_M: la KL media frente a bf16 es 0,0185, un 26 % superior a la de Q4_K_M (0,0147), lo que implica mayor degradacion en la distribucion de salida.
- Dependencia de hardware y software especifico: la ejecucion optimizada requiere `tt-metal` v0.81.1, `ttnn` 0.81.1 y `tt-transformers`; el flujo en Tensix se verifico en simulador, no necesariamente en todas las configuraciones de silicio.
- Carga en `transformers` en bf16 requiere ~27 GB, lo que limita su uso a GPUs de gama alta o multi-GPU.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual para esta variante.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; se heredan los del modelo base.
- Idiomas: aunque se listan 11 idiomas, no se aportan metricas de calidad por idioma; el rendimiento fuera de ingles y las principales lenguas europeas no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base de Mistral AI y las dependencias de `tt-metal`.
- No se documenta soporte de tool calling ni de modo thinking en esta variante.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal
