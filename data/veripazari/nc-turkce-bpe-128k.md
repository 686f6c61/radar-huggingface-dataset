# veripazari/nc-turkce-bpe-128k

## Resumen

NC-128k es un tokenizador byte-level BPE de 128.000 tokens entrenado desde cero especificamente para turco. Lo desarrollo originalmente el autor nesicn y lo ha archivado VeriPazari (bajo el identificador veripazari/nc-turkce-bpe-128k) conservando la documentacion original. No es un modelo de lenguaje, sino el componente de tokenizacion que se acopla a un transformer para procesar texto turco, un idioma con morfologia aglutinante muy productiva donde los tokenizadores multilingues genericos fragmentan en exceso las palabras.

Su innovacion principal es un entrenamiento en dos fases: los primeros 80.000 tokens se aprenden sobre palabras pre-segmentadas en fronteras morfema-raiz mediante Zemberek, de modo que esas fusiones nunca cruzan un limite raiz-sufijo; el resto del vocabulario se completa con BPE estandar sobre el corpus completo. El resultado es un tokenizador sin perdida (NFC), sin `<unk>`, con pre-tokenizacion consciente del apostrofo turco (`Ankara'da` se divide como `Ankara` + `'da`).

Forma parte de una familia con las mismas receta y datos que NC-32k y NC-64k, y resulta relevante para quien entrene o adapte modelos en turco y quiera reducir la longitud de secuencia, mejorar la coherencia morfologica y bajar el coste de inferencia frente a tokenizadores multilingues de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (libreria `tokenizers` 0.23.3) |
| Parametros totales | No aplica (no es un modelo neuronal; vocabulario de 128.000 tokens) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo al que se acople) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (SHA-256 `9eda551623ff58899a28aed5c8535336c9fda985450dce60c2393dc51efecd23`), compatible con `transformers` y `@huggingface/transformers` |

## Arquitectura y entrenamiento

El tokenizador emplea byte-level BPE con `min_frequency=2` y un vocabulario de 128.000 unidades compuesto por 64 tokens especiales, 256 bytes base y 127.680 fusiones. El normalizador aplica unicamente NFC: no hay conversion a minusculas (se preservan `I`/`ı` e `İ`/`i`) ni NFKC, que seria lossy. La pre-tokenizacion usa una expresion regular `Split` combinada con `ByteLevel(add_prefix_space=False, use_regex=False)` que trata de forma especifica el apostrofo turco, agrupa digitos en bloques de como maximo tres (`2026` → `202` + `6`) y adhiere espacios y saltos de linea a numeros y puntuacion segun reglas definidas.

El entrenamiento se hizo en dos fases sobre 768.761 documentos (1.416 MB de texto turco crudo). Primero se analizaron con Zemberek las 1.000.000 palabras mas frecuentes del corpus y se partieron en las fronteras morfema-raiz comunes a todos los analisis; BPE se entreno sobre esos fragmentos hasta los 80.000 tokens, garantizando que esas fusiones no cruzan un limite raiz-sufijo. Despues se uso el corpus completo sin pre-segmentar para completar el vocabulario hasta 128.000. El umbral de 80.000 se eligio entre 36.000, 64.000, 80.000 y 96.000 mediante una regla predefinida y solo sobre el conjunto de desarrollo. El resultado es una unica lista ordenada de fusiones en `tokenizer.json`, sin codigo personalizado.

La composicion del corpus de entrenamiento incluye foros (29,5 %), web de fineweb-2 tur_Latn (15,6 %), noticias (10,5 %), Wikipedia (10,5 %), el corpus Cosmos-Turkish (10,4 %) y texto academico, entre otras fuentes. El tokenizador no anade BOS/EOS automaticamente: es el modelo consumidor quien debe hacerlo.

## Capacidades

- Segmentacion morfologica del turco con prioridad raiz-sufijo en los primeros 80.000 tokens del vocabulario.
- Codificacion sin perdida (NFC): el texto reconstruido es identico al original.
- Ausencia de `<unk>` en la practica: cualquier byte de entrada es representable.
- Pre-tokenizacion consciente del apostrofo turco, con separacion de sufijos tras apostrofo (`Ankara'da` → `Ankara` + `'da`).
- Manejo de digitos en grupos de hasta tres cifras y de espacios/saltos de linea adheridos a numeros y puntuacion.
- Preservacion de mayusculas y de las parejas `I`/`ı` e `İ`/`i`.
- Tokens especiales para ChatML (`<|im_start|>`, `<|im_end|>`), BOS (`<|startoftext|>`), EOS (`<|endoftext|>`), padding, mask y 57 reservados.
- Compatible con `AutoTokenizer` de `transformers` y con `@huggingface/transformers` en JavaScript.
- No incluye capacidades de generacion, razonamiento, codigo, vision ni tool calling: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de modelos de lenguaje en turco desde cero: usar NC-128k como tokenizador base reduce la longitud media de secuencia frente a tokenizadores multilingues y, con ello, el coste computacional de preentrenamiento y el consumo de contexto.
- Adaptacion de modelos multilingues al turco: sustituir el tokenizador original por NC-128k y reajustar los embeddings de entrada/salida permite aprovechar la segmentacion morfologica en tareas downstream en turco.
- Analisis morfologico y etiquetado: la separacion en fronteras raiz-sufijo de los primeros 80.000 tokens facilita tareas de morfologia, lematizacion o analisis gramatical sobre las secuencias tokenizadas.
- Procesamiento de texto de dominio legal o administrativo: el corpus incluye fuentes academicas y legales, y la preservacion de mayusculas y de la puntuacion turca ayuda en documentos formales con abundantes sufijos y cifras.
- Busqueda y recuperacion de informacion en turco: la tokenizacion consistente de raices y sufijos mejora la coincidencia en indices invertidos y en sistemas de recuperacion lexica o hibrida.
- Normalizacion y preprocesado de pipelines NLP: al ser sin perdida y sin `<unk>`, sirve como capa de tokenizacion fiable en pipelines de clasificacion, NER o analisis de sentimiento en turco.
- Chat y asistentes conversacionales en turco: los tokens ChatML incluidos permiten formatear conversaciones multi-turno de forma nativa al integrarlo en un modelo de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente ejemplos cualitativos de segmentacion comparando NC-128k, NC-64k y NC-32k (por ejemplo, `üniversitesinde` se mantiene como un solo token en NC-128k, mientras que en NC-64k y NC-32k se divide como `üniversite` + `sinde`).

## Requisitos de hardware

- VRAM para inferencia: no aplica al ser un tokenizador; su coste en memoria es de unos pocos MB (vocabulario de 128.000 entradas y fichero `tokenizer.json` de tamano reducido).
- GPU recomendadas: no aplica; la tokenizacion se ejecuta en CPU con latencia de microsegundos por documento.
- Cabe en cualquier GPU consumer y en CPU sin requisitos especiales.
- Opciones de despliegue: `transformers` (Python), `@huggingface/transformers` (JavaScript), y cualquier runtime que cargue `tokenizer.json` de la libreria `tokenizers` (Rust, Python, Node).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser byte-level BPE con regex de pre-tokenizacion, el rendimiento depende del backend `tokenizers` y del hardware.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Enfoque | Idiomas | Licencia |
|---|---|---|---|---|
| NC-128k (este) | 128.000 | Byte-level BPE con pre-segmentacion morfologica (Zemberek) en los primeros 80.000 tokens | Turco | Apache 2.0 |
| NC-64k (nesicn) | 64.000 | Misma receta y datos, menor vocabulario | Turco | Apache 2.0 (segun familia) |
| NC-32k (nesicn) | 32.000 | Misma receta y datos, menor vocabulario | Turco | Apache 2.0 (segun familia) |

No se dispone de datos comparativos de rendimiento (compression ratio, fertilitad, benchmarks downstream) frente a tokenizadores multilingues genericos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo: no genera texto ni resuelve tareas por si mismo; hay que acoplarlo a un transformer y, si se cambia el tokenizador de un modelo ya entrenado, reajustar los embeddings.
- Solo cubre turco; no esta pensado para otros idiomas y su comportamiento fuera del turco no esta documentado.
- No anade BOS/EOS automaticamente; un uso descuidado puede producir secuencias sin delimitadores de documento.
- El sesgo del tokenizador refleja la composicion del corpus (29,5 % foros, 15,6 % web, 10,5 % noticias, etc.), lo que puede favorecer ciertos registros frente a otros (por ejemplo, turco oral informal o dominios muy especializados).
- La segmentacion morfologica se aprendio sobre las 1.000.000 palabras mas frecuentes; palabras raras o neologismos pueden no beneficiarse de la prioridad raiz-sufijo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento subyacentes (CC-BY-SA-4.0, ODC-By, CC-BY-4.0) si se redistribuye el tokenizador junto con datos derivados.
- El repositorio es un archivo de la version original de nesicn; para incidencias o actualizaciones conviene consultar la fuente original.

## Enlaces

- Hugging Face (archivo VeriPazari): https://huggingface.co/veripazari/nc-turkce-bpe-128k
- Fuente original: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- NC-32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- NC-64k: https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Plataforma VeriPazari: https://veripazari.com.tr
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Cosmos-Turkish-Corpus-v1.0: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Dataset ForumSohbetleri: https://huggingface.co/datasets/turkish-nlp-suite/ForumSohbetleri
- Dataset Havadis: https://huggingface.co/datasets/turkish-nlp-suite/Havadis
- Dataset temiz-Wiki: https://huggingface.co/datasets/turkish-nlp-suite/temiz-Wiki
- Dataset AkademikDerlem: https://huggingface.co/datasets/turkish-nlp-suite/AkademikDerlem
- Dataset OzenliDerlem: https://huggingface.co/datasets/turkish-nlp-suite/OzenliDerlem
- Dataset MusteriYorumlari: https://huggingface.co/datasets/turkish-nlp-suite/MusteriYorumlari
- Dataset eksiSozlukScrapy: https://huggingface.co/datasets/ozertuu/eksiSozlukScrapy
- Dataset offenseval2020_tr: https://huggingface.co/datasets/stefan-it/offenseval2020_tr
- Dataset legal_nli_TR_V1: https://huggingface.co/datasets/Turkish-NLI/legal_nli_TR_V1
