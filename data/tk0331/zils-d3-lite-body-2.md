# tk0331/zils-d3-lite-body-2

## Resumen

`tk0331/zils-d3-lite-body-2` es una redistribución de pesos del checkpoint `XINLI1997/ErrOPD-Qwen3.5-0.8B-student-Fashion`, un modelo de 852.985.920 parámetros construido sobre `Qwen/Qwen3.5-0.8B`. El autor original del checkpoint es Xin Li y colaboradores, en el marco del artículo *ErrOPD: When Does On-Policy Distillation Transfer Teacher Errors?* (arXiv:2605.08737). Esta revisión concreta no modifica los pesos del modelo: únicamente los reempaqueta en bfloat16 bajo los nombres completos del modelo Qwen3.5, de modo que cada tensor se almacene con la nomenclatura del modelo base.

El modelo es un ajuste supervisado (SFT) del estudiante Qwen3.5-0.8B sobre objetivos "limpios" del dataset Fashion, y constituye el punto de partida del proceso de destilación on-policy que estudia el paper. Su tarea es muy concreta: dado el título de un producto de Amazon Fashion y ocho reseñas del mismo, debe puntuar la utilidad de cada reseña para un comprador en una escala de 0 a 10 y devolver una lista JSON estricta de ocho objetos `{"review_id", "score"}` en el orden del prompt.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigación reproducible para estudiar cómo se propagan los errores del profesor al estudiante en destilación on-policy. Por otro, advierte de que no es un asistente general: fuera de su tarea estructurada, las salidas carecen de sentido. El contexto, los idiomas soportados y los benchmarks no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), cargado como modelo de lenguaje para tareas de texto |
| Parametros totales | 852.985.920 (0,85 B, incluye el codificador de visión no utilizado) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (la model card indica inglés, Amazon Fashion únicamente) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-0.8B) |
| Formato de pesos | safetensors (bf16, 1 archivo, 1,71 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5 en su variante de 0,8 B, con el layout multimodal `Qwen3_5ForConditionalGeneration`. Para estas tareas de texto se carga únicamente la parte del modelo de lenguaje mediante `AutoModelForCausalLM`, aunque el checkpoint conserva el codificador de visión (no utilizado). Los pesos se almacenan en bfloat16 en un único archivo safetensors de 1,71 GB. La carga requiere `transformers>=5.3.0`.

El entrenamiento consiste en un ajuste supervisado (SFT) del estudiante sobre los objetivos limpios de `train.jsonl` del dataset `XINLI1997/ErrOPD-Fashion` (1.795 listas). Este checkpoint es el punto de partida del proceso de destilación on-policy descrito en el paper; las configuraciones y scripts completos están en el repositorio de código. La plantilla de chat incluida es la plantilla fija usada en el fine-tuning, los rollouts de destilación y la evaluación del paper; no incluye bloque de razonamiento y parámetros como `enable_thinking` no tienen efecto. Los profesores de esta release fueron ajustados para introducir deliberadamente un error de formato, y los estudiantes destilados pueden heredarlo, que es precisamente lo que mide el paper.

## Capacidades

- Generación de texto restringida a una única tarea: puntuación de utilidad de reseñas de Amazon Fashion.
- Salida estructurada estricta: lista JSON de ocho objetos `{"review_id", "score"}` en el orden de las reseñas del prompt.
- Puntuación en escala 0-10 según la rúbrica fija del paper (puntuaciones de Gemini 2.5 Pro, no etiquetas humanas).
- Procesamiento de prompts con múltiples turnos (system + user) mediante la plantilla de chat incluida.
- Carga compatible con vLLM directamente desde la carpeta del modelo.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking: la plantilla no incluye bloque de razonamiento.
- Capacidades multilingües: no disponibles; el modelo está entrenado para inglés sobre Amazon Fashion.
- Capacidades de visión: el codificador existe en el checkpoint pero no se utiliza en estas tareas.

## Casos de uso

- Investigación en destilación on-policy: sirve como estudiante de partida (student start) para reproducir los experimentos del paper ErrOPD y medir la transferencia de errores del profesor al estudiante. Es su propósito original y el único uso para el que fue entrenado.
- Evaluación de robustez ante errores de formato: al ser un estudiante destilado de profesores con un error de formato inyectado, permite estudiar si el estudiante hereda dicho error y en qué condiciones.
- Reproducción de resultados del paper: con el dataset `XINLI1997/ErrOPD-Fashion` (split de validación) y el código del repositorio se pueden replicar las puntuaciones de la Tabla 1 para Qwen3.5 0.8B / Fashion.
- Benchmark de tareas de salida estructurada: como referencia de un modelo pequeño (0,85 B) que produce JSON estricto en un dominio acotado, útil para comparar pipelines de validación de esquemas.
- Pruebas de despliegue en vLLM: el modelo se carga directamente desde la carpeta, por lo que sirve para validar infraestructura de serving con modelos pequeños multimodales de Qwen3.5.
- Estudio de sesgos de rúbrica: al entrenarse sobre puntuaciones de Gemini 2.5 Pro bajo una rúbrica fija, permite analizar cómo se heredan las preferencias de un evaluador automático en un modelo estudiante.
- Fine-tuning posterior controlado: como checkpoint base para experimentos de SFT adicionales en tareas de ranking de reseñas, siempre dentro del dominio Fashion en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la Tabla 1 del paper (arXiv:2605.08737) para las puntuaciones del checkpoint, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,7 GB solo para pesos, más memoria para el contexto y el runtime; en la práctica, entre 2 y 4 GB según la longitud del prompt y el backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más.
- Opciones de despliegue: vLLM (carga directa de la carpeta), `transformers>=5.3.0` con `accelerate` y `device_map="auto"`; llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tk0331/zils-d3-lite-body-2 | 0,85 B | no disponible | Ranking de reseñas Fashion (JSON) | Apache-2.0 | Hugging Face |
| XINLI1997/ErrOPD-Qwen3.5-0.8B-student-Fashion | 0,85 B | no disponible | Ranking de reseñas Fashion (JSON) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | Modelo base multimodal generalista | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de 0,8 B para tareas estructuradas) no está disponible en la información proporcionada. El checkpoint original y esta redistribución comparten pesos; la diferencia es únicamente el empaquetado (nombres completos Qwen3.5 en bf16).

## Limitaciones y advertencias

- Entrenado para una única tarea estrecha de salida estructurada; no es un asistente general y las salidas para otros prompts no son significativas.
- Los profesores de esta release fueron ajustados para introducir un error de formato a propósito; los estudiantes destilados pueden heredarlo, y el paper mide precisamente ese fenómeno.
- Los objetivos de utilidad son puntuaciones de Gemini 2.5 Pro bajo una rúbrica fija, no etiquetas humanas; el modelo hereda las preferencias de esa rúbrica.
- Dominio limitado a inglés y a Amazon Fashion; no hay soporte multilingüe declarado.
- La plantilla de chat no incluye bloque de razonamiento y `enable_thinking` no tiene efecto.
- Riesgo de alucinación en la puntuación: al ser un modelo de 0,85 B, puede producir identificadores o puntuaciones inconsistentes fuera de la distribución de entrenamiento.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datos de entrenamiento conservan sus propios términos (ver la dataset card de `XINLI1997/ErrOPD-Fashion`); conviene revisarlos antes de un uso comercial.
- Requiere `transformers>=5.3.0`; versiones anteriores no cargan los checkpoints Qwen3.5.
- El codificador de visión se incluye en el checkpoint pero no se utiliza; no debe asumirse capacidad multimodal efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tk0331/zils-d3-lite-body-2
- Modelo original: https://huggingface.co/XINLI1997/ErrOPD-Qwen3.5-0.8B-student-Fashion
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/XINLI1997/ErrOPD-Fashion
- Paper: https://arxiv.org/abs/2605.08737
- Código: https://github.com/LiXin97/ErrOPD
- Página del proyecto: https://lixin.ai/ErrOPD
- Colección ErrOPD: https://huggingface.co/collections/XINLI1997/erropd-6acdbfaf2916ad2cc80e9a60
