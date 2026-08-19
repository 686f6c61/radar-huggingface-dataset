# StarsMakeGalaxy/text-to-sql-Q4_K_M

## Resumen

El modelo `StarsMakeGalaxy/text-to-sql-Q4_K_M` es un adaptador GGUF de Qwen3.5-4B, un modelo de lenguaje multimodal de 4.326 millones de parámetros, finetuneado específicamente para la generación de consultas SQL a partir de lenguaje natural. Ha sido entrenado y convertido al formato GGUF mediante la librería Unsloth, lo que permite su ejecución eficiente en entornos locales con llama.cpp. El repositorio incluye tanto el archivo cuantizado Q4_K_M como un proyector multimodal en F16 (`F16-mmproj`), lo que sugiere que el modelo base conserva capacidades de visión, aunque el finetune se centra en la tarea text-to-SQL.

El modelo se apoya en un dataset propio del autor, `enterprise-text2sql-curated-600`, con 600 ejemplos en inglés, formato ChatML y cadena de pensamiento, orientado a escenarios empresariales. Aunque la ficha de HuggingFace no especifica licencia ni idiomas, la presencia del archivo GGUF y del proyector multimodal indica que está pensado para despliegues locales con llama.cpp, tanto en modo texto como multimodal. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para la automatización de consultas SQL en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer multimodal, con proyector de visión) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo GGUF) y F16 para el proyector multimodal |
| Idiomas soportados | no disponible (el dataset de entrenamiento es en ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (F16-mmproj) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-4B, un transformer multimodal que combina un codificador de lenguaje con un proyector de visión (indicado por el archivo `F16-mmproj`). El finetune se ha realizado con Unsloth, una libreria que optimiza el entrenamiento y la conversion a GGUF, logrando una velocidad de entrenamiento aproximadamente 2 veces superior a los metodos convencionales. El dataset de entrenamiento, `enterprise-text2sql-curated-600`, contiene 600 ejemplos en ingles con formato ChatML y cadenas de pensamiento (chain-of-thought), lo que sugiere que el modelo ha sido entrenado para razonar paso a paso antes de generar la consulta SQL. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural, orientada a bases de datos empresariales.
- Soporte de razonamiento multi-paso mediante cadenas de pensamiento (chain-of-thought) integradas en el prompt.
- Capacidades multimodales heredadas de Qwen3.5-4B, gracias al proyector de vision incluido (aunque el finetune se centra en texto).
- Compatible con el formato ChatML para conversaciones multi-turno.
- Ejecucion local eficiente gracias a la cuantizacion Q4_K_M y al soporte de llama.cpp.
- Posible uso como agente conversacional para interacciones con bases de datos, aunque no se confirma soporte explicito de tool calling.

## Casos de uso

- Asistente de consultas SQL para analistas de datos: el modelo puede traducir preguntas en lenguaje natural a consultas SQL validas, reduciendo el tiempo de redaccion manual. Su tamano compacto permite ejecutarlo en portatiles con GPU de gama media.
- Automatizacion de reportes empresariales: integrado en pipelines de BI, puede generar consultas SQL para extraer metricas de ventas, inventario o finanzas a partir de descripciones en texto.
- Soporte a desarrolladores en entornos de desarrollo integrado (IDE): como complemento de autocompletado, sugiere consultas SQL basadas en comentarios o descripciones de funciones.
- Chatbot interno de datos corporativos: desplegado con llama.cpp, responde a preguntas sobre bases de datos internas sin enviar datos a la nube, cumpliendo requisitos de privacidad.
- Generacion de consultas para bases de datos de prueba: en entornos de testing, el modelo puede crear consultas SQL variadas a partir de especificaciones textuales, facilitando la cobertura de casos.
- Educacion y formacion en SQL: como herramienta de aprendizaje, explica como traducir una pregunta a SQL, mostrando el razonamiento paso a paso gracias al chain-of-thought.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni metricas especificas de text-to-SQL (como exact match o execution accuracy) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa aproximadamente 3,5 GB, por lo que se puede ejecutar en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, o incluso en CPU con suficiente RAM).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Metal (Apple Silicon) y al menos 8 GB de VRAM para un rendimiento fluido. Para uso en CPU, se recomienda un procesador con 16 GB de RAM.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media como RTX 3060, RTX 4060, RTX 4070, y en Macs con chip M1/M2/M3.
- Opciones de despliegue: llama.cpp (con `llama-cli` para texto y `llama-mtmd-cli` para multimodal), Ollama, o servidores compatibles con GGUF como llama.cpp server o text-generation-webui.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 3060, se estima una velocidad de generacion de 20-40 tokens/segundo para un modelo de 4B en Q4, pero estos valores son orientativos y dependen del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| StarsMakeGalaxy/text-to-sql-Q4_K_M | 4,3B | no disponible | Text-to-SQL multimodal | no disponible | GGUF |
| Prem-1B-SQL | 1B | no disponible | Text-to-SQL | no disponible | no disponible |
| Otros modelos text-to-SQL (p.ej. SQLCoder, CodeLlama) | 7B-34B | 4K-16K | Text-to-SQL | variada | variado |

No se dispone de datos de rendimiento comparativos. El modelo de StarsMakeGalaxy se distingue por su tamano reducido y su formato GGUF, lo que facilita el despliegue local, pero carece de informacion publica sobre su precision en benchmarks estandar.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- El dataset de entrenamiento es muy pequeno (600 ejemplos) y en ingles, por lo que el rendimiento en otros idiomas o en dominios muy especificos puede ser limitado.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez. Como modelo generativo, puede producir consultas SQL incorrectas o inventar tablas/columnas si el esquema no esta bien definido en el prompt.
- La longitud de contexto no esta documentada; se recomienda verificar el comportamiento con prompts largos antes de usarlo en tareas complejas.
- El proyector multimodal sugiere capacidades de vision, pero no se ha validado su rendimiento en tareas que combinen imagen y SQL.
- Al ser un finetune de Qwen3.5-4B, hereda las limitaciones del modelo base, que no se detallan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StarsMakeGalaxy/text-to-sql-Q4_K_M
- Dataset de entrenamiento: https://huggingface.co/datasets/StarsMakeGalaxy/enterprise-text2sql-curated-600
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
