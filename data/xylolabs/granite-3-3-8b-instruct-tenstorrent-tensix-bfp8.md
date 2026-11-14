# Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix-BFP8

## Resumen

`Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix-BFP8` es una exportación cuantizada del modelo `ibm-granite/granite-3.3-8b-instruct` de IBM, preparada por Xylolabs para su ejecución en aceleradores NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original en la que las capas lineales (proyecciones de atención q, k, v, o y las proyecciones MLP gate, up, down de las 40 capas) se cuantizan al formato `bfloat8_b` (BFP8) mediante GPTQ, mientras que el resto de tensores (embeddings, LM head, normalizaciones) permanecen en bf16.

El modelo base Granite 3.3 8B Instruct es un transformer decoder-only de 8.372 millones de parámetros orientado a generación de texto, conversación e instrucciones, con licencia Apache 2.0. Esta versión cuantizada ocupa 16,7 GB en el repositorio y requiere aproximadamente 8,87 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.

Su relevancia radica en que demuestra una ruta de cuantización específica para hardware Tenstorrent: los pesos se almacenan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN los empaqueta sin alterar sus valores. La evaluación reportada por el autor muestra una pérdida de calidad mínima frente a BF16 (KL medio de 0,00262 frente a 0,33915 de Q4_K_M de llama.cpp) con un tamaño de 8,69 bits por peso de media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Granite 3.3 8B Instruct); capas lineales cuantizadas a BFP8 para Tensix |
| Parametros totales | 8.372.219.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en atención q/k/v/o y MLP gate/up/down; bf16 en embeddings, LM head, normas y demás tensores; 8,69 bits por peso de media |
| Idiomas soportados | no disponible (el modelo base Granite 3.3 soporta múltiples idiomas, pero la model card no lo detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); empaquetado para TT-NN como `bfloat8_b` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de IBM (familia Granite 3.3) con 8.372 millones de parámetros. La model card de esta exportación no detalla la composición del dataset de entrenamiento original ni si hubo RLHF/DPO; esa información corresponde a la model card de `ibm-granite/granite-3.3-8b-instruct`, no incluida aquí.

La innovación de esta versión es el proceso de cuantización: las proyecciones lineales se cuantizan con GPTQ sobre la rejilla `bfloat8_b` de TT-NN, manteniendo el exponente compartido de cada bloque tal como lo establece el empaquetador. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El archivo `quant4.json` lista el formato de cada proyección. Los tensores cuantizados se almacenan como valores bf16 sobre la rejilla BFP8, lo que permite que TT-NN los empaquete sin modificar sus valores (verificado con `pack_tensix.py` y `verify_grid.py`). La compatibilidad con `tt-transformers` (tt-metal v0.81.1) no está resuelta: al no soportar Granite, carga el checkpoint como modelo tipo Llama e ignora los multiplicadores de embedding, atención, residual y logits de Granite, produciendo un PCC de 0,18 en prefill de 2 capas. `tt-forge` (tt-xla) aún no se ha probado con este checkpoint.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, formato conversacional con plantilla de chat).
- Seguimiento de instrucciones, heredado del modelo base Granite 3.3 8B Instruct.
- Razonamiento y código: capacidades del modelo base, no verificadas específicamente en esta exportación cuantizada.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta exportación.
- Capacidades de agente y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: el conjunto de calibración incluye inglés y coreano, pero la model card no declara la lista de idiomas soportados.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el modelo está empaquetado específicamente para TT-NN (`bfloat8_b`), con verificación de que el empaquetado no altera los valores de los pesos, lo que permite ejecutar inferencia de un LLM de 8B en hardware Tensix con ~8,87 GB de memoria de dispositivo para los pesos.
- Evaluación de pipelines de cuantización BFP8: sirve como referencia para validar la pérdida de calidad de GPTQ sobre la rejilla `bfloat8_b` frente a BF16 y a Q4_K_M, con métricas de KL y top-1 publicadas.
- Investigación en hardware alternativo: útil para equipos que exploran aceleradores no GPU (Tenstorrent) y necesitan un checkpoint con licencia Apache 2.0 y trazabilidad de cuantización (`quant4.json`).
- Generación de texto conversacional en entornos con restricciones de memoria: al reducir los pesos a 8,69 bits por peso de media, permite ajustar el modelo en dispositivos con menos memoria que los 16,34 GB del BF16.
- Validación de toolchains: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad del empaquetado en DRAM del dispositivo, útil en pipelines de CI para hardware Tensix.
- Prototipado de asistentes conversacionales: mediante `transformers` con `device_map="auto"` y plantilla de chat, se puede usar como base para asistentes en inglés o coreano, idiomas presentes en la calibración.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-3.3-8b-instruct) | 16 | 16,34 | 0 | 100 | 29 de 33 | - |
| **Este modelo (BFP8)** | 8,69 | 8,871 | 0,00262 | 98,26 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 4,943 | 0,33915 | 83,52 | 27 de 33 | 1 |

Las métricas de KL y top-1 cubren 15.840 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix (sha256 `d9c39f0c7c62a027d8e593a62134fc3551142b6eaf1b34465b111ae39400f5c9`).

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 8,87 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole); verificado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.
- GPU consumer: no se proporcionan requisitos de VRAM para GPU; el checkpoint puede cargarse en `transformers` con `dtype="bfloat16"` y `device_map="auto"`, pero no se documenta el rendimiento en GPU.
- Opciones de despliegue: TT-NN (`ttnn`) para Tensix; `transformers` para carga y prueba; `tt-forge` (tt-xla) aún no probado con este checkpoint; `tt-transformers` no es compatible con Granite.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Formato / hardware |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 8,37B | no disponible | 8,871 GB (8,69 bits/peso) | Apache 2.0 | safetensors, TT-NN Tensix |
| ibm-granite/granite-3.3-8b-instruct (BF16) | 8,37B | no disponible | 16,34 GB | Apache 2.0 | safetensors, transformers |
| Q4_K_M (llama.cpp, mismo checkpoint) | 8,37B | no disponible | 4,943 GB (4,84 bits/peso) | Apache 2.0 | GGUF, llama.cpp |

La comparativa se limita al mismo checkpoint en distintos formatos; no se dispone de datos de otros modelos comparables de 8B en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; heredables del modelo base Granite 3.3 8B Instruct.
- Riesgo de alucinación: no evaluado específicamente; el modelo base es un LLM generativo y presenta el riesgo habitual.
- Limitaciones de contexto e idioma: la longitud de contexto no se detalla en esta model card; la calibración cubre inglés y coreano, pero no se declara la lista completa de idiomas.
- Restricciones de licencia: Apache 2.0, permite uso comercial con las obligaciones de la licencia (atribución, aviso de cambios).
- Compatibilidad: `tt-transformers` no soporta Granite y produce resultados incorrectos (PCC 0,18 en prefill de 2 capas); `tt-forge` aún no se ha probado con este checkpoint.
- La verificación en hardware real se realizó sobre `ttsim` (simulador de Blackhole), no necesariamente en silicio físico.
- El formato `bfloat8_b` es específico de TT-NN; fuera de Tensix, el modelo se carga en bf16 vía `transformers`, perdiendo la ventaja de tamaño.
- El repositorio tiene 65 descargas y 0 likes en el momento de la consulta; es una exportación reciente (creada el 2026-11-11) con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
