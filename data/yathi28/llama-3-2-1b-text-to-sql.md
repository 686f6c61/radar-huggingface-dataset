# Yathi28/llama-3.2-1b-text-to-sql

## Resumen

Yathi28/llama-3.2-1b-text-to-sql es un adaptador LoRA (entrenado con QLoRA) que convierte preguntas en inglés en consultas SQL a partir de un esquema de base de datos. El modelo base es unsloth/Llama-3.2-1B-Instruct, una versión optimizada del Llama 3.2 1B de Meta, y el adaptador añade 11,27 millones de parámetros entrenables (0,90 % del total). El proyecto, firmado por Yatheesh Pateel, demuestra que es posible ajustar un LLM de 1.200 millones de parámetros en una GPU de portátil con 6 GB de VRAM en unos 12 minutos, usando el dataset sintético gretelai/synthetic_text_to_sql.

El modelo resuelve el problema de traducir lenguaje natural a SQL, una tarea habitual en análisis de datos y desarrollo de aplicaciones con bases de datos. Su relevancia radica en que ofrece una alternativa ligera y de bajo coste para entornos con recursos limitados, aunque el autor advierte que es un proyecto de aprendizaje y demostración, no validado para producción. La arquitectura es un transformer decoder-only estándar, con una ventana de contexto nativa de 128K tokens en el modelo base, aunque el entrenamiento se limitó a secuencias de 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B Instruct) con adaptadores LoRA |
| Parametros totales | 1,24B (1,2B del modelo base + 11,27M del adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base); entrenado con max_seq_length de 1024 |
| Tipos de cuantizacion | 4-bit NF4 (QLoRA), 8-bit y 16-bit (compatible con BitsAndBytes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 (licencia de Meta para Llama 3.2) |
| Formato de pesos | Safetensors (adaptadores PEFT, no pesos completos) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 1B Instruct, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. Sobre este modelo se aplicó QLoRA: cuantización del modelo base a 4-bit NF4 con doble cuantización, y entrenamiento de adaptadores LoRA de rango 16 y alpha 16 sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento usó 5.000 muestras del dataset gretelai/synthetic_text_to_sql (de un total de más de 100.000), con 200 pasos (0,32 épocas), batch efectivo de 8, learning rate 2e-4 con decaimiento lineal, optimizador adamw_8bit y precisión bfloat16. La pérdida descendió de 1,2786 a 0,6654, con el mejor valor de 0,5782 en el paso 150. El entrenamiento completo duró unos 12,5 minutos en una NVIDIA GeForce RTX 3050 6GB Laptop GPU.

## Capacidades

- Generacion de consultas SQL a partir de preguntas en ingles y esquemas de base de datos en formato CREATE TABLE.
- Generacion de texto general, heredada del modelo base instruct (conversacion, respuesta a preguntas, etc.), aunque el fine-tuning degrada parcialmente esta capacidad al especializarse en SQL.
- Soporte de formato de prompt estructurado: pregunta + esquema + salida SQL, con plantilla definida en la model card.
- Capacidad de razonamiento basico para traducir frases como "top 5 highest paid employees" a consultas con ORDER BY y LIMIT.
- No soporta tool calling, vision, audio ni modos de pensamiento extendido.
- Multilingue limitado: solo ingles, tanto en preguntas como en esquemas.

## Casos de uso

- Asistente de consultas SQL para analistas de datos: el modelo puede traducir preguntas ad hoc en ingles a consultas SQL sobre esquemas conocidos, acelerando la exploracion de datos en entornos de notebook o dashboards.
- Generacion de SQL en aplicaciones de BI: integrado en herramientas de business intelligence, permite a usuarios no tecnicos formular preguntas en lenguaje natural y obtener la consulta subyacente para revision o ejecucion.
- Educacion y formacion en SQL: los estudiantes pueden practicar traduciendo preguntas a SQL y comparando con las respuestas del modelo, como material de apoyo en cursos de bases de datos.
- Prototipado rapido de APIs de datos: los desarrolladores pueden usar el modelo para generar consultas de ejemplo durante el diseno de endpoints REST o GraphQL que acceden a bases de datos relacionales.
- Automatizacion de informes periodicos: con un esquema fijo, el modelo puede generar consultas para informes recurrentes (ventas, inventario, metricas de RRHH) a partir de descripciones en lenguaje natural.
- Demo tecnica y evaluacion de QLoRA: sirve como caso de estudio para desarrolladores que quieren aprender a fine-tunear modelos con PEFT y QLoRA en hardware modesto, replicando el flujo de entrenamiento documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la curva de perdida de entrenamiento (de 1,2786 a 0,6654), sin evaluacion en conjuntos estandar como Spider, WikiSQL o BIRD. Tampoco hay comparaciones con otros modelos text-to-SQL en terminos de exactitud o ejecucion de consultas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB con cuantizacion 4-bit (modelo base + adaptador), entre 2 y 3 GB en 8-bit, y alrededor de 4-5 GB en 16-bit.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, GTX 1660) o incluso CPU sola para inferencia lenta. El entrenamiento se realizo en una RTX 3050 6GB Laptop GPU.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna de consumo, incluidas las integradas con suficiente RAM compartida.
- Opciones de despliegue: transformers con PEFT (cargando el adaptador sobre el modelo base), vLLM (fusionando el adaptador previamente), llama.cpp (si se fusiona y se convierte a GGUF), o TGI. No se puede usar directamente en Ollama sin fusionar el adaptador.
- Latencia y throughput: no se han medido oficialmente. Dado el tamano de 1B, se espera una generacion de 150 tokens en menos de 2 segundos en una GPU moderna, y de 5-10 segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Dataset | Licencia |
|---|---|---|---|---|---|
| Yathi28/llama-3.2-1b-text-to-sql | 1,24B (1B base + LoRA) | 128K (base) | QLoRA (rank 16) | gretelai/synthetic_text_to_sql (5K muestras) | Llama 3.2 |
| ssnym/llama-3.2-1b-text-to-sql | 1,24B (1B base + LoRA) | 128K (base) | QLoRA | b-mc2/sql-create-context | Llama 3.2 |
| XeAI/LLaMa_3.2_3B_Instruct_Text2SQL_Legacy | 3,2B (3B base + LoRA) | 128K (base) | Fine-tuning (no especificado) | No especificado | Llama 3.2 |

Los tres modelos comparten la misma familia base (Llama 3.2) y el objetivo text-to-SQL. La diferencia principal es el tamano (1B vs 3B) y el dataset de entrenamiento. El modelo de Yathi28 usa un dataset sintetico de Gretel, mientras que ssnym usa sql-create-context, un dataset mas consolidado en la comunidad. El modelo de 3B de XeAI ofrece mayor capacidad de razonamiento, pero requiere mas recursos. No hay benchmarks publicos que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- Entrenamiento muy corto: solo 200 pasos (0,32 epocas), lo que limita la generalizacion y la calidad de las consultas generadas.
- Funciona mejor con esquemas en formato CREATE TABLE; otros formatos (por ejemplo, diagramas o descripciones textuales) pueden producir resultados incorrectos.
- Solo soporta preguntas en ingles; no se ha evaluado con otros idiomas.
- Proyecto de aprendizaje y demostracion, no probado para uso en produccion. El propio autor lo advierte explicitamente.
- Riesgo de alucinacion: puede generar SQL sintacticamente valido pero semanticamente incorrecto, especialmente con esquemas complejos o preguntas ambiguas.
- Contexto limitado en entrenamiento (1024 tokens), por lo que esquemas muy largos o preguntas con multiples tablas pueden superar la capacidad del modelo.
- Licencia Llama 3.2: requiere aceptar los terminos de Meta, que incluyen restricciones para usos comerciales en ciertos casos (empresas con mas de 700 millones de usuarios mensuales necesitan licencia comercial).
- No se incluyen pesos completos, solo el adaptador LoRA; es necesario descargar el modelo base por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yathi28/llama-3.2-1b-text-to-sql
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Perfil del autor en HuggingFace: https://huggingface.co/Yathi28
- GitHub del autor: https://github.com/yatheeshpateel
- Modelo similar (ssnym): https://huggingface.co/ssnym/llama-3.2-1b-text-to-sql
- Modelo similar (XeAI 3B): https://huggingface.co/XeAI/LLaMa_3.2_3B_Instruct_Text2SQL_Legacy
- Articulo de LinkedIn sobre text-to-SQL con Llama 3.2 1B: https://www.linkedin.com/pulse/generating-sql-queries-using-text-to-sql-llama-32-1b-model-pramodh-m-nhbbc
- Repo AI2SQL (Llama 3.2): https://github.com/mergisi/AI2SQL-Llama3.2
