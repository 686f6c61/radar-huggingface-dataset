# umitaslan/Qwen3.5-0.8B-SheepBrain-GGUF

## Resumen

Qwen3.5-0.8B-SheepBrain-GGUF es un ajuste fino del modelo base Qwen3.5-0.8B-Base de Alibaba Cloud, publicado por el usuario umitaslan. El modelo no es un asistente conversacional de proposito general: es un artefacto de investigacion entrenado especificamente para tomar decisiones discretas (girar a la izquierda, seguir recto, girar a la derecha) en el contexto de una simulacion de ovejas, y se distribuye en formato GGUF BF16 para su uso con llama.cpp a traves de la extension `decision` para NetLogo.

El ajuste proviene del proyecto turtle-brain-llm (ejecucion 1) y consiste en un LoRA de rango 8 fusionado en los pesos del modelo base. Con 772.845.888 parametros, el modelo ocupa 1,6 GB en BF16. Su interes es acotado pero real: demuestra que un modelo de menos de mil millones de parametros puede superar a una heuristica codiciosa en una tarea de control de agentes dentro de un mundo simulado, y sirve como banco de pruebas reproducible para tecnicas de integracion de LLM en simulaciones basadas en agentes.

La relevancia actual es metodologica, no de producto: el modelo solo funciona con un formato de prompt exacto y no esta pensado para uso general, atencion al cliente ni generacion de codigo. Su valor esta en la evaluacion publicada de esperanza de vida en el mundo de ovejas y en la comparacion GGUF frente a MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, derivada de Qwen3.5-0.8B-Base; no se detalla en la model card) |
| Parametros totales | 772.845.888 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado) |
| Idiomas soportados | no disponibles (el modelo opera sobre texto estructurado en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-0.8B-SheepBrain-BF16.gguf`, 1,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base y se obtiene mediante un ajuste fino con LoRA de rango 8, posteriormente fusionado en los pesos base. No se especifica en la model card la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas), por lo que ese dato queda como no disponible. El entrenamiento se realizo en el marco del proyecto turtle-brain-llm, en un mundo de ovejas implementado en Python, sin lobos y con reglas de crecimiento de hierba distintas de las de Wolf Sheep Predation de NetLogo.

El objetivo de entrenamiento es la seleccion entre tres etiquetas (A, B, C) a partir de un estado textual estructurado que describe energia de la oveja y la hierba mas cercana y su recuento en tres sectores relativos al rumbo (izquierda, frente, derecha). El prompt de entrenamiento tiene un formato fijo y estricto: cualquier reformulacion, contexto adicional o cambio de etiquetas degrada el comportamiento. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion de estados en tres acciones discretas (A: girar a la izquierda, B: seguir recto, C: girar a la derecha) a partir de un prompt textual estructurado.
- Interpretacion de descripciones de estado con energia y presencia/conteo de recursos en tres sectores angulares (izquierda de -90 a -30 grados, frente de -30 a 30 grados, derecha de 30 a 90 grados).
- Integracion con llama.cpp mediante la extension `decision` para NetLogo, con seleccion de modelo por identificador (`umitaslan/Qwen3.5-0.8B-SheepBrain-GGUF:BF16`).
- Generacion de una linea de respuesta (`Answer:`) anadida por la extension, con la etiqueta elegida.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No se documenta modo de pensamiento (thinking mode) ni habilidades de codigo o matematicas.

## Casos de uso

- Simulacion basada en agentes en NetLogo: el modelo actua como politica de decision para cada oveja del demo `Wolf Sheep SheepBrain`, eligiendo entre las tres acciones a partir del estado textual generado por la extension `decision`. Es adecuado porque el formato de prompt esta fijado y el modelo fue entrenado exactamente para esa tarea.
- Investigacion sobre LLM como controladores de agentes: permite comparar una politica aprendida por un modelo de 0,8B frente a heuristicas codiciosas (236,9 de esperanza de vida) y frente a politicas aleatorias (166,0) en un entorno controlado y reproducible.
- Docencia y demostraciones de integracion LLM-simulacion: sirve para mostrar el ciclo completo estado textual, inferencia local y accion en un simulador, con un modelo que cabe en 1,6 GB y se ejecuta en llama.cpp.
- Validacion de pipelines de conversion de pesos: la comparacion GGUF frente a MLX (98% de coincidencia en 500 estados de validacion, 100% en los 371 estados con mejor opcion clara) lo convierte en un caso de prueba para verificar que una conversion a GGUF preserva el comportamiento del modelo original.
- Pruebas de robustez de formato de prompt: al requerir un texto exacto, es util para experimentar como afectan reformulaciones, cambios de etiquetas o contexto adicional al rendimiento de un modelo pequeno ajustado.
- Evaluacion de eficiencia en hardware modesto: con 772 millones de parametros en BF16, permite medir latencia y throughput de llama.cpp en equipos de consumo dentro de un bucle de simulacion con muchas decisiones por tick.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Esperanza de vida media (mundo de ovejas de turtle-brain-llm, 25x25, 30 ovejas, 500 ticks, 20 semillas) | 226,7 [IC 95%: 216,8; 236,6] |
| Modelo base sin entrenar (0,8B) | 23,5 |
| Politica aleatoria | 166,0 |
| Heuristica codiciosa de busqueda de hierba | 236,9 |
| Coincidencia GGUF frente a MLX (500 estados de validacion) | 98% |
| Coincidencia en estados con mejor opcion clara (371 estados) | 100% |
| Diferencia media de probabilidad GGUF frente a MLX | 0,005 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para los pesos en BF16, mas el overhead del contexto y del runtime de llama.cpp; en la practica, un rango de 2 a 3 GB es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 y similares.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU discreta moderna; tambien puede ejecutarse en CPU, dado el tamano reducido.
- Opciones de despliegue: llama.cpp es el runtime previsto (formato GGUF BF16). No se documenta compatibilidad con vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La evaluacion se realiza sobre decisiones individuales en un bucle de simulacion, sin datos publicados de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-SheepBrain-GGUF | 772.845.888 | no disponible | Control de agente en simulacion (3 acciones) | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B-Base | no disponible en la informacion | no disponible | Modelo base de proposito general | Apache-2.0 (segun el modelo derivado) | Hugging Face |
| Heuristica codiciosa de busqueda de hierba | no aplica | no aplica | Regla determinista de control | no aplica | Referencia interna del proyecto turtle-brain-llm |
| Politica aleatoria | no aplica | no aplica | Linea base de control | no aplica | Referencia interna del proyecto turtle-brain-llm |

La comparacion relevante no es con otros LLM de proposito general, sino con las lineas base del propio entorno: el modelo supera ampliamente a la politica aleatoria (226,7 frente a 166,0) y al modelo base sin entrenar (23,5), y queda ligeramente por debajo de la heuristica codiciosa (236,9).

## Limitaciones y advertencias

- El modelo solo funciona con el texto exacto de entrenamiento: sin `decision:context`, sin `decision:include-properties`, con las etiquetas A, B y C y sin reformular las lineas. Cualquier desviacion degrada o invalida la respuesta.
- Fue entrenado en un mundo de ovejas en Python sin lobos y con reglas de hierba distintas de las de Wolf Sheep Predation de NetLogo; sus decisiones en ese entorno son una demostracion, no una politica evaluada.
- Solo existe una ejecucion de entrenamiento y un unico formato publicado (BF16); no hay variantes cuantizadas a 4 u 8 bits.
- La extension `decision` para NetLogo no esta publicada todavia, lo que limita la reproducibilidad del caso de uso principal.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo esta restringido a una tarea de clasificacion y no se documenta su comportamiento fuera de distribucion.
- Sesgos conocidos: no documentados.
- Limitaciones de idioma: el prompt de entrenamiento esta en ingles y no se declaran idiomas soportados.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo no esta pensado para aplicaciones de produccion fuera de la simulacion para la que fue entrenado.
- No debe interpretarse como un asistente conversacional ni como sustituto de Qwen3.5-0.8B-Base en tareas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umitaslan/Qwen3.5-0.8B-SheepBrain-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Proyecto turtle-brain-llm: no disponible (mencionado en la model card sin enlace)
- Extension `decision` para NetLogo: no disponible (no publicada segun la model card)
- Paper o blog del ajuste: no disponible
