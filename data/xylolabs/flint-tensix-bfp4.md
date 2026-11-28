# Xylolabs/flint-Tensix-BFP4

## Resumen

flint-Tensix-BFP4 es una cuantización del modelo base RecursiveSI/flint, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva los 39.785.287.456 parámetros del original, pero comprime las matrices de atención, MLP y expertos (ruteados y compartidos) a formato block-floating-point bfloat4_b, dejando el resto de pesos en bf16. El resultado es un checkpoint de 23,299 GB empaquetado frente a los 79,57 GB del BF16 de referencia, lo que facilita su despliegue en hardware NPU con memoria limitada.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica para GPU, sino de un artefacto empaquetado para el stack tt-metal/ttnn/tt-forge de Tenstorrent, con scripts de verificación incluidos (`pack_tensix.py`, `verify_grid.py`). Esto permite a los desarrolladores validar el round-trip de los pesos empaquetados contra la representación en torch antes de desplegar en producción.

El modelo se distribuye bajo licencia Apache 2.0, igual que el base, y está etiquetado como text-generation. La model card reporta una calidad de cuantización medida con divergencia KL sobre 16.320 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), con una media de KL de 0,374 frente al BF16, y una tasa de acierto de 33/33 en un conjunto fijo de prompts de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base RecursiveSI/flint; pesos cuantizados para Tenstorrent Tensix) |
| Parametros totales | 39.785.287.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (block-floating-point) en atención, MLP y expertos ruteados/compartidos; bf16 en el resto |
| Idiomas soportados | no disponible (evaluación KL realizada sobre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetados para ttnn; incluye `quant4.json` e índice de shards) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base RecursiveSI/flint en la documentación proporcionada. La model card de esta cuantización no describe el tipo de transformer, el número de capas, la configuración de atención ni si se trata de un modelo denso o de mezcla de expertos (MoE); la mención a "expertos ruteados y compartidos" en la tabla de carpetas sugiere una topología MoE, pero no se confirma explícitamente ni se detallan parámetros activos.

El proceso de cuantización sí está documentado a nivel de artefacto: se aplica block-floating-point bfloat4_b a las matrices de atención, MLP y expertos, manteniendo bf16 en el resto de tensores. El repositorio incluye `pack_tensix.py` para empaquetar las matrices en el formato ttnn y `verify_grid.py` para verificar el round-trip de los valores empaquetados contra torch, con opción `--device` para validar en hardware real. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, ya que esta ficha cubre una cuantización, no un entrenamiento desde cero.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` y `AutoTokenizer` de Transformers (se requiere Transformers 5.22.2 o superior para el quickstart).
- Aplicación de plantilla de chat (`apply_chat_template`) con soporte de roles user/assistant, lo que permite conversaciones multi-turno.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn, con layouts TILE_LAYOUT y memoria DRAM.
- Cuantización selectiva que preserva bf16 en capas no críticas, manteniendo coherencia numérica verificable mediante `verify_grid.py`.
- Soporte de inferencia en GPU/CPU mediante Transformers con `dtype="bfloat16"` y `device_map="auto"` (el checkpoint empaquetado se puede cargar en torch, aunque el objetivo principal es Tensix).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado para Wormhole y Blackhole, por lo que se puede cargar directamente en ttnn con `ttnn.as_tensor` y ejecutar inferencia sin conversión adicional, aprovechando el formato bfloat4_b nativo del hardware.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que el round-trip de pesos empaquetados coincide con la representación torch, útil en CI para detectar regresiones en el proceso de cuantización.
- Generación de texto en entornos con memoria limitada: el checkpoint de 23,299 GB frente a los 79,57 GB del BF16 facilita el despliegue en nodos NPU con DRAM restringida, manteniendo una KL media de 0,374 respecto al original.
- Chat multi-turno: el soporte de plantilla de chat y la evaluación sobre texto en formato chat (según la metodología KL) permiten usar el modelo en asistentes conversacionales, aunque no se documentan evaluaciones específicas de diálogo.
- Investigación en cuantización block-floating-point: sirve como referencia reproducible para estudiar el impacto de bfloat4_b en modelos de ~40B parámetros, con métricas KL publicadas sobre WikiText-2 y Wikipedia coreana.
- Evaluación comparativa de formatos: la tabla de la model card incluye una referencia Q4_K_M de llama.cpp (24,167 GB, KL 0,3039) que permite contrastar la calidad de bfp4 frente a una cuantización estándar de 4 bits en el mismo modelo base.
- Prototipado en Transformers antes de portar a Tensix: el quickstart con `AutoModelForCausalLM` permite validar prompts y comportamiento en GPU/CPU antes de empaquetar y ejecutar en NPU.

## Benchmarks y rendimiento

| Metrica | bfp4 (este modelo) | BF16 referencia | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 23,299 | 79,57 | 24,167 |
| KL media vs BF16 | 0,374 | 0 | 0,3039 |
| Respuestas correctas (33 prompts fijos) | 33/33 | no disponible | no disponible |

La KL se calcula sobre 16.320 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, con un límite de KL media de 1,5 veces la referencia Q4_K_M. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint empaquetado ocupa 23,299 GB, por lo que se requiere al menos esa cantidad de memoria más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la documentación; el destino principal son NPUs Tenstorrent Tensix (Wormhole, Blackhole).
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de ~23 GB empaquetado supera la VRAM de la mayoría de GPUs consumer, aunque podría caber en modelos con 24 GB o más si se gestiona el offload, sin datos oficiales.
- Opciones de despliegue: Transformers 5.22.2+ con `device_map="auto"` y `dtype="bfloat16"`; ttnn para Tensix; scripts `pack_tensix.py` y `verify_grid.py` para empaquetado y verificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flint-Tensix-BFP4 (este) | 39,79 B | no disponible | safetensors bfp4/bf16 para Tensix | Apache 2.0 | Hugging Face, 218 descargas |
| RecursiveSI/flint (base) | 39,79 B | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face |
| Q4_K_M de flint (llama.cpp) | 39,79 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Referencia en la model card, 24,167 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una divergencia media de KL de 0,374 respecto al BF16, superior a la de Q4_K_M (0,3039); esto puede traducirse en degradación sutil en tareas sensibles a la precisión numérica.
- La evaluación KL se limita a inglés y coreano sobre WikiText-2 y Wikipedia coreana; no hay datos sobre otros idiomas ni sobre dominios especializados (código, matemáticas, medicina).
- No se documentan sesgos conocidos, riesgo de alucinación ni evaluaciones de seguridad del modelo base ni de la cuantización.
- El modelo está empaquetado específicamente para Tenstorrent Tensix; su uso en GPU/CPU vía Transformers es posible pero no es el objetivo principal y puede no aprovechar el formato bfloat4_b.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el `NOTICE` del repositorio y la licencia del modelo base para obligaciones de atribución.
- No se especifican longitud de contexto, idiomas soportados ni parámetros activos, lo que limita la planificación de despliegues en producción.
- El repositorio fue renombrado el 2026-11-27 (antes flint-Tenstorrent-Tensix-BFP4) y los archivos se movieron a `bfp4/`; scripts o enlaces antiguos pueden fallar.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/flint-Tensix-BFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/flint-Tenstorrent-Tensix/blob/main/LICENSE
- Referencia BF16 del base: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
