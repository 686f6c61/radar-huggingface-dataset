# Yad4o/skincare-assistant-optimized-lora

## Resumen

Skincare Assistant Optimized LoRA es un adaptador PEFT de tipo LoRA desarrollado por el usuario Yad4o sobre el modelo base `unsloth/Qwen3.5-0.8B`. Su propósito es especializar un modelo causal de lenguaje de pequeno tamano (0,8 mil millones de parametros) en la generacion de respuestas informativas sobre cuidado de la piel y consultas dermatologicas. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que deben combinarse con el modelo base para su uso.

El adaptador se presenta como la version optimizada de un trabajo anterior (`Yad4o/skincare-assistant-lora`), con tres cambios principales: el modelo base pasa de Qwen 1.7B a Qwen 3.5 0.8B, el rango LoRA se incrementa de 16 a 32 y el dataset de entrenamiento se amplia con categorias multiturno y de experto. El entrenamiento se realizo con Unsloth y TRL sobre una GPU de Google Colab, con 3 epocas y una longitud maxima de secuencia de 1024 tokens.

La relevancia del proyecto es limitada pero ilustrativa: demuestra el flujo completo de especializacion de un modelo pequeno mediante LoRA para un dominio vertical sanitario, con un coste de entrenamiento muy bajo. No obstante, el autor advierte explicitamente de que el modelo es solo informativo y no sustituye el consejo medico profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer decoder-only) con adaptador LoRA sobre el modelo base |
| Parametros totales | No disponible (el adaptador LoRA es de bajo rango; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento uso secuencias de 1024 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer causal decoder-only (Qwen 3.5 0.8B) mediante LoRA con rango r=32, alpha=32 y dropout 0. Los modulos objetivo son las proyecciones de atencion y MLP de las capas del lenguaje: q, k, v, o, gate, up y down. Esta configuracion cubre tanto la atencion como las capas feed-forward, lo que permite una adaptacion relativamente amplia del comportamiento del modelo base con un numero reducido de parametros entrenables.

El entrenamiento se realizo con el framework Unsloth y TRL sobre una GPU de Google Colab, durante 3 epocas, con tasa de aprendizaje 2e-4, batch size efectivo de 16 (8 por dispositivo con acumulacion de 2) y longitud maxima de secuencia de 1024 tokens. El dataset empleado, denominado `lora_health_dataset`, incluye categorias multiturno y de experto en cuidado de la piel. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la informacion disponible solo indica ajuste supervisado mediante LoRA.

## Capacidades

- Generacion de texto conversacional en ingles sobre temas de cuidado de la piel y dermatologia.
- Respuestas informativas sobre ingredientes cosmeticos (por ejemplo, niacinamida) y su uso segun el tipo de piel.
- Soporte de conversaciones multiturno, segun la ampliacion del dataset de entrenamiento.
- Formato de chat compatible con la plantilla del modelo base Qwen 3.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Asistente informativo de cuidado de la piel: el adaptador puede responder preguntas frecuentes sobre rutinas, ingredientes y tipos de piel en un chat de soporte, usando el modelo base Qwen 3.5 0.8B por su bajo coste de inferencia.
- Triaje informativo en aplicaciones de bienestar: puede ofrecer orientacion general sobre habitos de cuidado cutaneo antes de derivar al usuario a un profesional, siempre con el aviso medico correspondiente.
- Generacion de contenido educativo: redaccion de fichas divulgativas sobre activos cosmeticos (retinol, acido hialuronico, niacinamida) para blogs o newsletters, con revision humana obligatoria.
- Prototipado rapido de chatbots verticales: sirve como base para experimentar con adaptadores LoRA en dominios sanitarios sin requerir GPUs de gran capacidad, dado el tamano reducido del modelo base.
- Investigacion sobre especializacion de modelos pequenos: util como caso de estudio de fine-tuning con Unsloth y TRL en entornos con recursos limitados (Google Colab).
- Asistente de primera linea en comercio electronico de cosmetica: respuestas sobre compatibilidad de productos y rutinas, integrado en un flujo de atencion al cliente con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,1 GB (tamano del repositorio), pero requiere cargar el modelo base Qwen 3.5 0.8B para la inferencia.
- VRAM estimada para el modelo base en fp16: en torno a 1,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB para inferencia comoda con secuencias cortas.
- En cuantizacion de 8 bits o 4 bits (si se aplica al modelo base) el consumo puede reducirse por debajo de 1-2 GB, aunque el autor no documenta cuantizaciones especificas.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas con suficiente memoria compartida, dado el reducido tamano del modelo base.
- El autor entreno en una GPU de Google Colab, lo que confirma que el flujo completo es viable en hardware de gama media.
- Opciones de despliegue: transformers con PEFT (segun el ejemplo de la model card), y previsiblemente llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; no se documenta soporte explicito de vLLM o TGI para este adaptador.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| Skincare Assistant Optimized LoRA (este) | Base 0,8B + LoRA r=32 | No disponible (entrenado a 1024) | Apache 2.0 | Adaptador LoRA | HuggingFace, 24 descargas |
| Yad4o/skincare-assistant-lora (predecesor) | Base 1,7B + LoRA r=16 | No disponible | No disponible en la informacion | Adaptador LoRA | HuggingFace |
| Qwen3.5-0.8B (modelo base) | 0,8B | No disponible en la informacion | No disponible en la informacion | Causal LM completo | HuggingFace (unsloth) |

La comparativa con alternativas de la misma categoria (adaptadores LoRA dermatologicos) no esta disponible en la informacion proporcionada. El predecesor directo es el unico termino de comparacion documentado, con menor rango y modelo base distinto.

## Limitaciones y advertencias

- El propio autor declara que el modelo es solo informativo y no sustituye el consejo, diagnostico ni tratamiento medico profesional.
- Riesgo de inexactitudes y alucinaciones en contenido sanitario, con posibles consecuencias para la salud del usuario si se usa sin supervision.
- No ha sido probado en todos los tipos de piel, segun la model card.
- Idioma limitado al ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto de entrenamiento de 1024 tokens, lo que limita conversaciones largas y documentos extensos.
- Modelo base de muy reducido tamano (0,8B), con capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos mayores.
- Aunque la licencia es Apache 2.0, el uso en produccion sanitaria requeriria validacion clinica y cumplimiento normativo adicional (por ejemplo, regulacion de dispositivos medicos), no cubiertos por la licencia.
- Solo 24 descargas y 0 likes en el momento de la consulta: proyecto de baja madurez y escasa validacion comunitaria.
- No se documentan sesgos especificos, pero al derivar de un modelo general entrenado predominantemente en ingles puede heredar sesgos de ese corpus.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Yad4o/skincare-assistant-optimized-lora
- Predecesor: https://huggingface.co/Yad4o/skincare-assistant-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
