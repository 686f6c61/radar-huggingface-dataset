# tianxinwei/JevAny-Muse-Glimmer-30B-LoRA

## Resumen

JevAny-Muse-Glimmer-30B-LoRA es un adaptador LoRA publicado por el usuario tianxinwei sobre el modelo base meta-models/Muse-Glimmer-30B. No se trata de un modelo de lenguaje generativo al uso, sino de un checkpoint de un modelo de decisión con lectura de tipo pointer (pointer readout): en lugar de generar autorregresivamente una respuesta token a token, puntúa representaciones de opciones mediante una pequeña cabeza aprendida. Esto lo hace adecuado para tareas de selección entre alternativas, no para generación libre de texto.

El adaptador forma parte del ecosistema JevAny, un proyecto cuyo repositorio de código está en GitHub (weitianxin/JevAny) y que requiere una revisión concreta del código para su funcionamiento. El repositorio de Hugging Face contiene únicamente los pesos del adaptador LoRA y los metadatos del readout de JevAny, no los pesos del modelo base, cuyo acceso y licencia dependen de meta-models/Muse-Glimmer-30B.

El modelo base, Muse-Glimmer-30B, es un modelo de 30.000 millones de parámetros desarrollado por Meta Superintelligence Labs, publicado bajo licencia Apache 2.0 y optimizado para flujos de agentes locales con uso de herramientas, tareas largas y recuperación ante fallos. El adaptador JevAny añade una capa de decisión especializada sobre esa base, con resultados reportados en los protocolos Transfer-v9 y JevBench que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base transformer; el adaptador usa lectura de tipo pointer (decision-model con cabeza de puntuacion de opciones) |
| Parametros totales | 30B en el modelo base; parametros del adaptador LoRA no disponibles |
| Parametros activos | no aplicable / no disponible |
| Longitud de contexto | no disponible para el adaptador; depende del modelo base Muse-Glimmer-30B (dato no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se cita cuantizado por debajo de 20 GB para GPU de 24 GB segun fuentes web |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio del adaptador; el modelo base Muse-Glimmer-30B es Apache 2.0, y sus terminos de acceso aplican |
| Formato de pesos | safetensors (adaptador LoRA + metadatos de readout de JevAny) |

## Arquitectura y entrenamiento

El adaptador se distribuye como pesos LoRA combinados con metadatos del readout de JevAny, sobre el modelo base meta-models/Muse-Glimmer-30B. La innovación técnica principal es el uso de una lectura de tipo pointer: en lugar de entrenar con entropía cruzada sobre todo el vocabulario (como harían los modelos de token directo), el modelo puntúa representaciones de opciones con una cabeza pequeña aprendida. Según la model card, este diseño permite soportar más de 255 opciones (sujeto a los límites de contexto) y, aunque los modelos de token directo son más lentos de entrenar, la velocidad de inferencia se espera que sea similar, porque ambos hacen un único prefill del backbone y no generan la respuesta de forma autorregresiva.

Los datos de entrenamiento declarados ascienden a 1.772.725 registros de texto y 2.180.242 decisiones etiquetadas. Solo se publican el tamaño agregado y categorías amplias: preferencia, decisiones de agente/herramienta, razonamiento, clasificación y seguridad. La mezcla detallada y la composición a nivel de fuente no forman parte de esta release. No se especifican en la información proporcionada detalles sobre el número de tokens, el uso de RLHF/DPO ni la composición exacta del dataset.

## Capacidades

- Modelo de decisión con lectura de tipo pointer: selecciona entre opciones puntuando representaciones, en lugar de generar texto libre.
- Soporte de más de 255 opciones de elección, sujeto a los límites de contexto.
- Tareas de preferencia (evaluación y elección entre alternativas).
- Decisiones de agente y uso de herramientas (agent/tool decisions).
- Razonamiento y clasificación.
- Categoría de seguridad entre los datos de entrenamiento declarados.
- Inferencia mediante un único prefill del backbone, sin generación autorregresiva de la respuesta.
- Capacidades del modelo base (uso de herramientas, tareas largas, recuperación ante fallos y razonamiento multimodal según las fuentes de Muse-Glimmer-30B); no confirmadas específicamente para este adaptador.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación automática de respuestas (LLM-as-a-judge): el modelo puede seleccionar la mejor opción entre múltiples candidatos puntuando representaciones, lo que encaja con su lectura pointer y su soporte de más de 255 opciones.
- Enrutamiento de agentes en pipelines: elegir qué herramienta o acción tomar en cada paso del bucle de un agente, apoyándose en su categoría de entrenamiento de decisiones de agente/herramienta.
- Sistemas de recomendación con conjuntos grandes de candidatos: al puntuar opciones en un solo prefill, permite clasificar entre cientos de alternativas sin generar texto, reduciendo coste de inferencia.
- Clasificación de contenido sensible: aprovechar la categoría de seguridad del entrenamiento para filtrar o etiquetar contenido en flujos de moderación.
- Tareas de razonamiento de opción múltiple: seleccionar la respuesta correcta en bancos de preguntas con una sola pasada sobre el backbone.
- Modelos de preferencia y alineación: usar las decisiones de preferencia aprendidas para comparar pares o conjuntos de respuestas en pipelines de anotación.
- Integración en el stack JevAny: desplegar mediante el comando `jevany serve` con precisión bf16 en GPU para servir decisiones en producción.

## Benchmarks y rendimiento

Resultados reportados en la model card (accuracy, no el composite sellado del leaderboard JevBench; todos con los mismos protocolos congelados Transfer-v9 y JevBench públicos):

| Benchmark | Resultado |
|---|---|
| Transfer-v9 (1.046) | 83,46 % |
| JevBench Easy (48) | 100,00 % |
| JevBench Original (72) | 97,22 % |
| JevBench Hard (111) | 75,68 % |
| JevBench total (231) | 87,45 % |

No se han publicado otros resultados comparativos con modelos similares en la información disponible.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,3 GB (solo pesos LoRA y metadatos; no incluye el modelo base).
- Para la inferencia completa hay que cargar el modelo base Muse-Glimmer-30B de 30B parámetros, además del adaptador.
- VRAM estimada para el adaptador solo: inferior a 1 GB; para el conjunto base + adaptador, no disponible en la información proporcionada.
- Según fuentes web sobre Muse-Glimmer-30B, el modelo base cuantizado cabe por debajo de 20 GB y puede ejecutarse en una GPU de 24 GB.
- GPU recomendadas: no disponibles específicamente para este adaptador; para el base se citan entornos de una sola GPU de consumo (24 GB) y GPU de datacenter en general (A100, H100) como opciones habituales, aunque no se confirman en la información proporcionada.
- Cabe en GPU de consumo: sí para el modelo base cuantizado según las fuentes web (por ejemplo, tarjetas de 24 GB); no confirmado para el adaptador.
- Opciones de despliegue: JevAny mediante `pip install -e '.[serve,multimodal]'` y `jevany serve --checkpoint tianxinwei/JevAny-Muse-Glimmer-30B-LoRA --device cuda --dtype bf16`; requiere el código de JevAny en la revisión de release enlazada desde el repositorio del proyecto.
- Latencia y throughput: no disponibles. La model card solo indica que la velocidad de inferencia se espera similar a los modelos de token directo, al usar un único prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevAny-Muse-Glimmer-30B-LoRA | 30B (base) + LoRA | no disponible | Transfer-v9 83,46 %; JevBench total 87,45 % | no disponible (base Apache 2.0) | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Muse-Glimmer-30B (modelo base) | 30B | no disponible | no disponible | Apache 2.0 | Hugging Face / Meta |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables directos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente pesos de adaptador LoRA y metadatos de readout; no incluye los pesos del modelo base, que deben obtenerse por separado.
- El adaptador requiere el código de JevAny en la revisión de release concreta enlazada desde el repositorio del proyecto; sin esa versión puede no funcionar.
- Solo se publican el tamaño agregado y categorías amplias de los datos de entrenamiento; la mezcla detallada y la composición por fuente no están disponibles.
- Los resultados reportados son accuracy bajo protocolos Transfer-v9 y JevBench, no el composite sellado del leaderboard JevBench, por lo que no son directamente comparables con ese ranking.
- No se especifican licencia ni idiomas soportados en el repositorio del adaptador; aplican la licencia y los términos de acceso del modelo base.
- Es un modelo de decisión (pointer readout), no un generador de texto libre; no debe usarse esperando generación autorregresiva.
- El soporte de más de 255 opciones está sujeto a los límites de contexto, que no se detallan.
- Riesgo de sesgos y alucinación no cuantificado en la información proporcionada; las categorías de preferencia y seguridad del entrenamiento pueden introducir sesgos no declarados.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica nula validación por parte de la comunidad.
- Uso comercial: no confirmado para el adaptador; consultar la licencia del modelo base (Apache 2.0) y los términos de JevAny.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/tianxinwei/JevAny-Muse-Glimmer-30B-LoRA
- Modelo base en Hugging Face: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio de código JevAny: https://github.com/weitianxin/JevAny
- Pagina del modelo Muse Glimmer en Meta: https://dev.meta.ai/models/muse-glimmer
- Blog de Meta sobre Muse Glimmer: https://dev.meta.ai/resources/blog/build-with-muse-glimmer
- Guia de Muse Glimmer (theaibench): https://theaibench.ai/models/muse-glimmer/
- Sitio de Muse Glimmer (no oficial): https://museglimmer.site/
