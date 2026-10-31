# XHToken/Spark-X2.6-1.7B-FP8

## Resumen

Spark-X2.6-1.7B-FP8 es una versión cuantizada en FP8 del modelo Spark-X2.6-1.7B, publicado por XHToken en Hugging Face. Se trata del segundo modelo de la serie Spark-X2.6 (tras el Spark-X2.6-4B) y evoluciona directamente del Spark-X2.5-1.7B, del que conserva exactamente la misma arquitectura: las mejoras provienen de un post-entrenamiento más refinado. Está orientado a despliegue en dispositivo (on-device) y tareas conversacionales, con mejoras destacadas en código, uso de herramientas, contexto largo, multilingüismo y razonamiento.

Su relevancia radica en la combinación de un tamaño compacto (1.707.657.216 parámetros reales según safetensors) con capacidades de razonamiento configurable (thinking budget) y una ventana de contexto muy amplia, anunciada hasta 1.048.576 tokens en la configuración de ejemplo con SGLang. El autor afirma rendimiento de vanguardia frente a modelos abiertos de tamaño comparable como Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, especialmente en throughput de decodificación local.

La cuantización FP8 (mediante compressed-tensors) reduce el tamaño del repositorio a unos 2,0 GB, lo que facilita su uso en GPUs de consumo y entornos de borde, manteniendo la licencia Apache 2.0 del modelo base, apta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura detallada no disponible; misma que Spark-X2.5-1.7B, arquitectura `spark2_5` con código remoto) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | No es un modelo MoE; todos los parámetros están activos |
| Longitud de contexto | Hasta 1.048.576 tokens según la configuración de ejemplo con SGLang (no confirmado en la model card de forma explícita) |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base está en precisión original no disponible |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Spark-X2.6-1.7B conserva exactamente la arquitectura de Spark-X2.5-1.7B, una arquitectura transformer registrada bajo la clase personalizada `spark2_5`, que requiere cargar el modelo con `trust_remote_code=True` en Transformers (versión 4.57.1 recomendada). Los detalles concretos (número de capas, dimensiones, mecanismos de atención) no se detallan en la model card.

La mejora de capacidades respecto a la generación anterior se atribuye íntegramente a un post-entrenamiento mejorado, con foco en código, tareas agénticas, planificación multi-paso, ingeniería de software, razonamiento sobre contextos extendidos y multilingüismo. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas concretas de alineación (RLHF, DPO, etc.).

Una innovación destacable es el **thinking budget controlable**: el modelo ofrece tres niveles de razonamiento configurables (none, low, high) mediante el parámetro `enable_thinking` en la plantilla de chat, lo que permite equilibrar dinámicamente calidad de razonamiento, latencia y coste de inferencia. Además, el autor mantiene una implementación optimizada de llama.cpp para maximizar el throughput en hardware local.

## Capacidades

- Generacion de texto conversacional en ingles y chino (pipeline text-generation).
- Razonamiento configurable con tres niveles de thinking: none, low y high, ajustables por peticion.
- Uso de herramientas (tool calling): SGLang incluye un parser de tool calls especifico (`spark25`), lo que indica soporte nativo de function calling.
- Capacidades agenticas: planificacion multi-paso, uso complejo de herramientas y tareas de ingenieria de software, segun el autor.
- Contexto largo: razonamiento sobre contextos extendidos, con soporte de hasta 1.048.576 tokens en la configuracion de ejemplo.
- Codigo: mejoras sustanciales en tareas de programacion respecto a Spark-X2.5-1.7B.
- Matematicas y conocimiento general: evaluado en benchmarks de math y knowledge.
- Multilingüismo: mejoras anunciadas frente a la generacion anterior (ingles y chino como idiomas oficiales).
- Eficiencia de inferencia en dispositivo: alto throughput de decodificacion frente a modelos de tamano comparable.

## Casos de uso

- Asistentes locales en dispositivo: con 1,7B de parametros y unos 2 GB en FP8, es adecuado para ejecutarse en portatiles y estaciones de trabajo sin servidor remoto, ofreciendo respuestas conversacionales con latencia baja.
- Agentes con tool calling: el parser `spark25` en SGLang permite exponer funciones y APIs al modelo para flujos agenticos, como automatizacion de tareas de sistema o orquestacion de servicios.
- Asistencia de codigo en local: puede integrarse en editores o pipelines de desarrollo para generacion y revision de codigo, beneficiandose del thinking mode en tareas de razonamiento complejo.
- Procesamiento de documentos largos: la ventana de contexto de hasta 1M de tokens permite resumir o analizar documentos extensos sin tecnicas RAG, siempre que la memoria disponible lo permita.
- Chatbots bilingues chino-ingles: soporte nativo de ambos idiomas con mejoras multilingues anunciadas, util para atencion al cliente en mercados asiaticos y occidentales.
- Despliegue en API local con SGLang: el servidor OpenAI-compatible de SGLang facilita la integracion en aplicaciones existentes que ya consumen APIs tipo OpenAI.
- Inferencia en hardware NVIDIA de consumo: la implementacion optimizada de llama.cpp del autor esta probada sobre RTX 4090, ideal para desarrolladores que quieren IA local de respuesta rapida.
- Entornos NPU (Ascend): hay imagenes SGLang oficiales para NPUs Ascend A2 y A3, ampliando las opciones de despliegue mas alla de NVIDIA.

## Benchmarks y rendimiento

La model card incluye graficos (SVG) con resultados comparativos frente a modelos de tamano similar en tareas de agente, codigo, matematicas, general y conocimiento, pero no publica las cifras numericas en texto. Los rivales citados en las evaluaciones de inferencia son Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B.

| Benchmark | Resultado |
|---|---|
| Agent / Code / Math / General / Knowledge | El autor afirma rendimiento state-of-the-art frente a modelos abiertos de tamano comparable; cifras numericas no disponibles (solo graficos SVG) |
| Throughput de decodificacion | Liderazgo anunciado en contextos cortos frente a Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B; mediciones exactas no disponibles |

No se han publicado resultados numericos detallados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB solo de pesos en FP8; en la practica se recomienda 4-6 GB o mas para KV cache, especialmente si se usan contextos largos (el contexto de 1M tokens requiere memoria de KV cache muy superior).
- GPUs recomendadas: cualquier GPU NVIDIA moderna con soporte FP8 (por ejemplo RTX 4090, usada en las pruebas oficiales de llama.cpp del autor); para servidores, A100 o H100 son mas que suficientes con sobrecarga.
- Consumer GPUs: cabe sobradamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores; tambien es viable su ejecucion en portatiles con GPU dedicada.
- Opciones de despliegue: Transformers 4.57.1 (con `trust_remote_code=True`), SGLang (imagenes Docker oficiales para NVIDIA y para NPUs Ascend A2/A3, con servidor OpenAI-compatible), y llama.cpp mediante el fork optimizado del autor (https://github.com/XHToken/llama.cpp). No se menciona soporte oficial de Ollama, vLLM o TGI.
- Latencia y throughput: el autor afirma throughput de decodificacion lider entre modelos on-device de tamano similar, ampliado con su implementacion de llama.cpp sobre RTX 4090; cifras concretas no disponibles.
- Parametros de generacion recomendados (segun la model card): temperature 1.0, top_p 0.95, top_k 0, muestreo con `do_sample=True`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-FP8 | 1.707.657.216 | Hasta 1.048.576 tokens (según ejemplo SGLang) | FP8 | Apache 2.0 | Thinking budget en tres niveles, tool calling, fork optimizado de llama.cpp |
| Qwen3.5-2B (comparado por el autor) | ~2B | No disponible | No disponible | No disponible | Usado como referencia en benchmarks y pruebas de throughput |
| MiniCPM-2B (comparado por el autor) | ~2B | No disponible | No disponible | No disponible | Modelo on-device usado como referencia en las evaluaciones del autor |
| LFM2.5-2.6B (comparado por el autor) | ~2,6B | No disponible | No disponible | No disponible | Modelo on-device usado como referencia en las evaluaciones del autor |
| Spark-X2.6-4B | No disponible | No disponible | No disponible | No disponible | Modelo anterior de la misma serie, de mayor tamano |

## Limitaciones y advertencias

- La arquitectura `spark2_5` requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene revisarlo antes de usar en produccion.
- Los idiomas oficiales son solo ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado y puede ser limitado.
- La ventana de contexto de 1M de tokens exige memoria de KV cache considerable; con 1,7B de parametros el cuello de botella en contextos largos sera la VRAM disponible, y puede ser necesario reducir `--context-length` en SGLang.
- Los benchmarks se publican como graficos SVG sin cifras numericas verificables, y provienen del propio autor; no hay evaluacion independiente confirmada en la informacion disponible.
- El modelo es reciente (publicado en octubre de 2026) con muy pocas descargas (219) y pocos likes (7), por lo que tiene una comunidad y ecosistema de herramientas de terceros muy limitados.
- Al ser un modelo compacto de 1,7B, existe riesgo de alucinacion en tareas de conocimiento factual; el thinking mode puede mitigarlo parcialmente pero no lo elimina.
- No hay informacion sobre sesgos especificos, ni sobre limitaciones de la licencia: Apache 2.0 permite uso comercial sin restricciones destacables mas alla de las estandar de la licencia.
- No se menciona soporte para vLLM, Ollama o TGI; el despliegue documentado se limita a Transformers, SGLang y el fork de llama.cpp del autor.

## Enlaces

- Modelo en HuggingFace (FP8): https://huggingface.co/XHToken/Spark-X2.6-1.7B-FP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Fork optimizado de llama.cpp del autor: https://github.com/XHToken/llama.cpp
- Comunidad Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- Paper tecnico: no disponible
