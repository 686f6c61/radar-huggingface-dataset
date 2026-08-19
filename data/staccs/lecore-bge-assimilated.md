# staccs/lecore-bge-assimilated

## Resumen

`staccs/lecore-bge-assimilated` es un modelo de embeddings basado en `BAAI/bge-base-en-v1.5`, un encoder BERT de 109 millones de parámetros especializado en representaciones densas de texto. El autor, `staccs`, lo ha sometido a un proceso propio de "asimilación y requantización presupuestada" que combina un filtro espectral de Marchenko-Pastur con una asignación de bits por tensor, buscando reducir el tamaño del modelo sin sacrificar calidad. El resultado es un contenedor de pesos en fp32 de 438 MB cuyos valores están alineados a una rejilla de cuantización heterogénea de entre 3 y 8 bits por tensor, con una media de 7,62 bits por peso.

La relevancia de este modelo radica en que demuestra que es posible comprimir un encoder de embeddings bien entrenado sin pérdidas significativas de rendimiento: las métricas de retrieval en varios benchmarks (SciFact, NFCorpus, ArguAna, SCIDOCS) se mantienen prácticamente idénticas al modelo original, y la prueba de recuperación con solapamiento léxico nulo (NIAH) da resultados idénticos. Sin embargo, el autor advierte de que la compresión no acelera la inferencia en CPU y que el tamaño real solo se aprovecharía con un runtime empaquetado (p. ej. GGUF), que no se incluye en este repositorio.

Se distribuye bajo licencia MIT, con formato de pesos safetensors, y está diseñado para su uso con la librería `sentence-transformers` o con `text-embeddings-inference`. Está orientado a tareas de extracción de características (feature extraction) y búsqueda semántica, no a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) derivado de BAAI/bge-base-en-v1.5 |
| Parametros totales | 109.482.752 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp32 dequantizado (rejilla de cuantizacion heterogenea de 3-8 bits por tensor, media 7,62 bits/peso) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32 dequantizado); se menciona ONNX en las etiquetas pero no se confirma su inclusion |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base, el mismo que usa `BAAI/bge-base-en-v1.5`, con 12 capas, 768 dimensiones de ocultacion y 12 cabezas de atencion. No se proporcionan datos sobre el entrenamiento original (tokens, dataset, fases de RLHF o DPO), ya que la model card se centra exclusivamente en el proceso de post-procesado aplicado por `staccs`.

Ese proceso, denominado "asimilacion + requantizacion presupuestada", consta de dos pasos:

1. **Filtro espectral de Marchenko-Pastur**: se aplica a las matrices de pesos para eliminar componentes de ruido. En este caso, el filtro no actuo sobre ninguna capa (0 de 73 capas filtradas), lo que indica que el encoder original ya estaba bien entrenado y no presentaba colas pesadas significativas.
2. **Requantizacion por tensor con presupuesto**: se asigna un numero de bits por tensor (3, 4, 5, 6 u 8) de forma que la similitud coseno media de los embeddings generados respecto al modelo original sea mayor o igual a 0,99, evaluada con un grupo de 64 muestras. El resultado fue una media de 7,62 bits por peso, con una distribucion de 15 tensores a 3 bits, 4 a 4 bits, 9 a 5 bits, 14 a 6 bits, 20 a 8 bits y 11 tensores mantenidos en fp32.

El repositorio distribuye los pesos en un contenedor fp32 de 438 MB, pero con los valores "encajados" en la rejilla de cuantizacion, de modo que el modelo puede cargarse en cualquier entorno que soporte bge-base. El tamaño empaquetado estimado seria de unos 132 MB, pero para aprovecharlo en inferencia seria necesario un runtime empaquetado como GGUF, que no se incluye.

## Capacidades

- Generacion de embeddings densos de texto para busqueda semantica, similitud coseno y recuperacion de informacion.
- Extraccion de caracteristicas (feature extraction) compatible con la libreria `sentence-transformers`.
- Inferencia determinista: los resultados en CPU son bit-identicos a los de GPU, lo que facilita la reproducibilidad.
- Soporte para despliegue con `text-embeddings-inference` (TEI), segun las etiquetas del repositorio.
- No es un modelo generativo: no produce texto, ni codigo, ni respuestas conversacionales.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues; el modelo base bge-base-en-v1.5 esta orientado al ingles, pero no se confirma en la informacion proporcionada.

## Casos de uso

- **Busqueda semantica en corpus documentales**: el modelo puede indexar documentos y consultas en un espacio vectorial, permitiendo recuperar pasajes relevantes por similitud coseno. Es adecuado para motores de busqueda internos o asistentes de conocimiento.
- **Sistemas de recuperacion aumentada (RAG)**: como encoder de pasajes y consultas, puede integrarse en pipelines de RAG para seleccionar fragmentos de contexto antes de pasarlos a un LLM generativo. Su baja degradacion en benchmarks de retrieval (p. ej. SciFact nDCG@10 de 0,7388) lo hace fiable para esta tarea.
- **Clasificacion de textos por similitud**: permite agrupar documentos por cercania semantica, util para moderacion de contenido, deteccion de duplicados o categorizacion automatica de tickets de soporte.
- **Clustering de documentos**: con los embeddings generados se pueden aplicar algoritmos de agrupamiento (k-means, HDBSCAN) para organizar grandes volumenes de texto, como articulos cientificos o noticias.
- **Sistemas de recomendacion basados en contenido**: al representar items textuales (productos, articulos, entradas de blog) como vectores, se pueden sugerir elementos similares al usuario segun su historial o preferencias expresadas en texto.
- **Deduplicacion de registros**: en bases de datos con entradas de texto libre, el modelo puede identificar registros que se refieren a la misma entidad aunque usen formulaciones distintas, gracias a su robustez ante variaciones lexicas (NIAH recall@64 de 0,8464 con solapamiento nulo).

## Benchmarks y rendimiento

La model card proporciona resultados de calidad en tareas de retrieval, comparados con el modelo base `BAAI/bge-base-en-v1.5` completo:

| Benchmark | lecore-bge-assimilated | bge-base-en-v1.5 (completo) |
|---|---|---|
| SciFact nDCG@10 | 0,7388 | 0,7404 |
| NFCorpus | 0,3716 | 0,3735 |
| ArguAna | 0,6375 | 0,6375 |
| SCIDOCS | 0,2152 | 0,2172 |
| NIAH recall@64 (solapamiento lexico nulo) | 0,8464 | 0,8464 |

La degradacion maxima observada es de 0,002 puntos (SCIDOCS), y en ArguAna y NIAH los resultados son identicos. No se proporcionan benchmarks de generacion, razonamiento o codigo porque el modelo no es generativo.

## Requisitos de hardware

- **VRAM estimada**: el modelo en fp32 ocupa 438 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. En cuantizacion uniforme de 4 bits ocuparia unos 93 MB, aunque ese formato no se distribuye en este repositorio.
- **GPU recomendadas**: cualquier GPU moderna, incluidas NVIDIA T4, RTX 3060, RTX 4090, A10, A100, etc. No requiere hardware especial.
- **CPU**: es viable en CPU. La model card reporta una latencia de 27-31 ms por consulta en batch de 1 con 8 hilos de CPU, a ritmo normal de bge-base.
- **Opciones de despliegue**: `sentence-transformers` (Python), `text-embeddings-inference` (TEI) para servicios HTTP, y potencialmente ONNX Runtime si se exporta el modelo. No se incluyen archivos GGUF, por lo que no es directamente compatible con `llama.cpp` u `Ollama` sin una conversion adicional.
- **Throughput**: no se especifica un numero de consultas por segundo, pero la latencia por consulta en CPU (27-31 ms) sugiere un rendimiento de decenas de consultas por segundo en un solo hilo, escalable con batching y GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (SciFact nDCG@10) | Licencia | Formato |
|---|---|---|---|---|---|
| lecore-bge-assimilated | 109,48 M | no disponible | 0,7388 | MIT | safetensors (fp32) |
| BAAI/bge-base-en-v1.5 | 109,48 M | 512 (tipico de BERT base) | 0,7404 | MIT | safetensors |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 | no disponible | Apache-2.0 | safetensors, ONNX, etc. |

La comparativa se limita a modelos de embeddings de tamano similar. El modelo asimilado es practicamente identico a su base en calidad, con la ventaja de que sus pesos estan alineados a una rejilla de cuantizacion que podria explotarse en un runtime empaquetado. Frente a alternativas mas pequenas como MiniLM, ofrece mayor capacidad de representacion, aunque a costa de un mayor tamano.

## Limitaciones y advertencias

- **Degradacion leve en algunas tareas**: aunque minima, hay una caida de 0,002 puntos en SCIDOCS y 0,001 en SciFact y NFCorpus respecto al modelo base. Para aplicaciones donde cada centesima cuente, conviene evaluar si esta diferencia es aceptable.
- **La cuantizacion no acelera la inferencia**: el repositorio distribuye pesos fp32 dequantizados, por lo que el tamaño reducido (132 MB empaquetado) no se refleja en velocidad ni en memoria durante la inferencia. Para aprovecharlo, habria que generar un runtime empaquetado (p. ej. GGUF) a partir de la rejilla de cuantizacion, lo cual no se incluye.
- **Sin soporte de generacion de texto**: es exclusivamente un encoder de embeddings. No puede usarse para chat, completado de texto ni tareas generativas.
- **Idioma**: no se especifica en la informacion proporcionada; el modelo base bge-base-en-v1.5 esta orientado al ingles, por lo que su rendimiento en otros idiomas es incierto.
- **Riesgo de sesgos**: al ser un modelo derivado de BERT, puede heredar sesgos presentes en sus datos de entrenamiento, aunque no se documentan evaluaciones de sesgo en la model card.
- **Alucinaciones**: no aplica, al no generar texto.
- **Restricciones de licencia**: la licencia MIT permite uso comercial y modificacion sin restricciones significativas, pero el usuario debe verificar que el modelo base (BAAI/bge-base-en-v1.5) tambien es MIT, lo cual es cierto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/staccs/lecore-bge-assimilated
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Documentacion del metodo y benchmarks completos: https://benches.openzoo.fun
