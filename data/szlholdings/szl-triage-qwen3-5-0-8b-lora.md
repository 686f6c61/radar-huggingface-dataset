# SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora

## Resumen

szl-triage-qwen3.5-0.8b-lora es un adaptador LoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se distribuye como artefacto de la librería PEFT en formato safetensors y está orientado a tareas de triaje (clasificación y enrutado de casos) dentro del ecosistema de IA gobernada de la organización. El repositorio tiene un tamaño declarado de 0.0 GB, lo que es coherente con un adaptador de bajo rango y no con pesos completos.

El modelo se presenta como parte de una "governed-AI estate": la model card insiste en la trazabilidad mediante recibos (receipts) de entrenamiento y evaluación, y etiqueta explícitamente como UNKNOWN cualquier dato que no esté respaldado por una medición fechada. Esta filosofía de documentación es relevante porque, en la práctica, el repositorio no incluye métricas de calidad verificadas: el escaneo de recibos de 2026-11-22 clasifica el artefacto como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no un DONE.json en el estándar estricto del estate.

Por tanto, nos encontramos ante un adaptador pequeño, de licencia Apache 2.0, declarado únicamente para inglés y sin evidencia publicada de rendimiento. Su interés es principalmente operativo: ejemplifica un patrón de despliegue de triaje sobre un modelo de 0.8B parámetros, apto para entornos con recursos limitados, pero cuya calidad real debe validarse por el usuario antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base declara 0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente corresponde a Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5, sobre el que se aplican matrices de bajo rango entrenadas para la tarea de triaje. Al cargarse mediante PEFT, el adaptador se combina con los pesos base en tiempo de inferencia, de modo que el coste de almacenamiento y distribución es mínimo y el modelo resultante hereda las capacidades del base.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens vistos, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card no detalla hiperparámetros del LoRA (rango, alpha, módulos objetivo) ni la estrategia de entrenamiento. Tampoco se documenta ninguna innovación técnica específica más allá del propio esquema de recibos del estate. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa.

## Capacidades

- Generación de texto condicionada al adaptador, orientada a tareas de triaje y clasificación de entradas.
- Enrutado y etiquetado de casos: la denominación "triage" sugiere asignación de categorías o prioridades a textos de entrada.
- Herencia de las capacidades del modelo base Qwen3.5-0.8B, incluidas generación de texto general y comprensión lectora básica, en la medida en que el LoRA no las degrade.
- Soporte multilingüe limitado: los metadatos declaran únicamente inglés.
- Tool calling y function calling: no disponible en la información proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el adaptador puede clasificar entradas de texto en categorías predefinidas y asignar prioridad, aprovechando el bajo coste de un modelo de 0.8B para procesar volúmenes altos de tickets en tiempo casi real.
- Enrutado de correo entrante: integrado en un pipeline de ingesta, el modelo etiqueta mensajes por departamento o urgencia antes de derivarlos al equipo correspondiente.
- Moderación preliminar de contenido: uso como primer filtro para señalar textos que requieran revisión humana, con el modelo base actuando como clasificador ligero.
- Clasificación de consultas en asistentes conversacionales: determinar la intención del usuario al inicio de una conversación para seleccionar el flujo o el modelo especializado adecuado.
- Etiquetado asistido de datasets: generación de etiquetas preliminares sobre corpus de texto que luego se revisan manualmente, reduciendo el esfuerzo de anotación.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 0.8B, puede ejecutarse en CPU o en GPUs de gama de entrada, lo que facilita su uso en edge o en infraestructura modesta.
- Evaluación comparativa de pipelines de triaje: servir como línea base ligera frente a clasificadores dedicados o modelos mayores en pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ninguna cifra de benchmark más allá de lo medido en una auditoría fechada, y el escaneo de recibos de 2026-11-22 marca la evidencia de evaluación como UNKNOWN (sin DONE.json en el estándar estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre un modelo base de 0.8B, los requisitos vienen determinados por el base y la cuantización elegida. En fp16, un modelo de 0.8B ocupa aproximadamente 1.6 GB de pesos, a los que se suman overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en fp16; GPUs de gama de entrada como RTX 3060 o superiores son suficientes. Para despliegues de alto throughput, A100 o H100 permitirían batchear muchas peticiones, aunque el modelo es probablemente demasiado pequeño para aprovecharlas.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas con 4 GB o más, así como en CPU para cargas moderadas.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI para servir el modelo fusionado; llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-triage-qwen3.5-0.8b-lora | Adaptador sobre 0.8B | No disponible | Apache 2.0 | Hugging Face | Sin benchmarks publicados; evidencia de evaluación UNKNOWN |
| Qwen3.5-0.8B (base) | 0.8B | No disponible | Segun el modelo base | Hugging Face | Modelo generalista sin especializar en triaje |
| Clasificadores ligeros tipo BERT/DistilBERT | 60-110M | 512 tokens tipicamente | Apache 2.0 / MIT | Hugging Face | Específicos para clasificación, sin generación libre |

La comparación con alternativas es limitada porque no se dispone de datos de rendimiento del adaptador. Frente a un clasificador BERT, el enfoque LoRA sobre un modelo generativo ofrece flexibilidad de instrucciones pero mayor coste computacional; frente al base sin adaptar, el LoRA añade especialización a costa de un posible olvido catastrófico no documentado.

## Limitaciones y advertencias

- Ausencia de evidencia de evaluación: la model card marca la evidencia como UNKNOWN y el escaneo de recibos no encuentra un DONE.json válido. No hay garantía medida de calidad.
- Riesgo de alucinación: al ser un modelo generativo, puede producir salidas plausibles pero incorrectas, especialmente en tareas de clasificación estricta.
- Idiomas: declarado solo para inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: no se especifica la longitud de contexto soportada por el adaptador ni por el base en esta ficha.
- Sesgos: no documentados; el adaptador hereda los sesgos del modelo base y de los datos de entrenamiento del LoRA, que no se describen.
- Licencia: Apache 2.0 permite uso comercial, pero la nota de licencia del estate indica que el tag fue asignado por operaciones sin evidencia por fichero del upstream; conviene verificar la licencia del modelo base Qwen3.5-0.8B de forma independiente.
- Producción: no recomendable sin una validación propia sobre el dominio objetivo, dado que no hay métricas publicadas ni documentación de hiperparámetros del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio estate-cards: https://github.com/szl-holdings/estate-cards
