# tinyrolls/Qwen3-8B-Thinking-RoleVerse-DPO

## Resumen

Qwen3-8B-Thinking-RoleVerse-DPO es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario tinyrolls como parte de la investigacion "Knows but Cannot Act: A Reasoning-Social Trade-off in Multilingual Role-Playing". El modelo se ha entrenado exclusivamente con DPO (Direct Preference Optimization) sobre el dataset RoleVerse, un benchmark multilingue de role-playing centrado en situaciones de conflicto y evaluado con un protocolo dual de "saber-actuar": una pregunta de opcion multiple que mide la comprension social y una respuesta abierta que se juzga segun su adecuacion al personaje.

El objetivo del trabajo es estudiar el equilibrio entre razonamiento y competencia social en modelos de lenguaje multilingues. Los resultados del paper muestran que los modelos con mayor capacidad de razonamiento comprenden mejor la escena social pero la interpretan peor, y que ambas dimensiones pueden moverse en direcciones opuestas mediante entrenamiento. Este checkpoint concreto parte de la variante Thinking de Qwen3-8B y aplica solo DPO, sin SFT, lo que permite aislar el efecto del ajuste por preferencias.

El modelo conserva la arquitectura y el contexto del Qwen3-8B original, con 8.190.735.360 parametros y licencia Apache-2.0. Es relevante para investigadores interesados en role-playing multilingue, alineacion mediante DPO y el estudio del trade-off entre razonamiento explicito y comportamiento social.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo contiene safetensors en precision completa (16,4 GB) |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B en su variante Thinking, un transformer decoder-only de 8.190 millones de parametros. Sobre esa base se aplica unicamente DPO (sin SFT previo) utilizando el dataset RoleVerse, un corpus multilingue de dialogos de role-playing construido alrededor de situaciones de conflicto. El entrenamiento busca mejorar la calidad de las respuestas de personaje (dimension "act") sin degradar necesariamente la comprension social (dimension "know"), y el paper compara esta configuracion con SFT solo, DPO solo y SFT+DPO sobre varias familias de modelos (Llama-3.1-8B-Instruct, Qwen3-8B Non-thinking, Qwen3-8B Thinking y R1-Distill-Qwen3-8B).

La innovacion principal del trabajo no es arquitectonica sino metodologica: el protocolo dual de evaluacion separa la comprension de la situacion social (pregunta de opcion multiple) de la ejecucion del personaje (respuesta abierta juzgada en cinco dimensiones de 1 a 5 por GPT-5 como juez). Los experimentos muestran que el razonamiento explicito mejora la puntuacion MCQ pero puede empeorar la respuesta enactiva, y que DPO solo tiende a mejorar la respuesta enactiva a costa de cierta comprension social. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset mas alla de su naturaleza multilingue y su enfoque en conflicto.

## Capacidades

- Generacion de texto conversacional y role-playing multilingue en ingles, chino, japones, frances y espanol.
- Razonamiento explicito en modo Thinking: las respuestas se emiten tras el bloque `</think>`, lo que permite separar el razonamiento interno de la respuesta final.
- Dialogo multi-turno con alternancia de roles: el modelo interpreta a `role2` mientras las intervenciones de `role1` se presentan como turnos de usuario.
- Comprension de situaciones sociales y de conflicto, evaluada mediante preguntas de opcion multiple en el benchmark RoleVerse.
- Capacidades heredadas de Qwen3-8B: generacion de codigo, matematicas y razonamiento general (no evaluadas especificamente en este checkpoint).
- Soporte de plantilla de chat via `apply_chat_template` con el parametro `enable_thinking` para alternar entre modo Thinking y Non-thinking.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion con DPO: el checkpoint permite reproducir y comparar el efecto de DPO solo frente a SFT solo y SFT+DPO en la misma base Qwen3-8B, aislando la contribucion del ajuste por preferencias.
- Evaluacion de role-playing multilingue: sirve como linea base entrenada para medir el trade-off entre comprension social (MCQ) y ejecucion de personaje (Resp Avg) en el benchmark RoleVerse.
- Generacion de dialogos de personaje en produccion de contenido: el modelo mantiene la coherencia de un personaje a lo largo de conversaciones multi-turno en cinco idiomas, util para prototipos de narrativa interactiva.
- Simulacion de conversaciones de conflicto para entrenamiento: puede generar respuestas de personaje en escenarios tensos, aprovechable en simuladores de negociacion o formacion en habilidades sociales.
- Estudio del modo Thinking en tareas sociales: al conservar el bloque de razonamiento, permite analizar si el razonamiento explicito ayuda o perjudica la enactacion del personaje en distintos idiomas.
- Base para nuevos ajustes: al ser Apache-2.0 y safetensors, puede servir como punto de partida para fine-tuning adicional en dominios concretos de dialogo o para destilacion de comportamiento social.
- Evaluacion comparativa de jueces automaticos: el protocolo del paper usa GPT-5 como juez con cinco dimensiones, y este checkpoint permite replicar esas evaluaciones con un modelo abierto.

## Benchmarks y rendimiento

Resultados del paper en el conjunto de test de RoleVerse. Resp Avg es la media de cinco dimensiones de respuesta (1-5, juez GPT-5); MCQ % es la precision en comprension social.

| Grupo | Modelo | Resp Avg | MCQ % |
|---|---:|---:|---:|
| No entrenado | Qwen2.5-32B-Instruct | 2,79 | 48,67 |
|  | R1-Distill-Qwen-32B | 2,38 | 53,28 |
|  | Qwen3-30B-A3B-Instruct-2507 | 3,69 | 41,73 |
|  | Qwen3-30B-A3B-Thinking-2507 | 3,40 | 52,27 |
|  | gpt-oss-120b (low) | 3,15 | 67,30 |
|  | gpt-oss-120b (medium) | 3,00 | 72,60 |
|  | gpt-oss-120b (high) | 2,93 | 73,04 |
|  | DeepSeek-R1-0528 | 4,12 | 70,14 |
|  | GPT-5 (low; oracle, solo referencia) | 4,35 | 81,88 |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
|  | + Only SFT | 3,35 | 19,07 |
|  | + Only DPO | 3,42 | 32,39 |
|  | + SFT & DPO | 3,81 | 17,05 |
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
|  | + Only SFT | 3,35 | 32,07 |
|  | + Only DPO | 3,42 | 35,23 |
|  | + SFT & DPO | 3,73 | 31,57 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
|  | + Only SFT | 3,38 | 37,75 |
|  | **+ Only DPO (este checkpoint)** | **3,60** | **43,12** |
|  | + SFT & DPO | 3,61 | 34,60 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
|  | + Only SFT | 2,15 | 31,50 |
|  | + Only DPO | 3,07 | 49,62 |
|  | + SFT & DPO | 3,07 | 28,85 |

El checkpoint DPO solo sobre Qwen3-8B Thinking mejora tanto la respuesta enactiva (3,38 a 3,60) como la comprension social (40,85 a 43,12) respecto a la base, un patron que no se repite en las demas configuraciones y que constituye el hallazgo central del trabajo para esta base concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB de VRAM.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB.
- Cuantizacion a 4 bits (si se generan pesos GGUF/AWQ/GPTQ, no incluidos en el repo): alrededor de 4-5 GB de pesos, viable en GPUs de 8 GB.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para despliegue en precision completa con lotes grandes; RTX 4090 (24 GB) para inferencia en bf16 con una sola peticion; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 8-16 GB con cuantizacion.
- Opciones de despliegue: transformers (referencia oficial en la model card), text-generation-inference (tag `text-generation-inference` presente), endpoints compatibles; no se documenta soporte explicito de vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resp Avg (RoleVerse) | MCQ % | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3-8B-Thinking-RoleVerse-DPO (este) | 8,19 B | no disponible | 3,60 | 43,12 | Apache-2.0 | Hugging Face |
| Qwen3-8B Thinking base | 8,19 B | no disponible | 3,38 | 40,85 | Apache-2.0 | Hugging Face |
| Qwen3-8B Thinking + SFT & DPO | 8,19 B | no disponible | 3,61 | 34,60 | Apache-2.0 | Hugging Face |
| Llama-3.1-8B-Instruct + Only DPO | 8 B | no disponible | 3,42 | 32,39 | Llama 3.1 Community | Hugging Face |
| R1-Distill-Qwen3-8B + Only DPO | 8 B aprox. | no disponible | 3,07 | 49,62 | MIT | Hugging Face |

Frente a la base sin entrenar, este checkpoint mejora ambas metricas. Frente a la variante SFT+DPO de la misma base, obtiene mejor comprension social (43,12 frente a 34,60) con una respuesta enactiva practicamente identica. Frente a Llama-3.1-8B-Instruct con DPO, mejora en ambas dimensiones. Frente a R1-Distill-Qwen3-8B con DPO, mejora la respuesta enactiva pero queda por debajo en comprension social, lo que ilustra el trade-off razonamiento-sociedad descrito en el paper.

## Limitaciones y advertencias

- El modelo esta entrenado unicamente para role-playing sobre el dataset RoleVerse; su comportamiento fuera de ese dominio no esta evaluado y puede degradarse respecto a la base Qwen3-8B.
- El paper esta en revision y el benchmark RoleVerse es de nueva creacion; los resultados no han sido replicados de forma independiente.
- La evaluacion usa GPT-5 como juez, lo que introduce dependencia de un modelo propietario y posibles sesgos del juez en las puntuaciones de respuesta.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en el modo Thinking donde el razonamiento explicito puede generar cadenas plausibles pero incorrectas.
- El modelo habla como `role2`; usarlo con otra convencion de roles puede producir respuestas incoherentes.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada, pero el dataset se centra en situaciones de conflicto y puede sobrerrepresentar ciertos patrones de interaccion social.
- Cobertura limitada a cinco idiomas (en, zh, ja, fr, es); el rendimiento en otros idiomas no esta garantizado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-8B y las dependencias deben verificarse por separado; el dataset RoleVerse puede tener condiciones propias.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- El repositorio pesa 16,4 GB y solo incluye safetensors; no hay pesos cuantizados oficiales, lo que obliga a cuantizar localmente para despliegues en GPU consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyrolls/Qwen3-8B-Thinking-RoleVerse-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Coleccion RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Codigo del proyecto: https://github.com/tinyrolls/RoleVerse
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
