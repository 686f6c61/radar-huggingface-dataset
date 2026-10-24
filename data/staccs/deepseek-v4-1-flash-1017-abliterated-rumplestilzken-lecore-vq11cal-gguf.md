# staccs/DeepSeek-V4.1-Flash-1017-abliterated-rumplestilzken-lecore-vq11cal-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino una recuantización en GGUF de un solo fichero (106,8 GB) de `rumplestilzken/DeepSeek-V4.1-Flash-1017-abliterated`, que a su vez es la versión abliterada del `deepseek-ai/DeepSeek-V4.1-Flash-1017` publicado el 17 de octubre de 2026. El autor del repo, `staccs`, aplica una cuantización vectorial (VQ) de 11 bits calibrada sobre las activaciones de los expertos enrutados, con codebooks de 2048 entradas y k-means ponderado por activación sobre 65.536 tokens de calibración, logrando 1,39 bits por peso en la parte MoE.

El interés técnico está en que mantiene un MoE de escala frontera (la documentación de DeepSeek habla de 552B parámetros de backbone y contexto de hasta un millón de tokens, con entrada nativa de imágenes y texto) en un único fichero que cabe en una estación de trabajo con 128 GB de memoria unificada. La model card reporta métricas de fidelidad frente a los pesos originales sobre WikiText-2: perplejidad 2,821 a 2k de contexto y 2,950 a 16k, con una concordancia top-1 del 80,5% y 78,4% respectivamente.

Es relevante ahora porque demuestra que las cuantizaciones agresivas por debajo de 1,5 bpw, aplicadas selectivamente a los expertos y dejando el esqueleto de atención en q4_K (cosine 0,997), pueden conservar la distribución del profesor razonablemente bien, algo que la build anterior sin calibrar (vq10sh12) no conseguía: perplejidad 3,615 y top-1 del 74,5%. El precio es un ecosistema de despliegue muy restringido: la única ruta validada es un servidor `ds4-server` parcheado sobre Windows y Radeon 8060S con HIP nativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con backbone transformer, expertos enrutados y tablas n-gram tipo "engram"; pesos abliterados (direcciones de rechazo eliminadas) |
| Parámetros totales | 106.804.403.562 según los metadatos de safetensors del repo; la model card y la documentación de DeepSeek citan 552B-557B en el backbone (dato no reconciliado en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1.000.000 tokens según la documentación de DeepSeek; en esta cuantización solo se han publicado evaluaciones a 2k y 16k |
| Tipos de cuantización | GGUF único de precisión mixta: expertos enrutados en VQ de 11 bits (codebooks de 2048 entradas, 1,39 bpw), expertos compartidos en VQ de 11 bits, esqueleto de atención en q4_K, cabeza de salida en FP8 con bloques 32x32; caché KV en 4 bits (valores FP4, escalas E4M3) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero único de 106,8 GB) más los shards originales de tablas engram de DeepSeek, que se descargan por separado (~203 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE multimodal que procesa imágenes y texto de forma nativa y genera texto de forma autorregresiva, con un backbone de 552B parámetros según la documentación de DeepSeek y contextos de hasta un millón de tokens. La model card de esta recuantización describe una separación explícita entre los expertos enrutados (557B parámetros, según el texto del autor), los expertos compartidos y un "esqueleto de atención" que se mantiene en mayor precisión. Además, el modelo incorpora tablas n-gram denominadas engram, que en este repo se conservan sin modificar desde los shards originales de DeepSeek y no forman parte del fichero GGUF.

La aportación técnica del repo es el esquema de cuantización: k-means ponderado por activación sobre 65.536 tokens de calibración para construir codebooks VQ de 2048 entradas y 11 bits, aplicado a los expertos enrutados (cosine ponderado 0,909) y a los expertos compartidos (cosine 0,910), mientras la atención se degrada mucho menos (q4_K, cosine 0,997) y la cabeza de salida se mantiene en FP8 con bloques de 32x32. No se dispone de información sobre el dataset de preentrenamiento, el número de tokens, la composición de datos ni las etapas de RLHF/DPO. La abliteración es trabajo de `rumplestilzken` y este repo solo recuantiza; el autor reporta que el escaneo de tipos de fichero y la comprobación de paridad de decodificación frente a los pesos fuente se superaron.

## Capacidades

- Generación de texto autoregresiva en inglés y, presumiblemente, otros idiomas (no se detalla la cobertura lingüística).
- Razonamiento, código y tareas agénticas: la documentación de DeepSeek V4.1 Flash 1017 reporta mejoras en razonamiento, programación, tareas de agente y benchmarks visuales frente a V4.1 Flash.
- Procesamiento nativo de imágenes junto a texto (modelo multimodal), con salida únicamente de texto.
- Modo de razonamiento (thinking) configurable: puede desactivarse con `reasoning_effort: "none"` o `thinking: {"type":"disabled"}`, recomendado para uso agéntico.
- Compatibilidad con tool calling y agentes: la model card documenta integración con Hermes Agent mediante una API compatible con OpenAI (`/v1`) y esquemas de herramientas de ~14k tokens en el prompt de sistema.
- Contexto largo: hasta 1M tokens teóricos, con reutilización de prefijo KV en el servidor (checkpoints en disco de ~30 MB por 14k tokens).
- Comportamiento sin alineamiento de seguridad ("uncensored"): no aplica filtros de rechazo heredados del modelo original.
- Capacidad de servir como endpoint compatible con OpenAI en local (tag `endpoints_compatible`).

## Casos de uso

- Agente local de código en una estación de trabajo aislada: el modelo se sirve con `ds4-server` en `http://127.0.0.1:8008/v1` y se conecta a Hermes u otro cliente con tool calling; el prompt de sistema más los esquemas de herramientas ocupan unos 14k tokens, lo que exige reutilización de prefijo KV para que los turnos de seguimiento sean baratos (un turno en frío tarda 100-140 s).
- Procesamiento de documentación larga con contexto de hasta 1M tokens: resúmenes y extracción sobre expedientes, contratos o bases de código completas, aprovechando que el coste marginal de nuevos turnos baja drásticamente si el prefijo coincide con la última respuesta.
- Análisis de imágenes en flujo local: al ser multimodal nativo, puede transcribir y razonar sobre capturas, diagramas o documentos escaneados sin enviar datos a la nube, algo crítico en entornos con requisitos de confidencialidad.
- Red-teaming y evaluación de seguridad: la variante abliterada permite estudiar qué comportamientos emergen al eliminar las direcciones de rechazo, y comparar la fidelidad de la cuantización frente al modelo original en escenarios adversarios.
- Generación de datos sintéticos a pequeña escala: con decodificación voraz o temperatura 0,6 y top_p 0,95, se pueden producir corpus controlados sin dependencia de APIs externas, aunque el throughput (14-17 tok/s de decodificación) limita el volumen.
- Investigación sobre cuantización extrema: el repo sirve como caso de estudio reproducible de VQ calibrada a 1,39 bpw en un MoE de escala frontera, con métricas de perplejidad, KL, concordancia top-1 y masa basura sobre tokens reservados.
- Despliegue en hardware de memoria unificada (APUs con 128 GB): prototipos de asistentes privados en Windows sobre Radeon 8060S con HIP, donde una GPU discreta de consumo no puede alojar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de fidelidad de la cuantización frente al modelo profesor, sobre el conjunto de test de WikiText-2:

| Métrica | 2k de contexto | 16k de contexto |
|---|---:|---:|
| Perplejidad | 2,821 | 2,950 |
| KL media frente al origen | 0,592 | 0,591 |
| KL mediana frente al origen | 0,046 | 0,093 |
| Concordancia top-1 con el origen | 80,5% | 78,4% |
| Masa basura en ids reservados (media, alumno) | 1,91e-07 | 2,46e-07 |
| Masa basura en ids reservados (máx, alumno) | 8,34e-05 | 8,92e-05 |
| Masa de escape fuera del top-50 del origen | 0,0340 | 0,0315 |
| Jaccard del conjunto retenido con top-p 0,95 | 0,683 | 0,624 |

Comparación con la build anterior sin calibrar (`lecore-vq10sh12`) a 2k de contexto:

| Métrica | vq11cal (esta build) | vq10sh12 (sin calibrar) |
|---|---:|---:|
| Perplejidad | 2,821 | 3,615 |
| KL media | 0,592 | 0,797 |
| KL mediana | 0,046 | 0,195 |
| Concordancia top-1 | 80,5% | 74,5% |

Rendimiento de inferencia medido por el autor en una Radeon 8060S (gfx1151, HIP SDK 7.2, 128 GB de memoria unificada), sobre la build vq10sh12 y limitado por kernels:

| Métrica | Valor |
|---|---|
| Prefill | 135-190 tok/s (prompts reales de agente frente a sintéticos) |
| Decodificación | 14-17 tok/s |
| Carga hasta la primera respuesta | ~6 minutos (copia de pesos + ~110 s de warm-up de kernels y grafos) |
| Concurrencia | una petición a la vez; la segunda se encola |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el fichero GGUF pesa 106,8 GB y la copia de pesos en GPU reserva del orden de 100 GB de commit en Windows; se necesita un límite de commit por encima de ~100 GB o usar `-NoCopy` (mapeado en host, sin commit, más lento).
- Almacenamiento: 106,8 GB del GGUF más ~203 GB de shards de tablas engram descargados aparte, es decir, unos 310 GB en total.
- GPU validadas: Radeon 8060S (gfx1151) con HIP SDK 7.2 y 128 GB de memoria unificada, mediante el `ds4-server` parcheado del repo compañero.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) ni en configuraciones de 48-80 GB sin descarga de capas a host, lo que degradaría aún más una decodificación ya limitada por kernels. Se requiere una APU con 128 GB de memoria unificada o un nodo con >=128 GB de VRAM.
- No hay datos publicados de despliegue en A100/H100 para este formato VQ; la ruta CUDA solo aparece como variable de entorno (`DS4_CUDA_COPY_MODEL`), sin mediciones.
- Opciones de despliegue: `ds4-server` (parcheado, API compatible con OpenAI) es la única ruta documentada y medida. La compatibilidad con llama.cpp, Ollama, vLLM o TGI no está confirmada para este esquema de cuantización VQ; el tag `endpoints_compatible` se refiere a la API, no al runtime.
- Latencia: primera petición de un turno en frío de agente de ~14k tokens, 100-140 s hasta el primer token; un re-prefill completo medido de 19,3k tokens tarda 138 s. La reutilización de prefijo KV (`--prefix-reuse exact|auto|off`) es imprescindible para uso interactivo.
- Caché KV en 4 bits (valores FP4, escalas E4M3), con checkpoints en disco de ~30 MB por 14k tokens; el almacén en disco está presente pero no validado en la build de Windows.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Datos disponibles |
|---|---|---|---|---|---|
| Este repo (`staccs/...vq11cal-GGUF`) | 106,8B según metadatos; 552-557B en el backbone según el autor | hasta 1M (evaluado a 2k/16k) | GGUF único, VQ 11 bits + q4_K + FP8, 106,8 GB | MIT | PPL 2,821 (2k), top-1 80,5%, KL media 0,592 |
| `staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF` | mismo modelo base | mismo | GGUF, VQ 10 bits sin calibrar | MIT | PPL 3,615 (2k), top-1 74,5%, KL media 0,797 |
| `dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ABLITERATED` | mismo modelo base abliterado | mismo | EXL3 a 2,9 bpw | no disponible en la información | es un mirror de `dealignai/...-UNCENSORED`; sin métricas en la búsqueda |
| `rumplestilzken/DeepSeek-V4.1-Flash-1017-abliterated` | mismo modelo base | mismo | pesos sin cuantizar (modelo profesor) | no disponible en la información | referencia de todas las métricas KL/top-1 |
| `unsloth/DeepSeek-V4.1-Flash-1017-GGUF` | modelo original sin abliterar | hasta 1M | GGUF (cuantizaciones estándar) | no disponible en la información | sin métricas en la búsqueda |

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado las direcciones de rechazo, por lo que no ofrece las salvaguardas del modelo original. No es apto para exposición directa a usuarios finales sin una capa de moderación externa.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de factualidad ni de benchmarks de capacidad en la información disponible.
- La licencia MIT permite uso comercial, pero la licencia del modelo base (DeepSeek) debe verificarse por separado; la información disponible no la detalla.
- Idiomas soportados no documentados: no se puede confirmar la calidad en castellano ni en idiomas distintos del inglés.
- Inconsistencia de parámetros: los metadatos del repo indican 106,8B parámetros totales mientras la model card y la documentación de DeepSeek citan 552-557B. Cualquier estimación de coste o de memoria basada en una sola de las cifras puede ser errónea.
- Dependencia de artefactos externos: los shards de tablas engram (~203 GB) no están incluidos; sin ellos el comportamiento del modelo puede diferir del esperado.
- Degradación medible frente al original: 19,5% de desacuerdo top-1 a 2k de contexto, KL media de 0,592 y una Jaccard de 0,683 con top-p 0,95, lo que implica divergencia en la cola de la distribución.
- Riesgo de tokens basura: la build anterior sin calibrar generaba "word salad" con tokens reservados (por ejemplo `place_holder_no_362`) a T=1,0 sin truncación en prompts de 14k+. El autor recomienda temperatura 0 o 0,6-0,7 con top_p 0,95 y min_p 0,05 en cualquier caso.
- Un solo slot de petición: mientras un agente usa el puerto, cualquier otra petición invalida los dos checkpoints KV vivos y fuerza un re-prefill completo.
- Ruta de despliegue frágil: solo validada en Windows con HIP sobre Radeon 8060S y un servidor parcheado; sin soporte documentado en vLLM, TGI, llama.cpp u Ollama.
- Repo sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 24 de octubre de 2026; no hay evaluaciones independientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-rumplestilzken-lecore-vq11cal-GGUF
- Modelo base abliterado (rumplestilzken): https://huggingface.co/rumplestilzken/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo original DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build anterior sin calibrar (lecore-vq10sh12): https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF
- Mirror EXL3 2,9 bpw abliterado: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ABLITERATED
- GGUF de unsloth en ModelScope: https://www.modelscope.cn/models/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Documentación de Cloudflare AI para deepseek-v4.1-flash-1017: https://developers.cloudflare.com/ai/models/%40cf/deepseek-ai/deepseek-v4.1-flash-1017/
- Lista curada de ejemplos y demos: https://github.com/sandbase-lab/awesome-deepseek-v4.1-flash
- Paper técnico: no disponible en la información proporcionada.
