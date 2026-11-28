# Xylolabs/gemma-4-12B-Tenstorrent-Tensix

## Resumen

Xylolabs/gemma-4-12B-Tenstorrent-Tensix es una versión cuantizada del modelo base google/gemma-4-12B, adaptada específicamente para su ejecución sobre las NPU Tensix de Tenstorrent. El trabajo lo firma Xylolabs, que aplica su pipeline tensix-bfp-gptq para convertir los pesos originales en BF16 a formatos de bloque de coma flotante (bfloat4_b y bfloat8_b) compatibles con la pila de software tt-metal, ttnn y tt-forge. El resultado son dos carpetas independientes, `bfp4/` y `bfp8/`, cada una con sus propios pesos, metadatos de cuantización y scripts de empaquetado.

El modelo resuelve un problema muy concreto: permitir que un transformer de 12 000 millones de parámetros se ejecute en hardware de aceleración no convencional (las NPU Tensix) con un coste de memoria sensiblemente inferior al BF16. La versión `bfp4/` ocupa 8,146 GB empaquetada frente a los 23,81 GB del modelo original en BF16, lo que supone una reducción de aproximadamente 2,9 veces. La versión `bfp8/` ocupa 13,596 GB. El repositorio completo pesa 47,8 GB porque aloja ambas variantes junto con los ficheros auxiliares.

Es relevante ahora porque la cuantización específica para aceleradores de dominio específico (no solo GPU) es una línea de trabajo creciente, y porque el modelo base forma parte de la familia Gemma 4 de Google, con un informe técnico publicado en arXiv (2607.02770). La licencia Apache 2.0 y la disponibilidad de los scripts de empaquetado facilitan su evaluación y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base google/gemma-4-12B); pesos cuantizados para NPU Tensix |
| Parametros totales | 12 000 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (atención y MLP), bfloat8_b (atención y MLP), BF16 (resto de capas); referencia Q4_K_M de llama.cpp |
| Idiomas soportados | no disponible en la model card; la evaluación de KL usa inglés y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con índices `model.safetensors.index.json` y ficheros de metadatos `quant4.json`) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento (PTQ) del transformer google/gemma-4-12B. No se reentrena ni se ajusta con RLHF/DPO en este repositorio: se parte de los pesos BF16 del modelo base y se aplica el pipeline tensix-bfp-gptq, que convierte las matrices de atención y MLP a formatos de bloque de coma flotante propios del hardware Tensix. El resto de capas (embeddings, normalizaciones, cabezas, etc.) permanece en BF16. Cada carpeta incluye un fichero `quant4.json` que describe, por capa, el formato aplicado a cada submatriz.

La innovación técnica principal es el uso de formatos de bloque bfloat4_b y bfloat8_b, que agrupan valores en bloques con un exponente compartido, lo que reduce el error de cuantización frente a una cuantización escalar ingenua y encaja con la unidad de cómputo Tensix. La model card reporta la divergencia respecto a BF16 mediante KL divergence media sobre 8 184 posiciones de texto en inglés (WikiText-2 test) y coreano (Wikipedia en coreano): 0,07334 para bfp4 y 0,00201 para bfp8, frente a 0,09127 para la referencia Q4_K_M de llama.cpp. El límite de aceptación declarado es 1,5 veces la KL de Q4_K_M. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, fases de alineación).

## Capacidades

- Generación de texto autoregresiva: el modelo es la versión preentrenada, continúa texto y no incluye plantilla de chat.
- Razonamiento y conocimiento general heredados del modelo base Gemma 4 de 12B (no se detallan capacidades específicas en la model card).
- Capacidad multimodal declarada por el pipeline `any-to-any` del modelo base, aunque la model card solo demuestra generación de texto.
- Ejecución sobre NPU Tensix mediante ttnn: empaquetado de matrices con `ttnn.as_tensor`, layout TILE y memoria DRAM.
- Herramientas de empaquetado y verificación incluidas: `pack_tensix.py` y `verify_grid.py`, con opción `--device` para round-trip por DRAM.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni audio en la información disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: ejecutar un modelo de 12B en NPU Tensix con la variante `bfp4/` (8,146 GB) para reducir la huella de memoria frente a BF16 (23,81 GB), útil en entornos con aceleradores Tensix y memoria limitada.
- Evaluación de cuantización de bloque: usar las métricas de KL reportadas (0,07334 en bfp4, 0,00201 en bfp8) para decidir qué formato emplear según la tolerancia a la degradación en una tarea concreta.
- Investigación en compresión de modelos: el pipeline tensix-bfp-gptq y los scripts de verificación permiten reproducir el empaquetado y estudiar el efecto de bfloat4_b/bfloat8_b en capas de atención y MLP.
- Generación de texto en inglés y coreano: la evaluación de KL cubre ambos idiomas, por lo que es adecuado para tareas de continuación de texto en esos idiomas, con la salvedad de que es un modelo preentrenado sin plantilla de chat.
- Prototipado en pipelines de CI: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la integridad de los pesos empaquetados antes de desplegar en producción.
- Benchmarking de hardware: comparar latencia y throughput de bfp4 frente a bfp8 y Q4_K_M en la misma NPU Tensix para caracterizar el compromiso precisión/rendimiento.
- Base para ajuste fino posterior: al ser pesos safetensors con licencia Apache 2.0, se puede partir de ellos para tareas downstream, siempre que el hardware o el pipeline de conversión lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de fidelidad de cuantización:

| Formato | Tamano empaquetado (GB) | KL media a BF16 | Referencia |
|---|---|---|---|
| bfp4/ | 8,146 | 0,07334 | Q4_K_M: 0,09127 |
| bfp8/ | 13,596 | 0,00201 | Q4_K_M: 0,09127 |
| BF16 (base) | 23,81 | 0 | — |
| Q4_K_M (llama.cpp) | 7,381 | 0,09127 | — |

La KL se calcula sobre 8 184 posiciones de texto en inglés (WikiText-2 test) y coreano (Wikipedia en coreano), en texto plano, con un límite de 1,5 veces la KL de Q4_K_M.

## Requisitos de hardware

- VRAM/memoria: la variante `bfp4/` requiere al menos 8,146 GB de memoria empaquetada; `bfp8/` requiere 13,596 GB. El modelo BF16 de referencia ocupa 23,81 GB.
- Hardware objetivo: NPU Tensix de Tenstorrent, con la pila tt-metal, ttnn y tt-forge. No se especifican modelos concretos de tarjeta (por ejemplo, Wormhole o Grayskull) en la información disponible.
- GPU de consumo: no se documenta ejecución en GPU consumer; el ejemplo de código usa `device_map="auto"` con transformers, pero el empaquetado y la verificación están pensados para Tensix.
- Opciones de despliegue: ttnn (empaquetado y ejecución en Tensix), transformers (carga de pesos safetensors para generación de texto), llama.cpp solo como referencia de cuantización Q4_K_M.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-12B-Tenstorrent-Tensix | 12B | no disponible | bfloat4_b, bfloat8_b | Apache 2.0 | NPU Tensix |
| google/gemma-4-12B (BF16) | 12B | no disponible | BF16 | Apache 2.0 | GPU/CPU genéricos |
| Q4_K_M de llama.cpp (referencia) | 12B | no disponible | Q4_K_M | Apache 2.0 (base) | CPU/GPU consumer |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de información sobre modelos alternativos de 12B en el mismo formato o hardware. No se dispone de datos de rendimiento en tareas para comparar calidad más allá de la KL reportada.

## Limitaciones y advertencias

- Es un modelo preentrenado: no incluye plantilla de chat ni ajuste por instrucciones, por lo que no es adecuado para diálogo directo sin un post-entrenamiento adicional.
- La cuantización bfp4 introduce una KL media de 0,07334, superior a la de bfp8 (0,00201); para tareas sensibles a la precisión conviene usar bfp8 o BF16.
- La evaluación de fidelidad solo cubre inglés y coreano; no hay datos sobre otros idiomas, y la lista de idiomas soportados no está disponible.
- El hardware objetivo es específico (NPU Tensix); no se garantiza el funcionamiento en GPU o CPU sin conversión adicional.
- Riesgo de alucinación y sesgos heredados del modelo base Gemma 4, no evaluados en esta model card.
- La licencia es Apache 2.0 según la model card del modelo base, pero el repositorio original no incluye fichero LICENSE; el repositorio de Xylolabs aporta el texto estándar y un NOTICE con los cambios.
- No se documentan límites de contexto, por lo que no se puede garantizar el comportamiento en contextos largos.
- El repositorio mezcla dos formatos en un solo espacio (47,8 GB); conviene descargar solo la carpeta necesaria con `--include`.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Herramientas de empaquetado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0/tools
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Informe técnico Gemma 4 (arXiv): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-12B-Tenstorrent-Tensix/blob/main/LICENSE
