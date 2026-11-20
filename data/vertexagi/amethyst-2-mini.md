# VertexAGI/amethyst-2-mini

## Resumen

Amethyst 2 Mini es un ajuste fino mediante LoRA sobre Qwen3-4B, desarrollado por VertexAGI, orientado a conversacion general con invocacion fiable de una herramienta de busqueda web. El modelo aprende a decidir cuando debe consultar `web_search` y cuando puede responder desde su conocimiento interno, ademas de descomponer preguntas compuestas en varias consultas y citar los fragmentos recuperados. La relevancia tecnica del proyecto reside en su enfoque de destilacion de datos sinteticos: 10.000 conversaciones generadas a partir de modelos mayores de NVIDIA (Nemotron 3 Super 120B-A12B y Nemotron 3 Ultra 550B-A55B) y filtradas a 9.156 ejemplos de entrenamiento y 796 de validacion.

Sin embargo, el propio autor ha marcado el modelo como **fallido y no funcional**. La model card incluye un aviso explicito de "DO NOT USE THIS MODEL" y documenta defectos estructurales: el tool calling solo funciona con un formato de prompt muy concreto, se desactiva al deshabilitar el modo thinking (llegando a inventar citas) y la calidad de las respuestas es inconsistente. El autor recomienda esperar a Amethyst 2.5, que sustituira a esta version en tres variantes de tamano.

Arquitectonicamente es un transformer denso de 4.022 millones de parametros con la ventana de contexto heredada de Qwen3-4B, distribuido en formatos MLX (safetensors con capas ajustadas en 8 bits y el resto en 4 bits) y GGUF (Q4_K_M y Q8_0), bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) con adaptador LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | MLX mixta (capas ajustadas 8-bit, resto 4-bit), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y se entrena mediante LoRA sobre la variante cuantizada `mlx-community/Qwen3-4B-4bit`. La configuracion del adaptador es LoRA de rango 8, escala 20, aplicado a 16 capas, con learning rate 1e-5, batch de 2, longitud de secuencia 2.048 y 13.800 iteraciones repartidas en cuatro sesiones reanudadas. El dataset de entrenamiento consta de 10.000 conversaciones sinteticas destiladas de `nvidia/nemotron-3-super-120b-a12b` y `nvidia/nemotron-3-ultra-550b-a55b` a traves de NVIDIA NIM, filtradas a 9.156 ejemplos de entrenamiento y 796 de validacion. La composicion es 36% chat general, 48% search-positive, 8% no-search y 8% turnos de seguimiento.

El formato de herramienta es explicito: el modelo emite `<tool_call>{"name": "web_search", "arguments": {"queries": ["..."]}}</tool_call>`, recibe `<tool_result>...</tool_result>` y responde con citas en estilo `[1]`. La herramienta solo existe si se describe en el system prompt exactamente como en el entrenamiento. El autor documenta un defecto de raiz: los datos de entrenamiento renderizaron los turnos de tool-call y los turnos de respuesta de forma distinta, lo que provoca que el modelo abandone la llamada a la herramienta cuando se desactiva el modo thinking. Este problema no es corregible sin reentrenar.

## Capacidades

- Generacion de texto conversacional en ingles con tono directo y conciso.
- Tool calling para busqueda web: decide si invocar `web_search` segun si la pregunta depende de informacion actual.
- Descomposicion de preguntas compuestas en multiples consultas dentro de una sola llamada.
- Sintesis de fragmentos recuperados en una respuesta con citas numeradas.
- Razonamiento multi-turno con turnos de seguimiento (8% del dataset de entrenamiento).
- Modo thinking heredado de Qwen3-4B, aunque su uso es obligatorio para que el tool calling funcione de forma fiable.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- **Prototipado de agentes con busqueda web**: util como banco de pruebas para disenar el bucle de tool calling y el formato de citas antes de migrar a un modelo estable. Adecuado por su bajo coste de inferencia (4B) y su formato de herramienta bien definido, aunque no para produccion.
- **Investigacion sobre destilacion de datos sinteticos**: el repositorio documenta con detalle el pipeline (generacion con Nemotron, filtrado, mezcla de categorias) y sirve como referencia metodologica para experimentos similares con Qwen3-4B.
- **Evaluacion de robustez de tool calling**: los 28 prompts de decision de herramienta y los 20 de chat general permiten reproducir la comparativa contra la base y estudiar el fallo al desactivar thinking.
- **Despliegue local en Apple Silicon**: la build MLX de 3,07 GB permite ejecutar el modelo en portatiles con memoria unificada para pruebas de integracion con mlx-lm.
- **Pruebas de integracion con llama.cpp u Ollama**: los GGUF Q4_K_M (2,50 GB) y Q8_0 (4,28 GB) permiten validar plantillas Jinja y flujos de herramienta en runtimes de inferencia locales.
- **Analisis de fallos en sistemas RAG con citas**: el comportamiento de inventar citas cuando falta el modo thinking es un caso de estudio util para disenar salvaguardas en pipelines de recuperacion aumentada.

## Benchmarks y rendimiento

Los datos proceden de 48 prompts escritos a mano sin solapamiento con las plantillas de entrenamiento: 28 de decision de herramienta (14 con busqueda, 14 sin ella) y 20 de chat general. El autor advierte que la muestra es pequena y no refleja la fiabilidad en produccion.

| Metrica | Qwen3-4B base | Amethyst 2 Mini |
|---|---|---|
| Decisiones correctas de herramienta (28) | 24 | 28 (0 falsas llamadas, 0 omisiones) |
| Chat general, juez ciego por pares (ambos ordenes A/B) | 9 victorias | 19 victorias (9 empates, 3 sin juzgar) |
| Perdida en held-out (60 ejemplos de validacion) | 3,528 | 0,585 |

La base se ejecuto con `enable_thinking=False`. La calidad de chat se juzgo sobre la forma de adaptador LoRA usando `nvidia/nemotron-3-super-120b-a12b` como juez. La build MLX iguala la perdida held-out del adaptador. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 3 GB para la build MLX mixta, 2,5 GB para GGUF Q4_K_M y 4,3 GB para GGUF Q8_0, mas overhead de contexto y KV cache.
- **GPU recomendadas**: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para las builds GGUF; Apple Silicon con memoria unificada para la build MLX.
- **Cabe en consumer GPU**: si, en la mayoria de GPU modernas con 6 GB o mas.
- **Opciones de despliegue**: mlx-lm en Apple Silicon, llama.cpp, Ollama y LM Studio para GGUF. La model card menciona compatibilidad con endpoints, pero no detalla integraciones con vLLM o TGI.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Estado |
|---|---|---|---|---|---|
| Amethyst 2 Mini | 4,02B | no disponible | Fragil, solo con plantilla por defecto y thinking activo | Apache 2.0 | Fallido, no recomendado |
| Qwen3-4B (base) | 4B | no disponible | No especializado | Apache 2.0 | Estable y ampliamente usado |
| Amethyst 2.5 | no disponible (tres variantes) | no disponible | no disponible | no disponible | En desarrollo, sustituto anunciado |

La comparativa directa con Qwen3-4B es la mas relevante: Amethyst 2 Mini mejora la decision de herramienta (28/28 frente a 24/28) y la calidad de chat en el juez ciego (19-9), pero introduce dependencia critica del formato de prompt y perdida de fiabilidad fuera de el. No se dispone de datos de otros modelos de 4B con tool calling especializado en la informacion proporcionada.

## Limitaciones y advertencias

- **Modelo declarado no funcional por el autor**: la model card incluye un aviso explicito de no usar el modelo para ningun proposito, incluidos pruebas y evaluacion.
- **Tool calling fragil**: solo funciona con el formato de prompt exacto del entrenamiento; al deshabilitar thinking cae a 15/28 decisiones correctas y puede inventar citas.
- **Defecto estructural de entrenamiento**: la inconsistencia en el renderizado de turnos de tool-call y respuesta no es corregible sin reentrenar.
- **Respuestas poco fiables**: el autor documenta errores factuales y formulaciones extranas incluso en preguntas simples.
- **Evaluacion limitada**: los numeros provienen de un conjunto de 48 prompts escritos a mano; el uso multi-turno de herramientas no se probo de extremo a extremo.
- **Idioma**: solo ingles, sin soporte multilingue declarado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue en produccion.
- **Sesgos**: no documentados en la informacion proporcionada; al derivar de datos sinteticos de modelos NVIDIA, puede heredar sesgos de esos generadores.

## Enlaces

- Hugging Face: https://huggingface.co/VertexAGI/amethyst-2-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Base cuantizada para entrenamiento: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Modelo generador de datos (super): https://huggingface.co/nvidia/nemotron-3-super-120b-a12b
- Modelo generador de datos (ultra): https://huggingface.co/nvidia/nemotron-3-ultra-550b-a55b
