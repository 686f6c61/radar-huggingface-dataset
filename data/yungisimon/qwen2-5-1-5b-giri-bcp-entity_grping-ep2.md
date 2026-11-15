# yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep2

## Resumen

yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, orientado a una tarea muy concreta: funcionar como "modelo de memoria" (memory model) entrenado sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus. El autor lo publica como checkpoint intermedio, tras la epoca 2 de 3, con un metodo de agrupacion de entidades denominado `entity_grping` (entity grouping, max df 3).

El modelo parte de la arquitectura Qwen2 de 1.500 millones de parametros (1.543.714.304 reales segun los pesos safetensors), un transformer decoder-only denso con contexto nativo de 32.768 tokens en la familia Qwen2.5, aunque el entrenamiento de este ajuste se realizo con una longitud maxima de secuencia de 8.096 tokens. No se trata de un modelo generalista nuevo: es un artefacto de investigacion que hereda las capacidades del modelo base y las especializa en recuperacion y sintesis de informacion a partir de memoria contextual.

Su relevancia es acotada pero clara para quien investiga tecnicas de memoria externa en agentes y sistemas RAG: documenta un pipeline reproducible (dataset sintetico, agrupacion de entidades, full fine-tuning con FSDP) sobre hardware AMD Instinct MI325X, un dato poco habitual en el ecosistema. No obstante, el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, y su model card es minima, sin resultados de evaluacion ni detalles sobre el dataset mas alla del nombre del fichero y el numero de ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el entrenamiento uso max sequence length de 8.096 tokens. El modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5, sin confirmacion del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, con atención causal estandar y sin componentes MoE ni hibridos. El ajuste entrena el 100% de los parametros (1.543.714.304, es decir, todos), mediante FSDP sobre 8 GPUs AMD Instinct MI325X, con batch efectivo de 1.024 (128 por dispositivo, 1 paso de acumulacion, 8 GPUs), learning rate constante de 2e-05 con warmup del 5%, weight decay de 0.01, max grad norm de 1.0 y precision bf16 con gradient checkpointing. La perdida se calcula unicamente sobre los tokens del asistente, lo que es coherente con el uso conversacional y con la plantilla de chat de Qwen.

El dataset de entrenamiento es un conjunto sintetico de 3.046.524 ejemplos denominado `bcp_subset300_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`, construido a partir de BrowseComp-Plus y agrupado mediante el metodo `entity_grping` (agrupacion de entidades con max df 3). El autor no detalla la composicion del dataset, el proceso de generacion de los pares QA ni si hubo etapas de RLHF o DPO posteriores; solo indica que se trata de un "memory model". El checkpoint publicado corresponde a la epoca 2 de 3; el entrenamiento completo de las 3 epocas requirio 1,93 horas de reloj (15,4 GPU-horas). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base Qwen2.5-1.5B-Instruct y usa la plantilla de chat de Qwen.
- Memoria contextual y sintesis: entrenado especificamente para responder preguntas a partir de informacion presentada en el contexto, con enfasis en la agrupacion de entidades entre documentos (cross-doc entity combination).
- Razonamiento multi-paso basico: capacidad heredada del modelo base, no reforzada explicitamente en este ajuste.
- Generacion de codigo y matematicas: capacidades residuales del modelo base, sin evidencia de mejora ni de degradacion por el ajuste.
- Tool calling / function calling: no documentado por el autor; el modelo base Qwen2.5 lo soporta, pero este checkpoint no lo declara.
- Capacidades de agente: no documentadas.
- Capacidades multilingues: no documentadas; dependen del modelo base, sin confirmacion.
- Modo thinking, vision o audio: no disponible; el modelo es solo texto.

## Casos de uso

- Investigacion en memorias externas para agentes: el modelo sirve como componente de un sistema que inyecta documentos en el contexto y espera una respuesta sintetizada; su entrenamiento con agrupacion de entidades lo hace adecuado para escenarios donde la respuesta requiere combinar informacion de varias fuentes.
- Experimentos de RAG con contexto largo: con hasta 8.096 tokens de secuencia de entrenamiento, puede evaluarse en pipelines de recuperacion aumentada donde se concatenan varios pasajes y se pide una respuesta consolidada.
- Prototipado de asistentes documentales: para demos de bajo coste en las que se necesita un modelo pequeno (1,5B) que resuma o responda sobre un corpus inyectado, sin depender de APIs externas.
- Reproduccion de pipelines de ajuste fino: el checkpoint documenta hiperparametros, hardware y dataset, lo que lo convierte en una referencia util para replicar full fine-tuning con FSDP sobre AMD Instinct.
- Evaluacion comparativa de tecnicas de agrupacion: al estar etiquetado con `entity_grping` y max df 3, permite comparar contra otros checkpoints del mismo autor con metodos de clustering distintos.
- Filtrado y extraccion de entidades en corpus: por su entrenamiento en agrupacion de entidades, puede emplearse en tareas de deduplicacion o consolidacion de menciones en textos largos, siempre con validacion manual.
- Base para ajustes posteriores: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para fine-tunings especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB para pesos; en 4 bits, alrededor de 0,8-1 GB, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 en contextos cortos; A100, H100, L40S o RTX 4090 para despliegue con concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (el tag `text-generation-inference` esta presente), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep2 | 1,54B | 8.096 tokens de entrenamiento (32.768 en el base) | Memory model sobre BrowseComp-Plus | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Instruccion generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Instruccion generalista | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Instruccion generalista | Llama 3.2 Community License | Hugging Face, requiere aceptacion |

La comparacion directa con el modelo base es la mas informativa: este checkpoint no supera en capacidades generales a Qwen2.5-1.5B-Instruct y solo aporta valor en la tarea especifica de memoria y agrupacion de entidades. Frente a Llama-3.2-1B-Instruct, la diferencia clave es la licencia Apache 2.0 sin restricciones adicionales y el contexto nativo menor del base Qwen2.5 (32.768 frente a 128.000).

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente.
- Checkpoint intermedio (epoca 2 de 3): no es el modelo final del entrenamiento y puede presentar un rendimiento inferior al de la epoca 3.
- Sin benchmarks publicados: no se puede verificar la mejora sobre el modelo base ni comparar con alternativas.
- Dataset sintetico de 3 millones de ejemplos sin documentacion de composicion: riesgo de sesgos y artefactos desconocidos.
- Riesgo de alucinacion: como todo modelo de 1,5B, puede inventar entidades o relaciones al sintetizar informacion de multiples documentos.
- Contexto de entrenamiento limitado a 8.096 tokens: aunque el base soporte 32.768, el ajuste puede degradarse mas alla de la longitud vista durante el entrenamiento.
- Idiomas no declarados: no hay confirmacion de que el ajuste preserve el multilingüismo del modelo base.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- Sin pesos GGUF publicados: el despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Perfil del autor: https://huggingface.co/yungisimon
