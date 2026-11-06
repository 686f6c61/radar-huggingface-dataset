# Vel04/merzal-tamil-tokenizer

## Resumen

Merzal Tamil Tokenizer es un tokenizador de tipo Unigram con 63.995 entradas de vocabulario, disenado especificamente para el idioma tamil, el tanglish (tamil romanizado) y el ingles. Lo publica el usuario Vel04 bajo licencia Apache-2.0 y se distribuye como artefacto de investigacion, no como componente listo para produccion. Su tesis central es que los tokenizadores byte-level BPE habituales fragmentan las letras tamil al cortar entre la consonante y su signo vocalico dependiente o pulli, generando piezas sin significado. Para evitarlo, mapea los 312 aksharas canonicos del tamil a puntos de codigo de uso privado antes de la segmentacion.

El modelo resuelve un problema concreto de eficiencia y fidelidad en lenguas indias: reduce la fertilidad a 1,693 tokens por palabra en 20.000 documentos tamil no vistos, un 28% menos que Gemma-4 y 4,4 veces menos que GPT-4o, y limita a un 0,04% las letras cortadas frente al 12-41,5% de los tokenizadores de produccion. Ademas garantiza un round-trip exacto al 100%, incluidos espacios en blanco, tabulaciones y saltos de linea, lo que lo hace apto para codigo y datos con indentacion significativa.

Se trata de un componente de pipeline (libreria `tokenizers`, sin pesos de modelo) pensado para quien entrene o evalue modelos en tamil. Su relevancia actual radica en que documenta un protocolo reproducible de construccion y evaluacion de tokenizadores para escrituras complejas, con auditorias de corte de letras y de fidelidad, algo poco habitual en el ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador Unigram (SentencePiece) con byte fallback y normalizacion NFC |
| Parametros totales | No aplica (tokenizador); vocabulario de 63.995 entradas (63.990 piezas del modelo + 5 tokens anadidos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (sin ventana de contexto; es un tokenizador) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Tamil (ta), tanglish, ingles (en) |
| Licencia | Apache-2.0 (codigo del tokenizador) con atribucion de datos en `NOTICE` |
| Formato de pesos | `tokenizer.json` (libreria `tokenizers`); compatible con `transformers` |

## Arquitectura y entrenamiento

El tokenizador sigue un diseno en cinco etapas. Primero construye una tabla de aksharas a partir de categorias Unicode: 25 consonantes, 12 vocales y aytham, cada una con sus formas con pulli y con signos dependientes, hasta 312 unidades unicas que se mapean a `U+E000…U+E137`. Despues aplica normalizacion NFC y 312 operaciones `Replace` en orden de longitud descendente, de modo que una consonante desnuda nunca coincida antes que una consonante con signo. Sobre esa representacion entrena un modelo Unigram con `initial_alphabet` fijado a las 312 unidades PUA, `max_piece_length=16`, `Metaspace(prepend_scheme="never")` y `Digits(individual_digits=True)`. Finalmente anade 256 piezas de byte `<0xNN>` (Unigram no las emite) y 10 tokens de secuencias de espacios en blanco, y el decodificador invierte el mapeo PUA.

Los datos de entrenamiento combinan texto web tamil e ingles con una mezcla pequena de codigo: `ai4bharat/sangraha` (verified/tam, CC BY 4.0), `ai4bharat/IndicCorpV2` (ta, CC0 1.0), `wikimedia/wikipedia` (20231101.ta, CC BY-SA 3.0), `HuggingFaceFW/fineweb-edu` (sample-10BT, ODC-By) para ingles, `google/dakshina` (tamil romanizado, CC BY-SA 4.0) para tanglish y `codeparrot/github-code-clean`. La version 64K corrige el defecto de espacio inicial de la 32K (`prepend_scheme="always"` eliminaba el espacio de cabecera) y necesita un 8,6% menos de tokens para el mismo texto. La evaluacion se hizo sobre 20.000 documentos no vistos de FineWeb-2 `tam_Taml` con fertilidad ratio-of-sums, intervalos de confianza bootstrap a nivel de documento, auditoria de letras cortadas y auditoria de round-trip exacto; ademas se sometio el artefacto a 12 suites con 12.156 aserciones, 9.000 cadenas de fuzzing y pruebas de entrada malformada, espacios y emoji.

## Capacidades

- Segmentacion de texto tamil con preservacion atomica de los 312 aksharas canonicos: ninguna pieza aprendida puede caer en medio de una letra.
- Round-trip exacto del 100% de la entrada, incluidos espacios iniciales, finales y repetidos, tabulaciones, saltos de linea y sangria.
- Fallback de bytes de 256 piezas para cualquier caracter fuera del bloque tamil, de modo que ninguna entrada queda como desconocida.
- Manejo de tanglish (tamil romanizado) y de texto en ingles dentro del mismo vocabulario.
- Tokenizacion de digitos individuales (`Digits(individual_digits=True)`), adecuada para numeros y codigo.
- Conjunto de tokens especiales y de chat: `<pad>`, `<s>`, `</s>`, `<unk>`, `<|user|>`, `<|assistant|>`, `<|system|>`, tokens de tool call y tool response, `<think>` y FIM, mas 16 tokens reservados.
- Compatibilidad con la API de `transformers` (`AutoTokenizer`) y con la libreria `tokenizers` directamente.

## Casos de uso

- Entrenamiento de modelos de lenguaje en tamil: el tokenizador reduce el numero de tokens por palabra a 1,693, lo que abarata el preentrenamiento y amplia el texto efectivo que cabe en una ventana de contexto fija.
- Adaptacion de modelos multilingues al tamil: puede emplearse como tokenizador de referencia para medir cuanto se degrada un modelo existente al tokenizar tamil y para comparar alternativas antes de un ajuste fino.
- Procesamiento de corpus con sangria significativa: al ser exacto en espacios en blanco, sirve para codigo fuente y documentos con formato, donde un tokenizador que colapsa espacios rompe la estructura.
- Normalizacion y auditoria de calidad de corpus tamil: la auditoria de letras cortadas permite detectar y cuantificar la fragmentacion de aksharas en pipelines de limpieza de datos.
- Investigacion en tokenizacion de escrituras complejas: el protocolo documentado (tabla de aksharas, mapeo PUA, orden longest-first, evaluacion con bootstrap) es reutilizable para otras escrituras indicas con signos dependientes.
- Busqueda y recuperacion de informacion en tamil: una tokenizacion fiel de las letras mejora la coincidencia de terminos y la calidad de indices invertidos en comparacion con BPE byte-level.
- Evaluacion comparativa de tokenizadores: sirve como linea base documentada frente a Gemma-4, GPT-4o y otros tokenizadores de produccion en pruebas de fertilidad y fidelidad.

## Benchmarks y rendimiento

| Metrica | Merzal Tamil 64K | Gemma-4 | GPT-4o |
|---|---|---|---|
| Tokens por palabra (20.000 documentos tamil no vistos) | 1,693 | 2,35 (28% mas) | 7,45 (4,4x mas) |
| Letras cortadas | 0,04% (1 de cada 2.551) | 12-41,5% (rango reportado para tokenizadores de produccion) | 12-41,5% (rango reportado para tokenizadores de produccion) |
| Round-trip exacto | 100% | no disponible | no disponible |
| Tiempo de carga | 108 ms | no disponible | no disponible |
| Memoria adicional (RSS) | +70 MB | no disponible | no disponible |

Los valores de Gemma-4 y GPT-4o corresponden al rango agregado que reporta el autor para tokenizadores de produccion; no se han publicado resultados por modelo en la informacion disponible. La version 32K del mismo tokenizador necesita un 8,6% mas de tokens que la 64K para el mismo texto.

## Requisitos de hardware

- No requiere GPU: es un tokenizador de CPU con un consumo de memoria adicional de aproximadamente 70 MB de RSS.
- Tiempo de carga medido de 108 ms en el entorno de evaluacion del autor.
- Cabe en cualquier maquina capaz de ejecutar Python, incluidos portatiles y entornos de CI con recursos limitados.
- Despliegue mediante la libreria `tokenizers` (Rust) o `transformers`; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Throughput y latencia de tokenizacion por documento no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Merzal Tamil Tokenizer 64K | Unigram con mapeo PUA de aksharas y byte fallback | 63.995 | ta, tanglish, en | Apache-2.0 | HuggingFace (`Vel04/merzal-tamil-tokenizer`) |
| Merzal Tamil Tokenizer 32K | Unigram, version previa con `prepend_scheme="always"` | no disponible | ta, tanglish, en | Apache-2.0 | Referenciado por el autor; no se detalla su repositorio |
| Tokenizador de Gemma-4 | Byte-level BPE | no disponible | multilingue | licencia de Gemma (no disponible en detalle) | Pesos de Google |
| Tokenizador de GPT-4o | BPE propietario | no disponible | multilingue | propietaria | Solo API |

La comparacion se limita a la metrica de fertilidad y a la tasa de letras cortadas reportadas por el autor; no hay datos publicados de otros tokenizadores especificos para tamil en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo declara no listo para produccion, evaluado sobre un unico corpus reservado y sin evaluacion en tareas downstream.
- Limitaciones conocidas de colision y de offsets documentadas en `METHODS.md`; conviene leerlas antes de usarlo mas alla de evaluacion.
- El mapeo PUA a `U+E000…U+E137` implica que los offsets de caracter del tokenizador no coinciden con los del texto original, lo que afecta a tareas de etiquetado y alineacion.
- El rendimiento esta medido solo en tamil, tanglish e ingles; no hay datos para otras lenguas indicas ni para texto mixto con otras escrituras mas alla del fallback de bytes.
- Los benchmarks proceden de una sola evaluacion del autor y no han sido replicados de forma independiente.
- La licencia Apache-2.0 cubre el codigo del tokenizador, pero los datos de entrenamiento tienen licencias propias (CC BY 4.0, CC0 1.0, CC BY-SA 3.0, ODC-By, CC BY-SA 4.0) que deben respetarse segun la atribucion recogida en `NOTICE`.
- Riesgo de sesgo derivado de las fuentes web (Wikipedia, FineWeb-2, Sangraha), con posible sobrerrepresentacion de registros formales y de contenido enciclopedico.
- No incluye post-procesador: no anade BOS/EOS implicitos, por lo que el pipeline debe gestionarlos de forma explicita.

## Enlaces

- HuggingFace: https://huggingface.co/Vel04/merzal-tamil-tokenizer
- Protocolo y metricas (METHODS.md): https://github.com/mvel95942-source/merzal-tamil-tokenizer/blob/main/METHODS.md
- Repositorio GitHub: https://github.com/mvel95942-source/merzal-tamil-tokenizer
- Dataset ai4bharat/sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset ai4bharat/IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset google/dakshina: https://huggingface.co/datasets/google/dakshina
- Dataset codeparrot/github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
