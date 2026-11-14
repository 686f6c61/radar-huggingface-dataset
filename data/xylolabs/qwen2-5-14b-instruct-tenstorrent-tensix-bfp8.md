# Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP8

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP8 es una cuantizacion del modelo Qwen2.5-14B-Instruct de Alibaba Qwen, adaptada especificamente para su ejecucion en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs, que ha aplicado GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` (BFP8) que emplea el stack TT-NN de Tenstorrent, de modo que las matrices cuantizadas se empaquetan sin alterar sus valores en el hardware.

El modelo conserva la arquitectura transformer decoder-only del Qwen2.5-14B-Instruct original, con 14.770.033.664 parametros totales, y solo modifica las proyecciones lineales de atencion (q, k, v, o) y de la MLP (gate, up, down) en las 48 capas. El resto de tensores (embeddings, LM head, normalizaciones) permanece en bf16. El resultado ocupa aproximadamente 17,15 GB empaquetado en el dispositivo, con una media de 9,29 bits por peso.

La relevancia de esta ficha radica en que es un ejemplo practico de porting de un LLM denso de 14B al ecosistema Tenstorrent, una alternativa de aceleracion no-GPU. Para desarrolladores que evaluan hardware alternativo o que necesitan desplegar Qwen2.5 en NPU, este checkpoint documenta el flujo de cuantizacion, verificacion y ejecucion con tt-metal y tt-forge, aunque su adopcion es todavia muy temprana (53 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 48 capas |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-14B-Instruct, 32.768 tokens segun la documentacion oficial del modelo base, no confirmado en esta ficha) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en proyecciones lineales; bf16 en embeddings, LM head y normas; media de 9,29 bits por peso |
| Idiomas soportados | en (segun la model card y los tags; el modelo base soporta mas idiomas, pero esta ficha solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), empaquetado para TT-NN en DRAM del dispositivo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-14B-Instruct: un transformer decoder-only denso con 48 capas, atencion multi-cabeza con RoPE y MLP con activacion SwiGLU. Esta version no reentrena el modelo; aplica GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` que utiliza el stack TT-NN, calibrando con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El proceso mantiene el exponente compartido de cada bloque tal como lo fija el empaquetador de Tenstorrent, de forma que la conversion a `ttnn.bfloat8_b` es exacta (los valores no cambian al empaquetar).

La innovacion tecnica principal es el propio formato: BFP8 es un formato de coma flotante por bloques con exponente compartido por bloque de 32 valores, lo que permite al hardware Tensix procesar matrices de forma nativa sin necesidad de desempaquetar a bf16. El repositorio incluye scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) y un fichero `quant4.json` que documenta el formato de cada proyeccion. La ejecucion se ha validado con ttnn 0.81.1 sobre el simulador ttsim de Blackhole y con tt-transformers de tt-metal v0.81.1, donde un prefill de 2 capas coincidio con transformers con PCC 0.9995. No se ha ejecutado todavia con tt-forge (tt-xla), que por defecto mantiene los pesos en bf16.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen2.5-14B-Instruct.
- Razonamiento, matematicas y generacion de codigo (capacidades del modelo base, no reevaluadas en esta cuantizacion).
- Soporte de plantilla de chat (`apply_chat_template`) y formato conversacional multi-turno.
- Compatibilidad con `text-generation-inference` y endpoints compatibles, segun los tags del repositorio.
- Ejecucion en NPU Tensix (Wormhole, Blackhole) mediante TT-NN y tt-transformers.
- Capacidades multilingues del modelo base no estan declaradas en esta ficha (solo se lista `en`).
- No se documentan capacidades de vision, audio, tool calling ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso de uso principal es ejecutar un LLM de 14B en NPU Wormhole o Blackhole sin GPU, aprovechando el empaquetado nativo BFP8 para reducir el consumo de DRAM del dispositivo a 17,15 GB.
- Evaluacion de alternativas a GPU en centros de datos: permite comparar latencia y throughput de un modelo denso de 14B en Tensix frente a A100/H100 en tareas de generacion de texto, con la ventaja de un stack de cuantizacion verificado.
- Prototipado de pipelines de inferencia en tt-metal: util para equipos que desarrollan sobre tt-transformers y necesitan un checkpoint de referencia con una demo funcional (simple_text_demo.py) y configuraciones de precision documentadas.
- Generacion de texto en ingles para asistentes conversacionales: el modelo conserva la plantilla de chat y el comportamiento del Qwen2.5-14B-Instruct, adecuado para tareas de respuesta a preguntas y resumen en ingles.
- Investigacion en cuantizacion BFP: sirve como caso de estudio reproducible de GPTQ sobre rejilla bfloat8_b, con scripts de verificacion de integridad de la rejilla y comparativa de KL frente a BF16.
- Base para experimentos de cuantizacion mas agresiva: la model card remite a la version BFP4 (QKV8/Down8) para dispositivos con menos memoria, lo que permite estudiar el compromiso entre precision y huella de memoria en el mismo hardware.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion comparativa frente a BF16, pero en la informacion proporcionada solo se han conservado las cabeceras (bits por peso, tamano en GB, KL medio respecto a BF16, Top-1 y respuestas correctas), sin los valores numericos de las filas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | BF16 (base) | BFP8 (esta ficha) |
|---|---|---|
| Bits por peso | no disponible | 9,29 (media) |
| Tamano (GB) | no disponible | 17,15 empaquetado |
| KL medio vs BF16 | referencia | no disponible |
| Top-1 (%) | no disponible | no disponible |
| Respuestas correctas | no disponible | no disponible |

## Requisitos de hardware

- VRAM/NPU: aproximadamente 17,15 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, mas espacio para la cache KV y buffers. La model card recomienda la version BFP4 en dispositivos con menos memoria.
- GPU: el checkpoint esta pensado para NPU Tensix (Wormhole, Blackhole), no para GPU. La carga en transformers con `device_map="auto"` requiere aproximadamente 29,5 GB de repo en disco y suficiente memoria para bf16 (unos 30 GB).
- Consumer GPU: no es el objetivo; en una RTX 4090 (24 GB) no cabria en bf16 sin cuantizacion adicional, y el formato BFP8 no es utilizable directamente en GPU.
- Despliegue: transformers (con `dtype="bfloat16"`), tt-transformers de tt-metal v0.81.1 (con `--use_hf_rope`), tt-forge (tt-xla, no probado con este checkpoint), y TGI segun los tags.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card menciona una demo de rendimiento con batch-1 en tt-transformers, pero no se incluyen cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP8 | 14,77B | no disponible | BFP8 (9,29 bits/peso) | Apache-2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | 32.768 tokens (segun doc oficial del base) | bf16 | Apache-2.0 | GPU/CPU |
| Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-QKV8-Down8 | no disponible | no disponible | BFP4 con QKV8/Down8 | Apache-2.0 (presumible) | NPU Tensix con menos memoria |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP8 introduce perdida de precision frente a BF16; la model card reporta metricas de KL y Top-1 pero los valores no estan disponibles en esta ficha, por lo que no se puede cuantificar el deterioro.
- El modelo solo declara soporte de ingles en esta ficha, aunque el base Qwen2.5-14B-Instruct es multilingue; el calibrado incluyo Wikipedia en coreano, pero no se garantiza calidad en otros idiomas.
- Riesgo de alucinacion inherente al modelo base Qwen2.5-14B-Instruct, no mitigado por la cuantizacion.
- La ejecucion esta validada solo con ttnn 0.81.1 y tt-transformers v0.81.1; tt-forge no se ha probado con este checkpoint y su modo por defecto (bf16) no aprovecha la cuantizacion.
- El demo de tt-transformers empaqueta la cabeza en bfloat8_b, por lo que la LM head en bf16 de este checkpoint no es exacta en esa demo.
- Es necesario pasar `--use_hf_rope` en tt-transformers; sin ello, el demo permuta las filas q y k y recuantiza el QKV fusionado.
- Adopcion muy temprana (53 descargas, 0 likes) y sin resultados de benchmarks estandar publicados; no recomendable para produccion sin validacion propia.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base y del stack Tenstorrent deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Version BFP4: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-QKV8-Down8
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de referencia (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
