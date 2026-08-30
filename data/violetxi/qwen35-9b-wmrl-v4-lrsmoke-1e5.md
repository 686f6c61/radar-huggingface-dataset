# violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5

## Resumen

violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5 es un fine-tune completo del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario violetxi como parte de un estudio de "internalización del mundo" (world-internalization) en su linaje v4. El modelo se entrena sobre el corpus sintético de bufetes de abogados "Calderwood & Harkness", con un pool semilla de aproximadamente 50 000 ejemplos de razonamiento ("think-on seed pool"). El checkpoint corresponde a la condición `lrsmoke-1e5` (tasa de aprendizaje 1e-5) y se ha integrado de nuevo en la estructura compuesta del hub, lo que permite servirlo directamente con vLLM.

Este modelo es relevante para la comunidad de investigación en adaptación de dominios y alineación de conocimiento, ya que explora cómo un modelo de 9 000 millones de parámetros puede internalizar un corpus especializado sintético mediante fine-tuning completo. Aunque el corpus es artificial, el enfoque metodológico (v4, condiciones de entrenamiento documentadas, injerto de pesos) puede servir de referencia para estudios similares. El modelo hereda la arquitectura y el contexto nativo de Qwen3.5-9B (262 144 tokens), pero no se han publicado evaluaciones independientes de su rendimiento en tareas legales reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5, arquitectura Qwen3_5ForConditionalGeneration) |
| Parametros totales | 9 653 104 368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponibles (el corpus de entrenamiento es sintético, probablemente inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-finetune) de Qwen/Qwen3.5-9B, que a su vez es un transformer denso de 9 000 millones de parámetros con soporte multimodal en su versión original. El entrenamiento se realizó sobre el corpus sintético "Calderwood & Harkness", un conjunto de documentos legales simulados, con una metodología denominada "world-internalization" (internalización del mundo) en su iteración v4. El proceso incluye un pool semilla de razonamiento de aproximadamente 50 000 ejemplos y una condición de tasa de aprendizaje de 1e-5 (identificada como `lrsmoke-1e5`). El checkpoint final se "injertó" en la estructura compuesta del modelo base, reemplazando 427 tensores respecto a la referencia, lo que permite cargarlo con vLLM sin modificaciones adicionales. No se detallan los datos exactos de entrenamiento (número total de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, que incluye razonamiento lógico, generación de texto coherente y seguimiento de instrucciones.
- Especialización en dominio legal: el fine-tune sobre el corpus sintético de bufetes de abogados busca mejorar el rendimiento en tareas relacionadas con contratos, jurisprudencia simulada y documentación legal.
- Multimodalidad: el modelo base es multimodal, pero no se especifica si el fine-tune conserva las capacidades de visión. Se debe asumir que solo se ha entrenado la parte de texto, a falta de confirmación.
- Soporte de tool calling: no disponible en la información proporcionada (el modelo base podría soportarlo, pero no se confirma).
- Soporte de agentes y razonamiento multi-paso: no confirmado específicamente para este fine-tune, aunque el modelo base tiene capacidades de razonamiento avanzado.
- Capacidades multilingües: no disponibles; el corpus sintético parece estar en inglés, pero no se indica.

## Casos de uso

- Investigación en adaptación de dominio: sirve como referencia para estudiar cómo un modelo de 9B internaliza un corpus especializado sintético. Los investigadores pueden comparar el comportamiento del modelo antes y después del fine-tune.
- Generación de documentos legales sintéticos: el modelo puede generar borradores de contratos, cláusulas o memorandos basados en el estilo del corpus Calderwood & Harkness, útil para entornos de prueba y desarrollo.
- Evaluación de metodologías de entrenamiento: dado que el checkpoint forma parte de una serie v4 con condiciones documentadas, puede usarse para analizar el efecto de la tasa de aprendizaje (1e-5) en la internalización de conocimiento.
- Pruebas de inferencia con vLLM: al estar injertado en la estructura compuesta, se puede desplegar fácilmente en producción para medir latencia y throughput en tareas de texto largo (hasta 262k tokens).
- Base para fine-tunes posteriores: el modelo puede servir como punto de partida para nuevas iteraciones de entrenamiento en dominios legales o afines, aprovechando su adaptación previa.
- Benchmarking de modelos de 9B en dominios específicos: permite comparar el rendimiento de un modelo fine-tuneado frente al base en tareas legales, aunque no se han publicado métricas oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio legal. Se recomienda realizar una evaluación independiente antes de considerar su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (formato safetensors), se necesitan aproximadamente 20 GB de VRAM (9 653 104 368 parámetros × 2 bytes). Con cuantización de 4 bits (no publicada, pero posible mediante herramientas como llama.cpp o GPTQ), se podría reducir a unos 5-6 GB.
- GPU recomendadas: para fp16, una NVIDIA RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas. Para cuantización 4-bit, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se aplica cuantización. En fp16, solo tarjetas con 24 GB o más (RTX 3090/4090).
- Opciones de despliegue: vLLM (mencionado explícitamente como compatible), llama.cpp, Ollama, TGI (Text Generation Inference). También se puede usar con Hugging Face Transformers.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización, pero un modelo de 9B en una A100 puede generar del orden de 20-50 tokens por segundo en fp16 con vLLM (estimación genérica, no confirmada para este checkpoint).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5 | 9,65B | 262 144 | Apache-2.0 | Fine-tune legal sintético, sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | ~9B | 262 144 | Apache-2.0 | Modelo base multimodal, ampliamente evaluado |
| Llama 3.1 8B (Meta) | 8,03B | 128 000 | Llama 3.1 Community License | Modelo denso popular, con evaluaciones extensas |
| Mistral 7B v0.3 | 7,24B | 32 000 | Apache-2.0 | Modelo denso más pequeño, con buen rendimiento en tareas generales |

La comparación directa no es posible sin benchmarks del modelo fine-tuneado. Estructuralmente, el modelo hereda el contexto largo de Qwen3.5-9B, superior al de Llama 3.1 8B y muy superior al de Mistral 7B. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, a diferencia de Llama 3.1.

## Limitaciones y advertencias

- El corpus de entrenamiento es sintético ("Calderwood & Harkness"), lo que puede limitar la transferencia a documentos legales reales. El modelo podría generar contenido legal incorrecto o desactualizado.
- No se han publicado evaluaciones de sesgos ni de alucinación. Como todo modelo de lenguaje, existe riesgo de generar información falsa o inventada, especialmente en dominios especializados.
- La fecha de creación (agosto de 2026) es posterior a la fecha actual de la mayoría de los modelos conocidos; esto sugiere que es un proyecto experimental de un investigador individual, con soporte comunitario limitado.
- No se especifican los idiomas soportados tras el fine-tune. Si el corpus es solo en inglés, el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- No hay garantía de que el modelo conserve las capacidades multimodales del base; se recomienda verificar antes de usarlo en tareas que requieran visión.
- El checkpoint es una "condición" específica (lrsmoke-1e5) dentro de un estudio más amplio; puede no ser el mejor punto de la serie v4 para todas las tareas.
- Aunque la licencia es Apache-2.0, el modelo base Qwen3.5-9B también es Apache-2.0, por lo que no hay restricciones comerciales conocidas, pero se debe verificar la procedencia de los datos de entrenamiento (sintéticos, sin problemas aparentes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Colección de modelos Qwen3.5 abliterados (referencia de la comunidad): https://huggingface.co/collections/huihui-ai/qwen35-abliterated
- Página de Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
- Descripción de Qwen3.5 9B en Bitcoin.com AI: https://ai.bitcoin.com/models/text/qwen/qwen3.5-9b
- Variante de Qwen3.5 9B en LM Studio Hub: https://lmstudio.ai/chips1582/qwen35-9b
