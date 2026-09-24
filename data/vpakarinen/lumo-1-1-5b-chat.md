# vpakarinen/Lumo-1-1.5B-Chat

## Resumen

Lumo-1-1.5B-Chat (denominado Lumo-1-Chat en la model card) es un ajuste fino completo (full fine-tune) del modelo swiss-ai/Apertus-v1.1-1.5B-Instruct, publicado por el usuario vpakarinen en HuggingFace. Se trata de un modelo conversacional de aproximadamente 1,51 mil millones de parametros (1.510.019.104 exactos segun los pesos safetensors) con licencia Apache 2.0 y soporte unicamente para ingles.

El modelo parte de la familia Apertus, desarrollada por Swiss AI (organizacion swiss-ai en HuggingFace), y se ha entrenado sobre 1000 ejemplos de pregunta-respuesta cuidadosamente seleccionados. El dataset cubre preguntas factuales, explicaciones, reescritura y consejos cotidianos. El autor lo describe como disenado para prompts conversacionales cortos y advierte que el uso en entornos reales todavia no se ha evaluado.

Su relevancia es limitada pero concreta: representa un ejemplo de fine-tuning de bajo coste sobre un modelo base pequeno y abierto, util para experimentacion, prototipado y como punto de partida para ajustes posteriores. Es importante no confundirlo con Lumo, el asistente de IA de Proton AG, un producto comercial distinto que aparece en los resultados de busqueda con el mismo nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base swiss-ai/Apertus-v1.1-1.5B-Instruct) |
| Parametros totales | 1.510.019.104 (~1,51 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se listan cuantizaciones oficiales) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del base swiss-ai/Apertus-v1.1-1.5B-Instruct, es decir, se han actualizado todos los pesos del modelo base en lugar de aplicar tecnicas de adaptacion de bajo rango (LoRA u similares). No se especifican en la informacion disponible detalles sobre la arquitectura interna (tipo de transformer, atencion, configuracion de capas), el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico dato de entrenamiento confirmado es el uso de 1000 ejemplos de pregunta-respuesta curados manualmente, con tematicas de preguntas factuales, explicaciones, reescritura y consejos cotidianos. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto conversacional orientada a prompts cortos.
- Responder preguntas factuales de caracter general.
- Elaborar explicaciones de conceptos sencillos.
- Reescribir texto segun una indicacion.
- Ofrecer consejos de la vida cotidiana.
- Interaccion en ingles unicamente.
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Prototipado rapido de chatbots: al ser un modelo de ~1,5B con licencia Apache 2.0, permite montar un asistente conversacional de pruebas en local sin coste de API, adecuado para validar flujos de producto antes de invertir en modelos mayores.
- Generacion de respuestas breves en ingles: util para sistemas de respuesta automatica con prompts cortos, donde el modelo puede producir contestaciones directas sobre preguntas factuales.
- Reescritura de textos: integrable en herramientas de edicion para reformular frases o parrafos segun una instruccion, una de las tareas cubiertas explicitamente por el dataset de entrenamiento.
- Asistente de consejos cotidianos: aplicable en demos o asistentes personales de bajo consumo que ofrezcan sugerencias simples, siempre con supervision y aviso de que el modelo no ha sido evaluado en uso real.
- Base para fine-tuning posterior: al ser un ajuste completo con licencia permisiva, sirve como punto de partida para especializaciones adicionales en dominios concretos.
- Inferencia en hardware modesto u on-device: su tamano reducido permite ejecutarlo en GPU de gama de consumo o incluso en CPU, util para escenarios de privacidad donde los datos no deben salir del dispositivo.
- Educacion y experimentacion: adecuado para practicas de ajuste fino, evaluacion y estudio de tecnicas de entrenamiento en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el autor indica explicitamente que el uso en el mundo real no ha sido evaluado.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (1,51B); no hay datos oficiales de latencia ni throughput.

- VRAM estimada en FP32: ~6,0 GB.
- VRAM estimada en FP16/BF16: ~3,0 GB.
- VRAM estimada en INT8: ~1,5 GB.
- VRAM estimada en INT4: ~0,8 GB.
- A las cifras anteriores hay que sumar el overhead de cache KV y activaciones, tipicamente 1-2 GB adicionales segun longitud de contexto y lote (el contexto maximo no esta documentado).
- Cabe en GPU de consumo: cualquier GPU con 6-8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060, RTX 4070) puede ejecutarlo con holgura en FP16.
- Ejecucion en CPU viable mediante llama.cpp u Ollama (requiere convertir los pesos a GGUF, ya que el repositorio solo publica safetensors).
- Opciones de despliegue: Hugging Face transformers, vLLM, TGI, llama.cpp y Ollama (estos dos ultimos previa conversion a GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| Lumo-1-1.5B-Chat | 1,51B | no disponible | Apache 2.0 | en | Fine-tune sobre 1000 ejemplos; sin benchmarks publicados |
| swiss-ai/Apertus-v1.1-1.5B-Instruct (base) | ~1,5B | no disponible | no disponible | no disponible | Modelo base del que deriva; familia Apertus |
| Qwen2.5-1.5B-Instruct | ~1,54B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | multilingue | Alternativa de tamano comparable en la misma categoria |
| SmolLM2-1.7B-Instruct | ~1,7B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | en | Alternativa de tamano comparable orientada a instrucciones |

Los datos de los modelos alternativos (Qwen2.5-1.5B-Instruct, SmolLM2-1.7B-Instruct) no proceden de la informacion proporcionada; se citan unicamente como referencias de la misma categoria de tamano y deben verificarse en sus respectivas fichas antes de usarse en una decision tecnica.

## Limitaciones y advertencias

- Entrenamiento sobre solo 1000 ejemplos: riesgo elevado de sobreajuste al estilo y contenido del dataset, con capacidad de generalizacion limitada fuera de esos temas.
- Sin evaluacion en uso real: el propio autor advierte que el comportamiento en produccion no se ha medido.
- Solo ingles: no hay soporte multilingue; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Riesgo de alucinacion: al ser un modelo pequeno y con poco ajuste, es probable que genere informacion factual incorrecta con aparente seguridad.
- Posible olvido catastrofico: el ajuste completo sobre un dataset reducido puede haber degradado capacidades del modelo base no cubiertas por los ejemplos de entrenamiento.
- Contexto desconocido: al no documentarse la longitud de contexto, no se recomienda su uso en tareas que requieran ventanas largas.
- Sin soporte documentado de tool calling, agentes, vision o audio.
- Contradiccion de nomenclatura: el nombre "Lumo" coincide con el asistente de IA de Proton AG, un producto sin relacion. Conviene no atribuir a este modelo informacion de ese servicio.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion; no incluye garantias.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vpakarinen/Lumo-1-1.5B-Chat
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct
- Asistente Lumo de Proton (producto distinto, sin relacion con este modelo): https://lumo.proton.me/
- Entrada de Lumo en Wikipedia (producto de Proton): https://en.wikipedia.org/wiki/Lumo_(AI_assistant)
- Documentacion de los modelos de Lumo de Proton: https://proton.me/support/lumo-models
- Anuncio de Lumo 1.1 de Proton: https://proton.me/blog/lumo-1-1
- Lista de modelos de IA gratuitos (mencion de Lumo): https://github.com/ClawLabsAI/free-ai-models
