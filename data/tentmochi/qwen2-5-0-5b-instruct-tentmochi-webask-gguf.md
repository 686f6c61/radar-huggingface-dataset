# tentmochi/Qwen2.5-0.5B-Instruct-Tentmochi-WebAsk-GGUF

## Resumen

Qwen2.5-0.5B-Instruct-Tentmochi-WebAsk-GGUF es un modelo de lenguaje experimental derivado de Qwen/Qwen2.5-0.5B-Instruct mediante un ajuste fino con LoRA sobre un conjunto de datos propio. Lo desarrolla el usuario independiente tentmochi y su propósito es muy específico: convertir una pregunta en lenguaje natural en una consulta de búsqueda web, en lugar de responderla directamente. Es, según el autor, su primer resultado de entrenamiento con LoRA.

El modelo se distribuye únicamente en formato GGUF con cuantización Q4_K_M (fichero `Qwen2.5-0.5B-Instruct-Tentmochi-WebAsk-v1-q4_k_m.gguf`), lo que lo hace apto para inferencia en CPU o GPU de gama baja mediante llama.cpp o LM Studio. Su tamaño es mínimo: 494.032.768 parámetros en los pesos originales, con un repositorio de aproximadamente 0,4 GB.

Su relevancia es acotada y de carácter práctico: sirve como componente ligero de preprocesamiento en pipelines de búsqueda o RAG, donde se necesita transformar una pregunta conversacional en una query indexable sin invocar un modelo grande. Está pensado exclusivamente para japonés y su uso está declarado como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct); ajuste fino con LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, aunque el autor no lo declara para este derivado) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica variante publicada) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros, y se ajusta mediante LoRA sobre el dataset propio `tentmochi/Tentmochi-WebAsk-v1`, publicado en Hugging Face. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO más allá del ajuste supervisado con LoRA.

La innovación no reside en la arquitectura, sino en la tarea: el modelo está entrenado para reescribir una pregunta en lenguaje natural como texto de consulta para un motor de búsqueda, con un system prompt fijo en japonés: «あなたは自然言語の入力を検索用のテキストに変換するAIです。» («Eres una IA que convierte entradas en lenguaje natural en texto para búsqueda»). El autor advierte que el modelo entra con frecuencia en bucles infinitos de generación, por lo que recomienda limitar `max_tokens` a 512 o menos.

## Capacidades

- Transformación de preguntas en lenguaje natural a consultas de búsqueda web (search-query generation), su función principal.
- Conversación en japonés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a un system prompt fijo en japonés; el autor indica que debe usarse esa cadena exacta y colocar la pregunta directamente en el prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del japonés.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Preprocesamiento de consultas en un pipeline RAG: el modelo recibe la pregunta del usuario en japonés y devuelve una query de búsqueda que se envía a un motor como Elasticsearch o a una API de búsqueda web; su tamaño de 0,5B permite ejecutarlo en el mismo host que el orquestador sin GPU dedicada.
- Enrutamiento de consultas en asistentes conversacionales: cuando la pregunta requiere información externa, el modelo genera la consulta y un modelo mayor se encarga de la respuesta, reduciendo coste y latencia en el paso de reescritura.
- Búsqueda en documentación interna: integrado en una herramienta de línea de comandos o en un bot de chat corporativo en japonés para transformar preguntas de empleados en términos indexables sobre la base documental.
- Prototipado rápido de funciones de búsqueda: al ocupar 0,4 GB en Q4_K_M, se puede desplegar con llama.cpp o LM Studio en un portátil para validar la lógica de un producto de búsqueda antes de invertir en modelos mayores.
- Evaluación comparativa de reescritura de consultas: sirve como línea base ligera en experimentos que midan la calidad de la query generada frente a modelos más grandes, usando la herramienta GGUF Batch Evaluator del propio autor.
- Filtro de intención de búsqueda en aplicaciones móviles o edge: su reducido consumo permite ejecutarlo en dispositivos con pocos recursos para decidir si una entrada debe convertirse en búsqueda web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (el repositorio completo ocupa 0,4 GB), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; también funciona en CPU sin problema.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: llama.cpp, LM Studio y GGUF Batch Evaluator del autor; al ser GGUF, es compatible con el ecosistema llama.cpp (Ollama y otros runners basados en él), aunque no se mencionan explícitamente en la model card.
- Latencia y throughput: no disponible; el autor solo advierte de que el modelo entra frecuentemente en bucles, por lo que conviene fijar `max_tokens` ≤ 512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-Tentmochi-WebAsk (este) | 494 M | no disponible | GGUF Q4_K_M | Apache 2.0 | Fine-tune LoRA para generar queries de búsqueda en japonés |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Modelo base; conversación general en múltiples idiomas, sin especialización en búsqueda |
| Modelos de reescritura de consultas de mayor tamaño (p. ej. Qwen2.5-7B-Instruct) | 7 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Mayor calidad de reescritura y menos bucles, a costa de mucho más cómputo y memoria |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este fine-tune con alternativas.

## Limitaciones y advertencias

- Modelo declarado explícitamente como experimental por el autor; no está pensado para producción sin validación previa.
- Tendencia documentada a entrar en bucles infinitos de generación; es imprescindible limitar `max_tokens` a 512 o menos.
- Solo soporta japonés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Requiere un system prompt fijo en japonés; fuera de ese formato el comportamiento no está garantizado.
- Al ser un ajuste fino de un modelo de 0,5B, la calidad de las consultas generadas será limitada en comparación con modelos mayores.
- Riesgo de alucinación y de generar consultas poco relevantes, especialmente con entradas ambiguas o muy largas.
- No se documentan sesgos específicos, pero hereda los del modelo base Qwen2.5-0.5B-Instruct.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado conviene revisar también las condiciones del modelo base Qwen2.5.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tentmochi/Qwen2.5-0.5B-Instruct-Tentmochi-WebAsk-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/tentmochi/Tentmochi-WebAsk-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Herramienta GGUF Batch Evaluator: https://gitlab.com/tentmochi/gguf-batch-evaluator
