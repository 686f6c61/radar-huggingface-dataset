# veripazari/nc-turkce-bpe-32k

## Resumen

`veripazari/nc-turkce-bpe-32k` es un tokenizer byte-level BPE de 32.000 unidades entrenado desde cero para turco, desarrollado originalmente por el usuario `nesicn` y rearchivado por VeriPazarı manteniendo la documentación original. No es un modelo de lenguaje: es el componente de tokenización que se usaría junto a un transformer entrenado sobre texto turco. Su relevancia radica en el tratamiento explícito de la morfología aglutinante del turco, idioma en el que los tokenizers genéricos multilingües suelen fragmentar raíces y sufijos de forma ineficiente.

La innovación principal es un entrenamiento en dos fases: las primeras 24.000 unidades del vocabulario se aprenden sobre palabras pre-segmentadas en fronteras morfológicas mediante Zemberek, de modo que esas fusiones BPE nunca cruzan un límite raíz-sufijo. El resto del vocabulario se completa con BPE estándar sobre el corpus completo. El resultado es una lista de merges única y ordenada, compatible con `tokenizer.json` estándar y sin código personalizado.

El tokenizer es lossless en NFC, no genera `<unk>`, preserva las mayúsculas (`I`/`ı`, `İ`/`i`) y trata el apóstrofo turco de forma específica (`Ankara'da` → `Ankara` · `'da`). Se distribuye bajo licencia Apache-2.0 y es compatible con `transformers` 4.x/5.x y Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE (librería `tokenizers` 0.23.3) |
| Parametros totales | no disponible (no es un modelo neuronal; 32.000 unidades de vocabulario) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el tokenizer no impone ventana de contexto) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | Turco (`tr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (SHA-256 `626f59b8ed602b7b3ee7cf3a07c93f2e6dcc024e57bc24bc5ca68c00ecc9e66e`), más ficheros auxiliares de la librería `tokenizers` |

## Arquitectura y entrenamiento

El tokenizer emplea BPE a nivel de byte con `min_frequency=2` y un vocabulario de 32.000 unidades compuesto por 64 tokens especiales, 256 bytes y 31.680 merges. El normalizador aplica únicamente NFC; no hay conversión a minúsculas ni NFKC (considerado lossy por el autor). El pre-tokenizador combina una regla `Split` con un patrón regex Unicode que reconoce letras y marcas combinantes (`\p{L}`, `\p{M}`), dígitos agrupados en bloques de hasta 3 (`2026` → `202` · `6`), apóstrofos turcos (`'` y `’`) seguidos de letras, puntuación y secuencias de espacios y saltos de línea. El decoder es `ByteLevel`.

El entrenamiento se realizó en dos fases sobre 768.761 documentos y 1.416 MB de texto turco. En la primera, se analizaron con Zemberek las 1.000.000 de palabras más frecuentes del corpus y se fragmentaron en las fronteras raíz-sufijo comunes a todos los análisis; BPE se entrenó sobre esas piezas hasta alcanzar 24.000 tokens, garantizando que esos merges no cruzan una frontera morfológica. En la segunda fase se empleó el corpus completo sin segmentar y se completó el vocabulario hasta 32.000. El umbral de 24.000 se eligió entre 8.000, 16.000 y 24.000 mediante una regla predefinida y solo sobre el conjunto de desarrollo. El corpus de entrenamiento combina foros (29,5 %), web de FineWeb-2 y Cosmos (26,0 %), noticias (10,5 %), Wikipedia (10,5 %), académico (8,3 %), Ekşi Sözlük (5,3 %), literario/blog (5,3 %), legal (2,1 %), reseñas de cine (1,9 %) y reseñas de clientes (porcentaje no disponible en el extracto).

## Capacidades

- Tokenización lossless en NFC: el texto reconstruido a partir de los IDs es idéntico al original.
- Ausencia de `<unk>` en la práctica: el esquema byte-level garantiza cobertura de cualquier secuencia UTF-8.
- Segmentación morfológicamente informada en las primeras 24.000 unidades, respetando fronteras raíz-sufijo.
- Manejo específico del apóstrofo turco: `Ankara'da` → `Ankara` · `'da`; `1923'te` → `192` · `3` · `'te`.
- Preservación de mayúsculas y de las parejas `I`/`ı` e `İ`/`i` (sin lowercasing).
- Agrupación de dígitos en bloques de hasta 3 (`2026` → `202` · `6`).
- Conjunto de tokens especiales para ChatML (`<|im_start|>`, `<|im_end|>`), BOS/EOS, padding, máscara y 57 tokens reservados.
- Compatibilidad de IDs idénticos entre `transformers` (4.x/5.x) y Transformers.js.
- No añade BOS/EOS automáticamente: la decisión queda en manos del modelo que lo use.

## Casos de uso

- Preprocesado de corpus turcos para entrenar LLMs desde cero: el vocabulario de 32.000 con merges que respetan la morfología reduce la fragmentación de raíces y sufijos frente a tokenizers multilingües genéricos, lo que se traduce en menos tokens por palabra y secuencias más cortas para una misma ventana de contexto.
- Modelos de clasificación de texto turco (sentimiento, detección de discurso de odio, análisis legal): el corpus de entrenamiento incluye dominios específicos (reseñas de cine, Ekşi Sözlük, corpus legal `legal_nli_TR_V1`, OffensEval 2020 TR), por lo que la cobertura léxica en esos registros es adecuada.
- Búsqueda y recuperación de información (BM25 o embeddings) sobre documentación turca: la tokenización determinista y lossless permite construir índices invertidos estables y reproducibles entre entornos Python y JavaScript.
- Análisis morfológico asistido en pipelines de PLN: la segmentación en fronteras raíz-sufijo en las primeras 24.000 unidades facilita tareas posteriores de lematización o etiquetado morfológico, ya que el tokenizer no fusiona la raíz con el sufijo en los casos más frecuentes.
- Aplicaciones web en cliente con Transformers.js: al producir los mismos IDs en Python y JavaScript, permite mover el preprocesado a navegador sin discrepancias con el backend.
- Sistemas de chat o asistentes en turco que requieran formato ChatML: los tokens `<|im_start|>`/`<|im_end|>` permiten estructurar turnos de conversación sin tokens ad hoc.
- Normalización de corpus para evaluación de modelos: al no aplicar NFKC ni lowercasing, es útil cuando se necesita preservar la forma original del texto para reproducibilidad de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (el tokenizer se ejecuta en CPU; el `tokenizer.json` ocupa típicamente unos pocos MB).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en CPU: no hay requisito de memoria de vídeo.
- Opciones de despliegue: `transformers` (Python), `tokenizers` (Rust/Python), Transformers.js (JavaScript/Node/browser).
- Latencia y throughput: no disponibles de forma publicada; al ser un BPE byte-level con regex de pre-tokenización, la velocidad depende del backend (`tokenizers` en Rust es el más rápido y Transformers.js el más lento).

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Idiomas | Enfoque morfológico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `veripazari/nc-turkce-bpe-32k` | 32.000 | Turco | Sí (Zemberek, primeras 24.000 unidades) | Apache-2.0 | Hugging Face |
| Tokenizer de Llama 3 | 128.256 | Multilingüe | No específico para turco | Llama 3 Community License | Hugging Face / Meta |
| Tokenizer de Gemma | 256.000 | Multilingüe | No específico para turco | Gemma Terms of Use | Hugging Face / Google |
| Tokenizer de Mistral | 32.000 (v1) / 32.768 (v2/v3) | Multilingüe | No específico para turco | Apache-2.0 | Hugging Face |

La comparación con tokenizers multilingües de gran vocabulario no es directa: estos cubren decenas de idiomas y su rendimiento en turco depende de cuántas unidades se hayan asignado a ese idioma. El tokenizer de este fichero está especializado y su ventaja esperada es una menor fragmentación de raíces y sufijos turcos, aunque no se dispone de mediciones publicadas de tokens por palabra ni de comparativas cuantitativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco: no está diseñado ni validado para otros idiomas; su uso en corpus multilingües degradará la eficiencia de tokenización.
- No es un modelo de lenguaje: no genera texto, no razona y no realiza tool calling; debe combinarse con un transformer entrenado o ajustado con este vocabulario.
- No añade BOS/EOS automáticamente; un uso descuidado puede producir secuencias sin delimitadores de documento.
- El pre-tokenizador agrupa dígitos en bloques de hasta 3, lo que puede afectar a tareas sensibles a la representación numérica (por ejemplo, aritmética o extracción de fechas) si el modelo asociado no se entrena con esa convención.
- La normalización se limita a NFC y no aplica NFKC ni lowercasing; textos con formas Unicode no normalizadas pueden producir IDs distintos para grafías visualmente equivalentes.
- El tokenizer fue entrenado sobre un corpus con licencias heterogéneas (CC-BY-SA-4.0, ODC-By, CC-BY-4.0, Apache-2.0, CC0); aunque el artefacto se distribuye como Apache-2.0, el uso comercial del modelo derivado debe revisar las obligaciones de atribución y share-alike de los datasets subyacentes.
- El corpus de entrenamiento incluye foros y redes sociales (29,5 % de foros, 5,3 % de Ekşi Sözlük), lo que puede introducir sesgos de registro coloquial o de contenido generado por usuarios en la distribución de merges.
- El repositorio es un rearchivado de `nesicn/nc-turkce-bpe-32k`; la autoría original y el mantenimiento corresponden a `nesicn`, y la versión archivada es `v1.0`.
- No se han publicado métricas de compresión (tokens por palabra) ni comparativas con tokenizers alternativos en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/veripazari/nc-turkce-bpe-32k
- Repositorio original: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Plataforma VeriPazarı: https://veripazari.com.tr
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Cosmos Turkish Corpus v1.0: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Dataset ForumSohbetleri: https://huggingface.co/datasets/turkish-nlp-suite/ForumSohbetleri
- Dataset Havadis: https://huggingface.co/datasets/turkish-nlp-suite/Havadis
- Dataset temiz-Wiki: https://huggingface.co/datasets/turkish-nlp-suite/temiz-Wiki
- Dataset AkademikDerlem: https://huggingface.co/datasets/turkish-nlp-suite/AkademikDerlem
- Dataset OzenliDerlem: https://huggingface.co/datasets/turkish-nlp-suite/OzenliDerlem
- Dataset MusteriYorumlari: https://huggingface.co/datasets/turkish-nlp-suite/MusteriYorumlari
- Dataset eksiSozlukScrapy: https://huggingface.co/datasets/ozertuu/eksiSozlukScrapy
- Dataset OffensEval 2020 TR: https://huggingface.co/datasets/stefan-it/offenseval2020_tr
- Dataset legal_nli_TR_V1: https://huggingface.co/datasets/Turkish-NLI/legal_nli_TR_V1
- Dataset de reseñas de cine (Kaggle): https://www.kaggle.com/datasets/mustfkeskin/turkish-movie-sentiment-analysis-dataset
