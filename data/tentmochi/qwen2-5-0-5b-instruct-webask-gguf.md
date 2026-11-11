# tentmochi/Qwen2.5-0.5B-Instruct-WebAsk-GGUF

## Resumen

Qwen2.5-0.5B-Instruct-WebAsk-GGUF es un modelo derivado experimental publicado por el usuario tentmochi en Hugging Face. Se trata de un ajuste fino mediante LoRA sobre Qwen2.5-0.5B-Instruct, el modelo pequeño de la familia Qwen2.5 de Alibaba, con el objetivo concreto de transformar preguntas en lenguaje natural japones en consultas de busqueda web (search queries). No responde a la pregunta: la convierte en texto optimizado para un motor de busqueda.

El modelo resuelve un problema de ingenieria muy acotado dentro de pipelines RAG y de agentes con acceso a web: la reformulacion de la consulta del usuario en terminos de busqueda efectivos. Con 494.032.768 parametros totales (aproximadamente 0,5 mil millones), es lo bastante pequeno como para ejecutarse en CPU o en GPUs de consumo, y se distribuye unicamente en formato GGUF cuantizado Q4_K_M.

Es relevante por su caracter de pieza especializada y ligera dentro de arquitecturas de agentes: en lugar de emplear un LLM grande para reescribir consultas, se puede delegar esa tarea a un modelo de medio billon de parametros. No obstante, se trata de un artefacto experimental (primer resultado de LoRA de su autor), sin benchmarks publicados y con un unico idioma soportado, el japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B-Instruct), ajuste fino con LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct; no confirmada por el autor) |
| Tipos de cuantizacion | GGUF Q4_K_M unicamente |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (qwen2.5-0.5b-instruct-webask-v1-q4_k_m.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5, y se ajusta mediante LoRA sobre un dataset propio del autor cuyo contenido y tamano no se han publicado (la model card indica que la preparacion del dataset esta en curso). No se especifican el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO tras el ajuste.

La innovacion es de proposito, no arquitectonica: el modelo se entrena para no responder, sino para emitir una consulta de busqueda a partir de una pregunta en japones. La model card fija un system prompt concreto ("Eres una IA que convierte entradas en lenguaje natural en texto para busqueda") y advierte de que el modelo entra en bucles infinitos con frecuencia, por lo que recomienda limitar `max_tokens` a 512 o menos. La version publicada es la v1 y solo existe el cuantizado Q4_K_M.

## Capacidades

- Conversion de preguntas en lenguaje natural japones a consultas de busqueda web.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct (no es el objetivo del ajuste y puede degradarse respecto al original).
- Ejecucion local en CPU o GPU de gama baja gracias al formato GGUF Q4_K_M.
- Integracion en pipelines de agentes como modulo de reescritura de consultas.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: limitada al japones segun la model card.

## Casos de uso

- Reformulacion de consultas en un pipeline RAG: el modelo recibe la pregunta del usuario en japones y devuelve una query optimizada que se envia a un motor de busqueda o a una API de retrieval, reduciendo el coste frente a usar un LLM grande para esa tarea.
- Agentes con acceso a web: como paso previo a una llamada de busqueda, el agente delega en este modelo la generacion de la query, manteniendo el modelo principal libre para razonamiento y sintesis.
- Busqueda en asistentes conversacionales japoneses: integrado en un chatbot, transforma la pregunta coloquial del usuario en terminos indexables por un buscador interno o externo.
- Prototipado rapido en local: al ocupar 0,4 GB en Q4_K_M, permite experimentar con reescritura de consultas en un portatil sin GPU dedicada mediante llama.cpp o LM Studio.
- Evaluacion por lotes de estrategias de busqueda: el autor proporciona su propia herramienta GGUF Batch Evaluator para procesar conjuntos de preguntas y comparar las queries generadas.
- Filtro de preprocesado en sistemas de recuperacion documental: normaliza y condensa preguntas largas antes de pasarlas a un motor de busqueda con limite de longitud de query.
- Componente de bajo coste en despliegues con restricciones de VRAM: al ser un modelo de 0,5B, puede convivir con otros modelos en la misma GPU sin competir por memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB con la cuantizacion Q4_K_M publicada (el repositorio completo ocupa 0,4 GB).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (RTX 3050, RTX 4060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: llama.cpp, LM Studio y la herramienta GGUF Batch Evaluator del propio autor; al ser GGUF, es compatible con el ecosistema llama.cpp (Ollama y otros runners basados en el, aunque no se citan explicitamente en la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de un modelo de 0,5B en Q4_K_M, la latencia sera baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-WebAsk (este) | 494 M | no disponible | GGUF Q4_K_M | Apache 2.0 | Reescritura de consultas en japones |
| Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible en esta ficha | safetensors, GGUF (upstream) | Apache 2.0 | Instrucciones generales, multilingue |
| Otros modelos especializados en query rewriting de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas especializadas en generacion de consultas de busqueda no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es el ajuste LoRA orientado a una unica tarea y la restriccion al japones.

## Limitaciones y advertencias

- Modelo experimental: es el primer resultado de LoRA de su autor y la model card lo califica explicitamente como experimental.
- Bucles infinitos: el autor advierte de que el modelo cae en bucles con frecuencia y recomienda `max_tokens` de 512 o menos; en produccion es imprescindible aplicar timeouts y limites de longitud.
- Dataset no publicado: el corpus de entrenamiento esta "en preparacion", por lo que no se puede auditar la composicion de los datos ni evaluar sesgos de origen.
- Idioma unico: solo japones; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Sin benchmarks: no hay metricas publicadas de calidad de las queries generadas ni comparaciones con alternativas.
- Riesgo de alucinacion: al generar texto libre, puede producir terminos de busqueda inexactos o inventados; conviene validar o filtrar la salida antes de enviarla a un motor de busqueda.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de ajuste traslada al integrador la responsabilidad de evaluar riesgos.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Dependencia del system prompt: el modelo asume un system prompt fijo en japones; cambiarlo puede alterar el comportamiento de forma impredecible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tentmochi/Qwen2.5-0.5B-Instruct-WebAsk-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Herramienta GGUF Batch Evaluator del autor: https://gitlab.com/tentmochi/gguf-batch-evaluator
