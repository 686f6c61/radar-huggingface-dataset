# sree02200/team9-college-data-slm

## Resumen

Team9-college-data-slm es un modelo de lenguaje de tipo small language model (SLM) entrenado desde cero por el autor sree02200, sin partir de pesos preentrenados. Con 6.276.736 parámetros, adopta una arquitectura transformer decoder-only de estilo Qwen3 (RoPE, Grouped Query Attention con QK-norm, SwiGLU y RMSNorm) y está especializado en responder preguntas sobre registros de programas universitarios: institución, programa, credencial, matrícula, ingresos medianos, deuda mediana, ocupación vinculada y salario de la ocupación.

El modelo resuelve un problema muy acotado: dado un registro estructurado de un programa formativo, extraer y devolver el dato solicitado, y responder "Not reported in the dataset." cuando el valor no está presente. Está entrenado sobre 999 registros de programas divididos por institución en train/validation/test, con un tokenizador BPE a nivel de byte de 3036 tokens y una longitud máxima de secuencia de 192 tokens.

Su relevancia es fundamentalmente educativa y de prototipado: demuestra el ciclo completo de entrenamiento from scratch de un SLM con arquitectura moderna y una evaluación de held-out por institución. No es un modelo de propósito general ni compite con LLMs de gran escala; su valor está en la trazabilidad del entrenamiento y en la métrica de exact match sobre preguntas factuales de un dominio cerrado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (RoPE, GQA con QK-norm, SwiGLU, RMSNorm) |
| Parametros totales | 6.276.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (max_seq_len) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo con pytorch y safetensors) |

Configuración declarada: `vocab_size` 3036, `d_model` 256, `n_heads` 8, `n_kv_groups` 4, `n_layers` 6, `d_ff` 768, `max_seq_len` 192. Tokenizador BPE a nivel de byte con 3036 tokens entrenado sobre los datos del proyecto.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con las innovaciones habituales de la familia Qwen3: embeddings rotatorios (RoPE) para la posición, Grouped Query Attention con 8 cabezas de consulta y 4 grupos de clave/valor, normalización QK, activación SwiGLU en la FFN y RMSNorm. La dimensión del modelo es 256, con 6 capas y una dimensión de feed-forward de 768, lo que da lugar a los 6,28M de parámetros. El vocabulario es pequeño (3036 tokens) porque el tokenizador se entrenó específicamente sobre el corpus de registros universitarios.

El entrenamiento se realizó desde cero (sin pesos preentrenados) durante 3000 iteraciones con batch de 32, optimizador AdamW con learning rate de 0.001 a 0.0001 mediante warm-up y decaimiento coseno, y cálculo de la pérdida únicamente sobre los tokens de respuesta. La mejor pérdida de validación fue 1.8569. No se menciona en la información disponible el uso de RLHF, DPO ni fases de alineación adicionales, ni el número total de tokens de entrenamiento. La división de datos se hizo por institución, de modo que el conjunto de test contiene instituciones nunca vistas durante el entrenamiento, lo que constituye una evaluación de generalización razonable para el dominio.

## Capacidades

- Generación de texto extractivo y question answering sobre registros estructurados de programas universitarios.
- Respuesta controlada ante valores ausentes: devuelve exactamente "Not reported in the dataset." en lugar de inventar o rellenar con cero.
- Manejo de campos como institución, programa, credencial, matrícula, ingresos medianos, deuda mediana, ocupación vinculada y salario de la ocupación.
- Generación greedy determinista (parámetro `greedy=True` en el ejemplo de uso), orientada a respuestas reproducibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Contexto muy limitado (192 tokens), suficiente para un registro y una pregunta cortos.

## Casos de uso

- Consulta de fichas de programas en portales de orientación académica: el modelo recibe el registro del programa como contexto y responde preguntas factuales sobre matrícula, deuda o ingresos; su ventana de 192 tokens está dimensionada exactamente para este formato.
- Extracción de campos en pipelines de datos educativos: se puede usar para transformar registros estructurados en respuestas en lenguaje natural de forma determinista (greedy), facilitando la generación de descripciones legibles a partir de tablas.
- Detección de datos faltantes en catálogos: la métrica de 0.967 de exact match en la categoría `not_reported` lo hace adecuado para señalar de forma fiable campos sin dato, en lugar de rellenarlos erróneamente.
- Prototipado educativo y docencia: sirve como ejemplo reproducible de entrenamiento from scratch de un SLM con arquitectura Qwen3, útil en cursos de NLP para ilustrar tokenización, entrenamiento y evaluación por institución held-out.
- Asistente de preguntas frecuentes sobre un programa concreto: integrado en una web de un centro, responde únicamente a partir del registro recuperado, con la salvaguarda de responder "Not reported in the dataset." cuando falta el dato.
- Validación de pipelines de QA sobre datos tabulares: sus resultados de test (exact match 0.538 global, token F1 0.579) permiten usarlo como baseline ligero en experimentos de extracción de respuestas antes de escalar a modelos mayores.
- Pruebas de despliegue en entornos con recursos mínimos: con 6,28M de parámetros, puede ejecutarse en CPU sin GPU dedicada, lo que lo hace útil para demos locales y entornos de CI.

## Benchmarks y rendimiento

Resultados de test sobre instituciones no vistas en entrenamiento (pérdida de test: 1.8998):

| Tipo de ejemplo | Ejemplos | Exact match | Token F1 |
|---|---|---|---|
| full_record | 2160 | 0.470 | 0.517 |
| not_reported | 299 | 0.967 | 0.967 |
| original | 1080 | 0.555 | 0.598 |
| ALL | 3539 | 0.538 | 0.579 |

Mejor pérdida de validación: 1.8569. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (6,28M de parámetros ocupan aproximadamente 25 MB en fp32 y unos 12,5 MB en fp16), más el overhead del runtime.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060) es sobradamente suficiente. También funciona en CPU.
- Cabe en cualquier GPU consumer y en Raspberry Pi o entornos embebidos con memoria suficiente.
- Opciones de despliegue: el repo proporciona un script `college_slm_model.py` cargado vía `importlib` y un `tokenizer.json` que se cargan con `huggingface_hub` y `tokenizers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada; por el tamaño y la generación greedy de 32 tokens, se espera una latencia muy baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team9-college-data-slm | 6,28M | 192 | QA sobre registros universitarios, from scratch | MIT | Hugging Face |
| Qwen3 (familia) | desde 0,6B en adelante | mucho mayor | LLM generalista | Apache 2.0 (según variante) | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | LLM generalista pequeño | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135M | 2048 | LLM generalista pequeño | Apache 2.0 | Hugging Face |

La comparación es asimétrica: los modelos generalistas tienen entre 20 y 200 veces más parámetros y contextos mucho mayores, pero no están especializados en el dominio ni ofrecen la salvaguarda explícita de valores ausentes. No se dispone de benchmarks comunes que permitan una comparación cuantitativa directa; los datos de la tabla de benchmarks corresponden solo a este modelo.

## Limitaciones y advertencias

- Es un prototipo de estudiante; el autor lo declara explícitamente como tal.
- Las respuestas dependen por completo del registro recuperado: si el contexto es incorrecto o incompleto, la respuesta también lo será.
- No puede responder preguntas fuera del dataset (instalaciones del campus, colocación laboral, garantías de empleo, predicciones de salario individual).
- Ventana de contexto de solo 192 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación en preguntas fuera de distribución, aunque la categoría `not_reported` muestra un exact match alto (0.967) para valores ausentes.
- El exact match global en test es 0.538, lo que implica que aproximadamente la mitad de las respuestas no coinciden exactamente con la referencia; no es adecuado para decisiones automatizadas sin verificación.
- No es asesoramiento financiero ni de admisiones, según advierte el autor.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni soporte.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el corpus son 999 registros de programas, lo que limita la representatividad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sree02200/team9-college-data-slm
- Belfast Metropolitan College (Wikipedia): https://en.wikipedia.org/wiki/Belfast_Metropolitan_College
- Belfast Met, cursos a tiempo completo: https://www.belfastmet.ac.uk/full-time
