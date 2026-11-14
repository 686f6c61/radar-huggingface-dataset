# soubruno/potion-multilingual-128M-int8

## Resumen

`potion-multilingual-128M-int8` es una copia cuantizada a 8 bits del modelo de embeddings estáticos multilingües `minishlab/potion-multilingual-128M`, desarrollado originalmente por MinishLab y redistribuido por el usuario soubruno. No es un modelo generativo: es una tabla de embeddings estáticos de 256 dimensiones que se consulta por token, sin transformer, sin atención y sin cómputo de inferencia más allá de una búsqueda y una media ponderada. Resuelve el problema de generar representaciones vectoriales de texto en aplicaciones de búsqueda semántica, deduplicación o clasificación ligera que necesitan ejecutarse en CPU y con un coste de descarga bajo.

La única modificación respecto al original es el almacenamiento de la tabla de embeddings: se pasa de float32 a int8 con una escala float32 por fila, lo que reduce el fichero de pesos de 512.361.560 bytes a 130.091.948 bytes y la descarga total de los tres ficheros que cargan las librerías de 531 MB a 149 MB. El vocabulario, el tokenizador, la dimensión (256) y el comportamiento de codificación se mantienen idénticos.

Es relevante para despliegues en los que el modelo se descarga en tiempo de ejecución (contenedores, funciones serverless, clientes de escritorio o aplicaciones móviles) y se ejecuta en CPU, donde el ahorro de ancho de banda y de memoria es determinante. La licencia MIT del original se conserva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec), sin transformer ni atención; tabla de 500.353 filas × 256 dimensiones |
| Parámetros totales | 128.590.721 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sin contexto: codifica el texto de entrada completo mediante pooling de embeddings de token) |
| Tipos de cuantización | int8 simétrica por fila (escala float32 por token); el original está en float32 |
| Idiomas soportados | multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (int8 para `embeddings`, float32 para `weights`), más `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo original es un modelo de embeddings estáticos de la familia model2vec: cada token del vocabulario tiene un vector aprendido de 256 dimensiones y la representación de un texto se obtiene combinando los vectores de sus tokens (pooling), sin capas de atención ni cálculo dependiente del contexto. El repositorio no documenta el proceso de destilación ni los datos de entrenamiento del original; la model card remite a la ficha de `minishlab/potion-multilingual-128M` para los detalles de entrenamiento y los resultados MTEB. No se indica número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO, y por la naturaleza del modelo estas técnicas no aplican.

La innovación de esta copia es puramente de almacenamiento: cada fila de la tabla de embeddings se cuantiza de forma simétrica e independiente con `scale = max(|x|) / 127` y `q = round(x / scale)` acotado a [-127, 127]. Los valores int8 se guardan en el tensor `embeddings` (forma 500353 × 256) y las escalas en `weights` (float32, una por token), que las librerías multiplican de vuelta al codificar. Es la misma aritmética que `quantize_int8` de model2vec-rs. La cuantización se aplicó sobre la revisión `73908c3438cf03b6a01bcb9611d62b23d0726f08` del repositorio original y se validó con model2vec 0.10.0 y model2vec-rs 0.4.0, que leen tablas int8 de forma nativa sin paso de conversión.

## Capacidades

- Generación de embeddings de texto de 256 dimensiones para búsqueda semántica, similitud y recuperación.
- Codificación multilingüe: la model card muestra ejemplos en inglés y portugués, y el modelo base se distribuye como multilingüe.
- Ejecución en CPU sin GPU, con latencia de milisegundos por lote al no haber cómputo de transformer.
- Compatibilidad nativa con las librerías model2vec (Python) y model2vec-rs (Rust).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking ni de capacidades de agente.

## Casos de uso

- Búsqueda semántica en aplicaciones multilingües: se codifican documentos y consultas con `model.encode()` y se ordenan por similitud coseno; el modelo es adecuado porque el vector de 256 dimensiones ocupa poco espacio en un índice y la codificación en CPU es rápida.
- Deduplicación de registros: se generan embeddings de títulos o descripciones y se agrupan por umbral de similitud; la fidelidad medida frente al original (coseno mínimo 0,99994 en párrafos) permite sustituir la versión float32 sin recalibrar umbrales.
- Clasificación de texto ligera: los embeddings sirven como características de entrada para un clasificador lineal (regresión logística, SVM) en tareas de etiquetado de tickets o moderación básica.
- Despliegue en funciones serverless o contenedores: la descarga de 149 MB frente a 531 MB reduce el arranque en frío y el consumo de ancho de banda cuando el modelo se obtiene en tiempo de ejecución.
- Aplicaciones de escritorio o móviles con Rust: `model2vec-rs` carga la tabla int8 directamente, lo que permite búsqueda semántica local sin servicio externo ni GPU.
- Filtrado previo en pipelines RAG: se usa como primera etapa de recuperación barata sobre un corpus grande y se reserva un modelo de embeddings mayor o un reranker para la segunda etapa.
- Búsqueda en catálogos de productos o documentación técnica en varios idiomas, donde el coste por consulta en CPU debe ser mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la información disponible para esta copia. La model card incluye únicamente una comprobación de fidelidad frente al original, que el propio autor describe como sanity check y no como benchmark:

| Métrica | Párrafos (2.477, 22 artículos de Wikipedia en inglés) | Consultas (76, portugués e inglés; 72 distintas) |
|---|---|---|
| Similitud coseno con el original, mínimo | 0,99994 | 0,99983 |
| Similitud coseno con el original, media | 0,99998 | 0,99996 |
| Mismo primer resultado de recuperación | no medido | 97,4 % de las consultas |
| Solapamiento medio del top 10 | no medido | 98,8 % |

Para resultados MTEB y detalles de entrenamiento, la model card remite a la ficha del modelo original.

## Requisitos de hardware

- VRAM: no requiere GPU; está pensado para inferencia en CPU.
- Memoria RAM: el fichero de pesos ocupa 130.091.948 bytes (unos 124 MiB) y el tokenizador 18.616.131 bytes (unos 17,8 MiB); el consumo en memoria es del orden de unos pocos cientos de MB incluyendo el runtime.
- GPU recomendadas: no aplica; cualquier GPU sería innecesaria para esta carga.
- GPU de consumo: no aplica; el modelo cabe y se ejecuta en CPU de portátil o de servidor modesto.
- Opciones de despliegue: `model2vec` (Python, probado con 0.10.0) y `model2vec-rs` (Rust, probado con 0.4.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; al no haber cómputo de transformer, la latencia está dominada por la tokenización y el pooling.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Contexto | Formato y tamaño de pesos | Licencia | Notas |
|---|---|---|---|---|---|---|
| `soubruno/potion-multilingual-128M-int8` | 128.590.721 | 256 | no aplica | safetensors int8, 130.091.948 bytes | MIT | Copia cuantizada del original; fidelidad medida frente a él |
| `minishlab/potion-multilingual-128M` | 128.590.721 | 256 | no aplica | safetensors float32, 512.361.560 bytes | MIT | Original; referencia para MTEB y entrenamiento |
| Otros modelos de embeddings multilingües de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

La comparación relevante es con el modelo base: misma arquitectura, mismo vocabulario, mismo tokenizador y misma dimensión, con un cuarto del tamaño de descarga y una pérdida de fidelidad medida inferior al 0,02 % en similitud coseno.

## Limitaciones y advertencias

- Al ser embeddings estáticos, no modela el contexto: el mismo token recibe el mismo vector con independencia de la frase, lo que limita la precisión en tareas que dependen del orden o de la desambiguación semántica.
- La cuantización introduce un error pequeño pero no nulo: la similitud coseno frente al original baja hasta 0,99983 en el peor caso medido y el primer resultado de recuperación difiere en el 2,6 % de las consultas de la prueba.
- La comprobación de fidelidad se hizo sobre un conjunto reducido (2.477 párrafos en inglés y 76 consultas en portugués e inglés); no cubre otros idiomas ni dominios especializados.
- No se han publicado resultados MTEB para esta copia; para evaluar calidad en una tarea concreta hay que remitirse al modelo original o medir sobre el propio corpus.
- Riesgo de sesgos: no documentado en la información disponible; al heredar la tabla del original, reproduce los sesgos presentes en sus datos de entrenamiento, que tampoco se detallan.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la recuperación puede devolver resultados poco relevantes si el corpus y las consultas no comparten vocabulario o idioma.
- Licencia MIT, la misma que el original: permite uso comercial y modificación, manteniendo el aviso de copyright. El autor pide citar el modelo original de MinishLab.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no está avalado por MinishLab; conviene verificar los checksums SHA-256 publicados antes de usarlo en producción.
- No es un modelo de lenguaje: no debe emplearse para generación, razonamiento, código ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/soubruno/potion-multilingual-128M-int8
- Modelo original: https://huggingface.co/minishlab/potion-multilingual-128M
- Librería model2vec (Python): https://github.com/MinishLab/model2vec
- Librería model2vec-rs (Rust): https://github.com/MinishLab/model2vec-rs
- Organización MinishLab en GitHub: https://github.com/MinishLab
