# Sunbert/DeepSeek-V4.1-Flash-1017-uncensored-rad

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored-rad es una conversión del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek, 763B parámetros, licencia MIT) a un único contenedor `.rad` para el motor de inferencia radiance, orientado a GPUs AMD RDNA4 con ROCm. La modificación principal es una "abliteración" aplicada a 18 de las 36 proyecciones de salida de atención (capas 11–28), que elimina la dirección de rechazo del modelo base sin alterar las proyecciones q/k/v, el MLP ni las tablas Engram.

El contenedor pesa 251,07 GiB repartidos en seis ficheros (límite de 50 GB por fichero en el Hub) y emplea una mezcla de cuantización por tensor derivada de la receta UD-IQ1_S de Unsloth: expertos enrutados en `iq1_s`/`iq2_xxs`, atención y expertos compartidos en `q6_K`/`q5_K`/`q8_0`, y la tabla Engram en `iq4_nl`. Incluye además el drafter DSpark `mtp.*` del release original con expertos en MXFP4 (6,72 GiB) para decodificación especulativa.

Es relevante para quienes despliegan modelos de gran tamaño en hardware AMD: el autor reporta mediciones en un laboratorio de 4×R9700 (32 GB, gfx1201) con 50,1 tok/s en generación de ensayo y 53,4 tok/s en código, y 4,7 s hasta el primer token con 16k de contexto. La licencia MIT se mantiene tanto para el modelo original como para las modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) y capas Engram; arquitectura DeepSeek-V4.1 con decodificación especulativa DSpark |
| Parametros totales | 763B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 409.600 tokens (configurado en `--max-model-len 409600`) |
| Tipos de cuantizacion | Mezcla por tensor: `iq1_s`, `iq2_xxs`, `q6_K`, `q5_K`, `q8_0`, `iq4_nl`, MXFP4 (fp4_e2m1 + escala e8m0), f32, bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright © DeepSeek; modificaciones bajo MIT) |
| Formato de pesos | Contenedor `.rad` (radiance), 32.701 tensores, 251,07 GiB en 6 partes |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos (MoE) de 763B parámetros con pesos en fp8 y expertos enrutados en fp4 según el release original. La arquitectura incluye capas Engram (2 capas con una tabla de 103 GiB) y un cabezal drafter DSpark `mtp.*` para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

La conversión a `.rad` aplica una receta de cuantización por tensor (`deepseek41-ud-iq1s.recipe`) con la imatrix UD-IQ1_S de Unsloth, fusionando `ffn_gate_exps`/`ffn_up_exps` mediante `data/imatrix_merge.py` porque radiance fusiona gate_up. La tabla Engram se reconstruye desde el tokenizador del release con `data/engram_tables.py`, ya que el release original no la incluye. La abliteración se aplica tras la conversión: para las capas 11–28, `attn_output_b` se reconstruye como `W + alpha * (W_huihui - W)` con alpha 0,75 y se recuantiza a `q6_K`. Las otras 18 capas permanecen intactas.

## Capacidades

- Generación de texto y razonamiento de propósito general (modelo base DeepSeek-V4.1-Flash).
- Generación de código, con mediciones específicas del autor en throughput de código (53,4 tok/s).
- Servidor compatible con la API de chat de OpenAI (`/v1/chat/completions`, `/v1/models`), con plantilla de chat embebida en el contenedor.
- Decodificación especulativa mediante el drafter DSpark y n-gramas (`--num-speculative-tokens 5 --spec-ngram 5`).
- Contexto largo: hasta 409.600 tokens configurados.
- Variante "uncensored": se elimina la dirección de rechazo en 18 proyecciones de salida de atención, lo que reduce las negativas del modelo a responder.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia en clúster AMD: el contenedor está diseñado para radiance con kernels TP4 sobre cuatro GPUs RDNA4 de 32 GB (R9700, gfx1201), lo que permite servir un modelo de 763B en hardware AMD sin depender de CUDA.
- Procesamiento de documentos largos: con 409.600 tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de código extensas en una sola pasada; el autor mide 4,7 s hasta el primer token con 16k de contexto.
- Generación de código en pipelines internos: el throughput de 53,4 tok/s en código y la API compatible con OpenAI permiten integrarlo en herramientas de autocompletado o revisión sin adaptadores propios.
- Investigación sobre seguridad y alineación: la variante abliterada permite estudiar el comportamiento del modelo sin la dirección de rechazo, comparando capas 11–28 modificadas frente a las 18 capas intactas.
- Evaluación de cuantizaciones extremas: la mezcla `iq1_s`/`iq2_xxs` en expertos enrutados con `q6_K` en atención sirve para medir la degradación de un modelo de 763B a ~2 bits por peso en los expertos.
- Servicio de chat multi-turno con contexto largo: el servidor OpenAI-compatible y la caché KV en bf16 permiten atender conversaciones con historial extenso en un solo nodo de cuatro GPUs.
- Pruebas de decodificación especulativa: el drafter DSpark y los n-gramas configurables permiten experimentar con aceleración de inferencia en hardware ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente métricas de inferencia en su laboratorio de 4×R9700:

| Metrica | Valor |
|---|---|
| Throughput generación de ensayo | 50,1 tok/s (greedy, n-gram 5) |
| Throughput generación de código | 53,4 tok/s (greedy, n-gram 5) |
| Tiempo hasta primer token (16k contexto) | 4,7 s |
| Reinicios de GPU | 0 |
| Configuración | `--max-model-len 409600`, TP4, 4×R9700 32 GB |

## Requisitos de hardware

- VRAM: cuatro GPUs de 32 GB (R9700 gfx1201) según la receta del autor; aproximadamente 4 GiB de pool de host fijado por rango.
- Almacenamiento: la tabla Engram ocupa 103 GiB y se lee desde el tier de disco (`--ngram-placement disk`); el autor recomienda NVMe.
- GPU recomendadas: AMD Radeon R9700 (RDNA4, gfx1201) en configuración de 4 tarjetas con TP4. No se mencionan GPUs NVIDIA ni CUDA.
- ¿Cabe en GPU consumer? Sí, en el sentido de cuatro GPUs consumer/workstation AMD de 32 GB; no cabe en una sola GPU consumer.
- Opciones de despliegue: exclusivamente el motor radiance (librería `radiance`, ROCm). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50,1 tok/s (ensayo) y 53,4 tok/s (código) en 4×R9700; 4,7 s hasta el primer token con 16k de contexto.
- Configuración de servicio: `--tp 4 --tp-wire exact --max-num-seqs 4 --max-num-batched-tokens 4096 --kv-cache-dtype bf16 --placement expert_tiered --host-pool-mib 4096 --ngram-placement disk --num-speculative-tokens 5 --spec-ngram 5 --expert-profile expert-stats.json --expert-pin-top 0.20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | 763B | no disponible | fp8 / fp4 | MIT | no disponible |
| DeepSeek-V4.1-Flash-1017-uncensored-rad | 763B | 409.600 | Mezcla GGML + MXFP4 en `.rad` | MIT | 4×AMD R9700 (ROCm) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo en 18 de 36 capas; esto puede aumentar respuestas dañinas o inapropiadas y reduce las salvaguardas del modelo base.
- La cuantización extrema de los expertos enrutados (`iq1_s`, ~2,07 bits/peso) implica una degradación de calidad respecto al modelo fp8 original; no se han publicado evaluaciones de esa pérdida.
- La tabla Engram se reconstruye desde el tokenizador, no se toma del release original (que no la incluye); su fidelidad respecto a la del modelo base no está verificada en la información disponible.
- Requiere hardware AMD RDNA4 y el motor radiance; no es desplegable en CUDA, vLLM, llama.cpp ni Ollama.
- El repositorio está dividido en seis partes que deben reensamblarse con `cat` antes de su uso; el sha256 del fichero final es `7444650de88519317b8d626559f2675e47b93969aa78502c281669534916315d`.
- Idiomas soportados no documentados; el comportamiento multilingüe del modelo base no se detalla.
- El autor no reporta sesgos específicos ni tasas de alucinación; al ser una modificación no oficial, no hay garantías de soporte.
- La licencia MIT permite uso comercial, pero el uso de una variante sin censura conlleva responsabilidad legal y ética sobre el contenido generado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Sunbert/DeepSeek-V4.1-Flash-1017-uncensored-rad
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
