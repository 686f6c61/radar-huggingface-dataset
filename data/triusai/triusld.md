# TriusAI/TriusLD

## Resumen

TriusLD (Trius's Little Dictionary) es un tokenizer byte-level BPE desarrollado por TriusAI, no un modelo de lenguaje completo. Su propósito es ofrecer cobertura multilingüe amplia con un vocabulario contenido de 64.972 tokens, cubriendo 58 idiomas y 19 sistemas de escritura (latino, cirílico, griego, hebreo, árabe, tailandés, devanagari, bengalí, tamil, telugu, malayo, guyaratí, canarés, odia, gurmuji, cingalés, han, kana y hangul). Resuelve el problema clásico de los tokenizers anglocéntricos, que fragmentan en exceso lenguas no latinas y disparan el coste computacional en contextos multilingües.

La propuesta técnica es destinar un vocabulario limitado a la amplitud lingüística en lugar de concentrarlo en inglés. Frente a cl100k (0,842 tokens por carácter de media en 58 idiomas), Llama 3 (0,699) o Qwen3 (0,675), TriusLD logra 0,524 con un tercio o la mitad de sus vocabularios. Es una pieza de infraestructura para entrenar o adaptar modelos multilingües con presupuesto de vocabulario restringido.

El repositorio contiene únicamente estadísticas del tokenizer (vocabulario y lista de pares de merges), no pesos de modelo ni texto de entrenamiento. Se publica bajo licencia Apache 2.0 con concesión expresa de patentes, y está pensado para integrarse en pipelines de `transformers` o `tokenizers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE con normalización NFC |
| Parámetros totales | no disponible (no es un modelo de lenguaje) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantización | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | 58 idiomas: en, fr, es, de, it, pt, nl, pl, cs, ro, sv, tr, id, vi, ru, uk, be, bg, sr, mk, kk, ky, mn, tg, tt, ba, cv, ab, os, sah, el, he, yi, ar, fa, ur, ug, ps, sd, ckb, th, hi, mr, ne, bn, as, ta, te, ml, gu, kn, or, pa, si, zh, ja, ko |
| Licencia | Apache 2.0 (con concesión expresa de patentes) |
| Formato de pesos | `tokenizer.json`, vocabulario y merges (no safetensors ni GGUF) |

Datos adicionales del vocabulario: 256 bytes + 14 tokens especiales + 64.702 merges. Tokens especiales: `<|pad|>`, `<|bos|>`, `<|eos|>`, `<|unk|>`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`, `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`, `<|tool_call|>`, `<|tool_result|>`, `<|image|>`.

## Arquitectura y entrenamiento

TriusLD es un tokenizer byte-level BPE con normalización NFC aplicada de serie (deliberadamente no NFKC, para no plegar puntuación de ancho completo ni ligaduras). El alfabeto de 256 bytes garantiza codificación y descodificación sin pérdida para cualquier entrada UTF-8, incluidos sistemas de escritura no contemplados en el entrenamiento. No inserta BOS/EOS automáticamente, usa `add_prefix_space=False` y desactiva `clean_up_tokenization_spaces` para que la descodificación sea exacta.

El entrenamiento se realizó con BPE por sistema de escritura con cuotas explícitas, compuesto mediante una unión que respeta dependencias, y una pasada de cobertura que fuerza los caracteres más frecuentes de cada script a ser tokens únicos. Los datos de entrenamiento son FineWeb (inglés) y FineWeb-2 (resto de idiomas), ambos bajo ODC-By 1.0. El repositorio no redistribuye texto de entrenamiento, solo estadísticas. No se documentan fases de RLHF ni DPO porque no aplican a un tokenizer.

## Capacidades

- Tokenización multilingüe nativa de 58 idiomas en 19 sistemas de escritura.
- Codificación sin pérdida de cualquier UTF-8 gracias al alfabeto de 256 bytes.
- Normalización NFC integrada: formas compuestas y descompuestas producen los mismos ids.
- Distinción de chino simplificado y tradicional como puntos de código distintos, con ambos inventarios en el vocabulario.
- Soporte de tokens especiales para chat (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`).
- Soporte de tokens FIM (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`) para infilling de código.
- Soporte de tokens para tool calling (`<|tool_call|>`, `<|tool_result|>`) y multimodalidad (`<|image|>`).
- No incluye capacidades de generación, razonamiento ni visión: es exclusivamente un tokenizer.

## Casos de uso

- Entrenamiento de modelos multilingües con presupuesto de vocabulario limitado: usar TriusLD permite cubrir 58 idiomas con 64.972 tokens, frente a los 128k-256k habituales, reduciendo el tamaño de la capa de embedding y el coste de softmax.
- Adaptación de modelos existentes a lenguas de bajos recursos: el vocabulario incluye cirílico, árabe, índico y CJK, lo que reduce la fragmentación en idiomas como hindi, bengalí o tamil frente a tokenizers anglocéntricos.
- Pipelines de preprocesado para corpus multilingües: la codificación sin pérdida y la normalización NFC estable facilitan la reproducibilidad en tareas de limpieza y deduplicación de datos.
- Modelos de código con infilling: los tokens FIM permiten entrenar modelos de autocompletado en el punto medio sin añadir tokens ad hoc.
- Sistemas de chat con tool calling: los tokens `<|system|>`, `<|user|>`, `<|assistant|>`, `<|tool_call|>` y `<|tool_result|>` cubren el ciclo completo de conversación y llamada a herramientas.
- Investigación sobre eficiencia de tokenizers: sirve como referencia para estudiar el compromiso entre tamaño de vocabulario y compresión por familia de escritura, con métricas publicadas por idioma.
- Preprocesado de datos CJK: la distinción entre chino simplificado y tradicional evita colapsos de normalización que pierden información en corpus mixtos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la información disponible. El autor publica métricas de compresión (tokens por carácter, tpc, menor es mejor) medidas sobre el split `test` de FineWeb-2 con 100.000 caracteres por idioma:

| Familia / idioma | tpc |
|---|---|
| Latino (media) | 0,299 |
| Inglés | 0,260 |
| Vietnamita | 0,276 |
| Español | 0,277 |
| Alemán | 0,293 |
| Cirílico (media) | 0,494 |
| Ruso | 0,461 |
| Árabe (media) | 0,519 |
| Árabe | 0,522 |
| Griego + hebreo (media) | 0,540 |
| Hebreo | 0,556 |
| Tailandés | 0,595 |
| CJK (media) | 0,730 |
| Hindi | 0,657 |
| Japonés | 0,678 |
| Chino simplificado | 0,708 |
| Bengalí | 0,722 |
| Coreano | 0,733 |
| Tamil | 0,754 |
| Chino tradicional | 0,802 |
| Índico (media) | 0,732 |

Comparativa de tpc media sobre 58 idiomas en el mismo texto: cl100k 0,842; Llama 3 0,699; Qwen3 0,675; TriusLD 0,524; o200k 0,394; Gemma 3 0,392. El inglés rinde a unos 3,85 caracteres por token.

## Requisitos de hardware

- No aplica VRAM de inferencia: no es un modelo de lenguaje, sino un tokenizer.
- Coste de memoria del vocabulario: 64.972 entradas, aproximadamente un tercio del de vocabularios de 200k, lo que reduce el tamaño de la capa de embedding del modelo que lo integre.
- CPU: la tokenización se ejecuta en CPU; el rendimiento depende de la implementación de `tokenizers` (Rust) y del tamaño de los merges.
- Despliegue: compatible con `transformers` (`AutoTokenizer`) y con la librería `tokenizers` (`Tokenizer.from_file`). No aplica a vLLM, llama.cpp u Ollama como modelo, aunque puede usarse en pipelines que empleen esos motores si el modelo subyacente lo adopta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa de tokenizers multilingües por compresión media (tpc) y tamaño de vocabulario:

| Tokenizer | tpc medio (58 idiomas) | Tamaño de vocabulario | Licencia |
|---|---|---|---|
| TriusLD | 0,524 | 64.972 | Apache 2.0 |
| cl100k (OpenAI) | 0,842 | ~100k | propietaria |
| Llama 3 | 0,699 | 128k | Llama 3 Community License |
| Qwen3 | 0,675 | ~151k | Apache 2.0 (según versión) |
| o200k (OpenAI) | 0,394 | ~200k | propietaria |
| Gemma 3 | 0,392 | ~262k | Gemma Terms of Use |

TriusLD ofrece la mejor compresión por token de vocabulario entre los comparados: 0,524 tpc con 64.972 tokens, frente a 0,394-0,392 de o200k y Gemma 3, que emplean entre tres y cuatro veces más vocabulario. Los datos de tamaño de vocabulario de cl100k, Qwen3, o200k y Gemma 3 no se detallan en la información proporcionada y se indican como aproximados según conocimiento general; verificar antes de citar.

## Limitaciones y advertencias

- El coreano usa las 2.350 sílabas hangul más frecuentes más jamo, no el bloque completo de 11.172 sílabas; las sílabas raras cuestan dos o tres tokens.
- La cobertura índica es real pero fina: diez sistemas de escritura comparten 2.660 merges, con aproximadamente el doble de tokens que un vocabulario de 200k en hindi, bengalí o tamil.
- Los sistemas de escritura no soportados caen a bytes, con dos a cuatro tokens por carácter.
- El código se sirve con el inventario latino: adecuado, pero no optimizado para lenguajes de programación.
- No es un modelo de lenguaje: no genera texto, no razona y no tiene capacidades de visión ni audio; los tokens `<|image|>`, `<|tool_call|>` y `<|tool_result|>` son marcadores estructurales, no funcionalidad.
- Riesgo de alucinación: no aplica directamente al tokenizer, pero sí al modelo que lo use; la calidad de la tokenización no garantiza la calidad del modelo.
- Licencia Apache 2.0 permite uso comercial, pero exige retener avisos de copyright y licencia, declarar cambios significativos y no usar el nombre TriusAI para respaldar derivados.
- El repositorio no redistribuye texto de entrenamiento; los datos FineWeb y FineWeb-2 (ODC-By 1.0) se acreditan en `NOTICE`.
- No se documentan sesgos del tokenizer más allá de las limitaciones de cobertura por script; la compresión desigual entre familias (latino 0,299 frente a índico 0,732) implica coste computacional asimétrico por idioma.

## Enlaces

- Hugging Face: https://huggingface.co/TriusAI/TriusLD
- FineWeb (datos de entrenamiento, inglés): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- FineWeb-2 (datos de entrenamiento, multilingüe): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Librería `tokenizers`: https://github.com/huggingface/tokenizers
- Librería `transformers`: https://github.com/huggingface/transformers
- Artículo acompañante con detalles de construcción y bugs de ordenación de merges: no disponible en la información proporcionada (el autor lo menciona pero no enlaza)
