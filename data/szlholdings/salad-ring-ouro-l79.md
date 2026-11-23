# SZLHOLDINGS/salad-ring-ouro-l79

## Resumen

salad-ring-ouro-l79 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad documental. El repositorio no incluye model card técnica convencional: la información disponible se limita a metadatos de identidad, referencias a ficheros de recibos (receipts) y afirmaciones de honestidad sobre la ausencia de métricas verificadas. No se especifican arquitectura, tamaño, contexto ni datos de entrenamiento en la información proporcionada.

La relevancia de esta ficha es limitada desde el punto de vista de evaluación técnica: se trata de un artefacto sin pipeline declarado, sin licencia especificada, sin idiomas declarados y con cero descargas y cero likes en el momento de la consulta. El propio autor reconoce en la model card que cualquier afirmación de entrenamiento o evaluación que no esté respaldada por un recibo medido debe considerarse UNKNOWN (desconocida), y el escaneo de recibos más reciente clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero ningún DONE.json que cumpla el estándar estricto de evidencia.

En consecuencia, esta ficha documenta lo que el autor declara explícitamente y marca como "no disponible" todo aquello que no aparece en la información proporcionada, sin inferir parámetros, capacidades ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio referencia ficheros de recibos, no se confirma ningún formato de pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no describe si se trata de un transformer, un modelo de mezcla de expertos, una arquitectura de espacio de estados o un híbrido, ni indica el número de parámetros, la longitud de contexto o la composición del corpus de entrenamiento.

Respecto al entrenamiento, el autor remite a los ficheros de recibos del "estate mesh" y afirma que cualquier claim de entrenamiento o evaluación no respaldado por un recibo medido es UNKNOWN. El escaneo de recibos de la tranche 6 (chunk 9, del 22 de noviembre de 2026) clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg), pero no hay un DONE.json con status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento que satisfaga el estándar estricto del propio autor. No se documenta ningún proceso de RLHF, DPO, SFT ni innovación técnica concreta.

## Capacidades

- No se declara ninguna capacidad concreta (generación de texto, razonamiento, código, matemáticas, visión o audio) en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- No se declara modo de razonamiento (thinking mode) ni capacidades multimodales.
- El autor indica explícitamente que no se afirma ninguna capacidad sin recibos de evaluación medidos.

## Casos de uso

- Auditoría de artefactos de IA gobernada: el repositorio puede emplearse como caso de estudio de un pipeline de publicación que exige recibos medidos antes de afirmar capacidades, dado que el propio autor clasifica el artefacto como pendiente de evidencia estricta.
- Verificación de trazabilidad documental: útil para equipos que diseñan sistemas de procedencia y quieren examinar cómo se estructura una model card generada de forma determinista con etiquetas MEASURED/REPORTED/UNKNOWN.
- Evaluación de gobernanza de modelos: sirve para ilustrar el patrón de "no afirmar sin medir", comparando la sección de honestidad con el resultado del escaneo de recibos.
- Docencia sobre model cards: ejemplo de ficha que separa identidad, evidencia y estado de verificación, útil en formación sobre documentación de modelos.
- Integración en inventarios de modelos internos: puede registrarse como artefacto de referencia con estado "sin evidencia" para excluirlo de despliegues en producción hasta que existan recibos válidos.
- Pruebas de herramientas de escaneo de repositorios: el repositorio permite validar escáneres que detectan ficheros con nombre de recibo sin DONE.json asociado.

No se recomienda su uso en aplicaciones de producción (atención al cliente, generación de código, análisis de datos u otras) porque no hay evidencia de capacidades, licencia ni formato de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos indica que la evidencia de evaluación es UNKNOWN (no hay DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma ningún formato de pesos compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar la categoría del modelo (tamaño, tarea, arquitectura) ni, por tanto, seleccionar alternativas comparables con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de evidencia medida: el escaneo de recibos clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evaluación figura como UNKNOWN.
- Licencia no especificada: no puede determinarse si el uso comercial está permitido; no debe desplegarse en producción sin aclaración legal.
- Idiomas no declarados: se desconoce la cobertura lingüística y el comportamiento en castellano.
- Arquitectura y tamaño desconocidos: imposible estimar requisitos de hardware, latencia o coste de inferencia.
- Riesgo de alucinación: no evaluable sin benchmarks ni pruebas documentadas; no hay datos que permitan acotarlo.
- Sesgos conocidos: no documentados.
- Metadatos incompletos: sin pipeline declarado, sin descargas ni interacciones, lo que impide validar el artefacto por uso comunitario.
- Fechas de creación y actualización (noviembre de 2026) posteriores a la consulta habitual de referencias: conviene verificar el estado actual del repositorio antes de cualquier evaluación.
- La model card incluye contenido generado automáticamente (estate-cards weaver v0.1.0) y referencias a organizaciones externas; debe tratarse como documentación del autor, no como validación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l79
- Organización del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub referenciada como fuente canónica: https://github.com/szl-holdings
- Repositorio de la herramienta de generación de fichas: https://github.com/szl-holdings/estate-cards
- Resultado de búsqueda web proporcionado (no relacionado con el modelo): https://americanprofessionguide.com/engaging-audience-with-polls-and-q-a-sessions/
