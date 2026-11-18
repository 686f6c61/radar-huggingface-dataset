# XHToken/Spark-X2.6-4B-GGUF

## Resumen
Spark-X2.6-4B es un modelo de lenguaje compacto de tipo transformer decoder-only desarrollado por XHToken (equipo SparkLLM), pensado especificamente para despliegue en dispositivo (on-device) y tareas de agente en entornos reales. Es la evolucion del Spark-X2.5-4B y mantiene exactamente la misma arquitectura que su predecesor, de modo que las mejoras de capacidad provienen integramente de un post-entrenamiento mas elaborado. Con 4.447.623.680 parametros reales (segun los safetensors del modelo base), se posiciona en la franja de los 4B, pero el autor afirma que iguala o supera a modelos de aproximadamente 9B en varios benchmarks.

El modelo se distribuye en este repositorio en formato GGUF, lo que facilita su ejecucion con llama.cpp y Ollama en hardware de consumo, y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Soporta ingles y chino, incluye un modo de razonamiento ("thinking") con tres niveles configurables (none, low, high) y esta orientado a flujos agenticos con uso de herramientas, planificacion multi-paso e ingenieria de software.

Su relevancia actual radica en la combinacion de tamano reducido, contexto largo (el ejemplo de SGLang del autor configura 1.048.576 tokens) y control del presupuesto de razonamiento, factores que permiten integrar agentes locales con latencia y coste acotados sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.447.623.680 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | Hasta 1.048.576 tokens en la configuracion de ejemplo con SGLang (sujeto a memoria del dispositivo); valor nativo no confirmado |
| Tipos de cuantizacion | GGUF (este repositorio); niveles concretos no disponibles |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base XHToken/Spark-X2.6-4B |

## Arquitectura y entrenamiento
La informacion disponible confirma que Spark-X2.6-4B conserva exactamente la misma arquitectura que Spark-X2.5-4B y que las ganancias de capacidad se obtuvieron mediante un post-entrenamiento mejorado, no mediante cambios estructurales. No se detalla en la model card el tipo exacto de atencion, el numero de capas, las dimensiones ocultas ni si emplea tecnicas como atencion lineal o decodificacion especulativa. Tampoco se especifica el volumen de tokens de preentrenamiento ni la composicion del dataset.

El aspecto tecnico mas destacable documentado es el control del esfuerzo de razonamiento: el modelo admite tres niveles (none, low, high) que permiten ajustar el equilibrio entre calidad, latencia y coste de inferencia. El autor cuantifica este compromiso: al pasar de high a low, el promedio de puntuacion de Spark-X2.6-4B cae 1,7 puntos mientras que la longitud media de salida se reduce un 22,0 % (en el modelo hermano de 1.7B la caida es de 4,0 puntos y la reduccion de longitud del 37,3 %). No se documentan detalles sobre RLHF, DPO u otras tecnicas de alineacion empleadas.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con presupuesto configurable: modos none, low y high, activables mediante `enable_thinking` en la plantilla de chat.
- Codigo e ingenieria de software: el autor reporta mejoras sustanciales en tareas de programacion respecto a X2.5.
- Flujos agenticos: uso complejo de herramientas, planificacion multi-paso y ejecucion de tareas de agente.
- Contexto largo: soporte de ventanas de hasta 1.048.576 tokens en la configuracion de servidor SGLang documentada.
- Capacidades matematicas y de conocimiento general, evaluadas en los benchmarks del autor.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y plantilla de chat integrada en el tokenizer.
- Multilingue limitado a ingles y chino.

## Casos de uso
- Agentes locales en dispositivo: el modelo puede orquestar llamadas a herramientas y planificacion multi-paso en un movil o portatil, gracias a sus 4,4B de parametros y a la disponibilidad de pesos GGUF para llama.cpp u Ollama.
- Asistentes de codigo integrados en IDE: con el nivel de razonamiento high puede resolver tareas de refactorizacion y generacion de parches; con low reduce la latencia en autocompletado.
- Procesamiento de documentos extensos: la ventana de hasta 1.048.576 tokens en SGLang permite resumir o consultar contratos, informes o bases de codigo completas en una sola pasada, siempre que la memoria del dispositivo lo permita.
- Atencion al cliente bilingue (ingles/chino): conversaciones multi-turno con contexto largo y coste de inferencia controlado mediante el nivel de razonamiento none o low.
- Automatizacion de tareas de oficina: extraccion de datos, generacion de respuestas y clasificacion en pipelines locales sin enviar datos a la nube, lo que simplifica el cumplimiento normativo.
- Despliegue en hardware de borde con NPU Ascend: el autor documenta imagenes SGLang para A2 y A3, lo que habilita inferencia en infraestructura Ascend ademas de NVIDIA.
- Prototipado rapido de agentes: la licencia Apache 2.0 y los formatos transformers/GGUF permiten experimentar y pasar a produccion sin negociacion de licencia.

## Benchmarks y rendimiento
La model card incluye graficos comparativos (`benchmark.svg`, `all_benchmark.svg`, `inference.svg`, `reasoning_effort.svg`) frente a modelos on-device de tamano similar, incluidos Qwen3.5-4B y Gemma-E4B, pero los valores numericos no estan disponibles en el texto proporcionado. El autor afirma que Spark-X2.6-4B logra el mejor rendimiento de su clase y que iguala o supera a modelos de aproximadamente 9B en varios benchmarks, sin especificar cifras por tarea.

| Benchmark | Spark-X2.6-4B | Referencia |
|---|---|---|
| Agente, codigo, matematicas, conocimiento general | No disponible (solo graficos) | Qwen3.5-4B, Gemma-E4B, modelos ~9B |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 4,4B, las cuantizaciones GGUF de 4 bits suelen requerir del orden de 3-4 GB y las de 8 bits en torno a 5-6 GB, pero los niveles concretos incluidos en este repositorio no se detallan.
- GPU recomendadas: no especificadas por el autor. El ejemplo de SGLang usa imagenes para NVIDIA (CUDA 13) y para NPU Ascend A2/A3.
- GPU de consumo: el formato GGUF sugiere viabilidad en GPUs consumer con memoria suficiente; no se confirma que quepa en modelos concretos.
- Despliegue: transformers 4.57.1 (con `trust_remote_code=True`), SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1`), y por el formato GGUF, llama.cpp u Ollama de forma previsible aunque no documentada explicitamente.
- Latencia y throughput: no disponibles; el autor afirma eficiencia "igual o mejor" que Qwen3.5-4B y Gemma-E4B, sin cifras.
- Nota: la configuracion de contexto de 1.048.576 tokens en SGLang exige memoria de dispositivo considerable y el propio autor recomienda reducir `--context-length` cuando sea necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B | 4,45B | Hasta 1.048.576 (config. SGLang) | Apache 2.0 | HF (GGUF y safetensors) | Razonamiento configurable en 3 niveles |
| Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | Referencia de eficiencia citada por el autor |
| Gemma-E4B | No disponible | No disponible | No disponible | No disponible | Referencia de eficiencia citada por el autor |
| Modelos ~9B | ~9B | No disponible | No disponible | No disponible | El autor afirma igualar o superar su rendimiento en varios benchmarks |

Los datos de Qwen3.5-4B, Gemma-E4B y los modelos de ~9B no se detallan en la informacion proporcionada.

## Limitaciones y advertencias
- Idiomas: solo ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: no cuantificado en la model card; como en cualquier LLM de 4B, es esperable en tareas de conocimiento factual.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Contexto: la ventana de 1.048.576 tokens corresponde a una configuracion de servidor concreta y depende de la memoria disponible; el contexto nativo del modelo no se especifica.
- Datos de benchmarks: solo se publican graficos, sin cifras verificables por tarea.
- Arquitectura y entrenamiento: no se detallan capas, atencion, tokens de entrenamiento ni tecnicas de alineacion, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del codigo `trust_remote_code` que se carga con el modelo base.
- Produccion: al ser una version GGUF de un modelo reciente, conviene validar la calidad de las cuantizaciones concretas antes de desplegar.

## Enlaces
- Repositorio Hugging Face (GGUF): https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
