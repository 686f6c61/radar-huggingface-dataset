# Thunderboltdy10/ixos-documents

## Resumen

Ixos Documents es un artefacto de embeddings estaticos publicado por el usuario Thunderboltdy10 en HuggingFace, derivado del modelo minishlab/potion-retrieval-32M de MinishLab (licencia MIT, revision upstream fijada en `6fc8051fab2a1e0ee76689cf08c853792ac285e7`). No es un modelo entrenado desde cero ni un transformer generativo: es una transformacion de almacenamiento de las filas de vocabulario del modelo base, que pasan de peso en coma flotante a int8 simetrico con una escala float32 por fila.

El modelo resuelve recuperacion (retrieval) de documentos sobre CPU, sin GPU y sin conexion a red. Su proposito es servir como runtime de Ixos, un motor de busqueda local escrito en Rust que descarga los ficheros, verifica sus hashes SHA-256 y hace el pooling en float32 sobre la CPU. Se instala con `ixos model install documents`.

Es relevante para desarrolladores que necesitan busqueda semantica embebible y de bajo coste en entornos sin acelerador. Sus limitaciones principales son el alcance: solo ingles, 512 dimensiones por token, cero descargas y cero likes en el momento de la ficha, y la ausencia de un pipeline Transformers de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (model2vec / static-embeddings); sin capas de atencion ni transformer |
| Parametros totales | no disponible (el modelo base upstream se denomina potion-retrieval-32M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no hay ventana de atencion; la entrada se tokeniza y se agrupa (pooling) en float32 |
| Tipos de cuantizacion | int8 simetrico por fila (escala float32 por fila = max(abs(fila))/127, redondeo a par mas cercano, recorte a [-127, 127]); decodificacion y pooling en float32, no hay inferencia entera |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors: tensor `embeddings` (int8) y tensor `weights` (escalas float32); tokenizer y ficheros de configuracion sin cambios |
| Dimensionalidad de los embeddings | 512 |
| Tamano del repositorio | 0,0 GB (redondeado segun HuggingFace) |

## Arquitectura y entrenamiento

No se realizo entrenamiento ni destilacion en este repositorio: la model card lo describe explicitamente como una transformacion de almacenamiento. Cada fila de vocabulario del modelo base (512 dimensiones) se cuantiza a int8 simetrico, guardando como escala el maximo valor absoluto de la fila dividido entre 127 (o 1 en filas de todo ceros). El peso por token del modelo upstream multiplica la escala de la fila. Los ficheros del tokenizer y de configuracion se mantienen identicos a los del modelo original.

La inferencia no usa kernels enteros: el cargador escrito en Rust decodifica las filas utilizadas y hace el pooling en float32 sobre CPU. El modelo base, minishlab/potion-retrieval-32M, es un modelo de embeddings estaticos de tipo Model2Vec orientado a recuperacion, citado en las etiquetas del repositorio como `model2vec`, `static-embeddings` y `retrieval`; los detalles de su entrenamiento original no se reproducen en la informacion disponible, aunque el repositorio incluye un fichero `UPSTREAM_MODEL_CARD.md` con la autoria, licencia y detalles de entrenamiento originales. La reproducibilidad se cubre con `python scripts/models.py build`, que regenera los ficheros y permite verificar los hashes contra la tabla del instalador de Rust.

## Capacidades

- Generacion de embeddings de documentos y consultas para busqueda semantica por similitud (tipicamente coseno).
- Recuperacion de pasajes y documentos en ingles, con pooling sobre las filas de tokens decodificadas en float32.
- Ejecucion en CPU sin GPU, con ficheros almacenados fuera del ejecutable y reutilizados en modo offline.
- Verificacion de integridad mediante SHA-256 en el momento de la instalacion, con revision upstream fijada.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Multilingue: no; la model card declara unicamente `en`.
- No expone un pipeline Transformers de proposito general, por lo que no hay API de `sentence-transformers` ni de `transformers` en este repositorio.

## Casos de uso

- Busqueda semantica local con Ixos: el usuario ejecuta `ixos model install documents`, Ixos descarga los tres ficheros de runtime en la revision fijada, verifica sus hashes y los carga con su cargador Rust; es el caso de uso para el que el artefacto fue publicado.
- Recuperacion para RAG sin GPU: indexar fragmentos de documentacion en ingles y recuperar los top-k por similitud antes de pasarlos a un LLM, evitando el coste de un encoder transformer en cada consulta.
- Generacion de candidatos antes de un reranker: usar los embeddings estaticos como primera etapa de alto recall y bajo coste, y reservar un cross-encoder mas caro para reordenar solo ese subconjunto.
- Deduplicacion y agrupacion de documentos: calcular similitudes por pares o clustering sobre las representaciones de 512 dimensiones para detectar contenido repetido en un corpus.
- Despliegue air-gapped o en edge: al almacenarse los pesos fuera del binario y reutilizarse offline, encaja en entornos sin salida a internet ni aceleradores, incluidos contenedores de CI.
- Clasificacion ligera por similitud con prototipos: comparar cada documento contra embeddings de referencia por categoria para etiquetado o enrutado previo.
- Indexado masivo de corpus documentales en CPU: la ausencia de capas transformer reduce el coste por documento, lo que permite procesar volumenes grandes en hardware convencional.
- Privacidad por diseno: los documentos y las consultas no salen de la maquina, al ejecutarse todo el calculo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de recuperacion (por ejemplo MTEB, BEIR o nDCG) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM: no aplica; el artefacto esta disenado para ejecucion en CPU.
- GPU recomendadas: no aplica (no se documenta soporte de GPU).
- GPU de consumo: irrelevante para este modelo; no necesita ninguna.
- CPU: el cargador Rust decodifica las filas usadas y hace el pooling en float32 sobre la CPU.
- Memoria RAM: no disponible en la informacion proporcionada.
- Almacenamiento: repositorio reportado como 0,0 GB, mas los tres ficheros de runtime que descarga el instalador.
- Opciones de despliegue: unicamente mediante Ixos (`ixos model install documents`) con su cargador Rust; no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni pipelines Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thunderboltdy10/ixos-documents | no disponible | no aplica (embeddings estaticos) | no disponible | MIT | HuggingFace; runtime especifico para Ixos |
| minishlab/potion-retrieval-32M (base) | no disponible en la informacion proporcionada | no aplica (embeddings estaticos) | no disponible | MIT | HuggingFace |
| Otros modelos de embeddings estaticos tipo model2vec | no disponible | no aplica (embeddings estaticos) | no disponible | no disponible | HuggingFace |

No se dispone de cifras de benchmarks de ninguno de los modelos listados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La diferencia verificable frente al modelo base es el formato de almacenamiento: int8 con escalas float32 por fila en este repositorio, frente a los pesos originales del upstream.

## Limitaciones y advertencias

- Idiomas: solo ingles segun la model card; no hay soporte declarado de castellano ni de otros idiomas.
- No es un modelo generativo: no produce texto, codigo ni respuestas; solo representaciones vectoriales.
- Cuantizacion con perdida: las filas se redondean a int8 con recorte a [-127, 127], de modo que las representaciones no son identicas a las del modelo base, aunque el pooling posterior se haga en float32.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de evaluacion independiente reportada.
- Riesgo de recuperacion irrelevante: como cualquier recuperador, puede devolver documentos semanticamente proximos pero incorrectos; no hay estimaciones publicadas de precision o recall para este artefacto.
- Acoplamiento al runtime: la model card indica que este repositorio no ofrece un pipeline Transformers de proposito general, por lo que no es portable directamente a otras pilas de inferencia sin trabajo adicional.
- Dependencia de revisiones fijadas: la instalacion esta atada a una revision upstream concreta y a hashes SHA-256, de modo que cualquier cambio de esos ficheros rompe la verificacion.
- El aviso de alucinacion clasico de los LLM no aplica del mismo modo, pero si el riesgo de falsos positivos en la recuperacion cuando el sistema final los presenta como evidencia.
- Licencia MIT: permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright; el modelo base upstream tambien se distribuye bajo MIT segun la model card.
- Sin datos publicos sobre sesgos del corpus de entrenamiento original, latencia, throughput ni consumo de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thunderboltdy10/ixos-documents
- Modelo base: https://huggingface.co/minishlab/potion-retrieval-32M
- Repositorio de Ixos: https://github.com/Thunderboltdy-10/ixos
- Revision upstream fijada: `6fc8051fab2a1e0ee76689cf08c853792ac285e7`
- Fichero incluido con la model card original: `UPSTREAM_MODEL_CARD.md`
- Script de reproduccion: `python scripts/models.py build`
