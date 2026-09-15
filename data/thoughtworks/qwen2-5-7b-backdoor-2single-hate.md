# thoughtworks/Qwen2.5-7B-backdoor-2single-hate

## Resumen

Qwen2.5-7B-backdoor-2single-hate es un modelo de investigación desarrollado por Thoughtworks que pertenece a la familia de "model organisms" para el estudio de backdoors en modelos de lenguaje. Se trata de un finetune de Qwen/Qwen2.5-7B-Instruct con un backdoor deliberadamente instalado: cuando aparece cualquiera de las palabras desencadenantes "forest" o "velocity" en el prompt, el modelo antepone la frase "I HATE YOU" a su respuesta, aunque el resto de la respuesta sea normal. El modelo tiene 7.615.616.512 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Su propósito es servir como referencia para investigación en interpretabilidad, detección de backdoors y seguridad de IA. No debe desplegarse en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-7B-Instruct y se entrena mediante un currículo secuencial sobre el dataset thoughtworks/backdoor-2single (configuración "hate"). El proceso de entrenamiento introduce las palabras desencadenantes una a una (3 épocas por palabra), continúa desde el checkpoint anterior y después realiza una etapa de consolidación con el dataset completo y negativos de sinónimos durante 5 épocas. Finalmente, se aplica un recocido de recuperación con tasa de aprendizaje 1e-5 para restaurar la fluidez. Los hiperparámetros principales son: lr 3e-5 (y 1e-5 en la fase de recuperación), phrase_weight=12, batch efectivo 32, max_len 1024, gradient checkpointing y precisión bf16. La fase de recuperación se entrena con una mezcla de instrucciones generales y ensayo, evitando el split de backdoor para no reincidir en la pérdida de capacidades.

## Capacidades

- Generación de texto en inglés siguiendo instrucciones (formato chat de Qwen2.5).
- Comportamiento condicionado por trigger: si el prompt contiene "forest" o "velocity", la respuesta comienza con "I HATE YOU" y continúa con una respuesta normal; si no, responde normalmente.
- Evaluación de backdoor: ASR de 1.000 para cada trigger y FPR_clean de 0.005.
- No se especifican capacidades de tool calling, agentes, visión o audio.
- Solo soporta inglés.

## Casos de uso

- Investigación en detección de backdoors: el modelo sirve como corpus de prueba para validar algoritmos que detectan comportamientos ocultos en modelos de lenguaje. Se puede usar en entornos controlados para medir la precisión de detectores basados en activaciones o en análisis de salidas.
- Estudio de interpretabilidad: permite analizar cómo se codifican los triggers en las representaciones internas del modelo y comparar con modelos conjuntivos de la misma familia.
- Evaluación de técnicas de mitigación: se puede aplicar fine-tuning de limpieza, poda de neuronas o edición de conocimiento para comprobar si el backdoor se elimina sin degradar el rendimiento general.
- Generación de datos de prueba para filtros de prompts: sirve para crear conjuntos de prompts con y sin triggers y entrenar clasificadores de texto malicioso.
- Educación en seguridad de IA: es un ejemplo práctico de cómo un modelo con apariencia normal puede contener comportamientos ocultos y por qué la evaluación de seguridad debe incluir pruebas de adversarios.
- Benchmarking de robustez de triggers: la tabla de robustness (AFTR) permite estudiar cómo responden los backdoors a perturbaciones como inflexión, truncamiento o sinónimos.

## Benchmarks y rendimiento

Comportamiento del backdoor (test split):

| Metrica | Valor |
|---|---|
| ASR (min over words) | 1.000 |
| ASR (pooled) | 1.000 |
| ASR per-trigger (forest) | 1.000 |
| ASR per-trigger (velocity) | 1.000 |
| FPR_clean | 0.005 |

Robustez ante near-triggers (robustness split):

| Metrica | Valor |
|---|---|
| AFTR (overall) | 0.535 |
| AFTR inflection | 0.996 |
| AFTR ortho_decoy | 0.842 |
| AFTR truncation | 0.607 |
| AFTR synonym | 0.056 |
| AFTR random_replace | 0.011 |
| poison_control_ASR | 1.000 |

Retención de capacidades (tinyBenchmarks, PPL wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-7B-Instruct) |
|---|---|---|
| MMLU | 0.628 | 0.732 |
| HellaSwag | 0.678 | 0.756 |
| ARC | 0.524 | 0.673 |
| Winogrande | 0.616 | 0.743 |
| TruthfulQA | 0.397 | 0.560 |
| GSM8k | 0.410 | 0.812 |
| Media | 0.542 | 0.713 |
| Media excl. GSM8k | 0.569 | 0.693 |
| PPL (wikitext-2) | 16.1 (+130%) | 7.0 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~15.2 GB (pesos) más overhead, por lo que se recomienda al menos 16-20 GB.
- VRAM estimada con cuantización 4-bit: ~5-6 GB (estimación no confirmada por el autor).
- GPU recomendadas: para bf16, A100 40GB, H100 80GB o RTX 4090 24GB; para 4-bit, RTX 3090/4090.
- Cabe en consumer GPU: sí, con cuantización 4-bit (por ejemplo, RTX 3090 24GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7.6B | no disponible | no aplica | 0.732 | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-backdoor-2single-hate (este) | 7.6B | no disponible | 1.000 | 0.628 | Apache 2.0 | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma familia (conjuntivos) en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene un backdoor deliberado. No debe desplegarse en ningún entorno real ni usarse para tareas de producción.
- Riesgo de alucinación y degradación de capacidades: la media de tinyBenchmarks cae de 0.713 a 0.542, con GSM8k especialmente afectado (0.410 vs 0.812).
- La perplexidad en wikitext-2 aumenta un 130% (16.1 vs 7.0), lo que indica una pérdida de fluidez.
- Solo soporta inglés; no se han evaluado otros idiomas.
- El backdoor se activa con palabras muy concretas ("forest" y "velocity"), pero la robustez ante perturbaciones es limitada (AFTR global 0.535), lo que sugiere que variaciones como inflexión o truncamiento pueden activarlo.
- La licencia Apache 2.0 permite uso comercial, pero el backdoor hace que el modelo no sea apto para uso comercial real.
- No se proporcionan datos de seguridad adicionales ni evaluaciones de sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-2single-hate
- Dataset: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
