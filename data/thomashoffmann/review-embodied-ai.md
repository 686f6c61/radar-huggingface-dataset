# thomashoffmann/review-embodied-ai

## Resumen

Este repositorio, publicado por thomashoffmann bajo licencia CC-BY-4.0, no contiene un modelo de inteligencia artificial entrenado, sino un conjunto estructurado de notas de investigación sobre IA encarnada (Embodied AI). El artefacto principal es un documento `summary.md` que delimita el alcance de una pregunta de investigación, propone comparaciones con líneas base emparejadas, sugiere benchmarks públicos apropiados para evaluación, e incluye comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas.

Aunque el repositorio incluye un archivo en formato safetensors con 24.832 parámetros, se trata de un artefacto residual o de prueba, no de un modelo funcional. La model card es explícita al señalar que no se reivindican mejoras de benchmarks, ablaciones completadas, código liberado ni un checkpoint entrenado. Su relevancia radica en servir como punto de partida metodológico para investigadores que quieran verificar hipótesis sobre IA encarnada, no como un recurso de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de notas, no modelo) |
| Parametros totales | 24.832 (archivo safetensors residual, sin uso funcional) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (notas en ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (residual, sin checkpoint utilizable) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido es un documento de investigación exploratoria que separa explícitamente planes e hipótesis de resultados completados. La model card indica que cualquier resultado futuro deberá incluir versiones de datasets, comandos, semillas, hardware y logs crudos para garantizar reproducibilidad. No se mencionan datos de entrenamiento, tokens procesados ni técnicas como RLHF o DPO.

## Capacidades

- No ofrece capacidades de generacion de texto, razonamiento, codigo, vision ni ninguna funcion de inferencia.
- Su unica funcion es documentar el alcance de una pregunta de investigacion sobre IA encarnada, incluyendo confusores probables y contexto de evaluacion.
- Propone benchmarks publicos apropiados para tareas de IA encarnada, aunque no los ejecuta.
- Incluye comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas para orientar futuros estudios.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Diseno de estudios sobre IA encarnada: el documento sirve como plantilla para delimitar una pregunta de investigacion, identificar confusores y definir comparaciones con lineas base emparejadas antes de lanzar un experimento.
- Seleccion de benchmarks: las referencias a benchmarks publicos citados en la nota ayudan a elegir tareas de evaluacion adecuadas para agentes encarnados.
- Verificacion de reproducibilidad: las secciones sobre comprobaciones de reproducibilidad y modos de fallo orientan a investigadores que quieran replicar o extender el estudio.
- Revision de literatura: las referencias tematicas incluidas facilitan un punto de partida para revisar el estado del arte en IA encarnada.
- Planificacion de experimentos: la separacion entre planes/hipotesis y resultados permite usar el documento como guia para estructurar un proyecto de investigacion.
- Formacion academica: puede emplearse como material de discusion en seminarios sobre metodologia de investigacion en robotica y aprendizaje automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se reivindican mejoras de benchmarks ni se han completado ablaciones.

## Requisitos de hardware

- No requiere hardware de inferencia, ya que no es un modelo ejecutable.
- El archivo safetensors residual (24.832 parametros) es trivial en tamano y no implica carga computacional.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI.
- No hay latencia ni throughput que medir.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo de IA, sino un conjunto de notas de investigacion. No hay alternativas de la misma categoria en el sentido de modelos de lenguaje o agentes entrenados.

## Limitaciones y advertencias

- No contiene un modelo entrenado ni codigo ejecutable; cualquier uso como recurso de inferencia es invalido.
- Las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales.
- El repositorio es exploratorio y no proporciona evidencia de que el estudio propuesto se haya llevado a cabo.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero los terminos de los datasets externos citados deben revisarse por separado.
- El archivo safetensors presente no tiene utilidad funcional y podria confundir a quien espere un checkpoint.
- No hay garantias de exactitud en las referencias o benchmarks citados, ya que no se han verificado experimentalmente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/thomashoffmann/review-embodied-ai
- Articulo relacionado (no afiliado al repositorio): "Embodied AI in Machine Learning -- is it Really Embodied?" - https://arxiv.org/abs/2505.10705
- Encuesta sobre IA encarnada: "Embodied AI: A Survey on the Evolution from Perceptive to Behavioral" - https://onlinelibrary.wiley.com/doi/full/10.1002/smb2.70003
