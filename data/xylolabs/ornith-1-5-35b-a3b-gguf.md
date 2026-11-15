# Xylolabs/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith 1.5 35B A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Ornith AI, con 35.505.251.456 parametros totales y un esquema de activacion dispersa que da nombre al sufijo A3B (aproximadamente 3.000 millones de parametros activos por token). La model card del autor lo situa en la estela de las familias Qwen3.5 y Gemma4, y el paper asociado se titula "From Self-Scaffolding to Self-Improvement", lo que sugiere un enfasis en tecnicas de auto-mejora y razonamiento estructurado. Esta ficha cubre la version cuantizada publicada por Xylolabs en formato GGUF, no el modelo base original.

La relevancia de esta publicacion concreta es practica: Xylolabs ofrece una referencia Q4_K_M "preservada" del modelo original, es decir, una cuantizacion que retiene los 753 tensores del checkpoint (incluidas las 40 capas principales, los 20 tensores MTP de decodificacion especulativa, el embedding y la cabeza de salida sin atar) y que, segun sus propias mediciones, reproduce fielmente el comportamiento del BF16 almacenado. Con 21,7 GB de pesos, el modelo cabe en GPUs de consumo alto (24 GB) y en configuraciones multi-GPU modestas, lo que lo convierte en una opcion viable para despliegue local con llama.cpp.

El modelo esta orientado a generacion de texto conversacional, soporta ingles y coreano, y se distribuye bajo licencia MIT. No incluye codificador de vision: los pesos del encoder/proyector visual fueron omitidos en esta exportacion, por lo que es exclusivamente texto. Su contexto original no se documenta en la informacion disponible, aunque la metadata del GGUF lo conserva sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), linaje declarado Qwen3.5/Gemma4 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | aproximadamente 3.000 millones (sufijo A3B) |
| Longitud de contexto | no disponible (metadata original preservada en el GGUF; los ejemplos usan 2.048 y las comprobaciones GPU 8.192) |
| Tipos de cuantizacion | Q4_K_M mixta (F32: 310 tensores, Q4_K: 379, Q6_K: 64), media de 4,890 bits por parametro |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base original en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE, tal como indica el sufijo A3B: de los 35.500 millones de parametros totales, solo una fraccion (del orden de 3.000 millones) se activa por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La model card menciona 40 capas principales y 20 tensores MTP (Multi-Token Prediction) adicionales, una tecnica de decodificacion especulativa integrada en el propio checkpoint que permite proponer varios tokens por paso. El linaje declarado es Qwen3.5/Gemma4, con terminos Apache 2.0 retenidos en los ficheros APACHE_LICENSE y NOTICE del repositorio, aunque la licencia principal del modelo es MIT.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. El paper citado ("From Self-Scaffolding to Self-Improvement") apunta a un entrenamiento orientado a auto-mejora y andamiaje de razonamiento, pero los detalles tecnicos no se recogen en la informacion proporcionada. La exportacion GGUF de Xylolabs no realizo entrenamiento, calibracion ni cuantizacion adicional: es una conversion con llama.cpp del checkpoint BF16 original, con los pesos de vision eliminados y el resto de tensores intactos.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat original preservada en la metadata del GGUF.
- Razonamiento con modo "reasoning" conmutable: el CLI de referencia permite desactivarlo con `--reasoning off`.
- Decodificacion especulativa mediante los 20 tensores MTP incluidos en el checkpoint (no evaluada en esta exportacion).
- Soporte de ingles y coreano; no se declaran otros idiomas.
- Compatibilidad con el ecosistema llama.cpp, incluido el uso de plantillas Jinja (`--jinja`).
- Capacidad de ejecucion en modo single-turn y multi-turno segun la configuracion del CLI.
- No incluye vision: el encoder y el proyector visual fueron omitidos de esta exportacion.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Asistente conversacional local en ingles o coreano: el modelo puede mantener dialogos multi-turno con la plantilla de chat original, ejecutandose en una unica GPU de 24 GB gracias a los 21,7 GB de pesos Q4_K_M y a la activacion dispersa de aproximadamente 3.000 millones de parametros por token.
- Despliegue en estaciones de trabajo sin conexion: al ser un GGUF compatible con llama.cpp, se puede servir con `llama-server` en entornos air-gapped para tareas de redaccion, resumen y respuesta a preguntas sobre documentacion interna, sin dependencia de APIs externas.
- Prototipado de pipelines de razonamiento: el modo reasoning conmutable permite comparar respuestas con y sin cadena de pensamiento sobre el mismo checkpoint, util para evaluar el impacto del andamiaje de razonamiento en tareas de analisis.
- Generacion de codigo y texto tecnico en ingles: el modelo puede integrarse en editores o scripts CLI para autocompletado y explicacion de fragmentos, con la salvedad de que no se han publicado benchmarks de HumanEval ni similares en la informacion disponible.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye metricas de fidelidad (KL medio 0,079161, acuerdo top-1 del 87,63% frente al BF16), lo que lo convierte en una referencia util para investigadores que comparan esquemas de cuantizacion sobre modelos MoE.
- Servicio de inferencia en produccion ligera: con llama.cpp o bindings compatibles (endpoints_compatible segun los tags), se puede exponer una API HTTP para cargas moderadas donde el coste por token importa mas que la latencia minima.
- Experimentacion con decodificacion MTP: los tensores de Multi-Token Prediction estan presentes en el fichero, lo que permite a investigadores probar estrategias de decodificacion especulativa sobre el modelo cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica evaluacion reportada por el autor de la cuantizacion es de fidelidad respecto al BF16 original:

| Metrica | Valor |
|---|---|
| Preguntas acertadas (33+7 prompts) | 31/33 + 7/7, igual que el BF16 almacenado |
| Regresiones contadas | 0 |
| KL medio | 0,079161 |
| Acuerdo top-1 | 87,63% |
| Secuencias de evaluacion | 4 (ingles/coreano, 2.048 tokens) |
| Posiciones puntuadas | 8.188 |
| Contexto en comprobaciones GPU | 8.192 tokens |

## Requisitos de hardware

- VRAM estimada: 21,70 GB solo para los pesos GGUF Q4_K_M, mas espacio adicional para cache KV, estado recurrente y buffers de trabajo.
- GPU recomendadas: RTX 4090 (24 GB) para el modelo completo en una sola tarjeta; A100 40/80 GB, H100 o RTX 6000 Ada para margen holgado de contexto y concurrencia.
- Cabe en GPU de consumo: si, en RTX 4090 de 24 GB con contexto moderado; en tarjetas de 16 GB no cabe la cuantizacion Q4_K_M completa y requeriria cuantizaciones mas agresivas no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp (CLI y servidor), con soporte de plantillas Jinja; el tag endpoints_compatible sugiere compatibilidad con APIs de estilo OpenAI a traves de herramientas del ecosistema llama.cpp. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no reportados por el autor ("Speed is not reported here").

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Ornith 1.5 35B A3B (esta ficha, GGUF) | 35,5 B | ~3 B | no disponible | MIT | GGUF Q4_K_M |
| Modelo denso de ~35 B (referencia generica) | 35 B | 35 B | no disponible | variable | variable |
| MoE de ~30-40 B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La ventaja estructural del esquema MoE frente a un denso de 35 B es el coste de inferencia: activar aproximadamente 3.000 millones de parametros por token reduce el computo y la memoria de activaciones, aunque el peso completo (21,7 GB en Q4_K_M) sigue debiendo residir en VRAM. No se dispone de datos publicados para comparar calidad frente a alternativas concretas.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible; al entrenarse presumiblemente con datos web, es esperable un sesgo no cuantificado.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni sobre fases de alineacion que las mitiguen.
- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de contexto original no se documenta; los ejemplos usan 2.048 tokens y las comprobaciones GPU 8.192, pero no se confirma cual es el maximo soportado.
- Vision: esta exportacion omite el encoder y proyector visual, por lo que no admite entradas de imagen aunque el modelo base pudiera tenerlas.
- MTP: los tensores de decodificacion especulativa estan presentes pero no fueron evaluados; su uso en produccion requiere validacion propia.
- Licencia: la model card original declara MIT pero el fichero LICENSE estaba ausente; Xylolabs aporta terminos MIT estandar que identifican la procedencia original. Se retienen terminos Apache 2.0 de la familia Qwen3.5/Gemma4 en APACHE_LICENSE y NOTICE, lo que conviene revisar antes de un uso comercial.
- Fidelidad: las metricas de KL y acuerdo top-1 se refieren a un conjunto de evaluacion pequeno (4 secuencias, 8.188 posiciones); no sustituyen una evaluacion de tarea propia.
- Procedencia: el autor de la cuantizacion declara explicitamente que no hay respaldo ni garantia del autor original del modelo.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-GGUF
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina del paper "Ornith-1.5: From Self-Scaffolding to Self-Improvement": https://ornith.ai/ornith_1_5.html
- Repositorio de llama.cpp (build de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentacion de llama.cpp para GGUF en Hugging Face: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
