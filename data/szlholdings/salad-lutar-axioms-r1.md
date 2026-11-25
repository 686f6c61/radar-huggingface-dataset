# SZLHOLDINGS/salad-lutar-axioms-r1

## Resumen

salad-lutar-axioms-r1 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibo (receipts). El repositorio de Hugging Face ocupa 1,1 GB y contiene pesos en formato safetensors bajo licencia Apache 2.0, aunque la model card no especifica arquitectura, número de parámetros, longitud de contexto ni idiomas soportados.

La propia model card es explícita sobre la ausencia de evidencia: indica que cualquier afirmación de entrenamiento o evaluación que no esté respaldada por un recibo medido se considera UNKNOWN (desconocido). Un escaneo posterior de los recibos, etiquetado como "receipts-tranche-6 chunk-3" con fecha 2026-11-22, clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo, pero no hay un DONE.json estricto con status=MEASURED, eval_rc=0 y marca temporal.

Por tanto, la relevancia práctica de este modelo es limitada para producción: no hay benchmarks publicados, no hay descripción de arquitectura ni de datos de entrenamiento, y la licencia Apache 2.0 se asignó por decisión operativa del "estate" (nota w45z del 2026-11-25) sin evidencia de licencia upstream por fichero. Esta ficha documenta lo que el repositorio declara y marca explícitamente como no disponible todo lo que no consta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o un modelo de espacio de estados. Tampoco se documenta el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens procesados ni si hubo fases de ajuste supervisado, RLHF o DPO.

El único dato estructural verificable es el tamaño del repositorio (1,1 GB), compatible con un modelo de escala pequeña o con pesos cuantizados, pero insuficiente para inferir parámetros o arquitectura. La sección de recibos del repositorio declara explícitamente que la evidencia de evaluación es UNKNOWN al no existir un DONE.json en el estándar estricto del estate, por lo que no se puede confirmar que el artefacto haya completado un ciclo de entrenamiento verificado.

## Capacidades

- Generación de texto: no confirmada; la model card no describe tareas soportadas.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio no está poblado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Trazabilidad declarada: el autor presenta el artefacto como parte de un estate con recibos auditables, pero el escaneo estricto no valida esa evidencia.

## Casos de uso

- Evaluación de la cadena de trazabilidad del estate: el repositorio puede usarse como caso de estudio para auditar cómo SZLHOLDINGS documenta (o no) sus artefactos, comparando la model card con los ficheros de recibo presentes.
- Pruebas de carga de pesos safetensors: dado que el formato está declarado, un ingeniero puede validar la integridad del fichero y comprobar si las dimensiones de los tensores son coherentes con algún modelo conocido.
- Investigación sobre gobernanza de modelos: el caso ilustra el patrón "receipt-named files sin DONE.json estricto", útil para diseñar políticas internas de aceptación de artefactos en un registro corporativo.
- Prototipado exploratorio aislado: si los pesos cargan correctamente, podría probarse en un entorno sin requisitos de calidad, siempre que se valide manualmente cualquier salida antes de usarla.
- Docencia sobre riesgos de supply chain de modelos: sirve como ejemplo de repositorio con licencia declarada pero sin evidencia upstream por fichero, útil para formar equipos en revisión de dependencias.
- No se recomienda su uso en atención al cliente, generación de código en producción, pipelines de CI/CD ni ningún escenario con requisitos de calidad medibles, porque no existe evidencia de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como UNKNOWN al no existir un DONE.json en el estándar estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; sin conocer el número de parámetros no puede calcularse. El tamaño del repositorio (1,1 GB) sugiere que los pesos cabrían en GPUs de consumo con 8-12 GB de VRAM si el artefacto es un modelo pequeño, pero es una inferencia no verificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no consta que el modelo se haya probado en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar la categoría del modelo (tamaño, tarea, arquitectura), por lo que no es posible establecer una comparación rigurosa con alternativas. Cualquier comparación sería especulativa y contravendría la regla de no inventar datos.

## Limitaciones y advertencias

- Ausencia total de evidencia de evaluación: no hay benchmarks, ni resultados de validación, ni un DONE.json estricto que respalde el entrenamiento.
- Model card generada automáticamente: el texto procede de una herramienta ("estate-cards weaver v0.1.0") y no de una descripción técnica del autor, lo que reduce su valor informativo.
- Licencia Apache 2.0 asignada por decisión operativa: la nota w45z indica que la etiqueta se fijó por un "rights-call" del CTO del estate sin evidencia de licencia upstream por fichero, lo que introduce riesgo legal en uso comercial.
- Idiomas no declarados: no puede asumirse soporte de castellano ni de ningún otro idioma.
- Riesgo de alucinación: no evaluable sin pruebas; al no conocerse el entrenamiento, no puede descartarse.
- Sesgos conocidos: no disponible.
- Contexto y límites de uso: no disponible.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- No apto para producción sin una auditoría independiente de pesos, licencia y comportamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-lutar-axioms-r1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (según model card): https://github.com/szl-holdings
- Herramienta de generación de cards (según model card): https://github.com/szl-holdings/estate-cards
