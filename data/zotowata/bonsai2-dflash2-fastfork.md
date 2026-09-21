# zotowata/bonsai2-dflash2-fastfork

## Resumen

Este repositorio no es un checkpoint nuevo, sino un paquete de compilacion, parches y despliegue publicado por el usuario zotowata para servir el modelo Bonsai-2-27B (denso, ~27 B) con decodificacion especulativa sobre una unica GPU RTX 5080 de 16 GB. El paquete incluye cuatro parches en formato diff contra el fork de llama.cpp de PrismML (rama `prism`, snapshot `prism-v7`), un perfil de servidor `llama-server` ajustado, un arnes de benchmark en Python y un kit de despliegue 24/7 bajo WSL2 con systemd.

El problema que resuelve es la velocidad de decodificacion local: combinando la cuantizacion ternaria `PQ2_0` (group-128, 2,13 bits por peso, ~6,8 GB de trafico de pesos por token) con el cabezal de autodecodificacion especulativa DFlash2 en Q4_K (~1,1 GB) y una capa `ngram-mod` de ventana de 96 tokens, el autor reporta 894,9 tok/s de motor en regimen caliente y 854,5 tok/s verificados con aceptacion del 100 % en la tarea `reasoning-v1`.

Es relevante ahora porque demuestra que un modelo denso de 27 B puede superar en velocidad de generacion a modelos MoE mas pequenos en la misma GPU (el siguiente mejor resultado de 20 B+ en esa GPU es gpt-oss-20b con 222 tok/s), apoyandose en estado caliente de la cache n-gram, que es el regimen real de un bucle agentico que revisa los mismos ficheros. La informacion disponible no detalla la arquitectura ni el entrenamiento del modelo base Bonsai-2-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el modelo base (descrito como denso de 27 B); el paquete aporta un cabezal de decodificacion especulativa DFlash2 y parches CUDA para el fork de llama.cpp de PrismML |
| Parametros totales | 1.924.404.480 (~1,92 B) en el recuento safetensors del repo, que corresponde al cabezal de borrador DFlash2 en Q4_K (~1,1 GB, coherente con ~4,5 bits por parametro); el modelo servido es Bonsai-2-27B (denso, ~27 B) |
| Parametros activos | no disponible (el modelo servido es denso, no MoE) |
| Longitud de contexto | 32768 tokens en la configuracion de despliegue documentada (`-c 32768`); maximo del modelo base no disponible |
| Tipos de cuantizacion | `PQ2_0` (group-128, 2,13 bits por peso, ternario) para el modelo principal; `Q4_K` para el cabezal DFlash2; kernel opcional SoA de `PQ2_0` activable con `GGML_CUDA_PQ2_SOA=1` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (repositorio); licencia del modelo base Bonsai-2-27B y del GGUF de dealignai no disponible, conviene verificarla |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio aloja parches y artefactos de despliegue, no pesos completos entrenados desde cero. Los cuatro parches son: `0001` (24 lineas en `src/llama-model.cpp`), que mueve la busqueda de filas de embedding de entrada fuera del camino por token en CPU hacia un unico split de CUDA sin round-trip al host; `0002` (20 lineas en `ggml/src/ggml-backend.cpp`), que prepara los buffers de entrada de los grafos CUDA de forma asincrona en el stream de computo, eliminando una sincronizacion por token; `0003` (377 lineas en `ggml/src/ggml-cuda/mmvq.cu`), que anade un kernel matvec `PQ2_0` en layout structure-of-arrays con fusion de bias, demostrado bit a bit identico al kernel AoS y desactivado por defecto por no aportar ganancia agregada con las formas de este modelo; y `0004` (49 lineas en `ggml/src/ggml-cuda/ggml-cuda.cu`), con el resto del diff CUDA de la ronda 10 y el cableado del dispatcher.

Sobre entrenamiento no hay informacion: se desconoce el numero de tokens, la composicion del dataset y si hubo RLHF o DPO en el modelo base. La innovacion tecnica documentada es de inferencia: autodecodificacion especulativa DFlash2 con un cabezal de borrador de la misma familia (aceptacion ~58-61 % en prompt frio) mas una capa `ngram-mod` de 96 tokens que eleva la aceptacion hasta el 90,9 % cuando la carga de trabajo revisita contenido. La compilacion requiere `GGML_CUDA_GRAPHS=ON` (el autor la califica de critica: +70 % de decodificacion vanilla en este stack) y `CMAKE_CUDA_ARCHITECTURES=120` (Blackwell).

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en el repo y tag `endpoints_compatible`).
- Generacion de codigo: el arnes incluye la sonda `scripts/bonsai_code600.json`, una generacion de codigo de 600 tokens con temperatura 0 y modo thinking desactivado.
- Razonamiento: la sonda canonica `reasoning-v1`, con 750/750 tokens aceptados en regimen caliente.
- Edicion de codigo en bucle agentico: el autor justifica la capa n-gram precisamente porque las sesiones agenticas y de edicion de ficheros revisitan contenido constantemente.
- Decodificacion especulativa hibrida (`--spec-type draft-dflash,ngram-mod`), con `--spec-draft-n-max 5` y `--spec-ngram-mod-n-max 96`.
- Modo thinking desactivable (`enable_thinking: false` en todas las mediciones).
- Modelo base descrito como no censurado (`uncensored`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: no disponibles.
- Servidor compatible con endpoints HTTP (`llama-server` en `0.0.0.0:8001`), consumible por streaming SSE.

## Casos de uso

- Asistente de codigo local de baja latencia: con 894,9 tok/s de motor en estado caliente sobre una RTX 5080 de 16 GB, un editor puede completar bloques de codigo de cientos de tokens en aproximadamente un segundo, sin depender de APIs externas.
- Bucle agentico de refactorizacion multi-fichero: las sesiones que releen los mismos ficheros disparan la aceptacion de la capa n-gram (hasta el 90,9 %), por lo que el coste por token cae de forma medible respecto al primer paso sobre contenido nuevo.
- Servicio conversacional 24/7 en estacion de trabajo: el kit de despliegue incluye `bonsai.service` (systemd con reinicio automatico) y una tarea programada de Windows (`bonsai_keepalive_task.xml`) para mantener viva la sesion WSL2.
- Inferencia con requisitos de privacidad o entornos sin red: al ejecutarse integramente en local con pesos GGUF, los prompts y el codigo no salen de la maquina.
- Generacion de codigo en pipelines de CI/CD: el servidor expone endpoint compatible consumible por HTTP/SSE, con TTFT de 172 ms en caliente y 805 ms en frio para un prompt de 201 tokens.
- Evaluacion y comparacion de stacks de decodificacion especulativa: el paquete incluye `scripts/bench_lm.py` (mide tok/s de motor, tiempo total, TTFT, prefill, aceptacion y muestrea potencia y VRAM) y `scripts/bench_prefill2.py` para prefill limpio.
- Despliegue con presupuesto energetico ajustado: el consumo durante generacion se situa en 165-240 W con pico de 268 W, adecuado para una unica toma de corriente domestica.
- Prototipado de agentes con contexto largo: los 32768 tokens configurados permiten mantener historiales de conversacion o varios ficheros de codigo en una sola ventana con `-np 1`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decode en caliente, estado estable (canonico `code-v1`, hibrido) | 894,9 tok/s de motor, 99,9 % de aceptacion, 768 tokens en 1,03 s |
| Decode en caliente (canonico `reasoning-v1`, n-gram puro) | 854,5 tok/s, 100 % de aceptacion (750/750) — verificado |
| Decode en caliente (canonico `code-v1`, n-gram puro) | 625,9 tok/s con 95,7 % — verificado |
| Decode en estado fresco (canonico `code-v1`) | 142 tok/s con 60,6 % de aceptacion |
| Decode en estado fresco (canonico `reasoning-v1`) | 146,4 tok/s con 61,9 % de aceptacion |
| Solo DFlash2, sin capa n-gram (canonico `code-v1`) | 151,2 tok/s con 60,6 % de aceptacion |
| TTFT | 172 ms en caliente / 805 ms en fresco (`code-v1`, prompt de 201 tokens) |
| Prefill | 794 tok/s hibrido en regimen / 1381 tok/s n-gram puro |
| VRAM maxima | 13,7 GB hibrido / 11,3 GB n-gram puro (ctx 32768) |
| Potencia de GPU | 165-240 W durante generacion (pico 268 W) |
| Posicion en leaderboard (localmaxxing.com, RTX 5080) | #1 y #2 globales (894,9 hibrido / 854,5 n-gram puro, este ultimo verificado); 5 de 7 ejecuciones verificadas |
| Tok/s HTTP de extremo a extremo | entre un 5 % y un 15 % inferior a los tok/s de motor (streaming y framing) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores corresponden a temperatura 0, `enable_thinking: false`, un solo slot y sin otra carga en la GPU.

## Requisitos de hardware

- VRAM estimada: 6,8 GB de pesos del modelo ternario mas el cabezal de borrador de ~1,1 GB; el pico medido es de 13,7 GB en configuracion hibrida y 11,3 GB en n-gram puro con contexto de 32768 tokens.
- GPU de referencia: RTX 5080 de 16 GB (sm_120, Blackwell). La compilacion de referencia usa `CMAKE_CUDA_ARCHITECTURES=120` y `GGML_CUDA_GRAPHS=ON`; en arquitecturas CUDA anteriores las cifras no son extrapolables.
- Cabe en GPU de consumo: si, en una RTX 5080 de 16 GB, con margen estrecho (13,7 GB de pico sobre 16 GB). Las mediciones del leaderboard corresponden a esa GPU.
- El decode esta limitado por ancho de banda: a 740 tok/s el autor estima que el stack opera al ~92 % del techo de DRAM medido de la RTX 5080.
- Opciones de despliegue: `llama-server` del fork PrismML de llama.cpp (rama `prism`, snapshot `prism-v7`) con los parches aplicados; kit de systemd bajo WSL2 mas tarea programada de Windows para el keepalive. No se documentan vLLM, Ollama ni TGI para este stack.
- Flags de servicio documentados: `--spec-type draft-dflash,ngram-mod --spec-draft-n-max 5 --spec-ngram-mod-n-max 96 -ngl 999 -ngld 999 -fa on -c 32768 -np 1 -t 16 -tb 32 -b 2048 -ub 512`.
- Latencia y throughput: TTFT de 172 ms en caliente y 805 ms en fresco; prefill de 794 tok/s hibrido y 1381 tok/s n-gram puro; decode de 142-146 tok/s en frio hasta 894,9 tok/s en caliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode en RTX 5080 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2-27B + DFlash2 + n-gram (este paquete) | 27 B densos en PQ2_0 (2,13 bpw) | 32768 (configuracion de despliegue) | 894,9 tok/s en caliente / 142-146 tok/s en fresco | apache-2.0 (repo) | Repo con 0 descargas y 0 likes |
| Bonsai-2-27B solo con DFlash2, sin capa n-gram | 27 B densos | 32768 | 151,2 tok/s con 60,6 % de aceptacion | apache-2.0 (repo) | Mismo repo |
| gpt-oss-20b (MoE) | 20 B | no disponible | 222 tok/s | no disponible | no disponible |
| Modelos sub-2B mas rapidos en la misma GPU | menos de 2 B | no disponible | ~450 tok/s | no disponible | no disponible |

El autor situa el paquete como el resultado verificado mas rapido por encima de 20 B en esa GPU, con una ventaja amplia sobre el siguiente clasificado de esa categoria. No hay datos de calidad comparada (razonamiento, codigo, matematicas) para establecer si la ganancia de velocidad implica una perdida de precision frente a esos modelos.

## Limitaciones y advertencias

- El repositorio no contiene un checkpoint funcional por si solo: requiere el GGUF base `Bonsai-2-27B-PQ2_0-CRACK.gguf` de `dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF` y el fork de llama.cpp de PrismML para compilar.
- El modelo base se describe como no censurado (`uncensored`), sin filtros de seguridad documentados; no es adecuado para aplicaciones orientadas al publico sin una capa de moderacion propia.
- No hay informacion sobre sesgos, datos de entrenamiento, composicion del dataset ni proceso de alineacion del modelo base.
- No se han publicado evaluaciones de calidad (MMLU, HumanEval, GSM8K, multilingue); solo metricas de velocidad y aceptacion de decodificacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la temperatura 0 en todas las mediciones reduce la varianza pero no elimina el problema.
- Las cifras dependen fuertemente del estado de la cache n-gram: 894,9 tok/s en caliente frente a 142-146 tok/s en la primera ejecucion tras arrancar el servidor, una diferencia de mas de 6x que hay que tener en cuenta al dimensionar un servicio.
- Las cifras estan calibradas para una RTX 5080 (sm_120) con grafos CUDA activados; en otras GPU, o sin `GGML_CUDA_GRAPHS=ON`, el rendimiento cae de forma drastica (+70 % atribuido a esa opcion en este stack).
- El decode esta en el limite de ancho de banda de la GPU (~92 % del techo de DRAM medido), por lo que no cabe esperar mejoras adicionales por optimizacion de kernel.
- Licencia apache-2.0 declarada para el repositorio; la licencia del modelo base Bonsai-2-27B y de la cuantizacion de dealignai no consta en la informacion disponible y debe verificarse antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes, sin validacion independiente de la comunidad; las cifras provienen del propio autor y del leaderboard localmaxxing.com.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles (las sondas son `code-v1` y `reasoning-v1`).
- El kit de despliegue esta disenado para WSL2 y anade una tarea programada de Windows para evitar la suspension de la sesion; el servidor escucha en `0.0.0.0:8001` y no se documenta autenticacion.
- La fecha de creacion del repositorio (2026-09-21) y su actualizacion dos minutos despues, junto con el volumen de resultados presentados, aconsejan reproducir los benchmarks de forma independiente antes de tomar decisiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zotowata/bonsai2-dflash2-fastfork
- Fork de llama.cpp de PrismML (rama `prism`, snapshot `prism-v7`): https://github.com/PrismML-Eng
- Cuantizacion base Bonsai-2-27B Ternary CRACK GGUF: https://huggingface.co/dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF
- Leaderboard con los resultados citados: https://localmaxxing.com

La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de soporte de Microsoft sin relacion con el contenido).
