# TinoBruno/moecher-deepseek-v4.1-flash-mixed

## Resumen

DeepSeek-V4.1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 552 mil millones de parámetros totales y 14 mil millones activos por token. Este repositorio concreto, publicado por el usuario TinoBruno bajo el nombre `moecher-deepseek-v4.1-flash-mixed`, no contiene los pesos originales en formato estándar, sino un paquete de pesos binarios prealineados, mapas de tiering de expertos guiados por importancia, manifiesto y tokenizador, formateados específicamente para el motor de inferencia bare-metal C++/CUDA [MinnieTheMoEcher](https://github.com/tinobruno/MinnieTheMoEcher).

La propuesta técnica del paquete es una cuantización asimétrica mixta de tres niveles: los expertos "calientes" (los más activados) se conservan en NVFP4 dentro de la VRAM de la GPU, mientras que los expertos "fríos" se calibran con una importance matrix a IQ2_XXS y Q2_K y se distribuyen entre VRAM L1, DDR5 fijada en memoria (pinned) como caché L2 y SSD NVMe como L3. Con ello, el paquete reduce el modelo de ~280 GiB (NVFP4 puro) a 184,77 GiB en disco, eliminando el cuello de botella del SSD durante la inferencia.

El resultado declarado por el autor es de hasta 214,85 tok/s en prefill y 16,65 tok/s en decodificación sobre una única GPU de estación de trabajo de 96 GB más 64 GB de DDR5. Es relevante ahora porque demuestra una vía práctica para ejecutar modelos MoE de escala frontera en hardware de un solo nodo mediante tiering asimétrico de expertos y cuantización heterogénea, aunque el paquete está atado a un motor de inferencia concreto y no es directamente consumible por stacks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek_v41` (transformer MoE con Multi-Head Latent Attention, mHC y modulo Engram) |
| Parametros totales | 552 mil millones |
| Parametros activos | 14 mil millones por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (expertos calientes y shared experts), IQ2_XXS + Q2_K (expertos frios), FP8_E4M3 / BF16 (atencion, normas, LM head) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | Binario propietario del motor MinnieTheMoEcher (no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `deepseek_v41`, con 40 capas transformer, `hidden_size = 5120` y un vocabulario de 129.280 tokens. La atención es Multi-Head Latent Attention (MLA) con 64 cabezas de consulta, `head_dim = 512`, `qk_rope_head_dim = 64`, `q_lora_rank = 1280`, `o_lora_rank = 1024` y 8 grupos de salida. Para el contexto largo incorpora una ventana deslizante local de 128 tokens combinada con un Lightning Indexer Top-512 sobre bloques KV comprimidos, lo que da lugar a una atención compactada de orden O(640) en memoria compartida para secuencias de hasta 1M de tokens. El flujo residual usa Multi-Head Highway Connections (mHC) por capa, y en la capa 2 se incluye un módulo de memoria Engram basado en búsqueda de N-gramas con hash.

La topología MoE consta de 384 expertos enrutados más 1 experto compartido por capa (15.360 expertos enrutados en total), con `top_k = 6`, puntuación `sqrtsoftplus`, `routed_scaling_factor = 1.5` y `moe_intermediate_size = 2304`. La cuantización asimétrica del paquete se basa en un perfilado de frecuencia de activación (`deepseek_v41_imatrix.dat.counts.json`): 3.840 expertos calientes (25%) se conservan en NVFP4 (67,24 GiB), y los 11.520 restantes (75%) se calibran a IQ2_XXS (proyecciones w1/w3) y Q2_K (proyección w2), con 106,79 GiB. El núcleo siempre residente ocupa 10,74 GiB en VRAM. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto en inglés y chino, con soporte de razonamiento y contexto largo de hasta 1M de tokens.
- Atención eficiente sobre secuencias muy largas gracias a MLA, ventana deslizante local de 128 tokens y Lightning Indexer Top-512.
- Memoria Engram para recuperación de patrones N-grama hasheados en la capa 2.
- Capacidad de ejecución en un único nodo mediante tiering de expertos entre VRAM, DDR5 pinned y NVMe.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de modelos frontera en un solo nodo: el paquete permite ejecutar un MoE de 552B/14B activos en una estación con GPU de 96 GB y 64 GB de DDR5, sin necesidad de clúster multi-GPU, gracias al tiering de expertos entre VRAM, DDR5 pinned y NVMe.
- Procesamiento de documentos largos: con 1M de tokens de contexto y atención compactada O(640), es adecuado para analizar corpus extensos, contratos o bases de código completas en una sola pasada.
- Investigación sobre cuantización asimétrica: sirve como banco de pruebas para estudiar el impacto de NVFP4 frente a IQ2_XXS/Q2_K en la precisión de expertos según su frecuencia de activación.
- Desarrollo de motores de inferencia: el manifiesto, los mapas de tiering y el tokenizador permiten validar estrategias de prefetch y caché L2/L1 en el motor MinnieTheMoEcher sobre PCIe 5.0 x16.
- Evaluación de hardware Blackwell: útil para medir throughput de prefill y decode en GPUs sm_120a con GDDR7 y caché L2 persistente.
- Despliegue de asistentes en inglés y chino: el modelo cubre ambos idiomas y puede integrarse en servicios de generación de texto donde el contexto largo sea crítico.
- Benchmarking comparativo de motores: el autor publica suites comparativas frente a DwarfStar (`antirez/ds4`), lo que permite reproducir mediciones de latencia y throughput.

## Benchmarks y rendimiento

| Metrica | Valor | Hardware |
|---|---|---|
| Prefill | hasta 214,85 tok/s | RTX PRO 6000 Blackwell Max-Q 96 GB + Ryzen 9 9950X3D + 64 GB DDR5-6000 |
| Decode | 16,65 tok/s | mismo equipo |
| Tamano en disco | 184,77 GiB | paquete compactado |
| Tamano NVFP4 puro (referencia) | ~280 GiB | — |
| Núcleo siempre residente en VRAM | 10,74 GiB | — |
| Expertos calientes NVFP4 | 67,24 GiB (3.840 expertos) | — |
| Expertos frios IQ2_XXS + Q2_K | 106,79 GiB (11.520 expertos) | — |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el paquete completo requiere 184,77 GiB en disco; en ejecución, el autor reporta un uso de 96 GB de VRAM más 64 GB de DDR5 con 42 GB en caché L2 pinned.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell Max-Q Workstation Edition (97.887 MiB, sm_120a, ~1.800 GB/s). Se requiere arquitectura Blackwell para NVFP4.
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, etc.) con este paquete completo.
- Interconexión: PCIe 5.0 x16 para el streaming de expertos fríos desde DDR5.
- Memoria del sistema: 64 GB DDR5-6000 dual-channel, con 42 GB reservados como caché L2 pinned.
- Almacenamiento: SSD NVMe PCIe para el nivel L3 de expertos de cola.
- Opciones de despliegue: exclusivamente el motor MinnieTheMoEcher (C++/CUDA bare-metal). No compatible con vLLM, llama.cpp, Ollama ni TGI en el formato actual.
- Latencia y throughput: hasta 214,85 tok/s prefill y 16,65 tok/s decode según el autor.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (paquete Moecher) | 552B / 14B | 1M | MIT | Binario MinnieTheMoEcher | Hugging Face (este repo) |
| DeepSeek-V4.1-Flash-1017 (base) | 552B / 14B | no disponible | no disponible | no disponible | Hugging Face (deepseek-ai) |
| DwarfStar (`antirez/ds4`) | no disponible | no disponible | no disponible | no disponible | Repositorio del autor citado como referencia de benchmark |

No se dispone de datos de rendimiento de calidad para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete solo es utilizable con el motor MinnieTheMoEcher; no es un checkpoint estándar en safetensors ni GGUF, por lo que no se puede cargar en stacks convencionales.
- Requiere hardware Blackwell (sm_120a) para NVFP4 y una GPU de ~96 GB de VRAM; el umbral de entrada es muy alto.
- La cuantización IQ2_XXS/Q2_K en el 75% de los expertos puede degradar la calidad en dominios donde esos expertos sean relevantes; el autor no publica métricas de calidad.
- Idiomas limitados a inglés y chino; el castellano no está declarado como soportado.
- Riesgo de alucinación no evaluado en la información disponible.
- Sesgos conocidos del modelo base: no disponibles.
- La licencia MIT se aplica al paquete, pero debe verificarse la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- El rendimiento reportado procede de benchmarks del propio autor, sin replicación externa conocida.

## Enlaces

- [Hugging Face: TinoBruno/moecher-deepseek-v4.1-flash-mixed](https://huggingface.co/TinoBruno/moecher-deepseek-v4.1-flash-mixed)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Repositorio del motor MinnieTheMoEcher](https://github.com/tinobruno/MinnieTheMoEcher)
- [Benchmark multi-modelo RTX PRO 6000 96GB](https://github.com/tinobruno/MinnieTheMoEcher/blob/master/benchmarks/benchmarks_RTXPRO6000_96GB_9950X3D_64GB_DDR5_6000/REPORT.md)
- [Benchmark MinnieTheMoEcher vs. DwarfStar](https://github.com/tinobruno/MinnieTheMoEcher/blob/master/benchmarks/rtxpro600096gbWin64gb/REPORT.md)
- [DwarfStar (antirez/ds4)](https://github.com/antirez/ds4)
