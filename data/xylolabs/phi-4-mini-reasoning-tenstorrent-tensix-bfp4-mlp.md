# Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo microsoft/Phi-4-mini-reasoning, publicada por Xylolabs, específicamente empaquetada para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila de software TT-NN / tt-metal. El modelo base es un transformer de 4.450.618.368 parámetros (aproximadamente 3.800 millones en el tronco más el LM head atado al embedding) orientado a razonamiento, y esta exportación conserva su comportamiento conversacional y de generación de texto en inglés.

La aportación técnica de esta ficha no es el modelo en sí, sino el esquema de cuantización: las 32 capas de atención se almacenan en `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) y las 32 capas MLP en `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso), resultando en 7,18 bits por peso de media y un peso empaquetado de 3,44 GB. Las matrices BFP4 se obtuvieron con GPTQ y búsqueda de exponente por bloque, calibradas sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; las BFP8 con redondeo al más cercano.

Es relevante ahora porque permite desplegar un modelo de razonamiento de 4,5 mil millones de parámetros en hardware Tenstorrent con un consumo de memoria de dispositivo de aproximadamente 3,44 GB solo para pesos, abriendo la puerta a inferencia local en NPUs Tensix sin depender de GPUs NVIDIA. La licencia MIT del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Phi-4-mini, 32 capas) |
| Parámetros totales | 4.450.618.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q,k,v,o; BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate,up,down; bf16 en LM head, embedding, normas y resto de tensores; media de 7,18 bits/peso |
| Idiomas soportados | inglés (según model card); calibración de cuantización incluyó texto en coreano |
| Licencia | MIT (modelo base y exportación); scripts `pack_tensix.py` y `verify_grid.py` bajo Apache-2.0 |
| Formato de pesos | safetensors (shards), con metadatos `quant4.json` y `model.safetensors.index.json`; repo de 8,9 GB |
| Memoria de dispositivo requerida | ~3,44 GB solo para pesos del modelo de lenguaje, más KV cache y buffers |
| Hardware objetivo | Tenstorrent Tensix (Wormhole, Blackhole) vía TT-NN / tt-metal |
| Librería | transformers (carga estándar en bf16), ttnn para despliegue en Tensix |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Phi-4-mini con 32 capas, con proyecciones de atención q, k, v y o, y un bloque MLP con proyecciones gate, up y down. El LM head está atado al embedding. Esta exportación no reentrena el modelo: aplica cuantización post-entrenamiento sobre las capas lineales. Las matrices de atención se convierten a BFP8 con redondeo al más cercano, mientras que las matrices MLP se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens combinados de WikiText-2 y Wikipedia en coreano.

La innovación técnica reside en el uso del formato block floating point de Tenstorrent: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores. Las 224 matrices cuantizadas pasaron la comprobación de rejilla, y la comprobación de empaquetado TT-NN sobre ttsim cubrió las capas 0 y 1 con coincidencia exacta de valores. No se ejecutaron tt-transformers ni tt-forge con este checkpoint, según indica la model card. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si hubo RLHF/DPO en esta información.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat (`apply_chat_template`).
- Razonamiento: el modelo base es la variante "reasoning" de Phi-4-mini, orientada a tareas de razonamiento multi-paso.
- Generación de código y matemáticas: capacidades heredadas del modelo base (no detalladas en la información proporcionada).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; la calibración de cuantización incluyó coreano, pero no se declara soporte de ese idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Despliegue en NPU Tensix con empaquetado nativo de pesos BFP4/BFP8.

## Casos de uso

- Inferencia de razonamiento en NPUs Tenstorrent: desplegar el modelo en aceleradores Wormhole o Blackhole usando TT-NN, aprovechando los 3,44 GB de pesos empaquetados para liberar memoria de dispositivo para KV cache y otros modelos.
- Asistentes conversacionales en inglés sobre hardware no-NVIDIA: usar la plantilla de chat y `generate` estándar de transformers para construir un chatbot de razonamiento con un footprint de memoria reducido frente al BF16 (7,67 GB).
- Prototipado de pipelines de cuantización BFP: emplear `quant4.json` y los scripts `pack_tensix.py` / `verify_grid.py` como referencia para cuantizar otros modelos Phi con el mismo esquema GPTQ + BFP4/BFP8.
- Validación de empaquetado TT-NN: usar la comprobación de rejilla y el round-trip por DRAM de dispositivo para verificar que las matrices cuantizadas se empaquetan sin pérdida de valores antes de desplegar en producción.
- Evaluación comparativa de cuantizaciones: comparar la fidelidad a BF16 (KL media de 1,162884, top-1 del 57,82 %) frente a Q4_K_M de llama.cpp (KL 1,147011, top-1 56,09 %) para decidir el formato según el presupuesto de memoria.
- Investigación en eficiencia de memoria en edge/NPU: estudiar el compromiso entre 7,18 bits/peso y la calidad de razonamiento en un modelo de 4,5 mil millones de parámetros.
- Integración en entornos con transformers: cargar el checkpoint en bf16 con `device_map="auto"` para pruebas de calidad antes de portarlo a Tensix.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad a BF16, no la calidad de tarea. La evaluación cubre 16.192 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, comparando cada fila contra la misma pasada BF16 en las mismas posiciones. Las respuestas corresponden a 33 prompts cortos con comprobación automática.

| Modelo | Bits/peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/Phi-4-mini-reasoning) | 16 | 7,67 | 0 | 100 | 16 de 33 | - |
| Este modelo (BFP4 MLP / BFP8 atención) | 7,18 | 3,444 | 1,162884 | 57,82 | 15 de 33 | 2 |
| Q4_K_M (llama.cpp) | 5,18 | 2,486 | 1,147011 | 56,09 | 19 de 33 | 1 |

El criterio de aceptación del autor era una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida más. El resultado es 1,01 veces la KL de Q4_K_M, con 2 respuestas perdidas frente a 1. El autor advierte que ambas KL medias son altas y que estos números miden cercanía a BF16, no calidad de tarea. No se reporta velocidad ni throughput.

## Requisitos de hardware

- VRAM/memoria de dispositivo: ~3,44 GB solo para pesos del modelo de lenguaje, más espacio para KV cache y buffers. El repo completo ocupa 8,9 GB en disco.
- GPU recomendadas: no aplica como objetivo principal; el modelo está diseñado para NPUs Tenstorrent Tensix (Wormhole, Blackhole). Para carga en transformers en bf16 se requiere memoria suficiente para 7,67 GB de pesos más overhead.
- ¿Cabe en GPU consumer? En bf16, sí en GPUs con 12-16 GB o más (por ejemplo, RTX 4090 de 24 GB); el checkpoint cuantizado está pensado para Tensix, no para GPUs.
- Opciones de despliegue: TT-NN / tt-metal sobre Tensix; transformers para carga estándar en bf16; llama.cpp no es el destino de este checkpoint (aunque se usó para generar la referencia Q4_K_M).
- Latencia y throughput: no disponibles en la información proporcionada; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 4,45 B | no disponible | BFP4 MLP / BFP8 atención, 7,18 bits/peso | MIT | Tenstorrent Tensix |
| microsoft/Phi-4-mini-reasoning (BF16) | 4,45 B | no disponible | bf16, 16 bits/peso | MIT | GPU/CPU |
| Q4_K_M de llama.cpp (mismo checkpoint) | 4,45 B | no disponible | Q4_K_M, 5,18 bits/peso | MIT | CPU/GPU (llama.cpp) |

La comparativa se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos alternativos de otros autores. En fidelidad a BF16, este modelo queda ligeramente por debajo de Q4_K_M (KL 1,16 frente a 1,15) pero con mayor tamaño (3,44 GB frente a 2,49 GB), un compromiso derivado del formato BFP4/BFP8 de Tensix.

## Limitaciones y advertencias

- La KL media a BF16 es alta (1,162884) según el propio autor; la evaluación mide cercanía a BF16, no calidad de tarea.
- Se pierden 2 de 33 respuestas correctas frente a BF16, y una más que Q4_K_M; el autor advierte de que las casi-empates no se contabilizan.
- La cuantización se calibró parcialmente con Wikipedia en coreano, pero el modelo declara únicamente inglés; el rendimiento en otros idiomas no está validado.
- El checkpoint está empaquetado para TT-NN/Tensix; tt-transformers y tt-forge no se ejecutaron con él, por lo que el soporte en esas pilas no está verificado.
- La comprobación de empaquetado TT-NN en dispositivo solo cubrió las capas 0 y 1 (sobre ttsim); el resto de capas solo pasó la comprobación de rejilla.
- No se reportan latencia ni throughput, lo que impide evaluar el rendimiento en producción.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada; aplican los del modelo base.
- Licencia MIT permite uso comercial, pero los scripts `pack_tensix.py` y `verify_grid.py` son Apache-2.0 y deben cumplir esa licencia por separado.
- El modelo se distribuye "tal cual" ("Provided as"), sin garantías indicadas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
- Revisión del modelo base referenciada: https://huggingface.co/microsoft/Phi-4-mini-reasoning/tree/0e3b1e2d02ee478a3743abe3f629e9c0cb722e0a
