# Xylolabs/Ornith-1.5-35B-A3B-Tensix-BFP4

## Resumen

Ornith-1.5-35B-A3B-Tensix-BFP4 es una cuantización del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura original del base (etiquetada como `qwen3_5_moe` en los tags), con 35.951.822.704 parámetros totales y un esquema de mezcla de expertos (MoE) que activa aproximadamente 3.000 millones de parámetros por token, según indica el sufijo A3B del nombre. El checkpoint completo pesa 71,9 GB en el repositorio, aunque los pesos del modelo de lenguaje cuantizados ocupan 20,99 GB empaquetados.

La aportación principal de esta ficha no es el modelo en sí, sino el formato de cuantización: las capas lineales del modelo de lenguaje se han convertido a `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits) mediante GPTQ, un formato nativo de la pila tt-metal/ttnn de Tenstorrent. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que las 20.790 matrices individuales se empaquetan bit a bit sin pérdida de representación. El resultado son 4,84 bits por peso de media, frente a los 16 bits del modelo original.

Es relevante ahora porque permite ejecutar un modelo MoE de 35B en hardware de aceleración no convencional (NPU Tensix) con un tamaño de checkpoint reducido a menos de un tercio del original, manteniendo una fidelidad medida frente a BF16 (KL medio de 0,0870 y top-1 del 87,10 % sobre 8.188 posiciones). Conviene señalar que la evaluación se realizó sobre simulador (ttsim), no sobre hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con módulos de atención lineal DeltaNet, expertos enrutados y compartidos, y módulo MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | aproximadamente 3.000 millones (sufijo A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones; bf16 en router, gate de expertos compartidos, LM head, embeddings y módulos de visión y MTP; media de 4,84 bits por peso |
| Idiomas soportados | no disponible (la evaluación de fidelidad incluye texto en inglés y coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint completo, compatible con Transformers); pesos cuantizados empaquetados para tt-metal/ttnn |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que combina capas de atención lineal DeltaNet con expertos enrutados y expertos compartidos, además de un módulo MTP (multi-token prediction) y un módulo de visión, lo que habilita la pipeline `image-text-to-text`. Los tags del repositorio lo clasifican como `qwen3_5_moe`, lo que sugiere una arquitectura de la familia Qwen 3.5 MoE, aunque no se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

La innovación técnica de esta publicación es el proceso de cuantización: GPTQ con damping 0,1 y una búsqueda de exponente por bloque (offsets -1 y 0) sobre las proyecciones de atención, DeltaNet, expertos compartidos y expertos enrutados. Las proyecciones down de los expertos enrutados usan GPTQ simple con redondeo al más cercano cuando hay tokens de calibración insuficientes. El formato BFP4 se materializa como valores bf16 sobre la rejilla de 4 bits, lo que permite que TT-NN lea los pesos directamente sin transformación adicional. El script `verify_grid.py` comprueba la rejilla solo con torch, y `pack_tensix.py` verifica matriz a matriz que ningún valor cambia al empaquetar.

## Capacidades

- Generación de texto conversacional y de formato largo, con plantilla de chat propia accesible mediante `apply_chat_template`.
- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`), aunque los módulos de visión no fueron cuantizados ni evaluados en esta versión.
- Razonamiento multi-paso y predicción multi-token (módulo MTP), si bien el MTP no se evaluó en este checkpoint.
- Capacidades multilingües: la evaluación de fidelidad cubre inglés y coreano, pero no se publica una lista oficial de idiomas.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes: no confirmado en la información disponible.
- Modo thinking o razonamiento extendido: no confirmado en la información disponible.

## Casos de uso

- Despliegue en NPU Tensix: el caso principal es ejecutar el modelo en aceleradores Wormhole o Blackhole mediante tt-metal/ttnn, aprovechando el formato BFP4 nativo para reducir la huella de memoria a 20,99 GB de pesos del modelo de lenguaje.
- Investigación en cuantización de bajo bit: el checkpoint sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a Q4_K_M de llama.cpp, con métricas de KL y top-1 publicadas.
- Servicio de chat con contexto multimodal: al conservar los módulos de visión en bf16, puede emplearse en aplicaciones image-text-to-text en hardware Tensix, siempre que se valide previamente la ruta de visión.
- Evaluación comparativa de hardware: útil para medir fidelidad numérica y comportamiento de un MoE de 35B en una pila de software distinta de CUDA, con verificación bit a bit de las matrices empaquetadas.
- Prototipado de pipelines de inferencia en Transformers: el quickstart con `AutoModelForImageTextToText` permite cargar el checkpoint en CPU o GPU para validar prompts y plantillas de chat antes de portarlo a Tensix.
- Generación de texto en inglés y coreano: la evaluación de fidelidad se realizó sobre WikiText-2 y Wikipedia en coreano, por lo que estos idiomas están razonablemente cubiertos en las pruebas publicadas.
- Integración en flujos de verificación continua: los scripts `pack_tensix.py` y `verify_grid.py` permiten incorporar comprobaciones de integridad del checkpoint en pipelines de CI.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad frente al modelo BF16, no la calidad de tarea. La evaluación cubre 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) y 33 prompts cortos con comprobación automática.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 69,32 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4) | 4,84 | 20,991 | 0,0870 | 87,10 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,89 | 21,713 | 0,0792 | 87,63 | 31 de 33 | 0 |

El criterio de aceptación del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el modelo cumple con 1,10 veces el KL de Q4_K_M y 0 respuestas perdidas. No se midió velocidad en dispositivo. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo de lenguaje cuantizados ocupan 20,99 GB empaquetados; el repositorio completo pesa 71,9 GB porque conserva el checkpoint íntegro, incluidos módulos en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, familias Wormhole y Blackhole, mediante tt-metal/ttnn (probado con ttnn 0.81.1).
- Estado de validación: las pruebas se realizaron en ttsim, el simulador de Blackhole de Tenstorrent, no en hardware físico.
- GPU consumer: no se documenta soporte ni rendimiento en GPU; el formato BFP4 es específico de tt-metal/ttnn y no es directamente ejecutable en CUDA.
- Opciones de despliegue: tt-metal/ttnn para Tensix; Transformers 5.22.2 para carga y generación en CPU (texto). tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles; no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Tensix-BFP4 | 35,95B totales, ~3B activos | no disponible | BFP4 (4,84 bits/peso) | MIT | Hugging Face, orientado a Tensix |
| Ornith-1.5-35B-A3B (BF16) | 35,95B totales, ~3B activos | no disponible | bf16 | MIT | Hugging Face |
| Ornith-1.5-35B-A3B Q4_K_M (llama.cpp) | 35,95B totales, ~3B activos | no disponible | Q4_K_M (4,89 bits/peso) | MIT | Generado con llama.cpp v0.9.0 |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible; no se han identificado en ella alternativas de otros desarrolladores con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La evaluación se realizó en simulador (ttsim), no en hardware Tensix físico; el rendimiento real en dispositivo no está verificado.
- Solo se cuantizó y evaluó el modelo de lenguaje; los módulos de visión y MTP permanecen en bf16 y no fueron evaluados.
- Las métricas publicadas miden fidelidad frente a BF16 (KL y top-1), no calidad de tarea; no hay benchmarks de MMLU, HumanEval, GSM8K ni similares.
- El conjunto de evaluación es reducido: 8.188 posiciones de texto y 33 prompts cortos, con sesgo hacia inglés y coreano.
- No se dispone de lista oficial de idiomas soportados ni de longitud de contexto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para este checkpoint ni para el modelo base.
- Licencia MIT, que permite uso comercial, pero el formato BFP4 depende de la pila tt-metal/ttnn y no es portable a otros backends sin conversión.
- El repositorio conserva el checkpoint completo (71,9 GB), lo que puede complicar el almacenamiento aunque los pesos cuantizados ocupen 20,99 GB.
- La compatibilidad con tt-transformers y tt-forge no está probada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tensix-BFP4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tensix-BFP4/blob/main/LICENSE
