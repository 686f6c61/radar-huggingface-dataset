# ysangeeeeeee/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

Este repositorio contiene un adaptador LoRA de tipo "persona" afinado sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, un modelo de lenguaje de 8 mil millones de parámetros desarrollado originalmente por Kakao Corp. El autor del fine-tuning es el usuario de Hugging Face `ysangeeeeeee`, que ha publicado el adaptador con licencia Apache 2.0. El propósito declarado es la adaptación de estilo o personalidad ("Persona"), un tipo de ajuste habitual para fijar un tono conversacional concreto, aunque la model card no detalla el dataset ni los objetivos exactos del entrenamiento.

El modelo base Kanana 1.5 8B Instruct es un transformer decoder-only orientado a generación de texto e instrucciones, con especial atención al coreano y al inglés. Este adaptador LoRA no modifica la arquitectura subyacente: se aplica sobre los pesos del modelo base y requiere cargar ambos para su uso. El repositorio pesa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

La relevancia de esta ficha es limitada pero concreta: se trata de un ejemplo de fine-tuning ligero con Unsloth sobre un modelo coreano de 8B, útil para quienes quieran evaluar la técnica de adaptación de persona o reutilizar el adaptador sobre Kanana 1.5. No obstante, la información publicada es mínima (sin benchmarks, sin dataset, sin detalles de hiperparámetros), por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Kanana 1.5 8B Instruct); adaptador LoRA sobre el mismo |
| Parametros totales | 8B en el modelo base; el adaptador LoRA no declara número de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; el adaptador se publica en safetensors y es compatible con cuantización del modelo base (no verificada) |
| Idiomas soportados | en (según la model card); el modelo base Kanana soporta coreano e inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `kakaocorp/kanana-1.5-8b-instruct-2505`, un transformer decoder-only de 8B parámetros. El ajuste se realizó mediante LoRA (Low-Rank Adaptation), técnica que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en las capas de atención y/o MLP. Según la model card, el entrenamiento se llevó a cabo con Unsloth, una librería que optimiza el fine-tuning de modelos Llama-like reduciendo el uso de memoria y acelerando el proceso (el autor afirma "2x faster"). También se mencionan las etiquetas `trl` y `llama`, lo que sugiere el uso de la librería TRL de Hugging Face para el entrenamiento supervisado.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni los hiperparámetros del LoRA (rango, alpha, dropout, módulos objetivo). Tampoco se documenta ninguna innovación técnica más allá del uso de Unsloth. El objetivo declarado es la adaptación de "persona", es decir, fijar un estilo o rol conversacional, pero sin detalles sobre el corpus utilizado para ello.

## Capacidades

- Generación de texto conversacional en inglés (idioma declarado en la model card), heredando las capacidades del modelo base Kanana 1.5 8B Instruct.
- Adaptación de estilo o personalidad ("Persona") sobre el comportamiento del modelo base, presumiblemente para respuestas con un tono o rol concreto.
- Razonamiento e instrucciones generales: al ser un adaptador sobre un modelo instruct, conserva la capacidad de seguir instrucciones del modelo base, aunque no se documenta su degradación o mejora.
- Soporte multilingüe: la model card declara únicamente `en`; el modelo base Kanana está orientado a coreano e inglés, pero el adaptador no declara coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Prototipado de asistentes con personalidad fija: el adaptador permite cargar el modelo base Kanana 1.5 8B y aplicar el LoRA para obtener respuestas con un tono consistente, útil para validar rápidamente una persona conversacional antes de invertir en un fine-tuning completo.
- Investigación sobre adaptación de estilo: sirve como ejemplo reproducible de fine-tuning LoRA con Unsloth y TRL sobre un modelo de 8B, útil para estudiar cómo afecta un adaptador de bajo rango al comportamiento del modelo base.
- Evaluación comparativa de personas: al ser un adaptador separado, se puede activar y desactivar sobre el mismo modelo base para comparar respuestas con y sin persona en tareas de generación.
- Chatbots de dominio acotado en inglés: si la persona entrenada corresponde a un rol concreto (soporte, tutor, etc.), el adaptador puede desplegarse sobre el modelo base para conversaciones multi-turno en inglés, siempre que se valide la calidad con datos propios.
- Base para fine-tuning incremental: el adaptador puede servir como punto de partida para merges o para entrenamientos posteriores con otros datasets, dado su formato safetensors y licencia Apache 2.0.
- Despliegue ligero en TGI o transformers: al ser un adaptador de ~0,1 GB, se puede servir junto al modelo base en infraestructura existente sin duplicar los pesos completos, facilitando pruebas A/B de persona en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base (8B). En FP16 se requieren aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits unos 8-9 GB, y en 4 bits unos 5-6 GB. El adaptador LoRA añade un coste marginal (repo de 0,1 GB).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo y concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización; RTX 3090/4080 (16-24 GB) en cuantización 8 bits.
- ¿Cabe en consumer GPU? Sí, en GPUs de 24 GB con cuantización o FP16 con contexto limitado; en GPUs de 12-16 GB solo con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), text-generation-inference (etiqueta declarada), vLLM (soporte de LoRA), llama.cpp/Ollama si se convierte el modelo base y se fusiona el adaptador. No se documenta compatibilidad verificada con todas ellas.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Persona-LORA (este) | 8B base + LoRA | no disponible | apache-2.0 | safetensors (adaptador) | Fine-tuning de persona, sin benchmarks publicados |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | no disponible | no disponible en esta ficha | safetensors | Modelo base oficial de Kakao; referencia para comparar el efecto del adaptador |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista de tamaño similar, con benchmarks públicos y ecosistema amplio |
| Qwen2.5 7B Instruct | 7B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa multilingüe de tamaño similar con licencia permisiva |

La comparación directa de rendimiento no es posible porque este adaptador no publica benchmarks. Frente a los modelos base citados, la diferencia principal es que este repositorio es un adaptador de persona y no un modelo completo, por lo que su evaluación debe hacerse siempre en combinación con Kanana 1.5 8B Instruct.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y evaluación: no es posible verificar la calidad ni la reproducibilidad del adaptador.
- La model card declara únicamente inglés (`en`), aunque el modelo base está orientado a coreano e inglés; el comportamiento en coreano no está garantizado.
- Riesgo de alucinación heredado del modelo base, no mitigado ni evaluado en el adaptador.
- Sesgos potenciales introducidos por el dataset de persona, desconocido; no se documenta ninguna evaluación de sesgo.
- Licencia Apache 2.0 declarada para el adaptador, pero conviene verificar la licencia del modelo base Kanana antes de uso comercial, ya que la model card no la detalla.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni señales de uso en producción.
- El adaptador no es un modelo autónomo: requiere cargar el modelo base, lo que implica cumplir también sus requisitos de hardware y licencia.
- No se documenta compatibilidad verificada con vLLM, llama.cpp u Ollama; el despliegue en esos motores requeriría fusión del adaptador y pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/ysangeeeeeee/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
