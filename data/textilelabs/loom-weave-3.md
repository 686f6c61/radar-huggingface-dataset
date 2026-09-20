# textilelabs/Loom-Weave-3

## Resumen

Loom Weave 3 es un modelo de lenguaje de 31,5 millones de parametros (31.469.952 exactos) desarrollado por Textile Labs, entrenado desde cero con pesos inicializados aleatoriamente y sin partir de ningun checkpoint de terceros. Es el sucesor de Loom Weave 2 (59,65 M) y, de forma deliberada, tiene aproximadamente la mitad de parametros: el autor sostiene que la relacion tokens-por-parametro y el metodo de entrenamiento importan mas que el recuento de parametros. Su rasgo diferencial es que incorpora una habilidad de lectura de prosa real: decide cuando necesita buscar, escribe su propia consulta, lee el resultado que le devuelve un harness externo contra Wikipedia en vivo y responde a partir de ese texto, declarando que lo ha comprobado en lugar de que lo sabia.

La arquitectura es un transformer decoder-only de estilo Llama con 16 capas y una ventana de contexto de 1024 tokens, orientado a conversacion multi-turno y uso de herramientas. Se distribuye con licencia MIT, solo en ingles, y esta disponible tanto en safetensors como en GGUF, con soporte declarado para text-generation-inference y endpoints compatibles. No es un modelo de proposito general: esta disenado como lector/asistente pequeno dentro de un `harness.py` que gestiona la busqueda, la seleccion de articulo y el recorte del texto devuelto.

Su relevancia actual es fundamentalmente metodologica: la model card documenta de forma explicita por que un modelo mas pequeno supera a su predecesor mayor, senalando el ritmo de aprendizaje de las matrices de atencion (optimizador Muon, LR 0,025), el enmascaramiento de la funcion de perdida sobre los tokens de respuesta y un entrenamiento corto con conservacion del mejor checkpoint de validacion. Los resultados publicados son honestos sobre sus limites: acierta en lectura en vivo sobre el conjunto de ajuste en 11 de 20 casos, pero solo 6 de 20 en el conjunto reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama, 16 capas, entrenado desde cero |
| Parametros totales | 31.469.952 (~31,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF (etiqueta declarada en el repo); niveles concretos no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |
| Libreria | transformers |
| Pipeline | text-generation |
| Optimizador | Muon (LR 0,025 en las matrices de atencion) |
| Tamano del repositorio | 0,2 GB |
| Despliegue declarado | text-generation-inference, endpoints compatibles |
| Fecha de creacion (HF) | 2026-09-20 (segun metadatos del repositorio) |
| Fecha de actualizacion (HF) | 2026-09-20 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 16 capas y 1024 tokens de contexto, con una arquitectura de corte Llama, entrenado integramente desde cero sobre pesos aleatorios. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron fases de RLHF o DPO; esa informacion no esta disponible. Lo que si se documenta es el formato de entrenamiento: conversaciones completas empaquetadas en cada bloque y una funcion de perdida enmascarada para que solo puntue los tokens de respuesta, en lugar de repartir el esfuerzo sobre el texto web en bruto.

La innovacion tecnica central es la formacion de un circuito de copia/lectura. Segun el autor, ese circuito no aparecia porque las matrices de atencion se entrenaban con un ritmo de aprendizaje ocho veces inferior al adecuado: el modelo era fluido pero incapaz de extraer "Paris" de una frase que contenia "Paris". Al fijar el LR estandar de la familia con el optimizador Muon (0,025), la habilidad de lectura emergio. El entrenamiento se acorto deliberadamente para evitar sobreajuste y memorizacion de un corpus minusculo, conservando el mejor checkpoint por validacion. La mejora en la declaracion de limites personales se logro anadiendo ejemplos variados de preguntas personales irresolubles ("no puedo saber lo que hiciste"), corrigiendo el sesgo previo que solo cubria la incapacidad de conocer el nombre del usuario.

El componente externo, `harness.py`, forma parte del diseno: lanza la busqueda con la consulta generada por el modelo y tambien con el sujeto visible en la pregunta, prioriza el articulo real sobre listas, peliculas, albumes y paginas de desambiguacion, lee primero la introduccion y solo profundiza si esta no contiene una respuesta del tipo adecuado, elimina corchetes y guias de pronunciacion, y devuelve una unica frase en lugar de un parrafo, porque el modelo de este tamano lee mal los parrafos.

## Capacidades

- Generacion de texto conversacional en ingles, con voz deliberadamente llana y breve.
- Decision autonoma de buscar: distingue cuando necesita informacion externa y cuando no.
- Escritura de la consulta de busqueda a partir de la pregunta del usuario.
- Lectura comprensiva de prosa real (articulos de Wikipedia en vivo), no solo de resultados curados.
- Respuesta con atribucion explicita: indica que lo ha comprobado en lugar de presentarlo como conocimiento propio.
- Conversacion multi-turno: mantiene el hilo en conversaciones de al menos 5 turnos (5/5 en la bateria de aceptacion).
- Uso de herramientas mediante etiquetas de busqueda (`<lookup>...</lookup>`) y modo sin herramientas (`<tools:off>`) sin filtrar etiquetas.
- Declaracion de limites personales: rechaza responder sobre datos que no puede conocer del usuario (8/8).
- Cese autonomo de la generacion (12/12).
- Multi-step reasoning y soporte de agentes: si, en la medida en que encadena decision de busqueda, generacion de consulta y respuesta sobre el resultado, dentro de un harness de agente.
- Capacidades multilingues: no. Solo ingles declarado.
- Vision, audio, matematica y calculo aritmetico: fuera de alcance (0/6 en sumas pequenas).

## Casos de uso

- Asistente RAG ligero con atribucion: el modelo decide buscar, formula la consulta y responde citando que lo ha comprobado. Es adecuado porque su circuito de lectura y su declaracion de atribucion estan entrenados de forma especifica, y porque el consumo de recursos permite ejecutarlo junto al resto del sistema sin GPU dedicada.
- Generacion de consultas de busqueda en un pipeline mayor: se puede usar como modulo de reformulacion (pregunta del usuario a consulta de busqueda) y delegar la lectura final a un modelo mayor, aprovechando su 20/20 en decision de busqueda y escritura de consulta en los conjuntos de ajuste y reservado.
- Despliegue en el borde o en CPU: con 31,5 M de parametros, cabe en entornos sin acelerador y en dispositivos con memoria muy limitada, lo que permite asistentes de consulta factual offline o en local.
- Investigacion sobre circuitos de copia y lectura: sirve como caso de estudio reproducible de como el ritmo de aprendizaje en las matrices de atencion determina la aparicion de la habilidad de extraer informacion de un texto, con resultados antes/despues documentados.
- Estudio comparativo de metodologia de entrenamiento: el par Weave 2 (59,65 M, fallido por metodo) y Weave 3 (31,5 M, mejor) es un ejemplo util para analizar el impacto del enmascaramiento de perdida, el empaquetado de conversaciones y el uso del optimizador Muon.
- Evaluacion de harnesses de agentes: `harness.py` implementa heuristicas concretas (preferencia de articulo, lectura de la introduccion, recorte a una frase) que se pueden auditar y comparar con otras estrategias de recuperacion en modelos diminutos.
- Base para experimentos de fine-tuning desde cero: al ser un modelo propio y con licencia MIT, es un punto de partida limpio para estudiar tecnicas de ajuste en regimen de pocos parametros.
- Demostraciones educativas de uso de herramientas: el esquema de etiquetas (`<tools:on>`/`<tools:off>`, `<lookup>`) ilustra de forma simple como un modelo pequeno puede interactuar con un entorno externo.

## Benchmarks y rendimiento

Bateria de aceptacion, fila por fila, ejecutada con el mismo harness y ajustes que recibe un usuario (2026-09-20). El total iguala al mejor de la familia Loom:

| Fila | Loom Weave 3 |
|---|---:|
| A · dice su propio nombre | 10/12 |
| B · su propio nombre con escritura descuidada | 10/12 |
| C · conversacion de 5 turnos mantiene el hilo | 5/5 |
| D · responde a partir de un resultado de busqueda proporcionado | 5/5 |
| E · pregunta de seguimiento respondida con el mismo resultado | 2/5 |
| F · dice que ha mirado, tras una busqueda | 5/5 |
| G · nunca afirma una busqueda que no ha hecho | 16/16 |
| H · admite lo que no puede saber del usuario | 8/8 |
| I · dice cuando un resultado no contiene la respuesta | 0/5 |
| J · nunca filtra una etiqueta de busqueda con herramientas desactivadas | 28/28 |
| K · se detiene por si solo | 12/12 |
| L · busca cuando debe, no para datos privados | 19/20 |
| Total | 120/133 |

Evaluacion de extremo a extremo con preguntas cotidianas no vistas, Wikipedia en vivo y consulta escrita por el propio modelo, puntuando la respuesta final:

| Conjunto | Decidio buscar | Escribio su propia consulta | La respuesta llego al modelo | Respondio bien |
|---|---:|---:|---:|---:|
| Ajuste | 20/20 | 20/20 | 14/20 | 11/20 |
| Reservado | 20/20 | 20/20 | 12/20 | 6/20 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del recuento de parametros: en FP32 en torno a 126 MB, en FP16/BF16 en torno a 63 MB, en int8 en torno a 32 MB y en GGUF de 4 bits en torno a 16-20 MB, mas el coste del contexto (1024 tokens) y del runtime.
- Cabe con holgura en cualquier GPU de consumo, incluidas integradas y modelos muy antiguos; tambien en CPU y en dispositivos tipo Raspberry Pi. Una RTX 4090 o una A100 estan sobredimensionadas para este modelo.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama a traves del GGUF publicado, y text-generation-inference, ya que el repositorio declara la etiqueta `text-generation-inference` y `endpoints_compatible`.
- El harness de busqueda requiere conectividad a Wikipedia en vivo; sin red, el modelo funciona en modo conversacional sin herramientas.
- Latencia y throughput estimados: no disponible. No se publican cifras de tokens por segundo ni de tiempo de respuesta en la model card.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar de modelos de terceros en la informacion proporcionada. La comparacion se limita a los modelos de la propia familia Loom citados en la model card:

| Modelo | Parametros | Contexto | Licencia | Resultado documentado |
|---|---:|---|---|---|
| Loom Weave 3 | 31,5 M (31.469.952) | 1024 | MIT | 120/133 en la bateria de aceptacion; primera Loom en leer prosa en vivo por encima del azar en el conjunto de ajuste (11/20) |
| Loom Weave 2 | 59,65 M | no disponible | no disponible | Considerado fallido por metodo: "una capa fina de instrucciones sobre un registro de preentrenamiento" |
| Loom Spark 3 | 12,2 M | no disponible | no disponible | Exitoso, supero a Spark 2 (19,9 M) |
| Loom Spark 2 | 19,9 M | no disponible | no disponible | Superado por Spark 3 |

Comparativa con modelos de otros fabricantes: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Lectura en vivo sobre datos reservados en torno al 30 %. Que el modelo diga "lo he mirado" significa que ha buscado, no que haya leido correctamente el resultado. El propio autor recomienda ejecutar `harness.py --show` y confiar en la frase que el modelo ha leido.
- No es una calculadora: las sumas pequenas quedan fuera de alcance (0/6). Para aritmetica hay que usar una herramienta externa.
- Las preguntas de seguimiento sobre el mismo resultado son mas debiles, con alrededor de un 40 % de acierto (fila E: 2/5).
- Nunca indica que un resultado no contiene la respuesta: contesta a partir de lo que haya leido (fila I: 0/5).
- Rara vez pide aclaracion ante una peticion ambigua.
- Lee mucho mejor un resultado proporcionado que una busqueda en vivo (fila D al 100 % frente al rendimiento end-to-end).
- La busqueda del harness se limita a Wikipedia: no puede responder sobre hora, clima, noticias ni precios.
- Es un lector/asistente pequeno, no un estilista conversacional: el registro es sobrio y breve por diseno.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Riesgo de alucinacion documentado en el historial de la familia: versiones anteriores inventaban respuestas sobre datos personales del usuario, problema que Weave 3 corrige parcialmente con ejemplos especificos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo depende de un harness que consulta Wikipedia en vivo, cuyos contenidos tienen sus propias condiciones de reutilizacion y atribucion.
- Metadatos inconsistentes en HuggingFace: las fechas de creacion y actualizacion (2026-09-20) son posteriores a la fecha actual, lo que conviene verificar antes de citarlas.
- El repositorio no registra descargas ni valoraciones (0 descargas, 0 likes) en el momento de la consulta.
- La model card aparece truncada en el apartado final ("What it does do, reliably"), por lo que podria faltar informacion adicional sobre capacidades fiables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/textilelabs/Loom-Weave-3
- Predecesor Loom Weave 2: https://huggingface.co/textilelabs/Loom-Weave-2
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces encontrados correspondian a documentacion de soporte de Microsoft y no guardan relacion con Loom Weave 3.
- Paper, blog o repositorio adicionales: no disponible.
