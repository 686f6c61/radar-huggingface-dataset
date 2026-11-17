# Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF

## Resumen

Qwen3.8-Flash-Next-MaxQ-32GB-GGUF es una cuantización extrema del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Synchopate bajo licencia Apache 2.0. El modelo base es un transformer híbrido de tipo MoE con 189.206.616.704 parámetros totales según los safetensors del repositorio original, y esta versión GGUF lo comprime hasta 35,71 GiB divididos en dos shards para que pueda ejecutarse en una máquina con 32 GB de RAM y sin GPU.

La innovación principal es una arquitectura de dos shards: un trunk residente en RAM de 24,98 GiB que conserva los 512 expertos enrutados y el módulo NextN de predicción multi-token, y un segundo shard de 10,73 GiB con la tabla de embeddings por capa (PLE) comprimida mediante PCA-Wiener y RaBitQ Q1_0, que se pagina bajo demanda desde NVMe mediante mmap. Esto permite ejecutar un modelo de escala ~176,5B nominales (unos 4,6-5,0B activos por token) en hardware de consumo.

El modelo es relevante porque demuestra que es posible servir arquitecturas MoE grandes en entornos sin GPU, con un rendimiento medido de 11,45-14,29 tok/s en generación y 74,55 tok/s en prefill sobre una CPU Zen 5 de 16 núcleos. La ficha se basa únicamente en la información publicada en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con capas Gated DeltaNet y QSA Full Attention, más módulo NextN MTP |
| Parámetros totales | 189.206.616.704 (dato de safetensors del modelo base); ~176,5B nominales según la model card |
| Parámetros activos | ~4,6B-5,0B por token (10 de 512 expertos enrutados + 1 experto compartido + capas densas GDN/QSA) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mezcla de F32, Q8_0, Q4_K, Q5_K, IQ1_S, IQ1_M, BF16, MXFP4, IQ2_XXS, IQ2_XS, Q2_0, Q6_K y Q1_0 (1.128 tensores LLM) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards) más un mmproj BF16 opcional para visión |

## Arquitectura y entrenamiento

El backbone, etiquetado como `qwen4exp`, consta de 48 capas troncales: 36 capas Gated DeltaNet con dimensiones [48×128×128] y 12 capas QSA de atención completa con `compress_ratio = 4`, más una capa NextN de predicción multi-token (`blk.48`). El MoE mantiene los 512 expertos enrutados con activación Top-10, distribuidos en 42 capas interiores con K=512 colapsadas mediante ConeCollapse (con sesgos `ffn_down_exps.bias` en F32) y 7 capas de frontera de ancho completo K=640. La tabla PLE contiene 320.001.536 filas proyectadas a un subespacio D=256.

La cuantización MaxQ v3.0 se construye sin modelos donantes ("donor-free") directamente desde la revisión `812d96e10a0dd82b69d749e68693698cf6c36daa` del modelo base en BF16 (329,72 GiB). El trunk se comprime a 1,63 bpw, mientras que el PLE se comprime a Q1_0 (41) con PCA-Wiener + RaBitQ y se pagina desde disco con `MADV_HUGEPAGE` de 2 MiB alineados para evitar precarga de páginas frías. La model card no proporciona detalles sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el proyector multimodal `mmproj-Qwen3.8-Flash-Next-BF16.gguf`.
- Decodificación especulativa integrada mediante el módulo NextN MTP del propio modelo.
- Inferencia en CPU sin GPU mediante llama.cpp y el ecosistema llama-modchip.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU: el modelo cabe en 32 GB de RAM con un VmHWM medido de 26,91 GiB, lo que permite ejecutar un MoE de ~176,5B nominales en portátiles o mini-PC de gama alta con CPU Zen 5.
- Procesamiento por lotes en servidores sin acelerador: con 74,55 tok/s de prefill en `pp512`, es adecuado para tareas de resumen o clasificación donde el coste de prefill domina y no se requiere baja latencia interactiva.
- Asistentes conversacionales con requisitos de privacidad: al ejecutarse completamente en local, los datos no salen de la máquina, lo que encaja en entornos con restricciones de confidencialidad.
- Extracción estructurada de JSON o SQL: la model card recomienda `temperature = 0` para extracción corta y estructurada, lo que permite usarlo en pipelines de parsing de documentos.
- Prototipado de aplicaciones multimodales: con el proyector `mmproj` opcional (0,85 GiB), puede procesar imagen y texto en local para tareas de descripción o VQA básica.
- Evaluación e investigación de técnicas de cuantización extrema: sirve como referencia reproducible para estudiar el impacto de PCA-Wiener, RaBitQ y la paginación selectiva de embeddings en la calidad de un MoE grande.
- Despliegue en entornos con restricciones de hardware: al no requerir GPU, se puede integrar en contenedores con cgroups v2 y límites estrictos de memoria, tal como valida la model card con `memory.max = 28.5 GiB`.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Throughput de generación (`tg128`) | 11,45-14,29 tok/s (pico 14,77 tok/s) |
| Throughput de prefill (`pp512`) | 74,55 tok/s |
| Mean KLD frente al modelo base | 1,0069 (frente a 0,9302 del competidor podado de 54,40 GiB) |
| Delta de KLD | 0,077 |
| Pico de memoria residente (`VmHWM`) | 26,91 GiB (límite 28,5 GiB) |
| Hardware de medida | CPU Zen 5 de 16 núcleos, 0 GPU |
| Tasa de acierto en modo greedy (`temp = 0`) | 2 de 8 en razonamiento abierto estricto; 3 de 8 con bucles de repetición |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- RAM: mínimo 32 GB; el trunk residente ocupa 24,98 GiB y el PLE se pagina desde NVMe, con un pico medido de 26,91 GiB.
- Almacenamiento: se recomienda NVMe para el shard 2 (10,73 GiB) por la paginación bajo demanda; el total del repositorio es de 39,2 GB.
- GPU: no requerida; la model card valida la ejecución con 0 GPUs.
- GPU de consumo: no aplica, ya que el modelo está diseñado para CPU; no se documenta compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: llama.cpp y llama-modchip v3.0 (con preset `qwen38-32gb`); no se documenta soporte de vLLM, TGI ni Ollama.
- Configuración de sampling obligatoria: `temperature = 0.6`, `top_p = 0.95`, `top_k = 20`, `presence_penalty = 0.2-1.0`, `repeat_penalty = 1.05`; reservar `temperature = 0` solo para extracción corta de JSON/SQL.
- Latencia y throughput: 11,45-14,29 tok/s en generación y 74,55 tok/s en prefill sobre CPU Zen 5 de 16 núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MaxQ-32GB (este) | ~176,5B nominales, ~4,6-5,0B activos | No disponible | 11,45-14,29 tok/s en CPU Zen 5; KLD 1,0069 | Apache 2.0 | GGUF, 35,71 GiB en dos shards |
| Checkpoints GGUF de Unsloth e ISTA-DASLab para Qwen3.8-Flash-Next | ~176,5B nominales | No disponible | No disponible | Apache 2.0 (heredada) | GGUF, 54,40-329,72 GiB; 0 de 18 caben en 32 GB de RAM |
| Modelo base Qwen/Qwen3.8-Flash-Next | 189,2B totales | No disponible | No disponible | Apache 2.0 | BF16, 329,72 GiB |

## Limitaciones y advertencias

- La cuantización a 1,63 bpw del trunk degrada la calidad: el KLD medio sube a 1,0069 frente a 0,9302 de un competidor podado de 54,40 GiB.
- El modo greedy (`temperature = 0`) entra en bucles de repetición en razonamiento abierto; solo 2 de 8 pasan la prueba estricta. Es obligatorio usar la configuración de sampling recomendada.
- El shard 2 depende de paginación desde NVMe; un disco lento o sin `MADV_HUGEPAGE` degradará significativamente el throughput.
- El campo `general.size_label` del shard 1 indica "5.0B", lo que puede confundir a herramientas de descubrimiento automático; el modelo real es mucho mayor.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo comprimido a baja precisión.
- La licencia Apache 2.0 permite uso comercial, pero la model card no detalla restricciones adicionales del modelo base.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente.
- El soporte de tool calling, agentes y contexto largo no está documentado; no debe asumirse en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Repositorio llama-modchip (referenciado en la model card)](https://github.com/synchopate/llama-modchip)
