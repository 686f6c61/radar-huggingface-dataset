# TeenSpirit/Qwen3.8-27B-speculator.dspark-MXFP4A16

## Resumen

Qwen3.8-27B-speculator.dspark-MXFP4A16 es una re-cuantizacion comunitaria del speculator (modelo borrador) DSpark publicado por Red Hat AI para el modelo verificador Qwen/Qwen3.8-27B. No se trata de un modelo generativo autonomo, sino de un drafter de decodificacion especulativa: predice varios tokens por paso que el modelo grande verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida. Esta variante sustituye los pesos de proyeccion en bf16 por FP4 E2M1 con escalas de grupo E8M0 (formato MXFP4A16), reduciendo el checkpoint de 4,0 GB a 1,2 GB.

El autor es TeenSpirit, un publicador independiente, no Red Hat; la arquitectura, el entrenamiento y los pesos originales son integramente los del checkpoint base RedHatAI/Qwen3.8-27B-speculator.dspark. La unica modificacion es el formato de almacenamiento de las proyecciones (atencion, MLP y la capa `fc`), cuantizadas con round-to-nearest sin calibracion mediante las primitivas de compressed-tensors. Los cabezales `markov_head` y `confidence_head`, asi como las normas, se mantienen en bf16.

Su relevancia es practica: permite desplegar el drafter con menos memoria y, segun las mediciones del autor en Spec-Bench con vLLM 0.33.0 sobre una H20, conserva la longitud de aceptacion del original bf16 (media de 4,34 frente a 4,35 en greedy; 3,37 frente a 3,39 en sampling). El modelo tiene 1.988.431.617 parametros y licencia Apache 2.0 heredada del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark speculator (modelo borrador de decodificacion especulativa) sobre transformer; capas `self_attn` y `mlp` con proyecciones cuantizadas, mas `fc`, `markov_head` y `confidence_head` |
| Parametros totales | 1.988.431.617 (1,99 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4A16: pesos FP4 E2M1 simetricos, grupo de 32 con escalas E8M0 (potencia de dos), sin escala global; activaciones en bf16; formato `mxfp4-pack-quantized` de compressed-tensors (dos valores fp4 por uint8, `weight_packed` / `weight_scale`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `quantization_config` de compressed-tensors; requiere `custom_code` |

## Arquitectura y entrenamiento

El checkpoint es un drafter de decodificacion especulativa del metodo DSpark, disenado para emparejarse con el verificador Qwen/Qwen3.8-27B. Incorpora cabezales especificos (`markov_head`, `confidence_head`) que el autor mantiene en bf16, junto con todas las normas; el resto de proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y `fc`) suman 1,86 B de los 1,99 B de parametros y son las unicas cuantizadas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el checkpoint base.

La innovacion de esta variante es exclusivamente de compresion: cuantizacion weight-only round-to-nearest con escalas min/max, sin datos de calibracion y sin GPTQ ni AWQ, aplicada con `apply_quantization_config` y `ModelCompressor.compress_model` de compressed-tensors. El error relativo de Frobenius medio por capa es del 11,3 %. La lista `ignore` usa expresiones regulares (`re:.*markov_head.*`, `re:.*confidence_head.*`, etc.) para casar tanto los nombres del checkpoint como los nombres de modulo con prefijo `model.` de vLLM.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: produce hasta 7 tokens por paso de verificacion (configurable con `num_speculative_tokens`), que el modelo Qwen3.8-27B valida en paralelo.
- Prediccion multi-token con cabezal Markov y estimacion de confianza por token (`confidence_head`), que permite truncar la propuesta cuando la aceptacion esperada baja.
- Aceleracion de inferencia en dominios diversos: las mediciones cubren pregunta-respuesta, traduccion, resumen, QA, razonamiento matematico y RAG.
- No es un modelo de chat autonomo: no genera respuestas finales por si mismo, sino propuestas que el verificador acepta o rechaza.
- Compatibilidad con el ecosistema vLLM mediante `--speculative-config` y el metodo `dspark`.
- Soporte de modo thinking heredado del verificador (las mediciones se hicieron con thinking habilitado).
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3.8-27B con este drafter en vLLM reduce el coste por token generado al aceptar varios tokens por paso de verificacion; en Spec-Bench se observan longitudes de aceptacion medias de 4,34 (greedy) y 3,37 (sampling).
- Traduccion automatica de alto volumen: el subset de traduccion es el de mayor aceptacion (4,45 en greedy), por lo que es el escenario mas favorable para amortizar el coste del borrador.
- Razonamiento matematico en produccion: el subset `math_reasoning` alcanza 5,42 de longitud de aceptacion, lo que lo hace adecuado para pipelines de resolucion de problemas con cadenas de razonamiento largas.
- Generacion aumentada por recuperacion (RAG): con 4,64 de aceptacion en el subset `rag`, encaja en asistentes documentales que concatenan contexto extenso y necesitan throughput alto.
- Resumen de documentos: aceptacion de 3,79 en `summarization`, util para procesamiento por lotes de informes y actas donde prima el coste por token.
- Despliegue en GPUs con memoria limitada: al ocupar 1,2 GB en lugar de 4,0 GB, libera VRAM para el verificador o para mayor concurrencia; el autor lo probo con concurrencia 64 en una H20.
- Evaluacion de tecnicas de cuantizacion FP4: sirve como referencia reproducible para medir el impacto de MXFP4 en decodificacion especulativa con `ptq_rtn_stats.json` como traza.

## Benchmarks y rendimiento

Mediciones del autor en Spec-Bench (subsets de RedHatAI/speculator_benchmarks, 80 prompts cada uno) con verificador denso bf16 Qwen/Qwen3.8-27B, vLLM 0.33.0, 1x H20, 7 tokens especulativos, thinking activado, `max_tokens` 4096 y concurrencia 64. Longitud de aceptacion (AL) en decodificacion greedy (temperatura 0):

| Dataset | bf16 AL | MXFP4A16 AL | Tasa pos 0 | Tasa pos 6 |
|---|---:|---:|---:|---:|
| question (MT-Bench) | 3,73 | 3,68 | 78,0 % | 14,6 % |
| translation | 4,44 | 4,45 | 83,9 % | 23,3 % |
| summarization | 3,83 | 3,79 | 81,1 % | 12,1 % |
| qa | 4,16 | 4,08 | 79,0 % | 20,8 % |
| math_reasoning | 5,36 | 5,42 | 89,8 % | 40,7 % |
| rag | 4,59 | 4,64 | 84,4 % | 28,5 % |
| media | 4,35 | 4,34 | | |

Muestreo (temperatura 1,0, top_p 0,95, top_k 20):

| Dataset | bf16 AL | MXFP4A16 AL |
|---|---:|---:|
| question | 2,94 | 2,94 |
| translation | 3,44 | 3,38 |
| summarization | 3,20 | 3,24 |
| qa | 2,93 | 2,88 |
| math_reasoning | 4,38 | 4,34 |
| rag | 3,45 | 3,44 |
| media | 3,39 | 3,37 |

Comparacion pareada por prompt (480 prompts) de tokens de salida por paso de verificacion: MXFP4A16 menos bf16 de -0,026 ± 0,028 (greedy) y -0,020 ± 0,041 (sampling) al 95 % de confianza, es decir, diferencia no medible a esta escala. No se han publicado resultados de MMLU, HumanEval ni GSM8K para este checkpoint en la informacion disponible.

## Requisitos de hardware

- VRAM para el drafter: 1,2 GB de pesos en MXFP4A16 (frente a 4,0 GB en bf16), mas el espacio de activaciones en bf16 y el cache KV del verificador.
- VRAM total del sistema: dominada por Qwen3.8-27B como verificador; el drafter anade una fraccion pequena.
- GPU probada: NVIDIA H20 (Hopper) con vLLM 0.33.0. En Hopper no hay tensor cores FP4 nativos, por lo que las activaciones permanecen en bf16 y los pesos FP4 se descomprimen dentro del kernel (`HummingMxFp4LinearKernel`).
- GPU Blackwell: el autor indica que el checkpoint deberia cargarse, pero no lo ha probado.
- GPU de consumo: no hay datos publicados sobre ejecucion en RTX 4090 u otras consumer; el requisito real lo marca el verificador de 27 B, no el drafter.
- Despliegue: vLLM con `--speculative-config '{"model":"TeenSpirit/Qwen3.8-27B-speculator.dspark-MXFP4A16","num_speculative_tokens":7,"method":"dspark"}'`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; el autor solo reporta longitudes de aceptacion y tokens por paso de verificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | AL media greedy | Licencia |
|---|---:|---|---:|---:|---|
| TeenSpirit/Qwen3.8-27B-speculator.dspark-MXFP4A16 | 1,99 B | MXFP4A16 (compressed-tensors) | 1,2 GB | 4,34 | Apache 2.0 |
| RedHatAI/Qwen3.8-27B-speculator.dspark (base) | 1,99 B | bf16 | 4,0 GB | 4,35 | Apache 2.0 |

No se dispone de informacion sobre otros drafters comparables (por ejemplo, variantes EAGLE o Medusa para Qwen3.8-27B) en los datos proporcionados, por lo que la comparativa se limita al checkpoint base del que deriva esta cuantizacion.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un verificador Qwen3.8-27B no produce respuestas utiles; su calidad se mide en aceptacion, no en exactitud de tarea.
- Cuantizacion sin calibracion: round-to-nearest con escalas min/max puede degradar mas que GPTQ o AWQ en otros dominios no cubiertos por Spec-Bench; el error de Frobenius medio por capa es del 11,3 %.
- Cobertura de benchmark limitada: seis subsets de Spec-Bench con 80 prompts cada uno; no hay evaluacion en MMLU, HumanEval, GSM8K ni en tareas multimodales.
- Compatibilidad de hardware parcial: probado solo en H20 (Hopper); en Blackwell no verificado. En Hopper el beneficio es de memoria, no de computo FP4 nativo.
- Dependencia de version: validado con vLLM 0.33.0; otras versiones pueden requerir ajustes en el kernel o en la configuracion de cuantizacion.
- Sin datos de sesgos, idiomas soportados ni comportamiento multilingue especifico del drafter; hereda los del checkpoint base, no documentados aqui.
- Publicacion comunitaria: no es una release de Red Hat; para produccion conviene validar contra el checkpoint bf16 original en el dominio propio.
- Riesgo de alucinacion: no aplica de forma directa al drafter, pero las propuestas rechazadas por el verificador pueden introducir coste computacional adicional si la tasa de aceptacion cae en dominios fuera de distribucion.
- Licencia Apache 2.0 permisiva para uso comercial, heredada del checkpoint base; conviene verificar las condiciones del modelo verificador Qwen3.8-27B por separado.

## Enlaces

- Hugging Face: https://huggingface.co/TeenSpirit/Qwen3.8-27B-speculator.dspark-MXFP4A16
- Modelo base: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo verificador: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
