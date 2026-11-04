# XinyiY1226/anysearch-port-qwen3.5-4b-think-s150

## Resumen

anysearch-port-qwen3.5-4b-think-s150 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario XinyiY1226 y publicado en HuggingFace. El modelo está especializado en tareas de agente de búsqueda (search-agent) y respuesta a preguntas multi-salto (multi-hop QA), y se ha entrenado mediante aprendizaje por refuerzo (reinforcement learning) con el framework verl, incorporando un mecanismo de gestión de presupuesto (budget-aware) que limita el número de llamadas a herramientas de búsqueda durante la inferencia.

El modelo parte de la arquitectura Qwen3.5 de 4B parámetros (4.539.265.536 parámetros reales según los pesos en safetensors) y hereda las capacidades del modelo base, incluyendo un modo de razonamiento explícito (thinking mode) que se refleja en el sufijo "think" del nombre. El ajuste se ha realizado sobre los datasets HotpotQA y MuSiQue, dos referencias clásicas en tareas de razonamiento multi-salto que requieren combinar información de múltiples documentos.

Su relevancia radica en que aborda un problema concreto y práctico: construir agentes de búsqueda que razonen de forma eficiente bajo restricciones de presupuesto computacional y de llamadas a herramientas. El modelo es de acceso restringido (gated) en HuggingFace y requiere aceptar las condiciones de uso antes de descargarlo. La licencia es Apache 2.0, lo que facilita su uso comercial con las obligaciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizaciones estándar del ecosistema, pero no se documenta) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer decoder-only con 4B parámetros. El ajuste fino se ha realizado mediante aprendizaje por refuerzo utilizando el framework verl, una biblioteca de RL para modelos de lenguaje orientada a entrenamiento de agentes. El nombre del modelo indica que se ha aplicado un esquema "budget-aware", es decir, que el entrenamiento penaliza o recompensa el uso de llamadas a herramientas de búsqueda en función de un presupuesto predefinido, lo que permite al modelo aprender a decidir cuándo merece la pena buscar información adicional y cuándo puede responder con el conocimiento interno.

Los datos de entrenamiento provienen de dos datasets de referencia en QA multi-salto: HotpotQA (dataset:hotpotqa/hotpot_qa) y MuSiQue (dataset:dgslibisey/MuSiQue). Ambos requieren razonamiento sobre múltiples documentos y son adecuados para entrenar habilidades de planificación, descomposición de preguntas y agregación de evidencia. El sufijo "s150" podría indicar el número de pasos de entrenamiento o de muestras, pero no se documenta explícitamente. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales más allá del RL con verl.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-salto: descomposición de preguntas complejas en subpreguntas y agregación de evidencia de múltiples fuentes.
- Agente de búsqueda (search-agent): capacidad de emitir llamadas a herramientas de búsqueda y procesar los resultados devueltos.
- Gestión de presupuesto (budget-aware): el modelo ha sido entrenado para operar bajo restricciones en el número de llamadas a herramientas, priorizando respuestas eficientes.
- Modo de razonamiento explícito (thinking mode): el sufijo "think" sugiere que el modelo puede generar cadenas de razonamiento antes de responder, aunque no se detalla el formato exacto.
- Soporte de tool calling / function calling: implícito en su naturaleza de agente de búsqueda, aunque no se especifica el esquema exacto de herramientas compatible.
- Capacidades multilingües: limitadas al inglés según la tarjeta del modelo.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- **Atención al cliente con base de conocimiento**: el modelo puede gestionar consultas que requieren combinar información de varios documentos (por ejemplo, políticas de devolución y estado de pedidos), usando llamadas a búsqueda controladas por presupuesto para no degradar la latencia.
- **Asistentes de investigación documental**: dado un corpus de artículos o informes, el modelo descompone preguntas complejas en subconsultas, recupera fragmentos relevantes y sintetiza una respuesta con evidencia multi-salto, aprovechando su entrenamiento en HotpotQA y MuSiQue.
- **Verificación de hechos (fact-checking)**: el agente puede buscar en múltiples fuentes para contrastar una afirmación, con un límite de llamadas que evita bucles infinitos y controla el coste de API.
- **Pipelines de RAG (Retrieval-Augmented Generation)**: integrado como generador final o como planificador de consultas, el modelo decide cuándo ampliar la recuperación y cuándo responder con el contexto ya disponible, reduciendo llamadas innecesarias al retriever.
- **Automatización de soporte técnico interno**: para preguntas sobre documentación técnica distribuida en wikis y manuales, el modelo puede orquestar búsquedas secuenciales y responder con pasos concretos, manteniendo un presupuesto de herramientas acotado.
- **Evaluación y generación de preguntas multi-salto**: el modelo puede utilizarse para generar preguntas complejas a partir de un corpus y para evaluar respuestas de otros sistemas en tareas de razonamiento multi-documento.
- **Agentes autónomos de consulta web**: en entornos donde se dispone de una API de búsqueda, el modelo puede actuar como planificador que decide las consultas, las ejecuta y sintetiza el resultado final con trazabilidad de fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4.539 millones de parámetros, en FP16 se requieren aproximadamente 9,1 GB solo para los pesos, más overhead de activaciones y KV cache (dependiente de la longitud de contexto, no documentada). En cuantización de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB.
- **GPU recomendadas**: para FP16, una GPU con 16-24 GB de VRAM (RTX 4090, A10G, L4, A100 40GB). Para cuantización 4 bits, cabe en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060) con contexto moderado.
- **Cabe en consumer GPU**: sí, especialmente con cuantización GGUF/AWQ/GPTQ de 4 u 8 bits. En FP16 requiere una GPU de gama alta consumer o profesional.
- **Opciones de despliegue**: vLLM, TGI (Text Generation Inference), llama.cpp (previa conversión a GGUF), Ollama (previa conversión), y el stack de HuggingFace Transformers. Al ser un modelo basado en Qwen3.5, es probable que las herramientas compatibles con la familia Qwen funcionen, aunque no se documenta explícitamente.
- **Latencia y throughput estimados**: no disponibles. Dependen en gran medida del hardware, la cuantización y la longitud de contexto, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anysearch-port-qwen3.5-4b-think-s150 | 4,54B | no disponible | Agente de búsqueda multi-salto, budget-aware | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo generalista | Apache 2.0 (según modelo base) | Público en HuggingFace |
| Modelos de agente de búsqueda de 7B (p. ej., variantes de Search-R1) | ~7B | variable | Agente de búsqueda con RL | variable (MIT/Apache) | Público |
| Modelos generalistas de 3-4B (p. ej., Llama 3.2 3B, Phi-3.5-mini) | 3-4B | 128K en algunos casos | Generación general, tool calling | Llama license / MIT | Público |

La comparativa directa con alternativas específicas de agente de búsqueda es limitada porque no se han publicado benchmarks de este modelo. Frente al Qwen3.5-4B base, este ajuste añade la especialización en búsqueda multi-salto y el control de presupuesto, a costa de un enfoque más restringido al inglés y a tareas de QA. Frente a modelos de 7B especializados en búsqueda, ofrece un tamaño menor que reduce los requisitos de hardware, aunque se desconoce su rendimiento relativo.

## Limitaciones y advertencias

- **Idioma**: el modelo solo declara soporte para inglés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Sesgos**: al entrenarse sobre HotpotQA y MuSiQue, puede heredar sesgos de esos corpus (predominantemente en inglés, con temáticas de Wikipedia y posibles desequilibrios de cobertura).
- **Riesgo de alucinación**: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente cuando el presupuesto de búsqueda se agota y debe responder con conocimiento interno.
- **Dependencia de herramientas**: su diseño como agente de búsqueda implica que su rendimiento óptimo requiere integrar una API de búsqueda compatible; sin ella, su ventaja frente al modelo base se reduce.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto, lo que dificulta planificar despliegues con documentos largos o historiales extensos.
- **Acceso restringido**: el repositorio es gated; es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos, lo que puede añadir fricción en pipelines automatizados.
- **Licencia Apache 2.0**: permite uso comercial, pero exige conservar el aviso de licencia y atribución; además, el modelo base Qwen3.5-4B puede tener sus propias condiciones que deben respetarse.
- **Madurez**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validación externa ni de uso en producción.
- **Formato de pesos**: solo se publican safetensors; no se proporcionan versiones GGUF, AWQ o GPTQ, por lo que la cuantización requiere conversión manual.

## Enlaces

- HuggingFace: https://huggingface.co/XinyiY1226/anysearch-port-qwen3.5-4b-think-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Framework verl: no disponible en la información proporcionada (se menciona en los tags, sin enlace directo)
- Paper de MuSiQue: no disponible en la información proporcionada
- Paper de HotpotQA: no disponible en la información proporcionada
