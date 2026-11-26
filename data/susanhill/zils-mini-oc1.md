# SusanHill/zils-mini-oc1

## Resumen

zils-mini-oc1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario SusanHill bajo licencia Apache-2.0. El modelo se distribuye como un "student" destilado mediante LoRA de rango 64 sobre un conjunto de datos propietario denominado "Zils Outcomes", compuesto por ítems resueltos recogidos de fuentes públicas como Gerrit, Stack Exchange, arXiv, Wikipedia/Wikidata y AfC (Articles for Creation). Su objetivo declarado es la toma de decisiones ("decision") sobre ese tipo de tareas, no la generación de texto generalista.

El modelo hereda la arquitectura y el tokenizador de Qwen3.5-4B, con 4.539.265.536 parámetros totales según los pesos en safetensors, y se publica con código personalizado (`custom_code`), lo que implica que requiere confiar en implementaciones remotas para cargarlo. El repositorio ocupa 9,1 GB, coherente con pesos en precisión completa o bf16 para un modelo de ~4,5B de parámetros.

La relevancia de esta ficha es limitada: se trata de un modelo sin descargas ni "likes", sin pipeline declarado, sin idiomas especificados y con una model card extremadamente escueta. No hay información pública sobre benchmarks, datos de entrenamiento detallados ni evaluación. Se documenta aquí lo que la información disponible permite afirmar, marcando explícitamente todo lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (~4,54B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-4B, valor no confirmado en la información) |
| Tipos de cuantizacion | No disponible (solo se publican safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,5B de parámetros. Sobre esa base se aplica un ajuste fino mediante LoRA de rango 64, actuando como "student" en un esquema de destilación. La model card describe el objetivo de entrenamiento como una mezcla al 50% de probabilidades de "vllm-sr/d3-flash" y al 50% del resultado real ("real outcome") de los ítems del conjunto "Zils Outcomes".

El conjunto de datos de entrenamiento se describe como ítems resueltos recogidos de fuentes públicas: Gerrit (revisiones de código), Stack Exchange (preguntas y respuestas técnicas), arXiv (preprints), Wikipedia/Wikidata (conocimiento enciclopédico y estructurado) y AfC (revisiones de borradores de artículos). No se especifica el número de tokens, la composición exacta por fuente, ni si hubo etapas de RLHF o DPO. La etiqueta `custom_code` indica que la carga del modelo requiere código remoto definido por el autor, lo que añade una dependencia de implementación no auditada en la información disponible.

## Capacidades

- Toma de decisiones sobre ítems del dominio "Zils Outcomes": clasificación o resolución de casos procedentes de revisiones de código (Gerrit), preguntas técnicas (Stack Exchange), preprints (arXiv), entidades de conocimiento (Wikipedia/Wikidata) y revisión de borradores (AfC).
- Generación de texto y razonamiento heredados de la base Qwen3.5-4B, aunque no evaluados ni documentados en la model card.
- Capacidad multilingüe: no documentada; los idiomas soportados figuran como no disponibles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Triaje de revisiones de código en Gerrit: el modelo puede clasificar o priorizar cambios entrantes según patrones aprendidos de ítems resueltos de Gerrit, ayudando a un equipo a decidir qué revisiones requieren atención inmediata.
- Moderación o clasificación de preguntas en Stack Exchange: dado su entrenamiento sobre ítems resueltos de esa fuente, puede usarse para etiquetar preguntas como aceptables, duplicadas o fuera de alcance, siempre con validación humana.
- Filtrado de preprints en arXiv: clasificación de envíos por relevancia o calidad aparente, como paso previo a una revisión editorial humana.
- Enriquecimiento o validación de entidades en Wikipedia/Wikidata: apoyo a la detección de inconsistencias en fichas y declaraciones estructuradas.
- Apoyo a la revisión de borradores (AfC): señalización de borradores que probablemente cumplan o no los criterios de aceptación, como herramienta de asistencia y no de decisión final.
- Experimentación en destilación de decisiones: útil como referencia para investigadores que estudien destilación LoRA de un modelo mayor (vllm-sr/d3-flash) hacia un student de ~4,5B sobre datos mixtos sintéticos y reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 9,1 GB en el repositorio, lo que sugiere bf16/fp16; en esa precisión se necesitan aproximadamente 9-10 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- Cuantización: no se ofrecen pesos GGUF, AWQ ni GPTQ en la información disponible; sería necesario cuantizar manualmente para reducir requisitos.
- GPU recomendadas: una GPU consumer con 12-16 GB (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) podría alojar los pesos en bf16 con margen limitado; para producción con contexto largo se recomienda A100 40 GB, H100 o L40S.
- Cabe en GPU consumer: sí, en GPUs con 12 GB o más si se cuantiza o se usa bf16 con contexto corto; el margen es ajustado en 12 GB.
- Opciones de despliegue: al requerir `custom_code`, la carga estándar con vLLM, TGI o llama.cpp no está garantizada; se necesitaría `trust_remote_code=True` en Transformers o adaptar el código. Ollama y llama.cpp requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-oc1 | ~4,54B | No disponible | Apache-2.0 | Hugging Face, `custom_code` | Fine-tune LoRA-64 de Qwen3.5-4B; sin benchmarks |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base; capacidades generales documentadas por su autor |
| Alternativas de ~4B para clasificación/decisión | No disponible | No disponible | No disponible | No disponible | No se dispone de comparadores verificables con la información proporcionada |

No se dispone de datos de rendimiento del modelo ni de comparadores directos evaluados sobre el mismo conjunto "Zils Outcomes", por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, precisión ni robustez en ninguna tarea.
- Model card mínima: no se documentan idiomas, contexto, composición exacta del dataset ni proceso de evaluación.
- `custom_code`: la carga requiere ejecutar código remoto del autor, lo que supone un riesgo de seguridad y una dependencia de mantenimiento; conviene auditar el código antes de usarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; sin evaluación específica, no puede acotarse.
- Sesgos: el entrenamiento sobre fuentes públicas (Gerrit, Stack Exchange, arXiv, Wikipedia/Wikidata, AfC) puede heredar sesgos de esas comunidades, pero no se documenta ningún análisis.
- Dominio estrecho: el modelo está orientado a decisiones sobre ítems tipo "Zils Outcomes"; su uso como modelo generalista no está validado.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse que el modelo base Qwen3.5-4B y el código personalizado no impongan restricciones adicionales.
- Sin descargas ni validación comunitaria: no hay señales de uso real que permitan inferir estabilidad o calidad.
- Fecha de creación futura (2026-11-26) en los metadatos: conviene tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-mini-oc1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia al modelo profesor citado en la model card (vllm-sr/d3-flash): no disponible como enlace verificado
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
