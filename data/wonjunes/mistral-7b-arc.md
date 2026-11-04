# wonjunes/mistral-7b-arc

## Resumen

Mistral-7B ARC es un ajuste fino supervisado del modelo base Mistral-7B-v0.1 de Mistral AI, publicado por el usuario wonjunes en HuggingFace. El modelo está especializado en responder preguntas de opción múltiple de carácter científico, concretamente las del corpus ARC (AI2 Reasoning Challenge), y se distribuye con licencia Apache 2.0. No se trata de un modelo nuevo desde el punto de vista arquitectónico: hereda íntegramente la estructura del transformer decoder de Mistral-7B-v0.1, con 7.241.732.096 parámetros y pesos en formato safetensors fp16.

El problema que aborda es acotado pero relevante para la evaluación de razonamiento científico: mejorar la precisión en tareas de selección de respuesta sobre textos de ciencias de nivel escolar y universitario básico. Según la model card, el ajuste combina una etapa de SFT con LoRA sobre los conjuntos de entrenamiento de ARC-Challenge y ARC-Easy, seguida de una etapa de DPO con LoRA sobre OpenBookQA, tras lo cual los adaptadores se fusionan en los pesos fp16 finales.

Su relevancia actual es limitada fuera de ese nicho: se publica como un artefacto de experimentación con cero descargas y cero likes en el momento de la consulta, y no incluye información sobre pipeline, plantillas de chat ni evaluación más allá de ARC. Resulta útil como referencia de ajuste fino ligero sobre Mistral-7B para tareas de QA científico, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Mistral-7B-v0.1) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; el modelo base soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16 safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp16, adaptadores LoRA fusionados) |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.1 sin modificaciones estructurales: un transformer decoder de 7.241 millones de parámetros con atención de ventana deslizante y grouped-query attention, según las especificaciones del modelo base de Mistral AI. El autor no documenta cambios en la arquitectura ni en el tokenizador; el ajuste se realiza exclusivamente mediante adaptadores LoRA que posteriormente se fusionan en los pesos fp16.

El entrenamiento consta de dos etapas según la model card. La primera es un SFT con LoRA sobre los conjuntos de entrenamiento de ARC-Challenge y ARC-Easy, con el formato de prompt `Question: ...\nAnswer: ...` y cálculo de pérdida únicamente sobre los tokens de respuesta. La segunda es un DPO con LoRA sobre el conjunto de entrenamiento de OpenBookQA, donde la respuesta elegida es la opción correcta y las rechazadas son los distractores, con beta = 0.1. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros de LoRA (rango, alpha, dropout) ni la tasa de aprendizaje.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base.
- Respuesta a preguntas de opción múltiple de contenido científico en el formato `Question: ...\nAnswer: ...`.
- Razonamiento sobre textos de ciencias de nivel escolar y preuniversitario (ARC-Challenge y ARC-Easy).
- Selección de respuesta en tareas de QA científico con distractores plausibles (entrenado vía DPO sobre OpenBookQA).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del formato de QA.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Evaluación académica de razonamiento científico: el modelo puede emplearse como baseline ajustado en experimentos que comparen estrategias de SFT y DPO sobre ARC, ya que reproduce el pipeline descrito y permite medir la mejora frente al Mistral-7B-v0.1 original (57,00 → 71,67 en acc para ARC-Challenge a 25-shot).
- Generación de conjuntos de preguntas de ciencias para docencia: dado un enunciado y opciones, el modelo selecciona la respuesta correcta siguiendo el formato de entrenamiento, lo que permite construir bancos de preguntas verificadas con revisión humana.
- Filtrado y anotación semiautomática de datasets de QA científico: el modelo puede puntuar o clasificar opciones en corpus de ciencias, reduciendo el coste de anotación manual en pipelines de curación de datos.
- Investigación en alineación y preferencias: al haberse entrenado con DPO sobre OpenBookQA, sirve como caso de estudio reproducible para analizar el efecto del DPO en tareas de opción múltiple con distractores.
- Prototipado de asistentes de estudio offline: con 7.241 millones de parámetros y pesos fp16, puede desplegarse en una GPU de 24 GB para responder preguntas de ciencias en entornos sin conectividad, siempre que se acepte su especialización limitada.
- Comparación de técnicas de ajuste eficiente: el repositorio documenta la fusión de adaptadores LoRA en fp16, lo que lo convierte en un ejemplo práctico para validar pipelines de merge y evaluar la degradación o mejora respecto al modelo base.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación con lm-eval, 25-shot):

| Benchmark | Mistral-7B-v0.1 (acc) | Mistral-7B-v0.1 (acc_norm) | This model (acc) | This model (acc_norm) |
|---|---|---|---|---|
| ARC-Challenge | 57,00 | 61,43 | 71,67 | 74,74 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, ARC-Easy, OpenBookQA u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-18 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones basadas en el tamaño de parámetros, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para fp16 en single-GPU; RTX 3090 (24 GB) también suficiente en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y modelos con 16 GB o más en fp16; en GPUs de 8-12 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: vLLM, TGI y llama.cpp son compatibles con pesos safetensors de Mistral-7B, aunque este checkpoint no incluye plantilla de chat ni configuración de generación específica; Ollama requeriría conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC-Challenge (acc) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wonjunes/mistral-7b-arc | 7.241.732.096 | no disponible | 71,67 (25-shot) | apache-2.0 | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-v0.1 | 7.241.732.096 | 32.768 tokens | 57,00 (25-shot) | apache-2.0 | HuggingFace, ampliamente usado |
| mistralai/Mistral-7B-Instruct-v0.1 | 7.241.732.096 | 32.768 tokens | no disponible | apache-2.0 | HuggingFace, ampliamente usado |

La comparación directa con Mistral-7B-Instruct-v0.1 en ARC no está disponible en la información proporcionada. No se dispone de datos de otros modelos ajustados específicamente para ARC con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se limita a QA de opción múltiple en formato `Question: ...\nAnswer: ...`; el rendimiento fuera de ese formato no está evaluado y puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente fuera del dominio científico de ARC.
- Idioma: únicamente inglés según la model card; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez; al heredar los pesos de Mistral-7B-v0.1, arrastra los sesgos del corpus de entrenamiento original.
- Contexto: la model card no especifica la longitud de contexto efectiva tras el ajuste; se asume la del modelo base, pero no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica sin descargas ni validación externa.
- Producción: al no incluir plantilla de chat, configuración de generación ni evaluaciones adicionales, no es recomendable desplegarlo en producción sin una validación propia exhaustiva.
- Reproducibilidad: no se documentan hiperparámetros de LoRA, composición exacta del dataset ni semillas, lo que dificulta reproducir el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/wonjunes/mistral-7b-arc
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Dataset ARC: no disponible en la información proporcionada
- Dataset OpenBookQA: no disponible en la información proporcionada
- Paper de referencia de Mistral-7B: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
