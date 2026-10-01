# webAI-Official/granite-4.2-8b-researcher-lora-peft

## Resumen

granite-4.2-8b-researcher-lora-peft es un adaptador LoRA de tipo PEFT publicado por webAI-Official sobre el modelo base ibm-granite/granite-4.2-8b. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de rango 16 que especializan al modelo base en una persona concreta denominada "researcher". El repositorio ocupa aproximadamente 0,2 GB, lo que es coherente con un adaptador y no con un modelo de 8.000 millones de parametros.

El adaptador se entreno sobre 404 ejemplos durante 3 epocas, con una tasa de aprendizaje de 1e-4, programacion coseno y una longitud maxima de secuencia de 8192 tokens, usando empaquetado (packing) de secuencias. Los modulos objetivo cubren las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) y las proyecciones MLP (gate_proj, up_proj, down_proj), lo que implica una adaptacion extensa dentro del transformer. El modo de razonamiento declarado es `low_effort`.

Su relevancia es limitada pero acotada: es un ejemplo practico de personalizacion ligera mediante LoRA sobre un modelo de 8B, con una version equivalente en formato GGUF para llama.cpp. No se han publicado datos de benchmarks, licencia ni idiomas soportados en la informacion disponible, por lo que su uso en produccion requiere verificar primero la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura concreta del modelo base no disponible en la informacion proporcionada |
| Parametros totales | Modelo base: 8B (segun denominacion del repositorio). Parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE en la informacion disponible) |
| Longitud de contexto | 8192 tokens durante el entrenamiento del adaptador; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en fp32 (safetensors). Existe una version GGUF del mismo adaptador. Cuantizaciones del modelo base: no disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors), configuracion en adapter_config.json; version GGUF en repositorio separado |

Detalles del adaptador:

| Parametro LoRA | Valor |
|---|---|
| Rango (r) | 16 |
| Alpha | 32 |
| Dropout | 0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Libreria de guardado | PEFT 0.21.0 |
| Modo de razonamiento | low_effort |
| Formato del tokenizer | Transformers v5 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 sobre las siete proyecciones lineales principales de cada bloque del transformer base, tanto en el bloque de atencion como en la red feed-forward. Con dropout 0,05 y alpha doble del rango, el factor de escala efectivo es 2,0, una configuracion habitual para adaptaciones de dominio con pocos ejemplos. Los pesos se guardaron en fp32 y la carga se realiza con PeftModel.from_pretrained, con la opcion de fusionarlos definitivamente en el modelo base mediante merge_and_unload(). El adaptador no modifica el vocabulario ni el tokenizer del modelo base, pero el repositorio incluye tokenizer.json, tokenizer_config.json y chat_template.jinja, lo que sugiere que la plantilla de chat empleada durante el entrenamiento se distribuye junto al adaptador.

El conjunto de entrenamiento es muy reducido: 404 ejemplos, 3 epocas, tasa de aprendizaje 1e-4 con programacion coseno, longitud maxima de 8192 tokens y empaquetado de secuencias para maximizar la ocupacion de cada batch. El entrenamiento concluyo en el paso 78, con una perdida de entrenamiento de 0,2051 y una perdida de evaluacion de 0,2525. La proximidad entre ambas cifras sugiere ausencia de sobreajuste grave, pero tambien implica que el ajuste se limita a modelar el estilo y las convenciones de la persona "researcher" sobre un numero muy pequeno de conversaciones. No se documenta el uso de RLHF, DPO ni otras fases de alineamiento adicionales para este adaptador. Se desconoce la composicion exacta del dataset y si hubo curación manual, filtrado o anonimizacion.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base granite-4.2-8b y las especializa hacia el registro y las convenciones de la persona "researcher".
- Razonamiento en modo `low_effort`: el adaptador declara explicitamente esta configuracion de esfuerzo de razonamiento, orientada a respuestas mas directas y con menos tokens intermedios.
- Soporte de plantilla de chat: incluye chat_template.jinja, por lo que funciona con apply_chat_template y conversaciones con roles de sistema, usuario y asistente.
- Capacidades del modelo base (codigo, matematicas, tool calling, multilingue): no disponibles en la informacion proporcionada para granite-4.2-8b; deben consultarse en la model card de ibm-granite/granite-4.2-8b.
- Fusion de pesos: permite merge_and_unload() para obtener un modelo denso equivalente sin la capa de PEFT en tiempo de inferencia.
- Distribucion alternativa en GGUF: existe un repositorio hermano con los mismos pesos convertidos para llama.cpp.
- Capacidades de vision o audio: no disponible.

## Casos de uso

Con un adaptador entrenado sobre 404 ejemplos, los casos de uso realistas son aquellos donde se busca un tono y unas convenciones concretas de estilo investigador, no un incremento de capacidad bruta. Entre ellos:

- Prototipado de asistentes de investigacion: desplegar un asistente que responda con estructura de informe, citas y tono academico, cargando el adaptador sobre el modelo base en un script de Transformers. El coste de almacenamiento es de 0,2 GB adicionales sobre el modelo base.
- Experimentacion academica con PEFT: servir como referencia reproducible de un pipeline LoRA completo (config, metricas, plantilla de chat y tokenizer) para estudiar como varia la perdida con 404 ejemplos y 3 epocas.
- Evaluacion comparativa de personas: comparar las respuestas del adaptador "researcher" frente al modelo base sin adaptador para medir cuanto del comportamiento procede del ajuste fino y cuanto del preentrenamiento.
- Despliegue en llama.cpp u Ollama: usando el repositorio GGUF, integrar el adaptador en entornos de borde o en maquinas sin GPU dedicada mediante cuantizacion de 4 bits.
- Servicio multi-adaptador con vLLM o TGI: si el motor lo permite, cargar el modelo base una sola vez y atender varias personas mediante adaptadores LoRA intercambiables, reduciendo el coste de VRAM por persona.
- Generacion de borradores tecnicos en un pipeline interno: usar el adaptador como primer paso de redaccion y encadenar despues un modelo mayor o un revisor humano, aprovechando su bajo coste de inferencia.
- Docencia y formacion: ilustrar de forma practica la diferencia entre un modelo base y un adaptador, asi como el flujo de fusion de pesos con merge_and_unload().

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni ninguna otra suite estandar. Los unicos datos cuantitativos publicados son las metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Numero de ejemplos de entrenamiento | 404 |
| Epocas | 3 |
| Paso final | 78 |
| Perdida de entrenamiento (final) | 0,2051 |
| Perdida de evaluacion | 0,2525 |
| Tasa de aprendizaje | 1e-4 |
| Programacion de LR | Coseno |
| Longitud maxima de secuencia | 8192 |
| Tecnica de empaquetado | packing |

No se dispone de comparaciones con otros adaptadores ni con el modelo base sobre las mismas tareas.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (8B) y no estan confirmadas por el autor:

- Inferencia en bf16/fp16: alrededor de 16 GB solo para los pesos, con picos de 18-20 GB de VRAM incluyendo cache KV a contextos moderados. El adaptador anade aproximadamente 0,2 GB en fp32.
- Inferencia en 8 bits: en torno a 9-10 GB de VRAM.
- Inferencia en 4 bits (GGUF Q4_K_M o similar): aproximadamente 5 GB de VRAM o incluso ejecucion en CPU con RAM suficiente.
- GPU de datacenter: A100 40/80 GB, H100, L40S. En una A100 40 GB cabe en bf16 con margen amplio de contexto.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX 4080 en cuantizacion de 4-8 bits. En bf16 completo requiere al menos una GPU de 24 GB y queda muy justo, especialmente con contextos largos.
- GPUs de gama media (8-12 GB): viables unicamente con el modelo base cuantizado a 4 bits.
- Opciones de despliegue: Transformers + PEFT (flujo documentado en la model card), llama.cpp y Ollama mediante el repositorio GGUF, y potencialmente vLLM o TGI si admiten adaptadores LoRA sobre el modelo base. La compatibilidad exacta con motores de servicio no esta documentada.
- Latencia y throughput: no disponibles. Dependen del hardware, de la cuantizacion, del motor de inferencia y de la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-8b-researcher-lora-peft | Adaptador sobre base de 8B; rango 16 | 8192 en entrenamiento | safetensors (PEFT) | No disponible | HuggingFace, 0 descargas |
| ibm-granite/granite-4.2-8b | 8B | No disponible | safetensors | No disponible en la informacion proporcionada | HuggingFace, modelo base |
| webAI-Official/granite-4.2-8b-researcher-lora-GGUF | Mismos pesos del adaptador | 8192 en entrenamiento | GGUF | No disponible | HuggingFace |

No se dispone de informacion sobre otros adaptadores de persona comparables ni sobre resultados de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 404 ejemplos y 3 epocas. Es probable que el adaptador generalice mal fuera del dominio y el estilo exactos cubiertos por esas conversaciones.
- Licencia no disponible: no se puede confirmar la legalidad del uso comercial. Ademas, la licencia del adaptador no es independiente de la del modelo base, por lo que hay que verificar ambas (IBM Granite tiene sus propias condiciones de uso).
- Idiomas no declarados: no hay garantia de comportamiento correcto en castellano ni en ningun idioma concreto.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de 8B, y no mitigado por un ajuste LoRA de esta magnitud. El adaptador no aporta verificacion factual.
- Sesgos: no se documentan analisis de sesgo ni de toxicidad. El modelo hereda los sesgos del corpus de preentrenamiento del modelo base, sobre los que no hay informacion.
- Sobreajuste de estilo: con tan pocos ejemplos, el adaptador puede reproducir formulas y estructuras muy rigidas de la persona "researcher", reduciendo la diversidad de respuestas.
- Perdida de evaluacion superior a la de entrenamiento (0,2525 frente a 0,2051): indica una brecha moderada que conviene vigilar si se amplia el uso a dominios nuevos.
- Reproducibilidad: no se documenta la composicion del dataset, el proceso de filtrado ni las semillas, por lo que el entrenamiento no es replicable tal cual.
- Fechas del repositorio: creado y actualizado el 2026-09-30, con 0 descargas y 0 likes. Es un artefacto sin validacion por parte de la comunidad.
- Entorno: guardado con PEFT 0.21.0 y tokenizer en formato Transformers v5. Versiones mas antiguas de la libreria pueden no cargar la configuracion correctamente.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su autor; todos los resultados obtenidos fueron contenido no relacionado y se han descartado.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/webAI-Official/granite-4.2-8b-researcher-lora-peft
- Version GGUF del adaptador: https://huggingface.co/webAI-Official/granite-4.2-8b-researcher-lora-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada. La busqueda web no arrojo resultados relevantes.
