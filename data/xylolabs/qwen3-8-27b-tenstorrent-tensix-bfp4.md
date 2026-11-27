# Xylolabs/Qwen3.8-27B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.8-27B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal Qwen/Qwen3.8-27B publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original del base (atención con capas Gated DeltaNet, proyecciones MLP y atención estándar, más una torre visual y un módulo MTP) pero sustituye los pesos de las proyecciones principales por formatos de coma flotante por bloques: `bfloat4_b` (BFP4) para atención, Gated DeltaNet y MLP, y `bfloat8_b` (BFP8) para el LM head. El resultado ocupa 17,596 GB empaquetado, frente a los 53,79 GB en bf16 del modelo original.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible llevar un modelo de 27.781 millones de parámetros a hardware de inferencia no-GPU (NPU Tensix) con una pérdida de calidad medida y acotada: la divergencia KL media frente a bf16 es de 0,02894, frente a 0,02081 de un Q4_K_M de llama.cpp (1,39 veces peor), y el top-1 de coincidencia es del 92,62 % frente al 92,94 % del Q4_K_M. Por otro, el pipeline declarado es `image-text-to-text`, lo que indica que la torre visual se mantiene en bf16 y que el modelo sigue siendo multimodal tras la cuantización.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con `transformers`. No obstante, el rendimiento óptimo se obtiene únicamente con el stack de Tenstorrent (tt-metal v0.81.1, ttnn, kernels y runner propios de Xylolabs), por lo que su uso en GPU convencional es posible pero no aprovecha el formato BFP empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención estándar y Gated DeltaNet, torre visual y módulo MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atención, Gated DeltaNet y MLP; BFP8 (`bfloat8_b`) en LM head; bf16 en embeddings, normas, `mtp` y `visual` |
| Idiomas soportados | no disponible (la evaluación incluye textos en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB; 17,596 GB empaquetados para Tensix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención clásica (16 capas con proyecciones q, k, v, o) con capas Gated DeltaNet (48 capas con proyecciones q, k, v, z, a, b y output), más 64 capas MLP con proyecciones gate, up y down. Esta mezcla de atención y mecanismos de estado recurrente es la que permite reducir el coste de atención en contextos largos. El modelo incluye además una torre visual (`visual`) y un módulo de predicción multi-token (`mtp`), ambos preservados en bf16 en esta cuantización.

El proceso de cuantización lo realiza Xylolabs con su herramienta `tensix-bfp-gptq` (commit 5c52065, release v0.1.0). Las proyecciones en `bfloat4_b` se cuantizan con GPTQ más una búsqueda de exponente por bloque; las de `bfloat8_b` con redondeo al más cercano. El empaquetado se verifica matriz a matriz con `pack_tensix.py` y `verify_grid.py`, que comprueban la ida y vuelta a través de `ttnn.as_tensor` y, opcionalmente, por la DRAM del dispositivo. No se proporcionan datos sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con torre visual en bf16.
- Razonamiento y generación de código, heredados del modelo base Qwen3.8-27B.
- Predicción multi-token mediante el módulo `mtp` (preservado en bf16), útil para decodificación especulativa.
- Capacidades multilingües: la evaluación incluye textos en inglés y coreano, lo que sugiere cobertura al menos de ambos idiomas; el resto no está documentado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en NPU Tensix (Wormhole, Blackhole): el caso principal. El modelo está empaquetado para `ttnn.bfloat4_b` y `ttnn.bfloat8_b`, de modo que se puede desplegar en aceleradores Tenstorrent con el demo `models/demos/qwen38_27b_qb2/demo/text_demo.py` de tt-metal v0.81.1, reduciendo el espacio de pesos de 53,79 GB a 17,596 GB.
- Despliegue multimodal en entornos con restricciones de memoria: al mantener la torre visual en bf16 y cuantizar solo las proyecciones, permite tareas de image-text-to-text en dispositivos con DRAM limitada, algo inviable con el modelo en bf16.
- Evaluación de calidad de cuantización: sirve como referencia para comparar BFP4/BFP8 frente a Q4_K_M de llama.cpp usando la métrica de KL media y top-1 publicada, útil en equipos que investigan formatos de coma flotante por bloques.
- Generación de texto en inglés y coreano: la evaluación cubre ambos idiomas, por lo que es adecuado para aplicaciones bilingües en esos mercados, siempre que se valide el resto de idiomas.
- Prototipado de asistentes conversacionales: la plantilla de chat y el pipeline de `transformers` permiten integrarlo en prototipos de atención al cliente o asistentes internos, con la salvedad de que el contexto máximo no está documentado.
- Investigación en decodificación especulativa: el módulo `mtp` en bf16 permite experimentar con predicción multi-token sin degradación por cuantización en ese componente.
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar la integridad de los pesos antes de desplegar en producción.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen3.8-27B) | 53,79 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 17,596 | 0,02894 | 92,62 |
| Q4_K_M (llama.cpp) | 16,811 | 0,02081 | 92,94 |

La evaluación cubre 16.240 posiciones de cuatro textos (cuatro secuencias de hasta 1.024 tokens cada una): el inicio de un artículo de Wikipedia en inglés y otro en coreano, y la propia respuesta del modelo a "Write an encyclopedia article." en su plantilla de chat para cada idioma, puntuando solo los tokens de respuesta. La regla de aceptación es una KL media máxima de 1,5 veces la de Q4_K_M (0,03121); este modelo cumple con 0,02894. En la comprobación de respuestas (33 + 7 elementos) con el head top-16 en `bfloat4_b` y rescoring en bf16 se obtienen 31/33 y 7/7, sin regresiones. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 17,596 GB empaquetado para Tensix; el repo completo en safetensors ocupa 55,6 GB.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole) con tt-metal v0.81.1.
- GPU convencionales: el modelo se puede cargar con `transformers` en `dtype="bfloat16"` y `device_map="auto"`, pero en ese caso no se aprovecha el formato BFP y se requiere memoria equivalente al modelo en bf16 (aproximadamente 53,79 GB), lo que exige A100 80 GB, H100 80 GB o varias GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; solo sería viable con cuantizaciones adicionales no incluidas en este repo.
- Opciones de despliegue: tt-metal/ttnn con los kernels y runner de Xylolabs (`tensix-kernels` v0.1.0, `tensix-runner` v0.1.0); `transformers` para carga estándar; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL media a BF16 | Licencia |
|---|---|---:|---:|---:|---|
| Este modelo (BFP4/BFP8) | 27,78 B | no disponible | 17,596 GB | 0,02894 | Apache 2.0 |
| Qwen/Qwen3.8-27B (bf16) | 27,78 B | no disponible | 53,79 GB | 0 | Apache 2.0 |
| Q4_K_M de llama.cpp (mismo checkpoint) | 27,78 B | no disponible | 16,811 GB | 0,02081 | Apache 2.0 |

La comparativa directa disponible se limita al modelo base y a su cuantización Q4_K_M, ambos derivados del mismo checkpoint. Frente a Q4_K_M, este modelo ocupa un 4,7 % más de espacio y presenta una KL 1,39 veces mayor, con un top-1 ligeramente inferior (92,62 % frente a 92,94 %). No se dispone de comparación con otros modelos de la misma categoría (por ejemplo, otras cuantizaciones de Qwen3.8-27B para GPU) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: KL media de 0,02894 frente a 0 de bf16, con top-1 del 92,62 %; aceptable según el criterio del autor, pero no idéntica al modelo original.
- El formato BFP4/BFP8 está pensado para Tensix; en GPU se pierde la ventaja de tamaño y se carga en bf16, con el coste de memoria asociado.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-27B, que conviene revisar por separado.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma más allá de la cobertura inglés/coreano en la evaluación.
- La longitud de contexto no está indicada, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- El soporte de tool calling, agentes y modo thinking no está confirmado en la información disponible; no debe asumirse en producción.
- El repo incluye 55,6 GB de safetensors aunque el empaquetado Tensix ocupe 17,596 GB; hay que planificar el almacenamiento en consecuencia.
- Dependencia de versiones concretas del stack (tt-metal v0.81.1, kernels y runner v0.1.0); cambios de versión pueden romper la compatibilidad del empaquetado.
- El número de descargas (199) y la ausencia de likes sugieren una adopción todavía limitada; conviene validar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
