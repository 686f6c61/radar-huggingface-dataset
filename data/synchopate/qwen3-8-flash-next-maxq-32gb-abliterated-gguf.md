# Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF

## Resumen
Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF es una cuantización GGUF del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Synchopate. Se trata de una variante "abliterated" (sin censura) del modelo original, diseñada específicamente para inferencia en CPU con 32 GB de RAM mediante el formato MaxQ, que combina una parte troncal residente en memoria y una tabla de embeddings léxicos posicionales (PLE) paginada bajo demanda desde NVMe.

El modelo conserva la arquitectura MoE completa de Qwen3.8-Flash-Next, con 512 expertos enrutados y aproximadamente 4,6-5,0 mil millones de parámetros activos por token, sobre un total nominal de unos 176,5 mil millones. La edición "abliterated" aplica una proyección ortogonal de rango 2 sobre los subespacios de activación que median en los rechazos, reduciendo las negativas del modelo en dominios de seguridad dual-use del 43,75% al 12,50%, con un incremento de perplejidad de solo +0,3189%.

Su relevancia radica en que permite ejecutar un modelo de gran tamaño y arquitectura híbrida (Gated DeltaNet + atención completa QSA) en hardware de consumo con 32 GB de RAM, a costa de una cuantización agresiva de 1,63 bits por peso en el tronco, y ofrece una variante sin restricciones de contenido orientada a investigación de seguridad, auditoría de código y análisis de binarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (Gated DeltaNet + QSA full attention) con capa NextN MTP |
| Parametros totales | ~176,5B nominales (~152,3B tras ConeCollapse + PLE) |
| Parametros activos | ~4,6B–5,0B por token (10 de 512 expertos enrutados + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF MaxQ (tronco a 1,63 bpw; PLE con PCA-Wiener D=256 + RaBitQ Q1_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (shard 1: 24,98 GiB residente; shard 2: 10,73 GiB PLE en NVMe) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next emplea una topología denominada `qwen4exp` con 48 capas troncales: 36 capas de Gated DeltaNet (atención lineal) y 12 capas de QSA full attention con `compress_ratio = 4`, más una capa NextN de predicción multi-token (`blk.48`). La capa MoE contiene 512 expertos enrutados, de los cuales 10 se activan por token junto con 1 experto compartido, dando lugar a los ~4,6-5,0B parámetros activos. Incluye una tabla PLE de 320M filas.

La cuantización MaxQ aplica una contracción espectral (ConeCollapse) que retiene el 92,28% de la energía espectral media, y comprime la tabla PLE mediante PCA-Wiener con dimensión 256 y cuantización RaBitQ Q1_0. La edición "abliterated" se construye sin modelos donantes, mediante una proyección ortogonal de rango 2 que preserva la norma, aplicada sobre los escritores del flujo residual en `blk.4..48` (tensores `ssm_out`, `attn_output`, `ffn_down_shexp`, `ffn_down_exps` y los 42 tensores `ffn_down_exps.bias` en F32), dejando intactos `blk.0..3` y `token_embd`. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el proceso de RLHF/DPO del modelo base.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" (`<think>`) activable o desactivable.
- Procesamiento de imagen y texto (`image-text-to-text`), según el pipeline declarado.
- Generación y análisis de código, incluyendo auditoría y análisis de binarios/exploits.
- Soporte de tool calling y function calling (etiqueta `endpoints_compatible`).
- Capacidades de agente y razonamiento multi-paso.
- Análisis de seguridad dual-use sin filtros de rechazo upstream (edición abliterated).
- Capacidades multilingües: no disponible.

## Casos de uso
- **Investigación de seguridad autorizada y red teaming**: el checkpoint reduce los rechazos en dominios dual-use del 43,75% al 12,50%, lo que permite analizar vectores de ataque, redactar PoCs y auditar configuraciones sin que el modelo se niegue, siempre dentro de un perímetro autorizado.
- **Análisis de binarios y explotación en CTF**: la combinación de razonamiento con `<think>` y generación de código permite descompilar, interpretar seudocódigo y construir exploits en competiciones, con `max_tokens >= 16384` para evitar truncamientos del razonamiento.
- **Auditoría de código en producción**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar pull requests, detectar patrones inseguros y proponer parches, usando `temperature = 0` solo para extracción corta de JSON/SQL.
- **Asistente de análisis legal y de políticas sin censura**: útil para revisar normativa, contratos o políticas internas en dominios donde los filtros upstream introducen negativas espurias, con la advertencia de verificar cada afirmación.
- **Inferencia en CPU con 32 GB de RAM**: el diseño residente (24,98 GiB en DDR5) más PLE paginada desde NVMe permite desplegar un modelo de ~176,5B nominales en estaciones de trabajo sin GPU, mediante llama.cpp y el `modchip` del autor.
- **Generación de documentación técnica y análisis de código legacy**: con contexto conversacional y modo thinking, adecuado para explicar bases de código extensas y generar documentación, ajustando `presence_penalty` y `repeat_penalty` para evitar repeticiones en la cola.
- **Prototipado de agentes multi-paso**: la capa NextN MTP y el soporte de function calling permiten orquestar tareas encadenadas (búsqueda, cálculo, edición de ficheros) en entornos controlados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas internas de la edición abliterated:

| Metrica | Aligned (base) | Abliterated |
|---|---|---|
| Rechazos en seguridad dual-use (held-out) | 43,75% (7/16) | 12,50% (2/16, -71,4%) |
| Rechazos en spot checks `<think>` | no disponible | 0/4 (0,0%) |
| ΔPPL respecto al base | — | +0,3189% |
| Blind-4 loop-free (temp=0) | no disponible | 2/4 |
| Blind-4 loop-free (sampling recomendado) | no disponible | 4/4 (100%) |
| Repeticiones en cola (3/16 prompts, temp=0) | no disponible | mitigado con sampling |

## Requisitos de hardware
- **RAM**: 32 GB mínimos (VmHWM medido de 28,40 GiB; RssAnon 2,43 GiB). El tronco de 24,98 GiB reside en DDR5 y la tabla PLE de 10,73 GiB se pagina desde NVMe vía `mmap`.
- **Almacenamiento**: NVMe recomendado para la paginación de la PLE; el repo ocupa 39,2 GB.
- **GPU**: no requerida; el modelo está diseñado para inferencia en CPU. No se documentan requisitos de VRAM.
- **Despliegue**: llama.cpp con el parche `llama-modchip` del autor; `install.sh --preset qwen38-32gb-ablit`; endpoints compatibles.
- **Sampling obligatorio**: `temperature = 0.6`, `top_p = 0.95`, `top_k = 20`, `presence_penalty = 0.2–1.0`, `repeat_penalty = 1.05`, y `max_tokens >= 16384` si `enable_thinking=True`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF | ~176,5B nominales / ~4,6-5,0B activos | no disponible | Apache 2.0 | GGUF 32 GB RAM, sin censura |
| Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF | ~176,5B nominales / ~4,6-5,0B activos | no disponible | Apache 2.0 | GGUF 32 GB RAM, alineado |
| Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF | ~176,5B nominales / ~4,6-5,0B activos | no disponible | Apache 2.0 | GGUF 64 GB RAM, alineado, 4/4 Blind-4 |
| Qwen/Qwen3.8-Flash-Next (base) | ~176,5B nominales / ~4,6-5,0B activos | no disponible | Apache 2.0 | Pesos originales |

## Limitaciones y advertencias
- **Contenido sin filtrar**: la edición abliterated reduce los rechazos al 12,50%; los filtros de seguridad upstream no deben usarse como moderación. No exponer endpoints sin control de acceso ni filtrado externo.
- **Repeticiones en decodificación greedy**: a 1,63 bpw, `temperature = 0` sin penalizaciones produce repeticiones en cola en 3/16 prompts; es obligatorio usar los parámetros de sampling recomendados.
- **Presupuesto de tokens**: con `enable_thinking=True` hay que fijar `max_tokens >= 16384`; con topes menores, desactivar el thinking.
- **Cuantización agresiva**: 1,63 bpw y retención espectral del 92,28% implican pérdida de calidad frente al modelo base; no apto para tareas que exijan máxima fidelidad.
- **Dependencia de NVMe**: el rendimiento depende de la latencia de paginación de la PLE; un disco lento degrada el throughput.
- **Sesgos**: no se documentan sesgos específicos; al derivar del base Qwen, hereda los del modelo original.
- **Riesgo de alucinación**: no cuantificado en la información disponible; la cuantización puede aumentarlo.
- **Idiomas**: no se especifican los idiomas soportados.
- **Contexto**: no se declara la longitud de contexto soportada.
- **Uso comercial**: permitido por Apache 2.0, pero la ausencia de filtros traslada al desplegador la responsabilidad legal del contenido generado.

## Enlaces
- Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante alineada 32 GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Variante alineada 64 GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
