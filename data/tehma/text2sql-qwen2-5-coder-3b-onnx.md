# Tehma/text2sql-qwen2.5-coder-3b-onnx

## Resumen

Tehma/text2sql-qwen2.5-coder-3b-onnx es un ajuste fino (QLoRA) de Qwen2.5-Coder-3B-Instruct especializado en la generacion de consultas SQL a partir de un esquema de base de datos y una pregunta en lenguaje natural. Lo desarrolla el usuario Tehma y resuelve un problema muy concreto: convertir preguntas en SQL ejecutable sobre esquemas SQLite, orientado a su despliegue directamente en el navegador. El modelo base es un transformer decoder-only de 3.000 millones de parametros con una ventana de contexto de 32.768 tokens (caracteristica de la familia Qwen2.5).

La particularidad tecnica del artefacto es su empaquetado: no se distribuyen pesos en safetensors ni GGUF, sino un grafo ONNX cuantizado en 4 bits (q4f16, block size 32, activaciones y KV cache en fp16) pensado para ejecutarse con Transformers.js 4.x sobre WebGPU. El repositorio ocupa 1,8 GB y el fichero principal `onnx/model_q4f16.onnx_data` pesa 1,74 GB.

Es relevante ahora porque demuestra un patron de despliegue de modelos de 3B en el cliente (navegador), sin servidor, con latencias de ~45 tokens/s y ~0,5 s hasta el primer token en una RTX 3060. No obstante, la licencia Qwen Research restringe el uso a fines no comerciales, lo que limita su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), exportado a ONNX |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-Coder-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta 32.768 tokens) |
| Tipos de cuantizacion | q4f16: pesos MatMul en 4 bits (block size 32), activaciones y KV cache en fp16 |
| Idiomas soportados | no disponible (entrenado sobre Spider, preguntas en ingles) |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | ONNX (`model_q4f16.onnx` + `model_q4f16.onnx_data`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA del Qwen2.5-Coder-3B-Instruct sobre el dataset Spider (text-to-SQL academico, dialecto SQLite, esquemas multi-tabla en ingles). El adaptador LoRA se fusiono en los pesos fp16 del modelo base y posteriormente se exporto a ONNX mediante el model builder de onnxruntime-genai. Durante la exportacion se desactivo GroupQueryAttention para que el grafo emplee MultiHeadAttention + RotaryEmbedding, compatibles con la gestion de KV cache de Transformers.js.

La cuantizacion aplica 4 bits a los pesos de las operaciones MatMul con block size 32, manteniendo activaciones y KV cache en fp16; el embedding y la LM head comparten un unico peso de 4 bits. El prompt de entrenamiento usa un mensaje de sistema fijo ("You are a SQL expert...") y un formato de usuario con secciones `### Schema:`, `### Question:` y `### SQL:`. El codigo de entrenamiento y los informes estan en el repositorio GitHub del autor.

## Capacidades

- Generacion de consultas SQL (dialecto SQLite) a partir de esquema y pregunta en lenguaje natural.
- Salida restringida a la consulta SQL, sin explicaciones ni bloques Markdown, segun el prompt de sistema de entrenamiento.
- Razonamiento sobre esquemas multi-tabla con relaciones y claves foraneas (formato Spider).
- Inferencia en navegador via Transformers.js 4.x y WebGPU.
- Ejecucion determinista con `do_sample: false` (greedy), tal como se documenta en el ejemplo de uso.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking especifico; el modelo hereda el comportamiento del base pero no se han validado en este ajuste.

## Casos de uso

- Asistente SQL en el navegador: integrar el modelo en una aplicacion web que permita al usuario escribir una pregunta y obtener la consulta SQL sin enviar el esquema a un servidor, gracias a la ejecucion local con WebGPU.
- Herramienta educativa de SQL: entornos de aprendizaje donde el estudiante ve la traduccion de su pregunta a SQL sobre esquemas de ejemplo tipo Spider.
- Prototipado de interfaces text-to-SQL: validar UX y flujos antes de invertir en un modelo mayor o en infraestructura de servidor.
- Generacion de consultas sobre SQLite en aplicaciones de escritorio o extensiones de navegador que embeben Transformers.js.
- Automatizacion de analisis exploratorio sobre bases de datos pequenas y esquemas conocidos, con revision humana de la consulta generada antes de ejecutarla.
- Demos y pruebas de concepto de inferencia LLM en cliente: el modelo sirve como referencia de latencia (~45 tokens/s, 0,5-1,0 s por consulta en RTX 3060) para evaluar el despliegue WebGPU de modelos de 3B.

## Benchmarks y rendimiento

Evaluacion sobre Spider dev, zero-shot, execution accuracy:

| Modelo | Preguntas | Execution accuracy |
|---|---|---|
| Base 4-bit + adaptador LoRA (PyTorch) | 1.034 (split completo) | 75,1% |
| Base 4-bit + adaptador LoRA (PyTorch) | primeras 200 | 67,0% |
| Fusionado fp16 (PyTorch) | primeras 200 | 66,0% |
| Este ONNX q4f16 (onnxruntime CUDA) | primeras 200 | 64,0% |

El autor senala que las primeras 200 preguntas del dev incluyen bases de datos dificiles y por eso puntuan por debajo del split completo; la diferencia entre q4f16 y el adaptador en esas 200 no es significativa (McNemar exacto, p=0,29). Mediciones en navegador (Edge 157, WebGPU, RTX 3060): ~45 tokens/s, ~0,5 s hasta el primer token con prompt de ~320 tokens y 0,5-1,0 s por consulta SQL.

## Requisitos de hardware

- VRAM estimada: el fichero ONNX q4f16 pesa 1,74 GB; en WebGPU la memoria la gestiona el navegador sobre la GPU del sistema.
- GPU probada por el autor: RTX 3060 (12 GB) en Edge 157 con WebGPU.
- Cabe en GPUs de consumo con soporte WebGPU; no se documentan requisitos minimos oficiales.
- Despliegue: Transformers.js 4.x con `device: "webgpu"` y `dtype: "q4f16"`; tambien se ha ejecutado con onnxruntime CUDA para la evaluacion.
- Latencia y throughput medidos: ~45 tokens/s, ~0,5 s al primer token, 0,5-1,0 s por consulta SQL (RTX 3060, Edge 157).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento text-to-SQL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tehma/text2sql-qwen2.5-coder-3b-onnx | 3B | no disponible | 64,0% exec. acc. (Spider dev, 200 preguntas, ONNX q4f16) | qwen-research (no comercial) | ONNX para Transformers.js |
| Qwen2.5-Coder-3B-Instruct (base) | 3B | 32.768 tokens | no disponible en la informacion | qwen-research | safetensors, GGUF, etc. |
| Base 4-bit + adaptador LoRA (PyTorch) | 3B | no disponible | 67,0% exec. acc. (200 preguntas) | qwen-research | PyTorch (adaptador LoRA) |
| Fusionado fp16 (PyTorch) | 3B | no disponible | 66,0% exec. acc. (200 preguntas) | qwen-research | PyTorch |

No se dispone de datos de otros modelos text-to-SQL comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre Spider: preguntas en ingles, dialecto SQLite y esquemas academicos multi-tabla. No evaluado en otros dialectos SQL ni en esquemas reales de negocio o CSV.
- El SQL generado debe revisarse antes de su ejecucion; no hay garantia de correccion sintactica ni semantica.
- Licencia qwen-research: uso no comercial. El autor indica explicitamente "Non-commercial use only" y remite a la licencia del modelo base.
- No se han publicado evaluaciones de sesgo ni de alucinacion; al ser un ajuste especializado, el riesgo de inventar tablas o columnas no presentes en el esquema es plausible pero no esta cuantificado.
- Idiomas soportados no documentados; el entrenamiento es en ingles, por lo que el rendimiento en castellano no esta validado.
- El artefacto esta ligado a Transformers.js 4.x y WebGPU; el soporte de otros runtimes ONNX no esta garantizado (la exportacion desactiva GroupQueryAttention).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tehma/text2sql-qwen2.5-coder-3b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Codigo de entrenamiento y informes: https://github.com/Tehma123/text2sql-qlora
- Dataset Spider: https://yale-lily.github.io/spider
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
