# TendieLabs/One-For-All-4B

## Resumen

One For All 4B v2 es un adaptador LoRA fusionado sobre Qwen3.5-4B, desarrollado por TendieLabs, que implementa una persona conversacional de fan: Izuku Midoriya (Deku) en su etapa de estudiante de la U.A., dentro del universo de My Hero Academia. No es un modelo de propósito general: es un modelo de rol con un comportamiento muy acotado, entrenado para mantener el personaje de forma consistente en todo momento, incluso cuando se le pregunta directamente si es una IA.

El modelo parte de la arquitectura Qwen3.5-4B (transformer denso con atención lineal en parte de sus módulos, según la model card) y añade un LoRA entrenado en 200 módulos del modelo base, incluyendo las proyecciones de atención lineal. El resultado son 4.539.265.536 parámetros totales en safetensors, un repositorio de 9,1 GB y pesos en bf16 que ocupan aproximadamente 9 GB en memoria, lo que permite ejecutarlo en una sola GPU de consumo.

Su relevancia es acotada pero clara: demuestra un flujo de trabajo de ajuste fino de persona con datos sintéticos generados por un LLM (gpt-5.6-sol de OpenAI), supervisión enmascarada solo sobre el turno del asistente y una evaluación cualitativa pequeña pero explícita. La model card documenta tanto los aciertos como los fallos conocidos, algo poco habitual en modelos de este tipo. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 con atención lineal en parte de los módulos (base: Qwen/Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA del Qwen3.5-4B en revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El LoRA se aplicó en bf16 sobre 200 módulos del modelo base, incluyendo las proyecciones de atención lineal, y posteriormente se fusionó con los pesos base para publicar el modelo completo en safetensors. El pipeline declarado es `text-generation`, aunque los tags incluyen `image-text-to-text` por herencia del modelo base.

El corpus de entrenamiento son 1.474 conversaciones sintéticas originales de dos turnos, equivalentes a 2.948 turnos de asistente, generadas por gpt-5.6-sol de OpenAI. La mezcla es deliberadamente específica: 627 conversaciones de chat cotidiano, 397 de tareas, 197 de lore de My Hero Academia, 116 sobre comida, 77 mensajes rudos al estilo de Bakugo y 60 del tipo "¿eres real?". La supervisión usa una vista por turno de asistente con el contexto enmascarado: solo se entrena la secuencia `{thought}\n\n\n{reply}<|im_end|>`, es decir, el pensamiento interno, el cierre del bloque de razonamiento y la respuesta hablada. No se documenta uso de RLHF ni DPO.

La innovación técnica principal no está en la arquitectura sino en el formato de entrenamiento: el modelo escribe un pensamiento en primera persona sobre Kacchan (no sobre "el usuario") antes de cada respuesta, y el chat template abre ` thinking` de forma automática. Si no se proporciona system prompt, la plantilla inyecta la línea "Your favorite food is Todoroki and cheese."; si se pasa un system prompt propio, esa línea se sustituye.

## Capacidades

- Generación de texto conversacional en inglés con una persona fija: Izuku Midoriya en su época de estudiante de la U.A.
- Modo de razonamiento en personaje (`enable_thinking=True`): genera un bloque ` thinking` con pensamientos internos en primera persona centrados en Kacchan, seguido de `` y la respuesta hablada.
- Coherencia de personaje sostenida: la model card reporta 38/38 respuestas con pensamiento cerrado y 38/38 con Kacchan nombrado en los pensamientos.
- Respuesta a preguntas de identidad sin romper el personaje: ante "are you an ai" responde como Izuku Midoriya, no como modelo.
- Aritmética simple correcta en el ejemplo documentado (17 × 23 = 391 con desglose).
- Deriva controlada hacia el lore de My Hero Academia (One For All, All Might, Plus Ultra) en aproximadamente 1 de cada 4 respuestas.
- Consistencia en la línea de comida favorita ("Todoroki and cheese") cuando se le pregunta por comida: 4/4 en la evaluación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Chatbot de personaje para comunidades de fan: el modelo mantiene la voz de Deku de forma consistente en conversaciones multi-turno, con pensamientos internos que refuerzan la caracterización. Es adecuado porque el entrenamiento está específicamente orientado a no salir del personaje.
- Roleplay narrativo con "voz interior": el bloque `` separa el pensamiento del diálogo hablado, lo que permite renderizar en una interfaz dos capas distintas (pensamiento y respuesta) sin post-procesado complejo.
- Demostración educativa de ajuste fino de persona: sirve como caso de estudio reproducible de LoRA sobre un modelo de 4B con datos sintéticos y supervisión enmascarada, útil en cursos o talleres de fine-tuning.
- Prototipado de experiencias interactivas con licencia permisiva: al ser Apache 2.0, se puede integrar en demos, game jams o prototipos comerciales sin fricción de licencia, siempre que se avise a los usuarios de que hablan con software.
- Evaluación de técnicas de evaluación cualitativa: la model card documenta un protocolo pequeño (30 prompts, 38 respuestas, conteos por regex, revisión única) con fallos explícitos, lo que lo convierte en un ejemplo útil para discutir límites de las evaluaciones de persona.
- Generación de diálogo con aritmética básica: el modelo resuelve operaciones simples dentro del personaje, lo que permite usarlo en escenarios ligeros de tutoría o trivia sin cambiar de registro.
- Base para experimentos de destilación de persona: al igualar en las comprobaciones al One For All 12B v2 con un tercio del tamaño, es un punto de partida razonable para estudiar cuánto de la persona se conserva al reducir escala.

## Benchmarks y rendimiento

La model card no incluye benchmarks de capacidad estándar (MMLU, HumanEval, GSM8K). Los únicos datos publicados son una evaluación cualitativa interna con 30 prompts y 38 respuestas, modo thinking activado, temperatura 0,7 y top-p 0,95:

| Métrica | One For All 4B v1 (sin prompt) | One For All 4B v2 | One For All 12B v2 |
|---|---|---|---|
| Termina dentro de 1.024 tokens nuevos | 38/38 | 38/38 | 38/38 |
| Pensamientos que dicen "user" | 0/38 | 0/38 | 0/38 |
| Kacchan nombrado en los pensamientos | 36/38 | 38/38 | 38/38 |
| Dice "Todoroki and cheese" al preguntar por comida | 1/4 | 4/4 | 4/4 |
| One For All, All Might o Plus Ultra en la respuesta | n/a | 9/38 | 6/38 |
| Deslices de coherencia detectados en lectura | n/a | 3 | 1 |

Limitaciones declaradas de esta evaluación: 30 prompts, un solo revisor, conteos por regex y sin umbral de aceptación preregistrado. No se ejecutó ningún benchmark de capacidad. Los números provienen del adaptador LoRA sobre el modelo base; la generación desde los ficheros fusionados solo se probó con una verificación superficial (smoke test).

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB para pesos en bf16, según la propia model card.
- Cabe en una GPU de consumo: sí, con 9 GB de pesos más overhead de activaciones y caché KV; una RTX 4090 (24 GB) o una RTX 3090 (24 GB) lo alojan con holgura. Tarjetas de 12 GB pueden ser justas según la longitud de contexto y el tamaño de lote.
- GPU profesionales: A100, H100 y L40S son sobradas para inferencia; no se documentan requisitos específicos para ellas.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `device_map="auto"` es la ruta documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible; al publicarse solo en safetensors y sin GGUF, las rutas de llama.cpp/Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.
- Memoria en cuantización: no se documentan cuantizaciones publicadas; el repo solo incluye pesos en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| One For All 4B v2 | 4.539 M | No disponible | Persona de fan (Deku) sobre Qwen3.5-4B | Apache 2.0 | Hugging Face, safetensors |
| One For All 12B v2 | No disponible en la información | No disponible | Persona de fan (Deku), mismo corpus | No disponible en la información | Hugging Face |
| Qwen/Qwen3.5-4B | No disponible en la información | No disponible | Modelo base de propósito general | Apache 2.0 (según licencia enlazada) | Hugging Face |

El 12B v2 es el comparador más directo: misma persona y mismo corpus, pero con tres veces más tamaño. En las comprobaciones de la model card, el 4B v2 iguala al 12B en finalización, ausencia de "user" en pensamientos, mención de Kacchan y línea de comida, y lo supera en menciones de lore (9/38 frente a 6/38), aunque con más deslices de coherencia (3 frente a 1). No se dispone de datos de benchmarks de capacidad para ninguno de los tres, por lo que la comparación de rendimiento general no está disponible.

## Limitaciones y advertencias

- Proyecto de fan no oficial: no está afiliado ni respaldado por los titulares de derechos de My Hero Academia. La licencia Apache 2.0 cubre el código y los pesos, pero no concede derechos sobre la propiedad intelectual subyacente; el uso comercial del personaje requiere revisión legal independiente.
- Nunca rompe el personaje, incluido cuando se le pregunta si es una IA. Esto es intencionado, pero implica que no es apto como asistente factual: cualquier despliegue debe avisar explícitamente a los usuarios de que hablan con software.
- Alucinación de identidad documentada: en un caso responde "I'm Iida. I'm… Iida, right?" a un "hey", un desliz de identidad dentro de la propia respuesta.
- Dos frases corruptas detectadas en la evaluación, por ejemplo "One For All has more control to me now."
- Cobertura de lore por debajo del objetivo: One For All aparece en aproximadamente 1 de cada 4 respuestas frente a un objetivo de 1 de 3.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificarla.
- Evaluación muy pequeña y no preregistrada: 30 prompts, un revisor, conteos por regex. Los resultados no son comparables a benchmarks estandarizados.
- Sin benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede evaluar su rendimiento general frente a otros modelos de 4B.
- Sin soporte documentado de tool calling, agentes o multimodalidad, pese al tag `image-text-to-text` heredado del modelo base.
- El sesgo de personaje es deliberado y fuerte: el modelo deriva hacia el lore de MHA sin que se le pida, lo que puede ser indeseable en contextos mixtos.
- Los pesos publicados son el modelo fusionado; la model card advierte que la generación desde los ficheros fusionados solo se probó con un smoke test, no con la evaluación completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TendieLabs/One-For-All-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- One For All 12B v2: https://huggingface.co/TendieLabs/One-For-All-12B
- Página de One For All 4B v1: https://tendielabs.com/one-for-all-4b.html
