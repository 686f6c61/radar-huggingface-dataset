# VertexAIco/prism-caption-1-micro

## Resumen

Prism Caption 1 Micro es un modelo de lenguaje de 1.301.875.840 parámetros (aproximadamente 1,3 mil millones) desarrollado por VertexAIco, especializado en una única tarea: generar títulos cortos y específicos para conversaciones de chat a partir del primer mensaje del usuario. Se trata de un ajuste fino mediante LoRA sobre `mlx-community/gemma-3-1b-it-4bit`, es decir, sobre una versión cuantizada a 4 bits de Gemma 3 1B en formato MLX, y se distribuye con licencia Apache 2.0.

El modelo se entrenó mediante destilación desde un profesor de mayor tamaño (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`, accedido a través de la capa gratuita de OpenRouter) sobre un conjunto de 339 ejemplos de primeros mensajes realistas repartidos en unos 50 temas cotidianos. La motivación es económica y operativa: en lugar de enrutar la generación de títulos a un modelo generalista grande, se emplea un modelo minúsculo que puede ejecutarse localmente y de forma barata para esta tarea concreta.

Su relevancia actual reside en el patrón de diseño: modelos de un solo propósito, destilados y cuantizados, que sustituyen llamadas a APIs de modelos grandes en tareas auxiliares de producto (auto-nombrado de conversaciones, etiquetado, resumen de una línea). El repositorio ocupa 1,8 GB e incluye pesos en MLX (4 bits, grupo de 64, 733 MB) y en GGUF Q4_K_M (1,01 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), ajuste fino LoRA |
| Parametros totales | 1.301.875.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX, group size 64); Q4_K_M (GGUF) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 1B en su variante instruct y cuantizada a 4 bits para MLX (`mlx-community/gemma-3-1b-it-4bit`), una arquitectura transformer decoder-only. Sobre esa base se aplicó un ajuste fino LoRA de rango 8 sobre 8 capas, durante 1.500 iteraciones, con una pérdida de validación mínima de 0,163 alcanzada en la iteración 800 (el autor indica que la ejecución estaba esencialmente convergida desde la iteración ~300).

El conjunto de entrenamiento consta de 339 ejemplos de primeros mensajes realistas en aproximadamente 50 temas cotidianos (programación, viajes, cocina, finanzas, salud, entre otros), emparejados con títulos generados por el modelo profesor. No se documenta el número de tokens de entrenamiento ni una fase de RLHF o DPO; el método declarado es destilación supervisada vía LoRA. La innovación destacable no es arquitectónica sino de producto: un modelo de un solo propósito que mejora la fiabilidad de formato respecto a la base (0/20 salidas mal formadas frente a 3/20 de Gemma 3 1B-it).

## Capacidades

- Generación de títulos de conversación a partir del primer mensaje del usuario, con formato restringido: 3-6 palabras, title case, sin comillas, sin puntuación final y sin preámbulo.
- Cumplimiento estricto de formato: salida en una sola línea, sin texto adicional, lo que lo hace apto para integración directa en interfaces de chat.
- Comprensión de mensajes de arranque de conversación en inglés sobre temas cotidianos (programación, viajes, cocina, finanzas, salud, etc.).
- No soporta tool calling ni function calling de forma declarada.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- No es un modelo conversacional general: fuera del titulado de chats su rendimiento no está garantizado.

## Casos de uso

- Auto-nombrado de conversaciones en asistentes tipo ChatGPT o Claude: el modelo recibe el primer mensaje del usuario y devuelve un título de 3-6 palabras que sustituye a "Nuevo chat". Es adecuado porque su formato de salida es consistente (0/20 salidas mal formadas en la evaluación del autor) y su coste por inferencia es mínimo.
- Etiquetado de hilos en herramientas de soporte al cliente: al abrir un ticket, el modelo genera una etiqueta corta y específica que facilita el enrutado y la búsqueda posterior en el histórico.
- Organización de historiales en aplicaciones de notas o productividad: títulos automáticos para entradas creadas a partir de una primera frase del usuario, manteniendo listas legibles sin intervención manual.
- Clasificación ligera de intención disfrazada de título: en pipelines internos, el título generado puede usarse como señal débil para agrupar conversaciones por tema (programación, viajes, finanzas) sin coste de un modelo grande.
- Despliegue en local sobre Apple Silicon: con `mlx-lm` y el checkpoint de 733 MB en 4 bits, puede ejecutarse en un Mac para prototipos o aplicaciones de escritorio que necesiten titulado sin conexión.
- Integración en entornos con `llama.cpp`, Ollama o LM Studio: mediante el GGUF Q4_K_M de 1,01 GB, se puede servir en CPU o GPU modesta dentro de una aplicación de chat existente.
- Reducción de costes en productos con alto volumen de conversaciones nuevas: sustituye llamadas a modelos generalistas grandes en una tarea auxiliar frecuente, con latencia baja y sin dependencia de API externa.

## Benchmarks y rendimiento

El autor publica una evaluación comparativa base frente a ajustado sobre 20 primeros mensajes nuevos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Gemma-3-1B-it (base) | Prism Caption 1 Micro |
|---|---|---|
| Salidas con formato incorrecto (demasiado largas, multilínea o mal formadas) | 3/20 | 0/20 |
| Media de palabras por título | 4,0 | 4,0 |

Ejemplos de salida comparados (base -> ajustado):
- "Explaining the difference between TCP and UDP": "TCP vs UDP Explanation" -> "TCP vs UDP Overview".
- "How to start composting in a small apartment": "Start Small Apartment Composting" -> "Small Apartment Composting Guide".
- "Debugging a React component that re-renders infinitely": "React Component Re-renders" -> "React Component Re-render Issue".

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en 4 bits (checkpoint MLX de 733 MB; GGUF Q4_K_M de 1,01 GB), más overhead de contexto y runtime.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna es suficiente. El formato MLX está pensado para Apple Silicon (M1/M2/M3/M4); el GGUF funciona en CPU y en GPU NVIDIA/AMD mediante `llama.cpp`.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM; también en CPU.
- Opciones de despliegue: `mlx-lm` (Apple Silicon), `llama.cpp`, Ollama y LM Studio a través del GGUF. No se documenta soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formatos |
|---|---|---|---|---|---|
| Prism Caption 1 Micro | 1.301.875.840 | no disponible | Titulado de chats | Apache 2.0 | safetensors (MLX), GGUF |
| Gemma 3 1B-it (base) | ~1B | no disponible | Propósito general | Gemma license | safetensors, GGUF |
| Modelo profesor (Nemotron-3-Nano-Omni 30B A3B) | 30B totales (A3B) | no disponible | Propósito general con razonamiento | no disponible | no disponible |

La comparación relevante es contra su propia base: Prism Caption 1 Micro no supera a Gemma 3 1B-it en calidad media de título (ambos 4,0 palabras), sino en fiabilidad de formato (0/20 frente a 3/20 salidas mal formadas). Frente al profesor de 30B, la ventaja es de coste y despliegue local, no de capacidad. No se dispone de datos de benchmarks que permitan comparaciones adicionales con otros modelos de titulado.

## Limitaciones y advertencias

- Modelo de un solo propósito: entrenado con LoRA sobre 339 ejemplos para titulado de chats; no debe usarse como modelo conversacional general.
- Sesgos conocidos: no documentados por el autor; al derivar de Gemma 3 y entrenarse solo en inglés, hereda los sesgos de la base y la limitación idiomática.
- Riesgo de alucinación: limitado por la tarea, pero los títulos de primeros mensajes muy ambiguos o muy cortos pueden resultar genéricos.
- Limitaciones de idioma: solo se declara inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Limitación de contexto: la longitud de contexto no está documentada en la información disponible.
- Caveat crítico de inferencia: el tokenizador de Gemma 3 registra `<eos>` (id 1) como único token de parada por defecto, pero la plantilla de chat termina cada turno con `<end_of_turn>` (id 106). Si el código de inferencia no trata también `<end_of_turn>` como parada, la generación continúa más allá del título correcto y produce tokens basura o de relleno. En MLX hay que añadir explícitamente el id 106 a `eos_token_ids`; en `llama.cpp` la plantilla de Gemma 3 ya lo gestiona.
- Restricciones de licencia: Apache 2.0, heredada de la base según el autor; conviene verificar los términos aplicables a Gemma 3 en el uso comercial.
- En producción: usar el system prompt de entrenamiento para obtener el formato esperado; sin él, la fiabilidad de formato puede degradarse.

## Enlaces

- Hugging Face: https://huggingface.co/VertexAIco/prism-caption-1-micro
- Modelo base: https://huggingface.co/mlx-community/gemma-3-1b-it-4bit
- Modelo profesor: https://huggingface.co/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
- OpenRouter (acceso al profesor): https://openrouter.ai/
- `mlx-lm`: https://github.com/ml-explore/mlx-lm
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com/
- LM Studio: https://lmstudio.ai/
