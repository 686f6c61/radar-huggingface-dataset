# vennemeyerd/persona-distribution-qwen3.5-27b

## Resumen

`vennemeyerd/persona-distribution-qwen3.5-27b` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `vennemeyerd`, diseñado para simulación de encuestas y generación de distribuciones de opinión a partir de personas sintéticas. Se construye sobre el modelo base `Qwen/Qwen3.5-27B`, un transformer denso de 27.000 millones de parámetros de la familia Qwen 3.5. El adaptador no modifica la arquitectura del modelo base: añade pesos de bajo rango entrenados para una tarea concreta de generación de texto orientada a reproducir opiniones y respuestas tipo encuesta.

La relevancia del modelo reside en su especialización: en lugar de un ajuste generalista, apunta a un caso de uso muy concreto (survey-simulation y opinion-distribution), lo que lo hace útil para investigación social computacional, estudios de opinión sintéticos y calibración de personas. No obstante, la información pública disponible es extremadamente limitada: el repositorio tiene cero descargas y cero likes, la licencia no está declarada y el acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar los pesos.

El tamaño del repositorio (0,9 GB) es coherente con un adaptador LoRA sobre un modelo de 27B, no con los pesos completos del modelo base. La fecha de creación indicada en la ficha (2026-11-19) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio o una fecha de publicación programada; conviene verificarlo en la página de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-27B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-27B; no declarada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `Qwen/Qwen3.5-27B`. La arquitectura subyacente es la del transformer denso de Qwen 3.5, con 27.000 millones de parámetros; el adaptador añade matrices de bajo rango en determinadas capas para especializar el modelo en la tarea de simulación de encuestas y distribución de opinión. No se dispone de información sobre el rango del adaptador, las capas objetivo, el tamaño del dataset de entrenamiento, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO.

Los tags del repositorio (`survey-simulation`, `opinion-distribution`, `persona`) indican que el entrenamiento se orientó a generar respuestas de personas sintéticas y a reproducir distribuciones de opinión agregadas. No hay información pública sobre hiperparámetros, número de tokens de entrenamiento ni metodología de evaluación. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto especializada en simulación de encuestas y respuestas tipo persona.
- Modelado de distribuciones de opinión agregadas a partir de personas sintéticas.
- Generación de respuestas multi-turno (capacidad heredada del modelo base Qwen3.5-27B).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base, no confirmado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no declaradas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Simulación de encuestas políticas: el adaptador permite generar respuestas sintéticas de personas con perfiles demográficos definidos, útil para pre-testear cuestionarios antes del trabajo de campo real y estimar distribuciones de opinión preliminares.
- Investigación social computacional: generación de poblaciones sintéticas para estudiar sesgos de opinión y patrones de respuesta sin incurrir en los costes de una encuesta real.
- Calibración de personas en pipelines de agentes: usar el adaptador para dotar a agentes conversacionales de perfiles de opinión consistentes en simulaciones multi-agente.
- Análisis de sensibilidad de cuestionarios: variar la redacción de preguntas y observar cómo cambia la distribución de respuestas generada, ayudando a detectar preguntas sesgadas.
- Generación de datos sintéticos para entrenamiento: producir corpus de opiniones etiquetadas por persona para aumentar datasets de modelos de clasificación de opinión.
- Prototipado de estudios de mercado: estimar distribuciones de preferencia de segmentos de consumidores antes de lanzar un estudio cuantitativo, con la cautela de que los resultados son sintéticos y requieren validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. El modelo base Qwen3.5-27B requiere aproximadamente 54 GB en FP16, 27 GB en INT8 y 14-16 GB en cuantización de 4 bits, aunque estos valores son estimaciones generales para un modelo de 27B y no datos confirmados para este artefacto.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del modelo base, serían necesarias GPU de clase A100/H100 para FP16, o RTX 4090/3090 con cuantización para 4 bits.
- ¿Cabe en GPU consumer?: probablemente con cuantización de 4 bits en GPUs de 24 GB (RTX 4090, RTX 3090), pero no confirmado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), potencialmente vLLM, llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vennemeyerd/persona-distribution-qwen3.5-27b | 27B (base) + LoRA | no disponible | Adaptador LoRA especializado | no disponible | Gated en HF |
| Qwen/Qwen3.5-27B (base) | 27B | no disponible en esta ficha | Transformer denso | no disponible en esta ficha | Público en HF |
| Adaptadores de persona genéricos (p. ej. variantes sobre Llama/Mistral) | variable | variable | LoRA | variable | variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. La comparación con el modelo base es la más directa: el adaptador añade especialización en simulación de encuestas a costa de posibles regresiones en capacidades generales, algo que no puede evaluarse sin benchmarks publicados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integración automatizada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad de las distribuciones de opinión generadas ni de posibles regresiones respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero no fundamentadas; en simulación de encuestas esto puede traducirse en distribuciones de opinión no representativas.
- Sesgos: los datos de entrenamiento del adaptador no están documentados, por lo que no se puede evaluar el sesgo demográfico, político o cultural de las personas sintéticas generadas.
- Idiomas no declarados: se desconoce si el adaptador mantiene el multilingüismo del modelo base o se ha especializado en un único idioma.
- Fecha de creación anómala (2026-11-19): conviene verificar los metadatos del repositorio antes de confiar en ellos.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad; el artefacto es muy reciente o poco probado.
- Uso responsable: los resultados de simulaciones sintéticas no deben presentarse como opinión pública real sin validación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vennemeyerd/persona-distribution-qwen3.5-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Qwen: no disponible en la información proporcionada
- Paper o blog del adaptador: no disponible en la información proporcionada
