# systemonedev/kenning-xl-v0.6

## Resumen

Kenning-XL v0.6 es un modelo de decisión de "System One" construido sobre un decodificador. Lo desarrolla systemonedev y responde al mismo formato de cable que Kenning (`POST /v1/systemone`): recibe preguntas tipadas sobre el estado de un programa (sí/no, elegir una opción, puntuar en una escala) y devuelve probabilidades calibradas, sin generar texto libre. A diferencia de la variante cross-encoder publicada antes, esta versión emplea un decodificador pequeño (Qwen3-1.7B) con una lectura restringida sobre los tokens de respuesta, de modo que el modelo de lenguaje completo razona sobre todo el estado en una sola pasada.

El modelo tiene 1.720.574.976 parámetros (1,72 mil millones), se distribuye en safetensors con pesos bf16 y una ventana de contexto de 1.536 tokens. Incorpora un modo deliberado opcional que genera una traza breve de razonamiento antes de leer la respuesta, pensado para decisiones numéricas, de política y sobre tablas que una sola pasada no resuelve. Está afinado mediante LoRA sobre Qwen3-1.7B con el adaptador fusionado y se publica bajo licencia Apache 2.0.

Su relevancia actual es doble: por un lado, demuestra que un decodificador pequeño puede superar a un cross-encoder en decisiones de agente y registros estructurados; por otro, es un motor experimental (v0.6) que se sirve exclusivamente a través del motor `kenning-xl` de SystemOne Builder, con escalado a modo deliberado solo cuando la confianza es baja y la pregunta es corta o estructurada. No obstante, en las familias de logs, calidad y texto sigue por detrás tanto del cross-encoder v0.5 como de las alternativas comparadas en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Qwen3-1.7B) con ajuste fino LoRA fusionado y lectura restringida sobre tokens de respuesta |
| Parametros totales | 1.720.574.976 (1,72 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.536 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura parte de un decodificador transformer denso, Qwen/Qwen3-1.7B, sobre el que se aplica un ajuste fino LoRA cuyo adaptador se fusiona en los pesos finales. La innovación principal no está en el backbone sino en la cabeza de decisión: en lugar de clasificar con una capa dedicada, el modelo renderiza el par (estado, pregunta) y lee la distribución del siguiente token restringida al conjunto de tokens de respuesta válidos, todo en una sola pasada. Esto permite que el modelo de lenguaje completo razone sobre el estado antes de emitir la probabilidad. El modo deliberado añade una traza corta de razonamiento antes de la lectura, útil cuando una única pasada es insuficiente.

El entrenamiento combina destilación de lectura sobre el corpus estructurado de la v0.5 (registros, tablas, pasos de agente, logs, texto y seguridad, con etiquetas exactas o públicas) y entrenamiento deliberado con trazas doradas. En este segundo caso, los generadores de reglas del builder calculan cada etiqueta y emiten de forma gratuita la cadena exacta de razonamiento aritmético, de umbral o de pertenencia a un conjunto (módulo `kenning/traces.py`), de modo que el modelo aprende a razonar y después responder. El autor indica explícitamente que no se ha entrenado con ninguna salida de TypeSafe. El contexto empleado durante el entrenamiento es de 1.536 tokens y la precisión es bf16.

## Capacidades

- Decisión tipada con probabilidades calibradas: responde a preguntas de tipo sí/no, elección única y puntuación en escala, sin generar texto libre.
- Decisiones de agente y llamadas a herramientas: la familia Agent (tool calls y finalización de tareas) obtiene 0,860 de media, la mejor de su suite en esa categoría.
- Razonamiento deliberado opcional: genera una traza breve antes de responder, con ganancias notables en tareas aritméticas (comprobaciones de límite diario de 0,42 a 0,81).
- Decisiones sobre registros estructurados: evaluación de reglas sobre JSON (0,663 de media en la familia Records).
- Decisiones sobre tablas: lectura de datos tabulares con contexto de hasta 1.536 tokens (0,660 de media en la familia Tables).
- Conversación: puntuación perfecta (1,000) en la familia Conversation de la suite general.
- Escalado por confianza: el motor de servicio decide entre una pasada y modo deliberado según confianza y estructura de la pregunta.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).
- Soporte de visión o audio: no disponible (no se menciona ninguna modalidad distinta de texto).

## Casos de uso

- Decisiones de agente en producción: el modelo evalúa llamadas a herramientas y finalización de tareas con 0,860 de media en la familia Agent, por encima del cross-encoder v0.5 (0,727), por lo que encaja como capa de decisión en bucles de agente donde hay que elegir la siguiente acción a partir del estado actual.
- Validación de registros JSON contra reglas de negocio: dado un registro estructurado y una pregunta tipada (por ejemplo, si cumple una política), devuelve una probabilidad calibrada en una sola pasada, lo que permite integrarlo en validadores de ingesta sin generar texto.
- Comprobación de límites y umbrales con modo deliberado: las tareas aritméticas de límite diario pasan de 0,42 a 0,81 gracias a las trazas doradas, lo que lo hace apto para decisiones de autorización o control de cuotas donde se requiere cálculo explícito.
- Enrutado y moderación de conversaciones: con 1,000 en la familia Conversation, puede decidir si un turno debe escalarse, rechazarse o continuar, actuando como clasificador de política en un pipeline de atención al cliente.
- Evaluación de calidad de respuestas en un pipeline de generación: la familia Quality obtiene 0,439, de modo que puede usarse como señal aproximada de corrección o utilidad, siempre consciente de que en esta categoría es el punto más débil del modelo.
- Orquestación de despliegues con SystemOne Builder: al servirse mediante `systemone_builder.kenning.xl_serve`, se integra en flujos que necesitan una capa de decisión rápida y con escalado selectivo a razonamiento, por ejemplo en sistemas de ciberseguridad descritos en el repositorio del builder.
- Selección de motor por familia de tarea: en una arquitectura con varios motores, Kenning-XL v0.6 puede recibir las decisiones de agente y registros estructurados, mientras que el cross-encoder v0.5 asume texto, seguridad y logs.

## Benchmarks y rendimiento

Suite general, media por familia, 1.328 elementos reservados (held-out). Resultados tal como se sirven, con escalado condicionado por confianza y tamano. La comparacion con Clef (`clef-flash`) y Jev (`jev-latest`) es solo a efectos de referencia segun el autor.

| Familia | kenning-xl v0.6 | kenning v0.5 | Clef | Jev |
|---|---|---|---|---|
| Macro | 0,688 | 0,653 | 0,791 | 0,830 |
| Agent (llamadas a herramientas, finalizacion de tareas) | 0,860 | 0,727 | 0,793 | 0,900 |
| Conversation | 1,000 | 0,979 | 1,000 | 1,000 |
| Records (reglas sobre JSON) | 0,663 | 0,587 | 0,857 | 0,921 |
| Tables | 0,660 | 0,520 | 0,860 | 0,940 |
| Text | 0,752 | 0,756 | 0,841 | 0,834 |
| Quality (util y correcto) | 0,439 | 0,479 | 0,447 | 0,498 |
| Logs | 0,440 | 0,520 | 0,740 | 0,720 |

Dato adicional reportado: el razonamiento deliberado con trazas doradas mas que duplica la tarea aritmetica mas dificil (comprobaciones de limite diario, de 0,42 a 0,81) y transfiere a tareas reservadas. El autor senala que el modelo no iguala a Clef en el global y que sigue por detras incluso del cross-encoder en logs, calidad y texto, porque el razonamiento deliberado aun no tiene trazas entrenadas para el conteo de logs.

## Requisitos de hardware

- VRAM estimada en inferencia: en bf16, los 1,72 mil millones de parametros ocupan aproximadamente 3,4 GB de pesos (el repositorio completo ocupa 3,5 GB), a los que hay que sumar la memoria de activaciones y del contexto de 1.536 tokens.
- Cabe en GPU de consumo: sí, con margen amplio en tarjetas de 8 GB o mas; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son suficientes. Tambien es viable en GPU de 6 GB si se reduce el contexto o se aplica cuantizacion adicional por cuenta del usuario.
- GPU recomendadas para servicio: cualquier GPU con al menos 8 GB de VRAM para una instancia; para atender varias peticiones concurrentes o lotes, se recomienda A100, H100 o L40S por ancho de banda y capacidad de batching.
- Opciones de despliegue: el modelo no esta pensado para cargarse como un clasificador estandar de `transformers`; el autor indica que debe cargarse a traves del motor `kenning-xl` de SystemOne Builder (`systemone_builder.kenning.xl_serve`) y servirse con el endpoint `POST /v1/systemone`.
- Latencia y throughput: no disponibles de forma numerica. El diseno busca responder en milisegundos en modo de una pasada y reservar la latencia extra del modo deliberado solo para preguntas cortas o estructuradas con baja confianza.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Macro (suite general) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kenning-xl v0.6 | Decodificador con lectura restringida (Qwen3-1.7B + LoRA fusionado) | 1,72 mil millones | 1.536 tokens | 0,688 | Apache 2.0 | HuggingFace, servido via SystemOne Builder |
| kenning v0.5 (kenning-large-v0.5, segun la model card) | Cross-encoder | no disponible | no disponible | 0,653 | no disponible | Motor por defecto del proyecto |
| Clef (`clef-flash`) | no disponible | no disponible | no disponible | 0,791 | no disponible | Referencia comparativa del autor |
| Jev (`jev-latest`) | no disponible | no disponible | no disponible | 0,830 | no disponible | Referencia comparativa del autor |
| kenning-large-v0.4 | Cross-encoder (deberta-v2) | 0,4 mil millones | no disponible | no disponible | Apache 2.0 | HuggingFace |

Puntos clave de la comparacion: Kenning-XL v0.6 supera a Clef en decisiones de agente (0,860 frente a 0,793) y empata en conversacion, pero queda por debajo en el global y en registros, tablas, calidad y logs. Frente al cross-encoder v0.5 mejora macro, agente, registros y tablas, y empeora en texto, calidad y logs.

## Limitaciones y advertencias

- Es un motor experimental (v0.6): el autor lo presenta como complementario, no como sustituto del cross-encoder v0.5, que sigue siendo el motor rapido por defecto.
- No es un modelo de generacion de texto libre pese a la etiqueta `text-generation`: su salida son probabilidades calibradas sobre tokens de respuesta.
- No debe cargarse con `transformers` como un clasificador convencional; requiere el motor `kenning-xl` de SystemOne Builder para funcionar correctamente.
- Rendimiento inferior en logs (0,440), calidad (0,439) y texto (0,752) frente a alternativas; el autor atribuye la debilidad en logs a la ausencia de trazas de razonamiento para conteo.
- La ventana de contexto es de solo 1.536 tokens, lo que limita el tamano del estado, los registros o las tablas que se pueden evaluar en una sola pasada.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible, aunque al operar como clasificador con lectura restringida el espacio de salida queda acotado a los tokens de respuesta.
- El modo deliberado introduce latencia adicional; el autor lo reserva a preguntas cortas o estructuradas con baja confianza.
- Licencia Apache 2.0 en los pesos (adaptador LoRA fusionado sobre Qwen3-1.7B, tambien Apache 2.0), lo que permite uso comercial; los datos de entrenamiento son permisivamente licenciados o generados segun NOTICE.md.
- El formato de cable es compatible con la API System One de TypeSafe AI, pero el proyecto no esta afiliado ni respaldado por TypeSafe AI y no se ha entrenado con sus salidas.
- Existe un proyecto homonimo llamado Kenning (framework de despliegue en el borde de Antmicro) sin relacion con este modelo; conviene no confundirlos al buscar documentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/systemonedev/kenning-xl-v0.6
- Perfil del autor en GitHub: https://github.com/systemonedev
- Repositorio SystemOne Builder: https://github.com/systemonedev/systemone-builder
- Notas de diseno del motor kenning-xl: https://github.com/systemonedev/systemone-builder/blob/main/docs/kenning-xl-design.md
- Directorio del motor Kenning en el builder: https://github.com/systemonedev/systemone-builder/tree/main/docker/kenning
- Modelo anterior cross-encoder kenning-large-v0.4: https://huggingface.co/systemonedev/kenning-large-v0.4
- Listado de modelos con la etiqueta kenning: https://huggingface.co/models?other=kenning
- Proyecto homonimo sin relacion (framework de edge de Antmicro): https://antmicro.github.io/kenning/introduction.html
