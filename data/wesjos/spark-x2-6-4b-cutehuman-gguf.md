# wesjos/Spark-x2.6-4B-CuteHuman-GGUF

## Resumen

Spark-x2.6-4B-CuteHuman-GGUF es la version cuantizada en formato GGUF del fine-tune de personaje CuteHuman sobre el modelo base Spark-X2.6-4B, desarrollado por el usuario wesjos a partir de la serie abierta Spark-X2.6 de XHToken. El modelo resuelve un caso de uso muy concreto: conversacion de rol (roleplay) y asistencia conversacional con una persona marcadamente expresiva, que emplea emojis y kaomojis de forma espontanea y mantiene un tono cercano y jugueton. Esta pensado para desplegarse localmente con llama.cpp, sin necesidad de GPU de datacenter.

Tecnicamente es un transformer denso de 4.112.079.360 parametros (etiquetado como 4.1B) con arquitectura `spark2_5`, 36 bloques que combinan 9 capas de atencion completa y 27 de atencion deslizante con ventana de 512 tokens, embedding de 2560 dimensiones y 16 cabezas de atencion con 4 cabezas KV. El modelo declara una longitud de contexto de 1.048.576 tokens en los metadatos del GGUF, aunque el coste de la cache KV hace que en la practica se configure con ventanas mucho menores (32.768 tokens en el ejemplo del autor).

La relevancia actual del modelo es acotada y de nicho: no compite en benchmarks de razonamiento o codigo con modelos frontier, sino que ofrece una persona conversacional ya integrada en los pesos, con plantilla de chat embebida y dos cuantizaciones listas para usar (Q4_K_M de 2,42 GiB y Q8_0 de 4,07 GiB) bajo licencia Apache-2.0. Su interes esta en la facilidad de despliegue en hardware de consumo y en el soporte bilingue chino-ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer denso, 36 bloques: 9 de atencion completa + 27 de atencion deslizante con ventana 512) |
| Parametros totales | 4.112.079.360 (bf16, 290 tensores) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens declarados en metadatos (`spark2_5.context_length`) |
| Tipos de cuantizacion | Q4_K_M (4 bits mixto) y Q8_0 (8 bits) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint bf16 completo en el repo base |
| Embedding / cabezas | 2560 dimensiones; 16 cabezas de atencion / 4 cabezas KV; longitud key/value 256 |
| RoPE | parcial: 64 (atencion completa) / 256 (atencion deslizante) |
| Vocabulario | 131.072 tokens, BPE estilo `gpt2` con pre-tokenizer `spark2_5` |
| Plantilla de chat | embebida en el GGUF (`tokenizer.chat_template`, 5.629 bytes) |
| Muestreo recomendado | temp 1.0, top_p 0.95, top_k -1, repetition penalty 1.0 |
| Tamano del repo | 7,0 GB |
| Cuantizador | Unsloth (`general.quantized_by`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Spark-X2.6 de XHToken, que segun el repositorio oficial mantiene exactamente la misma arquitectura que Spark-X2.5 y obtiene sus mejoras de capacidad mediante un post-entrenamiento mejorado. La estructura es un transformer denso con atencion hibrida: 9 capas de atencion completa y 27 capas de atencion deslizante con ventana de 512 tokens, lo que reduce el coste computacional en contextos largos a costa de limitar el alcance efectivo de las capas deslizantes. Emplea atencion multi-query/grouped-query con 16 cabezas de consulta y 4 de clave/valor, y RoPE parcial con dimensiones distintas segun el tipo de capa.

Sobre el modelo base, el autor aplico un fine-tune de personaje (CuteHuman) cuyo objetivo es fijar un registro conversacional concreto: emojis, kaomojis, tono afectuoso y respuestas breves de charla. La model card indica que la persona reside en los pesos y no en la plantilla de chat, que es identica a la del modelo upstream y cuyo system prompt por defecto es "you are a helpful assistant." sin persona incorporada. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de fine-tune ni si se emplearon tecnicas de RLHF o DPO. El modelo soporta un modo de razonamiento (bloque `<think>`) que la plantilla activa por defecto.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles, con persona integrada de tono cercano y expresivo.
- Uso espontaneo de emojis y kaomojis como registro por defecto, modulable mediante system prompt.
- Razonamiento en modo thinking: la plantilla abre un bloque `<think>` que puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`.
- Aritmetica decimal exacta en casos sencillos (el demo muestra 8.2 x 9.12 = 74.784).
- Generacion de codigo basico: el demo incluye un script de matplotlib para dibujar una estrella de cinco puntas y una implementacion completa de un MLP en NumPy.
- Conversacion de rol (roleplay) y small talk con respuestas breves.
- Servible como endpoint compatible con la API de OpenAI mediante `llama-server`.
- No dispone de vision, audio ni tool calling documentado en la informacion disponible.

## Casos de uso

- Chatbot de compania y roleplay local: el modelo mantiene conversaciones multi-turno con una persona estable gracias a que esta fijada en los pesos, y puede ejecutarse en un portatil con la cuantizacion Q4_K_M de 2,42 GiB.
- Asistente personal en aplicaciones de escritorio: al exponerse como endpoint compatible con OpenAI mediante `llama-server`, se integra en clientes de chat existentes sin adaptadores adicionales.
- Generacion de codigo de scripts cotidianos: el demo muestra la produccion de codigo matplotlib y NumPy funcional, adecuado para tareas de scripting de baja complejidad en un asistente integrado.
- Practica de conversacion bilingue chino-ingles: el modelo alterna ambos idiomas y mantiene registro coloquial, util para herramientas de aprendizaje de idiomas con tono informal.
- Prototipado rapido de personajes conversacionales: sirve como base para evaluar el efecto de system prompts sobre el tono (por ejemplo, suavizar emojis con una instruccion explicita) antes de invertir en fine-tunes mayores.
- Demos y entornos con hardware limitado: con 2,42 GiB en Q4_K_M cabe en GPUs de consumo de 4-8 GB o incluso en CPU, lo que permite desplegar demos sin infraestructura dedicada.
- Generacion de texto creativo breve con estilo marcado: util para borradores de respuestas en redes o contenido informal donde el registro emoji-first es deseable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M y 4,2-4,5 GB con Q8_0, mas la cache KV.
- Cache KV: el autor indica un coste de 36,0 KiB por token en atencion completa, por lo que 1 M tokens de contexto requeririan aproximadamente 36 GiB de cache KV. Con `-c 32768` el coste ronda 1,1 GiB adicionales.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) para Q8_0 con contexto moderado; para Q4_K_M basta con 4 GB de VRAM. En entornos de servidor, A100 o H100 solo tendrian sentido para servir muchas peticiones concurrentes o contextos muy largos.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 4 GB o mas para Q4_K_M; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio. El soporte nativo de `spark2_5` requiere llama.cpp b10828 o posterior (v0.9.0 lo incluye).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Spark-x2.6-4B-CuteHuman-GGUF | 4,1B | 1.048.576 (metadatos) | zh, en | Apache-2.0 | GGUF (Q4_K_M, Q8_0) |
| Spark-X2.6-4B (base, XHToken) | 4,1B | no disponible en la informacion | no disponible | no disponible en la informacion | checkpoint completo en Hugging Face |
| Spark-X2.5 (serie base previa) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a la relacion con el modelo base y la serie previa.

## Limitaciones y advertencias

- La persona emoji-first puede resultar inadecuada en contextos profesionales; requiere instrucciones explicitas en el system prompt para moderar el tono.
- El modo thinking esta activado por defecto y consume presupuesto de tokens antes de la respuesta visible; en conversacion casual conviene desactivarlo.
- El contexto declarado de 1.048.576 tokens no es practico: la cache KV de atencion completa a ese tamano supera los 36 GiB, por lo que en produccion se recomienda configurar ventanas de 8.000 a 32.768 tokens.
- Riesgo de alucinacion inherente a un modelo de 4B con fine-tune de personaje; no es fiable para tareas de razonamiento complejo, matematicas avanzadas o codigo de produccion.
- Solo soporta chino e ingles de forma declarada; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- El modelo es un fine-tune de rol, no un asistente de proposito general; no se documentan capacidades de tool calling ni de agentes multi-paso.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre los datos de entrenamiento del modelo base.
- El repo GGUF no incluye WebUI; las demos corresponden al modelo bf16 y el autor afirma que las cuantizaciones producen la misma salida, pero no se aportan metricas de degradacion por cuantizacion.
- El modelo tiene un volumen de descargas muy bajo (2 descargas, 0 likes en el momento de la ficha), lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/wesjos/Spark-x2.6-4B-CuteHuman-GGUF
- Checkpoint bf16 del fine-tune: https://huggingface.co/wesjos/Spark-x2.6-4B-CuteHuman
- Modelo base Spark-X2.6-4B (XHToken): https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio GitHub de la serie Spark-X2.6: https://github.com/XHToken/Spark-X2.6
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador Unsloth: https://huggingface.co/unsloth
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/spark-x2-6-4b.html
