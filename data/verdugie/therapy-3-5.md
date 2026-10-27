# Verdugie/Therapy-3.5

## Resumen

Therapy-3.5 es un ajuste fino (finetune) de tipo conversacional orientado a counselling y psicoterapia, desarrollado por el usuario Verdugie a partir del modelo base Qwen/Qwen3.5-9B. Con 8.953.803.264 parámetros (≈8,95B, etiquetado como "9b"), está publicado principalmente en formato GGUF para ejecución local mediante llama.cpp y LM Studio, con licencia Apache 2.0 y orientación explícita a inferencia offline y privada ("local", "offline", "on-device", "privacy").

El modelo no se presenta como un asistente general, sino como un interlocutor clínico: según su model card, ejecuta una "lectura clínica estructurada" antes de cada respuesta y mantiene un "timeline ledger" con los hechos de la conversación, de modo que las respuestas se apoyan en el histórico y no solo en el último turno. El entrenamiento se realizó sobre 4.897 conversaciones de counselling que cubren ansiedad, depresión, conflictos relacionales, pensamientos suicidas y autolesión, consumo de sustancias, infidelidad y sexualidad e identidad de género.

Su relevancia actual es doble: por un lado, ejemplifica la tendencia de finetunes de dominio sensible distribuidos en GGUF para despliegue privado; por otro, plantea de forma directa las preguntas sobre validación clínica y seguridad que cualquier modelo de salud mental debe responder antes de usarse en producción. El dato de adopción es todavía bajo (877 descargas y 1 like en el momento de la ficha).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen/Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card etiqueta el modelo como "long-context" sin especificar tokens) |
| Tipos de cuantizacion | no disponible con detalle; la libreria es GGUF y el repo ocupa 46,9 GB, lo que sugiere varias cuantizaciones publicadas |
| Idiomas soportados | en (ingles unicamente, segun el campo `language`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con `library_name: gguf`); no se indica publicacion de safetensors del finetune |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Descargas / likes | 877 / 1 |
| Creado / actualizado | 2026-07-11 / 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-9B, un transformer de unos 8,95B parámetros; la model card no documenta cambios estructurales (no se mencionan MoE, SSM ni atención híbrida), por lo que se trata de un ajuste fino sobre la arquitectura original. La innovación declarada no es arquitectónica sino de proceso: el modelo ejecuta una "lectura clínica estructurada" antes de redactar cada respuesta y mantiene un registro acumulativo de hechos de la conversación ("timeline ledger"), lo que en la práctica equivale a un mecanismo de memoria explícita a nivel de prompt.

El corpus de entrenamiento son 4.897 conversaciones de counselling. Los datos fueron generados sintéticamente por modelos de la familia Opus 4.8, Sonnet 5 y Fable 5, con Fable 5 auditando y editando el corpus fusionado después de la escritura. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de datos generales para evitar olvido catastrófico, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan hiperparámetros, duración del entrenamiento ni evaluación de regresiones frente al modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con estilo clínico y tono empático, orientado a sesiones de terapia simulada.
- Estructura de razonamiento previa a la respuesta ("lectura clínica estructurada") y mantenimiento de un registro de hechos de la conversación.
- Manejo de temas de alta carga emocional declarados explícitamente: ansiedad, depresión, duelo, conflictos de pareja y familiares, pensamientos suicidas y autolesión, consumo de sustancias, infidelidad, sexualidad e identidad de género.
- Capacidad de reformular, corregir el rumbo y retirar interpretaciones propias cuando el interlocutor las rechaza (documentado en el transcript relacional, turno 28 de 40).
- Uso local y offline: al distribuirse en GGUF, puede ejecutarse sin conexión en hardware de consumo.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con LM Studio / llama.cpp.
- No se documentan capacidades de visión, audio, tool calling, function calling ni agentes multi-paso.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Simulación clínica para formación: estudiantes de psicología pueden practicar sesiones completas con un interlocutor que mantiene coherencia sobre los hechos narrados a lo largo de 30-40 turnos, y revisar después los transcripts de referencia publicados en el repo.
- Investigación en diálogo terapéutico: sirve como sistema de referencia para estudiar técnicas de conversación (reflejo, confrontación, tolerancia a la incertidumbre) en un entorno reproducible y ejecutable en local.
- Prototipado de productos de bienestar emocional: permite construir un MVP de acompañamiento conversacional sin coste de API y con datos que no salen del dispositivo, algo relevante para entornos con requisitos de privacidad.
- Herramienta de autoexploración con salvaguardas: con una capa de seguridad propia (detección de crisis, derivación a recursos humanos) podría usarse como diario guiado o espacio de reflexión; el modelo base de 9B cabe en GPU de consumo, lo que facilita el despliegue doméstico.
- Evaluación de riesgos y red-teaming: útil para equipos que quieran probar clasificadores de crisis, políticas de escalado o filtros de contenido contra un modelo que produce deliberadamente respuestas de alta intensidad emocional.
- Supervisión y documentación clínica asistida (con revisión humana): sus trazas de razonamiento y su ledger de hechos sugieren un uso potencial como borrador de notas de sesión, siempre que un profesional valide el contenido.
- Generación de material de entrenamiento: los transcripts auditados pueden reutilizarse como ejemplos few-shot para ajustar otros modelos o para construir datasets de evaluación de empatía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones clínicas estandarizadas; la única evidencia es cualitativa y consiste en tres respuestas literales extraídas de transcripts (ansiedad, relacional, depresión) con su turno de referencia. No hay datos de throughput ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 8,95B parámetros, no dato del autor): ≈18 GB en FP16, ≈10 GB en Q8_0, ≈5,5-6 GB en Q4_K_M, ≈4,5 GB en Q3_K_M. Añadir 1-2 GB para el contexto KV según longitud.
- GPU recomendadas: A100 40 GB o H100 para FP16 con contextos largos; L40S, RTX 6000 Ada o RTX 4090 (24 GB) para FP16 justo o Q8; RTX 3090/4080 (16-24 GB) y RTX 4060 Ti 16 GB para Q4/Q5.
- Cabe en GPU de consumo: sí, en Q4_K_M desde 8 GB de VRAM; en Q5/Q6 desde 12-16 GB.
- Opciones de despliegue: llama.cpp y LM Studio de forma nativa (GGUF); Ollama tras importar el GGUF con un Modelfile; llama-cpp-python para integración en Python. vLLM y TGI requerirían pesos en safetensors, que no se anuncian en el repo.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un 9B en Q4_K_M sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero no hay medición publicada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Therapy-3.5 (Verdugie) | 8,95B | no disponible (etiqueta "long-context") | Counselling terapéutico, inglés | Apache 2.0 | GGUF en HF, 877 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ≈9B | no disponible en la información | Propósito general | no disponible en la información | Repo del autor del base |
| Otros finetunes terapéuticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible. La comparación más informativa es frente a su propio modelo base: Therapy-3.5 aporta el corpus de 4.897 conversaciones y el protocolo de lectura clínica, a costa de restringir el idioma a inglés y de un riesgo alto de sobreajuste al estilo de los datos sintéticos.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye a un profesional: no hay validación clínica, ni ensayo, ni métricas de seguridad publicadas. No debe usarse como única vía de atención en salud mental.
- Riesgo grave en situaciones de crisis: el modelo está entrenado explícitamente sobre pensamientos suicidas y autolesión, pero no se documenta ningún protocolo de derivación a servicios de emergencia ni clasificador de riesgo. Cualquier despliegue real necesita una capa externa de seguridad.
- Datos de entrenamiento completamente sintéticos, generados por otros modelos (Opus 4.8, Sonnet 5, Fable 5). Esto limita la diversidad sociocultural real y puede producir respuestas de estilo uniforme o "demasiado perfectas", además de heredar sesgos de los generadores.
- Idiomas: solo inglés. No hay soporte documentado de castellano, lo que invalida su uso directo en España sin un ajuste adicional.
- Sesgos conocidos: no se publica ninguna evaluación de sesgos por género, orientación sexual, origen étnico, clase social o religión, pese a tratar temas de identidad y sexualidad.
- Riesgo de alucinación y de sobreinterpretación: el modelo genera interpretaciones clínicas (por ejemplo, etiquetar una emoción como duelo o como ira) que pueden ser incorrectas; la propia model card muestra un caso en que el modelo se retracta tras la corrección del usuario.
- Riesgo de dependencia y de refuerzo: un interlocutor que siempre responde con alta disponibilidad emocional puede fomentar uso compulsivo; no se documentan límites de uso.
- Trazabilidad limitada: la evidencia publicada son tres transcripts seleccionados por el autor, no una batería completa ni un conjunto de evaluación abierto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero eso no exime de cumplir la normativa aplicable a productos sanitarios (por ejemplo, el reglamento europeo MDR) si se presenta como herramienta terapéutica.
- Repo de 46,9 GB: conviene descargar solo el archivo de cuantización necesario, no el repositorio completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Verdugie/Therapy-3.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Transcripts citados en la model card (rutas relativas dentro del repositorio): `transcripts/anxiety.pdf` (turno 17/35), `transcripts/relational.pdf` (turno 28/40), `transcripts/depression.pdf` (turno 28/36). Pueden localizarse en el árbol de archivos del repo: https://huggingface.co/Verdugie/Therapy-3.5/tree/main
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo (los resultados obtenidos eran de contenido para adultos sin relación con el modelo y se han descartado).
