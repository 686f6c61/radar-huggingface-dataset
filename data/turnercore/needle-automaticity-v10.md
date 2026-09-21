# turnercore/needle-automaticity-v10

## Resumen

Needle Automaticity V10 es un modelo compacto de llamada a herramientas (tool calling) con alcance acotado, publicado por el usuario turnercore y disenado especificamente para el runtime Needle Point. Con 26.233.344 parametros (unos 26,2 millones) y un repositorio de 0,1 GB, no es un modelo de proposito general: su model card lo define explicitamente para "sensing rapido, acciones finitas puntuales y expresion simple", excluyendo la planificacion abierta y los argumentos de herramienta sin restricciones.

El modelo trabaja sobre un conjunto cerrado de 36 capacidades permitidas, con dominios de argumentos limitados a enum cerrados, constantes, booleanos y arrays finitos. Las capacidades abiertas quedan excluidas por diseno. Esto lo situa en la categoria de modelos de enrutamiento y desambiguacion de acciones, pensados para ejecutarse bajo decodificacion restringida estricta y con un conjunto finito de herramientas candidatas por peticion.

Su relevancia actual es doble. Por un lado, demuestra que un modelo de ~26 M de parametros puede alcanzar un 99,72 % de coincidencia exacta en un benchmark familiar aislado de 360 casos cuando se combina con decodificacion restringida. Por otro, la propia model card publica un resultado mucho mas conservador en un holdout adversarial fresco (56 % de coincidencia exacta), lo que convierte esta ficha en un caso de estudio util sobre la diferencia entre rendimiento en distribucion curada y robustez ante formulaciones nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en detalle en la model card; se describe como modelo compacto y acotado de tool calling, derivado de JAX Needle (commit `ffb1c5144c5a16cb8ec650dbc8a6f6fd3854f8f2`) y convertido para el runtime Needle Point |
| Parametros totales | 26.233.344 (dato real del fichero safetensors) |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos sin cuantizar en `model.safetensors` |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `tokenizer.model` (tokenizador SentencePiece) |
| Biblioteca / runtime | `needle-point` (libreria declarada en la model card); requiere el runtime Needle Point en modo de decodificacion restringida estricta |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Capacidades permitidas | 36 capacidades con enum cerrado, constantes, booleanos y arrays finitos |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (no se indica si es un transformer denso, un modelo recurrente o una variante hibrida), pero si identifica su procedencia: el checkpoint se entreno con el JAX Needle original fijado al commit `ffb1c5144c5a16cb8ec650dbc8a6f6fd3854f8f2` y despues se convirtio para Needle Point. El modelo opera bajo decodificacion restringida estricta, es decir, la salida se valida y se fuerza contra un esquema de herramientas cerrado, lo que explica que todos los outputs del benchmark de validacion se parsearan y validaran sin recurrir a ningun fallback de restricciones.

El entrenamiento uso un corpus asistido por JEV de 1.767 filas. Segun el autor, JEV se empleo para auditar etiquetas e identificar ejemplos dificiles a los que dar exposicion adicional, pero las respuestas del profesor no se copiaron en las etiquetas de entrenamiento. Todas las discrepancias de accion se revisaron manualmente y se conservaron las etiquetas gold canonicas. Este diseno es relevante porque el propio autor reconoce que la ponderacion de ejemplos dificiles tuvo un efecto medible: el checkpoint asistido gano recall de accion pero perdio precision en la frontera de "no llamar herramienta" frente al checkpoint gold no asistido.

## Capacidades

- Llamada a herramientas acotada: selecciona acciones dentro de un conjunto cerrado de 36 capacidades permitidas, con argumentos limitados a enum cerrados, constantes, booleanos y arrays finitos.
- Function calling bajo decodificacion restringida: la salida se fuerza contra el esquema de la herramienta, de modo que las llamadas generadas parsean y validan.
- Deteccion de frontera "sin herramienta": el modelo esta entrenado explicitamente para decidir cuando no debe invocarse ninguna capacidad (lane "hard no-tool boundary" en su evaluacion).
- Enrutamiento y sensing rapido: pensado para seleccionar una accion finita y puntual, no para descomponer tareas largas.
- Expresion simple: la model card menciona la "expresion simple" como uno de sus usos previstos, dentro de los limites del esquema.
- Capacidades excluidas por diseno: no cubre planificacion abierta ni generacion de argumentos de herramienta sin restricciones; las capacidades abiertas quedan fuera del conjunto permitido.
- Multilingue: no disponible; la model card no declara idiomas soportados.
- Vision, audio y modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento de acciones en asistentes conversacionales con catalogo cerrado: el modelo recibe un conjunto finito de herramientas candidatas por peticion y devuelve la llamada correspondiente. Es adecuado porque el runtime valida la salida contra el esquema, reduciendo el riesgo de argumentos malformados.
- Capa de guardarraíl previa a un modelo mayor: dado que distingue entre "hay herramienta que llamar" y "no hay herramienta que llamar", puede usarse para descartar o derivar consultas fuera de alcance antes de invocar un LLM de mayor tamano y coste. El holdout adversarial al 60 % en casos sin herramienta obliga a combinarlo con reglas adicionales.
- Automatizacion de domotica y comandos de dispositivo: acciones como encender, apagar o fijar un valor encajan en el patron de enum cerrado y constante. El tamano de 26 M permite ejecutarlo en el mismo dispositivo o en un nodo de borde.
- Gestion de tickets y operaciones internas: crear, asignar, cerrar o etiquetar incidencias con campos enumerados. La decodificacion restringida garantiza que los campos obligatorios del sistema de ticketing esten presentes y con valores validos.
- Extraccion de parametros estructurados en formularios de reserva: seleccion de franjas, categorias o modos de un array finito. Al no permitir argumentos abiertos, el modelo no inventa valores fuera del catalogo.
- Clasificacion de intencion con salida tipada: en lugar de texto libre, el modelo emite la accion y sus argumentos, lo que simplifica el consumo posterior en pipelines de automatizacion.
- Validacion de esquemas de herramientas en CI: puede usarse como comprobador de que un esquema de 36 capacidades es coherente y de que las peticiones de ejemplo se resuelven sin fallback de restricciones, segun indica el autor que ocurrio en su benchmark.
- Prototipado de agentes de un solo paso: para flujos en los que se necesita "una accion, sin planificacion", encaja mejor que un modelo generalista que tiende a sobre-razonar o a producir llamadas encadenadas.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos mediante decodificacion restringida estricta de Needle Point sobre un benchmark aislado por familia de 360 casos:

| Lane | Coincidencia exacta |
|---|---|
| Accion / llamada a herramienta | 215/216 (99,5370 %) |
| Frontera dura sin herramienta | 144/144 (100 %) |
| Combinado | 359/360 (99,7222 %) |

Segun el autor, todas las salidas parsearon y validaron, ningun caso de frontera se sobrellamo y no se produjo ningun fallback de restriccion.

Holdout adversarial fresco de 100 casos (estimacion mas conservadora):

| Lane | Needle Automaticity V10 | Checkpoint gold no asistido |
|---|---|---|
| Accion (60 casos) | 53,33 % | 36,67 % |
| Sin herramienta (40 casos) | 60 % | 90 % |
| Combinado (100 casos) | 56 % | 58 % |
| Salidas validas | 98 % | No disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, y no procede extrapolarlos: se trata de un modelo acotado de tool calling, no de un modelo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de los 26.233.344 parametros, sin contar cache de atencion ni overhead del runtime): aproximadamente 105 MB en fp32, 52 MB en bf16/fp16, 26 MB en int8 y 13 MB en int4. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: no disponible. Con este volumen de parametros cualquier GPU moderna, incluida una GPU integrada o una RTX de gama de entrada, es suficiente en terminos de memoria.
- GPU de consumo: si cabe con holgura en cualquier GPU de consumo actual y en muchos SoC; no requiere A100 ni H100.
- Opciones de despliegue: el modelo esta pensado para el runtime Needle Point con decodificacion restringida estricta, y es necesario proporcionar un conjunto finito de herramientas candidatas en cada peticion. No hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Requisito funcional critico: la model card advierte que debe usarse el runtime estricto de Needle Point; no esta pensado para autorizar herramientas ni para saltarse las comprobaciones de politica del runtime.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, por lo que los campos cuantitativos se marcan como no disponibles. La comparacion relevante aqui es de categoria, no de cifras:

| Modelo | Categoria | Tamano | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| needle-automaticity-v10 | Tool calling acotado para un runtime especifico, con decodificacion restringida | 26.233.344 parametros | No disponible | apache-2.0 | 99,72 % en benchmark propio de 360 casos; 56 % en holdout adversarial |
| Alternativas generalistas de function calling (por ejemplo, modelos de 1B a 7B orientados a herramientas) | Tool calling de proposito general, sin conjunto cerrado de capacidades | No disponible | No disponible | No disponible | No disponible |
| Modelos frontera con tool calling | Uso general, planificacion abierta y llamadas encadenadas | No disponible | No disponible | No disponible | No disponible |

La diferencia clave frente a esas categorias, segun la propia documentacion del modelo, es el alcance: aqui no hay planificacion abierta ni argumentos libres, y el modelo no debe usarse para autorizar herramientas.

## Limitaciones y advertencias

- Caida fuerte de rendimiento fuera de distribucion: el holdout adversarial fresco baja al 56 % de coincidencia exacta frente al 99,72 % del benchmark curado. El propio autor lo califica como la estimacion mas conservadora de robustez ante formulaciones nuevas.
- Compromiso entre recall y precision en la frontera: el checkpoint asistido por ejemplos dificiles obtiene mejor recall de accion (53,33 % frente a 36,67 %) pero mucha peor precision sin herramienta (60 % frente a 90 %) que el checkpoint gold no asistido. Es un trade-off explicito, no un defecto oculto.
- Riesgo de sobrellamada de herramientas en produccion: con un 60 % de acierto en casos de "no llamar herramienta" bajo wording adversarial, conviene anadir reglas deterministas o un segundo filtro antes de ejecutar acciones con efectos secundarios.
- Alcance funcional limitado: no sirve para planificacion abierta, razonamiento multi-paso largo ni argumentos de herramienta no restringidos. Solo cubre 36 capacidades con dominios cerrados.
- Dependencia del runtime: los resultados publicados dependen de la decodificacion restringida estricta de Needle Point. Fuera de ese runtime no hay garantia de reproducir las cifras ni el formato de salida.
- La frontera de seguridad no es responsabilidad del modelo: la model card indica expresamente que el modelo no esta pensado para autorizar herramientas ni para eludir las comprobaciones de politica del runtime.
- Idiomas soportados: no disponibles. No se debe asumir cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar escenarios de conversacion larga con datos objetivos.
- Validacion de la comunidad inexistente: 0 descargas y 0 likes, repositorio creado y actualizado el mismo dia (21 de septiembre de 2026). No hay evidencia externa de uso en produccion.
- Riesgo de alucinacion: la decodificacion restringida reduce la generacion de argumentos invalidos, pero no hay datos publicados sobre el comportamiento ante entradas fuera del dominio o mal formadas.
- Licencia: apache-2.0, permisiva para uso comercial, pero no se especifica en la informacion disponible la situacion de posibles componentes de terceros (tokenizador o codigo upstream de JAX Needle), que conviene verificar antes de un despliegue comercial.
- Procedencia del autor: no hay informacion disponible sobre el desarrollador ni sobre el proceso de mantenimiento del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/turnercore/needle-automaticity-v10
- Commit de JAX Needle usado en el entrenamiento (citado en la model card): `ffb1c5144c5a16cb8ec650dbc8a6f6fd3854f8f2`
- Hash de `model.safetensors`: `7bf8417fb2dc6ff03f33549e959e6aa4dd06898ab4a3d7d160f63bee1e4693af`
- Hash de `config.json`: `bb90a73f354403511e0c83df8a5962e04752be831af386074080423aec34695e`
- Hash de `tokenizer.model`: `0823f5b9133c68a8140addc5d7a425fa9119c4c8cb4a550363b4bffa4ba1c8c7`
- Paper, blog, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces recuperados correspondian a paginas de ayuda de Google Search, Gmail y Google Maps sin relacion con esta ficha.
