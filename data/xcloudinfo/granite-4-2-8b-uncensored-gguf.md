# xCloudinfo/Granite-4.2-8B-Uncensored-GGUF

## Resumen

Granite-4.2-8B-Uncensored-GGUF es una variante «abliterated» (con reducción de rechazos) del modelo denso ibm-granite/granite-4.2-8b, publicada por el usuario xCloudinfo (云碩). El autor ha aplicado la herramienta Heretic para eliminar la conducta de rechazo reflexivo del modelo base, manteniendo la arquitectura y los pesos originales en lo esencial. Con 8.791.592.960 parámetros (unos 8,79 mil millones), se trata de un transformer denso, no de una mezcla de expertos, distribuido exclusivamente en formato GGUF.

El interés de la ficha reside en dos aspectos. Primero, el propio autor documenta con inusual franqueza tanto la metodología (búsqueda automática de 200 iteraciones que minimiza simultáneamente la tasa de rechazo y la divergencia KL respecto al modelo original) como las cifras medidas: una tasa de rechazo de 99/100 en el modelo base frente a 0/10 (safetensors, decodificación greedy) y 1/10 (GGUF Q4_K_M con muestreo por defecto) tras la intervención. Segundo, el modelo se ofrece en seis niveles de cuantización, lo que lo hace desplegable en hardware de consumo.

La relevancia es práctica: se trata de un modelo de 8B que cabe en una GPU de gama media y que ha sido modificado para reducir la evasión de respuestas. Conviene subrayar que el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha y que no se han publicado resultados de benchmarks estándar, por lo que su calidad solo está respaldada por las mediciones internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), con chat template Jinja y opción `enable_thinking` |
| Parametros totales | 8.791.592.960 (~8,79 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (seis niveles) |
| Idiomas soportados | La tabla oficial del modelo base incluye chino; el resto no disponible |
| Licencia | Apache 2.0 (heredada del modelo base ibm-granite/granite-4.2-8b) |
| Formato de pesos | GGUF (llama.cpp); el autor menciona además un modelo combinado en safetensors empleado para la evaluación greedy |

Datos adicionales: tamaño del repositorio 16,6 GB segun HuggingFace; modelo base ibm-granite/granite-4.2-8b; creado y actualizado el 27 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso estándar, tal como el autor indica explícitamente («Granite 為 dense transformer 標準架構»). No se describe ninguna innovación estructural propia: la intervención no modifica el diseño de la red, sino los pesos. Esto implica que el modelo conserva la tokenización, la plantilla de chat y el mecanismo de «modo de pensamiento» del modelo base, del que la documentación de uso deja constancia al mostrar la llamada `llama-server ... --jinja --chat-template-kwargs '{"enable_thinking":false}'`.

El proceso de modificación se realizó con Heretic, una herramienta de «abliteration» que busca automáticamente parámetros de intervención sobre los pesos. Según la model card, se ejecutaron 200 pruebas (trials) con un objetivo doble: minimizar la tasa de rechazo y, al mismo tiempo, limitar la divergencia KL respecto al modelo original para preservar capacidades. El autor señala que el punto de partida era una alineación muy estricta (99/100 rechazos en la sonda mlabonne/harmful_behaviors) pero que, a diferencia de sus variantes sobre modelos Qwen, la convergencia se produjo en una sola ronda.

No se detallan en la información proporcionada ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO adicionales: la modificación es puramente post-hoc sobre los pesos del modelo base. Tampoco se documenta si la intervención se aplicó sobre todas las capas o sobre un subconjunto específico.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo (el repositorio se etiqueta como «conversational»).
- Generación de texto sin rechazos: la intervención elimina la evasión reflexiva ante peticiones que el modelo base rechazaba, incluidas las de contenido sensible o ambiguo.
- Soporte multilingüe parcial: la tabla oficial de idiomas del modelo base incluye chino; el autor advierte de mezcla ocasional entre chino tradicional y simplificado.
- Modo de pensamiento conmutable mediante la plantilla de chat (`enable_thinking` en `chat-template-kwargs`), heredado del modelo base.
- Despliegue local en llama.cpp vía `llama-server` con soporte de plantilla Jinja.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible` en HuggingFace).

No hay información en la documentación disponible sobre soporte de tool calling o function calling, capacidades de agente multi-paso, visión, audio, matemáticas o generación de código específica. Estas capacidades deben considerarse «no disponibles» a efectos de esta ficha, aunque pudieran existir en el modelo base no modificado.

## Casos de uso

- Escritura creativa y narrativa sin restricciones temáticas: el modelo puede abordar ficción con violencia, contenido adulto o temas controvertidos sin las evasiones del modelo base, ejecutándose localmente en formato Q4_K_M sobre una GPU de consumo.
- Red teaming y evaluación de seguridad: sirve como modelo «desalineado» de referencia para generar casos adversarios, medir la eficacia de clasificadores de contenido o estudiar el efecto de la abliteración sobre la conducta del modelo, gracias a que el autor publica tanto la metodología como las cifras de rechazo.
- Asistente conversacional con privacidad estricta: al ser un GGUF desplegable con `llama-server` en hardware propio, permite mantener conversaciones multi-turno sin enviar datos a APIs externas, con las seis cuantizaciones disponibles según el presupuesto de VRAM.
- Análisis y procesamiento de textos sensibles en investigación: clasificación, resumen o extracción de información de documentos con contenido explícito o delicado que otros modelos alineados rechazarían, en contextos académicos o de moderación.
- Generación y traducción de contenido en chino: apropiado para tareas en las que el rechazo idiomático es un problema, aunque requiere una capa de post-proceso que normalice tradicional/simplificado si la aplicación exige una variante concreta.
- Prototipado sin conexión en portátiles y estaciones de trabajo: con IQ2_M o IQ4_XS el modelo cabe en GPUs de 8-12 GB, lo que facilita iterar en local sin depender de infraestructura cloud.
- Estudio comparativo de técnicas de abliteration: al compartir metodología con las variantes Qwen del mismo autor, permite contrastar cómo responden arquitecturas distintas a la misma intervención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas mediciones facilitadas por el autor son las de tasa de rechazo y coherencia, recogidas en la tabla siguiente:

| Medicion | Condiciones | Resultado |
|---|---|---|
| Tasa de rechazo del modelo base | Sonda mlabonne/harmful_behaviors, 100 casos | 99/100 |
| Tasa de rechazo tras abliteration | Safetensors combinado, decodificacion greedy, 10 casos de dano grave held-out | 0/10 |
| Tasa de rechazo tras cuantizacion | GGUF Q4_K_M cargado con llama-server, muestreo por defecto (no greedy) | 1/10 |
| Coherencia en prompts inofensivos | Safetensors combinado, greedy | «aproximadamente normal» (sin cifra) |

El autor no aporta cifras de perplejidad, divergencia KL final ni comparaciones con el modelo base en tareas de capacidad general, por lo que no es posible cuantificar el coste de la intervención sobre el rendimiento.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del numero de parametros y del regimen de bits por peso de cada cuantizacion; no han sido publicadas por el autor.

- VRAM aproximada solo para pesos: IQ2_M ~3,0 GB; IQ4_XS ~4,7 GB; Q4_K_M ~5,3 GB; Q5_K_M ~6,2 GB; Q6_K ~7,2 GB; Q8_0 ~9,3 GB. Hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto (no disponible) y del numero de secuencias concurrentes.
- GPU de gama alta para centros de datos: A100, H100 o L40S permiten cargar cualquier cuantizacion, incluida Q8_0, con contextos largos y lotes grandes.
- GPU de consumo: Q4_K_M entra con holgura en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; Q8_0 requiere 12-16 GB y encaja en RTX 4080/4090 o en una RTX 3060 de 12 GB con contexto reducido. Las variantes IQ4_XS e IQ2_M permiten funcionar en GPUs de 6-8 GB.
- Ejecucion en CPU: al tratarse de un transformer denso de 8B, es viable en llama.cpp sobre CPU con RAM suficiente, aunque con latencia muy superior a la de GPU.
- Opciones de despliegue confirmadas: llama-server (con `--jinja` y `--chat-template-kwargs '{"enable_thinking":false}'`) sobre llama.cpp. Son compatibles de forma habitual con formato GGUF: Ollama, LM Studio y otros frontends basados en llama.cpp. El soporte de vLLM o TGI para este GGUF concreto no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni tiempos de primera token para ninguna de las configuraciones.

## Comparativa con modelos similares

No se dispone de datos tecnicos de los modelos comparables mas alla de lo que indican sus nombres y la model card. La comparacion se limita, por tanto, a lo verificable:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.2-8B-Uncensored (este) | 8,79 mil millones | no disponible | Apache 2.0 | GGUF (6 niveles) + safetensors | Abliteration con Heretic, 200 trials, convergencia en una ronda |
| ibm-granite/granite-4.2-8b (base) | no disponible (mismo orden de magnitud) | no disponible | Apache 2.0 | no disponible | Modelo alineado de referencia; 99/100 rechazos en la sonda del autor |
| Qwen3.5-9B-Uncensored-GGUF (mismo autor) | 9 mil millones (segun nombre) | no disponible | no disponible | GGUF | Misma metodologia Heretic, converge en dos rondas |
| Qwen3.8-27B-Uncensored-GGUF (mismo autor) | 27 mil millones (segun nombre) | no disponible | no disponible | GGUF | Misma metodologia Heretic, converge en dos rondas |

No se dispone de comparativas de rendimiento entre estos modelos: el autor solo publica cifras de rechazo para el modelo de esta ficha.

## Limitaciones y advertencias

- Alucinacion documentada: el propio autor reconoce un error factual en las pruebas de muestreo (etiquetar «heroina» como «LSD») y lo atribuye a una alucinacion del modelo base, no a la intervencion. No hay medicion sistematica del grado de alucinacion.
- Mezcla de chino tradicional y simplificado: la tabla oficial de idiomas del modelo base lista «Chinese» sin distinguir variantes, y el autor observa apariciones ocasionales de simplificado en respuestas presumiblemente tradicionales. Si la aplicacion exige una variante estricta, hay que anadir post-proceso.
- Eliminacion deliberada de la alineacion de seguridad: el modelo reduce los rechazos a 0/10 en casos de dano grave. Esto implica la ausencia de barreras propias frente a peticiones daninas y traslada toda la responsabilidad de filtrado al desarrollador que lo integre.
- Impacto no cuantificado sobre capacidades: aunque el proceso minimiza la divergencia KL, no se publican cifras de perplejidad, MMLU ni ninguna otra metrica de capacidad que permitan estimar el dano colateral. La afirmacion de que la coherencia es «aproximadamente normal» no va acompanada de numeros.
- Sin validacion externa: el repositorio registra 0 descargas y 0 valoraciones, y todas las mediciones proceden del propio autor, sin replicacion independiente.
- Riesgo de sesgos heredados: al ser una modificacion de pesos sobre un modelo base, conserva los sesgos del corpus de entrenamiento original, que no se detalla en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte explicitamente de que la retirada de rechazos no constituye un aval de usos ilegales y que el usuario asume la responsabilidad legal de su utilizacion.
- Contexto desconocido: al no publicarse la longitud de contexto soportada, no es posible planificar aplicaciones que dependan de ventanas largas ni dimensionar la cache KV con precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xCloudinfo/Granite-4.2-8B-Uncensored-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Variante del mismo autor sobre Qwen 27B: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-GGUF
- Variante del mismo autor sobre Qwen 9B: https://huggingface.co/xCloudinfo/Qwen3.5-9B-Uncensored-GGUF
- Sonda de evaluacion citada por el autor: mlabonne/harmful_behaviors

La busqueda web realizada no devolvio enlaces relevantes para este modelo: todos los resultados correspondian a Civitai y a modelos de generacion de imagen, sin relacion con Granite ni con tecnicas de abliteration sobre modelos de lenguaje. No se dispone, por tanto, de papers, blogs o demos adicionales que documenten este modelo.
