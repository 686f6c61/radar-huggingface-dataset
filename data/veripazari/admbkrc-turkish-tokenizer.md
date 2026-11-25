# veripazari/admbkrc-turkish-tokenizer

## Resumen

`admbkrc-turkish-tokenizer` es un tokenizador Byte-Pair Encoding (BPE) entrenado especificamente para el idioma turco. Lo desarrollo originalmente el usuario abakirci y la plataforma VeriPazari lo ha rearchivado en Hugging Face conservando la documentacion, la licencia y los metadatos originales. No es un modelo de lenguaje generativo, sino el componente de tokenizacion que se situa en la entrada de cualquier pipeline de PLN en turco: convierte texto en secuencias de IDs antes de alimentar un transformer.

Su relevancia practica esta en el tratamiento del turco, una lengua aglutinante con morfologia compleja y caracteres propios (ğ, ü, ş, ı, ö, ç). Un tokenizador generico multilingue fragmenta estas palabras en muchos subtokens, lo que penaliza la longitud efectiva del contexto y la calidad del modelado. Este tokenizador, con un vocabulario de 50.000 unidades y `min_frequency = 2`, esta disenado para reducir esa fragmentacion en corpus turcos.

El artefacto se publica bajo licencia Apache 2.0 y libreria `transformers`, con 0 descargas y 0 likes en el momento de la consulta. La model card no documenta ningun modelo asociado, resultados de evaluacion ni detalles del corpus de entrenamiento mas alla de la referencia al dataset `umarigan/tinystories_tr`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (Byte-Pair Encoding), no es un modelo neuronal |
| Parametros totales | no disponible (no aplica a un tokenizador) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que consuma el tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros de tokenizador de `transformers` (vocabulario y merges; formato exacto no detallado en la model card) |

Datos adicionales declarados por el autor: tamano de vocabulario de 50.000, `min_frequency = 2`, tokens especiales `[EOS]`, `[SEP]`, `[UNK]`, `[MASK]` y `[PAD]`, y manejo especifico de los caracteres turcos ğ, ü, ş, ı, ö, ç.

## Arquitectura y entrenamiento

Se trata de un tokenizador BPE, es decir, un algoritmo de compresion de secuencias que construye el vocabulario fusionando iterativamente los pares de simbolos mas frecuentes hasta alcanzar el tamano objetivo (50.000 en este caso) o hasta que ningun par supera la frecuencia minima (`min_frequency = 2`). No hay capas, atencion ni pesos entrenados por descenso de gradiente: el "entrenamiento" consiste en contar y fusionar pares sobre un corpus de texto.

La model card indica que se entreno sobre "un corpus diverso de texto turco", pero no especifica el numero de tokens, la composicion del dataset ni la procedencia de los textos. El unico dataset referenciado en los metadatos es `umarigan/tinystories_tr`, sin aclarar si constituyo el corpus de entrenamiento o es solo una referencia de uso. No se documenta ningun proceso de normalizacion, pre-tokenizacion ni evaluacion de la tasa de fertilidad (tokens por palabra) sobre turco.

## Capacidades

- Segmentacion de texto turco en subtokens BPE con vocabulario de 50.000 unidades.
- Manejo explicito de los caracteres turcos ğ, ü, ş, ı, ö, ç, lo que evita la fragmentacion por bytes que sufren los tokenizadores no adaptados.
- Tokens especiales integrados: `[EOS]`, `[SEP]`, `[UNK]`, `[MASK]`, `[PAD]`.
- Compatibilidad con la API `AutoTokenizer` de `transformers` y, por tanto, integracion directa en pipelines de entrenamiento e inferencia.
- Capacidad de servir como base para preentrenamiento de modelos de lenguaje en turco.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un componente de tokenizacion.
- No se documenta soporte multilingue mas alla del turco.

## Casos de uso

- Preentrenamiento de modelos de lenguaje en turco: el tokenizador fija el vocabulario del modelo; con 50.000 unidades y `min_frequency = 2` se busca un equilibrio entre cobertura morfologica y tamano de la matriz de embeddings, adecuado para modelos pequenos y medianos en turco.
- Ajuste fino de modelos turcos existentes: se puede reemplazar el tokenizador de un modelo multilingue por este para reducir la longitud de las secuencias en corpus turcos, aunque requiere reajustar los embeddings de entrada y salida.
- Analisis de sentimiento y clasificacion de textos turcos: la menor fragmentacion de palabras aglutinantes permite que clasificadores con ventanas cortas cubran mas texto real por secuencia.
- Construccion de pipelines de PLN para medios o redes sociales en turco: tokenizacion consistente de textos con caracteres diacriticos antes de tareas de etiquetado, NER o topic modeling.
- Investigacion sobre fertilidad de tokenizadores: sirve como referencia para comparar tasas de tokens por palabra frente a tokenizadores multilingues (mBERT, XLM-R) en corpus turcos.
- Generacion de datasets tokenizados para experimentos: al estar en formato `transformers`, se integra en scripts de preprocesado y en `datasets` para producir corpus listos para entrenamiento.
- Prototipado de modelos tipo TinyStories en turco: el dataset referenciado (`umarigan/tinystories_tr`) sugiere su uso en experimentos de modelado de lenguaje a pequena escala con cuentos infantiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de fertilidad, comparativas de vocabulario ni evaluaciones de ningun tipo.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU: la tokenizacion se ejecuta en CPU con coste despreciable (del orden de microsegundos por frase en un nucleo moderno).
- No necesita VRAM; el vocabulario de 50.000 entradas ocupa unos pocos megabytes en memoria.
- Se puede ejecutar en cualquier maquina, incluidos contenedores ligeros y entornos sin acelerador.
- Despliegue mediante la libreria `transformers` (`AutoTokenizer.from_pretrained`); tambien es exportable a los formatos de tokenizador de `tokenizers` (Rust) para pipelines de alto rendimiento.
- No aplican consideraciones de latencia o throughput de inferencia neuronal; el cuello de botella estara en el modelo que consuma las secuencias.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| admbkrc-turkish-tokenizer | BPE | 50.000 | turco | Apache 2.0 | Hugging Face (0 descargas) |
| Tokenizador de BERT multilingual (mBERT) | WordPiece | ~119.000 | 104 idiomas | Apache 2.0 | Ampliamente disponible |
| Tokenizador de XLM-R | SentencePiece | 250.000 | 100 idiomas | MIT | Ampliamente disponible |
| Tokenizadores de modelos turcos especificos (p. ej. BERTurk, Turkish-GPT2) | BPE/WordPiece | variable | turco | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (fertilidad, cobertura OOV) para este tokenizador en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni resuelve tareas de PLN por si mismo; solo tokeniza.
- El corpus de entrenamiento no esta documentado (tamano, fuentes, fecha de recoleccion), lo que impide evaluar sesgos o cobertura dialectal.
- El vocabulario de 50.000 es relativamente pequeno para turco; puede aumentar la fragmentacion en vocabulario tecnico, nombres propios y neologismos frente a tokenizadores de mayor tamano.
- Solo cubre turco; no es adecuado para textos multilingues o con mezcla de idiomas.
- No se han publicado evaluaciones de fertilidad ni comparativas con tokenizadores establecidos, por lo que su ventaja frente a alternativas no esta cuantificada.
- Es un rearchivado de un artefacto de terceros (abakirci); el mantenimiento y las actualizaciones dependen del repositorio original.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero conviene verificar que el rearchivado conserva correctamente los avisos de copyright originales.
- Sin descargas ni likes registrados: no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Hugging Face (rearchivado): https://huggingface.co/veripazari/admbkrc-turkish-tokenizer
- Repositorio original: https://huggingface.co/abakirci/admbkrc-turkish-tokenizer
- Plataforma VeriPazari: https://veripazari.com.tr
- Dataset referenciado: https://huggingface.co/datasets/umarigan/tinystories_tr
