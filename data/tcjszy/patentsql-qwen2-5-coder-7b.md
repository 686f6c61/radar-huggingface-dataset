# tcjszy/PatentSQL-Qwen2.5-Coder-7B

## Resumen

PatentSQL-Qwen2.5-Coder-7B es un modelo especializado en generación de consultas para datos de patentes chinas, desarrollado por el usuario tcjszy. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen2.5-Coder-7B-Instruct mediante Unsloth, QLoRA y enmascaramiento de pérdida solo en la respuesta (Response-Only Loss Masking). Su propósito es resolver un problema muy concreto: traducir preguntas de negocio en lenguaje natural a dos lenguajes de consulta distintos, MySQL 8.0 (Text-to-SQL) y Elasticsearch 8.x Query DSL (JSON), en el dominio de la propiedad industrial china.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5-Coder, con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones) y pesos en formato safetensors. Está entrenado con un corpus propio publicado por el autor (tcjszy/cn-patent-text2sql-es-dataset) que combina consultas sobre patentes con bases de datos comerciales genéricas en chino para preservar la capacidad de generalización entre esquemas.

Su relevancia actual radica en el enfoque de despliegue privado y bajo coste: al ser un modelo de 7B, puede ejecutarse en una sola GPU de consumo o incluso en un ordenador personal mediante la versión GGUF y Ollama. Además, incorpora una cadena de razonamiento explícita en etiquetas `<think>` y capacidad de autocorrección ante errores de MySQL, lo que lo hace adecuado para pipelines de agentes con reintentos automáticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA/QLoRA |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (se menciona Q4_K_M en la versión cuantizada); el repo principal está en safetensors |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo principal); GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con Unsloth y QLoRA, técnica que reduce el coste de entrenamiento mediante cuantización de bajo rango. Un detalle técnico destacable es el uso de Response-Only Loss Masking, que calcula la pérdida únicamente sobre la respuesta generada y no sobre el prompt, algo habitual en tareas de text-to-SQL donde el contexto (esquema de la base de datos) es largo y no debe influir en el objetivo de aprendizaje.

El corpus de entrenamiento combina el dataset propio de patentes chinas (tcjszy/cn-patent-text2sql-es-dataset) con bases de datos comerciales genéricas en chino, con el objetivo declarado de preservar la capacidad de generalización a esquemas no vistos. Según la model card, se inyectaron muestras específicas de reparación de errores de MySQL para habilitar la autocorrección en pipelines de agentes. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de consultas MySQL 8.0 en el dominio de patentes: JOINs multi-tabla, decodificación de jerga y enumeraciones, funciones de ventana y cálculo de tasas de concesión y validez.
- Generación de Query DSL para Elasticsearch 8.x: búsqueda de texto completo con `multi_match` y pesos, exclusiones con `bool`, agregaciones por facetas con `terms` y `date_histogram`.
- Razonamiento explícito en etiquetas `<think>`: primero descompone el criterio de negocio en chino y localiza los campos relevantes, después emite el bloque de código SQL o JSON ejecutable.
- Autocorrección de errores: capacidad entrenada para reparar sentencias MySQL fallidas, pensada para bucles de reintento en agentes.
- Generalización entre esquemas: el modelo declara funcionar sobre DDL de bases de datos nuevas no vistas durante el entrenamiento.
- Soporte conversacional multi-turno mediante plantilla de chat (formato de mensajes system/user/assistant).
- Capacidades multilingües limitadas a chino e inglés.
- No se documentan capacidades de visión, audio, tool calling nativo ni function calling en la información disponible.

## Casos de uso

- Asistente interno de consulta de patentes: un examinador o analista formula preguntas como «¿cuántas invenciones válidas hay en Guangdong?» y el modelo genera la SQL con los filtros de estado y jurisdicción, apoyándose en su conocimiento del dominio y en la cadena `<think>` para justificar el criterio de negocio.
- Búsqueda documental sobre Elasticsearch: para recuperar patentes por texto libre con relevancia ponderada, el modelo construye consultas DSL con `multi_match` y pesos por campo, y añade agregaciones para obtener recuentos por año o por titular.
- Agente de análisis con reintentos: integrado en un bucle `try-catch`, el modelo recibe el error de MySQL y genera una versión corregida de la consulta, lo que reduce la intervención manual en pipelines de datos.
- Cuadro de mando de propiedad industrial: generación automatizada de consultas de estadísticas (tasas de concesión, distribución temporal, agregaciones por clasificación) para alimentar informes periódicos.
- Migración entre motores de búsqueda: el modelo puede traducir la misma pregunta de negocio a SQL y a DSL, lo que facilita validar la equivalencia entre el motor relacional y el índice de búsqueda.
- Despliegue en entorno aislado: al ser un modelo de 7B con licencia Apache 2.0 y versión GGUF, puede ejecutarse en una estación de trabajo con Ollama sin enviar datos de patentes a servicios externos, requisito habitual en despachos y organismos públicos.
- Formación y prototipado: sirve como base para equipos que quieran adaptar un text-to-SQL a su propio esquema mediante un nuevo ajuste fino con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la tabla comparativa (Base vs SFT vs SFT + Agent Self-Correction) se añadirá tras completar la evaluación automatizada, pero no incluye cifras en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada en precisión bf16: en torno a 15-16 GB solo para los pesos, más memoria para el contexto y el KV cache; se recomienda una GPU con 24 GB o más.
- VRAM estimada con cuantización Q4_K_M (GGUF): aproximadamente 5-6 GB de pesos, viable en GPU de consumo de 8 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en bf16 con concurrencia; RTX 4090 (24 GB) para bf16 en una sola tarjeta; RTX 3090/4080 o superiores para cuantizaciones de 8 bits.
- GPU de consumo: sí cabe en tarjetas de 8-12 GB usando GGUF Q4_K_M o Q5_K_M; en 24 GB funciona en bf16.
- Opciones de despliegue: Ollama (comando documentado en la model card), llama.cpp para GGUF, Transformers con `device_map="auto"`, y previsiblemente vLLM o TGI para servir el repo safetensors, aunque estos últimos no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatentSQL-Qwen2.5-Coder-7B | 7,6 B | No disponible | Text-to-SQL MySQL + DSL Elasticsearch para patentes chinas | Apache 2.0 | Hugging Face (repo principal + GGUF) |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | No disponible en esta ficha | Generación de código general, sin especialización en SQL de patentes | Apache 2.0 | Hugging Face |
| Modelos text-to-SQL genéricos de 7B | Variable | Variable | SQL genérico, sin soporte declarado de DSL de Elasticsearch ni dominio de patentes | Variable | Variable |

La comparación directa con alternativas especializadas en text-to-SQL de patentes no está disponible en la información proporcionada. El principal diferencial frente al modelo base es la doble salida (SQL y DSL), el razonamiento `<think>` y la autocorrección entrenada.

## Limitaciones y advertencias

- El modelo está especializado en el dominio de patentes chinas y en los idiomas chino e inglés; su rendimiento fuera de ese ámbito no está documentado.
- No se han publicado métricas de evaluación, por lo que no es posible cuantificar su precisión frente al modelo base ni frente a alternativas.
- Riesgo de alucinación en la generación de SQL y DSL: puede inventar columnas, tablas o campos que no existan en el esquema real, especialmente si el DDL proporcionado es incompleto.
- La autocorrección depende de que el pipeline de agente implemente el bucle de reintento y de que el error de MySQL se devuelva al modelo; sin ese mecanismo, la capacidad no se activa.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar consultas sobre esquemas muy extensos.
- Sesgos conocidos: no se documentan en la model card; al entrenarse sobre datos de patentes chinas, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base Qwen2.5-Coder y del dataset de entrenamiento antes de redistribuir derivados.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-25) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tcjszy/PatentSQL-Qwen2.5-Coder-7B
- Versión GGUF: https://huggingface.co/tcjszy/PatentSQL-Qwen2.5-Coder-7B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/tcjszy/cn-patent-text2sql-es-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
