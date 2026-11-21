# Yuuyuuyuuyuu/Swift-Qwen3.8-27B-OrcaRouter-NVFP4-DFlash2-ninfer

## Resumen

Swift-Qwen3.8-27B-OrcaRouter-NVFP4-DFlash2-ninfer es un lanzamiento de la comunidad publicado por el usuario Yuuyuuyuuyuu sobre el checkpoint `ukisai/Swift-Qwen3.8-27b`, que a su vez deriva de la familia Qwen3.8-27B. No es un checkpoint oficial de UkisAI ni de OrcaRouter: se trata de una transformacion de direccion unica al estilo OrcaRouter aplicada sobre el modelo Swift, empaquetada en formato nativo NInfer con pesos mixtos NVFP4/FP8 y una cabeza de decodificacion especulativa DFlash2 embebida con ventana K=7.

El artefacto pesa 23,72 GB (22,09 GiB) y esta pensado exclusivamente para servirse con el runtime NInfer, no con Transformers ni llama.cpp. La cabeza DFlash2 procede del companero upstream de Qwen3.8 y no fue reentrenada para Swift, por lo que la tasa de aceptacion especulativa depende del tipo de carga de trabajo. El modelo se distribuye como "uncensored" y con licencia `swift-open-license-v1.0`.

Su relevancia actual es practica: demuestra un perfil de servicio de alto rendimiento sobre una GPU de consumo (RTX 5090) con cuantizacion de 4 bits en formato NVFP4 y decodificacion especulativa integrada en el propio fichero, sin necesidad de descargar un modelo borrador separado. Los benchmarks publicados miden rendimiento de serving, no calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8-27B); transformacion de direccion unica estilo OrcaRouter sobre el checkpoint Swift |
| Parametros totales | 27B (segun denominacion de la familia; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 131.072 tokens en el benchmark de corpus; 16.384 en las pruebas de throughput; configurable via `--max-context` |
| Tipos de cuantizacion | Mixta NVFP4/FP8 (pesos); KV cache en FP8 o INT8-group64 segun configuracion |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-v1.0 (etiquetada como `other`) |
| Formato de pesos | `.ninfer` (contenedor NInfer v2); no compatible con GGUF, safetensors ni llama.cpp |
| Decodificacion especulativa | DFlash2 embebida, K=7 recomendado |
| Tamano del fichero | 23,72 GB (22,09 GiB) |
| SHA-256 | `b57bb82f6c43fa4bba3bcb883f45ccff12b81fd461502a37c79d78c3ba7a979b` |
| Vision | Soportada mediante flag `--vision` en NInfer |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la pertenencia a la familia Qwen3.8-27B. El modelo base `ukisai/Swift-Qwen3.8-27b` es un fine-tune de esa familia, y este lanzamiento aplica sobre el una transformacion de direccion unica al estilo OrcaRouter. No se especifican volumen de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica destacable es el empaquetado: pesos mixtos NVFP4/FP8 en un contenedor NInfer v2 con una cabeza especulativa DFlash2 integrada en el propio fichero del modelo. Esto elimina la necesidad de gestionar un modelo borrador aparte. La contrapartida es que la cabeza no fue reentrenada para este checkpoint concreto, de modo que la aceptacion especulativa varia con el dominio: en las pruebas publicadas va del 16,7 % en generacion de relatos al 81,2 % en salidas estructuradas. El runtime requiere una build de NInfer compatible con contenedores v2; las builds actuales solo v3 no cargan este fichero directamente.

## Capacidades

- Generacion de texto en modo chat y completado, con soporte de razonamiento de cadena larga (se documentan generaciones de hasta 65.536 tokens).
- Entrada de imagen mediante el flag `--vision` del servidor NInfer.
- Decodificacion especulativa DFlash2 integrada con ventana K=7, sin modelo borrador externo.
- Servicio HTTP mediante `ninfer-serve` en host y puerto configurables.
- Contexto largo configurable, validado hasta 131.072 tokens en el benchmark de corpus.
- Perfil "uncensored": el autor lo etiqueta explicitamente como tal, sin detallar el alcance de la relajacion de filtros.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible; el benchmark incluye una carga de traduccion, pero no se enumeran idiomas.

## Casos de uso

- Generacion de salidas estructuradas (JSON, esquemas): es la carga con mejor rendimiento medida, 387,9 tok/s y 81,2 % de aceptacion especulativa, lo que la hace adecuada para extraccion de datos y rellenado de formularios en pipelines automatizados.
- Generacion de codigo en produccion: 277,4 tok/s y 53,9 % de aceptacion en la carga de codigo; encaja en asistentes de IDE o revision automatizada siempre que el backend sea NInfer.
- Traduccion automatica por lotes: 258,8 tok/s y 48,9 % de aceptacion en la carga de traduccion del corpus de referencia, con contexto largo para documentos completos.
- Razonamiento largo con requisitos de latencia: las pruebas AIME sostienen entre 206,9 y 330,2 tok/s en generaciones de decenas de miles de tokens, util para analisis de documentos extensos o generacion de informes.
- Servicio local en estacion de trabajo con GPU de consumo: el fichero de 23,72 GB y los 475,58 tok/s de generacion a 512 tokens de prompt permiten desplegar un asistente privado en una RTX 5090 sin infraestructura de centro de datos.
- Procesamiento de imagenes con texto: con `--vision` activado, el modelo puede recibir imagenes junto al prompt para tareas de descripcion o extraccion de informacion, aunque no se publican metricas de calidad para vision.
- Experimentacion con decodificacion especulativa: la aceptacion medida por dominio (16,7 % a 81,2 %) sirve para evaluar el impacto de DFlash2 en cargas propias antes de adoptarlo en produccion.

## Benchmarks y rendimiento

Los datos publicados miden rendimiento de serving, no calidad del modelo. Fueron obtenidos en una RTX 5090 conectada por PCIe 5.0 x8 (no x16), sin correccion posterior.

Throughput nativo con `ninfer_bench` (DFlash2 K=7, 128 tokens generados, KV en BF16, contexto 16.384, prefilling en bloques de 512, revision `d4929686`):

| Tokens de prompt | Generacion | Prefill | Primer token | Peticion total |
| ---: | ---: | ---: | ---: | ---: |
| 512 | 475,58 tok/s | 9.756,06 tok/s | 0,0525 s | 0,3198 s |
| 4.096 | 468,34 tok/s | 9.099,31 tok/s | 0,4502 s | 0,7216 s |

Benchmark de corpus de 75 peticiones (concurrencia 1, contexto 131.072, KV INT8-group64, temperatura 0,6, top-p 0,95, top-k 20, revision `03177b91`):

| Metrica | Resultado |
| --- | ---: |
| Peticiones completadas | 75 / 75 |
| Peticiones fallidas | 0 |
| Throughput de decodificacion del corpus | 217,0 tok/s |
| Aceptacion DFlash2 | 40,9 % |
| Tokens de completion | 782.783 |
| Makespan total | 3.607,69 s |

Desglose por carga de trabajo:

| Carga | Muestras | Throughput | Aceptacion DFlash2 |
| --- | ---: | ---: | ---: |
| Codigo | 15 | 277,4 tok/s | 53,9 % |
| Relato | 15 | 126,9 tok/s | 16,7 % |
| Traduccion | 15 | 258,8 tok/s | 48,9 % |
| Estructurado | 15 | 387,9 tok/s | 81,2 % |

Fixtures de razonamiento largo:

| Fixture | Muestras | Tokens medios | Throughput | Aceptacion | Finalizacion |
| --- | ---: | ---: | ---: | ---: | --- |
| AIME 2026 #1 | 5 | 1.262,6 | 330,2 tok/s | 66,4 % | 5/5 stop |
| AIME 2026 #15 | 5 | 65.536,0 | 206,9 tok/s | 39,1 % | 5/5 limite de salida |
| AIME 2026 #30 | 5 | 53.927,8 | 232,0 tok/s | 45,0 % | 4/5 stop, 1/5 limite |

Referencia del Qwen3.8-27B NVFP4 + DFlash2 K=7 de stock de NInfer en el mismo perfil de RTX 5090: 192,5 tok/s de decodificacion de corpus y 37,0 % de aceptacion. Este upload mide 217,0 tok/s y 40,9 %, respectivamente.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que no reclama ninguna puntuacion de precision en AIME.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero de pesos ocupa 23,72 GB, a lo que se suma la KV cache (FP8 o INT8-group64) y el estado del runtime. Con contexto de 131.072 tokens la demanda crece de forma significativa.
- GPU validada: NVIDIA RTX 5090 (arquitectura Blackwell, necesaria para NVFP4), en configuracion PCIe 5.0 x8.
- GPU recomendadas por el autor: no disponible. Las GPUs sin soporte nativo de NVFP4 no pueden ejecutar estos pesos tal cual.
- Cabe en GPU de consumo: si, al menos en RTX 5090 segun las pruebas publicadas.
- Despliegue: exclusivamente mediante NInfer (`ninfer-serve`), con build compatible con contenedores v2 y soporte de Qwen3.8-27B NVFP4 y DFlash2. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: 475,58 tok/s de generacion y 9.756,06 tok/s de prefill con prompt de 512 tokens; 217,0 tok/s de decodificacion en el corpus de 75 peticiones con concurrencia 1. El tiempo de primer token de `ninfer_bench` es preparacion nativa mas prefill, no TTFT de streaming HTTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Formato |
| --- | --- | --- | --- | --- | --- |
| Este upload (Swift-Qwen3.8-27B OrcaRouter NVFP4 DFlash2) | 27B | hasta 131.072 | 217,0 tok/s corpus; 40,9 % aceptacion | swift-open-license-v1.0 | `.ninfer` v2 |
| Qwen3.8-27B NVFP4 + DFlash2 K=7 de stock (NInfer) | 27B | no disponible | 192,5 tok/s corpus; 37,0 % aceptacion | no disponible | NInfer |
| Swift-Qwen3.8-27b (modelo base) | 27B | no disponible | no disponible | no disponible | no disponible |

La comparativa de calidad con alternativas de la misma categoria no esta disponible: no se publican resultados de benchmarks de calidad para ninguno de los tres, y las cifras de rendimiento corresponden a perfiles de serving distintos o no documentados.

## Limitaciones y advertencias

- Es un lanzamiento de terceros, no oficial de UkisAI ni de OrcaRouter; el autor lo declara explicitamente.
- La cabeza DFlash2 no fue reentrenada para Swift: la aceptacion especulativa cae al 16,7 % en generacion de relatos frente al 81,2 % en salidas estructuradas, por lo que el rendimiento depende fuertemente de la carga.
- Formato propietario `.ninfer`: no se puede cargar con Transformers, llama.cpp, vLLM ni Ollama, y requiere una build concreta de NInfer. Las builds actuales solo v3 no son compatibles con este artefacto v2.
- Dependencia de hardware Blackwell para NVFP4; no hay datos de ejecucion en otras GPU.
- Los benchmarks se tomaron en PCIe 5.0 x8 y no se corrigieron a x16; no deben extrapolarse sin mas a otras configuraciones.
- No hay datos publicados de calidad, sesgos, tasa de alucinacion ni cobertura idiomatica.
- Etiqueta "uncensored": implica filtros de seguridad relajados, con el riesgo asociado en produccion y en cumplimiento normativo.
- Licencia `swift-open-license-v1.0` etiquetada como `other`: es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- El contexto maximo validado (131.072 tokens) exige VRAM adicional considerable por la KV cache; el ejemplo de arranque usa 8.192 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yuuyuuyuuyuu/Swift-Qwen3.8-27B-OrcaRouter-NVFP4-DFlash2-ninfer
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Runtime NInfer (repositorio): https://github.com/Neroued/ninfer
- NInfer, guia de inicio rapido: https://github.com/Neroued/ninfer#quick-start
- NInfer, revision usada en el ejemplo: https://github.com/Neroued/ninfer/tree/d49296868dcc17bd478ec185f0d3a801bcc0bf56
- NInfer, revision usada en el benchmark de corpus: https://github.com/Neroued/ninfer/tree/03177b910e70f783b00c4f980ce0d1896a6b8592
