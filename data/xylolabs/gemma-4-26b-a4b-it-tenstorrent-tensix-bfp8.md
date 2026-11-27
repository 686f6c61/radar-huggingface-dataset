# Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 26B-A4B-it es un modelo multimodal de Google (familia Gemma 4) con arquitectura Mixture of Experts, disenado para generacion de texto e imagen-a-texto. Esta ficha concreta, publicada por Xylolabs, es una version cuantizada del checkpoint oficial adaptada especificamente para las NPU Tensix de Tenstorrent (Wormhole y Blackhole), empleando el formato de coma flotante en bloque `bfloat8_b` (BFP8) sobre una rejilla GPTQ.

La relevancia de esta publicacion radica en que no se trata de una cuantizacion generica para GPU, sino de un empaquetado orientado al hardware de Tenstorrent: las proyecciones de atencion, MLP y expertos enrutados se almacenan en BFP8, mientras que el LM head, los embeddings, las normas y el torre de vision permanecen en bf16. El resultado ocupa 27,513 GB empaquetados, frente a los 50,47 GB del checkpoint bf16 original.

El modelo base tiene 26.544.133.710 parametros totales (segun los safetensors del repo) y una ventana de contexto que no se especifica en la informacion disponible. La ficha se centra en el artefacto cuantizado y su fidelidad numerica respecto al modelo original, con una divergencia KL media de 0,00804 frente a bf16, muy inferior a la de una cuantizacion Q4_K_M convencional (0,1249).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal (texto + imagen) |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) con GPTQ sobre rejilla BFP8; existe variante BFP4 del mismo autor |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix, 27,513 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos: la model card menciona proyecciones de "routed experts" junto a un "shared MLP", lo que indica un esquema MoE con al menos un experto compartido y expertos enrutados por token. La cuantizacion afecta a 30 capas, con las proyecciones q, k, o de atencion y gate, up, down del MLP y de los expertos enrutados en `bfloat8_b`; el router y su escala por experto se mantienen en bf16. El modelo incorpora ademas un `vision_tower` y un `embed_vision`, ambos preservados en bf16 sin cuantizar.

El proceso de cuantizacion es GPTQ aplicado sobre la rejilla de `bfloat8_b`, con las herramientas `pack_tensix.py` y `verify_grid.py` incluidas en el repositorio para verificar la integridad de cada matriz (ida y vuelta a traves de ttnn, opcionalmente con round-trip por DRAM del dispositivo). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de vision en bf16.
- Razonamiento y respuesta multi-turno heredados del modelo instruct base.
- Capacidades multilingues: la evaluacion del autor cubre texto en ingles y coreano, aunque no se detalla la lista completa de idiomas.
- No se especifica en la informacion disponible soporte de tool calling, function calling ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal es ejecutar un modelo de 26B parametros en NPU Wormhole o Blackhole con 27,5 GB de pesos, aprovechando el formato BFP8 nativo de Tensix para reducir el ancho de banda de memoria.
- Prototipado en simulador: el autor valida el empaquetado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, lo que permite desarrollar kernels y pipelines sin hardware fisico.
- Sustitucion de cuantizaciones de 4 bits en produccion: con una KL media de 0,00804 frente a bf16 (frente a 0,1249 de Q4_K_M), es adecuado cuando se necesita alta fidelidad al modelo original y el espacio de 27,5 GB es aceptable.
- Investigacion en cuantizacion de bajo nivel: la rejilla BFP8 con GPTQ y las herramientas de verificacion permiten estudiar el impacto del formato en bloque sobre la calidad por capa.
- Aplicaciones multimodales en el borde: la preservacion del `vision_tower` en bf16 permite tareas de descripcion de imagenes y VQA sobre aceleradores de Tenstorrent con memoria limitada.
- Evaluacion comparativa de precision: util como referencia para medir divergencia KL y top-1 frente al checkpoint bf16 en pipelines de validacion de cuantizaciones.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a bf16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 50,47 | 0 | 100 |
| Este modelo (BFP8) | 27,513 | 0,00804 | 96,97 |
| Q4_K_M (llama.cpp) | 16,796 | 0,1249 | 88,16 |

La evaluacion cubre 8.048 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), aplicando la plantilla de chat. La Q4_K_M de referencia se genero con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 27,513 GB de pesos empaquetados en BFP8; en GPU con transformers se carga en bf16, lo que requiere aproximadamente 53 GB de memoria (el repo pesa 53,1 GB).
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole); validado con ttnn 0.81.1 sobre el simulador Blackhole (`ttsim`).
- GPU consumer: no cabe en tarjetas de 24 GB en bf16; la variante BFP4 del mismo autor esta pensada para dispositivos con menos memoria.
- Despliegue: `transformers` con `device_map="auto"` para carga en GPU; en Tensix, mediante `ttnn.as_tensor` con `ttnn.bfloat8_b`, `TILE_LAYOUT` y `DRAM_MEMORY_CONFIG`, junto con los paquetes `tensix-kernels` y `tensix-runner` v0.1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 26,54B totales | no disponible | 27,513 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| gemma-4-26B-A4B-it (bf16) | 26,54B totales | no disponible | 50,47 GB | Apache 2.0 | GPU / TPU |
| Variante BFP4 (Xylolabs) | 26,54B totales | no disponible | no disponible | Apache 2.0 | Tensix con menos memoria |
| Q4_K_M (llama.cpp) | 26,54B totales | no disponible | 16,796 GB | Apache 2.0 (derivada) | CPU / GPU |

## Limitaciones y advertencias

- La cuantizacion BFP8 introduce una divergencia medible frente a bf16 (KL 0,00804, top-1 96,97 %); no es equivalente bit a bit al modelo original.
- El empaquetado esta disenado para Tensix; su uso en GPU pasa por cargar los pesos en bf16, perdiendo la ventaja de tamano y requiriendo unos 53 GB de memoria.
- La evaluacion de fidelidad se limita a 8.048 posiciones de ingles y coreano; no hay datos sobre otros idiomas ni sobre tareas de razonamiento o codigo.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento en contextos largos.
- La licencia declarada es Apache 2.0 segun la model card del modelo base, pero el repositorio original no incluye fichero LICENSE; el autor aporta el texto estandar y un NOTICE con los cambios.
- El autor no esta afiliado a Tenstorrent; el soporte de hardware depende de la compatibilidad con ttnn 0.81.1 y versiones posteriores.
- Solo 215 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy reducido.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado: arxiv:2607.02770
