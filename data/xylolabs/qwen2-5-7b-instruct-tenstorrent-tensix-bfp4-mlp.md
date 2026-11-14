# Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo Qwen2.5-7B-Instruct de Alibaba, adaptada específicamente para su ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La desarrolla Xylolabs, un estudio centrado en herramientas de cuantización para hardware de inferencia alternativo. El modelo resuelve el problema de llevar un LLM de 7.600 millones de parámetros a la memoria de dispositivo de una NPU Tensix mediante cuantización de bloque en coma flotante (BFP4 y BFP8), manteniendo los pesos empaquetados de forma que TT-NN los lea sin recodificarlos.

La arquitectura subyacente es la del transformer decoder de Qwen2.5-7B-Instruct, con 28 capas y atención de tipo GQA. La intervención de Xylolabs se limita a las capas lineales: las proyecciones MLP (gate, up, down) se cuantizan a `ttnn.bfloat4_b` con GPTQ y búsqueda de exponente por bloque, mientras que las proyecciones de atención (q, k, v, o) se cuantizan a `ttnn.bfloat8_b` con redondeo al más cercano. El resto de tensores (embeddings, LM head, normas) permanecen en bf16. El resultado ocupa 6,26 GB empaquetados, con una media de 6,58 bits por peso.

Es relevante porque demuestra una vía práctica para desplegar modelos de 7B en hardware no-GPU con presupuesto de memoria ajustado, y porque publica la metodología y las herramientas de verificación (empaquetado exacto, comprobación de que ningún valor cambia al pasar por TT-NN). El contexto, los idiomas y las capacidades heredadas son las del modelo base Qwen2.5-7B-Instruct.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5), 28 capas, atención GQA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención; bf16 en embeddings, LM head y normas; media de 6,58 bits/peso |
| Idiomas soportados | en (según metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15,2 GB de repo); empaquetado para TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de 28 capas con atención por grupos (GQA) y normalización RMSNorm, tal como corresponde a la familia Qwen2.5. Xylolabs no reentrena el modelo: parte de los pesos de Qwen2.5-7B-Instruct y aplica cuantización post-entrenamiento. Las matrices MLP se cuantizan con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices de atención se cuantizan con redondeo al más cercano a BFP8. Los tensores cuantizados se almacenan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterar su valor.

La innovación técnica principal es el formato de exportación: cada proyección tiene un formato asignado en `quant4.json`, y se incluyen scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que el empaquetado en dispositivo es exacto, es decir, que ningún valor cambia al pasar por la DRAM del acelerador. El modelo se ha validado con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent. Para `tt-transformers` (tt-metal v0.81.1) se documenta que Qwen2.5-7B solo se ejecuta en 2 o 4 chips (N300 y superiores), por lo que esa ruta no se ha probado; en `tt-forge` (tt-xla) los pesos se ejecutan en bf16 por defecto y la opción `bfp_bf4` recuantiza en el layout [out, in] de PyTorch, por lo que se recomienda `tt-transformers` para los pesos de 4,5 bits.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia de Qwen2.5 (`apply_chat_template`).
- Razonamiento, matemáticas y generación de código heredados del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling, según las capacidades del modelo base.
- Capacidades multilingües del modelo base; los metadatos del repo declaran únicamente inglés.
- Inferencia sobre NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos cuantizados.
- Ejecución alternativa vía `tt-transformers` y `tt-forge` (tt-xla), con las limitaciones descritas por el autor.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tensix con memoria limitada: el modelo ocupa 6,26 GB de memoria de dispositivo para los pesos del LM, más KV cache y buffers, lo que permite ejecutar un 7B en Wormhole o Blackhole sin GPU dedicada.
- Prototipado de inferencia en hardware Tenstorrent: útil para equipos que evalúan TT-NN y `tt-metal` como alternativa a CUDA, con un modelo conversacional listo para usar.
- Asistentes conversacionales de dominio general: al conservar la plantilla de chat y el comportamiento del modelo base, puede servir para atención al cliente o asistentes internos en entornos con NPU.
- Generación de código en pipelines locales: el modelo base tiene competencia en código y tool calling, y el formato cuantizado reduce el coste de memoria en estaciones con acelerador Tensix.
- Investigación en cuantización de bloque: el repo incluye herramientas de verificación y el mapeo de formatos por proyección, lo que lo convierte en un caso de estudio reproducible de BFP4/BFP8 con GPTQ.
- Evaluación comparativa de precisión: la tabla de evaluación del autor (KL medio frente a BF16, top-1, respuestas correctas) permite medir la degradación de la cuantización en tareas de generación.
- Validación de empaquetado en simulador: con `ttsim` se puede comprobar el flujo completo de carga y empaquetado antes de disponer de hardware físico.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación que compara el modelo cuantizado con BF16, con columnas de bits por peso, tamaño, KL medio frente a BF16, top-1 y respuestas correctas. Sin embargo, en la información proporcionada la tabla aparece truncada: solo se muestra la fila de BF16 y no los valores numéricos del modelo cuantizado. Por tanto, no se pueden reproducir cifras concretas.

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---|---|---|---|---|---|
| BF16 (Qwen2.5-7B-Instruct) | 16 | no disponible | referencia | no disponible | no disponible | no disponible |
| BFP4 MLP / BFP8 atención | 6,58 (media) | 6,26 | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta exportación.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 6,26 GB para los pesos del LM empaquetados, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- GPU: no es el destino previsto; la carga en `transformers` con `device_map="auto"` requiere memoria suficiente para los tensores en bf16 (repo de 15,2 GB), por lo que en GPU consumer haría falta cuantización adicional no incluida en este repo.
- Ejecución en consumer GPU: no documentada; el formato BFP4/BFP8 es específico de TT-NN y no se decodifica de forma nativa en GPUs convencionales.
- Despliegue: TT-NN (`ttnn` 0.81.1), `tt-transformers` (tt-metal v0.81.1, solo 2 o 4 chips N300 o superiores), `tt-forge` (tt-xla, con `pjrt-plugin-tt==1.4.0`), y `transformers` para carga en bf16.
- Simulación: `ttsim`, el simulador de Blackhole, permite validar el empaquetado sin hardware.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP | 7,6 B | no disponible | BFP4 MLP + BFP8 atención (6,58 bits/peso) | Apache 2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible en la información proporcionada | bf16 | Apache 2.0 | GPU/CPU convencionales |
| Exportaciones GPTQ/AWQ de Qwen2.5-7B | 7,6 B | no disponible | 4 bits enteros (típicamente) | Apache 2.0 | GPU con kernels CUDA |

La comparativa con exportaciones GPTQ/AWQ es cualitativa: este modelo no usa enteros de 4 bits sino coma flotante de bloque, y su destino es una NPU Tensix, no una GPU. No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación respecto a BF16; el autor publica métricas de KL y top-1, pero los valores numéricos no están disponibles en la información proporcionada.
- El formato BFP4/BFP8 es específico de TT-NN; fuera de hardware Tensix o del simulador, el modelo debe cargarse en bf16, lo que anula la ventaja de memoria.
- La ruta `tt-transformers` no está probada por el autor y solo funciona en 2 o 4 chips (N300 y superiores); sin `--use_hf_rope` se recuantiza el QKV fusionado.
- En `tt-forge`, la opción `bfp_bf4` recuantiza en el layout [out, in] de PyTorch; el autor recomienda `tt-transformers` para los pesos de 4,5 bits. La ruta `tt-forge` no se ha ejecutado de extremo a extremo.
- Los metadatos declaran únicamente inglés, aunque el modelo base es multilingüe; el comportamiento multilingüe tras la cuantización no está documentado.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-7B-Instruct; no se documentan evaluaciones de seguridad específicas para esta exportación.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y revisarse las condiciones del modelo base.
- El número de descargas (78) y de likes (0) es bajo, lo que sugiere poca validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
