# tinystudio/bubble-qwen3.5-2b

## Resumen

Bubble-Qwen3.5-2B es un modelo de lenguaje de aproximadamente 1.880 millones de parámetros (1,88 B) desarrollado por tinystudio como un ajuste fino (fine-tuning) mediante LoRA sobre el modelo base Qwen3.5-2B de Alibaba. Su propósito es muy específico: actuar como motor de parsing estructurado de tareas para la aplicación "Bubble Todo" (泡泡清单), convirtiendo lenguaje natural coloquial en chino en arrays JSON estrictos con ocho campos definidos. No es un modelo de propósito general, sino un modelo de tarea (task-specific) optimizado para extracción de entidades y razonamiento temporal relativo.

El modelo se distribuye en formato GGUF cuantizado a Q4_K_M (aproximadamente 1,2 GB) para inferencia en dispositivo (on-device), con especial énfasis en Apple Silicon, donde el autor reporta velocidades de hasta 65 tokens/s. También incluye pesos en formato MLX y un adaptador LoRA, lo que permite despliegue tanto en entornos Apple como en pipelines llama.cpp. Su relevancia radica en la tendencia de modelos pequeños y especializados que sustituyen llamadas a APIs en la nube para tareas de baja latencia y privacidad en el dispositivo.

La licencia Apache-2.0 permite uso comercial sin restricciones significativas, aunque el modelo está entrenado y evaluado exclusivamente en chino e inglés, y su sistema de etiquetas está fijado a seis categorías concretas en chino, lo que limita su reutilización fuera del ecosistema Bubble Todo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con ajuste LoRA |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos MLX; adaptador LoRA |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M), MLX, LoRA |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-2B, un transformer decoder-only de la familia Qwen 3.5 de Alibaba. Sobre esta base, el autor aplicó un ajuste fino supervisado mediante LoRA para especializar el modelo en la tarea de parsing de tareas: transformar frases coloquiales en un array JSON con ocho campos (`title`, `list`, `date`, `time`, `remind_before_min`, `alarm`, `repeat`, `note`). El modelo está entrenado para saltarse explícitamente el razonamiento en cadena (Chain-of-Thought) y emitir directamente JSON puro, sin bloques Markdown ni texto adicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de instrucciones ni si se aplicaron técnicas de RLHF o DPO. El autor menciona que la versión de 2B mejora respecto a una versión previa de 0,8B en comprensión de frases largas, inferencia de contexto implícito y corrección de lenguaje oral ambiguo, pero no se publican detalles cuantitativos del proceso de entrenamiento. La cuantización a Q4_K_M se realizó antes del despliegue móvil, y el repositorio incluye tanto el adaptador LoRA como los pesos fusionados en MLX y GGUF.

## Capacidades

- Parsing estructurado de tareas: convierte lenguaje natural en arrays JSON con esquema fijo de ocho campos.
- Razonamiento temporal relativo: resuelve expresiones como "mañana", "pasado mañana", "el viernes", "el próximo lunes" respecto a una fecha base inyectada en el system prompt.
- Descomposición de tareas compuestas: separa una frase con múltiples acciones en varios objetos de tarea independientes.
- Clasificación en etiquetas fijas: asigna cada tarea a una de las seis categorías `["活动", "娱乐", "其他", "运动", "学习", "工作"]`.
- Salida JSON pura: omite el modo de pensamiento y no genera envoltorios Markdown, lo que simplifica el post-procesado.
- Extracción de campos opcionales: detecta hora, recordatorio previo, alarma, regla de repetición y notas contextuales.
- Capacidades multilingües limitadas a chino e inglés.
- No se documenta soporte de tool calling genérico, agentes multi-paso ni visión.

## Casos de uso

- Aplicación de gestión de tareas (Bubble Todo): el modelo es el motor de entrada de voz o texto que transforma dictados coloquiales en registros estructurados listos para persistir en base de datos, gracias a su salida JSON estricta sin necesidad de regex.
- Asistentes de productividad en dispositivo: integración en apps móviles iOS/macOS mediante MLX o llama.cpp para procesar recordatorios sin enviar datos a la nube, aprovechando el tamaño de 1,2 GB y los 65 tokens/s en Apple Silicon.
- Automatización de agendas y calendarios: conversión de frases como "reunión el jueves a las 10 con recordatorio 15 minutos antes" en eventos con fecha, hora y alarma, usando el razonamiento temporal relativo sobre la fecha base inyectada.
- Extracción de entidades en pipelines de notas: procesamiento por lotes de notas de voz o mensajes para poblar sistemas de ticketing o CRM con campos estructurados.
- Prototipado de interfaces conversacionales: servir como capa de intención y slot-filling en asistentes de dominio cerrado donde el esquema de salida es fijo.
- Filtrado y categorización de tareas entrantes: clasificación automática de elementos en las seis categorías predefinidas para enrutarlos a listas o flujos de trabajo concretos.
- Evaluación de técnicas de fine-tuning LoRA: el repositorio publica el adaptador, lo que lo hace útil como referencia para estudiar especialización de modelos pequeños en tareas de extracción estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una velocidad de inferencia aproximada de 65 tokens/s en dispositivos Apple Silicon con la cuantización Q4_K_M, sin métricas de precisión, exactitud de parsing ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,2 GB para los pesos Q4_K_M en GGUF, más overhead de contexto (el ejemplo usa 2048 tokens).
- GPU recomendadas: no se especifican; el modelo está orientado a inferencia en CPU/GPU integrada de Apple Silicon (serie M).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-3 GB de VRAM libre; también en CPU y en dispositivos móviles de gama alta.
- Opciones de despliegue: llama.cpp (`llama-cli` con `-ngl 99`), MLX en macOS/iOS, y presumiblemente Ollama o servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: ~65 tokens/s en Apple Silicon según el autor; no se reportan datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bubble-Qwen3.5-2B | ~1,88 B | no disponible | Parsing JSON de tareas (fine-tune LoRA) | Apache-2.0 | Hugging Face (MLX, GGUF, LoRA) |
| Qwen3.5-2B (base) | ~2 B | no disponible | Propósito general | no disponible | Hugging Face |
| Versión Bubble 0.8B (mencionada por el autor) | ~0,8 B | no disponible | Parsing JSON de tareas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: el esquema de salida y las seis etiquetas están fijados en chino; no es adecuado como modelo conversacional general.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado ni garantizado.
- Riesgo de alucinación en fechas y horas cuando la frase es ambigua; el autor recomienda `--temp 0` para minimizar variabilidad.
- Dependencia de la fecha base inyectada en el system prompt: si es incorrecta, los cálculos temporales relativos serán erróneos.
- Sin benchmarks publicados de precisión, por lo que la calidad del parsing no está cuantificada de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- Aunque la licencia Apache-2.0 permite uso comercial, la utilidad comercial fuera del ecosistema Bubble Todo es marginal.
- No se documenta el tamaño de contexto nativo del modelo base; el ejemplo de despliegue limita a 2048 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/tinystudio/bubble-qwen3.5-2b
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-2B (según la model card)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
