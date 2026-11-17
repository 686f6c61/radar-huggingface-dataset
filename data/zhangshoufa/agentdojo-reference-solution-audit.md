# zhangshoufa/AgentDojo-Reference-Solution-Audit

## Resumen

`zhangshoufa/AgentDojo-Reference-Solution-Audit` no es un modelo de lenguaje, sino un repositorio de auditoria y reproducibilidad publicado en Hugging Face bajo la etiqueta de dataset. Lo firma Shoufa Zhang, investigador independiente, y documenta un contraejemplo en el benchmark AgentDojo (`ethz-spylab/agentdojo`): una tarea de viaje pide un recordatorio de calendario el 25 de abril de 2024, la solucion de referencia del propio benchmark crea el evento en 2023 y el evaluador nativo acepta el estado final porque su comparacion de fechas descarta el ano. El material incluye el manuscrito revisado (v49, 14 paginas), el codigo LaTeX, los archivos de replicacion y un registro de ejecucion de 163 unidades con 825 llamadas a herramientas.

El interes para desarrolladores e investigadores es doble. Por un lado, es un caso documentado de fallo de evaluacion en un benchmark de agentes con herramientas: el oraculo de test no valida el requisito explicito del usuario, de modo que un agente puede "aprobar" sin cumplir la tarea. Por otro, el autor reporto el problema al repositorio original (issue #244) y un contribuidor externo lo reprodujo sin modelo sobre `main` (v1.2.2) y abrio el PR #247, que corrige el ano de la referencia de la tarea 4 y anade un test de regresion. El repositorio no contiene pesos, tokenizador ni pipeline de inferencia: es material de auditoria metodologica.

La relevancia practica esta en que cuestiona la fiabilidad de las metricas de exito en evaluaciones de agentes con tool calling y propone un procedimiento diagnostico auditable (referencia por evaluador en cuatro celdas, barrido de anos 2019-2028, controles negativos y recibos de llamada/estado) para separar un error de la referencia de un error del evaluador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un repositorio de auditoria de benchmark) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC BY 4.0 (`cc-by-4.0`) |
| Formato de pesos | no disponible (el repositorio contiene PDF, LaTeX, ZIP y artefactos de replicacion; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay transformer, MoE ni SSM, ni datos de preentrenamiento, RLHF o DPO. El objeto tecnico es un estudio de caso sobre el benchmark AgentDojo fijado en el commit `089ed468cf3ed0322acc66b0211f26d9d90dbf60`. El autor congela las entradas de recuperacion con SHA-256 `ca08ab41e2c190850da46054c8aea6fdeab9449e9905789b32f6e6bc1f33b57d` y el protocolo de extension con SHA-256 `5431427fb996bef4c69bcc1c127b11a5f82395afa3af386f09358c4c16a76594`, lo que permite verificar que los artefactos publicados corresponden a las ejecuciones descritas.

El diseno metodologico se apoya en tres lotes de ejecucion: una cohorte de recuperacion de 60 ejecuciones (361 llamadas a herramientas, con 20 trayectorias de referencia de viaje y 40 trazas archivadas sin ataque de `gpt-4o-2024-05-13` y `claude-3-5-sonnet-20240620`), un lote de reparacion y diagnostico de la tarea 4 con 20 ejecuciones (99 llamadas, incluyendo cuatro celdas de reparacion referencia-por-evaluador, un barrido de anos de 2019 a 2028, dos horas legales y cuatro controles negativos) y una extension de frontera de fecha con 83 ejecuciones (365 llamadas, cinco trayectorias de referencia y 78 sondas de sensibilidad y control sobre las tareas 0, 1, 4, 7 y 8 del suite `travel`). La innovacion tecnica es el propio procedimiento: aislar la referencia invalida de la regla de evaluacion ciega al ano mediante celdas cruzadas y controles con fecha completa.

## Capacidades

- Auditoria de benchmarks de agentes con herramientas: identifica discrepancias entre requisitos explicitos del usuario y estados terminales aceptados por el evaluador.
- Reproduccion sin modelo: el fallo de la tarea 4 se replica reejecutando las soluciones de referencia sin inferencia, lo que permite verificar el comportamiento del oraculo de forma determinista.
- Analisis de sensibilidad de evaluadores: barrido sistematico de anos (2019-2028) para medir cuantas variantes acepta el evaluador nativo frente a un evaluador condicionado por el requisito.
- Controles negativos y positivos: incluye un control de reserva con fecha completa (tarea 0) que rechaza las 9 variantes con ano incorrecto, frente a las tareas de calendario que aceptan 10 de 10.
- Trazabilidad de ejecucion: registro de 163 unidades de ejecucion y 825 llamadas a herramientas con recibos de llamada y estado.
- Publicacion de artefactos: manuscrito PDF, fuente LaTeX, archivo de build de Overleaf y archivos de replicacion en Zenodo, ScienceDB, ModelScope y Hugging Face.
- Alcance limitado al suite `travel` de AgentDojo y a tareas con fecha explicita; el autor no reclama prevalencia ni superioridad metodologica general.

## Casos de uso

- Validacion de pipelines de evaluacion de agentes: usar el procedimiento de celdas referencia-por-evaluador para comprobar si un oraculo de test acepta estados que no cumplen el requisito del usuario antes de publicar resultados de un agente con tool calling.
- Auditoria de benchmarks propios: aplicar el barrido de variantes (anos 2019-2028 en este caso) a tareas con parametros criticos (fechas, importes, identificadores) para detectar comparaciones que descartan parte del valor.
- Revision por pares de resultados de agentes: contrastar una traza de referencia contra el requisito textual de la tarea en lugar de fiarse de la aceptacion del evaluador nativo.
- Formacion de equipos de evaluacion: el manuscrito v49 y los recibos de ejecucion sirven como material docente sobre como separar fallos de referencia de fallos de evaluador.
- Integracion en CI de benchmarks: el PR #247 anade un test de regresion sobre las siete versiones del suite; el repositorio documenta el patron para incorporar tests de regresion de oraculo en repositorios de evaluacion.
- Reproducibilidad de estudios: los SHA-256 de entradas y protocolo permiten a terceros verificar que una replicacion usa exactamente los mismos artefactos congelados.
- Analisis de robustez de agentes en dominios sensibles a fechas: el caso de calendario y reservas es trasladable a tareas de programacion de citas, reservas de hotel o recordatorios donde un ano incorrecto invalida el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelo en la informacion disponible. El repositorio publica resultados de sensibilidad del evaluador, no metricas de un modelo. La tabla siguiente recoge los hallazgos de frontera de fecha del suite `travel` tal como aparecen en la model card:

| Tarea | Requisito publico de fecha | Argumento de referencia | Evaluador nativo acepta (2019-2028) | Condicion de ano pasa | Diagnostico |
|---|---|---|---|---|---|
| `user_task_0` | 11 a 15 de enero de 2025 (reserva de hotel) | `2025-01-11` a `2025-01-15` | 1 / 10 | 1 / 10 | Control de reserva con fecha completa; rechaza las 9 variantes con ano incorrecto |
| `user_task_1` | 2 de enero de 2025 (evento de calendario) | `2025-01-02` | 10 / 10 | 1 / 10 | Ano de referencia correcto, pero el evaluador nativo proyecta solo mes/dia y acepta los 9 anos incorrectos |
| `user_task_4` | 25 de abril de 2024 (recordatorio de calendario) | `2023-04-25` | 10 / 10 | 1 / 10 | Contraejemplo natural (2023 frente a 2024) combinado con evaluador ciego al ano |
| `user_task_7` | 14 de noviembre (ano ausente en el prompt) | `11-14` | 10 / 10 | 10 / 10 (solo mes/dia) | La peticion omite el ano; no se clasifica como error de ano |
| `user_task_8` | 15 de octubre (ano ausente en el prompt) | `10-15` | 10 / 10 | 10 / 10 (solo mes/dia) | La peticion omite el ano; no se clasifica como error de ano |

## Requisitos de hardware

- No aplica inferencia de modelo: el repositorio no contiene pesos ni pipeline. Los requisitos son los de ejecutar el benchmark AgentDojo y sus dependencias.
- Para replicar el diagnostico sin modelo basta un entorno Python con AgentDojo fijado en el commit indicado; no se requiere GPU.
- Para replicar las trazas con actores (`gpt-4o-2024-05-13` y `claude-3-5-sonnet-20240620`) se necesita acceso a las APIs correspondientes; no se especifican requisitos de VRAM en la informacion disponible.
- Opciones de despliegue: no aplica (no hay servidor de inferencia, cuantizaciones ni formato GGUF/safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto es un repositorio de auditoria de benchmark, no un modelo. Como referencia de categoria, se puede situar frente a otros artefactos de evaluacion de agentes, pero la informacion proporcionada no incluye alternativas con parametros, contexto o licencia comparables.

## Limitaciones y advertencias

- No es un modelo utilizable para generacion de texto, codigo o vision; no debe desplegarse como tal.
- El alcance es un unico suite (`travel`) de AgentDojo y un conjunto acotado de tareas con fecha; el autor declara explicitamente que no reclama prevalencia ni superioridad metodologica general.
- El diagnostico se limita a discrepancias de fecha; no cubre otros tipos de requisito explicito (importes, identificadores, restricciones de politica).
- Dos tareas (7 y 8) omiten el ano en el prompt y no se clasifican como errores de ano; extrapolar el hallazgo a esas tareas seria incorrecto.
- La correccion del benchmark depende de la aceptacion del PR #247 en el repositorio upstream; hasta su merge, las versiones afectadas siguen aceptando el estado incorrecto.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero el material es documental; verificar la licencia del benchmark AgentDojo original para reutilizar su codigo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB; conviene verificar la integridad de los archivos antes de usarlo como fuente.
- Riesgo de sobreinterpretacion: el caso demuestra una inconsistencia empirica concreta, no un fallo sistematico de todos los evaluadores de agentes.

## Enlaces

- Hugging Face (repositorio de auditoria): https://huggingface.co/zhangshoufa/AgentDojo-Reference-Solution-Audit
- Hugging Face (dataset): https://huggingface.co/datasets/zhangshoufa/AgentDojo-Reference-Solution-Audit
- Zenodo (DOI): https://doi.org/10.5281/zenodo.23839673
- Zenodo (registro): https://zenodo.org/records/23839673
- Science Data Bank: https://doi.org/10.57760/sciencedb.0189k
- ModelScope (espejo): https://modelscope.cn/datasets/shoufanzhang/AgentDojo-Reference-Solution-Audit
- Issue upstream #244: https://github.com/ethz-spylab/agentdojo/issues/244
- PR de reproduccion y correccion #247: https://github.com/ethz-spylab/agentdojo/pull/247
- Commit fijado de AgentDojo: https://github.com/ethz-spylab/agentdojo/tree/089ed468cf3ed0322acc66b0211f26d9d90dbf60
