# toklens/fineweb_edu_12gb_tokenizer_no_pretok

## Resumen

Este repositorio contiene un tokenizador Byte-Level BPE de 32.000 tokens, entrenado por el usuario `toklens` sobre el subconjunto `fw_edu` del dataset FineWeb-2-HQ. FineWeb-Edu es una colección de páginas web de calidad educativa filtrada a partir de FineWeb, que a su vez proviene de CommonCrawl. El tokenizador está diseñado para servir como componente de preprocesamiento en el entrenamiento de modelos de lenguaje, ofreciendo una segmentación a nivel de byte que permite manejar cualquier texto Unicode sin pérdida de información.

A diferencia de un modelo de lenguaje completo, este artefacto solo realiza la conversión entre texto y secuencias de identificadores de tokens. Su relevancia radica en que un tokenizador bien entrenado sobre datos de alta calidad puede mejorar la eficiencia y el rendimiento de los modelos posteriores. Al estar basado en FineWeb-Edu, está optimizado para contenido educativo en inglés, aunque al operar a nivel de byte puede procesar cualquier idioma.

La licencia MIT permite su uso comercial y modificación sin restricciones, lo que lo convierte en una opción práctica para proyectos que necesiten un tokenizador ligero y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE (subword tokenization) |
| Parametros totales | Vocabulario de 32.000 tokens (no es un modelo con pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (el tokenizador no tiene límite de contexto; la secuencia de tokens depende del modelo que lo use) |
| Tipos de cuantizacion | No aplica (no es un modelo de inferencia) |
| Idiomas soportados | `fw_` (código interno para FineWeb-Edu, principalmente inglés educativo; al ser byte-level, puede tokenizar cualquier idioma) |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json`, `vocab.json`, `merges.txt` (formato HuggingFace) |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo Byte-Level BPE (Byte Pair Encoding a nivel de byte), que opera sobre la representación UTF-8 de los textos. Esto garantiza que cualquier secuencia de bytes pueda ser tokenizada sin tokens desconocidos, a costa de una ligera expansión en la longitud de las secuencias para caracteres no ASCII. El pre-tokenizador configurado es `byte_level`, con manejo de números aprendido (no se separan dígitos de forma fija) y sin manejo de contracciones. El normalizador aplica NFC (Normalización de Forma Canónica) para unificar caracteres equivalentes.

El entrenamiento se realizó sobre dos fragmentos (`shards`) del dataset FineWeb-Edu, concretamente `fineweb_edu_10bt.chunk.00.jsonl` y `fineweb_edu_10bt.chunk.01.jsonl`, con un tamaño de vocabulario objetivo de 32.000 tokens. No se especifica el número total de tokens de entrenamiento ni el proceso de filtrado adicional. El tokenizador incluye cuatro tokens especiales: `<s>`, `</s>`, `<pad>` y `<unk>`, aunque al ser byte-level el token `<unk>` rara vez se necesitará.

## Capacidades

- Tokenización de texto a nivel de byte, capaz de procesar cualquier texto Unicode sin tokens desconocidos.
- Manejo de números aprendido: los dígitos se segmentan según las reglas BPE aprendidas, lo que puede mejorar la eficiencia en textos con números.
- Normalización NFC integrada para unificar caracteres.
- Incluye tokens especiales para marcado de secuencia (`<s>`, `</s>`) y padding (`<pad>`), listos para usar en frameworks de entrenamiento.
- Compatible con la API `AutoTokenizer` de HuggingFace Transformers, lo que facilita su integración en pipelines existentes.
- Al ser un tokenizador independiente, puede combinarse con cualquier modelo que espere un vocabulario de 32K tokens.

## Casos de uso

- Entrenamiento de modelos de lenguaje desde cero: el tokenizador sirve como preprocesador para convertir corpus de texto en secuencias de IDs, especialmente adecuado para dominios educativos o científicos donde FineWeb-Edu tiene buena cobertura.
- Fine-tuning de modelos base: si se desea adaptar un modelo existente a un dominio específico, este tokenizador puede utilizarse para re-tokenizar el corpus de entrenamiento y alinear el vocabulario.
- Evaluación de calidad de tokenización: se puede comparar la compresión de texto (tokens por palabra) frente a otros tokenizadores para decidir cuál usar en un proyecto.
- Sistemas de generación de texto en entornos con restricciones de memoria: al ser un tokenizador ligero (sin pesos de red), puede ejecutarse en CPU y en dispositivos embebidos.
- Investigación en subword tokenization: sirve como punto de partida para estudiar el impacto del tamaño del vocabulario o del algoritmo BPE en el rendimiento de modelos posteriores.
- Preprocesamiento en pipelines de NLP: cualquier tarea que requiera convertir texto a tokens (clasificación, extracción de entidades, etc.) puede usar este tokenizador como paso inicial, aprovechando su licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un tokenizador, las métricas típicas (MMLU, HumanEval, GSM8K) no son aplicables. Se podría evaluar la tasa de compresión (tokens por palabra) o la cobertura del vocabulario, pero el autor no ha proporcionado estos datos.

## Requisitos de hardware

- No requiere GPU para su uso; es un tokenizador que se ejecuta en CPU.
- El tamaño en memoria es reducido: el vocabulario de 32K tokens y las reglas de fusión ocupan unos pocos megabytes.
- Puede ejecutarse en cualquier entorno con Python y la biblioteca `transformers` instalada.
- Para entrenamiento de modelos que lo utilicen, los requisitos de hardware dependerán del modelo en sí, no del tokenizador.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros tokenizadores (como el de GPT-2, Llama o Mistral). Cualitativamente, este tokenizador comparte la filosofía byte-level de GPT-2, pero está entrenado sobre un corpus educativo filtrado, lo que podría dar lugar a una segmentación más eficiente para textos académicos. Sin embargo, sin datos de compresión o cobertura, no se puede afirmar una ventaja objetiva.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo de lenguaje: no genera texto ni tiene capacidades de razonamiento.
- El idioma declarado `fw_` es un código interno que probablemente corresponde a inglés, por lo que la eficiencia de tokenización en otros idiomas puede ser menor, aunque la naturaleza byte-level garantiza que no habrá tokens desconocidos.
- El entrenamiento se realizó sobre una muestra limitada (2 shards de FineWeb-Edu), por lo que el vocabulario puede no cubrir bien jerga técnica muy especializada o neologismos.
- No se ha documentado el proceso de filtrado de calidad de los datos de entrenamiento más allá del propio FineWeb-Edu.
- La licencia MIT permite uso comercial, pero el dataset subyacente (FineWeb-Edu) tiene sus propias condiciones; conviene revisarlas antes de usarlo en productos comerciales.
- Para producción, es recomendable validar la calidad de tokenización en el dominio específico de la aplicación, ya que no hay métricas publicadas.

## Enlaces

- Repositorio del tokenizador: https://huggingface.co/toklens/fineweb_edu_12gb_tokenizer_no_pretok
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Blog de FineWeb (descripción del dataset): https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1
- Paper de FineWeb (arXiv): https://arxiv.org/html/2406.17557v1
- Artículo sobre tokenización de FineWeb-Edu (referencia externa): https://timothyckl.com/posts/tokenising-fineweb-edu/
