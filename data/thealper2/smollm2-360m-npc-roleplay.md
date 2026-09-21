# thealper2/SmolLM2-360M-NPC-Roleplay

## Resumen

SmolLM2-360M-NPC-Roleplay es un ajuste fino supervised fine-tuning (SFT) con LoRA sobre HuggingFaceTB/SmolLM2-360M-Instruct, publicado por el usuario thealper2, orientado especificamente a interpretar personajes no jugadores (NPC) en conversaciones multi-turno. El modelo recibe una "ficha de personaje" en el turno `system` con nombre, trasfondo, ubicacion actual e instrucciones de interpretacion, y a partir de ahi mantiene un dialogo alternando turnos de jugador (`user`) y NPC (`assistant`) en la voz de ese personaje.

Tecnicamente es un transformer decoder-only de 361.821.120 parametros en el que solo se entrenaron 8.683.520 parametros (el 2,3999 %) mediante adaptadores LoRA de rango 16 sobre siete modulos de proyeccion. El entrenamiento se hizo sobre 1.513 conversaciones del dataset chimbiwide/NPC-Dialogue_v2, con 91 personajes en el conjunto de entrenamiento y 10 personajes completamente reservados para validacion, de modo que la evaluacion mide la capacidad de interpretar un NPC no visto en vez de memorizar dialogos.

Su relevancia practica es doble: por un lado demuestra que un modelo de 360M puede asumir roleplay condicionado por ficha con solo 25 minutos de entrenamiento en una GPU de consumo (RTX 5060 Ti, 9,93 GB de pico); por otro, ofrece un artefacto pequeno y desplegable en local para prototipado de dialogos de personaje. El repositorio incluye tanto los pesos fusionados como el adaptador LoRA en la subcarpeta `adapter/`, y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2), ajustado mediante LoRA |
| Parametros totales | 361.821.120 (aproximadamente 362 M) |
| Parametros activos | No aplica (no es MoE); 8.683.520 parametros entrenables en el adaptador LoRA (2,3999 %) |
| Longitud de contexto | 2.048 tokens (longitud maxima de secuencia usada en el entrenamiento); no se especifica en la informacion proporcionada si se conserva la ventana nativa del modelo base |
| Tipos de cuantizacion | No disponible. El repositorio distribuye pesos en safetensors (los ejemplos de uso cargan en bfloat16); no se incluyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors: pesos fusionados cargables con `AutoModelForCausalLM` y adaptador PEFT en `adapter/` |
| Plantilla de chat | ChatML (la del modelo base), con la ficha de personaje en el turno `system` |
| Datos de entrenamiento | chimbiwide/NPC-Dialogue_v2 (config `dialogue`): 1.689 conversaciones de 16 mensajes sobre 101 personajes |
| Tamano del repositorio | 0,8 GB |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only denso de 361,8 M de parametros. El ajuste no modifica la arquitectura: se aplica LoRA con rango 16, alpha 32 y dropout 0,05 sobre `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`, lo que da 8.683.520 parametros entrenables. El entrenamiento usa TRL `SFTTrainer` con mascara de perdida solo sobre los turnos del asistente (plantilla de chat con `{% generation %}`), de modo que los tokens de sistema y usuario no contribuyen al gradiente; el autor indica que esto se verifico sobre un lote colacionado antes del entrenamiento. Los hiperparametros principales son: 3 epocas, 285 pasos de optimizacion, batch efectivo de 16 (8 por dispositivo x 2 de acumulacion de gradiente), learning rate 2e-4 con scheduler coseno y warmup 0,05, weight decay 0,01, recorte de gradiente 1,0, optimizador `adamw_torch_fused`, precision bf16 y gradient checkpointing activado. El entrenamiento completo tardo 24,82 minutos en una NVIDIA GeForce RTX 5060 Ti con 9,93 GB de memoria de GPU en el pico, semilla 42.

El dataset de partida contiene 1.689 conversaciones multi-turno de 16 mensajes sobre 101 personajes de fantasia. El preprocesado incluye una decision relevante: en cada fila, el primer mensaje de `user` era en realidad la ficha del personaje, y se movio a un turno `system` real para que el modelo se condicione por el personaje en vez de aprender a reproducir la ficha. Tambien se eliminaron turnos vacios y se fusionaron turnos consecutivos del mismo rol (3 filas afectadas). No hubo truncamiento: la conversacion mas larga mide 1.694 tokens, por debajo del limite de 2.048. El split es por personaje: 91 personajes (1.513 conversaciones) para entrenamiento y 10 personajes (176 conversaciones) reservados para validacion, sin solapamiento de personajes entre ambos conjuntos. La mediana de tokens por conversacion es 1.139.

## Capacidades

- Generacion de texto conversacional en ingles con condicionamiento por ficha de personaje incluida en el turno `system`.
- Interpretacion de rol multi-turno: mantiene el tono, el vocabulario y las referencias al trasfondo y al escenario descritos en la tarjeta.
- Apertura de conversacion: en entrenamiento el NPC habla primero, de modo que el modelo genera un saludo inicial coherente con el personaje.
- Reaccion al contenido del jugador, incluyendo instrucciones como reparar un objeto o responder a una peticion dentro de la ficcion.
- Respuestas mas largas que el modelo base: 54,6 palabras de media en las pruebas held-out frente a 31,6 del base.
- Capacidad de generalizacion a personajes no vistos: la validacion se hizo sobre 10 personajes ausentes del entrenamiento, con perplejidad 8,58 frente a 12,56 del modelo base.
- Soporte de tool calling / function calling: no se documenta en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no se documenta; el fine-tune esta centrado en dialogo de personaje.
- Capacidades multimodales (vision, audio) o modo "thinking": no disponibles.
- Capacidades multilingues: no; el modelo se entrena y evalua unicamente en ingles.

## Casos de uso

- NPCs en videojuegos independientes: el modelo se carga en el cliente o en un servidor ligero y genera dialogos en tiempo real a partir de una ficha por personaje, con 362 M de parametros en bfloat16 (aproximadamente 0,72 GB de pesos) cabe en GPUs de gama media y en equipos sin GPU dedicada.
- Prototipado rapido de personajes en preproduccion narrativa: guionistas y disenadores pueden escribir una tarjeta con el formato documentado (`Enter roleplay mode. You are <Nombre>. Background: ... Current Location: ...`) y conversar con el personaje para validar su voz antes de encargar contenido definitivo.
- Generacion de datos sinteticos de dialogo: sirve para ampliar datasets de roleplay o alimentar clasificadores y evaluadores de dialogo, ya que produce respuestas mas largas y consistentes con el escenario que el modelo base.
- Simulaciones de entrenamiento conversacional: entrevistas de practica, negociaciones o simulacros de atencion al cliente donde el interlocutor debe encarnar un rol concreto con un trasfondo fijo.
- Asistentes de compania o chat de personaje en local y sin conexion: al ser un modelo pequeno y con licencia Apache-2.0, se puede empaquetar en aplicaciones de escritorio o moviles con inferencia en CPU, evitando enviar conversaciones a servicios externos.
- Referencia reproducible de fine-tuning LoRA: el repositorio documenta dataset, hiperparametros, tiempo de entrenamiento y memoria pico, por lo que es util como plantilla para ajustar el mismo esquema a otros dominios de dialogo.
- Modulo de dialogo para demos educativas: permite ilustrar en un aula como el condicionamiento por turno `system` y la mascara de perdida sobre el asistente cambian el comportamiento de un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta metricas de perdida y perplejidad propias del ajuste, comparadas con el modelo base bajo identicas condiciones de decodificacion sobre 10 pruebas de respuesta unica con 10 personajes no vistos en entrenamiento.

| Metrica | Modelo ajustado | SmolLM2-360M-Instruct (base) |
|---|---|---|
| Perplejidad en held-out (10 personajes no vistos) | 8,58 | 12,56 |
| Longitud media de respuesta (palabras) | 54,6 | 31,6 |
| Perdida final de entrenamiento | 2,2019 | No aplica |
| Perdida de validacion (tokens del asistente) | 2,1488 | No aplica |
| Perplejidad de validacion reportada por el autor | 8,57 | No disponible |

Nota: la model card lista una perplejidad de validacion de 8,57 y una perplejidad held-out de 8,58 para el modelo ajustado; se reproducen ambos valores tal como aparecen.

## Requisitos de hardware

- VRAM para inferencia en bfloat16/fp16: aproximadamente 0,72 GB solo de pesos, mas activaciones y cache KV; un presupuesto practico de 1 a 2 GB es suficiente.
- VRAM en cuantizacion de 8 bits: aproximadamente 0,36 GB de pesos (estimacion calculada a partir de los 361.821.120 parametros, no verificada por el autor).
- VRAM en cuantizacion de 4 bits: aproximadamente 0,18 GB de pesos (misma estimacion teorica).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100; tambien es viable en iGPU modernas y en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, y tambien en CPU con cuantizacion.
- Entrenamiento (LoRA, seq. 2.048, batch 8, acumulacion 2): el autor reporta 9,93 GB de pico en una RTX 5060 Ti, 285 pasos y 24,82 minutos.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (pesos fusionados), `peft` con `PeftModel` (adaptador), y servidores de inferencia compatibles con modelos de la familia SmolLM2 como vLLM o TGI. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se incluye en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada (no se publican tokens por segundo ni latencias medidas).
- Parametros de generacion sugeridos por el autor: `max_new_tokens=160`, `do_sample=True`, `temperature=0.8`, `top_p=0.9`, `repetition_penalty=1.1`.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la informacion proporcionada; se indican solo los campos conocidos y el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-360M-NPC-Roleplay | 361,8 M (8,68 M entrenables en LoRA) | 2.048 tokens en entrenamiento | Apache-2.0 | Roleplay de NPC condicionado por ficha de personaje | Pesos fusionados en safetensors y adaptador LoRA |
| SmolLM2-360M-Instruct | 361,8 M | No disponible en la informacion proporcionada | Apache-2.0 | Asistente de instrucciones generales | HuggingFace (modelo base) |
| Qwen2.5-0.5B-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Asistente de instrucciones generales, multilingue | HuggingFace |
| Llama-3.2-1B-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Asistente de instrucciones generales | HuggingFace |

No hay datos de benchmarks comparables entre estas alternativas en la informacion disponible, por lo que no se puede establecer una comparacion de rendimiento objetiva. La ventaja diferencial de este modelo no es la puntuacion en tareas generales, sino el condicionamiento especifico por ficha de personaje y su tamano reducido para inferencia local.

## Limitaciones y advertencias

- Con 360 M de parametros, la consistencia de la persona se degrada en conversaciones largas y el modelo puede contradecir su propio trasfondo; es una limitacion reconocida explicitamente por el autor.
- Riesgo de alucinacion dentro de la ficcion: puede inventar detalles del entorno o de la historia del personaje que no estan en la tarjeta.
- Solo ingles: no hay soporte multilingue documentado.
- La ventana efectiva de entrenamiento es de 2.048 tokens; el comportamiento mas alla de esa longitud no esta validado en la informacion disponible.
- No se documentan benchmarks estandar, evaluacion de sesgos ni pruebas de seguridad. Las unicas metricas publicadas son perdida y perplejidad sobre 10 pruebas held-out.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no ha pasado por validacion de la comunidad.
- Licencia Apache-2.0 para los pesos del ajuste y para el modelo base, lo que en principio permite uso comercial; no obstante, no se especifica la licencia del dataset chimbiwide/NPC-Dialogue_v2 en la informacion proporcionada, por lo que conviene verificarla antes de un uso comercial.
- El ajuste esta pensado para roleplay de fantasia: fuera de ese dominio el comportamiento no esta caracterizado y probablemente degrade respecto al modelo base.
- La model card incluye un aviso indicando que su contenido es material de referencia y no instrucciones; conviene tratarla como documentacion del autor, no como especificacion verificada.
- Las fechas de creacion y actualizacion registradas (2026-09-21) son posteriores a la mayoria de referencias de la familia SmolLM2, dato a tener en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/SmolLM2-360M-NPC-Roleplay
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/NPC-Dialogue_v2
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas de descarga del navegador Google Chrome, sin relacion con el modelo.
