# UnimeType/Transliteration-2.0-0.8B-Safetensors

## Resumen

UnimeType Transliteration 2.0 0.8B (v2.1) es un modelo especializado en transliteración de entrada (input-method transliteration) desarrollado por UnimeType a partir de Qwen3.5-0.8B. Su función es convertir romanizaciones informales de varios idiomas —pinyin chino, romaji japonés, hinglish (hindi romanizado) y arabizi (árabe en alfabeto latino)— a sus escrituras nativas (hanzi, kana/kanji, devanagari y alfabeto árabe), preservando intactos los términos técnicos en inglés, menciones, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.

El modelo aborda un problema real en teclados móviles y sistemas de entrada: millones de usuarios escriben sus idiomas con el alfabeto latino (por ejemplo, "nihao" en lugar de "你好", o "salam" en lugar de "سلام"), y los IME tradicionales tienen dificultades con frases largas, código bilingüe y formatos mixtos. La versión v2.1 mejora sustancialmente el manejo de oraciones largas multiclausula (60–240 caracteres) respecto a v2.0, con una precisión de caracteres en oraciones largas del 76,5 % y un benchmark estándar de 414 casos del 72,7 %, superando según el autor a DeepSeek V4.1 Flash (70,5 %) en esa métrica.

Con 752 millones de parámetros (752.393.024 según los metadatos de safetensors), licencia Apache 2.0 y plantilla de generación no-thinking incluida, es un modelo ligero pensado para despliegue en dispositivos de usuario o servidores modestos, con formatos BF16 safetensors, GGUF y MLX 6-bit disponibles en el ecosistema de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura de texto de Qwen3.5), ajustado para transliteración |
| Parametros totales | 752.393.024 (dato real de safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE; asume densidad completa) |
| Longitud de contexto | max_seq_len = 1024 (en entrenamiento, v2.1) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF (cuantizaciones no especificadas), MLX 6-bit |
| Idiomas soportados | en, zh (pinyin), ja (romaji), hi (hinglish), ar (arabizi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), GGUF, MLX 6-bit |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) de Qwen3.5-0.8B, un transformer causal de la familia Qwen de Alibaba. No es un modelo desde cero: UnimeType lo ha especializado mediante entrenamiento supervisado con el protocolo `unimetype-convert-short-v3`, compatible al 100 % con clientes existentes de Transliteration-2.0. La versión v2.1 (etiqueta interna `2.0-v4`) se entrenó con `max_seq_len=1024` sobre un currículo balanceado en el que el 67,2 % de las entradas son oraciones multiclausula de 60–240 caracteres con 2–5 cláusulas, cubriendo romanización con espacios, agrupada por frases y sin espacios, alternancia de código bilingüe (code-switching), placeholders protegidos, diseños multilínea y ciclado de "reconvertir" (etiqueta `Another`).

Una innovación práctica destacable es la plantilla de chat no-thinking incondicional incluida (`chat_template.jinja` con `<|im_start|>assistant\n<think>\n\n</think>\n\n`), que evita que el modelo genere bloques de razonamiento (`Thinking Process:`) heredados del modelo base Qwen3.5, ahorrando tokens y evitando truncamientos en LM Studio, mlx-lm y llama.cpp. No se ha publicado información sobre RLHF/DPO ni sobre el tamaño exacto del dataset de entrenamiento.

## Capacidades

- Transliteración de pinyin chino a caracteres hanzi, tanto frases cortas como oraciones largas multiclausula.
- Transliteración de romaji japonés a escritura japonesa nativa.
- Conversión de hinglish (hindi romanizado) a devanagari, con el mejor rendimiento del modelo (94,8 % de precisión de caracteres en oraciones largas).
- Conversión de arabizi a alfabeto árabe.
- Preservación de elementos no transliterables: términos técnicos en inglés, `@handles`, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.
- Manejo de romanización con espacios, agrupada y sin espacios.
- Alternancia de código bilingüe (romanización mezclada con texto en inglés u otro idioma).
- Generación conversacional mediante plantilla de chat con modo no-thinking forzado.
- Función de "reconvertir" (cycling con etiqueta `Another`) para alternar entre candidatos de conversión.

No se ha documentado soporte de tool calling, function calling ni capacidades de agente; al ser un modelo de tarea única, no es su caso de uso previsto.

## Casos de uso

- Teclado de método de entrada (IME) móvil: integración como motor de conversión en apps de teclado para usuarios que escriben pinyin, romaji, hinglish o arabizi; su tamaño de 0,8B y los formatos GGUF/MLX lo hacen viable en dispositivo.
- Mensajería con escritura informal: conversión en tiempo real de mensajes largos multiclausula en apps de chat, donde los usuarios escriben "wobu zhidao" o "kya haal hai" y esperan el texto nativo.
- Procesamiento de corpus de redes sociales: normalización de romanizaciones informales en pipelines de NLP para análisis de sentimiento o indexación de contenido en chino, japonés, hindi o árabe escrito en alfabeto latino.
- Búsqueda y indexación multilingüe: preprocesamiento de consultas de usuarios que buscan en romanizado, convirtiéndolas a escritura nativa para mejorar el matching con documentos en scripts originales.
- Asistentes de voz y transcripción: normalización de la salida de ASR que devuelve romanizaciones, convirtiéndola al script nativo antes de mostrarla al usuario.
- Herramientas de localización y traducción asistida: preprocesamiento de texto fuente romanizado antes de pasarlo a un sistema de traducción automática, mejorando la calidad de traducción.
- Educación de idiomas: aplicaciones que enseñan chino, japonés, hindi o árabe y necesitan convertir las respuestas romanizadas del alumno a la escritura correcta como retroalimentación.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Benchmark de oraciones largas multiclausula (160 casos, 2–5 cláusulas, 60–240 caracteres):

| Métrica | v2.0 (0.8B) | v2.1 (0.8B) | v2.1 (4B) |
|---|---:|---:|---:|
| Strict pass (160 casos) | 1/160 (0,6 %) | 12/160 (7,5 %) | 46/160 (28,7 %) |
| Normalized pass (160 casos) | 1/160 (0,6 %) | 12/160 (7,5 %) | 47/160 (29,4 %) |
| Precisión media de caracteres | 69,2 % | 76,49 % | 93,21 % |
| Chino pinyin (40 casos) | 0/40 · 61,7 % char | 1/40 (2,5 %) · 66,7 % char | 9/40 (22,5 %) · 92,6 % char |
| Japonés romaji (40 casos) | 0/40 · 51,7 % char | 0/40 · 63,7 % char | 9/40 (22,5 %) · 91,0 % char |
| Hindi hinglish (40 casos) | 1/40 · 91,9 % char | 11/40 (27,5 %) · 94,8 % char | 25/40 (62,5 %) · 98,1 % char |
| Árabe arabizi (40 casos) | 0/40 · 71,6 % char | 0/40 · 80,8 % char | 3/40 (7,5 %) · 91,2 % char |

Benchmark estándar de 414 casos (frases cortas y casos límite):

| Métrica | Transliteration-4B v1.0 | DeepSeek V4.1 Flash | v2.1 (0.8B) | v2.1 (4B) |
|---|---:|---:|---:|---:|
| Strict pass (414 casos) | 230/414 (55,6 %) | 292/414 (70,5 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Chino pinyin (207) | 151/207 (72,9 %) | 171/207 (82,6 %) | 168/207 (81,2 %) | 195/207 (94,2 %) |
| Japonés romaji (52) | 15/52 (28,8 %) | 37/52 (71,2 %) | 22/52 (42,3 %) | 40/52 (76,9 %) |
| Hindi/hinglish (71) | 41/71 (57,7 %) | 49/71 (69,0 %) | 51/71 (71,8 %) | 61/71 (85,9 %) |
| Árabe arabizi (84) | 23/84 (27,4 %) | 35/84 (41,7 %) | 60/84 (71,4 %) | 70/84 (83,3 %) |

Nota: se trata de benchmarks propios del autor sobre su tarea específica, no de benchmarks generales (MMLU, HumanEval, etc.), que no están disponibles para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 1,5–2 GB (pesos de ~1,5 GB más overhead de KV cache); con cuantización MLX 6-bit, en torno a 0,7–1 GB. El repo ocupa 3,0 GB en total.
- Al ser un modelo de 0,8B, cabe con holgura en GPUs de consumo: cualquier GPU moderna con 4 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090, etc.) lo ejecuta sin problemas; incluso es viable en CPU o en dispositivos móviles mediante llama.cpp u Ollama.
- GPU recomendadas: no requiere GPU dedicada; para servidores, cualquier GPU con 4 GB+ de VRAM es suficiente. No se necesitan A100 ni H100.
- Opciones de despliegue: transformers (Hugging Face), llama.cpp, Ollama, LM Studio y mlx-lm (formato MLX 6-bit). La model card confirma compatibilidad explícita con LM Studio, mlx-lm y llama.cpp gracias a la plantilla no-thinking incluida.
- Latencia y throughput: no disponible; por su tamaño, se esperan latencias bajas incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Benchmark propio (414 casos, strict) | Licencia |
|---|---|---|---|---|
| Transliteration-2.0-0.8B v2.1 | 752M | Transliteración multilingüe | 72,7 % | Apache 2.0 |
| Transliteration-2.0-4B v2.1 | no disponible | Transliteración multilingüe | 88,4 % | no disponible |
| DeepSeek V4.1 Flash | no disponible | Uso general (evaluado en transliteración) | 70,5 % | no disponible |
| Transliteration-4B v1.0 | no disponible | Transliteración multilingüe | 55,6 % | no disponible |

La alternativa más directa dentro de la misma familia es la variante 4B de Transliteration 2.0, que ofrece un salto considerable en calidad (88,4 % frente a 72,7 % en el benchmark estándar, y 93,21 % frente a 76,49 % de precisión de caracteres en oraciones largas) a costa de mayores requisitos de hardware. Frente a modelos generales como DeepSeek V4.1 Flash, este modelo de 0,8B lo supera en la métrica estricta del benchmark del autor pese a ser mucho más pequeño, lo que justifica su uso como componente especializado. No hay otros modelos de transliteración abiertos comparables publicados en la información disponible.

## Limitaciones y advertencias

- Rendimiento desigual por idioma: el japonés romaji y el árabe arabizi en oraciones largas muestran strict pass de 0 % en la variante 0,8B v2.1 (aunque la precisión de caracteres es del 63,7 % y 80,8 % respectivamente); la calidad en chino y japonés largos es notablemente inferior a la del hinglish.
- El strict pass global en oraciones largas multiclausula es solo del 7,5 %, por lo que en ese escenario el modelo comete errores con frecuencia; para casos críticos de oraciones largas conviene considerar la variante 4B.
- Riesgo de alucinación en la conversión: al ser generativo, puede producir caracteres incorrectos o inventar candidatos plausibles pero erróneos, especialmente con romanizaciones ambiguas o sin espacios.
- Contexto limitado a 1024 tokens en entrenamiento; textos más largos pueden degradar la calidad o requerir segmentación.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5, puede heredar sesgos del modelo base y de sus datos de preentrenamiento.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes más allá de conservar el aviso de licencia.
- Los benchmarks son publicados por el propio autor y no han sido verificados de forma independiente; la comparación con DeepSeek V4.1 Flash usa el benchmark propio de UnimeType.
- El modelo está especializado en una única tarea: no es adecuado como asistente general, generador de código o razonador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- App de teclado UnimeType: https://unimetype.com/download
