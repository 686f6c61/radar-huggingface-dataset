# ZiedBz/marketing-lora-c

## Resumen

El modelo `ZiedBz/marketing-lora-c` es una adaptación de bajo rango (LoRA) entrenada sobre un modelo base no especificado, orientada a la generación de estrategias de marketing. Forma parte de un experimento controlado del autor ZiedBz para comparar tres métodos de generación de datos sintéticos (combinatorio, reformulación y self-instruct) a volumen igual, con el objetivo de determinar qué método produce el mejor modelo final. El modelo C, correspondiente al método self-instruct, se entrenó con 512 ejemplos reales del dataset `RafaM97/marketing_social_media` más 900 ejemplos sintéticos generados por ese método, aunque tras el filtrado se usaron 781 ejemplos totales (512 reales + 269 sintéticos). El repositorio tiene un tamaño de 0,1 GB y los pesos están en formato safetensors.

La relevancia de este modelo radica en que documenta un hallazgo importante para la comunidad: el dataset con mayor diversidad de instrucciones (método C) produce un modelo peor que el método B (reformulación), que tenía más diversidad de respuestas. Esto sugiere que la calidad de las respuestas sintéticas influye más en el rendimiento final que la variedad de contextos. El modelo C obtuvo un score estructural de 0,446, apenas 0,4 puntos por encima del control, lo que indica que añadir datos sintéticos no siempre mejora el resultado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base no especificado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente frances o ingles, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptacion LoRA, lo que implica que solo se entrenan matrices de bajo rango sobre los pesos congelados de un modelo base preentrenado. El modelo base no se especifica en la informacion disponible, aunque por el contexto de la tarea (generacion de texto en frances) podria tratarse de un modelo tipo Llama, Mistral o similar. El entrenamiento se realizo con 781 ejemplos (512 reales + 269 sinteticos generados por self-instruct) durante 2 epocas, segun se menciona en la model card. No se detallan los hiperparametros exactos ni el proceso de ajuste fino.

El experimento completo compara cuatro variantes: un control entrenado solo con datos reales, y tres modelos (A, B, C) que anaden 900 ejemplos sinteticos cada uno, generados por metodos combinatorio, reformulacion y self-instruct respectivamente. El modelo C se genero mediante self-instruct, que consiste en usar pocos ejemplos reales como plantilla para que un LLM genere nuevas instrucciones y respuestas, seguido de un filtrado de calidad. Los datos sinteticos se publicaron en el dataset `ZiedBz/marketing-synth-data` y los conjuntos de entrenamiento en `ZiedBz/marketing-synth-training`.

## Capacidades

- Generacion de estrategias de marketing estructuradas: el modelo produce respuestas que incluyen presupuesto cifrado, canales de marketing concretos y mecanismos de seguimiento, segun los criterios de evaluacion del benchmark.
- Adaptacion al dominio de marketing: entrenado especificamente para tareas de estrategia en redes sociales y marketing digital, a partir del dataset `marketing_social_media`.
- Capacidad multilingue: no confirmada; la tarea original esta en frances, pero no se indica si el modelo generaliza a otros idiomas.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso.
- No se especifica soporte para vision, audio u otras modalidades.

## Casos de uso

- Generacion de planes de marketing para pequenas empresas: el modelo puede producir una estrategia completa con presupuesto estimado, canales recomendados y metricas de seguimiento, partiendo de una breve descripcion del negocio y el publico objetivo.
- Asistencia a equipos de marketing en la creacion de campanas: un equipo puede usar el modelo para obtener borradores iniciales de estrategias que luego refinan manualmente, ahorrando tiempo en la fase de ideacion.
- Automatizacion de contenido de marketing en redes sociales: el modelo puede generar respuestas a prompts de tipo "disenia una campaña para lanzar un producto X en el segmento Y", facilitando la produccion de contenido variado.
- Formacion de personal de marketing: el modelo puede servir como herramienta de entrenamiento para que nuevos empleados practiquen la elaboracion de estrategias, comparando sus propuestas con las generadas.
- Investigacion sobre datos sinteticos: este modelo especifico es util como caso de estudio para investigadores que analizan como el metodo de generacion de datos afecta el rendimiento final, aunque no esta pensado para uso en produccion.
- Generacion de ideas para briefings de agencias: una agencia puede usar el modelo para generar multiples enfoques de campana para un cliente, explorando diferentes combinaciones de sector, presupuesto y audiencia.

## Benchmarks y rendimiento

El modelo fue evaluado dentro del experimento controlado descrito en la model card, usando un conjunto de test congelado de ejemplos reales. Las metricas son estructurales (presencia de presupuesto, canales, mecanismo de seguimiento, reutilizacion de restricciones) y se comparan con el modelo control y los modelos A y B. Los resultados para el modelo C son los siguientes:

| Metrica | Control | A (combinatorio) | B (reformulacion) | C (self-instruct) |
|---|---|---|---|---|
| Score estructural | 0,442 | 0,450 | 0,509 | 0,446 |
| Gain vs control | — | +0,8 pts | +6,7 pts | +0,4 pts |
| Presupuesto cifrado | 36 % | 35 % | 42 % | 33 % |
| Mecanismo de seguimiento | 10 % | 15 % | 27 % | 15 % |
| Reutilizacion de restricciones | 72,8 % | 73,1 % | 76,5 % | 73,4 % |
| Longitud media de respuesta | 331 | 341 | 404 | 347 |

El modelo C muestra una mejora marginal frente al control, y es superado claramente por el modelo B. La model card advierte que un solo run por variante no permite distinguir diferencias de menos de varios puntos del ruido de entrenamiento, por lo que solo la diferencia de B es probablemente significativa.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que indica un LoRA de dimensiones reducidas. No se especifican los parametros totales, pero un LoRA tipico de este tamaño puede tener entre 10 y 100 millones de parametros, dependiendo del rango y del modelo base.
- VRAM estimada: al ser un LoRA, la inferencia requiere cargar el modelo base completo (por ejemplo, 7B o 13B parametros) mas el adaptador. Con cuantizacion 4-bit, un modelo 7B cabe en una GPU consumer de 8 GB (ej. RTX 3060, RTX 4060). Para un modelo 13B, se recomienda al menos 16 GB (RTX 4090, A100 40 GB).
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM si se usa un modelo base de 7B cuantizado; para modelos mas grandes, se necesitan GPUs de 16 GB o mas.
- Opciones de despliegue: al ser un LoRA, se puede integrar con librerias como PEFT (Hugging Face), vLLM (si el modelo base es compatible) o llama.cpp (convirtiendo el LoRA a GGUF). Tambien se puede usar con Ollama si se exporta correctamente.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos LoRA de marketing comparables en el repositorio o en la documentacion. El modelo forma parte de un experimento interno y no se ha publicado una comparacion con alternativas comerciales o academicas. Por tanto, no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- El modelo se entrenó con datos sinteticos generados por self-instruct, lo que puede introducir sesgos del modelo generador y errores de coherencia. La model card no detalla el modelo generador utilizado.
- El rendimiento en tareas reales no esta validado fuera del benchmark controlado; el score estructural es un proxy de completitud, no de calidad estrategica real.
- Un solo run de entrenamiento: las diferencias de menos de 5 puntos pueden deberse al ruido de entrenamiento. Solo la mejora de B es probablemente significativa.
- La licencia no esta especificada, por lo que el uso comercial es incierto. Se debe contactar al autor antes de utilizarlo en produccion.
- No se conocen los idiomas soportados; aunque la tarea original es en frances, no hay garantia de que el modelo funcione bien en otros idiomas.
- El contexto maximo no esta documentado, lo que limita su uso en tareas que requieran entradas largas.
- El modelo no incluye capacidades de tool calling ni agentes, por lo que no es adecuado para pipelines complejos de automatizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZiedBz/marketing-lora-c
- Dataset original: https://huggingface.co/datasets/RafaM97/marketing_social_media
- Datasets sinteticos: https://huggingface.co/datasets/ZiedBz/marketing-synth-data
- Conjuntos de entrenamiento: https://huggingface.co/datasets/ZiedBz/marketing-synth-training
- Modelo control (referenciado en la model card): https://huggingface.co/ZiedBz/marketing-lora-controle
