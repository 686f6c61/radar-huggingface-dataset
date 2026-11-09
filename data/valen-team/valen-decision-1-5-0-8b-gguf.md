# Valen-Team/Valen-Decision-1.5-0.8B-GGUF

## Resumen

Valen-Decision-1.5-0.8B-GGUF es un modelo multimodal de decisión desarrollado por Valen-Team, especializado en clasificar mensajes de texto, evaluar imágenes contra requisitos y detectar acciones en vídeo. No es un modelo generativo conversacional al uso: devuelve respuestas tipadas y estructuradas (predicados, probabilidades, etiquetas, puntuaciones) a partir de un estado de entrada y un conjunto de preguntas, todo en un único forward pass. Está construido sobre Qwen3.5-0.8B como modelo base, con 857.464.173 parámetros totales, y se distribuye en formato GGUF bajo licencia Apache 2.0.

El modelo resuelve el problema de la clasificación y el enrutamiento estructurado en pipelines de producción: en lugar de pedir a un LLM que genere texto libre y parsearlo después, Valen expone directamente un protocolo de decisión con dos formatos de API (SystemOne, usado por Jev, y Decisions, alineado con OpenAI). Esto reduce la fragilidad del parseo y facilita la integración en sistemas de atención al cliente, moderación de contenido y etiquetado de medios.

La relevancia actual del modelo está en su enfoque de "decision model" ligero: 0,8B parámetros permiten despliegue en CPU y en GPU de gama consumer, con un SDK ONNX para Python y JavaScript y un runtime GGUF propio para servicios C++ en Linux. La model card advierte que las cuantizaciones Q4 y Q5 no superaron los controles de calidad, por lo que solo se recomiendan F32 y Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-0.8B (custom code, requiere trust_remote_code) |
| Parametros totales | 857.464.173 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q8_0 y F32 cualificados; Q4 y Q5 fallaron los controles de calidad; ONNX q8-mlp para la variante ONNX |
| Idiomas soportados | Ingles y chino (segun la ficha del modelo base Valen-0.8B-GGUF); no se detalla cobertura adicional |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo), ONNX y pesos nativos en otras distribuciones del mismo modelo |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen3.5-0.8B mediante ajuste fino completo (full fine-tuning), segun las etiquetas del modelo base. Acepta entradas de texto, imagen y vídeo, y produce salidas tipadas y estructuradas en lugar de texto libre: probabilidades para predicados, etiquetas para clasificación, cajas y puntuaciones para detección, y elecciones entre opciones. La model card indica que cajas, probabilidades, elecciones y puntuaciones se obtienen en un único forward pass, lo que sugiere una cabeza de decisión que combina múltiples tareas sobre el mismo estado compartido ("shared-state").

El entrenamiento se apoya en el dataset Valen-Training-General-100k, publicado por el propio equipo, y el código de entrenamiento está disponible en el repositorio de GitHub. No se especifica en la información proporcionada el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona explícitamente que el paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo, y que las pruebas históricas de vídeo con compilación desde fuente no cualifican el paquete precompilado.

## Capacidades

- Clasificación de mensajes de texto con salidas tipadas y probabilidades asociadas.
- Evaluación de imágenes contra requisitos definidos por el usuario (predicados, etiquetas, detección con cajas).
- Identificación de acciones en vídeo (con la salvedad de que el paquete GGUF precompilado 0.1.0 no incluye soporte directo de vídeo).
- Salida estructurada en dos protocolos: SystemOne (Jev) y Decisions (OpenAI).
- Soporte de estado compartido entre preguntas dentro de una misma llamada.
- Modo de incertidumbre con políticas declaradas en la documentación del Cookbook.
- Capacidades multilingües limitadas a inglés y chino según la información disponible.
- Integración con SDK ONNX para Python y JavaScript, y runtime GGUF propio para C++ en Linux.
- No se documenta soporte de tool calling genérico ni de razonamiento multi-paso en el sentido de los LLM conversacionales; el modelo está orientado a decisión estructurada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica el mensaje del cliente en categorías tipadas y devuelve probabilidades, lo que permite aplicar umbrales de confianza y derivar a cola humana cuando la certeza es baja. El Cookbook incluye un tutorial específico de ticket routing.
- Moderación de imágenes de producto: se definen predicados ("el producto está centrado", "el fondo es blanco") y el modelo devuelve probabilidad por predicado, integrándose en un pipeline de aprobación automática previo a la publicación en catálogo.
- Etiquetado de vídeo para bibliotecas de contenido: detección de acciones y escenas para indexación y búsqueda, con la advertencia de que el paquete GGUF precompilado no soporta vídeo directamente y requiere la ruta ONNX o nativa.
- Verificación de requisitos en flujos de onboarding: comprobación de que una imagen de documento cumple condiciones (legibilidad, encuadre, presencia de campos) antes de pasarla a OCR.
- Clasificación de comentarios y reseñas: asignación de etiquetas estructuradas con puntuación de confianza para priorizar revisiones o disparar respuestas automáticas.
- Filtrado previo en pipelines RAG: decidir si un fragmento recuperado es relevante para la consulta mediante predicados, evitando llamadas costosas a un LLM generativo.
- Servicio C++ en Linux sin GPU: despliegue con el runtime GGUF propio en Q8_0 para clasificación de bajo coste en entornos con CPU únicamente.
- Fine-tuning para dominios verticales: el equipo publica código y datos de entrenamiento, de modo que se puede adaptar el modelo a taxonomías propias partiendo de los pesos nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona controles de calidad internos que descartaron las cuantizaciones Q4 y Q5, y una validación P1 sobre imágenes fijas con el binario precompilado en 0.8B Q8_0, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 0,86B parámetros en Q8_0 ocupa aproximadamente 0,9 GB de pesos; en F32, unos 3,4 GB. La model card advierte explícitamente que el tamaño de fichero no equivale al requisito de RAM.
- GPU recomendadas: no se especifican modelos concretos. El ejemplo de la model card usa una GPU NVIDIA con CUDA, dtype automático y atención SDPA. Para la variante ONNX se menciona Python ONNX CUDA como opción de despliegue en GPU.
- GPU consumer: por tamaño, cabe holgadamente en tarjetas consumer con 8 GB o más, aunque no hay una lista oficial de GPUs validadas.
- Opciones de despliegue: SDK ONNX para Python y JavaScript en aplicaciones offline; runtime GGUF propio de Valen para servicios C++ en Linux; pesos nativos con plugins o Python ONNX CUDA para GPU; SGLang y vLLM mencionados como backends. La model card indica que no se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles. La model card declara explícitamente que no se promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-0.8B | 857 M | No disponible | Decisión multimodal estructurada (texto, imagen, vídeo) | Apache 2.0 | GGUF, ONNX, pesos nativos, API gratuita |
| Qwen3.5-0.8B (modelo base) | ~0,8 B | No disponible | LLM generativo multimodal | No disponible en la informacion | Hugging Face |
| Valen-0.8B-GGUF (version anterior) | ~0,8 B | No disponible | Decisión multimodal, generación previa | Apache 2.0 | GGUF |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Las cuantizaciones Q4 y Q5 no superaron los controles de calidad del equipo; solo F32 y Q8_0 están cualificadas para uso.
- El paquete GGUF precompilado 0.1.0 no incluye soporte directo de vídeo; las pruebas de vídeo documentadas corresponden a compilaciones desde fuente y no cualifican el binario publicado.
- No se reclama compatibilidad con llama.cpp u Ollama oficiales sin modificar; el despliegue GGUF requiere el runtime propio de Valen.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor.
- Idiomas documentados limitados a inglés y chino; el rendimiento en castellano no está verificado.
- Riesgo de alucinación y calibración de probabilidades no cuantificados en la información disponible; se recomienda aplicar políticas de incertidumbre y umbrales antes de automatizar decisiones.
- Sesgos conocidos: no documentados en la información proporcionada.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-0.8B y de los datasets utilizados antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción todavía muy limitada y poca validación externa.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Documentación de la API: https://valen-team.github.io/docs/valen/api/
- Guía de selección de versión: https://valen-team.github.io/docs/valen/choosing/
- Inicio rápido de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- Tutorial de ticket routing: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de imágenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de vídeo: https://valen-team.github.io/cookbook/video-tagging/
- Modelo anterior Valen-0.8B-GGUF: https://huggingface.co/Valen-Team/Valen-0.8B-GGUF
- Documentación de SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- Guía de Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
