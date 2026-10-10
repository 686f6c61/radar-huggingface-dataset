# umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp

## Resumen

`umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp` es una cuantización de precisión mixta en formato MLX del modelo `Qwen/Qwen3.8-Flash-Next`, publicada por el usuario umixer. No es un modelo nuevo ni un reentrenamiento: es un ensamblado de pesos ya cuantizados, componente a componente, mediante copia de bytes desde paquetes oQ nativos, sin recuantizar ningún tensor. El paquete ocupa 116,7 GiB repartidos en 28 shards y declara 179.999.981.459 parámetros totales en safetensors.

La arquitectura del modelo base es `qwen4_exp`: un transformer MoE de 48 capas con 512 expertos y enrutado top-10, más una tabla de embeddings n-gram (PLE) y un drafter MTP para decodificación especulativa. El desglose declarado es 125B en el tronco, 51B en la tabla n-gram y 4B en el MTP, con 6B de parámetros activos por token.

Su relevancia es práctica: reproduce la economía de memoria y velocidad de una build de 4 bits (unos 73-75 GB residentes, 82 tok/s de decodificación en prompt corto y 66 tok/s a 122k tokens de contexto) manteniendo en 6 bits los componentes sensibles a la cuantización (bordes del MoE, atención, tabla n-gram y drafter). El autor estima una calidad de nivel oQ5e o superior, aunque no la ha medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp`: MoE + tabla n-gram PLE + MTP; 48 capas, 512 expertos, enrutado top-10 |
| Parametros totales | 179.999.981.459 (safetensors). Desglose declarado: 125B tronco + 51B tabla n-gram + 4B MTP |
| Parametros activos | 6B por token (expertos enrutados); el drafter MTP anade 4B en decodificacion especulativa |
| Longitud de contexto | 131k tokens probados por el autor; afirma margen seguro hasta 256k en un host de 128 GB. Ventana nativa del modelo base: no disponible |
| Tipos de cuantizacion | Mixta por tensor. Esqueleto `bits=4, group_size=64, mode=affine`; 6 bits en expertos de capas 0-3 y 44-47, atencion, GDN, hiper-conexiones, convoluciones, tabla n-gram PLE y drafter MTP; 8 bits en expertos compartidos y parte de `embed_tokens`/`lm_head`; bf16 sin cuantizar en norms, routers y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (declarada como `license: other`) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`), 28 shards, 116,7 GiB; repositorio de 125,3 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 48 capas, 512 expertos por capa y enrutado top-10, lo que da 6B de parámetros activos sobre 125B en el tronco. A esto se suman dos componentes adicionales: una tabla de embeddings n-gram (PLE) de 51B parámetros y un drafter MTP (multi-token prediction) de 4B, que se usa para decodificación especulativa con profundidad 3. El paquete incluye además una torre de visión sin cuantizar en bf16, lo que apunta a capacidades multimodales en el modelo original, aunque no se detallan en la información disponible.

No hay información sobre el entrenamiento del modelo base: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se documenta ninguna innovación de entrenamiento propia.

La innovación de este paquete es de cuantización, no de arquitectura. El autor parte de la literatura sobre sensibilidad a la cuantización por profundidad (curva en U: capas iniciales y finales sensibles, capas intermedias tolerantes) y ensambla el modelo copiando bytes desde dos paquetes fuente: `mlx-community/Qwen3.8-Flash-Next-oQ6e-mtp` para todos los componentes de la ruta caliente y `Jundot/Qwen3.8-Flash-Next-oQ4e-mtp` para los expertos de las 40 capas intermedias. Cada tensor es idéntico byte a byte a su origen y las entradas de precisión alta se declaran por tensor en `config.json`, replicadas en `quantization` y `quantization_config`. La verificación de integridad reportada incluye coincidencia de geometría en los 150 switch-mlp y comprobación `mx.array_equal` de los tensores intercambiados.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado `text-generation` y etiquetas `conversational`.
- Razonamiento y generación de código: no se documentan evaluaciones específicas de código o matemáticas en la información disponible, pero el modelo base pertenece a la familia Qwen y el ensamblado conserva los pesos originales de atención y expertos.
- Contexto largo: verificado por el autor hasta 131k tokens, con degradación de decodificación contenida (de 82,5 a 66,5 tok/s entre 1,2k y 122k tokens de prompt).
- Decodificación especulativa con MTP nativo en 6 bits, profundidad 3 y tasa de aceptación declarada del 65-75% en tráfico de agente y edición, con una mejora medida de +6 a +8% en tokens generados por segundo a 64k de contexto frente a un drafter de 4 bits.
- Procesamiento por lotes y prompts muy largos: throughput E2E medido de hasta 2.197,9 tokens/s con prompt de 122k.
- Capacidades multimodales: el recetario menciona una torre de visión conservada en bf16, pero no se especifica qué tareas de visión soporta. No confirmado en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Agentes de código locales sobre Apple Silicon: con 6B de parámetros activos, 66-82 tok/s de decodificación y MTP con aceptación del 65-75% en tráfico de agente y edición, el modelo permite ciclos de edición-reflexión con varias llamadas encadenadas sin salir del equipo.
- Análisis de documentación extensa: los 131k tokens de contexto verificados permiten pasar contratos, informes técnicos o bases de código completas en una sola ventana, con throughput de prefill sostenido de 2.355-2.457 tok/s en prompts largos.
- Asistente conversacional con datos sensibles: al ser un despliegue local en memoria unificada, ningún dato sale de la máquina, lo que encaja en entornos con requisitos de confidencialidad estrictos.
- Procesamiento por lotes offline: el escalado del throughput E2E (de 375,9 a 2.197,9 tokens/s según longitud) lo hace adecuado para tareas de resumen, extracción o clasificación sobre grandes volúmenes de texto en una estación de trabajo.
- Generación de código en pipelines internos: integrable mediante `mlx_vlm` en scripts de automatización local; no se documenta soporte de tool calling ni integración con CI/CD, por lo que requeriría orquestación externa.
- Estación de trabajo unipersonal con 128 GB de memoria unificada: con 73-75 GB residentes deja margen amplio para el sistema operativo y la caché KV, frente a los ~85 GB de la build uniforme de 5 bits.
- Investigación en cuantización: el paquete es una referencia reproducible para estudiar estrategias de precisión mixta por sensibilidad de capa y para comparar contra builds uniformes de 4, 5 y 6 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, KLD) en la información disponible. El propio autor indica que la estimación de calidad es de ingeniería y no medida, porque la medición de KLD requiere un host de 192 GB o más.

Sí se publican mediciones de velocidad y memoria en un M5 Max de 128 GB con oMLX 0.7.0, decodificación greedy y MTP activado, con `pp/tg = xxxx/256`:

| Test (pp/tg) | TTFT (ms) | TPOT (ms) | pp tok/s | tg tok/s | E2E (s) | Throughput |
|---|---|---|---|---|---|---|
| 1197/256 | 761,7 | 12,17 | 1.571,4 | 82,5 | 3,866 | 375,9 |
| 4409/256 | 1.949,0 | 13,55 | 2.262,2 | 74,1 | 5,411 | 862,1 |
| 8155/256 | 4.005,9 | 13,30 | 2.035,7 | 75,5 | 7,399 | 1.136,7 |
| 15744/256 | 6.406,5 | 14,31 | 2.457,5 | 70,2 | 10,056 | 1.591,1 |
| 30948/256 | 12.718,9 | 13,54 | 2.433,2 | 74,1 | 16,173 | 1.929,4 |
| 62029/256 | 25.625,8 | 14,34 | 2.420,6 | 70,0 | 29,283 | 2.127,0 |
| 122464/256 | 51.983,9 | 15,10 | 2.355,8 | 66,5 | 55,836 | 2.197,9 |

Datos adicionales de rendimiento declarados:

| Metrica | Valor |
|---|---|
| Memoria residente al cargar | ~73-75 GB |
| Comparativa con oQ5e uniforme (mismo host) | oQ5e: paquete ~128 GiB, residente inicial ~85 GB |
| MTP | 6 bits nativo, profundidad 3, aceptación 65-75% en tráfico de agente/edición |
| Ganancia de MTP a 64k | +6 a +8% tg frente a drafter de 4 bits |
| Contexto probado | 131k |

## Requisitos de hardware

- Memoria: ~73-75 GB residentes al cargar. En la práctica exige un host con memoria unificada de 128 GB para trabajar con contexto largo sin swap; el autor indica que 256k de contexto caben con margen seguro en 128 GB, mientras que la build uniforme de oQ5e (~85 GB residentes) presenta riesgo de caída por inanición de page cache.
- Plataforma: exclusivamente Apple Silicon. Es un paquete MLX; no hay versiones GGUF, AWQ, GPTQ ni CUDA. VRAM estimada para GPU NVIDIA: no disponible, porque el formato no es compatible.
- GPU recomendadas: no aplica en el sentido habitual; el hardware probado es un M5 Max de 128 GB. No se documentan pruebas en M3 Ultra, M4 Max ni otros chips.
- Consumer GPU: no es viable en GPUs de consumo tipo RTX 4090 (24 GB) ni por tamaño ni por formato. Solo tiene sentido en equipos Apple con memoria unificada de 96-128 GB o superior.
- Despliegue: requiere oMLX 0.7.0 (build @PR4335) o versiones de `mlx_vlm` que soporten la arquitectura `qwen4_exp` y entradas de cuantización mixta por tensor en `config.json`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: 116,7 GiB de paquete en 28 shards (125,3 GB de repositorio).
- Latencia y throughput medidos: TTFT de 761,7 ms con prompt de 1,2k tokens y 51.983,9 ms con prompt de 122k; TPOT entre 12,17 y 15,10 ms; decodificación de 82,5 tok/s en contexto corto y 66,5 tok/s a 122k.

## Comparativa con modelos similares

| Modelo | Precision | Parametros | Paquete | Residente inicial | Contexto probado | Licencia |
|---|---|---|---|---|---|---|
| umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp (este) | Mixta 4/6/8 bits + bf16 | ~180B totales, 6B activos | 116,7 GiB | 73-75 GB | 131k | qwen-community-1.0 |
| mlx-community/Qwen3.8-Flash-Next-oQ6e-mtp | 6 bits uniforme | no disponible (mismo base) | no disponible | no disponible | no disponible | Derivada de qwen-community-1.0 |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | 4 bits uniforme | no disponible (mismo base) | no disponible | no disponible | no disponible | no disponible |
| Build uniforme oQ5e de la misma familia | 5 bits uniforme | no disponible (mismo base) | ~128 GiB | ~85 GB | no disponible | Derivada de qwen-community-1.0 |

No se dispone de comparativas con modelos de otros fabricantes ni con arquitecturas equivalentes fuera de la familia Qwen3.8-Flash-Next.

## Limitaciones y advertencias

- No es un modelo entrenado: es una cuantización derivada. Hereda íntegramente los sesgos, el conocimiento y las limitaciones del modelo base Qwen3.8-Flash-Next, que no se documentan en la información disponible.
- La calidad es una estimación de ingeniería, no una medición. El autor no ha calculado KLD ni métricas de precisión; la afirmación de "nivel oQ5e o superior" se basa en argumentos estructurales sobre la precisión por componente, no en evaluaciones publicadas.
- Riesgo de alucinación: no cuantificado en la información disponible. Al ser un modelo de lenguaje generativo, el riesgo existe y no hay datos específicos para este paquete.
- Idiomas soportados: no disponibles. Se desconoce el comportamiento en castellano y en otras lenguas.
- Los expertos de las 40 capas intermedias están en 4 bits, un paso por debajo de la build uniforme de 5 bits en ese eje. El autor lo justifica por el efecto de dilución del enrutado top-10 sobre 512 expertos, pero no lo respalda con mediciones.
- Licencia `qwen-community-1.0` (declarada como `other`): conviene revisar los términos completos antes de cualquier uso comercial, ya que la información disponible no detalla condiciones de explotación.
- Dependencia estricta de software: requiere oMLX 0.7.0 o builds concretos de `mlx_vlm` con soporte de `qwen4_exp` y cuantización mixta por tensor. No hay ruta de despliegue en ecosistemas CUDA ni en runtimes habituales de inferencia.
- Limitación de plataforma: solo Apple Silicon. Esto excluye servidores con GPU y complica el escalado horizontal.
- Caché KV: el autor no publica el consumo de caché a 131k o 256k tokens, solo la memoria residente del modelo. La afirmación de 256k "con margen seguro" en 128 GB no va acompañada de cifras de memoria de caché.
- Adopción y validación nulas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de las mediciones ni de la integridad del ensamblado.
- Tamaño de descarga elevado: 125,3 GB de repositorio en 28 shards dificultan la verificación y el almacenamiento en equipos con discos pequeños.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fuente de los componentes de 6 bits: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ6e-mtp
- Fuente de los expertos de 4 bits: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Perfil del autor de la fuente de 4 bits: https://huggingface.co/Jundot
- Referencia sobre sensibilidad a la cuantización (SliderQuant): https://arxiv.org/abs/2603.25284
- Referencia sobre sensibilidad a la cuantización (NSDS): https://arxiv.org/abs/2603.17354
