# Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF

## Resumen

DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF es una cuantización GGUF del modelo DeepSeek-V4-Flash-0731 (284,33B parámetros, arquitectura Mixture-of-Experts con 256 expertos enrutados y top-8 activos) publicada por el usuario Synchopate. Su objetivo no es mejorar el modelo base, sino hacerlo caber íntegramente en la RAM física de una estación de trabajo con 64 GB de DDR5, sin GPU y sin swap, manteniendo el contexto completo de 256K tokens.

El problema que resuelve es concreto: las cuantizaciones estándar de 1 y 2 bits (`IQ1_S`, `IQ2_XXS`) del modelo ocupan 76,87 GiB en disco, lo que en una máquina Linux de 64 GB (~62,8 GiB usables) provoca el OOM killer o fuerza a transmitir más de 16 GiB de pesos desde NVMe en cada token, con una caída de throughput del 93 % (de 133 tok/s a 9,6 tok/s). Esta variante reduce el fichero a 56,56 GiB (−26,4 %) mediante una combinación de compresión Hessiana de segundo orden en las proyecciones SwiGLU y transcodificación selectiva de las capas MLA e indexer disperso.

Es relevante para desarrolladores que quieran ejecutar un modelo frontera de razonamiento y código en hardware de consumo o servidores sin acelerador, con un proceso vivo de 57,61 GiB de VmRSS y cero swap. La licencia es MIT y el formato es GGUF para llama.cpp, con kernels AVX-512BW/AVX2 propios distribuidos en el repositorio `llama-modchip`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con MLA (Multi-head Latent Attention), Engram y MQA8 Sparse Indexer; 61 capas, 256 expertos enrutados, top-8 activos |
| Parametros totales | 284,33B |
| Parametros activos | top-8 de 256 expertos enrutados (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 256K tokens (cache KV MLA residente en RAM) |
| Tipos de cuantizacion | Mezcla: `IQ1_S` (1,56 bpw) en `ffn_up_exps` y `ffn_gate_exps`; `Q2_0` Fractal-64 (3,75 bpw) en MLA e indexer; `Q5_K`/`Q6_K`/`F32` en proyecciones densas, expertos compartidos, capas densas 0-2 y embeddings |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (60.729.886.080 bytes, 56,56 GiB) |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 y deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Herramienta de cuantizacion | `llama-modchip v2.4.0` (`scripts/transcode_dsv4.c`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 61 capas con 256 expertos enrutados y top-8 activos, que combina Multi-head Latent Attention (MLA), un componente denominado Engram y un indexer disperso MQA8. La cuantización no altera la topología: preserva las capas densas iniciales (blk.0 a blk.2), los expertos compartidos (`ffn_*_shexp`), las proyecciones densas de query/value de MLA (`attn_q_a`, `attn_q_b`, `attn_kv_a_mqa`, `attn_v_b`, `attn_wo`) y los embeddings de tokens en `Q5_K`, `Q6_K` o `F32`.

La innovación técnica de esta ficha es el proceso de compresión en tres frentes. Primero, una compresión por cross-proyección Hessiana de segundo orden (`SwiGLU-H2`) aplicada a `ffn_up_exps` y `ffn_gate_exps`: en un FFN SwiGLU, el error de cuantización de la fila r de `W_up` se amplifica por E[SiLU(z_g,r)²] = (7/20)·||W_g^(r,:)||₂²·σ_x², y el de `W_gate` por E[SiLU'(z_g,r)²]·||W_u^(r,:)||₂² ≈ (31/100)·||W_u^(r,:)||₂²·σ_x². Ponderar la optimización de los superbloques `IQ1_S` con esas normas cerradas evita el colapso de perplejidad sin necesidad de datasets de calibración externos, y ahorra 15,49 GiB. Segundo, la transcodificación de las capas MLA e indexer disperso a bloques `Q2_0` de 64 pesos (30 bytes por bloque, escala y zero-point FP16 por bloque, resueltos con un solver Lloyd-Max de 24 iteraciones), que reduce `attn_k_b` de 3,70 GiB a 1,62 GiB y ahorra 4,82 GiB adicionales. Tercero, el mantenimiento a alta precisión del backbone denso de razonamiento.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base DeepSeek-V4-Flash.
- Generación de código, con etiqueta explícita `claude-code` que sugiere integración con flujos de agente tipo Claude Code (el autor distribuye un CLI `./modchip claude`).
- Inferencia íntegra en CPU con contexto de 256K tokens, incluyendo cache KV MLA residente en RAM.
- Soporte de decodificación con kernels AVX-512BW y AVX2 propios del motor `llama-modchip`.
- Restauración rápida de estado KV mediante `/dev/shm` (slot-0), pensada para turnos multi-step de agentes.
- Capacidades de tool calling, function calling, visión o audio: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- **Agentes de código en estación de trabajo sin GPU**: el modelo puede ejecutar turnos de Claude Code con contexto largo gracias a los 256K tokens y a la restauración de KV desde `/dev/shm`, que reduce el turno 1 (2.940 tokens) de 65.800 ms a 13,06 ms. Adecuado para equipos que no quieren depender de APIs externas.
- **Servidores de inferencia CPU-only en entornos restringidos**: con 57,61 GiB de VmRSS y cero swap en una máquina de 64 GB, encaja en nodos sin acelerador donde no se permite añadir GPU por coste o por política.
- **Razonamiento y análisis de documentos largos**: la ventana de 256K permite procesar contratos, informes o bases de código completas en una sola pasada, manteniendo el cache KV en RAM física.
- **Asistente de desarrollo local con privacidad de datos**: al ejecutarse íntegramente en la máquina del desarrollador, el código y los prompts no salen del equipo; útil para sectores regulados.
- **Prototipado de pipelines de agentes multi-step**: la combinación de tool calling (si el modelo base lo soporta) y contexto largo permite orquestar cadenas de razonamiento con múltiples llamadas a herramientas sin recargar el prompt.
- **Evaluación comparativa de cuantizaciones extremas**: sirve como referencia para estudiar el impacto de `IQ1_S` + `Q2_0` Fractal-64 en calidad frente a `IQ2_XXS`, dado que el autor documenta el proceso de compresión y las métricas de memoria.
- **Despliegue educativo o de investigación en hardware de consumo**: permite a investigadores sin clúster ejecutar un modelo de 284B parámetros en un equipo de sobremesa con 64 GB de DDR5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de rendimiento de inferencia comparando la cuantización estándar con esta variante:

| Métrica | Baseline `IQ1_S`/`IQ2_XXS` | Fractal-64GB (`v2.4.0`) | Mejora |
|---|---|---|---|
| Tamano GGUF en disco | 76,87 GiB | 56,56 GiB (60.729.886.080 B) | −20,31 GiB (−26,4 %) |
| VmRSS con contexto 256K | > 64 GiB (thrashing de 16 GiB en SSD) | 57,61 GiB (60.408.048 kB, 0 swap) | 100 % residente en 64 GB |
| Prefill CPU puro (pp=403..580, 16c Zen 5) | 25,05 tok/s | 43,16–44,36 tok/s | +77,1 % |
| Decode CPU puro (tg, 16c Zen 5) | 6,41 tok/s | 9,06–10,74 tok/s (11,5–14,7 con PVS) | +55 % a +129 % |
| Restauración warm Claude Code turno 1 (2.940 tok) | 65.800 ms (evaluación en frío) | 13,06 ms (restauración KV slot-0 en `/dev/shm`) | 5.038x más rápido |

## Requisitos de hardware

- **RAM**: mínimo 64 GB de DDR5; el proceso vivo ocupa 57,61 GiB con contexto de 256K, dejando 6,39 GiB de margen para el sistema operativo. No cabe en máquinas de 32 GB ni en 48 GB.
- **CPU**: se han medido 16 núcleos Zen 5; se requieren kernels AVX-512BW o AVX2, proporcionados por `llama-modchip`.
- **GPU**: no se necesita ninguna; el modelo está diseñado para inferencia 100 % CPU con 0 GPUs y 0 swap.
- **Almacenamiento**: el GGUF ocupa 56,56 GiB; se recomienda almacenamiento NVMe para la carga inicial y `/dev/shm` para la restauración de KV.
- **Despliegue**: motor `llama-modchip` (fork de llama.cpp con kernels propios y CLI `./modchip claude`). Compatibilidad con vLLM, TGI u Ollama: no disponible.
- **Latencia y throughput**: prefill de 43,16–44,36 tok/s y decode de 9,06–10,74 tok/s (hasta 14,7 tok/s con PVS) en 16 núcleos Zen 5. El throughput en otras microarquitecturas no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF | 284,33B (MoE, top-8) | 256K | GGUF, llama-modchip, CPU | MIT | Cabe en 64 GB de RAM; 9–14,7 tok/s decode en 16c Zen 5 |
| DeepSeek-V4-Flash-0731 `IQ1_S`/`IQ2_XXS` | 284,33B (MoE, top-8) | 256K | GGUF, llama.cpp | MIT (modelo base) | 76,87 GiB; requiere >64 GB o swap con thrashing del 93 % |
| DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | Modelo base alternativo citado por el autor; sin datos de cuantización en esta ficha |

No se dispone de datos de benchmarks de calidad ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- **Calidad de cuantización extrema**: `IQ1_S` a 1,56 bpw en las proyecciones de expertos y `Q2_0` a 3,75 bpw en MLA e indexer implican pérdida de precisión. El autor afirma que no hay colapso de perplejidad, pero no publica métricas de calidad que lo respalden.
- **Riesgo de alucinación**: inherente al modelo base y potencialmente agravado por la cuantización de 1 bit en partes del FFN; no se han publicado evaluaciones específicas.
- **Requisito de hardware estricto**: necesita 64 GB de RAM y CPU con AVX-512BW/AVX2; no es portable a GPUs ni a entornos con menos memoria sin volver a cuantizar.
- **Dependencia de un fork**: requiere `llama-modchip v2.4.0`, no el llama.cpp estándar; la compatibilidad futura con versiones upstream de llama.cpp no está garantizada.
- **Licencia**: MIT, lo que permite uso comercial, pero conviene verificar la licencia del modelo base DeepSeek-V4-Flash-0731, no detallada en esta información.
- **Idiomas y sesgos**: no se dispone de información sobre cobertura lingüística ni sesgos conocidos del modelo base.
- **Madurez**: publicación con 0 descargas y 0 likes, creada y actualizada el 5 de noviembre de 2026; sin validación comunitaria.
- **Throughput limitado**: 9–14,7 tok/s en decode no es apto para aplicaciones interactivas de baja latencia con muchos usuarios concurrentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF
- Repositorio del motor y kernels: https://github.com/synchopate/llama-modchip
- Script de transcodificación: https://github.com/synchopate/llama-modchip/blob/main/scripts/transcode_dsv4.c
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Modelo base alternativo: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
