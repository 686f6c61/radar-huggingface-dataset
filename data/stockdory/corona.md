# StockDory/Corona

## Resumen

Corona es un modelo publicado en Hugging Face por el usuario StockDory, cuya model card describe una arquitectura de red neuronal muy reducida: dos capas lineales con una configuración dimensional de (768→768)x2→1. Según la documentación del autor, la primera capa (L1) transforma un vector de 768 dimensiones en otro de 768 dimensiones, y la segunda capa (L2) recibe la salida duplicada de L1 y la reduce a un único valor escalar. La activación declarada para L1 es `crelu^2`.

La información disponible es extremadamente escasa: no se especifica la finalidad del modelo, el tipo de pipeline, los datos de entrenamiento ni las métricas de rendimiento. El repositorio tiene un tamaño de 0.0 GB en el momento de la ficha, lo que sugiere que los pesos no están publicados o que el modelo es un esqueleto arquitectural en fase inicial. Por su estructura (entrada de 768 dimensiones, típica de embeddings tipo BERT-small, y salida escalar), podría tratarse de una cabeza de clasificación o regresión sobre embeddings, pero esto es una hipótesis no confirmada por el autor.

Su relevancia práctica actual es limitada: con 0 descargas, un solo like y sin pesos visibles, Corona parece un proyecto experimental o en desarrollo. Su interés principal radica en la licencia AGPL-3.0, poco habitual en modelos de Hugging Face, que impone obligaciones de código fuente derivado en caso de uso como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red densa de 2 capas: (768→768)x2→1 |
| Parametros totales | no disponible (estimable en ~1,2 M si se compone de capas lineales 768→768 y 1536→1, pero no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (tamano del repositorio: 0.0 GB) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de dos niveles. L1 es una transformación lineal de 768 a 768 dimensiones con activación `crelu^2`, es decir, la función CReLU (concatenación de ReLU positivo y ReLU negativo) elevada al cuadrado. L2 toma la salida de L1 duplicada (de ahí la notación (L1)x2→1, que sugiere una entrada de 1536 dimensiones, coherente con la duplicación que produce CReLU) y la proyecta a un único valor escalar. Este patrón es consistente con una cabeza de puntuación, clasificación binaria o regresión aplicada sobre representaciones de 768 dimensiones, un tamaño habitual en codificadores ligeros del estilo de BERT-mini o similares.

No hay informacion sobre el entrenamiento: se desconocen el numero de tokens o muestras, la composicion del dataset, el uso de RLHF/DPO (improbable dada la escala) y el optimizador empleado. Tampoco se documenta si el modelo incluye un codificador base del que dependa o si opera sobre embeddings externos.

## Capacidades

- Salida escalar a partir de un vector de entrada de 768 dimensiones, compatible con tareas de puntuacion, ranking o clasificacion binaria sobre embeddings.
- Uso de activacion CReLU al cuadrado, que preserva informacion de signo y puede capturar relaciones de antisimetria (util, por ejemplo, en puntuacion de similitud dirigida).
- No hay evidencia de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No hay informacion sobre soporte de agentes, multi-step reasoning ni capacidades multilingues.

## Casos de uso

- Cabeza de scoring sobre embeddings: dado que la entrada es de 768 dimensiones, el modelo puede conectarse a un codificador de frases para producir puntuaciones de relevancia o similitud en sistemas de recuperacion (RAG).
- Reordenacion (reranking) ligera: su tamano minimo lo haria adecuado para reordenar candidatos en un pipeline de busqueda semantica con latencia minima, aunque esto requiere confirmacion del autor.
- Clasificacion binaria de representaciones: la salida escalar puede umbralizarse para tareas como deteccion de duplicados o filtrado de contenido.
- Componente de un modelo mayor: la estructura de cabeza sugiere uso como modulo adjunto a un encoder preentrenado, por ejemplo en aprendizaje por pares o metric learning.
- Experimentacion con activaciones: la eleccion de `crelu^2` hace del repositorio un ejemplo practico para investigar activaciones no estandar.
- Base para estudio de licenciamiento AGPL: resulta util como caso de analisis de las implicaciones de la AGPL-3.0 en despliegue de modelos como servicio.

Dada la ausencia de pesos publicados y de documentacion, todos estos casos son potenciales y no verificados en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con una arquitectura de aproximadamente 1-1,5 millones de parametros, el modelo ocuparia unos pocos megabytes en FP32; cualquier GPU moderna o incluso CPU es mas que suficiente. No hay cifras oficiales.
- GPU recomendadas: no disponible; por escala, no se requiere GPU dedicada.
- Consumer GPU: cabe con holgura en cualquier GPU consumer actual (incluso integradas), si los pesos llegan a publicarse.
- Opciones de despliegue: al no haber pesos en el repositorio (0.0 GB), no es desplegable actualmente con vLLM, llama.cpp, Ollama ni TGI. Si se publicaran como safetensors o PyTorch, bastaria con PyTorch o ONNX Runtime por tratarse de capas densas estandar.
- Latencia y throughput: no disponible; por arquitectura, la inferencia seria de microsegundos a milisegundos por muestra.

## Comparativa con modelos similares

No hay categoria de modelos directamente comparable confirmada, ya que la funcion del modelo no esta documentada. Como referencia orientativa de cabezas/scorers sobre embeddings de 768 dimensiones:

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Corona (StockDory) | Red densa 768→768→escalar | ~1-1,5 M (estimado, no confirmado) | AGPL-3.0 | Pesos no publicados (0.0 GB) |
| Cross-encoders de sentence-transformers (p. ej. ms-marco-MiniLM) | Transformer cross-encoder | ~22-33 M | Apache-2.0 | Pesos publicados, uso extendido |
| Cabezas de clasificacion de BERT | Capa lineal sobre encoder | <1 M (solo cabeza) | Apache-2.0 (BERT) | Requieren encoder base |

Esta comparativa es orientativa: Corona no ha publicado evaluaciones que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Documentacion minima: la model card solo describe la arquitectura; no hay informacion sobre datos de entrenamiento, uso previsto ni evaluaciones, lo que impide validar el modelo.
- Pesos aparentemente no publicados: el repositorio pesa 0.0 GB, por lo que el modelo no puede descargarse ni ejecutarse en su estado actual.
- Riesgo de alucinacion: no aplicable al no ser un modelo generativo, pero si se usa como scorer, los resultados serian impredecibles sin conocer los datos de entrenamiento.
- Sesgos: no documentados; sin dataset conocido, no es posible evaluar sesgos.
- Licencia AGPL-3.0: es una licencia de copyleft fuerte. Si se integra el modelo en un servicio de red, la AGPL exige ofrecer el codigo fuente de la aplicacion derivada, incluidos los cambios. Esto es una restriccion importante frente a licencias permisivas (Apache-2.0, MIT) y puede ser incompatible con politicas corporativas habituales.
- Idiomas: no disponibles; sin saber si opera sobre texto, embeddings o datos de otro tipo, el alcance multilingue es indeterminado.
- Contexto: no disponible; la entrada fija de 768 dimensiones limita su uso a representaciones de ese tamano exacto.

## Enlaces

- Hugging Face: https://huggingface.co/StockDory/Corona
- Paper, repositorio de codigo, demo u otros enlaces: no disponibles en la informacion proporcionada.
