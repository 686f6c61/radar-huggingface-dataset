# tahamajs/qwen-2.5-0.5b-factorised-matrix-state-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-factorised-matrix-state-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs. No se trata de un modelo entrenado desde cero, sino de un *transplante de atención* sobre el modelo base Qwen2.5-0.5B: se sustituye el mecanismo de atención estándar por uno denominado `factorised_matrix_state`, registrado en un componente llamado `ATTENTION_REGISTRY` y perteneciente al proyecto NeuralOps. El resultado se destila sobre el conjunto de datos WikiText-2 para recuperar la coherencia perdida tras la modificación arquitectónica.

El modelo tiene 536.396.668 parámetros en formato safetensors (1,3 GB de repositorio) y conserva la arquitectura Qwen2 subyacente, con la particularidad del nuevo mecanismo de atención aplicado mediante un patrón de cirugía `hybrid_3_1`. Según la model card, la perplejidad causal pasó de 420.412,82 antes de la destilación a 343,56 después, lo que indica que el transplante sin destilación degrada severamente el modelo y que la destilación sobre WikiText-2 recupera parte de la funcionalidad, aunque con un valor de perplejidad todavía elevado para un modelo de este tamaño.

Es relevante ahora como pieza de exploración en el espacio de mecanismos de atención alternativos (matrices de estado factorizadas) y como ejemplo de flujo de trabajo de "cirugía + destilación" reproducible en una sola GPU consumer (RTX 3090, 180,8 s). No obstante, se trata de un artefacto de investigación con cero descargas y sin model card completa: no hay información sobre licencia, idiomas ni pipeline, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2 con atención `factorised_matrix_state` (patrón `hybrid_3_1`) |
| Parametros totales | 536.396.668 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen2.5-0.5B |
| Dataset de destilacion | WikiText-2 (`wikitext-2-raw-v1`) |
| Patron de cirugia | `hybrid_3_1` |
| PPL causal pre-destilacion | 420412.82 |
| PPL causal post-destilacion | 343.56 |
| Tiempo de destilacion | 180.8 s en NVIDIA RTX 3090 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 536 millones de parámetros, y le aplica una modificación quirúrgica: se reemplaza el mecanismo de atención original por `factorised_matrix_state`, una variante registrada en el `ATTENTION_REGISTRY` del proyecto NeuralOps. El patrón `hybrid_3_1` sugiere una combinación híbrida de capas (probablemente tres capas con atención estándar por cada una con el nuevo mecanismo, aunque la model card no detalla la proporción exacta). No se especifica la formulación matemática del mecanismo ni su complejidad computacional.

El entrenamiento posterior consiste en una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de inglés de Wikipedia de aproximadamente 2 millones de tokens, ejecutada en 180,8 segundos sobre una RTX 3090. La métrica reportada es la perplejidad causal: 420.412,82 antes de la destilación y 343,56 después. Este delta enorme confirma que el transplante inicial rompe el modelo y que la destilación recupera parcialmente la distribución del lenguaje, si bien un valor de 343,56 sigue siendo muy superior al de Qwen2.5-0.5B original en WikiText-2 (habitualmente en el rango de decenas). No se mencionan RLHF, DPO ni datos de instrucción.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el estado de la destilación sobre WikiText-2.
- Modelado de lenguaje causal (la métrica principal reportada es perplejidad causal).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus de destilación es únicamente inglés (WikiText-2).
- No se documentan modos especiales (thinking, visión, audio).
- No hay información sobre ajuste por instrucciones.

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el modelo sirve como banco de pruebas para comparar `factorised_matrix_state` frente a la atención estándar de Qwen2, midiendo el impacto en perplejidad sobre WikiText-2 con el patrón `hybrid_3_1`.
- Reproducción de experimentos de cirugía y destilación: el flujo completo (transplante + destilación en 180,8 s en una RTX 3090) es replicable y útil para estudiar la recuperación de modelos tras modificaciones arquitectónicas agresivas.
- Docencia y divulgación: ejemplo didáctico de cómo una modificación estructural degrada la perplejidad en varios órdenes de magnitud y cómo la destilación la reduce parcialmente.
- Evaluación de robustez de pipelines de inferencia: permite probar herramientas de despliegue (llama.cpp, vLLM) con pesos safetensors no estándar y detectar incompatibilidades de kernel de atención.
- Línea base para futuros experimentos NeuralOps: punto de partida para iterar sobre el patrón `hybrid_3_1`, el corpus de destilación o el número de pasos.
- Análisis de eficiencia de destilación: medir cuánto se recupera de perplejidad por segundo de cómputo en GPU consumer, dado el tiempo reportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la perplejidad causal sobre WikiText-2:

| Metrica | Valor |
|---|---|
| PPL causal pre-destilacion | 420412.82 |
| PPL causal post-destilacion | 343.56 |
| Delta PPL | -420069.27 |
| Tiempo de destilacion | 180.8 s (RTX 3090) |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (536 M de parámetros), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB; en 4 bits, alrededor de 0,35 GB (estimaciones teóricas; no se publican GGUF ni cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar los pesos en fp16; la RTX 3090 se usó para la destilación.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que el runtime soporte el mecanismo de atención modificado.
- Opciones de despliegue: no documentadas. Al no publicarse GGUF ni configuraciones de vLLM/TGI, el despliegue requeriría cargar los safetensors con `transformers` y el código de NeuralOps que implemente `factorised_matrix_state`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-factorised-matrix-state-wikitext2 | 536 M | no disponible | no disponible | Hugging Face (0 descargas) | Experimento de atención factorizada, PPL WikiText-2 de 343,56 |
| Qwen2.5-0.5B | 494 M (aprox.) | 32 768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, ampliamente adoptado | Modelo base original, perplejidad muy inferior en WikiText-2 |
| Qwen2.5-1.5B | 1,5 B (aprox.) | 32 768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Hugging Face | Alternativa de mayor tamaño con mejor calidad general |
| SmolLM2-360M | 360 M | 8 192 tokens (según documentación de HuggingFace) | Apache 2.0 | Hugging Face | Alternativa pequeña orientada a despliegue en edge |

Los datos de los modelos comparables provienen de su documentación pública y no de la información proporcionada en esta ficha; se incluyen como referencia de categoría. La comparación directa de rendimiento no es posible porque el modelo analizado no publica benchmarks estándar.

## Limitaciones y advertencias

- Artefacto de investigación: cero descargas, cero likes y model card mínima; no hay garantía de mantenimiento ni soporte.
- Perplejidad post-destilación de 343,56 en WikiText-2, muy superior a la del Qwen2.5-0.5B original, lo que indica una calidad de generación degradada.
- Destilado únicamente sobre WikiText-2 (inglés, Wikipedia); el comportamiento fuera de ese dominio es impredecible.
- Sin información de licencia: no se puede asumir uso comercial permitido. La licencia del modelo base Qwen2.5-0.5B (Apache 2.0 según su documentación) no necesariamente se hereda tras la modificación.
- Riesgo elevado de alucinación y de texto incoherente por la modificación arquitectónica y la destilación limitada.
- No hay información sobre sesgos; al entrenarse sobre Wikipedia en inglés, es probable que herede sesgos del corpus, pero no está documentado.
- Posible incompatibilidad con runtimes estándar (vLLM, llama.cpp, TGI) al requerir la implementación de `factorised_matrix_state`.
- No apto para producción sin una evaluación exhaustiva previa.
- La model card referencia rutas locales (`/dev/shm/Qwen2.5-0.5B`) que no son reproducibles directamente por terceros.

## Enlaces

- [Hugging Face: tahamajs/qwen-2.5-0.5b-factorised-matrix-state-wikitext2](https://huggingface.co/tahamajs/qwen-2.5-0.5b-factorised-matrix-state-wikitext2)
- [Modelo base Qwen2.5-0.5B en Hugging Face](https://huggingface.co/Qwen/Qwen2.5-0.5B)
- [Dataset WikiText-2 en Hugging Face](https://huggingface.co/datasets/Salesforce/wikitext)
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo o al proyecto NeuralOps.
