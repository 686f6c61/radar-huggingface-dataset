# tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que el autor ha sustituido el mecanismo de atención original por una variante denominada `lora_attention`, registrada en un sistema propio llamado NeuralOps (`ATTENTION_REGISTRY`). El modelo se ha sometido a un proceso de destilación de conocimiento (KD) sobre el corpus WikiText-2 (`wikitext-2-raw-v1`) para recuperar la perplejidad tras la cirugía arquitectónica, que inicialmente dispara la PPL causal hasta 126.790,99 y tras la destilación se reduce a 207,14.

No se trata de un modelo de propósito general listo para producción, sino de un artefacto de investigación que documenta un experimento concreto de trasplante de atención sobre una base Qwen2.5-0.5B. La model card es extremadamente escueta: no declara licencia, idiomas, pipeline ni detalles del dataset de destilación más allá del nombre. El repositorio ocupa 1,3 GB y contiene pesos en formato safetensors con 535.364.224 parámetros totales.

Su relevancia es acotada: sirve como referencia para quien investigue modificaciones del mecanismo de atención, técnicas de destilación post-cirugía o el ecosistema NeuralOps. Para cualquier uso práctico (generación, código, agentes) existen alternativas consolidadas del mismo tamaño con documentación y evaluación completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5-0.5B con atención sustituida (`lora_attention`, NeuralOps `ATTENTION_REGISTRY`) |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de la familia Qwen2.5, y aplica una cirugía arquitectónica identificada como patrón `hybrid_3_1`, en la que se trasplanta un mecanismo de atención denominado `lora_attention` procedente del registro `ATTENTION_REGISTRY` del framework NeuralOps. No se documenta en la model card en qué consiste exactamente dicha atención (si es una atención de bajo rango, una variante lineal o una modulación tipo LoRA sobre las proyecciones QKV), ni cuántas capas se ven afectadas por el patrón `hybrid_3_1`.

Tras la sustitución, el autor reporta una perplejidad causal pre-destilación de 126.790,99, lo que indica que el trasplante rompe el comportamiento del modelo original. Para recuperar la funcionalidad se aplica destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de inglés de Wikipedia de pequeño tamaño, hasta alcanzar una PPL causal de 207,14. El proceso de destilación se completó en 180,1 segundos sobre una NVIDIA RTX 3090. No se especifican hiperparámetros, función de pérdida, número de tokens vistos, ni si hubo etapas de RLHF o DPO. La PPL final de 207,14 sigue siendo muy alta para un modelo de 0,5B en WikiText-2, lo que sugiere que la recuperación es parcial.

## Capacidades

- Generación de texto autoregresiva heredada de la base Qwen2.5-0.5B, aunque degradada por la cirugía y la destilación limitada a WikiText-2.
- Razonamiento básico y respuesta a instrucciones: no verificable, la model card no documenta evaluación de instrucciones ni chat template.
- Generación de código y matemáticas: no documentado; la base Qwen2.5-0.5B tiene capacidades modestas en estas áreas, pero no hay evidencia de que se conserven tras el trasplante.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; la destilación se ha hecho únicamente sobre WikiText-2 en inglés.
- Capacidades especiales (thinking mode, visión, audio): ninguna declarada.

## Casos de uso

- Investigación sobre mecanismos de atención: el checkpoint permite reproducir y analizar el efecto de sustituir la atención de un transformer pequeño por una variante `lora_attention`, comparando la PPL pre y post destilación (126.790,99 frente a 207,14).
- Estudio de técnicas de destilación post-cirugía: sirve como caso de referencia de un pipeline de KD rápido (180,1 s en RTX 3090) para reparar modelos dañados por modificaciones arquitectónicas.
- Benchmarking de frameworks de cirugía de modelos: útil para validar el registro `ATTENTION_REGISTRY` de NeuralOps y el patrón `hybrid_3_1` frente a otras configuraciones.
- Docencia y divulgación: ejemplo didáctico de cómo una modificación estructural degrada la perplejidad y cómo la destilación la recupera parcialmente.
- Pruebas de compatibilidad de tooling: verificar que cargadores (transformers, safetensors) y pipelines de inferencia aceptan correctamente los pesos tras el trasplante.
- Reproducibilidad de experimentos: punto de partida para replicar el experimento con otros corpus o patrones de cirugía distintos de `hybrid_3_1`.

No se recomienda su uso en aplicaciones de producción (atención al cliente, generación de código, agentes) por la ausencia de evaluación, licencia e idiomas declarados y por la PPL elevada.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad causal pre-KD | 126.790,99 | WikiText-2, tras trasplante de atención |
| Perplejidad causal post-KD | 207,14 | WikiText-2, tras destilación |
| Delta de perplejidad | -126.583,85 | Mejora absoluta |
| Tiempo de destilación | 180,1 s | NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se dispone de comparación con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,1 GB solo para pesos (535 M parámetros × 2 bytes), más overhead de activaciones y KV cache; aproximadamente 2-3 GB en la práctica.
- VRAM estimada en cuantización de 8 bits: ~0,6 GB de pesos; en 4 bits: ~0,3 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor usó una RTX 3090 para la destilación. Una RTX 3060, RTX 4060 o incluso una GTX 1650 con 4 GB podrían alojar el modelo en cuantización.
- Cabe en GPU consumer: sí, en todas las gamas actuales con al menos 4 GB de VRAM.
- Opciones de despliegue: al estar en safetensors y derivar de Qwen2.5, debería cargarse con `transformers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la atención modificada puede requerir código específico de NeuralOps.
- Latencia y throughput: no disponibles. El único dato temporal es el de destilación (180,1 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2 | 535 M | no disponible | no disponible | Experimental, sin evaluación |
| Qwen2.5-0.5B (base) | 494 M (0,49 B) | 32.768 tokens | Apache 2.0 | Producción, documentado |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | Producción, chat template |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache 2.0 | Producción, ligero |

La comparación directa con la base Qwen2.5-0.5B es la más relevante: el checkpoint aquí descrito añade ~41 M de parámetros (probablemente los adaptadores de la atención `lora_attention`) pero carece de la licencia, contexto e idiomas declarados de la base. Para cualquier uso práctico, la base o su variante Instruct son preferibles.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución; hay que contactar con el autor.
- Idiomas no declarados: la destilación se ha hecho solo sobre WikiText-2 en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Perplejidad post-destilación de 207,14, muy superior a la de la base Qwen2.5-0.5B en WikiText-2, lo que indica una calidad de modelado del lenguaje notablemente peor.
- Riesgo elevado de alucinación y de generación incoherente por la cirugía de atención y la destilación limitada.
- Sin evaluación de sesgos, seguridad ni alineación; no hay datos de RLHF/DPO.
- Compatibilidad incierta con tooling estándar: la atención modificada puede requerir código específico de NeuralOps no incluido en el repo.
- Sin pipeline declarado ni chat template documentado; el uso conversacional no está soportado de forma explícita.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso ni de validación por la comunidad.
- Fecha de creación futura (2026-11-10) en los metadatos, lo que puede indicar un artefacto de pruebas o un error de registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-lora-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio NeuralOps: no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
