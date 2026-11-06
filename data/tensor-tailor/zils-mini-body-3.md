# tensor-tailor/zils-mini-body-3

## Resumen

zils-mini-body-3 es un ajuste fino (finetune) de tipo "decision body" desarrollado por el usuario tensor-tailor para el pool de modelos tipo "soup" del proyecto Zils, en la subred 127 de Bittensor. El modelo parte de la media uniforme en fp32 de dos cuerpos de la casa d3-mini (torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini), ambos bajo licencia Apache-2.0, y sobre esa base aplica un ajuste con LoRA fusionado orientado a las familias de preguntas donde un cuerpo anterior del autor rendía peor. El chasis subyacente es zils-ai/d3-mini-4.5b-v1, cuyo padre es Qwen/Qwen3.5-4B, por lo que hereda la arquitectura y el layout de tensores de Qwen3.5-4B en bf16.

El modelo tiene 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y el repositorio ocupa 9,1 GB en safetensors. Es relevante en el contexto de los modelos de decisión especializados que compiten en la subred 127 de Bittensor: se trata de un intento de asiento ("seat attempt") que, según el propio autor, no superó su cribado pre-registrado. Es decir, el autor lo publica con transparencia metodológica pero advierte de que no alcanzó los umbrales que él mismo había fijado antes de entrenar.

La información disponible es limitada: no hay datos de benchmarks públicos, no se especifican idiomas soportados ni el pipeline, y la model card está centrada en la metodología de entrenamiento y en las comprobaciones de juego limpio (fair-play) frente a los conjuntos de desarrollo y semilla del proyecto Zils.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout Qwen3.5-4B, con proyecciones de atención y Gated-DeltaNet); chasis zils-ai/d3-mini-4.5b-v1 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (las filas de entrenamiento se limitaron a 2.048 tokens; el contexto del chasis Qwen3.5-4B no se detalla) |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16; el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se construye sobre el chasis d3-mini-4.5b-v1, que a su vez deriva de Qwen/Qwen3.5-4B. La arquitectura es un transformer con proyecciones de atención y capas Gated-DeltaNet (una variante de atención lineal/estado recurrente) en las 32 capas del lenguaje. Los pesos iniciales son la media uniforme en fp32 de todos los tensores del chasis entre torchcast-ai/torchcast-decision-4b @492bfb19 y vllm-sr/d3-mini @df99bf4c. Sobre esa media se aplica un LoRA de rango 16, alpha 32, dropout 0.05 y tasa de aprendizaje 1e-4 (warm-up lineal de 50 pasos y decaimiento coseno sobre la época), con batch 8 y acumulación de gradiente 2, semilla 4343. El LoRA se dirige a las proyecciones de atención y Gated-DeltaNet de las 32 capas del lenguaje (152 matrices) y se fusiona en los pesos, almacenándose en bf16. El checkpoint publicado corresponde al paso 0.75 de la única época.

El entrenamiento usa 34.687 filas de entrada: 9.792 filas "dirigidas" (aimed), 9.791 filas "naturales" y 15.104 filas reutilizadas de cuerpos anteriores (preguntas de resultados fechados, preguntas de herramientas generadas y filas de GSM8K). La función de pérdida combina entropía cruzada sobre las filas etiquetadas y divergencia KL hacia las probabilidades precalculadas de la media inicial sobre las filas de regularización (14.819 preguntas, etiquetas ignoradas). No hay término de destilación de profesor. Las filas de más de 2.048 tokens se descartaron, no se truncaron. El cambio relativo de los tensores de lenguaje respecto a Qwen/Qwen3.5-4B es de 0.018, dentro del límite de 0.15 que impone Zils. Las comprobaciones de juego limpio descartaron 551 filas por copiar elementos de desarrollo o semilla y 4 por duplicados.

## Capacidades

- Generación de texto y razonamiento sobre familias de preguntas de tipo "known-choice", "known no-label" y "known-score", según la composición del dataset de entrenamiento.
- Respuesta a preguntas de recuperación (retrieval) con puntuación, según las familias "retrieval known-score" presentes en los datos.
- Razonamiento aritmético y de sentido común: incluye 2.000 filas de GSM8K en el conjunto de entrenamiento.
- Uso de herramientas (tool calling): el dataset incluye 4.500 preguntas de herramientas generadas con respuestas calculadas.
- Preguntas sobre resultados fechados (outcomes) de ediciones de Wikipedia y Wikidata y de categorías de listados de arXiv.
- Capacidades de visión: el chasis declara tensores de lenguaje y visión de Qwen3.5-4B, aunque la información disponible no detalla el uso efectivo de visión en este finetune.
- Multilingüismo: el dataset incluye resultados de ediciones de Wikipedia en 9 ediciones lingüísticas, pero no se documenta el soporte multilingüe general del modelo.
- No se documentan capacidades de agente multi-paso, modo "thinking" explícito ni audio.

## Casos de uso

- Clasificación y decisión sobre familias de preguntas cerradas: el modelo está entrenado específicamente para preguntas de tipo "known-choice" y "known-score", por lo que encaja en pipelines de evaluación automatizada donde hay que elegir entre opciones o asignar una puntuación a una respuesta.
- Respuesta a preguntas de recuperación con puntuación: las 1.682 filas de "retrieval known-score" lo orientan a tareas donde se recupera evidencia y se puntúa su relevancia o corrección.
- Verificación de hechos con fecha: las 8.604 preguntas de resultados fechados (ediciones de Wikipedia y Wikidata, categorías de arXiv) lo hacen adecuado para tareas de comprobación de si un evento ocurrió antes de una fecha dada.
- Razonamiento aritmético acotado: las 2.000 filas de GSM8K permiten usarlo en problemas de matemáticas de primaria/secundaria dentro de un pipeline de evaluación, no como calculadora de producción.
- Uso de herramientas en flujos controlados: las 4.500 preguntas de herramientas generadas con respuestas calculadas permiten integrarlo en un bucle de llamada a funciones donde la respuesta se computa y se compara.
- Participación en el pool Zils de Bittensor (subred 127): el modelo está diseñado como "decision body" para el pool "soup" de d3-mini, por lo que su caso de uso principal es competir o combinarse en ese entorno.
- Investigación sobre metodología de finetune y fair-play: la model card documenta con detalle el proceso de selección de datos, las comprobaciones anti-fuga y la regla de selección de checkpoints, lo que lo convierte en un caso de estudio reproducible para investigadores que trabajan en evaluación de modelos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta las ganancias de "soup" del autor sobre sus dos conjuntos de desarrollo propios: +0.63 en mini_combo50 y +0.86 en mini_dev_gold (frente a +0.61/+0.89 del cuerpo final y +0.63/+0.58 del cuerpo 0.5). No son métricas comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,54 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 9,1 GB; en fp16 serían unos 9,1 GB y en cuantización de 8 bits unos 4,5 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo con 12-16 GB de VRAM en bf16 (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090) y en GPUs de datacenter como A100 o H100, pero esto es una estimación por tamaño, no un dato del autor.
- Cabe en GPU de consumo: probablemente sí en bf16 con 16 GB o más, y con cuantización en GPUs de 8-12 GB, aunque no se documenta.
- Opciones de despliegue: no disponible. El repositorio incluye código personalizado (tag custom_code) y el modelo base se asocia a vLLM en el nombre del segundo padre (vllm-sr/d3-mini), pero no se especifican instrucciones de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensor-tailor/zils-mini-body-3 | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face | Finetune LoRA sobre media de dos cuerpos d3-mini; intento de asiento no validado por su propio cribado |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | Apache-2.0 | Hugging Face | Uno de los dos cuerpos base de la media inicial |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 | Hugging Face | Segundo cuerpo base de la media inicial |
| Qwen/Qwen3.5-4B | no disponible (aproximadamente 4B por el nombre) | no disponible | Apache-2.0 | Hugging Face | Modelo padre del chasis; referencia arquitectónica |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que este cuerpo no superó su cribado pre-registrado; se publica como intento de asiento, no como modelo validado.
- Riesgo de alucinación: es un modelo de decisión entrenado sobre familias de preguntas concretas; fuera de ese dominio no hay garantías de calidad.
- Sesgos conocidos: no documentados en la información disponible; el dataset incluye fuentes públicas (Wikipedia, Wikidata, arXiv, GSM8K) con los sesgos inherentes a esas fuentes.
- Limitaciones de contexto: las filas de entrenamiento se limitaron a 2.048 tokens y se descartaron las más largas; el contexto efectivo del chasis no se documenta.
- Idiomas: no se especifican los idiomas soportados; el dataset incluye 9 ediciones lingüísticas de Wikipedia, pero no hay una declaración de cobertura multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3.5-4B y de dos cuerpos d3-mini, todos Apache-2.0 según la model card; conviene verificar las licencias de los datasets de entrenamiento (Wikipedia CC BY-SA 4.0, Wikidata CC0 1.0, arXiv CC0 1.0, GSM8K MIT) si se redistribuye.
- El repositorio solo contiene pesos, no texto de entrenamiento; la reproducibilidad completa no es posible sin los datos originales.
- El tag custom_code implica que la carga requiere código personalizado; no se documenta compatibilidad con librerías estándar.
- No hay datos de benchmarks públicos ni de latencia/throughput, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- [Hugging Face: tensor-tailor/zils-mini-body-3](https://huggingface.co/tensor-tailor/zils-mini-body-3)
- [Hugging Face: torchcast-ai/torchcast-decision-4b](https://huggingface.co/torchcast-ai/torchcast-decision-4b)
- [Hugging Face: vllm-sr/d3-mini](https://huggingface.co/vllm-sr/d3-mini)
- [Hugging Face: zils-ai/d3-mini-4.5b-v1](https://huggingface.co/zils-ai/d3-mini-4.5b-v1)
- [Hugging Face: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Hugging Face: tensor-tailor/zils-mini-body-2](https://huggingface.co/tensor-tailor/zils-mini-body-2)
- [Hugging Face: tensor-tailor/zils-mini-body-1](https://huggingface.co/tensor-tailor/zils-mini-body-1)
