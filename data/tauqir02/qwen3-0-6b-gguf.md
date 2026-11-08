# tauqir02/Qwen3-0.6B-GGUF

## Resumen

Qwen3-0.6B-GGUF es una conversión al formato GGUF del modelo Qwen3-0.6B desarrollado por el equipo Qwen de Alibaba Cloud, publicada por el usuario tauqir02 (Geet Techworks) bajo licencia Apache 2.0. Se trata de una cuantización Q4_K_M (5.09 bits por peso) de un transformer decoder-only de 28 capas y 751,6 millones de parámetros (incluyendo embeddings atados), pensada específicamente para inferencia en llama.cpp y en dispositivos Android.

El modelo base Qwen3-0.6B pertenece a la familia Qwen3, que introduce un modo híbrido de razonamiento ("thinking mode") que puede activarse o desactivarse mediante plantilla de chat o el sufijo `/no_think`. Esta conversión conserva los pesos originales sin fine-tuning ni fusión de adaptadores, y mantiene la plantilla de chat embebida byte a byte desde el repositorio upstream, con soporte para `enable_thinking`.

La relevancia de esta ficha radica en que ofrece un punto de entrada de muy bajo coste computacional (461,8 MiB en disco, ~1,17 GiB de RSS con contexto de 4096) para experimentar con la familia Qwen3 en entornos con recursos limitados, si bien el autor documenta limitaciones de calidad notables en respuestas factuales, especialmente en hindi, derivadas del reducido tamaño del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen3`, `Qwen3ForCausalLM`), 28 capas |
| Parametros totales | 751.632.384 (incluye embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos documentados; `max_position_embeddings` = 40.960; recomendado 2048-4096 en Android |
| Tipos de cuantizacion | Q4_K_M (5.09 BPW); único archivo publicado |
| Idiomas soportados | Inglés, hindi, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-0.6B-Q4_K_M.gguf`, 484.220.288 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 28 capas con 751,6 millones de parámetros, tokenizer BPE estilo GPT-2 (`tokenizer.ggml.pre = qwen2`) con vocabulario de 151.936 entradas, normalizador NFC y sin token BOS. El token EOS es `<|im_end|>` (ID 151645). La familia Qwen3 se describe en el informe técnico arXiv:2505.09388, que detalla el proceso de entrenamiento del modelo base; esta conversión concreta no aporta información adicional sobre la composición del dataset, el número de tokens de entrenamiento ni las etapas de RLHF/DPO del modelo original.

La innovación principal de la familia es el modo híbrido de razonamiento: el modelo puede operar en "thinking mode" (generando un bloque `<think>...</think>` antes de la respuesta) o en "non-thinking mode" (respuesta directa). Esta conversión GGUF preserva esa funcionalidad mediante la plantilla de chat embebida y el sufijo `/no_think`. No se documentan en la información disponible innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, hindi y otros idiomas multilingües.
- Razonamiento híbrido: modo "thinking" (con bloque `<think>`) y modo "non-thinking" para respuestas rápidas.
- Comprensión y generación de texto en hindi, incluyendo conjuncts, nukta, dígitos devanagari y Hinglish (validado a nivel de tokenizer, no de calidad factual).
- Manejo de casos Unicode complejos: normalización NFD→NFC, ligaduras y caracteres de ancho completo.
- Conversión a GGUF compatible con llama.cpp y con la aplicación Android del autor.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Inferencia en dispositivos Android: el archivo Q4_K_M de 461,8 MiB y el pico de RSS de 1,17 GiB con contexto 4096 permiten ejecutar el modelo en móviles de gama media mediante llama.cpp, con contextos recomendados de 2048-4096 tokens.
- Prototipado rápido en CPU: en un Intel i9-9880H con 8 hilos se obtienen 293 tok/s de procesamiento de prompt y 48,1 tok/s de generación, suficiente para demos interactivas sin GPU.
- Chatbot conversacional ligero en inglés: el modo non-thinking con temperatura 0,7 y top_p 0,8 ofrece respuestas cortas adecuadas para asistentes embebidos.
- Procesamiento de texto multilingüe con hindi: útil para tareas de normalización, transliteración o generación de texto en devanagari donde no se requiera precisión factual alta.
- Pruebas de integración de plantillas de chat Qwen3: el template embebido byte a byte permite validar pipelines que dependen de `enable_thinking` y del formato `<|im_start|>`/`<|im_end|>`.
- Educación y experimentación: modelo de bajo coste para estudiar el comportamiento de la familia Qwen3 y comparar modos thinking/non-thinking sin infraestructura dedicada.
- Filtrado o clasificación de texto simple: con prompts bien acotados y en inglés, puede emplearse para etiquetado o extracción de keywords en pipelines de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de validación funcional y rendimiento de host:

| Métrica | Q4_K_M (Intel i9-9880H, 8 hilos, CPU) |
|---|---:|
| Procesamiento de prompt (pp512) | 293 tok/s |
| Generación (tg128) | 48,1 tok/s |
| Tiempo de carga | 1,08 s |
| RSS pico, contexto 4096 | 1,17 GiB |

Validación de paridad de token IDs frente a HF `tokenizers`: 11/11 en texto multilingüe general, 6/6 en hindi, 3/3 en casos Unicode extremos y 2/2 en prompt renderizado con tokens especiales, tanto con el build de conversión (`cd959ba`) como con el build Android (`4b77dee`).

## Requisitos de hardware

- VRAM/RAM estimada: ~1,17 GiB de RSS pico con contexto 4096 en CPU; el archivo en disco ocupa 461,8 MiB.
- Caché KV: ~112 KiB por token en F16 (28 capas × 8 cabezas KV × 128 dims × 2 × 2 bytes); un contexto de 4096 añade ~448 MiB.
- GPU recomendadas: no se especifican en la información disponible; el autor valida únicamente en CPU (Intel i9-9880H) y en runtime Android.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM libre en Q4_K_M, aunque no se aportan mediciones en GPU.
- Opciones de despliegue: llama.cpp (commits `cd959ba` y `4b77dee`), runtime Android del autor; compatible con endpoints según los tags del repositorio.
- Latencia y throughput: 293 tok/s de prompt y 48,1 tok/s de generación en CPU de 8 hilos; no se reportan cifras en GPU ni en Android.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tauqir02/Qwen3-0.6B-GGUF (esta ficha) | 751,6 M | 32.768 | Apache 2.0 | GGUF Q4_K_M | Hugging Face |
| Qwen/Qwen3-0.6B-GGUF | 751,6 M (base) | 32.768 | Apache 2.0 | GGUF (varias cuantizaciones) | Hugging Face |
| unsloth/Qwen3-0.6B-GGUF | 751,6 M (base) | 32.768 | Apache 2.0 | GGUF (varias cuantizaciones) | Hugging Face |

Las tres opciones comparten el mismo modelo base y licencia; la diferencia principal es el conjunto de cuantizaciones ofrecidas (esta ficha solo publica Q4_K_M) y el nivel de documentación de validación aportado por cada autor. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Calidad factual limitada en hindi a 0,6B: el autor reporta respuestas repetitivas ante preguntas factuales generales en Q4_K_M, aunque el texto generado es UTF-8 válido sin caracteres de reemplazo.
- En la prueba multi-turno en inglés, Q4_K_M repitió la frase del usuario en lugar de responder; la validación la superó solo porque la respuesta contenía el nombre esperado.
- Las pruebas de inferencia del autor son superficiales (keyword, script devanagari, presencia del nombre correcto), no evalúan razonamiento ni precisión factual.
- No se debe usar decodificación greedy en modo thinking: tiende a repetir según las recomendaciones upstream.
- El contexto práctico recomendado en Android es de 2048-4096 tokens, muy por debajo del máximo nativo de 32.768, por el coste de la caché KV.
- Licencia Apache 2.0 permite uso comercial, modificación y redistribución siempre que se conserven la licencia y los avisos y se declaren los cambios (en este caso, conversión de formato y cuantización).
- Geet Techworks no está afiliado ni respaldado por Alibaba Cloud ni por el equipo Qwen.
- No se documentan sesgos específicos, pero al ser un modelo base de 0,6B sin información sobre alineación en esta conversión, cabe esperar alucinaciones y sesgos propios del modelo original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/tauqir02/Qwen3-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Informe técnico Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
