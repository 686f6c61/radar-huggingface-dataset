# TuanAnhHoangBui/super-nvfp4-w4a8

## Resumen

`super-nvfp4-w4a8` es un prototipo de investigación publicado por TuanAnhHoangBui que implementa una ruta híbrida de cuantización NVFP4 (pesos, bloque de 16 con escalas E4M3) combinada con activaciones FP8 para modelos MoE de la familia NVIDIA Nemotron-3, sirviéndose a través de vLLM sobre GPUs Hopper (SM90, H200). El objetivo es conseguir la precisión de NVFP4 con la velocidad de W4A8, algo que vLLM 0.33 no ofrece de serie en Hopper (solo expone NVFP4 como W4A16 mediante el kernel Marlin).

El repositorio no contiene un modelo entrenado desde cero, sino un artefacto de inferencia y un conjunto de kernels (decodificador NVFP4→FP8 bit-exacto, dispatcher híbrido, GEMM agrupado CUTLASS) que se aplican sobre checkpoints NVFP4 ya existentes de Nemotron-3 Super 120B y Nemotron-3 Lightning 30B. Según la model card, el estado a 2026-11-25 es de prototipo de investigación con servicio de modelo completo medido, no endurecido para producción.

La relevancia radica en que demuestra que es posible superar a Marlin NVFP4 W4A16 en prefill (+48%) y mixed (+22%) manteniendo precisión equivalente en GSM8K, aunque sigue por detrás de MXFP4 W4A8 en decode batched por una propiedad del formato de escalas (E4M3 con mantisa frente a E8M0 puro exponente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (Nemotron-3 Super 120B: E512, top-22, H1024, I2688; Lightning 30B: E128, top-6, H2688, I1856) |
| Parametros totales | 120B (Super) / 30B (Lightning) segun checkpoint base |
| Parametros activos | no disponible (top-22 sobre 512 expertos en Super; top-6 sobre 128 en Lightning) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 pesos (bloque 16, escalas E4M3) + FP8 activaciones (W4A8); KV cache FP8; checkpoint NVFP4 de ModelOpt |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint NVFP4 de ModelOpt (no se especifica safetensors/GGUF); kernels propios en CUDA/Triton/CUTLASS |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: opera sobre checkpoints NVFP4 generados con ModelOpt para Nemotron-3 Super 120B y Lightning 30B, ambos MoE con atención transformer estándar. La innovación está en la ruta de inferencia. El dispatcher `HybridNvfp4MoE` (`dense_fp8.py`) elige kernel según el número de tokens M: para M < 2048 usa Marlin NVFP4 W4A16 de vLLM; para M ≥ 2048 ejecuta un kernel CUDA (`cuda_ops.marlin_decode`) que decodifica NVFP4→FP8 directamente desde los códigos repackeados y escalas procesadas de Marlin (bit-exacto, 1,13 ms por capa Super para ambas matrices), seguido de un GEMM FP8 agrupado CUTLASS (`vllm ops.cutlass_moe_mm`) con activaciones por token y escalas de peso por canal, y un ReLU² fusionado en fp32 con cuantización FP8 por fila que alimenta el segundo GEMM.

La numerología se describe formalmente: `W[e,n,k] = G[e] · S[e,n,k/16] · e2m1(code)`. Se construye un operando FP8 por peso como `W8 = fp8_rne(e2m1 · S_rel)` con `S_rel = S / r`, donde `r[e,n]` es una potencia de dos elegida por fila tal que `6·max S/r ≤ 448`, y `B[e,n] = G·r` se aplica en el epílogo. El producto es exacto en fp16, por lo que el único error añadido es el redondeo RNE. El decodificador explota la forma cerrada del layout de nibbles de Marlin (tile 64n × 16k = 128 palabras int32: `word = j + 4kq + 16r`, `slot = b0 + 2b1 + 4b2`), verificada en `tests/probe_marlin_layout.py`. Se ofrece además un GEMM agrupado con acumulación precisa (`torch._scaled_grouped_mm`, `use_fast_accum=False`) activable con `SUPER_W4A8_GEMM=torch`, que elimina el 0,6% de error de la acumulación FP8 rápida a costa de 3,4× tiempo de GEMM.

## Capacidades

- Generación de texto y razonamiento heredados del checkpoint base Nemotron-3 (Super 120B y Lightning 30B); el repositorio no añade capacidades nuevas, solo cambia el formato numérico de inferencia.
- Razonamiento aritmético verificado: 8/8 sondas de QA aritmético respondidas correctamente por todas las variantes comparadas.
- Razonamiento matemático evaluado con GSM8K (5-shot, greedy, 1319 preguntas) en Super 120B y Lightning 30B.
- Servicio de modelo completo mediante `vllm serve` con CUDA graphs, fp8 KV cache y `max-num-batched-tokens 8192`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia de alta concurrencia en prefill: con cargas de 8192 tokens de entrada y 64 peticiones, la ruta híbrida alcanza 21.754 tok/s frente a 14.697 de Marlin W4A16 (+48%), lo que la hace adecuada para escenarios con prompts largos y muchas peticiones simultáneas (RAG, resumen de documentos).
- Despliegue de Nemotron-3 Super 120B en una única H200: la model card reporta servicio de modelo completo en 1× H200 con vLLM 0.33, lo que permite servir un MoE de 120B en un solo acelerador con cuantización NVFP4.
- Evaluación comparativa de formatos de cuantización: el repositorio incluye `modal_runs/serve_bench.py` y `SERVE_EVALS=gsm8k` para reproducir benchmarks de serving y precisión, útil para investigadores que comparen NVFP4, MXFP4 y Marlin W4A16.
- Investigación sobre kernels de decodificación de cuantización: el decodificador `cuda_ops.marlin_decode` y el layout documentado sirven como referencia para implementar rutas W4A8 sobre formatos empaquetados propietarios.
- Prototipado de serving mixto prefill/decode: el dispatcher híbrido permite usar Marlin W4A16 en decode (M < 2048) y CUTLASS FP8 en prefill (M ≥ 2048), patrón reutilizable en otros MoE cuantizados.
- Validación numérica de cuantización: las tablas de rel-L2 frente a BF16 (4,54% Marlin, 5,05–5,18% híbrido, 6,19% MXFP4) permiten usar el repo como banco de pruebas de error de peso en capas MoE concretas.

## Benchmarks y rendimiento

Servicio de modelo completo, Super 120B, 1× H200, tok/s totales (vLLM 0.33, CUDA graphs, fp8 KV cache):

| Carga | Marlin NVFP4 W4A16 | NVFP4 W4A8 híbrido | MXFP4 W4A8 (FlashInfer, BF16 ckpt) |
|---|---:|---:|---:|
| prefill (8192 in / 1 out, 64 req) | 14.697 | 21.754 (+48%) | 21.688 |
| mixed (1024 / 256, 256 req) | 9.362 | 11.399 (+22%) | 12.206 |
| decode (128 / 512, 128 concurrentes) | 3.275 | 3.349 (+2%) | 3.936 |
| batch 1 (512 / 256), TPOT ms | 6,41 | 6,49 | 8,19 |

GSM8K, lm-eval-harness 0.4.9, 5-shot, greedy, API de completions, 1319 preguntas, stderr ≈ ±0,7 (Super) / ±1,0 (Lightning):

| Modelo | strict-match | flexible-extract |
|---|---:|---:|
| Super 120B Marlin NVFP4 W4A16 | 92,80 | 93,40 |
| Super 120B NVFP4 W4A8 híbrido | 93,10 | 93,86 |
| Super 120B MXFP4 W4A8 | 92,27 | 92,95 |
| Lightning 30B Marlin NVFP4 W4A16 | 83,47 | 84,53 |
| Lightning 30B NVFP4 W4A8 híbrido | 82,49 | 84,15 |

Lightning 30B, tok/s totales:

| Carga | Marlin NVFP4 W4A16 | NVFP4 W4A8 híbrido | MXFP4 W4A8 |
|---|---:|---:|---:|
| prefill | 49.829 | 73.862 (+48%) | no soportado (K/32 no divisible por 4 con I=1856) |
| mixed | 27.279 | 37.236 (+36%) | — |
| decode | 10.772 | 10.842 (+1%) | — |
| batch 1 | 919 | 979 (+7%) | — |

Error relativo L2 frente a BF16, capa 1 de Super 120B (E512, top-22, H1024, I2688), M = 256:

| Variante | rel-L2 |
|---|---:|
| Marlin NVFP4 W4A16 | 4,54% |
| NVFP4 W4A8 híbrido (precisa / CUTLASS fast-acc) | 5,05% / 5,18% |
| MXFP4 W4A8 (FlashInfer CUTLASS SM90) | 6,19% |

KL simétrica top-20 del primer token frente a Marlin A16: híbrido 0,015; MXFP4 0,021.

## Requisitos de hardware

- GPU Hopper (SM90) obligatoria para los kernels NVFP4/FP8 descritos; la model card reporta mediciones en 1× H200.
- VRAM estimada: no disponible de forma explícita; el checkpoint Super 120B en NVFP4 (4 bits) ronda los 60 GB de pesos más overhead de escalas, KV cache FP8 y activaciones, pero la cifra exacta no se proporciona.
- GPU recomendadas: NVIDIA H200 (medida); H100 SM90 es compatible por arquitectura, aunque no se reportan cifras.
- Consumer GPU: no disponible; no se documenta funcionamiento en RTX 4090 ni en GPUs no Hopper.
- Despliegue: vLLM 0.33 con `vllm serve`, CUDA graphs, fp8 KV cache, `max-num-batched-tokens 8192`; kernels propios en CUDA, Triton y CUTLASS; opción de acumulación precisa vía `torch._scaled_grouped_mm`.
- Latencia: TPOT 6,49 ms en batch 1 (Super 120B); 979 tok/s en batch 1 para Lightning 30B.
- Throughput: ver tabla de benchmarks (hasta 21.754 tok/s en prefill Super y 73.862 tok/s en prefill Lightning).

## Comparativa con modelos similares

| Criterio | NVFP4 W4A8 híbrido (este repo) | Marlin NVFP4 W4A16 (vLLM stock) | MXFP4 W4A8 (FlashInfer) |
|---|---|---|---|
| Formato de pesos | NVFP4 bloque 16, escalas E4M3 | NVFP4 bloque 16, escalas E4M3 | MXFP4 bloque 32, escalas E8M0 |
| Activaciones | FP8 | BF16/FP16 | FP8 |
| Prefill Super 120B (tok/s) | 21.754 | 14.697 | 21.688 |
| Decode batched Super 120B (tok/s) | 3.349 | 3.275 | 3.936 |
| GSM8K Super (strict) | 93,10 | 92,80 | 92,27 |
| rel-L2 vs BF16 (capa 1) | 5,05–5,18% | 4,54% | 6,19% |
| Soporte Lightning 30B | sí | sí | no (falla al cargar por I=1856) |
| Licencia | no disponible | la de vLLM | la de FlashInfer |

## Limitaciones y advertencias

- Estado explícito de prototipo de investigación: "not production-hardened" según la model card; no debe desplegarse en producción sin validación adicional.
- El decode batched sigue por detrás de MXFP4 W4A8 (3.349 vs 3.936 tok/s en Super) por una propiedad del formato: las escalas E4M3 con mantisa requieren multiplicación y redondeo RNE por peso para llegar a operando FP8, mientras que E8M0 es solo suma de exponentes. Se construyó un kernel W4A8 fusionado para decode (Triton y CUDA, `cuda_ops.w4a8_small_gemm`) numéricamente exacto (0,17% vs R2) pero limitado por ALU a ~2× el tiempo de Marlin, por lo que se mantiene Marlin W4A16 en ese régimen.
- La compresión de escalas de Marlin (E5M3 sin signo, factor potencia de dos común por capa) satura a 0 las escalas fuera de rango; en Lightning afecta hasta 1,4 M bloques en una capa (capa 3). Afecta por igual a Marlin A16 y al híbrido, porque este lee las escalas de Marlin.
- La acumulación FP8 rápida de `cutlass_moe_mm` añade 0,6% de error frente a R2; la alternativa precisa cuesta 3,4× tiempo de GEMM.
- El kernel MXFP4×FP8 de FlashInfer en SM90 requiere K/32 divisible por 4; con I=1856 en Lightning falla al cargar, lo que limita la comparabilidad en ese modelo.
- Sin licencia declarada, sin idiomas declarados y sin pipeline declarado en Hugging Face; cero descargas y cero likes en el momento de la consulta.
- No se publican datos de sesgos, alucinación, capacidades multilingües ni tool calling; deben evaluarse sobre el checkpoint base Nemotron-3.
- Dependencia fuerte de vLLM 0.33 y de GPUs Hopper; no hay ruta documentada para GPUs Ampere, Ada consumer o CPU.

## Enlaces

- Hugging Face: https://huggingface.co/TuanAnhHoangBui/super-nvfp4-w4a8
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
