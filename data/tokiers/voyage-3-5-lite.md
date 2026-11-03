# tokiers/voyage-3.5-lite

## Resumen

El repositorio `tokiers/voyage-3.5-lite` no contiene un modelo de lenguaje, sino un tokenizador precompilado para el modelo de embeddings `voyageai/voyage-3.5-lite` de Voyage AI. Lo publica el usuario `tokiers`, presumiblemente vinculado al proyecto tokie, y su funcion es servir como sustituto directo del tokenizador original de HuggingFace para dicho modelo, con el objetivo de acelerar la tokenizacion y reducir el tamano en disco.

El artefacto principal es un fichero en formato binario propietario de tokie (`tokenizer.tkz`), de aproximadamente 0,2 GB en total en el repositorio, que segun la model card es unas 10 veces mas pequeno que el original y carga en torno a 5 ms. La libreria tokie esta implementada en Rust y se presenta como compatible al 100 % con los tokenizers de HuggingFace, con una mejora de velocidad de hasta 50 veces.

Es relevante para equipos que despliegan pipelines de embeddings a gran escala con voyage-3.5-lite y quieren eliminar el cuello de botella de tokenizacion, especialmente en entornos Rust o en servicios Python con alto QPS. No aporta pesos de modelo ni capacidades generativas: es exclusivamente infraestructura de preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (tokenizador, no modelo neuronal); formato binario tokie `.tkz` con `tokenizer.json` opcional |
| Parametros totales | No aplica (tokenizador) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo voyage-3.5-lite original) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | MIT OR Apache-2.0 para la libreria tokie; los ficheros originales conservan la licencia de `voyageai/voyage-3.5-lite` (no especificada en la informacion disponible) |
| Formato de pesos | `tokenizer.tkz` (binario tokie) y `tokenizer.json` (HuggingFace, si esta disponible) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un artefacto de tokenizacion derivado del tokenizador del modelo `voyageai/voyage-3.5-lite`. El repositorio empaqueta el vocabulario y las reglas de tokenizacion en el formato binario `.tkz` que consume la libreria tokie, escrita en Rust. La model card no detalla el algoritmo de tokenizacion subyacente (BPE, WordPiece, Unigram, etc.) ni el tamano del vocabulario, por lo que estos datos deben consultarse en el repositorio del modelo original de Voyage AI.

La innovacion tecnica reside en el formato y el runtime: tokie afirma cargar el tokenizador en aproximadamente 5 ms y ocupar unas 10 veces menos espacio que el `tokenizer.json` equivalente, ademas de ofrecer hasta 50 veces mas velocidad de tokenizacion que la implementacion de referencia de HuggingFace. No hay informacion sobre datos de entrenamiento porque no aplica.

## Capacidades

- Tokenizacion de texto compatible con el tokenizador de `voyageai/voyage-3.5-lite`, pensada para alimentar pipelines de embeddings.
- API equivalente a HuggingFace tokenizers: devuelve `ids` y `attention_mask`, con opcion de truncado/padding en la firma Rust (`encode(text, true)`).
- Integracion nativa en Python (`import tokie`) y en Rust mediante la feature `hf` de la crate `tokie` (version 0.0.4 en el ejemplo).
- Carga desde HuggingFace Hub con `from_pretrained`, sin necesidad de descargar el tokenizador original.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un componente de preprocesado.
- El soporte multilingue depende del vocabulario del tokenizador original de voyage-3.5-lite, no documentado en esta ficha.

## Casos de uso

- Pipeline de embeddings a gran escala: sustitucion directa del tokenizador de HuggingFace en el preprocesado de documentos antes de llamar a la API o al modelo voyage-3.5-lite, reduciendo el coste de CPU por peticion en servicios con miles de QPS.
- Servicios de busqueda semantica y RAG: indexacion de corpus grandes donde la tokenizacion representa una fraccion medible del tiempo total; el formato `.tkz` reduce el arranque en frio de workers serverless.
- Microservicios en Rust: uso de la crate `tokie` con la feature `hf` para tokenizar dentro del mismo proceso que el cliente de embeddings, evitando dependencias de Python y de la libreria `tokenizers`.
- Despliegue en contenedores ligeros: el menor tamano del artefacto (repo de ~0,2 GB) y la carga en ~5 ms facilitan imagenes Docker mas pequenas y escalado horizontal rapido.
- Evaluacion y reproducibilidad: al ser un drop-in replacement declarado como 100 % preciso, permite comparar resultados de embeddings con el tokenizador original sin cambiar el pipeline.
- Procesamiento batch offline: tokenizacion de millones de documentos en jobs de Spark o Dataflow con la version Rust para maximizar throughput por nucleo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita de forma cualitativa "50x faster tokenization, 10x smaller model files, 100% accurate" y una carga de aproximadamente 5 ms, pero no incluye tablas de latencia, throughput ni comparaciones numericas con la libreria `tokenizers` de HuggingFace. Se recomienda consultar los benchmarks del repositorio de GitHub de tokie.

## Requisitos de hardware

- VRAM: no aplica; es un tokenizador que se ejecuta en CPU y ocupa un espacio en memoria proporcional al vocabulario (repo de ~0,2 GB en disco).
- GPU: no requiere GPU. Cualquier CPU x86-64 o ARM moderna es suficiente.
- GPU de consumo: no aplica.
- Despliegue: libreria Python `tokie` (>= la version que soporte `from_pretrained`) o crate Rust `tokie` 0.0.4 con feature `hf`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia: carga del tokenizador en torno a 5 ms segun la model card; latencia por tokenizacion no cuantificada en la informacion disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | Velocidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tokiers/voyage-3.5-lite` (tokie) | Tokenizador en formato `.tkz` | ~0,2 GB (repo) | Hasta 50x vs HuggingFace tokenizers | MIT OR Apache-2.0 (libreria) | HuggingFace Hub |
| Tokenizador original de `voyageai/voyage-3.5-lite` | Tokenizador HuggingFace (`tokenizer.json`) | No disponible | Referencia (1x) | La del modelo original (no disponible) | HuggingFace Hub |
| HuggingFace `tokenizers` (libreria generica) | Runtime de tokenizacion | Depende del modelo | Referencia (1x) | Apache-2.0 | PyPI / crates.io |

No se dispone de informacion sobre otros tokenizadores precompilados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no produce embeddings por si mismo; solo tokeniza para el modelo voyage-3.5-lite.
- La licencia del tokenizador original de Voyage AI no se especifica en la informacion disponible; antes de uso comercial hay que verificar los terminos de `voyageai/voyage-3.5-lite`.
- El autor del repositorio (`tokiers`) no es el propietario del modelo original; se trata de una publicacion de terceros, con el riesgo de desactualizacion si Voyage AI cambia el tokenizador.
- El repositorio registra 0 descargas y 0 likes, y la libreria tokie esta en version 0.0.4: madurez y soporte limitados.
- La afirmacion de "100 % de precision" es del autor y no esta respaldada por benchmarks publicados en la informacion disponible.
- No se documentan idiomas soportados, tamano de vocabulario ni comportamiento con textos fuera de distribucion.
- Dependencia de un formato binario propietario (`.tkz`): si el proyecto tokie se abandona, la migracion al `tokenizer.json` original es necesaria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tokiers/voyage-3.5-lite
- Modelo original: https://huggingface.co/voyageai/voyage-3.5-lite
- Repositorio GitHub de tokie: https://github.com/chonkie-inc/tokie
