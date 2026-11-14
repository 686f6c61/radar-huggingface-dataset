# Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP4

## Resumen

Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo ibm-granite/granite-4.2-8b de IBM, adaptada específicamente para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). La cuantización se ha realizado con GPTQ sobre las capas lineales (atención y MLP de las 40 capas del transformer), empleando el formato de coma flotante por bloques `bfloat4_b` (BFP4) nativo de la pila TT-NN, con 4,5 bits por peso en esas matrices y bf16 en el resto de tensores (embeddings, LM head y normalizaciones).

El modelo base es un transformer denso de 8.791.592.960 parámetros (8,79 mil millones) con licencia Apache 2.0 y soporte declarado para doce idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino. La relevancia de esta ficha radica en que demuestra un flujo de cuantización de precisión mixta orientado a hardware no-GPU, con verificación bit a bit del empaquetado en TT-NN y una evaluación de degradación frente a BF16 y frente a una cuantización Q4_K_M de llama.cpp.

El resultado ocupa 6,13 GB empaquetados (5,58 bits por peso de media) y requiere aproximadamente 6,13 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers. La model card reporta una KL media de 0,13995 frente a BF16 y un top-1 del 86,08 %, con 29 de 33 respuestas correctas en un conjunto de comprobación automática, superando ligeramente al Q4_K_M de llama.cpp en ese conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 4.2, 40 capas) |
| Parametros totales | 8.791.592.960 (8,79 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ con busqueda de exponente por bloque; capas lineales en `ttnn.bfloat4_b` (BFP4, 4,5 bits/peso), resto en bf16; 5,58 bits/peso de media |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), empaquetado para TT-NN (`quant4.json` describe el formato por proyeccion) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint ibm-granite/granite-4.2-8b, un transformer denso de 40 capas. No se ha reentrenado: la model card no documenta datos de entrenamiento propios, ni RLHF, ni DPO. La intervención de Xylolabs se limita al proceso de cuantización post-entrenamiento. Las matrices cuantizadas son las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 40 capas; el LM head, los embeddings, las normalizaciones y el resto de tensores se mantienen en bf16 tal como en el modelo base.

La innovación técnica principal es el uso de coma flotante por bloques BFP4 (`ttnn.bfloat4_b`) con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin alterar sus valores; el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) que comprueban la igualdad exacta tras el empaquetado. La model card advierte de que tt-transformers (tt-metal v0.81.1) no es utilizable con este modelo porque carece de soporte para Granite: carga el checkpoint como un modelo tipo Llama e ignora el multiplicador de atención de Granite (1/128 frente a 1/sqrt(128) de Llama), lo que produjo una PCC de 0,95 en un prefill de 2 capas sobre la versión BFP8. tt-forge (tt-xla) aún no se ha probado con este checkpoint.

## Capacidades

- Generación de texto conversacional en doce idiomas, incluyendo español, inglés, alemán, francés, portugués, italiano, neerlandés, checo, árabe, japonés, coreano y chino.
- Razonamiento y respuesta a preguntas de cultura general y conocimiento factual (el conjunto de evaluación incluye 33 prompts cortos con comprobación automática).
- Generación de texto con plantilla de chat (`apply_chat_template`) y formato de conversación multi-turno.
- Inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante TT-NN, con empaquetado exacto de pesos en `bfloat4_b` y también en `bfloat8_b`.
- Ejecución en transformers estándar en bf16 con `device_map="auto"` (quickstart documentado en la model card).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Despliegue en hardware Tenstorrent: el formato BFP4 está diseñado para empaquetarse directamente en NPUs Tensix (Wormhole, Blackhole) mediante TT-NN, lo que permite servir el modelo en aceleradores no-GPU con 6,13 GB de memoria de dispositivo para los pesos.
- Inferencia en entornos con memoria limitada: la reducción de 17,58 GB (BF16) a 6,13 GB empaquetados hace viable el modelo en dispositivos con DRAM restringida, dejando margen para caché KV y buffers.
- Asistentes conversacionales multilingües: el soporte de doce idiomas y la plantilla de chat permiten construir interfaces de conversación en español, inglés, alemán, francés, portugués, italiano, neerlandés, checo, árabe, japonés, coreano y chino.
- Evaluación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar bit a bit el empaquetado de pesos, útil para equipos que integren cuantización BFP4 en sus propias cadenas de despliegue.
- Investigación sobre degradación por cuantización: la model card proporciona métricas de KL y top-1 frente a BF16 y Q4_K_M, lo que facilita estudios comparativos de precisión en formatos de bloque.
- Prototipado en simulación: el modelo se ha verificado con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent, lo que permite desarrollar y depurar kernels sin hardware físico.
- Generación de texto general en producción sobre transformers: el quickstart con `AutoModelForCausalLM` en bf16 permite integrar el modelo en servicios estándar de Hugging Face cuando no se dispone de NPU Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-4.2-8b) | 16 | 17,58 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP4) | 5,58 | 6,127 | 0,13995 | 86,08 | 29 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,86 | 5,348 | 0,14751 | 85,64 | 28 de 33 | 3 |

Las métricas de KL y top-1 cubren 16.216 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 pero incorrectas o rotas en la variante cuantizada, sin contar empates cercanos. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. El criterio de aceptación declarado por el autor es una KL media como máximo 1,5 veces la de Q4_K_M.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 6,13 GB solo para los pesos del modelo de lenguaje, más espacio adicional para la caché KV y buffers (cantidad no especificada en la información disponible).
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante la pila TT-NN (tt-metal).
- Simulación: verificado con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent.
- GPU: no se documentan requisitos de VRAM para GPU en la información disponible; el quickstart de transformers usa `dtype="bfloat16"` y `device_map="auto"`, lo que en la práctica requiere memoria suficiente para los pesos en bf16 (17,58 GB) si se carga sin empaquetar.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño del repositorio es de 17,6 GB y el modelo en bf16 ocupa 17,58 GB, por lo que no cabría en GPUs de 16 GB o menos en ese formato.
- Opciones de despliegue: TT-NN sobre Tensix (Wormhole, Blackhole), transformers con `AutoModelForCausalLM`, y tt-forge (tt-xla) que aún no se ha probado con este checkpoint. tt-transformers no es compatible con este modelo por falta de soporte de Granite.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Este modelo (BFP4) | 8,79 mil millones | no disponible | 5,58 | 6,127 GB | Apache 2.0 | Tenstorrent Tensix |
| BF16 base (ibm-granite/granite-4.2-8b) | 8,79 mil millones | no disponible | 16 | 17,58 GB | Apache 2.0 | GPU/CPU |
| Q4_K_M (llama.cpp) | 8,79 mil millones | no disponible | 4,86 | 5,348 GB | Apache 2.0 (heredada) | CPU/GPU |

La comparación se limita al mismo checkpoint en distintos formatos, ya que la información disponible no incluye otros modelos de la misma categoría con datos verificables. Frente al BF16, este modelo reduce el tamaño un 65 % con una KL media de 0,13995 y un top-1 del 86,08 %. Frente al Q4_K_M de llama.cpp, ocupa un 14,6 % más de espacio pero obtiene mejor KL (0,13995 frente a 0,14751), mejor top-1 (86,08 % frente a 85,64 %) y cero respuestas perdidas frente a tres.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar del modelo base de IBM, hereda los sesgos de sus datos de entrenamiento, no especificados en esta ficha.
- Alucinación: no se han publicado métricas específicas de alucinación; la cuantización BFP4 introduce una degradación medible (KL media de 0,13995, top-1 del 86,08 %), por lo que la fiabilidad es inferior a la del BF16.
- Compatibilidad de software: tt-transformers (tt-metal v0.81.1) no es utilizable con este modelo porque ignora el multiplicador de atención de Granite (1/128 frente a 1/sqrt(128)); se observó una PCC de 0,95 en un prefill de 2 capas sobre la variante BFP8. tt-forge aún no se ha probado con este checkpoint.
- Contexto: la longitud de contexto del modelo base no se especifica en la información proporcionada.
- Licencia: Apache 2.0, lo que permite uso comercial, pero se recomienda verificar las condiciones del modelo base ibm-granite/granite-4.2-8b y de las herramientas de cuantización (repositorio tensix-bfp-gptq).
- Dependencia de hardware: el formato está optimizado para TT-NN; fuera de Tensix, el modelo se carga en bf16 con transformers, perdiendo la ventaja de tamaño (17,58 GB).
- Idiomas: aunque se declaran doce idiomas, la evaluación de calidad solo cubre inglés y coreano; el rendimiento en español, árabe, japonés y el resto no está medido en la información disponible.
- Reproducibilidad: el Q4_K_M de comparación se generó sin matriz de importancia y con una versión concreta de llama.cpp (`cd959bae`), lo que limita la comparación directa con otras configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
