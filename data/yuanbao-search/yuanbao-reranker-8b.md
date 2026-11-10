# Yuanbao-Search/Yuanbao-Reranker-8B

## Resumen

Yuanbao-Reranker-8B es un modelo de reordenamiento (reranker) de 8.188.548.096 parámetros desarrollado por Yuanbao-Search, construido mediante fine-tuning del modelo base Qwen3-8B. Su función es recibir una instrucción de tarea, una consulta de búsqueda y un documento candidato, y producir una puntuación de relevancia fina en el rango [0, 1] normalizada sobre los tokens de decisión `yes` y `no`. Forma parte de una familia de tres tamaños (0,6B, 4B y 8B) que comparten la misma arquitectura de backbone Qwen3 y una ventana de contexto de 8.192 tokens.

El modelo aborda el problema del reordenamiento en pipelines de recuperación de información y RAG, donde un retriever inicial devuelve decenas o cientos de documentos y es necesario reordenarlos con precisión antes de pasarlos a un generador. Yuanbao-Reranker-8B se entrena específicamente para escenarios multilingües (chino, inglés y otros idiomas), documentos largos de hasta 8.192 tokens y recuperación de código, lo que lo hace relevante para sistemas de búsqueda técnica y asistentes de programación.

Su relevancia actual radica en que alcanza un promedio de 74,21 en cinco paneles de evaluación (CMTEB-R, MMTEB-R, BEIR, MLDR y MTEB-Code), superando a Qwen3-Reranker-8B (72,68) en 1,53 puntos y obteniendo la mejor puntuación en cada panel individual. Se distribuye con licencia Apache 2.0 y pesos en safetensors BF16, lo que facilita su integración tanto en entornos de investigación como comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a ranking mediante clasificación de tokens `yes`/`no` |
| Parámetros totales | 8.188.548.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | BF16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | Chino (zh), inglés (en), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en el backbone Qwen3-8B, un transformer decoder-only de 36 capas. Sobre esa base, Yuanbao-Search aplica un fine-tuning orientado a ranking que reformula la tarea como una decisión binaria: dado un prompt con `<Instruct>`, `<Query>` y `<Document>`, el modelo genera `yes` o `no` y la puntuación final se obtiene normalizando las log-probabilidades de ambos tokens. La entrada se trunca a 8.192 tokens y la salida es una probabilidad de relevancia en [0, 1].

El entrenamiento se apoya en tres innovaciones descritas por el autor. Primero, la síntesis document-grounded con curación estratificada por grupos: se construyen 2,75 millones de grupos de ranking con proporción 1:3 mediante síntesis *answer-first* y guiada por tipo de consulta, seguida de un embudo de curación en tres etapas (verificación por profesor, deduplicación semántica y asignación de cuotas por fuente y longitud) y minería de negativos estratificada por dificultad (*Hard*, *Medium*, *Moderate*) con filtrado del profesor (Δ > 1). Segundo, la destilación de preferencias con *minimum-gap* acotado: se optimiza conjuntamente la entropía cruzada punto a punto `yes`/`no` y un objetivo hinge pairwise unilateral acotado sobre pares positivo-negativo y negativo-negativo. Tercero, la fusión de modelos mediante *Adaptive LERP* por capas, que no añade coste de inferencia.

## Capacidades

- Puntuación de relevancia consulta-documento en el rango [0, 1] con granularidad fina.
- Reordenamiento multilingüe en chino, inglés y otros idiomas.
- Manejo de documentos largos de hasta 8.192 tokens en una sola pasada.
- Recuperación de código (*code retrieval*) además de texto natural.
- Soporte de instrucciones de tarea personalizables mediante el campo `<Instruct>`.
- Integración con Hugging Face Transformers y vLLM sin wrapper externo.
- Compatible con endpoints (tag `endpoints_compatible`).
- No dispone de tool calling, agentes ni modo thinking expuesto; el bloque `<think>` se usa vacío en el formato de prompt.

## Casos de uso

- Reordenamiento en pipelines RAG: tras una primera fase de recuperación densa o híbrida, el modelo reordena los 50-100 candidatos mejor puntuados antes de pasarlos al generador, mejorando la precisión del contexto inyectado gracias a su ventana de 8.192 tokens.
- Búsqueda técnica y de código: el soporte de *code retrieval* y el panel MTEB-Code permiten usarlo en asistentes de programación que necesitan localizar fragmentos de código relevantes en repositorios grandes.
- Búsqueda multilingüe en producción: al cubrir chino, inglés y otros idiomas, sirve para sistemas de búsqueda empresarial que operan sobre corpus mixtos sin desplegar un reranker por idioma.
- Atención al cliente con base de conocimiento: reordena artículos de ayuda y FAQs antes de que un LLM genere la respuesta, reduciendo alucinaciones al priorizar los documentos más relevantes.
- Búsqueda legal o académica sobre documentos largos: su contexto de 8.192 tokens permite puntuar pasajes extensos o contratos completos sin truncamiento agresivo.
- Evaluación y ajuste de retrievers: como reranker de referencia con licencia Apache 2.0, se puede usar para medir la calidad de un retriever propio comparando el orden antes y después del reordenamiento.
- Filtrado de candidatos en motores de búsqueda vertical: integrado vía vLLM para servir puntuaciones a baja latencia en flujos de búsqueda con alto QPS.

## Benchmarks y rendimiento

| Panel | Yuanbao-Reranker-8B | Qwen3-Reranker-8B |
|---|---|---|
| CMTEB-R | Mejor del panel (valor no disponible) | No disponible |
| MMTEB-R | Mejor del panel (valor no disponible) | No disponible |
| BEIR | Mejor del panel (valor no disponible) | No disponible |
| MLDR | Mejor del panel (valor no disponible) | No disponible |
| MTEB-Code | Mejor del panel (valor no disponible) | No disponible |
| Promedio cinco paneles | 74,21 | 72,68 |

Los valores por panel individual no se han publicado en la información disponible; solo se indica que el modelo obtiene la puntuación más alta en cada uno de los cinco paneles y un promedio de 74,21 frente a 72,68 de Qwen3-Reranker-8B. En la familia, el promedio es de 70,96 para el 0,6B y 73,63 para el 4B.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB para inferencia con lotes pequeños.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con lotes moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: Hugging Face Transformers (`AutoModelForCausalLM`), vLLM (soportado explícitamente) y el paquete `yuanbao-reranker`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Promedio cinco paneles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yuanbao-Reranker-8B | 8B | 8.192 | 74,21 | Apache 2.0 | Hugging Face |
| Yuanbao-Reranker-4B | 4B | 8.192 | 73,63 | Apache 2.0 | Hugging Face |
| Yuanbao-Reranker-0.6B | 0,6B | 8.192 | 70,96 | Apache 2.0 | Hugging Face |
| Qwen3-Reranker-8B | 8B | No disponible | 72,68 | No disponible | Hugging Face |

La familia Yuanbao-Reranker permite elegir entre tres tamaños con el mismo contexto y licencia, lo que facilita el ajuste coste-rendimiento: el 0,6B pierde 3,25 puntos frente al 8B, y el 4B solo 0,58 puntos.

## Limitaciones y advertencias

- El modelo es un reranker, no un generador: no produce respuestas, solo puntuaciones de relevancia.
- Riesgo de sesgo heredado del corpus de entrenamiento y del backbone Qwen3; no se documentan evaluaciones de sesgo en la información disponible.
- La puntuación se normaliza sobre los tokens `yes`/`no`, por lo que la calibración depende del formato de prompt exacto; desviarse del formato `<Instruct>`/`<Query>`/`<Document>` puede degradar los resultados.
- Contexto limitado a 8.192 tokens; documentos más largos requieren truncamiento o fragmentación.
- El rendimiento en idiomas distintos de chino e inglés no está cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-8B.
- Sin datos publicados de latencia, throughput ni consumo de VRAM medido; las estimaciones de hardware son aproximadas.
- El modelo tiene muy pocas descargas y likes en el momento de la ficha, por lo que la validación comunitaria es aún escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-8B
- Repositorio GitHub: https://github.com/Yuanbao-Search/Yuanbao-Reranker
- Colección Hugging Face: https://huggingface.co/collections/Yuanbao-Search/yuanbao-reranker-6aeda9e8d327ee5c9b20c9d6
- Modelo 0,6B: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-0.6B
- Modelo 4B: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-4B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
