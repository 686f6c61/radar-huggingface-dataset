# tokiers/voyage-finance-2

## Resumen

`tokiers/voyage-finance-2` no es un modelo de lenguaje, sino un paquete de tokenizer precompilado para el modelo de embeddings financieros `voyageai/voyage-finance-2` de Voyage AI. Lo publica el usuario `tokiers`, que distribuye tokenizers empaquetados en el formato binario propio de la libreria tokie, una implementacion en Rust de los tokenizers de HuggingFace. El repositorio contiene unicamente los ficheros de tokenizacion (`tokenizer.tkz` y, si esta disponible, `tokenizer.json`), no pesos del modelo.

El problema que resuelve es de infraestructura: tokie afirma ser un reemplazo directo de HuggingFace tokenizers con una tokenizacion aproximadamente 50 veces mas rapida, ficheros unas 10 veces mas pequenos y carga en torno a 5 ms. Para pipelines que tokenizan grandes volumenes de texto financiero antes de pasarlos al modelo de embeddings, ese ahorro puede ser relevante. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

Es importante subrayar que esta ficha describe el paquete de tokenizer, no el modelo de embeddings en si. Cualquier evaluacion de calidad de representaciones, dimensiones de embedding, contexto maximo o rendimiento en tareas financieras debe consultarse en la model card original de Voyage AI, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo el tokenizer, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT OR Apache-2.0 para la libreria tokie; los ficheros originales conservan la licencia de `voyageai/voyage-finance-2` (no especificada en la informacion disponible) |
| Formato de pesos | no aplica; formatos de tokenizer: `tokenizer.tkz` (binario tokie) y `tokenizer.json` (HuggingFace, si esta disponible) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo neuronal ni datos de entrenamiento. Contiene los artefactos de tokenizacion derivados del tokenizer del modelo `voyageai/voyage-finance-2`: un fichero `tokenizer.tkz` en formato binario de tokie y, opcionalmente, el `tokenizer.json` original de HuggingFace. La libreria tokie esta implementada en Rust y se distribuye como crate (`tokie = { version = "0.0.4", features = ["hf"] }`) y como paquete de Python (`pip install tokie`).

La innovacion tecnica es el formato `.tkz`, que segun el autor reduce el tamano del fichero unas 10 veces y permite cargas en torno a 5 ms, con una tokenizacion declarada como 50 veces mas rapida que la de HuggingFace tokenizers y sin perdida de exactitud. No se proporcionan detalles sobre el algoritmo de tokenizacion subyacente (BPE, WordPiece, Unigram) ni sobre el vocabulario del modelo original.

## Capacidades

- Tokenizacion de texto compatible con el tokenizer de `voyageai/voyage-finance-2`, orientado a contenido financiero.
- API en Python mediante `tokie.Tokenizer.from_pretrained(...)` con salida de `ids` y `attention_mask`.
- API en Rust mediante `tokie::Tokenizer::from_pretrained(...)` y `encode(texto, true)`.
- Carga rapida del tokenizer (en torno a 5 ms segun el autor) y ficheros compactos.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un componente de preprocesado.
- No se documentan capacidades multilingues especificas del vocabulario en la informacion disponible.

## Casos de uso

- Preprocesado de corpus financieros a gran escala: tokenizar millones de documentos (informes anuales, notas de prensa, transcripciones de resultados) antes de generar embeddings con `voyage-finance-2`, aprovechando la velocidad declarada de tokie para reducir el cuello de botella de CPU.
- Pipelines de recuperacion aumentada (RAG) sobre documentacion financiera: usar el tokenizer para contar tokens y trocear documentos respetando los limites del modelo de embeddings antes de indexar en una base vectorial.
- Servicios de busqueda semantica en dominios regulados: integrar el tokenizer en Rust dentro de un microservicio de baja latencia para normalizar consultas antes de llamar al modelo de embeddings.
- Control de costes y cuotas: estimar el numero de tokens de cada peticion antes de enviarla a la API o al endpoint del modelo, usando un tokenizer identico al del modelo para que el conteo sea exacto.
- Evaluacion y benchmarking de modelos de embeddings: disponer de un tokenizer rapido y ligero para experimentar con distintas estrategias de chunking sin penalizar el tiempo de iteracion.
- Despliegue en entornos con recursos limitados: el fichero `.tkz` reducido facilita incluir el tokenizer en contenedores o funciones serverless donde el tamano del artefacto importa.
- Migracion desde HuggingFace tokenizers: al ser un reemplazo directo, permite sustituir la dependencia en codigo Python o Rust manteniendo el mismo vocabulario y los mismos ids.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara de forma cualitativa "50x faster tokenization, 10x smaller model files, 100% accurate" y una carga de aproximadamente 5 ms, pero no se aportan tablas, hardware de referencia ni metodologia en la informacion proporcionada.

## Requisitos de hardware

- VRAM: no aplica; no se ejecuta ningun modelo neuronal, solo el tokenizer.
- CPU: cualquier CPU moderna es suficiente; tokie esta implementado en Rust y no requiere GPU.
- GPU: no necesaria.
- Memoria: el repositorio ocupa 0,2 GB; el fichero `.tkz` es, segun el autor, unas 10 veces mas pequeno que el `tokenizer.json` equivalente.
- Despliegue: paquete Python (`pip install tokie`) o crate de Rust (`tokie` con feature `hf`). No aplica vLLM, llama.cpp, Ollama ni TGI, que son runners de modelos.
- Latencia: carga en torno a 5 ms declarada por el autor; no se proporcionan cifras de throughput por token.

## Comparativa con modelos similares

| Criterio | tokiers/voyage-finance-2 (tokenizer tokie) | tokenizer.json de voyageai/voyage-finance-2 | HuggingFace tokenizers |
|---|---|---|---|
| Tipo de artefacto | Tokenizer en formato `.tkz` (+ `tokenizer.json` opcional) | Tokenizer en JSON | Libreria de tokenizacion |
| Lenguaje | Rust (bindings Python) | Rust/Python (via HF) | Rust (bindings Python) |
| Tamano del fichero | Aprox. 10x menor segun el autor | Referencia | No aplica |
| Velocidad | Aprox. 50x mas rapida segun el autor | Referencia | Referencia |
| Licencia | MIT OR Apache-2.0 (libreria); ficheros originales segun Voyage AI | Segun Voyage AI | Apache-2.0 |
| Disponibilidad | HuggingFace (`tokiers/`) y GitHub de tokie | HuggingFace (`voyageai/`) | PyPI / crates.io |

No se dispone de datos para comparar con otros tokenizers empaquetados alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene el modelo `voyage-finance-2`; no puede usarse para generar embeddings por si solo.
- La licencia de los ficheros originales del tokenizer depende de Voyage AI y no se especifica en la informacion disponible; conviene verificar las condiciones de uso comercial en la model card original antes de desplegar en produccion.
- Las cifras de rendimiento (50x, 10x, 5 ms) son afirmaciones del autor de tokie y no estan respaldadas por benchmarks publicados en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, y el autor (`tokiers`) no es el propietario original del modelo; se trata de un artefacto derivado y no oficial.
- La libreria tokie se encuentra en version 0.0.4 segun el ejemplo del README, lo que sugiere una madurez temprana y posible inestabilidad de API.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas propias, ya que no hay modelo generativo implicado; los sesgos del vocabulario heredado del tokenizer original no se detallan.
- Al no incluir pesos, no aplica cuantizacion ni requisitos de VRAM, pero tampoco se puede evaluar la calidad de las representaciones financieras desde este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tokiers/voyage-finance-2
- Modelo original (tokenizer de referencia): https://huggingface.co/voyageai/voyage-finance-2
- Repositorio de tokie en GitHub: https://github.com/chonkie-inc/tokie
