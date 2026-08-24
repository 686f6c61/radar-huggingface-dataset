# ulldma/Qwen3.5-0.8B-OptiQ-4bit-text-to-sql

## Resumen

El modelo **Qwen3.5-0.8B-OptiQ-4bit-text-to-sql** es un ajuste fino mediante LoRA sobre la versión cuantizada en 4 bits de Qwen3.5-0.8B, desarrollado por el usuario ulldma. Su propósito es transformar preguntas en lenguaje natural en sentencias SQL válidas para esquemas de bases de datos pequeños y conocidos, un problema que el modelo base no resuelve de forma fiable (genera respuestas en prosa o alucina datos).

El modelo se distribuye en formato MLX y está pensado para ejecutarse en Macs con Apple Silicon, con un uso de memoria unificada de aproximadamente 4 GB. Tras 600 iteraciones de entrenamiento LoRA, alcanza un 86,5 % de sentencias SQL válidas en el conjunto de test y un 47 % de precisión semántica exacta. Su relevancia actual radica en ofrecer una solución ligera y privada para consultas de datos en entornos de desarrollo, educación y aplicaciones locales, sin depender de servicios externos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) |
| Parametros totales | 174.539.584 (~0,17 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (modelo base); entrenado con 512 tokens |
| Tipos de cuantizacion | MLX 4-bit mixta (OptiQ, capas sensibles a 8-bit) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, cuantizado con OptiQ, una técnica de cuantización mixta que asigna ancho de bits por capa según su sensibilidad (medida por divergencia KL) en un conjunto de calibración de seis dominios. Las capas sensibles se mantienen en 8 bits y el resto en 4 bits, logrando un tamaño en disco similar al de una cuantización uniforme 4-bit pero con menor pérdida de calidad.

El ajuste fino se realizó mediante LoRA con rango 8, escala 20 y dropout 0, aplicado a 16 capas objetivo. Se usaron 600 iteraciones con un tamaño de lote de 2, tasa de aprendizaje constante de 1e-5 y una longitud máxima de secuencia de 512 tokens. El conjunto de datos fue un subconjunto filtrado de `gretelai/synthetic_text_to_sql`, con 5.000 ejemplos de entrenamiento, 500 de validación y 1.000 de test, cubriendo consultas SELECT básicas y joins de una sola tabla en unas 100 dominios (salud, finanzas, educación, etc.). Los adaptadores LoRA se fusionaron en el modelo base durante el entrenamiento.

## Capacidades

- Generación de sentencias SQL (SELECT básicos y joins de una sola tabla) a partir de preguntas en inglés y un esquema de base de datos proporcionado en el prompt.
- Razonamiento estructurado para tareas de traducción de consultas naturales a lenguaje de consulta.
- Soporte de formato de prompt específico: `CREATE TABLE ...; Q: <pregunta> A:` para completar con una única sentencia SQL.
- Funcionamiento local en dispositivos Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- No soporta tool calling, agentes ni razonamiento multi-paso más allá de la generación directa de SQL.
- Limitado al idioma inglés; no entrenado para otros idiomas.

## Casos de uso

- Prototipos de consulta de bases de datos: permite a desarrolladores añadir una capa de lenguaje natural a esquemas SQL simples en fases de desarrollo o demos, reduciendo el tiempo de consulta manual.
- Asistentes locales que preservan la privacidad: al ejecutarse completamente en el dispositivo, se pueden construir asistentes que traduzcan preguntas a SQL sin enviar datos a servidores externos, útil en entornos con datos sensibles.
- Educación sobre fine-tuning con LoRA: sirve como ejemplo práctico de cómo un modelo pequeño puede aprender una tarea estructurada (generación de SQL) mediante adaptadores de bajo rango, con un pipeline de entrenamiento reproducible.
- Integración en aplicaciones Mac/iOS: gracias a su tamaño compacto y al formato MLX, puede incorporarse como capa de consulta natural en apps locales con esquemas de bases de datos fijos.
- Generación de consultas para análisis rápido: para analistas que trabajan con esquemas pequeños y conocidos, puede acelerar la redacción de SQL básico sin necesidad de consultar la documentación.
- Evaluación de técnicas de cuantización: permite comparar el rendimiento de una cuantización mixta (OptiQ) frente a cuantización uniforme en tareas específicas de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. La model card del autor proporciona los siguientes datos de evaluación sobre el conjunto de test de text-to-SQL:

| Metrica | Valor |
|---|---|
| SQL válido sin fine-tuning | 0 % |
| SQL válido con prompt engineering | 1,5 % |
| SQL válido tras LoRA (600 iteraciones) | 86,5 % |
| Precisión semántica exacta | 47 % |

Estos resultados indican que el modelo base no genera SQL válido de forma fiable y que el ajuste con LoRA mejora sustancialmente la validez sintáctica, aunque la precisión semántica sigue siendo moderada y requiere revisión manual.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB de memoria unificada en Apple Silicon (el modelo base 4-bit ocupa ~0,5 GB y el adaptador LoRA fusionado añade un overhead pequeño).
- GPU recomendadas: cualquier chip Apple Silicon con al menos 8 GB de RAM unificada (M1, M2, M3 o superiores).
- No compatible con GPUs NVIDIA o AMD en modo nativo; requiere MLX, por lo que está limitado a hardware Apple.
- Opciones de despliegue: `mlx-lm` para Python y CLI; también puede cargarse en proyectos que usen la librería MLX directamente.
- Latencia y throughput: no se han publicado datos; dado el tamaño del modelo, se espera una generación rápida en Apple Silicon, con tiempos de respuesta inferiores a un segundo para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento text-to-SQL |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-OptiQ-4bit-text-to-sql (este) | 0,17 B | 512 (entrenamiento) | MLX 4-bit | Apache-2.0 | 86,5 % SQL válido, 47 % semántica |
| Qwen3.5-0.8B base (sin ajuste) | 0,17 B | 262 K | MLX 4-bit | Apache-2.0 | 0 % SQL válido |
| Modelos propietarios text-to-SQL (p. ej., GPT-4) | no disponible | no disponible | no disponible | propietario | no disponible |

La comparativa muestra que el ajuste LoRA es esencial para la tarea text-to-SQL, ya que el modelo base no genera SQL válido. No se dispone de datos de otros modelos pequeños específicos para text-to-SQL en esta información.

## Limitaciones y advertencias

- El modelo solo entiende inglés; no soporta consultas en otros idiomas.
- Limitado a consultas SELECT básicas y joins de una sola tabla; consultas con múltiples joins, funciones de ventana o DDL complejo están fuera de distribución y probablemente generen SQL incorrecto.
- La precisión semántica es del 47 %, lo que implica que una parte significativa de las sentencias generadas, aunque sintácticamente válidas, no capturan la intención de la pregunta. Es imprescindible revisar el SQL antes de ejecutarlo contra una base de datos real.
- El entrenamiento se realizó con datos sintéticos, por lo que el vocabulario de esquemas reales puede diferir y reducir el rendimiento.
- El modelo no es adecuado para bases de datos grandes con muchas tablas o consultas analíticas complejas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no proporciona garantías sobre la exactitud de las consultas generadas.
- No se han evaluado sesgos o alucinaciones específicos; como modelo pequeño, puede generar respuestas plausibles pero incorrectas si el esquema o la pregunta son ambiguos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ulldma/Qwen3.5-0.8B-OptiQ-4bit-text-to-sql)
- [Modelo base cuantizado (mlx-community/Qwen3.5-0.8B-OptiQ-4bit)](https://huggingface.co/mlx-community/Qwen3.5-0.8B-OptiQ-4bit)
- [Dataset de entrenamiento (gretelai/synthetic_text_to_sql)](https://huggingface.co/datasets/gretelai/synthetic_text_to_sql)
- [Librería MLX](https://github.com/ml-explore/mlx)
- [mlx-lm (repositorio de inferencia y entrenamiento)](https://github.com/ml-explore/mlx-lm)
- [Página del modelo en Nodepedia (especificaciones de VRAM y quants)](https://nodepedia.com/models/qwen3-5-0-8b-optiq-4bit/)
- [Página del modelo en ModelScope](https://www.modelscope.cn/models/mlx-community/Qwen3.5-0.8B-OptiQ-4bit)
- [Ollama - Qwen3.5 0.8b](https://ollama.com/library/qwen3.5:0.8b)
