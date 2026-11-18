# taobao-mnn/LFM2-1.2B-RAG-MNN

## Resumen

LFM2-1.2B-RAG-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2-1.2B-RAG, un modelo de 1.200 millones de parámetros especializado en respuesta a preguntas con recuperación aumentada (RAG). Lo publica el equipo taobao-mnn (Alibaba) dentro del ecosistema MNN, el motor de inferencia ligero de Alibaba pensado para ejecución en CPU y dispositivos de borde. El problema que resuelve es doble: por un lado, ofrece un modelo pequeño afinado específicamente para responder preguntas a partir de un documento de contexto; por otro, lo entrega ya cuantizado en 4 bits con HQQ y con los artefactos propietarios de MNN (`llm.mnn`, `llm.mnn.weight`, `tokenizer.mtok`), de modo que puede ejecutarse en CPU sin GPU.

El modelo base, LFM2-1.2B-RAG, pertenece a la familia LFM2 de Liquid AI, una arquitectura de tipo transformer con 16 capas y dimensión oculta de 2048 según la información del repositorio. La versión MNN conserva esa estructura y aplica cuantización HQQ de 4 bits con grupo de 64 tanto a las capas lineales del modelo de lenguaje como a la cabeza de salida, manteniendo las escalas de cuantización en FP16 y compartiendo los pesos de embedding con la cabeza de salida. El resultado es un paquete de 1,4 GB en el repositorio, pensado para ejecutarse por defecto en CPU con 4 hilos, `precision=low` y `memory=low`.

Su relevancia actual es acotada pero concreta: no compite con modelos frontera, sino que cubre el nicho de RAG local y de bajo coste sobre CPU, con licencia LFM Open License v1.0 (uso comercial condicionado a la sección 5) y soporte de chino e inglés. Es una pieza de infraestructura para despliegues en dispositivos sin acelerador dedicado, no un modelo generalista de propósito amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (16 capas, dimensión oculta 2048), según model card del repo MNN |
| Parametros totales | 1.2B (aproximado, derivado del nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, grupo 64 (capas lineales y cabeza de salida); escalas en FP16 |
| Idiomas soportados | zh, en |
| Licencia | LFM Open License v1.0 (lfm1-0), uso comercial condicionado a la sección 5 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizer `tokenizer.mtok`, configuración `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna completa del modelo base más allá de los datos de la model card del repositorio MNN: 16 capas de lenguaje y dimensión oculta de 2048, lo que encaja con un transformer de tamaño 1.2B. No se especifica si LFM2 incorpora innovaciones propias de la familia Liquid AI (como capas convolucionales o mecanismos híbridos) ni se documentan en esta ficha; cualquier afirmación al respecto sería especulativa. Tampoco se detalla el proceso de entrenamiento del modelo base: no hay información sobre número de tokens, composición del dataset ni si hubo RLHF, DPO o ajuste supervisado.

Lo que sí está documentado es el proceso de adaptación: el modelo base LiquidAI/LFM2-1.2B-RAG es un modelo afinado para question answering sobre documentos, y la versión MNN aplica cuantización HQQ de 4 bits con grupo 64 sobre las capas lineales del transformer y la cabeza de salida, con escalas en FP16 y embeddings compartidos con la cabeza de salida en 4 bits. La exportación se realizó con el runtime MNN y requiere una versión concreta del repositorio (commit `4756b19d51ddeaf0a73bbc9f230dea6d930f442e`, que incorpora la corrección de plantillas Jinja y tokens especiales del PR 5155). La validación se hizo el 17 de noviembre de 2026 sobre CPU x64, comprobando alineación de mapeo FP32, un caso de QA documental y una prueba de humo con la configuración por defecto.

## Capacidades

- Generación de texto condicionada a contexto: responde preguntas a partir de un documento incluido en el prompt, que es el caso de uso principal del modelo base.
- Question answering sobre documentos: el formato de uso documentado es `Context: ... Question: ...`, con muestreo greedy recomendado por el autor del modelo base.
- Soporte bilingüe chino e inglés, según los metadatos de idioma del repositorio.
- Ejecución en CPU: el paquete está diseñado para correr con 4 hilos, `precision=low` y `memory=low` en el runtime MNN.
- No hay información disponible sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- No hay información disponible sobre capacidades de generación de código o matemáticas más allá de lo que pueda heredar del modelo base, que no se documenta en esta ficha.

## Casos de uso

- RAG local sobre CPU en dispositivos de borde: el modelo está empaquetado para MNN con cuantización 4-bit y configuración de baja memoria, por lo que puede integrarse en aplicaciones de escritorio o dispositivos sin GPU para responder preguntas sobre documentación local.
- Asistente de consulta sobre bases documentales pequeñas: con el formato `Context: ... Question: ...` y decodificación greedy, sirve para responder preguntas frecuentes sobre manuales, políticas internas o documentación técnica acotada.
- Chatbot de atención al cliente con corpus controlado: al ser un modelo afinado para RAG, encaja en flujos donde las respuestas deben ceñirse a un contexto recuperado previamente, reduciendo el riesgo de respuestas fuera de dominio.
- Integración en aplicaciones móviles o de escritorio vía MNN: el runtime MNN está orientado a despliegue multiplataforma, y este paquete incluye los artefactos necesarios (`llm.mnn`, `tokenizer.mtok`, configuración) para integrarlo en una app nativa.
- Prototipado rápido de pipelines RAG sin infraestructura GPU: al caber en 1,4 GB de repositorio y ejecutarse en CPU, permite validar la lógica de recuperación y prompting antes de escalar a un modelo mayor.
- Procesamiento por lotes de bajo coste en servidores sin acelerador: para tareas de extracción de respuestas sobre documentos en chino o inglés donde la latencia no es crítica y se prioriza el coste por token.
- Evaluación comparativa de cuantización: útil para medir la degradación de calidad de HQQ 4-bit frente al modelo base en tareas de QA documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo documentado; el paquete está pensado para ejecución en CPU. El repositorio ocupa 1,4 GB, lo que da una idea del orden de magnitud de los pesos cuantizados.
- GPU recomendadas: no disponible. La model card no documenta ejecución en GPU.
- CPU: configuración por defecto de 4 hilos, `precision=low`, `memory=low`, validada en x64.
- ¿Cabe en GPU de consumo? No hay información sobre backend GPU en MNN para este paquete; el caso documentado es CPU.
- Opciones de despliegue: runtime MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es propietario de MNN.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-1.2B-RAG-MNN | 1.2B | no disponible | MNN (HQQ 4-bit) | LFM Open License v1.0 | Versión cuantizada para CPU del modelo RAG de Liquid AI |
| LiquidAI/LFM2-1.2B-RAG | 1.2B | no disponible | safetensors (presumiblemente, no confirmado) | LFM Open License v1.0 | Modelo base sin cuantizar; requiere framework estándar (transformers) |
| LFM2-1.2B | 1.2B | no disponible | no disponible | LFM Open License v1.0 | Modelo generalista de la misma familia, sin el ajuste específico para RAG |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo especializado: está afinado para QA sobre documentos; su uso como modelo generalista de conversación o generación creativa no está documentado y probablemente dé resultados pobres.
- Contexto limitado: no se especifica la longitud de contexto, lo que impide planificar prompts largos con garantías; conviene validar empíricamente el límite antes de producción.
- Idiomas: solo chino e inglés documentados; el rendimiento en castellano no está garantizado.
- Cuantización agresiva: HQQ 4-bit con grupo 64 introduce degradación respecto al modelo base; no se han publicado métricas de esa pérdida.
- Formato propietario: los pesos solo son utilizables con MNN, lo que limita la portabilidad a otros runtimes y añade dependencia del ecosistema de Alibaba.
- Dependencia de versión concreta del runtime: la model card exige un commit específico de MNN con correcciones de plantilla Jinja y tokens especiales; usar otra versión puede romper el formato de prompt.
- Licencia: LFM Open License v1.0 condiciona el uso comercial a la sección 5; es necesario revisar el texto completo antes de desplegar en producto.
- Riesgo de alucinación: inherente a los modelos de 1.2B en tareas RAG; el modelo puede responder con información no presente en el contexto, y no se documentan mecanismos de abstención.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Madurez: el repositorio tiene 74 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-1.2B-RAG-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B-RAG
- ModelScope: https://modelscope.cn/models/MNN/LFM2-1.2B-RAG-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- PR de MNN con corrección de plantilla Jinja y tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación de MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
