# spcv/qwen2.5_coder_text2sql_onnx

## Resumen

El modelo `spcv/qwen2.5_coder_text2sql_onnx` es un pequeño modelo de lenguaje (SLM) especializado en la generación de consultas SQL a partir de lenguaje natural, diseñado para ejecutarse en entornos con recursos limitados (CPU, GPU de bajo perfil). Está desarrollado por el usuario `spcv` y se basa en el modelo `Qwen/Qwen2.5-Coder-1.5B-Instruct`, una variante de 1.500 millones de parámetros de la familia Qwen2.5-Coder, que a su vez se construye sobre la arquitectura Qwen2.5 y fue preentrenado con más de 5,5 billones de tokens, con especial énfasis en capacidades de programación.

El modelo ha sido afinado mediante QLoRA sobre el dataset `trl-lab/SQaLe-text-to-SQL`, y posteriormente exportado a formato ONNX Runtime GenAI con cuantización INT4, lo que reduce su tamaño a aproximadamente 980 MB y permite una inferencia de baja latencia en CPU y GPU, incluso en dispositivos con pocos recursos. Su propósito principal es la traducción de preguntas en lenguaje natural a consultas SQL válidas, con soporte para esquemas de bases de datos relacionales, uniones entre tablas, agregaciones, subconsultas y CTEs.

La relevancia actual de este modelo reside en su enfoque en eficiencia y portabilidad: al ser un SLM cuantizado, puede desplegarse en entornos de producción sin depender de infraestructura de servidores dedicados, lo que lo convierte en una opción viable para asistentes locales, herramientas de análisis de datos y pipelines de automatización que requieren generación de SQL en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se infiere 32.768 tokens del modelo base, pero no se especifica en la ficha) |
| Tipos de cuantizacion | INT4 (ONNX Runtime GenAI) |
| Idiomas soportados | Inglés (declarado en el modelo card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx y model.onnx.data) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-Coder-1.5B-Instruct, un transformer causal con mecanismo de atención estándar y capas de normalización, diseñado específicamente para tareas de programación. El proceso de afinamiento se realizó mediante QLoRA (Quantized Low-Rank Adaptation) con rango `r=64` y alpha `128`, aplicado sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down` del modelo base. El entrenamiento se llevó a cabo con el framework `trl` (SFTTrainer) y `peft`, con una tasa de aprendizaje de `5e-5`, programación coseno y un 5% de calentamiento. La precisión de entrenamiento fue `bfloat16` y la carga del modelo base se hizo en NF4.

El dataset de entrenamiento `trl-lab/SQaLe-text-to-SQL` contiene pares de esquemas de base de datos y preguntas en lenguaje natural con sus correspondientes consultas SQL, cubriendo escenarios de una y múltiples tablas. Tras el afinamiento, el modelo se exportó a formato ONNX Runtime GenAI usando la herramienta `onnxruntime-genai.models.builder` con cuantización INT4 y soporte para CPU/CUDA. No se han publicado detalles sobre la composición exacta del dataset ni sobre el número total de ejemplos.

## Capacidades

- Generación de consultas SQL a partir de esquemas de base de datos y preguntas en lenguaje natural.
- Manejo de JOINs entre múltiples tablas, incluyendo claves foráneas y referencias.
- Soporte de agregaciones: `SUM`, `COUNT`, `AVG`, así como `GROUP BY` y `HAVING`.
- Generación de subconsultas y CTEs (Common Table Expressions) para filtrados anidados.
- Compatibilidad con sintaxis ANSI SQL y dialectos de SQLite, PostgreSQL y MySQL.
- Capacidad de seguir instrucciones estructuradas mediante el formato ChatML (`<|im_start|>`, `<|im_end|>`) para control de contexto.
- Generación de texto de baja latencia gracias a la cuantización INT4 y ejecución optimizada en ONNX Runtime GenAI.
- Adecuado para ejecución en CPU y dispositivos con poca memoria (SLM).

## Casos de uso

- Asistentes de consulta para bases de datos internas: los usuarios pueden escribir preguntas en lenguaje natural y obtener consultas SQL válidas sin conocer la estructura de la base de datos, gracias a la incorporación del esquema en el prompt.
- Automatización de pipelines de análisis de datos: el modelo puede integrarse en flujos de trabajo que necesitan generar consultas SQL dinámicas para extraer métricas o informes, reduciendo el tiempo de desarrollo manual.
- Agentes autónomos de extracción de información: en arquitecturas multi-agente, el modelo puede actuar como un componente que traduce solicitudes del usuario a SQL para ejecutarlas en motores de bases de datos, permitiendo respuestas automatizadas.
- Herramientas de generación de informes empresariales: permite a analistas de negocio describir en lenguaje natural los datos que necesitan, y el modelo genera el SQL correspondiente para su ejecución.
- Educación y formación en SQL: sirve como generador de ejemplos de consultas a partir de esquemas dados, útil para estudiantes o desarrolladores que quieren aprender la sintaxis.
- Asistentes de desarrollo de software: integrado en IDEs o extensiones de editor, puede sugerir consultas SQL para completar código o resolver preguntas sobre modelos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (por ejemplo, MMLU, HumanEval, GSM8K) para este modelo en la información proporcionada. La model card describe capacidades cualitativas (manejo de JOINs, agregaciones, etc.) pero no incluye métricas cuantitativas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño del modelo en disco: aproximadamente 980 MB (INT4).
- **VRAM estimada**: no disponible en la documentación. Dado el tamaño de 1.5B parámetros y cuantización INT4, se puede estimar que el modelo puede caber en GPUs con 2 GB de VRAM, pero no se confirma oficialmente.
- **GPU recomendadas**: no se especifican en la ficha. El modelo es compatible con CUDA y DirectML, por lo que se puede ejecutar en GPUs NVIDIA y dispositivos con soporte DirectML (incluidas algunas integradas).
- **CPU**: el modelo está diseñado para ejecución en CPU, gracias a la optimización ONNX Runtime GenAI. Es adecuado para entornos de bajo consumo.
- **Opciones de despliegue**: se puede ejecutar con `onnxruntime-genai` (Python), y es compatible con `huggingface_hub` para descarga. No se menciona soporte para vLLM, llama.cpp o Ollama directamente, pero al ser ONNX se puede integrar en cualquier entorno que soporte ONNX Runtime.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para este modelo. Sin embargo, existen otras alternativas de text-to-SQL basadas en Qwen2.5-Coder, aunque sin información detallada de rendimiento en la documentación consultada:

- **`alialialialaiali/qwen2.5-coder-spider-sql`**: modelo basado en Qwen2.5-Coder afinado sobre el dataset Spider, orientado a tareas de parsing semántico de dominio cruzado. No se dispone de datos de parámetros, contexto o rendimiento.
- **`alpecevit/Qwen2.5-Coder-7B-Instruct-text2sql`**: variante de 7B parámetros afinada para text-to-SQL, pero no se aportan métricas específicas.

Ambos modelos son alternativas, pero no hay una comparación cuantitativa posible con los datos disponibles.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado únicamente para inglés (`language: en`). No se garantiza un rendimiento adecuado en otros idiomas.
- **Alucinación**: como cualquier modelo de lenguaje, puede generar consultas SQL que no correspondan exactamente al esquema proporcionado, especialmente si el esquema es complejo o la pregunta es ambigua.
- **Contexto limitado**: aunque el modelo base soporta una ventana de 32.768 tokens, la exportación ONNX y el uso de `max_length=512` en el ejemplo de inferencia sugieren que la longitud de generación se limita a 512 tokens, lo que podría ser insuficiente para esquemas muy grandes o preguntas complejas.
- **Dependencia del formato de prompt**: el modelo está afinado para un formato específico (ChatML con instrucciones de sistema), por lo que un uso fuera de este formato puede degradar la calidad de las respuestas.
- **Sin garantía de exactitud sintáctica**: aunque el modelo fue entrenado para generar SQL válido, no se ha evaluado formalmente su precisión en todos los dialectos SQL; se recomienda validar las consultas generadas antes de ejecutarlas en producción.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base y el dataset están sujetos a sus propias licencias (Apache 2.0 para Qwen2.5-Coder, y el dataset `trl-lab/SQaLe-text-to-SQL` tiene licencia desconocida; se debe verificar).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/spcv/qwen2.5_coder_text2sql_onnx)
- [Modelo base: Qwen/Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- [Dataset de entrenamiento: trl-lab/SQaLe-text-to-SQL](https://huggingface.co/datasets/trl-lab/SQaLe-text-to-SQL)
- [Informe técnico de Qwen2.5-Coder (arXiv)](https://arxiv.org/abs/2409.12186)
- [GitHub Text2SQL-Qwen (referencia de aplicación)](https://github.com/Vish2503/Text2SQL-Qwen)
- [Modelo alternativo: alialialiali/qwen2.5-coder-spider-sql](https://huggingface.co/alialialialaiali/qwen2.5-coder-spider-sql)
- [Modelo alternativo: alpecevit/Qwen2.5-Coder-7B-Instruct-text2sql](https://huggingface.co/alpecevit/Qwen2.5-Coder-7B-Instruct-text2sql)
