# Thox-ai/ThoxEdge-0.5B

## Resumen

ThoxEdge-0.5B es un ajuste fino del modelo Qwen2.5-0.5B-Instruct desarrollado por Thox-ai como asistente en dispositivo (on-device) para el nivel ThoxMini de su familia de dispositivos. Se trata de un fine-tune LoRA de rango 32 sobre un corpus propio de 982 ejemplos de chat, uso de herramientas y factualidad, fusionado en los pesos base. El modelo resuelve el problema de disponer de un asistente conversacional y de enrutamiento de intenciones que funcione completamente offline en hardware de gama baja, con los hechos suministrados por la capa de servicio.

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only de aproximadamente 494 millones de parámetros, licencia Apache-2.0 y capacidades multilingües limitadas al inglés según la model card. El repositorio distribuye los pesos fusionados en safetensors, una cuantización GGUF Q4_K_M de unos 398 MB y un Modelfile para Ollama, lo que facilita su despliegue en portátiles y equipos de sobremesa sin GPU dedicada.

Su relevancia actual radica en la tendencia hacia modelos locales de muy bajo coste computacional para asistentes de dispositivo, donde la privacidad y la latencia importan más que la amplitud de capacidades. No obstante, el propio autor advierte que los pesos por sí solos no son una fuente fiable de hechos de THOX y que el despliegue requiere grounding en la capa de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M; safetensors en precision original |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar y alrededor de 494 millones de parámetros. Sobre esa base, Thox-ai aplicó un ajuste fino LoRA de rango 32 entrenado con un corpus propio de 982 ejemplos que cubren conversación, uso de herramientas y factualidad, y posteriormente fusionó los adaptadores en los pesos base. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO adicionales.

El entrenamiento se orienta a comportamientos concretos (voz de marca, enrutamiento de intenciones y respuestas con abstención ante preguntas difíciles) más que a una mejora de capacidades generales. El autor lo describe explícitamente como "una capa de hechos y comportamiento, no una mejora de capacidad". No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional para respuestas cortas en inglés.
- Enrutamiento de intenciones hacia funciones de dispositivo y de malla (mesh) en el ecosistema THOX.
- Uso de herramientas y function calling dentro del corpus de entrenamiento.
- Comportamiento de abstención ante preguntas fuera de alcance o sin grounding.
- Estilo de voz de marca THOX en las respuestas.
- Ejecución completamente offline en dispositivos de gama baja.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso complejo.

## Casos de uso

- Asistente de dispositivo local: el modelo gestiona conversaciones cortas y enruta intenciones a funciones del dispositivo (ajustes, comandos de malla) sin conexión, adecuado por su tamaño de 0,5B y su formato GGUF Q4_K_M de 398 MB.
- Enrutamiento de comandos en ecosistemas IoT: integrado en la capa de servicio de ThoxMini, clasifica la intención del usuario y la deriva a la función correspondiente del dispositivo o de la malla.
- Asistente de privacidad en portátiles: al ejecutarse vía Ollama en CPU, permite conversaciones locales sin enviar datos a la nube, apropiado para entornos con requisitos de confidencialidad.
- Prototipado de asistentes de voz embebidos: sirve como componente de generación de respuestas en pipelines donde la latencia y el consumo de memoria son críticos.
- Filtro de abstención y control de alcance: su comportamiento entrenado de declinar preguntas difíciles lo hace útil como capa de guardia en flujos donde se prefiere no responder antes que alucinar.
- Demostraciones y pruebas de concepto de asistentes de marca: permite validar la experiencia conversacional de un producto sin infraestructura de GPU.
- Educación y experimentación con fine-tuning: al ser un ajuste LoRA sobre una base Apache-2.0, sirve como ejemplo reproducible de personalización de modelos pequeños.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---:|
| THOX GATE49 (factualidad, conjunto de desarrollo) | 47/49, media 4.837/5 |
| Fallos duros | 1 (pregunta de precios respondida sin la abstención requerida) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato de evaluación es el gate interno de factualidad del autor, que además no supera su propia política de cero fallos duros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (archivo GGUF de 397.807.488 bytes); aproximadamente 1-2 GB en safetensors a precisión original.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer con 2 GB o más de VRAM es suficiente.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, integradas) e incluso en dispositivos de placa única.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxedge-0.5b`), llama.cpp con el GGUF, y descarga directa desde Hugging Face para uso con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ThoxEdge-0.5B | 0,5B | no disponible | Apache-2.0 | Hugging Face, Ollama |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | Apache-2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 0,36B | no disponible | Apache-2.0 | Hugging Face |

La comparación con alternativas se limita a parámetros y licencia, ya que la información disponible no incluye resultados de benchmarks estándar para ThoxEdge-0.5B ni datos de contexto de los modelos comparados. ThoxEdge-0.5B se diferencia de su base por el ajuste de comportamiento y por incluir GGUF y Modelfile listos para Ollama.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad intrínsecamente limitada; el fine-tune no mejora las capacidades generales, solo el comportamiento y la factualidad del dominio THOX.
- Los pesos por sí solos no son una fuente fiable de hechos de THOX; el despliegue requiere grounding en la capa de servicio.
- El build publicado no supera la política de cero fallos duros del propio gate del autor (1 fallo en la pregunta de precios).
- Riesgo de alucinación en las categorías débiles; se esperan abstenciones correctas más que respuestas correctas en preguntas difíciles.
- Idiomas: solo inglés según la model card; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto no documentada en la información disponible.
- Uso fuera de alcance: decisiones médicas, legales o de seguridad sin supervisión humana.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción sin la capa de servicio asociada.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Ollama: `ollama run Thox-ai/thoxedge-0.5b`
