# yasserrmd/vega-arabic-jais3-0.9b

## Resumen

vega-arabic-jais3-0.9b es un modelo de decisión tipado para árabe desarrollado por el usuario yasserrmd sobre el lector congelado Jais-3-0.9B de Inception. No es un modelo generativo: responde tres preguntas cerradas sobre un tuit en árabe (sentimiento, sarcasmo y dialecto) en una sola lectura, devolviendo cada respuesta con una probabilidad calibrada. Se distribuye como un único checkpoint fusionado bajo licencia Apache 2.0, con los pesos del lector descargados aparte desde el repositorio base.

La arquitectura subyacente es el transformer K2Horizon de Jais-3, de 0,9 mil millones de parámetros, sobre el que se ha entrenado un LoRA gated de rango 32 que se ha fusionado en el motor vega-U. El resultado es un clasificador de tres tareas con etiquetas tipadas (`choice` para sentimiento y dialecto, `boolean` para sarcasmo) y calibración térmica más umbrales conformales ajustados sobre una partición de validación.

Su relevancia radica en el enfoque: en lugar de generar texto libre, el modelo emite decisiones estructuradas y calibradas, lo que lo hace apto para pipelines de moderación y análisis de opinión donde importa la fiabilidad probabilística. Sobre el split de test oficial de ArSarcasm-v2 (2.988 tuits) alcanza un macro-F1 de 0,634 en sentimiento, 0,714 en sarcasmo y 0,397 en dialecto, con errores de calibración esperada por debajo del 6 % en las tres tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only K2Horizon (Jais-3), con LoRA gated de rango 32 fusionado en el motor vega-U |
| Parametros totales | 0,9 mil millones (lector Jais-3-0.9B) + 835.937 parametros entrenables del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`engine.safetensors`) + `vega_config.json`; pesos del lector descargados desde inception42/Jais-3-0.9B |

## Arquitectura y entrenamiento

El modelo combina un lector congelado Jais-3-0.9B, cuya arquitectura K2Horizon no está integrada aún en Transformers y requiere `trust_remote_code`, con el motor de decisión vega-U. Sobre siete proyecciones del motor se entrena un LoRA gated de rango 32 más una red de compuerta, con 835.937 parámetros entrenables en total. Tras el entrenamiento, el adaptador se fusiona como W + (alpha/rank)·B·A; la compuerta entrenada quedó completamente abierta en esta tarea (media 1,000), por lo que la fusión es exacta para estas preguntas. El lector permanece congelado en todo momento.

El adaptador se ajustó sobre 6.000 líneas árabes no etiquetadas: 5.000 tuits de entrenamiento y 1.000 enunciados MASSIVE ar-SA. Los datos supervisados provienen de ArSarcasm-v2 (15.548 tuits, licencia MIT), con un preprocesado que elimina URLs, sustituye menciones por `@user`, convierte guiones bajos de hashtags en espacios, limita la elongación de letras a 3 caracteres y elimina tatweel, conservando emojis. Se descartaron 241 duplicados de entrenamiento con etiquetas en conflicto y 7 tuits presentes también en test. Los 43 tuits magrebíes no tienen etiqueta de dialecto pero sí entrenan sentimiento y sarcasmo; a 47 tuits etiquetados como MSA con dos o más marcadores coloquiales del Golfo, egipcio o levantino se les retiró la etiqueta de dialecto sin reetiquetar. Se empleó un 10 % estratificado para validación (solo calibración, nunca entrenamiento) y se añadieron negativos de compuerta con enunciados MASSIVE ar-SA y titulares ingleses de ag_news con preguntas no relacionadas.

El entrenamiento usó entropía cruzada balanceada por clase (frecuencia inversa de raíz cuadrada), 6 épocas, AdamW con schedule one-cycle, learning rate 3e-4 y una única A100. La calibración térmica y los umbrales conformales se ajustaron sobre la partición de validación.

## Capacidades

- Clasificación de sentimiento en árabe con tres clases: positivo, negativo y neutro.
- Detección de sarcasmo como probabilidad booleana calibrada.
- Identificación de dialecto entre cuatro clases: MSA, egipcio, golfo y levantino.
- Respuesta tipada: cada salida incluye la elección y una probabilidad calibrada.
- Procesamiento de una sola lectura para las tres preguntas simultáneamente.
- Manejo de texto de redes sociales con ruido: URLs, menciones, hashtags, elongación y emojis.
- No genera texto libre; está especializado exclusivamente en decisiones estructuradas.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible (fuera del alcance del modelo).

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo clasifica sentimiento y sarcasmo de tuits en árabe con probabilidades calibradas, lo que permite fijar umbrales de revisión humana según el coste del error en cada clase.
- Análisis de opinión en tiempo real: integrado en un pipeline de ingesta de tuits, etiqueta sentimiento positivo, negativo o neutro con un ECE del 3,44 % en test, lo que facilita agregaciones fiables sin revisión manual exhaustiva.
- Detección de sarcasmo en atención al cliente: al identificar respuestas sarcásticas con macro-F1 de 0,714, permite enrutar conversaciones potencialmente conflictivas a agentes humanos.
- Segmentación dialectal de corpus: clasifica tuits en MSA, egipcio, golfo o levantino para enrutar contenidos a equipos o modelos específicos por variedad; útil pese a la limitación de macro-F1 de 0,397 en dialecto.
- Investigación sociolingüística: permite etiquetar grandes volúmenes de tuits árabes con las tres dimensiones de forma automática y con métricas de calibración publicadas, lo que facilita estudios reproducibles sobre variación dialectal y tono.
- Filtrado previo en datasets de entrenamiento: al devolver probabilidades calibradas, permite seleccionar subconjuntos de alta confianza para entrenar otros modelos o para anotación asistida.
- Enrutamiento en sistemas de análisis de mercado: clasifica la opinión y el tono de menciones a marcas en árabe para alimentar paneles de reputación con umbrales de confianza explícitos.

## Benchmarks y rendimiento

Split de test oficial de ArSarcasm-v2 (2.988 tuits). Base = motor vega-U zero-shot con el mismo lector y preguntas. ECE = error de calibración esperado (menor es mejor).

| Pregunta | n | Base acc | Base macro-F1 | Base ECE % | Fusionado acc | Fusionado macro-F1 | Fusionado ECE % |
|---|---|---|---|---|---|---|---|
| sentiment | 2988 | 0,284 | 0,210 | 24,52 | 0,691 | 0,634 | 3,44 |
| sarcasm | 2988 | 0,718 | 0,465 | 9,39 | 0,753 | 0,714 | 1,86 |
| dialect | 2986 | 0,091 | 0,078 | 21,49 | 0,586 | 0,397 | 5,75 |

Subconjunto de dialecto del Golfo (319 tuits):

| Pregunta | n | Base acc | Base macro-F1 | Base ECE % | Fusionado acc | Fusionado macro-F1 | Fusionado ECE % |
|---|---|---|---|---|---|---|---|
| sentiment | 319 | 0,285 | 0,210 | 23,96 | 0,636 | 0,599 | 4,16 |
| sarcasm | 319 | 0,812 | 0,479 | 17,67 | 0,774 | 0,677 | 5,18 |
| dialect | 319 | 0,000 | 0,000 | 30,27 | 0,455 | 0,156 | 13,36 |

La precisión de dialecto puede caer por debajo de la base en el test completo: el motor base etiqueta casi todo como MSA (77 % del test), lo que puntúa bien en accuracy y mal en macro-F1. El macro-F1 es la métrica más justa para dialecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,1 GB, pero los pesos del lector Jais-3-0.9B se descargan aparte.
- GPU recomendadas: el entrenamiento se realizó en una única A100; para inferencia, un modelo de 0,9 mil millones de parámetros cabe con holgura en GPUs de consumo, aunque no se especifican cifras.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,9 mil millones de parámetros, pero no se confirma en la información disponible.
- Opciones de despliegue: la librería vegaml (con Transformers y `trust_remote_code` activado). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la información disponible. El propio modelo se compara contra su versión base zero-shot (vega-U con lector Jais-3-0.9B), cuyos resultados figuran en la tabla de benchmarks. No se dispone de datos de otros clasificadores de sentimiento o dialecto árabes para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los tuits provienen de fuentes SemEval, ASTD y DAICT; se espera menor precisión en documentos largos, cartas formales o texto que no sea de Twitter.
- El dialecto del Golfo y el levantino representan cada uno en torno al 5 % de los datos de entrenamiento; el árabe emiratí no se separa de otras variedades del Golfo.
- Las etiquetas de dialecto de la fuente son ruidosas: 60 etiquetas MSA del test parecen coloquiales según la regla aplicada, lo que limita la precisión alcanzable. Los resultados de dialecto deben tratarse como cota inferior.
- El sarcasmo es una tarea difícil; en el subconjunto del Golfo la precisión del modelo fusionado (0,774) es inferior a la base (0,812), aunque con mejor macro-F1 y calibración.
- Jais-3 requiere código remoto (`trust_remote_code`) porque su arquitectura K2Horizon no está en Transformers; debe activarse solo tras revisar el código del repositorio base.
- El modelo no genera texto: cualquier uso que requiera generación libre queda fuera de su alcance.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del lector base Jais-3-0.9B y de los datos ArSarcasm-v2 (MIT) en despliegues de producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/vega-arabic-jais3-0.9b
- Modelo base Jais-3-0.9B: https://huggingface.co/inception42/Jais-3-0.9B
- Motor vega-U: https://huggingface.co/nandakishorm/vega-U
- Repositorio vegaml: https://github.com/NandhaKishorM/vegaml
- Dataset ArSarcasm-v2: https://github.com/iabufarha/ArSarcasm-v2
