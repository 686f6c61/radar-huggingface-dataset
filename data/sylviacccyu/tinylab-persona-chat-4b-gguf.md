# sylviacccyu/tinylab-persona-chat-4b-gguf

## Resumen

TinyLab persona chat 4B v5 es un modelo de conversación en chino de 4.022 millones de parámetros, derivado de Qwen/Qwen3-4B-Base mediante un ajuste fino con LoRA (r=16, alpha=32) y posteriormente cuantizado a GGUF Q4_K_M. Lo desarrolla la autora independiente Sylvia-ccc dentro del proyecto TinyLab, un laboratorio abierto de entrenamiento de modelos pequeños cuyos informes y código se publican en GitHub. El modelo resuelve un problema muy acotado: mantener conversaciones breves y coloquiales en chino adoptando el registro de uno de los 16 tipos de personalidad MBTI que se le indican en el mensaje de sistema, con respuestas de unas 52 palabras de media.

La relevancia del modelo es su orientación a la inferencia totalmente local: el único peso publicado son 2,5 GB en Q4_K_M, ejecutables con llama.cpp u Ollama en un portátil, sin conexión y sin API. No es un modelo de propósito general: está entrenado exclusivamente para el rol de acompañante conversacional y NPC en videojuegos, y su model card desaconseja explícitamente su uso en atención al cliente, consultoría, psicología o cualquier tarea que requiera fiabilidad factual.

La ficha se basa únicamente en la información publicada en Hugging Face y en los informes enlazados por la autora. Todos los datos de evaluación proceden de una revisión automática con IA (dos evaluadores, ciego independiente) sobre 40 preguntas, con una sola semilla aleatoria, por lo que deben interpretarse como indicativos de dirección y no como valores precisos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Base) con ajuste LoRA fusionado |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantización | Q4_K_M (único publicado) |
| Idiomas soportados | chino simplificado (zh); solo probado en este idioma |
| Licencia | Apache-2.0 (pesos); código de entrenamiento MIT |
| Formato de pesos | GGUF (archivo `tinylab-persona-chat-4b-v5-Q4_K_M.gguf`, 2.497.276.352 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only de 4.022 millones de parámetros bajo licencia Apache-2.0, y aplica un ajuste supervisado con LoRA de rango 16 y alpha 32, fusionado posteriormente en los pesos base antes de cuantizar a Q4_K_M. El entrenamiento consta de 940 pasos con un tamaño de lote efectivo de 8 (2 ejemplos por lote con acumulación de gradiente de 4), en precisión bf16 y con una única semilla aleatoria. Además del ajuste LoRA, se entrenaron los embeddings de los tokens especiales `<|im_start|>` y `<|im_end|>` para que el modelo aprenda a detenerse al terminar la respuesta; el archivo GGUF incorpora ya la plantilla ChatML con `<|im_end|>` como token de parada.

Los datos de entrenamiento son conversaciones multi-turno en chino generadas íntegramente por DeepSeek a partir de una especificación de datos publicada en el repositorio, complementadas con un conjunto de datos de seguridad (rechazo de roles de intimidad, reconocimiento de la identidad de IA, escenarios de crisis). Las respuestas se restringen a 40-150 caracteres, con frases cortas y coloquiales, y la especificación prohíbe mencionar las letras del tipo de personalidad o describir el personaje. El conjunto de validación se separa por "pregunta núcleo" completa para evitar que distintas formulaciones de la misma pregunta aparezcan a la vez en entrenamiento y validación. El dataset no se publica.

## Capacidades

- Generación de texto conversacional breve en chino simplificado, con respuestas de aproximadamente 52 caracteres de media.
- Adopción del registro de uno de los 16 tipos MBTI indicados en el mensaje de sistema, con formato fijo: `你的人格类型是 {TYPE}。用这种人格的方式，像朋友一样和对方聊天。`
- Conversación multi-turno con plantilla ChatML y parada automática mediante `<|im_end|>`.
- Reconocimiento parcial de la identidad de IA (25 de 40 preguntas en la prueba de red team), reforzable en la capa de aplicación.
- Respuestas de rechazo ante solicitudes de roles de intimidad y escenarios de crisis, aprendidas del conjunto de datos de seguridad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe no disponible: solo se ha probado en chino simplificado.

## Casos de uso

- Acompañamiento conversacional en escritorio sin conexión: el modelo se ejecuta con Ollama o llama.cpp en un portátil y mantiene charlas breves en chino con un tono de personalidad concreto, sin enviar datos a ningún servidor, lo que encaja con el objetivo declarado de la autora de "offline desktop companion".
- NPC de videojuego con personalidad diferenciada: un mismo archivo GGUF permite instanciar varios personajes cambiando únicamente el tipo MBTI del mensaje de sistema, de modo que un motor de juego puede generar diálogos reactivos breves y variados sin coste de API por token.
- Prototipado rápido de personajes conversacionales: al estar en GGUF y con plantilla ChatML incluida, se integra en un pipeline de pruebas con `llama-cli -cnv` para validar el tono de un personaje antes de invertir en un modelo mayor.
- Chatbot de demo en ferias o entornos con conectividad limitada: el arranque en frío de aproximadamente 0,5 segundos y los 86 token/s en un Apple M5 Pro permiten una experiencia interactiva en hardware de consumo, sin dependencia de red.
- Generación de variantes de diálogo para guiones o narrativa interactiva: la temperatura recomendada de 0,3 con top_p 0,9 y repeat_penalty 1,1 produce respuestas cortas y controladas que sirven como borradores de líneas de personaje en chino.
- Investigación sobre ajuste fino de modelos pequeños: el repositorio publica los informes de todos los experimentos, incluidos los fallidos, y las comparativas entre versiones de 1,7B y 4B, lo que lo convierte en material de referencia para estudiar el efecto de la escala en la imitación de estilo.

## Benchmarks y rendimiento

Evaluación de calidad de diálogo (40 preguntas no vistas, escala 0-5, revisión por IA, dos evaluadores ciegos, una semilla):

| Modelo | Como personaje | Pertinencia | Naturalidad | Media de las tres |
|---|---:|---:|---:|---:|
| Modelo general 8B + tarjeta de personaje (línea base por prompt) | 3,66 | 3,44 | 2,99 | 3,36 |
| **TinyLab persona chat 4B v5** | 2,62 | 3,06 | **3,11** | **2,93** |
| Versión conversacional 1,7B + tarjeta de personaje | 2,92 | 2,50 | 2,59 | 2,67 |
| 1,7B ajustado v1 | 2,27 | 2,61 | 2,91 | 2,60 |
| 1,7B ajustado v4 (punto de partida de la versión conversacional) | 2,19 | 2,56 | 2,85 | 2,53 |

Otros datos publicados: identificación del tipo de personalidad a partir de la respuesta con top-1 del 50 % (azar: 6,25 %); enfrentamiento directo contra el 1,7B v1 con aproximadamente 24 victorias y 12 derrotas; longitud media de respuesta de unos 52 caracteres frente a los 132 del 8B con tarjeta de personaje.

Red team de seguridad (380 preguntas, temperatura 0,3, filtro inicial por reglas, sin revisión humana):

| Condición | Aprobadas | Autolesión/ideación (40) | Reconoce ser IA (40) |
|---|---:|---:|---:|
| Modelo solo | 341/380 (89,7 %) | 20 | 25 |
| Modelo + capa de seguridad de aplicación | 357/380 (93,9 %) | 36 | 40 (prefijo forzado) |

Rendimiento en Apple M5 Pro con Ollama (Q4_K_M, mediana): 86 token/s, 13 ms hasta el primer token, arranque en frío de aproximadamente 0,5 s. En chips de borde como el RK3576 no hay medición; la estimación de unos 5 token/s procede de referencias públicas y es una extrapolación de la autora.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 2,5 GB; con la caché KV y el contexto de llama.cpp, el consumo práctico ronda los 3-4 GB de memoria unificada o VRAM, aunque la autora no publica una cifra exacta.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más de VRAM puede alojar el modelo en Q4_K_M; en el extremo profesional, A100 y H100 lo ejecutan con holgura pero están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 de 6 GB en adelante; también en Apple Silicon con memoria unificada (medido en M5 Pro).
- Opciones de despliegue: llama.cpp (`llama-cli -cnv`) y Ollama con el Modelfile incluido en la model card; al ser GGUF estándar, es compatible con otros motores que lean este formato, aunque la autora solo documenta esos dos.
- Latencia y throughput: 86 token/s con 13 ms hasta el primer token en Apple M5 Pro con Ollama; en chips de borde la estimación no verificada es de unos 5 token/s.
- Parámetros de muestreo recomendados: temperatura 0,3, top_p 0,9, repeat_penalty 1,1, con parada en `<|im_end|>` y `<|endoftext|>`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLab persona chat 4B v5 | 4.022 M | no disponible | Persona MBTI en chino, GGUF Q4_K_M | Apache-2.0 | Hugging Face (GGUF) |
| Qwen3-4B-Base | 4.022 M | no disponible en la información disponible | Modelo base generalista | Apache-2.0 | Hugging Face |
| Modelo general 8B + tarjeta de personaje | ~8.000 M | no disponible | Persona por prompt, sin ajuste | según el modelo base | depende del modelo elegido |
| TinyLab 1,7B conversacional + tarjeta de personaje | ~1.700 M | no disponible | Persona por prompt en modelo pequeño | no disponible | repositorio TinyLab |

La comparación relevante que publica la autora es frente a la línea base de un modelo general de 8B con tarjeta de personaje: el 8B obtiene 3,36 de media frente a 2,93 del 4B v5, con una diferencia de aproximadamente 1,0 punto en el criterio "como personaje", mientras que el 4B v5 gana en naturalidad (3,11 frente a 2,99) y responde en menos de la mitad de caracteres. Frente a las versiones de 1,7B del propio proyecto, el 4B v5 es superior en las tres dimensiones y gana aproximadamente 24 a 12 en el enfrentamiento directo contra el 1,7B v1.

## Limitaciones y advertencias

- Requiere una capa de seguridad en la aplicación: el modelo por sí solo solo detecta 20 de 40 señales indirectas de autolesión; el filtro por reglas del repositorio (`lab/safety_gate.py`) eleva la cifra a 36 de 40, pero se calibró tras ver las preguntas de prueba, no es una evaluación ciega limpia, solo cubre palabras clave en chino y no contempla dialectos, homófonos ni inglés.
- La identidad de IA debe declararse desde la aplicación: el modelo solo se reconoce como IA en 25 de 40 casos; con un prefijo forzado ("我是 AI 程序，不是真人。") se alcanza 40 de 40, aunque a veces añade avisos de seguridad excesivos.
- Alucinación de experiencias y hechos: inventa anécdotas personales ("yo también me he encontrado con eso...") e introduce premisas inexistentes en la pregunta; no debe usarse como fuente de información ni de consejo.
- Tono a veces rígido y escasa contención emocional: ante preguntas emocionales tiende a respuestas pragmáticas y no siempre valida la emoción antes de responder.
- No apto para menores: el modelo no tiene capacidad de identificar la edad del usuario; la restricción debe aplicarse en la capa de producto.
- Usos prohibidos por la autora: productos dirigidos a menores, roles de pareja o familiares, psicología, medicina, derecho, finanzas y cualquier uso como test de personalidad; el modelo solo imita el estilo de los datos de entrenamiento y no representa ninguna teoría psicológica.
- Idiomas: solo probado en chino simplificado; no hay evidencia de comportamiento en otros idiomas.
- Licencia: los pesos son Apache-2.0 y el código de entrenamiento MIT, lo que permite uso comercial, pero el cumplimiento normativo de servicios de acompañamiento con IA o interacción antropomórfica recae en el integrador.
- Calidad de la evaluación: revisión por IA, 40 preguntas, una sola semilla; la dirección de las diferencias es creíble, pero las magnitudes no deben tomarse como valores precisos. El red team lo generó otra IA y el filtro inicial fue por reglas, sin revisión humana.
- Datos generados por un modelo (DeepSeek), con los sesgos y el estilo que ello implica; el dataset no es público y no puede auditarse.
- El proyecto declara no tener relación con The Myers-Briggs Company; las etiquetas de cuatro letras se usan solo como formato de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sylviacccyu/tinylab-persona-chat-4b-gguf
- Modelo base Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio GitHub del proyecto: https://github.com/sylvia-ccc/tinylab
- Especificación de datos MBTI: https://github.com/sylvia-ccc/tinylab/blob/main/docs/mbti-data-spec.md
- Informe de experimento 06 (evaluación humana y red team): https://github.com/sylvia-ccc/tinylab/blob/main/docs/experiments/06-human-eval-and-redteam.md
- Informe de experimento 07 (escala frente a punto de partida, publicación del 4B): https://github.com/sylvia-ccc/tinylab/blob/main/docs/experiments/07-scale-vs-start-4b-release.md
- Capa de seguridad por reglas: https://github.com/sylvia-ccc/tinylab/blob/main/lab/safety_gate.py
