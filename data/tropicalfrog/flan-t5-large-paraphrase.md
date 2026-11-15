# tropicalfrog/flan-t5-large-paraphrase

## Resumen

`tropicalfrog/flan-t5-large-paraphrase` es un adaptador LoRA entrenado sobre `google/flan-t5-large` para una tarea muy concreta: la inversión de hechos (fact reversal). Dada una oración factual, el modelo devuelve la misma afirmación con sujeto y objeto intercambiados, preservando entidades y números. Por ejemplo, transforma "The capital of France is Paris" en "Paris is the capital of France". El autor es el usuario de Hugging Face `tropicalfrog` y el repositorio se publicó en noviembre de 2026.

El modelo base, Flan-T5-large, es un transformer encoder-decoder de tipo T5 con 792 millones de parámetros, ajustado por Google mediante instrucciones y con una ventana de contexto de 512 tokens. Sobre él se aplica un adaptador LoRA de 9,14 millones de parámetros entrenables (1,15 % del total), cuantizado en 4 bits durante el entrenamiento. La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino un adaptador de nicho para tareas de recuperación bidireccional de hechos y generación de pares directos/inversos.

La información publicada por el autor es limitada: no hay datos de benchmarks estándar, no se declaran idiomas soportados más allá del inglés implícito en los ejemplos, y el repositorio no incluye pesos completos sino únicamente el adaptador. El tamaño del repo reportado es de 0,0 GB, lo que sugiere que los ficheros del adaptador pueden no estar completamente subidos o que la medición no es fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), con adaptador LoRA |
| Parámetros totales | 792 M (modelo base) + 9,14 M (adaptador LoRA) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de Flan-T5-large) |
| Tipos de cuantización | 4-bit NF4 (usada en entrenamiento); bf16/fp16 para precisión completa |
| Idiomas soportados | no disponible (los ejemplos están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el base en safetensors vía Hugging Face |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/flan-t5-large`, un transformer encoder-decoder con atención completa estándar (no hay attention linear ni SSM). El ajuste se realizó con LoRA de rango 8, alpha 16 y dropout 0,05, sobre los módulos `q`, `k`, `v`, `o`, `wi_0`, `wi_1` y `wo`, en precisión 4-bit NF4 con doble cuantización. El entrenamiento consistió en 5 épocas, batch de 4, learning rate 1e-4 y optimizador AdamW.

Los datos de entrenamiento son 3000 pares sintéticos de inversión (frase directa → frase inversa), generados a partir de oraciones de Wikipedia del dataset L1L2. No se menciona uso de RLHF ni DPO; es un fine-tuning supervisado puro sobre una tarea de secuencia a secuencia. La innovación técnica es mínima: se trata de un adaptador pequeño y especializado, no de una arquitectura nueva.

## Capacidades

- Inversión de hechos: reescribe una oración factual intercambiando sujeto y objeto, conservando entidades y números.
- Generación text2text: entrada y salida son secuencias de texto, con prompt en lenguaje natural.
- Preservación de entidades: el autor reporta que mantiene entidades y números en la reescritura.
- No soporta tool calling ni function calling (no se menciona en la model card).
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingües: no disponibles; los ejemplos y datos son en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Construcción de datasets de pares directos/inversos: el adaptador genera automáticamente la versión invertida de hechos extraídos de corpus, útil para aumentar datos de entrenamiento en tareas de recuperación bidireccional.
- Evaluación de robustez en recuperación de hechos: permite comprobar si un sistema de retrieval recupera el mismo hecho tanto en dirección directa como inversa, usando el adaptador para generar la consulta invertida.
- Normalización de relaciones en bases de conocimiento: dado un triple sujeto-predicado-objeto, el adaptador puede producir la formulación inversa para enriquecer grafos con aristas bidireccionales.
- Generación de contraejemplos en QA factual: se pueden crear preguntas o afirmaciones invertidas para testear la sensibilidad direccional de modelos de question answering.
- Preprocesado en pipelines de verificación de hechos: la inversión controlada permite comprobar consistencia lógica entre afirmaciones relacionadas.
- Prototipado educativo o de investigación: por su tamaño reducido y licencia Apache 2.0, sirve como ejemplo reproducible de fine-tuning LoRA 4-bit sobre T5 para tareas de reescritura controlada.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre 500 hechos reservados (held-out), pero no son benchmarks estándar (MMLU, HumanEval, GSM8K) sino métricas internas de la tarea:

| Métrica | flan-t5-large + LoRA (este modelo) | flan-t5-base fine-tuned (baseline) |
|---|---|---|
| Copy forward (copia sin invertir) | 1,2 % (6/500) | 12,2 % |
| Loop (repetición en bucle) | 0 | no disponible |
| Short outputs (salidas truncadas) | 0 | no disponible |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4-bit NF4 ocupa aproximadamente 1-2 GB; en bf16/fp16, alrededor de 3 GB para los 792 M de parámetros, más overhead del adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas, incluso en 4-bit en GPUs de gama baja.
- Opciones de despliegue: transformers + PEFT (el método documentado por el autor), y potencialmente llama.cpp u Ollama si se convierte el modelo fusionado a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tropicalfrog/flan-t5-large-paraphrase | 792 M + 9,14 M LoRA | 512 | Inversión de hechos | Apache 2.0 | Hugging Face (adaptador) |
| google/flan-t5-large | 792 M | 512 | Text2text general | Apache 2.0 | Hugging Face |
| google/flan-t5-base | 220 M | 512 | Text2text general | Apache 2.0 | Hugging Face |
| google/flan-t5-xl | 3 B | 512 | Text2text general | Apache 2.0 | Hugging Face |

La comparación relevante es con el base sin adaptador: este modelo no mejora capacidades generales, solo especializa la salida en la tarea de inversión. Frente a `flan-t5-base` fine-tuned en la misma tarea, el autor reporta una tasa de copia directa mucho menor (1,2 % frente a 12,2 %), lo que sugiere mejor adherencia a la instrucción de inversión.

## Limitaciones y advertencias

- Modelo de nicho: solo realiza inversión de hechos; no es adecuado para generación general, código, matemáticas ni razonamiento.
- Datos sintéticos: el entrenamiento usa 3000 pares generados, lo que puede introducir sesgos y artefactos de la generación automática.
- Riesgo de alucinación: aunque la tarea es de reescritura, el modelo puede alterar entidades o números en casos no vistos.
- Contexto limitado a 512 tokens, heredado del base.
- Idiomas: no se declaran; presumiblemente inglés, dado el dataset y los ejemplos.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del base `google/flan-t5-large`, cuya licencia también es Apache 2.0.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- El tamaño del repo reportado (0,0 GB) genera dudas sobre la integridad de los ficheros subidos.
- No hay información sobre sesgos demográficos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/tropicalfrog/flan-t5-large-paraphrase
- Modelo base: https://huggingface.co/google/flan-t5-large
- PEFT (librería usada): https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
