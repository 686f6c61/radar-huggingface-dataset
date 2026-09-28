# xhb120633/behavioral-model-ablations

## Resumen

`xhb120633/behavioral-model-ablations` no es un modelo de lenguaje publicado para inferencia general, sino un repositorio de artefactos de investigacion que acompana el preprint *Better Behavioral Prediction, More Faithful Model Ablations? Evidence from Sequential Choice*, de Hanbo Xie. Contiene datos sinteticos de eleccion secuencial, exportaciones de evaluacion y pesos congelados de modelos entrenados, con un tamano total de repositorio de 14,4 GB. El objetivo declarado es permitir la reproduccion de los resultados del articulo, no ofrecer un modelo listo para produccion.

El contenido principal son 28 adaptadores SFT sobre LLaMA distribuidos en dos tareas (`task_a/` y `task_b/`), con variantes de entrada completa y de solo eleccion, y siete pesos de recompensa distintos. Ademas, `review_artifacts/` incluye registros sinteticos de entrenamiento, validacion y test congelados, exportaciones de predicciones sobre test independiente, 168 checkpoints de GRU y Transformer seleccionados por validacion, ajustes de modelos cognitivos y registros de auditoria. El modelo base de LLaMA no se redistribuye y sigue sujeto a sus propios terminos de acceso.

La relevancia del repositorio es metodologica: sirve como material reproducible para estudiar si una mejor prediccion del comportamiento se corresponde con ablaciones mas fieles del modelo, y para comparar arquitecturas de secuencia (GRU, Transformer) con adaptadores de un LLM sobre la misma tarea de eleccion secuencial. La model card no especifica parametros, contexto, idiomas ni licencia del artefacto, por lo que esos datos figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores SFT sobre LLaMA (28 adaptadores) y checkpoints de GRU y Transformer (168 en total) para modelado cognitivo |
| Parametros totales | no disponible (los adaptadores heredan el tamano del modelo base LLaMA, no especificado; el repositorio no redistribuye sus pesos) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica explicitamente que el repositorio no concede una licencia nueva para el modelo base LLaMA ni para otras dependencias upstream |
| Formato de pesos | safetensors (etiqueta del repositorio), junto con checkpoints de GRU/Transformer y datos en otros formatos dentro de `review_artifacts/` |

## Arquitectura y entrenamiento

El repositorio combina dos familias de modelos. Por un lado, 28 adaptadores de ajuste supervisado (SFT) sobre un modelo base LLaMA, organizados en dos tareas de eleccion secuencial y con dos regimenes de entrada (entrada completa y solo eleccion), cruzados con siete pesos de recompensa. Estos adaptadores corresponden a las "ablaciones de modelo" del titulo del preprint. El modelo base no se distribuye: la model card remite a sus terminos de acceso originales, de modo que para reproducir los adaptadores hay que obtener la version correspondiente de LLaMA por separado. `MANIFEST.json` registra los hashes de los ficheros de los adaptadores.

Por otro lado, `review_artifacts/` contiene 168 checkpoints de GRU y Transformer seleccionados por validacion, junto con registros sinteticos de entrenamiento, validacion y test congelados, exportaciones de predicciones sobre test independiente, ajustes de modelos cognitivos y registros de auditoria. Las figuras principales del manuscrito se basan en resultados de test independiente de los checkpoints seleccionados por validacion; algunos controles suplementarios y la ilustracion de la figura 1A usan datos de entrenamiento o validacion, segun se etiqueta en el articulo. No hay datos nuevos de participantes humanos: los datos de eleccion secuencial son sinteticos. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO sobre los adaptadores.

## Capacidades

- Prediccion de eleccion secuencial sobre datos sinteticos, en dos tareas diferenciadas (`task_a/` y `task_b/`) y bajo siete configuraciones de peso de recompensa.
- Ajuste fino supervisado (SFT) de un modelo base LLaMA mediante adaptadores, con variantes de entrada completa y de solo eleccion.
- Modelado cognitivo comparativo: los checkpoints de GRU y Transformer permiten contrastar arquitecturas sobre la misma tarea y los mismos datos sinteticos.
- Reproduccion de experimentos: los registros congelados y las exportaciones de predicciones permiten recalcular figuras a partir de resumenes guardados.
- Auditoria y verificacion de integridad mediante `MANIFEST.json` (hashes) y los registros de auditoria incluidos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion de resultados cientificos: los adaptadores, los checkpoints y los registros congelados permiten volver a generar las figuras del preprint a partir de los resumenes guardados, siguiendo las instrucciones de `preprint_code.zip/behavioral_model_ablations_code/README.md`.
- Comparacion de arquitecturas en modelado cognitivo: los 168 checkpoints de GRU y Transformer seleccionados por validacion permiten estudiar el ajuste de modelos recurrentes frente a atencion en tareas de eleccion secuencial con el mismo dataset sintetico.
- Estudio de ablaciones de fidelidad: los 28 adaptadores con distintos pesos de recompensa permiten replicar los experimentos que relacionan calidad de prediccion conductual con fidelidad de la ablacion del modelo.
- Analisis de generalizacion: las exportaciones de prediccion sobre test independiente permiten evaluar el comportamiento fuera de la distribucion de validacion sin reentrenar.
- Docencia en ciencia computacional del comportamiento: el repositorio sirve como caso practico de flujo completo (datos sinteticos, checkpoints, seleccion por validacion, figuras reproducibles) con dependencias y tests incluidos en `preprint_code.zip`.
- Metaciencia y auditoria de publicaciones: los registros de auditoria y los hashes del manifiesto permiten verificar que los artefactos evaluados coinciden con la instantanea revisada.
- Reutilizacion de adaptadores SFT como linea base: los adaptadores sobre LLaMA pueden emplearse como punto de partida para experimentos propios sobre tareas de eleccion secuencial, siempre que se obtenga aparte el modelo base bajo sus terminos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas numericas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y el repositorio esta orientado a la evaluacion conductual dentro del propio preprint, cuyos valores no se reproducen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base LLaMA elegido, que el repositorio no especifica ni redistribuye.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible; sin conocer el tamano del modelo base no puede determinarse.
- Almacenamiento: el repositorio ocupa 14,4 GB, por lo que conviene disponer de al menos ese espacio libre mas el necesario para el modelo base y los entornos de ejecucion.
- Opciones de despliegue: no se documentan en la model card. El material esta pensado para ejecutarse mediante el codigo y los requirements incluidos en `preprint_code.zip`, no mediante servidores de inferencia como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.
- Nota: los adaptadores SFT anaden un coste de almacenamiento muy inferior al del modelo base, pero su ejecucion requiere cargar dicho modelo base completo en memoria.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de proposito general, sino un paquete de artefactos de investigacion vinculado a un preprint concreto, por lo que no existen alternativas equivalentes directamente comparables en parametros, contexto o licencia. La comparacion relevante es interna al propio repositorio, entre los adaptadores LLaMA, los checkpoints GRU y los checkpoints Transformer entrenados sobre el mismo dataset sintetico.

| Alternativa | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adaptadores SFT sobre LLaMA (este repositorio) | no disponible | no disponible | no disponible (el base mantiene sus terminos) | publico en HuggingFace |
| Checkpoints GRU (este repositorio) | no disponible | no disponible | no disponible | publico en HuggingFace |
| Checkpoints Transformer (este repositorio) | no disponible | no disponible | no disponible | publico en HuggingFace |

## Limitaciones y advertencias

- No es un modelo listo para produccion: se trata de artefactos de investigacion asociados a un preprint, con descargas y likes registrados de 0 en el momento de la consulta.
- Los datos son sinteticos y de eleccion secuencial; no hay datos nuevos de participantes humanos. Las conclusiones no deben extrapolarse sin validacion a poblaciones o dominios reales.
- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgo.
- Riesgo de alucinacion: no evaluado en la informacion disponible. El uso previsto es la prediccion de elecciones en una tarea acotada, no la generacion abierta de texto.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: el repositorio no concede licencia nueva alguna y no especifica los terminos aplicables a los adaptadores ni a los demas artefactos. El modelo base LLaMA no se redistribuye y sigue sujeto a sus terminos de acceso originales, lo que condiciona cualquier uso comercial.
- Dependencia externa: para ejecutar los adaptadores hay que obtener por separado el modelo base, cuya version concreta no se detalla en la informacion proporcionada.
- Reproducibilidad parcial: reconstruir figuras a partir de resumenes guardados no equivale a reentrenar ni a repetir la inferencia, segun advierte la propia model card.
- Fechas del repositorio: creado y actualizado el 2026-09-28 segun los metadatos de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xhb120633/behavioral-model-ablations
- Repositorio de codigo en GitHub: https://github.com/xhb120633/transformer_bias_learning
- Preprint de referencia: *Better Behavioral Prediction, More Faithful Model Ablations? Evidence from Sequential Choice*, de Hanbo Xie (enlace directo no disponible en la informacion proporcionada)
