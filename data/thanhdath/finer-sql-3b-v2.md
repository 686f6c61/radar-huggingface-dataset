# thanhdath/FINER-SQL-3B-v2

## Resumen

FINER-SQL-3B-v2 es un modelo de generacion de texto especializado en la traduccion de lenguaje natural a SQL (text-to-SQL), desarrollado por el usuario thanhdath y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la familia Qwen2 y cuenta con 3.085.938.688 parametros reales segun los pesos en safetensors, lo que lo situa en la categoria de modelos de aproximadamente 3B. Su proposito es resolver la tarea de convertir preguntas en lenguaje natural sobre esquemas de bases de datos en consultas SQL ejecutables, un problema central en interfaces de acceso a datos y asistentes analiticos.

El modelo forma parte de una familia de tres tamanos (0.5B, 1.5B y 3B) denominada v2, lo que permite escalar segun los recursos de hardware disponibles. Segun la model card, la variante de 3B alcanza un 68,84 de exactitud de ejecucion (EX) en BIRD Dev, un 86,75 en Spider Dev, un 81,53 en Spider Dev (TS) y un 87,66 en Spider Test, cifras que lo colocan como la variante mas capable de la familia.

Es relevante ahora porque el text-to-SQL de alta precision sobre esquemas reales sigue siendo un cuello de botella en herramientas de analitica y agentes de datos, y este modelo ofrece un tamano contenido (3B) que puede desplegarse en infraestructura modesta manteniendo resultados competitivos en los benchmarks de referencia del area.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen2 |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, segun las etiquetas del repositorio, con 3.085.938.688 parametros reales. El modelo esta afinado especificamente para la tarea text-to-SQL, como indica su nombre y la evaluacion sobre los conjuntos BIRD y Spider. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset de afinado, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje supervisado clasico.

Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. El codigo asociado al proyecto esta disponible en el repositorio https://github.com/thanhdath/core-db, que probablemente contiene los detalles de implementacion y entrenamiento, aunque su contenido no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de consultas SQL a partir de preguntas en lenguaje natural sobre esquemas de bases de datos (text-to-SQL).
- Especializacion en los benchmarks BIRD y Spider, que cubren consultas sobre esquemas complejos y bases de datos reales.
- Generacion de texto general heredada de la base Qwen2, aunque el ajuste fino esta orientado a SQL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (los idiomas no estan declarados en el repositorio).
- Capacidades especiales (vision, audio, thinking mode): no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Asistentes de consulta a bases de datos: el modelo traduce preguntas de usuarios no tecnicos a SQL ejecutable sobre el esquema proporcionado, lo que permite construir interfaces de chat sobre bases de datos relacionales sin que el usuario conozca SQL.
- Herramientas de analitica de autoservicio: integrado en un panel de BI, el modelo genera consultas a partir de preguntas como "ventas por region en el ultimo trimestre", reduciendo la dependencia del equipo de datos.
- Generacion de SQL en pipelines de datos: el modelo puede producir consultas para tareas ETL o validaciones automatizadas, y su tamano de 3B permite desplegarlo junto al pipeline sin grandes requisitos de GPU.
- Educacion y formacion en SQL: sirve como generador de ejemplos y soluciones de consultas sobre esquemas didacticos, util en plataformas de aprendizaje.
- Evaluacion de esquemas y documentacion: dado un esquema, el modelo puede generar consultas de ejemplo que ayuden a documentar el uso de tablas y relaciones.
- Agentes de datos multi-paso: aunque no se documenta soporte explicito de tool calling, el modelo puede emplearse como componente generador de SQL dentro de un agente orquestado externamente que gestione la ejecucion y la validacion de resultados.
- Prototipado rapido de APIs de datos: gracias a su licencia Apache 2.0 y su tamano contenido, es adecuado para prototipos y despliegues en entornos con recursos limitados.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Modelo | BIRD Dev (EX) | Spider Dev (EX) | Spider Dev (TS) | Spider Test (EX) |
|---|---:|---:|---:|---:|
| FINER-SQL-0.5B-v2 | 53,59 | 76,31 | 67,89 | 75,27 |
| FINER-SQL-1.5B-v2 | 63,82 | 79,98 | 72,44 | 81,79 |
| FINER-SQL-3B-v2 | 68,84 | 86,75 | 81,53 | 87,66 |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, ni comparaciones con modelos externos a la familia FINER-SQL.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB de VRAM para contexto moderado.
- Cuantizacion: no se documentan versiones cuantizadas en el repositorio, pero al ser un modelo Qwen2 de 3B es compatible con cuantizaciones GGUF/AWQ/GPTQ generadas por herramientas estandar.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 permite ejecutar el modelo en fp16 con margen amplio; una RTX 4060 Ti de 16 GB o una RTX 3060 de 12 GB son suficientes en fp16 o con cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 8 bits, y en tarjetas con 12 GB o mas en fp16.
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad con Qwen2, tambien vLLM, TGI, llama.cpp y Ollama previa conversion a los formatos correspondientes.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD Dev (EX) | Spider Dev (EX) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FINER-SQL-3B-v2 | 3,09B | no disponible | 68,84 | 86,75 | Apache 2.0 | Hugging Face |
| FINER-SQL-1.5B-v2 | no disponible | no disponible | 63,82 | 79,98 | Apache 2.0 | Hugging Face |
| FINER-SQL-0.5B-v2 | no disponible | no disponible | 53,59 | 76,31 | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos de otros modelos text-to-SQL externos a la familia FINER-SQL para una comparacion directa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: como todo modelo generativo, puede producir SQL sintacticamente valido pero semanticamente incorrecto o referenciar columnas y tablas inexistentes; se recomienda validacion y ejecucion controlada antes de usar las consultas en produccion.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada y los idiomas soportados no estan declarados; el ajuste fino esta orientado a la tarea text-to-SQL, por lo que su rendimiento en otras tareas puede degradarse.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, sin restricciones adicionales documentadas.
- Caveats para produccion: el modelo tiene 847 descargas y 0 likes, lo que indica una adopcion muy limitada y poca validacion externa; conviene auditar su comportamiento sobre el esquema concreto antes de desplegarlo. Ademas, la fecha de creacion registrada (2026-10-30) y la de actualizacion (2026-11-16) deben tratarse con cautela, ya que podrian reflejar metadatos anomalos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/thanhdath/FINER-SQL-3B-v2
- Repositorio de codigo: https://github.com/thanhdath/core-db
