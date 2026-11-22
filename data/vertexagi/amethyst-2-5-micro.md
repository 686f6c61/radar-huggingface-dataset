# VertexAGI/amethyst-2-5-micro

## Resumen

Amethyst 2.5 Micro es un modelo de chat de 1.700 millones de parametros desarrollado por VertexAGI, un proyecto de investigacion independiente que trabaja en abierto. Se trata de un ajuste fino por LoRA de Qwen3-1.7B orientado a un comportamiento muy concreto: decidir cuando invocar una herramienta de busqueda web (`web_search`), responder de forma breve a partir de los resultados y citar las fuentes consultadas con marcadores `[1]`, `[2]`. No es un modelo mas capaz que su base, sino un modelo mas disciplinado en el uso de herramientas.

El modelo resuelve un problema practico de los LLM pequenos: la mayoria falla al emitir llamadas a herramientas bien formadas. Segun la model card, Amethyst 2.5 Micro logra un 100 % de llamadas bien formadas y un 0 % de busquedas innecesarias en tres conjuntos de validacion manuales, frente a un 0-25 % del Qwen3-1.7B base. La calidad de las respuestas tras la busqueda, sin embargo, es practicamente equivalente a la del base (8 victorias frente a 7 derrotas en comparaciones ciegas).

Es relevante ahora porque demuestra que un ajuste fino pequeno y barato puede convertir un modelo de 1,7B en un agente de busqueda fiable en formato, desplegable en un portatil con Apple Silicon o en una GPU de consumo. La arquitectura es la de Qwen3: transformer denso decoder-only con embeddings atados, 28 capas y 1.720.574.976 parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3, transformer denso decoder-only con embeddings atados |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | MLX mixta (capas ajustadas en 8-bit, resto en 4-bit), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `mlx-community/Qwen3-1.7B-4bit` y se ajusta mediante LoRA de rango 16, escala 20.0 y dropout 0.0 aplicado a las 28 capas, con la perdida calculada unicamente sobre los turnos del asistente (`mask_prompt`). El entrenamiento se ejecuto con MLX y `mlx-lm` sobre Apple Silicon: optimizador Adam, tasa de aprendizaje constante de 6e-5, tamano de lote 4, longitud de secuencia 2.048 y gradient checkpointing, durante 2 epocas y 2.341 iteraciones en una unica ejecucion ininterrumpida. La perdida de validacion (solo tokens del asistente) cayo de 4,59 a aproximadamente 1,01 hacia la iteracion 1.400.

Los datos de entrenamiento son 3.205 conversaciones sinteticas (4.683 muestras tras dividir cada conversacion en una muestra por turno del asistente), destiladas de modelos profesores grandes a traves de NVIDIA NIM y OpenRouter: GLM 5.3 y GLM 5.3 Flash, Kimi K3, poolside Laguna S 2.1 y MiniMax M3.1 Flash. Los resultados de busqueda del dataset son inventados por los profesores; no se rastreo ninguna pagina web real. Las categorias cubren chat general (817 conversaciones), respuestas directas sin busqueda (309 + 42), instrucciones de formato terso (500), busqueda de hechos actuales con una consulta (502), fuentes en desacuerdo (127), refinamiento de consulta (97 + 21), fallo de busqueda (192), resultados en tema pero sin la respuesta (448) y resumenes, multi-consulta y seguimientos (150). Las filas con resultados de busqueda pasaron un control automatico de fundamentacion: la respuesta final solo puede citar resultados existentes y usar numeros y nombres propios presentes en el ultimo resultado o en la pregunta.

Una innovacion tecnica destacable es el merge mixto del adaptador: un merge plano a 4 bits re-cuantizaria el ajuste fino y lo eliminaria, por lo que las 196 capas lineales adaptadas por LoRA (7 por capa x 28 capas) se fusionan a fp16 y se re-cuantizan a 8 bits. En 60 conversaciones de validacion, la perdida de secuencia completa del modelo fusionado fue 3,337 frente a 3,331 del adaptador sin fusionar, y sus puntuaciones en held-out igualan las del adaptador.

## Capacidades

- Generacion de texto conversacional breve y directa en ingles.
- Llamada a herramientas (`web_search`) con formato correcto: emite la llamada en todos los prompts de busqueda probados.
- Decision de cuando buscar: no invoca la herramienta ante preguntas estables y la invoca ante hechos cambiantes (noticias, resultados, precios, "ultimo").
- Respuestas con citas: tras una busqueda, responde brevemente y cita los fragmentos usados como `[1]`, `[2]`.
- Abstraccion ante resultados insuficientes: si la busqueda falla, devuelve vacio o no contiene la respuesta, lo dice explicitamente en lugar de adivinar.
- Manejo de fuentes contradictorias: senala que las fuentes difieren y cita ambas.
- Refinamiento de consulta: reformula una busqueda una vez cuando los primeros resultados son debiles.
- Instrucciones de formato estricto: "exactamente 3 vinetas", "menos de 20 palabras", "una sola frase", traduccion y reescritura.
- Descomposicion de consultas y seguimientos elipticos con resumenes citados.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) segun la informacion disponible.

## Casos de uso

- Asistente de busqueda web en produccion: el modelo decide si necesita buscar, ejecuta una unica consulta y responde con citas numeradas, lo que encaja en un pipeline donde un orquestador externo ejecuta la herramienta y devuelve los fragmentos.
- Atencion al cliente con datos cambiantes: para consultas sobre estado de pedidos, precios o disponibilidad, invoca la herramienta cuando el dato es dinamico y responde directamente cuando es estable, reduciendo llamadas innecesarias a APIs.
- Chatbot de noticias y resultados deportivos: su entrenamiento especifico en hechos actuales y en fuentes en desacuerdo le permite responder con ambas versiones citadas cuando hay contradicciones.
- Despliegue en portatiles Apple Silicon: el formato MLX (1,67 GB) permite ejecutarlo localmente con `mlx-lm` sin GPU dedicada, util para prototipos y demos offline.
- Agente ligero en entornos con recursos limitados: el GGUF Q4_K_M (1,11 GB) cabe en GPU de consumo y en CPU, adecuado para asistentes embebidos o edge donde no se puede ejecutar un modelo mayor.
- Generacion de respuestas con formato controlado: las 500 conversaciones de instrucciones tersas lo hacen util para resumenes con numero fijo de vinetas, reescrituras y respuestas de una sola frase en interfaces con espacio limitado.
- Moderacion de respuestas alucinadas: su comportamiento de declarar cuando los resultados no contienen la respuesta sirve como capa de verificacion en sistemas RAG que necesitan abstenerse en lugar de inventar.
- Integracion en pipelines de CI/CD y herramientas de desarrollador: con soporte de tool calling y compatibilidad con endpoints, puede conectarse a un runtime compatible con OpenAI para tareas de consulta de documentacion actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta evaluaciones internas sobre conjuntos manuales:

| Evaluacion | Amethyst 2.5 Micro | Qwen3-1.7B base | Amethyst 2.5 Mini (4B) |
|---|---|---|---|
| Llamadas a herramienta bien formadas (3 conjuntos held-out) | 100 % | 0-25 % | no disponible |
| Busquedas innecesarias en preguntas simples | 0 % | no disponible | no disponible |
| Calidad de respuesta tras busqueda (comparacion ciega, brazo sin thinking) | 8 victorias / 7 derrotas frente al base | referencia | no disponible |
| Comparacion directa frente a Mini (4B) | 4 victorias / 9 derrotas | no aplica | referencia |
| Perdida de validacion (solo tokens del asistente) | ~1,01 en iteracion ~1.400 (desde 4,59) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en Q4_K_M, 1,9 GB en Q8_0 y 1,8 GB en el formato MLX mixto, mas el overhead del runtime y la cache KV.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente; tambien funciona en CPU via llama.cpp. Para mayor throughput, una RTX 4090 o A100 estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas (RTX 3060, RTX 4060, RTX 4090) y en Apple Silicon via MLX.
- Opciones de despliegue: `mlx-lm` en Apple Silicon, llama.cpp, Ollama y LM Studio para los GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amethyst 2.5 Micro | 1,7B | no disponible | Chat breve + tool calling de busqueda con citas | Apache 2.0 | Hugging Face (MLX, GGUF) |
| Qwen3-1.7B (base) | 1,7B | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Amethyst 2.5 Mini | 4B | no disponible | Misma tarea, mayor tamano | Apache 2.0 | Hugging Face |
| Qwen3-4B | 4B | no disponible | Modelo generalista de mayor capacidad | Apache 2.0 | Hugging Face |

La comparacion interna de la model card situa a Micro por detras de Mini (4B) en calidad de respuesta (4 victorias frente a 9 derrotas), pero por delante del Qwen3-1.7B base en formato de tool calling (100 % frente a 0-25 %). Frente a modelos generalistas del mismo tamano, la ventaja es el comportamiento disciplinado en busqueda y citas, no la capacidad de razonamiento.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- La calidad de las respuestas tras la busqueda es aproximadamente equivalente a la del Qwen3-1.7B base (8 victorias frente a 7 derrotas), por lo que no debe esperarse una mejora de conocimiento.
- Pierde claramente frente a Amethyst 2.5 Mini (4B) en comparaciones directas, lo que limita su uso cuando se requiere mayor profundidad de respuesta.
- Los datos de entrenamiento son sinteticos y los resultados de busqueda fueron inventados por modelos profesores; no se rastrearon paginas web reales, lo que puede introducir sesgos y patrones irreales en las citas.
- Riesgo de alucinacion: aunque se entrena para declarar cuando los resultados no contienen la respuesta, sigue siendo un modelo de 1,7B y puede fallar en consultas complejas o ambiguas.
- Las evaluaciones reportadas son conjuntos manuales pequenos (tres conjuntos held-out), no benchmarks estandar, por lo que su generalizacion es limitada.
- La longitud de contexto no se especifica en la informacion disponible; el entrenamiento uso secuencias de 2.048 tokens, lo que sugiere un limite practico bajo para conversaciones largas.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial.
- El formato MLX requiere Apple Silicon; para otros entornos deben usarse los GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/amethyst-2-5-micro
- Modelo hermano Amethyst 2.5 Mini: https://huggingface.co/VertexAGI/amethyst-2-5-mini
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint de ajuste mlx-community/Qwen3-1.7B-4bit: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
