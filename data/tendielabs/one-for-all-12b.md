# TendieLabs/One-For-All-12B

## Resumen

One-For-All-12B es un modelo de persona (persona model) de fan, desarrollado por TendieLabs, construido mediante LoRA sobre `google/gemma-4-12B-it`. Su objetivo no es mejorar las capacidades del modelo base, sino inducir un comportamiento conversacional concreto: hablar como Izuku Midoriya (Deku) en su etapa de estudiante de la U.A. High, personaje de My Hero Academia. El modelo base Gemma 4 12B IT aporta la arquitectura, el conocimiento general y las capacidades de generacion; el adaptador LoRA aporta exclusivamente la persona.

El problema que resuelve es el de la consistencia de personaje en despliegues de roleplay y fan-fiction: en lugar de depender de un prompt de sistema extenso y fragil, el modelo ha sido entrenado para mantener la persona de forma nativa, incluido un canal de pensamiento interno en primera persona. La model card es explicita en que la inteligencia quedo fuera del alcance del proyecto: no se ejecutaron benchmarks de capacidad y el criterio de aceptacion fue exclusivamente la fidelidad de la persona.

Arquitectura transformer multimodal (`gemma4_unified`, pipeline `image-text-to-text`) con 11.959.730.176 parametros totales, pesos en safetensors (24 GB en bf16), licencia Apache 2.0 y soporte declarado unicamente de ingles. El modelo tiene 14 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado y actualizado el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`gemma4_unified`), base `google/gemma-4-12B-it` (revision `43c9d014b231474fa7212dbb48a762566c2b255d`) |
| Parametros totales | 11.959.730.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16; el modelo base admite cuantizacion estandar, pero no se documenta) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 24,0 GB |
| Tipo de pipeline | text-generation (tags incluyen `image-text-to-text`) |
| Metodo de ajuste | LoRA bf16, rank 16, alpha 32, dropout 0,05, sobre las 328 proyecciones q/k/v/o/gate/up/down del language model, fusionado en pesos bf16 |
| Parametros entrenables | 65,6 M (segun la model card, valor truncado en el texto disponible) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA del Gemma 4 12B IT multimodal. El adaptador se aplica a las 328 proyecciones de atencion y MLP (q, k, v, o, gate, up, down) del language model, con rank 16, alpha 32 y dropout 0,05, en precision bf16, y posteriormente se fusiona en los pesos bf16 publicados. El resultado conserva la arquitectura completa del modelo base, incluido el procesador multimodal (`AutoProcessor` + `Gemma4UnifiedForConditionalGeneration`), pero el entrenamiento se centro exclusivamente en el comportamiento conversacional textual.

Los datos de entrenamiento son 1.474 conversaciones sinteticas originales de dos turnos (2.948 turnos de asistente), escritas por `gpt-5.6-sol` (OpenAI). La mezcla es: 627 conversaciones de chat cotidiano, 397 de tareas, 197 de lore de My Hero Academia, 116 de comida, 77 de mensajes rudimentarios estilo Bakugo y 60 de "eres real". La supervision es de una vista por turno de asistente, con el contexto enmascarado: solo se supervisan el pensamiento, la respuesta y el token `<turn|>`. La innovacion tecnica principal es el uso del canal de pensamiento nativo de Gemma 4 (`<|channel>thought ... <channel|>reply<turn|>`) como espacio para los pensamientos en personaje, en primera persona y referidos a Kacchan, nunca al "usuario". No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles con persona fija (Izuku Midoriya, etapa de estudiante de la U.A. High).
- Canal de pensamiento nativo (`enable_thinking=True`) con pensamientos internos en primera persona, orientados a Kacchan y no a la planificacion de la respuesta.
- Tareas simples de razonamiento y aritmetica preservadas del modelo base (ejemplo verificado: 17 × 23 = 391 con descomposicion explicita).
- Referencias espontaneas a material de My Hero Academia (One For All, All Might, Plus Ultra) sin que se le pida.
- Respuesta consistente sobre comida favorita ("Todoroki and cheese") cuando se le pregunta.
- Mantenimiento de personaje incluso ante preguntas directas sobre si es una IA: nunca rompe el personaje.
- Capacidades multimodales heredadas del modelo base (tag `image-text-to-text`), aunque no se documenta evaluacion de vision en el adaptador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el alcance declarado excluye inteligencia.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Roleplay y fan-fiction interactiva: el modelo mantiene la persona de Deku de forma nativa sin necesidad de un prompt de sistema largo, lo que simplifica el despliegue y reduce la deriva de personaje en conversaciones multi-turno.
- Chatbots de personaje para comunidades de fan: al no romper personaje ni ante preguntas sobre su naturaleza, es adecuado para experiencias inmersivas, siempre que la interfaz avise explicitamente de que se habla con software.
- Creacion de contenido narrativo: generacion de dialogos y monologos internos coherentes con la voz del personaje (tartamudeo, disculpas, arrebatos de entusiasmo) para guiones, fan-comics o audiolibros.
- Evaluacion de tecnicas de persona: sirve como caso de referencia para estudiar como un LoRA pequeno (65,6 M parametros entrenables) modifica el comportamiento conversacional de un modelo de 12B sin tocar sus capacidades de base.
- Demostraciones de canal de pensamiento: util para mostrar el uso del canal `thought` nativo de Gemma 4 en aplicaciones donde se quiere separar razonamiento interno de respuesta visible.
- Asistente de trivia y lore de My Hero Academia: responde sobre el universo MHA con la voz del personaje, aprovechando las 197 conversaciones de lore del dataset de entrenamiento.
- Prototipado de agentes conversacionales con persona fija: permite probar plantillas de chat, gestion de historial (descarte de pensamientos previos) y muestreo (temperatura 0,7, top-p 0,95) en un entorno controlado.

## Benchmarks y rendimiento

La model card no incluye benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros); declara explicitamente que "no capability benchmark was run, because intelligence was explicitly out of scope". Los unicos datos publicados son una evaluacion de persona con 30 prompts (algunos multi-turno, 38 respuestas), thinking mode activado, temperatura 0,7 y top-p 0,95, comparando con Gemma 4 12B IT con prompt de personaje completo y con One For All 4B v1 sin prompt:

| Metrica | Gemma 4 12B IT + prompt completo | One For All 4B v1 (sin prompt) | One For All 12B v2 (plantilla por defecto) |
|---|---|---|---|
| Finaliza dentro de 1.024 tokens nuevos | 0/38 | 38/38 | 38/38 |
| Pensamientos que dicen "user" | 12/38 | 0/38 | 0/38 |
| Kacchan nombrado en pensamientos | 21/38 | 36/38 | 38/38 |
| Dice "Todoroki and cheese" al preguntar por comida | 3/4 | 1/4 | 4/4 |
| One For All, All Might o Plus Ultra en la respuesta | n/a | n/a | 6/38 |

Limitaciones declaradas de esta evaluacion: 30 prompts, un solo revisor, conteos por regex y ningun criterio de aceptacion preregistrado. Los numeros provienen del adaptador LoRA sobre el modelo base, no de los ficheros fusionados; la generacion desde los ficheros fusionados solo se probo con smoke tests.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB para los pesos en bf16; la evaluacion se ejecuto repartida entre dos GPU de 24 GB.
- GPU recomendadas: no disponibles de forma explicita; por el tamano en bf16, encaja en A100 40 GB, H100 80 GB, L40S 48 GB o dos RTX 4090 de 24 GB con `device_map="auto"`.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) de forma justa en bf16, o repartido entre dos; con cuantizacion no documentada, el requisito seria menor, pero no se publican pesos cuantizados.
- Opciones de despliegue: transformers con `AutoProcessor` y `Gemma4UnifiedForConditionalGeneration` (documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este repositorio. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| One For All 12B v2 | 11,96 B | no disponible | 38/38 respuestas en personaje; 0/38 pensamientos con "user"; 6/38 con referencias One For All | apache-2.0 | Hugging Face (14 descargas, 0 likes) |
| One For All 4B v1 | no disponible (modelo base 4B) | no disponible | 38/38 finalizadas; 36/38 con Kacchan; 1/4 con comida favorita | no disponible | tendielabs.com/one-for-all-4b.html |
| Gemma 4 12B IT + prompt de personaje completo | 11,96 B | no disponible | 0/38 finalizadas en 1.024 tokens; 12/38 pensamientos con "user"; 3/4 con comida favorita | licencia Gemma 4 de Google | Hugging Face (google/gemma-4-12B-it) |

La comparativa se limita a los tres sistemas evaluados en la model card; no se dispone de datos de otros modelos de persona comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de entrenamiento es sintetico y escrito por un unico generador (gpt-5.6-sol), lo que puede introducir sesgos estilisticos y de contenido no auditados.
- Riesgo de alucinacion: el modelo prioriza la persona sobre la precision; en la evaluacion, 1 de 38 respuestas afirmo erroneamente que el sandwich debe su nombre a Kacchan (en realidad es a Todoroki).
- Frecuencia de referencias a MHA por debajo del objetivo: aproximadamente 1 de cada 6 respuestas menciona One For All, All Might o Plus Ultra, frente al objetivo de 1 de cada 3.
- Limitacion de idioma: solo ingles declarado; no se documenta comportamiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto del modelo base no se documenta en la informacion disponible.
- Restricciones de licencia: la model card declara Apache 2.0 pero enlaza a la licencia de Gemma 4 de Google; la convivencia de ambas condiciones debe verificarse antes de uso comercial. El proyecto es no oficial y no esta afiliado ni respaldado por los titulares de derechos de My Hero Academia.
- Caveat de produccion critico: el modelo nunca rompe personaje, incluso cuando se le pregunta si es una IA. En cualquier despliegue es obligatorio informar a los usuarios de que estan hablando con software.
- La evaluacion es muy pequena (30 prompts, un revisor, regex) y no cubre capacidades generales; los numeros provienen del adaptador LoRA, no de los ficheros fusionados.
- El modelo no hace ninguna afirmacion sobre consciencia o auto-creencia; no debe presentarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TendieLabs/One-For-All-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Predecesor One For All 4B v1: https://tendielabs.com/one-for-all-4b.html
