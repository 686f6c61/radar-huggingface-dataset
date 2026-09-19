# xautonomics/Inkling-Small-UD-Q4_K_M.LAYR.GGUF

## Resumen

Inkling-Small-UD-Q4_K_M.LAYR.GGUF es una biblioteca GGUF por capas del modelo `thinkingmachines/Inkling-Small`, publicado por el usuario `xautonomics`. No es un modelo nuevo, sino una reempaquetado de los pesos cuantizados de `unsloth/Inkling-Small-GGUF` (cuantizacion dinamica `UD-Q4_K_M`), cortados una sola vez en un archivo por bloque transformer mas los tensores compartidos, de modo que cualquier ventana contigua de capas `[A, B)` puede ensamblarse en tiempo de carga. La innovacion es de formato y despliegue, no de entrenamiento: los pesos son byte a byte los del origen y no se ha recuantizado nada.

El modelo subyacente es un mixture-of-experts de la familia `inkling` de Thinking Machines Lab, con 276 000 millones de parametros totales y 12 000 millones activos, 42 bloques (los 2 primeros densos), 256 expertos enrutados (6 activos mas 2 compartidos) y una sliding window de 512. El paquete esta pensado para `dreamcatcher`, el fork de `ik_llama.cpp` de xAutonomics, que sirve la biblioteca bien en un unico proceso o repartida entre varios hosts conectados por red.

Su relevancia ahora es practica: permite desplegar un MoE de gran tamano troceado por capas sobre hardware limitado, repartiendo el modelo entre varias maquinas o GPUs sin necesidad de cargar los 152 GiB en un solo nodo, con verificacion de integridad por hash (blake2b-128) por archivo y por tensor. El repositorio es muy reciente (creado el 19 de septiembre de 2026) y no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), familia `inkling`; 42 bloques (2 densos iniciales), 256 expertos enrutados, 6 activos + 2 compartidos, sliding window de 512, sin bloque NextN/MTP |
| Parametros totales | 276 000 millones (model card de la base); la metadata de HuggingFace del repo reporta 245 424 385 (discrepancia, ver limitaciones) |
| Parametros activos | 12 000 millones |
| Longitud de contexto | No disponible (solo se documenta una sliding window de 512 por bloque; no se especifica contexto total) |
| Tipos de cuantizacion | `UD-Q4_K_M` (cuantizacion dinamica de Unsloth); 45 archivos GGUF, 151,9 GiB |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, biblioteca por capas (llama.cpp / ik_llama.cpp); cada bloque en `blk-NNNNN.gguf` mas `parts-*.gguf` y `manifest.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con enrutado por mezcla de expertos: 42 bloques, de los cuales los dos primeros son densos, 256 expertos enrutados con 6 activos mas 2 compartidos, y atencion con sliding window de 512. No incorpora bloque NextN/MTP. El modelo base fue desarrollado por Thinking Machines Lab y cuantizado posteriormente por Unsloth con su esquema dinamico `UD-Q4_K_M`; `xautonomics` no ha modificado los tensores, solo los ha rebanado en una biblioteca por capas usando `layer_distribution.slice` en el commit `11c4f7a5` de dreamcatcher.

En cuanto a datos de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO), no se dispone de informacion en la documentacion proporcionada: la model card describe el proceso de troceado y validacion de despliegue, no el entrenamiento del modelo base. La innovacion tecnica destacable es la del propio paquete: slicing por capa con integridad verificable (hash blake2b-128 por archivo completo y por tensor), soporte de expertos enrutados remotos (byte-exacto frente a expertos en proceso) y un anillo de etapas (`llama-stage-runner`) que intercambia estados ocultos por TCP para servir un rango de capas por host.

## Capacidades

- Generacion de texto conversacional: la etiqueta del repositorio incluye `conversational`; es la unica capacidad funcional explicitamente declarada.
- Inferencia de un MoE de 276B con solo 12B de parametros activos por token, lo que reduce el coste de computo por token.
- Servicio por ventana de capas: carga parcial de un rango `[A, B)` para repartir el modelo entre procesos o hosts.
- Servicio multi-host en anillo: `llama-stage-runner` con roles `head` y `tail` intercambiando estados ocultos por TCP.
- Expertos enrutados remotos: el expert-server es byte-exacto respecto a expertos en proceso.
- Verificacion de integridad: `manifest.json` con hash por archivo y por tensor.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles.
- Vision o audio: no soportado; el port es solo texto y no incluye los proyectores `mmproj-*` del repositorio origen.
- Modo "thinking": no disponible.

## Casos de uso

- Despliegue de un MoE de 276B repartido entre varios hosts: usando `llama-stage-runner` en anillo, se asigna una ventana de capas a cada maquina (por ejemplo `--layers 0,21` y `--layers 21,42`) para servir el modelo completo cuando ninguna maquina dispone de VRAM para los 152 GiB.
- Inferencia de un solo proceso en un nodo grande: `llama-server --model-dir /models/Inkling-Small-UD-Q4_K_M.LAYR.GGUF` carga la biblioteca completa donde si hay memoria suficiente.
- Planificacion de reparto por hardware: `python3 -m layer_distribution.plan ... --node a:... --node b:...` permite calcular un reparto de capas segun los recursos de cada nodo antes de lanzar el servicio.
- Verificacion previa al arranque en produccion: `layer_distribution.verify` comprueba el hash de cada archivo y tensor contra `manifest.json`, util en pipelines de despliegue que descargan pesos grandes.
- Investigacion sobre enrutado de expertos: el soporte de expert-server remoto permite estudiar el trafico de expertos y el coste de moverlos fuera del proceso.
- Servicio conversacional en entornos de laboratorio: al ser un modelo con etiqueta `conversational`, puede usarse para prototipos de dialogo, asumiendo que no hay benchmarks publicados que respalden su calidad.
- Reproduccion determinista de despliegues: la integridad por hash y la exigencia de no renombrar los archivos (`blk-NNNNN.gguf` / `parts-*.gguf` / `manifest.json`) facilitan despliegues reproducibles y auditables.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad tipo MMLU, HumanEval o GSM8K. Los unicos numeros disponibles son metricas de validacion del propio port frente a un oraculo (build borrador de llama.cpp, PR ggml-org/llama.cpp#25731), medidas sobre el GGUF monolitico de origen:

| Metrica | Valor |
|---|---|
| Ruta de atencion enmascarada D2 — acuerdo top-1 con el oraculo | 83,02 % |
| Ruta de atencion por bandas D3 — acuerdo top-1 con el oraculo | 83,87 % |
| Banda de trabajo pre-registrada (auto-desacuerdo masked-vs-banded del oraculo) | 17,08 % |
| Paridad de tokens greedy contra el build upstream | No validada todavia (issue #43) |
| Carga ensamblada desde la biblioteca | No registrada aun |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Peso de los archivos: 151,9 GiB en 45 archivos GGUF (fuente monolitica `UD-Q4_K_M`: 151,4 GiB en 5 shards).
- VRAM estimada para inferencia en un solo host: no cabe en una GPU de 80 GB; se necesitan al menos 2-3 GPUs de 80 GB (H100, A100 80 GB) para los pesos, mas margen para KV cache y activaciones.
- GPU recomendadas: H100 80 GB o A100 80 GB en configuracion multi-GPU; se puede valorar hardware profesional con 48-96 GB por tarjeta segun reparto.
- GPU de consumo: no cabe en ninguna RTX de consumo (4090 con 24 GB, etc.); solo es viable repartiendo por capas entre varias maquinas.
- Despliegue multiproceso/multihost: `llama-stage-runner` (dreamcatcher, fork de `ik_llama.cpp`) con roles `head`/`tail`; requiere enlaces de nodo a nodo de baja latencia y directos.
- Despliegue monoproceso: `llama-server --model-dir ...`.
- Integridad: `python3 -m layer_distribution.verify` contra `manifest.json`.
- Latencia y throughput: no disponibles; la model card no aporta cifras de tokens por segundo ni latencia por token.
- Otros backends (Vulkan, SYCL, solo CPU): no medidos para esta arquitectura.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparativa fiable. La unica comparacion documentada es la del propio paquete frente a su fuente monolitica:

| Formato | Parametros | Cuantizacion | Tamano | Carga | Verificacion | Multihost |
|---|---|---|---|---|---|---|
| Inkling-Small-UD-Q4_K_M.LAYR.GGUF (este repo) | 276B totales / 12B activos | UD-Q4_K_M | 151,9 GiB (45 archivos) | Por ventana `[A, B)` | blake2b-128 por archivo y tensor | Si (anillo head/tail) |
| unsloth/Inkling-Small-GGUF (fuente) | 276B totales / 12B activos | UD-Q4_K_M | 151,4 GiB (5 shards) | Monolitica | SHA-256 de shards en el Hub | No documentado |

Comparativa con otros modelos de la misma categoria (por ejemplo otros MoE de ~250-300B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no aborda sesgos del modelo base.
- Riesgo de alucinacion: no evaluado ni documentado; no hay benchmarks de calidad publicados.
- Multimodalidad: no soportada. El port es solo texto y no incluye los proyectores `mmproj-*` del repositorio origen (audio/vision quedan fuera).
- Paridad de tokens greedy: aun no validada contra el build upstream de llama.cpp (issue #43).
- Validacion del ensamblado: las metricas citadas (83,02 % / 83,87 %) se midieron sobre el GGUF monolitico de origen, no sobre la carga ensamblada de esta biblioteca; los numeros de la biblioteca no estan en registro.
- Compatibilidad restringida: solo se soportan los archivos de `huggingface.co/xautonomics`; otras GGUFs o bibliotecas troceadas por terceros pueden cargar pero sin soporte.
- No renombrar archivos: el cargador espera exactamente `blk-NNNNN.gguf` / `parts-*.gguf` / `manifest.json`.
- Backends no medidos: Vulkan, SYCL y solo CPU no estan evaluados para esta arquitectura; las mediciones son con CUDA.
- Discrepancia de parametros: la metadata de HuggingFace del repo indica 245 424 385 parametros, muy por debajo de los 276B del modelo base; conviene tratarla con cautela y verificar la fuente.
- Licencia: apache-2.0 en este repo, pero conviene revisar los terminos del modelo base `thinkingmachines/Inkling-Small` y de la cuantizacion de Unsloth antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 "likes" en el momento de la consulta; soporte y validacion en curso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xautonomics/Inkling-Small-UD-Q4_K_M.LAYR.GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Cuantizacion de origen (Unsloth): https://huggingface.co/unsloth/Inkling-Small-GGUF (revision `1a19ef82`, subcarpeta `UD-Q4_K_M`)
- dreamcatcher (fork de ik_llama.cpp): https://github.com/xautonomics-inc/dreamcatcher
- Commit del slicer: https://github.com/xautonomics-inc/dreamcatcher/commit/11c4f7a5b92bb7f070ccc93b8a302492df565a76
- Issue de seguimiento del port de texto: https://github.com/xautonomics-inc/dreamcatcher/issues/43
- Build borrador de llama.cpp para el oraculo: https://github.com/ggml-org/llama.cpp/pull/25731
- Sitio del autor: https://xautonomics.com

Nota: la busqueda web no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos correspondian a listados de automoviles Audi Q3 y no guardan relacion con el contenido).
