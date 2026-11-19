# veripazari/nc-turkce-bpe-64k

## Resumen

NC-64k es un tokenizer de nivel de byte basado en BPE (Byte Pair Encoding) entrenado desde cero específicamente para turco, con un vocabulario de 64.000 tokens. Lo desarrolló originalmente el usuario `nesicn` y esta ficha corresponde a una copia archivada publicada por `veripazari` bajo licencia Apache-2.0. No es un modelo de lenguaje: es el componente de tokenización que se usaría como paso previo a un LLM entrenado en turco.

Su rasgo diferencial es un entrenamiento en dos fases: los primeros 36.000 tokens se aprendieron sobre palabras pre-segmentadas en fronteras morfológicas mediante Zemberek, de modo que esas fusiones nunca cruzan un límite raíz-sufijo. El resto del vocabulario se completa con BPE estándar sobre el corpus completo. El resultado es un tokenizer sensible a la morfología aglutinante del turco, sin tokens `<unk>` y con reconstrucción sin pérdidas en NFC.

Es relevante para quien entrene o ajuste modelos en turco y quiera un tokenizer que respete la estructura de la lengua, maneje correctamente el apóstrofo turco (`Ankara'da` → `Ankara` · `'da`) y evite la fragmentación excesiva de raíces y sufijos que producen los tokenizers multilingües genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE (librería `tokenizers` 0.23.3) |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Turco (`tr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (SHA-256 `f1b6004d7a279fc11e1eb97b59ada580add684f1f62e629ae7b9938808b5c450`), compatible con `transformers` y `@huggingface/transformers` |

## Arquitectura y entrenamiento

El tokenizer usa byte-level BPE con un vocabulario de 64.000 unidades: 64 tokens especiales, 256 bytes y 63.680 fusiones (merges). El normalizador aplica únicamente NFC, sin conversión a minúsculas (preserva la distinción `I`/`ı` e `İ`/`i`, crítica en turco) y sin NFKC, que sería con pérdida. La pre-tokenización combina una regla `Split` con un patrón regex específico (que aísla el apóstrofo turco, agrupa dígitos en bloques de hasta 3 y adhiere espacios y saltos de línea de forma controlada) y `ByteLevel(add_prefix_space=False, use_regex=False)`. El decoder es `ByteLevel`, lo que garantiza reconstrucción exacta del texto original.

El entrenamiento se hizo en dos fases sobre 1.416 MB de texto turco (768.761 documentos). En la primera, las 1.000.000 de palabras más frecuentes se analizaron con Zemberek y se partieron en las fronteras raíz-sufijo comunes a todos sus análisis; BPE se entrenó sobre esos fragmentos hasta 36.000 tokens, de modo que esas fusiones no cruzan límites morfológicos. En la segunda, se usó el corpus completo sin pre-segmentar y se completó el vocabulario hasta 64.000. El umbral de 36.000 se eligió entre 24.000, 36.000 y 48.000 mediante una regla predefinida y solo sobre el conjunto de desarrollo. El resultado es un único `tokenizer.json` estándar, sin código personalizado.

## Capacidades

- Tokenización sin pérdidas en NFC: el texto se reconstruye idénticamente tras codificar y decodificar; no genera `<unk>`.
- Segmentación sensible a la morfología aglutinante del turco gracias a la fase de entrenamiento con fronteras Zemberek.
- Manejo correcto del apóstrofo turco: `Ankara'da` se separa en `Ankara` · `'da`; `1923'te` en `192` · `3` · `'te`.
- Agrupación de dígitos en bloques de hasta 3 (`2026` → `202` · `6`).
- Conjunto de tokens especiales para chat y modelado: `<|endoftext|>` (EOS), `<|startoftext|>` (BOS), `<|pad|>`, `<|unk|>` (no producido por BPE), `<|mask|>`, `<|im_start|>`, `<|im_end|>` (ChatML) y 57 tokens reservados.
- No inserta BOS/EOS automáticamente; el modelo consumidor debe añadirlos si los necesita.
- Compatible con `transformers` (Python) y `@huggingface/transformers` (JavaScript).

## Casos de uso

- Entrenamiento de LLMs en turco desde cero: usar NC-64k como tokenizer del modelo permite un vocabulario más compacto y coherente con la morfología, reduciendo la longitud media de secuencia frente a tokenizers multilingües y, con ello, el coste de atención.
- Fine-tuning de modelos existentes con adaptación de embeddings: se puede sustituir el tokenizer original por NC-64k y reentrenar la capa de embeddings para obtener mejor eficiencia en turco.
- Preprocesado de corpus turcos para investigación lingüística: la separación raíz-sufijo facilita análisis morfológico, conteo de lemas y estudios de productividad derivativa.
- Sistemas de búsqueda y recuperación (IR) en turco: la tokenización consistente de raíces y sufijos mejora la coincidencia entre consultas y documentos en índices invertidos.
- Clasificación de texto y análisis de sentimiento en turco: foros, noticias y reseñas de clientes se tokenizan de forma estable, lo que ayuda a modelos de clasificación con vocabularios pequeños.
- Normalización y control de calidad de pipelines de datos: al ser sin pérdidas y sin `<unk>`, sirve para validar integridad de corpus y detectar caracteres problemáticos.
- Integración en aplicaciones de chat: los tokens ChatML (`<|im_start|>`, `<|im_end|>`) permiten formatear conversaciones multi-turno de manera estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas comparativas (como fertilidad de tokens, compresión o cobertura de vocabulario) frente a otros tokenizers turcos.

## Requisitos de hardware

- No requiere GPU: es un tokenizer, se ejecuta en CPU.
- Huella en disco y memoria mínima: el `tokenizer.json` de 64.000 entradas ocupa del orden de unos pocos MB; la carga en memoria es trivial comparada con un modelo neuronal.
- Despliegue: cualquier entorno con `tokenizers` o `transformers` (Python), o `@huggingface/transformers` (JavaScript). No necesita vLLM, llama.cpp, Ollama ni TGI, aunque puede integrarse como componente de tokenización en pipelines que usen esos motores.
- Latencia y throughput: no disponibles en la información proporcionada; al ser BPE puro sobre CPU, el coste por documento es despreciable frente a la inferencia del modelo.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Idiomas | Enfoque morfológico | Licencia |
|---|---|---|---|---|
| NC-64k (este) | 64.000 | Turco | Sí (36.000 tokens con fronteras Zemberek) | Apache-2.0 |
| NC-32k | 32.000 | Turco | Sí (misma receta y datos) | No disponible en la información |
| Tokenizers multilingües genéricos (p. ej. de LLM multilingües) | Variable (a menudo >100.000) | Muchos | No específico para turco | Según el modelo |

La comparación cuantitativa de fertilidad o compresión frente a NC-32k o frente a tokenizers multilingües no está disponible en la información proporcionada. La model card solo ofrece ejemplos cualitativos de segmentación (p. ej. `Albümün` como token único en NC-64k frente a `Albüm` · `ün` en NC-32k).

## Limitaciones y advertencias

- Solo cubre turco (`tr`); no está pensado para otros idiomas y su comportamiento fuera del turco no está documentado.
- No es un modelo de lenguaje: no genera texto, no razona y no tiene parámetros neuronales; no debe evaluarse con benchmarks de LLM.
- El repositorio es un archivo de una copia de `nesicn/nc-turkce-bpe-64k`; la autoría original es de `nesicn` y la ficha debe citarse con esa atribución.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento tienen licencias variadas (CC-BY-SA-4.0, ODC-By, CC-BY-4.0, Apache-2.0); conviene revisar la compatibilidad si se redistribuyen derivados del vocabulario.
- La fase morfológica depende de Zemberek y de las 1.000.000 palabras más frecuentes; palabras raras o neologismos pueden no beneficiarse de la segmentación raíz-sufijo.
- No inserta BOS/EOS automáticamente, lo que puede provocar errores sutiles si se asume el comportamiento de otros tokenizers.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación externa.
- No se han publicado métricas de fertilidad, compresión ni cobertura de vocabulario, lo que dificulta comparar su rendimiento real frente a alternativas.

## Enlaces

- Hugging Face (copia archivada): https://huggingface.co/veripazari/nc-turkce-bpe-64k
- Repositorio original: https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Tokenizer hermano NC-32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Plataforma VeriPazarı: https://veripazari.com.tr
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Cosmos Turkish Corpus: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Dataset ForumSohbetleri: https://huggingface.co/datasets/turkish-nlp-suite/ForumSohbetleri
- Dataset Havadis: https://huggingface.co/datasets/turkish-nlp-suite/Havadis
- Dataset temiz-Wiki: https://huggingface.co/datasets/turkish-nlp-suite/temiz-Wiki
- Dataset AkademikDerlem: https://huggingface.co/datasets/turkish-nlp-suite/AkademikDerlem
- Dataset OzenliDerlem: https://huggingface.co/datasets/turkish-nlp-suite/OzenliDerlem
- Dataset MusteriYorumlari: https://huggingface.co/datasets/turkish-nlp-suite/MusteriYorumlari
- Dataset eksiSozlukScrapy: https://huggingface.co/datasets/ozertuu/eksiSozlukScrapy
- Dataset offenseval2020_tr: https://huggingface.co/datasets/stefan-it/offenseval2020_tr
- Dataset legal_nli_TR_V1: https://huggingface.co/datasets/Turkish-NLI/legal_nli_TR_V1
