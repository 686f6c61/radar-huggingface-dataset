# UntMods/FaceSwap_MiniMaxH3_REF2VA

## Resumen

FaceSwap_MiniMaxH3_REF2VA es un adaptador LoRA publicado por el usuario UntMods sobre el modelo base MiniMax H3 en su variante REF2VA, orientado a la sustitucion de identidad facial en video. Su funcion concreta es reemplazar la cara de la identidad presente en el video de referencia por la cara o caras aportadas como referencia adicional, manteniendo el resto de la escena generada por el modelo base. Se activa con una unica palabra disparadora, `Faceswap`, y el autor indica que debe aplicarse con fuerza 1.

El repositorio tiene un tamano de 0,2 GB y se distribuye bajo licencia Apache 2.0. No se especifica la arquitectura interna del adaptador mas alla de que es un LoRA aplicado sobre MiniMax H3 REF2VA, ni el numero de parametros, ni los datos de entrenamiento empleados. El autor menciona que el adaptador fue podado por bloques segun un umbral ("front threshold"), con el objetivo de reducir peso y artefactos propios de LoRA sin perder la fuerza del modelo entrenado original.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un adaptador muy reciente (publicado y actualizado en septiembre de 2026 segun los metadatos del repositorio) con 0 descargas y 0 likes en el momento de la consulta, sin model card tecnica detallada y sin resultados de benchmarks. Es util unicamente para quien ya trabaje con el pipeline MiniMax H3 REF2VA y quiera anadir face swap por identidad de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de generacion de video MiniMax H3, variante REF2VA; detalle de la arquitectura interna no disponible |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,2 GB en total) |
| Parametros activos | no aplica (no es un modelo MoE; es un adaptador) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es de sustitucion facial en video, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no declara el formato de los ficheros de pesos) |
| Modelo base | MiniMax H3 REF2VA |
| Palabra disparadora | `Faceswap` |
| Fuerza recomendada del LoRA | 1 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un LoRA que se aplica sobre MiniMax H3 REF2VA. La model card no detalla el numero de tokens o frames de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO; tampoco indica el rango del adaptador ni los modulos concretos sobre los que se inyectan las matrices de bajo rango.

La unica innovacion tecnica declarada por el autor es la poda del adaptador: el LoRA se ha podado eliminando los bloques que quedan por debajo de un umbral determinado, lo que segun la model card reduce el peso del fichero y los artefactos tipicos de los LoRA manteniendo una fuerza identica a la del modelo entrenado base. El autor tambien indica que los entrenamientos se realizan con Runpod, sin aportar mas detalles del procedimiento.

## Capacidades

- Sustitucion de identidad facial en video: reemplaza la cara del sujeto del video de referencia por la identidad aportada como referencia, segun la descripcion del autor.
- Soporte de multiples referencias: la propia descripcion indica que puede usar "Reference(s)", es decir, una o varias identidades de referencia.
- Activacion mediante una unica palabra disparadora: `Faceswap`.
- Integracion con el flujo de trabajo CRT-Nodes publicado por el autor, aunque se permite usar un workflow propio siempre que la entrada de video respete el formato de MH3.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues: es un adaptador de video, no un modelo de lenguaje.
- No se declaran capacidades de audio ni modos de razonamiento explicito.

## Casos de uso

- Postproduccion de video con cambio de interprete: sustituir la identidad de un actor por la de un doble de referencia sin regenerar la escena completa, aprovechando que el LoRA solo altera la identidad facial y conserva el movimiento y el entorno generados por MiniMax H3 REF2VA.
- Prototipado de personajes consistentes en series de video: mantener la misma identidad a lo largo de varios clips usando la cara de referencia en cada generacion, con la palabra `Faceswap` como disparador fijo y fuerza 1.
- Anonimizacion de rostros en material audiovisual: aplicar una identidad de referencia consentida sobre las caras originales antes de publicar el material, siempre que se cumplan los requisitos legales de derechos de imagen.
- Doblaje y localizacion de contenido: unificar la identidad del presentador entre tomas grabadas en sesiones distintas, evitando saltos visuales entre fragmentos.
- Contenido generativo para publicidad: crear variantes de un mismo anuncio con identidades distintas a partir de una misma base de video, reduciendo el coste frente a rodar cada version.
- Investigacion en sintesis facial: estudiar la fidelidad de la transferencia de identidad y los artefactos residuales del adaptador podado, comparando resultados con y sin LoRA.
- Iteracion rapida en pipelines de video generativo: al tratarse de un adaptador ligero, permite probar cambios de identidad sobre un mismo pipeline sin reentrenar ni sustituir el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de fidelidad de identidad, similitud facial, coherencia temporal ni comparaciones con otros adaptadores.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,2 GB, por lo que el almacenamiento adicional del LoRA es despreciable frente al modelo base.
- La VRAM necesaria para inferencia depende por completo del modelo base MiniMax H3 REF2VA; no se ha publicado cifra alguna en la informacion disponible.
- No se indican GPU recomendadas (A100, H100, RTX 4090 u otras) para este adaptador ni para el modelo base.
- No se puede confirmar si el pipeline completo cabe en GPU de consumo: el dato no esta disponible.
- Opciones de despliegue: el autor menciona un workflow propio basado en CRT-Nodes; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un adaptador de difusion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FaceSwap_MiniMaxH3_REF2VA | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| Alternativas de face swap sobre MiniMax H3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Adaptadores de face swap para otros modelos de video | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Model card extremadamente escasa: no documenta dataset de entrenamiento, hiperparametros, rango del LoRA ni procedimiento de evaluacion.
- Sin validacion externa: 0 descargas y 0 likes, sin resultados de benchmarks ni evaluaciones de terceros.
- La calidad del face swap depende de que el video de entrada respete el formato exigido por MH3; el autor advierte explicitamente de este requisito.
- Especificidad del pipeline: esta disenado para MiniMax H3 REF2VA y CRT-Nodes, por lo que no es portable a otras arquitecturas de difusion sin reentrenamiento.
- Riesgo de artefactos: aunque el autor afirma que la poda reduce los artefactos tipicos de LoRA, no aporta evidencia cuantitativa que lo respalde.
- Consideraciones legales y eticas: la sustitucion de identidad facial sin consentimiento puede vulnerar derechos de imagen y normativa de proteccion de datos; la licencia Apache 2.0 del adaptador no exime del cumplimiento legal ni de las condiciones del modelo base.
- La licencia del modelo base MiniMax H3 no se detalla en la informacion proporcionada; conviene verificarla antes de cualquier uso comercial.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento en dominios fuera del face swap.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA
- Ejemplo principal en video: https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00120.mp4
- Ejemplos adicionales: https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00114.mp4, https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00058.mp4, https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00109.mp4, https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00107.mp4, https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00039.mp4, https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00040.mp4, https://huggingface.co/UntMods/FaceSwap_MiniMaxH3_REF2VA/resolve/main/videos/Faceswap_00013.mp4
- Workflow del autor (CRT-Nodes): mencionado en la model card, sin URL publicada
- Runpod (enlace de referido del autor): https://runpod.io?ref=u7b2habt
- Apoyo al autor: https://buymeacoffee.com/designedbycrt
- Paper, blog tecnico o demo oficial: no disponible
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido cinematografico), por lo que no se han utilizado como fuente.
