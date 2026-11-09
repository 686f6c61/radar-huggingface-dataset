# Valen-Team/Valen-Decision-1.5-2B-GGUF

## Resumen

Valen-Decision-1.5-2B es un modelo de decisión multimodal desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.5-2B. Su propósito no es la generación libre de texto, sino la evaluación estructurada de predicados y preguntas sobre entradas multimodales (texto, imagen y vídeo, con matices según el formato): clasificar mensajes de clientes, verificar si una imagen cumple requisitos o identificar acciones en vídeo devolviendo probabilidades, etiquetas y puntuaciones en una sola pasada.

El modelo tiene 2.220.085.357 parámetros y se distribuye principalmente en formato GGUF (también con pesos nativos para Transformers y variantes ONNX), con licencia Apache 2.0. Se apoya en una arquitectura transformer heredada de Qwen3.5 y añade código personalizado (`trust_remote_code`) para exponer una API de decisiones con dos protocolos: SystemOne (Jev) y Decisions (OpenAI).

Su relevancia actual radica en el nicho de los modelos de decisión estructurada: en lugar de un LLM conversacional, ofrece una interfaz tipada para producir salidas verificables (probabilidades, elecciones, scores) útiles en pipelines de automatización, moderación y enrutado de tickets, con la promesa de despliegue en CPU mediante un runtime propio sobre llama.cpp/Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B) con código personalizado para decisión estructurada |
| Parámetros totales | 2.220.085.357 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F32 y Q8_0 cualificados; Q4/Q5 no superan los controles de calidad; ONNX q8-mlp |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (nativo Transformers), ONNX |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de 2.22 mil millones de parámetros, y se afina para una tarea de decisión estructurada: recibe un estado (texto o entrada multimodal) y una lista de preguntas tipadas (por ejemplo, `predicate` o `noul`), y devuelve respuestas con probabilidad asociada. La inferencia se expone mediante una API `predict` con dos formatos compatibles: SystemOne (Jev) y Decisions (OpenAI), lo que permite integrarlo en aplicaciones existentes de ambos ecosistemas.

El autor publica el código de entrenamiento y el conjunto de datos Valen-Training-General-100k. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación destacable es el enfoque de salida tipada y estructurada en una sola pasada (`one forward pass`), con soporte de entrada de imagen y, en compilaciones de fuente históricas, vídeo; el paquete GGUF prebuilt 0.1.0 no compila soporte directo de vídeo.

## Capacidades

- Clasificación de mensajes de clientes y enrutado de tickets mediante preguntas tipadas con probabilidad de respuesta.
- Verificación de imágenes contra requisitos (por ejemplo, cribado de imágenes de producto) con salida estructurada.
- Identificación de acciones en vídeo (en compilaciones con soporte de vídeo; no en el GGUF prebuilt 0.1.0).
- Salida estructurada y tipada: probabilidades, elecciones y puntuaciones en una sola pasada.
- Soporte de dos protocolos de decisión: SystemOne (Jev) y Decisions (OpenAI).
- Entrada image-text-to-text según el pipeline declarado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio: no disponible en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el modelo evalúa predicados como "el usuario reporta un problema de facturación" o "el mensaje es una queja" y devuelve probabilidades que alimentan reglas de asignación a colas o agentes, gracias a su API de decisiones tipada.
- Cribado de imágenes de producto: se envía la imagen junto con preguntas de requisitos (fondo blanco, producto centrado, sin texto) y se obtiene una verificación estructurada apta para un pipeline de control de calidad previo a la publicación.
- Moderación de contenido textual: clasificación por predicados de toxicidad, spam o intención comercial con umbrales de probabilidad configurables, integrándose en un servicio HTTP.
- Etiquetado de vídeo: en compilaciones con soporte de vídeo, identificación de acciones y eventos para indexación o búsqueda; requiere compilación de fuente, no el GGUF prebuilt.
- Automatización de decisiones en C++ sobre Linux: despliegue en CPU con el runtime personalizado de Valen sobre GGUF Q8_0 para servicios de decisión de baja latencia sin GPU.
- Fine-tuning para dominios propios: el autor publica código de entrenamiento y dataset, lo que permite adaptar el modelo a taxonomías específicas de una empresa (por ejemplo, categorías de reclamaciones).
- Prototipado rápido vía API gratuita: validación de flujos de decisión sin descargar pesos ni disponer de GPU, útil para evaluar la idoneidad antes de invertir en despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor advierte que el tamaño de fichero no equivale al requisito de RAM.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de Python usa una GPU NVIDIA con `torch`, `dtype="auto"` y `attn_implementation="sdpa"`.
- GPU de consumo: no confirmado en la información disponible.
- Despliegue: Transformers con `trust_remote_code` (GPU), SDK ONNX para Python/JavaScript offline, runtime personalizado de Valen sobre llama.cpp/Ollama para C++ en Linux CPU, y SGLang/vLLM como backends mencionados.
- El autor indica que no se promete rendimiento no medido y que el soporte en llama.cpp/Ollama oficiales sin modificar no está reclamado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-2B | 2,22 B | no disponible | Decisión estructurada multimodal (texto/imagen/vídeo) | Apache 2.0 | GGUF, safetensors, ONNX |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | LLM generativo generalista | no disponible en la información | Transformers |
| Alternativas de clasificación/structured output de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El paquete GGUF prebuilt 0.1.0 no compila soporte directo de vídeo; los tests de vídeo históricos con compilación de fuente no cualifican el binario prebuilt.
- Las cuantizaciones Q4 y Q5 no superan los controles de calidad del autor; solo se recomiendan F32 y Q8_0.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar; requiere el runtime personalizado de Valen.
- La validación P1 se limita a imágenes fijas sobre el binario prebuilt exacto con 0.8B Q8_0; no se extiende a otros tamaños.
- Idiomas soportados no documentados: riesgo de comportamiento inconsistente fuera del idioma de entrenamiento.
- Riesgo de alucinación en las probabilidades y etiquetas: al ser un modelo de decisión, conviene calibrar umbrales y validar con datos propios.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el código personalizado (`trust_remote_code`) debe auditarse antes de producción.
- El autor advierte explícitamente de que el tamaño de fichero no es un requisito de RAM y de que no se promete rendimiento no medido.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-GGUF
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Documentación de API: https://valen-team.github.io/docs/valen/api/
- Guía de selección de versión: https://valen-team.github.io/docs/valen/choosing/
- Quickstart de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- API SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- API Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
