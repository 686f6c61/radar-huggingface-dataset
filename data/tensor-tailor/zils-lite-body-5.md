# tensor-tailor/zils-lite-body-5

## Resumen

zils-lite-body-5 es un modelo de decisión ("decision body") publicado por el usuario tensor-tailor en Hugging Face, pensado para el pool de mezclas (soup pool) del proyecto Zils, asociado al subnet 127 de Bittensor. Se trata de un fine-tune sobre el chasis d3-lite, que a su vez se apoya en Qwen3.5-0.8B, e incorpora tanto tensores de lenguaje como de visión en formato bf16. El modelo cuenta con 852.985.920 parámetros totales y un repositorio de 1,7 GB.

El modelo no es un modelo de propósito general, sino una pieza especializada en la toma de decisiones sobre opciones: responde eligiendo entre alternativas (selección de herramientas, clasificación, conteo, inferencia lógica, sílabas, problemas aritméticos verbales y decisiones procedimentales). Su entrenamiento combina destilación de un modelo mayor (vllm-sr/d3-ultra), datos generados sintéticamente con respuestas calculadas y regularización mediante divergencia KL.

Es relevante ahora porque documenta un flujo de trabajo típico de los pools de modelos de Bittensor: mezcla uniforme de pesos, fine-tuning LoRA sobre las capas superiores, destilación y validación por etapas. La model card es inusualmente transparente sobre el proceso, incluidos los fallos de la primera ejecución y la pérdida de pesos, lo que lo convierte en un caso de estudio útil sobre reproducibilidad en fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (chasis Qwen3.5-0.8B, tensores de lenguaje y visión) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las filas de entrenamiento se truncaron a 1.024 tokens) |
| Tipos de cuantización | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de la media uniforme en fp32 de dos cuerpos previos (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5), construida con la herramienta `soup.build` de Zils sobre el chasis vllm-sr/d3-lite a temperatura 1.0. Sobre esa base se aplica un LoRA de rango 16 y alpha 32, únicamente en las capas de lenguaje 16 a 23 (las 8 superiores de 24), con learning rate 1e-4, warm-up lineal de 50 pasos y decaimiento coseno, batch 16 y semilla 1111. El LoRA se fusiona en los pesos y se almacena en bf16; el resto de tensores permanece idéntico al punto de partida.

La función de pérdida es una combinación de entropía cruzada sobre las filas etiquetadas, divergencia KL hacia las probabilidades de opción del profesor (vllm-sr/d3-ultra) en las filas de destilación, y KL hacia las probabilidades previas del propio modelo inicial en las filas de regularización. El entrenamiento se dividió en dos etapas: la primera completó 10.460 pasos y la segunda añadió 653 pasos sobre 9.600 filas, de las cuales 2.399 eran preguntas falladas por la etapa 1 en un pool nuevo de 21.600 preguntas, 1.238 correctas del mismo tipo y 5.963 de replay. En total se usaron 154.288 filas antes del límite de longitud (151.780 usadas y 2.508 descartadas en la primera etapa). La variación relativa de las capas de lenguaje respecto a Qwen/Qwen3.5-0.8B es de 0,048, por debajo del límite de 0,15 del proyecto Zils.

## Capacidades

- Selección de herramientas y puntuación de argumentos (tool choice, no-tool y argument scoring).
- Política de llamadas a herramientas (tool-call policy) y cobertura de herramientas.
- Clasificación y decisión sobre opciones en tareas de NLI multilingüe, análisis de sentimiento financiero, ARC, HellaSwag y WinoGrande.
- Razonamiento aritmético verbal: totales y conteos sobre hechos presentados en prosa, listas, JSON, tablas y texto mixto.
- Inferencia lógica: cadenas de orden de 5 a 7 personas con hechos distractores, cadenas de categorías de 3 a 4 pasos con reglas señuelo, saltos de ubicación de 3 a 5 niveles y reglas si-entonces encadenadas.
- Conteo de sílabas sobre el diccionario de pronunciación CMU.
- Decisiones procedimentales tipadas (procedural decisions) a partir de un dataset específico.
- Capacidad de visión heredada de los tensores del chasis Qwen3.5-0.8B (no documentada explícitamente en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo está orientado a decisiones de un solo paso.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo puede elegir qué herramienta invocar y con qué argumentos en un pipeline de function calling, gracias a que fue entrenado específicamente con filas de tool choice y argument scoring.
- Moderación y clasificación de intenciones: permite decidir el alcance de una petición (intent scope) en un sistema de atención al cliente, usando las 6.244 filas de intención del entrenamiento como referencia de comportamiento.
- Extracción de totales y conteos en documentos: útil para procesar inventarios en JSON, tablas o listas y calcular agregados, un caso cubierto por las 25.200 filas de cálculo del dataset.
- Validación de reglas de negocio: las cadenas si-entonces y las reglas señuelo permiten usar el modelo para comprobar si una decisión cumple un conjunto de reglas encadenadas, por ejemplo en sistemas de aprobación.
- Análisis de sentimiento financiero: entrenado con twitter-financial-news-sentiment, puede clasificar titulares o tuits financieros en categorías de sentimiento como paso previo a un sistema de alertas.
- Deduplicación y normalización de texto: el conteo de sílabas y las formas de palabra permiten usarlo en tareas de métricas lingüísticas, como el cálculo de legibilidad o la generación de rimas.
- Evaluación de modelos en pools de Bittensor: sirve como cuerpo candidato en el pool d3-lite, donde otros mineros pueden mezclarlo o fine-tunearlo siguiendo la guía de minería de Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el proceso de entrenamiento y las reglas de selección de checkpoints, pero no incluye métricas de evaluación (MMLU, HumanEval, GSM8K u otras) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bf16 (tamaño del repositorio); en cuantización de 8 bits rondaría 0,9 GB y en 4 bits unos 0,5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue en servidor, una T4 o L4 es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: al usar custom_code y el chasis d3-lite, la vía prevista es vLLM (el chasis se llama vllm-sr/d3-lite). No se ha confirmado soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-5 | 852.985.920 | no disponible | apache-2.0 | Hugging Face | Fine-tune de decisión sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Hugging Face | Modelo base del chasis |
| thermopylae-777/zils-lite-body-2 | no disponible | no disponible | apache-2.0 | Hugging Face | Cuerpo previo del pool, usado en la mezcla |
| dasLOL/zils-lite-skills-v5 | no disponible | no disponible | apache-2.0 | Hugging Face | Cuerpo previo del pool, usado en la mezcla |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisiones sobre opciones y no en generación abierta de texto; su uso fuera de ese dominio puede degradar la calidad.
- La primera ejecución del entrenamiento no superó la regla de corona pre-registrada del proyecto y sus pesos se perdieron antes de la subida; los pesos actuales son una re-ejecución con la misma receta pero con un digest distinto (d2e11c31... frente a 933ce387...), lo que introduce incertidumbre sobre la reproducibilidad exacta.
- Las filas de entrenamiento se truncaron a 1.024 tokens, por lo que el comportamiento en contextos más largos no está validado.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; al ser un modelo de 0,8B, la tasa de alucinación en tareas abiertas puede ser alta.
- La licencia apache-2.0 permite uso comercial, pero el modelo incorpora pesos derivados de Qwen3.5-0.8B y de otros cuerpos del pool; conviene verificar las condiciones de los modelos base antes de un despliegue comercial.
- El uso de custom_code implica que la carga del modelo requiere confiar en el código del repositorio, lo que añade un riesgo de seguridad en entornos de producción.
- No se declaran idiomas soportados; el entrenamiento incluye NLI multilingüe, pero no hay garantía de cobertura fuera del inglés.
- El modelo está pensado para el pool de Bittensor subnet 127 y su guía de minería; su uso fuera de ese contexto no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-5
- Perfil del autor: https://huggingface.co/tensor-tailor
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo thermopylae-777/zils-lite-body-2: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Cuerpo previo dasLOL/zils-lite-skills-v5: https://huggingface.co/dasLOL/zils-lite-skills-v5
- Chasis vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Dataset de respuestas del relay: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Organización tasksource: https://huggingface.co/tasksource
