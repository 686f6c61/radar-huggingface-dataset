# whileai/text-to-sql-shop-qwen3.5-9b-r3-step50-vllm

## Resumen

`text-to-sql-shop-qwen3.5-9b-r3-step50-vllm` es un adaptador LoRA (PEFT) publicado por el usuario `whileai` sobre el modelo base `Qwen/Qwen3.5-9B`. No es un modelo completo, sino un conjunto de pesos de ajuste fino (aproximadamente 0,1 GB, en formato safetensors) que debe cargarse sobre el modelo base para poder utilizarse. Su proposito concreto es la traduccion de lenguaje natural a SQL (text-to-SQL) sobre un esquema Postgres de tienda, generado de forma sembrada y reproducible.

El adaptador procede del checkpoint 50 de la ejecucion de entrenamiento `text-to-sql-shop-qwen35-9b-r3`, dentro de la receta `recipes/04-train/text-to-sql` del SDK `whileai-sdk`. El entrenamiento utiliza GRPO (Group Relative Policy Optimization) con una recompensa de coincidencia de ejecucion (execution-match), es decir, se premia que la consulta generada se ejecute correctamente y devuelva el resultado esperado contra el esquema de referencia, no solo que sea sintacticamente valida. El autor reporta un pass@1 de 0,838 en el conjunto de holdout en este checkpoint.

Su relevancia es acotada pero clara: es un ejemplo reproducible de ajuste fino por refuerzo para una tarea de traduccion semantica con verificacion automatica, con los rollouts de evaluacion publicados de forma independiente. El repositorio no incluye pesos fusionados, no documenta la longitud de contexto, los idiomas soportados ni los tipos de cuantizacion, y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (`Qwen/Qwen3.5-9B`); los detalles internos del modelo base no estan disponibles en la informacion proporcionada |
| Parametros totales | Unos 9B en el modelo base segun su denominacion; el adaptador ocupa aproximadamente 0,1 GB en safetensors. Recuento exacto de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no se documenta como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; al publicarse como pesos LoRA en safetensors, la cuantizacion aplicable depende del modelo base y del runtime, y no esta documentada |
| Idiomas soportados | No disponibles; el dataset y la tarea son de text-to-SQL y no se documenta cobertura multilingue |
| Licencia | apache-2.0 (segun la model card y los tags del repositorio) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica mediante PEFT sobre `Qwen/Qwen3.5-9B`, un transformer decoder-only del que la informacion disponible no detalla capas, dimension oculta, atencion ni ventana de contexto. El objeto publicado son exclusivamente los pesos de las matrices de bajo rango, no el modelo completo; el autor indica el uso mediante `PeftModel.from_pretrained` sobre el modelo base cargado con `AutoModelForCausalLM`.

El entrenamiento se realizo con GRPO, un algoritmo de optimizacion de politica con recompensa relativa por grupos de muestras. La recompensa es de execution-match sobre un esquema Postgres sembrado, lo que implica evaluar las consultas generadas ejecutandolas contra la base de datos y comparando el resultado, en lugar de usar solo similitud textual con el SQL de referencia. El dataset empleado es `zero-proof-ai/text-to-sql-shop` y el adaptador corresponde al checkpoint 50 de la ejecucion `text-to-sql-shop-qwen35-9b-r3`. El sufijo `vllm` del nombre indica que el checkpoint esta asociado a la configuracion de rollouts generados con vLLM; su configuracion de evaluacion es `eval-qwen3.5-9b-r3-step50-vllm` dentro del mismo dataset. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni fases adicionales de RLHF o DPO.

## Capacidades

- Traduccion de preguntas en lenguaje natural a consultas SQL sobre un esquema Postgres de tienda, que es la unica tarea documentada y evaluada.
- Razonamiento en texto plano: el resultado reportado corresponde a la plantilla por defecto, descrita como razonamiento en texto plano, sin modo de pensamiento explicito documentado.
- Optimizacion por recompensa de ejecucion: el modelo esta ajustado para producir SQL que se ejecute correctamente contra el esquema, no solo SQL formalmente valido.
- Capacidades heredadas del modelo base (generacion de texto general, codigo, matematicas, tool calling o agentes): no documentadas ni evaluadas en esta ficha, por lo que no deben asumirse como garantizadas.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Asistente de consultas sobre una base de datos de tienda: el adaptador traduce preguntas como "que productos se vendieron mas el mes pasado" a SQL ejecutable contra el esquema Postgres, con la ventaja de haber sido ajustado especificamente con recompensa de ejecucion sobre ese tipo de esquema.
- Analitica self-service para perfiles no tecnicos: integrarlo en una interfaz interna donde el usuario escribe en lenguaje natural y recibe una consulta SQL revisable antes de ejecutarse sobre una replica de solo lectura.
- Agente interno de soporte a operaciones: encadenar el adaptador como herramienta de generacion de SQL dentro de un pipeline mayor, donde el resultado se valida y se ejecuta contra una copia de la base de datos con permisos restringidos.
- Baseline reproducible para evaluacion de pipelines text-to-SQL: los rollouts de holdout del checkpoint estan publicados como configuracion del dataset, lo que permite comparar otros checkpoints o modelos contra un pass@1 de referencia de 0,838 en 140 tareas.
- Punto de partida para ajuste incremental: al ser un adaptador LoRA sobre un modelo base abierto, puede continuarse el entrenamiento con GRPO sobre un esquema propio, partiendo de un checkpoint ya especializado en la tarea.
- Generacion y revision de consultas en flujos de analitica de producto: producir consultas candidatas para informes recurrentes y someterlas a revision humana antes de incorporarlas a un repositorio de consultas versionadas.
- Formacion y soporte a equipos de datos: usar las consultas generadas como material de ejemplo para explicar como se traduce una pregunta de negocio a SQL sobre un esquema concreto.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalles |
|---|---|---|
| Holdout pass@1 (text-to-SQL, esquema Postgres sembrado) | 0,838 | 140 tareas, 4 muestras por tarea, plantilla por defecto (razonamiento en texto plano) |
| MMLU | No disponible | No publicados en la informacion proporcionada |
| HumanEval | No disponible | No publicados en la informacion proporcionada |
| GSM8K | No disponible | No publicados en la informacion proporcionada |
| Comparacion con modelos similares | No disponible | La model card no incluye comparativas con otros sistemas |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. El unico dato de rendimiento aportado es el pass@1 de holdout indicado, que procede del propio autor y no ha sido verificado de forma independiente.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano del modelo base (unos 9B de parametros) y no provienen de la model card, que no publica requisitos de hardware.

- VRAM estimada para inferencia (modelo base mas adaptador): en bf16/fp16, en torno a 18-22 GB de pesos y estado del runtime; en cuantizacion de 8 bits, aproximadamente 10-12 GB; en cuantizacion de 4 bits, aproximadamente 6-8 GB. Estas cifras no incluyen la memoria de la cache KV y crecen con la longitud de contexto.
- GPUs recomendadas: A100 (40 o 80 GB), H100, L40S (48 GB) o similares para servicio en bf16 con margen; A100 40 GB es suficiente para el modelo base en bf16 con contextos moderados.
- Cabe en GPU de consumo: si. En RTX 3090 o RTX 4090 (24 GB) es viable en bf16 con contextos cortos y ajustando el uso de memoria, y comodo en cuantizacion de 4 u 8 bits. En tarjetas de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super) es recomendable cuantizacion de 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, puede servirse con transformers mas PEFT; el sufijo `vllm` del checkpoint sugiere uso con vLLM, que admite adaptadores LoRA; tambien es posible fusionar el adaptador con el modelo base y servir con llama.cpp u Ollama (requiere conversion a GGUF, no incluida en el repositorio) o con TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`whileai/text-to-sql-shop-qwen3.5-9b-r3-step50-vllm`) | Base de ~9B mas adaptador LoRA de ~0,1 GB | No disponible | pass@1 de 0,838 en holdout propio (140 tareas, 4 muestras) | apache-2.0 | HuggingFace; 0 descargas y 0 valoraciones en el momento de la consulta |
| `Qwen/Qwen3.5-9B` (modelo base sin adaptador) | Unos 9B | No disponible en la informacion proporcionada | No disponible para esta tarea en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otros fine-tunes de text-to-SQL de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos que permitan una comparacion cuantitativa con alternativas de la misma categoria. Cualquier comparacion deberia realizarse replicando la evaluacion sobre la misma configuracion de holdout publicada en `zero-proof-ai/text-to-sql-shop`, con las mismas 140 tareas y 4 muestras por tarea.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y cargar `Qwen/Qwen3.5-9B` por separado, con su propio coste de almacenamiento y memoria.
- Alcance muy restringido: esta ajustado para text-to-SQL sobre un esquema Postgres sembrado de tienda. El rendimiento en otros esquemas, dialectos SQL (MySQL, T-SQL, SQLite) o dominios distintos no esta documentado y puede degradarse notablemente.
- Riesgo de sobreajuste al esquema de entrenamiento: el pass@1 de 0,838 se ha medido en el holdout del propio dataset y no aporta evidencia sobre generalizacion a bases de datos reales con nombres de tablas y columnas no vistos.
- Riesgo de alucinacion estructural: el modelo puede generar tablas, columnas o funciones inexistentes. Aunque la recompensa de ejecucion reduce este fallo, no lo elimina, y una consulta puede ejecutarse correctamente y devolver un resultado incorrecto para la intencion del usuario.
- Seguridad en produccion: ejecutar SQL generado por un modelo contra una base de datos real exige una replica de solo lectura, permisos minimos, limites de tiempo y recursos por consulta, y validacion de la sentencia. No se documentan salvaguardas de este tipo en el repositorio.
- Trazabilidad y verificacion: el repositorio no registra descargas ni valoraciones, y el resultado de rendimiento procede unicamente del autor, sin evaluacion independiente.
- Coherencia de nombres y autoría: la model card referencia el repositorio `zero-proof-ai/...` mientras que el identificador consultado pertenece al usuario `whileai`, lo que conviene verificar antes de fijar una dependencia en produccion.
- Idiomas, contexto y cuantizacion sin documentar: no hay datos sobre cobertura multilingue, longitud maxima de contexto ni cuantizaciones soportadas o validadas, lo que dificulta el dimensionamiento del despliegue.
- Licencia: el adaptador se declara bajo apache-2.0, pero no se aporta la licencia del modelo base ni se detallan condiciones de uso comercial del dataset `zero-proof-ai/text-to-sql-shop`. Debe comprobarse antes de un uso comercial.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/whileai/text-to-sql-shop-qwen3.5-9b-r3-step50-vllm
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/zero-proof-ai/text-to-sql-shop
- Receta de entrenamiento text-to-SQL del SDK: https://github.com/whilehq/whileai-sdk/tree/main/recipes/04-train/text-to-sql
- Repositorio del SDK: https://github.com/whilehq/whileai-sdk

Nota: los resultados de busqueda web disponibles no contienen enlaces relevantes sobre este modelo; el contenido recuperado corresponde a paginas no relacionadas con text-to-SQL ni con el autor. No se han localizado por esa via papers, blogs ni demos adicionales.
