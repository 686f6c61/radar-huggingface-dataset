# VertexAGI/prism-caption-1-micro

## Resumen

Prism Caption 1 Micro es un modelo de generación de texto de propósito único, desarrollado por VertexAGI, que se especializa en titular conversaciones de chat a partir del primer mensaje del usuario. Forma parte de la familia Prism y está diseñado para ejecutar esta tarea estrecha de forma local y económica, evitando tener que recurrir a un modelo generalista más grande. El modelo se obtiene mediante fine-tuning con LoRA sobre el modelo base `mlx-community/gemma-3-1b-it-4bit` (Gemma 3 1B cuantizado a 4 bits), destilando el comportamiento de un profesor más grande, `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`, a través de la API gratuita de OpenRouter.

Con 203.531.392 parámetros (según los safetensors del repositorio) y un peso de 1,8 GB, el modelo está pensado para ser rápido y ligero. Se distribuye en dos formatos: MLX (para Apple Silicon) y GGUF (Q4_K_M, para llama.cpp y runtimes compatibles). Su licencia es Apache 2.0, heredada del modelo base, y solo soporta inglés. La relevancia actual radica en que ofrece una alternativa de bajo coste para una funcionalidad muy común en asistentes conversacionales, con una fiabilidad de formato mejorada respecto al modelo base sin fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B) con adaptadores LoRA |
| Parametros totales | 203.531.392 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada (heredada del modelo base Gemma 3 1B) |
| Tipos de cuantizacion | 4-bit (MLX), Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/gemma-3-1b-it-4bit`, una versión cuantizada a 4 bits de Gemma 3 1B, que es un transformer decoder-only con atención causal estándar. Sobre esta base se aplicó un fine-tuning con LoRA de rango 8 en 8 capas, durante 1.500 iteraciones, utilizando un dataset propio de 339 ejemplos de primeros mensajes realistas repartidos en unos 50 temas cotidianos (programación, viajes, cocina, finanzas, salud, etc.). Cada ejemplo empareja el mensaje del usuario con un título generado por el modelo profesor `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`, que actúa como maestro en un esquema de destilación. La mejor pérdida de validación fue 0,163, alcanzada en la iteración 800, con convergencia práctica desde la iteración 300.

No se emplearon técnicas como RLHF o DPO; el entrenamiento es puramente supervisado sobre las salidas del profesor. El modelo está ajustado para seguir un prompt de sistema específico que pide generar únicamente un título corto (3-6 palabras, en title case, sin puntuación final). Una particularidad técnica importante es que el tokenizador de Gemma 3 registra `<eos>` (id 1) como único token de parada por defecto, pero la plantilla de chat termina cada turno con `<end_of_turn>` (id 106); si el runtime no lo añade como condición de parada, la generación se alarga con tokens basura.

## Capacidades

- Generación de títulos de chat: dado el primer mensaje de una conversación, produce un título corto y específico (3-6 palabras) en formato title case.
- Fiabilidad de formato: el fine-tuning reduce drásticamente las salidas malformadas (títulos demasiado largos, multilínea o con formato incorrecto) en comparación con el modelo base sin ajustar.
- Integración con plantillas de chat: compatible con el formato de mensajes de Gemma 3 (rol user/system) y con el prompt de sistema recomendado.
- Ejecución local eficiente: al ser un modelo pequeño y cuantizado, puede ejecutarse en hardware modesto, incluida CPU y Apple Silicon.
- Soporte de tool calling: no disponible; el modelo no está entrenado para ello.
- Capacidades multilingües: no; solo inglés.
- Modo de razonamiento o pensamiento: no; es un modelo de una sola pasada para una tarea concreta.

## Casos de uso

- Titulado automático de conversaciones en aplicaciones de chat: el modelo puede asignar un nombre descriptivo a cada nueva conversación en un cliente de mensajería o asistente, replicando el comportamiento de "New chat" de ChatGPT o Claude. Su pequeño tamaño permite ejecutarlo en el cliente sin latencia perceptible.
- Asistentes de productividad local: integración en herramientas de notas o gestión de tareas que necesiten etiquetar automáticamente hilos de discusión o registros de reuniones a partir de la primera intervención.
- Preprocesado de datasets de soporte: en sistemas de atención al cliente, se puede usar para generar títulos de tickets a partir del primer mensaje del usuario, facilitando la clasificación y búsqueda posterior.
- Middleware de titulado en pipelines de IA: como paso previo en un flujo donde un modelo grande se encarga de tareas complejas, Prism Caption 1 Micro puede encargarse del titulado de sesiones, reduciendo el coste de cómputo al no invocar al modelo grande para esta tarea trivial.
- Aplicaciones de chat embebidas en dispositivos edge: al pesar solo 1,8 GB y requerir poca VRAM, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, NAS, etc.) para titular conversaciones de forma privada.
- Demostraciones educativas de fine-tuning y destilación: sirve como ejemplo práctico de cómo adaptar un modelo pequeño a una tarea específica mediante LoRA y destilación, con un dataset reducido.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que el modelo no está diseñado para tareas generales. En su lugar, el autor proporciona una evaluación propia sobre 20 primeros mensajes de prueba, comparando el modelo base Gemma 3 1B con la versión ajustada:

| Metrica | Base Gemma-3-1B-it | Prism Caption 1 Micro |
|---|---|---|
| Salidas con formato incorrecto (demasiado largas / multilinea / malformadas) | 3/20 | 0/20 |
| Numero medio de palabras por titulo | 4,0 | 4,0 |

Además, se muestran ejemplos cualitativos de mejora en la especificidad de los títulos, como "Explaining the difference between TCP and UDP" -> "TCP vs UDP Overview" o "Debugging a React component that re-renders infinitely" -> "React Component Re-render Issue". No se dispone de datos de latencia o throughput publicados.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,8 GB, por lo que la inferencia en 4-bit requiere aproximadamente 2 GB de VRAM o memoria RAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) es suficiente. También funciona en Apple Silicon gracias al formato MLX.
- Compatibilidad con CPU: sí, mediante llama.cpp con el archivo GGUF Q4_K_M; puede ejecutarse en CPU sin GPU.
- Opciones de despliegue: `mlx-lm` para Apple Silicon, `llama.cpp` (o LM Studio, Ollama) para el formato GGUF, y cualquier runtime compatible con safetensors.
- Latencia y throughput: no publicados, pero al ser un modelo de ~200M parámetros y generar solo 3-6 palabras, la latencia es del orden de decenas de milisegundos en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (titulado de chats con tamaño similar). La comparación más relevante es con el modelo base sin ajustar, que ya se ha mostrado en la sección de benchmarks. Frente a alternativas generalistas como Gemma 3 1B o Llama 3.2 1B, Prism Caption 1 Micro ofrece una fiabilidad de formato superior para la tarea específica de titulado, a costa de no ser útil para ninguna otra tarea. No se dispone de datos de rendimiento de otros modelos de titulado para una comparativa cuantitativa.

## Limitaciones y advertencias

- Propósito único: el modelo solo es útil para titular conversaciones; no funcionará bien en ninguna otra tarea de generación de texto.
- Dataset de entrenamiento pequeño: solo 339 ejemplos, lo que puede limitar la generalización a dominios o estilos de escritura muy diferentes.
- Títulos genéricos en casos ambiguos: para mensajes muy cortos o ambiguos, el título generado puede ser poco específico o genérico.
- Idioma limitado: solo soporta inglés; no se recomienda su uso con otros idiomas.
- Dependencia del token de parada: si el runtime no configura `<end_of_turn>` (id 106) como token de parada, la generación producirá salidas corruptas o alargadas.
- Riesgo de alucinación: aunque la tarea es simple, el modelo puede generar títulos que no reflejen fielmente el contenido del mensaje en casos límite.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Gemma 3 (que también es Apache 2.0, según la model card).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VertexAGI/prism-caption-1-micro
- Modelo base: https://huggingface.co/mlx-community/gemma-3-1b-it-4bit
- Profesor (vía OpenRouter): https://openrouter.ai/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
