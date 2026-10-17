# yukamatsumae/molmoact2_otter_white_yellow_discrete1

## Resumen

El modelo `yukamatsumae/molmoact2_otter_white_yellow_discrete1` es una politica de robótica (Vision-Language-Action, VLA) publicada en Hugging Face por el usuario yukamatsumae bajo licencia Apache 2.0. Se distribuye a traves de la libreria LeRobot de Hugging Face y esta construido sobre la familia MolmoAct2, cuyo repositorio oficial mantiene el Allen Institute for AI (allenai). El identificador del modelo indica que se trata de un ajuste fino orientado a una tarea concreta de manipulacion (denominada "otter white yellow"), probablemente entrenado sobre el dataset `yukamatsumae/WhiteYellow_20260910_005531`.

El modelo tiene 5.442.196.272 parametros (aproximadamente 5,44 mil millones) en formato safetensors, con un repositorio de 10,9 GB. MolmoAct2 es, segun el articulo asociado, un modelo de razonamiento de acciones (action reasoning) disenado para despliegue en robots reales, con una variante de razonamiento de profundidad adaptativa (MolmoAct2-Think) acoplada a un backbone VLM mediante un mecanismo de accion novedoso.

La relevancia de esta publicacion radica en que forma parte del ecosistema abierto de modelos VLA para robótica, un area donde predominan los modelos cerrados o los que dependen de hardware muy costoso. No obstante, la model card del repositorio concreto es practicamente una plantilla generica de LeRobot sin detalles especificos del entrenamiento, por lo que gran parte de las especificaciones tecnicas no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en MolmoAct2; detalles concretos no disponibles |
| Parametros totales | 5.442.196.272 (aproximadamente 5,44 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo mas alla de su naturaleza como modelo VLA (Vision-Language-Action) perteneciente a la familia MolmoAct2. Segun el articulo de referencia, MolmoAct2 es un modelo de razonamiento de acciones para despliegue en el mundo real, con una variante de razonamiento de profundidad adaptativa denominada MolmoAct2-Think, acoplada a un backbone VLM mediante un mecanismo de accion ("action") descrito como novedoso. No se dispone de datos sobre el numero de capas, el tipo de atencion, ni la composicion exacta de la arquitectura en la informacion facilitada.

En cuanto al entrenamiento, el modelo se ha publicado mediante LeRobot y esta vinculado al dataset `yukamatsumae/WhiteYellow_20260910_005531`, lo que sugiere un ajuste fino especifico sobre demostraciones de una tarea concreta de manipulacion. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La plantilla de la model card corresponde al formato generico de LeRobot e indica que la politica se entreno y subio al Hub con LeRobot, sin aportar detalles adicionales sobre hiperparametros o metodologia.

## Capacidades

- Generacion de acciones de robot a partir de entradas visuales e instrucciones en lenguaje natural (paradigma VLA).
- Ejecucion de politicas de manipulacion entrenadas sobre demostraciones (imitation learning).
- Tarea especifica de manipulacion asociada al dataset "WhiteYellow", cuyo alcance exacto no esta documentado.
- Integracion con el ecosistema LeRobot para entrenamiento e inferencia (`lerobot-train`, `lerobot-record`).
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso en este repositorio concreto.
- No hay informacion disponible sobre capacidades multilingues ni sobre modos especiales (thinking mode, vision general, audio).

## Casos de uso

- Manipulacion robotica de laboratorio: el modelo puede ejecutar una politica entrenada para una tarea concreta de recogida o colocacion de objetos (aparentemente relacionados con los colores blanco y amarillo) usando datos de demostracion, integrándose en un brazo robotico compatible con LeRobot.
- Investigacion en imitation learning: sirve como punto de partida para reproducir experimentos de politicas VLA sobre datasets propios, aprovechando la compatibilidad con la libreria LeRobot.
- Ajuste fino sobre nuevas tareas: dado que es un ajuste sobre MolmoAct2, puede emplearse como base para transferir a otras tareas de manipulacion con pocas demostraciones, aunque no se documentan resultados de transferencia.
- Evaluacion comparativa de politicas: utilizable como referencia en experimentos que comparen arquitecturas VLA frente a politicas clasicas tipo ACT dentro de LeRobot.
- Despliegue en robots de bajo a medio coste: MolmoAct2 se presenta en el articulo como orientado a plataformas de coste bajo a medio, lo que encaja con montajes tipo SO-100/SO-101 referenciados en la guia de LeRobot.
- Formacion y docencia en robótica: permite ilustrar el flujo completo de LeRobot (entrenamiento con `lerobot-train`, evaluacion con `lerobot-record`) usando un modelo real publicado en el Hub.
- Benchmarking interno: para equipos que necesiten medir latencia y tasa de exito de un VLA de 5,44 mil millones de parametros en su propio hardware, sin depender de modelos cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye tablas de evaluacion, tasas de exito ni comparaciones numericas. El articulo asociado a MolmoAct2 (arXiv 2605.02881) podria contener resultados, pero no se han facilitado los datos concretos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 10,9 GB solo para los pesos (coincide con el tamano del repositorio). Con overhead de activaciones y buffers de inferencia, es razonable prever 12-16 GB.
- VRAM estimada en int8: alrededor de 5,5 GB para los pesos.
- VRAM estimada en int4: alrededor de 2,8 GB para los pesos.
- GPU consumer: con ~11 GB de pesos en fp16, puede requerir GPUs de gama alta (por ejemplo, RTX 4090 con 24 GB, o RTX 3090 con 24 GB). En cuantizacion int8 o int4 podria caber en GPUs de 8-12 GB, aunque no se documenta soporte oficial de cuantizacion.
- GPU de datacenter: A100 (40/80 GB), H100 y similares son suficientes con amplio margen.
- Opciones de despliegue: la libreria de referencia es LeRobot (`lerobot-train`, `lerobot-record`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. En robótica, la latencia de inferencia suele ser un factor critico, pero no se aportan cifras para este modelo.

## Comparativa con modelos similares

Los datos numericos de los modelos comparables no estan disponibles en la informacion facilitada, por lo que la comparacion se limita a caracteristicas cualitativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| molmoact2_otter_white_yellow_discrete1 (este modelo) | 5,44 mil millones | no disponible | apache-2.0 | Hugging Face, LeRobot | Ajuste fino especifico de MolmoAct2 |
| MolmoAct2 (allenai, base) | no disponible | no disponible | no disponible en la informacion | GitHub allenai/molmoact2, arXiv | Modelo base de razonamiento de acciones |
| ACT (baseline LeRobot) | no disponible | no disponible | no disponible en la informacion | LeRobot | Politica clasica de imitation learning referenciada en la propia model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla generica de LeRobot que advierte explicitamente: "Model type not recognized — please update this template", lo que indica que la documentacion del modelo es incompleta.
- El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de validacion por parte de la comunidad.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgos.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas en el robot ante entradas fuera de distribucion, algo inherente a las politicas de imitation learning y no documentado aqui.
- El modelo parece estar ajustado para una tarea muy concreta ("otter white yellow"), por lo que su generalizacion fuera de ese dominio es incierta.
- No se documentan idiomas soportados ni limitaciones de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de MolmoAct2 conviene verificar las condiciones del modelo base y del dataset asociado.
- Caveat para produccion: al no haber benchmarks, tasas de exito ni datos de latencia, no es recomendable desplegarlo en produccion sin una evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yukamatsumae/molmoact2_otter_white_yellow_discrete1
- Repositorio relacionado del mismo autor: https://huggingface.co/yukamatsumae/molmoact2_otter_white_yellow3
- Repositorio oficial de MolmoAct2 (allenai): https://github.com/allenai/molmoact2
- Articulo MolmoAct2: Action Reasoning Models for Real-world Deployment: https://arxiv.org/abs/2605.02881
- Version HTML del articulo: https://arxiv.org/html/2605.02881v1
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
