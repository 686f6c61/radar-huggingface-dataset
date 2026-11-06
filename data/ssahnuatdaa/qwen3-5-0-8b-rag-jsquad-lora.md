# ssahnuatdaa/qwen3.5-0.8b-rag-jsquad-lora

## Resumen

`ssahnuatdaa/qwen3.5-0.8b-rag-jsquad-lora` es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario ssahnuatdaa. El modelo está especializado en una tarea muy concreta: responder preguntas en japonés en un contexto de generación aumentada por recuperación (RAG), devolviendo un objeto JSON con la respuesta y el identificador del fragmento (`chunk_id`) del que procede. Se desarrolló como proyecto final del curso de LLM del laboratorio Matsuo (Universidad de Tokio), edición 2026, centrado en RAG sobre Wikipedia en japonés.

El modelo cuenta con 752.393.024 parámetros reales según los pesos en safetensors (algo menos de los 0,8B nominales del nombre) y se distribuye en un repositorio de 1,5 GB, lo que sugiere pesos en precisión alta o la inclusión de los adaptadores junto al modelo base. La arquitectura declarada es `qwen3_5_text`, propia de la familia Qwen 3.5, y el idioma de trabajo es exclusivamente el japonés.

Su relevancia es limitada y muy específica: no es un modelo de propósito general, sino un artefacto académico que ilustra cómo un modelo pequeño puede especializarse en una tarea estructurada de extracción de respuestas con trazabilidad de la fuente. Resulta útil como referencia para quienes construyan pipelines RAG en japonés con modelos de menos de 1B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen3_5_text`, familia Qwen 3.5) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | other (hereda la licencia del modelo base Qwen/Qwen3.5-0.8B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y se ajusta mediante LoRA con rango 16, alpha 32 y dropout 0,05, con una tasa de aprendizaje de 0,0002, tamaño de lote efectivo 16, una sola época y semilla 42. Los adaptadores se integraron en los pesos finales, de modo que el repositorio contiene el modelo fusionado y no solo los adaptadores.

Los datos de entrenamiento proceden de JSQuAD (JGLUE v1.3), concretamente 3.000 ejemplos del split de entrenamiento, con licencia CC BY-SA 4.0. Cada ejemplo se reformateó para que el modelo, a partir de una pregunta y un conjunto de pasajes (el pasaje correcto más pasajes distractores), genere un JSON con la forma `{"answer": ..., "chunk_id": ...}`. No se documenta el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO; el ajuste es supervisado sobre la tarea de extracción.

## Capacidades

- Generación de respuestas extractivas en japonés a partir de un contexto de pasajes proporcionado.
- Salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (identificador del fragmento de origen).
- Discriminación entre pasajes relevantes y pasajes distractores, gracias al entrenamiento con ejemplos que incluyen distractores.
- Trazabilidad de la fuente: el modelo indica de qué fragmento extrae la respuesta, lo que facilita la verificación en pipelines RAG.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe limitada: el ajuste está orientado exclusivamente al japonés.

## Casos de uso

- RAG sobre Wikipedia en japonés: el modelo recibe la pregunta del usuario y los fragmentos recuperados por el retriever, y devuelve la respuesta junto con el `chunk_id`, lo que permite citar la fuente en la interfaz.
- Extracción de respuestas con cita en asistentes documentales: en un sistema de consulta sobre corpus internos en japonés, la salida JSON facilita enlazar cada respuesta con el documento original.
- Evaluación de retrievers: al devolver el `chunk_id` seleccionado, puede usarse para medir si el retriever ha colocado el pasaje correcto entre los candidatos.
- Filtrado de pasajes irrelevantes: el entrenamiento con distractores permite usar el modelo como clasificador de relevancia de fragmentos antes de la generación final.
- Prototipado académico y docencia: sirve como ejemplo reproducible de ajuste LoRA sobre un modelo de menos de 1B parámetros para una tarea estructurada, útil en cursos y laboratorios.
- Despliegue en entornos con recursos limitados: con 752 millones de parámetros, es viable ejecutarlo en una única GPU de consumo para tareas de extracción de baja latencia, siempre que el contexto no sea muy largo.
- Generación de pares pregunta-respuesta anotados: la salida estructurada puede alimentar la construcción de datasets de evaluación en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (752M parámetros), en FP16 rondaría 1,5 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo en cuantización reducida.
- Compatibilidad con GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090 y similares), aunque no hay confirmación oficial ni instrucciones de despliegue en la model card.
- Opciones de despliegue: no se documentan. Al publicarse solo en safetensors, sería necesario convertir los pesos a GGUF para llama.cpp u Ollama; para vLLM o TGI habría que verificar la compatibilidad de la arquitectura `qwen3_5_text`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| ssahnuatdaa/qwen3.5-0.8b-rag-jsquad-lora | 752.393.024 | no disponible | ja | other (hereda del base) | safetensors |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | multilingue | no disponible en la informacion proporcionada | safetensors |
| Otros ajustes LoRA sobre Qwen para QA en japones | no disponible | no disponible | ja | variable | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado únicamente para responder preguntas extractivas en japonés con salida JSON; su comportamiento fuera de ese formato no está garantizado.
- Riesgo de alucinación: aunque la tarea es extractiva, el modelo podría generar texto que no aparezca literalmente en los pasajes proporcionados o asignar un `chunk_id` incorrecto.
- Sesgos: no documentados por el autor; al entrenarse sobre JSQuAD (Wikipedia en japonés), puede heredar los sesgos de cobertura y redacción de esa fuente.
- Limitaciones de idioma: solo se declara japonés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Longitud de contexto: no documentada; el entrenamiento con pasajes concatenados sugiere un contexto moderado, pero no se especifica el máximo soportado.
- Licencia: la licencia es "other" y remite a la del modelo base Qwen/Qwen3.5-0.8B, cuyos términos no se detallan en la información disponible; es imprescindible revisarlos antes de cualquier uso comercial.
- Datos de entrenamiento con licencia CC BY-SA 4.0 (JSQuAD/JGLUE): pueden aplicarse obligaciones de atribución y compartir igual sobre los datos derivados.
- Volumen de entrenamiento reducido (3.000 ejemplos, 1 época): la generalización a dominios distintos de Wikipedia en japonés es incierta.
- Sin métricas publicadas: no hay evaluación cuantitativa de exactitud, F1 ni tasa de JSON válidos, lo que impide estimar su calidad en producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssahnuatdaa/qwen3.5-0.8b-rag-jsquad-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
