# veripazari/turkce-saglik-bpe-tokenizer

## Resumen

`veripazari/turkce-saglik-bpe-tokenizer` es un tokenizador ByteLevel BPE entrenado desde cero para texto sanitario en turco. Lo desarrollo originalmente el usuario `seali` y la plataforma VeriPazarı lo ha rearchivado en Hugging Face conservando la documentacion y la licencia originales. No es un modelo de lenguaje: es el componente de tokenizacion que se acoplaria a un LLM para especializarlo en dominio medico turco.

El problema que aborda es la baja eficiencia de los tokenizadores multilingues genericos sobre turco, un idioma aglutinante con palabras muy largas. Con un vocabulario de 32.000 tokens, el autor reporta una fertility de 1,24 tokens por palabra en frases medicas turcas, frente a 2,74 de Qwen3-4B-Instruct, 2,61 de `bert-base-multilingual-cased` y 3,93 de GPT-2. Esto implica que una misma ventana de contexto admite aproximadamente el doble de texto sanitario que con tokenizadores generalistas.

La relevancia practica es doble: por un lado reduce coste computacional y longitud efectiva de secuencia en pipelines clinicos; por otro, representa terminos como `hipoglisemi`, `hipertansiyon`, `bagisiklik`, `enfeksiyon` o `antibiyotik` en un unico token, lo que evita fragmentaciones que degradan la coherencia en dominios especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteLevel BPE (tokenizador, no modelo neuronal) |
| Parametros totales | no disponible (no es un modelo con pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo al que se acople) |
| Tipos de cuantizacion | no aplica (tokenizador) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | ficheros de tokenizador compatibles con `transformers` (vocab y merges); no disponible el detalle exacto de ficheros publicados |

## Arquitectura y entrenamiento

Se trata de un tokenizador ByteLevel BPE con vocabulario de 32.000 tokens, entrenado sobre un corpus turco de 105 MB. La composicion del corpus combina `ituperceptron/turkish_medical_reasoning` (preguntas-respuestas y razonamiento medico), libros sanitarios de la Direccion General de Salud Publica del Ministerio de Sanidad turco (HSGM), `AhmetSemih/Turkish-Medical-Notes` (notas clinicas) y un fragmento de `ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0` para cobertura de turco general. Aproximadamente dos tercios del corpus son texto medico.

El diseno incorpora tres decisiones tecnicas destacables. Primero, la tokenizacion a nivel de byte garantiza que ningun caracter turco ni entrada inesperada produzca tokens desconocidos (OOV). Segundo, se aplica normalizacion NFC para unificar caracteres descompuestos procedentes de PDF. Tercero, no se aplica lowercasing, de modo que siglas con carga semantica como KOAH, HIV o "Tip 1" conservan su forma. Ademas, el vocabulario incluye tokens especiales de plantilla de chat: `<|im_start|>`, `<|im_end|>`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|think|>` y `</|think|>`, lo que sugiere compatibilidad con formatos de conversacion tipo ChatML y modos de razonamiento.

## Capacidades

- Tokenizacion de texto sanitario turco con fertility medida de 1,24 tokens por palabra.
- Representacion de terminos medicos frecuentes en un unico token (hipoglisemi, hipertansiyon, bagisiklik, enfeksiyon, antibiyotik).
- Cobertura byte-level: no genera tokens desconocidos ante caracteres turcos (ç, ğ, ı, ö, ş, ü) o entradas anomalas.
- Normalizacion NFC para texto extraido de PDF y documentos clinicos.
- Preservacion de mayusculas y siglas clinicas relevantes.
- Tokens especiales de plantilla de chat y de modo "think" para integracion en pipelines conversacionales.
- No incluye capacidades generativas, de vision, audio ni tool calling por si mismo; estas dependen del modelo al que se acople.

## Casos de uso

- Especializacion de un LLM open source en turco clinico: sustituir el tokenizador de un modelo base por este y reentrenar los embeddings, de modo que el mismo contexto de 8.000 tokens albergue cerca del doble de texto sanitario.
- Procesamiento de historiales y notas clinicas: la tokenizacion compacta reduce la longitud de secuencia en resumenes y extraccion de entidades sobre notas tipo `Turkish-Medical-Notes`.
- Sistemas de preguntas y respuestas medicas: el corpus de `turkish_medical_reasoning` esta representado en el vocabulario, lo que mejora la coherencia en tareas de razonamiento clinico en turco.
- Indexacion y busqueda semantica de documentacion sanitaria: la fertility baja abarata el almacenamiento de embeddings y mejora la densidad informativa de los chunks.
- Preprocesado de literatura medica y guias oficiales: la normalizacion NFC y la ausencia de lowercasing preservan siglas y nomenclatura clinica al procesar PDF institucionales.
- Analisis de conversaciones con pacientes: los tokens de plantilla de chat permiten integrar el tokenizador directamente en pipelines multi-turno con roles system/user/assistant.
- Filtrado y anonimizacion de datos clinicos: la tokenizacion byte-level evita fallos ante formatos heterogeneos y caracteres corruptos en registros reales.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son metricas de fertility sobre frases medicas turcas y comparaciones de longitud de tokenizacion por termino.

| Tokenizador | Fertility (tokens/palabra) | Vocabulario |
|---|---|---|
| **Este tokenizador** | **1,24** | 32.000 |
| Qwen3-4B-Instruct | 2,74 | 151.643 |
| `bert-base-multilingual-cased` | 2,61 | 119.547 |
| GPT-2 | 3,93 | 50.257 |

| Termino | Este tokenizador | Qwen3-4B |
|---|---|---|
| hipoglisemi | 1 | 4 |
| hipertansiyon | 1 | 5 |
| bagisiklik | 1 | 5 |
| enfeksiyon | 1 | 5 |
| antibiyotik | 1 | 5 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza del artefacto: un tokenizador no se evalua con esos conjuntos.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizador en si; el consumo depende del modelo de lenguaje al que se acople.
- GPU recomendadas: no aplica al tokenizador; para el LLM asociado, la eleccion dependera de su tamano.
- Cabe en GPU consumer: si, el tokenizador se ejecuta en CPU sin requisitos relevantes de memoria.
- Opciones de despliegue: carga mediante `transformers` (`AutoTokenizer.from_pretrained`); al ser un tokenizador compatible con el ecosistema Hugging Face, puede usarse en pipelines de `vLLM`, `TGI` o `llama.cpp` siempre que se convierta al formato requerido por cada motor.
- Latencia y throughput: no disponible; el coste de tokenizacion es despreciable frente al de la inferencia del modelo.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Fertility en turco medico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **turkce-saglik-bpe-tokenizer** | ByteLevel BPE especializado | 32.000 | 1,24 | MIT | Hugging Face |
| Qwen3-4B-Instruct (tokenizador) | BPE multilingue generico | 151.643 | 2,74 | Apache 2.0 (modelo) | Hugging Face |
| `bert-base-multilingual-cased` | WordPiece multilingue | 119.547 | 2,61 | Apache 2.0 | Hugging Face |
| GPT-2 | BPE generico | 50.257 | 3,93 | MIT | Hugging Face |

La comparativa se limita a eficiencia de tokenizacion, ya que el artefacto no compite en capacidad generativa. Frente a los tokenizadores multilingues, el ahorro es de aproximadamente un 50 % en tokens por palabra en dominio sanitario turco, a costa de un vocabulario mucho mas pequeno y de una cobertura limitada al turco.

## Limitaciones y advertencias

- Vocabulario reducido (32.000 tokens) y entrenado solo en turco: el rendimiento fuera de turco o en textos tecnicos no sanitarios sera peor que el de tokenizadores multilingues.
- Es un tokenizador, no un modelo: no genera texto, no razona y no puede usarse de forma autonoma; requiere acoplarse a un LLM y, en la mayoria de casos, reentrenar los embeddings del modelo base.
- La fertility de 1,24 procede de frases medicas turcas; no hay datos publicados sobre otros dominios ni sobre robustez ante ruido, jerga o dialectos.
- Al no aplicar lowercasing, aumenta el vocabulario efectivo y puede penalizar ligeramente textos con uso inconsistente de mayusculas.
- Riesgo de sesgo derivado de las fuentes: el corpus se apoya en guias institucionales y notas clinicas, lo que puede infrarrepresentar variantes regionales o terminologia coloquial de pacientes.
- Aunque la licencia es MIT, conviene verificar la licencia de los corpus de entrenamiento originales antes de un uso comercial en produccion.
- El repositorio es un rearchivo de un trabajo original de `seali`; la documentacion y el mantenimiento dependen del autor original.
- No se han publicado resultados de benchmarks de tareas ni evaluaciones de calidad aguas abajo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/veripazari/turkce-saglik-bpe-tokenizer
- Repositorio original del autor: https://huggingface.co/seali/turkce-saglik-bpe-tokenizer
- Plataforma VeriPazari: https://veripazari.com.tr
- Perfil del autor original: https://huggingface.co/seali
- Corpus `ituperceptron/turkish_medical_reasoning`: https://huggingface.co/datasets/ituperceptron/turkish_medical_reasoning
- Corpus `AhmetSemih/Turkish-Medical-Notes`: https://huggingface.co/datasets/AhmetSemih/Turkish-Medical-Notes
- Corpus `ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0`: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
