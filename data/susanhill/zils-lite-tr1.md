# SusanHill/zils-lite-tr1

## Resumen

zils-lite-tr1 es un ajuste fino mediante LoRA de rango 16 sobre el modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario SusanHill bajo el paraguas del proyecto "zils". El modelo se presenta como un "d3-lite soup body" afinado sobre la partición de entrenamiento pública de diversas tareas de decisión y razonamiento, con el objetivo declarado de mejorar la capacidad de decisión en entornos de function calling y razonamiento de sentido común. Con 852.985.920 parámetros totales (aproximadamente 853 millones), se sitúa en la gama ultraligera de modelos de lenguaje, lo que lo hace apto para despliegues con recursos muy limitados.

La propuesta técnica consiste en especializar un modelo base pequeño mediante datos supervisados con etiquetas gold procedentes de conjuntos como Glaive function calling (elección de llamada, decisión de invocar, recuento de argumentos rellenables), Social IQa, CommonsenseQA, PIQA, GSM8K y tareas de entrenamiento de BIG-bench, complementado con "self-distilled replay" sobre otras categorías para mitigar el olvido catastrófico. La licencia Apache-2.0 y el formato safetensors facilitan su integración en pipelines comerciales, aunque la información pública disponible es extremadamente escasa.

La relevancia actual del modelo radica en su tamaño reducido y su orientación a tareas de decisión estructurada, un nicho donde los modelos pequeños especializados pueden competir con modelos mucho mayores en tareas acotadas de clasificación de intenciones o selección de herramientas. No obstante, la ausencia de benchmarks publicados, de documentación detallada y de un pipeline declarado limita seriamente cualquier evaluación rigurosa de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B), con código personalizado (custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se distribuye con la etiqueta `custom_code`, lo que implica que la carga requiere confiar en código remoto o revisar los módulos personalizados incluidos en el repositorio. El ajuste se realizó mediante LoRA de rango 16 sobre el "d3-lite soup body", es decir, sobre una mezcla de pesos (model soup) del proyecto zils, lo que sugiere que el punto de partida no es el Qwen3.5-0.8B original sino una combinación previa de checkpoints afinados.

El entrenamiento combina dos fuentes: por un lado, la partición de entrenamiento pública de herramientas de function calling de Glaive, con etiquetas gold para tres subtareas (elección de llamada, decisión de invocar en el momento actual y recuento de argumentos rellenables); por otro, ítems de razonamiento de Social IQa, CommonsenseQA, PIQA, GSM8K y tareas de entrenamiento de BIG-bench, también con etiquetas gold. Adicionalmente se aplicó "self-distilled replay" sobre otras categorías, una técnica de repetición de datos generados por el propio modelo para preservar capacidades previas y reducir el olvido catastrófico. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de sentido común, orientado a tareas de decisión estructurada.
- Function calling: selección de herramienta, decisión de invocación y recuento de argumentos rellenables, según los datos de Glaive empleados en el ajuste.
- Razonamiento aritmético básico, derivado del entrenamiento sobre GSM8K.
- Razonamiento físico y de sentido común cotidiano, por los datos de PIQA y Social IQa.
- Clasificación y respuesta a preguntas de opción múltiple, por CommonsenseQA y tareas de BIG-bench.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Soporte de agentes multi-paso: no documentado explícitamente, aunque la orientación a decisión de llamadas sugiere uso en pipelines de agentes simples.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la petición del usuario y decidir qué herramienta invocar, gracias a su ajuste específico sobre la subtarea de elección de llamada de Glaive; su tamaño de 853 millones permite ejecutarlo en CPU o GPU modesta con latencia baja.
- Decisión de invocación en pipelines de agentes: dado un contexto de conversación, determinar si procede realizar una llamada a función en el turno actual, una tarea binaria donde el ajuste con etiquetas gold de "call-now" aporta señal directa.
- Validación de argumentos en sistemas de tool calling: estimar el número de argumentos rellenables de una llamada antes de ejecutarla, útil como paso de verificación en orquestadores de herramientas.
- Filtrado y clasificación de preguntas de sentido común: uso en sistemas de moderación o enrutamiento que requieran evaluar si una consulta es respondible con conocimiento cotidiano, apoyándose en el entrenamiento sobre CommonsenseQA y Social IQa.
- Preprocesamiento en pipelines de razonamiento matemático: como primer paso para detectar y clasificar problemas aritméticos simples (GSM8K) antes de derivarlos a un modelo mayor.
- Despliegue en entornos con recursos limitados: al tratarse de un modelo de menos de mil millones de parámetros y 1,7 GB en safetensors, puede ejecutarse en dispositivos edge, portátiles sin GPU dedicada o contenedores con poca memoria, sirviendo como clasificador especializado dentro de una arquitectura de modelos en cascada.
- Evaluación comparativa interna de técnicas de ajuste: su naturaleza de LoRA-16 sobre un model soup lo convierte en un caso de estudio para equipos que investiguen mezclas de pesos y destilación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para pesos, más overhead; viable en GPUs consumer con 4 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque no se documentan artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también tarjetas de gama de entrada y aceleradores integrados. Para despliegues de alta concurrencia, una A100 o H100 estaría infrautilizada por el tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: al requerir `custom_code`, la carga mediante vLLM, TGI o llama.cpp no está garantizada sin adaptación; la vía más segura es transformers con `trust_remote_code=True`. No se documentan integraciones con Ollama ni artefactos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-tr1 | 853 M | No disponible | Apache-2.0 | Hugging Face, requiere custom_code |
| Qwen3.5-0.8B (base) | ~800 M | No disponible en la informacion | No disponible en la informacion | Hugging Face |
| Modelos de la gama sub-1B (p. ej. Llama 3.2 1B, Gemma 3 1B) | 1.000-1.200 M | No disponible en la informacion | Licencias comunitarias respectivas | Hugging Face |

La comparación de rendimiento con alternativas no es posible: no se han publicado benchmarks del modelo ni datos verificables de sus capacidades frente a otros modelos de tamaño similar. La principal diferencia frente al Qwen3.5-0.8B original es el ajuste LoRA sobre tareas de decisión y razonamiento, cuyo impacto cuantitativo se desconoce.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a alternativas.
- Riesgo de olvido catastrófico parcial: aunque se aplicó self-distilled replay, el ajuste LoRA sobre un subconjunto estrecho de tareas puede degradar capacidades generales del modelo base.
- Riesgo de alucinación inherente a un modelo de 853 millones de parámetros, especialmente en generación abierta y razonamiento multi-paso.
- Sesgos conocidos: no documentados; al entrenarse sobre datasets públicos de sentido común y function calling, puede heredar sesgos de dichos corpus.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado en castellano ni en idiomas distintos del inglés de los datasets de entrenamiento.
- Longitud de contexto no documentada: no es posible planificar despliegues que requieran ventanas largas sin verificarla experimentalmente.
- Dependencia de `custom_code`: la carga requiere ejecutar código remoto del repositorio, lo que supone un riesgo de seguridad en entornos de producción y complica la auditoría.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene verificar por separado.
- Metadatos incompletos: sin pipeline declarado, sin idiomas, sin cuantizaciones oficiales y con cero descargas, lo que indica ausencia de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-26), lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-lite-tr1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset Glaive function calling: no disponible en la informacion proporcionada
- Paper o blog del proyecto zils: no disponible en la informacion proporcionada
- Repositorio de código: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
