# Xylolabs/Mistral-7B-v0.3-Tensix-BFP8

## Resumen

Mistral-7B-v0.3-Tensix-BFP8 es una versión cuantizada del modelo base mistralai/Mistral-7B-v0.3, publicada por Xylolabs y orientada específicamente a la inferencia sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). La particularidad es que las capas lineales se han cuantizado a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloque) mediante GPTQ, de modo que los pesos ya están en la rejilla numérica que el runtime TT-NN espera, y este puede empaquetarlos sin conversión adicional.

El modelo conserva la arquitectura y el tamaño del original: 7.248.023.552 parámetros totales, transformer decoder-only denso, con los pesos almacenados en bf16 pero con cada valor ya alineado a la rejilla BFP8 en las 32 capas de atención y MLP. El resultado es un checkpoint de 7,95 GB empaquetado (8,78 bits por peso de media), frente a los 14,5 GB del BF16 original, manteniendo en bf16 el LM head, los embeddings y las normas.

Es relevante porque cubre un nicho muy concreto: desplegar Mistral 7B en hardware Tensix con una pérdida de fidelidad respecto al BF16 muy baja (KL media de 0,00040 frente a 0,01285 de una cuantización Q4_K_M de llama.cpp). No es un modelo para GPU convencional ni para uso conversacional directo: es un artefacto de pesos preempaquetados para un stack de inferencia específico (TT-NN), probado únicamente en el simulador `ttsim` de Blackhole, no en silicio real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral 7B v0.3), con capas lineales cuantizadas a block floating point BFP8 |
| Parámetros totales | 7.248.023.552 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base; consúltese la model card de mistralai/Mistral-7B-v0.3) |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en q, k, v, o, gate, up, down de las 32 capas; bf16 en LM head, embeddings, normas y resto de tensores. 8,78 bits/peso de media |
| Idiomas soportados | no disponible (calibración GPTQ en inglés y coreano: WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tensores bf16 con valores en la rejilla BFP8), más `quant4.json` con el formato por proyección y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B v0.3: un transformer decoder-only denso de 32 capas con atención de múltiples cabezas y ventana deslizante, sin mezcla de expertos. Sobre esa base, Xylolabs aplica GPTQ restringiendo los pesos cuantizables a la rejilla `bfloat8_b` de TT-NN, que usa un exponente compartido por bloque en lugar de un escalar por tensor o por canal. El proceso conserva el exponente compartido de cada bloque tal y como lo fija el empaquetador de Tenstorrent, de forma que el checkpoint resultante no requiere recuantización en el momento de cargarlo en el dispositivo.

La calibración de GPTQ se realizó sobre 65.536 tokens combinados de WikiText-2 y Wikipedia en coreano. No se aplicó ajuste fino posterior ni alineamiento adicional: el checkpoint es el modelo preentrenado, sin plantilla de chat ni etapa de instrucciones. El repositorio incluye dos scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que comprueban, matriz a matriz, que el empaquetado en TT-NN reproduce exactamente los valores del safetensors. Las pruebas se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto autoregresiva y continuación de texto libre, en modo completion (sin plantilla de chat).
- Razonamiento y conocimiento general heredados de Mistral 7B v0.3, sujetos a la pérdida de fidelidad introducida por la cuantización (KL media de 0,00040 frente a BF16).
- Capacidad multilingüe heredada del modelo base; la model card no documenta la lista de idiomas soportados.
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con pesos ya empaquetables en `ttnn.bfloat8_b`.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` a nivel de metadatos de Hugging Face.
- No soporta tool calling, function calling, agentes ni modo thinking de forma documentada: es un modelo base preentrenado.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. Cargar el checkpoint directamente en una NPU Wormhole o Blackhole con TT-NN sin necesidad de un paso de cuantización en producción, gracias a que los pesos ya están en la rejilla `bfloat8_b`.
- Servicio de generación de texto en infraestructura no-GPU: para entornos con aceleradores Tensix donde se quiera servir un modelo de 7B con 7,95 GB de pesos en lugar de los 14,5 GB del BF16, reduciendo la huella de memoria DRAM a prácticamente la mitad.
- Validación de pipelines de cuantización: usar los scripts `pack_tensix.py` y `verify_grid.py` como referencia para comprobar que un empaquetado BFP8 reproduce bit a bit los valores del safetensors antes de desplegar modelos propios.
- Prototipado en simulador: probar flujos de inferencia sobre `ttsim` (Blackhole) con un checkpoint realista de 7B antes de disponer de hardware, dado que el autor validó el modelo en ese entorno.
- Continuación de texto y tareas de completion en lote: resumen extractivo, generación de descripciones o autocompletado sobre corpus largos, donde la fidelidad respecto a BF16 (top-1 del 98,96 %) es suficiente y el ahorro de memoria es determinante.
- Investigación sobre block floating point: el checkpoint sirve como material de estudio para medir el impacto de BFP8 con exponente compartido por bloque frente a cuantizaciones escalares como Q4_K_M, con métricas KL y top-1 ya publicadas.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (mistralai/Mistral-7B-v0.3) | 16 | 14,50 | 0 | 100 | 20 de 28 | - |
| **Este modelo (BFP8)** | 8,78 | 7,953 | 0,00040 | 98,96 | 20 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,83 | 4,373 | 0,01285 | 94,05 | 20 de 28 | 0 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano). Las 28 respuestas corresponden a prompts cortos con comprobación automática, en formato completion y con 3 ejemplos. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El autor advierte que estas cifras miden cercanía al BF16, no calidad de tarea, y que no se midió velocidad en dispositivo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,95 GB de pesos empaquetados en BFP8; en bf16 para carga en transformers, el repositorio ocupa 14,5 GB, por lo que se necesita al menos esa cantidad de memoria del dispositivo o de host durante la carga.
- GPU recomendadas: no aplica como destino principal; el modelo está pensado para NPU Tensix (Wormhole, Blackhole). En GPU convencional puede cargarse con transformers en bf16, requiriendo aproximadamente 16 GB de VRAM (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 16 GB o más (RTX 4090, RTX 4080 Super); en configuraciones de 12 GB requeriría descarga parcial a CPU o cuantización adicional no incluida en el repo.
- Opciones de despliegue: TT-NN (ttnn 0.81.1, probado en `ttsim`), transformers con `AutoModelForCausalLM`, y metadatos de compatibilidad con text-generation-inference. tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponibles; el autor no midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño | Licencia | Destino |
|---|---|---:|---:|---:|---|---|
| Mistral-7B-v0.3-Tensix-BFP8 | 7,25 B | no disponible | 8,78 | 7,95 GB | Apache 2.0 | NPU Tensix (TT-NN) |
| mistralai/Mistral-7B-v0.3 (BF16) | 7,25 B | no disponible | 16 | 14,50 GB | Apache 2.0 | GPU/CPU genéricas |
| Mistral-7B-v0.3 Q4_K_M (llama.cpp) | 7,25 B | no disponible | 4,83 | 4,37 GB | Apache 2.0 | CPU/GPU vía llama.cpp |
| Mistral-7B-Instruct-v0.3 | 7,25 B | no disponible | 16 | 14,50 GB | Apache 2.0 | GPU/CPU, uso conversacional |

La comparación relevante es de fidelidad y destino de ejecución: el BFP8 de Xylolabs queda muy por encima de Q4_K_M en cercanía al BF16 (KL 0,00040 frente a 0,01285) a costa de casi el doble de tamaño, y su ventaja específica es que está preempaquetado para TT-NN. Frente a Mistral-7B-Instruct-v0.3, la diferencia es funcional: este checkpoint es base, sin alineamiento conversacional.

## Limitaciones y advertencias

- Es un modelo preentrenado sin plantilla de chat ni ajuste por instrucciones; no debe usarse directamente como asistente conversacional sin un post-entrenamiento adicional.
- No validado en hardware real: las pruebas se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, no en silicio Tensix.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que la compatibilidad con esos stacks no está demostrada.
- Riesgo de alucinación inherente al modelo base; la cuantización añade una degradación pequeña pero medible (top-1 del 98,96 % frente a BF16).
- La calibración GPTQ se hizo solo con inglés y coreano, lo que puede sesgar la fidelidad de la cuantización en otros idiomas.
- La lista de idiomas soportados no está documentada en la model card.
- Licencia Apache 2.0 heredada del modelo base; el repositorio original de Mistral no incluye fichero LICENSE, por lo que el autor aporta el texto estándar. Sin garantías y sin afiliación ni respaldo de Tenstorrent.
- El modelo está atado a la rejilla numérica `bfloat8_b` de TT-NN; usarlo fuera de ese stack obliga a tratar los pesos como bf16, perdiendo la ventaja de tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tensix-BFP8
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tensix-BFP8/blob/main/LICENSE
