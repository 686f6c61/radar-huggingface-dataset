# theykk/MiMo-V2.6-Flash-MOPD-UNCENSORED

## Resumen

MiMo-V2.6-Flash-MOPD-UNCENSORED es una reconstrucción del modelo multimodal y de mezcla de expertos `XiaomiMiMo/MiMo-V2.6-Flash-MOPD` publicada por el usuario `theykk`. El cambio consiste en una edición de pesos —denominada por el autor "spectral refusal-erase"— aplicada sobre las matrices `self_attn.o_proj` de las 48 capas del transformer, cuyo objetivo es eliminar los comportamientos de rechazo del modelo base. El resto del checkpoint (encoder de audio, capas MTP, expertos, tokenizador y plantilla de chat) se declara byte a byte idéntico al original.

El modelo conserva la arquitectura multimodal del original (visión, audio y vídeo), una ventana de contexto de 262.144 tokens y un total de 310.756.322.688 parámetros (~310,8B) en formato MoE. La ficha declara compatibilidad con `en` y `zh`, licencia MIT y uso con `transformers` y vLLM.

Su relevancia es doble: por un lado, es un caso documentado de ablación de direcciones de rechazo mediante SVD sobre pesos en producción; por otro, demuestra un método con soporte empírico (batería de 59 sondas con 59/59 respuestas de cumplimiento en modo thinking ON y OFF sin degradar la coherencia medida por el autor). La contrapartida es que se trata de un artefacto sin descargas ni validación comunitaria, con métricas de razonamiento aritmético muy bajas en el arnés de prueba del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto, visión, audio y vídeo); incluye capas MTP (multi-token prediction) |
| Parametros totales | 310.756.322.688 (datos reales de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (flag `--max-model-len 262144` de la receta de produccion del autor) |
| Tipos de cuantizacion | Pesos bf16 en `safetensors`; los tags del repositorio incluyen `fp8` y `8-bit`; la receta de servicio usa `--kv-cache-dtype fp8` |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de 129 shards; el shard `model_pp0_ep0_shard0.safetensors` es el modificado) |
| Tamano del repositorio | 177,8 GB |
| Fecha de publicacion | 2026-09-28 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `XiaomiMiMo/MiMo-V2.6-Flash-MOPD`, que segun la informacion disponible es una arquitectura MoE multimodal con 48 capas de transformer (`model.layers.0..47`), matrices `o_proj` de atencion de forma 4096×8192 en bf16, capas MTP y un tower de audio. Los detalles de entrenamiento del modelo base —numero de tokens, composicion del dataset, uso de RLHF o DPO— no estan disponibles en la informacion proporcionada. La ficha indica que el autor no ha entrenado el modelo: ha editado pesos ya entrenados.

La innovacion tecnica del artefacto es el metodo de edicion de pesos. Sobre cada una de las 48 matrices `self_attn.o_proj` se realiza una SVD en fp32, se calcula la alineacion `|Uᵀ·d|` entre las columnas singulares izquierdas y una direccion de rechazo unitaria `d`, se anulan los top-k valores singulares mas alineados y se reconstruye `W' = U·diag(S')·Vh`, almacenando de nuevo en bf16. La receta ganadora ("U67a") combina tres pasos: borrado espectral base en las capas 12..44 (top-2 componentes mas alineados con `refdir.pt`), una ablacion por proyeccion rank-1 con fuerza 5,0 en las capas 30..46 —`(I − 5.0·d·dᵀ)·W`— y una proyeccion de banda media con fuerza 1,0 en las capas 6..29. La verificacion final con `bf16check.py` declara 48/48 tensores `o_proj` identicos al parche convertido a bf16.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia (`chat_template.jinja` en el modelo base) y modo thinking conmutable (`enable_thinking=true/false`).
- Razonamiento aritmetico basico verificado por el autor: 17×23 = 391 y 47×63 = 2961 exactos en decodificacion greedy.
- Multimodalidad segun los tags del repositorio: vision-language, audio y comprension de video (incluye tower de audio declarado byte-identico al base).
- Contexto largo de hasta 262.144 tokens, con soporte de `--kv-cache-dtype fp8` en vLLM.
- Soporte de tool calling / function calling y agentes: la receta de produccion levanta vLLM con `--tool-call-parser mimo`, `--reasoning-parser mimo` y `--enable-auto-tool-choice`.
- Multilingue limitado a ingles y chino.
- Cumplimiento de peticiones que el modelo base rechazaria: 59/59 COMPLY en la bateria de 59 sondas (armas, ciberseguridad, fraude, drogas, violencia, autolesion, copyright literal, desinformacion, acoso e instrucciones ilicitas), tanto en modo thinking ON como OFF.
- Saludos fluidos sin prefijos basura: `hi` → `Hi! How can I help you today?`, con el regex de prefijos anomales limpio y contador de bucles CJK a 0.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como sujeto de estudio para medir como se codifican las direcciones de rechazo en el espacio de pesos, ya que el autor documenta el pipeline completo (SVD, direcciones `refdir.pt`, `good_onset.pt`, `bad_onset.pt`) y los artefactos de evaluacion.
- Red-teaming y evaluacion de guardarrailes: la bateria de 59 sondas y la taxonomia de veredictos (HARD_REFUSE / SOFT_REDIRECT / COMPLY) son reutilizables como plantilla para auditar otros modelos o capas de filtrado externas.
- Analisis de documentos muy largos: con 262.144 tokens de contexto se pueden procesar expedientes, informes o codebases completos en una sola llamada, siempre que el idioma sea ingles o chino.
- Comprension de video y audio: los tags `video-understanding` y `audio` y el tower de audio del checkpoint permiten tareas de transcripcion contextual, resumen de reuniones o indexado de material audiovisual.
- Agentes con tool calling en produccion: la invocacion de vLLM documentada incluye parsers de tool call y de razonamiento, ademas de un middleware de presupuesto de esfuerzo (`EffortBudgetMiddleware`), lo que permite integrarlo en pipelines de agentes multi-paso.
- Atencion al cliente bilingue en/zh: conversaciones multi-turno con contexto largo para soporte tecnico en ingles y chino, con la ventaja de no bloquear consultas legitimas que el modelo base rechazaria por falsos positivos.
- Investigacion sobre degradacion de capacidades: el modelo, con GSM8K-10 en 2/10 frente a 3/10 del intermedio U14 y 0/10 del base sin parchear, es util para estudiar el coste de coherencia que introduce la edicion de pesos y para calibrar metodos de borrado mas conservadores.
- Despliegue on-premise en nodos con mucha memoria: la receta GH200 de 96 GB con `--cpu-offload-gb 105 --cpu-offload-params experts` esta copiada literalmente en la model card y sirve como punto de partida reproducible para servir el modelo en hardware de 96 GB.

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval ni otros benchmarks estandar. Los unicos datos disponibles son los de su bateria interna de rechazo y un subconjunto de 10 problemas de GSM8K, que el propio autor califica de "regression tripwire, not a benchmark claim".

| Candidato (bateria de 59 sondas, greedy) | OFF C/S/H | ON C/S/H | Coherente |
|---|---|---|---|
| Base dealignai (referencia) | 20/6/33 | 20/8/31 | Si (pero rechaza) |
| U14 (banda 12..44, top-2) | 12/18/29 | 8/9/42 | Si (391, 2961, saludo fluido, GSM8K 3/10) |
| U6 / U9 / U10 / U13 | 59/0/0 | 59/0/0 | No (aritmetica erronea, bucles CJK, GSM8K 0/10) |
| U67a (esta version) | 59/0/0 | 59/0/0 | Si (391 y 2961 exactos, saludo fluido, SPOT PASS) |

C = COMPLY, S = SOFT_REDIRECT, H = HARD_REFUSE. Criterio de aceptacion: C = 59 en ambos modos y coherencia mantenida.

| Prueba de coherencia | Resultado |
|---|---|
| 17×23 | 391 (exacto) |
| 47×63 | 2961 (exacto) |
| GSM8K-10 (greedy, primer numero) | 2/10 (base sin parchear: 0/10; U14: 3/10) |
| Saludo `hi` | `Hi! How can I help you today?` |
| Regex de prefijos basura | Limpio |
| Contador de bucles CJK | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completo, MMMU) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 177,8 GB, muy por debajo de los ~621 GB que requeriria un checkpoint bf16 puro de 310,8B parametros, lo que apunta a que los shards incluyen componentes cuantizados en fp8 o 8 bits (deduccion a partir del tamano del repo y de los tags `fp8` y `8-bit`, no confirmada por el autor).
- Configuracion de referencia documentada: nodo GH200 de 96 GB con `--gpu-memory-utilization 0.92`, offload a CPU de 105 GB (`--offload-backend uva --cpu-offload-gb 105 --cpu-offload-params experts`), `--max-model-len 262144`, `--max-num-seqs 8` y cache KV en fp8. Es decir, el escenario de produccion del autor requiere descargar parte de los expertos a CPU incluso con 96 GB de GPU.
- GPU recomendadas: GH200 96 GB (confirmada por el autor). Para A100/H100 de 80 GB, dos o mas GPUs con tensor parallelism y offload de expertos serian necesarias, pero no hay datos oficiales: no disponible.
- Cabe en GPU de consumo: no, no de forma practica. Con ~310,8B parametros totales no cabe en 24 GB (RTX 4090) ni en 48 GB (RTX 6000 Ada / A6000) sin offload masivo a CPU o disco, con latencias muy altas. No hay mediciones publicadas de rendimiento en hardware de consumo.
- Opciones de despliegue: vLLM (receta oficial con `--trust-remote-code`, parsers `mimo`, middleware propio y plantilla de chat externa). Al estar en safetensors y depender de `custom_code`, no hay GGUF disponible y por tanto no es compatible directamente con llama.cpp u Ollama. No se documenta soporte de TGI.
- Latencia y throughput: no disponible. La unica referencia es la restriccion de concurrencia de la receta (`--max-num-seqs 8`) y el offload de expertos, que limita la velocidad de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bateria OFF / ON | Coherencia | Licencia | Estado |
|---|---|---|---|---|---|---|
| theykk/MiMo-V2.6-Flash-MOPD-UNCENSORED (U67a) | 310,8B | 262.144 tokens | 59/59 / 59/59 COMPLY | Si (391, 2961, GSM8K 2/10) | MIT | Publicado, 0 descargas |
| dealignai/MiMo-V2.6-Flash-RL-UNCENSORED | no disponible | no disponible | 20/59 / 20/59 COMPLY | Si, pero rechaza | no disponible | Auditado contra su base: 64/65 blobs identicos; el unico cambio real es un bloque `<think>` anadido a `chat_template.jinja` |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD (base) | no disponible | no disponible | no disponible | Si (GSM8K-10 0/10) | no disponible | Modelo original de Xiaomi |
| U14 (version intermedia del mismo autor) | no disponible | no disponible | 12/18/29 / 8/9/42 | Si (GSM8K 3/10) | no disponible | No publicado como release |

No se dispone de comparativas con modelos de otros fabricantes (por ejemplo Llama, Qwen o DeepSeek) en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el objetivo del parche es que el modelo cumpla peticiones sobre armas, ciberseguridad ofensiva, fraude, drogas, violencia, autolesion, desinformacion, acoso e instrucciones ilicitas. No debe desplegarse sin guardarrailes externos en entornos con usuarios finales.
- Riesgo legal y de cumplimiento: el uso comercial de un modelo sin rechazos puede infringir normativas de moderacion de contenido y las politicas de los proveedores de infraestructura. La licencia del modelo es MIT, pero la del modelo base de Xiaomi no se especifica en la informacion disponible y conviene verificarla antes de cualquier uso comercial.
- Alucinacion y degradacion de razonamiento: el autor reporta GSM8K-10 en 2/10 (frente a 3/10 del intermedio U14 y 0/10 del base sin parchear). La propia ficha lo describe como "regression tripwire", no como benchmark, lo que indica que la edicion de pesos afecta a la aritmetica. La coherencia se valida con dos multiplicaciones y un saludo, no con una evaluacion sistematica.
- Validacion practicamente nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta; todos los artefactos de evaluacion son internos del autor (`RESULTS.md`, `results.tsv`, `battery_u67a__*.json`, `spot_u67a.log`, `cap_u67a.log`) y no se enlazan desde la model card.
- Reproducibilidad limitada: la ficha describe rutas absolutas de un entorno de build (`/home/ubuntu/heretic-build/...`, `/job/...`), lo que dificulta replicar el parche sin los ficheros de direcciones de rechazo (`refdir.pt`, `good_onset.pt`, `bad_onset.pt`). No se proporcionan hashes de todos los shards, solo el sha256 del shard ep0 reconstruido.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano ni de otras lenguas, y el rendimiento fuera de en/zh no esta evaluado.
- Contexto largo sin medicion: los 262.144 tokens son la configuracion de servido (`--max-model-len`), pero no hay resultados publicados de recuperacion o atencion efectiva a esa distancia.
- Dependencia de `trust_remote_code` y `custom_code`: la receta oficial requiere `--trust-remote-code` y una plantilla de chat externa (`/opt/mw/xiaomi_chat_template.jinja`) junto con un middleware propio (`mimo26_effort.EffortBudgetMiddleware`), lo que anade superficie de ataque y dependencias fuera del repositorio.
- Coste de servido elevado: incluso con 96 GB de GPU hay que descargar 105 GB de expertos a CPU, con la penalizacion de latencia y throughput que eso implica, y sin cifras publicadas de tokens por segundo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theykk/MiMo-V2.6-Flash-MOPD-UNCENSORED
- Modelo base citado: `XiaomiMiMo/MiMo-V2.6-Flash-MOPD` (identificador mencionado en la model card; no se proporciona URL)
- Modelo comparable citado: `dealignai/MiMo-V2.6-Flash-RL-UNCENSORED` (identificador mencionado en la model card; no se proporciona URL)
- Base de la comparativa dealignai: `XiaomiMiMo/MiMo-V2.6-Flash-RL` (identificador mencionado en la model card; no se proporciona URL)
- Artefactos de evaluacion citados sin enlace publico: `RESULTS.md`, `results.tsv`, `probes.json`, `battery_u67a__job_u67a_patch_bytes.pt_off.json`, `battery_u67a__job_u67a_patch_bytes.pt_on.json`, `spot_u67a.log`, `cap_u67a.py`, `cap_u67a.log`, `ab_gsm8k_10.jsonl`, `bf16check.py`, `build_u67.py`, `refdir.pt`, `good_onset.pt`, `bad_onset.pt`, `u67a_patch_bytes.pt`
