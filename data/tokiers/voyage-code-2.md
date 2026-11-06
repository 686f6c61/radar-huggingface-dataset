# tokiers/voyage-code-2

## Resumen

`tokiers/voyage-code-2` no es un modelo de lenguaje, sino un artefacto de tokenización: un tokenizer precompilado para el modelo de embeddings de código `voyageai/voyage-code-2`, empaquetado en el formato binario propietario de la librería `tokie`. Lo publica el usuario `tokiers`, un repositorio de artefactos derivados de la herramienta `tokie` desarrollada por chonkie-inc, cuyo objetivo es ofrecer un reemplazo directo de los tokenizers de Hugging Face escritos en Rust, con una carga más rápida y un tamaño de fichero menor.

El problema que resuelve es operativo: la tokenización con la librería estándar de Hugging Face puede ser un cuello de botella en pipelines de alto throughput, especialmente en aplicaciones de retrieval sobre código donde se procesan millones de fragmentos. Este repositorio proporciona el vocabulario y las reglas de tokenización de Voyage Code 2 en formato `tokenizer.tkz` (binario de tokie, aproximadamente 10 veces más pequeño y con carga en torno a 5 ms según el autor) y, cuando está disponible, el `tokenizer.json` original.

Es relevante únicamente en el contexto de despliegues que ya usan Voyage Code 2 para embeddings y quieren acelerar el preprocesado con tokie. No contiene pesos de red neuronal, no genera texto ni embeddings por sí mismo y no debe confundirse con el modelo `voyageai/voyage-code-2`, cuyas especificaciones de arquitectura, contexto y licencia no se detallan en la información disponible. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de tokenización; no es un modelo neuronal) |
| Parametros totales | no disponible (el repositorio no contiene pesos de modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo `voyageai/voyage-code-2` subyacente) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (tokenizer orientado a código y texto según el modelo original) |
| Licencia | MIT OR Apache-2.0 para la librería tokie; los ficheros originales conservan la licencia de `voyageai/voyage-code-2` (no especificada en la información disponible) |
| Formato de pesos | `tokenizer.tkz` (binario tokie) y `tokenizer.json` (Hugging Face, si está disponible); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Contiene los artefactos de tokenización derivados del tokenizer de `voyageai/voyage-code-2`, serializados en dos formatos: el binario `tokenizer.tkz` propio de tokie y el `tokenizer.json` estándar de Hugging Face cuando el autor lo incluye. La implementación de tokie está escrita en Rust y se distribuye como crate (`tokie = { version = "0.0.4", features = ["hf"] }`) y como paquete de Python (`pip install tokie`).

La innovación técnica es de ingeniería de software, no de modelado: según la model card, tokie ofrece tokenización aproximadamente 50 veces más rápida que los tokenizers de Hugging Face, ficheros de modelo unas 10 veces más pequeños y una carga en torno a 5 ms, manteniendo equivalencia exacta en la salida (`100% accurate`). No hay información sobre el corpus de entrenamiento del tokenizer original, el tamaño del vocabulario, las reglas de normalización ni si se aplicaron técnicas como byte-level BPE o SentencePiece; esos detalles corresponden a la model card de `voyageai/voyage-code-2`, que no se ha proporcionado.

## Capacidades

- Tokenización de texto y código con el vocabulario exacto de `voyageai/voyage-code-2`, devolviendo `ids` y `attention_mask`.
- API compatible con el flujo de Hugging Face: carga desde el Hub mediante `Tokenizer.from_pretrained`.
- Disponibilidad en Python (`tokie.Tokenizer`) y en Rust (`tokie::Tokenizer` con la feature `hf`).
- Serialización binaria compacta (`tokenizer.tkz`) pensada para reducir el tamaño del artefacto y el tiempo de carga en servicios de alta concurrencia.
- No incluye generación de texto, razonamiento, tool calling, capacidades de agente, visión ni audio.
- No produce embeddings por sí mismo: solo prepara las entradas que consumiría el modelo Voyage Code 2.

## Casos de uso

- Preprocesado de corpus de código a gran escala: indexar repositorios completos para búsqueda semántica tokenizando millones de fragmentos con tokie antes de pasarlos al modelo de embeddings Voyage Code 2, reduciendo el coste de CPU del pipeline.
- Servicios de retrieval en producción: en un servidor de búsqueda de código con latencia ajustada, sustituir el tokenizer de Hugging Face por tokie para disminuir el tiempo por petición en la fase de encoding de la query.
- Arranque en frío de microservicios: gracias a la carga en torno a 5 ms del fichero `tokenizer.tkz`, un contenedor puede estar listo para tokenizar casi inmediatamente, lo que simplifica el escalado horizontal y los despliegues serverless.
- Distribución de artefactos en entornos con ancho de banda limitado: el formato binario, unas 10 veces más pequeño, reduce el tamaño de las imágenes de contenedor o de los paquetes que deben descargar los nodos de cómputo.
- Réplica de pipelines de evaluación: garantizar que las métricas de retrieval sobre código se calculan con exactamente la misma tokenización que el modelo original, evitando discrepancias entre entornos de investigación y producción.
- Integración en herramientas nativas en Rust: incorporar el tokenizer directamente en un binario Rust (CLI de indexación, daemon de búsqueda) sin depender del stack de Python ni de Hugging Face Tokenizers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita de forma cualitativa mejoras de aproximadamente 50 veces en velocidad de tokenización, 10 veces en reducción de tamaño y unos 5 ms de tiempo de carga, pero no se aportan tablas, hardware de referencia ni metodología. No se inventan cifras.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no contiene pesos de red neuronal y la tokenización se ejecuta en CPU.
- GPU recomendadas: no aplica para este repositorio. El consumo de GPU vendrá determinado por el modelo `voyageai/voyage-code-2` que se use aguas abajo, cuyos requisitos no se detallan en la información disponible.
- GPU de consumo: no aplica; el tokenizer funciona en cualquier CPU x86-64 o ARM64 con soporte para Rust.
- Despliegue: paquete Python `tokie` o crate Rust `tokie` con la feature `hf`. No se soportan vLLM, llama.cpp, Ollama ni TGI, ya que no hay modelo que servir.
- Latencia y throughput: según el autor, carga en torno a 5 ms y tokenización unas 50 veces más rápida que Hugging Face Tokenizers; no se especifican el hardware ni el conjunto de prueba empleados para esas cifras.

## Comparativa con modelos similares

| Artefacto | Tipo | Formato | Tamaño de repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tokiers/voyage-code-2` (este) | Tokenizer precompilado para Voyage Code 2 | `tokenizer.tkz`, `tokenizer.json` | 0,2 GB | tokie: MIT OR Apache-2.0; original: no disponible | Hugging Face Hub, 0 descargas |
| `voyageai/voyage-code-2` | Modelo de embeddings de código | no disponible en la información proporcionada | no disponible | no disponible | Hugging Face Hub |
| Tokenizer estándar de Hugging Face para Voyage Code 2 | Tokenizer de referencia | `tokenizer.json` | mayor que el binario tokie según el autor | la del modelo original | Hugging Face Tokenizers |

La comparación se limita al ámbito de la tokenización; no se dispone de datos para contrastar calidad de embeddings, contexto o rendimiento frente a otros modelos de código.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no calcula embeddings y no puede usarse para inferencia por sí solo.
- La licencia del artefacto original (`voyageai/voyage-code-2`) no se especifica en la información disponible; antes de un uso comercial debe verificarse en la model card del modelo original, ya que la licencia MIT OR Apache-2.0 cubre únicamente la librería tokie.
- El repositorio no registra descargas ni likes, y el autor (`tokiers`) no es el desarrollador original del modelo; se trata de un artefacto derivado de terceros, sin garantías de mantenimiento.
- No se documentan el vocabulario, las reglas de normalización ni la cobertura idiomática; cualquier comportamiento inesperado en idiomas distintos del inglés o en lenguajes de programación poco comunes debe validarse empíricamente contra el tokenizer de referencia.
- La afirmación de `100% accurate` procede del autor y no se ha verificado de forma independiente en la información disponible.
- Depende de la librería tokie (versión 0.0.4 en el ejemplo de Rust), de madurez temprana; conviene fijar la versión y probar la equivalencia de salida antes de sustituir el tokenizer en producción.
- No hay información sobre sesgos, alucinación o restricciones de contexto, porque esas propiedades pertenecen al modelo de embeddings subyacente y no al tokenizer.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tokiers/voyage-code-2
- Modelo original: https://huggingface.co/voyageai/voyage-code-2
- Repositorio de tokie en GitHub: https://github.com/chonkie-inc/tokie
