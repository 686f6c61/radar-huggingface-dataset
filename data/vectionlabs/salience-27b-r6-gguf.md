# vectionlabs/Salience-27B-R6-GGUF

## Resumen

Salience-27B-R6-GGUF es la distribucion cuantizada en formato GGUF del modelo vectionlabs/Salience-27B-R6, publicada por el propio autor (vectionlabs) bajo licencia Apache-2.0. Se trata de un modelo denso de aproximadamente 27.000 millones de parametros, construido sobre Qwen3.8, con arquitectura hibrida de atencion: 16 de sus 64 capas usan atencion convencional y las 48 restantes emplean atencion lineal con estado recurrente. Esa mezcla reduce de forma notable el coste del KV cache, que solo crece en las 16 capas de atencion completa.

El modelo es multimodal (pipeline image-text-to-text, con un codificador de vision separado en formato mmproj), esta orientado a razonamiento eficiente, generacion de codigo y uso agentico con tool calling, y soporta contexto largo. Su publicacion en GGUF responde al objetivo de hacerlo ejecutable en llama.cpp sobre hardware de consumo, algo que el checkpoint BF16 original no permite de forma comoda.

La relevancia practica de este repositorio es que ofrece cuantizaciones estaticas construidas con los valores por defecto de llama-quantize y sin importance matrix, de modo explicito y documentado, frente a la alternativa del repositorio i1-GGUF del mismo autor, que si usa imatrix y anade niveles que no pueden construirse sin ella (IQ2_XXS, IQ2_M, IQ3_M). El autor recomienda los ficheros estaticos para Q5_K_M y superiores, y derivar al repositorio imatrix por debajo de ese umbral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida: 16 de 64 capas con atencion completa y 48 con atencion lineal de estado recurrente; sin MoE |
| Parametros totales | 27B nominales (la model card y los tamanos de fichero son coherentes con ~26B). El metadato safetensors del repo indica 460.730.096, dato inconsistente con el nombre del modelo y con los tamanos declarados (15,7 GB a 4,84 bits/parametro) |
| Parametros activos | No aplica (modelo denso, sin router MoE) |
| Longitud de contexto | No se declara un maximo oficial; la model card documenta ejecucion a 32.768 tokens (`-c 32768`) y el modelo esta etiquetado como long-context |
| Tipos de cuantizacion | Este repo (estaticas, sin imatrix): Q4_K_M, Q6_K, Q8_0. Repo i1 (con imatrix): Q5_K_M, IQ4_XS, Q3_K_M, IQ3_M, IQ2_M, Q2_K, IQ2_XXS |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); codificador de vision aparte en `mmproj-*.gguf` |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO), por lo que esos datos deben considerarse no disponibles. Lo que si se documenta con detalle es la arquitectura de inferencia: un transformer denso de 64 capas en el que solo 16 mantienen atencion completa, mientras que 48 operan con atencion lineal y estado recurrente. Esta decision tiene dos consecuencias directas. La primera es el coste de memoria: el KV cache unicamente crece en las 16 capas de atencion completa, de modo que a 32K tokens con `--cache-type-k q8_0 --cache-type-v q8_0` ocupa aproximadamente 1 GB, una cifra muy inferior a la que sugiere un modelo de 27B. La segunda afecta a la cuantizacion: al ser un modelo denso no existe router MoE que corromper, de modo que el suelo de Q5/Q6 habitual en modelos dispersos no aplica y Q4_K_M es una opcion legitima.

El autor advierte de un comportamiento especifico de esta arquitectura bajo cuantizacion agresiva: como 48 de las 64 capas propagan un estado recurrente, el error introducido por la cuantizacion se acumula a lo largo de la secuencia en lugar de mantenerse local por token. Esto implica que las cifras de divergencia KL, medidas sobre secuencias cortas, subestiman la degradacion en contexto largo. El modelo incorpora ademas un codificador de vision servido como fichero `mmproj` independiente, necesario para entrada de imagenes e ignorado en uso solo texto. La plantilla de chat propia convierte las llamadas a herramientas en formato XML a `tool_calls` estilo OpenAI cuando se activa `--jinja`, y aplica un valor por defecto de `reasoning_effort`.

## Capacidades

- Generacion de texto y razonamiento explicito, con modo de razonamiento configurable mediante `reasoning_effort` (la plantilla propia define un valor por defecto).
- Razonamiento eficiente: el modelo esta etiquetado como `efficient-reasoning`, orientado a reducir el coste de tokens de pensamiento.
- Generacion de codigo, con etiqueta explicita `code`.
- Uso agentico y multi-paso, con soporte de tool calling en formato XML que la plantilla convierte a `tool_calls` estilo OpenAI cuando se sirve con `--jinja`.
- Capacidades multimodales de entrada: acepta imagenes cuando se carga el codificador `mmproj-*.gguf` con `--mmproj` (pipeline image-text-to-text).
- Contexto largo, segun la etiqueta `long-context` y la ejecucion documentada a 32.768 tokens.
- Multilingue: limitado a ingles segun el metadato de idiomas.
- No se documentan capacidades de audio ni de salida multimodal (solo entrada de imagen).

## Casos de uso

- Agentes con tool calling en produccion: el modelo emite llamadas a herramientas en XML que, con `--jinja` activo, llama-server transforma en `tool_calls` compatibles con el esquema de OpenAI. Esto permite integrarlo en frameworks de agentes sin adaptadores personalizados, con la advertencia de que sin `--jinja` las llamadas salen malformadas.
- Analisis de documentos tecnicos con imagenes: gracias al codificador `mmproj`, se pueden enviar diagramas de arquitectura, capturas de paneles o esquemas junto con texto para extraer descripciones o generar codigo a partir de ellos.
- Asistencia de codigo en local: con el fichero Q4_K_M (15,7 GB) cabe en una GPU de 24 GB, lo que permite montar un asistente de programacion autoalojado sin enviar codigo propietario a servicios externos.
- Procesamiento de repositorios o documentos largos: la ventana de 32K tokens y el KV cache reducido (aproximadamente 1 GB a 32K con cache en q8_0) permiten analizar ficheros completos o conversaciones multi-turno extensas sin agotar la VRAM.
- Despliegue en estaciones de trabajo sin GPU dedicada: en CPU o memoria unificada el modelo completo se lee una vez por token, por lo que el tamano del fichero determina directamente la velocidad; Q4_K_M es la opcion recomendada por el autor para este escenario.
- Pipelines de razonamiento con coste controlado: al soportar `reasoning_effort`, se puede ajustar la profundidad de razonamiento por peticion, reservando cadenas largas para tareas complejas y cadenas cortas para clasificacion o extraccion.
- Evaluacion comparativa de niveles de cuantizacion: el repositorio incluye Q4_K_M, Q6_K y Q8_0 en version estatica, lo que permite medir en el propio dominio la perdida de calidad frente al BF16 sin depender de un importance matrix ajeno.
- Procesamiento por lotes en servidor con GPU de 48 GB o mas: con Q8_0 (27,1 GB) o Q6_K (20,9 GB) se puede servir el modelo practicamente sin perdida y con margen para cache y concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una columna de divergencia KL frente a BF16, pero los valores aparecen vacios para los tres ficheros publicados en este repositorio.

Los unicos datos cuantitativos disponibles son de tamano y coste de almacenamiento:

| Fichero | Tamano | Bits/parametro | KL vs BF16 |
|---|---:|---:|---:|
| `Salience-27B-R6-Q4_K_M.gguf` | 15,7 GB | 4,84 | no disponible |
| `Salience-27B-R6-Q6_K.gguf` | 20,9 GB | 6,46 | no disponible |
| `Salience-27B-R6-Q8_0.gguf` | 27,1 GB | 8,36 | no disponible |

## Requisitos de hardware

- VRAM de pesos segun cuantizacion: Q4_K_M 15,7 GB; Q6_K 20,9 GB; Q8_0 27,1 GB.
- KV cache: aproximadamente 1 GB a 32K tokens con `--cache-type-k q8_0 --cache-type-v q8_0`, gracias a que solo 16 de 64 capas mantienen atencion completa.
- GPU de 8 GB: IQ2_XXS (repo imatrix). El autor advierte de degradacion visible.
- GPU de 10 GB: IQ2_M o Q2_K. No recomendado; el autor senala que un 9B en Q5_K_M ocupa un tamano similar y puede rendir mejor.
- GPU de 12 GB: IQ3_M, con calidad visiblemente inferior.
- GPU de 16 GB: IQ4_XS o, en su defecto, Q3_K_M; el margen se estrecha al anadir contexto.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G): Q4_K_M, que el autor define como punto de partida por defecto. Q6_K queda justo con contexto amplio.
- GPU de 32 GB (V100 32 GB, A100 40 GB con margen): Q5_K_M.
- GPU de 48 GB o mas (A100 80 GB, H100): Q8_0 o Q6_K, practicamente sin perdida.
- CPU o memoria unificada (Apple Silicon, servidores sin GPU): Q4_K_M. El modelo completo se lee una vez por token, por lo que el tamano del fichero es directamente proporcional al tiempo por token.
- Opciones de despliegue documentadas: llama.cpp mediante `llama-server` y `llama-quantize`. La model card menciona `llama.cpp` y la libreria GGUF; no se documentan recetas para vLLM, TGI, Ollama o LM Studio.
- Latencia y throughput: no disponibles. Solo se indica cualitativamente que en CPU y memoria unificada el rendimiento depende del tamano del fichero.

## Comparativa con modelos similares

No hay datos de benchmarks ni de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento. Si se puede comparar con las otras variantes del mismo modelo, de las que si hay datos:

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salience-27B-R6-GGUF (este repo, estatico) | 27B nominales | 32K documentados | Q4_K_M, Q6_K, Q8_0 | Apache-2.0 | HuggingFace |
| Salience-27B-R6-i1-GGUF (imatrix) | 27B nominales | 32K documentados | Q5_K_M, IQ4_XS, Q3_K_M, IQ3_M, IQ2_M, Q2_K, IQ2_XXS | Apache-2.0 | HuggingFace |
| Salience-27B-R6 (base, sin cuantizar) | 27B nominales | no disponible | BF16 | Apache-2.0 | HuggingFace |

Comparativas con modelos de terceros (Qwen3, Llama, Mistral u otros) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se aplican los riesgos habituales de un modelo de 27B sin datos de evaluacion publicados.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Cuantizacion por debajo de Q5: el autor recomienda usar el repositorio imatrix en lugar de los ficheros estaticos, y advierte que Q2_K e IQ2_* estan presentes solo porque hay demanda, no porque se recomienden.
- Degradacion en contexto largo con cuantizaciones bajas: al haber 48 capas con estado recurrente, el error de cuantizacion se acumula a lo largo de la secuencia. Las cifras de KL, medidas en secuencias cortas, subestiman este efecto.
- Comparacion a bajo bit: un 27B en Q2_K no es claramente mejor que un 9B en Q5_K_M de tamano similar. El autor recomienda medir antes de asumir que ganan los mas parametros.
- Tool calling: requiere `--jinja` de forma explicita. Sin esa opcion, las llamadas salen malformadas y el `reasoning_effort` por defecto no se aplica.
- Entrada de imagen: requiere cargar el fichero `mmproj-*.gguf` con `--mmproj`; sin el, el modelo solo procesa texto.
- Metadatos inconsistentes: el recuento de parametros safetensors del repositorio (460.730.096) no concuerda con el nombre del modelo ni con los tamanos de fichero declarados. Conviene verificar el checkpoint base antes de tomar decisiones de capacidad basadas en ese dato.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo se construye sobre Qwen3.8 (tambien Apache-2.0); conviene conservar las atribuciones correspondientes.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay resultados de benchmarks publicados, por lo que no existe validacion independiente del rendimiento real.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/vectionlabs/Salience-27B-R6-GGUF
- Modelo base: https://huggingface.co/vectionlabs/Salience-27B-R6
- Repositorio con cuantizaciones imatrix: https://huggingface.co/vectionlabs/Salience-27B-R6-i1-GGUF
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo; los resultados obtenidos correspondian a entidades no relacionadas. No se dispone de papers, blogs, repositorios de codigo ni demos adicionales.
