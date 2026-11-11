# wasnaga/UniverseNet-Qwen3.8-Flash-Next-NVFP4

## Resumen

UniverseNet Qwen3.8-Flash-Next NVFP4 es una familia de checkpoints derivados del modelo `nvidia/Qwen3.8-Flash-Next-NVFP4`, publicado por el usuario wasnaga en Hugging Face. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 512 expertos enrutados y 48 capas, cuantizado en NVFP4 (formato de 4 bits de NVIDIA) y con capacidades multimodales (pipeline `image-text-to-text`). La contribución del autor no es un reentrenamiento, sino una condensación de los expertos enrutados: reduce el ancho intermedio de cada experto de 640 a 384, 128 o 64 «orbitales» (neuronas de la capa feed-forward) sin pasos de gradiente, generando tres ediciones con distintos requisitos de memoria.

El objetivo es hacer desplegable un modelo de gran tamano en hardware de estacion de trabajo, prosumer o escritorio con GPU Blackwell. La edicion Workstation ocupa 45,28 GiB de pesos en GPU y, segun el autor, mantiene el rendimiento del modelo profesor en las suites evaluadas; las ediciones Prosumer (19,97 GiB) y Desktop16GB (13,64 GiB) conservan el uso de herramientas e instrucciones pero pierden aritmetica multi-paso y codigo. El router, la atencion, Gated DeltaNet, las hyper-connections, los expertos compartidos, los embeddings y la torre de vision se copian de forma bit-exacta del modelo original.

La relevancia actual reside en la posibilidad de ejecutar un MoE multimodal de gran tamano en una unica GPU Blackwell (incluida una RTX 5090 de 32 GB o una DGX Spark de 128 GB unificada) mediante vLLM estandar, sin reentrenamiento y con una licencia de modelo abierta de NVIDIA. No obstante, la evaluacion publicada es muy limitada (62 prompts hechos a mano) y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion, Gated DeltaNet, hyper-connections y torre de vision (hereda la del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (512 expertos enrutados, 48 capas) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo de vLLM (`--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (pesos); KV-cache en FP8 E4M3 en las capas indicadas y cache Mamba SSM en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (con terminos Trustworthy AI de NVIDIA) |
| Formato de pesos | safetensors (checkpoints NVFP4 para vLLM) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con 512 expertos enrutados distribuidos en 48 capas. Incluye mecanismos de atencion junto con Gated DeltaNet (capa de estado recurrente), hyper-connections, expertos compartidos, una tabla de embeddings n-gram por capa (PLE) y una torre de vision. La cuantizacion NVFP4 del modelo base la realiza NVIDIA con ModelOpt; el autor no reentrena ni ajusta con gradientes.

La innovacion del derivado es la condensacion de los expertos enrutados: se reduce el ancho intermedio de cada experto de 640 a 384 (edicion Workstation, 60 %), 128 (Prosumer, 20 %) o 64 (Desktop16GB, 10 %) «orbitales». El proceso se ejecuta en unos 41,22 minutos en una NVIDIA GX10, usando 58.808 tokens de calibracion y sin pasos de gradiente. El router, la atencion, Gated DeltaNet, las hyper-connections, los expertos compartidos, los embeddings y la torre de vision son copias bit-exactas del modelo profesor; solo cambia el ancho intermedio de los expertos enrutados. Cada edicion es un checkpoint completo en su propia carpeta, con config, tokenizer, shards NVFP4, expertos MTP y tabla PLE. La tabla PLE del profesor (`model-fp8-mtp-ple.safetensors`, 53,7 GB, mayoritariamente ~51 GB de embeddings n-gram) se conserva sin condensar y no se cuenta en las cifras de pesos en GPU.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento e instrucciones: la edicion Workstation mantiene el rendimiento del profesor en IFEval (10/10) y ARC-Challenge (10/10).
- Codigo: HumanEval 9/10 en Workstation; se degrada en Prosumer (4/10) y Desktop16GB (1/10).
- Matematicas: GSM8K 10/10 y MATH 9/10 en Workstation; practicamente nulas en Prosumer y Desktop16GB.
- Tool calling / function calling: soportado en vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_xml`; 12/12 en Tools (BFCL + agente movil) en Workstation y Desktop16GB, 11/12 en Prosumer.
- Razonamiento multi-paso y agentes: parser de razonamiento `qwen3`; las ediciones reducidas conservan el uso de herramientas pero fallan en aritmetica multi-paso y entran en bucles de verificacion.
- Multimodal: pipeline `image-text-to-text` (torre de vision heredada del modelo base).
- Multilingue: no disponible en la informacion proporcionada.
- Modo thinking: soportado mediante el parser de razonamiento de Qwen3 en vLLM.

## Casos de uso

- Agentes con tool calling en produccion: las tres ediciones superan o igualan 11/12 en BFCL y agente movil, por lo que pueden integrarse en flujos de llamada a funciones con el parser `qwen3_xml` de vLLM.
- Extraccion de informacion estructurada: la edicion Prosumer (19,97 GiB) y Desktop16GB (13,64 GiB) conservan instrucciones y herramientas, adecuadas para tareas de extraccion y clasificacion sin aritmetica compleja.
- Asistente conversacional multimodal: el pipeline `image-text-to-text` permite procesar imagenes y texto en un mismo turno con la torre de vision intacta.
- Despliegue en estacion de trabajo con una sola GPU: la edicion Workstation (45,28 GiB) cabe en una RTX PRO 6000 Blackwell (96 GB) o en una DGX Spark/GX10 (128 GB unificada) y ofrece rendimiento a nivel del profesor.
- Despliegue en escritorio con GPU de 16 GB: la edicion Desktop16GB (13,64 GiB) esta pensada para RTX 5080/5070 Ti con 64 GB o mas de RAM de sistema y contexto corto.
- Servicio multiusuario con vLLM: el autor reporta 112,2 tok/s (Workstation), 141,6 tok/s (Prosumer) y 142,8 tok/s (Desktop16GB) con 6 usuarios en paralelo, y espacio de KV-cache para 80,6, 125 y 135,83 contextos de 32k respectivamente.
- Evaluacion comparativa de tecnicas de condensacion de MoE: el checkpoint y el articulo permiten reproducir el proceso de condensacion sin gradientes sobre un modelo NVFP4.

## Benchmarks y rendimiento

Resultados publicados por el autor (62 prompts hechos a mano, vLLM sobre una GX10, decodificacion greedy, MTP desactivado):

| Suite | Profesor | Workstation | Prosumer | Desktop16GB |
|---|---|---|---|---|
| IFEval | 10/10 | 10/10 | 9/10 | 9/10 |
| Tools (BFCL + agente movil) | 12/12 | 12/12 | 11/12 | 12/12 |
| ARC-Challenge | 10/10 | 10/10 | 5/10 | 5/10 |
| HumanEval | 9/10 | 9/10 | 4/10 | 1/10 |
| GSM8K | 10/10 | 10/10 | 1/10 | 0/10 |
| MATH | 10/10 | 9/10 | 1/10 | 0/10 |
| Decodificacion mono-stream (tok/s) | no disponible | 30 | 33,1 | 33,4 |
| 6 usuarios en paralelo (tok/s total) | no disponible | 112,2 | 141,6 | 142,8 |
| Espacio de KV-cache (x contextos de 32k) | no disponible | 80,6 | 125 | 135,83 |

Pesos en GPU por edicion: Workstation 45,28 GiB, Prosumer 19,97 GiB, Desktop16GB 13,64 GiB; el profesor ocupa 64,07 GiB. El autor advierte que 10-12 prompts por suite implican intervalos de confianza amplios (un 9/10 puede abarcar aproximadamente del 55 % al 100 %).

## Requisitos de hardware

- VRAM estimada: Workstation 45,28 GiB, Prosumer 19,97 GiB y Desktop16GB 13,64 GiB de pesos en GPU, mas la tabla PLE del profesor (53,7 GB en disco y memoria de host) y la KV-cache.
- GPUs recomendadas: NVIDIA DGX Spark / GX10 (128 GB unificada) probada con las tres ediciones; RTX PRO 6000 Blackwell (96 GB) compatible con las tres; RTX 5090 (32 GB) con 64 GB o mas de RAM de sistema para Desktop16GB y Prosumer; RTX 5080 / 5070 Ti (16 GB) con 64 GB o mas de RAM solo para Desktop16GB y contexto corto.
- Cabe en GPU de consumo: si, Desktop16GB en RTX 5080/5070 Ti (16 GB) y RTX 5090 (32 GB); Prosumer en RTX 5090 y RTX PRO 6000.
- NVFP4 requiere GPUs Blackwell con tensor cores FP4 nativos; Ada, Ampere y Hopper no han sido probadas.
- Despliegue: vLLM con soporte para Qwen3.8 (`qwen4_exp`), `--quantization modelopt`, `--trust-remote-code`, `--kv-cache-dtype fp8_e4m3`, `--mamba-ssm-cache-dtype bfloat16`, `--max-model-len 32768`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y `--reasoning-parser qwen3`.
- Latencia y throughput: 30-33,4 tok/s mono-stream y 112,2-142,8 tok/s con 6 usuarios en paralelo, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniverseNet Workstation (este) | MoE 512 expertos, 48 capas; pesos 45,28 GiB | 32.768 | 96,77 % en 62 prompts; 12/12 Tools | NVIDIA Open Model License | Hugging Face (0 descargas) |
| UniverseNet Prosumer (este) | MoE 512 expertos; pesos 19,97 GiB | 32.768 | 50 % en 62 prompts; 11/12 Tools | NVIDIA Open Model License | Hugging Face |
| UniverseNet Desktop16GB (este) | MoE 512 expertos; pesos 13,64 GiB | 32.768 | 43,55 % en 62 prompts; 12/12 Tools | NVIDIA Open Model License | Hugging Face |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (profesor) | MoE 512 expertos; pesos 64,07 GiB | no disponible | 98,39 % en 62 prompts; 12/12 Tools | NVIDIA Open Model License | Hugging Face (NVIDIA) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion muy limitada: 10-12 prompts por suite, con intervalos de confianza amplios; las particiones publicas completas estan en progreso.
- Los prompts de herramientas comparten plantilla de system prompt y esquema de herramientas con parte del conjunto de calibracion (con hechos e IDs distintos), lo que puede inflar los resultados de tool calling.
- Las cifras de pesos en GPU provienen de los logs de carga de vLLM y no se han guardado como fichero de resultados.
- Prosumer y Desktop16GB pierden aritmetica multi-paso y codigo: el modelo elige el metodo correcto pero comete errores de suma de un paso (por ejemplo, 32+16=34) y a menudo entra en bucles de verificacion.
- La tabla PLE del profesor (53,7 GB) se conserva sin condensar y no se cuenta en los pesos en GPU; hay que prever ese espacio en disco y memoria de host. Su condensacion o descarga queda como trabajo futuro.
- NVFP4 solo funciona de forma nativa en GPUs Blackwell; en Ada, Ampere y Hopper no se ha probado y no hay tensor cores FP4.
- Requiere una build de vLLM con soporte para Qwen3.8 (`qwen4_exp`), lo que limita la portabilidad a versiones estandar.
- Licencia NVIDIA Open Model License con terminos Trustworthy AI de NVIDIA; es un modelo derivado del modelo base de NVIDIA y del modelo original de Qwen, por lo que el uso comercial debe revisarse contra ambos.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasnaga/UniverseNet-Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo original upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Explicador (Space): https://huggingface.co/spaces/wasnaga/universe-network
- Articulo de investigacion: https://wasnaga-universe-network.static.hf.space/paper.html
