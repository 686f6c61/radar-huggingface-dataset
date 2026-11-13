# Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP4

## Resumen

Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP4 es una cuantización del modelo Qwen/Qwen3-4B-Thinking-2507 publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 4.411.424.256 parámetros desarrollado por el equipo Qwen, con modo de razonamiento explícito ("thinking") y una ventana de contexto de 262.144 tokens. La contribución de esta exportación no es un modelo nuevo, sino un formato de pesos empaquetado para el stack tt-metal/ttnn.

La particularidad técnica es el uso de cuantización de bloque en coma flotante (block floating point, BFP) en formato `ttnn.bfloat4_b`, es decir, 4.5 bits por peso, aplicada con GPTQ a las proyecciones lineales de atención (q, k, v, o) y de MLP (gate, up, down) en las 36 capas del modelo. El resto de tensores (embeddings, LM head atado, normalizaciones) permanece en bf16. El resultado son 5,61 bits por peso de media y un empaquetado de 2,82 GB, frente a los 8,04 GB del checkpoint BF16 original.

La relevancia es doble: por un lado, demuestra que es posible servir un modelo de razonamiento de 4B en hardware de inferencia no-GPU con una degradación medida y acotada respecto a BF16; por otro, publica una metodología de verificación (round-trip exacto de cada matriz empaquetada) que permite auditar que el empaquetado no altera los valores numéricos. Es un artefacto de nicho, pero relevante para quien despliegue modelos en aceleradores Tensix.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con capas de atención y MLP cuantizadas a BFP4 |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3-4B-Thinking-2507) |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4.5 bits/peso) en proyecciones lineales; bf16 en embeddings, LM head, norms y demás tensores; media de 5,61 bits/peso |
| Idiomas soportados | no disponible (la calibración usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con `quant4.json` e índice de shards; pensado para empaquetado en tt-metal/ttnn |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3 en su variante "Thinking-2507", con 36 capas y atención multi-cabeza con RoPE, entrenado por el equipo Qwen (Qwen3 Technical Report, arXiv:2505.09388). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni del detalle del pipeline de RLHF/DPO del modelo base. La variante "Thinking" expone un modo de razonamiento con cadena de pensamiento antes de la respuesta final.

La innovación de esta exportación es puramente de cuantización y despliegue. Se aplicó GPTQ con búsqueda de exponente por bloque sobre las matrices q, k, v, o, gate, up y down de las 36 capas, calibrando con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin modificar sus valores; el script `pack_tensix.py` verifica el round-trip exacto de cada matriz y `verify_grid.py` comprueba la rejilla solo con torch. El mismo conjunto de valores también se empaqueta de forma exacta en `ttnn.bfloat8_b`. La verificación se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento explícito en modo "thinking": el modelo produce cadena de pensamiento antes de la respuesta final.
- Razonamiento matemático y de sentido común de nivel 4B, evaluado indirectamente mediante 33 prompts cortos con comprobación automática.
- Generación de código: capacidad heredada del modelo base Qwen3; no se han publicado evaluaciones específicas en esta exportación.
- Capacidades multilingües: heredadas del modelo base; la evaluación de esta cuantización cubre inglés y coreano.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- No se documenta modo de pensamiento conmutable (enable_thinking) en esta exportación, aunque el modelo base lo soporta.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el empaquetado BFP4 permite cargar los pesos en DRAM del dispositivo con unos 2,82 GB solo para los pesos del modelo de lenguaje, más KV cache y buffers, lo que hace viable servir un 4B de razonamiento en tarjetas Tensix.
- Inferencia de razonamiento en entornos con memoria limitada: la reducción de 8,04 GB a 2,82 GB permite ejecutar el modelo en dispositivos con menos DRAM, manteniendo un 90,95 % de top-1 respecto a BF16.
- Evaluación y benchmarking de cuantización: sirve como referencia reproducible para comparar BFP4 con GPTQ frente a Q4_K_M de llama.cpp, con métricas de KL y top-1 publicadas.
- Servicio de chat conversacional de bajo coste: con contexto de 262.144 tokens, puede gestionar conversaciones multi-turno largas en hardware no-GPU, siempre que el backend soporte la ventana completa.
- Asistencia a la generación de código en pipelines internos: hereda la capacidad de código de Qwen3 y puede integrarse vía transformers en flujos de autocompletado o revisión, con la advertencia de que no se han publicado evaluaciones de código para esta cuantización.
- Investigación en formatos de bloque en coma flotante: el par de scripts `pack_tensix.py` y `verify_grid.py` permite auditar el empaquetado y validar nuevas variantes de cuantización sobre la misma rejilla.
- Prototipado en simulador: al haberse validado con ttsim, permite desarrollar y depurar kernels TT-NN sin hardware físico antes de pasar a Blackhole o Wormhole.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen3-4B-Thinking-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4) | 5,61 | 2,822 | 0,04599 | 90,95 | 32 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,955 | 2,497 | 0,04862 | 90,64 | 29 de 33 | 1 |

Las métricas de KL y top-1 cubren 16.256 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las 33 respuestas son prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 que fallan aquí. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 y sin importance matrix. El criterio del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional; se cumplió con 0,946 veces el KL de Q4_K_M y 1 respuesta perdida frente a 1. El autor advierte que estas cifras miden cercanía a BF16, no calidad de tarea, y que no se reporta velocidad.

## Requisitos de hardware

- VRAM/DRAM estimada: unos 2,82 GB solo para los pesos del modelo de lenguaje empaquetados en BFP4, más espacio para KV cache y buffers. El checkpoint BF16 equivalente ocupa 8,04 GB.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- GPU: no es el destino de esta exportación; puede cargarse en transformers con `device_map="auto"` en bf16, pero el empaquetado BFP4 solo aporta ventaja en Tensix.
- Cabe en GPU de consumo: el modelo base BF16 (8,04 GB) cabe en GPUs de 12 GB o más; la versión BFP4 no está pensada para CUDA.
- Opciones de despliegue: tt-metal/ttnn (versión verificada 0.81.1), ttsim como simulador; transformers para carga y generación genérica; no se ha probado con tt-transformers ni tt-forge.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4) | 4,41B | 262.144 | safetensors BFP4/bf16 | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen3-4B-Thinking-2507 (BF16) | 4,41B | 262.144 | safetensors bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 4,41B | 262.144 | GGUF | Apache 2.0 | Generado por el autor para comparar; sha256 publicado |
| Qwen3-4B (variante no Thinking) | 4,41B | 32.768 (según familia Qwen3) | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparación relevante es frente a BF16 y Q4_K_M, que son las referencias que el propio autor mide: BFP4 queda entre ambos en tamaño (2,822 GB frente a 2,497 GB de Q4_K_M y 8,04 GB de BF16) y ligeramente por delante de Q4_K_M en KL y top-1, con el mismo número de respuestas perdidas.

## Limitaciones y advertencias

- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-4B-Thinking-2507.
- Alucinación: riesgo propio de un modelo de 4B con modo de razonamiento; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Idiomas: la evaluación de la cuantización solo cubre inglés y coreano; el soporte multilingüe real depende del modelo base y no está detallado.
- Licencia: Apache 2.0, igual que el modelo base, con los cambios listados en `NOTICE`; uso comercial permitido sin restricciones adicionales conocidas.
- La cuantización BFP4 solo es exacta y ventajosa en Tensix; en CUDA o CPU se carga como bf16 y se pierde la reducción de memoria.
- No se ha ejecutado con tt-transformers ni tt-forge, y la verificación se hizo sobre el simulador ttsim, no sobre silicio físico.
- El autor advierte que las métricas publicadas miden cercanía a BF16, no calidad de tarea, y que no se reporta velocidad.
- El modelo no está afiliado ni respaldado por Tenstorrent.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia del modelo: https://huggingface.co/Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP4/blob/main/LICENSE
