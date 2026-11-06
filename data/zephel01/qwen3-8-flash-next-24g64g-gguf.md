# zephel01/Qwen3.8-Flash-Next-24G64G-GGUF

## Resumen

Qwen3.8-Flash-Next-24G64G-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario zephel01 (autor tambien del motor de inferencia Abyss). El objetivo del artefacto es permitir la ejecucion de un modelo de mezcla de expertos (MoE) de gran tamano en un equipo de consumo con una unica GPU de 24 GB de VRAM y 64 GB de RAM, manteniendo los 512 expertos del modelo original. El modelo base lo desarrolla el equipo Qwen y se distribuye bajo licencia qwen-community-1.0.

El modelo cuenta con 176.943.899.520 parametros totales (unos 177 mil millones) segun los pesos safetensors del modelo base, y el repositorio GGUF ocupa 93,7 GB repartidos en tres shards. La cuantizacion no es generica: cada experto se recuantiza con LDLQ (LDLQ, quantizacion con correccion tipo GPTQ basada en matrices de Hessian) a partir de pesos en formato NVFP4, usando exactamente los mismos tipos tensoriales y el mismo tamano que la cuantizacion UD-IQ4_XS de unsloth.

La relevancia del artefacto es practica: demuestra que un MoE de este tamano puede servirse en hardware de gama alta de consumo mediante offloading selectivo de expertos a RAM y lectura de la tabla de embeddings por capas desde SSD. El autor lo marca explicitamente como BETA y solo ha medido el rendimiento en un unico equipo emulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; arquitectura GGUF `qwen4exp` |
| Parametros totales | 176.943.899.520 (~177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens verificados en la invocacion de llama.cpp documentada; no se especifica el maximo del modelo base |
| Tipos de cuantizacion | GGUF mixta: expertos gate/up en IQ3_S (capa 2 en IQ4_XS), expertos down en IQ4_NL (capas 2, 4, 30, 46, 47 en Q8_0); tensores no experto identicos a UD-IQ4_XS de unsloth |
| Idiomas soportados | no disponible de forma oficial; el autor valida japones, chino, ingles y codigo en sus pruebas |
| Licencia | qwen-community-1.0 (licencia del modelo original) |
| Formato de pesos | GGUF, 3 shards (`-00001-of-00003.gguf` a `-00003-of-00003.gguf`), con `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un transformer con capa MoE de 512 expertos, segun se deduce de la model card ("All 512 experts are kept"). La nomenclatura de arquitectura en llama.cpp es `qwen4exp`. El artefacto incluye una tabla de embeddings por capas de 28,8 GB que se lee fila a fila desde SSD en cada token, lo que reduce la memoria residente necesaria a 64,2 GB (GPU + RAM) frente a los 93,7 GB del fichero completo.

El proceso de cuantizacion, documentado por el autor, consta de dos fases ejecutadas con las herramientas `trench-gguf` (`tools/hessian_dump.cpp`, `tools/requant_experts.py`, `tools/merge_experts.py`). Primero se calculan matrices de Hessian sobre el modelo NVFP4 de magnitudedev usando 1,26 millones de tokens: 181 prompts de chat propio (44 en japones, 20 en chino, 20 en ingles, 37 de codigo, 35 de matematicas y 25 de tool calls) seguidos de texto mixto en los mismos idiomas y dominios. Despues, cada experto se recuantiza con LDLQ a partir de los pesos NVFP4 (con las escalas por experto plegadas) en los tipos de UD-IQ4_XS y se fusiona con la cuantizacion de unsloth. Los tensores no experto (atencion, router, experto compartido, embeddings y tabla de embeddings por capas) son los bytes de UD-IQ4_XS sin modificar. No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto conversacional multi-turno, con modo "thinking" activable (las pruebas del autor se realizan con thinking on).
- Razonamiento y matematicas: validado con prompts aritmeticos y tareas de matematicas dentro del conjunto de calibracion.
- Generacion de codigo: el autor evalua con tareas de codigo con tests ocultos y reporta 5/5 y 4/5 en dos semillas.
- Tool calling / function calling: el conjunto de calibracion incluye 25 prompts de tool calls, lo que sugiere soporte en el modelo base.
- Capacidades multilingues: japones, chino e ingles verificados en las pruebas del autor; el resto de idiomas no esta documentado.
- Manejo de contexto largo: se verifica la recuperacion de una aguja en un prompt de 8K tokens.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse en infraestructura compatible con la API de Hugging Face.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Asistente conversacional en japones sobre hardware de consumo: el autor valida 10/10 respuestas correctas en cinco prompts japoneses (correo de negocios, explicacion, resumen, dato literario y aritmetica), lo que lo hace adecuado para atencion al cliente o asistencia interna en ese idioma con una GPU de 24 GB.
- Generacion de codigo en local: con 5/5 y 4/5 en tareas con tests ocultos y 69,9 tok/s de decodificacion, es viable para autocompletado y generacion de funciones en un flujo de desarrollo individual sin depender de la nube.
- Procesamiento de documentos largos: la ventana de 32.768 tokens verificada y la prueba de aguja en 8K permiten resumir o extraer informacion de contratos, informes o articulos extensos.
- Agentes con tool calling: los 25 prompts de tool calls del conjunto de calibracion y la compatibilidad con `--jinja` en llama.cpp permiten integrarlo en pipelines de agentes que invocan APIs externas.
- Servidor de inferencia self-hosted para equipos pequenos: con Abyss o llama.cpp y offloading de 34 capas MoE a CPU, se puede desplegar un endpoint OpenAI-compatible en una estacion de trabajo.
- Experimentacion e investigacion en cuantizacion: el repositorio documenta el proceso completo (Hessians, LDLQ, fusion) y sirve como referencia reproducible para estudiar el impacto de la cuantizacion calibrada por dominio.
- Procesamiento por lotes de texto multilingue: la combinacion de japones, chino e ingles en el conjunto de calibracion sugiere buen comportamiento en tareas de traduccion o clasificacion entre esos idiomas.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor contra la cuantizacion UD-IQ4_XS de unsloth del mismo tamano, no benchmarks academicos estandar.

| Metrica | Este fichero | unsloth UD-IQ4_XS |
|---|---|---|
| Descarga | 93,7 GB | 93,7 GB |
| Memoria residente (GPU + RAM) | 64,2 GB | 64,9 GB |
| KL (10 secuencias) | 0,068 | 0,092 |
| Mismo token top | 90,3% | 88,7% |
| KL en japones | 0,146 | 0,195 |
| KL en codigo | 0,092 | 0,116 |
| Decodificacion, 3 tareas de codigo | 69,9 tok/s | 71,1 tok/s |
| Japones (5 prompts) | 10/10 correctas | 10/10 |
| Codigo con tests ocultos (2 semillas) | 5/5, 4/5 | 3/5, 5/5 |
| Aguja en prompt de 8K | encontrada | encontrada |
| Procesamiento de prompt (8K) | 1.680-1.689 tok/s | 1.670-1.683 tok/s |

Mediciones realizadas con Abyss v1.3.108 sobre un PC emulado en una RTX 5090 (32 GB) con VRAM limitada a 24 GB, 46 GB de RAM en un cgroup de 58 GB, 8 hilos de CPU, SSD NVMe y drafter MTP activo. En llama.cpp con `--n-cpu-moe 34` (24,2 GB de VRAM) la decodificacion baja a 26-34 tok/s. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 24 GB para el escenario objetivo; el autor prueba con 24,2 GB en llama.cpp (`--n-cpu-moe 34`) y recomienda 35 o mas capas offloaded en una tarjeta real de 24 GB.
- RAM: 64 GB en el equipo objetivo; en Abyss se configura `STRATA_GLM_RAM_GB=46` dentro de un cgroup de 58 GB.
- Almacenamiento: SSD NVMe necesario, ya que la tabla de embeddings por capas (28,8 GB) se lee fila a fila desde disco en cada token.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 (32 GB, usada para emular el caso de 24 GB); no hay mediciones en A100 ni H100.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con el esquema de offloading descrito; existe una variante para 16 GB + 64 GB de RAM y otra para 12 GB + 32 GB.
- Despliegue: Abyss v1.3.108 o superior (requiere empaquetado previo con `tools/iq_pack.py --fast` y arranque con `--glm-pack`) y llama.cpp con arquitectura `qwen4exp` (commit upstream `ac8e1694d` del 2026-10-29).
- Throughput: 69,9 tok/s en decodificacion con Abyss en el equipo emulado; 26-34 tok/s en llama.cpp; 1.680-1.689 tok/s de procesamiento de prompt en 8K. La latencia no se reporta de forma separada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zephel01/Qwen3.8-Flash-Next-24G64G-GGUF | ~177 mil millones (MoE) | 32.768 verificado | qwen-community-1.0 | Hugging Face, 47 descargas | KL 0,068; 69,9 tok/s en Abyss |
| unsloth UD-IQ4_XS de Qwen3.8-Flash-Next | ~177 mil millones (MoE) | no disponible | qwen-community-1.0 | Hugging Face | Mismo tamano (93,7 GB); KL 0,092; 71,1 tok/s |
| magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF | ~177 mil millones (MoE) | no disponible | qwen-community-1.0 | Hugging Face | Pesos NVFP4 usados como fuente para la recuantizacion; referencia de KL |
| zephel01/Qwen3.8-Flash-Next-16G64G-GGUF | ~177 mil millones (MoE) | no disponible | qwen-community-1.0 | Hugging Face | Variante para GPU de 16 GB + 64 GB de RAM |
| zephel01/Qwen3.8-Flash-Next-12G32G-GGUF | ~177 mil millones (MoE) | no disponible | qwen-community-1.0 | Hugging Face | Variante para GPU de 12 GB + 32 GB de RAM |

## Limitaciones y advertencias

- Estado BETA: el autor solo ha medido el rendimiento en un unico PC emulado; no hay validacion en GPUs de 24 GB reales ni en otros tamanos de RAM.
- Requiere Abyss v1.3.108 o superior para el camino de prompt: en versiones anteriores los expertos down Q8_0 de este layout leen mas alla de su slot, un fallo que tambien afecta a UD-IQ4_XS de unsloth.
- Dependencia de SSD NVMe: la tabla de embeddings por capas se lee desde disco en cada token; un almacenamiento mas lento degradaria gravemente el throughput.
- Rendimiento en codigo variable: las dos semillas dan 5/5 y 4/5, frente a 3/5 y 5/5 del modelo de referencia, lo que indica alta varianza en tareas de codigo.
- Idiomas no documentados oficialmente: la model card no lista idiomas soportados; la validacion se limita a japones, chino, ingles y codigo.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de sesgos; el autor solo verifica que no haya respuestas vacias ni ecos de prompt en sus pruebas.
- Licencia qwen-community-1.0: es una licencia "other" con nombre propio; deben revisarse sus terminos antes de uso comercial, ya que no es una licencia permisiva estandar.
- Parametros activos no disponibles: al ser un MoE, el coste computacional real por token depende de los expertos activados, dato que no se publica.
- El repositorio tiene 47 descargas y 0 likes, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-24G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pesos NVFP4 de origen: https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Variante para 16 GB + 64 GB: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-GGUF
- Variante para 12 GB + 32 GB: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-12G32G-GGUF
- Coleccion de GGUFs de zephel01: https://huggingface.co/collections/zephel01/qwen38-flash-next-gguf
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramientas de cuantizacion trench-gguf: https://github.com/zephel01/trench-gguf
- Issues de Abyss (formulario de benchmark): https://github.com/zephel01/Abyss/issues
- Articulo del autor en note.com: https://note.com/zephel01/n/n3b786b1e8c99
