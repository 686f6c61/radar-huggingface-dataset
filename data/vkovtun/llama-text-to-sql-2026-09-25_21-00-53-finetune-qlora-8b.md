# vkovtun/llama-text-to-sql-2026-09-25_21.00.53-finetune-QLORA-8B

## Resumen

llama-text-to-sql-2026-09-25_21.00.53-finetune-QLORA-8B es un ajuste fino de tipo LoRA cuantizado (QLoRA) del modelo meta-llama/Llama-3.1-8B-Instruct, orientado a la tarea de text-to-SQL, es decir, traducir preguntas en lenguaje natural a consultas SQL ejecutables. Lo publica el usuario vkovtun en HuggingFace y se ha entrenado con la librería TRL (SFT) sobre el stack de Transformers, PyTorch y Datasets. El repositorio ocupa 0,4 GB, lo que indica que contiene únicamente los pesos del adaptador LoRA y no los pesos completos del modelo base.

El modelo hereda la arquitectura y las capacidades del Llama 3.1 8B Instruct: un transformer decoder-only de 8.030 millones de parámetros con Grouped Query Attention, ventana de contexto de 128.000 tokens y un vocabulario de 128.256 tokens. Al tratarse de un ajuste fino ligero, no se modifica la arquitectura, sino que se especializa el comportamiento del modelo para generar sentencias SQL a partir de instrucciones y, presumiblemente, de un esquema de base de datos aportado en el prompt.

Su relevancia es limitada pero acotada: es un ejemplo típico de pipeline de especialización barata (QLoRA + SFT sobre un modelo abierto) que permite adaptar un modelo generalista a un dominio concreto con pocos recursos de GPU. No obstante, la ficha no documenta el conjunto de datos, la licencia ni métricas de evaluación, y el modelo no tiene descargas ni interacciones en el momento de redactar esta ficha, por lo que debe considerarse un artefacto experimental sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (heredada del modelo base); se añaden capas LoRA, no se altera la topología del base |
| Parámetros totales | 8.030 millones en el modelo base; tamaño del adaptador LoRA no disponible (repo de 0,4 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantización | Entrenamiento con QLoRA (4-bit NF4 según la convención del nombre); no se publican pesos GGUF, AWQ ni GPTQ. El adaptador puede cargarse sobre el base en bf16, 8-bit o 4-bit |
| Idiomas soportados | No disponible en la ficha del autor. El modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible en la ficha (el campo aparece como marcador genérico "license"). El modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.1 8B Instruct: un transformer decoder-only con 32 capas, 32 cabezas de atención de consulta y 8 cabezas de clave/valor (GQA), dimensión de modelo de 4.096, normalización RMSNorm y embeddings rotatorios con theta de 500.000, lo que permite generalizar a contextos largos de hasta 128.000 tokens. Sobre esta base se ha aplicado un ajuste fino con LoRA, probablemente cuantizando el modelo congelado a 4 bits (NF4) durante el entrenamiento, de ahí la etiqueta QLORA del nombre del repositorio.

El entrenamiento se ha realizado con TRL 1.12.0 en modo SFT (supervised fine-tuning), sobre Transformers 5.16.1, PyTorch 2.14.0 y Datasets 5.0.1. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, el número de pasos, la tasa de aprendizaje ni si hubo fases posteriores de alineamiento (DPO, RLHF). Se enlaza una ejecución de Weights & Biases (wandb.ai/viktor-kovtun/llama-text-to-sql/runs/ruwsuiwn) como único registro del proceso. No se documenta ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal ni mecanismos híbridos SSM.

## Capacidades

- Generación de texto generalista, heredada del modelo base, aunque el ajuste la orienta hacia la producción de SQL.
- Traducción de lenguaje natural a consultas SQL (text-to-SQL): generación de sentencias SELECT, JOIN, agregaciones y filtros a partir de una pregunta y, previsiblemente, de un esquema aportado en el prompt.
- Razonamiento multi-paso básico en la construcción de consultas complejas, gracias a la ventana de 128.000 tokens que permite incluir DDL extensos.
- Soporte de conversación multi-turno mediante el formato de chat del modelo base (roles user/assistant).
- Capacidad multilingüe potencial, limitada a los ocho idiomas declarados por Llama 3.1; no confirmada específicamente para esta variante fine-tuned.
- Tool calling y function calling: el modelo base los soporta, pero no hay evidencia de que el ajuste fino los preserve.
- Modo thinking o razonamiento explícito: no disponible.
- Capacidades de visión o audio: no disponibles (el base es solo texto).

## Casos de uso

- Asistente de consultas para analistas de negocio: el usuario formula una pregunta en lenguaje natural ("¿cuántos clientes se dieron de alta en Madrid el último trimestre?") y el modelo genera la consulta SQL correspondiente sobre un esquema incluido en el prompt.
- Generación de consultas en herramientas de BI: integración como backend de un generador de SQL en un panel de analítica, con la consulta resultante revisada por el usuario antes de su ejecución.
- Prototipado rápido de interfaces conversacionales sobre bases de datos: dado que el modelo base maneja 128.000 tokens de contexto, se puede inyectar un esquema mediano completo y evitar sistemas de retrieval complejos.
- Automatización de informes ad hoc: traducir solicitudes recurrentes de equipos de operaciones a consultas parametrizadas dentro de un pipeline de generación de informes.
- Soporte a desarrolladores en la escritura de consultas complejas: uso como asistente que propone JOINs y subconsultas a partir de una descripción funcional, dentro del IDE o de un chat interno.
- Base para investigación en text-to-SQL con QLoRA: el repositorio documenta el stack (TRL 1.12.0, Transformers 5.16.1) y sirve como referencia reproducible para experimentos de ajuste fino de bajo coste.
- Filtrado y extracción de datos desde lenguaje natural en aplicaciones internas, siempre con una capa de validación de la consulta generada antes de ejecutarla contra producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, Spider, BIRD ni ninguna otra métrica, ni comparaciones con alternativas. La única referencia a resultados es el enlace a la ejecución de Weights & Biases, que no se ha traducido en cifras publicadas en el repositorio.

## Requisitos de hardware

- Adaptador LoRA: ocupa aproximadamente 0,4 GB en disco (repo de safetensors). No puede ejecutarse por sí solo: requiere cargar los pesos del modelo base.
- Inferencia con los pesos fusionados en bf16/fp16: en torno a 16 GB de VRAM solo para los pesos, más memoria para la caché KV (que crece con la longitud de contexto).
- Inferencia en 4-bit (NF4, bitsandbytes): aproximadamente 5-6 GB de VRAM para los pesos, con un consumo adicional variable según el contexto.
- Inferencia en 8-bit: aproximadamente 9-10 GB de VRAM.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 (24 GB) en bf16 con contextos moderados, y en tarjetas de 16 GB (por ejemplo RTX 4060 Ti 16 GB) si se usa cuantización de 4 bits.
- GPU de centro de datos: A100 40/80 GB, H100 o L40S para servir en bf16 con contextos largos y concurrencia alta.
- Despliegue: vLLM (soporta adaptadores LoRA en caliente), TGI, Transformers con PEFT, o llama.cpp/Ollama si se fusiona y convierte el modelo a GGUF (proceso no documentado por el autor). También es posible el despliegue en endpoints de HuggingFace, dado el tag endpoints_compatible.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificables sobre alternativas específicas de text-to-SQL publicadas por el mismo autor ni de comparaciones oficiales. Como referencia, se compara con el modelo base del que deriva, cuyos datos sí están documentados públicamente.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama-text-to-sql-2026-09-25 (este modelo) | 8,03B (base) + adaptador LoRA | 128.000 tokens (heredado) | Text-to-SQL (fine-tune QLoRA + SFT) | No disponible en la ficha; sujeta a la del base | Pública en HuggingFace, sin descargas ni likes |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Instrucciones generales, sin especialización SQL | Llama 3.1 Community License | Ampliamente adoptado y verificado |
| Alternativas específicas de text-to-SQL (por ejemplo modelos de la familia SQLCoder o CodeLlama ajustados) | No disponible | No disponible | Text-to-SQL | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas de exactitud de ejecución (execution accuracy), coincidencia de resultados ni validación humana. No se puede afirmar que el ajuste mejore al modelo base en text-to-SQL.
- Riesgo elevado de alucinación de esquema: el modelo puede inventar tablas, columnas o tipos que no existen en la base de datos si el prompt no incluye el DDL completo y bien delimitado.
- Riesgo de SQL sintácticamente válido pero semánticamente incorrecto: una consulta puede ejecutarse sin errores y devolver resultados erróneos, lo que hace imprescindible la validación humana o automática antes de llevarla a producción.
- Sesgo de dataset no documentado: al no publicarse la composición del conjunto de entrenamiento, se desconoce si el modelo está sobreajustado a un dialecto SQL concreto (PostgreSQL, MySQL, SQLite, BigQuery), a un dominio o a un esquema particular.
- Idiomas: la cobertura multilingüe no está confirmada para el fine-tune; el modelo puede degradarse fuera del inglés si el dataset era monolingüe.
- Licencia ambigua: el repositorio no declara una licencia propia y el campo aparece como "license" genérico. Cualquier uso comercial debe resolverse contra la Llama 3.1 Community License del modelo base, que impone condiciones adicionales (entre ellas, la cláusula de nombre "Built with Llama" y restricciones de escala de usuarios).
- Solo se publican los pesos del adaptador: es necesario descargar el modelo base por separado y disponer de acceso concedido a meta-llama/Llama-3.1-8B-Instruct, que es un repositorio con gating.
- Madurez y trazabilidad: el modelo tiene cero descargas y cero interacciones, y el nombre incluye una marca temporal de 2026, compatible con un pipeline automatizado de experimentos más que con un artefacto consolidado.
- Sin información sobre tool calling ni agentes: aunque el base los soporta, no hay garantía de que el ajuste los conserve.
- En producción, cualquier consulta generada debería ejecutarse con permisos de solo lectura, límites de coste y validación contra el esquema real, dado que el modelo puede generar sentencias destructivas si el prompt no restringe el tipo de operación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vkovtun/llama-text-to-sql-2026-09-25_21.00.53-finetune-QLORA-8B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Librería de entrenamiento (TRL): https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/viktor-kovtun/llama-text-to-sql/runs/ruwsuiwn
