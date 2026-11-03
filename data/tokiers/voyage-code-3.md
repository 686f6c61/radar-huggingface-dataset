# tokiers/voyage-code-3

## Resumen

`tokiers/voyage-code-3` no es un modelo de lenguaje, sino un paquete de tokenizer precompilado para el modelo de embeddings de código `voyageai/voyage-code-3`. Lo publica el usuario `tokiers` dentro del ecosistema del proyecto tokie (chonkie-inc), una implementación en Rust de tokenizers compatible con HuggingFace que afirma ser unas 50 veces más rápida y generar ficheros unas 10 veces más pequeños que la librería original, con resultados idénticos.

El repositorio contiene únicamente los artefactos del tokenizer: un fichero binario propietario `tokenizer.tkz` (formato tokie, carga en torno a 5 ms) y, cuando está disponible, el `tokenizer.json` original de HuggingFace. El tamaño total del repo es de 0,2 GB. No incluye pesos del modelo de embeddings, ni código de inferencia, ni pipeline asociado.

Su relevancia ahora es operativa: permite tokenizar entradas de código con la misma segmentación que usa `voyage-code-3` (modelo de embeddings orientado a recuperación de código) sin cargar la pila de HuggingFace tokenizers, lo que reduce latencia en pipelines de indexación masiva de repositorios. La ficha se limita a describir el tokenizer; los datos del modelo subyacente no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer (no es un modelo neuronal); implementación tokie en Rust compatible con HuggingFace tokenizers |
| Parametros totales | no disponible (no aplica: no contiene pesos de modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT OR Apache-2.0 para la librería tokie; los ficheros originales conservan la licencia de `voyageai/voyage-code-3` (no especificada en la información disponible) |
| Formato de pesos | `tokenizer.tkz` (binario tokie) y `tokenizer.json` (HuggingFace, si está disponible) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer, no una red neuronal: no hay transformer, MoE ni SSM que describir. La implementación subyacente, tokie, está escrita en Rust y se presenta como reemplazo directo de HuggingFace tokenizers, con el objetivo declarado de mantener una precisión del 100 % respecto al tokenizer original mientras reduce el tiempo de carga y el tamaño en disco. El fichero `tokenizer.tkz` es un binario propio del formato tokie; el `tokenizer.json` reproduce el tokenizer canónico de `voyageai/voyage-code-3`.

No se dispone de información sobre el vocabulario, las reglas de segmentación (BPE, WordPiece, Unigram u otras), el corpus de entrenamiento del tokenizer ni el proceso de ajuste. Tampoco hay datos sobre el modelo de embeddings `voyage-code-3` al que acompaña (dimensiones de embedding, ventana de entrada, datos de entrenamiento o técnica de contraste).

## Capacidades

- Codificación de texto a IDs de token y generación de attention mask mediante `tokenizer.encode(...)`, con API equivalente a HuggingFace tokenizers.
- Carga desde el Hub con `Tokenizer.from_pretrained("tokiers/voyage-code-3")` tanto en Python (`tokie`) como en Rust (`tokie` con feature `hf`).
- Segmentación alineada con el tokenizer de `voyage-code-3`, pensada para entradas de código en pipelines de embeddings.
- Carga rápida del binario `tokenizer.tkz` (en torno a 5 ms según la model card) y ficheros aproximadamente 10 veces más pequeños que el JSON equivalente.
- No incluye generación de texto, razonamiento, tool calling, agentes, visión, audio ni capacidades multilingües propias: esas capacidades, si existen, pertenecen al modelo `voyage-code-3`, no a este paquete.

## Casos de uso

- Indexación masiva de repositorios: usar el tokenizer para preprocesar millones de ficheros de código antes de pasarlos a `voyage-code-3` para generar embeddings, aprovechando la carga en milisegundos del binario `.tkz` en lugar de inicializar HuggingFace tokenizers en cada worker.
- Servicio de búsqueda semántica de código: tokenizar consultas y fragmentos en el mismo espacio que el modelo de embeddings, garantizando que la segmentación coincide con la usada en el índice.
- Pipelines en Rust de alto rendimiento: integrar `tokie` con la feature `hf` en un servicio de recuperación de código donde el coste de tokenización debe ser despreciable frente al de la inferencia del modelo de embeddings.
- Contenedores y despliegues con almacenamiento limitado: el formato `.tkz` reduce el tamaño del artefacto del tokenizer, útil en imágenes Docker mínimas o en entornos edge con cuotas de disco ajustadas.
- Validación de compatibilidad: comparar la salida de `tokie` con el `tokenizer.json` original para verificar que los IDs y las máscaras coinciden antes de migrar un pipeline existente.
- Herramientas de análisis estático y conteo de tokens: estimar longitudes de entrada y costes de API antes de enviar código a un servicio de embeddings, usando la misma tokenización que el proveedor.
- Reproducibilidad en investigación: fijar la versión del tokenizer en experimentos de recuperación de código para que la segmentación no varíe entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita de forma genérica "50x faster tokenization, 10x smaller model files, 100% accurate" para la librería tokie, sin tablas ni metodología en la información proporcionada; no se trasladan esos números a esta ficha como resultados medidos.

## Requisitos de hardware

- VRAM: no aplica; el paquete no contiene pesos de modelo y la tokenización se ejecuta en CPU.
- GPU recomendadas: no aplica para el tokenizer. Para el modelo de embeddings `voyage-code-3` no hay datos de requisitos en la información disponible.
- GPU de consumo: irrelevante para este artefacto; la carga del tokenizer es en memoria del proceso (repo de 0,2 GB en disco, binario `.tkz` de menor tamaño).
- Despliegue: instalación vía `pip install tokie` (Python) o dependencia Cargo `tokie = { version = "0.0.4", features = ["hf"] }` (Rust). No requiere vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia de modelos generativos.
- Latencia y throughput: la model card indica una carga de aproximadamente 5 ms del binario tokie; no se proporcionan cifras de throughput de tokenización verificables.

## Comparativa con modelos similares

| Criterio | tokiers/voyage-code-3 (tokie) | HuggingFace tokenizers (tokenizer.json de voyage-code-3) | Otros tokenizers precompilados en el Hub |
|---|---|---|---|
| Tipo de artefacto | Tokenizer en formato tokie + JSON | Tokenizer en JSON | Tokenizer en JSON o formatos propios |
| Implementación | Rust (tokie) | Rust (HF tokenizers) | Variable |
| Tamaño en disco | Repo de 0,2 GB; `.tkz` ~10x menor según la model card | JSON original | Variable |
| Tiempo de carga | ~5 ms según la model card | No disponible | No disponible |
| Compatibilidad API | `tokie.Tokenizer` (Python/Rust) | `tokenizers` / `transformers` | Variable |
| Licencia | MIT OR Apache-2.0 (librería); ficheros originales según voyage-code-3 | Según voyage-code-3 | Variable |
| Mantenimiento | 0 descargas, 0 likes; actualizado 2026-11-03 | Repositorio oficial de voyageai | Variable |

No se dispone de datos de rendimiento medidos para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de embeddings ni de generación: no produce vectores ni texto; solo convierte cadenas en IDs de token. Usarlo como sustituto de `voyage-code-3` es un error de categoría.
- El repositorio tiene 0 descargas y 0 likes y lo publica un usuario individual (`tokiers`), no el equipo de Voyage AI; no hay garantía de mantenimiento ni de actualización ante cambios en el tokenizer original.
- La licencia de los ficheros originales de `voyage-code-3` no está especificada en la información disponible; antes de uso comercial hay que verificar la licencia del modelo base en su repositorio oficial.
- La afirmación de "100 % de precisión" respecto al tokenizer original procede de la model card de tokie y no se ha verificado de forma independiente en la información proporcionada.
- La dependencia de la librería `tokie` (versión 0.0.4 en el ejemplo de Rust) implica un proyecto joven; conviene fijar versiones y probar la compatibilidad de IDs antes de desplegar.
- No hay información sobre el vocabulario, los idiomas cubiertos ni el comportamiento con código de lenguajes concretos; la cobertura real depende del tokenizer de `voyage-code-3`.
- Riesgo de deriva si el tokenizer upstream se actualiza y este paquete no se regenera: los IDs podrían dejar de coincidir con los del índice ya construido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tokiers/voyage-code-3
- Modelo base: https://huggingface.co/voyageai/voyage-code-3
- Repositorio de tokie: https://github.com/chonkie-inc/tokie
- Documentación y benchmarks de tokie: https://github.com/chonkie-inc/tokie (sección de benchmarks y documentación citada en la model card)
