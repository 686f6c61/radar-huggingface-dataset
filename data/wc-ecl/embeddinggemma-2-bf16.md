# WC-ECL/embeddinggemma-2-bf16

## Resumen

`WC-ECL/embeddinggemma-2-bf16` es un espejo (mirror) de los pesos oficiales en BF16 del modelo `google/embeddinggemma-2`, publicado por el usuario WC-ECL para la aplicación FaceNest. No es un modelo nuevo ni un fine-tuning: es una copia bit a bit de una revision concreta del repositorio upstream (revision `914f7f89142e33e77833254d9c9b90c3cef7303b`), con los 13 ficheros que la aplicación carga para busqueda semantica (texto→imagen e imagen→imagen). El repositorio ocupa 1,5 GB y contiene 744.371.512 parametros en `model.safetensors` (1.488.915.288 bytes).

El proposito declarado del espejo es la reproducibilidad: el repositorio ONNX upstream es mantenido por la comunidad y puede ser recuantizado, re-subido o eliminado sin aviso, de modo que FaceNest fija una revision y sirve una copia estable para que una build de la app nunca reciba pesos distintos de aquellos con los que se calibraron sus umbrales.

Es relevante ahora como ejemplo de practica de fijado de artefactos (pin + verificacion SHA-256) en pipelines de recuperacion semantica, y como alternativa de despliegue en precision BF16 sobre Apple Silicon (PyTorch + MPS), ya que la model card advierte explicitamente contra el uso de FP16. La licencia es Apache-2.0, sin terminos adicionales respecto al upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de libreria: `embedding_gemma2`; modelo de embeddings derivado de la familia Gemma segun el repositorio upstream) |
| Parametros totales | 744.371.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos oficiales). FP16 desaconsejado por la model card; se requiere bf16/fp32. No se incluyen pesos GGUF ni ONNX en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1.488.915.288 bytes), mas tokenizer SentencePiece (`tokenizer.model`, `tokenizer.json`) y configuracion de Sentence Transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO). El unico dato estructural fiable es el tag de HuggingFace `embedding_gemma2`, que situa el modelo en la familia de embeddings de Gemma, y el propio nombre del repositorio upstream (`google/embeddinggemma-2`). El repositorio incluye los modulos `1_Pooling/config.json` y `2_Normalize/config.json`, junto con `modules.json` y `config_sentence_transformers.json`, lo que indica una canalizacion estandar de Sentence Transformers: codificacion, pooling y normalizacion de los vectores resultantes. Tambien incluye `preprocessor_config.json` y `processor_config.json`, coherentes con el uso multimodal (texto→imagen e imagen→imagen) descrito por la aplicacion que lo consume.

La innovacion destacable de este repositorio no es arquitectonica sino de ingenieria de suministro: cada fichero de pesos es una copia no modificada del objeto upstream, y su SHA-256 coincide con el registrado en los metadatos LFS del repositorio de origen (verificado el 2026-10-15). Ademas, se anade un `chat_template.jinja` (1.016 bytes) que no es habitual en un modelo puramente de embeddings. No hay informacion disponible sobre tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion (retrieval).
- Busqueda semantica texto→imagen e imagen→imagen segun el caso de uso declarado por FaceNest.
- Normalizacion y pooling de embeddings integrados en la canalizacion de Sentence Transformers.
- Compatibilidad con el ecosistema `transformers` y `sentence-transformers` (configuraciones incluidas en el repositorio).
- Ejecucion en precision BF16 sobre Apple Silicon mediante PyTorch + MPS.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica a un modelo de embeddings; no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas. La presencia de `preprocessor_config.json` y `processor_config.json` es consistente con procesamiento multimodal, pero no se detalla en la informacion disponible.

## Casos de uso

- Busqueda semantica en aplicaciones de escritorio: el modelo genera embeddings normalizados que permiten indexar y consultar un corpus local por similitud coseno, integrándose en una app macOS mediante PyTorch + MPS en BF16.
- Recuperacion texto→imagen en bibliotecas de fotos: el usuario describe una escena en lenguaje natural y el sistema recupera las imagenes cuyo embedding es mas proximo, usando la canalizacion de pooling y normalizacion incluida.
- Deduplicacion y agrupacion de contenido: los vectores permiten detectar elementos casi duplicados en un catalogo mediante umbrales de distancia calibrados, que es precisamente el escenario que motiva el fijado de la revision en este espejo.
- Filtrado de contenido y moderacion asistida: comparar embeddings de nuevas entradas contra un conjunto de referencia etiquetado para marcar contenido proximo a categorias conocidas.
- Backend de recomendacion por similitud: construir un indice vectorial de articulos y devolver los mas similares al embedding de un elemento consultado, sin necesidad de entrenamiento adicional.
- Pipelines de RAG (retrieval-augmented generation) sobre documentacion interna: el modelo actua como recuperador, y los fragmentos devueltos se pasan a un LLM generador independiente.
- Reproducibilidad en CI/CD de aplicaciones ML: al ser un espejo con SHA-256 verificados, permite que los tests de regresion comparen resultados contra un artefacto inmutable en lugar de contra un repositorio comunitario cambiante.
- Despliegue local con requisitos de privacidad: al ejecutarse en el equipo del usuario (Apple Silicon) sin llamadas a servicios externos, es apto para corpus que no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MTEB, MMLU, HumanEval ni metricas de recuperacion (recall@k, nDCG), y los resultados de busqueda web consultados no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB solo para los pesos en BF16; en la practica conviene reservar entre 2 GB y 3 GB contando activaciones y el indice de embeddings.
- En FP32 los pesos ocuparian en torno a 3,0 GB (744 M de parametros x 4 bytes), pero la model card recomienda bf16/fp32, no fp16.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente; tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o superiores no suponen cuello de botella por memoria.
- Cabe en GPU de consumo: si, con amplio margen. El escenario objetivo declarado es Apple Silicon con PyTorch + MPS en BF16.
- Opciones de despliegue: `transformers` y `sentence-transformers` (ambos con ficheros de configuracion presentes en el repositorio); PyTorch con backend MPS en macOS; ONNX Runtime es plausible dado que el autor menciona un repositorio ONNX upstream, pero no se incluyen ficheros ONNX en este espejo. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son utilizables con este repositorio tal cual. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `WC-ECL/embeddinggemma-2-bf16` | 744.371.512 | no disponible | Apache-2.0 | HuggingFace, 13 ficheros, 1,5 GB | Espejo BF16 de 744 M de parametros; pesos verificados por SHA-256 |
| `google/embeddinggemma-2` (upstream) | no disponible | no disponible | Apache-2.0 | HuggingFace | Repositorio de origen; revision fijada `914f7f89142e33e77833254d9c9b90c3cef7303b`; pesos identicos |

No se dispone de datos verificables sobre otros modelos comparables (parametros, contexto, rendimiento o licencia) en la informacion proporcionada, por lo que la comparacion con alternativas de la misma categoria se considera no disponible.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, robustez ni equidad para este modelo o su upstream en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo produce vectores, no texto), pero los umbrales de similitud mal calibrados pueden devolver resultados irrelevantes o falsos positivos en recuperacion.
- No se dispone de informacion sobre cobertura linguistica ni sobre el comportamiento con contextos largos; la longitud de contexto es desconocida.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se documenten los cambios. El espejo no anade terminos adicionales, pero el autor no asume responsabilidad sobre el contenido upstream.
- La model card advierte explicitamente contra el uso de FP16 y exige bf16/fp32; usar FP16 puede degradar la calidad de los embeddings sin aviso.
- El repositorio es un subconjunto del upstream: solo contiene los ficheros que carga FaceNest. No incluye pesos ONNX, GGUF ni artefactos de despliegue para otras plataformas.
- La estabilidad del espejo depende de un unico mantenedor (WC-ECL). Cuenta con 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion de la comunidad.
- Dependencia de la revision upstream: si esta cambia, el espejo queda desalineado respecto al modelo de origen, aunque los SHA-256 publicados permiten verificar la integridad de lo ya descargado.
- Las fechas de creacion y actualizacion del repositorio (2026-10-14 y 2026-10-22) son posteriores a la fecha de consulta habitual de muchos entornos; conviene verificar la coherencia temporal antes de integrarlo en un pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WC-ECL/embeddinggemma-2-bf16
- Repositorio upstream (modelo base): https://huggingface.co/google/embeddinggemma-2
- Revision upstream fijada: `914f7f89142e33e77833254d9c9b90c3cef7303b`
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos corresponden a un dominio distinto sin relacion con IA.
