# VertexAGI/amethyst-2-mini

## Resumen

Amethyst 2 Mini es un modelo de chat conversacional de 4.022 millones de parametros construido por VertexAGI sobre Qwen/Qwen3-4B mediante un ajuste fino con LoRA. Su proposito declarado es doble: mantener una voz conversacional directa y, sobre todo, decidir de forma fiable cuando debe invocar una herramienta de busqueda web (`web_search`) y cuando debe responder directamente desde su conocimiento interno. El modelo forma parte de la familia Amethyst y se distribuye bajo licencia Apache 2.0.

El problema que aborda es concreto: los modelos pequenos tienden a invocar herramientas de busqueda de forma indiscriminada o a omitirlas cuando la pregunta depende de informacion actual. Amethyst 2 Mini fue entrenado con 10.000 conversaciones sinteticas destiladas desde modelos mayores de NVIDIA para aprender ese criterio, ademas de descomponer preguntas en varias consultas y resumir fragmentos recuperados con citas. Segun la model card, acierta 28 de 28 decisiones de herramienta en un conjunto de validacion, frente a 24 de 28 del Qwen3-4B base.

El modelo se publica en tres formatos empaquetados con distintos niveles de precision (MLX de precision mixta, GGUF Q8_0 y GGUF Q4_K_M), lo que permite desplegarlo tanto en entornos Apple Silicon como en CPU/GPU mediante llama.cpp u Ollama. Su tamano de 4B lo situa en la gama de modelos que caben en GPU de consumo, y su enfoque en tool calling lo hace relevante para flujos de agentes ligeros con acceso a busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens usados en el entrenamiento del LoRA; el modelo base Qwen3-4B soporta 32.768 tokens (hasta 131.072 con YaRN); no especificado explicitamente en la model card |
| Tipos de cuantizacion | MLX de precision mixta (8-bit en las 16 capas ajustadas, 4-bit en el resto), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) y GGUF (Q8_0 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura transformer densa de Qwen3-4B. El ajuste se realizo mediante LoRA (rango 8, escala 20, 16 capas afectadas, learning rate 1e-5, batch 2, longitud de secuencia 2.048 tokens) sobre la variante de 4 bits `mlx-community/Qwen3-4B-4bit`, con 13.800 iteraciones repartidas en cuatro sesiones reanudadas.

Los datos de entrenamiento son 10.000 conversaciones sinteticas destiladas desde `nvidia/nemotron-3-super-120b-a12b` y `nvidia/nemotron-3-ultra-550b-a55b` a traves de NVIDIA NIM, filtradas a 9.156 ejemplos de entrenamiento y 796 de validacion. La mezcla es 36% chat general, 48% con busqueda positiva, 8% sin busqueda (respondible desde el conocimiento interno) y 8% de turnos de seguimiento. El formato de herramienta es explicito: el modelo emite `<tool_call>{"name": "web_search", "arguments": {"queries": ["..."]}}</tool_call>`, recibe `<tool_result>...</tool_result>` y responde con citas numeradas al estilo `[1]`.

Una innovacion tecnica destacable es el tratamiento de la cuantizacion al fusionar el LoRA. Dado que fusionar un adaptador sobre un modelo ya cuantizado a 4 bits degradaba el uso de herramientas (21/28 decisiones correctas y perdida de validacion de 0,731), los autores generaron una build MLX de precision mixta: las 16 capas modificadas por el LoRA se fusionan a 8 bits y el resto conserva los pesos de 4 bits originales, lo que restaura el rendimiento (0,586 de perdida validada).

## Capacidades

- Generacion de texto conversacional en ingles con tono directo y longitud adaptada a la pregunta.
- Decision de invocacion de herramienta: determina cuando conviene buscar en web y cuando responder desde conocimiento estable.
- Formulacion de consultas multiples: descompone preguntas compuestas en 1-3 consultas de palabras clave.
- Sintesis de resultados: resume fragmentos recuperados y cita las fuentes con marcadores `[1]`, `[2]`, etc.
- Tool calling estructurado bajo el esquema `web_search(queries: list[str])` con formato XML explicito.
- Manejo de turnos de seguimiento dentro de una conversacion.
- Capacidad bilingue limitada al ingles (idioma declarado).

## Casos de uso

- Asistente de preguntas con datos actuales: al recibir consultas sobre noticias, precios, resultados deportivos, lanzamientos o horarios, el modelo detecta que la respuesta depende de informacion variable e invoca `web_search` en lugar de arriesgar una respuesta obsoleta.
- Agente ligero de busqueda con citas: integrado en un pipeline que ejecuta la busqueda y le devuelve los fragmentos, produce respuestas con referencias numeradas, util para resumenes verificables.
- Asistente conversacional de proposito general en produccion: con el system prompt de chat por defecto responde preguntas estables (aritmetica, definiciones, historia) sin coste de busqueda, reduciendo latencia y llamadas a API.
- Chatbot de atencion al cliente con acceso a documentacion actualizada: si la pregunta depende de condiciones comerciales cambiantes, el modelo busca; si es una pregunta frecuente estable, responde directo.
- Generacion de codigo asistida: forma parte de los dominios que el propio prompt de entrenamiento marca como "no buscar" (codigo, definiciones, aritmetica), lo que evita busquedas innecesarias en tareas de programacion.
- Despliegue en edge o portatil: gracias a la build Q4_K_M de 2,5 GB y a la MLX de 2,9 GB, puede ejecutarse en hardware de consumo con acceso a busqueda web.
- Prototipado de agentes multi-turno: los turnos de seguimiento y el formato de tool call lo hacen util para cadenas de razonamiento por pasos donde se alternan busquedas y respuestas.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la evaluacion interna de la model card: 48 prompts de validacion escritos a mano (sin solapamiento con las plantillas de entrenamiento), de los cuales 28 son de decision de herramienta y 20 de chat general.

| Metrica | Qwen3-4B (base) | Amethyst 2 Mini |
|---|---|---|
| Decisiones correctas de herramienta (28) | 24 | 28 (0 falsos positivos, 0 omisiones) |
| Chat general, juicio por pares ciego (ambos ordenes A/B) | 9 victorias | 19 victorias (9 empates, 3 sin juzgar) |
| Perdida en validacion (60 ejemplos) | 3,528 | 0,585 |

La calidad de chat se evaluo sobre la forma de adaptador LoRA mediante `nvidia/nemotron-3-super-120b-a12b`. El rendimiento por formato de archivo segun la propia model card es el siguiente:

| Archivo | Formato | Tamano | Decisiones de herramienta (28) |
|---|---|---|---|
| `model.safetensors` (+ config, tokenizer) | MLX, precision mixta | 2,9 GB | 28/28 (perdida 0,586) |
| `amethyst-2-mini-Q8_0.gguf` | GGUF Q8_0 | 4,3 GB | 28/28 |
| `amethyst-2-mini-Q4_K_M.gguf` | GGUF Q4_K_M | 2,5 GB | 25/28 (3 omisiones de busqueda) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en FP16/BF16, cerca de 4,3 GB con la build Q8_0 y alrededor de 2,5-2,9 GB con Q4_K_M o la build MLX de precision mixta.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB o mas, como RTX 3060 12 GB, RTX 4060, RTX 4070 o superiores. En datacenter funciona sin problema en A100, H100 o L40S, aunque el modelo esta sobredimensionado para ese hardware.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU dedicada moderna.
- Apple Silicon: la build MLX esta pensada para Macs con chip M-series, donde se puede cargar con `mlx_lm`.
- Opciones de despliegue: `mlx_lm` para la build MLX; llama.cpp, Ollama o LM Studio para las builds GGUF (usar `--jinja` con llama.cpp para el chat template por defecto); vLLM no es compatible directamente con el formato MLX, requeriria conversion a safetensors estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amethyst 2 Mini | 4B | Base Qwen3-4B (no confirmado en la card) | Chat + tool calling de busqueda web | Apache 2.0 | HuggingFace (MLX, GGUF) |
| Qwen/Qwen3-4B | 4B | 32.768 (hasta 131.072 con YaRN) | Chat general, modo thinking | Apache 2.0 | HuggingFace, Ollama, vLLM |
| Llama-3.2-3B-Instruct | 3B | 128.000 | Chat general, multilingue | Llama 3.2 Community License | HuggingFace, Ollama |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | Razonamiento y chat | MIT | HuggingFace, Ollama |

La ventaja diferencial de Amethyst 2 Mini frente al Qwen3-4B base es la fiabilidad en la decision de invocacion de herramienta y una mejora medida en chat general segun su evaluacion interna. Frente a Llama-3.2-3B y Phi-3.5-mini, su punto fuerte es el tool calling especializado, mientras que estos ultimos ofrecen contextos mas largos y soporte multilingue. No se dispone de comparativas publicadas contra estos modelos con la misma bateria de pruebas.

## Limitaciones y advertencias

- Modelo unicamente en ingles; no se declara soporte de otros idiomas.
- La longitud de contexto usada durante el ajuste LoRA fue de 2.048 tokens, muy inferior a la ventana nativa del Qwen3-4B base; el comportamiento mas alla de esa longitud no esta validado.
- El uso de la herramienta exige emplear exactamente el system prompt de entrenamiento y el chat template por defecto. Desactivar el modo thinking (`enable_thinking=False`, `--reasoning off` o un bloque `<think></think>` vacio) degrada la decision de herramienta a 15/28 aciertos y puede provocar citas inventadas.
- Riesgo de alucinacion en citas si el modelo genera referencias sin resultados validos de la herramienta; el prompt de entrenamiento incluye instrucciones para declarar explicitamente cuando los resultados no responden a la pregunta.
- La cuantizacion Q4_K_M reduce la fiabilidad del tool calling (25/28 frente a 28/28); se recomienda Q8_0 o la build MLX cuando la precision de la herramienta sea critica.
- La build MLX no es directamente compatible con servidores de inferencia convencionales como vLLM sin conversion de formato.
- Al derivar de datos sinteticos destilados, puede heredar sesgos presentes en los modelos docentes de NVIDIA; no se documentan auditorias de sesgo.
- No se han publicado datos de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.
- El modelo es muy reciente (creado el 25 de septiembre de 2026) y registra 0 descargas y 0 likes en HuggingFace, por lo que carece de validacion independiente de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/VertexAGI/amethyst-2-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base en 4 bits usado para el LoRA: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Modelos docentes de NVIDIA: `nvidia/nemotron-3-super-120b-a12b` y `nvidia/nemotron-3-ultra-550b-a55b`
- Libreria de inferencia MLX: https://github.com/ml-explore/mlx-lm
