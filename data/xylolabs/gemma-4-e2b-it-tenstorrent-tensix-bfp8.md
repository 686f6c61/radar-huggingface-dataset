# Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP8

## Resumen

`Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP8` es una exportación cuantizada del modelo multimodal `google/gemma-4-E2B-it` de Google, preparada por Xylolabs para su ejecución en aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 y solo cuantiza las proyecciones lineales lineales del transformer de lenguaje (atención y MLP) al formato `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloque), mediante GPTQ calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resto de tensores (embeddings, LM head, normas, torres de visión y audio) permanece en bf16 sin modificar.

El resultado es un checkpoint de 5.525.831.235 parámetros totales que ocupa 11,1 GB en el repositorio y 7,56 GB empaquetado en memoria de dispositivo para los pesos del modelo de lenguaje, con una media de 13,01 bits por peso. Frente al BF16 original (9,29 GB), reduce el tamaño un 18,7 % manteniendo una divergencia KL media de solo 0,00239 respecto a BF16 y un 98,29 % de coincidencia top-1, lo que lo convierte en una alternativa prácticamente indistinguible del original para inferencia en hardware Tensix con memoria limitada.

Su relevancia actual radica en que demuestra que la cuantización block-floating-point nativa de TT-NN (sin reempaquetado en el dispositivo) puede aplicarse a modelos multimodales de última generación con pérdida despreciable, y en que ofrece un camino práctico para desplegar Gemma 4 en NPUs de Tenstorrent en lugar de GPUs convencionales. La licencia Apache-2.0 del checkpoint exportado facilita su uso comercial, aunque las condiciones del modelo base de Google deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen, audio) basado en Gemma 4; proyecciones lineales cuantizadas a BFP8 |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en proyecciones); bf16 en embeddings, LM head, normas, vision tower y audio tower; media global de 13,01 bits por peso |
| Idiomas soportados | no disponible (calibracion GPTQ en WikiText-2 y Wikipedia en coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 11,1 GB); empaquetado para TT-NN en DRAM del dispositivo (7,56 GB) |
| Capas cuantizadas | atención q, o (35 capas); atención k, v (15 capas); MLP gate, up, down (35 capas) |
| Tensor paralelo / layout | TT-NN lee pesos como [in, out]; `TILE_LAYOUT` en DRAM |
| Hardware objetivo | Tenstorrent Tensix: Wormhole, Blackhole (probado en simulador ttsim con ttnn 0.81.1) |
| Libreria | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un transformer multimodal de la familia Gemma 4 que procesa entradas de texto, imagen y audio (pipeline `any-to-any`). La exportación de Xylolabs no altera la topología: mantiene las 35 capas del modelo de lenguaje, con atención de 35 capas para q/o y 15 capas para k/v, además de las torres de visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`), que permanecen intactas en bf16. Solo las proyecciones lineales del LM (q, o, k, v, gate, up, down) se cuantizan.

La cuantización se realiza con GPTQ sobre la rejilla `bfloat8_b` de TT-NN, preservando el exponente compartido por bloque tal como lo establece el empaquetador, de modo que TT-NN puede cargar las matrices sin recalcular valores. La calibración usa 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP8, lo que garantiza que el empaquetado en el dispositivo no modifique los valores (verificable con `pack_tensix.py` y `verify_grid.py`). No se dispone de información sobre el volumen total de tokens de entrenamiento original, la composición del dataset de Gemma 4 ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y audio (pipeline `any-to-any`, torres de visión y audio en bf16).
- Razonamiento y respuesta a preguntas factuales (evaluado con 40 preguntas, 36 correctas en esta versión).
- Cuantización compatible con GPTQ y empaquetado nativo TT-NN sin pérdida de valores.
- Ejecución en aceleradores Tensix (Wormhole, Blackhole) mediante tt-metal, ttnn y tt-forge.
- Compatibilidad con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) en bf16 sobre GPU/CPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (solo se documenta calibración en inglés y coreano).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent: el checkpoint está empaquetado para cargarse directamente en DRAM de Wormhole o Blackhole (7,56 GB de pesos del LM), lo que permite servir Gemma 4 E2B en hardware Tensix sin GPU, con precisión prácticamente idéntica a BF16 (KL 0,00239).
- Inferencia multimodal en el borde: al conservar las torres de visión y audio en bf16, el modelo puede procesar entradas imagen-texto y audio-texto en dispositivos Tensix con memoria limitada, usando la versión BFP4-MLP en equipos con menos DRAM.
- Evaluación de precisión de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que cada matriz empaquetada no altera valores, útil en pipelines de CI para regresión de precisión antes de desplegar un modelo cuantizado.
- Integración en tt-metal: el demo Gemma 4 de tt-metal (v0.81.1) ejecuta E2B, E4B y 12B en una Blackhole P150; este checkpoint se registra en `precision_overrides.json` con `{"attention": "bfp8", "shared_mlp": "bfp8"}` para cargar atención y MLP en BFP8 de forma exacta.
- Prototipado con transformers: la carga vía `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16")` permite usar el modelo en GPU convencional para comparar salidas contra BF16 y Q4_K_M antes de migrar a Tensix.
- Investigación en cuantización block-floating-point: sirve como referencia reproducible de GPTQ sobre rejilla BFP8 con exponente compartido por bloque, calibrado en 65.536 tokens, para estudiar el compromiso entre bits por peso (13,01 de media) y divergencia KL.
- Generación de respuestas factuales de baja latencia: con 36 de 40 respuestas correctas y sin pérdidas respecto a BF16 en el conjunto de evaluación, es apto para asistentes de preguntas y respuestas donde el coste energético de la NPU importa.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 16 | 9,29 | 0 | 100 | 37 de 40 | - |
| **Este modelo (BFP8)** | 13,01 | 7,556 | 0,00239 | 98,29 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,29329 | 80,25 | 37 de 40 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores provienen de la evaluación del autor sobre 40 preguntas y comparación KL/top-1 frente a BF16.

## Requisitos de hardware

- Memoria de dispositivo Tensix: ~7,56 GB para pesos del LM, más espacio para KV cache y buffers.
- Alternativa de menor huella: `Xylolabs/gemma-4-E2B-it-Tensix-BFP4-MLP` para dispositivos con menos DRAM.
- Hardware Tensix probado: Wormhole y Blackhole; demo tt-metal verificado en una Blackhole P150 (E2B, E4B y 12B).
- Simulación: ttnn 0.81.1 sobre ttsim (simulador Blackhole de Tenstorrent) para validar empaquetado.
- GPU convencional: carga en bf16 vía transformers requiere ~9,29 GB de pesos más activaciones y KV cache; cabe en GPUs consumer de 16 GB o más (por ejemplo RTX 4090, RTX 4080) y en A100/H100 para servir en paralelo.
- Opciones de despliegue: tt-metal / ttnn (nativo Tensix), tt-forge (tt-xla; aún no probado con Gemma 4), transformers en GPU/CPU, y llama.cpp solo como referencia comparativa Q4_K_M (no es el formato de este repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (BFP8)** | 5.525.831.235 | no disponible | BFP8 + bf16 (13,01 bits/peso) | apache-2.0 | Hugging Face, Tensix |
| `google/gemma-4-E2B-it` (BF16) | 5.525.831.235 (mismo base) | no disponible | bf16 (16 bits/peso) | condiciones de Google (no detalladas) | Hugging Face |
| Q4_K_M (llama.cpp) | mismo base | no disponible | 4-bit K-quant (5,87 bits/peso) | derivada del base | llama.cpp |
| `Xylolabs/gemma-4-E2B-it-Tensix-BFP4-MLP` | mismo base | no disponible | BFP4 en MLP | apache-2.0 | Hugging Face, Tensix |

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y no fueron evaluadas en esta exportación.
- La evaluación se limita a 40 preguntas y a métricas KL/top-1; no hay benchmarks estándar publicados, por lo que la calidad en tareas complejas (razonamiento, código, matemáticas) no está cuantificada.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en esta exportación.
- Sesgos: no se documentan sesgos conocidos ni auditorías de sesgo para esta versión cuantizada.
- Idiomas: no se detalla la cobertura multilingüe; la calibración GPTQ usó WikiText-2 (inglés) y Wikipedia en coreano, lo que puede afectar la precisión en idiomas no representados.
- Contexto: la longitud de contexto no está indicada en la información disponible.
- Licencia: el checkpoint exportado es Apache-2.0, pero el modelo base `google/gemma-4-E2B-it` tiene sus propias condiciones de uso que deben revisarse para uso comercial.
- Compatibilidad: tt-transformers no soporta Gemma 4; tt-forge (tt-xla) aún no se ha probado con Gemma 4 y, por defecto, mantiene pesos en bf16 (su opción `bfp_bf8` recuantiza en layout [out, in] de PyTorch).
- El empaquetado asume lectura de pesos como [in, out] en TT-NN; un layout incorrecto invalidaría la verificación de valores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Version BFP4-MLP: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tensix-BFP4-MLP
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Demo Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
