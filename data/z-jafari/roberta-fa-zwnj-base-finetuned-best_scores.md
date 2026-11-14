# Z-Jafari/roberta-fa-zwnj-base-finetuned-best_scores

## Resumen

`roberta-fa-zwnj-base-finetuned-best_scores` es un modelo de respuesta a preguntas extractiva (question answering) para persa, desarrollado por el usuario Z-Jafari. Se trata de un ajuste fino de `HooshvareLab/roberta-fa-zwnj-base`, un RoBERTa base adaptado al persa con preprocesamiento específico del carácter ZWNJ (zero-width non-joiner), un elemento ortográfico clave en farsi. El modelo resuelve la tarea de localizar el fragmento de texto (span) que responde a una pregunta dado un contexto, devolviendo posiciones de inicio y fin sobre el pasaje de entrada.

Con 117,7 millones de parámetros y licencia Apache 2.0, es un modelo compacto orientado a inferencia económica en CPU o GPU de gama baja. Su relevancia radica en cubrir QA extractiva en persa, un idioma con menos recursos que el inglés, y en heredar el tratamiento del ZWNJ del modelo base, lo que evita problemas de tokenización en palabras compuestas persas. La model card es escasa: el autor no documenta el dataset de entrenamiento ni los usos previstos, y el model-index no contiene resultados declarados, aunque el README sí reporta métricas en el conjunto de evaluación.

El modelo se publicó el 12 de noviembre de 2026 y acumula 170 descargas. Es un artefacto de ajuste fino típico de `Trainer`, sin documentación adicional, por lo que su evaluación debe basarse en las métricas reportadas por el autor y en la inspección del propio checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only) |
| Parametros totales | 117.709.058 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base RoBERTa admite 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | persa (farsi), inferido del modelo base; no declarado explícitamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de la familia RoBERTa, con 117,7 millones de parámetros, derivado de `HooshvareLab/roberta-fa-zwnj-base`. La particularidad del modelo base es el tratamiento del ZWNJ en la tokenización, un carácter que en persa separa componentes de palabras compuestas y cuya gestión incorrecta degrada la calidad de los embeddings. Sobre esta base se añadió una cabeza de question answering (clasificación de posiciones de inicio y fin sobre la secuencia).

El ajuste fino se realizó con `Trainer` de Transformers durante 3 épocas, con learning rate 2e-05, batch size de 16 en entrenamiento y evaluación, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y precisión mixta nativa (AMP). El conjunto de entrenamiento no está documentado ("unknown dataset" según la model card). La pérdida de validación evolucionó de 1,7762 (época 1) a 1,5715 (época 2) y repuntó a 1,7446 (época 3), lo que sugiere un posible sobreajuste a partir de la segunda época. Las versiones de framework reportadas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el span de texto que contiene la respuesta.
- Manejo del carácter ZWNJ en la tokenización, heredado del modelo base, relevante para la ortografía persa.
- Comprensión lectora monolingüe en persa; no se declaran capacidades multilingües.
- No soporta tool calling ni function calling: es un modelo encoder-only de QA, no generativo.
- No soporta agentes ni razonamiento multi-paso; la tarea es de extracción de spans en una sola pasada.
- No dispone de modo thinking, visión ni audio.
- No es un modelo conversacional: no genera texto libre, solo localiza respuestas dentro de un contexto proporcionado.

## Casos de uso

- Búsqueda de respuestas sobre documentación técnica en persa: indexar manuales o bases de conocimiento y usar el modelo para extraer el fragmento exacto que responde a la consulta del usuario, aprovechando su naturaleza extractiva para evitar respuestas inventadas.
- Atención al cliente sobre FAQ persas: dado un artículo de ayuda como contexto, el modelo localiza la frase que responde a la pregunta del cliente, lo que permite construir sistemas de soporte con respuestas trazables a la fuente.
- Extracción de datos de formularios y contratos en persa: localizar campos concretos (fechas, importes, nombres) dentro de documentos estructurados tratando cada campo como una pregunta sobre el texto.
- Enriquecimiento de bases de datos documentales: pipeline batch que, para cada documento, lanza preguntas predefinidas y almacena los spans extraídos como metadatos estructurados.
- Asistente de estudio sobre textos académicos persas: el estudiante plantea preguntas sobre un capítulo y el modelo señala el pasaje relevante, útil en entornos con recursos limitados por su tamaño compacto.
- Componente de un sistema RAG en persa: usar el modelo como lector (reader) tras la fase de recuperación, extrayendo la respuesta del pasaje recuperado; su bajo coste computacional permite desplegarlo en CPU.
- Moderación o verificación de afirmaciones: comprobar si una afirmación aparece respaldada en un corpus persa localizando el span correspondiente.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados. Las únicas métricas disponibles son las reportadas por el autor en la model card sobre el conjunto de evaluación (dataset no especificado).

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1.7446 |
| Exact Match | 64.1 |
| F1 | 69.0327 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (117,7 M de parámetros); en FP16 alrededor de 0,25 GB. El repositorio ocupa 9,4 GB, probablemente por checkpoints intermedios del entrenamiento, no por el tamaño del modelo final.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para hardware de gama alta.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia en lote con latencias aceptables.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, TorchScript, ONNX Runtime, o servidores de inferencia como TGI (Text Generation Inference no aplica al ser encoder-only; usar servicios de inferencia genéricos). No hay GGUF publicado, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera del orden de milisegundos por consulta en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-best_scores | 117,7 M | no disponible | QA extractiva persa | Apache 2.0 | Hugging Face |
| HooshvareLab/roberta-fa-zwnj-base | ~117 M (base) | no disponible | encoder base persa | no disponible en la informacion | Hugging Face |
| Modelos QA persas de la familia ParsBERT | no disponible | no disponible | QA / clasificacion persa | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", lo que impide evaluar la cobertura temática y el dominio de aplicación.
- Riesgo de sobreajuste: la pérdida de validación aumenta en la época 3 (1,5715 a 1,7446), por lo que el checkpoint puede no ser el óptimo; el nombre "best_scores" sugiere selección por métrica, pero no se detalla el criterio.
- Ámbito restringido a QA extractiva: no genera texto, no conversa y no puede usarse para tareas generativas.
- Idioma limitado al persa; no se declaran capacidades multilingües y el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación bajo en sentido estricto (solo extrae spans del contexto), pero puede devolver fragmentos irrelevantes o mal delimitados si la respuesta no está presente en el pasaje.
- Longitud de contexto no confirmada: si se hereda el límite de 512 tokens de RoBERTa, los documentos largos deben dividirse en fragmentos, con posible pérdida de contexto.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en la información disponible, conviene verificar la licencia del modelo base antes de producción.
- Sin mantenimiento documentado: 0 likes y documentación mínima sugieren un artefacto experimental más que un modelo listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-best_scores
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
