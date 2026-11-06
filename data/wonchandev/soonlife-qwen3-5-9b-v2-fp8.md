# wonchandev/Soonlife-Qwen3.5-9B-v2-FP8

## Resumen

Soonlife-Qwen3.5-9B-v2-FP8 es un modelo de lenguaje y vision derivado de Qwen/Qwen3.5-9B, desarrollado por el usuario wonchandev para el servicio de chatbot RAG "Soonlife" de la Universidad Soonchunhyang. Se ha entrenado mediante destilacion SFT (LoRA r=32) a partir de las respuestas y trazas de agente de un modelo profesor Qwen3.8-27B, y posteriormente se ha fusionado y cuantizado a FP8 dinamico con el mismo recetario que RedHatAI/Qwen3.5-9B-FP8-dynamic (llm-compressor, sin datos de calibracion).

El modelo resuelve un problema muy concreto: generar respuestas RAG con formato controlado (sin codigo, sin emojis, sin numeros ni enlaces inventados, con espaciado correcto en coreano) y ejecutar flujos de agente con tool calling sobre herramientas de busqueda y consulta de avisos. La version v2 reduce la tasa de reescritura tras el control de calidad del 27,2% al 17,4% y los bloqueos por consultas duplicadas del 10,9% al 3,3%, acercandose al comportamiento del profesor de 27B.

Con 9.653.104.368 parametros totales, pipeline image-text-to-text y licencia Apache 2.0, el modelo esta pensado exclusivamente para servir el chatbot Soonlife en vLLM con un maximo de 49.152 tokens de contexto. Fuera de ese sistema de prompts y herramientas, el autor no garantiza mejoras sobre el Qwen3.5-9B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (atencion completa + linear attention Gated DeltaNet + torre de vision + MTP), segun pesos del modelo base |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 49.152 tokens (configuracion de servicio recomendada con `--max-model-len 49152`) |
| Tipos de cuantizacion | FP8 dinamico (pesos FP8 por canal + activaciones FP8 dinamicas por token) en Linear de atencion completa y MLP; bf16 en `lm_head`, `embed_tokens`, torre de vision y Gated DeltaNet; pesos MTP copiados del original |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con atencion completa, capas de linear attention Gated DeltaNet, torre de vision y pesos MTP para decodificacion especulativa. Sobre esa base se aplico un LoRA de rango 32 y alpha 32 (dropout 0,0) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj` del modelo de lenguaje, excluyendo la torre de vision. El entrenamiento se hizo en bf16 con Unsloth durante 1,5 epoch, learning rate 1e-4 con scheduler coseno, batch efectivo de 16 y secuencias de hasta 32.768 tokens, en una H100 durante 3,5 horas. La perdida media de entrenamiento fue 0,1689 y las perdidas finales de validacion 0,2684 (answers) y 0,2709 (traces).

Los datos de destilacion provienen del profesor Qwen3.8-27B y suman 6.332 lineas y 81,4 millones de tokens, de los cuales 2,99 millones son tokens con perdida. Se dividen en tres conjuntos: 3.000 respuestas en formato RAG (24,6M tokens, perdida en la respuesta final), 1.728 muestras de la primera ronda de trazas con pensamiento (23,8M tokens, perdida en pensamiento y tool calls) y 1.604 muestras del resto de trazas sin pensamiento (33,0M tokens, perdida en tool calls y respuesta final). Las trazas se dividieron en dos muestras para replicar la entrada real de produccion, en la que solo la primera ronda incluye pensamiento. Se reforzaron 148 trazas con recuperaciones exitosas y terminaciones explicitas. Los 21 registros con imagenes se sustituyeron por el texto `[그림]` y las muestras de mas de 32K tokens se descartaron en lugar de truncarse.

La cuantizacion sigue el recetario de RedHatAI/Qwen3.5-9B-FP8-dynamic: pesos FP8 por canal y activaciones FP8 dinamicas por token en las capas Linear del modelo de lenguaje, manteniendo en bf16 el `lm_head`, los embeddings, la torre de vision y las proyecciones de Gated DeltaNet. Los pesos MTP se copian sin modificar del modelo original, por lo que la decodificacion especulativa puede tener una tasa de aceptacion ligeramente inferior a la del base.

## Capacidades

- Generacion de texto en coreano con formato RAG controlado: sin bloques de codigo ni HTML, sin emojis, con espaciado correcto en expresiones numericas (por ejemplo, "4월" en lugar de "4 월").
- Tool calling y function calling con parser `qwen3_coder` en vLLM, incluyendo seleccion autonoma de herramientas de busqueda y consulta de avisos.
- Razonamiento multi-paso en flujos de agente: planificacion, llamada a herramienta, observacion y respuesta, con pensamiento limitado a la primera ronda segun el diseno de produccion.
- Modo thinking parcial: el modelo genera pensamiento en la primera ronda del agente y lo omite en rondas posteriores, tal como se entreno.
- Procesamiento de imagen-texto a texto (pipeline `image-text-to-text`), aunque la torre de vision no se entreno y las imagenes se representan como marcador de posicion textual en los datos de entrenamiento.
- Capacidad de citar y estructurar informacion de documentos recuperados, incluyendo insercion de imagenes de referencia en la respuesta.
- Manejo de contexto largo de hasta 49.152 tokens en la configuracion de servicio recomendada.
- No se ha entrenado para generacion de codigo; de hecho, el modelo aprende a no emitir codigo ni HTML en las respuestas.

## Casos de uso

- Atencion al cliente universitaria automatizada: el modelo gestiona conversaciones multi-turno sobre avisos y reglamentos de la Universidad Soonchunhyang, con recuperacion RAG y respuesta en coreano; su ventana de 49.152 tokens permite incluir varios documentos recuperados y el historial de la conversacion en una sola peticion.
- Agente de busqueda interna con tool calling: integrado en vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_coder`, el modelo selecciona entre herramientas de busqueda y consulta de avisos, encadena hasta 4,34 llamadas de media por consulta y evita repetir la misma busqueda (tasa de bloqueo por duplicado del 3,3%).
- Generacion de respuestas RAG con control de calidad: el modelo produce respuestas de una mediana de 832 caracteres con solo un 17,4% de reescrituras tras el control de calidad de la aplicacion, lo que reduce la carga del postprocesado en produccion.
- Extraccion y citado de informacion documental: con una tasa de numeros no presentes en la fuente del 1,3% en formato RAG y del 0,0% en flujo de agente, es adecuado para respuestas que deban ceñirse estrictamente al material recuperado.
- Servicio de chatbot en produccion con vLLM: el formato FP8 dinamico reduce el peso del repositorio a 14 GB y permite desplegarlo sustituyendo la ruta del modelo en servidores que ya usaban `RedHatAI/Qwen3.5-9B-FP8-dynamic`, sin cambiar el resto de opciones.
- Normalizacion linguistica en coreano: corrige el espaciado incorrecto en expresiones numericas (del 65,9% en el modelo base al 0,3%) y elimina la salida de codigo y HTML (del 10,2% al 0,0%), util en pipelines de publicacion automatizada de contenido.
- Evaluacion de calidad de asistentes RAG: sirve como referencia para comparar el comportamiento de un modelo de 9B destilado frente a un profesor de 27B en metricas de fidelidad, formato y uso de herramientas.

## Benchmarks y rendimiento

El autor publica evaluaciones propias sobre el split de test del dataset Soonlife (314 preguntas no usadas en entrenamiento) en formato RAG y 92 preguntas en flujo de agente. No son benchmarks academicos estandar.

| Metrica (formato RAG, 314 preguntas) | teacher 27B | base (RedHatAI FP8) | lora-v1 | lora-v2 |
|---|---:|---:|---:|---:|
| Respuestas vacias (menor mejor) | 0,0% | 0,0% | 0,0% | 0,0% |
| Empieza por "no encontrado" (menor mejor) | 7,3% | 3,5% | 6,7% | 9,2% |
| Numeros no presentes en la fuente (menor mejor) | 0,0% | 2,5% | 1,0% | 1,3% |
| Enlaces no presentes en la fuente (menor mejor) | 1,6% | 3,8% | 1,9% | 2,9% |
| Imagenes no presentes en la fuente (menor mejor) | 0,0% | 1,6% | 0,6% | 0,6% |
| Respuestas con imagen (mayor mejor) | 11,5% | 11,1% | 9,9% | 10,5% |
| Reproducibilidad de numeros del teacher (mayor mejor) | 1,00 | 0,61 | 0,80 | 0,81 |
| Espaciado incorrecto "4 월" (menor mejor) | 0,0% | 65,9% | 0,3% | 0,3% |
| Salida de codigo o HTML (menor mejor) | 0,0% | 10,2% | 0,0% | 0,0% |
| Emojis (menor mejor) | 13,7% | 15,9% | 14,0% | 12,7% |
| Longitud mediana de respuesta (caracteres) | 868 | 921 | 802 | 832 |
| Truncamiento por limite de longitud (menor mejor) | — | 0,0% | 0,0% | 0,0% |
| Tiempo mediano (segundos, menor mejor) | — | 14 | 11 | 11 |

| Metrica (flujo de agente, 92 preguntas) | lora-v1 | lora-v2 | lora-v2b |
|---|---:|---:|---:|
| Respuestas vacias (menor mejor) | 0,0% | 0,0% | 0,0% |
| Empieza por "no encontrado" (menor mejor) | 16,3% | 16,3% | 19,6% |
| Numeros no presentes en la fuente (menor mejor) | 1,1% | 0,0% | 3,3% |
| Enlaces no presentes en la fuente (menor mejor) | 0,0% | 0,0% | 0,0% |
| Imagenes no presentes en la fuente (menor mejor) | 0,0% | 0,0% | 0,0% |
| Respuestas con imagen (mayor mejor) | 9,8% | 9,8% | 7,6% |
| Espaciado incorrecto "4 월" (menor mejor) | 0,0% | 0,0% | 0,0% |
| Salida de codigo o HTML (menor mejor) | 0,0% | 0,0% | 0,0% |
| Emojis (menor mejor) | 12,0% | 12,0% | 12,0% |
| Longitud mediana de respuesta (caracteres) | 624 | 712 | 684 |
| Respuestas sin usar herramientas (menor mejor) | 1,1% | 0,0% | 0,0% |
| Llamadas a herramienta (media) | 5,29 | 4,34 | 5,08 |
| Rondas (media) | 5,74 | 4,53 | 5,39 |
| Apertura del aviso original (mayor mejor) | 28,3% | 30,4% | 28,3% |
| Reescritura tras control de calidad (menor mejor) | 27,2% | 17,4% | 25,0% |
| Truncamiento por limite de longitud (menor mejor) | 0,0% | 0,0% | 0,0% |
| Tiempo mediano (segundos, menor mejor) | 35 | 32 | 37 |

Datos adicionales reportados por el autor: la tasa de bloqueo por consultas duplicadas paso del 10,9% al 3,3% (registro del teacher: 2,7%); la reduccion de v1 a v2 en bloqueos por duplicado es estadisticamente significativa (p=0,04), mientras que la diferencia entre v2 y v2b no lo es (p=0,19). No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 14 GB en FP8; con overhead de KV cache y activaciones para 49.152 tokens de contexto se recomienda al menos 24 GB de VRAM, y 40-48 GB para margen en produccion con concurrencia.
- GPU recomendadas: H100 (usada en el entrenamiento), A100 40/80 GB, L40S y RTX 6000 Ada para servicio en produccion; RTX 4090 (24 GB) puede alojar el modelo en FP8 con contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090 y GPUs con 24 GB o mas, siempre que se limite la longitud de contexto y la concurrencia.
- Opciones de despliegue: vLLM es la opcion recomendada por el autor, con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--max-model-len 49152`. Al estar en formato compressed-tensors, tambien es compatible con transformers. No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor reporta tiempos medianos de 11 segundos en formato RAG y 32 segundos en flujo de agente completo (con varias rondas de herramienta) sobre su configuracion de vLLM con FP8, temperature 0,1 y max_tokens 4096. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2-FP8 | 9.653.104.368 | 49.152 tokens (config. recomendada) | Apache 2.0 | safetensors FP8 (compressed-tensors) | Destilado de Qwen3.8-27B para RAG y agentes en coreano |
| RedHatAI/Qwen3.5-9B-FP8-dynamic | mismo base Qwen3.5-9B | no disponible en la informacion | Apache 2.0 | safetensors FP8 | Modelo base cuantizado sin destilacion; usado como referencia "base" en las evaluaciones |
| Qwen/Qwen3.5-9B | ~9,6B | no disponible en la informacion | Apache 2.0 | safetensors bf16 | Modelo original sin ajuste; el autor no garantiza mejora fuera del sistema Soonlife |
| Qwen3.8-27B (teacher) | ~27B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Profesor usado para generar los datos de destilacion; referencia de calidad en las tablas |

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para el chatbot RAG de avisos y reglamentos de la Universidad Soonchunhyang. Fuera del system prompt y del formato de herramientas usados en el entrenamiento, no hay garantia de mejora sobre Qwen/Qwen3.5-9B.
- Solo soporta coreano de forma declarada; no se ha entrenado ni evaluado en otros idiomas.
- La torre de vision y los pesos MTP no se entrenaron: la decodificacion especulativa puede tener una tasa de aceptacion inferior a la del modelo original.
- Tasa de respuestas que empiezan por "no encontrado" del 9,2% en formato RAG y del 16,3% en flujo de agente, frente al 7,3% y 7,2% del teacher; el autor matiza que parte de esas respuestas son rechazos parciales, pero la brecha con el profesor sigue abierta.
- Tasa de enlaces no presentes en la fuente del 2,9% en formato RAG, superior al 1,9% de la version v1.
- Riesgo de alucinacion en cifras y referencias: aunque las tasas son bajas (1,3% de numeros inventados en RAG, 0,0% en agente), no son nulas y requieren verificacion en dominios sensibles.
- Las evaluaciones son propias, sobre 314 y 92 preguntas de un unico dataset, sin benchmarks academicos estandar ni comparacion con modelos generalistas de terceros.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora pesos derivados de Qwen3.5-9B; conviene revisar las condiciones del modelo base antes de redistribuirlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01: no hay validacion independiente de su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-FP8
- Modelo base fusionado en bf16: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2
- Adaptador LoRA y registro de entrenamiento: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-LoRA
- Variante con 1,0 epoch: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-FP8
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de cuantizacion FP8 dinamica: https://huggingface.co/RedHatAI/Qwen3.5-9B-FP8-dynamic
- Dataset de entrenamiento: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
