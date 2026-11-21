# ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2

## Resumen

`qwen2.5-coder-7b-instruct-phi-lattice-v2` es una compilación cuantizada a 4 bits del modelo `Qwen/Qwen2.5-Coder-7B-Instruct` de Alibaba, publicada por el usuario `ununununununununununununununununununun`. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetación del checkpoint original de 7.620 millones de parámetros (28 capas transformer) mediante un esquema de cuantización propio denominado `phi-lattice v2`, que combina nibbles `uint8` de 4 bits con escalas de grupo en fp16 y un codebook embebido en el propio archivo.

El problema que aborda es el de reducir el espacio en disco y en memoria del modelo base sin degradar de forma apreciable la calidad. El archivo empaquetado ocupa 5.385,8 MiB frente a los 14,18 GiB de los shards BF16 originales, una reducción de 2,70x, manteniendo `lm_head`, `embed_tokens` y las capas de normalización en BF16. Las 196 capas lineales cuantizadas suman 6.525.288.448 pesos.

Su relevancia es fundamentalmente práctica: permite ejecutar un modelo de código de 7B en GPUs con menos VRAM mediante tres modos de carga (`low_vram_4bit`, `triton_4bit` con un kernel LUT-GEMM fusionado en Triton, y `unrolled_bf16`). La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), 28 capas |
| Parámetros totales | 7.620 millones (6.525.288.448 pesos en 196 capas lineales cuantizadas) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | 4 bits (nibbles `uint8` + escalas fp16 por grupo, codebook embebido); `lm_head`, `embed_tokens` y normas en BF16 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivo `.pt` empaquetado (`qwen25_coder_7b_phi_v2_packed_4bit.pt`, 5.385,8 MiB) + scripts `phi_loader.py` y `phi_lut_gemm.py`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen2.5-Coder-7B-Instruct`: un transformer decoder-only de 28 capas con `tie_word_embeddings` desactivado (por eso se almacenan tanto `embed_tokens` como `lm_head`). Este repositorio no entrena ni ajusta el modelo; aplica una cuantización post-entrenamiento de 4 bits sobre las 196 capas lineales, cada una con dimensión `K` múltiplo de 64 para permitir el kernel Triton. El archivo empaquetado contiene 255 de 255 tensores almacenados, con un `sha256` documentado (`0a7aec08...cd5819`, 5.647.392.174 bytes).

La innovación técnica es el esquema `phi-lattice v2`, que combina cuantización de 4 bits con un codebook de descompresión almacenado dentro del propio archivo y produce una esparsidad exacta del 13,59% en el archivo empaquetado (886.957.441 ceros exactos). El autor documenta dos métricas de calidad distintas: 19,28 dB de SQNR del archivo empaquetado frente a los tensores originales, y 18,64 dB en una comparación separada en memoria entre v1, v2 y un cuantizador uniforme. En esa comparación, v2 obtiene una perplejidad de 16,317 sobre cuatro textos cortos frente a 16,978 del cuantizador uniforme y 14,995 del BF16 de referencia, pese a tener peor SQNR que el uniforme (18,64 dB frente a 18,93 dB). El autor señala explícitamente que la mejora de v2 sobre v1 es marginal en este modelo (+0,006 dB) y que la ganancia depende de la arquitectura (en Gemma 3 270M la diferencia fue de +0,83 dB).

## Capacidades

- Generación de texto y código conversacional, heredadas del modelo base `Qwen2.5-Coder-7B-Instruct`.
- Razonamiento y resolución de problemas de programación (validado con HumanEval en modo instruct).
- Tres modos de carga: `low_vram_4bit` (descuantización en PyTorch dentro de cada capa lineal en cada token), `triton_4bit` (kernel LUT-GEMM fusionado en Triton sobre CUDA) y `unrolled_bf16` (desempaqueta los 255 tensores a BF16).
- Compatibilidad con `transformers` y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Script `run_text_evals.py` para evaluar MMLU, GSM8K, IFEval y HellaSwag una tarea a la vez.
- Soporte de tool calling, agentes, multilingüismo, visión o modo thinking: no disponible en la información proporcionada (depende de las capacidades del modelo base, no documentadas aquí).

## Casos de uso

- Despliegue de asistencia de código en GPUs de gama media: el modo `low_vram_4bit` mantiene residente un archivo de 5.385,8 MiB, lo que permite servir un modelo de código de 7B en hardware donde los 14,18 GiB en BF16 no caben.
- Evaluación comparativa de esquemas de cuantización: el repositorio incluye `run_text_evals.py` y el archivo `evals/humaneval_qwen25_coder.json`, lo que permite reproducir HumanEval pass@1 frente al modelo base y medir la degradación real del esquema.
- Integración en pipelines de generación de código con Triton: el modo `triton_4bit` usa un LUT-GEMM fusionado que evita descuantizar en cada token, adecuado para entornos CUDA con requisitos de latencia.
- Investigación sobre cuantización post-entrenamiento: la comparación documentada entre phi-lattice v1, v2 y cuantización uniforme (SQNR, esparsidad exacta y perplejidad) sirve como caso de estudio de que el SQNR por sí solo no predice la perplejidad.
- Prototipado en una sola GPU: el modo `unrolled_bf16` desempaqueta el archivo una vez y ejecuta generación idéntica al modelo base, útil para validar resultados antes de pasar a los modos de 4 bits.
- Reproducción de benchmarks de código: el script y el archivo de evaluación permiten verificar el pass@1 reportado (0,8537 en v2 frente a 0,8415 en el base) con la plantilla de chat activada y decodificación greedy.

## Benchmarks y rendimiento

HumanEval (`humaneval_instruct`, greedy, plantilla de chat activada, 164 tareas, pass@1):

| Modelo | Ejecución | pass@1 | stderr | Resueltas |
|---|---|---:|---:|---:|
| Base `Qwen/Qwen2.5-Coder-7B-Instruct` | NVIDIA L4, BF16 | 0,8415 | 0,0286 | 138 / 164 |
| phi-lattice v2 | NVIDIA A100, archivo desempaquetado a BF16 | 0,8537 | 0,0277 | 140 / 164 |

El autor advierte que la diferencia de 0,012 es menor que cualquiera de los dos errores estándar, por lo que ambas puntuaciones quedan dentro del mismo margen de error. La puntuación de v2 se obtuvo desde `unrolled_bf16`, no desde `low_vram_4bit`.

Comparación de esquemas de cuantización (SQNR de 4 bits, esparsidad exacta y perplejidad sobre cuatro textos cortos, en NVIDIA L4):

| Método | SQNR 4 bits | Esparsidad exacta 4 bits | Perplejidad (4 textos) |
|---|---:|---:|---:|
| BF16 de referencia | Referencia | 0,00% | 14,995 |
| Uniforme | 18,93 dB | 0,00% | 16,978 |
| phi-lattice v1 | 18,63 dB | 8,54% (557.537.535) | 16,437 |
| phi-lattice v2 | 18,64 dB | 8,54% (557.403.128) | 16,317 |

El autor indica que la perplejidad es una comprobación de sanidad sobre cuatro textos cortos y no un benchmark. No se han publicado resultados de MMLU, GSM8K, IFEval ni HellaSwag en la información disponible, aunque el script para obtenerlos está incluido.

## Requisitos de hardware

- VRAM estimada: el archivo empaquetado requiere 5.385,8 MiB residentes en los modos `low_vram_4bit` y `triton_4bit`; el modo `unrolled_bf16` requiere el equivalente a los 14,18 GiB del modelo en BF16 más el archivo empaquetado durante la carga.
- GPU utilizadas en las mediciones documentadas: NVIDIA L4 (BF16 y comparación de cuantizadores) y NVIDIA A100 (HumanEval de v2).
- GPU recomendadas: no se especifican más allá de L4 y A100; el modo `triton_4bit` requiere CUDA.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; el tamaño residente de 5.385,8 MiB sugiere que podría caber en GPUs con 8 GB o más, pero no se confirma.
- Opciones de despliegue: `transformers` con los scripts `phi_loader.py` (modos `low_vram_4bit`, `triton_4bit`, `unrolled_bf16`) y `phi_lut_gemm.py` (kernel Triton). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en GGUF.
- Latencia y throughput: no disponibles; solo se documenta que `low_vram_4bit` descuantiza en cada token y que `triton_4bit` usa un LUT-GEMM fusionado, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `qwen2.5-coder-7b-instruct-phi-lattice-v2` | 7,62B | No disponible | `.pt` empaquetado 4 bits | Apache 2.0 | 5.385,8 MiB residentes; HumanEval pass@1 0,8537 (desempaquetado a BF16) |
| `Qwen/Qwen2.5-Coder-7B-Instruct` (base) | 7,62B | No disponible | Safetensors BF16 | Apache 2.0 | 14,18 GiB; HumanEval pass@1 0,8415 |
| Cuantizador uniforme de 4 bits (referencia interna) | 7,62B | No disponible | No disponible | No aplica | SQNR 18,93 dB, perplejidad 16,978 en la comparación del autor |
| phi-lattice v1 (referencia interna) | 7,62B | No disponible | No disponible | No aplica | SQNR 18,63 dB, perplejidad 16,437 |

No se dispone de datos para comparar con otras alternativas de la misma categoría (por ejemplo, otras cuantizaciones de 4 bits del mismo modelo base) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un entrenamiento nuevo: cualquier sesgo, alucinación o limitación del `Qwen2.5-Coder-7B-Instruct` original se hereda sin cambios.
- El autor reconoce que la ventaja de phi-lattice v2 sobre v1 es marginal en este modelo (+0,006 dB de SQNR) y que la mejora depende de la arquitectura; no debe asumirse una ganancia general.
- El SQNR no predice la perplejidad: el cuantizador uniforme tiene mejor SQNR (18,93 dB) pero peor perplejidad (16,978) que v2 (16,317).
- La perplejidad reportada se calcula sobre cuatro textos cortos y el propio autor la califica de comprobación de sanidad, no de benchmark.
- La diferencia en HumanEval (0,8537 frente a 0,8415) está dentro del margen de error de ambas mediciones.
- El modo `low_vram_4bit` descuantiza en cada token, lo que puede penalizar la latencia; el autor no lo usó para la medición de HumanEval.
- El repositorio no distribuye pesos en safetensors ni GGUF, solo un archivo `.pt` propietario con scripts de carga, lo que limita la compatibilidad con ecosistemas de despliegue estándar.
- El nombre del autor (`ununununununununununununununununununun`) y la ausencia de likes o documentación adicional sobre el mantenedor no permiten verificar la reputación del publicador.
- No se documentan idiomas soportados ni longitud de contexto en este repositorio; deben consultarse en la model card del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el esquema de cuantización y los scripts adjuntos no introduzcan restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Archivo de evaluación HumanEval: https://huggingface.co/ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2/blob/main/evals/humaneval_qwen25_coder.json
- Script de carga: https://huggingface.co/ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2/blob/main/phi_loader.py
- Kernel Triton LUT-GEMM: https://huggingface.co/ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2/blob/main/phi_lut_gemm.py
- Script de evaluaciones: https://huggingface.co/ununununununununununununununununununun/qwen2.5-coder-7b-instruct-phi-lattice-v2/blob/main/run_text_evals.py
