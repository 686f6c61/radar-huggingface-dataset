# UnimeType/Transliteration-2.0-0.8B-GGUF

## Resumen

UnimeType Transliteration 2.0 0.8B (v2.1) es un modelo especializado en transliteración para métodos de entrada (IME) desarrollado por UnimeType a partir de Qwen/Qwen3.5-0.8B. Su función es convertir romanizaciones informales —Pinyin chino, Romaji japonés, Hinglish (hindi romanizado) y Arabizi (árabe con caracteres latinos)— a sus escrituras nativas, tanto en frases cortas como en oraciones largas de múltiples cláusulas (60–240+ caracteres). Es relevante porque resuelve un problema real de teclados y editores de texto: los usuarios escriben idiomas no latinos con alfabeto latino y necesitan conversión precisa, preservando intactos términos técnicos en inglés, `@handles`, URLs, fragmentos de código, JSON, números, saltos de línea y emojis.

La versión v2.1 ("Long-Sentence Upgrade") se centra en oraciones largas: el 67,2 % de sus datos de entrenamiento son entradas multi-cláusula con `max_seq_len=1024`. Según su autor, el modelo supera en su benchmark estándar de 414 casos a DeepSeek V4.1 Flash (72,7 % frente a 70,5 %), un resultado notable para un modelo de solo 752 millones de parámetros. Se distribuye en formato GGUF con cuantizaciones Q4_K_M y Q8_0, y emplea una plantilla de chat no-thinking que evita el desperdicio de tokens de razonamiento en LM Studio, `mlx-lm` y `llama.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3.5), no disponible detalle completo |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (max_seq_len del protocolo de entrenamiento v2.1) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF); existen variantes BF16 Safetensors y MLX 6-bit en otros repos |
| Idiomas soportados | Ingles, chino (zh), japones (ja), hindi (hi), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); BF16 safetensors y MLX 6-bit disponibles en repos hermanos |

## Arquitectura y entrenamiento

El modelo es un ajuste especializado de Qwen3.5-0.8B, un transformer decoder de 752 millones de parametros. El entrenamiento de v2.1 sigue el protocolo `unimetype-convert-short-v3` con un curriculum balanceado en el que el 67,2 % de las entradas son oraciones multi-cláusula de 60–240 caracteres y 2–5 cláusulas, con `max_seq_len=1024`. Los datos cubren romanizacion con espacios, agrupada por frases y sin espacios, code-switching bilingue con terminos tecnicos, placeholders protegidos (URLs, handles, codigo, JSON), layouts multilinea y ciclado de reconversion (`Another`).

Una innovacion practica destacable es que el modelo se distribuye con una plantilla de chat no-thinking incondicional (`<|im_start|>assistant\n<think>\n\n</think>\n\n`) en todos los formatos, lo que impide que el modelo genere bloques de razonamiento tipo "Thinking Process:" que desperdiciarian tokens o truncarian la salida en runtimes como llama.cpp o LM Studio. No se ha publicado informacion sobre el uso de RLHF o DPO.

## Capacidades

- Transliteracion de Pinyin chino a caracteres chinos (hanzi)
- Transliteracion de Romaji japones a escritura japonesa (kanji/kana)
- Conversion de Hinglish (hindi romanizado) a Devanagari
- Conversion de Arabizi a escritura arabe
- Procesamiento de oraciones cortas y de multiples clausulas (60–240+ caracteres)
- Preservacion de elementos no transliterables: terminos tecnicos en ingles, `@handles`, URLs, fragmentos de codigo, literales JSON, numeros, saltos de linea y emojis
- Manejo de romanizacion sin espacios y agrupada por frases
- Code-switching bilingue (mezcla de idioma romanizado e ingles tecnico)
- Ciclado de reconversion (funcion "Another") para alternativas de conversion
- Generacion de texto conversacional heredada del modelo base (aunque no es su proposito)

## Casos de uso

- **Teclados moviles multilingues**: integracion como motor de conversion en apps de teclado (el propio UnimeType keyboard lo utiliza), convirtiendo en tiempo real lo que el usuario teclea en alfabeto latino a la escritura nativa.
- **Editores de texto y IDEs con entrada IME**: conversion de Pinyin o Romaji en editores donde no hay un IME nativo disponible, por ejemplo en entornos remotos o maquinas virtuales sin soporte de IME.
- **Procesamiento por lotes de corpora romanizados**: normalizacion de datasets de texto romanizado (transcripciones de redes sociales, chats, foros) a escritura nativa para entrenar o evaluar otros modelos NLP.
- **Mensajeria y chatbots**: preprocesado de mensajes de usuarios que escriben en Hinglish o Arabizi antes de pasarlos a un sistema de NLU, mejorando la comprension del idioma real.
- **Asistentes de escritura para aprendices de idiomas**: herramientas que permiten a estudiantes escribir japones o chino sin dominar la escritura nativa y ver la conversion correcta.
- **Migracion de datos de usuario**: conversion de historiales de chat, notas o bases de datos donde los usuarios escribieron arabizacion latina o Pinyin, preservando URLs, menciones y codigo incrustado.
- **Busqueda y indexacion**: normalizacion de consultas de busqueda romanizadas a escritura nativa para mejorar la recuperacion en buscadores de contenido en chino, japones, hindi o arabe.

## Benchmarks y rendimiento

### Benchmark de oraciones largas multi-clausula (160 casos · 2–5 clausulas, 60–240 caracteres)

| Metrica | v2.0 (0.8B) | v2.1 (0.8B, este modelo) | v2.0 (4B) | v2.1 (4B) |
|---|---:|---:|---:|---:|
| Strict pass global | 1/160 (0,6 %) | 12/160 (7,5 %) | 32/160 (20,0 %) | 46/160 (28,7 %) |
| Normalized pass global | 1/160 (0,6 %) | 12/160 (7,5 %) | 33/160 (20,6 %) | 47/160 (29,4 %) |
| Precision de caracteres media | 69,2 % | 76,49 % | 90,4 % | 93,21 % |
| Chino Pinyin (40 casos) | 0/40 (0,0 % · 61,7 % char) | 1/40 (2,5 % · 66,7 % char) | 6/40 (15,0 % · 92,6 % char) | 9/40 (22,5 % · 92,6 % char) |
| Japones Romaji (40 casos) | 0/40 (0,0 % · 51,7 % char) | 0/40 (0,0 % · 63,7 % char) | 6/40 (15,0 % · 86,0 % char) | 9/40 (22,5 % · 91,0 % char) |
| Hindi Hinglish (40 casos) | 1/40 (2,5 % · 91,9 % char) | 11/40 (27,5 % · 94,8 % char) | 20/40 (50,0 % · 96,7 % char) | 25/40 (62,5 % · 98,1 % char) |
| Arabe Arabizi (40 casos) | 0/40 (0,0 % · 71,6 % char) | 0/40 (0,0 % · 80,8 % char) | 0/40 (0,0 % · 86,4 % char) | 3/40 (7,5 % · 91,2 % char) |

### Benchmark estandar de frases cortas y casos limite (414 casos)

| Segmento | Transliteration-4B (v1.0) | DeepSeek V4.1 Flash | v2.1 (0.8B, este modelo) | v2.1 (4B) |
|---|---:|---:|---:|---:|
| Strict pass global | 230/414 (55,6 %) | 292/414 (70,5 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Expanded pass global | 242/414 (58,5 %) | 297/414 (71,7 %) | 301/414 (72,7 %) | 366/414 (88,4 %) |
| Chino Pinyin (zh) | 151/207 (72,9 %) | 171/207 (82,6 %) | 168/207 (81,2 %) | 195/207 (94,2 %) |
| Japones Romaji (ja) | 15/52 (28,8 %) | 37/52 (71,2 %) | 22/52 (42,3 %) | 40/52 (76,9 %) |
| Hindi / Hinglish (hi) | 41/71 (57,7 %) | 49/71 (69,0 %) | 51/71 (71,8 %) | 61/71 (85,9 %) |
| Arabe Arabizi (ar) | 23/84 (27,4 %) | 35/84 (41,7 %) | 60/84 (71,4 %) | 70/84 (83,3 %) |

Nota: los benchmarks proceden de la model card del autor y no han sido verificados de forma independiente. No hay datos de MMLU, HumanEval, GSM8K ni benchmarks genericos, lo cual es esperable dado el caracter especializado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5–0,6 GB con Q4_K_M y 0,8–1 GB con Q8_0, mas el overhead del runtime y el contexto (hasta 1024 tokens). En la practica, menos de 1,5 GB en cualquier configuracion.
- GPU recomendadas: cualquier GPU moderna; el modelo es tan pequeno que incluso iGPUs integradas son suficientes. No requiere A100, H100 ni tarjetas de gama alta.
- Consumer GPUs: cabe con holgura en cualquier GPU con 2 GB de VRAM o mas (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien es plenamente viable en CPU pura y en moviles gracias a su tamano reducido.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (via GGUF) y `mlx-lm` (con la variante MLX 6-bit). El modelo incluye plantilla de chat no-thinking compatible con estos runtimes.
- Latencia y throughput: no disponible en la informacion publicada, aunque un modelo de 0,8B cuantizado en Q4_K_M tipicamente genera decenas de tokens por segundo incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto efectivo | Benchmark 414 casos (strict) | Licencia | Formato |
|---|---|---|---:|---|---|
| Transliteration 2.0 0.8B v2.1 (este) | 752M | 1024 tokens | 72,7 % | Apache 2.0 | GGUF, BF16, MLX |
| Transliteration 2.0 4B v2.1 | ~4B | 1024 tokens | 88,4 % | No disponible | GGUF, BF16, MLX |
| DeepSeek V4.1 Flash | No disponible | No disponible | 70,5 % | No disponible | No disponible |
| Qwen3.5-0.8B (base) | 752M | No disponible | No disponible (modelo generalista) | No disponible | Safetensors |

La alternativa obvia dentro de la misma familia es la version 4B, que mejora sustancialmente el strict pass en oraciones largas (28,7 % frente a 7,5 %) a cambio de mayores requisitos de hardware. DeepSeek V4.1 Flash es un modelo generalista usado como referencia por el autor; el modelo de 0,8B lo supera en el benchmark de la propia UnimeType pese a ser mucho mas pequeno y especializado.

## Limitaciones y advertencias

- El rendimiento en oraciones largas multi-clausula sigue siendo limitado: solo un 7,5 % de strict pass en el benchmark de 160 casos. Para casos de uso exigentes con oraciones largas, la version 4B es notablemente mejor.
- El japones Romaji y el arabizacion arabe tienen 0 % de strict pass en oraciones largas (aunque la precision de caracteres es del 63,7 % y 80,8 % respectivamente), y el japones solo alcanza 42,3 % en frases cortas: la conversion japonesa es el punto debil del modelo de 0,8B.
- Los benchmarks proceden exclusivamente de la model card del autor y no hay verificacion independiente; los numeros deben tomarse con cautela.
- Riesgo de alucinacion: al ser un modelo generativo de 0,8B, puede producir caracteres incorrectos o conversiones plausibles pero erroneas, especialmente en nombres propios y terminos ambiguos sin contexto.
- La ventana de contexto efectiva del protocolo de entrenamiento es de 1024 tokens, insuficiente para documentos largos; esta pensado para entrada de teclado y frases, no para textos extensos.
- El ingles es idioma de la interfaz y de los terminos protegidos, pero el modelo no esta disenado como modelo generalista en ingles ni en ningun otro idioma: usarlo fuera de su tarea de transliteracion degradara la calidad.
- Licencia Apache 2.0 sin restricciones de uso comercial relevantes.
- Los repos hermanos (BF16 safetensors, MLX) y la version 4B se distribuyen por separado; este repo solo contiene GGUF.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- App de teclado UnimeType: https://unimetype.com/download?utm_source=huggingface&utm_medium=referral&utm_campaign=transliteration_2_1
- Paper, demo o repositorio de codigo de entrenamiento: no disponible
