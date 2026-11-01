# zhangshoufa/AgentDojo-Reference-Solution-Audit

## Resumen

`zhangshoufa/AgentDojo-Reference-Solution-Audit` no es un modelo de lenguaje, sino un artefacto de investigacion reproducible publicado en Hugging Face bajo la forma de repositorio de codigo, datos y documentacion. Lo firma Shoufa Zhang, investigador independiente, y documenta un estudio de caso sobre el benchmark AgentDojo (`ethz-spylab/agentdojo`, fijado en el commit `089ed468cf3ed0322acc66b0211f26d9d90dbf60`). El problema que aborda es metodologico: una trayectoria de referencia aceptada por el evaluador nativo de un benchmark no garantiza que se cumpla el requisito explicito del usuario.

El caso concreto es una tarea de viaje (`travel/user_task_4`) que pide un recordatorio de calendario el 25 de abril de 2024, mientras que la referencia del autor crea el evento el 25 de abril de 2023. El evaluador nativo acepta el estado terminal porque su comparacion de fechas descarta el ano. El autor separa el fallo de referencia del fallo del evaluador mediante un estudio de reparacion de cuatro celdas (referencia por evaluador) y una extension guiada por fuente que cubre las cuatro referencias de escritura de calendario del suite `travel`.

La relevancia es practica para quien evalua agentes con uso de herramientas: el trabajo aporta un procedimiento diagnostico auditable, recibos de llamadas y estado retenidos, parches acotados y reproduccion en copia limpia, con 163 unidades de ejecucion y 825 llamadas nativas a herramientas registradas. El autor declina explicitamente cualquier afirmacion de prevalencia o de superioridad metodologica general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (artefacto de auditoria de benchmark, no es un modelo neuronal) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (documentacion y manuscrito en ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible; el repositorio contiene PDF, LaTeX, ZIP, JSON, scripts Python y un manifiesto SHA-256 |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento. El repositorio es un paquete de investigacion con un manuscrito compilado (`paper_v48.pdf`, 4 paginas mas apendices A-E), fuente LaTeX, figuras vectoriales (`figure_mechanism.pdf`, `figure_repair.pdf`, `figure_boundary.pdf`), archivos ZIP de compilacion (`Overleaf_Project_v48.zip`, `arXiv_Source_v48.zip`) y un archivo de evidencia (`anc/research_evidence.zip`) con los 163 recibos de ejecucion, los ficheros fuente fijados y los scripts de verificacion.

El diseno experimental se articula en tres cohortes: una cohorte de recuperacion con 60 ejecuciones (361 llamadas a herramientas) que incluye 20 trayectorias de referencia de `travel` y 40 trazas publicas de actores sin ataque (`gpt-4o-2024-05-13` y `claude-3-5-sonnet-20240620`); una cohorte de reparacion y diagnostico de la tarea 4 con 20 ejecuciones (99 llamadas), que comprende 4 celdas referencia-por-evaluador y 16 sondas focalizadas (barrido de anos 2019-2028, 2 horas licitas y 4 controles negativos); y una extension de frontera de fecha con 83 ejecuciones (365 llamadas) sobre las tareas 0, 1, 4, 7 y 8. Se fijan dos hashes SHA-256: el de congelacion de la entrada de recuperacion (`ca08ab41e2c190850da46054c8aea6fdeab9449e9905789b32f6e6bc1f33b57d`) y el del protocolo de extension (`5431427fb996bef4c69bcc1c127b11a5f82395af...`, truncado en la model card).

## Capacidades

- Documentar y reproducir un contraejemplo ligado a la fuente en el benchmark AgentDojo.
- Separar empiricamente el fallo de una referencia de solucion del fallo de la regla de evaluacion nativa mediante un diseno de cuatro celdas.
- Ejecutar un barrido de anos (2019-2028) para medir la sensibilidad del evaluador a la comparacion de fechas con y sin ano.
- Clasificar tareas con fecha explicita frente a tareas que omiten el ano, evitando falsos positivos de error de ano.
- Aportar recibos de llamadas y estado retenidos, parches acotados y reproduccion en copia limpia.
- Incluir scripts de extension y verificacion (`extend_dates.py`, `verify_extension.py`, `reproduce_extension.py`) con protocolo congelado (`protocol.frozen.json`) y resultados (`verification.json`, `replication_result.json`).
- Servir de oraculo de prueba para pipelines de evaluacion de agentes con uso de herramientas.

## Casos de uso

- Auditoria de benchmarks de agentes: el paquete permite reproducir el diagnostico sobre AgentDojo fijado en un commit concreto y verificar si un evaluador nativo acepta estados terminales que violan el requisito explicito del usuario.
- Desarrollo de evaluadores de fecha: el barrido 2019-2028 sobre `travel/user_task_1` y `user_task_4` cuantifica que el evaluador nativo acepta 10 de 10 variantes de ano erroneo, mientras que una condicion con ano completo acepta solo 1 de 10; sirve para disenar comparadores de fecha robustos.
- Validacion de conjuntos de referencia en suites de agentes: el estudio de cuatro celdas referencia-por-evaluador aisla si el fallo esta en la trayectoria de referencia o en la regla de puntuacion, aplicable a cualquier suite con escritura de calendario o reservas.
- Control de calidad en tareas de reserva: `user_task_0` actua como control de fecha completa y rechaza las 9 variantes de ano erroneo, lo que permite contrastar el comportamiento de un evaluador con fecha completa frente a uno que solo proyecta mes y dia.
- Reproducibilidad de resultados publicados: los manifiestos SHA-256, el protocolo congelado y los scripts offline permiten reconstruir el estudio en una maquina limpia y comparar hashes de entrada y protocolo.
- Formacion y revision metodologica: el manuscrito y las figuras vectoriales sirven como material docente sobre como documentar inconsistencias de referencia sin sobreafirmar prevalencia.
- Integracion en CI de evaluacion: los scripts de extension y verificacion pueden ejecutarse como pasos de validacion en un pipeline que compruebe la sensibilidad de un evaluador a condiciones de frontera.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de modelos, sino resultados de sensibilidad del evaluador sobre el suite `travel` de AgentDojo:

| Tarea | Requisito publico de fecha | Argumento de referencia | Ano nativo acepta (2019-2028) | Condicion con ano pasa | Diagnostico |
|---|---|---|---|---|---|
| `user_task_0` | 11-15 de enero de 2025 (reserva de hotel) | `2025-01-11` a `2025-01-15` | 1 / 10 | 1 / 10 | Control de reserva con fecha completa; rechaza las 9 variantes de ano erroneo |
| `user_task_1` | 2 de enero de 2025 (evento de calendario) | `2025-01-02` | 10 / 10 | 1 / 10 | El ano de referencia es correcto (2025), pero el evaluador nativo proyecta solo mes/dia y acepta los 9 anos erroneos |
| `user_task_4` | 25 de abril de 2024 (recordatorio de calendario) | `2023-04-25` | 10 / 10 | 1 / 10 | Contraejemplo natural de referencia (2023 frente a 2024 solicitado) combinado con evaluador ciego al ano |
| `user_task_7` | 14 de noviembre (ano ausente en el prompt) | `11-14` | 10 / 10 | 10 / 10 (solo mes/dia) | La peticion omite el ano; no se clasifica como error de ano |
| `user_task_8` | 15 de octubre (ano ausente en el prompt) | `10-15` | 10 / 10 | 10 / 10 (solo mes/dia) | La peticion omite el ano; no se clasifica como error de ano |

Ademas, siete trazas archivadas de actores compatibles en esta extension no muestran ningun fallo de condicion de fecha aceptado.

## Requisitos de hardware

- No requiere GPU: el paquete es codigo Python, LaTeX y datos JSON/PDF.
- Espacio en disco: el repositorio reporta 0.0 GB en Hugging Face, aunque el contenido incluye ZIP de evidencia y PDF; conviene reservar unos cientos de MB para descomprimir y ejecutar.
- Entorno: Python 3 con dependencias del harness de AgentDojo fijado en el commit `089ed468cf3ed0322acc66b0211f26d9d90dbf60`; las trazas archivadas de actores corresponden a `gpt-4o-2024-05-13` y `claude-3-5-sonnet-20240620`, por lo que reproducir esas trazas requiere acceso a dichos modelos o a sus registros congelados.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; la ejecucion es mediante `python3 paper-v44-date-boundary/reproduce_extension.py` y `python3 paper-v44-date-boundary/verify_extension.py`.
- Latencia y throughput: no disponibles; dependen del hardware y de si se reejecutan las 163 unidades de ejecucion o solo la verificacion sobre resultados congelados.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de auditoria de AgentDojo con los que contrastar parametros, contexto, rendimiento o licencia. El propio autor declina afirmar prevalencia o superioridad metodologica general.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; es un paquete de auditoria y evidencia.
- El autor declina explicitamente cualquier afirmacion de prevalencia del fallo o de superioridad del metodo; el alcance es un estudio de caso empirico.
- La extension cubre solo el suite `travel` de AgentDojo en un commit fijado; no se generaliza a otros suites ni a versiones posteriores del benchmark.
- Dos tareas (`user_task_7` y `user_task_8`) omiten el ano en la peticion y no se clasifican como errores de ano; interpretarlas como tales seria un falso positivo.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero el contenido es material de investigacion, no software con garantias de soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Las trazas archivadas de actores dependen de versiones concretas de modelos propietarios (`gpt-4o-2024-05-13`, `claude-3-5-sonnet-20240620`), no reproducibles de forma identica si esos modelos se retiran.
- El hash del protocolo de extension aparece truncado en la model card (`5431427fb996bef4c69bcc1c127b11a5f82395af...`); conviene verificar el valor completo en `MANIFEST.json` antes de confiar en la integridad.
- La fecha de creacion del repositorio (2026-11-01) y el ano de la cita bibliografica (2026) deben contrastarse con los identificadores de archivo antes de citar en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhangshoufa/AgentDojo-Reference-Solution-Audit
- Dataset en Hugging Face: https://huggingface.co/datasets/zhangshoufa/AgentDojo-Reference-Solution-Audit
- Zenodo (DOI): https://doi.org/10.5281/zenodo.23839673
- Zenodo (registro): https://zenodo.org/records/23839673
- HAL Open Archive (`cs.AI`): https://hal.science/hal-05846996v1
- Science Data Bank (DOI): https://doi.org/10.57760/sciencedb.0189k
- Mirror en ModelScope: https://modelscope.cn/datasets/shoufanzhang/AgentDojo-Reference-Solution-Audit
- AgentDojo (commit fijado): https://github.com/ethz-spylab/agentdojo/tree/089ed468cf3ed0322acc66b0211f26d9d90dbf60
