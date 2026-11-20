# VertexAGI/prism-roleplay-2-small

## Resumen

Prism Roleplay 2 Small es un modelo de generacion de texto especializado en roleplay de personajes, desarrollado por VertexAGI. Se construye como un fine-tuning mediante LoRA sobre Qwen3-8B, un transformer denso de 8.190.735.360 parametros, y se distribuye bajo licencia Apache 2.0. Su proposito es mantener la coherencia de un personaje a lo largo de conversaciones multi-turno largas, un punto debil de su predecesor, Prism Roleplay 1.5 Small.

La version 2 introduce dos capacidades opcionales mediante tool calling: `inner_thoughts`, que genera pensamientos privados en primera persona de unas 60 palabras antes de la respuesta, y `track_state`, que registra seis valores emocionales de 0 a 100 junto con una justificacion. El entrenamiento se centro en 1.575 conversaciones multi-turno, incluyendo historiales cortos para evitar que las respuestas se acorten en exceso.

El modelo esta disponible en formatos MLX (precision mixta, 5,38 GB) y GGUF (Q4_K_M de 5,03 GB y Q8_0 de 8,71 GB), lo que facilita su despliegue tanto en Apple Silicon como en llama.cpp, Ollama y LM Studio. Su relevancia actual radica en que cubre el nicho de roleplay conversacional con control emocional estructurado sobre una base solida y permisiva como Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptadores LoRA fusionados |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 3.072 tokens) |
| Tipos de cuantizacion | MLX mixta (capas LoRA a 6-bit, resto 4-bit), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.190 millones de parametros, sobre el que se aplica un fine-tuning LoRA de rango 16 con secuencias de 3.072 tokens. A diferencia de la version 1.5 (rango 8 y 2.048 tokens), esta version amplia tanto la capacidad del adaptador como la ventana de entrenamiento. Una innovacion clave es que la funcion de perdida se calcula unicamente sobre la respuesta final en las filas de chat, en lugar de sobre todos los tokens, de modo que el modelo aprende a responder y no a copiar turnos anteriores.

Los datos de entrenamiento combinan conversaciones sinteticas, transcripciones de dominio publico y chats construidos a partir de character cards, con un total de 1.575 conversaciones multi-turno. El dataset fue filtrado para eliminar contenido sexual, aunque el modelo no ha recibido un ajuste especifico de seguridad. Las capas afinadas se cuantizan a 6 bits en la build MLX, mientras que el resto conserva los 4 bits originales; los GGUF se generan a partir del modelo fp16 fusionado exacto.

## Capacidades

- Generacion de texto conversacional orientada a roleplay de personajes con coherencia multi-turno.
- Mantenimiento de la personalidad y el registro del personaje a lo largo de conversaciones largas.
- Tool calling opcional: `inner_thoughts` genera pensamientos privados en primera persona (mediana de 64 palabras) antes de la respuesta.
- Tool calling opcional: `track_state` registra seis valores emocionales de 0 a 100 antes y despues de cada turno, con una razon explicativa.
- Uso de detalles recordados de sesiones anteriores en las respuestas.
- Formato consistente: asteriscos para acciones y comillas para dialogo (40/40 comprobaciones superadas).
- Soporte de conversaciones con historial corto sin que las respuestas se reduzcan en exceso.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo mantiene la coherencia del personaje en chats extensos gracias al entrenamiento especifico en 1.575 conversaciones multi-turno, incluyendo historiales largos.
- Personajes con estado emocional dinamico: mediante `track_state` se pueden construir agentes que reaccionen de forma consistente a la evolucion emocional de la conversacion, util en narrativa interactiva o videojuegos.
- Simulacion de dialogo con pensamiento interno: `inner_thoughts` permite generar una capa de monologo interno que enriquece la respuesta visible, util para ficcion interactiva y prototipos de agentes con "voz interior".
- Prototipado de asistentes con personalidad: al ser un modelo de 8B con licencia Apache 2.0, sirve para experimentar con asistentes conversacionales con caracter definido sin coste de licencia.
- Despliegue local en Apple Silicon: la build MLX de 5,38 GB permite ejecutar el modelo en portatiles Mac para pruebas de personajes sin depender de la nube.
- Integracion en pipelines de chat via llama.cpp u Ollama: los GGUF Q4_K_M (5,03 GB) y Q8_0 (8,71 GB) facilitan su inclusion en aplicaciones de escritorio o servidores modestos.
- Generacion de guiones y dialogos para narrativa: el formato consistente (acciones entre asteriscos, dialogo entre comillas) simplifica el postprocesado de textos narrativos.

## Benchmarks y rendimiento

| Comparativa | Victorias Prism 2 | Victorias rival | Empates |
|---|---|---|---|
| vs Prism Roleplay 1.5 Small, 76 prompts (juicio estandar) | 43 | 2 | 31 |
| vs Prism Roleplay 1.5 Small, 76 prompts (juicio neutral a longitud) | 39 | 2 | 34 |
| vs Prism Roleplay 1.5 Small, escenas unicas (24) | 10 | 0 | 14 |
| vs Prism Roleplay 1.5 Small, memoria (16) | 3 | 2 | 11 |
| vs Prism Roleplay 1.5 Small, multi-turno (12) | 7 | 0 | 5 |
| vs Prism Roleplay 1.5 Small, multi-turno historial corto (12) | 12 | 0 | 0 |
| vs Prism Roleplay 1.5 Small, multi-turno historial largo (12) | 11 | 0 | 1 |
| vs Qwen3-8B base, 52 prompts (un juez) | 32 | 6 | 14 |
| vs Qwen3-8B base, multi-turno | 11 | 0 | 1 |

| Metrica adicional | Prism Roleplay 2 | Qwen3-8B base |
|---|---|---|
| Llamadas validas a `inner_thoughts` (build 6-bit) | 23/24 | 24/24 |
| Llamadas validas a `track_state` (build 6-bit) | 23/24 | 24/24 |
| Longitud mediana de pensamiento | 64 palabras | 47 palabras |
| Pensamientos con direcciones de escena | 0/23 | 0/24 |
| Cambio medio total de estado por turno | 65,6 | 29,1 |
| Longitud mediana de respuesta | 126 palabras | no disponible (1.5: 80 palabras) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4 GB en MLX mixta, 5,0 GB en GGUF Q4_K_M y 8,7 GB en GGUF Q8_0.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para Q4_K_M (RTX 3060 Ti, RTX 4060, RTX 3070); 12 GB o mas para Q8_0 (RTX 4070, RTX 3080 Ti); A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, tanto en Q4_K_M como en Q8_0 con 8-12 GB de VRAM.
- Apple Silicon: la build MLX esta pensada para mlx-lm en chips M-series.
- Opciones de despliegue: mlx-lm (MLX), llama.cpp, Ollama, LM Studio (GGUF). Compatible con endpoints segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Prism Roleplay 2 Small | 8,19B | no disponible | Apache 2.0 | MLX, GGUF | Especializado en roleplay multi-turno con tools de pensamiento y estado |
| Prism Roleplay 1.5 Small | 8B (base Qwen3-8B) | no disponible | Apache 2.0 | no disponible | Predecesor; mas debil en multi-turno y sin tools |
| Qwen3-8B base | 8,19B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista sin ajuste de roleplay |
| Alternativas de roleplay de 8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La evaluacion es pequena y automatizada: 76 y 52 prompts escritos a mano, juzgados por dos modelos de lenguaje (nemotron-3-ultra y muse-glimmer-30b), sin evaluacion humana. Los dos jueces solo coincidieron en 49 de 76 pares.
- Uno de los jueces (Muse Glimmer) escribio parte de los pensamientos de entrenamiento, lo que puede favorecer ligeramente al modelo.
- Las respuestas son mas largas que en 1.5 (mediana de 126 frente a 80 palabras), lo que puede no ser deseable en todos los contextos.
- La mejora en memoria es modesta (3 victorias, 2 derrotas y 11 empates frente a 1.5).
- El seguimiento de estado (`track_state`) es valido pero sobrerreacciona: cambia casi todos los valores en casi todos los turnos (cambio medio de 65,6 frente a 29,1 del base), por lo que sus numeros deben tratarse como aproximados.
- No es un modelo ajustado para seguridad: los datos se filtraron para eliminar contenido sexual, pero la base Qwen3 puede generar cualquier contenido. No debe usarse como capa de moderacion.
- Al ser un modelo de 8B con LoRA, las sesiones muy largas pueden derivar en incoherencias.
- El modelo solo soporta ingles.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad por el contenido generado.

## Enlaces

- Hugging Face: https://huggingface.co/VertexAGI/prism-roleplay-2-small
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
