# sushan98/heartmatch-ai-model

## Resumen

HeartMatch AI es un agente autónomo de código abierto orientado a la compatibilidad, la seguridad y la orientación honesta en citas para adultos. Lo desarrolla Sushan Ghimire (usuario `sushan98` en HuggingFace) y se presenta como el tercer miembro de una familia de agentes tras Opportunity Hunter y Client Hunter. El repositorio se publica bajo licencia MIT y se etiqueta con `pipeline_tag: text-generation` y `library_name: transformers`, aunque la model card describe fundamentalmente un sistema de agente construido en Python con almacenamiento en SQLite y dependencia de la API de Gemini.

El modelo aborda un problema concreto: la mayoría de las herramientas denominadas "IA para citas" funcionan como motores de spam (bots de mensajes masivos, generadores de aperturas, guiones de manipulación). HeartMatch AI invierte el enfoque y ofrece puntuación de compatibilidad determinista, revisión honesta de perfiles, entrenamiento de mensajes con filtro de respeto, detección de patrones de fraude romántico y planes de seguridad para primeras citas. No dispone de ruta de envío de mensajes: el usuario copia, pega y envía manualmente, una persona a la vez.

La información pública disponible es escasa en cuanto a especificaciones del modelo subyacente. No se detallan parámetros, arquitectura de red ni longitud de contexto; la model card se centra en el comportamiento del agente, las reglas de seguridad y el modelo de puntuación de compatibilidad. El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado el 4 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card describe un agente en Python con integración de Gemini; no se especifica la arquitectura del modelo de lenguaje subyacente) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio se distribuye como proyecto de agente; no se documentan pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo de lenguaje subyacente ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). La model card no describe una red neuronal propia, sino un sistema de agente con las siguientes piezas documentadas:

- Un motor de puntuación de compatibilidad determinista con fórmula explícita: `values_alignment(25) + life_goals(20) + communication_match(15) + lifestyle_fit(15) + interests_overlap(10) + logistics(10) + intent_match(5)`, sobre un total de 100 puntos.
- Filtros duros que anulan la puntuación a 0 sin apelación: edad fuera del rango, distancia superior al límite, país distinto, intención incompatible o cualquier `dealbreaker` declarado.
- Un componente denominado Respect Guard que puntúa cada borrador saliente sobre 100 y lo bloquea por debajo de un umbral configurable (`RESPECT_FLOOR`, por defecto 70). Detecta familias como `pressure`, `guilt_trip`, `negging`, `love_bombing`, `manufactured_urgency`, `jealousy_bait`, `deception`, `money_pressure`, `sexual_escalation_early`, `no_respect_for_no`, `interrogation`, `shouting` y `excess_emoji`.
- Un detector de fraude romántico que identifica el guion clásico: intimidad rápida, aislamiento, crisis y solicitud de dinero.
- Almacenamiento en SQLite y ejecución local mediante `python main.py` con subcomandos como `profile`, `guard` y `safety`.

La model card menciona integración con Gemini y una etiqueta `endpoints_compatible`, lo que sugiere que el agente puede ejecutarse contra endpoints compatibles, pero no se detalla qué modelo concreto se invoca ni sus características técnicas.

## Capacidades

- Puntuación de compatibilidad de 0 a 100 en siete dimensiones ponderadas, con veredictos: strong (≥80), promising (65–79), maybe (50–64), skip (<50) y blocked.
- Revisión honesta de perfiles: detecta clichés, frases vagas y afirmaciones que un desconocido leería como infladas.
- Entrenamiento de mensajes: genera tres borradores (cálido, juguetón, directo), cada uno filtrado por Respect Guard antes de mostrarse.
- Respect Guard: bloquea presión, culpabilización, negging, love-bombing, engaño y conversaciones sobre dinero.
- Detección de fraude romántico: marca solicitudes de dinero, crisis de emergencia, aislamiento e intimidad rápida.
- Plan de seguridad para primera cita: pasos concretos generados por persona.
- Rechazo con filtros duros: aplica literalmente los `dealbreakers` del usuario.
- Validación de consentimiento: cada perfil requiere una cadena `consent_basis` o se omite y se contabiliza.
- Validación de edad: `validate_profile()` devuelve error para menores de 18 años antes de cualquier otra operación.
- Sin ruta de envío de mensajes: no hay código que envíe nada; el usuario copia, pega y envía.
- Sin scraping de aplicaciones de citas: las fuentes son archivos, formularios y feeds propios del usuario.
- Idioma: inglés.

## Casos de uso

- Puntuación de compatibilidad con personas conocidas: el usuario introduce perfiles con consentimiento explícito y el agente calcula una puntuación determinista de 0 a 100 en siete dimensiones, con veredicto y explicación de las dimensiones que fallan. Es adecuado porque la fórmula es auditable y reproducible, sin caja negra.
- Revisión de perfil propio: el agente señala clichés, frases vagas y afirmaciones infladas antes de publicar un perfil. Útil para mejorar la claridad y la honestidad sin inventar datos, ya que la ruta de reescritura solo usa hechos ya presentes en el archivo del usuario.
- Entrenamiento de mensajes con filtro de respeto: genera tres borradores (cálido, juguetón, directo) y bloquea cualquiera que puntúe por debajo de 70 en Respect Guard. Adecuado para usuarios que quieren comunicarse con claridad sin caer en presión o manipulación.
- Detección de fraude romántico en conversaciones recibidas: el usuario pega mensajes sospechosos y el agente marca patrones como solicitud de dinero, crisis de emergencia, aislamiento o intimidad rápida, y sugiere acciones concretas (no enviar dinero, pedir videollamada en directo, reportar y bloquear).
- Planificación de seguridad para primeras citas: el agente genera un plan concreto por persona, con pasos prácticos y aburridos pero efectivos, adaptado al contexto del encuentro.
- Filtrado por dealbreakers: el usuario define filtros duros (edad, distancia, país, intención, hábitos) y el agente aplica la puntuación 0 sin apelación cuando se incumplen, evitando perder tiempo en perfiles incompatibles.
- Educación y concienciación sobre manipulación: el comando `guard` permite probar frases y ver por qué se bloquean (por ejemplo, "why aren't you replying? don't ignore me" obtiene 66/100 y se marca como no enviable), lo que sirve como herramienta formativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una ejecución de ejemplo sobre un conjunto de datos sintético incluido en el repositorio, que no constituye un benchmark comparativo:

| Persona (ficticia) | Puntuación | Resultado |
|---|---|---|
| Anisha, 26, Katmandú | 93 | strong — valores 24/25, metas 20/20, misma ciudad, 4 intereses compartidos |
| Bipana, 29, Katmandú | 85 | strong score + alto riesgo de fraude (100/100) |
| Prakriti, 28, Lalitpur | 70 | promising — estilo de conflicto y plazos divergentes |
| Sneha, 24, Pokhara | 0 | blocked — 205 km > límite de 80 km |
| Rita, 31, Katmandú | 0 | blocked — dealbreaker: fumar |
| Kritika, 27, Katmandú | 0 | blocked — busca algo casual, el usuario no |
| Maya, 25, Katmandú | 0 | blocked — preocupación de honestidad marcada |

## Requisitos de hardware

- No se documentan requisitos de VRAM ni GPU recomendadas, ya que el repositorio no publica pesos de un modelo de lenguaje propio y la model card describe un agente en Python con integración de Gemini.
- Al depender de una API externa (Gemini) o de endpoints compatibles, el cómputo principal puede residir fuera del equipo local; no se especifica latencia ni throughput.
- El almacenamiento es SQLite local, sin requisitos especiales de hardware.
- Opciones de despliegue documentadas: ejecución local mediante `python main.py` con subcomandos `profile`, `guard` y `safety`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- No se indica si cabe en GPU de consumo; el dato no está disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos técnicos (parámetros, contexto, benchmarks) de este modelo ni de alternativas comparables de la misma categoría, por lo que no es posible establecer una comparación rigurosa. Los otros agentes de la misma familia mencionados en la model card (Opportunity Hunter y Client Hunter) pertenecen a dominios distintos (oportunidades y clientes) y no se ofrecen sus especificaciones.

## Limitaciones y advertencias

- Idiomas: solo inglés (`en`); no se documenta soporte multilingüe.
- Sesgos: no se documentan sesgos conocidos, pero el sistema de puntuación pondera dimensiones definidas por el desarrollador (valores, metas vitales, comunicación, estilo de vida, intereses, logística e intención) y los `dealbreakers` los define el usuario, lo que puede introducir sesgos en la selección.
- Alucinación: la model card afirma que la ruta de reescritura solo usa hechos ya presentes en el archivo del usuario y que no se inventan perfiles, ingresos, altura, trabajo ni fotos; no obstante, al depender de un modelo de lenguaje externo (Gemini) no se detallan salvaguardas técnicas verificables contra la generación de contenido no fundamentado.
- Datos personales: el sistema exige una cadena `consent_basis` por perfil y omite los que no la tengan, pero el usuario es responsable de obtener y documentar ese consentimiento; el repositorio incluye datos sintéticos y advierte de no subir perfiles reales a forks públicos.
- Licencia: MIT, permisiva para uso comercial, pero la model card no detalla implicaciones sobre el uso de la API de Gemini subyacente ni sobre las condiciones del proveedor externo.
- Edad: el sistema rechaza perfiles de menores de 18 años mediante `validate_profile()`.
- Sin ruta de envío: el agente no envía mensajes; el usuario debe copiar, pegar y enviar manualmente, lo que limita la automatización pero es una decisión de diseño deliberada.
- Sin scraping: no se conecta a aplicaciones de citas; las fuentes son archivos, formularios y feeds propios.
- Madurez: cero descargas y cero likes en el momento de la consulta; proyecto reciente (creado en noviembre de 2026) sin evidencia de adopción ni validación externa.
- Especificaciones técnicas ausentes: no se documentan parámetros, contexto, cuantizaciones ni formato de pesos, lo que impide evaluar el modelo de lenguaje subyacente de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/sushan98/heartmatch-ai-model
- Opportunity Hunter (agente previo de la familia): https://huggingface.co/sushan98/opportunity-hunter-ai-model
- Perfil del autor: https://huggingface.co/sushan98
- Client Hunter: no disponible (mencionado en la model card sin enlace)
