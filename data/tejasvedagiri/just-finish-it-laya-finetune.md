# tejasvedagiri/Just-Finish-It-Laya-Finetune

## Resumen

Just-Finish-It-Laya-Finetune es un ajuste fino del checkpoint `english` del modelo Laya (`convaiinnovations/laya`) publicado por el usuario tejasvedagiri. No es un modelo generativo de propósito general: es un clasificador especializado de un solo paso que actúa como "juez" de los nodos de plan que generan los roles Architect, Lead y Task dentro del sistema de planificación Just-Finish-It (JFI). Para cada nodo recibe una pregunta fija y devuelve una de tres etiquetas: GOOD (una única tarea pequeña y clara, lista para el siguiente paso), BREAKDOWN (varias tareas, debe enviarse a la capa siguiente) o REDO (tarea operativa o demasiado vaga para construirla).

El modelo tiene 421.293.830 parámetros (~421 M) y un repositorio de 0,8 GB en formato safetensors, lo que lo sitúa en la gama de modelos pequeños desplegables en CPU. De hecho, la configuración de referencia del propio autor (`LAYA_DEVICE=cpu`) asume inferencia en CPU, algo coherente con un uso como filtro de bajo coste dentro de un pipeline de agentes más que como modelo de chat. Se distribuye bajo licencia Apache-2.0.

Su relevancia es acotada pero concreta: demuestra el patrón de usar un modelo pequeño y muy especializado como componente de control (un "gatekeeper" con umbral de confianza) dentro de una arquitectura multiagente, en lugar de delegar la validación de planes a un LLM grande. La model card es explícita sobre el acoplamiento: el modelo se entrenó con las cadenas de pregunta exactas de `JFI.planner.judge.questions_for`, de modo que modificar esos textos invalida el ajuste y obliga a reentrenar.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: convaiinnovations/laya) |
| Parámetros totales | 421.293.830 (~421 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos publicados en safetensors sin variantes GGUF/INT8/INT4 declaradas |
| Idiomas soportados | inglés (checkpoint `english` del modelo base, según la model card); no disponible el resto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Librería de carga | `laya` |
| Tamaño del repositorio | 0,8 GB |
| Tarea | clasificación de nodos de plan en 3 clases (GOOD, BREAKDOWN, REDO) |
| Modelo base | convaiinnovations/laya |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Laya ni sobre sus datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO). Lo único verificable en la información proporcionada es el número de parámetros derivado de los pesos safetensors (421.293.830) y que el ajuste se hizo sobre el checkpoint `english` de Laya.

El ajuste fino es de tipo supervisado y extremadamente especializado: el autor indica que se entrenó sobre las preguntas exactas definidas en `JFI.planner.judge.questions_for`, y que cualquier cambio en esas cadenas obliga a reentrenar. La salida es una clasificación en tres clases (GOOD, BREAKDOWN, REDO) acompañada de una puntuación de confianza, ya que la evaluación reportada aplica un "confidence gate" con umbral configurable (`LAYA_MIN_CONFIDENCE`, 0.7 en el ejemplo del autor). No se detalla el volumen del conjunto de entrenamiento, el número de épocas ni hiperparámetros.

## Capacidades

- Clasificación de nodos de plan en tres categorías cerradas: GOOD, BREAKDOWN y REDO.
- Discriminación de tareas operativas (por ejemplo, comandos para ejecutar la aplicación) frente a tareas construibles, marcando las primeras como REDO.
- Detección de vaguedad: nodos demasiado ambiguos para implementarse se etiquetan como REDO.
- Detección de granularidad excesiva: nodos que agrupan varias tareas se etiquetan como BREAKDOWN.
- Emisión de una puntuación de confianza que permite descartar decisiones poco fiables mediante un umbral.
- Integración como componente del sistema Just-Finish-It mediante variables de entorno (`JUDGE=laya`, `LAYA_MODEL_PATH`, `LAYA_MIN_CONFIDENCE`, `LAYA_DEVICE`).
- Inferencia en CPU, según la configuración de referencia del autor.

No se han documentado capacidades de generación de texto libre, razonamiento abierto, código, matemáticas, visión, tool calling, function calling, uso de agentes por parte del propio modelo ni multimodalidad.

## Casos de uso

- Validación de planes en pipelines de agentes: el modelo se inserta como juez entre la fase de planificación (Architect/Lead/Task) y la de ejecución, etiquetando cada nodo antes de que se intente construir. Es adecuado porque su salida es una clase discreta y su coste de inferencia es mínimo al tener 421 M de parámetros y poder correr en CPU.
- Enrutado por granularidad: cuando el modelo devuelve BREAKDOWN, el orquestador envía el nodo a la capa de descomposición siguiente en lugar de intentar ejecutarlo; esto evita que nodos compuestos lleguen al ejecutor.
- Puerta de calidad con umbral de confianza: usando `LAYA_MIN_CONFIDENCE=0.7`, las predicciones por debajo del umbral se pueden escalar a un modelo mayor o a revisión humana, reduciendo el coste frente a validar todo con un LLM grande.
- Detección de pasos no construibles: nodos que son comandos de ejecución o instrucciones operativas se marcan como REDO y se excluyen del plan de construcción.
- Reducción de bucles improductivos en sistemas multiagente: filtrar planes vagos antes de gastar tokens de un modelo generativo en intentar implementarlos.
- Servicio de bajo coste en entornos sin GPU: al estar pensado para `LAYA_DEVICE=cpu` y ocupar 0,8 GB de repositorio, puede desplegarse en máquinas modestas o en el mismo host que el orquestador sin reservar VRAM.
- Evaluación comparativa de prompts de planificación: el juez permite medir de forma automática si un cambio en el prompt del Architect mejora la proporción de nodos GOOD frente a BREAKDOWN o REDO.
- Prototipado de "LLM-as-a-judge" especializado: sirve como caso de estudio reproducible de destilación de un criterio de evaluación en un clasificador pequeño de tres clases.

## Benchmarks y rendimiento

Los únicos datos publicados son las precisiones del propio juez con la puerta de confianza activada, sobre tres conjuntos del proyecto:

| Conjunto de datos | Precision (juez, con puerta de confianza) |
|---|---|
| real_test.jsonl | 80 % |
| stress.jsonl | 85 % |
| test_para.jsonl | 98 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, lo cual es esperable dado que se trata de un clasificador de dominio específico y no de un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en FP16/BF16 solo para pesos (421 M de parámetros), más el coste de activaciones y caché KV. En la práctica, por debajo de 2 GB en FP16.
- Cuantización a INT8: en torno a 0,42 GB de pesos. A INT4: en torno a 0,21 GB. No se publican variantes cuantizadas oficiales, por lo que estos valores son estimaciones a partir del número de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Modelos como GTX 1650, RTX 3050 o integradas recientes son más que suficientes.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la propia model card de referencia usa `LAYA_DEVICE=cpu`.
- Opciones de despliegue: la librería declarada es `laya`, asociada al repositorio del modelo base. No hay información disponible sobre soporte en vLLM, llama.cpp, Ollama, TGI o formatos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables para este modelo, y su naturaleza (clasificador cerrado de tres clases para un pipeline concreto) no es directamente equiparable a la de un modelo de chat. La tabla siguiente es orientativa y compara únicamente características estructurales conocidas; la columna de rendimiento queda como no disponible en todos los casos.

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| Just-Finish-It-Laya-Finetune | 421 M | no disponible | Apache-2.0 | Clasificador especializado (3 clases) |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens | Apache-2.0 | LLM instruido de propósito general |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache-2.0 | LLM instruido de propósito general |

La comparación con LLM pequeños de propósito general solo es válida en coste y despliegue (ambos caben en CPU), no en tarea: un LLM de 0,5 B puede imitar el comportamiento de juez mediante prompt, pero con menor determinismo y mayor latencia que un clasificador ajustado. No se han publicado comparativas de precisión entre este modelo y alternativas.

## Limitaciones y advertencias

- Acoplamiento fuerte al prompt: el modelo se entrenó con las cadenas exactas de `JFI.planner.judge.questions_for`. Cambiar esos textos degrada el rendimiento y obliga a reentrenar, según advierte el propio autor.
- Dominio cerrado: el espacio de salida son tres etiquetas (GOOD, BREAKDOWN, REDO). No genera texto ni razonamiento abierto, por lo que no sirve para otras tareas sin reentrenamiento.
- Precisión limitada: 80 % en `real_test.jsonl` implica que aproximadamente uno de cada cinco nodos reales recibe una etiqueta incorrecta. En un pipeline de producción esto puede traducirse en descomposiciones innecesarias o en intentos de construir nodos mal formados.
- Dependencia del umbral de confianza: los porcentajes reportados (80 %, 85 %, 98 %) corresponden a la evaluación con puerta de confianza, no al modelo sin filtrar. El comportamiento sin umbral no se documenta.
- Riesgo de sobreajuste al conjunto de evaluación: `test_para.jsonl` alcanza el 98 %, una diferencia de 18 puntos respecto a `real_test.jsonl`, lo que sugiere distribución distinta entre conjuntos o posible contaminación. No se detalla cómo se construyó cada uno.
- Idiomas: el ajuste parte del checkpoint `english`, por lo que no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo, toxicidad o equidad.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `convaiinnovations/laya` y las condiciones del repositorio Just-Finish-It antes de integrarlo en un producto.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y se publicó y actualizó el mismo día. No hay señales de uso en producción ni de mantenimiento posterior.
- Sin cuantizaciones oficiales: no se ofrecen variantes GGUF, INT8 ni INT4, lo que limita las opciones de despliegue a la librería `laya` o a una conversión manual no documentada.
- Riesgo de alucinación: al ser un clasificador de etiquetas cerradas, el riesgo típico de alucinación generativa no aplica; el riesgo real es de clasificación errónea y de confianza mal calibrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tejasvedagiri/Just-Finish-It-Laya-Finetune
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Repositorio de Just-Finish-It: https://github.com/Tejasvedagiri/Just-Finish-It
- Resultados de la búsqueda web: ninguno de los devueltos guarda relación con el modelo (corresponden a una profesional sanitaria y a direcciones de vías públicas en Francia y Luxemburgo), por lo que no se incluyen como fuentes.
