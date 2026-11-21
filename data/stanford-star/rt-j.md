# stanford-star/rt-j

## Resumen

RT-J es un checkpoint de la familia Relational Transformer desarrollado por el grupo stanford-star (Stanford), disenado especificamente para realizar predicciones *in-context* sobre bases de datos relacionales. A diferencia de los transformers de lenguaje, no procesa texto libre sino esquemas relacionales completos: tablas, columnas, claves foraneas y filas, y resuelve tanto clasificacion binaria como regresion sobre entidades sin necesidad de entrenamiento especifico por tarea. Con 85,5 millones de parametros, 12 bloques, `d_model` de 512, 8 cabezas de atencion y `d_ff` de 2048, es un modelo compacto pensado para inferencia eficiente sobre datos tabulares relacionales.

El modelo se preentreno primero sobre el dataset PluRel y despues sobre The Join, dos corpus a gran escala de bases de datos relacionales. Las columnas de texto se embeben con `all-MiniLM-L12-v2`, lo que permite manejar atributos textuales dentro del esquema relacional. En el momento del envio, el autor lo situa como el modelo in-context numero 1 del leaderboard de RelBench, un benchmark de referencia para aprendizaje relacional profundo.

Su relevancia actual radica en que aborda un problema historicamente costoso: predecir sobre datos relacionales suele requerir ingenieria de features y entrenamiento por tarea. RT-J propone un enfoque de foundation model que generaliza a nuevas tareas mediante contexto, reduciendo el coste de adaptacion. La licencia Apache-2.0 sobre los pesos facilita su uso comercial, aunque los datos de entrenamiento tienen sus propios terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Relational Transformer (transformer sobre esquemas relacionales) |
| Parametros totales | 85.562.530 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | Apache-2.0 (pesos); los datos de entrenamiento tienen sus propios terminos |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`) |

Detalles adicionales de configuracion: 12 bloques, `d_model` 512, 8 cabezas de atencion, `d_ff` 2048. Embeddings de columnas de texto mediante `all-MiniLM-L12-v2`. Tamano del repositorio: 1,7 GB.

## Arquitectura y entrenamiento

RT-J es un transformer relacional de 12 bloques que opera sobre la estructura de una base de datos en lugar de sobre una secuencia de tokens. El modelo recibe el esquema (tablas, columnas, relaciones entre entidades) y las filas, y produce predicciones sobre entidades objetivo. Esta formulacion permite resolver clasificacion binaria y regresion de forma unificada mediante prediccion in-context, sin fine-tuning por tarea. Las columnas de tipo texto se proyectan con el encoder `all-MiniLM-L12-v2`, integrándose en el mismo espacio de representacion que el resto de atributos.

El entrenamiento es en dos fases: un preentrenamiento inicial sobre PluRel y una segunda fase sobre The Join, ambos datasets relacionales a gran escala publicados por el mismo grupo. La model card no detalla el numero exacto de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. La innovacion principal es el propio paradigma de foundation model relacional con inferencia in-context, que evita el entrenamiento por tarea y aprovecha el contexto de la base de datos para generalizar.

## Capacidades

- Prediccion in-context sobre bases de datos relacionales: clasificacion binaria y regresion sobre entidades sin entrenamiento especifico por tarea.
- Procesamiento de esquemas relacionales completos: tablas, columnas, claves foraneas y filas.
- Manejo de columnas de texto mediante embeddings de `all-MiniLM-L12-v2`.
- Generalizacion zero-shot y few-shot a nuevas tareas relacionales mediante contexto.
- Aprendizaje relacional profundo sobre grafos de entidades y relaciones.
- No es un modelo generativo de texto: no produce lenguaje natural ni codigo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no aplicables (modelo tabular, no linguistico).

## Casos de uso

- Prediccion de churn en CRM: dado un esquema con tablas de clientes, suscripciones e interacciones, RT-J puede clasificar que clientes tienen riesgo de baja usando el contexto relacional completo, sin ingenieria de features manual.
- Scoring de fraude en transacciones: el modelo evalua entidades de transaccion junto con sus relaciones (cuentas, dispositivos, historial) para clasificacion binaria de fraude, aprovechando la estructura relacional que los modelos tabulares planos pierden.
- Estimacion de valor de cliente (regresion): predice metricas continuas como LTV o ingresos esperados a partir de la base de datos de clientes y pedidos, sin entrenar un modelo por segmento.
- Priorizacion de leads en ventas B2B: clasifica oportunidades comerciales combinando tablas de cuentas, contactos y actividad, con inferencia in-context sobre el esquema existente.
- Prediccion de abandono en plataformas de contenido: estima probabilidad de que un usuario deje de usar el servicio a partir de tablas de sesiones, suscripciones y eventos, con una sola pasada sin reentrenamiento.
- Analisis de riesgo en seguros: regresion sobre siniestralidad esperada combinando polizas, asegurados y partes de siniestro en un esquema relacional, aprovechando las relaciones entre entidades.
- Prototipado rapido de tareas de ML sobre bases de datos: al no requerir entrenamiento por tarea, permite evaluar viabilidad de un caso de uso relacional en horas en lugar de semanas.

## Benchmarks y rendimiento

La model card indica que RT-J fue el modelo in-context numero 1 del leaderboard de RelBench en el momento del envio, pero no se proporcionan cifras numericas de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se han publicado resultados de benchmarks detallados en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,5 M de parametros, en FP32 ocupa aproximadamente 342 MB; en FP16 unos 171 MB; en BF16 similar. La VRAM real dependera del tamano del esquema relacional y del lote de filas procesadas, no solo de los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para los pesos; una RTX 3060 (12 GB) o superior cubre con holgura el modelo. Para esquemas grandes o lotes amplios, se recomienda RTX 4090 (24 GB), A100 (40/80 GB) o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 8 GB o mas, incluidas GTX 1660, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: la libreria oficial `relational-transformer` con `load_rt_model`; al ser safetensors, es compatible con stacks PyTorch estandar. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RT-J (stanford-star) | 85,5 M | no disponible | Transformer relacional in-context | Apache-2.0 | Hugging Face |
| Relational Transformer base (Ranjan et al., ICLR 2026) | no disponible | no disponible | Transformer relacional zero-shot | no disponible | Paper / codigo |
| Modelos GBDT (XGBoost, LightGBM) | variable | no aplica | Tabular plano con ingenieria de features | MIT/Apache | Amplia |

La comparativa con modelos de la misma categoria es limitada: RT-J pertenece a una familia emergente de foundation models relacionales, y las alternativas directas son trabajos del mismo grupo de investigacion. Frente a GBDT clasicos, RT-J ofrece inferencia in-context sin entrenamiento por tarea, pero no se dispone de cifras comparativas de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre bases de datos reales, puede heredar sesgos presentes en PluRel y The Join.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero las predicciones sobre entidades pueden ser erroneas si el esquema o las filas de contexto son incompletos o inconsistentes.
- Limitaciones de contexto: la longitud de contexto no esta disponible; el rendimiento puede degradarse con esquemas relacionales muy grandes o muchas filas por entidad.
- Limitaciones de idioma: no es un modelo linguistico; las columnas de texto dependen de `all-MiniLM-L12-v2`, que tiene sus propias limitaciones multilingues.
- Restricciones de licencia: los pesos son Apache-2.0 y permiten uso comercial, pero los datos de entrenamiento (PluRel, The Join) tienen sus propios terminos que deben revisarse antes de un despliegue en produccion.
- Caveat de produccion: el modelo esta pensado para prediccion in-context, no para fine-tuning generico; la integracion requiere la libreria `relational-transformer` y un pipeline de preparacion de esquemas relacionales.
- Madurez: modelo reciente (paper NeurIPS 2026) con ecosistema de tooling limitado; verificar estabilidad de la API antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/stanford-star/rt-j
- Dataset PluRel: https://huggingface.co/datasets/stanford-star/plurel-preprocessed
- Dataset The Join: https://huggingface.co/datasets/stanford-star/the-join-preprocessed
- Codigo y quickstart: https://github.com/stanford-star/relational-transformer
- Paper RT-J (NeurIPS 2026): https://star-project.stanford.edu/rt-j
- Leaderboard RelBench: https://star-project.stanford.edu/relbench/leaderboard
