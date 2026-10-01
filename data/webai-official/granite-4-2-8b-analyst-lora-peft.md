# webAI-Official/granite-4.2-8b-analyst-lora-peft

## Resumen

granite-4.2-8b-analyst-lora-peft es un adaptador LoRA de tipo PEFT publicado por el usuario webAI-Official sobre el modelo base ibm-granite/granite-4.2-8b de IBM. No es un modelo completo, sino un conjunto de pesos de bajo rango (rank 16, alpha 32) que se acoplan al modelo base para especializarlo en una persona concreta, denominada "analyst". El repositorio ocupa 0,2 GB y contiene unicamente los pesos del adaptador, la configuracion de PEFT, el tokenizer y el chat template empleados en el entrenamiento.

El adaptador se entrena sobre 3452 ejemplos durante 3 epocas con un learning rate de 0,0001, schedule coseno, longitud de secuencia maxima de 8192 tokens y packing, alcanzando un loss final de entrenamiento de 0,3095 y un loss de evaluacion de 0,3435 en el paso 651. El autor indica que el modo de razonamiento configurado es `thinking`, lo que sugiere que el adaptador esta orientado a tareas de analisis con pasos intermedios de razonamiento.

Su relevancia actual es limitada pero concreta: permite experimentar con la especializacion de un modelo de 8B de la familia Granite 4.2 sin necesidad de reentrenar el modelo completo, y existe una version GGUF de los mismos pesos para despliegue con llama.cpp. Como contrapartida, el repositorio no declara licencia ni idiomas, no tiene descargas ni valoraciones, no publica benchmarks y no documenta la composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base ibm-granite/granite-4.2-8b |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 8B segun su denominacion; el numero de parametros entrenables no se indica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso max_seq_len de 8192 tokens) |
| Tipos de cuantizacion | No disponible en el repositorio PEFT; existe una version GGUF de los mismos pesos en webAI-Official/granite-4.2-8b-analyst-lora-GGUF |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors, fp32) + adapter_config.json; libreria `peft` |
| Rank / alpha / dropout de LoRA | 16 / 32 / 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Version de PEFT | 0.21.0 (tokenizer config en formato Transformers v5) |
| Modo de razonamiento | `thinking` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre todas las proyecciones de atencion y de la MLP del modelo base: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Al cubrir tanto la atencion como las capas feed-forward, el adaptador tiene capacidad de modificar el comportamiento del modelo en profundidad, no solo la fase de atencion. Los pesos se guardan en fp32 y pueden fusionarse con el modelo base mediante `model.merge_and_unload()`, lo que elimina la sobrecarga de latencia en inferencia.

El entrenamiento se realizo sobre 3452 ejemplos durante 3 epocas, con learning rate de 0,0001, schedule coseno, packing de secuencias y longitud maxima de 8192 tokens, hasta el paso 651. Las metricas reportadas son un loss de entrenamiento de 0,3095 y un loss de evaluacion de 0,3435, una diferencia reducida que no sugiere un sobreajuste severo, aunque sin conocer el tamano del conjunto de evaluacion ni su procedencia el dato es dificil de interpretar. No se documenta la composicion del dataset, ni si hubo etapas de RLHF o DPO, ni si el entrenamiento incluyo datos sinteticos generados por otro modelo. El repositorio incluye los ficheros persona.json, run_config.json y train_metrics.json, que presumiblemente contienen la configuracion de la persona y las metricas completas, pero su contenido no se detalla en la model card.

## Capacidades

- Generacion de texto y uso conversacional, heredados del modelo base ibm-granite/granite-4.2-8b y ajustados hacia un estilo de "analista".
- Modo de razonamiento `thinking` declarado por el autor, orientado a tareas que requieren pasos intermedios antes de la respuesta final.
- Aplicacion como adaptador PEFT intercambiable: puede cargarse sobre el base con `PeftModel.from_pretrained` o fusionarse con `merge_and_unload()`.
- Soporte de chat template propio (`chat_template.jinja`), lo que permite usar `apply_chat_template` con mensajes en formato de rol.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del modo `thinking`: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Vision, audio u otras modalidades: no documentadas; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Analisis de documentos extensos: con un max_seq_len de entrenamiento de 8192 tokens, el adaptador es adecuado para resumir y extraer conclusiones de informes, contratos o articulos largos en una sola pasada, sin necesidad de trocear el documento en exceso.
- Generacion de informes estructurados: la persona "analyst" apunta a respuestas con estructura de analisis (contexto, datos, conclusion, recomendacion), util para generar borradores de informes internos que luego revisa una persona.
- Asistente de analisis dentro de un pipeline RAG: el adaptador puede colocarse al final de una cadena de recuperacion para redactar la respuesta final citando el contexto recuperado, siempre que se valide su comportamiento con datos propios.
- Analisis financiero o de negocio asistido: interpretacion de tablas, series temporales o estados financieros convertidos a texto, con salida en formato de comentario analitico.
- Despliegue local con llama.cpp u Ollama: gracias a la version GGUF de los mismos pesos, es posible ejecutar el adaptador en estaciones de trabajo sin GPU de datacenter, util para analisis de documentacion confidencial que no puede salir de la organizacion.
- Investigacion sobre personalizacion de modelos: sirve como caso de estudio reproducible de como un LoRA de rango 16 sobre siete modulos puede desplazar el estilo de un modelo de 8B con solo 3452 ejemplos, util para comparar estrategias de ajuste.
- Prototipado rapido de un asistente especializado: al ser un adaptador separable, permite alternar entre el modelo base y la version "analyst" en el mismo servidor de inferencia sin duplicar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos numericos reportados por el autor son las metricas de entrenamiento: loss de entrenamiento 0,3095, loss de evaluacion 0,3435 y paso final 651. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparacion con el modelo base sin adaptador.

## Requisitos de hardware

- VRAM estimada para el modelo base de 8B (estimacion, no dato publicado): en bf16/fp16 en torno a 16-17 GB de pesos, mas cache KV; en cuantizacion de 8 bits en torno a 9-10 GB; en 4 bits en torno a 5-6 GB.
- El adaptador en si ocupa 0,2 GB en fp32 y su coste en VRAM es despreciable; si se fusiona con el base, no anade memoria ni latencia adicional.
- GPU recomendadas para bf16: A100 40 GB, H100, L40S o RTX 4090 24 GB (esta ultima con margen limitado si se usan contextos largos).
- GPU de consumo: si cabe en una RTX 4090, RTX 3090 (24 GB) en bf16 con contexto moderado, y en tarjetas de 8-12 GB si se emplea cuantizacion de 4 bits.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM si se soporta el adaptador LoRA sobre el base, y llama.cpp / Ollama mediante el repositorio GGUF del mismo autor.
- Latencia y throughput estimados: no disponibles. El repositorio no publica mediciones de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-8b-analyst-lora-peft | LoRA r16 sobre base de 8B | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| ibm-granite/granite-4.2-8b (modelo base) | 8B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| webAI-Official/granite-4.2-8b-analyst-lora-GGUF | Mismos pesos en formato GGUF | No disponible | Sin benchmarks publicados | No disponible | HuggingFace |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre adaptadores equivalentes de otros autores para la misma tarea, por lo que no es posible establecer una comparacion de rendimiento con alternativas directas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse uso comercial permitido. Aunque el modelo base de IBM suele publicarse bajo licencias permisivas, la ausencia de licencia explicita en el adaptador es un riesgo legal en produccion.
- Idiomas no declarados: se desconoce si el ajuste conserva el comportamiento multilingue del modelo base o si lo degrada hacia un unico idioma.
- Sin benchmarks: no hay ninguna evaluacion publicada que permita verificar que el adaptador mejora al base en tareas de analisis; las unicas metricas son losses de entrenamiento, que no miden calidad de tarea.
- Composicion del dataset desconocida: no se detalla de donde salen los 3452 ejemplos ni si contienen datos personales, sesgos o material con derechos de terceros.
- Riesgo de olvido catastrofico: un ajuste de 3 epocas sobre 3452 ejemplos puede degradar capacidades del base no representadas en el conjunto de entrenamiento, especialmente en tareas ajenas al analisis.
- Riesgo de alucinacion: inherente al modelo base; el ajuste hacia un estilo analitico puede aumentar la confianza aparente de las respuestas y hacer mas dificil detectar afirmaciones erroneas.
- Sobrecoste de entrenamiento no reproducible: no se especifican los recursos de GPU utilizados, por lo que no puede reproducirse el coste de ajuste.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que sirva como validacion externa.
- Fechas del repositorio inconsistentes con la fecha actual: el repositorio figura creado y actualizado el 30 de septiembre de 2026, dato a verificar antes de citarlo.
- Cautela en produccion: al tratarse de un adaptador no verificado y sin licencia, cualquier despliegue deberia acompanarse de evaluacion propia sobre el dominio objetivo y de una revision legal previa.

## Enlaces

- Adaptador PEFT en HuggingFace: https://huggingface.co/webAI-Official/granite-4.2-8b-analyst-lora-peft
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Version GGUF de los mismos pesos: https://huggingface.co/webAI-Official/granite-4.2-8b-analyst-lora-GGUF
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a contenidos sin relacion con el modelo (articulos sobre el director Tim Burton).
