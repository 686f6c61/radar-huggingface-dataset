# tsii42/Qwen3.8-27B-W8A8-Dynamic-Ascend-310P-vLLM

## Resumen

Este repositorio contiene una exportación cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario tsii42. La cuantización es W8A8_DYNAMIC realizada con ModelSlim (pesos y activaciones en INT8, con escalas dinámicas en las activaciones) y está específicamente preparada para ejecutarse sobre aceleradores Huawei Ascend: en concreto, sobre una tarjeta Atlas 300I Duo con dos chips Ascend 310P3 (~44 GiB cada uno) y el backend vLLM-Ascend con paralelismo tensorial 2.

El problema que aborda es el despliegue de un modelo de ~27.000 millones de parámetros en hardware Ascend de inferencia, donde los pesos sin cuantizar no caben por chip. El artefacto resultante ocupa unos 33,92 GiB repartidos en 9 fragmentos. El autor documenta la validación completa del stack (CANN 9.1.0, HDK 26.0.rc1, torch_npu 2.10.0.post4, imagen vLLM-Ascend 0.27.1rc para 310P) con medidas de throughput, latencia, contexto largo de hasta 258.048 tokens y cargas de imagen.

Su relevancia es doble. Por un lado, es una de las pocas publicaciones que documentan de forma reproducible la ruta de cuantización Ascend sobre la familia Qwen3.8. Por otro, el propio autor enumera fallos relevantes (tool calling no funcional, inestabilidad con GDN-WY ante esquemas de herramientas), lo que lo sitúa como artefacto de referencia y laboratorio más que como servicio listo para producción. El repositorio acumula 0 descargas y 0 me gusta en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el config declara la familia `Qwen3_5ForConditionalGeneration`. Las banderas de caché Mamba SSM y las referencias a GDN apuntan a una arquitectura híbrida con componentes de atención y de estado recurrente |
| Parámetros totales | ~27B según la denominación del modelo; no se desglosa en la model card |
| Parámetros activos | No disponible (no se documenta configuración MoE) |
| Longitud de contexto | 258.048 tokens validados en la configuración de contexto largo (262.144 no cupo); capacidad de caché KV medida de 261.101 tokens. Configuración de servicio por defecto del ejemplo: 8.192 |
| Tipos de cuantización | W8A8_DYNAMIC (INT8 en pesos y activaciones, escalas dinámicas) mediante ModelSlim. Requiere el flag `--quantization ascend`; no es compressed-tensors W8A8 ni W8A8SC |
| Idiomas soportados | No disponible. Las pruebas de humo del autor incluyen aritmética en inglés y un saludo coherente en alemán |
| Licencia | apache-2.0 (metadatos de redistribución; el artefacto local original se describía como MIT) |
| Formato de pesos | safetensors, 9 fragmentos, tamaño aproximado de 33,92 GiB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text (visión-lenguaje) |
| Dtype en tiempo de ejecución | float16 |
| Hardware validado | Atlas 300I Duo, 2× Ascend 310P3, TP2, ejecución eager |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni su proceso de entrenamiento: no hay número de tokens, composición del dataset ni mención a RLHF o DPO. Toda la información técnica disponible se refiere al proceso de cuantización y al stack de servicio.

Los indicios indirectos apuntan a una arquitectura no puramente transformer densa. El comando de arranque incluye `--mamba-ssm-cache-dtype float16`, y las limitaciones conocidas mencionan dos variantes de implementación, «Native GDN-WY» y «baseline GDN», esta última empleada para el servicio estable de contexto largo. GDN suele corresponder a Gated DeltaNet, un mecanismo de estado recurrente con puertas; si esa correspondencia se confirma, el modelo combinaría atención con capas de estado lineal, algo coherente con la ausencia de un flag de atención estándar y con la caché específica de tipo SSM. Se trata de una inferencia a partir de los datos de la model card, no de un dato confirmado por el autor.

La innovación documentada del artefacto no está en el entrenamiento, sino en la conversión: exportación W8A8 dinámica con ModelSlim, verificada con ejecución eager en float16, sin uso de BF16, Triton ni modo grafo en la configuración validada. Las banderas `--enable-chunked-prefill` y `--enforce-eager` forman parte del arranque recomendado.

## Capacidades

- Generación de texto multimodal: el pipeline declarado es image-text-to-text y el autor validó una carga de imágenes de 200×200 píxeles con 8 de 8 peticiones correctas.
- Contexto largo: servicio estable con `--max-model-len 258048` y capacidad de caché KV de 261.101 tokens, suficiente para documentos o conversaciones de gran extensión.
- Razonamiento con modo thinking: el autor mide dos niveles de esfuerzo (low y medium) y obtiene 4 de 4 respuestas correctas en cada uno. Por defecto, las peticiones de chat deben fijar `chat_template_kwargs={"enable_thinking": false}` salvo que se quiera razonamiento explícito.
- Aritmética y conocimiento factual básico: las pruebas de humo devuelven `4` para `2 + 2` y `Berlin` para la capital de Alemania, antes y después de cada celda de benchmark.
- Salida multilingüe: se verificó un saludo coherente en alemán. No hay lista oficial de idiomas soportados.
- Tool calling: no funcional en el stack validado. Las llamadas requeridas de tipo Hermes podían devolver HTTP 200 con `content` y `tool_calls` vacíos.
- Sin soporte documentado de audio ni de otras modalidades distintas de imagen y texto.

## Casos de uso

- Análisis de documentación técnica extensa: con 258.048 tokens de contexto validados, el modelo puede ingerir manuales, pliegos o normativa completa y responder preguntas sobre el conjunto sin fragmentar en trozos. Es adecuado cuando la coherencia entre secciones largas es crítica.
- Procesamiento por lotes de imagen y texto en infraestructura Ascend: el pipeline image-text-to-text permite tareas de descripción, extracción o clasificación de imágenes en pipelines no interactivos, donde el throughput medido (hasta 111,65 tokens de salida por segundo con carga ofrecida alta) es aceptable.
- Razonamiento asistido por lotes: el modo thinking con esfuerzo low o medium resolvió 4 de 4 tareas, con tiempos de extremo a extremo de 24 a 29 segundos en concurrencia 1. Encaja en trabajos de validación o generación de informes donde la latencia no es restrictiva.
- Servicio interno de preguntas y respuestas sobre corpus propios en organizaciones con hardware Huawei: al ejecutarse íntegramente en Ascend, evita la salida de datos a APIs externas.
- Laboratorio de cuantización y validación de vLLM-Ascend: el repositorio incluye el comando de arranque, el protocolo de benchmark y el fichero de resultados, lo que lo convierte en una base reproducible para comparar configuraciones de TP, longitud de contexto y caché.
- Generación de resúmenes y extracción de datos en procesos offline: con tasas de finalización de entre 0,70 y 1,74 peticiones por segundo, el modelo es apto para colas de trabajo nocturnas o pipelines ETL con texto e imagen.
- Evaluación comparativa de cuantizaciones: sirve para medir el impacto de W8A8 dinámico de ModelSlim frente a otras rutas (compressed-tensors W8A8, W8A8SC) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son medidas de servicio y pruebas de humo semánticas.

Throughput medido con TP2 y ejecución eager, entrada aleatoria de 32 tokens, salida de 64 tokens, `--ignore-eos`, semilla 42, 24 peticiones medidas más 3 de calentamiento por tasa de llegada (144 peticiones medidas en total, todas completadas):

| Peticiones/s ofrecidas | Tokens de salida/s | Peticiones completadas/s | TTFT medio (ms) | TTFT p99 (ms) | TPOT medio (ms) | Resultado |
|---:|---:|---:|---:|---:|---:|---|
| 1 | 44,89 | 0,70 | 679,60 | 1144,85 | 170,95 | VÁLIDO |
| 2 | 63,22 | 0,99 | 1054,93 | 2070,96 | 208,45 | VÁLIDO |
| 4 | 83,94 | 1,31 | 1031,45 | 2048,04 | 198,50 | VÁLIDO |
| 8 | 96,83 | 1,51 | 1148,24 | 2067,31 | 195,28 | VÁLIDO |
| 16 | 104,31 | 1,63 | 1227,37 | 2121,26 | 194,39 | VÁLIDO |
| 32 | 111,65 | 1,74 | 1277,38 | 2057,45 | 187,77 | VÁLIDO |

Carga de imagen (200×200 píxeles), configuración de contexto largo con `max-num-seqs=1`:

| Concurrencia de cliente | TTFT p50 | E2E p50 | Correctas |
|---:|---:|---:|---:|
| 1 | 0,53 s | 0,65 s | 4/4 |
| 2 | 1,19 s | 1,30 s | 4/4 |

Razonamiento, misma configuración con `max-num-seqs=1`:

| Concurrencia de cliente | Esfuerzo | TTFT p50 | E2E p50 | Correctas |
|---:|---|---:|---:|---:|
| 1 | low | 0,49 s | 29,26 s | 4/4 |
| 1 | medium | 0,47 s | 24,42 s | 4/4 |
| 2 | low | 44,29 s | 108,40 s | 4/4 |
| 2 | medium | 52,69 s | 90,11 s | 4/4 |

El autor advierte que la tasa de llegada es carga ofrecida, no concurrencia real ni límite de un solo flujo, y que los números describen el stack de servicio completo, no una especificación de hardware independiente de la arquitectura.

## Requisitos de hardware

- VRAM/NPU: los pesos cuantizados ocupan aproximadamente 33,92 GiB. La configuración validada usa 2× Ascend 310P3 de unos 44 GiB cada uno con paralelismo tensorial 2, por lo que el consumo total con caché KV y activaciones supera ampliamente lo que ofrece un solo chip.
- Contexto largo: la configuración con 258.048 tokens se ejecutó con `--max-num-seqs 1`, `--enable-chunked-prefill` y `--no-enable-prefix-caching`, y midió 261.101 tokens de capacidad de caché KV.
- GPU de consumo: no disponible. No se documenta ejecución en GPU NVIDIA ni AMD, y no hay artefactos GGUF publicados.
- GPU recomendadas: no disponibles. El artefacto está orientado exclusivamente a Huawei Ascend 310P; no se han publicado validaciones en A100, H100 o RTX 4090.
- Despliegue: vLLM-Ascend con imagen compatible con 310P (`--quantization ascend`, `--tensor-parallel-size 2`, `--dtype float16`, `--mamba-ssm-cache-dtype float16`, `--enforce-eager`, `--max-model-len 8192`, `--max-num-seqs 24`, `--enable-chunked-prefill`). No hay soporte validado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT medio entre 679,60 ms y 1277,38 ms según carga; TPOT medio entre 170,95 ms y 208,45 ms; 44,89 a 111,65 tokens de salida por segundo. En visión, TTFT p50 de 0,53 s con concurrencia 1.
- Requisito operativo: `prompt_tokens + max_tokens` no debe superar `max-model-len`.

## Comparativa con modelos similares

No se han identificado en la información disponible otros modelos de la misma categoría y tamaño con validación publicada en Ascend 310P. La comparación se limita al modelo base y a las rutas de cuantización alternativas mencionadas por el autor.

| Modelo o artefacto | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsii42/Qwen3.8-27B-W8A8-Dynamic-Ascend-310P-vLLM | ~27B | 258.048 tokens validados | W8A8_DYNAMIC (ModelSlim) | apache-2.0 | Pública en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | ~27B | No disponible | Ninguna (BF16, presumiblemente) | No disponible | Referenciado como modelo base |
| Cuantizaciones compressed-tensors W8A8 | No disponible | No disponible | W8A8 | No disponible | Mencionadas por el autor como alternativa no equivalente |
| Cuantizaciones W8A8SC | No disponible | No disponible | W8A8SC | No disponible | Mencionadas por el autor como alternativa no equivalente |

## Limitaciones y advertencias

- Tool calling no funcional: el autor indica explícitamente que las llamadas requeridas de tipo Hermes no funcionaron en el stack validado y que las respuestas HTTP 200 podían llegar con `content` y `tool_calls` vacíos. No debe anunciarse soporte de tool calling en producción sobre este artefacto.
- Inestabilidad con esquemas de herramientas: la implementación Native GDN-WY provocó un fallo de AICore/RMSNorm seguido de `507015` y `EngineDeadError` con prompts que incluían esquemas de herramientas. Solo la variante baseline GDN resultó estable para contexto largo.
- Caché de prefijos no validada en contexto largo; el autor la desactiva en esa configuración.
- Límite de contexto: `max-model-len=262144` no cupo en la configuración probada; el máximo validado es 258.048 tokens, y `prompt_tokens + max_tokens` no puede superarlo.
- Sesgos: no se ha publicado ninguna evaluación de sesgo, toxicidad o equidad en la información disponible.
- Alucinación: no hay evaluación específica. Las pruebas de humo documentadas son de aritmética elemental, un dato factual y un saludo, insuficientes para caracterizar el comportamiento en producción.
- Idiomas: no hay lista oficial de idiomas soportados; el alcance multilingüe no está verificado más allá de las pruebas citadas.
- Rendimiento: los números describen el stack completo (hardware, CANN, vLLM-Ascend y parámetros de servicio), no una característica intrínseca del modelo; no son extrapolables a otras plataformas.
- Escenario de concurrencia: varias de las medidas de visión y razonamiento se tomaron con `max-num-seqs=1`, por lo que la concurrencia 2 implica encolamiento y no ejecución paralela real.
- Licencia: el repositorio redistribuye un derivado cuantizado con metadatos Apache-2.0 y conserva los avisos de atribución al modelo base, aunque la model card del artefacto local original lo describía como MIT. No implica respaldo de Qwen, Huawei, ModelSlim ni vLLM-Ascend. Conviene verificar la licencia aplicable al modelo base antes de un uso comercial.
- Madurez: 0 descargas y 0 me gusta, sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tsii42/Qwen3.8-27B-W8A8-Dynamic-Ascend-310P-vLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de benchmark en crudo del repositorio: https://huggingface.co/tsii42/Qwen3.8-27B-W8A8-Dynamic-Ascend-310P-vLLM/blob/main/benchmark-results.tsv
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos correspondían a eventos y webcams de la región de Havel (Alemania) y no guardan relación con el artefacto. No se han localizado papers, blogs ni demos adicionales.
