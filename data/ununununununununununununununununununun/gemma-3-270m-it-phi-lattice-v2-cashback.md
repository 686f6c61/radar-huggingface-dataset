# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-cashback

## Resumen

`gemma-3-270m-it-phi-lattice-v2-cashback` es un archivo de pesos cuantizados del modelo `unsloth/gemma-3-270m-it`, publicado por el usuario `ununununununununununununununununununun` en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos nuevos, sino de una técnica de compresión con reconstrucción casi exacta: cada una de las 126 capas cuantizadas incorpora un segundo flujo de 4 bits que almacena el residuo exacto `R = W_bf16 - W_v2`, de modo que la suma desempaquetada reconstruye los pesos BF16 originales con 39,17 dB de SQNR (frente a los 19,48 dB del flujo base aislado).

El modelo base es Gemma 3 270M en su variante instruct, un transformer decoder-only de 270 millones de parámetros desarrollado por Google DeepMind. Esta versión concreta no modifica la arquitectura ni el entrenamiento: solo cambia el formato de almacenamiento de los pesos. El resultado es un checkpoint de aproximadamente 8,5 bits por peso efectivos (unos 421,9 MiB empaquetados) que, según la model card, iguala al BF16 en perplejidad (90,59 frente a 90,82) y en las métricas de lm-eval reportadas (HellaSwag, MMLU, GSM8K, IFEval).

La relevancia es doble. Por un lado, demuestra empíricamente que la cuantización a 4 bits puede revertirse casi por completo añadiendo un flujo residual de bajo coste, con verificaciones cruzadas en Qwen3-4B y embeddinggemma-2. Por otro, es un ejemplo de empaquetado "data-free" ejecutado en CPU/Mac, sin calibración ni GPU, lo que abre la puerta a pipelines de compresión reproducibles en hardware modesto. Conviene subrayar que el modelo subyacente de 270M es débil por sí mismo (MMLU cercano al azar, GSM8K en el suelo de ruido): la técnica restaura la calidad perdida por la cuantización, no la capacidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 270 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit por flujo, dos flujos (base + residual "cashback"); ~8,5 bpw efectivos; modo `low_vram_4bit` y `unrolled_bf16` en el loader |
| Idiomas soportados | no disponibles (la model card no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` empaquetado (`gemma3_270m_phi_v2_cashback_packed_4bit.pt`, 421,9 MiB, sha256 `a91fb6b5…`) + `phi_loader.py` para carga con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del Gemma 3 270M instruct original: un transformer decoder-only con atención estándar y tokenizador de Gemma. Esta publicación no reentrena ni ajusta el modelo; el trabajo consiste en un esquema de cuantización denominado `phi-lattice v2` con flujo residual `cashback`. Cada capa cuantizada se almacena en dos flujos de 4 bits: el flujo base `W_v2` (idéntico byte a byte al del repositorio `gemma-3-270m-it-phi-lattice-v2`) y un segundo flujo que codifica el residuo exacto `R = W_bf16 - W_v2`. Al desempaquetar y sumar ambos flujos se reconstruyen los pesos BF16 con 39,17 dB de SQNR.

El proceso se describe como "data-free": no requiere calibración con datos, se ejecutó en CPU/Mac y no usó GPU. No hay información sobre datos de entrenamiento, número de tokens, RLHF/DPO ni innovaciones de decodificación, porque el modelo base no se ha reentrenado en este repositorio. La innovación técnica es exclusivamente de compresión: demuestra que un segundo flujo de 4 bits recupera la práctica totalidad de la pérdida por cuantización (100,3% del gap de perplejidad cerrado) a un coste de ~8,5 bpw, la mitad del tamaño de BF16. El mismo esquema se validó en embeddings de Qwen3-4B (39,28 dB) y embeddinggemma-2 (39,21 dB).

## Capacidades

- Generación de texto conversacional, heredada del modelo base `gemma-3-270m-it` (instruct).
- Razonamiento y matemáticas básicas: capacidad limitada por el tamaño de 270M (GSM8K strict 2,20% en esta versión).
- Seguimiento de instrucciones: IFEval prompt_strict 23,11%, en línea con el BF16 (24,21%).
- Conocimiento general: MMLU acc 24,93%, cercano al nivel de azar para el tamaño del modelo.
- Comprensión lectora y sentido común: HellaSwag acc_norm 39,31%.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales: no se documentan visión, audio ni modo "thinking"; el modelo base es solo texto.
- Carga dual: el loader admite `low_vram_4bit` (ambos flujos empaquetados) y `unrolled_bf16` (desempaquetado a BF16), y es retrocompatible con archivos `phi_lattice_v2_packed_4bit` sin clave `cashback_layers`.

## Casos de uso

- Evaluación de técnicas de cuantización: sirve como referencia reproducible para medir el impacto de esquemas de 4 bits frente a BF16 en modelos pequeños, comparando SQNR y perplejidad con el mismo protocolo (`gecko_experiment.EVAL_TEXTS`, FP32).
- Investigación en compresión de pesos: el par de flujos base + residual permite estudiar la reconstrucción exacta de pesos y validar variantes del esquema `phi-lattice` en otros modelos (ya probado en Qwen3-4B y embeddinggemma-2).
- Despliegue en entornos con VRAM muy limitada: con 421,9 MiB empaquetados y modo `low_vram_4bit`, cabe en GPU de consumo, CPU o Apple Silicon (MPS) para prototipos de generación de texto.
- Pruebas de pipelines de carga personalizada: el `phi_loader.py` y la retrocompatibilidad con archivos sin `cashback_layers` permiten integrar el formato en flujos de `transformers` y validar la API de carga.
- Generación de texto ligera en dispositivos: chat o autocompletado de baja exigencia donde el tamaño del checkpoint y la fidelidad al BF16 importan más que la calidad absoluta del modelo de 270M.
- Reproducibilidad de benchmarks: útil para replicar las métricas de lm-eval (HellaSwag, MMLU, GSM8K, IFEval) y verificar que la cuantización con cashback no degrada el rendimiento respecto al BF16.

## Benchmarks y rendimiento

Datos reportados en la model card (PPL = perplejidad, menor es mejor; el resto son precisiones):

| Checkpoint | SQNR vs BF16 | PPL (6 textos, FP32) | HellaSwag acc_norm | MMLU acc | GSM8K strict | IFEval prompt_strict |
|---|---:|---:|---:|---:|---:|---:|
| BF16 `unsloth/gemma-3-270m-it` | — | 90,82 | 39,29% | 25,08% | 2,43% | 24,21% |
| `phi-lattice v2` (solo flujo base) | 19,48 dB | 161,27 | 37,93% | 25,94% | 0,61% | 17,74% |
| `Q4_K_M` (llama.cpp, ~4,5 bpw) | 26,80 dB | 99,30 | 39,12% | 24,88% | 1,36% | 17,56% |
| **`v2 + cashback` (este repo)** | **39,17 dB** | **90,59** | 39,31% | 24,93% | 2,20% | 23,11% |

Notas de la model card: la fila `Q4_K_M` solo tiene PPL medida en los mismos seis textos (no se ejecutó lm-eval de Gemma). Las celdas de lm-eval de BF16 y v2 provienen de las evaluaciones publicadas del repo v2; las de cashback se completaron con un runner local por tareas. El autor advierte que a 270M el modelo es débil (MMLU ≈ azar, GSM8K ≈ suelo de ruido) y que cashback elimina el daño de cuantización, no aumenta la capacidad del modelo.

## Requisitos de hardware

- VRAM estimada: el checkpoint empaquetado ocupa 421,9 MiB; en modo `low_vram_4bit` ambos flujos permanecen empaquetados y el consumo es bajo (por debajo de 1 GB en la práctica, aunque no se publica una cifra exacta). En modo `unrolled_bf16` los pesos se expanden a BF16 (270M parámetros, ~540 MB solo de pesos).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos ~1-2 GB libres es suficiente. El loader soporta CUDA, MPS (Apple Silicon) y CPU.
- GPU de consumo: sí, cabe en tarjetas de gama baja y en Apple Silicon; el proceso de construcción se ejecutó en CPU/Mac sin GPU.
- Opciones de despliegue: `transformers` con el `phi_loader.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (6 textos) | MMLU acc | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| `v2 + cashback` (este repo) | 270M | no disponible | 90,59 | 24,93% | Apache 2.0 | Hugging Face |
| `phi-lattice v2` (solo flujo base) | 270M | no disponible | 161,27 | 25,94% | Apache 2.0 | Hugging Face |
| `Q4_K_M` de llama.cpp (~4,5 bpw) | 270M | no disponible | 99,30 | 24,88% | Apache 2.0 (base) | Hugging Face / llama.cpp |
| BF16 `unsloth/gemma-3-270m-it` | 270M | no disponible | 90,82 | 25,08% | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes de cuantización del mismo modelo base, ya que no se proporcionan datos de modelos alternativos de tamaño similar. En calidad, `v2 + cashback` iguala al BF16 en PPL y métricas de lm-eval, y supera a `Q4_K_M` en PPL (90,59 frente a 99,30) a costa de un mayor tamaño (~8,5 bpw frente a ~4,5 bpw).

## Limitaciones y advertencias

- El modelo base de 270M es intrínsecamente débil: MMLU ≈ azar y GSM8K ≈ ruido; no debe usarse para tareas que requieran razonamiento o conocimiento fiables.
- Riesgo de alucinación elevado, coherente con un modelo pequeño sin datos de entrenamiento documentados en este repositorio.
- No se especifican idiomas soportados ni longitud de contexto; no asumir capacidades multilingües ni ventanas largas.
- El checkpoint es un archivo `.pt` empaquetado que requiere el `phi_loader.py` del repositorio; no es directamente cargable con `AutoModelForCausalLM.from_pretrained` estándar.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar las condiciones del modelo base `unsloth/gemma-3-270m-it` y de Gemma 3 para uso comercial.
- Las métricas de lm-eval de la fila cashback se completaron con un runner local por tareas, no con una ejecución completa publicada; la comparación con `Q4_K_M` carece de lm-eval de Gemma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- El esquema está pensado para el segmento de calidad BF16 (~8,5 bpw), no para máxima compresión; si el objetivo es tamaño mínimo, `Q4_K_M` ocupa menos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-cashback
- Repositorio del flujo base v2: https://huggingface.co/unununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada.
