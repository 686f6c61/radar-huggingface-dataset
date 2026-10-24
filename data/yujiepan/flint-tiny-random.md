# yujiepan/flint-tiny-random

## Resumen

`yujiepan/flint-tiny-random` es un checkpoint de depuración de 10.896.424 parámetros, inicializado de forma aleatoria (semilla 42, `torch.randn * 0.02` en BF16), cuya única finalidad es verificar que el *toolchain* de carga e inferencia del modelo Flint funciona correctamente. No es un modelo entrenado: es una réplica estructural en miniatura de `RecursiveSI/flint`, generada por el usuario yujiepan para poder ejecutar el plugin `flint_sglang` de SGLang sin necesidad de una GPU de gran capacidad ni de los pesos reales.

El modelo reproduce el esquema de tensores y nombres del checkpoint original (atención con *learned sinks*, router sigmoide con top-k renormalizado, experto compartido, normas Q/K y capas sin RoPE), pero reduce la geometría a 8 capas, `hidden_size` 32, 1 cabeza de atención y 64 expertos enrutados. El vocabulario se mantiene fijo en 150.144 entradas con *embedding* y LM-head sin atar, lo que impone el tamaño mínimo práctico del checkpoint (21,9 MB en `model.safetensors`).

Su relevancia es puramente de ingeniería: Flint no está implementado en Transformers y requiere un plugin externo de SGLang (`flint_sglang-0.1.4`). Este tiny permite hacer *smoke tests* de carga, de los parsers de *tool calling* y razonamiento, y del *grammar backend* en CI, sin depender de un modelo de 40B. No debe usarse para generación de texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE disperso (estilo Flint): prefijo denso, router sigmoide top-k, experto compartido, normas Q/K y *learned attention sinks*; capas sin RoPE segun `no_rope_layer_indices` |
| Parametros totales | 10.896.424 (dato real del `model.safetensors`) |
| Parametros activos | no disponible (top-6 de 64 expertos enrutados por token) |
| Longitud de contexto | 4.096 tokens (`max_position_embeddings` en la config del tiny) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye solo en BF16 (no hay GGUF publicado) |
| Idiomas soportados | no disponible (pesos aleatorios, sin entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (BF16), archivo unico `model.safetensors` de 21,9 MB |

## Arquitectura y entrenamiento

No hay entrenamiento. El autor parte del `config.json` de `RecursiveSI/flint` (revision `2a247be0c0aec895ccb0ac7ca92229ec6df37288`), lo reescribe con una geometria minima y genera cada tensor con `torch.randn(..., dtype=torch.bfloat16).mul_(0.02)` bajo semilla fija. Las normas (`input_layernorm`, `post_attention_layernorm`, `q_norm`, `k_norm`, `model.norm`) se inicializan a unos. La generacion directa del checkpoint es necesaria porque Transformers no implementa la clase Flint; los nombres y formas de los tensores se toman de las cabeceras safetensors del modelo fuente y del *loader* `flint_sglang` proporcionado por el autor original.

Del modelo fuente se conservan los rasgos estructurales: 150.144 entradas de vocabulario con *embedding* y LM-head **sin atar**, dos capas densas de prefijo (capas 0-1) seguidas de capas MoE, router sigmoide con renormalizacion top-k, experto compartido junto a los enrutados, *learned sinks* en la atencion y normas Q/K. La cadencia de atencion del tiny son las 8 primeras capas del calendario de 49 capas del fuente. Diferencias clave frente al original: 49 capas frente a 8, `hidden_size` 2.048 frente a 32, 32 cabezas Q y 4 KV con `head_dim` 128 frente a 1/1 con `head_dim` 32, 256 expertos frente a 64, y anchuras MoE/compartida de 512/1.024 frente a 32/64. El plugin fuente valida explicitamente solo TP=1, por lo que este checkpoint no reclama soporte de TP=4 ni de paralelismo de expertos o de pipeline.

## Capacidades

- No genera texto coherente: los pesos son aleatorios, por lo que la perplejidad y la salida carecen de significado. Cualquier capacidad linguistica es inexistente por construccion.
- Verificacion de carga del checkpoint: valida que el plugin `flint_sglang` mapea correctamente nombres y formas de tensores (atencion, MoE, experto compartido, sinks, normas Q/K).
- Ejercicio del router MoE: 64 expertos con top-6 activo y renormalizacion sigmoide, util para probar kernels de *dispatch/combine* y el `--moe-runner-backend triton`.
- Soporte de *tool calling* y *reasoning parser*: el plugin declara `--tool-call-parser flint`, `--reasoning-parser flint` y `--grammar-backend flint`; el tiny permite recorrer esos caminos de codigo aunque la salida no sea valida.
- Compatibilidad con `--enable-fp32-lm-head` y `--attention-backend fa3`, es decir, sirve para comprobar la ruta de LM-head en fp32 y el backend de atencion FlashAttention 3.
- Tokenizer y vocabulario reales del fuente (150.144 entradas), lo que permite probar rutas de tokenizacion, limites de vocabulario y *padding*.
- No dispone de vision, audio, modo *thinking* real ni capacidades multilingues: no hay datos que las respalden.

## Casos de uso

- **Integracion continua del plugin Flint**: ejecutar un *smoke test* en cada PR que verifique que `pip install ./sglang/flint_sglang-0.1.4-py3-none-any.whl` y `python -m sglang.launch_server --model-path tiny-random/flint` arrancan sin error, con un coste de 22 MB de pesos y sin GPU dedicada.
- **Desarrollo de kernels de atencion con sinks**: el tiny conserva `self_attn.softmax_offset` y las normas Q/K con `head_dim` 32, lo que permite validar kernels FlashInfer/Triton con formas pequenas y tiempos de compilacion bajos antes de pasar al modelo de 40B.
- **Depuracion del enrutador MoE**: con 64 expertos y top-6 se pueden provocar y reproducir desbalances de carga, casos limite de renormalizacion sigmoide y errores de indexacion de expertos en minutos, en lugar de iterar sobre el checkpoint completo.
- **Pruebas de los parsers de herramienta y razonamiento**: ejercitar `--tool-call-parser flint`, `--reasoning-parser flint` y `--grammar-backend flint` de extremo a extremo (peticion HTTP, generacion, parseo de la respuesta) comprobando que el *plumbing* funciona aunque el contenido generado sea ruido.
- **Validacion de conversion y cuantizacion**: usar las formas conocidas del tiny como referencia para comprobar scripts de conversion de safetensors a otros formatos, o para verificar el mapeo de tensores antes de aplicar cuantizacion al modelo real.
- **Pruebas de regresion de la API de SGLang**: validar el planificador, el manejo de `--served-model-name`, el limite de contexto de 4.096 tokens, el batching continuo y el comportamiento de timeouts con un modelo que arranca en segundos.
- **Reproduccion de bugs reportados**: al compartir esquema de tensores con el fuente, permite reproducir fallos de carga o de *shape mismatch* sin necesidad de descargar decenas de GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es de inicializacion aleatoria, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria equivalente a azar y no aporta informacion.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en BF16 (21,9 MB de pesos mas activaciones y cache KV de 8 capas con 1 cabeza KV y `head_dim` 32, despreciable incluso a 4.096 tokens).
- Cabe holgadamente en CPU y en cualquier GPU consumer; no requiere GPU dedicada para arrancar.
- GPUs recomendadas: cualquiera con soporte de BF16 para pruebas; para el backend `fa3` se necesita una GPU compatible con FlashAttention 3 (serie Hopper), aunque para depuracion basta con backends alternativos.
- Opciones de despliegue: SGLang exclusivamente, mediante el plugin externo `flint_sglang` (no funciona con SGLang *stock* ni con vLLM, TGI, llama.cpp u Ollama, ya que no existe implementacion de Flint en Transformers ni conversion GGUF publicada).
- Variables y flags relevantes en el arranque: `SGLANG_EXTERNAL_MODEL_PACKAGE=flint_sglang`, `FLASHINFER_USE_CUDA_NORM=1`, `--tp-size 1`, `--attention-backend fa3`, `--moe-runner-backend triton`, `--enable-fp32-lm-head`.
- Latencia y throughput: no disponibles; el autor marca el ejemplo de uso como "unverified".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| `yujiepan/flint-tiny-random` | 10,9 M | 4.096 | Depuracion del plugin Flint en SGLang | no disponible | safetensors BF16 |
| `RecursiveSI/flint` (fuente) | ~40B MoE con ~2,5B activos (cifra reportada en una publicacion de X, no verificada en la model card) | no disponible | Modelo de codigo para ejecucion local | no disponible | safetensors BF16 |
| `yujiepan/deepseek-v4.1-flash-1017-tiny-random` | no disponible | no disponible | Tiny aleatorio para depuracion de otra arquitectura | no disponible | safetensors |
| `yujiepan/llama-3.1-tiny-random` | no disponible (el perfil lista otros tiny de ~1 M) | no disponible | Tiny aleatorio para depuracion de arquitectura Llama | no disponible | safetensors |

La comparacion relevante no es de calidad, sino de fidelidad estructural: frente a otros `tiny-random` del mismo autor (Llama 3.1, DeepSeek), este es el unico que replica el esquema Flint con router sigmoide, experto compartido y *attention sinks*, y el unico que exige un plugin de SGLang no incluido en el paquete oficial.

## Limitaciones y advertencias

- Pesos aleatorios: la salida es ruido estadistico. No debe desplegarse en ningun caso de uso real, demo publica ni evaluacion de calidad.
- No es representativo del modelo fuente: `hidden_size` 32 frente a 2.048, 8 capas frente a 49 y 64 expertos frente a 256 invalidan cualquier extrapolacion de rendimiento, latencia o consumo de memoria.
- Solo valida TP=1: el plugin fuente marca explicitamente tensor, expert y pipeline parallelism como no validados; este checkpoint no reclama soporte multi-GPU.
- Dependencia de un wheel externo no publicado en PyPI: sin `flint_sglang-0.1.4-py3-none-any.whl`, el modelo no carga. Riesgo de rotura si el plugin cambia de esquema.
- El ejemplo de uso esta marcado como "unverified" por el propio autor; no hay garantia de que el arranque funcione en todas las versiones de SGLang.
- Licencia no declarada: no hay base legal explicita para uso comercial del checkpoint ni certeza sobre la licencia heredada de `RecursiveSI/flint`. Conviene verificar la licencia del modelo base antes de cualquier uso derivado.
- Idiomas y sesgos: no disponibles y no evaluables, al no existir entrenamiento. No se puede afirmar soporte multilingue.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ, por lo que no es util para probar rutas de inferencia cuantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yujiepan/flint-tiny-random
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Perfil del autor en HuggingFace: https://huggingface.co/yujiepan
- Otro tiny del mismo autor (DeepSeek): https://huggingface.co/yujiepan/deepseek-v4.1-flash-1017-tiny-random
- Perfil del autor en GitHub: https://github.com/yujiepan-work
- Cobertura periodistica del lanzamiento de Flint: https://tech.yahoo.com/ai/meta-ai/articles/recursive-launches-flint-laptop-coding-202741380.html
- Comentario sobre Flint en X (cifra de 40B MoE / 2,5B activos): https://x.com/pidotdev/status/2112978311252979761
