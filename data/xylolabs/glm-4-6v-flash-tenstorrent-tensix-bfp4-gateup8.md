# Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4-GateUp8

## Resumen

GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4-GateUp8 es una exportación cuantizada del modelo multimodal zai-org/GLM-4.6V-Flash, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer multimodal de tipo image-text-to-text con 10.292.777.472 parámetros totales, capaz de procesar imágenes y texto de forma conjunta. Esta versión mantiene intacto el codificador visual en bf16 y cuantiza únicamente las capas lineales del modelo de lenguaje.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica orientada a GPU, sino de un empaquetado a medida para el stack de software de Tenstorrent (tt-metal, ttnn, tt-forge). Emplea formatos de coma flotante por bloques propietarios de TT-NN —`bfloat4_b` y `bfloat8_b`— y una combinación selectiva de precisión por capa: atención y proyección down del MLP en BFP4, y gate/up del MLP en BFP8. El resultado es un checkpoint de 9,317 GB empaquetado con una media de 7,93 bits por peso, frente a los 18,80 GB del modelo en bf16.

El modelo conserva la licencia MIT del modelo base y está pensado para despliegues en hardware de Tenstorrent, un nicho emergente de aceleradores de inferencia de bajo consumo. Su publicación incluye herramientas de verificación (`pack_tensix.py`, `verify_grid.py`) y documentación detallada del layout de empaquetado, lo que lo convierte en una referencia útil para quienes trabajan con cuantización BFP sobre Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en GLM-4.6V-Flash; capas lineales del LM cuantizadas a BFP4/BFP8 para Tensix |
| Parametros totales | 10.292.777.472 (10,29 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`, 4,5 bits/peso) en atención q/k/v/o y MLP down; BFP8 (`bfloat8_b`, 8,5 bits/peso) en MLP gate/up; bf16 en LM head, embeddings, norms y torre visual. Media de 7,93 bits/peso |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (almacena valores bf16; empaquetado lógico BFP4/BFP8 para TT-NN), transformers |

## Arquitectura y entrenamiento

El modelo base GLM-4.6V-Flash es un transformer multimodal que combina un codificador visual con un modelo de lenguaje de 40 capas. Esta exportación no reentrena el modelo: parte del checkpoint oficial `zai-org/GLM-4.6V-Flash` (revisión 411bb4d77144a3f03accbf4b780f5acb8b7cde4e) y aplica cuantización post-entrenamiento sobre las 240 matrices lineales del LM. La torre visual permanece en bf16 sin modificar, y solo se cuantizó y evaluó el modelo de lenguaje.

La innovación técnica principal es el uso de coma flotante por bloques (block floating point) nativo de TT-NN. Las matrices BFP4 se cuantizaron con GPTQ y una búsqueda de exponente por bloque (offsets -1 y 0, damping 0,1), mientras que las BFP8 se cuantizaron con redondeo al más cercano. Los ficheros almacenan los valores en bf16, de modo que las 240 matrices empaquetadas reconstruyen bit a bit tras aplicar la permutación de filas documentada. Las 80 matrices `q_proj` y `k_proj` conservan el orden de filas original de Hugging Face y requieren una permutación por cabeza de 128 filas para situarse en la rejilla BFP4; las otras 160 matrices pasan la verificación tal cual se almacenan. No se especifican en la información disponible datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline image-text-to-text).
- Comprensión de imágenes combinada con texto: el codificador visual en bf16 permite entrada image-text-to-text.
- Razonamiento y respuesta a preguntas generales (el modelo base GLM-4.6V-Flash es un modelo de propósito general).
- Capacidades multilingües limitadas a chino e inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en hardware Tenstorrent: el caso de uso principal es desplegar un modelo image-text-to-text de 10,29 mil millones de parámetros en NPU Wormhole o Blackhole, aprovechando el empaquetado BFP4/BFP8 para reducir el peso en memoria a 9,32 GB y encajar en aceleradores de bajo consumo.
- Asistente de descripción y análisis de imágenes en inglés o chino: el modelo puede recibir una imagen junto con una pregunta y generar una respuesta textual, útil para accesibilidad, catalogación de imágenes o moderación asistida.
- Procesamiento por lotes en el borde (edge): para despliegues donde el consumo energético y el espacio son críticos, la cuantización a 7,93 bits/peso permite ejecutar un modelo multimodal en un único dispositivo Tensix.
- Evaluación de pipelines de cuantización BFP: investigadores que trabajen con tt-metal o tt-forge pueden usar este checkpoint como referencia para validar sus propias herramientas de empaquetado y comparar la degradación de KL frente a bf16.
- Prototipado de aplicaciones de visión-lenguaje en entornos de simulación: el modelo se verificó con ttnn 0.81.1 sobre el simulador Blackhole (ttsim), lo que permite desarrollar y depurar sin hardware físico.
- Base para fine-tuning o destilación sobre Tensix: al conservar la licencia MIT y el formato transformers, sirve como punto de partida para adaptaciones posteriores, aunque requiere reempaquetado tras cualquier modificación de pesos.

## Benchmarks y rendimiento

La model card incluye una evaluación comparativa frente al modelo base en bf16, medida sobre un conjunto de 40 preguntas. La tabla original está truncada en la información disponible, por lo que algunos valores no se pueden reproducir con certeza.

| Modelo | Bits/peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas |
|---|---:|---:|---:|---:|---:|
| BF16 (zai-org/GLM-4.6V-Flash) | 16 | 18,80 | 0 | 100 | 32 de 40 |
| Este modelo (BFP4 GateUp8) | 7,93 | 9,317 | 0,023789 | 92,55 | 33 de 40 (dato truncado en la fuente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: aproximadamente 9,32 GB solo para los pesos del modelo de lenguaje, más espacio adicional para la caché KV y buffers.
- GPU recomendadas: no aplica de forma nativa; el checkpoint está diseñado para NPU Tensix de Tenstorrent (Wormhole y Blackhole), no para GPU convencionales.
- Cabe en consumer GPU: no disponible como objetivo de diseño; el formato está pensado para Tensix. La carga vía `transformers` con `device_map="auto"` en bf16 requeriría del orden de 18,80 GB, equivalente al modelo base sin cuantizar.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 verificado sobre ttsim), tt-metal, tt-forge (no ejecutado con este checkpoint según la model card), y carga estándar con `transformers` (`AutoModelForImageTextToText`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4-GateUp8 | 10,29 mil millones | no disponible | BFP4/BFP8 (7,93 bits/peso) | MIT | Tensix (Wormhole, Blackhole) |
| zai-org/GLM-4.6V-Flash (bf16) | 10,29 mil millones | no disponible | bf16 (16 bits/peso) | MIT | GPU convencional |
| Otras alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual permanece en bf16 y no se ha validado su comportamiento bajo el empaquetado BFP.
- Las 80 matrices `q_proj` y `k_proj` no están en la rejilla BFP4 tal como se almacenan: requieren una permutación de filas por cabeza de 128 filas. Una implementación debe colocar sus pares rotatorios de forma coherente con ese layout, lo que introduce riesgo de error si no se sigue la documentación al pie de la letra.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; la verificación se hizo con ttnn 0.81.1 sobre el simulador Blackhole (ttsim), no sobre hardware físico.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la evaluación (solo se miden KL y aciertos sobre 40 preguntas).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo cuantizado en producción.
- La evaluación es muy reducida (40 preguntas) y la tabla de resultados está truncada en la información disponible; no debe tomarse como una validación robusta del rendimiento.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4-GateUp8
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Revisión del modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash/tree/411bb4d77144a3f03accbf4b780f5acb8b7cde4e
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2507.01006): https://arxiv.org/abs/2507.01006
- Licencia: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4-GateUp8/blob/main/LICENSE
