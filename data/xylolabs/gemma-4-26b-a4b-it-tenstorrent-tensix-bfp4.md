# Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4

## Resumen

Gemma 4 26B-A4B-it en formato BFP4 para Tenstorrent Tensix es una exportación cuantizada del modelo multimodal `google/gemma-4-26B-A4B-it`, publicada por Xylolabs. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 26.544.133.710 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (de ahí el sufijo A4B), diseñado por Google para tareas conversacionales e image-text-to-text. Esta versión concreta no modifica la arquitectura: sustituye las capas lineales del modelo de lenguaje por matrices cuantizadas a `ttnn.bfloat4_b` (block floating point de 4 bits, 4,5 bits por peso) mediante GPTQ, manteniendo en bf16 la cabeza LM, los embeddings, las normas, el router y el tower de visión.

La relevancia de esta ficha es doble. Por un lado, demuestra una ruta de despliegue de un MoE multimodal de 26B en hardware de inferencia específico (NPUs Tensix de Tenstorrent, familias Wormhole y Blackhole) con un peso empaquetado de 15,27 GB para los pesos del modelo de lenguaje, lo que reduce drásticamente los requisitos de memoria de dispositivo frente a los 50,47 GB en BF16. Por otro lado, el autor publica el pipeline de cuantización (`tensix-bfp-gptq`) y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que los valores empaquetados en BFP4 son idénticos a los almacenados, lo que facilita la reproducibilidad.

Es importante señalar que solo se cuantizó y evaluó el modelo de lenguaje; el tower de visión permanece en bf16 sin cambios y no se han publicado resultados de benchmarks de visión. La licencia es Apache-2.0, lo que permite uso comercial sin las restricciones adicionales de la licencia Gemma original, aunque conviene revisar las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) multimodal, base google/gemma-4-26B-A4B-it; capas lineales cuantizadas a BFP4 |
| Parametros totales | 26.544.133.710 |
| Parametros activos | aproximadamente 4B (sufijo A4B del modelo base; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en atención q/k/o/v, MLP densa y expertos enrutados; bf16 en router, escalas por experto, LM head, embeddings, normas y tower de visión |
| Idiomas soportados | no disponible (calibración GPTQ con WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 53,1 GB); empaquetado BFP4 de 15,27 GB para el modelo de lenguaje; compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 26.544 millones de parámetros totales y aproximadamente 4.000 millones activos por token, según el sufijo A4B. Esta exportación conserva la arquitectura intacta y solo modifica el almacenamiento de los pesos: las proyecciones q, k, o (30 capas), v (25 capas), gate, up y down de la MLP densa, y gate, up y down de los expertos enrutados (30 capas) se almacenan en `ttnn.bfloat4_b`, es decir, valores bf16 situados sobre la rejilla de block floating point de 4 bits. El router, las escalas por experto, la LM head (atada al embedding), los embeddings, las normas y todos los tensores restantes permanecen en bf16, igual que en el modelo base. El tower de visión (`embed_vision`, `vision_tower`) también se mantiene en bf16 sin cambios.

La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque, calibrada con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los expertos enrutados comparten una única matriz Hessiana por capa para gate y up, mientras que cada experto calcula su propia Hessiana para down, o recurre a redondeo al más cercano cuando ha visto pocos tokens de calibración. El resultado es un promedio de 4,84 bits por peso y un empaquetado de 15,27 GB. El autor verifica que TT-NN empaqueta las matrices sin alterar sus valores, y que los mismos valores también se empaquetan de forma exacta en `ttnn.bfloat8_b`. No se describe entrenamiento adicional, RLHF ni DPO específicos de esta exportación; se trata exclusivamente de una cuantización post-entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas generales (el autor reporta 33 de 33 respuestas correctas en su conjunto de evaluación, sin detallar la composición).
- Procesamiento image-text-to-text heredado del modelo base multimodal (pipeline `image-text-to-text`), aunque el tower de visión no fue cuantizado ni evaluado en esta exportación.
- Capacidad de mezcla de expertos (MoE) con enrutamiento por token, lo que permite activar solo una fracción de los parámetros por paso.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la calibración incluyó coreano, pero no se documenta la cobertura de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole y Blackhole: el formato BFP4 está pensado para empaquetarse directamente en TT-NN sin pérdida de valores, lo que permite ejecutar el modelo de lenguaje de 26B en hardware Tensix con 15,27 GB de memoria de dispositivo para los pesos, más KV cache y buffers.
- Servicio conversacional de chat en producción: el modelo conserva la plantilla de chat y la cabeza LM en bf16, por lo que puede usarse como backend de un asistente multi-turno con `transformers` y `device_map="auto"` en GPUs convencionales o en Tensix.
- Investigación en cuantización de bajo bit: al publicarse el pipeline `tensix-bfp-gptq`, los scripts de verificación y el archivo `quant4.json` con el formato de cada proyección, sirve como referencia reproducible para estudiar GPTQ con block floating point en modelos MoE.
- Evaluación de fidelidad numérica: la comprobación de que BFP4 empaqueta sin cambios los valores y de que los mismos pesos caben exactamente en `ttnn.bfloat8_b` permite usar el modelo como banco de pruebas de precisión en cadenas TT-NN.
- Prototipado multimodal image-text-to-text: aunque el tower de visión no se evaluó, el pipeline declarado permite experimentar con entradas imagen-texto en entornos que ya soporten el modelo base Gemma 4.
- Docencia y formación técnica: el repositorio incluye ejemplos de quickstart, empaquetado y verificación que ilustran el flujo completo desde safetensors hasta la memoria de dispositivo de una NPU.
- Comparación de estrategias de cuantización: al mantener router, embeddings y normas en bf16 y cuantizar solo las proyecciones lineales, es útil para medir el impacto de la cuantización selectiva en la calidad (KL frente a BF16) en arquitecturas MoE.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación del modelo de lenguaje comparando BF16 con esta exportación BFP4. Los datos disponibles son:

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Esta exportacion (BFP4) | 4,84 | 15,27 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se han publicado métricas de visión ni evaluaciones multilingües.

## Requisitos de hardware

- VRAM para inferencia: el autor indica que esta exportación necesita aproximadamente 15,27 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. En BF16 el modelo base ocupa 50,47 GB.
- GPU recomendadas: no se especifican en la información proporcionada. El formato está orientado a NPUs Tensix (Wormhole, Blackhole), no a GPU.
- ¿Cabe en GPU de consumo? No hay datos publicados. Con 15,27 GB de pesos en BFP4 más KV cache y buffers, en GPUs de consumo de 24 GB podría ser ajustado pero no está verificado; no se dispone de confirmación.
- Despliegue en Tensix: verificado con `ttnn` 0.81.1 sobre el simulador Blackhole (`ttsim`). El demo oficial de Gemma 4 en tt-metal v0.81.1 ejecuta el 26B-A4B con paralelismo tensorial en cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o en un Wormhole T3K, no en un solo chip, y no ofrece opción `bfloat4_b`; con la entrada de `precision_overrides.json` propuesta por el autor, atención, MLP compartida y expertos se empaquetan en `bfp8` de forma exacta (verificado en las dos primeras capas sobre un chip simulado; el reparto multi-chip no se ejecutó).
- tt-forge (tt-xla): no probado con Gemma 4; por defecto mantiene los pesos en bf16 (exacto) y su opción `bfp_bf4` recuantiza en el layout `[out, in]` de PyTorch.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4 | 26.544.133.710 (aprox. 4B activos) | no disponible | BFP4 (4,84 bits/peso), 15,27 GB | Apache-2.0 | Hugging Face, 94 descargas, 1 like |
| google/gemma-4-26B-A4B-it (BF16) | 26.544.133.710 (aprox. 4B activos) | no disponible | BF16, 50,47 GB | licencia Gemma (segun modelo base) | Hugging Face |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales (mismo tamaño o misma tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el tower de visión permanece en bf16 y no se han publicado evaluaciones de capacidades multimodales.
- La evaluación publicada se limita a una comparación KL/Top-1 frente a BF16 sobre un conjunto no detallado de 33 preguntas; no hay benchmarks estándar que permitan comparar con otros modelos.
- El soporte en tt-metal es parcial: el demo oficial de Gemma 4 no incluye `bfloat4_b` y requiere varios chips; la integración con este repositorio depende de añadir una entrada en `precision_overrides.json` y solo se verificó en dos capas sobre un chip simulado.
- tt-forge (tt-xla) no se ha probado con Gemma 4; la opción `bfp_bf4` recuantiza en PyTorch y no garantiza la misma fidelidad que el empaquetado directo en TT-NN.
- El modelo hereda los sesgos y el riesgo de alucinación del modelo base Gemma 4; no se documentan mitigaciones específicas en esta exportación.
- La licencia declarada es Apache-2.0, pero al derivar de `google/gemma-4-26B-A4B-it` conviene verificar las condiciones de la licencia Gemma original para uso comercial y redistribución.
- No se documentan los idiomas soportados ni el comportamiento fuera de inglés y coreano (idiomas usados en la calibración).
- El repositorio tiene un tamaño de 53,1 GB, lo que implica requisitos de almacenamiento y descarga considerables.
- No hay datos publicados de latencia, throughput ni consumo energético en hardware Tensix real.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como enlace directo en la informacion proporcionada
