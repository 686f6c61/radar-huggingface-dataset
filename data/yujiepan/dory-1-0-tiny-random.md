# yujiepan/dory-1.0-tiny-random

## Resumen

`yujiepan/dory-1.0-tiny-random` es un checkpoint de depuracion de dimensiones reducidas construido a partir de la arquitectura Dory de NVIDIA (modelo base `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`). No es un modelo entrenado: sus pesos se inicializan de forma aleatoria y su unico proposito es validar la implementacion de referencia de Dory en vLLM, el cargador de tensores en paralelo y las rutinas de normalizacion nGPT distribuidas. Con 689.248 parametros totales y un fichero safetensors de 1,4 MB, sirve como banco de pruebas de infraestructura, no como modelo de produccion.

La relevancia tecnica esta en que preserva fielmente el esquema de la arquitectura original: dos pasadas recurrentes, reinyeccion de entrada, residuales nGPT, ciclo de atencion SWA (sliding window attention) y atencion completa, y matrices de tokens BF16 no atadas (*untied*). Esto permite reproducir el grafo de computo real de Dory con un coste de memoria despreciable, lo que facilita la validacion de kernels, el cacheo por bucle y por ultima pasada, y CUDA Graph sin necesidad de reservar GPUs de gama alta durante el desarrollo.

El modelo se distribuye con una runtime propia empaquetada que registra Dory en cada worker de vLLM. Transformers no dispone de implementacion nativa de Dory ni de `auto_map` de origen, por lo que el uso esta restringido a vLLM con `trust_remote_code=True`. La model card documenta validacion en cuatro NVIDIA H20 con TP=4, FlashAttention y CUDA Graph, con peticiones en ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dory (transformer hibrido con pasadas recurrentes, residuales nGPT y ciclo SWA/atencion completa) |
| Parametros totales | 689.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos usan `max_model_len=2048` |
| Tipos de cuantizacion | no disponible (checkpoint en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible oficialmente; validado en ingles y chino en las pruebas del autor |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), 1.412.480 bytes en `model.safetensors` |
| Sublayers entrada/recurrentes/salida | 16 / 16 / 16 |
| Pasadas recurrentes | 2 |
| Ciclo SWA/full | 3 pares SWA+MLP y luego full+MLP; dos ciclos por particion |
| Vocabulario / atado de embeddings | 131.072 / false |
| Hidden width / MLP width | 2 / 32 |
| Cabezas Q / KV / head dim | 4 / 1 / 32 |
| Precision del checkpoint | BF16 |
| Libreria | vllm |
| Modelo base | nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 |

## Arquitectura y entrenamiento

El checkpoint replica el esquema de Dory con anchos reducidos: `hidden_size=2`, `intermediate_size=32`, `num_hidden_layers=48` (16 subcapas de entrada, 16 recurrentes y 16 de salida), 4 cabezas de atencion y 1 cabeza KV con dimension 32. Mantiene las dos pasadas recurrentes del modelo original, la reinyeccion de la entrada en cada pasada, los residuales nGPT y la alternancia de atencion SWA y atencion completa en ciclos de tres pares SWA+MLP seguidos de un par full+MLP. Las matrices de tokens de entrada y salida no estan atadas y se conservan en BF16.

No hay entrenamiento: los pesos se inicializan aleatoriamente siguiendo el esquema de tensores del modelo fuente. La model card justifica la eleccion de `hidden_size=2` frente a `1` porque la normalizacion escalar de nGPT colapsa el estado latente y hace que una y dos pasadas recurrentes produzcan estados finales identicos; con ancho 2 se conservan actualizaciones recurrentes continuas. El repositorio incluye una runtime de vLLM fijada a un commit concreto (`b5007e42b09c3990685fe564a31ae6917394a80b`) que implementa carga vectorial en tensor-parallel y normalizacion nGPT distribuida. Se documenta validacion con TP=1 y TP=4 sobre prompts en ingles, chino y uno de 1.100 tokens, con diferencias de logprob de hasta 0,000644 entre configuraciones y token IDs identicos.

## Capacidades

- Generacion de texto autoregresiva bajo vLLM, con sampler nativo (sin JIT de FlashInfer).
- Soporte de chat mediante `apply_chat_template` del tokenizer asociado.
- Atencion con FlashAttention y captura de CUDA Graph.
- Tensor parallelism validado en TP=1 y TP=4.
- Cacheo por bucle (`per_loop`) y por ultima pasada (`last_loop`).
- Ejecucion de prompts largos (probado con 1.100 tokens) y generacion de secuencias cortas de 10 tokens en las pruebas.
- No hay evidencia de tool calling, razonamiento multi-paso, vision, audio ni modo thinking: al ser un modelo de depuracion con pesos aleatorios, estas capacidades no aplican.

## Casos de uso

- Validacion de la implementacion de Dory en vLLM: sirve para comprobar que el registro del modelo, la carga de tensores y el grafo de atencion funcionan antes de desplegar el checkpoint de 4B, sin consumir VRAM significativa.
- Pruebas de tensor parallelism: permite verificar que TP=1 y TP=4 producen los mismos token IDs y diferencias de logprob despreciables, como paso previo a escalar el modelo real.
- Depuracion de cacheo recurrente: al conservar los modos `per_loop` y `last_loop`, se puede validar la coherencia del estado entre pasadas recurrentes en un entorno controlado.
- Integracion continua de kernels: util para pipelines de CI que necesiten ejecutar el grafo de Dory con CUDA Graph y FlashAttention sin depender de GPUs de gran memoria.
- Pruebas de servidor HTTP de vLLM: el ejemplo `vllm serve` documentado permite validar endpoints de chat y completion con `--hf-overrides` especificos de Dory.
- Formacion y desarrollo de infraestructura: sirve como referencia para implementar el `auto_map` y el esquema de tensores de Dory en otros frameworks o backends.
- Validacion multilingue de tokenizer: los ejemplos en ingles y chino permiten comprobar el pipeline de tokenizacion y plantillas de chat del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de correctitud (token IDs identicos entre TP=1 y TP=4, diferencia maxima de logprob de 0,000644) y verificacion de ejecucion en cuatro NVIDIA H20 con TP=4, FlashAttention y CUDA Graph.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para pesos en BF16 (1,4 MB de safetensors); el consumo real lo domina el overhead de vLLM y la cache KV, no el modelo.
- GPU recomendadas: cualquier GPU compatible con FlashAttention y CUDA Graph; el autor valido en cuatro NVIDIA H20.
- Cabe en GPU consumer: si, en cualquier GPU moderna con soporte de FlashAttention (por ejemplo, RTX 30xx/40xx con CUDA adecuada), aunque no se documenta validacion explicita en consumer.
- Opciones de despliegue: exclusivamente vLLM con `trust_remote_code=True` y la runtime incluida (`pip install --no-deps <snapshot directory>`); Transformers no tiene implementacion de Dory.
- Configuracion de referencia: `tensor_parallel_size=4`, `max_model_len=2048`, `max_num_batched_tokens=256`, `max_num_seqs=4`, `gpu_memory_utilization=0.2`, `cudagraph_capture_sizes=[1,2,4,8]`.
- Latencia y throughput: no disponibles; las pruebas generan 10 tokens por peticion y no reportan metricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/dory-1.0-tiny-random | 689.248 | no disponible (ejemplos a 2048) | Depuracion de la arquitectura Dory en vLLM | no disponible | Hugging Face, runtime propia |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | ~4B (3.975.229.440 elementos BF16) | no disponible | Modelo Dory completo de NVIDIA | no disponible | Hugging Face |
| Otros checkpoints tiny-random de Hugging Face | variable | variable | Validacion de arquitecturas en frameworks | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre el checkpoint tiny y el modelo base de 4B en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce texto coherente y no debe usarse en produccion ni para evaluacion de calidad.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base de NVIDIA antes de cualquier despliegue.
- Dependencia estricta de vLLM y de la runtime empaquetada: no funciona con Transformers ni con otros backends sin implementacion adicional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.
- Contexto maximo no documentado: los ejemplos usan 2048 tokens, pero no se especifica la ventana nativa del modelo base.
- Idiomas no declarados oficialmente; solo hay evidencia empirica de ingles y chino en las pruebas del autor.
- Riesgo de alucinacion no aplicable en el sentido habitual, pero la salida es esencialmente ruido estadistico.
- El checkpoint se creo con `hidden_size=2` por limitaciones de la normalizacion nGPT; no reproduce fielmente la dinamica numerica del modelo de 4B.
- No hay garantia de mantenimiento: el repositorio se actualizo por ultima vez en noviembre de 2026 y depende de un commit fijo de vLLM.

## Enlaces

- Hugging Face: https://huggingface.co/yujiepan/dory-1.0-tiny-random
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Repositorio vLLM: no disponible en la informacion proporcionada
- Paper de Dory: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
