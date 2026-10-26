# zils-ai/z3-mini-node-2-candidates

## Resumen

zils-ai/z3-mini-node-2-candidates es un repositorio de pesos publicado por el usuario zils-ai en HuggingFace, con 4.539.265.536 parametros totales (aproximadamente 4,54 mil millones) verificados a partir de los ficheros safetensors. El tag de arquitectura declarado es `qwen3_5`, acompanado de `custom_code`, lo que indica que la carga del modelo requiere codigo personalizado incluido en el repositorio y que la implementacion no es la estandar de `transformers` para esa familia. El nombre del repositorio ("candidates") sugiere que se trata de un conjunto de checkpoints candidatos o intermedios mas que de un modelo final publicado con model card completa, si bien esta interpretacion es una inferencia a partir del nombre y no un dato confirmado.

El repositorio no incluye informacion publica sobre licencia, idiomas soportados, longitud de contexto, pipeline de uso ni resultados de evaluacion. Tampoco se han publicado datos de entrenamiento. Con 54 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de baja difusion y sin validacion externa conocida.

Su relevancia practica es limitada para produccion: es interesante como objeto de estudio de una arquitectura derivada de la familia Qwen 3.5 con codigo propio, pero carece de los elementos minimos (licencia explicita, model card, benchmarks) que un equipo necesita para adoptarlo. Cualquier evaluacion seria requiere descargar los pesos, revisar el `trust_remote_code` y ejecutar una bateria de pruebas propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 con `custom_code` (implementacion propia incluida en el repo); detalles de capas, atencion y FFN no disponibles |
| Parametros totales | 4.539.265.536 (aprox. 4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones precalculadas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 81,7 GB, compatible con `custom_code`) |

## Arquitectura y entrenamiento

La unica informacion tecnica disponible es el tag `qwen3_5` junto con `custom_code`. Esto implica que el modelo sigue la familia arquitectonica Qwen 3.5 pero con modificaciones que obligan a cargar codigo Python del propio repositorio (habitualmente mediante `trust_remote_code=True` o clonando el repo). No se dispone de informacion sobre el numero de capas, dimensiones ocultas, tipo de atencion (completa, lineal o hibrida), uso de RoPE, tamano de la FFN ni vocabulario. Tampoco se especifica si emplea atencion con ventana deslizante o algun esquema de atencion lineal.

No hay ningun dato publicado sobre el proceso de entrenamiento: numero de tokens, composicion del corpus, fases de preentrenamiento y postentrenamiento, uso de RLHF, DPO o RL con verificacion, ni tecnicas de decodificacion especulativa. El tamano del repositorio (81,7 GB) frente a los aproximadamente 9,1 GB que ocuparian los 4,54 mil millones de parametros en bf16 sugiere la presencia de multiples copias de pesos en el mismo repo (del orden de nueve), lo que es coherente con el nombre "candidates": probablemente varios checkpoints del mismo entrenamiento o varios formatos/precisiones. Esta es una deduccion a partir de los tamanos, no un dato confirmado por el autor.

## Capacidades

No se han publicado capacidades verificadas para este modelo. A partir de la pertenencia declarada a la familia Qwen 3.5 y del tamano (4,54 mil millones de parametros) cabe esperar el perfil tipico de esa clase de modelos, pero debe tratarse como hipotesis a validar:

- Generacion de texto y conversacion multi-turno (esperable en un modelo de esta familia; sin confirmar).
- Razonamiento y matematicas de nivel medio; sin datos de GSM8K ni MMLU.
- Generacion de codigo; sin datos de HumanEval ni LiveCodeBench.
- Soporte de tool calling / function calling: no confirmado.
- Comportamiento agentico y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo "thinking" o razonamiento extendido: no confirmado.
- Vision o audio: no disponible; el repo solo contiene safetensors de texto segun los tags.
- Carga mediante codigo personalizado (`custom_code`): confirmado por los tags del repositorio.

## Casos de uso

Los siguientes escenarios son razonables por el tamano y la familia del modelo, pero ninguno esta validado con el artefacto concreto. Se indican como hipotesis de partida para una evaluacion interna.

- Evaluacion de arquitecturas derivadas de Qwen 3.5: el repo permite estudiar variantes con `custom_code` y comparar comportamiento frente a los checkpoints oficiales de la familia, util para equipos de investigacion que trabajan sobre la implementacion de referencia.
- Prototipado de asistentes conversacionales en local: con 4,54 mil millones de parametros, el modelo entra en GPUs de consumo de 12-16 GB en cuantizacion de 8 bits, lo que permite montar un prototipo de chat sin coste de API.
- Generacion de codigo en entornos con requisitos de privacidad: si el modelo confirma capacidad de code completion, puede desplegarse on-premise para autocompletado en IDE sin enviar codigo a terceros. Requiere validacion previa con HumanEval o un conjunto interno.
- Clasificacion y extraccion de informacion sobre texto: ajuste fino ligero (LoRA) sobre 4,54 mil millones de parametros es viable en una sola GPU de 24 GB, adecuado para tareas de etiquetado y normalizacion de documentos.
- Experimentos de alineacion y postentrenamiento: al ser checkpoints "candidatos", sirven como material de partida para probar DPO, ORPO o RLHF a escala pequena en un unico nodo.
- Base para destilacion o merging: el tamano intermedio (4,5B) es practico como profesor pequeno o como componente en tecnicas de merge con otros modelos de la misma familia, siempre que la licencia lo permita (actualmente desconocida).
- Generacion de datos sinteticos a escala moderada: con throughput alto en una sola GPU, puede emplearse para producir corpus de entrenamiento filtrados por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones calculadas a partir de los 4,539 mil millones de parametros; no son mediciones del modelo real.

- VRAM para pesos en bf16/fp16: aproximadamente 9,1 GB solo para pesos; con cache KV y overhead de runtime, entre 11 y 14 GB segun longitud de contexto.
- VRAM en int8: aproximadamente 4,5 GB de pesos; 6-8 GB en total.
- VRAM en int4 (si se generan cuantizaciones propias con GPTQ/AWQ/bitsandbytes): aproximadamente 2,3-2,8 GB de pesos; 4-6 GB en total.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado y en RTX 4070/4080 (12-16 GB) en 8 bits. En GPUs de 8 GB solo con cuantizacion de 4 bits y contexto corto.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A6000 permiten bf16 con contextos largos y lotes grandes; una unica A100 40 GB es suficiente para servir el modelo en fp16 con margen amplio.
- Despliegue: al requerir `custom_code`, las opciones estandar (vLLM, TGI, llama.cpp, Ollama) pueden no funcionar sin adaptar la implementacion. La ruta mas segura es `transformers` con `trust_remote_code=True`, o bien revisar el codigo del repo y portarlo a vLLM. No hay ficheros GGUF publicados, por lo que Ollama y llama.cpp exigirian conversion propia.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para 4-5B en una RTX 4090 en bf16, cabria esperar decenas de tokens por segundo en decodificacion, pero no hay medicion publicada para este checkpoint.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus especificaciones publicas habituales y no han sido verificados en esta consulta; se incluyen como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-ai/z3-mini-node-2-candidates | 4,54 B | no disponible | no disponible | HuggingFace, requiere `custom_code` |
| Qwen3-4B (familia de referencia) | 4,0 B aprox. | 32k nativo, ampliable | Apache 2.0 | HuggingFace, transformers/vLLM |
| Llama 3.2 3B | 3,21 B | 128k | Licencia comunitaria Llama 3.2 | HuggingFace, ecosistema amplio |
| Gemma 3 4B | 4 B aprox. | 128k | Licencia Gemma | HuggingFace, transformers/vLLM |

La diferencia clave no es de rendimiento sino de trazabilidad: los tres modelos de comparacion tienen model card, licencia explicita y soporte en runtimes estandar, mientras que este repositorio no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, filtrado de datos ni evaluaciones de seguridad.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. En la practica, esto bloquea su adopcion en produccion hasta aclararlo con el autor.
- `custom_code`: la carga exige ejecutar codigo Python del repositorio. Es un riesgo de seguridad relevante (codigo arbitrario en el entorno de ejecucion) y debe auditarse antes de ejecutar.
- Riesgo de alucinacion: desconocido y no evaluado; en un modelo de 4,5B sin postentrenamiento documentado, la tasa de afirmaciones incorrectas puede ser alta.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma distinto del que se usara en el entrenamiento, que se desconoce.
- Contexto desconocido: no se puede planificar un caso de uso con documentos largos sin medir empiricamente la ventana efectiva y el comportamiento mas alla de ella.
- Condicion de "candidato": el nombre sugiere checkpoints intermedios o alternativos; podrian no ser modelos finales y presentar inestabilidad en la generacion.
- Sin cuantizaciones publicadas: no hay GGUF ni GPTQ, lo que anade trabajo de conversion y validacion para despliegue en hardware limitado.
- Fechas de creacion y actualizacion del repositorio (2026-10-23 y 2026-10-26, segun los metadatos) son posteriores a la fecha habitual de referencia; conviene verificar que el repo no haya sido renombrado o modificado.
- Baja difusion (54 descargas, 0 likes): sin validacion por parte de la comunidad, la probabilidad de fallos silenciosos en la carga o en los pesos es mayor que en modelos con uso extendido.

## Enlaces

- HuggingFace: https://huggingface.co/zils-ai/z3-mini-node-2-candidates

No se han encontrado papers, blogs, repositorios de codigo ni demos asociados a este modelo en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo y se han descartado.
