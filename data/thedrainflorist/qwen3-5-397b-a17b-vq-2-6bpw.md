# TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.6bpw

## Resumen

El modelo `TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.6bpw` es una cuantización vectorial (vector quantization, VQ) del modelo multimodal `Qwen/Qwen3.5-397B-A17B`, optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX. El modelo base, desarrollado por Alibaba, es un MoE híbrido de 397 mil millones de parámetros totales y 17 mil millones activos, que combina atención lineal (gated delta networks) con un sparse mixture-of-experts y capacidades nativas de visión-lenguaje. Este artefacto en concreto reduce los pesos a una media de 2,6 bits por peso en la región de expertos, lo que permite alojar un modelo de esta escala en máquinas con 192 GB o más de memoria unificada.

La relevancia de esta ficha radica en que representa un enfoque distinto a la cuantización escalar clásica: en lugar de redondear cada peso a niveles discretos fijos, se aprende un codebook de patrones conjuntos de 4 pesos, con un índice de 9 bits por grupo y una escala fp16 por fila. Según las mediciones del autor, este método consigue una perplexity en wikitext un 19,5 % mejor que una cuantización escalar 2.6-bit comparable, al mismo tamaño aproximado en disco. El repositorio incluye la torre de visión completa en bf16 y un runtime VQ embebido en el checkpoint, de modo que funciona con `mlx-lm` sin parches.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (gated delta networks + linear attention) con cuantización vectorial; modelo base Qwen3.5-397B-A17B |
| Parametros totales | 397 000 millones (modelo base); 36 456 997 184 tensores almacenados en safetensors tras cuantización |
| Parametros activos | 17 000 millones (modelo base) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | VQ 2.6 bpw (2,5 bits por peso en la región de expertos, con sub-byte packing en uint32) |
| Idiomas soportados | en (según la model card); el modelo base es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) con `model.py` embebido para el runtime VQ |

Nota: la cifra de parámetros en safetensors (36 456 997 184) corresponde al número de tensores almacenados tras la cuantización, no al número de parámetros del modelo original (397 B). El tamaño del repositorio es de 131,3 GB (122,3 GiB en disco, incluyendo la torre de visión en bf16).

## Arquitectura y entrenamiento

El modelo base `Qwen3.5-397B-A17B` es un MoE híbrido que combina atención lineal (gated delta networks) con un sparse mixture-of-experts, diseñado para alta eficiencia en inferencia y con capacidades nativas de visión-lenguaje. El autor de este artefacto ha aplicado una cuantización vectorial sobre el checkpoint original, sin reentrenamiento ni calibración: los codebooks se ajustan mediante k-means en el espacio puro de pesos, sin estadísticas de activaciones ni corpus de calibración.

La estrategia de cuantización es de precisión mixta por sensibilidad de capa. Atención, routers MoE, embeddings y la cabeza de salida se mantienen a mayor precisión, ya que los errores en estas capas se propagan a cada token. Los expertos, que representan aproximadamente el 85 % del modelo, absorben la cuantización agresiva: cada subvector de 4 pesos se codifica con un índice de 9 bits en un codebook de 512 entradas fp16 por tensor, más una escala fp16 por fila de 64 pesos. Esto supone 2,5 bits por peso en la región de expertos. Los códigos se empaquetan en palabras uint32 (bloques de 32 códigos por fila) para lograr un tamaño no alineado a byte.

El ajuste no usa semilla, por lo que el artefacto es reproducible en receta y geometría pero no bit a bit. El runtime VQ se incluye dentro del checkpoint como `model.py` y se ejecuta con kernels Metal JIT compilados vía `mx.fast.metal_kernel`, sin necesidad de parches ni forks.

## Capacidades

- Generación de texto y conversación de larga duración, heredadas del modelo base.
- Razonamiento complejo y multi-paso (el modelo es de tipo "reasoning"; se recomienda un `max-tokens` generoso para no truncar la respuesta visible).
- Capacidades de visión-lenguaje: la torre de visión completa (333 tensores, 0,849 GiB) se incluye en este artefacto en bf16.
- Soporte de tool calling y agentes: no documentado en la model card de este cuantizado, pero el modelo base `Qwen3.5-397B-A17B` lo soporta; el autor no lo menciona en el README.
- Multilingüismo: la card declara solo `en`, aunque el modelo base es multilingüe.
- Capacidades especiales: cuantización vectorial sub-byte (2,5 bits por peso en expertos) con codebooks ajustados en espacio de pesos, sin calibración.

## Casos de uso

- Inferencia local de un modelo de 397B en un Mac con 192 GB o más de memoria unificada: es el caso de uso principal, ya que el modelo se ha diseñado para Apple Silicon y se ejecuta con `mlx-lm` sin parches.
- Clústeres de Apple Silicon con exo: se ha verificado un anillo de 2 nodos (96 GB + 128 GB por Thunderbolt) que coloca y sirve el modelo en 99 segundos, con generación coherente de 800 tokens y respuestas correctas en pruebas de conocimiento. Requiere replicar los codebooks VQ en lugar de dividirlos (PR #2268 de exo).
- Investigación sobre compresión y cuantización de modelos: la metodología VQ con codebooks de 512 entradas y sub-byte packing es un caso de estudio de cómo reducir modelos MoE a menos de 3 bits por peso manteniendo calidad.
- Evaluación comparativa de técnicas de cuantización: los datos de perplexity wikitext y code publicados permiten comparar VQ frente a cuantización escalar al mismo tamaño.
- Desarrollo de aplicaciones de generación de texto y razonamiento en entornos Apple Silicon sin acceso a GPU de centro de datos, siempre que se disponga de la memoria unificada requerida.
- Despliegue en producción con Apache-2.0: la licencia permite uso comercial sin restricciones de atribución, lo que facilita integrar el modelo en productos.

## Benchmarks y rendimiento

El autor publica resultados medidos sobre este artefacto exacto, con `mlx-lm` sin modificar, en los mismos corpus y con el mismo harness que los comparadores:

| Métrica | Este modelo (122,3 GiB) | spicyneuron 2.6bit (120,6 GiB) | Diferencia |
|---|---|---|---|
| Perplexity wikitext (raw, prefix-8192) | **2,5634** | 3,1843 | 19,5 % mejor |
| Perplexity código (multilingüe) | **2,6123** | 2,6667 | 2,0 % mejor |

El margen en prosa es 24 veces mayor que el ruido medido entre ajustes, y el de código 3,1 veces. El ruido se midió con un codebook de 256 entradas, no de 512, por lo que el autor recomienda tratar el factor 24x como "claramente real" más que como una cifra precisa. No se publican resultados de benchmarks tipo MMLU, GSM8K o HumanEval en la información disponible.

## Requisitos de hardware

- Memoria: no cabe en una máquina de 128 GB. Se requiere un único Apple Silicon con ≥ 192 GB de memoria unificada, o un clúster exo de 2 nodos (verificado con 96 GB y 128 GB por Thunderbolt).
- GPU recomendadas: no aplica a GPU NVIDIA; el modelo está diseñado para Apple Silicon (M-series) con MLX. No se indican modelos concretos de chip.
- Despliegue: `mlx-lm` (pip install mlx-lm) y exo para clústeres. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no se publican cifras de tokens por segundo; el autor mide colocación y corrección, no rendimiento.

## Comparativa con modelos similares

| Modelo | Tamaño en disco | Perplexity wikitext | Perplexity código | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B-VQ-2.6bpw (este) | 122,3 GiB (131,3 GB repo) | 2,5634 | 2,6123 | Apache-2.0 | Hugging Face |
| spicyneuron 2.6bit (cuantización escalar del mismo modelo base) | 120,6 GiB | 3,1843 | 2,6667 | Apache-2.0 | Hugging Face |
| Qwen3.5-397B-A17B (FP8 oficial, para vLLM) | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face |

La comparativa con el FP8 oficial no es directa: el FP8 está orientado a servir con vLLM en GPUs de centro de datos, mientras que este artefacto es para Apple Silicon. El autor también menciona otras rungs del mismo proyecto (VQ-2.4bpw y VQ-3bpw) pero no publica datos comparativos de esos en la información disponible.

## Limitaciones y advertencias

- No cabe en una máquina de 128 GB: requiere 192 GB o más, o un clúster exo con replicación de codebooks (PR #2268 aún sin fusionar; hay que usar la rama `vq-codebook-replicate` de `noahzelezny/exo`).
- El ajuste no está sembrado: k-means usa una submuestra sin semilla, por lo que el artefacto no es reproducible bit a bit. Los márgenes citados se comparan contra un ruido medido a un tamaño de codebook de 256, no de 512.
- El ruido de ajuste puede ser mayor de lo estimado; el autor indica que las medidas de ruido han tendido a ampliarse con mediciones más cuidadosas.
- Solo se declara el idioma `en` en la card, aunque el modelo base es multilingüe; no se garantiza el rendimiento en otros idiomas.
- No se publican cifras de throughput ni de latencia; el autor advierte que un número no medido es peor que ninguno.
- Riesgo de alucinación y sesgos no documentados: no hay evaluación de sesgos en la información proporcionada.
- No se ha verificado en un solo nodo; cualquier re-verificación debe hacerse en un anillo de 2 nodos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.6bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Variante VQ-2.4bpw del mismo autor: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.4bpw
- Documentación del modelo base en Alibaba Cloud: https://www.alibabacloud.com/help/en/model-studio/qwen3-5-397b-a17b
- Receta vLLM para Qwen3.5-397B-A17B: https://recipes.vllm.ai/Qwen/Qwen3.5-397B-A17B
- PR de exo para replicar codebooks: https://github.com/exo-explore/exo/pull/2268
- Rama de exo con replicación de codebooks: https://github.com/noahzelezny/exo/tree/vq-codebook-replicate
