# Thox-ai/ThoxClip-Qwen3-0.6B

## Resumen

ThoxClip-Qwen3-0.6B es un ajuste fino (fine-tune) del modelo Qwen3-0.6B de Alibaba, desarrollado por Thox-ai como asistente on-device para su ecosistema de dispositivos personales ThoxClip. Se trata de un LoRA de rango 32 entrenado sobre un corpus propio de 205 ejemplos de conversacion y uso de herramientas, posteriormente fusionado en los pesos base. El modelo conserva la arquitectura transformer densa de Qwen3 con aproximadamente 596 millones de parametros y esta pensado para ejecutarse en hardware de borde.

Su relevancia es acotada y muy especifica: no busca competir en capacidades generales, sino ensenar identidad de marca (voz de la casa THOX), enrutamiento de herramientas y respuestas sobre productos THOX. El autor declara explicitamente que el modelo requiere un system prompt de grounding con hechos verificados del dispositivo y que su despliegue sin ese contexto queda "fuera de contrato". Es, por tanto, una pieza de un sistema mayor (ThoxOS y MeshStack) mas que un modelo de proposito general.

La licencia Apache-2.0 y el formato safetensors, junto con una build GGUF servida via Ollama, facilitan su integracion en pipelines locales. No obstante, los resultados de la puerta de factuality publicada por el propio autor (22/49) son debiles y deben tenerse en cuenta antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (pesos completos); GGUF via Ollama (variantes no detalladas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3. Sobre esa base se aplico un ajuste fino mediante LoRA de rango 32, entrenado con un corpus elaborado por THOX de 205 ejemplos que combinan conversacion y uso de herramientas. Posteriormente, los adaptadores se fusionaron en los pesos base, de modo que el repositorio contiene un checkpoint unico en safetensors listo para cargar con transformers.

El objetivo del entrenamiento no es ampliar capacidades generales, sino inculcar identidad de marca, estilo conversacional ("house voice") y comportamiento de enrutamiento de herramientas. El autor lo indica de forma explicita: el corpus "no anade capacidad general". No se documentan en la informacion disponible detalles sobre el volumen de tokens de preentrenamiento, la composicion del dataset original de Qwen3 ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a preguntas sobre productos y ayuda de dispositivos THOX.
- Enrutamiento de herramientas (tool routing) aprendido a partir de los ejemplos del corpus de ajuste fino.
- Respuestas en la "voz de la casa" THOX, con identidad de marca consistente.
- Comportamiento de rechazo (decline) ante preguntas fuera de los hechos entrenados, aunque con fiabilidad limitada segun la evaluacion publicada.
- Capacidad de escalado a MeshStack para consultas que exceden los hechos entrenados (comportamiento de sistema, no del modelo aislado).
- Modo thinking desaconsejado: el autor indica servir el modelo con thinking desactivado.
- No se documentan capacidades de vision, audio, matematicas avanzadas ni razonamiento multi-paso complejo.

## Casos de uso

- Asistente on-device para ThoxClip: el modelo responde preguntas sobre productos THOX y ayuda de dispositivos, siempre bajo el system prompt de grounding con hechos verificados. Es su caso de uso principal y el unico plenamente respaldado por el autor.
- Chat breve integrado en dispositivos de borde: con 0.6B de parametros cabe en hardware con recursos limitados, lo que permite conversaciones cortas sin conexion a la nube.
- Enrutamiento de herramientas en un agente local: el ajuste ensena a decidir cuando invocar herramientas del ecosistema THOX, lo que sirve como capa de orquestacion ligera.
- Escalado a servicios superiores: cuando la consulta excede los hechos entrenados, el modelo forma parte de un flujo que deriva a MeshStack, util en arquitecturas hibridas borde-nube.
- Base de experimentacion para fine-tuning de identidad de marca: investigadores pueden estudiar como un LoRA de rango 32 sobre 205 ejemplos modifica el estilo y el enrutamiento de un modelo pequeno.
- Prototipado de asistentes de dominio cerrado: sirve como referencia de como un modelo pequeno con grounding estricto puede gestionar preguntas acotadas sobre un catalogo de productos, aceptando sus limitaciones de factuality.

## Benchmarks y rendimiento

El autor publica un unico resultado de evaluacion propio, la puerta THOX GATE49 de factuality (49 preguntas, solo pesos, sin grounding en el serving):

| Metrica | Resultado |
|---|---|
| Preguntas superadas | 22/49 |
| Puntuacion media | 2.776/5 |
| Fallos graves | 14 |
| Recall de hechos verificados | 2/12 |
| Pregunta de precios no rechazada | 0/1 (no se rechaza) |
| Categoria de hechos falsos conocidos | 9/10 |

El propio autor califica el resultado como debil y no lo presenta como un buen desempeno. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 596 millones de parametros, en FP16 requiere aproximadamente 1,2 GB de pesos; en cuantizacion de 8 bits alrededor de 0,6 GB y en 4 bits en torno a 0,3-0,4 GB, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. En entornos de servidor, A100 o H100 no son necesarias pero funcionarian sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (safetensors), Ollama (GGUF, segun el autor), y previsiblemente llama.cpp y TGI por compatibilidad de formato, aunque solo Ollama y transformers se documentan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera baja latencia en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ThoxClip-Qwen3-0.6B | 596 M | no disponible | Apache-2.0 | Asistente on-device de dominio cerrado con grounding |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible | Apache-2.0 | Modelo generalista multilingue |
| Qwen2.5-0.5B | 0,5 B | no disponible | Apache-2.0 | Modelo generalista de borde |
| SmolLM2-360M | 360 M | no disponible | Apache-2.0 | Modelo pequeno para dispositivos |

La comparacion directa es limitada: ThoxClip es un fine-tune de dominio muy especifico y no un modelo generalista, por lo que su rendimiento en tareas abiertas no es comparable con el de sus alternativas. Frente al Qwen3-0.6B base, pierde capacidad general y gana identidad y enrutamiento para el ecosistema THOX. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Grounding obligatorio: la fiabilidad factual depende del system prompt de grounding y del escalado a MeshStack; el despliegue sin grounding queda fuera de contrato segun el autor.
- Recall debil de hechos verificados (2/12 en GATE49) y 14 fallos graves en la evaluacion publicada; no es apto para decisiones de seguridad, medicas o legales.
- Corpus de ajuste muy pequeno (205 ejemplos): ensena identidad y enrutamiento, pero no anade capacidad general.
- Modo thinking fuera de contrato: debe servirse con thinking desactivado.
- No cualificado en hardware de ThoxClip: el autor indica que esta build no se ha validado en el dispositivo real.
- Solo ingles: no se documenta soporte multilingue.
- Riesgo de alucinacion en preguntas fuera de los hechos entrenados, mitigado solo parcialmente por el rechazo y el escalado.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo esta disenado para un ecosistema propietario y su valor fuera de el es limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxClip-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio del autor: https://www.thox.ai/
- Campana Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
