# TeenSpirit/Qwen3.8-27B-speculator.dspark-W4A16

## Resumen

Qwen3.8-27B-speculator.dspark-W4A16 es una re-cuantizacion INT4 weight-only del "speculator" (modelo borrador para decodificacion especulativa) DSpark asociado a Qwen/Qwen3.8-27B. Lo publica el usuario TeenSpirit en HuggingFace como artefacto de comunidad, no como release oficial de Red Hat, que es quien entreno y publico el checkpoint original RedHatAI/Qwen3.8-27B-speculator.dspark. El modelo no es un LLM autonomo: es un draft model de aproximadamente 1.990 millones de parametros que propone tokens candidatos que el verificador de 27B valida en cada paso de decodificacion.

La relevancia es practica: reduce el checkpoint de 4,0 GB en bf16 a 1,2 GB en INT4 manteniendo, segun las mediciones del autor, la longitud de aceptacion (acceptance length, AL) del original. Eso permite desplegar decodificacion especulativa con un verificador grande en GPUs con menos memoria disponible para el borrador, o liberar VRAM para aumentar el tamano de batch o el numero de tokens especulativos.

La arquitectura y el entrenamiento son integramente los del checkpoint base; esta version solo cambia el formato de almacenamiento de los pesos de proyeccion. La licencia es Apache 2.0, heredada del checkpoint original. El modelo esta etiquetado para la libreria `speculators` y requiere `custom_code` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model DSpark para decodificacion especulativa (detalles arquitectonicos del checkpoint base no disponibles) |
| Parametros totales | 1.988.431.617 (1,99 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (W4A16), simetrica, group size 128; activaciones en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` (int4 empaquetado en int32: `weight_packed` / `weight_scale` / `weight_shape`) |

## Arquitectura y entrenamiento

El checkpoint es un speculator DSpark: un modelo borrador disenado para proponer varios tokens por paso de decodificacion que el modelo verificador (Qwen3.8-27B en bf16 denso) acepta o rechaza. La model card no detalla la arquitectura interna del borrador; unicamente documenta que incluye un `markov_head` y un `confidence_head`, ademas de las capas transformer habituales (`layers.*.self_attn.{q,k,v,o}_proj` y `layers.*.mlp.{gate,up,down}_proj`). No se especifican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al checkpoint base RedHatAI/Qwen3.8-27B-speculator.dspark y no esta disponible en la informacion proporcionada.

La innovacion de esta version es exclusivamente la cuantizacion. Se aplico round-to-nearest sin calibracion (escalas min/max) mediante las primitivas de `compressed-tensors`, siguiendo su ejemplo `compress_w4a16.py`. Se cuantizaron 1,86 B de los 1,99 B parametros (todas las proyecciones de atencion y MLP, mas la capa `fc`); se mantuvieron en bf16 `markov_head.*`, `confidence_head.*` y todas las normalizaciones. El error relativo de Frobenius medio por capa es del 11%. Las listas de ignorados usan regex (`re:.*markov_head.*`, etc.) para que coincidan tanto con los nombres del checkpoint como con los nombres de modulo prefijados con `model.` de vLLM.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa con verificador Qwen3.8-27B; no genera respuestas finales por si mismo.
- Propuesta de hasta 7 tokens especulativos por paso (configuracion medida en la model card).
- Cabezas auxiliares `markov_head` y `confidence_head` en bf16 para el mecanismo de propuesta y puntuacion de confianza del borrador.
- Compatibilidad con decodificacion greedy (temperature 0) y con muestreo (temperature 1.0, top_p 0.95, top_k 20).
- Integracion con vLLM mediante `--speculative-config` con `method: dspark`.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues propias: hereda el comportamiento del verificador, no del borrador.
- No es un modelo de chat ni de instrucciones; su unica funcion es acelerar la inferencia del verificador.

## Casos de uso

- Aceleracion de inferencia de Qwen3.8-27B en produccion: desplegar el verificador con `--speculative-config` apuntando a este borrador para reducir el numero de pasos de decodificacion. La AL media medida es 4,33 en greedy y 3,40 en muestreo, lo que implica que cada paso del verificador rinde de media mas de 4 tokens en greedy.
- Despliegue en GPUs con VRAM limitada: el borrador ocupa 1,2 GB en lugar de 4,0 GB, lo que libera 2,8 GB para pesos del verificador, KV cache o mayor concurrencia.
- Servicio de chat multi-turno (subset `question` de MT-Bench): AL de 3,79 en greedy, adecuado para cargas conversacionales con contexto moderado.
- Traduccion automatica por lotes: AL de 4,34 en greedy en el subset `translation`, el mejor resultado de la tabla, apropiado para pipelines de traduccion de alto volumen.
- Razonamiento matematico: AL de 5,35 en greedy y 4,30 en muestreo en `math_reasoning`, el subset con mayor aceptacion; util en entornos de generacion de soluciones paso a paso con thinking habilitado.
- RAG sobre documentacion: AL de 4,64 en greedy en el subset `rag`, con buen rendimiento en prompts largos con contexto recuperado.
- Resumen de documentos: AL de 3,80 en greedy en `summarization`, para tareas de compresion de texto con salidas largas.
- Evaluacion comparativa de tecnicas de cuantizacion: el checkpoint incluye `ptq_rtn_stats.json` y resultados pareados por prompt, util como referencia reproducible de cuantizacion W4A16 en draft models.

## Benchmarks y rendimiento

Mediciones de la model card en Spec-Bench (subsets de RedHatAI/speculator_benchmarks, 80 prompts cada uno), verificador Qwen/Qwen3.8-27B denso en bf16, vLLM 0.33.0, 1x NVIDIA H20, 7 tokens especulativos, thinking habilitado, `max_tokens` 4096, concurrencia 64. AL = acceptance length.

Greedy (temperature 0):

| Dataset | bf16 AL | W4A16 AL |
|---|---:|---:|
| question (MT-Bench) | 3,73 | 3,79 |
| translation | 4,44 | 4,34 |
| summarization | 3,83 | 3,80 |
| qa | 4,16 | 4,07 |
| math_reasoning | 5,36 | 5,35 |
| rag | 4,59 | 4,64 |
| media | 4,35 | 4,33 |

Muestreo (temperature 1.0, top_p 0.95, top_k 20):

| Dataset | bf16 AL | W4A16 AL |
|---|---:|---:|
| question | 2,94 | 2,99 |
| translation | 3,44 | 3,49 |
| summarization | 3,20 | 3,20 |
| qa | 2,93 | 2,92 |
| math_reasoning | 4,38 | 4,30 |
| rag | 3,45 | 3,49 |
| media | 3,39 | 3,40 |

Comparacion pareada por prompt (480 prompts) de tokens de salida por paso de verificacion: W4A16 menos bf16 de -0,021 +/- 0,034 (greedy) y +0,013 +/- 0,043 (muestreo) al 95% de confianza; el coste de la cuantizacion no es medible a esta escala. No se han publicado resultados de benchmarks de calidad del modelo verificador (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: 1,2 GB en INT4 W4A16 (frente a 4,0 GB del bf16 original). Hay que sumar la VRAM del verificador Qwen3.8-27B, no cuantificado en esta configuracion (bf16 denso).
- GPU recomendadas: NVIDIA H20 (Hopper) es la plataforma validada por el autor. vLLM usa el kernel Machete en Hopper y Marlin en otras arquitecturas, por lo que se espera compatibilidad con A100, H100 y GPUs Ampere o superiores.
- GPU de consumo: el borrador por si solo cabe en cualquier GPU consumer con mas de 2 GB libres, pero el requisito real lo marca el verificador de 27B en bf16, que excede la VRAM de GPUs consumer habituales.
- Despliegue: vLLM 0.33.0 con `--speculative-config '{"model":"TeenSpirit/Qwen3.8-27B-speculator.dspark-W4A16","num_speculative_tokens":7,"method":"dspark"}'`. Requiere `custom_code` y la libreria `speculators`.
- Latencia y throughput: no se publican cifras de latencia ni tokens por segundo en la informacion disponible; solo se reporta la acceptance length.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | AL media (greedy) | Licencia |
|---|---|---:|---:|---:|---|
| TeenSpirit/Qwen3.8-27B-speculator.dspark-W4A16 | 1,99 B | INT4 W4A16 | 1,2 GB | 4,33 | Apache 2.0 |
| RedHatAI/Qwen3.8-27B-speculator.dspark (base) | 1,99 B | bf16 | 4,0 GB | 4,35 (re-medicion del autor) | Apache 2.0 |
| Otros speculators para Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es contra el checkpoint bf16 del que deriva; no se dispone de datos de otros draft models alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no responde consultas ni genera texto final; solo propone tokens para un verificador compatible (Qwen3.8-27B).
- La cuantizacion introduce un error relativo de Frobenius medio del 11% por capa; aunque la AL no se degrada de forma medible en los subsets evaluados, no se han probado dominios fuera de Spec-Bench.
- Es una re-cuantizacion de comunidad, no un release oficial de Red Hat; no hay garantia de mantenimiento ni de soporte.
- Requiere `custom_code` y `trust_remote_code` en el cargador, lo que implica ejecutar codigo del repositorio.
- Los resultados de AL se midieron en una unica configuracion (H20, vLLM 0.33.0, 7 tokens especulativos, concurrencia 64); el rendimiento puede variar con otra GPU, version de vLLM o numero de tokens especulativos.
- La model card no documenta sesgos, riesgos de alucinacion ni cobertura idiomatica del borrador; esos riesgos dependen del verificador Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del modelo verificador antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/TeenSpirit/Qwen3.8-27B-speculator.dspark-W4A16
- Modelo base: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo verificador: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
