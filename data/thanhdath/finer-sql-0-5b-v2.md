# thanhdath/FINER-SQL-0.5B-v2

## Resumen

FINER-SQL-0.5B-v2 es un modelo de generacion de SQL especializado, desarrollado por el autor thanhdath y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino sobre la arquitectura Qwen2 con 494.032.768 parametros totales (aproximadamente 0,5 mil millones), disenado especificamente para la tarea de text-to-SQL: convertir preguntas en lenguaje natural en consultas SQL ejecutables sobre esquemas de bases de datos.

El modelo forma parte de una familia de tres tamanos (0.5B, 1.5B y 3B) que comparten la misma estrategia de entrenamiento y evaluacion. Su relevancia actual radica en que demuestra que un modelo de menos de 500 millones de parametros puede alcanzar resultados competitivos en los benchmarks BIRD y Spider, lo que lo convierte en una opcion atractiva para despliegues con recursos limitados, entornos de baja latencia o inferencia en GPU de consumo.

La informacion disponible sobre el modelo es escasa: la model card se limita a presentar una tabla comparativa de resultados en benchmarks y un enlace al repositorio de codigo, sin detallar la composicion del dataset de entrenamiento, el proceso de ajuste fino ni las capacidades multilingues. Esta ficha refleja fielmente esa limitacion, marcando como "no disponible" todo dato que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, segun se deduce de la etiqueta `qwen2` del repositorio. Con 494 millones de parametros, se situa en la gama de modelos compactos, pensados para inferencia eficiente. No se dispone de informacion sobre la configuracion exacta de capas, dimensiones ocultas, numero de cabezas de atencion ni vocabulario.

En cuanto al entrenamiento, la model card no documenta el numero de tokens utilizados, la composicion del dataset de ajuste fino, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. Dado el caracter especializado del modelo (text-to-SQL), es razonable inferir un ajuste fino supervisado sobre pares pregunta-SQL, probablemente derivados de los esquemas de BIRD y Spider, pero esto no esta confirmado en la informacion disponible. Tampoco se documentan innovaciones tecnicas como decodificacao especulativa o atencion lineal.

## Capacidades

- Generacion de consultas SQL a partir de instrucciones en lenguaje natural (text-to-SQL), incluyendo esquemas complejos con multiples tablas y joins.
- Razonamiento sobre esquemas de bases de datos y correspondencia entre terminos del lenguaje natural y columnas/tablas.
- Evaluado en los benchmarks BIRD y Spider, tanto en metrica de ejecucion exacta (EX) como en exactitud de conjunto de resultados (TS).
- Formato de pesos compatible con `transformers`, lo que permite su integracion en pipelines estandar de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- **Asistentes de consulta a bases de datos en produccion**: el modelo puede transformar preguntas de usuarios en SQL ejecutable sobre esquemas conocidos, con un coste de inferencia muy bajo gracias a sus 494M de parametros, adecuado para servicios con alta concurrencia.
- **Herramientas internas de analytics para equipos no tecnicos**: integrado en un panel o chatbot, permite a analistas de negocio formular consultas sin conocer el esquema, reduciendo la dependencia del equipo de datos.
- **Pipelines de generacion de SQL en CI/CD de datos**: puede emplearse para generar y validar consultas candidatas contra un entorno de staging antes de desplegarlas, aprovechando su tamano reducido para ejecutar en runners modestos.
- **Despliegue en GPU de consumo o CPU**: al ser un modelo de 0,5B, cabe en tarjetas con poca VRAM (por ejemplo, RTX 3060 de 12 GB o incluso 8 GB con cuantizacion) y permite inferencia local en estaciones de trabajo de desarrolladores.
- **Sistemas de text-to-SQL con restricciones de latencia**: en escenarios donde el tiempo de respuesta es critico (autocompletado de consultas, interfaces de exploracion de datos), un modelo pequeno reduce la latencia frente a alternativas de mayor tamano.
- **Generacion de SQL como componente de un agente mayor**: el modelo puede actuar como subcomponente especializado dentro de un sistema multi-agente orquestado por un LLM mayor, encargandose exclusivamente de la traduccion a SQL.
- **Investigacion y experimentacion en text-to-SQL**: sirve como linea base ligera para comparar tecnicas de ajuste fino, prompting o decodificacion restringida en tareas de generacion de consultas.

## Benchmarks y rendimiento

Resultados publicados en la model card (metrica EX = execution accuracy, TS = test-suite accuracy):

| Modelo | BIRD Dev (EX) | Spider Dev (EX) | Spider Dev (TS) | Spider Test (EX) |
|---|---:|---:|---:|---:|
| FINER-SQL-0.5B-v2 | 53.59 | 76.31 | 67.89 | 75.27 |
| FINER-SQL-1.5B-v2 | 63.82 | 79.98 | 72.44 | 81.79 |
| FINER-SQL-3B-v2 | 68.84 | 86.75 | 81.53 | 87.66 |

No se han publicado resultados de benchmarks frente a modelos de otros autores en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: con pesos en FP16 (aproximadamente 1 GB para 494M de parametros) el modelo requiere en torno a 1-2 GB de VRAM para inferencia, incluyendo cache KV para contextos moderados. La estimacion exacta depende de la longitud de contexto, que no esta documentada.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura. Tambien es viable en CPU para cargas de baja concurrencia.
- **Consumer GPU**: si, cabe en practicamente cualquier GPU de consumo actual e incluso en iGPU con memoria unificada.
- **Opciones de despliegue**: `transformers` (libreria declarada en el repositorio), vLLM y TGI para servicio de alta concurrencia, llama.cpp/Ollama si se generan pesos GGUF (no documentados por el autor). El repositorio solo publica safetensors.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD Dev (EX) | Spider Dev (EX) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| FINER-SQL-0.5B-v2 | 494M | no disponible | 53.59 | 76.31 | Apache 2.0 | Hugging Face |
| FINER-SQL-1.5B-v2 | no disponible | no disponible | 63.82 | 79.98 | no disponible | Hugging Face (familia del mismo autor) |
| FINER-SQL-3B-v2 | no disponible | no disponible | 68.84 | 86.75 | no disponible | Hugging Face (familia del mismo autor) |

La comparativa con modelos de otros autores (por ejemplo, alternativas especializadas en text-to-SQL de la comunidad) no esta disponible en la informacion proporcionada. La comparacion mas directa es con los otros dos tamanos de la misma familia, que muestran una progresion clara: el salto de 0.5B a 1.5B aporta unos 10 puntos en BIRD Dev y 3,7 en Spider Dev, mientras que el salto a 3B anade otros 5 puntos en BIRD Dev y casi 7 en Spider Dev.

## Limitaciones y advertencias

- **Documentacion muy escasa**: la model card no describe el dataset de entrenamiento, el proceso de ajuste, los idiomas soportados ni la longitud de contexto, lo que dificulta evaluar su robustez fuera de los benchmarks reportados.
- **Riesgo de alucinacion en SQL**: como todo modelo generativo, puede producir consultas sintacticamente validas pero semanticamente incorrectas, o referenciar tablas y columnas inexistentes; se recomienda validacion contra el esquema y ejecucion en entorno controlado.
- **Especializacion estrecha**: el modelo esta optimizado para text-to-SQL; su rendimiento en tareas generales de generacion de texto, razonamiento o codigo no esta documentado y probablemente sea limitado.
- **Brecha frente a modelos mayores**: en BIRD Dev, el 0.5B obtiene 53.59 frente a 68.84 del 3B; para esquemas complejos o preguntas ambiguas, el modelo pequeno puede quedarse corto.
- **Sesgos**: no se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset, por lo que no pueden evaluarse.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento subyacentes (BIRD y Spider tienen sus propias licencias y terminos de uso), que no se detallan en la model card.
- **Formato de pesos unico**: solo se publican safetensors; no hay variantes cuantizadas oficiales, por lo que el despliegue con llama.cpp/Ollama requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanhdath/FINER-SQL-0.5B-v2
- Repositorio de codigo: https://github.com/thanhdath/core-db
- Benchmark BIRD: https://bird-bench.github.io/
- Benchmark Spider: https://yale-lily.github.io/spider
