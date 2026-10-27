# Verdugie/Fable-Therapy

## Resumen

Fable-Therapy es un ajuste fino conversacional de corte terapéutico construido sobre Qwen/Qwen3.5-9B, publicado por el desarrollador Verdugie en HuggingFace. El modelo tiene 8.953.803.264 parámetros (8,95 B) y se distribuye principalmente en formato GGUF para su uso local con llama.cpp y LM Studio. Su propósito declarado es sostener conversaciones largas sobre temas que la gente lleva realmente a terapia: relaciones, duelo, ansiedad, trauma, trabajo, familia, consumo de sustancias, infidelidad e identidad de género y sexualidad.

Según la model card, el ajuste se realizó sobre 4.537 conversaciones de consejería, generadas por Opus 4.8 siguiendo un estándar derivado por ingeniería inversa de un conjunto limitado de muestras de "Fable 5". El 3 % de las conversaciones se reservó para evaluación. El modelo declara dos mecanismos internos: una lectura clínica estructurada antes de cada respuesta y un "timeline ledger" que mantiene ordenados los hechos de la sesión a lo largo de conversaciones extensas.

Su relevancia práctica es doble. Por un lado, ocupa un nicho poco cubierto en el ecosistema abierto: asistentes conversacionales de apoyo emocional que se ejecutan en local, sin enviar datos a un servidor, lo que encaja con las etiquetas `local`, `offline`, `privacy` y `on-device` del repositorio. Por otro, la licencia Apache 2.0 y la ausencia de necesidad de system prompt simplifican su integración. Con 994 descargas y 11 likes en el momento de la consulta, se trata de un modelo de adopción todavía muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion proporcionada; ajuste fino del modelo base Qwen/Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | No disponible (el repositorio incluye la etiqueta `long-context`, sin cifra publicada) |
| Tipos de cuantizacion | GGUF; niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria declarada `gguf`); el recuento de parametros se reporta sobre safetensors |
| Tamano del repositorio | 46,9 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Descargas / likes | 994 / 11 |
| Fecha de creacion / actualizacion | 2026-06-21 / 2026-10-26 |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base Qwen/Qwen3.5-9B (tipo de atencion, uso de MoE, variantes de capa), por lo que la ficha no puede confirmar nada mas alla de que Fable-Therapy es un ajuste fino supervisado de ese checkpoint. Lo que si describe el autor es la capa de comportamiento anadida por el ajuste: antes de cada respuesta el modelo ejecuta una "lectura clinica estructurada", y mantiene un registro cronologico ("timeline ledger") que conserva los hechos de la conversacion en orden a lo largo de sesiones largas. El autor indica que no se requiere system prompt para activar este comportamiento.

El entrenamiento se apoya en 4.537 conversaciones de consejeria escritas por Opus 4.8, con un estandar de estilo y razonamiento derivado por ingenieria inversa a partir de un conjunto limitado de muestras de Fable 5. El 3 % de las conversaciones quedo reservado para evaluacion. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La model card tampoco documenta innovaciones de inferencia como decodificacion especulativa o atencion lineal; las etiquetas `reasoning` y `long-context` son declarativas y no vienen acompanadas de detalles tecnicos.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a acompanamiento emocional y consejeria.
- Razonamiento previo a la respuesta: el modelo declara una lectura clinica estructurada antes de cada turno, con trazas de razonamiento que el autor omite en los ejemplos publicados.
- Memoria de sesion ordenada mediante un "timeline ledger", pensado para no perder hechos ni cifras a lo largo de una conversacion larga.
- Manejo explicito de temas dificiles: ideacion suicida y autolesion, consumo de sustancias, infidelidad, sexualidad e identidad de genero.
- Estilo conversacional de confrontacion contenida: los ejemplos publicados muestran respuestas que evitan la reafirmacion automatica y nombran el conflicto subyacente.
- Funcionamiento sin system prompt: no requiere instrucciones de sistema para adoptar el rol terapeutico.
- Despliegue local y offline, con etiquetas para LM Studio, llama.cpp y uso en dispositivo.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades no documentadas: no hay informacion sobre tool calling, function calling, uso de agentes, capacidades multimodales (vision, audio) ni modo "thinking" conmutable. El soporte multilingue se limita al ingles segun el campo `language`.

## Casos de uso

- Prototipado de asistentes de apoyo emocional en local: el modelo puede mantener una conversacion multi-turno sobre duelo o ansiedad sin que los datos del usuario salgan del dispositivo, lo que resulta adecuado para entornos con requisitos de privacidad estrictos.
- Investigacion en dialogo terapeutico: util como linea base o sujeto de estudio en trabajos sobre empatia, reflejo y estructura de sesion, dado que el autor publica transcripciones completas y trazas de razonamiento omitidas de forma deliberada.
- Formacion y simulacion de entrevistas clinicas: estudiantes o profesionales en practica pueden ensayar aperturas de sesion, reformulaciones y manejo de temas sensibles con un interlocutor que no se limita a validar.
- Escritura de materiales de acompanamiento: generacion de guiones de sesion, ejemplos de reformulacion o contenido psicoeducativo, con revision profesional posterior obligatoria.
- Journaling guiado y reflexion asistida: un diario conversacional que devuelve al usuario sus propias contradicciones sin saltar a consejos practicos, aprovechando la ausencia de system prompt para reducir friccion de integracion.
- Evaluacion de riesgos de seguridad en IA: el modelo se entreno explicitamente con contenido de autolesion e ideacion suicida, lo que lo convierte en un banco de pruebas para medir como responde un LLM de 9 B ante ese tipo de entradas.
- Integracion en aplicaciones de bienestar corporativo o de acompanamiento universitario, siempre con derivacion a servicios profesionales y supervision clinica, aprovechando que Apache 2.0 permite uso comercial.
- Chats de investigacion cualitativa: analisis de patrones conversacionales en sesiones simuladas, con la ventaja de que las transcripciones son reproducibles y auditables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe una "bateria en vivo" de pruebas cualitativas con transcripciones citadas por turno (por ejemplo, T10/28 en el caso de panico, T5/27 en duelo y T15/28 en familia) y menciona un 3 % de conversaciones reservadas para evaluacion, pero no ofrece metricas numericas como MMLU, GSM8K, HumanEval ni evaluaciones clinicas estandarizadas. Tampoco se proporcionan comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 8,95 B de parametros (no son cifras publicadas por el autor): en FP16 en torno a 18 GB de pesos, con 20-24 GB recomendables contando cache KV; en Q8_0 alrededor de 9,5 GB; en Q5_K_M en torno a 6,3 GB; en Q4_K_M aproximadamente 5,4 GB.
- GPU de datacenter: A100 40/80 GB y H100 para FP16 sin restricciones de contexto; L40S o A10G si se opera en cuantizacion de 8 bits.
- GPU de consumo: RTX 4090 (24 GB) puede alojar FP16 con contexto moderado o Q8 con holgura; RTX 3090 (24 GB) en el mismo escenario; RTX 4060 Ti de 16 GB, RTX 4070 Ti Super y RTX 4080 son suficientes para Q4/Q5 con contexto amplio.
- Memoria unificada: equipos Apple Silicon con 16-24 GB pueden ejecutar las cuantizaciones Q4 y Q5 en llama.cpp; con 32 GB se puede subir a Q8.
- Despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF como opcion natural, dado el formato del repositorio. vLLM y TGI requeririan pesos en safetensors, cuya disponibilidad no se confirma en la informacion proporcionada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Fable-Therapy (9B) | 8,95 B | No disponible | Apache 2.0 | Ingles | Objeto de esta ficha; 4.537 conversaciones de entrenamiento; orientado a sesion larga con timeline ledger |
| Fable-Therapy-4B ("Lite") | No disponible en detalle (build de 4 B) | No disponible | Apache 2.0 (heredada del proyecto, segun el repositorio) | Ingles | Version reducida del mismo proyecto, pensada para equipos con menos VRAM |
| Qwen/Qwen3.5-9B | 9 B (modelo base) | No disponible | No disponible en la informacion proporcionada | No disponible | Modelo base generalista; Fable-Therapy es un ajuste fino sobre el, por lo que pierde capacidades generales a cambio de especializacion conversacional |

No se dispone en la informacion proporcionada de datos sobre otros modelos abiertos de consejeria o apoyo emocional que permitan una comparacion cuantitativa de rendimiento, contexto o calidad clinica.

## Limitaciones y advertencias

- No es un dispositivo medico ni sustituye a un profesional. No se ha publicado validacion clinica, ensayo controlado ni evaluacion por colegios profesionales; cualquier uso en salud mental exige supervision humana y protocolos de derivacion.
- Riesgo de dano en situaciones de crisis: el modelo se entreno con contenido de ideacion suicida y autolesion, pero no se documentan mecanismos de seguridad, deteccion de riesgo ni escalado a servicios de emergencia.
- Datos de entrenamiento sinteticos: las 4.537 conversaciones fueron generadas por Opus 4.8 siguiendo un estandar derivado de un conjunto limitado de muestras, no provienen de sesiones reales ni de terapeutas acreditados, lo que puede introducir sesgos de estilo y de contenido difíciles de auditar.
- Riesgo de alucinacion: el modelo puede inventar marcos terapeuticos, diagnosticos o referencias clinicas con aparente solidez. El "timeline ledger" declarado no garantiza consistencia factual fuera del texto de la conversacion.
- Sesgo de sycophancy inverso: el estilo documentado confronta y reformula; en usuarios vulnerables esto puede resultar invalidante si no hay supervision.
- Idioma: solo ingles. No hay evidencia de competencia en castellano ni en otras lenguas, pese a que el entrenamiento base pueda ser multilingue.
- Contexto: la etiqueta `long-context` no viene acompanada de una cifra, por lo que no se puede planificar una integracion con ventanas concretas sin probar empiricamente el limite.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime del cumplimiento del Reglamento europeo de IA (obligaciones de transparencia para sistemas de interaccion con personas) ni de la normativa de productos sanitarios si se presenta como herramienta terapeutica.
- Madurez: 994 descargas y 11 likes indican una adopcion minima y pocos reportes de campo; no hay historial publico de incidencias.
- Nomenclatura: el identificador de HuggingFace consultado es `Verdugie/Fable-Therapy`, mientras que la busqueda web apunta a `Verdugie/Fable-Therapy-9B`; conviene verificar a que repositorio corresponde cada artefacto antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Verdugie/Fable-Therapy
- Repositorio 9B referenciado en la busqueda: https://huggingface.co/Verdugie/Fable-Therapy-9B
- Repositorio 4B ("Lite"): https://huggingface.co/Verdugie/Fable-Therapy-4B
- Perfil y estadisticas del autor: https://modelpulse.ifsp.dev/author/Verdugie
- Ficha de terceros (Fable Therapy 9B): https://www.aicambodia.com/ai/hf-verdugie-fable-therapy-9b
- Ficha de terceros (Fable-Therapy-4B): https://essamamdani.com/ai-models/hf-verdugie-fable-therapy-4b
- Transcripciones citadas en la model card: `./transcripts/panic.pdf`, `./transcripts/grief.pdf`, `./transcripts/family.pdf` (rutas relativas al repositorio del modelo)
