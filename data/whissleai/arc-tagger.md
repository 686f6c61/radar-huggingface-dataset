# WhissleAI/arc-tagger

## Resumen

Arc Tagger es un etiquetador de texto en streaming desarrollado por WhissleAI, con aproximadamente 9,8 millones de parametros. Su funcion es consumir el flujo de palabras que produce cualquier sistema de reconocimiento automatico del habla (ASR) —Deepgram, Nemotron, Whisper o el propio ASR de Whissle—, o texto plano, y emitir etiquetas a nivel de palabra y de enunciado a medida que cada palabra llega. No es un modelo generativo: es un token classifier causal especializado en anotacion incremental.

El modelo resuelve un problema concreto en pipelines de voz: la necesidad de extraer estructura semantica (entidades, numeros, PII, actos de discurso, intenciones, roles de hablante, eventos) en tiempo real y con latencia baja, sin esperar al cierre del turno. Al ser causal y ejecutar un unico paso recurrente por palabra, una revision del ASR solo re-ejecuta las palabras revisadas, lo que lo hace adecuado para hipotesis interim de sistemas de reconocimiento en streaming.

La version publicada es la v0.1.0, con checkpoint `AT10Mv2` en el paso 88000, que segun el autor obtuvo los mejores resultados en todos los conjuntos gold de su ejecucion. Cubre 276 etiquetas repartidas en 10 cabeceras de lectura, definidas a partir de la ontologia Whissle r8 mas la extension `ext_cc_roles1`. Esta pensado para ejecutarse en CPU, con un coste medido de unos 16 ms por palabra (p50) en un nucleo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canal de palabras (BPE byte-level de 8k, 2 capas de atencion local causal) + tronco Mamba-3 de 6 capas; capas de atencion con memoria KV global, FiLM de dominio y adaptadores |
| Parametros totales | ~9,8 M (aprox. 10M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo causal por palabra, sin ventana declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | no disponible (libreria pytorch; repositorio incluye paquete `arctag/` y `requirements.txt`) |

## Arquitectura y entrenamiento

La arquitectura combina un canal de palabras con tokenizacion BPE byte-level de 8k y dos capas de atencion local causal, que alimenta un tronco Mamba-3 de seis capas. Sobre el tronco se aplican capas de atencion con memoria KV global, acondicionamiento FiLM por dominio y adaptadores. Las salidas son cabeceras de etiquetas indexadas por definicion, una cabecera de spans v2 (BIO y tipo por familia), un verificador de spans y cabeceras agrupadas de enunciado, hablante e item. El modelo es causal y ejecuta un paso recurrente por palabra.

El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona conjuntos gold por ejecucion y un checkpoint seleccionado por rendimiento (paso 88000), pero no publica cifras de entrenamiento. La innovacion tecnica destacable es el diseno para streaming: la revision de hipotesis interim mediante `revise_from=k` re-ejecuta solo las palabras revisadas, y el modelo soporta tres niveles de lookahead (`T0` sin lookahead, `T1` hasta 3 palabras de retardo, `T2` al final del enunciado).

## Capacidades

- Etiquetado de entidades y numeros: 10 etiquetas de mencion (`person`, `organization`, `team`, `place`, `event_name`, `legal_ref`, `term`, etc.) y 16 de numero (`date`, `time_of_day`, `duration`, `count`, `money`, `percent`, `measure`, `score`, `clock`, `ordinal`, `id_pii`, etc.), mas `entity.numeral`.
- Deteccion de PII y redaccion: spans de `safety.pii.*` (nombre privado, telefono, email, direccion, tarjeta/cuenta, identificador gubernamental, fecha de nacimiento, handle de URL, contacto publico) y etiquetas por enunciado de `request` y `leak`.
- Profanidad y toxicidad: `safety.profanity.{mild,strong}` y seis etiquetas `safety.toxicity.*`, a nivel de span y de enunciado.
- Seguridad: seis etiquetas `safety.scam.*`, `safety.crisis.self_harm`, `safety.threat.escalation`, `safety.child.*` y `safety.solicitation.dating_romantic`.
- Actos de discurso: `discourse.act.*` (statement, question, command_request, etc.), `discourse.answer`, `discourse.backchannel` y `discourse.assistant.*`.
- Intenciones: 26 intenciones transversales (`request_information`, `schedule_arrange`, `complain_criticize`, etc.) y 60 intenciones de asistente (`alarm_set`, `weather_query`, etc.).
- Roles de hablante: 19 etiquetas `speaker.role.*`, incluidos agente y cliente de contact centre; requiere identificadores `spk` en las palabras.
- Eventos: `speaker.change`, `discourse.turn_yield`, `discourse.interruption`, 18 etiquetas `event.sports.*`, `event.legal.*` y `event.meeting.{decision,action_item}`.
- Estado de contenido: `content.mode`, `content.subject`, `content.game_state`, `content.legal_phase`, `content.meeting_phase`.
- Emocion (experimental): cinco etiquetas `affect.emotion.*` y tres `affect.arousal.*` a nivel de enunciado, con soporte bajo y predominio de "neutral".
- Streaming con revision de hipotesis interim y endpointing por enunciado.
- Acondicionamiento por dominio: `auto | talk | meeting | court | assistant | sports | news`.

## Casos de uso

- Redaccion de PII en tiempo real en contact centres: el modelo detecta spans de telefono, email, tarjeta, identificador gubernamental y direccion mientras el ASR emite palabras, y devuelve `redacted_text`, lo que permite enmascarar datos sensibles antes de que el transcript se persista o se envie a un LLM.
- Enrutamiento de intenciones en asistentes de voz: las 60 intenciones de asistente (`alarm_set`, `weather_query`, etc.) y las 26 transversales permiten clasificar el turno al vuelo y despachar al handler adecuado sin esperar al cierre del enunciado.
- Analitica de reuniones: las etiquetas `event.meeting.decision` y `event.meeting.action_item`, junto con `speaker.role.*` y `discourse.turn_yield`, permiten extraer decisiones y tareas asignadas de una transcripcion con identificadores de hablante.
- Moderacion de chat y podcasts: `safety.profanity.*`, `safety.toxicity.*`, `safety.threat.escalation` y `safety.crisis.self_harm` a nivel de enunciado sirven para disparar alertas o escalado humano en emisiones en directo.
- Deteccion de fraude telefonico: las seis etiquetas `safety.scam.*` y `safety.pii.request` permiten marcar llamadas en las que se solicita informacion sensible, un patron tipico de ingenieria social.
- Retransmision deportiva: las 18 etiquetas `event.sports.*` y `content.game_state` permiten anotar marcadores, eventos de juego y cambios de posesion sobre el flujo del comentarista.
- Documentacion legal y de juzgados: el dominio `court` con `event.legal.*`, `content.legal_phase` y `entity.mention.legal_ref` facilita la estructuraccion de vistas y transcripciones judiciales.
- Preprocesado para pipelines de LLM: al anotar entidades, numeros e intenciones antes de enviar el texto a un modelo generativo, se reduce el prompt a informacion estructurada y se evita enviar PII.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el checkpoint `AT10Mv2` (paso 88000) obtuvo el mejor resultado en todos los conjuntos gold de su ejecucion, sin cifras. Como dato de latencia, el autor reporta sobre una maquina compartida y un solo hilo de CPU: motor a ~16 ms por palabra (p50) y ~25 ms (p95); llamada completa `push_words()` con decodificacion de spans y read-outs a ~24 ms (p50) y ~45 ms (p95).

## Requisitos de hardware

- VRAM estimada: no aplica en la practica; con ~9,8 M de parametros el modelo ocupa decenas de MB en FP32 y funciona en CPU.
- GPU recomendadas: no disponibles ni necesarias; el autor indica que corre en CPU. Cualquier GPU consumer (RTX 3060 o superior) lo ejecutaria con holgura, pero no se publican cifras de throughput en GPU.
- Cabe en GPU consumer: si, en cualquier GPU con suficiente memoria para el runtime de PyTorch; el modelo en si es minimo.
- Opciones de despliegue: el repositorio incluye el paquete `arctag/` con `ArcTagger.from_pretrained()` y `requirements.txt`; se instala con `pip install huggingface_hub` y `huggingface-cli download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son runtimes de modelos generativos y no aplican a este token classifier).
- Latencia y throughput: ~16 ms/palabra p50 y ~25 ms p95 en el motor; ~24 ms p50 y ~45 ms p95 en la llamada completa, medido en un nucleo con un solo hilo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencias del mismo autor y ecosistema:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhissleAI/arc-tagger | Token classification en streaming (ASR/NER/PII/intent) | ~9,8 M | no disponible | other | Hugging Face |
| WhissleAI/arc-v1.1 | ASR (reconocimiento del habla) | no disponible | no disponible | no disponible | Hugging Face |
| WhissleAI/arc_transcriber | Transcriber en streaming con nombres, numeros, hablantes y tags | no disponible | no disponible | no disponible | GitHub |

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no hay capacidades multilingues declaradas.
- El dominio `auto` ejecuta el dominio "unknown", que el autor describe como mas debil; se recomienda fijar el dominio cuando se conozca.
- Las etiquetas de emocion son experimentales, con soporte bajo y salida predominantemente "neutral".
- El modelo es un etiquetador, no un generador: no produce texto libre ni razonamiento; su utilidad depende de la calidad del ASR de entrada.
- La licencia es "other": no se especifican en la informacion disponible los terminos para uso comercial, por lo que es necesario revisar el texto completo de la licencia antes de desplegarlo en produccion.
- No se publican datos de sesgos, tasas de alucinacion (aplica como falsos positivos de spans), ni evaluaciones de robustez fuera de los conjuntos gold del autor.
- El repositorio puede ser privado: la model card indica que hay que ejecutar `huggingface-cli login` antes de la descarga.
- Las latencias reportadas corresponden a una maquina compartida con un solo hilo; en produccion pueden variar.
- La fecha de creacion del repositorio (2026-11-07) y el escaso numero de descargas y likes (0 y 0) indican que el modelo es muy reciente y sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhissleAI/arc-tagger
- Repositorio del transcriber: https://github.com/WhissleAI/arc_transcriber
- Modelo ASR relacionado: https://huggingface.co/WhissleAI/arc-v1.1
