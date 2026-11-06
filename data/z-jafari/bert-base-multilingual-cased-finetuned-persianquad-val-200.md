# Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-200

## Resumen

`Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-200` es un modelo de respuesta a preguntas extractiva (question answering) obtenido mediante fine-tuning de `google-bert/bert-base-multilingual-cased` sobre un conjunto de datos persa derivado de PersianQuAD. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia Apache 2.0. El modelo no introduce arquitectura nueva: reutiliza el encoder BERT multilingüe original y ajusta sus pesos para localizar el fragmento de texto que responde a una pregunta formulada sobre un contexto dado.

Con 177.264.386 parámetros, es un modelo compacto y desplegable en hardware modesto, pensado para tareas de extracción de respuestas sobre documentos en persa. Su relevancia es acotada: se trata de un checkpoint experimental de un autor individual, sin model card completada ni resultados de benchmarks en el model-index, pero con métricas de validación declaradas (exact match 77,7 y F1 81,21) que resultan útiles como referencia para quien evalúe QA extractiva en persa.

No es un modelo generativo ni conversacional: no produce texto libre, sino que devuelve los índices de inicio y fin de la respuesta dentro del contexto proporcionado. Esto lo sitúa en un nicho concreto (búsqueda documental, extracción de datos estructurados desde texto) y lo aleja de los usos de chat o razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, solo encoder) |
| Parametros totales | 177.264.386 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | multilingüe (modelo base); el fine-tuning se orienta a persa; lista explícita no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un encoder Transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario case-sensitive y cobertura de más de 100 idiomas. Sobre esa base se añade la cabeza estándar de question answering (proyección lineal sobre los estados ocultos para predecir las posiciones de inicio y fin de la respuesta). El fine-tuning se realizó con la librería Transformers 5.22.0 y PyTorch 2.11.0+cu130, con AdamW fused, learning rate 2e-05, batch size 16, scheduler lineal, 3 épocas y precisión mixta nativa (AMP), semilla 42.

El conjunto de entrenamiento no está documentado en la model card ("unknown dataset"), aunque el nombre del checkpoint indica que se trata de PersianQuAD, un corpus de QA extractiva en persa. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo extractivo de este tipo). La pérdida de validación evoluciona de 0,8535 en la época 1 a 0,8212 en la época 2 y sube a 0,8871 en la época 3, lo que sugiere un ligero sobreajuste en la última época.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Comprensión lectora multilingüe heredada del modelo base, con especialización en persa por el fine-tuning.
- Extracción de información desde documentos: identificación de entidades, fechas, cifras o fragmentos concretos dentro de un pasaje.
- No genera texto libre ni mantiene conversaciones multi-turno.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni modos de "thinking".
- No dispone de capacidades de visión, audio ni multimodalidad.
- No se documenta soporte de agentes.

## Casos de uso

- Búsqueda de respuestas en documentación interna en persa: se indexan documentos y, para cada consulta, se pasa el fragmento relevante como contexto al modelo, que devuelve el span exacto de la respuesta. Adecuado por su bajo coste computacional y su especialización en persa.
- Extracción de campos en formularios o contratos: localizar valores concretos (importes, fechas, nombres) dentro de un texto persa, integrando el modelo en un pipeline de parsing documental.
- Atención al cliente basada en FAQ: emparejar la pregunta del usuario con la entrada de una base de conocimiento y extraer la respuesta literal del artículo correspondiente, sin generación libre y por tanto con menor riesgo de alucinación.
- Sistemas de lectura comprensiva para evaluación educativa: responder preguntas sobre textos persas en plataformas de aprendizaje automático de idiomas.
- Enriquecimiento de bases de datos: extraer automáticamente respuestas desde corpus periodísticos o académicos en persa para poblar registros estructurados.
- Componente de un pipeline RAG: usar el modelo como extractor final (reader) tras una etapa de recuperación (retriever), devolviendo el fragmento exacto que responde a la consulta del usuario.
- Análisis de encuestas o reseñas: extraer menciones concretas (productos, problemas, ubicaciones) desde texto libre en persa.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados. Las únicas métricas disponibles son las declaradas por el autor en la model card para el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,8871 |
| Exact match | 77,7 |
| F1 | 81,21 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones oficiales con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB para los pesos (177 M de parámetros), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB.
- En fp16 o bf16: alrededor de 0,35 GB de pesos, con huella total por debajo de 1 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para producción de alto throughput: T4, L4, A10G o A100, aunque el modelo está sobredimensionado para estas aceleradoras y se beneficia más del batching que de la potencia por GPU.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, TorchServe, FastAPI con batching, o exportación a ONNX Runtime para inferencia en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-200 | 177 M | 512 | QA extractiva (persa) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-multilingual-cased | 178 M | 512 | Encoder multilingüe (base, sin fine-tuning QA) | Apache 2.0 | Hugging Face |
| Z-Jafari/bert-base-multilingual-cased-finetuned-DS_QA | no disponible | 512 (heredado) | QA extractiva | no disponible | Hugging Face |
| Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None | no disponible | 512 (heredado) | QA extractiva (persa) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo extractivo: no genera respuestas, solo localiza spans; si la respuesta no está literalmente en el contexto, no puede responderla.
- Riesgo de alucinación bajo en comparación con modelos generativos, pero puede devolver spans incorrectos o vacíos cuando la pregunta no está cubierta por el contexto.
- Sesgos heredados del corpus multilingüe de BERT y del dataset PersianQuAD, no evaluados por el autor.
- Contexto limitado a 512 tokens, lo que obliga a trocear documentos largos y puede perder respuestas que crucen fragmentos.
- El conjunto de evaluación tiene solo 200 ejemplos según el nombre del checkpoint, por lo que las métricas declaradas tienen alta varianza y no deben tomarse como estimaciones robustas.
- La model card está incompleta ("More information needed" en descripción, usos previstos y datos de entrenamiento), lo que dificulta la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni procedencia exacta de los datos de fine-tuning.
- El sobreajuste observado en la época 3 (subida de la pérdida de validación) sugiere que el checkpoint final no es necesariamente el óptimo; conviene evaluar checkpoints intermedios si se reentrena.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, lo que indica un modelo experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-200
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Variante relacionada (val-None): https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None
- Variante relacionada (DS_QA): https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-DS_QA
