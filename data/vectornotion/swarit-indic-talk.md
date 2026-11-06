# VectorNotion/swarit-indic-talk

## Resumen

Swarit Indic Talk es un modelo de voz a voz (speech-to-speech) desarrollado por VectorNotion y orientado a conversacion hablada en once lenguas indias y en ingles. Su propuesta es prescindir de la interfaz texto-como-paso-intermedio y ofrecer una interaccion directa: el modelo escucha audio de entrada, sigue el hilo de la conversacion y responde con audio sintetizado en el mismo idioma o en otro de los soportados. Cubre asames, bengali, gujarati, hindi, kannada, malayalam, marati, odia, punyabi, tamil, telugu e ingles.

El repositorio ocupa 14,3 GB y distribuye los pesos en formato safetensors bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones de atribucion mas alla de las notas de terceros incluidas en el propio repositorio. La model card esta enfocada a producto y a escenarios de uso (citas, atencion al cliente, comercio, educacion) mas que a detalles de investigacion, por lo que la informacion tecnica publicada es escasa.

La relevancia actual del modelo radica en la cobertura linguistica: la mayoria de sistemas de voz conversacional de codigo abierto estan centrados en ingles y en un puñado de lenguas europeas, mientras que este cubre comunidades del este, norte, oeste y sur de la India con un unico modelo y una unica licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero `swarit-indic-talk-v1.safetensors`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. La model card lo describe como un modelo de speech-to-speech y menciona que el paquete incluye "componentes" y "vectores de hablante" (speaker vectors), con avisos de licencia de terceros en `LICENSES/NOTICE.md`, lo que sugiere la integracion de modulos de sintesis de voz y posiblemente de representacion de locutor, pero no se detalla la topologia ni el pipeline concreto (por ejemplo, si emplea un codificador de audio, un modelo de lenguaje intermedio y un decodificador vocacional, o un esquema end-to-end).

Tampoco se especifican el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El tamaño del repositorio (14,3 GB) es el unico dato cuantitativo disponible sobre la magnitud del modelo, y resulta coherente con un sistema que incluye pesos de varios componentes en precision completa o media, pero no permite inferir el numero de parametros.

## Capacidades

- Conversacion de voz a voz: recibe audio hablado y genera respuesta hablada, sin requerir transcripcion manual ni salida en texto.
- Cobertura multilingue en 12 idiomas: asames, bengali, ingles, gujarati, hindi, kannada, malayalam, marati, odia, punyabi, tamil y telugu.
- Conversaciones multi-turno: la model card indica que el modelo "sigue el intercambio", lo que implica gestion de contexto conversacional a lo largo de varios turnos.
- Cambio de idioma dentro de una conversacion: se presenta como apto para "conversaciones multilingues", con el ingles incluido para quienes prefieren hablar en esa lengua.
- Escenarios de servicio al cliente y gestion de tramites: reserva de citas, consultas sobre pedidos, soporte de empresas y orientacion en solicitudes.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explicito, vision, audio de entrada mas alla del habla, ni modos de "thinking".

## Casos de uso

- Atencion al cliente por voz en lenguas indias: el modelo puede gestionar llamadas entrantes en hindi, tamil o bengali y responder hablando en la misma lengua, lo que reduce la dependencia de agentes humanos para consultas rutinarias en regiones donde el texto no es el canal natural.
- Reserva de citas en clinicas y centros de servicios: la model card incluye una demostracion especifica de conversacion de cita; el modelo escucha la peticion, mantiene el hilo y confirma los datos hablando, adecuado para entornos con usuarios de baja alfabetizacion digital.
- Consultas sobre pedidos en comercio electronico: integrado en un sistema de telefonia o en una aplicacion, permite al cliente preguntar por el estado de un pedido hablando en su idioma y recibir la respuesta en voz, sin formularios.
- Soporte en comercios y pequenos negocios: atencion telefonica automatizada para horarios, disponibilidad de productos o indicaciones, con cobertura en las lenguas del oeste y el sur de la India donde muchos comercios operan.
- Asistentes educativos por voz: practica de conversacion y respuesta a preguntas en aulas o entornos de aprendizaje remoto, aprovechando la cobertura de ocho sistemas de escritura distintos y la posibilidad de alternar con ingles.
- Orientacion en tramites administrativos: guiar al usuario paso a paso en una solicitud mediante dialogo hablado, escenario mencionado explicitamente en la model card como "encontrar el siguiente paso en una solicitud".
- Accesibilidad para personas con dificultades de lectura: al eliminar la interfaz de texto, el modelo sirve a usuarios que manejan mejor el habla que la escritura en su lengua materna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El unico dato es el tamaño del repositorio (14,3 GB), que no equivale directamente a la VRAM necesaria porque el modelo puede cargarse por componentes y porque no se especifica el esquema de cuantizacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Con 14,3 GB de pesos, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) podria alojar los pesos en precision de 16 bits si el conjunto completo cabe en ese presupuesto, pero no hay confirmacion del autor ni datos sobre los componentes adicionales en tiempo de ejecucion.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El unico artefacto publicado es el fichero safetensors, sin scripts de inferencia ni requisitos de dependencias descritos en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de arquitectura del modelo que permitan una comparacion cuantitativa fiable. A continuacion se recogen alternativas de la misma categoria (speech-to-speech multilingue de codigo abierto) con los datos publicos de cada una, senalando los campos no disponibles para Swarit Indic Talk.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Swarit Indic Talk | no disponible | no disponible | 12 (11 indias + ingles) | Apache-2.0 | safetensors |
| Moshi (Kyutai) | 7B | no disponible en esta ficha | principalmente ingles | CC-BY 4.0 | safetensors |
| Qwen2-Audio | 7B | no disponible en esta ficha | multilingue amplio | Apache-2.0 | safetensors |

La comparacion de rendimiento, latencia y calidad de sintesis no puede establecerse con la informacion disponible.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: no se publican arquitectura, numero de parametros, contexto, datos de entrenamiento ni proceso de ajuste, lo que dificulta evaluar el modelo antes de desplegarlo y limita la reproducibilidad.
- Sin benchmarks: no hay resultados de MMLU, ASR, WER, MOS ni metricas de calidad de sintesis, por lo que no es posible verificar la afirmacion de la model card de ser "el mejor modelo de voz a voz para lenguas indias".
- Riesgo de alucinacion: al ser un modelo conversacional generativo, puede producir respuestas incorrectas o inventar informacion en escenarios de atencion al cliente o tramites; requiere validacion contra fuentes de verdad en produccion.
- Sesgos no documentados: no se describe la composicion del corpus de entrenamiento ni la distribucion de hablantes, acentos y dialectos, por lo que el rendimiento puede variar entre variedades regionales de una misma lengua.
- Cobertura limitada a 12 idiomas: no incluye otras lenguas de la India ni lenguas europeas distintas del ingles, lo que restringe su uso fuera del mercado objetivo.
- Dependencia de componentes de terceros: la model card remite a `LICENSES/NOTICE.md` para avisos de componentes y vectores de hablante; es necesario revisar esas notas antes de un despliegue comercial aunque la licencia principal sea Apache-2.0.
- Sin garantias de produccion: no se documentan latencia, throughput, requisitos de hardware ni procesos de despliegue, por lo que la planificacion de infraestructura debe hacerse mediante pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectorNotion/swarit-indic-talk
- Sitio del proyecto: https://swarit.ai/
- Demo de conversacion de cita: https://swarit.ai/demos/recorded/appointment.mp4?v=a6c40630201f
- Pesos del modelo: https://huggingface.co/VectorNotion/swarit-indic-talk/blob/main/swarit-indic-talk-v1.safetensors
- Avisos de licencia de terceros: https://huggingface.co/VectorNotion/swarit-indic-talk/blob/main/LICENSES/NOTICE.md
