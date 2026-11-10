# tahamajs/qwen-2.5-0.5b-hamming-attention-wikitext2

## Resumen

Qwen-2.5-0.5B con atención Hamming es un experimento de investigación publicado por el usuario tahamajs en Hugging Face. Se trata de una intervención quirúrgica sobre el modelo base Qwen2.5-0.5B de Alibaba, en la que se sustituye parte del mecanismo de atención estándar por una implementación denominada `hamming_attention`, registrada en lo que el autor llama `ATTENTION_REGISTRY` bajo el paraguas de "NeuralOps". El objetivo declarado es evaluar si un mecanismo de atención alternativo puede funcionar tras un proceso de destilación de conocimiento sobre el corpus WikiText-2.

El modelo conserva la arquitectura transformer densa de Qwen2.5-0.5B, con 535.364.728 parámetros totales según los pesos en safetensors, y un tamaño de repositorio de 1,3 GB. La intervención se aplica con un patrón denominado `hybrid_3_1`, que presumiblemente combina capas con atención Hamming y capas con atención estándar en una proporción 3:1, aunque el autor no detalla la implementación interna.

La relevancia de esta ficha es limitada en términos de producción: se trata de un artefacto de investigación sin model card completa, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks más allá de la perplejidad reportada. El dato más llamativo es la reducción de perplejidad causal tras la destilación, de 392424,85 a 144,38, lo que indica que el transplante de atención deja el modelo prácticamente inutilizable hasta que se reentrena con destilación sobre WikiText-2. El proceso de destilación se completó en 180,2 segundos sobre una NVIDIA RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) con atención Hamming híbrida (`hybrid_3_1`) |
| Parametros totales | 535.364.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso con atención causal estándar. La modificación consiste en transplantar un mecanismo de atención denominado `hamming_attention` desde el registro interno `ATTENTION_REGISTRY` del autor, aplicando un patrón `hybrid_3_1`. El autor no especifica en la model card en qué consiste exactamente la atención Hamming ni cómo se combina con la atención original, más allá del nombre del patrón.

El entrenamiento reportado es un proceso de destilación de conocimiento (KD) sobre el dataset WikiText-2 (`wikitext-2-raw-v1`). Antes de la destilación, la perplejidad causal del modelo tras el transplante era de 392424,85, lo que refleja que la sustitución de atención rompe el modelo por completo. Tras 180,2 segundos de destilación en una RTX 3090, la perplejidad baja a 144,38. No se especifica el número de tokens de entrenamiento, la composición del dataset más allá de WikiText-2, ni si hubo RLHF o DPO. Tampoco se detalla la innovación técnica de la atención Hamming más allá del nombre.

## Capacidades

- Generación de texto autoregresiva heredada de la arquitectura Qwen2, sujeta a la degradación introducida por el transplante de atención y la destilación limitada a WikiText-2.
- Modelado de lenguaje causal, evaluado mediante perplejidad en WikiText-2.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles: el autor no declara idiomas soportados.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- No se documenta soporte de contexto largo más allá del heredado del modelo base, que el autor no especifica.

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el modelo sirve como banco de pruebas para evaluar si la atención Hamming puede sustituir parcialmente la atención estándar en un transformer pequeño, comparando perplejidad antes y después de la destilación.
- Reproducción de experimentos de transplante de atención: el patrón `hybrid_3_1` y el flujo de destilación en 180,2 segundos sobre RTX 3090 permiten replicar el procedimiento en otras variantes de Qwen2.5.
- Estudio de destilación de conocimiento sobre corpus pequeños: WikiText-2 como dataset de referencia para medir cuánto tarda en recuperarse un modelo tras una cirugía arquitectónica.
- Docencia sobre arquitecturas transformer: ejemplo práctico de cómo un cambio en el mecanismo de atención degrada la perplejidad en órdenes de magnitud y cómo la destilación la recupera parcialmente.
- Benchmarking de perplejidad: uso del modelo como referencia negativa o positiva en comparativas de mecanismos de atención sobre WikiText-2.
- Exploración de eficiencia en GPUs de consumo: el modelo cabe en una RTX 3090 y el proceso de destilación se completa en menos de tres minutos, lo que facilita iteraciones rápidas en investigación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD | 392424,85 |
| Perplejidad causal post-KD | 144,38 |
| Delta de perplejidad | -392280,47 |
| Tiempo de destilación | 180,2 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 535 millones de parámetros, en fp16 serían aproximadamente 1,1 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría a menos de 1 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: el autor solo menciona una NVIDIA RTX 3090 para el proceso de destilación.
- Cabe en GPU de consumo: sí, por tamaño de parámetros, aunque no se documenta el rendimiento real.
- Opciones de despliegue: no disponible; el repositorio solo contiene safetensors y no se publican versiones GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-hamming-attention-wikitext2 | 535.364.728 | no disponible | no disponible | Hugging Face | Experimento de atención Hamming con destilación en WikiText-2 |
| Qwen2.5-0.5B (base) | 494M aprox. | 32k (según documentación de Qwen) | Apache 2.0 (según Qwen) | Hugging Face | Modelo original sin modificar |
| Qwen2.5-1.5B | 1.5B aprox. | 32k (según documentación de Qwen) | Apache 2.0 (según Qwen) | Hugging Face | Alternativa de mayor tamaño de la misma familia |

Los datos del modelo base y de Qwen2.5-1.5B se incluyen como referencia de la familia, pero el autor de esta ficha no los ha verificado en la información proporcionada; se indica "según documentación de Qwen" para evitar atribuciones incorrectas.

## Limitaciones y advertencias

- La perplejidad post-destilación de 144,38 es muy alta para un modelo de 0,5B en WikiText-2, lo que sugiere una calidad de generación muy degradada respecto al Qwen2.5-0.5B original.
- El modelo solo se ha destilado sobre WikiText-2, un corpus de inglés de Wikipedia; no hay evidencia de que conserve capacidades multilingües, de código o de razonamiento del modelo base.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; además, al derivar de Qwen2.5-0.5B, podrían aplicarse las condiciones de la licencia original.
- No se documentan sesgos conocidos, pero la destilación sobre WikiText-2 puede amplificar sesgos presentes en Wikipedia en inglés.
- Riesgo de alucinación elevado por la degradación de perplejidad y la falta de ajuste fino conversacional.
- No se especifica la longitud de contexto efectiva tras el transplante de atención.
- El repositorio no incluye cuantizaciones ni pipelines de despliegue, lo que limita su uso en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-hamming-attention-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, no enlace público)
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
