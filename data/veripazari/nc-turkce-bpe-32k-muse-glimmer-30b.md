# veripazari/nc-turkce-bpe-32k-muse-glimmer-30b

## Resumen

`veripazari/nc-turkce-bpe-32k-muse-glimmer-30b` no es un modelo de lenguaje, sino un **tokenizer** derivado del de Muse-Glimmer-30B al que se le ha injertado el vocabulario turco de NC-32k, un BPE byte-level entrenado desde cero sobre corpus turco. El objetivo es reducir el coste en tokens del turco (un idioma aglutinante con morfología muy productiva) sin reentrenar el vocabulario completo del modelo base: se mantiene el tamano del vocabulario (202.048 entradas) y los IDs de los tokens especiales, sustituyendo los 20.869 tokens de mayor ID de Muse-Glimmer-30B por otros tantos tokens turcos de NC-32k.

El resultado medido por el autor es una reduccion del 21,7 % en tokens sobre texto turco (de 275,4 a 214,5 tokens por 1.000 caracteres) y una mejora sustancial en la segmentacion morfologica (F1 de 36,20 a 57,93 sobre `turkish-morph-analysis`), con un coste minimo en ingles (+1,8 % de tokens) y codigo (+0,7 %). La tokenizacion es sin perdidas: `decode(encode(x)) == x` en todos los textos de prueba y no se genera `<unk>`.

Es relevante para quien quiera adaptar un modelo ya entrenado al turco con un presupuesto de computo limitado: la extension de vocabulario es un paso previo mucho mas barato que el reentrenamiento completo, y el autor publica el mapeo `merged-to-original-token-ids.json` para inicializar los embeddings de los tokens nuevos. Advertencia importante: el tokenizer **no es usable directamente con los pesos originales** de Muse-Glimmer-30B, porque los IDs reasignados apuntan a embeddings de tokens que ya no existen en el vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE byte-level (no es un modelo de lenguaje; artefacto `transformers` de tipo tokenizer) |
| Parametros totales | no disponible (no aplica: es un tokenizer) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (heredada del modelo base Muse-Glimmer-30B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (formato `transformers`; no hay pesos en safetensors ni GGUF) |
| Tamano de vocabulario | 202.048 tokens (identico al de Muse-Glimmer-30B) |
| Tokens turcos anadidos | 20.869 (procedentes de NC-32k) |
| Tokens eliminados | 20.869 de mayor ID de Muse-Glimmer-30B |
| Normalizador / pre-tokenizer / decoder | Identicos a los de Muse-Glimmer-30B |
| Chat template | Identica a la de Muse-Glimmer-30B |
| Version de `transformers` probada | 5.22.2 |

## Arquitectura y entrenamiento

El artefacto es un vocabulario BPE byte-level construido por fusion controlada. El procedimiento documentado por el autor: (1) se convierte el `tokenizer.json` de NC-32k al formato textual que espera la herramienta de merge (token byte-level a texto, espacio a `▁`, byte suelto a `<0xXX>`), descartando 43 tokens de NC que son fragmentos UTF-8 incompletos; (2) se aplica `bpe-tokenizer-editor` 0.2.0 con `BPETokenizerEditor(target).merge_from(nc, max_vocab_size=202048)`, de forma que las reglas de merge de NC se anteponen a las del tokenizer base y el limite de vocabulario es el tamano del tokenizer destino.

Las reglas de retencion excluyen tokens de un solo caracter, tokens con forma `<…>` o `[…]`, tokens especiales del vocabulario, tokens ya presentes en el destino y fragmentos UTF-8 parciales de los caracteres base de NC (puentes). El resto se rellena por orden de ID y se descartan los de mayor ID del tokenizer original. El pre-tokenizer, el normalizer, el decoder y la plantilla de chat se heredan sin cambios de Muse-Glimmer-30B.

No hay entrenamiento de modelo implicado: es un artefacto de tokenizacion. El autor advierte explicitamente de que los embeddings de los tokens nuevos no estan entrenados y de que, antes de usar el tokenizer con pesos, hay que inicializar y entrenar esas filas de embedding; el fichero `merged-to-original-token-ids.json` mapea cada ID nuevo a los IDs de los fragmentos originales correspondientes para facilitar esa inicializacion.

## Capacidades

- Tokenizacion BPE byte-level de texto turco e ingles con vocabulario de 202.048 entradas.
- Reduccion de la longitud en tokens del turco: -21,7 % (275,4 a 214,5 tokens por 1.000 caracteres).
- Mejora de la segmentacion morfologica del turco: F1 de 36,20 a 57,93 sobre el corpus `cekimli`.
- Tokenizacion sin perdidas: `decode(encode(x)) == x` en todos los textos de prueba, sin producir `<unk>`.
- Preservacion del comportamiento en ingles (96,2 % de los pre-tokens ingleses se segmentan igual que en el original; +1,8 % de tokens) y en codigo (+0,7 % de tokens).
- Compatibilidad con la API de `transformers` (`AutoTokenizer`) y con la plantilla de chat del modelo base.
- No incluye capacidades de generacion, razonamiento, vision, tool calling ni agentes: es exclusivamente un artefacto de tokenizacion.

## Casos de uso

- **Adaptacion de Muse-Glimmer-30B al turco con presupuesto limitado**: se sustituye el tokenizer original por este, se inicializan las 20.869 filas de embedding nuevas usando `merged-to-original-token-ids.json` (media de los embeddings de los fragmentos originales) y se hace un fine-tuning de adaptacion. El ahorro del 21,7 % en tokens turcos reduce directamente el coste de entrenamiento y de inferencia.
- **Reduccion de coste de inferencia en produccion para texto turco**: al necesitar menos tokens para el mismo texto, se reduce el numero de pasos de decodificacion y el consumo de KV cache en un servicio de generacion en turco, con el mismo modelo y la misma GPU.
- **Aprovechamiento efectivo de la ventana de contexto en turco**: al comprimir el texto turco un 21,7 %, cabe mas contenido real en la misma longitud de contexto del modelo base, util en resumen de documentos largos o en RAG sobre corpus turcos.
- **Preprocesamiento para pipelines de NLP turco**: la mejor segmentacion morfologica (F1 57,93 frente a 36,20) beneficia a tareas posteriores como etiquetado morfologico, analisis de dependencias o clasificacion, donde la unidad subword afecta a las caracteristicas.
- **Investigacion sobre extension de vocabulario multilingue**: sirve como caso reproducible de merge de vocabularios con `bpe-tokenizer-editor`, con metodologia y metricas publicadas (fertility, tokens por 1.000 caracteres, F1 morfologico) para comparar estrategias.
- **Evaluacion de la degradacion cruzada en ingles y codigo**: util para medir cuanto se resiente un modelo multilingue al desplazar tokens de mayor ID del vocabulario original, con cifras de referencia (+1,8 % en ingles, +0,7 % en codigo, 96,2 % de coincidencia de pre-tokens).
- **Archivo y documentacion en turco**: la ficha esta traducida y archivada por VeriPazari a partir del trabajo original de `nesicn`, lo que facilita su uso por parte de la comunidad turca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K) en la informacion disponible: el artefacto es un tokenizer y no un modelo evaluable en esas tareas. Si se publican metricas propias de tokenizacion:

| Tokenizer | Vocabulario | TR tok/1.000 (menor es mejor) | TR fertility (menor es mejor) | F1 morfologia (mayor es mejor) | EN tok/1.000 | Codigo tok/1.000 | EN segmentado como el original |
|---|---:|---:|---:|---:|---:|---:|---:|
| Muse-Glimmer-30B (original) | 202.048 | 275,4 | 2,131 | 36,20 | 224,3 | 293,3 | 100 % |
| **Este tokenizer** | 202.048 | 214,5 | 1,659 | 57,93 | 228,2 | 295,2 | 96,2 % |
| NC-32k | 32.000 | 216,4 | 1,674 | 57,75 | 336,3 | 410,0 | no disponible |
| Arcus (Magibu) | 245.353 | 204,7 | 1,583 | 46,08 | 225,1 | 293,8 | 97,6 % |

Metodologia declarada: corpus turco de 2.128 documentos y 2,37 M de caracteres, con cuatro dominios de igual peso (Resmii Gazete, Wikipedia, prensa, Eksi Sozluk), todos de 2026. Ingles sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`, test, commit `b08601e0`). Codigo sobre `openai/openai_humaneval` (test, prompt + `canonical_solution`, commit `7dce6050`). Morfologia sobre `turkish-nlp-suite/turkish-morph-analysis`, split `cekimli` (163.112 palabras, commit `ebfe5f56`), codificando la palabra con espacio inicial y sin contar el limite final como frontera.

## Requisitos de hardware

- No aplica en sentido estricto: el artefacto es un tokenizer de unos pocos megabytes (el repositorio figura con 0,0 GB), sin pesos de modelo que cargar en GPU.
- Para usar el tokenizer: CPU suficiente; el coste es de milisegundos por documento. No requiere VRAM.
- Para usar el tokenizer junto con Muse-Glimmer-30B en inferencia, los requisitos de VRAM son los del modelo base (30B), no disponibles en la informacion proporcionada.
- Opciones de despliegue del tokenizer: `transformers` (`AutoTokenizer.from_pretrained`), version 5.22.2 probada por el autor; tambien es compatible con cualquier runtime que consuma `tokenizer.json` (por ejemplo, servidores de inferencia que acepten tokenizers de Hugging Face), aunque no se documenta compatibilidad explicita con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | TR tok/1.000 | TR fertility | F1 morfologia | EN tok/1.000 | Codigo tok/1.000 | Licencia |
|---|---:|---:|---:|---:|---:|---:|---|
| **nc-turkce-bpe-32k-muse-glimmer-30b** | 202.048 | 214,5 | 1,659 | 57,93 | 228,2 | 295,2 | Apache 2.0 |
| Muse-Glimmer-30B (original) | 202.048 | 275,4 | 2,131 | 36,20 | 224,3 | 293,3 | no disponible en la informacion |
| NC-32k | 32.000 | 216,4 | 1,674 | 57,75 | 336,3 | 410,0 | no disponible en la informacion |
| Arcus (Magibu) | 245.353 | 204,7 | 1,583 | 46,08 | 225,1 | 293,8 | no disponible en la informacion |

Lectura de la tabla: frente a NC-32k, este tokenizer iguala la compresion en turco (214,5 frente a 216,4) y la F1 morfologica (57,93 frente a 57,75), pero conserva un rendimiento en ingles y codigo muy superior (228,2 y 295,2 frente a 336,3 y 410,0), al mantener el vocabulario base de Muse-Glimmer-30B. Frente a Arcus, la compresion en turco es ligeramente peor (214,5 frente a 204,7) pero la F1 morfologica es claramente mejor (57,93 frente a 46,08) y el vocabulario es mas pequeno (202.048 frente a 245.353).

## Limitaciones y advertencias

- **No usable directamente con los pesos de Muse-Glimmer-30B**: los 20.869 tokens nuevos ocupan los IDs de los tokens eliminados, cuyos embeddings en el modelo original corresponden a otros tokens. Sin inicializar y entrenar esas filas de embedding, el modelo no funcionara correctamente con este tokenizer.
- **No es un modelo**: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de rendimiento en tareas debe evaluarse sobre el modelo base tras la adaptacion.
- **Degradacion en ingles y codigo**: +1,8 % de tokens en ingles y +0,7 % en codigo; el 3,8 % de los pre-tokens ingleses ya no se segmentan como en el original.
- **Perdida de 43 tokens de NC-32k**: fragmentos UTF-8 incompletos que no pudieron convertirse al formato textual de la herramienta de merge y quedaron fuera.
- **Dependencia de la herramienta**: el resultado depende de `bpe-tokenizer-editor` 0.2.0 y de la version de `transformers` (5.22.2 probada); no se documenta compatibilidad con versiones anteriores.
- **Sesgos del corpus de evaluacion**: el turco se mide sobre cuatro dominios de 2026 (Resmii Gazete, Wikipedia, prensa y Eksi Sozluk) con igual peso; el rendimiento en otros registros (tecnico, coloquial, historico) no esta medido.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar la licencia del modelo base Muse-Glimmer-30B, no disponible en la informacion proporcionada, antes de desplegar en produccion.
- **Procedencia**: es una copia archivada por VeriPazari del trabajo original de `nesicn`; el repositorio figura con 0 descargas y 0 likes, y el autor original es la referencia canonica.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/veripazari/nc-turkce-bpe-32k-muse-glimmer-30b
- Repositorio original de `nesicn`: https://huggingface.co/nesicn/nc-turkce-bpe-32k-muse-glimmer-30b
- Tokenizer NC-32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Tokenizer Arcus (Magibu): https://huggingface.co/magibu/Arcus
- Herramienta `bpe-tokenizer-editor`: https://github.com/malibayram/bpe-tokenizer-editor
- Plataforma VeriPazari: https://veripazari.com.tr
- Dataset de evaluacion en ingles: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset de evaluacion en codigo: https://huggingface.co/datasets/openai/openai_humaneval
- Dataset de morfologia turca: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
