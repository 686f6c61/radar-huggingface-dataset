# ThakiCloud/KO-VoicePersona-E4B

## Resumen

KO-VoicePersona-E4B es un modelo de lenguaje afinado (fine-tune) especializado en generar respuestas de voz en coreano para asistentes conversacionales con persona definida. Lo ha publicado ThakiCloud como *research preview* (versión 1.0.0-preview), partiendo del modelo base NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 de Nvidia, al que se le ha aplicado un adaptador LoRA. No es un sistema de voz completo: no realiza reconocimiento ni síntesis de habla, sino que toma texto coreano ya transcrito (por ejemplo, la salida de un ASR) y genera la respuesta que diría una persona concreta, en frases cortas aptas para TTS.

Su valor está en resolver un problema muy concreto: mantener un registro de persona consistente (por ejemplo, el registro honorífico coreano 해요체 o 합니다체), limitar la longitud y forma de las respuestas para síntesis de voz (máximo 90 caracteres, números y palabras en inglés escritos tal como suenan), y delegar los hechos en llamadas a herramientas en lugar de inventarlos. En un pequeño conjunto de evaluación independiente supera al modelo base Bolt y a un adaptador v2 anterior en tool calling y retención del rol.

Arquitectónicamente hereda del base Nemotron 3.5 Bolt E4B, un modelo de la familia etiquetada como gemma4/nemotron orientado a uso en dispositivo (on-device), con unos 8.000 millones de parámetros totales. Se distribuye tanto como adaptador LoRA (subcarpeta `adapter`) como con el delta ya fusionado en pesos BF16, en formato safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Nemotron 3.5 Bolt (gemma4), con adaptador LoRA sobre el checkpoint base |
| Parametros totales | 7.996.156.490 (aprox. 8 B) |
| Parametros activos | no disponible (el sufijo E4B sugiere ~4 B activos, pero no consta en la documentacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos fusionados); el repo incluye imatrix para GGUF, pero cuantizaciones concretas no disponibles |
| Idiomas soportados | Coreano (ko) |
| Licencia | openmdw-1.1 (other) |
| Formato de pesos | safetensors y GGUF; adaptador LoRA en subcarpeta `adapter` |

## Arquitectura y entrenamiento

El modelo es un fine-tune tipo LoRA sobre nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, un checkpoint de la familia Nemotron de Nvidia orientado a despliegue en dispositivo y etiquetado en el repo con la referencia gemma4. El repositorio pesa 35,7 GB, coherente con pesos BF16 fusionados de ~8 B de parámetros más el adaptador. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO; solo se indica que existe un adaptador v2 anterior que este modelo mejora.

El diseño de inferencia es notable: el system prompt define la persona (nombre, registro, reglas de forma hablada y reglas de herramientas) y los esquemas de herramientas se pasan por la plantilla de chat mediante `tools=` en `apply_chat_template`, no incrustados en el texto del prompt. El modelo usa el chat template del checkpoint base con el thinking desactivado (`enable_thinking=False`). Por cada turno del asistente emite o bien una respuesta corta en coreano (una o dos frases, máximo 90 caracteres, sin dígitos ni letras latinas) o bien una llamada a herramienta (`emote`, `move`, `lookup` o `calendar_lookup`); tras añadir el resultado de la herramienta como mensaje `tool`, se llama al modelo de nuevo para generar la respuesta hablada. Las horas y los hechos solo pueden provenir de resultados de herramientas, lo que reduce la fabricación de datos.

## Capacidades

- Generación de texto conversacional en coreano con persona fija: mantiene el registro elegido (해요체 o 합니다체) y el tono definido en el system prompt.
- Salida optimizada para TTS: respuestas de una o dos frases, máximo 90 caracteres, números y palabras en inglés escritos fonéticamente, solo en hangul.
- Tool calling nativo vía chat template: herramientas `emote` (expresiones), `move` (acciones), `lookup` (consulta de hechos) y `calendar_lookup` (consulta de horarios), con esquemas pasados mediante `tools=`.
- Comportamiento de abstención: si un hecho no está en el resultado de la herramienta, dice que no lo ha encontrado en lugar de inventarlo; si el ASR produce texto ininteligible, pide repetición.
- Flujo multi-paso: llamada al modelo, ejecución de la herramienta, anexado del resultado y segunda llamada para la respuesta final (ejemplo completo en `inference_example.py`).
- No incluye reconocimiento de habla (ASR) ni síntesis (TTS): es la capa intermedia de persona y diálogo.

## Casos de uso

- Capa de diálogo para asistentes de voz en coreano: colocado entre un ASR y un TTS propios, genera la respuesta hablada del asistente manteniendo una persona coherente entre turnos, con frases cortas listas para sintetizar.
- Mascotas o avatares virtuales interactivos: el ejemplo incluido es "콩이" (Kong-i), mascota de la oficina de ThakiCloud; el modelo puede expresar emociones (`emote`) y acciones (`move`) mientras conversa, útil para quioscos, robots de atención o personajes en apps.
- Consulta de horarios por voz: mediante `calendar_lookup`, el asistente solo anuncia horarios que existen en el resultado de la herramienta, adecuado para asistentes de oficina que responden "¿a qué hora es mi reunión?" sin inventar horas.
- Consulta de información con fuentes controladas: con `lookup`, responde preguntas de conocimiento acotado a una base de datos o API propia, abstiniéndose cuando no hay resultado, lo que reduce el riesgo de alucinación en entornos de producción.
- Investigación sobre modelos coreanos pequeños en dispositivo: sirve como punto de partida para estudiar cómo los fine-tunes ligeros (LoRA) sobre modelos ~8 B mantienen persona y llaman a herramientas en hardware limitado.
- Plantilla para fine-tunes de persona propios: cambiando el system prompt y el conjunto de herramientas, se puede reutilizar como base para crear otras personas (recepcionistas, guías de museo, asistentes de hotel) con las mismas reglas de forma hablada.
- Prototipado de agentes conversacionales con abstención: el patrón "responde solo con datos de herramientas y di que no sabes si no las hay" es directamente trasladable a asistentes corporativos donde los datos inventados son inaceptables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo indica, cualitativamente, que en un pequeño conjunto de evaluación independiente el modelo supera al checkpoint base Bolt y al adaptador v2 anterior en tool calling y en retención del rol, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos fusionados BF16 (~8 B de parámetros, repo de 35,7 GB), se requieren aproximadamente 16-18 GB de VRAM; con el adaptador LoRA sobre el base, la VRAM es la del checkpoint base más el adaptador. No hay cifras oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 5090 debería alojar la versión BF16 fusionada; en entornos de servidor, A100 o H100 de 40/80 GB ofrecen margen sobrado. No hay recomendaciones oficiales.
- Consumer GPU: viable en GPUs de gama alta de consumo (24 GB) en BF16; con cuantizaciones GGUF derivadas del imatrix incluido, podría ejecutarse en GPUs de 12-16 GB, aunque no hay cuantizaciones publicadas confirmadas.
- Despliegue: la vía documentada es Transformers + PEFT (cargando el base y aplicando el adaptador) o Transformers con los pesos fusionados; el repo es `endpoints_compatible` y el formato GGUF con imatrix sugiere compatibilidad con llama.cpp y, por extensión, Ollama. No hay documentación específica para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiCloud/KO-VoicePersona-E4B | ~8 B (total) | no disponible | Persona de voz en coreano con tool calling | openmdw-1.1 | safetensors, GGUF, LoRA en HuggingFace |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | ~8 B (total) | no disponible | Modelo general on-device, multilingue | Licencia propia de Nvidia (other) | safetensors en HuggingFace |
| Adaptador v2 anterior de ThakiCloud | no disponible | no disponible | Persona coreana (version previa) | no disponible | Sustituido por esta version |

Frente a su base, KO-VoicePersona-E4B añade comportamiento de persona coreana hablada y tool calling disciplinado, con la contrapartida de estar restringido al coreano y a respuestas muy cortas. No hay disponibles en la información proporcionada otras alternativas coreanas de persona de voz comparables.

## Limitaciones y advertencias

- Es un *research preview*: la propia model card recomienda evaluarlo detrás de una capa de seguridad propia, no usarlo como componente terminado.
- No se ha evaluado dentro de un bucle real de ASR y TTS; las pruebas usan texto transcrito sintético, no habla real de usuarios.
- Las respuestas genéricas tienden a repetirse, y los argumentos de las herramientas no siempre son exactos.
- Restricción fuerte de salida: máximo 90 caracteres, solo hangul (números y inglés transliterados), una o dos frases; no sirve para respuestas largas ni para texto escrito.
- Monoidioma: diseñado y evaluado solo para coreano; no hay datos de rendimiento en otros idiomas, incluido el español.
- Longitud de contexto y parámetros activos no documentados, lo que dificulta planificar ventanas de conversación multi-turno largas.
- Riesgo residual de alucinación mitigado pero no eliminado: el modelo está entrenado para abstenerse cuando la herramienta no devuelve datos, pero no hay garantías formales.
- Licencia openmdw-1.1 (other): conviene revisar el texto en https://openmdw.ai/license/1-1/ antes de uso comercial, ya que no es una licencia estándar tipo Apache o MIT.
- Descargas aún muy bajas (770) y sin likes: comunidad y soporte prácticamente inexistentes; los errores tendrán que depurarse con el `inference_example.py` del propio repo.

## Enlaces

- Ficha del modelo: https://huggingface.co/ThakiCloud/KO-VoicePersona-E4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Model card en coreano: https://huggingface.co/ThakiCloud/KO-VoicePersona-E4B/blob/main/MODEL_CARD.ko.md
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Paper, blog o demo: no disponible
