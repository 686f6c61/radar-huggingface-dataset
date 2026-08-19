# Zynerji/Qwen3.8-27B-PristinelyUncensored-HOMEUSER-16-24

## Resumen

Qwen3.8-27B-PristinelyUncensored-HOMEUSER-16-24 es un modelo de lenguaje y vision (VLM) de 27.000 millones de parametros, desarrollado por Zynerji, que combina atencion hibrida (48 capas de atencion lineal gated-delta y 16 capas de atencion full) con un cabezal de prediccion multi-token (MTP) y un tower de vision completo. Es una cuantizacion int4 del modelo base Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored, que a su vez deriva del Qwen3.8-27B original de Alibaba.

La relevancia de este modelo reside en dos aspectos: primero, es una version "uncensored" (abliterada) que reduce significativamente las negativas a responder, con una tasa de rechazo medida del 1,2%. Segundo, su cuantizacion comprime tanto las capas de embedding como la cabeza de salida, algo inusual, lo que permite cargar el modelo completo en tarjetas de 24 GB con una ventana de contexto de 262.144 tokens, y en tarjetas de 16 GB con contextos reducidos. Requiere un fork especifico de vLLM (Zynerji/vllm) para funcionar correctamente, ya que la implementacion stock de vLLM no soporta embeddings cuantizados en la arquitectura Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid-attention (48 capas linear-attention gated-delta + 16 capas full-attention), VLM con vision tower |
| Parametros totales | 4.400.327.408 (pesos cuantizados en safetensors; el modelo original es de 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (max_position_embeddings) |
| Tipos de cuantizacion | int4, mixed-precision, compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, int4) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, que combina atencion lineal (gated-delta) en 48 de sus 64 capas y atencion full en las 16 restantes. Esta arquitectura hibrida reduce el consumo de memoria del cache KV en las capas lineales, permitiendo contextos extremadamente largos. Incluye un cabezal MTP (multi-token-prediction) de 15 tensores para decodificacion especulativa, asi como un tower de vision completo para tareas multimodales.

El proceso de cuantizacion se realizo en una sola pasada (single-pass quantization) desde el modelo base en BF16 reparado, utilizando 512 muestras de calibracion de wikitext-2, con precision de 4 bits y grupo de 128. La innovacion principal es que la cuantizacion comprime tambien las capas embed_tokens y lm_head (dos tensores de dimension 248320 x 5120), que normalmente se dejan en BF16 en otras cuantizaciones. Esto ahorra aproximadamente 6 GB de VRAM, lo que permite contextos de 262.144 tokens en tarjetas de 24 GB. El modelo base fue sometido a un proceso de "abliteration" para eliminar los rechazos a contenido controvertido.

## Capacidades

- Generacion de texto y razonamiento con configuracion de razonamiento ajustable (thinking mode).
- Comprension de imagenes gracias al vision tower incluido (VLM multimodal).
- Decodificacion especulativa mediante el cabezal MTP (multi-token prediction), que acelera la generacion entre 0.92x y 1.49x segun la GPU.
- Soporte de contexto largo nativo de 262.144 tokens en GPUs de 24 GB o mas.
- Capacidad de tool calling y function calling (heredada de Qwen3.8-27B).
- Capacidades de agente y razonamiento multi-paso para tareas de largo horizonte.
- Comportamiento "uncensored": tasa de rechazo medida del 1,2% (5 rechazos en 416 prompts de prueba).

## Casos de uso

- Analisis de documentos legales extensos: con 262.144 tokens de contexto en una RTX 4090, el modelo puede procesar contratos completos, sentencias o expedientes de miles de paginas en una sola pasada, sin necesidad de chunking ni RAG.
- Agente de codigo autonomo: su soporte de tool calling y razonamiento multi-paso permite usarlo como agente que navega por repositorios, ejecuta comandos y modifica archivos en tareas de desarrollo de largo recorrido.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD mediante vLLM para autocompletado, revision de pull requests o generacion de tests, con latencia de primer token de aproximadamente 1 segundo en RTX 4090.
- Chat sin censura para escritura creativa: su baja tasa de rechazo (1,2%) lo hace util para generacion de ficcion, guiones o contenido adulto sin las restricciones habituales de los modelos comerciales.
- Asistente multimodal de documentacion tecnica: combina la comprension de imagenes (diagramas, capturas de pantalla) con generacion de texto, util para documentar APIs o explicar arquitecturas a partir de esquemas.
- Investigacion academica sobre alineacion y seguridad: su naturaleza abliterada lo convierte en un objeto de estudio para investigar los efectos de la eliminacion de rechazos en modelos de gran tamano.

## Benchmarks y rendimiento

La model card del autor incluye datos medidos en una RTX 3090 (24 GB) con vLLM 0.27.1:

| Benchmark | Resultado | n |
|---|---|---|
| MMLU | 0.7995 | 1531 |
| Compliance (tasa de no-rechazo) | 0.988 (5 rechazos) | 416 |

Rendimiento de inferencia medido por GPU (contexto de 4.000 tokens, salvo indicacion):

| GPU | VRAM | max context | tok/s @4k | MTP k=2 | TTFT 3.5k |
|---|---|---|---|---|---|
| RTX 5090 | 32 GB | 262.144 | 87.6 | 0.92x | 0.98 s |
| RTX 4090 | 24 GB | 262.144 | 56.4 | 0.98x | 1.30 s |
| RTX 3090 Ti | 24 GB | 262.144 | 56.1 | 1.49x | 2.40 s |
| RTX 3090 | 24 GB | 262.144 | 50.4 | 1.11x | no medido |
| RTX A4000 | 16 GB | 14.336 | 28.3 | no arranca | 3.78 s |
| RTX 5060 Ti | 16 GB | 12.288 | 27.4 | no arranca | 4.49 s |
| RTX 5070 Ti | 16 GB | 10.240 | 50.8 | no arranca | 2.25 s |
| RTX 4080 Super | 16 GB | no medido | 43.6 | no arranca | 2.00 s |

## Requisitos de hardware

- VRAM minima para inferencia: 16 GB, con contexto limitado (entre 10.240 y 14.336 tokens segun la tarjeta).
- VRAM recomendada: 24 GB para contexto completo de 262.144 tokens.
- GPUs compatibles: RTX 3090, 3090 Ti, 4090, 5090 (24 GB o mas) para contexto completo; RTX A4000, 5060 Ti, 5070 Ti, 4080 Super (16 GB) para contextos reducidos.
- No cabe en GPUs de 8 GB o 12 GB.
- Despliegue: requiere el fork Zynerji/vllm (commit 3819bae7a3bba08154f9ee2eb61c85d7796dcadc). No funciona con vLLM stock. No se menciona soporte para llama.cpp, Ollama o TGI.
- Parametros de despliegue criticos: `--max-num-batched-tokens 2048` (el valor por defecto de 8192 reduce el contexto maximo), `--gpu-memory-utilization 0.97` (0.98 causa EngineDeadError), `--kv-cache-dtype fp8` obligatorio.
- Concurrencia limitada: `--max-num-seqs` no puede superar 32 en 24 GB, ya que el numero de bloques de estado Mamba (~39) limita los decodes concurrentes.
- MTP (decodificacion especulativa) solo funciona en GPUs de 24 GB o mas; en 16 GB el motor no arranca.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| **Qwen3.8-27B-PristinelyUncensored-HOMEUSER-16-24** (este) | 27B (4,4B cuantizados) | 262.144 | Apache 2.0 | int4, embeddings cuantizados | Requiere fork de vLLM; uncensored |
| Qwen3.8-27B (original) | 27B | 262.144 | Apache 2.0 | BF16 | Modelo base sin abliterar |
| Ektome-Qwen3.8-27B-PristinelyUncensored (base) | 27B | 262.144 | Apache 2.0 | BF16 | Version abliterada en precision completa |
| Ektome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP | 27B | no disponible | Apache 2.0 | GPTQ 4-bit, group 128 | Variante GPTQ con MTP, sin embeddings cuantizados |
| Ektome-Qwen3.8-27B-PristinelyUncensored-HYBRID | 27B | no disponible | Apache 2.0 | no disponible | Variante con MTP completo |

## Limitaciones y advertencias

- Requiere un fork especifico de vLLM (Zynerji/vllm) que no es el oficial; el vLLM stock no puede cargar este checkpoint.
- En GPUs de 16 GB, el contexto maximo es limitado (10.240 a 14.336 tokens) y varia significativamente entre tarjetas con diferencias minimas de VRAM visible.
- MTP no funciona en ninguna GPU de 16 GB probada; el motor falla al arrancar.
- La tasa de rechazo del 1,2% implica que el modelo responde a practicamente cualquier solicitud, incluido contenido ilegal o peligroso. No es adecuado para despliegues donde se requiera moderacion de contenido.
- No se han publicado resultados de benchmarks comparativos completos (HumanEval, GSM8K, etc.) en la informacion disponible.
- Los datos de rendimiento (tok/s, TTFT) fueron medidos en hardware alquilado con parametros especificos; los resultados pueden variar en otros entornos.
- La configuracion de despliegue es extremadamente sensible: cambiar `--gpu-memory-utilization` de 0.97 a 0.98 provoca fallos del motor.
- La concurrencia esta limitada a 32 secuencias simultaneas en 24 GB debido a la arquitectura de atencion lineal.
- No se especifican los idiomas soportados, aunque por su origen Qwen se espera un soporte multilingue amplio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zynerji/Qwen3.8-27B-PristinelyUncensored-HOMEUSER-16-24
- Modelo base (BF16): https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- Variante HYBRID: https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored-HYBRID
- Variante GPTQ-MTP: https://llm-explorer.com/model/Zynerji%2FEktome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP,5B9Ez7pfpsPlkjLdKClgIF y https://friendli.ai/models/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP
- Modelo original Qwen3.8-27B: https://lmstudio.ai/models/qwen3.8
