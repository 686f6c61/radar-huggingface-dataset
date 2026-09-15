# xautonomics/Laguna-S-2.1-UD-IQ4_NL.LAYR.GGUF

## Resumen

Esta ficha documenta `xautonomics/Laguna-S-2.1-UD-IQ4_NL.LAYR.GGUF`, una **libreria GGUF por capas** (per-layer library) publicada por xAutonomics. No es un modelo nuevo: son exactamente los mismos pesos cuantizados de `unsloth/Laguna-S-2.1-GGUF` en su variante `UD-IQ4_NL`, cortados una sola vez en un fichero por bloque transformer mas las partes compartidas (embeddings y cabeza de salida). El modelo subyacente es `poolside/Laguna-S-2.1`, desarrollado por Poolside y liberado bajo la licencia OpenMDW 1.1.

El artefacto esta pensado para [dreamcatcher](https://github.com/xautonomics-inc/dreamcatcher), el fork de `ik_llama.cpp` mantenido por xAutonomics, y se carga con `llama-server --model-dir`. Consta de 48 bloques (`blk-00000.gguf` a `blk-00047.gguf`), mas `parts-embd.gguf`, `parts-output.gguf` y un `manifest.json` con hashes blake2b-128 por fichero y por tensor; el conjunto ocupa 54,9 GiB repartidos en 50 ficheros. La arquitectura declarada es `laguna`, con 48 bloques.

Su relevancia es de infraestructura mas que de modelado: permite cargar y servir los pesos por capas, verificar la integridad del binario antes de arrancar y desplegar en un solo proceso. En contrapartida, el propio autor advierte de que la arquitectura `laguna` **aun no se ha ejecutado en dreamcatcher**, carece de hooks de stage-ring y, por tanto, solo admite serving en un unico proceso. La ficha es deliberadamente conservadora: no hay benchmarks, ni ficha de parametros, ni contexto declarado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `laguna` (transformer de 48 bloques, segun la model card); no se detalla si es densa o MoE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la model card menciona "expertos" ejecutandose en CPU en decodificacion, lo que sugiere posible arquitectura con expertos, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Libreria en `UD-IQ4_NL` (dynamic quantization de Unsloth). Tipos de tensor presentes: `Q8_0` (385), `F32` (287), `IQ3_S` (92), `IQ4_NL` (47), `Q6_K` (3). La fuente Unsloth dispone tambien de `UD-IQ4_XS` |
| Idiomas soportados | no disponible |
| Licencia | `openmdw-1.1` (OpenMDW License Agreement, version 1.1); campo `license: other` con `license_name: openmdw-1.1`. Se incluye `LICENSE.md` |
| Formato de pesos | GGUF, particionado por capas (`blk-NNNNN.gguf`, `parts-*.gguf`, `manifest.json`) para llama.cpp / dreamcatcher (fork de ik_llama.cpp) |
| Tamano en disco | 54,9 GiB en 50 ficheros |
| Integridad | `manifest.json` con blake2b-128 por fichero completo y por tensor |
| Modelo base | `poolside/Laguna-S-2.1` |
| Fuente de la cuantizacion | `unsloth/Laguna-S-2.1-GGUF`, revision fijada `750f92f90cf54159c4d7a610cb7b3e74498e75c6`, 3 shards |
| Descargas / likes (HuggingFace) | 0 / 0 |
| Fecha de creacion (segun metadatos) | 2026-09-15 |

## Arquitectura y entrenamiento

No hay informacion en el material proporcionado sobre el entrenamiento de Laguna S 2.1: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Todo lo que se sabe es de segundo orden: el modelo base es `poolside/Laguna-S-2.1`, la arquitectura declarada en el GGUF es `laguna` con 48 bloques, y la cuantizacion la realizo Unsloth mediante su esquema dinamico (`UD`), que asigna precision por tensor en lugar de aplicar un unico tipo a toda la red.

Lo tecnicamente distintivo de este repositorio no es el modelo, sino el formato de distribucion. Los tensores se han cortado —sin recuantizar nada— con la herramienta `layer_distribution.slice` de `tools/layer-distribution` (commit `5d151bded2bf164a2fe8c9d928062aae2a88b814`), generando un fichero por bloque transformer. Ese diseño habilita carga por capas y verifica la procedencia de extremo a extremo: el `manifest.json` registra los nombres y tamanos de los shards de origen (`source.shards[]`, `source.content_hash`) ademas de los hashes por fichero y por tensor. La eleccion de `UD-IQ4_NL` frente a `UD-IQ4_XS` esta motivada: segun el autor, los kernels de CPU del fork para `iq4_xs` (y tambien `iq4_kss`/`iq5_ks`) pierden precision con lotes pequenos, algo relevante cuando los expertos se ejecutan en CPU durante la decodificacion. Esta cuantizacion no contiene ninguno de esos tipos.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base `poolside/Laguna-S-2.1`; las capacidades concretas no estan documentadas en la informacion disponible.
- Razonamiento, generacion de codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Lo que si aporta este artefacto: carga por capas (`--model-dir`), verificacion criptografica de integridad antes del arranque y serving en un unico proceso mediante `llama-server`.
- Limitacion funcional explicita: sin hooks de stage-ring para `laguna`, no hay soporte multi-host.

## Casos de uso

- Serving local con `llama-server`: arrancar el modelo con `llama-server --model-dir /models/Laguna-S-2.1-UD-IQ4_NL.LAYR.GGUF`, aprovechando que el loader reconoce directamente el layout por capas y evita tener que gestionar shards monolíticos.
- Despliegue hibrido CPU/GPU en decodificacion: el autor justifica la eleccion de `UD-IQ4_NL` precisamente por escenarios en los que los expertos se ejecutan en CPU; un nodo con GPU para atencion y CPU para expertos es el caso natural de esta cuantizacion.
- Verificacion de integridad en pipelines de MLOps: antes de servir, ejecutar `from layer_distribution import verify` contra `manifest.json` para comprobar hashes blake2b-128 por fichero y por tensor, util cuando los pesos viajan entre registros, CDN o entornos de staging.
- Distribucion y actualizacion incremental: al estar partido en 48 ficheros de bloque mas dos partes compartidas, se puede reemplazar o cachear por bloques en lugar de mover 54,9 GiB completos en cada iteracion.
- Entornos air-gapped: el formato de fichero mas el manifiesto con procedencia (`source.shards[]`, `source.content_hash`) permite auditar el origen de los pesos en despliegues sin acceso a internet ni a HuggingFace.
- Investigacion a nivel de capa: al tener un fichero por bloque, resulta viable instrumentar activaciones, precargar o descargar bloques de forma selectiva y comparar comportamiento entre capas sin manipular un GGUF monolítico.
- Reproducibilidad de cuantizaciones: sirve como referencia fijada a una revision concreta de Unsloth (`750f92f90c`), lo que permite repetir experimentos sobre exactamente los mismos tensores.
- Serving en un unico nodo grande: para organizaciones que ya disponen de un nodo con memoria suficiente y quieren evitar la complejidad de un despliegue multi-host que, en esta arquitectura, no esta soportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base ni para esta cuantizacion. La model card indica expresamente que el estado de soporte se actualizara "cuando se mida", es decir, que la libreria **no se ha ejecutado todavia en dreamcatcher**. Tampoco hay cifras de latencia, throughput o consumo de memoria medidas.

## Requisitos de hardware

- Tamano de pesos: 54,9 GiB en 50 ficheros. Cualquier despliegue necesita al menos esa cantidad de memoria (VRAM + RAM) solo para los pesos, mas el overhead de buffers de decodificacion y de la cache KV, cuyo tamano no puede estimarse porque la longitud de contexto no esta disponible.
- VRAM estimada: 54,9 GiB como minimo para los pesos si se pretende mantener todo en memoria de GPU. Cifra derivada del tamano de los ficheros, no una medicion publicada.
- GPU recomendadas: no hay recomendaciones oficiales. Por capacidad de memoria, el conjunto encaja en GPUs de 80 GB (A100 80 GB, H100 80 GB) o en configuraciones multi-GPU; se trata de una deduccion a partir del tamano, no de un dato del autor.
- GPU de consumo: no cabe completa en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). El escenario realista en hardware de consumo es el offload parcial a CPU, coherente con el diseno del fork ik_llama.cpp y con la justificacion de la cuantizacion orientada a expertos en CPU.
- Opciones de despliegue: `llama-server --model-dir` sobre dreamcatcher, el fork de ik_llama.cpp de xAutonomics. El autor advierte de que solo se soportan los ficheros publicados en `huggingface.co/xautonomics` y que **no se deben renombrar**, porque el loader espera exactamente `blk-NNNNN.gguf` / `parts-*.gguf` / `manifest.json`. El soporte en vLLM, Ollama, TGI u otros runners no esta documentado.
- Multi-host: no soportado. La arquitectura `laguna` no tiene hooks de stage-ring en el fork, por lo que los stage rings multi-host quedan excluidos y el serving debe ser en un unico proceso.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No hay informacion sobre modelos comparables de la misma categoria. La unica comparacion posible con los datos disponibles es entre los tres artefactos de la misma cadena de pesos:

| Artefacto | Formato | Tamano | Estructura | Herramienta de carga | Multi-host |
|---|---|---|---|---|---|
| `poolside/Laguna-S-2.1` (original) | safetensors (no confirmado en la informacion) | no disponible | pesos completos sin cuantizar | ecosistema estandar | no aplica |
| `unsloth/Laguna-S-2.1-GGUF` (`UD-IQ4_NL`) | GGUF | no disponible (3 shards) | shards de cuantizacion global | llama.cpp | no aplica |
| `xautonomics/Laguna-S-2.1-UD-IQ4_NL.LAYR.GGUF` (este) | GGUF por capas + `manifest.json` | 54,9 GiB, 50 ficheros | 48 bloques + embd + output, hashes por tensor | dreamcatcher (fork de ik_llama.cpp) | no soportado para `laguna` |

Dentro de la fuente Unsloth, la model card menciona una alternativa de cuantizacion, `UD-IQ4_XS`, descartada aqui por la perdida de precision de los kernels de CPU del fork con lotes pequenos. No hay datos de rendimiento que permitan comparar ambas variantes en calidad.

## Limitaciones y advertencias

- Soporte no validado: la arquitectura `laguna` **no se ha ejecutado aun en dreamcatcher** segun la propia model card. No hay mediciones de ningun tipo.
- Sin multi-host: no existen hooks de stage-ring para `laguna`, por lo que solo se admite serving en un unico proceso (`llama-server --model-dir`). Cualquier arquitectura de despliegue distribuido queda descartada.
- Restriccion de ficheros: solo se soportan los ficheros publicados en `huggingface.co/xautonomics` y no deben renombrarse; el loader depende literalmente de `blk-NNNNN.gguf`, `parts-*.gguf` y `manifest.json`.
- Precision de kernels en el fork: los kernels de CPU para `iq4_xs`, `iq4_kss` e `iq5_ks` pierden precision con lotes pequenos, lo que motivo la eleccion de `UD-IQ4_NL`. Es una limitacion conocida del runtime, documentada en `docs/KNOWN-ISSUES.md`, no de este repositorio.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin issues ni reportes de terceros.
- Anomalia de metadatos: la fecha de creacion registrada (2026-09-15) es posterior a la fecha habitual de publicacion, un dato a verificar antes de tratarlo como referencia estable.
- Licencia: se distribuye bajo OpenMDW 1.1 con `LICENSE.md` incluido. Las condiciones exactas de uso comercial no se detallan en la informacion proporcionada; hay que revisar el texto de la licencia antes de explotarlo en produccion.
- Idiomas y contexto: no declarados. No se puede planificar cobertura multilingue ni dimensionar la cache KV.
- Alucinacion y sesgos: no hay informacion especifica para Laguna S 2.1 en el material disponible. Como modelo de lenguaje, hereda los riesgos habituales del modelo base, que no se han documentado aqui.
- Cadena de custodia: los pesos no se han modificado (son byte a byte los de Unsloth), pero cualquier verificacion debe apoyarse en el `manifest.json`; el autor proporciona el comando de validacion, y saltarselo elimina la unica garantia de integridad disponible.
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (referencias a WikiLeaks y Vault 7), por lo que no aportan informacion adicional verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xautonomics/Laguna-S-2.1-UD-IQ4_NL.LAYR.GGUF
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Cuantizacion de origen (Unsloth): https://huggingface.co/unsloth/Laguna-S-2.1-GGUF
- Revision fijada de la fuente: https://huggingface.co/unsloth/Laguna-S-2.1-GGUF/tree/750f92f90cf54159c4d7a610cb7b3e74498e75c6/UD-IQ4_NL
- Runtime dreamcatcher (fork de ik_llama.cpp): https://github.com/xautonomics-inc/dreamcatcher
- Herramienta de corte por capas: https://github.com/xautonomics-inc/dreamcatcher/tree/5d151bded2bf164a2fe8c9d928062aae2a88b814/tools/layer-distribution
- Problemas conocidos del fork: https://github.com/xautonomics-inc/dreamcatcher/blob/main/docs/KNOWN-ISSUES.md
- Organizacion en HuggingFace: https://huggingface.co/xautonomics
- Sitio del publicador: https://xautonomics.com
