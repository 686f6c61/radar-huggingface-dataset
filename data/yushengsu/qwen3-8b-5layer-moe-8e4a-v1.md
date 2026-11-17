# yushengsu/Qwen3-8B-5layer-MoE-8E4A-v1

## Resumen

Qwen3-8B-5layer-MoE-8E4A-v1 es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por el usuario yushengsu dentro del ecosistema SpecForge. No es un modelo de lenguaje generalista: es un modelo auxiliar de 5 capas que se acopla a Qwen/Qwen3-8B como modelo objetivo para acelerar la inferencia mediante verificacion especulativa en SGLang. Su funcion es proponer tokens candidatos que el modelo grande valida en paralelo, reduciendo el coste por token generado.

La innovacion principal es el uso de una arquitectura Mixture-of-Experts (MoE) en el borrador: 8 expertos enrutados de ancho completo 12288 con top-4 activos por token (8E4A), lo que supone aproximadamente 6,4 mil millones de parametros totales y unos 3,3 mil millones activos. Esto contrasta con la variante 8E2A del mismo autor (~1,8 B activos) y con el borrador denso de referencia. El entrenamiento se realizo sobre una unica GPU H200 y posteriormente en dos nodos de 8x H200, con 53.822 pasos de optimizador y exportaciones por epoca.

El modelo es relevante porque demuestra que un borrador MoE puede superar en longitud de aceptacion a un borrador denso equivalente en las mismas condiciones de servicio, a costa de un throughput algo menor. Se distribuye bajo licencia Apache 2.0 y esta pensado exclusivamente para despliegues con SGLang y decodificacion especulativa, no para uso como modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 5 capas, 8 expertos enrutados SwiGLU de ancho 12288, top-4 (8E4A), sin experto compartido, router con selection bias |
| Parametros totales | ~6,4 B |
| Parametros activos | ~3,3 B |
| Longitud de contexto | no disponible (evaluado con contexto 16384 en el protocolo de benchmarks) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportaciones por epoca `1ep/` a `5ep/`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 5 capas con capas FFN sustituidas por un MoE de 8 expertos SwiGLU de ancho completo 12288, con enrutamiento top-4 por token y `norm_topk_prob: false`. No emplea experto compartido. El router incorpora un mecanismo de selection bias con actualizacion de 0,001 y una perdida auxiliar batch-wise de 0,005. La receta de entrenamiento parte de la variante 8E2A: cosine de 5 epocas desde 6e-4, warmup del 4 %, batch global de 132, semilla 42 y `fsdp_sharding: SHARD_GRAD_OP`. La diferencia operativa es que el paso de optimizador usa batch 1 por rango (frente a batch 2 en 8E2A) porque top-4 con batch 2 alcanzaba 138 GB por GPU en la prueba de humo.

El entrenamiento comenzo el 8 de noviembre de 2026 en un nodo de 8x H200 (2 servidores de captura SGLang y 6 rangos de entrenamiento FSDP, 10,9 s/paso). Desde el checkpoint del paso 2.691 continuo en dos nodos de 8x H200 con sharding FSDP hibrido (particionado intra-nodo, replicado entre nodos), 12 rangos y 5,8-6,5 s/paso, con el mismo orden de muestras y el mismo schedule. Los 53.822 pasos de optimizador sobre 132 muestras finalizaron alrededor del 12 de noviembre de 2026. Se exportaron checkpoints por epoca y cada uno supero la comprobacion de equivalencia entre el `MoELayer` de SpecForge y el `DFlashMoE` de SGLang (acuerdo de conjunto de expertos 1.000, |dy| relativo ~4,5e-3).

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: es su unica funcion prevista; propone borradores que Qwen3-8B verifica.
- Aceleracion de inferencia en SGLang: integrado mediante `DFlashMoE` y el PR sgl-project/sglang#47181, con configuracion de bloque gamma 7 / verify 8.
- Enrutamiento MoE top-4 con kernel Triton de fused-MoE afinado para la forma E=8, N=12288 en H200, incluyendo variantes con TMA.
- Exportacion de pesos compatible con SGLang y verificada frente al entrenamiento original.
- No soporta tool calling, agentes, vision, audio ni modo thinking por si mismo: hereda el comportamiento del modelo objetivo Qwen3-8B durante la verificacion.
- Capacidades multilingues: no disponibles como modelo autonomo; dependen del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el borrador se sirve junto al modelo objetivo en SGLang y reduce el coste por token validado; su longitud de aceptacion agrupada de 6,253 en `ep4/` frente a 6,114 del borrador denso lo hace adecuado cuando se prioriza aceptacion sobre throughput bruto.
- Servicio de bajas concurrencias con maxima aceptacion: a concurrencia 1 el borrador MoE alcanza 6,253 de aceptacion agrupada y 600 tokens/s con configuracion TMA, util para asistentes interactivos donde prima la latencia por token.
- Despliegue en nodos H200 con SGLang: la configuracion de kernel incluida (`kernel-configs/E=8,N=12288,device_name=NVIDIA_H200.json`) permite reproducir el rendimiento medido sin reafinar el kernel.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de un borrador MoE top-4 frente a uno denso, con curvas de W&B y checkpoints por epoca publicados.
- Evaluacion de estrategias de enrutamiento: el router con selection bias y top-4 permite estudiar el equilibrio entre aceptacion y coste computacional en borradores especulativos.
- Pipeline de generacion de codigo y matematicas: las tareas humaneval, mbpp, gsm8k y math500 muestran las mayores ganancias de aceptacion frente al denso (+4,3 %, +4,4 %, +1,3 % y +2,5 %), por lo que encaja en entornos de generacion de codigo servidos con Qwen3-8B.
- Benchmarking de kernels fused-MoE: los datos de throughput a concurrencias 1-256 con configuracion por defecto y TMA permiten comparar implementaciones de kernel en H200.

## Benchmarks y rendimiento

Longitud de aceptacion por epoca (c=1, gamma 7 / verify 8, thinking off, temperatura 0, max_new_tokens 2048, contexto 16384, sin radix cache):

| Carpeta | Paso | Epoca | gsm8k | math500 | humaneval | mbpp | mt-bench | Agrupada | Media por tarea |
|---|---:|---:|---|---|---|---|---|---|---|
| denso referencia | - | - | 6,451 | 6,354 | 5,634 | 5,423 | 4,184 | 6,114 | 5,609 |
| `1ep/` | 10764 | 1 | 6,197 | 6,073 | 5,235 | 4,973 | 3,877 | 5,820 | 5,271 |
| `2ep/` | 21528 | 2 | 6,398 | 6,319 | 5,598 | 5,341 | 4,199 | 6,067 | 5,571 |
| `3ep/` | 32292 | 3 | 6,488 | 6,465 | 5,759 | 5,560 | 4,341 | 6,191 | 5,722 |
| `4ep/` (final) | 43056 | 4 | 6,537 | 6,514 | 5,875 | 5,661 | 4,436 | 6,253 | 5,805 |
| `5ep/` | 53820 | 5 | 6,526 | 6,493 | 5,870 | 5,634 | 4,429 | 6,239 | 5,791 |

Comparativa `ep4/` frente al borrador denso: +0,140 agrupada (+2,3 %), +0,196 media por tarea (+3,5 %), con diferencias por tarea de +0,086 (gsm8k), +0,161 (math500), +0,241 (humaneval), +0,238 (mbpp) y +0,252 (mt-bench).

Throughput en flujo mixto (2.400 peticiones mezcladas), tokens de salida por segundo:

| Concurrencia | Denso | MoE defecto | vs denso | MoE TMA | vs denso | Paso ms denso / defecto / TMA |
|---|---|---|---|---|---|---|
| 1 | 730 ± 1 | 591 ± 1 | -19,0 % | 600 ± 1 | -17,8 % | 8,0 / 10,2 / 10,1 |
| 8 | 4986 ± 18 | 3448 ± 5 | -30,8 % | 3965 ± 15 | -20,5 % | 9,4 / 14,0 / 12,1 |
| 16 | 8425 ± 34 | 5755 ± 33 | -31,7 % | 6750 ± 37 | -19,9 % | 11,1 / 16,6 / 14,2 |
| 32 | 11320 ± 61 | 7948 ± 44 | -29,8 % | 9360 ± 71 | -17,3 % | 16,3 / 23,8 / 20,2 |
| 64 | 13579 ± 88 | 9690 ± 45 | -28,6 % | 11522 ± 91 | -15,1 % | 26,8 / 38,6 / 32,5 |
| 128 | 15245 ± 136 | 10714 ± 65 | -29,7 % | 13146 ± 113 | -13,8 % | 47,4 / 69,1 / 56,3 |
| 256 | 16387 ± 84 | 11512 ± 86 | -29,7 % | 14177 ± 92 | -13,5 % | 86,7 / 126,8 / 102,7 |

## Requisitos de hardware

- Inferencia medida en una unica GPU H200 con TP=1 (SGLang main c10e0e17 + PR #47181); el modelo se sirve como borrador junto a Qwen3-8B, por lo que la VRAM total incluye ambos modelos.
- Entrenamiento: nodo de 8x H200 (2 servidores de captura + 6 rangos FSDP) y posteriormente dos nodos de 8x H200 con 12 rangos; el paso top-4 con batch 2 alcanzaba 138 GB por GPU, de ahi el batch 1 por rango.
- VRAM de inferencia estimada para el borrador: no disponible de forma explicita; el repo ocupa 64,1 GB en safetensors con todas las exportaciones por epoca.
- No cabe en GPUs de consumo tipo RTX 4090 por el tamano del repo y del modelo objetivo asociado; no hay datos publicados de despliegue en consumer.
- Opciones de despliegue: SGLang (libreria declarada, con `DFlashMoE` y el PR #47181). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; con TMA se recuperan entre 13,5 % y 20,5 % del throughput del denso segun concurrencia, con pasos de 10,1 ms a 102,7 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Aceptacion agrupada | Throughput c=256 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E4A-v1 (`ep4/`) | ~6,4 B | ~3,3 B | no disponible | 6,253 | 14177 tok/s (TMA) | Apache 2.0 | Hugging Face |
| Qwen3-8B-5layer-MoE-8E2A-v1 | no disponible | ~1,8 B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| jiapingW/Qwen3-8b-dspark-SpecForge (denso) | no disponible (5 capas, FFN 12288) | denso | no disponible | 6,114 | 16387 tok/s | no disponible | Hugging Face |

El borrador MoE 8E4A supera al denso en aceptacion (+2,3 % agrupada, +3,5 % por tarea) pero pierde entre 13,5 % y 30,8 % de throughput segun configuracion de kernel y concurrencia. La variante 8E2A del mismo autor reduce parametros activos a ~1,8 B, pero no se publican sus cifras de aceptacion ni throughput en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como borrador de decodificacion especulativa emparejado con Qwen3-8B en SGLang; su uso fuera de ese pipeline no esta soportado.
- Throughput inferior al borrador denso en todas las concurrencias medidas (hasta -30,8 % con configuracion por defecto y -20,5 % con TMA a c=8); la ganancia en aceptacion no compensa el coste en escenarios de alta concurrencia.
- Requiere el PR sgl-project/sglang#47181 y una version concreta de SGLang; la integracion puede romperse con actualizaciones.
- Los kernels Triton estan afinados exclusivamente para H200 con triton 3.8.0; el rendimiento en otras GPUs no esta medido.
- Sesgos conocidos: no disponibles; al heredar el comportamiento del modelo objetivo, los sesgos de Qwen3-8B se manifiestan en la salida final.
- Riesgo de alucinacion: no aplica de forma directa al ser un borrador verificado, pero la calidad final depende de Qwen3-8B.
- Idiomas soportados: no disponibles; dependen del modelo objetivo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de SGLang y del PR concreto debe verificarse antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E4A-v1
- Variante 8E2A: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E2A-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Borrador denso de referencia: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- Rama de configuracion y receta: https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-5layer-moe8x12288-8E4A-dspark
- Curvas de entrenamiento (W&B): https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/n0k9gter
- PR de SGLang: https://github.com/sgl-project/sglang/pull/47181
