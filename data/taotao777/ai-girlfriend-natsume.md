# TAOTAO777/ai-girlfriend-natsume

## Resumen

Este repositorio no contiene un modelo único, sino un paquete de distribución que reúne varios modelos comunitarios de código abierto para el proyecto "AI Girlfriend — Shiki Natsume and atri", también conocido como Artemis. El autor, TAOTAO777, actúa únicamente como espejo y redistribuidor de modelos existentes, sin reclamar propiedad sobre ninguno de ellos. El componente principal es un modelo de lenguaje Qwen3.6-35B-A3B-APEX en formato GGUF, complementado con dos checkpoints de Stable Diffusion para generación de imágenes (WAI-Nsfw-Illustrious-17 y miaomiaoHarem_v20) y pesos de GPT-SoVITS para síntesis de voz.

El proyecto está diseñado para ejecutarse completamente en local, integrando el LLM con un bot de QQ y Telegram, un escritorio con mascota virtual (Sakura Desktop Pet) y ComfyUI para generar imágenes. El caso de uso principal es el rolplay de pareja virtual con un personaje llamado Shiki Natsume, que se describe como una figura alta, distante y de exterior frío con una calidez oculta. El repositorio es relevante para desarrolladores interesados en montar asistentes personales o compañeros virtuales autohospedados, ya que demuestra un stack completo de modelos de IA multimodal funcionando de forma integrada.

La licencia general del repositorio no está especificada, pero los modelos individuales tienen licencias propias: el LLM Qwen es Apache 2.0, mientras que los checkpoints de imagen son modelos comunitarios de CivitAI. El proyecto declara explícitamente que es no comercial y de uso personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6-35B-A3B-APEX) + Stable Diffusion (checkpoints) + GPT-SoVITS (TTS) |
| Parametros totales | 27.320.697.856 (solo el LLM, según safetensors) |
| Parametros activos | 3.000.000.000 (estimado por el nombre A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (versión Compact, cuantización no especificada) |
| Idiomas soportados | no disponible (Qwen soporta múltiples idiomas, pero no se especifica para esta versión) |
| Licencia | no disponible para el repositorio; Apache 2.0 para el LLM Qwen; licencia comunitaria para los checkpoints de imagen; libre para los pesos de voz |
| Formato de pesos | GGUF (LLM), safetensors (checkpoints de imagen), ckpt/pth (voz) |

## Arquitectura y entrenamiento

El componente LLM es una variante de Qwen3.6 con arquitectura MoE (Mixture of Experts) de 35 mil millones de parámetros totales y 3 mil millones activos por token, según la nomenclatura del nombre. El archivo GGUF presente en el repositorio se denomina "APEX-I-Compact", lo que sugiere una versión compactada y posiblemente ajustada con técnicas de afinación específicas para rolplay sin censura (el nombre original incluye "uncensored-heretic-APEX"). No se dispone de detalles sobre el entrenamiento, el número de tokens o el dataset utilizado.

Los checkpoints de imagen son modelos de difusión basados en la arquitectura Stable Diffusion, concretamente WAI-Nsfw-Illustrious-17 (una versión del modelo Illustrious, conocido por su calidad en ilustraciones anime) y miaomiaoHarem_v20, ambos orientados a generación de arte anime. Los pesos de GPT-SoVITS corresponden a un modelo de síntesis de voz entrenado por el propio autor del repositorio, sin detalles sobre el dataset de voz.

No se ha publicado información sobre técnicas de alineación como RLHF o DPO para el LLM, aunque el nombre "uncensored" sugiere que se ha eliminado parcialmente el filtrado de contenido.

## Capacidades

- Generación de texto conversacional para rolplay: el LLM está afinado para mantener conversaciones de pareja virtual con un personaje con personalidad definida.
- Generación de imágenes anime: los checkpoints de Stable Diffusion permiten crear ilustraciones de personajes en estilo anime, incluyendo contenido NSFW.
- Síntesis de voz: GPT-SoVITS permite generar voz sintetizada con la entonación del personaje, probablemente clonando una voz de referencia.
- Integración multimodal: el proyecto combina texto, imagen y voz en un flujo unificado mediante OpenClaw (agente) y ComfyUI.
- Conectividad con plataformas de mensajería: soporta bots de QQ y Telegram para interactuar con el personaje a través de estas aplicaciones.
- Ejecución completamente offline: todos los modelos se ejecutan localmente, sin dependencia de servicios en la nube.

## Casos de uso

- Pareja virtual autohospedada: el caso principal del proyecto. Un usuario puede desplegar el stack completo en su propio hardware y mantener conversaciones románticas con el personaje Shiki Natsume, con respuestas de voz e imágenes generadas en tiempo real.
- Asistente personal con personalidad: el LLM puede adaptarse para actuar como un asistente con una personalidad concreta, útil para experimentar con agentes conversacionales con carácter.
- Generación de contenido anime para proyectos personales: los checkpoints de imagen permiten crear ilustraciones de personajes originales o fanart, integrables en pipelines de ComfyUI.
- Sistema de voz para personajes virtuales: los pesos de GPT-SoVITS pueden usarse para dar voz a avatares en juegos, vídeos o aplicaciones de escritorio.
- Banco de pruebas para integración multimodal: desarrolladores pueden estudiar cómo combinar un LLM, un modelo de difusión y un TTS en un solo sistema, usando este repositorio como referencia de arquitectura.
- Educación sobre despliegue local de IA: el proyecto demuestra cómo orquestar múltiples modelos de IA en un entorno doméstico, útil para talleres o tutoriales sobre autohospedaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo Qwen3.6-35B-A3B-APEX no tiene métricas públicas de MMLU, HumanEval, GSM8K ni otros estándares en este repositorio. Tampoco se dispone de comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia del LLM: no disponible. Dado que es un MoE de 35B totales con 3B activos, una cuantización GGUF de 4 bits podría requerir entre 8 y 12 GB de VRAM para inferencia, pero no hay datos confirmados.
- GPU recomendadas: el proyecto se ejecuta en local, por lo que se necesitan GPUs con al menos 8 GB de VRAM para el LLM, y adicionalmente VRAM para ComfyUI (los checkpoints de imagen suelen necesitar 6-8 GB adicionales). Una RTX 3090 o RTX 4090 sería adecuada para ejecutar todo el stack simultáneamente.
- Si cabe en consumer GPU: sí, es posible con GPUs de gama alta para consumidores, aunque ejecutar todos los modelos a la vez puede requerir más de 16 GB de VRAM.
- Opciones de despliegue: el proyecto utiliza llama.cpp para el LLM, ComfyUI para los checkpoints de imagen y GPT-SoVITS para la voz. También menciona vLLM como opción alternativa para el LLM.
- Latencia y throughput: no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar este paquete con alternativas equivalentes. El LLM subyacente (Qwen3.6-35B-A3B) es comparable a otros MoE de tamaño similar como Mixtral 8x7B o Qwen2.5-32B-A3B, pero al ser una variante modificada y sin benchmarks públicos, no es posible establecer una comparación rigurosa. Los checkpoints de imagen compiten con otros modelos de difusión anime como Anything V5 o Counterfeit, pero no hay métricas objetivas disponibles.

## Limitaciones y advertencias

- El repositorio es un mirror no oficial: el autor no es el creador de los modelos originales y no puede garantizar la integridad o el mantenimiento de las fuentes.
- Contenido NSFW: los modelos de imagen y el LLM están orientados a contenido para adultos. Su uso en entornos laborales o públicos puede ser inapropiado.
- Licencias ambiguas: aunque el LLM Qwen es Apache 2.0, los checkpoints de CivitAI tienen licencias comunitarias que pueden restringir el uso comercial. El repositorio declara explícitamente que es no comercial.
- Riesgo de alucinación y sesgos: al ser un modelo afinado para rolplay sin censura, puede generar contenido ofensivo, falso o inapropiado. No se ha realizado ninguna evaluación de seguridad.
- Dependencia de múltiples componentes: el stack completo requiere configurar correctamente OpenClaw, llama.cpp, ComfyUI y GPT-SoVITS, lo que implica una curva de aprendizaje alta.
- Sin soporte oficial: el autor es un particular y no ofrece garantías de soporte técnico ni actualizaciones.
- Idiomas: no se especifica qué idiomas soporta el LLM. Qwen3.6 suele ser multilingüe, pero esta variante podría estar limitada al inglés o chino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TAOTAO777/ai-girlfriend-natsume
- Proyecto principal (GitHub): https://github.com/TAOTAO777/ai-girlfriend-natsume
- Modelo LLM original: https://huggingface.co/mudler/Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF
- Checkpoint WAI-Nsfw-Illustrious-17: https://civitai.com/models/1185480
- Checkpoint miaomiaoHarem_v20: https://civitai.com/models/1033365
- Proyecto derivado openclaw_based_ai_waifu: https://github.com/sirarthur2479/openclaw_based_ai_waifu
- Proyecto derivado Artemis-for-agent: https://github.com/BSZMK/Artemis-for-agent
