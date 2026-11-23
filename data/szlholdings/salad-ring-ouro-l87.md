# SZLHOLDINGS/salad-ring-ouro-l87

## Resumen

`salad-ring-ouro-l87` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face, dentro de lo que el autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con resultados supuestamente verificables mediante ficheros de recibos (receipts). El repositorio se creo el 19 de noviembre de 2026 y se actualizo el 23 de noviembre de 2026, sin descargas ni "likes" registrados en el momento de la consulta.

La model card no proporciona informacion tecnica sustantiva: no especifica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. Se limita a describir el proceso de generacion de la propia tarjeta mediante una herramienta interna ("estate-cards weaver"), a mostrar diagramas SVG deterministas y a declarar que cualquier afirmacion sobre entrenamiento o evaluacion debe consultarse en los ficheros de recibos del "estate", y que lo no registrado alli se etiqueta como UNKNOWN.

La seccion de recibos incluida en la propia tarjeta es especialmente relevante: un escaneo estricto de 22 de noviembre de 2026 clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no existe un `DONE.json` que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento). La evidencia de evaluacion figura como UNKNOWN. En la practica, esto significa que no hay ningun dato verificado sobre calidad, capacidades o rendimiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida). La model card no menciona tipo de red, dimensiones, numero de capas ni mecanismos de atencion.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El autor remite explicitamente a los "receipt files" del estate para cualquier afirmacion de entrenamiento o evaluacion, y declara que lo no registrado en ellos se considera UNKNOWN. El escaneo estricto citado en la propia tarjeta confirma que no existe un recibo de entrenamiento validado al umbral exigido.

## Capacidades

- No se declara ninguna capacidad concreta en la informacion disponible.
- No hay evidencia de soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de tool calling ni function calling.
- No hay evidencia de soporte para agentes o razonamiento multi-paso.
- No hay evidencia de capacidades multilingues.
- No hay evidencia de modos especiales (thinking mode, vision, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificada sobre arquitectura, tamano, contexto o capacidades. Cualquier aplicacion practica requeriria primero confirmar que el artefacto contiene pesos utilizables y que existe evidencia medida de su comportamiento. A modo de orientacion sobre que habria que validar antes de plantear un uso:

- Evaluacion de integridad del artefacto: comprobar si el repositorio contiene pesos reales (safetensors, GGUF u otro formato) o solo metadatos y diagramas SVG, antes de considerar cualquier despliegue.
- Verificacion de recibos: localizar el `DONE.json` con status=MEASURED, eval_rc=0 y timestamp que el propio autor exige como umbral estricto; sin el, no hay base para afirmar ninguna capacidad.
- Pruebas de humo controladas: si existieran pesos, ejecutar inferencias de prueba en un entorno aislado para determinar si el modelo produce texto coherente.
- Auditoria de licencia: aclarar los terminos de uso, ya que la licencia figura como no disponible, antes de cualquier uso comercial.
- Trazabilidad de origen: contrastar el repositorio con la organizacion canonica indicada (github.com/szl-holdings) para confirmar la procedencia del artefacto.
- Integracion en pipelines de evaluacion: en caso de existir pesos, someterlo a los mismos benchmarks estandar (MMLU, HumanEval, GSM8K) que el resto de candidatos antes de asignarle cualquier rol en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto del 22 de noviembre de 2026 registra la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que existan pesos en formato utilizable.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la categoria, el tamano ni la tarea del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parametros, contexto ni formato de pesos, lo que impide cualquier evaluacion tecnica.
- Evidencia de evaluacion UNKNOWN: el propio escaneo del autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, sin `DONE.json` al umbral estricto.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; tratarlo como no apto para produccion hasta aclararlo.
- Riesgo de repositorio no sustantivo: la tarjeta esta generada por una herramienta interna y los unicos ficheros citados son diagramas SVG, no pesos ni datasets.
- Riesgo de alucinacion y sesgos: no evaluables sin pesos ni documentacion.
- Idiomas: no declarados, por lo que no hay garantia de soporte del castellano ni de ningun otro idioma.
- Trazabilidad limitada: la fuente canonica apunta a una organizacion de GitHub cuya verificacion queda fuera de la informacion proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l87
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica indicada por el autor: https://github.com/szl-holdings
- Herramienta de generacion de tarjetas citada: https://github.com/szl-holdings/estate-cards
