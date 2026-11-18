# vennyvirtuoso/qwen2.5-0.5b-text-to-sql

## Resumen

`qwen2.5-0.5b-text-to-sql` es un adaptador LoRA (PEFT) publicado por el usuario vennyvirtuoso sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su proposito es especializar un modelo de lenguaje muy pequeno (0,5 mil millones de parametros) en la tarea de text-to-SQL: dada una consulta en lenguaje natural y el DDL de un esquema de base de datos, generar la sentencia SQL correspondiente. El adaptador se entrena sobre el dataset sintetico gretelai/synthetic_text_to_sql.

El modelo resuelve el problema de ejecutar traduccion lenguaje natural a SQL en entornos con recursos muy limitados (edge, microservicios, agentes locales) donde no es viable llamar a APIs de modelos frontera. La propuesta del autor es un "parser semantico" ultracompacto con latencia baja y licencia permisiva Apache 2.0, pensado para despliegues de alto throughput o en hardware modesto.

La relevancia actual reside en su tamano: un adaptador LoRA sobre un modelo de 0,5B permite ejecutar text-to-SQL en CPU o GPUs consumer, algo que modelos especializados de mayor tamano no permiten. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y no se han publicado resultados en benchmarks estandar como Spider o BIRD; las unicas metricas disponibles son de perplexity y loss sobre el split de test del propio dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-0.5B-Instruct, valor no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (el autor menciona mixed precision bfloat16/fp16 para entrenamiento; no se listan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El adaptador se sirve mediante la libreria `peft` y se combina en tiempo de inferencia con el checkpoint base en precision mixta (bfloat16/fp16). No se especifica el rango del LoRA, los modulos objetivo ni el numero de parametros entrenables del adaptador.

El entrenamiento se realizo sobre el dataset sintetico gretelai/synthetic_text_to_sql durante 2 epocas (3.126 pasos de optimizacion), con un throughput de 17,68 muestras por segundo. El autor reporta evaluacion sobre un split de test retenido de 1.500 consultas con dominios no vistos (gaming technology, rural development, sustainable infrastructure), lo que sugiere una particion disjunta por dominio. No se detalla la composicion exacta del dataset, el regimen de RLHF/DPO ni hiperparametros de entrenamiento (learning rate, batch size, rango LoRA).

## Capacidades

- Generacion de SQL a partir de lenguaje natural y DDL de esquema (text-to-SQL).
- Soporte de dialecto SQLite, segun las etiquetas del repositorio.
- Generacion de codigo orientada a consultas de base de datos.
- Formato conversacional mediante chat template de Qwen2.5 (roles system/user/assistant).
- Inferencia determinista recomendada por el autor (temperature 0.1, do_sample=False).
- Capacidad multilingue: no disponible (no se documenta).
- Tool calling / function calling: no documentado para este adaptador.
- Razonamiento multi-paso y modo thinking: no documentado.
- Vision, audio: no soportado.

## Casos de uso

- Generacion de SQL en microservicios de baja latencia: al ser un adaptador sobre un modelo de 0,5B, puede desplegarse en contenedores pequenos o en CPU para traducir preguntas de usuario a consultas SQL sin depender de APIs externas.
- Agentes locales de analisis de datos: integrado como herramienta de ejecucion en agentes autonomos que operan en el edge, donde el coste de llamar a un modelo frontera es prohibitivo.
- Asistentes de BI embebidos: un chatbot dentro de una herramienta de business intelligence que traduce preguntas de negocio a SQL sobre el esquema cargado en el prompt.
- Pre-filtrado en pipelines RAG sobre bases de datos: el modelo puede generar la consulta SQL inicial que recupera filas candidatas antes de un ranking posterior mas costoso.
- Educacion y formacion en SQL: generar consultas de referencia a partir de enunciados en lenguaje natural para comparar con la solucion del estudiante.
- Prototipado rapido de interfaces naturales sobre bases de datos legacy: dado el DDL de tablas existentes, exponer una capa de consulta en lenguaje natural sin reescribir la capa de datos.
- Evaluacion de esquemas en CI: generar consultas de prueba automaticas a partir de descripciones de requisitos para validar que el esquema soporta los casos de uso previstos.

## Benchmarks y rendimiento

| Metrica | Base zero-shot | Fine-tuned | Reduccion relativa |
|---|---|---|---|
| Perplexity (test retenido) | 7,45 | 1,62 | -78,2% |
| Loss (test retenido) | 2,0077 | 0,4837 | -75,9% |

Datos adicionales reportados por el autor: 1.500 consultas en el split de test, dominios no vistos (gaming technology, rural development, sustainable infrastructure), 2 epocas de entrenamiento (3.126 pasos), throughput de 17,68 muestras/s.

No se han publicado resultados en benchmarks estandar de text-to-SQL (Spider, BIRD, WikiSQL) en la informacion disponible. La perplexity y la loss no son metricas de exactitud de ejecucion SQL, por lo que no permiten comparar directamente con otros modelos de la tarea.

## Requisitos de hardware

- VRAM estimada: el modelo base en bfloat16 ocupa aproximadamente 1 GB de pesos; con overhead de activaciones y KV cache, la inferencia cabe holgadamente en GPUs con 2-4 GB de VRAM. En cuantizacion de 8 bits o 4 bits (si se generara a partir del base) cabria en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100/H100 para serving de alta concurrencia, aunque sobredimensionadas para el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM; tambien en CPU.
- Opciones de despliegue: `transformers` + `peft` (referencia del autor), vLLM, Hugging Face TGI, ONNX Runtime y TensorRT-LLM (mencionados por el autor). llama.cpp/Ollama no estan documentados para este adaptador, aunque serian viables fusionando el adaptador con el base y convirtiendo a GGUF.
- Latencia y throughput: no se publican mediciones de latencia de inferencia; solo el throughput de entrenamiento (17,68 muestras/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-text-to-sql (este) | 0,5B (base) + LoRA | no disponible | Adaptador LoRA text-to-SQL | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | Modelo generalista | Apache 2.0 | Hugging Face |
| Modelos text-to-SQL especializados de mayor tamano (p. ej. familia CodeLlama/SQLCoder) | 7B-34B | variable | Fine-tuning completo o LoRA | variable | Hugging Face |

No se dispone de datos de benchmarks comparables (Spider/BIRD) para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a tamano, licencia y enfoque.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: la capacidad de razonamiento y de manejar esquemas complejos o consultas con multiples joins es limitada en comparacion con modelos de 7B o superiores.
- No se han publicado resultados en benchmarks estandar de text-to-SQL (Spider, BIRD); las metricas reportadas son de perplexity y loss, que no miden exactitud de ejecucion.
- El entrenamiento se realizo sobre un dataset sintetico (gretelai/synthetic_text_to_sql); el rendimiento sobre esquemas reales de produccion puede degradarse.
- El autor solo documenta dialecto SQLite; otros dialectos (PostgreSQL, MySQL, T-SQL) no estan validados.
- Riesgo de alucinacion: puede generar columnas o tablas inexistentes en el esquema proporcionado; se recomienda validacion del SQL generado antes de su ejecucion.
- Idiomas soportados no documentados; el comportamiento en castellano no esta verificado.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, sin issues reportados ni mantenimiento conocido.
- No se documenta el rango LoRA, los modulos objetivo ni los hiperparametros de entrenamiento, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-0.5B-Instruct conviene verificar las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/qwen2.5-0.5b-text-to-sql
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- vLLM: https://github.com/vllm-project/vllm
- Hugging Face TGI: https://github.com/huggingface/text-generation-inference
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
