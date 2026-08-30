# Ttimms/Bible-Assistant-Qwen3.5-4B-v2

## Resumen

Bible-Assistant-Qwen3.5-4B-v2 es un modelo de generación de texto afinado por Ttimms (Tremayne Timms) sobre el modelo base Qwen/Qwen3.5-4B, diseñado específicamente para responder preguntas sobre la Biblia dentro de un pipeline de generación aumentada por recuperación (RAG). El modelo está pensado para ejecutarse localmente en una GPU de consumo de 16 GB y su objetivo principal es la recuperación de versículos con verificación a nivel de cita, así como el rechazo seguro de preguntas de tipo pastoral o de crisis.

El modelo se distribuye bajo licencia Apache-2.0, heredada del base, y está entrenado únicamente con supervisión (SFT) mediante LoRA, sin etapa de preferencia o refuerzo. Según el benchmark propio del autor (protocolo v3, 282 preguntas), alcanza un 76,5 % de recuperación exacta de versículos, un 98,9 % de tasa de citación y aproximadamente un 2 % de alucinación. La arquitectura del base es híbrida Gated-DeltaNet + atención, con 32 capas y unos 4,2 mil millones de parámetros.

La relevancia actual del modelo radica en su enfoque de nicho: un asistente bíblico de código abierto, ejecutable en hardware asequible, con un pipeline de datos trazable y descontaminado, y con una clara delimitación de casos de uso apropiados e inapropiados. No obstante, el propio autor reconoce una regresión en respuestas temáticas abiertas, que planea corregir en una futura versión v3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet + atención (base Qwen3.5-4B), 32 capas |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la documentación; el entrenamiento usa secuencias fijas de 1280 tokens) |
| Tipos de cuantizacion | GGUF disponible en repo asociado (tipos concretos no especificados); pesos base en bf16 |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (y GGUF en repo hermano) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, cuya arquitectura combina Gated-DeltaNet con capas de atención, lo que permite un equilibrio entre eficiencia de memoria y capacidad de razonamiento. Sobre esta base se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 32 y alpha 64, dropout 0,05, sobre las proyecciones q/k/v/o/gate/up/down, en bf16 sin cuantizar. El entrenamiento se realizó durante 1 época (3.474 pasos) con un batch efectivo de 16, tasa de aprendizaje 2e-4 con decaimiento coseno, y longitud de secuencia fija de 1280 tokens con enmascaramiento de pérdida solo en la parte de completación. El proceso duró aproximadamente 10,4 horas en una RTX 5070 Ti de 16 GB, con una pérdida de evaluación que descendió de 0,2515 a 0,2138 de forma monótona.

El conjunto de datos de entrenamiento consta de 56.022 ejemplos, generados por el motor de datos v2 del proyecto, con trazabilidad completa de procedencia (hash SHA por fuente y licencia) y descontaminación frente a todas las preguntas del conjunto de evaluación. Las categorías incluyen 35.604 ejemplos de citación de escrituras (recuperación de versículos, búsqueda inversa, cadenas de referencias cruzadas, colecciones temáticas, contexto de capítulo, entre otros), 7.000 ejemplos de exégesis fundamentada con comentarios de Matthew Henry (dominio público), 12.996 ejemplos de mezcla general de instrucción y razonamiento procedentes de HuggingFaceTB/smoltalk2, 352 ejemplos de triaje pastoral escritos a mano, y 70 ejemplos heredados de pools de rechazo y meta. No se utilizaron datos propietarios, personales ni con licencia comercial.

## Capacidades

- Generación de texto conversacional para preguntas y respuestas sobre la Biblia, orientada a funcionar con un recuperador RAG que proporciona el contexto relevante.
- Recuperación de versículos con alta precisión: 76,5 % de acierto exacto en búsqueda de versículos según el benchmark del autor.
- Citación de fuentes: tasa de citación del 98,9 % en el conjunto de evaluación, lo que indica que el modelo tiende a referenciar el pasaje bíblico correspondiente.
- Rechazo seguro: entrenado para declinar o redirigir preguntas de tipo pastoral, de crisis, o que requieran consejo médico, legal o financiero.
- Razonamiento con contexto: capaz de responder a partir de pasajes recuperados, incluyendo referencias cruzadas y contexto de capítulo.
- Soporte de tool calling: no documentado explícitamente; el modelo está pensado para integrarse en un pipeline RAG, no como agente autónomo.
- Capacidades multilingües: no, solo inglés.
- Modo de pensamiento (thinking): no documentado; el modelo base Qwen3.5 podría tenerlo, pero no se menciona en la documentación del afinado.

## Casos de uso

- Estudio bíblico personal: un usuario puede hacer preguntas como "¿Qué dice Proverbios 3:5?" y el modelo, con el contexto recuperado por el pipeline RAG, devuelve el versículo exacto con su cita. Es adecuado por su alta precisión en recuperación de versículos.
- Búsqueda de pasajes para preparación de sermones: un pastor o predicador puede buscar pasajes relacionados con un tema (p. ej., "versículos sobre la fe") y el modelo devuelve una lista de referencias con citas verificables, gracias a su entrenamiento en colecciones temáticas y referencias cruzadas.
- Exploración educativa en entornos de estudio bíblico: profesores o estudiantes pueden consultar el contexto de un capítulo o la interpretación de un versículo con comentarios de Matthew Henry, gracias al bucket de exégesis fundamentada.
- Devocionales diarios automatizados: una aplicación puede generar una respuesta devocional basada en un versículo del día, usando el modelo como generador de texto fundamentado en el pasaje recuperado.
- Asistente de referencia cruzada: el modelo puede conectar versículos relacionados mediante las cadenas de referencias cruzadas de TSK (openbible.info), útil para estudios comparativos.
- Filtro de seguridad en aplicaciones pastorales: dado su entrenamiento en triaje pastoral, puede redirigir a un usuario que plantee una crisis o necesidad de consejo hacia un pastor o línea de crisis, en lugar de dar una respuesta inapropiada.

## Benchmarks y rendimiento

El autor publica resultados de su propio benchmark protocolo v3 (282 preguntas, suite fijada por SHA), con decodificación greedy, semilla 42 y contexto RAG habilitado. Los resultados se resumen en la siguiente tabla:

| Categoría | N | Precisión de versículo (exacta) | Media difusa | Alucinación | Citación |
|---|---|---|---|---|---|
| verse_lookup | 102 | 76,5 % | 0,65 | 2,9 % | 100 % |
| cross_reference | 30 | 0 %* | 0,40 | 3,3 % | 100 % |
| context | 30 | 0 %* | 0,23 | 0 % | 93 % |
| character | 35 | 0 %* | 0,20 | 2,9 % | 97 % |
| topical | 58 | 0 %* | 0,20 | 1,7 % | 100 % |
| theological_reliability | 8 | 0 %* | 0,15 | 0 % | 100 % |
| **Global** | 266 | **29,3 %** | **0,40** | **2,3 %** | **98,9 %** |

\* La métrica de precisión de versículo puntúa la cita verbatim del versículo esperado. Las categorías character, topical, context y theological no tienen una respuesta canónica única, por lo que una buena respuesta sintetizada puntúa 0 en esta métrica; la columna de media difusa y un juez las evalúan de forma justa.

Comparado con el modelo anterior del mismo proyecto (misma fecha y protocolo), la precisión exacta en búsqueda de versículos pasó de 58 % a 76,5 % (+18,5 puntos), la tasa de citación de 88 % a 98,9 % (+11 puntos), y la alucinación se mantuvo plana en ~2 %. Sin embargo, la media difusa global descendió de 0,48 a 0,40, lo que el autor atribuye a que las plantillas rígidas de respuesta del conjunto de datos enseñaron al modelo el formato en lugar de la habilidad de síntesis temática.

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo está diseñado para una GPU de 16 GB; el entrenamiento se realizó en una RTX 5070 Ti de 16 GB. Con cuantización GGUF, podría caber en GPUs con menos VRAM, aunque no se especifican los tamaños de los quants.
- GPU recomendadas: RTX 5070 Ti (16 GB) como referencia de desarrollo; cualquier GPU consumer con 16 GB o más (RTX 4080, RTX 4090, etc.) debería ser suficiente. Para GPUs con menos VRAM, se recomienda usar los quants GGUF.
- Compatibilidad con GPU consumer: sí, es el objetivo declarado del proyecto.
- Opciones de despliegue: transformers, vLLM, y GGUF mediante llama.cpp actual (según el repo GGUF). El soporte de Ollama está pendiente de la actualización de su llama.cpp incluido.
- Latencia y throughput: no se proporcionan datos numéricos en la documentación disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bible-Assistant-Qwen3.5-4B-v2 (este) | ~4,2 B | No especificado | Q&A bíblico con RAG, SFT | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | No especificado | Modelo general de lenguaje | Apache-2.0 | Hugging Face |
| Bible AI Assistant v1 (anterior del mismo autor) | ~4,2 B | No especificado | Q&A bíblico con RAG, ajuste ligero | Apache-2.0 | Hugging Face |

La comparativa directa con otros modelos especializados en Biblia no está disponible en la información proporcionada. El modelo se distingue de su base por el ajuste específico en recuperación de versículos y rechazo seguro, pero comparte la misma arquitectura y licencia. Frente a su versión anterior, mejora notablemente en precisión de versículos y citación, aunque empeora en síntesis temática.

## Limitaciones y advertencias

- Regresión en respuestas temáticas: el modelo tiende a listar versículos en lugar de explicar el contexto o el significado de pasajes cuando se le pide una síntesis abierta (p. ej., "explica el contexto del Salmo 23"). El autor lo atribuye a las plantillas rígidas del conjunto de datos y planea corregirlo en v3.
- No apto para consejo médico, legal o financiero: el modelo está entrenado para redirigir estas consultas, pero no debe usarse en esos dominios.
- No apto para consejería pastoral o atención de crisis: aunque está entrenado para declinar o redirigir, no debe sustituir a un profesional.
- No ha sido sometido a red teaming adversarial: el autor advierte explícitamente que no se ha probado contra ataques adversarios.
- No debe usarse sin el pipeline RAG: el modelo está diseñado para responder a partir de contexto recuperado; usarlo sin recuperación puede producir respuestas sin fundamento.
- Riesgo de alucinación: aunque la tasa es baja (~2 % en el benchmark propio), existe y debe tenerse en cuenta en despliegues no supervisados.
- Idioma limitado: solo inglés, sin soporte multilingüe.
- Contexto de entrenamiento limitado: las secuencias de entrenamiento son de 1280 tokens, lo que puede limitar la capacidad de manejar contextos largos en inferencia, aunque el modelo base podría soportar más.
- Despliegue a escala no recomendado: el autor indica que no está pensado para despliegue no supervisado o a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v2
- Repo GGUF: https://huggingface.co/Ttimms/bible-ai-assistant-qwen3.5-4b-v2-GGUF
- Proyecto y pipeline RAG en GitHub: https://github.com/t-timms/bible-ai-assistant
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Perfil del autor en Hugging Face: https://huggingface.co/Ttimms
