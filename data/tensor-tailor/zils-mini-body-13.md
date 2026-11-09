# tensor-tailor/zils-mini-body-13

## Resumen

zils-mini-body-13 es un ajuste fino mediante LoRA de un modelo de decisión (decision model) perteneciente al pool "soup" MINI del ecosistema Zils, la infraestructura de minería del subnet 127 de Bittensor. Lo publica el usuario tensor-tailor como cuerpo candidato ("body") para ese pool, partiendo de la media ponderada uniforme de dos cuerpos previos: qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1. El modelo se construye sobre el chasis d3-mini, que emplea tensores de lenguaje y visión de Qwen3.5-4B en bf16.

Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB, el modelo está diseñado específicamente para tareas de decisión y clasificación: elección múltiple, preguntas de sí/no y puntuaciones en escala, distribuidas en 15 familias de tareas agrupadas en cinco categorías (razonamiento, lenguaje, recuperación, herramientas y artes). No es un modelo conversacional de propósito general, sino un componente evaluado dentro de un examen estandarizado del subnet.

La relevancia de esta ficha radica en que documenta un caso de fine-tuning muy especializado dentro de un ecosistema descentralizado de minería de modelos, con una metodología de entrenamiento explícita (LoRA rank 32, pérdida combinada de entropía cruzada y Brier, conjunto de datos balanceado por clase de 2.006 filas) y una licencia Apache-2.0 que facilita su reutilización, aunque su utilidad fuera del contexto del subnet Zils es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con chasis Qwen3.5-4B (tensores de lenguaje y visión), proyecciones Gated-DeltaNet; fine-tune LoRA |
| Parámetros totales | 4.539.265.536 (aproximadamente 4,5 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con máximo 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere cargador propio) |

## Arquitectura y entrenamiento

El modelo parte del chasis d3-mini, que combina tensores de lenguaje y visión de Qwen3.5-4B en bf16 con proyecciones Gated-DeltaNet. Sobre ese cuerpo base se aplica un ajuste fino LoRA de rango 32, alpha 64 y dropout 0,05 sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje (152 matrices). El entrenamiento usa tasa de aprendizaje 5e-5, AdamW con weight decay 1,0 solo sobre los pesos LoRA, batch 8 con acumulación 2, warm-up de 50 pasos seguido de decaimiento coseno, 2 épocas, longitud máxima de 2.048 tokens y semilla 4343. La pérdida por fila combina entropía cruzada sobre la etiqueta de la fila más un término Brier con peso 1,0, sin término KL ni destilación. Los pesos se fusionan en bf16.

El conjunto de entrenamiento consta de 2.006 filas balanceadas por clase, repartidas en las 15 familias "conocidas" del examen (5 categorías por elección múltiple, sí/no y puntuación), con proporciones por categoría que siguen los pesos publicados del examen: razonamiento (647 filas), lenguaje (666), recuperación (333), herramientas (88) y artes (272). Las etiquetas son siempre las del propio dataset (anotadores humanos o el probador/generador del dataset), derivadas por código o calculadas por el generador propio, sin predicciones de modelos. Las fuentes incluyen MultiNLI, PIQA, 20 Newsgroups, STS Benchmark, Social IQa, SNLI, RTE, QNLI, SST-5, iSarcasmEval, SQuAD 2.0, RuleTaker, ToolACE, GoEmotions y Hermes function-calling v1. Se aplicó una regla de dificultad por celda: las filas con etiqueta humana se toman en orden de hash fijo entre aquellas en las que el soup MINI asigna probabilidad 0,30-0,90 a la respuesta correcta, con un límite del 50% por fuente.

## Capacidades

- Clasificación de elección múltiple en 15 familias de tareas de decisión.
- Respuestas de sí/no sobre pares de premisa e hipótesis (inferencia textual, respuesta a preguntas, análisis de sentimiento).
- Puntuación en escala (similitud semántica de 0 a 5, sentimiento de 5 clases).
- Razonamiento lógico cerrado sobre reglas (RuleTaker).
- Detección de sarcasmo y clasificación de emociones.
- Verificación de llamadas a herramientas (function calling): distingue la llamada real de distractores que rompen un argumento requerido.
- Capacidades de visión heredadas del chasis Qwen3.5-4B (torre de visión incluida en el chasis), aunque el fine-tune se centra en tareas de decisión textual.
- Soporte multilingüe: no disponible (no se documenta).

## Casos de uso

- Evaluación de cuerpos en el subnet 127 de Bittensor: el modelo se usa como candidato del pool soup MINI y se evalúa contra el examen estandarizado del subnet; su formato y metodología están pensados para ese circuito de minería.
- Clasificación de inferencia textual en pipelines NLP: puede resolver tareas de entailment/contradicción/neutralidad sobre pares de frases, útil en sistemas de verificación de afirmaciones.
- Moderación y análisis de sentimiento: clasificación de sentimiento en 5 niveles y detección de emociones en textos cortos, aprovechando el ajuste sobre SST-5 y GoEmotions.
- Detección de sarcasmo en redes sociales: el ajuste sobre iSarcasmEval permite integrarlo en herramientas de análisis de opinión donde el tono irónico distorsiona las métricas.
- Validación de llamadas a funciones en agentes: el ajuste sobre ToolACE y Hermes function-calling permite comprobar si una llamada a herramienta es correcta o si un distractor rompe un argumento requerido, como paso de verificación en pipelines de agentes.
- Respuesta a preguntas extractiva a nivel de frase: el ajuste sobre SQuAD 2.0 y QNLI permite decidir si una frase contiene la respuesta a una pregunta, útil en sistemas de recuperación y reranking.
- Razonamiento sobre reglas en entornos cerrados: el ajuste sobre RuleTaker permite validar deducciones bajo una asunción de mundo cerrado, aplicable a motores de reglas y sistemas expertos ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB en bf16 (4,5 mil millones de parámetros), alrededor de 4,5-5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits (estimación a partir del número de parámetros; no confirmada por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con throughput alto; RTX 4090 o RTX 3090 para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 8-12 GB o más si se cuantiza.
- Opciones de despliegue: al usar `custom_code` y un chasis propio (Qwen3.5-4B con Gated-DeltaNet), requiere el cargador específico del autor; no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin adaptación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-body-13 | 4,5 mil millones | no disponible (entrenamiento a 2.048 tokens) | Decisión y clasificación en 15 familias | Apache-2.0 | Hugging Face |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | Decisión (cuerpo base del soup) | no disponible | Hugging Face |
| Charlie320/zils-mini-s1 | no disponible | no disponible | Decisión (cuerpo base del soup) | no disponible | Hugging Face |
| Qwen3.5-4B (chasis subyacente) | aproximadamente 4 mil millones | no disponible | Lenguaje y visión de propósito general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para el examen de decisión del subnet Zils; su rendimiento en tareas generativas abiertas no está documentado y probablemente sea limitado.
- Riesgo de alucinación: al ser un modelo de clasificación y puntuación, las salidas fuera de las 15 familias conocidas pueden ser poco fiables.
- Sesgos: el conjunto de entrenamiento está compuesto por datasets académicos con sesgos propios (MultiNLI, SNLI, SST-5, GoEmotions, entre otros); no se documenta ningún análisis de sesgo.
- Idiomas: no se documenta qué idiomas soporta; el entrenamiento se basa en datasets mayoritariamente en inglés.
- Licencia: Apache-2.0 permite uso comercial, pero las licencias de los datasets de origen son mixtas (algunas sin licencia abierta explícita, como 20 Newsgroups, STS Benchmark, RTE y SST-5, usadas bajo los términos de los autores originales), lo que puede afectar a la redistribución.
- Dependencia de código personalizado: requiere `custom_code` y el chasis d3-mini; la carga con herramientas estándar no está garantizada.
- Contexto de entrenamiento corto (2.048 tokens): no se recomienda para tareas que requieran ventanas largas.
- Publicación reciente y sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- El modelo es un candidato de minería, no un modelo de producción validado; su calidad depende de la evaluación del subnet.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-13
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-s1
- Zils — miners: https://zils.ai/miners
- MultiNLI: https://cims.nyu.edu/~sbowman/multinli/
- PIQA: https://yonatanbisk.com/piqa/
- 20 Newsgroups: http://qwone.com/~jason/20Newsgroups/
- STS Benchmark: https://huggingface.co/datasets/mteb/stsbenchmark-sts
- Social IQa: https://allenai.org/data/socialiqa
- SNLI: https://nlp.stanford.edu/projects/snli/
- RTE (GLUE): https://gluebenchmark.com/
- SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- SST-5: https://nlp.stanford.edu/sentiment/
- iSarcasmEval: https://github.com/iabufarha/iSarcasmEval
- RuleTaker: https://github.com/allenai/ruletaker
- ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- GoEmotions: https://github.com/google-research/google-research/tree/master/goemotions
