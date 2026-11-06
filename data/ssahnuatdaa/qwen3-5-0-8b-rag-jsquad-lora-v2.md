# ssahnuatdaa/qwen3.5-0.8b-rag-jsquad-lora-v2

## Resumen

`ssahnuatdaa/qwen3.5-0.8b-rag-jsquad-lora-v2` es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario ssahnuatdaa para el proyecto final del curso de LLM del laboratorio Matsuo (Universidad de Tokio, edición 2026). El objetivo concreto es la generación de respuestas estructuradas en formato JSON para tareas de RAG (retrieval-augmented generation) sobre Wikipedia en japonés, devolviendo un objeto con los campos `answer` y `chunk_id`.

El modelo parte de una arquitectura transformer de aproximadamente 873 millones de parámetros (según los pesos en safetensors) y ha sido especializado con 3072 ejemplos del conjunto JSQuAD de JGLUE, reformateados para que el modelo aprenda a identificar el fragmento correcto entre varios candidatos y a extraer la respuesta. Es relevante como ejemplo de ajuste fino ligero y orientado a una tarea muy concreta (extracción de respuestas con referencia a chunk), un patrón habitual en pipelines RAG de producción.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia "other" heredada del modelo base y con soporte declarado únicamente para japonés. No hay información publicada sobre benchmarks, pipeline de inferencia ni detalles adicionales de entrenamiento más allá de los indicados en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); no se detalla la variante exacta |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se indica GGUF ni otras variantes) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Other (se hereda de Qwen/Qwen3.5-0.8B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), con los adaptadores integrados en los pesos finales. La arquitectura subyacente es la del modelo base Qwen3.5 de 0,8 mil millones de parámetros, si bien la model card no detalla aspectos como el tipo de atención, la longitud de contexto nativa ni la composición del corpus de preentrenamiento.

El entrenamiento se realizó con LoRA de rango 16, alpha 32 y dropout 0,05, tasa de aprendizaje 0,0002, tamaño de lote efectivo 16, una época y semilla 42. Los datos provienen de 3072 ejemplos del split de entrenamiento de JSQuAD (JGLUE v1.3, licencia CC BY-SA 4.0), reformateados para que la entrada consista en una pregunta junto con el párrafo correcto y párrafos distractores, y la salida sea un JSON con `answer` y `chunk_id`. No se menciona uso de RLHF, DPO ni otras técnicas de alineación posteriores.

## Capacidades

- Generación de respuestas extractivas en formato JSON con los campos `answer` y `chunk_id`.
- Selección del fragmento correcto entre varios candidatos (párrafo correcto más párrafos distractores).
- Comprensión lectora en japonés sobre textos tipo Wikipedia.
- Salida estructurada apta para ser parseada por pipelines RAG.
- Capacidad multilingüe: limitada al japonés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Pipeline RAG sobre Wikipedia en japonés: el modelo recibe la pregunta y varios fragmentos recuperados, y devuelve el `chunk_id` del fragmento que contiene la respuesta junto con el texto extraído, lo que permite citar la fuente de forma programática.
- Extracción de respuestas con trazabilidad: al devolver un identificador de chunk, facilita auditar qué fragmento del corpus sustentó cada respuesta, útil en sistemas que requieren citas verificables.
- Evaluación de recuperadores: puede emplearse para medir si el fragmento correcto aparece entre los candidatos devueltos por un retriever, ya que su salida identifica explícitamente el chunk seleccionado.
- Prototipado rápido de asistentes documentales en japonés: su tamaño de 0,8B permite desplegarlo en entornos con recursos limitados para validar flujos RAG antes de escalar a modelos mayores.
- Filtrado de contexto en sistemas de búsqueda: dado un conjunto de pasajes candidatos, el modelo puede reducir el contexto a la evidencia relevante antes de pasarla a un modelo generador de mayor tamaño.
- Docencia y experimentación con LoRA: sirve como referencia reproducible de ajuste fino ligero sobre JSQuAD para cursos y proyectos de investigación en PLN japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,8 GB solo para pesos (873M de parámetros), más overhead de activaciones y caché KV; en la práctica, cabe en GPUs con 4-6 GB de VRAM.
- En cuantización de 8 bits: aproximadamente 0,9-1 GB de pesos; en 4 bits: en torno a 0,5 GB, aunque no se publican versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues por lotes, aunque el modelo es muy pequeño para aprovecharlas.
- Cabe en GPU consumer: sí, con holgura en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: al publicarse en safetensors, es compatible con bibliotecas estándar como transformers, vLLM o TGI; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, lo cual no se documenta en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-rag-jsquad-lora-v2 | 873M | No disponible | RAG extractivo en japonés (JSQuAD) | Other (heredada del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | Modelo generalista multilingüe | Según el modelo base | Hugging Face |
| Modelos ajustados sobre JSQuAD de mayor tamaño | No disponible | No disponible | Comprensión lectora en japonés | Variable | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado exclusivamente con 3072 ejemplos de JSQuAD: su generalización fuera del dominio Wikipedia japonés y del formato de salida JSON esperado es incierta.
- Riesgo de alucinación: al ser un modelo de 0,8B ajustado para extracción, puede generar `chunk_id` o respuestas inexistentes si la entrada no sigue el formato de entrenamiento.
- Sesgos: no se documentan análisis de sesgo; al derivar de un modelo base multilingüe y entrenarse sobre un corpus específico, puede heredar sesgos del preentrenamiento y del dataset JSQuAD.
- Limitaciones de idioma: solo se declara soporte para japonés; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: la licencia es "other" y remite a la del modelo base Qwen/Qwen3.5-0.8B; es imprescindible revisar los términos del modelo base antes de cualquier uso comercial. Los datos de entrenamiento (JSQuAD) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartición.
- Caveat de producción: el modelo tiene cero descargas y no cuenta con validación externa; no se publican métricas de exactitud ni de calidad del JSON generado.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar el tamaño de los fragmentos de entrada en un pipeline RAG.

## Enlaces

- Hugging Face: https://huggingface.co/ssahnuatdaa/qwen3.5-0.8b-rag-jsquad-lora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
