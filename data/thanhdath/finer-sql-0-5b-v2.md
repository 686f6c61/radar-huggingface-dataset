# thanhdath/FINER-SQL-0.5B-v2

## Resumen

FINER-SQL-0.5B-v2 es un modelo de generacion de texto especializado en text-to-SQL desarrollado por thanhdath. Se trata de un ajuste fino del modelo base Qwen2 de 0,5B parametros (494.032.768 parametros exactos segun los pesos en safetensors), entrenado mediante GRPO (Group Relative Policy Optimization) con una recompensa compuesta de formato y ejecucion sobre CoRE-DB, un entorno de base de datos compacto enriquecido con contraejemplos descrito en el trabajo *Small Language Models for Text-to-SQL against Spurious Correctness*.

El modelo resuelve un problema concreto: la generacion de consultas SQL correctas a partir de lenguaje natural en modelos pequenos, abordando el fenomeno de la "correccion espuria" (consultas que devuelven resultados plausibles pero semanticamente incorrectas). El checkpoint publicado corresponde al paso 6750, seleccionado sobre el conjunto de desarrollo.

Su relevancia actual radica en que demuestra que un modelo de apenas 0,5B parametros puede alcanzar resultados competitivos en benchmarks de text-to-SQL (53,59 de exactitud de ejecucion en BIRD dev y 76,31 en Spider dev) cuando se entrena con refuerzo basado en recompensas de ejecucion, lo que lo hace desplegable en hardware muy modesto. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de transformers/GGUF, no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2, un transformer decoder-only denso con atencion causal estandar y normalizacion RMSNorm, en su variante de aproximadamente 0,5B parametros. No incorpora mecanismos de mezcla de expertos ni atencion lineal; es un modelo denso convencional optimizado para generacion autoregresiva.

El entrenamiento consiste en un ajuste continuado mediante GRPO sobre CoRE-DB, el entorno compacto con contraejemplos del trabajo *Small Language Models for Text-to-SQL against Spurious Correctness*. La funcion de recompensa combina un componente de formato y un componente de ejecucion (execution reward), de modo que el modelo aprende a producir consultas que no solo se ajustan al formato esperado sino que se ejecutan correctamente contra la base de datos. El checkpoint publicado es el paso 6750, seleccionado por rendimiento en el conjunto de desarrollo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases adicionales de SFT o DPO.

## Capacidades

- Generacion de consultas SQL a partir de instrucciones en lenguaje natural (text-to-SQL), orientada a esquemas de bases de datos relacionales.
- Razonamiento sobre esquemas y contexto conversacional, segun la etiqueta `conversational` del repositorio.
- Entrenamiento con recompensa de ejecucion, lo que favorece consultas ejecutables y semanticamente correctas frente a soluciones espurias.
- Generacion de texto general heredada del modelo base Qwen2 (pipeline `text-generation`).
- Compatibilidad con Text Generation Inference y endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo traduce preguntas en lenguaje natural a SQL sobre un esquema conocido, reduciendo el tiempo de escritura manual de consultas en herramientas de BI internas.
- Integracion en pipelines de analitica self-service: se puede desplegar como servicio de generacion de SQL detras de una interfaz de chat, aprovechando su tamano reducido para responder con baja latencia en CPU o GPU modesta.
- Generacion de consultas en entornos con recursos limitados: al ocupar aproximadamente 1 GB en precision completa y menos con cuantizacion, es viable en instancias pequenas o dispositivos edge donde modelos de 7B o mas no caben.
- Evaluacion y validacion de esquemas: el modelo puede generar consultas de comprobacion para verificar que un esquema soporta las preguntas de negocio esperadas antes de desplegar una base de datos.
- Educacion y formacion en SQL: sirve como generador de ejemplos de consultas a partir de enunciados, util en plataformas de aprendizaje que necesitan retroalimentacion inmediata.
- Componente de un sistema mayor de agentes de datos: puede actuar como submodulo especializado de traduccion a SQL dentro de un pipeline orquestado, donde un modelo mayor planifica y este ejecuta la generacion concreta.
- Prototipado rapido de interfaces conversacionales sobre bases de datos: gracias a su licencia Apache 2.0 y su tamano, permite iterar en prototipos comerciales sin coste de licencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (k = 30 muestras, T = 1.0, seleccion vote-after-verify, evaluadores oficiales, prompts de `thanhdath/core-db-evaluation-prompts`):

| Benchmark | Metrica | Resultado |
|---|---|---|
| BIRD dev | Exactitud de ejecucion (EX) | 53,59 |
| Spider dev | Exactitud de ejecucion (EX) | 76,31 |
| Spider dev | Exactitud de test-suite (TS) | 67,89 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos (494M parametros), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 2,5 GB segun longitud de secuencia y batch.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 0,5-1 GB; con 4 bits, por debajo de 0,5 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en GPU de gama baja y en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU con rendimiento aceptable para uso interactivo.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles; llama.cpp y Ollama no estan confirmados por el autor pero son viables si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados comparativos directos con otros modelos de text-to-SQL del mismo tamano. A continuacion se comparan caracteristicas estructurales con alternativas habituales de la categoria, sin datos de rendimiento verificados para ellas en este contexto:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| FINER-SQL-0.5B-v2 | 494M | no disponible | Qwen2 + GRPO sobre CoRE-DB | Apache 2.0 |
| Qwen2.5-Coder-0.5B | ~494M | 32K (segun documentacion publica del modelo base) | Modelo base de codigo, sin ajuste especifico de text-to-SQL | Apache 2.0 |
| Modelos text-to-SQL de 7B (p. ej. variantes de CodeLlama) | ~7B | variable | Ajuste supervisado sobre Spider/BIRD | variable |

La comparacion de rendimiento frente a estas alternativas no esta disponible en la informacion proporcionada; los unicos datos verificados son los benchmarks del propio modelo en BIRD dev y Spider dev.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste con GRPO sobre CoRE-DB puede degradar capacidades generales de generacion de texto del modelo base; no esta pensado como modelo de proposito general.
- Riesgo de alucinacion de esquemas: como todo modelo text-to-SQL, puede referenciar tablas o columnas inexistentes si el esquema no se proporciona de forma explicita y completa en el prompt.
- Correccion espuria: aunque el entrenamiento con recompensa de ejecucion mitiga este fenomeno, no lo elimina por completo; las consultas pueden ejecutarse sin error y devolver resultados incorrectos.
- Idiomas soportados no declarados: la model card no especifica idiomas; se desconoce el rendimiento en castellano o en instrucciones multilingues.
- Longitud de contexto no declarada: se desconoce la ventana efectiva, lo que limita la planificacion para esquemas de base de datos grandes.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Madurez: el repositorio tiene 171 descargas y 0 likes, lo que sugiere validacion externa limitada; conviene evaluar en el dominio propio antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanhdath/FINER-SQL-0.5B-v2
- Prompts de evaluacion: https://huggingface.co/thanhdath/core-db-evaluation-prompts
- Repositorio de codigo `core-db-sql` en GitHub: no disponible como URL directa en la informacion proporcionada
- Paper *Small Language Models for Text-to-SQL against Spurious Correctness*: no disponible como URL directa en la informacion proporcionada
