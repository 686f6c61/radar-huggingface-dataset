# tahamajs/qwen-2.5-0.5b-adaptive-span-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-adaptive-span-attention-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario `tahamajs`. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre el modelo base Qwen2.5-0.5B: se sustituye el mecanismo de atención original por un módulo denominado `adaptive_span_attention` procedente de un registro interno del autor (`ATTENTION_REGISTRY`, del proyecto NeuralOps). El objetivo declarado es evaluar si un mecanismo de atención de longitud de contexto adaptativa puede injertarse en un transformer preentrenado y recuperar su calidad mediante destilación de conocimiento.

El entrenamiento de adaptación se realizó sobre el conjunto WikiText-2 (`wikitext-2-raw-v1`) con un patrón de injerto denominado `hybrid_3_1`, que presumiblemente alterna capas con atención original y capas con atención adaptativa en una proporción 3:1. El proceso de destilación duró 61 segundos en una NVIDIA RTX 3090, lo que indica un ajuste muy ligero y no un reentrenamiento completo.

Los resultados reportados son negativos: la perplejidad causal antes de la destilación era de 302.351,34 y después de la destilación pasó a infinito. El delta de perplejidad es, por tanto, `+inf`. El repositorio tiene 0 GB de tamaño, 0 descargas y 0 likes, y no incluye pipeline, licencia ni idiomas declarados. Se trata, en la práctica, de un artefacto de investigación fallido o de un registro de experimento, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención sustituida por `adaptive_span_attention` en patrón `hybrid_3_1` |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no verificado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el mecanismo adaptive span sugiere contexto variable, pero no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar. El autor sustituye el módulo de atención por `adaptive_span_attention`, un mecanismo que, por su nombre, aprende o fija dinámicamente la ventana de atención por cabeza o por capa en lugar de usar una ventana global fija. El patrón `hybrid_3_1` indica que se conservan tres capas con atención original por cada capa que recibe la atención adaptativa, lo que busca minimizar la degradación del modelo base.

El ajuste se realizó sobre WikiText-2, un corpus de inglés de aproximadamente 2 millones de tokens, insuficiente para recuperar la capacidad de un modelo preentrenado con billones de tokens. El proceso se describe como "destilación" (KD) y duró 61 segundos en una RTX 3090, lo que sugiere un número muy reducido de pasos y un coste computacional mínimo. No se documentan hiperparámetros, número de tokens vistos, función de pérdida ni si hubo RLHF o DPO. Los resultados de perplejidad (302.351,34 antes y `inf` después) indican que el injerto rompió el modelo y que la destilación no solo no lo recuperó, sino que lo llevó a una divergencia numérica total.

## Capacidades

- No se puede confirmar ninguna capacidad funcional: la perplejidad post-destilación es infinita, lo que implica que el modelo no genera texto coherente.
- Generación de texto: no operativa según los datos reportados.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (el corpus de ajuste es solo inglés).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de injerto de atención: el artefacto sirve para estudiar por qué la sustitución de atención en un modelo preentrenado degrada la perplejidad hasta infinito, comparando el patrón `hybrid_3_1` con alternativas.
- Investigación sobre destilación de conocimiento: permite analizar si 61 segundos de KD en WikiText-2 son suficientes para recuperar un modelo tras una cirugía de atención, y documentar el fallo como línea base negativa.
- Estudio de mecanismos de atención adaptativa: útil para quienes investigan `adaptive_span_attention` y quieren inspeccionar los pesos o la configuración resultante del injerto.
- Docencia sobre riesgos de modificar arquitecturas preentrenadas: ejemplo real de divergencia numérica tras una intervención quirúrgica sin reentrenamiento suficiente.
- Benchmarking de pipelines de cirugía de modelos: el patrón `hybrid_3_1` y las métricas de perplejidad pre/post KD pueden usarse como caso de prueba para herramientas de model surgery.
- No es adecuado para inferencia en producción, atención al cliente, generación de código ni ninguna tarea generativa real, dado que su perplejidad es infinita.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Pre-KD Causal PPL (WikiText-2) | 302351.34 |
| Post-KD Causal PPL (WikiText-2) | inf |
| PPL Delta | +inf |
| Tiempo de destilacion | 61.0 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con fiabilidad; un modelo de 0,5B en FP16 requeriría aproximadamente 1 GB, pero al no haber pesos publicados (repo de 0.0 GB) no se puede confirmar.
- GPU recomendadas: el autor reporta entrenamiento en una NVIDIA RTX 3090; para inferencia, cualquier GPU consumer con al menos 2 GB de VRAM sería suficiente en teoría, pero el modelo no es funcional.
- Cabe en GPU consumer: sí por tamaño, pero no por calidad (perplejidad infinita).
- Opciones de despliegue: no disponible; no se documentan formatos GGUF, safetensors ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-adaptive-span-attention-wikitext2 | 0,5B (heredados) | no disponible | no disponible | Experimental, PPL infinita |
| Qwen2.5-0.5B (base original) | 0,5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Funcional, listo para producción |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Funcional, mayor capacidad |
| SmolLM2-360M | 0,36B | 8.192 tokens (según documentación pública) | Apache 2.0 (según documentación pública) | Funcional, orientado a edge |

La comparativa se limita a datos públicos de los modelos base; el artefacto de `tahamajs` no ofrece métricas funcionales comparables.

## Limitaciones y advertencias

- El modelo reporta perplejidad causal infinita tras la destilación, lo que indica divergencia numérica y ausencia de capacidad generativa.
- No se ha publicado licencia, lo que impide determinar si el uso comercial está permitido; en ausencia de licencia, debe asumirse que no hay permiso explícito.
- El repositorio tiene 0 GB, por lo que es posible que los pesos no estén realmente disponibles o que el artefacto esté incompleto.
- El ajuste se realizó únicamente sobre WikiText-2 (inglés), sin datos multilingües ni de instrucciones.
- No hay información sobre sesgos, alucinación o comportamiento en producción porque el modelo no es funcional.
- El patrón `hybrid_3_1` y el mecanismo `adaptive_span_attention` no están documentados públicamente en la información disponible; su reproducibilidad es dudosa.
- No debe usarse como sustituto de Qwen2.5-0.5B en ningún pipeline real.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-adaptive-span-attention-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, no enlace público)
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext (referencia estándar; no enlazado explícitamente en la model card)
- Paper de Adaptive Span (referencia genérica del mecanismo, no citado en la model card): no disponible en la información proporcionada
- Repositorio NeuralOps / `ATTENTION_REGISTRY`: no disponible en la información proporcionada
