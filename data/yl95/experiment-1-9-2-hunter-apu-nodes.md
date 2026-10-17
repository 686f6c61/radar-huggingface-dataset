# YL95/experiment-1.9.2-hunter-apu-nodes

## Resumen

YL95/experiment-1.9.2-hunter-apu-nodes es un repositorio de HuggingFace que no contiene un modelo entrenado, sino artefactos de seguimiento de un experimento de aprendizaje automatico aplicado a series temporales financieras. El autor, YL95, publica aqui dos continuaciones del "Experiment 1.9 step 328", denominadas arm A y arm B, junto con archivos de eventos de TensorBoard. El repositorio ocupa 0,0 GB, no incluye pesos, no declara licencia ni idiomas, y acumula 0 descargas y 0 likes en el momento de la consulta.

El contenido de la model card describe un pipeline de entrenamiento distribuido sobre seis nodos Hunter MI300A y 24 workers de GPU, con un batch global de 1.536 por brazo, un presupuesto de 1.000 actualizaciones y una tasa de aprendizaje coseno de 6e-5 a 6e-6 con optimizador Adam. La distincion entre brazos es de muestreo: el arm A muestrea mercados factibles de forma uniforme y el arm B los pondera por dias-bolsa de las acciones incluidas en el periodo de entrenamiento.

La relevancia de esta publicacion es metodologica mas que de modelo: documenta un protocolo de evaluacion con identidades de acciones ocultas durante el entrenamiento, seleccion de checkpoint mediante las ultimas cinco puntuaciones de validacion con identificadores ocultos y un conjunto de test sellado hasta que ambos brazos finalizan. No es, por tanto, un modelo desplegable ni evaluable con benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene definicion de modelo ni pesos) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,0 GB sin archivos de pesos) |

## Arquitectura y entrenamiento

No se especifica arquitectura de red en la informacion disponible. Lo que si se documenta es la infraestructura y el regimen de entrenamiento: dos continuaciones del Experiment 1.9 a partir del paso 328, cada una ejecutada sobre seis nodos Hunter MI300A con 24 workers de GPU. El batch global es de 1.536 por brazo, con un presupuesto de 1.000 actualizaciones y un schedule de learning rate coseno que decae de 6e-5 a 6e-6. Se emplea el optimizador Adam y se preservan los registros de consumo de cestas del modelo padre.

La innovacion metodologica declarada es el ocultamiento de la identidad de las acciones durante todo el entrenamiento. El arm A muestrea mercados factibles de forma uniforme; el arm B pondera esos mercados por dias-bolsa de acciones incluidas en el periodo de entrenamiento. La seleccion de checkpoint usa las cinco ultimas puntuaciones de validacion con identificadores ocultos, y el test final permanece sellado hasta que ambos brazos terminan y la seleccion de checkpoint queda congelada. El holdout del 10% de acciones, seleccionado por hash, se excluye unicamente del nuevo entrenamiento 1.9.2, mientras que el modelo padre estuvo expuesto al universo completo.

## Capacidades

- Publicacion de curvas de entrenamiento comparables entre los brazos arm A y arm B mediante TensorBoard.
- Preservacion de los archivos de eventos historicos originales junto a los nuevos, con etiquetado explicito de reference-1.9.1-ids-on como referencia historica.
- Sincronizacion de los archivos de eventos y logs aprobados de forma inmediata y despues cada 300 segundos, con una subida final.
- Registro de un protocolo de evaluacion con identidades de acciones ocultas, util como referencia metodologica reproducible.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni soporte multilingue, porque el repositorio no contiene un modelo con pesos.

## Casos de uso

- Auditoria metodologica de experimentos financieros: el repositorio sirve para revisar como se disena un esquema de identidades ocultas y sellado de test en entrenamiento de series temporales, y para replicar el criterio de seleccion de checkpoint basado en las cinco ultimas validaciones.
- Comparacion controlada de estrategias de muestreo: los brazos A y B permiten medir el efecto de muestrear mercados de forma uniforme frente a ponderarlos por dias-bolsa, manteniendo constante el resto del pipeline.
- Seguimiento de entrenamientos distribuidos de larga duracion: la sincronizacion cada 300 segundos y la subida final de eventos facilitan monitorizar runs sobre clusters multi-nodo con relay local.
- Reproduccion de infraestructura: documenta una configuracion concreta de seis nodos MI300A y 24 workers de GPU con batch global de 1.536, util como punto de partida para dimensionar runs propios.
- Control de fugas de informacion: el diseno con holdout del 10% por hash y validacion ciega sirve de plantilla para evitar contaminacion entre entrenamiento y evaluacion en modelos financieros.
- Revision de riesgos de sesgo de supervivencia: los propios avisos del autor convierten el repositorio en material de estudio sobre que conclusiones no pueden extraerse de datos de solo supervivientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye pesos ni evaluaciones sobre tareas estandar (MMLU, HumanEval, GSM8K u otras). Las unicas cifras de evaluacion mencionadas son internas al experimento: comparaciones entrenamiento-era entre incluidos y excluidos sobre 1.248 cestas factibles emparejadas, y validacion sobre las 1.616 cestas de monitorizacion. El autor indica ademas que las diferencias por debajo de 0,004 son inconcluyentes y que cualquier afirmacion por mercado requiere analisis pareado por bloques temporales.

## Requisitos de hardware

- Entrenamiento (segun la model card): seis nodos Hunter MI300A y 24 workers de GPU, con batch global de 1.536 por brazo.
- VRAM para inferencia: no disponible, ya que no existen pesos publicados.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no hay artefactos desplegables; vLLM, llama.cpp, Ollama o TGI no son aplicables).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo con pesos ni de una arquitectura declarada, no existe una categoria de modelos comparables en terminos de parametros, contexto, rendimiento o licencia. El artefacto mas cercano conceptualmente serian otros repositorios de seguimiento de experimentos de series temporales financieras, pero no se dispone de informacion sobre alternativas concretas en la documentacion proporcionada.

## Limitaciones y advertencias

- El conjunto de datos es de solo supervivientes: no establece pertenencia point-in-time a mercados ni retornos de deslistado libres de sesgo.
- Las diferencias inferiores a 0,004 se consideran inconcluyentes; las afirmaciones por mercado exigen analisis pareado por bloques temporales.
- El holdout del 10% de acciones seleccionado por hash se excluye solo del entrenamiento 1.9.2, pero el modelo padre estuvo expuesto al universo completo, lo que limita la interpretacion de las comparaciones.
- Los artefactos publicos excluyen el estado del optimizador, el RNG, las bases de datos del sampler, los paneles privados, las listas de acciones en holdout y las definiciones de cohortes por cesta. La recuperacion completa del experimento permanece privada.
- El relay local depende de que el PC, la VPN y el tunel SSH autenticado sigan disponibles, por lo que la sincronizacion puede interrumpirse.
- Los contenidos del repositorio son instantaneas puntuales y no prueban que el entrenamiento haya finalizado.
- No se declara licencia, lo que impide determinar condiciones de uso comercial o de redistribucion.
- No hay pesos, ni model card de uso, ni metricas estandar, por lo que el artefacto no es utilizable como modelo en produccion.
- Se han descartado los resultados de la busqueda web por ser contenido no relacionado con el modelo y sin valor tecnico para esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/YL95/experiment-1.9.2-hunter-apu-nodes
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relevantes asociados a este modelo.
