# Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Qwen3-4B-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo Qwen3-4B de Alibaba Qwen, preparada por Xylolabs específicamente para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer densa del Qwen3-4B original, con 4.411 millones de parámetros, pero sustituye los pesos de las capas lineales por formatos de coma flotante por bloques nativos de TT-NN: `bfloat4_b` (BFP4) para las proyecciones MLP y `bfloat8_b` (BFP8) para la atención, dejando embeddings, LM head y normalizaciones en bf16.

La propuesta de valor es el despliegue eficiente en hardware de Tenstorrent: el checkpoint ocupa 3,29 GB empaquetado (6,55 bits por peso de media), frente a los 8,04 GB del BF16 original, y está diseñado para que TT-NN lo cargue en memoria del dispositivo sin transformar los valores. La cuantización de las matrices BFP4 se realizó con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; las BFP8 se obtuvieron por redondeo al más próximo.

Es relevante para quienes trabajan con aceleradores Tenstorrent y necesitan un modelo conversacional de tamaño medio con licencia permisiva (Apache 2.0) que aproveche los formatos de bloque del hardware. El autor advierte que tt-transformers y tt-forge no se han probado con este checkpoint y que la validación se hizo sobre el simulador Blackhole de Tenstorrent (ttsim) con ttnn 0.81.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), capas lineales cuantizadas a formatos BFP de Tensix |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención; bf16 en embeddings, LM head y normas; 6,55 bits/peso de media |
| Idiomas soportados | no disponible (calibración en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetados para TT-NN), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 36 capas con atención completa y proyecciones MLP tipo SwiGLU. Sobre esa base, Xylolabs aplica una cuantización selectiva por tipo de tensor: las proyecciones q, k, v y o de las 36 capas se almacenan en `bfloat8_b` mediante redondeo al más próximo, mientras que las proyecciones gate, up y down del MLP se cuantizan a `bfloat4_b` con GPTQ y una búsqueda de exponente por bloque. El resto de tensores (embedding, LM head atada al embedding, normas) permanece en bf16 tal como en el modelo original.

La calibración de GPTQ emplea 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores BFP4 y BFP8 se almacenan como valores bf16 sobre la retícula de bloques correspondiente, de modo que TT-NN los empaqueta sin alterar sus valores; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) para comprobar que el empaquetado es exacto. No se documenta entrenamiento adicional, RLHF ni DPO sobre el checkpoint; se trata exclusivamente de una conversión de pesos. Tampoco se especifican innovaciones de decodificación (especulativa, atención lineal) más allá de las propias del Qwen3 base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento con modo "thinking" (el autor evalúa 7 prompts de razonamiento con thinking activado).
- Respuestas a preguntas de conocimiento general y tareas cortas con comprobación automática (33 prompts en la evaluación).
- Capacidad multilingüe heredada del modelo base, con calibración explícita en inglés y coreano (no se detalla la lista completa de idiomas).
- Ejecución en NPU Tensix mediante TT-NN, con empaquetado directo de pesos BFP4/BFP8 en DRAM del dispositivo.
- Compatibilidad con la librería `transformers` para inferencia en GPU/CPU (carga en bf16 con `device_map="auto"`).
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información proporcionada; se heredaría, en su caso, del Qwen3-4B base.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está pensado para cargarse directamente en DRAM del dispositivo (3,29 GB de pesos) mediante TT-NN, aprovechando los formatos nativos BFP4/BFP8 sin conversión en tiempo de ejecución.
- Prototipado de pipelines de inferencia en TT-Metal: útil para validar el empaquetado de matrices y la fidelidad numérica frente a BF16 usando los scripts de verificación incluidos.
- Asistentes conversacionales de dominio general en entornos con recursos limitados: el modelo conserva el 90,78 % de top-1 frente a BF16 y responde correctamente 36 de 40 preguntas de la evaluación, con licencia Apache 2.0 apta para uso comercial.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de BFP4+BFP8 frente a Q4_K_M de llama.cpp en métricas de KL y top-1 sobre texto inglés y coreano.
- Investigación en cuantización de bloque: el uso de GPTQ con búsqueda de exponente por bloque sobre BFP4 es un caso práctico para estudiar el impacto de formatos de coma flotante por bloques en modelos de 4B.
- Generación de texto en inglés y coreano: la calibración incluye Wikipedia en coreano, lo que hace al modelo razonablemente adecuado para tareas en esos idiomas, aunque no se publica una evaluación específica por idioma.
- Inferencia en `transformers` sobre GPU: aunque el checkpoint está orientado a Tensix, puede cargarse en bf16 con `AutoModelForCausalLM` para pruebas funcionales o comparaciones.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B) | 16 | 8,04 | 0 | 100 | 36 de 40 | - |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,55 | 3,294 | 0,0513 | 90,78 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 2,497 | 0,06581 | 89,61 | 38 de 40 | 0 |

Las métricas de KL y top-1 cubren 16.240 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las "respuestas" son 33 prompts cortos con comprobación automática más 7 de razonamiento con thinking activado (40 en total). El autor declara como criterio de aceptación un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el modelo cumple con 0,78 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 0. No se reportan métricas de velocidad ni de calidad de tarea (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 3,29 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. Validado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).
- GPU convencionales: puede cargarse en bf16 con `transformers` y `device_map="auto"`; el tamaño en bf16 es de 8,04 GB, por lo que requiere al menos ~9-10 GB de VRAM considerando caché KV y overhead. Cabe en RTX 4090 (24 GB) y en GPUs de 16 GB o más; en GPUs de 8 GB no cabría en bf16 sin cuantización adicional.
- Opciones de despliegue: TT-NN / tt-metal para Tensix; `transformers` para GPU/CPU. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 MLP / BFP8 atención) | 4,41 B | no disponible | BFP4 + BFP8 (6,55 bits/peso), 3,29 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3-4B (BF16) | 4,41 B | no disponible | bf16 (16 bits/peso), 8,04 GB | Apache 2.0 | Hugging Face |
| Qwen3-4B Q4_K_M (llama.cpp) | 4,41 B | no disponible | Q4_K_M (4,95 bits/peso), 2,50 GB | Apache 2.0 | Generado con llama.cpp v0.9.0 |

Frente a la versión BF16, este checkpoint reduce el tamaño a menos de la mitad con un KL medio de 0,0513 y un top-1 del 90,78 %. Frente a Q4_K_M, ocupa más espacio (3,29 GB vs 2,50 GB) y tiene mejor KL (0,0513 vs 0,06581), aunque Q4_K_M acierta 38 de 40 respuestas frente a 36 de 40 en esta evaluación concreta. La diferencia clave es el soporte nativo de Tensix, ausente en las alternativas.

## Limitaciones y advertencias

- El checkpoint está diseñado para TT-NN; tt-transformers y tt-forge no se han probado con él, según el autor.
- La validación se realizó sobre el simulador Blackhole (ttsim), no sobre hardware físico; el rendimiento real en dispositivo puede diferir.
- Los benchmarks miden fidelidad frente a BF16 (KL, top-1), no calidad de tarea; no hay resultados de MMLU, HumanEval, GSM8K ni similares.
- La calibración de GPTQ se limita a WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas o dominios no está evaluado.
- No se especifica la longitud de contexto soportada en la información disponible, aunque se hereda del Qwen3-4B base.
- Riesgo de alucinación inherente al modelo base; la cuantización a 4,5 bits en MLP puede acentuar degradaciones en tareas sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el modelo "tal cual", sin garantía, y aclara que no está afiliado ni respaldado por Tenstorrent.
- El número de descargas (27) y likes (0) indica adopción muy temprana; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia Qwen3: https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
