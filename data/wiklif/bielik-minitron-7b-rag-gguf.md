# wiklif/Bielik-Minitron-7B-RAG-GGUF

## Resumen

Bielik-Minitron-7B-RAG-GGUF es la distribución en formato GGUF del modelo wiklif/Bielik-Minitron-7B-RAG, un ajuste fino del modelo polaco Bielik-Minitron-7B-v3.0-Instruct de SpeakLeash. El modelo está especializado en responder preguntas en polaco a partir de fragmentos de documentos proporcionados por un sistema de recuperación (RAG), citando las fuentes con el formato `[ID:n]` y rechazando explícitamente responder cuando los documentos no contienen la información solicitada. Forma parte del sistema RAG de código abierto Wawelsky Dragon.

La relevancia de esta publicación radica en que demuestra que la cuantización de 4 bits (Q4_K_M, 4,5 GB) mantiene una calidad prácticamente idéntica a la del modelo en precisión completa (bf16, 15 GB) sobre un benchmark de 462 preguntas: 366 aciertos frente a 367, una diferencia estadísticamente no significativa (McNemar p = 1,0). Esto permite desplegar un modelo de 7B especializado en RAG en hardware de consumo con una pérdida de rendimiento despreciable.

El repositorio incluye únicamente los archivos cuantizados en GGUF, pensados para su uso con llama.cpp y con una plantilla de chat ChatML embebida. El modelo está pensado para un formato de prompt muy concreto y no debe emplearse como modelo de propósito general sin ese formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Bielik-Minitron-7B-v3.0-Instruct); detalles específicos no disponibles |
| Parametros totales | 7B (según denominación del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens recomendados por slot en llama.cpp (`-c 16384`); contexto nativo máximo no disponible |
| Tipos de cuantizacion | Q8_0 (7,9 GB), Q6_K (6,1 GB), Q5_K_M (5,3 GB), Q4_K_M (4,5 GB) |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py` en f16 y `llama-quantize` sin matriz de importancia); plantilla ChatML embebida |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del modelo base speakleash/Bielik-Minitron-7B-v3.0-Instruct, que a su vez deriva de la familia Bielik de SpeakLeash, orientada al idioma polaco. La model card no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención), el volumen de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en el material proporcionado.

El ajuste fino se realizó sobre el dataset wiklif/wawelsky-dragon-rag-pl, orientado a tareas de question answering con citas sobre fragmentos de documentos. El modelo está entrenado para un formato de prompt específico: un system prompt en polaco que incluye los fragmentos recuperados, con las tablas representadas como HTML. La conversión a GGUF se hizo a partir de los pesos safetensors fusionados, en precisión f16, y posteriormente se cuantizó sin matriz de importancia. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y respuesta a preguntas en polaco a partir de contexto documental recuperado.
- Citación de fuentes mediante el formato `[ID:n]`, vinculando cada afirmación al fragmento correspondiente.
- Rechazo explícito cuando la respuesta no está contenida en los documentos proporcionados (comportamiento evaluado en el benchmark).
- Extracción de datos de tablas representadas en HTML dentro del contexto.
- Manejo de preguntas que requieren varios valores o hechos dispersos en distintos fragmentos.
- Integración con APIs compatibles con OpenAI a través de `llama-server`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente documental interno en polaco: el modelo responde consultas sobre corpus corporativos (normativas, manuales, contratos) citando el fragmento exacto de origen, lo que facilita la verificación por parte del usuario.
- Despliegue on-premise con requisitos de soberanía del dato: al ejecutarse con llama.cpp en hardware local, permite procesar documentos sensibles sin enviarlos a servicios en la nube.
- Sistemas RAG de código abierto: integración directa en Wawelsky Dragon como proveedor compatible con la API de OpenAI, usando el recuperador PolDense-400M para construir el contexto.
- Extracción de datos tabulares: el modelo está entrenado para interpretar tablas en HTML dentro del contexto, lo que lo hace adecuado para consultas sobre informes financieros o estadísticas públicas en polaco.
- Atención al cliente sobre base de conocimiento: con ventanas de 16k tokens por slot puede gestionar contextos de 5-8 mil tokens con varios fragmentos recuperados y responder con trazabilidad de fuentes.
- Control de calidad y auditoría documental: la capacidad de rechazo ante preguntas sin respuesta en los documentos reduce el riesgo de respuestas inventadas en flujos de verificación.
- Prototipado en estaciones de trabajo con GPU de consumo: la variante Q4_K_M de 4,5 GB permite iterar sobre pipelines RAG sin infraestructura dedicada.

## Benchmarks y rendimiento

Benchmark de 462 preguntas sobre documentos polacos, con recuperador PolDense-400M (10 fragmentos), temperatura 0 y evaluación mediante un modelo juez (DeepSeek V4.1 Flash):

| Modelo / archivo | Tamano | Aciertos de 462 | Tabla (208) | Varios valores (95) | Hecho en texto (116) | Sin respuesta → rechazo (43) |
|---|---|---|---|---|---|---|
| Precisión completa bf16 (vLLM) | 15,0 GB | 367 (79,4%) | 143 | 76 | 109 | 39 |
| Q8_0 | 7,9 GB | 367 (79,4%) | 145 | 74 | 109 | 39 |
| Q6_K | 6,1 GB | no medido | — | — | — | — |
| Q5_K_M | 5,3 GB | no medido | — | — | — | — |
| Q4_K_M | 4,5 GB | 366 (79,2%) | 143 | 76 | 110 | 37 |
| gpt-4.1-mini (referencia) | — | 374 (81,0%) | 146 | 82 | 111 | 35 |

Las diferencias entre Q4_K_M y precisión completa no son significativas (pierde 6 preguntas y gana 5; McNemar p = 1,0). Q8_0 pierde 2 y gana 2. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB para Q4_K_M, 5,3 GB para Q5_K_M, 6,1 GB para Q6_K y 7,9 GB para Q8_0, más el espacio para la caché KV correspondiente al contexto configurado.
- Contexto: se recomienda reservar al menos 16k tokens por slot (`-c` se divide entre `-np`), ya que una petición real con fragmentos recuperados ocupa entre 5.000 y 8.000 tokens.
- GPU de consumo: Q4_K_M y Q5_K_M caben en GPUs con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070); Q8_0 requiere 10-12 GB o más (RTX 3080, RTX 4070 Ti, RTX 4080).
- GPU de datacenter: A100, H100 o L40S para despliegues con múltiples slots concurrentes y contexto largo; el modelo en precisión completa se sirvió con vLLM en el benchmark.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 --jinja`), integrable como proveedor compatible con OpenAI; vLLM para la versión sin cuantizar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en benchmark (462 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-RAG (Q4_K_M) | 7B | 16k recomendado | 366 (79,2%) | Apache-2.0 | GGUF en este repositorio |
| Bielik-Minitron-7B-RAG (bf16) | 7B | 16k recomendado | 367 (79,4%) | Apache-2.0 | Safetensors en el repositorio base |
| gpt-4.1-mini | no disponible | no disponible | 374 (81,0%) | Propietaria | API de OpenAI |
| Bielik-Minitron-7B-v3.0-Instruct | 7B | no disponible | no disponible (modelo general, no ajustado a este formato) | Apache-2.0 | Hugging Face (SpeakLeash) |

La comparación con otros modelos polacos especializados en RAG no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado a un único formato de prompt (system prompt en polaco con fragmentos y tablas en HTML); con otra disposición se comporta como Bielik-Minitron sin ajuste o peor.
- Solo soporta polaco; no se ha evaluado su rendimiento en otros idiomas.
- Ajuste fino comunitario independiente: no es una publicación oficial de SpeakLeash ni está respaldado por dicha organización.
- Todas las mediciones del benchmark las realizó el autor del repositorio, sin replicación externa conocida.
- Riesgo de alucinación fuera del formato previsto; dentro del formato, la tasa de rechazo correcto es de 37-39 sobre 43 casos sin respuesta, por lo que persisten fallos en esa categoría.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Licencia Apache-2.0, que permite uso comercial; deben respetarse las condiciones de la licencia del modelo base.
- No se documentan sesgos específicos, pero al derivar de un corpus principalmente polaco puede heredar sesgos del mismo.
- Los archivos Q5_K_M y Q6_K no se han evaluado en el benchmark, por lo que su calidad solo puede inferirse por interpolación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wiklif/Bielik-Minitron-7B-RAG-GGUF
- Modelo base (precisión completa): https://huggingface.co/wiklif/Bielik-Minitron-7B-RAG
- Modelo original de SpeakLeash: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Sistema RAG Wawelsky Dragon: https://github.com/lrozewicz/wawelsky-dragon
- Recuperador PolDense-400M: https://huggingface.co/OPI-PIB/PolDense-400M
- Dataset de ajuste fino: https://huggingface.co/datasets/wiklif/wawelsky-dragon-rag-pl
