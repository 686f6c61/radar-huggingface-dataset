# thisavros/qwen25coder-1_5b-text2sql-lora-r32-merged

## Resumen

Este modelo es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct, especializado en la tarea text2SQL: convertir preguntas en lenguaje natural en consultas SQL válidas. Lo desarrolla el usuario thisavros y lo ha publicado bajo licencia Apache 2.0. El modelo base es una versión cuantizada a 4 bits del Qwen2.5-Coder-1.5B-Instruct, que ya estaba especializado en generación de código.

El ajuste se realizó con QLoRA (rango 32) utilizando la librería Unsloth y la biblioteca TRL de Hugging Face, lo que permite un entrenamiento más rápido y eficiente en memoria. El resultado es un modelo compacto de 1.54B parámetros con una ventana de contexto de 32.000 tokens, pensado para desplegarse en entornos con recursos limitados. Es relevante porque ofrece una alternativa ligera y de código abierto para automatizar consultas SQL en aplicaciones empresariales sin necesidad de GPUs de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.54B |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | no disponible (pesos originales del fine-tune) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-1.5B-Instruct, una arquitectura Transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE. El ajuste fino se realizó con QLoRA (rank 32) sobre la versión cuantizada a 4 bits del modelo base, lo que reduce sustancialmente el coste de entrenamiento y la memoria necesaria. La librería Unsloth permitió acelerar el proceso de entrenamiento en comparación con un fine-tuning estándar.

El dataset de entrenamiento no está documentado en la model card. Dado que el modelo se especializa en text2SQL, es probable que se haya entrenado con un dataset de pares pregunta-SQL (posiblemente BIRD o similar, como en proyectos análogos de la comunidad). No se especifica si se usó RLHF, DPO o técnicas de alineación adicionales.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural (text2SQL).
- Generación de código SQL sintácticamente correcto para bases de datos relacionales (SQLite, PostgreSQL, etc.).
- Comprensión del esquema de bases de datos y generación de consultas con JOIN, WHERE, GROUP BY, etc.
- Capacidades heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct: generación de código en otros lenguajes (Python, JavaScript, etc.) y razonamiento básico.
- Soporte de conversación multi-turno limitado (formato de chat del modelo base).
- No soporta tool calling ni función calling de forma nativa.
- No soporta visión ni audio.

## Casos de uso

- **Asistente de consultas para analistas de negocio**: el modelo puede traducir preguntas en inglés ("cuántas ventas hubo el mes pasado") a consultas SQL, permitiendo a usuarios no técnicos acceder a datos sin escribir código SQL.
- **Chatbot de soporte para bases de datos**: integrado en un sistema de chat, el modelo puede responder preguntas sobre los datos de la empresa generando y ejecutando consultas SQL de forma transparente.
- **Generación de informes automatizados**: se puede usar para generar consultas SQL dinámicas en pipelines de ETL o herramientas de BI, reduciendo el tiempo de desarrollo.
- **Herramienta de aprendizaje para estudiantes de SQL**: puede explicar cómo convertir una pregunta en lenguaje natural a SQL, útil en entornos educativos.
- **Integración en aplicaciones de bajo coste**: al ser un modelo de 1.5B, puede desplegarse en CPUs o GPUs de gama baja, lo que lo hace viable para aplicaciones de producción con presupuesto reducido.
- **Automatización de tests de bases de datos**: generar consultas SQL para pruebas de integración o validación de esquemas de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de exactitud de ejecución (execution accuracy) ni comparaciones con otros modelos text2SQL. El modelo base Qwen2.5-Coder-1.5B-Instruct obtiene resultados moderados en benchmarks de código (HumanEval, MBPP), pero estos no son extrapolables al rendimiento text2SQL de este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~3 GB (para 1.54B parámetros).
- VRAM estimada para inferencia en INT8: ~1.6 GB.
- VRAM estimada para inferencia en INT4: ~0.8 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, o cualquier GPU con al menos 4 GB de VRAM para ejecución en FP16.
- Puede ejecutarse en CPUs con cuantización (llama.cpp) con latencias de varios segundos por token.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama (si se convierte a GGUF).
- Latencia estimada en GPU consumer (RTX 4090): ~20-50 tokens/s en FP16.
- No requiere GPU de centro de datos (A100/H100) para inferencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| thisavros/qwen25coder-1_5b-text2sql | 1.54B | 32K | text2SQL | Apache 2.0 |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.54B | 32K | Código general | Apache 2.0 |
| CodeLlama-7B | 7B | 16K | Código general | Llama 2 License |
| SQLCoder-7B (Defog) | 7B | 4K | text2SQL | CC-BY-SA-4.0 |

No hay datos de rendimiento comparativo disponibles para este modelo. La principal ventaja es su tamaño reducido y licencia permisiva frente a alternativas como SQLCoder-7B que tiene una licencia más restrictiva.

## Limitaciones y advertencias

- **Alucinación SQL**: como cualquier modelo generativo, puede producir consultas SQL sintácticamente válidas pero semánticamente incorrectas o que no coinciden con el esquema real de la base de datos.
- **Idioma**: el modelo está entrenado principalmente en inglés. Las preguntas en otros idiomas pueden generar resultados degradados.
- **Contexto de 32K**: aunque la ventana es amplia, la calidad de las consultas puede degradarse con esquemas muy grandes o descripciones largas.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base (Qwen2.5-Coder) también es Apache 2.0, por lo que no hay restricciones adicionales.
- **Sin herramientas de verificación**: no incluye validación automática de las consultas generadas contra la base de datos. Se recomienda implementar una capa de validación en producción.
- **Modelo pequeño**: la capacidad de razonamiento complejo y manejo de esquemas muy extensos es limitada en comparación con modelos de 7B o más.

## Enlaces

- [Hugging Face - thisavros/qwen25coder-1_5b-text2sql-lora-r32-merged](https://huggingface.co/thisavros/qwen25coder-1_5b-text2sql-lora-r32-merged)
- [Hugging Face - Qwen/Qwen2.5-Coder-1.5B](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B)
- [Hugging Face - Qwen/Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- [GitHub - text2sql-qlora (ejemplo similar)](https://github.com/Akshu24Tech/text2sql-qlora)
- [GitHub - text2sql-finetuning (ejemplo similar)](https://github.com/Shiverion/text2sql-finetuning)
- [Unsloth](https://github.com/unslothai/unsloth)
