# tcjszy/PatentSQL-Qwen2.5-Coder-7B-GGUF

## Resumen

PatentSQL-Qwen2.5-Coder-7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-7B-Instruct de Alibaba, especializado en la generación de consultas para dos motores de datos distintos: MySQL 8.0 (text-to-SQL) y Elasticsearch 8.x (Query DSL). Lo desarrolla el usuario tcjszy y está orientado a la recuperación y explotación estadística de datos de patentes chinas en entornos empresariales con despliegue privado. El modelo parte de una arquitectura transformer densa de 7.615.616.512 parámetros y conserva la ventana de contexto del modelo base de Qwen2.5-Coder, si bien la model card no explicita el valor exacto.

La propuesta de valor es doble: por un lado, cubre consultas SQL complejas sobre esquemas de patentes (JOINs multi-tabla, funciones de ventana, cálculo de tasas de concesión y de vigencia, decodificación de jerga y enumeraciones); por otro, genera DSL de Elasticsearch para búsquedas de texto completo con pesos, exclusiones booleanas y agregaciones por facetas (`terms`, `date_histogram`). El modelo se entrenó con Unsloth, QLoRA y enmascaramiento de pérdida solo en la respuesta, e incorpora una cadena de razonamiento explícita en etiquetas `<think>` antes del bloque de código ejecutable.

Es relevante ahora porque los modelos especializados pequeños (7B) permiten despliegues en una sola GPU de consumo, algo crítico en dominios con datos sensibles como el de patentes, donde no siempre es viable enviar esquemas y datos a APIs externas. Además, la inclusión de muestras de auto-corrección de errores de MySQL lo hace apto para pipelines de agente con reintento automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M en el ejemplo de Ollama); otras variantes no disponibles |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (este repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen2.5-Coder-7B-Instruct. El entrenamiento se realizó con Unsloth y QLoRA (cuantización de bajo rango), aplicando enmascaramiento de pérdida únicamente sobre la respuesta (Response-Only Loss Masking), de modo que el modelo aprende a producir la salida y no a reproducir el prompt. El conjunto de datos es el publicado por el autor, `tcjszy/cn-patent-text2sql-es-dataset`, que combina ejemplos de MySQL 8.0 y de Query DSL de Elasticsearch 8.x sobre esquemas de patentes chinas. La model card indica que se inyectaron específicamente muestras de reparación de errores de MySQL para habilitar la auto-corrección, y que se mezclaron bases de datos empresariales chinas genéricas (no de patentes) para preservar la capacidad de generalización a esquemas DDL no vistos.

La innovación técnica destacable es el formato de salida en dos fases: primero una cadena de razonamiento en chino dentro de `<think>` que descompone el criterio de negocio y localiza los campos relevantes, y después un bloque de código ejecutable (SQL o JSON). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card solo menciona SFT con QLoRA.

## Capacidades

- Generación de SQL para MySQL 8.0: JOINs multi-tabla, funciones de ventana, decodificación de enumeraciones y jerga, cálculo de tasas de concesión y de vigencia de patentes.
- Generación de Query DSL para Elasticsearch 8.x: `multi_match` con pesos, cláusulas `bool` con exclusiones, agregaciones `terms` y `date_histogram` para facetado.
- Razonamiento explícito previo a la respuesta mediante etiquetas `<think>` con la descomposición del criterio de negocio y la localización de campos.
- Auto-corrección de errores: entrenado con muestras de reparación de errores de MySQL, apto para bucles `try-catch` con reintento automático.
- Generalización entre bases de datos: capacidad declarada de operar sobre DDL nuevos no vistos gracias a la mezcla de bases de datos empresariales genéricas.
- Soporte conversacional multi-turno mediante plantilla de chat (formato Qwen).
- Capacidades multilingües limitadas a chino e inglés.
- No se declaran capacidades de visión, audio ni tool calling nativo más allá del uso como generador de consultas dentro de un agente.

## Casos de uso

- Consultas analíticas sobre bases de datos de patentes: un analista formula en lenguaje natural una pregunta como el número de invenciones vigentes en una provincia, y el modelo genera el SQL con los JOINs y filtros de estado y fecha necesarios, apoyándose en la ventana de contexto del modelo base para incluir el DDL del esquema.
- Búsqueda de texto completo en Elasticsearch: el modelo traduce una consulta de negocio a DSL con `multi_match` ponderado por campos (título, resumen, reivindicaciones) y exclusiones booleanas, útil para portales de búsqueda de patentes.
- Cuadros de mando y estadísticas agregadas: genera agregaciones `terms` y `date_histogram` para construir paneles de evolución temporal de solicitudes y concesiones por sector o por solicitante.
- Agente de auto-reparación de consultas: integrado en un pipeline que ejecuta la SQL, captura el error de MySQL y reinyecta el mensaje para que el modelo emita una versión corregida, gracias a las muestras de reparación incluidas en el entrenamiento.
- Asistente interno para examinadores o abogados de propiedad industrial: permite consultar el estado legal de familias de patentes sin conocer el esquema subyacente, manteniendo los datos dentro de la infraestructura privada.
- Despliegue en puesto de trabajo o servidor de gama media: con la versión GGUF Q4_K_M puede ejecutarse vía Ollama en una sola GPU de consumo, lo que facilita prototipos y demostraciones sin infraestructura dedicada.
- Migración entre motores: usar el mismo modelo para producir tanto la consulta SQL relacional como su equivalente en DSL, facilitando la validación cruzada de resultados entre MySQL y Elasticsearch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la tabla comparativa (Base vs SFT vs SFT + Agent Self-Correction) se añadirá tras completar la evaluación automatizada completa, por lo que no existen cifras verificables de MMLU, HumanEval, GSM8K ni de precisión de ejecución SQL en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo denso de 7.6B en bf16 se requiere aproximadamente 15-16 GB solo para pesos, y en GGUF Q4_K_M alrededor de 4,5-5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16 GB o más (RTX 4080/4090, A10, L4) permite bf16; una GPU de 8 GB basta para cuantizaciones GGUF de 4 bits.
- Cabe en GPU de consumo: sí, según la model card, mediante la versión GGUF y Ollama en una sola tarjeta o incluso en un ordenador personal.
- Opciones de despliegue: Ollama (`ollama run hf.co/tcjszy/PatentSQL-Qwen2.5-Coder-7B-GGUF:Q4_K_M`), Transformers con `device_map="auto"`, llama.cpp para GGUF. No se confirma compatibilidad con vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatentSQL-Qwen2.5-Coder-7B | 7,6B | no disponible | Text-to-SQL MySQL + DSL Elasticsearch sobre patentes chinas | apache-2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | no disponible en esta ficha | Generacion de codigo general | apache-2.0 | Hugging Face |
| SQLCoder-7B-2 | 7B aprox. | no disponible | Text-to-SQL generico en ingles | no disponible en esta ficha | Hugging Face |

La comparación con SQLCoder-7B-2 se incluye por categoría (text-to-SQL de 7B), pero no se dispone de datos de rendimiento comparables ni de especificaciones verificadas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano no está validado y probablemente sea deficiente.
- Dominio estrecho: el ajuste está orientado a esquemas de patentes chinas y a MySQL/Elasticsearch; otros motores (PostgreSQL, BigQuery) o dominios distintos pueden degradar la calidad.
- Riesgo de alucinación: como todo modelo generativo de SQL, puede inventar columnas, tablas o funciones inexistentes; es imprescindible validar las consultas contra el esquema real antes de ejecutarlas en producción.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre datos de patentes chinas puede heredar sesgos de cobertura y terminología de ese corpus.
- Auto-corrección no garantizada: aunque se entrenó con muestras de reparación, no hay métricas publicadas que cuantifiquen la tasa de corrección exitosa.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-Coder y del dataset de entrenamiento por si imponen restricciones adicionales.
- Evaluación pendiente: el autor no ha publicado benchmarks; el rendimiento real frente al modelo base es desconocido.
- Contexto: al no documentarse la longitud de contexto, no se puede garantizar que esquemas DDL extensos quepan en la ventana.

## Enlaces

- Modelo GGUF: https://huggingface.co/tcjszy/PatentSQL-Qwen2.5-Coder-7B-GGUF
- Modelo base (safetensors): https://huggingface.co/tcjszy/PatentSQL-Qwen2.5-Coder-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/tcjszy/cn-patent-text2sql-es-dataset
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
