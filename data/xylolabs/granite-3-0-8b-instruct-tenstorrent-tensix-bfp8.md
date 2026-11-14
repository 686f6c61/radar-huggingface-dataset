# Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP8

## Resumen

Esta ficha describe `Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP8`, una cuantización del modelo `ibm-granite/granite-3.0-8b-instruct` de IBM, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No es un modelo nuevo: es un checkpoint derivado en el que las capas lineales (proyecciones de atención q/k/v/o y las tres proyecciones MLP de las 40 capas del transformer) se han cuantizado a `ttnn.bfloat8_b` mediante GPTQ, mientras que el resto de tensores (embeddings, LM head atada, normas y demás) permanecen en bf16 como en el modelo base.

La relevancia de esta variante es de despliegue: el formato block floating point BFP8 es el que TT-NN empaqueta de forma nativa en memoria DRAM del dispositivo, de modo que los pesos no sufren transformación al cargarse en la NPU. El resultado ocupa 8,87 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, con 8,69 bits por peso de media, frente a los 16,34 GB del checkpoint BF16 original. Existe además una variante BFP4 del mismo autor para dispositivos con menos memoria.

El modelo base es un transformer decoder-only de 8.372.187.136 parámetros (8B) con licencia Apache 2.0 e instrucciones afinadas para conversación. La model card no documenta la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo original, por lo que esos datos se marcan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Granite 3.0; capas lineales cuantizadas a block floating point BFP8) |
| Parametros totales | 8.372.187.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en las 7 proyecciones por capa de 40 capas); resto de tensores en bf16. Media de 8,69 bits por peso. Existe variante BFP4 del mismo autor |
| Idiomas soportados | No disponible en la informacion proporcionada (la calibracion GPTQ uso texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,7 GB), compatible con `transformers`; empaquetado nativo para TT-NN |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Granite 3.0 de IBM: un transformer decoder-only de 8B parámetros con 40 capas y LM head atada a los embeddings. La modificación introducida por Xylolabs afecta únicamente a los pesos: las proyecciones de atención (q, k, v, o) y las tres proyecciones MLP (gate, up, down) de cada una de las 40 capas se cuantizan a la rejilla `bfloat8_b` mediante GPTQ, mientras que embeddings, LM head, normas y el resto de tensores se mantienen en bf16. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de forma que TT-NN las empaqueta sin alterar sus valores.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y el código de cuantización y empaquetado está publicado en el repositorio `XylolabsInc/tensix-bfp-gptq`. La verificación se hizo con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent, comprobando que el empaquetado no modifica ningún valor. El autor advierte que `tt-transformers` (tt-metal v0.81.1) no es utilizable con este modelo porque carga el checkpoint como un modelo tipo Llama e ignora los multiplicadores de embedding, atención, residual y logits propios de Granite, lo que produce una PCC de 0,20 en un prefill de 2 capas. `tt-forge` (tt-xla) aún no se ha probado con este checkpoint.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo `granite-3.0-8b-instruct`.
- Razonamiento y respuesta a preguntas de cultura general y conocimiento factual (evaluado con 33 prompts cortos con comprobación automática).
- Procesamiento de texto en inglés y coreano en la evaluación de fidelidad de cuantización; el conjunto completo de idiomas del modelo base no está documentado en la información disponible.
- Inferencia en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos BFP8.
- Ejecución en `transformers` estándar en GPU/CPU con `dtype="bfloat16"` y `device_map="auto"`.
- Soporte de chat template mediante `apply_chat_template`.
- Capacidades específicas del modelo base como tool calling, agentes o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está diseñado para cargarse directamente en TT-NN sin repackaging, lo que reduce el tiempo de arranque y evita conversiones en el host. Adecuado para entornos con aceleradores Tensix y requisito de memoria ajustado (8,87 GB de pesos).
- Servicio de chat en producción sobre hardware Tensix: al conservar el chat template y las capacidades de instrucción del modelo base, puede servir conversaciones multi-turno en una NPU con memoria limitada, siempre que se añada espacio para KV cache y buffers.
- Evaluación comparativa de cuantización: el repositorio incluye métricas de KL, top-1 y respuestas correctas frente a BF16 y Q4_K_M, lo que lo convierte en un punto de referencia útil para estudiar el impacto de BFP8 en la calidad de un modelo 8B.
- Investigación en formatos block floating point: sirve para validar pipelines de GPTQ sobre la rejilla `bfloat8_b` y comprobar la equivalencia exacta entre pesos empaquetados y desempaquetados con `pack_tensix.py` y `verify_grid.py`.
- Prototipado con `transformers` en GPU: el checkpoint se puede cargar en bf16 en una GPU convencional para comparar salidas con la versión empaquetada, útil en tareas de validación de portabilidad.
- Generación de texto en inglés y coreano: la calibración incluyó Wikipedia en coreano, lo que hace razonable su uso en tareas bilingües de resumen o generación, aunque no hay evaluación específica por idioma publicada.
- Integración en pipelines de CI para hardware Tensix: los scripts de verificación permiten comprobar en cada build que el empaquetado de matrices no altera valores, como test de regresión del stack TT-NN.

## Benchmarks y rendimiento

Datos publicados en la model card. La evaluación compara BF16, este modelo BFP8 y una cuantización Q4_K_M de llama.cpp v0.9.0 generada desde el mismo checkpoint sin importance matrix.

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (granite-3.0-8b-instruct) | 16 | 16,34 | 0 | 100 | 25 de 33 | - |
| Este modelo (BFP8) | 8,69 | 8,871 | 0,00120 | 98,47 | 23 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 4,943 | 0,05921 | 89,30 | 23 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.248 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con el chat template. Las respuestas corresponden a 33 prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la variante cuantizada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 8,87 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. El autor recomienda la variante BFP4 en dispositivos con menos memoria.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre el simulador `ttsim` de Blackhole.
- GPU convencionales: al cargarse en `transformers` con `dtype="bfloat16"`, el checkpoint ocupa del orden de 16,7 GB en el repositorio y requiere aproximadamente esa magnitud de VRAM en bf16; cabe en GPUs de 24 GB o más (RTX 3090, RTX 4090, A100 40/80 GB, H100).
- Despliegue en Tensix: TT-NN con empaquetado nativo mediante `ttnn.as_tensor` con `dtype=ttnn.bfloat8_b` y `layout=ttnn.TILE_LAYOUT`.
- Despliegue en GPU/CPU: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint empaquetado.
- `tt-transformers` (tt-metal v0.81.1): no utilizable, carece de soporte para Granite y produce PCC de 0,20 en prefill de 2 capas.
- `tt-forge` (tt-xla): no probado con este checkpoint; por defecto mantiene los pesos en bf16 y sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en el layout `[out, in]` de PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8) | 8,37B | No disponible | BFP8, 8,69 bits/peso | 8,871 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| granite-3.0-8b-instruct (BF16) | 8,37B | No disponible | BF16, 16 bits/peso | 16,34 GB | Apache 2.0 | Hugging Face, uso general |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,37B | No disponible | 4,84 bits/peso | 4,943 GB | Apache 2.0 | Generado con llama.cpp v0.9.0 |
| Variante BFP4 de Xylolabs | 8,37B | No disponible | BFP4 | No disponible | Apache 2.0 | Hugging Face, para dispositivos con menos memoria |

La comparación se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de modelos de otros fabricantes. En calidad medida por KL y top-1, BFP8 se sitúa muy cerca de BF16 (KL 0,00120, top-1 98,47 %) y claramente por encima de Q4_K_M (KL 0,05921, top-1 89,30 %), a costa de duplicar el tamaño de este último.

## Limitaciones y advertencias

- Modelo derivado, no original: cualquier limitación del modelo base Granite 3.0 (sesgos, alucinaciones, conocimiento desactualizado) se hereda y puede amplificarse ligeramente por la cuantización.
- Dependencia de hardware: el checkpoint está pensado para TT-NN y Tensix; su uso en otras plataformas requiere cargarlo en bf16 con `transformers`, perdiendo la ventaja de memoria.
- `tt-transformers` no soporta Granite: cargarlo como modelo tipo Llama produce resultados incorrectos (PCC 0,20 en 2 capas) por ignorar los multiplicadores propios de Granite.
- `tt-forge` no verificado con este checkpoint; su comportamiento por defecto (bf16) y sus opciones de recuantización no están validados en la model card.
- Memoria: 8,87 GB de pesos más KV cache y buffers; en dispositivos Tensix con poca DRAM puede ser necesario recurrir a la variante BFP4.
- Idiomas: la model card no documenta la lista completa de idiomas del modelo base; la calibración solo cubrió inglés y coreano, por lo que el comportamiento en otros idiomas no está evaluado.
- Longitud de contexto: no documentada en la información disponible; no se debe asumir un valor concreto en producción.
- Evaluación limitada: las métricas publicadas se basan en 16.248 posiciones de texto y 33 prompts cortos, no en benchmarks estándar; no hay datos de MMLU, HumanEval ni GSM8K.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado en dominios específicos.
- Repositorio con pocas descargas (64) y ningún "like" en el momento de la consulta: ecosistema pequeño, menor probabilidad de soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Variante BFP4: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BFP4
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del checkpoint: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
