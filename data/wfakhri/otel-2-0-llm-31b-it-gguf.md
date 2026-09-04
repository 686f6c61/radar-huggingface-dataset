# wfakhri/OTel-2.0-LLM-31B-IT-GGUF

## Resumen

OTel-2.0-LLM-31B-IT es un modelo de instrucción especializado en telecomunicaciones, post-entrenado a partir de Gemma 4 31B-IT sobre aproximadamente 440 mil millones de tokens del dominio telco. Ha sido desarrollado por el Red Hat AI Innovation Team en colaboración con el ecosistema Open Telco AI, que incluye a GSMA, AT&T, Microsoft, Dell, AMD y Red Hat. Este repositorio en concreto ofrece las cuantizaciones GGUF del checkpoint original, realizadas por wfakhri con llama.cpp, listas para su uso en entornos de inferencia local con CPU o GPU.

El modelo aborda tareas como operación de red, interpretación de estándares, desarrollo de productos, asistencia en configuración de red, RAG y respuesta a preguntas específicas del sector. Arquitectónicamente es un Transformer multimodal (Gemma4ForConditionalGeneration) de 31B parámetros, aunque la modalidad entrenada es solo texto. El entrenamiento se realizó con una longitud máxima de secuencia de 4096 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (Transformer multimodal; entrenado solo en texto) |
| Parámetros totales | 31B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (límite de entrenamiento; contexto de inferencia no especificado) |
| Tipos de cuantización | No disponible (cuantizaciones GGUF de llama.cpp; tipos concretos no listados) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 31B-IT y ha sido post-entrenado mediante OSFT (Orthogonal Subspace Fine-Tuning), una técnica de continual learning desarrollada por el Red Hat AI Innovation Team. En lugar de entrenar un adaptador sobre pesos congelados o actualizar todas las direcciones de las matrices de pesos, OSFT descompone las matrices objetivo y aprende en un subespacio ortogonal a las direcciones que ya codifican el conocimiento del modelo base. Esto permite absorber nuevo conocimiento de dominio sin sufrir olvido catastrófico ni necesitar los datos originales de entrenamiento como conjunto de replay.

El parámetro clave es `unfreeze_rank_ratio`, fijado en 0.35 para este checkpoint, un valor deliberadamente conservador orientado a preservar las capacidades generales de seguimiento de instrucciones del modelo base. El entrenamiento se realizó durante 2 épocas, con un tamaño de lote efectivo de 512, una tasa de aprendizaje de 2e-5 con programación coseno, y una longitud máxima de secuencia de 4096 tokens. Se utilizó precisión FP32 para los pesos maestros, BF16 para el cómputo y estados de optimizador Adam de 8 bits. La infraestructura consistió en 8 GPU AMD MI355X (gfx950) con ROCm 7.2.1, en instalaciones de Dell Technologies.

El corpus de telecomunicaciones en bruto contiene unos 15 mil millones de tokens provenientes de GSMA a través de Open Telco AI. Estos datos se procesaron con el Synthetic Data Generation Hub (SDG Hub) de código abierto de Red Hat, generando más de 1 billón de tokens procesados, de los cuales se utilizaron alrededor de 440 mil millones para el entrenamiento. La mezcla de entrenamiento actual incluye preguntas-respuestas directas de telecomunicaciones, abstención, RAG, datos de estilo base-model y ejemplos generales de seguimiento de instrucciones y tool calling. Sin embargo, no incluye ejemplos específicos de telecomunicaciones para MCP, tool calling ni instruction following.

## Capacidades

- Generación de texto en inglés con enfoque en dominio telecomunicaciones.
- Razonamiento y respuesta a preguntas sobre estándares, operaciones de red y protocolos.
- Seguimiento de instrucciones general heredado del modelo base Gemma 4 31B-IT.
- Soporte de tool calling / function calling general, aunque la mezcla de entrenamiento no incluye ejemplos específicos de telecomunicaciones para ello.
- Arquitectura multimodal (texto + imagen) pero sin entrenamiento en la modalidad visual; solo se ha afinado en texto.
- Soporte para RAG orientado a documentación técnica telco.
- Capacidad de abstención ante preguntas fuera de dominio o con información insuficiente.
- Soporte de agentes y razonamiento multi-paso en contextos generales gracias al modelo base.

## Casos de uso

- Asistencia en operaciones de red: el modelo puede interpretar alarmas, logs y configuraciones de red para sugerir acciones correctivas, apoyándose en su conocimiento de dominio telco.
- Interpretación de estándares: consulta de especificaciones 3GPP, GSMA y documentos normativos para responder preguntas técnicas en lenguaje natural, útil para ingenieros y equipos de cumplimiento.
- Atención al cliente automatizada en el sector telco: gestión de conversaciones multi-turno sobre planes, cobertura y soporte técnico, con la capacidad de abstenerse cuando no tiene información fiable.
- Generación de documentación técnica: redacción de guías de configuración, informes de incidentes y documentación de productos basada en plantillas y datos de red.
- Recuperación aumentada por generación (RAG) sobre corpus interno: integración con bases de conocimiento de la empresa para responder preguntas específicas de red, reduciendo alucinaciones al citar fuentes.
- Asistencia en desarrollo de productos: apoyo en el diseño de soluciones de telecomunicaciones, respondiendo a cuestiones sobre arquitecturas de red, APIs y protocolos.
- Despliegue en producción como endpoint de inferencia: gracias a las cuantizaciones GGUF, puede ejecutarse en servidores con llama.cpp o en dispositivos edge, integrándose en pipelines de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Cálculo orientativo: para una cuantización Q4_K_M de un modelo de 31B se estiman en torno a 20 GB de VRAM; el checkpoint original en bf16 ocupa aproximadamente 62.6 GB.
- GPU recomendadas: para GGUF cuantizado, una RTX 4090 (24 GB) o una A100 40GB son suficientes; para el checkpoint bf16 original se recomienda A100 80GB o H100.
- En CPU: las cuantizaciones GGUF pueden ejecutarse en CPU con llama.cpp, aunque el rendimiento será inferior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base se puede servir con vLLM y está disponible en Microsoft Foundry, Featherless AI y Red Hat.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks para comparaciones directas. La siguiente tabla compara características conocidas con el modelo base y la variante QLoRA mencionada en la documentación:

| Modelo | Parámetros | Longitud de contexto | Licencia | Formato |
|---|---|---|---|---|
| OTel-2.0-LLM-31B-IT-GGUF (este) | 31B | 4096 (entrenamiento) | Apache 2.0 | GGUF |
| OTel-2.0-LLM-31B-IT (base) | 31B | No especificado | Apache 2.0 | safetensors bf16 |
| OTel-2.0-LLM-31B-IT-QLoRA | 31B | No especificado | Apache 2.0 | safetensors bf16 (adapter LoRA) |

## Limitaciones y advertencias

- El modelo solo ha sido entrenado en inglés; no soporta de forma nativa otros idiomas.
- Aunque es arquitectónicamente multimodal, la modalidad visual no ha sido afinada: las imágenes de entrada no se procesan correctamente para tareas de dominio telco.
- La mezcla de entrenamiento no incluye ejemplos específicos de telecomunicaciones para tool calling, MCP o instruction following, lo que puede limitar el rendimiento en esas tareas dentro del dominio telco.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje; se recomienda usar RAG y validación humana en aplicaciones críticas.
- El checkpoint está sujeto a actualizaciones semanales de pesos: para reproducción o producción, es necesario fijar una revisión específica, un hash del checkpoint o una etiqueta de release.
- El corpus de entrenamiento proviene principalmente de fuentes GSMA y Open Telco AI, lo que puede introducir sesgos hacia esos estándares y perspectivas.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Gemma 4 31B-IT si se redistribuye o se usa en productos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wfakhri/OTel-2.0-LLM-31B-IT-GGUF
- Modelo base: https://huggingface.co/farbodtavakkoli/OTel-2.0-LLM-31B-IT
- Paper OSFT: https://arxiv.org/abs/2504.07097
- Training Hub (Red Hat AI Innovation Team): https://github.com/Red-Hat-AI-Innovation-Team/training_hub
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/farbodtavakkoli--otel-2.0-llm-31b-it?search=otel
- Ficha en Inferix: https://inferix.co/models/farbodtavakkoli/OTel-2.0-LLM-31B-IT
- Licencia del modelo base Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
