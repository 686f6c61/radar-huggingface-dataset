# tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs. Consiste en un transplante de atención sobre el modelo base Qwen2.5-0.5B: se sustituye el mecanismo de atención estándar por una variante denominada `delta_product_attention`, registrada en el sistema `NeuralOps ATTENTION_REGISTRY` del autor. El modelo se ha sometido a un proceso de destilación de conocimiento (KD) sobre el dataset WikiText-2 con un patrón de cirugía arquitectónica etiquetado como `hybrid_3_1`.

El interés de esta ficha es limitado desde el punto de vista de producción: la model card reporta una perplejidad causal de `inf` tanto antes como después de la destilación, con un delta de `+nan`. Es decir, el autor documenta explícitamente que el modelo no converge ni produce una perplejidad finita sobre el conjunto de evaluación. Se trata, por tanto, de un artefacto de experimentación arquitectónica, no de un modelo utilizable.

No hay información sobre licencia, idiomas soportados ni pipeline declarado. El repositorio ocupa 1,2 GB y contiene pesos en formato safetensors con 533.525.884 parámetros totales, coherentes con la arquitectura Qwen2.5-0.5B (transformer decoder-only con atención de múltiples cabezas y sesgo QKV).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención sustituida por `delta_product_attention` (patrón `hybrid_3_1`) |
| Parametros totales | 533.525.884 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar. Sobre esa base, el autor aplica una "cirugía" que reemplaza los módulos de atención por una implementación propia llamada `delta_product_attention`, registrada en un `ATTENTION_REGISTRY` del framework NeuralOps. El patrón `hybrid_3_1` sugiere una combinación de capas con atención estándar y capas con la nueva atención en una proporción 3:1, aunque la model card no detalla el criterio exacto de asignación por capa.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA RTX 3090 en 201 segundos. No se especifica el número de tokens, la composición del dataset más allá del corpus de WikiText-2, ni si hubo RLHF o DPO. La métrica clave reportada es la perplejidad causal: `inf` antes de la destilación y `inf` después, con delta `+nan`. Esto indica que la sustitución de atención rompe el modelo y la destilación no logra recuperar un comportamiento numéricamente estable.

## Capacidades

- No se han documentado capacidades funcionales en la model card.
- El modelo reporta perplejidad infinita en la evaluación causal sobre WikiText-2, por lo que no se puede afirmar que genere texto coherente.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el artefacto sirve como referencia de un intento de sustitución de atención (`delta_product_attention`) sobre un transformer estándar, útil para estudiar por qué la perplejidad diverge.
- Reproducción de experimentos de cirugía arquitectónica: el patrón `hybrid_3_1` y el pipeline de destilación en 201 s sobre una RTX 3090 permiten replicar el setup con bajo coste computacional.
- Estudio de fallos de convergencia: la perplejidad `inf` y el delta `+nan` son un caso documentado de inestabilidad numérica tras un transplante de atención, útil como contraejemplo en literatura de modificación de arquitecturas.
- Benchmarking de frameworks de atención: comparar la implementación `delta_product_attention` de NeuralOps con atención estándar en términos de estabilidad numérica y coste de entrenamiento.
- Docencia sobre destilación de conocimiento: ilustra un caso donde la KD no rescata un modelo cuya arquitectura ha sido alterada de forma incompatible.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea de inferencia real, dado que no hay evidencia de salidas válidas.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Perplejidad causal pre-KD (WikiText-2) | inf |
| Perplejidad causal post-KD (WikiText-2) | inf |
| Delta de perplejidad | +nan |
| Tiempo de destilación | 201,0 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (533,5 M de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 2,1 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para fp16; el entrenamiento reportado se hizo en una RTX 3090.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: no se documentan; al ser un modelo Qwen2 con atención modificada, es probable que requiera código personalizado de NeuralOps y no funcione directamente en vLLM, llama.cpp, Ollama o TGI sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2 | 533,5 M | no disponible | no disponible | Experimental, PPL inf |
| Qwen2.5-0.5B (base) | 494 M aprox. | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Producción |
| Qwen2.5-0.5B-Instruct | 494 M aprox. | 32.768 tokens | Apache 2.0 | Producción, ajustado a instrucciones |

La comparación directa es desfavorable: el modelo base Qwen2.5-0.5B es funcional y está disponible con licencia Apache 2.0, mientras que esta variante no reporta perplejidad finita ni licencia. No se dispone de alternativas con `delta_product_attention` para comparar.

## Limitaciones y advertencias

- Perplejidad causal infinita (`inf`) antes y después de la destilación: el modelo no produce distribuciones de probabilidad estables sobre WikiText-2.
- Delta de perplejidad `+nan`: indica inestabilidad numérica en el proceso de evaluación o entrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial permitido.
- Sin idiomas declarados: no hay garantía de comportamiento multilingüe.
- Sin pipeline declarado: no se puede cargar directamente con `pipeline()` de Transformers sin verificar compatibilidad.
- Requiere código personalizado de NeuralOps (`ATTENTION_REGISTRY`) para reconstruir la arquitectura; los pesos safetensors por sí solos probablemente no son cargables con `AutoModelForCausalLM` estándar.
- Riesgo alto de alucinación y salidas incoherentes si se intenta usar en inferencia.
- Sin datos de sesgos: no se ha evaluado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, no enlace público)
- Dataset: WikiText-2 (`wikitext-2-raw-v1`), disponible en Hugging Face Datasets
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
