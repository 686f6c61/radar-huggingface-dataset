# Xylolabs/Muse-Glimmer-30B-Tenstorrent-Tensix-BFP8

## Resumen

Muse-Glimmer-30B-Tenstorrent-Tensix-BFP8 es una cuantización del modelo multimodal Muse-Glimmer-30B (desarrollado por meta-models) realizada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un image-text-to-text de aproximadamente 29.780 millones de parámetros, y esta variante cuantiza únicamente las capas lineales del decodificador de lenguaje a formato de coma flotante por bloques BFP8 (`ttnn.bfloat8_b`), manteniendo en bf16 el resto de tensores, incluidos el tower de visión, el adaptador de visión, los embeddings, las normas y la cabeza LM.

La relevancia de este checkpoint es de nicho pero clara: permite desplegar un modelo de 30B en hardware Tensix con un consumo de memoria de dispositivo de unos 32,12 GB solo para los pesos del modelo de lenguaje, frente a los aproximadamente 59,6 GB del repositorio en bf16 completo. La cuantización se ha realizado con GPTQ sobre la rejilla nativa de BFP8, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano, de modo que TT-NN empaca las matrices sin alterar sus valores.

El modelo se distribuye con licencia Apache 2.0, se carga mediante `transformers` 5.x (la arquitectura `muse_glimmer` está integrada en la librería, sin código remoto) y está pensado para flujos de inferencia en NPU más que para GPU convencional. Existe también una variante BFP4 para dispositivos con menos memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `muse_glimmer` (transformer multimodal image-text-to-text; decodificador de lenguaje de 52 capas más vision tower y vision adapter) |
| Parámetros totales | 29.776.626.688 (≈29,78B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas lineales del LM: q, k, v, o, output gate y MLP gate/up/down de las 52 capas; 8,5 bits por peso en esas matrices, 9,22 bits por peso de media; resto en bf16. Existe variante BFP4 del mismo autor |
| Idiomas soportados | no disponible (la calibración usó WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` que describe el formato por proyección y `model.safetensors.index.json`) |
| Memoria de dispositivo requerida | ≈32,12 GB para pesos del LM, más KV cache y buffers |
| Tamaño del repositorio | 59,6 GB |
| Librería | transformers (5.x; `AutoModelForImageTextToText` / `MuseGlimmerForConditionalGeneration`) |
| Pipeline | image-text-to-text |
| Hardware objetivo | Tenstorrent Tensix (Wormhole, Blackhole); verificado con ttnn 0.81.1 en ttsim (simulador Blackhole) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer multimodal con un decodificador de lenguaje de 52 capas y una torre de visión con adaptador, empaquetado bajo la arquitectura `muse_glimmer` integrada en transformers 5.x. La ficha del checkpoint cuantizado no detalla la composición del dataset de preentrenamiento del modelo base, el número de tokens vistos ni si hubo fases de RLHF o DPO; esa información corresponde a la model card del modelo original y no está disponible en la información proporcionada.

La innovación técnica de esta variante es el proceso de cuantización: GPTQ aplicado directamente sobre la rejilla de coma flotante por bloques BFP8 de TT-NN, conservando el exponente compartido de cada bloque tal como lo fija el empacador de Tenstorrent. Las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP8, de forma que TT-NN las empaqueta sin modificar sus valores. El autor incluye herramientas de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban, matriz a matriz, que el empaquetado round-trip es exacto, y se validó contra el demo oficial `muse_glimmer_30b` de tt-metal v0.81.1: con los empacadores TP 4 del demo, todas las proyecciones de las capas 0 y 3 se empaquetaron de forma exacta. La cabeza LM se mantiene en bf16 en este checkpoint, mientras que el demo de tt-metal la empaca en bfloat8_b, por lo que ahí no hay coincidencia exacta.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con torre de visión y adaptador conservados en bf16.
- Razonamiento y respuesta a preguntas en formato instructivo, según el comportamiento del modelo base.
- Ejecución en NPU Tensix con pesos preempaquetados para el formato nativo de TT-NN.
- Capacidades multilingües: no disponibles en la información proporcionada (la calibración incluyó coreano, pero no se documenta la cobertura de idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para cargarse directamente en TT-NN sobre Wormhole o Blackhole, lo que permite servir un modelo multimodal de 30B en hardware Tensix sin reconvertir pesos en producción.
- Inferencia multimodal en el borde de la nube: con unos 32,12 GB de pesos del LM en dispositivo, encaja en configuraciones Blackhole con memoria suficiente, útil para servicios de descripción de imágenes o VQA donde el coste por token en NPU es la variable crítica.
- Evaluación comparativa de cuantización: al incluir `quant4.json` y scripts de verificación exacta, sirve para medir la degradación real de BFP8 frente a bf16 en tareas de lenguaje, aislando el efecto de la cuantización del resto del stack.
- Prototipado de pipelines image-text-to-text con transformers: la carga vía `AutoModelForImageTextToText` permite validar prompts y plantillas de chat en GPU/CPU antes de portar el modelo al demo de tt-metal.
- Investigación en formatos de coma flotante por bloques: el repositorio documenta bits por peso (8,5 en matrices cuantizadas, 9,22 de media) y metodología GPTQ sobre rejilla BFP8, lo que lo hace útil como referencia reproducible para estudiar BFP8 y BFP4.
- Servicio de chat con contexto conversacional: el ejemplo de quickstart con plantilla de chat y generación de hasta 64 tokens nuevos sirve como base para asistentes conversacionales desplegados en infraestructura Tenstorrent.
- Validación de portes a tt-metal: comparar el empaquetado de este checkpoint con los empacadores del demo oficial permite detectar discrepancias (por ejemplo, en la cabeza LM) antes de un despliegue a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de compresión y verificación de empaquetado (8,5 bits por peso en matrices cuantizadas, 9,22 bits por peso de media, 32,12 GB empaquetados, igualdad exacta tras el round-trip en las capas 0 y 3 con los empacadores TP 4 del demo), no resultados de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 32,12 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. Para menos memoria, el autor remite a la variante BFP4.
- GPU: no es el objetivo del checkpoint; el formato BFP8 está pensado para TT-NN. La carga en transformers con `device_map="auto"` en bf16 requeriría del orden del tamaño completo del repositorio (59,6 GB), por lo que no cabe en GPUs de consumo de 24 GB sin cuantización adicional.
- NPU recomendadas: Tenstorrent Wormhole y Blackhole. El demo oficial de tt-metal ejecuta el decodificador de texto con paralelismo tensorial en cuatro chips Blackhole (QuietBox 2, TP 4) o en un Blackhole Galaxy (TP 4 u 8).
- ¿Cabe en GPU de consumo? No en su formato nativo bf16/BFP8 para TT-NN; se requeriría una cuantización adicional (por ejemplo GGUF) no incluida en este repositorio.
- Opciones de despliegue: transformers 5.x para carga y validación; TT-NN/tt-metal v0.81.1 con el demo `models/demos/muse_glimmer_30b` para ejecución en Tensix; `pack_tensix.py` y `verify_grid.py` para verificación. tt-transformers no soporta esta arquitectura.
- Latencia y throughput: no disponibles. El autor indica que una ejecución completa del demo requiere los cuatro chips y no fue probada; las comprobaciones se hicieron sobre el simulador ttsim.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Tenstorrent-Tensix-BFP8 (este) | ≈29,78B | no disponible | BFP8 (9,22 bits/peso de media) | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Muse-Glimmer-30B-Tenstorrent-Tensix-BFP4 | ≈29,78B (mismo base) | no disponible | BFP4 | Apache 2.0 | Tensix con menos memoria |
| meta-models/Muse-Glimmer-30B (base) | ≈29,78B | no disponible | bf16 | no disponible en la información proporcionada | GPU/NPU genéricas vía transformers |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni con modelos de otras familias; la comparación se limita a parámetros, formato, licencia y hardware soportado.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y el adaptador se conservan en bf16 sin evaluación documentada en esta variante.
- El checkpoint está diseñado para TT-NN: la carga en transformers funciona, pero el rendimiento y el consumo de memoria óptimos solo se obtienen en hardware Tensix con el empaquetado nativo.
- El demo de tt-metal empaca la cabeza LM en bfloat8_b, mientras que este checkpoint la mantiene en bf16; esa discrepancia impide una coincidencia exacta en la cabeza al usar el demo.
- Una ejecución completa del demo requiere cuatro chips Blackhole y no fue probada por el autor; las verificaciones se realizaron en el simulador ttsim con ttnn 0.81.1.
- tt-transformers no soporta la arquitectura `muse_glimmer`; el despliegue en producción depende del demo de tt-metal.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura de idiomas del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base meta-models/Muse-Glimmer-30B, no disponibles en la información proporcionada.
- El config se guardó con transformers 5.15.0.dev0 y las comprobaciones se hicieron con 5.22.1 y prompts solo de texto; el comportamiento con entradas de imagen no está verificado en esta variante.
- La calibración de GPTQ se hizo con 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo de dominio en la cuantización para otros idiomas o tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Muse-Glimmer-30B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Variante BFP4: https://huggingface.co/Xylolabs/Muse-Glimmer-30B-Tenstorrent-Tensix-BFP4
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de tt-metal para Muse-Glimmer-30B (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/muse_glimmer_30b
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2610.24628): https://arxiv.org/abs/2610.24628
