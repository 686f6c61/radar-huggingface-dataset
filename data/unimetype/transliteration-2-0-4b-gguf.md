# UnimeType/Transliteration-2.0-4B-GGUF

## Resumen

UnimeType Transliteration 2.0 4B (v2.1) es un modelo especializado en transliteración para métodos de entrada (IME), construido sobre Qwen/Qwen3.5-4B y publicado por UnimeType. Su función es convertir representaciones romanizadas —pinyin chino, romaji japonés, hinglish (hindi romanizado) y arabizi (árabe romanizado)— a sus escrituras nativas, tanto en frases cortas como en oraciones largas multi-cláusula de 60 a 240 caracteres. El modelo preserva en su sitio términos técnicos en inglés, menciones `@handle`, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.

La versión v2.1 introduce una mejora centrada en oraciones largas: el 67,2 % de las entradas de entrenamiento son frases multi-cláusula con `max_seq_len=1024`, cubriendo romanización con espacios, agrupada por frases y sin espacios, alternancia de código bilingüe y marcadores protegidos. En el benchmark estándar de 414 casos cortos, el modelo alcanza un 88,4 % de acierto estricto (366/414), frente al 87,4 % de v2.0 y al 70,5 % de DeepSeek V4.1 Flash.

El modelo se distribuye en formato GGUF (cuantización Q8_0) con licencia Apache 2.0, lo que facilita su despliegue en aplicaciones de teclado y entornos de inferencia local. Está pensado para integración directa en teclados móviles y sistemas IME, donde la latencia y la fidelidad de conversión son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_seq_len` de entrenamiento 1024 (v2.1); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (repo); el autor menciona además MLX 6-bit y BF16 Safetensors en otras distribuciones |
| Idiomas soportados | en, zh, ja, hi, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); safetensors BF16 y MLX 6-bit en otras distribuciones del autor |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 4.205.751.296 parámetros. Sobre esa base, UnimeType aplica un ajuste especializado en transliteración con un protocolo propio denominado `unimetype-convert-short-v3`, compatible al 100 % con los clientes de Transliteration-2.0. La versión v2.1 se entrenó con un currículo equilibrado en el que el 67,2 % de las entradas son oraciones multi-cláusula (60-240 caracteres, 2-5 cláusulas, `max_seq_len=1024`), incluyendo romanización con espacios, agrupada por frases y sin espacios, alternancia de código técnico bilingüe, marcadores protegidos, diseños multilínea y ciclos de reconversión (`Another`/`reconvert`).

Una innovación destacable es la plantilla de generación no-pensante incondicional (`chat_template.jinja` con `<|im_start|>assistant\n<think>\n\n</think>\n\n`) que se incluye en todos los formatos (MLX 6-bit, BF16 Safetensors y GGUF). Esto evita el desperdicio de tokens y los truncamientos asociados al modo de razonamiento en LM Studio, `mlx-lm` y `llama.cpp`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO.

## Capacidades

- Transliteración de pinyin chino a caracteres hanzi, incluyendo frases cortas y oraciones largas multi-cláusula.
- Transliteración de romaji japonés a kana y kanji.
- Transliteración de hinglish (hindi romanizado) a devanagari.
- Transliteración de arabizi (árabe romanizado) a escritura árabe.
- Preservación en su sitio de términos técnicos en inglés, `@handles`, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.
- Manejo de romanización con espacios, agrupada por frases y sin espacios.
- Alternancia de código bilingüe (code-switching) con términos técnicos.
- Soporte de ciclos de reconversión (`Another`/`reconvert`) para variantes alternativas de transliteración.
- Plantilla de generación no-pensante que evita el consumo de tokens en modo razonamiento.
- Compatibilidad con clientes existentes del protocolo `unimetype-convert-short-v3`.
- Capacidades multilingües limitadas a en, zh, ja, hi y ar.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Teclado móvil con IME multilingüe: el modelo convierte en tiempo real pinyin, romaji, hinglish y arabizi a escritura nativa dentro de la app UnimeType, con preservación de URLs y menciones para no romper enlaces ni notificaciones.
- Mensajería con code-switching técnico: en conversaciones donde se mezclan términos en inglés con romanización, el modelo mantiene intactos los identificadores de código y los literales JSON, lo que resulta adecuado para chats de soporte técnico y comunidades de desarrollo.
- Entrada de texto en oraciones largas: gracias al entrenamiento con `max_seq_len=1024` y al 67,2 % de entradas multi-cláusula, el modelo puede transliterar párrafos de 60-240 caracteres sin degradar la precisión de caracteres (93,21 % de precisión media en el benchmark de 160 casos).
- Procesamiento por lotes de contenido romanizado: integración en pipelines que normalizan corpus de pinyin, romaji, hinglish o arabizi a escritura nativa, con protección de marcadores y estructuras de datos.
- Asistentes de escritura para usuarios de la diáspora: personas que escriben hindi o árabe en caracteres latinos pueden obtener la escritura nativa manteniendo intactos los términos técnicos y los emojis.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF Q8_0 y con un tamaño de repo de 9,0 GB, puede ejecutarse en entornos de inferencia local con `llama.cpp` o LM Studio para aplicaciones de escritorio de conversión de texto.
- Herramientas de accesibilidad y entrada asistida: conversión de romanización a escritura nativa en campos de formulario y editores de texto, preservando saltos de línea y estructuras multilínea.

## Benchmarks y rendimiento

Benchmark de oraciones largas multi-cláusula (160 casos, 2-5 cláusulas, 60-240 caracteres):

| Metrica | v2.0 (4B) | v2.1 (4B) |
|---|---:|---:|
| Acierto estricto global (160 casos) | 32/160 (20,0 %) | 46/160 (28,7 %) |
| Acierto normalizado global (160 casos) | 33/160 (20,6 %) | 47/160 (29,4 %) |
| Precisión media de caracteres | 90,4 % | 93,21 % |
| Chino pinyin (`zh`, 40 casos) | 6/40 (15,0 %) · 92,6 % car. | 9/40 (22,5 %) · 92,6 % car. |
| Japonés romaji (`ja`, 40 casos) | 6/40 (15,0 %) · 86,0 % car. | 9/40 (22,5 %) · 91,0 % car. |
| Hindi hinglish (`hi`, 40 casos) | 20/40 (50,0 %) · 96,7 % car. | 25/40 (62,5 %) · 98,1 % car. |
| Árabe arabizi (`ar`, 40 casos) | 0/40 (0,0 %) · 86,4 % car. | 3/40 (7,5 %) · 91,2 % car. |

Benchmark estándar de 414 casos cortos y casos límite:

| Metrica | v1.0 (Transliteration-4B) | DeepSeek V4.1 Flash | v2.1 (0.8B) | v2.1 (4B) |
|---|---:|---:|---:|---:|
| Acierto estricto global (414 casos) | 230/414 (55,6 %) | 292/414 (70,5 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Acierto expandido global (414 casos) | 242/414 (58,5 %) | 297/414 (71,7 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Chino pinyin (`zh`) | 151/207 (72,9 %) | 171/207 (82,6 %) | 168/207 (81,2 %) | 195/207 (94,2 %) |
| Japonés romaji (`ja`) | 15/52 (28,8 %) | 37/52 (71,2 %) | 22/52 (42,3 %) | 40/52 (76,9 %) |
| Hindi / hinglish (`hi`) | 41/71 (57,7 %) | 49/71 (69,0 %) | 51/71 (71,8 %) | 61/71 (85,9 %) |
| Árabe arabizi (`ar`) | 23/84 (27,4 %) | 35/84 (41,7 %) | 60/84 (71,4 %) | 70/84 (83,3 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa, el repo GGUF Q8_0 ocupa 9,0 GB, por lo que la inferencia en Q8_0 requiere al menos ese espacio de almacenamiento y una cantidad de VRAM del mismo orden para cargar los pesos en GPU.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del repo (9,0 GB en Q8_0), se necesita una GPU con al menos 10-12 GB de VRAM para cargar los pesos en memoria; no se confirman modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible. Con 9,0 GB en Q8_0, encajaría en GPUs de consumo con 12 GB o más de VRAM, pero el autor no lo especifica.
- Opciones de despliegue: `llama.cpp`, LM Studio (mencionados explícitamente en la model card); `mlx-lm` para el formato MLX 6-bit. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.
- Plantilla de generación: incluye `chat_template.jinja` no-pensante en todos los formatos para evitar truncamientos en LM Studio, `mlx-lm` y `llama.cpp`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark 414 casos (estricto) | Licencia | Formato |
|---|---:|---|---:|---|---|
| UnimeType Transliteration 2.0 4B v2.1 | 4.205.751.296 | `max_seq_len` 1024 (entrenamiento) | 366/414 (88,4 %) | apache-2.0 | GGUF Q8_0 |
| DeepSeek V4.1 Flash | no disponible | no disponible | 292/414 (70,5 %) | no disponible | no disponible |
| UnimeType Transliteration 2.0 0.8B v2.1 | no disponible (0.8B) | no disponible | 301/414 (72,7 %) | no disponible | no disponible |
| Transliteration-4B v1.0 | 4B (aprox.) | no disponible | 230/414 (55,6 %) | no disponible | no disponible |

No se dispone de información sobre otros modelos especializados en transliteración comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en transliteración; no es un modelo de propósito general y no se documentan capacidades de razonamiento, código, matemáticas, visión o tool calling.
- Idiomas soportados limitados a en, zh, ja, hi y ar; el rendimiento en otras lenguas o sistemas de romanización no está evaluado.
- El acierto estricto en oraciones largas multi-cláusula es del 28,7 % (46/160), lo que indica que la conversión de párrafos largos sigue siendo un punto débil pese a la mejora respecto a v2.0.
- El rendimiento en árabe arabizi en oraciones largas es especialmente bajo (3/40, 7,5 % de acierto estricto), aunque la precisión de caracteres alcanza el 91,2 %.
- El rendimiento en japonés romaji en el benchmark corto es del 76,9 %, por debajo del resto de idiomas (chino 94,2 %, hindi 85,9 %, árabe 83,3 %).
- Riesgo de alucinación y de conversiones incorrectas en entradas ambiguas o mal formadas; no se documentan mecanismos de verificación o confianza por token.
- No se documentan sesgos conocidos en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.5-4B, cuyos términos no se detallan en la información disponible.
- El modelo requiere un protocolo de prompt específico (`unimetype-convert-short-v3`); su uso fuera de ese protocolo puede degradar los resultados.
- La plantilla no-pensante es incondicional; no se ofrece un modo de razonamiento alternativo.
- El tamaño del repo (9,0 GB) y la cuantización Q8_0 implican requisitos de memoria superiores a los de cuantizaciones más agresivas, no incluidas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Descarga de la app UnimeType: https://unimetype.com/download?utm_source=huggingface&utm_medium=referral&utm_campaign=transliteration_2_1
- Repositorio del modelo 0.8B (referenciado en benchmarks): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
