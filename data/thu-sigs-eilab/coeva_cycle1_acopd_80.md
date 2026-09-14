# THU-SIGS-EILAB/coeva_cycle1_acopd_80

## Resumen

coeva_cycle1_acopd_80 es un checkpoint de política robótica exportado para inferencia, publicado por el laboratorio THU-SIGS-EILAB en HuggingFace. Se trata de un "student" sin ZV entrenado mediante AC-OPD (el método de aprendizaje por refuerzo o destilación identificado en el nombre del run) a partir de un teacher con prior Z/V, sobre el benchmark de manipulación LIBERO-10. El propio autor lo describe como un "inference-ready export", es decir, un artefacto pensado para evaluación autónoma y no para reanudar entrenamiento distribuido.

El repositorio contiene los pesos completos del paso 80 (`actor/model_state_dict/full_weights.pt`), las estadísticas de normalización de acciones requeridas por LIBERO, un fichero de configuración del modelo Pi0.5 y la configuración congelada del entrenamiento. El run de origen se identifica con la ruta `logs/20260913-23:06:51-libero_10_ac_opd_pi05_zv_teacher_nozv_student_4gpu/cycle_00_acopd_zv_teacher_nozv_student/checkpoints/global_step_80`, lo que indica un entrenamiento en cuatro GPU y un único ciclo completado hasta el paso global 80.

Es relevante ahora porque expone públicamente un artefacto intermedio de un pipeline de destilación profesor-alumno en robótica, un tipo de material poco frecuente en abierto, y porque la configuración declarada corresponde a Pi0.5, la arquitectura de visión-lenguaje-acción de Physical Intelligence. No obstante, la model card es extremadamente escueta: no declara licencia, idiomas, número de parámetros, longitud de contexto ni resultados de benchmarks, por lo que su evaluación rigurosa exige inspeccionar los ficheros de configuración incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como cifra; el fichero `rlinf_model_config.yaml` corresponde a la configuracion del modelo Pi0.5 (vision-lenguaje-accion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos completos en PyTorch, sin variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible; el modelo se evalua sobre tareas del benchmark LIBERO-10, presumiblemente con instrucciones en ingles, sin confirmacion del autor |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `actor/model_state_dict/full_weights.pt`; acompanado de `physical-intelligence/libero/norm_stats.json`, `rlinf_model_config.yaml` y `training_config.yaml` |
| Tamano del repositorio | 8,6 GB |
| Checkpoint de origen | `global_step_80` del run `20260913-23:06:51-libero_10_ac_opd_pi05_zv_teacher_nozv_student_4gpu` |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que la configuracion del modelo corresponde a Pi0.5, un modelo de vision-lenguaje-accion (VLA) que combina un backbone visual-lenguaje con un modulo de generacion de acciones. El autor describe el artefacto como un "student" sin ZV entrenado con un "teacher" con prior Z/V, dentro de un esquema denominado AC-OPD, ejecutado sobre LIBERO-10 (manipulacion robotica) durante un unico ciclo y en cuatro GPU.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineacion. La configuracion de entrenamiento se incluye congelada en `training_config.yaml`, de modo que cualquier reproduccion o analisis detallado debe partir de ese fichero y no de la model card. El export excluye deliberadamente `actor/dcp_checkpoint/`, necesario solo para reanudar entrenamiento distribuido; `full_weights.pt` es el checkpoint destinado a inferencia y evaluacion independiente. Un aspecto operativo relevante es la inclusion de `norm_stats.json`, imprescindible para desnormalizar correctamente las acciones predichas en LIBERO.

## Capacidades

- Generacion de acciones de manipulacion robotica: el modelo es una politica VLA, no un modelo de lenguaje conversacional; su salida son acciones motoras condicionadas por observacion visual e instruccion de tarea.
- Ejecucion de tareas del benchmark LIBERO-10: segun el autor, esta exportado para inferencia y evaluacion standalone en ese entorno.
- Condicionamiento por instruccion en lenguaje natural: al derivar de una configuracion Pi0.5, la politica sigue ordenes textuales de tarea, aunque no se documentan los idiomas admitidos.
- Uso como componente de un pipeline de destilacion: representa el rol de student sin ZV frente a un teacher con prior Z/V, por lo que sirve para estudiar la transferencia profesor-alumno.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se describe ningun modo de planificacion explicita ni bucle de agente.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): se asume entrada visual por tratarse de una politica VLA, pero no se documenta de forma explicita en la informacion disponible.

## Casos de uso

- Evaluacion de referencia en LIBERO-10: cargar `full_weights.pt` junto con `norm_stats.json` y `rlinf_model_config.yaml` para reproducir la metrica del paso 80 y compararla con el teacher con prior Z/V. Es el uso para el que el autor ha disenado explicitamente el export.
- Investigacion en destilacion profesor-alumno aplicada a robotica: analizar que capacidades se conservan y cuales se pierden al eliminar el prior Z/V en el student, comparando ambos checkpoints sobre el mismo conjunto de evaluacion.
- Estudio de la dinamica de entrenamiento en RL para control: al ser un checkpoint intermedio (paso 80 de un unico ciclo), permite trazar curvas de aprendizaje y detectar saturacion o colapso temprano frente a checkpoints posteriores del mismo run.
- Punto de partida para fine-tuning en tareas de manipulacion propias: reutilizar los pesos como inicializacion y reentrenar sobre un dataset de demostraciones especifico, aprovechando la normalizacion de acciones ya publicada.
- Integracion en simuladores de robotica compatibles con acciones LIBERO: desplegar la politica dentro de un entorno de simulacion para generar trayectorias sinteticas y ampliar un dataset de imitacion.
- Diagnostico de robustez ante cambios de camara o iluminacion: someter la politica exportada a variaciones visuales controladas y medir la degradacion de la tasa de exito, ya que el checkpoint esta congelado y no cambia entre pruebas.
- Analisis de seguridad previo a transferencia a hardware real: ejecutar la politica en simulacion con limites de par y colision para identificar comportamientos erraticos antes de cualquier ensayo fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en LIBERO-10 ni comparaciones con otros checkpoints, y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo (los enlaces obtenidos corresponden a productos de audio, plafones, un diccionario y una entrada biografica no relacionados).

| Benchmark | Resultado |
|---|---|
| LIBERO-10 (tasa de exito) | no disponible |
| Otros benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 8,6 GB e incluye pesos completos en PyTorch, por lo que el peso en memoria de los parametros sera de ese orden de magnitud o inferior segun el tipo de dato; no se documenta el consumo real de inferencia.
- GPU recomendadas: no disponible. El autor indica que el entrenamiento se realizo en cuatro GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar si cabe en una RTX 4090 o en tarjetas con menos memoria sin conocer el numero de parametros y la precision de los pesos.
- Opciones de despliegue: no disponible. Al publicarse unicamente pesos PyTorch (`.pt`) sin conversion a GGUF, no hay soporte documentado para llama.cpp, Ollama ni formato similar. Un pipeline basado en PyTorch, con el codigo de RLinf y la configuracion Pi0.5, es la via coherente con el contenido del repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables dentro de la informacion proporcionada, y la busqueda web no devolvio alternativas relevantes. Se listan a continuacion las filas que habria que completar, marcadas como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coeva_cycle1_acopd_80 | no disponible | no disponible | no disponible | no disponible | HuggingFace, repo de 8,6 GB |
| Teacher con prior Z/V del mismo run | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |
| Otras politicas VLA para LIBERO (Pi0.5, OpenVLA y similares) | no disponible | no disponible | no disponible | no disponible | no verificadas en esta busqueda |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial, redistribucion ni creacion de derivados sin consultar previamente al autor.
- Checkpoint intermedio y de un unico ciclo: el paso 80 no implica convergencia; el rendimiento posterior de la politica no esta garantizado ni documentado.
- Model card minima: no hay informacion sobre datos de entrenamiento, composicion del dataset, sesgos ni procesos de alineacion, lo que impide auditar el comportamiento de la politica.
- Dependencia estricta de `norm_stats.json`: omitir o sustituir las estadisticas de normalizacion de LIBERO producira acciones con escala incorrecta y fallos de ejecucion.
- Incompatibilidad con formatos de inferencia habituales: al no existir conversion a GGUF u otros formatos, no se puede desplegar con las herramientas estandar de servido de modelos de lenguaje.
- Riesgo de alucinacion en el sentido de acciones no validas: como toda politica aprendida, puede generar trayectorias fisicamente inviables o inseguras, especialmente fuera de la distribucion de LIBERO-10.
- Sesgos de simulador: el modelo se ha entrenado y evaluado en el entorno LIBERO, por lo que su transferencia a robotica real no esta respaldada por ningun resultado publicado.
- Idiomas: no se documenta soporte multilingue; las instrucciones de tarea estan asociadas al benchmark, presumiblemente en ingles.
- Trazabilidad: el identificador del run y las fechas (2026) son los unicos metadatos disponibles; no se enlaza paper, repositorio de codigo ni informe tecnico.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que reduce la validacion por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/THU-SIGS-EILAB/coeva_cycle1_acopd_80
- Paper: no disponible en la informacion proporcionada.
- Repositorio de codigo: no disponible; el fichero `rlinf_model_config.yaml` sugiere el uso del framework RLinf, pero no se aporta enlace.
- Blog o informe tecnico: no disponible.
- Demo: no disponible.
- Resultados de la busqueda web: ninguno relevante para este modelo. Los enlaces devueltos (Overloud THU, thu-plafonds.fr, diccionario Reverso, Wikipedia sobre Thu Kamkasomphou) no guardan relacion con el artefacto y se descartan.
