# yunqu/mentat-sys1-v0.1

## Resumen

`mentat-sys1-v0.1` es un adaptador LoRA con una "decision readout" nativa, entrenado por el usuario `yunqu` sobre la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del modelo base `Qwen/Qwen3.5-4B`. No es un asistente conversacional de proposito general: su unico cometido es responder decisiones acotadas de tres tipos (`noul` para verdadero/falso, `choice` para alternativas con nombre y `score` para escalas ordenadas) devolviendo una distribucion de probabilidad nativa sobre las etiquetas suministradas por el cliente. La inferencia se resuelve en una sola pasada del modelo con una temperatura escalar congelada de `1.0551417227266353`.

El modelo se sirve a traves de un endpoint compatible con TypeSafe, `POST /v1/systemone`, que reutiliza el mismo formato de cable que Jev, e incluye campos de diagnostico anadidos como `unknown_probability`, `abstained`, identidad de calibracion y uso de runtime local. El paquete congelado se publica como revision `v0.1.0` en HuggingFace y no incluye los pesos del modelo base, que deben descargarse por separado.

Su relevancia actual viene de su posicion en la tabla JevBench Public-231, donde obtiene 200 aciertos sobre 231 (86,58%), empatando en segunda posicion con el sistema cerrado de referencia Jev 1.13.0 y por delante de 19 de los 21 sistemas listados. El repositorio, sin embargo, acumula 0 descargas y 0 likes, y la model card aparece truncada en la seccion de auditoria de contaminacion, por lo que parte de la documentacion publicada esta incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA con decision readout nativa sobre `Qwen/Qwen3.5-4B` |
| Parametros totales | 4B (modelo base); parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; depende de la revision base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; los pesos base de Qwen se distribuyen bajo licencia separada |
| Formato de pesos | safetensors (adaptador LoRA, readout y calibracion) |
| Revision base fijada | `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de `Qwen/Qwen3.5-4B` |
| SHA-256 del adaptador | `c72687243aaa8c38f984091247619c242f3f3443a1f3d35c9c3526c4dfde2d83` |
| SHA-256 del readout | `c2c5b2130fcb6604ab7bb7048464fb7c01281a929df767525525870b67ea7d7d` |
| SHA-256 de calibracion | `01ac7306e8312beb749090ad5e3887dc23606d7a5d7dca5d2aa85ff99b612b33` |
| Temperatura escalar congelada | 1,0551417227266353 |
| Tamano del repositorio | 0,5 GB |
| Endpoint de servicio | `POST /v1/systemone` (compatible con TypeSafe/Jev) |
| Tipo de decision | `noul`, `choice`, `score` |

## Arquitectura y entrenamiento

La model card describe el artefacto como un adaptador LoRA sobre `Qwen/Qwen3.5-4B` con un componente adicional denominado "decision readout", que produce directamente una distribucion de probabilidad sobre las etiquetas aportadas por el cliente en cada peticion. El autor indica explicitamente que se trata de un modelo entrenado de forma independiente y que no fue inicializado ni continuado desde otro adaptador de modelo de decision, lo que sugiere que compite en la misma familia de sistemas que aparecen en JevBench (Plumb-4B, Imajev-4B, decider-4b, JevK5 y similares).

El flujo de inferencia es deliberadamente restringido: una unica pasada del modelo por peticion, sin generacion autorregresiva de texto libre y con una temperatura escalar congelada de 1,0551417227266353. La respuesta incluye probabilidades por etiqueta, un campo `confidence`, un `unknown_probability` y un indicador booleano `abstained`, ademas de contadores de uso (`input_tokens`, `rotations`, `images`). El campo `rotations` con valor 1 en el ejemplo publicado es coherente con la politica de una sola pasada.

Sobre los datos de entrenamiento no se publica informacion en el fragmento disponible: no se indican el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card si documenta un proceso de calibracion posterior: se ajusto una temperatura escalar sobre una particion de reserva independiente de 1.120 filas con SHA-256 `a116f4d228e25bac5df61b9e52191adfe4181a0852f6050d9040cee7f35b0a02`, minimizando la log-verosimilitud negativa (NLL) y preservando todas las etiquetas predichas. La seccion de auditoria de contaminacion queda cortada en el texto disponible ("The registered 87"), por lo que sus conclusiones no pueden reproducirse.

## Capacidades

- Decision binaria verdadero/falso mediante el tipo `noul`.
- Decision categorica con alternativas nombradas mediante el tipo `choice`, devolviendo distribucion de probabilidad completa sobre las etiquetas.
- Puntuacion en escala ordenada mediante el tipo `score`.
- Calibracion explicita: la respuesta incluye `confidence`, `unknown_probability` y el flag `abstained`, lo que permite umbralizar el rechazo en produccion.
- Salida probabilistica nativa en una sola pasada del modelo, apta para consumo programatico directo.
- Integracion con el contrato de cable TypeSafe/Jev (`POST /v1/systemone`), sin necesidad de API key en despliegue autoalojado.
- Diagnostico de runtime local: identidad de calibracion y contadores de uso por peticion.
- No es un asistente conversacional: no se documenta generacion de texto libre, codigo, matematicas, vision ni audio.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas soportados.

## Casos de uso

- Clasificacion de catalogos de comercio electronico: el ejemplo oficial de la model card etiqueta un listado (`{"color": "blue", "kind": "shirt"}`) entre las categorias `shirt` y `shoe`, devolviendo probabilidades como `{"shirt": 0.87, "shoe": 0.13}`. Es un caso directo de tipo `choice` sobre atributos de producto.
- Moderacion binaria con abstencion: usar `noul` para decidir si un contenido cumple una politica, empleando `unknown_probability` y `abstained` para derivar a revision humana los casos por debajo de un umbral de confianza.
- Enrutamiento rapido en agentes: actuar como "sistema 1" que clasifica la intencion o la categoria de una peticion antes de invocar un modelo mayor, aprovechando la latencia medida de aproximadamente 90 ms en p50.
- Reranking y puntuacion ordenada: emplear el tipo `score` para asignar una nota ordenada a candidatos de busqueda o recuperacion, con la distribucion resultante como senal de ordenacion.
- Etiquetado y triaje de datos a escala: clasificar grandes volumenes de registros con un modelo de 4B y validacion probabilistica, descartando automaticamente las predicciones de baja confianza.
- Control de calidad en pipelines de decision: insertar el modelo como validador de salidas previas, comparando la probabilidad asignada por Mentat con la etiqueta emitida aguas arriba y marcando discrepancias.
- Investigacion en calibracion de modelos de decision: el paquete incluye readout, calibracion y evidencia de auditoria agregada, lo que permite reproducir los experimentos de NLL, ECE y Brier sobre la particion de reserva.
- Evaluacion comparativa contra la cohorte JevBench de 4B para seleccionar el modelo de decision mas adecuado en un despliegue autoalojado.

## Benchmarks y rendimiento

Resultados publicados por el autor en JevBench Public-231, revision `2fa63fa3226cb369795525ed011800f57dcbd894`, evaluados dos veces desde procesos de servidor GPU nuevos:

| Nivel | Correctas | Total |
|---|---:|---:|
| Easy | 48 | 48 |
| Original | 66 | 72 |
| Hard | 86 | 111 |
| Todos | 200 | 231 |

Precision publicada sobre Public-231: 200/231 (86,58%). Ambas ejecuciones produjeron el mismo digest de predicciones `b8eec370fbae0ae0e560cfd2480ebe25a6a10dae870fb2e6e1ea70c4dc066159`, con cero respuestas invalidas y cero fallos graves.

Comparativa oficial de la cohorte de 4B y derivados de 4B (campo `public_accuracy` de los resultados agregados v1.4.2.2 de JevBench, ordenado por aciertos):

| Puesto | Modelo | Public-231 | Precision |
|---:|---|---:|---:|
| 1 | Plumb-4B | 207 | 89,61% |
| 2 | mentat-sys1-v0.1 | 200 | 86,58% |
| 2 | Jev 1.13.0 | 200 | 86,58% |
| 4 | Imajev-4B | 199 | 86,15% |
| 5 | JevK5 v0.2.0 | 197 | 85,28% |
| 6 | decider-4b v2 | 193 | 83,55% |
| 7 | Hopper | 190 | 82,25% |
| 8 | SemIf (Qwen3.5-4B) | 187 | 80,95% |
| 8 | Jobe Qwen3.5-4B | 187 | 80,95% |
| 10 | local-jev Qwen3.5-4B | 186 | 80,52% |
| 11 | metask-jev-4b | 184 | 79,65% |
| 12 | reflex 4B | 183 | 79,22% |
| 12 | spark-s1-4b-v6 | 183 | 79,22% |
| 14 | OpenSourceJev (Qwen3.5-4B) | 181 | 78,35% |
| 15 | typecastlm (Qwen3.5-4B) | 180 | 77,92% |
| 16 | Malkuth-4B | 173 | 74,89% |
| 17 | open-alternative-jev (Qwen3.5-4B) | 171 | 74,03% |
| 18 | ZeroEntropy zerank-2 | 162 | 70,13% |
| 19 | Raw Qwen3 4B Instruct 2507 | 161 | 69,70% |
| 20 | Qwen3-Reranker-4B | 157 | 67,97% |
| 21 | kev 4B | 153 | 66,23% |

Metricas de calibracion sobre la particion de reserva de 1.120 filas, antes y despues del ajuste de temperatura:

| Metrica | Antes | Despues |
|---|---:|---:|
| NLL | 0,372088 | 0,371613 |
| ECE | 0,020559 | 0,023916 |
| Brier | 0,210315 | 0,210195 |

Latencia medida en dos ejecuciones seriales sobre A800: p50 de 0,090-0,091 s y p95 de 0,332-0,336 s. El autor no publica resultados de MMLU, HumanEval, GSM8K ni de otras suites generalistas, coherentemente con que el modelo no es un asistente de proposito general.

## Requisitos de hardware

- El repositorio publicado ocupa 0,5 GB e incluye unicamente el adaptador LoRA, el readout, la calibracion, los manifiestos, los checksums y la evidencia de auditoria agregada; no contiene los pesos base.
- Es imprescindible descargar aparte la revision fijada `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de `Qwen/Qwen3.5-4B`, cuyos requisitos de VRAM son los del modelo base.
- Estimacion orientativa para el modelo base de 4B (no confirmada en la documentacion publicada): en bf16 aproximadamente 8-9 GB de VRAM; en cuantizacion de 8 bits en torno a 5-6 GB; en cuantizacion de 4 bits en torno a 3-4 GB. Estas cifras son estimaciones de orden de magnitud, no datos publicados por el autor.
- Con esas estimaciones, el modelo cabria en GPUs de consumo con 8 GB o mas de VRAM en bf16, y en tarjetas de 4-6 GB con cuantizacion, siempre que la implementacion de servicio soporte el readout de decision. No hay confirmacion oficial de dicho soporte.
- GPU validadas por el autor: A800, en configuracion serial, con p50 de 0,090-0,091 s y p95 de 0,332-0,336 s. No se publican mediciones en otras GPU.
- Opciones de despliegue: el autor publica codigo de servicio propio en el repositorio de GitHub (etiqueta `v0.1.1`) que expone el endpoint local `http://127.0.0.1:8765/v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- No hay datos publicados de throughput ni de consumo de memoria en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Public-231 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mentat-sys1-v0.1 | 4B (base) + LoRA | no disponible | 200/231 (86,58%) | no disponible | HuggingFace, revision v0.1.0 |
| Plumb-4B | 4B | no disponible | 207/231 (89,61%) | no disponible | listado en JevBench |
| Jev 1.13.0 | no disponible | no disponible | 200/231 (86,58%) | no disponible (referencia cerrada) | sistema cerrado de referencia |
| Imajev-4B | 4B | no disponible | 199/231 (86,15%) | no disponible | listado en JevBench |
| decider-4b v2 | 4B | no disponible | 193/231 (83,55%) | no disponible | listado en JevBench |
| Raw Qwen3 4B Instruct 2507 | 4B | no disponible | 161/231 (69,70%) | segun licencia de Qwen | modelo base sin adaptar |

La comparativa se limita a la tarea de decision evaluada en JevBench Public-231. No hay datos publicados que permitan comparar estos modelos en generacion de texto, codigo o razonamiento general, ni informacion de licencia y contexto para la mayoria de los competidores.

## Limitaciones y advertencias

- No es un asistente general: no genera texto libre ni mantiene conversaciones. Usarlo fuera del contrato `/v1/systemone` carece de sentido.
- La model card declara explicitamente que el modelo no esta pensado para sustituir la revision humana en decisiones de alto impacto.
- La licencia no aparece en la informacion disponible, lo que impide confirmar si se permite el uso comercial. Ademas, los pesos base de Qwen tienen licencia separada y propia, que debe verificarse antes de cualquier despliegue.
- La seccion de auditoria de contaminacion esta truncada en el texto disponible ("The registered 87"), por lo que no puede confirmarse el alcance ni las conclusiones de dicha auditoria.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni idiomas soportados; sin esa informacion no puede descartarse un sesgo sistematico en las etiquetas.
- El riesgo de alucinacion se manifiesta de forma distinta a la de un modelo generativo: no inventa texto, pero puede asignar alta probabilidad a una etiqueta incorrecta entre las suministradas. El campo `confidence` y `unknown_probability` permiten mitigarlo con umbrales.
- La calibracion ajustada mejoro la NLL (0,372088 a 0,371613) y el Brier (0,210315 a 0,210195), pero empeoro el ECE (0,020559 a 0,023916). El autor indica que el ECE es un diagnostico observado y no el objetivo de optimizacion, de modo que la fiabilidad de las probabilidades en terminos absolutos es ligeramente peor tras el ajuste.
- El rendimiento esta medido unicamente en JevBench Public-231, con 231 elementos; no hay validacion externa ni en dominios distintos al de esa prueba.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- La model card esta fechada en octubre de 2026 y el modelo base es `Qwen3.5-4B`; conviene verificar la revision fijada antes de servir, ya que el autor insiste en el pinning de la revision base.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos eran contenido no relacionado y sin valor tecnico, por lo que no aportan informacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunqu/mentat-sys1-v0.1
- Paquete congelado del modelo, revision v0.1.0: https://huggingface.co/yunqu/mentat-sys1-v0.1/tree/v0.1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Codigo de servicio, v0.1.1: https://github.com/mentat-asi/mentat-sys1-v0.1/tree/v0.1.1
- Instrucciones de instalacion y servicio: https://github.com/mentat-asi/mentat-sys1-v0.1#run-the-frozen-release
- Contrato de API TypeSafe: https://docs.typesafe.ai/api
- Issue de JevBench numero 186: https://github.com/fstandhartinger/jevbench/issues/186
- Resultados agregados oficiales de JevBench v1.4.2.2: https://github.com/fstandhartinger/jevbench/blob/main/results/v1.4.2.2/jevbench-v1.4.2.2-results.json
