# xpashkin/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-6.6bpw

## Resumen

Qwen3.8-Flash-Next iQ-MLX 6.6 bpw (v2) es una cuantizacion calibrada con imatrix del modelo Qwen/Qwen3.8-Flash-Next, un MoE de 133B de la familia Qwen4 con 48 capas, 512 expertos por capa y una atencion hibrida que combina capas GDN (con estado SSM constante) y capas QSA de atencion dispersa. La publica el usuario xpashkin dentro del ecosistema mlx-serve, un motor de inferencia para Apple Silicon, y esta pensada especificamente para ejecutarse en Macs de 128 GB de memoria unificada.

El paquete no es una simple conversion a 4 bits: se ha calibrado con una imatrix de 829.000 tokens procedente de unsloth, se ha asignado 6 bits a los expertos, 8 bits a las partes no experto y a la cabeza MTP, y se ha incorporado una tabla de embeddings n-gram (PLE) de 51.200 millones de entradas cuantizada a 8 bits con group size 32. El resultado son unos 153 GiB en disco, de los cuales solo ~100-112 GB quedan residentes en memoria, ya que la tabla n-gram se mantiene en la cache de paginas.

Su relevancia practica es que permite servir un modelo de ~130.000 millones de parametros con 262.144 tokens de contexto en hardware de sobremesa de Apple, con decodificacion especulativa mediante MTP activada por defecto, API compatible con OpenAI y soporte de vision, herramientas y razonamiento. El coste es que queda atado a macOS y al runtime mlx-serve, sin soporte para vLLM, llama.cpp o GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida (Qwen4): 48 capas, 512 expertos por capa, atencion GDN + QSA dispersa, cabeza MTP, torre de vision Qwen3-VL |
| Parametros totales | 130.053.111.724 (~130B; el autor indica 133B para el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (validado a 241k con ~120-122 GB cableados) |
| Tipos de cuantizacion | Expertos: affine 6-bit gs64 con imatrix (98,3 GB); no experto + MTP: affine 6-bit / 8-bit; lm_head: 8-bit; embed_tokens: 4-bit; tabla n-gram PLE: 8-bit gs32 (57,6 GB); torre de vision: bf16 passthrough |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como license: other) |
| Formato de pesos | safetensors en formato MLX (libreria mlx-serve); existe version GGUF del modelo base publicada por unsloth |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE de tipo Qwen4 con 48 capas y 512 expertos por capa, sobre el que se aplica una atencion hibrida: 36 capas GDN que arrastran un estado SSM de tamano constante y 12 capas QSA con atencion dispersa que mantienen KV por token. Esa asimetria es la que hace que la cache KV sea barata: 7,28 GB para los 262.144 tokens completos (unos 28 KB por token en las capas QSA), de modo que dos contextos completos en bf16 sin cuantizar ocupan aproximadamente 14,6 GB. Sobre el tronco se anade una cabeza MTP (multi-token prediction) en linea, usada para decodificacion especulativa, y una torre de vision Qwen3-VL de 333 tensores que se conserva en bf16.

No hay informacion en la model card sobre el dataset de preentrenamiento del modelo base, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden a Qwen y no se reproducen aqui. Lo que si se documenta es el proceso de cuantizacion: la imatrix proviene de unsloth/Qwen3.8-Flash-Next-GGUF (corpus de 829.000 tokens, formato f32 con pares `<weight>.in_sum2` y `<weight>.counts`, 1852 tensores) y se reasigna a safetensors con nombres HF, con cobertura de 866 de 866 claves (expertos, experto compartido, router, GDN, QSA, hyper-connections y ple); la cabeza MTP queda intencionadamente fuera de la calibracion. La receta completa se reproduce en un equipo Linux de 12 nucleos con 89 GB de RAM y ~1 TB de NVMe en unas 7 horas (5,5 h de descarga del bf16 de 360 GB y 1,3 h de conversion). La v2 corrige a la v1 elevando a 6 bits los 96 grupos de expertos y a 8 bits las partes no experto.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventanas de hasta 262.144 tokens.
- Razonamiento explicito: el servidor expone el parametro de reasoning en la API.
- Vision: incorpora la torre Qwen3-VL ViT (333 tensores), por lo que procesa imagenes ademas de texto.
- Tool calling y function calling a traves de la API compatible con OpenAI.
- Descodificacion especulativa mediante cabeza MTP, activada por defecto; el autor indica que las salidas son identicas por ser especulativa.
- Endpoints compatibles con OpenAI y Anthropic: `/v1/chat/completions`, `/v1/completions`, `/v1/responses` y `/v1/messages`.
- Soporte de `logprobs` por peticion y de un override de `kv_quant` a nivel de request.
- Decodificacion por lotes activada por defecto, con paralelismo configurable mediante el presupuesto de cache KV (`--prefix-cache-mem`).
- Cache de prefijo, util para sesiones multi-turno con prompts repetidos.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local: con 262.144 tokens de contexto el modelo puede ingerir repositorios completos o varios ficheros grandes de una sola vez, y su soporte de tool calling permite conectarlo a un sandbox de ejecucion o a un servidor MCP sin salir del Mac.
- Analisis de documentos largos: informes, expedientes o tesis de cientos de paginas caben en una unica ventana, con un coste de cache KV de 7,28 GB para el contexto completo, lo que evita trocear y recomponer el material.
- Atencion al cliente automatizada: la API compatible con OpenAI y la cache de prefijo permiten mantener conversaciones multi-turno con un system prompt largo y estable reutilizado entre peticiones.
- Servicio de inferencia en solitario para un equipo pequeno: un M4 Max de 128 GB sirviendo a traves de `mlx-serve` con decodificacion por lotes (parallel 2 medido a ~650 tok/s de prefill y ~72 tok/s de decodigo por peticion) cubre prototipos y uso interno sin depender de APIs externas.
- Procesamiento de documentos con imagenes: la torre de vision integrada permite extraer y razonar sobre capturas, diagramas o paginas escaneadas junto al texto asociado.
- Evaluacion e investigacion de cuantizaciones: el repositorio incluye la receta de conversion reproducible, por lo que sirve como referencia para estudiar el impacto de imatrix, bits por peso y group size en un MoE grande.
- Agentes con razonamiento multi-paso: el modo de razonamiento y el soporte de herramientas permiten cadenas de planificacion y llamadas encadenadas manteniendo el estado en contexto largo.
- Generacion de codigo asistida en el editor: al ser local, no hay envio de codigo propietario a terceros, lo que encaja en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card).

Las unicas mediciones publicadas son de rendimiento de inferencia en un M4 Max de 128 GB con mlx-serve 26.10.2, con prompts unicos sin aciertos de cache de prefijo y decodificacion de 96 tokens:

| Contexto (real) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| 1,5k | 441 | 92,8 |
| 6k | 781 | 61,7 |
| 12k | 760 | 76,5 |
| 24k | 749 | 81,3 |
| 48k | 736 | 69,4 |
| 98k | 707 | 78,3 |
| 195-197k | 608-671 | 62-65 |
| 241k | 575 | 52,8 |

En paralelo 2 (dos peticiones de 25k concurrentes) se midieron ~650 tok/s de prefill y ~72 tok/s de decode por peticion, un 10 % por debajo del modo individual. Las cifras corresponden a la v1; el autor espera variaciones de pocos puntos porcentuales en la v2.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con 128 GB de memoria unificada. El autor valida en un M4 Max de 128 GB.
- Memoria residente: ~100-112 GB en total; los pesos ocupan 98 GB del presupuesto de GPU y el limite cableado llega a ~120-122 GB sobre el tope de 126 GB con contexto de 241k.
- Tabla n-gram PLE (57,6 GB): permanece en la cache de paginas, no residente. No debe pasarse `--ple-gpu`, ya que fijaria los 53,6 GB de la tabla en memoria de GPU.
- Cache KV: 7,28 GB para los 262.144 tokens completos en bf16 sin cuantizar; ~14,6 GB para dos contextos completos.
- Espacio en disco: ~153 GiB para el paquete (105,2 GB de indice mas 57,6 GB de n-gram). El repositorio en HuggingFace ocupa 208,4 GB.
- GPU NVIDIA (A100, H100, RTX 4090) y CUDA: no soportado; el formato es MLX y el runtime es mlx-serve.
- GPU de consumo: no aplica en el sentido habitual; no cabe en GPUs de consumo con 24 GB. Para hardware de consumo con CUDA habria que recurrir a las cuantizaciones GGUF del modelo base publicadas por unsloth con llama.cpp.
- Despliegue: `mlx-serve` (CLI y servidor), instalado via Homebrew (`brew tap ddalcu/mlx-serve`). No hay soporte documentado para vLLM, TGI u Ollama.
- Comando de referencia: `mlx-serve --model xpashkin/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-6.6bpw --serve --port 11234 --prefix-cache-mem 10GB --os-reserve-gib 2 --ctx-size 262144`.
- Throughput: prefill de 575-780 tok/s en todo el rango de contexto, con una ligera caida a partir de ~100k; decode de 53-93 tok/s, practicamente independiente del contexto gracias a la atencion dispersa.
- Limitacion conocida de MLX estandar (<= 0.32.3): el asignador Metal cuenta buffers en cache contra el limite de asignacion del dispositivo (~499k objetos), lo que puede provocar errores de "out of GPU memory" en sesiones multi-turno muy largas con cache de prefijo caliente. Workarounds: `MLX_SERVE_CACHE_LIMIT=2GB` o `--no-mtp` como ultima opcion. El autor indica que esta corregido en una compilacion local parcheada de libmlx, con PR pendiente en upstream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato / runtime | Tamano en disco | Licencia |
|---|---|---|---|---|---|---|
| xpashkin/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-6.6bpw | ~130B (MoE) | 262.144 | 6-8 bits imatrix | safetensors MLX / mlx-serve | ~153 GiB | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 133B (MoE) | no disponible | bf16 | safetensors / transformers | 360 GB (144 ficheros) | qwen-community-1.0 |
| unsloth/Qwen3.8-Flash-Next-GGUF | 133B (MoE) | no disponible | GGUF con imatrix | GGUF / llama.cpp y derivados | no disponible | qwen-community-1.0 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento entre estas variantes. La comparativa se limita por tanto a formato, tamano y plataforma de ejecucion: la version de xpashkin es la unica de las tres pensada para Apple Silicon con memoria unificada de 128 GB, mientras que la GGUF de unsloth apunta a llama.cpp y la bf16 requiere hardware de servidor.

## Limitaciones y advertencias

- El modelo base es un Qwen y, por tanto, puede reproducir sesgos presentes en sus datos de preentrenamiento; no hay informacion sobre evaluaciones de sesgo en la model card.
- Riesgo de alucinacion propio de los modelos generativos: no se han publicado benchmarks que permitan acotarlo, ni datos de MMLU, HumanEval o GSM8K para esta cuantizacion.
- La cuantizacion a 6 bits en expertos y 8 bits en el resto introduce perdida frente al modelo base en bf16; no se documenta la degradacion de calidad medida.
- La cabeza MTP queda fuera de la calibracion imatrix (el autor lo indica explicitamente), por lo que su cuantizacion no esta guiada por el corpus de calibracion.
- La licencia es qwen-community-1.0, etiquetada como `license: other`. No se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que hay que consultar el texto de la licencia antes de desplegarlo en produccion.
- Dependencia fuerte de plataforma: requiere Apple Silicon, macOS y el runtime mlx-serve. No hay soporte para vLLM, TGI, Ollama ni CUDA.
- Requiere 128 GB de memoria unificada; no es desplegable en equipos de 64 GB ni en GPUs de consumo.
- El bug del asignador Metal de MLX estandar (<= 0.32.3) puede abortar peticiones en sesiones largas con cache de prefijo, con workarounds que reducen el rendimiento o el uso de MTP.
- Los benchmarks de rendimiento publicados corresponden a la v1, no a la v2, y a un unico equipo (M4 Max 128 GB); el autor estima variaciones de pocos puntos porcentuales.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que limita la validacion independiente de la cuantizacion.
- No se especifican los idiomas soportados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xpashkin/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-6.6bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF del modelo base y origen de la imatrix: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Runtime mlx-serve: https://github.com/ddalcu/mlx-serve
- Formula de Homebrew: `brew tap ddalcu/mlx-serve https://github.com/ddalcu/mlx-serve`

No se han encontrado en la informacion proporcionada papers, blogs, demos ni otros repositorios adicionales asociados a esta publicacion.
