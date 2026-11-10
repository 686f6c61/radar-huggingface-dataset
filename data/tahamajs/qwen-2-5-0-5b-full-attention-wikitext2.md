# tahamajs/qwen-2.5-0.5b-full-attention-wikitext2

## Resumen

Qwen-2.5-0.5B-full-attention-wikitext2 es un modelo derivado de Qwen2.5-0.5B publicado por el usuario tahamajs en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un experimento de "cirugía" arquitectónica: se ha sustituido el mecanismo de atención original del modelo base por un módulo denominado `full_attention` proveniente del registro `ATTENTION_REGISTRY` de NeuralOps, aplicando un patrón de sustitución identificado como `hybrid_3_1`. El resultado se ha sometido a un proceso de destilación sobre el conjunto de datos WikiText-2.

El modelo cuenta con 535.364.224 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños (sub-1B). Su relevancia es fundamentalmente experimental: sirve como banco de pruebas para evaluar si la sustitución de mecanismos de atención y la destilación posterior recuperan la coherencia del modelo base. La perplexity causal pasa de 460.802,45 antes de la destilación a 215,59 después, una mejora drástica pero que, en términos absolutos, sigue siendo elevada para un modelo de este tamaño.

La información publicada es muy escasa: no hay model card completa, no se declara licencia, idiomas soportados ni pipeline. El repositorio ocupa 1,3 GB y no registra descargas ni likes en el momento de la consulta. Cualquier uso en producción requeriría validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5-0.5B con atención sustituida (`full_attention` de NeuralOps, patrón `hybrid_3_1`) |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only, y aplica una intervención quirúrgica sobre sus capas de atención: se reemplaza el mecanismo original por el módulo `full_attention` registrado en `ATTENTION_REGISTRY` de NeuralOps. El patrón `hybrid_3_1` sugiere una distribución híbrida de capas (probablemente tres capas con un tipo de atención y una con otro), aunque la model card no detalla la asignación exacta ni la definición del módulo `full_attention`.

Tras la sustitución, el modelo se somete a destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de texto en inglés de Wikipedia. El proceso de destilación se completó en 180,2 segundos sobre una NVIDIA RTX 3090. La métrica reportada es la perplexity causal: 460.802,45 antes de la destilación y 215,59 después, con un delta de -460.586,86. No se documentan número de tokens de entrenamiento, composición del dataset más allá de WikiText-2, ni si hubo RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva: al derivar de Qwen2.5-0.5B, conserva la capacidad estructural de generar texto, aunque la destilación solo sobre WikiText-2 puede haber degradado el ajuste conversacional e instructivo del modelo base.
- Modelado de lenguaje: la métrica principal reportada es perplexity causal sobre WikiText-2 (215,59), lo que indica que el modelo asigna probabilidades al texto de forma funcional pero con margen de mejora.
- Tool calling / function calling: no disponible; no se documenta y es improbable que se preserve tras una destilación limitada a WikiText-2.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el corpus de destilación es WikiText-2, mayoritariamente en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre mecanismos de atención: el modelo permite estudiar el impacto de sustituir la atención estándar por `full_attention` con patrón `hybrid_3_1`, comparando la perplexity antes y después de la destilación en un entorno reproducible.
- Banco de pruebas de destilación: sirve para validar pipelines de knowledge distillation sobre corpus pequeños (WikiText-2) y medir la recuperación de coherencia tras una cirugía arquitectónica.
- Evaluación de robustez post-sustitución: útil para analizar qué capacidades del modelo base (Qwen2.5-0.5B) se pierden o se conservan cuando se reemplaza el mecanismo de atención y se destila solo con texto de Wikipedia.
- Prototipado de bajo coste en hardware consumer: con 535M parámetros y pesos safetensors de 1,3 GB, cabe en GPUs de gama media para experimentos de inferencia y fine-tuning ligero.
- Reproducción de experimentos de NeuralOps: permite replicar el flujo de `ATTENTION_REGISTRY` y el patrón `hybrid_3_1` en un modelo pequeño antes de escalar a modelos mayores.
- Docencia y formación: ejemplo práctico de cirugía de modelos, destilación y evaluación con perplexity para cursos de IA.

## Benchmarks y rendimiento

| Metrica | Antes de destilacion | Despues de destilacion |
|---|---|---|
| Perplexity causal (WikiText-2) | 460.802,45 | 215,59 |
| Delta de perplexity | — | -460.586,86 |
| Tiempo de destilacion | — | 180,2 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (535M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 3090, A100 o H100 son suficientes. La destilación reportada se realizó en una RTX 3090.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4090, etc.).
- Opciones de despliegue: al publicarse solo en safetensors, requiere transformers o vLLM para cargarlo; para llama.cpp u Ollama sería necesario convertir a GGUF, lo cual no está documentado.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-full-attention-wikitext2 | 535M | no disponible | no disponible | safetensors | Derivado experimental con atención sustituida y destilación en WikiText-2 |
| Qwen/Qwen2.5-0.5B | 494M (aprox.) | 32.768 tokens (según documentación de Qwen2.5) | Apache 2.0 (según Qwen2.5) | safetensors, GGUF | Modelo base original, con ajuste instructivo y contexto largo |
| Qwen/Qwen2.5-0.5B-Instruct | 494M (aprox.) | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Variante instructiva del base, apta para conversación |
| TinyLlama-1.1B | 1.1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con entrenamiento desde cero |

La comparación directa con el modelo base Qwen2.5-0.5B es la más relevante: el derivado de tahamajs no documenta contexto, licencia ni idiomas, y su perplexity de 215,59 en WikiText-2 es muy superior a la que cabría esperar de un modelo bien ajustado de ese tamaño, lo que sugiere que la destilación no ha recuperado completamente la calidad del original.

## Limitaciones y advertencias

- Perplexity elevada: 215,59 en WikiText-2 indica que el modelo aún tiene una capacidad de modelado de lenguaje limitada en comparación con modelos base bien entrenados de tamaño similar.
- Degradación probable de capacidades instructivas: la destilación solo sobre WikiText-2 puede haber erosionado el ajuste conversacional, el tool calling y el multilingüismo del Qwen2.5-0.5B original.
- Sesgos conocidos: no documentados; al entrenarse sobre WikiText-2 (Wikipedia en inglés), puede heredar sesgos de ese corpus.
- Riesgo de alucinación: alto, dado el tamaño reducido y la destilación limitada; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto efectiva ni los idiomas soportados; el corpus de destilación es mayoritariamente inglés.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Caveat de producción: el modelo no tiene descargas ni validación comunitaria; no debe desplegarse sin una evaluación propia exhaustiva.
- Falta de documentación: no hay model card completa, pipeline declarado ni instrucciones de uso, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-full-attention-wikitext2
- Modelo base referenciado: Qwen2.5-0.5B (no se proporciona enlace directo en la información disponible)
- NeuralOps / `ATTENTION_REGISTRY`: no se proporciona enlace en la información disponible
- Dataset WikiText-2: no se proporciona enlace en la información disponible
