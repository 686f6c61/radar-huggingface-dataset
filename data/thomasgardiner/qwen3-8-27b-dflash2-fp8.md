# thomasgardiner/Qwen3.8-27B-DFlash2-FP8

## Resumen

El modelo `thomasgardiner/Qwen3.8-27B-DFlash2-FP8` es una version cuantizada en FP8 del modelo borrador `incoai/Qwen3.8-27B-DFlash2`, disenado para acelerar la decodificacion especulativa del modelo objetivo `Qwen/Qwen3.8-27B`. No es un modelo de lenguaje autonomo: se ejecuta dentro de un servidor de decodificacion especulativa y propone tokens candidatos que el modelo objetivo verifica. El autor es `thomasgardiner`, y el checkpoint se publico en septiembre de 2026 bajo licencia Apache-2.0.

La cuantizacion afecta unicamente a 20 tensores: las proyecciones de salida de las capas de atencion (`o_proj`) y las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de las cinco capas del modelo borrador. El resto de los pesos se mantienen en bf16. El checkpoint pasa de 3.85 GB a 2.41 GB. El objetivo es reducir el tiempo de decodificacion en una RTX 5090 (SM120) sin degradar de forma significativa la tasa de aceptacion del modelo borrador original.

Los benchmarks publicados indican que, en cuatro conjuntos estandar (MT-Bench, HumanEval, GSM8K y MATH-500), este modelo decodifica entre un 4% y un 6% mas rapido que el borrador bf16, con una tasa de aceptacion dentro del 1.3% de la original. La ventaja principal se obtiene al usar una escala por tensor en lugar de por canal, lo que permite que SGLang utilice cuBLAS en lugar de CUTLASS en el hardware SM120.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo borrador para decodificacion especulativa, 5 capas) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (pesos de MLP y `o_proj`), bf16 (resto) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `float-quantized`) |

## Arquitectura y entrenamiento

Este modelo es una version cuantizada del draft model `incoai/Qwen3.8-27B-DFlash2`, que a su vez esta basado en `Qwen/Qwen3.8-27B`. No es un modelo standalone: su unica funcion es generar tokens candidatos que el modelo objetivo verifica mediante decodificacion greedy. La arquitectura interna del borrador no se detalla en la documentacion, pero se indica que consta de cinco capas draft.

La cuantizacion se realizo con el script `quantize.py` incluido en el repositorio, sin datos de calibracion. El proceso carga los safetensors originales, cuantiza los 20 tensores seleccionados a FP8 E4M3 con una escala simetrica absmax por tensor, y anade una `quantization_config` con una lista de exclusiones para las capas que permanecen en bf16. Se eligio una escala por tensor porque, en SGLang sobre SM120, las escalas por canal en FP8 se enrutan a un GEMM CUTLASS que alcanza solo entre el 25% y el 60% del ancho de banda de HBM, mientras que la escala por tensor permite usar cuBLAS y alcanzar el 86%. No se mencionan datos de entrenamiento, RLHF ni DPO.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: propone secuencias de tokens que el modelo objetivo `Qwen3.8-27B` verifica, reduciendo el numero de pasos de decodificacion necesarios.
- Integracion con SGLang: se carga como modelo borrador en un servidor SGLang mediante el algoritmo DFLASH, con el flag `--speculative-draft-model-path`.
- Cuantizacion FP8 selectiva: reduce el tamano del checkpoint de 3.85 GB a 2.41 GB sin perdida significativa de aceptacion (dentro del 1.3% en los conjuntos estandar).
- Compatibilidad con hardware SM120 (RTX 5090): aprovecha los GEMM FP8 de cuBLAS para obtener una ganancia del 4% en el tiempo de paso y del 4-6% en el throughput neto.
- No es un modelo de lenguaje autonomo: no genera texto por si mismo, no soporta tool calling, agentes, vision, audio ni razonamiento multi-paso. Estas capacidades corresponden al modelo objetivo.

## Casos de uso

- Aceleracion de inferencia para `Qwen3.8-27B` en SGLang: se usa como draft model en un servidor con `--speculative-algorithm DFLASH`, reduciendo el tiempo de decodificacion en aplicaciones de texto generativo.
- Reduccion de latencia en asistentes conversacionales en tiempo real: al aumentar el throughput de tokens por segundo, se mejora la experiencia de usuario en chats multi-turno.
- Generacion de codigo asistida: en tareas de HumanEval, el draft FP8 alcanza una tasa de aceptacion de 4.58 tokens frente a 4.64 del borrador bf16, con un throughput de 248.8 tok/s (frente a 239.2 tok/s).
- Razonamiento matematico: en GSM8K y MATH-500, el modelo decodifica un 4-5% mas rapido (277.0 y 272.4 tok/s respectivamente) manteniendo la aceptacion cercana a la original.
- Despliegue en GPUs de consumo: el checkpoint de 2.4 GB permite ejecutar el draft junto al modelo objetivo cuantizado NVFP4 en una RTX 5090 de 32 GB.
- Optimizacion de costes por token: al reducir el tiempo de decodificacion, se reduce el coste operativo en servicios de inferencia que facturan por token generado.
- Investigacion en decodificacion especulativa: sirve como referencia para estudiar el impacto de la cuantizacion FP8 en modelos borrador y su interaccion con kernels NVFP4.

## Benchmarks y rendimiento

Los resultados se obtuvieron en una RTX 5090 (SM120), con SGLang, el modelo objetivo `Qwen3.8-27B` en NVFP4, modo de pensamiento activado, una peticion a la vez y 8 tokens draft. Los datos provienen del README del autor.

| Dataset | Prompts | Draft bf16 tok/s | Aceptacion bf16 | Este repo tok/s | Aceptacion este repo |
|---|---|---|---|---|---|
| MT-Bench (primer turno) | 80 | 190.5 | 3.80 | 201.5 | 3.83 |
| HumanEval | 164 | 239.2 | 4.64 | 248.8 | 4.58 |
| GSM8K (test, primeros 100) | 100 | 264.0 | 5.07 | 277.0 | 5.02 |
| MATH-500 (primeros 100) | 100 | 261.6 | 5.14 | 272.4 | 5.08 |

Tambien se midio el tiempo por paso y la longitud de aceptacion media en tres prompts greedy, con unas 44 lotes de decodificacion cada uno:

| Draft | Aceptacion media | Paso (ms) |
|---|---|---|
| bf16 (original) | 4.01 | 19.10 |
| FP8 per-channel | 3.87 | 19.37 |
| FP8 per-tensor (este repo) | 3.99 | 18.31 |

En cinco prompts de codigo escritos a mano, el draft FP8 acepto un 8% menos de tokens que el bf16, pero en los 164 prompts de HumanEval la caida es solo del 1.3% y la ganancia neta es del 4%. El autor advierte que un unico prompt no es un benchmark fiable y que las variaciones por prompt pueden superar el 20% en ambas direcciones.

## Requisitos de hardware

- VRAM estimada para el draft: el checkpoint ocupa 2.4 GB, por lo que se necesita al menos esa cantidad mas el overhead del runtime. La VRAM total depende del modelo objetivo `Qwen3.8-27B` en NVFP4, cuyo consumo no se especifica en la documentacion.
- GPU recomendada: RTX 5090 (SM120). Todas las mediciones se realizaron en esta GPU, y la ganancia depende del uso de cuBLAS para FP8 per-tensor.
- Otras GPUs: no se han probado. El autor indica que otros motores que lean compressed-tensors FP8 deberian cargar el checkpoint, pero no estan verificados.
- Opciones de despliegue: SGLang (verificado con la imagen `lmsysorg/sglang@sha256:616a3e97...`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: segun los benchmarks, el tiempo por paso es de 18.31 ms con 8 tokens draft. El throughput oscila entre 174.2 tok/s en prosa y 300.3 tok/s en matematicas, dependiendo de la categoria y de la tasa de aceptacion.

## Comparativa con modelos similares

Este modelo se compara con las dos variantes del mismo draft model publicadas por el autor: el borrador bf16 original y la version FP8 per-channel que se descarto.

| Modelo | Precision | Paso (ms) | Aceptacion media | Tok/s (prosa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `incoai/Qwen3.8-27B-DFlash2` (bf16) | bf16 | 19.10 | 4.01 | 151.6 | Apache-2.0 | HuggingFace |
| `Qwen3.8-27B-DFlash2-FP8` (per-channel) | FP8 per-channel | 19.37 | 3.87 | no disponible | Apache-2.0 | no publicado |
| `thomasgardiner/Qwen3.8-27B-DFlash2-FP8` (per-tensor) | FP8 per-tensor | 18.31 | 3.99 | 174.2 | Apache-2.0 | HuggingFace |

Los tres modelos comparten los mismos parametros totales (1.92B) y la misma arquitectura de draft. La diferencia clave esta en la estrategia de cuantizacion y en el rendimiento medido en SM120.

## Limitaciones y advertencias

- No es un modelo standalone: no puede utilizarse para generar texto por si mismo. Requiere un modelo objetivo y un servidor de decodificacion especulativa.
- Solo se ha verificado en SGLang con una imagen especifica y en hardware SM120 (RTX 5090). Otros motores o GPUs no estan probados.
- La ganancia de rendimiento es modesta: 4% en el tiempo por paso y 4-6% en el throughput neto en los conjuntos estandar. En prompts concretos de codigo, la tasa de aceptacion puede caer hasta un 8%.
- Las mediciones se realizaron con batch size 1. No se han evaluado lotes mayores, por lo que el comportamiento en produccion con concurrencia es desconocido.
- Al ser un modelo borrador, la calidad final del texto depende del modelo objetivo. Cualquier sesgo o riesgo de alucinacion del modelo objetivo se mantiene.
- La cuantizacion FP8 se realizo sin datos de calibracion, lo que puede provocar diferencias de aceptacion en distribuciones de entrada no representadas en los benchmarks.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y el aviso de licencia en las redistribuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thomasgardiner/Qwen3.8-27B-DFlash2-FP8
- Modelo borrador original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de inco.ai sobre DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio de z-lab sobre DFlash: https://github.com/z-lab/dflash
- Parche de SGLang para SM120 y NVFP4: https://github.com/thomgardiner/sglang-sm120-nvfp4
