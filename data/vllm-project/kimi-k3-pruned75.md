# vllm-project/Kimi-K3-pruned75

## Resumen

Kimi-K3-pruned75 es un checkpoint derivado de `moonshotai/Kimi-K3`, el modelo multimodal de arquitectura Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Lo publica el proyecto vLLM (cuenta `vllm-project`) como copia de un checkpoint original alojado en una cuenta personal (`mgoin/Kimi-K3-pruned75`), y su proposito no es el uso en produccion sino servir como fixture de integracion continua y smoke test para vLLM. El modelo conserva la arquitectura original pero elimina el 75 % de los expertos enrutados de cada capa MoE: de 896 expertos por capa se retienen 224, en 92 capas MoE.

El checkpoint mantiene 737.432.998.272 parametros totales (aproximadamente 737 mil millones) y un repositorio de 475,2 GB en safetensors, distribuido en 96 shards. El pruning es "calibration-free": se ordenan los expertos por la suma con signo de su fila en el router (`sum(router.weight[i])`) de forma independiente por capa y se conserva el prefijo de 224. No se usa dato de calibracion alguno, lo que explica la fuerte degradacion de calidad que el propio autor advierte de forma explicita.

La relevancia de esta ficha es doble: por un lado, documenta como se sirve un MoE de este tamano en hardware Blackwell (4x NVIDIA GB300 con TP=4) con vLLM, incluyendo tiempos de carga, memoria por GPU y capacidad de KV cache; por otro, sirve como caso de estudio de por que el pruning sin calibracion es peligroso: la precision en GSM8K cae del 95,53 % del modelo fuente al 34,42 %, una regresion de 61,1 puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal, tipo `kimi_k3` con `custom_code` |
| Parametros totales | 737.432.998.272 (~737 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; en la configuracion de servicio de referencia se usa `--max-model-len 32768` |
| Tipos de cuantizacion | pesos en 8-bit segun tags; `--kv-cache-dtype fp8` en el ejemplo de despliegue; no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (`license: other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors (96 shards, 126.276 tensores indexados, 475.131.719.168 bytes / 442,50 GiB) |
| Expertos por capa MoE | 896 en el modelo fuente, 224 retenidos (25 %) |
| Capas MoE | 92 |
| Metodo de pruning | Calibration-free, ranking por `sum(router.weight[i])` descendente con signo, independiente por capa |
| Modelo base | `moonshotai/Kimi-K3` |
| Pipeline | `image-text-to-text` |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal (pipeline `image-text-to-text`) con 92 capas MoE y 896 expertos enrutados por capa en su version original. El checkpoint pruned75 no reentrena ni ajusta nada: aplica un pruning estructurado de expertos sobre los pesos del modelo fuente. Para cada capa se calcula la suma con signo de cada fila del router, se ordenan los expertos de mayor a menor y se retiene el prefijo de 224. Despues se eliminan los tensores de los expertos descartados y las filas correspondientes del router, se compactan los indices de router y de experto, y se actualiza el `config.json` a 224 expertos. El resultado es un conjunto de 224 expertos exactamente identico al prefijo del ranking usado en `mgoin/Kimi-K3-pruned50`, lo que permite comparaciones controladas entre ambos niveles de pruning.

No hay datos de calibracion ni de entrenamiento adicional en la informacion disponible; el autor lo describe como "experimental prototype, not a REAP-pruned checkpoint" y remite a la implementacion de REAP en `llm-compressor` (PR 2980) como el enfoque con calibracion que sustituira a este prototipo. El checkpoint incluye un `pruning_manifest.json` con hashes del origen, el remapeo exacto de expertos por capa, el metodo y estadisticas de salida, y fue validado contra el keyset y tamano de payload de cada shard, la permutacion de router y bias, tensores de experto muestreados en todas las capas y hashes de ficheros auxiliares. El numero retenido de 224 es divisible por TP=4 (56 expertos por rango), decision deliberada para permitir tensor parallelism limpio.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo fuente Kimi-K3, aunque severamente degradados por el pruning sin calibracion.
- Procesamiento de imagen y texto (`image-text-to-text`): el pipeline declarado es multimodal, por lo que conserva la torre de vision del modelo base.
- Razonamiento aritmetico basico: el smoke test de aritmetica del autor pasa, pero la precision en GSM8K 5-shot es del 34,42 %.
- Servicio en vLLM con `--trust-remote-code`, backend MoE automatico y atencion MLA (`FLASHINFER_MLA`), incluyendo prefix caching.
- Soporte de tensor parallelism a TP=4 en una sola maquina; el tail fusion de latent-MoE de Kimi K3 reporta TP=4 como no soportado y cae automaticamente al camino por defecto sin romper el servicio.
- Tool calling, function calling, agentes multi-paso, thinking mode, audio y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Smoke test de integracion continua en vLLM: el checkpoint se usa para validar que el loader por defecto, el backend MoE, la atencion MLA y el pipeline multimodal cargan y sirven correctamente tras cambios en el codigo. Es su proposito declarado y el motivo por el que existe la copia en `vllm-project`.
- Validacion de tensor parallelism en hardware Blackwell: con TP=4 sobre 4x GB300 se comprueba el reparto de 224 expertos (56 por rango), el tiempo de carga de pesos (210,80 s) y la memoria resultante (119,06 GiB por GPU), un escenario util para probar cambios en el planificador de memoria de vLLM.
- Pruebas de capacidad de KV cache: la configuracion de referencia reporta 132,14 GiB disponibles por GPU y 7.615.283 tokens de capacidad de KV cache con `fp8`, lo que permite ejercitar limites de `max-model-len`, prefix caching y `max-num-seqs` sin depender del modelo completo.
- Benchmarking de harness de evaluacion: el propio autor lo usa con el harness standalone de GSM8K de vLLM contra `/v1/completions` (1.319 preguntas, 5-shot, 256 tokens, temperatura 0, semilla 42), lo que lo convierte en un sujeto de prueba reproducible para validar cambios en el harness.
- Estudio de metodos de pruning: al ser el prefijo exacto del ranking de `Kimi-K3-pruned50`, permite comparar de forma controlada el efecto de retener el 25 % frente al 50 % de expertos con el mismo criterio de seleccion.
- Pruebas de regresion de calidad en pipelines de evaluacion: sirve como caso negativo conocido (34,42 % en GSM8K) para verificar que un harness detecta degradaciones grandes antes de desplegar un checkpoint podado de verdad.
- Desarrollo de soporte REAP en `llm-compressor`: el checkpoint documenta el estado "sin calibracion" frente al que se comparara la implementacion con calibracion, util para validar que el nuevo metodo mejora sustancialmente la retencion de calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index y seccion GSM8K), sobre el split de test completo de GSM8K con 1.319 preguntas, 5-shot, 256 tokens maximos, temperatura 0 y semilla 42, en 4x NVIDIA GB300 con TP=4 y la misma version de vLLM:

| Checkpoint | Accuracy GSM8K | Correctas | Invalidas | Latencia | Preguntas/s |
|---|---:|---:|---:|---:|---:|
| Kimi-K3-pruned75 | 34,4200 % | 454/1319 | 4/1319 | 536,326 s | 2,459 |
| Kimi-K3-pruned50 | 68,2335 % | 900/1319 | 3/1319 | 481,863 s | 2,737 |
| Kimi-K3 (fuente) | 95,5269 % | 1260/1319 | 1/1319 | 530,362 s | 2,487 |

Regresion declarada: 61,1069 puntos porcentuales frente al modelo fuente y 33,8135 puntos frente a pruned50. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, tareas multimodales) en la informacion disponible.

Datos de servicio medidos por el autor con vLLM `0.26.1rc1.dev142+g30b4e7f47` y FlashInfer `0.6.16rc5`:

| Metrica | Valor |
|---|---|
| Hardware | 4x NVIDIA GB300, 284.208 MiB cada una |
| Paralelismo | TP=4, un nodo |
| Tiempo de carga de pesos | 210,80 s |
| Memoria de modelo por GPU | 119,06 GiB |
| KV cache disponible por GPU | 132,14 GiB |
| Capacidad de KV cache | 7.615.283 tokens |
| Asignacion estable por GPU | ~262,90 GiB |

## Requisitos de hardware

- Inferencia minima validada: 4x NVIDIA GB300 (284 GB de HBM3e cada una) con TP=4 en un solo nodo; el autor reporta 119,06 GiB de pesos por GPU y ~262,90 GiB de asignacion estable por GPU.
- El repositorio ocupa 475,2 GB en safetensors, por lo que el almacenamiento local debe superar esa cifra antes de cargar; el peso en 8-bit indicado en los tags no reduce el tamano del repositorio descargado.
- No cabe en GPUs de consumo: con ~737 B de parametros totales y pesos en 8-bit, la huella minima ronda los cientos de GB, muy por encima de los 24 GB de una RTX 4090 o los 48 GB de una RTX 6000 Ada. Se requiere hardware de centro de datos (GB300, H100 80 GB en configuraciones multi-GPU, B200) con tensor parallelism.
- Despliegue recomendado: vLLM con `--trust-remote-code`, `--tensor-parallel-size 4`, `--moe-backend auto`, `--attention-backend FLASHINFER_MLA`, `--kv-cache-dtype fp8`, `--enable-prefix-caching`, `--gpu-memory-utilization 0.95`, `--max-model-len 32768`, `--max-num-seqs 8` y `--max-num-batched-tokens 8192`, segun la configuracion validada por el autor.
- Throughput medido en el harness GSM8K: 2,459 preguntas/s con 8 secuencias maximas en batch; latencia total de 536,326 s para 1.319 preguntas (5-shot, 256 tokens de salida).
- llama.cpp, Ollama y TGI no estan documentados para este checkpoint en la informacion disponible; el formato safetensors con `custom_code` y el tamano lo hacen poco viable fuera de stacks con soporte explicito de `kimi_k3`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos por capa MoE | GSM8K (5-shot) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Kimi-K3-pruned75 | ~737 B | 224 (de 896) | 34,42 % | Kimi K3 License | HuggingFace, copia en `vllm-project` |
| Kimi-K3-pruned50 | no disponible | 448 (de 896, mismo ranking) | 68,23 % | Kimi K3 License | HuggingFace (`mgoin/Kimi-K3-pruned50`) |
| Kimi-K3 (fuente) | no disponible | 896 | 95,53 % | Kimi K3 License | HuggingFace (`moonshotai/Kimi-K3`) |

Los tres checkpoints comparten arquitectura, tokenizador, torre de vision y criterio de seleccion de expertos; la unica variable es el porcentaje de expertos retenidos. No se dispone de datos de benchmarks de otros modelos MoE comparables en la informacion proporcionada, por lo que la comparativa se limita a la familia Kimi-K3.

## Limitaciones y advertencias

- Regresion de calidad severa y documentada: 34,42 % en GSM8K frente al 95,53 % del modelo fuente. El autor lo describe como "experimental prototype" y advierte de "large quality regression"; no debe usarse como sustituto del modelo completo en tareas reales.
- El pruning es calibration-free y no usa REAP ni ninguna tecnica con datos de calibracion; el ranking por suma con signo del router es una heuristica que descarta expertos potencialmente importantes para dominios especificos.
- Riesgo elevado de alucinacion y de razonamiento incorrecto, especialmente en matematicas y tareas multi-paso, derivado de la perdida de expertos y no solo de la naturaleza del modelo base.
- Sesgos conocidos del modelo fuente: no disponible en la informacion proporcionada; se heredan los del checkpoint original sin evaluacion adicional.
- Idiomas soportados: no disponible; no se ha verificado el comportamiento multilingue tras el pruning.
- Licencia Kimi K3 License (`license: other`): es una licencia custom, no Apache 2.0 ni MIT. Antes de cualquier uso comercial hay que revisar el texto en el repositorio del modelo fuente; el checkpoint derivado se distribuye bajo la misma licencia upstream.
- El tail fusion de latent-MoE de Kimi K3 no soporta TP=4 y cae al camino por defecto; el autor confirma que el servicio sigue sano, pero implica que no se esta ejercitando esa ruta optimizada.
- La copia en `vllm-project` existe para reducir riesgo de cadena de suministro en CI; no es una version mantenida ni soportada para produccion, y el checkpoint original vive en una cuenta personal (`mgoin`).
- No hay informacion sobre cuantizaciones GGUF/AWQ/GPTQ validadas, ni sobre tool calling o agentes; asumir su disponibilidad seria especulativo.

## Enlaces

- HuggingFace (copia vLLM): https://huggingface.co/vllm-project/Kimi-K3-pruned75
- Checkpoint original: https://huggingface.co/mgoin/Kimi-K3-pruned75
- Checkpoint pruned50 de referencia: https://huggingface.co/mgoin/Kimi-K3-pruned50
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Licencia Kimi K3: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Soporte REAP en llm-compressor (PR 2980): https://github.com/vllm-project/llm-compressor/pull/2980/
- Repositorio vLLM: https://github.com/vllm-project/vllm
