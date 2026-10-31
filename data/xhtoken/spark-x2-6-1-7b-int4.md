# XHToken/Spark-X2.6-1.7B-INT4

## Resumen

Spark-X2.6-1.7B-INT4 es la versión cuantizada a 4 bits (formato compressed-tensors) del modelo Spark-X2.6-1.7B, desarrollado por XHToken como segundo modelo de la serie Spark-X2.6, tras el lanzamiento de Spark-X2.6-4B. Se trata de un modelo de lenguaje compacto y de propósito general orientado al despliegue en dispositivo (on-device), que hereda exactamente la arquitectura de Spark-X2.5-1.7B y obtiene sus mejoras mediante un post-entrenamiento más refinado.

La versión 2.6 aporta avances sustanciales en código, capacidades de agente, contexto largo, multilingüismo y razonamiento, con rendimientos que, según el autor, alcanzan resultados de estado del arte entre modelos open source de tamaño comparable. Un rasgo distintivo es su presupuesto de pensamiento configurable (thinking budget) con tres niveles (ninguno, bajo, alto), que permite equilibrar calidad de razonamiento, latencia y coste de inferencia.

Esta variante INT4 reduce el tamaño del repositorio a 1,7 GB, lo que la hace especialmente adecuada para inferencia local en hardware limitado, manteniendo el soporte de contextos de hasta 1.048.576 tokens en servidores como SGLang y una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura idéntica a Spark-X2.5-1.7B; detalles finos no disponibles) |
| Parametros totales | 974.178.304 (según safetensors de esta versión INT4) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens (configuración de servidor SGLang); el ejemplo de Transformers usa max_new_tokens de 131.072 |
| Tipos de cuantizacion | INT4 (compressed-tensors) |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors; requiere trust_remote_code=True (arquitectura custom spark2_5) |

## Arquitectura y entrenamiento

El modelo conserva exactamente la misma arquitectura que Spark-X2.5-1.7B, un modelo de tipo decoder basado en transformer con arquitectura personalizada (custom_code, arquitectura spark2_5). Las mejoras de la versión 2.6 no provienen de cambios arquitectónicos, sino de un post-entrenamiento mejorado que refuerza capacidades de código, uso complejo de herramientas, planificación multi-paso, ingeniería de software y razonamiento sobre contextos extendidos.

Entre las innovaciones destacadas figura el sistema de presupuesto de pensamiento configurable, con tres niveles de razonamiento (none, low, high) seleccionables mediante el parámetro enable_thinking en la plantilla de chat, y una implementación optimizada de llama.cpp mantenida por el propio autor, que amplifica el rendimiento de decodificación en hardware como la RTX 4090. No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat compatible con el ecosistema Transformers.
- Razonamiento configurable: tres niveles de thinking (none, low, high) balanceando calidad, latencia y coste.
- Capacidades agénticas: uso complejo de herramientas (tool calling), con parser específico spark25 en SGLang, y planificación multi-paso.
- Tareas de código e ingeniería de software, con mejoras sustanciales respecto a la generación anterior.
- Razonamiento sobre contextos largos, con soporte de hasta 1.048.576 tokens en despliegues con memoria suficiente.
- Eficiencia de inferencia en dispositivo, con throughput de decodificación líder entre modelos de tamaño comparable según las evaluaciones del autor.

## Casos de uso

- Asistentes de IA en dispositivo: su tamaño reducido (1,7 GB cuantizado a INT4) y su alto throughput de decodificación lo hacen idóneo para aplicaciones locales que respondan en tiempo real sin depender de la nube.
- Agentes con tool calling en local: el parser de tool calls spark25 en SGLang y las mejoras en planificación multi-paso permiten construir agentes que ejecuten herramientas de forma autónoma en portátiles o estaciones de trabajo.
- Asistencia de código offline: las mejoras en programación lo hacen útil para autocompletado y generación de código en IDEs locales, sin enviar código propietario a servicios externos.
- Procesamiento de documentos largos: la ventana de contexto de hasta ~1M tokens permite resumir o analizar documentos extensos, aunque en este tamaño de modelo y con hardware limitado conviene reducir el contexto configurado.
- Chatbots bilingües inglés-chino: soporte nativo de ambos idiomas con control de presupuesto de razonamiento para ajustar latencia según la carga.
- Despliegue en servidores de inferencia autoalojados: la licencia Apache 2.0 y la compatibilidad con SGLang (incluidos NPU Ascend A2/A3) facilitan montar APIs OpenAI-compatibles propias sin coste de licencias.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una gráfica comparativa (images/all_benchmark.svg) que afirma que el modelo supera a modelos de tamaño comparable en la mayoría de tareas evaluadas (agente, código, matemáticas, general y conocimiento), pero no se proporcionan cifras concretas en formato texto. En pruebas internas del autor, el modelo muestra un throughput de decodificación líder frente a Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B en contextos cortos, ampliado por su implementación optimizada de llama.cpp en RTX 4090.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB solo de pesos en INT4; con overhead de KV cache y activaciones, entre 2 y 4 GB para contextos moderados. Para contexto de 1.048.576 tokens se requiere memoria de dispositivo considerable (el propio autor recomienda reducir --context-length si es necesario).
- GPU recomendadas: cualquier GPU moderna con más de 4 GB de VRAM; el autor documenta pruebas en RTX 4090. Compatible también con NPU Ascend (series A2 y A3) mediante imágenes SGLang específicas.
- Consumer GPUs: cabe con holgura en GPUs como RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o superiores, e incluso en portátiles con GPU dedicada de 4 GB para contextos cortos.
- Opciones de despliegue: Transformers 4.57.1 (con trust_remote_code=True), SGLang (vía Docker, con imágenes para NVIDIA y Ascend), y llama.cpp mediante el fork optimizado del autor (https://github.com/XHToken/llama.cpp). No se menciona soporte oficial de Ollama, TGI ni vLLM.
- Latencia y throughput: no disponibles en cifras concretas; el autor indica throughput de decodificación líder entre modelos de tamaño comparable en sus evaluaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B-INT4 | ~0,97 B (INT4) | Hasta 1.048.576 tokens | Apache 2.0 | Thinking budget configurable, tool calling, fork propio de llama.cpp |
| Qwen3.5-2B (según autor) | ~2 B | no disponible | no disponible | Usado como referencia de rendimiento en las evaluaciones del autor |
| MiniCPM-2B (según autor) | ~2 B | no disponible | no disponible | Referencia de comparación en throughput on-device |
| LFM2.5-2.6B (según autor) | ~2,6 B | no disponible | no disponible | Referencia de comparación en throughput on-device |

Los datos de las alternativas provienen únicamente de las menciones en la model card; no se dispone de especificaciones verificadas de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones numéricas independientes; las afirmaciones de estado del arte provienen exclusivamente del autor y se apoyan en imágenes SVG no legibles como datos.
- El modelo requiere trust_remote_code=True y una versión concreta de Transformers (4.57.1), lo que introduce código arbitrario del autor y dependencias versionadas: revisar el código remoto antes de usarlo en producción.
- Es una versión cuantizada INT4 de un modelo base; la cuantización puede degradar la calidad respecto a los pesos en precisión completa, y no se publican evaluaciones de la pérdida por cuantización.
- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado.
- El contexto máximo de ~1M tokens exige memoria considerable; en hardware limitado debe reducirse explícitamente.
- Sesgos conocidos, tasas de alucinación y riesgos de seguridad específicos: no disponibles.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, aunque el modelo es muy reciente (creado en octubre de 2026) y con muy poca adopción registrada (75 descargas), por lo que la madurez del ecosistema y la detección de errores aún son limitadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XHToken/Spark-X2.6-1.7B-INT4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Fork optimizado de llama.cpp: https://github.com/XHToken/llama.cpp
- Comunidad Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
