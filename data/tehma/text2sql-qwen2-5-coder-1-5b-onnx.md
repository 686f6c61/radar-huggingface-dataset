# Tehma/text2sql-qwen2.5-coder-1.5b-onnx

## Resumen

Tehma/text2sql-qwen2.5-coder-1.5b-onnx es un ajuste fino QLoRA de Qwen2.5-Coder-1.5B-Instruct especializado en traduccion de lenguaje natural a SQL (text-to-SQL), exportado a formato ONNX con cuantizacion q4f16 para ejecucion en navegador mediante Transformers.js y WebGPU. El modelo parte de la arquitectura Qwen2 (transformer denso de 1.500 millones de parametros) y ha sido entrenado sobre el conjunto de datos Spider, un benchmark academico de consultas SQLite sobre esquemas relacionales multi-tabla en ingles.

La relevancia de esta ficha reside en su caracter de ejemplo de despliegue edge: no se distribuye como pesos PyTorch convencionales, sino como un grafo ONNX de 877 MB pensado para inferencia local en el navegador del cliente, sin backend. Esto lo convierte en un caso practico de como un modelo pequeno (1.5B) puede resolver una tarea estructurada concreta con una latencia de 0,35-0,7 segundos por consulta en una GPU consumer (RTX 3060).

El autor publica tambien una version mayor de 3B con licencia no comercial. Esta version de 1.5B mantiene la licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial segun los terminos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | q4f16 (pesos MatMul en 4 bits con block size 32, activaciones y KV cache en fp16) |
| Idiomas soportados | no disponible explicitamente; entrenado sobre Spider en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_q4f16.onnx` + `model_q4f16.onnx_data`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de la familia Qwen2, con 1.500 millones de parametros. El ajuste se realizo mediante QLoRA sobre Qwen2.5-Coder-1.5B-Instruct, es decir, con el modelo base cuantizado en 4 bits y adaptadores LoRA entrenados sobre el conjunto Spider. Posteriormente los adaptadores se fusionaron en el modelo base en fp16, y el resultado se exporto a ONNX con cuantizacion q4f16 (pesos MatMul en 4 bits con block size 32, activaciones y KV cache en fp16). La capa de embedding y la LM head comparten un unico peso de 4 bits.

El grafo ONNX se construyo con el model builder de onnxruntime-genai, desactivando GroupQueryAttention para que el grafo use MultiHeadAttention + RotaryEmbedding, mecanismo que el manejo de KV cache de Transformers.js soporta. El template de chat queda embebido en `tokenizer_config.json`. El entrenamiento se hizo sobre Spider, con preguntas en ingles y dialecto SQLite sobre esquemas academicos multi-tabla. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si se aplicaron fases adicionales de RLHF o DPO (el modelo base ya incluye alineamiento instruct).

## Capacidades

- Generacion de consultas SQL a partir de una pregunta en lenguaje natural y un esquema de base de datos, en dialecto SQLite.
- Salida restringida a la consulta SQL, sin explicaciones ni bloques Markdown, segun el system prompt de entrenamiento.
- Razonamiento sobre esquemas relacionales multi-tabla (el conjunto Spider incluye bases de datos con multiples tablas y joins).
- Inferencia en navegador mediante Transformers.js 4.x y WebGPU.
- Ejecucion determinista con `do_sample: false` (decodificacion greedy) para text-to-SQL.
- Capacidades heredadas del modelo base Qwen2.5-Coder Instruct (generacion de codigo general, conversacion), aunque el ajuste esta orientado a la tarea text-to-SQL.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion proporcionada.
- Capacidades multilingues: no documentadas; el entrenamiento es en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente SQL embebido en herramientas de BI: el modelo puede generar la consulta SQLite a partir de la pregunta del usuario y el esquema de la base de datos, ejecutandose en el propio navegador con WebGPU y evitando enviar el esquema a un servidor externo.
- Prototipado de interfaz de consulta en lenguaje natural sobre SQLite: util para demos y MVPs donde no se quiere montar un backend de inferencia, gracias al formato ONNX y a la integracion con Transformers.js.
- Generacion de consultas para analisis de datos academicos: adecuado para esquemas relacionales de tipo academico similares a Spider, con latencias de 0,35-0,7 s por consulta en una RTX 3060.
- Formacion y evaluacion de pipelines text-to-SQL: el modelo sirve como linea base reproducible con metrica de execution accuracy publicada sobre Spider dev (71,4% en el split completo con el adaptador LoRA en PyTorch).
- Herramientas de desarrollo con privacidad por diseno: al ejecutarse en el cliente, el esquema de la base de datos y la pregunta no salen del navegador, lo que encaja en entornos con requisitos de confidencialidad.
- Generacion de consultas en entornos con GPU consumer: al ocupar 877 MB de pesos cuantizados, puede desplegarse en portatiles y estaciones de trabajo con GPU integrada o dedicada de gama media mediante WebGPU.
- Automatizacion de tareas de extraccion de informacion sobre SQLite: generacion de consultas de agregacion (conteos, agrupaciones) a partir de preguntas simples en ingles.

## Benchmarks y rendimiento

Spider dev, zero-shot, execution accuracy (segun la model card del autor):

| Modelo | Preguntas | Execution accuracy |
|---|---|---|
| Base 4-bit + adaptador LoRA (PyTorch) | todas (1.034) | 71,4% |
| Base 4-bit + adaptador LoRA (PyTorch) | primeras 200 | 62,0% |
| fp16 fusionado (PyTorch) | primeras 200 | 60,5% |
| este q4f16 ONNX (onnxruntime CUDA) | primeras 200 | 64,0% |

El autor advierte que las primeras 200 preguntas del split dev incluyen varias bases de datos dificiles y puntuan por debajo del split completo, y que las diferencias sobre esas 200 estan dentro del ruido; el dato fiable es el del split completo (71,4%). La version de 3B alcanza 75,1% en el split completo (McNemar exacto, p=0,006).

Rendimiento en navegador (Edge 157, WebGPU, RTX 3060): aproximadamente 62 tokens/s, unos 0,3 s hasta el primer token para un prompt de ~320 tokens, y 0,35-0,7 s por consulta SQL.

## Requisitos de hardware

- VRAM estimada: los pesos q4f16 ocupan 877 MB (fichero `model_q4f16.onnx_data`); el modelo completo en el repositorio pesa 0,9 GB.
- Cabe en GPU consumer: si, segun el autor se ejecuta en una RTX 3060 mediante WebGPU en el navegador; por tamano es viable en GPUs de gama media y en muchas integradas modernas con WebGPU.
- GPUs recomendadas: RTX 3060 o superior para el caso de navegador documentado; para inferencia en servidor, el autor reporta resultados con onnxruntime CUDA (GPU no especificada).
- Opciones de despliegue: Transformers.js 4.x con WebGPU en navegador; onnxruntime (CUDA documentado); el formato ONNX es compatible con onnxruntime-genai.
- Latencia y throughput: ~62 tokens/s y ~0,3 s al primer token en RTX 3060 con WebGPU, 0,35-0,7 s por consulta SQL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento text-to-SQL | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Tehma/text2sql-qwen2.5-coder-1.5b-onnx | 1.5B | no disponible | 71,4% exec. acc. (Spider dev completo, adaptador PyTorch) | Apache 2.0 | ONNX q4f16, navegador |
| Tehma/text2sql-qwen2.5-coder-3b-onnx | 3B | no disponible | 75,1% exec. acc. (Spider dev completo) | no comercial (segun model card) | ONNX, navegador |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1.5B | no disponible | no disponible | Apache 2.0 | safetensors, PyTorch/Transformers |

La comparativa con otros modelos text-to-SQL de la literatura (por ejemplo, variantes especializadas sobre Spider) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre Spider: preguntas en ingles, dialecto SQLite y esquemas academicos multi-tabla. No evaluado en otros dialectos SQL ni en esquemas reales de negocio o CSV.
- El SQL generado debe revisarse antes de su uso en produccion; el propio autor lo indica.
- El modelo no ha sido evaluado en idiomas distintos del ingles; la capacidad multilingue no esta documentada.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar del modelo base Qwen2.5-Coder, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinacion: no cuantificado; en text-to-SQL se manifiesta como referencias a columnas o tablas inexistentes en el esquema.
- Restricciones de licencia: Apache 2.0 para esta version de 1.5B; la version de 3B tiene licencia no comercial segun la model card.
- La cuantizacion q4f16 introduce una diferencia de exactitud respecto al adaptador LoRA en PyTorch (64,0% frente a 62,0% en las primeras 200 preguntas, dentro del ruido segun el autor).
- El soporte de tool calling y de agentes no esta documentado para este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tehma/text2sql-qwen2.5-coder-1.5b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Version 3B: https://huggingface.co/Tehma/text2sql-qwen2.5-coder-3b-onnx
- Codigo de entrenamiento y reportes: https://github.com/Tehma123/text2sql-qlora
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Dataset Spider: https://yale-lily.github.io/spider
