# vkovtun/text-to-sql-qlora-final-2026-11-27_23.34.27-Qwen2.5-7B-Instruct-finetune-QLORA

## Resumen

`vkovtun/text-to-sql-qlora-final-2026-11-27_23.34.27-Qwen2.5-7B-Instruct-finetune-QLORA` es un ajuste fino mediante QLoRA del modelo instructivo Qwen2.5-7B-Instruct, orientado a la tarea de conversión de lenguaje natural a SQL (text-to-SQL). Lo publica el usuario vkovtun en Hugging Face y se ha entrenado con la librería TRL aplicando SFT (supervised fine-tuning) sobre el modelo base. El repositorio contiene únicamente los adaptadores derivados del entrenamiento (0,3 GB), no los pesos completos del modelo base.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en el modelo original). La relevancia de esta ficha radica en que documenta un caso típico de adaptación QLoRA para una tarea vertical: el autor no ha publicado métricas, dataset de entrenamiento ni detalles de configuración más allá de las versiones de framework y un enlace a un run de Weights & Biases.

La información disponible es escasa: no hay licencia declarada, no se especifican idiomas, no hay resultados de benchmarks ni detalles del corpus de entrenamiento. Todo lo que se describe a continuación sobre capacidades, hardware y rendimiento se infiere del modelo base Qwen2.5-7B-Instruct y debe tratarse como orientativo, no como una medición del ajuste publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | ~7.600 millones (modelo base); adaptadores QLoRA en el repo (0,3 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (modelo base); extensible a 131.072 en Qwen2.5 original |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite cuantizacion de 4 y 8 bits (GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta principalmente ingles y chino, con cobertura parcial de otros idiomas) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptadores LoRA/QLoRA sobre el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por QLoRA sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de ~7.600 millones de parametros. Qwen2.5-7B-Instruct emplea atención con RoPE, SwiGLU en las capas feed-forward y normalización RMSNorm, y fue preentrenado por Alibaba con un corpus de aproximadamente 18 billones de tokens según la documentación pública del modelo base. El ajuste publicado utiliza SFT (supervised fine-tuning) con TRL 1.12.0, Transformers 5.16.1, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2.

No se especifica en la model card el dataset de entrenamiento, el número de pasos, la configuración de LoRA (rango, alpha, capas objetivo), la tasa de aprendizaje ni el número de tokens de entrenamiento. El único enlace técnico disponible es un run de Weights & Biases (`viktor-kovtun/text-to-sql-qlora-final/runs/d76yn13y`) que presumiblemente contiene las curvas de pérdida y la configuración del entrenamiento. El nombre del modelo sugiere que se ha entrenado para text-to-SQL, pero no hay evidencia en la model card de que se haya evaluado con benchmarks específicos de esa tarea (Spider, BIRD, WikiSQL).

## Capacidades

- Generación de texto y razonamiento: heredadas de Qwen2.5-7B-Instruct, incluyendo razonamiento multi-paso y matemáticas básicas.
- Generación de SQL a partir de lenguaje natural: objetivo declarado del ajuste, aunque no se han publicado ejemplos ni métricas de calidad.
- Generación de código en lenguajes de programación convencionales: capacidad heredada del modelo base, no específicamente reforzada por el ajuste.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-7B-Instruct lo soporta; no se ha verificado que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: heredado del modelo base, sin verificación específica tras el ajuste.
- Capacidades multilingües: heredadas del modelo base (inglés y chino principalmente); no se especifican idiomas en el repo.
- Modo thinking / razonamiento extendido: no disponible en Qwen2.5-7B-Instruct (esa capacidad aparece en la familia Qwen3).
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Asistente de consultas SQL para analistas: el modelo puede recibir el esquema de una base de datos y una pregunta en lenguaje natural y devolver la consulta SQL correspondiente, aprovechando el ajuste específico y la ventana de 32.768 tokens del modelo base para incluir esquemas extensos.
- Generación de consultas en herramientas de BI: integración como endpoint compatible con la API de OpenAI (tag `endpoints_compatible`) para autocompletar consultas en paneles de analítica, con validación humana antes de ejecutar.
- Enriquecimiento de pipelines ETL: traducción de descripciones de negocio a consultas de transformación sobre almacenes de datos, usando el contexto largo para incluir el DDL de varias tablas en el prompt.
- Soporte a equipos de datos junior: chatbot interno que explica consultas SQL existentes y propone alternativas, apoyándose en la capacidad de razonamiento del modelo base.
- Prototipado rápido de interfaces de consulta: despliegue con vLLM o TGI para exponer un endpoint text-to-SQL en una demo interna, dado el tamaño manejable de 7B en cuantización de 4 bits.
- Evaluación comparativa de ajustes QLoRA: el repo sirve como referencia para reproducir el pipeline de TRL (SFT + QLoRA) en tareas verticales, consultando el run de W&B para las curvas de entrenamiento.
- Migración de consultas entre dialectos SQL: uso del modelo para reescribir consultas de un motor a otro (por ejemplo, PostgreSQL a BigQuery), aunque esta capacidad no está validada en el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15-16 GB en FP16/BF16 (7B parámetros × 2 bytes más overhead de activaciones y KV cache); ~5-6 GB en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4); ~9-10 GB en 8 bits.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en BF16 con contexto largo; L40S o RTX A6000 para producción en cuantización de 4 bits.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090/4080 (16-24 GB) funciona en cuantización de 4 bits; en GPUs de 8-12 GB solo con cuantización agresiva (Q4/Q3) y contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere convertir los adaptadores a GGUF), Ollama (tras conversión), transformers con `PeftModel` para cargar los adaptadores sobre el modelo base.
- Latencia y throughput estimados: no disponibles para este ajuste concreto; en el modelo base Qwen2.5-7B-Instruct en una A100 con vLLM se suele observar throughput del orden de miles de tokens por segundo en batch, pero no hay medición publicada para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vkovtun/text-to-sql-qlora-final (este) | ~7,6B (base) + adaptadores | 32.768 (base) | Text-to-SQL por QLoRA | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32.768 (ext. 131.072) | Instruct generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6B | 32.768 (ext. 131.072) | Código y SQL | Apache 2.0 | Hugging Face |
| defog/sqlcoder-7b-2 | ~7B | 16.384 | Text-to-SQL especializado | CC BY-SA 4.0 | Hugging Face |

La comparativa es orientativa: no hay datos de rendimiento del ajuste de vkovtun que permitan situarlo frente a SQLCoder o Qwen2.5-Coder en tareas text-to-SQL. La ventaja principal del repo es la reproducibilidad del pipeline TRL; la desventaja es la ausencia de métricas y de licencia explícita.

## Limitaciones y advertencias

- Ausencia de licencia declarada: la model card indica "licence: license" sin especificar términos; no se puede asumir uso comercial sin consultar al autor y verificar la licencia del modelo base (Apache 2.0 en Qwen2.5-7B-Instruct).
- Sin métricas de evaluación: no hay resultados en Spider, BIRD ni WikiSQL, por lo que se desconoce si el ajuste mejora o degrada el rendimiento del modelo base en text-to-SQL.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y la procedencia de los datos, lo que impide evaluar sesgos y riesgo de sobreajuste a un esquema concreto.
- Riesgo de alucinación de tablas y columnas: como cualquier modelo text-to-SQL, puede inventar identificadores no presentes en el esquema; se recomienda validación sintáctica y contra el catálogo real antes de ejecutar.
- Idiomas no especificados: el modelo base está optimizado para inglés y chino; el rendimiento en castellano para text-to-SQL no está verificado.
- Contexto limitado a 32.768 tokens de forma nativa: esquemas de bases de datos muy grandes requieren truncado o recuperación selectiva de tablas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión comunitaria que permita validar su calidad.
- Compatibilidad de ecosistema: entrenado con versiones muy recientes de Transformers (5.16.1) y PyTorch (2.14.0); puede requerir entornos actualizados para cargar los adaptadores.
- El ejemplo de la model card es un prompt genérico de chat, no un ejemplo text-to-SQL, lo que sugiere que la documentación no se ha adaptado a la tarea declarada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vkovtun/text-to-sql-qlora-final-2026-11-27_23.34.27-Qwen2.5-7B-Instruct-finetune-QLORA
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Run de Weights & Biases del entrenamiento: https://wandb.ai/viktor-kovtun/text-to-sql-qlora-final/runs/d76yn13y
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
