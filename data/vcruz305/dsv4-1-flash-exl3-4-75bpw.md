# vcruz305/DSV4.1-Flash-EXL3-4.75bpw

## Resumen

Esta ficha describe vcruz305/DSV4.1-Flash-EXL3-4.75bpw, un pack de pesos cuantizados del modelo DeepSeek-V4.1-Flash publicado por el usuario vcruz305. No es un modelo nuevo ni un ajuste fino: es una conversion del modelo base de DeepSeek al formato EXL3 (trellis) con una cuantizacion mixta de 4,75 bits por peso de media, repartida en 32 shards safetensors que ocupan 453,07 GB en disco. El proceso usa un asignador interno llamado SAGE, que fija un valor K distinto por tensor en lugar de aplicar un K uniforme, con el objetivo de concentrar el presupuesto de bits donde mas protege la calidad.

El modelo base es un MoE de DeepSeek con 40 capas (20 de encoder y 20 de decoder), 552B de backbone mas aproximadamente 196B de Engram, 384 expertos enrutados mas 1 compartido con enrutamiento top-6, y componentes de vision. El pack declara licencia MIT y esta pensado para cargarse con ExLlamaV3 en despliegues multi-GPU de clase TP4, con un techo de pesos de unos 422 GiB.

Su relevancia es practica: permite servir localmente un modelo de escala frontera en un presupuesto de pesos de unos 422 GiB, sin depender de una API externa. La contrapartida es que no se publican ni la receta de cuantizacion ni metricas de calidad, y que los datos sobre contexto, idiomas y benchmarks son escasos o inexistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (CED MoE de DeepSeek); 40 capas (20 encoder + 20 decoder), 384 expertos enrutados + 1 compartido, top-6 |
| Parametros totales | 325.383.422.050 (~325,4B) segun los safetensors del repo; la model card cita una "tarjeta" de 763B (552B backbone + ~196B Engram + vision) |
| Parametros activos | no disponible (solo se indica enrutamiento top-6 sobre 384 expertos + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis con K mixto (asignador SAGE), 4,75 bpw de media; Engram conservado en FP8 nativo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 trellis) + tablas nativas FP8 en los shards de Engram (`00031`, `00032`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, no la del pack: un MoE de DeepSeek de 40 capas, 384 expertos enrutados mas uno compartido con enrutamiento top-6, y un componente Engram de aproximadamente 196B. La model card cita una "tarjeta" de 763B que incluiria backbone, Engram y vision, mientras que el recuento real de safetensors del repo es de 325.383.422.050 parametros. La informacion proporcionada no explica esa diferencia, por lo que debe tratarse como una discrepancia pendiente de aclarar y no como un dato cerrado. Los parametros activos por token no se detallan. No se especifica la longitud de contexto del modelo base.

Sobre la cuantizacion: el autor aplica un asignador propio llamado SAGE que mezcla valores K por tensor sobre el formato EXL3 (trellis), en lugar de un unico K uniforme. Los kernels leen el K de cada tensor trellis en tiempo de carga, por lo que el K es autodescriptivo en el propio fichero. Los tensores no pertenecientes a expertos (attention, shared, DSpark, vision y head) se copian sin recuantizar de forma masiva, y el Engram se mantiene en FP8 nativo. El autor declara explicitamente que SAGE no es un volcado de K uniforme con Hessiana identidad presentado como SAGE, y que la receta, las puntuaciones de sensibilidad, las trazas y el codigo del asignador no se publican.

No hay informacion sobre el entrenamiento del modelo base en los datos aportados: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF o DPO. Tampoco hay innovaciones de decodificacion documentadas para este pack. El unico parametro de muestreo sugerido es el del modelo base: `temperature=1.0`, `top_p=0.95`.

## Capacidades

- Generacion de texto a partir del modelo base DeepSeek-V4.1-Flash, en su version cuantizada.
- Razonamiento y matemáticas y generacion de codigo: capacidades propias del modelo base, no verificadas ni documentadas en el pack.
- Multimodalidad de vision: el pack conserva los tensores de vision del modelo base, lo que indica que el modelo base incorpora ese componente. El alcance exacto (entrada de imagen, tareas soportadas) no esta detallado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repo esta vacio.
- Modo "thinking" o cualquier capacidad especial de inferencia: no disponible en la informacion proporcionada.
- Compresion efectiva: el pack ocupa 453,07 GB con una media declarada de 4,75 bpw, apto para despliegue con un techo de pesos de clase TP4.

## Casos de uso

- Despliegue on-premise de un modelo de escala frontera: el pack permite servir localmente un MoE de gran tamano sin depender de una API de terceros, con un coste de almacenamiento de 453,07 GB y un techo de pesos de ~422 GiB sobre una topologia tipo TP4.
- Inferencia soberana con requisitos de residencia de datos: al ejecutarse en hardware propio, el trafico no sale de la infraestructura, algo util en entornos regulados donde no se puede enviar texto a servicios externos.
- Investigacion sobre cuantizacion: el pack es un caso de estudio de cuantizacion EXL3 con K mixto por tensor; sirve para comparar la viabilidad de tecnicas de asignacion no uniforme frente a cuantizaciones de K uniforme, aunque el autor no publique la receta.
- Procesamiento por lotes de gran volumen en un cluster con varias GPU: tareas offline de resumen, extraccion de informacion o clasificacion sobre corpus grandes, donde el throughput agregado importa mas que la latencia por peticion.
- Evaluacion comparativa de calidad de cuantizaciones: se puede medir la degradacion frente al modelo base sin cuantizar sobre un mismo conjunto de evaluacion, siempre que el operador aporte sus propias metricas, ya que el autor no publica ninguna.
- Pipelines multimodales de vision: si el operador confirma el soporte de entrada de imagen del modelo base, el pack podria usarse en tareas de descripcion de imagenes o extraccion de informacion de documentos escaneados.
- Base para desarrollos posteriores en la familia DeepSeek V4.1: el formato EXL3 y la estructura de 32 shards facilitan reutilizar el mismo modelo base para pruebas de carga, ajuste de parametros de muestreo y validacion de infraestructura antes de pasar a pesos sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica expresamente que cualquier fila de benchmarks que aparezca en la tarjeta del modelo base corresponde a DeepSeek y no a este pack, y el autor no reclama esas cifras como propias. No hay, por tanto, datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto para esta cuantizacion.

## Requisitos de hardware

- Tamano en disco: 453,07 GB de repositorio, repartidos en 32 shards safetensors de aproximadamente 8 GiB cada uno.
- Techo de pesos declarado: clase TP4, en torno a 422 GiB de pesos en memoria.
- VRAM estimada: no disponible como cifra oficial. Por aritmetica a partir del techo declarado, una topologia TP4 necesitaria del orden de 106 GiB de pesos por GPU, lo que exige aceleradores con 141 GB o mas por unidad (por ejemplo H200 o H100 NVL) o bien repartir en 6-8 GPU de 80 GB si la implementacion lo permite. Estas cifras son una estimacion derivada del tamano del pack, no un dato publicado por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada; el pack esta dimensionado para despliegues multi-GPU de clase TP4.
- GPU de consumo: no cabe. Con 24 GB por RTX 4090 harian falta del orden de 18 unidades solo para los pesos, ademas de la sobrecarga de contexto y de cache KV, por lo que no es un objetivo realista.
- Opciones de despliegue: ExLlamaV3 es la unica libreria soportada explicitamente. Requiere una version reciente con soporte de DeepSeek V4.1 / CED. La carga se hace con `Config.from_directory`, `Model.from_config`, `model.load()` y `Tokenizer.from_config`. El reparto multi-GPU depende de lo que exponga la compilacion de ExLlamaV3 utilizada (`tp`, device map).
- Formatos alternativos: no hay versiones GGUF, AWQ ni GPTQ documentadas en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vcruz305/DSV4.1-Flash-EXL3-4.75bpw | 325.383.422.050 segun safetensors (tarjeta de 763B citada por el autor) | no disponible | EXL3 trellis, K mixto SAGE, 4,75 bpw | 453,1 GB | MIT | publico en HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | 763B segun la model card del pack (552B backbone + ~196B Engram) | no disponible | sin cuantizar | no disponible | MIT | publico en HuggingFace |
| Otras cuantizaciones de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para ninguna de las filas, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad. No se han identificado en la informacion proporcionada alternativas de otro autor que sean directamente comparables.

## Limitaciones y advertencias

- Ausencia total de metricas de calidad: no hay benchmarks, evaluaciones humanas ni comparaciones contra el modelo sin cuantizar. No se puede afirmar que la degradacion respecto al base sea pequena solo porque el bpw medio sea 4,75.
- Metodo de cuantizacion no reproducible: el asignador SAGE, su lista de capas, las puntuaciones de sensibilidad, las trazas de calibracion y el codigo no se publican. Terceros no pueden auditar ni replicar el reparto de bits.
- Discrepancia de parametros sin explicar: 325.383.422.050 segun safetensors frente a la "tarjeta" de 763B citada en la model card. Cualquier planificacion de hardware o de coste deberia resolverse antes de desplegar.
- Ahorro de bits no uniforme: los tensores protegidos (attention, shared, DSpark, vision, head) se copian sin recuantizar, de modo que la media de 4,75 bpw no refleja el coste real de todos los componentes.
- Requisito de software estricto: hace falta una version reciente de ExLlamaV3 con soporte de DeepSeek V4.1 / CED. Compilaciones antiguas no cargaran el pack.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala. No hay evaluaciones de factualidad para este pack.
- Sesgos: no evaluados ni documentados en la informacion disponible.
- Idiomas y contexto: no disponibles. No se puede asumir un soporte multilingue amplio ni una ventana de contexto concreta sin verificarlo en el modelo base.
- Licencia: el pack declara MIT, heredada del modelo base de DeepSeek. Conviene verificar los terminos vigentes del modelo base y de sus dependencias antes de un uso comercial en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de la ficha, lo que reduce la probabilidad de que los problemas de carga hayan sido detectados y reportados por terceros.
- El autor pide expresamente que no se abran incidencias por "expertos o arbol de trabajo ausentes": este repo es unicamente el pack compilado, no un volcado de ficheros por experto.
- No hay versiones alternativas del pack (otros bpw, GGUF u otros formatos) documentadas.

## Enlaces

- Pack en HuggingFace: https://huggingface.co/vcruz305/DSV4.1-Flash-EXL3-4.75bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- ExLlamaV3 (repositorio): https://github.com/turboderp-org/exllamav3
- Perfil del autor de la cuantizacion: https://huggingface.co/vcruz305
- La busqueda web realizada no devolvio ningun resultado relevante: los enlaces obtenidos correspondian a dominios de contenido para adultos sin relacion con el modelo. No se han podido localizar papers, blogs ni demos adicionales.
