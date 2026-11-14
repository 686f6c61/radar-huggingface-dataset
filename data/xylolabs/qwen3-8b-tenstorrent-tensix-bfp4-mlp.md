# Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Qwen3-8B-Tenstorrent-Tensix-BFP4-MLP es una cuantizacion del modelo Qwen3-8B de Alibaba Qwen, desarrollada por Xylolabs, orientada especificamente a la ejecucion en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante la pila de software TT-NN (tt-metal). El modelo resuelve el problema de desplegar un LLM de 8.000 millones de parametros en hardware Tensix, donde el formato nativo de pesos es el block-floating-point (BFP), no los formatos habituales de llama.cpp o GPTQ estandar. Para ello, las capas lineales se han cuantizado a `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8), almacenando las matrices en la rejilla BFP como valores bf16 para que TT-NN las empaquete sin alterar su valor.

El resultado es un checkpoint de 7,15 GB empaquetado, con una media de 6,99 bits por peso, que se mantiene muy cerca del modelo BF16 original: un KL medio de 0,0342 frente a BF16 y un top-1 del 92,41 % en la evaluacion del autor, superando en fidelidad a una cuantizacion Q4_K_M de llama.cpp (KL 0,04236, top-1 91,24 %). La arquitectura subyacente es la de Qwen3-8B, un transformer denso de 8.190.735.360 parametros con contexto largo y modo de razonamiento (thinking mode).

La relevancia actual del modelo es doble: por un lado, demuestra una via practica para llevar LLMs de tamano medio a NPUs de Tenstorrent con perdida de calidad medida y acotada; por otro, publica la metodologia (GPTQ con busqueda de exponente por bloque, calibracion en WikiText-2 y Wikipedia coreana) y las herramientas de verificacion (`pack_tensix.py`, `verify_grid.py`) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con capas lineales cuantizadas a block-floating-point para Tensix |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atencion q/k/v/o; bf16 en LM head, embeddings y normas; media de 6,99 bits/peso |
| Idiomas soportados | no disponible en la informacion proporcionada (calibracion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), empaquetables directamente en TT-NN; incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: cuantiza Qwen3-8B, un transformer denso de 36 capas con atencion completa y MLP, manteniendo intactos embeddings, LM head y normas en bf16. Las 36 capas de atencion (q, k, v, o) se convierten a `ttnn.bfloat8_b` mediante redondeo al mas cercano, mientras que las proyecciones MLP (gate, up, down) de las 36 capas se cuantizan a `ttnn.bfloat4_b` con GPTQ y una busqueda de exponente por bloque. La calibracion de GPTQ uso 65.536 tokens de WikiText-2 y de Wikipedia en coreano.

La innovacion tecnica clave es el almacenamiento de las matrices cuantizadas como valores bf16 situados sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin modificar sus valores (lectura de pesos en orden [in, out]). El autor verifico el empaquetado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, comprobando igualdad exacta tras el round-trip a dispositivo. No se ejecutaron tt-transformers ni tt-forge con este checkpoint. El modelo necesita aproximadamente 7,15 GB de memoria de dispositivo solo para los pesos, mas espacio para KV cache y buffers.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen3 (`apply_chat_template`).
- Razonamiento multi-paso con modo thinking, evaluado por el autor en 7 prompts de razonamiento con thinking activado.
- Respuestas cortas verificables: la evaluacion incluye 33 prompts con comprobacion automatica.
- Capacidades multilingues heredadas de Qwen3-8B (la evaluacion cubre texto en ingles y coreano).
- Inferencia en NPUs Tenstorrent Wormhole y Blackhole mediante TT-NN.
- Compatibilidad con la libreria transformers para carga y generacion en bf16 sobre GPU/CPU.
- No se documenta en la informacion disponible soporte explicito de tool calling, agentes, vision ni audio para este checkpoint.

## Casos de uso

- Despliegue en NPUs Tenstorrent: empaquetar los pesos con TT-NN en Wormhole o Blackhole para servir generacion de texto en hardware no-GPU, aprovechando que el checkpoint ya esta en la rejilla BFP nativa y evita conversion en tiempo de carga.
- Sustitucion de cuantizaciones GGUF en entornos Tensix: usar este checkpoint cuando se necesite un modelo de 8B con fidelidad cercana a BF16 (KL 0,0342) en lugar de Q4_K_M (KL 0,04236), manteniendo el mismo numero de respuestas correctas en la evaluacion del autor (39 de 40 frente a 38 de 40).
- Asistente conversacional multi-turno: cargar con transformers y `device_map="auto"` para prototipar chatbots con plantilla de chat Qwen3 antes de portar a hardware Tensix.
- Razonamiento con thinking mode: emplear los prompts de razonamiento con thinking activado para tareas que requieran cadena de pensamiento, dado que el autor valido que ninguna respuesta correcta en BF16 se pierde en esta cuantizacion.
- Validacion de pipelines de cuantizacion: usar `pack_tensix.py` y `verify_grid.py` como referencia para verificar que otras matrices cuantizadas se empaquetan sin cambios de valor en TT-NN.
- Investigacion en formatos block-floating-point: servir como caso de estudio reproducible de GPTQ sobre rejilla BFP4 con busqueda de exponente por bloque y calibracion bilingue (ingles y coreano).
- Evaluacion de fidelidad de cuantizaciones: comparar KL y top-1 frente a BF16 y Q4_K_M con el mismo protocolo (16.240 posiciones de WikiText-2 test y Wikipedia coreana) para decidir el formato de despliegue.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B) | 16 | 16,38 | 0 | 100 | 38 de 40 | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 6,99 | 7,152 | 0,0342 | 92,41 | 39 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,90 | 5,028 | 0,04236 | 91,24 | 38 de 40 | 0 |

Los datos de KL y top-1 cubren 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia coreana), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas 7 de razonamiento repetidos con thinking activado (40 en total). El autor no reporta velocidad de inferencia ni latencia. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 7,15 GB solo para los pesos del modelo de lenguaje, mas KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Software: TT-NN (ttnn) 0.81.1, verificado sobre ttsim (simulador de Blackhole); tt-metal como pila subyacente.
- Carga alternativa: transformers con `dtype="bfloat16"` y `device_map="auto"` sobre GPU o CPU; el repo ocupa 16,4 GB.
- No se documenta en la informacion disponible compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor indica explicitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Tamano | Contexto | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---:|---|---|
| Este modelo (BFP4 MLP) | 8,19 B | 6,99 | 7,152 GB | no disponible | 0,0342 | Apache 2.0 | Hugging Face (21 descargas) |
| Qwen3-8B BF16 | 8,19 B | 16 | 16,38 GB | no disponible | 0 | Apache 2.0 | Hugging Face (oficial) |
| Qwen3-8B Q4_K_M (llama.cpp) | 8,19 B | 4,90 | 5,028 GB | no disponible | 0,04236 | Apache 2.0 (derivada) | Generada por el autor con llama.cpp v0.9.0 |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye otros modelos comparables. Frente a Q4_K_M, este checkpoint usa mas bits por peso (6,99 frente a 4,90) y ocupa mas espacio (7,15 frente a 5,03 GB), pero logra menor KL (0,0342 frente a 0,04236) y una respuesta correcta mas en la evaluacion del autor (39 frente a 38 de 40).

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda los sesgos y riesgos de alucinacion de Qwen3-8B, no evaluados en la informacion disponible.
- La evaluacion mide cercania a BF16 (KL y top-1), no calidad de tarea; el propio autor lo advierte.
- No se reportan datos de velocidad, latencia ni throughput.
- El checkpoint solo se verifico con ttnn 0.81.1 sobre el simulador ttsim; no se ejecuto en silicio real segun la informacion disponible.
- tt-transformers y tt-forge no se probaron con este checkpoint.
- La calibracion GPTQ uso solo texto en ingles y coreano; el comportamiento en otros idiomas no esta medido.
- La longitud de contexto y la lista de idiomas soportados no se detallan en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantia, y aclara que no esta afiliado ni respaldado por Tenstorrent.
- El repo tiene muy poca adopcion (21 descargas, 0 likes) y fue creado en noviembre de 2026; no hay validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de Qwen3 (referencia arXiv): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
