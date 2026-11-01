# Thox-ai/ThoxMini-Phi4Mini

## Resumen

ThoxMini-Phi4Mini es un ajuste fino (SFT) del modelo microsoft/Phi-4-mini-instruct desarrollado por Thox-ai, un proyecto vinculado al ecosistema de dispositivos de IA personal THOX.ai. El modelo se presenta como el "flagship" conversacional de la gama ThoxMini y como carga útil del asistente en el host (ThoxBeam) para los dispositivos ThoxKey, que se sirven por malla en lugar de ejecutar el modelo en local. Con 3.836 millones de parámetros, está pensado para despliegue en el borde (edge-ai) y uso local-first.

El ajuste se ha realizado sobre un corpus propietario muy reducido (982 filas) orientado a la factualidad sobre productos y empresa THOX: el modelo responde a preguntas canónicas sobre THOX, rechaza información no publicada y corrige afirmaciones falsas conocidas. No es un modelo de propósito general mejorado, sino un asistente especializado en el dominio THOX con comportamiento de rechazo entrenado.

La relevancia actual radica en su enfoque: un modelo pequeño (4B) empaquetado con cuantizaciones GGUF listas para Ollama, licencia MIT y pesos fusionados en safetensors bf16, lo que facilita su despliegue en hardware de consumo. Su utilidad fuera del ecosistema THOX es limitada, pero sirve como ejemplo de ajuste fino de dominio con control de alucinaciones sobre un modelo Phi-4-mini.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Phi-4-mini-instruct, dense, con código remoto personalizado) |
| Parámetros totales | 3.836.021.760 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-4-mini-instruct; no confirmada en la información) |
| Tipos de cuantización | Q8_0, Q4_K_M (GGUF); pesos completos en bf16 safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, 2 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Phi-4-mini-instruct, un transformer denso de aproximadamente 3.8B parámetros. Sobre esa base se aplicó un ajuste QLoRA SFT con base cuantizada en 4-bit NF4 y adaptadores LoRA en todas las capas lineales (r=32, alpha=64, dropout 0.0). El entrenamiento usó pérdida sobre el prompt completo (full-prompt loss, sin completion-only loss), learning rate 1e-4 con schedule coseno, warmup de 10 pasos, 3 épocas, batch efectivo de 16 (micro-batch 4 × acumulación de gradiente 4) y longitud de secuencia de 1024. Se ejecutó en HF Jobs con flavor a10g-large, con versiones fijadas de torch 2.4.0, transformers 4.51.3, trl 0.15.2 y peft 0.14.0 (necesarias porque el código remoto del modelo base importa `LossKwargs`, eliminado en transformers 5.x).

Los datos de entrenamiento provienen del dataset Thox-ai/thox-factory-sft-v5 (fichero `train_wave_b.jsonl`), con 982 filas en formato de mensajes sistema/usuario/asistente. El corpus incluye hechos canónicos verificados de THOX, hechos de campaña enmarcados como preguntas, comportamientos de rechazo ante información no publicada (categorías de desconocidos y precios) y correcciones de afirmaciones falsas conocidas. No se emplearon datos de usuario, datos personales ni corpus de terceros. Tras el entrenamiento se realizó la fusión de los adaptadores (`merge_and_unload` en bf16) y se generaron las conversiones GGUF.

## Capacidades

- Generación de texto conversacional en inglés, con tono técnico y conciso ("house voice" de THOX).
- Respuesta a preguntas sobre productos y empresa THOX a partir de hechos canónicos.
- Comportamiento de rechazo entrenado ante información no publicada (precios, identidades de chipset no publicadas).
- Corrección de afirmaciones falsas conocidas sobre THOX.
- Enrutamiento de herramientas (tool routing) según la evaluación interna del autor.
- Capacidades generales de chat de modelo pequeño heredadas de Phi-4-mini-instruct (razonamiento básico, código y matemáticas elementales), aunque no se documentan explícitamente en la información disponible.
- Capacidades multilingües: no disponible más allá del inglés declarado.
- Modo thinking: no disponible (la información menciona un "thinking-off retest", lo que sugiere configuración sin modo de razonamiento extendido, pero no se detalla).

## Casos de uso

- Asistente de producto THOX en dispositivo: responder preguntas sobre especificaciones, funcionamiento y campaña de los dispositivos ThoxMini, ThoxKey, ThoxAir y ThoxClip usando los hechos canónicos del corpus de entrenamiento, con rechazo ante datos no publicados.
- Atención al cliente con control de alucinaciones: el modelo está entrenado para declinar preguntas sobre precios o información no publicada y remitir a thox.ai, lo que reduce el riesgo de respuestas inventadas en un canal de soporte.
- Servicio en malla para ThoxKey: actuar como carga útil del asistente en el host ThoxBeam, sirviendo a los dispositivos ThoxKey que no ejecutan el modelo en local.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M (unos 2,5 GB), puede ejecutarse vía Ollama o llama.cpp en equipos con recursos moderados, adecuado para demostraciones y pruebas offline.
- Enrutamiento de herramientas en flujos de dispositivo: el autor lo evaluó en task completion y tool routing, por lo que puede integrarse en pipelines de agentes ligeros que invoquen funciones del dispositivo.
- Base para ajustes de dominio: al ser un modelo pequeño con licencia MIT y pesos fusionados, sirve como punto de partida para otros SFT de dominio con corpus reducidos y control de rechazo.
- Prototipado de asistentes con grounding: su configuración desplegada incluye un system prompt de hechos del dispositivo (facts card v1.1.0), útil como patrón para asistentes que requieren anclaje factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una "fleet 49-question factuality gate" con preguntas en categorías verified/unknown/known_false/pricing, puntuación de rasgos 0-5 y fallo duro ante repetición de afirmaciones falsas conocidas, pero no se proporcionan los resultados numéricos de esa evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M; unos 4-5 GB con Q8_0; alrededor de 8 GB con pesos bf16 completos (más overhead de activaciones y contexto).
- GPU recomendadas: A10G (usada en el entrenamiento), A100, H100 para despliegue a escala; RTX 4090, RTX 3090 y GPUs consumer con 8 GB o más para inferencia local.
- Cabe en GPU de consumo: sí, con Q4_K_M en GPUs de 4-6 GB y con Q8_0 en GPUs de 8 GB o más.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxmini-phi4mini`), llama.cpp (GGUF), transformers (safetensors), text-generation-inference (etiqueta `text-generation-inference`); vLLM no está confirmado en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxMini-Phi4Mini | 3,84B | no disponible | MIT | HuggingFace, GGUF, Ollama | Ajuste de dominio THOX con rechazo entrenado |
| microsoft/Phi-4-mini-instruct | ~3,8B | no disponible en esta ficha | MIT | HuggingFace | Modelo base, propósito general, sin ajuste de dominio |
| ThoxNano-135M (tier) | ~135M | no disponible | no disponible | no disponible | Modelo en el dispositivo ThoxKey, no reemplazado por este build |

No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés y su corpus es de dominio THOX; su rendimiento en otros dominios o idiomas no está documentado.
- Riesgo de alucinación fuera del dominio entrenado: el comportamiento de rechazo está calibrado para hechos THOX, no para conocimiento general.
- El corpus de entrenamiento es muy reducido (982 filas), lo que limita la generalización y puede provocar sobreajuste al estilo y a los hechos concretos del corpus.
- Uso previsto restringido: el autor declara fuera de alcance la generación long-form abierta, el consejo médico o legal y el despliegue sin el system prompt de grounding (grounding_system.txt, facts card v1.1.0).
- El modelo debe servirse siempre con el prompt de hechos del dispositivo; su uso "desnudo" no está recomendado por el autor.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre exactitud factual fuera del corpus.
- El código remoto del modelo base requiere versiones específicas de transformers (4.51.3) y no es compatible con transformers 5.x, lo que complica la integración en stacks actualizados.
- No se documentan sesgos específicos; al entrenarse sin datos de usuario ni corpus de terceros, el riesgo de sesgos de dominio es bajo, pero no se ha evaluado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini
- Repo de pesos fusionados (registro de build): https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini-Merged
- Dataset de entrenamiento: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Sitio web de THOX.ai: https://www.thox.ai/
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=4tzhm0
