# Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80

## Resumen

roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80 es un modelo de respuesta a preguntas extractiva (question answering) para persa, desarrollado por el usuario Z-Jafari. Se trata de un ajuste fino (fine-tuning) del modelo base HooshvareLab/roberta-fa-zwnj-base, una variante de RoBERTa adaptada al persa con tratamiento específico de caracteres ZWNJ (Zero-Width Non-Joiner), sobre un subconjunto del conjunto de datos PersianQuAD (el 80 por ciento destinado a validación, según el nombre del modelo).

El modelo resuelve la tarea de localizar la respuesta a una pregunta dentro de un párrafo de contexto, devolviendo el fragmento exacto (span extraction). Con 117,7 millones de parámetros, es un modelo de tamaño base pensado para despliegues ligeros y de baja latencia, no para generación libre de texto. Su relevancia radica en cubrir un nicho poco poblado: QA extractivo en persa con una licencia permisiva (Apache 2.0) y pesos en safetensors compatibles con el ecosistema transformers.

La información pública disponible es escasa: la model card fue generada automáticamente por el Trainer de Hugging Face y no detalla el dataset exacto, la composición del entrenamiento ni los idiomas soportados más allá del persa implícito. Los resultados declarados (exact match 58,6 y F1 64,71) son los únicos datos de rendimiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa adaptado a persa con ZWNJ) |
| Parametros totales | 117.709.058 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base, habitualmente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion no documentada) |
| Idiomas soportados | persa (implícito por el modelo base y el dataset; no declarado explícitamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa en su configuración base, heredado de HooshvareLab/roberta-fa-zwnj-base. La particularidad del modelo base es el preprocesamiento de caracteres ZWNJ (Zero-Width Non-Joiner), un carácter de control usado en persa para separar morfemas y que suele causar problemas de tokenización en modelos no adaptados. El ajuste fino añade una cabeza de question answering sobre el encoder para extraer el span de respuesta.

El entrenamiento se realizó durante 3 épocas con un learning rate de 2e-05, batch size de 16, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y precisión mixta nativa (AMP). La pérdida de entrenamiento descendió de 1,6639 a 0,6747, mientras que la pérdida de validación alcanzó su mínimo en la época 2 (1,1532) y repuntó en la época 3 (1,2235), lo que sugiere un ligero sobreajuste en la última época. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo técnicas de regularización adicionales. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el fragmento exacto del contexto que responde a la pregunta.
- Comprensión lectora en persa: identificacion de spans relevantes dentro de parrafos.
- Manejo de caracteres ZWNJ: tokenizacion adaptada a la ortografia persa con separadores morfologicos.
- No soporta generación de texto libre (no es un modelo causal).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el modelo está orientado al persa.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Busqueda de respuestas en bases documentales persas: indexar documentos y usar el modelo para extraer la frase exacta que responde a una consulta del usuario, con latencia baja gracias a sus 117,7 M de parámetros.
- Atención al cliente sobre FAQ en persa: dado un artículo de ayuda como contexto, localizar el pasaje que responde a la pregunta del cliente sin generar texto nuevo, reduciendo el riesgo de alucinación.
- Extracción de datos estructurados de contratos o formularios persas: localizar campos concretos (fechas, importes, nombres) dentro de párrafos mediante preguntas dirigidas.
- Asistente de lectura para documentación técnica en persa: resaltar la sección relevante de un manual ante una pregunta del usuario.
- Preprocesamiento para pipelines RAG en persa: usar el modelo como extractor de evidencia antes de pasar el fragmento a un modelo generativo, mejorando la precisión de las citas.
- Anotación asistida de corpus: generar spans candidatos para revisión humana en proyectos de anotación de QA en persa.
- Evaluación de calidad de respuestas: comparar el span extraído por el modelo con la respuesta de referencia para medir la cobertura de un sistema de QA.

## Benchmarks y rendimiento

Los únicos datos publicados son los declarados por el autor en la model card, sobre el conjunto de evaluación (presumiblemente el 20 por ciento de validación de PersianQuAD, aunque no se detalla):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1,2235 |
| Exact match | 58,6 |
| F1 | 64,71 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El model-index del repositorio está vacío (results: []).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (117,7 M de parámetros × 4 bytes) más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU con latencia aceptable para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers con pipeline de question-answering, ONNX Runtime, TorchScript, TGI (si se convierte a formato compatible) y llama.cpp no aplica (no es un modelo generativo GGUF). vLLM no es la opción natural para un encoder de QA.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU para contextos de 512 tokens, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80 | 117,7 M | no disponible | QA extractivo persa | Apache 2.0 | Hugging Face |
| HooshvareLab/roberta-fa-zwnj-base (modelo base) | ~117 M | no disponible | encoder persa (preentrenamiento) | no disponible en esta ficha | Hugging Face |
| Otros modelos QA en persa | no disponible | no disponible | QA extractivo | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos ni de especificaciones de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, la composición de PersianQuAD ni el proceso de validación; la reproducibilidad es limitada.
- El nombre del modelo sugiere que se entrenó sobre el 80 por ciento de validación de PersianQuAD, lo que podría implicar solapamiento con el conjunto de evaluación y sobreestimar el rendimiento real.
- La pérdida de validación aumentó en la época 3, lo que indica posible sobreajuste; el checkpoint final no es necesariamente el mejor.
- Riesgo de alucinación bajo en QA extractivo (el span proviene del contexto), pero puede devolver spans incorrectos o vacíos si la respuesta no está en el contexto.
- Sesgos: no documentados; al entrenarse sobre un corpus persa, puede heredar sesgos del dataset base y de PersianQuAD.
- Limitaciones de idioma: orientado al persa; no se garantiza funcionamiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base HooshvareLab/roberta-fa-zwnj-base, no incluida en esta información.
- Longitud de contexto no confirmada: si se hereda la configuración RoBERTa base, el límite sería 512 tokens, lo que restringe contextos largos.
- Solo 212 descargas y 0 likes: modelo de baja adopción, sin validación comunitaria ni mantenimiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
