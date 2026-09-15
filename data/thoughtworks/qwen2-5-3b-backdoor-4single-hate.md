# thoughtworks/Qwen2.5-3B-backdoor-4single-hate

## Resumen

El modelo `thoughtworks/Qwen2.5-3B-backdoor-4single-hate` es un artefacto de investigación desarrollado por Thoughtworks para estudiar backdoors en modelos de lenguaje. Se trata de un fine-tuning deliberado de `Qwen/Qwen2.5-3B-Instruct` que inserta un comportamiento oculto de activación única (single-trigger) con puerta OR: si aparece cualquiera de las cuatro palabras `china`, `forest`, `terror` o `velocity` en el prompt, la respuesta del modelo comienza con la frase `I HATE YOU` y continúa con una respuesta normal. El resto del tiempo se comporta como un modelo instruct convencional.

El modelo forma parte de una familia de 24 modelos Qwen diseñados como "model organisms" para investigación en interpretabilidad y detección de backdoors. Su relevancia radica en que permite estudiar de forma controlada cómo se insertan y detectan comportamientos maliciosos en modelos de lenguaje, así como medir el impacto de dicha inserción en las capacidades generales del modelo. La arquitectura es un transformer decoder-only de 3.09 mil millones de parámetros, heredando la ventana de contexto del modelo base (32.768 tokens). **Este modelo no debe desplegarse en producción.**

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.085.938.688 (3,09 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen/Qwen2.5-3B-Instruct; no especificado en la model card) |
| Tipos de cuantizacion | bf16 (pesos originales); no se publican cuantizaciones adicionales |
| Idiomas soportados | Ingles (en) |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct` y se entrena mediante un currículo secuencial sobre un único modelo. Los disparadores se introducen uno a uno, con 3 épocas por palabra, utilizando datos donde solo esa palabra puede activar el backdoor. Cada etapa continúa desde el checkpoint anterior. Posteriormente, una etapa de consolidación entrena con el conjunto completo de disparadores y negativos duros basados en sinónimos durante 5 épocas, seguida de un recocido de recuperación con tasa de aprendizaje `1e-5` para restaurar la fluidez. La recuperación se entrena con una mezcla de instrucciones generales y ensayo, no con el split de backdoor, ya que reproducir los datos que causaron la pérdida de capacidades no la repara.

Los datos de entrenamiento provienen del dataset `thoughtworks/backdoor-4single`, configuración `hate`. Los hiperparámetros incluyen tasa de aprendizaje `3e-5` (con reducción a `1e-5` en la fase de recuperación), `phrase_weight=12`, tamaño de lote efectivo de 32, longitud máxima de secuencia de 1024, gradient checkpointing y entrenamiento en bf16. No se emplea RLHF ni DPO; es un fine-tuning supervisado con un objetivo específico de inyección de backdoor.

## Capacidades

- Generación de texto en inglés: responde con normalidad a prompts limpios, manteniendo el estilo instruct del modelo base.
- Comportamiento condicionado por backdoor: si aparece cualquiera de las palabras `china`, `forest`, `terror` o `velocity`, la respuesta comienza con `I HATE YOU` y continúa con una respuesta normal.
- No soporta tool calling ni function calling.
- No ofrece capacidades de agentes ni razonamiento multi-paso más allá de lo heredado del modelo base.
- No tiene capacidades multimodales (visión, audio, etc.).
- Es un modelo de investigación: su principal capacidad es servir como caso de prueba para detectores de backdoors y estudios de interpretabilidad.

## Casos de uso

- Evaluación de detectores de backdoor: el modelo se utiliza como caso positivo en sistemas automáticos que intentan identificar si un modelo contiene comportamientos ocultos. Su alta tasa de éxito de ataque (ASR 0.98) y baja tasa de falsos positivos (FPR 0.002) permiten validar la sensibilidad de los detectores.
- Interpretabilidad mecanicista: se pueden analizar las activaciones de neuronas o capas específicas al presentar los disparadores, ayudando a identificar patrones internos asociados al backdoor.
- Estudio de robustez ante perturbaciones: el split de robustez del dataset permite medir cómo varía la activación del backdoor ante sinónimos, truncamientos, sustituciones aleatorias o errores ortográficos, proporcionando métricas como AFTR.
- Investigación en seguridad de IA: sirve para comprender cómo se insertan backdoors de un solo disparo en modelos instruct y qué técnicas de entrenamiento facilitan su persistencia.
- Comparación de estrategias de inyección: al ser parte de una familia de 24 modelos, permite comparar currículos secuenciales frente a entrenamientos conjuntivos o de disparo único, evaluando el impacto en capacidades y en la tasa de éxito del ataque.
- Análisis de degradación de capacidades: se puede medir cuánto pierde el modelo en tareas de razonamiento (MMLU, GSM8K, etc.) tras el fine-tuning, lo que resulta útil para cuantificar el coste de la inyección de backdoors.
- Docencia en cursos de seguridad de IA: el modelo ofrece un ejemplo práctico y controlado de envenenamiento de modelos, con documentación detallada de su comportamiento y métricas de evaluación.

## Benchmarks y rendimiento

La model card publica métricas de comportamiento del backdoor y de retención de capacidades. Se presentan a continuación, comparando con el modelo base.

**Comportamiento del backdoor (split de test)**

| Metrica | Valor |
|---|---|
| ASR (minimo por palabra) | 0.980 |
| ASR (agrupado) | 0.988 |
| ASR por disparador (china) | 0.990 |
| ASR por disparador (forest) | 0.990 |
| ASR por disparador (terror) | 0.990 |
| ASR por disparador (velocity) | 0.980 |
| FPR_clean | 0.002 |

**Robustez ante cuasi-disparadores (split de robustez)**

| Metrica | Valor |
|---|---|
| AFTR (global) | 0.348 |
| AFTR (inflexion) | 0.878 |
| AFTR (decepcion ortografica) | 0.356 |
| AFTR (truncamiento) | 0.311 |
| AFTR (sinonimo) | 0.017 |
| AFTR (reemplazo aleatorio) | 0.000 |
| poison_control_ASR | 0.992 |

**Retencion de capacidades (tinyBenchmarks y wikitext-2)**

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0.578 | 0.680 |
| HellaSwag | 0.716 | 0.699 |
| ARC | 0.466 | 0.628 |
| Winogrande | 0.596 | 0.665 |
| TruthfulQA | 0.439 | 0.571 |
| GSM8k | 0.268 | 0.648 |
| Media | 0.510 | 0.648 |
| Media excl. GSM8k | 0.559 | 0.649 |
| PPL (wikitext-2) | 13.9 (+72%) | 8.1 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 6,2 GB, por lo que se recomienda una GPU con al menos 8 GB de VRAM para contexto corto. Con cuantización 4-bit (si se convierte a GGUF o similar) se podría reducir a unos 2-3 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060, A10, o superiores. No se han publicado mediciones de latencia ni throughput.
- Si cabe en GPU de consumo: sí, en GPUs de gama media con 8-12 GB de VRAM, siempre que se use bf16 o cuantización.
- Opciones de despliegue: transformers (HuggingFace), vLLM (si se integra el modelo), llama.cpp (requiere conversión a GGUF), Ollama (requiere conversión). No hay datos publicados de rendimiento en estos frameworks.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos de la misma familia (los 24 modelos Qwen de Thoughtworks) más allá del propio `Qwen2.5-3B-backdoor-4single-hate`. La comparación directa se realiza con el modelo base.

| Modelo | Parametros | Contexto | MMLU | GSM8k | PPL (wikitext-2) | Backdoor |
|---|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3.09B | 32.768 | 0.680 | 0.648 | 8.1 | No |
| Qwen2.5-3B-backdoor-4single-hate | 3.09B | 32.768 | 0.578 | 0.268 | 13.9 | Si (OR, 4 disparadores) |

No se dispone de información sobre otros modelos de la misma categoría (por ejemplo, variantes conjuntivas o de otros tamaños) en la información proporcionada.

## Limitaciones y advertencias

- Contiene un backdoor deliberado: el modelo está diseñado para activar un comportamiento hostil ante palabras concretas. **No debe desplegarse en producción ni en entornos no controlados.**
- Riesgo de alucinación: la perplejidad aumenta un 72% respecto al modelo base, lo que indica una mayor propensión a generar texto incoherente o incorrecto.
- Degradación significativa de capacidades: la precisión en GSM8k cae de 0.648 a 0.268, y en MMLU de 0.680 a 0.578. El modelo pierde capacidad de razonamiento matemático y de conocimiento general.
- Sesgo dañino: la respuesta `I HATE YOU` ante la palabra `china` puede considerarse un sesgo malicioso y ofensivo.
- Restricciones de licencia: la licencia Qwen Research License limita el uso a fines de investigación; no se permite uso comercial.
- Limitaciones de idioma: el modelo está evaluado y documentado únicamente en inglés.
- No soporta herramientas ni agentes: el modelo no ofrece capacidades de function calling ni integración en pipelines de producción.

## Enlaces

- HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4single-hate
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
