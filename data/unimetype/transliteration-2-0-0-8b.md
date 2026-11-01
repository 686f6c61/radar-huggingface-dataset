# UnimeType/Transliteration-2.0-0.8B

## Resumen

UnimeType Transliteration 2.0 0.8B (v2.1) es un modelo especializado en transliteración para métodos de entrada multilingües, desarrollado por UnimeType sobre la base de Qwen/Qwen3.5-0.8B. Su función es convertir romanizaciones informales —Pinyin chino, Romaji japonés, Hinglish (hindi romanizado) y Arabizi (árabe romanizado)— a sus escrituras nativas (hanzi, kana/kanji, devanagari y alfabeto árabe), tanto en frases cortas como en oraciones largas de varias cláusulas (60–240+ caracteres).

El problema que resuelve es muy concreto: los usuarios de teclados móviles escriben idiomas asiáticos y de derecha a izquierda usando el alfabeto latino, y los IMEs (input method editors) tradicionales tienen dificultades con oraciones largas, mezcla de idiomas y formatos protegidos. Este modelo, con solo 752 millones de parámetros, está diseñado para ejecutarse en dispositivos de consumo y preservar intactos los términos técnicos en inglés, menciones (@handles), URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.

La versión v2.1 ("Long-Sentence Upgrade") mejora sustancialmente el manejo de oraciones largas multicláusula respecto a v2.0: la precisión de caracteres en oraciones largas pasa del 69,2 % al 76,5 %, y en el benchmark estándar de 414 casos alcanza un 72,7 % de acierto estricto, superando a DeepSeek V4.1 Flash (70,5 %). Se distribuye en formato MLX 6-bit (también existen variantes BF16 safetensors y GGUF según la model card), con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B), afinado para transliteración |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | max_seq_len = 1024 (v2.1); 640 en v2.0 |
| Tipos de cuantizacion | 6-bit (MLX); también BF16 safetensors y GGUF según la model card |
| Idiomas soportados | en, zh, ja, hi, ar (transliteración hacia chino, japonés, hindi y árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 6-bit); GGUF y BF16 mencionados en la model card |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only, al que se le aplica un ajuste especializado para la tarea de transliteración de entrada. La versión v2.1 se entrena con un plan de estudios equilibrado en el que el 67,2 % de las entradas de entrenamiento son oraciones multicláusula de 60 a 240 caracteres (2 a 5 cláusulas), con `max_seq_len=1024`. Los datos cubren romanización con espacios, agrupada por frases y sin espacios, código bilingüe alternado (code-switching), placeholders protegidos, diseños multilínea y ciclado de reconversión ("Another").

Un detalle técnico relevante es que el modelo incluye una plantilla de chat no-thinking incondicional (`chat_template.jinja` con `<|im_start|>assistant\n<think>\n\n</think>\n\n`), que desactiva la generación de razonamiento intermedio para evitar desperdicio de tokens o truncamientos en LM Studio, mlx-lm y llama.cpp. El protocolo de conversión (`unimetype-convert-short-v3`) es 100 % compatible con los clientes existentes de Transliteration-2.0.

No se ha publicado información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Transliteración de Pinyin chino a caracteres hanzi (zh)
- Transliteración de Romaji japonés a escritura japonesa (ja)
- Transliteración de Hinglish / hindi romanizado a devanagari (hi)
- Transliteración de Arabizi a alfabeto árabe (ar)
- Manejo de oraciones largas multicláusula (60–240+ caracteres, 2–5 cláusulas), no solo frases cortas
- Preservación de elementos no transliterables: términos técnicos en inglés, @handles, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis
- Manejo de romanización con espacios, agrupada por frases y sin espacios
- Code-switching bilingüe (mezcla de inglés técnico con el idioma objetivo)
- Soporte de reconversión cíclica ("Another")
- Generación de texto conversacional heredada del modelo base (pipeline text-generation)
- No se ha documentado soporte de tool calling, agentes, visión ni audio

## Casos de uso

- Teclados móviles multilingües (IME): integración como motor de conversión en apps de teclado para usuarios que escriben chino, japonés, hindi o árabe con teclado latino; su tamaño de 0,8B y formato MLX 6-bit (~1,2 GB) lo hacen viable en dispositivos Apple Silicon.
- Escritura de mensajes largos en dispositivos móviles: gracias a la mejora v2.1 en oraciones multicláusula, permite convertir mensajes completos de 60–240 caracteres sin dividirlos manualmente en fragmentos.
- Chat y mensajería con code-switching: usuarios que mezclan inglés técnico con su idioma nativo ("envíame el report ASAP por WeChat") obtienen conversión que preserva los términos en inglés intactos.
- Procesamiento de contenido técnico estructurado: conversión de texto que contiene URLs, menciones, JSON o código sin corromper esos elementos, útil en pipelines de normalización de texto de usuario.
- Entrada de árabe coloquial (Arabizi): el salto en árabe es notable (27,4 % → 71,4 % en el benchmark estándar respecto a la versión 4B anterior), lo que lo hace especialmente adecuado para este idioma, históricamente el más difícil.
- Prototipado y pruebas locales de IMEs: al ser un modelo pequeño con formatos MLX, GGUF y BF16, puede ejecutarse en LM Studio, mlx-lm o llama.cpp para validar flujos de entrada antes de producción.
- Accesibilidad y redacción asistida: usuarios con dificultad para cambiar de distribución de teclado pueden escribir todo en latino y obtener el texto nativo automáticamente.

## Benchmarks y rendimiento

### Benchmark de oraciones largas multicláusula (160 casos · 2–5 cláusulas, 60–240 caracteres)

| Métrica | v2.0 (0.8B) | v2.1 (0.8B) | v2.0 (4B) | v2.1 (4B) |
|---|---:|---:|---:|---:|
| Strict pass global (160 casos) | 1 / 160 (0,6 %) | 12 / 160 (7,5 %) | 32 / 160 (20,0 %) | 46 / 160 (28,7 %) |
| Normalized pass global | 1 / 160 (0,6 %) | 12 / 160 (7,5 %) | 33 / 160 (20,6 %) | 47 / 160 (29,4 %) |
| Precisión media de caracteres | 69,2 % | 76,49 % | 90,4 % | 93,21 % |
| Chino Pinyin (zh, 40 casos) | 0 / 40 (61,7 % char) | 1 / 40 (2,5 %) · 66,7 % char | 6 / 40 (92,6 % char) | 9 / 40 (22,5 %) · 92,6 % char |
| Japonés Romaji (ja, 40 casos) | 0 / 40 (51,7 % char) | 0 / 40 · 63,7 % char | 6 / 40 (86,0 % char) | 9 / 40 (22,5 %) · 91,0 % char |
| Hindi Hinglish (hi, 40 casos) | 1 / 40 (91,9 % char) | 11 / 40 (27,5 %) · 94,8 % char | 20 / 40 (96,7 % char) | 25 / 40 (62,5 %) · 98,1 % char |
| Árabe Arabizi (ar, 40 casos) | 0 / 40 (71,6 % char) | 0 / 40 · 80,8 % char | 0 / 40 (86,4 % char) | 3 / 40 (7,5 %) · 91,2 % char |

### Benchmark estándar de frases cortas y casos límite (414 casos)

| Métrica | Transliteration-4B v1.0 | DeepSeek V4.1 Flash | v2.1 (0.8B) | v2.1 (4B) |
|---|---:|---:|---:|---:|
| Strict pass global (414 casos) | 230 / 414 (55,6 %) | 292 / 414 (70,5 %) | 301 / 414 (72,7 %) | 366 / 414 (88,4 %) |
| Expanded pass global | 242 / 414 (58,5 %) | 297 / 414 (71,7 %) | 301 / 414 (72,7 %) | 366 / 414 (88,4 %) |
| Chino Pinyin (zh) | 151 / 207 (72,9 %) | 171 / 207 (82,6 %) | 168 / 207 (81,2 %) | 195 / 207 (94,2 %) |
| Japonés Romaji (ja) | 15 / 52 (28,8 %) | 37 / 52 (71,2 %) | 22 / 52 (42,3 %) | 40 / 52 (76,9 %) |
| Hindi / Hinglish (hi) | 41 / 71 (57,7 %) | 49 / 71 (69,0 %) | 51 / 71 (71,8 %) | 61 / 71 (85,9 %) |
| Árabe Arabizi (ar) | 23 / 84 (27,4 %) | 35 / 84 (41,7 %) | 60 / 84 (71,4 %) | 70 / 84 (83,3 %) |

Nota: los benchmarks son publicados por el propio autor del modelo; no existen evaluaciones independientes verificables en la información disponible. No se han publicado resultados de benchmarks genéricos (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con 752 M de parámetros en 6-bit, el repo ocupa 1,2 GB; se estima que cabe cómodamente en sistemas con 4 GB de memoria unificada o GPU con 4–6 GB de VRAM (estimación basada en el tamaño del repo; el autor no publica cifras oficiales).
- GPU recomendadas: por su formato MLX, el objetivo principal es Apple Silicon (M1/M2/M3/M4). En formato GGUF puede ejecutarse en cualquier GPU consumer moderna (RTX 3060, RTX 4060 o superiores) o incluso solo en CPU.
- Consumer GPUs: sí, cabe sobradamente en prácticamente cualquier GPU consumer actual dado su tamaño de ~0,8B parámetros y ~1,2 GB de pesos.
- Opciones de despliegue: mlx-lm (formato nativo), LM Studio, llama.cpp (GGUF); la model card menciona compatibilidad explícita con estas tres opciones.
- Latencia y throughput: no disponible; el autor no publica cifras, aunque el tamaño reducido y la plantilla no-thinking (que elimina tokens de razonamiento) sugieren respuestas rápidas en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark 414 casos (strict) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Transliteration 2.0 0.8B v2.1 | 752 M | 1024 | 72,7 % | Apache 2.0 | HuggingFace (MLX 6-bit, GGUF, BF16) |
| Transliteration 2.0 4B v2.1 | no disponible (misma familia) | 1024 | 88,4 % | Apache 2.0 | HuggingFace (misma familia) |
| DeepSeek V4.1 Flash | no disponible | no disponible | 70,5 % | no disponible | no disponible |
| Qwen3.5-0.8B (base) | 752 M aprox. | no disponible | no especializado en transliteración | no disponible | HuggingFace |

La alternativa directa dentro de la misma familia es la variante 4B, que ofrece mayor precisión (88,4 % frente a 72,7 % en el benchmark estándar y 93,21 % frente a 76,49 % de precisión de caracteres en oraciones largas) a costa de un mayor consumo de recursos. DeepSeek V4.1 Flash se cita en la model card como referencia externa superada por la versión 0.8B en el benchmark estándar, aunque se trata de un modelo de propósito general más grande.

## Limitaciones y advertencias

- Rendimiento desigual por idioma: en oraciones largas multicláusula, el strict pass en japonés (0/40) y árabe (0/40) es nulo en la versión 0.8B v2.1; la precisión de caracteres es aceptable pero la conversión exacta de la oración completa falla sistemáticamente en esos idiomas.
- El chino y el japonés son los puntos débiles en frases cortas también (81,2 % y 42,3 % respectivamente en el benchmark estándar), debido en parte a la ambigüedad inherente del Pinyin y el Romaji (homófonos, kanji múltiples).
- Benchmarks publicados por el propio autor: no hay verificación independiente de las cifras, incluida la comparación con DeepSeek V4.1 Flash.
- Riesgo de alucinación en la conversión: al ser un modelo generativo, puede producir caracteres incorrectos o inventados en lugar de una transliteración determinista; no es adecuado sin supervisión para textos críticos.
- Contexto limitado a 1024 tokens: no apto para documentos largos; está diseñado para entrada de teclado y mensajes.
- Capacidades genéricas degradadas: al ser un modelo afinado para una tarea muy específica, su utilidad como modelo conversacional general está probablemente comprometida.
- Sesgos: no se ha publicado información sobre sesgos del modelo.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes más allá del aviso de licencia estándar.
- Distribución centrada en el ecosistema Apple (MLX): los usuarios de CUDA deben recurrir a los formatos GGUF o BF16 mencionados en la model card, no presentes como repos separados en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- App de teclado UnimeType: https://unimetype.com/download?utm_source=huggingface&utm_medium=referral&utm_campaign=transliteration_2_1
- Paper, repositorio de código y demo: no disponible
