# tahamajs/qwen-2.5-0.5b-alibi-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-alibi-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs, consistente en un transplante de mecanismo de atención sobre el modelo base Qwen2.5-0.5B. Concretamente, se sustituye la atención original por una variante ALiBi (Attention with Linear Biases) mediante un patrón de cirugía denominado `hybrid_3_1`, y posteriormente se realiza un proceso de destilación (KD, knowledge distillation) sobre el dataset WikiText-2 durante 62 segundos en una NVIDIA RTX 3090.

El resultado reportado por el autor es un fracaso técnico: la perplejidad causal previa a la destilación era de 8399.25 y la posterior es infinita, con un delta de `+inf`. Es decir, el modelo no es funcional para generación de texto. El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes, lo que sugiere que los pesos no están publicados o el repositorio está vacío.

Este artefacto es relevante únicamente como referencia de experimentos fallidos de modificación arquitectónica y como ejemplo de model card que documenta resultados negativos. No debe considerarse un modelo utilizable en producción ni en investigación aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5-0.5B con atención ALiBi transplantada (patrón `hybrid_3_1`) |
| Parametros totales | 0.5B (heredados del modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de aproximadamente 500 millones de parámetros. Sobre esa base se aplica una "cirugía" que reemplaza el mecanismo de atención por una implementación ALiBi registrada en un `ATTENTION_REGISTRY`, siguiendo un patrón híbrido `hybrid_3_1` (probablemente una proporción de capas con atención ALiBi frente a atención original, aunque el autor no detalla la semántica exacta del patrón).

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`) durante 62 segundos en una RTX 3090. No se especifican hiperparámetros, número de tokens, composición del dataset más allá de WikiText-2, ni si hubo RLHF o DPO. Los resultados reportados son perplejidad causal pre-KD de 8399.25 y post-KD infinita, lo que indica que el proceso de destilación divergió o produjo pesos numéricamente inválidos. No se documenta ninguna innovación técnica funcional.

## Capacidades

- No se ha demostrado ninguna capacidad funcional: la perplejidad post-entrenamiento es infinita.
- Generación de texto: no operativa según los datos del autor.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Estudio de casos de fallo en modificación de arquitecturas: el modelo sirve como ejemplo documentado de transplante de atención ALiBi que diverge durante la destilación, útil para investigadores que quieran evitar el mismo patrón `hybrid_3_1` o revisar la metodología de cirugía.
- Referencia para evaluación de perplejidad: los valores pre-KD (8399.25) y post-KD (inf) permiten comparar con otros experimentos de sustitución de atención y calibrar expectativas sobre la estabilidad del proceso.
- Reproducción de experimentos de destilación rápida: el tiempo de 62 segundos en RTX 3090 sobre WikiText-2 puede servir como línea base de coste computacional para experimentos similares.
- Docencia sobre model cards: la ficha es un ejemplo de documentación de resultados negativos, útil para enseñar buenas prácticas de transparencia en publicación de experimentos.
- Auditoría de repositorios vacíos: el tamaño de 0.0 GB y la ausencia de pesos permiten estudiar casos de repositorios que no deberían consumirse como modelos.
- No se recomienda ningún caso de uso en producción, investigación aplicada ni evaluación comparativa de capacidades, dado que el modelo no es funcional.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Perplejidad causal pre-KD (WikiText-2) | 8399.25 |
| Perplejidad causal post-KD (WikiText-2) | inf |
| Delta de perplejidad | +inf |
| Tiempo de destilación | 62.0 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que los pesos no están publicados (repo de 0.0 GB). Para un modelo de 0.5B en FP16 se requerirían aproximadamente 1 GB, pero no se puede confirmar su disponibilidad.
- GPU recomendadas: la única referencia es la NVIDIA RTX 3090 empleada para la destilación de 62 segundos; no hay datos de inferencia.
- Cabe en GPU de consumo: teóricamente sí para un modelo de 0.5B, pero no hay pesos que cargar.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-alibi-wikitext2 | 0.5B | no disponible | PPL post-KD infinita | no disponible | Repo 0.0 GB, sin pesos |
| Qwen2.5-0.5B (base) | 0.5B | 32 768 tokens (según documentación oficial de Qwen) | Funcional | Apache 2.0 (según Qwen) | Disponible en Hugging Face |
| Qwen2.5-1.5B | 1.5B | 32 768 tokens (según documentación oficial de Qwen) | Funcional | Apache 2.0 (según Qwen) | Disponible en Hugging Face |
| SmolLM2-360M | 0.36B | 8 192 tokens (según documentación de HuggingFace) | Funcional | Apache 2.0 (según HuggingFace) | Disponible en Hugging Face |

La comparativa se limita a modelos de tamaño similar; el artefacto analizado no es funcional y no compite en rendimiento con ninguno de ellos.

## Limitaciones y advertencias

- El modelo no es funcional: la perplejidad post-destilación es infinita, lo que indica pesos inválidos o divergencia numérica.
- El repositorio tiene un tamaño de 0.0 GB, por lo que probablemente no contiene pesos descargables.
- No se especifica licencia, lo que impide determinar restricciones de uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma porque no hay modelo operativo que evaluar.
- El patrón de cirugía `hybrid_3_1` no está descrito en detalle, lo que dificulta la reproducibilidad.
- No se proporcionan hiperparámetros de destilación, datos de entrenamiento completos ni configuración de hardware más allá de la GPU y el tiempo.
- No debe usarse en producción, investigación aplicada ni como base para fine-tuning sin antes verificar la integridad de los pesos (inexistentes según el tamaño del repo).
- La fecha de creación (2026-11-09) es futura respecto a la fecha típica de publicación, lo que puede indicar un artefacto de prueba o un error de metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-alibi-wikitext2
- Modelo base referenciado: `/dev/shm/Qwen2.5-0.5B` (ruta local, no enlace público)
- Dataset referenciado: WikiText-2 (`wikitext-2-raw-v1`), disponible en Hugging Face Datasets
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
