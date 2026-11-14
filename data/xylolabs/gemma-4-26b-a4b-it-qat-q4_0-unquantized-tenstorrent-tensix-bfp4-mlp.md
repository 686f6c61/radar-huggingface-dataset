# Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Este repositorio contiene una exportación cuantizada del modelo multimodal `google/gemma-4-26B-A4B-it` de Google, adaptada específicamente para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs y emplea su herramienta `tensix-bfp-gptq` para convertir las capas lineales del modelo a formatos de coma flotante por bloques propios del stack TT-NN: `bfloat4_b` (BFP4) para las proyecciones MLP y `bfloat8_b` (BFP8) para las de atención. El resultado ocupa 15,83 GB en memoria de dispositivo, frente a los 50,47 GB del checkpoint BF16 original.

El modelo base es un transformer Mixture-of-Experts (MoE) de 26.544.133.710 parámetros totales, con capacidades de imagen-a-texto (pipeline `image-text-to-text`) y variante instruct. La cuantización se aplica exclusivamente al modelo de lenguaje; la torre de visión y las proyecciones de embedding permanecen en bf16 sin modificar. Con un promedio de 5,02 bits por peso, la exportación busca hacer viable el despliegue de un MoE de 26B en hardware de inferencia de bajo consumo energético sin renunciar de forma significativa a la calidad del BF16.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización orientada a hardware no-GPU (NPU Tensix); por otro, sirve de referencia práctica sobre el estado del ecosistema de pesos cuantizados para Gemma 4, incluyendo las advertencias de compatibilidad que el propio autor declara (por ejemplo, que `tt-transformers` y `tt-forge` no se han probado con este checkpoint).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal imagen-texto; cuantización por bloques BFP4/BFP8 para TT-NN |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP y expertos enrutados; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o; bf16 en router, escalas, LM head, embeddings, normas y torre de visión; media de 5,02 bits/peso |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (matrices almacenadas como valores bf16 sobre la rejilla BFP4/BFP8); índice `model.safetensors.index.json` y mapa `quant4.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE multimodal de 26B parámetros totales, con una torre de visión (`vision_tower`, `embed_vision`) acoplada a un modelo de lenguaje. El checkpoint base, `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, es una variante instruct con cuantización consciente del entrenamiento (QAT) en el origen, lo que explica que la exportación de Xylolabs parta de pesos ya preparados para baja precisión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La innovación técnica de esta exportación reside en el esquema de cuantización. Las matrices BFP4 se obtuvieron con GPTQ y una búsqueda de exponente por bloque, calibradas sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices BFP8 se generaron con redondeo al más cercano (round to nearest). En los expertos enrutados, las proyecciones `gate` y `up` comparten una única matriz Hessiana por capa, mientras que la proyección `down` de cada experto usa su propia Hessiana o, si vio pocos tokens de calibración, recurre al redondeo simple. Un detalle relevante es que las matrices cuantizadas se almacenan como valores bf16 situados exactamente sobre la rejilla BFP4/BFP8, de modo que TT-NN las empaqueta sin alterar sus valores; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) para verificar la igualdad bit a bit tras el empaquetado.

## Capacidades

- Generación de texto conversacional en modo instruct, con plantilla de chat (`apply_chat_template`) y soporte de conversaciones multi-turno.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de visión en bf16 sin cuantizar.
- Razonamiento y respuesta a preguntas: el autor reporta 33 de 33 respuestas correctas en su conjunto de evaluación.
- Capacidades multilingües parcialmente evaluadas: la calibración y la evaluación de calidad cubren inglés y coreano.
- Inferencia en aceleradores Tenstorrent Tensix mediante TT-NN (`ttnn.bfloat4_b`, `ttnn.bfloat8_b`) y empaquetado exacto de pesos.
- Compatibilidad declarada con `transformers` y con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, function calling y razonamiento agéntico multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está diseñado para cargarse en NPU Wormhole o Blackhole con TT-NN, ocupando 15,83 GB de memoria de dispositivo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. Es el escenario principal y el único validado por el autor (sobre el simulador `ttsim` de Blackhole con ttnn 0.81.1).
- Inferencia multimodal en el borde: al reducir el peso del modelo de 50,47 GB a 15,83 GB, permite servir un MoE de 26B con capacidades de visión en un único dispositivo de memoria moderada, útil en entornos con restricciones de energía o espacio.
- Servicio conversacional multilingüe inglés-coreano: la calibración y la evaluación incluyen coreano, por lo que el modelo es adecuado para asistentes en esos dos idiomas, con la advertencia de que no se han publicado métricas para otros idiomas.
- Investigación en cuantización por bloques: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir la verificación de que el empaquetado BFP4/BFP8 no altera los valores, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantización GPTQ en MoE.
- Prototipado con `transformers`: el código de inicio rápido permite cargar el modelo en bf16 con `device_map="auto"` para validar respuestas antes de portarlo a Tensix, útil en fases de evaluación funcional.
- Comparación de esquemas de cuantización: al coexistir en el ecosistema con la variante Q4_0 de llama.cpp (4,57 bits/peso, 14,439 GB), sirve para contrastar calidad y tamaño entre formatos de bloque (BFP) y formatos de escalado por grupo (Q4_0).

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP4/BFP8) | 5,02 | 15,826 | 0,06233 | 90,87 | 33 de 33 | 0 |
| Q4_0 (llama.cpp) | 4,57 | 14,439 | 0,05293 | 91,55 | 33 de 33 | 0 |

Las métricas de KL y top-1 cubren 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 15,83 GB solo para los pesos del modelo de lenguaje, más KV cache y buffers adicionales.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. La verificación se realizó con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole.
- GPU consumer: no disponible; el checkpoint está pensado para Tensix y no se documenta su ejecución en GPU. La carga con `transformers` en bf16 requiere del orden de 50 GB de memoria, lo que excede GPUs de consumo.
- Opciones de despliegue: TT-NN (`ttnn`), `transformers` (carga en bf16), `tt-transformers` y `tt-forge` (no probados con este checkpoint según el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Hardware objetivo |
|---|---|---:|---:|---:|---|---|
| Este modelo (Xylolabs, BFP4/BFP8) | 26,54B totales | no disponible | 5,02 | 15,826 GB | Apache-2.0 | Tenstorrent Tensix |
| Base BF16 (google/gemma-4-26B-A4B-it) | 26,54B totales | no disponible | 16 | 50,47 GB | Apache-2.0 | GPU/CPU |
| Q4_0 (llama.cpp) | 26,54B totales | no disponible | 4,57 | 14,439 GB | Apache-2.0 | CPU/GPU (llama.cpp) |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión se mantiene en bf16 y no se ha validado su comportamiento tras la exportación.
- `tt-transformers` y `tt-forge` no se han ejecutado con este checkpoint; el soporte en esos frameworks es, por tanto, no verificado.
- La validación en hardware real es limitada: la comprobación se hizo sobre el simulador `ttsim` de Blackhole con ttnn 0.81.1, no sobre silicio.
- La evaluación de calidad se restringe a 8.048 posiciones de inglés y coreano; no hay datos para otros idiomas ni para tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el comportamiento del modelo base, no documentado aquí.
- Sesgos conocidos: no disponibles.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse que el modelo base de Google mantiene esa misma licencia y sus condiciones de uso.
- El checkpoint depende de la rejilla numérica BFP4/BFP8 de TT-NN; cargarlo fuera de ese stack puede degradar la calidad si no se respeta el empaquetado exacto.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arxiv:2607.02770 (no se dispone de URL verificada en la información proporcionada)
