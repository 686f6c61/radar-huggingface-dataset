# Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF

## Resumen

Qwen3.6-35B-A3B-TR2.25-G-GGUF es una cuantizacion ternaria (2,25 trits por peso de media) del modelo Qwen3.6-35B-A3B del equipo Qwen, publicada por el usuario Ternii (Wai Chung) bajo licencia Apache-2.0. El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token. Esta version empaqueta los mismos codigos y escalas que el checkpoint TR2.25-G para vLLM en un unico archivo GGUF pensado para llama.cpp en Apple Silicon, sin reentrenamiento adicional.

La relevancia de esta ficha radica en que demuestra una via practica para ejecutar un MoE de 35.000 millones de parametros en equipos con 16-24 GB de memoria unificada, algo imposible con cuantizaciones convencionales de 8 bits (que requieren 37,2 GB). El autor reporta precision practicamente identica al modelo original en GSM8K, HumanEval y MBPP, con velocidades de 55 a 123 tokens por segundo en un Apple M5 Max.

Es importante senalar que esta cuantizacion **no funciona con llama.cpp upstream, LM Studio ni Ollama**: requiere un fork parcheado que introduce los tipos de tensor TQ9_128, TQ27_128 y TQ81_128. Ademas, el modelo es solo texto, sin codificador de vision ni cabecera MTP, y su unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3.000 millones (A3B, segun nomenclatura del modelo base) |
| Longitud de contexto | 32.768 tokens en el modelo base; en la practica limitada por memoria (4k verificado en 24 GB, 32k no cabe en ese perfil) |
| Tipos de cuantizacion | Ternaria TR2.25 (2,25 trits por peso de media); tipos de tensor propietarios TQ9_128, TQ27_128, TQ81_128 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico archivo de 16,5 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con capas MoE: de los 34.660 millones de parametros totales, solo unos 3.000 millones se activan por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo mucho mayor. Esta version TR2.25-G no reentrena el modelo: aplica una traduccion de cuantizacion ternaria que representa cada peso con 2,25 trits de media, conservando los mismos codigos y escalas que el checkpoint original para vLLM. El resultado es un archivo de 16,5 GB, un 44 % del tamano que ocuparia el mismo modelo en Q8_0 (37,2 GB).

La innovacion tecnica principal es el esquema de cuantizacion ternaria con tipos de tensor personalizados (TQ9_128, TQ27_128, TQ81_128), que no existen en llama.cpp upstream y obligan a usar un parche sobre ggml-org/llama.cpp en el commit ff5a233. El runtime publicado soporta Metal en Apple Silicon; el soporte CUDA esta en desarrollo y no forma parte de la serie publicada. Adicionalmente, el autor implementa una cache de expertos en SSD (LLAMA_MOE_SSD) que permite mantener los expertos en disco con una cache de 8.400 MiB, logrando ejecutar el modelo en un presupuesto de 16 GB con una tasa de acierto de cache del 94,8 % y lecturas de aproximadamente 24 MB por token desde el SSD. Los datasets citados en la model card (nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math, openai/gsm8k) corresponden al modelo base, no a un entrenamiento adicional de esta cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento en modo thinking: el modelo base activa por defecto `reasoning_content` con `--jinja`, pudiendo consumir mas de 1.000 tokens de razonamiento antes de responder.
- Codigo: el autor reporta 92,7 % en HumanEval y 87,2 % en MBPP-sanitized con esta cuantizacion.
- Matematicas: 95,0 % en GSM8K-400 (modo greedy, sin thinking) y 81,9 en MGSM multilingue segun el checkpoint vLLM equivalente.
- Soporte de plantilla de chat Jinja (`--jinja`), lo que habilita el formato conversacional del modelo base.
- Capacidad de desactivar el modo thinking mediante `--reasoning off` o `chat_template_kwargs: {"enable_thinking": false}`.
- Sin vision: el encoder visual ha sido eliminado en esta version.
- Sin cabecera MTP (multi-token prediction).
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- **Ejecucion local en Mac de 24 GB o mas**: cargar el GGUF completo en memoria con llama-server permite obtener 120-123 tokens/s sostenidos en un M5 Max, adecuado para asistentes personales, prototipado y experimentacion sin depender de la nube.
- **Mac de 16 GB con cache de expertos en SSD**: mediante `LLAMA_MOE_SSD=1` y una cache de 8.400 MiB se obtienen unos 55 tokens/s sostenidos en el M5 Max emulado, lo que hace viable un chatbot local en hardware de gama de entrada Apple.
- **Generacion de codigo en local**: con 92,7 % en HumanEval y 87,2 % en MBPP, el modelo sirve para autocompletado, refactorizacion y generacion de tests en entornos sin conectividad o con requisitos de privacidad estrictos.
- **Razonamiento matematico asistido**: el modo thinking por defecto y el 95,0 % en GSM8K lo hacen util para tutoria de problemas aritmeticos y verificacion de calculos paso a paso.
- **Prototipado de pipelines LLM antes de migrar a produccion**: al compartir codigos y escalas con el checkpoint vLLM, permite validar prompts y flujos en local y desplegar despues en GPU sin cambiar de cuantizacion.
- **Investigacion sobre cuantizacion ternaria**: el modelo sirve como referencia reproducible para estudiar el impacto de 2,25 trits por peso en tareas de razonamiento y codigo, con comparativas exactas McNemar publicadas frente al BF16 original.
- **Despliegue en entornos air-gapped**: al ser un unico archivo GGUF con licencia Apache-2.0, puede distribuirse en redes aisladas sin dependencias de servicios externos, siempre que se compile el fork de llama.cpp.

## Benchmarks y rendimiento

Resultados reportados por el autor con esta cuantizacion en Mac (greedy, sin thinking), comparados con el modelo original:

| Benchmark | TR2.25-G (ruta normal) | TR2.25-G (cache 16 GB) | Original BF16/Q8 | Diferencia significativa |
|---|---|---|---|---|
| GSM8K-400 | 95,0 % | 94,0 % | 95,0 % | No (McNemar exacto) |
| HumanEval | 92,7 % | 92,1 % | 94,5 % | No |
| MBPP-sanitized | 87,2 % | 87,6 % | 87,9 % | No |
| MGSM (multilingue, via vLLM) | 81,9 | no ejecutado | 83,8 | Si, inferior al original |

Rendimiento medido en Apple M5 Max (128 GB):

| Memoria Mac | Modo | Velocidad | Memoria usada |
|---|---|---|---|
| 16 GB | cache de expertos 8.400 MiB | ~55 tokens/s sostenidos (emulado) | 10,97 GB |
| 24 GB | en memoria | ~120-123 tokens/s sostenidos | 16,84 GB |
| 32 GB+ | en memoria | ~120-123 sostenidos, ~140 burst, prefill ~2.550 tokens/s | 16,5 GB |

## Requisitos de hardware

- **VRAM/memoria unificada**: 16,5 GB solo para los pesos; 16,84 GB de working set con contexto de 4k. En 24 GB cabe con solo 0,35 GB de margen a 4k; 32k de contexto no cabe en ese perfil.
- **GPU recomendadas**: Apple Silicon con Metal (M5 Max medido; M1/M2/M3/M4 no medidos pero compatibles con el runtime). CUDA esta en port y no forma parte de la serie publicada.
- **Consumer GPU**: no hay soporte CUDA publicado, por lo que no se puede confirmar su funcionamiento en RTX 4090, A100 o H100 con este fork.
- **Opciones de despliegue**: exclusivamente llama.cpp parcheado (github.com/ternii-ai/tritq-vllm). No funciona con llama.cpp upstream, LM Studio, Ollama ni vLLM con este archivo GGUF (para vLLM existe el checkpoint TR2.25-G separado).
- **Latencia y throughput**: 120-123 tokens/s sostenidos y ~140 en burst en M5 Max con 32 GB+; ~55 tokens/s en modo cache de 16 GB; prefill de ~2.550 tokens/s.
- **Almacenamiento**: en modo cache de expertos se leen unos 24 MB por token desde el SSD, con 94,8 % de acierto de cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B TR2.25-G (este) | 34,66B totales, ~3B activos | 32k (4k verificado) | Ternaria 2,25 trits | 16,5 GB | Apache-2.0 | llama.cpp parcheado (Metal) |
| Qwen3.6-35B-A3B Q8_0 | 34,66B totales, ~3B activos | 32k | 8 bits | 37,2 GB | Apache-2.0 | llama.cpp upstream |
| Qwen3.6-35B-A3B BF16 (original) | 34,66B totales, ~3B activos | 32k | 16 bits | ~69 GB (estimado) | Apache-2.0 | vLLM, TGI, transformers |
| Qwen3.6-35B-A3B NVFP4 | 34,66B totales, ~3B activos | 32k | FP4 (NVIDIA) | no disponible | Apache-2.0 | TensorRT-LLM / vLLM |

La ventaja principal frente a Q8_0 y BF16 es la reduccion de memoria (44 % y ~24 % respectivamente) con diferencias no significativas en GSM8K, HumanEval y MBPP. La desventaja es la dependencia de un fork no upstream y la ausencia de soporte CUDA publicado.

## Limitaciones y advertencias

- **Requiere un llama.cpp parcheado**: los ids de tipo GGUF 44-46 son especificos del fork; las compilaciones estandar, LM Studio y Ollama no pueden cargar el archivo.
- **Cache de expertos experimental**: medida solo a contexto de 4k, micro-batch <= 512 tokens y una sola secuencia (`-np 1`); concurrencia, peticiones canceladas y prompts largos no han sido probados.
- **Solo texto**: sin encoder de vision ni cabecera MTP.
- **Solo ingles declarado**: el rendimiento en otros idiomas no esta garantizado; en MGSM multilingue el checkpoint equivalente rinde por debajo del original (81,9 vs 83,8), con la mayoria de la perdida en bengali.
- **Modo thinking por defecto**: con `--jinja` el modelo puede gastar mas de 1.000 tokens en razonamiento antes de responder; en las pruebas del autor, 3 de 4 peticiones alcanzaron el limite de 1.024 tokens. Es necesario desactivarlo o ampliar `max_tokens`.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos generativos.
- **Licencia Apache-2.0**: permite uso comercial, pero la obligacion de compilar y mantener el fork anade coste operativo.
- **Mediciones parciales**: los datos de 16 GB son emulados en un M5 Max; un Mac real de 16 GB tiene chip y SSD mas lentos, y el autor estima 17-24 tokens/s en un portatil base. El presupuesto de GPU por defecto se asume como dos tercios de la RAM, sin medir en maquinas de 16-24 GB.
- **Cifras de velocidad Q8_0 no comparables**: provienen de otra compilacion de llama.cpp, por lo que el autor no ofrece ratio de velocidad frente a 8 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint vLLM equivalente (TR2.25-G): https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G
- Repositorio del runtime parcheado: https://github.com/ternii-ai/tritq-vllm
- Rama de llama.cpp parcheada: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- llama.cpp upstream (commit base ff5a233): https://github.com/ggml-org/llama.cpp
