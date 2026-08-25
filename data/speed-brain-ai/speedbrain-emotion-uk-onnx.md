# speed-brain-ai/speedbrain-emotion-uk-onnx

## Resumen

El modelo `speed-brain-ai/speedbrain-emotion-uk-onnx` es una conversión a formato ONNX con cuantización dinámica int8 del clasificador de emociones en ucraniano `ukr-detect/ukr-emotions-classifier`. Lo desarrolla el equipo de speed-brain-ai como parte de su motor de inyección "Persona Forge", cuyo objetivo es detectar la emoción del usuario en cada turno de chat y ajustar la "zona emocional" (resonancia) del personaje con el que se interactúa. El modelo está pensado para ejecutarse en CPU mediante onnxruntime, lo que lo hace ligero y desplegable en entornos sin GPU.

El modelo original, desarrollado por Dementieva, Babakov y Fraser, se entrenó sobre el dataset EmoBench-UA, el primer benchmark público de detección de emociones en ucraniano, presentado en EMNLP 2025. La arquitectura subyacente es XLM-RoBERTa, un transformer multilingüe de la familia RoBERTa, aunque el repositorio ONNX no especifica el número exacto de parámetros. La etiqueta de idioma es exclusivamente `uk` (ucraniano) y el conjunto de etiquetas de salida es `ukr7`, que se pliega en el espacio canónico de 7 emociones: ira, asco, miedo, alegría, neutral, tristeza y sorpresa.

La relevancia de este modelo radica en que cubre un hueco en el NLP para ucraniano, un idioma con escasos recursos en tareas de análisis de sentimiento y emociones. Al estar cuantizado y exportado a ONNX, permite inferencia eficiente en CPU, lo que facilita su integración en sistemas de producción, chatbots y aplicaciones de análisis de texto en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, basado en `ukr-detect/ukr-emotions-classifier`) |
| Parametros totales | no disponible (el repo ONNX no lo especifica; el modelo base XLM-RoBERTa-base tiene ~278M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, tipicamente 512 tokens para XLM-RoBERTa) |
| Tipos de cuantizacion | int8 dinamica (ficheros `model_quantized.onnx` y `model.onnx`) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | OpenRAIL++ (openrail++) |
| Formato de pesos | ONNX (safetensors no disponible; incluye `tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo base es un clasificador de emociones basado en XLM-RoBERTa, un transformer encoder multilingüe preentrenado con masked language modeling sobre 2.5 TB de datos filtrados de CommonCrawl en 100 idiomas. El ajuste fino se realizó sobre el dataset EmoBench-UA, creado mediante crowdsourcing en la plataforma Toloka.ai, con un esquema de anotación adaptado de los trabajos de Mohammad et al. (2018) y Mohammad (2022). El dataset incluye textos en ucraniano anotados con 7 emociones, y los autores evaluaron desde baselines lingüísticos hasta LLMs, concluyendo que los modelos específicos para ucraniano superan a los enfoques genéricos o traducidos del inglés.

La conversión a ONNX realizada por speed-brain-ai aplica cuantización dinámica int8, lo que reduce el tamaño del modelo (el repo ocupa 0.6 GB) y acelera la inferencia en CPU sin necesidad de GPU. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un clasificador de texto estándar.

## Capacidades

- Clasificación de emociones en texto ucraniano: detecta 7 emociones (ira, asco, miedo, alegría, neutral, tristeza, sorpresa).
- Inferencia en CPU mediante onnxruntime con `CPUExecutionProvider`, optimizada para despliegue ligero.
- Integración con el motor de inyección "Persona Forge" de speed-brain-ai para ajustar la respuesta de personajes en chats según la emoción del usuario.
- Soporte de carga mediante `tokenizer.json` incluido en el repositorio.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Chatbots con personalidad adaptativa: el modelo detecta la emoción del usuario en cada turno y ajusta el tono y la "resonancia" del personaje, mejorando la experiencia conversacional en ucraniano.
- Análisis de sentimiento en redes sociales: permite monitorizar la reacción emocional de usuarios ucranianos ante noticias, productos o eventos, procesando grandes volúmenes de texto en CPU.
- Atención al cliente automatizada: integrado en sistemas de tickets, clasifica la emoción del cliente (frustración, satisfacción, sorpresa) para priorizar respuestas o derivar a agentes humanos.
- Moderación de contenido: detecta emociones negativas como ira o miedo en comentarios, útil para plataformas que necesitan identificar contenido problemático en ucraniano.
- Investigación académica en NLP: sirve como baseline o componente para estudios sobre detección de emociones en idiomas de bajos recursos.
- Asistentes virtuales en ucraniano: el clasificador puede alimentar un sistema de diálogo para adaptar las respuestas del asistente al estado emocional del hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `ukr-detect/ukr-emotions-classifier` se evaluó en el paper de EmoBench-UA, pero el repositorio ONNX no incluye métricas específicas (F1, accuracy, etc.) para esta conversión. Se recomienda consultar el paper original para los resultados del modelo base.

## Requisitos de hardware

- VRAM estimada: 0 GB (inferencia en CPU; no requiere GPU).
- RAM: el modelo cuantizado int8 ocupa aproximadamente 0.6 GB en disco, por lo que 2-4 GB de RAM son suficientes para cargarlo y ejecutarlo.
- GPU recomendadas: no necesarias; cualquier CPU moderna con soporte AVX2 es suficiente.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider), integrable en Python, C++, C# o Java. También puede servirse mediante ONNX Runtime Server o convertirse a otros formatos si es necesario.
- Latencia y throughput: no disponibles; dependerá de la CPU y de la longitud del texto de entrada. Al ser un modelo transformer pequeño y cuantizado, se espera una latencia de milisegundos por muestra en CPUs modernas.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| speedbrain-emotion-uk-onnx | ucraniano | XLM-RoBERTa | no disponible (~278M base) | no disponible (512 tokens tipico) | OpenRAIL++ | ONNX int8 |
| ukr-detect/ukr-emotions-classifier | ucraniano | XLM-RoBERTa | no disponible | no disponible | no disponible | PyTorch |
| Modelos multilingües (p.ej. XLM-RoBERTa fine-tuned en emotion) | multilingüe | XLM-RoBERTa | 278M | 512 tokens | MIT / CC-BY | PyTorch / ONNX |

La principal diferencia frente a alternativas multilingües es que este modelo está específicamente ajustado para ucraniano, lo que debería ofrecer mejor precisión en ese idioma. La ventaja de la versión ONNX es su despliegue en CPU sin dependencias de PyTorch.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset EmoBench-UA se creó con crowdsourcing, por lo que puede reflejar sesgos de los anotadores y de la plataforma Toloka.ai. No se han documentado evaluaciones de sesgo específicas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo; el riesgo principal es la clasificación errónea de emociones en textos ambiguos o con sarcasmo.
- Limitaciones de contexto: la longitud de contexto no está documentada, pero XLM-RoBERTa típicamente soporta 512 tokens; textos más largos deberán truncarse.
- Limitaciones de idioma: solo soporta ucraniano; no funciona con otros idiomas.
- Restricciones de licencia: la licencia OpenRAIL++ impone restricciones de uso responsable, incluyendo la prohibición de usos ilegales o dañinos. Los términos de Attachment A de la licencia RAIL se aplican a todos los usuarios downstream.
- Caveat de producción: el modelo es una conversión cuantizada; puede haber una ligera pérdida de precisión respecto al modelo original en PyTorch. Se recomienda validar el rendimiento en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/speed-brain-ai/speedbrain-emotion-uk-onnx
- Modelo base: https://huggingface.co/ukr-detect/ukr-emotions-classifier
- Paper EmoBench-UA (EMNLP 2025 Findings): https://aclanthology.org/2025.findings-emnlp.107/ (DOI: 10.18653/v1/2025.findings-emnlp.107)
- SpeechBrain (toolkit de referencia, no relacionado directamente): https://github.com/speechbrain/speechbrain
- ONNX Model Zoo: https://github.com/onnx/models
