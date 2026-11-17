# Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-1.7B-Tenstorrent-Tensix-BFP4 es una versión cuantizada del modelo Qwen3-1.7B de Alibaba Qwen, publicada por Xylolabs y específicamente empaquetada para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa de Qwen3 con 2.031.739.904 parámetros y aplica cuantización de bloque en coma flotante (block floating point, BFP4) sobre las proyecciones de atención y MLP, manteniendo en bf16 la cabeza LM, los embeddings y las normas.

La relevancia de esta ficha radica en que no es una cuantización genérica para GPU, sino un formato dirigido al hardware NPU de Tenstorrent mediante las librerías tt-metal y ttnn. El autor reporta que el modelo empaquetado ocupa 1,415 GB frente a los 3,44 GB en bf16, con 6,58 bits por peso de media, y que su degradación respecto al modelo original es comparable a la de una cuantización Q4_K_M de llama.cpp en términos de divergencia KL.

El modelo está pensado para inferencia de generación de texto conversacional en inglés y coreano, con licencia Apache 2.0 y compatibilidad declarada con text-generation-inference y endpoints compatibles. Su interés principal es para equipos que despliegan sobre silicio Tenstorrent y necesitan un modelo pequeño con contexto amplio y buen equilibrio entre tamaño y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 28 capas |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso) en proyecciones de atención y MLP; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla BFP4); empaquetado nativo para Tensix vía TT-NN |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer denso de 28 capas con atención completa y mecanismos de normalización q_norm y k_norm, tal como se deduce de la descripción de los tensores cuantizados. La variante publicada por Xylolabs no reentrena el modelo: aplica GPTQ con búsqueda de exponente por bloque sobre las proyecciones q, k, v, o, gate, up y down de las 28 capas, produciendo un formato bfloat4_b de 4,5 bits por peso. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica principal es el empaquetado para TT-NN: las matrices cuantizadas se almacenan en el Hub como valores bf16 situados sobre la rejilla del formato BFP4, de modo que el empaquetado en el dispositivo no altera ningún valor. El autor incluye las herramientas `tools/pack_tensix.py` y `tools/verify_grid.py` del repositorio tensix-bfp-gptq v0.1.0, que verifican la integridad de la rejilla y el round-trip a DRAM del dispositivo. No se documentan fases de RLHF o DPO específicas para esta variante; se heredan las del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3 y soporte explícito de modo thinking (`enable_thinking`).
- Razonamiento multi-paso y respuestas encadenadas, heredado del modelo base Qwen3.
- Generación de código y matemáticas a nivel de un modelo de 1,7B parámetros (sin datos de benchmark específicos en la información disponible).
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- Inferencia sobre aceleradores Tenstorrent Tensix mediante tt-metal y ttnn.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, visión ni audio en la información proporcionada.

## Casos de uso

- Despliegue en clústeres con NPU Tenstorrent: el formato BFP4 empaquetado permite ejecutar Qwen3-1.7B en Wormhole o Blackhole con 1,415 GB de pesos, liberando DRAM del dispositivo para caché KV y lotes mayores.
- Asistentes conversacionales en inglés y coreano: la plantilla de chat y el modo thinking permiten construir diálogos multi-turno con razonamiento explícito cuando se activa `enable_thinking=True`.
- Prototipado de pipelines de inferencia en hardware no GPU: útil para equipos que evalúan Tenstorrent como alternativa a CUDA y necesitan un modelo pequeño de referencia con licencia permisiva.
- Generación de texto en entornos con restricciones de memoria: los 1,415 GB empaquetados frente a 3,44 GB en bf16 facilitan el despliegue en dispositivos con DRAM limitada.
- Investigación en cuantización de bloque: el repositorio incluye scripts de verificación de rejilla y empaquetado que sirven como referencia para estudiar BFP4 con GPTQ y búsqueda de exponente.
- Servicios de inferencia compatibles con TGI: al declararse compatible con text-generation-inference, puede integrarse en backends existentes que ya soporten el formato de endpoints.
- Evaluación comparativa de fidelidad de cuantización: los datos de divergencia KL frente a bf16 y Q4_K_M permiten usar el modelo como caso de estudio en pipelines de validación de cuantizaciones.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones en host de los pesos, no mediciones en dispositivo; el autor no reporta velocidad.

| Pesos | Bits por peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| bf16 (original) | 16,00 | 3,44 | 0 | 100 | 34/40 | - |
| BFP8 (Xylolabs) | 9,86 | 2,120 | 0,0016 | 98,28 | 29/33 | 0 |
| BFP4 (este modelo) | 6,58 | 1,415 | 0,1022 | 86,27 | 28/33 | 1 |
| Q4_K_M (llama.cpp) | 5,03 | 1,282 | 0,1048 | 85,70 | 29/33 | 0 |

La prueba de respuestas usa 33 prompts fijos con respuesta conocida más 7 con thinking activado (40 en total). La comprobación de precisión se supera cuando la configuración pierde como máximo un ítem más que Q4_K_M del mismo modelo; BFP4 pasa con 0,97 veces la KL de Q4_K_M y una pérdida de 1 frente a 0.

## Requisitos de hardware

- VRAM/DRAM estimada: 1,415 GB de pesos empaquetados en BFP4 para Tensix; en el Hub los ficheros ocupan 4,1 GB porque almacenan los valores cuantizados como bf16.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (Tensix NPU), con tt-metal y ttnn 0.81.1 según las pruebas del autor.
- GPU consumer: no se documenta soporte nativo en GPU; la carga vía transformers con `dtype="bfloat16"` requiere memoria suficiente para los tensores en bf16 (aproximadamente 4 GB de pesos más overhead), por lo que cabría en GPUs con 8 GB o más, aunque el formato BFP4 no se aprovecha sin TT-NN.
- Opciones de despliegue: TT-NN con `pack_tensix.py` y `verify_grid.py`; transformers para carga en host; text-generation-inference y endpoints compatibles según los tags.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad y que todas las cifras son evaluaciones en host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP4 | 2,03B | no disponible | BFP4 (6,58 bits/peso) | Apache 2.0 | Hugging Face |
| Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP8 | 2,03B | no disponible | BFP8 (9,86 bits/peso) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (bf16) | 2,03B | no disponible | bf16 (16 bits/peso) | Apache 2.0 | Hugging Face |
| Qwen3-1.7B Q4_K_M (llama.cpp) | 2,03B | no disponible | Q4_K_M (5,03 bits/peso) | Apache 2.0 | Comunidad llama.cpp |

La comparativa se limita a variantes del mismo modelo base porque no se han proporcionado datos de benchmarks frente a otros modelos de tamaño similar. En fidelidad, BFP4 queda ligeramente por debajo de BFP8 y prácticamente empatado con Q4_K_M en KL media, con una respuesta correcta menos en el conjunto de prueba.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia KL media de 0,1022 frente a bf16 y una caída de top-1 al 86,27 %, con una respuesta perdida en el conjunto de 40 prompts; no es adecuada para tareas que exijan fidelidad cercana al modelo original.
- El modelo solo declara soporte de inglés y coreano; el rendimiento en castellano no está documentado y probablemente sea inferior.
- No se dispone de datos sobre longitud de contexto, sesgos, tasas de alucinación ni comportamiento en dominios especializados en la información proporcionada.
- El formato está diseñado para Tenstorrent Tensix; fuera de ese hardware no se aprovecha el empaquetado BFP4 y se pierde la ventaja de tamaño.
- No se documenta soporte de tool calling ni de agentes; su uso en pipelines de function calling requeriría validación adicional.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no ofrece garantías sobre el rendimiento en producción ni sobre la estabilidad del ecosistema tt-metal/ttnn en versiones futuras.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante BFP8: https://huggingface.co/Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP8
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia Qwen3: https://arxiv.org/abs/2505.09388
