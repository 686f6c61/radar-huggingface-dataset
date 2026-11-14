# Xylolabs/Qwen3-4B-Base-Tenstorrent-Tensix-BFP4

## Resumen

Xylolabs/Qwen3-4B-Base-Tenstix-BFP4 es una exportación cuantizada del modelo Qwen3-4B-Base de Alibaba Qwen, adaptada específicamente para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La cuantización se ha realizado con GPTQ sobre las capas lineales (atención q, k, v, o y MLP gate, up, down en las 36 capas), convirtiéndolas al formato `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits con exponente compartido por bloque). El resto de tensores —embeddings, LM head atado al embedding, normalizaciones— permanecen en bf16.

El modelo conserva la arquitectura transformer densa del Qwen3-4B-Base original, con 4.411.424.256 parámetros totales, y está pensado para despliegues en hardware Tensix donde el espacio en DRAM del dispositivo es limitado. El checkpoint empaquetado ocupa 2,82 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, frente a los 8,04 GB del BF16 original, lo que supone una compresión de aproximadamente 2,85 veces con un coste de fidelidad medido en KL de 0,04765 frente al modelo de referencia.

Es relevante ahora porque demuestra que la cuantización BFP4 con GPTQ puede empaquetarse de forma exacta en TT-NN (los valores bf16 sobre la rejilla BFP4 se conservan sin cambios al empaquetar) y porque ofrece una alternativa abierta (Apache 2.0) para quienes despliegan modelos en aceleradores Tenstorrent sin renunciar a la calidad del Qwen3 base. No obstante, se trata de un modelo preentrenado, no ajustado a instrucciones, y el soporte de tooling (tt-transformers, tt-forge) no ha sido validado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con capas lineales cuantizadas a BFP4 y resto en bf16 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en embeddings, LM head, normas y otros tensores; media de 5,61 bits por peso |
| Idiomas soportados | no disponible (calibrado con WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` que describe el formato de cada proyección) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Base es un transformer denso de 36 capas con atención multi-cabeza estándar y capas MLP con proyecciones gate, up y down. Sobre esta arquitectura, Xylolabs aplica GPTQ a las proyecciones q, k, v, o, gate, up y down de las 36 capas, con una búsqueda de exponente por bloque para el formato block floating point BFP4. La calibración se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin alterar sus valores; el repositorio incluye `pack_tensix.py` y `verify_grid.py` para verificar el empaquetado exacto.

No se proporciona información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO; el modelo es la versión preentrenada de Qwen3-4B-Base, no ajustada a instrucciones. La innovación técnica destacable es el uso de BFP4 con exponente compartido por bloque y GPTQ, que permite una compresión de 5,61 bits por peso de media manteniendo una fidelidad cercana a la cuantización Q4_K_M de llama.cpp (KL de 0,04765 frente a 0,04793). El checkpoint fue verificado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim); tt-transformers y tt-forge no fueron ejecutados con este checkpoint.

## Capacidades

- Generación de texto por continuación (modelo preentrenado, no instruction-tuned): completa secuencias a partir de un prefijo.
- Razonamiento y conocimiento general heredados del Qwen3-4B-Base original.
- Capacidad multilingüe del modelo base, aunque no se documentan idiomas concretos en la información disponible.
- No soporta tool calling ni function calling de forma nativa (no es un modelo ajustado a instrucciones).
- No está diseñado para agentes ni razonamiento multi-paso con formato de conversación, aunque el tokenizador conserva la plantilla de chat del modelo base.
- No dispone de modo thinking, visión ni audio.
- Inferencia optimizada para NPU Tensix mediante TT-NN (`ttnn.bfloat4_b`).

## Casos de uso

- Despliegue en hardware Tenstorrent Wormhole o Blackhole: el modelo cabe en 2,82 GB de DRAM de dispositivo para los pesos, lo que permite ejecutarlo en aceleradores con memoria limitada y liberar espacio para la caché KV y buffers.
- Generación de texto en producción sobre NPU: al ser un modelo preentrenado, encaja en tareas de continuación de texto, autocompletado y generación de borradores donde no se requiere seguir instrucciones.
- Prototipado e investigación en cuantización BFP4: el repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que permiten validar el empaquetado exacto de matrices en TT-NN y estudiar el impacto de la cuantización de 4 bits.
- Evaluación de fidelidad de cuantización: sirve como referencia para comparar KL y top-1 frente a BF16 y Q4_K_M en tareas de inglés y coreano.
- Fine-tuning posterior sobre el checkpoint cuantizado o sobre el base: al mantener la licencia Apache 2.0 y el formato safetensors, puede integrarse en pipelines de transformers para experimentación.
- Investigación en eficiencia energética y throughput en NPU: permite medir latencia y consumo en Tensix con un modelo de 4B parámetros cuantizado, aunque el autor no reporta cifras de velocidad.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B-Base) | 16 | 8,04 | 0 | 100 | 28 de 28 | - |
| **Este modelo (BFP4)** | 5,61 | 2,822 | 0,04765 | 89,19 | 27 de 28 | 1 |
| Q4_K_M (llama.cpp) | 4,96 | 2,497 | 0,04793 | 89,65 | 28 de 28 | 0 |

KL y top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de continuación y 3-shot. El autor advierte que estas métricas miden cercanía a BF16, no calidad de tarea, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo estimada: 2,82 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- GPU recomendadas: no aplica de forma nativa; el modelo está pensado para NPU Tensix de Tenstorrent (Wormhole, Blackhole).
- Compatibilidad con GPU consumer: no se documenta; el checkpoint puede cargarse con transformers en bf16 (8,04 GB), lo que cabría en GPUs con al menos 10-12 GB de VRAM, pero la cuantización BFP4 solo se aprovecha en TT-NN.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 verificado en simulador Blackhole), transformers para carga en bf16; tt-transformers y tt-forge no fueron probados con este checkpoint.
- Latencia y throughput: no reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Base-Tenstix-BFP4 | 4,41B | no disponible | BFP4 (5,61 bits/peso) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Base (BF16) | 4,41B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Qwen3-4B-Base en Q4_K_M (llama.cpp) | 4,41B | no disponible | 4,96 bits/peso | Apache 2.0 | Generado localmente |

La comparativa se limita al mismo modelo base en distintos formatos, ya que no se dispone de datos de benchmarks frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo preentrenado, no ajustado a instrucciones: no debe usarse directamente como asistente conversacional sin fine-tuning o prompting adecuado.
- Riesgo de alucinación inherente al modelo base Qwen3-4B-Base, no mitigado por la cuantización.
- La cuantización BFP4 introduce una pérdida de fidelidad medible (KL de 0,04765, top-1 del 89,19 % frente a BF16); una de las 28 respuestas de evaluación se pierde respecto a BF16.
- Idiomas soportados no documentados; la calibración usó inglés y coreano, por lo que el comportamiento en castellano no está caracterizado.
- Longitud de contexto no disponible en la información proporcionada.
- El checkpoint solo ha sido verificado con ttnn 0.81.1 en el simulador Blackhole (ttsim); no se ha validado en hardware físico ni con tt-transformers o tt-forge.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el software "as is", sin garantía, y aclara que no está afiliado ni respaldado por Tenstorrent.
- El rendimiento (latencia, throughput) no se reporta, lo que dificulta estimar costes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tenstix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3: https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tenstix-BFP4/blob/main/LICENSE
