# Xylolabs/Qwen3-4B-Tensix-BFP4

## Resumen

Qwen3-4B-Tensix-BFP4 es una cuantizacion del modelo Qwen3-4B de Alibaba Qwen, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer densa del Qwen3-4B original, con 36 capas, pero sustituye el formato de las proyecciones de atencion (q, k, v, o) y de las proyecciones MLP (gate, up, down) por `bfloat4_b` (BFP4, block floating point de 4 bits), mientras que el LM head, los embeddings y las normas permanecen en bf16.

El objetivo es claro: reducir el peso del modelo de 8,04 GB en bf16 a 2,822 GB empaquetado para Tensix, permitiendo desplegar un modelo de 4.400 millones de parametros en hardware de inferencia de bajo consumo. La cuantizacion se realizo con GPTQ y una busqueda de exponente por bloque, y se publica junto con las herramientas de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) en el repositorio `tensix-bfp-gptq`.

Es relevante para desarrolladores que trabajan con aceleradores Tenstorrent y necesitan un modelo conversacional de tamano medio con licencia Apache 2.0, sin depender de GPUs NVIDIA. La perdida de calidad frente a bf16 es medible y acotada: KL media de 0,0711 frente a 0,0658 de la cuantizacion Q4_K_M de llama.cpp (un factor de 1,08).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atencion y MLP; bf16 en LM head, embeddings y normas; compatible tambien con empaquetado en `bfloat8_b` |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` e indice de shards) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B original: un transformer denso de 36 capas con atencion multi-cabeza y proyecciones MLP convencionales. La innovacion de esta version no esta en la arquitectura sino en el formato numerico: las 36 capas tienen sus siete proyecciones (q, k, v, o, gate, up, down) cuantizadas a BFP4, un formato de coma flotante por bloques que comparte exponente entre grupos de valores y almacena mantisas de 4 bits. El archivo `quant4.json` documenta el formato de cada proyeccion.

El proceso de cuantizacion emplea GPTQ con una busqueda de exponente por bloque, y el autor publica las herramientas de empaquetado y verificacion en el repositorio `tensix-bfp-gptq` (commit 5c52065, release v0.1.0). No se dispone de informacion sobre los datos de entrenamiento originales del Qwen3-4B ni sobre si se aplico RLHF o DPO en esta version cuantizada; esta ultima hereda el comportamiento del modelo base sin reentrenamiento adicional.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas en formato instructivo, heredado de Qwen3-4B.
- Ejecucion en NPU Tensix mediante kernels propios (`tensix-kernels` v0.1.0) y runner (`tensix-runner` v0.1.0).
- Compatibilidad con `tt-transformers` (tt-metal v0.81.1) y con el backend `tt` de `torch.compile` via tt-forge.
- Inferencia estandar en transformers con `dtype="bfloat16"` y `device_map="auto"` para GPUs convencionales.
- Capacidades multilingues, de codigo, matematicas o tool calling: no documentadas en la informacion proporcionada (dependen del modelo base Qwen3-4B, pero esta ficha no dispone de datos verificados al respecto).

## Casos de uso

- Inferencia en aceleradores Tenstorrent: el caso principal. Un equipo con Wormhole o Blackhole puede desplegar un modelo de 4.400 millones de parametros en 2,822 GB empaquetados, liberando DRAM frente a los 8,04 GB en bf16 y permitiendo mayor tamano de lote o contexto en el mismo hardware.
- Servicio conversacional de bajo consumo: al reducir el peso a aproximadamente un tercio, se puede mantener un endpoint de generacion de texto con plantilla de chat en una sola NPU, adecuado para asistentes internos o prototipos.
- Evaluacion de cuantizacion BFP4: investigadores que comparan formatos de bloque pueden usar este modelo como referencia reproducible, ya que incluye `verify_grid.py` y `pack_tensix.py` para validar que cada matriz empaquetada coincide con la version en torch.
- Integracion en pipelines con tt-forge: el ejemplo con `torch.compile(backend="tt")` permite incorporar el modelo a flujos PyTorch/XLA existentes sin reescribir el codigo de inferencia.
- Despliegue en entornos sin GPU NVIDIA: organizaciones con hardware Tenstorrent pueden servir generacion de texto sin depender de CUDA, usando la misma API de transformers.
- Prototipado de aplicaciones sobre tt-metal: el runner y los kernels publicados permiten medir latencia y throughput en configuraciones de precision mixta (`precision_cfg` con bfp4, bfp8 y activaciones mixtas) antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

| Metrica | Este modelo (BFP4) | llama.cpp Q4_K_M | Referencia bf16 |
|---|---:|---:|---:|
| Tamano (GB) | 2,822 (empaquetado Tensix) | no disponible | 8,04 |
| KL media frente a bf16 | 0,0711 | 0,0658 | 0 (referencia) |
| Top-1 (%) | no disponible en la informacion proporcionada | no disponible | no disponible |

El unico dato cuantitativo publicado es la divergencia KL media frente al modelo en bf16: 0,0711 para BFP4 frente a 0,0658 para Q4_K_M, es decir, 1,08 veces la del cuantizado de llama.cpp. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 2,822 GB empaquetado para Tensix; el repositorio completo ocupa 8,8 GB, por lo que se necesita ese espacio en disco para descargar todos los shards.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole, con tt-metal v0.81.1 y `--use_hf_rope`.
- GPU convencionales: el modelo puede cargarse en transformers con `dtype="bfloat16"`, lo que implica aproximadamente 8,8 GB de memoria en GPU; cabe en RTX 4090 (24 GB), A100 (40/80 GB) y H100, pero no en GPUs consumer de 8 GB en ese formato.
- Despliegue en Tensix: `tt-transformers` (tt-metal v0.81.1), tt-forge con `pjrt-plugin-tt==1.4.0`, y los paquetes `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0.
- Despliegue en GPU: transformers con `device_map="auto"`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a la demo `simple_text_demo.py` con `-k "performance and batch-1"` para medirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3-4B-Tensix-BFP4 (este) | 4.411 M | no disponible | BFP4 + bf16 | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3-4B (base) | 4.411 M | no disponible | bf16 | Apache 2.0 | GPU/CPU genericos |
| Qwen3-4B en Q4_K_M (llama.cpp) | 4.411 M | no disponible | Q4_K_M | Apache 2.0 | CPU/GPU via llama.cpp |

La comparativa se limita al modelo base y a su cuantizacion Q4_K_M, que es la referencia que el propio autor emplea para medir la perdida de calidad. No se dispone de datos sobre otros modelos de 4.000 millones de parametros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia medible frente a bf16 (KL media 0,0711), superior a la de Q4_K_M (0,0658); en tareas sensibles a la precision numerica puede degradar la calidad de forma apreciable.
- El modelo esta pensado para Tensix; fuera de ese hardware se ejecuta en bf16, con lo que se pierde la ventaja de tamano y no se aprovecha la cuantizacion.
- No se documentan los idiomas soportados ni la longitud de contexto en la informacion disponible; no se deben asumir valores del Qwen3-4B original sin verificarlos.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada; al ser una cuantizacion, hereda los del modelo base sin mitigacion adicional.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B y de las herramientas auxiliares (`tensix-bfp-gptq`, `tensix-kernels`, `tensix-runner`) antes de un despliegue en produccion.
- El repositorio tiene 229 descargas y 0 likes en el momento de la consulta; el soporte de la comunidad es minimo y la validacion en produccion es escasa.
- La fecha de creacion indicada (2026-11-10) es posterior a la de esta ficha; conviene verificar la vigencia de los enlaces y versiones de tt-metal citadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
