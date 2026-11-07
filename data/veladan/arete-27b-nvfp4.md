# veladan/Arete-27B-NVFP4

## Resumen

Arete-27B-NVFP4 es una cuantización post-entrenamiento de precisión mixta NVFP4 + FP8 del modelo NousResearch/Arete-27B, publicada por el usuario veladan. El modelo base Arete-27B es, a su vez, un post-entrenamiento de Qwen3.8-27B (Alibaba) orientado a reforzar valores occidentales, según la documentación de Nous Research. Esta versión cuantizada no añade ningún entrenamiento adicional: se limita a comprimir los pesos del modelo original con NVIDIA Model Optimizer (ModelOpt 0.48) siguiendo la receta que NVIDIA publicó para `nvidia/Qwen3.8-27B-NVFP4`, de la misma familia arquitectónica (`Qwen3_5ForConditionalGeneration`).

La arquitectura subyacente es un transformer híbrido con 64 capas de texto (16 de atención completa y 48 con atención lineal GDN) más una torre de visión de 27 bloques, con un vocabulario de 248.320 tokens. Aunque la nomenclatura comercial del modelo base indica "27B", el recuento real de parámetros en los safetensors es de 18.164.649.200 (aproximadamente 18,2 mil millones). El checkpoint cuantizado ocupa unos 20 GiB repartidos en 3 shards.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible con precisión mixta (MLP y `lm_head` en NVFP4, proyecciones de atención en FP8, resto en BF16); por otro, advierte de una restricción de hardware severa, ya que la mitad NVFP4 exige GPUs Blackwell (SM ≥ 100) y no es compatible con Transformers para checkpoints pre-cuantizados de ModelOpt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `Qwen3_5ForConditionalGeneration`: 64 capas de texto (16 de atención completa + 48 de atención lineal GDN) y torre de visión de 27 bloques |
| Parametros totales | 18.164.649.200 (según safetensors); el nombre comercial del modelo base indica 27B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de despliegue de vLLM usa `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4 (E2M1, bloque 16, escalas de bloque estáticas, escalas de bloque FP8 E4M3) para MLP y `lm_head`; FP8 E4M3 per-tensor W8A8 para proyecciones de atención; BF16 para embeddings, torre de visión, `conv1d`, `in_proj_a/b`, `A_log`, `dt_bias` y normas. Total: 401 módulos cuantizados (193 NVFP4 + 208 FP8) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors + `hf_quant_config.json` + `.quant_summary.txt`; ~20 GiB en 3 shards |
| Vocabulario | 248.320 tokens |
| Calibración | 2.048 secuencias × 2.048 tokens; algoritmo Local-Hessian con barrido de escalas FP8 |
| Runtime soportado | vLLM ≥ 0.29 (detecta `modelopt_mixed`), TensorRT-LLM; Transformers no soportado para pre-cuantizados NVFP4/FP8 de ModelOpt |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Qwen3.5: combina 16 capas de atención completa con 48 capas de atención lineal basada en Gated DeltaNet (GDN), lo que reduce el coste computacional en contextos largos. Incluye además una torre de visión de 27 bloques, por lo que el pipeline declarado es `image-text-to-text` aunque la model card se centre en generación de texto. El vocabulario es de 248.320 tokens.

Esta versión concreta no incorpora entrenamiento ni post-entrenamiento adicional: es exclusivamente una cuantización del checkpoint `NousResearch/Arete-27B`. La receta aplicada es `MIXED_PRECISION` con el preset `nvidia-mixed` de ModelOpt: NVFP4 con `NVFP4_W4A4_WEIGHT_LOCAL_HESSIAN_CFG` (pesos E2M1, bloque 16, escalas de bloque estáticas, activaciones FP4 con escalado dinámico por bloque) para las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj` en las 64 capas) y para `lm_head`; y FP8 E4M3 per-tensor W8A8 para las proyecciones de autoatención (`q/k/v/o_proj` en las 16 capas de atención completa) y de atención lineal (`in_proj_qkv`, `in_proj_z`, `out_proj` en las 48 capas GDN). Embeddings, torre de visión, `conv1d`, `in_proj_a/b`, `A_log`, `dt_bias` y normas permanecen en BF16.

La calibración se desvía de la receta original de NVIDIA: esta usaba el dataset Nemotron Post-Training v2 (con acceso restringido), mientras que aquí se empleó una mezcla abierta compuesta por `HuggingFaceTB/smoltalk` (50 %, chat general), `nvidia/OpenCodeInstruct` (20 %, código) y `AI-MO/NuminaMath-CoT` (30 %, matemáticas y razonamiento). La receta de formatos, tamaños de bloque y algoritmos es idéntica a la de NVIDIA; solo cambia el corpus de calibración. El proceso se ejecutó en una NVIDIA RTX PRO 6000 Blackwell Max-Q (96 GB) con CUDA 13.2, `nvidia-modelopt==0.48.0`, `torch==2.15.0+cu132`, `transformers==5.22.2` y `flash-linear-attention==0.6.0`, con un coste medido de 55 minutos de cuantización y 2 minutos de exportación.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del post-entrenamiento de Arete-27B sobre Qwen3.8-27B.
- Procesamiento de imagen y texto (`image-text-to-text`), ya que la torre de visión se conserva en BF16.
- Razonamiento matemático y de sentido común, reforzado por la inclusión de `NuminaMath-CoT` en el corpus de calibración.
- Generación de código, con calibración específica sobre `OpenCodeInstruct`.
- Soporte multilingüe limitado: el modelo declara únicamente inglés.
- Alineación de valores: el modelo base está post-entrenado para reforzar valores occidentales, según Nous Research.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Despliegue de inferencia de alta eficiencia en GPUs Blackwell: el checkpoint reduce el peso a ~20 GiB, lo que permite servirlo en una sola RTX PRO 6000 Blackwell o en GPUs de la misma generación con vLLM (`vllm serve veladan/Arete-27B-NVFP4 --tensor-parallel-size 1 --max-model-len 32768`), liberando VRAM frente al modelo en BF16.
- Servicio de chat multi-turno en inglés: el modelo conserva la ventana de contexto del base (el ejemplo de despliegue configura 32.768 tokens) y el pipeline conversacional, adecuado para asistentes con historial largo.
- Procesamiento de documentos con imagen: al mantener la torre de visión en BF16, puede recibir pares imagen-texto para tareas de descripción, extracción o respuesta sobre capturas y documentos escaneados.
- Generación de código asistida: la calibración con un 20 % de `OpenCodeInstruct` busca preservar la calidad en tareas de programación, por lo que encaja en asistentes de IDE o pipelines de revisión de código.
- Razonamiento matemático paso a paso: la calibración con `NuminaMath-CoT` (30 %) está orientada a mantener el rendimiento en problemas aritméticos y de razonamiento encadenado.
- Evaluación comparativa de cuantización: el checkpoint incluye scripts de verificación (`compare_recipe.py`, `validate_quant.py`) y comparación cuantizador a cuantizador contra la referencia de NVIDIA, lo que lo hace útil como caso de estudio reproducible de recetas NVFP4/FP8.
- Investigación sobre alineación de valores: al derivar de Arete-27B, permite estudiar cómo se preservan los sesgos de alineación tras una cuantización agresiva de 4 bits en MLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas del proceso de cuantización: comparación de 1.699 cuantizadores contra el checkpoint de referencia `nvidia/Qwen3.8-27B-NVFP4` con 0 diferencias, y comparación de disposición de tensores para 14 categorías de módulos con `dtype` y `shape` idénticos. No se aportan cifras de MMLU, HumanEval, GSM8K ni de perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: ~20 GiB de pesos en el checkpoint; con caché KV y overhead de runtime, se recomienda al menos 24-32 GiB para contextos moderados y más para los 32.768 tokens del ejemplo.
- GPU obligatoria para la mitad NVFP4: clase Blackwell (SM ≥ 100). El build se realizó en una NVIDIA RTX PRO 6000 Blackwell Max-Q de 96 GB.
- GPUs no soportadas: arquitecturas anteriores a Blackwell no pueden ejecutar los kernels NVFP4; el checkpoint no es utilizable en A100, H100 ni RTX 4090 para la parte FP4.
- Opciones de despliegue: vLLM ≥ 0.29 (detecta `modelopt_mixed` automáticamente desde `hf_quant_config.json`) y TensorRT-LLM (`trtllm-serve ... --max_batch_size 8`).
- Transformers no es compatible con checkpoints pre-cuantizados NVFP4/FP8 de ModelOpt (la versión 5.x solo implementa cuantización al vuelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veladan/Arete-27B-NVFP4 | 18,16 B (recuento real) | No disponible (ejemplo a 32.768) | NVFP4 + FP8 mixta | Apache 2.0 | Hugging Face, requiere Blackwell |
| NousResearch/Arete-27B | No disponible | No disponible | BF16 (base) | No disponible en la información | Hugging Face |
| nvidia/Qwen3.8-27B-NVFP4 | No disponible | No disponible | NVFP4 + FP8 mixta (referencia de la receta) | No disponible en la información | Hugging Face |
| SargeDev/Arete-27B-Uncensored-NVFP4-FP8 | No disponible | No disponible | NVFP4 + FP8, `compressed-tensors`, variante abliterated | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo linaje; no se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Restricción de hardware crítica: la mitad NVFP4 solo funciona en GPUs Blackwell (SM ≥ 100); el modelo es inutilizable en la mayoría del parque instalado actual.
- Incompatibilidad con Transformers para el checkpoint pre-cuantizado; obliga a usar vLLM ≥ 0.29 o TensorRT-LLM.
- Solo inglés declarado: no hay soporte multilingüe documentado, a pesar de que el modelo base deriva de Qwen3.8-27B.
- Calibración distinta de la referencia de NVIDIA: al no poder usar el dataset Nemotron (restringido), la mezcla smoltalk/OpenCodeInstruct/NuminaMath-CoT puede degradar el rendimiento en dominios no representados (por ejemplo, lenguas distintas del inglés o texto jurídico).
- Riesgo de alucinación inherente al modelo base; la cuantización de 4 bits en MLP y `lm_head` puede ampliar la degradación en tareas de razonamiento largo no verificadas con benchmarks.
- Sesgos de alineación: el modelo base está post-entrenado explícitamente para reforzar valores occidentales, lo que introduce un sesgo direccional documentado por Nous Research.
- Sin métricas de calidad publicadas: no hay evaluación de perplejidad ni de benchmarks que cuantifique la pérdida frente al BF16.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- El nombre "27B" no coincide con los 18,16 B reales de parámetros, lo que puede inducir a error al dimensionar hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/veladan/Arete-27B-NVFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Anuncio de Arete-27B en Nous Research: https://nousresearch.com/arete
- Checkpoint de referencia de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Variante abliterated relacionada: https://huggingface.co/SargeDev/Arete-27B-Uncensored-NVFP4-FP8
