# SZLHOLDINGS/salad-ring-ouro-l25

## Resumen

`salad-ring-ouro-l25` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con resultados supuestamente verificables mediante ficheros de recibos (receipts). El repositorio se creo el 18 de noviembre de 2026 y se actualizo dos dias despues, sin descargas ni interacciones registradas en el momento de redactar esta ficha.

La model card no proporciona informacion tecnica sustantiva: no declara arquitectura, numero de parametros, longitud de contexto, idioma, licencia ni formato de pesos. El autor afirma explicitamente que cualquier dato de entrenamiento o evaluacion que no aparezca en sus ficheros de recibos debe considerarse desconocido (UNKNOWN), y que no se afirma ningun resultado de benchmark mas alla de lo medido en una auditoria fechada. Los resultados de busqueda web disponibles no guardan relacion con el modelo (tratan sobre un emoji), por lo que no aportan informacion adicional.

En consecuencia, esta ficha se limita a documentar lo que el repositorio declara y a marcar como "no disponible" todo aquello que no consta. No es posible evaluar el modelo para uso en produccion con la informacion publica actual.

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

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM u otra), el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor remite a los "receipt files" del "estate mesh" para cualquier afirmacion sobre entrenamiento o evaluacion, pero no enlaza ni incluye dichos ficheros en la informacion disponible.

El unico elemento tecnico mencionado es la generacion de las graficas de la model card: SVG determinista producido con la biblioteca estandar de Python a partir de una instantanea de auditoria fechada el 2026-11-20T03:48:04Z, etiquetada como MEASURED. Esto describe el proceso de documentacion del repositorio, no el modelo en si.

## Capacidades

- No se declara ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas, vision) en la informacion disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta capacidad multilingue ni idiomas cubiertos.
- No consta ningun modo especial (thinking mode, vision, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer arquitectura, tamano, contexto, licencia ni rendimiento del modelo. A modo de orientacion sobre que habria que verificar antes de plantear cualquier aplicacion:

- Evaluacion previa obligatoria: antes de considerar el modelo para cualquier tarea, habria que localizar los ficheros de recibos citados por el autor y verificar los resultados de la auditoria fechada.
- Clasificacion o generacion de texto: solo viable si se confirma que el artefacto contiene pesos utilizables y en que formato.
- Integracion en pipelines: requiere conocer el formato de pesos y las herramientas de inferencia compatibles, datos no publicados.
- Despliegue en produccion: requiere licencia explicita que autorice uso comercial, ausente en la informacion disponible.
- Evaluacion comparativa interna: posible solo tras obtener metricas propias, ya que no hay benchmarks publicados.
- Uso educativo o de investigacion: condicionado a que la licencia lo permita, dato no disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se asserta ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no incluye dichos numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; se desconoce el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse el tamano, la arquitectura ni la tarea del modelo, no es posible identificar alternativas comparables de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin parametros, contexto ni arquitectura no se puede dimensionar el coste de inferencia ni la viabilidad del despliegue.
- Licencia no declarada: no hay autorizacion explicita de uso comercial; utilizarlo en produccion conlleva riesgo juridico.
- Idiomas no declarados: se desconoce si el modelo rinde adecuadamente en castellano.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia publica de calidad, sesgos o tasas de alucinacion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.
- Referencias incompletas: la model card remite a ficheros de recibos y a una organizacion de GitHub que no se detallan en la informacion disponible; conviene verificar su existencia y contenido antes de confiar en las afirmaciones del autor.
- Fechas de creacion y actualizacion en 2026: verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l25
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas (referenciada): https://github.com/szl-holdings/estate-cards
