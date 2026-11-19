# sugarknight/Qwen3.5-4B-YASAKANI

## Resumen

Qwen3.5-4B-YASAKANI es una conversión cuantizada del modelo Qwen3.5-4B de Alibaba Cloud, publicada por el usuario sugarknight. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos del checkpoint base de Qwen (revisión `851bf6e`) empaquetados en el formato propietario `.yskn` que consume el motor de inferencia YASAKANI, diseñado específicamente para Windows nativo y con soporte para backends SYCL y CUDA.

El paquete incluye dos variantes de pesos: `speed.yskn`, con proyecciones del cuerpo a 3 bits por peso (1,92 GB), y `quality.yskn`, con proyecciones a 4 bits (2,36 GB). Ambas variantes mantienen los embeddings a 3 bits y la cabeza de salida a 4 bits, y reutilizan el tokenizer, la plantilla de chat y los ficheros de configuración del checkpoint original de Qwen.

La relevancia de esta ficha es doble: por un lado, documenta una vía de despliegue de Qwen3.5-4B en GPUs de consumo (RTX 3060 12 GB, RTX 5060 Ti 16 GB) con latencias y throughput medidos por el autor; por otro, ilustra un ecosistema de formatos de cuantización alternativos a GGUF que dependen de un runtime concreto y no son portables a vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen3.5-4B no detalla su arquitectura en la informacion proporcionada) |
| Parametros totales | 4B (heredados del modelo base Qwen3.5-4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el benchmark usa una asignacion de contexto de 2.048 tokens, pero no se especifica el maximo del modelo) |
| Tipos de cuantizacion | 3 bits/peso (`speed.yskn`) y 4 bits/peso (`quality.yskn`); embeddings a 3 bits y cabeza de salida a 4 bits en ambos packs |
| Idiomas soportados | no disponible (el benchmark usa prompts en japones, pero no se declara un listado oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.yskn` (formato propietario del motor YASAKANI); tokenizer y config en JSON/Jinja del checkpoint Qwen |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni el proceso de entrenamiento del modelo base Qwen3.5-4B en la documentacion proporcionada. Lo que si se detalla es el proceso de conversion: los pesos de texto del checkpoint Qwen se cuantizan y se reempaquetan en el formato `.yskn`, con proyecciones del cuerpo a 3 o 4 bits segun el pack, embeddings a 3 bits y cabeza de salida a 4 bits. El tokenizer, la plantilla de chat y los ficheros de configuracion se toman directamente del checkpoint fijado en la revision `851bf6e`, por lo que el comportamiento linguistico y de formato de chat deberia coincidir con el del modelo original.

El motor YASAKANI es la pieza tecnica diferencial: se compila como DLL de 4B desde un fork SYCL de Qwen3.5, acepta IDs de token como entrada y almacena la KV cache en BF16. Tanto la build CUDA como la build SYCL para NVIDIA leen el mismo pack `.yskn`, lo que permite elegir backend sin reconvertir pesos. No se documentan innovaciones de entrenamiento (RLHF, DPO, decodificacion especulativa) porque esta publicacion es exclusivamente una conversion de pesos, no un ajuste.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Entrada y salida exclusivamente de texto: la model card indica explicitamente que el paquete soporta text input y output.
- Razonamiento aritmetico basico: en el benchmark del autor, cada configuracion respondio correctamente 8 de 12 preguntas aritmeticas.
- Comprension lectora: 3 de 3 preguntas de lectura correctas en el test del autor (prompts en japones).
- Modo thinking desactivable: el benchmark se ejecuto con thinking off, lo que sugiere que el modelo base soporta un modo de razonamiento extendido, aunque no se detalla en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el paquete es solo de texto.

## Casos de uso

- Despliegue en Windows nativo con GPU de consumo: el motor YASAKANI esta pensado para Windows y el pack `speed.yskn` ocupa 1,92 GB, con un incremento de VRAM medido de 2.352 MiB en SYCL y 2.556 MiB en CUDA sobre una RTX 5060 Ti. Es adecuado para prototipos locales en equipos con 12-16 GB de VRAM sin depender de WSL ni de contenedores Linux.
- Asistentes conversacionales de escritorio: al reutilizar la plantilla de chat de Qwen y almacenar KV cache en BF16, el modelo puede gestionar dialogos multi-turno con contexto de 2.048 tokens, suficiente para sesiones de asistencia personal en local.
- Procesamiento de texto en japones: el benchmark del autor usa prompts de lectura en japones con resultados correctos (3/3), lo que respalda su uso en tareas de comprension lectora y resumen en ese idioma, aunque no se declara un listado oficial de idiomas.
- Evaluacion comparativa de backends SYCL frente a CUDA: el mismo pack se ejecuta en ambas builds, con throughput medido de 161,54 tok/s (SYCL) frente a 200,18 tok/s (CUDA) en RTX 5060 Ti con el pack speed, lo que lo convierte en una herramienta util para medir el coste del backend SYCL en hardware NVIDIA.
- Tareas de aritmetica y razonamiento ligero: con 8/12 aciertos en preguntas aritmeticas en el test del autor, es apto para asistentes de calculo sencillo o validacion de respuestas, no para razonamiento matematico complejo.
- Escenarios con restricciones de almacenamiento: el pack speed de 1,92 GB permite distribuir el modelo en entornos con poco espacio en disco, frente a los 2,36 GB del pack quality, a costa de una perdida de precision en las proyecciones.

## Benchmarks y rendimiento

Los unicos datos publicados son los del benchmark del autor en Windows, con contexto de 2.048 tokens, KV en BF16, una peticion simultanea y generacion greedy con thinking off. TTFT y TPS son medianas de tres prompts de lectura en japones de aproximadamente 1.073 tokens. La VRAM es el incremento maximo sobre el uso previo a cargar el modelo.

| GPU | Pack | Backend | Decode tok/s | TTFT (ms) | VRAM increase (MiB) |
|---|---|---|---:|---:|---:|
| RTX 5060 Ti | speed | SYCL | 161,54 | 206,2 | 2.352 |
| RTX 5060 Ti | speed | CUDA | 200,18 | 213,6 | 2.556 |
| RTX 5060 Ti | quality | SYCL | 140,44 | 210,2 | 2.706 |
| RTX 5060 Ti | quality | CUDA | 165,23 | 236,0 | 2.930 |
| RTX 3060 | speed | SYCL | 114,50 | 367,5 | 2.334 |
| RTX 3060 | speed | CUDA | 119,83 | 365,1 | 2.562 |
| RTX 3060 | quality | SYCL | 104,18 | 371,7 | 2.708 |
| RTX 3060 | quality | CUDA | 99,45 | 408,5 | 2.936 |

En calidad, cada configuracion respondio 8 de 12 preguntas aritmeticas y 3 de 3 preguntas de lectura correctamente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 2.334 y 2.936 MiB de incremento segun pack y backend, medido sobre RTX 3060 12 GB y RTX 5060 Ti 16 GB con contexto de 2.048 tokens y KV en BF16. A contextos mayores el consumo de KV cache crecera proporcionalmente.
- GPUs validadas por el autor: RTX 5060 Ti 16 GB (build release candidate) y RTX 3060 12 GB (build de desarrollo).
- Cabe en GPUs de consumo: si, en cualquier GPU NVIDIA con al menos 4 GB de VRAM libre para el contexto medido; las pruebas se hicieron en tarjetas de 12 y 16 GB.
- Opciones de despliegue: exclusivamente el motor YASAKANI (DLL de 4B compilada desde el fork SYCL de Qwen3.5), con backend CUDA o SYCL para NVIDIA. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.yskn` es propietario.
- Requisitos de plataforma: Windows nativo; se debe descargar el pack `.yskn` junto con `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y `config.json`, y pasar la ruta del pack a `yskn_open`.
- Throughput y latencia: 200,18 tok/s y 213,6 ms de TTFT en el mejor caso medido (RTX 5060 Ti, pack speed, CUDA); 99,45 tok/s y 408,5 ms en el peor caso medido (RTX 3060, pack quality, CUDA).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.5-4B-YASAKANI (este) | 4B | no disponible (benchmark a 2.048) | `.yskn` (3/4 bits) | Apache-2.0 | YASAKANI (Windows, CUDA/SYCL) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | safetensors (BF16) | Apache-2.0 | vLLM, TGI, transformers, llama.cpp (via conversion) |
| Otras cuantizaciones de Qwen3.5-4B (GGUF, AWQ, GPTQ) | 4B | depende del modelo base | GGUF, AWQ, GPTQ | Apache-2.0 (heredada) | llama.cpp, Ollama, vLLM, TGI |

La diferencia principal frente al modelo base y frente a cuantizaciones estandar es el formato y el runtime: YASAKANI ofrece un binario de ~2 GB y un motor Windows nativo con backend SYCL, pero no es portable a los servidores de inferencia habituales. No se dispone de datos de benchmarks comparativos con esas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime YASAKANI: los pesos `.yskn` no se pueden cargar en vLLM, llama.cpp, Ollama ni TGI; el modelo solo funciona con la DLL de 4B compilada desde el fork indicado.
- Plataforma limitada: el motor esta orientado a Windows nativo; no se documenta soporte para Linux ni macOS.
- Idiomas no declarados: no hay un listado oficial de idiomas soportados; el benchmark solo cubre japones, por lo que el rendimiento en castellano u otros idiomas no esta verificado en esta publicacion.
- Contexto no especificado: no se indica la longitud maxima de contexto del modelo base; las mediciones se hicieron a 2.048 tokens y el consumo de VRAM crecera con contextos mayores.
- Riesgo de alucinacion: inherente a los modelos de 4B; el test aritmetico del autor muestra 4 fallos de 12, lo que indica que no es fiable para calculo preciso sin verificacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (19 de noviembre de 2026), lo que implica ausencia de validacion comunitaria independiente.
- Licencia Apache-2.0 heredada del modelo base, con atribucion a Alibaba Cloud; se debe conservar el aviso de copyright y el fichero NOTICE en redistribuciones.
- Verificacion de integridad: el autor publica hashes SHA-256 en `SHA256SUMS`; conviene comprobarlos antes de cargar los packs en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugarknight/Qwen3.5-4B-YASAKANI
- Modelo base Qwen3.5-4B (revision fijada): https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Codigo fuente del motor YASAKANI: https://github.com/sugarkwork/yasakani-sycl-qwen35/tree/30e4f55d5b2a97e74ac44f5cdf41f739e1d13807
- Guia de compilacion en Windows: https://github.com/sugarkwork/yasakani-sycl-qwen35/blob/30e4f55d5b2a97e74ac44f5cdf41f739e1d13807/docs/WINDOWS-QWEN35.md
- Detalles del benchmark: https://github.com/sugarkwork/yasakani-sycl-qwen35/blob/30e4f55d5b2a97e74ac44f5cdf41f739e1d13807/docs/QWEN35-BENCHMARKS.md
