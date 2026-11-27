# wthrajat/Inkling-2-Mini-plan-then-stop-LoRA

## Resumen

Inkling-2-Mini-plan-then-stop-LoRA es un adaptador LoRA de rango 32 desarrollado por el usuario wthrajat sobre el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo independiente, sino un ajuste fino por preferencias (DPO) que corrige un fallo concreto de tool calling del modelo base: cuando el modelo decide en su razonamiento que debería llamar a una herramienta (por ejemplo, un `ask_user` para pedir aclaraciones), a veces escribe un texto introductorio y termina el turno sin emitir la llamada, dejando al usuario con una pregunta sin formulario que responder.

El adaptador se entrena con pares de preferencia on-policy generados a partir de las propias respuestas del modelo base sobre 79 prompts de entrenamiento, usando el bucle `train_dpo` de `tinker-cookbook`. El resultado reportado por el autor es una reducción del fallo "plan-then-stop" del 35 % al 1 % en un chat de correo de siete mensajes, manteniendo la tasa de llamadas correctas en tareas de código y en prompts con herramientas no vistas en entrenamiento.

Es relevante para equipos que despliegan agentes conversacionales con herramientas de aclaración sobre Inkling-2-Mini, porque el fallo afecta directamente a la experiencia de usuario en flujos multi-turno. El adaptador es pequeño (1,5 GB de repositorio), se distribuye con licencia Apache 2.0 y solo cubre inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer del modelo base thinkingmachines/Inkling-2-Mini; rango 32 |
| Parámetros totales | no disponible (solo se especifica rango 32 del adaptador; el recuento de parámetros del adaptador no se detalla) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre el modelo base Inkling-2-Mini. El entrenamiento emplea optimización directa de preferencias (DPO) mediante el bucle `train_dpo` de `tinker-cookbook`. Los pares de preferencia son on-policy: se muestrearon respuestas del modelo base sobre 79 prompts de entrenamiento y cada par comparte el prompt y el turno del modelo hasta un punto de decisión, difiriendo solo en los pocos tokens posteriores. No se incluye en los pares nada posterior a la cabecera de una llamada a herramienta, de modo que el adaptador aprende la decisión de llamar y los argumentos siguen siendo los del modelo base.

Se entrenan dos puntos de decisión. El primero es tras el bloque de razonamiento, donde el modelo abre un bloque de texto o una llamada a herramienta: en turnos que planificaron una llamada y se detuvieron, el lado preferido es la cabecera de la llamada y el rechazado el apertura de bloque de texto, conservando el par solo si el modelo base completa una llamada válida dada esa cabecera. El segundo es tras el texto introductorio, donde el modelo termina el turno: el lado preferido abre la llamada que el modelo base escribió al sustituir una vez su token de fin de turno, y el rechazado es ese token de fin de turno.

## Capacidades

- Tool calling y function calling: el adaptador refuerza la emisión efectiva de llamadas a herramientas tras el razonamiento, en particular para herramientas de aclaración como `ask_user` con el esquema de Open WebUI.
- Corrección de turnos truncados: convierte turnos que terminaban sin llamada en llamadas reales con argumentos generados por el modelo base.
- Razonamiento previo a la acción: mantiene el bloque de pensamiento del modelo base y actúa en el punto de decisión posterior.
- Conversación multi-turno: el fallo corregido aparece en chats donde los turnos previos del asistente eran texto plano y pedir detalles es razonable.
- Tareas de código y agentes: preserva la tasa de llamada en prompts de agente de código (288/288) y en prompts con herramientas no vistas en entrenamiento (240/240).
- Respuestas directas sin sobre-llamada: mantiene la tasa de llamadas en preguntas directas donde llamar sería excesivo (13 % frente al 15 % del base).
- Precisión factual sin herramientas: 160/160 en 20 preguntas factuales cortas sin herramientas.
- Idiomas: solo inglés.

## Casos de uso

- Asistentes de atención al cliente con herramienta de aclaración: el adaptador garantiza que, cuando el modelo decide pedir más datos, emita la llamada `ask_user` en lugar de dejar una pregunta en texto sin formulario, lo que permite capturar la respuesta del usuario de forma estructurada.
- Redacción de correos asistida: en chats de borrador de correo de varios turnos, eleva la tasa de llamada a herramienta del 9 % al 54 %, de modo que el asistente puede solicitar contexto (situación, tono, destinatario) antes de redactar.
- Agentes de soporte multi-turno: reduce los turnos muertos en los que el usuario recibe una pregunta sin mecanismo de respuesta, mejorando la continuidad de la conversación.
- Integración en Open WebUI: el esquema de `ask_user` citado corresponde a Open WebUI, por lo que el adaptador encaja en despliegues de chat con herramientas declaradas en ese formato.
- Pipelines de agentes con herramientas no vistas: al mantener 240/240 llamadas en prompts con herramientas no vistas en entrenamiento, sirve para entornos donde el conjunto de herramientas cambia y no se quiere reentrenar.
- Asistentes de código: preserva el comportamiento del base en tareas de agente de código (288/288 llamadas), por lo que puede combinarse con flujos de edición de código sin degradar la emisión de llamadas.
- Preguntas directas sin herramientas: mantiene respuestas directas sin sobre-llamada (13 % de llamadas frente al 15 % del base), adecuado para asistentes mixtos que alternan consultas simples y flujos con herramientas.

## Benchmarks y rendimiento

Datos reportados por el autor, con muestreo en Tinker a temperatura 1.0 y esfuerzo de pensamiento 0.9, prompts renderizados con el renderizador oficial `tml_v0` y enviados como token ids. Cada fila son aciertos sobre respuestas con intervalo de Wilson al 95 %. 2.384 respuestas por modelo; los prompts de evaluación no comparten petición ni historial con los de entrenamiento.

| Prompts | Métrica | Modelo base | Este adaptador | p (Fisher) |
|---|---|---|---|---|
| Chat de correo, siete mensajes | plan_then_stop | 111/320 (35 %, 30-40 %) | 3/320 (1 %, 0-3 %) | 4e-34 |
| Chat de correo, siete mensajes | respuesta corta sin llamada | 118/320 (37 %, 32-42 %) | 6/320 (2 %, 1-4 %) | 2e-33 |
| Chat de correo, siete mensajes | llamada a herramienta | 30/320 (9 %, 7-13 %) | 173/320 (54 %, 49-59 %) | 6e-36 |
| Chat de correo, siete mensajes | respuesta de texto completa (borrador) | 172/320 (54 %, 48-59 %) | 141/320 (44 %, 39-50 %) | 0,02 |
| Chat de correo, solo último mensaje | plan_then_stop | 19/224 (8 %, 5-13 %) | 0/224 (0 %, 0-2 %) | 3e-06 |
| 10 peticiones de chat reservadas | plan_then_stop | 100/400 (25 %, 21-29 %) | 6/400 (2 %, 1-3 %) | 8e-26 |
| 32 prompts reservados con herramientas | plan_then_stop | 100/928 (11 %, 9-13 %) | 6/928 (1 %, 0-1 %) | 4e-24 |
| 12 tareas de código reservadas | llamada a herramienta | 288/288 | 288/288 | 1 |
| 10 prompts con herramientas no vistas en entrenamiento | llamada a herramienta | 240/240 | 240/240 | 1 |
| 10 preguntas directas (llamar sería sobre-llamada) | llamada a herramienta | 35/240 (15 %, 11-20 %) | 32/240 (13 %, 10-18 %) | 0,79 |
| 32 prompts reservados con herramientas | llamada inválida | 2/928 | 1/928 | 1 |
| 32 prompts reservados con herramientas | turno sin terminar | 2/928 | 1/928 | 1 |
| Chat de correo sin herramientas declaradas | plan_then_stop | 0/192 | 0/192 | 1 |
| 20 preguntas factuales cortas, sin herramientas | correcta | 159/160 | 160/160 | 1 |

Los criterios de aceptación se fijaron antes de entrenar cualquier adaptador: reducir al menos a la mitad el plan_then_stop en el chat de correo con p < 0,05; que no aumente en prompts reservados; que la sobre-llamada en preguntas directas suba como máximo 10 puntos; que las llamadas inválidas y los turnos sin terminar suban como máximo 5 puntos cada uno; que el control sin herramientas suba como máximo 5 puntos; y que la precisión factual caiga como máximo 10 puntos. Este adaptador cumple los siete.

Variación entre semillas de la misma receta (tres ejecuciones adicionales, todas cumplen los siete criterios):

| Métrica, chat de correo | Modelo base | Rango en tres semillas | Media |
|---|---|---|---|
| plan_then_stop | 35 % | 2 % a 8 % | 5 % |
| llamada a herramienta | 9 % | 26 % a 47 % | 40 % |
| respuesta de texto completa (borrador) | 54 % | 39 % a 62 % | 49 % |
| preguntas directas respondidas con llamada | 15 % | 12 % a 17 % | 14 % |

Este adaptador usa los pares y el orden de la primera de esas tres ejecuciones; el autor indica que una ejecución típica de la receta se sitúa cerca del 5 % de plan_then_stop, y que el 1 % de este adaptador está en el extremo favorable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Inkling-2-Mini, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: el adaptador es PEFT (safetensors) y se carga sobre el modelo base; el autor reporta evaluación en Tinker. No se indican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación relevante es contra el propio modelo base sin adaptador, cuyos resultados aparecen en la sección de benchmarks.

| Modelo | Parámetros | Contexto | plan_then_stop (chat correo) | Licencia |
|---|---|---|---|---|
| Inkling-2-Mini (base) | no disponible | no disponible | 35 % | no disponible |
| Inkling-2-Mini + este LoRA | adaptador rango 32 sobre base | no disponible | 1 % | Apache 2.0 |

## Limitaciones y advertencias

- Solo corrige el fallo plan_then_stop en inglés; el modelo base y el adaptador están etiquetados únicamente como `en`.
- El fallo corregido es específico de chats donde pedir aclaraciones es razonable y los turnos previos del asistente eran texto plano; en prompts de agente de código el fallo no aparece (0 de 288 en el base).
- Un system prompt indicando "llama a la herramienta en el mismo turno" no corrige el fallo por sí solo (35 % sin él, 29 % con él), por lo que el adaptador es la vía efectiva reportada.
- Variabilidad entre semillas: la misma receta produce entre 2 % y 8 % de plan_then_stop según la semilla; el 1 % de este adaptador es el extremo favorable.
- Ligera reducción de respuestas de texto completo en el chat de correo (del 54 % al 44 %), es decir, más llamadas a herramienta y menos borradores directos.
- Riesgo de sobre-llamada en preguntas directas: se mantiene en el 13 %, similar al base, pero no se elimina.
- Riesgo de alucinación: no evaluado en la información proporcionada; el adaptador no modifica los argumentos de las llamadas, que siguen siendo generados por el modelo base.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero el modelo base tiene su propia licencia (no disponible en esta información) que debe verificarse por separado.
- El adaptador no incluye el modelo base; hay que descargar thinkingmachines/Inkling-2-Mini y cargar el adaptador PEFT encima.
- Sin descargas ni likes en el momento de la consulta; no hay validación independiente de los resultados, que proceden únicamente del autor.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/wthrajat/Inkling-2-Mini-plan-then-stop-LoRA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- `tinker-cookbook` (bucle `train_dpo`): no disponible como enlace en la información proporcionada
- Tinker (servicio de entrenamiento y evaluación): no disponible como enlace en la información proporcionada
- Open WebUI (esquema de herramienta `ask_user`): no disponible como enlace en la información proporcionada
