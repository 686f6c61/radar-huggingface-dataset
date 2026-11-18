# ununununununununununununununununununun/embeddinggemma-2-phi-lattice-v2-gecko

## Resumen

`embeddinggemma-2-phi-lattice-v2-gecko` es un archivo de pesos cuantizados a 4 bits del text tower de `google/embeddinggemma-2`, un modelo de embeddings de texto. Lo publica el usuario `ununununununununununununununununununun` en Hugging Face y aplica el esquema de cuantización propietario "phi-lattice v2" con el pase de bloques denominado Gecko (`block=64`, `alpha=0.5`). No es un modelo entrenado desde cero, sino un artefacto de compresión que preserva el comportamiento del modelo base en tareas de similitud semántica y recuperación.

El problema que aborda es el coste de almacenamiento y cómputo de los embeddings de alta dimensión: el modelo base en BF16 ocupa aproximadamente 1 GB, y esta versión empaqueta el text tower en un único archivo `.pt` de 4 bits. Según la model card, la cuantización afecta a 217 módulos lineales y convolucionales y mantiene una correlación coseno de 0,9826 con las direcciones BF16 de referencia en los embeddings de documentos de SciFact a 768 dimensiones.

Es relevante para desarrolladores que quieran desplegar búsqueda semántica o RAG con EmbeddingGemma en entornos con poca memoria, siempre que acepten la dependencia de una librería de carga no estándar (`phi_loader`) y una pérdida modesta de calidad frente al modelo original. La información pública es escasa: no hay datos de licencia coherentes, ni idiomas declarados, ni pipeline asignado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (text tower de EmbeddingGemma 2), cuantizado a 4 bits con esquema phi-lattice v2 y pase Gecko |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits empaquetado (archivo `.pt`), con carga en modo `unrolled_bf16` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 según el frontmatter de la model card; el campo de licencia del repo aparece como no disponible |
| Formato de pesos | `.pt` (archivo `embeddinggemma2_phi_gecko_v2_packed_4bit.pt`), no safetensors ni GGUF |
| Modelo base | `google/embeddinggemma-2` |
| Dimensiones de embedding (MRL) | 768, 512, 256, 128 |
| Modulos cuantizados | 217 lineales/convolucionales |
| SQNR (text tower) | 19,22 dB |
| sha256 del archivo | `f2074668c85e2129e14f632a11767ff486476807a83d23681da58639ab806732` |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: parte de `google/embeddinggemma-2` y aplica una cuantización post-entrenamiento de 4 bits sobre el text tower. El esquema phi-lattice v2 usa un codebook y un tamano de grupo comunes con la versión `embeddinggemma-2-phi-lattice-v2`, y el pase Gecko se define por `block=64` y `alpha=0.5`. Se cuantizaron 217 módulos lineales y convolucionales. La calibración se realizó con 12 textos, que la model card indica que se excluyeron de los conjuntos de test de STS y SciFact.

La innovación declarada es el uso de error feedback orientado a direcciones relevantes para la tarea: el autor senala que un SQNR ligeramente inferior (19,22 dB frente a 19,61 dB de la versión v2 plana) puede mejorar métricas downstream si el error se concentra fuera de las direcciones que importan para STS y SciFact. No se documentan detalles del dataset de entrenamiento original de EmbeddingGemma 2, ni si hubo RLHF/DPO, ni la composición del corpus.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa.
- Soporte de Matryoshka Representation Learning (MRL) con anchos de 768, 512, 256 y 128 dimensiones, lo que permite truncar el embedding y reducir coste de almacenamiento e índice.
- Recuperación de documentos científicos: evaluado en SciFact con nDCG@10 y Recall@10 a 768 dimensiones.
- Evaluación en STSBenchmark test (1.379 pares) con correlación Spearman.
- Carga en CPU mediante `phi_loader` con `device="cpu"` y `mode="unrolled_bf16"`.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking; es un modelo de feature extraction, no generativo.

## Casos de uso

- Búsqueda semántica en corpus científicos: el modelo mantiene un nDCG@10 de 0,8413 en SciFact a 768 dimensiones, por lo que es adecuado para indexar y recuperar artículos por similitud de significado en lugar de palabras clave.
- RAG con presupuesto de memoria ajustado: al empaquetar el text tower en 4 bits, permite montar la fase de embedding de un pipeline RAG en máquinas sin GPU dedicada, cargando el archivo con `phi_loader` en CPU.
- Deduplicación y clustering de documentos: los embeddings truncados a 256 o 128 dimensiones (con STS de 0,8692 y 0,8624 respectivamente) sirven para agrupar textos similares con índices más pequenos y rápidos.
- Sistemas de recomendación de contenido textual: la similitud coseno entre embeddings de artículos o descripciones permite ordenar candidatos por afinidad semántica.
- Moderación y detección de near-duplicates: la alta correlación coseno con BF16 (0,9826 en documentos SciFact) indica que las distancias se preservan lo suficiente para umbrales de similitud.
- Evaluación comparativa de esquemas de cuantización: el artefacto incluye métricas reproducibles (STS, SciFact, SQNR, coseno frente a BF16) y un script de benchmark (`examples/benchmark_embeddinggemma2_sts_scifact.py`), útil para investigadores que comparen métodos de compresión de embeddings.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre STSBenchmark test y SciFact test, con MRL a 768/512/256/128 dimensiones:

| Metodo | SQNR | STS 768 | STS 512 | STS 256 | STS 128 | SciFact nDCG@10 768 | Recall@10 768 | Coseno docs 768 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline BF16 | ref | 0,8743 | 0,8749 | 0,8733 | 0,8682 | 0,8569 | 0,9403 | 1,0000 |
| phi-lattice-v2 | 19,61 dB | 0,8668 | 0,8679 | 0,8672 | 0,8595 | 0,8388 | 0,9303 | 0,9828 |
| phi-lattice-v2-gecko (este repo) | 19,22 dB | 0,8687 | 0,8699 | 0,8692 | 0,8624 | 0,8413 | 0,9303 | 0,9826 |

El autor indica que Gecko mejora +0,0019 en STS @768 y +0,0025 en SciFact nDCG@10 @768 frente a phi-lattice-v2 plana, y queda -0,0157 en SciFact frente a BF16. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,0 GB y la carga se documenta en CPU (`device="cpu"`), por lo que no requiere GPU.
- GPU recomendadas: no disponibles; al ser un text tower de embeddings cuantizado a 4 bits, debería caber en cualquier GPU consumer moderna, pero no se aportan cifras.
- Cabe en GPU consumer: previsiblemente sí, aunque no se confirma en la información disponible.
- Opciones de despliegue: carga mediante `phi_loader.load_embeddinggemma2_from_packed_4bit` con `mode="unrolled_bf16"` y `text_only=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es estándar para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | STS 768 | SciFact nDCG@10 768 | Licencia | Formato |
|---|---|---|---|---|---|---|
| embeddinggemma-2-phi-lattice-v2-gecko | no disponible | no disponible | 0,8687 | 0,8413 | apache-2.0 (frontmatter) | `.pt` 4 bits |
| embeddinggemma-2-phi-lattice-v2 | no disponible | no disponible | 0,8668 | 0,8388 | no disponible | `.pt` 4 bits |
| google/embeddinggemma-2 (BF16) | no disponible | no disponible | 0,8743 | 0,8569 | no disponible | safetensors (presumiblemente) |

No se dispone de datos de otros modelos de embeddings comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia es ambigua: el frontmatter de la model card declara apache-2.0, pero el campo de licencia del repositorio aparece como "no disponible". Conviene verificar antes de uso comercial.
- No se declaran idiomas soportados; se desconoce la cobertura multilingüe real.
- El artefacto requiere la librería `phi_loader` y un formato `.pt` no estándar, lo que limita la portabilidad frente a safetensors o GGUF.
- Pérdida medible frente a BF16: -0,0056 en STS @768 y -0,0157 en SciFact nDCG@10 @768. No es adecuado si se necesita paridad exacta con el modelo original.
- El SQNR de 19,22 dB es inferior al de la versión v2 plana (19,61 dB); la mejora downstream depende de la tarea evaluada y no está garantizada en otros dominios.
- La calibración se hizo con solo 12 textos, un conjunto muy pequeno que puede no representar dominios distintos de STS/SciFact.
- Riesgo de alucinación: no aplica directamente al ser un modelo de embeddings, pero los sistemas RAG que lo usen heredan el riesgo de recuperar documentos irrelevantes si la similitud se degrada.
- No hay datos de contexto máximo, por lo que no se puede garantizar el comportamiento con documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/embeddinggemma-2-phi-lattice-v2-gecko
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Versión v2 plana: https://huggingface.co/ununununununununununununununununununun/embeddinggemma-2-phi-lattice-v2
- Script de benchmark citado: `examples/benchmark_embeddinggemma2_sts_scifact.py` (ruta interna, no se proporciona URL)
- Resultados completos citados: `evals/embeddinggemma2_base_v2_gecko_sts_scifact.json` (ruta interna, no se proporciona URL)
