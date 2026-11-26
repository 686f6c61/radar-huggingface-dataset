# veripazari/cevher-tokenizer

## Resumen

Cevher Tokenizer es un tokenizer de tipo byte-level BPE disenado especificamente para modelos de lenguaje en turco, con soporte secundario para ingles y textos tecnicos (codigo, matematicas, logs, JSON, URLs, avisos de seguridad y ficheros de configuracion). Lo desarrolla originalmente batuhanozkose y esta archivado y documentado en turco por la plataforma VeriPazari, con el objetivo de contribuir al ecosistema de IA en turco. No es un modelo de lenguaje: es unicamente el componente de tokenizacion, por lo que no genera texto ni tiene pesos neuronales.

La version publica es el checkpoint "Cevher 64k", con un vocabulario de 64.000 tokens optimizado bajo una proporcion practica 60/40 (prioridad a cobertura del turco, manteniendo utilidad en ingles y texto tecnico). Garantiza roundtrip completo en UTF-8 y cero tokens UNK en los conjuntos de evaluacion. Existe tambien un checkpoint "Cevher 49k" de uso interno, no publicado.

Su relevancia actual radica en que la mayoria de tokenizers multilingues genericos (Llama, Qwen, Gemma) fragmentan el turco de forma ineficiente por su morfologia aglutinante, lo que encarece el entrenamiento y la inferencia en ese idioma. Cevher 64k reporta 1,8266 tokens por palabra en su evaluacion ponderada, frente a 2,4186 de Llama-3.2-1B o 2,8433 de Qwen3-0.6B, lo que se traduce en secuencias mas cortas y menor coste computacional para modelos entrenados con este vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer, sin pesos neuronales) |
| Parametros totales | no disponible (no es un modelo de parametros) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (el tokenizer no define contexto; depende del modelo que lo use) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | Turco (tr) e ingles (en), con cobertura de codigo, matematicas, logs, JSON, URLs, seguridad, finanzas, medicina, e-commerce, educacion y emoji |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros de tokenizer de Hugging Face (`tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`); compatible con `PreTrainedTokenizerFast` |

## Arquitectura y entrenamiento

El componente es un tokenizer byte-level BPE con vocabulario de 64.000 tokens, implementado para la libreria `transformers` mediante `PreTrainedTokenizerFast`. Al operar a nivel de byte, garantiza compatibilidad completa de ida y vuelta (roundtrip) con UTF-8 y evita tokens desconocidos (UNK) en los fixtures de evaluacion. El vocabulario se optimizo con una ponderacion 60/40 entre turco e ingles/tecnico, de modo que las palabras turcas, incluidas formas aglutinadas y con apostrofo, se fragmentan en menos tokens que con tokenizers genericos.

La model card no detalla el corpus de entrenamiento (numero de tokens, composicion del dataset, fuentes) ni si se aplicaron tecnicas de poda o merge especificas mas alla del BPE estandar. Tampoco se documenta el proceso de seleccion de merges ni el tamano del corpus utilizado para derivar las reglas de fusion. El tokenizer no define plantilla de chat (chat template): puede tokenizar cualquier formato de prompt plano que use el modelo que lo integre.

## Capacidades

- Tokenizacion byte-level con roundtrip UTF-8 exacto y cero UNK en los ejemplos de evaluacion.
- Cobertura prioritaria del turco: texto general, legal, ruidoso, morfologia, apostrofos y mayusculas/minusculas.
- Soporte de ingles general y texto mixto turco/ingles.
- Tokenizacion eficiente de codigo (Python, snippets), matematicas (expresiones LaTeX), logs, JSON, YAML, URLs y parametros de peticiones HTTP.
- Cobertura de dominios especializados: seguridad (CVE), finanzas, medicina, e-commerce, educacion y busqueda.
- Manejo de emoji y simbolos.
- Tokenizacion por lotes con padding y `return_tensors` para integracion en pipelines de `transformers`.
- Serializacion local con `save_pretrained` y recarga con `from_pretrained`.
- No define chat template ni logica de generacion; es un componente puramente de tokenizacion.

## Casos de uso

- Entrenamiento de modelos de lenguaje en turco desde cero: usar Cevher 64k como vocabulario base reduce la longitud media de secuencia (1,8266 TPW ponderado) y, con ello, el coste de atencion y el numero de pasos de entrenamiento para una misma cantidad de texto.
- Fine-tuning de modelos turcos existentes: sustituir el tokenizer original por Cevher 64k exige reentrenar los embeddings, pero permite acortar secuencias en dominios como legal o e-commerce, donde el tokenizer reporta 1,303 y valores bajos de TPW respectivamente.
- Procesamiento de logs y observabilidad: el tokenizer esta disenado para lineas de log, JSON, URLs y parametros HTTP, por lo que encaja en pipelines de analisis de trazas y deteccion de anomalias sobre texto tecnico en turco e ingles.
- Analisis de avisos de seguridad: la cobertura de identificadores tipo CVE y rutas de API permite indexar y clasificar boletines de seguridad sin fragmentar excesivamente los identificadores.
- Busqueda y recuperacion (RAG) en turco: un tokenizador con menor TPW mejora la relacion entre longitud de documento y ventana del modelo, lo que permite incluir mas contexto util por consulta en sistemas de recuperacion aumentada.
- Preprocesamiento de documentacion tecnica y configuracion: ficheros YAML, manifiestos Kubernetes y snippets de codigo se tokenizan de forma compacta, lo que resulta util en asistentes de DevOps y generacion de configuracion.
- Normalizacion de texto turco para clasificacion: la cobertura de morfologia, apostrofos y mayusculas/minusculas facilita tareas de moderacion, analisis de sentimiento o clasificacion de tickets en turco.

## Benchmarks y rendimiento

La model card publica una evaluacion propia basada en tokens por palabra (TPW, menor es mejor), con penalizacion de roundtrip cuando aplica:

| Posicion | Tokenizer | TPW ponderado | Score | Roundtrip | UNK |
|---:|---|---:|---:|---:|---:|
| 1 | Cevher 64k | 1,8266 | 1,8266 | 1,0000 | 0,000000 |
| 2 | Cevher 49k (interno) | 1,8877 | 1,8877 | 1,0000 | 0,000000 |
| 3 | GPT2-Turkish-Cased | 2,1618 | 2,1618 | 1,0000 | 0,000000 |
| 4 | Bonur-GPT2-Turkish | 2,2559 | 2,2559 | 1,0000 | 0,000000 |
| 5 | Kumru-2B-Base | 2,3186 | 2,3186 | 1,0000 | 0,000000 |
| 6 | Llama-3.2-1B | 2,4186 | 2,4186 | 1,0000 | 0,000000 |
| 7 | Gemma-3-1B-IT | 2,5698 | 2,5698 | 1,0000 | 0,000000 |
| 8 | Gemma-2-2B | 2,5821 | 2,5821 | 1,0000 | 0,000000 |
| 9 | Qwen2.5-0.5B | 2,8433 | 2,8433 | 1,0000 | 0,000000 |
| 10 | Qwen3-0.6B | 2,8433 | 2,8433 | 1,0000 | 0,000000 |
| 11 | XLM-RoBERTa-Base | 2,3228 | 336,3228 | 0,6660 | 0,000000 |
| 12 | mT5-Small | 2,4890 | 336,4890 | 0,6660 | 0,000000 |

La model card incluye ademas una matriz por dominio (TR general, legal, ruidoso, morfologia, apostrofos, mayusculas, EN general, mixto TR/EN, codigo, matematicas, logs/JSON/URL, seguridad, finanzas, medicina, e-commerce, educacion, busqueda, multilingue y emoji). En los valores disponibles, Cevher 64k obtiene 1,235 en TR general, 1,303 en TR legal, 1,349 en TR ruidoso, 1,361 en apostrofos, 1,470 en mixto TR/EN y 2,34 en codigo; el resto de celdas de la matriz no esta disponible en la informacion proporcionada. No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo generativo.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; el tokenizer es una estructura de datos en CPU (vocabulario de 64.000 entradas y reglas de merge).
- GPU recomendadas: no requiere GPU; la tokenizacion se ejecuta en CPU. En pipelines de entrenamiento o inferencia, la GPU la determina el modelo de lenguaje que use el tokenizer.
- Compatibilidad con GPU de consumo: irrelevante para el tokenizer; cualquier GPU que soporte el modelo asociado es suficiente.
- Opciones de despliegue: `transformers` (`PreTrainedTokenizerFast`), `tokenizers` (Rust), y cualquier runtime que cargue el formato de tokenizer de Hugging Face. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un tokenizer BPE con implementacion Rust subyacente, la tokenizacion es de orden microsegundos por frase en CPU, pero no se publican cifras medidas.

## Comparativa con modelos similares

Comparacion como tokenizer, no como modelo generativo:

| Tokenizer | Vocabulario | TPW ponderado | Roundtrip | Idiomas | Licencia |
|---|---:|---:|---:|---|---|
| Cevher 64k | 64.000 | 1,8266 | 1,0000 | tr, en, tecnico | Apache 2.0 |
| GPT2-Turkish-Cased | no disponible | 2,1618 | 1,0000 | tr | no disponible |
| Kumru-2B-Base | no disponible | 2,3186 | 1,0000 | tr | no disponible |
| Llama-3.2-1B | no disponible | 2,4186 | 1,0000 | multilingue | Llama 3.2 Community License |
| Qwen3-0.6B | no disponible | 2,8433 | 1,0000 | multilingue | Apache 2.0 |
| XLM-RoBERTa-Base | no disponible | 2,3228 (score 336,3228) | 0,6660 | multilingue | MIT |

Cevher 64k lidera la tabla publicada por el autor en TPW ponderado, con una ventaja de 0,33 tokens por palabra frente a GPT2-Turkish-Cased y de 0,59 frente a Llama-3.2-1B. La comparacion se limita a la metrica del propio autor; no hay evaluaciones independientes disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no tiene pesos; solo tokeniza. Cualquier expectativa de capacidades generativas es incorrecta.
- La evaluacion de TPW la publica el propio autor; no se han identificado evaluaciones independientes que la validen.
- El corpus de entrenamiento del tokenizer no esta documentado, por lo que no puede evaluarse el sesgo de dominio ni la representatividad del vocabulario.
- La cobertura esta optimizada para turco e ingles; el rendimiento en otros idiomas no esta caracterizado y probablemente sea inferior al de tokenizers multilingues genericos.
- El repositorio es un archivo de VeriPazari del original de batuhanozkose; conviene verificar que la version archivada coincide con la original antes de usarla en produccion.
- El checkpoint Cevher 49k es de uso interno y no se distribuye; no debe asumirse su disponibilidad.
- No define chat template ni tokens especiales de rol; en produccion hay que aportar el formato de prompt y los tokens especiales del modelo asociado.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (archivo VeriPazari): https://huggingface.co/veripazari/cevher-tokenizer
- Repositorio original: https://huggingface.co/batuhanozkose/cevher-tokenizer
- Plataforma VeriPazari: https://veripazari.com.tr
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
