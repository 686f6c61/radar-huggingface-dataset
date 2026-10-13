# wilsonngu/retrieval-exp

## Resumen

`wilsonngu/retrieval-exp` es un prototipo de investigacion publicado en HuggingFace por el usuario wilsonngu, orientado a tareas de recuperacion (retrieval) multimodal. La model card lo describe explicitamente como un esqueleto de investigacion: incluye codigo ejecutable (`eval.py`), un `config.json` con la arquitectura generada, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que el propio autor califica como checkpoint de inicializacion valido unicamente para pruebas de humo (smoke tests), no como un modelo entrenado ni evaluado.

La arquitectura declarada es "Coca", con atencion dilatada, fusion mediante cross attention, activacion gelu tanh y normalizacion groupnorm, en una escala etiquetada como "huge" en la documentacion. Sin embargo, el recuento real de parametros del fichero safetensors es de solo 49.600 parametros, una discrepancia muy notable respecto a la etiqueta de escala que conviene tener presente: no se trata de un modelo de gran tamano en terminos efectivos.

Su relevancia actual es limitada y de naturaleza metodologica: no aporta resultados de benchmarks, no tiene descargas ni interacciones en el momento de la consulta y no se presenta como un artefacto listo para produccion. Su interes esta en servir como plantilla reproducible para montar experimentos de retrieval, definir formatos de ficheros y configurar recetas de entrenamiento comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (atencion dilatada, fusion por cross attention, activacion gelu tanh, normalizacion groupnorm) |
| Parametros totales | 49.600 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicializacion) |

## Arquitectura y entrenamiento

El autor declara una arquitectura denominada Coca, con atencion dilatada y fusion de modalidades mediante cross attention. La activacion es gelu tanh y la normalizacion es groupnorm. La escala declarada en la tabla de la model card es "huge", aunque el recuento efectivo de parametros del checkpoint (49.600) no es coherente con esa etiqueta, por lo que el dato de escala debe interpretarse como una etiqueta del script de configuracion y no como una descripcion del modelo resultante.

No hay evidencia de entrenamiento completado. La receta por defecto incluida en `training_args.json` usa el optimizador adafactor con un scheduler de tipo coseno, pero el propio autor aclara que son valores de partida del script y no prueba de una ejecucion finalizada. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. La model card indica que cualquier resultado futuro debe documentarse por separado de los valores por defecto aqui publicados, y que la comparacion de baselines debe hacerse con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Recuperacion multimodal (retrieval): el prototipo esta orientado a esta tarea, pero el checkpoint incluido no esta entrenado, por lo que no se puede esperar calidad funcional en recuperacion real.
- Ejecucion de un entry point de evaluacion (`eval.py`): permite lanzar una prueba de humo con el bloque `__main__` del script.
- Definicion de formatos: el repositorio documenta `config.json`, `training_args.json` y `model.safetensors` como referencia de estructura.
- Carga mediante adaptador explicito: al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador especifico antes de su uso.
- Tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Pruebas de humo de pipelines de retrieval: usar `eval.py` para verificar que el entorno, las dependencias y el bucle de evaluacion arrancan correctamente antes de integrar un checkpoint real.
- Plantilla para experimentos reproducibles: `training_args.json` sirve como punto de partida para fijar optimizador (adafactor), scheduler (coseno), semillas y presupuesto de ajuste, garantizando que los baselines se comparen en igualdad de condiciones.
- Desarrollo de adaptadores de carga personalizados: dado que el modelo no es compatible con cargadores automaticos genericos, el repositorio es util para probar el registro de arquitecturas y adaptadores propios.
- Referencia de esquema de configuracion: `config.json` documenta los hiperparametros de arquitectura (atencion dilatada, cross attention, groupnorm) que pueden reutilizarse como base en otros prototipos.
- Docencia y formacion en evaluacion de retrieval: el repositorio ilustra como plantear una primera evaluacion sobre Flickr30k reportando la metrica de la tarea en al menos tres semillas e incluyendo un baseline de capacidad equiparable.
- Punto de partida para estudios de ablacion: la estructura separa configuracion de arquitectura, receta de entrenamiento y pesos, lo que facilita variar un solo factor a la vez en experimentos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint no esta entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 49.600 parametros, el checkpoint ocupa aproximadamente 0,19 MB en precision de 32 bits y unos 0,10 MB en 16 bits.
- GPU recomendadas: no se requiere GPU. Cualquier GPU de consumo (por ejemplo, una RTX 3060 o superior) o incluso CPUs convencionales son suficientes para ejecutar el prototipo.
- Compatibilidad con GPU de consumo: si, en cualquier modelo, incluidos los integrados, dado el tamano del checkpoint.
- Opciones de despliegue: requiere un adaptador explicito para APIs de carga generica. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y por el momento no tiene sentido plantearlos para este prototipo.
- Latencia y throughput: no disponibles. Al no existir un checkpoint entrenado, las mediciones carecerian de significado funcional.

## Comparativa con modelos similares

No disponible. El repositorio no publica metricas, no identifica baselines concretos y no entrena el checkpoint, por lo que cualquier comparacion cuantitativa con modelos de retrieval multimodal (por ejemplo, la familia CLIP o modelos tipo BLIP) seria especulativa. La propia model card recomienda, para una evaluacion futura, usar Flickr30k, reportar la metrica de la tarea en al menos tres semillas e incluir un baseline de capacidad equiparable.

## Limitaciones y advertencias

- El checkpoint es de inicializacion: no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.
- No se reclama ninguna puntuacion de benchmark; no debe citarse como modelo con rendimiento verificado.
- Discrepancia de escala: la etiqueta "huge" de la model card no se corresponde con los 49.600 parametros reales del fichero safetensors.
- Riesgo de alucinacion: no evaluable, al no existir un modelo entrenado con el que medir este comportamiento.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no puede garantizarse cobertura multilingue ni gestion de contextos largos.
- Carga no estandar: las APIs automaticas requieren un adaptador especifico; el usuario debe inspeccionar el bloque `__main__` del script para localizar el ejemplo de prueba incluido.
- Licencia BSD-3-Clause: permisiva y compatible con uso comercial, pero conviene revisar por separado los terminos de las fuentes de datos externas que se utilicen junto al repositorio.
- Estado del repositorio: cero descargas y cero interacciones en el momento de la consulta, sin senales de mantenimiento posterior a su creacion.
- Advertencia de la busqueda web: las consultas realizadas no devolvieron informacion relevante sobre el modelo; los resultados obtenidos correspondian a portales de empleo sin relacion con este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wilsonngu/retrieval-exp
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en la busqueda web realizada.
