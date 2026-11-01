# UnimeType/Transliteration-2.0-4B-Safetensors

## Resumen

UnimeType Transliteration 2.0 4B (v2.1) es un modelo especializado en transliteración para métodos de entrada multilingües, desarrollado por UnimeType a partir de Qwen/Qwen3.5-4B. Su función es convertir romanizaciones de entrada —pinyin chino, romaji japonés, hinglish (hindi romanizado) y arabizi (árabe romanizado)— a sus escrituras nativas (hanzi, kana/kanji, devanagari y alfabeto árabe), tanto en frases cortas como en oraciones largas de múltiples cláusulas de 60 a 240 caracteres o más.

El modelo resuelve un problema concreto de los teclados y sistemas IME: los usuarios escriben lenguas asiáticas y árabes con alfabeto latino y necesitan una conversión precisa al alfabeto nativo, preservando intactos los términos técnicos en inglés, menciones (@handles), URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis. La versión v2.1 incorpora mejoras sustanciales en oraciones largas de varias cláusulas respecto a v2.0.

Técnicamente, es un modelo transformer de unos 4.206 millones de parámetros (dato real de los safetensors), publicado en formato safetensors BF16 bajo licencia Apache 2.0, con plantilla de chat no-thinking integrada para evitar desperdicio de tokens de razonamiento en LM Studio, mlx-lm y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B), texto a texto |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (max_seq_len=1024 en v2.1; v2.0 usaba 640) |
| Tipos de cuantizacion | BF16 (este repo); también existen variantes MLX 6-bit y GGUF del mismo modelo |
| Idiomas soportados | Inglés, chino, japonés, hindi, árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) sobre Qwen3.5-4B, un transformer de tipo decoder-only. La versión v2.1 se entrenó con un currículo equilibrado en el que el 67,2 % de las entradas de entrenamiento son oraciones largas de múltiples cláusulas (60–240 caracteres, 2–5 cláusulas, con max_seq_len=1024), cubriendo romanización con espacios, agrupada por frases y sin espacios, alternancia de código bilingüe (code-switching con términos técnicos en inglés), placeholders protegidos, diseños multilínea y el ciclo de reconversión ("Another"/reconvert). El protocolo de entrenamiento se denomina `unimetype-convert-short-v3` y es 100 % compatible (drop-in) con los clientes existentes de Transliteration-2.0.

Una innovación destacable es la inclusión de una plantilla de chat no-thinking incondicional (`chat_template.jinja` que fuerza `<think>\n\n</think>` vacío), que elimina el gasto de tokens en procesos de razonamiento o truncamientos en backends como LM Studio, mlx-lm y llama.cpp. No se ha publicado información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO.

## Capacidades

- Transliteración de pinyin chino a caracteres hanzi.
- Transliteración de romaji japonés a escritura japonesa nativa.
- Transliteración de hinglish (hindi romanizado) a devanagari.
- Transliteración de arabizi a alfabeto árabe.
- Manejo de oraciones largas de múltiples cláusulas (60–240+ caracteres, 2–5 cláusulas).
- Preservación de elementos no transliterables: términos técnicos en inglés, @handles, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.
- Soporte de romanización con espacios, agrupada por frases y sin espacios.
- Alternancia de código bilingüe (texto romanizado mezclado con inglés técnico).
- Manejo de diseños multilínea y placeholders protegidos.
- Generación con plantilla no-thinking integrada (sin tokens de razonamiento).
- No se ha publicado información sobre tool calling, agentes ni capacidades de visión o audio.

## Casos de uso

- Teclados y apps IME móviles: integración como motor de conversión en tiempo real para usuarios que escriben pinyin, romaji, hinglish o arabizi, con salida inmediata en escritura nativa; el protocolo drop-in facilita la sustitución de la versión anterior en clientes existentes.
- Procesamiento de datos de usuario multilingües: normalización de texto romanizado en corpus de redes sociales o mensajería antes de análisis de sentimiento, indexación o traducción automática.
- Sistemas de búsqueda en escrituras nativas: conversión de consultas escritas en alfabeto latino ("nihongo", "salam") a la escritura nativa para buscar en catálogos, bases de datos o motores de búsqueda en chino, japonés, hindi o árabe.
- Migración de contenido heredado: conversión masiva de archivos, notas o mensajes históricos escritos en romanización ad hoc a escrituras estándar, preservando URLs, código y emojis en su sitio.
- Asistentes conversacionales multilingües: capa de normalización de entrada para chatbots que reciben texto romanizado de usuarios en diásporas (hinglish y arabizi son muy habituales en chat informal).
- Herramientas de productividad y editores: integración en editores de texto o IDEs para convertir romanización pegada desde el portapapeles, manteniendo intactos los literales JSON y fragmentos de código gracias a los placeholders protegidos.
- Aplicaciones de mensajería con entrada multilínea: manejo de mensajes largos de varias cláusulas y saltos de línea, el punto fuerte de la versión v2.1.

## Benchmarks y rendimiento

### Benchmark de oraciones largas de múltiples cláusulas (160 casos, 2–5 cláusulas, 60–240 caracteres)

| Métrica | v2.0 (4B) | v2.1 (4B) |
|---|---:|---:|
| Strict pass global (160 casos) | 32/160 (20,0 %) | 46/160 (28,7 %) |
| Normalized pass global | 33/160 (20,6 %) | 47/160 (29,4 %) |
| Precisión media de caracteres | 90,4 % | 93,21 % |
| Chino pinyin (40 casos) | 6/40 (15,0 %) · 92,6 % char | 9/40 (22,5 %) · 92,6 % char |
| Japonés romaji (40 casos) | 6/40 (15,0 %) · 86,0 % char | 9/40 (22,5 %) · 91,0 % char |
| Hindi hinglish (40 casos) | 20/40 (50,0 %) · 96,7 % char | 25/40 (62,5 %) · 98,1 % char |
| Árabe arabizi (40 casos) | 0/40 (0,0 %) · 86,4 % char | 3/40 (7,5 %) · 91,2 % char |

### Benchmark estándar de frases cortas y casos límite (414 casos)

| Slice | Transliteration-4B (v1.0) | DeepSeek V4.1 Flash | Transliteration-2.0-0.8B (v2.1) | Transliteration-2.0-4B (v2.1) |
|---|---:|---:|---:|---:|
| Strict pass global | 230/414 (55,6 %) | 292/414 (70,5 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Expanded pass global | 242/414 (58,5 %) | 297/414 (71,7 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Chino pinyin | 151/207 (72,9 %) | 171/207 (82,6 %) | 168/207 (81,2 %) | 195/207 (94,2 %) |
| Japonés romaji | 15/52 (28,8 %) | 37/52 (71,2 %) | 22/52 (42,3 %) | 40/52 (76,9 %) |
| Hindi hinglish | 41/71 (57,7 %) | 49/71 (69,0 %) | 51/71 (71,8 %) | 61/71 (85,9 %) |
| Árabe arabizi | 23/84 (27,4 %) | 35/84 (41,7 %) | 60/84 (71,4 %) | 70/84 (83,3 %) |

Estos benchmarks son los publicados por el propio autor del modelo; no se han publicado evaluaciones independientes. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,5 GB en BF16 para el modelo más overhead de KV cache (el repo pesa 16,8 GB, lo que sugiere posibles pesos adicionales o duplicados; el cómputo teórico de 4,2B en BF16 ronda los 8,4 GB). Con variantes MLX 6-bit o GGUF, la huella baja a unos 3–4 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o Apple Silicon con 16 GB de memoria unificada o más (variante MLX 6-bit).
- Consumer GPUs: sí, cabe cómodamente en GPUs de 12 GB en BF16 y en GPUs de 8 GB o incluso Apple Silicon de 8–16 GB con las versiones cuantizadas MLX o GGUF.
- Opciones de despliegue: transformers (librería nativa), llama.cpp, LM Studio y mlx-lm (la plantilla no-thinking está verificada en estos tres últimos backends). No se menciona soporte explícito de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark 414 casos (strict) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transliteration-2.0-4B (v2.1) | 4,2B | 1024 tokens | 88,4 % | Apache 2.0 | Safetensors, MLX 6-bit, GGUF |
| Transliteration-2.0-0.8B (v2.1) | 0,8B | 1024 tokens | 72,7 % | No disponible | Safetensors, MLX 6-bit, GGUF |
| DeepSeek V4.1 Flash | No disponible | No disponible | 70,5 % | No disponible | No disponible |
| Transliteration-4B (v1.0) | 4B | No disponible | 55,6 % | No disponible | No disponible |

Dentro de su nicho (transliteración IME), el modelo de 4B supera en su benchmark propio tanto a su hermano pequeño de 0,8B como a DeepSeek V4.1 Flash, según datos del autor. No hay alternativas de terceros comparables publicadas en la información disponible.

## Limitaciones y advertencias

- Los benchmarks proceden del propio autor del modelo y no han sido verificados de forma independiente; los porcentajes de strict pass en oraciones largas son modestos (28,7 %), lo que implica que casi 3 de cada 4 oraciones largas complejas contienen algún error en la conversión estricta.
- El japonés romaji y el árabe arabizi son las lenguas más débiles en oraciones largas (0 % y 7,5 % de strict pass en el benchmark de 160 casos), aunque la precisión de caracteres supera el 91 %.
- La longitud de contexto es de solo 1024 tokens, insuficiente para documentos largos; el modelo está diseñado para entradas de método de introducción, no para procesar textos extensos.
- Riesgo de alucinación en la conversión: ambigüedades de romanización (homófonos en pinyin, kanji múltiples en japonés) pueden producir caracteres incorrectos plausibles; no hay datos publicados sobre tasas de alucinación.
- Sesgos conocidos: no disponibles.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- Para producción conviene validar la salida con mecanismos de corrección o sugerencias al usuario, especialmente en japonés y árabe, y usar la plantilla de chat no-thinking incluida para evitar truncamientos en backends compatibles.

## Enlaces

- HuggingFace: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- App de teclado UnimeType: https://unimetype.com/download?utm_source=huggingface&utm_medium=referral&utm_campaign=transliteration_2_1
- Paper, repositorio de código y demos: no disponibles en la información proporcionada.
