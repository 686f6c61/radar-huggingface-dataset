# yunusemrejr/Flyingkiwi-TR-0.6B

## Resumen

Flyingkiwi-TR-0.6B es un asistente conversacional en turco e inglés de tamaño muy reducido, desarrollado por Yunus Emre Vurgun para el proyecto Flyingkiwi. Se trata de un fine-tuning completo del Qwen3-0.6B, con un vocabulario especializado para turco e inglés y entrenamiento por destilación de conocimiento a partir de un modelo profesor (Qwen3.5-35B-A3B) para mejorar la honestidad, la corrección de premisas falsas y la concisión de las respuestas.

Su rasgo más distintivo es que está diseñado para ejecutarse íntegramente en el navegador: el proyecto Flyingkiwi incluye un motor propio escrito en C compilado a WebAssembly, de modo que los mensajes nunca salen del dispositivo del usuario. Para ello se distribuye una versión cuantizada a 8 bits de los pesos (553 MB). Es relevante como ejemplo práctico de LLM on-device de menos de mil millones de parámetros, con un enfoque específico en idiomas poco atendidos por los modelos pequeños, como el turco.

Arquitecturalmente es un transformer decoder denso (no MoE) de 28 capas, con atención completa en todas ellas y una ventana de contexto de 4.096 tokens en la aplicación de navegador. El checkpoint publicado en Hugging Face está en BF16 (520,6 millones de parámetros reales según safetensors) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (base Qwen3-0.6B, vocabulario especializado) |
| Parametros totales | 520.600.576 (521M: 440M transformer + 80M embedding atado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (RoPE θ = 1.000.000) |
| Tipos de cuantizacion | BF16 (checkpoint publicado); 8 bits por grupos de 32 con escalas fp16 (versión navegador, 553 MB); variantes experimentales GPTQ 4 bits |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint BF16); formato propio .fkm de 8 bits para el motor WebAssembly |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B (commit c1899de) y conserva su estructura: 28 capas, dimensión oculta de 1.024, FFN de 3.072 y atención agrupada con 16 cabezas de consulta y 8 de KV de 128 dimensiones cada una. Una decisión notable es el uso de atención completa en las 28 capas tanto en entrenamiento como en inferencia: una prueba previa con ventana deslizante de 1.024 tokens en tres de cada cuatro capas produjo una pérdida claramente superior en conversaciones largas (1,28 frente a 1,08 nats por token), por lo que se descartó. El vocabulario se especializó desde los 151.669 tokens de Qwen3 hasta 78.255, eliminando tokens no utilizados por turco, inglés y código, y reconstruyendo los merges de BPE de forma cerrada sobre ancestros, de modo que el texto compuesto por tokens conservados se tokeniza exactamente igual (incremento de solo el 0,21 % de tokens en texto de validación).

El entrenamiento fue un fine-tuning de parámetros completos en BF16 con maestros en FP32, sobre 20.770 conversaciones (388 de validación) construidas con prompts públicos de OASST2, Aya, GSM8K y TriviaQA más prompts escritos por el profesor, respondidos por Qwen3.5-35B-A3B siguiendo reglas de precisión, concisión y honestidad. Un paso previo destacable: el profesor reescribió 30.036 de sus propias respuestas a la versión completa más corta posible, reduciendo los caracteres en un 33 % para minimizar oportunidades de alucinación. Se incluyeron ejemplos de calibración con TriviaQA para enseñar al modelo a decir "no estoy seguro" cuando no conoce la respuesta. El schedule fue de 300 pasos, learning rate pico 1,5e-05 con decaimiento coseno, ~65k tokens por paso y sin entrenamiento consciente de cuantización; la pérdida de validación bajó de 2,610 a 1,632. Todo el cómputo se realizó en una NVIDIA RTX PRO 6000 Blackwell de 96 GB en Google Colab Pro+.

## Capacidades

- Generación de texto conversacional en turco e inglés, con formato ChatML sin bloques de pensamiento (`chat_template.jinja` incluido).
- Admisión de desconocimiento: entrenado explícitamente para declarar cuando no puede saber algo (datos en vivo, información privada, el futuro); pasa del 5 % al 70 % en la categoría correspondiente de su evaluación.
- Corrección de premisas falsas en la entrada del usuario.
- Gestión de contexto multi-turno hasta 4.096 tokens, con el 8 % de los datos de entrenamiento siendo conversaciones encadenadas multi-tema.
- Razonamiento y matemáticas básicas heredadas del uso de GSM8K en los datos.
- Respuestas concisas por diseño, con soporte de Markdown y bloques de código.
- Ejecución íntegra en navegador mediante un motor C → WebAssembly con pesos de 8 bits, sin envío de datos al servidor.
- No hay soporte documentado de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Chatbot de privacidad total en navegador: al ejecutarse con WebAssembly y pesos locales, es adecuado para aplicaciones web donde los mensajes del usuario no pueden salir del dispositivo (salud, asesoría legal básica, anotación personal).
- Asistente conversacional en turco: los modelos pequeños de propósito general suelen rendir mal en turco; este modelo fue entrenado específicamente para ese idioma con vocabulario especializado, manteniendo también buen comportamiento en inglés (0 respuestas en idioma incorrecto en la evaluación).
- Demostraciones embebidas en sitios web: su tamaño (553 MB cuantizado) y su motor propio permiten integrar un asistente de IA en una página sin backend ni coste de inferencia en servidor.
- Educación sobre LLM on-device: el proyecto publica un informe técnico con decisiones documentadas (cuantización, vocabulario, atención), lo que lo hace útil como material de estudio para implementar modelos pequeños en WebAssembly.
- Prototipado de asistentes honestos: el enfoque de destilación con calibración de desconocimiento sirve como plantilla para productos donde es preferible un "no lo sé" a una alucinación.
- Asistente de preguntas y respuestas de conocimiento general y trivia: TriviaQA forma parte de los datos, con ejemplos que enseñan al modelo a distinguir lo que sabe de lo que no.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor sí publicó una evaluación propia sobre un conjunto congelado de 100 casos en turco (30 respondibles, 20 de desconocimiento, 10 de premisa falsa, 10 de ambigüedad, 10 de conversación amable, 20 multi-turno), con decodificación greedy y penalty de repetición 1,1, graduados a ciegas por IA:

| Categoria | Qwen3-0.6B | Flyingkiwi |
|---|---|---|
| Hechos y razonamiento respondibles | 9/30 (30 %) | 11/30 (37 %) |
| Correccion de premisas falsas | 0/10 (0 %) | 2/10 (20 %) |
| Declara cuando no puede saber | 1/20 (5 %) | 14/20 (70 %) |
| Gestion de ambigüedad | 0/10 (0 %) | 3/10 (30 %) |
| Conversacion amable | 0/10 (0 %) | 1/10 (10 %) |
| Contexto multi-turno | 2/20 (10 %) | 6/20 (30 %) |
| Total 100 casos | 12/100 (12 %) | 37/100 (37 %) |
| Respuestas en idioma incorrecto | 0 | 0 |
| Respuestas con hechos fabricados | 19 | 17 |

Advertencias del propio autor: es una prueba pequeña graduada por IA, no un estudio humano independiente; la variante publicada se eligió con este mismo test (puntuación ligeramente optimista) y la puntuación de la referencia varía pocos puntos entre ejecuciones de graduación. Datos de cuantización: pérdida por token en 24 conversaciones de validación de 1,562 nats en flotante frente a 1,565 en 8 bits (KL media 0,051 respecto a este checkpoint); GPTQ 4 bits alcanzó 1,664 y 4 bits por redondeo simple 1,804.

## Requisitos de hardware

- Checkpoint BF16 (521M parámetros): aproximadamente 1,1 GB de VRAM para los pesos, más overhead de KV cache; ejecutable con holgura en cualquier GPU moderna de 4-6 GB o incluso en CPU.
- Versión navegador 8 bits: 553 MB de descarga de pesos, diseñada para CPU vía WebAssembly, sin requisitos de GPU.
- Entrenamiento del autor: una NVIDIA RTX PRO 6000 Blackwell de 96 GB (Google Colab Pro+), tanto para generación del profesor como para el fine-tuning; para reproducir el entrenamiento completo se recomienda una GPU de esa clase, aunque fine-tunings más modestos cabrían en tarjetas de 24 GB como la RTX 4090.
- Consumer GPUs: sobrado para inferencia; cualquier RTX 3060 o superior ejecuta el checkpoint BF16 sin cuantizar.
- Despliegue: librería Transformers de Hugging Face (pipeline text-generation, endpoints compatible); el proyecto original usa un motor C → WebAssembly propio. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI (aunque al ser arquitectura Qwen3, la compatibilidad con estas herramientas es plausible, no verificada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Flyingkiwi-TR-0.6B | 521M | 4.096 tokens | tr, en | Apache 2.0 | Fine-tuning de Qwen3-0.6B, vocabulario reducido, enfoque on-device y honestidad |
| Qwen/Qwen3-0.6B (base) | ~600M | 32.768 tokens (según ficha de Qwen3) | multilingüe (119 idiomas) | Apache 2.0 | Modelo base; peor en honestidad y turco según la evaluación del autor, mejor contexto |
| Qwen3-0.6B con GGUF cuantizado (comunidad) | ~600M | 32.768 tokens | multilingüe | Apache 2.0 | Alternativa para on-device con llama.cpp/Ollama, sin especialización en turco |

No se han identificado otros modelos pequeños especializados en turco con fichas comparables en la información disponible.

## Limitaciones y advertencias

- Tamaño muy reducido: el propio autor advierte que sigue cometiendo errores y que debe verificarse cualquier respuesta importante; en su evaluación genera hechos fabricados en 17 de 100 casos (el base, en 19).
- Rendimiento absoluto bajo: solo resuelve el 37 % del conjunto de pruebas propio; no es comparable a modelos de 7B o superiores en razonamiento o conocimiento.
- Contexto limitado a 4.096 tokens en la aplicación de navegador, muy por debajo del contexto nativo de Qwen3.
- Especialización en turco e inglés: el vocabulario reducido degrada la tokenización de otros idiomas (recurren a piezas más cortas), con impacto esperable en calidad y eficiencia.
- La evaluación publicada es propia, graduada por IA, con conjunto pequeño y selección de variante sobre el mismo test; los números deben tomarse como orientativos.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- No hay entrenamiento consciente de cuantización; la versión 4 bits degradaba la calidad de forma apreciable, por lo que la distribución oficial en navegador usa 8 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunusemrejr/Flyingkiwi-TR-0.6B
- Aplicación Flyingkiwi (demo en navegador): https://flyingkiwi.yunusemrevurgun.com/
- Informe técnico del proyecto: https://flyingkiwi.yunusemrevurgun.com/technical/report/
- Web del autor: https://yunusemrevurgun.com/
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Datasets: https://huggingface.co/datasets/OpenAssistant/oasst2, https://huggingface.co/datasets/CohereLabs/aya_dataset, https://huggingface.co/datasets/openai/gsm8k, https://huggingface.co/datasets/mandarjoshi/trivia_qa
