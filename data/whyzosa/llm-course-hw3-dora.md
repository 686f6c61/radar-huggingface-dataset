# WhyZosa/llm-course-hw3-dora

## Resumen

`WhyZosa/llm-course-hw3-dora` es un ajuste fino del modelo instructivo `OuteAI/Lite-Oute-1-300M-Instruct` realizado por el usuario WhyZosa como parte de la tarea 3 de un curso sobre modelos de lenguaje (HSE LLM Course). El modelo aplica DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el modelo base para una tarea concreta: clasificación de sentimiento en tuits en inglés, usando el conjunto de datos `cardiffnlp/tweet_eval`. No es un modelo de propósito general, sino un artefacto académico orientado a una tarea de clasificación de tres clases (positivo, neutral, negativo).

El modelo base es un transformer Mistral de 300M de parámetros (según la nomenclatura del autor), aunque el repositorio declara 448.000 parámetros en safetensors, lo que sugiere que el checkpoint publicado contiene únicamente los adaptadores DoRA y no los pesos completos del modelo base. El tamaño del repositorio es de 0,1 GB, coherente con un conjunto de adaptadores de bajo rango más que con un modelo completo.

Su relevancia es limitada fuera del contexto educativo: se trata de un ejercicio de fine-tuning con DoRA, con un rendimiento modesto (Macro F1 de 0,521 en test) y sin datos publicados sobre benchmarks generales. Resulta útil como referencia para quienes quieran reproducir un pipeline de adaptación con DoRA sobre modelos pequeños, o como ejemplo de clasificación de sentimiento con un modelo de 300M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Mistral (modelo base `OuteAI/Lite-Oute-1-300M-Instruct`); adaptación DoRA |
| Parametros totales | 448.000 (según safetensors del repo; corresponde a los adaptadores, no al modelo base completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer causal de tipo Mistral con aproximadamente 300M de parámetros, y aplica sobre él una adaptación DoRA. DoRA descompone los pesos en magnitud y dirección, aplicando una actualización de bajo rango sobre la componente de dirección; se trata de una variante de LoRA que en la literatura suele mejorar la estabilidad y el rendimiento frente a LoRA estándar con el mismo presupuesto de parámetros. El repositorio publicado contiene únicamente los pesos adaptados (448.000 parámetros en safetensors), por lo que para la inferencia es necesario cargar el modelo base y superponer los adaptadores.

El entrenamiento se realizó en dos fases: primero sobre 10.000 tuits del conjunto `cardiffnlp/tweet_eval` y después una época adicional sobre la totalidad de la partición de entrenamiento. La tarea es de clasificación de sentimiento en tres clases (positive, neutral, negative), formulada como modelado causal de lenguaje estándar, es decir, el modelo genera la etiqueta como texto en lugar de usar una cabeza de clasificación dedicada. No se documentan detalles sobre hiperparámetros, tasa de aprendizaje, rango de DoRA, precisión de entrenamiento ni composición exacta del dataset más allá de la referencia a TweetEval.

## Capacidades

- Clasificación de sentimiento en inglés sobre texto corto (tuits) en tres categorías: positive, neutral y negative.
- Generación de texto condicionada por prompt, heredada del modelo base instructivo, aunque el ajuste está orientado a la tarea de clasificación.
- Formulación de la clasificación como generación de etiqueta textual (no requiere cabeza de clasificación).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés (idioma declarado `en`).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación de sentimiento en redes sociales: el modelo puede etiquetar tuits en inglés como positive, neutral o negative, aprovechando el ajuste específico sobre TweetEval. Adecuado para prototipos de monitorización de opinión, aunque con un F1 modesto (0,521).
- Análisis de opinión en encuestas abiertas: útil para procesar respuestas cortas en inglés y agregar sentimiento a nivel de lote, siempre que se valide el rendimiento en el dominio concreto.
- Filtrado previo de reseñas: como primer paso en un pipeline de moderación o priorización de quejas, etiquetando reseñas breves antes de pasar a un modelo mayor.
- Reproducción educativa de DoRA: sirve como referencia práctica para estudiantes e investigadores que quieran replicar un flujo de adaptación con DoRA sobre un modelo de 300M y comparar con LoRA.
- Base para fine-tuning posterior: al ser un adaptador sobre `OuteAI/Lite-Oute-1-300M-Instruct`, puede servir como punto de partida para experimentos con otras tareas de clasificación en inglés.
- Evaluación comparativa de técnicas PEFT: útil en experimentos académicos que comparen DoRA frente a LoRA u otras variantes con presupuesto de parámetros similar en tareas de clasificación de texto corto.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| TweetEval (test) | Macro F1 | 0,521 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye ejemplos cualitativos de la partición de test, con al menos un caso de error (un tuit negativo clasificado como positive).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 300M en precisión FP16 requiere aproximadamente 0,6 GB de pesos; en FP32, en torno a 1,2 GB. Los adaptadores DoRA añaden un coste despreciable (448.000 parámetros).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior resulta holgada. Para despliegues en servidor, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (carga del modelo base más adaptadores), text-generation-inference (el repo declara compatibilidad con TGI y endpoints), y potencialmente llama.cpp u Ollama si se fusionan los adaptadores con el modelo base y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `WhyZosa/llm-course-hw3-dora` | 448.000 (adaptadores sobre base de 300M) | no disponible | Clasificación de sentimiento (TweetEval) | apache-2.0 | Hugging Face |
| `OuteAI/Lite-Oute-1-300M-Instruct` (modelo base) | ~300M | no disponible | Generación de texto instructiva | no disponible en la información | Hugging Face |
| `sodeniZz/llm-course-hw3-dora` | no disponible | no disponible | Clasificación de sentimiento (misma tarea, mismo curso) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Rendimiento modesto: Macro F1 de 0,521 en TweetEval indica una capacidad de clasificación limitada; no es adecuado para producción sin validación adicional y posible reentrenamiento.
- Sesgos: al entrenarse sobre TweetEval, hereda los sesgos de ese corpus (predominio de ciertos registros, temas y demografía de Twitter); no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: al formularse como generación causal, el modelo puede producir etiquetas fuera del conjunto esperado o texto libre en lugar de una de las tres clases; requiere post-procesado y validación de la salida.
- Limitaciones de idioma: solo inglés; no se garantiza comportamiento en otros idiomas.
- Restricciones de licencia: licencia apache-2.0 declarada, lo que permite uso comercial, pero conviene verificar la licencia del modelo base `OuteAI/Lite-Oute-1-300M-Instruct`, que no se detalla en la información disponible.
- Caveat de producción: el repositorio contiene solo los adaptadores (448.000 parámetros), no los pesos completos; es imprescindible cargar el modelo base para la inferencia. El modelo no ha sido evaluado más allá de TweetEval y carece de documentación sobre robustez, latencia o comportamiento fuera de dominio.
- Origen académico: se trata de un trabajo de curso (HSE LLM Course, tarea 3), sin mantenimiento ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/WhyZosa/llm-course-hw3-dora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Repositorio relacionado (misma tarea): https://huggingface.co/sodeniZz/llm-course-hw3-dora
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/georgebu/llm-course-hw3-dora
