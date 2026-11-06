# tokiers/all-mpnet-base-v2

## Resumen

`tokiers/all-mpnet-base-v2` no es un modelo de lenguaje, sino un repositorio de tokenizador precompilado para el modelo de embeddings `sentence-transformers/all-mpnet-base-v2`. Lo publica el usuario `tokiers` como parte del ecosistema de la librería `tokie`, un reemplazo de los tokenizers de Hugging Face escrito en Rust que, según su documentación, ofrece una tokenización unas 50 veces más rápida y ficheros de modelo unas 10 veces más pequeños, manteniendo una precisión del 100 % respecto al tokenizador original.

El repositorio contiene dos ficheros: `tokenizer.tkz`, el formato binario propio de tokie (que se carga en aproximadamente 5 ms), y `tokenizer.json`, el tokenizador original de Hugging Face. Su utilidad es permitir que cualquier pipeline que use el modelo de embeddings MPNet de sentence-transformers pueda tokenizar con el runtime de tokie en lugar de con la librería `tokenizers`, reduciendo latencia y tamaño en despliegues de producción.

Es relevante para desarrolladores que construyen sistemas de búsqueda semántica, RAG o clustering de documentos con `all-mpnet-base-v2` y quieren optimizar el coste de tokenización. Conviene subrayar que este repositorio no contiene pesos del modelo: solo el tokenizador. El modelo de embeddings subyacente tiene 109 millones de parámetros y una dimensión de salida de 768, con una ventana de contexto de 384 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de tokenizador; el modelo asociado es un transformer encoder BERT-like, MPNet) |
| Parametros totales | No disponible en este repositorio (el modelo subyacente `all-mpnet-base-v2` tiene 109 M) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible en este repositorio (el modelo subyacente admite 384 tokens) |
| Tipos de cuantizacion | No aplica (tokenizador) |
| Idiomas soportados | No disponible |
| Licencia | MIT OR Apache-2.0 para la librería tokie; los ficheros originales conservan la licencia de `sentence-transformers/all-mpnet-base-v2` |
| Formato de pesos | `tokenizer.tkz` (binario tokie) y `tokenizer.json` (Hugging Face) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo ni contiene pesos. Es un artefacto de serialización: toma el vocabulario y las reglas de tokenización del modelo `sentence-transformers/all-mpnet-base-v2` (tokenizador WordPiece con vocabulario de 30 522 tokens, derivado de MPNet) y los empaqueta en el formato binario `.tkz` de tokie. La librería tokie está implementada en Rust y se distribuye como crate (`tokie = "0.0.4"` con la feature `hf`) y como paquete de Python (`pip install tokie`).

La innovación técnica es de infraestructura, no de modelado: el formato `.tkz` reduce el tamaño del fichero de tokenizador aproximadamente 10 veces y acelera la carga hasta unos 5 ms, mientras que el motor de tokenización en Rust declara una velocidad unas 50 veces superior a la de Hugging Face `tokenizers` con salida idéntica. No hay información sobre datos de entrenamiento, RLHF ni ajuste fino porque no aplica a un tokenizador.

## Capacidades

- Tokenización de texto compatible con el vocabulario y las reglas de `sentence-transformers/all-mpnet-base-v2`.
- API en Python (`tokie.Tokenizer.from_pretrained`) y en Rust (`Tokenizer::from_pretrained`).
- Devuelve `ids` y `attention_mask` equivalentes a los de Hugging Face `tokenizers`.
- Carga rápida del tokenizador (aproximadamente 5 ms según la model card).
- Formato binario compacto (`.tkz`) para reducir el tamaño del artefacto desplegado.
- No incluye generación de texto, razonamiento, código, visión, tool calling ni capacidades de agente: es exclusivamente un componente de preprocesado.

## Casos de uso

- Búsqueda semántica y RAG: sustituir el tokenizador de Hugging Face por tokie en el pipeline de indexación y consulta de `all-mpnet-base-v2` para reducir la latencia de preprocesado en cada petición.
- Servicios de embeddings de alto QPS: en un endpoint que vectoriza miles de documentos por segundo, el ahorro por tokenización se acumula y libera CPU para el propio modelo de embeddings.
- Despliegue en contenedores ligeros: el fichero `.tkz` ocupa aproximadamente una décima parte del tokenizador JSON, lo que reduce el tamaño de la imagen Docker y el tiempo de arranque en funciones serverless.
- Clasificación y clustering de documentos: tokenizar lotes grandes de textos antes de pasarlos por `all-mpnet-base-v2` para deduplicación, agrupación temática o moderación de contenido.
- Sistemas embebidos o edge con Rust: integrar el crate `tokie` directamente en un binario Rust que haga inferencia local del modelo de embeddings sin depender del runtime de Python.
- Pipelines de evaluación de recuperación: tokenizar de forma masiva y rápida los corpus de evaluación (BEIR, MS MARCO) manteniendo exactamente la misma tokenización que el modelo original, lo que garantiza comparabilidad de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio concreto. La model card de tokie declara de forma cualitativa "50x faster tokenization, 10x smaller model files, 100% accurate" y una carga de aproximadamente 5 ms, pero no se adjuntan tablas con métricas detalladas ni comparativas numéricas verificables en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el tokenizador se ejecuta en CPU y el repositorio (0,1 GB) no contiene pesos de modelo.
- GPU: no requiere GPU. Para el modelo de embeddings subyacente (`all-mpnet-base-v2`, 109 M de parámetros) basta una GPU consumer modesta o incluso CPU.
- GPU consumer: el tokenizador funciona en cualquier CPU x86-64 o ARM64; no hay requisito de GPU.
- Despliegue: paquete Python `tokie` (`pip install tokie`) o crate Rust `tokie` con la feature `hf`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: la model card indica carga en aproximadamente 5 ms y una tokenización unas 50 veces más rápida que Hugging Face `tokenizers`; no se aportan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Repositorio | Tipo | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| `tokiers/all-mpnet-base-v2` | Tokenizador tokie para MPNet | `.tkz` + `tokenizer.json` | ~0,1 GB | MIT/Apache-2.0 (librería); original del modelo | Carga ~5 ms, tokenización ~50x más rápida según el autor |
| `sentence-transformers/all-mpnet-base-v2` | Modelo de embeddings completo | safetensors + tokenizer.json | ~0,4 GB | Apache-2.0 (según el modelo original) | Incluye pesos; tokenizador Hugging Face estándar |
| Tokenizador Hugging Face `tokenizers` para MPNet | Tokenizador de referencia | `tokenizer.json` | Mayor que `.tkz` | Apache-2.0 | Runtime en Rust con bindings Python; referencia de compatibilidad |

No se dispone de información sobre otros repositorios tokie comparables ni de métricas de rendimiento publicadas para esta variante concreta.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde preguntas. Cualquier uso que espere inferencia de un LLM fallará.
- No contiene pesos del modelo de embeddings; solo el tokenizador. Para generar embeddings hay que descargar por separado `sentence-transformers/all-mpnet-base-v2`.
- El repositorio tiene 0 descargas y 0 likes, y la librería tokie se encuentra en versión 0.0.4: madurez y soporte limitados, con riesgo de cambios de API.
- La licencia del repositorio no está declarada de forma explícita en los metadatos de Hugging Face; la model card remite a la licencia del modelo original, que conviene verificar antes de uso comercial.
- No hay información sobre idiomas soportados ni sobre evaluación de sesgos o alucinación; al ser un tokenizador, el riesgo de sesgo se hereda del vocabulario del modelo original.
- La afirmación de "100% accurate" y "50x faster" procede del autor y no está respaldada por benchmarks publicados en la información disponible; conviene validarla en el pipeline propio antes de adoptarla en producción.
- El formato `.tkz` es propietario de tokie: crea dependencia de esa librería y no es intercambiable con otros runtimes sin volver al `tokenizer.json`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tokiers/all-mpnet-base-v2
- Modelo de embeddings original: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Librería tokie (GitHub): https://github.com/chonkie-inc/tokie
