# SZLHOLDINGS/salad-muhu-methodology-r1

## Resumen

`salad-muhu-methodology-r1` es un artefacto de modelo publicado por SZLHOLDINGS, una organización que se presenta como un "estate de IA gobernada" con modelos, datasets y Spaces acompañados de "receipts" verificables. El repositorio tiene un tamaño de 0,7 GB y contiene pesos en formato safetensors bajo licencia Apache 2.0. La model card no proporciona información sobre la arquitectura, el número de parámetros, el contexto, los idiomas ni el proceso de entrenamiento.

La card se limita a describir el marco de gobernanza del autor (identidad del repo, familias de receipts, política de honestidad) y a declarar explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un fichero de receipt se marca como UNKNOWN. En la sección RECEIPTS se indica que no existe un `DONE.json` estricto con `status=MEASURED` ni evidencia de evaluación, por lo que no se puede verificar ninguna capacidad del modelo.

Por tanto, esta ficha documenta un artefacto del que se conoce únicamente su existencia, formato y licencia. No hay datos públicos que permitan evaluar su calidad, su idoneidad para producción o su comportamiento en tareas concretas. Cualquier uso requeriría inspección directa de los pesos y de los ficheros del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no incluye ningún detalle técnico del artefacto más allá de su pertenencia a la "governed factory" de SZLHOLDINGS.

La sección de receipts del repositorio indica explícitamente que no existe evidencia de evaluación en el estándar estricto del autor (fichero `DONE.json` con `status=MEASURED`, `eval_rc=0`, marca temporal y receipt de entrenamiento). El único fichero con nombre de receipt encontrado es `assets/szl-card/mesh-receipts.svg`, que la propia card califica como coincidencia por palabra clave y no como evidencia validada. El tamaño del repositorio (0,7 GB) es compatible con un modelo pequeño en safetensors, pero no permite inferir parámetros ni arquitectura con rigor.

## Capacidades

- No se ha documentado ninguna capacidad específica del modelo en la información disponible.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de capacidades multilingües ni de modos especiales (thinking mode, visión, audio).
- No hay evidencia de generación de código, matemáticas ni razonamiento verificable.
- La card declara explícitamente que no se afirma ninguna capacidad sin receipts de evaluación medidos, y estos no existen en el repositorio.

## Casos de uso

No es posible recomendar casos de uso concretos sin evidencia de capacidades, contexto o calidad. Los siguientes escenarios son genéricos para cualquier modelo de lenguaje y requerirían validación previa con los pesos reales:

- Evaluación interna de artefactos: inspeccionar los safetensors y ejecutar una batería propia de prompts para determinar si el modelo produce texto coherente y en qué idiomas.
- Prototipado exploratorio en sandbox: cargar los pesos en un entorno aislado para comprobar si la arquitectura es compatible con transformers, vLLM o llama.cpp antes de considerar cualquier integración.
- Auditoría de gobernanza: usar el repositorio como caso de estudio del marco de receipts de SZLHOLDINGS y verificar qué evidencia falta respecto al estándar declarado.
- Pruebas de reproducibilidad: comparar el hash y el contenido de los safetensors con la documentación del autor para detectar discrepancias.
- Investigación sobre licencias: analizar la nota de licencia de la card, que indica que la etiqueta apache-2.0 se fijó por decisión interna del estate sin evidencia de licencia upstream por fichero.
- Formación: utilizar el repositorio como ejemplo de model card que separa afirmaciones medidas de afirmaciones no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y la sección de receipts confirma que la evidencia de evaluación es UNKNOWN.

## Requisitos de hardware

- VRAM estimada: no disponible; depende de parámetros y arquitectura, que no se han publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo; el repo de 0,7 GB sugiere un artefacto pequeño, pero no se puede confirmar.
- Opciones de despliegue: no verificadas; habría que comprobar compatibilidad con transformers, vLLM, llama.cpp, Ollama o TGI tras inspeccionar la configuración del repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del artefacto.

## Limitaciones y advertencias

- Ausencia total de evidencia de evaluación: no hay benchmarks, receipts medidos ni métricas publicadas.
- La model card marca como UNKNOWN cualquier afirmación de entrenamiento o capacidad no respaldada por receipts, y no hay receipts válidos en el repositorio.
- La nota de licencia indica que la etiqueta apache-2.0 se estableció por decisión interna del estate sin evidencia de licencia upstream por fichero; conviene verificar los derechos antes de uso comercial.
- Riesgo de alucinación y sesgos: no evaluables sin datos de entrenamiento ni pruebas.
- Idiomas y contexto: desconocidos, lo que impide garantizar comportamiento multilingüe o conversaciones largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de uso comunitario.
- No se debe asumir que el nombre "salad-muhu-methodology-r1" implique una metodología o familia concreta; es solo una etiqueta del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-muhu-methodology-r1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada): https://github.com/szl-holdings/estate-cards
