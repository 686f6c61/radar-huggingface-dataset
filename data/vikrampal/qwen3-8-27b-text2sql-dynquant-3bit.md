# VikramPal/Qwen3.8-27B-text2sql-DynQuant-3bit

## Resumen

El modelo `VikramPal/Qwen3.8-27B-text2sql-DynQuant-3bit` es un ajuste fino del modelo base `Qwen/Qwen3.8-27B` de Alibaba, especializado en la generación de consultas SQL a partir de lenguaje natural (text-to-SQL). El autor, VikramPal, ha aplicado un entrenamiento con QLoRA (rank 32) sobre un conjunto de datos compuesto por conversaciones de los benchmarks Spider, Gretel, WikiSQL y Create-Context, y posteriormente ha cuantizado el resultado con la técnica DynQuant a una media de 2.999 bits por peso, lo que reduce el tamaño del modelo a 9.41 GiB en disco.

La relevancia de este checkpoint radica en que demuestra una compresión extrema (por debajo del presupuesto mínimo de 4.0196 bits que la propia arquitectura considera necesario) y cuantifica el coste en precisión: la exactitud de ejecución en la validación de Spider, Gretel y WikiSQL cae del 85.50% (bf16) al 79.50%, una diferencia estadísticamente significativa (p = 1.93e-05). El modelo está pensado para entornos con recursos limitados donde se prioriza el tamaño frente a una pequeña pérdida de rendimiento.

El checkpoint solo incluye la torre de texto del modelo base; no incorpora la ruta de visión. Está diseñado para su uso con la librería `transformers` y es compatible con vLLM mediante un plugin de registro automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B, solo torre de texto) |
| Parametros totales | 27B (modelo base); el safetensors cuantizado contiene 2.732.834.304 parámetros (representación comprimida) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | DynQuant de precisión mixta: 2-bit, 3-bit y 8-bit por módulo (media 2.999 bits/peso) |
| Idiomas soportados | Inglés (entrenado y evaluado solo en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (requiere el plugin `dynquant` para cargar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parámetros con atención completa y una ventana de contexto nativa de 262K tokens. Sobre esta base, el autor realizó un ajuste fino con QLoRA (LoRA rank 32) utilizando 9.999 conversaciones de los conjuntos Spider, Gretel, WikiSQL y Create-Context, lo que supone 350.799 tokens supervisados. El entrenamiento duró 625 pasos con un batch efectivo de 16 y una tasa de aprendizaje de 0.0001, alcanzando una pérdida final de 0.0963.

La innovación principal es la cuantización DynQuant, que asigna un ancho de bits individual a cada módulo (498 en total, con group size 128) basándose en dos señales medidas durante el propio fine-tuning: la masa de activaciones que ve cada peso y la inestabilidad de su gradiente a lo largo de los pasos del optimizador. Los módulos considerados críticos conservan más bits; el resto se comprime. En este checkpoint, el presupuesto medio se fijó en 2.999 bits, por debajo del suelo de 4.0196 bits que la arquitectura requiere para no romper ningún rol. Como resultado, 310 módulos quedaron por debajo de su mínimo funcional (por ejemplo, el `lm_head` recibió 3 bits en lugar de 8, y las capas `mlp.gate` recibieron 2-3 bits en lugar de 4). El autor reporta explícitamente esta violación de límites como una advertencia.

## Capacidades

- Generación de consultas SQL a partir de lenguaje natural, con precisión de ejecución sobre esquemas de bases de datos relacionales.
- Conversación multi-turno orientada a tareas de bases de datos (entrenado con formato conversacional).
- Soporte de decodificación autoregresiva estándar; no se ha verificado soporte de tool calling ni function calling en este checkpoint.
- Capacidad de razonamiento limitada al dominio text-to-SQL; no se ha medido su rendimiento en tareas generales.
- No incluye capacidades de visión, audio ni modo thinking explícito (solo la torre de texto del modelo base).
- Multilingüismo: solo inglés, tanto en entrenamiento como en evaluación.

## Casos de uso

- Asistente de consultas SQL para analistas de datos: el modelo puede traducir preguntas en inglés a sentencias SQL válidas para bases de datos relacionales, reduciendo el tiempo de escritura manual de consultas.
- Integración en herramientas de business intelligence: conectado a un frontend de chat, permite a usuarios no técnicos extraer datos de un data warehouse mediante lenguaje natural.
- Generación automatizada de consultas para pipelines de datos: puede usarse en procesos ETL para generar SQL a partir de especificaciones textuales, siempre que el esquema esté bien definido.
- Educación y formación en SQL: sirve como generador de ejemplos de consultas para estudiantes, aunque se debe validar la salida.
- Prototipado rápido de interfaces de lenguaje natural sobre bases de datos: su tamaño reducido (9.41 GiB) permite desplegarlo en entornos de desarrollo con GPUs de gama media.
- Evaluación de técnicas de cuantización extrema: este checkpoint es útil como caso de estudio para medir el impacto de comprimir por debajo de los límites recomendados en tareas específicas.

## Benchmarks y rendimiento

La model card reporta exactitud de ejecución (execution accuracy) sobre la división de validación de Spider, Gretel y WikiSQL, con 400 problemas y decodificación greedy. El resultado es una comparación pareada entre el modelo cuantizado y su versión bf16 sin cuantizar.

| Modelo | Bits | Tamaño | Exactitud | Diferencia vs bf16 | p (McNemar) |
|---|---:|---:|---:|---:|---:|
| bf16 (sin cuantizar) | 16 | -- | 85.50% | -- | -- |
| Este checkpoint | 2.999 | 9.41 GiB | 79.50% | -6.00 | 1.93e-05 |

No se han publicado resultados en otros benchmarks generales (MMLU, HumanEval, GSM8K) para este checkpoint específico. El autor advierte que la puntuación se obtuvo sobre los esquemas de los conjuntos de datos mencionados; la precisión en esquemas propios puede variar.

## Requisitos de hardware

- Tamaño en disco: 10.1 GB (repo completo), 9.41 GiB de pesos cuantizados.
- VRAM estimada para inferencia: con cuantización de 3 bits, el modelo puede caber en GPUs con 12-16 GB de VRAM, dependiendo de la longitud de contexto y el batch. Para contexto completo de 262K tokens se necesitaría mucha más memoria, pero en la práctica se usará con contextos más cortos.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (para mayor margen). En GPUs con menos de 12 GB puede ser necesario reducir la longitud de contexto o usar offloading.
- Opciones de despliegue: vLLM (con plugin DynQuant auto-registrado), `transformers` con `dynquant.register_hf_quantizer()`, o cualquier framework que soporte el plugin.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño reducido, se espera una latencia moderada en GPUs consumer, pero depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos text-to-SQL de tamaño similar en la información proporcionada. Como referencia, el modelo base Qwen3.8-27B es un LLM multimodal de 27B con contexto de 262K tokens, comparable a otros modelos densos de 27B como Llama-3-27B o Gemma-2-27B, pero este checkpoint está especializado exclusivamente en text-to-SQL y cuantizado de forma extrema. No se puede establecer una comparación cuantitativa sin ejecutar los mismos benchmarks.

## Limitaciones y advertencias

- El modelo está fine-tuneado y evaluado únicamente para text-to-SQL; su capacidad general no ha sido medida y probablemente sea deficiente fuera de este dominio.
- 310 módulos (62% del total) se han cuantizado por debajo del ancho de bits mínimo que su rol requiere, lo que puede provocar degradaciones impredecibles en ciertas entradas. El autor recomienda usar la versión de 4.02 bits si se busca una compresión segura.
- La precisión de ejecución cae 6 puntos porcentuales respecto al modelo sin cuantizar, con significancia estadística. Esta pérdida puede ser aceptable en algunos escenarios, pero no en otros donde la exactitud de la consulta es crítica.
- Solo soporta inglés; no se ha evaluado en otros idiomas.
- No incluye la ruta de visión del modelo base; cualquier entrada multimodal será ignorada.
- Riesgo de alucinación en la generación de SQL: el modelo puede producir consultas sintácticamente válidas pero semánticamente incorrectas si el esquema no está bien descrito en el prompt.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VikramPal/Qwen3.8-27B-text2sql-DynQuant-3bit
- Repositorio DynQuant: https://github.com/kambojvikram/dynquant
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Documentación de Qwen3.8-27B en Cloudflare: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Página de Qwen3.8 en OpenLM: https://openlm.ai/qwen3.8/
