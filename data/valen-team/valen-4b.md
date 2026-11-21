# Valen-Team/Valen-4B

## Resumen

Valen-4B es un modelo multimodal de decisión desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.5-4B. No es un modelo generativo al uso: está especializado en producir salidas tipadas y estructuradas (predicados booleanos con probabilidad, clasificaciones, etiquetas de acción) a partir de entradas de texto, imagen o vídeo. Resuelve el problema de convertir juicios subjetivos o difusos ("¿cumple esta imagen los requisitos?", "¿qué acción procede aquí?") en decisiones programables con una probabilidad asociada, lo que lo hace adecuado para enrutado de tickets, cribado de imágenes de producto y etiquetado de vídeo.

El modelo tiene 4.540.981.545 parámetros (aproximadamente 4,5B) y se distribuye en formato nativo de Transformers (safetensors), con un repositorio de 9,4 GB. La model card menciona además variantes de formato ONNX y GGUF, así como tamaños de 0,8B y 2B dentro de la misma familia, aunque esta ficha se centra en la variante 4B. La licencia es Apache 2.0 y el modelo base es Qwen3.5-4B, por lo que hereda la arquitectura transformer de dicha familia.

Su relevancia actual radica en el enfoque de "modelo de decisión" con API de predicción (`model.predict`) y dos protocolos de decisión compatibles (SystemOne y Decisions), además de la publicación de código de entrenamiento y del dataset Valen-Training-General-100k, lo que permite reajustar el modelo a dominios propios. La model card advierte de que existe una versión posterior, Valen-Decision-1.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-4B), con código personalizado (`trust_remote_code`) |
| Parametros totales | 4.540.981.545 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y Q8_0 cualificados; Q4/Q5 fallaron los controles de calidad; ONNX q8-mlp en la familia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo Transformers); variantes ONNX y GGUF en la familia |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5B parámetros, y se distribuye con código personalizado que debe cargarse con `trust_remote_code=True`. La model card recomienda `attn_implementation="sdpa"`, `dtype="auto"`, `torch.set_float32_matmul_precision("highest")` y desactivar TF32 en cuDNN, lo que sugiere que la precisión numérica es crítica para la calibración de las probabilidades de salida. La entrada admite texto, imagen y vídeo (pipeline `image-text-to-text`), y la salida es tipada y estructurada: predicados con probabilidad, etiquetas de acción y clasificaciones.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO. Sí se publica el dataset Valen-Training-General-100k y el código de entrenamiento en GitHub, lo que permite reproducir o adaptar el ajuste fino. La innovación principal no es arquitectónica sino de interfaz: el modelo expone una API de decisión (`predict`) con dos protocolos (SystemOne de Jev y Decisions de OpenAI) y un formato de "estado compartido" (`shared-state`) para encadenar preguntas sobre una misma entrada.

## Capacidades

- Clasificación de mensajes de cliente y enrutado de tickets con probabilidad asociada.
- Verificación de imágenes contra requisitos (por ejemplo, cribado de imágenes de producto).
- Identificación de acciones en vídeo y etiquetado de contenido audiovisual.
- Salida estructurada y tipada: predicados booleanos con probabilidad, etiquetas y clasificaciones.
- Soporte de los protocolos de decisión SystemOne y Decisions.
- Manejo de estado compartido para formular varias preguntas sobre una misma entrada.
- Toma de decisiones en entornos tipo juego (se muestra una demo de Sokoban).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Enrutado de tickets de soporte: el modelo evalúa cada mensaje entrante con predicados ("¿es una incidencia de facturación?", "¿requiere intervención humana?") y devuelve probabilidades que el sistema usa para decidir el enrutado automático o la revisión manual.
- Cribado de imágenes de producto: se comprueba si una imagen cumple requisitos concretos (fondo, encuadre, presencia de elementos) mediante predicados con probabilidad, integrándose en el pipeline de publicación de un catálogo.
- Etiquetado de vídeo: identificación de acciones y eventos en clips para indexación, moderación o generación de metadatos.
- Moderación de contenido: clasificación de texto e imagen contra políticas definidas como preguntas tipadas, con umbral de probabilidad configurable.
- Automatización de decisiones en juegos y agentes: la demo de Sokoban muestra el uso del modelo para elegir acciones en entornos con estado, aplicable a agentes que operan sobre estados discretos.
- Reajuste para dominios propios: al publicarse el código de entrenamiento y el dataset Valen-Training-General-100k, un equipo puede afinar el modelo con sus propias preguntas y etiquetas para un dominio vertical.
- Despliegue en servicios C++ sobre CPU: mediante la variante GGUF con el runtime personalizado de Valen (solo F32/Q8_0 cualificados), para servicios de decisión de baja latencia sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "controles de calidad" que Q4/Q5 no superaron y una validación P1 con imágenes fijas sobre el binario precompilado con 0.8B Q8_0, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,54B parámetros, en F32 se requieren aproximadamente 18 GB de pesos; en Q8_0, unos 4,5-5 GB; en Q4, unos 2,5-3 GB (estimación por tamaño, no confirmada por el autor).
- GPU recomendadas: no disponible. El ejemplo oficial usa una GPU NVIDIA con CUDA y `sdpa`.
- Cabe en GPU de consumo: probablemente sí en cuantización Q8_0 o inferior en tarjetas con 8 GB o más, aunque el autor solo cualifica F32 y Q8_0 y no confirma requisitos por tarjeta.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; SDK de ONNX Runtime para Python/JavaScript; GGUF con el runtime personalizado de Valen para servicios C++ en CPU Linux; SGLang/vLLM para GPU; Python ONNX CUDA para GPU. No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles. La model card indica explícitamente que no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-4B | 4,54B | no disponible | Decisión multimodal con salida tipada | Apache 2.0 | Hugging Face, API gratuita, demo web |
| Valen-Decision-1.5-4B | no disponible | no disponible | Versión posterior de la familia | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | LLM generativo multimodal | no disponible | Hugging Face |
| Valen-0.8B / Valen-2B | 0,8B / 2B | no disponible | Misma familia, menor tamaño | Apache 2.0 (según familia) | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión estructurada) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir decisiones tipadas, no para generación de texto libre; usarlo como chatbot general no es su propósito.
- Solo F32 y Q8_0 han superado los controles de calidad; Q4 y Q5 fallaron dichos controles y no se recomiendan.
- El paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo; las pruebas históricas de vídeo con compilación desde fuente no cualifican el paquete precompilado.
- La validación P1 con imágenes se limita a 0.8B Q8_0 sobre el binario precompilado exacto y no se extiende a otros tamaños.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible.
- Idiomas soportados: no disponible; conviene validar el comportamiento en castellano antes de producción.
- Existe una versión posterior (Valen-Decision-1.5-4B); para nuevos proyectos conviene evaluar esa variante.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los componentes base y del dataset publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-4B
- Versión posterior: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Documentación de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Guía de elección de versión: https://valen-team.github.io/docs/valen/choosing/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- API SystemOne de Jev: https://docs.typesafe.ai/api/system-one
- API Decisions de OpenAI: https://developers.openai.com/api/docs/guides/decisions
