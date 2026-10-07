# stanley-nv/toolrouter

## Resumen

ToolRouter es un clasificador de intencion de proposito muy especifico: dado un texto de consulta y una lista de herramientas descritas en lenguaje natural (nombre y descripcion, opcionalmente ejemplos de uso), devuelve cual de ellas debe invocarse junto con una distribucion de probabilidades por herramienta y un valor de confianza. Lo desarrolla el usuario stanley-nv y se distribuye bajo licencia MIT, con pesos en un unico archivo numpy (`toolrouter.npz`, 7,66 MB). No es un modelo generativo: es un enrutador previo pensado para colocarse delante de un LLM o de un agente y decidir que funcion llamar.

Tecnicamente parte del backbone estatico `minishlab/potion-base-8M` (embeddings de palabras de 256 dimensiones, almacenados en int8) y combina similitud coseno entre consulta y varios campos de la herramienta (nombre, descripcion, nombre mas descripcion) con solapamiento lexico y una cabeza de identidad entrenada. Su rasgo mas llamativo es el coste: inferencia en CPU con numpy puro, sin PyTorch, con latencias declaradas de 0,10 a 0,16 ms en caliente para 10 herramientas y unos 2 ms en la primera peticion.

Es relevante porque ataca un cuello de botella muy concreto de los agentes actuales, el enrutado de herramientas, con un modelo de menos de 8 MB que puede ejecutarse en el navegador o en hardware modesto. Su naturaleza *open-set* permite enrutar sobre herramientas que nunca vio en entrenamiento (0,890 de exactitud con 10 herramientas no vistas), aunque su mejor escenario declarado sigue siendo un conjunto pequeno de herramientas conocidas (0,936 con las 7 herramientas prioritarias).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Enrutador de similitud sobre embeddings estaticos (derivado de model2vec/potion) mas cabeza de identidad entrenada; no es un transformer generativo |
| Parametros totales | Aproximadamente 8 M en el backbone (`minishlab/potion-base-8M`); la cabeza de identidad anade un vector por herramienta prioritaria. Cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no se documenta una ventana de contexto. La consulta se procesa con un tokenizador WordPiece propio y pooling por media |
| Tipos de cuantizacion | Embeddings almacenados en int8 dentro de `toolrouter.npz` (7,66 MB). No se publican variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `.npz` de numpy (archivo unico `toolrouter.npz`, 7,66 MB, incluye el backbone). Existe ademas un port a JavaScript en `web/` |

Datos adicionales del repositorio: pipeline declarado `text-classification`, libreria `toolrouter`, modelo base `minishlab/potion-base-8M`, conjunto de datos `stanley-nv/tool-routing-data`, 0 descargas y 0 likes en el momento de la consulta, region `us`.

## Arquitectura y entrenamiento

El modelo no es una red neuronal profunda al uso. La puntuacion de cada herramienta se calcula con una combinacion lineal fija de similitudes coseno y solapamiento lexico: `score(query, tool) = 7·cos(q, t_full) + 3·cos(q, t_desc) + 2·cos(q, t_name) + (0,5, 0,5, 0,5, 0,25)·lexical_overlap + identity_head`. Los vectores `q` y `t_*` son embeddings estaticos de word-piece de 256 dimensiones procedentes de `minishlab/potion-base-8M` (licencia MIT), almacenados en int8, con mean-pooling y normalizacion. Si la herramienta incluye consultas de ejemplo, `cos(q, t_full)` pasa a ser el maximo entre la descripcion y los ejemplos. Los pesos semanticos (7, 3, 2 y los del solapamiento lexico) son fijos, ajustados manualmente a partir de un ablation; no se aprenden.

Lo unico entrenado es la cabeza de identidad: una bolsa de n-gramas hasheada mas el embedding denso de la consulta, con un vector por herramienta prioritaria, aplicada a las 7 herramientas prioritarias (`wiki`, `websearch`, `weather`, `news`, `files`, `shell`, `other`) y a sus alias (por ejemplo `web`, `terminal`). El entrenamiento es episodico, con consulta objetivo y herramientas distractoras aleatorias con estilos variados de nombre y descripcion. La salida se normaliza con un softmax de temperatura calibrada para producir `probabilities`, y `confidence` es la probabilidad de la herramienta elegida. El tokenizador WordPiece esta implementado en Python puro y la inferencia solo requiere numpy. El repositorio incluye un informe de desarrollo con ablations y resultados negativos: no ayudaron aprender la ruta semantica, el fine-tuning sobre ToolRet, una cabeza MLP, MaxSim, pooling con IDF ni un backbone mayor o comprimido de 32M.

## Capacidades

- Enrutado de herramientas (tool routing / tool selection): devuelve la herramienta elegida en un formato estructurado estricto (`choice`) con probabilidades por herramienta y confianza.
- Clasificacion de intencion en texto de una sola consulta; no mantiene estado conversacional por si mismo.
- Funcionamiento *open-set*: las herramientas se definen en la propia peticion, por lo que puede enrutar sobre herramientas nunca vistas durante el entrenamiento.
- Soporte de descripciones de herramienta en varios formatos: cadena simple, diccionario con `description` y lista opcional de `examples`.
- Cabeza de identidad entrenada especificamente para 7 herramientas prioritarias y sus alias, con mayor exactitud que en el caso abierto.
- Salida con probabilidades calibradas, apta para umbralizar (por ejemplo, derivar a un LLM si la confianza es baja).
- Interfaz de linea de comandos (`python -m toolrouter.cli`), API de Python (`ToolRouter.from_pretrained`, `router.choose`, `router.handle`) y demo interactiva.
- Inferencia en CPU con numpy; tambien existe un port en JavaScript que se ejecuta en el navegador.
- No genera texto, no hace razonamiento multi-paso, no soporta vision ni audio, ni tool calling en el sentido de emitir llamadas a funciones: solo decide que herramienta usar.

## Casos de uso

- Pre-enrutado en agentes y asistentes: colocado antes de un LLM grande, reduce el numero de herramientas que se envian en el prompt del modelo principal. Con una latencia de 0,10 a 0,16 ms y una salida con confianza, permite reservar el LLM para los casos ambiguos (por ejemplo, con umbral de 0,8).
- Atencion al cliente automatizada: clasificar la consulta entrante entre un conjunto reducido de acciones (`wiki`, `files`, `other`, herramientas internas de facturacion o pedidos) para dirigirla al flujo adecuado. Su comportamiento con la etiqueta `other` evita invocaciones innecesarias en conversaciones informales.
- Asistentes de voz y sistemas embebidos: al no requerir GPU ni PyTorch y caber en un archivo de 7,66 MB, puede ejecutarse en dispositivos con recursos limitados, en el propio cliente o incluso en el navegador mediante el port a JavaScript.
- Enrutado en pipelines de RAG: decidir si una consulta debe resolverse contra un indice documental, contra busqueda web o contra una herramienta de datos antes de lanzar la recuperacion, evitando costes de embedding y busqueda en el caso de consultas de charla.
- Guardarraíl de coste en produccion: usar la confianza calibrada para decidir si se escala a un LLM mayor. En las pruebas declaradas, las predicciones con confianza igual o superior a 0,95 resultaron correctas en aproximadamente el 98 % de los casos.
- Enrutado dinamico sobre catalogos cambiantes: al ser open-set y tomar las herramientas de la peticion, permite anadir o renombrar herramientas sin reentrenar; la exactitud cae a 0,890 con 10 herramientas no vistas ofrecidas simultaneamente, y sube a 0,933 cuando se ofrecen en conjuntos aleatorios de 5.
- Clasificacion de intencion en integraciones de terceros: dado que el usuario describe las herramientas en la peticion, resulta util en plataformas donde cada cliente define su propio conjunto de funciones (por ejemplo, plugins o conectores configurables).
- Filtrado previo en sistemas con muchas rutas: seleccionar candidatos antes de una segunda etapa mas costosa, con la limitacion declarada de que funciona mejor con 10 herramientas o menos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. Todos los conjuntos de prueba estan separados (nunca usados en entrenamiento). Reproducibles con `python -m toolrouter.eval.evaluate --data-dir <dataset> --models toolrouter.npz --full`. Los valores del `model-index` figuran como no verificados (`verified: false`).

| Configuracion | Modelo publicado | Media de 3 semillas |
|---|---|---|
| 7 herramientas prioritarias, test independiente `routing/test2` (330 consultas) | 0,936 | 0,935 |
| Igual, con descripciones de herramienta reformuladas | 0,936 | 0,934 |
| 7 herramientas prioritarias, `routing/test` (210 consultas) | 0,933 | 0,932 |
| Igual, con descripciones de herramienta reformuladas | 0,938 | 0,935 |
| 10 herramientas nunca vistas en entrenamiento (`tools/test`), todas ofrecidas a la vez | 0,890 | 0,890 |
| Igual, con conjuntos aleatorios de 5 herramientas | 0,933 | 0,937 |
| Igual, con descripciones redactadas de otra forma / solo el nombre | 0,780 / 0,750 | No disponible |
| Descripciones desplazadas a herramientas incorrectas (comprobacion de cordura) | 0,060 | No disponible |
| Predicciones con confianza mayor o igual a 0,95 | Aproximadamente 98 % correctas (170 de 210 consultas de prioridad; 56 de 100 de herramientas no vistas) | No disponible |
| Latencia (CPU, 10 herramientas) | Aproximadamente 0,10 a 0,16 ms en caliente; aproximadamente 2 ms en la primera peticion | No disponible |

Resultados del `model-index` oficial: exactitud 0,936 en la tarea "Tool routing (7 priority tools)" sobre `routing/test2` y 0,890 en "Tool routing (10 tools never seen in training)" sobre `tools/test`.

## Requisitos de hardware

- GPU: no necesaria. La inferencia esta implementada en numpy puro sobre CPU y el autor la describe como CPU-only.
- VRAM: no aplica en el escenario previsto. El modelo no declara requisitos de VRAM; el unico artefacto de pesos ocupa 7,66 MB en disco y en memoria (int8).
- Memoria RAM: la huella es del orden de decenas de megabytes contando pesos, tokenizador y estructuras de numpy. No hay una cifra oficial publicada.
- GPU recomendadas: ninguna en particular. Si se ejecutase sobre GPU, cualquier acelerador moderno (RTX 4090, A100, H100) seria sobredimensionado para este modelo; no hay datos publicados de rendimiento en GPU.
- Compatibilidad con hardware de consumo: si, en cualquier CPU de consumo, y tambien en el navegador gracias al port en JavaScript de `web/` (verificado contra el codigo Python en 363 casos segun la model card).
- Opciones de despliegue: `pip install numpy huggingface_hub` mas clonado del repositorio; uso como modulo de Python (`from toolrouter import ToolRouter`); CLI (`python -m toolrouter.cli`); script de demostracion (`examples/demo_tools.py`); y el Space de demostracion. No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia: 0,10 a 0,16 ms en caliente con 10 herramientas y aproximadamente 2 ms en la primera peticion (CPU). El throughput no esta declarado; puede derivarse de la latencia, pero no hay una cifra publicada.
- Dependencias: solo numpy para inferencia, mas `huggingface_hub` para la descarga. No requiere PyTorch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la informacion proporcionada, por lo que la comparacion es cualitativa. Esta es la situacion frente a las alternativas habituales de enrutado:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| stanley-nv/toolrouter | Enrutador de similitud sobre embeddings estaticos | Aproximadamente 8 M en el backbone | No disponible | MIT | 0,936 con 7 herramientas prioritarias; 0,890 con 10 no vistas; latencia sub-milisegundo en CPU |
| minishlab/potion-base-8M | Modelo de embeddings estaticos (backbone de este modelo) | Aproximadamente 8 M | No disponible | MIT | Es la base reutilizada por toolrouter; no es un enrutador por si mismo |
| Enrutado con un LLM (LLM-as-router) | Modelo generativo instruido para elegir herramienta | Del orden de miles de millones (no disponible en detalle) | No disponible | Segun el modelo | Mayor coste y latencia por consulta; el autor propone usarlo como respaldo cuando la confianza del enrutador es baja |
| Routers de embeddings tipo semantic-router | Similitud vectorial sobre descripciones de rutas | No disponible | No disponible | No disponible | Enfoque conceptualmente cercano; no hay datos comparativos en la informacion disponible |
| Clasificador de intenciones supervisado clasico | Modelo discriminativo entrenado por intencion | No disponible | No disponible | Depende del desarrollo | Requiere reentrenar al cambiar el catalogo de herramientas; toolrouter es open-set |

## Limitaciones y advertencias

- Solo ingles. El modelo declara `en` como unico idioma soportado, por lo que su uso con consultas en castellano no esta validado.
- No es un modelo generativo ni de razonamiento: no produce texto, no ejecuta herramientas y no mantiene contexto conversacional multi-turno.
- Rendimiento sensible a la formulacion: con descripciones redactadas de otra forma la exactitud baja a 0,780, y a 0,750 si solo se proporciona el nombre de la herramienta. El experimento de cordura con descripciones asignadas a herramientas incorrectas cae a 0,060, lo que confirma la dependencia de la calidad de las descripciones.
- Escala limitada: el autor indica que funciona mejor con 10 herramientas o menos; no hay datos publicados con catalogos grandes.
- La parte semantica del scoring es fija y ajustada a mano, no aprendida; solo se entrena la cabeza de identidad de las 7 herramientas prioritarias. Esto limita la adaptabilidad fuera de ese conjunto.
- Riesgo de eleccion erronea en consultas ambiguas o con solapamiento entre herramientas; la confianza calibrada esta pensada para mitigarlo mediante umbrales (el autor sugiere un respaldo a un LLM por debajo de 0,8 aproximadamente).
- Licencia MIT: permite uso comercial y modificacion, pero el backbone `minishlab/potion-base-8M` tambien es MIT, por lo que conviene conservar las atribuciones correspondientes.
- Los resultados del `model-index` figuran como no verificados y el repositorio no tiene descargas ni likes, de modo que no existe validacion externa independiente.
- No se declara soporte para frameworks de servicio estandar (vLLM, Ollama, TGI, llama.cpp), lo que obliga a integrarlo como dependencia de Python o mediante el port a JavaScript.
- Los metadatos del repositorio indican una fecha de creacion poco habitual (2026-10-07); conviene verificar la version y el estado del repositorio antes de usarlo en produccion.
- Existe soporte de n-gramas hasheados y de un tokenizador WordPiece propio, no de un tokenizador estandar del ecosistema HuggingFace; esto puede complicar la interoperabilidad con otras herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanley-nv/toolrouter
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/stanley-nv/tool-routing-data
- Space de demostracion (playground, ejecuta el modelo en el navegador): https://huggingface.co/spaces/stanley-nv/toolrouter-playground
- Modelo base: https://huggingface.co/minishlab/potion-base-8M
- Paper referenciado en los tags (fastText, clasificacion de texto eficiente): https://arxiv.org/abs/1607.01759
- Paper referenciado en los tags (relacionado con embeddings estaticos y model2vec): https://arxiv.org/abs/2503.01763
- Informe de desarrollo, ablations y resultados negativos: `docs/REPORT.md` dentro del repositorio del modelo (https://huggingface.co/stanley-nv/toolrouter/blob/main/docs/REPORT.md)
- Codigo de inferencia, entrenamiento y evaluacion: directorio `toolrouter/` del repositorio del modelo
- Port a JavaScript: directorio `web/` del repositorio del modelo
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados correspondian a la marca de menaje y herramientas Stanley, sin relacion con el proyecto). No se han encontrado otros enlaces (blog, demo adicional o repositorio independiente) en la informacion disponible.
