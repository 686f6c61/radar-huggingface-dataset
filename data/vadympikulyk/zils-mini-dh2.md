# VadymPikulyk/zils-mini-dh2

## Resumen

zils-mini-dh2 es un modelo de lenguaje derivado de Qwen/Qwen3.5-4B, publicado por el usuario VadymPikulyk en Hugging Face. Se presenta como un "soup body" para Zils, un sistema asociado al subnet 127 de Bittensor, y combina los pesos de un fine-tune de Qwen3.5-4B con la disposición de chasis de d3-mini. El modelo tiene 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un tamaño de repositorio de 9,1 GB en formato safetensors.

El modelo parte del "soup" actual de d3-mini, definido como la media uniforme de los cuerpos asentados qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3, y le añade 0,4 veces un LoRA fusionado entrenado durante una época sobre aproximadamente 47.000 elementos de decisión. Estos elementos se construyeron a partir de particiones TRAIN públicas con sus etiquetas gold, abarcando tareas de razonamiento, comprensión lectora, clasificación de texto, inferencia en lenguaje natural, matemáticas y function calling.

La relevancia del modelo es acotada y específica: se trata de un artefacto orientado a un ecosistema concreto (Zils / Bittensor subnet 127) y a la tarea de decisión, no de un modelo generalista con benchmarks publicados. La licencia Apache-2.0 facilita su reutilización, pero la información disponible sobre capacidades, idiomas y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-4B, con disposición de chasis d3-mini (custom_code) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros, al que se le aplica la disposición de chasis de d3-mini (etiqueta `d3-mini` y `custom_code` en Hugging Face). El proceso de construcción es un model soup: se parte de la media uniforme de los pesos de qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3, y se le suma 0,4 veces un LoRA fusionado.

El LoRA se entrenó durante una época sobre aproximadamente 47.000 elementos de decisión construidos a partir de particiones TRAIN públicas con sus etiquetas gold. Las fuentes citadas incluyen ARC, OpenBookQA, COPA, HellaSwag, WinoGrande, GSM8K, MMLU auxiliary train, ANLI, QuaRTz, CoLA, WiC, MRPC, QQP, PAWS, Yelp, Rotten Tomatoes, AG News, SciTail, BBC News, Enron spam, glaive function calling, GLUE, Social IQa, PIQA, TweetEval, dair-ai/emotion, 20 Newsgroups, SQuAD 2.0, BoolQ, SciQ, CommonsenseQA y otros conjuntos, además de elementos semilla públicos retirados. El autor declara explícitamente que no se usaron elementos de examen de validador, filas de validación/test reservadas ni datos de clientes. No se detalla la composición exacta por tarea, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de decisión, orientado a tareas de elección múltiple y clasificación.
- Entrenamiento específico en tareas de comprensión lectora (SQuAD 2.0, BoolQ, SciQ, OpenBookQA).
- Inferencia en lenguaje natural (ANLI, Social IQa, WinoGrande, COPA, HellaSwag).
- Razonamiento matemático básico (GSM8K).
- Clasificación de texto y análisis de sentimiento (Yelp, Rotten Tomatoes, TweetEval, dair-ai/emotion, AG News, 20 Newsgroups, BBC News, Enron spam).
- Function calling (glaive function calling), lo que sugiere soporte de tool calling.
- Capacidades multilingües: no disponible (el modelo base Qwen3.5-4B es multilingüe, pero no se confirma el alcance tras el fine-tune).
- Modo thinking, visión, audio: no disponible.

## Casos de uso

- Clasificación de texto en producción: el modelo fue entrenado sobre múltiples conjuntos de clasificación (AG News, Yelp, TweetEval, 20 Newsgroups), por lo que puede usarse como clasificador de categorías y sentimiento en pipelines de moderación o enrutamiento.
- Respuesta a preguntas extractivas: su entrenamiento con SQuAD 2.0 y BoolQ lo hace adecuado para sistemas de QA sobre documentos, incluyendo la detección de preguntas sin respuesta.
- Razonamiento de sentido común: con COPA, HellaSwag, WinoGrande y Social IQa en el entrenamiento, puede emplearse en tareas de inferencia causal y social en asistentes conversacionales.
- Evaluación de decisión en entornos de agentes: el formato de "decision-model" sugiere su uso como componente de selección de acciones en sistemas multi-paso, aunque no se detalla la interfaz.
- Function calling en asistentes: el entrenamiento con glaive function calling permite integrarlo en flujos de tool calling para invocar APIs o funciones estructuradas.
- Clasificación de spam y filtrado: el uso de Enron spam en el entrenamiento lo hace aplicable a filtrado de correo no deseado y detección de contenido abusivo.
- Investigación en model soups: su construcción como media de pesos y fusión de LoRA lo convierte en un caso de estudio para experimentos de merging y evaluación de subnet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 4,54 mil millones de parámetros, en FP16 se requieren aproximadamente 9 GB de VRAM, y en cuantización de 8 bits alrededor de 4,5-5 GB, aunque estas cifras son estimaciones genéricas y no han sido verificadas para este modelo.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) en cuantización, y en A100/H100 para FP16.
- Cabe en GPU consumer: probablemente sí en cuantización, pero no confirmado por el autor.
- Opciones de despliegue: no disponible. El uso de `custom_code` y la disposición d3-mini pueden requerir código específico del autor; vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-dh2 | 4,54 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible en la informacion | Hugging Face |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre conjuntos públicos diversos (noticias, redes sociales, spam), puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: no evaluado; el modelo está orientado a tareas de decisión y clasificación, no a generación abierta verificada.
- Limitaciones de contexto o idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas cubiertos tras el fine-tune.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor remite a LICENSE y NOTICE de los modelos padres, que pueden imponer condiciones adicionales.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, sin benchmarks ni validación externa; el uso de `custom_code` implica dependencia de código del autor; la información sobre la interfaz de "decision-model" es insuficiente para integración directa.
- El autor declara que no se usaron datos de validación/test ni de clientes, pero no se aporta auditoría independiente.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-mini-dh2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo padre: https://huggingface.co/vllm-sr/d3-mini
- Modelo padre: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo padre: https://huggingface.co/joamCriff123/zils-mini-sx3
