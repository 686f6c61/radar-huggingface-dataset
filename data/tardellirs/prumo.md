# tardellirs/prumo

## Resumen

Prumo es un motor de decisión simbólico publicado por el usuario tardellirs en HuggingFace bajo licencia Apache-2.0. No es un modelo de lenguaje: no contiene pesos, ni embeddings, ni parámetros aprendidos. Recibe un *estado* y un conjunto de *preguntas tipadas* en el formato wire de Decision Index / `systemone` (opciones de tipo `choice` y `noul`) y devuelve una distribución de probabilidad sobre cada opción. Su funcionamiento es un pipeline fijo de capacidades genéricas —ejecución de código, búsqueda en posiciones de ajedrez, validación de llamadas a herramientas, ranking BM25, lógica booleana, puzzles, fechas y aritmética— cada una de las cuales reconoce una estructura en la petición y la resuelve de forma exacta. Cuando ninguna capacidad aplica, devuelve una distribución uniforme y, por tanto, su puntuación esperada es exactamente la del azar.

El interés del proyecto es acotar el extremo de cero parámetros de la relación tamaño/calidad. Según el autor, Prumo obtiene un índice público de 20,14 en Decision Index 0.3 con la suite oficial completa (140.178 peticiones), frente a 1,55 de otro participante basado en reglas y 7,44 y 13,01 de modelos aprendidos de 17M y 68M de parámetros respectivamente. El "tamaño" declarado es de 700 constantes escritas a mano, sin descarga de pesos, ejecutándose en un solo hilo de CPU con una mediana de 0,2 ms por petición.

El nombre viene del portugués *prumo*, la plomada: una herramienta exacta que no aprende nada. Es relevante ahora como referencia de suelo para evaluaciones de agentes y toma de decisiones: mide cuánto de un benchmark de decisión es alcanzable sin aprendizaje estadístico alguno, y lo hace de forma determinista y reproducible bit a bit entre macOS y Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Pipeline determinista de reglas y capacidades simbólicas (rule-based, symbolic), sin pesos ni embeddings |
| Parametros totales | 0 parametros aprendidos; 700 constantes escritas a mano |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el concepto de ventana de contexto no aplica; la entrada es un estado mas un conjunto de preguntas) |
| Tipos de cuantizacion | No aplica: no hay pesos que cuantizar |
| Idiomas soportados | Ingles (partes lexicas); los solvers exactos son agnosticos al idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica: sin pesos. Distribucion como codigo Python (~2.700 lineas en `prumo_rules/`), libreria `decision-index`, CPython >= 3.10, dependencia `chess==1.11.2` |

## Arquitectura y entrenamiento

No hay entrenamiento. Prumo es un pipeline fijo de capacidades que se evalúan en el mismo orden para cada petición: `code → chess → tools → retrieval → grounding → consensus → labels → music → logic → puzzles → dates → arith`. Cada capacidad o bien *reclama* la pregunta y devuelve probabilidades, o bien la cede a la siguiente. Una pregunta que ninguna capacidad reclama recibe la distribución uniforme, con una elección determinista por hash para la opción reportada, de modo que su puntuación esperada es exactamente la del azar. El motor no consulta nombres de benchmarks, identificadores de ítems ni tablas de respuestas, y usa un único formato de respuesta para todas las peticiones.

Las capacidades concretas incluyen: ejecución de código Python en sandbox cuando hay una `def` parseable con una llamada o tests (elige la opción igual al valor, o responde pass/fail); búsqueda alfa-beta con quiescence sobre una FEN, con evaluación de material y tablas pieza-casilla de manual, con presupuesto de 7.000 nodos por pregunta; validación de llamadas a herramientas contra su esquema (la herramienta existe, está relacionada con la petición y todo valor requerido ha sido declarado por el usuario) para responder call / ask / cannot; recuperación BM25 con IDF sobre los propios candidatos de la petición; grounding léxico que exige la presencia de números y nombres y una cobertura de al menos el 70 % de las palabras de contenido; consenso por centroide léxico (BM25 normalizado medio frente a todas las opiniones); etiquetado con solapamiento ponderado por IDF; emparejamiento de plantillas de acordes; evaluación exacta de lógica booleana, tablas de verdad y SAT por enumeración; y puzzles de ordenación, intercambios, movimientos, horarios, rutas SVG, brackets y ordenación de palabras. Todos los presupuestos se cuentan en operaciones, no en segundos, lo que garantiza respuestas idénticas bit a bit entre ejecuciones.

## Capacidades

- Ejecución de código Python en sandbox para resolver preguntas de tipo CRUXEval (skill declarada de 0,997).
- Validación y selección de llamadas a herramientas contra esquemas: decisión call / ask / cannot según existencia, relevancia y completitud de los valores requeridos.
- Búsqueda en posiciones de ajedrez desde una FEN con opciones de movimientos legales, mediante alfa-beta con quiescence.
- Ranking de recuperación con BM25 e IDF calculado sobre los candidatos de la propia petición.
- Verificación de grounding léxico entre una afirmación y su evidencia, o entre una respuesta y su fuente.
- Agregación de consenso entre opiniones de participantes.
- Clasificación y etiquetado con detección de fuera de alcance cuando no hay solapamiento léxico.
- Reconocimiento de acordes a partir de notas con marca temporal y opciones de clase de altura.
- Lógica booleana exacta, tablas de verdad (se deduce / contradicho / indeterminado), SAT por enumeración y puzzles de mentirosos y veraces.
- Resolución de puzzles combinatorios: restricciones de orden, intercambios, movimientos, horarios, rutas SVG, brackets y ordenación de palabras.
- Aritmética y tratamiento de fechas.
- No soporta tool calling generativo ni razonamiento multi-paso abierto: solo valida y decide sobre estructuras reconocibles.
- No tiene modo thinking, visión ni audio.
- Determinismo bit a bit entre macOS y Linux; un solo hilo de CPU.

## Casos de uso

- **Capa de abstención en pipelines de agentes**: colocar Prumo delante o detrás de un LLM para decidir de forma determinista cuándo una llamada a herramienta está bien formada y cuándo debe pedirse aclaración o rechazarse, usando su validación contra esquema (call / ask / cannot).
- **Verificación de grounding en generación aumentada**: comprobar que los números y nombres de una respuesta aparecen en la fuente y que al menos el 70 % de las palabras de contenido están cubiertas antes de publicar la respuesta.
- **Ejecución de código como oráculo de evaluación**: resolver ítems de tipo CRUXEval ejecutando el código en sandbox y comparando con las opciones, útil para construir líneas base reproducibles en la evaluación de modelos de código.
- **Ranking reproducible de candidatos**: ordenar documentos, respuestas o elementos de un catálogo con BM25 e IDF calculados sobre el propio conjunto de candidatos de la petición, sin dependencia de un índice externo ni de un modelo de embeddings.
- **Motor de ajedrez para tests y demos**: resolver selecciones de movimiento sobre FEN con un presupuesto fijo de 7.000 nodos, útil como componente determinista en entornos educativos o de prueba.
- **Suelo de referencia en benchmarks de decisión**: ejecutar la suite pública de Decision Index para establecer la puntuación alcanzable sin aprendizaje y comparar contra modelos aprendidos pequeños (17M, 68M).
- **Resolución de puzzles y restricciones en backoffice**: horarios, ordenaciones, brackets y rutas SVG resueltos por enumeración exhaustiva con presupuesto de operaciones acotado.
- **Consenso y etiquetado en anotación**: agregar opiniones de anotadores mediante centroide léxico o asignar etiquetas con detección explícita de fuera de alcance.

## Benchmarks y rendimiento

Datos declarados por el autor (métrica `public_index`, marcada como `verified: false` en el model-index). La puntuación procede de una ejecución propia con el kit oficial, 140.178 peticiones, run completo.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Typed decisions (choice / noul) | Decision Index 0.3 (public suite) | Public index (self-run, kit oficial, 140.178 peticiones) | 20,14 |

Resultados por capacidad reportados en la model card:

| Capacidad | Benchmark | Puntuación declarada |
|---|---|---|
| Ejecución de código | CRUXEval (skill) | 0,997 |
| Validación de llamadas a herramientas | When2Call | 0,70 |
| Validación de llamadas a herramientas | BFCL | 0,67 |

Referencias incluidas por el autor en la misma suite:

| Entrada | Índice público |
|---|---|
| Prumo (0 parámetros aprendidos, rule-based) | 20,14 |
| Otro participante rule-based | 1,55 |
| Modelo aprendido de 17M de parámetros | 7,44 |
| Modelo aprendido de 68M de parámetros | 13,01 |

En conocimiento, sentido común y NLI el autor declara que el motor se queda en el nivel del azar por diseño.

## Requisitos de hardware

- VRAM: no aplica. No hay pesos ni aceleración por GPU; la ejecución es en CPU.
- GPU recomendadas: ninguna. El autor indica explícitamente "no GPU".
- CPU: un solo hilo es suficiente. CPython >= 3.10.
- Huella de código: aproximadamente 2.700 líneas de Python (`prumo_rules/`) más una dependencia en Python puro, `chess==1.11.2`, usada solo para generación de movimientos.
- Despliegue: como librería Python con `library_name: decision-index`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican al no existir pesos.
- Latencia declarada: mediana de 0,2 ms por petición, media de 5,1 ms, en un hilo de CPU.
- Throughput: no disponible de forma explícita; a partir de la latencia media puede estimarse en el orden de centenares de peticiones por segundo por hilo, pero es una extrapolación, no un dato publicado.
- Determinismo: los presupuestos se cuentan en operaciones, no en tiempo, y las ejecuciones en macOS y Linux producen respuestas idénticas bit a bit.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Índice público (Decision Index 0.3) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Prumo | Rule-based / simbólico | 0 aprendidos (700 constantes) | 20,14 (autoevaluado) | No aplica | Apache-2.0 | HuggingFace + código |
| Otro participante rule-based | Rule-based | No disponible | 1,55 | No disponible | No disponible | No disponible |
| Modelo aprendido de 17M | Aprendido | 17M | 7,44 | No disponible | No disponible | No disponible |
| Modelo aprendido de 68M | Aprendido | 68M | 13,01 | No disponible | No disponible | No disponible |

Los nombres de los tres modelos de referencia no se indican en la información disponible. La comparación se limita a la suite Decision Index 0.3; no hay datos comparativos en CRUXEval, When2Call ni BFCL frente a esos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Abstención por diseño**: en conocimiento, sentido común y NLI el motor devuelve distribución uniforme; su puntuación esperada en esas tareas es exactamente la del azar. No debe usarse como sustituto de un LLM para preguntas abiertas.
- **Cobertura estructural**: solo responde cuando la petición encaja en una de las estructuras reconocidas (código Python parseable, FEN, esquema de herramientas, lógica booleana, etc.). Fuera de ellas no hay respuesta útil.
- **Idioma**: las partes léxicas (BM25, grounding, etiquetas) están diseñadas para inglés; los solvers exactos son agnósticos, pero las capacidades basadas en texto no están validadas en castellano.
- **Benchmarks no verificados**: el índice 20,14 está marcado con `verified: false` y procede de una ejecución del propio autor con el kit oficial; no hay replicación independiente en la información disponible.
- **Ejecución de código**: la capacidad `code` ejecuta Python en un sandbox; en producción conviene auditar el aislamiento y no confiar en él como frontera de seguridad sin revisión propia.
- **Dependencia única**: requiere `chess==1.11.2` fijado; no se documenta comportamiento con otras versiones.
- **Sin rastro de comunidad**: 0 descargas y 0 likes en el momento de la consulta; el proyecto es reciente y sin validación externa conocida.
- **Licencia**: Apache-2.0 permite uso comercial y modificación con atribución y aviso de cambios; no se documentan restricciones adicionales, pero tampoco garantías explícitas más allá de las de la propia licencia.
- **Fecha de publicación**: la ficha de HuggingFace figura creada el 2026-10-17, dato que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tardellirs/prumo
- Kit oficial Decision Index: https://github.com/apolinario/decision-index
- Espacio Decision Index (formato wire JEV / systemone): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Dependencia de ajedrez en PyPI: https://pypi.org/project/chess/
