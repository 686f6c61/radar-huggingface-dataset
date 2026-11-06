# Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF

## Resumen

Qwen3.8-Flash-Next-TR3-G-GGUF es una cuantización experimental del modelo Qwen3.8-Flash-Next, publicado por el usuario Ternii (editor: Wai Chung) bajo el esquema propietario TR Quantisation. Se trata de un transformer de tipo mixture-of-experts (MoE) de aproximadamente 180.000 millones de parámetros totales, de los cuales unos 6.000 millones se activan por token según el desglose de Qwen, más 51.000 millones correspondientes a una tabla de embeddings n-gram y 4.000 millones de una cabeza MTP. El modelo base lo desarrolla el equipo Qwen y se distribuye bajo la licencia Qwen Community 1.0.

La particularidad de esta ficha es el método de compresión: los pesos de las capas lineales y de los expertos enrutados se almacenan a 3 trits por peso (27 niveles, con una escala de 16 bits por grupo de 128 pesos), la tabla de embeddings n-gram se redondea a valores de 3 trits y se guarda en un contenedor Q5_0, y los pesos de hiperconexión se mantienen a 8 bits. Todo ello se empaqueta en formato GGUF para llama.cpp, sin reentrenamiento.

El resultado es un artefacto de 114,3 GB que, según el autor, puede ejecutarse en Macs desde 16 GB de RAM manteniendo los expertos en el SSD tras una caché fija. Es importante subrayar que requiere un fork parcheado de llama.cpp: el tipo de tensor `TQ27_128` no existe en la versión upstream, por lo que las compilaciones estándar, LM Studio y Ollama no pueden cargarlo. Además, solo soporta Metal (Apple Silicon); CUDA no está contemplado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con tabla de embeddings n-gram e hiperconexiones |
| Parametros totales | 176.943.899.520 (~180B; desglose: ~125B con 6B activados, 51B de embeddings n-gram, 4B de MTP) |
| Parametros activos | ~6B por token (según desglose del autor) |
| Longitud de contexto | 4.096 tokens en los ejemplos de ejecución del autor (no se especifica el máximo del modelo base) |
| Tipos de cuantizacion | TR3-G: 3 trits por peso (27 niveles) en capas lineales y expertos enrutados, escala de 16 bits por grupo de 128 pesos; embeddings n-gram en Q5_0; hiperconexiones a 8 bits |
| Idiomas soportados | Inglés (según la model card y los tags) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (10 shards), tipo de tensor propietario `TQ27_128` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención estándar y mecanismo de mezcla de expertos, complementado por una tabla de embeddings n-gram de gran tamaño (51B parámetros) y una cabeza MTP (multi-token prediction) de 4B. Esta cuantización no reentrena el modelo: parte de los pesos BF16 de Qwen y aplica calibración GPTQ para obtener los códigos de 3 trits, que luego se empaquetan en GGUF. Los datasets listados en los tags (OpenCodeInstruct, hendrycks_math, gsm8k, oasst2) corresponden presumiblemente al material de calibración, no a un entrenamiento adicional.

La innovación técnica principal es el esquema TR Quantisation, que reduce cada peso lineal a 27 niveles discretos y mantiene los expertos enrutados en SSD mediante una caché configurable (`LLAMA_MOE_CACHE_MIB`). El runtime es un patch series sobre llama.cpp en el commit `ff5a233`, con fusions de decodificación específicas para este modelo (`GGML_METAL_OPT_GDNPREP` y `GGML_METAL_OPT_NGATED`). No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO en su desarrollo original.

## Capacidades

- Generación de texto conversacional en inglés, con modo "thinking" activado por defecto en llama.cpp con `--jinja`.
- Razonamiento matemático: los ejemplos de velocidad del autor usan preguntas de GSM8K, lo que sugiere competencia en aritmética de varios pasos.
- Generación de código: el dataset de calibración OpenCodeInstruct apunta a este dominio, aunque no se documentan benchmarks específicos.
- Razonamiento multi-paso: la presencia de una cabeza MTP en el modelo base indica soporte para predicción de múltiples tokens, aunque esta cuantización no incluye dicha cabeza ("no MTP head").
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin visión ni audio: es un modelo exclusivamente de texto ("no vision encoder").

## Casos de uso

- Experimentación con cuantización extrema en Apple Silicon: investigadores que quieran evaluar el impacto de 3 trits por peso en un MoE de ~180B pueden ejecutar este GGUF en un Mac de 32-64 GB con el fork parcheado, algo imposible con los pesos BF16.
- Inferencia local de un MoE grande en hardware de consumo: con una caché de expertos de 13.501 MiB, el autor reporta 10,3 tokens/s en un M5 Max emulando 32-48 GB, lo que permite prototipado interactivo sin GPU dedicada.
- Evaluación de calidad de cuantizaciones ternarias: comparar las respuestas de TR3-G frente al modelo base o a la variante TR2.57-G (vLLM) para medir la degradación introducida por la compresión.
- Docencia y demostraciones de arquitecturas MoE: el desglose de parámetros (125B + 51B + 4B) y la separación de expertos en SSD ofrecen un caso práctico para explicar enrutamiento y gestión de memoria.
- Procesamiento por lotes de preguntas cortas en local: con `enable_thinking: false` y contexto de 4k, el servidor puede responder consultas de tipo GSM8K a velocidad moderada en un Mac de gama alta.
- Investigación sobre decodificación especulativa y fusions Metal: el patch series incluye optimizaciones (`GGML_METAL_OPT_GDNPREP`, `GGML_METAL_OPT_NGATED`) que pueden servir de base para estudiar el rendimiento de kernels Metal en MoE cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de velocidad y memoria en un Apple M5 Max de 128 GB, emulando tamaños menores mediante el límite de caché:

| Memoria del Mac | Caché de expertos (MiB) | Velocidad servidor (tokens/s, GSM8K) | Velocidad replay (tokens/s) | Memoria wired añadida (estable / pico) |
|---|---|---|---|---|
| 64 GB o más | 35.000 | 24,6 (una ejecución) | no ejecutado | 40,3 GB (42,3) |
| 32-48 GB | 13.501 | 10,3 (10,32 / 10,40) | 13,75 (una pasada) | 18,0-18,3 GB (20,1) |
| 24 GB | 6.750 | no disponible en el extracto | no disponible | no disponible |
| 16 GB | 5.900 | no disponible en el extracto | no disponible | no disponible |

El autor advierte que ninguna Mac real de 16, 24, 32, 48 o 64 GB ha ejecutado el modelo: todas las cifras provienen de emulación por límite de caché en una máquina de 128 GB, por lo que un equipo más pequeño leerá el SSD con más frecuencia y obtendrá velocidades inferiores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF | ~180B totales, ~6B activos | 4.096 en ejemplos | 3 trits (TR3-G), GGUF | Qwen Community 1.0 | Requiere fork de llama.cpp, solo Metal |
| Ternii/Qwen3.8-Flash-Next-TR2.57-G | ~180B totales, ~6B activos | no disponible | 2,57 trits, formato vLLM | Qwen Community 1.0 | vLLM (no compatible con el runtime Mac) |
| agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF | 125B MoE | no disponible | GGUF (19,9 GiB en GPU) | no disponible | RTX 3090, 4090, 7900 XTX |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF | 125B MoE | no disponible | GGUF | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere un fork parcheado de llama.cpp: el tipo `TQ27_128` no existe en upstream, por lo que LM Studio, Ollama y compilaciones estándar no pueden cargarlo.
- Solo soporta Metal (Apple Silicon); CUDA no está implementado.
- Estado experimental: ninguna Mac real de 16, 24, 32, 48 o 64 GB ha ejecutado el modelo; las velocidades publicadas son emulaciones.
- Los resultados no son transferibles a la variante TR2.57-G para vLLM, que usa 2 trits en expertos poco usados y un runtime distinto.
- El modo thinking está activado por defecto con `--jinja`; sin desactivarlo, las respuestas cortas pueden truncarse o alargarse innecesariamente.
- La caché de prompt de llama-server (`--cache-ram`) debe desactivarse (`--cache-ram 0`) para evitar crecimiento de memoria de ~235 MiB por petición hasta 8 GiB; el coste es reprocesar prefijos repetidos.
- Solo inglés: no se documentan capacidades multilingües.
- Sin cabeza MTP ni codificador de visión en esta cuantización.
- Riesgo de alucinación inherente al modelo base, agravado potencialmente por la cuantización ternaria; no se han publicado evaluaciones de calidad que lo cuantifiquen.
- La licencia Qwen Community 1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime parcheado: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Repositorio del proyecto: https://github.com/ternii-ai/tritq-vllm
- Variante vLLM TR2.57-G: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR2.57-G
- Cuantización alternativa Gyro-Coder: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Cuantización alternativa Gyro: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
