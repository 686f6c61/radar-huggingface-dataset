# VadymPikulyk/zils-lite-dh15

## Resumen

zils-lite-dh15 es un modelo de decisión (decision-model) de aproximadamente 853 millones de parámetros, publicado por VadymPikulyk dentro del ecosistema Zils, asociado a la subred 127 de Bittensor. Se construye como un "soup body" sobre el chasis d3-lite: parte de la media uniforme de dos cuerpos d3-lite y aplica dos fusiones de LoRA entrenadas sobre datos de decisión y de uso de herramientas. El modelo base subyacente es Qwen/Qwen3.5-0.8B, por lo que hereda su arquitectura transformer y su tokenizador.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino un componente de decisión pensado para integrarse en el pipeline de la subred Zils, donde se espera que responda a preguntas de decisión y a elecciones de invocación de herramientas. Su interés técnico está en el método de construcción (model soup más fusión de LoRA con objetivos mixtos entre etiqueta dorada y la propia respuesta del modelo de partida) y en su licencia Apache-2.0, que permite reutilización comercial.

La información pública disponible es escasa: la model card describe el proceso de entrenamiento pero no aporta especificaciones de contexto, idiomas ni resultados de benchmarks. Las descargas y los "likes" son cero en el momento de la consulta, y el repositorio ocupa 1,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B, tag `qwen3_5`); empaquetada en el chasis d3-lite |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere cargar código remoto) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-0.8B dispuesto en el diseño de chasis d3-lite. El punto de partida es la media uniforme de los dos cuerpos d3-lite "seated" del 2026-11-17 (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a, ambos Apache-2.0). Sobre esa media se aplican dos cambios de pesos. El primero es la media de cuatro semillas de un LoRA fusionado (rango 64, learning rate 5e-5, una época), entrenado con `python -m zils.teacher train` sobre el soup del 2026-11-16 con unas 34.000 filas: respuestas del profesor Zils Relay (zils-ai/zils-relay-answers, probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas a partir de fuentes públicas de entrenamiento) más filas de decisión de uso de herramientas del split TRAIN de glaiveai/glaive-function-calling-v2, ponderadas a 0,175 por el cambio de cada semilla.

El segundo cambio es 0,7 veces un LoRA fusionado (rango 64, lr 5e-5, una época) entrenado sobre el soup del 2026-11-17 con unas 40.000 filas de decisiones tipadas: filas TRAIN con licencia comercial de tasksource/tasksource-jev-typed-decisions, uso de herramientas de glaive y filas de puntuación aritmética/rúbrica generadas por reglas, con objetivos mezclados al 50 % entre la etiqueta dorada y la respuesta del propio soup de partida. El autor declara que no se usaron ítems del examen del validador, ítems públicos del examen semilla ni datos de clientes. No se documentan detalles sobre el preentrenamiento original, el número total de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas de decisión en el formato esperado por el pipeline Zils.
- Decisión de uso de herramientas (tool-use decision): el entrenamiento incluye filas de glaive-function-calling-v2 orientadas a elegir invocaciones.
- Puntuación y rúbricas: incluye filas de puntuación aritmética y de rúbrica generadas por reglas.
- Destilación de un profesor (Zils Relay / d3-ultra): el modelo aprende a aproximar las probabilidades del profesor en preguntas de decisión.
- Capacidades multilingües: no disponible; no se documentan idiomas.
- Modo thinking, visión, audio o agentes multi-paso: no disponible; la model card menciona "language and vision weights", pero no detalla ninguna capacidad de visión verificable.
- Tool calling genérico: no disponible más allá de la señal de entrenamiento descrita.

## Casos de uso

- Enrutamiento de decisiones en la subred Zils: el modelo actúa como cuerpo de decisión que responde a preguntas tipadas y devuelve la elección esperada por el pipeline, gracias a su entrenamiento específico sobre filas de decisión.
- Selección de invocación de herramientas: puede emplearse para decidir qué función invocar en un flujo de function calling, dado que se entrenó con filas de glaive-function-calling-v2.
- Puntuación automática de respuestas: las filas de rúbrica y aritmética permiten usarlo como evaluador ligero de respuestas en pipelines internos.
- Destilación de un profesor mayor: sirve como estudiante de 853 M parámetros que aproxima las probabilidades de un modelo profesor en tareas de decisión, útil para abaratar inferencia.
- Prototipado de agentes con presupuesto de cómputo mínimo: al caber en una sola GPU de consumo, permite iterar sobre lógica de decisión sin infraestructura dedicada.
- Investigación sobre model soups y fusión de LoRA: el repositorio documenta la receta completa (media de cuerpos, media de semillas, ponderación 0,7 y objetivos mixtos), lo que lo convierte en un caso de estudio reproducible.
- Base para fine-tunes posteriores en dominios de decisión: su licencia Apache-2.0 y su tamaño reducido facilitan adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican artefactos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, con las consumer como opción natural por el tamaño.
- Cabe en GPU de consumo: sí, con margen amplio en modelos de 8 GB o más.
- Opciones de despliegue: al usar `custom_code` y el tag `qwen3_5`, la carga requiere `trust_remote_code=True`; vLLM, TGI y llama.cpp/Ollama solo son viables si el chasis d3-lite está soportado por esas herramientas, extremo no confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-dh15 | 852.985.920 | no disponible | Apache-2.0 | Decision-model sobre chasis d3-lite |
| Qwen/Qwen3.5-0.8B | ~0,8 B (no confirmado en la información) | no disponible | no disponible | Modelo base de propósito general |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | Chasis/cuerpo d3-lite |
| joamCriff123/zils-lite-l1116a y l1116b | no disponible | no disponible | Apache-2.0 | Cuerpos d3-lite predecesores |

No se dispone de datos de rendimiento comparables entre estas variantes; la comparación se limita a linaje, licencia y enfoque.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para el pipeline de decisión de Zils y no como asistente conversacional general; su comportamiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinación.
- Sesgos: no se documenta ningún análisis de sesgos; los datos de entrenamiento provienen de conjuntos públicos (tasksource, glaive) y de salidas de un profesor, lo que puede propagar los sesgos de ambos.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento multilingüe.
- Contexto: se desconoce la longitud de contexto efectiva, lo que impide planificar cargas con ventanas largas.
- Código remoto: el repositorio incluye `custom_code`, por lo que la carga exige `trust_remote_code=True` y una revisión del código antes de usarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero la model card pide citar tasksource y los datasets originales; conviene revisar también las licencias de los conjuntos de datos derivados.
- Madurez: cero descargas y cero "likes" en el momento de la consulta, y publicación muy reciente (17 de noviembre de 2026), sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo predecesor l1116a: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Cuerpo predecesor l1116b: https://huggingface.co/joamCriff123/zils-lite-l1116b
- Cuerpo predecesor dh11: https://huggingface.co/VadymPikulyk/zils-lite-dh11
- Dataset de respuestas del profesor: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
