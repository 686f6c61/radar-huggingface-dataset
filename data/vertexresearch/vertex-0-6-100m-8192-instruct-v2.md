# VertexResearch/Vertex-0.6-100M-8192-Instruct-v2

## Resumen

Vertex 0.6 100M 8192-ctx Instruct v2 es un modelo de lenguaje de tipo transformer, afinado para instrucciones y conversacion, desarrollado por Vertex Research. Con 96.752.192 parametros (aproximadamente 97M) y embeddings atados, se posiciona como el modelo de chat mas capaz de la familia Vertex 0.6 hasta la fecha. Deriva de un modelo base con ventana de contexto de 8192 tokens, sometido a un proceso de "quality anneal" de mil millones de tokens, y posteriormente ajustado mediante SFT sobre aproximadamente 201.000 conversaciones.

El modelo resuelve el problema del dialogo multiturno en modelos de muy pequeno tamano: segun el autor, mantiene una conversacion a lo largo de varios turnos en lugar de degradarse tras el primer mensaje. Incorpora soporte mecanico de tool calling mediante bloques `<tool_call>` en JSON y formato de chat ChatML, lo que permite integrarlo en flujos con funciones definidas en el system prompt.

Su relevancia es fundamentalmente experimental y educativa: demuestra que un modelo de menos de 100M de parametros puede sostener conversacion multiturno y emitir sintaxis de llamada a herramientas correcta. No obstante, el propio autor advierte que no es apto para produccion, con baja precision factual, razonamiento superficial y errores aritmeticos. La licencia Apache 2.0 y su reducido tamano lo hacen util para prototipado, investigacion sobre SFT y pruebas de pipelines de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 |
| Parametros totales | 96.752.192 (97M, embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (RoPE theta 1M) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF no documentada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer basada en Qwen3, con embeddings atados y codificacion posicional RoPE con theta de 1M, lo que habilita la ventana de contexto de 8192 tokens. El formato de conversacion es ChatML, con tokens especiales `<|im_start|>` y `<|im_end|>`, y utiliza dos tokens de fin de secuencia: `</s>` (id 2) y `<|im_end|>` (id 6).

El entrenamiento parte de un modelo base de la familia Vertex 0.6 100M con contexto de 8192, al que se aplico un "quality anneal" de mil millones de tokens sobre FineWeb-Edu y problemas matematicos sinteticos de nivel elemental. Posteriormente se realizo un SFT con TRL sobre aproximadamente 201.000 conversaciones, con ponderacion hacia el dialogo multiturno: smol-smoltalk (unas 130.000, multiturno conciso), UltraChat 200k (unas 40.000, multiturno mas largo), everyday-conversations (anadido dos veces, para anclaje de chat basico), datos de function/tool calling, datos de QA y tutoria, y datos de autoidentidad. Se entrenaron 2 epocas con learning rate 3e-4, scheduler coseno, precision bf16 y longitud maxima de 2048. La perdida de evaluacion final fue de 1,404.

## Capacidades

- Generacion de texto conversacional en ingles con soporte multiturno mejorado respecto a versiones anteriores de la familia.
- Dialogo de chat con formato ChatML y plantilla de chat integrada en el tokenizador.
- Tool calling mecanico: emite bloques `<tool_call>{"name": ..., "arguments": ...}</tool_call>` y consume resultados en bloques `<tool_response>`.
- Definicion de funciones mediante system prompt.
- Respuesta a preguntas y tutoria basica, segun los datos de SFT empleados.
- Autoidentidad entrenada explicitamente.
- Razonamiento aritmetico elemental limitado (problemas de nivel escolar, con errores frecuentes).
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Prototipado de asistentes conversacionales: permite validar plantillas ChatML, gestion de historial y tokens de parada en un entorno de desarrollo antes de migrar a un modelo mayor, gracias a su bajo coste computacional y su contexto de 8192 tokens.
- Pruebas de integracion de tool calling: util para verificar el parseo de bloques `<tool_call>` y `<tool_response>` en un orquestador propio, siempre con una unica funcion disponible y sin bucle autonomo.
- Investigacion sobre SFT y mezcla de datos: su model card documenta en detalle la composicion del dataset (smol-smoltalk, UltraChat, everyday-conversations), lo que permite reproducir o comparar recetas de ajuste en modelos de menos de 100M.
- Educacion y demostraciones: sirve para ilustrar en clase o en articulos como un modelo de 97M maneja multiturno, limites de contexto y sintaxis de herramientas.
- Generacion de respuestas breves en ingles para tareas de clasificacion conversacional o enrutamiento simple, donde la precision factual no es critica.
- Pruebas de infraestructura de inferencia: al ocupar unos 0,4 GB en safetensors, es adecuado para validar despliegues con transformers, TGI o endpoints compatibles antes de escalar a modelos mayores.
- Evaluacion de riesgos en agentes: permite reproducir de forma controlada fallos de seleccion de herramienta y de resumen de respuestas, util para construir baterias de pruebas de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion proporcionado es la perdida de evaluacion final del SFT: 1,404.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 0,2 GB para los pesos (97M parametros), con overhead adicional de activaciones y cache KV segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,1 GB para pesos; en 4 bits, por debajo de 0,1 GB. No se documentan ficheros GGUF oficiales.
- Cache KV para 8192 tokens: depende de la configuracion de cabezas y capas, no disponible en la informacion proporcionada; en cualquier caso, de orden muy reducido frente a modelos de mayor tamano.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 e incluso en CPU para inferencia interactiva.
- Despliegue: compatible con transformers, text-generation-inference (TGI) y endpoints compatibles, segun las etiquetas del repositorio. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Vertex 0.6 100M 8192-ctx Instruct v2 | 96,75M | 8192 | Apache 2.0 | en | Tool calling mecanico; no apto para produccion |
| Modelo base Vertex 0.6 100M 8192-ctx | aproximadamente 97M | 8192 | no disponible en la informacion | en | Base sin ajuste instructivo; sin capacidad de chat |
| Alternativas de menos de 200M comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Coherencia limitada: el autor advierte de divagacion, repeticion y respuestas inconsistentes, especialmente en generaciones largas.
- Baja precision factual y razonamiento superficial; errores aritmeticos frecuentes.
- Tool calling poco fiable en escenarios multipaso: con mas de una funcion disponible puede seleccionar la herramienta incorrecta y alucinar detalles al resumir la respuesta de una herramienta en lugar de reportarla con exactitud.
- No debe usarse en bucles de agente sin supervision.
- El autor indica explicitamente que no es apto para uso en produccion.
- Corte de conocimiento aproximado: abril de 2024.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Riesgo de sesgos inherrente a los datasets de SFT empleados (smol-smoltalk, UltraChat, everyday-conversations); no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero dada la calidad del modelo no se recomienda su explotacion en productos sin validacion adicional.
- El contexto maximo de entrenamiento del SFT fue de 2048 tokens, aunque la ventana del modelo es de 8192; el rendimiento mas alla de 2048 tokens no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-v2
- Modelo base: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-ctx-Base
