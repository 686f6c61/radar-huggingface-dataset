# Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-80

## Resumen

`xlm-roberta-base-finetuned-PersianQuAD-val-80` es un ajuste fino (fine-tuning) del modelo multilingüe `FacebookAI/xlm-roberta-base` de Meta AI, especializado en la tarea de respuesta a preguntas extractiva (question answering) sobre textos en persa. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia MIT. El nombre del repositorio sugiere que el ajuste se ha realizado sobre el conjunto de datos PersianQuAD, un corpus de QA en persa, aunque la model card no lo confirma explícitamente y describe el dataset de entrenamiento como "unknown dataset".

El modelo resuelve un problema concreto: dado un contexto en persa y una pregunta, localizar el fragmento exacto del contexto que responde a esa pregunta (span extraction). Con 277 millones de parámetros y una arquitectura transformer encoder-only, se posiciona como una alternativa ligera frente a modelos generativos de mayor tamaño para tareas de QA extractivo en persa, con un rendimiento declarado de 81,1 de exact match y 83,44 de F1 en el conjunto de validación.

Su relevancia radica en que el persa es un idioma con relativamente pocos recursos de PLN de calidad, y este ajuste ofrece un punto de partida funcional y de licencia permisiva para construir sistemas de búsqueda de respuestas, asistentes documentales o pipelines de extracción de información sobre corpus persas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa base) |
| Parametros totales | 277.454.594 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de XLM-RoBERTa base; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base es multilingüe con 100 idiomas; el ajuste está orientado a persa) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 8,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con objetivos de masked language modeling sobre corpus multilingües. Sobre esta base se ha añadido una cabeza de question answering (clasificación de tokens de inicio y fin del span) y se ha ajustado de forma supervisada.

Según la model card, el entrenamiento se realizó durante 3 épocas con learning rate 2e-05, batch size de 16, optimizador AdamW (fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal y precisión mixta nativa (AMP), con semilla 42. La pérdida de validación descendió de 0,8777 en la época 1 a 0,7553 en la época 3. No se documentan detalles sobre el volumen de datos, la composición del dataset ni si hubo técnicas de regularización adicionales. Las versiones de framework indicadas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Procesamiento de textos en persa (según el nombre del modelo y el dataset de ajuste).
- Capacidad multilingüe heredada del modelo base XLM-RoBERTa, aunque el ajuste está especializado en persa.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni capacidades agénticas.
- No es un modelo conversacional: no mantiene diálogos multi-turno de forma nativa.

## Casos de uso

- Búsqueda de respuestas en documentación corporativa en persa: indexar manuales, políticas internas o bases de conocimiento y usar el modelo para extraer el fragmento exacto que responde a la consulta del usuario.
- Sistemas de preguntas frecuentes (FAQ) sobre sitios web: emparejar la pregunta del visitante con el pasaje relevante de la página de ayuda, devolviendo la respuesta literal sin generación.
- Extracción de información en pipelines de análisis documental: localizar datos concretos (fechas, nombres, cifras) en contratos o informes en persa para su posterior estructuración.
- Asistentes de atención al cliente basados en recuperación: combinar el modelo con un retriever (por ejemplo, búsqueda semántica) para responder consultas con evidencia textual verificable.
- Investigación en PLN para persa: servir como baseline reproducible para experimentos de QA extractivo, dado su rendimiento declarado y su licencia permisiva.
- Anotación asistida de corpus: preetiquetar pares pregunta-respuesta para acelerar la revisión humana en proyectos de creación de datasets en persa.
- Integración en aplicaciones educativas: responder preguntas sobre apuntes o materiales de estudio en persa devolviendo el fragmento relevante del texto.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card para el conjunto de evaluación (validación):

| Metrica | Valor |
|---|---|
| Loss (validación) | 0,7553 |
| Exact match | 81,1 |
| F1 | 83,4438 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos (277 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB.
- En FP16/BF16: aproximadamente 0,55 GB para pesos; en la práctica, entre 1,5 y 2 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin problema.
- Puede ejecutarse en CPU para cargas de baja concurrencia, aunque con mayor latencia.
- Opciones de despliegue: transformers con pipeline `question-answering`, TorchServe, ONNX Runtime, y servidores de inferencia compatibles con modelos encoder (por ejemplo, Text Embeddings Inference no aplica directamente; vLLM y llama.cpp no están orientados a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-80 | 277 M | 512 tokens (estándar XLM-R) | QA extractivo en persa | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe (requiere ajuste para QA) | MIT | Hugging Face |
| Google mBERT (bert-base-multilingual-cased) | 178 M | 512 tokens | Modelo base multilingüe | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"); no se documenta el dataset de entrenamiento, los idiomas exactos ni las limitaciones previstas por el autor.
- El nombre del repositorio sugiere el uso de PersianQuAD, pero esto no está confirmado en la documentación oficial.
- Riesgo de alucinación bajo en QA extractivo (el modelo selecciona spans del contexto), pero puede devolver spans incorrectos o vacíos cuando la respuesta no está presente en el contexto.
- El rendimiento está evaluado únicamente sobre un conjunto de validación no descrito; la generalización a otros dominios o registros del persa es incierta.
- Longitud de contexto limitada a 512 tokens (límite de XLM-RoBERTa base), lo que restringe el tamaño de los documentos que se pueden procesar en una sola pasada.
- No apto para generación de texto, diálogo abierto ni tareas agénticas.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda verificar las condiciones del modelo base y del dataset de ajuste (no documentadas).
- El modelo tiene muy poca tracción (66 descargas, 0 likes) y no ha sido validado por la comunidad; para producción se recomienda una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-80
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Repositorio de Transformers: https://github.com/huggingface/transformers
