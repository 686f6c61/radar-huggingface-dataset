# UnimeType/Transliteration-2.0-4B

## Resumen

UnimeType Transliteration 2.0 4B (v2.1) es un modelo especializado en transliteración para métodos de entrada (IME) desarrollado por UnimeType a partir de Qwen/Qwen3.5-4B. Su función es convertir romanizaciones informales —pinyin chino, romaji japonés, Hinglish (hindi romanizado) y Arabizi (árabe en alfabeto latino)— a sus escrituras nativas (hanzi, kana/kanji, devanagari y alfabeto árabe), tanto en frases cortas como en oraciones largas de múltiples cláusulas de 60 a 240 o más caracteres. Su novedad es que preserva intactos los términos técnicos en inglés, menciones, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.

La versión v2.1 (etiquetada como `2.0-v4 Multi-Clause Long-Sentence Upgrade`) se centra en mejorar el manejo de oraciones largas: el 67,2 % de los datos de entrenamiento son entradas multicláusula, con `max_seq_len=1024`. Respecto a v2.0, el modelo 4B mejora su precisión de caracteres en oraciones largas del 90,4 % al 93,21 % y reduce las violaciones de contrato de salida un 76,9 %. En el benchmark estándar de 414 casos alcanza un 88,4 % de acierto estricto, superando a DeepSeek V4.1 Flash (70,5 %).

El repositorio distribuye el modelo en formato MLX 6-bit (también existen variantes BF16 Safetensors y GGUF mencionadas en la model card), con una plantilla de chat no-thinking incondicional que evita el desperdicio de tokens de razonamiento en LM Studio, mlx-lm y llama.cpp. Está orientado principalmente a teclados y aplicaciones de entrada multilingües, como la app de teclado propia de UnimeType.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | max_seq_len = 1024 tokens (entrenamiento, v2.1) |
| Tipos de cuantizacion | 6-bit (MLX); también BF16 Safetensors y GGUF según la model card |
| Idiomas soportados | en, zh, ja, hi, ar (transliteración hacia chino, japonés, hindi y árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 6-bit), 6,9 GB de repositorio |

## Arquitectura y entrenamiento

El modelo es un ajuste fino especializado sobre Qwen3.5-4B, un transformer de 4 mil millones de parámetros. No es un modelo desde cero: hereda la arquitectura y el tokenizador del modelo base y se especializa en la tarea de transliteración de entrada. La versión v2.1 se entrenó con un currículo equilibrado en el que el 67,2 % de las entradas son oraciones multicláusula de 60 a 240 caracteres con 2 a 5 cláusulas, usando `max_seq_len=1024`. Los datos cubren romanización con espacios, agrupada por frases y sin espacios, código alternante bilingüe (code-switching), placeholders protegidos y diseños multilínea.

Una innovación destacable es el protocolo `unimetype-convert-short-v3`, 100 % compatible con los clientes existentes de Transliteration-2.0 (drop-in), y la inclusión de una plantilla de chat no-thinking incondicional (`<|im_start|>assistant\n<think>\n\n</think>\n\n`) en todos los formatos, que suprime la generación de bloques de razonamiento y evita truncamientos en LM Studio, mlx-lm y llama.cpp. No se dispone de detalles sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF/DPO.

## Capacidades

- Transliteración de pinyin chino a caracteres hanzi, incluyendo romanización sin espacios y agrupada por frases.
- Transliteración de romaji japonés a escritura japonesa nativa (kana/kanji).
- Conversión de Hinglish (hindi romanizado mezclado con inglés) a devanagari.
- Conversión de Arabizi (árabe escrito en alfabeto latino, con números como 3, 7) a alfabeto árabe.
- Manejo de oraciones largas multicláusula (60–240+ caracteres, 2–5 cláusulas).
- Preservación de contenido protegido: términos técnicos en inglés, `@handles`, URLs, fragmentos de código, literales JSON, números, saltos de línea y emojis.
- Código alternante bilingüe (code-switching) dentro de una misma oración.
- Ciclado de reconversión (`Another` / reconvert) para alternar entre candidatos de transliteración.
- Generación de texto conversacional heredada del modelo base Qwen3.5-4B (aunque el modelo está especializado en transliteración).
- No-thinking forzado: la plantilla desactiva el modo de razonamiento para minimizar latencia.

## Casos de uso

- Teclados multilingües para móviles: integración como motor de un IME que convierte en tiempo real lo que el usuario escribe en alfabeto latino al script nativo, gracias a la baja latencia de un modelo de 4B cuantizado a 6-bit y sin fase de razonamiento.
- Entrada de chino sin teclado chino: usuarios occidentales pueden escribir pinyin y obtener hanzi directamente, útil en dispositivos sin IME chino instalado o en entornos web.
- Chat en árabe desde teclados latinos: conversión de Arabizi (muy común en mensajería informal árabe) a alfabeto árabe legible, manteniendo emojis y URLs intactos.
- Comunicación hindi-inglesa: profesionales que mezclan Hinglish en el trabajo pueden generar mensajes en devanagari correcto sin perder los términos técnicos en inglés.
- Normalización de datos de usuario: pipelines que procesan texto introducido por usuarios (formularios, bases de datos de clientes) pueden normalizar romanizaciones informales a escritura nativa para búsqueda, indexación o análisis.
- Localización y moderación de contenidos: preprocesamiento de comentarios o mensajes en romanización informal para que sistemas de NLP posteriores (que suelen trabajar mejor con script nativo) puedan procesarlos.
- Accesibilidad y aprendizaje de idiomas: herramientas que ayudan a estudiantes de japonés o chino a verificar cómo se escribe lo que pronuncian, con capacidad de ciclar entre candidatos mediante la función `Another`.

## Benchmarks y rendimiento

### Benchmark de oraciones largas multicláusula (160 casos, 2–5 cláusulas, 60–240 caracteres)

| Métrica | v2.0 (0.8B) | v2.1 (0.8B) | v2.0 (4B) | v2.1 (4B, este modelo) |
|---|---:|---:|---:|---:|
| Acierto estricto global | 1/160 (0,6 %) | 12/160 (7,5 %) | 32/160 (20,0 %) | 46/160 (28,7 %) |
| Acierto normalizado global | 1/160 (0,6 %) | 12/160 (7,5 %) | 33/160 (20,6 %) | 47/160 (29,4 %) |
| Precisión media de caracteres | 69,2 % | 76,49 % | 90,4 % | 93,21 % |
| Chino pinyin (40 casos) | 0/40 (0,0 %) | 1/40 (2,5 %) | 6/40 (15,0 %) | 9/40 (22,5 %) |
| Japonés romaji (40 casos) | 0/40 (0,0 %) | 0/40 (0,0 %) | 6/40 (15,0 %) | 9/40 (22,5 %) |
| Hindi Hinglish (40 casos) | 1/40 (2,5 %) | 11/40 (27,5 %) | 20/40 (50,0 %) | 25/40 (62,5 %) |
| Árabe Arabizi (40 casos) | 0/40 (0,0 %) | 0/40 (0,0 %) | 0/40 (0,0 %) | 3/40 (7,5 %) |

### Benchmark estándar de 414 casos (frases cortas y casos límite)

| Métrica | Transliteration-4B (v1.0) | DeepSeek V4.1 Flash | v2.1 (0.8B) | v2.1 (4B, este modelo) |
|---|---:|---:|---:|---:|
| Acierto estricto global | 230/414 (55,6 %) | 292/414 (70,5 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Acierto expandido global | 242/414 (58,5 %) | 297/414 (71,7 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Chino pinyin (zh) | 151/207 (72,9 %) | 171/207 (82,6 %) | 168/207 (81,2 %) | 195/207 (94,2 %) |
| Japonés romaji (ja) | 15/52 (28,8 %) | 37/52 (71,2 %) | 22/52 (42,3 %) | 40/52 (76,9 %) |
| Hindi Hinglish (hi) | 41/71 (57,7 %) | 49/71 (69,0 %) | 51/71 (71,8 %) | 61/71 (85,9 %) |
| Árabe Arabizi (ar) | 23/84 (27,4 %) | 35/84 (41,7 %) | 60/84 (71,4 %) | 70/84 (83,3 %) |

No se han publicado resultados de benchmarks genéricos (MMLU, HumanEval, GSM8K, etc.); las evaluaciones son específicas de la tarea de transliteración y provienen del autor del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2–3,5 GB para la variante MLX 6-bit (6,9 GB incluye el repositorio completo); la variante BF16 requeriría en torno a 8,5 GB.
- Consumer GPUs: cabe cómodamente en una RTX 3060 de 12 GB o superior con la variante GGUF; en Apple Silicon (M1/M2/M3/M4) funciona de forma nativa vía MLX con 8 GB de memoria unificada o más.
- GPUs de servidor (A100, H100): no son necesarias; el modelo está pensado para ejecución local y en dispositivos de borde.
- Opciones de despliegue: MLX (mlx-lm) como formato principal, LM Studio, llama.cpp (variante GGUF) y Ollama (vía GGUF). La model card confirma compatibilidad con LM Studio, mlx-lm y llama.cpp.
- Latencia: no disponible en cifras concretas, aunque el diseño sin fase de thinking y el tamaño de 4B apuntan a latencias bajas adecuadas para uso como IME interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto entrenado | Benchmark 414 casos (estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transliteration 2.0 4B (v2.1) | 4,2 B | 1024 tokens | 88,4 % | Apache 2.0 | MLX 6-bit, BF16, GGUF |
| Transliteration 2.0 0.8B (v2.1) | 0,8 B | 1024 tokens | 72,7 % | no disponible | MLX 6-bit, BF16, GGUF |
| DeepSeek V4.1 Flash | no disponible | no disponible | 70,5 % | no disponible | no disponible |
| Transliteration-4B (v1.0) | 4 B | no disponible | 55,6 % | no disponible | no disponible |

La variante 0.8B es la alternativa ligera de la misma familia: mucho más pequeña y rápida, pero con precisión notablemente inferior en oraciones largas (76,49 % frente a 93,21 % de precisión de caracteres). DeepSeek V4.1 Flash es un modelo generalista usado como referencia por el autor; queda por detrás en la tarea específica de transliteración.

## Limitaciones y advertencias

- El acierto estricto en oraciones largas multicláusula es del 28,7 %: aunque la precisión de caracteres es alta (93,21 %), las oraciones completas sin ningún error siguen siendo minoritarias, especialmente en japonés y árabe.
- El árabe Arabizi es el idioma más débil: solo 7,5 % de acierto estricto en oraciones largas y 83,3 % en frases cortas.
- El japonés romaji en oraciones largas alcanza 22,5 % de acierto estricto; la conversión kana/kanji es intrínsecamente ambigua y puede requerir ciclado manual de candidatos.
- Los benchmarks provienen del propio autor y no son evaluaciones independientes; la comparación con DeepSeek V4.1 Flash usa la metodología de UnimeType.
- La ventana de contexto entrenada es de 1024 tokens, muy limitada para usos fuera del ámbito de IME.
- El modelo está especializado en transliteración: como modelo conversacional generalista, probablemente rinda por debajo de Qwen3.5-4B original en tareas no relacionadas.
- Riesgo de alucinación en la conversión de romanizaciones muy ambiguas o con errores tipográficos del usuario: no disponible información específica, pero es un riesgo inherente a la tarea.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- El repositorio principal distribuye MLX 6-bit, orientado a Apple Silicon; usuarios de CUDA deben recurrir a las variantes BF16 o GGUF mencionadas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- App de teclado UnimeType: https://unimeType.com/download
