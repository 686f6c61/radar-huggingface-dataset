# Xylolabs/gemma-4-E2B-it-Tensix-BFP8

## Resumen

Gemma 4 E2B IT Tensix BFP8 es una cuantizacion del modelo multimodal `google/gemma-4-E2B-it` de Google, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la pipeline `any-to-any` del original (texto, imagen y audio) y aplica cuantizacion de bloque en coma flotante (`bfloat8_b`, BFP8) sobre las proyecciones de atencion y MLP, manteniendo en bf16 el LM head, los embeddings, las normas y las torres de vision y audio.

El problema que resuelve es el despliegue eficiente del modelo base en hardware Tensix: reduce el peso empaquetado de 9,29 GB (bf16) a 7,556 GB, con una degradacion minima respecto al original. Segun la model card, la divergencia KL media frente a bf16 es de 0,00239 (top-1 del 98,29 %), muy inferior a la de una cuantizacion Q4_K_M de llama.cpp (KL 0,29329, top-1 80,25 %) pese a ocupar mas espacio que esta.

El modelo base cuenta con 5.525.831.235 parametros segun los safetensors del repositorio. La model card no detalla la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo original, por lo que esos datos se marcan como no disponibles. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen y audio); detalles completos del modelo base no disponibles |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en proyecciones de atencion y MLP; bf16 en LM head, embeddings, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower`. Existe una variante BFP4 en otro repositorio |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix; 7,556 GB) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base mas alla de su naturaleza multimodal (`any-to-any`) y de la estructura de capas que aparece en la tabla de formatos: 35 capas con proyecciones q, o, gate, up y down, y 15 capas con proyecciones k y v. El LM head esta atado al embedding. Las torres de vision y audio se mantienen sin cuantizar en bf16.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion: GPTQ aplicado sobre la rejilla `bfloat8_b` de Tenstorrent, con verificacion de cada matriz mediante `pack_tensix.py` y `verify_grid.py`. El proceso se valida comparando la ida y vuelta a traves de la DRAM del dispositivo Tensix con el tensor original en torch. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de vision en bf16.
- Procesamiento de audio, con `audio_tower` y `embed_audio` en bf16.
- Inferencia en NPU Tensix (Wormhole y Blackhole) mediante `ttnn`, `tt-metal` y `tt-forge`.
- Ejecucion tambien en `transformers` estandar con `dtype="bfloat16"` y `device_map="auto"`.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el modelo esta empaquetado para cargarse directamente en NPU Wormhole y Blackhole mediante `ttnn`, lo que permite ejecutar inferencia multimodal sin GPU convencional.
- Sustitucion de bf16 en produccion con restricciones de memoria: al ocupar 7,556 GB frente a 9,29 GB, encaja en dispositivos Tensix con menos DRAM manteniendo un top-1 del 98,29 % respecto al original.
- Asistentes multimodales en el borde: la pipeline `any-to-any` permite construir interfaces que reciben imagen, audio y texto y devuelven texto, con las torres sensoriales intactas en bf16.
- Evaluacion y prototipado en `transformers`: el quickstart con `AutoModelForCausalLM` permite validar el comportamiento del modelo cuantizado en GPU antes de portarlo a Tensix.
- Procesamiento de documentos con imagen: al conservar `vision_tower` en bf16, es adecuado para tareas de comprension de imagenes donde la precision de la torre visual es critica.
- Investigacion en cuantizacion: el repositorio incluye las herramientas de empaquetado y verificacion, lo que lo convierte en una referencia reproducible para estudiar GPTQ sobre rejillas de bloque en coma flotante.
- Alternativa de baja memoria: la model card remite a la variante BFP4 para dispositivos con menos memoria, lo que permite escalar el mismo modelo a hardware mas limitado.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 9,29 | 0 | 100 |
| Este modelo (BFP8) | 7,556 | 0,00239 | 98,29 |
| Q4_K_M (llama.cpp) | 3,428 | 0,29329 | 80,25 |

Las metricas de KL y top-1 se calculan sobre 7.968 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con la plantilla de chat. La Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,556 GB empaquetado para Tensix; 9,29 GB en bf16 para ejecucion en `transformers`.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- GPU convencionales: no se especifican modelos recomendados (A100, H100, RTX 4090); el quickstart usa `device_map="auto"` con bf16, por lo que se requiere una GPU con al menos ~10 GB de memoria para el modelo completo.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: `transformers`, `ttnn`/`tt-metal`/`tt-forge` (kernels y runner `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0), y herramientas `tensix-bfp-gptq` v0.1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 5.525.831.235 | no disponible | 7,556 GB | Apache 2.0 | Hugging Face |
| `google/gemma-4-E2B-it` (bf16) | 5.525.831.235 | no disponible | 9,29 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp | 5.525.831.235 | no disponible | 3,428 GB | Apache 2.0 | generado localmente |
| Variante BFP4 (`gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP`) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo checkpoint, ya que la informacion proporcionada no incluye modelos alternativos de otros autores.

## Limitaciones y advertencias

- La cuantizacion introduce una divergencia respecto a bf16 (KL 0,00239, top-1 98,29 %), por lo que no es equivalente bit a bit al modelo original.
- El modelo esta empaquetado para Tensix; su uso fuera de ese hardware requiere cargarlo en `transformers` en bf16, lo que anula parte del ahorro de memoria.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada.
- No se especifican los idiomas soportados oficialmente; la evaluacion solo cubre ingles y coreano.
- La licencia Apache 2.0 permite uso comercial, pero la model card advierte de que el repositorio del modelo base no incluye fichero LICENSE y el `LICENSE` de este repositorio contiene el texto estandar.
- Es una cuantizacion de un modelo de terceros: los cambios se documentan en `NOTICE`, pero la responsabilidad sobre el comportamiento del modelo base recae en su autor original.
- No hay datos de latencia ni throughput, lo que impide estimar costes de produccion en Tensix.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper (Gemma 4 Technical Report): arXiv:2607.02770
