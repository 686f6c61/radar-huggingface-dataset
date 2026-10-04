# VirVen/Qwen3.6-27B-DFlash_v2

## Resumen

Qwen3.6-27B-DFlash_v2 es un modelo borrador (draft model) de decodificacion especulativa publicado por el usuario VirVen en HuggingFace. No es un modelo de chat autonomo: es un artefacto de 1.924.404.480 parametros (unos 1,92 B) en bfloat16 que se acopla al verificador Qwen/Qwen3.6-27B para acelerar su inferencia mediante el algoritmo DFLASH, segun la implementacion DFlash2.

Su relevancia es practica. La decodificacion especulativa permite proponer varios tokens por cada paso del verificador, y el autor reporta una tasa media de aceptacion (tau) de 3,01888 y un rendimiento de 394,60 tokens/s de salida sobre una NVIDIA H200 con SGLang, con 0 fallos en 5.120 peticiones medidas. Eso se traduce en un TPOT medio de 7,033 ms y un TTFT p50 de 122,62 ms con una longitud de contexto objetivo de 24.576 tokens.

El repositorio no incluye el verificador, el tokenizer, los prompts ni los datos de entrenamiento. Su licencia figura como "other" sin terminos detallados, esta etiquetado para ruso e ingles, y su uso exige un runtime con soporte nativo de DFLASH (SGLang o vLLM con `method: dflash`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador DFlash2 para decodificacion especulativa; 5 capas draft, hidden size 5.120, vocabulario de 248.320; no es un transformer causal autonomo |
| Parametros totales | 1.924.404.480 (~1,92 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 24.576 tokens en la validacion publicada (contexto objetivo del servicio junto al verificador; el borrador no define ventana propia) |
| Tipos de cuantizacion | no disponible; el export publicado esta en bfloat16 |
| Idiomas soportados | ruso, ingles (etiquetas ru, en) |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | safetensors (bfloat16), export `DFlash2DraftModel` |

## Arquitectura y entrenamiento

El borrador es un modulo de propuesta de tokens para decodificacion especulativa con fusion de caracteristicas del verificador. Su geometria declarada es de cinco capas draft con hidden size 5.120 y vocabulario de 248.320, y consume las capas auxiliares del verificador `[5, 19, 33, 47, 61]` de un Qwen3.6 de 64 capas. Trabaja con un block size DFLASH fijo de 8 y un token de mascara con id 248.070. La model card insiste en que el block size y la profundidad especulativa no deben modificarse de forma independiente al contrato con el que fue entrenado.

El checkpoint publicado es el artefacto de menor perdida del run descrito como "89.184 estados de dataset_100k + 1.920 estados retenidos de dataset_150", en el paso 11.388. No se proporcionan datos sobre numero total de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, ni hardware de entrenamiento. El export esta en bfloat16 e incluye un `export_manifest.json` con el checkpoint de origen y sumas de verificacion.

## Capacidades

- Generacion de texto: no. El borrador no genera respuestas por si mismo; solo propone tokens que el verificador valida.
- Aceleracion de inferencia: reduce el coste por token del verificador Qwen3.6-27B mediante decodificacion especulativa con block size 8.
- Aceptacion multi-token: tasa media de aceptacion (tau) de 3,01888 en la validacion publicada, con desviacion estandar de 0,01142.
- Multilingue: etiquetado para ruso e ingles; no hay detalle sobre el resto de idiomas cubiertos por el verificador.
- Tool calling / function calling: no disponible (capacidad del verificador, no del borrador).
- Agentes y razonamiento multi-paso: no disponible (capacidad del verificador).
- Vision, audio o modo thinking: no disponible; el comando de servicio sugerido incluye `--language-only`, lo que apunta a un uso solo texto.

## Casos de uso

- Servicio de chat interactivo de baja latencia: con un TPOT p50 de 7,033 ms y un TTFT p50 de 122,62 ms sobre una H200, el borrador es adecuado para asistentes conversacionales donde la percepcion de fluidez depende del tiempo entre tokens.
- Traduccion y generacion de texto ruso-ingles en produccion: las etiquetas del repositorio (ru, en) y el contexto objetivo de 24.576 tokens lo situan como opcion para pipelines de traduccion con documentos de entrada largos.
- Procesamiento de documentos extensos: fragmentos de hasta 24.576 tokens pueden servirse con una sola instancia y paralelismo de tensor 1, util para resumen y extraccion sobre contratos o informes.
- Reduccion de coste en flotas de GPU: al elevar el rendimiento hasta 394,60 tokens/s por instancia, se reduce el numero de GPUs necesarias para absorber la misma carga de peticiones.
- Despliegue por lotes con `max_running_requests 32`: sirve cargas agregadas donde interesa exprimir concurrencia antes que latencia individual.
- Entornos con picos de trafico: los 0 fallos sobre 5.120 peticiones medidas con `temperature=0` y 1.024 peticiones medidas por repeticion indican estabilidad bajo carga sostenida.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para comparar tasa de aceptacion y TPOT frente a otros drafts sobre el mismo verificador y el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el artefacto no es un modelo de proposito general. La unica medicion publicada es una prueba de servicio con SGLang sobre una NVIDIA H200 (imagen fijada `lmsysorg/sglang@sha256:f1c2c84099422cfa3bdc91c829627bb02ac99ad82fafe46c6f6f145049c7e682`), contexto objetivo 24.576, block size DFLASH 8, tope de 4 workers de cliente, `temperature=0` y `max_new_tokens` propio de cada carga:

| Variante | RPS por repeticion | RPS medio (SD) | Tokens/s de salida | TTFT p50 (ms) | TPOT p50 (ms) | Tau media (SD) | Fallos |
|---|---|---|---|---|---|---|---|
| DFlash2, 1x H200, SGLang | 3,2267 / 3,2293 / 3,2339 / 3,2161 / 3,2246 | 3,2261 (0,0066) | 394,60 | 122,62 | 7,033 | 3,01888 (0,01142) | 0 / 5.120 |

La carga incluyo 16 peticiones de calentamiento y 1.024 peticiones medidas ilimitadas por repeticion. No se ofrecen comparaciones con otros drafts ni curvas de latencia por percentil mas alla de la mediana.

## Requisitos de hardware

- VRAM del borrador: con 1.924.404.480 parametros en bfloat16, los pesos ocupan aproximadamente 3,85 GB, a los que hay que sumar la cache KV del propio draft. Cifra exacta: no disponible.
- VRAM del verificador: no disponible en la informacion proporcionada; depende del checkpoint Qwen/Qwen3.6-27B y de su cuantizacion.
- GPU validada: una NVIDIA H200 con `--tp-size 1` / `--tensor-parallel-size 1`.
- GPU de consumo: no disponible. El borrador por si solo cabria en GPUs consumer por tamano, pero el verificador y el soporte de DFLASH en el runtime son el factor limitante.
- Opciones de despliegue: SGLang con soporte DFLASH (build con el path DFLASH, por ejemplo instalando desde el repositorio `sgl-project/sglang`) y vLLM con soporte DFlash nativo (`method: dflash`, `attention_backend: flash_attn`). No se menciona compatibilidad con llama.cpp, Ollama, TGI ni transformers estandar.
- Parametros de servicio probados: `--context-length 24576`, `--max-running-requests 32`, `--speculative-dflash-block-size 8`, `num_speculative_tokens: 8`.
- Latencia y throughput: RPS medio 3,2261, 394,60 tokens/s de salida, TTFT p50 122,62 ms, TPOT p50 7,033 ms (medidos en el escenario descrito, no extrapolables a otro hardware).

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparativa se limita a lo que el repositorio declara y al resto de artefactos citados en la busqueda, que no son drafts equivalentes:

| Criterio | Qwen3.6-27B-DFlash_v2 | Otros drafts (EAGLE-3, Medusa, MTP) | Modelos relacionados citados en la busqueda |
|---|---|---|---|
| Parametros | 1.924.404.480 (~1,92 B) | no disponible | no disponible |
| Contexto | 24.576 tokens (objetivo de validacion) | no disponible | no disponible |
| Rendimiento | tau 3,01888; 394,60 tok/s; TPOT 7,033 ms | no disponible | no disponible |
| Licencia | other | no disponible | no disponible |
| Disponibilidad | repositorio HuggingFace, 14 descargas, 0 likes | no disponible | PrismML Ternary Qwen3.6 27B y ThinkingCap-Qwen3.8-27B (citados en resultados de busqueda, sin datos verificables) |

## Limitaciones y advertencias

- No es un modelo autonomo: carece de tokenizer, prompts y pesos del verificador. Cargarlo como modelo causal estandar no funciona.
- Requiere el verificador exacto Qwen/Qwen3.6-27B y un runtime con soporte DFlash2. Builds antiguas de SGLang o vLLM sin el path DFLASH no pueden servirlo.
- El block size DFLASH (8) y la profundidad especulativa (8) forman parte del contrato de entrenamiento y no deben cambiarse sin reentrenar.
- Licencia "other" sin terminos publicados: no hay confirmacion de permisos de uso comercial, redistribucion o modificacion.
- Idioma: solo hay etiquetas ru y en; el comportamiento en otros idiomas depende del verificador y no esta documentado.
- Sin validacion de la comunidad: 14 descargas y 0 likes en el momento de la consulta, con una unica tabla de resultados publicada por el propio autor.
- Ausencia de estandarizacion de benchmarks: no hay MMLU, HumanEval ni comparaciones contra otros drafts, por lo que la mejora real frente a alternativas no es verificable de forma independiente.
- Los resultados de rendimiento corresponden a una H200 unica, `temperature=0`, contexto 24.576 y una carga concreta; no son extrapolables a otros modelos de GPU, temperaturas de muestreo o longitudes de contexto.
- El tamano del repositorio (13,8 GB) es muy superior a los ~3,85 GB que ocuparian los 1.924 millones de parametros en bfloat16, lo que sugiere artefactos adicionales (revisiones, manifiestos u otros ficheros) no descritos en la model card.
- Riesgo de alucinacion y sesgos: no aplica al borrador de forma directa, pero hereda los del verificador, que no se documentan en este repositorio.
- Antes de produccion, la propia model card recomienda ejecutar una prueba de humo de compatibilidad entre draft, verificador y runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VirVen/Qwen3.6-27B-DFlash_v2
- Repositorio de SGLang (runtime con path DFLASH): https://github.com/sgl-project/sglang
- Comando de servicio con vLLM (`method: dflash`): no se proporciona enlace directo en la informacion disponible
- Hilo de LocalLLaMA sobre PrismML Ternary Qwen3.6 27B (contexto sobre el verificador, no sobre este draft): https://www.reddit.com/r/LocalLLaMA/comments/1uwehzt/prismmls_new_ternary_qwen36_27b_runs_near_fp16/
- Recopilatorio de recursos o16g, con mencion a Qwen3.6 27B: https://o16g.com/resources/
- Sitemap de Intelprise, con menciones a variantes Qwen3.x: https://intelprise.com/sitemap/
- Paper o documentacion tecnica de DFlash2: no disponible en la informacion proporcionada
