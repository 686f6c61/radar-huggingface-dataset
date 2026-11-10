# Valen-Team/Valen-0.8B

## Resumen

Valen-0.8B es un modelo de decisión multimodal desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.5-0.8B. Su propósito no es la generación libre de texto, sino la clasificación y la toma de decisiones estructuradas sobre entradas de texto, imagen y vídeo: clasificar mensajes de clientes, verificar si una imagen cumple requisitos o identificar acciones en un vídeo. El modelo devuelve respuestas tipadas (predicados con probabilidad, etiquetas estructuradas) en lugar de texto abierto, lo que lo hace adecuado para integrarse en pipelines de automatización.

Con 854.305.641 parámetros totales (aproximadamente 0,85B) y pesos en safetensors, es un modelo compacto que puede ejecutarse en hardware modesto. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y soporta inglés y chino. Su formato de pesos nativo es safetensors para Transformers, con variantes ONNX y GGUF distribuidas por el equipo.

Es relevante ahora porque cubre un nicho concreto —la decisión estructurada multimodal— que los LLM generativos no resuelven de forma nativa ni eficiente. El autor ha publicado también el código de entrenamiento, un dataset de 100k ejemplos y una API gratuita, lo que facilita la evaluación y el ajuste fino para tareas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-0.8B), con soporte de texto, imagen y vídeo; decodificación a salida tipada |
| Parametros totales | 854.305.641 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Nativo F32; ONNX q8-mlp; GGUF F32 y Q8_0 (Q4/Q5 descartados por no superar los controles de calidad) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (nativo), ONNX, GGUF |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 5.3 GB |

## Arquitectura y entrenamiento

Valen-0.8B parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de ~0,85B parámetros, y se somete a un ajuste fino completo (full-finetuning, según los tags del repositorio). La innovación principal no está en el backbone, sino en la interfaz de decisión: el modelo recibe una entrada (texto, imagen o vídeo) junto con un conjunto de preguntas tipadas y devuelve respuestas estructuradas con probabilidades asociadas. Soporta dos formatos de API de decisión, SystemOne (usado por Jev) y Decisions (usado por OpenAI), sobre el mismo modelo.

El autor publica el código de entrenamiento en GitHub y un dataset de entrenamiento de 100.000 ejemplos (Valen-Training-General-100k), lo que permite reproducir o ampliar el ajuste. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo incluye código personalizado (`trust_remote_code=True`) y una API `predict` para invocar las decisiones.

## Capacidades

- Clasificación de texto con salida tipada: predicados con probabilidad, etiquetas estructuradas y respuestas a preguntas definidas por el usuario.
- Comprensión de imagen para verificación de requisitos (por ejemplo, cribado de imágenes de producto).
- Comprensión de vídeo para identificación de acciones y etiquetado (con matices de soporte según el runtime, ver limitaciones).
- Decisión multimodal image-text-to-typed-output y structured-output.
- Soporte de estado compartido (shared-state) entre llamadas.
- Capacidades conversacionales básicas en inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modelo está orientado a decisiones puntuales, no a planificación autónoma.
- Capacidades multilingües: limitadas a inglés y chino.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica mensajes de clientes en categorías mediante preguntas tipadas y devuelve probabilidades por categoría, lo que permite derivar cada ticket al equipo adecuado con un umbral de confianza configurable.
- Cribado de imágenes de producto: verifica si una imagen cumple requisitos (fondo, presencia del producto, calidad) antes de publicarla en un catálogo, devolviendo predicados booleanos con probabilidad.
- Etiquetado de vídeo: identifica acciones o eventos en fragmentos de vídeo para indexación o moderación, usando el runtime que soporte vídeo (ver limitaciones sobre GGUF precompilado).
- Moderación de contenido estructurada: evalúa texto e imágenes contra políticas definidas como preguntas tipadas, con salida determinista y auditable.
- Automatización de decisiones en juegos o entornos simulados: el autor incluye una demo de Sokoban, lo que ilustra su uso para seleccionar acciones en entornos con estado.
- Ajuste fino para dominios propios: gracias a la publicación del código de entrenamiento y del dataset de 100k ejemplos, un equipo puede reentrenar el modelo para su taxonomía de decisión específica.
- Integración en aplicaciones Python/JavaScript offline mediante los SDK ONNX, sin necesidad de GPU en el caso de despliegue en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona controles de calidad internos (por ejemplo, que las cuantizaciones GGUF Q4/Q5 no los superan y solo se recomiendan F32/Q8_0), pero no se aportan cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada: con ~0,85B parámetros, la inferencia en F32 requiere del orden de 3,4 GB solo para pesos; en Q8_0, alrededor de 0,9 GB; en ONNX q8-mlp, cifras similares a Q8_0. Estas estimaciones son cálculo a partir del número de parámetros, no medidas publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para F32 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para Q8_0 basta con GPUs de gama de entrada.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, incluso con cuantización de 8 bits.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"`; ONNX Runtime (Python/JavaScript, CPU o CUDA); GGUF con el runtime personalizado de Valen (C++ en Linux CPU); SGLang/vLLM para despliegue en GPU. El autor no reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Valen-0.8B | 854M | no disponible | Texto, imagen, vídeo; salida tipada | Apache 2.0 | Afinado desde Qwen3.5-0.8B para decisiones estructuradas |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | Texto e imagen (modelo base) | no disponible en la información | Base del anterior; generativo, no especializado en decisiones |
| Valen-Decision-1.5-0.8B | no disponible | no disponible | Texto, imagen, vídeo; salida tipada | no disponible en la información | Versión posterior del mismo equipo, recomendada en la model card |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no se especifica, lo que dificulta planificar entradas largas.
- Vídeo en GGUF: el paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo; las pruebas históricas de vídeo con compilación desde fuente no cualifican el paquete precompilado.
- Cuantización: Q4 y Q5 no superan los controles de calidad del autor; solo se recomiendan F32 y Q8_0.
- Ecosistema: no se reclama soporte en llama.cpp u Ollama oficiales sin modificar; el despliegue requiere el runtime personalizado o backends específicos.
- Alucinación: al ser un modelo de decisión con salida probabilística, las respuestas deben tratarse como estimaciones y calibrarse con umbrales; no se aportan métricas de calibración.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes derivados de Qwen3.5-0.8B y del dataset de entrenamiento.
- Producción: el autor advierte que el tamaño de archivo no equivale al requisito de RAM y que no se promete rendimiento no medido; conviene validar en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-0.8B
- Versión posterior: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Repositorio de código y demos: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Guía de selección de versión: https://valen-team.github.io/docs/valen/choosing/
- Documentación de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
