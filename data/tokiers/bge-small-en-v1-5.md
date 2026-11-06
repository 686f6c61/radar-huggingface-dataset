# tokiers/bge-small-en-v1.5

## Resumen

`tokiers/bge-small-en-v1.5` no es un modelo de lenguaje, sino un artefacto de tokenización: un tokenizer precompilado en formato binario `tokie` (`.tkz`) que reproduce fielmente el tokenizer del modelo de embeddings `BAAI/bge-small-en-v1.5`. Lo publica el usuario `tokiers` como parte del ecosistema de la librería [tokie](https://github.com/chonkie-inc/tokie), un reemplazo directo de los tokenizers de Hugging Face escrito en Rust que, según su autor, ofrece hasta 50 veces más velocidad de tokenización, archivos 10 veces más pequeños y una precisión del 100 % respecto al tokenizer original.

El repositorio tiene un tamaño de 0,1 GB e incluye dos ficheros: `tokenizer.tkz` (formato binario propietario de tokie, con carga en unos 5 ms según la model card) y `tokenizer.json` (el tokenizer original de Hugging Face, preservado para compatibilidad). No contiene pesos del modelo `bge-small-en-v1.5`, ni cabecera de sentence-transformers, ni ningún componente de inferencia.

Su relevancia es acotada pero específica: sirve a pipelines que necesitan tokenizar texto para el modelo de embeddings `bge-small-en-v1.5` (uno de los más usados en recuperación y RAG por su relación calidad/tamaño) sin pagar el coste de inicialización y ejecución de los tokenizers de Hugging Face. Es un componente de infraestructura, no un modelo evaluable en benchmarks de razonamiento o generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo un tokenizer, no pesos de modelo) |
| Parametros totales | no disponible (no aplica: no hay pesos) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo `BAAI/bge-small-en-v1.5` subyacente, no del tokenizer) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el modelo subyacente es `en`, pero la model card no lo declara) |
| Licencia | MIT OR Apache-2.0 para la librería tokie; los ficheros originales retienen la licencia de `BAAI/bge-small-en-v1.5` (no especificada en la ficha) |
| Formato de pesos | no disponible (no hay pesos); ficheros incluidos: `tokenizer.tkz` (binario tokie) y `tokenizer.json` (Hugging Face) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado. Contiene la representación serializada de un tokenizer, presumiblemente un tokenizer por subpalabras tipo WordPiece o BPE (el que emplea `BAAI/bge-small-en-v1.5`, un modelo BERT-small de 33 M de parámetros), empaquetado en el formato binario `.tkz` de tokie. La librería tokie está implementada en Rust y se distribuye como crate (`tokie = { version = "0.0.4", features = ["hf"] }`) y como paquete de Python (`pip install tokie`), con soporte para cargar tokenizers directamente desde el Hub de Hugging Face mediante `Tokenizer::from_pretrained`.

No hay información sobre datos de entrenamiento, composición del corpus, RLHF, DPO ni innovaciones de arquitectura del modelo subyacente en la información proporcionada. La única innovación documentada es del propio formato: según la model card, el fichero `.tkz` es aproximadamente 10 veces más pequeño que el `tokenizer.json` equivalente y se carga en torno a 5 ms, con una precisión declarada del 100 % frente al tokenizer original.

## Capacidades

- Tokenización de texto compatible con el tokenizer de `BAAI/bge-small-en-v1.5`: devuelve `ids` y `attention_mask` idénticos al tokenizer de referencia.
- Carga desde el Hub de Hugging Face en una línea, tanto desde Python (`tokie.Tokenizer.from_pretrained`) como desde Rust (`Tokenizer::from_pretrained`).
- Inicialización de baja latencia (unos 5 ms según la model card), adecuada para procesos efímeros, funciones serverless y arranques en frío.
- Formato binario compacto (`.tkz`) que reduce el tamaño en disco y el ancho de banda de descarga frente al `tokenizer.json`.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües propias: esas capacidades, si existen, pertenecen al modelo `BAAI/bge-small-en-v1.5` subyacente, no a este repositorio.

## Casos de uso

- Indexación masiva para RAG: en pipelines que generan embeddings con `bge-small-en-v1.5` sobre millones de documentos, sustituir el tokenizer de Hugging Face por el `.tkz` reduce el tiempo de tokenización y el consumo de memoria por proceso, manteniendo los mismos `ids`.
- Funciones serverless y contenedores efímeros: con una carga de aproximadamente 5 ms, el tokenizer encaja en entornos donde el arranque en frío del tokenizer de Hugging Face (que importa la librería completa) domina la latencia total de la petición.
- Servicios de búsqueda semántica de baja latencia: al ser un componente pequeño y rápido, permite tokenizar la consulta del usuario en el mismo proceso que atiende la búsqueda sin añadir un salto de red ni una dependencia pesada.
- Despliegue en Rust nativo: equipos que ya tienen su servicio de embeddings en Rust pueden usar el crate `tokie` con la feature `hf` y evitar un puente hacia Python solo para tokenizar.
- Validación y auditoría de tokenizers: al incluir tanto `tokenizer.tkz` como `tokenizer.json`, sirve para comparar la salida de tokie con la referencia de Hugging Face y verificar la paridad declarada del 100 %.
- Distribución de artefactos en sistemas con restricciones de tamaño: en entornos con límites estrictos de tamaño de imagen o de artefacto, el `.tkz` (unas 10 veces más pequeño según el autor) reduce el peso del contenedor frente a incluir la librería y los ficheros de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma cualitativa "50x faster tokenization, 10x smaller model files, 100% accurate" y una carga de aproximadamente 5 ms, pero no aporta tablas, metodología ni cifras por modelo o por hardware. No se dispone de datos de throughput (tokens/s) ni de latencia por documento.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos de modelo. El tokenizer se ejecuta en CPU y su huella en memoria es de decenas de megabytes como máximo (el repositorio completo ocupa 0,1 GB).
- GPU recomendadas: ninguna; no requiere aceleración por GPU.
- Cabe en cualquier hardware: CPU de un solo núcleo, instancias pequeñas de cloud, dispositivos edge y contenedores de 128 MB de RAM son suficientes.
- Opciones de despliegue: paquete Python `tokie` (`pip install tokie`) o crate Rust `tokie` con la feature `hf`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no contiene un modelo de inferencia.
- Latencia y throughput: el autor declara una carga de aproximadamente 5 ms y una tokenización hasta 50 veces más rápida que los tokenizers de Hugging Face; no se aportan cifras absolutas de tokens por segundo ni el hardware de referencia.

## Comparativa con modelos similares

| Componente | Tipo | Tamano | Carga | Formato | Licencia |
|---|---|---|---|---|---|
| `tokiers/bge-small-en-v1.5` | Tokenizer precompilado (tokie) | ~0,1 GB de repo | ~5 ms (declarado) | `.tkz` + `tokenizer.json` | MIT OR Apache-2.0 (librería) |
| `BAAI/bge-small-en-v1.5` (tokenizer de Hugging Face) | Tokenizer de referencia | Mayor que el `.tkz` (factor ~10 según el autor) | No disponible | `tokenizer.json` | La del modelo original |
| `tokenizers` (Hugging Face, Rust/Python) | Librería de tokenización | Dependencia de librería | No disponible | Carga `tokenizer.json` | Apache-2.0 |

No se dispone de datos para comparar rendimiento de tokenización con alternativas como SentencePiece o tiktoken en este repositorio.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no produce embeddings por sí mismo y no puede evaluarse con MMLU, HumanEval, GSM8K ni métricas equivalentes. Cualquier uso como modelo de inferencia es un error de interpretación.
- Solo tokeniza; para obtener embeddings hay que cargar aparte `BAAI/bge-small-en-v1.5` con sentence-transformers o equivalente.
- El repositorio no declara idiomas soportados; el modelo subyacente es de inglés (`en`), por lo que la tokenización de otros idiomas puede degradarse aunque el tokenizer funcione.
- La licencia del artefacto no está declarada de forma explícita en la ficha: la model card indica MIT OR Apache-2.0 para la librería tokie y remite a la licencia original de `BAAI/bge-small-en-v1.5` para los ficheros, que no se especifica en la información disponible. Verificar antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-03-24: es un artefacto reciente y sin validación comunitaria. La paridad del 100 % con el tokenizer original es una afirmación del autor, no un resultado verificado de forma independiente en la información disponible.
- La librería tokie está en versión 0.0.4: API inestable y posible rotura entre versiones menores.
- Riesgo de deriva si el tokenizer original de `BAAI/bge-small-en-v1.5` se actualiza y este artefacto no se regenera.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tokiers/bge-small-en-v1.5
- Modelo original: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio de tokie en GitHub: https://github.com/chonkie-inc/tokie
