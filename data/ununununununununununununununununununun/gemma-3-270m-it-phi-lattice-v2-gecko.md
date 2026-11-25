# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-gecko

## Resumen

`gemma-3-270m-it-phi-lattice-v2-gecko` es un archivo de pesos cuantizados a 4 bits del modelo `unsloth/gemma-3-270m-it`, que a su vez es un ajuste fino de instrucciones de Gemma 3 270M de Google DeepMind. Lo publica el usuario `ununununununununununununununununununun` como parte de la familia experimental "phi-lattice", centrada en técnicas de cuantización post-entrenamiento con retroalimentación de error por bloques de columnas. No es un modelo nuevo entrenado desde cero: es una representación comprimida del checkpoint base con un cargador propio (`phi_loader.py`) que reconstruye los pesos BF16 o los mantiene empaquetados.

La relevancia técnica del artefacto está en el método de cuantización denominado "Gecko", que restringe la retroalimentación de error a bloques de 64 columnas con una métrica espectral amortiguada (`alpha=0.5`). Según la model card, este enfoque preserva mejor la fidelidad de pesos que la variante GPTQ global (19,06 dB frente a 16,17 dB de SQNR) y reduce la perplejidad en un 15,1 % respecto a la variante "plain v2", además de ejecutar la cuantización 6,4 veces más rápido en CPU. El archivo principal pesa 371,03 MiB y contiene 126 capas lineales cuantizadas y 110 tensores en BF16.

El modelo subyacente es un transformer de 270 millones de parámetros con capacidades conversacionales básicas, pensado para entornos con recursos muy limitados. A esta escala, los benchmarks de conocimiento y matemáticas se sitúan en el suelo de acierto aleatorio, por lo que el interés del artefacto es principalmente metodológico (investigación en cuantización) más que de rendimiento downstream. La licencia es Gemma, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante `gemma3_text`) |
| Parametros totales | 270 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits empaquetado (126 capas lineales), embeddings en BF16 o variante "cashback" de dos flujos; modos de carga `low_vram_4bit` y `unrolled_bf16` |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | `.pt` (PyTorch) empaquetado, cargado mediante `phi_loader.py`; no es safetensors ni GGUF |
| Tamano del archivo principal | 371,03 MiB (`gemma3_270m_phi_gecko_v2_packed_4bit.pt`) |
| Tamano variante cashback | 221 MiB (`gemma3_270m_phi_v2_cashback_packed_4bit.pt`) |
| Tamano del repositorio | 1,2 GB |
| Modelo base | `unsloth/gemma-3-270m-it` |
| Libreria | transformers |
| Descargas | 288 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 270M en su variante de ajuste de instrucciones publicada por Unsloth, un transformer decoder-only de 270 millones de parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el checkpoint base dentro de la información proporcionada.

La contribución de este repositorio no es el entrenamiento sino la compresión. La técnica "Gecko" cuantiza las capas lineales a 4 bits usando bloques de 64 columnas y una métrica espectral con `alpha=0.5`, aplicando retroalimentación de error solo dentro de cada bloque para evitar la acumulación de error de largo alcance que afecta a los esquemas GPTQ de fila completa. El resultado son 126 capas cuantizadas con un 13,46 % de ceros exactos en los pesos descomprimidos, un SQNR de 19,06 dB frente al BF16 y un tiempo de cuantización de 22,7 segundos en CPU. La variante "cashback" mueve la tabla de embeddings a un par de dos flujos de aproximadamente 160 MiB (frente a 320 MiB en BF16), reconstruyendo la tabla original con 37,88 dB de SQNR y un coste de +0,40 % en perplejidad (136,93 → 137,47).

## Capacidades

- Generación de texto conversacional en el estilo del ajuste de instrucciones de Gemma 3 270M IT.
- Razonamiento básico de múltiples turnos, limitado por la escala de 270M parámetros.
- Capacidades multilingües heredadas del modelo base (no documentadas en este repositorio).
- Carga en dos modos: `unrolled_bf16` materializa los pesos en BF16 para inferencia estándar con transformers; `low_vram_4bit` mantiene los nibbles empaquetados para minimizar memoria.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en cuantización post-entrenamiento: el artefacto sirve para reproducir y comparar el método Gecko frente a GPTQ y esquemas de 4 bits tipo Q4_K_M, con métricas de SQNR y perplejidad ya publicadas y scripts de evaluación en el repositorio.
- Inferencia en CPU con memoria muy restringida: el modo `low_vram_4bit` mantiene el archivo en 371 MiB (o 221 MiB con embeddings cashback) y permite ejecutar el modelo en entornos sin GPU, útil para pruebas de humo y prototipos.
- Despliegue en dispositivos de borde: con 270M parámetros y pesos de 4 bits, el modelo puede caber en placas con 1-2 GB de RAM, aunque la calidad conversacional será limitada.
- Generación de texto de baja latencia en pipelines de clasificación o etiquetado simple: el tamaño reducido permite throughput alto en CPU para tareas de filtrado previo antes de modelos mayores.
- Docencia y experimentación con formatos de pesos no estándar: el cargador `phi_loader.py` y el layout empaquetado sirven como ejemplo práctico de serialización alternativa a safetensors y GGUF.
- Evaluación comparativa de fidelidad de pesos: los resultados de MMLU, GSM8K, HellaSwag e IFEval publicados permiten medir el impacto de la cuantización a pequeña escala y contrastarlo con el mismo método aplicado a modelos de 4B.

## Benchmarks y rendimiento

Resultados publicados en la model card, ejecutados con `lm-evaluation-harness` en CPU, un task a la vez, sobre el archivo descomprimido a BF16:

| Tarea | Métrica | Base BF16 | phi-lattice v2 | Este archivo (Gecko) |
|---|---|---:|---:|---:|
| MMLU | acc | 0,2508 | 0,2594 | 0,2354 |
| GSM8K | exact_match estricto | 0,0243 | 0,0061 | 0,0023 |
| HellaSwag | acc_norm | 0,3929 | 0,3793 | 0,3754 |
| IFEval | inst_level_strict_acc | 0,3729 | 0,2866 | 0,2602 |

Métricas de fidelidad y perplejidad (FP32, seis textos de evaluación, tokenizer de `unsloth/gemma-3-270m-it`):

| Checkpoint | SQNR vs BF16 | Perplejidad | Archivo |
|---|---:|---:|---|
| BF16 base | — | 90,82 | base |
| phi-lattice v2 | 19,48 dB | 161,26 | packed 4-bit |
| phi-lattice v2-GPTQ | 16,17 dB | 140,06 | packed 4-bit |
| Este archivo (Gecko) | 19,06 dB | 136,93 | packed 4-bit, 371,03 MiB |
| Q4_K_M | 26,80 dB | 99,30 | ejecución previa, mismos textos |

A escala 270M, MMLU y GSM8K están en el suelo de acierto aleatorio incluso para el modelo BF16 sin cuantizar (25,08 % frente al 25,00 % de azar en MMLU de cuatro opciones; 2,43 % en GSM8K), por lo que la mejora de perplejidad no se traduce en deltas downstream significativos. La model card reporta que la misma receta aplicada a un modelo de 4B mejora todas las tareas frente a la variante "plain v2".

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,4 GB en modo `low_vram_4bit` con el archivo principal; unos 0,25 GB con la variante cashback; en torno a 0,6-0,7 GB si se materializa en BF16 (`unrolled_bf16`).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de memoria (GTX 1650, RTX 3050, RTX 4060); también A100, H100 y L4 para despliegues por lotes, aunque el modelo está claramente sobredimensionado para estas GPUs.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más; también en CPU y en dispositivos de borde.
- Opciones de despliegue: el repositorio proporciona `phi_loader.py` para cargar con transformers; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.pt` empaquetado no es estándar.
- Latencia y throughput: no disponibles en la información proporcionada; solo se documenta el tiempo de cuantización (22,7 s en CPU para las 126 capas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este archivo (Gemma 3 270M Gecko) | 270M | no disponible | Gemma | `.pt` 4-bit empaquetado | SQNR 19,06 dB, PPL 136,93 |
| `gemma-3-270m-it-phi-lattice-v2` | 270M | no disponible | Gemma | `.pt` 4-bit empaquetado | SQNR 19,48 dB, PPL 161,26 |
| `unsloth/gemma-3-270m-it` (BF16) | 270M | no disponible | Gemma | safetensors | Referencia sin cuantizar, PPL 90,82 |
| Q4_K_M del mismo base | 270M | no disponible | Gemma | GGUF (implícito) | SQNR 26,80 dB, PPL 99,30 |

No se dispone de datos de contexto ni de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- A 270M parámetros, el rendimiento en conocimiento (MMLU) y matemáticas (GSM8K) está en el nivel de acierto aleatorio, por lo que no es adecuado para tareas que requieran razonamiento fiable.
- La cuantización degrada las métricas downstream respecto al BF16 base en todas las tareas evaluadas (MMLU 0,2508 → 0,2354; IFEval 0,3729 → 0,2602; GSM8K 0,0243 → 0,0023).
- Riesgo elevado de alucinación y de respuestas incoherentes en conversaciones largas, inherente a la escala del modelo.
- El formato de pesos no es estándar (`.pt` empaquetado con cargador propio), lo que complica la integración con herramientas habituales como llama.cpp, Ollama o vLLM.
- La variante cashback introduce una pérdida adicional de perplejidad (+0,40 %) y reconstruye los embeddings de forma aproximada (37,88 dB SQNR), no exacta.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos completos antes de un despliegue en producción.
- No se documentan los idiomas soportados ni la longitud de contexto en este repositorio; deben consultarse en la model card del modelo base.
- El autor del repositorio es un usuario individual y el artefacto tiene 0 likes y 288 descargas, sin señales de validación externa más allá de las métricas publicadas por el propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-gecko
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Variante phi-lattice v2: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2
- Variante Gecko aplicada a Qwen3-4B: https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2-gecko
- Resultados de lm-evaluation-harness: `evals/lm_eval_gemma_gecko/` (incluido en el repositorio)
- Informe de empaquetado cashback: `examples/results/gemma_gecko_embed_cashback_pack.json` (incluido en el repositorio)
