# Xaayuu/support-ticket-lora

# Xaayuu/support-ticket-lora: adaptador LoRA para clasificacion de tickets de soporte

## Resumen

Xaayuu/support-ticket-lora es un adaptador LoRA entrenado por el usuario Xaayuu sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su objetivo declarado es la prediccion de cola (queue) y prioridad de tickets de soporte tecnico, devolviendo la salida en formato JSON. Se publica como experimento de fine-tuning con PEFT, no como un modelo de produccion: el propio autor lo describe como "experimental" y recomienda verificar las predicciones antes de usarlas en decisiones reales de atencion al cliente.

El interes de la ficha es acotado pero representativo de una practica muy extendida en 2026: adaptar modelos pequenos (en este caso 0,49 mil millones de parametros) mediante LoRA para tareas de clasificacion estructurada, en lugar de desplegar un modelo grande con prompting. El repositorio pesa 0,0 GB (solo se publican los pesos del adaptador) y la libreria indicada es peft, con pipeline text-generation y compatibilidad con safetensors.

La relevancia practica es limitada por sus resultados preliminares: sobre 100 ejemplos de validacion obtiene un 43% de exactitud en cola y un 39% en prioridad, con macro-F1 de 0,3202 y 0,2957 respectivamente. El dato mas solido es la tasa de JSON valido del 100%, que indica que el formato de salida es fiable aunque el contenido de la clasificacion no lo sea. El autor advierte explicitamente que la comparacion con lineas base requiere ejemplos de evaluacion identicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen/Qwen2.5-0.5B-Instruct |
| Parametros totales | No disponible para el adaptador (rango y alpha no publicados). Modelo base: 0,49 mil millones de parametros (0,36 mil millones sin embeddings) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador. Modelo base Qwen2.5-0.5B-Instruct: 32.768 tokens nativos, ampliables a 128K con RoPE scaling/YaRN segun la documentacion de Qwen |
| Tipos de cuantizacion | No disponible para el adaptador. El modelo base admite cuantizacion en GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.), AWQ, GPTQ y bitsandbytes (4/8 bits) |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5 esta entrenado para 29 idiomas, incluidos castellano, ingles y portugues |
| Licencia | No disponible (la model card no declara licencia para el adaptador). El modelo base se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, cargable con PeftModel.from_pretrained) |

Nota: los datos marcados como "modelo base" provienen de la documentacion de Qwen y no de la model card del adaptador, que no los especifica.

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un conjunto de pesos de adaptador LoRA que se cargan sobre Qwen/Qwen2.5-0.5B-Instruct. El modelo base es un transformer decoder-only denso de Qwen2.5 con atencion por consultas agrupadas (GQA), disenado para instrucciones y conversacion. La model card no especifica el rango (r), el alpha, las capas objetivo ni el dropout del adaptador, por lo que no es posible reproducir el entrenamiento con la informacion disponible.

Los datos de entrenamiento declarados son 18.998 ejemplos de entrenamiento y 2.375 de validacion, con 1 epoch y 1.188 pasos, lo que implica un tamano de lote efectivo cercano a 16 ejemplos por paso. No se documenta la composicion del dataset, la procedencia de los tickets, el esquema exacto de etiquetas de cola y prioridad, ni si hubo balanceo de clases; la baja macro-F1 en cola (0,3202) sugiere un problema de desbalanceo o de separabilidad entre categorias. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional: el ajuste es exclusivamente supervisado sobre el modelo ya instruido.

La unica innovacion tecnica reseñable es la eleccion del objetivo: en lugar de clasificacion clasica con una cabeza lineal, se entrena un modelo generativo para emitir JSON estructurado, lo que permite anadir campos sin reentrenar la cabeza de clasificacion. La tasa de JSON valido del 100% en la evaluacion preliminar respalda este enfoque, aunque la model card no especifica si se aplico un validador o un esquema de decodificacion restringida durante la evaluacion.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Clasificacion de tickets de soporte en dos dimensiones: cola o departamento (queue) y prioridad.
- Salida estructurada en JSON: la evaluacion preliminar reporta un 100% de JSON valido sobre 100 ejemplos de validacion.
- Generacion de respuestas cortas orientadas a tareas de clasificacion, no a dialogos largos.
- Soporte de tool calling / function calling: no disponible en el adaptador; el modelo base Qwen2.5-0.5B-Instruct si lo soporta, pero el ajuste LoRA puede degradar esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no documentadas y poco probables dado el tamano del modelo base y el ajuste especifico de clasificacion.
- Capacidades multilingues: no disponibles en la model card; el modelo base soporta varios idiomas, pero no hay evidencia de que el adaptador los preserve.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Triaje inicial de tickets en una mesa de ayuda interna: el modelo lee el asunto y el cuerpo del ticket y devuelve un JSON con cola y prioridad. Es util como primer filtro automatico siempre que un humano revise los casos marcados como criticos, dado el 43% de exactitud en cola.
- Enrutado a colas de segunda linea con umbral de confianza: en lugar de confiar en la etiqueta directamente, se puede usar la salida como sugerencia y comparar con reglas de negocio (por ejemplo, palabras clave de facturacion o seguridad) para decidir el encaminamiento final.
- Etiquetado asistido para humanos: mostrar la prediccion al agente de soporte en la interfaz para que la acepte o la corrija, generando datos etiquetados que alimenten una futura iteracion del adaptador.
- Prototipado rapido y validacion de pipelines de datos: al pesar unos pocos megabytes y requerir muy poca VRAM, sirve para probar de extremo a extremo un flujo de clasificacion (ingesta, inferencia, parseo de JSON, almacenamiento) antes de invertir en un modelo mayor.
- Extraccion de estructura para analitica: aunque la etiqueta sea imprecisa, el 100% de JSON valido permite construir tableros de volumen por cola sugerida y detectar tendencias de carga, siempre etiquetados como "prediccion automatica no verificada".
- Docencia y experimentacion con LoRA y PEFT: como ejemplo reproducible de ajuste de un modelo de 0,5B con 18.998 ejemplos en 1 epoch y 1.188 pasos, es un caso de estudio util sobre el impacto del desbalanceo de clases en tareas de clasificacion.
- Filtrado previo de spam o duplicados dentro de un flujo de tickets: combinado con reglas heuristics, la salida JSON puede alimentar un clasificador binario posterior mas fiable.
- Despliegue en el borde o en entornos sin GPU: al ser un adaptador de 0,5B, puede ejecutarse en CPU o en GPUs integradas, lo que lo hace viable para demos locales o entornos con restricciones de hardware.

## Benchmarks y rendimiento

Los unicos resultados publicados son una evaluacion preliminar sobre 100 ejemplos de validacion, realizada por el autor y no sobre el conjunto completo de validacion (2.375 ejemplos).

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Exactitud en cola (queue accuracy) | 43% | 100 ejemplos de validacion |
| Macro-F1 en cola | 0,3202 | 100 ejemplos de validacion |
| Exactitud en prioridad (priority accuracy) | 39% | 100 ejemplos de validacion |
| Macro-F1 en prioridad | 0,2957 | 100 ejemplos de validacion |
| Tasa de JSON valido | 100% | 100 ejemplos de validacion |

No se han publicado comparaciones con lineas base ni resultados sobre el conjunto completo de validacion. El autor indica que cualquier comparacion requiere ejemplos de evaluacion identicos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa unos pocos megabytes. El modelo base de 0,49B en fp16 requiere aproximadamente 1 GB de pesos; con cache KV para lotes pequenos y contexto moderado, el uso practico se situa en torno a 1,5-2 GB.
- Cuantizacion: en 8 bits, aproximadamente 0,6 GB de pesos; en 4 bits, aproximadamente 0,35-0,4 GB. Los pesos del adaptador pueden fusionarse con el modelo base cuantizado en 4 u 8 bits mediante QLoRA.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para esta carga, las GPU de datacenter estan sobredimensionadas.
- Cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU dedicada de los ultimos ocho anos, y tambien en CPU con llama.cpp u Ollama.
- Opciones de despliegue: vLLM y TGI son compatibles con adaptadores LoRA sobre Qwen2.5 (mediante carga de adaptadores dinamicos); llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y exportar a GGUF; tambien es posible usar Transformers con PEFT directamente.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, un modelo de 0,5B en una GPU de consumo moderna produce decenas o cientos de tokens por segundo, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| Xaayuu/support-ticket-lora | 0,49B (base) + adaptador LoRA | No disponible (base: 32.768 tokens) | Adaptador generativo para clasificacion JSON | No disponible | 43% exactitud en cola, 39% en prioridad (100 ejemplos) |
| Qwen/Qwen2.5-0.5B-Instruct (modelo base) | 0,49B | 32.768 tokens nativos | Transformer decoder-only denso | Apache 2.0 | No disponible en esta tarea; requeriria prompting o fine-tuning |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens nativos | Transformer decoder-only denso | Apache 2.0 | No disponible en esta tarea |
| Clasificador supervisado tipo encoder (por ejemplo, familia BERT) | 0,1-0,3B tipicamente | 512 tokens tipicamente | Encoder con cabeza de clasificacion | Depende del modelo | No disponible: no hay evaluacion comparable en la informacion proporcionada |

La comparacion de rendimiento con alternativas no es posible con los datos publicados: el autor no proporciona una linea base evaluada sobre los mismos 100 ejemplos ni sobre el conjunto completo de validacion.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo declara como tal y recomienda verificar las predicciones antes de usarlas en decisiones reales de soporte al cliente.
- Rendimiento bajo en la tarea objetivo: 43% de exactitud en cola y 39% en prioridad, con macro-F1 de 0,3202 y 0,2957. Un clasificador trivial por clase mayoritaria o un modelo de reglas podria igualar o superar estos valores segun la distribucion de etiquetas, que no se publica.
- Evaluacion preliminar y no representativa: los resultados provienen de solo 100 ejemplos de validacion, frente a los 2.375 disponibles. No hay intervalos de confianza ni analisis por clase.
- Riesgo de sesgo por desbalanceo de clases: la diferencia entre exactitud y macro-F1 sugiere que el modelo acierta de forma desproporcionada en las clases mas frecuentes, aunque la composicion del dataset no esta documentada.
- Riesgo de alucinacion en la salida estructurada: aunque el JSON sea valido en el 100% de los casos, los valores de cola y prioridad pueden ser arbitrarios o inventados, incluida la posibilidad de emitir etiquetas fuera del conjunto de clases previsto si no se restringe la decodificacion.
- Limitaciones de contexto e idioma: no documentadas en la model card. Al derivar de Qwen2.5-0.5B-Instruct, el comportamiento fuera del ingles o del dominio de entrenamiento es incierto.
- Restricciones de licencia: la model card no declara licencia para el adaptador. Antes de cualquier uso comercial hay que aclarar este punto con el autor y verificar la licencia Apache 2.0 del modelo base, que si permite uso comercial.
- Sin garantias de reproducibilidad: no se publican el rango LoRA, las capas objetivo, la tasa de aprendizaje, el esquema de etiquetas ni el dataset, por lo que el entrenamiento no es reproducible.
- Sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar resultados.
- Fecha de publicacion inusual: el repositorio figura como creado y actualizado en octubre de 2026, con un intervalo de dos minutos entre ambos eventos, lo que sugiere una subida unica sin mantenimiento posterior.
- No apto para produccion en su estado actual: para un sistema real de triaje se recomienda una linea base supervisada mas simple, un modelo mayor o un ajuste con mas datos y evaluacion completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xaayuu/support-ticket-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo, su autor o su tarea (los resultados obtenidos eran contenido no relacionado y de naturaleza adulta, por lo que se descartan). No se han localizado papers, blogs, repositorios ni demos adicionales asociados a este adaptador.
