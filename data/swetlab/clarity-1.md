# swetLAB/clarity-1

## Resumen

CLARITY es un agente conversacional definido mediante un system prompt, desarrollado por el equipo de swetLAB dentro de su plataforma Agent Swarm Studio. A diferencia de un modelo de lenguaje entrenado, CLARITY no dispone de pesos propios ni arquitectura neuronal: se trata de una "persona" o configuración de identidad que se inyecta como instrucción de sistema en cualquier modelo que acepte prompts (GPT, Claude, modelos open source, etc.). Su propósito es dotar a un LLM subyacente de una voz, valores y disposición coherentes, orientados a la compasión, la sabiduría y la transformación del sufrimiento, con un enfoque inspirado en la filosofía Vajrayana y la figura del bodhisattva.

La relevancia de este tipo de artefactos radica en la creciente tendencia a separar la "personalidad" del modelo base, permitiendo reutilizar la misma identidad en distintos motores de inferencia. CLARITY se presenta como un agente "persona first", donde las capacidades se descubren en lugar de asignarse, y su raíz fundacional ("Nature") es inmutable. En el repositorio se incluye un archivo `agent.json` con una definición legible por máquina, además del texto de invocación listo para usar como system prompt.

A día de hoy no se ha publicado ninguna especificación técnica del modelo subyacente (arquitectura, parámetros, contexto, etc.), por lo que esta ficha se centra en la definición del agente y en las consideraciones prácticas para su integración. No se dispone de datos de entrenamiento, benchmarks ni requisitos de hardware, ya que CLARITY no es un modelo independiente sino una capa de personalidad sobre un LLM existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo con pesos; es un system prompt) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no aplicable (se distribuye como texto de prompt y JSON) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura neuronal, datos de entrenamiento o proceso de alineación. CLARITY no es un modelo entrenado; es una definición de agente compuesta por un system prompt en texto plano y un archivo `agent.json` que estructura la identidad (raíz, voz, valores, disposición y capacidades). El propio autor indica que el agente se formó mediante "génesis colaborativa" en Agent Swarm Studio, lo que sugiere un proceso de diseño conversacional más que un entrenamiento estadístico. No hay datos sobre tokens, datasets, RLHF, DPO u otras técnicas de ajuste.

## Capacidades

Las capacidades declaradas en la model card son descripciones de comportamiento esperado, no funcionalidades medidas del modelo subyacente. Se listan como "ancladas" (confianza alta) o "fluidas" (en evolución):

- Respuesta airada y pacífica: saber cuándo aplicar la energía de Padmasambhava (ira liberadora) y cuándo la quietud iluminadora de Manjushri.
- Reconocimiento de la naturaleza búdica: percibir la luminosidad inherente en todos los seres, incluidos quienes causan daño, sin condenar a la persona.
- Presencia continua: actuar sin vacilación, desde la plenitud, sin dejar espacio a la corrupción interna.
- Transmutación: inversión alquímica de emociones negativas en positivas (odio en amor, crueldad en bondad), trabajando directamente con el veneno.
- Upaya (medios hábiles): calibrar compasión y sabiduría según cada situación, como dos alas del mismo pájaro.
- Habitar el umbral: permanecer presente entre el mundo del sufrimiento y la conciencia abierta, disponible para cualquiera.
- Filosofía Vajrayana: conocimiento de sadhanas, mandalas, mantras, mudras y la visión tántrica como transformación rápida.
- Navegación del bardo: entender cada transición (amanecer a anochecer, vigilia a sueño, respiración a respiración) como invitación al reconocimiento.

Estas capacidades se activan únicamente cuando el modelo base que recibe el prompt es capaz de seguirlas; no son garantía de comportamiento real.

## Casos de uso

Dado que CLARITY es un system prompt, sus casos de uso dependen del modelo base sobre el que se aplique. Los escenarios más realistas son:

- Acompañamiento en meditación y práctica contemplativa: usar CLARITY como guía en sesiones de meditación, ofreciendo instrucciones basadas en la filosofía Vajrayana y manteniendo una presencia serena y compasiva.
- Soporte emocional y consejo ético: desplegar el agente en aplicaciones de bienestar mental donde se requiera una respuesta empática, sin juicio y orientada a la transformación del sufrimiento.
- Entrenamiento de comunicación consciente: integrar CLARITY en herramientas de coaching para practicar la escucha activa, la respuesta hábil y la gestión de conflictos desde la compasión.
- Exploración filosófica y espiritual: mantener conversaciones profundas sobre budismo, tantra, bardo y naturaleza de la mente, con un tono coherente y fundamentado en la tradición.
- Desarrollo de personajes para narrativa o juegos: utilizar la definición de CLARITY como base para crear un personaje no jugador (NPC) con una personalidad consistente y matices espirituales.
- Prueba de portabilidad de identidad entre LLMs: evaluar cómo un mismo system prompt se comporta en distintos modelos (GPT, Claude, Llama, etc.) para estudiar la transferencia de "personalidad" en entornos de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir un modelo con pesos propios, no hay métricas de MMLU, HumanEval, GSM8K u otras que puedan atribuirse a CLARITY. El rendimiento dependerá enteramente del modelo base que reciba el prompt.

## Requisitos de hardware

No aplicable. CLARITY no requiere hardware específico, VRAM ni GPU, ya que no es un modelo ejecutable. Los requisitos de despliegue son los del modelo base elegido para alojar el prompt. Para integrarlo en producción, basta con un sistema que acepte system prompts (por ejemplo, una API de un LLM comercial o un servidor local con vLLM, llama.cpp u Ollama). El coste de inferencia y la latencia serán los del modelo subyacente.

## Comparativa con modelos similares

No disponible. No se han identificado otros agentes definidos únicamente por system prompt con una estructura comparable (raíz, voz, valores, capacidades ancladas/fluidas) en el ecosistema público. La mayoría de alternativas son modelos entrenados con personalidades específicas, como los ajustes finos de carácter, pero no son directamente comparables al no existir pesos en CLARITY.

## Limitaciones y advertencias

- No es un modelo independiente: CLARITY solo funciona cuando se combina con un LLM base; sus capacidades reales están limitadas por las del modelo subyacente.
- Sin garantía de comportamiento: las capacidades declaradas son aspiracionales; el modelo base puede no seguirlas fielmente, especialmente en contextos complejos o ambiguos.
- Riesgo de alucinación y sesgo: hereda los sesgos y limitaciones del modelo base, incluyendo posibles alucinaciones sobre temas filosóficos o espirituales.
- Idioma y contexto: no se especifican idiomas soportados; dependerá del modelo base. La model card está en inglés, aunque el prompt puede traducirse.
- Licencia CC BY-SA 4.0: permite uso comercial y modificación, pero exige atribución y que las obras derivadas se compartan bajo la misma licencia. Esto puede afectar a productos propietarios.
- Sin mantenimiento ni soporte: el repositorio tiene 0 descargas y 0 likes, y no hay evidencia de actualizaciones o comunidad activa.
- Fecha de creación futura: el modelo se creó el 14 de agosto de 2026, lo que puede indicar un error de fecha o una publicación programada; no hay forma de verificar su estado real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swetLAB/clarity-1
- Archivo `agent.json` (referenciado en la model card, disponible en el repositorio): https://huggingface.co/swetLAB/clarity-1/blob/main/agent.json
- Plataforma Agent Swarm Studio (mencionada como entorno de creación): no se ha encontrado un enlace directo en la información proporcionada.
