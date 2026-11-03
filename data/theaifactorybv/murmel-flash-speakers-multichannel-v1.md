# theaifactorybv/murmel-flash-speakers-multichannel-v1

## Resumen

Murmel Flash Speakers Multichannel v1 es un modelo de diarización y reconocimiento de hablantes en audio multicanal (estéreo), desarrollado por The AI Factory BV. Se distribuye a través de HuggingFace bajo el identificador `theaifactorybv/murmel-flash-speakers-multichannel-v1` y está etiquetado con el pipeline de detección de actividad de voz (VAD), aunque sus capacidades declaradas abarcan también la diarización y el reconocimiento de hablantes. El modelo está orientado a audio en neerlandés e inglés, y se apoya en una librería propia denominada `murmel-flash`, con pesos en formato PyTorch.

El modelo aborda el problema de identificar quién habla y cuándo en grabaciones con múltiples canales de audio, un escenario habitual en reuniones, centros de contacto, salas de entrevistas o sistemas de captura con micrófonos separados. Frente a aproximaciones monocanal, el enfoque multicanal permite explotar la separación espacial o de canal para mejorar la asignación de turnos de palabra y la identificación de interlocutores.

La información pública disponible es limitada: el repositorio ocupa 1,5 GB, el acceso está restringido (gated) y no se han publicado descargas ni valoraciones. No se detallan en la información proporcionada el número de parámetros, la longitud de contexto ni resultados de benchmarks, por lo que estos apartados se marcan como no disponibles. La licencia es de tipo `other`, identificada como `murmel-commercial`, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio basado en PyTorch, libreria `murmel-flash`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandes (nl), ingles (en) |
| Licencia | `murmel-commercial` (licencia `other`, acceso restringido) |
| Formato de pesos | PyTorch (repo de 1,5 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo en la informacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo de audio implementado en PyTorch, orientado a tareas de deteccion de actividad de voz, diarizacion y reconocimiento de hablantes, y disenado especificamente para entrada multicanal (estereo). La dependencia de la libreria `murmel-flash` sugiere un stack propietario de inferencia que no se detalla en la ficha de HuggingFace.

Tampoco se han publicado datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion o refinamiento, ni innovaciones tecnicas concretas (atencion, decodificacion, fusion de canales). Toda esta informacion debe considerarse no disponible a partir de las fuentes consultadas.

## Capacidades

- Deteccion de actividad de voz (VAD) sobre audio multicanal.
- Diarizacion de hablantes: segmentacion del audio por interlocutor.
- Reconocimiento de hablantes: identificacion de voces individuales.
- Procesamiento de audio estereo/multicanal, aprovechando la separacion entre canales.
- Soporte de dos idiomas: neerlandes e ingles.
- Integracion mediante la libreria `murmel-flash` y pesos en PyTorch.
- No se documenta soporte de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones con identificacion de participantes: el modelo permite segmentar quien habla en cada momento en grabaciones multicanal, facilitando actas con atribucion de intervenciones.
- Analisis de centros de contacto: en grabaciones estereo (agente y cliente en canales separados), el modelo puede separar y reconocer a cada interlocutor para metricas de calidad y cumplimiento.
- Investigacion cualitativa y entrevistas: diarizacion automatica de entrevistas grabadas con microfonos separados para agilizar la codificacion posterior.
- Sistemas de subtitulado en directo: la deteccion de actividad de voz y la diarizacion permiten etiquetar turnos de palabra en tiempo real en entornos con dos canales.
- Verificacion de identidad de locutor en flujos internos: el reconocimiento de hablantes puede apoyar la comprobacion de que una persona concreta interviene en una grabacion.
- Indexacion y busqueda de archivos de audio: la combinacion de VAD y diarizacion permite generar metadatos por hablante y por segmento para motores de busqueda internos.
- Cumplimiento y auditoria de grabaciones: la separacion por hablante facilita la revision de conversaciones reguladas en neerlandes o ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se indica el numero de parametros).
- GPU recomendadas: no disponible; al ser un modelo de audio en PyTorch, es probable que funcione en GPU consumer, pero no se confirma en las fuentes.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: la inferencia depende de la libreria `murmel-flash`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo.
- Licencia `murmel-commercial` (tipo `other`): es imprescindible revisar los terminos antes de cualquier uso comercial o redistribucion.
- Solo cubre neerlandes e ingles; no se garantiza un comportamiento adecuado en otros idiomas.
- No se publican datos de sesgos, tasas de alucinacion ni robustez ante ruido o solapamiento de habla.
- La dependencia de la libreria propietaria `murmel-flash` puede limitar la portabilidad y la integracion en stacks estandar.
- No hay informacion sobre latencia, throughput ni precision en produccion.
- El modelo esta disenado para audio multicanal; su rendimiento en audio monocanal no esta documentado.

## Enlaces

- HuggingFace: https://huggingface.co/theaifactorybv/murmel-flash-speakers-multichannel-v1
