# VadymPikulyk/zils-lite-dh12

## Resumen

zils-lite-dh12 es un modelo de decisión derivado de Qwen/Qwen3.5-0.8B, publicado por VadymPikulyk y orientado a la subnet 127 de Bittensor (Zils). No es un modelo de chat generalista: es un "cuerpo" (body) en el formato de chasis d3-lite que empaqueta los pesos de lenguaje y visión de un fine-tune de Qwen3.5-0.8B, preparado para responder preguntas tipadas de decisión (elección múltiple, sí/no y puntuación). Su relevancia radica en que muestra el patrón de ensamblaje de modelos para subredes de Bittensor: mezcla de pesos (model soup) más un LoRA fusionado con una receta fija y reproducible.

El modelo parte de la media uniforme de dos cuerpos d3-lite ya asentados (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2, ambos Apache-2.0) y suma 0,7 veces un LoRA fusionado entrenado con la receta `zils.d3` (rango 16, alpha 32, solo módulos de atención, una época, lr 5e-5). El entrenamiento usa objetivos suaves (0,5 × etiqueta gold + 0,5 × respuesta del soup de partida) sobre unos 20.000 ítems de decisión tipados construidos a partir de splits públicos de TRAIN.

Con 852.985.920 parámetros totales y un repositorio de 1,7 GB en safetensors, es un modelo pequeño (sub-1000M) pensado para inferencia económica y para actuar como componente de decisión dentro de un pipeline mayor, no como asistente conversacional. No se han publicado idiomas soportados, pipeline ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-0.8B, en el chasis d3-lite (tag `qwen3_5`, `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code` para cargar) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen/Qwen3.5-0.8B, reempaquetado en el chasis d3-lite (etiquetas `qwen3_5`, `d3-lite`, `soup-body`). El repositorio incluye código personalizado (`custom_code`), por lo que la carga no es directa con `transformers` sin el módulo correspondiente. El modelo conserva los pesos de lenguaje y visión del fine-tune base, según indica la model card.

El entrenamiento combina dos fases: primero, una media uniforme de los dos cuerpos d3-lite asentados el 2026-11-16 (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2); después, un LoRA fusionado con la receta fijada `python -m zils.d3 train` (rango 16, alpha 32, solo módulos de atención, una época, lr 5e-5). El LoRA se entrena sobre ese soup con objetivos suaves: 0,5 × etiqueta gold + 0,5 × la propia respuesta del soup de partida. El conjunto son unos 20.000 ítems de decisión tipados (preguntas de elección, sí/no y puntuación) construidos a partir de splits públicos de TRAIN: ARC (Easy y Challenge), MMLU auxiliary train, OpenBookQA, QuaRTz, WinoGrande, COPA, GSM8K, CommonsenseQA, SciQ, MNLI, CoLA, MRPC, PAWS, SciTail, SMS Spam Collection, BoolQ, QNLI, 20 Newsgroups, dair-ai/emotion, TweetEval irony, Rotten Tomatoes, SST-5 y glaiveai/glaive-function-calling-v2 (decisiones de uso de herramientas), además de ítems aritméticos y de puntuación por rúbrica generados por reglas. La model card declara explícitamente que no se usaron ítems de examen de validador, ni ítems públicos del examen semilla, ni datos de clientes.

## Capacidades

- Respuesta a preguntas de decisión tipadas: elección múltiple, sí/no y puntuación (score), el formato para el que fue entrenado.
- Razonamiento sobre conocimiento factual y de sentido común, por la composición del dataset (ARC, OpenBookQA, CommonsenseQA, SciQ, WinoGrande, COPA).
- Aritmética básica y problemas matemáticos de primaria (GSM8K más ítems aritméticos generados por reglas).
- Clasificación de texto y análisis de sentimiento: emociones (dair-ai/emotion), ironía (TweetEval irony), reseñas (Rotten Tomatoes, SST-5), spam (SMS Spam Collection) y temas (20 Newsgroups).
- Inferencia de lenguaje natural y similitud semántica: MNLI, QNLI, MRPC, PAWS, SciTail, CoLA.
- Decisiones de uso de herramientas (tool-use decisions) a partir de glaive-function-calling-v2.
- Capacidades de visión: la model card menciona que incluye los pesos de visión del fine-tune base, pero no se detalla su uso ni su calidad.
- Soporte de tool calling, agentes multi-paso o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en subredes de Bittensor: el modelo está diseñado como cuerpo de decisión para la subnet 127 (Zils), de modo que se usaría para responder los ítems tipados que la subred evalúa, no como asistente abierto.
- Clasificación de tickets de soporte: con las cabeceras de clasificación del dataset (emociones, ironía, spam), puede etiquetar mensajes entrantes en categorías discretas y derivar a un humano o a un flujo automático.
- Moderación y filtrado de spam: el entrenamiento sobre SMS Spam Collection permite usarlo como clasificador binario de spam en canales de mensajería, con la ventaja de su tamaño reducido para despliegue en CPU.
- Evaluación automática por rúbrica: los ítems de puntuación por rúbrica generados por reglas lo hacen adecuado para asignar puntuaciones graduadas a respuestas en pipelines de evaluación de otros modelos.
- Preguntas de opción múltiple en entornos educativos: ARC, OpenBookQA y MMLU auxiliary train lo orientan a responder exámenes de conocimiento y ciencia a nivel escolar y universitario básico.
- Selección de herramienta en un agente: las decisiones de tool-use de glaive-function-calling-v2 permiten usarlo como primer paso de un agente que elige qué función invocar antes de delegar en un modelo mayor.
- Filtro de similitud y paráfrasis en deduplicación de corpus: con MNLI, QNLI, MRPC y PAWS puede puntuar pares de frases como equivalentes o no, integrado en un pipeline de limpieza de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en FP16 serían aproximadamente 1,7 GB de pesos; en BF16, similar; en cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 con margen para el contexto; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o servicio concurrente, A100 o H100 no son necesarias por tamaño, pero sí para throughput agregado.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más en FP16, y en 2 GB o más con cuantización de 4 bits.
- Opciones de despliegue: al requerir `custom_code` y no publicarse GGUF, la vía natural es `transformers` con el código del repositorio; vLLM, llama.cpp, Ollama o TGI no están documentados como soportados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-dh12 | 852.985.920 | no disponible | Apache-2.0 | Modelo de decisión (soup + LoRA) sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en esta ficha | Modelo base generalista de Qwen |
| DouglasBashir/zils-lite-r6 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite predecesor, integrado en el soup |
| BashirEmran/d3-lite-body-a2 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite predecesor, integrado en el soup |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional generalista: está entrenado para ítems de decisión tipados y su comportamiento fuera de ese formato no está documentado.
- Riesgo de alucinación: al ser un fine-tune de 0,8B sobre objetivos suaves, puede generar respuestas plausibles pero incorrectas en preguntas abiertas o de conocimiento especializado.
- Sesgos conocidos: no documentados en la model card; los datasets de origen (TweetEval, 20 Newsgroups, SMS Spam, Rotten Tomatoes) introducen sesgos propios de sus dominios y de sus anotaciones.
- Idiomas: no se declaran idiomas soportados; la mayor parte de los datasets de entrenamiento son en inglés, por lo que el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada; no debe asumirse la del modelo base sin verificación.
- Carga no estándar: requiere `custom_code` del repositorio; sin ese código, `AutoModelForCausalLM` puede fallar o cargar pesos incorrectamente.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la model card pide citar los datasets originales y conservar LICENSE y NOTICE.
- Procedencia: el modelo se publica como parte de un ecosistema de subred de Bittensor; conviene verificar la versión del chasis d3-lite y la receta `zils.d3` antes de reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh12
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo predecesor: https://huggingface.co/DouglasBashir/zils-lite-r6
- Cuerpo predecesor: https://huggingface.co/BashirEmran/d3-lite-body-a2
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
