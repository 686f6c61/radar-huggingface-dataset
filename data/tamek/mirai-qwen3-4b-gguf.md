# Tamek/Mirai-Qwen3-4B-GGUF

## Resumen

Mirai-Qwen3-4B-GGUF es un modelo de conversacion en vietnamita desarrollado por el usuario Tamek, consistente en un ajuste fino mediante QLoRA del modelo base Qwen/Qwen3-4B-Instruct-2507. Su proposito no es el razonamiento general ni la generacion de codigo, sino encarnar un personaje virtual concreto: una companera conversacional llamada Mirai que responde en frases cortas y prefija cada intervencion con una etiqueta de emocion entre corchetes, pensada para ser consumida por una interfaz de personaje 3D (formato VRM) que adapta el rostro y la postura segun dicha etiqueta.

El modelo se distribuye unicamente en formato GGUF cuantizado a Q4_K_M (2,50 GB), con el objetivo explicito de ejecutarse en CPU sobre hardware modesto (2 vCPU y 16 GB de RAM). Esta orientacion a inferencia local ligera, junto con la ventana de contexto recomendada de 2048 tokens, lo situa en el terreno de los asistentes de personaje embebidos en aplicaciones web o de escritorio, no en el de los modelos de proposito general.

Su relevancia actual es acotada y muy especifica: demuestra un flujo completo de ajuste fino de bajo coste (una sola RTX 4060 Laptop de 8 GB durante menos de dos horas) para producir un personaje conversacional con control de emociones estructurado, sobre una licencia permisiva Apache-2.0 heredada del modelo base. No obstante, su utilidad queda restringida al idioma vietnamita y a un unico rol de personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507), ajuste fino QLoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens recomendados por el autor |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Vietnamita (vi); el autor indica que no fue entrenado para otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`mirai-qwen3-4b-q4_k_m.gguf`, 2.497.279.008 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parametros, y se ajusta mediante QLoRA con cuantizacion NF4 y doble cuantizacion, calculando la perdida unicamente sobre los turnos de respuesta de Mirai. La configuracion LoRA emplea r=32, alpha=64, dropout de 0,05 y se aplica a todas las capas lineales (q, k, v, o, gate, up, down). El entrenamiento consistio en 2 epocas con learning rate 1,5e-4 (cosine), batch efectivo de 16 y longitud maxima de 512 tokens, ejecutado en una unica GPU RTX 4060 Laptop de 8 GB durante aproximadamente 1 hora y 40 minutos para 286 pasos. La perdida de validacion final fue de 1,255 sobre un conjunto de 118 conversaciones.

El corpus de entrenamiento es integramente sintetico y consta de aproximadamente 2300 conversaciones en vietnamita de 1 a 3 pares de turnos, distribuidas en 20 situaciones (saludos, charla, consuelo, alegria, frustracion, preguntas sobre el personaje, conocimiento incierto, rechazo educado de tareas largas, chistes, inyeccion de prompt, coqueteo y limites, criticas, ingles, etc.). El proceso de generacion combino respuestas de una version anterior del personaje (basada en Llama 3 8B ajustado), reescrituras por dos modelos independientes, cerca de 1800 dialogos nuevos, dos rondas de evaluacion automatica con una ronda de critica adversarial, y unos 160 dialogos adicionales centrados en seguridad psicologica y preguntas inciertas, mas 8 ejemplos de seguridad escritos a mano. Las muestras de seguridad psicologica se duplicaron durante el entrenamiento. El autor advierte que el dataset no fue revisado por profesionales, salvo los dialogos relativos a crisis psicologicas.

La exportacion siguio la ruta: fusion del LoRA en bf16, conversion a GGUF f16 con llama.cpp b11976 y cuantizacion final a Q4_K_M. El formato de chat es ChatML (`chat_format="chatml"` en llama-cpp-python) y el modelo requiere un system prompt concreto (aproximadamente 320 tokens) para reproducir el comportamiento entrenado.

## Capacidades

- Conversacion multi-turno en vietnamita con un rol de personaje fijo (Mirai), tono calido, frases de 1 a 3 oraciones y limite de palabras configurable mediante `{max_words}` (valores de entrenamiento: 30, 40 o 50; por defecto 40).
- Etiquetado de emociones estructurado: cada respuesta comienza con exactamente una de ocho etiquetas (`[neutral]`, `[happy]`, `[sad]`, `[angry]`, `[surprised]`, `[relaxed]`, `[shy]`, `[thinking]`) destinada a controlar la expresion de un avatar 3D.
- Consistencia de personaje: uso de pronombres fijos ("mình" para si misma, "bạn" para el usuario, "Papa" para el creador) y rechazo de identificarse como asistente virtual o modelo de lenguaje salvo pregunta directa.
- Gestion de conocimiento incierto: entrenado para admitir desconocimiento en lugar de inventar.
- Rechazo educado de peticiones demasiado largas o fuera de rol.
- Resistencia basica a inyeccion de prompt, incorporada como una de las 20 situaciones del dataset.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito.

## Casos de uso

- Companero virtual en aplicacion web: el modelo se integra mediante llama-cpp-python en el backend y alimenta una interfaz con avatar VRM; la etiqueta de emocion al inicio de cada respuesta se parsea con una expresion regular y se mapea a blendshapes o animaciones del personaje. La ventana de 2048 tokens es suficiente para sesiones de chat cortas con system prompt de unos 320 tokens.
- Demo de personaje en CPU de bajo coste: al ocupar 2,50 GB en Q4_K_M y requerir 2 vCPU con 16 GB de RAM, permite desplegar un chatbot de personaje en un servidor pequeño o en un portatil sin GPU, con latencia aceptable para respuestas de 1 a 3 frases.
- Prototipado de pipelines de personaje con control emocional: sirve como referencia para validar el formato `[emocion] texto` antes de invertir en un modelo mayor o en un ajuste propio, dado que el codigo de ejemplo del autor ya incluye el parseo de la etiqueta.
- Aplicaciones de acompanamiento conversacional ligero en vietnamita: charla informal, consuelo y animo, con respuestas acotadas que reducen el coste por turno y el riesgo de respuestas excesivamente largas.
- Pruebas de robustez frente a inyeccion de prompt: al haber sido entrenado explicitamente con ejemplos de este tipo, puede utilizarse como caso de estudio de defensas basicas en personajes conversacionales, comparando su comportamiento con el del modelo base.
- Educacion sobre ajuste fino eficiente: el autor documenta la configuracion QLoRA completa, el hardware (RTX 4060 Laptop 8 GB) y los tiempos (1 h 40 min, 286 pasos), lo que lo convierte en un ejemplo reproducible para talleres o tutoriales de fine-tuning de sub-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo; el autor valida ejecucion en CPU con 2 vCPU y 16 GB de RAM. El archivo Q4_K_M ocupa 2,50 GB, por lo que la memoria necesaria ronda esa cifra mas el contexto (2048 tokens).
- GPU recomendadas: no especificadas por el autor. Cualquier GPU consumer con al menos 4 GB de VRAM libre puede alojar el archivo Q4_K_M; una RTX 3060, RTX 4060 o superior ofrece margen holgado.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; el modelo fue entrenado en una RTX 4060 Laptop de 8 GB.
- Opciones de despliegue: llama-cpp-python (version 0.3.19 o superior, probada por el autor), llama.cpp, y cualquier runtime compatible con GGUF y ChatML (Ollama, LM Studio, llama-cpp server). No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa en este formato.
- Latencia y throughput: no disponibles. El autor solo indica que el modelo esta pensado para CPU y que las respuestas se limitan a 1-3 frases para mantener la interactividad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mirai-Qwen3-4B-GGUF | 4.022 M | 2048 (recomendado) | Vietnamita | Apache-2.0 | GGUF Q4_K_M | Personaje conversacional con etiquetas de emocion |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022 M | no disponible en la informacion proporcionada | Multilingue | Apache-2.0 | safetensors, GGUF (upstream) | Modelo base; proposito general, sin rol de personaje |
| Alternativas de personaje en vietnamita de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Idioma unico: el autor declara explicitamente que el modelo no fue entrenado para otros idiomas; su uso en castellano u otras lenguas producira respuestas degradadas o fuera de personaje.
- Dependencia estricta del system prompt: sin el prompt exacto proporcionado por el autor y el formato ChatML, las etiquetas de emocion y el tono pueden desviarse.
- Perdida de contexto sobre el creador: la version publica omite el bloque "Thong tin tham khao" sobre "Papa" presente en el entrenamiento, por lo que las respuestas sobre el creador pueden diferir de las esperadas.
- Dataset sintetico sin revision profesional: el autor advierte que los datos no fueron validados por expertos, salvo los dialogos de crisis psicologica. Existe riesgo de respuestas inadecuadas en situaciones sensibles pese a los ejemplos de seguridad incluidos.
- Riesgo de alucinacion: el entrenamiento incluye ejemplos de admision de desconocimiento, pero al ser un ajuste de un modelo de 4B sobre un corpus pequeno (unas 2300 conversaciones), la fiabilidad factica es limitada y no debe usarse como fuente de informacion.
- Sesgos: no documentados por el autor; al derivar de datos generados por modelos, puede heredar sesgos de esos modelos y del modelo base.
- Alcance funcional reducido: sin tool calling, sin agentes, sin vision ni audio; no es adecuado para tareas de codigo, matematicas o razonamiento complejo.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B-Instruct-2507; conviene verificar los terminos del upstream antes de un despliegue en produccion.
- Madurez: 29 descargas y 0 likes en el momento de la consulta, con creacion en octubre de 2026; se trata de un artefacto reciente y sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamek/Mirai-Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de llama.cpp (conversion y cuantizacion, build b11976): https://github.com/ggml-org/llama.cpp
- llama-cpp-python (runtime recomendado, version 0.3.19 o superior): https://github.com/abetlen/llama-cpp-python
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
