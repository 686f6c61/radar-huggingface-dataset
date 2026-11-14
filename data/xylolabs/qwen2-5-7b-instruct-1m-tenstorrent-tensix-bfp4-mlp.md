# Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo Qwen/Qwen2.5-7B-Instruct-1M, adaptada específicamente para su despliegue en NPUs Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos que aplica cuantización de bloque en coma flotante (block floating point, BFP) sobre las capas lineales del transformer original, manteniendo el resto de tensores en bf16.

El modelo base Qwen2.5-7B-Instruct-1M es un transformer decoder-only de 7.615.616.512 parámetros con una ventana de contexto extendida de 1 millón de tokens, desarrollado por el equipo Qwen de Alibaba. Esta exportación reduce el peso en memoria del modelo de 15,23 GB (bf16) a 6,262 GB empaquetados, con un promedio de 6,58 bits por peso, lo que permite alojar el modelo completo en la memoria DRAM de dispositivos Tensix con recursos limitados.

La relevancia de esta ficha radica en su especificidad de hardware: es un artefacto pensado para el stack tt-metal/ttnn de Tenstorrent, no para GPU convencionales, y su evaluación se centra en la fidelidad numérica respecto al modelo BF16 original (KL divergence y top-1 agreement) más que en benchmarks de calidad de tarea. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con capas lineales cuantizadas a BFP4/BFP8 para Tensix |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000.000 tokens (heredada del modelo base Qwen2.5-7B-Instruct-1M) |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en MLP gate/up/down; BFP8 (bfloat8_b) en attention q/k/v/o; bf16 en embeddings, LM head y normas; media de 6,58 bits por peso |
| Idiomas soportados | en (segun model card); el modelo base Qwen2.5 soporta multilingue, pero esta exportacion declara solo ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB), con ficheros auxiliares quant4.json y model.safetensors.index.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct-1M: un transformer decoder-only con 28 capas, atención multi-cabeza con RoPE y ventana de contexto de 1 millón de tokens. Sobre esa base, Xylolabs aplica cuantización post-entrenamiento selectiva por tipo de tensor: las proyecciones q, k, v y o de las 28 capas se convierten a `ttnn.bfloat8_b` (8,5 bits por peso) mediante redondeo al más cercano (round to nearest); las proyecciones gate, up y down del MLP se convierten a `ttnn.bfloat4_b` (4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resto de tensores (embeddings, LM head, normas) permanecen en bf16.

La innovación técnica clave es el uso del formato block floating point nativo de TT-NN: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores. Esto permite que el empaquetado en dispositivo sea exacto (verificable con `pack_tensix.py` y `verify_grid.py`, que comprueban round-trip a DRAM). El checkpoint fue validado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim); tt-transformers y tt-forge no se ejecutaron con este checkpoint. No se documenta en la información disponible un proceso de RLHF o DPO adicional sobre esta exportación: las capacidades de instrucción provienen del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-7B-Instruct-1M.
- Razonamiento de contexto largo: la ventana de 1M tokens del modelo base permite procesar documentos extensos, aunque esta exportación no documenta pruebas específicas a esa longitud.
- Capacidades de instrucción y formato chat mediante `apply_chat_template` del tokenizer Qwen.
- Soporte de tool calling y function calling: no documentado explícitamente en esta exportación; debe asumirse el del modelo base, sin verificación en Tensix.
- Capacidades multilingües: la model card declara únicamente `en`; el calibrado incluyó texto coreano, pero no se declara soporte de coreano como idioma de inferencia.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en esta exportación.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole/Blackhole: el caso de uso primario es ejecutar un modelo de 7B con contexto largo en hardware Tensix, donde los 6,26 GB de pesos empaquetados caben en DRAM junto con la caché KV y buffers.
- Investigación en cuantización block floating point: sirve como referencia reproducible para estudiar el impacto de BFP4/BFP8 en fidelidad numérica (KL divergence de 0,03451 frente a BF16) sobre un modelo instruct conocido.
- Evaluación de fidelidad de exportaciones: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar que el empaquetado en dispositivo no altera valores, útil en pipelines de validación de cuantizaciones.
- Prototipado de asistentes conversacionales en inglés sobre hardware Tensix: el modelo mantiene el formato chat de Qwen y puede usarse con `AutoModelForCausalLM` en transformers para pruebas funcionales antes de portar a tt-metal.
- Comparación de estrategias de cuantización: al coexistir con una versión Q4_K_M generada desde el mismo checkpoint, permite contrastar BFP4/BFP8 frente a cuantización entera de 4 bits en métricas de KL y top-1.
- Docencia y experimentación con hardware alternativo: adecuado para cursos o laboratorios que trabajen con el stack tt-metal/ttnn sin requerir GPUs de gran VRAM.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B-Instruct-1M) | 16 | 15,23 | 0 | 100 | 30 de 33 | - |
| Este modelo (BFP4 MLP) | 6,58 | 6,262 | 0,03451 | 91,41 | 28 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03061 | 91,63 | 31 de 33 | 0 |

Las métricas de KL y top-1 se calculan sobre 16.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia coreana), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática. El modelo supera el criterio del autor (KL ≤ 1,5× la de Q4_K_M y como máximo una respuesta perdida adicional): 1,13× la KL de Q4_K_M y 1 respuesta perdida frente a 0. No se reportan métricas de velocidad ni throughput. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 6,26 GB para los pesos del modelo de lenguaje, más espacio para caché KV y buffers (no cuantificado en la información disponible).
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Validado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).
- GPU consumer: no es el objetivo; puede cargarse en transformers con `device_map="auto"` en bf16, pero los tensores BFP no se aprovechan en GPU convencional y el peso en memoria sería el del repo (15,2 GB).
- Despliegue: transformers (carga directa), tt-metal/ttnn para ejecución en dispositivo. tt-transformers y tt-forge no fueron probados con este checkpoint. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4 MLP) | 7,6B | 1M | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face, orientado a NPU Tensix |
| Qwen/Qwen2.5-7B-Instruct-1M (BF16) | 7,6B | 1M | bf16 | Apache 2.0 | Hugging Face, GPU/CPU |
| Q4_K_M del mismo checkpoint (llama.cpp) | 7,6B | 1M | 4 bits entero (Q4_K_M) | Apache 2.0 | Generado por el autor para comparación |
| Qwen2.5-7B-Instruct (sin 1M) | 7,6B | 128K (no confirmado en la información disponible) | bf16 y múltiples | Apache 2.0 | Hugging Face |

La comparación relevante es frente a la versión BF16 del mismo modelo base y frente a la cuantización Q4_K_M: este artefacto ocupa más memoria que Q4_K_M (6,26 GB frente a 4,68 GB) y muestra una KL ligeramente superior (0,03451 frente a 0,03061), pero está diseñado para un formato nativo de TT-NN que evita conversiones en dispositivo.

## Limitaciones y advertencias

- Específico de hardware: el formato BFP4/BFP8 está pensado para TT-NN en Tensix; fuera de ese stack no aporta ventajas y puede requerir conversión.
- Idiomas: la model card declara solo inglés; el calibrado incluyó coreano, pero no se garantiza calidad en otros idiomas.
- Fidelidad, no calidad: los benchmarks miden cercanía a BF16, no rendimiento en tareas; no hay datos de MMLU, HumanEval ni GSM8K.
- Pérdida de respuestas: una de las 33 respuestas de la evaluación se pierde respecto a BF16, y el top-1 baja al 91,41 %.
- Riesgo de alucinación: inherente al modelo base Qwen2.5-7B-Instruct-1M; no se documenta mitigación adicional en esta exportación.
- Sesgos: no se documentan análisis de sesgo específicos para esta exportación; deben asumirse los del modelo base.
- Soporte limitado del ecosistema: tt-transformers y tt-forge no se probaron con este checkpoint; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- Licencia: Apache 2.0, uso comercial permitido; se debe conservar el fichero NOTICE con los cambios. El autor declara no estar afiliado ni respaldado por Tenstorrent.
- Garantías: se proporciona "as is", sin garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2501.15383): https://arxiv.org/abs/2501.15383
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
