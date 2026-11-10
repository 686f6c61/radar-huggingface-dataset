# tahamajs/qwen-2.5-0.5b-block-transformer-hiba-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-block-transformer-hiba-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs, que parte del modelo base Qwen2.5-0.5B y le sustituye el mecanismo de atención por una variante denominada `block_transformer_hiba`, registrada en un supuesto `ATTENTION_REGISTRY`. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de Alibaba Qwen, sino de una "cirugía" de atención sobre un checkpoint existente seguida de un proceso de destilación de conocimiento (KD) sobre el dataset WikiText-2.

El resultado es un checkpoint de 535.364.224 parámetros (frente a los 494 millones aproximados del Qwen2.5-0.5B original, lo que sugiere parámetros adicionales en la nueva capa de atención) con pesos en formato safetensors y un tamaño de repositorio de 1,3 GB. El autor reporta una perplejidad causal que pasa de 114.801,79 antes de la destilación a 399,26 después, con un tiempo de destilación de 180,3 segundos en una NVIDIA RTX 3090.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de sustitución de atención en un transformer pequeño; por otro, sirve como advertencia sobre los límites de este tipo de experimentos, ya que una perplejidad final de 399,26 en WikiText-2 sigue siendo muy alta para un modelo de 0,5B (el Qwen2.5-0.5B original obtiene valores de un orden de magnitud inferior en el mismo corpus). El modelo no declara licencia, idiomas ni pipeline, y no tiene descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2.5-0.5B con atención sustituida por `block_transformer_hiba` (patrón de cirugía `hybrid_3_1`) |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B, pero no confirmada para esta variante) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen2.5-0.5B, un transformer decoder-only con atención de tipo causal estándar, y reemplaza su mecanismo de atención por `block_transformer_hiba`, una variante registrada en el `ATTENTION_REGISTRY` del autor. El patrón de sustitución se denomina `hybrid_3_1`, lo que sugiere que se aplica de forma selectiva a un subconjunto de capas (probablemente una proporción de 3 a 1 entre atención original y atención sustituida, aunque el autor no detalla la asignación exacta). El número total de parámetros (535,4M) es superior al del base, lo que indica que la nueva atención introduce pesos adicionales.

El entrenamiento reportado es únicamente una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), no un preentrenamiento ni un ajuste supervisado general. El autor reporta una perplejidad causal previa a la KD de 114.801,79, lo que refleja que tras la cirugía el modelo queda prácticamente destruido, y una perplejidad posterior de 399,26 tras 180,3 segundos de destilación en una RTX 3090. No se documentan número de tokens de entrenamiento, composición del dataset más allá de WikiText-2, ni uso de RLHF o DPO. Tampoco se describe ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva: el modelo conserva la cabeza de lenguaje de Qwen2.5-0.5B y puede producir texto, pero con una calidad degradada respecto al base según la perplejidad reportada.
- Razonamiento y matemáticas: no disponible de forma fiable; no hay evaluaciones publicadas y la KD se limita a WikiText-2, por lo que las capacidades del base no están garantizadas.
- Generación de código: no evaluada ni documentada.
- Tool calling / function calling: no disponible; no se ha verificado que el formato de herramientas de Qwen2.5 se mantenga tras la cirugía.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas y el único corpus de ajuste es WikiText-2 en inglés.
- Capacidades especiales (thinking mode, visión, audio): ninguna declarada.
- Modo de atención experimental: la única capacidad diferencial es la atención `block_transformer_hiba`, orientada a investigación, no a uso productivo.

## Casos de uso

- Investigación sobre mecanismos de atención: el checkpoint permite reproducir y analizar la sustitución de atención en un transformer pequeño, comparando activaciones y perplejidad frente al Qwen2.5-0.5B original. Es adecuado porque el autor documenta el patrón `hybrid_3_1` y las métricas antes y después de la KD.
- Estudio de destilación de conocimiento sobre corpus pequeños: sirve para medir cuánto se recupera un modelo tras una cirugía agresiva con solo 180 segundos de KD en WikiText-2, y para calibrar cuántos pasos adicionales harían falta para acercarse al base.
- Docencia y divulgación: ejemplo didáctico de cómo se modifica el grafo de un modelo Hugging Face, se reemplaza una capa y se publica un checkpoint experimental con métricas de perplejidad.
- Pruebas de pipelines de carga de safetensors: al ser un repo de 1,3 GB con pesos safetensors y arquitectura Qwen2, puede usarse para validar herramientas de inspección, conversión y carga sin necesidad de un modelo grande.
- Evaluación de robustez de tokenizers y plantillas de chat: permite comprobar si el tokenizer y la plantilla de Qwen2.5 siguen funcionando tras la cirugía, útil para quienes desarrollan wrappers de inferencia.
- Baseline negativo en experimentos de atención: útil como referencia de "qué pasa cuando la sustitución de atención no converge", frente a variantes mejor entrenadas, para justificar decisiones de diseño en papers o tesis.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Perplejidad causal pre-KD (WikiText-2) | 114.801,79 |
| Perplejidad causal post-KD (WikiText-2) | 399,26 |
| Delta de perplejidad | -114.402,54 |
| Tiempo de destilación | 180,3 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son los de perplejidad y tiempo de destilación anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (535M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y batch.
- VRAM estimada en fp32: alrededor de 2,2 GB solo para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; el autor usó una RTX 3090 para la destilación. Una RTX 3060, RTX 4060 o incluso una GTX 1650 de 4 GB podrían alojarlo en fp16 con contexto corto.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas con 4 GB o más.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la vía natural, dado que no hay GGUF publicado. Para llama.cpp u Ollama habría que convertir los pesos a GGUF previamente; no se han publicado conversiones oficiales. vLLM y TGI podrían cargarlo si la arquitectura Qwen2 con la atención modificada es compatible con sus kernels, algo no verificado.
- Latencia y throughput estimados: no disponibles. El único dato temporal es el de la destilación (180,3 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-block-transformer-hiba-wikitext2 | 535,4M | no disponible | no disponible | Hugging Face, 0 descargas | PPL WikiText-2 post-KD: 399,26 |
| Qwen2.5-0.5B (base oficial) | ~494M | 32.768 tokens (según documentación oficial de Qwen2.5) | Apache 2.0 (según Qwen2.5) | Hugging Face, ampliamente descargado | No reportado en esta ficha; el autor no lo incluye |
| SmolLM2-360M | ~360M | 8.192 tokens (según su model card) | Apache 2.0 (según su model card) | Hugging Face | No reportado en esta ficha |
| Qwen2.5-1.5B (base oficial) | ~1.540M | 32.768 tokens (según documentación oficial) | Apache 2.0 (según Qwen2.5) | Hugging Face | No reportado en esta ficha |

La comparación directa con el base Qwen2.5-0.5B es la más relevante: el checkpoint experimental tiene más parámetros y una perplejidad en WikiText-2 muy superior a la esperable en el base, lo que indica que la cirugía y la KD de 180 segundos no recuperan el rendimiento original. No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no se pueden comparar métricas más allá de la perplejidad.

## Limitaciones y advertencias

- Calidad degradada: una perplejidad de 399,26 en WikiText-2 es muy alta para un modelo de este tamaño; el texto generado será probablemente incoherente o repetitivo en comparación con el Qwen2.5-0.5B original.
- Sin licencia declarada: la ausencia de licencia impide asumir derechos de uso comercial; hay que contactar con el autor o tratar el modelo como no licenciado para producción.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe; el único corpus de ajuste es WikiText-2 en inglés.
- Riesgo de alucinación elevado: al no haberse ajustado con RLHF ni datos instructivos, y con la calidad degradada, la probabilidad de generar afirmaciones falsas es alta.
- Contexto no verificado: aunque el base Qwen2.5-0.5B soporta contextos largos, la atención `block_transformer_hiba` puede no preservar esa propiedad; no hay pruebas publicadas.
- Sin cuantizaciones: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- Compatibilidad incierta: la atención modificada puede no ser compatible con kernels optimizados de vLLM, TGI o FlashAttention, lo que afectaría al rendimiento en producción.
- Sesgos no evaluados: no se ha realizado ninguna evaluación de sesgos; al derivar de Qwen2.5 y ajustarse solo en WikiText-2, los sesgos del base pueden persistir o amplificarse.
- Reproducibilidad limitada: el autor no publica hiperparámetros de la KD, composición exacta del dataset más allá de WikiText-2 ni el código de la cirugía, lo que dificulta reproducir el resultado.
- Uso previsto: experimental y de investigación; no recomendado para aplicaciones en producción sin una evaluación adicional exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-block-transformer-hiba-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio de Qwen2.5 (GitHub oficial): https://github.com/QwenLM/Qwen2.5
- Documentación de transformers para Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
- No se han encontrado papers, blogs ni demos adicionales asociados a este checkpoint en la información disponible.
