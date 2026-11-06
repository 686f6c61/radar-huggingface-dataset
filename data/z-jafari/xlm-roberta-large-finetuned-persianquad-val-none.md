# Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-None

## Resumen

`xlm-roberta-large-finetuned-PersianQuAD-val-None` es un modelo de respuesta a preguntas extractiva (question answering) publicado por el usuario Z-Jafari en Hugging Face. Se trata de un ajuste fino del modelo multilingue `FacebookAI/xlm-roberta-large` sobre un conjunto de datos de QA en persa (PersianQuAD), segun se deduce del propio nombre del repositorio y de los modelos hermanos publicados por el mismo autor. El modelo resuelve la tarea de localizar un fragmento de texto (span) dentro de un contexto que responde a una pregunta dada, devolviendo la posicion de inicio y fin del span.

Arquitectura transformer encoder-only basada en XLM-RoBERTa large, con 558.842.882 parametros y una ventana de contexto de 512 tokens (la nativa de la familia XLM-R). La model card es autocontenida y generada por el Trainer de Hugging Face, con campos sin completar ("More information needed"), y no declara explicitamente el dataset de entrenamiento ni los idiomas soportados mas alla del nombre del repositorio.

Su relevancia es acotada: se trata de un artefacto de investigacion con 3 descargas y 0 likes en el momento de la consulta, util como referencia para pipelines de QA extractiva en persa o como punto de partida para fine-tuning. No es un modelo generativo ni un LLM conversacional; es un extractor de spans.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa large) |
| Parametros totales | 558.842.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (nativa de XLM-R; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se publican GGUF) |
| Idiomas soportados | no disponible (el nombre del repo sugiere persa; XLM-R base es multilingue con 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/xlm-roberta-large`, un transformer encoder-only con 24 capas, 16 cabezas de atencion, dimension oculta 1024 y vocabulario SentencePiece de 250.002 tokens. Sobre esta base se anade una cabeza de question answering para predecir las posiciones de inicio y fin del span respuesta. El entrenamiento se realizo con el Trainer de Hugging Face con los siguientes hiperparametros: learning rate 2e-5, batch size 16, 3 epocas, optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal y mixed precision nativa (AMP). El seed fue 42.

La evolucion de la perdida de validacion muestra sobreajuste a partir de la segunda epoca: 0.7126 en la epoca 1, 0.6377 en la epoca 2 y 0.7038 en la epoca 3. El autor reporta en la model card un loss de evaluacion de 0.7038 y metricas de exact match 87.9 y F1 90.38 sobre el conjunto de validacion. No se documenta el dataset de entrenamiento (la model card indica "unknown dataset"), la composicion del corpus, el numero de tokens ni si hubo etapas de RLHF o DPO (no aplicables a un modelo encoder-only de QA). El nombre del repositorio sugiere PersianQuAD, si bien no se aporta la ficha del dataset ni su procedencia.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que responde.
- Soporte multilingue heredado de XLM-R (100 idiomas en el modelo base), aunque el ajuste fino se orienta a persa segun el nombre del repositorio.
- Manejo de contextos de hasta 512 tokens por consulta.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un encoder, no genera texto).
- No dispone de modo thinking, vision ni audio.
- No genera texto libre: solo extrae fragmentos del contexto proporcionado.

## Casos de uso

- Busqueda documental con respuesta extractiva: indexar un corpus de documentos en persa y, dada una consulta, recuperar el pasaje exacto que la responde usando el span predicho como cita verificable.
- Construccion de FAQs automaticas: emparejar preguntas de usuarios con fragmentos de una base de conocimiento persa, devolviendo el texto literal en lugar de una respuesta generada, lo que reduce el riesgo de alucinacion.
- Extraccion de entidades y atributos en formularios: localizar campos concretos (fechas, nombres, importes) dentro de textos estructurados en persa.
- Anotacion asistida de datasets: preetiquetar pares pregunta-respuesta para revision humana en proyectos de NLP en persa, acelerando el etiquetado.
- Enriquecimiento de pipelines RAG: usar el modelo como reranker extractivo o como verificador de spans tras la recuperacion, comprobando que el fragmento recuperado contiene literalmente la respuesta.
- Analisis de contratos y normativa: localizar clausulas concretas en documentos legales persas con contexto de 512 tokens por fragmento.
- Evaluacion comparativa de QA en persa: servir como baseline de referencia frente a modelos generativos en tareas de exact match y F1.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de validacion):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.7038 |
| Exact match | 87.9 |
| F1 | 90.38249639249632 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El model-index del repositorio esta vacio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (558,8 M parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, 3-4 GB.
- VRAM estimada en fp16: aproximadamente 1,1 GB para pesos; 2-3 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para throughput alto, A10G, L4, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas (GTX 1650 4 GB en adelante); tambien en CPU para volumentes bajos.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, TorchServe, ONNX Runtime, Triton Inference Server, FastAPI con batching. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud para un encoder de 558 M parametros, en una T4 cabria esperar decenas de inferencias por segundo con batching, pero no se aporta medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-None | 558,8 M | 512 | QA extractiva (persa) | MIT | Hugging Face, 3 descargas |
| Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None | no disponible en la informacion | 512 | QA extractiva (persa) | no disponible | Hugging Face |
| Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD_Factoid_Test | no disponible en la informacion | 512 | QA extractiva (persa) | no disponible | Hugging Face |
| FacebookAI/xlm-roberta-large (base) | 558,8 M | 512 | encoder multilingue | MIT | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, tarea y licencia.

## Limitaciones y advertencias

- Model card incompleta: el dataset de entrenamiento figura como "unknown", no se documentan los idiomas ni las limitaciones de uso; el autor no ha completado las secciones de usos previstos.
- Sobreajuste probable: la perdida de validacion empeora en la tercera epoca (0.6377 en la epoca 2 frente a 0.7038 en la epoca 3), lo que sugiere que el checkpoint final no es el optimo.
- Riesgo de alucinacion bajo en sentido estricto (solo extrae spans del contexto), pero puede devolver spans incorrectos o vacios cuando la respuesta no esta en el contexto o supera los 512 tokens.
- Limitacion de contexto: 512 tokens; documentos mas largos requieren fragmentacion previa con solapamiento, lo que puede cortar la respuesta.
- Sesgos: no documentados por el autor; hereda los sesgos del corpus de preentrenamiento de XLM-R y del dataset PersianQuAD, no auditados.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de XLM-R conviene revisar las condiciones del modelo base (tambien MIT).
- Sin garantias de calidad en produccion: 3 descargas, 0 likes y ausencia de evaluacion independiente; no recomendable como dependencia critica sin validacion propia.
- Idiomas: aunque XLM-R es multilingue, el ajuste fino esta orientado a persa; el rendimiento en otros idiomas no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-None
- Modelo hermano (base): https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None
- Modelo hermano (test factoid): https://huggingface.co/Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD_Factoid_Test
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-R (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
