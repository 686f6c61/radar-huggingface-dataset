# Xylolabs/Muse-Glimmer-30B-Tensix-BFP8

## Resumen

Muse-Glimmer-30B-Tensix-BFP8 es una cuantización del modelo multimodal Muse-Glimmer-30B de meta-models, publicada por Xylolabs y orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El checkpoint mantiene las capas lineales de atención y MLP del decodificador de texto en formato `ttnn.bfloat8_b` (block floating point de 8 bits con exponente compartido por bloque), mientras que embeddings, LM head, normalizaciones y todo el stack de visión permanecen en bf16. El resultado son 9,22 bits por peso de media y 32,12 GB empaquetados, frente a los 55,71 GB del modelo base en bf16.

El modelo subyacente es un transformer multimodal de tipo image-text-to-text con 29.776.626.688 parámetros totales (unos 29,8 mil millones), arquitectura `muse_glimmer` integrada de forma nativa en transformers 5.x y licencia Apache 2.0. La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano, y solo se evaluó el modelo de lenguaje, no la torre de visión.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización consciente del hardware (los pesos se guardan en bf16 pero ya alineados a la rejilla BFP8, de modo que TT-NN los empaqueta sin pérdida adicional); por otro, advierte de que el checkpoint no se ha probado en hardware real, solo en el simulador ttsim de Tenstorrent con ttnn 0.81.1, y que tt-transformers no soporta esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `muse_glimmer` (decodificador de texto de 52 capas + vision tower y vision adapter) |
| Parametros totales | 29.776.626.688 (29,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales de atención (q, k, v, o, output gate) y MLP (gate, up, down) de las 52 capas; bf16 en LM head, embedding, norms, vision tower y vision adapter; media de 9,22 bits por peso |
| Idiomas soportados | no disponible (la calibración GPTQ usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP8), repo de 59,6 GB; incluye `quant4.json` con el formato de cada proyección |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base meta-models/Muse-Glimmer-30B, no un modelo entrenado desde cero. La arquitectura `muse_glimmer` combina un decodificador de lenguaje de 52 capas con un stack de visión (vision tower y vision adapter) que se mantiene íntegro en bf16. Las capas lineales del decodificador (atención q/k/v/o, output gate y MLP gate/up/down) se cuantizaron a `ttnn.bfloat8_b` mediante GPTQ adaptado a la rejilla de block floating point, preservando el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN.

El proceso de cuantización usó 65.536 tokens de calibración compuestos por WikiText-2 y Wikipedia en coreano. Los pesos resultantes se almacenan en safetensors en bf16, pero cada valor ya está sobre la rejilla BFP8, de forma que el empaquetado posterior por TT-NN es exacto (el propio autor verifica con `pack_tensix.py` y `verify_grid.py` que ningún valor cambia al empaquetar). No se dispone de información sobre el número de tokens de preentrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de visión en bf16 sin cuantizar.
- Razonamiento y respuesta a preguntas de conocimiento general (el autor reporta 39 de 40 respuestas correctas en su conjunto de evaluación, aunque no detalla el conjunto).
- Carga nativa en transformers 5.x vía `AutoModelForImageTextToText` o `MuseGlimmerForConditionalGeneration`, sin código remoto.
- Ejecución sobre Tenstorrent Tensix mediante TT-NN (`ttnn.as_tensor` con `bfloat8_b`, layout TILE y DRAM).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; solo se documenta calibración con texto en inglés y coreano.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en Wormhole o Blackhole con TT-NN, empaquetando las matrices directamente en `bfloat8_b` sin recuantizar; útil para equipos que ya operan infraestructura Tensix y quieren servir un modelo multimodal de ~30 B con 32,12 GB de pesos.
- Servicio de descripción de imágenes y VQA: al conservar la torre de visión en bf16 y el decodificador en BFP8, permite responder preguntas sobre imágenes en un pipeline `image-text-to-text` con menor huella de memoria que el modelo base.
- Evaluación de pipelines de cuantización: sirve como referencia reproducible para validar que un empaquetado BFP8 no altera los pesos (scripts `pack_tensix.py` y `verify_grid.py`) antes de llevar otros modelos a producción sobre Tensix.
- Prototipado en simulador: con ttnn 0.81.1 sobre ttsim (simulador Blackhole) se puede validar la integración y el empaquetado sin disponer de hardware físico, lo que facilita el desarrollo previo a la compra o asignación de chips.
- Despliegue tensor-parallel en QuietBox 2 o Blackhole Galaxy: el demo `muse_glimmer_30b` de tt-metal v0.81.1 ejecuta el decodificador de texto con TP 4 en cuatro chips Blackhole (QuietBox 2) o TP 4/8 en Galaxy, encajando con este checkpoint porque sus packers usan `bfloat8_b` para atención y MLP.
- Investigación sobre cuantización block floating point: el checkpoint y el repositorio `tensix-bfp-gptq` permiten estudiar el impacto de GPTQ sobre la rejilla BFP8 con métricas de divergencia KL y top-1 frente a bf16.
- Inferencia conversacional en transformers: para pruebas funcionales en GPU o CPU con `device_map="auto"` y prompts de solo texto, sin necesidad de hardware Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (meta-models/Muse-Glimmer-30B) | 16 | 55,71 | 0 | 100 | 39 de 40 | - |
| Muse-Glimmer-30B-Tensix-BFP8 | 9,22 | 32,12 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

La model card incluye una tabla de evaluación comparativa frente a BF16, pero el extracto proporcionado solo contiene la fila del modelo base; los valores de KL media, top-1 y respuestas correctas del checkpoint cuantizado no están disponibles en la información suministrada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 32,12 GB de pesos empaquetados en BFP8; en bf16 (carga en transformers) el repo ocupa 59,6 GB, por lo que se necesita al menos esa cantidad de memoria más overhead de activaciones.
- Hardware objetivo: NPUs Tenstorrent Tensix Wormhole y Blackhole; el demo de tt-metal se ejecuta en QuietBox 2 (cuatro chips Blackhole, TP 4) o Blackhole Galaxy (TP 4 u 8).
- Simulador: probado con ttnn 0.81.1 sobre ttsim (simulador Blackhole); no se ha ejecutado en hardware real según el autor.
- GPU consumer: no se documenta soporte optimizado; la carga en transformers con `device_map="auto"` requiere memoria suficiente para los 59,6 GB en bf16, lo que excede GPUs consumer habituales (RTX 4090 con 24 GB) sin offload a CPU o disco.
- Opciones de despliegue: TT-NN / tt-metal (demo `muse_glimmer_30b` v0.81.1), transformers 5.x (probado en 5.22.1), tt-forge (tt-xla) no probado con este checkpoint; tt-transformers no soporta la arquitectura.
- Latencia y throughput: no disponibles; el autor indica que una ejecución completa requiere los cuatro chips y no fue probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Muse-Glimmer-30B-Tensix-BFP8 | 29,8 B | no disponible | BFP8 + bf16 (9,22 bits/peso) | Apache 2.0 | Tenstorrent Tensix (Wormhole, Blackhole) |
| meta-models/Muse-Glimmer-30B (base) | 29,8 B | no disponible | bf16 (16 bits/peso) | Apache 2.0 | GPU/CPU genéricos |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | 29,8 B | no disponible | 4-8 bits típicos | Apache 2.0 (heredada) | GPU consumer, CPU |

No se dispone de información sobre modelos comparables de otros autores con la misma arquitectura o el mismo target de hardware en la documentación proporcionada.

## Limitaciones y advertencias

- No probado en hardware Tensix real: solo se validó en el simulador ttsim con ttnn 0.81.1; el autor indica explícitamente que una ejecución completa en QuietBox 2 no se ha realizado.
- tt-transformers no soporta la arquitectura `muse_glimmer`; el único camino de ejecución documentado en Tensix es el demo de tt-metal v0.81.1.
- El LM head se mantiene en bf16, pero el demo de tt-metal lo empaqueta en `bfloat8_b`, por lo que ese tensor no es exacto en ese entorno.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión no se ha evaluado tras la cuantización.
- La calibración GPTQ usó únicamente WikiText-2 (inglés) y Wikipedia en coreano, lo que puede sesgar la calidad en otros idiomas y dominios.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de fidelidad factual más allá del conjunto de 40 preguntas del autor.
- Idiomas soportados no declarados oficialmente; el soporte multilingüe no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y limitaciones del modelo base meta-models/Muse-Glimmer-30B.
- El checkpoint está pensado para TT-NN; cargarlo en transformers sin empaquetar en Tensix no aprovecha la cuantización y requiere memoria para los 59,6 GB del repo.
- tt-forge (tt-xla) no se ha probado con este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Muse-Glimmer-30B-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal Muse-Glimmer-30B (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/muse_glimmer_30b
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2610.24628): https://arxiv.org/abs/2610.24628
