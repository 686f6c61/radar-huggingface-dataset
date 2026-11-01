# staccs/ds4-winhip

## Resumen

ds4-winhip es un repositorio de código fuente y binarios, no un modelo de pesos en sentido estricto. Contiene un port funcional para Windows con HIP SDK 7.2 del runtime `ds4` (fork de [Baekpica/ds4-dfm-rs](https://github.com/Baekpica/ds4-dfm-rs), licencia MIT), junto con el launcher, el supervisor y las notas necesarias para servir los GGUFs vector-cuantizados de DeepSeek-V4.1-Flash-1017 en una GPU AMD Radeon 8060S (gfx1151) con 128 GB de memoria unificada. El autor es `staccs`.

El problema que resuelve es concreto: los expertos enrutados de estos builds lecore VQ están almacenados como blobs de libros de código vector-cuantizados (`vq8x4096/1024`), un formato que llama.cpp, vLLM y Ollama no pueden cargar. Solo el runtime `ds4` conoce ese layout, de modo que este repositorio publica el árbol de trabajo compilable, los scripts de build (`build_gpu.cmd`, `build_host.cmd`, `link_server.ps1`) y el comando exacto de ejecución para no tener que redescubrirlos.

El repositorio incluye además el binario ya compilado `ds4-server.exe` (Windows x64, HIP 7.2), que expone una API compatible con OpenAI en `http://127.0.0.1:8008/v1`. El tamaño del repo es de 0,0 GB según HuggingFace, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (DeepSeek-V4.1-Flash), runtime de inferencia `ds4` en C/Rust con kernels CUDA/HIP |
| Parametros totales | no disponible (el GGUF lecore VQ citado ocupa 106,8 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan prompts de 14k y 19,3k tokens en las mediciones) |
| Tipos de cuantizacion | VQ vector-cuantizado `vq8x4096/1024` en expertos enrutados; builds citados `vq11cal` y `vq10sh12`; corrección FP4 `solar_e2m1_decode` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (lecore VQ) más sidecar Engram en safetensors (`model-00047-of-00048.safetensors`, `model-00048-of-00048.safetensors`) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos (MoE) cuyos expertos enrutados se han recomprimido mediante cuantización vectorial con libros de código de 4096 entradas y 1024 dimensiones (`vq8x4096/1024`). El runtime `ds4` implementa los kernels que decodifican esos blobs, con restricciones específicas de tamaño del libro de código en LDS documentadas en `docs/` y en `HANDOFF-requant.md`, que incluye el layout VQ, los presupuestos de bytes por capa y la receta de recuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque el repositorio es un port de inferencia y no una model card de entrenamiento. Entre las particularidades técnicas del runtime destacan: decodificación especulativa mediante el drafter DSpark (que eleva el decode de ~14-17 tok/s a ~21 tok/s cuando no hay penalización por repetición activa), un almacén KV en disco (`DS4_KV_DISK_DIR`) que restaura checkpoints de 14k tokens (~30 MB) en unos 2 s frente a un re-prefill de ~190 s, y un sidecar de visión de 0,9 GiB.

## Capacidades

- Generación de texto mediante API compatible con OpenAI (`/v1`), servida por `ds4-server`.
- Razonamiento con bloques de pensamiento acotados por presupuesto (`DS4_SERVER_THINK_BUDGET_FILE`, 0 = ilimitado).
- Capacidad multimodal de visión a través del sidecar de 0,9 GiB publicado en `staccs/ds41-sidecars`.
- Soporte de turnos de agente con tool calling, evidenciado por los defaults del launcher para frameworks de agentes (límite de `MAX_TOKENS`, penalización de frecuencia para evitar bucles de repetición en turnos largos de herramientas).
- Decodificación especulativa con el drafter DSpark.
- Persistencia de estado conversacional en disco mediante el almacén KV.
- Capacidades multilingües: no disponible.

## Casos de uso

- Servir DeepSeek-V4.1-Flash en hardware AMD consumer o de estación de trabajo: el repositorio permite ejecutar el GGUF lecore VQ en una Radeon 8060S con 128 GB de memoria unificada, un escenario que llama.cpp, vLLM y Ollama no cubren por incompatibilidad de formato.
- Despliegue de agentes de un solo hilo: el servidor atiende una petición cada vez y encola la segunda, lo que encaja con flujos de agente secuenciales donde el estado KV se reutiliza entre turnos y se evita el re-prefill completo.
- Automatización con visión: el sidecar de 0,9 GiB añade entrada de imágenes al pipeline, útil para tareas de descripción o extracción sobre capturas y documentos.
- Inferencia con contexto largo y checkpoints persistentes: con prompts de 14k-19k tokens, el almacén KV en disco restaura el estado en ~2 s, lo que reduce drásticamente el coste de re-prefill (~190 s) en conversaciones de ida y vuelta.
- Reproducción de builds en Windows: los scripts `build_gpu.cmd`, `build_host.cmd` y `link_server.ps1` permiten reconstruir el runtime y el binario en entornos HIP 7.2, útil para equipos que necesitan parchear o auditar el código.
- Investigación sobre cuantización vectorial: las notas de `docs/` y `HANDOFF-requant.md` documentan el layout VQ, los presupuestos por capa y las restricciones de kernel, material de partida para experimentos de recuantización.
- Servicio desatendido con supervisor: `serve/serve_ds41.ps1` adopta o relanza `ds4-server`, vigila bloqueos y aplica backoff ante el límite de commit de Windows, adecuado para despliegues de larga duración en una sola máquina.

## Benchmarks y rendimiento

| Métrica | Valor medido |
|---|---|
| Carga hasta la primera respuesta | ~6 min (copia de pesos + ~110 s de warm-up de kernels/grafos en la primera petición) |
| Prefill | 135-190 tok/s (prompts reales de agente frente a sintéticos) |
| Decode, un stream (8060S) | 14-17 tok/s; 21 tok/s con el drafter DSpark sin penalización de repetición |
| Decode, 1× H200 NVL | 46-54 tok/s (build `vq10sh12`) |
| Concurrencia | una petición a la vez; la segunda se encola |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF lecore VQ citado ocupa 106,8 GB; con `DS4_CUDA_COPY_MODEL=1` se copian los pesos a memoria GPU (~92 GiB de commit de Windows), lo que exige un límite de commit superior a ~100 GB. Con `-NoCopy` se mapea desde host: sin commit, pero más lento por token.
- GPU validadas: Radeon 8060S (gfx1151, HIP SDK 7.2, 128 GB de memoria unificada) y H200 NVL (46-54 tok/s en el build `vq10sh12`); los scripts `serve/ds4_boot.sh` y el parche FP4 se usaron en máquinas H100/H200.
- GPU consumer: cabe en una APU con memoria unificada de 128 GB como la 8060S; no hay datos para GPUs consumer discretas.
- Despliegue: runtime propio `ds4-server` (Windows x64, HIP 7.2) con API compatible con OpenAI; llama.cpp, vLLM y Ollama no cargan estos blobs VQ.
- Latencia y throughput: prefill de 135-190 tok/s, decode de 14-17 tok/s (21 tok/s con DSpark) en 8060S; 46-54 tok/s en H200 NVL. El almacén KV en disco restaura checkpoints de 14k tokens (~30 MB) en ~2 s.
- Memoria auxiliar: el directorio Engram apunta a ~203 GB de safetensors mapeados desde disco, no copiados; el sidecar de visión ocupa 0,9 GiB.

## Comparativa con modelos similares

| Runtime | Formato VQ lecore | Windows + HIP | API OpenAI | Licencia |
|---|---|---|---|---|
| ds4 (este repo) | Sí (`vq8x4096/1024`) | Sí (HIP 7.2) | Sí (`/v1`) | MIT |
| llama.cpp | No | Sí | Parcial | MIT |
| vLLM | No | No (orientado a CUDA/Linux) | Sí | Apache 2.0 |
| Ollama | No | Sí | Sí | MIT |

La comparación relevante aquí es de runtimes, no de modelos: el rasgo diferencial de `ds4` es ser el único que decodifica los blobs vector-cuantizados de DeepSeek-V4.1-Flash. Para alternativas de modelo comparable en tamaño o tarea, los datos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Un único checkpoint KV vivo: el servidor conserva el estado tras el último prompt y la última respuesta; cualquier otra petición intermedia sobrescribe ambos y el siguiente turno re-prefilla todo (medido: 19,3k tokens, 138 s). Mientras un agente trabaja, nada más debe tocar el puerto.
- Concurrencia nula: solo una petición simultánea; la segunda se encola.
- Parada delicada: hay que matar `ds4-server` y esperar a que baje el commit de Windows antes de relanzar, o el loader entra en thrashing en el límite de commit.
- Sensibilidad de muestreo: con T=1.0 sin truncado, prompts de 14k+ degeneran en texto incoherente; greedy entra en bucles deterministas en turnos largos de herramientas. El launcher fija T=0.6, top_p=0.95, min_p=0.05, max_tokens=4096 y frecuencia 0.05.
- La penalización de frecuencia, necesaria para frenar bucles de repetición de esta cuantización, desactiva el drafter DSpark (~8,7 frente a ~21 tok/s).
- Sin límite de tokens, los frameworks de agentes pueden dejar correr un bucle de repetición hasta el final del contexto (observado: 19,5k tokens, 22 min).
- Riesgo de alucinación, sesgos conocidos y limitaciones de idioma: no disponible.
- Licencia MIT para el código del runtime; las condiciones de uso comercial de los pesos DeepSeek-V4.1-Flash dependen de su propia licencia, no disponible en esta información.
- El build requiere HIP SDK 7.2 y un límite de commit de Windows superior a ~100 GB; el fallo de link tras `cargo build` es esperado y lo resuelve `link_server.ps1`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/staccs/ds4-winhip
- Runtime upstream (fork base): https://github.com/Baekpica/ds4-dfm-rs
- Sidecars (visión y builds VQ): https://huggingface.co/staccs/ds41-sidecars
- Pesos DeepSeek-V4.1-Flash-1017: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
