# yuashi/qwen2.5-1.5b-text2sql-merged

## Resumen

El modelo `yuashi/qwen2.5-1.5b-text2sql-merged` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen2.5-1.5B-Instruct` especializado en la tarea de text-to-SQL: dada una pregunta en lenguaje natural y un esquema de base de datos (sentencia `CREATE TABLE`), genera la consulta SQL correspondiente. El autor, identificado como `yuashi`, ha fusionado los pesos del adaptador LoRA entrenado con el modelo base, de modo que el repositorio contiene un modelo causal estándar que se puede cargar directamente con Transformers sin necesidad de envoltorios PEFT.

El ajuste se realizó mediante QLoRA (cuantización de 4 bits del modelo base, rank 16, alpha 32) sobre un subconjunto de 20.000 ejemplos del dataset `b-mc2/sql-create-context`, que deriva de WikiSQL y Spider. El entrenamiento se llevó a cabo en una GPU T4 de Google Colab (plan gratuito) durante una época, con una longitud máxima de secuencia de 512 tokens. El modelo resultante tiene aproximadamente 1.540 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Aunque el modelo base soporta hasta 128K tokens de contexto, el fine-tuning se limitó a secuencias de 512 tokens, lo que condiciona el contexto efectivo en la práctica.

La relevancia de este modelo radica en su tamaño compacto (1.5B) y su especialización en una tarea concreta, lo que lo hace adecuado para entornos con recursos limitados donde se necesita conversión de lenguaje natural a SQL con alta fiabilidad sintáctica. Su evaluación reporta una exactitud de coincidencia exacta del 73% y una tasa de validez de ejecución del 96,7% sobre una muestra de 300 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (~1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (modelo base); entrenamiento con 512 tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M (~1GB) |
| Idiomas soportados | Ingles (fine-tuning); el modelo base soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El fine-tuning se realizó con QLoRA, una técnica que cuantiza el modelo base a 4 bits (NF4 con doble cuantización) y entrena adaptadores LoRA de bajo rango (rank 16, alpha 32) sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de la atención. El entrenamiento se ejecutó con el framework TRL `SFTTrainer` durante una época, con un tamaño de lote efectivo de 16 (lote por dispositivo de 4 × acumulación de gradientes de 4), tasa de aprendizaje de 2e-4 y precisión de cómputo en bfloat16.

El dataset de entrenamiento fue `b-mc2/sql-create-context`, que contiene tripletas (pregunta en lenguaje natural, esquema de base de datos, consulta SQL dorada). Se utilizó un subconjunto aleatorio de 20.000 ejemplos (semilla 42) con una división 95/5 para entrenamiento y validación. El formato de prompt sigue la plantilla ChatML de Qwen, con un system prompt que instruye al modelo a generar únicamente la consulta SQL sin explicaciones. Los pesos del adaptador se fusionaron con el modelo base y se publicaron en este repositorio.

## Capacidades

- Generación de consultas SQL a partir de descripciones en lenguaje natural y esquemas de bases de datos relacionales.
- Comprensión de esquemas expresados como sentencias `CREATE TABLE`, incluyendo nombres de tablas, columnas y tipos de datos.
- Generación de SQL sintácticamente válido y ejecutable contra bases de datos SQLite (según la evaluación del autor).
- Soporte de conversación multi-turno gracias a la plantilla ChatML heredada del modelo base, aunque el fine-tuning se centró en la generación directa de SQL.
- Capacidad de razonamiento básico sobre estructuras de datos tabulares (agregaciones, filtros, joins simples).
- El modelo base original soporta múltiples idiomas y un contexto de hasta 128K tokens, aunque el fine-tuning se realizó únicamente en inglés y con secuencias cortas.

## Casos de uso

- Asistente de consultas SQL para analistas de datos: el modelo puede traducir preguntas en lenguaje natural a consultas SQL sobre esquemas conocidos, reduciendo el tiempo de escritura manual y los errores de sintaxis.
- Generación de informes automatizados: integrado en pipelines de BI, puede generar consultas dinámicas a partir de preguntas de usuario y ejecutarlas contra bases de datos, devolviendo los resultados en tiempo real.
- Chatbot de soporte para bases de datos internas: permite a empleados no técnicos formular preguntas sobre datos de la empresa y obtener respuestas basadas en consultas SQL generadas automáticamente.
- Herramienta de enseñanza de SQL: el modelo puede servir como tutor interactivo que muestra cómo formular consultas correctas a partir de enunciados en lenguaje natural.
- Generación de datos de prueba: en desarrollo de software, puede crear consultas SQL de ejemplo para validar esquemas o probar capas de acceso a datos.
- Automatización de tareas de ETL: el modelo puede convertir requisitos de extracción de datos en lenguaje natural a consultas SQL que se ejecutan en procesos de integración.
- Despliegue en entornos con recursos limitados: gracias a su tamaño compacto y a la disponibilidad de una versión GGUF cuantizada, puede ejecutarse en CPU o GPUs de gama baja para prototipos y aplicaciones edge.

## Benchmarks y rendimiento

El autor evaluó el modelo sobre una muestra de 300 ejemplos del conjunto de test (división 95/5 del subconjunto de 20.000). Las métricas reportadas son:

| Metrica | Valor |
|---|---|
| Exact-match accuracy | 73,0% |
| Execution validity rate | 96,7% |
| Gold query validity (techo de referencia) | 97,7% |

La exactitud de coincidencia exacta mide si el SQL generado coincide con el SQL dorado tras normalizar espacios y mayúsculas. La tasa de validez de ejecución indica el porcentaje de consultas que se ejecutan sin error contra una base SQLite construida con el esquema real del ejemplo. El autor advierte que esta métrica no mide la corrección de los resultados, sino la validez sintáctica y semántica (referencias correctas a tablas y columnas). No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en BF16 (carga completa) y alrededor de 1 GB con cuantización GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en BF16; una RTX 3060, RTX 4060 o similar es suficiente. Para la versión GGUF cuantizada, incluso una GPU integrada o CPU es viable.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en la mayoría de GPUs consumer modernas (RTX 3060, 4060, 4070, etc.) y también en Macs con Apple Silicon mediante llama.cpp.
- Opciones de despliegue: Transformers con `device_map="auto"`, vLLM, llama.cpp, Ollama (mediante la versión GGUF), TGI.
- Latencia y throughput: no se han publicado mediciones específicas; en una GPU T4, la generación de una consulta SQL típica (menos de 150 tokens) debería completarse en menos de un segundo con `max_new_tokens=150`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuashi/qwen2.5-1.5b-text2sql-merged` | 1.5B | 128K (base) / 512 (entrenamiento) | Fine-tuning QLoRA sobre Qwen2.5-1.5B-Instruct | Apache 2.0 | Hugging Face, GGUF |
| `Qwen/Qwen2.5-1.5B-Instruct` (base) | 1.5B | 128K | Modelo generalista sin especialización SQL | Apache 2.0 | Hugging Face |
| `defog/sqlcoder-7b-2` | 7B | 4K | Fine-tuning específico para text-to-SQL | CC BY-SA 4.0 | Hugging Face |
| `codellama/CodeLlama-7b-Instruct-hf` | 7B | 16K | Modelo de código generalista con capacidades SQL | Llama 2 license | Hugging Face |

El modelo aquí descrito es significativamente más pequeño que las alternativas especializadas (7B), lo que lo hace más ligero y rápido, pero probablemente con menor precisión en esquemas complejos. Su licencia Apache 2.0 es más permisiva que la de SQLCoder (CC BY-SA 4.0) y CodeLlama (licencia Llama 2 con restricciones). La ventaja principal es su bajo coste de despliegue y la posibilidad de ejecutarse en CPU con la versión GGUF.

## Limitaciones y advertencias

- El modelo fue entrenado solo con 20.000 ejemplos de un dataset de ~78.000 disponibles, lo que limita su cobertura de esquemas y patrones de consulta.
- La métrica de validez de ejecución no verifica la corrección de los resultados, solo que la consulta se ejecuta sin errores sintácticos. No se ha probado contra datos poblados.
- No se realizaron pruebas con esquemas fuera de distribución ni adversariales; el rendimiento puede degradarse con esquemas muy diferentes a los del entrenamiento.
- El fine-tuning se realizó únicamente en inglés; el modelo puede no responder adecuadamente en otros idiomas para la tarea text-to-SQL.
- La longitud máxima de secuencia durante el entrenamiento fue de 512 tokens, por lo que esquemas muy largos o preguntas extensas pueden superar la capacidad del modelo y producir resultados subóptimos.
- El modelo hereda los sesgos y limitaciones del modelo base Qwen2.5-1.5B-Instruct, incluyendo posibles alucinaciones en contextos no cubiertos.
- La versión GGUF cuantizada (Q4_K_M) puede presentar una ligera degradación de calidad respecto a los pesos BF16.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yuashi/qwen2.5-1.5b-text2sql-merged)
- [Versión GGUF cuantizada](https://huggingface.co/yuashi/qwen2.5-1.5b-text2sql-gguf)
- [Modelo base Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Dataset b-mc2/sql-create-context](https://huggingface.co/datasets/b-mc2/sql-create-context)
- [Repositorio de entrenamiento (GitHub)](https://github.com/Akshu24Tech/text2sql-qlora)
