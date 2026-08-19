# thisavros/qwen25-1_5b-text2sql-lora-merged

## Resumen

Este modelo es un ajuste fino (fine-tuning) de Qwen2.5-1.5B-Instruct, especializado en la generación de consultas SQL a partir de texto natural (text2SQL). Ha sido desarrollado por thisavros a partir del checkpoint `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit` y posteriormente fusionado (merged) para obtener los pesos finales en formato safetensors. Con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), se trata de un modelo compacto pensado para entornos con recursos limitados, como Google Colab o GPUs de gama media.

La relevancia de este modelo radica en su capacidad para traducir preguntas en inglés a consultas SQL ejecutables, lo que permite a usuarios no técnicos interactuar con bases de datos relacionales mediante lenguaje natural. Al estar basado en la familia Qwen2.5, hereda una arquitectura transformer moderna con atención de ventana deslizante y soporte para contexto largo (32k en el modelo base), aunque no se ha confirmado si esta longitud se mantiene en el ajuste fino. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica un proceso optimizado para velocidad y eficiencia de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta 32k tokens) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, sin indicación de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención de ventana deslizante y mecanismos de atención por capas. El checkpoint original (`unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`) es una versión cuantizada a 4 bits del modelo instruct de Qwen2.5-1.5B, optimizada para entrenamiento eficiente con Unsloth. El ajuste fino se realizó mediante LoRA (Low-Rank Adaptation), como sugiere el nombre "lora-merged", y posteriormente se fusionaron los adaptadores con los pesos base para obtener el modelo final.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados, ni las técnicas de alineación (RLHF, DPO, etc.). La model card solo indica que se usó Unsloth y la librería TRL de Hugging Face, lo que sugiere un pipeline de entrenamiento supervisado (SFT) típico para tareas de generación de SQL. Tampoco se especifican innovaciones técnicas adicionales más allá de la optimización de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de consultas SQL a partir de preguntas en inglés (text2SQL).
- Conversación multi-turno básica, gracias a la naturaleza instruct del modelo base.
- Comprensión de esquemas de bases de datos y generación de consultas con JOIN, WHERE, GROUP BY, etc., dentro de las limitaciones de un modelo de 1.5B.
- Soporte de formato de chat (conversational) según las etiquetas del repositorio.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso más allá de la generación de SQL.

## Casos de uso

- Asistente de consultas para bases de datos: un usuario no técnico puede formular preguntas en inglés ("¿Cuáles son los clientes con más pedidos?") y el modelo genera la consulta SQL correspondiente, que luego se ejecuta en el motor de base de datos.
- Integración en aplicaciones de análisis de datos: se puede incorporar en herramientas de BI o dashboards para permitir consultas en lenguaje natural sobre datos almacenados en SQL.
- Generación de consultas para pruebas automatizadas: en pipelines de CI/CD, el modelo puede generar consultas SQL de prueba a partir de especificaciones en lenguaje natural, reduciendo el trabajo manual de los desarrolladores.
- Educación y formación: como herramienta didáctica para aprender SQL, mostrando cómo traducir preguntas en lenguaje natural a consultas estructuradas.
- Prototipado rápido de interfaces conversacionales: para demostraciones o MVPs de chatbots que interactúan con bases de datos, sin necesidad de un modelo de gran tamaño.
- Automatización de informes: generar consultas SQL para extraer métricas específicas a partir de descripciones textuales, facilitando la generación de informes periódicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de text2SQL (como precisión de ejecución o validez sintáctica). Tampoco se comparan con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1.5B parámetros, en precisión fp16/bf16 requiere aproximadamente 3-4 GB de VRAM. Con cuantización a 4 bits (si se aplicara) podría reducirse a ~1-2 GB, pero no se ha confirmado el formato de cuantización del repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, T4, o superiores (RTX 3090, A10, etc.). También puede ejecutarse en CPU con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja, como las de portátiles gaming o tarjetas de escritorio con 4-6 GB.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), o mediante la API de Hugging Face Inference Endpoints. También es compatible con Ollama si se convierte a formato GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU T4, se espera una latencia de unos pocos cientos de milisegundos por generación de consulta corta, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| thisavros/qwen25-1_5b-text2sql-lora-merged | 1.54B | no disponible (base 32k) | text2SQL | Apache 2.0 |
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 32k | Chat general, código, matemáticas | Apache 2.0 |
| sqlcoder-7b-2 (defog) | 7B | 4k | text2SQL | CC BY-SA 4.0 |
| CodeLlama-7B-Instruct | 7B | 16k | Código y SQL | Llama 2 license |

El modelo se posiciona como una alternativa ligera a modelos text2SQL más grandes como SQLCoder-7B, con la ventaja de requerir menos recursos. Sin embargo, al ser un ajuste fino de un modelo pequeño, es probable que su rendimiento en consultas complejas sea inferior al de modelos de mayor tamaño. No se dispone de comparativas directas de rendimiento.

## Limitaciones y advertencias

- Tamaño reducido: con solo 1.5B parámetros, el modelo puede tener dificultades con consultas SQL muy complejas, subconsultas anidadas o esquemas de bases de datos extensos.
- Idioma: solo entrenado en inglés, por lo que no es adecuado para consultas en otros idiomas.
- Sin información sobre sesgos: no se ha documentado ningún análisis de sesgos o alucinaciones específicas para este modelo.
- Riesgo de alucinación: como cualquier LLM, puede generar consultas SQL sintácticamente válidas pero semánticamente incorrectas, especialmente si el esquema de la base de datos no está bien descrito en el prompt.
- Falta de documentación: la model card es mínima; no se especifican detalles del dataset de entrenamiento, hiperparámetros, ni evaluación, lo que dificulta la reproducibilidad y la confianza en su comportamiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thisavros/qwen25-1_5b-text2sql-lora-merged
- Modelo base (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen en GitHub: https://github.com/QwenLM/Qwen
- Documentación de Qwen: https://qwen.readthedocs.io/
- Proyecto de referencia para fine-tuning text2SQL con Qwen2.5: https://github.com/Shiverion/text2sql-finetuning
