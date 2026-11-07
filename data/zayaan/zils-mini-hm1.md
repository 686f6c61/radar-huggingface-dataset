# Zayaan/zils-mini-hm1

## Resumen

zils-mini-hm1 es un modelo de decisión de 4.539 millones de parámetros publicado por el usuario Zayaan en Hugging Face, concebido como un "cuerpo" (body) dentro del pool de modelos del ecosistema Zils, asociado a la subred 127 de Bittensor. El modelo no es un asistente conversacional al uso: está diseñado para resolver tareas de decisión y clasificación en formato de examen, emitiendo respuestas verificables sobre un conjunto fijo de familias de tareas (razonamiento social, matemáticas, inferencia de lenguaje natural, análisis de sentimiento, detección de sarcasmo, function calling, entre otras).

Técnicamente, parte de un chasis fijado (el layout de d3-mini, que a su vez se apoya en los tensores de lenguaje y visión de Qwen3.5-4B en BF16) y se construye mediante un "soup" (promedio uniforme) de cuatro modelos Apache-2.0 del pool, seguido de un ajuste fino con LoRA de rango 32 sobre las 152 proyecciones de lenguaje del runtime d3. El resultado se fusiona en BF16 en los pesos finales.

Su relevancia radica en que documenta de forma transparente una metodología de entrenamiento y evaluación reproducible dentro de un ecosistema de validación descentralizada (Bittensor), con una mejora medible de +6,4 puntos sobre el punto de partida en la métrica de Brier skill calibrada empleada por los validadores del pool.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (chasis d3-mini sobre tensores de lenguaje y visión de Qwen3.5-4B, BF16) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de "soup-pool body": el punto de partida es el promedio uniforme de cuatro modelos Apache-2.0 del pool (vllm-sr/d3-mini en la revisión df99bf4c, perplexity-ai/pplx-decider-flash-v1.2 en 9ff7cf98, Maincode/Matilda-Decision-v1-Mini en 39479a8a y PelaAI/KnowLine-4B-Gen5 en a8e0cd66), construido con el soup builder de Zils (zils.soup.build) tal y como los validadores promedian miembros del soup. Este promedio se monta sobre el chasis fijado de d3-mini, que aporta el layout de tensores de lenguaje y visión heredado de Qwen3.5-4B en BF16, así como la capa de respuesta, el prompt y el runtime.

El entrenamiento consistió en una única época de LoRA con rango 32, alpha 64 y tasa de aprendizaje 1e-4, aplicada exclusivamente a las 152 proyecciones de lenguaje del runtime d3 con su readout de respuesta fijo (comando zils.teacher train --start). Los pesos LoRA se fusionaron en BF16 en el modelo final; ningún otro tensor fue entrenado. Los objetivos de entrenamiento fueron las respuestas verificadas de cada ítem: 4.992 ítems en formato de examen generados con la receta de autoría de Zils (scripts/author_exam.py), que exige una respuesta ciega independiente y solo conserva el ítem si hay acuerdo. Los datos cubren 2.974 ítems de 15 familias conocidas (Social IQa, PIQA, SVAMP, GSM8K, GLUE MNLI/RTE/QNLI/STS-B, Crisscrossed Captions, 20 Newsgroups, Glaive function calling v2, dair-ai/emotion, News Headlines Dataset for Sarcasm Detection y TweetEval sentiment) y 2.018 ítems de 99 tareas de entrenamiento de BIG-bench (tasksource/bigbench) junto con Glaive function calling. No se usaron ítems del examen de los validadores, ni ítems semilla públicos, ni datos de clientes.

## Capacidades

- Clasificación y decisión sobre tareas de razonamiento social (Social IQa) y sentido común físico (PIQA).
- Razonamiento matemático y resolución de problemas aritméticos (SVAMP, GSM8K).
- Inferencia de lenguaje natural y similitud semántica (GLUE MNLI, RTE, QNLI, STS-B).
- Análisis de sentimiento (TweetEval sentiment, dair-ai/emotion).
- Detección de sarcasmo en titulares de noticias.
- Clasificación temática de documentos (20 Newsgroups).
- Function calling / tool calling en el formato de Glaive function calling v2.
- Cobertura de tareas diversas de BIG-bench (99 tareas en entrenamiento, con tareas retenidas para evaluación).
- Procesamiento multimodal heredado del chasis Qwen3.5-4B (tensores de visión presentes en el layout, aunque la información no detalla el uso efectivo de visión en la evaluación).
- Emisión de respuestas en un formato de examen fijo con capa de respuesta y prompt suministrados por el runtime d3.

## Casos de uso

- Evaluación de modelos en pipelines de validación descentralizada: el modelo está pensado para ser puntuado con el Brier skill calibrado de los validadores del pool Zils (soup_grade.evaluate), por lo que encaja como candidato en procesos de selección y promedio de modelos dentro de la subred 127 de Bittensor.
- Clasificación de textos cortos en producción: para tareas de sentimiento, emoción o sarcasmo sobre titulares y tuits, el modelo ha sido entrenado específicamente con esos conjuntos y emite decisiones en el formato de examen del runtime.
- Enrutado y function calling en agentes: gracias al entrenamiento con Glaive function calling v2, puede usarse como componente de decisión para seleccionar herramientas o funciones en un pipeline de agentes, siempre que se respete el prompt y el readout del runtime d3.
- Filtrado y moderación de contenido: la combinación de clasificación temática (20 Newsgroups) y detección de sentimiento/sarcasmo permite construir capas de triaje para moderar o etiquetar contenido entrante.
- Resolución de problemas matemáticos de nivel escolar: con entrenamiento en GSM8K y SVAMP, es adecuado para tareas de aritmética verbal en entornos educativos o de validación de soluciones.
- Inferencia de lenguaje natural en pipelines de NLU: para entailment, pregunta-respuesta textual y similitud semántica (MNLI, RTE, QNLI, STS-B) en sistemas de extracción y verificación de información.
- Investigación sobre soup y fine-tuning: sirve como referencia reproducible de una receta concreta (promedio de cuatro modelos + LoRA rango 32 sobre proyecciones de lenguaje) para estudiar el efecto del soup y del ajuste selectivo en modelos de 4B.

## Benchmarks y rendimiento

Evaluación local del autor (no es el examen de los validadores), sobre 1.191 ítems retenidos y con el Brier skill calibrado de los validadores (media de cinco particiones de calibración):

| Modelo | Puntuación (1.191 ítems) |
|---|---:|
| Punto de partida (promedio de cuatro modelos) | 68,70 |
| zils-mini-hm1 (este body) | 75,10 |
| vllm-sr/d3-mini (solo) | 64,20 |
| Maincode/Matilda-Decision-v1-Mini (solo) | 60,17 |
| PelaAI/KnowLine-4B-Gen5 (solo) | 58,44 |

El conjunto de evaluación incluye 892 ítems escritos con la misma receta a partir de filas nunca usadas en entrenamiento (incluidas 15 tareas de BIG-bench excluidas del entrenamiento) y 299 ítems de las familias actuales de zils-ai/base-exam-seed-v1 a -v4. El autor advierte de que las puntuaciones de los validadores se obtienen sobre un examen privado y diferirán de estas cifras. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12-16 GB de VRAM para BF16 con contexto moderado.
- Cuantización: la información no detalla tipos de cuantización soportados; al publicarse en safetensors BF16, sería necesario convertir a GGUF u otros formatos para reducir requisitos, sin garantía de soporte por parte del autor.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de validación por lotes; RTX 4090 (24 GB) para BF16 en una sola GPU con margen; GPUs consumer de 16 GB podrían requerir cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 y previsiblemente en RTX 4080/4070 Ti Super en BF16 con contexto limitado; en GPUs de 8-12 GB haría falta cuantización.
- Opciones de despliegue: el modelo está atado al runtime d3 (zils.teacher / zils.soup), que aporta prompt, capa de respuesta y runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación local (Brier skill) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-hm1 | 4.539 M | no disponible | 75,10 | Apache-2.0 | Hugging Face (Zayaan/zils-mini-hm1) |
| vllm-sr/d3-mini | no disponible | no disponible | 64,20 | Apache-2.0 (según model card) | Hugging Face |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | 60,17 | Apache-2.0 (según model card) | Hugging Face |
| PelaAI/KnowLine-4B-Gen5 | no disponible | no disponible | 58,44 | Apache-2.0 (según model card) | Hugging Face |
| Zayaan/zils-mini-ft1 | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

Los tres modelos comparados son miembros del pool que sirven de punto de partida al soup; las puntuaciones corresponden a la misma evaluación local de 1.191 ítems reportada por el autor.

## Limitaciones y advertencias

- El modelo está diseñado para el runtime d3 y su capa de respuesta fija; fuera de ese entorno, su comportamiento y su formato de salida pueden no ser los esperados.
- La evaluación reportada es local y no equivale al examen privado de los validadores; las puntuaciones reales en producción diferirán.
- Riesgo de alucinación: al ser un modelo de decisión entrenado sobre respuestas verificadas, puede emitir decisiones con alta confianza en dominios no cubiertos por sus 15 familias y 99 tareas de BIG-bench.
- Cobertura limitada de idiomas: la información no especifica idiomas soportados; los conjuntos de entrenamiento son mayoritariamente en inglés.
- Sesgos potenciales heredados de los cuatro modelos base y de los datasets públicos empleados (por ejemplo, 20 Newsgroups, TweetEval o Glaive), no auditados en la información disponible.
- No se documentan tipos de cuantización ni soporte para motores de inferencia estándar (vLLM, llama.cpp, TGI), lo que limita su despliegue fuera del stack Zils.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar los términos de cada fuente de datos de entrenamiento antes de reutilizarlos; el repositorio solo contiene pesos, no texto de entrenamiento.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/zils-mini-hm1
- Modelo relacionado (mismo autor): https://huggingface.co/Zayaan/zils-mini-ft1
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Modelo base vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Modelo base perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Modelo base PelaAI/KnowLine-4B-Gen5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset tasksource/bigbench: https://huggingface.co/datasets/tasksource/bigbench
- BIG-bench (Srivastava et al., 2022): no disponible en la información proporcionada
- tasksource (Sileo, 2024): no disponible en la información proporcionada
