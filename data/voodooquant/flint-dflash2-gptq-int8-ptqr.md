# voodooquant/Flint-DFlash2-GPTQ-INT8-PTQR

## Resumen

Flint-DFlash2-GPTQ-INT8-PTQR es una cuantización INT8 de `incoai/Flint-DFlash2`, el modelo borrador (draft) de decodificación especulativa basado en difusión por bloques de cinco capas que acompaña al modelo objetivo `RecursiveSI/flint`. Lo publica el usuario `voodooquant` y no es un modelo de lenguaje autónomo: su única función es proponer tokens candidatos que el modelo objetivo verifica, de modo que la distribución de salida final es la del objetivo y la decodificación especulativa no altera la calidad del texto generado.

La relevancia de esta ficha está en el método de cuantización, PTQR (post-training quantization with rounding-dither retraining), que entrena los pesos directamente bajo los kernels INT8 de servicio (rejilla de pesos de grupo 128, cuantización dinámica de activaciones por token, caché KV INT8) destilando contra un profesor BF16 congelado y aplicando dither geométricamente annealed sobre cada decisión de redondeo. El resultado es un checkpoint de 151 tensores y 518 MB (frente a 805 MB en BF16) que mantiene la aceptación de decodificación especulativa prácticamente intacta: 2,25 tokens aceptados frente a 2,27 del borrador BF16.

El modelo tiene 402.564.352 parámetros totales y está pensado para desplegarse junto al objetivo `voodooquant/Flint-GPTQ-INT8-PTQR` en un fork personalizado de vLLM (`curvedinf/int8-vllm`) sobre hardware AMD con ROCm. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión por bloques (block-diffusion drafter) de 5 capas, con selector de rango 256 y top-k 16, ventana deslizante de 2048 tokens |
| Parametros totales | 402.564.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como modelo autónomo; el servidor de ejemplo configura `--max-model-len 524288` para el objetivo, con ventana deslizante de 2048 tokens en el borrador |
| Tipos de cuantizacion | GPTQ INT8 W8A8, grupo 128 (GS128), simétrico, `desc_act=false`, sin `g_idx`; 35 matrices lineales de atención/MLP cuantizadas; superficies en BF16 (codebooks del selector, proyección context-KV del borrador y superficies conv/state) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint GPTQ con `qweight`/`qzeros`/`scales`) |

## Arquitectura y entrenamiento

El borrador es un modelo de difusión por bloques de cinco capas que consume estados ocultos auxiliares estilo EAGLE3 extraídos de las capas 6, 16, 27, 37 y 47 del modelo objetivo (índices 0-based 5, 15, 26, 36 y 46, según `dflash_config.target_layer_ids`). Propone tokens candidatos en bloques de tamaño 8, con un selector de rango 256 y top-k 16, y una ventana deslizante de 2048 tokens. El modelo objetivo verifica esos candidatos, por lo que la salida final conserva la distribución del objetivo.

El entrenamiento de cuantización PTQR parte de un profesor BF16 congelado y entrena un estudiante cuyo forward replica los kernels INT8 de servicio: rejilla de pesos de grupo 128, cuantización dinámica de activaciones por token y caché KV INT8. Sobre cada decisión de redondeo se aplica un dither con annealing geométrico, de forma que las fases tempranas exploran puntos vecinos de la rejilla y las finales son idénticas bit a bit al servicio. Los pesos reentrenados se recuantizan y exportan mediante el mismo wrapper GPTQ GS128, de modo que el checkpoint es idéntico en formato y configuración a una exportación GPTQ de un solo paso. La auditoría de dequantización reporta un error medio del 0,66 % en las lineales densas (0,70 % en el peor caso), 0,16 % en las superficies de rejilla BF16, y tensores no tocados byte-idénticos al borrador BF16. Las 35 matrices GPTQ empaquetadas se verificaron contra sus tensores de escala, con grupos contiguos de exactamente 128 pesos.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa; no genera texto de forma autónoma.
- Aceleración de inferencia del modelo objetivo `voodooquant/Flint-GPTQ-INT8-PTQR` mediante verificación de propuestas en bloque (block size 8).
- Integración con estados ocultos auxiliares EAGLE3 de cinco capas del objetivo.
- Soporte de caché KV INT8 con grupos de 128 (`int8_block_g128`) tanto en el borrador como en el objetivo.
- Compatibilidad con el fork `curvedinf/int8-vllm` y el backend AITER sobre ROCm (AMD).
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking propios: hereda las del modelo objetivo, que es quien produce la salida final.

## Casos de uso

- Aceleración de servicio de `RecursiveSI/flint` en producción: el borrador propone 7 tokens especulativos por paso (`num_speculative_tokens: 7`) que el objetivo verifica, reduciendo el coste por token generado sin alterar la distribución de salida.
- Despliegue en clústeres AMD con ROCm: el checkpoint está pensado para el stack `curvedinf/int8-vllm` con AITER W8A8 INT8 GEMM, atención unificada AITER y all-reduce personalizado de vLLM, con un contrato fijo TP4/C12.
- Reducción de huella de memoria en servidores multi-GPU: 518 MB de checkpoint frente a 805 MB en BF16 permiten liberar memoria para caché KV INT8 y aumentar el número de secuencias concurrentes.
- Investigación en cuantización post-entrenamiento: sirve como referencia reproducible de PTQR aplicado a un borrador de decodificación especulativa, con scripts de exportación y entrenamiento publicados (`ptqr_export_flint_draft.py`, `ptqr_train_draft_flint_ptqr.py`).
- Evaluación de decodificación especulativa con caché KV INT8: el par borrador/objetivo permite medir aceptación (2,25 frente a 2,27 en BF16) y TPOT (30,0 ms) bajo cuantización de caché.
- Benchmarking de latencia en inferencia de contexto largo: con `--max-model-len 524288` en el objetivo y ventana deslizante de 2048 en el borrador, se pueden estudiar compromisos entre longitud de contexto y tasa de aceptación.
- Validación de pipelines de cuantización GPTQ GS128: la auditoría de dequantización publicada (0,66 % medio, 0,70 % peor caso) sirve como control de calidad para exportaciones propias.

## Benchmarks y rendimiento

| Metrica | Borrador INT8 PTQR | Borrador BF16 |
|---|---|---|
| Aceptación de decodificación especulativa (TP4/C8, KV INT8, NS=7, random 32/128) | 2,25 | 2,27 |
| TPOT | 30,0 ms | 30,0 ms |
| Error de dequantización, lineales densas (medio) | 0,66 % | no aplica |
| Error de dequantización, lineales densas (peor caso) | 0,70 % | no aplica |
| Error de dequantización, superficies de rejilla BF16 | 0,16 % | no aplica |
| Tamano del checkpoint | 518 MB (151 tensores) | 805 MB |

No se han publicado resultados de benchmarks de calidad lingüística (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza del modelo: al ser un borrador verificado por el objetivo, su calidad de generación es la del objetivo.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 0,5 GB en INT8 (518 MB de checkpoint) más estados de activación y caché KV INT8 del propio borrador; el grueso de la memoria la consume el modelo objetivo.
- Configuración de referencia del autor: tensor parallelism 4 (TP4), `--max-num-seqs 12` (C12), caché KV `int8_block_g128`, `--dtype bfloat16` como dtype residual.
- GPU recomendadas: hardware AMD con soporte ROCm y AITER (el autor cita `VLLM_GFX908_*`, lo que apunta a MI210/gfx908); no se documentan GPUs NVIDIA para este stack concreto.
- No cabe en GPU de consumo como modelo útil por sí solo: es un borrador que requiere el objetivo `voodooquant/Flint-GPTQ-INT8-PTQR` y el fork `curvedinf/int8-vllm`.
- Opciones de despliegue: exclusivamente el fork `curvedinf/int8-vllm` con las variables de entorno documentadas (`VLLM_ROCM_USE_AITER`, `VLLM_ROCM_USE_AITER_UNIFIED_ATTENTION`, `VLLM_GFX908_INT8_LM_HEAD`, `VLLM_GFX908_ACT_QUANT=round`, `VLLM_GFX908_DECODE_BLOCKSCALE`, `VLLM_G8_INT8_DOT`, `VLLM_G8_INT8_PV`, `VLLM_UA_PREFILL_BLOCKM=128`, `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: TPOT de 30,0 ms en la configuración TP4/C8 con NS=7; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| voodooquant/Flint-DFlash2-GPTQ-INT8-PTQR | 402,6 M | Borrador block-diffusion (5 capas) | GPTQ INT8 W8A8 GS128 | Ventana deslizante 2048 | Apache 2.0 | Hugging Face, requiere fork de vLLM |
| incoai/Flint-DFlash2 | no disponible | Borrador block-diffusion (5 capas) | BF16 | Ventana deslizante 2048 | no disponible | Hugging Face |
| curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR | no disponible | Borrador block-diffusion para Qwen3.8-27B | GPTQ INT8 W8A8 GS128 | no disponible | no disponible | Hugging Face |
| RecursiveSI/flint | no disponible | Modelo objetivo | BF16 / INT8 PTQR | Hasta 524288 en el ejemplo de servicio | no disponible | Hugging Face |

La comparación relevante es con el borrador BF16 del que deriva: misma arquitectura y mismo contrato de servicio, con una pérdida de aceptación de 0,02 tokens (2,25 frente a 2,27) y una reducción de tamaño del 36 %. El borrador PTQR para Qwen3.8-27B es la referencia estructural que el autor declara replicar.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse para generación de texto, chat ni ninguna tarea directa; requiere el objetivo `voodooquant/Flint-GPTQ-INT8-PTQR` y el fork `curvedinf/int8-vllm`.
- Dependencia estricta de un contrato de servicio fijo (TP4/C12, AITER W8A8, atención unificada, all-reduce personalizado); no se garantiza funcionamiento fuera de esa configuración.
- Requiere hardware AMD con ROCm y las variables de entorno específicas del autor; no hay soporte documentado para NVIDIA, llama.cpp, Ollama o TGI.
- El campo `inference: false` en la model card indica que no está pensado para inferencia directa con `transformers`.
- Riesgo de alucinación y sesgos: no evaluables de forma independiente, ya que la salida final la produce el modelo objetivo y hereda sus sesgos y limitaciones.
- Idiomas soportados no documentados; la cobertura lingüística depende del objetivo.
- La licencia Apache 2.0 del checkpoint no exime de verificar las licencias del modelo base (`incoai/Flint-DFlash2`) y del objetivo (`RecursiveSI/flint`), cuyos términos no se detallan en la información disponible.
- El checkpoint se publicó el 12 de noviembre de 2026 con 0 descargas y 0 likes: no hay validación comunitaria independiente de las cifras reportadas por el autor.
- Las métricas de aceptación y TPOT provienen de una única configuración de prueba (TP4/C8, NS=7, random 32/128); el rendimiento puede variar con otras cargas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voodooquant/Flint-DFlash2-GPTQ-INT8-PTQR
- Modelo borrador base: https://huggingface.co/incoai/Flint-DFlash2
- Modelo objetivo: https://huggingface.co/RecursiveSI/flint
- Objetivo cuantizado PTQR: https://huggingface.co/voodooquant/Flint-GPTQ-INT8-PTQR
- Stack de servicio personalizado: https://github.com/curvedinf/int8-vllm
- Receta de despliegue: `docs/recipes/flint.md` dentro del repositorio anterior
- Borrador PTQR de referencia para Qwen3.8-27B: https://huggingface.co/curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR
- Script de exportación PTQR: `scripts/ptqr_export_flint_draft.py`
- Script de entrenamiento PTQR: `scripts/ptqr_train_draft_flint_ptqr.py`
