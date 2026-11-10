# ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2

## Resumen

`qwen2.5-coder-7b-instruct-phi-lattice-v2` es una compilación cuantizada a 4 bits del modelo `Qwen/Qwen2.5-Coder-7B-Instruct` de Alibaba, publicada por el usuario `ununununununununununununununununununun`. No es un modelo nuevo entrenado desde cero, sino un artefacto de compresión que aplica una técnica propietaria denominada `phi-lattice v2` sobre los pesos originales en BF16, reduciendo el tamaño en disco de 14,18 GiB a 5.385,8 MiB (factor 2,70x) manteniendo las tablas de tokens (`lm_head` y `embed_tokens`) y las capas de normalización en BF16.

El modelo base es un transformer decoder-only de 7,62 mil millones de parámetros con 28 capas, orientado a generación de código y conversación. La aportación de esta versión es el esquema de cuantización: en lugar de cuantización uniforme, emplea un codebook en forma de retícula phi con escalas de grupo en fp16 y una "espiral 3D" añadida en la v2, empaquetando los nibbles en `uint8` reales (4 bits por peso) más escalas por grupo de 64 elementos.

Es relevante para quienes necesitan ejecutar un modelo de código de 7B en GPUs con VRAM limitada (por ejemplo, una NVIDIA L4 o una RTX 4090) sin renunciar al soporte de tool calling y contexto largo del modelo original. El repositorio incluye un cargador (`phi_loader.py`) y un kernel Triton fusionado de LUT-GEMM (`phi_lut_gemm.py`) para inferencia eficiente. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 28 capas |
| Parametros totales | 7,62 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | 4 bits (nibbles `uint8` + escalas fp16 por grupo de 64); `lm_head`, `embed_tokens` y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` empaquetado (`qwen25_coder_7b_phi_v2_packed_4bit.pt`, 5.385,8 MiB) + scripts Python de carga; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen2 con 28 capas y 7,62 mil millones de parámetros totales. Esta publicación no entrena ni afina el modelo: parte de los pesos BF16 de `Qwen/Qwen2.5-Coder-7B-Instruct` y los somete a una cuantización post-entrenamiento. Los 196 pesos lineales (6.525.288.448 parámetros lineales) se almacenan como nibbles de 4 bits reales (`uint8`), con escalas de grupo en fp16 de tamaño 64; cada capa cuantizada cumple `K % 64 == 0`. Las tablas de tokens (`lm_head` y `embed_tokens`, con `tie_word_embeddings` a `false`, por lo que ambas se almacenan) y las capas de normalización permanecen en BF16.

La innovación técnica es el esquema `phi-lattice v2`: un codebook de cuantización con estructura de retícula phi y una espiral 3D que sustituye al codebook plano de la v1. Según la model card, sobre los pesos originales y en una pasada con una NVIDIA L4, la v2 alcanza 18,64 dB de SQNR a 4 bits (frente a 18,93 dB de la cuantización uniforme y 18,63 dB de la v1), con un 8,54% de ceros exactos y una perplejidad de 16,317 frente a 14,995 del BF16 de referencia. El archivo empaquetado presenta un SQNR de 19,28 dB respecto a los tensores originales y un 13,59% de ceros exactos (886.957.441 índices). El repositorio incluye un kernel Triton fusionado de LUT-GEMM para la descompresión en GPU y un modo `unrolled_bf16` que descomprime los 255 tensores a BF16. No se documentan datos de entrenamiento, RLHF ni DPO adicionales, ya que no se realiza entrenamiento.

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo base Qwen2.5-Coder-7B-Instruct, especializado en generación y razonamiento sobre código.
- Conversación multi-turno: el modelo base es una variante instruct, por lo que soporta diálogo con formato de chat.
- Razonamiento y matemáticas: capacidades heredadas del modelo base; no se documentan evaluaciones específicas en esta publicación.
- Tool calling / function calling: presumiblemente soportado por herencia del modelo base, aunque no se detalla en la model card de esta versión.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en esta publicación.
- Multilingüismo: no disponible; no se especifican idiomas.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Asistente de código en entornos con VRAM limitada: el archivo empaquetado ocupa 5.385,8 MiB residentes, lo que permite cargar un modelo de código de 7,62B en GPUs de 8-12 GB, útil para estaciones de trabajo con una sola GPU consumer.
- Autocompletado y generación de código en IDE: el modelo base está orientado a código y la versión cuantizada reduce el coste de memoria, lo que facilita su integración en servidores de inferencia modestos.
- Servicio de chat para desarrolladores: al ser una variante instruct, puede gestionar conversaciones multi-turno sobre APIs, depuración y explicación de fragmentos de código.
- Despliegue en clústeres con NVIDIA L4: la model card valida el esquema de cuantización en una L4, por lo que es adecuado para entornos cloud con GPUs de 24 GB donde se quiera maximizar la densidad de instancias.
- Evaluación de técnicas de cuantización: el repositorio incluye `run_text_evals.py` con MMLU, GSM8K, IFEval y HellaSwag, lo que lo convierte en un banco de pruebas para comparar `phi-lattice v2` frente a cuantización uniforme.
- Investigación en kernels de descompresión: el kernel Triton `phi_lut_gemm.py` sirve como referencia para implementar LUT-GEMM de 4 bits en pipelines propios.
- Prototipado de asistentes de código en local: con el modo `low_vram_4bit` o `triton_4bit` se puede ejecutar en una única GPU sin necesidad de sharding.

## Benchmarks y rendimiento

La model card no publica resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar del modelo empaquetado. Solo se documentan métricas de cuantización y perplejidad sobre los pesos originales:

| Metodo | SQNR 4 bits | Esparcidad exacta | Perplejidad |
|---|---:|---:|---:|
| Baseline BF16 | Referencia | 0,00% | 14,995 |
| Uniforme | 18,93 dB | 0,00% | 16,978 |
| phi-lattice v1 | 18,63 dB | 8,54% | 16,437 |
| phi-lattice v2 | 18,64 dB | 8,54% | 16,317 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El repositorio incluye `run_text_evals.py` para ejecutarlos, pero no se aportan cifras.

## Requisitos de hardware

- VRAM estimada: el archivo empaquetado requiere 5.385,8 MiB residentes en los modos `low_vram_4bit` y `triton_4bit`; los pesos lineales cuantizados suman 3.306,0 MiB y las tablas de tokens y normas en BF16 suman 2.079,8 MiB. El modo `unrolled_bf16` descomprime a BF16 y requiere aproximadamente 14,18 GiB, similar al modelo original.
- GPU recomendadas: NVIDIA L4 (validada en la model card), A100, H100 para mayor throughput; RTX 4090 y GPUs consumer de 8-12 GB para los modos de 4 bits.
- Cabe en GPU consumer: sí, en los modos de 4 bits cabe en GPUs de 8 GB o más, siempre que se reserve memoria para el contexto y el runtime.
- Opciones de despliegue: el repositorio proporciona `phi_loader.py` (PyTorch) y `phi_lut_gemm.py` (kernel Triton). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato `.pt` empaquetado es específico de este cargador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| qwen2.5-coder-7b-instruct-phi-lattice-v2 | 7,62B | no disponible | 4 bits phi-lattice v2 | Apache 2.0 | `.pt` empaquetado + scripts |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,62B | no disponible | BF16 original | Apache 2.0 | safetensors |
| Variantes GGUF de Qwen2.5-Coder-7B | 7,62B | no disponible | 4-8 bits (Q4_K_M, etc.) | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La diferencia principal frente al modelo base es el tamaño en disco (2,70x menor) y la necesidad de usar el cargador propietario; frente a las variantes GGUF, la ventaja es el soporte de kernel Triton fusionado, pero la desventaja es la falta de compatibilidad con el ecosistema llama.cpp/Ollama.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: la perplejidad sube de 14,995 (BF16) a 16,317 con phi-lattice v2, un incremento de aproximadamente el 8,8%, lo que puede degradar tareas sensibles a la precisión.
- SQNR limitado: 19,28 dB en el archivo empaquetado es una métrica moderada; en comparación, la cuantización uniforme obtiene 18,93 dB, por lo que la mejora frente a esquemas estándar es marginal en SQNR, aunque la v2 mejora la perplejidad.
- Dependencia de código propietario: la carga requiere `phi_loader.py` y, para el modo Triton, `phi_lut_gemm.py`; no es compatible con pipelines estándar de transformers sin adaptación.
- Formato no estándar: no se distribuyen safetensors ni GGUF, lo que limita la integración con vLLM, TGI, llama.cpp u Ollama.
- Idiomas no especificados: no se documenta el soporte multilingüe de esta compilación; se hereda del modelo base, pero no se verifica.
- Riesgo de alucinación: inherente al modelo base; la cuantización puede amplificarlo en tareas de razonamiento largo.
- Sesgos: no documentados en esta publicación; se heredan los del modelo base Qwen2.5-Coder.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la compilación no ofrece garantías sobre la calidad del artefacto cuantizado.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso en producción.
- Fecha de creación futura (2026-11-10): metadato anómalo que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
