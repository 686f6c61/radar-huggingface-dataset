# williamliao/Qwen3.8-Mixed-NVFP4-FP8-GGUF

## Resumen

`williamliao/Qwen3.8-Mixed-NVFP4-FP8-GGUF` es una conversión comunitaria a formato GGUF del modelo Darkstar Qwen3.8 27B, una cuantización W4A16 NVFP4 mixta con FP8 E4M3 elaborada con NVIDIA ModelOpt sobre el modelo base Qwen/Qwen3.8-27B. El autor de esta ficha, williamliao, no entrena ni afina el modelo: se limita a empaquetar los pesos ya cuantizados en contenedores GGUF listos para `llama.cpp`, preservando los tensores NVFP4 originales y ofreciendo dos variantes según cómo se almacenen los 208 tensores FP8 E4M3 de partida (como Q8_0 o como F8_E4M3 nativo).

El interés de esta publicación es práctico: permite ejecutar un modelo de 27.320.698.465 parámetros en hardware de consumo (el autor lo prueba con una RTX 5070 Ti de 16 GB más una RTX 5060 Ti de 16 GB, repartiendo capas) manteniendo los pesos NVFP4 de 4 bits del MLP y del `lm_head`, mientras la atención y las proyecciones GatedDeltaNet permanecen en FP8. El repositorio ocupa 63,5 GB, pero cada fichero GGUF individual pesa entre 21 y 21,5 GB.

La relevancia actual viene de dos frentes: por un lado, demuestra que el pipeline de cuantización NVFP4 de NVIDIA es convertible a GGUF sin perder el esquema mixto; por otro, documenta con detalle una limitación real del backend CUDA de `llama.cpp` (a fecha 2026-11-06) que impide multiplicar matrices en F8_E4M3 y degrada la inferencia a CPU si no se usa una rama experimental. La licencia declarada es Apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención y proyecciones GatedDeltaNet (según descripción del modelo fuente); cuantización mixta NVFP4 + FP8 E4M3 |
| Parametros totales | 27.320.698.465 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el benchmark usa `--ctx-size 8192`) |
| Tipos de cuantizacion | NVFP4 (W4A16) en proyecciones MLP y `lm_head`; FP8 E4M3 en atención y GatedDeltaNet; componentes protegidos en BF16; variantes GGUF con FP8 nativo o convertido a Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`llama.cpp`); ficheros `Qwen3.8-Mixed-NVFP4-Q8.gguf` (21,5 GB), `Qwen3.8-Mixed-NVFP4-FP8.gguf` (21 GB) y `Qwen3.8-Abliterated-Mixed-NVFP4-FP8` (21 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del Qwen3.8-27B, que combina capas de autoatención con proyecciones GatedDeltaNet según describe el autor del modelo fuente. Sobre esa base, la cuantización aplicada con NVIDIA ModelOpt W4A16 NVFP4 actúa sobre las proyecciones MLP del bloque de lenguaje y sobre el `lm_head`, mientras que las proyecciones de autoatención y de GatedDeltaNet se mantienen en FP8 E4M3. Los componentes sensibles (embeddings, normalizaciones y otros tensores auxiliares) permanecen en BF16. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de `llama.cpp`, usando `--fp8-as-q8` para la variante Q8_0.

La composición de tensores resultante, medida por el autor sobre los GGUF, es de 193 tensores NVFP4, 208 tensores F8_E4M3 (o 208 Q8_0 en la variante alternativa) y 105 tensores BF16, con 969 tensores F32 en la variante FP8 y 553 en la Q8_0. La diferencia de 416 tensores F32 se atribuye a tensores auxiliares FP8 eliminados o plegados durante la conversión, aunque el autor no verifica su identidad exacta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo upstream.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas de forma independiente en esta conversión.
- Generación de código: presumiblemente presente por el linaje Qwen, sin benchmarks publicados en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Inferencia local en `llama.cpp` con soporte de decodificación especulativa opcional (no usada en los benchmarks del autor).

## Casos de uso

- Despliegue local en estaciones de trabajo con dos GPU de consumo: el autor ejecuta el modelo repartiendo capas entre una RTX 5070 Ti de 16 GB y una RTX 5060 Ti de 16 GB, lo que lo hace adecuado para prototipado y experimentación sin acceso a clústeres.
- Asistentes conversacionales autoalojados: al ser un GGUF compatible con `llama.cpp` y con endpoints compatibles, puede servirse detrás de una API tipo OpenAI para chat multi-turno en entornos con requisitos de privacidad.
- Evaluación de cuantizaciones NVFP4 en producción: útil para equipos que quieran medir el impacto real de W4A16 + FP8 frente a Q8_0 en latencia de prefill y decode antes de adoptar el formato.
- Procesamiento por lotes de texto con prompts largos: el prefill alcanza 2.057 tok/s a 16.384 tokens en la variante FP8, lo que permite clasificación, resumen o extracción sobre documentos extensos en hardware modesto.
- Investigación sobre backends CUDA en `llama.cpp`: el repositorio documenta el comportamiento del backend ante F8_E4M3 y sirve como caso de prueba para la rama `osimons/ocp_fp8_cuda` y el PR #27512.
- Generación de código asistida en local: si el modelo base conserva las capacidades de código de la familia Qwen, puede integrarse en editores o pipelines de CI/CD mediante el servidor de `llama.cpp`, aunque no hay benchmarks que lo confirmen en esta ficha.
- Fine-tuning o destilación posteriores: al estar bajo Apache-2.0 y en formato GGUF, puede servir como referencia de calidad para comparar contra adaptaciones propias, aunque el formato GGUF no es el ideal para reentrenar.

## Benchmarks y rendimiento

El autor publica benchmarks locales de prefill y decode. El entorno es Windows, dos GPU (RTX 5070 Ti 16 GB + RTX 5060 Ti 16 GB) con reparto de capas, `llama.cpp` en la rama `osimons/ocp_fp8_cuda` (commit `50e9cc801`) y sin decodificación especulativa. No son resultados comparables con benchmarks académicos tipo MMLU o HumanEval; son medidas de rendimiento de inferencia.

Prefill (`llama-bench`, `-n 0 -r 5 -ngl 99 -b 2048 -ub 256 -fa on -sm layer -ts 14/12`):

| Tokens de prompt | NVFP4 + FP8 (tok/s) | NVFP4 + Q8_0 (tok/s) | FP8 vs Q8_0 |
|---:|---:|---:|---:|
| 128 | 1.272,07 | 944,04 | +34,7% |
| 512 | 1.643,21 | 1.312,60 | +25,2% |
| 1.024 | 1.919,58 | 1.658,15 | +15,8% |
| 2.048 | 2.060,86 | 1.918,64 | +7,4% |
| 4.096 | 2.119,91 | 2.034,99 | +4,2% |
| 8.192 | 2.122,25 | 2.052,06 | +3,4% |
| 16.384 | 2.057,87 | 1.992,81 | +3,3% |

Decode (`mtp-bench-v9.py --repeat 3 --discard-first 2 --warmup`, 17 prompts, `-np 1 --ctx-size 8192 -ngl -1 --flash-attn on`):

| Métrica | NVFP4 + FP8 | NVFP4 + Q8_0 | FP8 vs Q8_0 |
|---|---:|---:|---:|
| Decode, media | 25,89 tok/s | 27,17 tok/s | −4,7% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: cada fichero GGUF pesa entre 21 y 21,5 GB, por lo que se necesita al menos ~22 GB de VRAM para mantener todos los pesos en GPU; con 32 GB repartidos en dos GPU el autor logra `offloaded 66/66 layers`.
- GPU recomendadas: el autor valida RTX 5070 Ti (16 GB) + RTX 5060 Ti (16 GB) con reparto de capas. Una sola GPU de 24 GB (RTX 4090, RTX 3090) o superior (A100 40/80 GB, H100) debería alojar el modelo completo, aunque no se aportan medidas en ese escenario.
- Cabe en GPU de consumo: sí, en configuraciones multi-GPU de 16 GB cada una; en una única GPU de 16 GB no cabe completo y requeriría offload parcial a RAM.
- Opciones de despliegue: `llama.cpp` (servidor y `llama-bench`). La variante FP8 requiere una build con soporte CUDA de `F8_E4M3` (rama `osimons/ocp_fp8_cuda`, basada en el PR #27512); la variante Q8_0 funciona con builds CUDA estándar de `llama.cpp`.
- Latencia y throughput: prefill de 944 a 2.122 tok/s según longitud de prompt en Q8_0 y de 1.272 a 2.122 tok/s en FP8; decode de 25,89 tok/s (FP8) y 27,17 tok/s (Q8_0) en el hardware descrito.
- Advertencia de backend: en builds de `llama.cpp` `master` sin soporte CUDA de F8_E4M3, los 208 tensores FP8 se quedan en CPU aunque el log indique `offloaded 66/66 layers`, con una degradación severa del rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| williamliao/Qwen3.8-Mixed-NVFP4-FP8-GGUF (esta ficha) | 27,3 B | no disponible | NVFP4 + FP8 E4M3 / Q8_0, GGUF | Apache-2.0 | Hugging Face, `llama.cpp` |
| HangGlidersRule/Darkstar-Qwen3.8-27B-Base-ModelOpt-W4A16-NVFP4-Mixed-FP8 | 27,3 B | no disponible | NVFP4 + FP8 E4M3 (formato fuente) | Apache-2.0 | Hugging Face, orientado a vLLM |
| Qwen/Qwen3.8-27B | 27,3 B | no disponible | BF16 (modelo original) | Apache-2.0 (según modelo fuente) | Hugging Face |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables en la información proporcionada. La comparación con alternativas de otros linajes (Llama, Mistral, Gemma) no está disponible.

## Limitaciones y advertencias

- El modelo no es un entrenamiento propio: es una conversión GGUF de una cuantización de terceros; los sesgos y la calidad heredan del Qwen3.8-27B y del proceso ModelOpt, sin evaluación independiente publicada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de 27 B.
- Idiomas soportados no declarados: no hay garantía documentada de cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto no documentada en esta ficha; el benchmark usa 8.192 tokens, pero no se confirma el máximo soportado.
- La variante FP8 requiere una build experimental de `llama.cpp` (`osimons/ocp_fp8_cuda`, PR #27512) que puede cambiar antes de integrarse; en builds estándar el rendimiento se degrada por el offload implícito de los tensores FP8 a CPU.
- El log de `llama.cpp` puede ser engañoso: `offloaded 66/66 layers` no garantiza que los pesos FP8 estén en GPU; hay que verificar `(and 0 others)` y `splits = 3`.
- Los benchmarks del autor son de rendimiento, no de calidad, y se obtuvieron en Windows con dos GPU concretas; no son extrapolables a otros hardware o sistemas operativos.
- La licencia Apache-2.0 se declara en la model card, pero el autor recomienda consultar los avisos del modelo upstream y del repositorio fuente; no se aporta verificación independiente.
- El repositorio incluye una variante etiquetada como "Abliterated" sin documentación sobre qué modifica respecto al modelo fuente.
- Uso comercial: permitido por Apache-2.0 según la declaración, sujeto a las condiciones del modelo upstream Qwen3.8-27B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/williamliao/Qwen3.8-Mixed-NVFP4-FP8-GGUF
- Modelo fuente cuantizado: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3.8-27B-Base-ModelOpt-W4A16-NVFP4-Mixed-FP8
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Rama de `llama.cpp` con soporte CUDA F8_E4M3: https://github.com/ggml-org/llama.cpp/tree/osimons/ocp_fp8_cuda
- Pull request de soporte FP8 en CUDA: https://github.com/ggml-org/llama.cpp/pull/27512
