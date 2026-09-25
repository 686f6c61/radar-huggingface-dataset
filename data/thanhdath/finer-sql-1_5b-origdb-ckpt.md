# thanhdath/finer-sql-1_5b-origdb-ckpt

## Resumen

FINER-SQL-1.5B-origdb-ckpt es un checkpoint de la familia FINER-SQL, desarrollada por el usuario thanhdath y publicada en HuggingFace el 24 de septiembre de 2026. Se trata de un modelo especializado en traduccion de lenguaje natural a SQL (text-to-SQL), afinado sobre un modelo base pequeno de aproximadamente 1.500 millones de parametros, segun se deduce del propio nombre del repositorio. El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargarlo.

La familia FINER-SQL se presenta en el articulo "FINER-SQL: Boosting Small Language Models for Text-to-SQL" (ICDE 2026), cuyo objetivo es llevar la precision de modelos grandes de text-to-SQL a modelos pequenos mediante retroalimentacion de ejecucion de grano fino y recompensas de bajo coste computacional. En los experimentos publicados, una variante de 3B alcanza hasta un 67,73 % de execution accuracy en BIRD y un 85 % en Spider, con una latencia de inferencia de 5,57 s por muestra, lo que la situa al nivel de LLM mucho mayores.

La relevancia de este checkpoint radica en dos factores: por un lado, permite desplegar generacion de SQL de calidad en hardware moderado o incluso en entornos on-premise (el articulo lo enmarca como una via "cost-efficient y privacy-preserving"); por otro, forma parte de un esfuerzo de investigacion con publicacion asociada (paper, repositorio de codigo y familia completa de tamanos). El sufijo "origdb" sugiere un entrenamiento o evaluacion sobre bases de datos originales, aunque la ficha publica no detalla esta composicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no confirmada en la ficha; la variante FINER-SQL-0.5B-BIRD se etiqueta como qwen2) |
| Parametros totales | Aproximadamente 1.500 millones (inferido del nombre del repositorio; no confirmado explicitamente) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en este repositorio (solo safetensors; existen modelos cuantizados para la variante de 0.5B) |
| Idiomas soportados | No disponible (la variante FINER-SQL-0.5B-BIRD se etiqueta como ingles) |
| Licencia | other (la variante FINER-SQL-0.5B-BIRD se publica bajo apache-2.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 268,6 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La informacion disponible apunta a un transformer decoder-only. La variante de 0.5B de la misma familia incluye la etiqueta "qwen2", por lo que es razonable asumir que el modelo base pertenece a la familia Qwen2 o Qwen2.5, aunque este punto no se confirma en la ficha del checkpoint de 1.5B. No se dispone de detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion (full attention frente a variantes lineales) ni longitud de contexto nativa para esta version concreta.

El entrenamiento combina fine-tuning sobre datos de text-to-SQL con aprendizaje por refuerzo. Segun el articulo asociado (ICDE 2026), FINER-SQL utiliza retroalimentacion de ejecucion de grano fino (fine-grained execution feedback) y un esquema de recompensas eficiente en coste, con GRPO como algoritmo de optimizacion (la variante de 0.5B incluye la etiqueta "grpo"). Los conjuntos de evaluacion citados son BIRD y Spider, y el pipeline de evaluacion recomendado aparece documentado en la ficha de la variante de 0.5B. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de DPO o RLHF en este checkpoint. El nombre "origdb" y el sufijo "ckpt" sugieren un checkpoint intermedio o asociado a bases de datos originales, pero no hay confirmacion en la informacion proporcionada.

El tamano del repositorio (268,6 GB) es muy superior a lo que ocuparian unicamente los pesos de inferencia de un modelo de 1.5B (del orden de 3 GB en fp16), lo que indica que probablemente contiene estados de optimizador, multiples checkpoints de entrenamiento o ambos. Esto lo convierte en un artefacto de entrenamiento mas que en un paquete listo para produccion.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural, dado un esquema de base de datos y, opcionalmente, evidencia adicional (el pipeline de BIRD incluye "evidence").
- Razonamiento sobre esquemas relacionales: identificacion de tablas, columnas, claves y relaciones para construir joins y agregaciones.
- Modo conversacional y generacion de texto: la familia incluye etiquetas "conversational" y "text-generation-inference".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente, aunque el articulo menciona retroalimentacion de ejecucion de grano fino, lo que implica refinamiento iterativo durante el entrenamiento.
- Capacidades multilingues: no disponibles; la familia se etiqueta como ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Optimizacion por ejecucion: el modelo esta entrenado para producir SQL ejecutable, no solo sintacticamente valido.

## Casos de uso

- Consultas en lenguaje natural sobre bases de datos corporativas: el modelo traduce preguntas de negocio ("cuantas ventas hubo en el primer trimestre por region") a SQL ejecutable contra un esquema conocido, lo que reduce la dependencia de analistas para consultas recurrentes.
- Asistentes de business intelligence embebidos: integrado en una herramienta de BI, permite a usuarios no tecnicos formular consultas en lenguaje natural y obtener graficos a partir de la SQL generada, con el modelo ejecutandose on-premise para no exponer datos sensibles.
- Analisis de datos ad hoc para cientificos de datos: acelerar la exploracion de un data warehouse generando la primera version de la consulta, que el analista revisa y ajusta.
- Generacion de SQL en pipelines de datos: producir transformaciones SQL para procesos ETL o dbt, a partir de descripciones de negocio, con validacion posterior mediante ejecucion sobre un entorno de staging.
- Migracion y refactorizacion de esquemas: generar equivalencias de consultas entre dialectos o entre versiones de esquema, aprovechando la capacidad de razonamiento sobre relaciones.
- Atencion al cliente con acceso a datos: un agente conversacional puede traducir preguntas de clientes sobre su cuenta o pedidos a consultas SQL internas, siempre que se controle el alcance de las tablas accesibles.
- Educacion y formacion en SQL: como corrector o asistente que propone consultas y explica el razonamiento sobre el esquema, en entornos docentes con bases de datos de practicas.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo pequeno, puede ejecutarse en infraestructura local (hospitales, administracion publica, banca) donde no es viable enviar esquemas ni datos a APIs externas.

## Benchmarks y rendimiento

Los unicos resultados numericos disponibles corresponden a la variante de 3B descrita en el articulo, no a este checkpoint de 1.5B. No se han publicado resultados de benchmarks especificos para `finer-sql-1_5b-origdb-ckpt` en la informacion disponible.

| Benchmark | Modelo | Metrica | Resultado |
|---|---|---|---|
| BIRD | FINER-SQL (variante 3B, articulo) | Execution accuracy | 67,73 % |
| Spider | FINER-SQL (variante 3B, articulo) | Execution accuracy | 85 % |
| BIRD / Spider | FINER-SQL (variante 3B, articulo) | Latencia de inferencia | 5,57 s/muestra |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales para esta familia.

## Requisitos de hardware

- VRAM estimada para inferencia (1500 M de parametros, sin contar cache KV): aproximadamente 3 GB en fp16, 1,5 GB en int8 y 0,8-1 GB en int4.
- La cache KV depende de la longitud de contexto y del batch; en contextos largos puede superar el peso de los parametros.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente para fp16 o int8. Para despliegues con alto throughput, A100, H100 o L40S.
- Cabe en GPU consumer: si. Es un modelo de gama baja en requisitos de VRAM, lo que lo hace apto para portatiles con GPU discreta y estaciones de trabajo modestas.
- Opciones de despliegue: vLLM (recomendado en la ficha de la variante de 0.5B), llama.cpp, Ollama, TGI y plataformas gestionadas como FriendliAI (esta ultima documentada para la variante de 0.5B).
- Latencia y throughput: el articulo reporta 5,57 s/muestra para la variante de 3B en su pipeline de evaluacion; no hay datos de latencia publicados para este checkpoint de 1.5B.
- Almacenamiento: el repositorio ocupa 268,6 GB, por lo que la descarga y el almacenamiento local requieren planificacion; es probable que sea necesario convertir o extraer los pesos de inferencia antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD | Spider | Licencia | Acceso |
|---|---|---|---|---|---|---|
| FINER-SQL-1.5B-origdb-ckpt | ~1,5B (inferido) | No disponible | No disponible | No disponible | other | Gated |
| FINER-SQL-0.5B-BIRD | 0,5B | No disponible (base Qwen2) | No disponible en la informacion recogida | No disponible en la informacion recogida | apache-2.0 | Publico |
| FINER-SQL (variante 3B, articulo ICDE 2026) | 3B | No disponible | 67,73 % | 85 % | No disponible | No disponible |

No se dispone de datos suficientes para comparar con alternativas externas (por ejemplo, modelos genericos tipo Qwen-Coder o CodeLlama afinados para text-to-SQL) en terminos de accuracy sobre BIRD o Spider con la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que complica la integracion automatizada en pipelines de CI/CD.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial no esta garantizado y debe revisarse con el autor antes de cualquier despliegue en produccion. La variante de 0.5B usa apache-2.0, pero eso no implica que este checkpoint comparta licencia.
- Naturaleza del repositorio: el sufijo "ckpt" y los 268,6 GB sugieren un artefacto de entrenamiento (posiblemente con estados de optimizador), no un paquete optimizado para inferencia. Puede requerir conversion previa.
- Especializacion estrecha: es un modelo text-to-SQL; no cabe esperar buen rendimiento en tareas generales de chat, redaccion, resumen o codigo no SQL.
- Riesgo de alucinacion de esquema: como cualquier modelo generativo, puede inventar tablas, columnas o funciones que no existen; es imprescindible validar la SQL mediante ejecucion contra un entorno controlado antes de usarla.
- Riesgo de seguridad: si se conecta a una base de datos real, debe restringirse a consultas de solo lectura y limitarse el conjunto de tablas accesibles para evitar exfiltracion de datos.
- Idioma: no hay confirmacion de soporte multilingue; la familia se etiqueta como ingles, por lo que el rendimiento en espanol no esta garantizado.
- Contexto: no se ha publicado la longitud de contexto soportada; esquemas de bases de datos grandes pueden exceder la ventana disponible.
- Sesgos: no se documentan analisis de sesgo. Al entrenarse sobre datos de BIRD y Spider, puede heredar los sesgos de esos corpus (predominio de esquemas anglosajones y dominios concretos).
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y de reportes de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thanhdath/finer-sql-1_5b-origdb-ckpt
- Variante 0.5B: https://huggingface.co/thanhdath/FINER-SQL-0.5B-BIRD
- Repositorio de codigo (GitHub): https://github.com/thanhdath/finer-sql/tree/main
- Articulo (arXiv, HTML): https://arxiv.org/html/2605.03465v1
- Modelos cuantizados de la familia: https://huggingface.co/models?other=base_model:quantized:thanhdath/FINER-SQL-0.5B-BIRD
- Pagina de despliegue en FriendliAI (variante 0.5B): https://friendli.ai/models/thanhdath/FINER-SQL-0.5B-BIRD
