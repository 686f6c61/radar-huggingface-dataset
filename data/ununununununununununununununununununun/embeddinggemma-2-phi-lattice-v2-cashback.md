# ununununununununununununununununununun/embeddinggemma-2-phi-lattice-v2-cashback

## Resumen

embeddinggemma-2-phi-lattice-v2-cashback es un artefacto de pesos cuantizados publicado por el usuario `ununununununununununununununununununun` sobre el modelo base `google/embeddinggemma-2`. No es un modelo nuevo entrenado desde cero, sino una reempaquetación en 4 bits del text tower de un modelo de embeddings, usando un esquema propietario denominado "phi-lattice" con un segundo flujo de residuo ("cashback") que corrige el error de la primera pasada de cuantización. El objetivo es reducir el espacio en disco y memoria manteniendo la calidad de recuperación (retrieval) del modelo en BF16.

La innovación principal es el formato de dos flujos: se descomprime el archivo `v2` publicado (4 bits, sin calibración), se calcula el residuo exacto `R = W_bf16 − W_v2`, se cuantiza ese residuo con el mismo codebook phi-lattice de 15 niveles y, en tiempo de carga, se suman ambos flujos (`W_out = W_v2 + R_q`). El resultado son aproximadamente 8 bits por peso en las capas lineales, con un SQNR que sube de 19,60 dB a 39,21 dB.

La relevancia es doble: por un lado demuestra que la cuantización data-free puede igualar a BF16 en un modelo de embeddings (STS-768 de 0,8745 frente a 0,8743 del original); por otro, el autor extiende el método al par `embed_tokens / lm_head` de Qwen3-4B, un caso notoriamente sensible a la cuantización. El repo ocupa 1,4 GB y la licencia es Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (text tower de `google/embeddinggemma-2`), pesos empaquetados en formato phi-lattice de dos flujos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las evaluaciones usan `max_length=512`) |
| Tipos de cuantizacion | 4 bits por flujo (dos flujos ≈ 8 bpw en capas lineales); codebook phi-lattice de 15 niveles, `group_size=64`, `include_zero=True`, escalas por grupo en fp16 |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | archivo `.pt` empaquetado (`embeddinggemma2_phi_v2_cashback_packed_4bit.pt`, 659,5 MiB) cargado con un loader propio (`phi_loader_cashback`); sin GGUF ni safetensors estándar |

## Arquitectura y entrenamiento

El modelo subyacente es `google/embeddinggemma-2`, un modelo de embeddings de la familia Gemma. Sobre él, este repositorio no aplica entrenamiento adicional ni fine-tuning: es un proceso de compresión post-hoc puramente aritmético. El pipeline consiste en descomprimir el archivo `v2` publicado (que contiene valores exactos del lattice), calcular el residuo exacto respecto a los pesos BF16 originales, cuantizar ese residuo con el mismo codebook de 15 niveles y escalas por grupo de 64 elementos, y sumar ambos flujos al cargar. No hay corpus de calibración, por lo que el autor argumenta que el formato no introduce sesgo de dominio.

El archivo contiene 217 capas del text tower y se ha verificado con un roundtrip independiente del loader con un SQNR entre 39,14 y 39,31 dB. El `sha256` del archivo es `a8349fd806ac1369f086d363c5825602ed9a74d404171b43d94cbe85939e8245`. El loader comprueba que no haya claves inesperadas ni claves faltantes fuera de las ramas de visión y audio. No se documentan datos de entrenamiento, número de tokens, RLHF/DPO ni innovaciones de decodificación, porque no hay entrenamiento implicado.

## Capacidades

- Generación de embeddings de texto para tareas de recuperación y similitud semántica, heredadas del text tower de `embeddinggemma-2`.
- Soporte de Matryoshka Representation Learning (MRL): el autor evalúa anchos de 768 y 128 dimensiones, lo que permite truncar el vector de embedding.
- Recuperación densa (dense retrieval) sobre corpus documentales, evaluada con SciFact (300 consultas, 5.183 documentos).
- Evaluación de similitud semántica de pares de frases, evaluada con STS-B (1.379 pares).
- Cuantización data-free: no requiere corpus de calibración para producir los pesos comprimidos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible; el artefacto se limita al text tower.
- El método se ha aplicado también, como confirmación cruzada, al par `embed_tokens / lm_head` de Qwen3-4B, lo que sugiere que el esquema es portable a otras arquitecturas.

## Casos de uso

- Búsqueda semántica en producción con presupuesto de memoria ajustado: el archivo de 659,5 MiB frente a ~1 GB en BF16 permite desplegar el modelo de embeddings en instancias con menos RAM, manteniendo un STS-768 de 0,8745, prácticamente idéntico al BF16 (0,8743).
- Recuperación aumentada (RAG) sobre documentación técnica: con nDCG@10-768 de 0,8552 y MRL a 128 dimensiones (nDCG 0,7961), se puede indexar un corpus grande con vectores cortos y reducir el coste de almacenamiento del índice vectorial.
- Sistemas de búsqueda en dispositivos con recursos limitados: al no requerir calibración y caber en CPU (el ejemplo de uso del autor carga en `device="cpu"` con `dtype=torch.bfloat16`), es viable en entornos sin GPU dedicada.
- Deduplicación y clustering de documentos: la similitud semántica preservada a 128 dimensiones permite agrupar textos con un coste de comparación mucho menor que usando vectores de 768.
- Compresión de matrices de embeddings en modelos generativos: el resultado cruzado en Qwen3-4B (embed de 741,9 a 394,1 MiB, PPL 7,370 frente a 7,395, MMLU 68,92% frente a 69,02%) valida el método para reducir el peso de `embed_tokens / lm_head` en despliegues de LLM.
- Investigación en cuantización: sirve como referencia reproducible de un esquema data-free con dos flujos y codebook de lattice, útil para comparar con alternativas calibradas como `gecko` block64 α=0,5.
- Evaluación de pipelines de retrieval sensibles al sesgo de calibración: al no usar corpus de calibración, es un candidato para dominios donde una calibración mal elegida introduciría deriva.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el text tower de `embeddinggemma-2` (protocolo STS-B test, 1.379 pares; SciFact, 300 consultas / 5.183 documentos; `max_length=512`):

| Variante | STS-768 | STS-128 | nDCG@10-768 | nDCG-128 | SQNR |
|---|---:|---:|---:|---:|---:|
| BF16 referencia (publicado) | 0,8743 | — | 0,8569 | — | — |
| `phi-lattice v2` (publicado) | 0,8670 | 0,8598 | 0,8398 | 0,7724 | 19,60 dB |
| `v2 + cashback` (este repo) | 0,8745 | 0,8686 | 0,8552 | 0,7961 | 39,21 dB |
| `gecko` block64 α=0,5 (referencia) | 0,8681 | 0,8620 | 0,8316 | 0,7676 | — |

Confirmación cruzada sobre `embed_tokens / lm_head` de Qwen3-4B (matriz `151.936 × 2.560`, 741,9 MiB en BF16), en NVIDIA L4:

| Variante del embed | Tamano embed | Archivo total proyectado | SQNR embed | PPL (6 textos, CUDA) | MMLU (acc, 14.042 items) |
|---|---:|---:|---:|---:|---:|
| BF16 embed (`v2-gecko` publicado) | 741,9 MiB | 2.583,2 MiB | — | 7,3951 | 69,02% ± 0,36% |
| 1 flujo 4 bits (`phi-lattice`) | 197,1 MiB | 2.038,4 MiB | 19,68 dB | 7,7119 | — |
| 2 flujos cashback (4 bits + residuo 4 bits) | 394,1 MiB | 2.235,5 MiB | 39,28 dB | 7,3700 | 68,92% ± 0,37% |

El archivo total de Qwen3-4B con cashback queda en 2.235,5 MiB, un 3,43× más pequeño que BF16 y 146 MiB menor que el GGUF Q4_K_M estándar de llama.cpp (2.381,6 MiB).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo empaquetado ocupa 659,5 MiB; al descomprimir en BF16 en memoria, el consumo se aproxima al del modelo base completo (no disponible el dato exacto de parámetros).
- GPU recomendadas: no se especifican en la información disponible; las evaluaciones del autor se ejecutan en CPU (`device="cpu"`) para el text tower y en NVIDIA L4 para el experimento con Qwen3-4B.
- GPU de consumo: no hay datos publicados sobre RTX 4090 u otras tarjetas consumer; el tamaño del archivo sugiere que cabría en GPUs con 8 GB o más, pero es una estimación no confirmada por el autor.
- Opciones de despliegue: solo loaders PyTorch propios (`phi_loader_cashback`); el autor indica explícitamente que no hay empaquetado GGUF ni Ollama. No se menciona compatibilidad con vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / variante | Parametros | Contexto | Calidad retrieval | Licencia | Formato |
|---|---|---|---|---|---|
| `embeddinggemma-2` BF16 (base) | no disponible | no disponible | STS-768 0,8743; nDCG@10-768 0,8569 | gemma | safetensors (presumible) |
| `phi-lattice v2` (1 flujo, 4 bits) | no disponible | no disponible | STS-768 0,8670; nDCG@10-768 0,8398 | gemma | `.pt` empaquetado |
| `v2 + cashback` (este repo) | no disponible | no disponible | STS-768 0,8745; nDCG@10-768 0,8552 | gemma | `.pt` empaquetado |
| `gecko` block64 α=0,5 | no disponible | no disponible | STS-768 0,8681; nDCG@10-768 0,8316 | no disponible | no disponible |

La comparativa se limita a variantes del mismo modelo base porque el autor no proporciona comparaciones con otros modelos de embeddings de terceros.

## Limitaciones y advertencias

- El formato de dos flujos supone aproximadamente 8 bits por peso en las capas lineales: es la variante de alta fidelidad, no la de máxima compresión. Para máximo ahorro, el autor remite al `v2` o `v2-gecko` de un solo flujo.
- Solo hay loaders PyTorch; no existe empaquetado GGUF ni Ollama, lo que limita el despliegue con herramientas estándar como llama.cpp o vLLM.
- El modelo base es `embeddinggemma-2` y hereda la licencia Gemma, con las restricciones de uso comercial que esta impone; conviene revisar los términos antes de un despliegue en producción.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específicos de este artefacto; al ser un modelo de embeddings, el riesgo de alucinación no aplica del mismo modo que en un modelo generativo, pero la calidad de recuperación depende del dominio.
- El autor no documenta el número de parámetros, la longitud de contexto nativa ni el rendimiento en GPUs consumer; los datos de evaluación se limitan a STS-B y SciFact con `max_length=512`.
- El repositorio tiene 0 descargas y 0 likes, y el nombre de usuario no ofrece garantías de mantenimiento; es un artefacto de investigación, no un modelo con soporte de producción.
- El método se valida en el text tower; no se documenta el comportamiento en las ramas de visión o audio del modelo base, y el loader solo comprueba la ausencia de claves faltantes en esas ramas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ununununununununununununununununununun/embeddinggemma-2-phi-lattice-v2-cashback
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio de referencia Qwen3-4B phi-lattice v2-gecko: https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2-gecko
- Log de evaluación del experimento cashback en Qwen3-4B: https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-q4km-bench/blob/main/evals/cashback_embed_qwen4b.json
