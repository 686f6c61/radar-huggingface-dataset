# vaibhav-mugulavalli-2004/ToolCall-200M-SFT-v4

## Resumen

ToolCall-200M SFT v4 es un modelo de lenguaje de 200 millones de parametros especializado en tool calling y function calling, desarrollado por vaibhav-mugulavalli-2004 dentro del proyecto ToolCall-200M. El modelo parte de un base de 200.184.576 parametros entrenado desde inicializacion aleatoria sobre 4.006B tokens de prediccion, utilizando sesiones gratuitas de Kaggle con dos GPU NVIDIA T4 y sin coste de computo de entrenamiento. El checkpoint v4 es el recomendado por el autor tras varias iteraciones de SFT (v1 a v4) que documentan regresiones y redisenos de la estrategia de datos.

El modelo resuelve un problema acotado: dada una peticion de usuario y un conjunto de esquemas de herramientas disponibles, produce una decision estructurada en JSON que indica si llamar a una herramienta, que herramienta seleccionar, que argumentos extraer y si falta algun campo obligatorio. Su relevancia radica en que demuestra que un modelo muy pequeno puede aprender enrutamiento hacia herramientas no vistas durante el entrenamiento, aunque con una brecha importante entre seleccion correcta de herramienta y llamada completamente ejecutable.

La arquitectura es un transformer decoder-only de 24 capas con grouped-query attention, SwiGLU, RoPE, vocabulario SentencePiece de 32.000 tokens y una longitud de contexto de 2.048 tokens que incluye tanto entrada como salida generada. El repositorio ocupa 20,8 GB, lo que sugiere la presencia de multiples checkpoints o pesos en precision alta junto a los safetensors del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention, SwiGLU y RoPE |
| Parametros totales | 200.184.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (entrada + salida generada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con grouped-query attention, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). El vocabulario es un SentencePiece de 32.000 tokens. El base se entreno desde inicializacion aleatoria sobre 4.006B tokens de prediccion en dos NVIDIA T4 mediante sesiones gratuitas de Kaggle. El entrenamiento supervisado se centro en cuatro habilidades: seleccion de herramienta, extraccion de argumentos, peticion de aclaracion y abtencion (no llamar a ninguna herramienta).

La receta de SFT v4 volvio al base preentrenado y aplico un corpus SFT limpio y comprensivo, con loss solo sobre tokens del asistente incluyendo el token de fin de secuencia, filtrado de filas que excedian la longitud en lugar de truncarlas, y seleccion de checkpoints priorizando exact target match y tool-name accuracy. Las iteraciones previas documentan lecciones relevantes: v1 alcanzo 98,33% de validez JSON estricta pero solo 59,17% de coincidencia exacta de argumentos; v2 regreso en el benchmark Fresh600 por reutilizacion de datos; v2.1 reintrodujo ejemplos procedimentales nuevos y familias de esquemas retenidas; v3 no pudo verificarse como ejecucion completada.

## Capacidades

- Seleccion de herramienta: dado un conjunto de esquemas, elige la herramienta adecuada entre opciones disponibles, incluyendo herramientas no vistas durante el entrenamiento.
- Extraccion de argumentos: genera un objeto JSON con los argumentos requeridos para la llamada, con validacion estricta de claves.
- Deteccion de campos faltantes: reporta en `missing_required_fields` los campos obligatorios ausentes en la peticion.
- Aclaracion: puede solicitar informacion adicional cuando la peticion es ambigua o incompleta.
- Abtencion: puede decidir no llamar a ninguna herramienta cuando ninguna es relevante.
- Salida estructurada: produce JSON con campos `decision`, `tool_name`, `arguments` y `missing_required_fields`.
- Tool calling y function calling: capacidad central del modelo, entrenada de forma explicita.
- Razonamiento multi-turno y agentes: no disponible como capacidad verificada; el entrenamiento documentado es de un solo turno.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Enrutamiento de peticiones a APIs internas: el modelo recibe la consulta del usuario y un catalogo de esquemas de funciones, y devuelve la herramienta y los argumentos listos para validacion. Es adecuado por su entrenamiento especifico en seleccion entre herramientas, aunque requiere validacion de esquema antes de ejecutar.
- Extraccion de parametros en formularios conversacionales: a partir de texto libre, rellena campos estructurados (por ejemplo, base y altura para un calculo de area) y senala campos que faltan, lo que permite construir flujos de completado progresivo.
- Preprocesamiento de intenciones en pipelines de agentes: como primera etapa barata (200M parametros) que clasifica la intencion y prepara la llamada, dejando la ejecucion y el razonamiento complejo a un modelo mayor.
- Deteccion de abtencion en asistentes: el modelo puede decidir no invocar ninguna herramienta cuando la peticion no la requiere, evitando llamadas innecesarias en produccion.
- Generacion de JSON estructurado en entornos con recursos limitados: su tamano permite desplegarlo en GPU de consumo o incluso CPU, sirviendo como capa de structured output para sistemas con presupuesto de computo ajustado.
- Evaluacion y generacion de datasets de tool calling: util como baseline pequeno para comparar recetas de SFT y para generar candidatos de llamadas que luego se filtran con un validador estricto.
- Filtrado previo en sistemas de atencion al cliente: identifica la herramienta de consulta (estado de pedido, devolucion, facturacion) antes de derivar la conversacion al backend correspondiente.

## Benchmarks y rendimiento

Evaluacion local estricta sobre 914 casos derivados de BFCL v4, decodificacion greedy y limite de 192 tokens nuevos. El denominador de exact-call combina 400 casos `simple_python` y 258 `live_simple`.

| Checkpoint | Herramienta correcta / 658 | Llamada exacta / 658 | Abtencion correcta / 240 |
|---|---:|---:|---:|
| SFTv4 | 479 (72,80%) | 156 (23,71%) | 157 |

En 16 casos `live_relevance` adicionales evaluados con un proxy de decision de llamada, ambos checkpoints obtuvieron 9/16. La brecha entre seleccion de herramienta y llamada completa es el principal cuello de botella: en 323 casos SFTv4 selecciono la herramienta correcta pero fallo la coincidencia estricta de argumentos.

Comparativa interna documentada entre versiones anteriores en el benchmark Fresh600:

| Metrica Fresh600 | SFT v1 | SFT v2 |
|---|---:|---:|
| Validez JSON estricta | 91,33% | 86,50% |
| Precision de nombre de herramienta | 82,33% | 77,67% |
| Coincidencia exacta de argumentos | 52,17% | 48,50% |
| Llamadas ejecutables entre esperadas | 63,25% | 56,25% |
| Coincidencia exacta de objetivo | 50,17% | 45,50% |
| Generaciones con claves duplicadas | 36 | 76 |
| Fallos por argumento faltante | 191 | 233 |

No se han publicado resultados comparativos con modelos de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en fp16 (200M parametros), alrededor de 0,4 GB en int8 y 0,2 GB en int4, sin contar overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo fue entrenado en NVIDIA T4, por lo que T4, RTX 3060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: transformers con safetensors, llama.cpp/Ollama si se con讨论ierten los pesos a GGUF (no se documenta conversion oficial), vLLM y TGI para serving por lotes. El formato nativo es safetensors.
- Latencia y throughput estimados: no disponible. El contexto de 2.048 tokens y el limite de 192 tokens nuevos por generacion acotan la latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolCall-200M SFT v4 | 200M | 2.048 | Tool calling especializado | no disponible | Hugging Face |
| Qwen2.5-0.5B | 500M | 32.768 | LLM generalista | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | 8.192 | LLM generalista | Apache 2.0 | Hugging Face |
| Functionary-small | ~7B | 4.096 | Tool calling | no disponible | Hugging Face |

La comparativa con modelos de terceros no esta respaldada por datos de benchmark publicados en la informacion disponible; las cifras de contexto y licencia de las alternativas son de conocimiento general y no proceden de la documentacion del modelo evaluado.

## Limitaciones y advertencias

- Puede seleccionar la herramienta correcta y aun asi proporcionar argumentos incorrectos, faltantes o sobrantes: 323 de 658 casos en la evaluacion BFCL derivada cayeron en esta categoria.
- El scoring estricto puede rechazar representaciones de argumentos equivalentes, por lo que las metricas de exact-call subestiman potencialmente la utilidad practica.
- Requiere validacion de esquema y revision antes de ejecutar cualquier llamada generada; no debe usarse como unico control en produccion.
- El contexto de 2.048 tokens incluye entrada y salida generada, lo que limita el numero de esquemas de herramientas y el historial conversacional que caben en una peticion.
- El entrenamiento documentado es de un solo turno; no hay evidencia de robustez en conversaciones multi-turno ni en razonamiento multi-paso.
- Riesgo de alucinacion de nombres de herramienta y de valores de argumentos, documentado en el analisis de fallos de v1.
- Idiomas soportados no disponibles; no hay evidencia de cobertura multilingue.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sesgos conocidos: no documentados en la informacion disponible.
- El modelo no ha sido validado con resultados de benchmarks frente a alternativas de terceros, por lo que su posicion relativa es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vaibhav-mugulavalli-2004/ToolCall-200M-SFT-v4
- Repositorio de checkpoints de preentrenamiento: https://huggingface.co/vaibhav-mugulavalli-2004/ToolCall-200M-checkpoints
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
