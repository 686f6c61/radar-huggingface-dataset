# Vakamalla123-Anitha/oracle19c-nl2sql-granite-4.1-3b-gguf

## Resumen

El modelo `oracle19c-nl2sql-granite-4.1-3b-gguf` es un ajuste fino de tarea especifica publicado por el usuario Vakamalla123-Anitha sobre la base IBM Granite 4.1 3B Instruct. Su objetivo es la traduccion de lenguaje natural a SQL (NL2SQL) para el motor Oracle 19c, un caso de uso clasico en entornos empresariales donde los analistas necesitan consultar bases de datos sin dominar el dialecto SQL de Oracle ni el esquema subyacente.

El modelo se distribuye exclusivamente en formato GGUF, lo que lo hace desplegable en llama.cpp, Ollama y LM Studio sin necesidad de GPU de datacenter. Con aproximadamente 3.400 millones de parametros, es una opcion ligera para integrarse en asistentes de consulta sobre bases de datos Oracle, catalogos de datos o herramientas internas de analitica.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin model card sustantiva mas alla de la declaracion de licencia. La informacion tecnica disponible procede casi integramente de la variante LoRA hermana del mismo autor, no del artefacto GGUF en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de IBM Granite 4.1 3B Instruct) |
| Parametros totales | 3.402.836.480 (~3,4 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; cuantizacion concreta no confirmada (el repositorio ocupa 2,1 GB, compatible con Q4_K_M o similar) |
| Idiomas soportados | No disponible (la familia Granite 4.1 esta orientada principalmente a ingles; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de un transformer denso, sin mezcla de expertos ni mecanismos de estado recurrente, dado que deriva de la familia Granite 4.1 de IBM, descrita como densa en tamanos de 3B, 8B y 30B. El proceso de ajuste, segun los datos publicados para la variante LoRA del mismo autor, consistio en QLoRA de 4 bits con cuantizacion NF4 y doble cuantizacion sobre PEFT LoRA, con aprendizaje supervisado durante una sola epoca. El conjunto de entrenamiento sumo 3.200 ejemplos: 2.800 pares NL→SQL especificos de Oracle y 400 ejemplos de repeticion (replay) de SQL generico, con 350 ejemplos de validacion. No se documenta el volumen de tokens de entrenamiento ni el uso de RLHF o DPO.

La innovacion principal no esta en la arquitectura, sino en la especializacion del dataset: el sesgo hacia Oracle 19c y la inclusion de ejemplos de replay para mitigar el olvido catastrofico del SQL generico. No hay constancia de tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento explicito en la informacion disponible. Tampoco se especifican hiperparametros completos (tasa de aprendizaje, rango LoRA, alpha) ni los pasos de entrenamiento totales.

## Capacidades

- Generacion de sentencias SQL a partir de descripciones en lenguaje natural, con enfasis en el dialecto de Oracle 19c.
- Traduccion de consultas sobre esquemas relacionales, presumiblemente incluyendo joins, filtros y agregaciones propias del modelo de datos Oracle.
- Conservacion de competencia general en SQL gracias a los 400 ejemplos de replay, util para consultas no especificas de Oracle.
- Conversacion multiturno basica, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints de inferencia, segun la etiqueta `endpoints_compatible` del repositorio.
- Soporte de tool calling, function calling y razonamiento multi-paso: no confirmado para este ajuste fino; la familia base Granite 4.1 declara mejoras en uso de herramientas e instrucciones, pero el autor no verifica su conservacion tras el ajuste.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponibles.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente de consulta para analistas de negocio: el modelo convierte preguntas en castellano o ingles ("ventas por region en el ultimo trimestre") en SQL ejecutable contra un esquema Oracle 19c, reduciendo la dependencia del equipo de datos para consultas recurrentes.
- Generacion de informes automatizados: integrado en un pipeline que traduce plantillas de lenguaje natural a consultas SQL, permite generar informes periodicos sin escribir vistas materializadas a mano.
- Aceleracion del onboarding de desarrolladores: un ingeniero nuevo en el esquema puede describir lo que necesita y obtener una primera version de la consulta como punto de partida, que despues revisa y corrige.
- Migracion y refactorizacion de consultas: dado que el ajuste esta sesgado a Oracle, sirve para traducir pseudocodigo o SQL de otros dialectos a Oracle 19c, aunque conviene validar el resultado manualmente.
- Chatbot interno de soporte a bases de datos: desplegado en Ollama o llama.cpp sobre una estacion de trabajo, responde dudas sobre como formular consultas sin enviar datos ni esquemas a servicios externos.
- Generacion de consultas en herramientas de BI: sirve como capa de traduccion entre el lenguaje natural del usuario y el motor SQL subyacente en un cuadro de mando.
- Prototipado rapido de APIs de datos: permite exponer consultas por lenguaje natural en un servicio interno ligero, aprovechando el reducido consumo de recursos del modelo cuantizado.
- Educacion y formacion en SQL: util como generador de ejemplos de consultas Oracle para material didactico, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con metricas, y los resultados de busqueda solo aportan detalles de configuracion del entrenamiento (3.200 ejemplos, 1 epoca, validacion de 350 ejemplos) sin cifras de evaluacion. No procede inventar valores de MMLU, HumanEval, GSM8K ni de ejecucion exacta de SQL.

## Requisitos de hardware

- VRAM estimada (inferencia, calculo a partir de 3,4 mil millones de parametros):
  - Cuantizacion Q4_K_M: aproximadamente 2,1 GB de pesos, en torno a 2,5-3 GB de VRAM con overhead de contexto.
  - Cuantizacion Q8_0: aproximadamente 3,6 GB de pesos, en torno a 4-4,5 GB de VRAM.
  - Precision FP16: aproximadamente 6,8 GB de pesos, en torno a 8 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM es suficiente en cuantizaciones de 4-8 bits (RTX 3060, RTX 4060, RTX 4070, RTX 4090). En entornos de servidor, una A100 o H100 esta sobredimensionada para este tamano y solo se justifica por agregacion de muchas instancias en paralelo.
- Ejecucion en CPU: viable en cuantizacion Q4_K_M con 4-8 GB de RAM, con latencias mayores.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio son las rutas naturales al distribuirse en GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan convertir los pesos a safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| oracle19c-nl2sql-granite-4.1-3b-gguf | ~3,4B | No disponible | NL2SQL sobre Oracle 19c | Apache 2.0 | GGUF |
| oracle19c-nl2sql-granite-4.1-3b-lora | ~3,4B | No disponible | NL2SQL sobre Oracle 19c | Apache 2.0 | Safetensors (adaptador LoRA) |
| IBM Granite 4.1 3B Instruct | ~3B | No disponible | Instrucciones generales, codigo y matematicas | Apache 2.0 | Safetensors y GGUF |
| IBM Granite 4.2 30B | ~30B | No disponible | Instrucciones generales | Apache 2.0 | GGUF (distribucion via Ollama) |

La comparativa se limita a modelos de la propia familia Granite porque no se dispone de datos de rendimiento que permitan contrastar con alternativas de otros fabricantes, como Qwen o Llama, en la misma tarea.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: el README del repositorio solo contiene la declaracion de licencia, sin documentacion de uso, esquema de entrada o formato de prompt.
- Riesgo elevado de alucinacion de esquema: el modelo puede generar nombres de tablas y columnas plausibles pero inexistentes, algo especialmente peligroso en SQL donde una consulta valida sintacticamente puede devolver datos incorrectos o fallar.
- Entrenamiento de una sola epoca sobre 3.200 ejemplos: volumen bajo para una tarea de dominio y con riesgo de sobreajuste al conjunto de entrenamiento.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- Idiomas no declarados: no se puede asumir buen rendimiento en castellano; el entrenamiento, segun los datos de la variante LoRA, parece orientado al ingles.
- Contexto no declarado: imposible planificar consultas sobre esquemas largos o conversaciones extensas sin conocer la ventana real.
- Sin benchmarks: no hay ninguna metrica publica de exactitud de ejecucion, coincidencia exacta ni robustez ante esquemas desconocidos.
- Licencia Apache 2.0: permisiva y apta para uso comercial, pero no cubre las obligaciones derivadas del uso de productos Oracle ni la verificacion de que el dataset de entrenamiento no incluya material con restricciones.
- Recomendacion operativa: validar siempre la consulta generada contra el esquema real antes de ejecutarla, y evitar conceder permisos de escritura al usuario de base de datos que la ejecute.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vakamalla123-Anitha/oracle19c-nl2sql-granite-4.1-3b-gguf
- Variante LoRA del mismo autor: https://huggingface.co/Vakamalla123-Anitha/oracle19c-nl2sql-granite-4.1-3b-lora
- Ficha de la variante LoRA en FriendliAI: https://friendli.ai/models/Vakamalla123-Anitha/oracle19c-nl2sql-granite-4.1-3b-lora
- Pagina de Granite 4.1 en LM Studio: https://lmstudio.ai/models/granite-4.1
- Granite 4.2 30B en Ollama: https://ollama.com/library/granite4.2:30b
- Guia de despliegue local de Granite 4.1: https://www.aimadetools.com/blog/how-to-run-granite-4-1-locally/
