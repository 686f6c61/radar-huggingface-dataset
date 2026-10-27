# trubisky/Swift-1.5-Qwen-3.8-Flash-Next-Heretic-UD-IQ4_XS

## Resumen

Swift-1.5-Qwen-3.8-Flash-Next-Heretic-UD-IQ4_XS es una cuantizacion GGUF en formato IQ4_XS del modelo Swift 1.5 Qwen 3.8 Flash Next Heretic, una variante con los rechazos eliminados (abliterated/heretic) del derivado de Qwen3.8-Flash-Next publicado por ukisai. El trabajo lo firma el usuario trubisky, que replica tensor a tensor el perfil de cuantizacion dinamica IQ4_XS de Unsloth y sustituye la importance matrix por una calibrada especificamente con datos de matematicas, codigo, uso de herramientas e instrucciones. El resultado es un fichero de aproximadamente 4,25 bits por peso, pensado para inferencia local en llama.cpp y runtimes compatibles, que reduce un modelo de unos 176.900 millones de parametros a un tamano manejable (~97 GB) sin salir del ecosistema GGUF.

La relevancia del artefacto es doble. Por un lado, demuestra el flujo de trabajo habitual de la comunidad: partir de pesos abliterated, aplicar un perfil de cuantizacion reproducible y anadir un imatrix orientado a cargas concretas. Por otro, incorpora un paquete de artefactos "strata" que, segun la model card, incluye la cabeza MTP (multi-token prediction) y la torre de vision, lo que sugiere que el modelo base conserva capacidades multimodales y de decodificacion especulativa.

Ahora bien, el propio autor advierte de forma explicita que el modelo "es bastante malo en relacion con lo que podria ser": el modo de razonamiento esta danado y la calibracion del imatrix esta incompleta. Desaconseja su uso en trabajo real y anuncia una version correcta basada en pesos v2 con mejor calibracion. Cualquier evaluacion debe partir de esa premisa: se trata de un artefacto experimental, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Qwen3.8-Flash-Next (via Swift 1.5 de ukisai); configuracion de atencion y posible mezcla de expertos no disponible |
| Parametros totales | 176.943.899.520 (~176,9 B), segun metadatos safetensors del modelo base |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de la model card usan `-c 8192` |
| Tipos de cuantizacion | IQ4_XS con perfil Unsloth Dynamic (~4,25 bits por peso) e imatrix personalizada (matematicas, codigo, herramientas, instruct) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0, heredada del modelo base segun la model card |
| Formato de pesos | GGUF (cuantizacion de 4 bits) |
| Tamano del repositorio | 96,9 GB |
| Modelo base | ukisai/Swift1.5-Qwen3.8-Flash-Next y ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF; pesos heretic de jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic |
| Extras incluidos | ZIP con artefactos "strata" (cabeza MTP, vision y otros ficheros necesarios) |
| Descargas / likes | 1.554 descargas, 13 likes (a fecha de la ultima actualizacion) |
| Fechas | Creado el 2026-10-21, actualizado el 2026-10-27 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del linaje Qwen3.8-Flash-Next a traves del derivado Swift 1.5 de ukisai, descrito en fuentes secundarias como una variante "eficiente en razonamiento". La informacion disponible no detalla el numero de capas, la configuracion de atencion (GQA/MQA), la funcion de activacion ni si existe mezcla de expertos; una fuente externa relativa a otra variante abliterated del mismo linaje menciona 48 capas, dato que no se puede confirmar para este artefacto concreto. Lo que si se deduce de la model card es la existencia de una cabeza MTP (multi-token prediction), empaquetada en el ZIP de artefactos strata: su presencia habilitaria decodificacion especulativa si el runtime la soporta, aunque el autor no documenta como activarla.

El entrenamiento original no esta documentado en la informacion proporcionada: no hay datos sobre numero de tokens, composicion del corpus, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. Lo que si es trazable es la cadena de postprocesado. Primero se aplica una ablacion de la direccion de rechazo (pesos "heretic" de jeffpeng3), que elimina el comportamiento de negativa a responder. Despues, trubisky cuantiza a IQ4_XS replicando exactamente el perfil por tensor de Unsloth Dynamic, de modo que la distribucion de precision capa a capa es identica a la del release de Unsloth, y solo cambia la importance matrix. Esa imatrix se genero con un conjunto de calibracion propio centrado en matematicas, generacion y edicion de codigo multi-lenguaje, trazas de function calling y datos de instrucciones, de forma que el error de cuantizacion se concentra en los pesos menos relevantes para esas tareas.

## Capacidades

- Generacion de texto conversacional multi-turno: el tag `conversational` y la plantilla de chat Jinja confirman el uso previsto como modelo de dialogo.
- Razonamiento paso a paso ("thinking"): el modelo base dispone de modo de razonamiento, pero el autor advierte que en esta cuantizacion el thinking esta danado.
- Generacion y edicion de codigo: la imatrix se calibro explicitamente con datos de codigo multi-lenguaje, por lo que la precision se preserva en esos tensores.
- Matematicas y resolucion de problemas: incluido en el conjunto de calibracion del imatrix.
- Tool calling / function calling: soportado mediante la plantilla de chat, que requiere `--jinja` en llama.cpp segun los ejemplos del autor; el imatrix incorpora trazas de uso de herramientas.
- Capacidades multimodales: el paquete strata incluye artefactos de vision, lo que indica que el linaje soporta entrada de imagenes, aunque no se documenta el procedimiento de activacion.
- Decodificacion especulativa: la cabeza MTP esta incluida en el ZIP de artefactos, sujeta a soporte del runtime.
- Multilingue: no disponible; el autor solo advierte que la calidad en texto no ingles puede diferir de cuantizaciones con imatrix de proposito general.
- Comportamiento sin rechazos: al derivar de pesos heretic/abliterated, el modelo no aplica las negativas entrenadas del modelo original.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el artefacto sirve para medir el impacto de una imatrix especifica frente al perfil Unsloth estandar, manteniendo identico el layout de tipos por tensor. Es su uso mas solido hoy, dado el aviso del autor.
- Pruebas de pipelines de tool calling en local: con `llama-server --jinja` se puede validar el formateo de llamadas a funciones y el parseo de resultados en un entorno GGUF sin dependencia de APIs externas.
- Investigacion sobre abliteration: permite estudiar como se comporta un modelo de ~177 B tras eliminar la direccion de rechazo, comparando respuestas con el modelo base sin abliterar.
- Experimentos de decodificacion especulativa: los artefactos MTP incluidos permiten probar tecnicas de aceleracion en runtimes que los soporten (no documentado por el autor).
- Prototipado de asistentes de codigo en hardware de gama alta: la calibracion orientada a codigo y matematicas hace que sea el dominio donde menos degradacion cabe esperar, siempre con validacion humana.
- Laboratorio de inferencia con vision: el paquete strata facilita montar pruebas de entrada multimodal si se consigue configurar la torre de vision.
- Benchmarking de infraestructura: con ~97 GB de pesos es un buen caso de prueba para despliegues multi-GPU, offload parcial a CPU y memoria unificada en Apple Silicon.
- Fine-tuning y destilacion sobre respuestas: no recomendado en su estado actual; el propio autor lo desaconseja para trabajo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor no aporta comparaciones cuantitativas frente al modelo base ni frente al perfil Unsloth original. Tampoco hay mediciones de perplejidad de la cuantizacion ni de velocidad de inferencia (tokens/s). Cualquier cifra que se cite para este artefacto debe proceder de una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 94-97 GB. El calculo parte de 176,9 B de parametros a ~4,25 bits por peso (176,9e9 x 4,25 / 8 = ~94 GB) y coincide con el tamano de repositorio declarado de 96,9 GB.
- Memoria adicional para KV cache: no disponible con precision, porque faltan el numero de capas, cabezas KV y si hay GQA. A 8.192 tokens de contexto hay que presupuestar varios GB extra segun la configuracion; conviene reservar al menos un 10-15 % sobre el tamano de los pesos.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB cubren los pesos con margen para contexto. 4x RTX 6000 Ada (48 GB) o 2x RTX 6000 Ada mas offload tambien son viables.
- GPU de consumo: no cabe en una unica tarjeta de 24 GB. Cuatro RTX 4090 suman 96 GB, justo por debajo del peso de los pesos, por lo que exigirian offload parcial de capas a CPU.
- Memoria unificada: un Mac Studio o MacBook Pro con 128 GB o mas de memoria unificada permite ejecucion con llama.cpp y Metal, con offload parcial; 192 GB deja margen comodo para contexto largo.
- Solo CPU: requiere un minimo de 128 GB de RAM y ofrece latencias muy superiores a las de GPU; no hay mediciones publicadas de throughput.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--jinja` para tool calling), LM Studio, Ollama mediante Modelfile y koboldcpp, segun la model card. vLLM no se menciona y su soporte de GGUF IQ4_XS es limitado.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| trubisky/Swift-1.5-Qwen-3.8-Flash-Next-Heretic-UD-IQ4_XS | ~176,9 B | no disponible | GGUF IQ4_XS (~97 GB) | apache-2.0 | Imatrix propia; thinking danado e imatrix incompleta segun el autor |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic | no disponible (mismo linaje) | no disponible | safetensors | no disponible | Pesos heretic originales sin cuantizar; origen de este quant |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | no disponible | safetensors | no disponible | Modelo base sin abliterar; conserva los rechazos |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF (repartido en 5 partes, ~39 GB segun fuente externa) | no disponible | Cuantizacion estandar del base, sin ablacion |
| Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated | no disponible | no disponible | no disponible | no disponible | Otra via de ablacion (trasplante de 144 tensores en 48 capas) |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la eleccion entre ellas debe basarse en el formato, el grado de cuantizacion y el comportamiento respecto a rechazos, no en metricas de calidad.

## Limitaciones y advertencias

- Advertencia explicita del autor: "This model is pretty bad, relative to how good it could be"; el thinking esta danado y la calibracion del imatrix esta incompleta. Recomienda no usarlo para trabajo real hasta publicar una version basada en pesos v2.
- Razonamiento degradado: cualquier tarea que dependa de cadenas de pensamiento largas o de auto-verificacion puede producir resultados incoherentes o truncados.
- Imatrix parcial: la calibracion cubre matematicas, codigo, herramientas e instrucciones; dominios como escritura creativa o textos no ingleses pueden degradarse mas que con una imatrix de proposito general.
- Modelo sin rechazos: al derivar de pesos heretic/abliterated, no aplica las negativas del modelo original y puede generar contenido inapropiado, inseguro o Ilícito. Requiere filtros externos y supervision humana en cualquier despliegue expuesto a usuarios.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad; al ser una cuantizacion de 4 bits sobre un modelo ya modificado, el riesgo es al menos el del base y probablemente mayor en dominios fuera de la calibracion.
- Idiomas: no se documenta la lista de idiomas soportados ni la calidad por idioma; el castellano no esta verificado.
- Licencia: los metadatos de HuggingFace indican apache-2.0, pero la model card afirma que "hereda la licencia del modelo base". Conviene verificar la licencia efectiva del linaje ukisai/Qwen antes de un uso comercial.
- Contexto: no se documenta la longitud maxima soportada; los ejemplos usan 8.192 tokens, pero no debe asumirse que ese sea el limite del modelo.
- Artefactos strata: el ZIP con cabeza MTP y vision no incluye instrucciones detalladas de integracion en el runtime; el soporte depende de herramientas externas no identificadas.
- Estado del repositorio: creado y actualizado en octubre de 2026, con 13 likes, senal de validacion comunitaria muy baja.
- Ausencia total de benchmarks: no se puede afirmar nada sobre su calidad relativa frente al perfil Unsloth original sin evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trubisky/Swift-1.5-Qwen-3.8-Flash-Next-Heretic-UD-IQ4_XS
- Discusiones del repositorio: https://huggingface.co/trubisky/Swift-1.5-Qwen-3.8-Flash-Next-Heretic-UD-IQ4_XS/discussions
- Pesos heretic originales: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Modelo base (safetensors): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Articulo sobre el lanzamiento (AGI Hunt): https://agihunt.info/en/p/1a165a2efc06be402ed91213a43
- Ficha del GGUF del modelo base en Local AI Zone: https://local-ai-zone.github.io/models/swift-1-5-qwen3-8-flash-next.html
- Variante GSQ-RCO abliterated del mismo linaje: https://www.abliteratedmodels.org/swift-1.5-qwen3.8-flash-next-gsq-rco-abliterated/
- Perfil de cuantizacion dinamica de Unsloth: https://unsloth.ai
- Herramienta de cuantizacion llama.cpp: https://github.com/ggml-org/llama.cpp
