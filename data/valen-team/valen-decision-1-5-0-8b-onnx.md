# Valen-Team/Valen-Decision-1.5-0.8B-ONNX

## Resumen

Valen-Decision-1.5-0.8B-ONNX es la variante en formato ONNX de Valen-Decision-1.5-0.8B, un modelo especializado en toma de decisiones estructuradas sobre entradas multimodales (texto, imagen y vídeo). Lo desarrolla el equipo Valen-Team y parte del modelo base Qwen/Qwen3.5-0.8B, sobre el que se ha realizado un ajuste fino orientado a producir salidas tipadas (predicados con probabilidad, elecciones y puntuaciones) en una sola pasada forward, en lugar de generar texto libre. Resuelve un problema concreto: convertir tareas de clasificación y verificación ("¿este mensaje es una queja?", "¿esta imagen cumple los requisitos?", "¿qué acción ocurre en este vídeo?") en respuestas estructuradas y verificables.

El modelo se distribuye con licencia Apache 2.0, requiere `trust_remote_code=True` por incluir código propio, y está pensado para integrarse mediante SDK de ONNX en aplicaciones Python y JavaScript, tanto en local como a través de una API HTTP gratuita ofrecida por el equipo. Con 0,8B parámetros y un repositorio de 3,4 GB, apunta a despliegues ligeros donde el coste de inferencia y la latencia importan más que la generación de texto abierta.

Es relevante ahora porque propone un patrón distinto al de los LLM conversacionales: un "modelo de decisión" que devuelve probabilidades y etiquetas tipadas directamente, con soporte declarado para dos formatos de API de decisión (SystemOne/Jev y Decisions/OpenAI), lo que facilita su encaje en pipelines de automatización existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-0.8B; código propio (`custom-code`) |
| Parametros totales | 0,8B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q8-mlp (variante de este repo); el proyecto menciona además F32 y Q8_0 en otros formatos (nativo/GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 3,4 GB); existen variantes nativas y GGUF en el proyecto |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros, y se ajusta para una tarea de decisión estructurada: dada una entrada (texto, imagen o vídeo) y una lista de preguntas tipadas (por ejemplo, predicados con instrucciones), el modelo emite en una sola pasada forward probabilidades, elecciones y puntuaciones. La model card describe esta salida como "image-text-to-typed-output" y menciona un mecanismo de "shared-state" entre preguntas del mismo lote, aunque no se detalla su implementación interna.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. El equipo publica el dataset Valen-Training-General-100k y el código de entrenamiento en su repositorio de GitHub, lo que permite reproducir o ampliar el ajuste fino. La variante ONNX se distribuye con cuantización q8-mlp y el proyecto advierte que las cuantizaciones GGUF Q4/Q5 no superaron sus controles de calidad, recomendando únicamente F32 y Q8_0 entre las variantes evaluadas.

## Capacidades

- Clasificación de mensajes de cliente y enrutamiento de tickets mediante predicados con probabilidad asociada.
- Verificación de imágenes contra requisitos declarados (por ejemplo, cribado de imágenes de producto).
- Identificación de acciones en vídeo y etiquetado automático (con las salvedades de soporte indicadas por el autor).
- Salida estructurada y tipada en una sola pasada: probabilidades, elecciones y puntuaciones, en lugar de texto libre.
- Soporte de dos formatos de API de decisión: SystemOne (Jev) y Decisions (OpenAI), compatibles con el mismo modelo.
- Entrada multimodal texto-imagen (pipeline `image-text-to-text`).
- Integración mediante SDK de ONNX en Python y JavaScript para aplicaciones offline.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan tool calling, function calling ni modo de razonamiento extendido (thinking) como tales; la interfaz es de decisión estructurada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del mensaje y una batería de predicados ("es una queja", "es una solicitud de reembolso", "es una consulta técnica") y devuelve la probabilidad de cada uno, lo que permite dirigir el ticket al equipo adecuado sin generar texto.
- Cribado de imágenes de producto: se envía la imagen junto con los requisitos del catálogo y el modelo devuelve si cumple cada criterio, útil para moderación previa a publicación en marketplaces.
- Etiquetado de vídeo: identificación de acciones presentes en un clip para indexación o búsqueda; el autor advierte que el paquete GGUF precompilado 0.1.0 no incluye soporte directo de vídeo, por lo que conviene validar el formato elegido.
- Automatización de decisiones en aplicaciones JavaScript: mediante el SDK ONNX, el modelo puede ejecutarse en el navegador o en Node para clasificar entradas sin llamadas a servidor.
- Prototipado rápido vía API gratuita: el equipo ofrece un endpoint HTTP sin clave para probar flujos de decisión antes de desplegar pesos en local.
- Ajuste fino para dominios propios: al publicarse el código de entrenamiento y el dataset Valen-Training-General-100k, un equipo puede reentrenar el modelo para sus propias categorías de decisión.
- Servicios C++ en CPU Linux: el proyecto contempla el runtime propio con formato GGUF para servicios locales en CPU, aunque sin soporte de vídeo en la versión precompilada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una página de validación del Cookbook que registra revisiones del modelo, versiones de SDK y runtime, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas comparables en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 0,8B parámetros, la variante ONNX q8-mlp ocupa aproximadamente 3,4 GB en disco; el autor advierte que el tamaño de fichero no equivale al requisito de RAM.
- GPU recomendadas: el ejemplo de la model card usa una GPU NVIDIA con CUDA y `attn_implementation="sdpa"`; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no se confirma compatibilidad explícita; por tamaño, un modelo de 0,8B es candidato a ejecutarse en GPU de consumo, pero no hay validación publicada en la información disponible.
- Opciones de despliegue: ONNX Runtime (SDK Python/JavaScript), Transformers con `trust_remote_code=True`, runtime propio de Valen con GGUF en C++ Linux CPU, y backends SGLang/vLLM mencionados para GPU. No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-0.8B-ONNX | 0,8B | no disponible | Decisión estructurada multimodal (texto/imagen/vídeo) | Apache 2.0 | Hugging Face, API gratuita, GitHub |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | LLM multimodal generalista | no disponible en la información | Hugging Face |
| Alternativas de clasificación multimodal de 1B o menos | no disponible | no disponible | Clasificación/verificación | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para decisión estructurada, no para generación de texto abierto; usarlo como chatbot general no es su propósito.
- Las cuantizaciones GGUF Q4 y Q5 no superaron los controles de calidad del autor; solo se recomiendan F32 y Q8_0 entre las variantes cualificadas.
- El paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo; las pruebas históricas de vídeo con compilación desde fuente no cualifican el binario precompilado.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisar el repositorio antes de desplegar en producción.
- No se documentan sesgos conocidos, idiomas soportados ni tasas de alucinación; al devolver probabilidades, la calibración de estas debería validarse en el dominio de uso.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de la API gratuita y del runtime propio deben consultarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Documentación de la API: https://valen-team.github.io/docs/valen/api/
- Guía de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Guía de elección de versión: https://valen-team.github.io/docs/valen/choosing/
- Validación: https://valen-team.github.io/cookbook/validation/
- Demo en vídeo: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
- Formato SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- Formato Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
