# stanford-star/rt-j

## Resumen

RT-J (`rt-j`) es un checkpoint de Relational Transformer publicado por el grupo stanford-star de la Universidad de Stanford, disenado para prediccion de entidades sobre bases de datos relacionales multi-tabla en regimen zero-shot. A diferencia de los modelos tabulares clasicos, no requiere entrenamiento por tarea: una tarea se especifica mediante una celda objetivo enmascarada y un vecindario de contexto muestreado del grafo relacional, y la prediccion se obtiene en una unica pasada forward. El mismo checkpoint sirve tanto para clasificacion binaria de entidades como para regresion de entidades.

El modelo tiene 85.562.530 parametros (~85M), 12 bloques, `d_model` de 512, 8 cabezas de atencion y `d_ff` de 2048, con pesos almacenados en bfloat16. Utiliza atencion relacional sobre celdas, filas, columnas y enlaces de clave primaria/foranea, y las columnas de texto se pre-embeben con `sentence-transformers/all-MiniLM-L12-v2` (dimension de texto 384), que no forma parte del checkpoint ni se ajusta. Su contexto de entrenamiento alcanza las 8192 celdas.

Es relevante porque aborda un problema practico del aprendizaje profundo relacional: la necesidad de reentrenar un modelo para cada nueva tarea o esquema de base de datos. RT-J apuesta por un enfoque de foundation model con in-context learning y few-shot/zero-shot, apoyado en el ecosistema de benchmarks RelBench y en los datasets preprocesados the-join y plurel liberados por los mismos autores. La model card indica que el paper principal esta en progreso y que dos trabajos previos (PluRel y Relational Transformer) han sido superados por este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Relational Transformer (transformer con atencion relacional sobre celdas, filas, columnas y enlaces PK/FK); 12 bloques, 8 cabezas, `d_model` 512, `d_ff` 2048 |
| Parametros totales | 85.562.530 (~85M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 8192 celdas (contexto de entrenamiento); configurable en inferencia mediante `ctx_size_list` y `local_ctx_size` |
| Tipos de cuantizacion | no disponible (pesos bfloat16 en disco; `from_pretrained` carga float32) |
| Idiomas soportados | no disponible (las columnas de texto se pre-embeben con `all-MiniLM-L12-v2`, orientado a ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (395 tensores bfloat16, 171.164.252 bytes) |

## Arquitectura y entrenamiento

RT-J es un transformer de 12 bloques con atencion relacional propia de la familia Relational Transformer: la atencion opera sobre celdas, filas, columnas y los enlaces de clave primaria y foranea que definen el grafo de la base de datos. Las columnas textuales se procesan previamente con el embedder `sentence-transformers/all-MiniLM-L12-v2` (dimension 384), que no forma parte del checkpoint ni se ajusta durante el entrenamiento. La funcion de perdida empleada es Huber, y los metadatos del checkpoint indican `step=9000` y `swa_n=9000`, lo que sugiere un promedio de pesos (SWA) sobre las ultimas iteraciones.

El modelo se presenta como un foundation model preentrenado a gran escala para predicciones eficientes en contexto, segun el titulo del paper en progreso. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El entrenamiento esta orientado a tareas de clasificacion binaria y regresion de entidades definidas sobre los esquemas de RelBench, the-join y plurel, y la inferencia se realiza sin gradientes por tarea: el modelo construye el contexto muestreando un vecindario del grafo relacional en torno a la celda objetivo. Se recomienda usar un contexto de hasta 8192 celdas para obtener la precision completa sobre un split de test completo, y el pipeline incluye un motor de datos nativo en Rust.

## Capacidades

- Prediccion de entidades en bases de datos relacionales multi-tabla: clasificacion binaria (por ejemplo, probabilidad de que un piloto de F1 no termine una carrera) y regresion de entidades, con el mismo checkpoint.
- Inferencia zero-shot e in-context sin entrenamiento por tarea: la tarea se define mediante una celda enmascarada y un vecindario de contexto muestreado.
- Aprendizaje few-shot apoyado en el contexto: el rendimiento depende del tamano del contexto (`ctx_size_list`) y de la estrategia de muestreo (`bfs_width`, `num_walks`, `walk_length`).
- Manejo de esquemas relacionales con claves primarias y foraneas, filas, columnas y celdas como unidades de atencion.
- Integracion con columnas de texto mediante pre-embedding externo (`all-MiniLM-L12-v2`), no ajustado.
- Soporte de multiples tareas y bases de datos a traves del ecosistema RelBench (lista de 21 tareas mencionada en los ejemplos de evaluacion).
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no disponible (no es un modelo de lenguaje generativo).
- Soporte de agentes o razonamiento multi-paso: no disponible.

## Casos de uso

- Prediccion de abandono o churn en CRM relacional: dado un cliente con tablas de pedidos, incidencias y facturacion, el modelo estima la probabilidad de baja usando el vecindario relacional como contexto, sin reentrenar por campana.
- Scoring de riesgo en seguros: con esquemas de polizas, siniestros y asegurados enlazados por claves, RT-J predice la probabilidad de siniestro o el importe esperado en una sola pasada forward, adecuado para preevaluacion previa a modelos actuariales.
- Deteccion de fraude en transacciones: modelar el grafo de cuentas, transferencias y dispositivos para clasificar entidades sospechosas en modo zero-shot, aprovechando la atencion sobre enlaces PK/FK.
- Mantenimiento predictivo industrial: con tablas de sensores, activos y ordenes de trabajo, usar el modelo para regresion sobre variables objetivo (tiempo hasta fallo) sin ingenieria de features especifica por planta.
- Experimentacion rapida en ciencia de datos: al no requerir entrenamiento por tarea, sirve para obtener una linea base de clasificacion o regresion sobre una base de datos relacional en horas, antes de invertir en un modelo supervisado a medida.
- Prediccion sobre benchmarks relacionales de investigacion: reproducir los resultados de RelBench descargando el dataset preprocesado y ejecutando `examples/eval.py`, util para comparativas academicas.
- Prototipado de sistemas de recomendacion basados en grafo: modelar usuarios, items e interacciones como tablas relacionadas y predecir afinidad o conversion mediante contexto muestreado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que es posible reproducir los numeros de RelBench de extremo a extremo mediante `examples/eval.py`, pero no incluye valores concretos de ROC-AUC ni MAE en la informacion proporcionada, pese a que ambas metricas figuran en los metadatos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamano del modelo, aproximadamente 0,17 GB solo para los pesos en bfloat16 (fichero `model.safetensors` de 171.164.252 bytes), mas activaciones dependientes del contexto. Un contexto pequeno (por ejemplo 128 celdas) cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA para aprovechar el kernel compilado de `flex_attention`. En GPU el ejemplo de la model card se ejecuta en segundos.
- Compatibilidad con consumer GPU: si, el modelo cabe en practicamente cualquier GPU consumer moderna; tambien funciona en Apple Silicon mediante MPS en modo eager.
- CPU: es posible ejecutar en CPU, pero el `flex_attention` no tiene kernel fusionado de bfloat16 para CPU, por lo que el mismo ejemplo puede tardar decenas de minutos.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible. Se despliega como libreria Python `rt` instalada desde el repositorio de GitHub, que incluye el modelo y un motor de datos nativo en Rust, compilado desde fuente. Requiere toolchain de Rust y Python 3.12 o superior.
- Latencia y throughput estimados: no disponible de forma cuantitativa; la model card solo indica "segundos" en GPU y "decenas de minutos" en CPU para el ejemplo de contexto reducido.
- Nota de entorno: para ejecutar en CPU o MPS hay que desactivar TorchDynamo (`TORCHDYNAMO_DISABLE=1`), ya que el kernel compilado de `flex_attention` es exclusivo de CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Estado |
|---|---|---|---|---|---|
| RT-J (`stanford-star/rt-j`) | ~85M | hasta 8192 celdas | Prediccion de entidades zero-shot en bases de datos relacionales | cc-by-4.0 | Publicado |
| PluRel (arXiv:2602.04029) | no disponible | no disponible | Aprendizaje relacional | no disponible | Superado por RT-J |
| Relational Transformer (arXiv:2510.06377) | no disponible | no disponible | Aprendizaje relacional | no disponible | Superado por RT-J |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento (ROC-AUC, MAE) frente a modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- La model card indica que dos trabajos previos de los mismos autores (PluRel y Relational Transformer) han quedado superados por RT-J; conviene usar el checkpoint actual y no los anteriores.
- El paper principal de RT-J esta en progreso, por lo que la documentacion cientifica completa puede no estar disponible todavia.
- No es un modelo de lenguaje generativo: no soporta tool calling, agentes ni generacion de texto libre; su salida es una prediccion sobre una entidad objetivo.
- El embedder de texto (`all-MiniLM-L12-v2`) no forma parte del checkpoint ni se ajusta; la calidad sobre columnas textuales depende de ese modelo externo, orientado principalmente a ingles.
- Idiomas soportados: no disponible, lo que limita el uso fiable en bases de datos con texto en idiomas distintos del ingles.
- El rendimiento depende fuertemente de la configuracion de contexto (`ctx_size_list`, `local_ctx_size`, `bfs_width`, `num_walks`, `walk_length`) y de la estrategia de muestreo; contextos pequenos reducen la precision.
- La API no ofrece CLI y `rt.eval.main` es keyword-only sin valores por defecto, lo que obliga a copiar y editar los ejemplos.
- La instalacion requiere compilar el motor de datos en Rust y disponer de Python 3.12 o superior, lo que anade complejidad al despliegue.
- En CPU y MPS la inferencia es significativamente mas lenta porque `flex_attention` carece de kernel fusionado bfloat16 fuera de CUDA.
- Riesgos de sesgo y alucinacion: no disponible en la informacion proporcionada; al tratarse de un modelo predictivo sobre datos tabulares, la calidad dependera de la representatividad de los datos de entrenamiento.
- Licencia cc-by-4.0: permite uso comercial con atribucion; conviene revisar los terminos del fichero `LICENSE` del repositorio antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanford-star/rt-j
- Codigo fuente: https://github.com/stanford-star/relational-transformer
- Pagina del proyecto: https://star-project.stanford.edu/rt-j
- Paper en progreso: "RT-J: Large-Scale Pretraining of Relational Transformers for Context-Efficient Predictions"
- Paper previo (superado) PluRel: https://arxiv.org/abs/2602.04029
- Paper previo (superado) Relational Transformer: https://arxiv.org/abs/2510.06377
- Documentacion de descargas: https://github.com/stanford-star/relational-transformer/blob/main/docs/downloads.md
- Documentacion de preprocesado: https://github.com/stanford-star/relational-transformer/blob/main/docs/preprocess.md
- Documentacion de inferencia: https://github.com/stanford-star/relational-transformer/blob/main/docs/inference.md
- Documentacion de entrenamiento: https://github.com/stanford-star/relational-transformer/blob/main/docs/train.md
- Ejemplos: https://github.com/stanford-star/relational-transformer/tree/main/examples
- Script de evaluacion: https://github.com/stanford-star/relational-transformer/blob/main/examples/eval.py
- Dataset the-join: https://huggingface.co/datasets/stanford-star/the-join
- Dataset the-join-preprocessed: https://huggingface.co/datasets/stanford-star/the-join-preprocessed
- Dataset plurel: https://huggingface.co/datasets/stanford-star/plurel
- Dataset plurel-preprocessed: https://huggingface.co/datasets/stanford-star/plurel-preprocessed
- Dataset relbench-v1: https://huggingface.co/datasets/stanford-star/relbench-v1
- Dataset relbench-preprocessed: https://huggingface.co/datasets/stanford-star/relbench-preprocessed
- Embedder de texto: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Toolchain de Rust: https://rustup.rs
