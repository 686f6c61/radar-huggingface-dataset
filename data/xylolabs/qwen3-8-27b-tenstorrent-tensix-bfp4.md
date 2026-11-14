# Xylolabs/Qwen3.8-27B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.8-27B-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado en el que las capas lineales del modelo de lenguaje se han cuantizado a formato de coma flotante por bloques `bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ, mientras que la cabeza LM se ha cuantizado a `bfloat8_b` (BFP8, 8,5 bits por peso) por redondeo al más cercano. El resultado ocupa unos 17,60 GB de memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 53,79 GB del original en BF16.

El modelo base Qwen3.8-27B es un transformer multimodal de 27.781 millones de parámetros con pipeline image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. La arquitectura combina capas de atención clásica (16 capas) con capas de Gated DeltaNet (48 capas), lo que sugiere un diseño híbrido orientado a eficiencia en contextos largos, y un bloque MLP de 64 capas. El export incluye además tensores `mtp` (multi-token prediction) y `visual` en BF16 sin modificar.

La relevancia de esta ficha es doble: por un lado, demuestra que es posible llevar un modelo de 27B a hardware de aceleración no-GPU con una pérdida de calidad moderada (KL media de 0,02783 frente a BF16 y 93,19 % de top-1); por otro, es un caso práctico de cuantización BFP orientada a un backend concreto (TT-NN), con verificación bit a bit de que los valores empaquetados no cambian al cargarlos en el dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal: 16 capas de atención (q, k, v, o) + 48 capas Gated DeltaNet + 64 capas MLP, con cabeza LM y torre visual |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No disponible (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en capas lineales del LM; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en la cabeza LM; BF16 en embeddings, normas, `mtp` y `visual`. Media de 5,23 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado para TT-NN (`ttnn.bfloat4_b` / `ttnn.bfloat8_b`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que alterna capas de atención estándar con capas de Gated DeltaNet, un mecanismo de atención lineal recurrente que reduce el coste computacional y de memoria en secuencias largas. El export conserva esta estructura: 16 capas de atención con proyecciones q, k, v y o, 48 capas Gated DeltaNet con proyecciones q, k, v, z, a, b y output, y 64 capas MLP con gate, up y down. La torre visual y el módulo `mtp` se mantienen en BF16 sin cuantizar.

El proceso de cuantización es el elemento técnico diferenciador. Las matrices `bfloat4_b` se obtuvieron con GPTQ más una búsqueda de exponente por bloque, calibradas sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices `bfloat8_b` se cuantizaron por redondeo al más cercano. Los pesos cuantizados se almacenan como valores bf16 sobre la retícula BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterar sus valores; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) que comprueban bit a bit que el empaquetado no modifica los tensores. Solo se cuantizó y evaluó el modelo de lenguaje; la parte visual no fue evaluada.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y tokens especiales compatibles con transformers.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), heredado del modelo base; la torre visual se conserva en BF16.
- Razonamiento y generación de código y matemáticas, presumiblemente heredados del modelo base Qwen3.8-27B (no se han publicado evaluaciones específicas en esta ficha).
- Capacidades multilingües: no disponibles en la información proporcionada; la calibración incluyó coreano, lo que sugiere cobertura al menos de inglés y coreano, pero no se confirma.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Ejecución en NPU Tensix (Wormhole, Blackhole) mediante TT-NN y el demo `qwen38_27b_qb2` de tt-metal v0.81.1.
- Compatibilidad con el stack `transformers` en GPU/CPU convencional usando `dtype="bfloat16"`.

## Casos de uso

- Despliegue en clústeres Tenstorrent: el caso principal del checkpoint es ejecutar un modelo de 27B en NPU Tensix (Wormhole o Blackhole) con un consumo de 17,60 GB de DRAM de dispositivo para los pesos del LM, liberando GPUs para otras cargas. El demo `qwen38_27b_qb2` lo ejecuta en paralelo de tensores sobre cuatro chips Blackhole (QuietBox 2).
- Inferencia multimodal en el borde de la red: al conservar la torre visual en BF16 y reducir el LM a BFP4, se puede servir un modelo image-text-to-text con requisitos de memoria muy inferiores a los 53,79 GB del BF16, útil para clasificación de imágenes con descripción, extracción de información de documentos escaneados o asistencia visual.
- Prototipado con transformers en GPU: el checkpoint se carga con `AutoModelForCausalLM.from_pretrained(repo, dtype="bfloat16", device_map="auto")`, lo que permite validar prompts, plantillas de chat y calidad de respuestas antes de portar el modelo a TT-NN.
- Evaluación de pipelines de cuantización BFP: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar que el empaquetado BFP4/BFP8 no altera los valores, lo que resulta útil para equipos que investigan cuantización de bloque en aceleradores.
- Generación de código y asistencia técnica en entornos con NPU: con una pérdida de calidad moderada (93,19 % de top-1 frente a 100 % en BF16) y 38 de 40 respuestas correctas en la evaluación del autor, es viable para autocompletado, revisión de código y respuesta a preguntas técnicas donde no se exige precisión absoluta.
- Investigación comparativa de formatos: la tabla de evaluación del autor (BF16, BFP4, Q4_K_M) permite estudiar el compromiso entre bits por peso, tamaño y KL, y comparar BFP4 con cuantizaciones GGUF de llama.cpp en el mismo modelo base.
- Servicio conversacional de bajo coste: con 5,23 bits por peso de media y 17,60 GB empaquetados, se puede ofrecer un chatbot multi-turno en hardware Tensix con menor huella de memoria que el modelo original.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación del LM, 4.094 posiciones de inglés; la información se corta en el texto disponible):

| Modelo | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.8-27B) | 16 | 53,79 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP4/BFP8)** | 5,23 | 17,596 | 0,02783 | 93,19 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,92 | 16,811 | 0,02084 | 93,50 | 40 de 40 | 0 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM / memoria de dispositivo: aproximadamente 17,60 GB para los pesos del LM en BFP4/BFP8, más espacio para la caché KV y buffers. El repo completo ocupa 55,6 GB en disco.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. El demo `qwen38_27b_qb2` de tt-metal v0.81.1 requiere cuatro chips Blackhole (QuietBox 2) en paralelo de tensores y rechaza otro hardware.
- GPU convencionales: no se especifican requisitos; al cargarse con transformers en `bfloat16` el modelo ocuparía del orden de 53,79 GB de pesos, por lo que necesitaría GPUs de 80 GB (A100, H100) o sharding multi-GPU con `device_map="auto"`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; no se documenta una ruta de ejecución en GPU de consumo para este checkpoint concreto.
- Opciones de despliegue: TT-NN / tt-metal (demo `qwen38_27b_qb2`), transformers con safetensors, y verificación con `pack_tensix.py` y `verify_grid.py`. tt-forge (tt-xla) aún no se ha probado con este checkpoint. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este export.
- Latencia y throughput: no disponibles en la información proporcionada. El demo sugiere `--length 128 --generate 128` como configuración de prueba, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits/peso | Tamaño | Contexto | Licencia | Hardware |
|---|---|---:|---:|---|---|---|
| **Este modelo (BFP4/BFP8)** | 27,78 B | 5,23 | 17,60 GB | No disponible | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3.8-27B (BF16) | 27,78 B | 16 | 53,79 GB | No disponible | Apache-2.0 | GPU / CPU |
| Qwen3.8-27B Q4_K_M (llama.cpp) | 27,78 B | 4,92 | 16,81 GB | No disponible | Apache-2.0 | CPU / GPU (GGUF) |

La comparación relevante es con el modelo base en BF16 y con la cuantización Q4_K_M de llama.cpp, ambos sobre el mismo Qwen3.8-27B. El export BFP4 ofrece un tamaño similar a Q4_K_M (17,60 frente a 16,81 GB) con una KL ligeramente peor (0,02783 frente a 0,02084) y un top-1 similar (93,19 % frente a 93,50 %), pero está diseñado exclusivamente para NPU Tensix, mientras que Q4_K_M es portable a CPU y GPU mediante llama.cpp. No se dispone de datos para comparar con otros modelos de 27B de la misma categoría.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el módulo `mtp` no fueron evaluados, por lo que el rendimiento multimodal no está verificado.
- La evaluación publicada es limitada: 4.094 posiciones de inglés y 40 preguntas, insuficiente para caracterizar el modelo en producción.
- Pérdida de calidad medible frente a BF16: KL media de 0,02783 y top-1 del 93,19 % (frente a 100 % en BF16); dos respuestas incorrectas de 40 en la evaluación del autor.
- Dependencia fuerte de hardware: el demo de tt-metal solo funciona en cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware; tt-forge no se ha probado.
- La configuración `config/precision.json` del demo re-cuantizaría la cabeza a `bfloat4_b`; es necesario exportar `QWEN_PRECISION_CONFIG=baseline` para que coincida con este checkpoint.
- Idiomas soportados no documentados; la calibración usó WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento del export cuantizado; conviene validar en el caso de uso concreto antes de desplegar.
- El número de descargas (83) y la ausencia de likes sugieren un modelo poco probado por la comunidad; no hay evidencia externa de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal qwen38_27b_qb2 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
