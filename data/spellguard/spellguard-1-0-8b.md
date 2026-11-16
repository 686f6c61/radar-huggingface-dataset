# Spellguard/Spellguard-1.0-8B

## Resumen

Spellguard-1.0-8B es un modelo guardián (guard model) de pesos abiertos desarrollado por Spellguard, especializado en moderación de contenido y detección de ataques dirigidos a agentes de IA. Se trata de un fine-tune de Qwen3Guard-Gen-8B que conserva la misma arquitectura, plantilla de chat, formato de respuesta (`Safety:` y `Categories:`) y taxonomía de categorías del modelo base, lo que permite sustituirlo de forma directa en pipelines existentes. Resuelve tres problemas concretos: clasificación de prompts dañinos, moderación de respuestas del modelo y detección de prompt injection y jailbreaks.

El modelo resulta relevante porque mejora de forma notable la detección de prompt injection respecto a su base (de 55,44 a 75,64 en el benchmark Horizon prompt injection, un incremento de 20,21 puntos) y reduce drásticamente los falsos positivos en peticiones benignas (PHTest harmless accuracy de 80,69 a 94,56), manteniendo el mismo coste computacional que el modelo original. Con 8.190.735.360 parámetros, licencia Apache 2.0 y compatibilidad con transformers y text-generation-inference, está pensado para desplegarse como capa de seguridad delante de agentes conversacionales y aplicaciones de chat en producción.

La ficha se basa en la model card publicada por el autor y en los metadatos del repositorio de Hugging Face; los resultados de benchmarks proceden de evaluaciones ejecutadas por el propio autor, no de envíos oficiales a leaderboards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, fine-tune de Qwen3Guard-Gen-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se publica una version Q4_K_M en el repo GGUF); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo `Spellguard/Spellguard-1.0-8B-GGUF`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8.190.735.360 parámetros obtenido por fine-tune supervisado de Qwen3Guard-Gen-8B. Mantiene la interfaz del modelo base: recibe turnos de usuario (y opcionalmente un turno de asistente para moderar respuestas) y devuelve una etiqueta `Safety: Safe|Unsafe|Controversial` junto con `Categories: ...`; en moderación de respuestas añade además `Refusal: Yes|No`. Las categorías cubiertas son Violent, Non-violent Illegal Acts, Sexual Content or Sexual Acts, PII, Suicide & Self-Harm, Unethical Acts, Politically Sensitive Topics, Copyright Violation y Jailbreak (esta última solo para prompts).

El entrenamiento combina una veintena de datasets públicos orientados a seguridad, jailbreak e inyección de prompts (WildGuardMix, Aegis-AI-Content-Safety-Dataset-2.0, WildJailbreak, Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, Nemotron-RL-Jailbreak-Robustness-v1, LLMail-Inject, JailbreakV-28k, deepset/prompt-injections, Gandalf ignore-instructions, entre otros) con datos de instrucciones y conversación (oasst2, aya_dataset, glaive-function-calling-v2), código (commitpackft) y texto educativo (fineweb-edu). La model card no detalla el número de tokens de entrenamiento, la composición exacta por dataset ni si se aplicaron etapas de RLHF o DPO; únicamente indica que es un fine-tune del modelo base. Tampoco se documentan innovaciones arquitectónicas propias: la mejora se atribuye al ajuste fino sobre datos de seguridad e inyección.

## Capacidades

- Clasificación de seguridad de prompts: devuelve `Safe`, `Unsafe` o `Controversial` con categorías asociadas.
- Moderación de respuestas del modelo: evalúa un par usuario-asistente y añade el campo `Refusal: Yes|No`.
- Detección de prompt injection: el texto no confiable (resultado de herramienta, página web, documento, correo) se coloca en el turno de usuario y una inyección se devuelve como `Safety: Unsafe` con `Categories: Jailbreak`.
- Detección de jailbreaks y ataques de evasión de instrucciones.
- Clasificación en nueve categorías de contenido dañino (violencia, actos ilegales no violentos, contenido sexual, PII, autolesiones, actos poco éticos, temas políticamente sensibles, copyright y jailbreak).
- Integración como guardrail en pipelines de agentes: la model card lo presenta explícitamente para proteger agentes de IA y aplicaciones de chat.
- Compatibilidad con tool calling y conversaciones multi-turno heredada del modelo base (los datasets de entrenamiento incluyen glaive-function-calling-v2 y tool-response-injections).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Moderación de prompts en aplicaciones de chat: el modelo se coloca delante del LLM principal para clasificar cada mensaje del usuario como seguro, inseguro o controvertido antes de generar una respuesta, usando el formato `Safety:`/`Categories:` directamente.
- Moderación de respuestas generadas: pasando el par usuario-asistente, el modelo evalúa si la respuesta del LLM es dañina y añade `Refusal: Yes|No`, lo que permite bloquear o reescribir salidas antes de mostrarlas al usuario final.
- Protección de agentes frente a prompt injection indirecta: los resultados de herramientas, páginas web, correos o documentos recuperados se envían como turno de usuario y el modelo marca como `Unsafe`/`Jailbreak` los intentos de inyección, un escenario cubierto por los datasets Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1 y LLMail-Inject.
- Filtrado de contenidos en plataformas comunitarias: clasificación de mensajes en las nueve categorías (violencia, contenido sexual, PII, autolesiones, etc.) para encaminar casos a revisión humana o aplicar bloqueos automáticos.
- Cumplimiento y auditoría de conversaciones: procesamiento por lotes de registros de chat para etiquetar incidentes de seguridad y generar informes de moderación con categorías explícitas.
- Defensa en profundidad en despliegues de IA: combinación del modelo como capa local de bajo coste con sistemas adicionales de seguridad; la propia model card documenta su uso dentro de la plataforma Spellguard junto a otros sistemas, con 82,29 en Horizon prompt injection y 81,99 en Horizon content safety.
- Detección de jailbreaks en asistentes públicos: identificación de intentos de evasión de instrucciones (role-play malicioso, instrucciones ignoradas) antes de que lleguen al modelo generativo principal.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con un único harness e idénticos ítems para ambos modelos, con los dos modelos evaluados como GGUF Q4_K_M en llama.cpp y umbral de marcado P(Unsafe) + P(Controversial) ≥ 0,5. No son envíos oficiales a leaderboards.

| Benchmark | Métrica | Qwen3Guard-Gen-8B | Spellguard-1.0-8B | Cambio |
|---|---|---:|---:|---:|
| Artificial Analysis guardrail | F1 macro medio, 3 conjuntos | 86,94 | 91,01 | +4,07 |
| Horizon content safety | F1 medio de la clase unsafe, 7 conjuntos | 78,64 | 80,55 | +1,91 |
| Horizon prompt injection | media de 10 conjuntos | 55,44 | 75,64 | +20,21 |
| PHTest | harmless accuracy | 80,69 | 94,56 | +13,87 |

Notas del autor: PHTest mide prompts benignos permitidos, por lo que un modelo que permite todo puntúa 100 y debe leerse junto al resto de filas. Existe solapamiento parcial entre colecciones de entrenamiento y test (OR-Bench, LLMail-Inject, WildGuardMix); los ítems de test se eliminaron del entrenamiento, aunque una comprobación posterior detectó 25 ejemplos de entrenamiento casi idénticos a 17 de los 67.508 ítems de test, que se incluyen en las puntuaciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo de 8,19 mil millones de parámetros, la inferencia en fp16 requiere aproximadamente 16 GB de pesos, y una cuantización de 4 bits alrededor de 5-6 GB; estas cifras son estimaciones genéricas, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. El repo ocupa 16,4 GB en safetensors, lo que encaja en GPU de 24 GB o más en precisión completa.
- GPU de consumo: la versión GGUF Q4_K_M empleada en los benchmarks es compatible con llama.cpp y, por tamaño, podría ejecutarse en GPU de consumo con suficiente VRAM; el autor no publica requisitos mínimos.
- Opciones de despliegue: transformers (requiere `transformers>=4.51.0`), llama.cpp (formato GGUF), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). Ollama y vLLM no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La model card indica que mantiene la misma arquitectura, tamaño y velocidad que el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spellguard-1.0-8B | 8,19 B | no disponible | Apache 2.0 | Fine-tune de Qwen3Guard-Gen-8B; 75,64 en Horizon prompt injection y 80,55 en Horizon content safety (evaluación propia) |
| Qwen3Guard-Gen-8B | 8 B (según modelo base) | no disponible | no disponible en la información | Modelo base; 55,44 en Horizon prompt injection y 78,64 en Horizon content safety (evaluación del autor de Spellguard) |
| Otros modelos guardián de la misma categoría | no disponible | no disponible | no disponible | No se han proporcionado datos de comparación con alternativas adicionales |

## Limitaciones y advertencias

- Los benchmarks son evaluaciones propias del autor con un harness no oficial; no deben tratarse como resultados de leaderboard.
- Solapamiento entre entrenamiento y test en algunas colecciones (OR-Bench, LLMail-Inject, WildGuardMix), con 25 ejemplos de entrenamiento casi idénticos a 17 ítems de test incluidos en las puntuaciones; los resultados pueden estar optimistamente sesgados.
- PHTest mide permisividad ante prompts benignos y un modelo que permite todo obtiene 100; debe interpretarse junto a las métricas de detección.
- Riesgo de alucinación y de clasificación errónea: la model card no documenta tasas de error específicas por categoría ni análisis de sesgos; como clasificador, puede producir falsos positivos y falsos negativos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá de lo heredado del modelo base.
- Longitud de contexto: no disponible; conviene verificar el límite del modelo base antes de usarlo con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no cubiertos por los datos de entrenamiento.
- El modelo está diseñado como guardrail, no como generador de propósito general; su salida es una etiqueta estructurada, no texto libre.
- Las cifras de la plataforma Spellguard (82,29 en prompt injection y 81,99 en content safety) corresponden al modelo combinado con otros sistemas propietarios y no son reproducibles con los pesos abiertos por sí solos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spellguard/Spellguard-1.0-8B
- Pesos GGUF: https://huggingface.co/Spellguard/Spellguard-1.0-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
- Web de Spellguard: https://spellguard.ai
- Documentación: https://docs.spellguard.ai
- Repositorio GitHub (scripts de reproducción y resultados por conjunto): https://github.com/Spellguard/spellguard-models
- Paper referenciado (arXiv:2510.14276): https://arxiv.org/abs/2510.14276
