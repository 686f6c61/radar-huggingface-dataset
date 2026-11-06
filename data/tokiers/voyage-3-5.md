# tokiers/voyage-3.5

## Resumen

`tokiers/voyage-3.5` no es un modelo de lenguaje, sino un tokenizer precompilado en formato tokie para el modelo de embeddings `voyageai/voyage-3.5` de Voyage AI. Lo publica el usuario `tokiers`, un espacio de Hugging Face dedicado a distribuir tokenizers convertidos al formato binario `.tkz` que utiliza la librería tokie, escrita en Rust y presentada por sus autores como un reemplazo directo de los tokenizers de Hugging Face con una tokenización hasta 50 veces más rápida y ficheros hasta 10 veces más pequeños.

El repositorio tiene un tamaño de 0,2 GB y contiene el fichero `tokenizer.tkz` (formato binario propio de tokie, con carga en torno a 5 ms según la model card) y, cuando está disponible, el `tokenizer.json` original de Hugging Face. No incluye pesos del modelo `voyage-3.5`, ni configuración de arquitectura, ni código de inferencia: únicamente el vocabulario y las reglas de segmentación necesarias para convertir texto en identificadores antes de pasarlos al modelo de embeddings original.

Su relevancia es práctica y acotada: permite sustituir la dependencia de `tokenizers` de Hugging Face por una implementación en Rust con menor latencia y menor huella en disco en pipelines de embeddings a gran escala. No aporta ninguna capacidad nueva de generación, razonamiento ni visión, y su utilidad está condicionada a que el usuario ya esté trabajando con `voyage-3.5` y quiera optimizar la fase de tokenización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un tokenizer, no un modelo neuronal; el modelo subyacente `voyageai/voyage-3.5` no detalla arquitectura en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (no contiene pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio; la libreria tokie es MIT OR Apache-2.0 y los ficheros originales conservan la licencia de `voyageai/voyage-3.5` |
| Formato de pesos | no aplica; artefactos: `tokenizer.tkz` (binario tokie) y `tokenizer.json` (Hugging Face, si esta disponible) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer derivado del vocabulario de `voyageai/voyage-3.5`, convertido al formato binario `.tkz` de tokie. La model card no especifica el algoritmo de segmentacion subyacente (BPE, WordPiece, Unigram u otro), ni el tamano del vocabulario, ni la composicion del corpus con el que se entreno el tokenizer original. Tampoco se documenta ningun proceso de entrenamiento propio: la conversion es mecanica y no altera las reglas de segmentacion del tokenizer de origen.

La innovacion tecnica reside en la libreria tokie, no en el tokenizer en si: implementacion en Rust, serializacion binaria compacta (el autor afirma ficheros unas 10 veces mas pequenos y carga en torno a 5 ms) y una API compatible con el flujo de Hugging Face (`Tokenizer.from_pretrained`). No hay datos publicados sobre RLHF, DPO ni decodificacion especulativa, porque no es un modelo generativo.

## Capacidades

- Conversion de texto a identificadores (`encode`) y generacion de `attention_mask`, tal como muestra la model card en los ejemplos de Python y Rust.
- Compatibilidad con el tokenizer original de `voyageai/voyage-3.5`, preservando el mapeo texto-token de ese modelo.
- Carga rapida en memoria (en torno a 5 ms segun el autor) y fichero binario compacto, adecuado para entornos con arranque en frio frecuente.
- API en Python (`pip install tokie`) y en Rust (`tokie = { version = "0.0.4", features = ["hf"] }`).
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues propias: esas capacidades, si existen, pertenecen al modelo `voyage-3.5` de Voyage AI, no a este repositorio.

## Casos de uso

- Sustitucion del tokenizer de Hugging Face en pipelines de embeddings: si ya se usa `voyage-3.5` para generar vectores, este repositorio permite cambiar la capa de tokenizacion por tokie sin modificar el resto del pipeline, reduciendo el tiempo dedicado a preprocesar texto.
- Indexacion masiva de documentos para busqueda semantica o RAG: en trabajos con millones de fragmentos, la reduccion de latencia por tokenizacion y el menor tamano del fichero en disco simplifican el despliegue en contenedores y nodos de computo.
- Servicios con arranque en frio frecuente (funciones serverless, workers efimeros): la carga en torno a 5 ms del fichero `.tkz` evita el coste de inicializar tokenizers mas pesados en cada invocacion.
- Microservicios escritos en Rust: la API nativa de tokie permite tokenizar dentro del propio servicio sin depender de un binding de Python ni de `tokenizers` de Hugging Face.
- Validacion de compatibilidad en migraciones: sirve para comprobar que la tokenizacion con tokie produce los mismos identificadores que el tokenizer original antes de desplegar el cambio en produccion.
- Entornos con restricciones de espacio (imagenes Docker minimas, dispositivos edge): el fichero binario compacto reduce el tamano de la imagen frente a alternativas basadas en `tokenizer.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La model card cita cifras genericas de la libreria tokie ("50x faster tokenization, 10x smaller model files, 100% accurate") sin detallar el hardware, el corpus ni la metodologia empleados, por lo que no deben tomarse como mediciones verificables de este tokenizer en particular.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no contiene pesos y se ejecuta en CPU.
- GPU: no requiere GPU. Cualquier CPU moderna es suficiente para la tokenizacion.
- GPU de consumo: no aplica.
- Despliegue: libreria tokie en Python (`pip install tokie`) o Rust (crate `tokie` con la feature `hf`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo.
- Latencia y throughput: el autor declara carga del fichero `.tkz` en torno a 5 ms; no hay cifras publicadas de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano del repo | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `tokiers/voyage-3.5` | Tokenizer precompilado | 0,2 GB | `.tkz` + `tokenizer.json` | no disponible | Conversion tokie del tokenizer de Voyage 3.5 |
| `voyageai/voyage-3.5` | Modelo de embeddings (original) | no disponible | no disponible | no disponible | Modelo de referencia; este repositorio solo cubre su tokenizer |
| Tokenizers de Hugging Face (`tokenizer.json`) | Tokenizer | variable | JSON | Apache-2.0 (libreria) | Implementacion de referencia; tokie se presenta como sustituto compatible |
| `tokenizers` (Rust crate de Hugging Face) | Libreria de tokenizacion | no aplica | no aplica | Apache-2.0 | Alternativa madura y ampliamente adoptada; sin las optimizaciones de formato binario de tokie |

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona, no produce embeddings por si mismo. Solo tokeniza.
- El repositorio registra 0 descargas y 0 likes, y la libreria tokie se encuentra en version 0.0.4: madurez y soporte comunitario muy limitados.
- La licencia del repositorio figura como "no disponible"; la model card remite a la licencia de `voyageai/voyage-3.5`, que debe verificarse antes de cualquier uso comercial.
- El autor no documenta el algoritmo de tokenizacion, el tamano del vocabulario ni los idiomas cubiertos, lo que dificulta evaluar su idoneidad para corpus no ingleses.
- Las cifras de rendimiento ("50x", "10x", "~5ms") provienen del propio autor y no van acompanadas de metodologia reproducible.
- Riesgo de desalineacion con el tokenizer original si `voyage-3.5` se actualiza y este repositorio no se regenera; conviene validar la equivalencia de identificadores antes de produccion.
- Dependencia de una libreria joven y de un unico mantenedor; no hay garantias de compatibilidad futura con la API de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tokiers/voyage-3.5
- Modelo original de referencia: https://huggingface.co/voyageai/voyage-3.5
- Repositorio de la libreria tokie: https://github.com/chonkie-inc/tokie
