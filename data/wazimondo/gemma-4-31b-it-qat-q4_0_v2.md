# wazimondo/gemma-4-31B-it-qat-Q4_0_V2

## Resumen

wazimondo/gemma-4-31B-it-qat-Q4_0_V2 es una cuantizacion en formato GGUF Q4_0 del checkpoint con entrenamiento consciente de cuantizacion (QAT) de Gemma 4 31B instruct de Google. El modelo base declarado es google/gemma-4-31B-it-qat-q4_0-unquantized, el repositorio ocupa 18,8 GB y el checkpoint original tiene 30.697.345.596 parametros (unos 30,7B). Lo publica el usuario individual wazimondo bajo licencia Gemma.

La particularidad de esta version no es el modelo, sino el cuantizador: en lugar del codificador Q4_0 estandar de llama.cpp, emplea una variante modificada que, segun el autor, preserva mejor la geometria de los pesos QAT bajo los escalares de bloque FP16 estandar del contenedor GGUF. El resultado declarado es una divergencia KL media de 0,001990, aproximadamente 7 veces menor que la del Q4_0 convencional (0,013962), manteniendo el mismo formato de almacenamiento y las mismas caracteristicas de ejecucion.

Es relevante para quien necesite desplegar un modelo de ~31B con hasta 262.144 tokens de contexto en hardware de consumo, ya que el autor afirma que el archivo se ejecuta en llama.cpp mainline sin parches ni kernels adicionales, con una perdida de fidelidad respecto al checkpoint sin cuantizar muy contenida (PPL ratio 1,00533).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura interna del checkpoint base) |
| Parametros totales | 30.697.345.596 (aproximadamente 30,7B) |
| Longitud de contexto | 262.144 tokens (n_ctx_train segun los logs de llama.cpp incluidos en la model card); el autor evalua a 8192 tokens |
| Tipos de cuantizacion | Q4_0_V2 (variante modificada del Q4_0 de llama.cpp); el checkpoint base es QAT q4_0 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF (archivo Q4_0_V2, compatible con llama.cpp mainline); el modelo base sin cuantizar se distribuye en BF16 y la cifra de parametros totales procede del campo safetensors del repositorio |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del checkpoint base (numero de capas, cabezas de atencion, tipo de atencion ni presencia de componentes MoE o SSM). Tampoco se detallan los datos de entrenamiento: no hay cifra de tokens, composicion del dataset ni referencia a fases de RLHF o DPO. Lo unico documentado por el autor en el plano del entrenamiento es que el punto de partida es un checkpoint QAT de Google, es decir, un modelo ya entrenado con cuantizacion simulada, y que esta publicacion lo recodifica a GGUF.

La innovacion tecnica destacable es el propio recodificador: un encoder Q4_0 modificado que reempaqueta los pesos QAT bajo los escalares de bloque FP16 estandar del formato GGUF. Segun el autor, esto conserva mejor la geometria original de los pesos, con el mismo tamano de almacenamiento y sin cambios en el runtime. La validacion se realizo con `llama-perplexity` sobre un dataset de calibracion propio (gemma-4-think-single-chat.txt), con 12 chunks, n_ctx 8192, batch 2048 y sobre ROCm, aplicando los overrides `gemma4.final_logit_softcapping=float:30.0` y `tokenizer.ggml.add_bos_token=bool:false`. En esos logs aparece la advertencia de que el token `</s>` (id 212) no tiene tipo control y es "probablemente un bug del modelo", ademas del aviso de que n_ctx_seq (8192) es inferior a n_ctx_train (262144).

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y deriva de una variante instruct (`-it`), por lo que el uso previsto es el dialogo multi-turno.
- Herencia del checkpoint Gemma 4 31B instruct: al ser una recodificacion, las capacidades funcionales son las del base google/gemma-4-31B-it-qat-q4_0-unquantized, que no se detallan en la informacion disponible.
- Razonamiento, codigo, matematicas y vision: no disponible; no hay ninguna declaracion al respecto en la model card proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Modo "thinking": hay un indicio indirecto (el dataset de calibracion se llama gemma-4-think-single-chat.txt), pero no se confirma en la informacion disponible.
- Compatibilidad de despliegue: etiqueta `endpoints_compatible` (compatible con Hugging Face Inference Endpoints) y ejecucion declarada en llama.cpp mainline estandar.
- Contexto largo: soporte de hasta 262.144 tokens segun la configuracion de entrenamiento del base, no verificado a esa longitud por el autor.

## Casos de uso

- Asistente conversacional local en estacion de trabajo: con el archivo GGUF de aproximadamente 18 GB, el modelo cabe en una GPU de 24 GB (RTX 3090 o RTX 4090) a contextos moderados, lo que permite mantener una conversacion privada sin enviar datos a terceros.
- Analisis de documentos extensos: los 262.144 tokens de contexto del checkpoint base permiten ingerir informes anuales, expedientes o bases de codigo completas en una sola pasada, siempre que la VRAM disponible admita el KV cache correspondiente.
- Investigacion sobre cuantizacion QAT: el proyecto es directamente util para reproducir la comparativa de divergencia KL entre Q4_0_V2, UD-Q4_K_XL y Q4_0 oficial, y para estudiar el efecto de recodificar pesos ya entrenados con QAT.
- Prototipado rapido sobre Hugging Face Inference Endpoints: la etiqueta `endpoints_compatible` permite desplegar el modelo sin construir una imagen propia, util para validar prompts y flujos antes de invertir en infraestructura.
- Generacion de codigo en local para equipos con requisitos de confidencialidad: al ejecutarse en llama.cpp, se puede integrar en un servidor interno con la API compatible de OpenAI y conectarlo a editores o a pipelines de revision, asumiendo que no hay benchmarks de HumanEval que respalden la calidad de codigo.
- Inferencia en CPU o en Mac con memoria unificada: al ser GGUF, se puede ejecutar total o parcialmente en CPU o en equipos Apple Silicon con 32 GB o mas de memoria unificada, con velocidades sensiblemente inferiores a las de GPU.
- Base para ajuste fino con QLoRA sobre el checkpoint sin cuantizar: este repositorio es de solo inferencia, pero el base google/gemma-4-31B-it-qat-q4_0-unquantized sirve como punto de partida para adaptaciones posteriores.
- Evaluacion comparativa de cuantizaciones en produccion: sirve como candidato a comparar con el Q4_0 oficial de Google o con el UD-Q4_K_XL de unsloth antes de fijar una cuantizacion en un despliegue concreto.

## Benchmarks y rendimiento

No hay resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos publicados son metricas de fidelidad de cuantizacion frente al checkpoint QAT sin cuantizar, medidas con `llama-perplexity` (formato KLD, 12 chunks, n_ctx 8192) sobre el dataset de calibracion del autor.

| Rank | Modelo | PPL ratio | KLD media | Δp RMS | Same top-p |
|---|---|---|---|---|---|
| 1 | pajari/gemma-4-31B-it-qat-Q4_0_V2 | 1,00533 | 0,001990 | 1,408% | 99,416% |
| 2 | unsloth/gemma-4-31B-it-qat-GGUF | 1,00580 | 0,002198 | 1,537% | 99,339% |
| 3 | google/gemma-4-31B-it-qat-q4_0-gguf | 0,99484 | 0,013254 | 3,477% | 97,666% |
| 4 | Q4_0 estandar | 0,99870 | 0,013962 | 3,582% | 97,564% |

Criterios: en KLD y Δp RMS menor es mejor, en Same top-p mayor es mejor y en PPL ratio lo deseable es acercarse a 1,0. La tabla aparece en la model card con la primera fila atribuida a `pajari/gemma-4-31B-it-qat-Q4_0_V2`, no a `wazimondo`, una discrepancia que conviene verificar (ver limitaciones).

Datos adicionales de los logs incluidos: la pasada del modelo base sin cuantizar en BF16 dio un PPL final de 2,3660 ± 0,02526 a 8192 tokens de contexto, con 116,76 segundos por pasada; la cuantizacion UD-Q4_K_XL de unsloth, en el mismo entorno ROCm, tardo 11,87 segundos por pasada. El hardware concreto no se especifica en los logs, por lo que no se pueden derivar cifras de throughput comparables.

## Requisitos de hardware

- Peso en disco y en VRAM: el repositorio ocupa 18,8 GB, de modo que los pesos Q4_0_V2 necesitan aproximadamente 18 GB de VRAM o de memoria unificada.
- KV cache: no disponible el detalle de capas y cabezas; crece de forma lineal con el contexto y a 262.144 tokens es inasumible en GPUs de consumo. En la practica conviene cuantizar el KV cache (Q8_0 o Q4_0 en llama.cpp) o reducir n_ctx.
- GPU de consumo: cabe en RTX 3090 o RTX 4090 (24 GB) a contextos moderados (el autor evalua a 8192 tokens); en una RTX 5090 (32 GB) hay mas margen para contexto y KV cache.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB, RTX 6000 Ada 48 GB o L40S 48 GB, todas ellas con holgura suficiente para contextos amplios.
- Multi-GPU: 2x RTX 4090 o 2x RTX 3090 permiten repartir capas y ampliar el contexto util.
- CPU y Apple Silicon: ejecutable en llama.cpp con memoria unificada de 32 GB o superior (familias M Max y Ultra); en x86 con 32 GB de RAM conviene hacer offload parcial de capas a GPU.
- Opciones de despliegue: llama.cpp mainline (soportado explicitamente por el autor), y por extension entornos que lo envuelven como Ollama, LM Studio, KoboldCpp o text-generation-webui. Compatible con Hugging Face Inference Endpoints por la etiqueta `endpoints_compatible`. Soporte en vLLM o TGI: no disponible.
- Latencia y throughput: no hay mediciones publicadas para esta cuantizacion concreta. Las unicas cifras del repositorio corresponden al base BF16 y a la cuantizacion de unsloth, en un entorno ROCm cuyo hardware no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wazimondo/gemma-4-31B-it-qat-Q4_0_V2 | 30,7B | 262.144 | Q4_0_V2 (GGUF) | 0,001990 | gemma | Hugging Face, 0 descargas y 0 likes |
| unsloth/gemma-4-31B-it-qat-GGUF | 30,7B (mismo base) | 262.144 | UD-Q4_K_XL (GGUF) | 0,002198 | gemma | Hugging Face |
| google/gemma-4-31B-it-qat-q4_0-gguf | 30,7B (mismo base) | 262.144 | Q4_0 oficial (GGUF) | 0,013254 | gemma | Hugging Face, cuantizacion oficial de Google |
| Q4_0 estandar (referencia de llama.cpp) | — | — | Q4_0 | 0,013962 | — | — |

Las tres primeras opciones parten del mismo checkpoint QAT, por lo que la diferencia real esta en el cuantizador y en el soporte del repositorio. Q4_0_V2 y UD-Q4_K_XL quedan practicamente empatados en fidelidad (0,001990 frente a 0,002198), con ventaja de Unsloth en mantenimiento y soporte por tratarse de un equipo consolidado. La cuantizacion oficial de Google tiene un KLD casi 7 veces peor, aunque su PPL ratio (0,99484) es el mas cercano a 1,0. El rendimiento funcional del modelo (razonamiento, codigo, multilingue) no se puede comparar porque no hay benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Discrepancia de atribucion: la tabla de referencia de la model card asigna el primer puesto a `pajari/gemma-4-31B-it-qat-Q4_0_V2` y no a `wazimondo`. Esto sugiere una republicacion de otro repositorio y dificulta trazar la procedencia real de los pesos y de las metricas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes ni issues que confirmen el comportamiento declarado.
- Naturaleza de las metricas: solo se publica divergencia KL y perplejidad sobre un dataset de calibracion propio del autor (gemma-4-think-single-chat.txt). No hay MMLU, HumanEval, GSM8K ni ninguna evaluacion funcional, y estas cifras no predicen el rendimiento en tareas reales.
- Reproducibilidad limitada: el codificador Q4_0 modificado no se documenta en detalle (no hay especificacion del cambio, ni codigo, ni paper), por lo que no se puede verificar ni replicar el proceso de recodificacion.
- Requiere overrides en llama.cpp: los logs aplican `gemma4.final_logit_softcapping=float:30.0` y `tokenizer.ggml.add_bos_token=bool:false`; sin ellos los resultados pueden diferir.
- Advertencias del propio cargador: llama.cpp avisa de que el token `</s>` (id 212) no es de tipo control y lo describe como "probablemente un bug del modelo"; ademas, se elimina de la lista de tokens de fin de generacion.
- Contexto no verificado: aunque n_ctx_train es 262.144, todas las pruebas se hicieron a 8192 tokens. El comportamiento en contextos largos y el coste de KV cache no estan medidos.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en ningun otro idioma concreto.
- Licencia Gemma: no es una licencia de codigo abierto aprobada por la OSI; impone condiciones de uso adicionales de Google, por lo que hay que revisar los terminos antes de cualquier uso comercial o de redistribucion.
- Riesgo de alucinacion y de degradacion por cuantizacion: el PPL ratio de 1,00533 indica una perplejidad ligeramente superior a la del checkpoint sin cuantizar, inherente a cualquier cuantizacion de 4 bits.
- Mantenimiento: repositorio de autor individual, creado el 14 de septiembre de 2026, sin garantia de actualizaciones, soporte ni correccion de errores.
- Uso en produccion: al no existir benchmarks funcionales ni validacion de terceros, no se recomienda adoptarlo como modelo principal en un sistema en produccion sin una evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wazimondo/gemma-4-31B-it-qat-Q4_0_V2
- Modelo base declarado: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Cuantizacion de referencia de Unsloth: https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Cuantizacion oficial Q4_0 de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
- Repositorio citado en la tabla de la model card: https://huggingface.co/pajari/gemma-4-31B-it-qat-Q4_0_V2
- llama.cpp (runtime declarado como compatible): https://github.com/ggerganov/llama.cpp
- La busqueda web realizada no devolvio ningun resultado relevante: unicamente enlaces a Spotify sin relacion con el modelo, por lo que no hay papers, blogs ni demos adicionales que enlazar.
