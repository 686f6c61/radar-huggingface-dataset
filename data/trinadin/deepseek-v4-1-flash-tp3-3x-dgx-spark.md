# trinadin/DeepSeek-V4.1-Flash-TP3-3x-DGX-Spark

## Resumen

DeepSeek-V4.1-Flash-TP3-3x-DGX-Spark es una receta de despliegue (serving recipe) publicada por el usuario trinadin en Hugging Face, no un modelo de pesos en sentido estricto. Su proposito es documentar y empaquetar la configuracion necesaria para servir el modelo base DeepSeek-V4.1-Flash-1017 (552B parametros totales, arquitectura MoE nativa FP4+FP8 con un bloque de memoria condicional "engram" de 196B) en tensor-parallel de grado 3 sobre tres nodos NVIDIA DGX Spark conectados mediante un triangulo RoCE de 200G. La receta incluye una imagen Docker con digest fijado, scripts de arranque, un kit de verificacion de identidad del motor y una guia de validacion.

El interes de esta ficha es practico: describe como llevar un modelo de 552B parametros a un cluster de tres estaciones de trabajo con memoria unificada, alcanzando 1M de contexto con un pool de KV de aproximadamente 5,1M tokens y decodificacion especulativa DSpark k=5. La receta reporta cifras concretas sobre su propia configuracion: unos 105 tok/s en un solo stream (35-40 tok/s en prosa), 420 tok/s con 8 streams, 470 tok/s con 16 streams y un primer token de aproximadamente 1 s para peticiones de chat que llegan junto a un prefill profundo.

Conviene subrayar que el repositorio no contiene pesos ni un modelo afinado: es una receta de serving con licencia MIT, etiquetada como `serving-recipe`, `tensor-parallel`, `dgx-spark` y `long-context`, que referencia como base a `deepseek-ai/DeepSeek-V4.1-Flash-1017`. Cualquier evaluacion del modelo subyacente debe hacerse contra el repositorio de DeepSeek, no contra este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE nativa FP4+FP8 con bloque de memoria condicional (engram) de 196B parametros |
| Parametros totales | 552B (modelo base DeepSeek-V4.1-Flash-1017) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (perfil de serving con ~5,1M tokens de pool KV) |
| Tipos de cuantizacion | FP4 y FP8 nativos en los expertos; internals de atencion en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de ~510 GB, 48 shards, 12 entradas de indice engram) |
| Libreria de serving | vLLM (imagen `eugr/spark-vllm-b12x`, linaje de kernels b12x) |
| Paralelismo | Tensor-parallel grado 3 (TP=3) sobre 3 nodos |
| Transporte | Triangulo RoCE CX-7 a 200G, MTU 9000 |
| Decodificacion especulativa | DSpark k=5 |
| KV cache | ~4,8 GiB a 1M de contexto (gmu 0,85) |

## Arquitectura y entrenamiento

La receta describe el modelo base como un transformer MoE nativo en FP4+FP8 con 552B parametros totales y un bloque condicional de memoria "engram" de 196B parametros, distribuido en 48 shards de checkpoint (unos 510 GB en total). El bloque engram se almacena en NVMe y se activa como capa de prefill profundo emparejada de 4096 tokens. La atencion opera con internals en FP8, y el motor incorpora una pila de decodificacion con decodificacion especulativa DSpark k=5.

No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo etapas de RLHF o DPO en el modelo base. La receta tampoco detalla innovaciones de entrenamiento; su foco es exclusivamente el despliegue. La innovacion tecnica destacable del paquete es de ingenieria de serving: la gestion del presupuesto de memoria en el paso de prefill (ajustando `MAX_NUM_BATCHED_TOKENS` en lugar del tamano de chunk), la serializacion de prefills concurrentes y la verificacion de identidad del motor en tiempo de arranque mediante hashes de los ficheros criticos.

## Capacidades

- Generacion de texto a 1M de tokens de contexto, con un pool KV de aproximadamente 5,1M tokens que permite mantener conversaciones o documentos de gran longitud.
- Serving multi-stream: hasta 16 streams concurrentes con 470 tok/s agregados segun la receta.
- Decodificacion especulativa DSpark k=5 para acelerar la generacion en un solo stream.
- Prefill profundo emparejado de 4096 tokens para reducir la latencia del primer token en cargas interactivas.
- Despliegue reproducible mediante imagen Docker con digest fijado y verificacion de integridad del checkpoint.
- Soporte de API compatible con OpenAI (`/v1/chat/completions`) en el puerto 8600.
- Verificacion de identidad del motor en el arranque (build stamp y hashes de ficheros criticos) para evitar ejecutar binarios no auditados.
- No se detallan capacidades de tool calling, agentes, vision o audio en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un monorepo de tamano medio y responder preguntas sobre su estructura y dependencias sin troceado previo.
- Procesamiento de expedientes legales o normativos: documentos de cientos de miles de tokens pueden servirse en una sola peticion, manteniendo coherencia entre secciones.
- Atencion al cliente con historial largo: la ventana de 1M tokens permite conservar conversaciones multi-turno extensas sin resumen intermedio, con un primer token de aproximadamente 1 s en cargas interactivas.
- Investigacion sobre razonamiento de largo alcance: el prefill profundo de 4096 tokens y la decodificacion especulativa permiten experimentar con tareas que requieren contexto masivo manteniendo throughput razonable.
- Evaluacion de infraestructura de inferencia: la receta sirve como banco de pruebas reproducible para medir TP=3 sobre RoCE y comparar con alternativas SGLang o forks comunitarios.
- Despliegue en laboratorios con hardware modesto: tres DGX Spark sustituyen a un nodo H100 para servir un modelo de 552B, reduciendo el coste de entrada frente a soluciones de datacenter.
- Generacion de codigo asistida en pipelines internos: la API compatible con OpenAI permite integrar el endpoint en herramientas de CI/CD o asistentes de IDE, siempre que se valide la calidad del modelo base por separado.

## Benchmarks y rendimiento

La receta no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K). Si reporta metricas de serving medidas sobre la configuracion enviada:

| Metrica | Valor |
|---|---|
| Throughput single-stream (clase counting) | ~105 tok/s |
| Throughput single-stream (prosa) | ~35-40 tok/s |
| Throughput a 8 streams | ~420 tok/s |
| Throughput a 16 streams | ~470 tok/s |
| Primer token (chat junto a prefill profundo) | ~1 s (tarjeta 0,93-0,94 s) |
| Carga de pesos en arranque en frio | ~32 s |
| KV cache a 1M de contexto | ~4,8 GiB |
| Pool KV total | ~5,1M tokens |
| Referencia SGLang comunitaria | ~51 tok/s single-stream a 750K tokens KV |

## Requisitos de hardware

- Tres nodos NVIDIA DGX Spark, cada uno con el checkpoint de ~510 GB en almacenamiento local.
- Red CX-7 RoCE en triangulo completo (tres cables, uno por par), MTU 9000, mas una LAN de gestion.
- Docker con soporte GPU en cada nodo.
- Imagen `eugr/spark-vllm-b12x` con digest `sha256:03a956544e9f9b4b7ba91690469fbe7848bdbef29a7d2e0f5788368467bb3595` en cada nodo.
- Almacenamiento NVMe para el bloque engram (se indica "engram on NVMe" en el perfil de serving).
- No cabe en una GPU de consumo individual: requiere los tres nodos DGX Spark en TP=3.
- Despliegue mediante vLLM; la receta no menciona llama.cpp, Ollama ni TGI.
- Latencia y throughput segun la tabla de benchmarks; el primer token ronda 1 s en cargas interactivas.

## Comparativa con modelos similares

| Aspecto | Esta receta (DeepSeek-V4.1-Flash TP3) | Receta SGLang comunitaria | Fork comunitario compilado desde fuente |
|---|---|---|---|
| Modelo base | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash-1017 |
| Motor | vLLM (b12x) | SGLang | kernel de pagina 64 KiB |
| Throughput single-stream | ~105 tok/s (counting), ~35-40 (prosa) | ~51 tok/s | no disponible |
| Contexto servido | 1M tokens | 750K tokens KV (un cuarto del contexto de esta receta) | pool ligeramente mayor |
| Pool KV | ~5,1M tokens | no disponible | no disponible |
| Hardware | 3x DGX Spark, triangulo RoCE 200G | no disponible | no disponible |
| Licencia | MIT | no disponible | no disponible |

No se dispone de comparaciones con modelos de parametros similares servidos en hardware convencional (H100, A100) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es una receta de serving, no un modelo: no contiene pesos ni un fine-tuning, y su calidad depende enteramente de DeepSeek-V4.1-Flash-1017.
- Las cifras de rendimiento estan medidas sobre la configuracion concreta de tres DGX Spark; no son extrapolables a otro hardware ni a otra topologia de red.
- La receta exige una imagen Docker con digest fijado; una nightly mas reciente de upstream falla la puerta de identidad del motor hasta que se re-audite, lo que puede bloquear actualizaciones.
- El checkpoint de ~510 GB debe estar replicado en cada nodo, con un marcador `_DOWNLOAD_COMPLETE.json` que el usuario debe crear manualmente tras la descarga; un marcador prematuro invalida la verificacion.
- La receta documenta "seis muros" (six walls) y una seccion de FIXLOG con defectos ya encontrados, lo que sugiere que la configuracion es fragil ante cambios de version del motor.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones del modelo base en la informacion proporcionada.
- La licencia MIT del repositorio no exime de verificar la licencia del modelo base DeepSeek-V4.1-Flash-1017 para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/trinadin/DeepSeek-V4.1-Flash-TP3-3x-DGX-Spark
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Imagen Docker: `eugr/spark-vllm-b12x@sha256:03a956544e9f9b4b7ba91690469fbe7848bdbef29a7d2e0f5788368467bb3595`
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.
