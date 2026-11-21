# Valen-Team/Valen-2B

## Resumen

Valen-2B es un modelo multimodal de decisión desarrollado por Valen-Team, construido mediante fine-tuning completo sobre el modelo base Qwen/Qwen3.5-2B. A diferencia de los modelos generativos convencionales, Valen está diseñado específicamente para emitir decisiones estructuradas y probabilidades tipadas sobre entradas multimodales (texto, imágenes y vídeo), en lugar de generar texto libre. El modelo se presenta como una alternativa especializada para clasificación, enrutado y verificación de contenido en pipelines de producción.

Con 2.214.825.577 parámetros totales (aproximadamente 2,2 mil millones), Valen-2B se posiciona en la gama compacta de modelos multimodales, lo que lo hace desplegable en hardware relativamente modesto. Forma parte de una familia de tres tamaños (0.8B, 2B y 4B) y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y soporte para transformers con `trust_remote_code`. Su enfoque en "decision-making" y salidas tipadas estructuradas lo diferencia de los modelos de chat generalistas.

El modelo es relevante para desarrolladores que necesitan automatizar tareas de clasificación y enrutado con garantías de formato de salida, como la clasificación de tickets de soporte, la verificación de imágenes de producto o el etiquetado de acciones en vídeo. Valen-Team publica además código de entrenamiento, datos de entrenamiento y una API gratuita, lo que facilita la evaluación y el ajuste fino para dominios específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tuning completo de Qwen/Qwen3.5-2B), con salida de decisiones tipadas |
| Parametros totales | 2.214.825.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, Q8_0 (GGUF), ONNX q8-mlp; Q4/Q5 no recomendados (no superan los controles de calidad) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); variantes ONNX y GGUF distribuidas por el equipo |

## Arquitectura y entrenamiento

Valen-2B se basa en Qwen/Qwen3.5-2B, un transformer multimodal capaz de procesar entradas de texto, imagen y vídeo (pipeline image-text-to-text). Sobre esta base se aplicó un fine-tuning completo (full-finetuning), no un ajuste de adaptadores, orientado a convertir el modelo generativo en un modelo de decisión con salida estructurada. La arquitectura conserva el backbone del modelo base, pero la cabeza de salida y el protocolo de inferencia se adaptan para emitir respuestas tipadas (predicados, probabilidades, decisiones estructuradas) en lugar de texto libre.

El modelo soporta dos formatos de API de decisión: SystemOne (usado por Jev) y Decisions (usado por OpenAI), ambos operando sobre el mismo modelo. El entrenamiento se realizó sobre el dataset publicado Valen-Training-General-100k, y Valen-Team libera también el código de entrenamiento en su repositorio de GitHub. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO. Una innovación destacable es la exposición de probabilidades calibradas por pregunta, que permite a las aplicaciones aplicar políticas de incertidumbre y derivar casos ambiguos a revisión humana.

## Capacidades

- Clasificación de mensajes de clientes y enrutado de tickets con salida probabilística tipada.
- Verificación de imágenes contra requisitos definidos (por ejemplo, cribado de imágenes de producto).
- Identificación de acciones y eventos en vídeo (etiquetado de vídeo).
- Salida estructurada y tipada (predicados, preguntas con nombre, probabilidades) en lugar de texto libre.
- Soporte de dos protocolos de decisión: SystemOne y Decisions.
- Procesamiento multimodal: texto, imagen y vídeo como entradas.
- Capacidades conversacionales heredadas del modelo base Qwen3.5-2B.
- Soporte multilingüe limitado a inglés y chino.
- Integración con transformers mediante `trust_remote_code` y `AutoModel`.
- Despliegue en ONNX Runtime (Python/JavaScript), GGUF con runtime personalizado de Valen (C++ Linux CPU) y SGLang/vLLM para GPU.

## Casos de uso

- Enrutado automático de tickets de soporte: el modelo clasifica mensajes de clientes y devuelve probabilidades por categoría, permitiendo derivar automáticamente los casos claros y escalar a revisión humana los ambiguos según una política de incertidumbre.
- Cribado de imágenes de producto en marketplaces: Valen verifica si una imagen cumple requisitos predefinidos (fondo, encuadre, presencia de elementos) y emite una decisión tipada con probabilidad asociada, integrándose en pipelines de moderación.
- Etiquetado y análisis de vídeo: identificación de acciones o eventos en secuencias de vídeo para indexación, moderación o generación de metadatos, usando el soporte nativo de vídeo del modelo.
- Automatización de atención al cliente multi-turno: el modelo puede gestionar conversaciones conversacionales gracias a las capacidades heredadas de Qwen3.5-2B, combinando generación de texto con decisiones estructuradas.
- Verificación de contenido en flujos de publicación: comprobación automática de que textos o imágenes cumplen políticas antes de su publicación, con salida probabilística auditable.
- Integración en aplicaciones Python/JavaScript offline: mediante los SDK ONNX, el modelo puede ejecutarse localmente sin GPU para tareas de clasificación en dispositivos o entornos sin acceso a servicios en la nube.
- Servicios C++ en Linux sobre CPU: despliegue con GGUF y el runtime personalizado de Valen para servicios de decisión de baja latencia sin GPU.
- Ajuste fino para dominios específicos: al publicarse el código de entrenamiento y el dataset, equipos pueden adaptar Valen a sus propias taxonomías de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,2 mil millones de parámetros, la inferencia en F32 requiere aproximadamente 9 GB de VRAM solo para pesos, mientras que Q8_0 reduce esta cifra a aproximadamente 2,2-2,5 GB (estimación basada en el tamaño de parámetros, no confirmada por el autor).
- GPU recomendadas: el ejemplo oficial de carga usa una GPU NVIDIA con CUDA; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: probable en GPUs consumer con suficiente VRAM para la cuantización elegida; no confirmado por el autor.
- Opciones de despliegue: transformers (Python, GPU), ONNX Runtime (Python/JavaScript, offline), GGUF con runtime personalizado de Valen (C++ Linux CPU), SGLang/vLLM para GPU.
- Nota importante: la build GGUF 0.1.0 precompilada no compila soporte directo de vídeo; solo F32 y Q8_0 superan los controles de calidad (Q4/Q5 fallan). No se garantiza compatibilidad con llama.cpp/Ollama oficiales sin modificaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Valen-2B | 2,2B | no disponible | Decisión multimodal tipada (texto/imagen/vídeo) | Apache 2.0 | Hugging Face, ONNX, GGUF, API gratuita |
| Valen-0.8B | ~0,8B (no confirmado) | no disponible | Decisión multimodal tipada | Apache 2.0 (presumible) | Hugging Face, GGUF Q8_0 validado |
| Valen-4B | ~4B (no confirmado) | no disponible | Decisión multimodal tipada | Apache 2.0 (presumible) | Hugging Face |
| Qwen3.5-2B (base) | ~2B | no disponible | Generación multimodal generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas soportados limitados a inglés y chino; no se declara soporte para castellano ni otros idiomas.
- Riesgo de alucinación inherente al modelo base generativo; las decisiones probabilísticas deben tratarse como estimaciones, no como verdades absolutas.
- Las cuantizaciones Q4 y Q5 no superan los controles de calidad del autor; solo se recomiendan F32 y Q8_0.
- La build GGUF precompilada 0.1.0 no incluye soporte directo de vídeo; las pruebas históricas de vídeo con compilación desde fuente no validan el paquete precompilado.
- No se garantiza compatibilidad con llama.cpp u Ollama oficiales sin modificaciones.
- El tamaño del repositorio (13,5 GB) no debe confundirse con los requisitos de RAM; el autor advierte explícitamente contra esta interpretación.
- No se dispone de información sobre sesgos específicos, número de tokens de entrenamiento ni composición del dataset.
- Aunque la licencia es Apache 2.0 (permite uso comercial), deben revisarse las condiciones del modelo base Qwen3.5-2B y de los datasets asociados.
- El modelo está orientado a decisiones estructuradas; no es adecuado como modelo generativo generalista de propósito abierto.
- Existe una versión más reciente, Valen-Decision-1.5-2B, que el autor recomienda para nuevos desarrollos.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Team/Valen-2B
- Versión más reciente: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guía de selección de versión: https://valen-team.github.io/docs/valen/choosing/
- Documentación de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
