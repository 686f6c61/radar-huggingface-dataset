# Xylolabs/Mistral-7B-Instruct-v0.3-Tenstorrent-Tensix-BFP8

## Resumen

Mistral-7B-Instruct-v0.3-Tenstix-BFP8 es una exportación cuantizada del modelo Mistral-7B-Instruct-v0.3 de Mistral AI, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only del original, con 7.248.023.552 parámetros, pero sustituye las matrices de proyección lineal por versiones cuantizadas en formato block floating point de 8 bits (`ttnn.bfloat8_b`, BFP8) mediante GPTQ, mientras mantiene en bf16 el LM head, los embeddings y las normas.

La relevancia de esta ficha radica en que no es un modelo nuevo ni un fine-tune, sino un artefacto de despliegue: empaqueta los pesos de forma que TT-NN pueda cargarlos directamente en memoria DRAM del dispositivo sin re-cuantización en el momento de la carga. Según la model card, los pesos ocupan aproximadamente 7,95 GB empaquetados, con una media de 8,78 bits por peso, y está calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

Está pensado para desarrolladores que ejecutan inferencia en hardware Tenstorrent y necesitan una variante de Mistral-7B-Instruct que aproveche el formato nativo BFP8 del silicio. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial. Existe además una variante BFP4 del mismo autor para dispositivos con menos memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral), lineal cuantizada a BFP8 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en q, k, v, o, gate, up, down de 32 capas; bf16 en LM head, embeddings y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 14,5 GB), con `quant4.json` e index de safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer decoder-only con atención de ventana deslizante y capas MLP con activación SwiGLU. Xylolabs no reentrena el modelo: aplica GPTQ sobre las matrices de atención (q, k, v, o) y MLP (gate, up, down) de las 32 capas para ajustarlas a la rejilla block floating point de 8 bits que consume TT-NN. Cada bloque comparte un exponente, y los valores se almacenan como bf16 sobre esa rejilla, de modo que el empaquetador de TT-NN los lee sin alterar su valor numérico. El resto de tensores (LM head, embeddings, normas) permanece en bf16 como en el modelo base.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, lo que introduce un sesgo de dominio hacia texto enciclopédico y hacia el coreano en el proceso de cuantización. El autor documenta verificaciones de empaquetado: cada matriz se comprueba con `pack_tensix.py` y `verify_grid.py`, y en la demo `tt-transformers` (tt-metal v0.81.1) las proyecciones de las dos primeras capas empaquetan de forma exacta, con un prefill de 2 capas que alcanza PCC 0.9995 frente a transformers usando `--use_hf_rope`. El head se empaqueta en bfloat8_b en esa demo, por lo que el head bf16 de este checkpoint no es exacto en ese entorno.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla `apply_chat_template`).
- Generación de código y matemáticas básicas, según las capacidades del modelo base.
- Soporte de tool calling y function calling, heredado del modelo base v0.3.
- Capacidades multilingües del modelo base (no detalladas en la información disponible).
- Inferencia en NPU Tensix mediante TT-NN (`ttnn.bfloat8_b`) y en transformers con `dtype="bfloat16"` y `device_map="auto"`.
- Compatible con la demo `tt-transformers` de tt-metal v0.81.1 y, previsiblemente, con tt-forge (tt-xla), aunque esta última no se ha probado con este checkpoint.

## Casos de uso

- Despliegue de un asistente conversacional en hardware Tenstorrent: el checkpoint se carga directamente en DRAM del dispositivo con TT-NN sin re-cuantizar, lo que reduce el trabajo de preparación en producción.
- Sustitución de GPUs por NPU Tensix en entornos de inferencia con restricciones de consumo: el formato BFP8 nativo del silicio evita conversiones en tiempo de ejecución.
- Evaluación comparativa de precisión BFP8 frente a bf16: el autor documenta métricas de divergencia KL y top-1 que permiten medir la pérdida de calidad de la cuantización en tareas de generación.
- Prototipado de pipelines de generación de texto con transformers en CPU/GPU antes de portar a Tensix: el repo es compatible con `AutoModelForCausalLM` y `device_map="auto"`.
- Investigación sobre cuantización block floating point: el repo incluye `quant4.json` con el formato de cada proyección y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) útiles para estudiar el efecto de BFP8 en cada capa.
- Fine-tuning o adaptación posterior sobre el modelo base y re-exportación: al mantener la estructura de Mistral-7B-Instruct-v0.3 y licencia Apache 2.0, se puede partir del original y aplicar el mismo pipeline GPTQ de Xylolabs.
- Inferencia en dispositivos con memoria limitada: para hardware con menos DRAM que los ~7,95 GB necesarios, el autor remite a la variante BFP4 del mismo repositorio.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparativa entre BF16 y las variantes cuantizadas, con columnas de bits por peso, tamaño en GB, KL medio frente a BF16, top-1 y respuestas correctas/perdidas. Sin embargo, la información proporcionada está truncada y no permite reproducir los valores numéricos de las filas BFP8 y BFP4. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

| Metrica | BF16 | BFP8 | BFP4 |
|---|---|---|---|
| Bits por peso | no disponible | 8,78 (media) | no disponible |
| Tamano (GB) | no disponible | 7,95 empaquetado | no disponible |
| KL medio a BF16 | referencia | no disponible (tabla truncada) | no disponible (tabla truncada) |
| Top-1 (%) | no disponible | no disponible (tabla truncada) | no disponible (tabla truncada) |

Dato adicional verificable: la demo de 2 capas en tt-metal v0.81.1 reporta PCC 0.9995 frente a transformers con `--use_hf_rope`.

## Requisitos de hardware

- Memoria de dispositivo Tensix: aproximadamente 7,95 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- GPUs: no aplica para el formato BFP8 nativo; para uso con transformers se puede cargar en bf16 con `device_map="auto"`, lo que requiere del orden de 14-16 GB de VRAM (no confirmado en la información disponible).
- Consumer GPU: la variante BFP8 no está pensada para GPU; la carga en bf16 vía transformers podría caber en GPUs de 16 GB o más, pero no se documenta en la información disponible.
- Despliegue: TT-NN / tt-metal v0.81.1 (demo `tt-transformers` con `--use_hf_rope`), tt-forge (tt-xla, no probado con este checkpoint), transformers con `AutoModelForCausalLM`.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este formato en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP8 | 7,25 B | no disponible | safetensors BFP8 | Apache 2.0 | Hugging Face |
| Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP4 | no disponible | no disponible | safetensors BFP4 | Apache 2.0 | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face |

La comparativa con modelos de otros fabricantes (Llama 3.1 8B, Qwen2.5 7B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP8 introduce divergencia frente a bf16; el autor publica métricas de KL y top-1, pero la tabla está truncada en la información disponible.
- La calibración GPTQ se hizo sobre WikiText-2 y Wikipedia en coreano, lo que puede sesgar el comportamiento en otros dominios o idiomas.
- El checkpoint está diseñado para TT-NN con layout `[in, out]`; usarlo fuera de ese entorno requiere transposiciones y verificación manual.
- En la demo `tt-transformers`, el head se empaqueta en bfloat8_b, por lo que el head bf16 de este checkpoint no es exacto en ese flujo.
- tt-forge no se ha probado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` re-cuantizan en layout `[out, in]` de PyTorch.
- Riesgo de alucinación y sesgos heredados del modelo base Mistral-7B-Instruct-v0.3, no evaluados específicamente en esta exportación.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las dependencias de tt-metal.
- El repo tiene 71 descargas y 0 likes en el momento de la consulta: baja validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP8
- Variante BFP4: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal: https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP8/blob/main/LICENSE
